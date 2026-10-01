import { randomUUID } from "node:crypto";
import { villagesDocuments, VILLAGES_PACKAGE_ID } from "./package-runtime.js";
import { mutateDocument, type DocumentSlot } from "./village-store.js";
import type { InterpretationBatch, InterpretationTrace } from "./interpretation.js";
import { systemInterpretations } from "./interpretation.js";
import { outsideVenueOperation } from "./venue-coordinator.js";

type DiagnosticTrace = InterpretationTrace & {
  comparisonAttempt?: { id: string; status: "dispatching" | "complete" | "unknown"; startedAt: string };
};
type Diagnostics = { checks: DiagnosticTrace[] };
const controllers = new Map<string, AbortController>();
const documentId = (sceneId: string) => `villages-interpretation-${sceneId}`;
const slot: DocumentSlot<Diagnostics> = {
  kind: "interpretation-diagnostics",
  name: "Scene interpretation checks",
  description: "Bounded read-only interpretation comparisons",
  coerce: (value) => ({
    checks:
      value && typeof value === "object" && Array.isArray((value as Diagnostics).checks)
        ? (value as Diagnostics).checks.slice(-100)
        : [],
  }),
  label: () => "Scene interpretation checks",
};
export async function readInterpretationDiagnostics(sceneId: string): Promise<Diagnostics> {
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, documentId(sceneId));
  const data = slot.coerce(record?.data);
  // A crash or package shutdown cannot leave a comparison advertised as running forever.
  for (const trace of data.checks)
    if (
      trace.comparisonAttempt?.status === "dispatching" &&
      Date.now() - Date.parse(trace.comparisonAttempt.startedAt) > 35_000
    ) {
      trace.system = { status: "unknown", reason: "Comparison was interrupted; it was not retried" };
    }
  return data;
}
export async function writeInterpretationDiagnostics(sceneId: string, traces: InterpretationTrace[]) {
  await mutateDocument(documentId(sceneId), slot, (state) => {
    for (const original of traces) {
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
        },
        evidence: selected.map((line) => ({ ...line, content: line.content.slice(0, 600) })),
      };
      const prior = state.checks.find((row) => row.id === trace.id);
      if (prior) {
        const comparison = prior.comparisonAttempt ? prior.system : null;
        Object.assign(prior, trace);
        if (comparison) prior.system = comparison;
      } else state.checks.push(structuredClone(trace));
    }
    state.checks = state.checks.slice(-100);
  });
}
export async function removeInterpretationDiagnostics(sceneId: string) {
  stopInterpretationComparisons(sceneId);
  const record = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, documentId(sceneId));
  if (record) await villagesDocuments().remove(VILLAGES_PACKAGE_ID, record.id, record.revision);
}
export function stopInterpretationComparisons(sceneId?: string) {
  for (const [key, controller] of controllers) if (!sceneId || key.startsWith(`${sceneId}:`)) controller.abort();
}
export function scheduleSystemComparisons(sceneId: string, batch: InterpretationBatch): void {
  if (!batch.settings.compareSystem || !batch.settings.decisionsEnabled) return;
  const eligible = batch.checks.filter((_check, index) => batch.results[index].source === "decisions");
  if (!eligible.length) return;
  const key = `${sceneId}:${eligible.map((check) => check.id).join("|")}`;
  if (controllers.has(key)) return;
  const controller = new AbortController();
  controllers.set(key, controller);
  void outsideVenueOperation(async () => {
    const attemptId = randomUUID();
    let claimed = false;
    try {
      await mutateDocument(documentId(sceneId), slot, (state) => {
        claimed = false;
        const traces = state.checks.filter((trace) =>
          eligible.some((check) => trace.id === batch.traces[batch.checks.indexOf(check)].id),
        );
        if (traces.length !== eligible.length || traces.some((trace) => trace.comparisonAttempt)) return;
        for (const trace of traces) {
          trace.system = { status: "pending" };
          trace.comparisonAttempt = { id: attemptId, status: "dispatching", startedAt: new Date().toISOString() };
        }
        claimed = true;
      });
      if (!claimed) return;
      const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(30_000)]);
      signal.throwIfAborted();
      let abort: () => void = () => {};
      const result = await Promise.race([
        systemInterpretations(structuredClone(eligible), signal),
        new Promise<never>((_resolve, reject) => {
          abort = () => reject(new Error("Comparison interrupted"));
          signal.addEventListener("abort", abort, { once: true });
          if (signal.aborted) abort();
        }),
      ]).finally(() => signal.removeEventListener("abort", abort));
      await mutateDocument(documentId(sceneId), slot, (state) => {
        for (const trace of state.checks) {
          if (trace.comparisonAttempt?.id !== attemptId) continue;
          const index = eligible.findIndex((check) => trace.id === batch.traces[batch.checks.indexOf(check)].id);
          trace.comparisonAttempt.status = "complete";
          trace.system = { status: "complete", outcome: result[index].outcome, reason: result[index].reason };
        }
      });
    } catch {
      // Diagnostic failure must never fail a Scene, export provider error bodies, or authorize another call.
      await mutateDocument(documentId(sceneId), slot, (state) => {
        for (const trace of state.checks)
          if (trace.comparisonAttempt?.id === attemptId) {
            trace.comparisonAttempt.status = "unknown";
            trace.system = {
              status: "unavailable",
              reason: "System comparison did not complete; no gameplay was changed",
            };
          }
      }).catch(() => {});
    } finally {
      controllers.delete(key);
    }
  });
}
