import type {
  VillageSnapshot,
  VillageState,
  VillageVenue,
  VillageVenueClass,
  VillageVenueImage,
} from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { parsePlace } from "../../domain/rules/founding-record.js";
import {
  boundText,
  isHousePlace,
  MAX_PLACES,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_NAME_LENGTH,
} from "../../domain/rules/prompt-preset.js";
import { keepAgendaPlaces } from "../../domain/rules/resident-agenda.js";
import { sceneryImageKey } from "../../domain/rules/scenery-context.js";
import { applyAccessCommand, readAccessCommand } from "../../domain/rules/venue-access.js";
import { addVillageVenue, venueDraft } from "../../domain/rules/venue-authoring.js";
import { assertVillageVenueCapacity } from "../../domain/rules/venue-capacity.js";
import { hasVenueClass, venueAssignedCount, venueResidentIds, venueSpaces } from "../../domain/rules/venue-model.js";
import {
  legacyZoneId,
  resolveVenueZone,
  venueZones,
  zoneClosed,
  zoneControllerIds,
} from "../../domain/rules/venue-zones.js";
import { readVenueImageContext } from "../../domain/rules/village-projections.js";
import { readHomeBuildingNames } from "../../domain/rules/world-input.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
export type VillageVenueDeletionDependencies = {
  venueId: string;
  venueName: string;
  residentCharacterIds: string[];
  playerHome: boolean;
  workerCharacterIds: string[];
  pendingMailCount: number;
  pendingResidenceCharacterIds: string[];
  remapCount: number;
  roomPresent: boolean;
  eventCount: number;
};

/** Effectful reads remain explicit: Scene queries can reconcile an existing visit. */
export interface VenueCommandPorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  buildVillageSnapshot(): Promise<VillageSnapshot>;
  sceneQueries(): {
    activeVenueSession(): Promise<Pick<VenueScene, "id" | "placeId" | "zoneId" | "zoneGrants"> | null>;
  };
}

/** Venue commands own their coordination; construction starts no work. */
export function createVenueCommands({
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  sceneQueries,
}: VenueCommandPorts) {
  /**
   * Replace every place in the village in one write.
   *
   * Positions are not meaningful the way they are for notices, so the whole list
   * is replaced rather than merged — and now that the houses are in the same list
   * as the venues that matters more than it did: the panel that edits names and
   * notes and the map that moves pins are editing ONE list, and a merge would mean
   * a save from either of them silently reverting the other.
   *
   * Over-long entries are refused for the same reason over-long presets are: the
   * player typed them and can see them.
   */
  async function setVillageVenues(value: unknown, scope: "all" | "homes" = "all"): Promise<VillageSnapshot> {
    if (!Array.isArray(value)) throw badRequest("The places must be a list.");
    if (value.length > MAX_PLACES) throw badRequest(`A village holds at most ${MAX_PLACES} places.`);

    const stored = await readVillageState();
    const residents = new Set(stored.villagers.map((villager) => villager.characterId));
    // Pictures come across by id rather than out of the request. The panel edits
    // names and notes and has no opinion about art, so a save that arrives
    // without a picture means "unchanged" — and trusting the request instead
    // would let a tab built before this field existed, or a save sent while a
    // generation was still running, quietly delete every picture in the village.
    const previous = new Map(stored.venues.map((place) => [place.id, place.presentation.image]));
    const previousPlaces = new Map(stored.venues.map((place) => [place.id, place]));

    const places: VillageVenue[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();
    const seenOccupants = new Set<string>();
    let sawPlayerHome = false;
    for (const entry of value) {
      const place = parsePlace(entry);
      if (seenIds.has(place.id)) throw badRequest("Two places cannot share an id.");
      if (place.occupancy.playerHome) {
        if (sawPlayerHome) throw badRequest("Only one place can be your home.");
        sawPlayerHome = true;
      }
      if (place.occupancy.residentCharacterId !== null) {
        if (!residents.has(place.occupancy.residentCharacterId)) {
          throw badRequest("A place can only belong to somebody who lives here.");
        }
        if (seenOccupants.has(place.occupancy.residentCharacterId))
          throw badRequest("A villager can only live in one place.");
        seenOccupants.add(place.occupancy.residentCharacterId);
      }
      const key = place.name.toLowerCase();
      if (seenNames.has(key)) throw badRequest("Every Venue needs a distinct name.");
      seenNames.add(key);
      seenIds.add(place.id);
      const prior = previousPlaces.get(place.id);
      if (!prior && !place.description.trim()) throw badRequest("Approve a description before creating this venue.");
      if (
        prior?.occupancy.residentCharacterId &&
        (!place.occupancy.residentCharacterId ||
          place.occupancy.residentCharacterId !== prior.occupancy.residentCharacterId ||
          place.presentation.x !== prior.presentation.x ||
          place.presentation.y !== prior.presentation.y ||
          place.occupancy.homeKind !== prior.occupancy.homeKind)
      )
        throw conflict("This home is occupied. Its resident must approve a move first.");
      places.push({
        ...place,
        form: place.form || prior?.form || "",
        classes: prior?.classes ?? place.classes,
        spaces: prior?.spaces ?? place.spaces,
        residenceCapacity: prior?.residenceCapacity ?? place.residenceCapacity,
        residentIds: prior ? venueResidentIds(prior) : place.residentIds,
        playerInvitations: prior?.playerInvitations ?? [],
        exteriorState: prior?.exteriorState,
        privateSpaces: prior?.privateSpaces,
        archivedPrivateSpaces: prior?.archivedPrivateSpaces,
        editProposals: prior?.editProposals,
        playerSeenShared: prior?.playerSeenShared,
        playerSeenPublic: prior?.playerSeenPublic,
        playerSeenPrivateIds: prior?.playerSeenPrivateIds,
        improvements: prior?.improvements ?? [null, null],
        description: prior?.description ?? place.description,
        capabilities: prior?.capabilities ?? place.capabilities,
        workerIds: prior?.workerIds ?? [],
        state: prior?.state ?? place.state,
        presentation: { ...place.presentation, image: previous.get(place.id) ?? null },
      });
    }

    await mutateVillageState((state) => {
      if (isVillageFounded(state)) {
        const target = scope === "homes" ? state.venues.filter(isHousePlace) : state.venues;
        if (places.length !== target.length || places.some((place) => !target.some((entry) => entry.id === place.id)))
          throw conflict("After founding, new venues begin as projects; the settings list cannot add or remove them.");
        for (const place of places) {
          const current = state.venues.find((entry) => entry.id === place.id)!;
          if (place.presentation.x !== current.presentation.x || place.presentation.y !== current.presentation.y)
            throw conflict("Move Venue photographs while replacing the map in Village Settings.");
          if (current.constructionStatus === "worksite") {
            if (place.name !== current.name || place.description !== current.description)
              throw conflict("A worksite's identity belongs to its active project.");
            continue;
          }
          current.name = place.name;
          current.description = place.description;
        }
        return;
      }
      const next =
        scope === "homes"
          ? [...places.filter(isHousePlace), ...state.venues.filter((place) => !isHousePlace(place))]
          : places;
      const names = next.map((place) => place.name.trim().toLowerCase()).filter(Boolean);
      if (new Set(names).size !== names.length) throw badRequest("Every Venue needs a distinct name.");
      if (
        state.venues.some(
          (place) => place.occupancy.residentCharacterId && !next.some((entry) => entry.id === place.id),
        )
      )
        throw conflict("Move the resident before removing their home.");
      if (isVillageFounded(state) && !next.some((place) => place.occupancy.playerHome))
        throw conflict("The village must keep your home.");
      assertVillageVenueCapacity(state, next);
      state.venues = next.map((place) => {
        const latest = state.venues.find((entry) => entry.id === place.id);
        return latest
          ? {
              ...place,
              spaces: latest.spaces,
              state: latest.state,
              exteriorState: latest.exteriorState,
              privateSpaces: latest.privateSpaces,
              archivedPrivateSpaces: latest.archivedPrivateSpaces,
              editProposals: latest.editProposals,
              playerInvitations: latest.playerInvitations,
              playerSeenShared: latest.playerSeenShared,
              playerSeenPublic: latest.playerSeenPublic,
              playerSeenPrivateIds: latest.playerSeenPrivateIds,
              presentation: { ...place.presentation, image: latest.presentation.image },
            }
          : place;
      });
      keepAgendaPlaces(state);
    });
    return buildVillageSnapshot();
  }

  /**
   * Give one place its picture, or take it away again with null.
   *
   * Deliberately not part of `setVillageVenues`. The list is typed into the
   * settings panel and saved as a whole in one gesture, while a picture arrives
   * from an upload or from a generation that took twenty seconds and may land
   * long after the panel was closed. Folding the two together would mean any edit
   * made while a generation was running threw the generation away.
   *
   * A place that has since been deleted is refused rather than ignored, and it is
   * refused INSIDE the write so there is no window between checking and saving.
   * By the time this runs the picture is already in the gallery, so quietly doing
   * nothing would leave the player holding an image they never asked to keep with
   * no hint of where it came from.
   */
  async function setVillageVenueImage(
    venueId: string,
    image: VillageVenueImage | null,
    spaceClass?: VillageVenueClass,
    privateOwnerId = "",
    onlyIfEmpty = false,
    zoneId?: string,
    expectedContext?: string,
  ): Promise<VillageSnapshot> {
    await assertVenueImageAccess(venueId, spaceClass, privateOwnerId, zoneId);
    await mutateVillageState((state) => {
      const venue = state.venues.find((entry) => entry.id === venueId);
      if (!venue) throw notFound("That place is no longer in the village.");
      if (
        expectedContext &&
        expectedContext !==
          sceneryImageKey(
            state,
            venue,
            zoneId ??
              legacyZoneId(
                venue,
                privateOwnerId ? "private" : spaceClass === "residence" ? "shared" : spaceClass ? "public" : "outside",
                spaceClass,
                privateOwnerId,
              ),
          )
      )
        throw conflict("The scenery changed while its image was generated. Generate again.");
      if (zoneId) {
        const zone = resolveVenueZone(venue, zoneId);
        if (!zone) throw notFound("That zone no longer exists.");
        if (zone.kind !== "exterior" && !zone.seen && !(zone.kind === "shared-residence" && venue.occupancy.playerHome))
          throw conflict("Visit this zone before changing its image.");
        if (!onlyIfEmpty || !zone.image) zone.image = image;
      } else if (privateOwnerId) {
        const space = venue.privateSpaces?.find((entry) => entry.ownerId === privateOwnerId);
        if (!space) throw notFound("That private space no longer exists.");
        if (!venue.playerSeenPrivateIds?.includes(privateOwnerId))
          throw conflict("Visit this Residence space before changing its image.");
        if (onlyIfEmpty && space.image) return;
        space.image = image;
      } else if (spaceClass) {
        if (spaceClass === "residence" && !venue.occupancy.playerHome && !venue.playerSeenShared)
          throw conflict("Visit this Residence space before changing its image.");
        venue.spaces = venueSpaces(venue);
        const space = venue.spaces.find((entry) => entry.venueClass === spaceClass);
        if (!space) throw badRequest("That Class has no space at this Venue.");
        space.image = image;
      } else venue.presentation.image = image;
    });
    return buildVillageSnapshot();
  }

  async function assertVenueImageAccess(
    venueId: string,
    spaceClass?: VillageVenueClass,
    privateOwnerId = "",
    zoneId?: string,
  ): Promise<void> {
    if (zoneId || privateOwnerId) {
      const village = await readVillageState(),
        venue = village.venues.find((entry) => entry.id === venueId),
        zone = venue && resolveVenueZone(venue, zoneId || legacyZoneId(venue, "private", "residence", privateOwnerId));
      if (!zone) throw notFound("That zone no longer exists.");
      if (
        ["private-residence", "staff", "restricted"].includes(zone.kind) &&
        !zoneControllerIds(venue!, zone).includes("player") &&
        zone.ownerId !== "player"
      ) {
        const { activeVenueSession } = sceneQueries();
        const session = await activeVenueSession();
        const controllers = zoneControllerIds(venue!, zone);
        const grant = session?.zoneGrants?.find((entry) => entry.zoneId === zone.id);
        if (
          !session ||
          session.placeId !== venueId ||
          session.zoneId !== zone.id ||
          !controllers.length ||
          (grant && !controllers.includes(grant.controllerId)) ||
          zoneClosed(village, venue!, zone)
        )
          throw conflict("Enter this private space with a current invitation before changing its image.");
      }
      if (zone.kind === "exterior" || zone.seen || (zone.kind === "shared-residence" && venue!.occupancy.playerHome))
        return;
      throw conflict("Visit this zone before changing its image.");
    }
    if (spaceClass) {
      const venue = (await readVillageState()).venues.find((entry) => entry.id === venueId);
      if (
        venue?.layoutVersion === 1 &&
        !venueZones(venue).some(
          (zone) => ["public", "shared-residence"].includes(zone.kind) && zone.venueClass === spaceClass,
        )
      )
        throw notFound("That Common Space is absent from this Venue.");
    }
    if (spaceClass !== "residence" && !privateOwnerId) return;
    const village = await readVillageState();
    const venue = village.venues.find((entry) => entry.id === venueId);
    if (!venue || !hasVenueClass(venue, "residence")) throw notFound("That Residence is no longer here.");
    if (privateOwnerId && !venueResidentIds(venue).includes(privateOwnerId))
      throw notFound("That resident no longer has a private space here.");
    if (venue.occupancy.playerHome && !privateOwnerId) return;
    if (privateOwnerId ? venue.playerSeenPrivateIds?.includes(privateOwnerId) : venue.playerSeenShared) return;
    throw conflict("Visit this Residence space before changing its image.");
  }

  async function setVillageHomeBuildingNames(value: unknown): Promise<VillageSnapshot> {
    const names = readHomeBuildingNames(value);
    await mutateVillageState((state) => {
      state.homeBuildingNames = names;
    });
    return buildVillageSnapshot();
  }

  async function previewVillageVenueDeletion(venueId: string): Promise<VillageVenueDeletionDependencies> {
    const village = await readVillageState();
    const venue = village.venues.find((entry) => entry.id === venueId);
    if (!venue) throw notFound("That place is no longer in the village.");
    return {
      venueId,
      venueName: venue.name,
      residentCharacterIds: venueResidentIds(venue),
      playerHome: venue.occupancy.playerHome,
      workerCharacterIds: venue.workerIds ?? [],
      pendingMailCount: village.venueMail.filter(
        (entry) =>
          entry.venueId === venueId && (entry.status === "pending-player" || entry.status === "awaiting-villagers"),
      ).length,
      pendingResidenceCharacterIds: village.residences
        .filter((residence) => residence.status === "pending" && residence.proposedVenueId === venueId)
        .map((residence) => residence.characterId),
      remapCount: village.villagers.reduce(
        (count, villager) => count + (villager.remap?.moves.filter((move) => move.venueId === venueId).length ?? 0),
        0,
      ),
      roomPresent: (await activeVisitAtVenue(venueId)) === true,
      eventCount: village.venueEvents.filter((event) => event.venueId === venueId).length,
    };
  }

  async function activeVisitAtVenue(venueId: string): Promise<boolean> {
    const { activeVenueSession } = sceneQueries();
    return (await activeVenueSession())?.placeId === venueId;
  }

  async function createVillageVenue(value: unknown): Promise<VillageSnapshot> {
    const draft = venueDraft(value, null);
    if (!draft.description) throw badRequest("Approve a description before creating this venue.");
    await mutateVillageState((state) => {
      if (isVillageFounded(state)) throw conflict("After founding, propose a venue project instead.");
      addVillageVenue(state, draft);
    });
    return buildVillageSnapshot();
  }

  /** Host authentication identifies the player; the request cannot impersonate an NPC. */
  async function changeVenueAccess(venueId: string, value: unknown): Promise<VillageSnapshot> {
    const command = readAccessCommand(value);
    if ("sceneId" in command && command.sceneId) throw badRequest("The server resolves the active Scene.");
    const { activeVenueSession } = sceneQueries();
    const scene = await activeVenueSession();
    if (command.action === "refuse-entry" || command.action === "leave-now") {
      if (!scene || scene.placeId !== venueId)
        throw conflict("Open a Scene in this Venue before changing permission for this visit.");
      command.sceneId = scene.id;
    }
    if (command.action === "invite" && scene?.placeId === venueId) command.sceneId = scene.id;
    await mutateVillageState((state) => {
      const venue = state.venues.find((row) => row.id === venueId);
      if (!venue) throw notFound("That Venue is no longer here.");
      applyAccessCommand(venue, command, "player", new Date().toISOString(), [
        "player",
        ...state.villagers.map((person) => person.characterId),
      ]);
    });
    await activeVenueSession(); // Reconcile recorded exits before returning the next snapshot.
    return buildVillageSnapshot();
  }

  async function updateVillageVenue(venueId: string, value: unknown): Promise<VillageSnapshot> {
    await mutateVillageState((state) => {
      const index = state.venues.findIndex((venue) => venue.id === venueId);
      if (index < 0) throw notFound("That place is no longer in the village.");
      const posted =
        value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
      const disallowed = Object.keys(posted).filter(
        (key) => !["id", "name", "venueType", "description", "imageContext"].includes(key),
      );
      if (disallowed.length)
        throw badRequest(
          "Edit Venue may change only name and description. Physical changes need their own earned route.",
        );
      const current = state.venues[index]!;
      if (current.constructionStatus === "worksite") throw conflict("The worksite is governed by its build project.");
      const name = boundText(posted.name ?? current.name, MAX_VENUE_NAME_LENGTH);
      const description = boundText(posted.description ?? current.description, MAX_VENUE_DESCRIPTION_LENGTH);
      if (!name || !description) throw badRequest("A venue needs a name and description.");
      if (state.venues.some((venue) => venue.id !== venueId && venue.name.toLowerCase() === name.toLowerCase()))
        throw conflict("A venue with that name already exists.");
      if (
        state.projects.some(
          (project) =>
            project.kind === "new-venue" &&
            project.status !== "complete" &&
            project.venueDraft?.name.toLowerCase() === name.toLowerCase(),
        )
      )
        throw conflict("That name is reserved by a build project.");
      current.name = name;
      current.venueType = boundText(posted.venueType ?? current.venueType, 100);
      current.description = description;
      if (posted.imageContext !== undefined) current.imageContext = readVenueImageContext(posted.imageContext);
    });
    return buildVillageSnapshot();
  }

  async function deleteVillageVenue(venueId: string, confirmed: boolean): Promise<VillageSnapshot> {
    if (!confirmed) throw badRequest("Deleting a venue requires confirmation.");
    const dependencies = await previewVillageVenueDeletion(venueId);
    if (dependencies.residentCharacterIds.length || dependencies.playerHome)
      throw conflict("Move every resident, including yourself, before deleting this Residence.");
    if (dependencies.roomPresent) throw conflict("End the active Scene before deleting this venue.");
    if (dependencies.pendingMailCount) throw conflict("Resolve pending Venue decisions before deleting this Venue.");
    await mutateVillageState((state) => {
      const current = state.venues.find((venue) => venue.id === venueId);
      if (!current) throw notFound("That Venue no longer exists.");
      if (current.buildProjectId)
        throw conflict("A project-built venue requires an explicit future demolition project.");
      if (hasVenueClass(current, "residence") && venueAssignedCount(current) > 0)
        throw conflict("Move every resident before deleting this Residence.");
      if (
        state.venueMail.some(
          (entry) =>
            entry.venueId === venueId && (entry.status === "pending-player" || entry.status === "awaiting-villagers"),
        )
      )
        throw conflict("Resolve pending Venue decisions before deleting this Venue.");
      state.venues = state.venues.filter((venue) => venue.id !== venueId);
      keepAgendaPlaces(state);
      state.residences = state.residences.filter(
        (residence) => residence.venueId !== venueId && residence.proposedVenueId !== venueId,
      );
      for (const villager of state.villagers) {
        if (!villager.remap) continue;
        villager.remap.moves = villager.remap.moves.filter((move) => move.venueId !== venueId);
      }
    });
    return buildVillageSnapshot();
  }
  return {
    setVillageVenues,
    setVillageVenueImage,
    assertVenueImageAccess,
    setVillageHomeBuildingNames,
    previewVillageVenueDeletion,
    createVillageVenue,
    changeVenueAccess,
    updateVillageVenue,
    deleteVillageVenue,
  };
}
export type VenueCommands = ReturnType<typeof createVenueCommands>;
