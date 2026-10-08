import type { VillageState, VillageVenue, VillageVenueClass, VillageVenueImage } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest, conflict } from "./errors.js";
import {
  boundText,
  isGlobalGalleryRef,
  isHomeBuildingKind,
  isHousePlace,
  MAX_PLACES,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_IMAGE_URL_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  SETUP_MAX_VILLAGER_COUNT,
  SETUP_MIN_VILLAGER_COUNT,
} from "./prompt-preset.js";
import { initializeVenueAccess } from "./venue-access.js";
import { readPlacePosition } from "./venue-authoring.js";
import { readBaseVenueLayout } from "./venue-layout.js";
import { defaultVenueSpace, validVenueClasses } from "./venue-model.js";
import { randomVillageSeed } from "./village-clock.js";
import { readVenueImageContext } from "./village-projections.js";

// ── Places: the village's one list ───────────────────────────────────────────
// A place is somewhere the player or a villager can BE, whether that is a shop
// on the map or the house they sleep in. Both are written through
// `setVillageVenues`; what is here is the reading of a request body, which
// refuses rather than repairs because the player typed it and can still see it.

/** A place as it comes out of a request body, once it has been checked over. */
export type ParsedPlace = {
  venueType?: string;
  access?: VillageVenue["access"];
  destinations?: VillageVenue["destinations"];
  layoutVersion?: 1;
  zones?: VillageVenue["zones"];
  privateSpaces?: VillageVenue["privateSpaces"];
  imageContext?: VillageVenue["imageContext"];
  id: string;
  name: string;
  form: string;
  classes: VillageVenueClass[];
  spaces: NonNullable<VillageVenue["spaces"]>;
  residenceCapacity: number;
  residentIds: string[];
  improvements: NonNullable<VillageVenue["improvements"]>;
  description: string;
  category: string;
  presentation: VillageVenue["presentation"];
  occupancy: VillageVenue["occupancy"];
  capabilities: string[];
  state: VillageVenue["state"];
};
/**
 * Read one place out of a request body.
 *
 * Refuses rather than repairs, unlike the store's own `coerceVenue`: this is
 * input the player just typed and can still see, so quietly nudging a pin onto
 * the map or dropping an occupant would hide the very mistake they need to fix.
 * The store is the other way round for the same reason in reverse — a document
 * that has been sitting on disk is repaired so a hand-edit cannot cost the
 * player a village.
 *
 * A place that is somebody's house does not need a name, and a place that is not
 * does. That is not a leniency: the village genuinely has no name for a house.
 * It knows "Bram's house", which is a sentence about Bram, not a name for a
 * building — nobody stands in the street and calls it that. Names exist on this
 * list for one reason, which is that the model is shown them and told to answer
 * with the number of the one it means, and the houses are not in that list. So
 * demanding a name for one would be demanding a fact nothing reads.
 */
export function foundingImage(value: unknown): VillageVenueImage | null {
  if (value === null || value === undefined) return null;
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw badRequest("A founding image must come from the gallery.");
  const row = value as Record<string, unknown>;
  const ref = asTrimmedString(row.ref);
  const id = asTrimmedString(row.id);
  const url = asTrimmedString(row.url);
  if (
    !isGlobalGalleryRef(ref) ||
    id !== ref.slice("global-gallery:".length) ||
    !url ||
    url.length > MAX_VENUE_IMAGE_URL_LENGTH
  ) {
    throw badRequest("A founding image needs a valid gallery reference.");
  }
  return { ref, id, url };
}
export function foundingSpace(
  value: unknown,
  venueClass: VillageVenueClass,
  description: string,
): NonNullable<VillageVenue["spaces"]>[number] {
  const row = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const spaceDescription = boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
  if (!spaceDescription) throw badRequest("Describe the interior before founding the village.");
  return {
    ...defaultVenueSpace(venueClass, description),
    description: spaceDescription,
    image: foundingImage(row.image),
  };
}
export function parsePlace(value: unknown, founding = false): ParsedPlace {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw badRequest("Every place needs a name.");
  }
  const record = value as Record<string, unknown>;
  const occupancyRecord =
    record.occupancy && typeof record.occupancy === "object" && !Array.isArray(record.occupancy)
      ? (record.occupancy as Record<string, unknown>)
      : {};
  if (occupancyRecord.playerHome !== undefined && typeof occupancyRecord.playerHome !== "boolean") {
    throw badRequest("A place is either your home or a villager's.");
  }
  if (
    occupancyRecord.residentCharacterId !== undefined &&
    occupancyRecord.residentCharacterId !== null &&
    typeof occupancyRecord.residentCharacterId !== "string"
  ) {
    throw badRequest("A place's resident must be a character.");
  }
  const playerHome = occupancyRecord.playerHome === true;
  const characterId =
    typeof occupancyRecord.residentCharacterId === "string" ? occupancyRecord.residentCharacterId.trim() : "";
  if (
    occupancyRecord.homeKind !== undefined &&
    occupancyRecord.homeKind !== null &&
    !isHomeBuildingKind(occupancyRecord.homeKind)
  ) {
    throw badRequest("A place has to be a building this village has, or no building at all.");
  }
  const homeKind = isHomeBuildingKind(occupancyRecord.homeKind) ? occupancyRecord.homeKind : null;
  if (record.name !== undefined && typeof record.name !== "string") {
    throw badRequest("A place name must be text.");
  }
  const name = typeof record.name === "string" ? record.name.trim() : "";
  // A house can leave this blank; anything a villager could be SENT to cannot,
  // because the name is the only thing the translation list has to say about it.
  if (name.length === 0) throw badRequest("Every Venue needs a name.");
  if (name.length > MAX_VENUE_NAME_LENGTH) {
    throw badRequest(`A place name can be at most ${MAX_VENUE_NAME_LENGTH} characters.`);
  }
  const description = typeof record.description === "string" ? record.description.trim() : "";
  const form = boundText(record.form, MAX_VENUE_NOTE_LENGTH).trim();
  if (founding && !form) throw badRequest("Describe what each venue actually is in Form before founding.");
  if (founding && !description) throw badRequest("Describe the exterior of each venue before founding.");
  const classes: VillageVenueClass[] = validVenueClasses(record.classes)
    ? record.classes
    : playerHome || characterId
      ? ["residence"]
      : record.category === "public-center"
        ? ["gathering"]
        : ["other"];
  const capacity =
    Number.isInteger(record.residenceCapacity) &&
    Number(record.residenceCapacity) >= 1 &&
    Number(record.residenceCapacity) <= 4
      ? Number(record.residenceCapacity)
      : 1;
  if (description.length > MAX_VENUE_DESCRIPTION_LENGTH) throw badRequest("A venue description is too long.");
  const presentationRecord =
    record.presentation && typeof record.presentation === "object" && !Array.isArray(record.presentation)
      ? (record.presentation as Record<string, unknown>)
      : {};
  const { x, y } = readPlacePosition(presentationRecord);
  // The player's home is their own. Letting a villager be recorded against it
  // would make two different parts of the tab disagree about who lives there.
  if (playerHome && characterId.length > 0) {
    throw badRequest("Your own home cannot also belong to a villager.");
  }
  if (founding && record.layoutVersion !== 1) throw badRequest("Choose the venue layout before founding.");
  const explicitZones =
    record.layoutVersion === 1 && founding
      ? readBaseVenueLayout(record, classes, playerHome ? "player" : characterId, foundingImage)
      : undefined;
  const result: ParsedPlace = {
    venueType: boundText(record.venueType, 100),
    layoutVersion: record.layoutVersion === 1 ? 1 : undefined,
    zones: explicitZones ?? (founding ? readCreationPrivateZones(record.privateSpaces, classes) : undefined),
    privateSpaces:
      !explicitZones && founding && playerHome
        ? [
            {
              ...defaultVenueSpace(
                "residence",
                boundText(
                  (Array.isArray(record.privateSpaces)
                    ? record.privateSpaces.find((room) => room.ownerId === "player")
                    : {}
                  )?.description,
                  1000,
                ) || "Your personal space.",
              ),
              id: "private:player",
              ownerId: "player",
              image: foundingImage(
                (Array.isArray(record.privateSpaces)
                  ? record.privateSpaces.find((room) => room.ownerId === "player")
                  : {}
                )?.image,
              ),
            },
          ]
        : undefined,
    imageContext: readVenueImageContext(record.imageContext),
    id: asTrimmedString(record.id) || randomVillageSeed(),
    name,
    form,
    classes,
    spaces: explicitZones
      ? explicitZones.filter((zone) => ["public", "shared-residence"].includes(zone.kind))
      : classes.map((venueClass) => {
          const posted = Array.isArray(record.spaces)
            ? record.spaces.find(
                (entry) =>
                  entry && typeof entry === "object" && (entry as Record<string, unknown>).venueClass === venueClass,
              )
            : null;
          const scene = posted && typeof posted === "object" ? (posted as Record<string, unknown>) : {};
          return founding
            ? foundingSpace(scene, venueClass, description)
            : defaultVenueSpace(venueClass, boundText(scene.description, MAX_VENUE_DESCRIPTION_LENGTH) || description);
        }),
    residenceCapacity: founding && record.layoutVersion === 1 ? 1 : capacity,
    residentIds: characterId ? [characterId] : [],
    improvements: [null, null],
    description,
    category: typeof record.category === "string" ? record.category.trim() : "",
    presentation: { image: founding ? foundingImage(presentationRecord.image) : null, x, y },
    occupancy: {
      playerHome,
      residentCharacterId: characterId.length > 0 ? characterId : null,
      homeKind,
    },
    capabilities: [],
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  };
  if (founding) {
    initializeVenueAccess(result);
    for (const [actor, destinations] of Object.entries(asRecord(record.destinations))) {
      if (!result.destinations?.[actor])
        throw badRequest("Choose destinations only for assigned residents or workers.");
      const selected = asRecord(destinations);
      for (const role of ["home", "sleep", "work"] as const) {
        const destination = asTrimmedString(selected[role]);
        if (!destination) continue;
        const zone = result.zones?.find((zone) => zone.id === destination);
        if (
          !zone ||
          zone.kind === "exterior" ||
          zone.venueClass !== (role === "work" ? "workplace" : "residence") ||
          (zone.ownerId && zone.ownerId !== actor)
        )
          throw badRequest("Choose a suitable Zone for each destination.");
        result.destinations[actor][role] = destination;
      }
    }
  }
  return result;
}
/**
 * Read a whole list of places, enforcing the rules no single place can check for
 * itself: at most one of them is the player's, every occupant is somebody who
 * lives here, and a villager sleeps in one place at a time.
 *
 * `residents` is who is allowed to hold a home — the village's villagers when
 * the map is being edited, or the cards being moved in when the village is being
 * founded, since neither is written to the record yet at that point.
 *
 * `requiredHomes` is the founding flow's own rule, and it counts HOMES rather
 * than places: a village is founded with four houses on its map, and the venues
 * the model proposes afterwards are not part of that count. Null means "accept
 * the map as it now stands", which is what a second run through the wizard over
 * a village that already exists passes. A house counts whether or not anybody
 * has moved into it yet — see `isHousePlace` — because the wizard's four pins are
 * four buildings on a picture long before they are four people.
 */
export function parsePlaces(value: unknown, residents: ReadonlySet<string>, founding: boolean): ParsedPlace[] {
  if (!Array.isArray(value)) throw badRequest("The places must be a list.");
  if (value.length > MAX_PLACES) throw badRequest(`A village holds at most ${MAX_PLACES} places.`);
  const places = value.map((entry) => parsePlace(entry, founding));
  const homes = places.filter((place) => isHousePlace(place));
  const playerHomes = places.filter((place) => place.occupancy.playerHome).length;
  if (playerHomes > 1) throw badRequest("Only one place can be your home.");
  if (founding && playerHomes !== 1) throw badRequest("One of the homes has to be yours.");
  const seenIds = new Set<string>();
  const seenOccupants = new Set<string>();
  const seenNames = new Set<string>();
  for (const place of places) {
    if (seenIds.has(place.id)) throw badRequest("Two places cannot share an id.");
    seenIds.add(place.id);
    const nameKey = place.name.toLowerCase();
    if (seenNames.has(nameKey)) throw badRequest("Every Venue needs a distinct name.");
    seenNames.add(nameKey);
    if ((place.occupancy.playerHome || place.occupancy.residentCharacterId) && !place.classes.includes("residence"))
      throw badRequest("An assigned home must have the Residence Class.");
    if (place.zones?.some((zone) => zone.controllerIds?.some((id) => id !== "player" && !residents.has(id))))
      throw badRequest("Choose current villagers as Private Space controllers.");
    if (place.occupancy.residentCharacterId === null) continue;
    if (!residents.has(place.occupancy.residentCharacterId)) {
      throw badRequest("Every villager's home has to belong to someone who lives here.");
    }
    if (seenOccupants.has(place.occupancy.residentCharacterId))
      throw badRequest("A villager can only live in one place.");
    seenOccupants.add(place.occupancy.residentCharacterId);
  }
  if (founding) {
    if (places.some((place) => !place.description.trim())) throw badRequest("Describe every founding venue.");
    if (places.some((place) => place.spaces?.some((space) => !space.description.trim())))
      throw badRequest("Describe every founding venue scene.");
    if (homes.some((place) => place.presentation.x === null || place.presentation.y === null))
      throw badRequest("Every founding home needs a spot on the map.");
    const assignedVillagers = places.filter((place) => place.occupancy.residentCharacterId !== null);
    if (assignedVillagers.length < SETUP_MIN_VILLAGER_COUNT || assignedVillagers.length > SETUP_MAX_VILLAGER_COUNT) {
      throw badRequest(
        `Founding needs between ${SETUP_MIN_VILLAGER_COUNT} and ${SETUP_MAX_VILLAGER_COUNT} villager homes.`,
      );
    }
    if (homes.length !== assignedVillagers.length + 1) {
      throw badRequest("Founding needs exactly one player home plus one home for each initial villager.");
    }
    if (assignedVillagers.some((place) => place.occupancy.playerHome)) {
      throw badRequest("A villager home cannot also be the player's home.");
    }
    const publicCenters = places.filter(
      (place) => !isHousePlace(place) && place.category.trim().toLowerCase() === "public-center",
    );
    if (publicCenters.length !== 1) {
      throw badRequest("Founding needs exactly one public center marked public-center.");
    }
    if (publicCenters[0]?.name.length === 0) {
      throw badRequest("The founding public center needs a name.");
    }
    if (publicCenters[0]?.presentation.x === null || publicCenters[0]?.presentation.y === null)
      throw badRequest("Place the public center on the map.");
    if (places.filter((place) => !isHousePlace(place)).length !== 1)
      throw badRequest("Founding needs exactly one public venue.");
  }
  return places;
}
/** Reject an edit to a previously locked founding Scenario. */
export function assertFoundingScenarioLocked(
  village: Pick<VillageState, "foundingReason" | "foundingDetails" | "foundingGuidance" | "scenarioImprint">,
  submitted: { foundingReason: string; foundingDetails: string; foundingGuidance: string; scenarioImprint?: unknown },
): void {
  if (
    submitted.foundingReason !== village.foundingReason ||
    submitted.foundingDetails !== village.foundingDetails ||
    submitted.foundingGuidance !== village.foundingGuidance ||
    (submitted.scenarioImprint !== undefined &&
      JSON.stringify(submitted.scenarioImprint) !== JSON.stringify(village.scenarioImprint))
  )
    throw conflict("The founding Scenario is locked. Start a new village to choose another one.");
}
/** Existing villages keep their locked beginning, including older records without starting circumstances. */
export function validateFirstDayDescription(description: string, founding: boolean): void {
  if (founding && !description.trim()) throw badRequest("Describe what brings you and the others together here.");
}
/** Bind a new wizard's selected roster to its assigned homes before generation or writes. */
export function validateFoundingRoster(
  value: unknown,
  assigned: ReadonlySet<string>,
  available: ReadonlySet<string>,
): void {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 3 ||
    value.some((id) => typeof id !== "string" || !available.has(id)) ||
    new Set(value).size !== value.length
  )
    throw badRequest("Choose one to three available founding villagers.");
  if (assigned.size !== value.length || value.some((id) => !assigned.has(id)))
    throw badRequest("Assign every villager chosen on People to one Residence.");
}
export function readCreationPrivateZones(
  value: unknown,
  classes: VillageVenueClass[],
): NonNullable<VillageVenue["zones"]> {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 12) throw badRequest("Choose at most twelve private spaces.");
  const ids = new Set<string>();
  return value
    .filter((raw) => raw && typeof raw === "object" && raw.ownerId !== "player")
    .map((raw) => {
      const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
      const id = asTrimmedString(row.id),
        name = boundText(row.name, 100).trim(),
        purpose = boundText(row.purpose, 240).trim();
      if (!id || ids.has(id) || !id.startsWith("restricted:"))
        throw badRequest("Private space IDs must be unique restricted room IDs.");
      ids.add(id);
      if (!name || !purpose) throw badRequest("Give each private space a name and purpose.");
      const controllerIds = Array.isArray(row.controllerIds)
        ? [...new Set(row.controllerIds.filter((id): id is string => typeof id === "string" && !!id))]
        : [];
      if (!classes.includes("workplace") && !controllerIds.length)
        throw badRequest("Assign a controller to this private space.");
      return {
        ...defaultVenueSpace(
          classes.includes("workplace") ? "workplace" : (classes[0] ?? "other"),
          boundText(row.description, 1000),
        ),
        id,
        name,
        purpose,
        controllerIds,
        kind: classes.includes("workplace") ? ("staff" as const) : ("restricted" as const),
        seen: false,
        preparation: { status: "pending" as const },
      };
    });
}
