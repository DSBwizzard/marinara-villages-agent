import type { VillageState, VillageVenue } from "./types.js";
import type { VenueScene, VenueLine } from "./venue-session.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { venueZones, zoneClosed, canOccupyZone, canInviteToZone } from "./venue-zones.js";
import { contactNeighborIds } from "../../../../shared/src/villages/zone-contact.js";

export type ContactIntent = { kind: "knock" | "call"; targetId: string; boundaryZoneId: string; quote: string };
export type DoorwayContact = { characterId: string; playerZoneId: string; characterZoneId: string };
export type ContactMove = { characterId: string; zoneId: string; quote: string; path: string[] };
export type ContactRelay = { speakerId: string; targetId: string; quote: string; path: string[]; targetZoneId: string };
const normalize = (value: string) =>
  value.normalize("NFKC").replace(/[’‘]/gu, "'").replace(/\s+/gu, " ").trim().toLowerCase();

/** Hearing connections only; entry remains governed by existing Zone permissions. */
export function contactNeighbors(venue: VillageVenue, zoneId: string): string[] {
  return contactNeighborIds(venueZones(venue), zoneId);
}
export function contactPosition(scene: VenueScene, characterId: string): string {
  if (scene.departedIds?.includes(characterId)) return "";
  return (
    scene.accompanying?.find((entry) => entry.characterId === characterId)?.zoneId ??
    scene.sceneAttendance?.occupants.find((entry) => entry.characterId === characterId)?.zoneId ??
    ""
  );
}
export function contactCanEnter(
  state: VillageState,
  venue: VillageVenue,
  zoneId: string,
  characterId: string,
): boolean {
  const zone = venueZones(venue).find((entry) => entry.id === zoneId);
  return (
    !!zone &&
    !zoneClosed(state, venue, zone) &&
    (canOccupyZone(venue, zone, characterId) ||
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
/** Breadth-first search has no hop cutoff; every traversed destination must admit this actor. */
export function contactPath(
  state: VillageState,
  venue: VillageVenue,
  from: string,
  to: string,
  actor: string,
): string[] | null {
  if (!from || !to) return null;
  const queue = [[from]],
    seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift()!,
      last = path.at(-1)!;
    if (last === to) return path;
    for (const next of contactNeighbors(venue, last)) {
      if (seen.has(next) || !contactCanEnter(state, venue, next, actor)) continue;
      seen.add(next);
      queue.push([...path, next]);
    }
  }
  return null;
}
export function readContactIntent(value: unknown, message: string): ContactIntent | null {
  const row = asRecord(value),
    quote = asTrimmedString(row.quote);
  if (
    (row.kind !== "knock" && row.kind !== "call") ||
    !quote ||
    !normalize(message).includes(normalize(quote)) ||
    /\b(?:would|could|might|if|yesterday|earlier|don't|do not|didn't|did not)\s+(?:i\s+)?(?:knock|call)\b/iu.test(
      normalize(message),
    )
  )
    return null;
  return {
    kind: row.kind,
    targetId: asTrimmedString(row.targetId),
    boundaryZoneId: asTrimmedString(row.boundaryZoneId),
    quote,
  };
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
): ContactMove[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap((value) => {
    const row = asRecord(value),
      actor = asTrimmedString(row.characterId),
      destination = asTrimmedString(row.zoneId),
      quote = asTrimmedString(row.quote);
    const path = contactPath(state, venue, contactPosition(scene, actor), destination, actor);
    if (
      !allowed.includes(actor) ||
      seen.has(actor) ||
      !contactSpeech(lines, actor, quote) ||
      /\b(?:maybe|perhaps|might|unless|if|won't|can't|not)\b/iu.test(normalize(quote)) ||
      !path ||
      !lines.some((line) => line.kind === "narration")
    )
      return [];
    seen.add(actor);
    return [{ characterId: actor, zoneId: destination, quote, path }];
  });
}
export function readContactRelay(
  value: unknown,
  lines: Pick<VenueLine, "speakerId" | "content" | "kind">[],
  state: VillageState,
  venue: VillageVenue,
  scene: VenueScene,
  allowed: string[],
): ContactRelay | null {
  const row = asRecord(value),
    actor = asTrimmedString(row.speakerId),
    target = asTrimmedString(row.targetId),
    quote = asTrimmedString(row.quote),
    targetZone = contactPosition(scene, target);
  const targetSpace = venueZones(venue).find((entry) => entry.id === targetZone);
  if (
    !allowed.includes(actor) ||
    actor === target ||
    !targetZone ||
    !targetSpace ||
    zoneClosed(state, venue, targetSpace) ||
    !contactSpeech(lines, actor, quote) ||
    /\b(?:maybe|perhaps|might|unless|if|won't|can't|not)\b/iu.test(normalize(quote))
  )
    return null;
  // A messenger can approach the target's door without trespassing into the target's room.
  const candidates = [targetZone, ...contactNeighbors(venue, targetZone)]
    .map((zone) => contactPath(state, venue, contactPosition(scene, actor), zone, actor))
    .filter((path): path is string[] => !!path)
    .sort((a, b) => a.length - b.length);
  const path = candidates[0];
  return path ? { speakerId: actor, targetId: target, quote, path, targetZoneId: targetZone } : null;
}
