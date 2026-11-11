import { createHash } from "node:crypto";
import type { VillageResidence, VillageState, VillageVenue } from "../models/world.js";
import { conflict, badGateway } from "./errors.js";
import { hasVenueClass, venueAssignedCount, venueCapacity, venueResidentIds } from "./venue-model.js";
import { venueZones, zoneClosed } from "./venue-zones.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";

export function accessibleSleepingRoute(
  state: Pick<VillageState, "projects" | "narrative">,
  venue: VillageVenue,
  actor: string,
  sleepZoneId: string,
  at: Date,
  founding = false,
): boolean {
  const provisional = structuredClone(venue);
  if (!founding) {
    if (actor === "player") provisional.occupancy.playerHome = true;
    else provisional.residentIds = [...new Set([...venueResidentIds(provisional), actor])];
  }
  const zones = venueZones(provisional);
  const sleeping = zones.find((zone) => zone.id === sleepZoneId);
  if (sleeping?.kind === "private-residence" && !sleeping.ownerId) {
    sleeping.ownerId = actor;
    sleeping.access = {
      mode: "permission-required",
      managerIds: [actor],
      memberIds: [actor],
      memberRoles: [],
      inviterIds: [],
      visitorHours: "always",
      accompanied: false,
    };
  }
  return accessibleVenueRoute(state, provisional, actor, sleepZoneId, at, founding);
}

export function householdIds(venue: VillageVenue): string[] {
  return [...venueResidentIds(venue), ...(venue.occupancy.playerHome ? ["player"] : [])].sort();
}

export function readResidenceAgreement(value: unknown): NonNullable<VillageResidence["agreement"]> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw badGateway("Saved move agreements are missing.");
  const row = value as Record<string, unknown>;
  if (
    typeof row.requestId !== "string" ||
    !row.requestId ||
    row.requestId.length > 300 ||
    !Array.isArray(row.requiredIds) ||
    row.requiredIds.length > 100 ||
    row.requiredIds.some((id) => typeof id !== "string" || !id) ||
    new Set(row.requiredIds).size !== row.requiredIds.length ||
    typeof row.scope !== "string" ||
    !/^[a-f0-9]{64}$/u.test(row.scope) ||
    typeof row.sleepZoneId !== "string" ||
    !row.sleepZoneId ||
    !Array.isArray(row.householdIds) ||
    row.householdIds.length > 4 ||
    row.householdIds.some((id) => typeof id !== "string" || !id) ||
    new Set(row.householdIds).size !== row.householdIds.length ||
    !row.approvals ||
    typeof row.approvals !== "object" ||
    Array.isArray(row.approvals) ||
    Object.values(row.approvals).some((answer) => typeof answer !== "boolean")
  )
    throw badGateway("Saved move agreements are invalid; restore or repair their source.");
  return structuredClone(value) as NonNullable<VillageResidence["agreement"]>;
}

export function captureResidenceAgreement(
  state: VillageState,
  venue: VillageVenue,
  actor: string,
  sleepZoneId: string,
  requestId: string,
  at: string,
): NonNullable<VillageResidence["agreement"]> {
  if (venue.id === state.communityVenueId)
    throw conflict("Designate another Community Venue before assigning residents to this neutral public place.");
  const zones = venueZones(venue);
  const shared = zones.filter((zone) => zone.kind === "shared-residence" && !zoneClosed(state, venue, zone));
  const sleep = zones.find((zone) => zone.id === (sleepZoneId || (shared.length === 1 ? shared[0].id : "")));
  if (
    !hasVenueClass(venue, "residence") ||
    venue.constructionStatus === "worksite" ||
    !sleep ||
    sleep.kind === "exterior" ||
    sleep.venueClass !== "residence" ||
    zoneClosed(state, venue, sleep) ||
    (sleep.ownerId && sleep.ownerId !== actor)
  )
    throw conflict("Choose an available sleeping Zone in this Residence.");
  if (
    sleep.access?.mode === "permission-required" &&
    !sleep.access.memberRoles.includes("residents") &&
    !sleep.access.memberIds.includes(actor) &&
    sleep.ownerId !== actor &&
    sleep.kind !== "private-residence"
  )
    throw conflict("The sleeping Zone must admit its resident.");
  if (
    venue.access?.bans.some((ban) => ban.active && ban.visitorId === actor && (!ban.zoneId || ban.zoneId === sleep.id))
  )
    throw conflict("The destination's access rules prevent this move.");
  const reservations = state.residences.filter(
    (move) => move.characterId !== actor && move.proposedVenueId === venue.id && move.status !== "current",
  );
  if (venueAssignedCount(venue) + reservations.length >= venueCapacity(venue))
    throw conflict("This Residence has no unreserved resident place.");
  if (sleep.kind === "private-residence" && reservations.some((move) => move.agreement?.sleepZoneId === sleep.id))
    throw conflict("That private room is reserved for another move.");
  const members = householdIds(venue);
  if (!accessibleSleepingRoute(state, venue, actor, sleep.id, new ZonedDate(at, state.timeZone || "UTC")))
    throw conflict("No accessible route connects Entrance to this sleeping Zone.");
  const scope = createHash("sha256")
    .update(
      JSON.stringify([
        requestId,
        actor,
        venue.id,
        members,
        sleep.id,
        sleep.ownerId ?? null,
        sleep.description,
        sleep.access,
        [...(venue.access?.managerIds ?? [])].sort(),
        venue.access?.bans.filter(
          (ban) => ban.active && ban.visitorId === actor && (!ban.zoneId || ban.zoneId === sleep.id),
        ),
        venueCapacity(venue),
      ]),
    )
    .digest("hex");
  return {
    requestId,
    scope,
    householdIds: members,
    requiredIds: [
      ...new Set([actor, ...members, ...(venue.access?.managerIds ?? []), ...(sleep.access?.managerIds ?? [])]),
    ].sort(),
    sleepZoneId: sleep.id,
    approvals: {},
  };
}

export function assertResidenceAgreement(
  state: VillageState,
  move: VillageResidence,
  requireApprovals = true,
  at = move.requestedAt,
): void {
  const destination = state.venues.find((venue) => venue.id === move.proposedVenueId);
  const current =
    destination && move.agreement
      ? captureResidenceAgreement(
          state,
          destination,
          move.characterId,
          move.agreement.sleepZoneId,
          move.agreement.requestId,
          at,
        )
      : null;
  if (
    !destination ||
    !move.agreement ||
    current?.scope !== move.agreement.scope ||
    JSON.stringify(current.requiredIds) !== JSON.stringify(move.agreement.requiredIds)
  )
    throw conflict("The household or destination changed. Review this move and renew its agreements.");
  if (requireApprovals && !move.agreement.requiredIds.every((id) => move.agreement!.approvals[id] === true))
    throw conflict("The incoming person and every housemate must agree to this exact move.");
}

export function residenceProposal(
  state: VillageState,
  actor: string,
  venue: VillageVenue,
  requestedBy: "player" | "villager",
  at: string,
  sleepZoneId: string,
  requestId: string,
): VillageResidence {
  const agreement = captureResidenceAgreement(state, venue, actor, sleepZoneId, requestId, at);
  agreement.approvals[requestedBy === "player" ? "player" : actor] = true;
  return {
    characterId: actor,
    venueId:
      state.venues.find((row) =>
        actor === "player" ? row.occupancy.playerHome : venueResidentIds(row).includes(actor),
      )?.id ?? "",
    proposedVenueId: venue.id,
    proposedPrivateZoneId: sleepZoneId,
    status: "pending",
    requestedAt: at,
    requestedBy,
    villagerDecision: "pending",
    agreement,
  };
}
