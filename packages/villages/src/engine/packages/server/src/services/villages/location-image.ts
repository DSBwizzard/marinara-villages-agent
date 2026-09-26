// Villages — how a place gets its picture.
//
// Two ways in, and the difference between them is the whole point of this file:
//
//   * `generateVillageLocationImage` asks the Engine's image connection to draw
//     one;
//   * `storeVillageVenueImage` keeps one the player already has.
//
// NEITHER of them runs on its own. There is no hook on venue creation, no call
// from the remap, no call from the tick and no timer anywhere below this line,
// because a picture costs the player money and a place they have not looked at
// yet is not a reason to spend it. Generation happens when somebody presses the
// button, and the button is the only thing in the package that reaches the
// first function.
//
// The drawing itself goes through the Engine's own avatar route rather than
// through any Engine service. That route is public on loopback, it already
// knows how to talk to every image connection the Engine supports, and it takes
// a `promptOverrides` entry that REPLACES the portrait prompt it would
// otherwise compile — which is the whole trick. A wide empty scene is sent
// through a route named for faces, and it arrives as a wide empty scene.
//
// ponytail: errors from here are allowed to reach the player. They pressed a
// button and waited, so "The Engine refused …: no connection key" is worth
// more than a shrug. A caller that ran WITHOUT anybody pressing anything would
// have to swallow them instead — and there is deliberately no such caller.

import { notFound } from "./errors.js";
import { uploadVillageGalleryImage } from "./global-gallery.js";
import { decodeVillageImageDataUrl, generateVillageImage, imagePromptId } from "./image-generation.js";
import { readVillageVisualLore } from "./lorebooks.js";
import { MAX_VENUE_IMAGE_BYTES } from "./prompt-preset.js";
import { describeMoment, deriveVillageMoment } from "./village-clock.js";
import { readVillageState } from "./village-store.js";
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
): string {
  const purpose = venue.purpose.trim();
  const setting = village.setting.trim().slice(0, MAX_SETTING_IN_PROMPT_LENGTH);
  const surrounding = village.venues
    .filter((place) => place.id !== venue.id)
    .slice(0, 8)
    .map((place) => place.name)
    .filter(Boolean)
    .join(", ");
  const building = venue.occupancy.homeKind ? village.homeBuildingNames[venue.occupancy.homeKind] : "";
  return [
    area === "exterior"
      ? `A wide, empty exterior view of ${venue.name} and its approach in ${village.name}. Show the building from outside; do not show an interior.`
      : `A wide, empty interior view of the described space at ${venue.name} in ${village.name}. Show the room from inside; do not show the building exterior.`,
    building ? `Building type: ${building}.` : "",
    venue.occupancy.residentCharacterId && !building ? "This venue is also a villager's residence." : "",
    purpose ? `Venue purpose: ${purpose}.` : "",
    venue.description
      ? `Approved description of this ${area === "exterior" ? "exterior" : "space"}: ${venue.description}.`
      : "",
    venue.state.condition ? `Current condition: ${venue.state.condition}.` : "",
    venue.state.furniture.length ? `Visible furniture and items: ${venue.state.furniture.join(", ")}.` : "",
    venue.state.publicFacts.length ? `Established venue facts: ${venue.state.publicFacts.join("; ")}.` : "",
    venue.state.upgrades.length ? `Approved improvements: ${venue.state.upgrades.join(", ")}.` : "",
    setting.length > 0 ? `Village setting and theme: ${setting}.` : "",
    village.foundingDetails ? `Founding context: ${village.foundingDetails.slice(0, 250)}.` : "",
    surrounding ? `Other known places in the village: ${surrounding}.` : "",
    lore ? `Established visual lore: ${lore}.` : "",
    `It is ${describeMoment(moment)}, and the weather is ${moment.weather}.`,
    "Honor these facts and do not invent conflicting architecture, technology or geography. Painted background art for a story: no people, no animals, no text, no lettering, no watermark.",
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
): Promise<VillageSnapshot> {
  const found = await requireVenue(venueId);
  const village = found.village;
  if (spaceClass && !venueClasses(found.venue).includes(spaceClass))
    throw notFound("That Venue space no longer exists.");
  await assertVenueImageAccess(venueId, spaceClass, privateOwnerId);
  const venue = privateOwnerId
    ? venueInArea(found.venue, "private", "residence", privateOwnerId)
    : spaceClass
      ? venueInSpace(found.venue, spaceClass)
      : venueInArea(found.venue, "outside");
  const moment = deriveVillageMoment({
    foundedAt: village.foundedAt,
    seed: village.seed,
    now: new Date(),
  });
  const lore = await readVillageVisualLore(
    village.selectedLorebookIds,
    `${village.name}\n${village.setting}\n${village.foundingDetails}\n${venue.name}\n${venue.purpose}\n${venue.description}\n${venue.state.condition}`,
    300,
  );
  const prompt = buildLocationPrompt(
    village,
    venue,
    moment,
    lore,
    spaceClass || privateOwnerId ? "interior" : "exterior",
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
  return setVillageVenueImage(venueId, image, spaceClass, privateOwnerId);
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
): Promise<VillageSnapshot> {
  const { venue } = await requireVenue(venueId);
  if (spaceClass && !venueClasses(venue).includes(spaceClass)) throw notFound("That Venue space no longer exists.");
  await assertVenueImageAccess(venueId, spaceClass, privateOwnerId);
  const decoded = decodeImageDataUrl(dataUrl);
  const image = await uploadVillageGalleryImage({
    bytes: decoded.bytes,
    mime: decoded.mime,
    name: venue.name,
    prompt: "",
  });
  return setVillageVenueImage(venueId, image, spaceClass, privateOwnerId);
}
