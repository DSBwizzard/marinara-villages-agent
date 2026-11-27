// Test cases: npc-cast/privacy, npc-cast/identity, npc-cast/player-identity, npc-cast/name-prefixes, npc-cast/map-scope, npc-cast/bounded-retrieval, npc-cast/linked-references, npc-cast/index-edits, npc-cast/legacy-receipts
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { fixture as projectFixture } from "./fixtures/villages-projects.fixture.js";
import {
  assertDistinctNpcName,
  worldCharacterReferences,
} from "../packages/villages/src/server/domain/rules/npc-cast.js";
import {
  capturePlaceContext,
  readNpc,
  readPlaceRegistry,
} from "../packages/villages/src/server/domain/rules/places.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { readNarrationReply } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { namedNpcIds, npcIndex } from "../packages/villages/src/server/domain/rules/npc-index.js";
import { immutableMemoryValue } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { npcEncounterIndex } from "../packages/villages/src/server/domain/rules/npc-encounters.js";
const at = "2026-11-21T12:00:00.000Z";
const names = ["Rasha Dunmore", "Bex Alder", "Corin Vale", "Dima Reed", "Elio Moss", "Zora Finch"];
function fixture() {
  const state = projectFixture().state();
  return { state, mapId: state.maps[0].id };
}
function populateFixture(f: ReturnType<typeof fixture>) {
  for (const [i, name] of names.entries()) {
    const id = "npc:contact-" + i;
    f.state.worldPlaces.npcs[id] = readNpc({
      id,
      revision: 1,
      name,
      label: "Local " + i,
      mapId: f.mapId,
      appearance: i === 0 ? "A tall man in a red suit." : "An ordinary blue coat.",
      characterization: "PRIVATE_CAST_PERSONALITY " + name,
      listed: true,
      facts: [],
      associations: [],
      availability: "",
      disabled: false,
      source: "authored",
      updatedAt: at,
    });
  }
}
await runCase("npc-cast/privacy", () => {
  const f = fixture();
  populateFixture(f);
  const people = [...npcEncounterIndex(f.state).values()];
  assert.equal(people.length, 0, "authored/legacy listed NPCs are not people the Player has met");
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
  const scoped = worldCharacterReferences(f.state, {
    placeId: f.state.venues[0].id,
    mapId: f.mapId,
    query: "Daylite's house",
  });
  assert(
    scoped.some((person) => person.name === "Daylite"),
    "a possessive Place name resolves its established person",
  );
  assert(
    !scoped.some((person) => person.id === f.state.villagers[2].characterId),
    "unrelated identities stay outside the Scene packet",
  );
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
  populateFixture(f);
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
  populateFixture(f);
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
  const ids = Object.keys(f.state.worldPlaces.npcs);
  const unmet = ids.find((id) => !Object.hasOwn(context.npcs, id))!;
  const remaining = capturePlaceContext(
    f.state,
    f.state.venues[0].id,
    [],
    "I approach the man in the red velvet suit.",
    ids.filter((id) => id !== unmet),
  );
  assert.deepEqual(
    Object.keys(remaining.npcs),
    [unmet],
    "known people cannot crowd the unmet NPC out of the shortlist",
  );
  const references = worldCharacterReferences(f.state, {
    placeId: f.state.venues[0].id,
    mapId: f.mapId,
    query: "red velvet suit",
  });
  assert(references.filter((row) => row.kind === "npc").length <= 8);
  assert(!JSON.stringify(references).includes("PRIVATE_EXTRA_"));
  assert.equal(npcEncounterIndex(f.state).size, 0, "private registry growth does not add encounters");
});
await runCase("npc-cast/linked-references", () => {
  const f = fixture();
  populateFixture(f);
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
await runCase("npc-cast/index-edits", () => {
  const f = fixture();
  populateFixture(f);
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

await runCase("npc-cast/player-identity", () => {
  const f = fixture();
  f.state.playerName = "";
  f.state.playerPersonaId = "persona";
  f.state.playerPersonaName = "Vesper Cedar";
  for (const name of ["Vesper Cedar", "Vesper", "Ｖｅｓｐｅｒ"])
    assert.throws(
      () => assertDistinctNpcName(f.state, name),
      /already identifies/,
      "the linked Persona is the Player identity",
    );
  assert.doesNotThrow(() => assertDistinctNpcName(f.state, "An unrelated neighbor"));
});
await runCase("npc-cast/name-prefixes", () => {
  const f = fixture();
  populateFixture(f);
  f.state.villagers[0].cardSnapshot.name = "The Doctor";
  f.state.villagers[1].cardSnapshot.name = "Captain Vale";
  for (const name of ["The man in a red suit", "Captain Ada"])
    assert.doesNotThrow(() => assertDistinctNpcName(f.state, name), "generic prefixes are not personal identities");
  assert.throws(() => assertDistinctNpcName(f.state, "The Doctor"), /already identifies/);
  const id = Object.keys(f.state.worldPlaces.npcs)[0];
  f.state.worldPlaces.npcs[id].name = "The Keeper";
  assert(
    !namedNpcIds(f.state.worldPlaces, "I approach the red door").has(id),
    "an article cannot retrieve an unrelated person",
  );
  assert(namedNpcIds(f.state.worldPlaces, "I visit The Keeper").has(id));
});
await runCase("npc-cast/legacy-receipts", () => {
  const f = fixture();
  populateFixture(f);
  f.state.worldPlaces.operations["historical-cast"] = {
    id: "historical-cast",
    attempt: 1,
    fingerprint: "retained",
    kind: "populate",
    placeId: "",
    status: "ready",
    input: { mapId: f.mapId, intent: "" },
    messages: [{ role: "system", content: "Original population request" }],
    connectionId: "original-system",
  };
  assert.deepEqual(
    readPlaceRegistry(JSON.parse(JSON.stringify(f.state.worldPlaces))),
    f.state.worldPlaces,
    "removing population work preserves existing NPCs and purchased evidence",
  );
});
