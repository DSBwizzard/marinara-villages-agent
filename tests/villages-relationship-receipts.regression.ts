import assert from "node:assert/strict";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { emptyRelationshipReview } from "../packages/villages/src/server/domain/rules/relationship-review.js";
import {
  applyRelationshipReview,
  coerceRelationshipState,
  defaultRelationshipState,
  neutralRelationship,
  relationshipKey,
  replaySceneRelationships,
  sceneRelationshipView,
} from "../packages/villages/src/server/domain/rules/relationship-rules.js";
import {
  captureSceneContinuity,
  sceneContinuityView,
} from "../packages/villages/src/server/domain/rules/scene-continuity.js";

const village = defaultVillageState();
village.seed = "relationship-history";
village.villagers = [
  { characterId: "ada", wishes: [], cardSnapshot: { name: "Ada" } },
  { characterId: "ben", wishes: [], cardSnapshot: { name: "Ben" } },
] as any;
const state = (village.relationshipContext = defaultRelationshipState(village.seed));
const key = relationshipKey("ada", "player"),
  at = "2026-10-30T10:00:00.000Z";
state.edges[key] = {
  ...neutralRelationship("ada", "player"),
  revision: 4,
  connection: "Before",
  records: {
    inherited: {
      id: "inherited",
      kind: "history",
      text: "Private inherited history",
      revision: 1,
      participants: ["ada", "player"],
      knownBy: ["ada"],
      status: "stated",
      evidenceIds: ["original"],
    },
  },
};
const scene: any = {
  id: "frozen",
  villageSeed: village.seed,
  startedAt: at,
  lines: [],
  submissions: [],
  activeIds: ["ada"],
};
scene.continuity = captureSceneContinuity(village, scene, Date.parse(at));
const captured = structuredClone(scene.continuity);
// Restore/repair may bump live revision. The old Scene must still continue from its own revision4.
state.edges[key].revision = 70;
const patch = (connection: string, records: any[] = []) => ({
  connection,
  stance: "Private stance",
  expectations: [],
  concerns: [],
  records,
});
const apply = (id: string, sceneConnection: string, liveConnection: string, sceneState: any, records: any[] = []) => {
  applyRelationshipReview(
    state,
    {
      ...emptyRelationshipReview(),
      changes: [
        {
          id,
          fromId: "ada",
          toId: "player",
          expectedRevision: state.edges[key].revision,
          sceneAfter: patch(sceneConnection, records),
          liveAfter: patch(liveConnection, records),
          reason: "Exact witnessed event",
          lineIds: [id + ":line"],
          evidence: [
            {
              id: id + ":line",
              sourceId: id,
              speakerId: "ada",
              content: "Exact “café 🌼” evidence",
              heardBy: ["ada"],
              hash: "exact-source-hash",
            },
          ],
        },
      ],
    },
    village,
    id,
    at,
    Date.parse(at),
    sceneState,
  );
  Object.assign(state.receipts[id], { sceneId: scene.id, submissionId: id });
  scene.submissions.push({ id });
};
apply("one", "Old Scene connection", "Later live ending", scene.continuity.facts.relationshipContext);
let view = sceneRelationshipView(state, scene)!;
assert.equal(state.receipts.one.sceneBeforeRevision, 4);
assert.equal(state.receipts.one.beforeRevision, 70);
assert.equal(view.edges[key].revision, 5);
assert.equal(view.edges[key].connection, "Old Scene connection");
assert.equal(state.edges[key].connection, "Later live ending");
assert.deepEqual(view.edges[key].records.inherited.knownBy, ["ada"]);
assert.deepEqual(scene.continuity, captured, "Replay cannot rewrite the frozen authority");
apply("two", "Same new label", "Same new label", view);
assert.equal(
  state.receipts.two.sceneAfter,
  undefined,
  "Equal event patches share one stored interpretation even with different predecessor revisions",
);
state.receipts = Object.fromEntries(Object.entries(state.receipts).reverse());
scene.submissions.reverse();
view = sceneRelationshipView(state, scene)!;
const continuity = sceneContinuityView(village, scene, false).relationshipContext!;
assert.deepEqual(view, continuity, "Both consumers use publication order and the same transcript eligibility");
assert.equal(view.edges[key].revision, 6);
assert.deepEqual(view.edges[key].experiences, ["one", "two"]);
const beforeDuplicate = structuredClone(view);
replaySceneRelationships(view, state, scene);
assert.deepEqual(view, beforeDuplicate);

const snapshot = JSON.stringify(state);
assert.deepEqual(
  coerceRelationshipState(village.seed, JSON.parse(snapshot)),
  state,
  "Compact updates survive native JSON restart",
);
assert.throws(() => coerceRelationshipState(village.seed, { ...state, version: 2 }), /unsupported/);
assert.throws(() => coerceRelationshipState("another-world", state), /another Village/);
assert.throws(() => coerceRelationshipState(village.seed, {}), /another Village/);
assert.deepEqual(coerceRelationshipState(village.seed, undefined), defaultRelationshipState(village.seed));
assert.throws(() => replaySceneRelationships(defaultRelationshipState("foreign"), state, scene), /another Village/);
for (const defect of ["missing", "forked", "duplicate-sequence"] as const) {
  const damaged = structuredClone(state);
  if (defect === "missing") delete damaged.receipts.one;
  if (defect === "forked") damaged.receipts.two.sceneBeforeRevision = 4;
  if (defect === "duplicate-sequence") damaged.receipts.two.sequence = damaged.receipts.one.sequence;
  const target = structuredClone(scene.continuity.facts.relationshipContext),
    original = structuredClone(target);
  assert.throws(() => replaySceneRelationships(target, damaged, scene), /missing or forked/);
  assert.deepEqual(target, original, "A broken chain rejects before applying any sibling patch");
}
const removed = { ...scene, submissions: [{ id: "one" }] };
assert.equal(sceneRelationshipView(state, removed)!.edges[key].revision, 5);
assert.equal(sceneContinuityView(village, removed, false).relationshipContext!.edges[key].revision, 5);

// Shared Scene terms receive their own all-or-nothing preflight, independently of live interpretations.
const sharedState = defaultRelationshipState(village.seed);
const shared = {
  id: "promise",
  revision: 1,
  kind: "commitment",
  text: "Meet tomorrow",
  participants: ["ada", "ben"],
  status: "accepted",
  evidenceIds: ["source"],
} as any;
sharedState.sharedRecords.promise = shared;
const sharedChange = (fromId: string, toId: string, sceneStatus: string) => ({
  id: "shared:" + fromId,
  fromId,
  toId,
  expectedRevision: 0,
  liveAfter: patch("Friends", [{ ...shared, revision: 2, status: "cancelled" }]),
  sceneAfter: patch("Friends", [{ ...shared, revision: 2, status: sceneStatus }]),
  reason: "Witnessed change",
  lineIds: [],
  evidence: [],
});
const beforeConflict = structuredClone(sharedState);
assert.throws(
  () =>
    applyRelationshipReview(
      sharedState,
      {
        ...emptyRelationshipReview(),
        changes: [sharedChange("ada", "ben", "fulfilled"), sharedChange("ben", "ada", "cancelled")],
      },
      village,
      "conflict",
      at,
    ),
  /Conflicting interpretations.*captured/,
);
assert.deepEqual(sharedState, beforeConflict);
applyRelationshipReview(
  sharedState,
  {
    ...emptyRelationshipReview(),
    changes: [sharedChange("ada", "ben", "fulfilled"), sharedChange("ben", "ada", "fulfilled")],
  },
  village,
  "shared",
  at,
);
assert.equal(Object.keys(sharedState.receipts).length, 2);

// Provider-free retained histories: each event stores just its new record and evidence, never its ancestors.
const metrics: any[] = [];
for (const count of [1000, 10_000, 25_000]) {
  const ledger = defaultRelationshipState(village.seed),
    baseline = defaultRelationshipState(village.seed);
  ledger.eventSequence = count;
  const turns = [];
  const template = state.receipts.one;
  for (let i = 0; i < count; i++) {
    const id = "event:" + i,
      record = { ...state.edges[key].records.inherited, id: "history:" + i, text: "Exact historical fact " + i };
    ledger.receipts[id] = {
      ...structuredClone(template),
      id,
      sequence: i + 1,
      beforeRevision: i + 100,
      sceneBeforeRevision: i,
      sceneAfter: undefined,
      liveAfter: patch("Retained relationship", [record]),
      sceneId: "large",
      submissionId: id,
    };
    turns.push({ id });
  }
  const sceneInput = { id: "large", submissions: turns.reverse() };
  replaySceneRelationships(baseline, ledger, sceneInput);
  const restoredEdge = baseline.edges[key];
  assert.equal(restoredEdge.revision, count);
  assert.equal(restoredEdge.experiences.length, count);
  assert.equal(Object.keys(restoredEdge.records).length, count);
  assert.deepEqual(restoredEdge.records["history:" + (count - 1)].knownBy, ["ada"]);
  assert.equal(baseline.receipts["event:" + (count - 1)].evidence[0].content, "Exact “café 🌼” evidence");
  const retainedBytes = Buffer.byteLength(JSON.stringify(ledger));
  const lastReceiptBytes = Buffer.byteLength(JSON.stringify(ledger.receipts["event:" + (count - 1)]));
  assert.ok(lastReceiptBytes < 1800, "An event's stored size cannot depend on its predecessor history");
  metrics.push({ count, retainedBytes, lastReceiptBytes });
}
assert.ok(metrics[2].retainedBytes / metrics[1].retainedBytes < 2.7, "Retained receipt history grows linearly");
console.log("Relationship receipt growth:", JSON.stringify(metrics));
console.log(
  "Compact relationship receipts: exact Scene/live reconstruction, revisions, ordering, privacy, shared terms, corruption holds and linear retained history passed.",
);
