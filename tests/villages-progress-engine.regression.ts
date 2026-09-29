import assert from "node:assert/strict";
import {
  createProgressTask,
  coerceProgressTasks,
  ingestProgressEvent,
  revealProgress,
  reviseProgress,
  submitProgressEvidence,
  visibleProgress,
  type ProgressDefinition,
  type ProgressEvidence,
  type ProgressRegistry,
} from "../packages/villages/src/engine/packages/server/src/services/villages/progress-engine.ts";

type State = { effects: string[]; itemPresent: boolean };
const state: State = { effects: [], itemPresent: true };
const definition: ProgressDefinition = {
  id: "hidden-task",
  revision: 1,
  owner: { kind: "test", id: "aqua" },
  resolver: "test.resolve",
  phases: [
    {
      id: "taste",
      title: "Someone tastes the drink",
      requirements: [
        {
          id: "taste-record",
          title: "A resident tastes Aqua's drink",
          routes: [
            {
              id: "scene",
              verifier: "test.taste",
              params: { speakerId: "rosa", venueId: "bar" },
              automatic: true,
              evidenceKinds: ["visit-line"],
            },
          ],
        },
      ],
    },
    {
      id: "response",
      title: "Hear their response",
      requirements: [
        {
          id: "positive-response",
          title: "The resident responds",
          routes: [{ id: "reply", verifier: "test.reply", params: {}, automatic: true, evidenceKinds: ["visit-line"] }],
        },
      ],
    },
  ],
};
const registry: ProgressRegistry<State> = {
  verifiers: {
    "test.taste": (route, event, current) =>
      event.kind === "visit-line" &&
      event.speakerId === route.params.speakerId &&
      event.venueId === route.params.venueId &&
      current.itemPresent &&
      event.excerpt?.includes("tasted")
        ? { status: "accepted" }
        : { status: "rejected", reason: "No witnessed taste at the bar with the drink present." },
    "test.reply": (_route, event) =>
      event.excerpt?.includes("I like it")
        ? { status: "accepted" }
        : { status: "rejected", reason: "No explicit positive response." },
  },
  resolvers: { "test.resolve": (_task, key, current) => current.effects.push(key) },
  receiptStillValid: (receipt, current) => receipt.requirementId !== "taste-record" || current.itemPresent,
};
const event = (id: string, excerpt: string, speakerId = "rosa", venueId = "bar"): ProgressEvidence => ({
  id,
  kind: "visit-line",
  at: new Date(Date.now() + 60_000).toISOString(),
  sourceId: "visit:one:turn:one",
  lineId: id,
  speakerId,
  venueId,
  excerpt,
});

const task = createProgressTask(definition);
assert.equal(visibleProgress(task), null);
ingestProgressEvent([task], event("wrong", "I tasted it", "sneak"), state, registry);
assert.equal(task.phaseIndex, 0);
assert.equal(task.attempts.at(-1)?.reason, "No witnessed taste at the bar with the drink present.");
ingestProgressEvent([task], event("taste", "I tasted it"), state, registry);
assert.equal(task.phaseIndex, 1);
assert.equal(task.receipts[0]?.evidence.lineId, "taste");
assert.equal(visibleProgress(task), null);
revealProgress(task, "2026-09-29T12:01:00.000Z");
revealProgress(task, "2026-09-29T12:01:00.000Z", "taste-record");
assert.equal(visibleProgress(task)?.phases[0]?.requirements[0]?.complete, true);
assert.deepEqual(visibleProgress(task)?.phases[1]?.requirements, []);
state.itemPresent = false;
assert.equal(
  submitProgressEvidence(task, "positive-response", "reply", event("reply", "I like it"), state, registry).status,
  "accepted",
);
assert.equal(task.phaseIndex, 2);
assert.equal(state.effects.length, 1);
ingestProgressEvent([task], event("reply", "I like it"), state, registry);
assert.equal(state.effects.length, 1);
assert.equal(task.resolutionKey, "hidden-task:1:resolved");
assert.deepEqual(coerceProgressTasks(JSON.parse(JSON.stringify([task]))), [task]);

const revised = createProgressTask(definition);
const proof = event("carry", "I tasted it");
submitProgressEvidence(revised, "taste-record", "scene", proof, state, registry);
state.itemPresent = true;
submitProgressEvidence(revised, "taste-record", "scene", proof, state, registry);
assert.equal(revised.receipts.length, 1);
reviseProgress(revised, { ...definition, revision: 2 }, [revised.receipts[0]!.id]);
assert.equal(revised.receipts.length, 1);
assert.equal(revised.phaseIndex, 0);
assert.equal(revised.resolvedAt, "");
console.log("Villages Progress Engine regression: typed proof, hidden progress, replay, resolution, revision ok");
