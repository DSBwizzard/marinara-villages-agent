// Test cases: relationships/player-snapshot, relationships/scoring, relationships/shared-terms, relationships/common-protection, relationships/identity-labels, relationships/native-access, relationships/access-calendar, relationships/pure-reads
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import type { ContinuityWrite } from "../packages/villages/src/server/domain/models/continuity-model.js";
import type { AcceptedEpisode } from "../packages/villages/src/server/domain/models/episode-model.js";
import { continuityActor, relationshipActors } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { applyContinuityWrite, continuityHolderKey } from "../packages/villages/src/server/domain/rules/continuity.js";
import { appendEpisode } from "../packages/villages/src/server/domain/rules/episodes.js";
import { episodeSpeechEvidence } from "../packages/villages/src/server/domain/rules/episode-sources.js";
import { prepareContinuityKeep } from "../packages/villages/src/server/domain/rules/narration-keep.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  continuityRelationships,
  inspectContinuityRelationships,
  continuityMemoryLibrary,
  inspectContinuityMemory,
  changeContinuityMemory,
} from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { createRelationships } from "../packages/villages/src/server/features/residents/relationship-service.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { applyAccessCommand, readAccessCommand } from "../packages/villages/src/server/domain/rules/venue-access.js";
import { venueFixture } from "./helpers/venues.fixture.js";
const at = "2026-11-09T12:00:00.000Z";
function fixture() {
  const state = { ...defaultVillageState(), seed: "world", setupAt: at };
  state.villagers = ["mara", "leo"].map((id) => ({
    characterId: id,
    incarnation: "one",
    cardSnapshot: { name: id === "mara" ? "Mara" : "Leo" },
  })) as VillageState["villagers"];
  const actor = (id: string) => continuityActor(state, id)!;
  function keep(
    write: Omit<ContinuityWrite, "sourceIds">,
    speaker = "mara",
    act?: "offer" | "accept",
    admittedRevision = state.continuity.revision,
  ) {
    const id = write.id,
      content = write.text ?? "I agree to those exact terms.",
      before = state.continuity;
    const actors = [
      ...new Map(
        [...write.holders.filter((holder) => holder.kind === "actor"), actor(speaker)].map((holder) => [
          holder.id,
          holder,
        ]),
      ).values(),
    ];
    const episode: AcceptedEpisode = {
      format: 1,
      id,
      seed: state.seed,
      sceneId: "scene-" + id,
      submissionId: "turn-" + id,
      operationId: id,
      capturedAt: at,
      acceptedAt: at,
      responseDigest: memoryHash(id),
      admittedContinuityRevision: admittedRevision,
      privateInput: "",
      actors: actors.map(({ id, incarnation }) => ({ id, incarnation, zoneId: "parlor" })),
      segments: [
        {
          id: "line-" + id,
          role: "assistant",
          speakerId: speaker,
          name: actor(speaker).id,
          content,
          at,
          kind: "dialogue",
          zoneId: "parlor",
          heardBy: actors.map((actor) => actor.id),
        },
      ],
      grounding: [],
      continuityVersionIds: [],
      offered: [],
      commandReceipts: [],
      dependencies: {},
    };
    const source = { ...episodeSpeechEvidence(episode, episode.segments[0].id)!, ...(act ? { act } : {}) };
    episode.grounding = [source];
    const admission = {
      seed: state.seed,
      operationId: id,
      episodeId: id,
      at,
      actors: episode.actors,
      relationshipActors: relationshipActors(state),
      continuityRevision: admittedRevision,
      subjects: [actor("player"), ...state.villagers.map((person) => actor(person.characterId))],
      sources: [source],
      supplied: [
        ...(write.target ? [write.target] : []),
        ...(write.parentId
          ? [
              target(
                write.parentId,
                write.holders.filter((holder) => holder.kind === "actor").map((holder) => holder.id),
              ),
            ]
          : []),
      ],
      protectedRoots: [],
    };
    const prepared =
      write.relationship &&
      prepareContinuityKeep(
        {
          id: write.id,
          class: write.class,
          owner: write.owner?.id,
          for: write.holders.map((holder) => (holder.kind === "actor" ? holder.id : "room")),
          text: write.text,
          about: write.about?.map((subject) => subject.id),
          current: write.current,
          relationship: write.relationship,
          source: ["reply"],
        },
        0,
        before,
        admission,
        { ...admission, actors, bindSource: () => source },
      );
    state.continuity = applyContinuityWrite(
      before,
      prepared ? prepared.write : { ...write, sourceIds: [source.id] },
      prepared ? prepared.admission : admission,
    );
    episode.continuityVersionIds = state.continuity.versions.slice(before.versions.length).map((version) => version.id);
    state.episodes = appendEpisode(state.episodes, episode, state.seed);
    return state.continuity.records.find((record) => record.id === state.continuity.versions.at(-1)!.rootId)!;
  }
  const target = (id: string, ids: string[]) => {
    const record = state.continuity.records.find((record) => record.id === id)!;
    return {
      id,
      recordRevision: record.revision,
      heads: Object.fromEntries(
        ids.map((id) => {
          const key = continuityHolderKey(actor(id));
          return [key, record.heads[key]?.revision ?? 0];
        }),
      ),
    };
  };
  function cold() {
    const scope = "a".repeat(32),
      encoded = encodeContinuityPages(
        {
          continuity: state.continuity,
          episodes: state.episodes,
          worldPlaces: state.worldPlaces,
          mailbox: state.mailbox,
        },
        scope,
      );
    Object.assign(
      state,
      decodeContinuityPagesSync(encoded.manifest, scope, state.seed, (id) => encoded.pages.get(id) ?? null).value,
    );
  }
  return { state, actor, keep, target, cold, profiles: () => continuityRelationships(state, at) };
}
await runCase("relationships/player-snapshot", () => {
  const f = fixture();
  const root = f.keep({
    id: "shared",
    holders: [f.actor("player"), f.actor("mara")],
    owner: f.actor("mara"),
    class: "perspective",
    about: [f.actor("player")],
    text: "Mara enjoys our conversations but has not promised friendship.",
    current: true,
  });
  const before = f.profiles();
  assert.equal(before[0].entries[0].text, f.state.continuity.versions[0].text);
  f.keep({
    id: "private-change",
    holders: [f.actor("mara")],
    target: f.target(root.id, ["mara"]),
    text: "PRIVATE: Mara now doubts the player.",
  });
  f.cold();
  assert.deepEqual(f.profiles(), before, "private changes cannot update a learned snapshot, revision or count");
  assert.equal(inspectContinuityRelationships(f.state, "mara", at)[0].text, "PRIVATE: Mara now doubts the player.");
  assert.deepEqual(
    f.profiles()[0].entries[0].knownBy.map((person) => person.id),
    ["player"],
  );
});
await runCase("relationships/scoring", () => {
  const f = fixture();
  const mara = f.actor("mara");
  const player = f.actor("player");
  const directed = { owner: mara, about: [player], class: "perspective" as const, current: true };
  const score = () => f.profiles()[0].scores.find((row) => row.person.id === "player")!;
  assert.equal(score().score, 0);
  const before = f.state.continuity.revision;
  f.keep({
    ...directed,
    id: "flower",
    holders: [mara],
    text: "PRIVATE: Mara feels a little warmer after the flower.",
    relationship: { impact: "small-positive" },
  });
  assert.equal(score().score, 3);
  assert(!JSON.stringify(f.profiles()).includes("PRIVATE"));
  assert.throws(
    () =>
      f.keep(
        {
          ...directed,
          id: "stale",
          holders: [mara],
          text: "A second stale claim.",
          relationship: { impact: "turning-negative" },
        },
        "mara",
        undefined,
        before,
      ),
    /relationship changed since admission/,
  );
  assert.throws(
    () =>
      f.keep({
        ...directed,
        id: "unshared",
        holders: [mara],
        text: "PRIVATE: Mara feels more guarded.",
        relationship: { impact: "small-negative", answer: "I feel more guarded." },
      }),
    /answer needs/,
  );
  f.keep({
    ...directed,
    id: "shared-change",
    holders: [mara, player],
    text: "Mara says she looks forward to your visits.",
    relationship: { impact: "meaningful-positive", answer: "I look forward to your visits." },
  });
  f.cold();
  assert.equal(score().score, 13);
  assert.equal(score().answer, "I look forward to your visits.");
  f.keep({
    ...directed,
    id: "disclosure",
    holders: [mara, player],
    text: "Mara says your visits brighten her day.",
    relationship: { answer: "I think you brighten my day." },
  });
  assert.equal(score().score, 13);
  assert.equal(score().answer, "I think you brighten my day.");
  assert.equal(f.profiles()[0].scores.find((row) => row.person.id === "leo")?.score, 0);
});

await runCase("relationships/shared-terms", () => {
  const f = fixture(),
    terms =
      "Mara and Leo will visit the fair only if Delia comes, the path is open, and nobody has a work commitment. 🌿";
  const root = f.keep(
    {
      id: "offer",
      holders: [f.actor("player"), f.actor("mara"), f.actor("leo")],
      class: "commitment",
      text: terms,
      offer: { proposer: "mara", participants: ["mara", "leo"] },
    },
    "mara",
    "offer",
  );
  f.keep(
    {
      id: "accept",
      holders: [f.actor("leo"), f.actor("mara")],
      target: f.target(root.id, ["mara", "leo"]),
      accept: "leo",
    },
    "leo",
    "accept",
  );
  f.cold();
  const publicEntry = f.profiles()[0].entries[0];
  assert.equal(publicEntry.text, terms);
  assert.equal(publicEntry.offer?.state, "offered", "the notebook cannot see an unheard later acceptance");
  assert.equal(inspectContinuityRelationships(f.state, "mara", at)[0].offer?.state, "accepted");
  const motive = f.keep({
    id: "motive",
    holders: [f.actor("mara")],
    owner: f.actor("mara"),
    class: "motivation",
    text: "PRIVATE: Mara wants to make time for Leo.",
    current: true,
  });
  const facet = f.keep({
    id: "boundary",
    holders: [f.actor("mara")],
    parentId: motive.id,
    class: "perspective",
    facet: "boundary",
    about: [f.actor("leo")],
    text: "Mara will not pressure Leo to cancel work.",
    current: true,
  });
  assert(!f.profiles().some((profile) => profile.entries.some((entry) => [motive.id, facet.id].includes(entry.id))));
  assert.equal(
    inspectContinuityRelationships(f.state, "mara", at).find((entry) => entry.id === facet.id)?.parentId,
    motive.id,
  );
});
await runCase("relationships/common-protection", () => {
  const f = fixture(),
    root = f.keep({
      id: "concern",
      holders: [f.actor("player"), f.actor("mara")],
      owner: f.actor("mara"),
      class: "perspective",
      text: "Mara worries the player is leaving.",
      current: true,
    });
  const before = f.profiles();
  let inspection = inspectContinuityMemory(f.state, root.id, "mara", true, at);
  f.state.continuity = changeContinuityMemory(
    f.state,
    root.id,
    {
      operationId: "correct",
      seed: f.state.seed,
      target: inspection.target!,
      knowers: ["mara"],
      text: "Mara understands that the trip is temporary.",
    },
    "repair",
    at,
  );
  f.cold();
  const corrected = inspectContinuityRelationships(f.state, "mara", at)[0];
  assert.equal(corrected.text, "Mara understands that the trip is temporary.");
  assert.deepEqual(corrected.support, []);
  assert.deepEqual(f.profiles(), before);
  assert.equal(
    continuityMemoryLibrary(f.state, { inspection: true, characterId: "mara" }, at).entries[0].kind,
    "perspective",
    "common Inspect exposes mental entries to existing Correct/Forget controls",
  );
  inspection = inspectContinuityMemory(f.state, root.id, "player", true, at);
  f.state.continuity = changeContinuityMemory(
    f.state,
    root.id,
    { operationId: "forget-player", seed: f.state.seed, target: inspection.target!, knowers: ["player"] },
    "forget",
    at,
  );
  assert.deepEqual(f.profiles()[0].entries, []);
});
await runCase("relationships/identity-labels", () => {
  const f = fixture();
  const root = f.keep({
    id: "old-friendship",
    holders: [f.actor("player"), f.actor("mara")],
    owner: f.actor("mara"),
    class: "perspective",
    about: [f.actor("leo")],
    text: "Mara considers Leo a friend, though they disagree about work.",
    current: true,
  });
  f.state.villagers[0].incarnation = "replacement";
  f.state.villagers[0].cardSnapshot.name = "New Mara";
  assert.deepEqual(f.profiles()[0].entries, []);
  assert.equal(f.profiles()[1].entries[0].owner?.name, "Former resident");
  assert.equal(
    inspectContinuityMemory(f.state, root.id, "player", false, at).knowers[0].support[0].speaker?.name,
    "Former resident",
  );
  assert.deepEqual(inspectContinuityRelationships(f.state, "mara", at), []);
  f.state.villagers[1].incarnation = "replacement";
  assert.deepEqual(f.profiles()[1].entries, [], "old subject bindings cannot attach notes to a replacement");
});
await runCase("relationships/native-access", () => {
  const f = fixture(),
    venue = venueFixture({ id: "home", residentIds: ["mara"] });
  const zone = venue.zones!.find((zone) => zone.kind !== "exterior")!;
  zone.seen = true;
  f.state.venues = [venue];
  const grant = "native-invitation";
  applyAccessCommand(
    venue,
    readAccessCommand({
      operationId: grant,
      expectedRevision: venue.access!.revision,
      zoneId: zone.id,
      action: "invite",
      visitorId: "player",
      duration: "standing",
      accompanied: false,
      outsideHours: true,
    }),
    "mara",
    at,
    ["player", "mara"],
    ["invitation"],
  );
  assert.deepEqual(f.profiles()[0].access, [], "unlearned permissions cannot expose a remote Zone");
  retainNativeFact(
    f.state,
    {
      id: grant,
      kind: "access",
      targetId: venue.id,
      revision: venue.access!.revision,
      text: "Mara gave the player standing permission.",
      witnesses: ["player", "mara"],
    },
    at,
  );
  f.cold();
  assert.equal(f.profiles()[0].access[0]?.zoneId, zone.id);
  assert.equal(f.profiles()[0].access[0]?.active, true);
  venue.constructionStatus = "worksite";
  assert.equal(f.profiles()[0].access[0]?.active, false);
  venue.constructionStatus = undefined;
  f.state.villagers[0].incarnation = "replacement";
  assert.deepEqual(f.profiles()[0].access, [], "a replacement does not inherit the old issuer's invitation");
});
await runCase("relationships/access-calendar", () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = "UTC";
    assert.equal(new Date(at).getHours(), 12);
    for (const open of [false, true]) {
      const f = fixture(),
        venue = venueFixture({ id: "home", residentIds: ["mara"] }),
        zone = venue.zones!.find((zone) => zone.kind !== "exterior")!,
        grant = "calendar-invitation";
      f.state.timeZone = "America/Los_Angeles";
      f.state.venues = [venue];
      venue.occupancy.playerHome = false;
      venue.access!.managerIds = ["mara"];
      zone.seen = true;
      zone.access = {
        ...zone.access!,
        mode: "permission-required",
        managerIds: ["mara"],
        memberIds: [],
        memberRoles: [],
        visitorHours: [{ days: ["Monday"], start: open ? "03:00" : "11:00", end: open ? "05:00" : "13:00" }],
      };
      applyAccessCommand(
        venue,
        readAccessCommand({
          operationId: grant,
          expectedRevision: venue.access!.revision,
          zoneId: zone.id,
          action: "invite",
          visitorId: "player",
          duration: "standing",
          accompanied: false,
          outsideHours: false,
        }),
        "mara",
        at,
        ["player", "mara"],
        ["invitation"],
      );
      retainNativeFact(
        f.state,
        {
          id: grant,
          kind: "access",
          targetId: venue.id,
          revision: venue.access!.revision,
          text: "Mara granted standing permission during visitor hours.",
          witnesses: ["player", "mara"],
        },
        at,
      );
      f.cold();
      const before = structuredClone(venue.access);
      assert.equal(f.profiles()[0].access[0]?.active, open, "The People book uses Village-local visitor hours");
      assert.deepEqual(venue.access, before, "Reading availability cannot change the underlying invitation");
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
await runCase("relationships/pure-reads", async () => {
  const f = fixture();
  f.keep({
    id: "known",
    holders: [f.actor("player"), f.actor("mara")],
    owner: f.actor("mara"),
    class: "perspective",
    text: "Mara enjoys the player's company.",
  });
  for (const field of ["relationshipContext", "socialOutbox"])
    Object.defineProperty(f.state, field, {
      configurable: true,
      get() {
        throw new Error("retired state read");
      },
    });
  let clarified = 0;
  const service = createRelationships({
    readVillageState: async () => f.state,
    now: () => new Date(at),
    clarifyStartingTies: async () => {
      clarified++;
    },
    backgroundWorkSummaries: async () => [],
  } as any);
  const before = memoryHash([f.state.continuity, f.state.episodes, f.state.startingHistory]);
  await service.readRelationshipsView();
  const inspect = await service.readRelationshipsInspect();
  assert.equal(inspect.residents[0].entries[0].text, "Mara enjoys the player's company.");
  assert.equal(memoryHash([f.state.continuity, f.state.episodes, f.state.startingHistory]), before);
  await service.clarifyRelationships({ text: "An existing clarification" });
  assert.equal(clarified, 1);
});
