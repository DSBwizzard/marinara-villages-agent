// Test cases: continuity/individual-replacement, continuity/perception, continuity/cross-scene-offer, continuity/withdrawal, continuity/qualified-offer, continuity/room-sequence, continuity/room-expiry, continuity/protection, continuity/desire-closure, continuity/offer-privacy, continuity/concealed-observations, continuity/room-current-evidence, continuity/holder-admission, continuity/parent-protection, continuity/owned-knowledge, continuity/offer-identity, continuity/initial-closure
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import type {
  ContinuityAdmission,
  ContinuityCollection,
  ContinuityEvidence,
  ContinuityHolder,
  ContinuityTarget,
  ContinuityWrite,
} from "../packages/villages/src/server/domain/models/continuity-model.js";
import {
  applyContinuityWrite,
  continuityHolderKey,
  continuityProtectionUnits,
  continuityViews,
  continuityGuidesHolder,
  emptyContinuity,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { readContinuity } from "../packages/villages/src/server/domain/decoding/continuity-codec.js";
import { selectActorContinuity } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import { emptyEpisodes } from "../packages/villages/src/server/domain/rules/episodes.js";

const at = "2026-11-09T12:00:00.000Z";
const actor = (id: string): Extract<ContinuityHolder, { kind: "actor" }> => ({ kind: "actor", id, incarnation: "one" });
const player = actor("player"),
  mara = actor("mara"),
  leo = actor("leo");
const identity = (id: string) => [player, mara, leo].find((actor) => actor.id === id);
const room: ContinuityHolder & { kind: "room" } = { kind: "room", placeId: "home", zoneId: "parlor" };
assert.throws(
  () =>
    applyContinuityWrite(
      emptyContinuity(),
      { id: "episode-123", holders: [mara], sourceIds: [], text: "A fact." },
      {
        seed: "world",
        operationId: "narration-abandoned",
        episodeId: "episode-123",
        at,
        actors: [{ id: "mara", incarnation: "one" }],
        sources: [],
        supplied: [],
        protectedRoots: [],
      },
    ),
  /reserved narration receipt namespace/,
);
function source(
  id: string,
  actorId: string,
  text: string,
  episodeId = "scene-1",
  overrides: Partial<ContinuityEvidence> = {},
): ContinuityEvidence {
  return {
    id,
    seed: "world",
    episodeId,
    fingerprint: memoryHash([id, text]),
    unitId: id,
    excerpt: text,
    kind: "speech",
    actorId,
    perceptions: ["player", "mara", "leo"].map((actorId) => ({ actorId, channel: "words", text })),
    ...overrides,
  };
}
function target(state: ContinuityCollection, id: string, holders: ContinuityHolder[]): ContinuityTarget {
  const row = state.records.find((row) => row.id === id)!;
  return {
    id,
    recordRevision: row.revision,
    heads: Object.fromEntries(
      holders.map((holder) => {
        const key = continuityHolderKey(holder);
        return [key, row.heads[key]?.revision ?? 0];
      }),
    ),
  };
}
function context(
  operationId: string,
  sources: ContinuityEvidence[],
  supplied: ContinuityTarget[] = [],
  episodeId = "scene-1",
): ContinuityAdmission {
  return {
    seed: "world",
    operationId,
    episodeId,
    at,
    actors: ["player", "mara", "leo"].map((id) => ({ id, incarnation: "one" })),
    sourceActors: Object.fromEntries(
      sources.map((source) => [source.episodeId, ["player", "mara", "leo"].map((id) => ({ id, incarnation: "one" }))]),
    ),
    room,
    sources,
    supplied,
    protectedRoots: [],
  };
}
function apply(
  state: ContinuityCollection,
  write: ContinuityWrite,
  evidence: ContinuityEvidence[],
  operationId: string,
  episodeId = "scene-1",
) {
  const result = applyContinuityWrite(
    state,
    write,
    context(operationId, evidence, write.target ? [write.target] : [], episodeId),
  );
  readContinuity(result, "world");
  return result;
}
const rows = (state: ContinuityCollection, holder = mara, when = at) =>
  continuityViews(state, holder, when, continuityProtectionUnits(state, holder, new Map()));

await runCase("continuity/owned-knowledge", () => {
  const said = source("wish-spoken", "mara", "I want to sail a boat of my own.");
  const owned: ContinuityWrite = {
    id: "wish",
    holders: [player, mara],
    owner: mara,
    class: "desire",
    text: said.excerpt,
    sourceIds: [said.id],
  };
  const state = apply(emptyContinuity(), owned, [said], "shared-wish"),
    root = state.records[0];
  const maraView = rows(state, mara)[0],
    playerView = rows(state, player)[0];
  assert.deepEqual(maraView.owner, mara);
  assert(continuityGuidesHolder(maraView));
  assert(!continuityGuidesHolder(playerView));
  const initial = selectActorContinuity(state, emptyEpisodes(), [mara, player], at, {
    query: "",
    bytes: 4000,
    requiredIds: [],
    identity,
  });
  assert.deepEqual(initial.offered, [{ holder: mara, ids: [root.id] }]);
  assert.equal(initial.packet.entries[0].owner, "mara");
  const retold = source("retold", "player", "Mara wants to sail a boat of her own.", "scene-2", {
    perceptions: [{ actorId: "leo", channel: "words", text: "Mara wants to sail a boat of her own." }],
  });
  const supplied: ContinuityTarget = {
    id: root.id,
    recordRevision: root.revision,
    heads: { [continuityHolderKey(leo)]: 0 },
  };
  const admission = { ...context("disclose", [retold], [supplied], "scene-2"), actors: [player, leo] };
  const disclosed = applyContinuityWrite(
    state,
    {
      id: "learn",
      holders: [leo],
      target: supplied,
      class: "desire",
      text: retold.excerpt,
      current: true,
      sourceIds: [retold.id],
    },
    admission,
  );
  assert.deepEqual(disclosed.records[0].owner, mara, "later disclosure preserves the absent owner's incarnation");
  assert.deepEqual(
    disclosed.records[0].heads[continuityHolderKey(mara)],
    root.heads[continuityHolderKey(mara)],
    "telling Leo cannot update or reteach Mara",
  );
  assert.equal(
    selectActorContinuity(disclosed, emptyEpisodes(), [leo], at, {
      query: "boat",
      bytes: 4000,
      requiredIds: [],
      identity,
    }).offered.length,
    0,
  );
  assert(!continuityGuidesHolder(rows(disclosed, leo)[0]));
  for (const currentOwner of [mara, { ...mara, incarnation: "replacement" }, undefined]) {
    const packet = selectActorContinuity(disclosed, emptyEpisodes(), [leo], at, {
      query: "boat",
      bytes: 4000,
      requiredIds: [],
      identity: (id) => (id === "mara" ? currentOwner : identity(id)),
    }).packet;
    assert.equal(
      packet.entries[0].pastOwner,
      currentOwner?.incarnation === mara.incarnation ? undefined : true,
      "an offstage owner is resolved independently from the selected holders",
    );
  }
  assert.throws(
    () =>
      applyContinuityWrite(
        state,
        { ...owned, id: "steal", owner: leo, target: supplied, holders: [leo], sourceIds: [retold.id] },
        admission,
      ),
    /ownership cannot change/,
  );
  const raw = JSON.parse(JSON.stringify(disclosed));
  delete raw.records[0].owner;
  assert.throws(() => readContinuity(raw, "world"), /no owner/);
  const repaired = protectContinuity(disclosed, target(disclosed, root.id, [leo]), [leo], "correct-owner-view", at, {
    text: "Mara wants a boat of her own, when she is ready.",
  });
  assert.deepEqual(rows(repaired, leo)[0].owner, mara);
});
await runCase("continuity/individual-replacement", () => {
  const first = source("report", "player", "Rowan taught me to repair chairs.");
  const original = apply(
    emptyContinuity(),
    {
      id: "learn",
      holders: [mara, leo],
      sourceIds: [first.id],
      text: "The player reports that Rowan taught them chair repair.",
      class: "information",
    },
    [first],
    "one",
  );
  const id = original.records[0].id;
  const correction = source("correction", "player", "Rowan taught me only the finishing work.", "scene-2", {
    perceptions: [{ actorId: "mara", channel: "words", text: "Rowan taught me only the finishing work." }],
  });
  const changed = apply(
    original,
    {
      id: "correct",
      holders: [mara],
      sourceIds: [correction.id],
      target: target(original, id, [mara]),
      text: "The player says Rowan taught only the finishing work.",
    },
    [correction],
    "two",
    "scene-2",
  );
  assert.equal(rows(changed)[0].version.text, "The player says Rowan taught only the finishing work.");
  assert.equal(rows(changed, leo)[0].version.text, rows(original, leo)[0].version.text);
  assert.equal(original.versions.length, 2, "previous state remains immutable");
  assert.equal(changed.versions.length, 3, "earlier evidence is retained rather than overwritten");
});

await runCase("continuity/perception", () => {
  const thought = source("thought", "player", "I worry Mara will leave.", "scene-1", {
    kind: "private",
    perceptions: [],
  });
  assert.throws(
    () =>
      apply(
        emptyContinuity(),
        { id: "leak", holders: [mara], text: "The player worries Mara will leave.", sourceIds: [thought.id] },
        [thought],
        "private",
      ),
    /unwitnessed/,
  );
  const noise = source("noise", "leo", "Leo secretly hides a letter while a floorboard creaks.", "scene-1", {
    kind: "observation",
    perceptions: [{ actorId: "mara", channel: "sound-only", text: "A floorboard creaks nearby." }],
  });
  const heard = apply(
    emptyContinuity(),
    { id: "sound", holders: [mara], text: "Mara heard a floorboard creak nearby.", sourceIds: [noise.id] },
    [noise],
    "noise",
  );
  const evidence = rows(heard)[0].version.sources[0];
  assert.equal(evidence.excerpt, "A floorboard creaks nearby.");
  assert.equal(evidence.actorId, undefined, "the unheard identity is not revealed by provenance");
  assert.ok(!JSON.stringify(rows(heard)).includes("secretly hides"));
  const self = source("self", "mara", "Mara wants to sail a boat of her own.", "scene-1", {
    kind: "self",
    perceptions: [],
  });
  const desire = apply(
    emptyContinuity(),
    { id: "wish", holders: [mara], owner: mara, class: "desire", text: self.excerpt, sourceIds: [self.id] },
    [self],
    "wish",
  );
  assert.equal(rows(desire)[0].current, true);
  assert.deepEqual(rows(desire, player), [], "a private desire is not the player's knowledge");
  assert.throws(
    () =>
      apply(
        emptyContinuity(),
        { id: "share", holders: [player], class: "desire", text: self.excerpt, sourceIds: [self.id] },
        [self],
        "share",
      ),
    /unwitnessed/,
  );
});

function offered() {
  const terms = "Visit the fair together on Saturday only if Delia comes and the north path is open.";
  const proposal = source("proposal", "player", terms, "scene-1", { act: "offer" });
  const state = apply(
    emptyContinuity(),
    {
      id: "fair",
      holders: [player, mara],
      class: "commitment",
      text: terms,
      offer: { proposer: "player", participants: ["player", "mara"] },
      sourceIds: [proposal.id],
    },
    [proposal],
    "offer",
  );
  return { state, proposal, id: state.records[0].id, terms };
}

await runCase("continuity/cross-scene-offer", () => {
  const offer = offered();
  const yes = source("yes", "mara", "Yes, Saturday, with Delia and the path open.", "scene-2", { act: "accept" });
  const write: ContinuityWrite = {
    id: "accept",
    holders: [player, mara],
    accept: "mara",
    target: target(offer.state, offer.id, [player, mara]),
    sourceIds: [yes.id],
  };
  const accepted = apply(offer.state, write, [yes], "later", "scene-2");
  for (const holder of [player, mara]) {
    const view = rows(accepted, holder)[0];
    assert.equal(view.offer?.state, "accepted");
    assert.equal(view.version.text, offer.terms, "the full original terms are retained without restatement");
  }
  assert.equal(accepted.records[0].offer?.events[0].sources[0].id, offer.proposal.id);
  assert.strictEqual(
    apply(accepted, write, [yes], "later", "scene-2"),
    accepted,
    "replay adds no duplicate acceptance",
  );
  assert.equal(rows(offer.state)[0].offer?.state, "offered");
  assert.throws(
    () => apply(offer.state, write, [yes], "stale", "scene-3"),
    /actual deciding speech/,
    "historical acceptance cannot be laundered into a new current decision",
  );
});

await runCase("continuity/offer-identity", () => {
  const offer = offered(),
    replacement = { ...mara, incarnation: "two" };
  for (const currentParty of [mara, replacement, undefined]) {
    const packet = selectActorContinuity(offer.state, emptyEpisodes(), [player], at, {
      query: "fair",
      bytes: 8000,
      requiredIds: [],
      identity: (id) => (id === "mara" ? currentParty : identity(id)),
    }).packet;
    assert.deepEqual(
      packet.entries[0].offer?.unavailableParties,
      currentParty?.incarnation === mara.incarnation ? undefined : ["mara"],
      "absence from attendance does not change the intended party identity",
    );
  }
  assert.deepEqual(offer.state.records[0].offer?.participants, [
    { id: "player", incarnation: "one" },
    { id: "mara", incarnation: "one" },
  ]);
  const told = source("retold-offer", "player", offer.terms, "scene-2"),
    supplied = target(offer.state, offer.id, [player, replacement]),
    admission = { ...context("learn-old-offer", [told], [supplied], "scene-2"), actors: [player, replacement] };
  admission.sourceActors!["scene-2"] = admission.actors;
  const learned = applyContinuityWrite(
    offer.state,
    {
      id: "learn",
      target: supplied,
      holders: [replacement],
      text: offer.terms,
      class: "commitment",
      current: true,
      sourceIds: [told.id],
    },
    admission,
  );
  readContinuity(learned, "world");
  const selected = selectActorContinuity(learned, emptyEpisodes(), [replacement, player], at, {
    query: "fair",
    bytes: 8000,
    requiredIds: [],
    identity: (id) => (id === "mara" ? replacement : identity(id)),
  });
  assert(!continuityGuidesHolder(rows(learned, replacement)[0]));
  assert(!selected.offered.some((row) => row.holder.incarnation === "two"));
  assert.deepEqual(selected.packet.entries.find((row) => row.for === "mara")?.offer?.unavailableParties, ["mara"]);
  for (const act of ["accept", "refuse", "withdraw"] as const) {
    const decision = source("decision-" + act, "mara", "I " + act + ".", "scene-3", { act }),
      supplied = target(learned, offer.id, [replacement]),
      admission = { ...context("decision-" + act, [decision], [supplied], "scene-3"), actors: [player, replacement] };
    admission.sourceActors!["scene-3"] = admission.actors;
    assert.throws(
      () =>
        applyContinuityWrite(
          learned,
          {
            id: act,
            target: supplied,
            holders: [replacement],
            sourceIds: [decision.id],
            ...(act === "accept"
              ? { accept: "mara" }
              : {
                  closeOffer: { by: "mara", reason: act === "refuse" ? ("refused" as const) : ("withdrawn" as const) },
                }),
          },
          admission,
        ),
      /not a party incarnation/,
    );
  }
  const corrected = protectContinuity(learned, target(learned, offer.id, [replacement]), [replacement], "correct", at, {
    text: offer.terms,
  });
  assert(!rows(corrected, replacement)[0].offer);
  assert(!continuityGuidesHolder(rows(corrected, replacement)[0]), "a correction grants no party rights or initiative");
  const proposal = source("absent-proposal", "player", offer.terms, "scene-4", { act: "offer", perceptions: [] }),
    absent = applyContinuityWrite(
      emptyContinuity(),
      {
        id: "absent-party",
        holders: [player],
        class: "commitment",
        text: offer.terms,
        offer: { proposer: "player", participants: ["player", "mara"] },
        sourceIds: [proposal.id],
      },
      {
        ...context("absent-party", [proposal], [], "scene-4"),
        actors: [player],
        subjects: [{ id: "mara", incarnation: "one" }],
      },
    );
  assert.deepEqual(absent.records[0].offer?.participants[1], { id: "mara", incarnation: "one" });
  assert(!absent.records[0].heads[continuityHolderKey(mara)], "an intended party need not have heard the offer yet");
  readContinuity(absent, "world");
  const oldShape = structuredClone(absent);
  (oldShape.records[0].offer as any).participants = ["player", "mara"];
  assert.throws(() => readContinuity(oldShape, "world"), /expected object/);
});

await runCase("continuity/withdrawal", () => {
  const offer = offered();
  const withdrawal = source("withdraw", "player", "I withdraw my invitation.", "scene-2", {
    act: "withdraw",
    perceptions: [],
  });
  const withdrawn = apply(
    offer.state,
    {
      id: "withdraw",
      holders: [player],
      target: target(offer.state, offer.id, [player]),
      closeOffer: { by: "player", reason: "withdrawn" },
      sourceIds: [withdrawal.id],
    },
    [withdrawal],
    "withdraw",
    "scene-2",
  );
  assert.equal(rows(withdrawn, player)[0].offer?.state, "withdrawn");
  assert.equal(
    rows(withdrawn, mara)[0].offer?.state,
    "offered",
    "unheard withdrawal does not rewrite Mara's knowledge",
  );
  const yes = source("yes", "mara", "I accept.", "scene-3", { act: "accept" });
  assert.throws(
    () =>
      apply(
        withdrawn,
        {
          id: "accept",
          holders: [mara],
          accept: "mara",
          target: target(withdrawn, offer.id, [mara]),
          sourceIds: [yes.id],
        },
        [yes],
        "accept",
        "scene-3",
      ),
    /withdrawn/,
  );
  assert.throws(
    () =>
      apply(
        withdrawn,
        {
          id: "stale",
          holders: [mara],
          accept: "mara",
          target: target(offer.state, offer.id, [mara]),
          sourceIds: [yes.id],
        },
        [yes],
        "stale",
        "scene-3",
      ),
    /target changed/,
  );
});

await runCase("continuity/qualified-offer", () => {
  const offer = offered();
  const condition = source("conditional", "mara", "Only if Leo comes too.", "scene-2", { act: "offer" });
  assert.throws(
    () =>
      apply(
        offer.state,
        {
          id: "qualified",
          holders: [mara],
          accept: "mara",
          target: target(offer.state, offer.id, [mara]),
          sourceIds: [condition.id],
        },
        [condition],
        "conditional",
        "scene-2",
      ),
    /actual deciding speech/,
  );
  assert.throws(
    () =>
      apply(
        offer.state,
        {
          id: "rewrite",
          holders: [mara],
          text: offer.terms + " Leo must come too.",
          target: target(offer.state, offer.id, [mara]),
          sourceIds: [condition.id],
        },
        [condition],
        "rewrite",
        "scene-2",
      ),
    /terms cannot change/,
  );
  const counter = apply(
    offer.state,
    {
      id: "counter",
      holders: [mara, player],
      class: "commitment",
      text: offer.terms + " Leo must come too.",
      offer: { proposer: "mara", participants: ["mara", "player"] },
      sourceIds: [condition.id],
    },
    [condition],
    "counter",
    "scene-2",
  );
  assert.equal(rows(counter).find((row) => row.id !== offer.id)?.offer?.state, "offered");
  assert.equal(rows(counter).find((row) => row.id === offer.id)?.version.text, offer.terms);
});

await runCase("continuity/room-sequence", () => {
  let state = emptyContinuity();
  const outcome = source("room", "player", "The room is arranged.", "scene-1", { kind: "observation" });
  for (const [id, text] of [
    ["walls", "Pale walls rise below wooden beams."],
    ["table", "An oak table stands in the centre with two chairs."],
    ["rug", "A narrow rug lies beside the door."],
  ] as const)
    state = apply(state, { id, holders: [room], text, sourceIds: [outcome.id] }, [outcome], id);
  const initial = rows(state, room);
  const table = initial.find((row) => row.version.text.startsWith("An oak"))!;
  state = apply(
    state,
    {
      id: "move",
      holders: [room],
      target: target(state, table.id, [room]),
      text: "The oak table stands beneath the east window with two chairs.",
      sourceIds: [outcome.id],
    },
    [outcome],
    "move",
  );
  state = apply(
    state,
    { id: "mural", holders: [room], text: "A river mural covers the north wall.", sourceIds: [outcome.id] },
    [outcome],
    "mural",
  );
  const mural = rows(state, room).find((row) => row.version.text.startsWith("A river"))!;
  state = apply(
    state,
    {
      id: "remove",
      holders: [room],
      target: target(state, mural.id, [room]),
      retire: "ended",
      sourceIds: [outcome.id],
    },
    [outcome],
    "remove",
  );
  assert.deepEqual(
    rows(state, room).map((row) => row.version.text),
    [initial[0].version.text, "The oak table stands beneath the east window with two chairs.", initial[2].version.text],
  );
  assert.equal(rows(state, room)[0].version.id, initial[0].version.id, "unrelated blocks remain exact");
  assert.throws(
    () =>
      apply(
        state,
        { id: "duplicate", holders: [room], text: initial[0].version.text, sourceIds: [outcome.id] },
        [outcome],
        "duplicate",
      ),
    /duplicate/,
  );
  assert.equal(
    state.versions.filter((row) => row.rootId === mural.id).length,
    2,
    "removal preserves historical appearance",
  );
  const elsewhere = { ...room, zoneId: "hall" },
    misplaced = {
      id: table.id,
      recordRevision: state.records.find((row) => row.id === table.id)!.revision,
      heads: { [continuityHolderKey(elsewhere)]: 0 },
    };
  assert.throws(
    () =>
      applyContinuityWrite(
        state,
        {
          id: "relocate-root",
          holders: [elsewhere],
          target: misplaced,
          text: "A table in another room.",
          sourceIds: [outcome.id],
        },
        { ...context("relocate-root", [outcome], [misplaced]), room: elsewhere },
      ),
    /target holder/,
    "a supplied zero head cannot move a room's canonical identity into another room",
  );
});

await runCase("continuity/room-expiry", () => {
  const observation = source("light", "mara", "A soft light fills the room.", "scene-1", { kind: "observation" });
  const write: ContinuityWrite = {
    id: "light",
    holders: [room],
    text: observation.excerpt,
    room: { expiresInMinutes: 5 },
    sourceIds: [observation.id],
  };
  const state = apply(emptyContinuity(), write, [observation], "light");
  const expires = rows(state, room)[0].version.room?.expiresAt;
  assert.equal(expires, "2026-11-09T12:05:00.000Z");
  const replayed = applyContinuityWrite(state, write, {
    ...context("light", [observation]),
    at: "2026-11-09T12:04:00.000Z",
  });
  assert.strictEqual(replayed, state);
  assert.deepEqual(rows(state, room, expires), []);
  assert.equal(state.versions.length, 1, "expiry neither restores an old image nor buys interpretation");
});

await runCase("continuity/protection", () => {
  const learned = source("rowan", "player", "Rowan taught me chair repair.");
  const state = apply(
    emptyContinuity(),
    {
      id: "fact",
      holders: [mara, leo],
      class: "information",
      text: "The player reports learning chair repair from Rowan.",
      sourceIds: [learned.id],
    },
    [learned],
    "fact",
  );
  const id = state.records[0].id;
  const corrected = protectContinuity(state, target(state, id, [mara]), [mara], "repair", at, {
    text: "The player reports learning only finishing work from Rowan.",
  });
  assert.equal(rows(corrected)[0].version.sources.length, 0, "incompatible old evidence is not ordinary recall");
  assert.equal(rows(corrected, leo)[0].version.text, rows(state, leo)[0].version.text);
  const forgotten = protectContinuity(corrected, target(corrected, id, [mara]), [mara], "forget", at, { forget: true });
  assert.deepEqual(rows(forgotten), []);
  assert.throws(
    () =>
      apply(
        forgotten,
        { id: "resurrect", holders: [mara], text: state.versions[0].text, sourceIds: [learned.id] },
        [learned],
        "resurrect",
      ),
    /protected continuity source/,
  );
  assert.throws(
    () => protectContinuity(state, target(state, id, [mara]), [player], "teach", at, { text: "Secret" }),
    /cannot teach/,
  );
});

await runCase("continuity/initial-closure", () => {
  const spoken = source("recipe", "mara", "I wanted to share my recipe. Here is the complete recipe."),
    write: ContinuityWrite = {
      id: "fulfilled",
      holders: [mara, player],
      owner: mara,
      class: "desire",
      text: spoken.excerpt,
      retire: "fulfilled",
      current: false,
      sourceIds: [spoken.id],
    },
    state = apply(emptyContinuity(), write, [spoken], "fulfilled");
  assert.equal(state.records.length, 1);
  assert.equal(state.versions.length, 2, "one final version per receiving holder");
  for (const holder of [mara, player]) {
    assert.equal(rows(state, holder)[0].version.closed?.reason, "fulfilled");
    assert.equal(rows(state, holder)[0].current, false);
  }
  assert.deepEqual(apply(state, write, [spoken], "fulfilled"), state);
  for (const invalid of [
    { ...write, text: undefined },
    { ...write, current: true },
    { ...write, target: { id: "invented", recordRevision: 0, heads: {} } },
    { ...write, offer: { proposer: "mara", participants: ["mara", "player"] } },
  ])
    assert.throws(() => apply(emptyContinuity(), invalid, [spoken], "invalid"));
  const observation = source("repair", "mara", "A completed repair.", "scene-1", {
    kind: "observation",
    perceptions: [{ actorId: "player", channel: "sight", text: "A completed repair." }],
  });
  assert.throws(
    () =>
      apply(
        emptyContinuity(),
        {
          id: "room",
          holders: [room],
          text: observation.excerpt,
          retire: "ended",
          sourceIds: [observation.id],
        },
        [observation],
        "room",
      ),
    /initial closure needs complete actor meaning/,
  );
});

await runCase("continuity/desire-closure", () => {
  const motive = source("motive", "mara", "To sail a boat of her own, choosing the destination herself.", "scene-1", {
    kind: "self",
    perceptions: [],
  });
  const state = apply(
    emptyContinuity(),
    { id: "desire", holders: [mara], owner: mara, class: "desire", text: motive.excerpt, sourceIds: [motive.id] },
    [motive],
    "desire",
  );
  const outcome = source("sailing", "mara", "Mara sailed her own boat and chose the destination.", "scene-2", {
    kind: "observation",
  });
  const closed = apply(
    state,
    {
      id: "fulfilled",
      holders: [mara],
      target: target(state, state.records[0].id, [mara]),
      retire: "fulfilled",
      sourceIds: [outcome.id],
    },
    [outcome],
    "fulfilled",
    "scene-2",
  );
  const view = rows(closed)[0];
  assert.equal(view.version.text, motive.excerpt, "the desire body is the one semantic representation");
  assert.equal(view.current, false);
  assert.equal(view.version.closed?.reason, "fulfilled", "book status derives from the same retirement event");
  assert.equal(view.version.sources[0].id, outcome.id);
  assert.deepEqual(rows(closed, player), [], "private fulfillment does not update the notebook");
  const corrected = protectContinuity(
    closed,
    target(closed, state.records[0].id, [mara]),
    [mara],
    "correct-closed",
    at,
    {
      text: "Mara wanted to sail a small boat of her own.",
    },
  );
  assert.equal(rows(corrected)[0].current, false);
  assert.equal(
    rows(corrected)[0].version.closed?.reason,
    "fulfilled",
    "Correct changes text without inventing a new lifecycle state",
  );
});

await runCase("continuity/offer-privacy", () => {
  const offer = offered();
  const fixed = protectContinuity(offer.state, target(offer.state, offer.id, [mara]), [mara], "repair-offer", at, {
    text: "A different invitation.",
  });
  const yes = source("yes", "mara", "I accept.", "scene-2", { act: "accept" });
  assert.throws(
    () =>
      apply(
        fixed,
        { id: "accept", holders: [mara], target: target(fixed, offer.id, [mara]), accept: "mara", sourceIds: [yes.id] },
        [yes],
        "yes",
        "scene-2",
      ),
    /unchanged offer/,
  );
  const acoustic = {
    ...yes,
    perceptions: [{ actorId: "player", channel: "sound-only" as const, text: "Muffled voices." }],
  };
  assert.throws(
    () =>
      apply(
        offer.state,
        {
          id: "accept",
          holders: [mara, player],
          target: target(offer.state, offer.id, [mara, player]),
          accept: "mara",
          sourceIds: [yes.id],
        },
        [acoustic],
        "acoustic",
        "scene-2",
      ),
    /heard as words/,
  );
  const privateYes = { ...yes, perceptions: [] };
  const accepted = apply(
    offer.state,
    {
      id: "accept",
      holders: [mara],
      target: target(offer.state, offer.id, [mara]),
      accept: "mara",
      sourceIds: [yes.id],
    },
    [privateYes],
    "private-yes",
    "scene-2",
  );
  assert.equal(rows(accepted)[0].offer?.state, "accepted");
  assert.equal(rows(accepted, player)[0].offer?.state, "offered", "an unheard decision is not disclosed");
});

await runCase("continuity/concealed-observations", () => {
  const rug = source("rug", "player", "The key is hidden under the rug.", "scene-1", {
    kind: "observation",
    perceptions: ["mara", "leo"].map((actorId) => ({
      actorId,
      channel: "sight",
      text: "The key is hidden under the rug.",
    })),
  });
  const first = apply(
    emptyContinuity(),
    {
      id: "key",
      holders: [room],
      text: rug.excerpt,
      room: { visibility: "concealed", knownBy: ["player", "mara", "leo"] },
      sourceIds: [rug.id],
    },
    [rug],
    "key",
  );
  const id = first.records[0].id;
  const painting = source("painting", "player", "The key is moved behind the painting.", "scene-2", {
    kind: "observation",
    perceptions: [],
  });
  const moved = apply(
    first,
    {
      id: "move-key",
      holders: [room],
      target: target(first, id, [room]),
      text: painting.excerpt,
      room: { knownBy: ["player"] },
      sourceIds: [painting.id],
    },
    [painting],
    "move-key",
    "scene-2",
  );
  assert.equal(rows(moved, room)[0].version.text, painting.excerpt);
  assert.deepEqual(rows(moved, room)[0].roomKnownBy, ["player"]);
  assert.equal(rows(moved, mara)[0].version.text, rug.excerpt);
  assert.equal(rows(moved, mara)[0].version.room, undefined, "actor projection contains no current hidden routing");
  const forgotten = protectContinuity(moved, target(moved, id, [mara]), [mara], "forget-key", at, { forget: true });
  assert.deepEqual(rows(forgotten, mara), []);
  assert.equal(rows(forgotten, leo)[0].version.text, rug.excerpt);
  assert.equal(rows(forgotten, room)[0].version.text, painting.excerpt);
  assert.throws(
    () =>
      apply(
        first,
        {
          id: "mixed",
          holders: [room],
          target: target(first, id, [room]),
          text: painting.excerpt,
          room: { knownBy: ["mara"] },
          sourceIds: [rug.id, painting.id],
        },
        [rug, painting],
        "mixed",
        "scene-2",
      ),
    /unwitnessed concealed knowledge/,
    "one visible source cannot disclose another private source",
  );
});

await runCase("continuity/room-current-evidence", () => {
  const historical = source("past", "player", "A vase stands here.", "scene-1", { kind: "observation" });
  assert.throws(
    () =>
      apply(
        emptyContinuity(),
        { id: "vase", holders: [room], text: historical.excerpt, sourceIds: [historical.id] },
        [historical],
        "stale-room",
        "scene-2",
      ),
    /actual outcome/,
  );
});

await runCase("continuity/holder-admission", () => {
  const fact = source("fact", "player", "The fair is on Saturday.", "scene-1", { perceptions: [] });
  const first = apply(
    emptyContinuity(),
    { id: "fact", holders: [player], text: fact.excerpt, sourceIds: [fact.id] },
    [fact],
    "fact",
  );
  const disclosed = source("disclose", "player", fact.excerpt, "scene-2");
  const learned = apply(
    first,
    {
      id: "learn",
      holders: [mara],
      target: target(first, first.records[0].id, [mara]),
      text: fact.excerpt,
      sourceIds: [disclosed.id],
    },
    [disclosed],
    "learn",
    "scene-2",
  );
  assert.equal(rows(learned, mara)[0].version.text, fact.excerpt);
  assert.throws(
    () =>
      apply(
        first,
        { id: "unknown", holders: [actor("stranger")], text: fact.excerpt, sourceIds: [fact.id] },
        [fact],
        "unknown",
      ),
    /invalid continuity holders/,
  );
  assert.throws(
    () =>
      apply(
        first,
        {
          id: "incarnation",
          holders: [{ ...mara, incarnation: "replaced" } as ContinuityHolder],
          text: fact.excerpt,
          sourceIds: [disclosed.id],
        },
        [disclosed],
        "incarnation",
      ),
    /invalid continuity holders/,
  );
  assert.throws(
    () => apply(first, { id: "fact", holders: [player], text: "Changed fact", sourceIds: [fact.id] }, [fact], "fact"),
    /identity reused/,
  );
});

await runCase("continuity/parent-protection", () => {
  const motivation = source("wish", "mara", "I want to sail, to choose my own destination.", "scene-1", {
    kind: "self",
    perceptions: [],
  });
  const parent = apply(
    emptyContinuity(),
    {
      id: "wish",
      holders: [mara],
      owner: mara,
      class: "desire",
      text: "Sail a boat of my own.",
      sourceIds: [motivation.id],
    },
    [motivation],
    "wish",
  );
  const parentId = parent.records[0].id;
  const clarified = source("clarify", "mara", "I want to sail beyond the bay.", "scene-2", {
    kind: "self",
    perceptions: [],
  });
  const updated = apply(
    parent,
    {
      id: "clarify",
      holders: [mara],
      target: target(parent, parentId, [mara]),
      text: clarified.excerpt,
      sourceIds: [clarified.id],
    },
    [clarified],
    "clarify",
    "scene-2",
  );
  assert.equal(rows(updated)[0].version.class, "desire", "a private replacement inherits its unchanged classification");
  const facet: ContinuityWrite = {
    id: "reason",
    holders: [mara],
    class: "motivation",
    parentId,
    facet: "reason",
    text: "Choose my own destination.",
    sourceIds: [motivation.id],
  };
  const child = applyContinuityWrite(
    parent,
    facet,
    context("reason", [motivation], [target(parent, parentId, [mara])]),
  );
  const corrected = protectContinuity(child, target(child, parentId, [mara]), [mara], "wish-repair", at, {
    text: "Learn to navigate.",
  });
  assert.equal(rows(corrected).length, 1, "corrected parent does not expose incompatible linked reason");
  assert.equal(rows(corrected)[0].version.sources.length, 0);
  const replay: ContinuityWrite = {
    id: "resurrect",
    holders: [mara],
    class: "motivation",
    text: facet.text,
    sourceIds: [motivation.id],
    screening: { fingerprint: "screen", roots: [parentId], disposition: "clear" },
  };
  assert.throws(
    () =>
      applyContinuityWrite(corrected, replay, {
        ...context("resurrect", [motivation]),
        protectedRoots: [parentId],
        protectionFingerprint: "screen",
      }),
    /protected continuity source/,
  );
  assert.throws(
    () =>
      applyContinuityWrite(
        corrected,
        { ...replay, screening: { fingerprint: "old-screen", roots: [], disposition: "clear" } },
        { ...context("incomplete-screen", [motivation]), protectedRoots: [parentId], protectionFingerprint: "screen" },
      ),
    /clear screening/,
  );
});

console.log(
  "Common continuity: individual knowledge, cross-Scene offers, room coherence, expiry, protection and desire history passed without providers.",
);
