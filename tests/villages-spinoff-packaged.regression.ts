import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import AdmZip from "adm-zip";
import Fastify from "fastify";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import type { SceneOriginProvider } from "../sources/package-shared.js";

// Archive-identical production server + actual HTTP routes. Synthetic host/models, zero external providers.
const receipt = JSON.parse(await readFile(".build-tmp/package-build.json", "utf8"));
const zip = new AdmZip(receipt.retainedArchivePath ?? receipt.archivePath ?? receipt.archive);
const payload = zip.getEntries().find((entry) => entry.entryName.endsWith("server.mjs"));
assert.deepEqual(payload!.getData(), await readFile("packages/villages/server.mjs"));
const { activate } = await import(pathToFileURL(resolve("packages/villages/server.mjs")).href);
const at = new Date().toISOString();
const village = defaultVillageState();
Object.assign(village, {
  seed: "packaged-spinoff",
  foundedAt: at,
  setupAt: at,
  backgroundPace: "off",
  visitMemoryBackfilled: true,
  timeZone: "America/Los_Angeles",
  playerPersonaId: "persona",
  playerPersonaName: "Player",
  playerPersonaIdentity: "A village visitor",
});
village.villagers = [
  {
    characterId: "buster",
    cardSnapshot: {
      id: "buster",
      name: "Buster",
      description: "The village grocer",
      sourceStatus: "available",
      capturedAt: at,
      revision: 1,
      tags: [],
    },
    addedAt: at,
    ingestSchedule: false,
  },
] as unknown as typeof village.villagers;
const scene = coerceSession({
  id: "source",
  placeId: "market",
  placeName: "Market",
  zoneId: "common",
  villageSeed: village.seed,
  processingVersion: 1,
  status: "active",
  startedAt: at,
  lastActivityAt: at,
  sceneRevision: 3,
  activeIds: ["buster"],
  participants: [{ characterId: "buster", name: "Buster", doing: "Shopping" }],
  sceneAttendance: {
    capturedAt: at,
    occupants: [{ characterId: "buster", name: "Buster", doing: "Shopping", availability: "online", zoneId: "common" }],
  },
  lines: [],
  submissions: [],
});
const records = new Map<string, { id: string; packageId: string; kind: string; revision: number; data: unknown }>([
  ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", revision: 1, data: village }],
  [
    "villages-active-venue",
    {
      id: "villages-active-venue",
      packageId: "villages",
      kind: "venue-active",
      revision: 1,
      data: { sessionId: "source", placeId: "market" },
    },
  ],
  [
    "villages-venue-visit-source",
    { id: "villages-venue-visit-source", packageId: "villages", kind: "venue-visit", revision: 1, data: scene },
  ],
]);
const clone = <T>(value: T): T => structuredClone(value);
const documents = {
  getById: async (_package: string, id: string) => clone(records.get(id) ?? null),
  list: async (_package: string, kind: string) => [...records.values()].filter((row) => row.kind === kind).map(clone),
  create: async (input: { id: string; packageId: string; kind: string; data: unknown }) => {
    if (records.has(input.id)) throw Error("duplicate");
    const record = { ...clone(input), revision: 1 };
    records.set(input.id, record);
    return clone(record);
  },
  update: async (input: { id: string; data: unknown; expectedRevision: number }) => {
    const row = records.get(input.id);
    if (row?.revision !== input.expectedRevision) return null;
    const record = { ...row, data: clone(input.data), revision: row.revision + 1 };
    records.set(input.id, record);
    return clone(record);
  },
  remove: async (_package: string, id: string, revision: number) =>
    records.get(id)?.revision === revision && records.delete(id),
};
let provider: SceneOriginProvider | undefined;
let modelCalls = 0;
const model = {
  connectionId: "synthetic",
  model: "fixture",
  name: "Synthetic",
  maxContext: 32000,
  maxOutputTokens: 4000,
  fitContext: (messages: unknown[]) => ({ messages, trimmed: false }),
  chatComplete: async () => {
    modelCalls++;
    return {
      content: JSON.stringify({
        eligibility: "compatible",
        explanation: "The whole outing fits the encounter.",
        evidenceIds: [],
        memories: [
          { text: "You and Buster enjoyed choosing apples at the market.", evidenceIds: ["player", "resident"] },
        ],
      }),
      finishReason: "stop",
      usage: { inputTokens: 10, outputTokens: 10 },
    };
  },
};
const runtime = {
  persistence: {
    documents,
    getChat: async () => ({
      id: "engine",
      personaId: "persona",
      characterIds: ["buster"],
      metadata: { sceneStatus: "active" },
    }),
    listMessages: async () => [
      { id: "player", role: "user", characterId: null, content: "Let us choose apples together.", extra: "{}" },
      {
        id: "resident",
        role: "assistant",
        characterId: "buster",
        content: "I enjoyed this outing with you.",
        extra: "{}",
      },
    ],
  },
  resources: {
    listCharacters: async () => [
      {
        id: "buster",
        revision: 1,
        comment: "",
        data: { id: "buster", name: "Buster", description: "The village grocer" },
      },
    ],
    listPersonas: async () => [{ id: "persona", data: { name: "Player", description: "A visitor" } }],
    listLorebooks: async () => [],
    listEligibleLorebookEntries: async () => [],
  },
  languageModels: { resolve: async () => model, resolveForRequest: async () => model },
  json: { parseJsonish: JSON.parse },
  logger: { info() {}, warn() {}, error() {}, debug() {}, debugOverride() {} },
  isDebugAgentsEnabled: () => false,
  getAgentConfig: async () => ({ settings: {} }),
};
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => new Response("[]", { status: 200, headers: { "Content-Type": "application/json" } });
const app = Fastify();
let stop: (() => Promise<void>) | undefined;
try {
  stop = await activate({
    api: {
      runtime,
      registerSceneOrigin: (next: SceneOriginProvider) => {
        provider = next;
        return () => {
          provider = undefined;
        };
      },
      registerPrivilegedRoutes: async (routes: (collector: unknown) => Promise<void>, options: { prefix: string }) => {
        // Engine exposes a restricted route collector, not Fastify's addHook API.
        await app.register(async (instance) => {
          const collector = Object.fromEntries(
            ["get", "post", "put", "patch", "delete", "addContentTypeParser"].map((method) => [
              method,
              instance[method].bind(instance),
            ]),
          );
          await routes(collector);
        }, options);
        return () => app.close();
      },
    },
  });
  assert.ok(provider, "the built package registers its Engine scene-origin provider");
  const post = async (path: string, body: unknown) => {
    const response = await app.inject({ method: "POST", url: "/api/villages" + path, payload: body });
    assert.equal(
      response.statusCode,
      200,
      response.body +
        JSON.stringify({
          residents: (records.get("villages-village")!.data as typeof village).villagers.map(
            (person) => person.characterId,
          ),
          active: (records.get("villages-venue-visit-source")!.data as typeof scene).activeIds,
        }),
    );
    return response.json();
  };
  const started = await post("/spinoffs/begin", {
    sessionId: "source",
    residentId: "buster",
    revision: 3,
    requestId: randomUUID(),
  });
  const readScene = async () => {
    const response = await app.inject({ method: "GET", url: "/api/villages/rooms/active" });
    assert.equal(response.statusCode, 200, response.body);
    return response.json().session;
  };
  const pendingScene = await readScene();
  assert.equal(pendingScene.spinoffPending, true, "the built Scene API supplies the recovery flag");
  assert.equal(pendingScene.spinoff, undefined, "the flag exposes no private spinoff context");
  assert.equal(modelCalls, 0, "reading an existing handoff makes no provider calls");
  const context = await provider.getContext("source");
  assert.deepEqual(context!.characterIds, ["buster"]);
  assert.equal(context!.connectionId, "synthetic");
  assert.equal(
    await provider.claim!("source", {
      sceneChatId: "engine",
      characterIds: ["buster"],
      data: { spinoffId: started.spinoff.id },
    }),
    true,
  );
  const blocked = await app.inject({
    method: "POST",
    url: "/api/villages/rooms/activity",
    payload: { sessionId: "source" },
  });
  assert.equal(blocked.statusCode, 409);
  assert.match(blocked.json().error, /browse Villages/);
  const forced = await app.inject({
    method: "POST",
    url: "/api/villages/reconcile",
    payload: { forceStory: true, actionId: "forced", expectedAttempt: 0 },
  });
  assert.equal(forced.statusCode, 409, "read-only browsing blocks the retired force action");
  const presence = await app.inject({
    method: "POST",
    url: "/api/villages/background/presence",
    payload: { sessionId: "fixture", visible: false },
  });
  assert.equal(presence.statusCode, 200, "a pending spinoff does not prevent visibility-lease revocation");
  await provider.release!("source", {
    kind: "concluded",
    sceneChatId: "engine",
    summary: "A market outing",
    description: null,
    scenario: null,
    rating: "sfw",
    characterIds: ["buster"],
    data: null,
  });
  assert.equal(modelCalls, 0);
  const prepared = await post("/spinoffs/prepare", { sessionId: "source" });
  assert.equal(modelCalls, 1);
  assert.equal(prepared.spinoff.memories.length, 1);
  await post("/spinoffs/resolve", { sessionId: "source", acceptedIds: [prepared.spinoff.memories[0].id] });
  assert.equal((await readScene()).spinoffPending, false, "the built Scene API stops recovery after resolution");
  const saved = records.get("villages-village")!.data as typeof village;
  assert.equal(saved.chronicle.filter((row) => row.id === prepared.spinoff.memories[0].id).length, 1);
  console.log(
    "Archive-identical packaged HTTP spinoff: registration, resolved connection, ownership, conclusion callback, explicit synthetic interpretation and reviewed memory import passed.",
  );
} finally {
  await stop?.();
  await app.close();
  globalThis.fetch = originalFetch;
}
