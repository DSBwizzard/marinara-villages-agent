import { VILLAGES_PACKAGE_ID } from "../../adapters/engine/runtime-host.js";
import type { villagesDocuments } from "../../adapters/engine/runtime-host.js";
import type { DocumentSlot, mutateDocument } from "../../adapters/storage/document-store.js";
import type { InterpretationTrace } from "../../domain/models/interpretation-model.js";

export type Diagnostics = { checks: InterpretationTrace[] };
export type InterpretationDiagnosticsPorts = {
  villagesDocuments: typeof villagesDocuments;
  mutateDocument: typeof mutateDocument;
};
/** Bounded diagnostics belong to one application; reading them never starts model work. */
export function createInterpretationDiagnostics(ports: InterpretationDiagnosticsPorts) {
  const { villagesDocuments, mutateDocument } = ports;

  function safeAccessTrace<T extends InterpretationTrace>(trace: T): T {
    if (!trace.id.includes("access-speech:")) return trace;
    return {
      ...trace,
      question: "Check witnessed access-management speech",
      result: {
        outcome: trace.result.outcome,
        source: trace.result.source,
        evidenceIds: trace.result.evidenceIds,
        reason: "Exact speech and current authority checked.",
      },
      system: { ...trace.system, ...(trace.system.reason ? { reason: "Grounded access check completed." } : {}) },
      decisions: {
        ...trace.decisions,
        ...(trace.decisions.reason ? { reason: "Access check routing recorded." } : {}),
      },
    };
  }

  const documentId = (sceneId: string) => `villages-interpretation-${sceneId}`;

  const slot: DocumentSlot<Diagnostics> = {
    kind: "interpretation-diagnostics",
    name: "Scene interpretation checks",
    description: "Bounded read-only interpretation diagnostics",
    coerce: (value) => ({
      checks:
        value && typeof value === "object" && Array.isArray((value as Diagnostics).checks)
          ? (value as Diagnostics).checks.slice(-100)
          : [],
    }),
    label: () => "Scene interpretation checks",
  };

  async function readInterpretationDiagnostics(sceneId: string): Promise<Diagnostics> {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, documentId(sceneId));
    const data = slot.coerce(record?.data);
    return { checks: data.checks.map(safeAccessTrace) };
  }

  async function writeInterpretationDiagnostics(sceneId: string, traces: InterpretationTrace[]) {
    await mutateDocument(documentId(sceneId), slot, (state) => {
      for (const raw of traces) {
        const original = safeAccessTrace(raw);
        const selected = original.evidence
          .filter(
            (line, index, lines) =>
              line.current || original.result.evidenceIds.includes(line.id) || index >= lines.length - 6,
          )
          .slice(-12);
        const trace = {
          ...original,
          result: {
            outcome: original.result.outcome,
            source: original.result.source,
            evidenceIds: original.result.evidenceIds.slice(0, 100),
            reason: original.result.reason,
            ...(original.result.failure ? { failure: original.result.failure } : {}),
          },
          evidence: selected.map((line) => ({ ...line, content: line.content.slice(0, 600) })),
        };
        const prior = state.checks.find((row) => row.id === trace.id);
        if (prior) Object.assign(prior, trace);
        else state.checks.push(structuredClone(trace));
      }
      state.checks = state.checks.slice(-100);
    });
  }

  async function removeInterpretationDiagnostics(sceneId: string) {
    const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, documentId(sceneId));
    if (record && !(await villagesDocuments().remove(VILLAGES_PACKAGE_ID, record.id, record.revision)))
      throw new Error("Scene interpretation diagnostics changed during cleanup.");
    const pending = await villagesDocuments().getById(
      VILLAGES_PACKAGE_ID,
      "villages-interpretation-context-" + sceneId,
    );
    if (pending && !(await villagesDocuments().remove(VILLAGES_PACKAGE_ID, pending.id, pending.revision)))
      throw new Error("Scene interpretation context changed during cleanup.");
  }

  return {
    readInterpretationDiagnostics,
    writeInterpretationDiagnostics,
    removeInterpretationDiagnostics,
  };
}
export type InterpretationDiagnostics = ReturnType<typeof createInterpretationDiagnostics>;
