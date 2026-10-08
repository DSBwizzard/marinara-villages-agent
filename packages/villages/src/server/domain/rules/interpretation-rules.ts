import type { InterpretationCheck, InterpretationResult } from "../models/interpretation-check-model.js";

import { asRecord, asTrimmedString } from "./coerce.js";

import type { WorkFailure } from "./work-failure.js";

import { createHash } from "node:crypto";

export const fingerprint = (checks: InterpretationCheck[]) =>
  createHash("sha256").update(JSON.stringify(checks)).digest("hex");

export function readSystemInterpretations(
  value: unknown,
  checks: InterpretationCheck[],
  strictEvidence = true,
): InterpretationResult[] {
  const rows = asRecord(value).results;
  return checks.map((check) => {
    const matches = Array.isArray(rows) ? rows.filter((row) => asRecord(row).id === check.id) : [];
    const row = asRecord(matches.length === 1 ? matches[0] : null);
    const outcome = asTrimmedString(row.outcome);
    const rawIds = row.evidenceIds;
    const evidenceIds = Array.isArray(rawIds)
      ? [...new Set(rawIds.filter((id): id is string => typeof id === "string"))]
      : [];
    const validEvidence =
      (!strictEvidence || (Array.isArray(rawIds) && rawIds.every((id) => typeof id === "string"))) &&
      evidenceIds.every((id) => check.evidence.some((line) => line.id === id));
    const known = ["none", "unresolved", ...check.outcomes.map((entry) => entry.id)].includes(outcome);
    const currentEvidence = evidenceIds.some((id) => check.evidence.some((line) => line.id === id && line.current));
    const cause: WorkFailure["cause"] | undefined =
      !value || !Array.isArray(rows)
        ? "invalid_json"
        : matches.length === 0
          ? "missing_result"
          : matches.length > 1
            ? "duplicate_result"
            : !known
              ? "unsupported_outcome"
              : !validEvidence || (!["none", "unresolved"].includes(outcome) && !currentEvidence)
                ? "invalid_citation"
                : undefined;
    return {
      outcome: cause ? "unresolved" : outcome,
      source: "system",
      evidenceIds: cause ? [] : evidenceIds,
      reason: cause
        ? "Invalid check output: " + cause + "; explicit retry required"
        : asTrimmedString(row.reason).slice(0, 240),
      ...(cause
        ? {
            failure: {
              cause,
              stage: "interpretation",
              checkIds: [check.id],
              message: "Invalid check output: " + cause + "; explicit retry required",
            },
          }
        : {}),
      ...(row.details && typeof row.details === "object" ? { details: row.details } : {}),
    };
  });
}

export function compactWishChecks(checks: InterpretationCheck[]) {
  const evidenceAliases = new Map<string, string>();
  for (const check of checks)
    for (const line of check.evidence)
      if (!evidenceAliases.has(line.id)) evidenceAliases.set(line.id, "e" + evidenceAliases.size);
  const wireChecks = checks.map((check, index) => ({
    ...check,
    id: "c" + index,
    essentialEvidenceIds: check.essentialEvidenceIds?.map((id) => evidenceAliases.get(id) ?? "missing:" + id),
    evidence: check.evidence.map((line) => ({ ...line, id: evidenceAliases.get(line.id)! })),
    facts: {
      ...asRecord(check.facts),
      matchingReceiptIds: ((asRecord(check.facts).matchingReceiptIds ?? []) as string[]).map((id) =>
        evidenceAliases.get("receipt:" + id),
      ),
    },
  }));
  const decode = (value: unknown) => {
    const inverse = new Map([...evidenceAliases].map(([id, alias]) => [alias, id]));
    const rows = asRecord(value).results;
    return {
      results: Array.isArray(rows)
        ? rows.map((raw) => {
            const row = asRecord(raw);
            const index = wireChecks.findIndex((check) => check.id === row.id);
            return {
              ...row,
              id: index < 0 ? undefined : checks[index].id,
              evidenceIds: Array.isArray(row.evidenceIds)
                ? row.evidenceIds.map((id) => (typeof id === "string" ? (inverse.get(id) ?? null) : id))
                : row.evidenceIds,
            };
          })
        : rows,
    };
  };
  const sample = {
    results: wireChecks.map((check) => ({
      id: check.id,
      outcome: "fulfilled",
      evidenceIds: check.evidence.map((line) => line.id),
      reason: "x".repeat(160),
      details: { proofKind: "conversation" },
    })),
  };
  // The inspected custom model used 1,345–3,720 output tokens in bounded probes.
  // Reserve 3,072 for reasoning and 512 for serialization/tokenizer variance.
  // This cannot guarantee an answer: looping reasoning still stops at 4,096.
  const outputTokens = Math.min(4096, Math.max(1024, Math.ceil(JSON.stringify(sample).length / 3) + 3584));
  return { wireChecks, decode, outputTokens };
}

export function readDecisionInterpretation(
  check: InterpretationCheck,
  scores: Map<string, number>,
  threshold: number,
  index: number,
): string | null {
  const positive = check.outcomes.filter((_entry, option) => {
    const score = scores.get(`${index}:${option}`);
    return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 1 && score >= threshold;
  });
  // No is not refusal, dismissal, or proof that an event was absent. Native interpretation resolves misses.
  return positive.length === 1 &&
    check.outcomes.every((_entry, option) => {
      const score = scores.get(`${index}:${option}`);
      return typeof score === "number" && Number.isFinite(score) && score >= 0 && score <= 1;
    })
    ? positive[0].id
    : null;
}
