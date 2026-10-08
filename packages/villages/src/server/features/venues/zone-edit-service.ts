import type { VillageSnapshot } from "../../domain/models/world.js";
import { asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import {
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
} from "../../domain/rules/prompt-preset.js";
import { evaluateZoneAccess, managesAccess } from "../../domain/rules/venue-access.js";
import { venueFeatures, venueFieldText, venueStringList } from "../../domain/rules/venue-authoring.js";
import { sceneAccessContext } from "../../domain/rules/venue-contact.js";
import { venueResidentIds, venueSpaces } from "../../domain/rules/venue-model.js";
import { resolveVenueZone, zoneClosed, zoneControllerIds } from "../../domain/rules/venue-zones.js";
import { randomVillageSeed } from "../../domain/rules/village-clock.js";
import type { VillageState } from "../../domain/models/world.js";
import type { VenueScene } from "../../domain/models/scene-model.js";

export interface VenueZoneEditPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  sceneQueries(): {
    activeVenueSession(): Promise<Pick<
      VenueScene,
      | "id"
      | "placeId"
      | "zoneId"
      | "zoneGrants"
      | "area"
      | "privateOwnerId"
      | "startedAt"
      | "sceneAttendance"
      | "accompanying"
      | "departedIds"
    > | null>;
  };
}

/** Resident approval and direct Zone edits share one feature-owned command service. */
export function createVenueZoneEdits({
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  sceneQueries,
}: VenueZoneEditPorts) {
  async function updateVillageZone(venueId: string, zoneId: string, value: unknown): Promise<VillageSnapshot> {
    const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
    if (Object.keys(row).some((key) => !["name", "purpose", "description", "state"].includes(key)))
      throw badRequest("Structural zone changes need a Renovation.");
    const village = await readVillageState(),
      venue = village.venues.find((entry) => entry.id === venueId),
      zone = venue && resolveVenueZone(venue, zoneId);
    if (!venue || !zone) throw notFound("That zone is no longer here.");
    if (zone.kind !== "exterior" && !zone.seen && !(venue.occupancy.playerHome && zone.kind === "shared-residence"))
      throw conflict("Visit this zone before editing it.");
    if (["staff", "restricted"].includes(zone.kind) && !zoneControllerIds(venue, zone).length)
      throw conflict("This restricted space has no current controllers who can approve edits.");
    if (zoneControllerIds(venue, zone).some((id) => id !== "player"))
      return proposeResidenceSpaceEdit(venueId, {
        ...row,
        zoneId,
        target: zone.kind === "shared-residence" ? "shared" : "private",
        ownerId: zone.ownerId,
      });
    await mutateVillageState((state) => {
      const currentVenue = state.venues.find((entry) => entry.id === venueId)!,
        current = resolveVenueZone(currentVenue, zoneId)!;
      if (
        !current ||
        (currentVenue.access && !managesAccess(currentVenue, current.kind === "exterior" ? null : zoneId, "player"))
      )
        throw conflict("The Zone's managers changed. Reload before editing.");
      const scene = row.state && typeof row.state === "object" ? (row.state as Record<string, unknown>) : {};
      if (Object.keys(scene).some((key) => !["condition", "items", "publicFacts", "features"].includes(key)))
        throw badRequest("That scene field cannot be edited here.");
      current.name = venueFieldText(row.name, current.name, MAX_VENUE_NAME_LENGTH).trim();
      current.purpose = venueFieldText(row.purpose, current.purpose ?? "", 240).trim();
      current.description = venueFieldText(row.description, current.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
      if (!current.name || !current.description) throw badRequest("Give the zone a name and description.");
      current.state = {
        ...current.state,
        condition: venueFieldText(scene.condition, current.state.condition, MAX_VENUE_NOTE_LENGTH),
        items: venueStringList(scene.items, current.state.items),
        publicFacts: venueStringList(scene.publicFacts, current.state.publicFacts),
        features: venueFeatures(scene.features, current.state.features),
        updatedAt: new Date().toISOString(),
      };
    });
    return buildVillageSnapshot();
  }

  /** Keep a proposed Residence edit exact until the affected residents approve it aloud. */
  async function proposeResidenceSpaceEdit(venueId: string, value: unknown): Promise<VillageSnapshot> {
    const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
    const target: "shared" | "private" = row.target === "private" ? "private" : "shared";
    const ownerId = asTrimmedString(row.privateOwnerId ?? row.ownerId);
    if (row.privateSpaceId && row.zoneId && row.privateSpaceId !== row.zoneId)
      throw conflict("Conflicting private space targets.");
    const zoneId = asTrimmedString(row.privateSpaceId ?? row.zoneId);

    const { activeVenueSession } = sceneQueries();
    const session = await activeVenueSession();
    if (
      !session ||
      session.placeId !== venueId ||
      (zoneId && session.zoneId !== zoneId) ||
      (!zoneId &&
        (target === "shared"
          ? session.area !== "shared" && session.area !== "private"
          : session.area !== "private" || session.privateOwnerId !== ownerId))
    )
      throw conflict("Enter the space with its resident's invitation before proposing a change.");
    await mutateVillageState((state) => {
      const venue = state.venues.find((entry) => entry.id === venueId);
      if (!venue) throw notFound("That Venue is no longer here.");
      if (zoneId && ownerId && resolveVenueZone(venue, zoneId)?.ownerId !== ownerId)
        throw conflict("Conflicting private space targets.");
      const current = zoneId
        ? resolveVenueZone(venue, zoneId)
        : target === "shared"
          ? venueSpaces(venue).find((space) => space.venueClass === "residence")
          : venue.privateSpaces?.find((space) => space.ownerId === ownerId);
      if (!current) throw notFound("That Residence space is no longer here.");
      if (zoneId) {
        const zone = resolveVenueZone(venue, zoneId)!;
        const grant = session.zoneGrants?.find((entry) => entry.zoneId === zoneId);
        if (
          zoneClosed(state, venue, zone) ||
          (venue.access
            ? !evaluateZoneAccess(venue, zone, "player", sceneAccessContext(session, state)).allowed
            : grant && !zoneControllerIds(venue, zone).includes(grant.controllerId))
        )
          throw conflict("This space's invitation is no longer valid.");
      }
      const requiredIds = zoneId
        ? zoneControllerIds(venue, resolveVenueZone(venue, zoneId)!)
        : target === "shared"
          ? venueResidentIds(venue)
          : [ownerId];
      if (!requiredIds.length) throw conflict("The space has no current resident who can approve this edit.");
      const scene =
        row.state && typeof row.state === "object" && !Array.isArray(row.state)
          ? (row.state as Record<string, unknown>)
          : {};
      const proposed = {
        ...current,
        name: venueFieldText(row.name, "name" in current ? String(current.name) : "Zone", MAX_VENUE_NAME_LENGTH).trim(),
        purpose: venueFieldText(row.purpose, "purpose" in current ? String(current.purpose ?? "") : "", 240).trim(),
        description: venueFieldText(row.description, current.description, MAX_VENUE_DESCRIPTION_LENGTH).trim(),
        state: {
          ...current.state,
          condition: venueFieldText(scene.condition, current.state.condition, MAX_VENUE_NOTE_LENGTH),
          items: venueStringList(scene.items, current.state.items),
          publicFacts: venueStringList(scene.publicFacts, current.state.publicFacts),
          features: venueFeatures(scene.features, current.state.features),
        },
      };
      if (!proposed.description) throw badRequest("Describe the proposed space.");
      venue.editProposals = [
        ...(venue.editProposals ?? []).filter((proposal) => !proposal.declined),
        {
          id: randomVillageSeed(),
          target,
          zoneId: current.id,
          privateSpaceId: target === "private" ? current.id : undefined,
          ownerId: target === "private" ? ownerId : "",
          baseUpdatedAt: current.state.updatedAt,
          proposed,
          requiredIds,
          approvedIds: requiredIds.includes("player") ? ["player"] : [],
          declined: false,
          createdAt: new Date().toISOString(),
        },
      ].slice(-8);
    });
    return buildVillageSnapshot();
  }

  async function applyResidenceEditApproval(
    venueId: string,
    proposalId: string,
    residentId: string,
    approved: boolean,
  ): Promise<void> {
    await mutateVillageState((state) => {
      const venue = state.venues.find((entry) => entry.id === venueId);
      const proposal = venue?.editProposals?.find((entry) => entry.id === proposalId);
      if (!venue || !proposal || proposal.declined || !proposal.requiredIds.includes(residentId)) return;
      const current = proposal.zoneId
        ? resolveVenueZone(venue, proposal.zoneId)
        : proposal.target === "shared"
          ? venueSpaces(venue).find((space) => space.venueClass === "residence")
          : venue.privateSpaces?.find((space) => space.ownerId === proposal.ownerId);
      const currentResidents = proposal.zoneId
        ? zoneControllerIds(venue, resolveVenueZone(venue, proposal.zoneId)!)
        : proposal.target === "shared"
          ? venueResidentIds(venue)
          : [proposal.ownerId];
      if (
        !current ||
        current.state.updatedAt !== proposal.baseUpdatedAt ||
        JSON.stringify([...currentResidents].sort()) !== JSON.stringify([...proposal.requiredIds].sort())
      ) {
        proposal.declined = true;
        return;
      }
      if (!approved) {
        proposal.declined = true;
        return;
      }
      proposal.approvedIds = [...new Set([...proposal.approvedIds, residentId])];
      if (!proposal.requiredIds.every((id) => proposal.approvedIds.includes(id))) return;
      const applied = {
        ...proposal.proposed,
        state: { ...proposal.proposed.state, updatedAt: new Date().toISOString() },
      };
      if (proposal.zoneId) {
        const zone = resolveVenueZone(venue, proposal.zoneId);
        if (!zone) return;
        zone.description = applied.description;
        zone.name = applied.name ?? zone.name;
        zone.purpose = applied.purpose ?? zone.purpose;
        zone.state = applied.state;
      } else if (proposal.target === "shared") {
        venue.spaces = venueSpaces(venue).map((space) =>
          space.venueClass === "residence" ? { ...applied, image: space.image } : space,
        );
        venue.description = applied.description;
        venue.state.condition = applied.state.condition;
        venue.state.furniture = applied.state.items;
        venue.state.publicFacts = applied.state.publicFacts;
        venue.state.features = applied.state.features;
        venue.state.updatedAt = applied.state.updatedAt;
      } else {
        venue.privateSpaces = (venue.privateSpaces ?? []).map((space) =>
          space.ownerId === proposal.ownerId ? { ...applied, image: space.image, ownerId: proposal.ownerId } : space,
        );
      }
      venue.editProposals = venue.editProposals?.filter((entry) => entry.id !== proposal.id);
    });
  }
  return { updateVillageZone, proposeResidenceSpaceEdit, applyResidenceEditApproval };
}
export type VenueZoneEdits = ReturnType<typeof createVenueZoneEdits>;
