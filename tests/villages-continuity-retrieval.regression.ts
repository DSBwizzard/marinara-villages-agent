// Test cases: continuity-retrieval/large-room, continuity-retrieval/required-overflow, continuity-retrieval/fair-private-initiative
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import type {
  ContinuityAdmission,
  ContinuityEvidence,
  ContinuityHolder,
} from "../packages/villages/src/server/domain/models/continuity-model.js";
import type { EpisodeCollection } from "../packages/villages/src/server/domain/models/episode-model.js";
import {
  applyContinuityWrite,
  continuityHolderKey,
  continuityProtectionUnits,
  continuityViews,
  emptyContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import {
  selectActorContinuity,
  selectRoomContinuity,
} from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import { emptyEpisodes } from "../packages/villages/src/server/domain/rules/episodes.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";

const at = "2026-11-09T12:00:00.000Z";
const room: Extract<ContinuityHolder, { kind: "room" }> = { kind: "room", placeId: "home", zoneId: "parlor" };
const mara: Extract<ContinuityHolder, { kind: "actor" }> = { kind: "actor", id: "mara", incarnation: "one" };
const leo: typeof mara = { ...mara, id: "leo" };
const observed: ContinuityEvidence = {
  id: "outcome",
  seed: "world",
  episodeId: "decorate",
  unitId: "narration",
  fingerprint: memoryHash("The room is decorated."),
  excerpt: "The room is decorated.",
  kind: "observation",
  actorId: "player",
  perceptions: [{ actorId: "mara", channel: "sight", text: "The room is decorated." }],
};
const context = (operationId: string): ContinuityAdmission => ({
  seed: "world",
  operationId,
  episodeId: "decorate",
  at,
  actors: [{ id: "player", incarnation: "one" }, mara, leo],
  room,
  sources: [observed],
  supplied: [],
  protectedRoots: [],
});
const currentRoom = (state: ReturnType<typeof emptyContinuity>) =>
  continuityViews(state, room, at, continuityProtectionUnits(state, room, new Map()));
let decorated = emptyContinuity();
for (let i = 0; i < 600; i++)
  decorated = applyContinuityWrite(
    decorated,
    {
      id: "decoration",
      holders: [room],
      text:
        i === 0
          ? "A quiet parlor with pale walls and wooden beams."
          : i === 60
            ? "A blue table stands beneath the east window with two chairs."
            : `Decoration ${i}: an embroidered panel showing a different local flower in its own frame.`,
      sourceIds: [observed.id],
    },
    context("decorate-" + i),
  );

await runCase("continuity-retrieval/large-room", () => {
  const before = currentRoom(decorated),
    table = before[60];
  const selected = selectRoomContinuity(decorated, emptyEpisodes(), room, at, {
    query: "Paint the blue table green",
    bytes: 1600,
    requiredIds: [],
    wholeRoom: false,
  });
  assert.equal(selected.packet.partial, true);
  assert.equal(selected.packet.total, 600);
  assert.ok(selected.bytes <= 1600 && selected.packet.entries.some((row) => row.id === table.id));
  assert.ok(
    selected.packet.entries.every(
      (row) => row.text.length > 0 && row.text === before.find((prior) => prior.id === row.id)?.version.text,
    ),
    "selected entries are complete, never truncated summaries",
  );
  let changed = decorated;
  for (let i = 0; i < 80; i++) {
    const packet = selectRoomContinuity(changed, emptyEpisodes(), room, at, {
      query: "table",
      bytes: 1600,
      requiredIds: [table.id],
      wholeRoom: false,
    });
    const target = packet.supplied.find((row) => row.id === table.id)!;
    changed = applyContinuityWrite(
      changed,
      {
        id: "paint",
        holders: [room],
        target,
        text: `The table is green shade ${i}, beneath the east window with two chairs.`,
        sourceIds: [observed.id],
      },
      { ...context("repaint-" + i), supplied: packet.supplied },
    );
  }
  const after = currentRoom(changed);
  assert.equal(
    after.length,
    600,
    "repeated changes replace one current entry without piling up contradictory overlays",
  );
  assert.equal(
    after.find((row) => row.id === table.id)?.version.text,
    "The table is green shade 79, beneath the east window with two chairs.",
  );
  for (const row of before.filter((row) => row.id !== table.id))
    assert.equal(
      after.find((after) => after.id === row.id)?.version.id,
      row.version.id,
      "unrelated entries remain exact",
    );
  const unseen = before.find((row) => !selected.supplied.some((target) => target.id === row.id))!;
  const unauthorized = {
    id: unseen.id,
    recordRevision: unseen.recordRevision,
    heads: { [continuityHolderKey(room)]: unseen.headRevision },
  };
  assert.throws(
    () =>
      applyContinuityWrite(
        decorated,
        {
          id: "unseen",
          holders: [room],
          target: unauthorized,
          text: "Changed without being supplied.",
          sourceIds: [observed.id],
        },
        { ...context("unseen"), supplied: selected.supplied },
      ),
    /not supplied/,
  );
  assert.throws(
    () =>
      applyContinuityWrite(
        decorated,
        {
          id: "duplicate",
          holders: [room],
          target: selected.supplied.find((row) => row.id === table.id),
          text: before[3].version.text,
          sourceIds: [observed.id],
        },
        { ...context("duplicate"), supplied: selected.supplied },
      ),
    /duplicate current room/,
  );
});

await runCase("continuity-retrieval/required-overflow", () => {
  let requests = 0;
  assert.throws(() => {
    selectRoomContinuity(decorated, emptyEpisodes(), room, at, {
      query: "whole room",
      bytes: 1600,
      requiredIds: [],
      wholeRoom: true,
    });
    requests++;
  }, /does not fit before generation/);
  assert.equal(requests, 0);
  assert.equal(currentRoom(decorated).length, 600);
});

await runCase("continuity-retrieval/fair-private-initiative", () => {
  let state = emptyContinuity();
  for (let i = 0; i < 20; i++) {
    const source: ContinuityEvidence = {
      ...observed,
      id: "wish-" + i,
      kind: "self",
      actorId: "mara",
      perceptions: [],
      excerpt: "A private desire " + i,
    };
    state = applyContinuityWrite(
      state,
      { id: "wish", holders: [mara], class: "desire", text: source.excerpt, sourceIds: [source.id] },
      { ...context("wish-" + i), sources: [source] },
    );
  }
  const seen = new Set<string>();
  for (let turn = 0; turn < 20; turn++) {
    const history: EpisodeCollection = {
      format: 1,
      revision: turn,
      records: Array.from({ length: turn }, (_, i) => ({
        format: 1,
        id: "ordinary-" + i,
        seed: "world",
        submissionId: "ordinary-" + i,
        operationId: "ordinary-" + i,
        capturedAt: at,
        acceptedAt: at,
        responseDigest: memoryHash(i),
        privateInput: "Good morning.",
        actors: [{ ...mara, zoneId: "parlor" }],
        segments: [],
        grounding: [],
        continuityVersionIds: [],
        commandReceipts: [],
        dependencies: {},
      })),
    };
    const packet = selectActorContinuity(state, history, [mara, leo], at, { query: "", bytes: 2000, requiredIds: [] });
    assert.ok(packet.bytes <= 2000);
    assert.equal(packet.packet.entries.length, 1);
    assert.equal(
      packet.packet.entries[0].for,
      "mara",
      "a fair initiative slot does not disclose Mara's private desire to Leo",
    );
    seen.add(packet.packet.entries[0].id);
  }
  assert.equal(
    seen.size,
    20,
    "ordinary exchanges rotate standing opportunities without a new model pass or a new continuity write",
  );
  assert.deepEqual(
    selectActorContinuity(state, emptyEpisodes(), [leo], at, { query: "private desire", bytes: 2000, requiredIds: [] })
      .packet.entries,
    [],
  );
});

console.log(
  "Continuity retrieval: 600-entry rooms, repeated edits, supplied targets, preflight overflow and private fair initiative passed without providers.",
);
