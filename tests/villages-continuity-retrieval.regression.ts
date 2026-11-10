// Test cases: continuity-retrieval/large-room, continuity-retrieval/required-overflow, continuity-retrieval/fair-private-initiative, continuity-retrieval/minimum-initiative, continuity-retrieval/recent-offer, continuity-retrieval/new-arrival-fairness
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import type {
  ContinuityAdmission,
  ContinuityEvidence,
  ContinuityHolder,
} from "../packages/villages/src/server/domain/models/continuity-model.js";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
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
import { appendEpisode, emptyEpisodes } from "../packages/villages/src/server/domain/rules/episodes.js";
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

const accepted = (id: string, holders: (typeof mara)[], offered: AcceptedEpisode["offered"] = []): AcceptedEpisode => ({
  format: 1,
  id,
  seed: "world",
  submissionId: id,
  operationId: "operation-" + id,
  capturedAt: at,
  acceptedAt: at,
  responseDigest: memoryHash(id),
  admittedContinuityRevision: 0,
  privateInput: "Good morning.",
  actors: holders.map(({ id, incarnation }) => ({ id, incarnation, zoneId: "parlor" })),
  segments: [],
  grounding: [],
  continuityVersionIds: [],
  commandReceipts: [],
  dependencies: {},
  offered,
});
let motives = emptyContinuity();
for (let i = 0; i < 20; i++) {
  const source: ContinuityEvidence = {
    ...observed,
    id: "wish-" + i,
    kind: "self",
    actorId: "mara",
    perceptions: [],
    excerpt: "A private desire " + i,
  };
  motives = applyContinuityWrite(
    motives,
    { id: "wish", holders: [mara], owner: mara, class: "desire", text: source.excerpt, sourceIds: [source.id] },
    { ...context("wish-" + i), sources: [source] },
  );
}

await runCase("continuity-retrieval/fair-private-initiative", () => {
  const state = motives;
  const seen = new Set<string>();
  let history = emptyEpisodes();
  for (let turn = 0; turn < 10; turn++) {
    const packet = selectActorContinuity(state, history, [mara, leo], at, { query: "", bytes: 2000, requiredIds: [] });
    assert.ok(packet.bytes <= 2000);
    assert.equal(packet.packet.entries.length, 2);
    assert.equal(
      packet.packet.entries[0].for,
      "mara",
      "a fair initiative slot does not disclose Mara's private desire to Leo",
    );
    for (const entry of packet.packet.entries) seen.add(entry.id);
    assert.deepEqual(
      selectActorContinuity(state, history, [mara, leo], at, { query: "", bytes: 2000, requiredIds: [] }).offered,
      packet.offered,
      "preparation alone does not advance accepted offers",
    );
    const own = accepted("mara-turn-" + turn, [mara], packet.offered);
    history = appendEpisode(history, own, "world");
    assert.strictEqual(appendEpisode(history, own, "world"), history);
    for (let gap = 0; gap < 19; gap++)
      history = appendEpisode(history, accepted("unrelated-" + turn + "-" + gap, [leo]), "world");
  }
  assert.equal(
    seen.size,
    20,
    "twenty motives receive fair exposure within ten accepted Mara opportunities despite twenty global exchanges per visit",
  );
  assert.deepEqual(
    selectActorContinuity(state, emptyEpisodes(), [leo], at, { query: "private desire", bytes: 2000, requiredIds: [] })
      .packet.entries,
    [],
  );
});

await runCase("continuity-retrieval/minimum-initiative", () => {
  let state = emptyContinuity();
  for (const [holder, length] of [
    [mara, 1100],
    [leo, 700],
  ] as const) {
    const source: ContinuityEvidence = {
      ...observed,
      id: "long-" + holder.id,
      kind: "self",
      actorId: holder.id,
      perceptions: [],
      excerpt: "A".repeat(length),
    };
    state = applyContinuityWrite(
      state,
      { id: "motive", holders: [holder], owner: holder, class: "desire", text: source.excerpt, sourceIds: [source.id] },
      { ...context(holder.id), sources: [source] },
    );
  }
  const packet = selectActorContinuity(state, emptyEpisodes(), [mara, leo], at, {
    query: "",
    bytes: 2400,
    requiredIds: [],
  });
  assert.equal(packet.fair.length, 2);
  assert.deepEqual(
    packet.packet.entries.map((row) => row.for),
    ["mara", "leo"],
  );
  assert.throws(
    () => selectActorContinuity(state, emptyEpisodes(), [mara, leo], at, { query: "", bytes: 1900, requiredIds: [] }),
    /minimum resident initiative does not fit before generation/,
  );
  let history = emptyEpisodes();
  const seen = new Set<string>();
  for (let turn = 0; turn < 20; turn++) {
    const selected = selectActorContinuity(motives, history, [mara], at, { query: "", bytes: 240, requiredIds: [] });
    assert.equal(selected.packet.entries.length, 1);
    seen.add(selected.packet.entries[0].id);
    history = appendEpisode(history, accepted("one-slot-" + turn, [mara], selected.offered), "world");
  }
  assert.equal(seen.size, 20, "one-slot fitting retains the N-opportunity fairness bound");
});

await runCase("continuity-retrieval/recent-offer", () => {
  const player = { ...mara, id: "player" },
    episode = accepted("offer", [mara, player]);
  episode.privateInput = "Let's visit the fair Saturday, only if Delia comes and the north path is open.";
  const source: ContinuityEvidence = {
    id: "offer-source",
    seed: "world",
    episodeId: episode.id,
    unitId: "input",
    fingerprint: memoryHash(episode.privateInput),
    excerpt: episode.privateInput,
    range: { start: 0, end: episode.privateInput.length },
    kind: "speech",
    actorId: "player",
    act: "offer",
    perceptions: [{ actorId: "mara", channel: "words", text: episode.privateInput }],
  };
  const state = applyContinuityWrite(
    motives,
    {
      id: "offer",
      holders: [player, mara],
      class: "commitment",
      text: episode.privateInput,
      sourceIds: [source.id],
      offer: { proposer: "player", participants: ["player", "mara"] },
    },
    { ...context(episode.operationId), episodeId: episode.id, sources: [source] },
  );
  const root = state.records.at(-1)!;
  episode.continuityVersionIds = Object.values(root.heads).map((head) => head.versionId);
  episode.grounding = [source];
  const history = appendEpisode(emptyEpisodes(), episode, "world");
  const packet = selectActorContinuity(state, history, [player, mara], at, {
    query: "Yes.",
    bytes: 2800,
    requiredIds: [],
  });
  const offer = packet.packet.entries.find((row) => row.id === root.id && row.for === "mara")!;
  assert.equal(offer.text, episode.privateInput);
  assert.equal(offer.offer?.contributions[0].by, "player");
  assert.equal(offer.offer?.contributions[0].sources[0].excerpt, episode.privateInput);
  assert.ok(
    packet.supplied.some((target) => target.id === root.id),
    "the recent shared offer is a supplied acceptance target without lexical overlap",
  );
  assert.ok(
    packet.fair.some((target) => target.id !== root.id),
    "a pending offer does not consume Mara's independent fair slot",
  );
});

await runCase("continuity-retrieval/new-arrival-fairness", () => {
  let state = emptyContinuity(),
    history = emptyEpisodes(),
    oldId = "",
    oldOffers = 0;
  function addMotive(id: string) {
    const birth = accepted("birth-" + id, [mara]);
    const source: ContinuityEvidence = {
      ...observed,
      id: "self-" + id,
      actorId: "mara",
      kind: "self",
      perceptions: [],
      excerpt: "Private motive " + id,
    };
    state = applyContinuityWrite(
      state,
      { id: "motive", holders: [mara], owner: mara, class: "desire", text: source.excerpt, sourceIds: [source.id] },
      { ...context(birth.operationId), sources: [source] },
    );
    const record = state.records.at(-1)!;
    birth.continuityVersionIds = Object.values(record.heads).map((head) => head.versionId);
    history = appendEpisode(history, birth, "world");
    return record.id;
  }
  oldId = addMotive("old");
  for (let turn = 0; turn < 20; turn++) {
    const packet = selectActorContinuity(state, history, [mara], at, { query: "", bytes: 2000, requiredIds: [] });
    if (packet.offered.some((offer) => offer.ids.includes(oldId))) oldOffers++;
    history = appendEpisode(history, accepted("opportunity-" + turn, [mara], packet.offered), "world");
    addMotive("new-a-" + turn);
    addMotive("new-b-" + turn);
  }
  assert.ok(oldOffers > 1, "continuous new arrivals cannot permanently outrank retained older motives");
});

console.log(
  "Continuity retrieval: 600-entry rooms, repeated edits, supplied targets, preflight overflow and private fair initiative passed without providers.",
);
