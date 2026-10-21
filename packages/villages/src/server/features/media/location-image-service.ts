import { villageNow } from "../../adapters/time/clock-gate.js";
import { createHash } from "node:crypto";
import { zonePictureBaseline, zonePictureChanges, zonePictureContext } from "../../domain/rules/zone-picture.js";
import { privateInteriorKey } from "../../domain/rules/private-interior.js";
import type { resolveVillageImageEditing } from "./image-generation.js";
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
import { venueClasses, venueInArea, venueInSpace } from "../../domain/rules/venue-model.js";
import { legacyZoneId, resolveVenueZone, venueInZone, venueZones } from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
import type { assertVenueImageAccess, setVillageVenueImage } from "../venues/services.js";
import type { generateVillageImage } from "./image-generation.js";
import type { decodeImageDataUrl } from "./location-image-codec.js";
export type LocationImagePorts = {
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
/** Access, private-entry claims, upload and current-context writes stay with one application. */
export function createLocationImages(ports: LocationImagePorts) {
  const activeClaims = new Set<string>();
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
            `${village.name}\n${village.worldName}\n${village.setting}\n${village.worldFacts.join("\n")}\n${exterior ? exteriorContext : `${venue.name}\n${venue.form}\n${venue.description}\n${venue.state.condition}`}\n${character}\n${targetZone?.name ?? ""}\n${targetZone?.purpose ?? ""}`,
            900,
            village.loreTokenBudget,
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
        `Venue Type: ${venue.venueType || venue.name}. Physical form: ${venue.form || "unspecified"}. Selected Zone: ${targetZone?.name || "Entrance"}. Used for: ${targetZone?.purpose || "arrival and approach"}.`,
        ...basePrompt.split("\n"),
        "Shared architecture: Venue form defines the whole place. Preserve its scale and construction across every Zone. Zone appearance describes part of this same place and must not redefine its architecture. Use only explicitly described architectural facts; do not invent materials, windows or proportions from the building type alone.",
        !exterior && !(targetZone && isPrivateInterior(targetZone))
          ? `Public exterior context for architectural continuity only: ${found.venue.description}. Carry over explicit architectural cues that apply inside; do not depict this exterior or infer hidden contents.`
          : "",
        targetZone && isPrivateInterior(targetZone)
          ? `Illustrate this saved interior without adding possessions from personality context. Visible items: ${targetZone.state.items.join("; ")}. Physical facts: ${targetZone.state.publicFacts.join("; ")}.`
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
        ...(targetZone && isPrivateInterior(targetZone)
          ? []
          : exterior
            ? (venue.exteriorState?.items ?? [])
            : venue.state.furniture
        ).map((item) => `Visible physical detail: ${item}`),
        ...(targetZone && isPrivateInterior(targetZone)
          ? []
          : exterior
            ? (venue.exteriorState?.publicFacts ?? [])
            : venue.state.publicFacts
        ).map((fact) => `Established area fact: ${fact}`),
      ],
      village.sceneryArtStyle,
      [
        village.setting ? "Authored place description; later verified state takes precedence: " + village.setting : "",
        ...village.worldFacts.map((fact) => "Current world fact: " + fact),
        "Current area condition: " + (exterior ? (venue.exteriorState?.condition ?? "") : venue.state.condition),
        ...(exterior ? (venue.exteriorState?.publicFacts ?? []) : venue.state.publicFacts).map(
          (fact) => "Current area fact: " + fact,
        ),
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
        state.automaticZonePictures === false ||
        space?.freezePicture ||
        space?.picture?.removed ||
        !space?.seen ||
        !["private-residence", "staff", "restricted"].includes(space.kind) ||
        space.image ||
        space.initialImageAttemptedAt ||
        space.preparation?.status === "pending" ||
        space.preparation?.status === "failed"
      )
        return;
      space.initialImageAttemptedAt = villageNow().toISOString();
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

  async function personalizeZoneOnEntry(venueId: string, zoneId: string, entryContext: string): Promise<void> {
    const { village, venue } = await requireVenue(venueId);
    const zone = resolveVenueZone(venue, zoneId);
    if (
      !zone ||
      village.automaticZonePictures === false ||
      zone.freezePicture ||
      zone.picture?.removed ||
      !zone.seen ||
      zone.preparation?.status === "pending" ||
      zone.preparation?.status === "failed" ||
      zonePictureContext(village, venue, zone) !== entryContext
    )
      return;
    if (!zone.image) {
      await generateFirstPrivateSpaceImage(venueId, zoneId);
      return;
    }
    if (!ports.resolveVillageImageEditing || !ports.readZonePictureReference) return;
    const support = await ports.resolveVillageImageEditing();
    if (!support || zone.picture?.context === entryContext) return;
    const source = zone.image,
      base = zone.picture?.base ?? source;
    const baseline = zone.picture?.baseline ?? zonePictureBaseline(entryContext);
    const changes = zonePictureChanges(zone.picture?.context ?? baseline, entryContext);
    if (changes === "{}") {
      await mutateVillageState((state) => {
        const currentVenue = state.venues.find((entry) => entry.id === venueId);
        const current = currentVenue && resolveVenueZone(currentVenue, zoneId);
        if (current?.image?.id === source.id && zonePictureContext(state, currentVenue!, current) === entryContext)
          current.picture = { ...current.picture, base, baseline, context: entryContext };
      });
      return;
    }
    const epoch = village.zonePictureEpoch ?? 0,
      revision = zone.pictureRevision ?? 0;
    const claim = createHash("sha256")
      .update(JSON.stringify([entryContext, source.id, base.id, support.signature, revision, epoch]))
      .digest("hex");
    let claimed = false;
    const valid = (state: VillageState) => {
      const currentVenue = state.venues.find((entry) => entry.id === venueId);
      const current = currentVenue && resolveVenueZone(currentVenue, zoneId);
      return state.seed === village.seed &&
        state.foundedAt === village.foundedAt &&
        state.automaticZonePictures !== false &&
        (state.zonePictureEpoch ?? 0) === epoch &&
        current &&
        !current.freezePicture &&
        (current.pictureRevision ?? 0) === revision &&
        current.image?.id === source.id &&
        zonePictureContext(state, currentVenue!, current) === entryContext
        ? current
        : undefined;
    };
    await mutateVillageState((state) => {
      claimed = false;
      const current = valid(state);
      if (!current) return;
      if (current.picture?.attempted === claim) {
        if (current.picture.claim && !activeClaims.has(claim)) current.picture.failed = true;
        return;
      }
      current.picture = { ...current.picture, base, baseline, attempted: claim, claim, failed: false };
      activeClaims.add(claim);
      claimed = true;
    });
    if (!claimed) return;
    try {
      const reference = await ports.readZonePictureReference(source);
      const references = [reference.dataUrl];
      if (support.multiple && base.id !== source.id)
        references.push((await ports.readZonePictureReference(base)).dataUrl);
      const prompt = [
        "Edit reference 1, the latest appearance of this exact Zone. Preserve its viewpoint, architecture, windows, doors, floor materials, furniture identities, colors, fabrics and unrelated decorations.",
        references.length > 1
          ? "Reference 2 is the original architectural anchor, not an instruction to remove later furnishings."
          : "",
        "Apply only the listed changes. Explicit renovations may change structure. Preserve everything else, including existing furniture colors and fabrics. Resident identity may inspire small decorative touches; no new major possessions or people. Match the existing art style.",
        `Changes: ${changes}`,
        `Current furniture and decoration continuity: ${JSON.stringify(zone.state.items)}`,
      ]
        .filter(Boolean)
        .join("\n");
      // Never omit physical changes and then claim the complete state was rendered.
      if (prompt.length > 4000) return;
      const before = await readVillageState();
      if (valid(before)?.picture?.claim !== claim) return;
      const currentSupport = await ports.resolveVillageImageEditing();
      if (currentSupport?.signature !== support.signature) return;
      const scale = Math.min(1, 2048 / Math.max(reference.width, reference.height));
      const decoded = await generateVillageImage({
        connectionId: support.connectionId,
        referenceImages: references,
        name: `${venue.name} · ${zone.name}`,
        prompt,
        width: Math.max(64, Math.round(reference.width * scale)),
        height: Math.max(64, Math.round(reference.height * scale)),
        maxBase64Length: MAX_LOCATION_IMAGE_BASE64_LENGTH,
      });
      if (valid(await readVillageState())?.picture?.claim !== claim) return;
      const image = await uploadVillageGalleryImage({
        bytes: decoded.bytes,
        mime: decoded.mime,
        name: `${venue.name} · ${zone.name}`,
        prompt,
      });
      await mutateVillageState((state) => {
        const current = valid(state);
        if (!current || current.picture?.claim !== claim) return;
        current.image = image;
        current.picture = { base, baseline, context: entryContext, attempted: claim };
        if (isPrivateInterior(current)) current.imageInteriorKey = privateInteriorKey(current);
      });
    } catch (error) {
      await mutateVillageState((state) => {
        const current = valid(state);
        if (current?.picture?.claim === claim) current.picture.failed = true;
      });
      villagesLogger().warn("[villages] Zone picture retained for %s/%s: %s", venueId, zoneId, String(error));
    } finally {
      activeClaims.delete(claim);
    }
  }

  async function retryZonePicture(venueId: string, zoneId: string): Promise<VillageSnapshot> {
    await assertVenueImageAccess(venueId, undefined, "", zoneId);
    let claimedRetry = false;
    await mutateVillageState((state) => {
      claimedRetry = false;
      const venue = state.venues.find((entry) => entry.id === venueId);
      const zone = venue && resolveVenueZone(venue, zoneId);
      if (!zone?.picture?.failed || (zone.picture.claim && activeClaims.has(zone.picture.claim))) return;
      zone.picture.attempted = undefined;
      zone.picture.failed = false;
      zone.pictureRevision = (zone.pictureRevision ?? 0) + 1;
      claimedRetry = true;
    });
    if (!claimedRetry) return ports.buildVillageSnapshot!();
    const { village, venue } = await requireVenue(venueId);
    const zone = resolveVenueZone(venue, zoneId);
    if (zone) await personalizeZoneOnEntry(venueId, zoneId, zonePictureContext(village, venue, zone));
    return ports.buildVillageSnapshot!();
  }

  return {
    generateVillageLocationImage,
    generateFirstPrivateSpaceImage,
    storeVillageVenueImage,
    setZonePictureFrozen,
    personalizeZoneOnEntry,
    retryZonePicture,
  };
}
export type LocationImageService = ReturnType<typeof createLocationImages>;
