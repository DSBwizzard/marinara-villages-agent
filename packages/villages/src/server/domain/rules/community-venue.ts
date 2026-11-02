import type { VillageState, VillageVenue } from "../models/world.js";
import type { AccessCommand } from "../../../shared/helpers/venue-access.js";
import { conflict } from "./errors.js";

/** Eligibility concerns control and access, independently of physical damage or routing. */
export function communityVenueEligible(venue: VillageVenue, releasePlayerControl = false): boolean {
  const allowed = (ids: string[] | null | undefined) =>
    !ids?.length || (releasePlayerControl && ids.every((id) => id === "player"));
  const ledger = venue.access;
  const zones = venue.zones ?? [];
  return (
    !!ledger &&
    !venue.classes?.includes("residence") &&
    !venue.occupancy.playerHome &&
    !venue.residentIds?.length &&
    !venue.workerIds?.length &&
    allowed(ledger.managerIds) &&
    ledger.visitorHours === null &&
    !ledger.bans.some((ban) => ban.active) &&
    (releasePlayerControl || !ledger.visitDenials.length) &&
    zones.every(
      (zone) =>
        !zone.ownerId &&
        allowed(zone.controllerIds) &&
        allowed(zone.access?.managerIds) &&
        allowed(zone.access?.inviterIds) &&
        (zone.kind === "exterior" ||
          (zone.access?.mode === "public" && !zone.access.accompanied && !Array.isArray(zone.access.visitorHours))),
    ) &&
    zones.some(
      (zone) =>
        zone.kind === "public" &&
        zone.access?.mode === "public" &&
        !zone.access.accompanied &&
        !Array.isArray(zone.access.visitorHours),
    )
  );
}

export function assertCommunityVenueUse(state: Pick<VillageState, "communityVenueId">, venue: VillageVenue): void {
  if (state.communityVenueId === venue.id && !communityVenueEligible(venue))
    throw conflict("Designate another Community Venue before changing this neutral public place’s use or control.");
}

export function designateCommunityVenue(
  state: VillageState,
  venue: VillageVenue,
  command: Extract<AccessCommand, { action: "community-venue" }>,
  at: string,
): void {
  const ledger = venue.access;
  if (!ledger || command.zoneId !== null) throw conflict("Choose a whole Venue as the Community Venue.");
  const fingerprint = JSON.stringify({ venueId: venue.id, command });
  const receipt = ledger.receipts[command.operationId];
  if (receipt) {
    if (receipt.fingerprint !== fingerprint) throw conflict("This operation ID belongs to a different designation.");
    return;
  }
  const previous = state.venues.find((row) => row.id === state.communityVenueId);
  if (
    state.communityVenueId !== command.previousVenueId ||
    previous?.access?.revision !== command.previousRevision ||
    ledger.revision !== command.expectedRevision
  )
    throw conflict("Community access changed. Reload before choosing its replacement.");
  if (venue.id === state.communityVenueId) throw conflict("This is already the Community Venue.");
  if (!communityVenueEligible(venue, true))
    throw conflict("Choose a public, always-open place without residents, workers, bans or another person's control.");
  ledger.managerIds = [];
  ledger.visitDenials = [];
  for (const zone of venue.zones ?? []) {
    if (zone.controllerIds?.length) zone.controllerIds = [];
    if (zone.access?.managerIds?.length) zone.access.managerIds = null;
    if (zone.access?.inviterIds.length) zone.access.inviterIds = [];
  }
  const record = (place: VillageVenue, action: string) => {
    place.access!.revision++;
    place.access!.changes.push({
      id: command.operationId,
      revision: place.access!.revision,
      actorId: "player",
      zoneId: null,
      action,
      at,
      sourceLineIds: [],
    });
  };
  record(previous!, "community-venue-release");
  record(venue, "community-venue-designate");
  state.communityVenueId = venue.id;
  ledger.receipts[command.operationId] = { fingerprint, revision: ledger.revision, outcome: "applied" };
}
