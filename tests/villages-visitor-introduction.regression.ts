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
import { settleVisitorTrip } from "../packages/villages/src/server/domain/rules/visitors.js";
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
const venue = venueFixture({ id: "garden", name: "Garden", classes: ["community"] });
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
assert.equal(state.visitors[0]!.trip!.leavesAt, scene.endedAt);
const saved = JSON.stringify(state.visitorIntroduction);
completeVisitorIntroduction(state, { ...scene, status: "active", endedAt: "" });
assert.equal(
  JSON.stringify(state.visitorIntroduction),
  saved,
  "A delayed publication cannot reopen a completed introduction",
);
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
