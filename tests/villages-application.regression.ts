import assert from "node:assert/strict";
import {
  startVillagesApplication,
  type ApplicationServices,
  type ActivationContext,
} from "../packages/villages/src/server/entry/application.js";

// Actual application assembly through mocked ports: no Engine, model requests or user saves.
const shutdownOrder = [
  "private",
  "progress",
  "refresh",
  "background",
  "routes",
  "coordinator",
  "comparisons",
  "decisions",
  "map",
  "runtime",
];
function fixture(failure = "", cleanupFailures: string[] = []) {
  const events: string[] = [];
  const admissionError = new Error("fixture admission: " + failure);
  const cleanupErrors = new Map(cleanupFailures.map((name) => [name, new Error("fixture cleanup: " + name)]));
  let duringCleanup: ((name: string) => void | Promise<void>) | undefined;
  const cleanup = (name: string) => () => {
    events.push("stop:" + name);
    const pending = duringCleanup?.(name);
    if (cleanupErrors.has(name)) throw cleanupErrors.get(name);
    return pending;
  };
  const start = (name: string) => {
    events.push("start:" + name);
    if (failure === name) throw admissionError;
    return cleanup(name);
  };
  const services: ApplicationServices = {
    configureRuntime: () => start("runtime"),
    startTownMapGeneration: () => start("map"),
    configureDecisions: () => start("decisions"),
    stopInterpretationComparisons: cleanup("comparisons"),
    async readRuntimeDebug() {
      events.push("read:debug");
      if (failure === "debug") throw admissionError;
    },
    warnRuntimeDebug() {
      events.push("warn:debug");
    },
    async recoverVenueSceneWork() {
      events.push("recover:scenes");
      if (failure === "recover") throw admissionError;
    },
    stopVenueCoordinator: cleanup("coordinator"),
    async routes() {},
    startBackgroundWork: () => start("background"),
    startRefreshScheduler: () => start("refresh"),
    startProgressRecovery: () => start("progress"),
    async startPrivateSpacePreparation() {
      return start("private");
    },
    async readVillageState() {
      events.push("read:world");
    },
  };
  const context: ActivationContext = {
    api: {
      runtime: {} as ActivationContext["api"]["runtime"],
      async registerPrivilegedRoutes(routes, options) {
        assert.equal(routes, services.routes);
        assert.equal(options.prefix, "/api/villages");
        return start("routes");
      },
    },
  };
  return {
    events,
    admissionError,
    cleanupErrors,
    context,
    services,
    stops: () => events.filter((event) => event.startsWith("stop:")).map((event) => event.slice(5)),
    setDuringCleanup(callback: typeof duringCleanup) {
      duringCleanup = callback;
    },
  };
}
async function main() {
  const failedAdmissions: Record<string, string[]> = {
    runtime: [],
    map: ["runtime"],
    decisions: ["map", "runtime"],
    recover: ["coordinator", "comparisons", "decisions", "map", "runtime"],
    routes: ["coordinator", "comparisons", "decisions", "map", "runtime"],
    background: ["routes", "coordinator", "comparisons", "decisions", "map", "runtime"],
    refresh: ["background", "routes", "coordinator", "comparisons", "decisions", "map", "runtime"],
    progress: ["refresh", "background", "routes", "coordinator", "comparisons", "decisions", "map", "runtime"],
    private: shutdownOrder.slice(1),
  };
  for (const [failure, expected] of Object.entries(failedAdmissions)) {
    const f = fixture(failure);
    await assert.rejects(startVillagesApplication(f.context, f.services), (error) => error === f.admissionError);
    assert.deepEqual(f.stops(), expected, failure);
  }
  for (const failure of ["", "debug"]) {
    const f = fixture(failure),
      app = await startVillagesApplication(f.context, f.services);
    assert.deepEqual(
      f.events.filter((event) => event.startsWith("start:")),
      ["runtime", "map", "decisions", "routes", "background", "refresh", "progress", "private"].map(
        (name) => "start:" + name,
      ),
    );
    await app.selfCheck();
    assert.equal(f.events.at(-1), "read:world");
    const stopped = app.stop();
    assert.equal(app.stop(), stopped, "concurrent stops share one Promise");
    f.setDuringCleanup((name) => {
      if (name === "private") assert.equal(app.stop(), stopped, "synchronous reentrant stop shares its owner");
    });
    await stopped;
    assert.equal(app.stop(), stopped, "completed stop is not run again");
    await app.stop();
    assert.deepEqual(f.stops(), shutdownOrder);
    assert.equal(f.events.includes("warn:debug"), failure === "debug");
  }
  const paused = fixture(),
    pausedApp = await startVillagesApplication(paused.context, paused.services);
  let release!: () => void;
  const wait = new Promise<void>((resolve) => {
    release = resolve;
  });
  paused.setDuringCleanup((name) => (name === "private" ? wait : undefined));
  const stopping = pausedApp.stop();
  await Promise.resolve();
  assert.deepEqual(paused.stops(), ["private"], "later cleanup waits for the current disposer");
  assert.equal(pausedApp.stop(), stopping);
  release();
  await stopping;
  assert.deepEqual(paused.stops(), shutdownOrder);

  const broken = fixture("", ["private", "refresh", "runtime"]),
    brokenApp = await startVillagesApplication(broken.context, broken.services);
  const failedStop = brokenApp.stop();
  let stopError: AggregateError | undefined;
  await assert.rejects(failedStop, (error) => {
    assert.ok(error instanceof AggregateError);
    stopError = error;
    assert.deepEqual(
      error.errors,
      ["private", "refresh", "runtime"].map((name) => broken.cleanupErrors.get(name)),
    );
    return true;
  });
  assert.deepEqual(broken.stops(), shutdownOrder, "all disposers are attempted despite failures");
  assert.equal(brokenApp.stop(), failedStop);
  await assert.rejects(brokenApp.stop(), (error) => error === stopError);
  assert.deepEqual(broken.stops(), shutdownOrder, "failed disposers are never silently retried");

  const doubleFailure = fixture("private", ["refresh", "map"]);
  await assert.rejects(startVillagesApplication(doubleFailure.context, doubleFailure.services), (error) => {
    assert.ok(error instanceof AggregateError);
    assert.equal(error.cause, doubleFailure.admissionError);
    assert.deepEqual(error.errors, [
      doubleFailure.admissionError,
      doubleFailure.cleanupErrors.get("refresh"),
      doubleFailure.cleanupErrors.get("map"),
    ]);
    return true;
  });
  assert.deepEqual(doubleFailure.stops(), shutdownOrder.slice(1));
  console.log(
    "Application lifecycle passed: all admission failures, original/aggregate errors, ordered cleanup, repeated/concurrent/reentrant stop, and self-check (mocked service ports).",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
