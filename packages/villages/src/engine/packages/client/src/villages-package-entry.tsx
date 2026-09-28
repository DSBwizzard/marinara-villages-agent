// Villages — client entry for the Home → Villages browser tab.
//
// The host mounts this module's custom element as `marinara-capability-villages`
// and delivers props through `element.capabilityProps` (assigned AFTER
// connectedCallback) and re-published as a `marinara-capability-props` event.
//
// The tab draws the whole village itself: a picker over the player's character
// library, the villagers living here, one venue visit at a time, and the
// settings the village keeps — the prompt every villager is given, who the
// player is, and the noticeboard. The dialogue is the package's own — it never
// reads or writes an Engine chat — so this file talks only to `/api/villages`.
//
// Nothing about the village's two prompt boxes is restated here. The default
// wording of each, the length cap and the list of macros all arrive on the
// snapshot, so the panel cannot drift from what the server actually renders.
//
// A generic `clientImport` feature gets no Tailwind pass from the catalog build
// — only Noodle and Slurp have their package stylesheet compiled — so this file
// carries its own stylesheet and injects it, and the rules only read Engine CSS
// custom properties the host already defines (`--foreground`, `--border`, …).
import {
  Component,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  classifyVillagesParagraph,
  villagesWalk,
  type VillagesWalkAside,
  type VillagesWalkBeat,
} from "./villages-chat-paragraphs";
import { parseVillagesInlineMarkdown, type VillagesMarkdownNode } from "./villages-inline-markdown";
import { normalizeVillageSnapshot } from "./villages-snapshot-normalization";
import { createVillagesClientId, shouldSubmitVenueKey } from "./villages-venue-send";
import { nextRoomReadIndex } from "./villages-room-reading";
import { selectSpriteImage, spriteFacing } from "./villages-sprite-stage";
import { foundingPhotoOverlaps } from "./villages-founding-placement";
import {
  focusedPhotoScale,
  mobileCoverZoom,
  mobileDoorPoint,
  mobileGestureMoved,
  mobileMapBox,
  mobileMapGesture,
  mobilePhotoScale,
  type MobileMapView,
} from "./villages-mobile-map";

const ELEMENT_TAG = "marinara-capability-villages";
const STYLE_ID = "marinara-capability-villages-styles";
const API_PATH = "/api/villages";
const DESKTOP_PHOTO_SCALE = 0.7;
const FOUNDING_SCENARIOS = [
  {
    value: "rebuild",
    label: "Rebuild",
    description: "Begin again, together.",
    icon: "⌂",
    premise:
      "After a devastating upheaval, scattered survivors founded this village to begin again. Shared work and mutual dependence shaped its first homes and customs.",
  },
  {
    value: "pioneer",
    label: "Pioneer",
    description: "Follow the horizon.",
    icon: "△",
    premise:
      "Drawn by a distant purpose, a small group crossed into unfamiliar country and established a foothold. Their first journeys shaped the paths and customs of the village they built.",
  },
  {
    value: "prosper",
    label: "Prosper",
    description: "Make opportunity grow.",
    icon: "▥",
    premise:
      "Makers, merchants, and newcomers founded this village at a promising crossroads. Its first workshops and exchanges shaped a place built around craft and opportunity.",
  },
  { value: "custom", label: "Custom", description: "Define your own scenario.", icon: "✦", premise: "" },
  { value: "none", label: "No scenario", description: "Let life unfold.", icon: "∞", premise: "" },
] as const;
type FoundingScenarioId = (typeof FOUNDING_SCENARIOS)[number]["value"];
type ScenarioImprint = {
  origin: string;
  worldFacts: string[];
  openingConditions: string[];
  visualCues: string[];
};
const emptyScenarioImprint = (): ScenarioImprint => ({
  origin: "",
  worldFacts: [],
  openingConditions: [],
  visualCues: [],
});
const LEGACY_FOUNDING_REASONS: Readonly<Record<string, string>> = {
  "fresh-start": "People founded this village for a fresh start.",
  refuge: "People founded this village as a refuge.",
  "shared-project": "People founded this village as a shared project.",
  discovery: "People founded this village to explore a discovery.",
  homecoming: "People founded this village as a homecoming.",
  "something-else": "People founded this village for another reason.",
};
const foundingScenario = (value: FoundingScenarioId) =>
  FOUNDING_SCENARIOS.find((scenario) => scenario.value === value)!;
const foundingScenarioArt = (value: FoundingScenarioId) =>
  `/api/capability-packages/villages/assets/founding-${value}.jpg`;
type TownMapOptions = { roads: boolean; structures: boolean; water: boolean };
const DEFAULT_TOWN_MAP_OPTIONS: TownMapOptions = { roads: true, structures: false, water: false };

/**
 * The founding wizard, in order. One list so the step strip and the screens it
 * labels cannot drift apart.
 */
const SETUP_STEPS = [
  "Village Identity",
  "Connections & Persona",
  "World & Setting",
  "Scenario Imprint",
  "Village Map",
  "Build the Village",
  "Review",
] as const;
const SETUP_MIN_VILLAGER_COUNT = 1;
const SETUP_MAX_VILLAGER_COUNT = 3;
const VILLAGES_IMAGE_CONNECTION_DISABLED = "__villages_image_disabled__";
type SetupMapSource = "existing" | "generate" | "upload" | "none";

type VillageVillagerView = {
  characterId: string;
  name: string;
  sprite: ResidentSprite | null;
  summary: string;
  tags: string[];
  /** The card behind this villager is gone from the library. */
  missing: boolean;
  /**
   * Where this villager is right now, resolved by the server, or null.
   *
   * The same join the drawer draws, asked once for the whole roster rather than
   * one villager at a time — which is what lets the map put everybody on it at
   * once and have every one of them agree with the drawer that is opened on
   * them. See `VillagePlaceView`, which is what it is.
   */
  place: VillagePlaceView | null;
};

type ResidentSprite = {
  assetId: string;
  expressions: Array<{ view: "front" | "side"; label: string; filename: string }>;
  images: Array<{ view: "front" | "side"; label: string; url: string }>;
  framing: { mode: "full" | "half"; cropPercent: number };
};

const STARTER_SPRITE_EXPRESSIONS = ["neutral", "happy", "sad", "angry", "surprised", "thinking"] as const;

type VillagerRefreshPreview = {
  characterId: string;
  current: {
    revision: number;
    sourceStatus: "available" | "missing";
    name: string;
    summary: string;
    personality: string;
    scenario: string;
    backstory: string;
  };
  proposed: {
    revision: number;
    sourceStatus: "available" | "missing";
    name: string;
    summary: string;
    personality: string;
    scenario: string;
    backstory: string;
  } | null;
  sourceAvailable: boolean;
  changed: boolean;
};

/**
 * One note pinned to the noticeboard, and who wrote it.
 *
 * An empty author is your own note. The villagers sign theirs, because the point
 * of the board is that it is written in their voices rather than in the
 * narrator's; yours needs no name, since everyone here knows who you are.
 */
type VillageNotice = {
  author: string;
  text: string;
};

/**
 * One thing the village did, as the narrator wrote it down.
 *
 * Filed against the village's own clock rather than a wall-clock stamp, so the
 * day and the part of the day are what the entry is keyed on. `clock` is always
 * one of the four parts of a day.
 */
type VillageHappening = {
  id: string;
  kind: string;
  actorIds: string[];
  venueId: string;
  dayIndex: number;
  clock: string;
  occurredAt: string;
  timePrecision: "exact" | "phase";
  sourceOpportunityId: string;
  narration: string;
  text: string;
};

type VillageStoryPace = "off" | "quiet" | "balanced" | "lively";

type VillageRecap = {
  from: string;
  through: string;
  details: VillageHappening[];
  summaries: string[];
  pendingDecisionCount: number;
};

type VillageSnapshot = {
  status: string;
  village: {
    name: string;
    setting: string;
    dateLabel: string;
    weekday: string;
    season: string;
    dayPhase: string;
    instant: string;
    localTime: string;
    minuteOfDay: number;
    timeZone: string;
    hour: number;
    minute: number;
    weather: string;
    dayIndex: number;
    nextTransitionAt: string;
  };
  noticeboard: VillageNotice[];
  venueRequests: VenueRequest[];
  upgradeRequests: { id: string; venueId: string; requesterName: string; detail: string; proposedHomeKind: string }[];
  residences: {
    characterId: string;
    venueId: string;
    proposedVenueId: string;
    status: "current" | "pending" | "moving";
    requestedBy?: "player" | "villager";
    completesAt?: string;
  }[];
  venueMail: Array<{
    id: string;
    venueId: string;
    title: string;
    detail: string;
    kind: "change" | "player-move" | "counteroffer" | "villager-change" | "villager-move";
    status: "pending-player" | "awaiting-villagers" | "approved" | "declined";
    createdAt: string;
    dueAt: string;
    resolvedAt: string;
    affectedIds: string[];
    decisions: { characterId: string; accepted: boolean; reply: string }[];
    error: string;
    improvementSlot?: number;
    improvement?: { title: string; description: string; extraBeds: number } | null;
  }>;
  /** What the village has been doing, newest first. Empty until it does something. */
  happenings: VillageHappening[];
  villagers: VillageVillagerView[];
  /**
   * Whether the village has been founded yet. Not part of the settings: it is a
   * fact about the village, not something the player can edit.
   */
  isFounded: boolean;
  foundingPreparation: {
    status: "pending" | "failed" | "ready";
    completedIds: string[];
    currentId: string;
    error: string;
    stage?: "reading" | "lore" | "resolving" | "model" | "applying" | "saving";
    stageStartedAt?: string;
    attempt?: number;
    loreEntryCount?: number;
    modelName?: string;
  } | null;
  settings: VillageSettings;
  recap: VillageRecap | null;
};

type VenueRequest = {
  id: string;
  requesterName?: string;
  source?: "chat" | "background";
  proposedAt: string;
  venueDraft: Pick<VillageVenue, "name" | "purpose" | "category" | "description">;
};

/**
 * A house as the houses editor holds it: a place with a spot on the picture, a
 * building, and who lives there.
 *
 * It is deliberately the house half of a `VillageVenue` and not a record of its
 * own. A house is a place — the village keeps one list of them and the map draws
 * one list of pins — so this carries only the fields the houses editor is allowed
 * to move, and a place that is not a house is left to the editor that owns it.
 *
 * `name` is absent rather than empty: a house has no name, and the village says
 * so by leaving it off. What the player reads on the pin is who lives there, or
 * that nobody does yet — see `pinText`.
 */
type HomeDraft = {
  id: string;
  name: string;
  form: string;
  description: string;
  /**
   * 0..1 across the map, so the pin lands on the same field at any size — or both
   * null for a house nobody has drawn yet.
   *
   * Nullable even though every house this tab makes is placed by a click: the
   * village's own record allows a place with no spot on the picture, and a draft
   * that could not hold one would have to drop such a house the first time the
   * editor was opened — which is saving by losing something.
   */
  x: number | null;
  y: number | null;
  /** A kind out of the server's own catalogue, never a label the player typed. */
  building: string | null;
  isPlayerHome: boolean;
  characterId: string | null;
};

type SetupTextDraft = {
  name: string;
  form: string;
  purpose: string;
  description: string;
  spaceDescription: string;
  condition: string;
  items: string[];
  publicFacts: string[];
  features: string[];
};

type SetupVenueDraft = VillageVenue & { guidance: string };

function newSetupVenue(
  id: string,
  venueClass: "residence" | "gathering",
  x: number,
  y: number,
  playerHome = false,
  index = 1,
): SetupVenueDraft {
  const name = venueClass === "gathering" ? "Gathering Place" : playerHome ? "Your residence" : `Residence ${index}`;
  const space = {
    id: venueClass,
    venueClass,
    description: "",
    image: null,
    state: { condition: "", items: [], publicFacts: [], features: [], traces: [], updatedAt: "" },
  };
  return {
    id,
    name,
    form: venueClass === "gathering" ? "Gathering place" : "Home",
    classes: [venueClass],
    spaces: [space],
    residenceCapacity: 1,
    residentIds: [],
    improvements: [null, null],
    purpose: "",
    description: "",
    category: venueClass === "gathering" ? "public-center" : "",
    presentation: { image: null, x, y },
    occupancy: { playerHome, residentCharacterId: null, homeKind: null },
    capabilities: [],
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
    guidance: "",
  };
}

/** What a home can be, and the class it belongs to, as the village's own catalogue states it. */
type VillageBuildingOption = {
  kind: string;
  name: string;
  category: string;
};

/** One insertable prompt token, with the wording the server also renders from. */
type PresetMacro = {
  token: string;
  label: string;
  help: string;
};

/**
 * The picture a place is drawn with, as the village stores it.
 *
 * A reference, not the picture. The bytes live in the Engine's own gallery and
 * the village keeps the address, which is what lets a village with twenty
 * pictured places read and write as fast as one with none — and it is why the
 * panel says these are stored in your gallery rather than with the village, the
 * way the town map's own note does. The Engine's reference system follows the
 * `global-gallery:` spelling, so it will not let the gallery delete a picture a
 * village is still showing.
 */
type VillageVenueImage = {
  /** `global-gallery:<id>` — the reference the Engine's own deletion guard reads. */
  ref: string;
  /** Where it is served from, so a row can draw it without asking anything first. */
  url: string;
  id: string;
};

/**
 * One place in the village, which is every square of the picture anybody has
 * named: a shop, a harbour, a house somebody lives in.
 *
 * There used to be two of these — a venue for the places a villager could be
 * sent to, and a home for the houses the map pinned — and the two lists disagreed
 * about a question neither of them was asked, which is whether a place has a spot
 * on the map. It has one list now, so a place is a place: `x`/`y` are where it
 * stands on the picture, `building` is what kind of building it is, and a house is
 * the record that says so.
 *
 * The last four fields are what makes a place a house — see `isHouse` — and they
 * move together because they answer one question. A place with `x` and `y` and
 * nothing else is a landmark; the same record with a `building` is a building
 * standing there; the same one again with an `isPlayerHome` or a `characterId` is
 * somewhere somebody lives.
 */
type VillageVenue = {
  id: string;
  name: string;
  form?: string;
  classes?: Array<"residence" | "workplace" | "gathering" | "other">;
  spaces?: Array<{
    id: string;
    venueClass: "residence" | "workplace" | "gathering" | "other";
    description: string;
    image: VillageVenueImage | null;
    state: {
      condition: string;
      items: string[];
      publicFacts: string[];
      features: NonNullable<VillageVenue["state"]["features"]>;
      traces: NonNullable<VillageVenue["state"]["traces"]>;
      updatedAt: string;
    };
  }>;
  residenceCapacity?: number;
  residentIds?: string[];
  playerInvitations?: { residentId: string; recordedAt: string; scope?: "shared" | "private"; ownerId?: string }[];
  exteriorState?: NonNullable<VillageVenue["spaces"]>[number]["state"];
  privateSpaces?: Array<
    NonNullable<VillageVenue["spaces"]>[number] & {
      ownerId: string;
      adaptationPending?: boolean;
      initialImageAttemptedAt?: string;
    }
  >;
  editProposals?: Array<{
    id: string;
    target: "shared" | "private";
    ownerId: string;
    proposed: NonNullable<VillageVenue["spaces"]>[number];
    requiredIds: string[];
    approvedIds: string[];
    declined: boolean;
  }>;
  playerSeenShared?: boolean;
  playerSeenPrivateIds?: string[];
  improvements?: Array<{
    id: string;
    title: string;
    description: string;
    spaceId: string | null;
    extraBeds: number;
    approvedAt: string;
  } | null>;
  purpose: string;
  description: string;
  category: string;
  presentation: {
    image: VillageVenueImage | null;
    x: number | null;
    y: number | null;
  };
  occupancy: {
    playerHome: boolean;
    residentCharacterId: string | null;
    homeKind: string | null;
  };
  capabilities: string[];
  workerIds?: string[];
  state: {
    condition: string;
    upgrades: string[];
    furniture: string[];
    publicFacts: string[];
    features?: { id: string; text: string; sourceCharacterId: string; locked: boolean; updatedAt: string }[];
    traces?: { id: string; kind: string; text: string; recipientId: string; createdAt: string }[];
    updatedAt: string;
  };
};

/**
 * How a picture that is not the map's shape is made to fit it. The names are
 * the CSS `object-fit` keywords the picture is drawn with, so the choice the
 * server stores is the choice the browser is given — nothing is translated
 * into a second vocabulary on the way.
 */
type TownMapFit = "cover" | "stretch" | "contain";

/**
 * Where the map frame is looking.
 *
 * The frame is a fixed shape and the picture is whatever the player picked, so
 * the picture is not resized to fit — the frame is moved over the picture. The
 * whole of this is stored, which is what makes a crop cost four numbers instead
 * of another copy of the image.
 */
type TownMapView = {
  fit: TownMapFit;
  /** 0..100, left to right: the point of the picture held still in the frame. */
  focusX: number;
  /** 0..100, top to bottom. */
  focusY: number;
  /** How far the picture is magnified inside the frame. Only `cover` uses it. */
  zoom: number;
};

/**
 * One part of the village day, as the server names it and General settings
 * offers it.
 *
 * The name, the order and the hours all come from the server. The village day
 * begins at midnight and turns over four times, and which hours belong to which
 * part is a fact about the village rather than about this tab, so the panel
 * draws the switches from here rather than from a list of its own.
 */
/**
 * The editable side of the village. The limits and the macro list come from the
 * server so this tab never restates a number it does not own.
 *
 * Venue writing controls live on the village record and are read through
 * `/narration`. The knowledge box below remains separate from writing style.
 */
type VillageSettings = {
  visitRetention: { mode: "forever" | "count" | "days"; value: number };
  promptKnowledge: string;
  defaultPromptKnowledge: string;
  promptBoxMaxLength: number;
  macros: PresetMacro[];
  storyPace: VillageStoryPace;
  storyPaces: readonly VillageStoryPace[];
  /** How long the village's own name may be, as the founding wizard asks for it. */
  villageNameMaxLength: number;
  /** The Persona the village is linked to, or "" for none. */
  playerPersonaId: string;
  /** That Persona's name, resolved, so the panel can say who you are. */
  playerPersonaName: string;
  /** True when the link is to a Persona that is no longer in the library. */
  playerPersonaMissing: boolean;
  maxNoticeboardNotes: number;
  maxNoticeLength: number;
  setting: string;
  settingMaxLength: number;
  foundingReason: string;
  foundingDetails: string;
  foundingGuidance: string;
  scenarioImprint: ScenarioImprint | null;
  worldFacts: string[];
  selectedLorebookIds: string[];
  loreTokenBudget: number;
  loreTokenBudgetMin: number;
  loreTokenBudgetMax: number;
  foundingDetailsMaxLength: number;
  foundingGuidanceMaxLength: number;
  townMapLayoutPrompt: string;
  townMapNegativePrompt: string;
  /**
   * Every place in the village, houses included.
   *
   * One list, because a house is a place: a village that kept its houses beside
   * its places had two answers to "what is on the map", and the reader that asked
   * for the wrong one saw an empty village rather than an error.
   */
  venues: VillageVenue[];
  homeBuildingNames: Record<string, string>;
  /** How many places the village will hold, houses and destinations together. */
  maxPlaces: number;
  maxVenueNameLength: number;
  maxVenueNoteLength: number;
  /** How long a stored reference and its url may be, as the server caps them. */
  maxVenueImageUrlLength: number;
  maxVenueImageIdLength: number;
  /**
   * How large a place's picture may be, in bytes of image data. Checked against
   * a picked file before it is encoded, so a picture that is too large is
   * refused with both sizes in the message — the same way the map's is.
   */
  maxVenueImageBytes: number;
  /** Which folder of the Engine's gallery a place's picture is filed in. */
  villageGalleryFolderName: string;
  /**
   * The buildings a home may be, from the village's own catalogue. Nothing in
   * this tab offers a building the server did not name.
   */
  homeBuildings: VillageBuildingOption[];
  /** What the village puts on a home nobody has described as anything else. */
  defaultHomeBuilding: string;
  /** Maximum homes the founding map can hold. */
  setupHomeCount: number;
  /** Homes plus the founding public center. */
  setupPlaceCount: number;
  /** The allowed number of initial Villager homes. */
  setupMinVillagerCount: number;
  setupMaxVillagerCount: number;
  /**
   * The stamp of the current town map, not the picture. Empty means there is no
   * map; a change means the tab should fetch `/town-map` again.
   */
  townMapImageSetAt: string;
  /** How large a stored town map may be, as the length of its data URL. */
  townMapImageMaxLength: number;
  /** How the drawn map is framed right now. */
  townMapView: TownMapView;
  /**
   * The shape the map is drawn in, as the picture size it is authored against.
   * The frame is laid out from these rather than from a ratio of this file's
   * own, so the shape the map is drawn in has exactly one definition.
   */
  townMapExpectedWidth: number;
  townMapExpectedHeight: number;
  townMapGenerationWidth: number;
  townMapGenerationHeight: number;
  townMapZoomMin: number;
  townMapZoomMax: number;
  townMapZoomStep: number;
};

type CatalogEntry = {
  id: string;
  name: string;
  comment: string;
  summary: string;
  tags: string[];
  inVillage: boolean;
};

type CatalogResponse = {
  characters: CatalogEntry[];
};

/**
 * One Persona the player could be, as the picker offers it.
 *
 * Deliberately not the whole Persona: the village reads the full text itself
 * when a villager is spoken to, so the catalog carries only what a choice card
 * needs. The selected Persona's authored fields are read separately.
 */
type PersonaEntry = {
  id: string;
  name: string;
  summary: string;
  avatarPath: string | null;
  avatarCrop: unknown;
  /** The Persona the Engine itself has selected, listed first and marked. */
  isActive: boolean;
};

type PersonaPreview = {
  id: string;
  name: string;
  description: string;
  appearance: string;
  personality: string;
  backstory: string;
  avatarPath: string | null;
  avatarCrop: unknown;
};

type PersonaResponse = {
  personas: PersonaEntry[];
};

/**
 * One register-bearing line of a villager's answer, as the SERVER read it.
 *
 * The whole of this type is a mirror of `VillagesTurnBeat` in the package's own
 * server service, and it is mirrored rather than imported for the reason every
 * other shared shape in this tab is: the two ends are two bundles and the server
 * half is not on the client's side of the boundary at all. It is a type and not a
 * value, so the one thing that keeps the mirror honest is that the walk on the
 * other side of it is written against the SAME declaration — see below.
 *
 * It is presentation and never content. `content` on the same message is the same
 * words with the tags taken off — the server writes it that way, which is what
 * keeps a tag out of the six other readers of a transcript — so a tab that has
 * never heard of this field loses the register and nothing else.
 *
 * `side` is a remark said out loud but not offered to whoever is in front of
 * them, `whisper` is something said to one named listener, and `untagged` is an
 * ordinary turn: still read by SHAPE, because most of what a villager writes
 * carries no tag at all. The two tagged names are the Engine's own — Game Mode's
 * party agent writes them and its parser reads them — so the word is the same
 * word in both places.
 *
 * `thought` is deliberately not here. The Engine has one and Game Mode draws it
 * as italic purple prose, and an inner monologue the player is SHOWN is a
 * different decision from something said out of the side of somebody's mouth. The
 * name is free when somebody makes that decision.
 *
 * It is an ALIAS rather than a second three-field copy, and that is the whole of
 * this release's structural change: the walk lives beside the splitter in
 * `villages-chat-paragraphs.ts` and takes this type, so a field that appears on
 * one side and not the other is a compile error rather than a list that quietly
 * stops lining up.
 */
type ChatBeat = VillagesWalkBeat;

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
type VillageBeatRegister = "speech" | "narration";

/**
 * Where the villager is standing, as the drawer draws it.
 *
 * The server resolves the whole join and sends the answer: which place an hour
 * belongs to, what it is called, and whether anybody has given it a picture.
 * The tab does no matching of its own, because the two ends of that join — the
 * Engine's activity string and the village's venue list — are things the tab has
 * never seen and has no way to compare.
 *
 * Null is the ordinary answer and not a missing one: nobody has a week yet, or
 * nobody has translated it, or the hour happens somewhere this village has no
 * name for. All of them draw the same thing.
 */
type VillagePlaceView = {
  id: string;
  name: string;
  /** Null until somebody gives that place a picture. A place with no picture is ordinary. */
  image: VillageVenueImage | null;
  /**
   * Whether this is a destination or a house, which decides what the plate says.
   *
   * A venue is a place with a name, so the name is the whole of the answer. A
   * home is not named for the player: everybody in a village knows where
   * everybody lives, and the sentence that answers "where are they" is "at
   * home" rather than the name of a cottage the player has walked past. The name
   * is still drawn beside it when the village has one, because "at home" on its
   * own is the same plate for every villager and the drawer is opened on one
   * person at a time.
   *
   * The distinction is the server's to make and not the tab's: it comes out of
   * the same join that produced the name, and a tab that guessed from an empty
   * venue id would be inferring it from the absence of something.
   */
  kind: "venue" | "home";
};

/**
 * One thing said in a room, and who said it.
 *
 * A mirror of the server's `VillageRoomLine`, mirrored rather than imported for
 * the reason every other shared shape in this tab is. A transcript belongs to one
 * villager, so a line of it is theirs or the player's and `role` says which; a
 * room has three or more people in it, so a line has to say WHO, which `role`
 * cannot — see `speakerId`, and `name`, which the line carries even after the
 * villager is gone from the village.
 */
type RoomLine = {
  /** A character id, or `""` for the player's own line — the same rule `asTranscriptMessage` writes by. */
  speakerId: string;
  /** What to print over the paragraph. Empty on the player's own lines. */
  name: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  heardBy?: string[];
  /** The registers of this line's own paragraphs, on the same terms as a message's. */
  beats?: ChatBeat[];
  kind?: "narration" | "dialogue" | "side" | "whisper";
  expression?: string;
  gazeAt?: string;
  targetId?: string;
  asideFor?: string;
  id?: string;
};

/** Somebody currently present in a room. See `RoomView`. */
type RoomParticipant = {
  characterId: string;
  name: string;
  /** What they were doing at that hour, in this village's terms, or `""`. */
  doing: string;
};

type RoomRecollection = {
  id: string;
  text: string;
  subjectCharacterIds: string[];
  knownByCharacterIds: string[];
  lineIds: string[];
};

type RoomMemoryDecision = {
  id: string;
  action: "promote" | "reject";
  recollectionIds: string[];
  reason: string;
  category?: MemoryCategory;
  text?: string;
  subjectCharacterIds?: string[];
  knownByCharacterIds?: string[];
  lineIds?: string[];
};

/** One venue visit: its cast stays fixed until the player leaves. */
type RoomView = {
  version: 1;
  id: string;
  placeId: string;
  /** The name that place had when the room opened, for the plate. */
  placeName: string;
  spaceClass?: VenueClass;
  area?: "outside" | "shared" | "private" | "public";
  privateOwnerId?: string;
  privateAccessOwnerId?: string;
  startedAt: string;
  endedAt: string;
  lastActivityAt?: string;
  endReason?: "player" | "scene" | "inactivity" | "debug" | "";
  status: "opening" | "active" | "closing" | "closed";
  activeIds: string[];
  /** The cast captured when Visit began. */
  participants: RoomParticipant[];
  lines: RoomLine[];
  memoryPending?: boolean;
  memoryProgress?: { nextUnit: number } | null;
  memoryReview?: {
    status: "none" | "pending" | "complete";
    attempts: number;
    error: string;
    decisions?: RoomMemoryDecision[];
  };
  submissions?: { id: string; recollections?: RoomRecollection[] }[];
};

type RoomRecordEvent = {
  id: string;
  kind: "memory" | "wish" | "venue" | "request";
  text: string;
  detail?: string;
};

type ArchiveVisitSummary = Pick<
  RoomView,
  | "id"
  | "placeId"
  | "placeName"
  | "startedAt"
  | "endedAt"
  | "endReason"
  | "participants"
  | "memoryPending"
  | "memoryProgress"
  | "memoryReview"
> & {
  lineCount: number;
  memoryUnits: number;
};

function currentRoom(session: RoomView): RoomView {
  return session;
}

/**
 * What the village decided about a claim the player made.
 *
 * `fulfilled` is shown nowhere and is the flag the styling hangs off; `reason`
 * is the judge's own sentence and is the thing the player is actually owed,
 * because the villager's reply deliberately does not contain it. A player told
 * no with no reason would be told nothing at all.
 */
type WishVerdict = {
  fulfilled: boolean;
  reason: string;
};

/**
 * One thing the village remembers, as the story tab draws it.
 *
 * Three of these fields say almost the same thing and all three travel anyway.
 * `dayIndex` and `clock` are the village's own time and the only pair anything
 * reads. `dateLabel` is that day already turned into a calendar date by the
 * server, so the tab never does clock arithmetic and cannot disagree with the
 * village about what day it is. `at` is the exact instant, shown when it is
 * there and read by nothing at all.
 *
 * Both dates are here rather than only `at` because `at` cannot be trusted to
 * exist: memories written by older versions of the package have none, and a
 * record that has been through the coercion has an empty string where a stamp
 * used to be. A memory with no stamp still has a day, and that is the day it
 * is filed under.
 *
 * `favour` is the third kind and the one the tab goes out of its way to mark,
 * because it is the only entry in here the player caused: a tick is the village
 * living, a chat is a conversation filed away, and a favour is something the
 * player did for somebody and was believed about.
 */
type StoryEntry = {
  id: string;
  dayIndex: number;
  clock: string;
  occurredAt: string;
  timePrecision: "exact" | "phase";
  scope: "village" | "private";
  actors: { id: string; name: string }[];
  kind: "tick" | "chat" | "favour";
  text: string;
  dateLabel: string;
};

type StoryResponse = {
  entries: StoryEntry[];
  total: number;
};

type MemoryPerson = { id: string; name: string };
type MemoryCategory = "commitment" | "personal-fact" | "preference" | "relationship" | "shared-experience";
type MemoryDurable = StoryEntry & {
  memoryCategory?: MemoryCategory;
  subjects: MemoryPerson[];
  knownBy: MemoryPerson[];
  evidence: { visitId: string; lineIds: string[] } | null;
  sourceRecollectionIds?: string[];
  legacy: boolean;
};
type MemoryRecollection = {
  id: string;
  visitId: string;
  occurredAt: string;
  expiresAt: string;
  text: string;
  subjects: MemoryPerson[];
  knownBy: MemoryPerson[];
  reinforcementCount: number;
  lastReinforcedAt: string;
  evidence: { visitId: string; submissionId: string; lineIds: string[] }[];
};
type MemoryLibrary = {
  generatedAt: string;
  residents: MemoryPerson[];
  durable: MemoryDurable[];
  recollections: MemoryRecollection[];
  expiredRecollectionCount: number;
  archive: { total: number; pendingReviewCount: number; recent: ArchiveVisitSummary[] };
};

/**
 * The story grouped by the day the server filed each memory under.
 *
 * The list arrives newest first and is already in day order, so this only has to
 * start a new group when the label changes — no sorting, and no risk of the tab
 * deciding on a different day order than the village did.
 */
function storyDays(entries: StoryEntry[]): { label: string; entries: StoryEntry[] }[] {
  const days: { label: string; entries: StoryEntry[] }[] = [];
  for (const entry of entries) {
    const last = days[days.length - 1];
    if (last && last.label === entry.dateLabel) last.entries.push(entry);
    else days.push({ label: entry.dateLabel, entries: [entry] });
  }
  return days;
}

const MEMORY_CATEGORY_LABELS: Record<MemoryCategory, string> = {
  commitment: "Promise & obligation",
  "personal-fact": "Personal truth",
  preference: "Preference & boundary",
  relationship: "Relationship change",
  "shared-experience": "Shared experience",
};

function memoryNames(people: readonly MemoryPerson[]): string {
  return people.map((person) => person.name).join(", ") || "No resident recorded";
}

function recollectionTimeLeft(expiresAt: string, now: number): string {
  const remaining = Date.parse(expiresAt) - now;
  if (remaining <= 0) return "expiring now";
  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.max(1, Math.ceil((remaining % 3_600_000) / 60_000));
  return hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`;
}

function VillagerMemoriesPanel({
  library,
  busy,
  onRefresh,
  onForget,
}: {
  library: MemoryLibrary | null;
  busy: boolean;
  onRefresh: () => void;
  onForget: (kind: "durable" | "recollections", id: string) => void;
}) {
  const [kind, setKind] = useState<"all" | "passing" | "durable">("all");
  const [residentId, setResidentId] = useState("");
  const [query, setQuery] = useState("");
  const [evidence, setEvidence] = useState<{ visit: RoomView; lineIds: string[] } | null>(null);
  const [evidenceError, setEvidenceError] = useState("");
  const now = Date.now();
  const matches = (text: string, people: readonly MemoryPerson[]) =>
    (!query.trim() ||
      `${text} ${people.map((person) => person.name).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase())) &&
    (!residentId || people.some((person) => person.id === residentId));
  const passing = (library?.recollections ?? []).filter((entry) =>
    matches(entry.text, [...entry.subjects, ...entry.knownBy]),
  );
  const durable = (library?.durable ?? []).filter((entry) =>
    matches(entry.text, [...entry.subjects, ...entry.knownBy]),
  );
  const openEvidence = async (visitId: string, lineIds: string[]) => {
    try {
      const response = await request<{ visit: RoomView }>(`/rooms/archive/${encodeURIComponent(visitId)}`);
      setEvidence({ visit: response.visit, lineIds });
      setEvidenceError("");
    } catch (cause) {
      setEvidence(null);
      setEvidenceError(messageFrom(cause, "The source visit could not be read."));
    }
  };
  return (
    <div className={`${ELEMENT_TAG}-memory-library`}>
      <section className={`${ELEMENT_TAG}-memory-hero`}>
        <div>
          <span className={`${ELEMENT_TAG}-memory-kicker`}>Continuity, with receipts</span>
          <h3>What your villagers carry forward</h3>
          <p>
            Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an
            end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden
            character knowledge.
          </p>
        </div>
        <div className={`${ELEMENT_TAG}-memory-stats`}>
          <span>
            <strong>{library?.recollections.length ?? 0}</strong> passing
          </span>
          <span>
            <strong>{library?.durable.length ?? 0}</strong> durable
          </span>
          <span>
            <strong>{library?.archive.total ?? 0}</strong> archived visits
          </span>
        </div>
      </section>

      <div className={`${ELEMENT_TAG}-memory-layers`} aria-label="How Villages memory works">
        <article>
          <span>01</span>
          <strong>Passing</strong>
          <p>Useful context with a visible 24-hour expiry.</p>
        </article>
        <article>
          <span>02</span>
          <strong>Durable</strong>
          <p>Promises, truths, boundaries, bonds, and significant experiences.</p>
        </article>
        <article>
          <span>03</span>
          <strong>Archive</strong>
          <p>Word-for-word evidence, stored independently from character memory.</p>
        </article>
      </div>

      {library?.archive.pendingReviewCount ? (
        <div className={`${ELEMENT_TAG}-memory-health`} role="status">
          <span>◇</span>
          <div>
            <strong>{library.archive.pendingReviewCount} visit review pending</strong>
            <p>The transcript is safe. Villages will retry without holding the room.</p>
          </div>
          <button type="button" className={`${ELEMENT_TAG}-button`} disabled={busy} onClick={onRefresh}>
            Retry now
          </button>
        </div>
      ) : null}

      <div className={`${ELEMENT_TAG}-memory-toolbar`}>
        <div className={`${ELEMENT_TAG}-memory-tabs`} role="group" aria-label="Memory type">
          {(
            [
              ["all", "All"],
              ["passing", "Passing"],
              ["durable", "Durable"],
            ] as const
          ).map(([value, label]) => (
            <button key={value} type="button" data-active={kind === value} onClick={() => setKind(value)}>
              {label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search memories…"
          aria-label="Search memories"
        />
        <select
          value={residentId}
          onChange={(event) => setResidentId(event.target.value)}
          aria-label="Filter memories by resident"
        >
          <option value="">Everyone</option>
          {(library?.residents ?? []).map((resident) => (
            <option key={resident.id} value={resident.id}>
              {resident.name}
            </option>
          ))}
        </select>
        <button type="button" className={`${ELEMENT_TAG}-button`} disabled={busy} onClick={onRefresh}>
          Refresh
        </button>
      </div>

      {library === null ? <p className={`${ELEMENT_TAG}-empty`}>Reading the village’s memory layers…</p> : null}
      {library && kind !== "durable" && passing.length > 0 ? (
        <section className={`${ELEMENT_TAG}-memory-section`}>
          <div className={`${ELEMENT_TAG}-memory-section-head`}>
            <div>
              <span className={`${ELEMENT_TAG}-memory-orb`} data-kind="passing">
                ◌
              </span>
              <h3>Passing recollections</h3>
            </div>
            <span>Quiet context · expires naturally</span>
          </div>
          <div className={`${ELEMENT_TAG}-memory-grid`}>
            {passing.map((entry) => {
              const source = entry.evidence[entry.evidence.length - 1] ?? { visitId: entry.visitId, lineIds: [] };
              return (
                <article key={entry.id} className={`${ELEMENT_TAG}-memory-card`} data-kind="passing">
                  <div className={`${ELEMENT_TAG}-memory-card-top`}>
                    <span className={`${ELEMENT_TAG}-memory-pill`}>Passing</span>
                    <span>{recollectionTimeLeft(entry.expiresAt, now)}</span>
                  </div>
                  <p className={`${ELEMENT_TAG}-memory-text`}>{entry.text}</p>
                  <dl>
                    <div>
                      <dt>About</dt>
                      <dd>{memoryNames(entry.subjects)}</dd>
                    </div>
                    <div>
                      <dt>Known by</dt>
                      <dd>{memoryNames(entry.knownBy)}</dd>
                    </div>
                  </dl>
                  {entry.reinforcementCount > 0 ? (
                    <p className={`${ELEMENT_TAG}-memory-reinforced`}>
                      ↻ Reinforced {entry.reinforcementCount} {entry.reinforcementCount === 1 ? "time" : "times"}
                    </p>
                  ) : null}
                  <div className={`${ELEMENT_TAG}-memory-card-actions`}>
                    <button type="button" onClick={() => void openEvidence(source.visitId, source.lineIds)}>
                      View evidence
                    </button>
                    <button type="button" disabled={busy} onClick={() => onForget("recollections", entry.id)}>
                      Let go
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {library && kind !== "passing" && durable.length > 0 ? (
        <section className={`${ELEMENT_TAG}-memory-section`}>
          <div className={`${ELEMENT_TAG}-memory-section-head`}>
            <div>
              <span className={`${ELEMENT_TAG}-memory-orb`} data-kind="durable">
                ✦
              </span>
              <h3>Durable memories</h3>
            </div>
            <span>Lasting meaning · no arbitrary visit quota</span>
          </div>
          <div className={`${ELEMENT_TAG}-memory-grid`}>
            {durable.map((entry) => (
              <article key={entry.id} className={`${ELEMENT_TAG}-memory-card`} data-kind="durable">
                <div className={`${ELEMENT_TAG}-memory-card-top`}>
                  <span className={`${ELEMENT_TAG}-memory-pill`}>
                    {entry.memoryCategory
                      ? MEMORY_CATEGORY_LABELS[entry.memoryCategory]
                      : entry.kind === "favour"
                        ? "Fulfilled wish"
                        : "Legacy memory"}
                  </span>
                  <span>
                    {entry.dateLabel}
                    {storyTime(entry) ? ` · ${storyTime(entry)}` : ""}
                  </span>
                </div>
                <p className={`${ELEMENT_TAG}-memory-text`}>{entry.text}</p>
                <dl>
                  <div>
                    <dt>About</dt>
                    <dd>{memoryNames(entry.subjects)}</dd>
                  </div>
                  <div>
                    <dt>Known by</dt>
                    <dd>{memoryNames(entry.knownBy)}</dd>
                  </div>
                </dl>
                <div className={`${ELEMENT_TAG}-memory-card-actions`}>
                  {entry.evidence ? (
                    <button
                      type="button"
                      onClick={() => void openEvidence(entry.evidence!.visitId, entry.evidence!.lineIds)}
                    >
                      View evidence
                    </button>
                  ) : (
                    <span className={`${ELEMENT_TAG}-memory-legacy`}>No evidence link on this older memory</span>
                  )}
                  <button type="button" disabled={busy} onClick={() => onForget("durable", entry.id)}>
                    Forget
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {library && ((kind !== "durable" && passing.length) || (kind !== "passing" && durable.length)) === 0 ? (
        <div className={`${ELEMENT_TAG}-memory-empty`}>
          <span>✧</span>
          <h3>No memories match</h3>
          <p>Try another resident, phrase, or memory layer.</p>
        </div>
      ) : null}
      {library?.expiredRecollectionCount ? (
        <p className={`${ELEMENT_TAG}-memory-footnote`}>
          {library.expiredRecollectionCount} expired passing recollection
          {library.expiredRecollectionCount === 1 ? " is" : "s are"} waiting for routine cleanup.
        </p>
      ) : null}
      {evidenceError ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {evidenceError}
        </p>
      ) : null}
      {evidence ? (
        <section className={`${ELEMENT_TAG}-memory-evidence`}>
          <div className={`${ELEMENT_TAG}-memory-section-head`}>
            <div>
              <span className={`${ELEMENT_TAG}-memory-orb`} data-kind="archive">
                ⌁
              </span>
              <h3>Exact evidence · {evidence.visit.placeName}</h3>
            </div>
            <button type="button" onClick={() => setEvidence(null)} aria-label="Close evidence">
              ×
            </button>
          </div>
          <p>Only the cited archive lines are shown. The full visit remains in DEBUG → Venue Visits.</p>
          <ol>
            {evidence.visit.lines
              .filter((line) => evidence.lineIds.includes(line.id))
              .map((line) => (
                <li key={line.id}>
                  <span>
                    <strong>{line.name || "Player"}</strong>
                    <small>
                      {stampTime(line.at)} · heard by{" "}
                      {line.heardBy
                        .map(
                          (id) => evidence.visit.participants.find((person) => person.characterId === id)?.name ?? id,
                        )
                        .join(", ") || "no one"}
                    </small>
                  </span>
                  {renderVillagesMarkdown(line.content, `memory-evidence-${line.id}-`)}
                </li>
              ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

/**
 * A stamp as a wall-clock time, or nothing when there is not one to read.
 *
 * The one formatter behind both the story's stamps and the chat log's, because
 * the two are the same question asked of the same string. An absent or
 * unparseable stamp draws nothing rather than an epoch date.
 */
function stampTime(at: string): string {
  if (at.length === 0) return "";
  const when = new Date(at);
  return Number.isNaN(when.getTime()) ? "" : CLOCK_TIME.format(when);
}

/**
 * The time of day a memory was written, when it was written with one.
 *
 * This is the only place a memory's `at` is ever used, and it is formatted
 * rather than compared — the day the memory belongs to arrived as a label
 * already, so nothing here has to work out what "today" means or in whose
 * timezone.
 */
function storyTime(entry: StoryEntry): string {
  return stampTime(entry.occurredAt);
}

/**
 * One thing a villager privately wishes for, as the debug panel shows it.
 *
 * `tell` is rendered beside the wish rather than apart from it, because the two
 * halves only mean anything together: the wish says what they are after and the
 * tell is the only way anybody would ever notice. `intensity` is drawn as words
 * for the same reason it is stored as a number — 1 to 3 is how much of the time
 * it is on their mind, and "barely" reads better than a bar chart.
 */
type VillagerWish = {
  id: string;
  wish: string;
  intensity: number;
  tell: string;
  /**
   * When the village wrote this, ISO, or "" when nothing readable was stored.
   *
   * Shown because a wish is the one thing on this tab that gets OLDER while the
   * player is not looking, and because it is the only field that says whether
   * the village is still keeping a wish it wrote weeks ago. Optional rather than
   * required because this tab must read a store written by an older version of
   * itself without drawing a blank where a date would be.
   */
  addedAt?: string;
  /**
   * The instant this wish ages out and the village drops it, or "" when it
   * never does.
   *
   * Rolled once, from the wish's own id, when the wish was written — see
   * `wishLifetimeDays` on the server. Nothing about it is told to the villager
   * and nothing in a prompt reads it: it is here so that a wish that goes
   * missing between two visits can be seen to have been due to go, rather than
   * read as a bug. An unreadable one never expires, which is the safe direction,
   * and the tab says that rather than printing a date nobody wrote.
   */
  expiresAt?: string;
};

type CompletedVillagerWish = { wish: VillagerWish; fulfilledAt: string; memoryId: string };

/**
 * What one villager is after, or null when the village has not written for them.
 *
 * Null and empty are two different things here and the panel says so: null is a
 * villager waiting to be written for, and an empty agenda is the village having
 * asked and had nothing to say. `source` records where the agenda overview came
 * from, and `generatedAt` is shown and never read.
 */
type VillagerAgenda = {
  wishes: VillagerWish[];
  routineSummary: string;
  day: { startMinute: number; endMinute: number; venueId: string; activity: string }[];
  week?: Record<string, AgendaBlock[]>;
  scheduleWeek?: Record<string, AgendaBlock[]> | null;
  activeDay?: { dateKey: string; weekday: string; blocks: AgendaBlock[]; scheduleInformed: boolean };
  personalizationPending?: boolean;
  personalizationFailure?: string;
  source: "native" | "village";
  generatedAt: string;
};

type AgendaBlock = {
  startMinute: number;
  endMinute: number;
  venueId: string;
  activity: string;
  reason: string;
  status: string;
};

/**
 * How this villager's week happens here.
 *
 * `activity` is the Engine's own string, kept exactly, and `here` is the village's
 * answer for it. The pair is the whole idea, so the panel draws it as one — and
 * the panel draws the `day` and `time` beside it too, because the lookup is by
 * that SLOT and nothing else, and a player reading this is reading the table the
 * village actually uses.
 */
type VillageRemapMove = {
  /** The Engine's weekday this entry was written for, exactly as the Engine names it. */
  day?: string;
  /** The hour range this entry was written for, exactly as the Engine wrote it. */
  time?: string;
  activity?: string;
  here: string;
  /**
   * The place this happens at, as the venue's own id, or "" for none.
   *
   * Optional here because this list is written for a person to read and the
   * panel draws the pair above — but it is on the wire, and the panel does show
   * it, because a translation whose place resolves to nothing is the one part
   * of this table that fails invisibly: the sentence still reads correctly, and
   * the drawer's stage quietly falls back to the village's name.
   */
  venueId?: string;
};

type VillageRemap = {
  weekStart: string;
  moves: VillageRemapMove[];
  routine: string;
  /**
   * What the translation was asked at the time it was written, stored beside it.
   *
   * Shown next to the live signature below, because "translation out of date" is a
   * comparison between two strings and a player shown only the verdict has no way
   * to tell a translation made from a different week from one made from a
   * different list of places.
   */
  signature?: string;
  generatedAt: string;
};

/**
 * One block of somebody's day, translated into this village's own terms.
 *
 * The panel's copy of the server's `VillageDayBlock`, and the one type on this
 * side that exists to prove something rather than to draw something. A
 * translation is a lookup table keyed by `day|time`, so it has no hours of its
 * own: the hours live only in the Engine's raw week. A day view is the join of
 * the two, which means every row here is a claim the table alone cannot make —
 * this block, at these hours, reads as this — and the whole of what the player
 * needs in order to tell a bad translation from an hour the village never had
 * words for.
 *
 * `translated` is carried rather than derived from `here`, because "at home" is a
 * legitimate translation as well as the fallback, and the two mean opposite
 * things: one says the village understood this hour, and the other says it did
 * not.
 */
type VillageDayBlock = {
  time: string;
  activity: string;
  here: string;
  translated: boolean;
  venueId: string;
  status: string;
  current: boolean;
};

/**
 * One day of somebody's week, as the panel shows it.
 *
 * The village's window onto a week the Engine keeps as a PATTERN: the Engine's
 * week is keyed by weekday name and holds no dates at all, so a day here is a
 * weekday plus the village's own date for the occurrence of it the panel is
 * showing, and the two are joined nowhere but on the server. Walking the weekday
 * names forward from the present one is what makes "today" and "the rest of this
 * week" answerable at all: Sunday's tomorrow is Monday, whose hours are whatever
 * the Engine wrote for a Monday.
 *
 * The whole week is carried — seven days, one per weekday, starting at the
 * present one — because this half of the panel is a timetable, and a timetable
 * with three of its days missing is a different claim about somebody's life than
 * the one the Engine is keeping. `weekday` is the Engine's own day, `dateLabel`
 * is the village's date for it, and `isToday` marks the day the clock is actually
 * on — exactly one entry of the seven has it.
 *
 * `blocks` is empty for a villager whose card carries no schedule at all, which
 * is the ordinary shape of "the Engine is keeping nothing" and is drawn as an
 * absence rather than as a busy day.
 */
type VillageDayView = {
  weekday: string;
  dateLabel: string;
  isToday: boolean;
  blocks: VillageDayBlock[];
};

/**
 * One message of the translation prompt, as the panel prints it.
 *
 * Only the role and the text — the real call builds its messages with the
 * Engine's own type and this exists so the package type never has to cross to the
 * client.
 */
type VillagePromptMessage = {
  role: "system" | "user";
  content: string;
};

/**
 * What one villager is after, how their week happens here, and the prompt that
 * translation is written from.
 *
 * One route answers for two debug tabs, which is deliberate: the wishes and the
 * week are two halves of one listing and splitting the fetch would let the two
 * panels disagree about the same villager. Villager Wishes draws `agenda`;
 * Villager Agendas draws `days`, `weekStart`, `stale`, `remap` and
 * `remapPrompt`.
 *
 * `remapPrompt` is rebuilt on the server on every read and is the reason the
 * agendas tab exists as a debug surface: the wording of that prompt is the part
 * of this feature that is a matter of taste, and the only way to argue with a
 * wording is to read it.
 */
type VillagerAgendaView = {
  characterId: string;
  name: string;
  missing: boolean;
  /**
   * The character library could not be read, so this villager's week is unknown
   * rather than absent.
   *
   * The server already keeps `missing` false in that case, and this is here
   * because the two produce the same empty `days` and need different sentences
   * underneath them: one is the player's to fix on the Engine's own schedule
   * screen and the other is not theirs to fix at all.
   */
  weekUnreadable: boolean;
  addedAt: string;
  agenda: VillagerAgenda | null;
  completedWishes: CompletedVillagerWish[];
  ingestSchedule: boolean;
  nativeSchedule: {
    weekStart: string;
    days: Record<string, { time: string; activity: string; status: string }[]>;
  } | null;
  remap: VillageRemap | null;
  weekStart: string;
  stale: boolean;
  /**
   * How many hours of the window the stored translation cannot explain: the size
   * of the gap between the week and the village's reading of it.
   *
   * A whole translation leaves this at zero, and so does a villager with no week
   * at all — there is nothing to explain. Anything between the two is the one
   * failure this tab could not previously show: the village asked, the model
   * answered badly, and the retry budget ran out before the week was covered. The
   * rows it leaves read as `at home` forever, and before this was on the view
   * there was no way to tell that from a translation that had never been
   * attempted.
   */
  missingMoves: number;
  /**
   * The last attempt to write a translation that was refused, or null if the last
   * attempt succeeded and if there has never been one.
   *
   * Kept beside `missingMoves` because the two are the two halves of the same
   * question. This one says the village was told no and roughly why; that one says
   * how much of the week the answer it settled for actually covers. A villager
   * with neither is working.
   */
  remapFailure: { at: string; message: string } | null;
  /** What an hour with no translation reads as, in the village's own words. */
  fallback: string;
  remapPrompt: VillagePromptMessage[] | null;
  /**
   * The signature the village is asking this villager's translation to answer
   * for right now, recomputed on the server from the live week, setting and
   * places.
   *
   * Printed so the `translation out of date` badge can be argued with rather than
   * trusted:
   * a badge is a comparison between this and the signature stored inside the
   * translation, and a comparison the player cannot see is one they cannot check
   * when it disagrees with what they remember changing.
   */
  signature: string;
  /**
   * The Engine's whole week, beginning at today, each block by block, joined on
   * the server against the stored translation.
   *
   * Always seven entries, one per weekday, and each one's `blocks` list is empty
   * when the Engine is keeping nothing for that weekday — which is an ordinary
   * answer rather than a missing day. The window is computed on the server because
   * the Engine's week holds no dates: walking the weekday names forward from the
   * present one is a decision about the CLOCK, and the panel should not be making
   * its own.
   */
  days: VillageDayView[];
};

type AgendaListResponse = {
  villagers: VillagerAgendaView[];
};

/**
 * Where one roleplay chat came from, read backward out of the chat itself.
 *
 * This is the whole of what the village can say about a roleplay it has already
 * made, and it is a memory in one direction only: the chat carries a stamp, the
 * village can read it back when it is handed a chat id, and nothing the village
 * holds points at the chat. There is no listing beside this and no link record
 * behind it, which is why the only way to ask the question is to name a chat.
 *
 * Every field is looked up at the moment it is asked for rather than copied
 * down, which is what lets `name` come back empty and `resident` come back false
 * without anything being broken: a card deleted from the library takes the name
 * with it, and a villager who has since left the village keeps their roleplay
 * and only loses the word "resident".
 *
 * `mode` is deliberately absent. A spin-off is an ordinary Engine roleplay chat
 * and nothing about it is a village conversation, so nothing that crosses this
 * boundary carries the village's own verbs.
 */
type VillageSpinOffOriginView = {
  characterId: string;
  /** The villager's name now, or "" when their card cannot be read any more. */
  name: string;
  /** Where they were standing when the snapshot was taken. */
  room: string;
  /** What the village is called now, or "" before it has been named. */
  villageName: string;
  /** Whether they still live here. A villager who left keeps their roleplay. */
  resident: boolean;
};

/** The per-village writing controls returned by /narration. */
type VillageWritingView = {
  tense: "present" | "past";
  person: "first" | "second" | "third";
  rating: "sfw" | "nsfw";
  styleInstructions: string;
  defaultStyleInstructions: string;
  styleMaxLength: number;
  replyGuidance: string;
  defaultReplyGuidance: string;
  replyGuidanceMaxLength: number;
};

/**
 * What a connection is for, in the Engine's own terms.
 *
 * It is the Engine's three-way split rather than names for the village's own
 * purposes, because it is the only thing about a connection that decides what
 * it can be offered for. A connection is an image connection because it was
 * set up as one, not because of its model name.
 */
type VillageConnectionCategory = "language" | "image_generation" | "video_generation";

type VillageConnectionOption = {
  id: string;
  name: string;
  category: VillageConnectionCategory;
  defaultForAgents: boolean;
};

/** One row of the Engine's own connection list, exactly as it arrives — untrusted. */
type EngineConnectionRow = {
  id?: unknown;
  name?: unknown;
  provider?: unknown;
  defaultForAgents?: unknown;
};

type VillageConnectionSettings = {
  systemConnectionId: string;
  narrationConnectionId: string;
  imageConnectionId: string;
};

/**
 * Which place an id names, for the panel that prints the table.
 *
 * The id is the only thing the translation stores, on purpose — a stored name
 * would re-point at whatever building now answers to it. So the name is looked
 * up at the moment it is drawn, out of the places the player can see in the
 * settings panel, and an id that matches nothing is said to match nothing rather
 * than left blank. That distinction is the point of showing this at all: "the
 * translator said nowhere" and "the place it named has been deleted" look
 * identical in the drawer, and only one of them is a fault.
 */
function remapPlaceName(venues: readonly VillageVenue[], venueId: string): string {
  return venues.find((venue) => venue.id === venueId)?.name ?? "a place that is gone";
}

function agendaMinuteLabel(minute: number): string {
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

function agendaUpdatePending(view: VillagerAgendaView): boolean {
  const active = view.agenda?.activeDay;
  if (!active) return false;
  const future =
    (view.ingestSchedule ? view.agenda?.scheduleWeek?.[active.weekday] : undefined) ??
    view.agenda?.week?.[active.weekday];
  return !!future && JSON.stringify(active.blocks) !== JSON.stringify(future);
}

/** How a wish's death day is said: a day, and never a time of day. */
const WISH_DEATH_DAY = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });

/**
 * How old a wish is and when it dies, as the one trailing line the tab prints.
 *
 * Days and never a timestamp, because a wish is an ordinary thing somebody keeps
 * on their mind rather than an event with a clock on it, and because the only
 * date the village ever decided about this wish is which DAY it goes. Two facts,
 * said one after the other, and either can be missing: an `addedAt` that cannot
 * be read says nothing about age rather than reading as today, and a deadline
 * that cannot be read never expires — the safe direction the server chose,
 * repeated rather than guessed at with a date nobody wrote.
 *
 * ponytail: the age comes off the device clock at the moment the row is drawn.
 * That is the same clock as the village's own for exactly as long as the village
 * derives its time from real time — the ceiling `useRealClock` names — and the
 * line is refreshed by the tab's own read of the agendas rather than by a timer
 * of its own.
 */
function wishLifetimeLabel(addedAt: string, expiresAt: string): string {
  const parts: string[] = [];
  const born = Date.parse(addedAt);
  if (Number.isFinite(born)) {
    const days = Math.floor((Date.now() - born) / 86_400_000);
    parts.push(days <= 0 ? "written today" : days === 1 ? "written yesterday" : `written ${days} days ago`);
  }
  // A wish without a readable deadline has no set expiry.
  const dies = Date.parse(expiresAt);
  parts.push(Number.isFinite(dies) ? `fades ${WISH_DEATH_DAY.format(new Date(dies))}` : "no set end");
  return parts.join(" · ");
}

/**
 * The picture of one place, or `""` for one that has never been drawn.
 *
 * A room is keyed by its place and holds the place's NAME, not its picture, and
 * that is deliberate on the server's side: a place can be redrawn while a room is
 * open in it, and the room's record must not be a copy of a picture from before
 * the redraw. So the lookup happens here, once, out of the village's own list.
 */
function venuePictureOf(venues: readonly VillageVenue[], room: RoomView): string {
  const venue = venues.find((entry) => entry.id === room.placeId);
  if (!venue) return "";
  if (room.area === "outside") return venue.presentation.image?.url ?? "";
  if (room.area === "private")
    return venue.privateSpaces?.find((entry) => entry.ownerId === room.privateOwnerId)?.image?.url ?? "";
  return (room.spaceClass ? venueSpaceFor(venue, room.spaceClass).image : null)?.url ?? "";
}

type VillagesCapabilityElement = HTMLElement & {
  capabilityProps?: Record<string, unknown>;
  capabilityRuntimeError?: string | null;
  __root?: Root | null;
};

class VillagesClientErrorBoundary extends Component<
  { element: VillagesCapabilityElement; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    const message = error.message || "Villages could not open.";
    this.props.element.capabilityRuntimeError = message;
    this.props.element.dispatchEvent(
      new CustomEvent("marinara-capability-runtime-error", {
        detail: { message },
        bubbles: true,
      }),
    );
    console.error("Villages client capability stopped", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className={`${ELEMENT_TAG}-root`} role="alert">
        <section className={`${ELEMENT_TAG}-panel`}>
          <h1 className={`${ELEMENT_TAG}-panel-title`}>Villages could not open</h1>
          <p className={`${ELEMENT_TAG}-error`}>{this.state.error.message || "An unexpected client error occurred."}</p>
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            onClick={() => {
              this.props.element.capabilityRuntimeError = null;
              this.setState({ error: null });
            }}
          >
            Try again
          </button>
        </section>
      </div>
    );
  }
}

const VILLAGES_STYLES = `
/*
  THE TAB'S OWN SIZES, DECLARED ONCE AND READ EVERYWHERE.

  Two of them: the padding a screen keeps from its own edge, and the gap between
  the things on it. Those are the two that have to answer to the room the tab was
  given, because a phone has a third of the height a monitor has and cannot afford
  the same margin twice over. Both are written so that a wide, tall tab gets
  exactly the numbers this sheet was tuned against before there was a scale at all
  — 1.25rem and 1rem — and simply gets less when there is less.

  What is deliberately NOT here is the type. Every font-size in this sheet stays
  the size it has always been, on every device. GachaForge shrinks its type with
  its frame because its game is a 16:9 stage that has to fit inside the box
  whole, and words that do not shrink with the picture do not fit the picture.
  This tab is a panel and not a stage: its prose wraps and its lists scroll, and
  a list that scrolls is not improved by being printed smaller. Twelve-pixel body
  text is as legible on a phone as it is on a monitor, and what a phone actually
  needs is its room back — which is what the fullscreen toggle on the map and the
  queries at the foot of this sheet are for.

  0.4.45 took the word "landscape" out of that sentence, and out of one more in
  this sheet, and put nothing in its place. The tab is drawn for whichever way up
  a phone is held now, so the size a phone is told to print at no longer has a
  side to it; see the PORTRAIT block at the foot of the sheet for what replaced
  the instruction to turn over.

  Both numbers are measured against the TAB rather than the window: the tab
  shares the screen with the Engine's own furniture and takes the whole screen in
  fullscreen, and a window query cannot tell those two apart.
*/
.${ELEMENT_TAG}-root {
  --${ELEMENT_TAG}-pad: clamp(.625rem, 2cqw, 1.25rem);
  --${ELEMENT_TAG}-gap: clamp(.5rem, 1.4cqw, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--${ELEMENT_TAG}-gap);
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: var(--${ELEMENT_TAG}-pad);
  color: var(--foreground);
}
.${ELEMENT_TAG}-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .75rem; }
.${ELEMENT_TAG}-title { margin: 0; font-size: 1.5rem; font-weight: 600; letter-spacing: -.01em; }
.${ELEMENT_TAG}-subtitle { margin: .125rem 0 0; font-size: .75rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-panel {
  border: 1px solid var(--border);
  border-radius: .75rem;
  background: var(--popover);
  padding: .875rem 1rem;
}
.${ELEMENT_TAG}-panel-title { margin: 0 0 .625rem; font-size: .6875rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-foreground); }
.${ELEMENT_TAG}-villagers { display: grid; gap: .625rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
.${ELEMENT_TAG}-villager { display: flex; gap: .625rem; align-items: flex-start; }
.${ELEMENT_TAG}-avatar {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  flex: 0 0 auto; width: 2.25rem; height: 2.25rem;
  border-radius: 999px; border: 1px solid var(--border);
  background: var(--background);
  font-size: .875rem; font-weight: 600;
  overflow: hidden;
}
/* The circle is the frame, so the picture gives up its own shape to it rather
   than the frame growing around whatever the Engine happened to store. The
   card's own avatar crop is drawn on top of this by the picture's own styles —
   see avatarCropStyle — which is why the frame is what clips it: a framing is
   drawn by enlarging the picture and pushing the rest of it out of the box, and
   a box that did not clip would be a frame with the whole photograph still
   around it. A crop in the older zoom-and-offset format is a transform on this
   same picture, and one in the current format replaces this rule's geometry
   outright; both end up framed by the circle and neither needs a second rule. */
.${ELEMENT_TAG}-avatar > img { display: block; width: 100%; height: 100%; object-fit: cover; }
/*
  The Engine's own person mark, for the one face in this drawer that is nobody's
  picture.

  It is what the Engine draws for the player in its own chats, and it is here
  rather than an initial for the reason an initial is right for a villager and
  wrong for the player: a villager's name is on the map in front of the player,
  and the player's is whatever they called themselves in the wizard, in whatever
  language, possibly one word and possibly five, said in a village that may know
  them by something else entirely. A letter off the front of that is a guess about
  which word a person goes by, and the person mark guesses nothing at all. The
  AvatarFace component draws it.

  Sized in em rather than in rem so that it takes the frame's own scale: the two
  frames here set their own font-size for the initial they used to draw, and a
  mark that read against that initial is one that reads in both. It is drawn a
  little larger than the initial beside it because a line drawing with air inside
  it reads smaller than a block of type at the same measure. The stroke is
  currentColor and the path is filled nowhere, so the mark takes the frame's own
  colour the way a picture would have taken its own.
*/
.${ELEMENT_TAG}-person { width: 1.5em; height: 1.5em; }
.${ELEMENT_TAG}-villager-name { font-size: .8125rem; font-weight: 600; }
.${ELEMENT_TAG}-villager-role { font-size: .6875rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-villager-note { margin: .375rem 0 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${ELEMENT_TAG}-notices { margin: 0; padding-left: 1.1rem; display: grid; gap: .375rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-actions { display: flex; align-items: center; gap: .625rem; }
.${ELEMENT_TAG}-button {
  border: 1px solid var(--border);
  border-radius: .5rem;
  background: var(--background);
  color: var(--foreground);
  padding: .3125rem .625rem;
  font-size: .75rem;
  cursor: pointer;
}
.${ELEMENT_TAG}-button:hover { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-button:disabled { opacity: .6; cursor: default; }
.${ELEMENT_TAG}-button[data-active="true"] {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--primary);
}
/*
  The menu's options, gathered under headings rather than strung out in one row:
  everything that shows you the village under Village Management, and everything
  that changes how it behaves under General Settings. More groups are expected.
*/
.${ELEMENT_TAG}-menu-nav { display: flex; flex-direction: column; gap: .875rem; }
.${ELEMENT_TAG}-menu-group { display: flex; flex-direction: column; gap: .375rem; }
.${ELEMENT_TAG}-menu-group > .${ELEMENT_TAG}-panel-title { margin: 0; }
.${ELEMENT_TAG}-menu-group-buttons { display: flex; flex-wrap: wrap; gap: .5rem; }
.${ELEMENT_TAG}-menu-body { display: flex; flex-direction: column; gap: 1rem; }
.${ELEMENT_TAG}-roster { display: flex; flex-direction: column; gap: .375rem; margin-top: .75rem; }
.${ELEMENT_TAG}-roster-entry { min-width: 0; border: 1px solid var(--border); border-radius: .75rem; padding: .5rem .625rem; background: color-mix(in srgb, var(--popover) 92%, transparent); }
.${ELEMENT_TAG}-roster-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-size: .75rem; }
.${ELEMENT_TAG}-roster-row > div:first-child { flex: 1 1 10rem; min-width: 0; }
.${ELEMENT_TAG}-roster-row > .${ELEMENT_TAG}-villager-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${ELEMENT_TAG}-status { font-size: .75rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-error { font-size: .75rem; color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-tile {
  display: flex; flex-direction: column; gap: .25rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--background); color: inherit;
  padding: .625rem .75rem; cursor: pointer; font: inherit;
}
.${ELEMENT_TAG}-tile:hover { border-color: var(--primary); }
.${ELEMENT_TAG}-tile[data-selected="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${ELEMENT_TAG}-tile-head { display: flex; align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-tile-name { font-size: .8125rem; font-weight: 600; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-tile-summary { margin: 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${ELEMENT_TAG}-tile-meta { display: flex; flex-wrap: wrap; gap: .375rem; align-items: center; font-size: .6875rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-badge {
  border-radius: 999px; padding: .0625rem .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  color: var(--destructive, #e5484d); font-size: .625rem;
}
.${ELEMENT_TAG}-tag { border: 1px solid var(--border); border-radius: 999px; padding: .0625rem .375rem; font-size: .625rem; }
.${ELEMENT_TAG}-remove {
  flex: 0 0 auto; border: 1px solid var(--border); border-radius: .375rem;
  background: transparent; color: var(--muted-foreground);
  font-size: .6875rem; line-height: 1; padding: .25rem .375rem; cursor: pointer;
}
.${ELEMENT_TAG}-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-empty { margin: 0; font-size: .75rem; line-height: 1.55; color: var(--muted-foreground); }
.${ELEMENT_TAG}-search {
  width: 100%; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
.${ELEMENT_TAG}-picker-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; max-height: 16rem; overflow-y: auto; }
.${ELEMENT_TAG}-picker-item { display: flex; align-items: center; gap: .625rem; border: 1px solid var(--border); border-radius: .5rem; padding: .5rem .625rem; }
.${ELEMENT_TAG}-picker-item[data-resident="true"] { opacity: .6; }
.${ELEMENT_TAG}-picker-text { flex: 1 1 auto; min-width: 0; }
/*
  A villager's conversation, as a Visual Novel stage over the whole map.

  IT USED TO BE A DRAWER DOWN THE RIGHT-HAND SHARE, and the shape changed because
  the Engine's own roleplay chats have a Visual Novel presentation and this is the
  village's version of it: the picture fills the tab, the villager stands in it,
  and the words are read a paragraph at a time in a card held just above the box
  the player types in. A card of that kind needs the width the whole tab has —
  the whole point of it is one paragraph set at a comfortable measure, and a
  paragraph in two fifths of a phone is a column of single words.

  It is still parked off the right edge and slides in rather than appearing, and
  the reason has not changed: the map is never resized out from under the pins
  just because the player started talking to somebody. Absolute positioning rather
  than fixed keeps it inside the tab — fixed would escape to the viewport and
  leave the Engine's own furniture behind — and the homepage's overflow: hidden
  is what clips the parked position. visibility is what takes the shut stage out
  of the tab order and the accessibility tree, since a translated box is still on
  the page.

  NO BORDER, NO RADIUS AND NO WIDTH, because it is the tab: a panel with an edge
  inside a tab that also has an edge is a picture in a frame inside a frame. The
  padding stays, and it is what the picture bleeds past — the stage layer is
  inset to this box, so the map behind the words runs to the tab's own edge
  rather than stopping a gutter short of it.

  The fill is still the theme's popover, because the layer above it — the head,
  the reader and the composer — is drawn over the picture in that colour at an
  opacity, and a picture with no fill under it would be a picture over whatever
  happened to be behind the tab.
*/
.${ELEMENT_TAG}-chat {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column; gap: .75rem;
  min-height: 0;
  border-left: 0; border-radius: 0;
  background: var(--popover); padding: .875rem;
  transform: translateX(100%);
  visibility: hidden;
  transition: transform .28s ease, visibility 0s linear .28s;
}
.${ELEMENT_TAG}-chat[data-open="true"] {
  transform: translateX(0);
  visibility: visible;
  transition: transform .28s ease;
}
.${ELEMENT_TAG}-room-screen {
  position: relative; display: flex; height: 100%; min-height: 0; overflow: hidden;
}
.${ELEMENT_TAG}-room-screen > .${ELEMENT_TAG}-chat {
  position: relative; inset: auto; flex: 1 1 auto; min-width: 0;
  box-sizing: border-box; overflow: hidden; transform: none; visibility: visible; transition: none;
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-scene { pointer-events: none; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-head {
  align-items: center;
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-actions {
  width: 100%; justify-content: flex-end; margin-left: 0;
}
.${ELEMENT_TAG}-room-stars {
  position: absolute; z-index: 4; top: 4.25rem; left: .875rem;
  display: grid; gap: .4rem; width: min(20rem, calc(100% - 1.75rem));
  max-height: min(40vh, 18rem); overflow-y: auto; pointer-events: auto;
}
.${ELEMENT_TAG}-room-star {
  display: flex; align-items: flex-start; gap: .5rem; padding: .55rem .65rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--surface)); color: var(--text);
  box-shadow: 0 .25rem 1rem #0003; font-size: .82rem; line-height: 1.35;
}
.${ELEMENT_TAG}-room-star > span:first-child { color: #e5b13e; font-size: 1.2rem; line-height: 1; }
.${ELEMENT_TAG}-room-star > span:nth-child(2) { flex: 1; }
.${ELEMENT_TAG}-room-star button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${ELEMENT_TAG}-room-star-dismiss { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; margin: -.5rem -.55rem -.5rem 0; font-size: 1.2rem !important; line-height: 1; }
.${ELEMENT_TAG}-room-star button:focus-visible { outline: 2px solid currentColor; border-radius: .2rem; }
@media (max-width: 600px) {
  .${ELEMENT_TAG}-room-stars { top: 4.75rem; left: .625rem; width: min(19rem, calc(100% - 1.25rem)); max-height: 32vh; }
}
@media (prefers-reduced-motion: reduce) {
  .${ELEMENT_TAG}-chat, .${ELEMENT_TAG}-chat[data-open="true"] { transition: none; }
}
/*
  THE PICTURE IS THE GROUND FLOOR, and everything else is a layer drawn over it.

  The stage is taken out of the column and pinned to the whole tab, so it is not
  a flex row's child any more and it reserves no height at all: the head, the
  reading card, the way out and the composer lay themselves out as if the picture
  were not there, and the picture fills whatever space they leave. That is the
  whole difference between a stage and a column — the picture is BEHIND the words
  rather than beside them, which is what lets the words have the tab's full
  width.

  A positioned box paints over in-flow content, so every layer has to say that it
  is above the picture rather than rely on document order. The list is written
  once, here, rather than a z-index being repeated into each rule below: a layer
  added to the column later is one line in this selector list, and forgetting it
  is a layer that disappears behind the map rather than a subtle stacking bug,
  which is the kind of failure a list like this exists to make obvious.

  The child combinator rather than a descendant one, because several of these
  names — error, composer, the two panel classes — are drawn by the rest of the
  sheet as well, and a bare descendant selector would hand a stacking context to
  every one of them.

  The head is NOT in this list, and its absence is deliberate rather than an
  oversight: it is the floating top chrome and it carries its own, higher
  z-index in its own rule. Everything named here sits above the picture and below
  the chrome, which is the one ordering the whole sheet depends on.

  The way out is not in the list either, and its absence is the other deliberate
  one rather than a second oversight: it is not a row of this column any more.
  It is drawn inside the bottom stack and pinned to the top of it, so it is
  already above the picture by being above the reading — see its own rule.
*/
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-stage,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-activities,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-vn,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-confirm,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-error,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-room-error,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-composer,
.${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-chat-ended { position: relative; z-index: 1; }
/*
  THE TOP CHROME, floating over the picture.

  It used to be a row in the column with a wash of its own behind it — a header,
  in other words — and it is now a bar laid over the stage, which is what the
  Engine's own roleplay surface does with the top of its chats: the picture runs
  to all four edges of the tab and everything the tab has to say is drawn on top
  of it.

  pointer-events: none on the bar and auto on its children, because a bar that
  spanned the tab and swallowed presses would be a bar that took the room away
  from the player: the badge is a thing to read, and the only thing in here to
  press is the options button at the far end.

  The wash the row used to wear is gone with the row, and it has not been
  replaced by nothing: each thing in here carries its own surface, which is the
  statement the Engine makes in the same place — its top chrome is a row of
  individually surfaced controls rather than a plate across the tab, so that the
  picture is visible between them.

  0.4.50 took the "right now" chip out of here and with it the last of the prose.
  What is left is one badge and one button, so the row no longer needs wrapping
  room and no longer competes with the reading for the top of the tab — see the
  note on the head itself. The badge is still first in the row and the button is
  still held at the far end by the auto margin on the actions beside it.
*/
.${ELEMENT_TAG}-chat-head {
  position: absolute; top: .875rem; left: .875rem; right: .875rem; z-index: 3;
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: .375rem;
  pointer-events: none;
}
.${ELEMENT_TAG}-chat-head > * { pointer-events: auto; }
/*
  THE THREE DOTS, and everything the room can do behind them.

  There used to be a bare row of buttons here — End conversation and Forget, then
  the spin-off verb, then the debug pair — and it was read as a row of five equal
  things when only one of them was the player's ordinary way out. The Engine's
  own roleplay chats keep their commands behind a "..." in the corner, and this
  is the same control doing the same job: the room is not a toolbar, and the two
  presses a player makes in an hour should not be the two loudest things on the
  screen.

  NO BACKDROP and no focus trap, deliberately: the menu hangs off a button in the
  top chrome rather than covering the tab, and the paragraph the player was
  reading stays readable behind it. Closing it is one press anywhere else, or
  Escape — see the effect on the panel.
*/
.${ELEMENT_TAG}-chat-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; margin-left: auto; }
.${ELEMENT_TAG}-chat-menu-anchor { position: relative; display: inline-flex; }
/*
  The button itself, cut to the Engine's own toolbar button.

  The Engine keeps one shape for everything in the chrome — a control square, a
  rounded corner, a translucency over the picture and a blurred backdrop behind
  the translucency — and this is that shape, in the Engine's own chrome tokens.
  Those are declared on the document root, so they arrive here already resolved
  for whatever theme the Engine is wearing; the fallbacks beside them are what
  keeps the button drawn if a name is ever missing.

  The narrow-container step to a slightly larger square is an override at the end
  of the sheet, where the container queries live, because it is a change of size
  rather than a second button.
*/
.${ELEMENT_TAG}-chat-menu-button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; padding: .375rem; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: .5rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${ELEMENT_TAG}-chat-menu-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${ELEMENT_TAG}-chat-menu-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${ELEMENT_TAG}-chat-menu-button svg { width: 1rem; height: 1rem; }
/*
  The same button shape, for the one press that has a word on it.

  A card that has gone from the library draws Close instead of the options menu,
  and it is drawn in the chrome rather than in the row below because there is
  nowhere else for it to be. It wears the toolbar's own surface so that the one
  control in the top chrome is the same control whether it is a glyph or a word.
*/
.${ELEMENT_TAG}-chat-tool {
  min-height: 2rem; box-sizing: border-box;
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
}
.${ELEMENT_TAG}-chat-tool:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
/*
  The popover, modelled on the tracker menu so there is one popover in this
  package rather than two that look almost the same.

  It is bounded in both directions and scrolls inside that bound. Its height is
  the reason: this list is the longest one in the tab now — four verbs, the way
  between the two ways of reading, and a debug group — and on a phone held
  sideways an unbounded one would be taller than the tab it hangs off. cqh rather
  than vh, because the container is the tab the Engine drew and not the window:
  in fullscreen those are two different boxes, and it is the tab this menu has to
  fit in.

  The surface is the Engine's own panel, in the Engine's own tokens, so that a
  popover and the button it hangs off are cut from one cloth. It used to be the
  theme's popover colour, which was the right surface for a menu inside a header
  row and is the wrong one for a menu hanging off a translucent control over a
  photograph: the panel tokens already carry the blur-friendly opacity and the
  accent-tinted edge that keep the two reading as a pair.
*/
.${ELEMENT_TAG}-chat-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 19rem; max-width: min(19rem, 82cqw);
  max-height: min(26rem, 70cqh); overflow-y: auto;
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover, var(--background)));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${ELEMENT_TAG}-chat-menu-note {
  margin: 0; font-size: .6875rem; line-height: 1.5;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
/*
  Ending is the ordinary way out and forgetting is the rare, total one, so the
  pair is drawn as a plain button and a red one rather than as two buttons of
  equal weight. Forget is RED because it is a debug action: nothing a player of
  this game is meant to be able to do leaves the village with no memory of a
  conversation that happened, and the colour is the part of that statement a
  player reads before they read the words.

  Both are drawn full width in the menu, because a menu is a list of things to
  press and a ragged cluster of differently sized ones is a list nobody scans.
*/
.${ELEMENT_TAG}-chat-menu .${ELEMENT_TAG}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  DEBUG. The two fixture controls, at the foot of the menu behind a rule.

  A different promise from the pair above them, which belongs to the conversation
  and comes and goes with it: these two are a fixture of the tab while it is being
  worked on, so they are drawn whatever the phase, whatever the card, and whether
  or not anybody has said a word. Nothing about them is conditional, and that is
  the point — a control that is only sometimes there is a control that has to be
  looked for.

  The rule above them is the whole of what marks them apart. They used to be
  pushed to the far end of a header row, which is where a second claim on the
  space is made; in a menu the same statement is made by a divider, because the
  menu is already the corner and there is no further end to push anything to.
*/
.${ELEMENT_TAG}-chat-debug {
  display: flex; flex-direction: column; gap: .375rem;
  margin-top: .125rem; padding-top: .5625rem; border-top: 1px solid var(--border);
}
/*
  The last press, floating over the room just above the box.

  A room the village has already remembered wears End conversation here, and it
  is the only control of its kind on the screen: the first press — Leave this
  conversation, which 0.4.49 moved into the menu under the box — is what spends
  the goodbye and files the memory away, and this is what closes the drawer
  afterwards. A player who sees it has finished rather than being asked to
  confirm something they did a second ago.

  The rooms with no ending to give draw Close in the same slot: the one whose
  villager could not be reached at all. Neither name is a lie about what pressing
  it does — it closes the drawer and releases the map.

  It is drawn as CHROME rather than as a message, and that is one of the two
  things 0.4.49 changed about it. It used to be a plate centred between the
  reading and the box with a message's own padding on it, and the padding was the
  mistake: a button with a message's insides reads as part of what somebody said,
  and a way out is not something anybody said. So it wears the Engine's own
  toolbar surface — the translucent chip, the blurred backdrop, the pill radius,
  the shadow — and nothing is drawn behind it.

  AND IT FLOATS, which is the other thing. It is a child of the bottom stack and
  it hangs off the TOP of it, so it is over the room rather than in a row of the
  column: the reading and the box keep the position they have in every other
  room, and all this state adds is a chip over the room above them. A row of its
  own — which is what it was — pushed the card up the room for as long as it was
  drawn, and a room that moves because a button appeared is the one thing this
  drawer's reading is not allowed to do.

  It hangs off the bottom stack rather than sitting in a corner, and that is the
  Visual Novel's own arrangement rather than a preference: the reading is the
  card and the history is a pane the player opens, so there is no log to write a
  button into, and one written into the transcript would come and go with the
  history instead of sitting where the reading ends.

  WHO sees it was narrowed in the same release — see showFoot. It used to be
  drawn for anything that was not mid-answer, which included a room whose card is
  gone, where the head already carries the same press, and a room whose villager
  is still finding their first line.
*/
.${ELEMENT_TAG}-chat-end {
  position: absolute; left: 50%; bottom: calc(100% + .375rem);
  transform: translateX(-50%);
  display: flex; justify-content: center;
}
.${ELEMENT_TAG}-chat-end > .${ELEMENT_TAG}-button {
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px; padding: .3125rem .875rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .4);
}
.${ELEMENT_TAG}-chat-end > .${ELEMENT_TAG}-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${ELEMENT_TAG}-button-quiet { border-color: transparent; background: transparent; color: var(--muted-foreground); }
.${ELEMENT_TAG}-button-quiet:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  The debug action's question, drawn under the button that raised it rather than
  over the whole tab. It belongs beside the control it is about — a modal would
  put the map, the drawer and the player's own words behind a sheet of grey to
  ask one question about one button — and it is drawn in the destructive colour
  so that the question and the thing it is asking about read as one action.
*/
.${ELEMENT_TAG}-chat-confirm {
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .5rem; padding: .5rem .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 10%, transparent);
}
.${ELEMENT_TAG}-chat-confirm-note { margin: 0; font-size: .6875rem; line-height: 1.5; color: var(--foreground); }
.${ELEMENT_TAG}-chat-confirm-row { display: flex; flex-wrap: wrap; gap: .375rem; }
.${ELEMENT_TAG}-image-recommendation { color: #d68a18; }
/*
  Where the composer was, once the conversation has been ended.

  Everything that could still say something to a villager who has been left is
  taken off the screen rather than disabled: a row of greyed-out verbs would be
  an invitation to keep talking to somebody who has already been said goodbye
  to, and the one thing left to do with a conversation that has been remembered
  is close it. The box is hidden rather than unmounted so the half-written
  sentence in it survives, which is the same promise the Fulfill verb makes.

  dashed rather than solid, because this is not a control: it is the drawer
  saying it is finished with the player.
*/
.${ELEMENT_TAG}-chat[data-ended="true"] .${ELEMENT_TAG}-composer { display: none; }
/*
  And the same hiding, for the two states of a greeting that has not landed.

  A villager greets first, so while they are still finding their line there is
  nothing to answer: the box would take a sentence the player cannot send, and
  every verb above it would be a greyed-out version of itself. Hiding rather than
  unmounting keeps the half-written line in the box across a retry that succeeds,
  which is the same promise the ended state above makes, and it keeps the change
  to one property.

  failed hides it for a different reason: there is no conversation. Nothing was
  written down, the order of the room was never established, so the only control
  on offer is the one that gets the player out.

  Both rules sit BELOW the ended rule rather than beside it because the ended
  state is the one that matters when they could overlap, and they are separate
  selectors rather than one list so that each keeps its own reason.
*/
.${ELEMENT_TAG}-chat[data-greeting="writing"] .${ELEMENT_TAG}-composer { display: none; }
.${ELEMENT_TAG}-chat[data-greeting="failed"] .${ELEMENT_TAG}-composer { display: none; }
.${ELEMENT_TAG}-chat-ended {
  margin: 0; padding: .5rem .625rem; border: 1px dashed var(--border); border-radius: .5rem;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground); text-align: center;
}
/*
  THE ROOM, and the floor the villager stands on.

  The scene used to be a bounded column BESIDE the words, and it is the whole
  backdrop now: the picture of the place the villager is standing in runs to the
  tab's own edges and everything else in the aside is read over the top of it.
  That is the Engine's own Visual Novel shape, and it is the reason the card can
  be a card at all — a paragraph set at a comfortable measure needs the tab's
  full width, and two fifths of a phone is a column of single words.

  It keeps the muted plate the places list uses for a picture it does not have, so
  a place with no picture reads as a place with no picture rather than as a
  picture that failed: the same statement, made the same way, in both lists.
*/
.${ELEMENT_TAG}-chat-scene {
  position: absolute; inset: 0; z-index: 0;
  min-height: 0;
  background: var(--muted, rgba(127, 127, 127, .08));
  overflow: hidden;
}
.${ELEMENT_TAG}-chat-scene-backdrop {
  position: absolute; inset: 0; display: block;
  width: 100%; height: 100%; object-fit: cover;
}
.${ELEMENT_TAG}-chat-scene-placeholder {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: var(--muted-foreground); font-size: .85rem; text-align: center; padding: 1rem;
}
/*
  THE TWO LAYERS BETWEEN THE PICTURE AND THE WORDS.

  The Engine draws both of these over its own roleplay backdrop and this tab had
  neither, which is the whole of why its room read as a photograph with a card
  lying on it rather than as a stage:

  The scrim is a vertical wash of the theme's own background — dark in a dark
  theme, light in a light one — so it darkens the picture where the chrome sits
  and leaves it most visible in the middle. It is mixed rather than painted a
  fixed near-black, because a fixed near-black over a pale theme's map is a black
  band across a drawing rather than a photograph going into shadow, and the
  Engine's own light theme makes exactly the same substitution.

  The vignette is the other half of the same statement, around the edges instead
  of above and below: the eye is drawn to the middle of the room, and the corners
  of a photograph stop competing with the words laid over them. It is the
  Engine's own radius and the Engine's own opacity.

  Both are inside the scene rather than beside it because the scene is the layer
  that knows where the picture is, and neither is drawn for a place that has no
  picture — there is nothing to darken and nothing to frame.
*/
.${ELEMENT_TAG}-chat-scrim {
  position: absolute; inset: 0; display: block;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--background) 55%, transparent) 0%,
    color-mix(in srgb, var(--background) 40%, transparent) 42%,
    color-mix(in srgb, var(--background) 45%, transparent) 72%,
    color-mix(in srgb, var(--background) 60%, transparent) 100%
  );
}
.${ELEMENT_TAG}-chat-vignette {
  position: absolute; inset: 0; display: block;
  background: radial-gradient(ellipse at center, transparent 50%, color-mix(in srgb, #000 30%, transparent) 100%);
}
/*
  THE FLOOR, and it is a row of the tab rather than a layer on the stage.

  The villager used to stand at the head of the reading column, and the note that
  used to be here explained at length that this was the one place the tab departed
  from the Engine and that it departed for the length of a face. It was a real
  problem — the Engine's sprite is a whole body, so a card across its shins still
  leaves a head thirty centimetres above the card, and ours is a square crop
  whose chin is not far below its eyes — but standing the figure in the reading
  column answered it by putting the villager inside the words, which is the one
  thing a Visual Novel stage is for.

  So the figure is on the floor, the way the Engine's is, and the problem is
  answered by the floor being the right size rather than by moving the person. The
  floor is this row, and the figure stands on the bottom of it and grows upward. It
  cannot be walked over by the card, because the card is not in this row — and on a
  tab with almost no height left it shrinks like a sprite rather than being clipped
  like one.

  The floor CLAIMS a share of the tab and yields proportionally when the tab cannot
  pay it. A flex-basis of 34cqh is the same share the figure is allowed to ask for;
  a shrink factor of 1 is what lets a tab with a long paragraph in it take the
  shortfall off the floor and off the card together rather than off one of them
  alone. A floor that took only what was LEFT OVER — flex-basis auto, which is what
  this rule used to say — is paid last and can be paid nothing, and that is how a
  figure ends up standing above the top edge of the tab with its head cut off.

  container-type: size is what lets the figure ask the FLOOR how tall it is instead
  of asking the tab and hoping the arithmetic comes out. Every cq unit inside this
  row is the row's own square from here on, which is why the figure's height share
  is 100cqh below rather than a number tuned against the chrome around it. The
  price is stated plainly: the floor's size no longer answers to its contents, so
  neither the figure nor the plate can push the row outward. That is the point — it
  is why the figure is allowed to shrink at all — and it is also why the row needs
  a basis of its own rather than a basis of its content.

  It comes BEFORE the bottom stack in the document, and it is the bottom stack
  that is drawn last, so the order the layers paint in is the order the room reads
  in whether or not every rule's z-index survives a future edit.

  0.4.49 makes the floor GROW as well as shrink, and that is the difference
  between a stage and a block at the top of the tab. The card and the composer
  both have ceilings of their own, so on a tab taller than 34cqh the share the
  floor claimed was all it ever took and the rest of the tab sat empty under the
  card: measured at 1200x800 the row was 272 pixels and the 240 under the composer
  were nobody's. A grow factor of 1 hands that slack back to the row, which is what
  puts the room over the whole tab with the card and the box laid out at the foot
  of it.

  It is also the foundation the spritesheet is going to be drawn on. A villager is
  a framed square crop today, and a full-body sprite is the art that is coming; the
  row it will stand in is now the row the tab actually has rather than a fixed
  share of it, so the ground a sprite will need already belongs to the figure's row
  and nothing about the card, the composer or the chrome has to move again to make
  room for it.
*/
.${ELEMENT_TAG}-chat-stage {
  flex: 1 1 34cqh; min-height: 0;
  container-type: size;
  display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
  gap: .375rem;
  padding-bottom: .25rem;
}
.${ELEMENT_TAG}-chat-activities {
  max-width: min(90%, 42rem); max-height: 5rem; overflow-y: auto;
  flex: 0 0 auto; align-self: center;
  display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem;
  color: var(--foreground); font-size: .6875rem; line-height: 1.4;
}
.${ELEMENT_TAG}-chat-activity {
  padding: .15rem .4rem; border-radius: .4rem;
  background: color-mix(in srgb, var(--background) 80%, transparent);
}
/*
  THE BOTTOM STACK: the tab, the card, and the whole of the reading.

  One block, directly above the composer, with its contents justified to the end
  so that the card always sits on the box the player types in. That is the
  Engine's own arrangement — its visual-novel card is pinned to the bottom of the
  input chrome and the room is what is left above it — and it is what makes the
  card's position stable: a card that floated up and down the tab with the length
  of the paragraph would be a different screen every turn.

  It is the flexible row, and the stage above it is the other one, so the two
  share what the tab has left between them. The card cannot grow into the stage
  because a card has its own ceiling — see the reading box — and neither can an
  open history, which is capped where it is declared.
*/
.${ELEMENT_TAG}-chat-vn {
  flex: 0 1 auto; min-height: 0;
  display: flex; flex-direction: column; justify-content: flex-end; gap: .375rem;
}
/*  Square, and that is a requirement rather than a preference: the card's own
    framing of its picture is a square region of it, and the arithmetic that
    draws a framing — see avatarCropStyle — only lands undistorted on a frame
    of the same shape. A tall frame would show the same crop with the face
    stretched through it.

    Centred rather than stretched across the tab: it is a person standing in a
    room, and a person is not the width of a room.

    ONE width, and the square follows from it, which is what keeps the two
    dimensions from ever disagreeing. It is the smaller of a share of the tab's
    width and the room the floor actually has, because a figure that only answered
    width would eat a landscape tab's height — and the second term is measured
    against the FLOOR rather than against the tab, because the floor is a size
    container of its own. That is the whole answer to a short tab, and it is why
    the short-tab queries at the end of the sheet no longer carry a figure size of
    their own: the figure is exactly as big as the row it stands in, so it cannot
    stand above the top edge of the tab however little room the card and the
    composer have left it. The 2.5rem is the gap, the plate and the floor's own
    padding, spent so that the plate is not pushed off the bottom of the tab by a
    figure that filled the row.

    flex: 0 0 auto, because the stage is justified to its end and the plate below
    is the row that may give way. A shrinkable figure means a long place name
    squashes the face to buy the plate a line it did not need.

    0.4.49 raises the width share from 30cqw to 38cqw, and only because the floor
    now grows: the figure is capped by the row it stands in either way, and a row
    that owns the whole tab can afford a bigger person in it. What it is NOT is a
    spritesheet — a villager is still a square crop in a soft frame, at a size
    that leaves the room around them, and the extra room the floor now owns is
    what the full-body art is going to be drawn into. The radius, the border and
    the drop shadow below are the shape that art has to arrive in.
*/
.${ELEMENT_TAG}-chat-figure {
  position: relative; z-index: 1;
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  width: min(38cqw, calc(100cqh - 2.5rem)); aspect-ratio: 1 / 1;
  border-radius: .625rem; border: 1px solid var(--border);
  background: var(--popover);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .35);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, .5));
  font-size: 1.5rem; font-weight: 600;
  overflow: hidden;
}
.${ELEMENT_TAG}-chat-figure > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-chat-figure[data-sprite="true"] { width: min(35cqw, 23rem); height: min(65cqh, 35rem); aspect-ratio: auto; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${ELEMENT_TAG}-chat-figure[data-sprite="true"] > img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.${ELEMENT_TAG}-chat-figure[data-sprite="true"][data-framing="half"] { overflow: hidden; height: min(54cqh, 25rem); }
.${ELEMENT_TAG}-chat-figure[data-sprite="true"][data-framing="half"] > img { object-fit: cover; object-position: center top; }
.${ELEMENT_TAG}-sprite-editor { min-width: 0; border-top: 1px solid var(--border); padding: 1rem .125rem .25rem; margin-top: .625rem; display: grid; gap: .875rem; }
.${ELEMENT_TAG}-sprite-heading, .${ELEMENT_TAG}-sprite-section-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: .5rem 1rem; }
.${ELEMENT_TAG}-sprite-heading h3 { margin: 0; font-size: 1.1rem; }
.${ELEMENT_TAG}-sprite-heading p { margin: .25rem 0 0; color: var(--muted-foreground); font-size: .8125rem; }
.${ELEMENT_TAG}-sprite-count { border: 1px solid var(--border); border-radius: 99rem; padding: .25rem .625rem; white-space: nowrap; font-size: .75rem; }
.${ELEMENT_TAG}-sprite-views { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.${ELEMENT_TAG}-sprite-view { display: grid; gap: .2rem; min-width: 0; text-align: left; border: 1px solid var(--border); border-radius: .7rem; padding: .7rem .8rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; }
.${ELEMENT_TAG}-sprite-view span { color: var(--muted-foreground); font-size: .75rem; }
.${ELEMENT_TAG}-sprite-view[data-active="true"], .${ELEMENT_TAG}-sprite-choice[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, var(--popover)); box-shadow: inset 0 0 0 1px var(--primary); }
.${ELEMENT_TAG}-sprite-section-head { color: var(--foreground); font-size: .8125rem; }
.${ELEMENT_TAG}-sprite-section-head span { color: var(--muted-foreground); }
.${ELEMENT_TAG}-sprite-choices { display: grid; grid-template-columns: repeat(auto-fill, minmax(6.25rem, 1fr)); gap: .5rem; }
.${ELEMENT_TAG}-sprite-choice { display: grid; justify-items: center; gap: .15rem; min-width: 0; border: 1px solid var(--border); border-radius: .65rem; padding: .4rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; text-transform: capitalize; }
.${ELEMENT_TAG}-sprite-choice-art { display: grid; place-items: center; width: 100%; height: 6rem; border-radius: .4rem; background: color-mix(in srgb, var(--muted) 75%, transparent); color: var(--muted-foreground); font-size: 1.3rem; overflow: hidden; }
.${ELEMENT_TAG}-sprite-choice-art img { display: block; width: 100%; height: 100%; object-fit: contain; }
.${ELEMENT_TAG}-sprite-choice small { color: var(--muted-foreground); font-size: .6875rem; text-transform: none; }
.${ELEMENT_TAG}-sprite-selected { display: flex; align-items: baseline; flex-wrap: wrap; gap: .25rem .75rem; font-size: .8125rem; text-transform: capitalize; }
.${ELEMENT_TAG}-sprite-selected span { color: var(--muted-foreground); text-transform: none; }
.${ELEMENT_TAG}-sprite-editor label { display: grid; gap: .25rem; font-size: .8125rem; }
.${ELEMENT_TAG}-sprite-editor label.${ELEMENT_TAG}-row { display: flex; align-items: center; }
.${ELEMENT_TAG}-sprite-editor textarea { min-height: 5rem; }
.${ELEMENT_TAG}-sprite-actions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.${ELEMENT_TAG}-sprite-candidate { display: grid; gap: .75rem; border: 1px solid var(--border); border-radius: .7rem; padding: .75rem; background: var(--popover); }
.${ELEMENT_TAG}-sprite-candidate-views { display: flex; flex-wrap: wrap; gap: .75rem; }
.${ELEMENT_TAG}-sprite-candidate-views > div { display: grid; gap: .25rem; justify-items: center; flex: 0 1 12rem; min-width: 0; font-size: .75rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-sprite-candidate-views img { display: block; width: 100%; height: 14rem; object-fit: contain; background: repeating-conic-gradient(#7773 0 25%, transparent 0 50%) 0 0/20px 20px; }
.${ELEMENT_TAG}-sprite-mirrored { transform: scaleX(-1); }
.${ELEMENT_TAG}-sprite-more { border-top: 1px solid var(--border); padding-top: .5rem; }
.${ELEMENT_TAG}-sprite-more summary { cursor: pointer; font-size: .8125rem; }
.${ELEMENT_TAG}-sprite-more > .${ELEMENT_TAG}-row { margin-top: .75rem; }
.${ELEMENT_TAG}-sprite-view:focus-visible, .${ELEMENT_TAG}-sprite-choice:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
/*
  THE ROOM'S OWN CAST, standing in the floor the villager stands in.

  A private conversation has one figure on the floor and the card repeats them a
  paragraph at a time. A room has everybody who was in it, and this is the same
  drawing made plural: the faces stand at the foot of the room as themselves
  rather than as the card's illustration of whoever happens to be talking.

  The ENGINE's own avatar frame is reused rather than a second frame at a second
  size, because the two things that frame has to do — clip a crop, and hold a
  person's initial — are done by that rule and would have to be copied to be done
  again. The row wraps, because a mill with six people in it is a mill with six
  people in it, and a row that overflowed the tab would push the plate off the
  bottom of it.
*/
.${ELEMENT_TAG}-chat-cast {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; justify-content: center;
  flex-wrap: nowrap; gap: .375rem;
  width: 100%; height: min(100%, 28rem); min-height: 0;
}
.${ELEMENT_TAG}-chat-cast-person {
  display: flex; flex: 0 1 27%; flex-direction: column; align-items: center; justify-content: flex-end;
  min-width: 0; height: 85%; color: var(--foreground); font-size: .6875rem;
  text-shadow: 0 1px 4px #000, 0 2px 8px #000;
}
.${ELEMENT_TAG}-chat-cast-person[data-active="true"] { flex-basis: 40%; height: 100%; }
.${ELEMENT_TAG}-chat-cast-person > img { display: block; width: 100%; height: calc(100% - 1.5rem); object-fit: contain; object-position: center bottom; filter: drop-shadow(0 .5rem .75rem #0009); }
.${ELEMENT_TAG}-chat-cast-person > img[data-framing="half"] { object-fit: cover; object-position: center top; }
.${ELEMENT_TAG}-chat-cast-person > img[data-facing="left"] { transform: scaleX(-1); }
.${ELEMENT_TAG}-chat-cast-person > .${ELEMENT_TAG}-avatar { width: min(7rem, 100%); height: auto; aspect-ratio: 1; }
.${ELEMENT_TAG}-chat-cast-person > span:not(.${ELEMENT_TAG}-avatar) { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: .15rem .35rem; border-radius: .35rem; background: #0009; }
.${ELEMENT_TAG}-chat-cast-rest { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; max-height: 2rem; overflow-y: auto; }
.${ELEMENT_TAG}-chat-cast-rest > span { display: inline-flex; align-items: center; gap: .2rem; padding: .1rem .35rem; border-radius: .35rem; background: #000a; color: white; font-size: .625rem; }
.${ELEMENT_TAG}-chat-cast-rest .${ELEMENT_TAG}-avatar { width: 1rem; height: 1rem; border-radius: 50%; overflow: hidden; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-activities { display: none; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-history-toggle { width: auto; height: auto; min-height: 2rem; align-self: center; padding: .2rem .65rem; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .5rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-text { font-size: .9375rem; line-height: 1.55; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-aside-text { font-size: .8125rem; line-height: 1.45; }
/* The plate is what makes the name readable over a picture, so it is drawn
   whether or not there is one behind it: place names are short, and a name that
   changed its contrast depending on the hour would be worse than a plain chip. */
.${ELEMENT_TAG}-chat-scene-place {
  position: relative; z-index: 1; max-width: 100%;
  border-radius: 999px; padding: .1875rem .5rem;
  background: color-mix(in srgb, var(--popover) 88%, transparent);
  font-size: .6875rem; color: var(--foreground); text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/*
  THE HISTORY, and the little tab that opens it.

  The log is the old transcript in a pane rather than in the tab's own flow: the
  villager's answers and the player's own lines, in order, in the bubbles they
  have always been drawn in, and the only change is that it is something the
  player OPENS rather than the only thing on screen. That is what the Engine's
  Visual Novel does, and it is why the card can show one paragraph at a time
  without the player losing the thread: the whole of the conversation is one press
  away, and it scrolls inside its own frame instead of growing the tab.

  It is capped in height rather than left to fill, and the cap is cqh for the
  same reason every other measurement in this sheet is: the container is the tab
  the Engine drew. What the cap buys is the stage — a history that grew to the
  ceiling of the tab would be a history with no room behind it, and the room is
  what the player is reading the conversation IN.

  READ ONLY, deliberately: nothing here can be edited, and the history is the
  village's own record of what was said rather than a draft.
*/
.${ELEMENT_TAG}-chat-log {
  display: flex; flex-direction: column; gap: .5rem;
  flex: 0 1 auto; min-height: 6rem; max-height: min(52cqh, 28rem); overflow-y: auto;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem; padding: .5rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .28);
}
/*
  THE LITTLE TAB, and it is the Engine's own.

  It used to be a labelled pill — a chevron and the words "Chat history" — and
  the words are the whole of what changed. The Engine's Visual Novel hangs a bare
  chevron the width of a thumb off the top of its card, and it can, because the
  card is directly under it and the thing being opened is obviously the history of
  the thing being read: the label was doing work the position had already done.

  The words are not gone, they are out of the way: the accessible name and the
  title still say "Show chat history" and "Return to Visual Novel" in both
  directions, so anything reading the tab aloud, and anything hovering it, is told
  exactly what the pill used to say.

  The shape is the Engine's shape, and the shape is the state: a tab rounded at
  the top and open at the bottom when the card is up, rounded at the bottom and
  open at the top when the history is, so the control and the thing it opened
  read as one object. The pseudo-element is the Engine's own trick — a hit area
  taller and wider than the drawing, so a 24-pixel tab is not a 24-pixel target
  on a phone.
*/
.${ELEMENT_TAG}-chat-tab { display: flex; justify-content: center; }
.${ELEMENT_TAG}-chat-history-toggle {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 2.5rem; height: 1.5rem; padding: 0; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-bottom: 0; border-radius: .5rem .5rem 0 0;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer; font-family: inherit;
}
.${ELEMENT_TAG}-chat-history-toggle::before { content: ""; position: absolute; inset: -.625rem -.25rem; }
.${ELEMENT_TAG}-chat-history-toggle:hover { color: var(--marinara-chat-chrome-highlight-text, var(--primary)); }
.${ELEMENT_TAG}-chat-history-toggle svg { width: .875rem; height: .875rem; }
.${ELEMENT_TAG}-chat-history-toggle[aria-expanded="true"] {
  margin-top: -1px;
  border-top: 0; border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: 0 0 .5rem .5rem;
}
/*
  THE READING CARD, and it is the Engine's visual-novel bubble.

  A surface of its own holding the speaker's face, the speaker's name and one
  paragraph of what they said, with the arrows under it to walk the rest. It is
  drawn at the FOOT of the stack, directly above the composer, because that is
  where the eye already is at the end of a turn — the player looks down at the box
  they type in, and the answer arrives just above it.

  The face and the name are the two things this card did not have and the Engine's
  has. A card that shows a paragraph of somebody's speech without saying who is
  speaking is a card that only works while there is a heading above it saying the
  same thing — and the heading is gone, because the Engine has no heading: it has
  a card with a face in it, which is the same statement made where the player is
  already looking.

  It is the ENGINE'S OWN double structure that puts the face in two places at
  once, and it is worth being plain about it: the Engine stands a sprite on the
  stage floor AND draws a square portrait in the card, because those are two
  different pictures — a body and a head. A village has one picture per villager,
  so both frames show it, and the one on the floor is the one the card is read
  across. The card's is the one that is always fully visible.

  THE PADDING IS ON THE ROW, not on the card, and that is the Engine's own
  structure rather than a preference: the Engine's plate holds a padded dialogue
  block and then a rule with the arrows in it, so the rule reaches both edges of
  the surface while the face and the words are held in from them. Padding on the
  card would inset the rule as well and draw a short line across the middle of the
  plate, which is a divider between nothing and nothing.
*/
.${ELEMENT_TAG}-chat-vn-card {
  display: flex; flex-direction: column;
  flex: 0 1 auto; min-height: 0; overflow: hidden;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .75rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 94%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .75rem 2rem rgba(0, 0, 0, .4);
}
/*
  The row and the column are the two boxes the reading shrinks inside of.

  flex-start on the row would size the column to its own content, and a box whose
  size IS its content is a box whose child cannot be made smaller than it — so the
  column stretches to the row instead and the reading is what gives way. That is
  the order the card yields in, and it is worth stating: the paragraph first, the
  arrows never. A paragraph is the one part of a card that can be scrolled, and a
  clipped arrow is a control the player cannot press at all.
*/
.${ELEMENT_TAG}-chat-vn-row {
  display: flex; gap: .75rem; min-width: 0; min-height: 0; align-items: flex-start;
  padding: .75rem;
}
.${ELEMENT_TAG}-chat-vn-portrait {
  position: relative; flex: 0 0 auto; align-self: flex-start;
  display: flex; align-items: center; justify-content: center;
  width: min(5rem, 26cqw); aspect-ratio: 1 / 1;
  border-radius: .75rem; border: 1px solid var(--border);
  background: var(--secondary);
  font-size: 1.25rem; font-weight: 600;
  overflow: hidden;
}
.${ELEMENT_TAG}-chat-vn-portrait > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-chat-vn-column { display: flex; flex-direction: column; gap: .5rem; min-width: 0; min-height: 0; align-self: stretch; flex: 1 1 auto; }
.${ELEMENT_TAG}-chat-vn-name {
  margin: 0; min-width: 0;
  font-size: .875rem; font-weight: 600; line-height: 1.3;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/*
  The paragraph, in a box with a ceiling on it.

  This is the one place the card CANNOT be allowed to grow, and the number is the
  Engine's own: min(30dvh, 18rem) there, min(30cqh, 18rem) here, for the reason
  every other measurement in this sheet is in cqh — the container is the tab, and
  in fullscreen the tab and the window are two different boxes. Thirty percent of
  the tab is where a long answer stops pushing the card up the screen and starts
  scrolling inside it, which is what keeps the figure on the floor visible and
  the composer where the player left it.

  That ceiling keeps the card from GROWING, and flex: 0 1 auto is what lets it
  SHRINK: a short tab takes its height off the paragraph rather than off the arrows
  under it, and the reading is the one box in the card that can give that height up
  without reading as broken.
*/
.${ELEMENT_TAG}-chat-vn-reading {
  flex: 0 1 auto; min-height: 0; max-height: min(30cqh, 18rem);
  overflow-y: auto; overscroll-behavior: contain;
  display: flex; flex-direction: column; gap: .375rem;
  padding-right: .25rem;
}
.${ELEMENT_TAG}-chat-vn-reading:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: .25rem; }
.${ELEMENT_TAG}-chat-vn-text {
  margin: 0; font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${ELEMENT_TAG}-chat-vn-text[data-empty="true"] { color: var(--muted-foreground); }
/*  The sentence a failed greeting is said in. The destructive colour is the one
    the rest of the sheet already uses for something that went wrong rather than
    something the player did, and the words themselves are deliberately plain:
    this is a villager who could not be reached, not a mistake anybody made. */
.${ELEMENT_TAG}-chat-vn-text[data-error="true"] { color: var(--destructive, #e5484d); }
/*
  THE TWO REGISTERS OF A BEAT, and they are the Engine's own.

  A villager's turn is two things at once: what they SAY, and the room going on
  around them. Game Mode draws those as two registers in one window, and what
  separates them is ATTRIBUTION rather than decoration:

    - somebody speaking is drawn under their own face and their own name
    - the room describing itself is drawn under the word NARRATION and a bubble
      with no face over it at all. The Engine's own comment on that branch is
      "no avatar", and the pill below is its pill, copied to the values:
      rounded-full, the muted wash, .625rem, uppercase, wide tracking.

  0.4.56 got the second one wrong, and the mistake is worth naming rather than
  only fixing. The description was drawn in a bubble INSIDE the speaking
  register — under the villager's name and under the villager's face — which
  reads as that villager having said it, quietly. The words were in the right
  place on the card and attributed to the wrong speaker.

  So the label below is the fix, and it is a register of its own rather than an
  extra: the head of the card carries the speaker's name OR the word NARRATION
  and never both, because a beat belongs to whoever spoke it or to the room, and
  to nothing in between. The bubble underneath is the room's, drawn with nobody
  standing behind it — see the chat-vn-beat rule below, which is the bubble and
  no longer the whole register.

  This is the SHAPE of a beat, and deliberately not its line TYPE. The Engine's
  stage draws three more registers beside speech — something said across a room,
  something said to one listener, and somebody's private thought — and a village
  with one villager in the room can produce none of them. data-register is
  therefore this tab saying which of the two drawings it used, and the line
  types arrive with the room that can produce one: "side" for something said
  aloud to everybody present, "whisper" for something said to one listener, and
  "thought" if a room ever wants it.

  THE LINE TYPES HAVE ARRIVED — the first two of them, and as a stored field
  rather than as a second read of the words. The package's own turn reader takes
  a side tag or a whisper tag with a listener's name off the front of a line,
  stores the register beside the prose, and writes the content with the tag taken
  off, so a message can now arrive knowing two things a paragraph shape cannot
  describe: a remark said aloud but not offered to whoever is in front of them,
  and something said to one listener alone. Both of those are ordinary sentences
  and there is no punctuation that makes them otherwise — which is exactly why
  the villager marks them and why the client must not guess.

  So data-register now carries four names rather than two, and it lives on the
  CARD rather than on the bubble. That is the whole reason for the move: the
  head of the card is the speaker's name for a spoken beat and the word NARRATION
  for a described one, the bubble is the plate for anything the villager said and
  the room's own bubble only for the room, an aside leaves the plate for a small
  floating bubble of its own — see the aside rules further down, which are the
  Engine's second surface for exactly those lines — and a card that announces
  which drawing it is in lets all three dress from one fact instead of three
  rules guessing at the same thing.

  "thought" is still not here, and the reason is not that it is hard. An inner
  monologue the player is SHOWN is a different decision from something said out
  of the side of somebody's mouth, and it is a decision about whether the player
  may see it at all. The name is free when somebody makes that decision.

  INTENDED, NOT BUILT: a sprite system, and an expression per beat.

  The Engine's stage puts a character on the floor of the visual novel and lets
  a line carry the expression that goes with it — the nine effects its
  ExpressionReaction table knows, keyed to a mood and pinned to the face in the
  portrait. Villages has no sprite layer at all yet, so there is nothing here to
  attach an expression to. When there is, this is where it goes: one expression
  per beat, read beside the register below and drawn on the portrait above, not
  as a second drawing of the same words somewhere else.
*/
.${ELEMENT_TAG}-chat-vn-label {
  margin: 0; align-self: flex-start;
  padding: .125rem .5rem; border-radius: 999px;
  background: color-mix(in srgb, var(--foreground) 12%, transparent);
  font-size: .625rem; font-weight: 600; line-height: 1.5;
  letter-spacing: .04em; text-transform: uppercase;
  color: var(--muted-foreground);
}
/*
  THE ASIDES, AND THEY ARE DRAWN IN THE BAND ABOVE THE PLATE.

  This is the box the bubbles stand in rather than a bubble itself, and it exists
  because of WHERE the Engine draws these lines rather than because of what they
  look like. A side remark is "a small floating box shown with the dialogue it
  follows", so it cannot be drawn inside the plate and it cannot be drawn inside
  the room's own portrait either. It goes in the band between them — the dead
  room the vignette leaves above the card — justified to the END of it, which is
  where the Engine puts it and which is also the side of the window that is not
  the speaker's own face.

  Four things are decided here and each of them is deliberate:

    - flex-end, so the bubbles stack against the right-hand edge and a short
      remark sits at the end of the band instead of floating in the middle of it.
      The bubbles themselves are therefore content-sized: end alignment does not
      stretch, so a bubble is as wide as its own words and no wider.

    - a CEILING, because a villager who writes six asides is not a reason for the
      plate to be pushed off the bottom of the tab. The Engine caps its own block
      at min(16rem, 38vh); this is the same idea at this surface's own number,
      and it is a cqh rather than a vh because in fullscreen the tab and the
      window are two different boxes. Past the ceiling it scrolls, exactly as the
      Engine's own block does.

    - nothing at all when it is empty. The block is not drawn at all rather than
      drawn empty, so a turn that carries no aside draws precisely what it drew
      before any of this existed — the stage does not lose a band's worth of room
      to a box with no bubbles in it.

    - a 75 percent cap on each bubble, which is the Engine's own ratio kept
      because it is what makes a bubble read as an aside rather than as another
      paragraph. It is the one measurement in here that comes off the Engine's
      window rather than off this card's own furniture.
*/
.${ELEMENT_TAG}-chat-vn-asides {
  display: flex; flex-direction: column; align-items: flex-end; gap: .375rem;
  flex: 0 1 auto; min-height: 0; max-height: min(12rem, 30cqh);
  overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain;
  padding-right: .25rem;
}
/*
  ONE BUBBLE, and it is the Engine's own small floating box copied to the values
  rather than imported: a round face a seventh of the card's own portrait, the
  type's mark beside the speaker's name at eleven pixels semibold, the listener
  after an arrow, and the words under both at twelve. The arrow is the Engine's
  own and so is the italic on a whisper, and both are kept because a whisper
  whose listener is not written down is an ordinary line with a symbol in front
  of it.

  Two translations, and both are forced by the surface underneath rather than
  chosen. The Engine draws these over a picture and fills them with black at
  three quarters, with a white hairline; this band is over a vignette and a card
  and not over a picture in the Engine's sense, so the same fill on it is a bubble
  with no edge at all — the fills are therefore this tab's own panel and border
  tokens at the Engine's own measured sizes, which is what makes the bubble read
  as a bubble here rather than as a hole in the stage. And the shadow is the
  Engine's, kept, because that is the half of the drawing that makes it float: a
  second surface that is only a second colour reads as another paragraph.

  flex: 0 0 auto, so a long bubble in a capped band scrolls rather than squashes.

  It has been in two wrong places before it got here, and both are worth naming
  because the sheet is where the mistake was both times. 0.4.56 drew an aside as
  a badge in the speaker's own row, which is a fact in the right place told inside
  the plate — the one thing the Engine never does with these lines. 0.4.57 took
  the badge out and pushed the whole bubble into the plate instead, which was
  worse: the aside stopped being a badge and started being the PARAGRAPH, so the
  line it followed left the card entirely and the player had to step the arrows
  to find it. This release fixes the second mistake and does not reintroduce the
  first: the plate is the plate, whatever the turn carries, and an aside is only
  ever something floating above it.
*/
.${ELEMENT_TAG}-chat-vn-aside {
  flex: 0 0 auto;
  display: flex; align-items: flex-start; gap: .5rem;
  max-width: 75%;
  padding: .5rem .75rem; border-radius: .75rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  box-shadow: 0 1rem 2.375rem rgba(0, 0, 0, .45);
}
/* The whisper is the one aside that changes colour as well as mark. It is the
   pair of tokens this sheet already reserves for the thing being pointed at, and
   the Engine's own whisper bubble is the same pair — a whisper is the register
   whose whole meaning is WHO it was aimed at, so it is the register that gets the
   colour that means pointed at. */
.${ELEMENT_TAG}-chat-vn-aside[data-register="whisper"] {
  border-color: var(--marinara-chat-chrome-button-border, var(--marinara-chat-chrome-panel-border, var(--border)));
}
.${ELEMENT_TAG}-chat-vn-aside-face {
  position: relative; flex: 0 0 auto; margin-top: .125rem;
  display: flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem;
  border-radius: 999px; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--secondary);
  font-size: .6875rem; font-weight: 600;
  overflow: hidden;
}
.${ELEMENT_TAG}-chat-vn-aside-face > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-chat-vn-aside-column { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }
.${ELEMENT_TAG}-chat-vn-aside-head {
  display: flex; align-items: center; gap: .375rem;
  margin: 0; min-width: 0;
}
.${ELEMENT_TAG}-chat-vn-aside-icon { flex: 0 0 auto; font-size: .5625rem; }
.${ELEMENT_TAG}-chat-vn-aside-name {
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .6875rem; font-weight: 600; line-height: 1.4;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
}
.${ELEMENT_TAG}-chat-vn-aside-target {
  flex: 0 0 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .5625rem; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-chat-vn-aside-text {
  margin: .125rem 0 0; min-width: 0;
  font-size: .75rem; line-height: 1.6; font-style: normal;
  white-space: pre-wrap; overflow-wrap: break-word;
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
}
.${ELEMENT_TAG}-chat-vn-aside[data-register="whisper"] .${ELEMENT_TAG}-chat-vn-aside-text { font-style: italic; }
.${ELEMENT_TAG}-chat-vn-beat {
  margin: 0; align-self: flex-start; max-width: 100%;
  padding: .5rem .625rem; border-radius: .625rem;
  border: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 60%, transparent));
  background: color-mix(in srgb, var(--foreground) 6%, transparent);
  color: var(--muted-foreground);
  font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
/*
  The marks a villager's line can carry, read by villages-inline-markdown.ts and
  assembled by renderVillagesMarkdown above.

  Only three of them need a rule. Bold and italic are the browser's own strong and
  em, and underline and strikethrough are the browser's own u and del, so the sheet
  says nothing about them; a code span, a link and a highlight would otherwise be
  indistinguishable from the words on either side of them.

  The Engine draws these same three — packages/client/src/styles/globals.css, at
  mari-md-inline-code and friends — and those rules cannot be borrowed, only
  copied: every one of them is scoped to mari-message-content, which is the
  Engine's chat bubble and not this card. The colours here are deliberately the
  Engine's, so a backtick span and a highlighted phrase look the same in a village
  as they do in a roleplay, and a highlight stays a colour the reader already
  knows rather than a new one this tab invented.
*/
.${ELEMENT_TAG}-chat-md-code {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: .85em; padding: .1em .35em; border-radius: 4px;
  background: rgba(255, 255, 255, .06); border: 1px solid rgba(255, 255, 255, .1);
  color: #e8e6e3; direction: ltr; unicode-bidi: isolate;
}
.${ELEMENT_TAG}-chat-md-link { color: var(--primary); text-decoration: underline; text-underline-offset: .12em; }
.${ELEMENT_TAG}-chat-md-link:hover { opacity: .85; }
.${ELEMENT_TAG}-chat-md-highlight {
  background: rgba(250, 204, 21, .15); color: #facc15;
  border-radius: 2px; padding: 0 .1em;
}
/*
  The arrows, drawn as a rule-separated row under the paragraph.

  They are hidden when there is nowhere to go at all, which is the common case for
  a short answer that came in one piece: a pair of dead arrows under every line of
  a village's small talk would be two controls that say "there is nothing more"
  fifty times a session. One step in either direction is enough to draw them, and
  the step may cross from one speaker to the other — the reading is the whole
  conversation, so the arrows walk out of the villager's line into the player's own
  and back again. The turns memo above the drawer is the list they walk.

  The rule above them is the Engine's own, drawn at half the weight of the card's
  edge because it separates two things inside one surface rather than ending a
  surface: the paragraph and the controls that walk it. The row carries the
  plate's own horizontal padding, so it reaches both edges of the plate while the
  two arrows sit in from them — the Engine's own inset, at the Engine's own size.

  The words are the Engine's own two as well, and they are worth being long: the
  card is one paragraph of a longer answer, and a control called Next on a card
  that is holding somebody's speech is a control next to what? The room above the
  arrows already knows where it is; the arrows are the only thing in the plate that
  has to say what they walk.
*/
.${ELEMENT_TAG}-chat-vn-nav {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  padding: .375rem .75rem;
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 50%, transparent));
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem;
}
.${ELEMENT_TAG}-chat-vn-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: .6875rem; opacity: .75;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}
.${ELEMENT_TAG}-chat-vn-button {
  display: inline-flex; align-items: center; gap: .25rem;
  border-radius: .25rem; padding: .25rem .5rem;
  background: transparent;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem; font-family: inherit; cursor: pointer;
  transition: background-color .15s ease;
}
.${ELEMENT_TAG}-chat-vn-button svg { width: .875rem; height: .875rem; }
.${ELEMENT_TAG}-chat-vn-button:hover { background: var(--marinara-chat-chrome-button-bg-hover, color-mix(in srgb, var(--foreground) 10%, transparent)); }
.${ELEMENT_TAG}-chat-vn-button:disabled {
  cursor: default; opacity: .3;
  pointer-events: none;
}
/*
  The wait: one dot going round at the end of the reading.

  It stands in for two sentences — "N is thinking..." in the card and "N is
  saying goodbye..." in the log — and that is the whole argument for it. A line
  saying that somebody is thinking is a line the player reads once and has to
  read again on every turn, and the only thing it carries that a moving dot does
  not is a name the tab already has across the top of it.

  It is drawn in the place the answer is about to arrive rather than in a corner
  of its own: at the head of the reading, directly under the last thing the
  villager said, which is where the eye already is at the end of a turn and where
  the reply will appear a moment later. The same row is drawn while the villager
  is finding their first line and while an ordinary reply is in flight, because
  both are the same fact.

  The dot is not announced. What it means for anybody who cannot see it is in a
  hidden span beside it, since a spinner on its own is nothing to read out.
*/
.${ELEMENT_TAG}-chat-pending { display: flex; justify-content: flex-start; margin: 0; }
.${ELEMENT_TAG}-chat-spinner {
  flex: 0 0 auto;
  width: .75rem; height: .75rem; border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--muted-foreground) 30%, transparent);
  border-top-color: var(--muted-foreground);
}
/*
  Words for the accessibility tree and nobody else.

  Not the display:none form, which takes them out of the tree as well, and not a
  zero-width box, which some readers skip: this is the shape that is laid out as
  a one-pixel box with a one-pixel clip, so it keeps its name without keeping any
  room on the screen. The package had none of these until the spinner needed one,
  because every other control in the tab says what it is in visible words.
*/
.${ELEMENT_TAG}-visually-hidden {
  position: absolute; width: 1px; height: 1px;
  margin: -1px; padding: 0; border: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
/*
  NEVER BREAK A WORD.

  overflow-wrap: anywhere is the one that looks harmless and is not. It lets the
  layout engine count a box's smallest possible width as a single character, so
  any box with no other floor shrinks until the letters stack one per line.
  GachaForge measured its narrowest rail drawing "Inven/tory/scree/n" at 33
  pixels of text width, and this keyword was the cause.

  break-word still breaks a word that cannot fit — a URL, a name with no spaces —
  but it does not tell the layout engine that every word is a thing to be broken
  up, so the box keeps a floor of its longest word instead of a floor of one
  letter.
*/
.${ELEMENT_TAG}-msg { max-width: 88%; border-radius: .625rem; padding: .4375rem .625rem; font-size: .75rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }
/*
  Two speakers, two washes.

  Both bubbles are the same construction: one soft gradient, light at the top
  left and very slightly deeper at the bottom right, mixed over the theme's own
  background so a change of theme carries through and so the mix knows how dark
  the surface it is landing on is. The text colour is --foreground in both cases
  and is never taken from the gradient, which is what keeps both readable in
  both themes: the wash is always most of the background's own colour, and
  --foreground is the colour the theme has already promised contrasts with that.

  The villager's is the quieter of the two — the theme's own accent at a low
  mix, which is a cool grey-blue in a dark theme and a pale lilac in a light
  one — because it is the surface an answer arrives on. The player's is a soft,
  light blue, built from a fixed blue HUE rather than from --primary: what makes
  it read as blue is the hue, and what makes it light or dark is the background
  it is mixed over. A hard-coded light blue would be unreadable in a dark theme
  and invisible in a light one, and the blue is the one thing here the player
  asked for by name.

  The player's is the stronger of the two on purpose: it is the one they wrote,
  it is the one they will look for, and if the two were equally loud the log
  would read as two people shouting, which is not what either of them is doing.
*/
.${ELEMENT_TAG}-msg[data-role="assistant"] {
  align-self: flex-start;
  background: linear-gradient(160deg, color-mix(in srgb, var(--primary) 14%, var(--background)), color-mix(in srgb, var(--primary) 6%, var(--background)));
  border: 1px solid var(--border);
}
.${ELEMENT_TAG}-msg[data-role="user"] {
  align-self: flex-end;
  background: linear-gradient(160deg, color-mix(in srgb, #60a5fa 26%, var(--background)), color-mix(in srgb, #60a5fa 13%, var(--background)));
  border: 1px solid color-mix(in srgb, #60a5fa 40%, transparent);
}
.${ELEMENT_TAG}-msg-pending { align-self: flex-start; font-size: .75rem; color: var(--muted-foreground); padding: .25rem .125rem; }
/*
  The judge's sentence, under the reply it produced. It is drawn as a footnote
  rather than a bubble because it is not something anybody said — it is the
  village's account of whether the player was believed, and the one place the
  player can find out why the answer went the way it did. The rule on the left
  is the whole of it: green for believed, red for not.
*/
.${ELEMENT_TAG}-ruling {
  align-self: stretch; margin: .125rem 0 0; padding: .25rem 0 .25rem .5rem;
  border-left: 2px solid var(--muted-foreground);
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-ruling[data-fulfilled="true"] { border-left-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-ruling[data-fulfilled="false"] { border-left-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  How to talk, behind one button.

  The three verbs used to be three pills in a row across the bar, and the row was
  the problem: "Chat", "Ask something" and "Fulfill something" are about thirty
  characters of the twenty a phone's bar has, so on the screen this tab shares with
  the Engine's own panels the row WAS the bar and the box the player types in was
  an afterthought under it. The Engine's own answer is the shape this copies — its
  Connections switcher — and the reason is the same: what would be a row of words
  on a phone becomes one small square with a glyph on it, and the words live in a
  menu above it where there is room to say what each one is. It is also the shape
  the composer wants at its left-hand edge, where the glyph it now sits at the end
  of a line of words rather than in a corner of the row: a control at the edge of
  a box that opens something should look like one.

  A CIRCLE rather than the toolbar's rounded square. The options button in the
  head is a square and it presses something; this one opens a menu, and two
  controls over the same photograph should not look like each other when they do
  different things. The Engine makes the same distinction — its own attach button
  is round and its toolbar squares are not — and both are drawn in the chrome's
  tokens, since the bar is a translucent surface over a picture and a control that
  was not would be a hole in it.
*/
.${ELEMENT_TAG}-chat-mode-button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; padding: .375rem; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${ELEMENT_TAG}-chat-mode-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${ELEMENT_TAG}-chat-mode-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${ELEMENT_TAG}-chat-mode-button:disabled { cursor: default; opacity: .5; }
.${ELEMENT_TAG}-chat-mode-button svg { width: 1rem; height: 1rem; }
/*
  The menu the button opens, modelled on the Connections switcher: a titled head
  over a list of rows, the row in force marked with a tick, and the whole thing
  bounded in both directions so a translation of the labels cannot push it off the
  tab. It is the second popover in the drawer and it is deliberately the same
  panel as the first — same tokens, same radius, same blur, same shadow — because
  a drawer with two kinds of menu in it is a drawer the player has to read twice.

  It opens UPWARD, off the box's own top edge, which is the other thing it has in
  common with the Connections switcher and with the Engine's own popovers: the box
  is on the floor of the tab, at the foot of the screen, and a menu that opened
  downward would be a menu off the bottom of it. It measures itself from the box
  rather than from the button inside it — the box is what the anchor inside it is
  static for, which is what puts the panel flush with the frame's top edge instead
  of a button's height into it.

  z-index 40 is the popover layer the options menu also sits on: both are drawn
  over the room, neither is ever over the other, since a press closes whichever
  one is not being pressed.
*/
.${ELEMENT_TAG}-chat-modes {
  position: absolute; left: 0; bottom: calc(100% + .375rem); z-index: 40;
  width: 15rem; max-width: min(15rem, 82cqw);
  max-height: min(20rem, 70cqh); overflow-y: auto;
  display: flex; flex-direction: column;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover, var(--background)));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35);
}
.${ELEMENT_TAG}-chat-modes-head {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .4375rem .625rem;
  font-size: .6875rem; font-weight: 600;
}
.${ELEMENT_TAG}-chat-modes-list { display: flex; flex-direction: column; gap: .125rem; padding: .25rem; }
.${ELEMENT_TAG}-chat-mode-item {
  display: flex; align-items: center; gap: .5rem; width: 100%;
  border: 0; border-radius: .5rem; padding: .4375rem .5rem;
  background: transparent; color: inherit;
  font-size: .75rem; font-family: inherit; text-align: left; cursor: pointer;
  transition: background-color .15s ease;
}
.${ELEMENT_TAG}-chat-mode-item:hover { background: color-mix(in srgb, var(--foreground) 10%, transparent); }
.${ELEMENT_TAG}-chat-mode-item[data-active="true"] { font-weight: 600; }
.${ELEMENT_TAG}-chat-mode-item:disabled { cursor: default; opacity: .5; }
.${ELEMENT_TAG}-chat-mode-item-label { flex: 1 1 auto; min-width: 0; }
.${ELEMENT_TAG}-chat-mode-item svg { width: .875rem; height: .875rem; flex: 0 0 auto; }
/*
  The one press in the menu that is not a mode.

  Leaving is a verb of the conversation rather than a way of being answered, so it
  is drawn under a rule at the foot of the list rather than beside the three that
  are: a player scanning the modes should not find walking out among them. It is
  still drawn only where there is a conversation to leave — see showLeave — and
  it is the press that spends the goodbye, which is why it is here rather than
  beside the ending that follows it.
*/
.${ELEMENT_TAG}-chat-modes-foot {
  display: flex; flex-direction: column;
  border-top: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .25rem;
}
.${ELEMENT_TAG}-chat-modes-foot > .${ELEMENT_TAG}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  Where the player says what they did for somebody.

  This is the third verb's box rather than a panel beside the ordinary one: the
  same composer, with the label and the claim input swapped in for the textarea,
  because a claim is still something being said to this villager and only one
  sentence is on the table at a time. The verbs underneath do not move, so
  changing your mind is pressing Chat and getting your half-written message back
  exactly as you left it — the draft belongs to the drawer, not to this box.
*/
.${ELEMENT_TAG}-claim { display: flex; flex-direction: column; gap: .375rem; }
.${ELEMENT_TAG}-composer { display: flex; flex-direction: column; gap: .375rem; }
.${ELEMENT_TAG}-textarea {
  width: 100%; box-sizing: border-box; resize: vertical; min-height: 3.25rem; max-height: 9rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .75rem; font-family: inherit; line-height: 1.5;
}
/*
  One row under the box, and it is the Engine's own composer.

  It used to be a grid of three columns — Leave on the left, the verbs centred,
  Send on the right — and 0.4.49 takes it apart for the shape the Engine's own
  roleplay composer has. 0.4.50 finishes the job: the way to talk moved inside the
  box, at its left-hand edge, where the press that sends already was at its
  right-hand edge — so the only thing left in this row is the box itself. Nothing
  is pinned to a corner because nothing is in a corner any more: how to talk is a
  menu rather than a row of words. Conclude selects an ending in that menu, and
  Send performs it.

  It stays a row of its own rather than being folded into the composer above it,
  because the box is what the row is for and a wrapper that says so reads better
  than a column whose only child is the thing the column is named after. The one
  child still takes the row: flex 1 1 auto with min-width 0, so a long line wraps
  inside the box rather than widening the row past the tab, and the box is the
  thing that shrinks on a narrow tab — the override that used to spread Leave and
  Send across two rows went with them.
*/
.${ELEMENT_TAG}-composer-row { display: flex; }
.${ELEMENT_TAG}-composer-row > .${ELEMENT_TAG}-claim,
.${ELEMENT_TAG}-composer-row > .${ELEMENT_TAG}-chat-input { flex: 1 1 auto; min-width: 0; }
/*
  The box, and both of the glyphs that belong to it.

  The press that sends is INSIDE the box, on its right-hand edge, and so is the
  button that chooses how the line will be taken, at its left-hand edge. The
  second one is what 0.4.50 moved: the box used to be the frame around the
  player's words with the way to talk standing outside it in the row, which made
  that button the one piece of the composer that was not in the composer. Both are
  glyphs, both are inside the same frame as the words they act on, and both are
  centred on the frame's height. The words are the only thing whose height
  changes as they wrap.

  The frame is the ENGINE'S OWN input shell, in the Engine's own words: the same
  rounded-2xl radius, the same input border and input fill, the same blurred
  backdrop, and the same focus behaviour — the border lights up and a one-pixel
  ring goes round the whole box when the caret is anywhere inside it, which is why
  the ring is on :focus-within rather than on the textarea. The press used to be a
  glyph button floating over a framed textarea's right edge; two frames around one
  act were one frame too many, and the shell is the one the Engine's composer
  already wears.

  The textarea inside it is stripped of its frame rather than given a second one:
  no border, no fill, no resize grip. The grip matters — a dragged corner would
  sit exactly where the glyph now is. The room composer grows from one line to
  two and then scrolls inside the frame.

  The button that sends is a glyph rather than a word in every one of the three
  verbs. The box already says what mode the player is in, so a label saying Send,
  Tell them or anything else would be a second statement of the same thing in the
  one part of the tab where there is no room for it. What it does NOT do is move
  when it does: the disabled state is the whole difference between an empty box
  and a full one, and it is opacity, which is what the Engine uses too.
*/
.${ELEMENT_TAG}-chat-input {
  position: relative; display: flex; align-items: center; gap: .5rem;
  padding: .375rem .5rem;
  border: 1px solid var(--marinara-chat-chrome-input-border, var(--border));
  border-radius: 1rem;
  background: var(--marinara-chat-chrome-input-bg, var(--background));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  box-shadow: 0 .0625rem .125rem rgba(0, 0, 0, .18);
  backdrop-filter: blur(12px);
  transition: border-color .2s ease, box-shadow .2s ease;
}
.${ELEMENT_TAG}-chat-input:focus-within {
  border-color: var(--marinara-chat-chrome-input-border-focus, var(--primary));
  box-shadow: 0 0 0 1px var(--marinara-chat-chrome-focus-ring, var(--primary));
}
/*
  The way to talk, at the frame's left-hand edge.

  Static rather than relative, and that is the whole of what this rule is for:
  the anchor is the thing the menu above it measures itself from, so taking its
  own positioning away hands that job up to the box, which is the nearest
  positioned thing over it. The menu therefore opens off the box's own top edge
  rather than off a button sitting in the middle of it — flush with the frame
  instead of a button's height into it.

  It keeps its own width, because it is a glyph and not a thing that stretches:
  flex 0 0 auto, so a long line cannot squash the control that says how the line
  will be read.
*/
.${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-chat-menu-anchor { position: static; flex: 0 0 auto; }
/*
  The words, and the only thing in the frame that is allowed to change height.

  Its own horizontal padding is gone, because the glyphs beside it hold its two
  edges apart now: the frame's padding is the inset, and a second one inside the
  frame would be two insets for one gap. What is left is the vertical inset that
  keeps the first line off the frame's top edge.
*/
.${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-textarea {
  flex: 1 1 auto; min-width: 0;
  border: 0; border-radius: 0; box-shadow: none; resize: none;
  background: transparent; color: inherit;
  min-height: 2.75rem; max-height: 9rem;
  padding: .3125rem 0;
}
/*
  The sentence the frame says when there is nothing to put in it.

  It is drawn INSIDE the frame rather than in the frame's place, because the frame
  carries the way back to the other verbs: a claim with nothing to settle is the
  one state where the player has a box they cannot type in, and a state with no
  frame would be a state with no way out of the verb. The sentence stretches to
  fill what the glyph beside it leaves and is a wrapping item rather than a rigid
  one, so it wraps inside the box instead of widening it.
*/
.${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-hint { flex: 1 1 auto; min-width: 0; }
.${ELEMENT_TAG}-chat-send {
  display: inline-flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
  width: 1.75rem; height: 1.75rem; padding: 0; box-sizing: border-box;
  border: 1px solid transparent; border-radius: 999px;
  background: transparent; color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${ELEMENT_TAG}-chat-send:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${ELEMENT_TAG}-chat-send:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${ELEMENT_TAG}-chat-send:disabled { cursor: default; opacity: .45; }
.${ELEMENT_TAG}-chat-send:disabled:hover {
  border-color: transparent; background: transparent;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
.${ELEMENT_TAG}-chat-send svg { width: 1rem; height: 1rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-send {
  width: auto; min-width: 4.5rem; height: 2.75rem; padding: 0 .75rem;
  border-color: var(--primary); border-radius: .75rem;
  background: var(--primary); color: var(--primary-foreground, white);
  font-size: .75rem; font-weight: 700; touch-action: manipulation;
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-mode-button {
  width: auto; min-width: 4.5rem; height: 2.25rem; padding: 0 .625rem;
  border-radius: .625rem; font-size: .75rem; font-weight: 700; white-space: nowrap;
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-send:hover:not(:disabled) {
  background: var(--primary); color: var(--primary-foreground, white);
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-pending { align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-pending-label { font-size: .75rem; }
.${ELEMENT_TAG}-room-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .375rem; }
.${ELEMENT_TAG}-room-mode {
  min-width: 0; min-height: 2.5rem; padding: .375rem .25rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); color: var(--foreground);
  font: inherit; font-size: .75rem; font-weight: 600; cursor: pointer;
}
.${ELEMENT_TAG}-room-mode[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 18%, var(--popover)); color: var(--primary); }
.${ELEMENT_TAG}-room-mode:disabled { opacity: .5; cursor: default; }
.${ELEMENT_TAG}-room-mode:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${ELEMENT_TAG}-room-error {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .625rem; padding: .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 9%, var(--popover));
  color: var(--destructive, #e5484d); font-size: .75rem;
}
.${ELEMENT_TAG}-room-error p { margin: 0; flex: 1 1 12rem; overflow-wrap: anywhere; }
.${ELEMENT_TAG}-room-error .${ELEMENT_TAG}-button { flex: 0 0 auto; border-color: currentColor; color: inherit; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat[data-opening-error="true"] .${ELEMENT_TAG}-chat-vn { display: none; }
.${ELEMENT_TAG}-hint { font-size: .625rem; color: var(--muted-foreground); }
/* Said in the colour a warning is said in, so enlarging a small picture is not
   something the player has to notice for themselves. */
.${ELEMENT_TAG}-hint[data-tone="warn"] { color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-field { display: flex; flex-direction: column; gap: .25rem; margin-top: .625rem; }
.${ELEMENT_TAG}-label { font-size: .6875rem; font-weight: 600; color: var(--muted-foreground); }
/* A switch is the box and its words as one control. Clicking the sentence
   toggles it, which is what every settings list is expected to do. */
.${ELEMENT_TAG}-switch { display: flex; align-items: flex-start; gap: .4375rem; font-size: .75rem; line-height: 1.5; cursor: pointer; }
.${ELEMENT_TAG}-switch[data-disabled="true"] { cursor: default; opacity: .5; }
.${ELEMENT_TAG}-switch input { flex: none; margin: .1875rem 0 0; accent-color: var(--primary); }
.${ELEMENT_TAG}-switch-hours { font-size: .625rem; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
/* Indented under the master switch, because it is what the master switch is
   holding open rather than a second, unrelated question. */
.${ELEMENT_TAG}-switches { display: grid; gap: .25rem; margin-top: .125rem; padding-left: 1.3125rem; }
/*
  The three places a panel opens a scrolling list inside a panel that already
  scrolls. Each ceiling is whichever is smaller: the length it has always had, or
  a share of the tab's height. On any tab big enough for the old number the old
  number is what binds, so nothing on a monitor moves; on a short tab the inner
  box stops being taller than the screen it is on, which is what turns one scroll
  region into two nested ones.
*/
.${ELEMENT_TAG}-preset {
  width: 100%; box-sizing: border-box; resize: vertical;
  min-height: 11rem; max-height: min(24rem, 60cqh);
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .6875rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${ELEMENT_TAG}-macros { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .5rem; }
.${ELEMENT_TAG}-macro {
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--background); color: var(--foreground);
  padding: .1875rem .4375rem; cursor: pointer;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${ELEMENT_TAG}-macro:hover { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-macro-help { margin: .5rem 0 0; font-size: .625rem; line-height: 1.55; color: var(--muted-foreground); }
/* A control that is switched off while the village setup flow which will owe it
   is still being written. The prose around it stays at full strength, because
   the reason it is off is the thing worth reading; the control itself is dimmed
   so nobody tries to type into a box that will not take the letters. */
.${ELEMENT_TAG}-off { opacity: .5; }
/*
  A translation prompt, printed verbatim. Monospaced and scrollable, because it
  is read as the thing being worked on rather than as prose: a prompt reflowed
  into a paragraph is a prompt nobody can compare against the one they meant to
  write. The cap is here rather than on the overlay so that a villager with a
  long week cannot push the whole panel off the bottom of the tab.
*/
.${ELEMENT_TAG}-prompt {
  margin: .5rem 0 0; padding: .4375rem .5rem;
  max-height: min(18rem, 55cqh); overflow: auto;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  font-size: .625rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${ELEMENT_TAG}-notice-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-notice-row > span { flex: 1 1 auto; min-width: 0; }
.${ELEMENT_TAG}-notice-author { font-weight: 600; color: var(--foreground); }
.${ELEMENT_TAG}-notice-add { display: flex; gap: .5rem; margin-top: .625rem; }
.${ELEMENT_TAG}-notice-input {
  flex: 1 1 auto; min-width: 0; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
/*
  A place and its picture: the picture on the left, its name and the buttons
  that act on it on the right. A grid rather than a flex row so the names line
  up down the column even when one of them wraps to two lines, which is what
  makes the list read as a list instead of as a stack of unrelated things.
*/
.${ELEMENT_TAG}-places { margin: .5rem 0 0; padding: 0; list-style: none; display: grid; gap: .625rem; }
.${ELEMENT_TAG}-place { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .625rem; align-items: start; }
.${ELEMENT_TAG}-place-thumb {
  width: 4.5rem; height: 3rem; display: block; object-fit: cover;
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
/* Empty is drawn as empty — dashed rather than solid — so "no picture yet" is
   visibly a state the village is in rather than a picture that failed. */
.${ELEMENT_TAG}-place-thumb[data-empty="true"] { border-style: dashed; }
.${ELEMENT_TAG}-place-body { display: flex; flex-direction: column; gap: .25rem; min-width: 0; }
.${ELEMENT_TAG}-place-name { font-size: .75rem; font-weight: 600; color: var(--foreground); overflow-wrap: break-word; }
/* The buttons hug the name rather than sitting a row's gap below it: the row
   margin is right for a row under a paragraph and wrong for one under a label. */
.${ELEMENT_TAG}-place-body .${ELEMENT_TAG}-row { margin-top: 0; }
.${ELEMENT_TAG}-place-body .${ELEMENT_TAG}-file { font-size: .625rem; }
/*
  THE PLACE ITSELF, as the screen that stands in it: its picture on one side and
  what the village knows on the other.

  flex-wrap rather than a media query, because the tab is not the window. In
  fullscreen the Engine hands this package a box whose width has nothing to do
  with the viewport, so a query on max-width would be answering a different
  question; two items whose bases add up to more than the row fall onto two rows
  wherever that line happens to be. The picture keeps its basis and the text grows
  into the rest, so the only two shapes are "beside" and "under".

  A place nobody has drawn is the same box with nothing in it, dashed, which is
  the statement the places list already makes for a picture that is not there yet.
*/
.${ELEMENT_TAG}-venue { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: .875rem; align-items: flex-start; }
.${ELEMENT_TAG}-venue-exterior { flex: 0 1 18rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
.${ELEMENT_TAG}-venue-picture {
  flex: 0 1 18rem; min-width: 0; box-sizing: border-box;
  aspect-ratio: 4 / 3; border-radius: .625rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
.${ELEMENT_TAG}-venue-picture:not([data-empty="true"]) {
  display: block; width: 100%; object-fit: cover; border: 1px solid var(--border);
}
.${ELEMENT_TAG}-venue-picture[data-empty="true"] {
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed var(--border); padding: .5rem; text-align: center;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-venue-body { flex: 1 1 20rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
/* The buttons hug the beat above them rather than sitting a row's margin below it,
   which is the same substitution the places list makes under a name. */
.${ELEMENT_TAG}-venue-body .${ELEMENT_TAG}-row { margin-top: 0; }
/* The look-around is the one paragraph on this screen, so it is set at reading
   size rather than at the sheet's label size. */
.${ELEMENT_TAG}-venue-beat { margin: 0; font-size: .875rem; line-height: 1.65; }
.${ELEMENT_TAG}-venue-page, .${ELEMENT_TAG}-venue-editor-page, .${ELEMENT_TAG}-venue-proposal-page {
  display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;
}
.${ELEMENT_TAG}-venue-hero {
  display: grid; grid-template-columns: minmax(15rem, 30rem) minmax(15rem, 38rem);
  gap: 1rem; align-items: start;
}
.${ELEMENT_TAG}-venue-hero > .${ELEMENT_TAG}-venue-picture,
.${ELEMENT_TAG}-venue-hero > .${ELEMENT_TAG}-venue-image-empty {
  width: 100%; min-height: 0; max-height: 22.5rem; aspect-ratio: 4 / 3;
}
.${ELEMENT_TAG}-venue-context, .${ELEMENT_TAG}-venue-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: 1rem;
}
.${ELEMENT_TAG}-venue-context p, .${ELEMENT_TAG}-venue-card p { margin: 0; }
.${ELEMENT_TAG}-venue-context { align-self: center; }
.${ELEMENT_TAG}-venue-space-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
.${ELEMENT_TAG}-venue-card .${ELEMENT_TAG}-venue-space-picture {
  width: 100%; max-width: none; max-height: 16rem; aspect-ratio: 16 / 10;
}
.${ELEMENT_TAG}-venue-image-empty {
  display: grid; place-items: center; width: 100%; min-height: 10rem; max-height: 16rem;
  border: 1px dashed var(--border); border-radius: .625rem; color: var(--muted-foreground);
  background: var(--background); text-align: center; font-size: .75rem;
}
.${ELEMENT_TAG}-venue-visit-picker { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-venue-scene-details { width: 100%; border-top: 1px solid var(--border); padding-top: .5rem; }
.${ELEMENT_TAG}-venue-scene-details summary { cursor: pointer; font-weight: 600; }
.${ELEMENT_TAG}-venue-scene-details[open] { display: flex; flex-direction: column; gap: .625rem; }
@media (max-width: 700px) {
  .${ELEMENT_TAG}-venue-hero { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-venue-page .${ELEMENT_TAG}-button,
  .${ELEMENT_TAG}-venue-editor-page .${ELEMENT_TAG}-button,
  .${ELEMENT_TAG}-venue-proposal-page .${ELEMENT_TAG}-button { min-height: 2.5rem; }
}
/*
  The village story. A flat list under a date heading, scrolled by the overlay
  it sits in, with a monospaced stamp on the memories that carry one. The max
  height is here rather than on the overlay so a very old village cannot push
  the panel taller than the tab.
*/
.${ELEMENT_TAG}-story { margin: 0 0 .75rem; padding: 0; list-style: none; display: grid; gap: .375rem; max-height: min(26rem, 60cqh); overflow-y: auto; }
.${ELEMENT_TAG}-story-day {
  position: sticky; top: 0; z-index: 1; margin: 0 0 .375rem;
  background: var(--background); padding: .125rem 0;
  font-size: .625rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-story-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-story-row > span { flex: 1 1 auto; min-width: 0; }
.${ELEMENT_TAG}-story-meta {
  display: block; margin-bottom: .0625rem;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--muted-foreground);
}
.${ELEMENT_TAG}-story-scope { color: var(--primary); }
/* Villagers → Memories: a calm library, not a diagnostic table. */
.${ELEMENT_TAG}-villager-submenu {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: 0 0 1rem;
  padding: .3rem; border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
  border-radius: .85rem; background: color-mix(in srgb, var(--muted) 55%, transparent);
}
.${ELEMENT_TAG}-villager-submenu button {
  display: flex; flex-direction: column; align-items: flex-start; gap: .12rem; min-width: 0;
  border: 0; border-radius: .62rem; padding: .62rem .8rem; background: transparent; color: var(--muted-foreground);
  text-align: left; cursor: pointer; transition: background .16s ease, color .16s ease, box-shadow .16s ease;
}
.${ELEMENT_TAG}-villager-submenu button[data-active="true"] {
  background: var(--background); color: var(--foreground); box-shadow: 0 1px 8px color-mix(in srgb, #000 12%, transparent);
}
.${ELEMENT_TAG}-villager-submenu span { font-size: .8rem; font-weight: 700; }
.${ELEMENT_TAG}-villager-submenu small { overflow: hidden; max-width: 100%; font-size: .64rem; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-memory-library { display: flex; flex-direction: column; gap: 1rem; }
.${ELEMENT_TAG}-memory-hero {
  display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(12rem, .8fr); gap: 1rem; padding: 1.15rem;
  overflow: hidden; border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--border)); border-radius: 1rem;
  background:
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--primary) 23%, transparent), transparent 37%),
    linear-gradient(145deg, color-mix(in srgb, var(--popover) 95%, transparent), color-mix(in srgb, var(--muted) 62%, transparent));
}
.${ELEMENT_TAG}-memory-kicker { font-size: .62rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--primary); }
.${ELEMENT_TAG}-memory-hero h3 { margin: .28rem 0 .38rem; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.15rem, 3vw, 1.7rem); font-weight: 500; }
.${ELEMENT_TAG}-memory-hero p { max-width: 50rem; margin: 0; color: var(--muted-foreground); font-size: .76rem; line-height: 1.55; }
.${ELEMENT_TAG}-memory-stats { display: grid; grid-template-columns: repeat(3, 1fr); align-self: stretch; gap: .4rem; }
.${ELEMENT_TAG}-memory-stats span { display: flex; flex-direction: column; justify-content: center; min-width: 0; border: 1px solid color-mix(in srgb, var(--border) 72%, transparent); border-radius: .72rem; padding: .62rem .35rem; background: color-mix(in srgb, var(--background) 78%, transparent); text-align: center; color: var(--muted-foreground); font-size: .6rem; }
.${ELEMENT_TAG}-memory-stats strong { color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: 1.28rem; font-weight: 500; }
.${ELEMENT_TAG}-memory-layers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${ELEMENT_TAG}-memory-layers article { display: grid; grid-template-columns: auto 1fr; gap: .05rem .48rem; border: 1px solid var(--border); border-radius: .72rem; padding: .65rem .72rem; background: color-mix(in srgb, var(--background) 74%, transparent); }
.${ELEMENT_TAG}-memory-layers article > span { grid-row: 1 / span 2; color: color-mix(in srgb, var(--primary) 72%, var(--muted-foreground)); font: 700 .58rem/1.35 ui-monospace, monospace; }
.${ELEMENT_TAG}-memory-layers strong { font-size: .7rem; }
.${ELEMENT_TAG}-memory-layers p { margin: 0; color: var(--muted-foreground); font-size: .62rem; line-height: 1.35; }
.${ELEMENT_TAG}-memory-health { display: flex; align-items: center; gap: .7rem; border: 1px solid color-mix(in srgb, #d59a34 50%, var(--border)); border-radius: .72rem; padding: .66rem .78rem; background: color-mix(in srgb, #d59a34 9%, var(--background)); }
.${ELEMENT_TAG}-memory-health > span { color: #d59a34; font-size: 1.2rem; }
.${ELEMENT_TAG}-memory-health > div { flex: 1; min-width: 0; }
.${ELEMENT_TAG}-memory-health strong { font-size: .72rem; }
.${ELEMENT_TAG}-memory-health p { margin: .08rem 0 0; color: var(--muted-foreground); font-size: .62rem; }
.${ELEMENT_TAG}-memory-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-memory-toolbar input { flex: 1 1 12rem; min-width: 0; }
.${ELEMENT_TAG}-memory-toolbar input, .${ELEMENT_TAG}-memory-toolbar select { min-height: 2.25rem; border: 1px solid var(--border); border-radius: .58rem; padding: .42rem .62rem; background: var(--background); color: var(--foreground); font-size: .72rem; }
.${ELEMENT_TAG}-memory-tabs { display: flex; gap: .18rem; border: 1px solid var(--border); border-radius: .6rem; padding: .2rem; background: var(--muted); }
.${ELEMENT_TAG}-memory-tabs button { border: 0; border-radius: .4rem; padding: .38rem .62rem; background: transparent; color: var(--muted-foreground); font-size: .68rem; cursor: pointer; }
.${ELEMENT_TAG}-memory-tabs button[data-active="true"] { background: var(--background); color: var(--foreground); box-shadow: 0 1px 4px color-mix(in srgb, #000 12%, transparent); }
.${ELEMENT_TAG}-memory-section { display: flex; flex-direction: column; gap: .55rem; }
.${ELEMENT_TAG}-memory-section-head { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
.${ELEMENT_TAG}-memory-section-head > div { display: flex; align-items: center; gap: .48rem; min-width: 0; }
.${ELEMENT_TAG}-memory-section-head h3 { margin: 0; font-size: .78rem; }
.${ELEMENT_TAG}-memory-section-head > span { color: var(--muted-foreground); font-size: .62rem; }
.${ELEMENT_TAG}-memory-orb { display: grid; place-items: center; width: 1.55rem; height: 1.55rem; border-radius: 50%; font-size: .72rem; }
.${ELEMENT_TAG}-memory-orb[data-kind="passing"] { background: color-mix(in srgb, #60a5fa 16%, transparent); color: #60a5fa; }
.${ELEMENT_TAG}-memory-orb[data-kind="durable"] { background: color-mix(in srgb, #e5b94b 17%, transparent); color: #dcae35; }
.${ELEMENT_TAG}-memory-orb[data-kind="archive"] { background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary); }
.${ELEMENT_TAG}-memory-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: .62rem; }
.${ELEMENT_TAG}-memory-card { display: flex; flex-direction: column; gap: .58rem; min-width: 0; border: 1px solid var(--border); border-radius: .82rem; padding: .8rem; background: color-mix(in srgb, var(--popover) 94%, transparent); box-shadow: 0 5px 20px color-mix(in srgb, #000 6%, transparent); }
.${ELEMENT_TAG}-memory-card[data-kind="passing"] { border-left: 3px solid color-mix(in srgb, #60a5fa 72%, var(--border)); }
.${ELEMENT_TAG}-memory-card[data-kind="durable"] { border-left: 3px solid color-mix(in srgb, #e5b94b 78%, var(--border)); }
.${ELEMENT_TAG}-memory-card-top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; color: var(--muted-foreground); font-size: .6rem; }
.${ELEMENT_TAG}-memory-pill { overflow: hidden; border-radius: 999px; padding: .2rem .42rem; background: color-mix(in srgb, var(--primary) 11%, var(--muted)); color: color-mix(in srgb, var(--primary) 82%, var(--foreground)); font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-memory-text { margin: 0; color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: .9rem; line-height: 1.45; }
.${ELEMENT_TAG}-memory-card dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .38rem; margin: 0; }
.${ELEMENT_TAG}-memory-card dl > div { min-width: 0; border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent); padding-top: .38rem; }
.${ELEMENT_TAG}-memory-card dt { color: var(--muted-foreground); font-size: .55rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.${ELEMENT_TAG}-memory-card dd { overflow: hidden; margin: .08rem 0 0; font-size: .66rem; text-overflow: ellipsis; }
.${ELEMENT_TAG}-memory-reinforced, .${ELEMENT_TAG}-memory-footnote, .${ELEMENT_TAG}-memory-legacy { margin: 0; color: var(--muted-foreground); font-size: .6rem; }
.${ELEMENT_TAG}-memory-card-actions { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: auto; }
.${ELEMENT_TAG}-memory-card-actions button, .${ELEMENT_TAG}-memory-evidence button { border: 0; padding: .18rem 0; background: transparent; color: var(--primary); font-size: .64rem; font-weight: 700; cursor: pointer; }
.${ELEMENT_TAG}-memory-card-actions button:last-child { color: var(--muted-foreground); }
.${ELEMENT_TAG}-memory-empty { display: grid; place-items: center; min-height: 10rem; border: 1px dashed var(--border); border-radius: .82rem; padding: 1rem; text-align: center; color: var(--muted-foreground); }
.${ELEMENT_TAG}-memory-empty span { color: var(--primary); font-size: 1.35rem; }
.${ELEMENT_TAG}-memory-empty h3 { margin: .25rem 0 0; color: var(--foreground); font-size: .82rem; }
.${ELEMENT_TAG}-memory-empty p { margin: .15rem 0 0; font-size: .68rem; }
.${ELEMENT_TAG}-memory-evidence { display: flex; flex-direction: column; gap: .58rem; border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border)); border-radius: .82rem; padding: .82rem; background: color-mix(in srgb, var(--primary) 4%, var(--background)); }
.${ELEMENT_TAG}-memory-evidence > p { margin: 0; color: var(--muted-foreground); font-size: .64rem; }
.${ELEMENT_TAG}-memory-evidence ol { display: grid; gap: .42rem; margin: 0; padding: 0; list-style: none; }
.${ELEMENT_TAG}-memory-evidence li { border-left: 2px solid color-mix(in srgb, var(--primary) 46%, var(--border)); padding: .45rem .55rem; background: color-mix(in srgb, var(--popover) 88%, transparent); font-size: .72rem; line-height: 1.45; }
.${ELEMENT_TAG}-memory-evidence li > span { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; margin-bottom: .16rem; }
.${ELEMENT_TAG}-memory-evidence small { color: var(--muted-foreground); font-size: .56rem; font-weight: 400; }
@media (max-width: 700px) {
  .${ELEMENT_TAG}-memory-hero { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-memory-layers { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-memory-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .${ELEMENT_TAG}-memory-toolbar > input { order: -1; flex-basis: 100%; }
  .${ELEMENT_TAG}-memory-section-head > span { display: none; }
}
.${ELEMENT_TAG}-wish-card {
  padding: .625rem .75rem; border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); font-size: .75rem; line-height: 1.4;
}
.${ELEMENT_TAG}-wish-card p { margin: 0; }
.${ELEMENT_TAG}-wish-card p + p { margin-top: .25rem; }
.${ELEMENT_TAG}-wish-text { color: var(--foreground); font-weight: 600; }
.${ELEMENT_TAG}-wish-tell { color: var(--muted-foreground); }
.${ELEMENT_TAG}-wish-meta { color: var(--muted-foreground); font-size: .6875rem; }
/*
  The schedules panel's own explanation, shut.

  The panel used to open with three paragraphs of prose, and print the whole
  translation prompt under every villager, before a reader had seen an hour of
  anybody's day: the answers sat below the documentation for them. The prose and
  the prompt are what a reader reaches for when a row reads wrong, so they are
  kept exactly as they were written and put behind a disclosure rather than cut.
  What stays open is the week itself — the name, the badges, the timetable, and
  the two labelled lines inside each block — so the panel reads as a week first
  and as an explanation second.

  The summary is a button and the marker is hidden for the same reason the news
  toggle hides its own: the browser's triangle cannot be sized, coloured or placed
  with the rest of the control, and the button already says it can be pressed. The
  body carries no frame of its own because what is inside it does — the sentences
  are prose and the prompt is a scroll box of its own.
*/
.${ELEMENT_TAG}-agenda-notes { margin: 0 0 .625rem; }
.${ELEMENT_TAG}-agenda-notes > summary {
  display: inline-flex; align-items: center; gap: .3125rem;
  list-style: none; cursor: pointer;
}
.${ELEMENT_TAG}-agenda-notes > summary::-webkit-details-marker { display: none; }
.${ELEMENT_TAG}-agenda-notes > summary::marker { content: ""; }
.${ELEMENT_TAG}-agenda-notes[open] > summary { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-agenda-notes-body { display: flex; flex-direction: column; gap: .5rem; margin: .4375rem 0 0; }
/*
  A day the Engine's week has nothing in, drawn as an absence. Muted rather than
  coloured and italic rather than plain, because it is the one row in this list
  that is not an event: the label above it is a real day and the hours under it
  really are empty, so the row that says so has to look like a note rather than
  like something a villager is doing.
*/
.${ELEMENT_TAG}-story-blank { color: var(--muted-foreground); font-style: italic; opacity: .75; }
.${ELEMENT_TAG}-row { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .75rem; }

/*
  The week, resident by resident, shut.

  Every resident is a disclosure and every one of them starts shut, because the
  panel is opened to CHECK one week rather than to read a village: shut, it is a
  list of names with their state beside them, which is the question a reader
  arrives with. The summary carries the heading's type rather than a button's,
  because it is a heading rather than a control, and the browser's own triangle is
  hidden for the reason the news toggle hides its own: it cannot be sized or
  placed with the rest of the control.

  The frame is the sheet's ordinary border and background, so an open resident
  reads as one card among several rather than as a run-on list.
*/
.${ELEMENT_TAG}-week {
  display: block; margin: 0 0 .5rem; padding: .5rem .625rem;
  border: 1px solid var(--border); border-radius: .5rem; background: var(--card);
}
.${ELEMENT_TAG}-week-toggle {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  list-style: none; cursor: pointer;
}
.${ELEMENT_TAG}-week-toggle::-webkit-details-marker { display: none; }
.${ELEMENT_TAG}-week-toggle::marker { content: ""; }
.${ELEMENT_TAG}-week-head {
  flex: 1 1 auto; min-width: 0; margin: 0;
  font-size: .6875rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-week-toggle:hover > .${ELEMENT_TAG}-week-head,
.${ELEMENT_TAG}-week[open] > .${ELEMENT_TAG}-week-toggle > .${ELEMENT_TAG}-week-head { color: var(--primary); }
.${ELEMENT_TAG}-week-body { display: flex; flex-direction: column; margin-top: .5rem; }

.${ELEMENT_TAG}-agenda-list { display: grid; gap: .5rem; }
.${ELEMENT_TAG}-agenda-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin: .75rem 0 .25rem; }
.${ELEMENT_TAG}-agenda-switch { display: inline-flex; align-items: center; gap: .4rem; font-size: .75rem; cursor: pointer; }
.${ELEMENT_TAG}-agenda-switch input { accent-color: var(--primary); }
.${ELEMENT_TAG}-agenda-days { display: grid; gap: .35rem; margin-top: .5rem; }
.${ELEMENT_TAG}-agenda-day { border: 1px solid var(--border); border-radius: .375rem; padding: .35rem .5rem; }
.${ELEMENT_TAG}-agenda-day > summary { cursor: pointer; font-size: .75rem; font-weight: 600; }
.${ELEMENT_TAG}-agenda-compare { display: grid; gap: .75rem; padding-top: .5rem; }
.${ELEMENT_TAG}-agenda-compare[data-comparison="true"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.${ELEMENT_TAG}-agenda-compare section { min-width: 0; }
.${ELEMENT_TAG}-agenda-compare h4 { margin: 0 0 .35rem; font-size: .7rem; color: var(--muted-foreground); }
.${ELEMENT_TAG}-agenda-blocks { display: grid; gap: .3rem; margin: 0; padding: 0; list-style: none; }
.${ELEMENT_TAG}-agenda-blocks li { display: grid; grid-template-columns: 7.2rem minmax(0, 1fr); gap: .1rem .5rem; padding: .4rem .5rem; border-radius: .3rem; background: var(--muted); font-size: .7rem; line-height: 1.35; }
.${ELEMENT_TAG}-agenda-blocks time { grid-row: span 4; white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--muted-foreground); }
.${ELEMENT_TAG}-agenda-blocks strong { font-weight: 600; }
@container ${ELEMENT_TAG} (max-width: 35rem) {
  .${ELEMENT_TAG}-agenda-compare[data-comparison="true"] { grid-template-columns: minmax(0, 1fr); }
  .${ELEMENT_TAG}-agenda-blocks li { grid-template-columns: minmax(0, 1fr); }
  .${ELEMENT_TAG}-agenda-blocks time { grid-row: auto; }
}

/*
  The founding wizard is two columns: the questions on the left and the map
  beside them on the right, so the player can answer and mark their own houses
  without either one being drawn over the other. The columns are measured in rem
  and allowed to wrap, which is what keeps the wizard honest when the Engine's
  own side panels open: the room the tab has shrinks with them, and past a point
  the map drops underneath the questions instead of squeezing to a sliver beside
  them. The homepage does not use them; it is the map.
*/
/* Both of these are the root's own two numbers at a smaller share of them, so a
   narrow tab tightens every screen at once rather than one screen at a time. */
.${ELEMENT_TAG}-home {
  gap: calc(var(--${ELEMENT_TAG}-gap) * .75);
  padding: calc(var(--${ELEMENT_TAG}-pad) * .8);
  overflow-y: auto;
}
.${ELEMENT_TAG}-home-body { display: flex; flex-wrap: wrap; align-items: flex-start; gap: .75rem; }
.${ELEMENT_TAG}-setup-map-shell { position: relative; flex: 1 1 26rem; min-width: 0; }
.${ELEMENT_TAG}-setup-map-viewport {
  width: 100%; overflow: auto; border: 2px solid color-mix(in srgb, var(--primary) 45%, var(--border));
  border-radius: .875rem; background: color-mix(in srgb, var(--popover) 80%, #111827);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent), 0 .75rem 2rem rgba(0, 0, 0, .3);
}
.${ELEMENT_TAG}-setup-map-viewport > .${ELEMENT_TAG}-stage:not(.${ELEMENT_TAG}-stage-compact) { width: 100%; flex: none; border: 0; }
.${ELEMENT_TAG}-home-map-viewport { flex: 1 1 auto; min-width: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: visible; }
.${ELEMENT_TAG}-reason-options { display: flex; flex-wrap: wrap; gap: .5rem .875rem; margin-top: .375rem; }
.${ELEMENT_TAG}-field:where(fieldset) { border: 0; padding: 0; min-width: 0; }
.${ELEMENT_TAG}-reason-option { display: inline-flex; align-items: center; gap: .35rem; font-size: .75rem; cursor: pointer; }
.${ELEMENT_TAG}-debug-label { color: #ff465f; font-weight: 800; letter-spacing: .06em; }
.${ELEMENT_TAG}-side { display: flex; flex-direction: column; gap: .75rem; flex: 1 1 18rem; min-width: 0; }
/*
  The homepage is the map, and the map is the whole tab. The map's shape is its
  own — a fixed ratio that comes from the settings, not from whatever shape this
  tab happens to be — so this row gives it the room it has left over and lets
  the space it does not fill show, rather than stretching the picture into a
  shape no map has.

  A row of two columns: the village's news down the left, the map in what is
  left. Both are children of this row, so the news is never drawn over the
  picture. The old shape was neither — the news was a window laid on top of a
  tab-wide map, which only looked right while the tab was wide enough for the
  map to be shorter than it and leave a gutter on each side. The Engine's own
  side panels narrow the tab until the map fills it edge to edge, and then the
  window landed on the picture. A row cannot do that: whatever width the tab
  has, the news takes its share and the map is fitted to the rest.

  The news is the only thing in this row besides the map. The readout and the
  notices are not in the row at all — they are drawn inside the map's own frame,
  because the frame is the only box whose corner is the picture's corner.

  There is no min-height floor. A floor taller than the visible tab is a floor
  the map is fitted against and then cropped by the overflow below — the map
  would be measured against a box bigger than the one it is seen in, and the
  bottom of the picture, and the pins on it, would be behind the tab's edge.
  A short tab is meant to give a small map, not a cut-off one.

  The two numbers next to this comment are the map's whole frame: the wood is
  the thickness of the wooden frame and the mat the margin inside it. They are
  written down once here and read everywhere they are needed, so the frame and
  the room that keeps it clear of the tab's edge cannot disagree.

  The shared bar takes its own row above the map on both phone and desktop, so
  its controls cannot cover a place pinned near the map's top edge.
*/
.${ELEMENT_TAG}-home-full {
  --${ELEMENT_TAG}-map-wood: .75rem;
  --${ELEMENT_TAG}-map-mat: .5rem;
  position: relative;
  box-sizing: border-box;
  display: flex; flex-direction: column; align-items: stretch;
  gap: .5rem;
  height: 100%; min-height: 0;
  padding: .5rem; overflow: hidden;
}
/*
  The space below the controls is the box the desktop map is fitted against.
  The frame stays centered in it; notices belong to the frame itself.

  The padding is the buffer the wooden frame is drawn into. It is the wood and
  the mat plus a pixel, which is exactly enough for the frame to exist without
  ever reaching the edge of a box that clips its overflow, and it is written as
  that sum rather than as a length so it stays true if either is retuned. The
  frame is drawn outwards from the picture, so this padding is the frame's own
  width and a pixel of clearance, and the picture itself is unchanged by it.
*/
.${ELEMENT_TAG}-room {
  position: relative;
  flex: 1 1 auto; min-width: 0; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  padding: calc(var(--${ELEMENT_TAG}-map-wood) + var(--${ELEMENT_TAG}-map-mat) + 1px);
}
/*
  The frame's border and rounding belong to the wizard, where the map shares the
  tab with the questions. On the homepage the wood replaces both, so this rule
  takes them away.

  No width is stated here on purpose. The measurement gives the frame BOTH of
  its sides inline, and a width would fight it: a frame left to the room's width
  alone is a frame taller than the room, and a frame taller than the room is a
  frame the map is cropped to fill — which is how four houses on the four
  corners of the map went missing.

  The clipping this frame used to do has not gone anywhere, it moved down to the
  picture's own layer, which is the same box. Splitting it that way is what lets
  the wood be drawn outside the frame while a pin on a corner house is still cut
  off at the edge of the map rather than floating over the wood.

  isolation makes this frame a stacking context, which is what keeps the two
  wood layers behind the picture. Without it a layer at a negative depth is not
  contained by anything here and paints behind whatever it finds further up —
  the wood would still be in the file and nowhere on the screen.
*/
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage {
  flex: 0 0 auto;
  border: 0; border-radius: 0;
  overflow: visible;
  isolation: isolate;
}
/*
  Until the picture has been read there is no shape to fit it to, so there is
  nothing to measure and no inline size to fall back on: the frame takes the
  column's width instead of letting the picture's own width decide it, which
  would be a frame as wide as the file and wider than the tab.
*/
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage:not([data-shaped="true"]) { width: 100%; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-canvas {
  overflow: hidden;
  z-index: 1;
}
/*
  The wooden frame, drawn outside the map's box rather than inside it.

  Outside, because a frame drawn inside would have to come out of the picture,
  and the picture is the map: a frame inside it would crop the map or mat it,
  and would move every pin as it did. Grown outwards, the map's box stays
  exactly the map, and nothing about where a house sits changes.

  Two layers because a picture frame has two faces — the wood itself, and the
  mat inside it that keeps the picture off the wood. The mat is painted second
  and so covers the wood's inner edge, which is what leaves the wood showing as
  a ring. A single layer would be a solid slab behind the map.

  The grain is a set of repeating gradients — plank bands down the frame crossed
  by finer, uneven ones — which is as much wood as a band this thin can hold.
  The insets are written as sums of the same two numbers the frame's thickness
  and the room's buffer are made of, so the wood always fits the space it is
  given: this is the one place the two must not drift apart.

  Scoped to the homepage's frame. The wizard and the town map editor keep the
  plain border they have always had.
*/
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage::before,
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage::after {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
}
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage::before {
  inset: calc(-1 * (var(--${ELEMENT_TAG}-map-wood) + var(--${ELEMENT_TAG}-map-mat)));
  border-radius: .625rem;
  background:
    repeating-linear-gradient(90deg, rgba(0, 0, 0, .18) 0 1px, rgba(0, 0, 0, 0) 1px 11px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, .06) 0 1px, rgba(255, 255, 255, 0) 1px 29px),
    linear-gradient(168deg, #a97641 0%, #8a5c2c 30%, #96683a 52%, #744a20 78%, #8d5f31 100%);
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, .35),
    inset 0 0 0 3px rgba(255, 255, 255, .055),
    0 .5rem 1.5rem rgba(0, 0, 0, .34);
}
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-stage::after {
  inset: calc(-1 * var(--${ELEMENT_TAG}-map-mat));
  border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 86%, #c08b4e);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .22);
}
.${ELEMENT_TAG}-places-picker { position: relative; pointer-events: auto; }
.${ELEMENT_TAG}-places-list {
  position: absolute; top: calc(100% + .375rem); left: 0; z-index: 10;
  display: flex; flex-direction: column; gap: .375rem;
  min-width: min(19rem, 80vw); max-width: min(24rem, 90vw); max-height: 60vh; overflow: auto;
  padding: .5rem; border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${ELEMENT_TAG}-places-list-row { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${ELEMENT_TAG}-places-list-name { flex: 1 1 100%; font-size: .8125rem; font-weight: 600; }
/* A button whose whole content is a drawn glyph: square, with the glyph centred
   in it rather than sitting on a text baseline it has none of. */
.${ELEMENT_TAG}-icon-button {
  display: inline-flex; align-items: center; justify-content: center;
  padding: .3125rem; line-height: 0;
}
.${ELEMENT_TAG}-icon-button svg { display: block; width: 1rem; height: 1rem; }
/*
  Anything that went wrong, said in the corner rather than in a bar: there is no
  footer on the map, so this is the only place it can be said, and it is only
  ever there while there is something to say.

  It belongs to the picture, so it stays in the frame's lower corner while the
  clock and controls stay above the map.
*/
.${ELEMENT_TAG}-notice {
  position: absolute; bottom: .5rem; left: .5rem; z-index: 2;
  display: flex; flex-direction: column; gap: .375rem;
  max-width: min(30rem, 75%); pointer-events: none;
}
.${ELEMENT_TAG}-notice .${ELEMENT_TAG}-status,
.${ELEMENT_TAG}-notice .${ELEMENT_TAG}-error {
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  padding: .3125rem .5rem;
}
/*
  The village's news, behind a button in the shared bar above the map.

  It used to be a column of the homepage: a permanent gutter down one side of
  the map, holding a list that is usually short and often empty. A column that is
  always there is a column the map always pays for, and on a phone held sideways
  there is no width to pay it with — the map would have been fitted to whatever
  the news left of the tab, which is a strange thing for reading the news to do.

  So the news is a disclosure instead. The button says the feed is there and the
  panel unrolls beneath it, over the picture: it costs the map nothing while it
  is shut and covers a corner of it while it is open. What the rail said is still
  said; it is said on request.

  A details element rather than a button and a box of state, because the
  open-and-shut flag, the keyboard behaviour and the expanded-or-collapsed
  announcement are all the element's own and none of them can drift out of step
  with the panel. What it does not do by itself is shut when the player presses
  somewhere else, which is the one thing the component adds: a panel that can
  only be dismissed by finding the button again sits over the game while the game
  is being played.

  Hung below its own button rather than centred on the map, so the panel opens
  where the button is. Both of its limits are shares of the tab rather than
  lengths, so a small tab gets a panel that fits and scrolls instead of one
  taller or wider than the screen it is on.
*/
.${ELEMENT_TAG}-news { position: relative; }
.${ELEMENT_TAG}-news-toggle { display: inline-flex; align-items: center; gap: .3125rem; list-style: none; }
.${ELEMENT_TAG}-news-toggle svg { display: block; flex: 0 0 auto; width: 1rem; height: 1rem; }
/* The browser's own disclosure triangle: a character that cannot be sized,
   coloured or placed with the rest of the button. The button is the affordance;
   a marker on top of it is a second one saying the same thing. */
.${ELEMENT_TAG}-news-toggle::-webkit-details-marker { display: none; }
.${ELEMENT_TAG}-news-toggle::marker { content: ""; }
.${ELEMENT_TAG}-news[open] > .${ELEMENT_TAG}-news-toggle { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-news-panel {
  position: absolute; top: calc(100% + .375rem); right: 0; z-index: 4;
  box-sizing: border-box; width: min(20rem, 72cqw);
  max-height: min(24rem, 60cqh);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover);
  padding: .5rem .625rem;
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .28);
}
.${ELEMENT_TAG}-news-title {
  margin: 0; font-size: .6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .04em;
  color: var(--muted-foreground);
}
.${ELEMENT_TAG}-news-list { margin: 0; padding: 0; list-style: none; display: grid; gap: .375rem; }
.${ELEMENT_TAG}-news-item { font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-news-empty {
  margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-mapbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .5rem .625rem;
}
.${ELEMENT_TAG}-mapbar-title { font-size: .8125rem; font-weight: 600; }
/*
  The map's own frame: beside the wizard's questions, in a column of prose, or
  filling the homepage. Its shape is the map's rather than the container's — the
  ratio is set inline from the picture size the settings named — so the same
  picture is drawn at the same shape everywhere, and a picture that is not that
  shape is cropped, stretched or letterboxed inside it by choice rather than by
  accident. The frame's background is what shows wherever the picture is not:
  the part of the frame that is not the picture should not look like somewhere a
  house can go. MapStage measures the frame and the picture separately and pins
  the homes to the picture.
*/
.${ELEMENT_TAG}-stage {
  position: relative;
  flex: 1 1 26rem; min-width: 0;
  border: 1px solid var(--border); border-radius: .75rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--muted-foreground) 12%, var(--background));
}
/*
  Before the settings name the map's shape there is no shape to be, so the frame
  stands at a usable height rather than at nothing. Once the settings arrive the
  ratio set inline takes over and the height follows the width, the way a
  picture's does.
*/
.${ELEMENT_TAG}-stage:not([data-shaped="true"]) { min-height: 14rem; }
/* A stand-in for the map rather than the map itself: the same picture at the same
   shape, small enough to sit beside a column of prose. */
.${ELEMENT_TAG}-stage-compact { flex: 0 1 auto; width: min(100%, 22rem); align-self: center; }
.${ELEMENT_TAG}-canvas { position: absolute; inset: 0; }
.${ELEMENT_TAG}-stage[data-empty="true"] .${ELEMENT_TAG}-canvas {
  background:
    radial-gradient(circle at 20% 28%, color-mix(in srgb, var(--primary) 12%, transparent) 0 2%, transparent 2.25%),
    radial-gradient(circle at 73% 68%, color-mix(in srgb, var(--primary) 10%, transparent) 0 3%, transparent 3.25%),
    linear-gradient(24deg, transparent 47%, color-mix(in srgb, var(--border) 65%, transparent) 48% 52%, transparent 53%),
    color-mix(in srgb, var(--muted) 55%, var(--background));
}
.${ELEMENT_TAG}-canvas-empty {
  position: absolute; right: .625rem; bottom: .5rem;
  color: var(--muted-foreground); font-size: .6875rem;
}
.${ELEMENT_TAG}-canvas[data-placing="true"] { cursor: crosshair; }
.${ELEMENT_TAG}-canvas[data-dragging="true"] { cursor: grabbing; }
.${ELEMENT_TAG}-stage[data-framing="true"] .${ELEMENT_TAG}-canvas { cursor: grab; touch-action: none; }
.${ELEMENT_TAG}-stage[data-framing="true"] .${ELEMENT_TAG}-canvas[data-dragging="true"] { cursor: grabbing; }
.${ELEMENT_TAG}-canvas-img {
  display: block; width: 100%; height: 100%;
  object-fit: contain;
  user-select: none;
}
/*
  The framing editor's controls. Sat outside the frame rather than in it so a
  press on one of them is not also the start of a drag, and drawn small at the
  foot of the frame so what they change stays visible while they change it.
*/
.${ELEMENT_TAG}-zoom {
  position: absolute; right: .5rem; bottom: .5rem; z-index: 3;
  display: flex; gap: .25rem;
}
.${ELEMENT_TAG}-zoom-button {
  border: 1px solid var(--border); border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  color: inherit; font: inherit; font-size: .6875rem; line-height: 1;
  padding: .3125rem .4375rem; cursor: pointer;
}
.${ELEMENT_TAG}-zoom-button:disabled { opacity: .5; cursor: default; }
.${ELEMENT_TAG}-canvas-missing {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  padding: 1rem; text-align: center; font-size: .8125rem; line-height: 1.45;
  color: var(--muted-foreground);
}
.${ELEMENT_TAG}-pin-holder { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: .125rem; }
.${ELEMENT_TAG}-pin {
  display: flex; align-items: center; gap: .25rem;
  border: 1px solid var(--primary); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground);
  padding: .125rem .4375rem .125rem .25rem;
  font: inherit; font-size: .6875rem; line-height: 1.6; cursor: pointer;
  white-space: nowrap;
}
.${ELEMENT_TAG}-pin:hover { color: var(--primary); }
.${ELEMENT_TAG}-pin:disabled { cursor: default; color: var(--muted-foreground); }
.${ELEMENT_TAG}-pin[data-selected="true"] { box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent); }
.${ELEMENT_TAG}-pin[data-tone="player"] { border-color: var(--primary); }
.${ELEMENT_TAG}-pin[data-tone="empty"] {
  border-style: dashed; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
/*
  A place that is not a house: a shop, a harbour, the mill pond. The plainest
  thing on the map, in the ordinary border colour, because all it has to do is be
  read — there is nothing behind it to press yet.
*/
.${ELEMENT_TAG}-pin[data-tone="venue"] { border-color: var(--border); }
/*
  Somebody standing at a place rather than the place itself.

  Dimmer than the building and drawn without the tack, because the tack is what
  says "there is a building here" and two things on one spot both claiming to be
  the building is the map lying about one of them. The building keeps its pin and
  the people hang underneath it, which is also the order the two answers arrive in:
  what is here, then who.
*/
.${ELEMENT_TAG}-pin[data-kind="person"] {
  border-style: dotted; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
.${ELEMENT_TAG}-pin[data-kind="person"] .${ELEMENT_TAG}-pin-tack { display: none; }
/*
  A thumbtack, because that is what the thing on a map is: something pushed
  through the paper to say a building is here. Drawn rather than taken from a
  font or an emoji, so it is the same tack on every machine the Engine runs on.
*/
.${ELEMENT_TAG}-pin-tack { flex: 0 0 auto; width: 1rem; height: 1rem; color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-pin-tack svg { display: block; width: 100%; height: 100%; fill: currentColor; }
.${ELEMENT_TAG}-pin[data-tone="empty"] .${ELEMENT_TAG}-pin-tack { color: var(--muted-foreground); }
.${ELEMENT_TAG}-pin-remove {
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent); color: var(--muted-foreground);
  font-size: .625rem; line-height: 1; padding: .125rem .25rem; cursor: pointer;
}
.${ELEMENT_TAG}-pin-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  DEBUG. The way back into a conversation that was closed without being ended.

  Outside the pin's own box rather than in it: the pin is placed by its centre
  on a building, and a second row inside it would move the pin up the picture by
  half of the control's height, so a house would stop being marked where it is.
  Hung below the pin's box, the pin stays exactly where it was and the control
  reads as belonging to it.

  Drawn in the destructive colour for the same reason the debug verbs in the
  drawer are: a control that is not part of the game should not be mistaken for
  one, and a player of this game never has a conversation in hand whose window is
  shut. Unlike them it is never disabled — on a locked map it is the only thing
  that answers a click, and a locked map with nothing to press is a tab that has
  to be reloaded.
*/
.${ELEMENT_TAG}-pin-resume {
  position: absolute; top: calc(100% + .1875rem); left: 50%; transform: translateX(-50%);
  white-space: nowrap; cursor: pointer; font: inherit; font-size: .625rem; line-height: 1.4;
  border: 1px solid var(--destructive, #e5484d); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 92%, transparent);
  color: var(--destructive, #e5484d); padding: .125rem .375rem;
}
/*
  THE TWO DOORS A PLACE WITH SOMEBODY IN IT OFFERS.

  Hung under the pin it belongs to and drawn outside the frame rather than inside
  it. The frame is the picture's box and it is also what cuts off anything that
  reaches past a corner house, so a pair of buttons under a pin near the bottom of
  the map would be half a pair of buttons. The offsets are set inline from the same
  two numbers the pin above is placed with, so the list opens exactly under its own
  pin at every size the picture is drawn at.

  The step down is a length rather than a share of the picture on purpose: what it
  has to clear is a pin, and a pin is a fixed size however large the map is.

  A list rather than one button, because the two answers are genuinely different.
  Looking at a place and walking in to talk to whoever is standing in it are two
  things a player can want, and the map used to decide between them: a pin with one
  person behind it opened their conversation and skipped the place entirely, so a
  house with somebody in it could not be looked at. A card rather than two loose
  pills, because the pair belongs to one pin and has to read as one thing.
*/
.${ELEMENT_TAG}-doors {
  position: absolute; z-index: 4;
  transform: translate(-50%, 2.75rem);
  display: flex; flex-direction: column; align-items: stretch; gap: .1875rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 96%, transparent);
  padding: .25rem;
  box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${ELEMENT_TAG}-door {
  white-space: nowrap; cursor: pointer;
  font: inherit; font-size: .6875rem; line-height: 1.6;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground); padding: .125rem .625rem;
}
.${ELEMENT_TAG}-door:hover { border-color: var(--primary); color: var(--primary); }
/* A card, whether it is the wizard's questions or an option open in the Menu. */
.${ELEMENT_TAG}-overlay {
  display: flex; flex-direction: column; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .875rem 1rem;
}
.${ELEMENT_TAG}-overlay-head { display: flex; align-items: center; gap: .5rem; }
.${ELEMENT_TAG}-overlay-head > .${ELEMENT_TAG}-panel-title { flex: 1 1 auto; margin: 0; }

/* The founding wizard. */
.${ELEMENT_TAG}-setup-root { box-sizing: border-box; container-type: inline-size; }
.${ELEMENT_TAG}-setup-root:has(.${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"])) {
  --background: #121936; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  background: radial-gradient(circle at 12% 95%, #263978, #111832 50%, #0e1430);
  color: #f3f3ff;
}
.${ELEMENT_TAG}-setup-body { flex-wrap: nowrap; align-items: stretch; }
.${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"]) { flex: 1 1 auto; min-height: 0; }
.${ELEMENT_TAG}-setup-root:has(.${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"])) { overflow: hidden; }
.${ELEMENT_TAG}-setup-body > .${ELEMENT_TAG}-side { flex: 1 1 34rem; }
.${ELEMENT_TAG}-setup-visual {
  display: flex; flex-direction: column; gap: .6rem; flex: 1 1 19rem; min-width: 0; min-height: 0;
}
.${ELEMENT_TAG}-setup-visual > .${ELEMENT_TAG}-setup-map-shell { flex: 1 1 auto; min-height: 0; }
.${ELEMENT_TAG}-setup-footer { display: flex; gap: .65rem; min-height: 2.75rem; }
.${ELEMENT_TAG}-setup-footer > .${ELEMENT_TAG}-button { flex: 1 1 0; min-width: 0; }
.${ELEMENT_TAG}-setup-footer > .${ELEMENT_TAG}-setup-forward {
  border-color: #7584ff; background: linear-gradient(135deg, #6077ff, #7365ed);
  color: #fff; font-weight: 700;
}
.${ELEMENT_TAG}-setup-rail {
  flex: 0 0 10rem; display: flex; flex-direction: column; gap: .4rem;
  padding: .75rem .25rem; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-setup-rail-step {
  display: flex; align-items: center; gap: .65rem; padding: .4rem .25rem;
  font-size: .78rem; line-height: 1.35; opacity: .75;
}
.${ELEMENT_TAG}-setup-rail-step[data-active="true"] { color: var(--foreground); opacity: 1; font-weight: 700; }
.${ELEMENT_TAG}-setup-rail-step[data-done="true"] { opacity: 1; }
.${ELEMENT_TAG}-setup-rail-number {
  display: grid; place-items: center; flex: 0 0 2rem; height: 2rem;
  border: 1px solid var(--border); border-radius: 50%; font-weight: 700;
}
.${ELEMENT_TAG}-setup-rail-step[data-active="true"] .${ELEMENT_TAG}-setup-rail-number {
  border-color: #bca5ff; background: linear-gradient(135deg, #7663f6, #446ee9);
  box-shadow: 0 0 .85rem #9878f1a8; color: #fff;
}
.${ELEMENT_TAG}-setup-kicker { margin: 0; color: var(--muted-foreground); font-size: .78rem; }
.${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"]) {
  --background: #151d3b; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  gap: .75rem; align-items: flex-start; color: var(--foreground);
}
.${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"]) > .${ELEMENT_TAG}-side { flex-basis: 35rem; min-height: 0; }
.${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"]) .${ELEMENT_TAG}-overlay {
  gap: .2rem; padding: .65rem .8rem; border-color: #5268b8; border-radius: 1rem;
  background: linear-gradient(145deg, #182044, #101831);
  box-shadow: inset 0 0 2rem #27347866;
}
.${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"]) .${ELEMENT_TAG}-panel-title {
  font-size: clamp(1.25rem, 1.8vw, 1.65rem); color: #f5f5ff;
}
.${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"]) .${ELEMENT_TAG}-field { margin-top: .15rem; }
.${ELEMENT_TAG}-setup-body[data-step="1"] .${ELEMENT_TAG}-overlay { height: 100%; min-height: 0; overflow: hidden; }
.${ELEMENT_TAG}-setup-body[data-step="0"] .${ELEMENT_TAG}-search,
.${ELEMENT_TAG}-setup-body[data-step="0"] .${ELEMENT_TAG}-textarea,
.${ELEMENT_TAG}-setup-body[data-step="1"] .${ELEMENT_TAG}-search,
.${ELEMENT_TAG}-setup-body[data-step="1"] .${ELEMENT_TAG}-select {
  background: #1c254a; border-color: #7082cf; color: #f2f4ff;
}
.${ELEMENT_TAG}-setup-body[data-step="0"] .${ELEMENT_TAG}-setup-premise .${ELEMENT_TAG}-textarea {
  height: 3.25rem;
}
.${ELEMENT_TAG}-setup-body[data-step="0"] .${ELEMENT_TAG}-setup-guidance .${ELEMENT_TAG}-textarea {
  height: 2.5rem; min-height: 2.5rem;
}
.${ELEMENT_TAG}-scenario-options {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4rem; margin-top: .15rem;
}
.${ELEMENT_TAG}-scenario-option {
  position: relative; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .1rem; min-height: 3.2rem; padding: .25rem .3rem;
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b;
  color: #f0f2ff; text-align: center; cursor: pointer;
}
.${ELEMENT_TAG}-scenario-option input {
  position: absolute; width: 1px; height: 1px; opacity: 0;
}
.${ELEMENT_TAG}-scenario-option:has(input:checked) {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff, 0 0 1rem #9a78ff9c;
}
.${ELEMENT_TAG}-scenario-option:has(input:focus-visible) { outline: 3px solid #f2d6ff; outline-offset: 3px; }
.${ELEMENT_TAG}-scenario-icon { color: #b9c8ff; font-size: max(1.1rem, 18px); line-height: 1; }
.${ELEMENT_TAG}-scenario-option strong { font-size: max(.72rem, 13px); }
.${ELEMENT_TAG}-scenario-option small { color: #bdc8ed; font-size: max(.6rem, 11px); line-height: 1.2; }
.${ELEMENT_TAG}-scenario-art-panel {
  position: relative; flex: 1 1 auto; min-width: 0; min-height: 0;
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${ELEMENT_TAG}-scenario-art-panel > img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.${ELEMENT_TAG}-scenario-art-panel::after {
  content: ""; position: absolute; inset: 36% 0 0;
  background: linear-gradient(transparent, #0e1a3ba8 48%, #101a3ef0);
}
.${ELEMENT_TAG}-scenario-art-content {
  position: absolute; z-index: 1; inset: auto 1rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  color: #fff; text-align: center;
}
.${ELEMENT_TAG}-scenario-art-content p {
  margin: 0; font-family: Georgia, serif; font-style: italic; font-size: clamp(1.25rem, 2vw, 1.9rem);
}
.${ELEMENT_TAG}-scenario-art-content strong { font-weight: 500; }
/* Compact, role-neutral identity chooser used by Founding's Persona adapter. */
.${ELEMENT_TAG}-founding-persona { display: flex; flex-direction: column; gap: .3rem; min-height: 0; }
.${ELEMENT_TAG}-identity-picker-head { display: flex; align-items: center; gap: .75rem; }
.${ELEMENT_TAG}-identity-picker-head > .${ELEMENT_TAG}-label { flex: 0 0 auto; }
.${ELEMENT_TAG}-identity-picker-head > .${ELEMENT_TAG}-search { flex: 1 1 auto; width: 0; min-width: 0; }
.${ELEMENT_TAG}-identity-strip {
  display: flex; gap: .4rem; min-height: 5.5rem; overflow-x: auto; overflow-y: hidden;
  padding: .15rem .15rem .3rem; scrollbar-width: thin;
}
.${ELEMENT_TAG}-identity-card {
  display: flex; flex-direction: column; align-items: center; gap: .15rem;
  flex: 0 0 6.8rem; min-width: 0; padding: .25rem;
  border: 1px solid #5265ac; border-radius: .6rem; background: #1c254b;
  color: #f0f2ff; font: inherit; font-size: .7rem; cursor: pointer;
}
.${ELEMENT_TAG}-identity-card[aria-pressed="true"] { border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff; }
.${ELEMENT_TAG}-identity-card:focus-visible { outline: 3px solid #f2d6ff; outline-offset: 2px; }
.${ELEMENT_TAG}-identity-card-face, .${ELEMENT_TAG}-identity-preview-face {
  position: relative; display: grid; place-items: center; overflow: hidden; flex: 0 0 auto;
  border-radius: 50%; background: #324576; color: #e9edff;
}
.${ELEMENT_TAG}-identity-card-face { width: 2.5rem; height: 2.5rem; }
.${ELEMENT_TAG}-identity-card-face > img, .${ELEMENT_TAG}-identity-preview-face > img { width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-identity-card-face svg, .${ELEMENT_TAG}-identity-preview-face svg { width: 55%; height: 55%; }
.${ELEMENT_TAG}-identity-card strong, .${ELEMENT_TAG}-identity-card small {
  overflow: hidden; max-width: 100%; white-space: nowrap; text-overflow: ellipsis;
}
.${ELEMENT_TAG}-identity-card small { color: #b9c8e9; font-size: .55rem; }
.${ELEMENT_TAG}-identity-preview {
  display: flex; gap: .55rem; min-height: 0; max-height: 9.3rem; overflow-y: auto;
  padding: .5rem; border: 1px solid #5265ac; border-radius: .65rem; background: #1c254b;
}
.${ELEMENT_TAG}-identity-preview-face { width: 3.2rem; height: 3.2rem; }
.${ELEMENT_TAG}-identity-preview-copy { min-width: 0; font-size: .68rem; line-height: 1.35; }
.${ELEMENT_TAG}-identity-preview-copy h3 { margin: 0 0 .15rem; font-size: .9rem; }
.${ELEMENT_TAG}-identity-preview-copy p { margin: .12rem 0; }
.${ELEMENT_TAG}-identity-overview { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.${ELEMENT_TAG}-identity-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; margin: .3rem 0; }
.${ELEMENT_TAG}-identity-details dt { font-weight: 700; color: #cfdaff; }
.${ELEMENT_TAG}-identity-details dd { margin: 0; }
.${ELEMENT_TAG}-identity-context { color: #bdc8ed; }
.${ELEMENT_TAG}-connections-compact { min-height: 0; }
.${ELEMENT_TAG}-connections-compact > .${ELEMENT_TAG}-hint { margin: 0; }
.${ELEMENT_TAG}-connections-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${ELEMENT_TAG}-connections-grid > .${ELEMENT_TAG}-field { min-width: 0; }
.${ELEMENT_TAG}-connections-grid .${ELEMENT_TAG}-select { width: 100%; }
.${ELEMENT_TAG}-connections-grid .${ELEMENT_TAG}-hint { line-height: 1.25; }
@container (min-width: 80rem) {
  .${ELEMENT_TAG}-scenario-options { grid-template-columns: repeat(5, minmax(0, 1fr)); }
}
@container (min-width: 42.01rem) and (max-width: 80rem) {
  .${ELEMENT_TAG}-setup-body[data-step="0"] .${ELEMENT_TAG}-setup-premise .${ELEMENT_TAG}-textarea {
    height: 4.25rem;
  }
}
@container (max-width: 70rem) {
  .${ELEMENT_TAG}-setup-body { flex-wrap: wrap; }
  .${ELEMENT_TAG}-setup-rail {
    flex: 1 1 100%; flex-direction: row; overflow-x: auto; padding: .25rem 0;
  }
  .${ELEMENT_TAG}-setup-rail-step { flex: 0 0 auto; }
}
@container (min-width: 42.01rem) and (max-width: 70rem) {
  .${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"]) > .${ELEMENT_TAG}-side { flex-basis: 25rem; }
  .${ELEMENT_TAG}-setup-visual { flex-basis: 14rem; }
}
@container (max-width: 42rem) {
  .${ELEMENT_TAG}-setup-root:has(.${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"])) { overflow-y: auto; }
  .${ELEMENT_TAG}-setup-body:is([data-step="0"], [data-step="1"]) { flex: none; }
  .${ELEMENT_TAG}-setup-body > .${ELEMENT_TAG}-side,
  .${ELEMENT_TAG}-setup-visual { flex: 1 1 100%; }
  .${ELEMENT_TAG}-setup-body[data-step="1"] .${ELEMENT_TAG}-overlay { height: auto; overflow: visible; }
  .${ELEMENT_TAG}-identity-preview { max-height: none; }
  .${ELEMENT_TAG}-connections-grid { grid-template-columns: 1fr; }
  .${ELEMENT_TAG}-scenario-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${ELEMENT_TAG}-scenario-art-panel { flex: none; height: 18rem; }
}
.${ELEMENT_TAG}-steps { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  A chip that says where something has got to: which step of the wizard, or
  which of the three fits a picture is drawn with. Only the ones that are
  really a control say so, by carrying the data-clickable attribute — a chip
  that answers the cursor and then does nothing when it is clicked is a promise
  the strip cannot keep. That is why the wizard's own chips are not controls.
*/
.${ELEMENT_TAG}-step {
  font: inherit; font-size: .6875rem; color: var(--muted-foreground);
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 85%, transparent);
  padding: .1875rem .5rem;
}
.${ELEMENT_TAG}-step[data-clickable="true"] { cursor: pointer; }
.${ELEMENT_TAG}-step[data-clickable="true"]:hover { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-step[data-active="true"] { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-step[data-done="true"] { border-color: color-mix(in srgb, var(--primary) 45%, transparent); }
.${ELEMENT_TAG}-home-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid var(--border); border-radius: .5rem; padding: .4375rem .5rem;
}
.${ELEMENT_TAG}-home-row[data-selected="true"] { border-color: var(--primary); }
.${ELEMENT_TAG}-home-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; }
.${ELEMENT_TAG}-home-index {
  flex: 0 0 auto; display: flex; align-items: center; justify-content: center;
  width: 1.25rem; height: 1.25rem; border-radius: 999px;
  border: 1px solid var(--border); font-size: .625rem; color: var(--muted-foreground);
}
/*
  What the house IS, straight from the village's own catalogue. Drawn as a
  fixed chip rather than a field because there is nothing here to answer — the
  question the row asks is who lives in it. The class rides along beside the
  name so "housing" is visible rather than merely stored.
*/
.${ELEMENT_TAG}-building {
  flex: 0 0 auto; display: flex; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--muted-foreground) 10%, transparent);
  padding: .125rem .5rem; font-size: .6875rem; color: var(--muted-foreground);
}
.${ELEMENT_TAG}-select {
  box-sizing: border-box; max-width: 100%;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .3125rem .375rem; font-size: .75rem; font-family: inherit;
}
.${ELEMENT_TAG}-who { font-size: .75rem; color: var(--muted-foreground); min-width: 5rem; }
.${ELEMENT_TAG}-danger { border-color: color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent); color: var(--destructive, #e5484d); }
.${ELEMENT_TAG}-spacer { flex: 1 1 auto; }
.${ELEMENT_TAG}-file { max-width: 100%; font-size: .6875rem; color: var(--muted-foreground); }

/*
  ==============================================================================
  THE TAB ITSELF, AND WHAT IT DOES WHEN THE SCREEN IS A PHONE
  ==============================================================================
*/

/*
  THE HOST, WHICH IS THE ONE BOX EVERY SIZE IN THIS SHEET IS MEASURED AGAINST.

  The Engine makes this element and gives it the classes it was mounted with —
  block, h-full, min-h-0, w-full, from the Home hub — and nothing else: there is
  no class on it carrying this package's name. So the rules for it are written
  against the TAG, which is the only thing on the element that is ours to name.
  The old .marinara-capability-villages rule was a class the element never had:
  dead on arrival, and the tab stood up anyway only because Tailwind happened to
  say the same three things.

  container-type: size is what makes the tab answerable to the room it was
  actually given rather than to the window. This package is mounted in a tab that
  shares the screen with the Engine's own furniture, and in fullscreen it has the
  whole screen instead — no viewport query can tell those two apart. A phone held
  sideways is 844x390 and a laptop is 1400x760, so the width is not the telling
  difference and the height is, which is why this is size and not inline-size and
  why the queries at the foot of this sheet ask about both.

  Containment means this element's own size can no longer come from its children,
  which is why the height is stated here outright rather than left to whatever
  mounted it. An element one hundred percent of a definite box is itself
  definite — the hub's main is flex-1 and this element is h-full inside it — and
  an element whose percentage ever resolved to auto would now collapse to nothing
  instead of falling back to the size of its content.

  ponytail: that is the ceiling of this line. If this tab is ever mounted into a
  box with no definite height, this is the rule to look at first.

  text-size-adjust is the same argument made the other way round: a phone browser
  will otherwise inflate the text of a page it decides is too small to read, block
  by block and by its own rules, which changes a layout nobody measured and cannot
  be seen from inside this file.
*/
${ELEMENT_TAG} {
  display: block;
  height: 100%;
  min-height: 0;
  container-type: size;
  container-name: ${ELEMENT_TAG};
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

/*
  FULLSCREEN.

  The HOST goes fullscreen, and only the host. It is the one node the Engine does
  not re-make when the tab re-renders, so it is the one node that can hold the
  whole screen while everything inside it is replaced; put the screen on an inner
  box and the next render throws the fullscreen state away with the box. That is
  also why there is no state here: the browser is already keeping the answer, and
  document.fullscreenElement reads it back.

  One toggle and not two. GachaForge draws a button in its header bar and a second
  one in the corner of its stage, because its header can be pushed off screen;
  this tab's controls live on the picture and travel with it, so the one button is
  always where it was and there is nothing for a second one to cover.

  The map is not stretched to fill the screen, and that is the whole point of
  asking for it: MapStage measures the room it was given and fits the frame to its
  own ratio, so a bigger room gives a bigger map. Filling and fitting are the same
  thing on a 16:9 monitor and are not on a phone, where stretching the height
  would fatten every pin away from the house it was put on.

  The background is stated because a fullscreen element keeps a transparent
  background and the browser paints its own black backdrop behind it: without
  this, every letterboxed inch around the picture would be black rather than the
  Engine's surface.

  The safe-area insets are for the notch, which on a phone held sideways is on the
  LEFT or the RIGHT edge and upright is along the TOP — and sideways is where the
  chat drawer's own header sits while upright is where the map's controls are now
  drawn. All four sides are written for that reason: which pair matters depends on
  the way up the phone is, and on a phone that is not a phone they are zero. They
  need the Engine's own page to declare a cover viewport to be anything but zero,
  and this package cannot set that: two numbers a package cannot import are being
  written down here a second time.
*/
${ELEMENT_TAG}:fullscreen {
  background: var(--background);
  --${ELEMENT_TAG}-safe-top: env(safe-area-inset-top, 0px);
  --${ELEMENT_TAG}-safe-right: env(safe-area-inset-right, 0px);
  --${ELEMENT_TAG}-safe-bottom: env(safe-area-inset-bottom, 0px);
  --${ELEMENT_TAG}-safe-left: env(safe-area-inset-left, 0px);
}
${ELEMENT_TAG}:fullscreen .${ELEMENT_TAG}-root {
  padding:
    calc(var(--${ELEMENT_TAG}-pad) + var(--${ELEMENT_TAG}-safe-top))
    calc(var(--${ELEMENT_TAG}-pad) + var(--${ELEMENT_TAG}-safe-right))
    calc(var(--${ELEMENT_TAG}-pad) + var(--${ELEMENT_TAG}-safe-bottom))
    calc(var(--${ELEMENT_TAG}-pad) + var(--${ELEMENT_TAG}-safe-left));
}
${ELEMENT_TAG}:fullscreen .${ELEMENT_TAG}-home-full {
  padding:
    calc(var(--${ELEMENT_TAG}-pad) * .6 + var(--${ELEMENT_TAG}-safe-top))
    calc(var(--${ELEMENT_TAG}-pad) * .6 + var(--${ELEMENT_TAG}-safe-right))
    calc(var(--${ELEMENT_TAG}-pad) * .6 + var(--${ELEMENT_TAG}-safe-bottom))
    calc(var(--${ELEMENT_TAG}-pad) * .6 + var(--${ELEMENT_TAG}-safe-left));
}

/*
  ── DORMANT 0.4.45 — the notice that told a phone held upright to turn over. ──

  This is the one rule in the sheet that decided which way up a phone had to be
  held. It is SWITCHED OFF, and it is not retired: 0.4.45 draws the tab for
  portrait, so there is nothing left for this to answer and nothing left to read
  it — the four pieces of the component that drew it are dormant beside their own
  definitions, and the RotateNotice element is dormant on the homepage. Left live,
  the media query below would match every portrait phone in the world and put a
  full-bleed panel over the village; the block is commented out for that reason
  and not for tidiness.

  It is kept rather than deleted because the decision is not final. The map is
  still a wide 19:13 surface fitted WHOLE to its frame — the frame is the two
  numbers above and the reason it is fitted rather than cropped is that a house
  on a corner of the map that nobody can see is a house nobody can open — and a
  map still wants a wide box. A later lane may decide it wants the map on its side
  again and may want to say so again.

  To bring it back: uncomment this block, uncomment the four pieces of the notice
  beside hostOf, and put the RotateNotice element back on the homepage at the foot
  of the row. Nothing else changed; the rule is exactly what it was.

  What it would take to REMOVE it rather than leave it dormant: nothing. It is a
  media query and a sentence, and neither of them is load-bearing. Delete the
  block and the four pieces when the portrait layout has been lived with and
  nobody wants the sideways map back — or delete them now, if that is already
  known to be the answer. It is left here unanswered on purpose.
*/
/*
.${ELEMENT_TAG}-rotate { display: none; }
@media (orientation: portrait) and (pointer: coarse) {
  .${ELEMENT_TAG}-rotate {
    position: absolute; inset: 0; z-index: 5;
    display: grid; place-content: center; justify-items: center;
    gap: .75rem;
    padding: calc(var(--${ELEMENT_TAG}-pad) * 2) var(--${ELEMENT_TAG}-pad);
    background: color-mix(in srgb, var(--background) 96%, transparent);
    text-align: center;
  }
}
.${ELEMENT_TAG}-rotate-phone { width: 3.25rem; color: var(--primary); }
.${ELEMENT_TAG}-rotate-phone svg { display: block; width: 100%; height: auto; }
.${ELEMENT_TAG}-rotate-title { margin: 0; font-size: .875rem; font-weight: 600; color: var(--foreground); }
.${ELEMENT_TAG}-rotate-note { margin: 0; max-width: 32ch; font-size: .8125rem; line-height: 1.5; color: var(--muted-foreground); }
*/
/*
  ON A TOUCH SCREEN, EVERY CONTROL IS AT LEAST A THUMB.

  The paddings above draw most of these controls about twenty-six pixels tall:
  comfortable to click with a mouse and too small to tap reliably with a thumb,
  and a control exists to be pressed.

  Forty-four is the number the guidance asks for and it is more than a map can pay
  everywhere — a taller row is a taller row, and the rows around these are the
  picture — so the ones that stand in a row of their own take the full amount and
  the ones that sit in a cluster take less, which is still a real improvement over
  twenty-six and still leaves the map its room.

  Only where the pointer is coarse. A finger is not a mouse and a mouse is not a
  thumb: nothing moves on a desktop.

  The square ones are centred as well, because a box grown around a glyph lets the
  glyph sit at the top of it. The map's own pin controls are the exception and are
  left as small as a finger can manage, because every pixel one of them takes is a
  pixel of the picture: a pin's remove button sits on the house, not in a bar.
*/
@media (pointer: coarse) {
  .${ELEMENT_TAG}-button,
  .${ELEMENT_TAG}-select,
  .${ELEMENT_TAG}-search,
  .${ELEMENT_TAG}-notice-input,
  .${ELEMENT_TAG}-macro,
  .${ELEMENT_TAG}-chat-mode-button,
  .${ELEMENT_TAG}-chat-send,
  .${ELEMENT_TAG}-step[data-clickable="true"],
  .${ELEMENT_TAG}-zoom-button,
  .${ELEMENT_TAG}-remove { min-height: 2.25rem; }
  .${ELEMENT_TAG}-icon-button,
  .${ELEMENT_TAG}-chat-mode-button,
  .${ELEMENT_TAG}-chat-send { min-width: 2.25rem; }
  .${ELEMENT_TAG}-zoom-button,
  .${ELEMENT_TAG}-icon-button,
  .${ELEMENT_TAG}-chat-mode-button,
  .${ELEMENT_TAG}-chat-send { justify-content: center; }
  /*
    There used to be a second rule here, reserving room on the box's right-hand
    edge for the press, because the press floated over the words and grew under a
    coarse pointer. The press is a flex item at the end of the line now, so the
    box makes that room for it by itself and there is nothing left to reserve.
  */
  .${ELEMENT_TAG}-pin-remove { min-width: 1.75rem; min-height: 1.75rem; }
  .${ELEMENT_TAG}-textarea { min-height: 4.5rem; }
}

/*
  WHAT THE TAB DOES WHEN IT HAS LESS ROOM.

  Container queries, not window queries, and the container is named. This sheet is
  injected into the document rather than into a shadow root, so it is a global
  stylesheet, and an unnamed query in a global stylesheet is a query that matches
  whatever container happens to be nearest. Naming the host's container says which
  box is being asked about, and there is exactly one.

  Five states: four the tab has always answered to, in the order they take room
  away, and one for the way up a phone is held, which is the release after this
  one and has a block of its own below.

  A tab narrower than 44rem is a phone, or a tab squeezed by the Engine's own side
  panels. The stage is already the whole tab at every width, so what is left for
  this query is the paragraph: the card keeps less of its own padding, because on
  a phone the tab's edges are close enough to be their own margins and every
  pixel spent on a gutter is a pixel off a line the player is reading. The tab's
  own padding comes in with it, so the picture keeps running to the edge.

  A tab shorter than 30rem is a phone held sideways, and very little else. It
  cannot afford the villager a figure as big as the floor would like, and the
  words need the height more than the picture does. The figure shrinks rather than
  the card moving somewhere else: the card is already directly above the composer,
  and a card that moved when the phone turned over would be a different screen
  every time the player shifted their grip. Shrinks, not narrows, and the two are
  not the same edit: it is HEIGHT that this tab is short of, and a square that
  answers a height the tab does not have is a square squeezing the paragraph.

  The figure's own share of the floor is asked for in the FLOOR's units now, so the
  only thing this block still has to say about it is how much of the row to keep
  clear under it: with the plate gone, half a rem is the row's own padding and
  nothing else.

  The tab gives up a row here too, and the row it gives up is the plate. The name
  of the villager is on the card, and the plate only says where they are, so a tab
  with 390 pixels of height spends its last one on the words rather than on the
  place they are said from. The portrait in the card goes with it, and for the
  same reason: the figure is still standing on the floor, and a second copy of it
  in the card is the first thing a short tab can do without.

  These fixes are not cosmetics and the reason is worth writing down, because it
  is a property of the stack rather than of any one row: the bottom stack is
  justified to its END, so anything that does not fit does not extend past the
  composer. It cannot spill upward either — the floor above it is the flexible
  row, so the stage yields first and the chrome stays where it is. That is the
  whole reason the figure has a floor of its own rather than a place at the head
  of the reading: a row that shrinks is a row nothing can be printed on top of.

  A tab narrower than 34rem gets the Menu as a column of full-width buttons
  instead of a wrapped cluster of ragged ones, which is how a phone draws a menu
  and how a thumb presses one. The figure used to shrink again here and no longer
  has to: a narrow tab is a handset, a handset is a tall tab, and a figure that is
  a share of the floor's height is width-limited by its own rule long before this
  block is reached.

  One ordering hazard runs through all five, and it is worth stating where the
  blocks are: a container query does not raise a rule's weight, so an override
  only wins by being read later. Every rule overridden below is declared a
  thousand lines above, which is why these blocks sit here at the end of the
  sheet rather than beside the rules they belong to.

  A tab that is taller than it is wide is a phone held the way a phone is normally
  held, and it is the case these three were never written for: every one of them
  asks about room, and portrait has the room — it is the SHAPE of the map that is
  the problem, because a wide picture in a tall box leaves most of the box under
  the picture rather than beside it. That state is the portrait block below, and it
  is the one that decides where the readout and the controls are drawn.
*/
@container ${ELEMENT_TAG} (max-width: 44rem) {
  .${ELEMENT_TAG}-chat { padding: .625rem; }
  .${ELEMENT_TAG}-chat-head { top: .625rem; left: .625rem; right: .625rem; }
  .${ELEMENT_TAG}-chat-vn-row { gap: .5rem; padding: .625rem; }
  .${ELEMENT_TAG}-room-screen > .${ELEMENT_TAG}-chat { overflow-y: auto; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage {
    flex: 1 1 9.5rem; height: auto; min-height: 9.5rem; padding-top: 3.25rem;
    justify-content: flex-end;
  }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast { height: 100%; max-height: none; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person,
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-active="true"] {
    flex: 0 1 30%; height: auto; justify-content: center;
  }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > .${ELEMENT_TAG}-avatar { width: min(4rem, 100%); }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > img { height: 5rem; max-width: 100%; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { flex: 0 0 auto; justify-content: flex-start; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-composer { flex: 0 0 auto; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-composer {
    position: sticky; bottom: 0; z-index: 2;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--popover);
  }
}
@container ${ELEMENT_TAG} (max-width: 55rem) and (max-height: 32rem) {
  .${ELEMENT_TAG}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}
@container ${ELEMENT_TAG} (max-height: 30rem) {
  .${ELEMENT_TAG}-chat { gap: .5rem; padding: .625rem; }
  .${ELEMENT_TAG}-chat-stage { gap: .25rem; }
  /*
    The same share of the figure's width as the rule it overrides, and a TIGHTER
    reservation under it: this block is where the plate under the figure is given
    up, so the half a rem it was keeping clear goes back to the figure. That is
    the only difference between the two lines, and it is the whole reason this
    block still states a size of its own.
  */
  .${ELEMENT_TAG}-chat-figure { width: min(38cqw, calc(100cqh - .5rem)); }
  .${ELEMENT_TAG}-chat-scene-place { display: none; }
  .${ELEMENT_TAG}-chat-log { gap: .375rem; }
  .${ELEMENT_TAG}-chat-vn-portrait { display: none; }
  .${ELEMENT_TAG}-chat-vn-reading { max-height: min(34cqh, 11rem); }
}
/* A short landscape viewport gives the cast a column beside the reading stack. */
@container ${ELEMENT_TAG} (min-width: 34rem) and (max-height: 30rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage {
    position: absolute; top: 3rem; bottom: .5rem; left: .5rem; width: 34%;
    z-index: 1; flex: none;
  }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person { font-size: .5625rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn,
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-row,
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat > .${ELEMENT_TAG}-composer {
    width: 64%; align-self: flex-end; box-sizing: border-box;
  }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { margin-top: auto; }
}
@container ${ELEMENT_TAG} (max-width: 34rem) {
  .${ELEMENT_TAG}-menu-group-buttons { flex-direction: column; align-items: stretch; }
  .${ELEMENT_TAG}-chat-menu { max-width: 88cqw; }
  .${ELEMENT_TAG}-chat-modes { max-width: 88cqw; }
  .${ELEMENT_TAG}-chat-menu-button { width: 2.25rem; height: 2.25rem; }
  .${ELEMENT_TAG}-chat-vn-portrait { width: min(4rem, 22cqw); }
}
@container ${ELEMENT_TAG} (max-width: 34rem) and (max-height: 32rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage { min-height: 7.5rem; padding-top: 2.75rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > .${ELEMENT_TAG}-avatar { width: min(3.25rem, 100%); }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > img { height: 3.5rem; }
}
/*
  A tab shorter than 22rem is 352 pixels of height, and at that height the top
  chrome, the card, the history tab, the composer and its own padding have already
  spent the tab: what is left for the floor is a strip, which is a villager's
  shoulders and nothing else. So this block buys the card's room from the three
  things that can most afford to give it up: the gap between the figure and its
  plate, the ceiling on the paragraph, and the size of the speaker's name.

  It used to take its share from the "right now" line as well, and 0.4.50 deleted
  that line rather than override it here — there is nothing left in the block to
  hide, so the row of chrome above the card is one badge and one button at every
  height. What the block does now is what it always did underneath: the paragraph
  is the box that shrinks, and the ceiling on it is what stops a long answer
  pushing the composer off a tab this short.

  It is last of the three on purpose: at 640x360 or 390x340 every one of these
  queries matches at once, and the floor is squeezed hardest by whichever block is
  read last. The shares are smaller here than in either block above for the same
  reason.

  ponytail: the ceiling of this block is about 19rem, and it is lower than it used
  to be because the card now carries a face, a name and a paragraph rather than a
  paragraph alone. Under 19rem the chrome, the card and the composer are the whole
  tab and the floor is a strip, so the figure is a strip too — it is a share of the
  row it stands in, and the row is whatever the card and the composer leave. What
  is accepted here is that a strip is what the player gets: a villager's shoulders
  and not their face. There is no honest alternative left to trade for — the row is
  the first thing this tab is short of, and the card is what is being read — and a
  figure that were allowed to keep its size would be a figure with its head above
  the top edge of the tab. If a tab this short ever has to work properly, the fix
  is a compact composer: the figure is already at its floor here and there is
  nothing left to take from the card.
*/
@container ${ELEMENT_TAG} (max-height: 22rem) {
  .${ELEMENT_TAG}-chat-stage { gap: .125rem; padding-bottom: .125rem; }
  .${ELEMENT_TAG}-chat-vn-reading { max-height: min(38cqh, 9rem); }
  .${ELEMENT_TAG}-chat-vn-name { font-size: .8125rem; }
}

@container ${ELEMENT_TAG} (max-width: 44rem) {
  .${ELEMENT_TAG}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}

/*
  There is no rule here for the way into a roleplay, and its absence is the fix.

  A section of its own used to live at the foot of the drawer: a heading, a verb
  in a row of its own, and a paragraph explaining what the verb does. On a phone
  held sideways that is a hundred and forty pixels of a three-hundred-and-ninety
  pixel drawer, and the drawer pays for it in the only currency it has left —
  the conversation, which came out at twenty-six pixels on an 844x390 screen and
  at NOTHING at all at 844x340 and 740x360, with the villager's square portrait
  flattened to two pixels in the column beside it. The room the player opened the
  drawer for was the thing being spent.

  So the verb is drawn in the drawer's own options menu, where it costs no height
  at all: the list is drawn over the reading rather than beside it, and it is
  closed when it is not being read. The paragraph it used to carry is the button's
  title now, which costs nothing and is where a player looks for it anyway.
*/
/*
  The spawn sheet: the questions asked between pressing Create spinoff chat and
the roleplay existing.

  It is a SHEET over the whole window rather than a panel inside the tab, and
  that is the one thing about it the player has to feel rather than read. Making
a chat is the moment this tab stops being a picture of a village and starts
  being a real roleplay in the player's own library, and a control that simply
  changed a dropdown would let that happen without anybody noticing. The dim is
  gentle on purpose — the game is still visible behind it and nothing is
  destroyed — but it is there, because what is about to happen is not a setting.

  Fixed rather than absolute, because the tab scrolls: a sheet anchored to the
  document would open somewhere up the page from wherever the player was
  standing. A transform on an ancestor would make this relative to that ancestor
  instead of to the window — the one thing that could move it, and the reason
  this is stated here rather than assumed.
*/
.${ELEMENT_TAG}-backdrop {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(.75rem, 3vw, 2rem);
  background: color-mix(in srgb, #05060a 52%, transparent);
}
.${ELEMENT_TAG}-sheet {
  display: flex; flex-direction: column; gap: .75rem;
  width: min(100%, 27rem); max-height: min(100%, 34rem);
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 1.5rem 3.5rem rgba(0, 0, 0, .45);
  padding: .9375rem;
  overflow: hidden;
}
.${ELEMENT_TAG}-sheet-head { display: flex; flex-direction: column; gap: .1875rem; }
.${ELEMENT_TAG}-sheet-title { margin: 0; font-size: .9625rem; font-weight: 600; }
.${ELEMENT_TAG}-sheet-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-sheet-body {
  display: flex; flex-direction: column; gap: .5rem;
  min-height: 0; overflow-y: auto; padding-right: .125rem;
}
.${ELEMENT_TAG}-sheet-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${ELEMENT_TAG}-sheet-actions-end { margin-left: auto; display: flex; flex-wrap: wrap; gap: .375rem; }
/*  The one filled button in the package. Everywhere else the accent is a border,
    because everywhere else the control sits inside the player's village and is
    one of several. Here there is exactly one thing to do next. */
.${ELEMENT_TAG}-button-primary {
  border-color: var(--primary); background: var(--primary);
  color: var(--primary-foreground, var(--background));
}
.${ELEMENT_TAG}-button-primary:hover { border-color: var(--primary); color: var(--primary-foreground, var(--background)); opacity: .9; }
/*  A preset, as a row rather than as an option in a select. It is drawn as a
    list because a preset is a choice with consequences — it decides how the
    whole roleplay reads — and a dropdown hides the consequences behind a click. */
.${ELEMENT_TAG}-choice {
  display: flex; flex-direction: column; align-items: flex-start; gap: .125rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .5rem;
  background: transparent; color: var(--foreground);
  padding: .4375rem .625rem; font: inherit; font-size: .8125rem; cursor: pointer;
}
.${ELEMENT_TAG}-choice:hover { border-color: var(--primary); }
.${ELEMENT_TAG}-choice[data-active="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${ELEMENT_TAG}-choice-note { font-size: .6875rem; line-height: 1.45; color: var(--muted-foreground); }
/*  One preset question, and the answers to it. The pills are the Engine's own
    button mode; the list below is its listbox mode, which it reaches for by
    itself once a question has enough answers that a wall of pills stops being
    readable. Both are drawn here because the popup has to be able to show
    whichever one the preset asked for. */
.${ELEMENT_TAG}-var { display: flex; flex-direction: column; gap: .3125rem; }
.${ELEMENT_TAG}-var-question { font-size: .75rem; font-weight: 600; line-height: 1.4; }
.${ELEMENT_TAG}-var-options { display: flex; flex-wrap: wrap; gap: .25rem; }
.${ELEMENT_TAG}-var-option {
  display: inline-flex; align-items: center; gap: .3125rem;
  border: 1px solid var(--border); border-radius: 999px;
  padding: .1875rem .5rem; font-size: .75rem; line-height: 1.4; cursor: pointer;
}
.${ELEMENT_TAG}-var-option:hover { border-color: var(--primary); }
.${ELEMENT_TAG}-var-option[data-on="true"] { border-color: var(--primary); color: var(--primary); }
.${ELEMENT_TAG}-var-option input { flex: none; margin: 0; accent-color: var(--primary); }
.${ELEMENT_TAG}-var-list {
  font: inherit; font-size: .75rem; max-width: 100%; min-height: 7rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground); padding: .25rem;
}
/*
  RETIRED 0.4.43 — the gate: what the tab used to be while one of its villagers
  was away in a scene.

  The whole village was replaced rather than dimmed, and that was the narrative
  rule the old feature was built on — while the player was doing something with
  one character, the village was not a place to be rearranging. It said so, and
  then gave three ways out: go to the chat, bring them home, or let the link go.

  No element carries these classes any more: the component that drew them,
  SceneGate, is retired next to the place it used to be defined. They are kept for
  the same reason it is — they are the only drawing of a village standing still,
  and a later lane that wants one again will want them again. Nothing reads a
  -gate- rule, so nothing here costs anything.
*/
.${ELEMENT_TAG}-gate {
  display: flex; flex-direction: column; gap: .75rem; align-items: flex-start;
  margin: auto; width: min(100%, 32rem); padding: 1.25rem;
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background));
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, .3);
}
.${ELEMENT_TAG}-gate-title { margin: 0; font-size: 1.125rem; font-weight: 600; }
.${ELEMENT_TAG}-gate-note { margin: 0; font-size: .8125rem; line-height: 1.55; color: var(--muted-foreground); }
.${ELEMENT_TAG}-gate-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
/*  The chip's own popover, hung off the toolbar button it belongs to. Absolute
    rather than fixed: it is a sentence about the button under the player's
    finger, and it should move with the chat chrome rather than with the page. */
.${ELEMENT_TAG}-tracker-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 17rem; display: flex; flex-direction: column; gap: .5rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${ELEMENT_TAG}-tracker-menu-title { margin: 0; font-size: .8125rem; font-weight: 600; }
.${ELEMENT_TAG}-tracker-menu-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${ELEMENT_TAG}-tracker-menu-row { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  The chip's width, released from the host's square.

  The Engine hands every package toolbar control the same class, and that class
  is a fixed square because every other control in that strip is one icon and
  nothing else. This one is not: its whole job is to tell the player that the chat
  they are reading belongs to their village, and an icon cannot tell them that.
  So the width is released here, the label is worn inside the button, and the
  colour, the radius, the border and the states all stay the host's — this rule
  adds a width and a gap and paints nothing.
*/
.${ELEMENT_TAG}-tracker-chip { width: auto; max-width: none; gap: .3125rem; padding-inline: .5rem; }
.${ELEMENT_TAG}-tracker-label { font-size: .6875rem; font-weight: 600; line-height: 1; letter-spacing: .01em; }
/*  On a phone the strip is a row of squares and there is no room for a word, so
    the chip goes back to being one: the icon, the same host chrome, and the same
    menu one press away. The sentence the label was carrying is the menu's first
    line, which is where a player on a phone will read it anyway. */
.${ELEMENT_TAG}-tracker[data-compact="true"] .${ELEMENT_TAG}-tracker-label { display: none; }
.${ELEMENT_TAG}-tracker[data-open="true"] .${ELEMENT_TAG}-tracker-label { color: var(--marinara-chat-chrome-button-text-active, currentColor); }
/*
  The tracker panel's body.

  Drawn inside the Engine's own tracker section, which already supplies the
  card, the veil and the heading, so this adds no chrome of its own — only the
  small amount of layout the Engine's shell leaves to the package.
*/
.${ELEMENT_TAG}-panel-view { display: flex; flex-direction: column; gap: .4375rem; }
.${ELEMENT_TAG}-panel-view-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: .375rem; font-size: .75rem; line-height: 1.5; }
.${ELEMENT_TAG}-panel-view-key { color: var(--muted-foreground); }
.${ELEMENT_TAG}-panel-view-actions { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .125rem; }
/*
  The tracker button, which is drawn inside the Engine's own chat chrome rather
  than inside this tab. Its colours and its size are the host's: the class the
  Engine hands over is worn whole, and everything here is only what the host has
  no opinion about — that the button and its icon share the host's own colour
  rather than this tab's.

  The data-state=done rule below and the spinner under it have nothing to match
  since 0.4.43 — there is one state now, because there is nothing the chip can be
  waiting for. Kept with the icons they belonged to; see the RETIRED note in the
  chrome further down.

  THE SPINNER HAS AN OWNER AGAIN as of 0.4.47, and it is not this one. It is the
  dot in the corner of a chat that is waiting on a villager — see chat-pending —
  which is the same animation doing the same job that the chip's spinner did: a
  turn going round while a model is out. The style itself was never the surprise;
  what went missing in 0.4.43 was the thing being waited for.
*/
.${ELEMENT_TAG}-tracker { position: relative; display: inline-flex; align-items: center; }
.${ELEMENT_TAG}-tracker svg { width: 1rem; height: 1rem; }
.${ELEMENT_TAG}-tracker[data-state="done"] { opacity: .7; }
.${ELEMENT_TAG}-spin { animation: ${ELEMENT_TAG}-spin .9s linear infinite; }
@keyframes ${ELEMENT_TAG}-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .${ELEMENT_TAG}-spin { animation: none; }
}

/* 0.6.10 mobile village: the wooden frame is the viewport, not the moving map. */
.${ELEMENT_TAG}-home-full[data-mobile="true"] { box-sizing: border-box; flex-direction: column; overflow: hidden; padding: .5rem; gap: .5rem; }
.${ELEMENT_TAG}-home-full[data-mobile="true"] .${ELEMENT_TAG}-room { min-height: 0; padding: calc(var(--${ELEMENT_TAG}-map-wood) + var(--${ELEMENT_TAG}-map-mat) + 1px); }
.${ELEMENT_TAG}-home-full[data-mobile="true"] .${ELEMENT_TAG}-home-map-viewport { display: block; width: 100%; height: 100%; overflow: visible; }
.${ELEMENT_TAG}-home-full[data-mobile="true"] .${ELEMENT_TAG}-stage { display: block; width: 100% !important; height: 100% !important; aspect-ratio: auto !important; touch-action: none; }
.${ELEMENT_TAG}-stage[data-mobile="true"] { touch-action: none; user-select: none; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-canvas { overflow: hidden; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-canvas-img { max-width: none; max-height: none; pointer-events: none; }
.${ELEMENT_TAG}-stage[data-mobile="true"][data-empty="true"] .${ELEMENT_TAG}-canvas { background: var(--background); }
.${ELEMENT_TAG}-mobile-logical { position: absolute; display: block; background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--primary) 17%, transparent), transparent 30%), linear-gradient(25deg, #34304d, #20243b); pointer-events: none; }
.${ELEMENT_TAG}-home-bar { display: flex; align-items: center; flex: 0 0 auto; gap: .35rem; min-width: 0; z-index: 15; }
.${ELEMENT_TAG}-home-bar-actions { display: inline-flex; align-items: center; gap: .35rem; margin-left: auto; }
.${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-button { min-height: 2.5rem; }
.${ELEMENT_TAG}-mobile-datetime { display: inline-flex; align-items: center; gap: .2rem; min-width: 0; border: 1px solid #d6ba7c; border-radius: .65rem; background: #718eb6; color: #172238; padding: .2rem .3rem; font-size: .95rem; white-space: nowrap; }
.${ELEMENT_TAG}-mobile-clock { display: flex; flex-direction: column; line-height: 1.15; font-variant-numeric: tabular-nums; font-size: clamp(.58rem, 2.5cqw, .75rem); }
.${ELEMENT_TAG}-mobile-board-button, .${ELEMENT_TAG}-mobile-menu-button, .${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-news-toggle { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; min-width: 2.5rem; min-height: 2.5rem; padding: .15rem; }
.${ELEMENT_TAG}-mobile-board-button { border: 3px solid #5c381d; border-radius: .3rem; background: repeating-linear-gradient(90deg, #ad7540 0 9px, #9a6636 9px 11px); color: #f6e3b6; box-shadow: inset 0 0 0 2px #c5925a, 0 2px 4px #0007; font-size: 1.4rem; cursor: pointer; }
.${ELEMENT_TAG}-mobile-board-button:disabled { opacity: .55; }
.${ELEMENT_TAG}-mobile-menu-button { font-size: 1.5rem; line-height: 1; }
.${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-news-toggle { position: relative; }
.${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-news-toggle svg { width: 1.3rem; height: 1.3rem; }
.${ELEMENT_TAG}-news-nyi { position: absolute; right: -.15rem; bottom: -.3rem; border-radius: .2rem; background: var(--popover); color: var(--foreground); padding: 0 .1rem; font-size: .55rem; font-weight: 700; }
.${ELEMENT_TAG}-home-bar .${ELEMENT_TAG}-news-panel { width: min(19rem, 80cqw); max-height: 60cqh; }
.${ELEMENT_TAG}-home-full[data-mobile="false"] .${ELEMENT_TAG}-mobile-datetime { font-size: 1rem; padding: .25rem .45rem; }
.${ELEMENT_TAG}-home-full[data-mobile="false"] .${ELEMENT_TAG}-mobile-clock { font-size: .75rem; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-holder { z-index: 2; }
.${ELEMENT_TAG}-stage .${ELEMENT_TAG}-pin-holder[data-selected="true"] { z-index: 7; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin[data-kind="place"], .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 0; background: transparent; color: #30261c; box-shadow: none; text-align: center; white-space: normal; line-height: 1.1; overflow: visible; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo-card, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo-card { display: flex; flex: 0 0 auto; flex-direction: column; width: clamp(3.5rem, 6cqw, 5rem); gap: .1rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo-card { width: clamp(4rem, 17cqw, 5.25rem); }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; overflow: visible; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo img, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-photo-tack, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${ELEMENT_TAG}-home-full .${ELEMENT_TAG}-pin-name, .${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: .58rem; font-weight: 700; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-pin[data-kind="person"] { max-width: 7rem; }
.${ELEMENT_TAG}-stage[data-mobile="true"][data-mobile-gesturing="true"] .${ELEMENT_TAG}-pin-photo-card { transition: none; }
.${ELEMENT_TAG}-stage[data-mobile="true"] .${ELEMENT_TAG}-doors { z-index: 8; transform: translateX(-50%); min-width: min(10rem, 70cqw); }
.${ELEMENT_TAG}-sectioned-menu .${ELEMENT_TAG}-menu-nav { display: none; }
.${ELEMENT_TAG}-mobile-menu-nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr)); gap: .5rem; }
.${ELEMENT_TAG}-mobile-menu-nav .${ELEMENT_TAG}-button { min-height: 2.75rem; text-align: left; }
.${ELEMENT_TAG}-mobile-menu-nav .${ELEMENT_TAG}-status { grid-column: 1 / -1; margin: 0; line-height: 1.45; }
.${ELEMENT_TAG}-sectioned-menu[data-section="index"] > .${ELEMENT_TAG}-panel, .${ELEMENT_TAG}-sectioned-menu[data-section="index"] > .${ELEMENT_TAG}-menu-body { display: none; }
.${ELEMENT_TAG}-sectioned-menu[data-section="noticeboard"] .${ELEMENT_TAG}-overlay { border: .8rem solid #9e6835; border-radius: .5rem; background: repeating-linear-gradient(90deg, #ba854d 0 21px, #a9733d 21px 24px); box-shadow: inset 0 0 0 2px #6b3d1e, 0 .5rem 1rem #0005; padding: .8rem; }
.${ELEMENT_TAG}-sectioned-menu[data-section="noticeboard"] .${ELEMENT_TAG}-notice-row { border: 1px solid #d9c69c; background: #fff7db; color: #33281d; padding: .6rem; box-shadow: 1px 2px 3px #0005; }
.${ELEMENT_TAG}-sectioned-menu[data-section="noticeboard"] .${ELEMENT_TAG}-notice-author { color: #33281d; }
.${ELEMENT_TAG}-sectioned-menu[data-section="noticeboard"] .${ELEMENT_TAG}-overlay-head > .${ELEMENT_TAG}-panel-title { color: #2e2116; font-size: 1rem; }
.${ELEMENT_TAG}-sectioned-menu[data-mobile="false"] .${ELEMENT_TAG}-mobile-menu-nav { grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
.${ELEMENT_TAG}-sectioned-menu[data-mobile="false"] .${ELEMENT_TAG}-mobile-menu-nav .${ELEMENT_TAG}-button { min-height: 2.5rem; }
.${ELEMENT_TAG}-mobile-map-preview { display: block; max-width: min(100%, 22rem); max-height: 13rem; object-fit: contain; border: 2px solid var(--border); }
.${ELEMENT_TAG}-setup-map-viewport:has(> .${ELEMENT_TAG}-stage[data-mobile="true"]) { height: min(55cqh, 30rem); overflow: hidden; }
.${ELEMENT_TAG}-setup-map-viewport > .${ELEMENT_TAG}-stage[data-mobile="true"] { width: 100% !important; height: 100% !important; aspect-ratio: auto !important; }
/* Shared place photographs, including the founding map before an image exists. */
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; padding: 0; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo-card { display: flex; flex-direction: column; gap: .1rem; width: 4rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; color: #30261c; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${ELEMENT_TAG}-stage[data-photo-pins="true"][data-mobile="false"] .${ELEMENT_TAG}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .55rem; font-weight: 700; }
.${ELEMENT_TAG}-pin-photo-empty { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #e8dfc9; font-size: 1.5rem; }
.${ELEMENT_TAG}-pin-placement-error { position: absolute; z-index: 15; left: .5rem; bottom: .5rem; margin: 0; max-width: calc(100% - 1rem); padding: .4rem .6rem; border-radius: .5rem; background: #261a19e8; color: white; font-size: .75rem; pointer-events: none; }
.${ELEMENT_TAG}-setup-venue-list { display: grid; gap: .45rem; margin: .5rem 0; }
.${ELEMENT_TAG}-setup-venue-card { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); align-items: center; gap: .65rem; min-height: 4.4rem; width: 100%; box-sizing: border-box; text-align: left; border: 1px solid var(--border); border-radius: .6rem; background: var(--background); color: var(--foreground); padding: .45rem; }
.${ELEMENT_TAG}-setup-venue-card[data-selected="true"] { border-color: var(--primary); }
.${ELEMENT_TAG}-setup-venue-card img, .${ELEMENT_TAG}-setup-venue-placeholder { width: 3.5rem; height: 3.5rem; object-fit: cover; border-radius: .3rem; background: #31291f; }
.${ELEMENT_TAG}-setup-venue-placeholder { display: grid; place-items: center; color: #eee5d5; font-size: 1.3rem; }
@media (prefers-reduced-motion: reduce) { .${ELEMENT_TAG}-pin-photo-card { transition: none; } }
.${ELEMENT_TAG}-setup-venue-card strong, .${ELEMENT_TAG}-setup-venue-card small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${ELEMENT_TAG}-setup-venue-editor { display: grid; gap: .65rem; border-top: 1px solid var(--border); padding-top: .75rem; }
.${ELEMENT_TAG}-setup-image-preview { display: block; width: min(100%, 18rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${ELEMENT_TAG}-preparing { display: grid; place-items: center; min-height: 100%; padding: 2rem; text-align: center; background: radial-gradient(circle at 50% 65%, #584a2e, #241e24 70%); color: #fff4dd; }
.${ELEMENT_TAG}-preparing-house { font-size: clamp(4rem, 13vw, 7rem); animation: ${ELEMENT_TAG}-settle 2.5s ease-in-out infinite; }
@keyframes ${ELEMENT_TAG}-settle { 50% { transform: translateY(-.35rem) rotate(2deg); } }
@media (prefers-reduced-motion: reduce) { .${ELEMENT_TAG}-preparing-house { animation: none; } }
/* Game Mode's reading stack: asides float over a bounded bottom panel. */
.${ELEMENT_TAG}-root.${ELEMENT_TAG}-room-screen { box-sizing: border-box; padding: 0; overflow: hidden; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { position: relative; align-self: center; width: min(58rem, 100%); margin-top: auto; padding: .6rem; box-sizing: border-box; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: 1rem; background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 88%, transparent)); backdrop-filter: blur(14px); box-shadow: 0 .75rem 2rem #0007; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .5rem); width: min(75%, 24rem); max-height: min(30cqh, 12rem); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-card { background: color-mix(in srgb, var(--background) 62%, transparent); box-shadow: none; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-reading { max-height: min(30cqh, 18rem); }
.${ELEMENT_TAG}-room-panel-tools { display: flex; align-items: center; gap: .5rem; min-height: 2rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-history-toggle { min-height: 2rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-composer { min-width: 0; }
.${ELEMENT_TAG}-room-mode-anchor { position: relative; flex: 0 0 auto; }
.${ELEMENT_TAG}-room-mode-toggle { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border: 0; border-radius: .5rem; background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; }
.${ELEMENT_TAG}-room-mode-menu { position: absolute; z-index: 20; left: 0; bottom: calc(100% + .45rem); display: grid; width: 9rem; padding: .25rem; border: 1px solid var(--border); border-radius: .6rem; background: var(--popover); box-shadow: 0 .5rem 1rem #0008; }
.${ELEMENT_TAG}-room-mode-menu button { border: 0; border-radius: .35rem; background: transparent; color: var(--foreground); text-align: left; padding: .5rem; font: inherit; cursor: pointer; }
.${ELEMENT_TAG}-room-mode-menu button[aria-checked="true"] { background: color-mix(in srgb, var(--primary) 17%, var(--popover)); }
.${ELEMENT_TAG}-room-mode-menu button:disabled { opacity: .5; cursor: default; }
.${ELEMENT_TAG}-mailbox-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: #0009; }
.${ELEMENT_TAG}-mailbox { width: min(42rem, 100%); max-height: min(80vh, 48rem); overflow: auto; padding: 1.5rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--popover); box-shadow: 0 1rem 3rem #0009; }
.${ELEMENT_TAG}-mailbox-list { display: grid; gap: .75rem; margin-top: 1rem; }
.${ELEMENT_TAG}-mailbox-item { padding: .9rem; border: 1px solid var(--border); border-radius: .75rem; }
.${ELEMENT_TAG}-venue-space-picture { display: block; width: min(100%, 24rem); aspect-ratio: 4 / 3; object-fit: cover; border: 1px solid var(--border); border-radius: .625rem; }
.${ELEMENT_TAG}-room-mode-toggle:focus-visible, .${ELEMENT_TAG}-room-mode-menu button:focus-visible, .${ELEMENT_TAG}-room-star-detail:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${ELEMENT_TAG}-room-star-detail { flex: 1; align-self: stretch; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; text-align: left; cursor: pointer; }
.${ELEMENT_TAG}-memory-backdrop { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; background: #0009; }
.${ELEMENT_TAG}-memory-dialog { box-sizing: border-box; width: min(28rem, 100%); max-height: min(75cqh, 36rem); overflow-y: auto; padding: 1rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--popover); color: var(--foreground); box-shadow: 0 1rem 2rem #0009; }
.${ELEMENT_TAG}-memory-dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.${ELEMENT_TAG}-memory-dialog-head h2 { margin: 0; font-size: 1rem; line-height: 1.4; }
.${ELEMENT_TAG}-memory-dialog-head button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 1.5rem; cursor: pointer; }
.${ELEMENT_TAG}-memory-dialog p { margin: .75rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
@container ${ELEMENT_TAG} (max-width: 44rem) { .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { width: 100%; padding: .45rem; } .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides { width: min(85%, 22rem); } .${ELEMENT_TAG}-room-mode-toggle { width: 2.5rem; height: 2.5rem; } }
@container ${ELEMENT_TAG} (min-width: 34rem) and (max-height: 30rem) { .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { width: 64%; align-self: flex-end; } }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-stars { top: 4.25rem; left: .625rem; width: min(15rem, calc(100% - 1.25rem)); max-height: 20cqh; gap: .25rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-star { gap: .35rem; padding: .35rem .45rem; font-size: .75rem; line-height: 1.3; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-star-dismiss { margin: -.3rem -.35rem -.3rem 0; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides { position: static; flex: 0 0 auto; align-self: flex-end; width: min(90%, 20rem); max-height: 9rem; margin-bottom: .125rem; z-index: 2; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-aside { max-width: 100%; padding: .4rem .55rem; gap: .375rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-aside-face { width: 1.5rem; height: 1.5rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-memory-backdrop { padding: .5rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-memory-dialog { width: min(20rem, 100%); max-height: 60cqh; padding: .75rem; }

/* Venue visits use a single shallow reading dock so the stage owns the remaining height. */
.${ELEMENT_TAG}-room-screen > .${ELEMENT_TAG}-chat { gap: 0; padding: 0; overflow: hidden; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-scrim {
  background: linear-gradient(180deg, color-mix(in srgb, var(--background) 30%, transparent), transparent 25%, transparent 65%, color-mix(in srgb, var(--background) 30%, transparent));
}
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vignette { opacity: .45; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-head { top: .65rem; left: .75rem; right: .75rem; z-index: 6; align-items: center; }
.${ELEMENT_TAG}-room-place, .${ELEMENT_TAG}-room-actions-trigger, .${ELEMENT_TAG}-room-notices-trigger {
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 82%, transparent));
  color: var(--foreground); backdrop-filter: blur(12px); box-shadow: 0 .25rem .75rem #0004;
}
.${ELEMENT_TAG}-room-place { display: block; max-width: min(18rem, 60%); padding: .35rem .65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .75rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-actions { position: relative; width: auto; margin-left: auto; }
.${ELEMENT_TAG}-room-actions-trigger { width: 2rem; height: 2rem; cursor: pointer; font-size: 1.25rem; line-height: 1; }
.${ELEMENT_TAG}-room-actions-menu { position: absolute; right: 0; top: calc(100% + .4rem); z-index: 15; display: grid; width: min(16rem, 80vw); padding: .25rem; border: 1px solid var(--border); border-radius: .7rem; background: var(--popover); box-shadow: 0 .6rem 1.5rem #0009; }
.${ELEMENT_TAG}-room-actions-menu button { border: 0; border-radius: .4rem; padding: .55rem .65rem; background: transparent; color: var(--foreground); text-align: left; font: inherit; font-size: .8125rem; cursor: pointer; }
.${ELEMENT_TAG}-room-actions-menu button:hover { background: color-mix(in srgb, var(--foreground) 9%, transparent); }
.${ELEMENT_TAG}-room-actions-menu button:disabled { opacity: .45; cursor: default; }
.${ELEMENT_TAG}-room-notices { position: absolute; top: 3.2rem; left: .75rem; z-index: 4; }
.${ELEMENT_TAG}-room-notices-trigger { min-width: 2.5rem; min-height: 2rem; padding: .25rem .55rem; color: #e5b13e; font-size: .75rem; cursor: pointer; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-room-stars, .${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-room-stars { position: absolute; top: calc(100% + .35rem); left: 0; width: min(20rem, calc(100vw - 1.5rem)); max-height: 35cqh; overflow-y: auto; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage { position: relative; top: auto; bottom: auto; left: auto; width: 100%; height: auto; min-height: 0; flex: 1 1 auto; padding: 3rem .75rem 0; box-sizing: border-box; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast { height: 100%; max-height: none; gap: clamp(.2rem, 1vw, 1rem); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person,
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-active="true"] { position: relative; flex: 1 1 0; max-width: 25%; height: 100%; min-width: 0; opacity: .78; transition: transform .18s ease, opacity .18s ease, filter .18s ease; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-active="true"] { z-index: 2; opacity: 1; filter: brightness(1.08); transform: scale(1.035); transform-origin: center bottom; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-sprite="false"] { justify-content: center; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > img { width: 100%; height: 100%; max-width: none; object-fit: contain; object-position: center bottom; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > .${ELEMENT_TAG}-avatar { width: min(8rem, 80%); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > span:not(.${ELEMENT_TAG}-avatar) { position: absolute; bottom: .3rem; max-width: 95%; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-rest { position: absolute; right: .5rem; bottom: .25rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { position: relative; z-index: 3; flex: 0 0 auto; align-self: center; width: min(72rem, calc(100% - 1.5rem)); margin: 0 auto .5rem; padding: .5rem .75rem; gap: .25rem; border-radius: .85rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat[data-opening-error="true"] .${ELEMENT_TAG}-chat-vn { display: flex; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-card { border: 0; border-radius: 0; background: transparent; backdrop-filter: none; box-shadow: none; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-row { padding: 0; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-column { gap: .18rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-reading { max-height: 5.8rem; min-height: 1.45rem; padding: 0 .25rem 0 0; overflow-y: auto; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-text,
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-beat { max-width: none; padding: 0; border: 0; border-radius: 0; background: transparent; color: var(--foreground); font-size: 1rem; line-height: 1.45; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-name,
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-label { align-self: flex-start; margin: 0; padding: 0; border-radius: 0; background: transparent; color: var(--marinara-chat-chrome-highlight-text, var(--primary)); font-size: .72rem; font-weight: 650; line-height: 1.35; letter-spacing: 0; text-transform: none; }
.${ELEMENT_TAG}-room-panel-tools { display: grid; grid-template-columns: minmax(4rem, 1fr) auto minmax(4rem, 1fr); gap: .4rem; min-height: 1.75rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); padding-top: .25rem; }
.${ELEMENT_TAG}-room-panel-tools .${ELEMENT_TAG}-chat-history-toggle { justify-self: start; min-height: 1.75rem; padding: .15rem .35rem; border: 0; background: transparent; font-size: .75rem; }
.${ELEMENT_TAG}-room-panel-tools .${ELEMENT_TAG}-chat-vn-counter { justify-self: center; }
.${ELEMENT_TAG}-room-panel-tools .${ELEMENT_TAG}-chat-vn-nav { justify-self: end; gap: .25rem; padding: 0; border: 0; }
.${ELEMENT_TAG}-room-panel-tools .${ELEMENT_TAG}-chat-vn-button { min-height: 1.75rem; padding: .2rem .4rem; border: 0; color: var(--foreground); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-log { position: absolute; z-index: 8; bottom: calc(100% + .45rem); left: 0; width: 100%; max-height: min(55cqh, 32rem); box-sizing: border-box; overflow-y: auto; padding: .75rem; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); box-shadow: 0 .75rem 2rem #0009; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); overflow-y: auto; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); margin: 0; }
.${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-composer { padding-top: .35rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); }
.${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-input > .${ELEMENT_TAG}-textarea { height: 1.75rem; min-height: 0; max-height: none; overflow-y: hidden; }
.${ELEMENT_TAG}-room-actions-trigger:focus-visible, .${ELEMENT_TAG}-room-actions-menu button:focus-visible, .${ELEMENT_TAG}-room-notices-trigger:focus-visible, .${ELEMENT_TAG}-room-panel-tools button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
@container ${ELEMENT_TAG} (max-width: 44rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage { min-height: 0; padding-top: 3rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person, .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person[data-active="true"] { flex: 1 1 0; max-width: 25%; height: 100%; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person > img { height: 100%; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { width: calc(100% - .75rem); margin-bottom: .35rem; padding: .45rem .55rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides, .${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides { position: absolute; right: .25rem; bottom: calc(100% + .3rem); width: min(52vw, 13rem); max-height: 20cqh; margin: 0; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides[data-side="left"], .${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides[data-side="left"] { right: auto; left: .25rem; }
}
@container ${ELEMENT_TAG} (max-height: 30rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-stage { min-height: 0; padding-top: 2.5rem; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn { width: min(72rem, calc(100% - .75rem)); align-self: center; }
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-reading { max-height: 4.35rem; }
}
@container ${ELEMENT_TAG} (max-width: 44rem) and (min-height: 40rem) {
  .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-vn-asides, .${ELEMENT_TAG}-room-screen[data-mobile="true"] .${ELEMENT_TAG}-chat-vn-asides { bottom: calc(100% + 13rem); }
}
@media (prefers-reduced-motion: reduce) { .${ELEMENT_TAG}-room-screen .${ELEMENT_TAG}-chat-cast-person { transition: none; } }
`;

function syncVillagesStyles() {
  const existing = document.getElementById(STYLE_ID);
  if (!document.querySelector(ELEMENT_TAG)) {
    existing?.remove();
    return;
  }
  if (existing) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = VILLAGES_STYLES;
  document.head.appendChild(style);
}

/**
 * Where the Engine keeps the admin secret this browser was given.
 *
 * The key is the Engine's, not the village's, and it holds the plain value the
 * owner typed into Settings → Advanced → Admin Access. Reading it here is what
 * makes that one paste serve this tab too, with nothing of the village's own to
 * fill in and nothing for the player to find twice.
 */
const ADMIN_SECRET_STORAGE_KEY = "marinara_admin_secret";

/**
 * The headers a village call arrives with.
 *
 * Every route the package serves is privileged, and the Engine answers a
 * privileged call from any address but its own loopback one **only** when the
 * request carries the admin secret the owner set on the server. The Engine's own
 * client attaches that header to every call it makes, and Noodle, Slurp and
 * Long-Term Memory attach it to theirs; the village was the one tab asking bare,
 * which is why it worked on the machine the Engine runs on and was refused
 * everywhere else, whatever the owner had pasted.
 *
 * Nothing changes for anybody playing on the machine the Engine runs on: there
 * is nothing stored under that key there, and the request goes out exactly as it
 * always did, because loopback does not want a secret. Neither does a browser
 * that refuses storage — the call still leaves, without the header, and the
 * refusal that comes back is the one it would have got anyway.
 */
function villagesRequestHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  try {
    const secret = window.localStorage.getItem(ADMIN_SECRET_STORAGE_KEY)?.trim();
    if (secret) headers.set("X-Admin-Secret", secret);
  } catch {
    // Storage is blocked (private mode, a locked-down origin). Ask without it.
  }
  // Only a body this tab serialized itself is ours to label. A FormData or a
  // Blob writes its own Content-Type, and naming one here would take the
  // boundary off a multipart body.
  if (typeof init?.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  return headers;
}

/**
 * What the tab says when the Engine turns a call down for want of that secret.
 *
 * The sentence is the Engine's own, kept word for word rather than paraphrased,
 * so a player who has met this refusal anywhere else in the app reads the same
 * words here: the same setting on the server, and the same box in this browser
 * that has to carry the matching value. A refusal that describes the problem in
 * one vocabulary and the remedy in another is how the remedy goes unread, and a
 * second wording of it would have to be kept in step by hand.
 *
 * The vendored copy of the Engine's client is compared against this string by
 * the package's own regression proof, so a re-worded Engine fails the village's
 * tests rather than leaving two sentences to drift apart.
 */
const PRIVILEGED_ACCESS_HINT =
  "This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings → Advanced → Admin Access. Marinara sends it as the X-Admin-Secret header.";

/**
 * The error for a call the Engine refused.
 *
 * Two of the gate's refusals are about the admin secret — "ADMIN_SECRET is
 * required for privileged APIs" and "Invalid or missing X-Admin-Secret header" —
 * and both are recoverable from the browser, so both are reported the way the
 * Engine's own panels report them: the hint first, then the gate's own sentence
 * in brackets, so the player is told what to do and what happened. Every other
 * refusal is the Engine's own sentence about the Engine's own front door (Basic
 * Auth, an untrusted host, a loopback-only rule) and is passed through
 * untouched, because the tab has nothing to add to it.
 */
function requestRefusal(payload: unknown, status: number, fallback: string): Error {
  const detail = (payload as { error?: unknown } | null)?.error;
  const message = typeof detail === "string" && detail ? detail : fallback;
  if (status === 403 && /admin[-_ ]?secret/iu.test(message)) {
    return new Error(`${PRIVILEGED_ACCESS_HINT} (${message})`);
  }
  return new Error(message);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_PATH}${path}`, {
    ...init,
    headers: villagesRequestHeaders(init),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw requestRefusal(payload, response.status, `The village replied ${response.status}.`);
  return normalizeVillageSnapshot(payload) as T;
}

/**
 * The Engine's own API, read and written as the signed-in owner.
 *
 * A separate helper from `request` above because it is a different server. The
 * path is absolute rather than prefixed and it carries the session so the host
 * can answer it as the owner. Three callers, and all three are about something
 * only the Engine knows: the connection list, which it masks before the list
 * leaves, so no key ever crosses this call; the portraits, which are the Engine's
 * own pictures of its own characters; and the picture of the Persona the player
 * is being, which is the Engine's own picture of the player and is written by the
 * same editor as the first.
 *
 * None of them is a village route and none reads or writes village state. This
 * is how the tab asks the Engine the questions the Engine's own panels ask, in
 * the same shape they ask them, so any change the Engine makes to its own front
 * door lands on this the same morning rather than on a private copy of it.
 *
 * Nothing here is cached, in either direction. A character's portrait is not a
 * document, and a browser answering a stale copy of it would be showing the
 * player somebody they had already re-dressed.
 */
async function requestHost<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    cache: "no-store",
    credentials: "same-origin",
    ...init,
    headers: villagesRequestHeaders(init),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw requestRefusal(payload, response.status, `The Engine replied ${response.status}.`);
  return payload as T;
}

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
type EngineCharacterSummary = {
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
type AvatarCrop =
  | { srcX: number; srcY: number; srcWidth: number; srcHeight: number }
  | { zoom: number; offsetX: number; offsetY: number; fullImage?: boolean };

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

/**
 * The card's framing, or null when it has none and when it cannot be read.
 *
 * A description of a picture is not a thing to trust, and the two ways one can
 * be wrong both end in a stretched face: a rectangle that runs off the edge of
 * the picture, and numbers that are not numbers. Both are refused rather than
 * clamped, and a refused crop is not an error the player is told about — the
 * picture is then drawn whole, which is what a card with no crop gets, and which
 * is what the Engine's own panels do with the same bad value.
 *
 * Decoded twice at most, because a persona's copy of this travels as a string
 * inside a string. Anything still a string after that is not a crop.
 */
function readAvatarCrop(value: unknown): AvatarCrop | null {
  let crop: unknown = value;
  for (let depth = 0; depth < 2 && typeof crop === "string"; depth += 1) {
    try {
      crop = JSON.parse(crop);
    } catch {
      return null;
    }
  }
  if (!crop || typeof crop !== "object" || Array.isArray(crop)) return null;
  const stored = crop as Record<string, unknown>;
  const { srcX, srcY, srcWidth, srcHeight } = stored;
  if (isFiniteNumber(srcX) && isFiniteNumber(srcY) && isFiniteNumber(srcWidth) && isFiniteNumber(srcHeight)) {
    if (srcWidth <= 0 || srcHeight <= 0 || srcX < 0 || srcY < 0) return null;
    // A hair of slack for a rectangle that was rounded as it was written, which
    // is the same slack the Engine's own reader allows.
    if (srcX + srcWidth > 1.001 || srcY + srcHeight > 1.001) return null;
    return { srcX, srcY, srcWidth, srcHeight };
  }
  const { zoom, offsetX, offsetY, fullImage } = stored;
  if (!isFiniteNumber(zoom) || zoom <= 0 || !isFiniteNumber(offsetX) || !isFiniteNumber(offsetY)) return null;
  if (fullImage !== undefined && typeof fullImage !== "boolean") return null;
  return fullImage === undefined ? { zoom, offsetX, offsetY } : { zoom, offsetX, offsetY, fullImage };
}

/**
 * The card's framing, as the styles the picture is drawn with.
 *
 * A rectangle is drawn by making the picture's box the crop's inverse and moving
 * it by the crop's own negative offset: a crop a quarter of the picture across is
 * drawn four times the box's width and slid left by the share it was cut from.
 * `object-fit: fill` is what makes those two cancel out into a plain,
 * undistorted enlargement — the box and the picture inside it share a shape by
 * construction, which is what the arithmetic is doing.
 *
 * That construction is also why the box this is drawn into has to be SQUARE: it
 * is the same square the crop is. A rectangle chosen in the avatar editor is
 * square in the source picture's own pixels, so it lands undistorted on a square
 * frame and on a tall one as a stretched face.
 *
 * The older shape needs none of that arithmetic — a zoom and an offset are
 * already a transform, and the box clips whatever is moved out of it. `fullImage`
 * is the one that asks for the letterbox instead of the crop, and a zoom of one
 * or less with no `fullImage` asks for nothing at all, exactly as it does in the
 * Engine.
 *
 * No crop returns no styles, which leaves the picture filling its box the way it
 * always would — the ordinary case for a card nobody has re-framed, not a fault.
 */
function avatarCropStyle(crop: AvatarCrop | null): CSSProperties {
  if (!crop) return {};
  if ("zoom" in crop) {
    const transform = `scale(${crop.zoom}) translate(${crop.offsetX}%, ${crop.offsetY}%)`;
    if (crop.fullImage) return { objectFit: "contain", transform };
    return crop.zoom <= 1 ? {} : { transform };
  }
  return {
    position: "absolute",
    width: `${100 / crop.srcWidth}%`,
    height: `${100 / crop.srcHeight}%`,
    left: `${(-crop.srcX / crop.srcWidth) * 100}%`,
    top: `${(-crop.srcY / crop.srcHeight) * 100}%`,
    maxWidth: "none",
    maxHeight: "none",
    objectFit: "fill",
  };
}

/** A face as the tab has read it: the picture, and the card's framing of it. */
type Portrait = {
  url: string;
  crop: AvatarCrop | null;
};

/** Portraits, keyed by character id, as the tab has managed to read them. */
type PortraitMap = Record<string, Portrait>;

/**
 * The portraits behind a list of character ids, in one call.
 *
 * Empty ids never leave the tab, because a request for nothing is a request the
 * Engine has to answer and a drawer that has no villagers in it has no pictures
 * to draw. A failure is swallowed by the caller rather than handled here: the
 * fallback is the initial that was already being drawn, so there is no error
 * state to reach — a villager whose picture could not be read is a villager
 * wearing their initial, which is exactly what they wore before this existed.
 */
async function readPortraits(ids: readonly string[], signal?: AbortSignal): Promise<PortraitMap> {
  if (ids.length === 0) return {};
  const rows = await requestHost<EngineCharacterSummary[]>("/api/characters/summaries", {
    method: "POST",
    body: JSON.stringify({ ids }),
    signal,
  });
  const portraits: PortraitMap = {};
  if (!Array.isArray(rows)) return portraits;
  for (const row of rows) {
    const id = typeof row?.id === "string" ? row.id : "";
    const url = typeof row?.avatarUrl === "string" ? row.avatarUrl.trim() : "";
    // The framing is read beside the picture rather than instead of it: a card
    // with a crop and no picture has nothing to frame, and a row with neither
    // leaves the villager in the initial they were already wearing.
    if (id.length > 0 && url.length > 0) portraits[id] = { url, crop: readAvatarCrop(row.avatarCrop) };
  }
  return portraits;
}

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
type EnginePersonaRow = {
  id: string;
  avatarPath: string | null;
  avatarCrop?: unknown;
};

/**
 * The picture of the Persona the player is being in this village, if there is one.
 *
 * Read one at a time rather than as a list, and read by id, because the question
 * is about exactly one Persona: the one this village is written against. A list
 * would be the whole library crossing the wire — names, descriptions, galleries —
 * to find a single address in it.
 *
 * Null is the ordinary answer for a player who is being nobody: a village can be
 * played as the name and description the wizard took, with no Persona behind it
 * at all, and that player has no picture and is not missing one. A Persona whose
 * portrait was never given one answers with an empty path and lands here too — the
 * two are the same thing to the card, which draws the Engine's own person mark for
 * both. So does a Persona the player has since deleted: the Engine answers 404,
 * the caller drops it, and the card wears the mark.
 */
async function readPersonaPortrait(personaId: string, signal?: AbortSignal): Promise<Portrait | null> {
  const id = personaId.trim();
  if (id.length === 0) return null;
  const row = await requestHost<EnginePersonaRow>(`/api/characters/personas/${encodeURIComponent(id)}`, { signal });
  const url = typeof row?.avatarPath === "string" ? row.avatarPath.trim() : "";
  if (url.length === 0) return null;
  return { url, crop: readAvatarCrop(row.avatarCrop) };
}

/**
 * The Engine's connection list, reduced to what a picker can draw.
 *
 * Video connections are dropped rather than shown greyed out: the village never
 * generates video, so offering one would be a choice that cannot be made.
 * Anything that is not an image connection is a language connection, which is
 * the same rule the Engine's own dropdowns apply.
 */
function connectionOptionsFrom(rows: readonly EngineConnectionRow[]): VillageConnectionOption[] {
  const options: VillageConnectionOption[] = [];
  for (const row of rows) {
    const id = typeof row.id === "string" ? row.id.trim() : "";
    if (id.length === 0) continue;
    const provider = typeof row.provider === "string" ? row.provider : "";
    if (provider === "video_generation") continue;
    const name = typeof row.name === "string" && row.name.trim() ? row.name.trim() : id;
    options.push({
      id,
      name,
      category: provider === "image_generation" ? "image_generation" : "language",
      defaultForAgents: row.defaultForAgents === true || row.defaultForAgents === "true",
    });
  }
  return options;
}

function messageFrom(cause: unknown, fallback: string): string {
  return cause instanceof Error && cause.message ? cause.message : fallback;
}

function staleVenueReason(cause: unknown): "inactivity" | "elsewhere" | null {
  const message = messageFrom(cause, "");
  if (message.includes("Interrupted: Inactivity")) return "inactivity";
  if (/no longer available|not active|already ended/iu.test(message)) return "elsewhere";
  return null;
}

async function completedGreetingAfterFailure(sessionId: string): Promise<RoomView | null> {
  try {
    const { session } = await request<{ session: RoomView | null }>("/rooms/active", {
      signal: AbortSignal.timeout(5_000),
    });
    return session?.id === sessionId && session.status !== "opening" ? currentRoom(session) : null;
  } catch {
    return null;
  }
}

function greetingFailureMessage(cause: unknown): string {
  const message = messageFrom(cause, "The greeting could not be prepared.");
  return /timeout|timed out|exceeded 28 seconds/iu.test(message)
    ? "The greeting took too long. Retry it or continue without a greeting."
    : `${message} Retry it or continue without a greeting.`;
}

/** The one node kind that is a run of other nodes rather than a leaf. */
type VillagesStyledNode = Extract<VillagesMarkdownNode, { kind: "styled" }>;

/**
 * A villager's line, drawn rather than printed.
 *
 * The reading of it is not here — it is `parseVillagesInlineMarkdown`, a copy of
 * the Engine's own reader, and the reasons for both the copy and the split are in
 * that module. What lives here is the translation from its nodes to elements,
 * because the class names are this file's and because the mapping is the part a
 * regression can only check by reading, not by running.
 *
 * Two of the six marks are the ENGINE'S OWN element and get no class at all:
 * `**bold**` is a `<strong>` and `*italic*` is an `<em>`, and the theme's fonts
 * already say what those mean. The rest need a word of styling the browser does
 * not supply on its own — see the sheet, where the three classes are one short
 * block and where the Engine's own version of them lives (scoped there to
 * `.mari-message-content`, which is what keeps it from being reused as-is).
 *
 * `keyPrefix` exists because these nodes are drawn inside lists — the history's
 * messages, and the two halves of a `***bold-italic***` — where React wants a key
 * and the position is the only identity there is. The Engine's own reader passes
 * one for the same reason.
 *
 * ponytail: nothing here is memoised, because a villager's line is read once per
 * draw and a paragraph is a few hundred characters. If a transcript ever grows
 * long enough for the reading to show up in a profile, the upgrade path is a
 * `useMemo` per message keyed on its content, not a change to the reader.
 */
function renderVillagesMarkdown(text: string, keyPrefix: string): ReactNode {
  return drawVillagesNodes(parseVillagesInlineMarkdown(text), keyPrefix);
}

function drawVillagesNodes(nodes: readonly VillagesMarkdownNode[], keyPrefix: string): ReactNode[] {
  let key = 0;
  return nodes.map((node) => {
    const at = `${keyPrefix}${key++}`;
    switch (node.kind) {
      // A string in an array needs no key, and a key on one would be noise.
      case "text":
        return node.text;
      case "code":
        return (
          <code key={at} className={`${ELEMENT_TAG}-chat-md-code`} dir="ltr">
            {node.text}
          </code>
        );
      case "link":
        return (
          <a
            key={at}
            className={`${ELEMENT_TAG}-chat-md-link`}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {node.text}
          </a>
        );
      default:
        return drawVillagesStyled(node, at);
    }
  });
}

/** The six marks, one element each. Bold-italic is the two the Engine nests. */
function drawVillagesStyled(node: VillagesStyledNode, at: string) {
  const children = drawVillagesNodes(node.children, `${at}-`);
  switch (node.style) {
    case "bold":
      return <strong key={at}>{children}</strong>;
    case "bold-italic":
      return (
        <strong key={at}>
          <em>{children}</em>
        </strong>
      );
    case "italic":
      return <em key={at}>{children}</em>;
    case "underline":
      return <u key={at}>{children}</u>;
    case "strikethrough":
      return <del key={at}>{children}</del>;
    default:
      return (
        <mark key={at} className={`${ELEMENT_TAG}-chat-md-highlight`}>
          {children}
        </mark>
      );
  }
}

/**
 * `"Morning"`, `"Morning and Evening"`, `"Morning, Afternoon and Evening"`.
 *
 * Written out as a sentence rather than joined with commas alone, because the
 * one caller reads it back to the player as a statement about what will happen,
 * and `"Morning, Evening"` reads like two unrelated things.
 */
function storyPaceSummary(pace: VillageStoryPace): string {
  if (pace === "off")
    return "Time, schedules, wishes, and approved projects still advance. No optional stories are added.";
  if (pace === "quiet") return "Usually one optional village story is written on an active day.";
  if (pace === "lively") return "Up to three optional village stories may be written on an active day.";
  return "Usually one to three optional village stories are written on an active day, averaging two.";
}

/**
 * Whether a place is a house, which is the one question the whole place list
 * turns on.
 *
 * Read as "does this place SAY it is a house", and read that way because the two
 * ways of being wrong are not the same size. A place wrongly counted as a
 * destination is offered to the model as somewhere a villager can be sent, and
 * the model answers with the number of the one it means — so a house in that list
 * is a villager sent to a place whose only reading is "at home". A place wrongly
 * counted as a house is offered to nobody, and the cost is a destination that
 * never gets chosen.
 *
 * It counts a BUILDING rather than an occupant, so an empty house the player
 * placed and has not filled yet is still a house. That is what lets the founding
 * wizard's four pins be four houses long before they are four people.
 *
 * This is the tab's copy of the server's `isHousePlace`, and it is a copy on
 * purpose: the server owns the record and this only decides what to draw and what
 * to offer. The alternative — sending the answer down beside every place — is a
 * field that could only ever restate what the record already says, and a field
 * that disagrees with the record it restates is the exact failure one list was
 * meant to end.
 */
function isHouse(place: Pick<VillageVenue, "occupancy" | "classes">): boolean {
  return (
    place.classes?.includes("residence") ??
    (place.occupancy.playerHome || place.occupancy.residentCharacterId !== null || place.occupancy.homeKind !== null)
  );
}

type VenueClass = NonNullable<VillageVenue["classes"]>[number];
const VENUE_CLASS_CHOICES: VenueClass[] = ["residence", "workplace", "gathering", "other"];

function venueClassesFor(place: VillageVenue): VenueClass[] {
  return place.classes?.length ? place.classes : isHouse(place) ? ["residence"] : ["other"];
}

function venueCapacityFor(place: VillageVenue): number {
  return Math.min(
    4,
    (place.residenceCapacity ?? 1) +
      (place.improvements ?? []).reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0),
  );
}

function venueAssignedCountFor(place: VillageVenue): number {
  return (
    (place.residentIds?.length ?? Number(Boolean(place.occupancy.residentCharacterId))) +
    Number(place.occupancy.playerHome)
  );
}

function venueSpaceFor(place: VillageVenue, venueClass: VenueClass): NonNullable<VillageVenue["spaces"]>[number] {
  return (
    place.spaces?.find((space) => space.venueClass === venueClass) ?? {
      id: venueClass,
      venueClass,
      description: place.description,
      image: place.presentation.image,
      state: {
        condition: place.state.condition,
        items: place.state.furniture,
        publicFacts: place.state.publicFacts,
        features: place.state.features ?? [],
        traces: place.state.traces ?? [],
        updatedAt: place.state.updatedAt,
      },
    }
  );
}

function VenueDraftFields({
  draft,
  existing,
  villagers,
  editableClasses,
  onChange,
}: {
  draft: VillageVenue;
  existing: boolean;
  villagers: VillageVillagerView[];
  editableClasses?: VenueClass[];
  onChange: (next: VillageVenue) => void;
}) {
  const classes = venueClassesFor(draft);
  const changeSpace = (venueClass: VenueClass, patch: Partial<NonNullable<VillageVenue["spaces"]>[number]>) => {
    const spaces = classes.map((item) =>
      item === venueClass ? { ...venueSpaceFor(draft, item), ...patch } : venueSpaceFor(draft, item),
    );
    onChange({ ...draft, spaces, description: spaces[0]?.description ?? draft.description });
  };
  return (
    <div className={`${ELEMENT_TAG}-field`}>
      <label className={`${ELEMENT_TAG}-label`}>
        Name
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          value={draft.name}
          maxLength={100}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
          placeholder="The Lantern Workshop"
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        Form <span className={`${ELEMENT_TAG}-hint`}>What is it, in your world?</span>
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          value={draft.form ?? ""}
          maxLength={200}
          onChange={(event) => onChange({ ...draft, form: event.target.value })}
          placeholder="A converted truck, a sleeping pod, an old diner…"
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        Purpose
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          value={draft.purpose}
          maxLength={200}
          onChange={(event) => onChange({ ...draft, purpose: event.target.value })}
          placeholder="What happens here?"
        />
      </label>
      <fieldset className={`${ELEMENT_TAG}-field`}>
        <legend className={`${ELEMENT_TAG}-label`}>Map pin · optional</legend>
        <p className={`${ELEMENT_TAG}-hint`}>Use a fraction from 0 to 1 across the map and down the map.</p>
        <div className={`${ELEMENT_TAG}-row`}>
          {(["x", "y"] as const).map((axis) => (
            <label key={axis} className={`${ELEMENT_TAG}-label`}>
              {axis === "x" ? "Across" : "Down"}
              <input
                className={`${ELEMENT_TAG}-notice-input`}
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={draft.presentation[axis] ?? ""}
                disabled={existing && venueAssignedCountFor(draft) > 0}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    presentation: {
                      ...draft.presentation,
                      [axis]: event.target.value === "" ? null : Number(event.target.value),
                    },
                  })
                }
              />
            </label>
          ))}
        </div>
        {existing && venueAssignedCountFor(draft) > 0 ? (
          <p className={`${ELEMENT_TAG}-hint`}>Move residents before changing this Venue's pin.</p>
        ) : null}
      </fieldset>
      <fieldset className={`${ELEMENT_TAG}-field`}>
        <legend className={`${ELEMENT_TAG}-label`}>Classes · choose up to two</legend>
        <div className={`${ELEMENT_TAG}-row`}>
          {VENUE_CLASS_CHOICES.map((item) => (
            <label key={item} className={`${ELEMENT_TAG}-label`} style={{ textTransform: "capitalize" }}>
              <input
                type="checkbox"
                checked={classes.includes(item)}
                disabled={existing || (!classes.includes(item) && classes.length >= 2)}
                onChange={(event) => {
                  const next = event.target.checked ? [...classes, item] : classes.filter((entry) => entry !== item);
                  if (next.length < 1 || next.length > 2) return;
                  onChange({ ...draft, classes: next, spaces: next.map((entry) => venueSpaceFor(draft, entry)) });
                }}
              />{" "}
              {item}
            </label>
          ))}
        </div>
        {existing ? <p className={`${ELEMENT_TAG}-hint`}>Class changes go through a Venue proposal.</p> : null}
      </fieldset>
      {classes.includes("residence") ? (
        <label className={`${ELEMENT_TAG}-label`}>
          Resident capacity · includes you
          <input
            className={`${ELEMENT_TAG}-notice-input`}
            type="number"
            min={1}
            max={4}
            value={draft.residenceCapacity ?? 1}
            disabled={existing}
            onChange={(event) => onChange({ ...draft, residenceCapacity: Number(event.target.value) })}
          />
          {existing ? (
            <span className={`${ELEMENT_TAG}-hint`}>Capacity changes go through a Venue proposal.</span>
          ) : null}
        </label>
      ) : null}
      {classes.includes("workplace") ? (
        <fieldset className={`${ELEMENT_TAG}-field`}>
          <legend className={`${ELEMENT_TAG}-label`}>Workers</legend>
          {villagers.map((villager) => (
            <label key={villager.characterId} className={`${ELEMENT_TAG}-label`}>
              <input
                type="checkbox"
                checked={(draft.workerIds ?? []).includes(villager.characterId)}
                onChange={(event) =>
                  onChange({
                    ...draft,
                    workerIds: event.target.checked
                      ? [...(draft.workerIds ?? []), villager.characterId]
                      : (draft.workerIds ?? []).filter((id) => id !== villager.characterId),
                  })
                }
              />{" "}
              {villager.name}
            </label>
          ))}
          {villagers.length === 0 ? <p className={`${ELEMENT_TAG}-hint`}>No villagers are available yet.</p> : null}
        </fieldset>
      ) : null}
      {classes
        .filter((item) => !editableClasses || editableClasses.includes(item))
        .map((item) => {
          const space = venueSpaceFor(draft, item);
          return (
            <section className={`${ELEMENT_TAG}-field`} key={item}>
              <h3 className={`${ELEMENT_TAG}-panel-title`} style={{ textTransform: "capitalize" }}>
                {item} space
              </h3>
              <label className={`${ELEMENT_TAG}-label`}>
                Scene description
                <textarea
                  className={`${ELEMENT_TAG}-textarea`}
                  value={space.description}
                  maxLength={1000}
                  onChange={(event) => changeSpace(item, { description: event.target.value })}
                />
              </label>
              <details className={`${ELEMENT_TAG}-venue-scene-details`}>
                <summary>Scene details</summary>
                <p className={`${ELEMENT_TAG}-hint`}>Current physical state used by visits and pictures.</p>
                <label className={`${ELEMENT_TAG}-label`}>
                  Condition now{" "}
                  <span className={`${ELEMENT_TAG}-hint`}>For example, a leaking roof or a repaired door.</span>
                  <input
                    className={`${ELEMENT_TAG}-notice-input`}
                    value={space.state.condition}
                    onChange={(event) =>
                      changeSpace(item, { state: { ...space.state, condition: event.target.value } })
                    }
                  />
                </label>
                <label className={`${ELEMENT_TAG}-label`}>
                  Present items · one per line{" "}
                  <span className={`${ELEMENT_TAG}-hint`}>Objects physically in this space.</span>
                  <textarea
                    className={`${ELEMENT_TAG}-textarea`}
                    value={space.state.items.join("\n")}
                    onChange={(event) =>
                      changeSpace(item, { state: { ...space.state, items: event.target.value.split("\n") } })
                    }
                  />
                </label>
                <label className={`${ELEMENT_TAG}-label`}>
                  Established facts · one per line{" "}
                  <span className={`${ELEMENT_TAG}-hint`}>Durable truths about this space.</span>
                  <textarea
                    className={`${ELEMENT_TAG}-textarea`}
                    value={space.state.publicFacts.join("\n")}
                    onChange={(event) =>
                      changeSpace(item, { state: { ...space.state, publicFacts: event.target.value.split("\n") } })
                    }
                  />
                </label>
                <div className={`${ELEMENT_TAG}-field`}>
                  <span className={`${ELEMENT_TAG}-label`}>Features · lasting details established through play</span>
                  {space.state.features.map((feature, index) => (
                    <div className={`${ELEMENT_TAG}-row`} key={feature.id}>
                      <input
                        className={`${ELEMENT_TAG}-notice-input`}
                        value={feature.text}
                        aria-label={`Feature ${index + 1}`}
                        onChange={(event) =>
                          changeSpace(item, {
                            state: {
                              ...space.state,
                              features: space.state.features.map((entry) =>
                                entry.id === feature.id ? { ...entry, text: event.target.value } : entry,
                              ),
                            },
                          })
                        }
                      />
                      <label className={`${ELEMENT_TAG}-label`}>
                        <input
                          type="checkbox"
                          checked={feature.locked}
                          onChange={(event) =>
                            changeSpace(item, {
                              state: {
                                ...space.state,
                                features: space.state.features.map((entry) =>
                                  entry.id === feature.id ? { ...entry, locked: event.target.checked } : entry,
                                ),
                              },
                            })
                          }
                        />{" "}
                        Locked
                      </label>
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-remove`}
                        aria-label={`Remove feature ${index + 1}`}
                        onClick={() =>
                          changeSpace(item, {
                            state: {
                              ...space.state,
                              features: space.state.features.filter((entry) => entry.id !== feature.id),
                            },
                          })
                        }
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={space.state.features.length >= 5}
                    onClick={() =>
                      changeSpace(item, {
                        state: {
                          ...space.state,
                          features: [
                            ...space.state.features,
                            {
                              id: createVillagesClientId(),
                              text: "",
                              sourceCharacterId: "",
                              locked: false,
                              updatedAt: "",
                            },
                          ],
                        },
                      })
                    }
                  >
                    Add Feature
                  </button>
                </div>
              </details>
              <p className={`${ELEMENT_TAG}-hint`}>Structural improvements use two proposal slots per Venue.</p>
            </section>
          );
        })}
    </div>
  );
}

/** The places in a list that are houses, in the order the village keeps them. */
function housePlaces(places: readonly VillageVenue[]): VillageVenue[] {
  return places.filter((place) => isHouse(place));
}

/** And the other half of the same list: everywhere a villager can be sent. */
function destinationPlaces(places: readonly VillageVenue[]): VillageVenue[] {
  return places.filter((place) => !isHouse(place) || venueClassesFor(place).some((item) => item !== "residence"));
}

/**
 * The same question for the houses, where the spot on the map is part of the
 * answer too.
 *
 * The saved side is the whole place list, because that is what the village sends
 * now, so the houses are picked out of it first. The two lists are then compared
 * in order, which holds because the draft is seeded from this same list and the
 * houses editor never reorders it — see `seedHomes`.
 */
function homesMatch(saved: readonly VillageVenue[], draft: readonly HomeDraft[]): boolean {
  const stored = housePlaces(saved);
  if (stored.length !== draft.length) return false;
  return draft.every((house, index) => {
    const place = stored[index];
    return (
      place.id === house.id &&
      place.name === house.name &&
      (place.form ?? "Home") === house.form &&
      place.occupancy.playerHome === house.isPlayerHome &&
      place.occupancy.residentCharacterId === house.characterId &&
      place.description === house.description &&
      // A pin dragged a thousandth of the way across the map is not an edit.
      Math.abs((place.presentation.x ?? -1) - (house.x ?? -1)) < 0.0001 &&
      Math.abs((place.presentation.y ?? -1) - (house.y ?? -1)) < 0.0001
    );
  });
}

/**
 * The whole place list, with the houses replaced by the houses editor's draft.
 *
 * One record on the server and two editors here, and each editor owns its own
 * half: the houses editor moves pins, sets buildings and hands out addresses; the
 * places editor renames and reworks the destinations. So a save sends the half it
 * edits beside the STORED copy of the other, which is what keeps a save from one
 * panel from committing an unsaved edit left sitting in the other — a list
 * written half from a draft and half from the record is not a state the village
 * should ever be able to be put in.
 *
 * A house that keeps its id keeps everything the houses editor never asks about:
 * its name, if the village ever gave it one, its note, and the picture somebody
 * drew for it. Only the spot, the building and who lives there are the editor's
 * to move.
 */
function withHouseDraft(stored: readonly VillageVenue[], houses: readonly HomeDraft[]): VillageVenue[] {
  const before = new Map(stored.map((place) => [place.id, place]));
  const moved: VillageVenue[] = houses.map((house) => {
    const place = before.get(house.id);
    return {
      id: house.id,
      name: house.name,
      form: house.form,
      classes: ["residence"],
      spaces: [
        {
          ...venueSpaceFor(
            place ?? {
              id: house.id,
              name: house.name,
              description: house.description,
              purpose: "",
              category: "",
              presentation: { image: null, x: house.x, y: house.y },
              occupancy: { playerHome: house.isPlayerHome, residentCharacterId: house.characterId, homeKind: null },
              capabilities: [],
              state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
            },
            "residence",
          ),
          description: house.description,
        },
      ],
      residenceCapacity: place?.residenceCapacity ?? 1,
      residentIds: house.characterId ? [house.characterId] : [],
      improvements: place?.improvements ?? [null, null],
      purpose: place?.purpose ?? "",
      description: house.description,
      category: place?.category ?? "",
      presentation: {
        image: place?.presentation.image ?? null,
        x: house.x,
        y: house.y,
      },
      occupancy: {
        playerHome: house.isPlayerHome,
        residentCharacterId: house.characterId,
        homeKind: null,
      },
      capabilities: place?.capabilities ?? [],
      state: place?.state ?? {
        condition: "",
        upgrades: [],
        furniture: [],
        publicFacts: [],
        updatedAt: "",
      },
    };
  });
  return [...moved, ...stored.filter((place) => !isHouse(place))];
}

/**
 * And the whole place list with the destinations replaced by the places editor's
 * draft, which is the same bargain struck the other way round.
 */
/**
 * A stable key for a row the player adds by hand — a venue, a home. Uniqueness
 * only has to hold within the open editor; the server mints the real id.
 */
function freshRowKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Four decimal places is finer than a pixel on any map and keeps stored numbers readable. */
function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

/*
  The two halves of the corner readout, built once rather than per render.
  The locale is deliberately left to the platform — `undefined` means "whatever
  this machine is set to" — which is what decides between 2:30 PM and 14:30
  without the tab needing a setting of its own for it.
*/
const CLOCK_DATE = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short" });
const CLOCK_TIME = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

/**
 * How often an open tab checks whether the village has moved on.
 *
 * A minute, against a clock that turns over four times a day. Fine enough that
 * nothing the village does can be noticed late, coarse enough that the check
 * itself is never the thing anyone is waiting for — and nearly every check ends
 * at the first question, because the part of the day has not changed.
 */
const VILLAGE_PULSE_MS = 60_000;

/**
 * How long a write-up has to be running before the tab admits to it.
 *
 * The common tick is the one that finds nothing to write and answers in a few
 * milliseconds, and a chip that blinks on every check would train the player to
 * ignore the one place real news is allowed to appear — the same corner that
 * carries every error. The rare tick that has a part of the day to catch up on
 * takes seconds, and that is the one worth saying something about.
 */
const SHOW_CATCHING_UP_AFTER_MS = 700;

function clockLabel(now: Date): string {
  return `${CLOCK_DATE.format(now)} · ${CLOCK_TIME.format(now)}`;
}

/**
 * The real date and time, always current.
 *
 * The label is held as the string rather than as a `Date`, so the once-a-second
 * tick produces a different string once a minute and React skips the other
 * fifty-nine renders instead of redrawing the tab every second for nothing.
 *
 * ponytail: this reads the DEVICE clock, which is the same thing as the
 * village's own clock only while the village derives it from real time. If the
 * village ever keeps time of its own, this has to read the snapshot again.
 */
function useRealClock(): string {
  const [label, setLabel] = useState(() => clockLabel(new Date()));
  useEffect(() => {
    const timer = setInterval(() => setLabel(clockLabel(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  return label;
}

/**
 * The corner readout on the map.
 *
 * A component of its own so the once-a-minute tick re-renders this span and
 * nothing else — putting the hook in the view would redraw the whole tab, map
 * included, every time the minute turned over.
 */
function MobileHudClock() {
  const [date, time] = useRealClock().split(" · ");
  return (
    <span className={`${ELEMENT_TAG}-mobile-clock`}>
      <span>{date}</span>
      <strong>{time}</strong>
    </span>
  );
}

function HomeDateWeather({ weather }: { weather: string }) {
  return (
    <span className={`${ELEMENT_TAG}-mobile-datetime`}>
      <MobileHudClock />
      <span role="img" aria-label={`Weather: ${weather || "unknown"}`} title={weather || "Weather unavailable"}>
        {weatherEmoji(weather)}
      </span>
    </span>
  );
}

function weatherEmoji(weather: string): string {
  if (/thunder/u.test(weather)) return "⛈️";
  if (/snow/u.test(weather)) return "❄️";
  if (/sleet/u.test(weather)) return "🌨️";
  if (/rain|drizzle/u.test(weather)) return "🌧️";
  if (/fog|haze/u.test(weather)) return "🌫️";
  if (/wind|breez/u.test(weather)) return "🌬️";
  if (/overcast/u.test(weather)) return "☁️";
  if (/frost/u.test(weather)) return "🥶";
  if (/hot|heat/u.test(weather)) return "☀️";
  return "🌤️";
}

/** The Engine's own node for this tab: everything the tab draws is inside it. */
function hostOf(node: Element | null): HTMLElement | null {
  return node?.closest<HTMLElement>(ELEMENT_TAG) ?? null;
}

// ── DORMANT 0.4.45 — the orientation reading, and what it was read for. ──────
//
// Two functions, both of them only ever called by the notice that asked a phone
// held upright to turn over. That notice is dormant below, and its stylesheet
// half is dormant beside the coarse-pointer block in the sheet, and the tab is
// drawn for portrait now — so neither of these is reached by anything.
//
// `hostOf` above is NOT part of this and is still live and still called — the
// fullscreen toggle uses it on every press, and it is the only way back to the
// Engine's node from a control inside the tab. Only the orientation reading and
// the two questions built on it are dormant.
//
// Kept, not deleted, for the same reason the notice is: the map is still a wide
// picture in a fitted frame, and a later lane that wants a sideways map again
// wants these back with it. Uncomment this and the notice below, uncomment the
// CSS block in the stylesheet, and put `<RotateNotice />` back on the homepage.
//
// /** The screen's orientation object, where the browser has one to offer. */
// function screenOrientation(): ScreenOrientation | null {
//   return screen.orientation ?? null;
// }
//
// /**
//  * Whether the phone is upright, as far as this browser is willing to say.
//  *
//  * Safari on an iPhone answers "portrait-primary" whichever way the phone is
//  * being held, so reading it there would hide the map from somebody already
//  * holding it the right way round. Being unsure which way up a phone is and
//  * saying nothing is the only answer that is never wrong — and the stylesheet,
//  * which asks the screen directly, still gets the notice right.
//  *
//  * The same shape of question as the fullscreen button's: the browser is the one
//  * that knows, and this never guesses on its behalf.
//  */
// function isPhoneUpright(): boolean {
//   const orientation = screenOrientation();
//   if (!orientation || typeof orientation.lock !== "function") return false;
//   return orientation.type === "portrait-primary" || orientation.type === "portrait-secondary";
// }

/**
 * The way onto the whole screen, and the only way this tab has of getting one.
 *
 * The Engine cannot help here: its capability mount is a plain element in a tab
 * with no fullscreen control of its own, and GachaForge draws its own button for
 * exactly the same reason — so this one lives on the map with the rest of the
 * tab's controls rather than in a header this package does not have.
 *
 * The screen is asked for on the HOST, not on the map's frame. The host is the
 * one node a re-render does not replace, and a fullscreen element that is
 * replaced takes the fullscreen state with it — the map would go fullscreen and
 * then lose the screen the next time the snapshot arrived.
 *
 * It is not stateful beyond the one fact it has to draw. The browser is already
 * keeping the answer, so it is read back off document.fullscreenElement; a copy
 * in this component would be a second answer to the same question, and the two
 * would disagree the first time the player pressed Escape.
 */
function FullscreenToggle() {
  const [full, setFull] = useState(false);
  useEffect(() => {
    const sync = () => setFull(hostOf(document.fullscreenElement) !== null);
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // Some phones — an iPhone is the one that matters — will not give a page the
  // whole screen at all. The button stays where it is and says so, because a
  // control that comes and goes with the browser is a control nobody can find
  // twice; there is nothing else this tab can offer in its place.
  const available = document.fullscreenEnabled;
  const label = available
    ? full
      ? "Leave the whole screen"
      : "Use the whole screen"
    : "This browser will not give the tab the whole screen";

  return (
    <button
      type="button"
      className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-icon-button`}
      disabled={!available}
      aria-pressed={full}
      aria-label={label}
      title={label}
      onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
        const host = hostOf(event.currentTarget);
        if (!host) return;
        if (document.fullscreenElement === host) {
          void document.exitFullscreen().catch(() => undefined);
          return;
        }
        const request = host.requestFullscreen?.();
        if (request) void request.catch(() => undefined);
      }}
    >
      {/* Inside out while the screen is ours: the same four corners pointing the
          other way, rather than a different picture to learn. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {full ? (
          <path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4" />
        ) : (
          <path d="M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5" />
        )}
      </svg>
    </button>
  );
}

/**
 * Visual-only Events prose, behind the button in the map's own top corner.
 * Until structured Events land, this feed never grounds narration, wishes,
 * memories, notices, or venue state. Its old entries remain readable here.
 *
 * The news used to be a column of the homepage: a gutter down one side of the
 * map, held open whether or not there was anything to put in it, and paid for by
 * the map on every screen. On a phone held sideways there is no width to hold it
 * open with, and a map fitted to whatever the news left of the tab is a strange
 * price for reading the news. So it is a disclosure: the button says the feed is
 * there and the panel unrolls beneath it, over the picture.
 *
 * A details element rather than a button and a box of state, because being open
 * or shut, the Enter and Space keys, and the expanded-or-collapsed announcement
 * are all the element's own and cannot drift out of step with the panel. The one
 * thing it does not do by itself is close when the player presses somewhere
 * else, which is what the component adds: a panel that can only be dismissed by
 * finding the button again would sit over the map for the whole game.
 *
 * What it says is what the column said. Deliberately not the noticeboard, which
 * is the other half of the same idea: the board is what the villagers say TO
 * each other, in their own handwriting, and most of it is a request; this is what
 * HAPPENED to the place, in the narrator's voice, and none of it is aimed at
 * anybody. A village with a full board and a quiet feed is getting on with
 * things.
 *
 * ponytail: it lists every happening the server keeps and scrolls, rather than
 * folding them by day or paging them. Forty short lines is a scroll, not a
 * problem; the day it is one is the day to group them.
 */
function VillageEvents({
  happenings,
  recap,
  mobile = false,
}: {
  happenings: readonly VillageHappening[];
  recap: VillageRecap | null;
  mobile?: boolean;
}) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  // Whether the panel is open is the element's own business, so this mirrors it
  // rather than owning it: two answers to one question are two answers that can
  // disagree, and the dismissal below has to know when there is something to
  // dismiss.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const node = detailsRef.current;
    if (!node) return;
    const sync = () => setOpen(node.open);
    node.addEventListener("toggle", sync);
    return () => node.removeEventListener("toggle", sync);
  }, []);

  // A pointerdown on the summary is inside the element, so it does not dismiss
  // it; a keydown on Enter while the summary has focus is; anything outside is.
  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (!(event.target instanceof Node) || detailsRef.current?.contains(event.target)) return;
      detailsRef.current?.removeAttribute("open");
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", outside);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", outside);
    };
  }, [open]);

  return (
    <details ref={detailsRef} className={`${ELEMENT_TAG}-news`}>
      <summary className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-news-toggle`} aria-label="Events (NYI)">
        {/* A page and its lines: the news keeps happening, and the button says
            where it is rather than how much of it there is. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          focusable="false"
        >
          <path d="M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
          <path d="M8 8h7M8 12h7M8 16h4" />
        </svg>
        {!mobile ? "Events" : null}
        <span className={`${ELEMENT_TAG}-news-nyi`}>NYI</span>
      </summary>
      <div className={`${ELEMENT_TAG}-news-panel`}>
        <h2 className={`${ELEMENT_TAG}-news-title`}>Events</h2>
        {recap ? (
          <div>
            <strong>While you were away</strong>
            {recap.details.length > 0 ? (
              <ul className={`${ELEMENT_TAG}-news-list`}>
                {recap.details.map((entry) => (
                  <li key={`recap-${entry.id}`} className={`${ELEMENT_TAG}-news-item`}>
                    {entry.text}
                  </li>
                ))}
              </ul>
            ) : null}
            {recap.summaries.map((summary) => (
              <p key={summary} className={`${ELEMENT_TAG}-news-empty`}>
                {summary}
              </p>
            ))}
            {recap.pendingDecisionCount > 0 ? (
              <p className={`${ELEMENT_TAG}-news-empty`}>
                {recap.pendingDecisionCount} pending{" "}
                {recap.pendingDecisionCount === 1 ? "decision needs" : "decisions need"} your attention.
              </p>
            ) : null}
          </div>
        ) : null}
        {happenings.length === 0 ? (
          <p className={`${ELEMENT_TAG}-news-empty`}>No events to show yet.</p>
        ) : (
          <ul className={`${ELEMENT_TAG}-news-list`}>
            {happenings.map((entry) => (
              <li key={entry.id} className={`${ELEMENT_TAG}-news-item`}>
                {entry.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

// ── DORMANT 0.4.45 — the notice that told a phone held upright to turn. ───────
//
// One component and the one helper only it used. It drew a full-bleed panel
// over the whole tab — a phone on its side, "Landscape only", a sentence saying
// why the village wanted a wide screen, and a **Play in landscape** button that
// asked for the screen and then asked the screen to turn — and it was shown by a
// portrait-and-coarse-pointer media query rather than by any state.
//
// It is switched off, and it is not retired. 0.4.45 draws the tab for portrait,
// so the sentence it carried is no longer true: the village is still a map and a
// map still wants a wide screen, but the tab no longer refuses to work without
// one. It is left in the file rather than deleted because the decision is not
// final — see the DORMANT CSS block in the stylesheet, which is the other half
// of it and which carries the whole argument for keeping the pair.
//
// NOTE FOR WHOEVER UNCOMMENTS THIS: the media query that showed the notice was
// `z-index: 5` and the chat drawer is `z-index: 3`, so a portrait phone with a
// conversation open had the notice painted over the conversation. That is not a
// reason to leave it dormant; it is a thing to fix on the way back in.
//
// /**
//  * What a phone held upright is told, and the only thing it is told.
//  *
//  * Almost all of this is CSS. The notice is hidden by default and shown by a
//  * portrait-and-touch media query, so it costs a desktop nothing and cannot get
//  * out of step with the layout: there is no listener and no state keeping the two
//  * in agreement, because there is only one of them. A coarse pointer is part of
//  * that test and is not decoration — a narrow desktop window is not a rotated
//  * phone, and telling somebody to turn their monitor would be absurd.
//  *
//  * The button exists for the one thing CSS cannot do, which is hold the screen
//  * sideways. Automatic rotation is a phone setting, and a phone with it switched
//  * off would otherwise be told to turn by a page that will not turn.
//  *
//  * screen.orientation.lock is not in every browser, so it is read off the object
//  * rather than assumed, and it is refused outright wherever the document is not
//  * itself fullscreen — which is why the screen is asked for first, and waited
//  * for. Only a refusal changes the sentence, into the one fact that is still true
//  * once the browser has said it cannot do it: the phone's own setting is holding
//  * the screen upright.
//  */
// /**
//  * Ask the screen to turn, and say whether it agreed.
//  *
//  * The whole screen is asked for first and WAITED for, because a rotation lock is
//  * refused outright wherever the document is not already fullscreen and the
//  * request for one does not finish before the next line runs. Starting both at
//  * once looks like it should work and never does: the lock is asked of a document
//  * that has not been given the screen yet.
//  *
//  * Every other browser, and every phone whose own rotation setting is off, comes
//  * back empty-handed, and that is a fact about the phone rather than an error to
//  * be shown — GachaForge answers it the same way, by leaving the notice up and
//  * changing what it says. So it is reported as an answer, not thrown.
//  */
// async function playLandscape(host: HTMLElement | null): Promise<boolean> {
//   try {
//     if (!document.fullscreenElement && host?.requestFullscreen) await host.requestFullscreen();
//     await screenOrientation()?.lock?.("landscape");
//     return true;
//   } catch {
//     return false;
//   }
// }
//
// function RotateNotice() {
//   // On a browser that will say which way up the phone is, and says it is
//   // upright, the phone's own rotation setting is the likely reason the page has
//   // not turned — so that is the thing to point at from the start rather than to
//   // wait to be asked. A browser that will not say is not being called a liar,
//   // only an unknown, and gets the sentence that is true either way.
//   const [lockedLikely, setLockedLikely] = useState(() => isPhoneUpright());
//   return (
//     <div className={`${ELEMENT_TAG}-rotate`} role="note">
//       <span aria-hidden="true" className={`${ELEMENT_TAG}-rotate-phone`}>
//         {/* A phone on its side, with the turn drawn on both sides of it. */}
//         <svg
//           viewBox="0 0 48 32"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth="1.6"
//           strokeLinecap="round"
//           focusable="false"
//         >
//           <rect x="15" y="6" width="18" height="20" rx="2.5" />
//           <circle cx="24" cy="22.5" r="1" fill="currentColor" stroke="none" />
//           <path d="M6 16h4M10 12.5 13.5 16 10 19.5M42 16h-4M38 12.5 34.5 16 38 19.5" />
//         </svg>
//       </span>
//       <p className={`${ELEMENT_TAG}-rotate-title`}>Landscape only</p>
//       <p className={`${ELEMENT_TAG}-rotate-note`}>
//         {lockedLikely
//           ? "The screen would not turn: switch off the phone's rotation lock, then turn the phone on its side."
//           : "The village is a map, and a map wants a wide screen."}
//       </p>
//       {screenOrientation()?.lock ? (
//         <button
//           type="button"
//           className={`${ELEMENT_TAG}-button`}
//           onClick={(event: ReactMouseEvent<HTMLButtonElement>) => {
//             // Only a refusal is reported: a screen that turns takes the notice
//             // with it, because the media query that shows it stops matching.
//             void playLandscape(hostOf(event.currentTarget)).then((turned) => {
//               if (!turned) setLockedLikely(true);
//             });
//           }}
//         >
//           Play in landscape
//         </button>
//       ) : null}
//     </div>
//   );
// }

/**
 * What a house is called, from whoever lives in it.
 *
 * A village does not name its houses: everybody there knows where everybody
 * lives, so the person IS the name, and "Professor Mari's house" is what a
 * villager would say. The player's own house is named by the same rule out of the
 * same field, because the player lives in a house like everybody else does — and
 * the day the player can move, the map will not have to be taught a second rule
 * to say where they went. It used to be the one house with a rule of its own: the
 * map called it "You" and the place screen called it "Your house", which made the
 * player's home a different KIND of thing from every other home on the map.
 *
 * `occupant` is a personal name, and every name here takes the possessive the
 * same way but one. "You" is what `playerDisplayName` falls back to for a village
 * nobody has been described in; it is the one word that arrives here that is not
 * a name, so it is the one that cannot be put in the possessive. That one house
 * says "Your house" at the start of a sentence and "your house" inside one.
 *
 * `startOfSentence` is the whole of that difference and it is the caller's to
 * answer, because only the caller knows where its own text begins: a pin and a
 * title begin one, and the look-around is read mid-sentence.
 */
function houseLabel(occupant: string, startOfSentence: boolean): string {
  const owner = occupant === "You" ? (startOfSentence ? "Your" : "your") : `${occupant}'s`;
  return `${owner} house`;
}

/**
 * What a house's pin says: whose it is, and nothing else.
 *
 * A house nobody has moved into is waiting rather than nameless, and "Empty
 * house" says that where the name of a building would say nothing about the one
 * thing the player is looking for — which is whether anybody lives here yet.
 */
function pinText(occupant: string): string {
  return occupant.length > 0 ? houseLabel(occupant, true) : "Empty house";
}

/**
 * What a building is called and the class it belongs to, as the village named
 * them. A kind the tab was not handed — reachable only from a document written
 * by some later version — is drawn by its own name rather than as a blank row.
 */
function buildingOf(buildings: readonly VillageBuildingOption[], kind: string | null): VillageBuildingOption {
  if (kind === null) return { kind: "", name: "Venue residence", category: "" };
  return buildings.find((option) => option.kind === kind) ?? { kind, name: kind, category: "" };
}

/** How a house's pin reads at a glance: yours, someone's, or nobody's yet. */
function pinTone(place: { isPlayerHome: boolean; occupant: string }): "player" | "resident" | "empty" {
  if (place.isPlayerHome) return "player";
  return place.occupant ? "resident" : "empty";
}

/**
 * What the screen standing in a place is called.
 *
 * A house is named by who lives in it rather than by its own name, because the
 * village does not give houses names — everybody knows where everybody lives —
 * and the player's own house is named the same way out of the same reader. A
 * named house still says its name once nobody has moved in, which is the one case
 * where the name is the only true thing about it.
 *
 * A landmark is its own name, and the village never made one without one: the
 * server drops a place with no name and nothing to make it a house, so the last
 * arm here is reached only by an empty house.
 */
function venueTitle(place: Pick<VillageVenue, "name">, occupant: string): string {
  if (occupant.length > 0) return houseLabel(occupant, true);
  return place.name || "An empty house";
}

/**
 * Where a place stands on the picture, or null when nobody has drawn it yet.
 *
 * One reader for the question, because the answer is two fields that are only ever
 * a position together: half a spot is not a place, and a caller that reads `x` and
 * forgets to ask about `y` puts a pin on the left-hand edge of the map.
 */
function placeSpot(place: VillageVenue | null | undefined): { x: number; y: number } | null {
  if (!place) return null;
  return place.presentation.x === null || place.presentation.y === null
    ? null
    : { x: place.presentation.x, y: place.presentation.y };
}

/**
 * How far under a place its people stack, as a fraction of the picture.
 *
 * Big enough to clear a pin, small enough that a crowd still reads as being at the
 * place rather than down the street from it.
 */
const STANDING_PIN_STEP = 0.028;

/** Read a picked picture as a data URL, which is the only form the village stores. */
function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("That picture could not be read."));
    reader.readAsDataURL(file);
  });
}

/**
 * How large a picture is, read from the picture itself.
 *
 * The size comes off the decoded image rather than off the file's own metadata:
 * this is the number the panel compares against the size the map expects, and
 * the browser is the thing that will actually draw it. A header that disagrees
 * with the pixels would make the tab warn about the wrong picture.
 */
function measureImage(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("That picture could not be read."));
    image.src = src;
  });
}

/**
 * The three ways a picture can be made to fit the frame, in the words the panel
 * offers them. The order runs from "fills the frame" to "shows all of it", which
 * is the order the trade-off itself has.
 */
const TOWN_MAP_FITS: readonly { fit: TownMapFit; label: string; help: string }[] = [
  {
    fit: "cover",
    label: "Fill the frame",
    help: "Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept.",
  },
  {
    fit: "stretch",
    label: "Stretch to fill",
    help: "Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched.",
  },
  {
    fit: "contain",
    label: "Show all of it",
    help: "Keeps the whole picture and leaves the frame's own background showing around it.",
  },
];

/**
 * What is actually true of a picture, said plainly, before the player picks a
 * fit. The three outcomes are different enough to be worth different advice:
 * a picture at the map's shape needs none, a bigger one only needs to be aimed,
 * and a smaller one has to be warned about because filling the frame with it
 * means inventing pixels.
 */
function pictureAdvice(size: { width: number; height: number }): { tone: "ok" | "warn"; text: string } {
  if (size.width / size.height < 1.2) {
    return {
      tone: "warn",
      text: `This ${size.width}×${size.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`,
    };
  }
  if (size.width < 1024 || size.height < 700) {
    return {
      tone: "warn",
      text: `This ${size.width}×${size.height} map will fit in full, but it may look soft when enlarged.`,
    };
  }
  return {
    tone: "ok",
    text: `This ${size.width}×${size.height} map will be shown at its native shape, with the whole image visible.`,
  };
}

/** One pin drawn over the town map. */
type MapPin = {
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
type PictureBox = { left: number; top: number; width: number; height: number };

/** The shape the map is drawn at: the picture size the settings named. */
type MapFrameShape = { width: number; height: number };

/** How far the picture may be magnified, and how much one press moves it. */
type MapZoomRange = { min: number; max: number; step: number };

/** A number brought inside a range. The drag is the only caller that can leave one. */
function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * The box a picture is drawn in, in the frame's own pixels.
 *
 * This is the box a fraction of the map is a fraction of, and it is deliberately
 * not always the frame: `contain` shrinks the picture until it fits and leaves
 * the frame's own background showing, `cover` grows it until it fills and lets
 * the overhang be cropped, and `stretch` is the only one of the three where the
 * two boxes are the same box. The focus then slides that drawing under the frame
 * and the zoom magnifies it, so every framing is a different box — which is why
 * the pins are placed against what this returns and not against the frame.
 *
 * The anchor is one expression for all three fits. The CSS is given the same
 * percentage twice on purpose: `object-position: X%` holds the picture's own X%
 * point against the frame's X% point, and magnifying about `transform-origin: X%`
 * leaves exactly that point where it was — so `left = (frame - drawn) * focus`
 * describes both the drawing and the magnifying, and this stays in step with
 * what the browser actually renders instead of approximating it.
 */
function pictureBox(
  size: { width: number; height: number },
  frame: { width: number; height: number },
  view: TownMapView,
): PictureBox {
  if (view.fit === "stretch") return { left: 0, top: 0, width: frame.width, height: frame.height };
  // A picture that is only being fitted has nothing to aim: it is already all
  // there and the frame has nothing to crop, so it is centred and the focus is
  // left alone. That also means the focus survives a trip through "show all of
  // it" and back to a crop, which is what the player meant by setting it.
  if (view.fit === "contain") {
    const scale = Math.min(frame.width / size.width, frame.height / size.height);
    const width = size.width * scale;
    const height = size.height * scale;
    return { left: (frame.width - width) / 2, top: (frame.height - height) / 2, width, height };
  }
  // A crop, magnified as far as the zoom says. It is the only fit with picture
  // left over outside the frame, which is why it is the only one that can be
  // aimed and the only one worth magnifying.
  const scale = Math.max(frame.width / size.width, frame.height / size.height) * view.zoom;
  const width = size.width * scale;
  const height = size.height * scale;
  return {
    left: (frame.width - width) * (view.focusX / 100),
    top: (frame.height - height) * (view.focusY / 100),
    width,
    height,
  };
}

/** The inline CSS a picture is drawn with, from the same numbers `pictureBox` reads. */
function pictureStyle(view: TownMapView): CSSProperties {
  if (view.fit === "stretch") return { objectFit: "fill" };
  if (view.fit === "contain") return { objectFit: "contain" };
  return {
    objectFit: "cover",
    objectPosition: `${view.focusX}% ${view.focusY}%`,
    ...(view.zoom === 1
      ? null
      : { transform: `scale(${view.zoom})`, transformOrigin: `${view.focusX}% ${view.focusY}%` }),
  };
}

/** The framing a picture starts at, so the tab and the server agree before either is told. */
function defaultView(fit: TownMapFit): TownMapView {
  return { fit, focusX: 50, focusY: 50, zoom: 1 };
}

/**
 * The town map, with the homes on it.
 *
 * The picture is the page here, so the pins are placed as fractions of the
 * PICTURE rather than of the frame: the same home stays on the same building
 * whether the tab is a phone or a wide monitor, and the stored position means
 * the same thing to every reader of the record. The two boxes are not the same
 * box — see `pictureBox` — which is why this measures the picture and the frame
 * separately and places every pin against the first of them.
 *
 * Three different things can be asked of a stage:
 *   * `onPlace` makes it a picker — the picture takes clicks and reports where
 *     they landed. That is what the founding wizard and the homes editor ask for.
 *   * `onView` makes it a framing editor — dragging slides the picture under the
 *     frame and the zoom buttons magnify it. That is what the Town map panel
 *     asks for. Only a crop is draggable, because it is the only fit with
 *     picture left over to drag into view.
 *   * neither, which is the homepage: the map is drawn and the pins are the only
 *     things that take a click.
 *
 * `compact` draws a stand-in for the map instead of the map — the same picture
 * at the same shape, small enough to sit beside a column of prose.
 *
 * `fitToRoom` measures the box this is drawn in and sizes the frame to the
 * largest one of the map's shape that the box holds. The homepage is the whole
 * tab and asks for it, because there the room is also the ceiling: a frame as
 * wide as the room is a frame taller than the room, and the map is cropped to
 * fill it. Everywhere else the column the map sits in is what decides how wide
 * it is, and measuring that column from the map inside it would be measuring a
 * box against its own contents.
 */
function MapStage({
  src,
  alt,
  pins,
  placing,
  view,
  shape,
  zoom,
  onPlace,
  onView,
  onDismiss,
  compact,
  fitToRoom,
  mobile,
  photoPins,
  children,
}: {
  src: string | null;
  alt: string;
  pins: MapPin[];
  placing: boolean;
  view: TownMapView;
  /** The shape the frame is drawn at. Absent for the beat before the settings arrive. */
  shape: MapFrameShape | null;
  /** The zoom range, from the settings. Only the framing editor is given one. */
  zoom?: MapZoomRange;
  onPlace?(
    x: number,
    y: number,
    pictureSize?: { width: number; height: number; photoWidth: number; photoHeight: number },
  ): void;
  onView?(next: TownMapView): void;
  /**
   * A press on the map that was not a press on a pin.
   *
   * The stage draws the pins and so it is also the thing that knows a press went
   * past them: a pin takes its own press and stops it, so anything that reaches
   * here was aimed at the picture. The caller does the resting of whatever a pin
   * left open, and what it hangs on this is a way for the map to be the way out of
   * its own menus — without it, a list of doors under a pin could only be shut by
   * opening another pin.
   *
   * Not offered while a house is being placed: there, a press on the picture is
   * where the house goes, and a press that both put a pin down and shut something
   * would be two answers to one click.
   */
  onDismiss?(): void;
  compact?: boolean;
  /** Size the frame to the largest shape the map's own that the room around it holds. */
  fitToRoom?: boolean;
  mobile?: boolean;
  /** Show the village's photo cards while keeping desktop's fitted map. */
  photoPins?: boolean;
  /**
   * Anything that belongs on the picture rather than beside it. Drawn inside the
   * frame, which is the picture's box and the only box whose corner is also the
   * picture's corner — a corner drawn on the column instead lands in the gutter
   * the column has left over on whichever axis is not limiting it.
   */
  children?: ReactNode;
}) {
  const picking = onPlace !== undefined;
  const framing = onView !== undefined;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  // Both measurements are tagged with the map they belong to, so picking a new
  // picture measures it afresh instead of holding the previous map's shape for
  // a beat and sliding every pin under it.
  const [decoded, setDecoded] = useState<{ src: string; width: number; height: number } | null>(null);
  const [frame, setFrame] = useState<{ width: number; height: number } | null>(null);
  const [mobileView, setMobileView] = useState<MobileMapView | null>(null);
  const mobileViewRef = useRef<MobileMapView | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<{ view: MobileMapView; x: number; y: number; distance: number } | null>(null);
  /**
   * The frame's size once the room around it has been measured. The map's shape
   * is not the room's shape, so a frame as wide as the room is a frame taller
   * than the room, and what a crop does to a frame of the wrong shape is eat the
   * top and bottom of the map. The corners of the map are where its corner
   * houses are, and a corner house nobody can see is a house nobody can open.
   */
  const [fitted, setFitted] = useState<{ width: number; height: number } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  /** What a drag started from, held by reference because it is read on every move. */
  const dragRef = useRef<{ x: number; y: number; focusX: number; focusY: number; spanX: number; spanY: number } | null>(
    null,
  );
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressTouchClickRef = useRef(false);
  /**
   * The focus while a drag is in flight, kept here rather than sent up on every
   * pointer move. The picture has to follow the pointer smoothly, and a round
   * trip through the panel would redraw the whole editor for each pixel of it.
   * The move is sent up once, when the pointer is let go.
   */
  const [dragging, setDragging] = useState<{ focusX: number; focusY: number } | null>(null);
  const live: TownMapView = useMemo(() => (dragging ? { ...view, ...dragging } : view), [dragging, view]);
  const mobileImage = src ? (decoded?.src === src ? decoded : null) : shape;
  const mobileInitial: MobileMapView = {
    zoom: mobileImage && frame ? mobileCoverZoom(mobileImage, frame) : 1,
    centerX: 0.5,
    centerY: 0.5,
  };
  const mobileCurrent = mobileView ?? mobileInitial;
  const picture = useMemo(
    () =>
      mobile
        ? mobileImage && frame
          ? mobileMapBox(mobileImage, frame, mobileCurrent)
          : null
        : src
          ? decoded && decoded.src === src && frame
            ? pictureBox(decoded, frame, live)
            : null
          : frame
            ? { left: 0, top: 0, width: frame.width, height: frame.height }
            : null,
    [decoded, frame, live, mobile, mobileImage, mobileCurrent, src],
  );
  useEffect(() => {
    setMobileView(null);
    mobileViewRef.current = null;
    pointersRef.current.clear();
    gestureRef.current = null;
  }, [src, frame?.width, frame?.height]);
  // The shape is the village's rather than this file's: the frame is laid out
  // from the picture size the settings named, so "what shape is a map" is
  // answered in exactly one place. No settings yet means no shape yet.
  //
  // A fitted frame is given both of its sides rather than a ratio, because a
  // ratio would still leave one of them to the room — and a frame whose height
  // is the room's height is a frame the map has to be cropped to fill.
  const style: CSSProperties | undefined = shape
    ? fitToRoom && fitted
      ? { width: `${fitted.width}px`, height: `${fitted.height}px`, aspectRatio: `${shape.width} / ${shape.height}` }
      : { aspectRatio: `${shape.width} / ${shape.height}` }
    : undefined;

  const measure = useCallback(() => {
    const element = frameRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    // Same box, same object: a resize that changes nothing should not rerender.
    setFrame((previous) =>
      previous && previous.width === rect.width && previous.height === rect.height
        ? previous
        : { width: rect.width, height: rect.height },
    );
  }, []);

  // The frame changes size with the window, the pane and the wizard's step.
  useEffect(() => {
    const element = frameRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(element);
    return () => observer.disconnect();
  }, [measure]);

  /**
   * The room the frame is drawn in. The largest frame of the map's shape that
   * fits it is the smaller of "as wide as the room" and "as wide as the room is
   * tall" — the two ways a box of a fixed shape can be too big for a box of
   * another shape.
   *
   * What the frame is fitted to is the room's content box, not its border box:
   * the room's padding is the buffer the wooden frame is drawn into, and
   * measuring the border box instead would hand the frame that buffer as
   * usable width. The frame would then fill the room corner to corner and be
   * sitting on top of its own wood.
   */
  const measureRoom = useCallback(() => {
    const room = stageRef.current?.parentElement;
    if (!room || !shape) return;
    const box = room.getBoundingClientRect();
    const roomStyle = getComputedStyle(room);
    const inset = (side: string) => Number.parseFloat(roomStyle.getPropertyValue(side)) || 0;
    const availableWidth = box.width - inset("padding-left") - inset("padding-right");
    const availableHeight = box.height - inset("padding-top") - inset("padding-bottom");
    const ratio = shape.width / shape.height;
    const width = Math.min(availableWidth, availableHeight * ratio);
    if (!(width > 0)) return;
    // Same box, same object: a resize that changes nothing should not rerender.
    setFitted((previous) =>
      previous && Math.abs(previous.width - width) < 0.5 ? previous : { width, height: width / ratio },
    );
  }, [shape]);

  // The room, watched separately from the frame, because the frame is inside it:
  // a window resize reaches the room first and only reaches the frame once this
  // has resized it. Laid out rather than painted, so the first frame the map is
  // ever drawn in is already the right one and the map is not seen jumping.
  useLayoutEffect(() => {
    if (!fitToRoom) return;
    measureRoom();
    if (typeof ResizeObserver === "undefined") return;
    const room = stageRef.current?.parentElement;
    if (!room) return;
    const observer = new ResizeObserver(() => measureRoom());
    observer.observe(room);
    return () => observer.disconnect();
  }, [fitToRoom, measureRoom]);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!picking || !onPlace || !picture) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left - picture.left) / picture.width;
      const y = (event.clientY - rect.top - picture.top) / picture.height;
      // The margin beside a picture that does not fill the frame is not part of
      // the map, so a click there is not a position the player chose.
      if (!(x >= 0 && x <= 1) || !(y >= 0 && y <= 1)) return;
      const photo = frameRef.current?.querySelector<HTMLElement>(`.${ELEMENT_TAG}-pin-photo`);
      const photoRect = photo?.getBoundingClientRect();
      onPlace(round4(x), round4(y), {
        width: picture.width,
        height: picture.height,
        photoWidth: photoRect?.width ?? 58,
        photoHeight: photoRect?.height ?? 58,
      });
    },
    [onPlace, picking, picture],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!framing || !picture || !onView || live.fit !== "cover") return;
      const rect = event.currentTarget.getBoundingClientRect();
      // How far the picture can travel in each direction. Zero means it is
      // exactly as wide — or as tall — as the frame, so there is nothing to drag
      // along that axis and dividing by it would be dividing by nothing.
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        focusX: live.focusX,
        focusY: live.focusY,
        spanX: rect.width - picture.width,
        spanY: rect.height - picture.height,
      };
      setDragging({ focusX: live.focusX, focusY: live.focusY });
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    [framing, live.focusX, live.focusY, live.fit, onView, picture],
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (!start) return;
    // The picture moves by as many pixels as the pointer did, so the focus moves
    // by that distance as a share of the picture's travel. The span is negative
    // — the picture is wider than the frame — which is what makes dragging right
    // reveal what was to the left of it.
    const focusX = start.spanX === 0 ? start.focusX : start.focusX + ((event.clientX - start.x) / start.spanX) * 100;
    const focusY = start.spanY === 0 ? start.focusY : start.focusY + ((event.clientY - start.y) / start.spanY) * 100;
    setDragging({ focusX: round4(clamp(focusX, 0, 100)), focusY: round4(clamp(focusY, 0, 100)) });
  }, []);

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const landed = dragging;
      setDragging(null);
      if (landed && onView) onView({ ...view, ...landed });
    },
    [dragging, onView, view],
  );

  const applyZoom = useCallback(
    (next: number) => {
      if (!onView || !zoom) return;
      onView({ ...view, zoom: round4(clamp(next, zoom.min, zoom.max)) });
    },
    [onView, view, zoom],
  );

  const gestureAnchor = () => {
    const points = [...pointersRef.current.values()];
    if (points.length === 0) {
      gestureRef.current = null;
      return;
    }
    const first = points[0]!;
    const second = points[1];
    gestureRef.current = {
      view: mobileViewRef.current ?? mobileCurrent,
      x: second ? (first.x + second.x) / 2 : first.x,
      y: second ? (first.y + second.y) / 2 : first.y,
      distance: second ? Math.hypot(first.x - second.x, first.y - second.y) : 1,
    };
  };

  const mobilePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!mobile || event.pointerType !== "touch") return;
    if (event.isPrimary) {
      pointersRef.current.clear();
      suppressTouchClickRef.current = false;
    }
    if (!frameRef.current) return;
    if (event.target instanceof Element && event.target.closest(`.${ELEMENT_TAG}-doors, .${ELEMENT_TAG}-zoom`)) return;
    stageRef.current?.setAttribute("data-mobile-gesturing", "true");
    const rect = frameRef.current.getBoundingClientRect();
    pointersRef.current.set(event.pointerId, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    if (pointersRef.current.size > 1) suppressTouchClickRef.current = true;
    gestureAnchor();
  };

  const mobilePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!mobile || !pointersRef.current.has(event.pointerId) || !mobileImage || !frame || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    pointersRef.current.set(event.pointerId, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    const points = [...pointersRef.current.values()];
    const first = points[0]!;
    const second = points[1];
    const x = second ? (first.x + second.x) / 2 : first.x;
    const y = second ? (first.y + second.y) / 2 : first.y;
    const distance = second ? Math.hypot(first.x - second.x, first.y - second.y) : 1;
    const start = gestureRef.current;
    if (!start) return;
    const moved = mobileGestureMoved(start, { x, y, distance });
    if (!moved && !suppressTouchClickRef.current) return;
    if (!suppressTouchClickRef.current) onDismiss?.();
    suppressTouchClickRef.current = true;
    const next = mobileMapGesture(
      mobileImage,
      frame,
      start.view,
      { x: start.x, y: start.y },
      { x, y },
      second && start.distance > 0 ? distance / start.distance : 1,
    );
    mobileViewRef.current = next;
    setMobileView(next);
  };

  const mobilePointerEnd = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    if (!mobile || !pointersRef.current.has(event.pointerId)) return;
    const tapped = !cancelled && pointersRef.current.size === 1 && !suppressTouchClickRef.current;
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size === 0) stageRef.current?.removeAttribute("data-mobile-gesturing");
    gestureAnchor();
    if (!tapped || !(event.target instanceof Element)) return;
    const pinId = event.target.closest<HTMLButtonElement>(`.${ELEMENT_TAG}-pin`)?.dataset.pinId;
    const pin = pinId ? pins.find((candidate) => candidate.id === pinId) : null;
    if (pin?.onSelect) {
      suppressTouchClickRef.current = true;
      pin.onSelect();
      return;
    }
    if (!event.target.closest(`.${ELEMENT_TAG}-canvas`) || event.target.closest("button")) return;
    if (picking && placing && onPlace && picture) {
      const rect = frameRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left - picture.left) / picture.width;
      const y = (event.clientY - rect.top - picture.top) / picture.height;
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        suppressTouchClickRef.current = true;
        const photo = frameRef.current?.querySelector<HTMLElement>(`.${ELEMENT_TAG}-pin-photo`);
        const photoRect = photo?.getBoundingClientRect();
        onPlace(round4(x), round4(y), {
          width: picture.width,
          height: picture.height,
          photoWidth: photoRect?.width ?? 72,
          photoHeight: photoRect?.height ?? 72,
        });
      }
    } else if (onDismiss) {
      suppressTouchClickRef.current = true;
      onDismiss();
    }
  };

  return (
    <div
      ref={stageRef}
      className={`${ELEMENT_TAG}-stage${compact ? ` ${ELEMENT_TAG}-stage-compact` : ""}`}
      style={style}
      data-shaped={shape ? "true" : "false"}
      data-framing={framing && live.fit === "cover" ? "true" : "false"}
      data-mobile={mobile ? "true" : "false"}
      data-photo-pins={photoPins ? "true" : "false"}
      data-empty={src ? "false" : "true"}
      onPointerDownCapture={(event) => {
        if (mobile) {
          mobilePointerDown(event);
          return;
        }
        suppressTouchClickRef.current = false;
        touchStartRef.current = event.pointerType === "touch" ? { x: event.clientX, y: event.clientY } : null;
      }}
      onPointerMoveCapture={(event) => {
        if (mobile) {
          mobilePointerMove(event);
          return;
        }
        const start = touchStartRef.current;
        if (start && (Math.abs(event.clientX - start.x) > 8 || Math.abs(event.clientY - start.y) > 8)) {
          suppressTouchClickRef.current = true;
        }
      }}
      onPointerUpCapture={mobile ? mobilePointerEnd : undefined}
      onPointerCancelCapture={(event) => {
        if (mobile) mobilePointerEnd(event, true);
        if (touchStartRef.current) suppressTouchClickRef.current = true;
      }}
      onClickCapture={(event) => {
        if (!suppressTouchClickRef.current) return;
        suppressTouchClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {/* Before the picture, because every one of them is drawn on the picture
          and the frame is the box they are positioned against. Given to this
          component rather than left in the caller's markup so that the box they
          are measured from is this one and cannot drift. */}
      {children}
      <div
        ref={frameRef}
        className={`${ELEMENT_TAG}-canvas`}
        data-placing={picking && placing ? "true" : "false"}
        data-dragging={dragging ? "true" : "false"}
        onClick={picking && placing ? handleClick : onDismiss ? () => onDismiss() : undefined}
        onPointerDown={framing ? handlePointerDown : undefined}
        onPointerMove={framing ? handlePointerMove : undefined}
        onPointerUp={framing ? endDrag : undefined}
        onPointerCancel={framing ? endDrag : undefined}
      >
        {src ? (
          <img
            className={`${ELEMENT_TAG}-canvas-img`}
            style={
              mobile && picture
                ? {
                    position: "absolute",
                    left: picture.left,
                    top: picture.top,
                    width: picture.width,
                    height: picture.height,
                    objectFit: "fill",
                  }
                : pictureStyle(live)
            }
            src={src}
            alt={alt}
            draggable={false}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              if (naturalWidth <= 0 || naturalHeight <= 0) return;
              setDecoded({ src, width: naturalWidth, height: naturalHeight });
              measure();
            }}
            onError={() => setFailedSrc(src)}
          />
        ) : (
          <>
            {mobile && picture ? (
              <span
                className={`${ELEMENT_TAG}-mobile-logical`}
                style={{ left: picture.left, top: picture.top, width: picture.width, height: picture.height }}
                aria-hidden="true"
              />
            ) : null}
            <span className={`${ELEMENT_TAG}-canvas-empty`}>Logical village map</span>
          </>
        )}
        {src && failedSrc === src ? (
          <span className={`${ELEMENT_TAG}-canvas-missing`}>
            The map picture could not be loaded — pick another one from the Town map panel.
          </span>
        ) : null}
        {picture
          ? pins.map((pin) => (
              <span
                key={pin.id}
                className={`${ELEMENT_TAG}-pin-holder`}
                data-selected={pin.selected ? "true" : "false"}
                style={{
                  left: `${picture.left + pin.x * picture.width}px`,
                  // The step down is part of the fraction rather than a margin, so
                  // a pin hung under another one still hangs under it at any size.
                  top: `${picture.top + (pin.y + (mobile && pin.kind !== "person" ? 0 : (pin.dy ?? 0))) * picture.height}px`,
                }}
              >
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-pin`}
                  data-pin-id={pin.id}
                  data-tone={pin.tone}
                  data-kind={pin.kind ?? "place"}
                  data-selected={pin.selected ? "true" : "false"}
                  aria-expanded={pin.doors ? true : undefined}
                  disabled={pin.onSelect === undefined}
                  title={pin.text}
                  onClick={(event) => {
                    // Otherwise a click on a pin would also read as a click on the
                    // map underneath it while the wizard is placing homes.
                    event.stopPropagation();
                    pin.onSelect?.();
                  }}
                >
                  {(mobile || photoPins) && pin.kind !== "person" ? (
                    <span
                      className={`${ELEMENT_TAG}-pin-photo-card`}
                      style={{
                        transform: `scale(${focusedPhotoScale(
                          mobile ? mobilePhotoScale(mobileCurrent.zoom, mobileInitial.zoom) : DESKTOP_PHOTO_SCALE,
                          pin.selected === true,
                        )})`,
                      }}
                    >
                      <span className={`${ELEMENT_TAG}-pin-photo`} aria-hidden="true">
                        {pin.image ? (
                          <img src={pin.image} alt="" loading="lazy" draggable={false} />
                        ) : (
                          <span className={`${ELEMENT_TAG}-pin-photo-empty`} role="img" aria-label="House">
                            🏠
                          </span>
                        )}
                        <span className={`${ELEMENT_TAG}-pin-photo-tack`} />
                      </span>
                      <span className={`${ELEMENT_TAG}-pin-name`}>{pin.text}</span>
                    </span>
                  ) : (
                    <>
                      <span aria-hidden="true" className={`${ELEMENT_TAG}-pin-tack`}>
                        <svg viewBox="0 0 24 24" focusable="false">
                          {/* The head, the waist under it and the needle. */}
                          <path d="M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z" />
                          <path d="M9.4 7.4h5.2l-.7 3.2H10.1z" />
                          <path d="M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z" />
                        </svg>
                      </span>
                      <span className={`${ELEMENT_TAG}-pin-name`}>{pin.text}</span>
                    </>
                  )}
                </button>
                {pin.onRemove ? (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-pin-remove`}
                    aria-label={`Take ${pin.text} off the map`}
                    onClick={(event) => {
                      event.stopPropagation();
                      pin.onRemove?.();
                    }}
                  >
                    ×
                  </button>
                ) : null}
                {/*
                  The way back into a conversation the debug close stepped out
                  of. A second control beside the pin, taking clicks of its own
                  rather than sitting inside the pin's button — a button inside a
                  button is not a thing a browser will draw — and reaching
                  neither the map's placement handler nor the pin's own select,
                  which is what lets it be the one live control on a locked map.
                */}
                {pin.onResume ? (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-pin-resume`}
                    onClick={(event) => {
                      event.stopPropagation();
                      pin.onResume?.();
                    }}
                  >
                    DEBUG: Resume Chat
                  </button>
                ) : null}
              </span>
            ))
          : null}
      </div>

      {/*
        The doors of whichever pin the player has open, drawn against the same
        picture the pins are placed against.

        Against the picture rather than in the frame, and that is the whole point
        of these being here: the frame is where a pin is drawn and it is also what
        cuts anything that reaches past its edge, so a list hung under a pin near
        the bottom of the map would be half a list. The box is the caller's rather
        than the pin's, so the offsets are the same two numbers the pin above it is
        placed with and the two cannot drift apart.
      */}
      {picture
        ? pins
            .filter((pin) => pin.doors !== undefined && pin.doors.length > 0)
            .map((pin) => (
              <div
                key={`doors:${pin.id}`}
                className={`${ELEMENT_TAG}-doors`}
                style={{
                  left: `${frame ? mobileDoorPoint(picture, frame, pin).left : picture.left + pin.x * picture.width}px`,
                  top: `${frame ? mobileDoorPoint(picture, frame, pin).top : picture.top + (pin.y + (pin.dy ?? 0)) * picture.height}px`,
                }}
              >
                {pin.doors?.map((door) => (
                  <button
                    key={door.label}
                    type="button"
                    className={`${ELEMENT_TAG}-door`}
                    onClick={(event) => {
                      // The list hangs over the map rather than inside it, so it is
                      // not a press on the picture and must not read as one.
                      event.stopPropagation();
                      door.onSelect();
                    }}
                  >
                    {door.label}
                  </button>
                ))}
              </div>
            ))
        : null}

      {/* Outside the frame on purpose: a pointer down inside it starts a drag,
          and a control that started one would drag the map instead of working. */}
      {framing && zoom && live.fit === "cover" ? (
        <div className={`${ELEMENT_TAG}-zoom`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-zoom-button`}
            title="Show less of the picture, larger"
            aria-label="Zoom in"
            disabled={live.zoom >= zoom.max}
            onClick={() => applyZoom(live.zoom + zoom.step)}
          >
            +
          </button>
          <button
            type="button"
            className={`${ELEMENT_TAG}-zoom-button`}
            title="Show more of the picture, smaller"
            aria-label="Zoom out"
            disabled={live.zoom <= zoom.min}
            onClick={() => applyZoom(live.zoom - zoom.step)}
          >
            −
          </button>
          <button
            type="button"
            className={`${ELEMENT_TAG}-zoom-button`}
            title="Put the middle of the picture back in the middle of the frame"
            disabled={live.focusX === 50 && live.focusY === 50 && live.zoom === zoom.min}
            onClick={() => {
              if (onView) onView({ ...view, focusX: 50, focusY: 50, zoom: zoom.min });
            }}
          >
            Centre
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * What this village calls the player, for the two places that print it.
 *
 * The name is the Persona's, cached on the village the last time it wrote it out,
 * and there is no second candidate. This used to read `settings.playerName` — a
 * typed name the village kept beside the Persona — and when the Persona took that
 * question over the field stopped being sent while the reads stayed. Both of them
 * fell through to the fallback on every turn of every conversation, so the drawer
 * and the conversation record called the player "You" however carefully they had
 * said who they were.
 *
 * A Persona whose link is broken still answers with the copy the village kept of
 * it, exactly as the prompts do: the player loses the notice, not their name. "You"
 * is left for a village nobody has been described in, which is the same word the
 * prompts use for that case.
 *
 * It is handed the snapshot rather than its settings box on purpose: every field
 * this tab reads out of the village arrives as `snapshot.settings.<field>`, and a
 * reader that takes the box on its own is a reader the check in
 * `tests/villages-settings-drift.regression.ts` cannot see.
 */
function playerDisplayName(snapshot: VillageSnapshot | undefined): string {
  const playerPersonaName = snapshot?.settings.playerPersonaName;
  return typeof playerPersonaName === "string" ? playerPersonaName.trim() || "You" : "You";
}

/** Display data shared by identity choices, independent of their source. */
type IdentityChoice = { id: string; name: string; portrait?: Portrait; hint?: string };
type IdentityPreview = IdentityChoice & {
  overview: string;
  details: { label: string; text: string }[];
  context: string;
};

/** Shared visual selection pattern; callers supply their own identity and status data. */
function IdentityChoiceStrip({
  label,
  choices,
  selectedId,
  onSelect,
  disabled,
  emptyMessage,
}: {
  label: string;
  choices: IdentityChoice[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled: boolean;
  emptyMessage: string;
}) {
  return choices.length ? (
    <div className={`${ELEMENT_TAG}-identity-strip`} role="group" aria-label={label}>
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          className={`${ELEMENT_TAG}-identity-card`}
          aria-pressed={selectedId === choice.id}
          disabled={disabled}
          onClick={() => onSelect(choice.id)}
        >
          <AvatarFace
            portrait={choice.portrait}
            name={choice.name}
            className={`${ELEMENT_TAG}-identity-card-face`}
            glyph="person"
          />
          <strong>{choice.name}</strong>
          {choice.hint ? <small>{choice.hint}</small> : null}
        </button>
      ))}
    </div>
  ) : (
    <p className={`${ELEMENT_TAG}-hint`}>{emptyMessage}</p>
  );
}

function IdentityChoicePreview({ value }: { value: IdentityPreview }) {
  return (
    <section className={`${ELEMENT_TAG}-identity-preview`} aria-label={`${value.name} overview`}>
      <AvatarFace
        portrait={value.portrait}
        name={value.name}
        className={`${ELEMENT_TAG}-identity-preview-face`}
        glyph="person"
      />
      <div className={`${ELEMENT_TAG}-identity-preview-copy`}>
        <h3>{value.name}</h3>
        {value.overview ? <p className={`${ELEMENT_TAG}-identity-overview`}>{value.overview}</p> : null}
        {value.details.length ? (
          <dl className={`${ELEMENT_TAG}-identity-details`}>
            {value.details.map(({ label, text }) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p className={`${ELEMENT_TAG}-identity-context`}>{value.context}</p>
      </div>
    </section>
  );
}

/** Shorten authored text at a word boundary without rewriting the Persona. */
function identityExcerpt(value: string, limit: number): string {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= limit) return compact;
  const boundary = compact.lastIndexOf(" ", limit);
  const nextBoundary = compact.indexOf(" ", limit);
  return `${compact.slice(0, boundary > 0 ? boundary : nextBoundary > 0 ? nextBoundary : compact.length).trimEnd()}…`;
}

function personaPortrait(persona: { avatarPath: string | null; avatarCrop: unknown }): Portrait | undefined {
  return persona.avatarPath ? { url: persona.avatarPath, crop: readAvatarCrop(persona.avatarCrop) } : undefined;
}

function FoundingPersonaSelector({
  personas,
  draft,
  onDraft,
  disabled,
}: {
  personas: PersonaEntry[] | null;
  draft: string;
  onDraft: (personaId: string) => void;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<PersonaPreview | null>(null);
  const [previewProblem, setPreviewProblem] = useState("");
  const selected = personas?.find((entry) => entry.id === draft);
  const selectedId = selected?.id;
  const normalized = query.trim().toLocaleLowerCase();
  const choices = (personas ?? [])
    .filter((entry) => !normalized || `${entry.name} ${entry.summary}`.toLocaleLowerCase().includes(normalized))
    .sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }))
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      portrait: personaPortrait(entry),
      hint: entry.summary,
    }));

  useEffect(() => {
    setPreview(null);
    setPreviewProblem("");
    if (!draft || !selectedId) return;
    const controller = new AbortController();
    void request<{ persona: PersonaPreview }>(`/personas/${encodeURIComponent(draft)}`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!controller.signal.aborted) setPreview(response.persona);
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setPreviewProblem(messageFrom(cause, "This Persona could not be read."));
      });
    return () => controller.abort();
  }, [draft, selectedId]);

  const adapted: IdentityPreview | null =
    preview && preview.id === draft
      ? {
          id: preview.id,
          name: preview.name,
          portrait: personaPortrait(preview),
          overview: identityExcerpt(
            preview.description || preview.appearance || preview.personality || preview.backstory,
            180,
          ),
          details: (
            [
              ["Appearance", preview.appearance],
              ["Personality", preview.personality],
              ["Backstory", preview.backstory],
            ] as const
          )
            .filter(([, text]) => text.trim())
            .map(([label, text]) => ({ label, text: identityExcerpt(text, 120) })),
          context: "Villages uses this Persona's name and authored details as your identity in future interactions.",
        }
      : null;

  return (
    <div className={`${ELEMENT_TAG}-founding-persona`}>
      <div className={`${ELEMENT_TAG}-identity-picker-head`}>
        <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setup-persona-search`}>
          Who are you?
        </label>
        <input
          id={`${ELEMENT_TAG}-setup-persona-search`}
          className={`${ELEMENT_TAG}-search`}
          type="search"
          value={query}
          placeholder="Search Personas"
          onChange={(event) => setQuery(event.target.value)}
          disabled={disabled || personas === null}
        />
      </div>
      <IdentityChoiceStrip
        label="Choose a Persona"
        choices={choices}
        selectedId={draft}
        onSelect={onDraft}
        disabled={disabled}
        emptyMessage={
          personas === null
            ? "Reading Personas…"
            : personas.length === 0
              ? "Create a Persona in your library before founding a village."
              : "No Personas match your search."
        }
      />
      {draft && personas && !selected ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          The saved Persona is no longer in your library. Choose another Persona to continue.
        </p>
      ) : adapted ? (
        <IdentityChoicePreview value={adapted} />
      ) : previewProblem ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {previewProblem}
        </p>
      ) : selected ? (
        <p className={`${ELEMENT_TAG}-hint`}>Reading {selected.name}…</p>
      ) : (
        <p className={`${ELEMENT_TAG}-hint`}>Choose a Persona to see how Villages will know you.</p>
      )}
    </div>
  );
}

/** The compact Persona editor retained in village settings. */
function PlayerIdentityEditor({
  idPrefix,
  personas,
  draft,
  onDraft,
  storedId,
  storedName,
  storedMissing,
  disabled,
}: {
  idPrefix: string;
  personas: PersonaEntry[] | null;
  /** The Persona being chosen, saved or not. */
  draft: string;
  onDraft: (personaId: string) => void;
  /** The link as the village has it stored. */
  storedId: string;
  storedName: string;
  storedMissing: boolean;
  disabled: boolean;
}) {
  const chosen = (personas ?? []).find((entry) => entry.id === draft) ?? null;
  // The snapshot only describes what is stored, so it may answer for the draft
  // only while the two are the same Persona.
  const chosenName = chosen?.name ?? (draft === storedId ? storedName : "");
  const missing = storedMissing && draft === storedId;
  const linked = draft.length > 0;
  return (
    <>
      <div className={`${ELEMENT_TAG}-field`}>
        <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-${idPrefix}-persona`}>
          Who are you?
        </label>
        <select
          id={`${ELEMENT_TAG}-${idPrefix}-persona`}
          className={`${ELEMENT_TAG}-select`}
          value={draft}
          disabled={disabled || personas === null || personas.length === 0}
          onChange={(event) => onDraft(event.target.value)}
        >
          <option value="" disabled>
            {personas === null ? "Reading Personas…" : "Choose a Persona"}
          </option>
          {(personas ?? []).map((persona) => (
            <option key={persona.id} value={persona.id}>
              {persona.isActive ? `${persona.name} — your Persona` : persona.name}
            </option>
          ))}
        </select>
        <p className={`${ELEMENT_TAG}-macro-help`}>
          {personas === null
            ? "Reading your Personas…"
            : personas.length === 0
              ? "Create a Persona in your library before founding a village."
              : personas.some((persona) => persona.isActive)
                ? "Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you."
                : "The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."}
        </p>
      </div>

      {linked ? (
        <>
          <p className={`${ELEMENT_TAG}-empty`}>
            {missing
              ? "The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are."
              : chosenName.length > 0
                ? `The villagers know you as ${chosenName}.`
                : "The villagers know you as this Persona."}
          </p>
          {chosen && chosen.summary.length > 0 ? <p className={`${ELEMENT_TAG}-macro-help`}>{chosen.summary}</p> : null}
        </>
      ) : null}
    </>
  );
}

/**
 * The homes list, as an editor.
 *
 * Shared by the wizard and the Homes panel: the two ask exactly the same thing
 * of the player, so they ask it in the same words with the same controls, and
 * only the buttons underneath differ.
 *
 * The building is not a question. Every house is a `small home` because that is
 * the only building the village has, so the row states it rather than asking,
 * and the one thing the player actually decides — who lives here — is the only
 * thing the row lets them change.
 */
type VillageLorebookOption = { id: string; name: string; enabled: boolean; hiddenFromLibrary?: boolean };

function VillageLorebookPicker({
  books,
  error,
  selected,
  onChange,
  disabled,
}: {
  books: VillageLorebookOption[] | null;
  error: string;
  selected: string[];
  onChange(ids: string[]): void;
  disabled: boolean;
}) {
  const byId = new Map((books ?? []).map((book) => [book.id, book]));
  const visible = (books ?? []).filter((book) => !book.hiddenFromLibrary || selected.includes(book.id));
  const missing = selected.filter((id) => !byId.has(id));
  return (
    <fieldset className={`${ELEMENT_TAG}-field`}>
      <legend className={`${ELEMENT_TAG}-label`}>Lorebooks for this village</legend>
      <p className={`${ELEMENT_TAG}-hint`}>
        Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated
        scenery. Villages never edits them.
      </p>
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
      {books === null && !error ? <p className={`${ELEMENT_TAG}-hint`}>Loading lorebooks…</p> : null}
      {books === null && error && selected.length > 0 ? (
        <p className={`${ELEMENT_TAG}-hint`}>
          Selected books could not be checked. Lore generation will skip unavailable books.
        </p>
      ) : null}
      {books?.length === 0 ? <p className={`${ELEMENT_TAG}-hint`}>No lorebooks in the Engine library.</p> : null}
      {[...visible, ...missing.map((id) => ({ id, name: id, enabled: false }))].map((book) => {
        const checked = selected.includes(book.id);
        const status = missing.includes(book.id)
          ? books === null
            ? error
              ? "Unavailable — skipped"
              : "Checking status"
            : "Missing — skipped"
          : book.enabled
            ? ""
            : "Disabled — skipped";
        return (
          <label key={book.id} className={`${ELEMENT_TAG}-reason-option`}>
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled || (!book.enabled && !checked)}
              onChange={() => onChange(checked ? selected.filter((id) => id !== book.id) : [...selected, book.id])}
            />
            {book.name}
            {status ? ` (${status})` : ""}
          </label>
        );
      })}
    </fieldset>
  );
}

function HomeRows({
  homes,
  villagers,
  disabled,
  selectedId,
  onPatch,
  onRemove,
  onSelect,
  lockedIds,
  showDescriptions,
  onGenerateDescription,
}: {
  homes: HomeDraft[];
  /** Who may be given a house. Empty while the village is still being founded. */
  villagers: { id: string; name: string }[];
  disabled: boolean;
  selectedId: string | null;
  onPatch(id: string, patch: Partial<HomeDraft>): void;
  onRemove(id: string): void;
  onSelect(id: string): void;
  lockedIds?: ReadonlySet<string>;
  showDescriptions?: boolean;
  onGenerateDescription?(home: HomeDraft): void;
}) {
  // Everyone who already has a house on this map. A villager lives in one home
  // at a time, so the rows below offer the taken ones but refuse to take them,
  // which makes the mistake unpickable instead of merely rejected on save.
  const housed = new Set(homes.map((home) => home.characterId));
  return (
    <div className={`${ELEMENT_TAG}-home-list`}>
      {homes.map((home, index) => {
        const locked = lockedIds?.has(home.id) ?? false;
        const residentName = villagers.find((villager) => villager.id === home.characterId)?.name ?? "";
        return (
          <div
            key={home.id}
            className={`${ELEMENT_TAG}-home-row`}
            data-selected={home.id === selectedId ? "true" : "false"}
            onMouseEnter={() => onSelect(home.id)}
          >
            <span className={`${ELEMENT_TAG}-home-index`} aria-hidden="true">
              {index + 1}
            </span>
            {home.isPlayerHome ? (
              <span className={`${ELEMENT_TAG}-who`}>You live here</span>
            ) : (
              <>
                <span className={`${ELEMENT_TAG}-who`}>
                  {residentName ? `${residentName} lives here` : "No villager lives here"}
                </span>
                {villagers.length > 0 ? (
                  <select
                    className={`${ELEMENT_TAG}-select`}
                    value={home.characterId ?? ""}
                    disabled={disabled || locked}
                    aria-label={`Who lives in home ${index + 1}`}
                    onChange={(event) => onPatch(home.id, { characterId: event.target.value || null })}
                  >
                    <option value="">Nobody yet</option>
                    {villagers.map((villager) => {
                      const elsewhere = villager.id !== home.characterId && housed.has(villager.id);
                      return (
                        <option key={villager.id} value={villager.id} disabled={elsewhere}>
                          {elsewhere ? `${villager.name} — already housed` : villager.name}
                        </option>
                      );
                    })}
                  </select>
                ) : null}
              </>
            )}
            <label className={`${ELEMENT_TAG}-label`}>
              Venue name
              <input
                className={`${ELEMENT_TAG}-notice-input`}
                value={home.name}
                maxLength={60}
                disabled={disabled || locked}
                onChange={(event) => onPatch(home.id, { name: event.target.value })}
              />
            </label>
            <label className={`${ELEMENT_TAG}-label`}>
              Form · what is it?
              <input
                className={`${ELEMENT_TAG}-notice-input`}
                value={home.form}
                maxLength={240}
                disabled={disabled || locked}
                onChange={(event) => onPatch(home.id, { form: event.target.value })}
                placeholder="Cabin, truck, sleeping pod…"
              />
            </label>
            {showDescriptions ? (
              <div className={`${ELEMENT_TAG}-field`}>
                <textarea
                  className={`${ELEMENT_TAG}-textarea`}
                  value={home.description}
                  maxLength={1000}
                  disabled={disabled || locked}
                  aria-label={`Description of home ${index + 1}`}
                  onChange={(event) => onPatch(home.id, { description: event.target.value })}
                />
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={disabled || locked}
                  onClick={() => onGenerateDescription?.(home)}
                >
                  Generate description draft
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className={`${ELEMENT_TAG}-remove`}
              disabled={disabled || locked}
              aria-label={`Take home ${index + 1} off the map`}
              onClick={() => onRemove(home.id)}
            >
              ×
            </button>
            {locked ? (
              <span className={`${ELEMENT_TAG}-hint`}>Move approved and completed before changing this home.</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/**
 * One connection picker.
 *
 * `Engine default` is the first option and the empty string, which is what the
 * server stores to mean "let the Engine choose". It is deliberately not a
 * fabricated id: an agent that has never been set up has no connection to name,
 * and the Engine already knows what to do with that.
 *
 * A choice whose connection has since been deleted still has to be drawn. A
 * `<select>` whose value matches no option silently shows its first one, so the
 * player would be told they had chosen the Engine default when what is stored
 * is the id of something that is gone. The missing id is added as an option
 * instead, so the box says what is actually saved and the next save can clear
 * it.
 */
function ConnectionPicker({
  id,
  label,
  hint,
  options,
  value,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  options: readonly VillageConnectionOption[];
  value: string;
  disabled: boolean;
  onChange: (next: string) => void;
}) {
  const gone = value.length > 0 && !options.some((option) => option.id === value);
  return (
    <div className={`${ELEMENT_TAG}-field`}>
      <label className={`${ELEMENT_TAG}-label`} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={`${ELEMENT_TAG}-select`}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Engine default</option>
        {gone ? <option value={value}>Missing — this connection is gone</option> : null}
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <span className={`${ELEMENT_TAG}-hint`}>{hint}</span>
    </div>
  );
}

/**
 * Which connection the village sends which kind of work to.
 *
 * Three pickers rather than one, because the work is not worth the same money.
 * The heavy lifting is one long call about the whole village; the conversations
 * are short and frequent; pictures are drawn only ever because somebody pressed
 * a button. A player on one good model and one cheap one should be able to say
 * so.
 *
 * Read and written through routes of its own rather than the settings patch.
 * These choices belong to the AGENT and not to the village, and emptying the
 * village would otherwise take them with it — which is exactly the setting
 * nobody wants to enter twice.
 */
function AgentConnections({
  onSetupProblem,
  onImageWarningChange,
  compact = false,
}: {
  onSetupProblem?: (problem: string) => void;
  onImageWarningChange?: (needed: boolean) => void;
  compact?: boolean;
}) {
  const [settings, setSettings] = useState<VillageConnectionSettings | null>(null);
  const [options, setOptions] = useState<VillageConnectionOption[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /**
   * Read once, when the panel is first drawn.
   *
   * Two servers, one screen, and they have to agree before anything is drawn:
   * the Engine knows which connections exist, the village knows which were
   * chosen. A picker built from one of them alone would either offer nothing or
   * offer something the save cannot honour, so a failure in either is reported
   * as the panel failing rather than half-drawn.
   */
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [chosen, rows] = await Promise.all([
          request<VillageConnectionSettings>("/connections"),
          requestHost<EngineConnectionRow[]>("/api/connections"),
        ]);
        if (cancelled) return;
        setSettings(chosen);
        setOptions(connectionOptionsFrom(Array.isArray(rows) ? rows : []));
      } catch (cause) {
        if (!cancelled) setError(messageFrom(cause, "This agent's connections could not be read."));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Save the moment a picker moves, the same way the automatic-update switches
   * do. The reply is what was actually stored rather than what was sent, so
   * every box is redrawn from the server's own answer — a picker that showed a
   * choice the server refused would be worse than one that showed nothing.
   */
  const choose = useCallback(
    async (patch: { systemConnectionId?: string; narrationConnectionId?: string; imageConnectionId?: string }) => {
      setBusy(true);
      setError("");
      try {
        setSettings(
          await request<VillageConnectionSettings>("/connections", { method: "PUT", body: JSON.stringify(patch) }),
        );
      } catch (cause) {
        setError(messageFrom(cause, "That connection could not be saved."));
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const talk = options.filter((option) => option.category === "language");
  const pictures = options.filter((option) => option.category === "image_generation");
  const hasEngineImageDefault = pictures.some((option) => option.defaultForAgents);
  const imageNeedsWarning =
    settings !== null &&
    (settings.imageConnectionId === VILLAGES_IMAGE_CONNECTION_DISABLED ||
      pictures.length === 0 ||
      (settings.imageConnectionId.length === 0 && !hasEngineImageDefault));

  useEffect(() => {
    if (!onSetupProblem) return;
    const systemId = settings?.systemConnectionId ?? "";
    const narrationId = settings?.narrationConnectionId ?? "";
    if (!settings) {
      onSetupProblem("Connections are still loading.");
    } else if (systemId.length === 0 || narrationId.length === 0) {
      onSetupProblem("Choose both System and Narration connections before continuing.");
    } else if (!talk.some((option) => option.id === systemId) || !talk.some((option) => option.id === narrationId)) {
      onSetupProblem("Choose available language connections for System and Narration.");
    } else {
      onSetupProblem("");
    }
  }, [onSetupProblem, settings, talk]);

  useEffect(() => {
    onImageWarningChange?.(imageNeedsWarning);
  }, [imageNeedsWarning, onImageWarningChange]);

  return (
    <div className={`${ELEMENT_TAG}-field ${compact ? `${ELEMENT_TAG}-connections-compact` : ""}`}>
      <span className={`${ELEMENT_TAG}-label`}>Connections</span>
      {compact ? (
        <p className={`${ELEMENT_TAG}-hint`}>Choose models for village planning, conversations, and artwork.</p>
      ) : (
        <p className={`${ELEMENT_TAG}-empty`}>
          The village spends model calls on three kinds of work, and they are not worth the same money. The heavy
          lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn
          only when you ask for one. Leave any of these alone and the agent&apos;s own choice is used.
        </p>
      )}
      {settings ? (
        <div className={compact ? `${ELEMENT_TAG}-connections-grid` : ""}>
          <ConnectionPicker
            id={`${ELEMENT_TAG}-connection-system`}
            label="System"
            hint={
              compact
                ? "Founding, daily planning, and recaps."
                : "Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away."
            }
            options={talk}
            value={settings.systemConnectionId}
            disabled={busy}
            onChange={(next) => void choose({ systemConnectionId: next })}
          />
          <ConnectionPicker
            id={`${ELEMENT_TAG}-connection-narration`}
            label="Narration"
            hint={
              compact
                ? "Villagers' speech and conversation recaps."
                : "Everything the villagers say to you, and how the conversation reads back afterwards."
            }
            options={talk}
            value={settings.narrationConnectionId}
            disabled={busy}
            onChange={(next) => void choose({ narrationConnectionId: next })}
          />
          <div className={`${ELEMENT_TAG}-field`}>
            <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-connection-image`}>
              Images
            </label>
            <select
              id={`${ELEMENT_TAG}-connection-image`}
              className={`${ELEMENT_TAG}-select`}
              value={settings.imageConnectionId}
              disabled={busy}
              onChange={(event) => void choose({ imageConnectionId: event.target.value })}
            >
              <option value={VILLAGES_IMAGE_CONNECTION_DISABLED}>Disabled</option>
              <option value="">Use Engine default</option>
              {settings.imageConnectionId.length > 0 &&
              settings.imageConnectionId !== VILLAGES_IMAGE_CONNECTION_DISABLED &&
              !pictures.some((option) => option.id === settings.imageConnectionId) ? (
                <option value={settings.imageConnectionId}>Missing — this connection is gone</option>
              ) : null}
              {pictures.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <span className={`${ELEMENT_TAG}-hint`}>
              {compact ? (
                "Maps, sprites, and places. Recommended."
              ) : (
                <>
                  This is the connection that Villages uses to generate images such as character sprites, the Village
                  map, Venue backgrounds, etc.{" "}
                  <span className={`${ELEMENT_TAG}-image-recommendation`}>
                    The intended experience includes an image generation connection to bring the world and characters to
                    life, and is <em>highly</em> recommended.
                  </span>
                </>
              )}
            </span>
          </div>
        </div>
      ) : error.length === 0 ? (
        <span className={`${ELEMENT_TAG}-hint`}>Reading this agent&apos;s connections…</span>
      ) : null}
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Per-village writing controls. Each save returns the server's effective settings. */
function useVillageWriting() {
  const [view, setView] = useState<VillageWritingView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void request<VillageWritingView>("/narration")
      .then((next) => {
        if (!cancelled) setView(next);
      })
      .catch((cause) => {
        if (!cancelled) setError(messageFrom(cause, "Village writing settings could not be read."));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(
    async (patch: {
      tense?: VillageWritingView["tense"];
      person?: VillageWritingView["person"];
      rating?: VillageWritingView["rating"];
      styleInstructions?: string;
      replyGuidance?: string | null;
    }): Promise<VillageWritingView | null> => {
      setBusy(true);
      setSaved(false);
      setError("");
      try {
        const next = await request<VillageWritingView>("/narration", { method: "PUT", body: JSON.stringify(patch) });
        setView(next);
        setSaved(true);
        return next;
      } catch (cause) {
        setError(messageFrom(cause, "That writing change could not be saved."));
        return null;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return { view, error, busy, saved, save };
}

function VillageNarrationStyleSettings() {
  const { view, error, busy, saved, save } = useVillageWriting();
  const [styleDraft, setStyleDraft] = useState<string | null>(null);
  const draft = styleDraft ?? view?.styleInstructions ?? "";

  return (
    <div className={ELEMENT_TAG + "-field"}>
      <span className={ELEMENT_TAG + "-label"}>Narration style</span>
      <p className={ELEMENT_TAG + "-empty"}>
        Shape scene descriptions and the descriptive beats around replies. Each resident&apos;s card still governs their
        spoken voice. Saved changes apply to the next generated venue turn.
      </p>
      {view ? (
        <>
          <textarea
            className={ELEMENT_TAG + "-textarea"}
            aria-label="Narration style"
            value={draft}
            rows={3}
            maxLength={view.styleMaxLength}
            disabled={busy}
            onChange={(event) => setStyleDraft(event.target.value)}
          />
          <button
            type="button"
            className={ELEMENT_TAG + "-button"}
            disabled={busy || draft === view.styleInstructions}
            onClick={() => {
              void save({ styleInstructions: draft }).then((next) => {
                if (next) setStyleDraft(next.styleInstructions);
              });
            }}
          >
            Apply style
          </button>
          <button
            type="button"
            className={ELEMENT_TAG + "-button"}
            disabled={busy || draft === view.defaultStyleInstructions}
            onClick={() => {
              void save({ styleInstructions: "" }).then((next) => {
                if (next) setStyleDraft(next.styleInstructions);
              });
            }}
          >
            Restore default style
          </button>
          <div className={ELEMENT_TAG + "-row"}>
            <label className={ELEMENT_TAG + "-field"}>
              <span className={ELEMENT_TAG + "-label"}>Tense</span>
              <select
                value={view.tense}
                disabled={busy}
                onChange={(event) => void save({ tense: event.target.value as VillageWritingView["tense"] })}
              >
                <option value="present">Present</option>
                <option value="past">Past</option>
              </select>
            </label>
            <label className={ELEMENT_TAG + "-field"}>
              <span className={ELEMENT_TAG + "-label"}>Person</span>
              <select
                value={view.person}
                disabled={busy}
                onChange={(event) => void save({ person: event.target.value as VillageWritingView["person"] })}
              >
                <option value="first">First person (I)</option>
                <option value="second">Second person (you)</option>
                <option value="third">Third person (player name)</option>
              </select>
            </label>
            <label className={ELEMENT_TAG + "-field"}>
              <span className={ELEMENT_TAG + "-label"}>Content rating</span>
              <select
                value={view.rating}
                disabled={busy}
                onChange={(event) => void save({ rating: event.target.value as VillageWritingView["rating"] })}
              >
                <option value="sfw">SFW</option>
                <option value="nsfw">NSFW</option>
              </select>
            </label>
          </div>
          <span className={ELEMENT_TAG + "-hint"}>
            Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it.
          </span>
        </>
      ) : !error ? (
        <span className={ELEMENT_TAG + "-hint"}>Reading narration style…</span>
      ) : null}
      {busy ? <span className={ELEMENT_TAG + "-hint"}>Saving…</span> : null}
      {saved && !busy ? (
        <span className={ELEMENT_TAG + "-hint"} role="status">
          Saved for the next venue turn.
        </span>
      ) : null}
      {error ? (
        <p className={ELEMENT_TAG + "-error"} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function VillagerReplyGuidanceDebug() {
  const { view, error, busy, saved, save } = useVillageWriting();
  const [draft, setDraft] = useState<string | null>(null);
  const guidance = draft ?? view?.replyGuidance ?? "";

  return (
    <section className={ELEMENT_TAG + "-panel"}>
      <h2 className={ELEMENT_TAG + "-panel-title"}>DEBUG: Villager reply guidance</h2>
      <p className={ELEMENT_TAG + "-empty"}>
        This prompt guides each resident&apos;s voice, knowledge, and motivation. Saved edits apply to the next
        generated venue turn.
      </p>
      {view ? (
        <>
          <textarea
            className={ELEMENT_TAG + "-textarea"}
            aria-label="Villager reply guidance"
            value={guidance}
            rows={12}
            maxLength={view.replyGuidanceMaxLength}
            disabled={busy}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className={ELEMENT_TAG + "-row"}>
            <button
              type="button"
              className={ELEMENT_TAG + "-button"}
              disabled={busy || guidance === view.replyGuidance}
              onClick={() => {
                void save({ replyGuidance: guidance }).then((next) => {
                  if (next) setDraft(next.replyGuidance);
                });
              }}
            >
              Apply guidance
            </button>
            <button
              type="button"
              className={ELEMENT_TAG + "-button"}
              disabled={busy || guidance === view.defaultReplyGuidance}
              onClick={() => {
                void save({ replyGuidance: null }).then((next) => {
                  if (next) setDraft(next.replyGuidance);
                });
              }}
            >
              Restore built-in guidance
            </button>
          </div>
          <details>
            <summary>Show built-in guidance</summary>
            <pre className={ELEMENT_TAG + "-hint"} style={{ whiteSpace: "pre-wrap" }}>
              {view.defaultReplyGuidance}
            </pre>
          </details>
        </>
      ) : !error ? (
        <span className={ELEMENT_TAG + "-hint"}>Reading villager reply guidance…</span>
      ) : null}
      {busy ? <span className={ELEMENT_TAG + "-hint"}>Saving…</span> : null}
      {saved && !busy ? (
        <span className={ELEMENT_TAG + "-hint"} role="status">
          Saved for the next venue turn.
        </span>
      ) : null}
      {error ? (
        <p className={ELEMENT_TAG + "-error"} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}

/**
 * A face, in one of the frames this tab draws faces in.
 *
 * The circle is the frame and the picture gives up its own shape to it — and now
 * gives up the part of itself the card was told to show, which is the one thing a
 * stored avatar is for. `overflow: hidden` on the frame plus the crop's own
 * styles is the whole of it: a crop is drawn by enlarging the picture inside the
 * box and pushing the rest of it out, so a frame that did not clip would be a
 * frame with the whole photograph still around it.
 *
 * A villager the Engine has no picture for wears their initial, which is not a
 * placeholder for a missing picture: it is what is drawn when there is no
 * picture, and it is the same frame either way.
 *
 * The player is the one face in this drawer that is nobody in the library, which
 * is what `glyph` is for. See it for why their missing picture is not an initial.
 */
function AvatarFace({
  portrait,
  name,
  className,
  glyph = "initial",
}: {
  portrait: Portrait | undefined;
  name: string;
  /** The frame this face is drawn in: the list's circle, or the drawer's own box. */
  className: string;
  /**
   * What to draw when there is no picture to draw.
   *
   * `initial` is the villager's, whose name the player has just read off the map
   * and whose missing portrait the village says nothing more about. `person` is
   * the player's: they are the Persona they are being, the village may have been
   * told nothing about their face at all, and their name here can be several
   * words long — an initial off the front of it would be a letter from a name
   * nobody chose to be called by. So the Engine's own person mark is drawn
   * instead, which is the same glyph the Engine puts on the player's own turns in
   * its chats, and is the truer answer to which of the two is speaking.
   */
  glyph?: "initial" | "person";
}) {
  return (
    <span aria-hidden="true" className={className}>
      {portrait ? (
        <img src={portrait.url} alt="" style={avatarCropStyle(portrait.crop)} />
      ) : glyph === "person" ? (
        <svg className={`${ELEMENT_TAG}-person`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="7"
            r="4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

function VillagerTile({
  villager,
  portrait,
  selected,
  onSelect,
}: {
  villager: VillageVillagerView;
  /** Their picture and the card's framing of it, or nothing when there is none to draw. */
  portrait: Portrait | undefined;
  selected: boolean;
  /**
   * Talking, which happens on the map. Left out while a conversation is in hand
   * — see `chatLocked` — and the name is then drawn as the label it has become,
   * the same way a pin with no `onSelect` is drawn as a label rather than a
   * button.
   */
  onSelect?: () => void;
}) {
  return (
    <div className={`${ELEMENT_TAG}-tile`} data-selected={selected ? "true" : "false"}>
      <div className={`${ELEMENT_TAG}-tile-head`}>
        <AvatarFace portrait={portrait} name={villager.name} className={`${ELEMENT_TAG}-avatar`} />
        <button
          type="button"
          className={`${ELEMENT_TAG}-tile-name`}
          onClick={onSelect}
          disabled={onSelect === undefined}
          title={onSelect ? `See where ${villager.name} is` : `${villager.name} has no known venue`}
        >
          {villager.name}
        </button>
      </div>
      {villager.summary ? <p className={`${ELEMENT_TAG}-tile-summary`}>{villager.summary}</p> : null}
      <div className={`${ELEMENT_TAG}-tile-meta`}>
        {villager.missing ? <span className={`${ELEMENT_TAG}-badge`}>card missing</span> : null}
        {villager.tags.slice(0, 3).map((tag) => (
          <span key={tag} className={`${ELEMENT_TAG}-tag`}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function saveSpriteDownload(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

/** Assemble a predictable sheet from approved cells; the model never has to draw a precise grid. */
async function downloadResidentSpriteSheet(villager: VillageVillagerView): Promise<void> {
  const sprites = villager.sprite?.images ?? [];
  if (!sprites.length) return;
  const ordered = [...sprites].sort((a, b) => {
    const rank = (label: string) => {
      const index = STARTER_SPRITE_EXPRESSIONS.indexOf(label as (typeof STARTER_SPRITE_EXPRESSIONS)[number]);
      return index < 0 ? STARTER_SPRITE_EXPRESSIONS.length : index;
    };
    return rank(a.label) - rank(b.label) || a.label.localeCompare(b.label) || a.view.localeCompare(b.view);
  });
  const cellWidth = 512;
  const cellHeight = 768;
  const columns = 2;
  const canvas = document.createElement("canvas");
  canvas.width = columns * cellWidth;
  canvas.height = Math.ceil(ordered.length / columns) * cellHeight;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("The browser cannot assemble this sprite sheet.");
  const cells: Array<{
    view: "front" | "side";
    expression: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }> = [];
  for (let index = 0; index < ordered.length; index += 1) {
    const sprite = ordered[index]!;
    const image = new Image();
    image.src = sprite.url;
    await image.decode();
    const x = (index % columns) * cellWidth;
    const y = Math.floor(index / columns) * cellHeight;
    const scale = Math.min(cellWidth / image.naturalWidth, cellHeight / image.naturalHeight);
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);
    context.drawImage(image, x + Math.floor((cellWidth - width) / 2), y + cellHeight - height, width, height);
    cells.push({ view: sprite.view, expression: sprite.label, x, y, width: cellWidth, height: cellHeight });
  }
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("The browser could not export this sheet."))),
      "image/png",
    ),
  );
  const stem =
    villager.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "resident";
  saveSpriteDownload(`${stem}-sprites.png`, blob);
  saveSpriteDownload(
    `${stem}-sprites.json`,
    new Blob([JSON.stringify({ width: canvas.width, height: canvas.height, cells }, null, 2)], {
      type: "application/json",
    }),
  );
}

function ResidentSpriteEditor({
  villager,
  onSaved,
}: {
  villager: VillageVillagerView;
  onSaved: (snapshot: VillageSnapshot) => void;
}) {
  const base = `/villagers/${encodeURIComponent(villager.characterId)}/sprites`;
  const [view, setView] = useState<"front" | "side">("front");
  const [expression, setExpression] = useState("neutral");
  const [custom, setCustom] = useState("");
  const [appearance, setAppearance] = useState("");
  const [useReference, setUseReference] = useState(true);
  const [candidate, setCandidate] = useState<{ view: "front" | "side"; label: string; image: string } | null>(null);
  const [source, setSource] = useState<Array<{ expression: string; url: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);
  const allApproved = villager.sprite?.images ?? [];
  const approved = allApproved.filter((item) => item.view === view);
  const hasFrontNeutral = allApproved.some((item) => item.view === "front" && item.label === "neutral");
  const hasNeutral = approved.some((item) => item.label === "neutral");
  const selectedExpression = expression === "custom" ? custom.trim().toLowerCase().replace(/\s+/g, "_") : expression;
  const selectedApproved = approved.find((item) => item.label === selectedExpression);
  const expressionChoices = [
    ...STARTER_SPRITE_EXPRESSIONS,
    ...allApproved
      .map((item) => item.label)
      .filter((label) => !STARTER_SPRITE_EXPRESSIONS.includes(label as (typeof STARTER_SPRITE_EXPRESSIONS)[number])),
  ].filter((label, index, all) => all.indexOf(label) === index);

  useEffect(() => {
    setCandidate(null);
    setView("front");
    setExpression("neutral");
    setError("");
    request<{ sprites: Array<{ expression: string; url: string }> }>(`${base}/source`)
      .then((result) => setSource(result.sprites))
      .catch(() => setSource([]));
  }, [base]);

  async function perform(action: () => Promise<void>) {
    setBusy(true);
    setError("");
    setNote("");
    try {
      await action();
    } catch (cause) {
      setError(messageFrom(cause, "The sprite could not be prepared."));
    } finally {
      setBusy(false);
    }
  }

  function validExpression(): string {
    if (!/^[a-z0-9_-]{1,40}$/.test(selectedExpression))
      throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");
    if (view === "side" && !hasFrontNeutral) throw new Error("Approve the front neutral sprite first.");
    if (selectedExpression !== "neutral" && !hasNeutral) throw new Error(`Approve the ${view} neutral sprite first.`);
    return selectedExpression;
  }

  return (
    <section className={`${ELEMENT_TAG}-sprite-editor`} aria-label={`${villager.name} sprite studio`}>
      <div className={`${ELEMENT_TAG}-sprite-heading`}>
        <div>
          <h3>{villager.name}&apos;s sprite studio</h3>
          <p>Build a front view for player conversations and one side profile for villager-to-villager moments.</p>
        </div>
        <span className={`${ELEMENT_TAG}-sprite-count`}>{allApproved.length} approved</span>
      </div>
      <div className={`${ELEMENT_TAG}-sprite-views`} aria-label="Sprite view">
        {(["front", "side"] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`${ELEMENT_TAG}-sprite-view`}
            aria-pressed={view === item}
            data-active={view === item ? "true" : "false"}
            disabled={busy}
            onClick={() => {
              setView(item);
              setExpression("neutral");
              setCandidate(null);
            }}
          >
            <strong>{item === "front" ? "Facing you" : "Facing villagers"}</strong>
            <span>
              {allApproved.filter((cell) => cell.view === item).length} approved ·{" "}
              {item === "front" ? "front" : "side, mirrored left or right"}
            </span>
          </button>
        ))}
      </div>
      <div className={`${ELEMENT_TAG}-sprite-section-head`}>
        <strong>Choose an expression</strong>
        <span>Only approved images appear in scenes.</span>
      </div>
      <div className={`${ELEMENT_TAG}-sprite-choices`}>
        {expressionChoices.map((item) => {
          const image = approved.find((cell) => cell.label === item);
          return (
            <button
              key={item}
              type="button"
              className={`${ELEMENT_TAG}-sprite-choice`}
              data-active={expression === item ? "true" : "false"}
              aria-pressed={expression === item}
              disabled={busy}
              onClick={() => {
                setExpression(item);
                setCandidate(null);
              }}
            >
              <span className={`${ELEMENT_TAG}-sprite-choice-art`}>
                {image ? <img src={image.url} alt="" /> : <span aria-hidden="true">＋</span>}
              </span>
              <span>{item}</span>
              <small>{image ? "Approved" : "Open"}</small>
            </button>
          );
        })}
        <button
          type="button"
          className={`${ELEMENT_TAG}-sprite-choice`}
          data-active={expression === "custom" ? "true" : "false"}
          aria-pressed={expression === "custom"}
          disabled={busy}
          onClick={() => {
            setExpression("custom");
            setCandidate(null);
          }}
        >
          <span className={`${ELEMENT_TAG}-sprite-choice-art`} aria-hidden="true">
            ✦
          </span>
          <span>Custom</span>
          <small>Name your own</small>
        </button>
      </div>
      {expression === "custom" ? (
        <label>
          Custom expression name
          <input
            value={custom}
            maxLength={40}
            disabled={busy}
            onChange={(event) => {
              setCustom(event.target.value);
              setCandidate(null);
            }}
          />
        </label>
      ) : null}
      <div className={`${ELEMENT_TAG}-sprite-selected`}>
        <strong>
          {view === "front" ? "Front" : "Side"} · {selectedExpression || "custom"}
        </strong>
        <span>
          {selectedApproved
            ? "Approved art is ready. You can replace it after reviewing a new candidate."
            : "No approved art yet."}
        </span>
      </div>
      {view === "side" && !hasFrontNeutral ? (
        <p className={`${ELEMENT_TAG}-hint`}>
          Start with an approved front neutral sprite to keep the side profile recognizable.
        </p>
      ) : null}
      {selectedExpression !== "neutral" && !hasNeutral ? (
        <p className={`${ELEMENT_TAG}-hint`}>Approve this view&apos;s neutral sprite before adding expressions.</p>
      ) : null}
      <label>
        Appearance details for generation
        <textarea
          value={appearance}
          maxLength={2000}
          disabled={busy}
          onChange={(event) => setAppearance(event.target.value)}
          placeholder="Use the resident’s saved appearance, or describe it here"
        />
      </label>
      <label className={`${ELEMENT_TAG}-row`}>
        <input
          type="checkbox"
          checked={useReference}
          disabled={busy}
          onChange={(event) => setUseReference(event.target.checked)}
        />{" "}
        Use an approved neutral or available portrait as the identity reference
      </label>
      <p className={`${ELEMENT_TAG}-hint`}>
        Turn references off for a connection that cannot accept images. Review identity carefully before approval.
      </p>
      <div className={`${ELEMENT_TAG}-sprite-actions`}>
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          disabled={busy || (view === "side" && !hasFrontNeutral) || (selectedExpression !== "neutral" && !hasNeutral)}
          onClick={() =>
            void perform(async () => {
              const label = validExpression();
              const result = await request<{ image: string; width: number; height: number }>(`${base}/generate`, {
                method: "POST",
                body: JSON.stringify({ view, expression: label, appearance, useReference }),
              });
              setCandidate({ view, label, image: result.image });
              setNote(`Candidate: ${result.width} × ${result.height}. Review before approving.`);
            })
          }
        >
          {busy ? "Working…" : `Generate ${view} ${selectedExpression || "sprite"} · 1 image request`}
        </button>
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          disabled={busy || (view === "side" && !hasFrontNeutral) || (selectedExpression !== "neutral" && !hasNeutral)}
          onClick={() => uploadRef.current?.click()}
        >
          Upload candidate
        </button>
        <input
          ref={uploadRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          hidden
          onChange={(event) =>
            void perform(async () => {
              const label = validExpression();
              const file = event.target.files?.[0];
              if (file) setCandidate({ view, label, image: await readFileAsDataUrl(file) });
              event.target.value = "";
            })
          }
        />
      </div>
      <p className={`${ELEMENT_TAG}-hint`}>
        One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails,
        its configured fallback may make another provider attempt.
      </p>
      {candidate ? (
        <div className={`${ELEMENT_TAG}-sprite-candidate`}>
          <div className={`${ELEMENT_TAG}-sprite-section-head`}>
            <strong>Review candidate</strong>
            <span>
              {candidate.view} · {candidate.label}
            </span>
          </div>
          <div className={`${ELEMENT_TAG}-sprite-candidate-views`}>
            <div>
              <img src={candidate.image} alt={`${candidate.view} ${candidate.label} candidate for ${villager.name}`} />
              <span>{candidate.view === "side" ? "Facing right" : "Facing you"}</span>
            </div>
            {candidate.view === "side" ? (
              <div>
                <img className={`${ELEMENT_TAG}-sprite-mirrored`} src={candidate.image} alt="" />
                <span>Mirrored left · no extra image</span>
              </div>
            ) : null}
          </div>
          <div className={`${ELEMENT_TAG}-row`}>
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              disabled={busy}
              onClick={() =>
                void perform(async () => {
                  const next = await request<VillageSnapshot>(`${base}/approve`, {
                    method: "POST",
                    body: JSON.stringify({ view: candidate.view, expression: candidate.label, image: candidate.image }),
                  });
                  onSaved(next);
                  setCandidate(null);
                  setNote(`${candidate.view} ${candidate.label} approved.`);
                })
              }
            >
              Approve this sprite
            </button>
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              disabled={busy}
              onClick={() => setCandidate(null)}
            >
              Discard candidate
            </button>
          </div>
        </div>
      ) : null}
      {source.length && view === "front" ? (
        <details className={`${ELEMENT_TAG}-sprite-more`}>
          <summary>Copy an existing Engine full-body sprite</summary>
          <div className={`${ELEMENT_TAG}-row`}>
            {source.map((item) => (
              <button
                key={item.expression}
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={busy || (item.expression !== "neutral" && !hasNeutral)}
                onClick={() =>
                  void perform(async () => {
                    const next = await request<VillageSnapshot>(`${base}/import`, {
                      method: "POST",
                      body: JSON.stringify({ view, expression: item.expression }),
                    });
                    onSaved(next);
                    setNote(`${item.expression} copied to this Village.`);
                  })
                }
              >
                {item.expression}
              </button>
            ))}
          </div>
        </details>
      ) : null}
      {allApproved.length ? (
        <>
          <details className={`${ELEMENT_TAG}-sprite-more`}>
            <summary>Display framing and export</summary>
            <div className={`${ELEMENT_TAG}-row`}>
              <label>
                Display framing{" "}
                <select
                  value={villager.sprite?.framing.mode ?? "full"}
                  disabled={busy}
                  onChange={(event) =>
                    void perform(async () =>
                      onSaved(
                        await request<VillageSnapshot>(`${base}/framing`, {
                          method: "PATCH",
                          body: JSON.stringify({
                            mode: event.target.value,
                            cropPercent: villager.sprite?.framing.cropPercent ?? 58,
                          }),
                        }),
                      ),
                    )
                  }
                >
                  <option value="full">Full body</option>
                  <option value="half">Waist up</option>
                </select>
              </label>
              {villager.sprite?.framing.mode === "half" ? (
                <label>
                  Visible height: {villager.sprite.framing.cropPercent}%{" "}
                  <input
                    type="range"
                    min={40}
                    max={85}
                    value={villager.sprite.framing.cropPercent}
                    disabled={busy}
                    onChange={(event) =>
                      void perform(async () =>
                        onSaved(
                          await request<VillageSnapshot>(`${base}/framing`, {
                            method: "PATCH",
                            body: JSON.stringify({ mode: "half", cropPercent: Number(event.target.value) }),
                          }),
                        ),
                      )
                    }
                  />
                </label>
              ) : null}
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={busy}
                onClick={() => void perform(() => downloadResidentSpriteSheet(villager))}
              >
                Download both views and manifest
              </button>
            </div>
          </details>
        </>
      ) : null}
      {note ? <p role="status">{note}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
    </section>
  );
}

/** One paragraph in a venue visit, with its speaker and attached asides. */
type RoomStep = {
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

function MailboxImprovementEditor({
  entry,
  onDecide,
}: {
  entry: VillageSnapshot["venueMail"][number];
  onDecide: (
    approved: boolean,
    value: { title: string; description: string; extraBeds: number; slot: number },
  ) => Promise<void>;
}) {
  const [title, setTitle] = useState(entry.improvement?.title ?? "");
  const [description, setDescription] = useState(entry.improvement?.description ?? "");
  const [extraBeds, setExtraBeds] = useState(entry.improvement?.extraBeds ?? 0);
  const [slot, setSlot] = useState(entry.improvementSlot ?? 0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const decide = (approved: boolean) => {
    setBusy(true);
    setError("");
    void onDecide(approved, { title, description, extraBeds, slot })
      .catch((cause) => setError(messageFrom(cause, "That Venue request could not be decided.")))
      .finally(() => setBusy(false));
  };
  const edited =
    title !== entry.improvement?.title ||
    description !== entry.improvement?.description ||
    extraBeds !== entry.improvement?.extraBeds ||
    slot !== entry.improvementSlot;
  return (
    <div className={`${ELEMENT_TAG}-field`}>
      <label className={`${ELEMENT_TAG}-label`}>
        Proposed improvement
        <input
          className={`${ELEMENT_TAG}-notice-input`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        What changes?
        <textarea
          className={`${ELEMENT_TAG}-textarea`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        Extra beds
        <input
          type="number"
          min={0}
          max={3}
          value={extraBeds}
          onChange={(event) => setExtraBeds(Number(event.target.value))}
        />
      </label>
      <label className={`${ELEMENT_TAG}-label`}>
        Improvement slot
        <select value={slot} onChange={(event) => setSlot(Number(event.target.value))}>
          <option value={0}>Slot 1</option>
          <option value={1}>Slot 2</option>
        </select>
      </label>
      <div className={`${ELEMENT_TAG}-row`}>
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          disabled={busy || !title.trim() || !description.trim()}
          onClick={() => decide(true)}
        >
          {edited ? "Send counteroffer" : "Approve exact request"}
        </button>
        <button type="button" className={`${ELEMENT_TAG}-button`} disabled={busy} onClick={() => decide(false)}>
          Decline
        </button>
      </div>
      {error ? (
        <p className={`${ELEMENT_TAG}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** The single Visit surface for an empty, solo, or group cast. */
function RoomPanel({
  room,
  picture,
  draft,
  mode,
  targetId,
  busy,
  error,
  greetingNotice,
  ruling,
  open,
  ended,
  playerName,
  playerPortrait,
  portraits,
  sprites,
  onDraft,
  onMode,
  onTarget,
  onSend,
  onViewVenue,
  onEnterPrivate,
  privateSpaceOwnerName,
  onEnd,
  onLeavePending,
  endFailed,
  onRetryGreeting,
  onContinueWithoutGreeting,
  notices,
  onDismissNotice,
  debugDiscardEnabled,
  onDebugDiscard,
  onUseMailbox,
}: {
  room: RoomView;
  /** The picture of the place, or `""` for one that has never been drawn. */
  picture: string;
  draft: string;
  mode: "chat" | "fulfill" | "conclude";
  targetId: string;
  busy: boolean;
  error: string;
  greetingNotice: string;
  ruling: string;
  open: boolean;
  ended: boolean;
  playerName: string;
  playerPortrait: Portrait | undefined;
  portraits: PortraitMap;
  sprites: Record<string, ResidentSprite | null>;
  onDraft: (value: string) => void;
  onMode: (value: "chat" | "fulfill" | "conclude") => void;
  onTarget: (value: string) => void;
  onSend: () => void;
  onViewVenue: () => void;
  onEnterPrivate?: () => void;
  privateSpaceOwnerName?: string;
  onEnd: () => void;
  onLeavePending: () => void;
  endFailed: boolean;
  onRetryGreeting: () => void;
  onContinueWithoutGreeting: () => void;
  notices: RoomRecordEvent[];
  onDismissNotice: (id: string) => void;
  debugDiscardEnabled: boolean;
  onDebugDiscard: () => void;
  onUseMailbox?: () => void;
}) {
  /** The current paragraph in this venue visit's ordered reading. */
  const [readStep, setReadStep] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [openMemory, setOpenMemory] = useState<RoomRecordEvent | null>(null);
  const memoryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const memoryCloseRef = useRef<HTMLButtonElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const modeAnchorRef = useRef<HTMLSpanElement | null>(null);
  const historyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const readingRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLSpanElement | null>(null);
  const previousReading = useRef<{ roomId: string; stepCount: number } | null>(null);

  useEffect(() => {
    if (!historyOpen) return;
    window.requestAnimationFrame(() => historyRef.current?.focus());
  }, [historyOpen]);

  useEffect(() => {
    if (!actionsOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) setActionsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActionsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [actionsOpen]);

  useEffect(() => {
    if (!modeMenuOpen) return;
    const closeOnOutside = (event: Event) => {
      if (!modeAnchorRef.current?.contains(event.target as Node)) setModeMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModeMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("focusin", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("focusin", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [modeMenuOpen]);

  const closeMemory = useCallback(() => {
    setOpenMemory(null);
    window.requestAnimationFrame(() => memoryTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!openMemory) return;
    window.requestAnimationFrame(() => memoryCloseRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        memoryCloseRef.current?.focus();
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMemory();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMemory, openMemory]);

  /**
   * The whole room, one paragraph at a time, each paragraph wearing a name.
   *
   * A line's beats are handed to the walk exactly as the private drawer hands
   * them, so an aside is lifted out of the paragraph it was tagged under and
   * printed in a bubble over the card instead — the same reading, for the same
   * reason: a remark said to one person is not a paragraph said to the room.
   *
   * The player's own lines go through the same walk as the villagers'. They are
   * plain prose with no beats on them, which is what makes it safe to hand their
   * content to a parser at all — and it means a player who types a line starting
   * with a name and a colon gets it drawn as themselves anyway, because the name
   * drawn over a step comes off the LINE and never off what the line says. That
   * is the whole defence this drawing needs against a player writing somebody
   * else's name into the room's record.
   */
  const steps = useMemo<RoomStep[]>(() => {
    const built: RoomStep[] = [];
    const attached = new Map<string, RoomStep["asides"]>();
    for (const line of room.lines) {
      if ((line.kind !== "side" && line.kind !== "whisper") || !line.asideFor) continue;
      const list = attached.get(line.asideFor) ?? [];
      list.push({
        register: line.kind,
        text: line.content,
        ...(line.targetId
          ? { target: room.participants.find((person) => person.characterId === line.targetId)?.name ?? line.targetId }
          : {}),
        speakerId: line.speakerId,
        name: line.name,
        expression: line.expression,
        gazeAt: line.gazeAt,
      });
      attached.set(line.asideFor, list);
    }
    for (const line of room.lines) {
      if (line.kind === "side" || line.kind === "whisper") continue;
      const player = line.speakerId.length === 0;
      const walk = villagesWalk(line.content, line.beats ?? null);
      walk.paragraphs.forEach((paragraph, index) => {
        built.push({
          key: `${built.length}`,
          speakerId: player ? "" : line.speakerId,
          name: player ? playerName : line.name,
          player,
          text: paragraph,
          asides: [
            ...(walk.asides[index] ?? []),
            ...(index === walk.paragraphs.length - 1 ? (attached.get(line.id ?? "") ?? []) : []),
          ],
          ...(line.kind ? { register: line.kind === "narration" ? "narration" : "speech" } : {}),
          ...(line.expression ? { expression: line.expression } : {}),
          ...(line.gazeAt ? { gazeAt: line.gazeAt } : {}),
        });
      });
    }
    return built;
  }, [playerName, room.lines, room.participants]);

  /** A new visit opens at its latest line; each append opens at its first new paragraph. */
  useLayoutEffect(() => {
    setReadStep((current) => nextRoomReadIndex(previousReading.current, room.id, steps.length, current));
    previousReading.current = { roomId: room.id, stepCount: steps.length };
  }, [room.id, steps.length]);

  const at = Math.min(readStep, Math.max(0, steps.length - 1));
  const step = steps[at];
  const canReadPrevious = at > 0;
  const canReadNext = at < steps.length - 1;
  const canCompose = !ended && room.status === "active" && !canReadNext;
  const resizeComposer = useCallback(() => {
    const field = composerRef.current;
    if (!field) return;
    const style = window.getComputedStyle(field);
    const lineHeight = Number.parseFloat(style.lineHeight);
    const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    const oneLine = Math.ceil(lineHeight + padding);
    const twoLines = Math.ceil(lineHeight * 2 + padding);
    field.style.height = "auto";
    field.style.height = `${Math.min(Math.max(field.scrollHeight, oneLine), twoLines)}px`;
    field.style.overflowY = field.scrollHeight > twoLines + 1 ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => {
    resizeComposer();
  }, [canCompose, draft, resizeComposer]);

  useEffect(() => {
    const frame = composerRef.current?.parentElement;
    if (!frame) return;
    let width = frame.clientWidth;
    const observer = new ResizeObserver(() => {
      if (frame.clientWidth === width) return;
      width = frame.clientWidth;
      resizeComposer();
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [canCompose, resizeComposer]);

  const submitComposer = () => {
    if (!canCompose || busy || (mode !== "conclude" && !draft.trim()) || (mode === "fulfill" && !targetId)) return;
    setModeMenuOpen(false);
    onSend();
  };

  useLayoutEffect(() => {
    if (readingRef.current) readingRef.current.scrollTop = 0;
  }, [at, room.id]);

  /** Each paragraph keeps its own narration or speech attribution. */
  const register: VillageBeatRegister =
    step?.register ??
    (step === undefined || step.speakerId === "__venue_scene__"
      ? "narration"
      : step.player || classifyVillagesParagraph(step.text) === "speech"
        ? "speech"
        : "narration");

  const speakerPortrait = step === undefined ? undefined : step.player ? playerPortrait : portraits[step.speakerId];
  const activeParticipants = room.participants.filter((person) => room.activeIds.includes(person.characterId));
  const cast = room.status === "closed" && activeParticipants.length === 0 ? room.participants : activeParticipants;
  const speaker = cast.find((person) => person.characterId === step?.speakerId);
  const displayed = cast.slice(0, 4);
  const rest = cast.filter((person) => !displayed.some((shown) => shown.characterId === person.characterId));
  const asideSide =
    displayed.findIndex((person) => person.characterId === speaker?.characterId) >= 2 ? "left" : "right";

  /**
   * The wait, in the room's own words.
   *
   * The private drawer's spinner names the villager, because one villager is who
   * was asked. This one cannot: in the mode where the room answers together the
   * wait is one call for all of them, and in the mode where each answers in turn
   * it is one call each — the player was told which of the two this village is set
   * to in the settings, so the sentence that carries the information here is that
   * the room is answering at all, and that it may take one call or several.
   */
  const waiting = (
    <p className={`${ELEMENT_TAG}-chat-pending`} role="status">
      <span className={`${ELEMENT_TAG}-chat-spinner ${ELEMENT_TAG}-spin`} aria-hidden="true" />
      <span className={`${ELEMENT_TAG}-chat-pending-label`}>
        {room.status === "opening"
          ? "Preparing a greeting…"
          : room.status === "closing"
            ? "Saving this visit…"
            : "The room is answering…"}
      </span>
    </p>
  );

  return (
    <aside
      className={`${ELEMENT_TAG}-chat`}
      data-open={open ? "true" : "false"}
      data-ended={ended ? "true" : "false"}
      data-opening-error={room.status === "opening" && !!error ? "true" : "false"}
      aria-label={`${room.area === "outside" ? "Outside" : "Inside"} ${room.placeName}`}
    >
      {/*
        Who is here, said once in words.

        The cast on the floor is a row of the Engine's avatar frames and those
        frames are `aria-hidden` — the private drawer can afford that, because the
        one face it draws is named again on the card a line later. A room's four
        faces are not: the card names whoever is talking and nobody else, so
        without this a screen reader would hear a conversation between people
        whose names appear only at the moment they speak, and never one who has
        not spoken yet. One sentence, outside every live region in the drawer, so
        it is announced when the room is walked into and not on every paragraph
        after that.
      */}
      <p className={`${ELEMENT_TAG}-visually-hidden`}>
        {`Here now: ${activeParticipants.length ? activeParticipants.map((villager) => `${villager.name}${villager.doing ? ` is ${villager.doing}` : ""}`).join("; ") : "nobody"}.`}
      </p>

      <div className={`${ELEMENT_TAG}-chat-scene`} aria-hidden="true">
        {picture ? (
          <>
            <img className={`${ELEMENT_TAG}-chat-scene-backdrop`} src={picture} alt="" />
            <span className={`${ELEMENT_TAG}-chat-scrim`} />
            <span className={`${ELEMENT_TAG}-chat-vignette`} />
          </>
        ) : (
          <span className={`${ELEMENT_TAG}-chat-scene-placeholder`}>
            {room.area === "outside" ? "Exterior not drawn yet" : "Interior / space not drawn yet"}
          </span>
        )}
      </div>

      <div className={`${ELEMENT_TAG}-chat-head`}>
        <span className={`${ELEMENT_TAG}-room-place`}>{room.placeName}</span>
        <span ref={actionsRef} className={`${ELEMENT_TAG}-chat-actions`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-room-actions-trigger`}
            onClick={() => setActionsOpen((value) => !value)}
            aria-label="Venue actions"
            aria-haspopup="menu"
            aria-expanded={actionsOpen}
          >
            ···
          </button>
          {actionsOpen ? (
            <span className={`${ELEMENT_TAG}-room-actions-menu`} role="menu" aria-label="Venue actions">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  onViewVenue();
                }}
                disabled={busy}
              >
                View Venue
              </button>
              {onEnterPrivate ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onEnterPrivate();
                  }}
                  disabled={busy}
                >
                  Enter {privateSpaceOwnerName ?? "private space"}
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  onEnd();
                }}
                disabled={busy}
              >
                {ended ? "Return to map" : "End visit now"}
              </button>
              {endFailed || room.status === "closing" ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onLeavePending();
                  }}
                >
                  Leave with memory pending
                </button>
              ) : null}
              {debugDiscardEnabled && room.status !== "closed" ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onDebugDiscard();
                  }}
                  disabled={busy}
                >
                  DEBUG: Discard Visit
                </button>
              ) : null}
            </span>
          ) : null}
        </span>
      </div>
      {room.area === "outside" ? (
        <p className={`${ELEMENT_TAG}-hint`} role="status">
          You’re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave
          whenever you like.
        </p>
      ) : null}
      {notices.length > 0 ? (
        <div className={`${ELEMENT_TAG}-room-notices`} aria-live="polite">
          <button
            type="button"
            className={`${ELEMENT_TAG}-room-notices-trigger`}
            onClick={() => setNoticesOpen((value) => !value)}
            aria-expanded={noticesOpen}
            aria-label={`${notices.length} village ${notices.length === 1 ? "notice" : "notices"}`}
          >
            ✦ {notices.length}
          </button>
          {noticesOpen ? (
            <div className={`${ELEMENT_TAG}-room-stars`} aria-live="polite" aria-label="Village events">
              {notices.map((notice) => (
                <div key={notice.id} className={`${ELEMENT_TAG}-room-star`}>
                  <span aria-hidden="true">✦</span>
                  {notice.kind === "memory" && notice.detail ? (
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-room-star-detail`}
                      onClick={(event) => {
                        memoryTriggerRef.current = event.currentTarget;
                        setOpenMemory(notice);
                      }}
                      aria-label={`View memory: ${notice.text}`}
                      title="View saved memory"
                    >
                      {notice.text}
                    </button>
                  ) : (
                    <span>{notice.text}</span>
                  )}
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-room-star-dismiss`}
                    onClick={() => {
                      if (openMemory?.id === notice.id) setOpenMemory(null);
                      onDismissNotice(notice.id);
                    }}
                    aria-label={`Dismiss ${notice.text}`}
                    title="Dismiss notice"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      {openMemory?.detail ? (
        <div
          className={`${ELEMENT_TAG}-memory-backdrop`}
          onClick={(event) => {
            if (event.currentTarget === event.target) closeMemory();
          }}
        >
          <div
            className={`${ELEMENT_TAG}-memory-dialog`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${ELEMENT_TAG}-memory-dialog-title`}
          >
            <div className={`${ELEMENT_TAG}-memory-dialog-head`}>
              <h2 id={`${ELEMENT_TAG}-memory-dialog-title`}>{openMemory.text}</h2>
              <button ref={memoryCloseRef} type="button" onClick={closeMemory} aria-label="Close memory">
                ×
              </button>
            </div>
            <p>{openMemory.detail}</p>
          </div>
        </div>
      ) : null}

      {/*
        The floor: everybody who was in the room when it opened.

        `aria-hidden` on the row, with the sentence above carrying the names — see
        there. The faces are the ENGINE's own avatar frame rather than the private
        drawer's big square, because a room has several and a row of several people
        is a row of small ones; the frame is also the one thing on this screen that
        tells the player which villager is which without a label, which is what a
        face is for.

        The plate under them is the place rather than the people, exactly as it is
        in the private drawer: the faces answer who, and the plate answers where.
      */}
      {activeParticipants.length > 0 ? (
        <div className={`${ELEMENT_TAG}-chat-activities`} tabIndex={0} aria-label="What everyone here is doing">
          {activeParticipants.map((villager) => (
            <span key={villager.characterId} className={`${ELEMENT_TAG}-chat-activity`}>
              {`${villager.name}: ${villager.doing || "spending time here"}`}
            </span>
          ))}
        </div>
      ) : null}
      <div className={`${ELEMENT_TAG}-chat-stage`} aria-hidden="true">
        <div className={`${ELEMENT_TAG}-chat-cast`}>
          {displayed.map((villager, index) => {
            const sprite = sprites[villager.characterId];
            const isSpeaker = villager.characterId === speaker?.characterId;
            const aside = step?.asides.find((item) => item.speakerId === villager.characterId);
            const wanted = isSpeaker ? (step?.expression ?? "neutral") : (aside?.expression ?? "neutral");
            const gazeAt = isSpeaker
              ? step?.gazeAt
              : (aside?.gazeAt ?? (villager.characterId === step?.gazeAt ? speaker?.characterId : undefined));
            const targetIndex = displayed.findIndex((person) => person.characterId === gazeAt);
            const selected = selectSpriteImage(sprite?.images ?? [], wanted, spriteFacing(index, targetIndex));
            return (
              <div
                key={villager.characterId}
                className={`${ELEMENT_TAG}-chat-cast-person`}
                data-active={villager.characterId === speaker?.characterId ? "true" : "false"}
                data-sprite={selected ? "true" : "false"}
              >
                {selected ? (
                  <img
                    src={selected.image.url}
                    alt=""
                    data-framing={sprite?.framing.mode ?? "full"}
                    data-facing={selected.mirrored ? "left" : "right"}
                  />
                ) : (
                  <AvatarFace
                    portrait={portraits[villager.characterId]}
                    name={villager.name}
                    className={`${ELEMENT_TAG}-avatar`}
                  />
                )}
                <span>{villager.name}</span>
              </div>
            );
          })}
        </div>
        {rest.length > 0 ? (
          <div className={`${ELEMENT_TAG}-chat-cast-rest`}>
            {rest.map((person) => (
              <span key={person.characterId}>
                <AvatarFace
                  portrait={portraits[person.characterId]}
                  name={person.name}
                  className={`${ELEMENT_TAG}-avatar`}
                />
                {person.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className={`${ELEMENT_TAG}-chat-vn`}>
        {historyOpen ? (
          <div
            ref={historyRef}
            className={`${ELEMENT_TAG}-chat-log`}
            role="log"
            aria-label="Venue conversation history"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              setHistoryOpen(false);
              window.requestAnimationFrame(() => historyTriggerRef.current?.focus());
            }}
          >
            {room.lines.map((line, index) => (
              <p key={line.id ?? index} className={`${ELEMENT_TAG}-chat-vn-text`}>
                <strong>
                  {line.role === "user"
                    ? playerName
                    : line.kind === "narration" || line.speakerId === "__venue_scene__"
                      ? "Narration"
                      : line.name || "Resident"}
                  {line.kind === "side" ? " · aside" : line.kind === "whisper" ? " · whisper" : ""}:{" "}
                </strong>
                {renderVillagesMarkdown(line.content, `history-${index}-`)}
              </p>
            ))}
          </div>
        ) : null}
        {step && step.asides.length > 0 ? (
          <div className={`${ELEMENT_TAG}-chat-vn-asides`} data-side={asideSide} aria-live="polite">
            {step.asides.map((aside, index) => (
              <div
                key={`${index}-${aside.register}`}
                className={`${ELEMENT_TAG}-chat-vn-aside`}
                data-register={aside.register}
              >
                <AvatarFace
                  portrait={aside.speakerId ? portraits[aside.speakerId] : speakerPortrait}
                  name={aside.name ?? step.name}
                  glyph={step.player ? "person" : "initial"}
                  className={`${ELEMENT_TAG}-chat-vn-aside-face`}
                />
                <div className={`${ELEMENT_TAG}-chat-vn-aside-column`}>
                  <p className={`${ELEMENT_TAG}-chat-vn-aside-head`}>
                    <span className={`${ELEMENT_TAG}-chat-vn-aside-icon`}>
                      {aside.register === "whisper" ? "🤫" : "💬"}
                    </span>
                    <span className={`${ELEMENT_TAG}-chat-vn-aside-name`}>{aside.name ?? step.name}</span>
                    {aside.register === "whisper" && aside.target ? (
                      <span className={`${ELEMENT_TAG}-chat-vn-aside-target`}>{`→ ${aside.target}`}</span>
                    ) : null}
                  </p>
                  <p className={`${ELEMENT_TAG}-chat-vn-aside-text`}>
                    {renderVillagesMarkdown(aside.text, `vn-aside-${index}-`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* One readable paragraph shares the same dock with navigation and the composer at the latest paragraph. */}
        <div className={`${ELEMENT_TAG}-chat-vn-card`} data-register={register}>
          <div className={`${ELEMENT_TAG}-chat-vn-row`}>
            <div className={`${ELEMENT_TAG}-chat-vn-column`}>
              {register === "narration" ? (
                <p className={`${ELEMENT_TAG}-chat-vn-label`}>Narration</p>
              ) : (
                <p className={`${ELEMENT_TAG}-chat-vn-name`}>{step?.name ?? ""}</p>
              )}
              <div
                ref={readingRef}
                className={`${ELEMENT_TAG}-chat-vn-reading`}
                role="region"
                aria-label="Current paragraph"
                aria-live="polite"
                tabIndex={0}
              >
                {step ? (
                  register === "narration" ? (
                    <p className={`${ELEMENT_TAG}-chat-vn-beat`} data-register="narration">
                      {renderVillagesMarkdown(step.text, "vn-beat-")}
                    </p>
                  ) : (
                    <p className={`${ELEMENT_TAG}-chat-vn-text`}>{renderVillagesMarkdown(step.text, "vn-")}</p>
                  )
                ) : (
                  /*
                    A room with nothing in it, which is a room the player has just
                    walked into and nobody has been asked anything yet.
                  */
                  <p className={`${ELEMENT_TAG}-chat-vn-text`} data-empty="true">
                    {room.status === "opening"
                      ? `Preparing a greeting in ${room.placeName}…`
                      : activeParticipants.length === 0
                        ? `You are alone in ${room.placeName}.`
                        : "…"}
                  </p>
                )}
                {!ended && busy ? waiting : null}
              </div>
            </div>
          </div>
        </div>
        <div className={`${ELEMENT_TAG}-room-panel-tools`}>
          {room.lines.length > 0 ? (
            <button
              ref={historyTriggerRef}
              type="button"
              className={`${ELEMENT_TAG}-chat-history-toggle`}
              aria-label="History"
              aria-expanded={historyOpen}
              onClick={() => setHistoryOpen((value) => !value)}
            >
              {historyOpen ? "Hide history" : "History"}
            </button>
          ) : null}
          <span className={`${ELEMENT_TAG}-chat-vn-counter`}>{`${at + 1} / ${Math.max(1, steps.length)}`}</span>
          <span className={`${ELEMENT_TAG}-chat-vn-nav`}>
            <button
              type="button"
              className={`${ELEMENT_TAG}-chat-vn-button`}
              onClick={() => setReadStep(at - 1)}
              disabled={!canReadPrevious}
              aria-label="Previous paragraph"
            >
              ‹ <span>Previous</span>
            </button>
            {canReadNext ? (
              <button
                type="button"
                className={`${ELEMENT_TAG}-chat-vn-button`}
                onClick={() => setReadStep(at + 1)}
                aria-label="Next paragraph"
              >
                <span>Next</span> ›
              </button>
            ) : ended ? (
              <button type="button" className={`${ELEMENT_TAG}-chat-vn-button`} onClick={onEnd} disabled={busy}>
                Return to map
              </button>
            ) : null}
          </span>
        </div>

        {error && room.status === "opening" ? (
          <div className={`${ELEMENT_TAG}-room-error`} role="alert">
            <p>{error}</p>
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={onEnd} disabled={busy}>
              Back to map
            </button>
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={onRetryGreeting} disabled={busy}>
              Retry greeting
            </button>
            {room.id ? (
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={onContinueWithoutGreeting}
                disabled={busy}
              >
                Continue without greeting
              </button>
            ) : null}
          </div>
        ) : null}
        {greetingNotice ? (
          <div className={`${ELEMENT_TAG}-room-error`} role="status">
            <p>{greetingNotice}</p>
          </div>
        ) : null}
        {ruling ? <p className={`${ELEMENT_TAG}-empty`}>{ruling}</p> : null}
        {room.status === "closing" ? (
          <p className={`${ELEMENT_TAG}-hint`}>
            The visit is still being remembered. You can leave with memory pending if filing cannot finish.
          </p>
        ) : null}

        {canCompose && mode === "fulfill" && activeParticipants.length === 0 ? (
          <p className={`${ELEMENT_TAG}-hint`}>Nobody is here whose wish you can fulfill.</p>
        ) : null}
        {canCompose ? (
          <div className={`${ELEMENT_TAG}-composer`}>
            {mode === "fulfill" && activeParticipants.length > 0 ? (
              <select
                value={targetId}
                onChange={(event) => onTarget(event.target.value)}
                aria-label="Whose wish you fulfilled"
                disabled={busy || ended || room.status !== "active"}
              >
                <option value="">Choose one villager</option>
                {activeParticipants.map((person) => (
                  <option key={person.characterId} value={person.characterId}>
                    {person.name}
                  </option>
                ))}
              </select>
            ) : null}
            <div className={`${ELEMENT_TAG}-composer-row`}>
              <span className={`${ELEMENT_TAG}-chat-input`}>
                <span ref={modeAnchorRef} className={`${ELEMENT_TAG}-room-mode-anchor`}>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-room-mode-toggle`}
                    onClick={() => setModeMenuOpen((value) => !value)}
                    aria-label={`Mode: ${mode === "chat" ? "Chat" : mode === "fulfill" ? "Fulfill" : "Conclude"}. Choose mode`}
                    aria-haspopup="menu"
                    aria-expanded={modeMenuOpen}
                    title={mode === "chat" ? "Chat" : mode === "fulfill" ? "Fulfill" : "Conclude"}
                  >
                    {mode === "chat" ? "💬" : mode === "fulfill" ? "🫴" : "🚪"}
                  </button>
                  {modeMenuOpen ? (
                    <span className={`${ELEMENT_TAG}-room-mode-menu`} role="menu" aria-label="Visit mode">
                      {(["chat", "fulfill", "conclude"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="menuitemradio"
                          aria-checked={mode === option}
                          disabled={busy || (option === "fulfill" && activeParticipants.length === 0)}
                          onClick={() => {
                            onMode(option);
                            setModeMenuOpen(false);
                          }}
                        >
                          {option === "chat" ? "Chat" : option === "fulfill" ? "Fulfill" : "Conclude"}
                        </button>
                      ))}
                    </span>
                  ) : null}
                </span>
                {onUseMailbox ? (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    onClick={onUseMailbox}
                    title="Use the Mailbox at home"
                  >
                    Use… Mailbox
                  </button>
                ) : null}
                <textarea
                  ref={composerRef}
                  className={`${ELEMENT_TAG}-textarea`}
                  rows={1}
                  value={draft}
                  onChange={(event) => onDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (shouldSubmitVenueKey(event.key, event.shiftKey, event.nativeEvent.isComposing)) {
                      event.preventDefault();
                      submitComposer();
                    }
                  }}
                  placeholder={
                    mode === "fulfill"
                      ? "What did you do for them?"
                      : mode === "conclude"
                        ? "Final line (optional)…"
                        : "Say or do something…"
                  }
                  aria-label={`Message at ${room.placeName}`}
                  disabled={busy || ended || room.status !== "active"}
                />
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-chat-send`}
                  onClick={submitComposer}
                  disabled={
                    busy ||
                    ended ||
                    room.status !== "active" ||
                    (mode !== "conclude" && draft.trim().length === 0) ||
                    (mode === "fulfill" && !targetId)
                  }
                  aria-label={busy ? "Sending" : "Send"}
                  title={busy ? "Sending" : "Send"}
                >
                  {busy ? "Sending…" : "Send"}
                </button>
              </span>
            </div>
          </div>
        ) : null}
        {error && room.status !== "opening" ? (
          <div className={`${ELEMENT_TAG}-room-error`} role="alert">
            <p>{error}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

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
 * Every option the Menu offers. The first four show you the village; the last
 * two are what changes it, and the two Debug entries are what it has kept.
 */
type MenuTab =
  | "villagers"
  | "noticeboard"
  | "venueRequests"
  | "homes"
  | "map"
  | "village"
  | "general"
  | "replyGuidance"
  | "story"
  | "chatlogs"
  | "agendas"
  | "schedules";

const FORCE_VILLAGE_UPDATE_NOTICE =
  "Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";

export function VillagesView({ element }: { element: HTMLElement }) {
  const [mobile, setMobile] = useState(false);
  useLayoutEffect(() => {
    const measure = () => {
      const box = element.getBoundingClientRect();
      setMobile(box.width <= 704 || (box.width <= 880 && box.height <= 512));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  const [snapshot, setSnapshot] = useState<VillageSnapshot | null>(null);
  const [catalog, setCatalog] = useState<CatalogEntry[] | null>(null);
  /**
   * The village's memory, or null while it is being read. Null rather than an
   * empty list so "still reading" and "it has remembered nothing yet" are told
   * apart, since only one of them is something the player has to wait for.
   *
   * Deliberately not part of the snapshot. The story is the one part of the
   * record with no ceiling, and the snapshot is rebuilt on every chat send and
   * every pulse; a growing list in it would be re-sent with each of them.
   */
  const [story, setStory] = useState<StoryEntry[] | null>(null);
  const [storyTotal, setStoryTotal] = useState(0);
  const [villagersSection, setVillagersSection] = useState<"residents" | "memories">("residents");
  const [memoryLibrary, setMemoryLibrary] = useState<MemoryLibrary | null>(null);
  const [venueVisits, setVenueVisits] = useState<ArchiveVisitSummary[] | null>(null);
  const [archiveTotal, setArchiveTotal] = useState(0);
  const [archiveOffset, setArchiveOffset] = useState(0);
  const [archiveVersion, setArchiveVersion] = useState(0);
  const [openArchivedVisit, setOpenArchivedVisit] = useState<RoomView | null>(null);
  const [endFailed, setEndFailed] = useState(false);
  const [archiveVenueId, setArchiveVenueId] = useState("");
  const [archiveVillagerId, setArchiveVillagerId] = useState("");
  const [archiveError, setArchiveError] = useState("");
  /**
   * What each villager is privately after, read when the debug option is opened.
   *
   * The only place any of this is ever shown, and deliberately the only place:
   * a wish is what a villager does things for rather than a task they were given,
   * and the only part the player has in one is the verb that settles it.
   * Putting the list on the villager tile or in the chat would turn a private
   * motivation into an objective, which is the one shape the whole slice exists
   * to avoid.
   */
  const [agendas, setAgendas] = useState<VillagerAgendaView[] | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  // The menu is its own screen. The homepage never carries the villager
  // controls, and the menu never draws the village itself; `menuTab` picks
  // which option inside the menu is open.
  //
  // `setup` is the third screen: the founding wizard owns the whole tab while it
  // runs, because it asks for the village's identity and its map at once and
  // nothing else is worth showing until it is done.
  //
  // `venue` is the fourth, and it is the one the MAP leads to: a place is where
  // the village's business happens, so pressing its pin walks into the place and
  // the place decides what is behind the door. See `openVenue`, which is where
  // the other half of that statement lives — a place with one person standing in
  // it never reaches this screen at all.
  const [screen, setScreen] = useState<"home" | "menu" | "setup" | "preparing" | "venue" | "room">("home");
  /**
   * Which place the venue screen is standing in.
   *
   * An id rather than the record, because the record is re-read on a timer and
   * after every model call: a copy kept here would be a room whose picture could
   * appear while the player was looking at it and never reach the screen. The
   * cost is that this can point at a place that has since been deleted, and the
   * screen says so rather than pretending.
   */
  const [venueId, setVenueId] = useState<string | null>(null);
  const [venuePage, setVenuePage] = useState<"view" | "edit" | "proposal">("view");
  const [venueVisitPickerOpen, setVenueVisitPickerOpen] = useState(false);
  const [venueEditDraft, setVenueEditDraft] = useState<VillageVenue | null>(null);
  const [venueProposalDraft, setVenueProposalDraft] = useState<{
    classes: VenueClass[];
    capacity: number;
    slot: number;
    title: string;
    description: string;
    extraBeds: number;
  } | null>(null);
  const [venueEditBusy, setVenueEditBusy] = useState(false);
  const [venueEditError, setVenueEditError] = useState("");
  const [venueEditNotice, setVenueEditNotice] = useState("");
  const [moveTargetId, setMoveTargetId] = useState("");
  /**
   * Which pin on the map is showing its doors.
   *
   * A place with somebody standing in it offers two answers rather than taking
   * one on the player's behalf, and this is which pin is holding that choice
   * open. An id rather than a record, for the same reason `venueId` is: the
   * village is re-read on a timer, and a place that has left the map in the
   * meantime simply stops having any doors to draw.
   */
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null);
  const [placesOpen, setPlacesOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<MenuTab>("village");
  const [menuSection, setMenuSection] = useState<"index" | "general" | "village" | "debug" | "noticeboard">("index");
  const [requestEdits, setRequestEdits] = useState<
    Record<string, Pick<VillageVenue, "name" | "purpose" | "category" | "description">>
  >({});
  const [spriteEditorId, setSpriteEditorId] = useState<string | null>(null);
  /**
   * Portraits, by character id, as the Engine has been willing to hand them over.
   *
   * Held in the tab rather than read per drawer, because the same picture is
   * drawn in three places — the villager list, the picker, and the conversation —
   * and a second request for a picture already in hand is a second request the
   * Engine has to answer for nothing. A character with no entry is a character
   * with no picture, which is an ordinary character and not a failure.
   */
  const [portraits, setPortraits] = useState<PortraitMap>({});
  const [refreshPreviews, setRefreshPreviews] = useState<Record<string, VillagerRefreshPreview>>({});
  const [refreshBusyId, setRefreshBusyId] = useState("");
  /**
   * The player's own face, for the card's read of their own turns.
   *
   * Not in `portraits` beside the villagers, because it is not keyed the same
   * way and does not come from the same route: a villager's picture is the
   * Engine's character library keyed by character id, and the player's is the
   * Engine's Persona — a different record, with a different picture, read through
   * a different endpoint. One object rather than a map, because there is only
   * ever one of them: the Persona this village is written against. See the effect
   * that fills it, and `AvatarFace` for what is drawn when it is null.
   */
  const [personaPortrait, setPersonaPortrait] = useState<Portrait | null>(null);
  const [search, setSearch] = useState("");
  /** The village's world-knowledge prompt box as it is being edited. */
  const [knowledgeDraft, setKnowledgeDraft] = useState("");
  /**
   * Who the player is, as the picker has it.
   *
   * One draft, and there used to be three. The other two were a typed name and
   * a typed blurb for the player, which the village stopped storing when the
   * Persona took the question over — "who are you" has one answer now, and a
   * second box beside it was only ever a way for the two to disagree.
   *
   * They were not merely dead. They were seeded from `settings.playerName` and
   * `settings.playerDescription`, which the snapshot no longer carries, so both
   * drafts came back `undefined` the moment the village tab was opened — and
   * founding a village then died inside `playerNameDraft.trim()` with a
   * TypeError, because nothing in the build or the linter can see a field that
   * is missing from a hand-written mirror of the server's view.
   */
  const [personaDraft, setPersonaDraft] = useState("");
  /**
   * The Personas on offer, or null while they are being read. `null` rather
   * than an empty list because "still reading" and "you have none" are two
   * different things to say, and only one of them is the player's fault.
   */
  const [personas, setPersonas] = useState<PersonaEntry[] | null>(null);
  const [settingDraft, setSettingDraft] = useState("");
  const [lorebookDraft, setLorebookDraft] = useState<string[]>([]);
  const [loreTokenBudgetDraft, setLoreTokenBudgetDraft] = useState(1600);
  const [setupLorebookDraft, setSetupLorebookDraft] = useState<string[]>([]);
  const [setupLoreTokenBudgetDraft, setSetupLoreTokenBudgetDraft] = useState(1600);
  const [lorebooks, setLorebooks] = useState<VillageLorebookOption[] | null>(null);
  const [lorebooksError, setLorebooksError] = useState("");
  const [venuesDraft, setVenuesDraft] = useState<VillageVenue[]>([]);
  const [venueSearch, setVenueSearch] = useState("");
  // Homes as the editors hold them: the wizard's map and the Homes panel edit
  // the same list, they are never open together, and both save the whole list.
  const [homesDraft, setHomesDraft] = useState<HomeDraft[]>([]);
  // Which home the next click on the map will place, and which pin the editor is
  // pointing at so the row and the map agree about what is being edited.
  const [placingHome, setPlacingHome] = useState(false);
  const [placingPublicCenter, setPlacingPublicCenter] = useState(false);
  const [activeHomeId, setActiveHomeId] = useState<string | null>(null);
  const [selectedMapVenueId, setSelectedMapVenueId] = useState<string | null>(null);
  const [placingMapVenueId, setPlacingMapVenueId] = useState<string | null>(null);
  const [noticeDraft, setNoticeDraft] = useState("");
  // The founding wizard. Its own name and setting drafts rather than the menu's,
  // so a half-typed founding cannot be overwritten by the menu opening and a
  // menu edit cannot be founded by accident.
  const [setupStep, setSetupStep] = useState(0);
  const [setupName, setSetupName] = useState("");
  const [setupSetting, setSetupSetting] = useState("");
  const [setupFoundingReason, setSetupFoundingReason] = useState<FoundingScenarioId>("rebuild");
  const [setupFoundingDetails, setSetupFoundingDetails] = useState<string>(foundingScenario("rebuild").premise);
  const [setupFoundingGuidance, setSetupFoundingGuidance] = useState("");
  const [setupImprint, setSetupImprint] = useState<ScenarioImprint>(emptyScenarioImprint);
  const [setupWorldFacts, setSetupWorldFacts] = useState<string[]>([]);
  const [setupImprintApprovedKey, setSetupImprintApprovedKey] = useState("");
  const [setupImprintBusy, setSetupImprintBusy] = useState(false);
  const [setupScenarioGuidanceDrafts, setSetupScenarioGuidanceDrafts] = useState<
    Partial<Record<FoundingScenarioId, string>>
  >({});
  const [setupNameSuggestions, setSetupNameSuggestions] = useState<string[]>([]);
  const [setupVenues, setSetupVenues] = useState<SetupVenueDraft[]>([]);
  const [selectedSetupVenueId, setSelectedSetupVenueId] = useState<string | null>(null);
  const [movingSetupVenueId, setMovingSetupVenueId] = useState<string | null>(null);
  const [setupTextDrafts, setSetupTextDrafts] = useState<Record<string, SetupTextDraft>>({});
  const [setupImageDraft, setSetupImageDraft] = useState<{
    venueId: string;
    area: "exterior" | "interior";
    image: VillageVenueImage;
  } | null>(null);
  const [setupVenueBusy, setSetupVenueBusy] = useState(false);
  const [setupPlacementError, setSetupPlacementError] = useState("");
  const [setupMapOptions, setSetupMapOptions] = useState<TownMapOptions>(DEFAULT_TOWN_MAP_OPTIONS);
  const [setupMapSource, setSetupMapSource] = useState<SetupMapSource>("generate");
  const [setupMapImage, setSetupMapImage] = useState("");
  const [setupMapImageSource, setSetupMapImageSource] = useState<"generate" | "upload" | null>(null);
  const [setupMapGeneratedKey, setSetupMapGeneratedKey] = useState("");
  const [setupMapSize, setSetupMapSize] = useState<{ width: number; height: number } | null>(null);
  const [setupMapPrompt, setSetupMapPrompt] = useState("");
  const [setupMapNegativePrompt, setSetupMapNegativePrompt] = useState("");
  const setupImprintSourceKey = JSON.stringify({
    scenario: setupFoundingReason,
    premise: setupFoundingDetails.trim(),
    direction: setupFoundingGuidance.trim(),
    setting: setupSetting.trim(),
    lorebooks: setupLorebookDraft,
  });
  const setupImprintSourceKeyRef = useRef(setupImprintSourceKey);
  useEffect(() => {
    if (setupImprintSourceKeyRef.current !== setupImprintSourceKey && !snapshot?.isFounded) {
      setSetupImprint(emptyScenarioImprint());
      setSetupImprintApprovedKey("");
      setSetupTextDrafts({});
      setSetupImageDraft(null);
    }
    setupImprintSourceKeyRef.current = setupImprintSourceKey;
  }, [setupImprintSourceKey, snapshot?.isFounded]);
  const setupMapGenerationKey = JSON.stringify({
    source: snapshot?.isFounded ? null : setupImprintSourceKey,
    setting: setupSetting.trim(),
    imprint: snapshot?.isFounded ? null : setupImprint,
    worldFacts: snapshot?.isFounded ? setupWorldFacts : null,
    lorebooks: setupLorebookDraft,
    structure: setupMapPrompt,
    negative: setupMapNegativePrompt,
    options: setupMapOptions,
  });
  const [setupMapBusy, setSetupMapBusy] = useState(false);
  const [preparationProblem, setPreparationProblem] = useState("");
  const [connectionSetupProblem, setConnectionSetupProblem] = useState("Connections are still loading.");
  const [imageConnectionWarning, setImageConnectionWarning] = useState(false);
  const [imageWarningOpen, setImageWarningOpen] = useState(false);
  /** Why the wizard cannot finish yet, said next to the button that would finish it. */
  const [setupProblem, setSetupProblem] = useState("");
  const [resetArmed, setResetArmed] = useState(false);
  // The town map itself, held here rather than on the snapshot: an image in a
  // snapshot read on every chat send would be re-sent whole every turn.
  const [townMapImage, setTownMapImage] = useState("");
  /**
   * A picture that has been picked but not written yet, with the size it decoded
   * to. Held here rather than sent straight up because picking a picture and
   * deciding how it sits in the frame are two answers to one question, and the
   * village should not be handed the first without the second.
   */
  const [townMapPick, setTownMapPick] = useState<{
    image: string;
    size: { width: number; height: number };
  } | null>(null);
  /** The framing being tried out on the preview. Null means "whatever is saved". */
  const [townMapDraft, setTownMapDraft] = useState<TownMapView | null>(null);
  /** Whether the saved picture is being re-framed. A picked picture frames itself. */
  const [reframingMap, setReframingMap] = useState(false);
  /**
   * Which place is being drawn, or given a picture, or having one taken away —
   * by id, or "" for none.
   *
   * Its own flag rather than the panel's shared `busy`, because drawing is the
   * one thing in this tab that can take a minute. A shared flag would grey out
   * the map, the noticeboard and every save button for as long as a model takes,
   * and the panel would be unusable for exactly as long as it is most worth
   * using. Only the row being worked on goes quiet.
   */
  const [placeBusyId, setPlaceBusyId] = useState("");
  /**
   * What the last picture attempt had to say, and which place it was about.
   *
   * Held as a pair rather than as a single sentence so the message is drawn
   * under the row it belongs to: two places being given pictures in a row would
   * otherwise leave the first one's refusal sitting under the second one's name.
   */
  const [placeProblem, setPlaceProblem] = useState<{ id: string; text: string } | null>(null);
  /**
   * The framing the village has saved. The map is drawn with this everywhere
   * except in the panel's own preview, which draws the draft being tried out.
   */
  const savedTownMapView: TownMapView = snapshot?.settings.townMapView ?? defaultView("cover");
  /**
   * The shape a map is drawn at, as the settings give it. This is the one place
   * that answers "how big is a map", so the frame the picture is drawn in, the
   * advice beside the file box and the server all agree about it.
   */
  const townMapShape: MapFrameShape | null = snapshot
    ? (townMapPick?.size ?? {
        width: snapshot.settings.townMapExpectedWidth,
        height: snapshot.settings.townMapExpectedHeight,
      })
    : null;
  const setupMapShape: MapFrameShape | null = snapshot
    ? setupMapSource === "existing"
      ? { width: snapshot.settings.townMapExpectedWidth, height: snapshot.settings.townMapExpectedHeight }
      : setupMapSize && setupMapImageSource === setupMapSource
        ? setupMapSize
        : { width: snapshot.settings.townMapGenerationWidth, height: snapshot.settings.townMapGenerationHeight }
    : null;
  /** How far the picture may be magnified in the panel, and how far one press moves it. */
  const townMapZoom: MapZoomRange = snapshot
    ? {
        min: snapshot.settings.townMapZoomMin,
        max: snapshot.settings.townMapZoomMax,
        step: snapshot.settings.townMapZoomStep,
      }
    : { min: 1, max: 1, step: 0.1 };
  /**
   * The map as it is drawn: the picture being previewed in the panel, or the
   * village's own picture, or the one the package ships.
   */
  const townMapSrc = townMapPick ? townMapPick.image : townMapImage || null;
  const setupMapSrc =
    setupMapSource === "none"
      ? null
      : setupMapSource === "existing"
        ? townMapImage || null
        : setupMapImageSource === setupMapSource &&
            (setupMapSource !== "generate" || setupMapGeneratedKey === setupMapGenerationKey)
          ? setupMapImage || null
          : null;
  /** Whether the panel is framing a picture: one just picked, or the saved one under revision. */
  const framingMap = townMapPick !== null || reframingMap;
  /**
   * The framing the panel draws. Everywhere else draws the saved one, so the
   * draft never leaks out of the panel and the village is never seen wearing a
   * framing that has not been agreed to.
   */
  const panelMapView: TownMapView = framingMap ? (townMapDraft ?? savedTownMapView) : savedTownMapView;
  /** What is true of the picture being previewed, if the panel is holding one. */
  const townMapAdvice = townMapPick ? pictureAdvice(townMapPick.size) : null;
  const [error, setError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [busy, setBusy] = useState(false);
  /**
   * The room the player is standing in, and whether it is on screen.
   *
   * A ROOM IS NOT A CONVERSATION, and the two are held apart on purpose: what is
   * in `conversation` belongs to one villager, is drawn by the villager's own
   * drawer and is held shut against the map while it is in hand; what is in `room`
   * belongs to a PLACE — everybody standing in it, and one list of what they all
   * said, which the village keeps under the place's own id. So a room can be walked
   * out of and back into with nothing lost and nothing parked, and the two drawers
   * never have to agree about which of them owns the map.
   *
   * `roomOpen` is a flag of its own for the same reason `chatOpen` is: the drawer
   * is animated by an attribute and a panel that is not there cannot slide.
   */
  const [room, setRoom] = useState<RoomView | null>(null);
  const [mailboxOpen, setMailboxOpen] = useState(false);
  const [roomOpen, setRoomOpen] = useState(false);
  /** What has been typed into the room's box and not yet said. */
  const [roomDraft, setRoomDraft] = useState("");
  const [roomMode, setRoomMode] = useState<"chat" | "fulfill" | "conclude">("chat");
  const [roomTargetId, setRoomTargetId] = useState("");
  const [roomRuling, setRoomRuling] = useState("");
  const [roomNotices, setRoomNotices] = useState<RoomRecordEvent[]>([]);
  const seenRoomEventIdsRef = useRef(new Set<string>());
  const [debugDiscardEnabled, setDebugDiscardEnabled] = useState(false);
  const lastRoomActivitySentRef = useRef(0);
  const lastRoomDeliberateAtRef = useRef(0);
  const observedRoomIdRef = useRef("");
  const [lastSceneEnding, setLastSceneEnding] = useState("");
  /**
   * The room's own busy flag, and not the tab's.
   *
   * For the reason `placeBusyId` and `spinOffBusyId` have their own: a turn in a
   * room can be four model calls long, and the tab's shared `busy` greys out the
   * settings panel, the map and every button in it while it is up. What has to be
   * shut is the box the answer is coming to, and that is all that is shut.
   */
  const [roomBusy, setRoomBusy] = useState(false);
  const leavingRoomPendingRef = useRef(false);
  const roomSubmissionIdRef = useRef<string | null>(null);
  const roomLeaveSubmissionIdRef = useRef<string | null>(null);
  const roomSendInFlightRef = useRef(false);
  /** What the room's last attempt had to say, and empty when it has nothing to. */
  const [roomError, setRoomError] = useState("");
  const [roomGreetingNotice, setRoomGreetingNotice] = useState("");
  /**
   * Whether the room has been ended, which is a fact about the CONVERSATION rather
   * than about the copy of it on screen: the reading stays where it was so the
   * player can finish it, and what changes is that nothing more can be said into
   * it — see `endRoom`.
   */
  const [roomEnded, setRoomEnded] = useState(false);
  /**
   * What the debug menu's "write it up now" has to say for itself, if anything.
   *
   * Its own line rather than one of the error fields beside it, because the
   * ordinary answer here is not a failure: a forced creative pass can genuinely
   * have nothing to add, and that reads as a mistake if it is shown in red.
   */
  const [writeUpNote, setWriteUpNote] = useState("");
  /**
   * The next exact transition the server reported for schedules or atmosphere.
   *
   * A ref rather than state, because the poll reads and writes it on a timer and
   * storing it in state would resubscribe the timer every time it noticed
   * something. Empty until the first read, so opening the tab immediately asks
   * the server to reconcile any elapsed time.
   */
  const transitionRef = useRef("");
  /** Stops a second village write-up starting while one is already running. */
  const reconcilingRef = useRef(false);
  /**
   * True while a write-up the tab has asked for is still running.
   *
   * Only ever set after `SHOW_CATCHING_UP_AFTER_MS`, so a quick reconciliation
   * never flickers it. Opening a village that has been
   * unread for hours is the case it exists for: the tab is asking the village
   * to write about all of that time, which takes a while, and a player looking
   * at an unchanged map deserves to know it is being worked on rather than
   * broken.
   */
  const [catchingUp, setCatchingUp] = useState(false);
  // The prompt box, so a macro can be dropped at the caret of it and the caret
  // put back afterwards.
  //
  // There used to be two refs and a `boxFocusRef` saying which one the macro row
  // would write into. The row of tokens now serves exactly one box, and a target
  // that has only one possible value is not a thing to keep.
  const knowledgeRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingCaretRef = useRef<number | null>(null);

  useEffect(() => {
    const caret = pendingCaretRef.current;
    const node = knowledgeRef.current;
    if (caret === null || !node) return;
    pendingCaretRef.current = null;
    node.focus();
    node.setSelectionRange(caret, caret);
  }, [knowledgeDraft]);

  /**
   * Ask the village to write down whatever has happened since it last did.
   *
   * Safe to call whenever: the server advances from its exact high-water mark,
   * deduplicates stable opportunity ids, and spends no generation when there is
   * no eligible creative work.
   *
   * Called whenever the next exact transition changes. The package scheduler
   * uses the same endpoint while Marinara is running; reopening Marinara uses
   * this call to reconstruct elapsed time since the stored high-water mark.
   *
   * `force` is passed through untouched and is only ever true from the debug
   * menu; see `writeItUpNow`. An ordinary call sends no body at all, so the
   * request the tab makes on its own is exactly the request it made before
   * anything could force one.
   *
   * It returns the snapshot it read, or null when the call failed, because the
   * one caller that forces has to be able to say what actually happened rather
   * than assume it worked.
   */
  const reconcile = useCallback(async (forceStory = false): Promise<VillageSnapshot | null> => {
    if (reconcilingRef.current) return null;
    reconcilingRef.current = true;
    const notice = setTimeout(() => setCatchingUp(true), SHOW_CATCHING_UP_AFTER_MS);
    try {
      const next = await request<VillageSnapshot>("/reconcile", {
        method: "POST",
        body: forceStory ? JSON.stringify({ forceStory: true }) : undefined,
      });
      setSnapshot(next);
      return next;
    } catch {
      // The village keeps whatever news it had and the tab keeps drawing it.
      // Deterministic reconciliation is committed before optional narration;
      // a later creative attempt can retry without replaying required state.
      return null;
    } finally {
      clearTimeout(notice);
      setCatchingUp(false);
      reconcilingRef.current = false;
    }
  }, []);

  /**
   * Ask for one creative village event right now, whatever Story pace says.
   *
   * This debug action spends at most one model call and bypasses the daily pace
   * gate. The event must still fit a fact-backed opportunity and pass the same
   * validation as an automatic creative event.
   *
   * It reports what actually happened rather than that it finished. A forced
   * creative pass over already-covered facts may have nothing to add —
   * the window is deduped against, so it can only write what is genuinely new —
   * and a button that always said "done" would leave the player wondering
   * whether the feature was broken or the village was simply quiet.
   */
  const writeItUpNow = useCallback(async () => {
    const newest = snapshot?.happenings[0]?.id ?? "";
    setWriteUpNote("Writing...");
    const next = await reconcile(true);
    if (!next) {
      setWriteUpNote(
        "The update request failed. Check the village again before retrying; time catch-up may already have run.",
      );
      return;
    }
    setWriteUpNote(
      (next.happenings[0]?.id ?? "") === newest
        ? "No new happening was added. Other village records may have changed during catch-up."
        : "A new visual event was added. See Events.",
    );
  }, [snapshot, reconcile]);

  /**
   * Read the village.
   *
   * `quiet` is the whole of the difference between the two callers. Opening the
   * tab has nothing to fall back on, so a failure there clears the village and
   * says so; a stumble in a read that runs every minute leaves the last good
   * reading on screen instead of blanking a village that is working perfectly
   * well.
   */
  const loadSnapshot = useCallback(async (options: { signal?: AbortSignal; quiet?: boolean } = {}) => {
    try {
      const next = await request<VillageSnapshot>("", { signal: options.signal });
      setSnapshot(next);
      setError("");
    } catch (cause) {
      if (options.signal?.aborted || options.quiet) return;
      setSnapshot(null);
      setError(messageFrom(cause, "Could not read the village."));
    }
  }, []);

  /*
    Reconcile whenever the server's next meaningful transition changes.

    Watching the snapshot rather than hanging off each read means this covers
    every way the tab can learn the time — the opening read, the minute-by-minute
    poll, founding the village, coming back to a tab that was hidden — without
    any of them having to remember to ask. The ref is what makes it happen once
    per exact transition rather than once per snapshot: nearly every snapshot
    carries the same transition timestamp, and the ones that do end right here.

    The ref starts empty, so the very first snapshot the tab ever sees always
    looks like a transition. That is the point of it: opening the tab on a
    village that has been sitting unread for a week reconciles that week then,
    instead of waiting for the next scheduled transition.

    An unfounded village is shown and not reconciled. There is no durable village
    state to advance before founding.
  */
  useEffect(() => {
    const transition = snapshot?.village.nextTransitionAt ?? "";
    if (transition.length === 0 || transition === transitionRef.current) return;
    transitionRef.current = transition;
    if (snapshot?.isFounded) void reconcile();
  }, [snapshot, reconcile]);

  const loadCatalog = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<CatalogResponse>("/catalog", { signal });
      setCatalog(response.characters);
      setError("");
    } catch (cause) {
      if (signal?.aborted) return;
      setError(messageFrom(cause, "Could not read your character library."));
    }
  }, []);

  const loadPersonas = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<PersonaResponse>("/personas", { signal });
      setPersonas(response.personas);
    } catch (cause) {
      if (signal?.aborted) return;
      // A failed read settles on "none" rather than staying unsettled forever:
      // the picker then offers the fields the player can still type into, and
      // the message says what went wrong. A spinner that never resolves would
      // hide the way out along with the problem.
      setPersonas([]);
      setError(messageFrom(cause, "Could not read your Personas."));
    }
  }, []);

  const loadLorebooks = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<{ books: VillageLorebookOption[] }>("/lorebooks", { signal });
      setLorebooks(response.books);
      setLorebooksError("");
    } catch (cause) {
      if (signal?.aborted) return;
      setLorebooksError(
        messageFrom(cause, "Could not read Engine lorebooks. Selected books will be skipped until available."),
      );
    }
  }, []);

  /**
   * Read what the village remembers.
   *
   * On its own route and its own callback, read when the tab is opened rather
   * than kept current, for the same reason the character catalog is: nobody is
   * looking at it while it is closed, and a list that grows with every part of
   * every day is the last thing worth carrying on a snapshot read every minute.
   */
  const loadStory = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<StoryResponse>("/story?offset=0&limit=50", { signal });
      setStory(response.entries);
      setStoryTotal(response.total);
    } catch (cause) {
      if (signal?.aborted) return;
      setStory(null);
      setError(messageFrom(cause, "Could not read the village story."));
    }
  }, []);

  const loadMemoryLibrary = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<MemoryLibrary>("/memories", { signal });
      setMemoryLibrary(response);
      setError("");
    } catch (cause) {
      if (signal?.aborted) return;
      setMemoryLibrary(null);
      setError(messageFrom(cause, "Could not read villager memories."));
    }
  }, []);

  const forgetMemory = useCallback(
    async (kind: "durable" | "recollections", id: string) => {
      const label = kind === "durable" ? "Forget this durable memory?" : "Let this passing recollection go now?";
      if (!window.confirm(label)) return;
      setBusy(true);
      try {
        await request(`/memories/${kind}/${encodeURIComponent(id)}`, { method: "DELETE" });
        await loadMemoryLibrary();
      } catch (cause) {
        setError(messageFrom(cause, "That memory could not be removed."));
      } finally {
        setBusy(false);
      }
    },
    [loadMemoryLibrary],
  );

  /**
   * Forget one memory.
   *
   * The server answers with the whole list again and that answer is what gets
   * drawn. Dropping the row locally would look identical today and diverge the
   * first time a write trimmed the tail of the story, which is a thing the
   * server does and the tab does not.
   */
  const removeStoryEntry = useCallback(async (id: string) => {
    setBusy(true);
    try {
      const response = await request<StoryResponse>(`/story/${encodeURIComponent(id)}`, { method: "DELETE" });
      setStory(response.entries);
      setStoryTotal(response.total);
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "That memory could not be removed."));
    } finally {
      setBusy(false);
    }
  }, []);

  const loadMoreStory = useCallback(async () => {
    const offset = story?.length ?? 0;
    try {
      const response = await request<StoryResponse>(`/story?offset=${offset}&limit=50`);
      setStory((current) => [...(current ?? []), ...response.entries]);
      setStoryTotal(response.total);
    } catch (cause) {
      setError(messageFrom(cause, "Could not read more memories."));
    }
  }, [story]);

  /**
   * Read what each villager is privately after.
   *
   * Read when the debug option is opened rather than carried on the snapshot,
   * for the same reason the story and the conversation record are: it is a model
   * call's worth of text per villager and nobody is looking at it while it is
   * closed.
   */
  const loadAgendas = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<AgendaListResponse>("/agendas", { signal });
      setAgendas(response.villagers);
    } catch (cause) {
      if (signal?.aborted) return;
      setAgendas(null);
      setError(messageFrom(cause, "Could not read what the villagers wish for."));
    }
  }, []);

  useEffect(() => {
    if (screen !== "menu" || (menuTab !== "agendas" && menuTab !== "schedules")) return;
    if (
      !agendas?.some((villager) => villager.agenda?.personalizationPending && !villager.agenda.personalizationFailure)
    )
      return;
    const timer = window.setInterval(() => void loadAgendas(), 5_000);
    return () => window.clearInterval(timer);
  }, [agendas, loadAgendas, menuTab, screen]);

  /**
   * Ask the village to work one villager out again.
   *
   * The press only clears what is stored; the writing happens on the next part of
   * the day, along with everything else the village does. The server answers with
   * the whole list and that answer is what gets drawn, so a row can never be left
   * showing something the village has already forgotten.
   */
  const rewriteAgenda = useCallback(async (characterId: string) => {
    setBusy(true);
    try {
      const response = await request<AgendaListResponse>(`/agendas/${encodeURIComponent(characterId)}/regenerate`, {
        method: "POST",
      });
      setAgendas(response.villagers);
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "That villager could not be asked again."));
    } finally {
      setBusy(false);
    }
  }, []);

  const correctCompletedWish = useCallback(async (characterId: string, wishId: string) => {
    setBusy(true);
    try {
      const response = await request<AgendaListResponse>(
        `/agendas/${encodeURIComponent(characterId)}/completed/${encodeURIComponent(wishId)}/correct`,
        { method: "POST" },
      );
      setAgendas(response.villagers);
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "That wish completion could not be corrected."));
    } finally {
      setBusy(false);
    }
  }, []);

  const setAgendaScheduleIngestion = useCallback(async (characterId: string, enabled: boolean) => {
    setBusy(true);
    try {
      const response = await request<AgendaListResponse>(`/agendas/${encodeURIComponent(characterId)}/ingestion`, {
        method: "PATCH",
        body: JSON.stringify({ ingestSchedule: enabled }),
      });
      setAgendas(response.villagers);
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "Schedule use could not be changed."));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadSnapshot({ signal: controller.signal });
    return () => controller.abort();
  }, [loadSnapshot]);

  /*
    Keep the tab in step with the village for as long as it is open.

    A capability package gets no timer and no background loop, so nothing can
    advance a village whose tab is closed — which is why the catch-up matters
    more than the poll. Once a minute is far finer than the thing being watched
    (four parts to a day), so nearly every one of these reads finds the same
    moment and stops at the first question, and the whole arrangement costs
    about as much as the clock in the corner.

    A hidden tab is skipped rather than ticked, since nobody is looking at it.
    The read on the way back covers the time it was away in one batch, because
    that is what the server makes of a moment it has fallen behind on.
  */
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) void loadSnapshot({ quiet: true });
    };
    const timer = setInterval(() => {
      if (document.hidden || reconcilingRef.current) return;
      void loadSnapshot({ quiet: true });
    }, VILLAGE_PULSE_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [loadSnapshot]);

  useEffect(() => {
    if (!room?.id || room.status === "closed" || screen !== "room") return;
    if (observedRoomIdRef.current !== room.id) {
      observedRoomIdRef.current = room.id;
      lastRoomDeliberateAtRef.current = Date.parse(room.lastActivityAt || room.startedAt) || Date.now();
    } else {
      lastRoomDeliberateAtRef.current = Math.max(
        lastRoomDeliberateAtRef.current,
        Date.parse(room.lastActivityAt || room.startedAt) || 0,
      );
    }
    let disposed = false;
    const interrupted = (reason: "inactivity" | "elsewhere") => {
      if (disposed) return;
      setRoom(null);
      setRoomOpen(false);
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setLastSceneEnding(
        reason === "inactivity"
          ? "Interrupted: Inactivity. Your completed exchanges were saved in the visit archive."
          : "This visit ended while you were away. Its completed exchanges are in the visit archive.",
      );
      setScreen("home");
      void loadSnapshot();
    };
    const validate = (touchAfter = false) => {
      void request<{ session: RoomView | null }>("/rooms/active")
        .then(async ({ session }) => {
          if (session?.id === room.id) {
            if (touchAfter) {
              await request("/rooms/activity", { method: "POST", body: JSON.stringify({ sessionId: room.id }) });
              lastRoomDeliberateAtRef.current = Date.now();
            }
            return;
          }
          const archived = await request<{ visit: RoomView }>(`/rooms/archive/${encodeURIComponent(room.id)}`).catch(
            () => null,
          );
          interrupted(archived?.visit.endReason === "inactivity" ? "inactivity" : "elsewhere");
        })
        .catch((cause) => {
          const reason = staleVenueReason(cause);
          if (reason) interrupted(reason);
        });
    };
    const deliberate = (event: Event) => {
      if (Date.now() - lastRoomDeliberateAtRef.current >= 30 * 60_000) {
        if (event.cancelable) event.preventDefault();
        event.stopImmediatePropagation();
        validate(true);
        return;
      }
      lastRoomDeliberateAtRef.current = Date.now();
      if (Date.now() - lastRoomActivitySentRef.current < 15_000) return;
      lastRoomActivitySentRef.current = Date.now();
      void request("/rooms/activity", { method: "POST", body: JSON.stringify({ sessionId: room.id }) }).catch(
        (cause) => {
          const reason = staleVenueReason(cause);
          if (reason) interrupted(reason);
          else validate();
        },
      );
    };
    const onFocus = () => validate();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    for (const type of ["pointerdown", "keydown", "input", "scroll"]) window.addEventListener(type, deliberate, true);
    return () => {
      disposed = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      for (const type of ["pointerdown", "keydown", "input", "scroll"])
        window.removeEventListener(type, deliberate, true);
    };
  }, [room?.id, room?.status, room?.lastActivityAt, room?.startedAt, screen, loadSnapshot]);

  // An app reload does not end a venue visit. The server owns the one active
  // session; the client restores it instead of opening another conversation.
  useEffect(() => {
    const controller = new AbortController();
    void request<{ session: RoomView | null; debugDiscardEnabled: boolean }>("/rooms/active", {
      signal: controller.signal,
    })
      .then(({ session, debugDiscardEnabled: debugEnabled }) => {
        setDebugDiscardEnabled(debugEnabled);
        if (controller.signal.aborted || !session) return;
        setRoom(currentRoom(session));
        setRoomMode("chat");
        setRoomOpen(true);
        setScreen("room");
        if (session.status === "opening") {
          setRoomBusy(true);
          void request<{ session: RoomView }>("/rooms/greet", {
            method: "POST",
            body: JSON.stringify({ sessionId: session.id }),
            signal: AbortSignal.timeout(30_000),
          })
            .then(({ session: greeted }) => {
              if (!controller.signal.aborted) setRoom(currentRoom(greeted));
            })
            .catch(async (cause) => {
              if (controller.signal.aborted) return;
              const recovered = await completedGreetingAfterFailure(session.id);
              if (controller.signal.aborted) return;
              if (recovered) setRoom(recovered);
              else setRoomError(greetingFailureMessage(cause));
            })
            .finally(() => {
              if (!controller.signal.aborted) setRoomBusy(false);
            });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (menuTab !== "chatlogs" || !snapshot?.isFounded) return;
    const controller = new AbortController();
    const query = new URLSearchParams();
    if (archiveVenueId) query.set("venueId", archiveVenueId);
    if (archiveVillagerId) query.set("characterId", archiveVillagerId);
    query.set("offset", String(archiveOffset));
    query.set("limit", "20");
    setVenueVisits(null);
    void request<{ visits: ArchiveVisitSummary[]; total: number }>(`/rooms/archive?${query.toString()}`, {
      signal: controller.signal,
    })
      .then(({ visits, total }) => {
        if (!controller.signal.aborted) {
          setVenueVisits(visits);
          setArchiveTotal(total);
          setArchiveError("");
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setArchiveError(messageFrom(cause, "Venue visits could not be read."));
      });
    return () => controller.abort();
  }, [archiveVenueId, archiveVillagerId, archiveOffset, archiveVersion, menuTab, snapshot?.isFounded]);

  const openVisit = useCallback(async (id: string) => {
    try {
      const response = await request<{ visit: RoomView }>(`/rooms/archive/${encodeURIComponent(id)}`);
      setOpenArchivedVisit(response.visit);
      setArchiveError("");
    } catch (cause) {
      setArchiveError(messageFrom(cause, "That visit could not be read."));
    }
  }, []);

  const retryVisitMemory = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        await request(`/rooms/archive/${encodeURIComponent(id)}/retry-memory`, { method: "POST" });
        await openVisit(id);
        setArchiveVersion((version) => version + 1);
        setArchiveError("");
      } catch (cause) {
        setArchiveError(messageFrom(cause, "Memory filing is still pending."));
      } finally {
        setBusy(false);
      }
    },
    [openVisit],
  );

  const deleteArchivedVisits = useCallback(async (id?: string) => {
    if (
      !window.confirm(
        id
          ? "Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried."
          : "Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.",
      )
    )
      return;
    setBusy(true);
    try {
      await request(id ? `/rooms/archive/${encodeURIComponent(id)}` : "/rooms/archive", { method: "DELETE" });
      setOpenArchivedVisit(null);
      setArchiveOffset(0);
      setArchiveVersion((version) => version + 1);
      setArchiveError("");
    } catch (cause) {
      setArchiveError(messageFrom(cause, "Visit transcripts could not be deleted."));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!pickerOpen) return;
    const controller = new AbortController();
    void loadCatalog(controller.signal);
    return () => controller.abort();
  }, [pickerOpen, loadCatalog]);

  // Kept as its own effect, keyed on the stamp: the picture is fetched once and
  // re-fetched only when the server says the map changed, so the homepage never
  // holds a stale copy and the snapshot never carries a megabyte of base64.
  const townMapSetAt = snapshot ? snapshot.settings.townMapImageSetAt : null;
  useEffect(() => {
    if (townMapSetAt === null) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const loaded = await request<{ image: string }>("/town-map", { signal: controller.signal });
        setTownMapImage(loaded.image);
      } catch {
        // Treated as "no map": a failed fetch is not worth an alert on a page
        // whose main job is the village itself, and the panel says what to do.
        if (!controller.signal.aborted) setTownMapImage("");
      }
    })();
    return () => controller.abort();
  }, [townMapSetAt]);

  const addVillager = useCallback(
    async (characterId: string) => {
      setBusy(true);
      try {
        setSnapshot(
          await request<VillageSnapshot>("/villagers", {
            method: "POST",
            body: JSON.stringify({ characterId }),
          }),
        );
        setError("");
        await loadCatalog();
      } catch (cause) {
        setError(messageFrom(cause, "That character could not move in."));
      } finally {
        setBusy(false);
      }
    },
    [loadCatalog],
  );

  const removeVillager = useCallback(
    async (characterId: string) => {
      setBusy(true);
      try {
        setSnapshot(
          await request<VillageSnapshot>(`/villagers/${encodeURIComponent(characterId)}`, { method: "DELETE" }),
        );
        setError("");
        if (catalog) await loadCatalog();
      } catch (cause) {
        setError(messageFrom(cause, "That villager could not leave."));
      } finally {
        setBusy(false);
      }
    },
    [catalog, loadCatalog],
  );

  const previewVillagerRefresh = useCallback(async (characterId: string) => {
    setRefreshBusyId(characterId);
    try {
      const preview = await request<VillagerRefreshPreview>(`/villagers/${encodeURIComponent(characterId)}/refresh`);
      setRefreshPreviews((current) => ({ ...current, [characterId]: preview }));
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "That villager's card could not be compared."));
    } finally {
      setRefreshBusyId("");
    }
  }, []);

  const applyVillagerRefresh = useCallback(async (characterId: string) => {
    setRefreshBusyId(characterId);
    try {
      setSnapshot(
        await request<VillageSnapshot>(`/villagers/${encodeURIComponent(characterId)}/refresh`, {
          method: "POST",
        }),
      );
      setRefreshPreviews((current) => {
        const next = { ...current };
        delete next[characterId];
        return next;
      });
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "That villager's card could not be refreshed."));
    } finally {
      setRefreshBusyId("");
    }
  }, []);

  // ── Menu screen ────────────────────────────────────────────────────────────
  // The menu is its own screen rather than a panel on the homepage, and every
  // option lives here now that nothing is drawn beside the map. Drafts are
  // seeded when Village Settings opens and never re-seeded while it stays open,
  // so a snapshot arriving from a chat send cannot overwrite what is being typed.
  const openMenu = useCallback(
    (tab: MenuTab) => {
      setMenuSection(
        tab === "noticeboard"
          ? "noticeboard"
          : tab === "general"
            ? "general"
            : tab === "replyGuidance" ||
                tab === "story" ||
                tab === "chatlogs" ||
                tab === "agendas" ||
                tab === "schedules"
              ? "debug"
              : "village",
      );
      setSettingsError("");
      setPlacesOpen(false);
      // The villager list is read when it is asked for rather than kept current
      // on every snapshot.
      if (tab === "villagers") void loadCatalog();
      if (tab === "villagers" && (screen !== "menu" || menuTab !== "villagers")) setVillagersSection("residents");
      // Same rule for the Personas the identity picker offers.
      if (tab === "village") void loadPersonas();
      if (tab === "village") void loadLorebooks();
      // And for the story, which is read for the same reason: it is only worth
      // having while it is being looked at.
      if (tab === "story") void loadStory();
      // And again for the wishes, which are the whole reason this debug group
      // exists: nothing else in the tab shows them. The agendas tab draws the
      // other half of the same listing, so it reads it the same way — one route,
      // one answer, and the two panels cannot disagree about the same villager.
      if (tab === "agendas" || tab === "schedules") void loadAgendas();
      const enteringVillageSettings = tab === "village" && (screen !== "menu" || menuTab !== "village");
      if (enteringVillageSettings && snapshot) {
        setKnowledgeDraft(snapshot.settings.promptKnowledge);
        setPersonaDraft(snapshot.settings.playerPersonaId);
        setSettingDraft(snapshot.settings.setting);
        setLorebookDraft(snapshot.settings.selectedLorebookIds);
        setLoreTokenBudgetDraft(snapshot.settings.loreTokenBudget);
        // Destinations only: the houses are the map's to edit and are drawn on it
        // — see `destinationPlaces`.
        setVenuesDraft(destinationPlaces(snapshot.settings.venues).map((venue) => ({ ...venue })));
      }
      setMenuTab(tab);
      setScreen("menu");
    },
    [loadAgendas, loadCatalog, loadLorebooks, loadPersonas, loadStory, menuTab, screen, snapshot],
  );

  const goHome = useCallback(() => {
    setPickerOpen(false);
    setSettingsError("");
    setOpenPlaceId(null);
    setPlacesOpen(false);
    setScreen("home");
  }, []);

  /** End the active visit, or leave an empty venue, before returning to the map. */
  const closeRoom = useCallback(async () => {
    if (!room || roomBusy) return;
    setRoomBusy(true);
    setRoomError("");
    setEndFailed(false);
    setRoom({ ...room, status: "closing" });
    try {
      if (room.id) await request("/rooms/end", { method: "POST", body: JSON.stringify({ sessionId: room.id }) });
      if (leavingRoomPendingRef.current) return;
      setRoomOpen(false);
      setRoom(null);
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setRoomDraft("");
      setRoomGreetingNotice("");
      setScreen("home");
      void loadSnapshot();
    } catch (cause) {
      if (leavingRoomPendingRef.current) return;
      const staleReason = staleVenueReason(cause);
      if (staleReason) {
        setRoom(null);
        setRoomOpen(false);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setLastSceneEnding(
          staleReason === "inactivity"
            ? "Interrupted: Inactivity. Your completed exchanges were saved in the visit archive."
            : "This visit ended while you were away. Its completed exchanges are in the visit archive.",
        );
        setScreen("home");
        void loadSnapshot();
        return;
      }
      setRoomError(messageFrom(cause, "You could not leave the venue."));
      setEndFailed(true);
    } finally {
      setRoomBusy(false);
    }
  }, [loadSnapshot, room, roomBusy]);

  const leaveRoom = useCallback(async () => {
    if (!room?.id || room.status !== "active" || roomBusy || roomSendInFlightRef.current) return;
    const submissionId = roomLeaveSubmissionIdRef.current ?? createVillagesClientId();
    roomLeaveSubmissionIdRef.current = submissionId;
    setRoomBusy(true);
    setRoomError("");
    setEndFailed(false);
    try {
      const answer = await request<{ session: RoomView; recordEvents: RoomRecordEvent[] }>("/rooms/leave", {
        method: "POST",
        body: JSON.stringify({ sessionId: room.id, submissionId, message: roomDraft }),
        signal: AbortSignal.timeout(300_000),
      });
      setRoom(currentRoom(answer.session));
      void loadSnapshot();
      setRoomEnded(true);
      for (const event of answer.recordEvents ?? []) {
        if (seenRoomEventIdsRef.current.has(event.id)) continue;
        seenRoomEventIdsRef.current.add(event.id);
        setRoomNotices((current) => [...current, event]);
      }
      roomLeaveSubmissionIdRef.current = null;
      void loadSnapshot();
    } catch (cause) {
      setRoomError(messageFrom(cause, "The scene could not end yet."));
      setEndFailed(true);
    } finally {
      setRoomBusy(false);
    }
  }, [loadSnapshot, room, roomBusy, roomDraft]);

  const leaveRoomPending = useCallback(async () => {
    if (!room?.id || leavingRoomPendingRef.current) return;
    leavingRoomPendingRef.current = true;
    setRoomBusy(true);
    try {
      await request("/rooms/leave-pending", { method: "POST", body: JSON.stringify({ sessionId: room.id }) });
      setRoomOpen(false);
      setRoom(null);
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setScreen("home");
      setEndFailed(false);
      void loadSnapshot();
    } catch (cause) {
      setRoomError(messageFrom(cause, "The visit could not be left yet."));
      leavingRoomPendingRef.current = false;
    } finally {
      setRoomBusy(false);
    }
  }, [loadSnapshot, room]);

  const discardRoomDebug = useCallback(async () => {
    if (!room?.id || !debugDiscardEnabled || roomBusy) return;
    if (
      !window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")
    )
      return;
    setRoomBusy(true);
    try {
      await request("/rooms/debug/discard", { method: "POST", body: JSON.stringify({ sessionId: room.id }) });
      setRoom(null);
      setRoomOpen(false);
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setRoomDraft("");
      setScreen("home");
      void loadSnapshot();
    } catch (cause) {
      setRoomError(messageFrom(cause, "The debug discard failed."));
    } finally {
      setRoomBusy(false);
    }
  }, [room, debugDiscardEnabled, roomBusy, loadSnapshot]);

  /**
   * Submit one speech or action turn in the current visit.
   *
   * Show the player's line while the server responds, then restore the draft if
   * the turn fails. The server writes the line only after it has a valid reply.
   *
   * The answer REPLACES the room rather than being appended to it: the server
   * returns the room it wrote, which already holds the player's line and every line
   * of the answer, and a client that merged the two would have to know the order
   * the calls came back in. The snapshot is re-read afterwards because a room can
   * move the hour's own record on — see the memory each of them files at the end.
   */
  const sendRoom = useCallback(async () => {
    const text = roomDraft.trim();
    if (room === null || !room.id || roomEnded || roomBusy || roomSendInFlightRef.current || text.length === 0) return;
    roomSendInFlightRef.current = true;
    const submissionId = roomSubmissionIdRef.current ?? createVillagesClientId();
    roomSubmissionIdRef.current = submissionId;
    const before = room;
    try {
      await request("/rooms/activity", { method: "POST", body: JSON.stringify({ sessionId: room.id }) });
    } catch (cause) {
      roomSendInFlightRef.current = false;
      const staleReason = staleVenueReason(cause);
      if (staleReason) {
        setRoom(null);
        setRoomOpen(false);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setLastSceneEnding(
          staleReason === "inactivity"
            ? "Interrupted: Inactivity. Your completed exchanges were saved in the visit archive."
            : "This visit ended while you were away. Its completed exchanges are in the visit archive.",
        );
        setScreen("home");
        void loadSnapshot();
      } else setRoomError(messageFrom(cause, "The visit could not be checked."));
      return;
    }
    const mine: RoomLine = {
      speakerId: "",
      name: "",
      role: "user",
      content: text,
      at: new Date().toISOString(),
    };
    setRoomBusy(true);
    setRoomError("");
    setRoomDraft("");
    setRoom({ ...room, lines: [...room.lines, mine] });
    try {
      const answer = await request<{
        session: RoomView;
        verdict: WishVerdict | null;
        action: { narration: string } | null;
        recordEvents: RoomRecordEvent[];
      }>("/rooms/turn", {
        method: "POST",
        body: JSON.stringify({
          sessionId: room.id,
          message: text,
          mode: roomMode,
          targetId: roomMode === "fulfill" ? roomTargetId : "",
          submissionId,
        }),
        signal: AbortSignal.timeout(300_000),
      });
      setRoom(currentRoom(answer.session));
      setRoomEnded(answer.session.status === "closed");
      if (answer.session.status === "closed") {
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
      } else
        for (const event of answer.recordEvents ?? []) {
          if (seenRoomEventIdsRef.current.has(event.id)) continue;
          seenRoomEventIdsRef.current.add(event.id);
          setRoomNotices((current) => [...current, event]);
        }
      if (roomTargetId && !answer.session.activeIds.includes(roomTargetId)) setRoomTargetId("");
      setRoomRuling(answer.verdict?.reason ?? "");
      setRoomMode("chat");
      roomSubmissionIdRef.current = null;
      setRoomGreetingNotice("");
      void loadSnapshot();
    } catch (cause) {
      const staleReason = staleVenueReason(cause);
      if (staleReason) {
        setRoom(null);
        setRoomOpen(false);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setLastSceneEnding(
          staleReason === "inactivity"
            ? "Interrupted: Inactivity. Your completed exchanges were saved in the visit archive."
            : "This visit ended while you were away. Its completed exchanges are in the visit archive.",
        );
        setScreen("home");
        void loadSnapshot();
        return;
      }
      setRoom(before);
      setRoomDraft(text);
      setRoomError(messageFrom(cause, "That line could not be sent."));
    } finally {
      roomSendInFlightRef.current = false;
      setRoomBusy(false);
    }
  }, [loadSnapshot, room, roomBusy, roomDraft, roomEnded, roomMode, roomTargetId]);

  /**
   * Everybody the village places in one place at this hour.
   *
   * Read off the villagers rather than off the place, because where somebody is
   * is the villager's own answer: a place holds whoever the hour sent there, and a
   * house holds the person who lives in it by exactly the same rule — being at
   * home is what an hour that named nowhere resolves to. So one lookup answers
   * both questions and no place has to be asked twice.
   */
  const standingAt = useCallback(
    (placeId: string): VillageVillagerView[] =>
      (snapshot?.villagers ?? []).filter((villager) => villager.place?.id === placeId),
    [snapshot],
  );

  /**
   * Look at a place rather than at whoever happens to be standing in it.
   *
   * The map opens View Venue first. From there the player can visit a space or
   * enter one of the dedicated editing pages without a model request.
   */
  const openPlace = useCallback((place: VillageVenue) => {
    setOpenPlaceId(null);
    setPlacesOpen(false);
    setVenueId(place.id);
    setVenuePage("view");
    setVenueVisitPickerOpen(false);
    setVenueEditDraft(null);
    setVenueProposalDraft(null);
    setScreen("venue");
  }, []);

  const greetRoom = useCallback(
    async (sessionId: string) => {
      setRoomBusy(true);
      setRoomError("");
      setRoomGreetingNotice("");
      try {
        const answer = await request<{ session: RoomView }>("/rooms/greet", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
          signal: AbortSignal.timeout(30_000),
        });
        setRoom(currentRoom(answer.session));
        void loadSnapshot();
      } catch (cause) {
        const recovered = await completedGreetingAfterFailure(sessionId);
        if (recovered) setRoom(recovered);
        else setRoomError(greetingFailureMessage(cause));
      } finally {
        setRoomBusy(false);
      }
    },
    [loadSnapshot],
  );

  const continueRoomWithoutGreeting = useCallback(async (sessionId: string) => {
    setRoomBusy(true);
    try {
      const { session } = await request<{ session: RoomView }>("/rooms/continue", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
        signal: AbortSignal.timeout(10_000),
      });
      setRoom(currentRoom(session));
      setRoomGreetingNotice(
        session.lines.length === 0 ? "The greeting failed. You can start the conversation now." : "",
      );
      setRoomError("");
    } catch (cause) {
      setRoomError(messageFrom(cause, "The visit could not continue. Retry or leave the venue."));
    } finally {
      setRoomBusy(false);
    }
  }, []);

  /** Visit starts one venue session with a fixed cast, including when the venue is empty. */
  const openRoom = useCallback(
    async (place: VillageVenue, spaceClass?: VenueClass, privateOwnerId = "") => {
      leavingRoomPendingRef.current = false;
      setOpenPlaceId(null);
      setPlacesOpen(false);
      setPlaceProblem(null);
      setRoomDraft("");
      setRoomEnded(false);
      setRoomError("");
      setRoomGreetingNotice("");
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setRoomBusy(true);
      setRoom({
        version: 1,
        id: "",
        placeId: place.id,
        placeName: place.name,
        startedAt: "",
        endedAt: "",
        status: "opening",
        activeIds: [],
        participants: [],
        lines: [],
      });
      setRoomOpen(true);
      setScreen("room");
      try {
        const { session } = await request<{ session: RoomView }>("/rooms", {
          method: "POST",
          body: JSON.stringify({ venueId: place.id, spaceClass, privateOwnerId }),
          signal: AbortSignal.timeout(20_000),
        });
        setRoom(currentRoom(session));
        setRoomMode("chat");
        setRoomTargetId("");
        setRoomRuling("");
        setLastSceneEnding("");
        setRoomOpen(true);
        void loadSnapshot();
        if (session.status === "opening") await greetRoom(session.id);
      } catch (cause) {
        setRoomError(messageFrom(cause, "That room could not be opened. Retry or leave the venue."));
      } finally {
        setRoomBusy(false);
      }
    },
    [greetRoom, loadSnapshot],
  );

  /**
   * Open a place's pin.
   *
   * THE MAP LEADS TO PLACES, and this is the press that says so. It used to be
   * that a villager's own house was a door into their conversation and every other
   * place on the map was decoration; a place is where the village's business
   * happens, so the pin is the door and the place decides what is behind it.
   *
   * Every place offers both its details and an entrance. When nobody is present,
   * Enter opens the place's own action view; otherwise it opens the shared room.
   */
  const openVenue = useCallback((place: VillageVenue) => {
    setPlacesOpen(false);
    setOpenPlaceId(place.id);
    setScreen("home");
  }, []);

  /**
   * Step back out of a place and onto the map.
   *
   * There is no state to unwind beyond the two fields, because standing in a place
   * sets nothing: the screen and the id are the whole of it, and the id is cleared
   * so a stale one cannot be drawn for a frame while the map comes back.
   */
  const leaveVenue = useCallback(() => {
    setVenueId(null);
    setVenuePage("view");
    setVenueVisitPickerOpen(false);
    setVenueEditDraft(null);
    setVenueProposalDraft(null);
    setOpenPlaceId(null);
    setScreen("home");
  }, []);

  const saveSettings = useCallback(async () => {
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({
            promptKnowledge: knowledgeDraft,
            playerPersonaId: personaDraft,
            setting: settingDraft,
            selectedLorebookIds: lorebookDraft,
            loreTokenBudget: loreTokenBudgetDraft,
          }),
        }),
      );
    } catch (cause) {
      setSettingsError(messageFrom(cause, "Those settings could not be saved."));
    } finally {
      setBusy(false);
    }
  }, [knowledgeDraft, lorebookDraft, loreTokenBudgetDraft, personaDraft, settingDraft]);

  /**
   * Save the automatic-update switches.
   *
   * These two settings are the only ones in the tab that are saved the moment
   * they are clicked rather than into a draft a button sends later, and the
   * reason is what they control. They are read by the server's own timer, which
   * has no idea whether this panel is open, so a switch waiting for a Save
   * press would leave the village doing the wrong thing for as long as the
   * panel was left sitting there. A checkbox is also read as already true the
   * moment it is clicked, in a way a text box is not, so the honest thing is to
   * make it true.
   *
   * Either half may be sent alone — the route writes only the fields it is
   * given — and the response carries the whole snapshot, so every switch is
   * redrawn from what was actually stored rather than from what was clicked.
   * That is what keeps a switch from showing a setting the village did not
   * accept.
   */
  const saveStoryPace = useCallback(async (storyPace: VillageStoryPace) => {
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", { method: "PATCH", body: JSON.stringify({ storyPace }) }),
      );
    } catch (cause) {
      setSettingsError(messageFrom(cause, "That could not be saved."));
    } finally {
      setBusy(false);
    }
  }, []);

  const saveVisitRetention = useCallback(async (visitRetention: VillageSettings["visitRetention"]) => {
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", { method: "PATCH", body: JSON.stringify({ visitRetention }) }),
      );
      setArchiveVersion((version) => version + 1);
    } catch (cause) {
      setSettingsError(messageFrom(cause, "Visit retention could not be saved."));
    } finally {
      setBusy(false);
    }
  }, []);

  /**
   * Ask the model for places again. Deliberately a separate button from Save:
   * the call is slow and can fail on its own, and its result replaces the
   * venue editor wholesale, which is a decision the player should make
   * explicitly rather than have happen on every save.
   */
  const suggestPlaces = useCallback(async () => {
    if (
      snapshot &&
      destinationPlaces(snapshot.settings.venues).length > 0 &&
      !window.confirm("Replace the current places with new suggestions? This removes places you created or approved.")
    )
      return;
    setBusy(true);
    setSettingsError("");
    try {
      const next = await request<{ places: Array<{ name: string; purpose: string }> }>("/bootstrap", {
        method: "POST",
      });
      // Suggestions stay in the editor until each description has been reviewed and saved.
      setVenuesDraft(
        next.places.map((place): VillageVenue => ({
          id: freshRowKey(),
          name: place.name,
          purpose: place.purpose,
          description: "",
          category: "public",
          presentation: { image: null, x: null, y: null },
          occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
          capabilities: [],
          state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
        })),
      );
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The village did not suggest any places."));
    } finally {
      setBusy(false);
    }
  }, [snapshot]);

  // ── Town map ───────────────────────────────────────────────────────────────
  const generateSetupTownMap = useCallback(async () => {
    if (setupSetting.trim().length === 0) {
      setSetupProblem("Write the Setting and Theme before generating its map.");
      return;
    }
    if (setupMapPrompt.trim().length === 0) {
      setSetupProblem("The DEBUG map layout prompt cannot be blank.");
      return;
    }
    setSetupMapBusy(true);
    setSetupProblem("");
    try {
      const generated = await request<{ image: string; width: number; height: number }>("/setup/town-map/generate", {
        method: "POST",
        body: JSON.stringify({
          structure: setupMapPrompt === snapshot?.settings.townMapLayoutPrompt ? undefined : setupMapPrompt,
          negative:
            setupMapNegativePrompt === snapshot?.settings.townMapNegativePrompt ? undefined : setupMapNegativePrompt,
          setting: setupSetting,
          options: setupMapOptions,
          selectedLorebookIds: setupLorebookDraft,
          scenarioImprint: snapshot?.isFounded
            ? { origin: "", worldFacts: setupWorldFacts, openingConditions: [], visualCues: [] }
            : setupFoundingReason === "none"
              ? null
              : setupImprint,
        }),
      });
      const measured = await measureImage(generated.image);
      if (measured.width !== generated.width || measured.height !== generated.height) {
        throw new Error("The generated map's reported dimensions do not match the image.");
      }
      setSetupMapImage(generated.image);
      setSetupMapImageSource("generate");
      setSetupMapGeneratedKey(setupMapGenerationKey);
      setSetupMapSize(measured);
      setSetupMapSource("generate");
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "The village map could not be generated."));
    } finally {
      setSetupMapBusy(false);
    }
  }, [
    setupLorebookDraft,
    setupMapNegativePrompt,
    setupMapPrompt,
    setupSetting,
    setupMapOptions,
    setupMapGenerationKey,
    setupImprint,
    setupWorldFacts,
    setupFoundingReason,
    snapshot?.isFounded,
    snapshot?.settings.townMapLayoutPrompt,
    snapshot?.settings.townMapNegativePrompt,
  ]);

  const suggestSetupVenueNames = useCallback(async () => {
    setSetupProblem("");
    setBusy(true);
    try {
      const result = await request<{ names: string[] }>("/setup/public-venue/names/suggest", {
        method: "POST",
        body: JSON.stringify({
          setting: setupSetting,
          selectedLorebookIds: setupLorebookDraft,
          loreTokenBudget: setupLoreTokenBudgetDraft,
        }),
      });
      setSetupNameSuggestions(result.names);
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "The village could not suggest names for the public venue."));
    } finally {
      setBusy(false);
    }
  }, [setupLorebookDraft, setupLoreTokenBudgetDraft, setupSetting]);

  const pickSetupTownMap = useCallback(
    async (file: File | undefined) => {
      if (!file || !snapshot) return;
      setSetupProblem("");
      const bytesThatFit = Math.floor(((snapshot.settings.townMapImageMaxLength - 64) * 3) / 4);
      if (file.size > bytesThatFit) {
        const mb = (bytes: number) => Math.round(bytes / 100_000) / 10;
        setSetupProblem(
          `That picture is ${mb(file.size)} MB and a village map holds ${mb(bytesThatFit)} MB. Choose a smaller copy.`,
        );
        return;
      }
      setSetupMapBusy(true);
      try {
        const image = await readFileAsDataUrl(file);
        const size = await measureImage(image);
        setSetupMapImage(image);
        setSetupMapImageSource("upload");
        setSetupMapSize(size);
        setSetupMapSource("upload");
      } catch (cause) {
        setSetupProblem(messageFrom(cause, "That picture could not be used as the village map."));
      } finally {
        setSetupMapBusy(false);
      }
    },
    [snapshot],
  );

  // The picture is stored whole, exactly as it was picked. Re-encoding a big
  // one down to fit would be the same mistake as truncating an over-long prompt
  // box, so a file that will not fit is refused with both sizes in the message
  // instead.
  const pickTownMap = useCallback(
    async (file: File | undefined) => {
      if (!file || !snapshot) return;
      setSettingsError("");
      // A base64 data URL is about a third larger than the bytes it carries, so
      // the stored limit is converted back to a file size once, here.
      const bytesThatFit = Math.floor(((snapshot.settings.townMapImageMaxLength - 64) * 3) / 4);
      if (file.size > bytesThatFit) {
        const mb = (bytes: number) => Math.round(bytes / 100_000) / 10;
        setSettingsError(
          `That picture is ${mb(file.size)} MB and the village map holds ${mb(bytesThatFit)} MB. Try a smaller copy.`,
        );
        return;
      }
      setBusy(true);
      try {
        const image = await readFileAsDataUrl(file);
        const size = await measureImage(image);
        setTownMapPick({ image, size });
        // A fresh picture opens on the fit that fills the frame, because that is
        // the one that leaves the frame looking like a map instead of like a
        // picture parked in a box, and the other two are one press away.
        setTownMapDraft(defaultView("cover"));
      } catch (cause) {
        setSettingsError(messageFrom(cause, "That picture could not be used as the town map."));
      } finally {
        setBusy(false);
      }
    },
    [snapshot],
  );

  /**
   * Write the map the panel is previewing.
   *
   * Whatever is on screen is what is written — the picture picked this visit, or
   * the one already saved when only its framing was changed — so the player is
   * never shown one thing and given another.
   */
  const saveTownMap = useCallback(async () => {
    if (!snapshot) return;
    const image = townMapPick ? townMapPick.image : townMapImage;
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({
            townMapImage: image,
            townMapView: townMapDraft ?? snapshot.settings.townMapView,
          }),
        }),
      );
      // Shown straight away rather than after the re-fetch below, so the map
      // does not blink back to the image-free surface between the two.
      setTownMapImage(image);
      setTownMapPick(null);
      setTownMapDraft(null);
      setReframingMap(false);
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The town map could not be saved."));
    } finally {
      setBusy(false);
    }
  }, [snapshot, townMapDraft, townMapImage, townMapPick]);

  /** Put the panel back the way it was: nothing picked, nothing changed. */
  const discardTownMapDraft = useCallback(() => {
    setTownMapPick(null);
    setTownMapDraft(null);
    setReframingMap(false);
    setSettingsError("");
  }, []);

  const clearTownMap = useCallback(async () => {
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", { method: "PATCH", body: JSON.stringify({ townMapImage: "" }) }),
      );
      // Shown straight away rather than after the re-fetch below, so the map
      // does not sit there looking set after it has been taken down.
      setTownMapImage("");
      discardTownMapDraft();
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The town map could not be taken down."));
    } finally {
      setBusy(false);
    }
  }, [discardTownMapDraft]);

  // ── Pictures of the places ─────────────────────────────────────────────────
  // These handlers serve player-requested draws, uploads, and removal. First
  // entry to a private space can also start one background draw on the server.
  //
  // The bytes never come back through here either. Both ways in upload to the
  // Engine's own gallery and hand back the address the picture landed at, which
  // is the whole of what the village stores — so twenty pictured places cost a
  // village twenty short strings and nothing else.
  //
  // No connection is named on these calls. The village's own choice, then the
  // agent's, then the Engine's own default is a chain the server resolves, and
  // repeating it here would be a second answer to a question already answered.

  /** Draw a picture for one place. The only path in this package that spends money. */
  const drawPlaceImage = useCallback(
    async (venueId: string, spaceClass?: VenueClass, privateOwnerId = "") => {
      if (placeBusyId) return;
      setPlaceBusyId(venueId);
      setPlaceProblem(null);
      setSettingsError("");
      try {
        setSnapshot(
          await request<VillageSnapshot>("/locations/venue/image", {
            method: "POST",
            body: JSON.stringify({ venueId, spaceClass, privateOwnerId }),
          }),
        );
      } catch (cause) {
        setPlaceProblem({ id: venueId, text: messageFrom(cause, "That place could not be drawn.") });
      } finally {
        setPlaceBusyId("");
      }
    },
    [placeBusyId],
  );

  /**
   * Keep a picture the player already has.
   *
   * The file is sent whole. Shrinking somebody's photograph to make it fit
   * would be the same mistake as truncating an over-long prompt box, so a file
   * that will not fit is refused here with both sizes in the message — and it
   * is refused before it is encoded, because a picture that is going to be
   * turned down should not first be made a third larger.
   */
  const keepPlaceImage = useCallback(
    async (venueId: string, file: File | undefined, spaceClass?: VenueClass, privateOwnerId = "") => {
      if (!file || !snapshot || placeBusyId) return;
      setPlaceBusyId(venueId);
      setPlaceProblem(null);
      setSettingsError("");
      try {
        const mb = (bytes: number) => Math.round(bytes / 100_000) / 10;
        if (file.size > snapshot.settings.maxVenueImageBytes) {
          setPlaceProblem({
            id: venueId,
            text: `That picture is ${mb(file.size)} MB and a place holds ${mb(
              snapshot.settings.maxVenueImageBytes,
            )} MB. Try a smaller copy.`,
          });
          return;
        }
        const image = await readFileAsDataUrl(file);
        setSnapshot(
          await request<VillageSnapshot>("/locations/venue/image", {
            method: "PUT",
            body: JSON.stringify({ venueId, image, spaceClass, privateOwnerId }),
          }),
        );
      } catch (cause) {
        setPlaceProblem({ id: venueId, text: messageFrom(cause, "That picture could not be kept.") });
      } finally {
        setPlaceBusyId("");
      }
    },
    [placeBusyId, snapshot],
  );

  /**
   * Stop showing a place's picture.
   *
   * The village is told, and the gallery is not. What was uploaded is a picture
   * in the player's own library now, and a village tidying up after itself by
   * deleting somebody's art from a folder they can see would be the village
   * deciding what an image is for. Everything under the Villages folder is
   * theirs to keep, reuse or throw away from the Engine's own gallery.
   */
  const dropPlaceImage = useCallback(
    async (venueId: string, spaceClass?: VenueClass, privateOwnerId = "") => {
      if (placeBusyId) return;
      setPlaceBusyId(venueId);
      setPlaceProblem(null);
      setSettingsError("");
      try {
        setSnapshot(
          await request<VillageSnapshot>("/locations/venue/image", {
            method: "DELETE",
            body: JSON.stringify({ venueId, spaceClass, privateOwnerId }),
          }),
        );
      } catch (cause) {
        setPlaceProblem({ id: venueId, text: messageFrom(cause, "That picture could not be taken away.") });
      } finally {
        setPlaceBusyId("");
      }
    },
    [placeBusyId],
  );

  // ── Houses on the map ──────────────────────────────────────────────────────
  // A house is a place: it is on the same list as the mill and the harbour, and
  // the map pins it the same way. What makes it a house is that it has a building
  // and somebody living in it — see `isHouse` — and a house nobody has moved into
  // yet is a normal thing for a village to have.
  const maxPlaces = snapshot?.settings.maxPlaces ?? 48;
  const setupMaxVillagerCount = snapshot?.settings.setupMaxVillagerCount ?? SETUP_MAX_VILLAGER_COUNT;
  /** The buildings a home may be, and what one is by default. The server owns both. */
  const homeBuildings = (snapshot?.settings.homeBuildings ?? []).map((building) => ({
    ...building,
    name: snapshot?.settings.homeBuildingNames?.[building.kind] ?? building.name,
  }));
  /**
   * How many places the village will take right now.
   *
   * Founding is the one exception, and it is an exception about the request
   * rather than about the village: the server refuses any house count but
   * one player home plus the maximum initial Villager homes while the wizard is open,
   * so that is the ceiling until the
   * village exists. Afterwards it is the village's standing ceiling.
   */
  const placeLimit = snapshot && !snapshot.isFounded ? 1 + setupMaxVillagerCount : maxPlaces;

  /**
   * How many houses it could still take, which is the places left over after the
   * ones that are not houses.
   *
   * Counted against the one ceiling rather than against an allowance of its own,
   * because a separate allowance for roofs is the two-list model growing back
   * under a new name. A house spends a place like anything else.
   */
  const houseLimit = Math.max(0, placeLimit - destinationPlaces(snapshot?.settings.venues ?? []).length);

  /**
   * How many places the village holds with the draft list in it, which is what the
   * ceiling is really checked against: the houses the village has, plus the
   * destinations as the panel currently has them. One count for one list, because
   * a house spends a place like anything else does.
   */
  const placeCount =
    (snapshot?.settings.venues.length ?? 0) +
    venuesDraft.filter((draft) => !snapshot?.settings.venues.some((saved) => saved.id === draft.id)).length;

  /**
   * Hold the houses the village has as drafts.
   *
   * Handed the whole place list rather than a list of houses, because that is what
   * the village sends and picking the houses out is this side's business — see
   * `housePlaces`. Seeding the drafts from the record in the record's own order is
   * also what lets `homesMatch` compare the two by position.
   */
  const seedHomes = useCallback((places: readonly VillageVenue[]) => {
    const houses = housePlaces(places);
    setHomesDraft(
      houses.map((house) => ({
        id: house.id,
        name: house.name,
        form: house.form ?? "Home",
        description: house.description,
        x: house.presentation.x,
        y: house.presentation.y,
        building: house.occupancy.homeKind,
        isPlayerHome: house.occupancy.playerHome,
        characterId: house.occupancy.residentCharacterId,
      })),
    );
    setActiveHomeId(houses[0]?.id ?? null);
    setPlacingHome(false);
  }, []);

  /** Open the houses editor in the Menu, seeded from what is saved. */
  const openHomes = useCallback(() => {
    setSettingsError("");
    if (snapshot) seedHomes(snapshot.settings.venues);
    setMenuSection("village");
    setMenuTab("homes");
    setScreen("menu");
  }, [seedHomes, snapshot]);

  /**
   * Drop a pin where the player clicked.
   *
   * The first home placed is the player's own: the flow asks for one house of
   * yours and three for villagers, and "the first spot you mark is where you
   * live" is one less thing to explain. Every one after that belongs to whoever
   * is given it.
   */
  const placeHome = useCallback(
    (x: number, y: number) => {
      setSettingsError("");
      if (homesDraft.length >= houseLimit || homesDraft.length >= 1 + setupMaxVillagerCount) return;
      const id = freshRowKey();
      const isPlayerHome = homesDraft.length === 0;
      setHomesDraft((rows) => [
        ...rows,
        {
          id,
          name: isPlayerHome ? "Your residence" : `Residence ${rows.length + 1}`,
          form: "Home",
          description: "",
          x,
          y,
          building: null,
          isPlayerHome,
          characterId: null,
        },
      ]);
      setActiveHomeId(id);
    },
    [homesDraft.length, houseLimit, setupMaxVillagerCount],
  );

  const placeSetupPin = useCallback(
    (
      x: number,
      y: number,
      pictureSize?: { width: number; height: number; photoWidth: number; photoHeight: number },
    ) => {
      const center = setupVenues.find((venue) => venue.category === "public-center");
      const movingId = movingSetupVenueId ?? (placingPublicCenter ? center?.id : undefined);
      if (
        foundingPhotoOverlaps(
          { x, y },
          setupVenues.filter((venue) => venue.id !== movingId).map((venue) => venue.presentation),
          pictureSize ?? { width: 1000, height: 700, photoWidth: 58, photoHeight: 58 },
        )
      ) {
        setSetupPlacementError("That photograph would cover another venue. Place it a little to the side.");
        return;
      }
      setSetupPlacementError("");
      if (movingId) {
        setSetupVenues((rows) =>
          rows.map((row) => (row.id === movingId ? { ...row, presentation: { ...row.presentation, x, y } } : row)),
        );
        setSelectedSetupVenueId(movingId);
      } else if (placingPublicCenter) {
        const venue = newSetupVenue(freshRowKey(), "gathering", x, y);
        setSetupVenues((rows) => [...rows, venue]);
        setSelectedSetupVenueId(venue.id);
      } else if (placingHome) {
        const residences = setupVenues.filter((venue) => venue.classes?.includes("residence"));
        if (residences.length >= 1 + setupMaxVillagerCount) return;
        const venue = newSetupVenue(freshRowKey(), "residence", x, y, residences.length === 0, residences.length + 1);
        setSetupVenues((rows) => [...rows, venue]);
        setSelectedSetupVenueId(venue.id);
      }
      setMovingSetupVenueId(null);
      setPlacingHome(false);
      setPlacingPublicCenter(false);
    },
    [movingSetupVenueId, placingHome, placingPublicCenter, setupMaxVillagerCount, setupVenues],
  );

  const patchSetupVenue = useCallback((id: string, next: (venue: SetupVenueDraft) => SetupVenueDraft) => {
    setSetupVenues((rows) => rows.map((row) => (row.id === id ? next(row) : row)));
  }, []);

  const removeSetupVenue = useCallback((id: string) => {
    setSetupVenues((rows) => {
      const kept = rows.filter((row) => row.id !== id);
      if (!kept.some((row) => row.occupancy.playerHome)) {
        const index = kept.findIndex((row) => row.classes?.includes("residence"));
        if (index >= 0)
          kept[index] = {
            ...kept[index]!,
            occupancy: { ...kept[index]!.occupancy, playerHome: true, residentCharacterId: null },
            residentIds: [],
          };
      }
      return kept;
    });
    setSelectedSetupVenueId((current) => (current === id ? null : current));
    setSetupTextDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);

  /**
   * A spot picked on the map from the homes editor.
   *
   * The editor is a list and the list cannot also be the map, so the player is
   * handed the map to mark one house and then handed straight back to the list
   * with the new row on it. One house per trip: each one is a house they get to
   * see land.
   */
  const placeHomeOnMap = useCallback(
    (x: number, y: number) => {
      placeHome(x, y);
      setPlacingHome(false);
      setScreen("menu");
    },
    [placeHome],
  );

  const patchHome = useCallback(
    (id: string, patch: Partial<HomeDraft>) => {
      if (snapshot?.settings.venues.some((venue) => venue.id === id && venue.occupancy.residentCharacterId)) return;
      setHomesDraft((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
    },
    [snapshot],
  );

  const removeHome = useCallback(
    (id: string) => {
      if (snapshot?.settings.venues.some((venue) => venue.id === id && venue.occupancy.residentCharacterId)) {
        setSettingsError("Move the resident to another venue before removing this home.");
        return;
      }
      setHomesDraft((rows) => {
        const kept = rows.filter((row) => row.id !== id);
        // A village with no house of your own is not a village anyone lives in,
        // so the role passes to the first house still standing.
        if (kept.length > 0 && !kept.some((row) => row.isPlayerHome)) {
          kept[0] = { ...kept[0], isPlayerHome: true, characterId: null };
        }
        return kept;
      });
    },
    [snapshot],
  );

  /**
   * Save the houses.
   *
   * The village keeps one place list, so the write is the whole list: the houses
   * the editor has been moving, and the destinations exactly as the village already
   * had them. Sending only the houses would be asking the server to work out what
   * to do with the other half, and the answer it would reach for is the one the
   * founding wizard gets — that the player is drawing a new map — which is right
   * there and wrong here.
   */
  const saveHomes = useCallback(async () => {
    if (!snapshot) return;
    if (homesDraft.some((home) => !home.description.trim())) {
      setSettingsError("Review a description for every home before saving.");
      return;
    }
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(
        await request<VillageSnapshot>("/settings", {
          method: "PATCH",
          body: JSON.stringify({ venues: withHouseDraft(snapshot.settings.venues, homesDraft), venueScope: "homes" }),
        }),
      );
      setPlacingHome(false);
    } catch (cause) {
      setSettingsError(messageFrom(cause, "Those homes could not be saved."));
    } finally {
      setBusy(false);
    }
  }, [homesDraft, snapshot]);

  const generateHomeDescription = async (home: HomeDraft) => {
    if (!snapshot) return;
    const resident = snapshot.villagers.find((entry) => entry.characterId === home.characterId)?.name;
    const name = home.isPlayerHome
      ? `${playerDisplayName(snapshot)}'s home`
      : resident
        ? `${resident}'s home`
        : buildingOf(homeBuildings, home.building).name;
    setBusy(true);
    setSettingsError("");
    try {
      const result = await request<{ descriptions: Record<string, string> }>("/locations/venue/descriptions/draft", {
        method: "POST",
        body: JSON.stringify({
          venues: [
            {
              id: home.id,
              name,
              purpose: home.isPlayerHome ? "Player residence" : resident ? `Home of ${resident}` : "Available home",
              homeKind: home.building,
            },
          ],
        }),
      });
      patchHome(home.id, { description: result.descriptions[home.id] ?? "" });
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The home description could not be generated. You can write it by hand."));
    } finally {
      setBusy(false);
    }
  };

  // ── Founding the village ───────────────────────────────────────────────────
  // Three questions, asked in the order they have to be answered: what the
  // village is, where its houses stand, and who lives in them. Nothing is
  // written until the last one, so a half-answered setup leaves no village
  // claiming to exist.

  const chooseSetupScenario = (value: FoundingScenarioId) => {
    if (snapshot?.isFounded) return;
    if (value === setupFoundingReason) return;
    const nextGuidance = setupScenarioGuidanceDrafts[value] ?? "";
    setSetupScenarioGuidanceDrafts((drafts) => ({ ...drafts, [setupFoundingReason]: setupFoundingGuidance }));
    setSetupFoundingReason(value);
    setSetupFoundingDetails(foundingScenario(value).premise);
    setSetupFoundingGuidance(value === "none" ? "" : nextGuidance);
    setSetupImprint(emptyScenarioImprint());
    setSetupImprintApprovedKey("");
    setSetupTextDrafts({});
    setSetupProblem("");
  };

  const draftSetupImprint = async () => {
    const sourceKey = setupImprintSourceKey;
    setBusy(true);
    setSetupImprintBusy(true);
    setSetupProblem("");
    try {
      const result = await request<{ imprint: ScenarioImprint }>("/setup/scenario-imprint/draft", {
        method: "POST",
        body: JSON.stringify({
          foundingReason: setupFoundingReason,
          foundingDetails: setupFoundingDetails,
          foundingGuidance: setupFoundingGuidance,
          setting: setupSetting,
          selectedLorebookIds: setupLorebookDraft,
          loreTokenBudget: setupLoreTokenBudgetDraft,
        }),
      });
      if (setupImprintSourceKeyRef.current === sourceKey) {
        setSetupImprint(result.imprint);
        setSetupImprintApprovedKey("");
        setSetupTextDrafts({});
      }
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "The Scenario imprint could not be drafted. You can write it yourself."));
    } finally {
      setSetupImprintBusy(false);
      setBusy(false);
    }
  };

  const editSetupImprintLines = (key: "worldFacts" | "openingConditions" | "visualCues", value: string) => {
    setSetupImprint((current) => ({ ...current, [key]: value.split(/\r?\n/u) }));
    setSetupImprintApprovedKey("");
  };

  const approveSetupImprint = () => {
    const imprint: ScenarioImprint = {
      origin: setupImprint.origin.trim(),
      worldFacts: setupImprint.worldFacts.map((line) => line.trim()).filter(Boolean),
      openingConditions: setupImprint.openingConditions.map((line) => line.trim()).filter(Boolean),
      visualCues: setupImprint.visualCues.map((line) => line.trim()).filter(Boolean),
    };
    const lists = [
      [imprint.worldFacts, 160],
      [imprint.openingConditions, 160],
      [imprint.visualCues, 120],
    ] as const;
    if (
      (!imprint.origin && !lists.some(([lines]) => lines.length)) ||
      imprint.origin.length > 400 ||
      lists.some(([lines, limit]) => lines.length > 4 || lines.some((line) => line.length > limit))
    ) {
      setSetupProblem("Add an origin or starting detail. Use at most four short lines in each list.");
      return;
    }
    setSetupImprint(imprint);
    setSetupImprintApprovedKey(setupImprintSourceKey);
    setSetupTextDrafts({});
    setSetupProblem("");
  };

  /**
   * Open the wizard.
   *
   * `fresh` hands it an empty village, which is what "start over" needs. Without
   * it the wizard is seeded from the village as it stands, so running setup
   * again is a chance to redraw the map rather than a second chance to lose it.
   */
  const openSetup = useCallback(
    (fresh: boolean, village: VillageSnapshot | null) => {
      setSettingsError("");
      setSetupProblem("");
      setImageConnectionWarning(false);
      setImageWarningOpen(false);
      setResetArmed(false);
      setPickerOpen(false);
      setSearch("");
      setSetupStep(0);
      setSetupName(fresh ? "" : (village?.village.name ?? ""));
      setSetupSetting(fresh ? "" : (village?.village.setting ?? ""));
      const storedReason = fresh ? "" : (village?.settings.foundingReason ?? "");
      const isCurrentScenario = FOUNDING_SCENARIOS.some((scenario) => scenario.value === storedReason);
      const reason: FoundingScenarioId = isCurrentScenario
        ? (storedReason as FoundingScenarioId)
        : storedReason
          ? "custom"
          : "rebuild";
      const legacyReason = LEGACY_FOUNDING_REASONS[storedReason] ?? storedReason;
      const savedDetails = village?.settings.foundingDetails ?? "";
      const legacyPremise = [legacyReason, savedDetails].filter(Boolean).join(" ");
      const legacyOverflow = legacyPremise.length > (village?.settings.foundingDetailsMaxLength ?? 500);
      const details = village?.isFounded
        ? savedDetails
        : storedReason && !isCurrentScenario
          ? legacyOverflow
            ? savedDetails
            : legacyPremise
          : fresh || !storedReason
            ? foundingScenario(reason).premise
            : savedDetails;
      const guidance = fresh
        ? ""
        : village?.isFounded
          ? (village.settings.foundingGuidance ?? "")
          : [legacyOverflow ? legacyReason : "", village?.settings.foundingGuidance ?? ""].filter(Boolean).join(" ");
      setSetupFoundingReason(reason);
      setSetupFoundingDetails(details);
      setSetupFoundingGuidance(reason === "none" ? "" : guidance);
      setSetupImprint(fresh ? emptyScenarioImprint() : (village?.settings.scenarioImprint ?? emptyScenarioImprint()));
      setSetupWorldFacts(fresh ? [] : (village?.settings.worldFacts ?? []));
      setSetupImprintApprovedKey("");
      setSetupScenarioGuidanceDrafts({ [reason]: guidance });
      setSetupNameSuggestions([]);
      const foundingPlaces =
        fresh || !village
          ? []
          : village.settings.venues.filter(
              (venue) => venue.classes?.includes("residence") || venue.category === "public-center",
            );
      setSetupVenues(foundingPlaces.map((venue) => ({ ...venue, guidance: "" })));
      setSelectedSetupVenueId(foundingPlaces[0]?.id ?? null);
      setMovingSetupVenueId(null);
      setSetupTextDrafts({});
      setSetupImageDraft(null);
      setSetupPlacementError("");
      setSetupLorebookDraft(fresh ? [] : (village?.settings.selectedLorebookIds ?? []));
      setSetupLoreTokenBudgetDraft(fresh ? 1600 : (village?.settings.loreTokenBudget ?? 1600));
      setSetupMapOptions({ ...DEFAULT_TOWN_MAP_OPTIONS });
      setSetupMapSource(fresh ? "generate" : village?.settings.townMapImageSetAt ? "existing" : "none");
      setSetupMapImage("");
      setSetupMapImageSource(null);
      setSetupMapGeneratedKey("");
      setSetupMapSize(null);
      setSetupMapPrompt(village?.settings.townMapLayoutPrompt ?? "");
      setSetupMapNegativePrompt(village?.settings.townMapNegativePrompt ?? "");
      setSetupMapBusy(false);
      // Coming back through the wizard over a village that already exists keeps
      // the Persona it is linked to, exactly as it keeps the name and the
      // setting: the second run is a chance to redraw the map, not to be told
      // something new about yourself by accident.
      setPersonaDraft(fresh ? "" : (village?.settings.playerPersonaId ?? ""));
      // Load the Persona and lorebook choices as the wizard opens so their
      // respective steps are ready when the player reaches them.
      void loadPersonas();
      void loadLorebooks();
      // The wizard places houses, so it is handed the places and picks the houses
      // out itself — see `seedHomes`.
      seedHomes(fresh || !village ? [] : village.settings.venues);
      setScreen("setup");
    },
    [loadLorebooks, loadPersonas, seedHomes],
  );

  const gotoSetupStep = useCallback(
    (step: number) => {
      if (setupFoundingReason === "none" && setupStep === 2 && step === 3) step = 4;
      if (setupFoundingReason === "none" && setupStep === 4 && step === 3) step = 2;
      if (setupStep === 0 && step > 0) {
        if (setupName.trim().length === 0) {
          setSetupProblem("Give the village a name before continuing.");
          return;
        }
        if (!snapshot?.isFounded && setupFoundingReason !== "none" && !setupFoundingDetails.trim()) {
          setSetupProblem("Write a scenario premise, or choose No scenario.");
          return;
        }
      }
      if (setupStep === 1 && step > 1) {
        if (!personaDraft.trim()) {
          setSetupProblem("Choose the Persona who lives in this village.");
          return;
        }
        if (!personas?.some((persona) => persona.id === personaDraft)) {
          setSetupProblem("That Persona is no longer in your library. Choose another one to continue.");
          return;
        }
        if (connectionSetupProblem.length > 0) {
          setSetupProblem(connectionSetupProblem);
          return;
        }
        if (imageConnectionWarning) {
          setImageWarningOpen(true);
          return;
        }
      }
      if (setupStep === 2 && step > 2) {
        if (setupSetting.trim().length === 0) {
          setSetupProblem("Write the Setting and Theme before continuing.");
          return;
        }
      }
      if (setupStep === 3 && step > 3 && !snapshot?.isFounded && setupFoundingReason !== "none") {
        if (setupImprintApprovedKey !== setupImprintSourceKey) {
          setSetupProblem("Review and approve the Scenario imprint before drawing the map.");
          return;
        }
      }
      if (setupStep === 4 && step > 4) {
        if (setupMapSource !== "none" && !setupMapSrc) {
          setSetupProblem(
            setupMapSource === "generate"
              ? "Generate the map, or choose an upload or no background image."
              : "Choose a map image, or select no background image.",
          );
          return;
        }
      }
      if (setupStep === 5 && step > 5) {
        const residences = setupVenues.filter((venue) => venue.classes?.includes("residence"));
        const villagerHomes = residences.filter((venue) => !venue.occupancy.playerHome);
        const villagerHomeCount = villagerHomes.length;
        if (
          !residences.some((venue) => venue.occupancy.playerHome) ||
          villagerHomeCount < SETUP_MIN_VILLAGER_COUNT ||
          villagerHomeCount > SETUP_MAX_VILLAGER_COUNT ||
          !setupVenues.some((venue) => venue.category === "public-center")
        ) {
          setSetupProblem(
            "Place your home, one to three homes for initial villagers, and a named public meeting location.",
          );
          return;
        }
        if (
          setupVenues.some(
            (venue) =>
              !venue.name.trim() ||
              !venue.form?.trim() ||
              !venue.description.trim() ||
              !venue.spaces?.[0]?.description.trim(),
          )
        ) {
          setSetupProblem("Give every venue a name, form, exterior description, and scene description before review.");
          return;
        }
        const assigned = villagerHomes.map((venue) => venue.occupancy.residentCharacterId).filter(Boolean);
        if (assigned.length !== villagerHomes.length || new Set(assigned).size !== assigned.length) {
          setSetupProblem("Assign a different villager to each villager Residence before review.");
          return;
        }
      }
      setImageWarningOpen(false);
      setSetupProblem("");
      setSetupStep(step);
      // The build step assigns homes from the library, so the library is only read
      // when that step is reached.
      if (step === 1) void loadPersonas();
      if (step === 2) void loadLorebooks();
      if (step === 5) void loadCatalog();
      setPlacingHome(false);
      setPlacingPublicCenter(false);
      setMovingSetupVenueId(null);
    },
    [
      connectionSetupProblem,
      setupVenues,
      imageConnectionWarning,
      loadCatalog,
      loadPersonas,
      loadLorebooks,
      personaDraft,
      personas,
      setupMapSource,
      setupMapSrc,
      setupName,
      setupFoundingReason,
      setupFoundingDetails,
      setupImprintApprovedKey,
      setupImprintSourceKey,
      snapshot?.isFounded,
      setupSetting,
      setupStep,
    ],
  );

  const acknowledgeImageWarning = useCallback(() => {
    setImageWarningOpen(false);
    setSetupProblem("");
    setSetupStep(2);
    setPlacingHome(false);
    setPlacingPublicCenter(false);
  }, []);

  const returnToImageSetup = useCallback(() => {
    setImageWarningOpen(false);
    setSetupProblem("");
  }, []);

  const selectedSetupVenue = setupVenues.find((venue) => venue.id === selectedSetupVenueId) ?? null;
  const selectedSetupSpace = selectedSetupVenue
    ? venueSpaceFor(selectedSetupVenue, selectedSetupVenue.category === "public-center" ? "gathering" : "residence")
    : null;

  const setupDraftRow = (venue: SetupVenueDraft) => ({
    id: venue.id,
    name: venue.name,
    form: venue.form ?? "",
    purpose: venue.purpose,
    description: venue.description,
    spaceDescription: venue.spaces?.[0]?.description ?? "",
    venueClass: venue.classes?.includes("gathering") ? "gathering" : "residence",
    residentCharacterId: venue.occupancy.residentCharacterId ?? "",
    guidance: venue.guidance,
  });

  const generateSetupText = async (venues: SetupVenueDraft[]) => {
    if (!venues.length || setupVenueBusy) return;
    const sourceKey = setupImprintSourceKey;
    setSetupVenueBusy(true);
    setSetupProblem("");
    try {
      const result = await request<{ drafts: Record<string, SetupTextDraft> }>("/setup/venues/draft", {
        method: "POST",
        body: JSON.stringify({
          setting: setupSetting,
          foundingReason: setupFoundingReason,
          foundingDetails: setupFoundingDetails,
          foundingGuidance: setupFoundingGuidance,
          scenarioImprint: snapshot?.isFounded || setupFoundingReason === "none" ? null : setupImprint,
          worldFacts: snapshot?.isFounded ? setupWorldFacts : [],
          selectedLorebookIds: setupLorebookDraft,
          loreTokenBudget: setupLoreTokenBudgetDraft,
          venues: venues.map(setupDraftRow),
        }),
      });
      if (setupImprintSourceKeyRef.current === sourceKey)
        setSetupTextDrafts((current) => ({ ...current, ...result.drafts }));
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "Venue text could not be drafted."));
    } finally {
      setSetupVenueBusy(false);
    }
  };

  const applySetupText = (id: string, replace: boolean) => {
    const draft = setupTextDrafts[id];
    if (!draft) return;
    patchSetupVenue(id, (venue) => {
      const fill = (before: string, after: string, placeholder = "") =>
        replace || !before.trim() || before === placeholder ? after || before : before;
      const space = venueSpaceFor(venue, venue.classes?.includes("gathering") ? "gathering" : "residence");
      const items = (before: string[], after: string[]) =>
        replace || before.length === 0 ? (after ?? before) : before;
      return {
        ...venue,
        name: fill(
          venue.name,
          draft.name,
          venue.category === "public-center"
            ? "Gathering Place"
            : venue.occupancy.playerHome
              ? "Your residence"
              : `Residence ${setupVenues.filter((entry) => entry.classes?.includes("residence")).findIndex((entry) => entry.id === venue.id) + 1}`,
        ),
        form: fill(venue.form ?? "", draft.form, venue.category === "public-center" ? "Gathering place" : "Home"),
        purpose: fill(venue.purpose, draft.purpose),
        description: fill(venue.description, draft.description),
        spaces: [
          {
            ...space,
            description: fill(space.description, draft.spaceDescription),
            state: {
              ...space.state,
              condition: fill(space.state.condition, draft.condition),
              items: items(space.state.items, draft.items),
              publicFacts: items(space.state.publicFacts, draft.publicFacts),
              features: items(
                space.state.features.map((feature) => feature.text),
                draft.features,
              ).map((text, index) => ({
                id: space.state.features[index]?.id ?? freshRowKey(),
                text,
                sourceCharacterId: "",
                locked: space.state.features[index]?.locked ?? false,
                updatedAt: "",
              })),
            },
          },
        ],
      };
    });
    setSetupTextDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const generateSetupImage = async (venue: SetupVenueDraft, area: "exterior" | "interior") => {
    if (setupVenueBusy) return;
    const sourceKey = setupImprintSourceKey;
    setSetupVenueBusy(true);
    setSetupProblem("");
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image/generate", {
        method: "POST",
        body: JSON.stringify({
          venue: setupDraftRow(venue),
          area,
          villageName: setupName,
          setting: setupSetting,
          scenarioImprint: snapshot?.isFounded || setupFoundingReason === "none" ? null : setupImprint,
          worldFacts: snapshot?.isFounded ? setupWorldFacts : [],
          selectedLorebookIds: setupLorebookDraft,
        }),
      });
      if (setupImprintSourceKeyRef.current === sourceKey) setSetupImageDraft({ venueId: venue.id, area, image });
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "Venue art could not be generated."));
    } finally {
      setSetupVenueBusy(false);
    }
  };

  const uploadSetupImage = async (venue: SetupVenueDraft, area: "exterior" | "interior", file?: File) => {
    if (!file || setupVenueBusy) return;
    if (file.size > (snapshot?.settings.maxVenueImageBytes ?? 8_000_000)) {
      setSetupProblem("That venue image is too large. Choose a smaller file.");
      return;
    }
    setSetupVenueBusy(true);
    setSetupProblem("");
    try {
      const image = await request<VillageVenueImage>("/setup/venue-image", {
        method: "PUT",
        body: JSON.stringify({ name: venue.name, image: await readFileAsDataUrl(file) }),
      });
      setSetupImageDraft({ venueId: venue.id, area, image });
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "That venue image could not be uploaded."));
    } finally {
      setSetupVenueBusy(false);
    }
  };

  const useSetupImage = () => {
    if (!setupImageDraft) return;
    const { venueId, area, image } = setupImageDraft;
    patchSetupVenue(venueId, (venue) =>
      area === "exterior"
        ? { ...venue, presentation: { ...venue.presentation, image } }
        : {
            ...venue,
            spaces: [
              { ...venueSpaceFor(venue, venue.classes?.includes("gathering") ? "gathering" : "residence"), image },
            ],
          },
    );
    setSetupImageDraft(null);
  };

  /** Why the wizard cannot finish yet, or "" when it can. Checked here as well as on the server so the player is told before a request is made. */
  const setupBlocker = useCallback((): string => {
    if (setupName.trim().length === 0) return "Give the village a name.";
    if (personaDraft.trim().length === 0) return "Choose the Persona who lives in this village.";
    if (!snapshot?.isFounded && setupFoundingReason !== "none" && !setupFoundingDetails.trim())
      return "Write a scenario premise.";
    const presentFacts = setupWorldFacts.map((line) => line.trim()).filter(Boolean);
    if (snapshot?.isFounded && (presentFacts.length > 4 || presentFacts.some((line) => line.length > 160)))
      return "Use at most four current world facts of 160 characters each.";
    if (!snapshot?.isFounded && setupFoundingReason !== "none" && setupImprintApprovedKey !== setupImprintSourceKey)
      return "Review and approve the Scenario imprint.";
    if (setupSetting.trim().length === 0) return "Write the Setting and Theme.";
    if (setupMapSource !== "none" && !setupMapSrc) return "Choose, generate, or upload the village map.";
    const residences = setupVenues.filter((venue) => venue.classes?.includes("residence"));
    const villagerHomes = residences.filter((venue) => !venue.occupancy.playerHome);
    if (villagerHomes.length < SETUP_MIN_VILLAGER_COUNT || villagerHomes.length > SETUP_MAX_VILLAGER_COUNT) {
      return "Place one to three homes for initial villagers.";
    }
    if (!residences.some((venue) => venue.occupancy.playerHome)) return "One Residence has to be yours.";
    if (
      setupVenues.some(
        (venue) =>
          !venue.name.trim() ||
          !venue.form?.trim() ||
          !venue.description.trim() ||
          !venue.spaces?.[0]?.description.trim(),
      )
    )
      return "Give every venue a name, Form, exterior description, and scene description in Step 6.";
    const occupants = villagerHomes
      .map((home) => home.occupancy.residentCharacterId)
      .filter((id): id is string => id !== null);
    if (occupants.length !== villagerHomes.length) return "Choose who lives in each villager home.";
    if (new Set(occupants).size !== occupants.length) return "A villager can only live in one house.";
    if (setupVenues.filter((venue) => venue.category === "public-center").length !== 1)
      return "Place one Gathering Place.";
    return "";
  }, [
    setupVenues,
    personaDraft,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupFoundingReason,
    setupFoundingDetails,
    setupImprintApprovedKey,
    setupImprintSourceKey,
    snapshot?.isFounded,
    setupWorldFacts,
    setupSetting,
  ]);

  const foundVillage = useCallback(async () => {
    const blocker = setupBlocker();
    if (blocker) {
      setSetupProblem(blocker);
      return;
    }
    setBusy(true);
    setSetupProblem("");
    try {
      const founded = await request<VillageSnapshot>("/setup", {
        method: "POST",
        body: JSON.stringify({
          name: setupName.trim(),
          setting: setupSetting.trim(),
          foundingReason: snapshot?.isFounded ? snapshot.settings.foundingReason : setupFoundingReason,
          foundingDetails: snapshot?.isFounded ? snapshot.settings.foundingDetails : setupFoundingDetails.trim(),
          foundingGuidance: snapshot?.isFounded ? snapshot.settings.foundingGuidance : setupFoundingGuidance.trim(),
          scenarioImprint: snapshot?.isFounded
            ? snapshot.settings.scenarioImprint
            : setupFoundingReason === "none"
              ? null
              : setupImprint,
          worldFacts: snapshot?.isFounded
            ? setupWorldFacts.map((line) => line.trim()).filter(Boolean)
            : setupFoundingReason === "none"
              ? []
              : setupImprint.worldFacts,
          selectedLorebookIds: setupLorebookDraft,
          loreTokenBudget: setupLoreTokenBudgetDraft,
          playerPersonaId: personaDraft,
          townMapImage: setupMapSrc ?? "",
          townMapView: setupMapSource === "existing" ? savedTownMapView : defaultView("cover"),
          // Founding is authoritative: submit the complete graph, including
          // the named public center, rather than relying on stored destinations.
          venues: setupVenues,
        }),
      });
      setSnapshot(founded);
      setPlacingHome(false);
      setScreen(
        !snapshot?.isFounded ||
          founded.foundingPreparation?.status === "pending" ||
          founded.foundingPreparation?.status === "failed"
          ? "preparing"
          : "home",
      );
    } catch (cause) {
      setSetupProblem(messageFrom(cause, "The village could not be founded."));
    } finally {
      setBusy(false);
    }
  }, [
    snapshot?.isFounded,
    snapshot?.settings.foundingReason,
    snapshot?.settings.foundingDetails,
    snapshot?.settings.foundingGuidance,
    snapshot?.settings.scenarioImprint,
    setupVenues,
    personaDraft,
    savedTownMapView,
    setupBlocker,
    setupMapSource,
    setupMapSrc,
    setupName,
    setupFoundingReason,
    setupFoundingDetails,
    setupFoundingGuidance,
    setupImprint,
    setupWorldFacts,
    setupLorebookDraft,
    setupLoreTokenBudgetDraft,
    setupSetting,
  ]);

  /** The destructive half of the pair the General settings panel offers. */
  const startOver = useCallback(async () => {
    setBusy(true);
    setSettingsError("");
    try {
      const next = await request<VillageSnapshot>("/setup/reset", { method: "POST" });
      setSnapshot(next);
      setCatalog(null);
      // The offer to found the village is made again by hand: the player asked
      // for the wizard by asking to start over.
      openSetup(true, next);
    } catch (cause) {
      setSettingsError(messageFrom(cause, "The village could not be reset."));
    } finally {
      setBusy(false);
      setResetArmed(false);
    }
  }, [openSetup]);

  // A village that has not been founded opens the wizard by itself, because
  // there is nothing a homepage could usefully show yet. Only once: a player who
  // backs out to look at the bare map is not asking to be sent back in on every
  // snapshot that arrives afterwards.
  const setupOfferedRef = useRef(false);
  useEffect(() => {
    if (!snapshot || setupOfferedRef.current) return;
    setupOfferedRef.current = true;
    if (!snapshot.isFounded) openSetup(false, snapshot);
    else if (snapshot.foundingPreparation && snapshot.foundingPreparation.status !== "ready") setScreen("preparing");
  }, [openSetup, snapshot]);

  useEffect(() => {
    if (screen !== "preparing") return;
    let cancelled = false;
    const poll = async () => {
      try {
        const next = await request<VillageSnapshot>("/setup/preparation");
        if (cancelled) return;
        setSnapshot(next);
        setPreparationProblem("");
        if (!next.foundingPreparation || next.foundingPreparation.status === "ready") setScreen("home");
      } catch (cause) {
        if (!cancelled) setPreparationProblem(messageFrom(cause, "Preparation status could not be read."));
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [screen]);

  const retryPreparation = useCallback(async () => {
    setPreparationProblem("");
    try {
      setSnapshot(await request<VillageSnapshot>("/setup/preparation/retry", { method: "POST" }));
    } catch (cause) {
      setPreparationProblem(messageFrom(cause, "Preparation could not be retried."));
    }
  }, []);

  // ── Venue editor ───────────────────────────────────────────────────────────
  // Rows are keyed by a client-side id; the server accepts or mints its own, so
  // a hand-added row can be edited and removed without ever having been saved.
  //
  // It edits the places you can be sent to and not the houses, because the two
  // are edited in different places for good reasons: a house is a spot on a map
  // and a destination has a name, purpose, and category. Each row saves by its
  // own id, so an older panel cannot replace a newly approved destination.
  const addVenue = useCallback(() => {
    setVenueEditDraft({
      id: freshRowKey(),
      name: "",
      form: "",
      classes: ["other"],
      spaces: [],
      residenceCapacity: 1,
      residentIds: [],
      improvements: [null, null],
      purpose: "",
      description: "",
      category: "",
      presentation: { image: null, x: null, y: null },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
    });
  }, []);

  const saveVenue = useCallback(
    async (draft: VillageVenue) => {
      setBusy(true);
      setSettingsError("");
      try {
        const existing = snapshot?.settings.venues.some((venue) => venue.id === draft.id) ?? false;
        const spaces = venueClassesFor(draft).map((item) => venueSpaceFor(draft, item));
        const next = await request<VillageSnapshot>(
          existing ? `/locations/venue/${encodeURIComponent(draft.id)}` : "/locations/venue",
          {
            method: existing ? "PUT" : "POST",
            body: JSON.stringify({
              name: draft.name,
              form: draft.form,
              classes: draft.classes,
              residenceCapacity: draft.residenceCapacity,
              spaces,
              workerIds: draft.workerIds ?? [],
              presentation: { x: draft.presentation.x, y: draft.presentation.y },
              purpose: draft.purpose,
              category: draft.category,
              description: spaces[0]?.description ?? draft.description,
              state: {
                condition: spaces[0]?.state.condition ?? "",
                furniture: spaces[0]?.state.items ?? [],
                publicFacts: spaces[0]?.state.publicFacts ?? [],
                features: spaces[0]?.state.features ?? [],
              },
            }),
          },
        );
        const saved = destinationPlaces(next.settings.venues).find((venue) =>
          existing ? venue.id === draft.id : venue.name.toLowerCase() === draft.name.trim().toLowerCase(),
        );
        setSnapshot(next);
        setVenueEditDraft(null);
        setVenuesDraft((rows) => {
          const merged = rows.map((row) => (row.id === draft.id && saved ? saved : row));
          return [
            ...merged,
            ...destinationPlaces(next.settings.venues).filter((venue) => !merged.some((row) => row.id === venue.id)),
          ];
        });
      } catch (cause) {
        setSettingsError(messageFrom(cause, "That place could not be saved."));
      } finally {
        setBusy(false);
      }
    },
    [snapshot],
  );

  const removeVenue = useCallback(
    async (id: string) => {
      const existing = snapshot?.settings.venues.find((venue) => venue.id === id);
      if (!existing) {
        setVenuesDraft((rows) => rows.filter((row) => row.id !== id));
        return;
      }
      setBusy(true);
      setSettingsError("");
      try {
        const dependencies = await request<{
          residentCharacterIds: string[];
          playerHome: boolean;
          workerCharacterIds: string[];
          pendingMailCount: number;
          pendingResidenceCharacterIds: string[];
          remapCount: number;
          roomPresent: boolean;
          eventCount: number;
        }>(`/locations/venue/${encodeURIComponent(id)}/dependencies`);
        if (
          dependencies.roomPresent ||
          dependencies.playerHome ||
          dependencies.residentCharacterIds.length ||
          dependencies.pendingMailCount
        ) {
          setSettingsError(
            dependencies.roomPresent
              ? "End the active visit before deleting this Venue."
              : dependencies.pendingMailCount
                ? "Resolve pending Venue decisions before deleting this Venue."
                : "Move every resident, including yourself, before deleting this Residence.",
          );
          return;
        }
        const affected = dependencies.residentCharacterIds.length + dependencies.pendingResidenceCharacterIds.length;
        const note =
          affected || dependencies.workerCharacterIds.length || dependencies.remapCount || dependencies.eventCount
            ? `This place is referenced by ${affected} pending moves, ${dependencies.workerCharacterIds.length} workers, ${dependencies.remapCount} schedule moves, and ${dependencies.eventCount} events. Delete it?`
            : `Delete ${existing.name}?`;
        if (!window.confirm(note)) return;
        const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(id)}`, {
          method: "DELETE",
          body: JSON.stringify({ confirmed: true }),
        });
        setSnapshot(next);
        setVenuesDraft((rows) => rows.filter((row) => row.id !== id));
      } catch (cause) {
        setSettingsError(messageFrom(cause, "That place could not be removed."));
      } finally {
        setBusy(false);
      }
    },
    [snapshot],
  );

  const decideVenueRequest = useCallback(
    async (entry: VenueRequest, approved: boolean) => {
      setBusy(true);
      setSettingsError("");
      try {
        const draft = requestEdits[entry.id] ?? entry.venueDraft;
        const next = await request<VillageSnapshot>(
          `/venue-requests/${encodeURIComponent(entry.id)}/${approved ? "approve" : "deny"}`,
          { method: "POST", body: approved ? JSON.stringify(draft) : undefined },
        );
        setSnapshot(next);
        if (approved) {
          const known = new Set(venuesDraft.map((venue) => venue.id));
          setVenuesDraft((rows) => [
            ...rows,
            ...destinationPlaces(next.settings.venues).filter((venue) => !known.has(venue.id)),
          ]);
        }
        setRequestEdits((current) => {
          const nextEdits = { ...current };
          delete nextEdits[entry.id];
          return nextEdits;
        });
      } catch (cause) {
        setSettingsError(
          messageFrom(cause, approved ? "That venue could not be approved." : "That request could not be denied."),
        );
      } finally {
        setBusy(false);
      }
    },
    [requestEdits, venuesDraft],
  );

  /**
   * Drop a macro in at the caret of the prompt box, then put the caret back
   * where it was.
   *
   * It used to choose between two boxes on the strength of which one was last
   * focused. There is one box left, and the choice went with the box.
   */
  const insertMacro = useCallback(
    (token: string) => {
      const node = knowledgeRef.current;
      const start = node?.selectionStart ?? knowledgeDraft.length;
      const end = node?.selectionEnd ?? start;
      pendingCaretRef.current = start + token.length;
      setKnowledgeDraft(`${knowledgeDraft.slice(0, start)}${token}${knowledgeDraft.slice(end)}`);
    },
    [knowledgeDraft],
  );

  const addNotice = useCallback(async () => {
    const notice = noticeDraft.trim();
    if (notice.length === 0) return;
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(await request<VillageSnapshot>("/noticeboard", { method: "POST", body: JSON.stringify({ notice }) }));
      setNoticeDraft("");
    } catch (cause) {
      setSettingsError(messageFrom(cause, "That notice could not be pinned up."));
    } finally {
      setBusy(false);
    }
  }, [noticeDraft]);

  const removeNotice = useCallback(async (index: number) => {
    setBusy(true);
    setSettingsError("");
    try {
      setSnapshot(await request<VillageSnapshot>(`/noticeboard/${index}`, { method: "DELETE" }));
    } catch (cause) {
      setSettingsError(messageFrom(cause, "That notice could not be taken down."));
    } finally {
      setBusy(false);
    }
  }, []);

  const needle = search.trim().toLowerCase();
  const visibleCatalog = (catalog ?? []).filter(
    (entry) =>
      needle.length === 0 ||
      entry.name.toLowerCase().includes(needle) ||
      entry.comment.toLowerCase().includes(needle) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(needle)),
  );

  /**
   * Everybody the tab can currently draw a face for, as one string.
   *
   * A string rather than the list, because the list is rebuilt on every render —
   * the snapshot is re-read on a timer and after every message, and `filter`
   * above returns a fresh array each time — and an effect keyed on an array that
   * is new every render is an effect that runs every render. Joined, it only
   * changes when the SET of people changes, which is the only thing the read
   * below cares about.
   *
   * The picker's own list is only in here while the picker is open. Reading
   * pictures for a list nobody is looking at is the one kind of work this could
   * do that the player would never see the result of.
   */
  const portraitWanted = [
    ...(snapshot?.villagers ?? []).map((villager) => villager.characterId),
    ...(pickerOpen ? visibleCatalog.map((entry) => entry.id) : []),
  ].join("\n");

  /**
   * Portraits already asked about, including the ones the Engine had none of.
   *
   * A ref rather than a fact read off `portraits`, because "nobody has asked
   * about this character" and "asked, and there is no picture" leave the same
   * empty entry behind — and without somewhere to tell them apart the tab would
   * ask for the same missing faces on every render for as long as the drawer was
   * open.
   */
  const portraitsAsked = useRef<Set<string>>(new Set());

  /**
   * The faces behind everybody the tab can draw.
   *
   * One call for the whole list rather than one per villager: the Engine's
   * summary route takes ids in a batch, and a village of twelve asking twelve
   * times is twelve chances to be slow for nothing. Only ids nobody has asked
   * about travel, so opening the picker over a list already on screen costs no
   * call at all, and a search that narrows it costs one small call for whoever
   * has just become visible.
   *
   * Nothing here fails loudly. A picture that could not be read is a villager
   * wearing their initial, which is what they wore before any of this existed —
   * there is no error state to reach and no action the player could take, so a
   * failed read is dropped rather than reported. A character who has since been
   * deleted from the library answers with no row and is remembered as having
   * been asked, so the absence is not re-asked for either.
   */
  useEffect(() => {
    const missing = portraitWanted.split("\n").filter((id) => id.length > 0 && !portraitsAsked.current.has(id));
    if (missing.length === 0) return;
    for (const id of missing) portraitsAsked.current.add(id);
    const controller = new AbortController();
    void (async () => {
      try {
        const read = await readPortraits(missing, controller.signal);
        if (!controller.signal.aborted) setPortraits((current) => ({ ...current, ...read }));
      } catch {
        // The initial is already on screen, and it is the whole fallback.
      }
    })();
    return () => controller.abort();
  }, [portraitWanted]);

  /**
   * The picture of the Persona the player is being, or nothing.
   *
   * Held here rather than in the drawer because it is a fact about the village's
   * player rather than about the room: the same Persona walks into every
   * conversation, so reading it again on every door would be the same address
   * fetched once per villager.
   *
   * The drawer draws it on the player's own turns in the card and falls back to
   * the Engine's person mark when there is none — see `AvatarFace`. Null is
   * therefore an ordinary value with a drawing behind it, and not a state: a
   * village played as the name the wizard took, a Persona with no portrait and a
   * Persona since deleted all leave this null and all draw the same mark.
   *
   * The read is dropped with a change of Persona, which is the whole point of
   * keying the effect on the id: a player who switches who they are must not be
   * shown the last one's face for as long as the new one takes to arrive. The id
   * travels through `encodeURIComponent` inside the read itself, because it is a
   * stored value and this tab does not get to decide what is in it.
   */
  const personaPortraitId = snapshot?.settings.playerPersonaId ?? "";
  useEffect(() => {
    setPersonaPortrait(null);
    if (personaPortraitId.length === 0) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const read = await readPersonaPortrait(personaPortraitId, controller.signal);
        if (!controller.signal.aborted) setPersonaPortrait(read);
      } catch {
        // No Persona, no portrait, or nobody to ask: the mark is the fallback
        // and it is already what is drawn.
      }
    })();
    return () => controller.abort();
  }, [personaPortraitId]);

  /**
   * The name behind a character id, for a home that is still being placed.
   *
   * The library is asked first because the wizard assigns houses before anyone
   * has moved in, and the reply to moving in is what fills the snapshot in
   * afterwards.
   */
  const nameOfCharacter = useCallback(
    (characterId: string | null): string => {
      if (!characterId) return "";
      return (
        catalog?.find((entry) => entry.id === characterId)?.name ??
        snapshot?.villagers.find((villager) => villager.characterId === characterId)?.name ??
        ""
      );
    },
    [catalog, snapshot],
  );

  /**
   * What the map is drawing once the village exists: every place it has drawn,
   * and everybody standing at one of them.
   *
   * The places are the pins in the sense the pins have always had — a tack
   * through the paper saying something is here — and a villager's house is still
   * the way into their conversation, because their house is still a place and it
   * is the place they are at. What is new is that the rest of the village is on
   * the map beside them: the mill and the harbour were always somewhere, they
   * were only ever missing from the picture.
   *
   * A place nobody has drawn has no spot to be pinned at, so it is skipped here
   * rather than guessed at. It is still a place — it is offered to the model and a
   * villager can be sent there — it simply has nowhere to hang a pin yet.
   */
  const savedPins: MapPin[] = (() => {
    const places = snapshot?.settings.venues ?? [];
    const pins: MapPin[] = [];
    // Everybody's current place, grouped by which place it is, so that two people
    // at the harbour hang under the harbour rather than on top of each other.
    const standing = new Map<string, VillageVillagerView[]>();
    for (const villager of snapshot?.villagers ?? []) {
      const id = villager.place?.id;
      if (!id) continue;
      const group = standing.get(id);
      if (group) group.push(villager);
      else standing.set(id, [villager]);
    }
    for (const place of places) {
      const spot = placeSpot(place);
      if (!spot) continue;
      // Held in locals so the closures below keep the narrowing — a house nobody
      // has moved into has no conversation to open.
      const occupant = place.occupancy.residentCharacterId;
      const house = isHouse(place);
      // Who the place is named after. A villager's own name, or the player's: the
      // player's house is the one house with no villager in it, so the Persona is
      // what stands in the same place rather than a rule of its own. See
      // `houseLabel`, which is the one reader of what a name does to "house".
      const resident = place.occupancy.playerHome ? playerDisplayName(snapshot) : nameOfCharacter(occupant);
      pins.push({
        id: place.id,
        x: spot.x,
        y: spot.y,
        text: house ? pinText(resident) : place.name,
        image: place.presentation.image?.url ?? null,
        tone: house ? pinTone({ isPlayerHome: place.occupancy.playerHome, occupant }) : "venue",
        selected: openPlaceId === place.id,
        // EVERY PLACE IS A DOOR NOW, not only a house with somebody in it.
        //
        // The pin used to lead straight into the villager's conversation, which
        // made a house the only place on the map with anything behind it and left
        // the mill and the harbour as decoration on a picture. A place is where
        // the village's business happens, so the pin walks into the PLACE and
        // `openVenue` offers both details and entry, even when nobody is present.
        //
        // Only while this pin is the one that was pressed, which is why the list
        // is built here rather than kept somewhere: the map already knows where
        // every pin is, so the pin that was pressed is the box that holds the
        // answer. And because it is rebuilt on every render, out of the same `here`
        // the press reads, a door cannot outlive whoever it names: when the hour
        // turns and they leave, the same open pin now offers the empty room.
        doors:
          openPlaceId === place.id
            ? [
                { label: "View venue", onSelect: () => openPlace(place) },
                {
                  /**
                   * Enter opens the place's action view when it is empty, or the
                   * shared conversation with whoever is present.
                   */
                  label: "Visit",
                  onSelect: () => void openRoom(place),
                },
              ]
            : undefined,
        onSelect: () => openVenue(place),
      });
      // Who is here, under the building they are at. Drawn as a label rather than
      // a button, because the place is what you walk into: who happens to be
      // standing in it at this hour is a fact about the place and not a second
      // door into it.
      (standing.get(place.id) ?? []).forEach((villager, index) => {
        pins.push({
          id: `villager:${villager.characterId}`,
          x: spot.x,
          y: spot.y,
          dy: STANDING_PIN_STEP * (index + 1),
          text: villager.name,
          tone: "resident",
          kind: "person",
        });
      });
    }
    return pins;
  })();

  const draftPins: MapPin[] = setupVenues.flatMap((venue) => {
    const spot = placeSpot(venue);
    if (!spot) return [];
    return [
      {
        id: venue.id,
        x: spot.x,
        y: spot.y,
        text: venue.name || (venue.category === "public-center" ? "Gathering Place" : "Residence"),
        image: venue.presentation.image?.url ?? null,
        tone: venue.category === "public-center" ? "venue" : venue.occupancy.playerHome ? "player" : "resident",
        onSelect: () => setSelectedSetupVenueId(venue.id),
      },
    ];
  });

  // ── Viewing a place ────────────────────────────────────────────────────────
  // The screen the map leads to, and the only screen in this tab that asks the
  // model for nothing at all.
  //
  // Everything on it is read off what the village already holds: the place's own
  // record, what kind of building stands there, who the hour has put in it, and
  // the village's own clock and weather. A room described by a call the player
  // pays for would be a room whose description can fail, can arrive in a voice the
  // player never chose, and can disagree with the map they just walked off — and
  // there is nothing here that is not already known. So the look-around is
  // RENDERED. It is the same promise the places list already makes about pictures:
  // nothing in this village happens because the player looked at it.
  if (screen === "room") {
    return (
      <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-room-screen`} data-mobile={mobile ? "true" : "false"}>
        {room ? (
          <RoomPanel
            room={room}
            picture={venuePictureOf(snapshot?.settings.venues ?? [], room)}
            draft={roomDraft}
            mode={roomMode}
            targetId={roomTargetId}
            busy={roomBusy}
            error={roomError}
            greetingNotice={roomGreetingNotice}
            ruling={roomRuling}
            open={roomOpen}
            ended={roomEnded}
            playerName={playerDisplayName(snapshot)}
            playerPortrait={personaPortrait ?? undefined}
            portraits={portraits}
            sprites={Object.fromEntries(
              (snapshot?.villagers ?? []).map((villager) => [villager.characterId, villager.sprite]),
            )}
            onDraft={(value) => {
              roomSubmissionIdRef.current = null;
              roomLeaveSubmissionIdRef.current = null;
              setRoomDraft(value);
            }}
            onMode={(value) => {
              roomSubmissionIdRef.current = null;
              setRoomMode(value);
            }}
            onTarget={(value) => {
              roomSubmissionIdRef.current = null;
              setRoomTargetId(value);
            }}
            onSend={() => void (roomMode === "conclude" ? leaveRoom() : sendRoom())}
            onViewVenue={() => {
              setVenueId(room.placeId);
              setVenueEditDraft(null);
              setScreen("venue");
              void loadSnapshot();
            }}
            onEnterPrivate={
              room.area === "shared" && room.privateAccessOwnerId
                ? () => {
                    setRoomBusy(true);
                    void request<{ session: RoomView }>("/rooms/enter-private", {
                      method: "POST",
                      body: JSON.stringify({ sessionId: room.id, ownerId: room.privateAccessOwnerId }),
                    })
                      .then(({ session }) => {
                        setRoom(currentRoom(session));
                        void loadSnapshot();
                      })
                      .catch((cause) => setRoomError(messageFrom(cause, "That private space could not be entered.")))
                      .finally(() => setRoomBusy(false));
                  }
                : undefined
            }
            privateSpaceOwnerName={nameOfCharacter(room.privateAccessOwnerId)}
            onEnd={() => void closeRoom()}
            notices={roomNotices}
            onDismissNotice={(id) => setRoomNotices((current) => current.filter((event) => event.id !== id))}
            debugDiscardEnabled={debugDiscardEnabled}
            onDebugDiscard={() => void discardRoomDebug()}
            onLeavePending={() => void leaveRoomPending()}
            endFailed={endFailed}
            onRetryGreeting={() => {
              if (room.id) void greetRoom(room.id);
              else {
                const place = snapshot?.settings.venues.find((candidate) => candidate.id === room.placeId);
                if (place) void openRoom(place);
              }
            }}
            onContinueWithoutGreeting={() => {
              if (room.id) void continueRoomWithoutGreeting(room.id);
            }}
            onUseMailbox={
              snapshot?.settings.venues.some(
                (venue) =>
                  venue.id === room.placeId &&
                  venue.occupancy.playerHome &&
                  (!room.spaceClass || room.spaceClass === "residence"),
              )
                ? () => setMailboxOpen(true)
                : undefined
            }
          />
        ) : (
          <button type="button" className={`${ELEMENT_TAG}-button`} onClick={goHome}>
            Back to village
          </button>
        )}
        {/* Future flavor: let a village present this Mailbox as a crystal, terminal, messenger bird, or email. */}
        {mailboxOpen && snapshot ? (
          <div className={`${ELEMENT_TAG}-mailbox-backdrop`} onClick={() => setMailboxOpen(false)}>
            <section
              className={`${ELEMENT_TAG}-mailbox`}
              role="dialog"
              aria-modal="true"
              aria-label="Mailbox"
              onClick={(event) => event.stopPropagation()}
            >
              <div className={`${ELEMENT_TAG}-row`} style={{ justifyContent: "space-between" }}>
                <h2 className={`${ELEMENT_TAG}-panel-title`}>Mailbox</h2>
                <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setMailboxOpen(false)}>
                  Close
                </button>
              </div>
              <p className={`${ELEMENT_TAG}-hint`}>Venue decisions and replies from the people affected by them.</p>
              <div className={`${ELEMENT_TAG}-mailbox-list`}>
                {[...(snapshot.venueMail ?? [])].reverse().map((entry) => (
                  <article className={`${ELEMENT_TAG}-mailbox-item`} key={entry.id}>
                    <strong>{entry.title}</strong>
                    <p>{entry.detail}</p>
                    <p className={`${ELEMENT_TAG}-hint`}>
                      {entry.status === "awaiting-villagers"
                        ? `Awaiting replies · due ${new Date(entry.dueAt).toLocaleString()}`
                        : entry.status === "pending-player"
                          ? "Awaiting your decision"
                          : entry.status === "approved"
                            ? "Approved"
                            : "Declined"}
                    </p>
                    {entry.decisions.map((decision) => (
                      <p key={decision.characterId}>
                        <strong>{nameOfCharacter(decision.characterId)}:</strong> {decision.reply}
                      </p>
                    ))}
                    {entry.status === "pending-player" && entry.kind === "villager-change" ? (
                      <MailboxImprovementEditor
                        entry={entry}
                        onDecide={async (approved, value) => {
                          setSnapshot(
                            await request<VillageSnapshot>(`/venue-mail/${encodeURIComponent(entry.id)}/decision`, {
                              method: "POST",
                              body: JSON.stringify({ approved, ...value }),
                            }),
                          );
                        }}
                      />
                    ) : null}
                    {entry.error ? <p className={`${ELEMENT_TAG}-hint`}>Reply delayed: {entry.error}</p> : null}
                  </article>
                ))}
                {(snapshot.venueMail?.length ?? 0) === 0 &&
                snapshot.venueRequests.length === 0 &&
                snapshot.upgradeRequests.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>No Venue mail yet.</p>
                ) : null}
                {snapshot.venueRequests.map((entry) => (
                  <article className={`${ELEMENT_TAG}-mailbox-item`} key={entry.id}>
                    <strong>
                      {entry.requesterName || "A villager"} suggests {entry.venueDraft.name}
                    </strong>
                    <p>{entry.venueDraft.purpose}</p>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      onClick={() => {
                        setMailboxOpen(false);
                        openMenu("venueRequests");
                      }}
                    >
                      Review request
                    </button>
                  </article>
                ))}
                {snapshot.upgradeRequests.map((entry) => (
                  <article className={`${ELEMENT_TAG}-mailbox-item`} key={entry.id}>
                    <strong>{entry.requesterName} suggests a home change</strong>
                    <p>{entry.detail}</p>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      onClick={() => {
                        setMailboxOpen(false);
                        openMenu("venueRequests");
                      }}
                    >
                      Review request
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    );
  }
  if (screen === "venue") {
    const place = (snapshot?.settings.venues ?? []).find((entry) => entry.id === venueId) ?? null;
    if (!snapshot || !place) {
      return (
        <div className={`${ELEMENT_TAG}-root`}>
          <header className={`${ELEMENT_TAG}-header`}>
            <div>
              <h1 className={`${ELEMENT_TAG}-title`}>A place that is gone</h1>
              <p className={`${ELEMENT_TAG}-subtitle`}>This venue is no longer in the village.</p>
            </div>
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={leaveVenue}>
              Back to map
            </button>
          </header>
        </div>
      );
    }
    const here = standingAt(place.id);
    const classes = venueClassesFor(place);
    const building = place.occupancy.homeKind ? buildingOf(homeBuildings, place.occupancy.homeKind).name : "";
    const occupant = place.occupancy.playerHome
      ? playerDisplayName(snapshot)
      : nameOfCharacter(place.occupancy.residentCharacterId);
    const occupiedResidence = classes.includes("residence") && (place.residentIds?.length ?? 0) > 0;
    const liveShared = room?.placeId === place.id && (room.area === "shared" || room.area === "private");
    const livePrivateOwner = room?.placeId === place.id && room.area === "private" ? room.privateOwnerId : "";
    const canViewShared = place.occupancy.playerHome || place.playerSeenShared || liveShared;
    const privateSpaces = (place.privateSpaces ?? []).filter(
      (space) => place.playerSeenPrivateIds?.includes(space.ownerId) || space.ownerId === livePrivateOwner,
    );
    const visitOptions = [
      ...classes.map((item) => ({
        key: item,
        label: `${item[0]!.toUpperCase()}${item.slice(1)} space`,
        spaceClass: item,
        ownerId: "",
      })),
      ...(place.playerInvitations ?? [])
        .filter((invitation) => invitation.scope === "private" && invitation.ownerId)
        .map((invitation) => ({
          key: `private:${invitation.ownerId}`,
          label: `${nameOfCharacter(invitation.ownerId ?? "")}'s private space`,
          spaceClass: "residence" as VenueClass,
          ownerId: invitation.ownerId ?? "",
        })),
    ];
    const imagePanel = (label: string, image: VillageVenueImage | null, spaceClass?: VenueClass, ownerId = "") => (
      <section className={`${ELEMENT_TAG}-venue-card`} key={ownerId || spaceClass || "exterior"}>
        <h3 className={`${ELEMENT_TAG}-panel-title`}>{label}</h3>
        {image ? (
          <img className={`${ELEMENT_TAG}-venue-space-picture`} src={image.url} alt={`${label} at ${place.name}`} />
        ) : (
          <div className={`${ELEMENT_TAG}-venue-image-empty`}>No image yet</div>
        )}
        <div className={`${ELEMENT_TAG}-row`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-button`}
            disabled={Boolean(placeBusyId) || busy}
            onClick={() => void drawPlaceImage(place.id, spaceClass, ownerId)}
          >
            {image ? "Redraw image" : "Draw image"}
          </button>
          <input
            className={`${ELEMENT_TAG}-file`}
            type="file"
            accept="image/*"
            aria-label={`Upload ${label.toLowerCase()} image`}
            disabled={Boolean(placeBusyId) || busy}
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void keepPlaceImage(place.id, file, spaceClass, ownerId);
            }}
          />
          {image ? (
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              disabled={Boolean(placeBusyId) || busy}
              onClick={() => void dropPlaceImage(place.id, spaceClass, ownerId)}
            >
              Remove image
            </button>
          ) : null}
        </div>
      </section>
    );
    const editableFields = (venue: VillageVenue) => ({
      name: venue.name,
      form: venue.form,
      purpose: venue.purpose,
      workerIds: venue.workerIds,
      position: { x: venue.presentation.x, y: venue.presentation.y },
      spaces: classes.map((item) => {
        const space = venueSpaceFor(venue, item);
        return {
          description: space.description,
          condition: space.state.condition,
          items: space.state.items,
          publicFacts: space.state.publicFacts,
          features: space.state.features.map(({ id, text, locked }) => ({ id, text, locked })),
        };
      }),
      privateSpaces: venue.privateSpaces?.map((space) => ({
        ownerId: space.ownerId,
        description: space.description,
        condition: space.state.condition,
        items: space.state.items,
        publicFacts: space.state.publicFacts,
        features: space.state.features.map(({ id, text, locked }) => ({ id, text, locked })),
      })),
    });
    const editorDirty = Boolean(
      venueEditDraft && JSON.stringify(editableFields(venueEditDraft)) !== JSON.stringify(editableFields(place)),
    );
    const proposalDirty = Boolean(
      venueProposalDraft &&
      (JSON.stringify(venueProposalDraft.classes) !== JSON.stringify(classes) ||
        venueProposalDraft.capacity !== (place.residenceCapacity ?? 1) ||
        venueProposalDraft.slot !== 0 ||
        venueProposalDraft.title ||
        venueProposalDraft.description ||
        venueProposalDraft.extraBeds),
    );
    const exitPage = () => {
      if ((venuePage === "edit" && editorDirty) || (venuePage === "proposal" && proposalDirty)) {
        if (!window.confirm("Discard your unsaved changes?")) return;
      }
      setVenuePage("view");
      setVenueEditDraft(null);
      setVenueProposalDraft(null);
      setVenueEditError("");
      setVenueEditNotice("");
    };
    const refreshEditor = (next: VillageSnapshot, notice: string) => {
      setSnapshot(next);
      const updated = next.settings.venues.find((entry) => entry.id === place.id);
      if (updated) setVenueEditDraft(structuredClone(updated));
      setVenueEditNotice(notice);
    };
    const saveVenueDetails = async () => {
      if (!venueEditDraft) return;
      if (occupiedResidence) {
        const draftFields = editableFields(venueEditDraft);
        const currentFields = editableFields(place);
        const sharedIndex = classes.indexOf("residence");
        const roomChanges =
          (sharedIndex >= 0 &&
            JSON.stringify(draftFields.spaces[sharedIndex]) !== JSON.stringify(currentFields.spaces[sharedIndex])) ||
          JSON.stringify(draftFields.privateSpaces) !== JSON.stringify(currentFields.privateSpaces);
        if (roomChanges && !window.confirm("Saving Venue details will discard unsaved room changes. Continue?")) return;
      }
      setVenueEditBusy(true);
      setVenueEditError("");
      setVenueEditNotice("");
      try {
        const spaces = classes.map((item) =>
          occupiedResidence && item === "residence" ? venueSpaceFor(place, item) : venueSpaceFor(venueEditDraft, item),
        );
        const first = spaces[0];
        const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}`, {
          method: "PUT",
          body: JSON.stringify({
            name: venueEditDraft.name,
            form: venueEditDraft.form,
            purpose: venueEditDraft.purpose,
            description: occupiedResidence ? place.description : (first?.description ?? venueEditDraft.description),
            spaces,
            workerIds: venueEditDraft.workerIds ?? [],
            presentation: { x: venueEditDraft.presentation.x, y: venueEditDraft.presentation.y },
            state: occupiedResidence
              ? place.state
              : {
                  condition: first?.state.condition ?? "",
                  furniture: first?.state.items ?? [],
                  publicFacts: first?.state.publicFacts ?? [],
                  features: first?.state.features ?? [],
                },
          }),
        });
        refreshEditor(next, "Venue details saved.");
      } catch (cause) {
        setVenueEditError(messageFrom(cause, "The Venue could not be saved."));
      } finally {
        setVenueEditBusy(false);
      }
    };
    const proposeRoomEdit = async (target: "shared" | "private", ownerId = "") => {
      if (!venueEditDraft) return;
      const space =
        target === "private"
          ? venueEditDraft.privateSpaces?.find((entry) => entry.ownerId === ownerId)
          : venueSpaceFor(venueEditDraft, "residence");
      if (!space) return;
      const remainingDraft = structuredClone(venueEditDraft);
      if (target === "shared")
        remainingDraft.spaces = remainingDraft.spaces?.map((entry) =>
          entry.venueClass === "residence" ? venueSpaceFor(place, "residence") : entry,
        );
      else
        remainingDraft.privateSpaces = remainingDraft.privateSpaces?.map((entry) =>
          entry.ownerId === ownerId
            ? (place.privateSpaces?.find((current) => current.ownerId === ownerId) ?? entry)
            : entry,
        );
      if (
        JSON.stringify(editableFields(remainingDraft)) !== JSON.stringify(editableFields(place)) &&
        !window.confirm("Submitting this room edit will discard other unsaved changes. Continue?")
      )
        return;
      setVenueEditBusy(true);
      setVenueEditError("");
      setVenueEditNotice("");
      try {
        const next = await request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}/edit-proposals`, {
          method: "POST",
          body: JSON.stringify({ target, ownerId, description: space.description, state: space.state }),
        });
        refreshEditor(next, `${target === "private" ? "Private" : "Shared"} room edit proposed.`);
      } catch (cause) {
        setVenueEditError(messageFrom(cause, "That room edit could not be proposed."));
      } finally {
        setVenueEditBusy(false);
      }
    };
    const title = venueTitle(place, occupant);
    return (
      <div className={`${ELEMENT_TAG}-root`}>
        <header className={`${ELEMENT_TAG}-header`}>
          <div>
            <h1 className={`${ELEMENT_TAG}-title`}>
              {venuePage === "view" ? title : `${venuePage === "edit" ? "Edit Venue" : "Propose Change"} · ${title}`}
            </h1>
            <p className={`${ELEMENT_TAG}-subtitle`}>
              {venuePage === "view"
                ? here.length === 0
                  ? "Nobody is here right now"
                  : `Villagers here: ${here.map((villager) => villager.name).join(", ")}`
                : venuePage === "edit"
                  ? "Pictures and venue details"
                  : "Review a structural change"}
            </p>
          </div>
          <div className={`${ELEMENT_TAG}-actions`}>
            {venuePage === "view" ? (
              <>
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  onClick={() => {
                    setVenueEditDraft(structuredClone(place));
                    setVenueEditError("");
                    setVenueEditNotice("");
                    setVenuePage("edit");
                  }}
                >
                  Edit Venue
                </button>
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  onClick={() => {
                    setVenueProposalDraft({
                      classes,
                      capacity: place.residenceCapacity ?? 1,
                      slot: 0,
                      title: "",
                      description: "",
                      extraBeds: 0,
                    });
                    setVenueEditError("");
                    setVenueEditNotice("");
                    setVenuePage("proposal");
                  }}
                >
                  Propose Change
                </button>
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  onClick={
                    room?.placeId === place.id && room.status !== "closed" ? () => setScreen("room") : leaveVenue
                  }
                >
                  {room?.placeId === place.id && room.status !== "closed" ? "Return to scene" : "Back to map"}
                </button>
              </>
            ) : (
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={exitPage}>
                {venuePage === "edit" ? "Close Editor" : "Exit Change Proposal"}
              </button>
            )}
          </div>
        </header>
        {venuePage === "view" ? (
          <main className={`${ELEMENT_TAG}-venue-page`}>
            <section className={`${ELEMENT_TAG}-venue-hero`}>
              {place.presentation.image ? (
                <img
                  className={`${ELEMENT_TAG}-venue-picture`}
                  src={place.presentation.image.url}
                  alt={`Exterior of ${place.name}`}
                />
              ) : (
                <div className={`${ELEMENT_TAG}-venue-image-empty`}>Exterior image not drawn yet</div>
              )}
              <div className={`${ELEMENT_TAG}-venue-context`}>
                <span className={`${ELEMENT_TAG}-label`}>The place</span>
                {place.purpose ? <p className={`${ELEMENT_TAG}-venue-beat`}>{place.purpose}</p> : null}
                {place.form || building ? <p>{place.form || building}</p> : null}
                {snapshot.village.setting ? <p className={`${ELEMENT_TAG}-hint`}>{snapshot.village.setting}</p> : null}
                {classes.includes("residence") ? (
                  <p className={`${ELEMENT_TAG}-hint`}>
                    {venueAssignedCountFor(place)} / {venueCapacityFor(place)} residents
                  </p>
                ) : null}
                <div className={`${ELEMENT_TAG}-row`}>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={roomBusy}
                    aria-expanded={visitOptions.length > 1 ? venueVisitPickerOpen : undefined}
                    onClick={() => {
                      if (visitOptions.length === 1) {
                        const choice = visitOptions[0]!;
                        void openRoom(place, choice.spaceClass, choice.ownerId);
                      } else setVenueVisitPickerOpen((open) => !open);
                    }}
                  >
                    {roomBusy ? "Opening visit…" : "Visit Venue"}
                  </button>
                </div>
                {venueVisitPickerOpen && visitOptions.length > 1 ? (
                  <div className={`${ELEMENT_TAG}-venue-visit-picker`}>
                    <span className={`${ELEMENT_TAG}-label`}>Choose a space</span>
                    {visitOptions.map((choice) => (
                      <button
                        key={choice.key}
                        type="button"
                        className={`${ELEMENT_TAG}-button`}
                        disabled={roomBusy}
                        onClick={() => {
                          setVenueVisitPickerOpen(false);
                          void openRoom(place, choice.spaceClass, choice.ownerId);
                        }}
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {classes.includes("residence") && !place.occupancy.playerHome ? (
                  <p className={`${ELEMENT_TAG}-hint`}>
                    You can speak from outside. Entering a resident's home requires an invitation.
                  </p>
                ) : null}
              </div>
            </section>
            {classes.includes("residence") && !canViewShared ? (
              <p className={`${ELEMENT_TAG}-hint`}>
                The shared Residence space appears after you enter with an invitation.
              </p>
            ) : null}
            <div className={`${ELEMENT_TAG}-venue-space-grid`}>
              {classes
                .filter((item) => item !== "residence" || canViewShared)
                .map((item) => {
                  const space = venueSpaceFor(place, item);
                  return (
                    <section className={`${ELEMENT_TAG}-venue-card`} key={item}>
                      <h2 className={`${ELEMENT_TAG}-panel-title`}>
                        {item === "residence"
                          ? "Shared Residence space"
                          : `${item[0]!.toUpperCase()}${item.slice(1)} space`}
                      </h2>
                      {space.image ? (
                        <img
                          className={`${ELEMENT_TAG}-venue-space-picture`}
                          src={space.image.url}
                          alt={`${item} space at ${place.name}`}
                        />
                      ) : (
                        <div className={`${ELEMENT_TAG}-venue-image-empty`}>Image not drawn yet</div>
                      )}
                      {space.description ? <p className={`${ELEMENT_TAG}-venue-beat`}>{space.description}</p> : null}
                      {space.state.condition ? (
                        <p className={`${ELEMENT_TAG}-hint`}>Condition now: {space.state.condition}</p>
                      ) : null}
                      {space.state.items.length ? (
                        <p className={`${ELEMENT_TAG}-hint`}>Present items: {space.state.items.join(", ")}</p>
                      ) : null}
                      {space.state.publicFacts.length ? (
                        <p className={`${ELEMENT_TAG}-hint`}>
                          Established facts: {space.state.publicFacts.join(" · ")}
                        </p>
                      ) : null}
                    </section>
                  );
                })}
              {privateSpaces.map((space) => (
                <section className={`${ELEMENT_TAG}-venue-card`} key={space.ownerId}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>{nameOfCharacter(space.ownerId)}'s private space</h2>
                  {space.image ? (
                    <img
                      className={`${ELEMENT_TAG}-venue-space-picture`}
                      src={space.image.url}
                      alt={`${nameOfCharacter(space.ownerId)}'s private space`}
                    />
                  ) : (
                    <div className={`${ELEMENT_TAG}-venue-image-empty`}>Image not drawn yet</div>
                  )}
                  {space.description ? <p className={`${ELEMENT_TAG}-venue-beat`}>{space.description}</p> : null}
                  {space.adaptationPending ? (
                    <p className={`${ELEMENT_TAG}-hint`}>This room is still being adapted after a move.</p>
                  ) : null}
                </section>
              ))}
            </div>
            {(place.editProposals ?? []).map((proposal) => (
              <p className={`${ELEMENT_TAG}-hint`} key={proposal.id}>
                Proposed {proposal.target} room edit:{" "}
                {proposal.declined
                  ? "declined or stale"
                  : `approved by ${proposal.approvedIds.length} of ${proposal.requiredIds.length} residents`}
              </p>
            ))}
            {classes.includes("residence") && !place.occupancy.playerHome ? (
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={() => {
                  void request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}/player-move`, {
                    method: "POST",
                  })
                    .then(setSnapshot)
                    .catch((cause) => setVenueEditError(messageFrom(cause, "The move could not be requested.")));
                }}
              >
                Request to live here
              </button>
            ) : null}
            {venueEditError ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {venueEditError}
              </p>
            ) : null}
          </main>
        ) : venuePage === "edit" ? (
          <main className={`${ELEMENT_TAG}-venue-editor-page`}>
            <div className={`${ELEMENT_TAG}-venue-space-grid`}>
              {imagePanel("Exterior image", place.presentation.image)}
              {classes
                .filter((item) => item !== "residence" || canViewShared)
                .map((item) =>
                  imagePanel(
                    item === "residence" ? "Shared Residence image" : `${item} space image`,
                    venueSpaceFor(place, item).image,
                    item,
                  ),
                )}
              {privateSpaces.map((space) =>
                imagePanel(
                  `${nameOfCharacter(space.ownerId)}'s private image`,
                  space.image,
                  "residence",
                  space.ownerId,
                ),
              )}
            </div>
            {placeBusyId === place.id ? <p className={`${ELEMENT_TAG}-hint`}>Drawing or saving the image…</p> : null}
            {placeProblem?.id === place.id ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {placeProblem.text}
              </p>
            ) : null}
            {venueEditDraft ? (
              <section className={`${ELEMENT_TAG}-venue-card`}>
                <h2 className={`${ELEMENT_TAG}-panel-title`}>Venue details</h2>
                <VenueDraftFields
                  draft={venueEditDraft}
                  existing
                  villagers={snapshot.villagers}
                  editableClasses={classes.filter((item) => item !== "residence" || !occupiedResidence || liveShared)}
                  onChange={setVenueEditDraft}
                />
                {occupiedResidence ? (
                  <p className={`${ELEMENT_TAG}-hint`}>
                    Save Venue details updates the public fields. Changes to the shared Residence room require a
                    separate proposal during an invited visit.
                  </p>
                ) : null}
                <div className={`${ELEMENT_TAG}-row`}>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={venueEditBusy || !venueEditDraft.name.trim()}
                    onClick={() => void saveVenueDetails()}
                  >
                    Save Venue details
                  </button>
                  {occupiedResidence && liveShared ? (
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={venueEditBusy || !venueSpaceFor(venueEditDraft, "residence").description.trim()}
                      onClick={() => void proposeRoomEdit("shared")}
                    >
                      Propose shared room edit
                    </button>
                  ) : null}
                </div>
                {occupiedResidence && !liveShared ? (
                  <p className={`${ELEMENT_TAG}-hint`}>
                    Enter with a resident's invitation to propose changes to the shared room's contents.
                  </p>
                ) : null}
              </section>
            ) : null}
            {livePrivateOwner &&
              venueEditDraft?.privateSpaces
                ?.filter((space) => space.ownerId === livePrivateOwner)
                .map((space) => (
                  <section className={`${ELEMENT_TAG}-venue-card`} key={space.ownerId}>
                    <h2 className={`${ELEMENT_TAG}-panel-title`}>
                      Propose changes to {nameOfCharacter(space.ownerId)}'s private space
                    </h2>
                    <label className={`${ELEMENT_TAG}-label`}>
                      Scene description
                      <textarea
                        className={`${ELEMENT_TAG}-textarea`}
                        value={space.description}
                        onChange={(event) =>
                          setVenueEditDraft((current) =>
                            current
                              ? {
                                  ...current,
                                  privateSpaces: current.privateSpaces?.map((entry) =>
                                    entry.ownerId === space.ownerId
                                      ? { ...entry, description: event.target.value }
                                      : entry,
                                  ),
                                }
                              : current,
                          )
                        }
                      />
                    </label>
                    <details className={`${ELEMENT_TAG}-venue-scene-details`}>
                      <summary>Scene details</summary>
                      <p className={`${ELEMENT_TAG}-hint`}>
                        Physical state used during visits and for this room's image. These facts stay private until the
                        player enters this room.
                      </p>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Condition now{" "}
                        <span className={`${ELEMENT_TAG}-hint`}>
                          For example, a broken shutter or a repaired floor.
                        </span>
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={space.state.condition}
                          onChange={(event) =>
                            setVenueEditDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    privateSpaces: current.privateSpaces?.map((entry) =>
                                      entry.ownerId === space.ownerId
                                        ? { ...entry, state: { ...entry.state, condition: event.target.value } }
                                        : entry,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Present items · one per line{" "}
                        <span className={`${ELEMENT_TAG}-hint`}>Objects physically in this room.</span>
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={space.state.items.join("\n")}
                          onChange={(event) =>
                            setVenueEditDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    privateSpaces: current.privateSpaces?.map((entry) =>
                                      entry.ownerId === space.ownerId
                                        ? { ...entry, state: { ...entry.state, items: event.target.value.split("\n") } }
                                        : entry,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Established facts · one per line{" "}
                        <span className={`${ELEMENT_TAG}-hint`}>Durable truths about this room.</span>
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={space.state.publicFacts.join("\n")}
                          onChange={(event) =>
                            setVenueEditDraft((current) =>
                              current
                                ? {
                                    ...current,
                                    privateSpaces: current.privateSpaces?.map((entry) =>
                                      entry.ownerId === space.ownerId
                                        ? {
                                            ...entry,
                                            state: { ...entry.state, publicFacts: event.target.value.split("\n") },
                                          }
                                        : entry,
                                    ),
                                  }
                                : current,
                            )
                          }
                        />
                      </label>
                    </details>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={venueEditBusy || !space.description.trim()}
                      onClick={() => void proposeRoomEdit("private", space.ownerId)}
                    >
                      Propose private room edit
                    </button>
                  </section>
                ))}
            {occupiedResidence && (place.residentIds?.length ?? 0) > 0 ? (
              <section className={`${ELEMENT_TAG}-venue-card`}>
                <h2 className={`${ELEMENT_TAG}-panel-title`}>Resident moves</h2>
                <select
                  value={moveTargetId}
                  onChange={(event) => setMoveTargetId(event.target.value)}
                  aria-label="Destination for resident move"
                >
                  <option value="">Choose a Residence with an available bed</option>
                  {snapshot.settings.venues
                    .filter(
                      (entry) =>
                        entry.id !== place.id &&
                        venueClassesFor(entry).includes("residence") &&
                        venueAssignedCountFor(entry) < venueCapacityFor(entry),
                    )
                    .map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.name}
                      </option>
                    ))}
                </select>
                {(place.residentIds ?? []).map((residentId) => {
                  const move = snapshot.residences.find(
                    (entry) => entry.characterId === residentId && entry.status !== "current",
                  );
                  return (
                    <div className={`${ELEMENT_TAG}-row`} key={residentId}>
                      <strong>{nameOfCharacter(residentId)}</strong>
                      {move ? (
                        <span className={`${ELEMENT_TAG}-hint`}>
                          {move.status === "moving" ? "Moving" : "Awaiting consent"}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={!moveTargetId || venueEditBusy}
                          onClick={() => {
                            setVenueEditBusy(true);
                            void request<VillageSnapshot>("/residences/proposals", {
                              method: "POST",
                              body: JSON.stringify({ characterId: residentId, venueId: moveTargetId }),
                            })
                              .then(setSnapshot)
                              .catch((cause) =>
                                setVenueEditError(messageFrom(cause, "The move could not be requested.")),
                              )
                              .finally(() => setVenueEditBusy(false));
                          }}
                        >
                          Ask to move
                        </button>
                      )}
                    </div>
                  );
                })}
              </section>
            ) : null}
            {venueEditNotice ? (
              <p className={`${ELEMENT_TAG}-hint`} role="status">
                {venueEditNotice}
              </p>
            ) : null}
            {venueEditError ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {venueEditError}
              </p>
            ) : null}
          </main>
        ) : (
          <main className={`${ELEMENT_TAG}-venue-proposal-page`}>
            <section className={`${ELEMENT_TAG}-venue-card`}>
              <h2 className={`${ELEMENT_TAG}-panel-title`}>Propose a Venue change</h2>
              <p className={`${ELEMENT_TAG}-hint`}>
                Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes
                after you submit the reviewed terms.
              </p>
              {venueProposalDraft ? (
                <>
                  <fieldset className={`${ELEMENT_TAG}-field`}>
                    <legend className={`${ELEMENT_TAG}-label`}>Classes · choose up to two</legend>
                    <div className={`${ELEMENT_TAG}-row`}>
                      {VENUE_CLASS_CHOICES.map((item) => (
                        <label key={item} className={`${ELEMENT_TAG}-label`}>
                          <input
                            type="checkbox"
                            checked={venueProposalDraft.classes.includes(item)}
                            disabled={
                              !venueProposalDraft.classes.includes(item) && venueProposalDraft.classes.length >= 2
                            }
                            onChange={(event) =>
                              setVenueProposalDraft((current) =>
                                current
                                  ? {
                                      ...current,
                                      classes: event.target.checked
                                        ? [...current.classes, item]
                                        : current.classes.filter((entry) => entry !== item),
                                    }
                                  : current,
                              )
                            }
                          />{" "}
                          {item}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {venueProposalDraft.classes.includes("residence") ? (
                    <label className={`${ELEMENT_TAG}-label`}>
                      Base capacity · includes you
                      <input
                        className={`${ELEMENT_TAG}-notice-input`}
                        type="number"
                        min={1}
                        max={4}
                        value={venueProposalDraft.capacity}
                        onChange={(event) =>
                          setVenueProposalDraft({ ...venueProposalDraft, capacity: Number(event.target.value) })
                        }
                      />
                    </label>
                  ) : null}
                  <label className={`${ELEMENT_TAG}-label`}>
                    Improvement slot
                    <select
                      value={venueProposalDraft.slot}
                      onChange={(event) =>
                        setVenueProposalDraft({ ...venueProposalDraft, slot: Number(event.target.value) })
                      }
                    >
                      <option value={0}>Slot 1 · {place.improvements?.[0]?.title ?? "empty"}</option>
                      <option value={1}>Slot 2 · {place.improvements?.[1]?.title ?? "empty"}</option>
                    </select>
                  </label>
                  <label className={`${ELEMENT_TAG}-label`}>
                    Improvement title · leave empty for a Class or capacity proposal
                    <input
                      className={`${ELEMENT_TAG}-notice-input`}
                      value={venueProposalDraft.title}
                      onChange={(event) => setVenueProposalDraft({ ...venueProposalDraft, title: event.target.value })}
                      placeholder="A second sleeping alcove"
                    />
                  </label>
                  {venueProposalDraft.title ? (
                    <>
                      <label className={`${ELEMENT_TAG}-label`}>
                        What changes in the story?
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={venueProposalDraft.description}
                          onChange={(event) =>
                            setVenueProposalDraft({ ...venueProposalDraft, description: event.target.value })
                          }
                        />
                      </label>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Extra beds · optional mechanical effect
                        <input
                          className={`${ELEMENT_TAG}-notice-input`}
                          type="number"
                          min={0}
                          max={3}
                          value={venueProposalDraft.extraBeds}
                          onChange={(event) =>
                            setVenueProposalDraft({ ...venueProposalDraft, extraBeds: Number(event.target.value) })
                          }
                        />
                      </label>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={
                      venueEditBusy ||
                      venueProposalDraft.classes.length < 1 ||
                      (venueProposalDraft.title.trim().length > 0 && !venueProposalDraft.description.trim())
                    }
                    onClick={() => {
                      setVenueEditBusy(true);
                      setVenueEditError("");
                      void request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(place.id)}/proposals`, {
                        method: "POST",
                        body: JSON.stringify({
                          classes: venueProposalDraft.classes,
                          capacity: venueProposalDraft.capacity,
                          ...(venueProposalDraft.title.trim()
                            ? {
                                slot: venueProposalDraft.slot,
                                improvement: {
                                  title: venueProposalDraft.title,
                                  description: venueProposalDraft.description,
                                  extraBeds: venueProposalDraft.extraBeds,
                                },
                              }
                            : {}),
                          title: venueProposalDraft.title || `Change ${place.name}`,
                          detail:
                            venueProposalDraft.description || `Change Venue Classes or capacity at ${place.name}.`,
                        }),
                      })
                        .then((next) => {
                          setSnapshot(next);
                          setVenueProposalDraft(null);
                          setVenueEditNotice("Proposal submitted.");
                        })
                        .catch((cause) => setVenueEditError(messageFrom(cause, "The proposal could not be saved.")))
                        .finally(() => setVenueEditBusy(false));
                    }}
                  >
                    Submit proposal
                  </button>
                </>
              ) : (
                <p className={`${ELEMENT_TAG}-hint`} role="status">
                  {venueEditNotice || "Proposal submitted."}
                </p>
              )}
              {venueEditError ? (
                <p className={`${ELEMENT_TAG}-error`} role="alert">
                  {venueEditError}
                </p>
              ) : null}
            </section>
          </main>
        )}
      </div>
    );
  }

  // ── The dedicated menu screen ──────────────────────────────────────────────
  // The map is the homepage and carries no villager controls at all, so
  // everything you can change lives here behind one button that was already on
  // the map. It is written as two groups rather than one list because the split
  // is real: Village Management is the village, General settings is the tab.
  if (screen === "menu") {
    return (
      <div
        className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-sectioned-menu`}
        data-section={menuSection}
        data-mobile={mobile}
      >
        <header className={`${ELEMENT_TAG}-header`}>
          <div>
            <h1 className={`${ELEMENT_TAG}-title`}>
              {
                {
                  index: "Menu",
                  general: "General Settings",
                  village: "Village Settings",
                  debug: "DEBUG Settings",
                  noticeboard: "Noticeboard",
                }[menuSection]
              }
            </h1>
            {!mobile ? (
              <p className={`${ELEMENT_TAG}-subtitle`}>
                Everything you can change about the village lives here, away from the village itself.
              </p>
            ) : null}
          </div>
          <div className={`${ELEMENT_TAG}-actions`}>
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={menuSection !== "index" ? () => setMenuSection("index") : goHome}
            >
              {menuSection !== "index" ? "Back to menu" : "Back to the village"}
            </button>
          </div>
        </header>

        {error ? (
          <p className={`${ELEMENT_TAG}-error`} role="alert">
            {error}
          </p>
        ) : null}

        <nav className={`${ELEMENT_TAG}-mobile-menu-nav`} aria-label="Village menu">
          {menuSection === "index" ? (
            <>
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("general")}>
                General Settings
              </button>
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("village")}>
                Village Settings
              </button>
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openMenu("story")}>
                DEBUG Settings
              </button>
            </>
          ) : menuSection === "village" ? (
            <>
              {(
                [
                  ["villagers", "Villagers"],
                  ["venueRequests", "Venue Requests"],
                  ["homes", "Homes"],
                  ["map", "Town map"],
                  ["village", "Village Settings"],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  data-active={menuTab === tab}
                  onClick={() => (tab === "homes" ? openHomes() : openMenu(tab))}
                >
                  {label}
                </button>
              ))}
            </>
          ) : menuSection === "debug" ? (
            <>
              {(
                [
                  ["story", "Village Story"],
                  ["replyGuidance", "Villager reply guidance"],
                  ["chatlogs", "Venue Visits"],
                  ["agendas", "Villager Wishes"],
                  ["schedules", "Villager Agendas"],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  data-active={menuTab === tab}
                  onClick={() => openMenu(tab)}
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={!snapshot || busy || catchingUp}
                onClick={() => void writeItUpNow()}
              >
                Force Village Update
              </button>
              <p className={`${ELEMENT_TAG}-status`}>{FORCE_VILLAGE_UPDATE_NOTICE}</p>
              {writeUpNote ? (
                <p className={`${ELEMENT_TAG}-status`} role="status">
                  {writeUpNote}
                </p>
              ) : null}
            </>
          ) : null}
        </nav>

        <nav className={`${ELEMENT_TAG}-menu-nav`} aria-label="Everything you can change">
          <div className={`${ELEMENT_TAG}-menu-group`}>
            <h2 className={`${ELEMENT_TAG}-panel-title`}>Village Management</h2>
            <div className={`${ELEMENT_TAG}-menu-group-buttons`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "villagers"}
                data-active={menuTab === "villagers" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("villagers")}
              >
                {`Villagers (${snapshot?.villagers.length ?? 0})`}
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "noticeboard"}
                data-active={menuTab === "noticeboard" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("noticeboard")}
              >
                {`Noticeboard (${snapshot?.noticeboard.length ?? 0})`}
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "venueRequests"}
                data-active={menuTab === "venueRequests" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("venueRequests")}
              >
                {`Venue Requests (${(snapshot?.venueRequests?.length ?? 0) + (snapshot?.upgradeRequests?.length ?? 0) + (snapshot?.residences?.filter((entry) => entry.status === "pending" && entry.requestedBy === "villager").length ?? 0)})`}
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "homes"}
                data-active={menuTab === "homes" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={openHomes}
              >
                {`Homes (${housePlaces(snapshot?.settings.venues ?? []).length})`}
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "map"}
                data-active={menuTab === "map" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("map")}
              >
                Town map
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "village"}
                data-active={menuTab === "village" ? "true" : "false"}
                onClick={() => openMenu("village")}
              >
                Village Settings
              </button>
            </div>
          </div>
          <div className={`${ELEMENT_TAG}-menu-group`}>
            <h2 className={`${ELEMENT_TAG}-panel-title`}>General Settings</h2>
            <div className={`${ELEMENT_TAG}-menu-group-buttons`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "general"}
                data-active={menuTab === "general" ? "true" : "false"}
                onClick={() => openMenu("general")}
              >
                General settings
              </button>
            </div>
          </div>
          <div className={`${ELEMENT_TAG}-menu-group`}>
            <h2 className={`${ELEMENT_TAG}-panel-title`}>Debug</h2>
            <div className={`${ELEMENT_TAG}-menu-group-buttons`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "replyGuidance"}
                data-active={menuTab === "replyGuidance" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("replyGuidance")}
              >
                DEBUG: Villager reply guidance
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "story"}
                data-active={menuTab === "story" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("story")}
              >
                {`DEBUG: Village Story (${story?.length ?? 0})`}
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "chatlogs"}
                data-active={menuTab === "chatlogs" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("chatlogs")}
              >
                {`DEBUG: Venue Visits (${venueVisits?.length ?? 0})`}
              </button>
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "agendas"}
                data-active={menuTab === "agendas" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("agendas")}
              >
                {`DEBUG: Villager Wishes (${agendas?.length ?? 0})`}
              </button>
              {/**
                The Engine's week and the village's translation of it, which used
                to sit at the bottom of Villager Wishes. It is its own tab because
                it answers a different question — what the Engine thinks this
                person's days are — and because reading it against somebody's
                wishes, in the same column, made both harder to check.
              */}
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                aria-pressed={menuTab === "schedules"}
                data-active={menuTab === "schedules" ? "true" : "false"}
                disabled={!snapshot || busy}
                onClick={() => openMenu("schedules")}
              >
                {`Villager Agendas (${agendas?.length ?? 0})`}
              </button>
              {/*
                An action rather than a tab, so no `aria-pressed` and no
                `data-active`: it does something and stays where it is. It costs
                a model call, which is why it is the only button here that says
                so, and why it is disabled while the village is busy.
              */}
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={!snapshot || busy || catchingUp}
                onClick={() => void writeItUpNow()}
              >
                Force Village Update
              </button>
            </div>
            <p className={`${ELEMENT_TAG}-status`}>{FORCE_VILLAGE_UPDATE_NOTICE}</p>
            {writeUpNote ? (
              <p className={`${ELEMENT_TAG}-status`} role="status">
                {writeUpNote}
              </p>
            ) : null}
          </div>
        </nav>

        {menuTab === "general" ? (
          <section className={`${ELEMENT_TAG}-panel`}>
            <h2 className={`${ELEMENT_TAG}-panel-title`}>General settings</h2>

            {/* Drawn before the village is founded as well as after, because
                these belong to the agent rather than to the village. */}
            <AgentConnections />

            {snapshot ? (
              <div className={`${ELEMENT_TAG}-field`}>
                <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-story-pace`}>
                  Story pace
                </label>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life
                  from its last saved instant. Story pace controls the visual Events feed only; its prose does not
                  affect narration or village state. Schedules and other rule-driven state always advance.
                </p>
                <select
                  id={`${ELEMENT_TAG}-story-pace`}
                  value={snapshot.settings.storyPace}
                  disabled={busy}
                  onChange={(event) => void saveStoryPace(event.target.value as VillageStoryPace)}
                >
                  {snapshot.settings.storyPaces.map((pace) => (
                    <option key={pace} value={pace}>
                      {pace.charAt(0).toUpperCase() + pace.slice(1)}
                    </option>
                  ))}
                </select>
                <span className={`${ELEMENT_TAG}-hint`}>{storyPaceSummary(snapshot.settings.storyPace)}</span>
              </div>
            ) : null}

            {snapshot ? (
              <div className={`${ELEMENT_TAG}-field`}>
                <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-visit-retention`}>
                  Visit transcripts
                </label>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and
                  keeps filed memories and world changes.
                </p>
                <select
                  id={`${ELEMENT_TAG}-visit-retention`}
                  value={snapshot.settings.visitRetention.mode}
                  disabled={busy}
                  onChange={(event) => {
                    const mode = event.target.value as VillageSettings["visitRetention"]["mode"];
                    void saveVisitRetention({ mode, value: mode === "count" ? 100 : mode === "days" ? 365 : 0 });
                  }}
                >
                  <option value="forever">Keep forever</option>
                  <option value="count">Keep latest visits</option>
                  <option value="days">Retire after days</option>
                </select>
                {snapshot.settings.visitRetention.mode !== "forever" ? (
                  <input
                    key={`${snapshot.settings.visitRetention.mode}:${snapshot.settings.visitRetention.value}`}
                    type="number"
                    aria-label={
                      snapshot.settings.visitRetention.mode === "count"
                        ? "Number of visits to keep"
                        : "Days to keep visits"
                    }
                    min={snapshot.settings.visitRetention.mode === "count" ? 1 : 30}
                    max={snapshot.settings.visitRetention.mode === "count" ? 1000 : 3650}
                    defaultValue={snapshot.settings.visitRetention.value}
                    onBlur={(event) => {
                      const value = Number(event.target.value);
                      if (value !== snapshot.settings.visitRetention.value)
                        void saveVisitRetention({ mode: snapshot.settings.visitRetention.mode, value });
                    }}
                  />
                ) : null}
              </div>
            ) : null}

            <div className={`${ELEMENT_TAG}-field`}>
              <p className={`${ELEMENT_TAG}-empty`}>
                Setting the village up again is the same three questions you answered when you arrived, over the village
                as it stands now.
              </p>
              <div className={`${ELEMENT_TAG}-row`}>
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy || !snapshot}
                  onClick={() => openSetup(false, snapshot)}
                >
                  Run setup again
                </button>
                <span className={`${ELEMENT_TAG}-hint`}>
                  Keeps your villagers, their conversations and anything you have written.
                </span>
              </div>
            </div>

            <div className={`${ELEMENT_TAG}-field`}>
              <span className={`${ELEMENT_TAG}-label`}>Starting over</span>
              <p className={`${ELEMENT_TAG}-empty`}>
                This is not the same thing. It takes the village apart completely — the villagers, their conversations,
                the places, the noticeboard, your own details and the map — and hands you an empty one. There is no way
                back.
              </p>
              <div className={`${ELEMENT_TAG}-row`}>
                {resetArmed ? (
                  <>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-danger`}
                      disabled={busy}
                      onClick={() => void startOver()}
                    >
                      Yes, empty the village
                    </button>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => setResetArmed(false)}
                    >
                      Keep it
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy || !snapshot}
                    onClick={() => setResetArmed(true)}
                  >
                    Reset the village and start over
                  </button>
                )}
              </div>
            </div>

            {settingsError ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {settingsError}
              </p>
            ) : null}
          </section>
        ) : menuTab === "village" ? (
          <div className={`${ELEMENT_TAG}-menu-body`}>
            {snapshot ? (
              <section className={`${ELEMENT_TAG}-panel`}>
                <h2 className={`${ELEMENT_TAG}-panel-title`}>Village settings</h2>
                <p className={`${ELEMENT_TAG}-empty`}>
                  These choices belong to this village. Narration style shapes scene prose; resident cards shape their
                  dialogue. Village knowledge is refreshed for every reply.
                </p>

                <VillageNarrationStyleSettings />
                {mobile ? (
                  <div className={`${ELEMENT_TAG}-field`}>
                    <span className={`${ELEMENT_TAG}-label`}>Map background image</span>
                    {townMapSrc ? (
                      <img
                        className={`${ELEMENT_TAG}-mobile-map-preview`}
                        src={townMapSrc}
                        alt="Current village map background"
                      />
                    ) : (
                      <p className={`${ELEMENT_TAG}-empty`}>The map has no background image.</p>
                    )}
                    <input
                      className={`${ELEMENT_TAG}-file`}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/avif"
                      disabled={busy}
                      aria-label="Choose a town map picture"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        void pickTownMap(file);
                      }}
                    />
                    {townMapPick ? (
                      <div className={`${ELEMENT_TAG}-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={() => void saveTownMap()}
                        >
                          Use this map
                        </button>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={discardTownMapDraft}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : snapshot.settings.townMapImageSetAt ? (
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-button`}
                        disabled={busy}
                        onClick={() => void clearTownMap()}
                      >
                        Remove background image
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {/*
                  The setting below is the wizard's. It is left on screen with
                  its value in it and made read-only, rather than taken away.

                  Setting a village up is one question with two halves — the
                  world it sits in and the houses standing in it — and the
                  founding wizard asks both, in one sitting, which is what it is
                  for. Two screens writing the same village is the thing to
                  avoid, and the half-edited state between them is worse than
                  one of the two being read-only.

                  It stays on screen because what it holds is still real: the
                  setting reaches every villager through the town description,
                  and a village that has lost the place you write about it in
                  reads as a bug rather than as a division of labour.

                  The places below it are the other way round. Where the houses
                  stand is the wizard's second question; what there is to DO in
                  a place is not one of its three, so this is the only editor a
                  destination has — and a destination is the way into a
                  conversation now, which makes the list furniture rather than
                  leftover.
                */}
                <div className={`${ELEMENT_TAG}-field`}>
                  <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setting`}>
                    Setting and Theme
                  </label>
                  <textarea
                    id={`${ELEMENT_TAG}-setting`}
                    className={`${ELEMENT_TAG}-textarea ${ELEMENT_TAG}-off`}
                    value={settingDraft}
                    maxLength={snapshot.settings.settingMaxLength}
                    placeholder="A cliffside fishing town where the boats go out before dawn…"
                    disabled
                    onChange={(event) => setSettingDraft(event.target.value)}
                  />
                  <p className={`${ELEMENT_TAG}-macro-help`}>
                    Read-only here. What this place is like is the wizard&apos;s first question, asked beside where the
                    houses stand so the village is described once rather than twice; run it again to change this. What
                    is written still reaches every villager in the meantime.
                  </p>
                </div>

                <VillageLorebookPicker
                  books={lorebooks}
                  error={lorebooksError}
                  selected={lorebookDraft}
                  onChange={setLorebookDraft}
                  disabled={busy}
                />
                <div className={`${ELEMENT_TAG}-field`}>
                  <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-lore-budget`}>
                    Lorebook token budget
                  </label>
                  <input
                    id={`${ELEMENT_TAG}-lore-budget`}
                    className={`${ELEMENT_TAG}-notice-input`}
                    type="number"
                    min={snapshot.settings.loreTokenBudgetMin}
                    max={snapshot.settings.loreTokenBudgetMax}
                    step={100}
                    value={loreTokenBudgetDraft}
                    disabled={busy}
                    onChange={(event) => setLoreTokenBudgetDraft(Number(event.target.value))}
                  />
                  <p className={`${ELEMENT_TAG}-hint`}>
                    Maximum approximate lore tokens in future text generation. Image prompts keep a separate short
                    excerpt.
                  </p>
                </div>

                <section className={`${ELEMENT_TAG}-field`}>
                  <div className={`${ELEMENT_TAG}-row`} style={{ justifyContent: "space-between" }}>
                    <h2 className={`${ELEMENT_TAG}-panel-title`}>Venues</h2>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      onClick={addVenue}
                      disabled={busy || placeCount >= snapshot.settings.maxPlaces}
                    >
                      Create Venue
                    </button>
                  </div>
                  <p className={`${ELEMENT_TAG}-hint`}>
                    Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what
                    people do there.
                  </p>
                  <input
                    className={`${ELEMENT_TAG}-notice-input`}
                    type="search"
                    value={venueSearch}
                    onChange={(event) => setVenueSearch(event.target.value)}
                    placeholder="Find a Venue by name, Form, or Class"
                    aria-label="Search Venues"
                  />
                  <div className={`${ELEMENT_TAG}-notice-add`}>
                    {snapshot.settings.venues
                      .filter((venue) =>
                        `${venue.name} ${venue.form ?? ""} ${venueClassesFor(venue).join(" ")}`
                          .toLowerCase()
                          .includes(venueSearch.toLowerCase()),
                      )
                      .map((venue) => (
                        <div className={`${ELEMENT_TAG}-notice-row`} key={venue.id}>
                          <strong>{venue.name || "Unnamed Residence"}</strong>
                          <span className={`${ELEMENT_TAG}-hint`}>
                            {[venue.form, venueClassesFor(venue).join(" + ")].filter(Boolean).join(" · ")}
                          </span>
                          {venueClassesFor(venue).includes("residence") ? (
                            <span className={`${ELEMENT_TAG}-hint`}>
                              {(venue.residentIds?.length ?? Number(Boolean(venue.occupancy.residentCharacterId))) +
                                Number(venue.occupancy.playerHome)}{" "}
                              / {venue.residenceCapacity ?? 1} residents
                            </span>
                          ) : null}
                          <div className={`${ELEMENT_TAG}-row`}>
                            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openPlace(venue)}>
                              View Venue
                            </button>
                            <button
                              type="button"
                              className={`${ELEMENT_TAG}-button`}
                              onClick={() => setVenueEditDraft(structuredClone(venue))}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`${ELEMENT_TAG}-remove`}
                              onClick={() => void removeVenue(venue.id)}
                              aria-label={`Delete ${venue.name}`}
                              disabled={busy}
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                  {venueEditDraft ? (
                    <div className={`${ELEMENT_TAG}-field`}>
                      <h3 className={`${ELEMENT_TAG}-panel-title`}>
                        {snapshot.settings.venues.some((venue) => venue.id === venueEditDraft.id)
                          ? "Edit Venue"
                          : "Create Venue"}
                      </h3>
                      <VenueDraftFields
                        draft={venueEditDraft}
                        existing={snapshot.settings.venues.some((venue) => venue.id === venueEditDraft.id)}
                        villagers={snapshot.villagers}
                        onChange={setVenueEditDraft}
                      />
                      <div className={`${ELEMENT_TAG}-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={
                            busy ||
                            !venueEditDraft.name.trim() ||
                            !venueClassesFor(venueEditDraft).every((item) =>
                              venueSpaceFor(venueEditDraft, item).description.trim(),
                            )
                          }
                          onClick={() => void saveVenue(venueEditDraft)}
                        >
                          Save Venue
                        </button>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          onClick={() => setVenueEditDraft(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                  <div className={`${ELEMENT_TAG}-row`}>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      onClick={() => void suggestPlaces()}
                      disabled={busy}
                    >
                      Suggest Venues
                    </button>
                  </div>
                  {venuesDraft
                    .filter((venue) => !snapshot.settings.venues.some((saved) => saved.id === venue.id))
                    .map((venue) => (
                      <div className={`${ELEMENT_TAG}-notice-row`} key={venue.id}>
                        <strong>{venue.name}</strong>
                        <span className={`${ELEMENT_TAG}-hint`}>{venue.purpose}</span>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          onClick={() => setVenueEditDraft(venue)}
                        >
                          Review suggestion
                        </button>
                      </div>
                    ))}
                </section>
                {/*
                  The knowledge box is world context. Narration style is above;
                  each resident's own card governs their speech.
                */}
                <div className={`${ELEMENT_TAG}-field`}>
                  <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-knowledge`}>
                    The information villagers know
                  </label>
                  <textarea
                    id={`${ELEMENT_TAG}-knowledge`}
                    ref={knowledgeRef}
                    className={`${ELEMENT_TAG}-preset`}
                    value={knowledgeDraft}
                    maxLength={snapshot.settings.promptBoxMaxLength}
                    spellCheck={false}
                    onChange={(event) => setKnowledgeDraft(event.target.value)}
                  />
                  <p className={`${ELEMENT_TAG}-macro-help`}>
                    What a villager here knows, written as tokens the village fills in for itself: the time, the
                    weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every
                    reply, a villager here is always current — and because it is only these tokens, adding a place or
                    pinning a note reaches every villager without anything being edited here. A resident&apos;s card and
                    the DEBUG Villager reply guidance govern how they respond.
                  </p>
                  <div className={`${ELEMENT_TAG}-macros`}>
                    {snapshot.settings.macros.map((macro) => (
                      <button
                        key={macro.token}
                        type="button"
                        className={`${ELEMENT_TAG}-macro`}
                        title={`${macro.label} — ${macro.help}`}
                        onClick={() => insertMacro(macro.token)}
                      >
                        {macro.token}
                      </button>
                    ))}
                  </div>
                  <p className={`${ELEMENT_TAG}-macro-help`}>
                    Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into
                    nothing at all, so <code>{"{{lore}}"}</code> can sit in the prompt until there is lore to put there.
                  </p>
                </div>

                <PlayerIdentityEditor
                  idPrefix="settings"
                  personas={personas}
                  draft={personaDraft}
                  onDraft={setPersonaDraft}
                  storedId={snapshot.settings.playerPersonaId}
                  storedName={snapshot.settings.playerPersonaName}
                  storedMissing={snapshot.settings.playerPersonaMissing}
                  disabled={busy}
                />

                <div className={`${ELEMENT_TAG}-row`}>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    onClick={() => void saveSettings()}
                    disabled={busy}
                  >
                    Save settings
                  </button>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    onClick={() => {
                      setKnowledgeDraft(snapshot.settings.defaultPromptKnowledge);
                    }}
                    disabled={busy}
                  >
                    Restore the default box
                  </button>
                  <span className={`${ELEMENT_TAG}-hint`}>
                    {knowledgeDraft === snapshot.settings.promptKnowledge &&
                    personaDraft === snapshot.settings.playerPersonaId &&
                    settingDraft === snapshot.settings.setting &&
                    JSON.stringify(lorebookDraft) === JSON.stringify(snapshot.settings.selectedLorebookIds)
                      ? "No unsaved settings changes. Save places individually."
                      : "Unsaved settings changes. Save places individually."}
                  </span>
                </div>
              </section>
            ) : null}

            {settingsError ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {settingsError}
              </p>
            ) : null}
          </div>
        ) : (
          // The four panels that used to be stacked beside the map. They are
          // unchanged; only what opens them has moved. `Look again` in the nav
          // reads the village afresh, so a panel is never stale by the time it
          // is opened.
          <div className={`${ELEMENT_TAG}-menu-body`}>
            {menuTab === "villagers" ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Villagers</h2>
                </div>
                <nav className={`${ELEMENT_TAG}-villager-submenu`} aria-label="Villagers sections">
                  <button
                    type="button"
                    data-active={villagersSection === "residents"}
                    aria-pressed={villagersSection === "residents"}
                    onClick={() => setVillagersSection("residents")}
                  >
                    <span>Residents</span>
                    <small>{snapshot?.villagers.length ?? 0} living here</small>
                  </button>
                  <button
                    type="button"
                    data-active={villagersSection === "memories"}
                    aria-pressed={villagersSection === "memories"}
                    onClick={() => {
                      setVillagersSection("memories");
                      setMemoryLibrary(null);
                      void loadMemoryLibrary();
                    }}
                  >
                    <span>Memories</span>
                    <small>Passing, durable & evidence</small>
                  </button>
                </nav>
                {villagersSection === "residents" ? (
                  <>
                    <p className={`${ELEMENT_TAG}-empty`}>
                      Characters from your library live here. Moving someone out forgets nothing about the character
                      card itself.
                    </p>
                    <div className={`${ELEMENT_TAG}-row`}>
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-button`}
                        onClick={() => setPickerOpen((open) => !open)}
                        disabled={busy}
                      >
                        {pickerOpen ? "Close the list" : "Add a villager"}
                      </button>
                    </div>
                    {pickerOpen ? (
                      <div className={`${ELEMENT_TAG}-field`}>
                        <input
                          className={`${ELEMENT_TAG}-search`}
                          type="search"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search by name, note or tag…"
                          aria-label="Search your character library"
                        />
                        {catalog === null ? (
                          <p className={`${ELEMENT_TAG}-empty`} style={{ marginTop: ".625rem" }}>
                            Reading your library…
                          </p>
                        ) : visibleCatalog.length === 0 ? (
                          <p className={`${ELEMENT_TAG}-empty`} style={{ marginTop: ".625rem" }}>
                            No characters match that search.
                          </p>
                        ) : (
                          <div className={`${ELEMENT_TAG}-picker-list`}>
                            {visibleCatalog.map((entry) => (
                              <div
                                key={entry.id}
                                className={`${ELEMENT_TAG}-picker-item`}
                                data-resident={entry.inVillage ? "true" : "false"}
                              >
                                <AvatarFace
                                  portrait={portraits[entry.id]}
                                  name={entry.name}
                                  className={`${ELEMENT_TAG}-avatar`}
                                />
                                <div className={`${ELEMENT_TAG}-picker-text`}>
                                  <div className={`${ELEMENT_TAG}-villager-name`}>{entry.name}</div>
                                  <div className={`${ELEMENT_TAG}-villager-role`}>
                                    {entry.comment || entry.tags.slice(0, 3).join(" · ")}
                                  </div>
                                  {entry.summary ? (
                                    <p className={`${ELEMENT_TAG}-tile-summary`}>{entry.summary}</p>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  className={`${ELEMENT_TAG}-button`}
                                  onClick={() => void addVillager(entry.id)}
                                  disabled={busy || entry.inVillage}
                                >
                                  {entry.inVillage ? "Lives here" : "Move in"}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                    {snapshot && snapshot.villagers.length > 0 ? (
                      <>
                        <div className={`${ELEMENT_TAG}-villagers`}>
                          {snapshot.villagers.map((villager) => (
                            <VillagerTile
                              key={villager.characterId}
                              villager={villager}
                              portrait={portraits[villager.characterId]}
                              selected={false}
                              // A resident's name leads to the venue they currently
                              // occupy. Conversation belongs to that venue visit.
                              onSelect={
                                !villager.place || room !== null
                                  ? undefined
                                  : () => {
                                      const place = snapshot.settings.venues.find(
                                        (entry) => entry.id === villager.place?.id,
                                      );
                                      if (place) openVenue(place);
                                    }
                              }
                            />
                          ))}
                        </div>
                        <div className={`${ELEMENT_TAG}-roster`}>
                          {snapshot.villagers.map((villager) => (
                            <div key={villager.characterId} className={`${ELEMENT_TAG}-roster-entry`}>
                              <div className={`${ELEMENT_TAG}-roster-row`}>
                                <div>
                                  <span className={`${ELEMENT_TAG}-villager-name`}>{villager.name}</span>
                                  {villager.missing ? (
                                    <span className={`${ELEMENT_TAG}-badge`}>card missing</span>
                                  ) : null}
                                  {refreshPreviews[villager.characterId] ? (
                                    <div className={`${ELEMENT_TAG}-tile-summary`}>
                                      {refreshPreviews[villager.characterId].changed
                                        ? `New card: ${refreshPreviews[villager.characterId].proposed?.name ?? "unavailable"}`
                                        : refreshPreviews[villager.characterId].sourceAvailable
                                          ? `Snapshot revision ${refreshPreviews[villager.characterId].current.revision} is current.`
                                          : "The saved snapshot remains playable; the source card is unavailable."}
                                    </div>
                                  ) : null}
                                </div>
                                <span className={`${ELEMENT_TAG}-row`}>
                                  <button
                                    type="button"
                                    className={`${ELEMENT_TAG}-button`}
                                    onClick={() =>
                                      setSpriteEditorId(
                                        spriteEditorId === villager.characterId ? null : villager.characterId,
                                      )
                                    }
                                    aria-expanded={spriteEditorId === villager.characterId}
                                  >
                                    {spriteEditorId === villager.characterId
                                      ? "Close sprite studio"
                                      : `Sprites · ${villager.sprite?.images.length ?? 0} approved`}
                                  </button>
                                  <button
                                    type="button"
                                    className={`${ELEMENT_TAG}-button`}
                                    onClick={() => void previewVillagerRefresh(villager.characterId)}
                                    disabled={busy || refreshBusyId.length > 0}
                                  >
                                    Compare card
                                  </button>
                                  {refreshPreviews[villager.characterId]?.changed &&
                                  refreshPreviews[villager.characterId]?.sourceAvailable ? (
                                    <button
                                      type="button"
                                      className={`${ELEMENT_TAG}-button`}
                                      onClick={() => void applyVillagerRefresh(villager.characterId)}
                                      disabled={busy || refreshBusyId.length > 0}
                                    >
                                      Apply refresh
                                    </button>
                                  ) : null}
                                  <button
                                    type="button"
                                    className={`${ELEMENT_TAG}-button`}
                                    onClick={() => void removeVillager(villager.characterId)}
                                    disabled={busy || refreshBusyId.length > 0}
                                  >
                                    Move out
                                  </button>
                                </span>
                              </div>
                              {spriteEditorId === villager.characterId ? (
                                <ResidentSpriteEditor villager={villager} onSaved={setSnapshot} />
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className={`${ELEMENT_TAG}-empty`}>
                        Nobody lives here yet. If you have just founded the village, the people you named are on their
                        way.
                      </p>
                    )}
                  </>
                ) : (
                  <VillagerMemoriesPanel
                    library={memoryLibrary}
                    busy={busy}
                    onRefresh={() => {
                      setMemoryLibrary(null);
                      void loadMemoryLibrary();
                    }}
                    onForget={(kind, id) => void forgetMemory(kind, id)}
                  />
                )}
              </div>
            ) : null}

            {menuTab === "noticeboard" && snapshot ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Noticeboard</h2>
                </div>
                {snapshot.noticeboard.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>
                    Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation
                    — and they will pin notes of their own up as time goes on.
                  </p>
                ) : (
                  <ul className={`${ELEMENT_TAG}-notices`}>
                    {snapshot.noticeboard.map((notice, index) => (
                      <li key={`${index}:${notice.text}`} className={`${ELEMENT_TAG}-notice-row`}>
                        <span>
                          {/* The signature first, the way a note on a board is
                              read: who is asking, then what they want. Your
                              own pins have no name on them — everyone here
                              already knows who you are. */}
                          {notice.author.length > 0 ? (
                            <span className={`${ELEMENT_TAG}-notice-author`}>{`${notice.author}: `}</span>
                          ) : null}
                          {notice.text}
                        </span>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-remove`}
                          onClick={() => void removeNotice(index)}
                          disabled={busy}
                          aria-label={`Take down: ${notice.text}`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className={`${ELEMENT_TAG}-notice-add`}>
                  <input
                    className={`${ELEMENT_TAG}-notice-input`}
                    type="text"
                    value={noticeDraft}
                    maxLength={snapshot.settings.maxNoticeLength}
                    placeholder="Pin up a rumour, an event, a rule…"
                    aria-label="New noticeboard note"
                    onChange={(event) => setNoticeDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return;
                      event.preventDefault();
                      void addNotice();
                    }}
                  />
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    onClick={() => void addNotice()}
                    disabled={
                      busy ||
                      noticeDraft.trim().length === 0 ||
                      snapshot.noticeboard.length >= snapshot.settings.maxNoticeboardNotes
                    }
                  >
                    {`Pin it up (${snapshot.noticeboard.length}/${snapshot.settings.maxNoticeboardNotes})`}
                  </button>
                </div>
              </div>
            ) : null}

            {menuTab === "venueRequests" && snapshot ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Venue Requests</h2>
                </div>
                <p className={`${ELEMENT_TAG}-macro-help`}>
                  Villagers can ask for places in conversation or during village life. A place joins the village only
                  when you approve it here. Taking down a notice does not change a request.
                </p>
                {snapshot.venueRequests.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>Nobody has requested a new place.</p>
                ) : (
                  <ul className={`${ELEMENT_TAG}-notices`}>
                    {snapshot.venueRequests.map((entry) => {
                      const draft = requestEdits[entry.id] ?? entry.venueDraft;
                      const edit = (patch: Partial<typeof draft>) =>
                        setRequestEdits((current) => ({ ...current, [entry.id]: { ...draft, ...patch } }));
                      return (
                        <li key={entry.id} className={`${ELEMENT_TAG}-notice-row`}>
                          <div className={`${ELEMENT_TAG}-field`}>
                            <strong>{entry.requesterName || "A villager"}</strong>
                            <span className={`${ELEMENT_TAG}-hint`}>
                              {` · ${entry.source === "chat" ? "Conversation" : "Village life"}`}
                            </span>
                            <input
                              className={`${ELEMENT_TAG}-notice-input`}
                              value={draft.name}
                              maxLength={snapshot.settings.maxVenueNameLength}
                              aria-label={`Requested place name from ${entry.requesterName || "villager"}`}
                              onChange={(event) => edit({ name: event.target.value })}
                            />
                            <input
                              className={`${ELEMENT_TAG}-notice-input`}
                              value={draft.purpose}
                              maxLength={snapshot.settings.maxVenueNoteLength}
                              aria-label={`Requested place purpose from ${entry.requesterName || "villager"}`}
                              onChange={(event) => edit({ purpose: event.target.value })}
                            />
                            <input
                              className={`${ELEMENT_TAG}-notice-input`}
                              value={draft.category}
                              maxLength={snapshot.settings.maxVenueNoteLength}
                              placeholder="Category (optional)"
                              aria-label={`Requested place category from ${entry.requesterName || "villager"}`}
                              onChange={(event) => edit({ category: event.target.value })}
                            />
                            <textarea
                              className={`${ELEMENT_TAG}-textarea`}
                              value={draft.description ?? ""}
                              maxLength={1000}
                              aria-label={`Requested place description from ${entry.requesterName || "villager"}`}
                              onChange={(event) => edit({ description: event.target.value })}
                            />
                            <button
                              type="button"
                              className={`${ELEMENT_TAG}-button`}
                              disabled={busy || !draft.name.trim()}
                              onClick={() => {
                                setBusy(true);
                                setSettingsError("");
                                void request<{ descriptions: Record<string, string> }>(
                                  "/locations/venue/descriptions/draft",
                                  {
                                    method: "POST",
                                    body: JSON.stringify({
                                      venues: [{ id: entry.id, name: draft.name, purpose: draft.purpose }],
                                    }),
                                  },
                                )
                                  .then((result) => edit({ description: result.descriptions[entry.id] ?? "" }))
                                  .catch((cause) =>
                                    setSettingsError(
                                      messageFrom(cause, "The description draft could not be generated."),
                                    ),
                                  )
                                  .finally(() => setBusy(false));
                              }}
                            >
                              Generate description draft
                            </button>
                            <div className={`${ELEMENT_TAG}-row`}>
                              <button
                                type="button"
                                className={`${ELEMENT_TAG}-button`}
                                disabled={
                                  busy || !draft.name.trim() || !draft.purpose.trim() || !draft.description?.trim()
                                }
                                onClick={() => void decideVenueRequest(entry, true)}
                              >
                                {draft.name !== entry.venueDraft.name ||
                                draft.purpose !== entry.venueDraft.purpose ||
                                draft.category !== entry.venueDraft.category
                                  ? "Send counteroffer"
                                  : "Approve exact request"}
                              </button>
                              <button
                                type="button"
                                className={`${ELEMENT_TAG}-button`}
                                disabled={busy}
                                onClick={() => void decideVenueRequest(entry, false)}
                              >
                                Deny
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <h3 className={`${ELEMENT_TAG}-panel-title`}>Home upgrade requests</h3>
                {snapshot.upgradeRequests.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-hint`}>No home upgrades requested.</p>
                ) : (
                  snapshot.upgradeRequests.map((entry) => (
                    <div key={entry.id} className={`${ELEMENT_TAG}-notice-row`}>
                      <span>{entry.detail}</span>
                      {([true, false] as const).map((approved) => (
                        <button
                          key={String(approved)}
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={() => {
                            setBusy(true);
                            setSettingsError("");
                            void request<VillageSnapshot>(
                              `/venue-upgrades/${encodeURIComponent(entry.id)}/${approved ? "approve" : "deny"}`,
                              { method: "POST" },
                            )
                              .then(setSnapshot)
                              .catch((cause) =>
                                setSettingsError(messageFrom(cause, "The upgrade request could not be decided.")),
                              )
                              .finally(() => setBusy(false));
                          }}
                        >
                          {approved ? "Approve upgrade" : "Deny"}
                        </button>
                      ))}
                    </div>
                  ))
                )}
                <h3 className={`${ELEMENT_TAG}-panel-title`}>Resident move requests</h3>
                {snapshot.residences.filter((entry) => entry.status !== "current").length === 0 ? (
                  <p className={`${ELEMENT_TAG}-hint`}>No moves pending.</p>
                ) : (
                  snapshot.residences
                    .filter((entry) => entry.status !== "current")
                    .map((entry) => {
                      const name = nameOfCharacter(entry.characterId);
                      const target =
                        snapshot.settings.venues.find((venue) => venue.id === entry.proposedVenueId)?.name ||
                        "another venue";
                      return (
                        <div key={entry.characterId} className={`${ELEMENT_TAG}-notice-row`}>
                          <span>{`${name} → ${target}`}</span>
                          {entry.status === "moving" ? (
                            <>
                              <span className={`${ELEMENT_TAG}-hint`}>
                                Move due {new Date(entry.completesAt ?? "").toLocaleString()}
                              </span>
                              <button
                                type="button"
                                className={`${ELEMENT_TAG}-button`}
                                disabled={busy}
                                onClick={() => {
                                  setBusy(true);
                                  setSettingsError("");
                                  void request<VillageSnapshot>("/residences/debug/complete-now", {
                                    method: "POST",
                                    body: JSON.stringify({ characterId: entry.characterId }),
                                  })
                                    .then(setSnapshot)
                                    .catch((cause) =>
                                      setSettingsError(messageFrom(cause, "The move could not be completed.")),
                                    )
                                    .finally(() => setBusy(false));
                                }}
                              >
                                DEBUG: Complete move now
                              </button>
                            </>
                          ) : entry.requestedBy === "player" ? (
                            <span className={`${ELEMENT_TAG}-hint`}>
                              Awaiting {name}&apos;s answer in conversation.
                            </span>
                          ) : (
                            ([true, false] as const).map((approved) => (
                              <button
                                key={String(approved)}
                                type="button"
                                className={`${ELEMENT_TAG}-button`}
                                disabled={busy}
                                onClick={() => {
                                  setBusy(true);
                                  setSettingsError("");
                                  void request<VillageSnapshot>(`/residences/${approved ? "approvals" : "denials"}`, {
                                    method: "POST",
                                    body: JSON.stringify({ characterId: entry.characterId }),
                                  })
                                    .then(setSnapshot)
                                    .catch((cause) =>
                                      setSettingsError(messageFrom(cause, "The move request could not be decided.")),
                                    )
                                    .finally(() => setBusy(false));
                                }}
                              >
                                {approved ? "Approve move" : "Deny"}
                              </button>
                            ))
                          )}
                        </div>
                      );
                    })
                )}
                {settingsError ? (
                  <p className={`${ELEMENT_TAG}-error`} role="alert">
                    {settingsError}
                  </p>
                ) : null}
              </div>
            ) : null}

            {menuTab === "homes" && snapshot ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Homes on the map</h2>
                </div>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a
                  normal thing for a village to have, and the villagers are told about the occupied ones and nothing
                  else.
                </p>
                <div className={`${ELEMENT_TAG}-row`}>
                  {/* The list cannot also be the map, so this hands the tab
                      over for one click and comes straight back with the new
                      row on it. */}
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy || homesDraft.length >= houseLimit}
                    onClick={() => {
                      setPlacingHome(true);
                      goHome();
                    }}
                  >
                    Put a home on the map
                  </button>
                  <span className={`${ELEMENT_TAG}-hint`}>{`${homesDraft.length} of at most ${houseLimit}`}</span>
                </div>
                {homesDraft.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>No homes on the map yet.</p>
                ) : (
                  <HomeRows
                    homes={homesDraft}
                    villagers={(snapshot?.villagers ?? []).map((villager) => ({
                      id: villager.characterId,
                      name: villager.name,
                    }))}
                    disabled={busy}
                    selectedId={activeHomeId}
                    onPatch={patchHome}
                    onRemove={removeHome}
                    onSelect={setActiveHomeId}
                    showDescriptions
                    onGenerateDescription={(home) => void generateHomeDescription(home)}
                    lockedIds={
                      new Set(
                        snapshot.settings.venues
                          .filter((venue) => venue.occupancy.residentCharacterId)
                          .map((venue) => venue.id),
                      )
                    }
                  />
                )}
                <div className={`${ELEMENT_TAG}-row`}>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy}
                    onClick={() => void saveHomes()}
                  >
                    Save the homes
                  </button>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-button`}
                    disabled={busy}
                    onClick={() => seedHomes(snapshot.settings.venues)}
                  >
                    Put them back
                  </button>
                  <span className={`${ELEMENT_TAG}-hint`}>
                    {homesMatch(snapshot.settings.venues, homesDraft) ? "No unsaved changes." : "Unsaved changes."}
                  </span>
                </div>
              </div>
            ) : null}

            {menuTab === "map" && snapshot ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Town map</h2>
                </div>
                <p className={`${ELEMENT_TAG}-empty`}>
                  The optional picture beneath the village&apos;s logical map. Upload one here, or leave the navigation
                  surface clean; venue pins work in either case.
                </p>

                {/*
                  The frame itself, at the shape a map is really drawn in. "Does
                  this look right" is a question about a picture, so the answer
                  is given with the picture rather than with a description of it
                  — the same component the homepage draws, so what is agreed
                  here is what will be drawn there.
                */}
                <MapStage
                  src={townMapSrc}
                  alt="A preview of the town map, framed the way it will be drawn in the village."
                  pins={snapshot.settings.venues.flatMap((venue): MapPin[] => {
                    const spot = placeSpot(venue);
                    if (!spot) return [];
                    const resident = venue.occupancy.residentCharacterId
                      ? nameOfCharacter(venue.occupancy.residentCharacterId)
                      : venue.occupancy.playerHome
                        ? playerDisplayName(snapshot)
                        : "";
                    return [
                      {
                        id: venue.id,
                        x: spot.x,
                        y: spot.y,
                        text: resident ? `${venue.name || "Home"} · ${resident}` : venue.name,
                        tone: isHouse(venue)
                          ? pinTone({
                              isPlayerHome: venue.occupancy.playerHome,
                              occupant: venue.occupancy.residentCharacterId,
                            })
                          : "venue",
                        onSelect: () => setSelectedMapVenueId(venue.id),
                      },
                    ];
                  })}
                  placing={placingMapVenueId !== null}
                  view={panelMapView}
                  shape={townMapShape}
                  zoom={townMapZoom}
                  onView={framingMap ? setTownMapDraft : undefined}
                  onPlace={
                    placingMapVenueId
                      ? (x, y) => {
                          const venueId = placingMapVenueId;
                          setBusy(true);
                          setSettingsError("");
                          void request<VillageSnapshot>(`/locations/venue/${encodeURIComponent(venueId)}`, {
                            method: "PUT",
                            body: JSON.stringify({ presentation: { x, y } }),
                          })
                            .then(setSnapshot)
                            .catch((cause) => setSettingsError(messageFrom(cause, "The venue could not be placed.")))
                            .finally(() => {
                              setBusy(false);
                              setPlacingMapVenueId(null);
                            });
                        }
                      : undefined
                  }
                />
                <div className={`${ELEMENT_TAG}-field`}>
                  <span className={`${ELEMENT_TAG}-label`}>Venue positions and residents</span>
                  {snapshot.settings.venues.map((venue) => {
                    const resident = venue.occupancy.residentCharacterId
                      ? nameOfCharacter(venue.occupancy.residentCharacterId)
                      : venue.occupancy.playerHome
                        ? playerDisplayName(snapshot)
                        : "";
                    const occupied = Boolean(venue.occupancy.residentCharacterId);
                    return (
                      <div key={venue.id} className={`${ELEMENT_TAG}-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          aria-pressed={selectedMapVenueId === venue.id}
                          onClick={() => setSelectedMapVenueId(venue.id)}
                        >
                          {venue.name || "Home"}
                        </button>
                        <span className={`${ELEMENT_TAG}-hint`}>
                          {resident ? `Lives here: ${resident}` : "No villager lives here"}
                        </span>
                        <span className={`${ELEMENT_TAG}-hint`}>{placeSpot(venue) ? "On map" : "Not placed"}</span>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy || occupied}
                          onClick={() => {
                            setSelectedMapVenueId(venue.id);
                            setPlacingMapVenueId(venue.id);
                          }}
                        >
                          {placeSpot(venue) ? "Move pin" : "Place pin"}
                        </button>
                      </div>
                    );
                  })}
                  {placingMapVenueId ? (
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      onClick={() => setPlacingMapVenueId(null)}
                    >
                      Cancel pin placement
                    </button>
                  ) : null}
                  {settingsError ? (
                    <p className={`${ELEMENT_TAG}-error`} role="alert">
                      {settingsError}
                    </p>
                  ) : null}
                </div>

                {framingMap ? (
                  <>
                    <div className={`${ELEMENT_TAG}-steps`} role="group" aria-label="How the picture sits in the frame">
                      {TOWN_MAP_FITS.map((option) => (
                        <button
                          key={option.fit}
                          type="button"
                          className={`${ELEMENT_TAG}-step`}
                          // These ones are a control, unlike the wizard's chips.
                          data-clickable="true"
                          data-active={panelMapView.fit === option.fit ? "true" : "false"}
                          aria-pressed={panelMapView.fit === option.fit}
                          onClick={() => setTownMapDraft({ ...panelMapView, fit: option.fit })}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <p className={`${ELEMENT_TAG}-hint`}>
                      {TOWN_MAP_FITS.find((option) => option.fit === panelMapView.fit)?.help}
                    </p>
                  </>
                ) : null}

                {townMapAdvice ? (
                  <p className={`${ELEMENT_TAG}-hint`} data-tone={townMapAdvice.tone}>
                    {townMapAdvice.text}
                  </p>
                ) : null}

                <div className={`${ELEMENT_TAG}-row`}>
                  <input
                    className={`${ELEMENT_TAG}-file`}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    disabled={busy}
                    aria-label="Choose a town map picture"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      // Cleared so picking the same file twice still counts as
                      // a choice; the File object itself is already in hand.
                      event.target.value = "";
                      void pickTownMap(file);
                    }}
                  />
                  {snapshot.settings.townMapImageSetAt ? (
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => void clearTownMap()}
                    >
                      Remove background image
                    </button>
                  ) : null}
                </div>

                {framingMap ? (
                  <div className={`${ELEMENT_TAG}-row`}>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={() => void saveTownMap()}
                    >
                      {townMapPick ? "Use this map" : "Keep this framing"}
                    </button>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy}
                      onClick={discardTownMapDraft}
                    >
                      Leave it as it was
                    </button>
                  </div>
                ) : (
                  <div className={`${ELEMENT_TAG}-row`}>
                    <p className={`${ELEMENT_TAG}-hint`}>
                      {snapshot.settings.townMapImageSetAt
                        ? "Your own map is drawn at the moment."
                        : "The logical map is drawn without a background image."}
                    </p>
                    {snapshot.settings.townMapImageSetAt ? (
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-button`}
                        disabled={busy}
                        onClick={() => setReframingMap(true)}
                      >
                        Crop or fit it again
                      </button>
                    ) : null}
                  </div>
                )}

                <p className={`${ELEMENT_TAG}-macro-help`}>
                  Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on
                  desktop. It is stored with the village so it travels with a backup. A picture that is too large is
                  refused before upload rather than silently shrunk.
                </p>

                {/*
                  Pictures of the destinations, read only here. Edit Room owns
                  generation, upload and removal for every kind of venue.

                  It sits on the map tab because that is where the village's
                  pictures are kept — the map, and then everything on it — and the
                  names come from the SAVED village rather than from the places
                  editor's drafts, so a picture can be given to a place without
                  anything about that place being edited, and an unsaved rename
                  cannot leave a picture hanging off a name that was never saved.

                  The houses are not in this list, and that is the one list in
                  this tab that is deliberately half of the village: a house has
                  no name for a column like this to print, and it is pictured from
                  its own screen on the map, which is where the player is standing
                  when they decide what a building should look like. The
                  destinations have no such screen to stand on — they are walked
                  past rather than into — so this is where they are pictured.

                  Every control here is a button somebody presses. Nothing on
                  this section fires on its own, which is what makes "a picture
                  is only ever drawn when you ask for one" true of the tab and
                  not merely of the route behind it.
                */}
                <div className={`${ELEMENT_TAG}-field`}>
                  <span className={`${ELEMENT_TAG}-label`}>Pictures of the places</span>
                  <p className={`${ELEMENT_TAG}-macro-help`}>
                    What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove
                    its picture. Nothing is drawn automatically. These are kept in the{" "}
                    <strong>{snapshot.settings.villageGalleryFolderName}</strong> folder of the Engine&apos;s own
                    gallery rather than with the village, so they are yours to reuse or throw away from there, and a
                    village with twenty pictured places stays as small as one with none.
                  </p>

                  {destinationPlaces(snapshot.settings.venues).length === 0 ? (
                    <p className={`${ELEMENT_TAG}-empty`}>No places yet, so there is nothing to draw.</p>
                  ) : (
                    <ul className={`${ELEMENT_TAG}-places`}>
                      {destinationPlaces(snapshot.settings.venues).map((venue) => {
                        return (
                          <li key={venue.id} className={`${ELEMENT_TAG}-place`}>
                            {venue.presentation.image ? (
                              <img
                                className={`${ELEMENT_TAG}-place-thumb`}
                                src={venue.presentation.image.url}
                                alt=""
                                loading="lazy"
                              />
                            ) : (
                              // A place with no picture is not a broken picture:
                              // it is the same box, drawn empty, so the column
                              // still reads as a column of pictures and the
                              // missing ones are visibly missing rather than
                              // silently absent.
                              <span className={`${ELEMENT_TAG}-place-thumb`} data-empty="true" aria-hidden="true" />
                            )}
                            <div className={`${ELEMENT_TAG}-place-body`}>
                              <span className={`${ELEMENT_TAG}-place-name`}>{venue.name}</span>
                              <div className={`${ELEMENT_TAG}-row`}>
                                <button
                                  type="button"
                                  className={`${ELEMENT_TAG}-button`}
                                  disabled={busy}
                                  onClick={() => {
                                    openPlace(venue);
                                  }}
                                >
                                  View Venue
                                </button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}

            {/*
              The village's own memory, laid out the way it is kept: newest day
              first, newest memory first within it.

              This is a read-and-forget surface and nothing here can change how
              the village behaves. Gathered memories are what the prompt is fed
              and are worth being able to look at, because the only other way to
              find out what a village believes about you is to ask one of its
              villagers and hope they bring it up.
            */}
            {menuTab === "replyGuidance" ? <VillagerReplyGuidanceDebug /> : null}

            {menuTab === "story" ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Village story</h2>
                </div>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Memories from conversations and favors can guide residents. Older model-written tick entries are kept
                  here for review but no longer affect the village while Events is being rebuilt. A private memory is
                  known only to the people named on it and to you. Deleting one here is permanent.
                </p>

                {story === null ? (
                  <p className={`${ELEMENT_TAG}-empty`}>Reading what the village remembers…</p>
                ) : story.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>
                    Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories.
                  </p>
                ) : (
                  storyDays(story).map((day) => (
                    // Days are the grouping and memories are the list, so the
                    // heading is a heading and the rows are list items rather
                    // than one list with the dates interleaved into it.
                    <section key={`${day.label}:${day.entries[0]?.id ?? ""}`}>
                      <h3 className={`${ELEMENT_TAG}-story-day`}>{day.label}</h3>
                      <ul className={`${ELEMENT_TAG}-story`}>
                        {day.entries.map((entry) => {
                          const time = storyTime(entry);
                          // A private memory always names somebody: the server
                          // drops one that names nobody rather than filing it
                          // against no one, so this only has to decide how to
                          // say it, not whether it is possible.
                          const who = entry.actors.map((actor) => actor.name).join(", ");
                          return (
                            <li key={entry.id} className={`${ELEMENT_TAG}-story-row`}>
                              <span>
                                {time.length > 0 || entry.scope === "private" || entry.kind === "favour" ? (
                                  <span className={`${ELEMENT_TAG}-story-meta`}>
                                    {time}
                                    {entry.scope === "private" ? (
                                      <span className={`${ELEMENT_TAG}-story-scope`}>{` · private to ${who}`}</span>
                                    ) : null}
                                    {/* Everything else in this list is the
                                        village happening to itself. This is the
                                        one kind the player caused, and the one
                                        the trimming is built to keep. */}
                                    {entry.kind === "favour" ? (
                                      <span className={`${ELEMENT_TAG}-story-scope`}> · a favour</span>
                                    ) : null}
                                    {entry.kind === "tick" ? (
                                      <span className={`${ELEMENT_TAG}-story-scope`}> · legacy Events prose</span>
                                    ) : null}
                                  </span>
                                ) : null}
                                {entry.text}
                              </span>
                              <button
                                type="button"
                                className={`${ELEMENT_TAG}-remove`}
                                disabled={busy}
                                onClick={() => void removeStoryEntry(entry.id)}
                                aria-label={`Forget: ${entry.text}`}
                              >
                                ×
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))
                )}
                {story && story.length < storyTotal ? (
                  <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => void loadMoreStory()}>
                    Load more memories ({story.length} of {storyTotal})
                  </button>
                ) : null}
              </div>
            ) : null}

            {/*
              What was actually said, kept for the player and read by nothing.
              The story above is the village's own memory of these same
              conversations, which is a villager's account of what mattered; this
              is the transcript they were drawn from, which is the only way to
              tell whether the account is fair. It is deliberately not part of
              the village's record in any other sense: no prompt is built from
              it, so nothing here can change how the village behaves.
            */}
            {menuTab === "chatlogs" ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Venue visits</h2>
                </div>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Completed venue visits are kept here word for word. Filter by place or resident; each visit has one
                  shared record, including who heard each line. The village uses only the separately distilled memories.
                </p>
                <div className={`${ELEMENT_TAG}-row`}>
                  <select
                    aria-label="Filter visits by venue"
                    value={archiveVenueId}
                    onChange={(event) => {
                      setArchiveVenueId(event.target.value);
                      setArchiveOffset(0);
                      setOpenArchivedVisit(null);
                    }}
                  >
                    <option value="">All venues</option>
                    {(snapshot?.settings.venues ?? []).map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter visits by resident"
                    value={archiveVillagerId}
                    onChange={(event) => {
                      setArchiveVillagerId(event.target.value);
                      setArchiveOffset(0);
                      setOpenArchivedVisit(null);
                    }}
                  >
                    <option value="">All residents</option>
                    {(snapshot?.villagers ?? []).map((villager) => (
                      <option key={villager.characterId} value={villager.characterId}>
                        {villager.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy || archiveTotal === 0}
                  onClick={() => void deleteArchivedVisits()}
                >
                  Delete all completed logs
                </button>
                {archiveError ? (
                  <p className={`${ELEMENT_TAG}-error`} role="alert">
                    {archiveError}
                  </p>
                ) : null}
                {venueVisits === null ? (
                  <p className={`${ELEMENT_TAG}-empty`}>Reading venue visits…</p>
                ) : venueVisits.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>No completed visits match these filters.</p>
                ) : (
                  venueVisits.map((visit) => (
                    <section key={visit.id}>
                      <h3 className={`${ELEMENT_TAG}-story-day`}>
                        {visit.placeName} · {stampTime(visit.startedAt)}
                      </h3>
                      <p className={`${ELEMENT_TAG}-story-meta`}>
                        {visit.participants.map((person) => person.name).join(", ")} · {visit.lineCount} lines
                        {visit.endReason === "inactivity" ? " · Interrupted: Inactivity" : ""}
                        {visit.memoryPending
                          ? visit.memoryReview?.status === "pending"
                            ? ` · durable review pending · ${visit.memoryReview.attempts} ${visit.memoryReview.attempts === 1 ? "attempt" : "attempts"}`
                            : ` · legacy memory pending (${visit.memoryProgress?.nextUnit ?? 0}/${visit.memoryUnits} pieces processed)`
                          : ""}
                      </p>
                      <div className={`${ELEMENT_TAG}-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          onClick={() => void openVisit(visit.id)}
                        >
                          {openArchivedVisit?.id === visit.id ? "Refresh transcript" : "Open transcript"}
                        </button>
                        {visit.memoryPending ? (
                          <button
                            type="button"
                            className={`${ELEMENT_TAG}-button`}
                            disabled={busy}
                            onClick={() => void retryVisitMemory(visit.id)}
                          >
                            {visit.memoryReview?.status === "pending" ? "Retry review" : "Retry memory"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={() => void deleteArchivedVisits(visit.id)}
                        >
                          Delete log
                        </button>
                      </div>
                      {openArchivedVisit?.id === visit.id ? (
                        <>
                          <ul className={`${ELEMENT_TAG}-story`}>
                            {openArchivedVisit.lines.map((line, index) => (
                              <li key={`${visit.id}:${index}`} className={`${ELEMENT_TAG}-story-row`}>
                                <span>
                                  <span className={`${ELEMENT_TAG}-story-meta`}>
                                    {line.name || playerDisplayName(snapshot)} · {stampTime(line.at)}
                                  </span>
                                  {renderVillagesMarkdown(line.content, `venue-${visit.id}-${index}-`)}
                                  <span className={`${ELEMENT_TAG}-story-meta`}>
                                    Heard by:{" "}
                                    {line.heardBy
                                      ?.map(
                                        (id) =>
                                          openArchivedVisit.participants.find((person) => person.characterId === id)
                                            ?.name ?? id,
                                      )
                                      .join(", ") || "no one"}
                                  </span>
                                </span>
                              </li>
                            ))}
                          </ul>
                          {(openArchivedVisit.submissions ?? []).some(
                            (submission) => submission.recollections?.length,
                          ) ? (
                            <details className={`${ELEMENT_TAG}-agenda-notes`}>
                              <summary>Captured recollections and evidence</summary>
                              <ul className={`${ELEMENT_TAG}-story`}>
                                {(openArchivedVisit.submissions ?? []).flatMap((submission) =>
                                  (submission.recollections ?? []).map((recollection) => (
                                    <li key={recollection.id} className={`${ELEMENT_TAG}-wish-card`}>
                                      <p className={`${ELEMENT_TAG}-wish-text`}>{recollection.text}</p>
                                      <p className={`${ELEMENT_TAG}-wish-meta`}>
                                        {`Subjects: ${recollection.subjectCharacterIds.join(", ") || "none"} · Known by: ${recollection.knownByCharacterIds.join(", ")}`}
                                      </p>
                                      <p className={`${ELEMENT_TAG}-wish-meta`}>
                                        {`Evidence: ${recollection.lineIds.join(", ")}`}
                                      </p>
                                    </li>
                                  )),
                                )}
                              </ul>
                            </details>
                          ) : null}
                          {openArchivedVisit.memoryReview && openArchivedVisit.memoryReview.status !== "none" ? (
                            <details className={`${ELEMENT_TAG}-agenda-notes`} open={openArchivedVisit.memoryPending}>
                              <summary>{`Durable review · ${openArchivedVisit.memoryReview?.status ?? "none"}`}</summary>
                              <div className={`${ELEMENT_TAG}-agenda-notes-body`}>
                                <p className={`${ELEMENT_TAG}-story-meta`}>
                                  {`${openArchivedVisit.memoryReview?.attempts ?? 0} review attempts`}
                                  {openArchivedVisit.memoryReview?.error
                                    ? ` · Last error: ${openArchivedVisit.memoryReview.error}`
                                    : ""}
                                </p>
                                <ul className={`${ELEMENT_TAG}-story`}>
                                  {(openArchivedVisit.memoryReview?.decisions ?? []).map((decision) => (
                                    <li key={decision.id} className={`${ELEMENT_TAG}-wish-card`}>
                                      <p className={`${ELEMENT_TAG}-wish-text`}>
                                        {`${decision.action === "promote" ? "Promoted" : "Rejected"}${decision.category ? ` · ${MEMORY_CATEGORY_LABELS[decision.category]}` : ""}`}
                                      </p>
                                      {decision.text ? <p>{decision.text}</p> : null}
                                      <p className={`${ELEMENT_TAG}-wish-meta`}>{decision.reason}</p>
                                      <p className={`${ELEMENT_TAG}-wish-meta`}>
                                        {`Sources: ${decision.recollectionIds.join(", ")}`}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </details>
                          ) : null}
                        </>
                      ) : null}
                    </section>
                  ))
                )}
                {archiveTotal > 20 ? (
                  <div className={`${ELEMENT_TAG}-row`}>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={archiveOffset === 0}
                      onClick={() => {
                        setArchiveOffset(Math.max(0, archiveOffset - 20));
                        setOpenArchivedVisit(null);
                      }}
                    >
                      Previous
                    </button>
                    <span>
                      {archiveOffset + 1}–{Math.min(archiveTotal, archiveOffset + 20)} of {archiveTotal}
                    </span>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={archiveOffset + 20 >= archiveTotal}
                      onClick={() => {
                        setArchiveOffset(archiveOffset + 20);
                        setOpenArchivedVisit(null);
                      }}
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/*
              What each villager privately wishes for, shown here and nowhere else.

              This is the one screen where a wish is allowed to be written down
              as a fact, and it is a debug screen on purpose. A wish is the
              reason behind what a villager does; put it on their tile or in the
              chat and it becomes an objective with a tick box, which is exactly
              what the village's prompts spend four rules refusing to write.
              Nothing is read by any prompt from here, so what is seen here
              cannot change how the village behaves.

              A provisional agenda and a completed one with no wishes are drawn
              differently, so unfinished wish-writing is not mistaken for an
              answer of "no current wishes".
            */}
            {menuTab === "agendas" ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>What the villagers wish</h2>
                </div>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas.
                </p>

                {agendas === null ? (
                  <p className={`${ELEMENT_TAG}-empty`}>Reading what the villagers wish…</p>
                ) : agendas.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>Nobody lives here yet.</p>
                ) : (
                  <section>
                    {agendas.map((villager) => (
                      <div key={villager.characterId}>
                        <h3 className={`${ELEMENT_TAG}-story-day`}>
                          {villager.name}
                          {villager.missing ? <span className={`${ELEMENT_TAG}-badge`}>card missing</span> : null}
                        </h3>
                        {villager.agenda === null ? (
                          <p className={`${ELEMENT_TAG}-empty`}>
                            Not written for yet. The village works this out on the next part of the day it already runs
                            on, so there is nothing to press.
                          </p>
                        ) : villager.agenda.wishes.length === 0 ? (
                          <p className={`${ELEMENT_TAG}-empty`}>
                            {villager.agenda.personalizationFailure
                              ? `Wish generation failed: ${villager.agenda.personalizationFailure}`
                              : villager.agenda.generatedAt
                                ? "No current wishes."
                                : "Wishes are still being worked out. Their provisional agenda is already available."}
                          </p>
                        ) : (
                          <ul className={`${ELEMENT_TAG}-story`}>
                            {villager.agenda.wishes.map((wish) => (
                              <li key={wish.id} className={`${ELEMENT_TAG}-wish-card`}>
                                <p className={`${ELEMENT_TAG}-wish-text`}>{wish.wish}</p>
                                {/* Said as the thing somebody would notice,
                                      which is the half that makes a wish a
                                      reason for an event instead of a to-do. */}
                                {wish.tell.length > 0 ? (
                                  <p className={`${ELEMENT_TAG}-wish-tell`}>{`Shows as: ${wish.tell}`}</p>
                                ) : null}
                                {/* How long it has been sitting there, and the
                                      day it goes quiet on its own. Said here
                                      because this tab is the only place a wish is
                                      a fact at all, and a wish that vanishes
                                      between two visits reads as a bug until the
                                      date it was always going to vanish on is
                                      written down beside it. */}
                                <p className={`${ELEMENT_TAG}-wish-meta`}>
                                  {`${wish.intensity === 1 ? "Faint" : wish.intensity === 3 ? "Strong" : "Present"} · ${wishLifetimeLabel(wish.addedAt ?? "", wish.expiresAt ?? "")}`}
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                        {villager.completedWishes.length > 0 ? (
                          <details className={`${ELEMENT_TAG}-agenda-notes`}>
                            <summary>{`Completed wishes (${villager.completedWishes.length})`}</summary>
                            <ul className={`${ELEMENT_TAG}-story`}>
                              {villager.completedWishes.map((entry) => (
                                <li key={entry.wish.id} className={`${ELEMENT_TAG}-wish-card`}>
                                  <p className={`${ELEMENT_TAG}-wish-text`}>{entry.wish.wish}</p>
                                  <p
                                    className={`${ELEMENT_TAG}-wish-meta`}
                                  >{`Fulfilled ${new Date(entry.fulfilledAt).toLocaleDateString()}`}</p>
                                  <button
                                    type="button"
                                    className={`${ELEMENT_TAG}-button`}
                                    disabled={busy}
                                    onClick={() => void correctCompletedWish(villager.characterId, entry.wish.id)}
                                  >
                                    Mark as not fulfilled
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </details>
                        ) : null}
                        {/*
                          The Engine's own week and the village's translation of
                          it live in Villager Agendas, not alongside wishes.
                        */}
                      </div>
                    ))}
                  </section>
                )}
              </div>
            ) : null}

            {/*
              The Engine's own week for each villager, and how the village reads
              it — the half of the listing Villager Wishes used to carry.

              It is its own tab because it answers a different question. Villager
              Wishes is what THIS village decided a person is after; this is what
              the ENGINE says their days are, before the village has touched it,
              plus the translation the village made from it. When the week looked
              empty the two answers were being read in the same column and there
              was no way to tell which side had failed.

              So the empty state below is a diagnosis rather than an apology: a
              villager with no week here has none on their character card, which
              is where the Engine keeps it now, and the fix is in the Engine's
              own schedule screen rather than in the village. The tab title
              carries the count of weeks found for the same reason.
            */}
            {menuTab === "schedules" ? (
              <div className={`${ELEMENT_TAG}-overlay`}>
                <div className={`${ELEMENT_TAG}-overlay-head`}>
                  <h2 className={`${ELEMENT_TAG}-panel-title`}>Villager agendas</h2>
                </div>
                <p className={`${ELEMENT_TAG}-empty`}>
                  Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled.
                </p>
                {agendas === null ? (
                  <p className={`${ELEMENT_TAG}-empty`}>Loading agendas…</p>
                ) : agendas.length === 0 ? (
                  <p className={`${ELEMENT_TAG}-empty`}>Nobody lives here yet.</p>
                ) : (
                  <div className={`${ELEMENT_TAG}-agenda-list`}>
                    {agendas.map((villager) => (
                      <details key={villager.characterId} className={`${ELEMENT_TAG}-week`}>
                        <summary className={`${ELEMENT_TAG}-week-toggle`}>
                          <h3 className={`${ELEMENT_TAG}-week-head`}>
                            {villager.name}
                            {villager.agenda?.personalizationPending ? (
                              <span className={`${ELEMENT_TAG}-badge`}>
                                {villager.agenda.personalizationFailure
                                  ? "Personalization needs retry"
                                  : "Personalizing"}
                              </span>
                            ) : null}
                            {villager.agenda?.personalizationFailure ? (
                              <span className={`${ELEMENT_TAG}-badge`}>Personalization failed</span>
                            ) : null}
                            {villager.missing ? <span className={`${ELEMENT_TAG}-badge`}>Card missing</span> : null}
                            {villager.nativeSchedule ? (
                              <span className={`${ELEMENT_TAG}-badge`}>
                                {villager.agenda?.activeDay?.scheduleInformed
                                  ? "Schedule used today"
                                  : "Schedule available"}
                              </span>
                            ) : null}
                            {agendaUpdatePending(villager) ? (
                              <span className={`${ELEMENT_TAG}-badge`}>Earlier hours kept</span>
                            ) : null}
                          </h3>
                        </summary>
                        <div className={`${ELEMENT_TAG}-week-body`}>
                          {villager.agenda?.routineSummary ? (
                            <p className={`${ELEMENT_TAG}-story-meta`}>{villager.agenda.routineSummary}</p>
                          ) : null}
                          {villager.agenda?.personalizationFailure ? (
                            <p className={`${ELEMENT_TAG}-empty`}>{villager.agenda.personalizationFailure}</p>
                          ) : villager.agenda?.personalizationPending ? (
                            <p className={`${ELEMENT_TAG}-story-scope`}>Personalizing this agenda in the background.</p>
                          ) : null}
                          <div className={`${ELEMENT_TAG}-agenda-actions`}>
                            <label className={`${ELEMENT_TAG}-agenda-switch`}>
                              <input
                                type="checkbox"
                                checked={villager.ingestSchedule}
                                disabled={busy}
                                onChange={(event) =>
                                  void setAgendaScheduleIngestion(villager.characterId, event.target.checked)
                                }
                              />
                              Use Marinara schedule when available
                            </label>
                            <button
                              type="button"
                              className={`${ELEMENT_TAG}-button`}
                              disabled={busy}
                              onClick={() => void rewriteAgenda(villager.characterId)}
                            >
                              Regenerate agenda
                            </button>
                          </div>
                          {villager.nativeSchedule ? (
                            <p className={`${ELEMENT_TAG}-story-scope`}>
                              {villager.ingestSchedule && villager.remapFailure
                                ? `Schedule translation failed: ${villager.remapFailure.message}`
                                : villager.ingestSchedule && villager.agenda?.scheduleWeek
                                  ? "Schedule guides today and future days."
                                  : villager.ingestSchedule
                                    ? "Schedule translation is pending."
                                    : "Schedule ingestion is off."}
                              {agendaUpdatePending(villager) ? " Earlier hours retain the previous plan." : ""}
                            </p>
                          ) : agendaUpdatePending(villager) ? (
                            <p className={`${ELEMENT_TAG}-story-scope`}>Earlier hours retain the previous plan.</p>
                          ) : null}
                          {villager.weekUnreadable ? (
                            <p className={`${ELEMENT_TAG}-empty`}>
                              Marinara schedules could not be read right now. The Villages agenda remains active.
                            </p>
                          ) : !villager.nativeSchedule ? (
                            <p className={`${ELEMENT_TAG}-empty`}>
                              No Marinara schedule. Villages uses its own agenda.
                            </p>
                          ) : null}
                          <div className={`${ELEMENT_TAG}-agenda-days`}>
                            {villager.days.map((day) => {
                              const blocks = day.isToday
                                ? (villager.agenda?.activeDay?.blocks ?? villager.agenda?.week?.[day.weekday] ?? [])
                                : ((villager.ingestSchedule
                                    ? villager.agenda?.scheduleWeek?.[day.weekday]
                                    : undefined) ??
                                  villager.agenda?.week?.[day.weekday] ??
                                  []);
                              const nativeBlocks = villager.nativeSchedule?.days[day.weekday] ?? [];
                              return (
                                <details
                                  key={`${day.weekday}-${day.dateLabel}`}
                                  className={`${ELEMENT_TAG}-agenda-day`}
                                  open={day.isToday || undefined}
                                >
                                  <summary>
                                    {day.weekday} · {day.dateLabel}
                                    {day.isToday ? " · Today" : ""}
                                  </summary>
                                  <div
                                    className={`${ELEMENT_TAG}-agenda-compare`}
                                    data-comparison={villager.nativeSchedule ? "true" : undefined}
                                  >
                                    <section aria-label={`${day.weekday} Villages agenda`}>
                                      <h4>Villages agenda</h4>
                                      <ol className={`${ELEMENT_TAG}-agenda-blocks`}>
                                        {blocks.map((part, index) => (
                                          <li key={`${part.startMinute}-${part.endMinute}-${index}`}>
                                            <time>
                                              {agendaMinuteLabel(part.startMinute)}–{agendaMinuteLabel(part.endMinute)}
                                            </time>
                                            <strong>{part.activity}</strong>
                                            <span>
                                              {part.venueId
                                                ? remapPlaceName(snapshot?.settings.venues ?? [], part.venueId)
                                                : "Home"}
                                            </span>
                                            <span>{part.reason}</span>
                                            <span className={`${ELEMENT_TAG}-story-scope`}>
                                              {part.status === "idle"
                                                ? "Available"
                                                : part.status === "dnd"
                                                  ? "Busy"
                                                  : part.status === "offline"
                                                    ? "Offline"
                                                    : "Online"}
                                            </span>
                                          </li>
                                        ))}
                                      </ol>
                                    </section>
                                    {villager.nativeSchedule ? (
                                      <section aria-label={`${day.weekday} Marinara schedule`}>
                                        <h4>Marinara schedule</h4>
                                        {nativeBlocks.length ? (
                                          <ol className={`${ELEMENT_TAG}-agenda-blocks`}>
                                            {nativeBlocks.map((part, index) => (
                                              <li key={`${part.time}-${index}`}>
                                                <time>{part.time}</time>
                                                <strong>{part.activity}</strong>
                                                <span className={`${ELEMENT_TAG}-story-scope`}>
                                                  {part.status || "No availability set"}
                                                </span>
                                              </li>
                                            ))}
                                          </ol>
                                        ) : (
                                          <p className={`${ELEMENT_TAG}-empty`}>No schedule blocks for this day.</p>
                                        )}
                                      </section>
                                    ) : null}
                                  </div>
                                </details>
                              );
                            })}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {settingsError ? (
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {settingsError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // ── The founding wizard ────────────────────────────────────────────────────
  // It owns the whole tab while it runs. The questions sit in the left column
  // and the map is drawn beside them, so the player answers and marks their own
  // houses by clicking the picture without either one being drawn over the
  // other.
  if (screen === "preparing") {
    const preparation = snapshot?.foundingPreparation;
    const total = snapshot?.villagers.length ?? 0;
    const done = preparation?.completedIds.length ?? 0;
    const current = snapshot?.villagers.find((villager) => villager.characterId === preparation?.currentId)?.name;
    const stageText =
      preparation?.stage === "reading"
        ? "Reading the character card and native schedule"
        : preparation?.stage === "lore"
          ? "Selecting relevant entries from the founding lorebooks"
          : preparation?.stage === "resolving"
            ? "Connecting to the System model"
            : preparation?.stage === "model"
              ? `Waiting for ${preparation.modelName || "the System model"} to write wishes, the week, and schedule mappings`
              : preparation?.stage === "applying"
                ? "Expanding the week and applying native schedule times"
                : preparation?.stage === "saving"
                  ? "Saving this villager's agenda and translation"
                  : "Preparing the first villager";
    const started = preparation?.stageStartedAt ? Date.parse(preparation.stageStartedAt) : NaN;
    const stageSeconds =
      preparation?.status === "pending" && Number.isFinite(started)
        ? Math.max(0, Math.floor((Date.now() - started) / 1000))
        : null;
    return (
      <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-preparing`} role="status" aria-live="polite">
        <div>
          <div className={`${ELEMENT_TAG}-preparing-house`} aria-hidden="true">
            🏡
          </div>
          <h1>{snapshot?.village.name ?? "Your village"} is settling in</h1>
          <p>
            {preparation?.status === "failed"
              ? "The villagers need a hand before the gates open."
              : current
                ? `Making room for ${current}…`
                : "Lighting windows and making plans…"}
          </p>
          <p>{`${done} of ${total} villagers ready`}</p>
          {preparation?.status === "pending" && preparation.stage ? (
            <p>
              {stageText}
              {current ? ` for ${current}` : ""}.
            </p>
          ) : null}
          {preparation?.attempt ? (
            <p>{`Attempt ${preparation.attempt} of 3${stageSeconds !== null ? ` · ${stageSeconds}s in this stage` : ""}`}</p>
          ) : null}
          {preparation?.stage === "resolving" ||
          preparation?.stage === "model" ||
          preparation?.stage === "applying" ||
          preparation?.stage === "saving" ? (
            <p>{`${preparation.loreEntryCount ?? 0} relevant lorebook entries included`}</p>
          ) : null}
          {preparation?.status === "pending" && preparation.error ? (
            <p className={`${ELEMENT_TAG}-hint`}>{`Previous attempt: ${preparation.error}`}</p>
          ) : null}
          {preparation?.status === "failed" ? (
            <div className={`${ELEMENT_TAG}-overlay`}>
              <p className={`${ELEMENT_TAG}-error`} role="alert">
                {preparation.error}
              </p>
              <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => void retryPreparation()}>
                Retry this villager
              </button>
              <details>
                <summary>Change connections</summary>
                <AgentConnections />
              </details>
            </div>
          ) : null}
          {preparationProblem ? (
            <p className={`${ELEMENT_TAG}-error`} role="alert">
              {preparationProblem}
            </p>
          ) : null}
        </div>
      </div>
    );
  }

  if (screen === "setup") {
    const wizardVillagers = (catalog ?? []).map((entry) => ({ id: entry.id, name: entry.name }));
    return (
      <div className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-home ${ELEMENT_TAG}-setup-root`}>
        <div className={`${ELEMENT_TAG}-home-body ${ELEMENT_TAG}-setup-body`} data-step={setupStep}>
          <aside className={`${ELEMENT_TAG}-setup-rail`} aria-label="Founding progress">
            {SETUP_STEPS.map((label, index) => (
              <div
                key={label}
                className={`${ELEMENT_TAG}-setup-rail-step`}
                data-active={index === setupStep ? "true" : "false"}
                data-done={index < setupStep ? "true" : "false"}
                aria-current={index === setupStep ? "step" : undefined}
              >
                <span className={`${ELEMENT_TAG}-setup-rail-number`}>{index + 1}</span>
                <span>{label}</span>
              </div>
            ))}
          </aside>
          <div className={`${ELEMENT_TAG}-side`}>
            <div className={`${ELEMENT_TAG}-overlay`}>
              <div className={`${ELEMENT_TAG}-overlay-head`}>
                <h2 className={`${ELEMENT_TAG}-panel-title`}>
                  {snapshot?.isFounded ? "Setting the village up again" : "Founding your village"}
                </h2>
              </div>
              <p className={`${ELEMENT_TAG}-setup-kicker`}>
                Step {setupStep + 1} of {SETUP_STEPS.length} · {SETUP_STEPS[setupStep]}
              </p>

              {setupStep === 0 ? (
                <>
                  <div className={`${ELEMENT_TAG}-field`}>
                    <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setup-name`}>
                      What is this village called?
                    </label>
                    <input
                      id={`${ELEMENT_TAG}-setup-name`}
                      className={`${ELEMENT_TAG}-search`}
                      type="text"
                      value={setupName}
                      maxLength={snapshot?.settings.villageNameMaxLength}
                      placeholder="Ashwater"
                      disabled={busy}
                      onChange={(event) => setSetupName(event.target.value)}
                    />
                  </div>
                  <fieldset className={`${ELEMENT_TAG}-field`}>
                    <legend className={`${ELEMENT_TAG}-label`}>Choose a scenario</legend>
                    <div className={`${ELEMENT_TAG}-scenario-options`}>
                      {FOUNDING_SCENARIOS.map((scenario) => (
                        <label key={scenario.value} className={`${ELEMENT_TAG}-scenario-option`}>
                          <input
                            type="radio"
                            name={`${ELEMENT_TAG}-founding-scenario`}
                            checked={setupFoundingReason === scenario.value}
                            disabled={busy || snapshot?.isFounded}
                            onChange={() => chooseSetupScenario(scenario.value)}
                          />
                          <span className={`${ELEMENT_TAG}-scenario-icon`} aria-hidden="true">
                            {scenario.icon}
                          </span>
                          <strong>{scenario.label}</strong>
                          <small>{scenario.description}</small>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  {setupFoundingReason === "none" ? (
                    <p className={`${ELEMENT_TAG}-hint`}>
                      Your village will have a world and setting, with no prescribed founding story.
                    </p>
                  ) : (
                    <>
                      <div className={`${ELEMENT_TAG}-field ${ELEMENT_TAG}-setup-premise`}>
                        <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-founding-details`}>
                          Scenario starting idea (required)
                        </label>
                        <textarea
                          id={`${ELEMENT_TAG}-founding-details`}
                          className={`${ELEMENT_TAG}-textarea`}
                          value={setupFoundingDetails}
                          maxLength={snapshot?.settings.foundingDetailsMaxLength ?? 2000}
                          placeholder="Describe a founding event, a world condition, a starting situation, or anything else."
                          disabled={busy || snapshot?.isFounded}
                          onChange={(event) => {
                            const details = event.target.value;
                            setSetupFoundingDetails(details);
                          }}
                        />
                        <span className={`${ELEMENT_TAG}-hint`}>
                          {setupFoundingReason === "custom"
                            ? "Write your own starting point. Switching scenarios clears this premise."
                            : "Edit this starting point freely. Switching scenarios restores the original premise."}
                        </span>
                      </div>
                      <div className={`${ELEMENT_TAG}-field ${ELEMENT_TAG}-setup-guidance`}>
                        <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-founding-guidance`}>
                          Founding direction (optional)
                        </label>
                        <textarea
                          id={`${ELEMENT_TAG}-founding-guidance`}
                          className={`${ELEMENT_TAG}-textarea`}
                          value={setupFoundingGuidance}
                          maxLength={snapshot?.settings.foundingGuidanceMaxLength ?? 500}
                          placeholder="What should the village's beginning feel like?"
                          disabled={busy || snapshot?.isFounded}
                          onChange={(event) => {
                            const guidance = event.target.value;
                            setSetupFoundingGuidance(guidance);
                            setSetupScenarioGuidanceDrafts((drafts) => ({
                              ...drafts,
                              [setupFoundingReason]: guidance,
                            }));
                          }}
                        />
                      </div>
                      <p className={`${ELEMENT_TAG}-hint`}>
                        This guidance shapes the opening village. Later stories follow what actually happens there.
                      </p>
                      {snapshot?.isFounded ? (
                        <p className={`${ELEMENT_TAG}-hint`}>
                          The founding Scenario is locked. Start a new village to choose another.
                        </p>
                      ) : null}
                    </>
                  )}
                  {snapshot?.isFounded && snapshot.settings.foundingReason !== "none" ? (
                    <div className={`${ELEMENT_TAG}-field`}>
                      <strong>Founding record</strong>
                      {snapshot.settings.scenarioImprint ? (
                        <>
                          {snapshot.settings.scenarioImprint.origin ? (
                            <p className={`${ELEMENT_TAG}-hint`}>
                              <strong>Origin:</strong> {snapshot.settings.scenarioImprint.origin}
                            </p>
                          ) : null}
                          {snapshot.settings.scenarioImprint.worldFacts.length ? (
                            <p className={`${ELEMENT_TAG}-hint`}>
                              <strong>World facts at founding:</strong>{" "}
                              {snapshot.settings.scenarioImprint.worldFacts.join("; ")}
                            </p>
                          ) : null}
                          {snapshot.settings.scenarioImprint.openingConditions.length ? (
                            <p className={`${ELEMENT_TAG}-hint`}>
                              <strong>Opening conditions:</strong>{" "}
                              {snapshot.settings.scenarioImprint.openingConditions.join("; ")}
                            </p>
                          ) : null}
                          {snapshot.settings.scenarioImprint.visualCues.length ? (
                            <p className={`${ELEMENT_TAG}-hint`}>
                              <strong>Opening visual cues:</strong>{" "}
                              {snapshot.settings.scenarioImprint.visualCues.join("; ")}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p className={`${ELEMENT_TAG}-hint`}>
                          This village predates founding imprints. Its original Scenario text is preserved above as
                          history.
                        </p>
                      )}
                    </div>
                  ) : null}
                </>
              ) : null}

              {setupStep === 1 ? (
                <>
                  <FoundingPersonaSelector
                    personas={personas}
                    draft={personaDraft}
                    onDraft={setPersonaDraft}
                    disabled={busy}
                  />
                  <AgentConnections
                    onSetupProblem={setConnectionSetupProblem}
                    onImageWarningChange={setImageConnectionWarning}
                    compact
                  />
                  {imageWarningOpen ? (
                    <div
                      className={`${ELEMENT_TAG}-chat-confirm`}
                      role="alertdialog"
                      aria-label="Image connection recommendation"
                    >
                      <p className={`${ELEMENT_TAG}-chat-confirm-note`}>
                        Villages is meant to be an immersive experience with dynamic locations and expressive
                        characters. An image connection is highly recommended for the complete Villages experience.
                      </p>
                      <p className={`${ELEMENT_TAG}-macro-help`}>
                        Villages is still playable without an image connection. You can always manually add images to
                        locations, characters, and more.
                      </p>
                      <span className={`${ELEMENT_TAG}-chat-confirm-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={returnToImageSetup}
                        >
                          Set up an image connection
                        </button>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={acknowledgeImageWarning}
                        >
                          I understand, continue
                        </button>
                      </span>
                    </div>
                  ) : null}
                </>
              ) : null}

              {setupStep === 2 ? (
                <>
                  <div className={`${ELEMENT_TAG}-field`}>
                    <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setup-setting`}>
                      Setting and Theme
                    </label>
                    <textarea
                      id={`${ELEMENT_TAG}-setup-setting`}
                      className={`${ELEMENT_TAG}-textarea`}
                      value={setupSetting}
                      maxLength={snapshot?.settings.settingMaxLength}
                      placeholder="A cliffside fishing town where the boats go out before dawn…"
                      disabled={busy || setupMapBusy}
                      onChange={(event) => {
                        setSetupSetting(event.target.value);
                        setSetupNameSuggestions([]);
                      }}
                    />
                    <span className={`${ELEMENT_TAG}-hint`}>
                      Required. Define the world, its atmosphere, and the village&apos;s visual character.
                    </span>
                  </div>
                  {snapshot?.isFounded ? (
                    <div className={`${ELEMENT_TAG}-field`}>
                      <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-world-facts`}>
                        Current world facts
                      </label>
                      <textarea
                        id={`${ELEMENT_TAG}-world-facts`}
                        className={`${ELEMENT_TAG}-textarea`}
                        value={setupWorldFacts.join("\n")}
                        disabled={busy}
                        placeholder="One stable fact per line, up to four."
                        onChange={(event) => setSetupWorldFacts(event.target.value.split(/\r?\n/u))}
                      />
                      <span className={`${ELEMENT_TAG}-hint`}>
                        Edit these when the village changes. They are current facts, separate from its locked origin.
                      </span>
                    </div>
                  ) : null}
                  <VillageLorebookPicker
                    books={lorebooks}
                    error={lorebooksError}
                    selected={setupLorebookDraft}
                    onChange={(ids) => {
                      setSetupLorebookDraft(ids);
                      setSetupNameSuggestions([]);
                    }}
                    disabled={busy}
                  />
                  <div className={`${ELEMENT_TAG}-field`}>
                    <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setup-lore-budget`}>
                      Lorebook token budget
                    </label>
                    <input
                      id={`${ELEMENT_TAG}-setup-lore-budget`}
                      className={`${ELEMENT_TAG}-notice-input`}
                      type="number"
                      min={snapshot?.settings.loreTokenBudgetMin ?? 200}
                      max={snapshot?.settings.loreTokenBudgetMax ?? 3200}
                      step={100}
                      value={setupLoreTokenBudgetDraft}
                      disabled={busy}
                      onChange={(event) => setSetupLoreTokenBudgetDraft(Number(event.target.value))}
                    />
                    <p className={`${ELEMENT_TAG}-hint`}>
                      Maximum approximate lore tokens for village text, wishes, and agendas.
                    </p>
                  </div>
                </>
              ) : null}

              {setupStep === 3 ? (
                <>
                  {snapshot?.isFounded ? (
                    <>
                      <p className={`${ELEMENT_TAG}-hint`}>
                        The founding Scenario is part of this village&apos;s history and is locked. Current world facts
                        can be edited in World &amp; Setting.
                      </p>
                      {snapshot.settings.scenarioImprint?.origin ? (
                        <p className={`${ELEMENT_TAG}-hint`}>
                          <strong>Origin:</strong> {snapshot.settings.scenarioImprint.origin}
                        </p>
                      ) : (
                        <p className={`${ELEMENT_TAG}-hint`}>
                          {snapshot.settings.foundingDetails || "No founding story was chosen."}
                        </p>
                      )}
                    </>
                  ) : setupFoundingReason === "none" ? (
                    <p className={`${ELEMENT_TAG}-hint`}>
                      No Scenario was chosen. The world and villagers can develop without a founding imprint.
                    </p>
                  ) : (
                    <>
                      <p className={`${ELEMENT_TAG}-hint`}>
                        Review what this Scenario establishes. Origin is history; opening conditions and visual cues
                        guide founding only. Stable world facts remain editable as the village changes.
                      </p>
                      <div className={`${ELEMENT_TAG}-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={() => void draftSetupImprint()}
                        >
                          {setupImprintBusy ? "Drafting…" : "Draft imprint"}
                        </button>
                        <span className={`${ELEMENT_TAG}-hint`}>You can write or revise every field yourself.</span>
                      </div>
                      <div className={`${ELEMENT_TAG}-field`}>
                        <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-imprint-origin`}>
                          Founding history (optional)
                        </label>
                        <textarea
                          id={`${ELEMENT_TAG}-imprint-origin`}
                          className={`${ELEMENT_TAG}-textarea`}
                          value={setupImprint.origin}
                          maxLength={400}
                          disabled={busy}
                          placeholder="Leave blank if your idea has no founding event."
                          onChange={(event) => {
                            setSetupImprint((current) => ({ ...current, origin: event.target.value }));
                            setSetupImprintApprovedKey("");
                          }}
                        />
                      </div>
                      {(
                        [
                          ["worldFacts", "Stable world facts", "Only truths that should still hold today.", 160],
                          [
                            "openingConditions",
                            "Opening conditions",
                            "Starting pressures or opportunities, not permanent facts.",
                            160,
                          ],
                          ["visualCues", "Founding visual cues", "Details for the initial map and venue art.", 120],
                        ] as const
                      ).map(([key, label, hint, limit]) => (
                        <div className={`${ELEMENT_TAG}-field`} key={key}>
                          <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-imprint-${key}`}>
                            {label}
                          </label>
                          <textarea
                            id={`${ELEMENT_TAG}-imprint-${key}`}
                            className={`${ELEMENT_TAG}-textarea`}
                            value={setupImprint[key].join("\n")}
                            disabled={busy}
                            placeholder="One detail per line, up to four."
                            onChange={(event) => editSetupImprintLines(key, event.target.value)}
                          />
                          <span className={`${ELEMENT_TAG}-hint`}>
                            {hint} Up to four lines, {limit} characters each.
                          </span>
                        </div>
                      ))}
                      <div className={`${ELEMENT_TAG}-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={busy}
                          onClick={approveSetupImprint}
                        >
                          Approve imprint
                        </button>
                        {setupImprintApprovedKey === setupImprintSourceKey ? (
                          <span className={`${ELEMENT_TAG}-hint`}>Approved for this founding.</span>
                        ) : (
                          <span className={`${ELEMENT_TAG}-hint`}>Approval is needed before the map step.</span>
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : null}

              {setupStep === 4 ? (
                <>
                  <div className={`${ELEMENT_TAG}-steps`} role="group" aria-label="Village map image source">
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-step`}
                      data-clickable="true"
                      data-active={setupMapSource === "generate" ? "true" : "false"}
                      aria-pressed={setupMapSource === "generate"}
                      disabled={setupMapBusy}
                      onClick={() => setSetupMapSource("generate")}
                    >
                      Generate with AI
                    </button>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-step`}
                      data-clickable="true"
                      data-active={setupMapSource === "upload" ? "true" : "false"}
                      aria-pressed={setupMapSource === "upload"}
                      disabled={setupMapBusy}
                      onClick={() => setSetupMapSource("upload")}
                    >
                      Upload an image
                    </button>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-step`}
                      data-clickable="true"
                      data-active={setupMapSource === "none" ? "true" : "false"}
                      aria-pressed={setupMapSource === "none"}
                      disabled={setupMapBusy}
                      onClick={() => setSetupMapSource("none")}
                    >
                      No background image
                    </button>
                    {snapshot?.settings.townMapImageSetAt ? (
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-step`}
                        data-clickable="true"
                        data-active={setupMapSource === "existing" ? "true" : "false"}
                        aria-pressed={setupMapSource === "existing"}
                        disabled={setupMapBusy}
                        onClick={() => setSetupMapSource("existing")}
                      >
                        Keep current map
                      </button>
                    ) : null}
                  </div>
                  {setupMapSource === "generate" ? (
                    <>
                      <fieldset className={`${ELEMENT_TAG}-field`}>
                        <legend className={`${ELEMENT_TAG}-label`}>Map elements</legend>
                        <div className={`${ELEMENT_TAG}-reason-options`}>
                          {(
                            [
                              ["roads", "Roads and paths"],
                              ["structures", "Structures"],
                              ["water", "Water"],
                            ] as const
                          ).map(([key, label]) => (
                            <label key={key} className={`${ELEMENT_TAG}-reason-option`}>
                              <input
                                type="checkbox"
                                checked={setupMapOptions[key]}
                                disabled={setupMapBusy}
                                onChange={(event) =>
                                  setSetupMapOptions((previous) => ({ ...previous, [key]: event.target.checked }))
                                }
                              />
                              {label}
                            </label>
                          ))}
                        </div>
                        <span className={`${ELEMENT_TAG}-hint`}>
                          Unchecked elements are excluded, even if Setting and Theme mentions them. Structures may
                          appear anywhere but must leave room for future locations.
                        </span>
                      </fieldset>
                      <div className={`${ELEMENT_TAG}-field`}>
                        <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setup-map-prompt`}>
                          <span className={`${ELEMENT_TAG}-debug-label`}>DEBUG</span> Map layout prompt
                        </label>
                        <textarea
                          id={`${ELEMENT_TAG}-setup-map-prompt`}
                          className={`${ELEMENT_TAG}-textarea`}
                          value={setupMapPrompt}
                          maxLength={1500}
                          disabled={setupMapBusy}
                          onChange={(event) => setSetupMapPrompt(event.target.value)}
                        />
                        <span className={`${ELEMENT_TAG}-hint`}>
                          Temporary testing override. The default comes from the server; edits apply only to this setup
                          session.
                        </span>
                      </div>
                      <div className={`${ELEMENT_TAG}-field`}>
                        <label className={`${ELEMENT_TAG}-label`} htmlFor={`${ELEMENT_TAG}-setup-map-negative`}>
                          <span className={`${ELEMENT_TAG}-debug-label`}>DEBUG</span> Negative map tags
                        </label>
                        <textarea
                          id={`${ELEMENT_TAG}-setup-map-negative`}
                          className={`${ELEMENT_TAG}-textarea`}
                          value={setupMapNegativePrompt}
                          maxLength={1500}
                          disabled={setupMapBusy}
                          onChange={(event) => setSetupMapNegativePrompt(event.target.value)}
                        />
                        <span className={`${ELEMENT_TAG}-hint`}>
                          Image providers handle negative tags differently. Review the resulting map before continuing.
                        </span>
                      </div>
                      <div className={`${ELEMENT_TAG}-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={
                            setupMapBusy || setupSetting.trim().length === 0 || setupMapPrompt.trim().length === 0
                          }
                          onClick={() => void generateSetupTownMap()}
                        >
                          {setupMapBusy
                            ? "Generating map…"
                            : setupMapImageSource === "generate"
                              ? "Generate again"
                              : "Generate map"}
                        </button>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          disabled={
                            setupMapBusy ||
                            (setupMapPrompt === snapshot?.settings.townMapLayoutPrompt &&
                              setupMapNegativePrompt === snapshot?.settings.townMapNegativePrompt)
                          }
                          onClick={() => {
                            setSetupMapPrompt(snapshot?.settings.townMapLayoutPrompt ?? "");
                            setSetupMapNegativePrompt(snapshot?.settings.townMapNegativePrompt ?? "");
                          }}
                        >
                          Restore default prompt
                        </button>
                      </div>
                    </>
                  ) : null}
                  {setupMapSource === "upload" ? (
                    <>
                      <input
                        className={`${ELEMENT_TAG}-file`}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/avif"
                        disabled={setupMapBusy}
                        aria-label="Choose a village map image"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          void pickSetupTownMap(file);
                        }}
                      />
                      <p className={`${ELEMENT_TAG}-hint`}>
                        Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the
                        file must fit the size limit shown if it is refused.
                      </p>
                    </>
                  ) : null}
                  {setupMapSource === "none" ? (
                    <p className={`${ELEMENT_TAG}-empty`}>
                      Venues will remain clickable on a clean logical map surface. You can add an image from the Town
                      map panel later.
                    </p>
                  ) : null}
                  {setupMapSize &&
                  setupMapSource !== "none" &&
                  setupMapImageSource === setupMapSource &&
                  setupMapShape ? (
                    <p className={`${ELEMENT_TAG}-hint`} data-tone={pictureAdvice(setupMapSize).tone}>
                      {pictureAdvice(setupMapSize).text}
                    </p>
                  ) : null}
                </>
              ) : null}

              {setupStep === 5 ? (
                <>
                  <p className={`${ELEMENT_TAG}-empty`}>
                    Place your Residence, one to three villager Residences, and one Gathering Place. Select a photograph
                    to finish it.
                  </p>
                  <div className={`${ELEMENT_TAG}-row`}>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={
                        busy ||
                        setupVenueBusy ||
                        setupVenues.filter((venue) => venue.classes?.includes("residence")).length >=
                          1 + setupMaxVillagerCount
                      }
                      onClick={() => {
                        setPlacingHome(true);
                        setPlacingPublicCenter(false);
                        setMovingSetupVenueId(null);
                      }}
                    >
                      Place a Residence
                    </button>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={
                        busy || setupVenueBusy || setupVenues.some((venue) => venue.category === "public-center")
                      }
                      onClick={() => {
                        setPlacingHome(false);
                        setPlacingPublicCenter(true);
                        setMovingSetupVenueId(null);
                      }}
                    >
                      Place a Gathering Place
                    </button>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy || setupVenueBusy || setupVenues.length === 0}
                      onClick={() => {
                        setSetupVenues([]);
                        setSelectedSetupVenueId(null);
                        setSetupTextDrafts({});
                        setSetupImageDraft(null);
                        setMovingSetupVenueId(null);
                        setPlacingHome(false);
                        setPlacingPublicCenter(false);
                      }}
                    >
                      Reset all venues
                    </button>
                  </div>
                  {setupPlacementError ? (
                    <p className={`${ELEMENT_TAG}-error`} role="alert">
                      {setupPlacementError}
                    </p>
                  ) : null}
                  <div className={`${ELEMENT_TAG}-row`}>
                    <button
                      type="button"
                      className={`${ELEMENT_TAG}-button`}
                      disabled={busy || setupVenueBusy || !setupVenues.length}
                      onClick={() => void generateSetupText(setupVenues)}
                    >
                      Draft all venue text
                    </button>
                    {Object.keys(setupTextDrafts).length > 1 ? (
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-button`}
                        onClick={() => Object.keys(setupTextDrafts).forEach((id) => applySetupText(id, false))}
                      >
                        Use all drafts in empty fields
                      </button>
                    ) : null}
                  </div>
                  <div className={`${ELEMENT_TAG}-setup-venue-list`}>
                    {setupVenues.map((venue) => (
                      <button
                        key={venue.id}
                        type="button"
                        className={`${ELEMENT_TAG}-setup-venue-card`}
                        data-selected={venue.id === selectedSetupVenueId ? "true" : "false"}
                        onClick={() => setSelectedSetupVenueId(venue.id)}
                      >
                        {venue.presentation.image ? (
                          <img src={venue.presentation.image.url} alt="" />
                        ) : (
                          <span className={`${ELEMENT_TAG}-setup-venue-placeholder`} aria-hidden="true">
                            ⌂
                          </span>
                        )}
                        <span>
                          <strong>{venue.name || "Unnamed venue"}</strong>
                          <small>
                            {venue.category === "public-center" ? "Gathering Place" : "Residence"} ·{" "}
                            {venue.occupancy.playerHome
                              ? "You"
                              : nameOfCharacter(venue.occupancy.residentCharacterId) || "Choose a villager"}
                          </small>
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedSetupVenue && selectedSetupSpace ? (
                    <div className={`${ELEMENT_TAG}-setup-venue-editor`}>
                      <h3 className={`${ELEMENT_TAG}-panel-title`}>
                        {selectedSetupVenue.category === "public-center" ? "Gathering Place" : "Residence"} ·{" "}
                        {selectedSetupVenue.name}
                      </h3>
                      <div className={`${ELEMENT_TAG}-row`}>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          onClick={() => {
                            setMovingSetupVenueId(selectedSetupVenue.id);
                            setPlacingHome(false);
                            setPlacingPublicCenter(false);
                          }}
                        >
                          Move on map
                        </button>
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-button`}
                          onClick={() => removeSetupVenue(selectedSetupVenue.id)}
                        >
                          Remove venue
                        </button>
                      </div>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Name
                        <input
                          className={`${ELEMENT_TAG}-notice-input`}
                          value={selectedSetupVenue.name}
                          maxLength={100}
                          onChange={(event) =>
                            patchSetupVenue(selectedSetupVenue.id, (venue) => ({ ...venue, name: event.target.value }))
                          }
                        />
                      </label>
                      {selectedSetupVenue.category === "public-center" ? (
                        <div className={`${ELEMENT_TAG}-field`}>
                          <button
                            type="button"
                            className={`${ELEMENT_TAG}-button`}
                            disabled={busy || setupVenueBusy}
                            onClick={() => void suggestSetupVenueNames()}
                          >
                            Suggest three names
                          </button>
                          {setupNameSuggestions.map((name) => (
                            <button
                              key={name}
                              type="button"
                              className={`${ELEMENT_TAG}-button`}
                              onClick={() => patchSetupVenue(selectedSetupVenue.id, (venue) => ({ ...venue, name }))}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      <label className={`${ELEMENT_TAG}-label`}>
                        Form · what is it?
                        <input
                          className={`${ELEMENT_TAG}-notice-input`}
                          value={selectedSetupVenue.form ?? ""}
                          maxLength={240}
                          onChange={(event) =>
                            patchSetupVenue(selectedSetupVenue.id, (venue) => ({ ...venue, form: event.target.value }))
                          }
                        />
                      </label>
                      {selectedSetupVenue.category !== "public-center" ? (
                        <label className={`${ELEMENT_TAG}-label`}>
                          Resident
                          <select
                            className={`${ELEMENT_TAG}-select`}
                            value={selectedSetupVenue.occupancy.residentCharacterId ?? ""}
                            disabled={selectedSetupVenue.occupancy.playerHome}
                            onChange={(event) =>
                              patchSetupVenue(selectedSetupVenue.id, (venue) => ({
                                ...venue,
                                residentIds: event.target.value ? [event.target.value] : [],
                                occupancy: { ...venue.occupancy, residentCharacterId: event.target.value || null },
                              }))
                            }
                          >
                            <option value="">
                              {selectedSetupVenue.occupancy.playerHome ? "You" : "Choose a villager"}
                            </option>
                            {wizardVillagers.map((villager) => (
                              <option
                                key={villager.id}
                                value={villager.id}
                                disabled={setupVenues.some(
                                  (venue) =>
                                    venue.id !== selectedSetupVenue.id &&
                                    venue.occupancy.residentCharacterId === villager.id,
                                )}
                              >
                                {villager.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      <label className={`${ELEMENT_TAG}-label`}>
                        Purpose
                        <input
                          className={`${ELEMENT_TAG}-notice-input`}
                          value={selectedSetupVenue.purpose}
                          maxLength={240}
                          onChange={(event) =>
                            patchSetupVenue(selectedSetupVenue.id, (venue) => ({
                              ...venue,
                              purpose: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Guidance for AI text and art
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={selectedSetupVenue.guidance}
                          maxLength={1000}
                          placeholder="Mood, materials, details to include or avoid…"
                          onChange={(event) =>
                            patchSetupVenue(selectedSetupVenue.id, (venue) => ({
                              ...venue,
                              guidance: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-button`}
                        disabled={setupVenueBusy}
                        onClick={() => void generateSetupText([selectedSetupVenue])}
                      >
                        Generate text draft
                      </button>
                      {setupTextDrafts[selectedSetupVenue.id] ? (
                        <div className={`${ELEMENT_TAG}-overlay`}>
                          <strong>Suggested venue text</strong>
                          <p>
                            {setupTextDrafts[selectedSetupVenue.id]?.name} ·{" "}
                            {setupTextDrafts[selectedSetupVenue.id]?.form}
                          </p>
                          <p>
                            <strong>Purpose:</strong> {setupTextDrafts[selectedSetupVenue.id]?.purpose}
                          </p>
                          <p>
                            <strong>Exterior:</strong> {setupTextDrafts[selectedSetupVenue.id]?.description}
                          </p>
                          <p>
                            <strong>Scene:</strong> {setupTextDrafts[selectedSetupVenue.id]?.spaceDescription}
                          </p>
                          <p>
                            <strong>Initial condition:</strong> {setupTextDrafts[selectedSetupVenue.id]?.condition}
                          </p>
                          <p>
                            <strong>Items:</strong> {setupTextDrafts[selectedSetupVenue.id]?.items.join(", ") || "None"}
                          </p>
                          <p>
                            <strong>Public facts:</strong>{" "}
                            {setupTextDrafts[selectedSetupVenue.id]?.publicFacts.join(", ") || "None"}
                          </p>
                          <p>
                            <strong>Features:</strong>{" "}
                            {setupTextDrafts[selectedSetupVenue.id]?.features.join(", ") || "None"}
                          </p>
                          <div className={`${ELEMENT_TAG}-row`}>
                            <button
                              type="button"
                              className={`${ELEMENT_TAG}-button`}
                              onClick={() => applySetupText(selectedSetupVenue.id, false)}
                            >
                              Use in empty fields
                            </button>
                            <button
                              type="button"
                              className={`${ELEMENT_TAG}-button`}
                              onClick={() => applySetupText(selectedSetupVenue.id, true)}
                            >
                              Replace text with this draft
                            </button>
                            <button
                              type="button"
                              className={`${ELEMENT_TAG}-button`}
                              onClick={() =>
                                setSetupTextDrafts((current) => {
                                  const next = { ...current };
                                  delete next[selectedSetupVenue.id];
                                  return next;
                                })
                              }
                            >
                              Discard draft
                            </button>
                          </div>
                        </div>
                      ) : null}
                      <label className={`${ELEMENT_TAG}-label`}>
                        Exterior description
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={selectedSetupVenue.description}
                          maxLength={1000}
                          onChange={(event) =>
                            patchSetupVenue(selectedSetupVenue.id, (venue) => ({
                              ...venue,
                              description: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className={`${ELEMENT_TAG}-label`}>
                        Scene description
                        <textarea
                          className={`${ELEMENT_TAG}-textarea`}
                          value={selectedSetupSpace.description}
                          maxLength={1000}
                          onChange={(event) =>
                            patchSetupVenue(selectedSetupVenue.id, (venue) => ({
                              ...venue,
                              spaces: [
                                {
                                  ...venueSpaceFor(
                                    venue,
                                    venue.category === "public-center" ? "gathering" : "residence",
                                  ),
                                  description: event.target.value,
                                },
                              ],
                            }))
                          }
                        />
                      </label>
                      {(["exterior", "interior"] as const).map((area) => {
                        const image =
                          area === "exterior" ? selectedSetupVenue.presentation.image : selectedSetupSpace.image;
                        return (
                          <section key={area} className={`${ELEMENT_TAG}-field`}>
                            <span className={`${ELEMENT_TAG}-label`}>
                              {area === "exterior" ? "Exterior photograph" : "Interior photograph"} · optional
                            </span>
                            {image ? (
                              <img
                                className={`${ELEMENT_TAG}-setup-image-preview`}
                                src={image.url}
                                alt={`${area} of ${selectedSetupVenue.name}`}
                              />
                            ) : (
                              <p className={`${ELEMENT_TAG}-hint`}>No image yet. A placeholder will be used.</p>
                            )}
                            <div className={`${ELEMENT_TAG}-row`}>
                              <button
                                type="button"
                                className={`${ELEMENT_TAG}-button`}
                                disabled={setupVenueBusy}
                                onClick={() => void generateSetupImage(selectedSetupVenue, area)}
                              >
                                {image ? "Regenerate image" : "Generate image"}
                              </button>
                              <input
                                className={`${ELEMENT_TAG}-file`}
                                type="file"
                                accept="image/*"
                                disabled={setupVenueBusy}
                                aria-label={`Upload ${area} image for ${selectedSetupVenue.name}`}
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  event.target.value = "";
                                  void uploadSetupImage(selectedSetupVenue, area, file);
                                }}
                              />
                              {image ? (
                                <button
                                  type="button"
                                  className={`${ELEMENT_TAG}-button`}
                                  onClick={() =>
                                    patchSetupVenue(selectedSetupVenue.id, (venue) =>
                                      area === "exterior"
                                        ? { ...venue, presentation: { ...venue.presentation, image: null } }
                                        : {
                                            ...venue,
                                            spaces: [
                                              {
                                                ...venueSpaceFor(
                                                  venue,
                                                  venue.category === "public-center" ? "gathering" : "residence",
                                                ),
                                                image: null,
                                              },
                                            ],
                                          },
                                    )
                                  }
                                >
                                  Remove image
                                </button>
                              ) : null}
                            </div>
                            {setupImageDraft?.venueId === selectedSetupVenue.id && setupImageDraft.area === area ? (
                              <div className={`${ELEMENT_TAG}-overlay`}>
                                <img
                                  className={`${ELEMENT_TAG}-setup-image-preview`}
                                  src={setupImageDraft.image.url}
                                  alt="New image preview"
                                />
                                <button type="button" className={`${ELEMENT_TAG}-button`} onClick={useSetupImage}>
                                  Use this photograph
                                </button>
                                <button
                                  type="button"
                                  className={`${ELEMENT_TAG}-button`}
                                  onClick={() => setSetupImageDraft(null)}
                                >
                                  Discard
                                </button>
                              </div>
                            ) : null}
                          </section>
                        );
                      })}
                      <details>
                        <summary>Advanced venue details</summary>
                        <div className={`${ELEMENT_TAG}-setup-venue-editor`}>
                          <label className={`${ELEMENT_TAG}-label`}>
                            Initial condition
                            <input
                              className={`${ELEMENT_TAG}-notice-input`}
                              value={selectedSetupSpace.state.condition}
                              onChange={(event) =>
                                patchSetupVenue(selectedSetupVenue.id, (venue) => {
                                  const space = venueSpaceFor(
                                    venue,
                                    venue.category === "public-center" ? "gathering" : "residence",
                                  );
                                  return {
                                    ...venue,
                                    spaces: [{ ...space, state: { ...space.state, condition: event.target.value } }],
                                  };
                                })
                              }
                            />
                          </label>
                          {(["items", "publicFacts"] as const).map((key) => (
                            <label key={key} className={`${ELEMENT_TAG}-label`}>
                              {key === "items" ? "Notable items · one per line" : "Public facts · one per line"}
                              <textarea
                                className={`${ELEMENT_TAG}-textarea`}
                                value={selectedSetupSpace.state[key].join("\n")}
                                onChange={(event) =>
                                  patchSetupVenue(selectedSetupVenue.id, (venue) => {
                                    const space = venueSpaceFor(
                                      venue,
                                      venue.category === "public-center" ? "gathering" : "residence",
                                    );
                                    return {
                                      ...venue,
                                      spaces: [
                                        {
                                          ...space,
                                          state: {
                                            ...space.state,
                                            [key]: event.target.value
                                              .split("\n")
                                              .map((line) => line.trim())
                                              .filter(Boolean),
                                          },
                                        },
                                      ],
                                    };
                                  })
                                }
                              />
                            </label>
                          ))}
                          <label className={`${ELEMENT_TAG}-label`}>
                            Features · one per line
                            <textarea
                              className={`${ELEMENT_TAG}-textarea`}
                              value={selectedSetupSpace.state.features.map((feature) => feature.text).join("\n")}
                              onChange={(event) =>
                                patchSetupVenue(selectedSetupVenue.id, (venue) => {
                                  const space = venueSpaceFor(
                                    venue,
                                    venue.category === "public-center" ? "gathering" : "residence",
                                  );
                                  return {
                                    ...venue,
                                    spaces: [
                                      {
                                        ...space,
                                        state: {
                                          ...space.state,
                                          features: event.target.value
                                            .split("\n")
                                            .map((line) => line.trim())
                                            .filter(Boolean)
                                            .slice(0, 5)
                                            .map((text, index) => ({
                                              id: space.state.features[index]?.id ?? freshRowKey(),
                                              text,
                                              sourceCharacterId: "",
                                              locked: false,
                                              updatedAt: "",
                                            })),
                                        },
                                      },
                                    ],
                                  };
                                })
                              }
                            />
                          </label>
                        </div>
                      </details>
                    </div>
                  ) : (
                    <p className={`${ELEMENT_TAG}-hint`}>Place or select a venue to edit it.</p>
                  )}
                  {catalog === null ? <p className={`${ELEMENT_TAG}-hint`}>Reading your villager library…</p> : null}
                </>
              ) : null}

              {setupStep === 6 ? (
                <>
                  <p className={`${ELEMENT_TAG}-empty`}>
                    Review your village before opening its gates. Return to Step 6 to change a venue.
                  </p>
                  <p className={`${ELEMENT_TAG}-hint`}>
                    {setupName.trim()} · {setupSetting.trim()} ·{" "}
                    {setupVenues.filter((venue) => venue.classes?.includes("residence")).length} Residences ·{" "}
                    {setupVenues.filter((venue) => venue.category === "public-center").length} Gathering Place
                  </p>
                  <p className={`${ELEMENT_TAG}-hint`}>
                    <strong>Persona:</strong>{" "}
                    {personas?.find((persona) => persona.id === personaDraft)?.name ?? "Selected Persona"}
                    {" · "}
                    <strong>Scenario:</strong> {foundingScenario(setupFoundingReason).label}
                  </p>
                  {setupFoundingReason !== "none" ? (
                    <>
                      <p className={`${ELEMENT_TAG}-hint`}>
                        <strong>Scenario premise:</strong> {setupFoundingDetails}
                      </p>
                      {setupFoundingGuidance ? (
                        <p className={`${ELEMENT_TAG}-hint`}>
                          <strong>Narrative direction:</strong> {setupFoundingGuidance}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                  {(
                    snapshot?.isFounded
                      ? snapshot.settings.scenarioImprint
                      : setupFoundingReason === "none"
                        ? null
                        : setupImprint
                  ) ? (
                    <div className={`${ELEMENT_TAG}-field`}>
                      <strong>Reviewed founding imprint</strong>
                      {(
                        [
                          ["Origin", (snapshot?.isFounded ? snapshot.settings.scenarioImprint : setupImprint)?.origin],
                          [
                            "Stable world facts",
                            (snapshot?.isFounded ? snapshot.settings.scenarioImprint : setupImprint)?.worldFacts.join(
                              "; ",
                            ),
                          ],
                          [
                            "Opening conditions",
                            (snapshot?.isFounded
                              ? snapshot.settings.scenarioImprint
                              : setupImprint
                            )?.openingConditions.join("; "),
                          ],
                          [
                            "Visual cues",
                            (snapshot?.isFounded ? snapshot.settings.scenarioImprint : setupImprint)?.visualCues.join(
                              "; ",
                            ),
                          ],
                        ] as const
                      )
                        .filter(([, value]) => value)
                        .map(([label, value]) => (
                          <p className={`${ELEMENT_TAG}-hint`} key={label}>
                            <strong>{label}:</strong> {value}
                          </p>
                        ))}
                    </div>
                  ) : null}
                  <p className={`${ELEMENT_TAG}-hint`}>
                    <strong>Map:</strong> {setupMapSource === "none" ? "Logical map" : "Chosen picture"}
                    {" · "}
                    <strong>Lorebooks:</strong>{" "}
                    {setupLorebookDraft.map((id) => lorebooks?.find((book) => book.id === id)?.name ?? id).join(", ") ||
                      "None"}
                  </p>
                  <div className={`${ELEMENT_TAG}-setup-venue-list`}>
                    {setupVenues.map((venue) => (
                      <div key={venue.id} className={`${ELEMENT_TAG}-setup-venue-card`}>
                        {venue.presentation.image ? (
                          <img src={venue.presentation.image.url} alt="" />
                        ) : (
                          <span className={`${ELEMENT_TAG}-setup-venue-placeholder`} aria-hidden="true">
                            ⌂
                          </span>
                        )}
                        <span>
                          <strong>
                            {venue.name} · {venue.category === "public-center" ? "Gathering Place" : "Residence"}
                          </strong>
                          <small>
                            {venue.form} ·{" "}
                            {venue.occupancy.playerHome
                              ? "You"
                              : nameOfCharacter(venue.occupancy.residentCharacterId) || "Community"}
                          </small>
                        </span>
                      </div>
                    ))}
                  </div>
                  {setupVenues.map((venue) => (
                    <p key={`${venue.id}-summary`} className={`${ELEMENT_TAG}-hint`}>
                      <strong>{venue.name}:</strong> {venue.description} {venue.spaces?.[0]?.description}
                    </p>
                  ))}
                </>
              ) : null}

              {setupProblem ? (
                <p className={`${ELEMENT_TAG}-error`} role="alert">
                  {setupProblem}
                </p>
              ) : null}
              {settingsError ? (
                <p className={`${ELEMENT_TAG}-error`} role="alert">
                  {settingsError}
                </p>
              ) : null}
            </div>
          </div>

          {/*
            The map takes the click on the step that places houses and only on
            that step, so a stray click while answering a question cannot leave
            a pin somewhere the player did not mean.

            The step before that one shows the picture small and inert — an
            example of the thing being named rather than somewhere to click —
            and the step after it still shows the pins at full size, because by
            then the question is who lives where and the answer is on the map.
            The houses are pinned at the size a map is really drawn at: a pin set
            on a shrunken one would be a guess, and it would be a guess stored on
            the village forever.
          */}
          <div className={`${ELEMENT_TAG}-setup-visual`}>
            {setupStep <= 1 ? (
              <div className={`${ELEMENT_TAG}-scenario-art-panel`}>
                <img
                  src={foundingScenarioArt(setupFoundingReason)}
                  alt={`${foundingScenario(setupFoundingReason).label} village scene`}
                />
                <div className={`${ELEMENT_TAG}-scenario-art-content`}>
                  <p>A new beginning awaits.</p>
                  <strong>{foundingScenario(setupFoundingReason).description}</strong>
                </div>
              </div>
            ) : (
              <div className={`${ELEMENT_TAG}-setup-map-shell`}>
                <div className={`${ELEMENT_TAG}-setup-map-viewport`}>
                  <MapStage
                    src={setupMapSrc}
                    alt={`A map of ${setupName.trim() || "your new village"}.`}
                    pins={setupStep < 5 ? [] : draftPins}
                    placing={setupStep === 5 && (placingHome || placingPublicCenter || movingSetupVenueId !== null)}
                    view={setupMapSource === "existing" ? savedTownMapView : defaultView("cover")}
                    shape={setupMapShape}
                    onPlace={setupStep === 5 ? placeSetupPin : undefined}
                    compact={setupStep < 4}
                    mobile={mobile && setupStep >= 4}
                    photoPins={setupStep >= 5}
                  />
                </div>
              </div>
            )}
            <nav className={`${ELEMENT_TAG}-setup-footer`} aria-label="Founding navigation">
              {setupStep > 0 ? (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy || setupMapBusy}
                  onClick={() => gotoSetupStep(setupStep - 1)}
                >
                  ← Back
                </button>
              ) : null}
              {setupStep < SETUP_STEPS.length - 1 ? (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-setup-forward`}
                  disabled={busy || setupMapBusy}
                  onClick={() => gotoSetupStep(setupStep + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-setup-forward`}
                  disabled={busy || setupMapBusy || !snapshot}
                  onClick={() => void foundVillage()}
                >
                  {snapshot?.isFounded ? "Save this village" : "Found the village"}
                </button>
              )}
              {snapshot?.isFounded ? (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-button`}
                  disabled={busy}
                  onClick={() => {
                    setPlacingHome(false);
                    setScreen("home");
                  }}
                >
                  Show me the village
                </button>
              ) : null}
            </nav>
          </div>
        </div>
      </div>
    );
  }

  // ── The homepage ───────────────────────────────────────────────────────────
  // The map is the whole tab. Everything that describes the village rather than
  // a square of the picture — who lives here, the noticeboard, the houses, the
  // settings — went into the Menu. What is drawn over the map is what belongs to
  // it: the date, the way into the Menu, the village's news behind its own
  // button, and the way onto the whole screen. A villager's conversation is the
  // exception that slides in over the picture and back out again, so looking at
  // the map and talking about it are the same screen.
  //
  // The two wrappers the panels used to sit in went with them. The map is still
  // measured against the drawn picture rather than against this frame, so a
  // picture that does not share the frame's shape is cropped, stretched or
  // letterboxed by the framing the player chose, and the pins stay on the right
  // houses in every one of those cases.
  //
  // The row is down to one child now that the news is not a column of it, and it
  // is kept rather than flattened for two reasons: the root stacks its children
  // down the page and this screen's one child is the map, and the frame's own two
  // numbers and the room that keeps the frame clear of the edge are stated
  // against this row.
  // ── RETIRED 0.4.43 — the branch that stopped being the tab ──────────────────
  // What stood here was `const sceneLock = sceneListing?.lock ?? null;` and an
  // early return that drew `SceneGate` INSTEAD of the village whenever the
  // listing carried a lock. The village stood still while one villager was out.
  //
  // It is gone because there is nothing left to be true of. A lock needed a link
  // record, the link record is what 0.4.43 deleted, and the reason it could be
  // deleted is that a spin-off is a roleplay the player owns: the village takes a
  // snapshot at the moment the chat is made and then has nothing further to do
  // with it. "The village still reaches the chat without a live feed" is answered
  // by the snapshot being frozen, and a gate was only ever needed while the
  // answer was a live feed.
  //
  // See the RETIRED note above where `SceneGate` used to be for what a revival
  // would need: `readVillageSceneLock` and `sceneLockedRoutes` are both still
  // there on the server, exported and uncalled.

  return (
    <div
      className={`${ELEMENT_TAG}-root ${ELEMENT_TAG}-home ${ELEMENT_TAG}-home-full`}
      data-mobile={mobile ? "true" : "false"}
    >
      <div className={`${ELEMENT_TAG}-home-bar`}>
        <HomeDateWeather weather={snapshot?.village.weather ?? ""} />
        {!mobile && snapshot?.isFounded && destinationPlaces(snapshot.settings.venues).length > 0 ? (
          <div className={`${ELEMENT_TAG}-places-picker`}>
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              aria-expanded={placesOpen}
              aria-controls={`${ELEMENT_TAG}-places-list`}
              disabled={busy}
              onClick={() => {
                setOpenPlaceId(null);
                setPlacesOpen((open) => !open);
              }}
            >
              Places
            </button>
            {placesOpen ? (
              <div id={`${ELEMENT_TAG}-places-list`} className={`${ELEMENT_TAG}-places-list`}>
                {snapshot.settings.venues.map((place) => (
                  <div key={place.id} className={`${ELEMENT_TAG}-places-list-row`}>
                    <span className={`${ELEMENT_TAG}-places-list-name`}>{place.name}</span>
                    <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => openPlace(place)}>
                      View venue
                    </button>
                    <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => void openRoom(place)}>
                      Visit
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        <span className={`${ELEMENT_TAG}-home-bar-actions`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-mobile-board-button`}
            aria-label={`Noticeboard (${snapshot?.noticeboard.length ?? 0})`}
            disabled={!snapshot || busy}
            onClick={() => openMenu("noticeboard")}
          >
            <span aria-hidden="true">▤</span>
          </button>
          {snapshot?.isFounded ? (
            <VillageEvents happenings={snapshot.happenings} recap={snapshot.recap} mobile={mobile} />
          ) : null}
          <button
            type="button"
            className={`${ELEMENT_TAG}-button ${ELEMENT_TAG}-mobile-menu-button`}
            aria-label="Open settings menu"
            disabled={busy || !snapshot}
            onClick={() => {
              setMenuSection("index");
              setScreen("menu");
            }}
          >
            ☰
          </button>
          {!mobile ? <FullscreenToggle /> : null}
          {placingHome ? (
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={() => setPlacingHome(false)}>
              Cancel
            </button>
          ) : null}
        </span>
      </div>
      <div className={`${ELEMENT_TAG}-room`}>
        <div className={`${ELEMENT_TAG}-home-map-viewport`}>
          <MapStage
            src={townMapSrc}
            alt={`A map of ${snapshot?.village.name ?? "the village"}.`}
            pins={savedPins}
            // Placing a house happens out here, on the map itself, because the list
            // that asked for it cannot also be the map.
            placing={placingHome}
            view={savedTownMapView}
            shape={townMapShape}
            onPlace={placeHomeOnMap}
            // A press on the picture itself is the way out of a pin's doors: the map
            // is the one thing on the screen that is not one of the choices, so it is
            // what "never mind" looks like here. See `openPlaceId`.
            onDismiss={() => {
              setOpenPlaceId(null);
              setPlacesOpen(false);
            }}
            // The homepage is the whole tab, so the room it is drawn in is also the
            // ceiling on how big it can be. Every other stage sits in a column that
            // is sized by the prose beside it and has no ceiling to respect.
            fitToRoom={!mobile}
            mobile={mobile}
            photoPins
          >
            {/* Anything that went wrong, or anything the village is in the middle of
            doing, held at the foot of the picture rather than in a bar across it.
            It is only ever there while there is something to say, which is what
            lets it sit over the map.

            One container for all of it, rather than one per kind. They are all
            pinned to the same corner, and two of these on screen at once — an
            error and a house waiting to be placed — used to be two boxes in the
            same place, drawn over each other. */}
            {error || settingsError || placingHome || catchingUp || lastSceneEnding ? (
              <div className={`${ELEMENT_TAG}-notice`}>
                {error ? (
                  <p className={`${ELEMENT_TAG}-error`} role="alert">
                    {error}
                  </p>
                ) : null}
                {settingsError ? (
                  <p className={`${ELEMENT_TAG}-error`} role="alert">
                    {settingsError}
                  </p>
                ) : null}
                {/* What to do next while a house is waiting to be put down. The panel
                that asked for the click is off screen by now. */}
                {placingHome ? (
                  <span className={`${ELEMENT_TAG}-status`}>Click the map where the house stands.</span>
                ) : null}
                {/* The village is writing about time it has not been open for. The
                map does not change until it is done, so without this a slow
                catch-up is indistinguishable from a village that does nothing. */}
                {catchingUp ? (
                  <span className={`${ELEMENT_TAG}-status`}>
                    Catching up on what {snapshot?.village.name ?? "the village"} has been doing…
                  </span>
                ) : null}
                {lastSceneEnding ? <p className={`${ELEMENT_TAG}-status`}>{lastSceneEnding}</p> : null}
              </div>
            ) : null}
          </MapStage>
        </div>
      </div>

      {/* ── DORMANT 0.4.45 — the notice that told a phone held upright to turn.
            It covered the whole row rather than the map's own box, because on a
          portrait phone the map was a letterboxed strip with nowhere to put a
          sentence. The map is drawn upright now and the sentence is no longer
          true; the component is dormant beside its own definition and the CSS is
          dormant in the stylesheet. Put this line back to bring it back. */}
      {/* <RotateNotice /> */}
    </div>
  );
}

class MarinaraVillagesElement extends HTMLElement {
  declare __root: VillagesCapabilityElement["__root"];

  connectedCallback() {
    syncVillagesStyles();
    this.__root ??= createRoot(this);
    this.__root.render(
      <VillagesClientErrorBoundary element={this}>
        <CapabilityRoot element={this} />
      </VillagesClientErrorBoundary>,
    );
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (!this.isConnected && this.__root) {
        this.__root.unmount();
        this.__root = null;
      }
      syncVillagesStyles();
    });
  }
}

/**
 * Which of the package's two surfaces this element is.
 *
 * The tab and the toolbar are the same tag mounted in different slots, and the
 * host says which by the `view` attribute — `CapabilityElement` writes it on the
 * element it creates and never touches it again. Props arrive separately, in
 * `capabilityProps`, and they arrive AFTER this element is already in the
 * document: the host assigns them in a layout effect and republishes them as a
 * `marinara-capability-props` event rather than re-rendering anything. So the
 * subscription below is not an optimisation, it is the only way the toolbar ever
 * hears the chat it is standing in — and a first paint that read the props once,
 * on connect, would draw a button for no chat at all and never correct itself.
 *
 * The tab is what an unrecognised view gets, because the tab is what the package
 * had before there was a second surface, and because its own slot names itself
 * `browser`: a view this file has never heard of is still the village, and
 * drawing nothing would be a screenshot of an empty tab.
 */
function CapabilityRoot({ element }: { element: VillagesCapabilityElement }) {
  const [, redraw] = useState(0);
  useEffect(() => {
    const update = () => redraw((value) => value + 1);
    element.addEventListener("marinara-capability-props", update);
    return () => element.removeEventListener("marinara-capability-props", update);
  }, [element]);
  const view = element.getAttribute("view");
  // The two in-chat surfaces. Both are told which chat they are standing in and
  // both ask the village where it came from, because neither can see the tab and
  // the tab cannot see the chat. Neither of them does anything else: on a one-way
  // lane, knowing where a chat came from is the whole of what a chat can be told.
  if (view === "tracker") {
    return <SpinOffPanel props={element.capabilityProps ?? {}} />;
  }
  if (view === "toolbar") {
    return <SpinOffToolbar props={element.capabilityProps ?? {}} />;
  }
  return <VillagesView element={element} />;
}

/** A house with a way back into it. The only icon in the package's chrome. */
function SpinOffHomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
      <path d="M9.5 16.5h5" />
    </svg>
  );
}

// ── RETIRED 0.4.43 — the tick and the ring. ──────────────────────────────────
// Two of the three icons this package's chrome had, both of them about a press
// that no longer exists. `SceneDoneIcon` marked a scene that had just been read
// back, and `SceneBusyIcon` a chat being read right now; and on a one-way lane
// there is no reading, so the chip has one state and one icon.
//
// Kept rather than deleted because they are the only drawing of a state this
// package ever had in someone else's chat, and a later lane that reads anything
// back — a memory, a summary — would want them again. Reviving them means
// reviving `phase` in `useChatSpinOff` first, which is where the state machine
// and its four names were argued out.
//
// /** A tick, for a scene that has just been read back. */
// function SceneDoneIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       aria-hidden="true"
//     >
//       <path d="M4 12.5 9.5 18 20 6.5" />
//     </svg>
//   );
// }
//
// /** A ring, for a scene being read back right now. */
// function SceneBusyIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2.5"
//       strokeLinecap="round"
//       className={`${ELEMENT_TAG}-spin`}
//       aria-hidden="true"
//     >
//       <path d="M12 3a9 9 0 0 1 9 9" />
//       <path d="M12 21a9 9 0 0 1-9-9" opacity=".35" />
//     </svg>
//   );
// }
// The stylesheet's `-spin` keyframes and its `[data-state="done"]` rule on the
// tracker are left in place with nothing to match, the same way the `-gate*`
// rules were: both are small, both are still correct if the states come back, and
// neither costs anything while they do not.

/**
 * Where the Engine keeps which of its chats this browser has open.
 *
 * The key is the Engine's, and writing it is the whole of this package's ability
 * to take the player anywhere. There is no URL router in the Engine to send them
 * to a chat with: opening a chat is a write to a store this tab has no way in
 * to, and the store's own starting value is read out of this key
 * (`stores/chat.store.ts`, `STORAGE_KEY`). One key in one browser is what a
 * package can reach.
 *
 * It is declared here, beside the one press that uses it, and deliberately not up
 * with the request helpers: those are a single unbroken run of code and
 * `tests/villages-remote-access.regression.ts` reads the run out of this file and
 * runs it, so a constant wedged between the header builder and the admin-secret
 * hint would be caught there as a broken module rather than as a stray key. A
 * fact that has to keep its distance from a proof has found its own place.
 */
const ACTIVE_CHAT_STORAGE_KEY = "marinara-active-chat-id";

/**
 * Put the player back in the village: out of the chat, and on the tab that owns
 * it.
 *
 * The mirror of `leaveForChat`, and the same one key. The Engine reads this key
 * to decide whether it is showing a chat or the home screen
 * (`components/layout/AppShell.tsx`, where the whole shell is built around
 * `activeChatId`), and its own recovery path clears the same key to get back to
 * the top. Removing it is therefore not a trick played on a store: it is the
 * Engine's own way of saying "no chat", and a load later the player is on Home
 * with their chats and their tabs in front of them.
 *
 * What it deliberately does NOT do is name the tab for them. No package can put
 * the player on the Villages tab — the tab the Engine last had open is stored in
 * the Engine's own UI persistence blob, and writing one key inside a versioned
 * blob this package does not own is the kind of thing that breaks on the next
 * upgrade. Home is one click from here and the copy says so.
 *
 * ponytail: the ceiling is the same as `leaveForChat`'s — a real page load, one
 * click short of the tab. The upgrade path is an Engine-side navigation
 * capability for packages, which does not exist
 * (`shared/src/schemas/capability-package.schema.ts`). Player-pressed only, and
 * never fired by anything but a click.
 */
function leaveForVillage(): void {
  try {
    window.localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
  } catch {
    //  Same as above: the load still happens, and Home is still where a browser
    //  with no remembered chat opens.
  }
  window.location.reload();
}

/**
 * Where this roleplay came from, if it came from the village.
 *
 * Two surfaces ask this question about the same chat — the chip in the chat's own
 * chrome and the body in the Engine's tracker panel — because the player asked
 * for both and said they would like to see which they prefer. They are one read
 * and one press, and sharing them here is what keeps that true: two surfaces that
 * answered differently, or that made one read each for one chat, would be one
 * feature wearing two names.
 *
 * IT CANNOT FAIL, WHICH IS WHY THERE IS NO PHASE MACHINE. It used to have one —
 * `idle`/`busy`/`done`/`failed` — because the press here read a scene back and a
 * model call can go wrong. In 0.4.43 there is nothing to call: the chat is an
 * ordinary roleplay the village has already let go of, and the only press left is
 * "Open the village", which is a page load. So the surfaces draw one card and no
 * spinner, and a read that fails is the same as a chat that did not come from the
 * village: the surfaces draw nothing.
 *
 * `known` is false until a read has actually answered, and it stays false when a
 * read fails. The surfaces draw nothing until the village has spoken, because a
 * chat that has nothing to do with the village should not wear a line saying so,
 * and a village route having a bad day is not a fact to put in the chrome of
 * somebody else's chat. The server answers `null` — not an error — for a chat
 * with no stamp, which is most roleplay chats in the player's library.
 */
function useChatSpinOff(chatId: string, enabled: boolean) {
  const [origin, setOrigin] = useState<VillageSpinOffOriginView | null>(null);
  const [known, setKnown] = useState(false);

  useEffect(() => {
    //  A second chat in the same element position is a different question, so the
    //  answer from the last one is dropped before the new one is asked for —
    //  including the answer that there was nothing to find.
    setKnown(false);
    setOrigin(null);
    if (!enabled) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const answer = await request<VillageSpinOffOriginView | null>(`/spinoffs/${encodeURIComponent(chatId)}`, {
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        //  A null body is a chat the village never made, which is the same
        //  answer as a chat it has forgotten — either way there is nothing to
        //  draw, so it is normalised here rather than at each caller.
        setOrigin(answer ?? null);
        setKnown(true);
      } catch {
        //  Silent on purpose. See above: silence is an answer here, and the only
        //  alternative is a sentence about this package's problems in a chat
        //  that may have nothing to do with it.
      }
    })();
    return () => controller.abort();
  }, [chatId, enabled]);

  return { origin, known };
}

/**
 * The village's one control inside a roleplay chat the player is already in.
 *
 * THE OTHER HALF OF THE DRAWER'S SPIN-OFF SECTION, and the half that could not be
 * put anywhere else. A spin-off is an ordinary Engine chat, so the player leaves
 * this tab to be in it — and the moment they are standing in it is the moment
 * they may want to go back and look at the village it came from. Nothing in this
 * tab can see that moment: the `home-browser-tab` slot is not mounted while a
 * chat is open, and no village route is told when a chat is opened. The Engine's
 * own chat toolbar is the only surface that is there, so this is drawn in it.
 *
 * IT SAYS WHOSE CHAT THIS IS, which is the whole of what is left to say. A chat
 * made from a village looks exactly like every other chat, and a player who does
 * not connect this one to the place it came from has no reason to believe the
 * village is a place they can be. So the chip carries the word VILLAGES next to
 * its house and opens with the sentence that names the village.
 *
 * IT APPEARS ONLY IN A SPIN-OFF. Every roleplay chat in the player's library
 * mounts this element, and a chip offering "Open the village" in a chat with
 * nobody from the village in it would be a control about a place that has nothing
 * to do with what is on screen. So the first thing the chip does is ask where
 * this chat came from, and if the answer is nowhere it draws nothing at all. That
 * read is silent when it fails, deliberately: it runs once for every roleplay
 * chat the player opens, and a village route having a bad day is not a thing to
 * put in the chrome of a chat that has nothing to do with the village.
 *
 * IT OFFERS NOTHING BACK, because there is nothing here to give. Until 0.4.43 the
 * first button read the chat back into the village; that is retired, and what is
 * left is the way to the village itself. The note underneath says the one-way
 * fact out loud — the village took a picture of itself when this chat began and
 * has not looked at it since — because a player who believes the village is
 * reading their roleplay would be right to wonder who is waiting on them.
 */
function SpinOffToolbar({ props }: { props: Record<string, unknown> }) {
  const chatId = typeof props.chatId === "string" ? props.chatId : "";
  const inRoleplayChat = props.chatMode === "roleplay";
  const compact = props.mobileCompact === true;
  const hostButtonClass = typeof props.toolbarButtonClass === "string" ? props.toolbarButtonClass : "";
  const { origin, known } = useChatSpinOff(chatId, inRoleplayChat && chatId.length > 0);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLSpanElement | null>(null);

  //  A different chat closes whatever was open about the last one.
  useEffect(() => setOpen(false), [chatId, inRoleplayChat]);

  /*
    Closing is the menu's own business, and this is the whole of it: a press
    anywhere that is not the chip or the menu itself, or Escape. No focus trap
    and no backdrop, deliberately — this hangs off a button in the chat's own
    chrome rather than covering the chat, and the paragraph the player came here
    to read stays readable behind it.
  */
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (root.current?.contains(event.target as Node)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!inRoleplayChat || !known || origin === null) return null;

  const name = origin.name || "your villager";
  const where = origin.villageName || "your village";
  const chipLabel = `Villages — this roleplay spun off from ${where}`;

  return (
    <span className={`${ELEMENT_TAG}-tracker`} data-compact={compact} data-open={open} ref={root}>
      <button
        type="button"
        className={
          hostButtonClass
            ? `${hostButtonClass} ${ELEMENT_TAG}-tracker-chip`
            : `${ELEMENT_TAG}-button ${ELEMENT_TAG}-tracker-chip`
        }
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={chipLabel}
        aria-label={chipLabel}
      >
        <SpinOffHomeIcon />
        <span className={`${ELEMENT_TAG}-tracker-label`}>Villages</span>
      </button>
      {open ? (
        <div className={`${ELEMENT_TAG}-tracker-menu`} role="menu" aria-label={`Villages — ${where}`}>
          <p className={`${ELEMENT_TAG}-tracker-menu-title`}>This roleplay spun off from {where}</p>
          {origin.resident ? (
            <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
              {name} still lives there. {where} was photographed into this chat the moment it was made, and has not
              looked at it since: nothing said here is read, counted or kept by the village.
            </p>
          ) : (
            <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
              {name} does not live in {where} any more. This chat is yours either way — it was let go of the moment it
              was made, and nothing in the village is waiting on it.
            </p>
          )}
          <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
            It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the
            village.
          </p>
          <div className={`${ELEMENT_TAG}-tracker-menu-row`}>
            {/* Leaving the chat is a page load — the Engine has no way for a
                package to put the player on a screen without one — so the button
                says where it lands rather than pretending to be instant. */}
            <button
              type="button"
              className={`${ELEMENT_TAG}-button`}
              onClick={leaveForVillage}
              title={`Leaves this chat and opens Marinara's home screen, where the ${where} tab is waiting.`}
            >
              Open the village
            </button>
          </div>
        </div>
      ) : null}
    </span>
  );
}

/**
 * The same answer, said at length, where the player keeps their tracker panels.
 *
 * THE SECOND OF THE TWO SURFACES, and it exists because the player asked for both
 * rather than because the first was wrong: the chip is where the eye already is,
 * and a sidebar is where a player who wants to be told something looks. What that
 * costs is duplication, and what pays for it is `useChatSpinOff` — one read, one
 * answer, drawn twice.
 *
 * It is drawn for EVERY roleplay chat once the package is enabled, because the
 * Engine mounts one element per package per open panel and this package cannot be
 * told which chats are its own. So the honest answer for a chat that did not come
 * out of a village is the line saying so, which is also the line that tells the
 * player this panel exists at all and what it is for.
 *
 * WHAT IT DRAWS IS PROVENANCE AND NOTHING ELSE. There used to be a line count and
 * a "waiting until they come home" sentence; both were about a village that was
 * holding the chat, and this one is not holding anything. The rows name the
 * villager, the village and the chat, which is everything the stamp recorded —
 * and the chat's own name is drawn because the player may have renamed it since
 * and this is the only place that says which paste-up it is.
 *
 * The Engine supplies the card, the veil and the heading; this contributes the
 * body and nothing else. See the panel-view rules in the stylesheet.
 */
function SpinOffPanel({ props }: { props: Record<string, unknown> }) {
  const chatId = typeof props.chatId === "string" ? props.chatId : "";
  const inRoleplayChat = props.chatMode === "roleplay";
  const { origin, known } = useChatSpinOff(chatId, inRoleplayChat && chatId.length > 0);

  //  Nothing at all until the village has answered, including when the answer
  //  was a failure: see `useChatSpinOff`.
  if (!inRoleplayChat || !known) return null;

  if (origin === null) {
    return (
      <div className={`${ELEMENT_TAG}-panel-view`}>
        <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
          This chat did not come out of a village. A roleplay started from Villages says so here.
        </p>
      </div>
    );
  }

  const name = origin.name || "this villager";
  const where = origin.villageName || "your village";
  return (
    <div className={`${ELEMENT_TAG}-panel-view`}>
      <p className={`${ELEMENT_TAG}-tracker-menu-note`}>
        {origin.resident
          ? `This roleplay spun off from ${where}, and ${where} has not looked at it since. Nothing said here is read, counted or kept by the village.`
          : `This roleplay spun off from ${where}, and ${name} does not live there any more. Nothing said here is read by the village either way.`}
      </p>
      <div className={`${ELEMENT_TAG}-panel-view-row`}>
        <span className={`${ELEMENT_TAG}-panel-view-key`}>Villager</span>
        <span>{name}</span>
      </div>
      <div className={`${ELEMENT_TAG}-panel-view-row`}>
        <span className={`${ELEMENT_TAG}-panel-view-key`}>Chat</span>
        <span>{origin.room}</span>
      </div>
      <div className={`${ELEMENT_TAG}-panel-view-row`}>
        <span className={`${ELEMENT_TAG}-panel-view-key`}>Came from</span>
        <span>{where}</span>
      </div>
      <div className={`${ELEMENT_TAG}-panel-view-actions`}>
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          onClick={leaveForVillage}
          title={`Leaves this chat and opens Marinara's home screen, where the ${where} tab is waiting.`}
        >
          Open the village
        </button>
      </div>
    </div>
  );
}

if (!customElements.get(ELEMENT_TAG)) customElements.define(ELEMENT_TAG, MarinaraVillagesElement);
