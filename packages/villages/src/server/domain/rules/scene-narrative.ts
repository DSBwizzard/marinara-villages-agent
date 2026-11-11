import { foundingReadyForPlay } from "./founding-tasks.js";
import type { NarrativeAdmission } from "../models/narrative-model.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { arrangementActivityAt, preferredActivityLane } from "./activity-arbitration.js";
import { backgroundRevision } from "./background-revision.js";
import { activityDate, eventAttemptAvailable, reserveEventAttempt } from "./event-attempts.js";
import { conflict } from "./errors.js";
import { admitNarrative, assertNarrativeAdmission } from "./narrative-development.js";
import { sceneContinuityView } from "./scene-continuity.js";

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
function localFacts(state: VillageState, venueId: string, zoneId: string) {
  const relevant = (row: { venueId: string; zoneId: string }) => row.venueId === venueId && row.zoneId === zoneId;
  return [
    state.narrative?.conditions.filter(relevant),
    state.narrative?.situations.filter((row) => row.targets.some(relevant)),
  ];
}
/** A Scene may use the independently selected world opportunity, never choose its own preferred target. */
export function offerSceneNarrative(
  state: VillageState,
  scene: VenueScene,
  sourceId: string,
  now: Date,
): NarrativeAdmission | null {
  if (
    !scene.continuity ||
    scene.villageSeed !== state.seed ||
    !["opening", "active"].includes(scene.status) ||
    !eventAttemptAvailable(state, activityDate(state, now), now.getTime()) ||
    preferredActivityLane(state) !== "world" ||
    arrangementActivityAt(state, now) !== null ||
    !foundingReadyForPlay(state)
  )
    return null;
  const selected = admitNarrative(state, now.toISOString(), sourceId);
  if (!selected || selected.targets[0]!.venueId !== scene.placeId || selected.targets[0]!.zoneId !== scene.zoneId)
    return null;
  const captured = sceneContinuityView(state, scene);
  if (!same(localFacts(state, scene.placeId, scene.zoneId!), localFacts(captured, scene.placeId, scene.zoneId!)))
    return null;
  const grant = admitNarrative(
    {
      ...captured,
      eventAttempts: state.eventAttempts,
      narrativeConsequence: state.narrativeConsequence,
      narrative: captured.narrative && { ...captured.narrative, claims: state.narrative?.claims },
    },
    now.toISOString(),
    sourceId,
    "scene",
    { venueId: scene.placeId, zoneId: scene.zoneId! },
  );
  if (!grant) return null;
  try {
    assertNarrativeAdmission(state, grant);
  } catch {
    return null;
  }
  return grant;
}
/** Shared root reservation closes races with both automatic lanes; a saved claim closes the checkpoint-write gap. */
export function reserveSceneNarrative(
  state: VillageState,
  scene: Pick<VenueScene, "id" | "placeId" | "zoneId" | "villageSeed" | "status">,
  grant: NarrativeAdmission,
  now: Date,
  operationId: string,
): boolean {
  const claim = state.narrative?.claims?.find((row) => row.id === grant.id);
  if (claim) {
    if (
      claim.sceneId !== scene.id ||
      claim.submissionId !== operationId ||
      claim.fingerprint !== backgroundRevision(grant)
    )
      throw conflict("The saved Scene introduction belongs to another source.");
    return true;
  }
  if (state.narrative?.receipts.some((row) => row.id === grant.id))
    throw conflict("The Scene introduction was already retired.");
  if (
    scene.villageSeed !== state.seed ||
    !["opening", "active"].includes(scene.status) ||
    !eventAttemptAvailable(state, activityDate(state, now), now.getTime()) ||
    preferredActivityLane(state) !== "world" ||
    arrangementActivityAt(state, now) !== null ||
    !foundingReadyForPlay(state) ||
    grant.source !== "scene"
  )
    return false;
  const selected = admitNarrative(state, now.toISOString(), grant.id),
    fresh = admitNarrative(state, grant.at, grant.id, "scene", { venueId: scene.placeId, zoneId: scene.zoneId! });
  if (
    !selected ||
    selected.targets[0]?.venueId !== scene.placeId ||
    selected.targets[0]?.zoneId !== scene.zoneId ||
    !fresh ||
    !same(fresh, grant)
  )
    return false;
  reserveEventAttempt(state, grant.id, activityDate(state, now), now.getTime(), undefined, "scene");
  state.narrative!.claims ??= [];
  state.narrative!.claims.push({
    id: grant.id,
    attemptId: operationId,
    sceneId: scene.id,
    submissionId: operationId,
    venueId: scene.placeId,
    zoneId: scene.zoneId!,
    fingerprint: backgroundRevision(grant),
  });
  return true;
}
