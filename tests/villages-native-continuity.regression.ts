// Test cases: native-continuity/unobserved, native-continuity/fresh-room, native-continuity/room-replay, native-continuity/cold-room, native-continuity/founding-circumstance
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { readAcceptedEpisode } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { readContinuity } from "../packages/villages/src/server/domain/decoding/continuity-codec.js";
import {
  initializeRoomContinuity,
  retainNativeFact,
} from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityViews,
  continuityHolderKey,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import {
  seedFoundingCircumstances,
  readFoundingCircumstances,
} from "../packages/villages/src/server/domain/rules/founding-circumstances.js";
import { gmEpisodeView } from "../packages/villages/src/server/domain/rules/episodes.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { readContinuityProposal } from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
const at = "2026-11-09T12:00:00.000Z",
  text = "静かな部屋。".repeat(666) + "絵の具";
function fixture() {
  const state = { ...defaultVillageState(), seed: "world", setupAt: at, foundedAt: at };
  const place = establishPlace(
    state,
    {
      name: "Studio",
      description: "An entrance.",
      zones: [{ id: "studio", name: "Studio", kind: "public", description: "A studio." }],
      people: ["mara", "leo", "rue"].map((ref) => ({ ref, name: ref, characterization: "An established artisan." })),
    },
    "studio",
    "map",
    "native-creation",
    at,
    true,
  );
  place.location.zones!.find((zone) => zone.id === "studio")!.description = text;
  return { state, room: { kind: "room" as const, placeId: place.id, zoneId: "studio" } };
}
await runCase("native-continuity/unobserved", () => {
  const { state } = fixture();
  retainNativeFact(
    state,
    {
      id: "roof-completed",
      kind: "project",
      targetId: "roof",
      revision: 1,
      text: "The roof repairs completed.",
      witnesses: [],
    },
    at,
  );
  const episode = state.episodes.records[0];
  assert.deepEqual(episode.actors, []);
  assert.equal(state.continuity.records.length, 0);
  const player = continuityActor(state, "player")!;
  assert.equal(gmEpisodeView(episode, state.continuity, [player], state.episodes), null);
  assert.throws(
    () => readAcceptedEpisode({ ...episode, sceneId: "scene" }, state.seed),
    /cannot invent Scene participation/,
  );
  assert.throws(
    () =>
      readAcceptedEpisode(
        { ...episode, commandReceipts: [{ ...episode.commandReceipts[0], witnesses: ["player"] }] },
        state.seed,
      ),
    /observer/,
  );
});
await runCase("native-continuity/fresh-room", () => {
  const { state, room } = fixture();
  assert(text.length <= 4000 && Buffer.byteLength(text) > 8000);
  initializeRoomContinuity(state, room.placeId, room.zoneId, text, "native-creation", at);
  const entries = continuityViews(state.continuity, room, at, new Set());
  assert.equal(entries.length, 1);
  assert.equal(entries[0].version.text, text);
  assert.deepEqual(state.episodes.records[0].actors, []);
  assert.deepEqual(state.continuity.records[0].heads[continuityHolderKey(room)].holder, room);
  assert.equal(continuityViews(state.continuity, continuityActor(state, "player")!, at, new Set()).length, 0);
  assert.equal(readContinuity(JSON.parse(JSON.stringify(state.continuity)), state.seed).versions[0].text, text);
  assert.equal(readContinuityProposal({ for: "room", text, source: ["h:1"] }).text, text);
  assert.throws(() => readContinuityProposal({ for: ["player"], text, source: ["h:1"] }), /actor continuity/);
});
await runCase("native-continuity/room-replay", () => {
  const { state, room } = fixture();
  initializeRoomContinuity(state, room.placeId, room.zoneId, text, "native-creation", at);
  const prior = memoryHash(state);
  initializeRoomContinuity(state, room.placeId, room.zoneId, text, "native-creation", at);
  assert.equal(memoryHash(state), prior);
  assert.throws(
    () => initializeRoomContinuity(state, room.placeId, room.zoneId, text, "another-creation", at),
    /already initialized/,
  );
  assert.throws(
    () => initializeRoomContinuity(state, room.placeId, room.zoneId, "Different appearance.", "native-creation", at),
    /native creation/,
  );
  assert.equal(memoryHash(state), prior, "fresh initialization cannot adopt or overwrite existing continuity");
});
await runCase("native-continuity/cold-room", async () => {
  const { state, room } = fixture(),
    storage = sceneHistoryFixture();
  try {
    initializeRoomContinuity(state, room.placeId, room.zoneId, text, "native-creation", at);
    const repository = createVillageRepository(() => storage.gate.documents);
    await repository.mutateAuthority(
      (saved) => {
        Object.assign(saved, state);
      },
      { memories: true },
    );
    const cold = await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true });
    assert.equal(continuityViews(cold.continuity, room, at, new Set())[0].version.text, text);
    assert.deepEqual(cold.episodes.records[0].actors, []);
  } finally {
    storage.release();
  }
});
await runCase("native-continuity/founding-circumstance", async () => {
  const { state } = fixture(),
    storage = sceneHistoryFixture();
  try {
    const knowers = ["player", ...Object.keys(state.worldPlaces.npcs)];
    const situations = readFoundingCircumstances([{ scope: "village", summary: text }], [], at);
    seedFoundingCircumstances(state, situations, knowers, at);
    assert.equal(state.narrative!.situations[0].summary, text);
    assert.equal(state.episodes.records.length, 1);
    assert.deepEqual(state.episodes.records[0].segments, []);
    assert.equal(
      state.continuity.records.length,
      1,
      "the complete native meaning is one common record, never arbitrary text chunks",
    );
    for (const id of knowers) {
      const holder = continuityActor(state, id)!;
      const view = continuityViews(state.continuity, holder, at, new Set())[0];
      assert.equal(view.version.text, text);
      assert.deepEqual(
        view.version.sources[0].perceptions.map((row) => row.actorId),
        [id],
        "each holder retains only their native notification projection",
      );
    }
    const repository = createVillageRepository(() => storage.gate.documents);
    await repository.mutateAuthority(
      (saved) => {
        Object.assign(saved, state);
      },
      { memories: true },
    );
    const cold = await createVillageRepository(() => storage.gate.documents).readAuthority({ memories: true });
    assert.equal(cold.continuity.versions.length, knowers.length);
    assert(cold.continuity.versions.every((row) => row.text === text));
    const holder = continuityActor(cold, "player")!,
      key = continuityHolderKey(holder),
      record = cold.continuity.records[0];
    cold.continuity = protectContinuity(
      cold.continuity,
      { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
      [holder],
      "forget-circumstance",
      at,
      { forget: true },
    );
    const protectedBefore = memoryHash(cold.continuity);
    seedFoundingCircumstances(cold, situations, knowers, at);
    assert.equal(
      memoryHash(cold.continuity),
      protectedBefore,
      "native replay never re-teaches a forgotten founding fact",
    );
    assert.equal(continuityViews(cold.continuity, holder, at, new Set()).length, 0);
  } finally {
    storage.release();
  }
});
