import assert from "node:assert/strict";
import {
  startVillagesApplication,
  type ApplicationServices,
  type ActivationContext,
} from "../packages/villages/src/server/entry/application.js";

// Mocked assembly ports; real job/request fences are exercised by their own suites.
async function exercise(failure = "") {
  const events: string[] = [];
  const start = (name: string) => {
    events.push("start:" + name);
    if (failure === name) throw new Error("fixture:" + name);
    return () => {
      events.push("stop:" + name);
    };
  };
  const services: ApplicationServices = {
    configureRuntime: () => start("runtime"),
    startTownMapGeneration: () => start("map"),
    configureDecisions: () => start("decisions"),
    stopInterpretationComparisons: () => {
      events.push("stop:comparisons");
    },
    async readRuntimeDebug() {
      events.push("read:debug");
      if (failure === "debug") throw new Error("fixture:debug");
    },
    warnRuntimeDebug() {
      events.push("warn:debug");
    },
    async recoverVenueSceneWork() {
      events.push("recover:scenes");
      if (failure === "recover") throw new Error("fixture:recover");
    },
    stopVenueCoordinator: () => {
      events.push("stop:coordinator");
    },
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
  if (failure && failure !== "debug") {
    await assert.rejects(startVillagesApplication(context, services), /fixture:/);
    const expectedStops =
      failure === "recover"
        ? ["comparisons", "decisions", "map", "runtime"]
        : failure === "routes"
          ? ["coordinator", "comparisons", "decisions", "map", "runtime"]
          : [
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
    assert.deepEqual(
      events.filter((event) => event.startsWith("stop:")),
      expectedStops.map((name) => "stop:" + name),
    );
    if (["recover", "routes"].includes(failure)) assert.equal(events.includes("start:background"), false);
  } else {
    const application = await startVillagesApplication(context, services);
    assert.deepEqual(
      events.filter((event) => event.startsWith("start:")),
      ["runtime", "map", "decisions", "routes", "background", "refresh", "progress", "private"].map(
        (name) => "start:" + name,
      ),
    );
    await application.selfCheck();
    assert.equal(events.at(-1), "read:world");
    await application.stop();
    assert.deepEqual(
      events.filter((event) => event.startsWith("stop:")),
      [
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
      ].map((name) => "stop:" + name),
    );
    assert.equal(events.includes("warn:debug"), failure === "debug");
  }
}
async function main() {
  for (const failure of ["", "debug", "recover", "routes", "private"]) await exercise(failure);
  console.log(
    "Villages application regression: startup order, failed activation unwind, read-only self-check and shutdown ownership passed (mocked assembly).",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
