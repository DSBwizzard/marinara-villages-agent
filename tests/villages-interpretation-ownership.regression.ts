import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
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
} from "../packages/villages/src/server/features/generation/interpretation-diagnostics.js";
import type { InterpretationTrace } from "../packages/villages/src/server/domain/models/interpretation-model.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
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
  const host: any = {
    persistence: { documents: villageFixtureDocuments(documents) },
    isDebugAgentsEnabled: () => false,
    logger,
  };
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

const a = fixture("A"),
  b = fixture("B");
await a.service.writeInterpretationDiagnostics("same-scene", [trace]);
await b.service.writeInterpretationDiagnostics("same-scene", [{ ...trace, applied: "B" }]);
a.conflict();
await a.service.writeInterpretationDiagnostics("same-scene", [{ ...trace, applied: "A" }]);
assert.equal((await a.service.readInterpretationDiagnostics("same-scene")).checks[0].applied, "A");
assert.equal((await b.service.readInterpretationDiagnostics("same-scene")).checks[0].applied, "B");
const saved = a.rows.get("villages-interpretation-same-scene").data.checks[0];
saved.comparisonAttempt = { id: "legacy", status: "dispatching", startedAt: "2000-01-01" };
saved.system = { status: "pending" };
for (let i = 0; i < 3; i++) await a.service.readInterpretationDiagnostics("same-scene");
assert.equal(a.calls(), 0, "legacy comparison records never schedule work");
assert.doesNotMatch(
  JSON.stringify(await a.service.readInterpretationDiagnostics("same-scene")),
  /private quoted|private rationale|private Decisions/,
);
const ownerA = createActivationScope(),
  ownerB = createActivationScope();
const releaseA = ownerA.run(() => configureVillagesRuntime(a.host));
const releaseB = ownerB.run(() => configureVillagesRuntime(b.host));
const bindings = [
  ownerA.run(() => configureInterpretationDiagnostics(a.service)),
  ownerB.run(() => configureInterpretationDiagnostics(b.service)),
];
const clearA = installDefaultActivation(ownerA, () => {});
const pending = writeInterpretationDiagnostics("same-scene", [{ ...trace, applied: "owned A" }]);
const clearB = installDefaultActivation(ownerB, () => {});
await pending;
assert.equal((await ownerA.run(() => readInterpretationDiagnostics("same-scene"))).checks[0].applied, "owned A");
assert.equal((await readInterpretationDiagnostics("same-scene")).checks[0].applied, "B");
await a.service.removeInterpretationDiagnostics("same-scene");
assert.equal((await a.service.readInterpretationDiagnostics("same-scene")).checks.length, 0);
assert.equal((await b.service.readInterpretationDiagnostics("same-scene")).checks.length, 1);
clearA();
clearB();
bindings.forEach((release) => release());
releaseA();
releaseB();
ownerA.dispose();
ownerB.dispose();
console.log("Interpretation diagnostics ownership, CAS, privacy and inert legacy comparison records: ok");
