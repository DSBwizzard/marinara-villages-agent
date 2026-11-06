import assert from "node:assert/strict";
import { expandSceneActionReview } from "../packages/villages/src/server/domain/rules/scene-semantic-wire.js";
import { reconcileResidentActions } from "../packages/villages/src/server/domain/rules/resident-actions.js";
import type { semanticEvidence } from "../packages/villages/src/server/domain/rules/semantic-contract.js";

const evidence = [
  { speakerId: "player", kind: "dialogue", content: "May I enter?", playerHeard: true, heardBy: ["host"] },
  {
    speakerId: "__venue_scene__",
    kind: "narration",
    content: "Host sets down a cup.",
    playerHeard: true,
    heardBy: ["host"],
  },
  {
    speakerId: "host",
    kind: "dialogue",
    content: "Come in, only while I accompany you.",
    playerHeard: true,
    heardBy: ["host"],
  },
  { speakerId: "host", kind: "dialogue", content: "A private remark.", playerHeard: false, heardBy: ["host"] },
] as ReturnType<typeof semanticEvidence>;
const action = {
  id: "visit",
  actorId: "host",
  visitorId: "player",
  source: { segment: 2 },
  venueId: "home",
  zoneId: "room",
  outcome: "invite-now",
  duration: "visit",
  conditions: ["accompanied"],
  accompanies: true,
};
const review = () => ({
  version: 2,
  reviewed: [1, 2],
  additionalActions: [structuredClone(action)],
  decisions: [{ id: "visit", status: "accepted", reason: "Explicit accompanied visit." }],
  coverage: [{ segment: 2, status: "actions", actionIds: ["visit"], reason: "Current invitation." }],
});
const settle = (value: unknown, lines = evidence) => {
  const raw = { residentActionReview: value };
  const before = JSON.stringify(raw);
  const result = expandSceneActionReview(raw, lines);
  assert.equal(JSON.stringify(raw), before, "Wire expansion cannot rewrite the saved response");
  return reconcileResidentActions([], result.residentActionReview, lines);
};
const result = settle(review());
assert.equal(result.access[0].outcome, "invite-now");
assert.equal(result.access[0].duration, "visit");
assert.equal(result.access[0].accompanies, true);
assert.deepEqual(result.access[0].evidence, [2]);
assert.deepEqual(result.receipt.review && (result.receipt.review as any).additionalActions[0].source, {
  speakerId: "host",
  quote: evidence[2].content,
});
assert.deepEqual(result.permissions, []);

for (const mutate of [
  (r: any) => delete r.reviewed,
  (r: any) => r.reviewed.push(2),
  (r: any) => r.reviewed.splice(0, 1),
  (r: any) => r.reviewed.push(24),
  (r: any) => r.reviewed.push(-1),
  (r: any) => r.reviewed.push(1.5),
  (r: any) => r.reviewed.push("1"),
  (r: any) => r.reviewed.push(3),
  (r: any) => r.coverage.push(structuredClone(r.coverage[0])),
  (r: any) => (r.coverage[0].segment = 3),
  (r: any) => (r.coverage[0].status = "none"),
  (r: any) => (r.coverage[0].actionIds = []),
  (r: any) => (r.coverage = []),
  (r: any) => (r.decisions = []),
  (r: any) => (r.additionalActions[0].source.segment = "2"),
  (r: any) => (r.additionalActions[0].source.segment = 4),
  (r: any) => (r.additionalActions[0].source.quote = "Come in"),
  (r: any) => (r.additionalActions[0].source.speakerId = "host"),
  (r: any) => (r.additionalActions[0].source.segment = 0),
  (r: any) => (r.additionalActions[0].source.segment = 3),
]) {
  const changed = review();
  mutate(changed);
  assert.throws(() => settle(changed), /incomplete|inconsistent|invalid|source|omitted|witness/i);
}
for (const status of ["rejected", "unresolved"]) {
  const changed = review();
  changed.decisions[0].status = status;
  assert.throws(() => settle(changed), /clarification/i, "An explicit decision cannot be normalized into acceptance");
}
assert.throws(
  () =>
    settle({
      version: 2,
      reviewed: [1, 2],
      additionalActions: [],
      decisions: [],
      coverage: [{ segment: 2, status: "unresolved", actionIds: [], reason: "Unclear permission." }],
    }),
  /clarification/i,
  "Unresolved meaning without action IDs still holds the draft",
);
assert.throws(
  () => settle(review(), [...evidence, { ...evidence[2] }]),
  /ambiguous/i,
  "Index expansion preserves existing full-source uniqueness validation",
);

const legacy = { residentActionReview: { version: 1, coverage: [] } };
assert.strictEqual(expandSceneActionReview(legacy, evidence), legacy, "Existing canonical replies stay untouched");
assert.throws(
  () => reconcileResidentActions([], review(), evidence),
  /incomplete/i,
  "An unmarked old request cannot decode a compact response",
);
console.log("Compact Scene wire preserves complete review, exact source, uncertainty and legacy validation.");
