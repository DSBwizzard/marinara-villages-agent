import { validDecisionEvidence } from "./decision-candidates.js";
import type { InterpretationBatch } from "../models/interpretation-model.js";
import { asRecord } from "./coerce.js";
import type { ProjectSpeechProposal } from "./project-interpretation.js";

export function projectProposals(batch: InterpretationBatch): ProjectSpeechProposal[] {
  return batch.results.flatMap((result, index) => {
    const check = batch.checks[index],
      facts = asRecord(check.facts);
    if (!validDecisionEvidence(check, result) || !["approve", "commit", "withdraw"].includes(result.outcome)) return [];
    const kind = facts.kind as ProjectSpeechProposal["kind"];
    const conflict = batch.results.some(
      (other, i) =>
        i !== index &&
        other.outcome === result.outcome &&
        asRecord(batch.checks[i].facts).actorId === facts.actorId &&
        asRecord(batch.checks[i].facts).kind === kind &&
        asRecord(batch.checks[i].facts).projectId !== facts.projectId,
    );
    if (conflict) {
      batch.traces[index].applied = "Unresolved: clarify which Project";
      return [];
    }
    const citations = check.evidence
      .filter((line) => line.current && line.speakerId === facts.actorId && result.evidenceIds.includes(line.id))
      .map((line) => ({ lineId: line.id.startsWith("draft:") ? line.id.slice(6) : line.id, quote: line.content }));
    if (!citations.length) return [];
    return [
      {
        version: 1 as const,
        projectId: String(facts.projectId),
        revision: Number(facts.revision),
        phase: String(facts.phase),
        kind,
        speakerId: String(facts.actorId),
        citations,
        contextual: {
          version: 1 as const,
          source: result.source,
          checkId: batch.traces[index].id,
          ...(result.source === "decisions" ? { decisionEvidenceVersion: 1 as const } : {}),
        },
      },
    ];
  });
}
