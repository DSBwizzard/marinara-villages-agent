import assert from "node:assert/strict";
import { mock } from "node:test";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import { defaultRelationshipState } from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";

const at = "2026-10-31T00:00:00.000Z";
for (const count of [1000, 10_000, 25_000]) {
  let visits = 0;
  const world = defaultVillageState();
  world.seed = "intention-growth";
  const social = (world.relationshipContext = defaultRelationshipState(world.seed));
  const receipt = (id: string, turn: string, text = id) => ({
    sourceId: id,
    actorId: "ada",
    get sceneId() {
      visits++;
      return "scene";
    },
    get submissionId() {
      visits++;
      return turn;
    },
    at,
    sceneAfter: [
      {
        id,
        actorId: "ada",
        targetIds: ["player"],
        text,
        reason: "Witnessed",
        evidenceIds: [id],
        status: "active" as const,
      },
    ],
    liveAfter: [],
    sceneRevision: 1,
    liveRevision: 1,
    evidence: [],
  });
  social.intentionReceipts.already = receipt("already", "turn:0");
  const scene = coerceSession({ version: 3, id: "scene", villageSeed: world.seed, status: "active", startedAt: at });
  scene.continuity = captureSceneContinuity(world, scene, Date.parse(at));
  const captured = structuredClone(scene.continuity);
  social.intentionReceipts.first = receipt("first", "turn:0");
  social.intentionReceipts.second = receipt("second", "turn:0", "Exact final café 🌼 intention");
  for (let index = 1; index < count; index++)
    social.intentionReceipts["receipt:" + index] = receipt("receipt:" + index, "turn:" + index);
  social.intentionReceipts.already = receipt("already", "turn:0", "Must not overwrite captured evidence");
  social.intentionReceipts.foreign = { ...receipt("foreign", "turn:0"), sceneId: "another-scene" };
  social.intentionReceipts.excluded = receipt("excluded", "not-in-the-transcript");
  scene.submissions = Array.from({ length: count }, (_, index) => ({
    id: "turn:" + (count - index - 1),
    mode: "chat",
    message: "Exact input",
    targetId: "",
    at,
  }));
  const before = structuredClone(social);
  visits = 0;
  const entries = Object.entries;
  let scans = 0;
  const spy = mock.method(Object, "entries", (value: any) => {
    if (value === social.intentionReceipts) scans++;
    return entries(value);
  });
  let view;
  try {
    view = sceneContinuityView(world, scene, false).relationshipContext!;
  } finally {
    spy.mock.restore();
  }
  const replayVisits = visits;
  assert.equal(scans, 1, "Replay scans the ledger once, independently of transcript length");
  assert(replayVisits < count * 20, "Receipt eligibility work is linear in retained history");
  assert.equal(view.intentions.ada[0].text, "Exact final café 🌼 intention");
  assert.equal(view.intentionReceipts.already.sceneAfter[0].text, "already");
  assert(!view.intentionReceipts.foreign && !view.intentionReceipts.excluded);
  assert.deepEqual(social, before, "Replay cannot mutate current authority");
  assert.deepEqual(scene.continuity, captured, "Replay cannot mutate the captured baseline");
  console.log(
    `Scene intention replay ${count}: one ledger scan, ${replayVisits} receipt-field reads; exact order, scope and baseline preserved.`,
  );
}
