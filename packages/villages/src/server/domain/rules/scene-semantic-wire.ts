import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import type { semanticEvidence } from "./semantic-contract.js";

/** Expand only an explicitly admitted compact wire; all existing authority checks still run. */
export function expandSceneActionReview(raw: Record<string, unknown>, evidence: ReturnType<typeof semanticEvidence>) {
  const review = asRecord(raw.residentActionReview);
  if (review.version !== 2) return raw;
  const fail = () => {
    throw badGateway("Resident action review is incomplete or inconsistent. Your draft is preserved.");
  };
  const index = (value: unknown): value is number =>
    typeof value === "number" && Number.isInteger(value) && value >= 0 && value < evidence.length;
  if (
    !Array.isArray(review.reviewed) ||
    review.reviewed.length > 24 ||
    !review.reviewed.every(index) ||
    new Set(review.reviewed).size !== review.reviewed.length ||
    !Array.isArray(review.coverage) ||
    review.coverage.length > review.reviewed.length ||
    !Array.isArray(review.additionalActions) ||
    review.additionalActions.length > 16 ||
    !Array.isArray(review.decisions)
  )
    return fail();
  const reviewed = review.reviewed,
    coverage = review.coverage.map(asRecord);
  if (
    new Set(coverage.map((row) => row.segment)).size !== coverage.length ||
    coverage.some(
      (row) =>
        !index(row.segment) ||
        !reviewed.includes(row.segment) ||
        !["actions", "unresolved"].includes(String(row.status)),
    )
  )
    return fail();
  const additionalActions = review.additionalActions.map((value) => {
    const row = asRecord(value),
      source = asRecord(row.source);
    if (!index(source.segment) || Object.keys(source).some((key) => key !== "segment")) return fail();
    const line = evidence[source.segment]!;
    return { ...row, source: { speakerId: line.speakerId, quote: line.content } };
  });
  return {
    ...raw,
    residentActionReview: {
      version: 1,
      additionalActions,
      decisions: review.decisions,
      coverage: reviewed.map(
        (segment) =>
          coverage.find((row) => row.segment === segment) ?? {
            segment,
            status: "none",
            actionIds: [],
            reason: "Reviewed: no player-access action.",
          },
      ),
    },
  };
}
