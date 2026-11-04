import type { InterpretationCheck, InterpretationResult } from "../models/interpretation-check-model.js";
import { asRecord } from "./coerce.js";
import { fingerprint } from "./interpretation-rules.js";

export type DecisionCandidate = {
  outcome: string;
  question: string;
  evidenceIds: string[];
  proofKind?: "conversation" | "physical";
};

/** Questions survive Engine state trimming: each carries the entire admitted record.
 * Never truncate a goal, condition, target, request, or quote to make a Decision fit.
 */
export function decisionCandidates(check: InterpretationCheck): DecisionCandidate[] | null {
  if (check.decisionEligible === false || !check.outcomes.length) return null;
  const facts = asRecord(check.facts);
  const evidence = check.evidence.filter((line) => line.kind !== "claim");
  if (
    new Set(evidence.map((line) => line.id)).size !== evidence.length ||
    check.essentialEvidenceIds?.some((id) => !evidence.some((line) => line.id === id))
  )
    return null;
  let proofKind: DecisionCandidate["proofKind"];
  let target: unknown;
  let supporting = evidence.filter((line) => line.current && line.content.trim());
  if (check.domain === "attention" && facts.schema === 5) {
    if (
      check.decisionEligible !== true ||
      !Array.isArray(facts.spaces) ||
      !Array.isArray(facts.localRecipients) ||
      !check.outcomes.every((outcome) =>
        ["local", "ordinary-local", "ordinary-outward", "call", "shout", "exceptional", "clarify"].includes(outcome.id),
      )
    )
      return null;
    supporting = supporting.filter((line) => line.id === "player-input" && line.speakerId === "player");
    target = {
      schema: 5,
      origin: facts.origin,
      spaces: facts.spaces,
      conversation: facts.conversationTarget,
      contact: facts.contact,
      local: facts.localRecipients,
    };
  } else if (check.domain === "attention") {
    if (
      facts.decisionContextComplete !== true ||
      !Array.isArray(facts.destinations) ||
      !Array.isArray(facts.openRoutes) ||
      !Array.isArray(facts.localRecipients)
    )
      return null;
    const destinations = facts.destinations.map(asRecord);
    const outcomes = new Set([
      "local",
      "clarify",
      "broadcast",
      ...destinations.flatMap((zone) => [`speech:${zone.id}`, `sound:${zone.id}`]),
    ]);
    if (!check.outcomes.every((outcome) => outcomes.has(outcome.id))) return null;
    supporting = supporting.filter((line) => line.id === "player-input" && line.speakerId === "player");
    target = {
      from: facts.currentZoneId,
      to: facts.destinations,
      open: facts.openRoutes,
      local: facts.localRecipients,
      ...(facts.sourceReferences === true ? { speakers: facts.openSpeakers } : {}),
    };
  } else {
    supporting = supporting.filter((line) => line.speakerId === facts.actorId && line.kind !== "narration");
    if (check.domain === "project") {
      if (!check.outcomes.every((item) => ["approve", "commit"].includes(item.id))) return null;
      target = { actor: facts.actorId, project: facts.title, change: facts.description };
    } else if (check.domain === "room") {
      if (
        !check.outcomes.every((item) =>
          ["invite-now", "invite-later", "refuse", "dismiss", "ban-zone", "ban-venue", "invite-outside-hours"].includes(
            item.id,
          ),
        )
      )
        return null;
      if (!check.outcomes.some((item) => ["invite-now", "invite-later", "refuse", "dismiss"].includes(item.id)))
        return null;
      target = {
        actor: facts.actorId,
        recipient: facts.playerName ?? "player",
        others: facts.possibleRecipients ?? [],
        venue: facts.venueName,
        zone: facts.zoneName,
        ...(!facts.venueName || !facts.zoneName ? { context: check.question } : {}),
      };
    } else return null;
  }
  if (supporting.length !== 1) return null;
  if (
    check.domain === "room" &&
    evidence.some((line) =>
      /\b(?:ban|banned|always|forever|permanent|opening hours|outside hours|after closing)\b/iu.test(line.content),
    )
  )
    return null;
  // Uncertain/quoted/conditional speech is a routing signal, never a denial.
  // System can distinguish a real condition from reluctance or an incidental caution.
  if (
    supporting.some(
      (line) =>
        line.kind !== "receipt" &&
        (/["“”]|\b(?:if|unless|maybe|perhaps|might|joking|quoted|promise|plan to|going to|said that)\b/iu.test(
          line.content,
        ) ||
          (check.domain !== "attention" && /^(?:hello|hi|hey|thanks|thank you)[.!\s]*$/iu.test(line.content)) ||
          (!["room", "attention"].includes(check.domain) &&
            /^(?:no|nope|not yet)\b|\b(?:refuse|cannot|can't|won't)\b/iu.test(line.content))),
    )
  )
    return null;
  // All admitted evidence is retained, including preceding requests and competing statements.
  const record = JSON.stringify({
    target,
    record: evidence.map((line) => ({
      who: line.name,
      actor: line.speakerId,
      when: line.current ? "now" : "history",
      kind: line.kind ?? "speech",
      text: line.content,
    })),
  });
  const candidates = check.outcomes.map((outcome) => ({
    outcome: outcome.id,
    question: `${record}\nDoes current evidence establish: ${
      check.domain === "wish"
        ? outcome.id === "fulfilled"
          ? "Every Wish condition fulfilled, not a promise, attempt, claim or thanks?"
          : "A meaningful part but not every Wish condition fulfilled, not a promise, attempt, claim or thanks?"
        : check.domain === "attention" && facts.schema !== 5
          ? attentionStatement(outcome.id)
          : outcome.statement
    }`,
    evidenceIds: supporting.map((line) => line.id),
    ...(proofKind ? { proofKind } : {}),
  }));
  return candidates.every((candidate) => candidate.question.length <= 500) ? candidates : null;
}

/** Compact predicates leave room for the complete recipient/evidence packet. */
function attentionStatement(outcome: string) {
  if (outcome === "local")
    return "No current cross-Zone attention/sound; local talk, history, hypothetical, quoted or negated actions stay local?";
  if (outcome === "clarify") return "Current directed attention needs clarification of destination or audible content?";
  if (outcome === "broadcast")
    return "Whole input attempts one general loud sound to all adjacent Zones, without separate speech/private material?";
  const [kind, ...zone] = outcome.split(":");
  return kind === "speech"
    ? `Whole input is current speech deliberately across boundary ${zone.join(":")}, without private/local-only material?`
    : `Whole input attempts one sound toward boundary ${zone.join(":")}, without separate speech/private material?`;
}

export function boundDecisionResult(check: InterpretationCheck, candidate: DecisionCandidate): InterpretationResult {
  return {
    outcome: candidate.outcome,
    source: "decisions",
    evidenceIds: candidate.evidenceIds,
    reason: "",
    details: {
      ...(candidate.proofKind ? { proofKind: candidate.proofKind } : {}),
      decisionEvidence: { version: 1, fingerprint: fingerprint([check]) },
    },
  };
}

/** Old or changed Decision checkpoints cannot bypass current evidence admission. */
export function validDecisionEvidence(check: InterpretationCheck, result: InterpretationResult): boolean {
  if (result.source !== "decisions") return true;
  // Policy changes and opening-hour exceptions require System even if a Decision scores them positively.
  if (check.domain === "room" && !["invite-now", "invite-later", "refuse", "dismiss"].includes(result.outcome))
    return false;
  const binding = asRecord(asRecord(result.details).decisionEvidence);
  if (binding.version !== 1 || binding.fingerprint !== fingerprint([check])) return false;
  const candidate = decisionCandidates(check)?.find((item) => item.outcome === result.outcome);
  return (
    !!candidate &&
    JSON.stringify(candidate.evidenceIds) === JSON.stringify(result.evidenceIds) &&
    candidate.proofKind === asRecord(result.details).proofKind
  );
}
