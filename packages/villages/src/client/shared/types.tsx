import type { VenueClass, VillageVenue, VillageVenueImage } from "../../shared/contracts/village.js";
import type { StagingEvent } from "../../shared/helpers/scene-staging.js";
import { FOUNDING_SCENARIOS } from "../features/founding/FoundingPanels.js";
import type { VillagesWalkAside } from "../features/scenes/villages-chat-paragraphs";
import type { VillagesMarkdownNode } from "./villages-inline-markdown";

export type FoundingScenarioId = (typeof FOUNDING_SCENARIOS)[number]["value"];

export type MapElementChoice = "auto" | "include" | "exclude";

export type TownMapOptions = { roads: MapElementChoice; structures: MapElementChoice; water: MapElementChoice };

export type SetupMapSource = "existing" | "generate" | "upload" | "none";

export type SetupVenueDraft = VillageVenue;

export type PersonaPreview = {
  id: string;
  name: string;
  description: string;
  appearance: string;
  personality: string;
  backstory: string;
  avatarPath: string | null;
  avatarCrop: unknown;
};

/**
 * One thing somebody said, already built into the walk the card reads.
 *
 * The split is the Engine's own rule for its Visual Novel presentation — see
 * `splitVillagesParagraphs` — and it is done once, in `villagesWalk`, so that the
 * arrows can count what they are walking: an index means nothing unless something
 * has already decided where the paragraphs are. That is also where the beats are
 * spent, and what comes back is the two lists the drawing needs rather than the
 * three the wire carried.
 *
 * `player` is there because the card walks the whole conversation rather than one
 * half of it, and a card that cannot tell the two voices apart would draw the
 * player's own sentence under the villager's face and name. See `turns`.
 */
/**
 * The two registers the CARD can draw a step in, and there is one list of them.
 *
 * It is down from four to two, and that is this release rather than a tidy-up.
 * `side` and `whisper` used to be card registers — a way of drawing the plate for
 * a line that was tagged — which put an aside INSIDE the message card, in the
 * place the paragraph was, under the villager's own name. The Engine never draws
 * them there and the player asked not to see them there. They are now the two
 * registers of the bubble beside the card, which is where they belong and which
 * is where their own list lives — see `VillagesWalkAside`.
 *
 * What is left is what the card has always had: somebody speaking, drawn under
 * their face and their name, and the room describing itself, drawn under the word
 * NARRATION with no face over it at all. One list is still what stops the head of
 * the card and the body of it from disagreeing about which drawing they are in.
 */
export type VillageBeatRegister = "speech" | "narration";

export type SceneComposerMode = "chat" | "fulfill" | "move" | "conclude" | "contact";

/**
 * What a connection is for, in the Engine's own terms.
 *
 * It is the Engine's three-way split rather than names for the village's own
 * purposes, because it is the only thing about a connection that decides what
 * it can be offered for. A connection is an image connection because it was
 * set up as one, not because of its model name.
 */
type VillageConnectionCategory = "language" | "image_generation" | "video_generation";

export type VillageConnectionOption = {
  id: string;
  name: string;
  category: VillageConnectionCategory;
  defaultForAgents: boolean;
};

/** One row of the Engine's own connection list, exactly as it arrives — untrusted. */
export type EngineConnectionRow = {
  id?: unknown;
  name?: unknown;
  provider?: unknown;
  defaultForAgents?: unknown;
};

/**
 * One character's portrait, as the Engine keeps it.
 *
 * `avatarUrl` is the address the Engine's own cards are drawn from, and it is
 * `null` for a character nobody has given a picture to — which is ordinary, and
 * is why the drawer has an initial to fall back on rather than a placeholder
 * image. `avatarCrop` is the part of that picture the card says is the face, and
 * it is read as an unknown value rather than as a shape: what arrives is the
 * card's own stored JSON, and `readAvatarCrop` below is what decides whether it
 * describes anything. Only the fields that are needed are declared: this is the
 * Engine's shape and it is not ours to model, so the type says what we read from
 * it and nothing more, and a change to the rest of the payload cannot break this.
 *
 * The path is the Engine's own summary endpoint, which is what its chat list
 * reads to draw the same portrait. Asking it the same way, for a named list of
 * ids rather than for a page of them, is what keeps the village out of the
 * character library's internals entirely.
 */
export type EngineCharacterSummary = {
  id: string;
  name: string;
  avatarUrl: string | null;
  avatarCrop?: unknown;
};

/**
 * A card's own framing of its picture.
 *
 * Two shapes, because the Engine has stored two. The one its avatar editor
 * writes now is a rectangle of the source picture in fractions of it — `srcX`
 * and `srcY` from the top left, `srcWidth` and `srcHeight` across and down — and
 * it is always a square region of the source's own pixels, because the box it is
 * framing is square. The older shape is the same decision written as a
 * transform: a zoom and an offset, with `fullImage` meaning "all of it, letterboxed".
 *
 * Both are read, because a card is the player's and an old card is not a broken
 * one. This is the Engine's own `AvatarCrop` mirrored here rather than imported:
 * a capability package is built as a bundle of its own and none of the Engine's
 * source is available to it. What crosses between the two is the Engine's JSON,
 * which is what the summary above is read for.
 */
export type AvatarCrop =
  | { srcX: number; srcY: number; srcWidth: number; srcHeight: number }
  | { zoom: number; offsetX: number; offsetY: number; fullImage?: boolean };

/** A face as the tab has read it: the picture, and the card's framing of it. */
export type Portrait = {
  url: string;
  crop: AvatarCrop | null;
};

/** Portraits, keyed by character id, as the tab has managed to read them. */
export type PortraitMap = Record<string, Portrait>;

/**
 * The Engine's own copy of one Persona, as this tab reads it.
 *
 * A DIFFERENT SHAPE from the character summary beside it, and deliberately read
 * as its own: a Persona's picture is not a character's. `avatarPath` is the plain
 * address the Engine's own panels draw as it comes — it is written by the avatar
 * uploads to `/api/avatars/file/...` — and `avatarCrop` is the same framing the
 * same editor writes for a character, which is why one reader decodes both.
 *
 * The home identity drawer still reads the chosen portrait from the Engine.
 * Founding's card catalog and selected preview use the Villages routes instead.
 */
export type EnginePersonaRow = {
  id: string;
  avatarPath: string | null;
  avatarCrop?: unknown;
};

/** The one node kind that is a run of other nodes rather than a leaf. */
export type VillagesStyledNode = Extract<VillagesMarkdownNode, { kind: "styled" }>;

export type VenueViewZone = {
  key: string;
  zoneId?: string;
  label: string;
  subtitle: string;
  purpose?: string;
  area: "outside" | "shared" | "private" | "public";
  spaceClass: VenueClass;
  ownerId: string;
  image: VillageVenueImage | null;
  description: string;
  state?: NonNullable<VillageVenue["spaces"]>[number]["state"];
  locked: boolean;
  canEnter: boolean;
  accessLabel: string;
  adaptationPending?: boolean;
};

/** One pin drawn over the town map. */
export type MapPin = {
  label?: string;
  id: string;
  /** 0..1 across and down the picture, so the pin lands on the same building at any size. */
  x: number;
  y: number;
  /**
   * How far below the spot it marks this pin hangs, as a fraction of the picture.
   *
   * Only ever used to stack the people standing at a place underneath the pin that
   * marks the place itself. Two pins sharing a spot are two pins drawn on top of
   * each other and a name nobody can read is not a name, so the second one has to
   * go somewhere. A fraction rather than a number of pixels, so that a step down
   * that clears a pin on a phone also clears it on a wide monitor — the whole
   * point of placing pins against the picture is that the picture is the one thing
   * whose size changes everything together.
   */
  dy?: number;
  text: string;
  image?: string | null;
  tone: "player" | "resident" | "empty" | "venue";
  /**
   * Whether this pin marks a place or a person standing at one.
   *
   * The tack says "there is a building here", so it is taken off a person's pin
   * and left on a place's — a person is not a place, and the map should not need a
   * legend to say so. Undefined means a place, which is what every pin in the
   * founding wizard and the houses editor is: those are places being put down.
   */
  kind?: "place" | "person";
  venueId?: string;
  /** True while this place's View venue and Visit choices are open. */
  selected?: boolean;
  /** Absent for a pin that leads nowhere, which is drawn as a label rather than a button. */
  onSelect?(): void;
  onRemove?(): void;
  /**
   * The doors this pin opens onto, drawn as a short list underneath it.
   *
   * Present only while this is the pin the player pressed. Every place offers
   * its details and entry, including an empty venue. The list lives on the pin
   * because the map already knows its position.
   */
  doors?: { label: string; onSelect(): void }[];
  /**
   * DEBUG. A control drawn under this pin, on the picture, without moving it.
   *
   * Only ever the way back into a parked conversation: see `chatParked`. It is
   * hung here rather than beside the map because a conversation the player has
   * stepped out of is still with the villager they stepped out on, and the house
   * that was the way in is the obvious place for the way back. It is positioned
   * absolutely so that a pin with one on it still marks exactly the building it
   * marked before — the control hangs below the pin's own box instead of
   * becoming part of it.
   */
  onResume?(): void;
};

/** Where a picture is drawn once it is framed, in the frame's own pixels. */
export type PictureBox = { left: number; top: number; width: number; height: number };

/** The shape the map is drawn at: the picture size the settings named. */
export type MapFrameShape = { width: number; height: number };

/** How far the picture may be magnified, and how much one press moves it. */
export type MapZoomRange = { min: number; max: number; step: number };

/** Display data shared by identity choices, independent of their source. */
export type IdentityChoice = { id: string; name: string; portrait?: Portrait; hint?: string };

export type IdentityPreview = IdentityChoice & {
  overview: string;
  details: { label: string; text: string }[];
  context: string;
};

/** One paragraph in a Scene, with its speaker and attached asides. */
export type RoomStep = {
  stagingEvent?: StagingEvent;
  /**
   * Stable under append, which is the only thing a room's history ever does.
   *
   * The position in the walk rather than the time on the line: two paragraphs can
   * share a second, and a key made of the clock would collide on the first fast
   * answer. Nothing is ever removed from the middle of a room, so a number that
   * only ever counts up cannot go stale.
   */
  key: string;
  /** A character id, or `""` for the player's own paragraph. */
  speakerId: string;
  /** What is printed over the paragraph: their name, or the player's. */
  name: string;
  player: boolean;
  text: string;
  asides: Array<VillagesWalkAside & { speakerId?: string; name?: string; expression?: string; gazeAt?: string }>;
  register?: VillageBeatRegister;
  expression?: string;
  gazeAt?: string;
};

// ── RETIRED 0.4.43 — the gate the tab drew while a villager was away. ───────
//
// What was here was `SceneGate({ lock, villageName, chatName, busy, error,
// onGo, onBringBack, onForget })`, and it was drawn INSTEAD of the whole tab
// whenever the scene listing carried a lock. The village stood still while a
// villager was out: every route refused work, and this screen offered the three
// things that were still on offer.
//
// It is retired because the lane it belonged to is gone. The lock needed a link
// record to be true of, the link record is what 0.4.43 deleted, and the reason
// it could be deleted is that a spin-off is a roleplay the player owns: the
// village takes a snapshot and then has nothing left to wait for, so there is no
// state for a gate to be the drawing of. The snapshot is *frozen*, which is the
// whole answer to "how does the village still reach the chat without a live
// feed" — a gate was only ever needed when the answer was a live feed.
//
// WHAT IS WORTH KEEPING, if a lock is ever wanted again:
//   • `readVillageSceneLock` and the `VillageSceneLockView` shape, both of which
//     are still in the server (`services/villages/spinoff.ts`) and still
//     exported, kept rather than deleted for exactly this reason;
//   • `sceneLockedRoutes(engine)` in `routes/villages.routes.ts`, which is the
//     hook-free way to make every other route refuse, and the one line it takes
//     to re-register;
//   • `leaveForChat`, which is below and still live — it is how the player is
//     put into a chat the Engine made, and the spawn path uses it on every run;
//   • the `.${ELEMENT_TAG}-gate*` rules in the stylesheet, which are left in
//     place and now match nothing.

/**
 * Pages reachable from the village menu and the map's Noticeboard shortcut.
 */
type MenuTab =
  | "events"
  | "villagers"
  | "noticeboard"
  | "venueRequests"
  | "projects"
  | "village"
  | "general"
  | "chatlogs"
  | "progress";

export type MenuPage = "index" | MenuTab;
