import { villagesDocuments, VILLAGES_PACKAGE_ID } from "./package-runtime.js";
import { mutateDocument } from "./village-store.js";
import type { InterpretationBatch } from "./interpretation.js";
import type { InterpretationCheck, InterpretationEvidence } from "./interpretation.js";
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
/** IDs remain local to each check's witnesses, even though content is sent once. */
export function interpretationPayload(checks: InterpretationCheck[]) {
  const pool = new Map<string, InterpretationEvidence>();
  let conflict = false;
  const rows = checks.map((check) => {
    const { evidence, essentialEvidenceIds: _pins, ...rest } = boundInterpretationEvidence(check);
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
    fits: !conflict && serialized.length <= INTERPRETATION_PAYLOAD_CHARACTERS && checks.length <= 4,
  };
}

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
export async function contextualChecks(sceneId: string, checks: InterpretationCheck[]) {
  const row = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-interpretation-context-" + sceneId);
  const context = contextSlot.coerce(row?.data);
  return checks.map((check) => ({ ...check, essentialEvidenceIds: context.entries[contextKey(check)] ?? [] }));
}
/** Map draft references to committed transcript IDs, without retaining conversation text. */
export async function saveInterpretationContext(sceneId: string, batch: InterpretationBatch, submissionId?: string) {
  const row = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-venue-visit-" + sceneId);
  const scene = row?.data as
    { lines?: { id: string; role: string }[]; submissions?: { id?: string; replyLineIds?: string[] }[] } | undefined;
  if (!scene?.lines) return;
  const previous = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "villages-interpretation-context-" + sceneId);
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
