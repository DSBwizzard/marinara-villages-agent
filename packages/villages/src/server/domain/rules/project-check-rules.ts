import type { InterpretationBatch } from "../models/interpretation-model.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import type { ProjectSpeechProposal } from "./project-interpretation.js";
import { recordProjectProgress } from "./project-progress.js";
import { physicalVenueEvents } from "./venue-scene-state.js";

export function pickupRevision(state: VillageState, projectId: string) {
  return state.progressTasks.find(
    (item) => item.definition.owner.kind === "project" && item.definition.owner.id === projectId,
  )?.definition.revision;
}

/** Apply a semantic allocation only against an existing inventory-debited receipt. */
export function applyRecordedProjectPickup(
  state: VillageState,
  eventId: string,
  projectId: string,
  requirementId: string,
  revision: number,
  submissionId: string,
) {
  const event = physicalVenueEvents(state).find((item) => item.id === eventId),
    receipt = event?.actionReceipt;
  const project = state.projects.find((item) => item.id === projectId),
    flow = project?.lifecycle;
  const requirement = flow?.requirements.find((item) => item.id === requirementId && item.needed);
  if (
    !event ||
    !project ||
    !flow ||
    !requirement ||
    requirement.carriedAt ||
    flow.phase !== "materials" ||
    pickupRevision(state, project.id) !== revision ||
    !receipt?.happened ||
    receipt.submissionId !== submissionId ||
    receipt.transferTo !== "player" ||
    receipt.itemTransfer?.recipientId !== "player" ||
    receipt.removeItem !== receipt.itemTransfer.itemName ||
    !receipt.removeItem ||
    !Number.isFinite(Date.parse(event.at)) ||
    state.projectSourceClaims.some((claim) => claim.sourceId === event.id)
  )
    return false;
  {
    const source = flow.sources.find((item) => item.requirementId === requirementId);
    const task = state.progressTasks.find(
      (item) => item.definition.owner.kind === "project" && item.definition.owner.id === project.id,
    );
    // Selected finite physical stock is already debited by Act. No second debit or invented supplier handoff.
    if (
      !source ||
      !task ||
      task.definition.phases[task.phaseIndex]?.id !== "materials" ||
      !task.receipts.some(
        (receipt) =>
          receipt.requirementId === `source:${requirementId}` && receipt.evidence.sourceId === source.evidenceId,
      ) ||
      source.kind !== "existing-item" ||
      source.acquiredAt ||
      source.venueId !== event.venueId ||
      (source.zoneId && source.zoneId !== event.zoneId) ||
      source.itemName !== receipt.removeItem ||
      !Number.isFinite(Date.parse(source.at)) ||
      Date.parse(event.at) < Date.parse(source.at) ||
      !flow.recordedItems.some(
        (item) =>
          item.venueId === source.venueId &&
          item.itemName === source.itemName &&
          (!source.zoneId || item.zoneId === source.zoneId),
      )
    )
      return false;
    source.acquiredAt = event.at;
    requirement.carriedAt = event.at;
    recordProjectProgress(state, project, `acquired:${requirementId}`, {
      id: `pickup:${event.id}`,
      kind: "project-handoff",
      at: event.at,
      sourceId: event.id,
      lineId: event.id,
      speakerId: "player",
      venueId: event.venueId,
      zoneId: event.zoneId,
      excerpt: `Verified pickup of ${source.itemName}`,
    });
  }
  state.projectSourceClaims.push({ key: `acquired-transfer:${event.id}`, projectId, sourceId: event.id, submissionId });
  flow.evidenceIds = [...new Set([...flow.evidenceIds, event.id])];
  project.updatedAt = event.at;
  return true;
}

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
  const detail = project.lifecycle?.change?.detail ?? project.venueDraft?.description ?? "";
  if (projectReferenceWords(detail).filter((word) => words.has(word)).length >= 2) return true;
  if (
    project.lifecycle?.phase === "requirements" &&
    project.lifecycle.builderId === actor &&
    (/^what\b[^?]*\b(?:need|require|materials|requirements)\b/iu.test(message.trim()) ||
      /\b(?:checklist|requirements|structure|equipment|finish)\b/iu.test(speech))
  )
    return true;
  const prior = scene.submissions.at(-1);
  const contexts = (prior?.projectContexts ?? []).filter(
    (context) => context.revision === revision && context.phase === project.lifecycle?.phase,
  );
  const bound = contexts.some((context) => context.projectId === project.id);
  const continuation =
    !message.trim() ||
    /^(?:and |what (?:else|about|materials|requirements)|anything else|go on|tell me more|continue|yes|no|okay|sure)|\b(?:build|construct|renovate|approve|checklist|requirements|structure|equipment|finish(?:ing)?)\b/iu.test(
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
    const kind = facts.kind as ProjectSpeechProposal["kind"];
    if (!["approve", "commit", "requirements"].includes(result.outcome)) return [];
    const conflicting = batch.results.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        ["approve", "commit"].includes(other.outcome) &&
        asRecord(batch.checks[otherIndex].facts).actorId === facts.actorId &&
        asRecord(batch.checks[otherIndex].facts).kind === kind,
    );
    if (conflicting) {
      batch.traces[index].applied = "Unresolved: multiple Project targets require clarification";
      return [];
    }
    const details = asRecord(result.details);
    const allowed = check.evidence.filter(
      (line) =>
        line.current || (Array.isArray(facts.requirementCitationIds) && facts.requirementCitationIds.includes(line.id)),
    );
    const citations =
      kind === "requirements" && Array.isArray(details.citations)
        ? details.citations.slice(0, 12).map((value) => {
            const row = asRecord(value),
              line = allowed.find((item) => item.id === row.evidenceId);
            return { lineId: line?.id ?? "", quote: asTrimmedString(row.quote) };
          })
        : check.evidence
            .filter(
              (line) =>
                line.current &&
                line.speakerId === facts.actorId &&
                (result.source === "decisions" || result.evidenceIds.includes(line.id)),
            )
            .map((line) => ({ lineId: line.id, quote: line.content }));
    if (
      !citations.length ||
      !citations[0].lineId.startsWith("draft:") ||
      citations.some((citation) => {
        const line = allowed.find((item) => item.id === citation.lineId);
        return !line || line.speakerId !== facts.actorId || !citation.quote || !line.content.includes(citation.quote);
      })
    ) {
      batch.traces[index].applied = "Rejected: Project interpretation has no exact current speaker evidence";
      return [];
    }
    const checklist =
      kind === "requirements" && Array.isArray(details.checklist)
        ? details.checklist.map((value) => {
            const row = asRecord(value);
            return {
              category: row.category as "structure" | "equipment" | "finish",
              title: asTrimmedString(row.title),
              needed: row.needed as boolean,
              citation: Number(row.citation),
            };
          })
        : [];
    if (
      kind === "requirements" &&
      (checklist.length !== 3 ||
        new Set(checklist.map((item) => item.category)).size !== 3 ||
        checklist.some(
          (item) =>
            !["structure", "equipment", "finish"].includes(item.category) ||
            typeof item.needed !== "boolean" ||
            !item.title ||
            item.title.length > 100 ||
            !Number.isInteger(item.citation) ||
            !citations[item.citation],
        ))
    ) {
      batch.traces[index].applied = "Unresolved: incomplete or uncited checklist";
      return [];
    }
    batch.traces[index].applied = "Project proposal awaiting saved-state validation";
    return [
      {
        version: 1 as const,
        projectId: String(facts.projectId),
        revision: Number(facts.revision),
        phase: String(facts.phase),
        kind,
        speakerId: String(facts.actorId),
        citations: citations.map((item) => ({
          ...item,
          lineId: item.lineId.startsWith("draft:") ? item.lineId.slice(6) : item.lineId,
        })),
        checklist,
        contextual: { version: 1 as const, source: result.source, checkId: batch.traces[index].id },
      },
    ];
  });
}
