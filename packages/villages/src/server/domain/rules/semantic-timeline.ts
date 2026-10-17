import type { VenueScene, VenueReplyLine } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { asRecord } from "./coerce.js";
import { badGateway, conflict } from "./errors.js";
import { contactPath, sceneAccessContext, type ContactMove } from "./venue-contact.js";
import { resolveVenueZone, zoneArea, zoneClosed } from "./venue-zones.js";
import { sceneZoneOccupants } from "./scene-attendance.js";
import { evaluateZoneAccess, claimVisitPermission } from "./venue-access.js";

export type SemanticPlayerMove = { zoneId: string; segment: number };

/** Resolve supported transitions without inventing a semantic intent or changing saved state. */
export function semanticPlayerMoves(
  value: unknown,
  scene: VenueScene,
  lines: readonly VenueReplyLine[],
): SemanticPlayerMove[] {
  const planned = scene.semanticIntent?.timeline.filter((step) => step.kind === "movement" && step.zoneId) ?? [];
  const rows = value === undefined ? [] : value;
  if (!Array.isArray(rows) || rows.length > 8 || rows.length !== planned.length)
    throw badGateway("System movement timeline does not match the prepared source.");
  let previous = -1;
  return rows.map((value, index) => {
    const row = asRecord(value);
    if (
      row.zoneId !== planned[index].zoneId ||
      !Number.isInteger(row.segment) ||
      Number(row.segment) <= previous ||
      lines[Number(row.segment)]?.kind !== "narration"
    )
      throw badGateway("System movement has an invalid destination or ordered source.");
    previous = Number(row.segment);
    // Exact captured speech may not cross a prepared movement boundary.
    for (const [segment, line] of lines.entries())
      for (const span of line.speechSource?.spans ?? [])
        if (
          (span.end <= planned[index].start && segment >= previous) ||
          (span.start >= planned[index].end && segment <= previous)
        )
          throw badGateway("Player speech was reordered across a Zone movement.");
    return { zoneId: String(row.zoneId), segment: previous };
  });
}

export function projectSemanticMovement(
  scene: VenueScene,
  state: VillageState,
  venue: VillageVenue,
  moves: readonly SemanticPlayerMove[],
  residentMoves: readonly ContactMove[],
  claim = false,
): VenueScene {
  const projected = structuredClone(scene);
  for (const move of moves) {
    projected.accompanying = [
      ...(scene.accompanying ?? []).filter(
        (row) =>
          !residentMoves.some(
            (entry) => entry.characterId === row.characterId && Number(entry.segment) <= move.segment,
          ),
      ),
      ...residentMoves
        .filter((entry) => Number(entry.segment) <= move.segment)
        .map(({ characterId, zoneId }) => ({ characterId, zoneId })),
    ];
    const target = resolveVenueZone(venue, move.zoneId);
    if (
      !target ||
      zoneClosed(state, venue, target) ||
      !contactPath(state, venue, projected.zoneId ?? "exterior", target.id, "player", projected) ||
      projected.dismissedZoneIds?.includes(target.id)
    )
      throw conflict("The prepared Zone movement no longer has a permitted route.");
    // Canonical invitations can be claimed atomically by the caller's World mutation.
    // Legacy mixed movement only uses already-established occupation/grants, not a consumed visit invitation.
    if (venue.access) {
      const decision = evaluateZoneAccess(venue, target, "player", {
        ...sceneAccessContext(projected, state),
        accepting: true,
      });
      if (!decision.allowed) throw conflict(decision.explanation);
      if (claim) claimVisitPermission(venue, decision.permissionId, scene.id);
    } else if (
      venue.playerInvitations?.some((row) => row.zoneId === target.id) &&
      !scene.grantedZoneIds?.includes(target.id)
    )
      throw conflict("Use Move to claim this legacy visit invitation before speaking there.");
    const people = sceneZoneOccupants(projected, state, venue, target.id);
    if (people.length > 4) throw conflict("Five residents occupy this Zone in the Scene. Choose another Zone.");
    projected.enteredFromZoneId = projected.zoneId;
    projected.zoneId = target.id;
    projected.area = zoneArea(target);
    projected.spaceClass = target.venueClass;
    projected.privateOwnerId = target.ownerId ?? "";
    projected.privateSpaceId = ["private-residence", "staff", "restricted"].includes(target.kind)
      ? target.id
      : undefined;
    projected.activeIds = people.map((row) => row.characterId);
    projected.grantedZoneIds = [...new Set([...(projected.grantedZoneIds ?? []), target.id])];
    projected.entryOffers = projected.entryOffers?.filter((row) => row.zoneId !== target.id);
    for (const person of people) {
      if (!projected.participants.some((row) => row.characterId === person.characterId))
        projected.participants.push({ characterId: person.characterId, name: person.name, doing: person.doing });
      if (!projected.heardHistory.some((row) => row.characterId === person.characterId))
        projected.heardHistory.push({ characterId: person.characterId, lineIds: [] });
    }
  }
  return projected;
}

export function semanticPhysicalContext(value: unknown, lines: readonly VenueReplyLine[], scene: VenueScene) {
  const segment = asRecord(value).segment;
  const line = Number.isInteger(segment) ? lines[Number(segment)] : undefined;
  if (!line || line.kind !== "narration")
    throw badGateway("System physical outcome needs an exact current narration source.");
  return { zoneId: line.zoneId ?? scene.zoneId ?? "exterior", witnessIds: [...line.heardBy], segment: Number(segment) };
}
