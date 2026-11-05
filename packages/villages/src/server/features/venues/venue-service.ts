import { rememberZoneArtwork, observedPictureKey } from "../../domain/rules/zone-observation.js";
import { sceneActorIds } from "../../domain/rules/places.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VenueScene } from "../../domain/models/scene-model.js";
import type { VillageSnapshot, VillageState, VillageVenueClass, VillageVenueImage } from "../../domain/models/world.js";
import { badRequest, conflict, notFound } from "../../domain/rules/errors.js";
import { boundText, MAX_VENUE_NAME_LENGTH } from "../../domain/rules/prompt-preset.js";
import { keepAgendaPlaces } from "../../domain/rules/resident-agenda.js";
import { sceneryImageKey } from "../../domain/rules/scenery-context.js";
import { applyAccessCommand, readAccessCommand } from "../../domain/rules/venue-access.js";
import { hasVenueClass, venueAssignedCount, venueResidentIds } from "../../domain/rules/venue-model.js";
import { legacyZoneId, privateTarget, resolveVenueZone, zoneClosed } from "../../domain/rules/venue-zones.js";
import { readVenueImageContext } from "../../domain/rules/village-projections.js";
import { readHomeBuildingNames } from "../../domain/rules/world-input.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import { zonePictureBaseline, zonePictureContext } from "../../domain/rules/zone-picture.js";
import { applyVenueZoneLayout } from "../../domain/rules/venue-layout.js";
import { designateCommunityVenue } from "../../domain/rules/community-venue.js";
export type VillageVenueDeletionDependencies = {
  venueId: string;
  venueName: string;
  residentCharacterIds: string[];
  playerHome: boolean;
  workerCharacterIds: string[];
  pendingResidenceCharacterIds: string[];
  remapCount: number;
  roomPresent: boolean;
  eventCount: number;
};

/** Effectful reads remain explicit: Scene queries can reconcile an existing visit. */
export interface VenueCommandPorts {
  withSceneNavigation<T>(operation: () => Promise<T>): Promise<T>;
  readVillageState(): Promise<VillageState>;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
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
  withSceneNavigation,
}: VenueCommandPorts) {
  async function imageTarget(
    body: { venueId?: unknown; zoneId?: unknown; privateSpaceId?: unknown; privateOwnerId?: unknown } | undefined,
  ): Promise<string | undefined> {
    for (const key of ["zoneId", "privateSpaceId", "privateOwnerId"] as const)
      if (body?.[key] !== undefined && body[key] !== null && typeof body[key] !== "string")
        throw badRequest("Room targets must be text IDs.");
    if (!body?.privateSpaceId && !body?.zoneId && !body?.privateOwnerId) return undefined;
    const state = await readVillageState(),
      venue = state.venues.find((entry) => entry.id === body.venueId);
    if (!venue) throw badRequest("That Venue no longer exists.");
    return privateTarget(
      venue,
      typeof body.zoneId === "string" ? body.zoneId : undefined,
      typeof body.privateSpaceId === "string" ? body.privateSpaceId : undefined,
      typeof body.privateOwnerId === "string" ? body.privateOwnerId : "",
    );
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
    daylight = false,
    guard?: (state: VillageState) => boolean,
    fromObservation = false,
  ): Promise<VillageSnapshot> {
    await assertVenueImageAccess(venueId, spaceClass, privateOwnerId, zoneId, fromObservation);
    await mutateVillageState((state) => {
      const venue = state.venues.find((entry) => entry.id === venueId);
      if (!venue) throw notFound("That place is no longer in the village.");
      if (guard && !guard(state)) throw conflict("The scenery changed while its image was generated. Generate again.");
      if (
        !fromObservation &&
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
      const targetId =
        zoneId ??
        legacyZoneId(
          venue,
          privateOwnerId ? "private" : spaceClass === "residence" ? "shared" : spaceClass ? "public" : "outside",
          spaceClass,
          privateOwnerId,
        );
      const zone = resolveVenueZone(venue, targetId);
      if (!zone) throw notFound("That zone no longer exists.");
      if (
        fromObservation &&
        (!zone.observed || (expectedContext && observedPictureKey(state, zone) !== expectedContext))
      )
        throw conflict("The remembered artwork changed. Generate again.");
      const renderedContext = fromObservation ? zone.observed!.context : zonePictureContext(state, venue, zone);
      if (onlyIfEmpty && (state.automaticZonePictures === false || zone.freezePicture || zone.picture?.removed)) return;
      if (onlyIfEmpty && zone.image) return;
      zone.image = image;
      zone.pictureRevision = (zone.pictureRevision ?? 0) + 1;
      zone.picture = {
        reference: image ? zone.picture?.reference : undefined,
        referenceAppliedId: image ? zone.picture?.reference?.id : undefined,
        base: image,
        daylight: !!image && daylight,
        removed: !image,
        baseline: image ? zonePictureBaseline(renderedContext) : undefined,
        context: image ? renderedContext : undefined,
        lastAutomaticAt: zone.picture?.lastAutomaticAt,
        dirty: fromObservation && renderedContext !== zonePictureContext(state, venue, zone),
      };
      rememberZoneArtwork(zone, fromObservation);
      if (!image) zone.initialImageAttemptedAt = new Date().toISOString();
      if (zone.kind === "exterior") venue.presentation.image = image;
    });
    return buildVillageSnapshot();
  }

  async function assertVenueImageAccess(
    venueId: string,
    spaceClass?: VillageVenueClass,
    privateOwnerId = "",
    zoneId?: string,
    fromObservation = false,
  ): Promise<void> {
    const village = await readVillageState();
    const venue = village.venues.find((entry) => entry.id === venueId);
    if (!venue) throw notFound("That Venue is no longer here.");
    if (!fromObservation && spaceClass && !hasVenueClass(venue, spaceClass))
      throw notFound("That Venue space no longer exists.");
    const targetId =
      zoneId ??
      legacyZoneId(
        venue,
        privateOwnerId ? "private" : spaceClass === "residence" ? "shared" : spaceClass ? "public" : "outside",
        spaceClass,
        privateOwnerId,
      );
    const zone = resolveVenueZone(venue, targetId);
    if (!zone) throw notFound("That Zone no longer exists.");
    if (fromObservation) {
      if (!zone.seen || !zone.observed) throw conflict("Visit this Zone before generating its artwork.");
    } else if (zoneClosed(village, venue, zone)) throw conflict("This Zone is not physically available yet.");
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
    await mutateVillageState(
      (state) => {
        const venue = state.venues.find((row) => row.id === venueId);
        if (!venue) throw notFound("That Venue is no longer here.");
        if (command.action === "community-venue") {
          designateCommunityVenue(state, venue, command, villageNow().toISOString());
          return;
        }
        applyAccessCommand(
          venue,
          command,
          "player",
          villageNow().toISOString(),
          ["player", ...sceneActorIds(state)],
          [],
          state.communityVenueId,
        );
      },
      { memories: true },
    );
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
        (key) => !["id", "name", "venueType", "imageContext"].includes(key),
      );
      if (disallowed.length) throw badRequest("Physical changes need a Project, natural gameplay, or REPAIR.");
      const current = state.venues[index]!;
      if (current.constructionStatus === "worksite") throw conflict("The worksite is governed by its build project.");
      const name = boundText(posted.name ?? current.name, MAX_VENUE_NAME_LENGTH);
      if (!name) throw badRequest("A venue needs a name.");
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
      if (posted.imageContext !== undefined) current.imageContext = readVenueImageContext(posted.imageContext);
    });
    return buildVillageSnapshot();
  }

  async function updateVenueZoneLayout(venueId: string, value: unknown): Promise<VillageSnapshot> {
    return withSceneNavigation(async () => {
      if (await sceneQueries().activeVenueSession())
        throw conflict("End the active Scene before editing Zone positions or connections.");
      await mutateVillageState((state) => {
        const venue = state.venues.find((entry) => entry.id === venueId);
        if (!venue) throw notFound("That Venue no longer exists.");
        applyVenueZoneLayout(state, venue, value);
      });
      return buildVillageSnapshot();
    });
  }

  async function renameVillageZone(venueId: string, zoneId: string, value: unknown): Promise<VillageSnapshot> {
    const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
    if (
      Object.keys(row).some((key) => key !== "name") ||
      typeof row.name !== "string" ||
      !row.name.trim() ||
      row.name.length > MAX_VENUE_NAME_LENGTH
    )
      throw badRequest("This control changes the Zone name only.");
    await mutateVillageState((state) => {
      const venue = state.venues.find((entry) => entry.id === venueId);
      const zone = venue && resolveVenueZone(venue, zoneId);
      if (!zone) throw notFound("That Zone is no longer here.");
      if (zone.kind === "exterior") throw badRequest("Exterior is always named Exterior.");
      zone.name = (row.name as string).trim();
    });
    return buildVillageSnapshot();
  }
  async function deleteVillageVenue(venueId: string, confirmed: boolean): Promise<VillageSnapshot> {
    if (!confirmed) throw badRequest("Deleting a venue requires confirmation.");
    const dependencies = await previewVillageVenueDeletion(venueId);
    if (dependencies.residentCharacterIds.length || dependencies.playerHome)
      throw conflict("Move every resident, including yourself, before deleting this Residence.");
    if (dependencies.roomPresent) throw conflict("End the active Scene before deleting this venue.");
    await mutateVillageState((state) => {
      if (isVillageFounded(state)) throw conflict("Removing a founded Venue requires a Project.");
      const current = state.venues.find((venue) => venue.id === venueId);
      if (!current) throw notFound("That Venue no longer exists.");
      if (current.buildProjectId)
        throw conflict("A project-built venue requires an explicit future demolition project.");
      if (hasVenueClass(current, "residence") && venueAssignedCount(current) > 0)
        throw conflict("Move every resident before deleting this Residence.");
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
    imageTarget,
    setVillageVenueImage,
    assertVenueImageAccess,
    setVillageHomeBuildingNames,
    previewVillageVenueDeletion,
    changeVenueAccess,
    updateVillageVenue,
    renameVillageZone,
    updateVenueZoneLayout,
    deleteVillageVenue,
  };
}
export type VenueCommands = ReturnType<typeof createVenueCommands>;
