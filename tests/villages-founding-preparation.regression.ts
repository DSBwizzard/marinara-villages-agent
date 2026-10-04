import assert from "node:assert/strict";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import {
  coerceVillageState,
  mutateVillageState,
  readVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import { unwrittenVillageAgenda } from "../packages/villages/src/engine/packages/server/src/services/villages/agenda-plan.js";
import { defaultVenueSpace } from "../packages/villages/src/engine/packages/server/src/services/villages/venue-model.js";
import {
  preparePrivateSpaces,
  retryPrivateSpaces,
  privatePreparationRooms,
  startPrivateSpacePreparation,
} from "../packages/villages/src/engine/packages/server/src/services/villages/private-space-preparation.js";
import {
  prepareFoundedVillage,
  retryFoundedVillagePreparation,
  foundingPreparationSnapshot,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village.js";
import { startBackgroundWork } from "../packages/villages/src/engine/packages/server/src/services/villages/background-work.js";
import { previewVillageBurst } from "../packages/villages/src/engine/packages/server/src/services/villages/usage-preview.js";

const rows = new Map<string, any>();
const calls: string[] = [];
const stages: string[] = [];
const stamp = new Date().toISOString();
let mode = "valid";
let failVenue = "aqua";
let limit = 4096;
let hold: (() => void) | undefined;
let started: (() => void) | undefined;
let conflicts = 0;
let writes = 0;

function fixture(seeded = true) {
  const names = ["Aqua", "Feddy Fastbayer", "Sneak McKnickit"];
  const state = coerceVillageState({
    seed: "station-fields",
    name: "Station Fields",
    setting: "A disused station",
    setupAt: stamp,
    foundedAt: stamp,
    storyPace: "off",
    townMapImage: "data:image/png;base64,preserved-map",
    townMapImageSetAt: stamp,
    foundingPreparation: { status: "pending", completedIds: [], currentId: "", error: "", venueDetailsSeeded: seeded },
    villagers: names.map((name, index) => ({
      characterId: ["aqua", "feddy", "sneak"][index],
      cardSnapshot: {
        id: ["aqua", "feddy", "sneak"][index],
        name,
        revision: 1,
        sourceStatus: "available",
        capturedAt: stamp,
        personality: "Observant",
        summary: "A traveler",
      },
      addedAt: stamp,
    })),
    venues: ["aqua", "feddy", "sneak", "hall"].map((id, index) => ({
      id,
      name: id === "hall" ? "Gathering Place" : `${names[index]}'s living space`,
      form: "Converted station space",
      description: "An old station door",
      layoutVersion: 1,
      classes: id === "hall" ? ["gathering"] : ["residence"],
      occupancy: { playerHome: false, residentCharacterId: id === "hall" ? null : id, homeKind: null },
      residentIds: id === "hall" ? [] : [id],
      presentation: { image: null, x: (index + 1) / 5, y: 0.5 },
      zones: [
        { ...defaultVenueSpace("other", "An old station door"), id: "exterior", name: "Exterior", kind: "exterior" },
        {
          ...defaultVenueSpace(id === "hall" ? "gathering" : "residence"),
          id: "private:base",
          name: ["Signal Loft", "Storage Bay", "Underplatform Den", "Ticket Office"][index],
          kind: id === "hall" ? "restricted" : "private-residence",
          ownerId: id === "hall" ? undefined : id,
          controllerIds: id === "hall" ? ["player"] : [],
          preparation: { status: "pending" },
        },
      ],
    })),
  });
  for (const resident of state.villagers)
    resident.agenda = unwrittenVillageAgenda(state.venues, resident.cardSnapshot.name);
  return state;
}
function install(seeded = true) {
  rows.clear();
  calls.length = 0;
  stages.length = 0;
  writes = 0;
  rows.set("villages-village", { id: "villages-village", packageId: "villages", data: fixture(seeded), revision: 1 });
}
const originalFetch = globalThis.fetch;
globalThis.fetch = async () => new Response("[]", { headers: { "content-type": "application/json" } });
const release = configureVillagesRuntime({
  projectId: "founding-preparation-fixture",
  isDebugAgentsEnabled: () => false,
  logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
  getAgentConfig: async () => ({ connectionId: "fixture" }),
  resources: {
    listCharacters: async (ids?: string[]) =>
      (rows.get("villages-village")?.data.villagers ?? [])
        .filter((resident: any) => !ids || ids.includes(resident.characterId))
        .map((resident: any) => ({ id: resident.characterId, data: resident.cardSnapshot })),
    listLorebooks: async () => [],
  },
  persistence: {
    documents: {
      getById: async (_p: string, id: string) => structuredClone(rows.get(id) ?? null),
      list: async (_p: string, kind: string) => structuredClone([...rows.values()].filter((row) => row.kind === kind)),
      create: async (input: any) => {
        const row = { ...structuredClone(input), revision: 1 };
        rows.set(row.id, row);
        return row;
      },
      update: async (input: any) => {
        const previous = rows.get(input.id);
        if (!previous || previous.revision !== input.expectedRevision) return null;
        if (input.id === "villages-village" && conflicts-- > 0) return null;
        const row = { ...previous, ...structuredClone(input), revision: previous.revision + 1 };
        rows.set(row.id, row);
        writes++;
        const p = row.data?.foundingPreparation;
        if (p?.stage) stages.push(`${p.phase}:${p.stage}:${p.currentId || p.currentVenueId || ""}`);
        return row;
      },
      remove: async (_p: string, id: string) => rows.delete(id),
    },
  },
  languageModels: {
    resolveForRequest: async () => ({
      name: "Fixture System",
      model: "fixture",
      connectionId: "fixture",
      maxContext: 32000,
      maxOutputTokens: limit,
      fitContext: (messages: any[], options: any) => ({ messages, maxTokens: options.maxTokens }),
      chatComplete: async (messages: any[], options: any) => {
        if (messages[0].content.includes("Define exactly the one saved private space")) {
          const { rooms } = JSON.parse(messages[1].content);
          assert.equal(rooms.length, 1);
          const room = rooms[0];
          calls.push(room.venueId);
          assert.equal(options.maxTokens, Math.min(limit, 3000));
          assert.equal(options.reasoningEffort, "none");
          const claim = rows
            .get("villages-village")
            .data.venues.find((venue: any) => venue.id === room.venueId)
            .zones.find((zone: any) => zone.id === room.id).preparation;
          assert.ok(claim.claimId && claim.startedAt, "claim is persisted before dispatch");
          if (room.venueId === failVenue && mode === "held") {
            started?.();
            await new Promise<void>((resolve) => {
              hold = resolve;
            });
          }
          if (room.venueId === failVenue && mode === "provider") throw new Error("Offline api_key=private-secret");
          if (room.venueId === failVenue && mode === "empty") return { content: "", finishReason: "stop" };
          if (room.venueId === failVenue && mode === "malformed")
            return { content: '{"rooms":[', finishReason: "stop" };
          const output = {
            venueId: room.venueId,
            id: room.id,
            description: "PRIVATE CONTENT MUST STAY HIDDEN",
            condition: "Dry",
            items: Array(6).fill("Ordinary stool"),
            facts: Array(6).fill("Canvas wall"),
          };
          if (room.venueId === failVenue && mode === "wrong-id") output.id = "wrong";
          if (room.venueId === failVenue && mode === "wrong-venue") output.venueId = "wrong";
          if (room.venueId === failVenue && mode === "no-description") output.description = "";
          return {
            content: JSON.stringify({ rooms: [output] }),
            finishReason: room.venueId === failVenue && mode === "truncated" ? "length" : "stop",
          };
        }
        if (messages[0].content.includes("Seed a few observable")) {
          calls.push("venues");
          const input = JSON.parse(messages[1].content);
          return {
            content: JSON.stringify({
              venues: input.venues.map((venue: any) => ({
                id: venue.id,
                condition: "Dry",
                items: [],
                publicFacts: [],
                features: [],
              })),
            }),
            finishReason: "stop",
          };
        }
        calls.push("routine");
        return {
          content: JSON.stringify({
            routine: "Quiet days at the station",
            wishes: [],
            palette: ["resting", "reading", "walking", "writing", "thinking", "tidying"].map((activity) => ({
              activity,
              venue: 0,
              status: "idle",
              flexible: true,
              duration: 90,
              parts: [0, 1, 2, 3],
            })),
            days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
            rhythm: [],
          }),
          finishReason: "stop",
        };
      },
    }),
  },
} as any);

async function main() {
  const stop = startBackgroundWork();
  try {
    install(false);
    await Promise.all([prepareFoundedVillage(), prepareFoundedVillage()]);
    assert.deepEqual(calls, ["venues", "aqua", "feddy", "sneak", "hall", "routine", "routine", "routine"]);
    let state = await readVillageState();
    assert.equal(state.foundingPreparation?.status, "ready");
    assert.equal(state.foundingPreparation?.completedIds.length, 3);
    assert.ok(stages.includes("venues:model:"));
    assert.ok(stages.includes("private-spaces:model:aqua"));
    assert.ok(stages.includes("residents:model:aqua"));
    assert.ok(stages.includes("residents:saving:aqua"));
    assert.equal(state.townMapImage, fixture().townMapImage);
    assert.ok(
      privatePreparationRooms(state).every(
        ({ zone }) => zone.state.items.length <= 4 && zone.state.publicFacts.length <= 4,
      ),
    );

    for (const failure of [
      "truncated",
      "empty",
      "malformed",
      "wrong-id",
      "wrong-venue",
      "no-description",
      "provider",
    ]) {
      install();
      mode = failure;
      failVenue = "feddy";
      await prepareFoundedVillage();
      state = await readVillageState();
      assert.equal(state.foundingPreparation?.status, "failed", failure);
      assert.deepEqual(calls, ["aqua", "feddy"], "failure stops later requests without implicit retries");
      assert.equal(state.venues[0].zones![1].preparation?.status, "ready");
      assert.equal(state.venues[2].zones![1].preparation?.status, "pending");
      assert.match(state.foundingPreparation!.error, /Storage Bay.*Fixture System.*limit 3000.*finish/);
      assert.doesNotMatch(state.foundingPreparation!.error, /PRIVATE CONTENT|private-secret/);
      await foundingPreparationSnapshot();
      await preparePrivateSpaces();
      assert.deepEqual(calls, ["aqua", "feddy"], "reads and direct discovery never resume a failed sequence");
      mode = "valid";
      await Promise.all([retryFoundedVillagePreparation(), retryFoundedVillagePreparation()]);
      await prepareFoundedVillage();
      state = await readVillageState();
      assert.equal(state.foundingPreparation?.status, "ready");
      assert.deepEqual(calls, ["aqua", "feddy", "feddy", "sneak", "hall", "routine", "routine", "routine"]);
      assert.equal(state.venues[1].zones![1].preparation?.attempt, 2);
      assert.equal(state.townMapImage, fixture().townMapImage);
    }

    install();
    mode = "valid";
    limit = 700;
    await preparePrivateSpaces();
    assert.equal(calls.length, 4, "a lower configured output allowance is respected");
    limit = 4096;

    install();
    await mutateVillageState((current) => {
      current.venues[0].zones![1].preparation = {
        status: "pending",
        claimId: "previous-process",
        startedAt: stamp,
        attempt: 4,
      };
    });
    await assert.rejects(preparePrivateSpaces(), /interrupted/);
    assert.equal(calls.length, 0, "orphaned claims cannot dispatch automatically");
    await retryPrivateSpaces();
    assert.equal(calls.length, 4);
    assert.equal((await readVillageState()).venues[0].zones![1].preparation?.attempt, 5);

    for (const change of ["seed", "room", "abort"]) {
      install();
      mode = "held";
      failVenue = "aqua";
      const controller = new AbortController();
      const admitted = new Promise<void>((resolve) => {
        started = resolve;
      });
      const work = preparePrivateSpaces(controller.signal);
      await admitted;
      if (change === "abort") controller.abort();
      else
        await mutateVillageState((current) => {
          if (change === "seed") {
            current.seed = "new-village";
            current.name = "New Village";
          } else current.venues[0].zones![1].description = "Author changed the space";
        });
      hold!();
      if (change === "seed") await work;
      else await assert.rejects(work, change === "abort" ? /interrupted/ : /changed/);
      state = await readVillageState();
      assert.doesNotMatch(state.venues[0].zones![1].description, /PRIVATE CONTENT/);
      assert.equal(calls.length, 1, "stale/aborted work does not continue to later spaces");
    }

    install();
    mode = "valid";
    await mutateVillageState((current) => {
      current.venues[0].zones![1].ownerId = undefined;
      current.venues[1].constructionStatus = "worksite";
    });
    await prepareFoundedVillage();
    assert.equal(
      (await readVillageState()).foundingPreparation?.status,
      "ready",
      "vacant rooms and worksites do not block founding",
    );
    assert.deepEqual(calls.slice(0, 2), ["sneak", "hall"]);

    install();
    conflicts = 2;
    await Promise.all([preparePrivateSpaces(), preparePrivateSpaces()]);
    assert.equal(calls.length, 4, "CAS conflicts and concurrent calls reuse one request per space");

    install();
    const beforeWrites = writes;
    const preview = await previewVillageBurst({ action: "founding" });
    assert.equal(preview.requests, 7, "four spaces plus three routines");
    assert.equal(writes, beforeWrites);
    assert.equal(calls.length, 0);
    await mutateVillageState((current) => {
      current.venues[0].zones![1].preparation = { status: "ready" };
    });
    assert.equal((await previewVillageBurst({ action: "founding" })).requests, 6);
    const cleanup = startPrivateSpacePreparation();
    await new Promise((resolve) => setTimeout(resolve, 10));
    cleanup();
    assert.equal(calls.length, 0, "activation leaves founding preparation to its owning flow");
    console.log(
      "Founding preparation: Station Fields, single-space checkpoints, failures, retries, claims, fencing, progress and forecasts passed.",
    );
  } finally {
    stop();
    release();
    globalThis.fetch = originalFetch;
  }
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
