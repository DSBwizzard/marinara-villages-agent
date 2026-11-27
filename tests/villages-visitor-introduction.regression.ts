import assert from "node:assert/strict";
import { socialWorldFixture } from "./fixtures/social-world.fixture.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { captureSceneContinuity } from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneAttendance } from "../packages/villages/src/server/domain/rules/scene-attendance.js";
import {
  appendVisitorIntroductionTutorial,
  completeVisitorIntroduction,
  PROFESSOR_MARI_ID,
  visitorIntroductionDue,
  visitorIntroductionId,
  visitorIntroductionVenue,
  writeVisitorIntroduction,
} from "../packages/villages/src/server/domain/rules/visitor-introduction.js";
import {
  introductoryVisitorStay,
  settleVisitorTrip,
  visitingCharacter,
  visitorPosition,
} from "../packages/villages/src/server/domain/rules/visitors.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { withMariSpriteDefaults } from "../packages/villages/src/server/domain/rules/professor-mari.js";
import { managerResidentSprite } from "../packages/villages/src/server/domain/rules/sprite-manager-model.js";
import { publicSceneLiveReply } from "../packages/villages/src/server/domain/rules/scene-public.js";

const state = socialWorldFixture();
state.setupAt = "2026-11-01T08:30:00.000Z";
state.foundedAt = "2026-10-01T00:00:00.000Z";
state.clock = null;
state.visitorIntroduction = { sceneId: "", completedAt: "" };
const due = new Date(Date.parse(state.setupAt) + 86_400_000);
assert(!visitorIntroductionDue(state, new Date(due.getTime() - 1)));
assert(
  visitorIntroductionDue(state, due),
  "24 elapsed hours across the clock change, measured from completed founding",
);
assert(
  !visitorIntroductionDue({ ...state, visitorIntroduction: undefined }, due),
  "Existing worlds do not replay onboarding",
);
assert.deepEqual(coerceVillageState(state).visitorIntroduction, state.visitorIntroduction);
assert.throws(
  () => coerceVillageState({ ...state, visitorIntroduction: { completedAt: "bad", sceneId: "" } }),
  /Visitor introduction/,
);
const venue = venueFixture({
  spaces: [{ id: "community", description: "A place in the community.", image: null }],
  id: "garden",
  name: "Garden",
});
state.venues.push(venue);
const attendance = captureSceneAttendance(state, venue.id, due);
assert(visitorIntroductionVenue(state, venue, attendance, due));
for (const zoneId of ["exterior", venue.zones!.find((zone) => zone.kind === "public")!.id]) {
  assert(
    !visitorIntroductionVenue(
      state,
      venue,
      { ...attendance, occupants: [{ characterId: "a", name: "A", doing: "busy", zoneId }] },
      due,
    ),
    "A person at or within hearing of the entrance defers the visit",
  );
}
assert(!visitorIntroductionVenue(state, { ...venue, constructionStatus: "worksite" }, attendance, due));
assert(
  !visitorIntroductionVenue(
    state,
    { ...venue, zones: venue.zones!.filter((zone) => zone.kind !== "public") },
    attendance,
    due,
  ),
);
const [resident] = state.villagers;
state.visitors = [
  {
    ...resident!,
    characterId: PROFESSOR_MARI_ID,
    cardSnapshot: { ...resident!.cardSnapshot, id: PROFESSOR_MARI_ID, name: "Professor Mari" },
    visitsEnabled: true,
    visitsRevision: "mari",
  },
];
state.visitors[0]!.spriteManager = withMariSpriteDefaults(PROFESSOR_MARI_ID, null);
state.visitors[0]!.sprite = managerResidentSprite(state.visitors[0]!.spriteManager, PROFESSOR_MARI_ID);
for (let i = 0; i < 100; i++) {
  state.seed = "arrival-" + i;
  settleVisitorTrip(state, due);
  assert.equal(state.visitors[0]!.trip, undefined, "Chance arrivals wait for the introduction");
}
const scene = coerceSession({
  version: 5,
  id: visitorIntroductionId(state),
  villageSeed: state.seed,
  placeId: venue.id,
  placeName: venue.name,
  startedAt: due.toISOString(),
  zoneId: "exterior",
  sceneAttendance: attendance,
});
writeVisitorIntroduction(scene, state);
scene.continuity = captureSceneContinuity(state, scene, due.getTime());
assert.equal(coerceSession(scene).visitorIntroduction, true);
assert.equal(scene.status, "opening");
assert.equal(scene.lines.length, 0);
completeVisitorIntroduction(state, scene);
assert.equal(state.visitorIntroduction.sceneId, scene.id);
assert.equal(state.visitors[0]!.firstMetAt, undefined, "Arrival alone is not a spoken meeting");
const opening = zoneEventScene(scene, venue);
const context = narrationContinuityContext(state, opening, venue, "greeting", "", due.toISOString());
const readset = fittedNarrationReadset(
  state,
  context,
  context.parts.map((part) => part.block.evidenceId!),
);
readset.ordinaryFormatRecovery = 6;
readset.ordinaryReplyRecovery = true;
readset.positionedSceneSources = true;
readset.quotedSceneSources = true;
assert.equal(readset.source.scene.visitorIntroduction, true, "The saved request retains its intro-only authority");
for (const raw of [
  {
    segments: [
      { id: "spoken", kind: "dialogue", speakerId: PROFESSOR_MARI_ID, text: "I promise to return tomorrow." },
      { kind: "keep", for: [PROFESSOR_MARI_ID], text: "Mari will return tomorrow.", source: ["spoken"] },
    ],
  },
  {
    segments: [{ id: "leave", kind: "narration", text: "Mari leaves the conversation.", requires: ["departure"] }],
    commands: [
      {
        id: "departure",
        type: "depart",
        who: PROFESSOR_MARI_ID,
        at: "leave",
        source: [{ segment: "leave", perceive: { kind: "seen", by: ["player"] } }],
      },
    ],
  },
  {
    segments: [{ kind: "dialogue", speakerId: PROFESSOR_MARI_ID, text: "I promise to return tomorrow." }],
    keep: [{ id: "promise", for: [PROFESSOR_MARI_ID], text: "Mari will return tomorrow.", source: ["segment-0"] }],
  },
]) {
  const before = memoryHash(state);
  assert.throws(
    () => acceptNarration(state, { readset, raw, responseDigest: memoryHash(raw) }, "greeting", due.toISOString()),
    /opening greeting/,
  );
  assert.equal(memoryHash(state), before, "A generated opening cannot change native state, including on recovery");
}
appendVisitorIntroductionTutorial(scene);
const tutorial = structuredClone(scene.lines);
appendVisitorIntroductionTutorial(scene);
assert.deepEqual(scene.lines, tutorial, "The fixed tutorial appends only once");
const bookendReadset = { ...readset, visitorIntroductionFarewell: true as const };
const bookendRaw = {
  segments: [
    {
      kind: "dialogue",
      speakerId: PROFESSOR_MARI_ID,
      text: "A garden! You even remembered the outside.",
      perceive: { kind: "private", by: ["unlisted-actor"] },
    },
    {
      kind: "dialogue",
      speakerId: PROFESSOR_MARI_ID,
      text: "I'll be exploring until tomorrow. Try not to misplace the village while the tutorial is off duty.",
    },
  ],
};
const legacyRaw = { segments: [bookendRaw.segments[0]] };
const followRaw = {
  segments: [{ ...bookendRaw.segments[0], follow: { agrees: true } }, bookendRaw.segments[1]],
};
const beforeFollow = memoryHash(state);
assert.throws(
  () =>
    acceptNarration(
      state,
      { readset: { ...bookendReadset, sceneFollowing: 2 }, raw: followRaw, responseDigest: memoryHash(followRaw) },
      "greeting",
      due.toISOString(),
    ),
  /opening greeting/,
);
assert.equal(memoryHash(state), beforeFollow, "A retained follow annotation cannot change intro movement or state");
const legacy = acceptNarration(
  structuredClone(state),
  { readset, raw: legacyRaw, responseDigest: memoryHash(legacyRaw) },
  "greeting",
  due.toISOString(),
);
assert.equal(legacy.episode!.segments.length, 1, "A retained older opening does not require a new farewell or request");
const legacyScene = structuredClone(scene);
legacyScene.lines[7].content = "Previously saved farewell.";
const frozenLegacy = memoryHash(legacyScene.lines);
appendVisitorIntroductionTutorial(legacyScene, "a-new-farewell-must-not-rewrite-saved-dialogue");
assert.equal(memoryHash(legacyScene.lines), frozenLegacy);
const accepted = acceptNarration(
  structuredClone(state),
  { readset: bookendReadset, raw: bookendRaw, responseDigest: memoryHash(bookendRaw) },
  "greeting",
  due.toISOString(),
);
const bookends = structuredClone(scene);
bookends.lines = structuredClone(accepted.episode!.segments);
appendVisitorIntroductionTutorial(bookends, bookends.lines.at(-1)!.id);
assert.equal(bookends.lines[0].content, bookendRaw.segments[0].text);
assert(bookends.lines[0].heardBy.includes("player"));
assert(!bookends.lines[0].heardBy.includes("unlisted-actor"));
assert.equal(bookends.lines[1].content, "Wondering why I'm here?");
assert.equal(bookends.lines.at(-2)!.content, bookendRaw.segments[1].text);
assert.equal(bookends.lines.length, 10, "One generated pair surrounds the seven fixed paragraphs and closing beat");
assert.deepEqual(
  publicSceneLiveReply(bookends).lines.map((line) => line.id),
  bookends.lines.map((line) => line.id),
  "The live reply includes the generated greeting, complete fixed explanation and generated farewell",
);
const hiddenIntro = structuredClone(bookends);
hiddenIntro.lines.push({ ...bookends.lines[0], id: "private-intro", heardBy: [PROFESSOR_MARI_ID] });
hiddenIntro.lines.push({ ...bookends.lines[0], id: "held-intro" });
hiddenIntro.submissions.push({
  id: "held-intro-turn",
  at: due.toISOString(),
  message: "",
  mode: "chat",
  targetId: "",
  requestFingerprint: "",
  acceptance: { status: "held", rejected: [] },
  replyLineIds: ["held-intro"],
});
assert.deepEqual(
  publicSceneLiveReply(hiddenIntro).lines.map((line) => line.id),
  bookends.lines.map((line) => line.id),
  "The intro projection still excludes held and unwitnessed output",
);
const ordered = memoryHash(bookends.lines);
appendVisitorIntroductionTutorial(bookends, accepted.episode!.segments.at(-1)!.id);
assert.equal(memoryHash(bookends.lines), ordered, "Recovery preserves generated bookend order and concrete cues");
assert.throws(
  () =>
    acceptNarration(
      structuredClone(state),
      {
        readset: bookendReadset,
        raw: { segments: [bookendRaw.segments[0]] },
        responseDigest: memoryHash("missing farewell"),
      },
      "greeting",
      due.toISOString(),
    ),
  /final spoken farewell/,
);
assert.throws(() => appendVisitorIntroductionTutorial({ ...bookends, lines: [] }, "missing"), /farewell is missing/);
for (const decoration of [{ presentation: "aside" }, { delivery: "whisper", targetId: "player" }]) {
  const raw = { segments: [bookendRaw.segments[0], { ...bookendRaw.segments[1], ...decoration }] };
  assert.throws(
    () =>
      acceptNarration(
        structuredClone(state),
        { readset: bookendReadset, raw, responseDigest: memoryHash(raw) },
        "greeting",
        due.toISOString(),
      ),
    /final spoken farewell/,
    "The farewell cannot anchor beside the opening ahead of the explanation",
  );
}
const sprite = scene.continuity!.facts.visitors![0]!.sprite!;
const cues = scene.lines.flatMap((line) => line.staging ?? []);
assert(
  new Set(cues.map((cue) => cue.expression)).size >= 6,
  "The fixed explanation uses several expressions instead of holding the greeting's mood",
);
assert(
  cues.every((cue) => sprite.expressions.some((row) => row.view === "front" && row.expressionId === cue.expression)),
  "Only captured front-facing expressions may be saved",
);
assert.deepEqual(
  coerceSession(scene).lines.map((line) => line.staging),
  scene.lines.map((line) => line.staging),
  "Reload preserves concrete expression choices",
);
const portrait = structuredClone(scene);
portrait.lines = [];
portrait.continuity!.facts.visitors![0]!.sprite = null;
appendVisitorIntroductionTutorial(portrait);
assert(
  portrait.lines.every((line) => !line.staging),
  "Portrait fallback never invents sprite assignments",
);
scene.status = "active";
assert(scene.lines.every((line) => line.heardBy.includes("player") && line.heardBy.length === 2));
completeVisitorIntroduction(state, scene);
assert.equal(state.visitors[0]!.firstMetAt, due.toISOString());
assert.equal(
  state.visitorIntroduction.completedAt,
  "",
  "Publication records the meeting but leaves the tutorial pending until its conclusion",
);
scene.status = "closed";
scene.endedAt = new Date(due.getTime() + 60000).toISOString();
completeVisitorIntroduction(state, scene);
assert.equal(state.visitorIntroduction.completedAt, scene.endedAt);
assert.equal(state.visitors[0]!.trip!.arrivedAt, scene.endedAt);
assert.equal(state.visitors[0]!.trip!.leavesAt, new Date(Date.parse(scene.endedAt) + 86_400_000).toISOString());
assert.equal(state.visitors[0]!.trip!.venueId, venue.id);
assert(introductoryVisitorStay(state, state.visitors[0]!));
assert.equal(coerceVillageState(state).visitors![0]!.trip!.venueId, venue.id, "Preferred visit Venue survives saving");
assert.equal(visitorPosition(state, new Date(scene.endedAt), new Map())?.venueId, venue.id);
const leavesAt = Date.parse(state.visitors[0]!.trip!.leavesAt);
assert.equal(visitingCharacter(state, new Date(leavesAt - 1))?.characterId, PROFESSOR_MARI_ID);
assert.equal(visitingCharacter(state, new Date(leavesAt)), undefined);
const night = new Date(scene.endedAt);
night.setUTCHours(23, 0, 0, 0);
assert.equal(
  visitorPosition({ ...state, timeZone: "UTC" }, night, new Map()),
  undefined,
  "Mari stays off-map overnight",
);
settleVisitorTrip(state, night);
assert.equal(state.visitors[0]!.trip!.lodging, undefined, "Her introduction stay never assigns a room by its name");
const savedTrip = structuredClone(state.visitors[0]!.trip);
const saved = JSON.stringify(state.visitorIntroduction);
completeVisitorIntroduction(state, { ...scene, status: "active", endedAt: "" });
assert.equal(
  JSON.stringify(state.visitorIntroduction),
  saved,
  "A delayed publication cannot reopen a completed introduction",
);
assert.deepEqual(state.visitors[0]!.trip, savedTrip, "Concluding or replaying again cannot extend her stay");
completeVisitorIntroduction({ ...state, setupAt: "2027-01-01T00:00:00Z" }, scene);
assert.equal(JSON.stringify(state.visitorIntroduction), saved, "Another world cannot conclude this tutorial");
assert(!visitorIntroductionDue(state, new Date(due.getTime() + 86_400_000)));
const replay = structuredClone(state);
replay.visitorIntroduction = { sceneId: "mari-first-visit-preview-replay", completedAt: "" };
assert.equal(visitorIntroductionId(replay), replay.visitorIntroduction.sceneId);
assert(visitorIntroductionDue(replay, due));
const oldReceipt = structuredClone(replay.visitorIntroduction);
completeVisitorIntroduction(replay, scene);
assert.deepEqual(
  replay.visitorIntroduction,
  oldReceipt,
  "An old completed Scene cannot consume a newly reserved introduction",
);
console.log(
  "Mari's first visit respects elapsed founding time, quiet public entrances, saved meeting identity and once-only conclusion.",
);
