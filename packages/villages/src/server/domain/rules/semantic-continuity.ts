import type { VenueScene, VenueSubmission } from "../models/scene-model.js";
import type { ExchangeDomain } from "../models/exchange-model.js";
import type { VillageState } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { conflict } from "./errors.js";

export function semanticAuthorityDomain(turn: VenueSubmission, domain: ExchangeDomain): boolean {
  const social = asRecord(turn.liveProposals?.relationshipChanges);
  const permissions = social.permissions;
  const consequential =
    Array.isArray(social.changes) &&
    social.changes.some((value) => {
      const after = asRecord(asRecord(value).liveAfter);
      return !!after.connection || (Array.isArray(after.records) && after.records.length > 0);
    });
  return domain === "projects"
    ? !!turn.semanticProvenance?.authority?.projects || !!turn.projectSpeech?.length || !!turn.action?.happened
    : domain === "relationships"
      ? consequential ||
        !!turn.semanticProvenance?.authority?.social ||
        !!turn.semanticProvenance?.authority?.standing ||
        (Array.isArray(permissions) && permissions.length > 0)
      : false;
}

export const semanticContinuationKey = (sceneId: string, submissionId: string) =>
  "semantic-continue:" + JSON.stringify([sceneId, submissionId]);
export const semanticContinued = (state: VillageState, sceneId: string, submissionId: string, domain: ExchangeDomain) =>
  state.semanticContinuations?.[semanticContinuationKey(sceneId, submissionId)]?.includes(domain) === true;

export function semanticBlocker(scene: Pick<VenueScene, "submissions">): string | null {
  for (const turn of scene.submissions) {
    if (turn.semanticProvenance?.version !== 2) continue;
    if (turn.semanticReady !== true) return "The saved action needs recovery.";
    for (const [domain, result] of Object.entries(turn.processing?.domains ?? {}))
      if (
        ["pending", "failed"].includes(result.status) &&
        !(
          turn.semanticProvenance.pipelineVersion === 3 &&
          (domain === "memories" || (domain === "relationships" && !semanticAuthorityDomain(turn, "relationships")))
        ) &&
        !turn.semanticContinuedDomains?.includes(domain as ExchangeDomain)
      )
        return result.status === "pending"
          ? "Updates pending."
          : semanticAuthorityDomain(turn, domain as ExchangeDomain)
            ? "Retry the failed immediate update."
            : "Retry the failed update or Continue.";
  }
  return null;
}

export function continueSemanticDomain(turn: VenueSubmission, domain: ExchangeDomain, recoverAccepted = false): void {
  if (
    turn.semanticProvenance?.version === 2 &&
    turn.semanticReady === true &&
    turn.semanticContinuedDomains?.includes(domain)
  )
    return;
  if (
    semanticAuthorityDomain(turn, domain) ||
    !turn.processing ||
    turn.semanticProvenance?.version !== 2 ||
    turn.semanticReady !== true ||
    (!recoverAccepted && turn.processing?.domains[domain].status !== "failed")
  )
    throw conflict("Only a failed semantic update can be continued.");
  turn.semanticContinuedDomains = [...new Set([...(turn.semanticContinuedDomains ?? []), domain])];
  turn.processing!.domains[domain] = {
    ...turn.processing!.domains[domain],
    status: "rejected",
    reason: "Continued without this failed update",
  };
}

/** Only failed nonphysical Project interpretation is eligible for bounded reassessment. Storage retries stay mechanical. */
export function projectInterpretationNeedsRecovery(turn: VenueSubmission): boolean {
  const result = turn.processing?.domains.projects;
  return (
    turn.semanticProvenance?.version === 2 &&
    !turn.action?.happened &&
    turn.semanticProvenance.authority?.physical !== true &&
    !!turn.projectSpeech?.length &&
    result?.status === "failed" &&
    (result.failure?.stage === "metadata" ||
      result.failure?.stage === "project-interpretation" ||
      result.reason === "Interpreted speech cannot authorize physical Project effects.")
  );
}

/** An audited negative disposition cannot settle or suppress a physical action. Original proposals remain intact. */
export function projectMetadataRejected(turn: VenueSubmission): boolean {
  if (
    turn.action?.happened ||
    turn.semanticProvenance?.authority?.physical === true ||
    turn.processing?.domains.projects.status !== "rejected"
  )
    return false;
  return (turn.interpretationHistory ?? []).some((row) => {
    const audit = asRecord(row.proposals);
    return (
      row.domain === "projects" &&
      row.source === "Project recovery rejected" &&
      audit.submissionId === turn.id &&
      audit.sourceHash === turn.semanticProvenance?.sourceHash &&
      JSON.stringify(audit.originalProposals) === JSON.stringify(turn.projectSpeech ?? [])
    );
  });
}

export function rejectProjectMetadata(turn: VenueSubmission, reason: string, at: string): void {
  if (projectMetadataRejected(turn)) return;
  if (!projectInterpretationNeedsRecovery(turn))
    throw conflict("This Project update cannot be rejected as nonphysical metadata.");
  const rejectedProposals = (turn.projectSpeech ?? []).map((row, index) => ({ kind: row.kind, index, reason }));
  turn.interpretationHistory ||= [];
  turn.interpretationHistory.push({
    at,
    domain: "projects",
    source: "Project recovery rejected",
    proposals: {
      submissionId: turn.id,
      sourceHash: turn.semanticProvenance?.sourceHash,
      originalProposals: structuredClone(turn.projectSpeech ?? []),
      rejectedProposals,
    },
  });
  turn.processing!.domains.projects = {
    ...turn.processing!.domains.projects,
    status: "rejected",
    reason,
    rejectedProposals,
    updatedAt: at,
  };
  turn.progressProcessedAt = at;
  turn.progressError = "";
}
