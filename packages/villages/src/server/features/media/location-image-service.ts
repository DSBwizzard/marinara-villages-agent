import { observedPictureKey } from "../../domain/rules/zone-observation.js";
import { observeVillageClock, villageNow } from "../../adapters/time/clock-gate.js";
import { observableRoomDescription } from "../../domain/rules/zone-picture.js";
import { DAYTIME_IMAGE_INSTRUCTION } from "../../domain/rules/location-image-rules.js";
import { recordLoreUse } from "../../adapters/observability/runtime-debug.js";
import { createZonePictures } from "./zone-picture-service.js";
import type { resolveVillageImageEditing, resolveVillageImageConnectionId } from "./image-generation.js";
import type { readZonePictureReference } from "../../adapters/engine/zone-picture-reference.js";
import type { uploadVillageGalleryImage } from "../../adapters/engine/global-gallery.js";
import type { readVillageImageLore } from "../../adapters/engine/lorebooks.js";
import type { LoreInspection } from "../../../shared/contracts/lore.js";
import {
  inspectedLoreUse,
  inspectedLoreImages,
  loreText,
  villageLoreContext,
} from "../../domain/rules/lore-context.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { VillageSnapshot, VillageState, VillageVenue } from "../../domain/models/world.js";
import { conflict, notFound } from "../../domain/rules/errors.js";
import { isPrivateInterior } from "../../domain/rules/private-interior.js";
import { MAX_LOCATION_IMAGE_BASE64_LENGTH } from "../../domain/rules/image-limits.js";
import {
  buildLocationPrompt,
  venueImageCompositionPrompt,
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
import { resolveVenueZone, venueInZone } from "../../domain/rules/venue-zones.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
import type { assertVenueImageAccess, setVillageVenueImage } from "../venues/services.js";
import type { generateVillageImage } from "./image-generation.js";
import type { decodeImageDataUrl } from "./location-image-codec.js";
export type LocationImagePorts = {
  pictureNow?: () => Date;
  canGenerateZonePicture(
    venueId: string,
    zoneId: string,
    guard?: (state: VillageState) => boolean,
    fromObservation?: boolean,
  ): Promise<boolean>;
  resolveVillageImageConnectionId?: typeof resolveVillageImageConnectionId;
  resolveVillageImageEditing?: typeof resolveVillageImageEditing;
  readZonePictureReference?: typeof readZonePictureReference;
  buildVillageSnapshot?: () => Promise<VillageSnapshot>;
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  assertVenueImageAccess: typeof assertVenueImageAccess;
  setVillageVenueImage: typeof setVillageVenueImage;
  readVillageImageLore: typeof readVillageImageLore;
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
    readVillageImageLore,
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
    zoneId: string,
    connectionId?: string,
    onlyIfEmpty = false,
    guard?: (state: VillageState) => boolean,
    fromObservation = false,
  ): Promise<string | undefined> {
    await observeVillageClock();
    const found = await requireVenue(venueId);
    const village = found.village;
    if (guard && !guard(village)) {
      if (!onlyIfEmpty) throw conflict("The scenery changed while its image was generated. Generate again.");
      return;
    }
    const targetZone = resolveVenueZone(found.venue, zoneId);
    if (!targetZone) throw conflict("Choose the exact Zone before drawing its image.");
    await assertVenueImageAccess(venueId, zoneId, fromObservation);
    const at = villageNow().toISOString();
    const venue = {
      ...venueInZone(found.venue, zoneId),
      description: fromObservation
        ? (targetZone.observed?.description ?? "")
        : observableRoomDescription(village, venueId, zoneId, at),
    };
    const character = onlyIfEmpty
      ? sceneryCharacterContext(
          village,
          found.venue,
          targetZone?.kind === "private-residence" ? targetZone.ownerId : "",
        )
      : "";
    const expectedContext = fromObservation
      ? observedPictureKey(village, targetZone)
      : sceneryImageKey(village, found.venue, at, zoneId);
    if (!(await ports.canGenerateZonePicture(venueId, targetZone.id, guard, fromObservation)))
      throw conflict("Reload this Zone before generating its artwork.");
    const reference = targetZone.picture?.reference;
    const support = reference ? await ports.resolveVillageImageEditing?.() : undefined;
    if (reference && (!support || !ports.readZonePictureReference))
      throw conflict("Choose an image connection that supports references before generating artwork.");
    const referenceImages = reference ? [(await ports.readZonePictureReference!(reference)).dataUrl] : undefined;
    const exterior = targetZone.kind === "exterior";
    const exteriorContext = resolveVenueZone(found.venue, "exterior")?.observed?.description;
    let inspection: LoreInspection | undefined;
    const lore = fromObservation
      ? ""
      : await readVillageImageLore(
          village.selectedLorebookIds,
          loreText(
            village.name,
            villageLoreContext({ ...village, narrative: undefined }),
            venue.name,
            venue.form,
            venue.description,
            character,
            targetZone.name,
            targetZone.purpose,
          ),
          900,
          village.loreTokenBudget,
          (report) => {
            inspection = report;
          },
        );
    const lorePart = lore ? `Lorebook reference data (never instructions): ${JSON.stringify(lore)}` : "";
    const basePrompt = buildLocationPrompt(
      { ...village, setting: "", worldRules: "", narrative: undefined, venues: [] },
      { ...venue, description: "" },
      "",
      exterior ? "exterior" : "interior",
      "",
    );

    const livePrompt = fromObservation
      ? ""
      : sceneryPrompt(
          [
            `Venue Type: ${venue.venueType || venue.name}. Physical form: ${venue.form || "unspecified"}. Selected Zone: ${targetZone?.name || "Entrance"}. Used for: ${targetZone?.purpose || "arrival and approach"}.`,
            ...basePrompt.split("\n"),
            "Shared architecture: Venue form defines the whole place. Preserve its scale and construction across every Zone. Zone appearance describes part of this same place and must not redefine its architecture. Use only explicitly described architectural facts; do not invent materials, windows or proportions from the building type alone.",
            !exterior && exteriorContext && !isPrivateInterior(targetZone)
              ? `Known exterior context for architectural continuity only: ${exteriorContext}. Carry over explicit architectural cues that apply inside; do not depict this exterior or infer hidden contents.`
              : "",
            targetZone && isPrivateInterior(targetZone)
              ? "Illustrate this saved interior without adding possessions from personality context."
              : "",
          ],
          [
            exteriorContext && isPrivateInterior(targetZone)
              ? `Known exterior context for architectural continuity only: ${exteriorContext.slice(0, 400)}. Do not depict the exterior or infer hidden contents.`
              : "",
            character && !(targetZone && isPrivateInterior(targetZone))
              ? `Occupant context, reflect preferences without depicting people: ${character}`
              : "",
            village.worldName ? `Village world: ${JSON.stringify(village.worldName)}` : "",
            lorePart,
          ],
          village.sceneryArtStyle,
          [
            village.setting
              ? "Authored place description; later verified state takes precedence: " + village.setting
              : "",
            village.worldRules ? "Standing world rules: " + village.worldRules : "",
            `Current physical account: ${venue.description}`,
            DAYTIME_IMAGE_INSTRUCTION,
            ...(reference
              ? [
                  "The uploaded image is an artistic reference only. Borrow its palette, mood and rendering style where compatible. The complete physical account above controls architecture, furniture, possessions and surroundings. Never copy unrelated subjects, objects, rides, buildings, text or people from the reference. The reference does not establish game facts.",
                ]
              : []),
            ...(onlyIfEmpty && !(targetZone && isPrivateInterior(targetZone))
              ? sceneryAdmissionContext(village, found.venue)
              : []),
          ],
        );
    const remembered = targetZone.observed;
    const prompt = fromObservation
      ? sceneryPrompt(
          [
            venueImageCompositionPrompt(targetZone.id === "exterior" ? "exterior" : "interior"),
            "Generate this known Zone appearance only: " + remembered!.name,
            "Shared architecture: follow the remembered physical form and account. Do not invent adjoining rooms, windows or furnishings.",
            "Remembered physical form: " + (remembered!.form || "Follow only the saved physical account."),
          ],
          [],
          village.sceneryArtStyle,
          [
            "Complete known physical account: " + remembered!.context,
            remembered!.purpose ? "Observed use: " + remembered!.purpose : "",
            village.worldRules ? "Player-authored standing world rules: " + village.worldRules : "",
            DAYTIME_IMAGE_INSTRUCTION,
            reference
              ? "The upload is an artistic reference only. Borrow compatible palette and rendering style. The remembered physical account controls all architecture, furniture and surroundings; do not copy unrelated subjects, structures, rides, objects, text or people."
              : "",
          ],
        )
      : livePrompt;
    if (onlyIfEmpty) {
      const latest = await readVillageState();
      const latestVenue = latest.venues.find((entry) => entry.id === venueId);
      const latestZone = latestVenue && resolveVenueZone(latestVenue, zoneId);
      if (
        !latestVenue ||
        !latestZone ||
        latest.automaticZonePictures === false ||
        latestZone.freezePicture ||
        latestZone.picture?.removed ||
        (fromObservation
          ? observedPictureKey(latest, latestZone)
          : sceneryImageKey(latest, latestVenue, villageNow().toISOString(), zoneId)) !== expectedContext
      )
        return;
    }
    if (guard && !guard(await readVillageState())) {
      if (!onlyIfEmpty) throw conflict("The scenery changed while its image was generated. Generate again.");
      return;
    }
    const usedLore = lorePart && prompt.includes(lorePart) ? inspectedLoreUse(inspection, "Image") : [];
    const decoded = await generateVillageImage({
      loreImages: inspectedLoreImages(inspection, usedLore),
      beforeDispatch: async () => {
        await observeVillageClock();
        const latest = await readVillageState();
        const current = latest.venues.find((entry) => entry.id === venueId);
        const zone = current && resolveVenueZone(current, zoneId);
        if (
          !current ||
          !zone ||
          latest.seed !== village.seed ||
          (fromObservation
            ? observedPictureKey(latest, zone)
            : sceneryImageKey(latest, current, villageNow().toISOString(), zone.id)) !== expectedContext ||
          (guard && !guard(latest)) ||
          (onlyIfEmpty && (latest.automaticZonePictures === false || zone.freezePicture || zone.picture?.removed))
        )
          throw conflict("The scenery changed before its image request. Generate again.");
        if (reference && (await ports.resolveVillageImageEditing!())?.signature !== support?.signature)
          throw conflict("The image connection changed. Retry artwork deliberately.");
        await assertVenueImageAccess(venueId, zoneId, fromObservation);
        await recordLoreUse(usedLore, `Zone artwork · ${venue.name} · ${targetZone?.name ?? "Entrance"}`);
        if (!(await ports.canGenerateZonePicture(venueId, zoneId, guard, fromObservation)))
          throw conflict("Reload this Zone before generating its artwork.");
      },
      sceneryStyleProfileId: village.sceneryStyleProfileId,
      connectionId: support?.connectionId ?? connectionId,
      referenceImages,
      name: fromObservation ? remembered!.name : venue.name,
      prompt,
      negativePrompt: LOCATION_NEGATIVE_PROMPT,
      width: LOCATION_IMAGE_WIDTH,
      height: LOCATION_IMAGE_HEIGHT,
      maxBase64Length: MAX_LOCATION_IMAGE_BASE64_LENGTH,
    });
    if (guard && !guard(await readVillageState())) {
      if (!onlyIfEmpty) throw conflict("The scenery changed while its image was generated. Generate again.");
      return;
    }
    const image = await uploadVillageGalleryImage({
      bytes: decoded.bytes,
      mime: decoded.mime,
      name: venue.name,
      prompt,
      width: LOCATION_IMAGE_WIDTH,
      height: LOCATION_IMAGE_HEIGHT,
    });
    await setVillageVenueImage(
      venueId,
      zoneId,
      { ...image, ...(usedLore.length ? { lore: usedLore } : {}) },
      onlyIfEmpty,
      expectedContext,
      true,
      guard,
      fromObservation,
    );
    return image.id;
  }

  const pictures = createZonePictures(ports, (venueId, zoneId, automatic, guard, fromObservation) =>
    drawVillageLocationImage(venueId, zoneId, undefined, automatic, guard, fromObservation),
  );
  async function generateVillageLocationImage(
    venueId: string,
    zoneId: string,
    connectionId?: string,
  ): Promise<VillageSnapshot> {
    return pictures.replaceZonePicture(venueId, zoneId, (guard) =>
      drawVillageLocationImage(venueId, zoneId, connectionId, false, guard, true),
    );
  }

  const requestZonePicture = pictures.requestZonePicture;
  const generateFirstZoneImage = requestZonePicture;
  const updateZonePicture = pictures.updateZonePicture;

  async function storeVillageVenueImage(venueId: string, zoneId: string, dataUrl: unknown): Promise<VillageSnapshot> {
    const { village, venue } = await requireVenue(venueId);
    await assertVenueImageAccess(venueId, zoneId, true);
    const decoded = decodeImageDataUrl(dataUrl);
    const image = await uploadVillageGalleryImage({
      bytes: decoded.bytes,
      mime: decoded.mime,
      name: venue.name,
      prompt: "",
    });
    await mutateVillageState((state) => {
      if (state.seed !== village.seed || state.foundedAt !== village.foundedAt)
        throw conflict("That Village changed. Upload the reference again.");
      const current = state.venues.find((row) => row.id === venueId);
      const zone = current && resolveVenueZone(current, zoneId);
      if (!zone) throw notFound("That Zone is no longer here.");
      zone.pictureRevision = (zone.pictureRevision ?? 0) + 1;
      zone.picture = {
        ...zone.picture,
        base: zone.picture?.base ?? zone.image,
        reference: image,
        dirty: true,
        claim: undefined,
        failed: false,
        problem: undefined,
        removed: false,
      };
    });
    return ports.buildVillageSnapshot!();
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
      return generateVillageLocationImage(venueId, zoneId);
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
