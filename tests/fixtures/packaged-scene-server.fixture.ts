import assert from "node:assert/strict";
import Fastify from "fastify";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { defaultVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVenueSpace } from "../../packages/villages/src/server/domain/rules/venue-model.js";
import { captureSceneLayout } from "../../packages/villages/src/server/domain/rules/scene-layout.js";
import { seedVillageFixtureDocuments, fixtureSceneState } from "../helpers/village-storage.fixture.js";

export async function packagedSceneServer() {
  const now = new Date().toISOString();
  const world = defaultVillageState();
  Object.assign(world, {
    seed: "packaged-browser",
    setupAt: now,
    foundedAt: now,
    timeZone: "UTC",
    backgroundPace: "off",
    playerPersonaId: "persona",
    playerPersonaName: "Player",
  });
  world.villagers = [
    {
      characterId: "mara",
      addedAt: now,
      ingestSchedule: false,
      cardSnapshot: {
        id: "mara",
        name: "Mara",
        description: "A friendly resident.",
        sourceStatus: "available",
        capturedAt: now,
        revision: 1,
        tags: [],
      },
    },
  ] as typeof world.villagers;
  world.venues = [
    {
      id: "mill",
      name: "The Mill",
      classes: ["other"],
      layoutVersion: 1,
      zones: [
        {
          ...defaultVenueSpace("other"),
          id: "exterior",
          name: "Exterior",
          venueClass: "other",
          kind: "exterior",
          connectedTo: ["common"],
          seen: true,
        },
        {
          ...defaultVenueSpace("other"),
          id: "common",
          name: "Common",
          venueClass: "other",
          kind: "public",
          connectedTo: ["exterior"],
          seen: true,
        },
      ],
    },
  ] as typeof world.venues;
  const scene = coerceSession({
    version: 3,
    id: "browser",
    placeId: "mill",
    placeName: "The Mill",
    area: "public",
    zoneId: "common",
    villageSeed: world.seed,
    processingVersion: 1,
    semanticVersion: 2,
    status: "active",
    startedAt: now,
    lastActivityAt: now,
    activeIds: ["mara"],
    participants: [{ characterId: "mara", name: "Mara", doing: "Listening" }],
    sceneAttendance: {
      capturedAt: now,
      layout: captureSceneLayout(world.venues[0]),
      occupants: [{ characterId: "mara", name: "Mara", doing: "Listening", zoneId: "common" }],
    },
    lines: [],
    submissions: [],
  });
  const records = new Map<string, any>([
    ["villages-village", { id: "villages-village", packageId: "villages", kind: "village", revision: 1, data: world }],
    [
      "villages-active-venue",
      {
        id: "villages-active-venue",
        packageId: "villages",
        kind: "venue-active",
        revision: 1,
        data: { sessionId: scene.id, placeId: scene.placeId },
      },
    ],
    [
      "villages-venue-visit-browser",
      { id: "villages-venue-visit-browser", packageId: "villages", kind: "venue-visit", revision: 1, data: scene },
    ],
  ]);
  const documents = {
    getById: async (_pkg: string, id: string) => structuredClone(records.get(id) ?? null),
    list: async (_pkg: string, kind: string) =>
      [...records.values()].filter((row) => row.kind === kind).map((row) => structuredClone(row)),
    create: async (input: any) => {
      assert(!records.has(input.id), "immutable fixture records cannot be overwritten");
      const row = { ...structuredClone(input), revision: 1 };
      records.set(row.id, row);
      return structuredClone(row);
    },
    update: async (input: any) => {
      const prior = records.get(input.id);
      if (prior?.revision !== input.expectedRevision) return null;
      const row = { ...prior, ...structuredClone(input), revision: prior.revision + 1 };
      records.set(row.id, row);
      return structuredClone(row);
    },
    remove: async (_pkg: string, id: string, revision: number) =>
      records.get(id)?.revision === revision && records.delete(id),
  };
  await seedVillageFixtureDocuments(documents as any);
  assert(Object.hasOwn(records.get("villages-village").data, "memoryHead"));
  assert(!Object.hasOwn(records.get("villages-village").data, "memories"));
  assert(!Object.hasOwn(records.get("villages-venue-visit-browser").data, "lines"));
  let calls = 0;
  const model = {
    connectionId: "synthetic",
    model: "fixture",
    maxContext: 64000,
    fitContext: (messages: any[], options: any) => ({
      messages,
      ...options,
      trimmed: false,
      estimatedTokensBefore: 1000,
      estimatedTokensAfter: 1000,
    }),
    chatComplete: async (messages: any[]) => {
      calls++;
      if (messages[0].content.startsWith("You interpret Villages gameplay.")) {
        const packet = JSON.parse(messages[1].content);
        return {
          content: JSON.stringify({
            sourceHash: packet.sourceHash,
            consistent: true,
            authority: { physical: false, access: false, projects: false, standing: false, social: false },
            intent: {
              status: "resolved",
              timeline: [{ kind: "speech", text: "Hello from browser" }],
              instructions: "",
              action: null,
              movement: null,
            },
            action: null,
            access: [],
            events: { moves: [], departures: [], contactEnd: [] },
            memoryChanges: [],
            relationshipChanges: { changes: [], permissions: [], disclosures: [] },
            wishChanges: [],
            projectSpeech: [],
            halt: { reason: "none", quote: "", appointments: [] },
            immediateResidentMoves: [],
            ...(Object.hasOwn(packet.input, "narrativeGrant")
              ? { narrativeIntroduction: { status: "quiet", development: null } }
              : {}),
            ...(packet.input.residentActions
              ? {
                  residentActionReview: {
                    version: 1,
                    additionalActions: [],
                    decisions: [],
                    coverage: packet.input.evidence.flatMap((line: any, segment: number) =>
                      line.playerHeard && line.speakerId !== "player"
                        ? [{ segment, status: "none", actionIds: [], reason: "No actions" }]
                        : [],
                    ),
                  },
                }
              : {}),
          }),
          finishReason: "stop",
        };
      }
      assert.match(messages[0].content, /ZONE EVENTS/u, "only the expected packaged writer may dispatch");
      return {
        content: JSON.stringify({
          playerSpeechCapture: {
            status: "captured",
            segments: [{ segment: 0, sources: [{ text: "Hello from browser", occurrence: 1 }] }],
          },
          segments: [
            { speakerId: "player", text: "Hello from browser", zoneId: "common" },
            { speakerId: "mara", text: "I heard your browser message.", zoneId: "common" },
          ],
          residentActions: [],
        }),
        finishReason: "stop",
        usage: { inputTokens: 10, outputTokens: 10 },
      };
    },
  };
  const runtime = {
    persistence: { documents },
    resources: {
      listCharacters: async () => [
        { id: "mara", revision: 1, data: { id: "mara", name: "Mara", description: "A friendly resident." } },
      ],
      listPersonas: async () => [{ id: "persona", data: { name: "Player" } }],
      listLorebooks: async () => [],
      listEligibleLorebookEntries: async () => [],
    },
    languageModels: { resolve: async () => model, resolveForRequest: async () => model },
    json: { parseJsonish: JSON.parse },
    logger: { info() {}, warn() {}, error() {}, debug() {}, debugOverride() {} },
    getAgentConfig: async () => ({ settings: {} }),
    isDebugAgentsEnabled: () => false,
  };
  const app = Fastify();
  const { activate } = await import(pathToFileURL(resolve("packages/villages/server.mjs")).href);
  const stop = await activate({
    api: {
      runtime,
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
  return {
    app,
    stop,
    calls: () => calls,
    records,
    scene: () => fixtureSceneState(records.get("villages-venue-visit-browser").data, records),
  };
}
