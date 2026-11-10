// Test cases: continuity-library/private-revisions, continuity-library/correction, continuity-library/incarnation, continuity-library/current-contract
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import {
  continuityMemoryLibrary,
  inspectContinuityMemory,
  changeContinuityMemory,
} from "../packages/villages/src/server/domain/rules/continuity-library.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";

const at = "2026-11-09T12:00:00.000Z";
function fixture() {
  const state = { ...defaultVillageState(), seed: "world", setupAt: at };
  state.villagers = [
    { characterId: "mara", incarnation: "one", cardSnapshot: { name: "Mara" } },
  ] as VillageState["villagers"];
  function fact(id: string, witnesses = ["player"], text = id) {
    retainNativeFact(state, { id, kind: "project", targetId: id, revision: 1, text, witnesses }, at);
  }
  fact("public-one");
  fact("public-two");
  return { state, fact };
}

await runCase("continuity-library/private-revisions", () => {
  const { state, fact } = fixture();
  const first = continuityMemoryLibrary(state, { limit: 1 }, at);
  assert.equal(first.total, 2);
  assert.ok(first.next);
  fact("private-only", ["mara"], "Mara received a private native notice.");
  assert.deepEqual(
    continuityMemoryLibrary(state, { limit: 1 }, at),
    first,
    "private knowledge changes cannot change public counts, revisions, content or cursors",
  );
  assert.equal(continuityMemoryLibrary(state, { limit: 1, cursor: first.next }, at).entries.length, 1);
  assert.equal(
    inspectContinuityMemory(state, first.entries[0].id, "mara", false, at).target,
    undefined,
    "ordinary source inspection exposes no global root or other-holder revision",
  );
  assert.deepEqual(
    first.entries[0].knownBy.map((row) => row.id),
    ["player"],
  );
});

await runCase("continuity-library/correction", () => {
  const { state, fact } = fixture();
  fact("shared", ["player", "mara"], "The roof project was completed.");
  const entry = continuityMemoryLibrary(state, { inspection: true, characterId: "mara" }, at).entries[0];
  const inspected = inspectContinuityMemory(state, entry.id, "mara", true, at);
  assert.deepEqual(inspected.knowers.map((row) => row.person.id).sort(), ["mara", "player"]);
  const input = {
    seed: "world",
    operationId: "correct",
    target: inspected.target!,
    knowers: ["mara"],
    text: "Mara remembers that only the porch roof was repaired.",
  };
  state.continuity = changeContinuityMemory(state, entry.id, input, "repair", at);
  const revised = state.continuity;
  assert.equal(
    changeContinuityMemory(state, entry.id, input, "repair", at),
    revised,
    "an uncertain response replays the exact administrative operation",
  );
  assert.equal(
    continuityMemoryLibrary(state, { inspection: true, characterId: "mara" }, at).entries[0].text,
    input.text,
  );
  const player = continuityMemoryLibrary(state, {}, at).entries.find((row) => row.id === entry.id)!;
  assert.equal(player.text, "The roof project was completed.");
  assert.equal(player.playerCorrection, false);
  assert.throws(
    () =>
      changeContinuityMemory(state, entry.id, { ...input, operationId: "stale", text: "A stale edit." }, "repair", at),
    /target changed/,
  );
  const corrected = inspectContinuityMemory(state, entry.id, "mara", true, at);
  state.continuity = changeContinuityMemory(
    state,
    entry.id,
    { seed: "world", operationId: "forget", target: corrected.target!, knowers: ["mara"] },
    "forget",
    at,
  );
  assert.equal(
    continuityMemoryLibrary(state, { inspection: true, characterId: "mara" }, at).entries[0].forgotten,
    true,
  );
  assert.equal(continuityMemoryLibrary(state, {}, at).entries.find((row) => row.id === entry.id)?.text, player.text);
  assert.equal(state.episodes.records.length, 3, "administration creates no fictional event or new native operation");
});

await runCase("continuity-library/incarnation", () => {
  const { state, fact } = fixture();
  fact("old-resident", ["mara"]);
  const inspected = inspectContinuityMemory(state, state.continuity.records.at(-1)!.id, "mara", true, at);
  const committed = {
    seed: "world",
    operationId: "committed-before-departure",
    target: inspected.target!,
    knowers: ["mara"],
  };
  state.continuity = changeContinuityMemory(state, inspected.entry.id, committed, "forget", at);
  state.villagers = [];
  assert.equal(
    changeContinuityMemory(state, inspected.entry.id, committed, "forget", at),
    state.continuity,
    "an exact committed operation remains acknowledged after its holder leaves",
  );
  state.villagers = [
    { characterId: "mara", incarnation: "one", cardSnapshot: { name: "Mara" } },
  ] as VillageState["villagers"];
  state.villagers[0].incarnation = "replacement";
  assert.equal(
    changeContinuityMemory(state, inspected.entry.id, committed, "forget", at),
    state.continuity,
    "an exact committed operation remains acknowledged after re-admission without teaching its replacement",
  );
  assert.deepEqual(continuityMemoryLibrary(state, { inspection: true, characterId: "mara" }, at).entries, []);
  assert.throws(
    () =>
      changeContinuityMemory(
        state,
        inspected.entry.id,
        {
          seed: "world",
          operationId: "old-request",
          target: inspected.target!,
          knowers: ["mara"],
        },
        "forget",
        at,
      ),
    /holder changed/,
  );
});

await runCase("continuity-library/current-contract", () => {
  const { state } = fixture();
  const inspected = inspectContinuityMemory(state, state.continuity.records[0].id, "player", true, at);
  assert.throws(
    () =>
      changeContinuityMemory(
        state,
        inspected.entry.id,
        {
          seed: "world",
          operationId: "obsolete-contract",
          expectedCollectionRevision: 1,
          target: inspected.target!,
          knowers: ["player"],
        } as any,
        "forget",
        at,
      ),
    /unknown field/,
  );
  assert.throws(
    () =>
      changeContinuityMemory(
        state,
        inspected.entry.id,
        {
          seed: "world",
          operationId: "teach",
          target: inspected.target!,
          knowers: ["mara"],
          text: "Teach an absent holder.",
        },
        "repair",
        at,
      ),
    /holder changed/,
  );
});
