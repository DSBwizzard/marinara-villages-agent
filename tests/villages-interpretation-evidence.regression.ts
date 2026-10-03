import assert from "node:assert/strict";
import {
  boundInterpretationEvidence,
  interpretationPayload,
} from "../packages/villages/src/engine/packages/server/src/services/villages/interpretation-evidence.js";
import type { InterpretationCheck } from "../packages/villages/src/engine/packages/server/src/services/villages/interpretation.js";
function check(count: number, actor = "a"): InterpretationCheck {
  return {
    id: actor,
    domain: "room",
    question: "Permission?",
    facts: { actorId: actor },
    outcomes: [{ id: "invite-now", statement: "permission" }],
    evidence: [
      ...Array.from({ length: count }, (_, i) => ({
        id: "history:" + i,
        speakerId: "a",
        name: "A",
        content: "ordinary conversation ".repeat(15),
      })),
      { id: "question", speakerId: "player", name: "Player", content: "May I come in?" },
      { id: "draft:0", speakerId: "a", name: "A", content: "Sure.", current: true },
    ],
  };
}
for (const residents of [1, 4, 8]) {
  let short = 0;
  for (const turns of [10, 30, 60]) {
    const checks = Array.from({ length: residents * 2 }, (_, i) => ({ ...check(turns * 4, String(i)), id: String(i) }));
    let size = 0;
    for (let i = 0; i < checks.length; i += 4) {
      const packed = interpretationPayload(checks.slice(i, i + 4));
      assert.ok(packed.fits);
      assert.ok(packed.serialized.length <= 24000);
      assert.equal(packed.payload.evidence.length, 13);
      assert.ok(
        !packed.serialized.includes('"evidence":[{"id":"history:') ||
          packed.payload.checks.every((row) => !("evidence" in row)),
      );
      size += packed.serialized.length;
    }
    if (turns === 10) short = size;
    else assert.ok(size <= short + residents * 100, "history growth is bounded");
    console.log(residents + " residents, " + turns + " turns: " + size + " checking characters");
  }
}
const long = check(600);
const bounded = boundInterpretationEvidence(long);
assert.equal(bounded.evidence.length, 13);
assert.ok(bounded.evidence.some((line) => line.id === "question"));
const project = { ...long, domain: "project" as const, facts: { requirementCitationIds: ["history:0"] } };
assert.ok(boundInterpretationEvidence(project).evidence.some((line) => line.id === "history:0"));
const huge = {
  ...long,
  evidence: [{ id: "draft:0", speakerId: "a", name: "A", current: true, content: "x".repeat(24001) }],
};
assert.equal(interpretationPayload([huge]).fits, false, "essential overflow is unresolved, never silently truncated");
const privateCheck = {
  ...check(0, "b"),
  evidence: [{ id: "b-only", speakerId: "b", name: "B", content: "private", current: true }],
};
const shared = interpretationPayload([check(0), privateCheck]);
assert.deepEqual(shared.payload.checks[0].evidenceIds, ["question", "draft:0"]);
assert.deepEqual(shared.payload.checks[1].evidenceIds, ["b-only"]);
const collision = { ...privateCheck, evidence: [{ ...privateCheck.evidence[0], id: "draft:0" }] };
assert.equal(interpretationPayload([check(0), collision]).fits, false);
console.log("Bounded deduplicated checking evidence passed");

async function main() {
  const { systemInterpretations } =
    await import("../packages/villages/src/engine/packages/server/src/services/villages/interpretation.js");
  assert.equal(
    (await systemInterpretations([huge]))[0].outcome,
    "unresolved",
    "overflow is refused before even resolving a model",
  );
  console.log("Essential overflow makes zero model requests");
  const { configureVillagesRuntime } =
    await import("../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js");
  const { contextualChecks, saveInterpretationContext } =
    await import("../packages/villages/src/engine/packages/server/src/services/villages/interpretation-evidence.js");
  const records = new Map<string, any>();
  const release = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById(_p: string, id: string) {
          return structuredClone(records.get(id) ?? null);
        },
        async create(input: any) {
          const row = { ...structuredClone(input), revision: 1 };
          records.set(input.id, row);
          return row;
        },
        async update(input: any) {
          const row = records.get(input.id);
          if (row?.revision !== input.expectedRevision) return null;
          const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
          records.set(input.id, next);
          return next;
        },
      },
    },
  } as any);
  try {
    records.set("villages-venue-visit-s", {
      data: {
        lines: [
          { id: "p-old", role: "user" },
          { id: "r-old", role: "assistant" },
          { id: "p-new", role: "user" },
          { id: "r-new", role: "assistant" },
        ],
        submissions: [
          { id: "first", replyLineIds: ["r-old"] },
          { id: "second", replyLineIds: ["r-new"] },
        ],
      },
    });
    const pending = {
      ...check(0),
      evidence: [
        { id: "player-input", speakerId: "player", name: "Player", content: "Can I enter?" },
        { id: "draft:0", speakerId: "a", name: "A", content: "Over there.", current: true },
      ],
    };
    const batch: any = {
      checks: [pending],
      results: [{ outcome: "unresolved", evidenceIds: [], reason: "Ambiguous target" }],
    };
    await saveInterpretationContext("s", batch, "first");
    const contextual = (await contextualChecks("s", [pending]))[0];
    assert.deepEqual(
      contextual.essentialEvidenceIds,
      ["p-old", "r-old"],
      "late bookkeeping pins the named exchange, never the latest one",
    );
    const proof = {
      ...check(600),
      essentialEvidenceIds: contextual.essentialEvidenceIds,
      evidence: [{ id: "p-old", speakerId: "player", name: "Player", content: "Can I enter?" }, ...check(600).evidence],
    };
    assert.ok(boundInterpretationEvidence(proof).evidence.some((line) => line.id === "p-old"));
    assert.ok(
      !boundInterpretationEvidence(proof).evidence.some((line) => line.id === "r-old"),
      "pinning cannot manufacture unwitnessed evidence",
    );
    batch.results[0].outcome = "invite-now";
    await saveInterpretationContext("s", batch, "first");
    assert.deepEqual((await contextualChecks("s", [pending]))[0].essentialEvidenceIds, []);
    console.log("Exact pending references, witness restrictions and positive resolution passed");
  } finally {
    release();
  }
}
void main();
