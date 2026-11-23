import { MAX_VILLAGERS } from "./village-limits.js";
import { createHash } from "node:crypto";
import type { VillageResidence, VillageState, VillageVenue } from "../models/world.js";
import { conflict, badGateway } from "./errors.js";
import { venueResidentIds, venueSleepers } from "./venue-model.js";
import { zoneManagers } from "./venue-access.js";
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
  provisional.destinations ??= {};
  provisional.destinations[actor] = { ...provisional.destinations[actor], sleep: sleepZoneId };
  return accessibleVenueRoute(state, provisional, actor, sleepZoneId, at, founding);
}

export function householdIds(venue: VillageVenue): string[] {
  return [...venueResidentIds(venue), ...(venue.occupancy.playerHome ? ["player"] : [])].sort();
}

const membersOfVenue = (venue: VillageVenue, actor: string) => householdIds(venue).includes(actor);

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
    row.householdIds.length > MAX_VILLAGERS + 1 ||
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
  const zones = venueZones(venue);
  const shared = zones.filter(
    (zone) => zone.kind !== "exterior" && zone.kind !== "personal" && !zoneClosed(state, venue, zone),
  );
  const sleep = zones.find((zone) => zone.id === (sleepZoneId || (shared.length === 1 ? shared[0].id : "")));
  if (venue.constructionStatus === "worksite" || !sleep || sleep.kind === "exterior" || zoneClosed(state, venue, sleep))
    throw conflict("Choose an available sleeping Zone in this Residence.");
  if (
    venue.access?.bans.some((ban) => ban.active && ban.visitorId === actor && (!ban.zoneId || ban.zoneId === sleep.id))
  )
    throw conflict("The destination's access rules prevent this move.");
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
        venueSleepers(venue, sleep.id),
        state.venues
          .filter((row) => membersOfVenue(row, actor))
          .map((row) => [row.id, row.destinations?.[actor]?.sleep]),
        sleep.ownerId ?? null,
        sleep.description,
        sleep.access,
        [...(venue.access?.managerIds ?? []), ...zoneManagers(venue, sleep)].sort(),
        venue.access?.bans.filter(
          (ban) => ban.active && ban.visitorId === actor && (!ban.zoneId || ban.zoneId === sleep.id),
        ),
      ]),
    )
    .digest("hex");
  return {
    requestId,
    scope,
    householdIds: members,
    requiredIds: [
      ...new Set([
        actor,
        ...members,
        ...(venue.access?.managerIds ?? []),
        ...zoneManagers(venue, sleep),
        ...(sleep.ownerId ? [sleep.ownerId] : []),
      ]),
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
