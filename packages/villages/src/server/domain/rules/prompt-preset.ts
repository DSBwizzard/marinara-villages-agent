import { RESIDENT_CONTINUITY_RULE } from "../../../shared/helpers/resident-admission.js";
import type { TownMapFit, VillageTownMapView, VillageVenue } from "../models/world.js";
import { asTrimmedString } from "./coerce.js";
import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { hasVenueClass } from "./venue-model.js";
/** Bound venue event text and decision titles. */
export const MAX_EVENT_TEXT_LENGTH = 280;
/** Bound saved requester names. */
export const MAX_REQUESTER_NAME_LENGTH = 60;

/** Maximum narration length for a committed physical change. */
export const MAX_PHYSICAL_NARRATION_LENGTH = 320;

/** Recent physical changes; exchange receipts retain durable proof. */
export const MAX_VENUE_EVENTS = 200;
/** Matches the Engine generate schema's bounded submissionId field. */
export const MAX_SUBMISSION_ID_LENGTH = 100;
/** How long the village's fallback line about an ordinary day may be. */
export const MAX_ROUTINE_SUMMARY_LENGTH = 240;
/**
 * How much of the Engine's week one translation may cover, and how long each
 * field of an entry may be.
 *
 * The move list is a LOOKUP TABLE keyed by `day|time`, so its cap is a cap on how
 * many BLOCKS of one character's week the village is willing to ask about. A week
 * is seven days of a handful of blocks each, which lands near fifty; eighty is a
 * ceiling on a week nobody has, and it is set that high because of what a miss
 * costs: a block past this cap has no move, so it renders as the village's own
 * default and the plan says the same nothing for that stretch of somebody's day.
 *
 * ponytail: eighty blocks in one week is past the point where more cap would
 * help, and a week that somehow exceeds it loses the tail of its list — the last
 * day or so of the week reads as the village's default. Ceiling accepted because
 * the alternative — a targeted follow-up call asking only for the keys the first
 * answer omitted — is a second model call path for a shape of schedule the Engine
 * does not generate. Upgrade path if it ever turns up: keep this cap, and ask
 * again for exactly the missing keys, merging into the same table rather than
 * re-asking the whole question.
 *
 * The length caps are separate because the fields answer different questions.
 * `activity` is a copy of the Engine's own sentence and only has to be long
 * enough to be copied back exactly; it is never shown to anybody. `here` is the
 * sentence a villager and the narrator actually read, so it is capped at the same
 * length as an ordinary-day line. `MAX_REMAP_SLOT_LENGTH` bounds the day and the
 * hour range an answer names before they are turned into a key — not because a
 * real weekday or hour range is ever long, but because the key is built by
 * string work on a model's answer and this is the cheapest place to stop a
 * paragraph being treated as a timestamp.
 *
 * A full week of half-hour waking activity can exceed two hundred slots, so
 * stored moves must fit the whole week even though model calls use small batches.
 */
export const MAX_REMAP_MOVES = 512;
export const MAX_REMAP_SLOT_LENGTH = 40;
export const MAX_REMAP_ACTIVITY_LENGTH = 200;
export const MAX_REMAP_HERE_LENGTH = 200;
/**
 * How long a Persona id the village will remember.
 *
 * An id is not a name: it is the Engine's own key, so it is never shown and the
 * cap is only here to stop a hand-edited record carrying a paragraph where a
 * key belongs. It is generous next to the uuids the Engine issues so a longer
 * scheme would not silently truncate into a dead link.
 */
export const MAX_PLAYER_PERSONA_ID_LENGTH = 128;
/**
 * How much of a Persona the village will copy down.
 *
 * The village keeps its own copy of the name and the identity so an ordinary
 * chat turn never touches the Persona library, and it re-reads that copy when
 * the tab opens and writes only when the copy DIFFERS from the source. A
 * truncating ceiling would therefore make the copy and its source disagree for
 * good, which is a write on every single tab open, so these caps are sized to
 * hold a whole Persona rather than to bound what a Persona may be.
 */
export const MAX_PLAYER_PERSONA_NAME_LENGTH = 80;
export const MAX_PLAYER_PERSONA_IDENTITY_LENGTH = 8_000;
/** How much of the world the player may write. One paragraph, not a wiki. */
export const MAX_SETTING_LENGTH = 4_096;
/** How long the village's own name may be. */
export const MAX_VILLAGE_NAME_LENGTH = 60;

/** How much a place may say about itself. */
export const MAX_VENUE_NAME_LENGTH = 60;
export const MAX_VENUE_NOTE_LENGTH = 240;
export const MAX_VENUE_DESCRIPTION_LENGTH = 4_000;

/**
 * How many places a village holds, and how many of them a villager may be SENT
 * to. Two numbers rather than one, because they answer two different questions:
 * a village holds a house for everybody who lives in it as well as the places
 * they go, so what the map can show is a larger list than what one translation
 * prompt can usefully read.
 *
 * The four houses a village is founded with therefore take up room on the map
 * without taking any of the translator's budget, because a house is not one of
 * the places a villager is sent to — see `remapVenues`.
 */
export const MAX_PLACES = 48;

/**
 * The places a villager may be SENT to: everything the village holds except the
 * houses people live in.
 *
 * This is the one list the translation prompt is shown and the one list
 * `remapSignature` digests, and both read it from HERE rather than filtering for
 * themselves — which is the whole of what keeps the numbered list the model is
 * handed and the signature stored beside its answer from ever disagreeing.
 * Filtering at each call site instead would be two answers to one question, and
 * the failure would be silent: a translation argued over a different list than
 * the one it was written from is a translation that re-asks forever.
 *
 * A home is excluded because it is not a destination. It is where somebody is
 * when nothing has sent them anywhere, which the village already answers with
 * its own fallback — so numbering the houses would hand the model a set of
 * places whose only honest reading is "at home", and would put four identically
 * named buildings into a list whose uniqueness is enforced by name.
 */
export function remapVenues(venues: readonly VillageVenue[]): VillageVenue[] {
  return venues.filter(
    (venue) =>
      venue.constructionStatus !== "worksite" &&
      (venue.classes?.length ? venue.classes.some((venueClass) => venueClass !== "residence") : !isHousePlace(venue)),
  );
}

/**
 * Whether a place is a house — somebody's home, or a building that is one of the
 * kinds the village builds houses out of.
 *
 * This is the ONE place the house/place line is drawn, and every reader that
 * needs it draws it here rather than deciding for itself: the translation list,
 * the room a villager is drawn in, the founding flow's count of the houses the
 * wizard placed, and whether a place is even allowed to be nameless. Two
 * readings of one question is how a village ends up disagreeing with itself
 * about who lives where, and the disagreement is silent — a place listed as a
 * destination that also has somebody living in it looks like nothing at all
 * until the translation it went into is thrown away and asked for again.
 *
 * A BUILDING counts, not only an occupant, because an empty house is still a
 * house: the wizard asks for four houses on the map and the player may fill them
 * in later, so a house nobody has moved into yet must not become a place the
 * model can send somebody to. Today every kind in `HOME_BUILDINGS` is housing,
 * which is why the building alone settles it; that constant's `category` is what
 * to read on the day a kind that is not a house is added.
 *
 * Read as "does this place SAY it is a house" rather than "is this place a
 * house", and the difference is the failure it prevents. Every place the store
 * hands out has been through `coerceVenue`, so nothing the village reads back is
 * missing a field. But an object that says NOTHING is read as a place you can go,
 * because the two mistakes are not the same size: dropping a destination out of
 * this list shortens the prompt the model is shown and lengthens the digest
 * beside it, which re-asks every villager for a translation the moment they next
 * speak, while keeping a house in the list only offers the model a destination
 * whose only reading is "at home".
 */
export function isHousePlace(place: Pick<VillageVenue, "occupancy" | "classes">): boolean {
  return hasVenueClass(place, "residence");
}

/**
 * Where a village files the pictures it has made.
 *
 * One folder rather than the gallery root, because "which of these did the
 * village draw?" is a question a player will actually ask of their own gallery
 * and a folder is the answer the Engine already has a control for. The name is
 * matched rather than the folder being remembered by id: the player may rename
 * or delete the folder, and a village that kept an id would go on uploading to
 * a folder that is gone.
 */
export const VILLAGES_GALLERY_FOLDER_NAME = "Villages";

/**
 * The prefix the Engine marks a gallery reference with inside stored data.
 *
 * Matching the Engine's own spelling is what makes the reference durable: the
 * Engine walks every package document looking for this exact string, and it
 * refuses to unlink a file that something still points at. A reference written
 * in any other shape would be a dangling link the Engine cannot see, and the
 * player would be free to delete a picture their village is still showing.
 */
export const GLOBAL_GALLERY_REF_PREFIX = "global-gallery:";

/**
 * The longest gallery id, and the longest URL, a village will store.
 *
 * Ids are keys and URLs come from the gallery, so neither is prose and neither
 * is capped for legibility — these are only here so a hand-edited document
 * cannot put a paragraph where a reference belongs. The id cap is generous
 * against the 21-character ids the Engine actually issues so a longer scheme
 * would not silently truncate into a dead reference.
 */
export const MAX_VENUE_IMAGE_ID_LENGTH = 128;
export const MAX_VENUE_IMAGE_URL_LENGTH = 512;

/**
 * How large a picture of a place may be, in bytes of image data.
 *
 * This is the Engine's own gallery ceiling, repeated here rather than imported,
 * because it is the number the TAB has to know before it sends anything: a
 * picture that is too large should be refused with both sizes in the message
 * rather than uploaded and refused at the other end. Keeping it beside the
 * other image caps is what stops the two from drifting apart.
 */
export const MAX_VENUE_IMAGE_BYTES = 20 * 1024 * 1024;

/**
 * A reference is the prefix and an id, nothing else.
 *
 * Anchored at both ends on purpose: `startsWith` alone would accept a
 * hand-edited document whose "id" is a path, a query string, or a second
 * reference. The character class is the one the Engine's own ids are drawn
 * from, so a legitimate id can never fail it.
 */
const GLOBAL_GALLERY_REF_PATTERN = /^global-gallery:[A-Za-z0-9_-]+$/;

/** The reference for a gallery image id, written the way the Engine reads it. */
export function globalGalleryRef(id: string): string {
  return `${GLOBAL_GALLERY_REF_PREFIX}${id}`;
}

/** Whether a stored or submitted value is a gallery reference this village can resolve. */
export function isGlobalGalleryRef(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= MAX_VENUE_IMAGE_ID_LENGTH + GLOBAL_GALLERY_REF_PREFIX.length &&
    GLOBAL_GALLERY_REF_PATTERN.test(value)
  );
}

/**
 * How many places the founding flow asks the player to place. Four is a starting
 * shape rather than a limit: one for the player and three for the villagers
 * who move in, with `MAX_PLACES` leaving room for a village to grow past its
 * founding.
 */
export const SETUP_MIN_VILLAGER_COUNT = 1;
export const SETUP_MAX_VILLAGER_COUNT = 3;

/**
 * What a building on the map IS.
 *
 * Every home is a `small-home` today and there is deliberately no picker: the
 * founding flow has no business asking a player to invent architecture before
 * they have a village, so a building is a fact the village holds rather than a
 * question it asks. It is held rather than assumed because the customized
 * places coming later — the player's own first, the model's after — are the
 * same pin on the map with a different building under it, and the class is kept
 * beside the kind because "somewhere to live" and "somewhere to work" is the
 * distinction that will actually be read.
 *
 * `phrase` carries its own article instead of one being assembled from `name`:
 * "a small home" is English, and a kind whose name happened to start with a
 * vowel would make a generated article wrong.
 */
export const HOME_BUILDINGS = {
  "small-home": { name: "Small home", phrase: "a small home", category: "housing" },
  "medium-home": { name: "Medium home", phrase: "a medium home", category: "housing" },
  "large-home": { name: "Large home", phrase: "a large home", category: "housing" },
  "huge-home": { name: "Huge home", phrase: "a huge home", category: "housing" },
} as const;
export type HomeBuildingKind = keyof typeof HOME_BUILDINGS;
/** What a home is when nothing has said otherwise — and the only kind there is, so far. */
export const DEFAULT_HOME_BUILDING: HomeBuildingKind = "small-home";
export const HOME_BUILDING_ORDER: readonly HomeBuildingKind[] = [
  "small-home",
  "medium-home",
  "large-home",
  "huge-home",
];
const HOME_BUILDING_KINDS: readonly string[] = Object.keys(HOME_BUILDINGS);
/** Whether a stored value or a submitted one names a building this village knows. */
export function isHomeBuildingKind(value: unknown): value is HomeBuildingKind {
  return typeof value === "string" && HOME_BUILDING_KINDS.includes(value);
}

/** The catalogue as the tab draws it: what a home is, and the class it belongs to. */
export type VillageBuildingOption = { kind: HomeBuildingKind; name: string; category: string };
/** The catalogue without the prompt's own prose, which is no business of the tab's. */
export function homeBuildingOptions(): VillageBuildingOption[] {
  return (Object.keys(HOME_BUILDINGS) as HomeBuildingKind[]).map((kind) => ({
    kind,
    name: HOME_BUILDINGS[kind].name,
    category: HOME_BUILDINGS[kind].category,
  }));
}

/**
 * How large the village's town map may be, measured as the length of its data
 * URL rather than as bytes on disk — a base64 payload is about a third larger
 * than the file it came from, and the data URL is what actually gets stored.
 * Eight million characters fits detailed 1536×1024 PNG maps and still keeps
 * one paste from bloating every future backup of the village record.
 */
export const MAX_TOWN_MAP_IMAGE_LENGTH = 8_000_000;

/**
 * The shape the map is drawn in, and the picture size that shape is authored
 * against.
 *
 * Holding a shape at all is what makes "your picture does not fit" a question
 * the village can answer: a frame that borrowed whatever shape the tab happened
 * to have could only ever show a picture that matched it, and every other
 * picture would either be squeezed or leave a margin nobody chose. The numbers
 * are also the generation target and the recommended upload size. New maps use
 * a 16:9 landscape; saved maps retain their own canvas and placement coordinates.
 */
export const TOWN_MAP_EXPECTED_WIDTH = 2560;
export const TOWN_MAP_EXPECTED_HEIGHT = 1440;

export function currentVillageCircumstances(
  village: {
    narrative?: import("../models/narrative-model.js").NarrativeState;
  },
  venueId = "",
  zoneId = "",
): string[] {
  return (village.narrative?.situations ?? [])
    .filter(
      (row) =>
        row.status === "active" &&
        (row.scope === "village" ||
          (!!zoneId && row.targets.some((target) => target.venueId === venueId && target.zoneId === zoneId))),
    )
    .map((row) => row.summary);
}

export function villageCurrentSetting(village: {
  setting: string;
  worldRules?: string;
  narrative?: import("../models/narrative-model.js").NarrativeState;
  worldName?: string;
}): string {
  const facts = currentVillageCircumstances(village);
  return [
    village.setting.trim()
      ? `Local geography and boundary (not a Venue's current physical account): ${village.setting.trim()}`
      : "",
    village.worldRules?.trim() ? `Standing world rules: ${village.worldRules.trim()}` : "",
    VILLAGE_SHARED_SETTING_RULE,
    "Current Venue and Zone records govern physical truth. Lore books are reference material; outdated descriptions cannot undo physical progress. Narrator context does not grant anyone knowledge, witnesses or consent.",
    RESIDENT_CONTINUITY_RULE,
    village.worldName ? `Village world: ${JSON.stringify(village.worldName)}` : "",
    facts.length
      ? `Active Village-wide circumstances (context, not automatic knowledge of later developments):\n${facts.map((fact) => `- ${fact}`).join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * How a picture that is not that shape is made to fit it.
 *
 * `cover` fills the frame and keeps the picture's own shape, so whatever hangs
 * outside the frame is cropped away; `stretch` fills the frame by changing the
 * picture's shape, which is the only one of the three that distorts it;
 * `contain` keeps the picture whole and lets the frame's own background show
 * around it. Named after the CSS `object-fit` keywords they are drawn with,
 * because the tab renders the choice rather than translating it into one.
 */
export const TOWN_MAP_FITS: readonly TownMapFit[] = ["cover", "stretch", "contain"];
/** Whether a stored or submitted value names a fit this village knows. */
export function isTownMapFit(value: unknown): value is TownMapFit {
  return typeof value === "string" && (TOWN_MAP_FITS as readonly string[]).includes(value);
}

/** Where in the picture the frame is looking, as a percentage of the picture. */
export const TOWN_MAP_FOCUS_MIN = 0;
export const TOWN_MAP_FOCUS_MAX = 100;
export const DEFAULT_TOWN_MAP_FOCUS = 50;

/**
 * How far the picture may be magnified inside the frame.
 *
 * Never below 1: a crop to fill has already used every pixel the frame has
 * room for, so magnifying less than that would not show more of the picture, it
 * would show the frame's background through a hole. The ceiling is the one the
 * Engine's own portrait focus uses, which is far enough in for a village.
 */
export const TOWN_MAP_ZOOM_MIN = 1;
export const TOWN_MAP_ZOOM_MAX = 2.35;
/** How much one press of a zoom button moves it. */
export const TOWN_MAP_ZOOM_STEP = 0.1;
export const DEFAULT_TOWN_MAP_ZOOM = 1;

/**
 * The framing a picture gets when nobody has chosen one: filling the frame,
 * centred, at its own size. That is the identity for a picture already at the
 * expected shape — the one the package ships — and the starting point for
 * every other picture, which the player then moves.
 */
export const DEFAULT_TOWN_MAP_VIEW: VillageTownMapView = {
  fit: "cover",
  focusX: DEFAULT_TOWN_MAP_FOCUS,
  focusY: DEFAULT_TOWN_MAP_FOCUS,
  zoom: DEFAULT_TOWN_MAP_ZOOM,
};

/** A projected home: who lives there, resolved, and what it is. */
export type VillageHomeLine = {
  /** True for the place the player lives, which is named by `playerLabel` rather than stored. */
  isPlayerHome: boolean;
  /** Who lives there, already resolved to a name against the live library. Empty for an empty place. */
  occupant: string;
  /** Null when a resident moved into a venue without a home tier. */
  building: HomeBuildingKind | null;
  venueName?: string;
  /** The player's name for this home tier, when customized. */
  buildingName?: string;
};

/** Trim a player-supplied value to its cap, so the tab and the route agree. */
export function boundText(value: unknown, maxLength: number): string {
  return asTrimmedString(value).slice(0, maxLength);
}
