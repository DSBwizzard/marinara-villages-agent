import type { SpeechDelivery, SpeechPresentation } from "../helpers/scene-speech.js";
import type { StagingCue } from "../helpers/scene-staging.js";
import type { PlayerBackground } from "./player-background.js";
import type { VillagesWalkBeat } from "./scene-beat.js";

/** Client-visible wire data. Private saved-world and Scene records stay on the server. */

export type ScenarioImprint = {
  origin: string;
  worldFacts: string[];
  openingConditions: string[];
  visualCues: string[];
};

export type VillageVillagerView = {
  letterFontId?: string;
  identityDescription?: import("./resident-description.js").ResidentIdentityDescription;
  signature?: import("../helpers/resident-signature.js").ResidentSignatureImage;
  signatureFallback?: import("../helpers/resident-signature.js").ResidentSignature;
  characterId: string;
  nameColor: string;
  dialogueColor: string;
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

export type ResidentSprite = {
  assetId: string;
  expressions: Array<{ view: "front" | "side"; label: string; filename: string }>;
  images: Array<{
    view: "front" | "side";
    label: string;
    url: string;
    expressionId?: string;
    isDefault?: boolean;
  }>;
  framing: { mode: "full" | "half" };
};

export type VillagerRefreshPreview = {
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
export type VillageBackgroundPace = "off" | "quiet" | "balanced" | "lively";
export type VillageNarrativeConsequence = "gentle" | "moderate" | "dramatic";

export type BackgroundWork = {
  id: string;
  instanceId: string;
  kind:
    | "story" // Retired saved job identity; no generation or retry.
    | "resident-planning"
    | "world-development"
    | "agenda"
    | "translation"
    | "wish"
    | "personal-mail"
    | "social-recovery"
    | "starting-ties"
    | "schedule-influence";
  subjectId: string;
  label: string;
  status: "queued" | "running" | "paused" | "failed" | "interrupted" | "completed" | "obsolete";
  attempt: number;
  completedSteps: number;
  requests: number;
  tokens: number | null;
  error: string;
  connectionPaused: boolean;
  updatedAt?: string;
  failedAt?: string;
  failure?: {
    cause: string;
    stage: string;
    finishReason?: string;
    requestedOutputTokens?: number;
    checkIds?: string[];
  };
};

export type ReturnCatchupView = {
  id: string;
  status: "queued" | "running" | "failed" | "recovering" | "completed" | "cancelled";
  from?: string;
  until?: string;
  completed: number;
  total: number;
  settlementRequired: boolean;
  issue: "generation" | "interpretation" | "settlement" | "authority" | null;
};

export type VillageSnapshot = {
  worldScope: string;
  sceneChanges?: { sceneId: string; revision: string };
  sceneVenue?: { sceneId: string; venue: VillageSettings["venues"][number] };
  opening?: import("./opening.js").OpeningView;
  clock?: import("./clock.js").VillageClockView;
  backgroundWork?: BackgroundWork[];
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
  venueRequests: VenueRequest[];
  projects: BuildProject[];
  residences: {
    characterId: string;
    venueId: string;
    proposedVenueId: string;
    proposedPrivateZoneId?: string;
    status: "current" | "pending" | "moving";
    requestedBy?: "player" | "villager";
    completesAt?: string;
  }[];
  villagers: VillageVillagerView[];
  relationshipStartingPending?: boolean;
  /**
   * Whether the village has been founded yet. Not part of the settings: it is a
   * fact about the village, not something the player can edit.
   */
  isFounded: boolean;
  progressEngineVersion: 1;
  foundingPreparation: {
    canPlay: boolean;
    status: "pending" | "failed" | "ready";
    completedIds: string[];
    tasksVersion?: 1;
    tasks?: import("./founding-tasks.js").FoundingResidentTasks;
    retryActions?: string[];
    selectedTasks?: string[];
    currentTask?: "routine" | "wish";
    venueDetailsSeeded?: boolean;
    currentId: string;
    error: string;
    phase?: "venues" | "private-spaces" | "residents";
    currentVenueId?: string;
    currentZoneId?: string;
    privateSpacesReady?: number;
    privateSpacesTotal?: number;
    stage?: "reading" | "lore" | "resolving" | "queued" | "model" | "validating" | "applying" | "saving";
    stageStartedAt?: string;
    attempt?: number;
    loreEntryCount?: number;
    modelName?: string;
  } | null;
  settings: VillageSettings;
};

export type VenueRequest = {
  id: string;
  requesterCharacterId?: string;
  requesterName?: string;
  requestQuote?: string;
  source?: "chat" | "background";
  proposedAt: string;
  venueDraft?: { name: string; classes: Array<"residence" | "workplace" | "community" | "other">; description: string };
};

export type BuildProject = {
  id: string;
  kind: "new-venue" | "renovation";
  title: string;
  venueId: string;
  updatedAt: string;
  requesterCharacterId?: string;
  participantIds?: string[];
  status: "planning" | "working" | "paused" | "complete" | "cancelled";
  progress: number;
  venueDraft?: {
    name: string;
    description: string;
    classes: VenueClass[];
    position?: { mapId?: string; x: number | null; y: number | null };
  };
  plan?: {
    capacity: number;
    form: string;
    venueType: string;
    exteriorDescription: string;
    imageContext?: { useAssignedVillagerContext: boolean; useVisualLore: boolean };
    layoutVersion: 1;
    layout: "exterior" | "common" | "private" | "both";
    spaces: NonNullable<VillageVenue["zones"]>;
    privateSpaces: NonNullable<VillageVenue["zones"]>;
    exteriorImage: VillageVenueImage | null;
  };
  opening?: { established: boolean; provenance: string; work: string; firstUse: string };
  lifecycle?: {
    phase: BuildProject["status"];
    revision: number;
    targetVenueId: string;
    change: { classes?: VenueClass[]; capacity?: number; zones?: VillageZoneDraft[]; detail: string } | null;
    affectedIds: string[];
    approvals: { residentId: string; source: "conversation" }[];
    candidates: { residentId: string }[];
    builderId: string;
    workOrder: {
      startsAt: string;
      completesAt: string;
      pausedAt: string;
      remainingMs: number;
      focus?: { minutes: number; nextPeriod: { startsAt: string; endsAt: string } | null };
    } | null;
    blockedReason: string;
    completedAt: string;
  };
};

export type ProgressDebugView = {
  engineVersion: 0 | 1;
  tasks: Array<{
    definition: {
      id: string;
      revision: number;
      owner: { kind: string; id: string };
      phases: Array<{ id: string; title: string; requirements: Array<{ id: string; title: string }> }>;
    };
    revisionHistory: Array<{
      definition: { revision: number; phases: Array<{ id: string; title: string }> };
      receipts: Array<{
        requirementId: string;
        evidence: {
          sourceId: string;
          excerpt?: string;
          grade?: string;
          citations?: { lineId: string; quote: string }[];
        };
      }>;
      transitions: Array<{ phaseId: string; at: string }>;
    }>;
    visibleAt: string;
    requirementVisibleAt: Record<string, string>;
    phaseIndex: number;
    receipts: Array<{
      id: string;
      phaseId: string;
      requirementId: string;
      routeId: string;
      definitionRevision: number;
      evidence: {
        sourceId: string;
        lineId?: string;
        excerpt?: string;
        at: string;
        grade?: string;
        citations?: { lineId: string; quote: string }[];
      };
    }>;
    attempts: Array<{ phaseId: string; requirementId: string; status: string; reason: string; evidenceId: string }>;
    transitions: Array<{ phaseId: string; at: string; evidenceId: string }>;
    resolvedAt: string;
    resolutionKey: string;
  }>;
  backlog: Array<{ sessionId: string; submissionId: string; at: string; error: string }>;
  speechProofs?: Array<{
    projectId: string;
    lineId: string;
    quote: string;
    grade?: string;
    citations?: { lineId: string; quote: string }[];
  }>;
};

/** What a home can be, and the class it belongs to, as the village's own catalogue states it. */
export type VillageBuildingOption = {
  kind: string;
  name: string;
  category: string;
};
export /** One insertable prompt token, with the wording the server also renders from. */
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
export type VillageVenueImage = {
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
export type VillageVenue = {
  zoneLayout?: import("../helpers/zone-layout.js").ZoneLayout;
  venueType?: string;
  accessView?: import("../helpers/venue-access.js").VenueAccessView;
  destinations?: Record<string, { home?: string; sleep?: string; work?: string }>;
  layoutVersion?: 1;
  layout?: "exterior" | "common" | "private" | "both";
  imageContext?: { useAssignedVillagerContext: boolean; useVisualLore: boolean };
  id: string;
  constructionStatus?: "worksite" | "complete";
  buildProjectId?: string;
  name: string;
  form?: string;
  classes?: Array<"residence" | "workplace" | "community" | "other">;
  zones?: Array<
    NonNullable<VillageVenue["spaces"]>[number] & {
      name: string;
      relationshipAccess?: boolean;
      kind: "exterior" | "public" | "shared-residence" | "private-residence" | "staff" | "restricted";
      closed?: boolean;
      ownerId?: string;
      purpose?: string;
      access?: import("../helpers/venue-access.js").ZoneAccessPolicy;
      accessView?: import("../helpers/venue-access.js").ZoneAccessView;
      controllerIds?: string[];
      preparation?: { status: "pending" | "ready" | "failed"; error?: string };
      seen?: boolean;
    }
  >;
  spaces?: Array<{
    connectedTo?: string[];
    id: string;
    roomSpecification?: string;
    name?: string;
    ownerId?: string;
    purpose?: string;
    access?: import("../helpers/venue-access.js").ZoneAccessPolicy;
    accessView?: import("../helpers/venue-access.js").ZoneAccessView;
    controllerIds?: string[];
    venueClass: "residence" | "workplace" | "community" | "other";
    description: string;
    freezePicture?: boolean;
    pictureRetryAvailable?: boolean;
    pictureUpdateAvailable?: boolean;
    pictureProblem?: string;
    pictureUpdating?: boolean;
    image: VillageVenueImage | null;
    state: import("./place-continuity.js").PlaceContinuity;
  }>;
  residenceCapacity?: number;
  residentIds?: string[];
  playerInvitations?: {
    privateSpaceId?: string;
    zoneId?: string;
    residentId: string;
    recordedAt: string;
    scope?: "shared" | "private";
    ownerId?: string;
  }[];
  exteriorState?: NonNullable<VillageVenue["spaces"]>[number]["state"];
  privateSpaces?: Array<
    NonNullable<VillageVenue["spaces"]>[number] & {
      ownerId: string;
      name?: string;
      purpose?: string;
      access?: import("../helpers/venue-access.js").ZoneAccessPolicy;
      accessView?: import("../helpers/venue-access.js").ZoneAccessView;
      controllerIds?: string[];
      initialImageAttemptedAt?: string;
    }
  >;
  playerSeenShared?: boolean;
  playerSeenPublic?: boolean;
  playerSeenPrivateIds?: string[];
  description: string;
  category: string;
  presentation: {
    mapId: string;
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
  state: import("./place-continuity.js").PlaceContinuity;
};

/**
 * How a picture that is not the map's shape is made to fit it. The names are
 * the CSS `object-fit` keywords the picture is drawn with, so the choice the
 * server stores is the choice the browser is given — nothing is translated
 * into a second vocabulary on the way.
 */
export type TownMapFit = "cover" | "stretch" | "contain";

/** Reviewed zone terms; artwork and discovered state are not part of a layout draft. */
export type VillageZoneDraft = { preserveDescription?: boolean } & Pick<
  NonNullable<VillageVenue["zones"]>[number],
  | "id"
  | "name"
  | "kind"
  | "description"
  | "roomSpecification"
  | "venueClass"
  | "purpose"
  | "controllerIds"
  | "ownerId"
  | "connectedTo"
>;

/**
 * Where the map frame is looking.
 *
 * The frame is a fixed shape and the picture is whatever the player picked, so
 * the picture is not resized to fit — the frame is moved over the picture. The
 * whole of this is stored, which is what makes a crop cost four numbers instead
 * of another copy of the image.
 */
export type TownMapView = {
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
export type VillageSettings = {
  characterSpeechColors: boolean;
  sendOnEnter: boolean;
  spriteCardFlipEnabled: boolean;
  spriteVariantsEnabled: boolean;
  promptKnowledge: string;
  defaultPromptKnowledge: string;
  promptBoxMaxLength: number;
  macros: readonly PresetMacro[];
  backgroundPace: VillageBackgroundPace;
  narrativeConsequence?: VillageNarrativeConsequence;
  backgroundPaces: readonly VillageBackgroundPace[];
  /** How long the village's own name may be, as the founding wizard asks for it. */
  villageNameMaxLength: number;
  /** The Persona the village is linked to, or "" for none. */
  playerPersonaId: string;
  /** That Persona's name, resolved, so the panel can say who you are. */
  playerPersonaName: string;
  /** True when the link is to a Persona that is no longer in the library. */
  playerPersonaMissing: boolean;
  setting: string;
  settingMaxLength: number;
  foundingReason: string;
  worldName: string | null;
  foundingDetails: string;
  foundingGuidance: string;
  playerBackground: PlayerBackground | null;
  scenarioImprint: ScenarioImprint | null;
  worldFacts: string[];
  selectedLorebookIds: string[];
  sceneryArtStyle: string;
  sceneryStyleProfileId: string | null;
  automaticZonePictures: boolean;
  personalizeVenueImagesByDefault: boolean;
  useVisualLoreByDefault: boolean;
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
  homeBuildings: readonly VillageBuildingOption[];
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
  maps: VillageMap[];
  townMapImageMaxLength: number;
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

export type CatalogEntry = {
  id: string;
  name: string;
  comment: string;
  summary: string;
  tags: string[];
  inVillage: boolean;
};

export type CatalogResponse = {
  characters: CatalogEntry[];
};

/**
 * One Persona the player could be, as the picker offers it.
 *
 * Deliberately not the whole Persona: the village reads the full text itself
 * when a villager is spoken to, so the catalog carries only what a choice card
 * needs. The selected Persona's authored fields are read separately.
 */
export type PersonaEntry = {
  id: string;
  name: string;
  summary: string;
  avatarPath: string | null;
  avatarCrop: unknown;
  /** The Persona the Engine itself has selected, listed first and marked. */
  isActive: boolean;
};

export type PersonaResponse = {
  personas: PersonaEntry[];
};
export /**
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
export /**
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
export type RoomLine = {
  /** A character id, or `""` for the player's own line — the same rule `asTranscriptMessage` writes by. */
  speakerId: string;
  /** What to print over the paragraph. Empty on the player's own lines. */
  name: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  heardBy?: string[];
  viaDoorway?: boolean;
  /** Local cast after this line's completed movement; never unseen Zone attendance. */
  physicalIdsAfter?: string[];
  remoteDelivery?: "loud";
  /** The registers of this line's own paragraphs, on the same terms as a message's. */
  beats?: ChatBeat[];
  kind?: "narration" | "dialogue" | "side" | "whisper";
  delivery?: SpeechDelivery;
  presentation?: SpeechPresentation;
  expression?: string;
  gazeAt?: string;
  staging?: StagingCue[];
  targetId?: string;
  asideFor?: string;
  id?: string;
};
export /** Somebody currently present in a room. See `SceneView`. */
type RoomParticipant = {
  characterId: string;
  name: string;
  /** What they were doing at that hour, in this village's terms, or `""`. */
  doing: string;
};
export type RoomOperation = {
  committed?: boolean;
  replyReady?: boolean;
  /** The Scene has ended and its completed transcript is no longer retained. */
  terminal?: boolean;
  recordEvents?: RoomRecordEvent[];
  turnOutcome?: import("./scene-turn-outcome.js").SceneTurnOutcome;
  recoverable?: boolean;
  id: string;
  kind: string;
  attemptId: string;
  status: "running" | "interrupted" | "complete";
  stage?: string;
  error?: string;
  input?: {
    zoneId?: string;
    message?: string;
    mode?: string;
    targetId?: string;
    contact?: { kind?: string; boundaryZoneId?: string };
    attentionChoice?: { id: string; zoneId: string };
  };
};

export type SceneChangeIssue = {
  canContinue?: boolean;
  continued?: boolean;
  submissionId: string;
  domain: string;
  status?: "pending" | "failed" | "rejected";
  at?: string;
  reason?: string;
};

export type SceneView = {
  capturedContext?: true;
  playerName?: string;
  /** An existing handoff needs return/recovery controls; private context stays server-side. */
  openingReader?: boolean;
  openingIntroductionResidentId?: string;
  semanticVersion?: 2;
  connectionMap?: { id: string; connectedTo?: string[] }[];
  attentionClarification?: { id: string; message: string; question: string; choices: { id: string; label: string }[] };
  memoryMode?: "live";
  version: 1;
  sceneRevision?: number;
  operation?: RoomOperation | null;
  id: string;
  placeId: string;
  /** The name that place had when the room opened, for the plate. */
  placeName: string;
  spaceClass?: VenueClass;
  zoneId?: string;
  grantedZoneIds?: string[];
  privateSpaceId?: string;
  zoneGrants?: { zoneId: string; controllerId: string }[];
  doorwayContacts?: { characterId: string; playerZoneId: string }[];
  entryOffers?: { zoneId: string; label: string; controllerId: string; accompanies: boolean }[];
  area?: "outside" | "shared" | "private" | "public";
  privateOwnerId?: string;
  privateAccessOwnerId?: string;
  startedAt: string;
  endedAt: string;
  lastActivityAt?: string;
  endReason?: "player" | "scene" | "inactivity" | "debug" | "";
  status: "opening" | "active" | "closing" | "closed";
  activeIds: string[];
  /** Residents encountered during this Scene; activeIds identifies the current Zone audience. */
  participants: RoomParticipant[];
  lines: RoomLine[];
  playback: Omit<import("./scene-playback.js").ScenePlaybackWindow, "lines" | "participants">;
  latestTurn?: { id: string; at: string; published: boolean };
};

export type RoomRecordEvent = {
  wishUpdate?: { actorId?: string; wishId: string; state: "revealed" | "progress" | "fulfilled" };
  id: string;
  kind: "memory" | "wish" | "venue" | "request" | "project" | "relationship-up" | "relationship-down";
  text: string;
  detail?: string;
};

export type ArchiveVisitSummary = Pick<
  SceneView,
  "id" | "placeId" | "placeName" | "startedAt" | "endedAt" | "endReason" | "participants"
> & {
  lineCount: number;
  memoryUnits: number;
  recollectionCount: number;
};

/**
 * What the village decided about a claim the player made.
 *
 * `fulfilled` is shown nowhere and is the flag the styling hangs off; `reason`
 * is the judge's own sentence and is the thing the player is actually owed,
 * because the villager's reply deliberately does not contain it. A player told
 * no with no reason would be told nothing at all.
 */
export type WishVerdict = {
  fulfilled: boolean;
  reason: string;
};

export type MemoryPerson = { id: string; name: string };
export type MemoryCursor = { revision: number; afterId: string };
export type MemoryListEntry = {
  id: string;
  rootId: string;
  revision: number;
  rootRevision: number;
  kind: "experience" | "information" | "open-matter";
  text: string;
  occurredAt: string;
  recordedAt: string;
  subjects: MemoryPerson[];
  knownBy: MemoryPerson[];
  forgotten: boolean;
  playerCorrection: boolean;
};
export type MemoryLibrary = {
  inspection: boolean;
  seed: string;
  revision: number;
  characterId: string;
  query: string;
  residents: MemoryPerson[];
  entries: MemoryListEntry[];
  total: number;
  next: MemoryCursor | null;
};
export type MemoryInspection = {
  seed: string;
  revision: number;
  entry: MemoryListEntry;
  knowers: {
    person: MemoryPerson;
    basis: "observation" | "report" | "interpretation" | "validated-event";
    attributedTo?: string;
    learnedAt: string;
    reinforcedAt: string;
    forgotten: boolean;
    playerCorrection: boolean;
    text: string;
    support: { sourceId: string; sceneId?: string; lineId: string; excerpt: string }[];
  }[];
};
export type MemoryForgetRequest = {
  operationId: string;
  seed: string;
  expectedCollectionRevision: number;
  target: { id: string; revision: number; rootRevision: number };
  knowers: string[];
};
export type MemoryCorrectRequest = MemoryForgetRequest & { text: string };

export /**
 * What one villager is after, or null when the village has not written for them.
 *
 * Null and empty are two different things here and the panel says so: null is a
 * villager waiting to be written for, and an empty agenda is the village having
 * asked and had nothing to say. `source` records where the agenda overview came
 * from, and `generatedAt` is shown and never read.
 */
type VillagerAgenda = {
  routineSummary: string;
  day: { startMinute: number; endMinute: number; venueId: string; activity: string }[];
  week?: Record<string, AgendaBlock[]>;
  scheduleInfluenceSnapshot?: { adopted: string[]; unresolved: string[]; available: boolean };
  scheduleWeek?: Record<string, AgendaBlock[]> | null;
  activeDay?: { dateKey: string; weekday: string; blocks: AgendaBlock[]; scheduleInformed: boolean };
  personalizationPending?: boolean;
  personalizationFailure?: string;
  source: "native" | "village";
  generatedAt: string;
};
export type AgendaBlock = {
  startMinute: number;
  endMinute: number;
  venueId: string;
  activity: string;
};
export /**
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
export type VillageRemap = {
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
export /**
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
  current: boolean;
};
export /**
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
export /**
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

/** Owned resolved Agenda and optional influence controls. Legacy remap fields are inert compatibility data. */
export type VillagerAgendaView = {
  canInterpretSchedule?: boolean;
  effectiveDays?: Record<string, AgendaBlock[]>;
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
  scheduleInfluence?: { version: 1; enabled: boolean; categories: Record<string, boolean> };
  ingestSchedule: boolean;
  nativeSchedule: {
    weekStart: string;
    days: Record<string, { time: string; activity: string }[]>;
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

export type AgendaListResponse = {
  villagers: VillagerAgendaView[];
};

/** The per-village writing controls returned by /narration. */
export type VillageWritingView = {
  tense: "present" | "past";
  person: "first" | "second" | "third";
  rating: "sfw" | "nsfw";
  writingGuidance: string;
  writingGuidanceMaxLength: number;
};

export type VillageConnectionSettings = {
  systemConnectionId: string;
  narrationConnectionId: string;
  imageConnectionId: string;
};

export type VenueClass = NonNullable<VillageVenue["classes"]>[number];

export type SetupMapRequest = {
  id: string;
  sourceKey: string;
  startedAt: string;
  phase: "starting" | "waiting" | "paused";
};

export type SetupMapReceipt = {
  id: string;
  sourceKey: string;
  startedAt: string;
  status: "running" | "complete" | "failed" | "interrupted";
  error: string;
  result: { image: string; width: number; height: number } | null;
};

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
export type VillageLorebookOption = { id: string; name: string; enabled: boolean; hiddenFromLibrary?: boolean };
export type VillageMap = {
  id: string;
  name: string;
  artwork: VillageVenueImage;
  width: number;
  height: number;
  view: TownMapView;
  revision: number;
};
