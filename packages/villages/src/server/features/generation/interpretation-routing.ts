import type { InterpretationCheck } from "../../domain/models/interpretation-check-model.js";
import type { InterpretationTrace } from "../../domain/models/interpretation-model.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { writeInterpretationDiagnostics } from "./interpretation-diagnostics.js";

type Context = {
  actorIds: string[];
  projectActors?: string[];
};
type Row = {
  actorId: string;
  domain: "room" | "project";
  relevance: "irrelevant" | "potential" | "uncertain";
  targetIds: string[];
  segments: number[];
};
/** Narration proposes routing only. Missing coverage or uncertain meaning keeps the judge. */
export function routeInterpretationChecks(checks: InterpretationCheck[], raw: unknown, context: Context) {
  const knownActors = new Set(context.actorIds);
  const rows: Row[] = [];
  let malformed = !Array.isArray(raw);
  if (Array.isArray(raw))
    for (const value of raw) {
      const row = asRecord(value);
      if (
        typeof row.actorId !== "string" ||
        !knownActors.has(row.actorId) ||
        !["room", "project"].includes(String(row.domain)) ||
        !["irrelevant", "potential", "uncertain"].includes(String(row.relevance)) ||
        !Array.isArray(row.targetIds) ||
        row.targetIds.some((id) => typeof id !== "string") ||
        !Array.isArray(row.segments) ||
        row.segments.some((id) => !Number.isInteger(id) || Number(id) < 0 || Number(id) > 23)
      ) {
        malformed = true;
        continue;
      }
      rows.push(row as Row);
    }
  const skipped: { check: InterpretationCheck; reason: string }[] = [],
    selected: InterpretationCheck[] = [];
  const reasons = new Map<string, string>();
  for (const check of checks) {
    const facts = asRecord(check.facts),
      actor = String(facts.actorId);
    const matches = rows.filter((row) => row.actorId === actor && row.domain === check.domain);
    let reason = "";
    const row = matches[0];
    if (malformed || matches.length !== 1) reason = "Missing, malformed or contradictory narration routing";
    else if (row.relevance === "uncertain") reason = "Narration marked the meaning uncertain";
    const required = check.evidence
      .filter((line) => line.current && line.id.startsWith("draft:"))
      .map((line) => Number(line.id.slice(6)));
    if (
      !reason &&
      (!required.length ||
        required.some((id) => !row.segments.includes(id)) ||
        row.segments.some((id) => !required.includes(id)))
    )
      reason = "Routing did not cover every eligible current segment";
    const text = check.evidence
      .filter((line) => line.current)
      .map((line) => line.content)
      .join(" ");
    const ownSpeech = check.evidence
      .filter((line) => line.current && line.speakerId === actor)
      .map((line) => line.content)
      .join(" ");
    const request = check.evidence
      .filter((line) => line.speakerId === "player")
      .slice(-2)
      .map((line) => line.content)
      .join(" ");
    const contextualAnswer = ownSpeech.length > 0 && ownSpeech.length <= 100 && /\?/u.test(request);
    const permission =
      /\b(?:come in|come into|enter|entry|invite|invitation|visit|leave|go away|room|bedroom|private|common space|door|inside|beckon|gesture|nod|motion|wave|point|step aside)\b/iu;
    const project =
      /\b(?:build|builder|approve|approval|agree|commit|require|requirement|materials|equipment|finish|structure|construction|project|repair|repaired|fix|fixed|frame)\b/iu;
    // These are positive safety guards, never a keyword-only gate.
    if (
      !reason &&
      (check.essentialEvidenceIds?.length ||
        contextualAnswer ||
        (check.domain === "room" && permission.test(request + " " + text)) ||
        (check.domain === "project" &&
          (project.test(request + " " + text) ||
            facts.kind === "requirements" ||
            context.projectActors?.includes(actor))))
    )
      reason = "Pending context, short answer, gesture or relevant request requires verification";
    const group = checks.filter(
      (candidate) => candidate.domain === check.domain && asRecord(candidate.facts).actorId === actor,
    );
    const targets = new Set(
      group.map((candidate) => String(asRecord(candidate.facts).zoneId ?? asRecord(candidate.facts).projectId ?? "")),
    );
    if (
      !reason &&
      row.relevance === "potential" &&
      (!row.targetIds.length || row.targetIds.some((id) => !targets.has(id)))
    )
      reason = "Unknown or missing proposed target requires broad verification";
    if (!reason && row.relevance === "irrelevant" && row.targetIds.length)
      reason = "Irrelevant routing contradicts its proposed targets";
    if (reason) {
      selected.push(check);
      reasons.set(check.id, reason);
      continue;
    }
    if (row.relevance === "potential") {
      selected.push(check);
      reasons.set(check.id, "Narration selected a valid candidate");
    } else
      skipped.push({
        check,
        reason:
          row.relevance === "irrelevant"
            ? "Explicitly irrelevant narration with complete current coverage"
            : "Explicitly irrelevant narration with complete current coverage",
      });
  }
  return { checks: selected, skipped, reasons };
}
export async function recordInterpretationRouting(
  sceneId: string,
  selection: ReturnType<typeof routeInterpretationChecks>,
) {
  const traces: InterpretationTrace[] = selection.skipped.map(({ check, reason }) => ({
    id: check.id + ":routing",
    domain: check.domain,
    question: check.question,
    evidence: check.evidence,
    decisions: { status: "off" },
    system: { status: "not-requested", reason },
    result: { outcome: "none", source: "system", evidenceIds: [], reason },
    applied: "Skipped by narration routing; no interpretation request",
    startedAt: new Date().toISOString(),
  }));
  for (const check of selection.checks)
    traces.push({
      id: check.id + ":routing",
      domain: check.domain,
      question: check.question,
      evidence: check.evidence,
      decisions: { status: "off" },
      system: { status: "not-requested", reason: selection.reasons.get(check.id) },
      result: {
        outcome: "unresolved",
        source: "system",
        evidenceIds: [],
        reason: selection.reasons.get(check.id) ?? "",
      },
      applied: "Selected for verification",
      startedAt: new Date().toISOString(),
    });
  if (traces.length) await writeInterpretationDiagnostics(sceneId, traces);
}
