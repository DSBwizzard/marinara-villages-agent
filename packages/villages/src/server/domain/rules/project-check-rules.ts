import { projectPhysicalDesign } from "../../../shared/helpers/project-design.js";
import { validDecisionEvidence } from "./decision-candidates.js";
import type { InterpretationBatch } from "../models/interpretation-model.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { asRecord } from "./coerce.js";
import type { ProjectSpeechProposal } from "./project-interpretation.js";
const projectReferenceWords = (text: string) =>
  [
    ...new Set(
      text
        .normalize("NFKC")
        .toLocaleLowerCase()
        .match(/[\p{L}\p{N}]+/gu) ?? [],
    ),
  ].filter(
    (word) =>
      word.length > 2 &&
      !/^(?:the|and|for|with|new|venue|project|build|building|room|place|space|work|this|that|our|your|from|will|would|can|could|need|needs)$/u.test(
        word,
      ),
  );
/** A relevance gate admits interpretation, never an approval, commitment or physical effect. */
export function projectExchangeRelevant(
  scene: VenueScene,
  project: VillageState["projects"][number],
  revision: number,
  actor: string,
  message: string,
  draft: readonly { speakerId: string; content: string }[],
): boolean {
  const speech = draft
    .filter((line) => line.speakerId === actor)
    .map((line) => line.content)
    .join(" ");
  const current = (message + " " + speech).normalize("NFKC").toLocaleLowerCase();
  const words = new Set(current.match(/[\p{L}\p{N}]+/gu) ?? []);
  const title = project.title.normalize("NFKC").toLocaleLowerCase();
  if (
    (title && current.includes(title)) ||
    words.has(project.id.toLocaleLowerCase()) ||
    projectReferenceWords(project.title).some((word) => words.has(word))
  )
    return true;
  const detail = projectPhysicalDesign(project);
  if (projectReferenceWords(detail).filter((word) => words.has(word)).length >= 2) return true;
  const prior = scene.submissions.at(-1);
  const contexts = (prior?.projectContexts ?? []).filter(
    (context) => context.revision === revision && context.phase === project.lifecycle?.phase,
  );
  const bound = contexts.some((context) => context.projectId === project.id);
  const continuation =
    !message.trim() ||
    /^(?:and |what (?:else|about)|anything else|go on|tell me more|continue|yes|no|okay|sure)|\b(?:build|construct|renovate|approve|lead)\b/iu.test(
      message,
    );
  const question = /[?]|\b(?:can|could|would|will|what|which|do|shall)\b/iu.test(prior?.message ?? "");
  const priorWords = new Set((prior?.message ?? "").toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);
  const identified = projectReferenceWords(project.title).some((word) => priorWords.has(word));
  return bound && continuation && (contexts.length === 1 || (question && identified));
}

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
