import type { NarrativeAdmission, NarrativeDevelopment } from "../models/narrative-model.js";
import type { VenueReplyLine, VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { backgroundRevision } from "./background-revision.js";
import { badGateway, conflict } from "./errors.js";
import { applyNarrativeDevelopment, mergeNarrativeAfter, readNarrativeDevelopment } from "./narrative-development.js";
import { resolveVenueZone } from "./venue-zones.js";
export type SceneNarrativeSource = { grant: NarrativeAdmission; development: NarrativeDevelopment | null };
/** Metadata belongs to the independent System check; the local narration is the immutable proposal. */
export function readSceneNarrativeReview(
  value: unknown,
  grant: NarrativeAdmission | null,
  lines: VenueReplyLine[],
  action: unknown,
): NarrativeDevelopment | null {
  const row = value as Record<string, any> | null;
  if (!row || !["quiet", "introduced", "unsupported"].includes(row.status))
    throw badGateway("System introduction review is incomplete. The draft is retained.");
  if (row.status === "unsupported")
    throw badGateway("The draft asserts an unsupported external development. Recover the saved reply.");
  if (row.status === "quiet") {
    if (row.development != null) throw badGateway("System introduction review is contradictory.");
    return null;
  }
  const line = Number.isInteger(row.segment) ? lines[row.segment] : undefined;
  if (
    !grant ||
    !line ||
    line.kind !== "narration" ||
    line.contactHidden ||
    line.contactReport ||
    line.attentionEvidence ||
    typeof row.quote !== "string" ||
    !row.quote.trim() ||
    !line.content.includes(row.quote) ||
    (line.zoneId && line.zoneId !== grant.targets[0]!.zoneId)
  )
    throw badGateway("The introduction lacks an admitted local narration source. The draft is retained.");
  if (action && (!Number.isInteger((action as any).segment) || (action as any).segment <= row.segment))
    throw badGateway("Physical action must follow the introduced circumstance. The draft is retained.");
  return readNarrativeDevelopment(row.development, grant);
}
/** Provisional checking uses captured facts and only the verified own claim, never later world fiction. */
export function provisionalSceneNarrative(
  captured: VillageState,
  authority: VillageState,
  source: SceneNarrativeSource,
): VillageState {
  const view = {
    ...captured,
    venues: structuredClone(captured.venues),
    narrative: structuredClone(captured.narrative),
    narrativeConsequence: authority.narrativeConsequence,
  };
  if (!source.development) return view;
  if (!view.narrative) throw conflict("The Scene has no captured environmental authority.");
  view.narrative.claims = structuredClone(authority.narrative?.claims?.filter((row) => row.id === source.grant.id));
  applyNarrativeDevelopment(view, source.grant, source.development);
  return view;
}
export function settleSceneNarrative(
  state: VillageState,
  scene: VenueScene,
  source: SceneNarrativeSource,
  rejected = false,
): void {
  const previous = state.narrative?.receipts.find((row) => row.id === source.grant.id);
  if (previous) {
    if (previous.rejected && !rejected)
      throw conflict("This Scene introduction was rejected. Its draft remains unpublished.");
    return;
  }
  const claim = state.narrative?.claims?.find((row) => row.id === source.grant.id);
  if (!claim || claim.sceneId !== scene.id || claim.fingerprint !== backgroundRevision(source.grant))
    throw conflict("The Scene introduction has no matching admission.");
  if (source.development && !rejected) applyNarrativeDevelopment(state, source.grant, source.development);
  else
    state.narrative!.receipts.push({
      id: source.grant.id,
      sourceId: source.grant.sourceId,
      source: "scene",
      at: source.grant.at,
      occurrence: rejected ? "Scene introduction retired before publication." : "No external development introduced.",
      ...(rejected ? { rejected: true } : {}),
      after: { situations: [], conditions: [] },
      physical: [],
    });
  state.narrative!.claims = state.narrative!.claims?.filter((row) => row.id !== source.grant.id);
}
/** Extend the Scene in transcript order through its own accepted after-values only. */
export function extendSceneNarrative(
  view: VillageState,
  current: VillageState,
  scene: VenueScene,
  submission: { id: string; narrativeSource?: SceneNarrativeSource },
): void {
  const source = submission.narrativeSource;
  if (!source || !view.narrative) return;
  const receipt = current.narrative?.receipts.find(
    (row) => row.id === source.grant.id && row.source === "scene" && !row.rejected,
  );
  if (!receipt || source.grant.sourceId !== "scene:" + scene.id + ":" + submission.id) return;
  mergeNarrativeAfter(view.narrative, receipt.after);
  for (const after of receipt.physical) {
    const venue = view.venues.find((row) => row.id === after.venueId),
      zone = venue && resolveVenueZone(venue, after.zoneId);
    if (zone) {
      zone.description = after.description;
      zone.state = structuredClone(after.state);
    }
  }
}
