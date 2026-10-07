import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { mutateDocument } from "../../adapters/storage/document-store.js";
import type { InterpretationCheck } from "../../domain/models/interpretation-check-model.js";
import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
export type InterpretationEvidencePorts = {
  VILLAGES_PACKAGE_ID: string;
  villagesDocuments(): Pick<CapabilityDocumentStore, "getById">;
  mutateDocument: typeof mutateDocument;
};
/** Saved evidence references use only the storage connections supplied by this application. */
export function createInterpretationEvidence(ports: InterpretationEvidencePorts) {
  const { VILLAGES_PACKAGE_ID, villagesDocuments, mutateDocument } = ports;

  const contextKey = (check: InterpretationCheck) => {
    const facts = check.facts as Record<string, unknown>;
    return [check.domain, facts.actorId, facts.zoneId ?? facts.projectId, facts.revision ?? "", facts.phase ?? ""].join(
      ":",
    );
  };

  type EvidenceContext = { entries: Record<string, string[]> };

  const contextSlot = {
    kind: "interpretation-context",
    name: "Pending Scene interpretation evidence",
    description: "Exact line references for unresolved checks",
    coerce: (raw: unknown): EvidenceContext => ({ entries: (raw as EvidenceContext | null)?.entries ?? {} }),
    label: () => "Pending Scene interpretation evidence",
  };

  async function contextualChecks(sceneId: string, checks: InterpretationCheck[]) {
    const row = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-interpretation-context-" + sceneId);
    const context = contextSlot.coerce(row?.data);
    return checks.map((check) => ({ ...check, essentialEvidenceIds: context.entries[contextKey(check)] ?? [] }));
  }

  async function saveInterpretationContext(sceneId: string, batch: InterpretationBatch, submissionId?: string) {
    const row = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-venue-visit-" + sceneId);
    const scene = row?.data as
      { lines?: { id: string; role: string }[]; submissions?: { id?: string; replyLineIds?: string[] }[] } | undefined;
    if (!scene?.lines) return;
    const previous = await villagesDocuments().getById(
      VILLAGES_PACKAGE_ID,
      "villages-interpretation-context-" + sceneId,
    );
    if (!previous && !batch.results.some((result) => result.outcome === "unresolved")) return;
    const replyIds =
      (submissionId ? scene.submissions?.find((turn) => turn.id === submissionId) : scene.submissions?.at(-1))
        ?.replyLineIds ?? [];
    const replyStart = scene.lines.findIndex((line) => line.id === replyIds[0]);
    const playerId = (replyStart >= 0 ? scene.lines.slice(0, replyStart) : scene.lines).findLast(
      (line) => line.role === "user",
    )?.id;
    await mutateDocument("villages-interpretation-context-" + sceneId, contextSlot, (context) => {
      for (const [i, check] of batch.checks.entries()) {
        const key = contextKey(check),
          result = batch.results[i];
        if (result.outcome === "unresolved") {
          context.entries[key] = [
            ...new Set(
              check.evidence
                .map((line) =>
                  line.id.startsWith("draft:")
                    ? replyIds[Number(line.id.slice(6))]
                    : line.id === "player-input"
                      ? playerId
                      : line.id,
                )
                .filter((id): id is string => !!id),
            ),
          ];
        } else if (result.outcome !== "none") delete context.entries[key];
      }
      context.entries = Object.fromEntries(Object.entries(context.entries).slice(-100));
    });
  }

  return { contextualChecks, saveInterpretationContext };
}
export type InterpretationEvidenceService = ReturnType<typeof createInterpretationEvidence>;
