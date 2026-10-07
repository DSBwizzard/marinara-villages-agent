import assert from "node:assert/strict";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import { createInterpretationDiagnostics } from "../packages/villages/src/server/features/generation/interpretation-diagnostics-service.js";
import {
  configureInterpretationDiagnostics,
  readInterpretationDiagnostics,
  writeInterpretationDiagnostics,
  scheduleSystemComparisons,
  stopInterpretationComparisons,
} from "../packages/villages/src/server/features/generation/interpretation-diagnostics.js";
import type {
  InterpretationBatch,
  InterpretationTrace,
} from "../packages/villages/src/server/domain/models/interpretation-model.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const tick = () => new Promise<void>((resolve) => setImmediate(resolve));
async function until(ready: () => boolean) {
  for (let i = 0; i < 300; i++) {
    if (ready()) return;
    await tick();
  }
  throw new Error("Comparison did not reach its expected checkpoint");
}
const trace: InterpretationTrace = {
  id: "access-speech:same-check",
  question: "private quoted access speech",
  domain: "room",
  evidence: [{ id: "current", speakerId: "resident", name: "Resident", content: "Current evidence", current: true }],
  decisions: { status: "answered", outcome: "allow", reason: "private Decisions rationale" },
  system: { status: "not-requested" },
  result: { source: "decisions", outcome: "allow", evidenceIds: ["current"], reason: "private rationale" },
  applied: "none",
  startedAt: new Date().toISOString(),
};
const batch: InterpretationBatch = {
  traces: [trace],
  results: [trace.result],
  settings: { decisionsEnabled: true, compareSystem: true },
  checks: [
    {
      id: trace.id,
      domain: "room",
      question: trace.question,
      evidence: trace.evidence,
      facts: {},
      outcomes: [{ id: "allow", statement: "Allow access" }],
    },
  ],
};
function fixture(name: string) {
  const rows = new Map<string, any>(),
    gate = deferred(),
    entered = deferred();
  let calls = 0,
    conflicts = 0;
  const signals: AbortSignal[] = [];
  const documents: any = {
    async getById(_package: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async create(input: any) {
      if (rows.has(input.id)) throw new Error("Duplicate");
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(input.id, row);
      return row;
    },
    async update(input: any) {
      const row = rows.get(input.id);
      if (conflicts-- > 0 || row?.revision !== input.expectedRevision) return null;
      const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
      rows.set(input.id, next);
      return next;
    },
    async remove(_package: string, id: string, revision: number) {
      if (rows.get(id)?.revision === revision) rows.delete(id);
    },
  };
  const ports = {
    villagesDocuments: () => documents,
    mutateDocument: createDocumentMutator(() => documents),
    outsideVenueOperation: <T>(work: () => T): T => work(),
    systemInterpretations: async (_checks: unknown, signal?: AbortSignal) => {
      calls++;
      if (signal) signals.push(signal);
      entered.resolve();
      await gate.promise;
      return [{ outcome: "allow", source: "system" as const, evidenceIds: ["current"], reason: `${name} result` }];
    },
  };
  const service = createInterpretationDiagnostics(ports);
  const logger = { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} };
  const host: any = { persistence: { documents }, isDebugAgentsEnabled: () => false, logger };
  return {
    service,
    ports,
    host,
    gate,
    entered,
    signals,
    rows,
    calls: () => calls,
    conflict: () => {
      conflicts = 2;
    },
    status: () => rows.get("villages-interpretation-same-scene")?.data.checks[0].comparisonAttempt?.status,
  };
}
async function independentComparisons() {
  const a = fixture("A"),
    b = fixture("B");
  await a.service.writeInterpretationDiagnostics("same-scene", [trace]);
  await b.service.writeInterpretationDiagnostics("same-scene", [trace]);
  a.conflict();
  a.service.scheduleSystemComparisons("same-scene", batch);
  a.service.scheduleSystemComparisons("same-scene", batch);
  b.service.scheduleSystemComparisons("same-scene", batch);
  await Promise.all([a.entered.promise, b.entered.promise]);
  try {
    assert.equal(a.calls(), 1, "same-owner joins and CAS retries do not dispatch twice");
    assert.equal(b.calls(), 1, "same-ID worlds each use their own comparison admission");
    a.service.stopInterpretationComparisons();
    assert.equal(a.signals[0].aborted, true);
    assert.equal(b.signals[0].aborted, false);
    await until(() => a.status() === "unknown");
    b.gate.resolve();
    await until(() => b.status() === "complete");
    a.gate.resolve();
    await tick();
    assert.equal(a.status(), "unknown", "a late abort-ignoring reply does not replace the interruption receipt");
    const diagnosticA = await a.service.readInterpretationDiagnostics("same-scene");
    const diagnosticB = await b.service.readInterpretationDiagnostics("same-scene");
    assert.equal(diagnosticA.checks[0].system.status, "unavailable");
    assert.equal(diagnosticB.checks[0].system.outcome, "allow");
    assert.doesNotMatch(JSON.stringify(diagnosticA), /private quoted|private rationale|A result/);
    a.service.scheduleSystemComparisons("same-scene", batch);
    b.service.scheduleSystemComparisons("same-scene", batch);
    await tick();
    await tick();
    assert.equal(a.calls(), 1, "saved comparison admission never implicitly retries an uncertain paid outcome");
    assert.equal(b.calls(), 1);
    await a.service.removeInterpretationDiagnostics("same-scene");
    assert.equal(a.rows.size, 0);
    assert.equal(b.rows.size, 1, "removal stays in its own store");
  } finally {
    a.service.stopInterpretationComparisons();
    b.service.stopInterpretationComparisons();
    a.gate.resolve();
    b.gate.resolve();
    await tick();
  }
}
async function sameStoreAdmission() {
  const world = fixture("shared");
  const anotherActivation = createInterpretationDiagnostics(world.ports);
  await world.service.writeInterpretationDiagnostics("same-scene", [trace]);
  world.service.scheduleSystemComparisons("same-scene", batch);
  anotherActivation.scheduleSystemComparisons("same-scene", batch);
  await world.entered.promise;
  try {
    await tick();
    assert.equal(world.calls(), 1, "persisted CAS admission protects same-store overlapping activations");
    world.gate.resolve();
    await until(() => world.status() === "complete");
  } finally {
    world.service.stopInterpretationComparisons();
    anotherActivation.stopInterpretationComparisons();
    world.gate.resolve();
    await tick();
  }
}
async function scopedCleanup() {
  const a = fixture("scoped-A"),
    b = fixture("scoped-B");
  const ownerA = createActivationScope(),
    ownerB = createActivationScope();
  const releaseRuntimeA = ownerA.run(() => configureVillagesRuntime(a.host));
  const releaseRuntimeB = ownerB.run(() => configureVillagesRuntime(b.host));
  const releaseA = ownerA.run(() => configureInterpretationDiagnostics(a.service));
  const releaseB = ownerB.run(() => configureInterpretationDiagnostics(b.service));
  const clearDefault = installDefaultActivation(ownerB, () => {});
  try {
    await ownerA.run(() => writeInterpretationDiagnostics("same-scene", [trace]));
    await writeInterpretationDiagnostics("same-scene", [trace]);
    ownerA.run(() => scheduleSystemComparisons("same-scene", batch));
    scheduleSystemComparisons("same-scene", batch);
    await Promise.all([a.entered.promise, b.entered.promise]);
    ownerA.run(() => stopInterpretationComparisons());
    await until(() => a.status() === "unknown");
    assert.equal(b.signals[0].aborted, false, "shutdown cannot abort another owner's comparison");
    releaseA();
    releaseRuntimeA();
    releaseA();
    b.gate.resolve();
    await until(() => b.status() === "complete");
    assert.equal((await readInterpretationDiagnostics("same-scene")).checks[0].system.outcome, "allow");
    await assert.rejects(
      ownerA.run(() => readInterpretationDiagnostics("same-scene")),
      /not configured/,
    );
    const missing = createActivationScope();
    assert.throws(() => missing.run(() => scheduleSystemComparisons("same-scene", batch)), /not configured/);
    missing.dispose();
    ownerA.dispose();
    assert.throws(() => ownerA.run(() => stopInterpretationComparisons()), /not configured/);
    assert.equal(b.calls(), 1);
  } finally {
    ownerA.run(() => a.service.stopInterpretationComparisons());
    ownerB.run(() => stopInterpretationComparisons());
    a.gate.resolve();
    b.gate.resolve();
    await tick();
    releaseA();
    releaseB();
    releaseRuntimeA();
    releaseRuntimeB();
    clearDefault();
    ownerA.dispose();
    ownerB.dispose();
  }
}
async function main() {
  await independentComparisons();
  await sameStoreAdmission();
  await scopedCleanup();
  console.log(
    "Interpretation comparison admission, cancellation, saved receipts and diagnostic privacy are owned per activation.",
  );
}
void main();
