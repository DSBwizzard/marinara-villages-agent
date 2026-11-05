import type { VenueScene } from "../../domain/models/scene-model.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { privateRejectedText } from "../../domain/rules/rejected-response.js";
import type { DomainProcessing } from "../../domain/models/exchange-model.js";
import { workFailureSummary } from "../../domain/rules/work-failure.js";
import { memoryHash } from "../../domain/rules/memory-integrity.js";

export const sceneChangeDiagnosticId = (submissionId: string, domain: string, result: DomainProcessing) =>
  `${submissionId}:${domain}:${memoryHash(result)}`;

/** Match fixed validation vocabulary without exposing private evidence or identities. */
export function sceneChangeError(result: DomainProcessing, domain: string): string {
  if (result.failure) return workFailureSummary(result.failure);
  const reasons = (result.rejectedProposals ?? []).map((row) => row.reason).join("\n") || result.reason;
  const rules: [RegExp, string][] = [
    [/unknown learner/iu, "The AI assigned a memory to an unknown resident."],
    [/missing learners/iu, "The AI didn’t say who should remember this."],
    [
      /unwitnessed source quotation|not witnessed|no witnessed evidence/iu,
      domain === "memories"
        ? "The AI based a memory on something a resident didn’t see or hear."
        : "The AI based an update on something a resident didn’t see or hear.",
    ],
    [
      /unsupplied source line|invalid support|no new exchange evidence/iu,
      "The AI cited missing or unrelated conversation.",
    ],
    [/screening context is missing/iu, "The game couldn’t find the information needed to check a memory."],
    [/stale target|stale collection/iu, "The memory changed before the game could update it."],
    [/forgotten target/iu, "The AI tried to update a forgotten memory."],
    [/protected source replay/iu, "The AI tried to change a protected memory."],
    [/identity changed|another Village/iu, "The update belongs to a different Village."],
    [/Continued without this failed update/iu, "You skipped this update."],
  ];
  return (
    rules.find(([pattern]) => pattern.test(reasons))?.[1] ??
    (domain === "memories" ? "The game rejected a memory update." : `The game couldn’t apply the ${domain} update.`)
  );
}

/** Explicit owner diagnostics. Never return prompts, checkpoints or connection configuration. */
export function sceneErrorDetails(scene: VenueScene) {
  let remainingContext = 12_000;
  const context = (value: unknown) => {
    if (value === undefined) return undefined;
    const text = JSON.stringify(value);
    const limit = Math.min(3000, remainingContext);
    remainingContext -= Math.min(limit, text.length);
    return text.length <= limit ? value : { excerpt: text.slice(0, limit), omittedCharacters: text.length - limit };
  };
  const errors: { id: string; details: string }[] = [];
  const add = (id: string, details: unknown) =>
    errors.push({ id, details: privateRejectedText(JSON.stringify(details, null, 2)) });
  const operation = scene.operation;
  if (operation && (operation.error || operation.status === "interrupted")) {
    add(`operation:${operation.id}:${operation.attemptId}`, {
      operation: {
        id: operation.id,
        attemptId: operation.attemptId,
        kind: operation.kind,
        stage: operation.stage,
        status: operation.status,
        startedAt: operation.startedAt,
        sceneRevision: operation.sceneRevision,
        error: operation.error,
        failure: operation.failure,
      },
      input: context({
        message: operation.input.message,
        mode: operation.input.mode,
        zoneId: operation.input.zoneId,
        targetId: operation.input.targetId,
        contact: operation.input.contact,
        attentionChoice: operation.input.attentionChoice,
      }),
    });
  }
  const changes = scene.submissions
    .flatMap((turn) =>
      Object.entries(turn.processing?.domains ?? {})
        .filter(([, result]) => result.status === "failed" || result.status === "rejected")
        .map(([domain, result]) => ({ turn, domain, result })),
    )
    .sort(
      (a, b) =>
        Number(a.result.status === "rejected") - Number(b.result.status === "rejected") ||
        (b.turn.at ?? "").localeCompare(a.turn.at ?? ""),
    );
  for (const { turn, domain, result } of changes.slice(0, 50)) {
    const rejected = result.rejectedProposals ?? [];
    const savedProposals =
      domain === "memories"
        ? turn.liveProposals?.memoryChanges
        : domain === "relationships"
          ? turn.liveProposals?.relationshipChanges
          : domain === "wishes"
            ? turn.wishProposals
            : turn.projectSpeech;
    const failed = turn.effectFailures?.[domain]?.proposal;
    const key = {
      memories: "memoryChanges",
      relationships: "relationshipChanges",
      wishes: "wishChanges",
      projects: "projectSpeech",
    }[domain];
    const proposals =
      failed === undefined
        ? savedProposals
        : key && Object.hasOwn(asRecord(failed), key)
          ? asRecord(failed)[key]
          : failed;
    const field =
      result.failure?.stage === "metadata"
        ? /(memories|wishes|proposals|changes|permissions|disclosures)\[(\d{1,2})\]/u.exec(result.failure.message)
        : null;
    const rows = rejected.length ? rejected : field ? [{ kind: field[1]!, index: Number(field[2]) }] : [];
    const selected = rows.length
      ? rows.map((row) => {
          const collection = Array.isArray(proposals) ? proposals : asRecord(proposals)[row.kind];
          return {
            kind: row.kind,
            index: row.index,
            value: Array.isArray(collection) ? collection[row.index] : undefined,
          };
        })
      : proposals;
    const sources = new Set<string>();
    const cite = (ref: unknown) => {
      const id =
        ref === "player"
          ? turn.liveProposals?.playerLineId
          : typeof ref === "number"
            ? turn.liveProposals?.replyLineIds[ref]
            : ref;
      if (typeof id === "string") sources.add(id);
    };
    const citations = (value: unknown) => {
      if (Array.isArray(value)) value.forEach(citations);
      else if (value && typeof value === "object")
        for (const [key, field] of Object.entries(value)) {
          if (key === "lineId" || key === "segment") cite(field);
          else if ((key === "evidence" || key === "lineIds") && Array.isArray(field))
            field.forEach((ref) => (ref && typeof ref === "object" ? citations(ref) : cite(ref)));
          else citations(field);
        }
    };
    const selectedProposal = selected;
    citations(selectedProposal);
    if (!sources.size && !field) result.evidenceIds.forEach(cite);
    if (!sources.size && !field) (turn.processing?.lineIds ?? []).forEach(cite);
    add(sceneChangeDiagnosticId(turn.id, domain, result), {
      submissionId: turn.id,
      domain,
      at: turn.at,
      status: result.status,
      reason: result.reason,
      failure: result.failure,
      rejectedProposals: result.rejectedProposals,
      attempts: result.attempts,
      updatedAt: result.updatedAt,
      response: result.failure?.responseDiagnostics ?? turn.liveProposals?.responseDiagnostics,
      input: context(turn.message),
      proposal: context(selectedProposal),
      evidence: context(
        scene.lines
          .filter((line) => sources.has(line.id))
          .map((line) => ({
            id: line.id,
            speakerId: line.speakerId,
            text: line.content,
            heardBy: line.heardBy,
          })),
      ),
    });
  }
  return { errors, omittedErrors: Math.max(0, changes.length - 50) };
}
