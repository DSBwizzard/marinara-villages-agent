import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import type { VenueLine, VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue, VillageVenueZone } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";
import { sceneRelationshipView } from "./relationship-rules.js";
import type { AttentionPlan } from "./scene-attention.js";
import { sceneAccessState, sceneLayoutVenue } from "./scene-layout.js";
import { type AccessContext, evaluateZoneAccess } from "./venue-access.js";
import { canInviteToZone, canOccupyZone, venueZones, zoneClosed } from "./venue-zones.js";

export type ContactDelivery = "voice" | "loud";
export type ContactIntent = {
  attention?: AttentionPlan;
  physicalTargetId?: string;
  kind: "knock" | "call";
  targetId: string;
  boundaryZoneId: string;
  quote: string;
  delivery?: ContactDelivery;
};
export type DoorwayContact = {
  characterId: string;
  playerZoneId: string;
  characterZoneId: string;
  delivery?: ContactDelivery;
};
export function readContactDelivery(value: unknown, message: string): ContactDelivery {
  const row = asRecord(value);
  if (row.delivery === "device") throw badRequest("Device links are not supported by Contact.");
  const citation = asTrimmedString(row.deliveryQuote) || message;
  const loud =
    /\b(?:shout|shouting|yell|yelling|holler|hollering|scream|screaming|loudly|raise\s+my\s+voice|top\s+of\s+my\s+lungs)\b/iu;
  const hypothetical =
    /\b(?:if|would|could|might|yesterday|earlier|don't|do not)\s+(?:i\s+)?(?:shout|shouted|yell|yelled|holler|scream|call|knock|use)\b/iu;
  return normalize(message).includes(normalize(citation)) && loud.test(citation) && !hypothetical.test(citation)
    ? "loud"
    : "voice";
}
export type ContactMove = {
  characterId: string;
  zoneId: string;
  quote: string;
  path: string[];
  /** Movement completes in this narration segment; absent on older saved replies. */
  segment?: number;
};
export type ContactRelay = { speakerId: string; targetId: string; quote: string; path: string[]; targetZoneId: string };
const normalize = (value: string) =>
  value.normalize("NFKC").replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim().toLowerCase();

/** Hearing connections only; entry remains governed by existing Zone permissions. */
export function contactNeighbors(venue: VillageVenue, zoneId: string, scene?: VenueScene): string[] {
  return contactNeighborIds(venueZones(sceneLayoutVenue(venue, scene)), zoneId);
}
export function contactPosition(
  scene: Pick<VenueScene, "departedIds" | "accompanying" | "sceneAttendance">,
  characterId: string,
): string {
  if (scene.departedIds?.includes(characterId)) return "";
  return (
    scene.accompanying?.find((entry) => entry.characterId === characterId)?.zoneId ??
    scene.sceneAttendance?.occupants.find((entry) => entry.characterId === characterId)?.zoneId ??
    ""
  );
}

/** Project the existing invitation's escort only for deliberate entry checks. */
export function sceneMoveAccompanying(
  scene: Pick<VenueScene, "entryOffers" | "accompanying" | "sceneAttendance" | "departedIds" | "zoneId">,
  venue: VillageVenue,
  zone: VillageVenueZone,
) {
  const offered = scene.entryOffers?.find((entry) => entry.zoneId === zone.id);
  return offered?.accompanies &&
    canOccupyZone(venue, zone, offered.controllerId) &&
    (!venue.access || contactPosition(scene, offered.controllerId) === scene.zoneId)
    ? [
        ...(scene.accompanying ?? []).filter((entry) => entry.characterId !== offered.controllerId),
        { characterId: offered.controllerId, zoneId: zone.id },
      ]
    : scene.accompanying;
}
export function sceneAccessContext(
  scene: Pick<
    VenueScene,
    | "id"
    | "startedAt"
    | "sceneAttendance"
    | "accompanying"
    | "departedIds"
    | "zoneId"
    | "continuity"
    | "villageSeed"
    | "submissions"
  >,
  state: VillageState,
): AccessContext {
  return {
    sceneId: scene.id,
    at: new Date(scene.sceneAttendance?.capturedAt ?? scene.startedAt),
    relationships: sceneRelationshipView(state.relationshipContext, scene),
    positions: {
      ...Object.fromEntries((scene.sceneAttendance?.occupants ?? []).map((row) => [row.characterId, row.zoneId])),
      ...Object.fromEntries((scene.accompanying ?? []).map((row) => [row.characterId, row.zoneId])),
      ...Object.fromEntries((scene.departedIds ?? []).map((actor) => [actor, ""])),
      player: scene.zoneId ?? "exterior",
    },
  };
}
export function contactCanEnter(
  state: VillageState,
  venue: VillageVenue,
  zoneId: string,
  characterId: string,
  scene?: VenueScene,
): boolean {
  if (scene) state = sceneAccessState(state, scene);
  venue = sceneLayoutVenue(venue, scene);
  const zone = venueZones(venue).find((entry) => entry.id === zoneId);
  if (zone?.closed) return false;
  if (venue.access)
    return (
      !!zone &&
      evaluateZoneAccess(venue, zone, characterId, {
        ...(scene ? sceneAccessContext(scene, state) : { relationships: state.relationshipContext }),
        accepting: characterId === "player",
        unavailable: !!zone && zoneClosed(state, venue, zone),
        environment: state.narrative,
      }).allowed
    );
  return (
    !!zone &&
    !zoneClosed(state, venue, zone) &&
    (canOccupyZone(venue, zone, characterId, {
      ...(scene ? sceneAccessContext(scene, state) : { relationships: state.relationshipContext }),
      environment: state.narrative,
    }) ||
      (characterId === "player" &&
        !scene?.dismissedZoneIds?.includes(zoneId) &&
        (venue.playerInvitations?.some(
          (entry) => entry.zoneId === zoneId && canInviteToZone(venue, zone, entry.residentId),
        ) ||
          (scene?.grantedZoneIds?.includes(zoneId) &&
            scene.zoneGrants?.some(
              (grant) => grant.zoneId === zoneId && canInviteToZone(venue, zone, grant.controllerId),
            )))) ||
      Object.values(state.relationshipContext?.grants ?? {}).some(
        (grant) =>
          grant.active &&
          !grant.revoked &&
          grant.visitorId === characterId &&
          grant.venueId === venue.id &&
          grant.zoneId === zoneId &&
          canInviteToZone(venue, zone, grant.controllerId),
      ))
  );
}
/** Entrance egress follows physical doorways even when an intermediate Zone denies entry. */
export function contactPath(
  state: VillageState,
  venue: VillageVenue,
  from: string,
  to: string,
  actor: string,
  scene?: VenueScene,
): string[] | null {
  if (!from || !to) return null;
  const queue = [[from]],
    seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift()!,
      last = path.at(-1)!;
    if (last === to) return path;
    for (const next of contactNeighbors(venue, last, scene)) {
      if (seen.has(next) || (to !== "exterior" && !contactCanEnter(state, venue, next, actor, scene))) continue;
      seen.add(next);
      queue.push([...path, next]);
    }
  }
  return null;
}
export function contactSpeech(
  lines: Pick<VenueLine, "speakerId" | "content" | "kind">[],
  actor: string,
  quote: string,
): boolean {
  return (
    normalize(quote).length >= 2 &&
    lines.some(
      (line) =>
        line.kind !== "narration" && line.speakerId === actor && normalize(line.content).includes(normalize(quote)),
    )
  );
}
export function readContactMoves(
  value: unknown,
  lines: Pick<VenueLine, "speakerId" | "content" | "kind">[],
  state: VillageState,
  venue: VillageVenue,
  scene: VenueScene,
  allowed: string[],
  requireSegment = false,
  allowLocalNoop: boolean | "redundant" = false,
  semantic = false,
): ContactMove[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((value) => {
    const row = asRecord(value),
      actor = asTrimmedString(row.characterId),
      destination = asTrimmedString(row.zoneId),
      quote = asTrimmedString(row.quote);
    const segment = row.segment;
    const narration = Number.isSafeInteger(segment) ? lines[Number(segment)] : undefined;
    const name =
      scene.participants.find((person) => person.characterId === actor)?.name ??
      scene.sceneAttendance?.occupants.find((person) => person.characterId === actor)?.name ??
      "";
    const path = contactPath(state, venue, contactPosition(scene, actor), destination, actor, scene);
    const zones = venueZones(sceneLayoutVenue(venue, scene));
    const words = (value: string) =>
      normalize(value)
        .replace(/[^\p{L}\p{N}]+/gu, " ")
        .trim();
    const narratedWords = " " + words(narration?.content ?? "") + " ";
    const localNoop =
      allowLocalNoop &&
      path?.length === 1 &&
      destination === (scene.zoneId ?? "exterior") &&
      zones.some((zone) => zone.id === destination) &&
      (semantic ||
        !zones.some(
          (zone) =>
            zone.id !== destination &&
            [zone.name].some((label) => !!words(label) && narratedWords.includes(" " + words(label) + " ")),
        ));
    const citedMove =
      Number(segment) >= 0 &&
      narration?.kind === "narration" &&
      normalize(quote).length >= 8 &&
      normalize(narration.content).includes(normalize(quote)) &&
      (semantic || localNoop || (!!name && normalize(quote).includes(normalize(name))));
    const movementText = normalize(localNoop ? (narration?.content ?? "") : quote);
    // A validated current-Zone annotation is discarded by v3, never applied as movement.
    // Speech/thought intent elsewhere in its narration cannot make that no-op consequential.
    const qualifyMovement = !localNoop || allowLocalNoop !== "redundant";
    if (
      !allowed.includes(actor) ||
      (requireSegment && segment === undefined) ||
      seen.has(actor) ||
      (segment === undefined ? !contactSpeech(lines, actor, quote) : !citedMove) ||
      (!semantic &&
        qualifyMovement &&
        segment !== undefined &&
        /\b(?:would|could|will|plans?|intends?)\b/iu.test(movementText)) ||
      (!semantic && qualifyMovement && /\b(?:maybe|perhaps|might|unless|if|won't|can't|not)\b/iu.test(movementText)) ||
      !path ||
      (path.length < 2 && !localNoop) ||
      !lines.some((line) => line.kind === "narration")
    )
      return [];
    seen.add(actor);
    return [
      {
        characterId: actor,
        zoneId: destination,
        quote,
        path,
        ...(segment !== undefined ? { segment: Number(segment) } : {}),
      },
    ];
  });
}
