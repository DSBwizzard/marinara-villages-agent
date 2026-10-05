import { sceneryImageKey, sceneryPrompt, sceneryCharacterContext } from "./scenery-context.js";
import { legacyZoneId, venueZones } from "./venue-zones.js";
import { venueInZone, resolveVenueZone } from "./venue-zones.js";
// Villages — how a place gets its picture.
//
// Two ways in, and the difference between them is the whole point of this file:
//
//   * `generateVillageLocationImage` asks the Engine's image connection to draw
//     one;
//   * `storeVillageVenueImage` keeps one the player already has.
//
// Exterior and shared-space drawings start with a player action. The first
// entry to a private space claims one persisted attempt and starts its drawing
// in the background. Later visits never repeat that automatic request.
//
// The drawing itself goes through the Engine's own avatar route rather than
// through any Engine service. That route is public on loopback, it already
// knows how to talk to every image connection the Engine supports, and it takes
// a `promptOverrides` entry that REPLACES the portrait prompt it would
// otherwise compile — which is the whole trick. A wide empty scene is sent
// through a route named for faces, and it arrives as a wide empty scene.
//
// Manual draw errors reach the player. The automatic private-room draw catches
// and logs failures, leaving the player a manual Draw image action.

import { notFound } from "./errors.js";
import { uploadVillageGalleryImage } from "./global-gallery.js";
import { decodeVillageImageDataUrl, generateVillageImage, imagePromptId } from "./image-generation.js";
import { readVillageVisualLore } from "./lorebooks.js";
import { MAX_VENUE_IMAGE_BYTES } from "./prompt-preset.js";
import { describeMoment, deriveVillageMoment } from "./village-clock.js";
import { readVillageState } from "./village-store.js";
import { mutateVillageState } from "./village-store.js";
import { villagesLogger } from "./package-runtime.js";
import { assertVenueImageAccess, setVillageVenueImage } from "./village.js";
import { venueInArea, venueInSpace, venueClasses } from "./venue-model.js";
import type { VillageMoment } from "./village-clock.js";
import type { VillageSnapshot, VillageState, VillageVenue, VillageVenueClass } from "./types.js";

/**
 * The shape of a place's picture.
 *
 * A wide landscape, because the picture is a room the conversation is held in:
 * it sits behind the chat surface and beside the character, so anything taller
 * than it is wide would be cropped into a strip of somebody's roof. 1216×832 is
 * the same shape the Engine ships its own scenery through, and it is under both
 * of the Engine's ceilings (4096 a side, 16 million pixels).
 */
const LOCATION_IMAGE_WIDTH = 1216;
const LOCATION_IMAGE_HEIGHT = 832;

/**
 * How much of the village's description is worth repeating back to the model.
 *
 * The setting can run to a couple of thousand characters and the picture only
 * needs to know what kind of place it is. Everything past this is cut rather
 * than refused: a description is the player's prose, not a field with a limit
 * they were shown.
 */
const MAX_SETTING_IN_PROMPT_LENGTH = 400;

/**
 * What must not be in a backdrop.
 *
 * The people are the point of the picture beside it — the character's own
 * portrait — and a crowd of strangers painted into the wall behind a
 * conversation is worse than an empty room. Lettering is refused for the same
 * reason the Engine refuses it everywhere: a model asked for a scene will
 * happily sign it.
 */
const LOCATION_NEGATIVE_PROMPT =
  "people, person, human, crowd, face, portrait, text, lettering, caption, signature, watermark, blurry, low quality";

/**
 * The gallery's own upload ceiling, held beside the other image caps so the
 * transport limit, the decoding limit and the number the settings panel shows
 * are one fact rather than three that agree today.
 */
export const MAX_LOCATION_IMAGE_BASE64_LENGTH = Math.ceil(MAX_VENUE_IMAGE_BYTES / 3) * 4;

/** The Engine's own avatar prompt id, built here exactly as the Engine builds it. */
export const avatarPromptId = imagePromptId;

/**
 * Which image connection the picture should be drawn with.
 *
 * Three steps, in the order the player would expect: what they picked for this
 * village, then what the agent itself was set up to draw with, then whatever
 * the Engine considers its default image connection. The last step exists
 * because the Engine's own default is not a fact this package can read — an
 * agent that has never been configured still has a working default connection,
 * and refusing to draw until somebody picks one would be a package inventing a
 * setup step the Engine does not have.
 *
 * An explicit id from the request wins outright, and is NOT checked here.
 * Whether it names a connection that draws images is the Engine's question and
 * the Engine answers it with a message worth reading, so asking twice would
 * only replace a good error with a worse one.
 *
 * `villagesConnectionIdFor` may legitimately answer null — for the chat
 * connections that means "let the Engine choose", but this route REQUIRES an
 * id, so the Engine's own list is consulted before giving up.
 */
/**
 * What the model is asked to draw for one place.
 *
 * Assembled from what the village already knows so the picture agrees with the
 * words beside it: a venue called "the mill pond" is drawn in a village whose
 * setting says it floods every spring, in the weather the village is currently
 * having. Nothing here is invented, and nothing here is a second call — the
 * moment was worked out from the clock for free.
 */
export function buildLocationPrompt(
  village: VillageState,
  venue: VillageVenue,
  moment: VillageMoment,
  lore = "",
  area: "exterior" | "interior" = "exterior",
  spaceLabel = "",
): string {
  const form = venue.form?.trim() ?? "";
  const setting = village.setting.trim().slice(0, MAX_SETTING_IN_PROMPT_LENGTH);
  const surrounding = village.venues
    .filter((place) => place.id !== venue.id)
    .slice(0, 8)
    .map((place) => place.name)
    .filter(Boolean)
    .join(", ");
  const building = venue.occupancy.homeKind ? village.homeBuildingNames[venue.occupancy.homeKind] : "";
  const outside = area === "exterior";
  const privateResidenceOutside = outside && venue.classes?.includes("residence") && venue.residentIds?.length;
  const condition = outside
    ? venue.exteriorState?.condition || (privateResidenceOutside ? "" : venue.state.condition)
    : venue.state.condition;
  const items = outside
    ? venue.exteriorState?.items?.length
      ? venue.exteriorState.items
      : privateResidenceOutside
        ? []
        : venue.state.furniture
    : venue.state.furniture;
  const facts = outside
    ? venue.exteriorState?.publicFacts?.length
      ? venue.exteriorState.publicFacts
      : privateResidenceOutside
        ? []
        : venue.state.publicFacts
    : venue.state.publicFacts;
  const approvedDescription = venue.description;
  return [
    area === "exterior"
      ? `A wide, empty exterior view of ${venue.name} and its approach in ${village.name}. Show its described entrance and approach, not its enterable interior. For a room within a larger place, the approach can be a corridor; do not invent a detached building or outdoor surroundings.`
      : `A wide, empty interior view of ${spaceLabel || "the described space"} at ${venue.name} in ${village.name}. Show the room from inside; do not show the building exterior.`,
    building ? `Building type: ${building}.` : "",
    venue.classes?.length ? `Venue roles: ${venue.classes.join(" and ")}.` : "",
    venue.layoutVersion === 1
      ? `Physical layout: ${JSON.stringify(venueZones(venue).map((zone) => ({ kind: zone.kind, role: zone.venueClass })))}. Do not invent absent or adjoining interiors, or reveal private contents outside this depicted area.`
      : "",
    venue.occupancy.residentCharacterId && !building ? "This venue is also a villager's residence." : "",
    form ? `Venue form: ${form}.` : "",
    approvedDescription
      ? `Approved description of this ${outside ? "venue (show exterior cues only)" : "space"}: ${approvedDescription}.`
      : "",
    condition ? `Current condition: ${condition}.` : "",
    items.length ? `Visible ${outside ? "exterior details" : "furniture and items"}: ${items.join(", ")}.` : "",
    facts.length ? `Established venue facts: ${facts.join("; ")}.` : "",
    venue.state.upgrades.length ? `Approved improvements: ${venue.state.upgrades.join(", ")}.` : "",
    setting.length > 0 ? `Village setting and theme: ${setting}.` : "",
    village.worldFacts.length ? `Current world facts: ${village.worldFacts.join("; ")}.` : "",
    surrounding ? `Other known places in the village: ${surrounding}.` : "",
    lore ? `Established visual lore: ${lore}.` : "",
    `It is ${describeMoment(moment)}, and the weather is ${moment.weather}.`,
    `Honor these facts and do not invent conflicting architecture, technology or geography. ${village.sceneryArtStyle ? "Background scenery" : "Painted background art"} for a story: no people, no animals, no text, no lettering, no watermark.`,
  ]
    .filter((part) => part.length > 0)
    .join(" ")
    .trim();
}

/** One decoded picture: what it is, and its bytes. */
/**
 * Pull the bytes out of a base64 image data url.
 *
 * Strict on purpose. The string is about to be posted to the Engine, which
 * checks a file's magic bytes against its extension and refuses the pair when
 * they disagree, so a value that is not cleanly a base64 image is refused here
 * where the reason can be said plainly. The length is checked before anything
 * is decoded, so an absurd payload costs a comparison rather than a copy of
 * itself in memory.
 */
export function decodeImageDataUrl(value: unknown) {
  return decodeVillageImageDataUrl(value, {
    label: "place picture",
    maxBase64Length: MAX_LOCATION_IMAGE_BASE64_LENGTH,
    tooLargeMessage: `A place's picture can be at most ${Math.round(MAX_VENUE_IMAGE_BYTES / 1_000_000)} MB of image data.`,
  });
}

/** The place we were asked about, or a clear refusal. */
async function requireVenue(venueId: string): Promise<{ village: VillageState; venue: VillageVenue }> {
  const village = await readVillageState();
  const venue = village.venues.find((entry) => entry.id === venueId);
  if (!venue) throw notFound("That place is no longer in the village.");
  return { village, venue };
}

/**
 * Draw a place's picture and keep it.
 *
 * The venue is looked up before the connection is, so a place that was deleted
 * while the settings panel was open is refused in a microsecond instead of
 * after a twenty-second generation that had nowhere to go. Nothing is drawn
 * until an id is in hand and still real.
 */
export async function generateVillageLocationImage(
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
      ? venueZones(found.venue).find((zone) => zone.kind === "private-residence" && zone.ownerId === privateOwnerId)
      : undefined;
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
  const exterior = zoneId ? resolveVenueZone(found.venue, zoneId)?.kind === "exterior" : !spaceClass && !privateOwnerId;
  const exteriorContext = [venue.name, venue.form, venue.description, venue.exteriorState?.condition ?? ""].join("\n");
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
    [basePrompt, character.includes("## Starting background:") ? `Occupant context: ${character}` : ""],
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

/** One automatic drawing after the player first enters this particular Private Space. */
export async function generateFirstPrivateSpaceImage(venueId: string, ownerId: string): Promise<void> {
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

/**
 * Keep a picture the player already has.
 *
 * The same road as generation past the drawing: whatever arrives here is
 * uploaded to the gallery and referenced, never stored in the village document.
 * That is what keeps a village with twenty photographed places as small as one
 * with none.
 */
export async function storeVillageVenueImage(
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
