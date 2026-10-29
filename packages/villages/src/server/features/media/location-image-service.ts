import { villageNow } from "../../adapters/time/clock-gate.js";
import { createZonePictures } from "./zone-picture-service.js";
import type { resolveVillageImageEditing, resolveVillageImageConnectionId } from "./image-generation.js";
import type { readZonePictureReference } from "../../adapters/engine/zone-picture-reference.js";
import type { uploadVillageGalleryImage } from "../../adapters/engine/global-gallery.js";
import type { readVillageVisualLore } from "../../adapters/engine/lorebooks.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { VillageSnapshot, VillageState, VillageVenue, VillageVenueClass } from "../../domain/models/world.js";
import { conflict, notFound } from "../../domain/rules/errors.js";
import { isPrivateInterior } from "../../domain/rules/private-interior.js";
import { MAX_LOCATION_IMAGE_BASE64_LENGTH } from "../../domain/rules/image-limits.js";
import {
  buildLocationPrompt,
  LOCATION_IMAGE_WIDTH,
  LOCATION_IMAGE_HEIGHT,
  LOCATION_NEGATIVE_PROMPT,
} from "../../domain/rules/location-image-rules.js";
import {
  sceneryAdmissionContext,
  sceneryCharacterContext,
  sceneryImageKey,
  sceneryPrompt,
} from "../../domain/rules/scenery-context.js";
import { venueClasses } from "../../domain/rules/venue-model.js";
import { legacyZoneId, resolveVenueZone, venueInZone } from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
import type { assertVenueImageAccess, setVillageVenueImage } from "../venues/services.js";
import type { generateVillageImage } from "./image-generation.js";
import type { decodeImageDataUrl } from "./location-image-codec.js";
export type LocationImagePorts = {
  pictureNow?: () => Date;
  resolveVillageImageConnectionId?: typeof resolveVillageImageConnectionId;
  resolveVillageImageEditing?: typeof resolveVillageImageEditing;
  readZonePictureReference?: typeof readZonePictureReference;
  buildVillageSnapshot?: () => Promise<VillageSnapshot>;
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
/** Image access, serialized requests, uploads and current-context writes share one activation. */
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
  } = ports;

  async function requireVenue(venueId: string): Promise<{ village: VillageState; venue: VillageVenue }> {
    const village = await readVillageState();
    const venue = village.venues.find((entry) => entry.id === venueId);
    if (!venue) throw notFound("That place is no longer in the village.");
    return { village, venue };
  }

  async function drawVillageLocationImage(
    venueId: string,
    connectionId?: string,
    spaceClass?: VillageVenueClass,
    privateOwnerId = "",
    onlyIfEmpty = false,
    zoneId?: string,
    guard?: (state: VillageState) => boolean,
  ): Promise<VillageSnapshot> {
    const found = await requireVenue(venueId);
    const village = found.village;
    if (guard && !guard(village)) {
      if (!onlyIfEmpty) throw conflict("The scenery changed while its image was generated. Generate again.");
      return ports.buildVillageSnapshot ? ports.buildVillageSnapshot() : ({} as VillageSnapshot);
    }
    if (spaceClass && !venueClasses(found.venue).includes(spaceClass))
      throw notFound("That Venue space no longer exists.");
    zoneId ??= legacyZoneId(
      found.venue,
      privateOwnerId ? "private" : spaceClass === "residence" ? "shared" : spaceClass ? "public" : "outside",
      spaceClass,
      privateOwnerId,
    );
    const targetZone = resolveVenueZone(found.venue, zoneId);
    if (!targetZone) throw conflict("Choose the exact Zone before drawing its image.");
    await assertVenueImageAccess(venueId, spaceClass, privateOwnerId, zoneId);
    const venue = venueInZone(found.venue, zoneId);
    const character = onlyIfEmpty
      ? sceneryCharacterContext(
          village,
          found.venue,
          targetZone?.kind === "private-residence" ? targetZone.ownerId : "",
        )
      : "";
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
      now: villageNow(),
    });
    const exterior = targetZone.kind === "exterior";
    const exteriorContext = [venue.name, venue.form, venue.description].join("\n");
    const lore =
      (found.venue.imageContext?.useVisualLore ?? village.useVisualLoreByDefault)
        ? await readVillageVisualLore(
            village.selectedLorebookIds,
            `${village.name}\n${village.worldName}\n${village.setting}\n${village.worldFacts.join("\n")}\n${exterior ? exteriorContext : `${venue.name}\n${venue.form}\n${venue.description}`}\n${character}\n${targetZone?.name ?? ""}\n${targetZone?.purpose ?? ""}`,
            900,
            village.loreTokenBudget,
          )
        : "";
    const basePrompt = buildLocationPrompt(
      { ...village, setting: "", worldFacts: [], venues: [] },
      { ...venue, description: "" },
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
        `Venue Type: ${venue.venueType || venue.name}. Physical form: ${venue.form || "unspecified"}. Selected Zone: ${targetZone?.name || "Entrance"}. Used for: ${targetZone?.purpose || "arrival and approach"}.`,
        ...basePrompt.split("\n"),
        "Shared architecture: Venue form defines the whole place. Preserve its scale and construction across every Zone. Zone appearance describes part of this same place and must not redefine its architecture. Use only explicitly described architectural facts; do not invent materials, windows or proportions from the building type alone.",
        !exterior && !(targetZone && isPrivateInterior(targetZone))
          ? `Public exterior context for architectural continuity only: ${found.venue.description}. Carry over explicit architectural cues that apply inside; do not depict this exterior or infer hidden contents.`
          : "",
        targetZone && isPrivateInterior(targetZone)
          ? "Illustrate this saved interior without adding possessions from personality context."
          : "",
      ],
      [
        targetZone && isPrivateInterior(targetZone) && targetZone.roomSpecification
          ? `Known room specification: ${targetZone.roomSpecification}.`
          : "",
        targetZone && isPrivateInterior(targetZone)
          ? `Public exterior context for architectural continuity only: ${found.venue.description.slice(0, 400)}. Do not depict the exterior or infer hidden contents.`
          : "",
        character && !(targetZone && isPrivateInterior(targetZone))
          ? `Occupant context, reflect preferences without depicting people: ${character}`
          : "",
        village.worldName ? `Village world: ${JSON.stringify(village.worldName)}` : "",
        lore ? `Established visual lore: ${lore}` : "",
      ],
      village.sceneryArtStyle,
      [
        village.setting ? "Authored place description; later verified state takes precedence: " + village.setting : "",
        ...village.worldFacts.map((fact) => "Current world fact: " + fact),
        `Current physical account: ${venue.description}`,
        ...(onlyIfEmpty && !(targetZone && isPrivateInterior(targetZone))
          ? sceneryAdmissionContext(village, found.venue)
          : []),
      ],
    );
    if (onlyIfEmpty) {
      const latest = await readVillageState();
      const latestVenue = latest.venues.find((entry) => entry.id === venueId);
      const latestZone = latestVenue && zoneId && resolveVenueZone(latestVenue, zoneId);
      if (
        !latestVenue ||
        !latestZone ||
        latest.automaticZonePictures === false ||
        latestZone.freezePicture ||
        latestZone.picture?.removed ||
        sceneryImageKey(latest, latestVenue, zoneId) !== expectedContext
      )
        return ports.buildVillageSnapshot!();
    }
    if (guard && !guard(await readVillageState())) {
      if (!onlyIfEmpty) throw conflict("The scenery changed while its image was generated. Generate again.");
      return ports.buildVillageSnapshot ? ports.buildVillageSnapshot() : ({} as VillageSnapshot);
    }
    const decoded = await generateVillageImage({
      sceneryStyleProfileId: village.sceneryStyleProfileId,
      connectionId,
      name: venue.name,
      prompt,
      negativePrompt: LOCATION_NEGATIVE_PROMPT,
      width: LOCATION_IMAGE_WIDTH,
      height: LOCATION_IMAGE_HEIGHT,
      maxBase64Length: MAX_LOCATION_IMAGE_BASE64_LENGTH,
    });
    if (guard && !guard(await readVillageState())) {
      if (!onlyIfEmpty) throw conflict("The scenery changed while its image was generated. Generate again.");
      return ports.buildVillageSnapshot ? ports.buildVillageSnapshot() : ({} as VillageSnapshot);
    }
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

  const pictures = createZonePictures(ports, (venueId, zoneId, automatic, guard) =>
    drawVillageLocationImage(venueId, undefined, undefined, "", automatic, zoneId, guard),
  );
  async function generateVillageLocationImage(...args: Parameters<typeof drawVillageLocationImage>) {
    const { venue } = await requireVenue(args[0]);
    const targetId =
      args[5] ??
      legacyZoneId(
        venue,
        args[3] ? "private" : args[2] === "residence" ? "shared" : args[2] ? "public" : "outside",
        args[2],
        args[3],
      );
    return (await pictures.replaceZonePicture(args[0], targetId, (guard) =>
      drawVillageLocationImage(args[0], args[1], args[2], args[3], args[4], args[5], guard),
    )) as VillageSnapshot;
  }

  const requestZonePicture = pictures.requestZonePicture;
  const generateFirstZoneImage = requestZonePicture;
  const updateZonePicture = pictures.updateZonePicture;

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

  async function setZonePictureFrozen(venueId: string, zoneId: string, frozen: boolean): Promise<VillageSnapshot> {
    await mutateVillageState((state) => {
      const venue = state.venues.find((entry) => entry.id === venueId);
      const zone = venue && resolveVenueZone(venue, zoneId);
      if (!zone) throw notFound("That Zone is no longer here.");
      zone.freezePicture = frozen;
      zone.pictureRevision = (zone.pictureRevision ?? 0) + 1;
      if (zone.picture) zone.picture.claim = undefined;
    });
    return ports.buildVillageSnapshot!();
  }

  async function retryZonePicture(venueId: string, zoneId: string): Promise<VillageSnapshot> {
    const { venue } = await requireVenue(venueId);
    if (!resolveVenueZone(venue, zoneId)?.picture?.failed) return ports.buildVillageSnapshot!();
    if (resolveVenueZone(venue, zoneId)?.picture?.operation === "replace")
      return generateVillageLocationImage(venueId, undefined, undefined, "", false, zoneId);
    return updateZonePicture(venueId, zoneId);
  }

  return {
    generateVillageLocationImage,
    generateFirstZoneImage,
    storeVillageVenueImage,
    setZonePictureFrozen,
    requestZonePicture,
    updateZonePicture,
    retryZonePicture,
  };
}
export type LocationImageService = ReturnType<typeof createLocationImages>;
