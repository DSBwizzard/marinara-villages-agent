import type { InterpretationCheck, InterpretationEvidence } from "../models/interpretation-check-model.js";

export const INTERPRETATION_HISTORY_LINES = 12;

export const INTERPRETATION_HISTORY_CHARACTERS = 8_000;

export const INTERPRETATION_PAYLOAD_CHARACTERS = 24_000;

export function boundInterpretationEvidence(check: InterpretationCheck): InterpretationCheck {
  if (!["room", "project"].includes(check.domain)) return check;
  const facts = check.facts as { requirementCitationIds?: unknown };
  const pinned = new Set(check.essentialEvidenceIds ?? []);
  if (Array.isArray(facts?.requirementCitationIds))
    for (const id of facts.requirementCitationIds) if (typeof id === "string") pinned.add(id);
  for (const line of check.evidence) if (line.current || line.id === "player-input") pinned.add(line.id);
  const history = check.evidence.filter((line) => !line.current && line.id !== "player-input");
  // The preceding player request is essential for contextual short answers.
  const preceding = history.findLast((line) => line.speakerId === "player");
  if (preceding) pinned.add(preceding.id);
  const recent = new Set<string>();
  let characters = 0;
  for (const line of history.slice(-INTERPRETATION_HISTORY_LINES).reverse()) {
    const size = JSON.stringify(line).length + 1;
    if (characters + size > INTERPRETATION_HISTORY_CHARACTERS) continue;
    characters += size;
    recent.add(line.id);
  }
  return { ...check, evidence: check.evidence.filter((line) => pinned.has(line.id) || recent.has(line.id)) };
}

export function interpretationPayload(checks: InterpretationCheck[]) {
  const pool = new Map<string, InterpretationEvidence>();
  let conflict = false;
  let missingEssential = false;
  const rows = checks.map((check) => {
    const { evidence, essentialEvidenceIds: _pins, ...rest } = boundInterpretationEvidence(check);
    const allowed = new Set(evidence.map((line) => line.id));
    const citations = (check.facts as { requirementCitationIds?: string[] } | null)?.requirementCitationIds ?? [];
    if ([...(check.essentialEvidenceIds ?? []), ...citations].some((id) => !allowed.has(id))) missingEssential = true;
    for (const line of evidence) {
      const prior = pool.get(line.id);
      if (
        prior &&
        (prior.speakerId !== line.speakerId ||
          prior.content !== line.content ||
          !!prior.current !== !!line.current ||
          prior.kind !== line.kind)
      )
        conflict = true;
      else if (!prior) pool.set(line.id, line);
    }
    return { ...rest, evidenceIds: evidence.map((line) => line.id) };
  });
  const payload = {
    checks: rows,
    evidence: [...pool.values()],
    extraction:
      "Use only each check's evidenceIds. Other checks' evidence is not witnessed by this actor. Follow systemInstruction and preserve exact evidence references and wording.",
  };
  const serialized = JSON.stringify(payload);
  return {
    payload,
    serialized,
    fits:
      !conflict && !missingEssential && serialized.length <= INTERPRETATION_PAYLOAD_CHARACTERS && checks.length <= 4,
  };
}
