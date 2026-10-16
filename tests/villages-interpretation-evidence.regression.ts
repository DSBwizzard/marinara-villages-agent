import assert from "node:assert/strict";
import {
  boundInterpretationEvidence,
  interpretationPayload,
} from "../packages/villages/src/server/domain/rules/interpretation-evidence-rules.js";
import type { InterpretationCheck } from "../packages/villages/src/server/domain/models/interpretation-check-model.js";
import type { InterpretationBatch } from "../packages/villages/src/server/domain/models/interpretation-model.js";
import {
  activationScope,
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  contextualChecks,
  saveInterpretationContext,
} from "../packages/villages/src/server/features/generation/interpretation-evidence.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

async function savedContextOwnership() {
  const sceneId = "villages-venue-visit-s",
    contextId = "villages-interpretation-context-s";
  function fixture(label: string, heldStage?: string) {
    const scope = createActivationScope(),
      entered = deferred(),
      gate = deferred();
    const records = new Map<string, any>([
      [
        sceneId,
        {
          id: sceneId,
          revision: 1,
          data: {
            lines: [
              { id: label + "-player", role: "user" },
              { id: label + "-reply", role: "assistant" },
            ],
            submissions: [{ id: "turn", replyLineIds: [label + "-reply"] }],
          },
        },
      ],
    ]);
    let contextReads = 0,
      held = false,
      conflicts = 0;
    let readFailure: Error | undefined, saveFailure: Error | undefined;
    const writes: string[] = [];
    async function pause(stage: string) {
      if (!held && heldStage === stage) {
        held = true;
        entered.resolve();
        await gate.promise;
      }
    }
    const documents = {
      async getById(_packageId: string, id: string) {
        assert.equal(activationScope(), scope, label + " reads its own store");
        if (id === sceneId) await pause("scene");
        if (id === contextId) await pause(++contextReads === 1 ? "context" : "mutation");
        if (readFailure) throw readFailure;
        return structuredClone(records.get(id) ?? null);
      },
      async list() {
        return [];
      },
      async create(input: any) {
        assert.equal(activationScope(), scope);
        await pause("save");
        if (saveFailure) throw saveFailure;
        if (records.has(input.id)) throw new Error("Duplicate");
        const row = { ...structuredClone(input), revision: 1 };
        writes.push(input.id);
        records.set(input.id, row);
        return structuredClone(row);
      },
      async update(input: any) {
        assert.equal(activationScope(), scope);
        await pause("save");
        if (saveFailure) throw saveFailure;
        const old = records.get(input.id);
        if (conflicts-- > 0) {
          records.set(input.id, {
            ...old,
            revision: old.revision + 1,
            data: { entries: { ...old.data.entries, concurrent: [label + "-saved"] } },
          });
          return null;
        }
        if (!old || old.revision !== input.expectedRevision) return null;
        const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
        writes.push(input.id);
        records.set(input.id, row);
        return structuredClone(row);
      },
      async remove() {
        return false;
      },
    };
    const release = scope.run(() =>
      configureVillagesRuntime({
        persistence: { documents },
        getAgentConfig: async () => null,
        logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
      } as any),
    );
    assert.deepEqual(writes, [], "application assembly performs no context writes");
    return {
      scope,
      entered,
      gate,
      records,
      writes,
      release,
      conflict() {
        conflicts = 1;
      },
      failRead(error?: Error) {
        readFailure = error;
      },
      failSave(error?: Error) {
        saveFailure = error;
      },
    };
  }
  const pendingCheck: InterpretationCheck = {
    ...check(0),
    facts: { actorId: "resident", zoneId: "private" },
    evidence: [
      { id: "player-input", speakerId: "player", name: "Player", content: "Synthetic private question" },
      { id: "draft:0", speakerId: "resident", name: "Resident", content: "Synthetic private answer", current: true },
    ],
  };
  const batch: InterpretationBatch = {
    checks: [pendingCheck],
    traces: [],
    settings: { decisionsEnabled: false, compareSystem: false },
    results: [{ outcome: "unresolved", source: "system", evidenceIds: [], reason: "Ambiguous target" }],
  };
  for (const stage of ["scene", "context", "mutation", "save"]) {
    const a = fixture("A", stage),
      b = fixture("B");
    if (stage === "save") {
      a.records.set(contextId, { id: contextId, revision: 1, data: { entries: { preserved: ["A-old"] } } });
      a.conflict();
    }
    const clearA = installDefaultActivation(a.scope, () => {});
    let clearB = () => {};
    try {
      const pending = saveInterpretationContext("s", batch, "turn");
      await Promise.race([
        a.entered.promise,
        pending.then(() => assert.fail("The request completed before its controlled " + stage + " pause")),
      ]);
      clearB = installDefaultActivation(b.scope, () => {});
      await saveInterpretationContext("s", batch, "turn");
      clearA();
      a.gate.resolve();
      await pending;
      const entriesA = a.records.get(contextId)?.data.entries,
        entriesB = b.records.get(contextId)?.data.entries;
      assert.deepEqual(entriesA["room:resident:private::"], ["A-player", "A-reply"]);
      assert.deepEqual(entriesB, { "room:resident:private::": ["B-player", "B-reply"] });
      if (stage === "save") {
        assert.deepEqual(entriesA.preserved, ["A-old"]);
        assert.deepEqual(entriesA.concurrent, ["A-saved"], "CAS retry preserves the winning saved state");
      }
      assert.equal(a.writes.length, 1);
      assert.equal(b.writes.length, 1);
      assert.doesNotMatch(JSON.stringify(entriesA), /Synthetic private|Ambiguous target/);
      assert.deepEqual((await contextualChecks("s", [pendingCheck]))[0].essentialEvidenceIds, ["B-player", "B-reply"]);
      assert.deepEqual((await a.scope.run(() => contextualChecks("s", [pendingCheck])))[0].essentialEvidenceIds, [
        "A-player",
        "A-reply",
      ]);
    } finally {
      a.gate.resolve();
      clearA();
      clearB();
      a.release();
      b.release();
      a.scope.dispose();
      b.scope.dispose();
    }
  }
  const a = fixture("A"),
    b = fixture("B");
  const clearA = installDefaultActivation(a.scope, () => {});
  let clearB = () => {};
  try {
    const exactReadError = new Error("exact context read failure");
    a.failRead(exactReadError);
    await assert.rejects(saveInterpretationContext("s", batch, "turn"), (error) => error === exactReadError);
    await assert.rejects(contextualChecks("s", [pendingCheck]), (error) => error === exactReadError);
    a.failRead();
    const exactSaveError = new Error("exact context save failure");
    a.failSave(exactSaveError);
    await assert.rejects(saveInterpretationContext("s", batch, "turn"), (error) => error === exactSaveError);
    assert.equal(a.records.has(contextId), false);
    a.failSave();
    const resolved = { ...batch, results: [{ ...batch.results[0], outcome: "invite-now" }] };
    await saveInterpretationContext("missing", batch, "turn");
    await saveInterpretationContext("s", resolved, "turn");
    assert.deepEqual(a.writes, [], "missing transcript or no unresolved/previous context causes no write");
    a.records.set(contextId, {
      id: contextId,
      revision: 1,
      data: { entries: Object.fromEntries(Array.from({ length: 100 }, (_, n) => ["old" + n, ["line" + n]])) },
    });
    await saveInterpretationContext("s", batch, "turn");
    assert.equal(Object.keys(a.records.get(contextId).data.entries).length, 100);
    assert.equal(a.records.get(contextId).data.entries.old0, undefined);
    await saveInterpretationContext("s", { ...batch, results: [{ ...batch.results[0], outcome: "none" }] }, "turn");
    assert.deepEqual(a.records.get(contextId).data.entries["room:resident:private::"], ["A-player", "A-reply"]);
    await saveInterpretationContext("s", resolved, "turn");
    assert.equal(a.records.get(contextId).data.entries["room:resident:private::"], undefined);
    clearB = installDefaultActivation(b.scope, () => {});
    a.release();
    a.scope.dispose();
    await assert.rejects(
      a.scope.run(() => saveInterpretationContext("s", batch, "turn")),
      /not configured/,
    );
    await saveInterpretationContext("s", batch, "turn");
    assert.equal(b.writes.length, 1);
  } finally {
    clearA();
    clearB();
    a.release();
    b.release();
    a.scope.dispose();
    b.scope.dispose();
  }
  const retired = fixture("A", "scene"),
    current = fixture("B");
  const clearRetired = installDefaultActivation(retired.scope, () => {});
  let clearCurrent = () => {};
  try {
    const pending = saveInterpretationContext("s", batch, "turn");
    const refused = assert.rejects(pending, /not configured/);
    await retired.entered.promise;
    clearCurrent = installDefaultActivation(current.scope, () => {});
    retired.release();
    retired.scope.dispose();
    retired.gate.resolve();
    await refused;
    assert.equal(current.records.has(contextId), false);
    assert.equal(retired.records.has(contextId), false);
  } finally {
    retired.gate.resolve();
    clearRetired();
    clearCurrent();
    retired.release();
    current.release();
    retired.scope.dispose();
    current.scope.dispose();
  }
}
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
assert.equal(
  interpretationPayload([{ ...check(0), essentialEvidenceIds: ["unwitnessed"] }]).fits,
  false,
  "missing essential evidence requires clarification without leaking it",
);
const collision = { ...privateCheck, evidence: [{ ...privateCheck.evidence[0], id: "draft:0" }] };
assert.equal(interpretationPayload([check(0), collision]).fits, false);
console.log("Bounded deduplicated checking evidence passed");

async function main() {
  await savedContextOwnership();
  const { createSystemInterpretation } =
    await import("../packages/villages/src/server/features/generation/system-interpretation-service.js");
  const { systemInterpretations } = createSystemInterpretation({
    villagesLanguageModels: () => assert.fail("Overflow must not resolve a model"),
    villagesConnectionIdFor: async () => assert.fail("Overflow must not read connection settings"),
    completeWithRoom: async () => assert.fail("Overflow must not request a completion"),
  });
  assert.equal(
    (await systemInterpretations([huge]))[0].outcome,
    "unresolved",
    "overflow is refused before even resolving a model",
  );
  console.log("Essential overflow makes zero model requests");
  const { configureVillagesRuntime } = await import("../packages/villages/src/server/entry/runtime.js");
  const { contextualChecks, saveInterpretationContext } =
    await import("../packages/villages/src/server/features/generation/interpretation-evidence.js");
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
await main();
