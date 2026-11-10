import { venueFixture } from "../helpers/venues.fixture.js";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { defaultVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultVenueSpace } from "../../packages/villages/src/server/domain/rules/venue-model.js";
import { captureSceneLayout } from "../../packages/villages/src/server/domain/rules/scene-layout.js";
import type { VenueScene } from "../../packages/villages/src/server/domain/models/scene-model.js";
import { seedVillageFixtureDocuments, fixtureSceneState } from "../helpers/village-storage.fixture.js";
import { initializeRoomContinuity } from "../../packages/villages/src/server/domain/rules/native-continuity.js";
import { captureSceneContinuity } from "../../packages/villages/src/server/domain/rules/scene-continuity.js";
import { agendaFixture } from "../helpers/agenda.fixture.js";

export async function packagedSceneServer(
  options: {
    configure?: (world: ReturnType<typeof defaultVillageState>, now: string) => void;
    configureScene?: (scene: VenueScene, world: ReturnType<typeof defaultVillageState>) => void;
    bundle?: string;
  } = {},
) {
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
      letterFontId: "caveat",
      characterId: "mara",
      incarnation: "mara:packaged",
      addedAt: now,
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
          description: "A stone threshold outside the mill.",
          connectedTo: ["common"],
          seen: true,
        },
        {
          ...defaultVenueSpace("other"),
          id: "common",
          name: "Common",
          venueClass: "other",
          kind: "public",
          description: "A wooden bench stands against a plaster wall.",
          connectedTo: ["exterior"],
          seen: true,
        },
      ],
    },
  ].map(venueFixture) as typeof world.venues;
  options.configure?.(world, now);
  world.startingHistory.reviewed = Object.fromEntries(world.villagers.map((row) => [row.characterId, row.incarnation]));
  for (const actor of world.villagers)
    actor.agenda ??= agendaFixture({
      generatedAt: now,
      activeDay: {
        dateKey: now.slice(0, 10),
        weekday: new Intl.DateTimeFormat("en", { weekday: "long", timeZone: "UTC" }).format(new Date(now)),
        scheduleInformed: false,
        blocks: [
          { startMinute: 0, endMinute: 1440, venueId: "mill", zoneId: "common", activity: "Free time", flexible: true },
        ],
      },
    });
  for (const venue of world.venues)
    for (const zone of venue.zones ?? [])
      initializeRoomContinuity(world, venue.id, zone.id, zone.description, "packaged-founding", now);
  const scene = coerceSession({
    version: 5,
    accompanying: [{ characterId: "mara", zoneId: "common" }],
    id: "browser",
    placeId: "mill",
    placeName: "The Mill",
    area: "public",
    zoneId: "common",
    villageSeed: world.seed,
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
  options.configureScene?.(scene, world);
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(now));
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
      assert.match(messages[0].content, /GM of Villages/, "Only the current GM writer may dispatch");
      return {
        content: JSON.stringify({
          segments: [{ kind: "dialogue", speakerId: "mara", text: "Hello there." }],
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
  const { activate } = await import(pathToFileURL(resolve(options.bundle ?? "packages/villages/server.mjs")).href);
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
    model,
    calls: () => calls,
    records,
    documents,
    scene: () => fixtureSceneState(records.get("villages-venue-visit-browser").data, records),
  };
}
