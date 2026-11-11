import assert from "node:assert/strict";
import {
  defaultVillageState,
  coerceVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { venueDraftFixture as venueDraft } from "./helpers/venues.fixture.js";
import {
  synchronizeVenueZones,
  venueZones,
  zoneClosed,
  chooseAgendaZone,
} from "../packages/villages/src/server/domain/rules/venue-zones.js";
import {
  initializeVenueAccess,
  evaluateZoneAccess,
} from "../packages/villages/src/server/domain/rules/venue-access.js";
import {
  ensureNarrative,
  admitNarrative,
  readNarrativeDevelopment,
  applyNarrativeDevelopment,
} from "../packages/villages/src/server/domain/rules/narrative-development.js";
import {
  environmentObservations,
  ordinaryUseRestricted,
} from "../packages/villages/src/server/domain/rules/narrative-environment.js";
import { deriveVillageMoment } from "../packages/villages/src/server/domain/rules/village-clock.js";
import { contactCanEnter } from "../packages/villages/src/server/domain/rules/venue-contact.js";
import { currentRoomViews } from "../packages/villages/src/server/domain/rules/continuity-retrieval.js";
import {
  initializeRoomContinuity,
  retainNativeFact,
} from "../packages/villages/src/server/domain/rules/native-continuity.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import {
  continuityConstraints,
  continuityHolderKey,
  continuityVersionUnit,
  protectContinuity,
} from "../packages/villages/src/server/domain/rules/continuity.js";
import { readAcceptedEpisode } from "../packages/villages/src/server/domain/decoding/episode-codec.js";
import { assertContinuityRetention } from "../packages/villages/src/server/domain/rules/continuity-retention.js";
import { retainAdministrativeCircumstance } from "../packages/villages/src/server/domain/rules/repair-records.js";
import { villageSettings } from "../packages/villages/src/server/domain/rules/world-snapshot.js";
import { worldNarrativeContext } from "../packages/villages/src/server/domain/rules/narrative-prompts.js";
import { fitVenueWritingMessages } from "../packages/villages/src/server/domain/rules/venue-writing.js";
import {
  encodeContinuityPages,
  decodeContinuityPagesSync,
} from "../packages/villages/src/server/adapters/storage/continuity-pages.js";
import { backgroundRevision } from "../packages/villages/src/server/domain/rules/background-revision.js";
import { captureReturnContext } from "../packages/villages/src/server/domain/rules/return-catchup-capture.js";
import { discoverReturnBatch } from "../packages/villages/src/server/domain/rules/return-catchup-state.js";
import { createReturnCatchup } from "../packages/villages/src/server/features/background/return-catchup-service.js";
import { createNarrative } from "../packages/villages/src/server/features/narrative/narrative-service.js";
import { activityDate } from "../packages/villages/src/server/domain/rules/event-attempts.js";
import { preferredActivityLane } from "../packages/villages/src/server/domain/rules/activity-arbitration.js";
import { arrangementActivityAt } from "../packages/villages/src/server/domain/rules/activity-arbitration.js";
import { sceneHistoryFixture } from "./helpers/scene-history-store.fixture.js";
import { createVillageRepository } from "../packages/villages/src/server/adapters/storage/village-repository.js";
import { WorkFailureError } from "../packages/villages/src/server/domain/rules/work-failure.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";

const start = "2026-10-29T08:00:00.000Z",
  at = "2026-10-29T09:00:00.000Z";
function world() {
  const state = defaultVillageState();
  Object.assign(state, {
    seed: "narrative",
    name: "Harbor",
    setting: "A harbor town.",
    foundedAt: start,
    setupAt: start,
    simulatedThrough: at,
    timeZone: "UTC",
  });
  const venue = venueDraft(
    { id: "hall", name: "Hall", description: "A broad hall with a wooden sign.", category: "public" },
    null,
  );
  synchronizeVenueZones(venue);
  initializeVenueAccess(venue);
  state.venues = [venue];
  const zone = venueZones(venue).find((row) => row.kind !== "exterior")!;
  initializeRoomContinuity(state, venue.id, zone.id, zone.description, "founding", start);
  ensureNarrative(state, start);
  return { state, venue, zone };
}
function admitted(fixture: ReturnType<typeof world>, id = "world:test", instant = at) {
  const grant = admitNarrative(fixture.state, instant, id, "world", {
    venueId: fixture.venue.id,
    zoneId: fixture.zone.id,
  })!;
  fixture.state.narrative!.claims = [
    {
      id,
      attemptId: "attempt:" + id,
      venueId: fixture.venue.id,
      zoneId: fixture.zone.id,
      fingerprint: backgroundRevision(grant),
    },
  ];
  return grant;
}
function proposal(grant: NonNullable<ReturnType<typeof admitNarrative>>) {
  const target = grant.targets[0]!;
  return {
    severity: "gentle",
    occurrence: "Wind loosens the hall sign.",
    situation: {
      scope: "zone",
      id: null,
      expectedRevision: 0,
      title: "Loose sign",
      summary: "The sign needs securing.",
      status: "active",
    },
    room: [{ text: "The sign hangs from one loose bracket.", replace: target.room[0]?.id }] as {
      text: string | null;
      replace?: string;
      expiresInMinutes?: number;
    }[],
    conditions: [
      {
        id: null,
        expectedRevision: 0,
        venueId: target.venueId,
        zoneId: target.zoneId,
        observation: "The loose sign knocks against its bracket.",
        restriction: "ordinary-use",
        remedy: "A controller can enter and secure the bracket.",
        endsAt: null,
        clear: false,
      },
    ],
    weather: null,
  };
}
{
  const fixture = world(),
    { state, venue, zone } = fixture;
  const grant = admitted(fixture, "world:scene-repair");
  const damageProposal = proposal(grant);
  damageProposal.room.push({ text: "A snapped rope lies beside the sign." });
  const damage = applyNarrativeDevelopment(state, grant, damageProposal);
  state.narrative!.claims = [];
  state.backgroundPace = "off";
  const condition = damage.after.conditions[0];
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "ordinary-repair",
      villageSeed: state.seed,
      sceneRevision: 1,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: zone.id,
      startedAt: at,
      lastActivityAt: at,
      status: "active",
      activeIds: [],
      participants: [],
      sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
    }),
    venue,
  );
  scene.continuity = captureSceneContinuity(state, scene, Date.parse(at));
  const beforeObserver = structuredClone(state);
  const repaired = "The wooden sign sits firmly on its bracket.";
  const observedSign = narrationContinuityContext(state, scene, venue, "notice-damage", "I look at the sign.", at);
  const observeReadset = fittedNarrationReadset(
    state,
    observedSign,
    observedSign.parts.map((part) => part.block.evidenceId!),
  );
  const observation = {
    segments: [{ id: "see", kind: "narration", text: "You see the loose sign." }],
    keep: [
      {
        id: "learn",
        for: "room",
        replace: condition.repairEntries![0],
        knownBy: ["player"],
        source: [{ segment: "see", perceive: { kind: "seen", by: ["player"] } }],
      },
    ],
  };
  const learned = acceptNarration(
    state,
    { raw: observation, readset: observeReadset, responseDigest: memoryHash(observation) },
    "see-damage",
    at,
  );
  assert.equal(learned.held, false, JSON.stringify(learned.rejected));
  const player = observeReadset.source.actors.find((actor) => actor.id === "player")!;
  const record = state.continuity.records.find((row) => row.id === condition.repairEntries![0])!;
  const playerKey = continuityHolderKey(player);
  state.continuity = protectContinuity(
    state.continuity,
    { id: record.id, recordRevision: record.revision, heads: { [playerKey]: record.heads[playerKey].revision } },
    [player],
    "correct-observer",
    at,
    { text: repaired },
  );
  const context = narrationContinuityContext(
    state,
    scene,
    venue,
    "corrective-work",
    "I secure the sign to its bracket.",
    at,
  );
  assert.equal(context.circumstance, null);
  assert.deepEqual(context.repairs, [
    { id: condition.id, revision: condition.revision, entries: condition.repairEntries },
  ]);
  const readset = fittedNarrationReadset(
    state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  const droppedEntry = "room-context:" + condition.repairEntries![1];
  const blocks = context.parts.map((part) => part.block);
  const droppedText = blocks.find((block) => block.evidenceId === droppedEntry)!.text;
  const fit = fitVenueWritingMessages(
    {
      fitContext(messages: any[]) {
        return { messages: messages.some((message) => message.content.includes(droppedText)) ? [] : messages } as any;
      },
    },
    blocks,
    readset.source.input,
    1000,
  );
  assert.ok(!fit.evidenceIds.includes("repair-context:" + condition.id));
  assert.ok(fit.evidenceIds.includes("room-context:" + condition.repairEntries![0]));
  assert.deepEqual(fittedNarrationReadset(state, context, fit.evidenceIds).repairs, []);
  const observed = { segment: "work", perceive: { kind: "seen", by: ["player"] } };
  const protection = { roots: [] as string[], disposition: "clear" };
  const raw = {
    segments: [
      {
        id: "work",
        kind: "narration",
        text: "You secure the sign with its original bracket and remove the snapped rope.",
        requires: ["reopen"],
      },
      { id: "glance", kind: "narration", text: "Rain dots the floor." },
    ],
    keep: [
      {
        id: "repair-sign",
        for: "room",
        replace: condition.repairEntries![0],
        text: repaired,
        source: [observed],
        protection,
      },
      {
        id: "clear-rope",
        for: "room",
        replace: condition.repairEntries![1],
        text: null,
        source: [observed],
        protection,
      },
    ],
    commands: [
      {
        id: "reopen",
        type: "circumstance",
        at: "work",
        source: [observed],
        requires: ["repair-sign", "clear-rope"],
        conditions: [{ id: condition.id, clear: true }],
      },
    ],
  };
  for (const variant of [
    "stale",
    "no-link",
    "missing-entry",
    "addition",
    "same-text",
    "concealed",
    "separate-observation",
    "unfitted",
    "optional-bad-source",
    "room-only",
    "future-invitation",
  ]) {
    const live = structuredClone(state),
      reply: any = structuredClone(raw),
      fitted = structuredClone(readset);
    if (variant === "stale") live.narrative!.conditions[0].revision++;
    if (variant === "no-link") reply.commands[0].requires = [];
    if (variant === "missing-entry") reply.keep.pop();
    if (variant === "addition") delete reply.keep[0].replace;
    if (variant === "same-text") reply.keep[0].text = "The sign hangs from one loose bracket.";
    if (variant === "concealed") reply.keep[0].visibility = "concealed";
    if (variant === "separate-observation") reply.keep[0].source[0].segment = "glance";
    if (variant === "unfitted") fitted.repairs = [];
    if (variant === "optional-bad-source") {
      reply.commands[0].independent = true;
      reply.commands[0].source[0].segment = "missing";
      reply.segments[0].requires = [];
      reply.keep.pop();
    }
    if (variant === "room-only") {
      reply.commands = [];
      reply.segments[0].requires = [];
    }
    if (variant === "future-invitation") {
      const current = live.venues[0].zones!.find((row) => row.id === zone.id)!;
      current.access!.managerIds = ["keeper"];
      live.venues[0].access!.permissions.push({
        id: "future-visit",
        zoneId: zone.id,
        visitorId: "player",
        issuerId: "keeper",
        duration: "visit",
        sceneId: null,
        accompaniedBy: null,
        outsideHours: false,
        revoked: false,
        issuedAt: at,
        sourceLineIds: [],
      });
    }
    const before = memoryHash(live);
    const result = acceptNarration(
      live,
      { raw: reply, readset: fitted, responseDigest: memoryHash(reply) },
      "repair-turn",
      at,
    );
    assert.equal(result.held, true, variant);
    assert.equal(memoryHash(live), before, variant + " publishes neither Room nor condition");
  }
  const publication = { raw, readset, responseDigest: memoryHash(raw) };
  const corrected = beforeObserver;
  const roomKey = continuityHolderKey(context.room);
  const linked = corrected.continuity.records.find((row) => row.id === condition.repairEntries![1])!;
  corrected.continuity = protectContinuity(
    corrected.continuity,
    { id: linked.id, recordRevision: linked.revision, heads: { [roomKey]: linked.heads[roomKey].revision } },
    [context.room],
    "correct-room-record",
    at,
    { text: "A frayed rope lies next to the sign." },
  );
  const correctedContext = narrationContinuityContext(
    corrected,
    scene,
    venue,
    "corrective-work",
    readset.source.input,
    at,
  );
  const correctedReadset = fittedNarrationReadset(
    corrected,
    correctedContext,
    correctedContext.parts.map((part) => part.block.evidenceId!),
  );
  const correctedRaw = structuredClone(raw);
  correctedRaw.keep[1].protection = { ...protection, roots: [linked.id] };
  correctedRaw.keep[1].text = "The floor beside the sign is clear.";
  for (const scope of ["same-root", "different-root", "new-root"]) {
    const resurrected: any = structuredClone(correctedRaw);
    const text = "A snapped rope lies beside the sign.";
    if (scope === "same-root") resurrected.keep[1].text = text;
    if (scope === "different-root") resurrected.keep[0].text = text;
    if (scope === "new-root") resurrected.keep.push({ id: "extra", for: "room", text, source: [observed], protection });
    const refused = acceptNarration(
      corrected,
      { raw: resurrected, readset: correctedReadset, responseDigest: memoryHash(resurrected) },
      "repair-turn",
      at,
    );
    assert.equal(refused.held, true, scope + " cannot restore the exact protected text");
    assert.ok(
      refused.rejected.some((row) => row.reason.includes("protected Room text")),
      JSON.stringify(refused.rejected),
    );
  }
  const correctedResult = acceptNarration(
    corrected,
    { raw: correctedRaw, readset: correctedReadset, responseDigest: memoryHash(correctedRaw) },
    "repair-turn",
    at,
  );
  assert.equal(correctedResult.held, false, JSON.stringify(correctedResult.rejected));
  const fresh = currentRoomViews(corrected.continuity, corrected.episodes, context.room, at).find(
    (row) => row.id === linked.id,
  )!;
  assert.equal(fresh.repaired, false);
  assert.equal(fresh.version.sources[0].episodeId, correctedResult.episode!.id);
  const constraint = continuityConstraints(corrected.continuity, [context.room]).find((row) => row.id === linked.id)!;
  assert.equal(constraint.corrected, undefined);
  assert.ok(constraint.forbidden.includes("A snapped rope lies beside the sign."));
  const bound = structuredClone(state);
  const boundZone = bound.venues[0].zones!.find((row) => row.id === zone.id)!;
  boundZone.access!.managerIds = ["keeper"];
  boundZone.access!.visitorHours = [{ days: ["Thursday"], start: "08:00", end: "10:00" }];
  bound.venues[0].access!.permissions.push({
    id: "bound-visit",
    zoneId: zone.id,
    visitorId: "player",
    issuerId: "keeper",
    duration: "visit",
    sceneId: scene.id,
    accompaniedBy: null,
    outsideHours: false,
    revoked: false,
    issuedAt: at,
    sourceLineIds: [],
  });
  bound.timeZone = "America/Los_Angeles";
  const boundResult = acceptNarration(bound, publication, "repair-turn", at);
  assert.equal(boundResult.held, false, JSON.stringify(boundResult.rejected));
  const result = acceptNarration(state, publication, "repair-turn", at);
  assert.equal(result.held, false, JSON.stringify(result.rejected));
  assert.equal(state.narrative!.conditions[0].clearedAt, at);
  assert.equal(ordinaryUseRestricted(state.narrative, at, venue.id, zone.id), false);
  assert.equal(state.eventAttempts?.attempts.length ?? 0, 0);
  const holder = { kind: "room" as const, placeId: venue.id, zoneId: zone.id };
  assert.equal(currentRoomViews(state.continuity, state.episodes, holder, at)[0].version.text, repaired);
  assert.deepEqual(result.episode!.commandReceipts[0].repairEntries, condition.repairEntries);
  const key = "a".repeat(32),
    encoded = encodeContinuityPages(
      {
        continuity: state.continuity,
        episodes: state.episodes,
        worldPlaces: state.worldPlaces,
        mailbox: state.mailbox,
      },
      key,
    );
  Object.assign(
    state,
    decodeContinuityPagesSync(encoded.manifest, key, state.seed, (id) => encoded.pages.get(id) ?? null).value,
  );
  const before = memoryHash(state);
  assert.ok(acceptNarration(state, publication, "repair-turn", at).replayed);
  assert.equal(memoryHash(state), before);
}
{
  const fixture = world(),
    { state, venue, zone } = fixture;
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "conceal",
      villageSeed: state.seed,
      sceneRevision: 1,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: zone.id,
      startedAt: at,
      lastActivityAt: at,
      status: "active",
      activeIds: [],
      participants: [],
      sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
    }),
    venue,
  );
  scene.continuity = captureSceneContinuity(state, scene, Date.parse(at));
  const context = narrationContinuityContext(state, scene, venue, "conceal", "I tuck a letter under the rug.", at);
  const readset = fittedNarrationReadset(
    state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  const secret = "A letter stamped Juniper lies beneath the rug.";
  const raw = {
    segments: [
      {
        id: "hide",
        kind: "narration",
        text: "You tuck a letter stamped Juniper beneath the rug.",
        requires: ["hidden"],
      },
    ],
    keep: [
      {
        id: "hidden",
        for: "room",
        text: secret,
        visibility: "concealed",
        knownBy: ["player"],
        source: [{ segment: "hide", perceive: { kind: "seen", by: ["player"] } }],
      },
    ],
  };
  const accepted = acceptNarration(state, { raw, readset, responseDigest: memoryHash(raw) }, "concealed-turn", at);
  assert.equal(accepted.held, false, JSON.stringify(accepted.rejected));
  const holder = { kind: "room" as const, placeId: venue.id, zoneId: zone.id };
  const entry = currentRoomViews(state.continuity, state.episodes, holder, at).find(
    (row) => row.version.text === secret,
  )!;
  const grant = () => admitNarrative(state, at, "world:conceal", "world", { venueId: venue.id, zoneId: zone.id })!;
  assert.ok(!JSON.stringify(worldNarrativeContext(grant())).includes("Juniper"));
  state.continuity = protectContinuity(
    state.continuity,
    {
      id: entry.id,
      recordRevision: entry.recordRevision,
      heads: { [continuityHolderKey(holder)]: entry.headRevision },
    },
    [holder],
    "correct-hidden-room",
    at,
    { text: "A letter stamped Juniper has been sealed." },
  );
  const protectedGrant = grant();
  assert.equal(protectedGrant.targets[0].roomWritable, false);
  assert.ok(!JSON.stringify(worldNarrativeContext(protectedGrant)).includes("Juniper"));
  assert.deepEqual(protectedGrant.targets[0].protections, []);
}
{
  const fixture = world(),
    { state, venue, zone } = fixture;
  const room = { kind: "room" as const, placeId: venue.id, zoneId: zone.id };
  for (let index = 0; index < 3; index++)
    retainNativeFact(
      state,
      {
        id: "decor-" + index,
        kind: "structure",
        targetId: JSON.stringify([venue.id, zone.id]),
        revision: 1,
        text: index + " " + "Detailed decorations. ".repeat(560),
        witnesses: [],
      },
      start,
      { room },
    );
  const grant = admitted(fixture, "world:large-room"),
    raw = proposal(grant);
  assert.equal(grant.targets[0].roomWritable, false);
  assert.deepEqual(grant.targets[0].room, []);
  assert.throws(() => applyNarrativeDevelopment(state, grant, raw), /finite grant/);
  raw.room = [];
  raw.conditions = [];
  applyNarrativeDevelopment(state, grant, {
    ...raw,
    weather: { description: "drizzle", endsAt: "2026-10-29T10:00:00.000Z", supersedes: null },
  });
  assert.equal(currentRoomViews(state.continuity, state.episodes, room, at).length, 4);
  assert.equal(state.narrative!.weather?.description, "drizzle");
}
{
  const fixture = world(),
    { state, venue, zone } = fixture;
  const exterior = venueZones(venue).find((row) => row.kind === "exterior")!;
  initializeRoomContinuity(state, venue.id, exterior.id, exterior.description, "founding-exterior", start);
  const grant = admitted(fixture),
    proposalValue = proposal(grant);
  proposalValue.situation.scope = "village";
  const receipt = applyNarrativeDevelopment(state, grant, proposalValue);
  const circumstance = state.episodes.records.at(-1)!;
  assert.throws(() => readAcceptedEpisode({ ...circumstance, grounding: [] }, state.seed), /standalone World Room/);
  const [foreign] = currentRoomViews(
    state.continuity,
    state.episodes,
    { kind: "room", placeId: venue.id, zoneId: exterior.id },
    at,
  );
  const forged = structuredClone(state.episodes);
  forged.records.at(-1)!.dependencies = {
    [circumstance.grounding[0].unitId]: [continuityVersionUnit(foreign.version.id)],
  };
  assert.throws(() => assertContinuityRetention(state.continuity, forged), /admitted observable version/);
  const player = { name: "Player", description: "", personaId: "", missing: false };
  assert.ok(!JSON.stringify(villageSettings(state, player, null)).includes(proposalValue.situation.summary));
  const situation = state.narrative!.situations.find((row) => row.id === receipt.after.situations[0].id)!;
  situation.revision++;
  retainAdministrativeCircumstance(state, situation.id, "metadata-only", at);
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "another-room",
      villageSeed: state.seed,
      sceneRevision: 1,
      placeId: venue.id,
      placeName: venue.name,
      zoneId: exterior.id,
      startedAt: at,
      lastActivityAt: at,
      status: "active",
      activeIds: [],
      participants: [],
      sceneAttendance: { capturedAt: at, layout: captureSceneLayout(venue), occupants: [] },
    }),
    venue,
  );
  scene.continuity = captureSceneContinuity(state, scene, Date.parse(at));
  const context = narrationContinuityContext(state, scene, venue, "cross-room", "What happened?", at);
  assert.ok(context.parts.some((part) => part.block.text.includes(proposalValue.situation.summary)));
  const readset = fittedNarrationReadset(
    state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
  const raw = { segments: [{ kind: "narration", text: "You notice the effects of the loose sign from here." }] };
  assert.equal(
    acceptNarration(state, { raw, readset, responseDigest: memoryHash(raw) }, "another-room-turn", at).held,
    false,
  );
  const holder = { kind: "room" as const, placeId: venue.id, zoneId: zone.id };
  const [entry] = currentRoomViews(state.continuity, state.episodes, holder, at);
  state.continuity = protectContinuity(
    state.continuity,
    {
      id: entry.id,
      recordRevision: entry.recordRevision,
      heads: { [continuityHolderKey(holder)]: entry.headRevision },
    },
    [holder],
    "correct-world-origin",
    at,
    { text: "The bracket was made of brass." },
  );
  const key = "a".repeat(32),
    encoded = encodeContinuityPages(
      {
        continuity: state.continuity,
        episodes: state.episodes,
        worldPlaces: state.worldPlaces,
        mailbox: state.mailbox,
      },
      key,
    );
  Object.assign(
    state,
    decodeContinuityPagesSync(encoded.manifest, key, state.seed, (id) => encoded.pages.get(id) ?? null).value,
  );
  const after = narrationContinuityContext(state, scene, venue, "after-correction", "What happened?", at);
  assert.ok(
    after.parts.every(
      (part) =>
        !part.block.text.includes(proposalValue.situation.summary) && !part.block.text.includes(raw.segments[0].text),
    ),
  );
  assert.ok(!JSON.stringify(villageSettings(state, player, null)).includes(proposalValue.situation.summary));
}
{
  const fixture = world(),
    grant = admitted(fixture);
  const raw = proposal(grant),
    effect = readNarrativeDevelopment(raw, grant);
  const oldScene: any = {
    id: "old",
    villageSeed: fixture.state.seed,
    startedAt: at,
    placeId: fixture.venue.id,
    zoneId: fixture.zone.id,
    area: "public",
    activeIds: [],
    participants: [],
    lines: [],
    submissions: [],
    status: "active",
  };
  oldScene.continuity = captureSceneContinuity(fixture.state, oldScene, Date.parse(at));
  assert.equal(fixture.state.villagers.length, 0, "Environmental admission needs no resident actor.");
  const image = fixture.zone.image;
  const receipt = applyNarrativeDevelopment(fixture.state, grant, effect);
  assert.equal(
    sceneContinuityView(fixture.state, oldScene).narrative!.conditions.length,
    0,
    "A background publication cannot rewrite an active Scene snapshot.",
  );
  const holder = { kind: "room" as const, placeId: fixture.venue.id, zoneId: fixture.zone.id };
  const room = () => currentRoomViews(fixture.state.continuity, fixture.state.episodes, holder, at);
  assert.equal(room()[0].version.text, "The sign hangs from one loose bracket.");
  assert.equal(fixture.zone.image, image, "The event does not replace artwork or request an image.");
  assert.equal(
    applyNarrativeDevelopment(fixture.state, grant, effect),
    receipt,
    "Exact source replay does not apply twice.",
  );
  assert.equal(room()[0].id, grant.targets[0]!.room[0].id);
  assert.throws(
    () => applyNarrativeDevelopment(fixture.state, grant, { ...effect, occurrence: "Another event." }),
    /another result/,
  );
  assert.equal(
    zoneClosed(fixture.state, fixture.venue, fixture.zone),
    false,
    "Environmental use restrictions never become construction closures.",
  );
  const context = { at: new Date(at), environment: fixture.state.narrative };
  assert.equal(evaluateZoneAccess(fixture.venue, fixture.zone, "visitor", context).allowed, false);
  assert.equal(
    evaluateZoneAccess(fixture.venue, fixture.zone, "player", context).allowed,
    true,
    "A controller can enter for corrective work.",
  );
  assert.equal(ordinaryUseRestricted(fixture.state.narrative, at, fixture.venue.id, fixture.zone.id), true);
  assert.notEqual(
    chooseAgendaZone(fixture.venue, "player", "Reading", fixture.zone.id, fixture.state, { at: new Date(at) }).id,
    fixture.zone.id,
    "Ordinary routines select an available alternative.",
  );
  assert.equal(
    chooseAgendaZone(fixture.venue, "player", "Repairing", fixture.zone.id, fixture.state, { at: new Date(at) }).id,
    fixture.zone.id,
    "A controller's corrective activity remains possible.",
  );
  assert.deepEqual(
    Object.keys(environmentObservations(fixture.state.narrative, at, fixture.venue.id, fixture.zone.id)[0]!),
    ["id", "revision", "observation", "restriction", "remedy"],
    "Perception contains no raw source, hidden cause or global records.",
  );
  const condition = fixture.state.narrative!.conditions[0]!;
  const nextScene = { ...oldScene, id: "after-world", continuity: undefined };
  nextScene.continuity = captureSceneContinuity(fixture.state, nextScene, Date.parse(at));
  const contextAfter = narrationContinuityContext(
    fixture.state,
    nextScene,
    fixture.venue,
    "after-world",
    "What happened to the sign?",
    at,
  );
  assert.ok(contextAfter.parts.some((part) => part.block.text.includes("The sign needs securing.")));
  assert.ok(contextAfter.parts.some((part) => part.block.text.includes("The sign hangs from one loose bracket.")));
  assert.deepEqual(condition.repairEntries, [room()[0].id]);
  fixture.state.narrative!.claims = [];
  const repairGrant = admitted(fixture, "world:repair");
  const repairProposal = proposal(repairGrant);
  assert.throws(
    () =>
      applyNarrativeDevelopment(fixture.state, repairGrant, {
        ...repairProposal,
        room: [{ replace: condition.repairEntries![0], text: null }],
        conditions: [],
      }),
    /remove an active restriction's repair target/,
  );
  repairProposal.room = [{ text: "The sign was inspected.", expiresInMinutes: 15 }];
  Object.assign(repairProposal.situation, {
    id: receipt.after.situations[0].id,
    expectedRevision: 1,
    status: "resolved",
  });
  Object.assign(repairProposal.conditions[0]!, { id: condition.id, expectedRevision: condition.revision, clear: true });
  const beforeRepair = JSON.stringify(fixture.state);
  assert.throws(
    () => applyNarrativeDevelopment(fixture.state, repairGrant, repairProposal),
    /matching physical work/,
    "A temporary observation cannot reopen a repair-linked condition.",
  );
  assert.equal(
    JSON.stringify(fixture.state),
    beforeRepair,
    "A failed result publishes neither the proposed Room entry nor a condition.",
  );
  repairProposal.room = [];
  Object.assign(repairProposal.conditions[0]!, { clear: false, endsAt: "2026-10-29T10:00:00.000Z" });
  assert.throws(
    () => applyNarrativeDevelopment(fixture.state, repairGrant, repairProposal),
    /cannot expire/,
    "Continuing a damage-linked condition cannot add a timer that bypasses repair.",
  );
  repairProposal.room = [{ replace: condition.repairEntries![0], text: "The sign is secured firmly to its bracket." }];
  Object.assign(repairProposal.conditions[0]!, { clear: true, endsAt: null });
  applyNarrativeDevelopment(fixture.state, repairGrant, repairProposal);
  assert.equal(ordinaryUseRestricted(fixture.state.narrative, at, fixture.venue.id, fixture.zone.id), false);
  assert.equal(evaluateZoneAccess(fixture.venue, fixture.zone, "visitor", context).allowed, true);
  assert.equal(room()[0].version.text, "The sign is secured firmly to its bracket.");
  assert.equal(
    contactCanEnter(fixture.state, fixture.venue, fixture.zone.id, "visitor", nextScene),
    false,
    "A saved Scene retains its admitted restriction.",
  );
  assert.deepEqual(
    coerceVillageState(fixture.state).narrative,
    fixture.state.narrative,
    "Current-format persistence retains effects and receipts.",
  );
  assert.equal(
    coerceVillageState({ ...fixture.state, narrative: undefined }).narrative,
    undefined,
    "Missing additive narrative state never invents historical events.",
  );
}
{
  const fixture = world();
  fixture.venue.access = undefined;
  fixture.zone.controllerIds = [];

  const grant = admitted(fixture),
    raw = proposal(grant);
  assert.equal(grant.targets[0]!.correctiveActorIds.length, 0);
  raw.room = [];
  assert.throws(() => readNarrativeDevelopment(raw, grant), /accessible corrective work/);
  raw.conditions[0]!.endsAt = "2026-10-29T10:00:00.000Z" as any;
  const temporary = readNarrativeDevelopment(raw, grant);
  applyNarrativeDevelopment(fixture.state, grant, temporary);
  assert.equal(
    contactCanEnter(fixture.state, fixture.venue, fixture.zone.id, "visitor", {
      id: "new-contact",
      startedAt: at,
      zoneId: "exterior",
    } as any),
    false,
    "Public contact obeys a current temporary restriction.",
  );
  const damaged = world(),
    damageGrant = admitted(damaged),
    damage = proposal(damageGrant);
  damage.conditions[0]!.endsAt = "2026-10-29T10:00:00.000Z" as any;
  assert.throws(
    () => applyNarrativeDevelopment(damaged.state, damageGrant, readNarrativeDevelopment(damage, damageGrant)),
    /cannot expire/,
    "A timer cannot substitute for repairing enduring physical damage.",
  );
}
{
  const fixture = world();
  fixture.state.residentPlans.plans.push({
    kind: "meeting",
    status: "planned",
    dateKey: "2026-10-30",
    startMinute: 10,
    endMinute: 20,
    actors: [],
  } as any);
  assert.equal(
    arrangementActivityAt(fixture.state, new Date("2026-10-29T23:55:00.000Z")),
    Date.parse("2026-10-30T00:10:00.000Z"),
    "Near accepted arrangements retain priority across midnight.",
  );
  const first = admitNarrative(fixture.state, at, "first")!;
  fixture.state.eventAttempts = {
    highWaterDate: "2026-10-29",
    lastAttemptAt: at,
    attempts: [
      { id: "world", date: "2026-10-29", at, origin: "world" },
      { id: "resident", date: "2026-10-29", at, origin: "resident" },
    ],
  };
  const second = admitNarrative(fixture.state, at, "second")!;
  assert.notEqual(
    first.targets[0]!.zoneId,
    second.targets[0]!.zoneId,
    "Intervening resident reviews cannot make world rotation skip half the Zones.",
  );
}
{
  const fixture = world(),
    grant = admitted(fixture),
    raw = proposal(grant);
  assert.throws(() => readNarrativeDevelopment({ ...raw, owners: ["player"] }, grant), /Unsupported/);
  assert.throws(
    () => readNarrativeDevelopment({ ...raw, room: [{ text: "Change elsewhere.", replace: "remote" }] }, grant),
    /not admitted/,
  );
  assert.throws(
    () =>
      applyNarrativeDevelopment(
        fixture.state,
        { ...grant, targets: [...grant.targets, grant.targets[0]!] },
        readNarrativeDevelopment(raw, grant),
      ),
    /context changed/,
  );
  assert.throws(
    () =>
      applyNarrativeDevelopment(fixture.state, { ...grant, id: "fabricated" }, readNarrativeDevelopment(raw, grant)),
    /matching shared/,
  );
  fixture.state.narrativeConsequence = "moderate";
  const dramatic = readNarrativeDevelopment({ ...raw, severity: "dramatic" }, grant);
  assert.throws(() => applyNarrativeDevelopment(fixture.state, grant, dramatic), /Consequence was lowered/);
  fixture.state.narrative!.claims = [];
  const newer = admitted(fixture, "world:new-room-head");
  applyNarrativeDevelopment(fixture.state, newer, proposal(newer));
  assert.throws(
    () => applyNarrativeDevelopment(fixture.state, grant, readNarrativeDevelopment(raw, grant)),
    /Zone changed/,
  );
}
{
  const fixture = world(),
    grant = admitted(fixture),
    raw = proposal(grant);
  raw.conditions = [];
  raw.room = [];
  const weather = { description: "heavy rain", endsAt: "2026-10-30T01:00:00.000Z", supersedes: null };
  assert.throws(
    () =>
      readNarrativeDevelopment({ ...raw, weather: { ...weather, description: "Rain on the hidden letter." } }, grant),
    /supplied weather/,
  );
  applyNarrativeDevelopment(fixture.state, grant, readNarrativeDevelopment({ ...raw, weather }, grant));
  const moment = (instant: string, environment = fixture.state.narrative) =>
    deriveVillageMoment({
      foundedAt: start,
      seed: fixture.state.seed,
      timeZone: "UTC",
      now: new Date(instant),
      environment,
    });
  assert.equal(moment(at).weather, weather.description);
  assert.equal(moment(weather.endsAt).weather, moment(weather.endsAt, undefined).weather);
  const baseline = deriveVillageMoment({
    foundedAt: start,
    seed: fixture.state.seed,
    timeZone: "UTC",
    now: new Date(weather.endsAt),
  });
  assert.equal(moment(weather.endsAt).weather, baseline.weather, "Expiry reveals the current deterministic baseline.");
  const snapshot = structuredClone(fixture.state.narrative);
  fixture.state.narrative!.claims = [];
  const next = admitted(fixture, "world:second", "2026-10-29T10:00:00.000Z");
  assert.throws(
    () =>
      applyNarrativeDevelopment(fixture.state, next, readNarrativeDevelopment({ ...proposal(next), weather }, next)),
    /supersession/,
  );
  assert.throws(
    () => readNarrativeDevelopment({ ...proposal(next), weather }, { ...next, source: "scene" }),
    /Scene cannot/,
  );
  assert.equal(
    moment(at, snapshot).weather,
    weather.description,
    "Captured authority remains independent of later live weather.",
  );
}
{
  const fixture = world();
  fixture.state.returnCatchup = { capture: captureReturnContext(fixture.state, new Date(start)) };
  const changed = structuredClone(fixture.state);
  changed.continuity.revision++;
  discoverReturnBatch(changed, new Date("2026-10-29T20:00:00.000Z"), "changed-absence");
  assert.deepEqual(
    changed.returnCatchup!.batch!.opportunities,
    [],
    "A changed Room collection cannot stand in for the departure snapshot.",
  );
  discoverReturnBatch(fixture.state, new Date("2026-10-29T20:00:00.000Z"), "absence");
  const batch = fixture.state.returnCatchup!.batch!;
  assert.equal(batch.opportunities!.length, 6);
  assert.ok(batch.opportunities!.every((row) => row.kind === "world" && !row.actorIds.length));
  assert.equal(batch.opportunityLimit, 6);
  assert.ok(batch.opportunities!.every((row) => row.startsAt >= fixture.state.narrative!.adoptedAt));
  assert.equal(coerceVillageState(fixture.state).returnCatchup!.batch!.opportunities!.length, 6);
  let queued = 0;
  const service = createReturnCatchup({
    readAuthority: async () => fixture.state,
    mutateAuthority: async (change) => {
      change(fixture.state);
    },
    readSnapshot: async () => {
      throw new Error("Unrelated social sidecar is offline");
    },
    mutate: async (change) => {
      change(fixture.state);
      return fixture.state;
    },
    queue: async () => {
      queued++;
    },
    job: async () => null,
    retryJob: async () => {},
    cancel: async () => {},
    settle: async () => "settled",
    reinterpret: async () => {},
    hasPresence: () => true,
    now: () => new Date("2026-10-29T20:00:00.000Z"),
  });
  await service.advance();
  assert.equal(queued, 1, "A world-only absence source never hydrates or processes social state.");
  for (const fails of [false, true]) {
    batch.status = "failed";
    let attempts = 0;
    const retry = createReturnCatchup({
      readAuthority: async () => fixture.state,
      mutateAuthority: async (change) => change(fixture.state),
      readSnapshot: async () => fixture.state,
      mutate: async (change) => {
        change(fixture.state);
        return fixture.state;
      },
      queue: async () => {
        attempts++;
        if (fails) throw new Error("Temporary admission failure");
      },
      job: async () => null,
      retryJob: async () => {},
      cancel: async () => {},
      settle: async () => "settled",
      reinterpret: async () => {},
      hasPresence: () => true,
      now: () => new Date("2026-10-29T20:00:00.000Z"),
    });
    delete batch.records![0].automaticRetryUsed;
    await retry.advance();
    assert.equal(attempts, 1, "An existing pre-job failure receives one automatic retry.");
    assert.equal(batch.records![0].automaticRetryUsed, true);
    assert.equal(coerceVillageState(fixture.state).returnCatchup!.batch!.records![0].automaticRetryUsed, true);
    if (fails) {
      await retry.advance();
      assert.equal(attempts, 1, "Polling cannot reset the saved preparation retry allowance.");
      assert.equal(batch.status, "failed");
    }
  }
}
{
  const f = sceneHistoryFixture();
  try {
    const repository = createVillageRepository(() => f.documents),
      fixture = world();
    await repository.mutateAuthority((state) => Object.assign(state, fixture.state), { memories: true });
    await repository.mutateAuthority(
      (state) => {
        state.returnCatchup = { capture: captureReturnContext(state, new Date(start)) };
        discoverReturnBatch(state, new Date("2026-10-29T20:00:00.000Z"), "stored-absence");
        state.returnCatchup!.batch!.status = "running";
        state.returnCatchup!.batch!.records![0].status = "queued";
      },
      { memories: true },
    );
    const loaded = await repository.readAuthority({ memories: true });
    let queued: any;
    const service = createNarrative({
      read: (options) => repository.readAuthority(options),
      mutate: (update) => repository.mutateAuthority(update),
      socialSnapshot: async () => {
        throw new Error("World catch-up must not need social state");
      },
      resident: async () => {},
      queue: async (job) => {
        queued = structuredClone(job);
      },
      job: async () => null,
      models: (() => {
        throw new Error("No model dispatch during admission");
      }) as any,
      connection: async () => "fixture",
      complete: async () => {
        throw new Error("No model dispatch during admission");
      },
      now: () => new Date("2026-10-29T20:00:00.000Z"),
      afterCatchup: async () => {},
    });
    const batch = loaded.returnCatchup!.batch!;
    await service.queueReturnOpportunity(batch.id, batch.opportunities![0], loaded.returnCatchup!.capture!);
    assert.equal(
      queued.kind,
      "world-development",
      "Stored departure Room continuity is loaded before validating World catch-up.",
    );
    assert.equal(service.handler.valid(loaded, queued.input), true);
    loaded.returnCatchup!.batch!.opportunities![0].facts.push("A different saved opportunity.");
    assert.equal(service.handler.valid(loaded, queued.input), false);
  } finally {
    f.release();
    f.gate.dispose();
  }
}
{
  const fixture = world();
  let queued: any,
    residentReads = 0;
  let answers: unknown[] = [];
  const service = createNarrative({
    read: async () => fixture.state,
    mutate: async (update) => {
      update(fixture.state);
    },
    socialSnapshot: async () => {
      throw new Error("Social processing unavailable");
    },
    resident: async () => {
      residentReads++;
      throw new Error("Resident recovery held");
    },
    queue: async (job) => {
      queued = job;
    },
    job: async () => null,
    models: (() => ({
      resolveForRequest: async () => ({
        fitContext: (messages: unknown, options: object) => ({ messages, ...options }),
      }),
    })) as any,
    connection: async () => "fixture",
    complete: async () => {
      assert.ok(answers.length, "No request during local admission");
      return { content: JSON.stringify(answers.shift()) } as any;
    },
    now: () => new Date(at),
    afterCatchup: async () => {},
  });
  await service.reconcile(new Date(at));
  assert.equal(queued.kind, "world-development");
  assert.equal(residentReads, 0);
  assert.equal(queued.automaticDate, activityDate(fixture.state, new Date(at)));
  assert.equal(queued.input.grant.targets.length, 1);
  assert.equal(service.handler.authority, "raw");
  service.handler.reserve!(fixture.state, queued.input, "saved-attempt");
  assert.equal(service.handler.valid(fixture.state, queued.input), true);
  assert.equal(
    admitNarrative(fixture.state, at, "other", "world", {
      venueId: fixture.venue.id,
      zoneId: queued.input.grant.targets[0].zoneId,
    }),
    null,
    "Unresolved claims suppress competing autonomous work at that target.",
  );
  fixture.state.eventAttempts = {
    highWaterDate: "2026-10-29",
    lastAttemptAt: at,
    attempts: [{ id: "saved-attempt", date: "2026-10-29", at, origin: "world" }],
  };
  assert.equal(preferredActivityLane(fixture.state), "resident");
  for (const result of [{}, { quiet: false }, { quiet: false, proposal: {} }]) {
    answers = [result];
    await assert.rejects(
      () => service.handler.generate(queued.input),
      (error: unknown) => error instanceof WorkFailureError && error.failure.cause === "missing_result",
    );
    assert.equal(answers.length, 0, "An invalid combined response makes no hidden review request");
  }
  answers = [{ quiet: false, development: proposal(queued.input.grant) }];
  const gm = await service.handler.generate(queued.input);
  assert.equal(gm.quiet, false);
  assert.equal(answers.length, 0, "A new world development uses one typed GM response");
}
