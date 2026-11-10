// Test cases: resident-narration/ordinary, resident-narration/reflection, resident-narration/private-source, resident-narration/attendance, resident-narration/replay, resident-narration/large-room, resident-narration/protection, resident-narration/agreements, resident-narration/due-identities, resident-narration/mail-room, resident-narration/room-units, resident-narration/room-history-hop
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { ResidentPlanningOpportunity, VillageState } from "../packages/villages/src/server/domain/models/world.js";
import {
  captureResidentNarration,
  acceptResidentNarration,
} from "../packages/villages/src/server/domain/rules/resident-narration.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import {
  continuityHolderKey,
  continuityViews,
  continuityProtectionUnits,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { episodeSourceGraph } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { retainNativeFact } from "../packages/villages/src/server/domain/rules/native-continuity.js";
import { actorEpisodeView, gmEpisodeView } from "../packages/villages/src/server/domain/rules/episodes.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { memoryPayload } from "../packages/villages/src/server/adapters/storage/memory-payload-store.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import { agendaFixture } from "./helpers/agenda.fixture.js";
import { captureContinuityContext } from "../packages/villages/src/server/domain/rules/continuity-context.js";
import { socialPlanCandidates, acceptSocialPlan } from "../packages/villages/src/server/domain/rules/social-rules.js";
import {
  acceptResidentLetter,
  acceptMailExchange,
  readDeliveredLetter,
} from "../packages/villages/src/server/domain/rules/mail-delivery.js";

const at = "2026-11-10T12:00:00.000Z",
  later = "2026-11-10T12:10:00.000Z";
function fixture() {
  const state = defaultVillageState();
  Object.assign(state, {
    seed: "resident-narration",
    setupAt: at,
    foundedAt: at,
    timeZone: "UTC",
    backgroundPace: "lively",
  });
  state.venues = [venueFixture({ id: "square", name: "Square", category: "public" })];
  const zone = state.venues[0].zones!.find((zone) => zone.kind !== "exterior")!.id,
    room = { kind: "room" as const, placeId: "square", zoneId: zone };
  state.villagers = ["mara", "leo"].map((id) => ({
    characterId: id,
    incarnation: "one",
    letterFontId: "caveat",
    addedAt: at,
    cardSnapshot: { id, name: id, capturedAt: at, revision: 1, sourceStatus: "available", tags: [] },
    wishes: [],
    agenda: agendaFixture({
      day: [
        { startMinute: 0, endMinute: 1440, venueId: "square", zoneId: zone, activity: "Free time", flexible: true },
      ],
      activeDay: {
        dateKey: "2026-11-10",
        weekday: "Tuesday",
        blocks: [
          { startMinute: 0, endMinute: 1440, venueId: "square", zoneId: zone, activity: "Free time", flexible: true },
        ],
        scheduleInformed: false,
      },
    }),
  })) as VillageState["villagers"];
  const seedRoom = (id: string, text: string) =>
    retainNativeFact(
      state,
      {
        id,
        kind: "structure",
        targetId: JSON.stringify([room.placeId, room.zoneId]),
        revision: 1,
        text,
        witnesses: [],
      },
      at,
      { room },
    );
  seedRoom("base-room", "A common room with a blue cup on the shelf and an oak table.");
  const opportunity: ResidentPlanningOpportunity = {
      id: "opportunity",
      kind: "encounter",
      startsAt: at,
      endsAt: at,
      actorIds: ["mara", "leo"],
      venueId: "square",
      zoneId: zone,
      facts: ["Mara and Leo currently share the common room."],
    },
    capture = (id = opportunity.id) => captureResidentNarration(state, { ...opportunity, id }),
    ordinary = {
      encounter: {
        opportunityId: opportunity.id,
        lines: [
          { id: "hello", speakerId: "mara", text: "How has your afternoon been?" },
          { id: "answer", speakerId: "leo", text: "Quiet, thank you." },
        ],
      },
      keep: [],
      requires: [],
    },
    views = (id: string) => {
      const holder = continuityActor(state, id)!;
      return continuityViews(
        state.continuity,
        holder,
        later,
        continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder)),
      );
    },
    cold = () => {
      const world = "a".repeat(32),
        packet = encodeContinuityPages(memoryPayload(state), world);
      Object.assign(
        state,
        decodeContinuityPagesSync(packet.manifest, world, state.seed, (id) => packet.pages.get(id) ?? null).value,
      );
    };
  return { state, zone, room, seedRoom, opportunity, capture, ordinary, views, cold };
}
await runCase("resident-narration/ordinary", () => {
  const f = fixture(),
    result = acceptResidentNarration(f.state, f.capture(), f.ordinary, memoryHash("one GM"), later);
  assert(!result.held && result.episode);
  assert(!result.episode.sceneId);
  assert.deepEqual(
    result.episode.actors.map((row) => row.id),
    ["mara", "leo"],
  );
  assert(result.episode.segments.every((line) => !line.heardBy.includes("player")));
  assert.equal(
    actorEpisodeView(result.episode, f.state.continuity, continuityActor(f.state, "player")!, f.state.episodes),
    null,
  );
  assert.equal(
    actorEpisodeView(result.episode, f.state.continuity, continuityActor(f.state, "leo")!, f.state.episodes)?.segments
      .length,
    2,
  );
  f.cold();
  assert.equal(f.views("player").length, 0);
});
await runCase("resident-narration/reflection", () => {
  const f = fixture(),
    result = acceptResidentNarration(
      f.state,
      f.capture(),
      {
        reflection: { actorId: "mara", text: "Mara privately decides she wants a quieter studio." },
        keep: [
          {
            id: "wish",
            for: ["mara"],
            owner: "mara",
            class: "desire",
            text: "I want a quieter studio.",
            source: ["self"],
          },
        ],
        requires: ["wish"],
      },
      memoryHash("reflection"),
      later,
    );
  assert(!result.held && result.episode);
  f.cold();
  assert.equal(f.views("mara")[0].version.text, "I want a quieter studio.");
  assert.equal(f.views("leo").length, 0);
  assert.equal(f.views("player").length, 0);
  const own = actorEpisodeView(
    result.episode,
    f.state.continuity,
    continuityActor(f.state, "mara")!,
    f.state.episodes,
  )!;
  assert.equal(own.segments[0].channel, "private");
  assert.equal(
    actorEpisodeView(result.episode, f.state.continuity, continuityActor(f.state, "leo")!, f.state.episodes)?.segments
      .length,
    0,
  );
});
await runCase("resident-narration/private-source", () => {
  for (const source of [
    { segment: "reflection", perceive: { kind: "seen", by: ["mara"] } },
    { segment: "reflection", act: "offer" },
    "reflection",
    "self",
    { input: "Player agrees", ground: { kind: "spoken", to: ["mara"] } },
  ]) {
    const f = fixture(),
      before = structuredClone(f.state),
      result = acceptResidentNarration(
        f.state,
        f.capture(),
        {
          reflection: { actorId: "mara", text: "Mara privately imagines Leo owning a horse." },
          keep: [{ id: "invalid", for: ["mara"], class: "information", text: "Leo owns a horse.", source: [source] }],
          requires: ["invalid"],
        },
        memoryHash("private"),
        later,
      );
    assert(result.held);
    assert.deepEqual(f.state, before, "an unspoken private thought cannot prove an outside fact");
  }
  const f = fixture(),
    result = acceptResidentNarration(
      f.state,
      f.capture(),
      {
        reflection: { actorId: "mara", text: "Mara privately wants to learn pottery." },
        keep: [
          {
            id: "wish",
            for: ["mara"],
            owner: "mara",
            class: "desire",
            text: "I want to learn pottery.",
            source: ["reflection"],
          },
        ],
        requires: ["wish"],
      },
      memoryHash("private desire"),
      later,
    );
  assert(!result.held);
  f.cold();
  const next = f.capture("next-reflection");
  assert(
    Object.values(next.context.historical).some((source) => source.kind === "private" && source.actorId === "mara"),
  );
  assert(
    !Object.values(next.context.historical).some(
      (source) => source.kind === "observation" && source.excerpt.includes("privately wants"),
    ),
    "cold historical recall retains the private channel",
  );
});
await runCase("resident-narration/attendance", () => {
  for (const projection of ["activeDay", "plannedDays"]) {
    const f = fixture();
    if (projection === "plannedDays") {
      const agenda = f.state.villagers[0].agenda!;
      agenda.plannedDays = { "2026-11-10": structuredClone(agenda.activeDay!.blocks) };
      delete agenda.activeDay;
    }
    const captured = f.capture(),
      agenda = f.state.villagers[0].agenda!;
    (projection === "activeDay" ? agenda.activeDay!.blocks : agenda.plannedDays!["2026-11-10"])[0].zoneId = "exterior";
    const before = structuredClone(f.state);
    assert.throws(
      () => acceptResidentNarration(f.state, captured, f.ordinary, memoryHash("old attendance"), later),
      /native authority|native attendance/,
    );
    assert.deepEqual(f.state, before);
  }
  const f = fixture();
  assert(
    !acceptResidentNarration(
      f.state,
      f.capture(),
      f.ordinary,
      memoryHash("later acceptance"),
      "2026-11-11T12:00:00.000Z",
    ).held,
    "elapsed wall time alone does not rewrite the captured source instant",
  );
});
await runCase("resident-narration/replay", () => {
  const f = fixture(),
    capture = f.capture(),
    digest = memoryHash("one saved response");
  acceptResidentNarration(f.state, capture, f.ordinary, digest, later);
  f.state.villagers[0].incarnation = "replacement";
  const before = structuredClone(f.state);
  assert(acceptResidentNarration(f.state, capture, f.ordinary, digest, later).replayed);
  assert.deepEqual(f.state, before);
  assert.throws(
    () => acceptResidentNarration(f.state, capture, { ...f.ordinary, requires: ["forged"] }, digest, later),
    /identity reused/,
  );
});
await runCase("resident-narration/large-room", () => {
  const f = fixture();
  for (let index = 0; index < 28; index++)
    f.seedRoom(
      "facet-" + index,
      "Facet " + index + ": " + "A patterned curtain hangs beside a quiet alcove. ".repeat(30),
    );
  const capture = f.capture();
  assert(capture.room!.packet.partial);
  assert(capture.room!.packet.total > capture.room!.packet.entries.length);
  const omitted = f.state.continuity.records.find(
    (record) => !capture.room!.supplied.some((target) => target.id === record.id),
  )!;
  const before = structuredClone(f.state),
    invalid = {
      ...f.ordinary,
      keep: [
        { id: "unfitted", for: "room", replace: omitted.id, text: "The whole room is empty.", source: ["action"] },
      ],
      requires: ["unfitted"],
      encounter: {
        ...f.ordinary.encounter,
        lines: [
          ...f.ordinary.encounter.lines,
          { id: "action", kind: "narration", text: "Mara moves the blue cup from the shelf to the oak table." },
        ],
      },
    };
  assert(acceptResidentNarration(f.state, capture, invalid, memoryHash("unfitted room"), later).held);
  assert.deepEqual(f.state, before);
  assert(!acceptResidentNarration(f.state, capture, f.ordinary, memoryHash("ordinary large room"), later).held);
  f.cold();
  assert(f.state.continuity.records.some((record) => record.id === omitted.id));
});
await runCase("resident-narration/protection", () => {
  const f = fixture(),
    mara = continuityActor(f.state, "mara")!;
  retainNativeFact(
    f.state,
    {
      id: "private-wish",
      kind: "initialization",
      targetId: "mara",
      revision: 1,
      text: "I want to visit the secret observatory.",
      witnesses: ["mara"],
    },
    at,
    { class: "desire", owner: mara },
  );
  const capture = f.capture(),
    record = f.state.continuity.records.find((record) => record.owner?.id === "mara")!,
    key = continuityHolderKey(mara);
  const accepted = acceptResidentNarration(f.state, capture, f.ordinary, memoryHash("private context"), later);
  assert(!accepted.held && accepted.episode);
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
    [mara],
    "forget-private",
    later,
    { forget: true },
  );
  f.cold();
  assert.equal(
    gmEpisodeView(accepted.episode, f.state.continuity, [mara], f.state.episodes),
    null,
    "uncited fitted private context also protects the generated native encounter",
  );
  assert.throws(
    () =>
      acceptResidentNarration(
        f.state,
        { ...capture, opportunity: { ...capture.opportunity, id: "late" } },
        { ...f.ordinary, encounter: { ...f.ordinary.encounter, opportunityId: "late" } },
        memoryHash("stale"),
        later,
      ),
    /protection changed/,
  );
});
await runCase("resident-narration/agreements", () => {
  const f = fixture(),
    terms = "Visit the fair on Saturday, only if Delia comes and nobody cancels work.",
    first = {
      encounter: {
        opportunityId: "opportunity",
        lines: [
          { id: "offer", speakerId: "mara", text: terms },
          { id: "reply", speakerId: "leo", text: "Let me think about those exact conditions." },
        ],
      },
      keep: [
        {
          id: "offer",
          for: ["mara", "leo"],
          class: "commitment",
          text: terms,
          offer: { proposer: "mara", participants: ["mara", "leo"] },
          source: [{ segment: "offer", act: "offer" }],
        },
      ],
      requires: ["offer"],
    };
  assert(!acceptResidentNarration(f.state, f.capture(), first, memoryHash("offer"), later).held);
  const root = f.views("mara")[0].id,
    next = f.capture("next");
  assert(
    !acceptResidentNarration(
      f.state,
      next,
      {
        encounter: {
          opportunityId: "next",
          lines: [
            {
              id: "accept",
              speakerId: "leo",
              text: "I accept those exact conditions, including Delia and neither of us cancelling work.",
            },
            { id: "reply", speakerId: "mara", text: "Then we have a plan." },
          ],
        },
        keep: [
          {
            id: "assent",
            for: ["mara", "leo"],
            replace: root,
            accept: "leo",
            source: [{ segment: "accept", act: "accept" }],
          },
        ],
        requires: ["assent"],
      },
      memoryHash("later assent"),
      later,
    ).held,
  );
  f.cold();
  assert.equal(f.views("leo")[0].offer?.state, "accepted");
  assert.equal(f.views("leo")[0].version.text, terms);
  assert.equal(f.state.continuity.records.filter((record) => record.offer).length, 1);
});

await runCase("resident-narration/due-identities", () => {
  const state = defaultVillageState(),
    actorIds = ["00000000-0000-4000-8000-000000000001", "00000000-0000-4000-8000-000000000002"],
    venueId = "00000000-0000-4000-8000-000000000003",
    zoneId = "00000000-0000-4000-8000-000000000004";
  Object.assign(state, {
    seed: "w".repeat(160),
    setupAt: at,
    foundedAt: at,
    timeZone: "UTC",
    backgroundPace: "lively",
  });
  const venue = venueFixture({ id: venueId, name: "Square", category: "public" });
  const common = venue.zones!.find((zone) => zone.kind !== "exterior")!,
    previousId = common.id;
  common.id = zoneId;
  for (const zone of venue.zones!) zone.connectedTo = zone.connectedTo?.map((id) => (id === previousId ? zoneId : id));
  state.venues = [venue];
  state.villagers = actorIds.map((id) => ({
    characterId: id,
    incarnation: memoryHash(id),
    letterFontId: "caveat",
    addedAt: at,
    cardSnapshot: { id, name: id, capturedAt: at, revision: 1, sourceStatus: "available", tags: [] },
    wishes: [],
    agenda: agendaFixture({
      day: [{ startMinute: 0, endMinute: 1440, venueId, zoneId: "exterior", activity: "Free time", flexible: true }],
    }),
  })) as VillageState["villagers"];
  const candidates = socialPlanCandidates(state, new Date(at)),
    plan = candidates.find((plan) => plan.kind === "meeting")!;
  assert(plan);
  assert(plan.id.length < 80);
  acceptSocialPlan(state, candidates, plan.id, new Date(at));
  const sourceDate = new Date(at);
  sourceDate.setUTCHours(0, plan.startMinute, 0, 0);
  const instant = sourceDate.toISOString(),
    opportunity: ResidentPlanningOpportunity = {
      id: plan.id + ":encounter",
      kind: "encounter",
      startsAt: instant,
      endsAt: instant,
      actorIds,
      venueId,
      zoneId,
      facts: ["An accepted shared-time plan is happening now."],
    };
  const captured = captureResidentNarration(state, opportunity),
    result = acceptResidentNarration(
      state,
      captured,
      {
        encounter: {
          opportunityId: opportunity.id,
          lines: [
            { speakerId: actorIds[0], text: "Hello again." },
            { speakerId: actorIds[1], text: "It is good to see you." },
          ],
        },
        keep: [],
        requires: [],
      },
      memoryHash("UUID meeting"),
      new Date(sourceDate.getTime() + 5 * 60_000).toISOString(),
    );
  assert(!result.held && result.episode);
  const cold = coerceVillageState(JSON.parse(JSON.stringify(state)));
  assert.equal(cold.episodes.records.at(-1)!.submissionId, opportunity.id);
  assert.equal(cold.residentPlans.plans[0].id, plan.id);
});

await runCase("resident-narration/mail-room", () => {
  for (const meaningful of [false, true]) {
    const f = fixture(),
      capture = f.capture(),
      source = capture.room!,
      roomContext = {
        holder: source.holder,
        provenance: source.provenance,
        fingerprint: source.fingerprint,
        protectedRoots: source.protections.map((row) => row.id),
      },
      mail = {
        id: "room-letter",
        at,
        from: continuityActor(f.state, "mara")!,
        to: continuityActor(f.state, "player")!,
      },
      text = "The blue cup is on the shelf beside the oak table.";
    acceptResidentLetter(
      f.state,
      capture.context,
      mail,
      text,
      "room-letter",
      {
        keep: meaningful
          ? [{ id: "cup", for: ["mara", "player"], class: "information", text, source: ["letter"] }]
          : [],
        requires: meaningful ? ["cup"] : [],
      },
      memoryHash("existing resident GM"),
      later,
      roomContext,
    );
    const written = f.state.episodes.records.at(-1)!;
    assert.equal(written.room?.placeId, "square");
    assert.deepEqual(
      written.actors.map((row) => row.id),
      ["mara"],
    );
    assert.equal(f.views("player").length, 0);
    f.cold();
    const record = f.state.continuity.records.find((record) => record.heads[continuityHolderKey(f.room)])!,
      key = continuityHolderKey(f.room);
    f.state.continuity = protectContinuity(
      f.state.continuity,
      { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
      [f.room],
      "correct-room",
      later,
      { text: "A common room with an empty shelf beside an oak table." },
    );
    f.cold();
    assert.equal(
      gmEpisodeView(written, f.state.continuity, [continuityActor(f.state, "mara")!], f.state.episodes),
      null,
      "a generated letter cannot restore protected room context in GM recall",
    );
    assert.equal(f.state.mailbox.messages[mail.id].text, text, "the original signed text stays exact");
    if (meaningful) {
      const before = structuredClone(f.state);
      assert.throws(() => readDeliveredLetter(f.state, mail.id, later), /room context protection changed/);
      assert.deepEqual(f.state, before, "changed context holds saved learning without a new request or partial read");
    } else {
      readDeliveredLetter(f.state, mail.id, later);
      f.cold();
      assert.equal(f.state.mailbox.messages[mail.id].readAt, later);
      assert.equal(
        gmEpisodeView(
          f.state.episodes.records.at(-1)!,
          f.state.continuity,
          [continuityActor(f.state, "player")!],
          f.state.episodes,
        ),
        null,
        "actual reading preserves writer-room ancestry without teaching room truth",
      );
      assert.equal(f.views("player").length, 0);
    }
  }
});

await runCase("resident-narration/room-units", () => {
  for (const wrongScope of ["actor", "foreign-room"]) {
    const f = fixture(),
      mara = continuityActor(f.state, "mara")!,
      roomKey = continuityHolderKey(f.room),
      actorKey = continuityHolderKey(mara);
    retainNativeFact(
      f.state,
      {
        id: "observed-room",
        kind: "structure",
        targetId: JSON.stringify([f.room.placeId, f.room.zoneId]),
        revision: 1,
        text: "A shared room with a cabinet.",
        witnesses: ["mara"],
        observedBy: ["mara"],
      },
      at,
      { room: f.room },
    );
    let versionId: string;
    if (wrongScope === "actor") {
      const record = f.state.continuity.records.find((record) => record.heads[roomKey] && record.heads[actorKey])!;
      f.state.continuity = protectContinuity(
        f.state.continuity,
        { id: record.id, recordRevision: record.revision, heads: { [actorKey]: record.heads[actorKey].revision } },
        [mara],
        "correct-actor-view",
        at,
        { text: "Mara's private account of the room." },
      );
      versionId = f.state.continuity.records.find((row) => row.id === record.id)!.heads[actorKey].versionId;
      assert(f.state.continuity.versions.find((version) => version.id === versionId)!.room);
    } else {
      const venue = venueFixture({ id: "elsewhere", name: "Elsewhere", category: "public" });
      f.state.venues.push(venue);
      const room = {
        kind: "room" as const,
        placeId: venue.id,
        zoneId: venue.zones!.find((zone) => zone.kind !== "exterior")!.id,
      };
      retainNativeFact(
        f.state,
        {
          id: "foreign-room",
          kind: "structure",
          targetId: JSON.stringify([room.placeId, room.zoneId]),
          revision: 1,
          text: "A different room.",
          witnesses: [],
        },
        at,
        { room },
      );
      versionId = f.state.continuity.records.find((record) => record.heads[continuityHolderKey(room)])!.heads[
        continuityHolderKey(room)
      ].versionId;
    }
    f.cold();
    const capture = f.capture(),
      source = capture.room!,
      before = structuredClone(f.state);
    assert.throws(
      () =>
        acceptResidentLetter(
          f.state,
          capture.context,
          { id: "forged-room", at, from: mara, to: continuityActor(f.state, "player")! },
          "An ordinary signed note.",
          "forged-room",
          { keep: [], requires: [] },
          memoryHash("wrong room scope"),
          later,
          {
            holder: source.holder,
            provenance: [JSON.stringify(["version", versionId])],
            fingerprint: source.fingerprint,
            protectedRoots: source.protections.map((row) => row.id),
          },
        ),
      /room context lost its admitted canonical source/,
    );
    assert.deepEqual(f.state, before);
    acceptResidentLetter(
      f.state,
      capture.context,
      { id: "cold-forgery", at, from: mara, to: continuityActor(f.state, "player")! },
      "An ordinary note.",
      "cold-forgery",
      { keep: [], requires: [] },
      memoryHash("valid note"),
      later,
    );
    const forged = structuredClone(f.state.episodes);
    forged.records[forged.records.length - 1].holderDependencies![roomKey] = Object.fromEntries(
      forged.records
        .at(-1)!
        .commandReceipts.filter((receipt) => receipt.mail)
        .map((receipt) => ["mail:" + receipt.mail!.sourceHash, [JSON.stringify(["version", versionId])]]),
    );
    for (const directRoom of [false, true]) {
      f.state.episodes = structuredClone(forged);
      if (directRoom) f.state.episodes.records[f.state.episodes.records.length - 1].room = f.room;
      assert.throws(() => f.cold(), /private room context lost its admitted canonical version/);
    }
  }
});

await runCase("resident-narration/room-history-hop", () => {
  const f = fixture(),
    captured = f.capture(),
    room = captured.room!,
    mara = continuityActor(f.state, "mara")!,
    player = continuityActor(f.state, "player")!,
    first = { id: "room-origin", at, from: mara, to: player };
  acceptResidentLetter(
    f.state,
    captured.context,
    first,
    "The blue cup is on the shelf beside the oak table.",
    "room-origin",
    { keep: [], requires: [] },
    memoryHash("first existing opportunity"),
    later,
    {
      holder: room.holder,
      provenance: room.provenance,
      fingerprint: room.fingerprint,
      protectedRoots: room.protections.map((row) => row.id),
    },
  );
  const next = captureContinuityContext(f.state, ["player", "mara"], "blue cup shelf", at);
  assert(
    JSON.stringify(next.prompt.history).includes("blue cup"),
    "the second GM really receives the first room-derived artifact",
  );
  acceptResidentLetter(
    f.state,
    next,
    { id: "room-descendant", at, from: mara, to: player },
    "As I mentioned, the blue cup is on the shelf.",
    "room-descendant",
    { keep: [], requires: [] },
    memoryHash("second existing opportunity"),
    later,
  );
  const descendant = f.state.episodes.records.at(-1)!;
  const current = f.capture("history-reflection");
  const reflected = acceptResidentNarration(
    f.state,
    current,
    {
      reflection: { actorId: "mara", text: "Mara privately considers moving the blue cup from its shelf." },
      keep: [],
      requires: [],
    },
    memoryHash("existing reflection"),
    later,
  ).episode!;
  acceptResidentLetter(
    f.state,
    current.context,
    { id: "same-room-descendant", at, from: mara, to: player },
    "The blue cup remains on that shelf.",
    "same-room-descendant",
    { keep: [], requires: [] },
    memoryHash("existing room opportunity"),
    later,
    {
      holder: current.room!.holder,
      provenance: current.room!.provenance,
      fingerprint: current.room!.fingerprint,
      protectedRoots: current.room!.protections.map((row) => row.id),
    },
  );
  const sameRoom = f.state.episodes.records.at(-1)!;
  const rejected = acceptMailExchange(
    f.state,
    {
      capture: next,
      incoming: {
        id: "independent-incoming",
        at,
        from: player,
        to: mara,
        text: "Hello.",
        requestId: "independent-incoming",
      },
      incomingMeaning: {
        keep: [{ id: "bad", for: ["player", "mara"], text: "", source: ["letter"], independent: true }],
        requires: [],
      },
      replyText: "Hello back.",
      replyMeaning: { keep: [], requires: [] },
      responseDigest: memoryHash("existing personal mail"),
    },
    later,
  );
  assert(rejected.some((row) => row.id === "bad"));
  assert.equal(f.state.mailbox.messages["independent-incoming"].text, "Hello.");
  assert.equal(f.state.mailbox.messages["independent-incoming:reply"].text, "Hello back.");
  const key = continuityHolderKey(f.room),
    record = f.state.continuity.records.find((record) => record.heads[key])!;
  f.state.continuity = protectContinuity(
    f.state.continuity,
    { id: record.id, recordRevision: record.revision, heads: { [key]: record.heads[key].revision } },
    [f.room],
    "correct-origin-room",
    later,
    { text: "A room with an empty shelf and an oak table." },
  );
  f.cold();
  for (const episode of [descendant, sameRoom, reflected])
    assert.equal(
      gmEpisodeView(episode, f.state.continuity, [mara], f.state.episodes),
      null,
      "room protection must survive actual fitted history in letters and private reflection",
    );
  assert(
    actorEpisodeView(reflected, f.state.continuity, mara, f.state.episodes)?.segments[0].text.includes("blue cup"),
    "individual historical knowledge is distinct from GM room truth",
  );
  const before = structuredClone(f.state);
  assert.throws(
    () =>
      acceptResidentLetter(
        f.state,
        next,
        { id: "queued-descendant", at, from: mara, to: player },
        "A queued letter.",
        "queued-descendant",
        { keep: [], requires: [] },
        memoryHash("existing queued letter"),
        later,
      ),
    /context protection changed/,
  );
  assert.deepEqual(f.state, before);
});
