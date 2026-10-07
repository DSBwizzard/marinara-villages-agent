import type { uploadVillageGalleryImage } from "../../adapters/engine/global-gallery.js";
import type { readVillageVisualLore } from "../../adapters/engine/lorebooks.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { VillageSnapshot, VillageState, VillageVenue, VillageVenueClass } from "../../domain/models/world.js";
import { conflict, notFound } from "../../domain/rules/errors.js";
import { MAX_LOCATION_IMAGE_BASE64_LENGTH } from "../../domain/rules/image-limits.js";
import {
  buildLocationPrompt,
  LOCATION_IMAGE_WIDTH,
  LOCATION_IMAGE_HEIGHT,
  LOCATION_NEGATIVE_PROMPT,
} from "../../domain/rules/location-image-rules.js";
import { sceneryCharacterContext, sceneryImageKey, sceneryPrompt } from "../../domain/rules/scenery-context.js";
import { venueClasses, venueInArea, venueInSpace } from "../../domain/rules/venue-model.js";
import { legacyZoneId, resolveVenueZone, venueInZone, venueZones } from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
import type { assertVenueImageAccess, setVillageVenueImage } from "../venues/services.js";
import type { generateVillageImage } from "./image-generation.js";
import type { decodeImageDataUrl } from "./location-image-codec.js";
export type LocationImagePorts = {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  assertVenueImageAccess: typeof assertVenueImageAccess;
  setVillageVenueImage: typeof setVillageVenueImage;
  readVillageVisualLore: typeof readVillageVisualLore;
  generateVillageImage: typeof generateVillageImage;
  uploadVillageGalleryImage: typeof uploadVillageGalleryImage;
  decodeImageDataUrl: typeof decodeImageDataUrl;
  villagesLogger: () => Pick<ReturnType<typeof villagesLogger>, "warn">;
};
/** Access, private-entry claims, upload and current-context writes stay with one application. */
export function createLocationImages(ports: LocationImagePorts) {
  const {
    readVillageState,
    mutateVillageState,
    assertVenueImageAccess,
    setVillageVenueImage,
    readVillageVisualLore,
    generateVillageImage,
    uploadVillageGalleryImage,
    decodeImageDataUrl,
    villagesLogger,
  } = ports;

  async function requireVenue(venueId: string): Promise<{ village: VillageState; venue: VillageVenue }> {
    const village = await readVillageState();
    const venue = village.venues.find((entry) => entry.id === venueId);
    if (!venue) throw notFound("That place is no longer in the village.");
    return { village, venue };
  }

  async function generateVillageLocationImage(
    venueId: string,
    connectionId?: string,
    spaceClass?: VillageVenueClass,
    privateOwnerId = "",
    onlyIfEmpty = false,
    zoneId?: string,
  ): Promise<VillageSnapshot> {
    const found = await requireVenue(venueId);
    const village = found.village;
    if (spaceClass && !venueClasses(found.venue).includes(spaceClass))
      throw notFound("That Venue space no longer exists.");
    await assertVenueImageAccess(venueId, spaceClass, privateOwnerId, zoneId);
    const venue = zoneId
      ? venueInZone(found.venue, zoneId)
      : privateOwnerId
        ? venueInArea(found.venue, "private", "residence", privateOwnerId)
        : spaceClass
          ? venueInSpace(found.venue, spaceClass)
          : found.venue;
    const targetZone = zoneId
      ? resolveVenueZone(found.venue, zoneId)
      : privateOwnerId
        ? resolveVenueZone(found.venue, legacyZoneId(found.venue, "private", "residence", privateOwnerId))
        : undefined;
    if (privateOwnerId && !targetZone) throw conflict("Choose the exact personal Zone before drawing its image.");
    const character = sceneryCharacterContext(
      village,
      found.venue,
      targetZone?.kind === "private-residence" ? targetZone.ownerId : "",
    );
    const expectedContext = sceneryImageKey(
      village,
      found.venue,
      zoneId ??
        legacyZoneId(
          found.venue,
          privateOwnerId ? "private" : spaceClass === "residence" ? "shared" : spaceClass ? "public" : "outside",
          spaceClass,
          privateOwnerId,
        ),
    );
    const moment = deriveVillageMoment({
      foundedAt: village.foundedAt,
      seed: village.seed,
      now: new Date(),
    });
    const exterior = zoneId
      ? resolveVenueZone(found.venue, zoneId)?.kind === "exterior"
      : !spaceClass && !privateOwnerId;
    const exteriorContext = [venue.name, venue.form, venue.description, venue.exteriorState?.condition ?? ""].join(
      "\n",
    );
    const lore =
      (found.venue.imageContext?.useVisualLore ?? village.useVisualLoreByDefault)
        ? await readVillageVisualLore(
            village.selectedLorebookIds,
            `${village.name}\n${village.setting}\n${village.worldFacts.join("\n")}\n${exterior ? exteriorContext : `${venue.name}\n${venue.form}\n${venue.description}\n${venue.state.condition}`}\n${character}\n${targetZone?.name ?? ""}\n${targetZone?.purpose ?? ""}`,
            900,
          )
        : "";
    const basePrompt = buildLocationPrompt(
      { ...village, setting: "", worldFacts: [], venues: [] },
      {
        ...venue,
        state: { ...venue.state, furniture: [], publicFacts: [], upgrades: [] },
        exteriorState: venue.exteriorState ? { ...venue.exteriorState, items: [], publicFacts: [] } : undefined,
      },
      moment,
      "",
      exterior ? "exterior" : "interior",
      privateOwnerId
        ? `${village.villagers.find((person) => person.characterId === privateOwnerId)?.cardSnapshot.name ?? "a resident"}'s private space`
        : spaceClass
          ? `${spaceClass} Common Space`
          : "",
    );

    const prompt = sceneryPrompt(
      [
        `Venue Type: ${venue.venueType || venue.name}. Physical form: ${venue.form || "unspecified"}. Selected Zone: ${targetZone?.name || "Entrance"}. Used for: ${targetZone?.purpose || "arrival and approach"}. Appearance: ${venue.description}.`,
        basePrompt,
        character.includes("## Starting background:") ? `Occupant context: ${character}` : "",
      ],
      [
        character && !character.includes("## Starting background:")
          ? `Occupant context, reflect preferences without depicting people: ${character}`
          : "",
        village.setting ? `Village setting: ${village.setting.slice(0, 400)}` : "",
        ...village.worldFacts.map((fact) => `World fact: ${fact}`),
        lore ? `Established visual lore: ${lore}` : "",
        ...(exterior ? (venue.exteriorState?.items ?? []) : venue.state.furniture).map(
          (item) => `Visible physical detail: ${item}`,
        ),
        ...(exterior ? (venue.exteriorState?.publicFacts ?? []) : venue.state.publicFacts).map(
          (fact) => `Established area fact: ${fact}`,
        ),
      ],
      village.sceneryArtStyle,
    );
    const decoded = await generateVillageImage({
      connectionId,
      name: venue.name,
      prompt,
      negativePrompt: LOCATION_NEGATIVE_PROMPT,
      width: LOCATION_IMAGE_WIDTH,
      height: LOCATION_IMAGE_HEIGHT,
      maxBase64Length: MAX_LOCATION_IMAGE_BASE64_LENGTH,
    });
    const image = await uploadVillageGalleryImage({
      bytes: decoded.bytes,
      mime: decoded.mime,
      name: venue.name,
      prompt,
      width: LOCATION_IMAGE_WIDTH,
      height: LOCATION_IMAGE_HEIGHT,
    });
    return setVillageVenueImage(venueId, image, spaceClass, privateOwnerId, onlyIfEmpty, zoneId, expectedContext);
  }

  async function generateFirstPrivateSpaceImage(venueId: string, ownerId: string): Promise<void> {
    let claimed = false;
    let targetId = "";
    await mutateVillageState((state) => {
      claimed = false;
      const venue = state.venues.find((entry) => entry.id === venueId);
      const space =
        venue &&
        venueZones(venue).find(
          (entry) => entry.id === ownerId || (entry.kind === "private-residence" && entry.ownerId === ownerId),
        );
      if (
        !space?.seen ||
        !["private-residence", "staff", "restricted"].includes(space.kind) ||
        (space.kind === "private-residence" && space.ownerId === "player") ||
        space.image ||
        space.initialImageAttemptedAt ||
        space.preparation?.status === "pending" ||
        space.preparation?.status === "failed"
      )
        return;
      space.initialImageAttemptedAt = new Date().toISOString();
      targetId = space.id;
      claimed = true;
    });
    if (!claimed) return;
    try {
      await generateVillageLocationImage(venueId, undefined, undefined, "", true, targetId);
    } catch (error) {
      villagesLogger().warn("[villages] first private-space image failed for %s: %s", venueId, String(error));
    }
  }

  async function storeVillageVenueImage(
    venueId: string,
    dataUrl: unknown,
    spaceClass?: VillageVenueClass,
    privateOwnerId = "",
    zoneId?: string,
  ): Promise<VillageSnapshot> {
    const { venue } = await requireVenue(venueId);
    if (spaceClass && !venueClasses(venue).includes(spaceClass)) throw notFound("That Venue space no longer exists.");
    await assertVenueImageAccess(venueId, spaceClass, privateOwnerId, zoneId);
    const decoded = decodeImageDataUrl(dataUrl);
    const image = await uploadVillageGalleryImage({
      bytes: decoded.bytes,
      mime: decoded.mime,
      name: venue.name,
      prompt: "",
    });
    return setVillageVenueImage(venueId, image, spaceClass, privateOwnerId, false, zoneId);
  }

  return { generateVillageLocationImage, generateFirstPrivateSpaceImage, storeVillageVenueImage };
}
export type LocationImageService = ReturnType<typeof createLocationImages>;
