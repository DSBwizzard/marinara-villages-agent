import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AdmZip from "adm-zip";
import Fastify from "fastify";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/server/domain/rules/agenda-plan.js";
const receipt = JSON.parse(await readFile(".build-tmp/package-build.json", "utf8")),
  zip = new AdmZip(receipt.retainedArchivePath ?? receipt.archivePath ?? receipt.archive);
assert.deepEqual(
  zip
    .getEntries()
    .find((row) => row.entryName.endsWith("server.mjs"))!
    .getData(),
  await readFile("packages/villages/server.mjs"),
);
const { activate } = await import(pathToFileURL(resolve("packages/villages/server.mjs")).href);
const now = new Date().toISOString();
const world = coerceVillageState({
  seed: "founding-http",
  name: "Synthetic place",
  setting: "Shared converted rooms",
  storyPace: "off",
  wishSystemVersion: 3,
  setupAt: now,
  foundedAt: now,
  foundingPreparation: {
    status: "failed",
    completedIds: [],
    currentId: "",
    venueDetailsSeeded: true,
    error: "Explicit retry required",
  },
  villagers: ["a", "b"].map((id) => ({
    characterId: id,
    addedAt: now,
    cardSnapshot: {
      id,
      name: id,
      description: "Full authored identity",
      capturedAt: now,
      revision: 1,
      sourceStatus: "available",
    },
  })),
});
for (const resident of world.villagers) resident.agenda = unwrittenVillageAgenda([], resident.cardSnapshot.name);
const clone = <T>(x: T): T => structuredClone(x);
const records = new Map<string, any>([
  ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", revision: 1, data: world }],
]);
const documents = {
  getById: async (_p: string, id: string) => clone(records.get(id) ?? null),
  list: async (_p: string, kind: string) => [...records.values()].filter((row) => row.kind === kind).map(clone),
  create: async (input: any) => {
    const row = { ...clone(input), revision: 1 };
    assert(!records.has(row.id));
    records.set(row.id, row);
    return clone(row);
  },
  update: async (input: any) => {
    const prior = records.get(input.id);
    if (prior?.revision !== input.expectedRevision) return null;
    const row = { ...prior, ...clone(input), revision: prior.revision + 1 };
    records.set(row.id, row);
    return clone(row);
  },
  remove: async (_p: string, id: string) => records.delete(id),
};
let calls = 0,
  failWish = true;
const model = {
  connectionId: "synthetic",
  model: "synthetic",
  name: "Synthetic System",
  maxContext: 32000,
  maxOutputTokens: 4096,
  fitContext: (messages: any[], options: any) => ({ messages, ...options }),
  chatComplete: async (messages: any[], options: any) => {
    calls++;
    assert.equal(options.responseFormat?.type, "json_object");
    assert.equal(options.reasoningEffort, "none");
    const wish = messages[0].content.includes("{wish:null}"),
      id = JSON.parse(messages[1].content).identity.id;
    assert.equal(options.maxTokens, wish ? 1536 : 2048);
    return {
      finishReason: "stop",
      content: JSON.stringify(
        wish
          ? failWish && id === "a"
            ? {}
            : { wish: null }
          : {
              routine: "Ordinary varied days",
              palette: Array.from({ length: 6 }, (_, i) => ({
                activity: "Activity " + i,
                venue: 0,
                flexible: true,
                essential: false,
                duration: 60,
                parts: [0, 1, 2, 3],
              })),
              days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
              rhythm: [],
            },
      ),
    };
  },
};
const runtime = {
  persistence: { documents },
  resources: {
    listCharacters: async () => [],
    listPersonas: async () => [],
    listLorebooks: async () => [],
    listEligibleLorebookEntries: async () => [],
  },
  languageModels: { resolve: async () => model, resolveForRequest: async () => model },
  json: { parseJsonish: JSON.parse },
  logger: { info() {}, warn() {}, error() {}, debug() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => false,
  getAgentConfig: async () => ({ connectionId: "synthetic", settings: {} }),
};
const fetchBefore = globalThis.fetch;
globalThis.fetch = async () => new Response("[]", { headers: { "Content-Type": "application/json" } });
let app = Fastify(),
  stop: (() => Promise<void>) | undefined;
async function start() {
  stop = await activate({
    api: {
      runtime,
      registerSceneOrigin: () => () => {},
      registerPrivilegedRoutes: async (routes: any, options: any) => {
        await app.register(async (instance) => {
          await routes(
            Object.fromEntries(
              ["get", "post", "put", "patch", "delete", "addContentTypeParser"].map((method) => [
                method,
                (instance as any)[method].bind(instance),
              ]),
            ),
          );
        }, options);
        return () => app.close();
      },
    },
  });
}
async function settled() {
  for (let i = 0; i < 200; i++) {
    await new Promise((resolve) => setTimeout(resolve, 5));
    if (records.get("villages-village").data.foundingPreparation.status !== "pending") return;
  }
  throw Error("Synthetic founding did not settle");
}
try {
  await start();
  const read = await app.inject({ method: "GET", url: "/api/villages/setup/preparation" });
  assert.equal(read.statusCode, 200, read.body);
  assert.equal(calls, 0);
  const batch = { actionId: "batch-http" };
  let response = await app.inject({ method: "POST", url: "/api/villages/setup/preparation/retry", payload: batch });
  assert.equal(response.statusCode, 200, response.body);
  await settled();
  assert.equal(calls, 4);
  let marker = records.get("villages-village").data.foundingPreparation;
  assert.equal(marker.status, "failed");
  assert.equal(marker.tasks.a.routine.status, "completed");
  assert.equal(marker.tasks.b.wish.status, "completed");
  const before = calls;
  await stop!();
  app = Fastify();
  await start();
  await app.inject({ method: "GET", url: "/api/villages/setup/preparation" });
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(calls, before, "startup and reads make no replacement request");
  const publicResponse = await app.inject({ method: "GET", url: "/api/villages/setup/preparation" });
  assert(
    !/foundingContext|savedProposal|needComparison/.test(publicResponse.body),
    "private frozen inputs stay private",
  );
  marker = records.get("villages-village").data.foundingPreparation;
  const target = {
    characterId: "a",
    task: "wish",
    expectedAttempt: marker.tasks.a.wish.attempt,
    actionId: "wish-http",
  };
  response = await app.inject({
    method: "POST",
    url: "/api/villages/setup/preparation/retry",
    payload: { ...target, expectedAttempt: 99 },
  });
  assert.equal(response.statusCode, 409, response.body);
  assert.equal(calls, before);
  failWish = false;
  response = await app.inject({ method: "POST", url: "/api/villages/setup/preparation/retry", payload: target });
  assert.equal(response.statusCode, 200, response.body);
  await settled();
  assert.equal(calls, before + 1);
  assert.equal(records.get("villages-village").data.foundingPreparation.status, "ready");
  await app.inject({ method: "POST", url: "/api/villages/setup/preparation/retry", payload: target });
  assert.equal(calls, before + 1, "duplicate retry is free");
  console.log(
    "Packaged HTTP founding jobs: independent results, restart, target fences, quiet Wish, readiness and private inputs passed.",
  );
} finally {
  await stop?.();
  globalThis.fetch = fetchBefore;
}
