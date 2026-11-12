import assert from "node:assert/strict";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityWishes } from "../packages/villages/src/server/domain/rules/continuity-library.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import {
  narrationContinuityContext,
  fittedNarrationReadset,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { retainAuthoredNote } from "./helpers/continuity.fixture.js";
import { venueFixture } from "./helpers/venues.fixture.js";

const at = "2026-11-11T00:00:00.000Z";
const venue = venueFixture({ id: "square", name: "Square", classes: ["community"], description: "A paved square." });
const state = coerceVillageState({
  ...defaultVillageState(),
  seed: "scene-traversal",
  setupAt: at,
  foundedAt: at,
  setting: "Earlier setting",
  venues: [venue],
  villagers: ["ada", "bryn"].map((id) => ({
    characterId: id,
    incarnation: id + "-one",
    letterFontId: "caveat",
    addedAt: at,
    cardSnapshot: { id, name: id, revision: 1, sourceStatus: "available", capturedAt: at },
  })),
});
const person = { characterId: "ada", name: "Ada", doing: "Resting" };
const scene = zoneEventScene(
  coerceSession({
    version: 5,
    id: "ongoing",
    villageSeed: state.seed,
    placeId: venue.id,
    zoneId: "exterior",
    status: "active",
    startedAt: at,
    participants: [person],
    activeIds: ["ada"],
    sceneAttendance: {
      capturedAt: at,
      layout: captureSceneLayout(venue),
      occupants: [{ ...person, zoneId: "exterior" }],
    },
  }),
  venue,
);
const retain = (ownerId: string, id: string, text: string) =>
  retainAuthoredNote(state, id, text, [ownerId], at, {
    owner: continuityActor(state, ownerId)!,
    class: "desire",
    current: true,
  });
const desired = retain("ada", "first", "Ada wants an ordinary conversation.");
retain("bryn", "other", "Bryn has a private wish that Ada does not know.");
scene.continuity = captureSceneContinuity(state, scene, Date.parse(at));
const captured = memoryHash(scene.continuity);
assert(!Object.hasOwn(scene.continuity.facts, "continuity") && !Object.hasOwn(scene.continuity.facts, "episodes"));

const admit = (id: string) => {
  const context = narrationContinuityContext(state, scene, venue, id, "What do you hope for?", at);
  return fittedNarrationReadset(
    state,
    context,
    context.parts.map((part) => part.block.evidenceId!),
  );
};
const first = admit("first-reply"),
  stale = admit("stale-reply");
const reply = (text: string) => ({
  segments: [{ kind: "dialogue", speakerId: "ada", text: "I'd love to talk about art someday." }],
  keep: [{ for: ["ada"], replace: desired, text, source: ["self"] }],
});
const raw = reply("Ada hopes for a conversation about art, when she feels ready.");
const apply = () => acceptNarration(state, { raw, readset: first, responseDigest: memoryHash(raw) }, "first-turn", at);
const accepted = apply();
assert.equal(accepted.held, false, JSON.stringify(accepted.rejected));
const after = memoryHash(state);
assert(apply().replayed);
assert.equal(memoryHash(state), after);
const wrong = reply("Ada is impatient to talk about art.");
assert(
  acceptNarration(state, { raw: wrong, readset: stale, responseDigest: memoryHash(wrong) }, "stale-turn", at).held,
);
assert.equal(memoryHash(state), after, "A later acceptance cannot replace a stale admitted desire");

state.setting = "Changed setting";
const current = sceneContinuityView(state, scene);
assert.equal(current.setting, "Earlier setting");
assert.equal(state.setting, "Changed setting");
assert.equal(
  memoryHash(scene.continuity),
  captured,
  "Neither acceptance nor traversal rewrites the frozen native circumstances",
);
assert.equal(current.continuity, state.continuity);
assert.equal(current.episodes, state.episodes);
const wish = continuityWishes(current, "ada", true, at)[0];
assert.deepEqual(
  wish.facts.map((fact) => fact.text),
  ["Ada wants an ordinary conversation.", "Ada hopes for a conversation about art, when she feels ready."],
);
assert.deepEqual(
  continuityWishes(current, "ada", false, at),
  [],
  "Onstage presence does not teach the privately updated desire",
);
assert.deepEqual(continuityWishes(current, "bryn", false, at), []);

const history = new Proxy(state.continuity, {
  get() {
    assert.fail("A native Scene view cannot traverse continuity or history");
  },
});
assert.equal(sceneContinuityView({ ...state, continuity: history }, scene).continuity, history);
