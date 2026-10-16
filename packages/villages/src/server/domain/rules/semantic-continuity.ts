import type { VenueScene, VenueSubmission } from "../models/scene-model.js";
import type { ExchangeDomain } from "../models/exchange-model.js";
import type { VillageState } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { conflict } from "./errors.js";

export function semanticAuthorityDomain(turn: VenueSubmission, domain: ExchangeDomain): boolean {
  const permissions = asRecord(turn.liveProposals?.relationshipChanges).permissions;
  return domain === "projects"
    ? !!turn.semanticProvenance?.authority?.projects || !!turn.projectSpeech?.length || !!turn.action?.happened
    : domain === "relationships"
      ? !!turn.semanticProvenance?.authority?.standing || (Array.isArray(permissions) && permissions.length > 0)
      : false;
}

export const semanticContinuationKey = (sceneId: string, submissionId: string) =>
  "semantic-continue:" + JSON.stringify([sceneId, submissionId]);
export const semanticContinued = (state: VillageState, sceneId: string, submissionId: string, domain: ExchangeDomain) =>
  state.semanticContinuations?.[semanticContinuationKey(sceneId, submissionId)]?.includes(domain) === true;

export function semanticBlocker(scene: VenueScene): string | null {
  for (const turn of scene.submissions) {
    if (turn.semanticProvenance?.version !== 2) continue;
    if (turn.semanticReady !== true) return "The saved action needs recovery.";
    for (const [domain, result] of Object.entries(turn.processing?.domains ?? {}))
      if (
        ["pending", "failed"].includes(result.status) &&
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
