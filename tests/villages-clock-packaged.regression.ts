import { runCase } from "../scripts/test-cases.mjs";
import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import Fastify from "fastify";
import AdmZip from "adm-zip";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
// Test cases: village-clock-recovery
// Actual builder output and HTTP routes; synthetic persistence and zero provider calls.
await runCase("village-clock-recovery", async () => {
  const receipt = JSON.parse(await readFile(".build-tmp/package-build.json", "utf8"));
  const archive = receipt.retainedArchivePath ?? receipt.archivePath ?? receipt.archive;
  const zip = new AdmZip(archive);
  const server = zip.getEntries().find((entry) => entry.entryName.endsWith("server.mjs"));
  assert.ok(server);
  assert.deepEqual(server.getData(), await readFile("packages/villages/server.mjs"));
  const { activate } = await import(pathToFileURL(resolve("packages/villages/server.mjs")).href);
  const originalNow = Date.now;
  let wall = Date.parse("2026-10-15T02:30:00Z"),
    paid = 0;
  Date.now = () => wall;
  const records = new Map();
  const seed = defaultVillageState();
  Object.assign(seed, {
    seed: "clock-packaged",
    setupAt: new Date(wall).toISOString(),
    foundedAt: new Date(wall).toISOString(),
    timeZone: "America/Los_Angeles",
    storyPace: "off",
    visitMemoryBackfilled: true,
  });
  seed.clock = {
    revision: 2,
    trustedAt: new Date(wall).toISOString(),
    replayUntilDate: "",
    recovery: {
      frozenAt: new Date(wall).toISOString(),
      expectedAt: new Date(wall).toISOString(),
      observedAt: new Date(wall + 3 * 3600000).toISOString(),
      differenceMs: 3 * 3600000,
    },
  };
  seed.projects = [
    {
      id: "timer",
      title: "Building",
      venueId: "",
      participantIds: [],
      status: "building",
      kind: "new-venue",
      updatedAt: new Date(wall).toISOString(),
      lifecycle: {
        version: 2,
        phase: "construction",
        workOrder: {
          startsAt: new Date(wall).toISOString(),
          completesAt: new Date(wall + 7200000).toISOString(),
          pausedAt: "",
          remainingMs: 7200000,
        },
        completedAt: "",
      },
    },
  ];
  records.set("villages-village", {
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    data: seed,
    revision: 1,
  });
  const clone = (value) => (value === undefined ? null : structuredClone(value));
  const documents = {
    async getById(_pkg, id) {
      return clone(records.get(id));
    },
    async list(_pkg, kind) {
      return [...records.values()].filter((row) => !kind || row.kind === kind).map(clone);
    },
    async create(input) {
      if (records.has(input.id)) throw Error("duplicate");
      const row = { ...clone(input), revision: 1 };
      records.set(input.id, row);
      return clone(row);
    },
    async update(input) {
      const row = records.get(input.id);
      if (!row || row.revision !== input.expectedRevision) return null;
      const next = { ...row, ...clone(input), revision: row.revision + 1 };
      records.set(input.id, next);
      return clone(next);
    },
    async remove(_pkg, id, revision) {
      const row = records.get(id);
      if (!row || row.revision !== revision) return false;
      records.delete(id);
      return true;
    },
  };
  const logger = { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} };
  const runtime = {
    persistence: { documents },
    resources: {
      async listCharacters() {
        return [];
      },
      async listLorebooks() {
        return [];
      },
      async listEligibleLorebookEntries() {
        return [];
      },
    },
    languageModels: {
      async resolve() {
        paid++;
        throw Error("No providers permitted");
      },
      async resolveForRequest() {
        paid++;
        throw Error("No providers permitted");
      },
    },
    logger,
    isDebugAgentsEnabled: () => false,
    async getAgentConfig() {
      return { settings: {} };
    },
  };
  const app = Fastify();
  let stop;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (/generate|completion/i.test(url)) {
      paid++;
      throw Error("No providers permitted");
    }
    return new Response(JSON.stringify(url.includes("settings") ? { value: "{}" } : []), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  try {
    stop = await activate({
      api: {
        runtime,
        registerSceneOrigin: () => () => {},
        registerPrivilegedRoutes: async (routes, options) => {
          await app.register(routes, options);
          return async () => {};
        },
      },
    });
    const call = async (path, method = "GET", payload) =>
      app.inject({ method, url: "/api/villages" + path, ...(payload ? { payload } : {}) });
    let response = await call("/");
    assert.equal(response.statusCode, 200, response.body);
    let snapshot = response.json();
    assert.equal(snapshot.clock.timeZone, "America/Los_Angeles");
    assert.equal(snapshot.village.localTime, "19:30");
    assert.ok(snapshot.projects[0]?.lifecycle?.workOrder, "packaged codec preserves timer fixture");
    assert.equal(snapshot.clock.paused, false, "old saved pause clears at activation");
    assert.equal(records.get("villages-village").data.clock.recovery, null);
    const deadline = snapshot.projects[0].lifecycle.workOrder.completesAt;
    wall += 3 * 86400000; // Simulated suspended VM: elapsed timer barely advances.
    response = await call("/");
    assert.equal(response.statusCode, 200, response.body);
    snapshot = response.json();
    assert.equal(snapshot.clock.paused, false);
    assert.equal(snapshot.village.instant, new Date(wall).toISOString());
    assert.equal(Date.parse(deadline) < wall, true, "ordinary absence counts toward unfinished work");
    assert.equal(snapshot.projects[0].lifecycle.workOrder.completesAt, deadline);
    response = await call("/noticeboard", "POST", { notice: "Still playable after sleep" });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(records.get("villages-village").data.noticeboard.length, 1);
    response = await call("/clock/recover", "POST", { revision: 0, choice: "accept" });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().clock.paused, false, "older open clients can recover idempotently");
    wall -= 86400000;
    response = await call("/");
    assert.equal(response.statusCode, 200, response.body);
    snapshot = response.json();
    assert.equal(snapshot.clock.paused, false);
    assert.ok(records.get("villages-village").data.clock.replayUntilDate);
    wall += 3650 * 86400000;
    await stop();
    stop = undefined;
    await app.close();
    const restartApp = Fastify();
    stop = await activate({
      api: {
        runtime,
        registerSceneOrigin: () => () => {},
        registerPrivilegedRoutes: async (routes, options) => {
          await restartApp.register(routes, options);
          return async () => {};
        },
      },
    });
    response = await restartApp.inject({ method: "GET", url: "/api/villages/" });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().clock.paused, false);
    assert.equal(response.json().village.instant, new Date(wall).toISOString());
    await stop();
    stop = undefined;
    await restartApp.close();
    assert.equal(paid, 0);
    await writeFile(
      ".build-tmp/clock-packaged-acceptance.json",
      JSON.stringify(
        {
          passed: true,
          sourceRevision: receipt.sourceRevision,
          archiveHash: receipt.sha256,
          scope:
            "Archive-identical server activation and real HTTP routes with synthetic storage; zero provider calls; controlled Date.now inside this test process only",
          cases: [
            "Pacific projection",
            "legacy pause clears automatically",
            "suspended VM resumes without blocking",
            "gameplay writes remain available",
            "absolute deadlines unchanged",
            "backward dates do not refill opportunities",
            "decade of downtime resumes normally",
          ],
          paidRequests: paid,
        },
        null,
        2,
      ),
    );
    console.log("Archive-identical clock HTTP acceptance passed with zero provider calls.");
  } finally {
    if (stop) await stop();
    await app.close().catch(() => {});
    Date.now = originalNow;
    globalThis.fetch = originalFetch;
  }
});
