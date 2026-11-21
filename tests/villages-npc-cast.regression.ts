// Test cases: npc-cast/population, npc-cast/concurrent, npc-cast/retry, npc-cast/multi-map-retry, npc-cast/replay, npc-cast/collision, npc-cast/privacy, npc-cast/identity, npc-cast/map-scope, npc-cast/bounded-retrieval, npc-cast/linked-references, npc-cast/seed-context, npc-cast/index-edits
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import { createNpcPopulation } from "../packages/villages/src/server/features/places/npc-population.js";
import {
  assertDistinctNpcName,
  establishMapNpcs,
  populatedMapIds,
  publicNpcDirectory,
  worldCharacterReferences,
} from "../packages/villages/src/server/domain/rules/npc-cast.js";
import { capturePlaceContext, readPlaceRegistry } from "../packages/villages/src/server/domain/rules/places.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { namedNpcIds, npcIndex } from "../packages/villages/src/server/domain/rules/npc-index.js";
import { immutableMemoryValue } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
const at = "2026-11-21T12:00:00.000Z";
const names = ["Rasha Dunmore", "Bex Alder", "Corin Vale", "Dima Reed", "Elio Moss", "Zora Finch"];
const draft = () => ({
  people: names.map((name, index) => ({
    name,
    appearance: index === 0 ? "A tall man in a red suit." : `A distinctive blue coat with ${index} silver buttons.`,
    characterization: "PRIVATE_CAST_PERSONALITY " + name,
    role: "Local " + index,
  })),
});
function fixture() {
  const state = projectFixture().state();
  const mapId = state.maps[0].id;
  let calls = 0;
  const saved = new Map<string, any>();
  let nextDraft = draft();
  let onCall = async () => {};
  const ports: any = {
    now: () => new Date(at),
    readVillageState: async () => structuredClone(state),
    mutateVillageState: async (update: any) => {
      const candidate = structuredClone(state);
      update(candidate);
      Object.assign(state, candidate);
      return structuredClone(state);
    },
    villagesConnectionIdFor: async () => "system",
    villagesLanguageModels: () => ({
      resolveForRequest: async () => ({
        connectionId: "resolved-system",
        fitContext: (messages: any) => ({ messages, maxTokens: 4096 }),
      }),
    }),
    completeWithRoom: async (_model: any, _messages: any, _tokens: any, options: any) => {
      calls++;
      await onCall();
      const answer = { content: JSON.stringify(nextDraft), finishReason: "stop" };
      if (options.savedRequest.valid(answer)) saved.set(options.savedRequest.key, answer);
      return answer;
    },
    reopenSavedResponse: async (_mutate: any, key: string) => saved.get(key),
    mutateDocument: async () => {},
    readVillageLore: async () => [],
  };
  return {
    state,
    mapId,
    ports,
    create: () => createNpcPopulation(ports),
    calls: () => calls,
    answer: (value: ReturnType<typeof draft>) => {
      nextDraft = value;
    },
    onCall: (work: () => Promise<void>) => {
      onCall = work;
    },
    saved,
  };
}
await runCase("npc-cast/population", async () => {
  const f = fixture();
  const service = f.create();
  await service.prepareMapNpcs(f.mapId);
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 6);
  assert.equal(f.calls(), 1);
  await service.prepareMapNpcs(f.mapId);
  await f.create().prepareMapNpcs(f.mapId, "another-action");
  assert.equal(f.calls(), 1, "visits, restarts and retries never replenish a ready cast");
  assert.equal(Object.values(f.state.worldPlaces.operations)[0].connectionId, "resolved-system");
  assert.deepEqual(readPlaceRegistry(JSON.parse(JSON.stringify(f.state.worldPlaces))), f.state.worldPlaces);
  f.state.maps.push({ ...structuredClone(f.state.maps[0]), id: "empty-map" });
  await service.prepareMapNpcs("empty-map");
  assert.equal(f.calls(), 1, "an empty Map has no generated population");
});
await runCase("npc-cast/concurrent", async () => {
  const f = fixture();
  await Promise.all([
    f.create().prepareMapNpcs(f.mapId),
    f.create().prepareMapNpcs(f.mapId),
    f.create().prepareMapNpcs(f.mapId),
  ]);
  assert.equal(f.calls(), 1, "the durable Map slot excludes duplicate purchases across service instances");
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 6);
});
await runCase("npc-cast/retry", async () => {
  const f = fixture();
  f.onCall(async () => {
    throw Error("Previous purchase outcome is uncertain");
  });
  await assert.rejects(f.create().prepareMapNpcs(f.mapId));
  await f.create().prepareMapNpcs(f.mapId);
  assert.equal(f.calls(), 1, "a repeated visit does not authorize another purchase");
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 0);
  f.onCall(async () => {});
  await f.create().prepareMapNpcs(f.mapId, "deliberate-retry");
  await f.create().prepareMapNpcs(f.mapId, "deliberate-retry");
  assert.equal(f.calls(), 2);
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 6);
});
await runCase("npc-cast/multi-map-retry", async () => {
  const f = fixture(),
    secondMap = "second-map";
  f.state.maps.push({ ...structuredClone(f.state.maps[0]), id: secondMap });
  f.state.venues.push({
    ...structuredClone(f.state.venues[0]),
    id: "second-venue",
    presentation: { ...f.state.venues[0].presentation, mapId: secondMap },
  });
  f.onCall(async () => {
    throw Error("Uncertain purchase");
  });
  await assert.rejects(f.create().prepareMapNpcs(f.mapId));
  await assert.rejects(f.create().prepareMapNpcs(secondMap));
  f.onCall(async () => {});
  await f.create().prepareMapNpcs(f.mapId, "founding-retry");
  const replacement = draft();
  replacement.people.forEach((person, i) => {
    person.name = ["Vesper", "Nell", "Orin", "Pia", "Quinn", "Suri"][i];
  });
  f.answer(replacement);
  await f.create().prepareMapNpcs(secondMap, "founding-retry");
  assert.equal(f.calls(), 4, "one founding Retry action may recover every populated Map");
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 12);
});
await runCase("npc-cast/replay", async () => {
  const f = fixture();
  const mutate = f.ports.mutateVillageState;
  let losePublication = true;
  f.ports.mutateVillageState = async (update: any, options: any) =>
    mutate((candidate: any) => {
      update(candidate);
      if (losePublication && Object.keys(candidate.worldPlaces.npcs).length) {
        losePublication = false;
        throw Error("Storage publication failed after the response was saved");
      }
    }, options);
  await assert.rejects(f.create().prepareMapNpcs(f.mapId));
  assert.equal(f.saved.size, 1);
  await f.create().prepareMapNpcs(f.mapId, "replay-after-restart");
  assert.equal(f.calls(), 1, "the exact saved response is applied without another provider request");
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 6);
});
await runCase("npc-cast/collision", async () => {
  const f = fixture();
  f.onCall(async () => {
    f.state.villagers[0].cardSnapshot.name = names[0];
  });
  await assert.rejects(f.create().prepareMapNpcs(f.mapId), /already identifies/);
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 0, "live collision checks keep the entire batch atomic");
  const original = [...f.saved.values()][0];
  f.onCall(async () => {});
  const replacement = draft();
  replacement.people[0].name = "Vesper Cedar";
  f.answer(replacement);
  await f.create().prepareMapNpcs(f.mapId, "replace-invalid-saved-cast");
  assert.equal(f.calls(), 2, "an explicit retry can replace a draft invalidated by a live identity collision");
  assert.equal(f.saved.size, 2, "the original purchased response is retained");
  assert.equal([...f.saved.values()][0], original);
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 6);
});
await runCase("npc-cast/privacy", () => {
  const f = fixture();
  establishMapNpcs(f.state, f.mapId, draft(), "seed", at);
  const people = publicNpcDirectory(f.state);
  assert.equal(people.length, 6);
  assert(people.every((person) => !person.met && !person.appearance));
  assert(!JSON.stringify(people).includes("PRIVATE_CAST_PERSONALITY"));
  assert(!JSON.stringify(people).includes(names[0]));
});
await runCase("npc-cast/identity", () => {
  const f = fixture();
  f.state.villagers[0].cardSnapshot.name = "Feddy Fastbayer";
  f.state.villagers[1].cardSnapshot.name = "Daylite";
  for (const name of ["Feddy", "feddy fastbayer", "Ｆｅｄｄｙ", "Daylite"])
    assert.throws(() => assertDistinctNpcName(f.state, name), /already identifies/);
  assert(worldCharacterReferences(f.state).some((person) => person.name === "Feddy Fastbayer"));
  const place = establishPlace(
    f.state,
    {
      name: "Feddy Fastbayer's garage",
      description: "A garage.",
      controllers: ["feddy"],
      people: [{ ref: "feddy", existingId: f.state.villagers[0].characterId, role: "Owner" }],
    },
    "feddy-garage",
    f.mapId,
    "test",
    at,
    true,
  );
  assert.deepEqual(place.location.access!.managerIds, [f.state.villagers[0].characterId]);
  assert.equal(Object.keys(f.state.worldPlaces.npcs).length, 0);
  assert.throws(() =>
    establishPlace(
      f.state,
      {
        name: "Daylite's house",
        description: "A house.",
        people: [{ ref: "daylite", name: "Daylite", characterization: "The owner." }],
      },
      "fake-house",
      f.mapId,
      "test",
      at,
      true,
    ),
  );
  assert.throws(
    () =>
      readNarrationReply(
        { segments: [{ kind: "narration", text: "Feddy greets you.", actors: [f.state.villagers[0].characterId] }] },
        [],
      ),
    /absent or invented/,
  );
});
await runCase("npc-cast/map-scope", () => {
  const f = fixture();
  establishMapNpcs(f.state, f.mapId, draft(), "seed", at);
  assert.equal(populatedMapIds(f.state).length, 1);
  const local = capturePlaceContext(f.state, f.state.venues[0].id, []);
  assert.equal(Object.keys(local.npcs).length, 6);
  const remote = structuredClone(f.state.venues[0]);
  remote.id = "remote";
  remote.presentation.mapId = "other";
  f.state.venues.push(remote);
  assert.equal(Object.keys(capturePlaceContext(f.state, remote.id, []).npcs).length, 0);
});
await runCase("npc-cast/bounded-retrieval", () => {
  const f = fixture();
  establishMapNpcs(f.state, f.mapId, draft(), "seed", at);
  const base = Object.values(f.state.worldPlaces.npcs)[0];
  for (let i = 0; i < 200; i++)
    f.state.worldPlaces.npcs["npc:extra-" + i] = {
      ...structuredClone(base),
      id: "npc:extra-" + i,
      name: "Extra Person " + i,
      listed: false,
      appearance: "An ordinary grey coat.",
      characterization: "PRIVATE_EXTRA_" + i,
    };
  f.state.worldPlaces.npcs["npc:extra-199"].appearance = "A distinctive man in a red velvet suit.";
  const context = capturePlaceContext(f.state, f.state.venues[0].id, [], "I approach the man in the red velvet suit.");
  assert.equal(
    Object.values(context.npcs)[0].id,
    "npc:extra-199",
    "appearance lookup finds an older unlisted person before proposing a new identity",
  );
  assert.equal(Object.keys(context.npcs).length, 8);
  const references = worldCharacterReferences(f.state, {
    placeId: f.state.venues[0].id,
    mapId: f.mapId,
    query: "red velvet suit",
  });
  assert(references.filter((row) => row.kind === "npc").length <= 8);
  assert(!JSON.stringify(references).includes("PRIVATE_EXTRA_"));
  assert.equal(publicNpcDirectory(f.state).length, 6, "encounter history does not expand People");
});
await runCase("npc-cast/linked-references", () => {
  const f = fixture();
  establishMapNpcs(f.state, f.mapId, draft(), "seed", at);
  const base = Object.values(f.state.worldPlaces.npcs)[0];
  const linked = Array.from({ length: 12 }, (_, i) => "npc:controller-" + i);
  for (const id of linked) f.state.worldPlaces.npcs[id] = { ...structuredClone(base), id, name: "Controller " + id };
  f.state.venues[0].access = { ...f.state.venues[0].access!, managerIds: linked };
  const refs = worldCharacterReferences(f.state, { mapId: f.mapId, placeId: f.state.venues[0].id });
  assert(
    linked.every((id) => refs.some((row) => row.id === id)),
    "all established authorities retain their identity",
  );
  assert.equal(refs.filter((row) => row.kind === "npc").length, linked.length + 4);
});
await runCase("npc-cast/seed-context", async () => {
  const f = fixture();
  for (let i = 0; i < 200; i++) {
    const place = establishPlace(
      f.state,
      { name: "Outpost " + i, description: "An established outpost." },
      "outpost-" + i,
      f.mapId,
      "test",
      at,
      true,
    );
    place.location.description = "Long optional background. ".repeat(1000);
  }
  await f.create().prepareMapNpcs(f.mapId);
  const operation = Object.values(f.state.worldPlaces.operations)[0];
  const packet = JSON.parse(operation.messages[1].content);
  assert.equal(packet.places.length, 12);
  assert(packet.places.every((row: any) => row.description.length <= 600));
  assert(
    JSON.stringify(operation.messages).length < 20000,
    "optional location history stays bounded before the one seed request",
  );
});
await runCase("npc-cast/index-edits", () => {
  const f = fixture();
  establishMapNpcs(f.state, f.mapId, draft(), "seed", at);
  const id = Object.keys(f.state.worldPlaces.npcs)[0];
  const first = immutableMemoryValue(f.state.worldPlaces);
  assert.equal(npcIndex(first), npcIndex(first), "immutable saved snapshots share their local index");
  assert(namedNpcIds(first, names[0]).has(id));
  const changed = structuredClone(first);
  changed.npcs[id].name = "Vesper Cedar";
  changed.npcs[id].appearance = "A green silk coat.";
  changed.npcs[id].mapId = "another-map";
  changed.npcs[id].associations = [{ placeId: "another-place", role: "Host" }];
  const second = immutableMemoryValue(changed);
  assert(!namedNpcIds(second, names[0]).has(id));
  assert(namedNpcIds(second, "Vesper Cedar").has(id));
  assert(!npcIndex(second).maps.get(f.mapId)?.has(id));
  assert(npcIndex(second).places.get("another-place")?.has(id));
  assert(namedNpcIds(first, names[0]).has(id), "repair leaves captured snapshots unchanged");
  f.state.worldPlaces = second;
  f.state.villagers[0].cardSnapshot.name = "Feddy Fastbayer";
  assert.throws(
    () => assertDistinctNpcName(f.state, "Feddy"),
    /already identifies/,
    "roster edits do not reuse an obsolete NPC-index collision set",
  );
});
