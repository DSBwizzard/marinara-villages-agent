import type { SpriteManagerState } from "../../../shared/contracts/sprites.js";
import type { VillageSettings } from "../../../shared/contracts/village.js";
import type { VillageNarrationStyle } from "../rules/narration-style.js";
import type { ProgressTask } from "../rules/progress-engine.js";
import type { HomeBuildingKind } from "../rules/prompt-preset.js";

/** Resident Wish authority and its witnessed conditions. */
export type VillageWish = import("../../../shared/contracts/wishes.js").SocialWish;

/** Owned routines and dated commitments. */
export type VillageAgenda = {
  plannedDays?: Record<string, VillageAgendaBlock[]>;
  routineProfile?: import("../rules/owned-routine.js").RoutineProfile;
  scheduleInfluenceSnapshot?: import("../rules/owned-routine.js").InfluenceSnapshot;
  socialActivities?: import("./social-activity.js").SocialActivity[];
  /** Derived from feature authority on hydration; never an independently editable booking. */
  reservations?: import("./agenda-reservation.js").AgendaReservation[];
  /** One line about an ordinary day for them, here. */
  routineSummary: string;
  /** The village's repeating exact-time day when the Engine has no weekly schedule. */
  day: { startMinute: number; endMinute: number; venueId: string; zoneId?: string; activity: string }[];
  /** Villages' own complete weekly plan, independent of Marinara schedules. */
  week?: Record<string, VillageAgendaBlock[]>;
  /** The day already in progress never changes when a week is rewritten. */
  activeDay?: { dateKey: string; weekday: string; blocks: VillageAgendaBlock[]; scheduleInformed: boolean };
  /** Failed generation keeps the owned routine; only deliberate retry can spend again. */
  personalizationPending?: boolean;
  /** Latest actionable generation failure; empty while work is queued or successful. */
  personalizationFailure?: string;
  /** Display-only date of the latest personalization attempt. */
  personalizationAttemptDate?: string;
  /** Display-only, Read by nothing. */
  generatedAt: string;
};

export type VillageAgendaBlock = {
  essential?: boolean;
  commitmentId?: string;
  flexible?: boolean;
  startMinute: number;
  endMinute: number;
  venueId: string;
  zoneId?: string;
  activity: string;
  /** The original schedule slot, when this block was informed by one. */
};
/** Calendar label for one Agenda day. */
export type VillageDayView = {
  /** The Engine's weekday name, one of `VILLAGE_WEEKDAYS`. */
  weekday: string;
  /** The village's own calendar date for this occurrence, e.g. "12 September". */
  dateLabel: string;
  /** Whether this is the day the listing was built on. Exactly one entry has it. */
  isToday: boolean;
};

/** One library card the village has adopted. */
export type VillageVillager = {
  incarnation: string;
  letterFontId: string;
  identityDescription?: import("../../../shared/contracts/resident-description.js").ResidentIdentityDescription & {
    initialGenerationComplete: boolean;
  };
  signature?: import("../../../shared/helpers/resident-signature.js").ResidentSignatureImage;
  admission: import("../../../shared/helpers/resident-admission.js").ResidentAdmission;
  wishes: VillageWish[];
  agendaGeneration?: string;
  characterId: string;
  /** Card prose captured at move-in; deliberately excludes the Engine-only first message. */
  cardSnapshot: VillageVillagerCardSnapshot;
  /** Approved village-owned art, independent of the source character's sprites. */
  sprite?: VillageResidentSprite | null;
  spriteManager?: SpriteManagerState | null;
  addedAt: string;
  /**
   * What they wish for, or null for a villager who has not been written for yet.
   *
   * Null is a normal state and not a broken one. A villager who moved in while
   * the model was unreachable, and every villager who was already living here
   * when agendas were introduced, sit at null until the village next writes. It
   * is also what "write this one again" does, so the null case is the same code
   * path as the move-in case rather than a second one.
   *
   * A card that has been deleted from the library leaves an EMPTY agenda behind
   * rather than a null one: the village cannot ask a question about a character
   * it can no longer see, and a null that could never be filled would be
   * retried on every part of every day forever.
   */
  agenda: VillageAgenda | null;
  scheduleInfluence?: import("../rules/owned-routine.js").ScheduleInfluence;
};

export type VillageResidentSprite = {
  assetId: string;
  defaultExpressionId?: string;
  expressions: Array<{
    view: "front" | "side";
    label: string;
    filename: string;
    assetId: string;
    expressionId: string;
    spriteName?: string;
    name: string;
  }>;
  framing: { mode: "full" | "half" };
};

export type VillageVillagerCardSnapshot = {
  id: string;
  revision: number;
  sourceStatus: "available" | "missing";
  name: string;
  comment: string;
  summary: string;
  tags: string[];
  systemPrompt: string;
  /** Optional for snapshots captured before authored post-history instructions. */
  postHistoryInstructions?: string;
  description: string;
  personality: string;
  scenario: string;
  backstory: string;
  appearance: string;
  exampleDialogue: string;
  /** Absent only on snapshots captured before card colors were supported. */
  nameColor?: string;
  dialogueColor?: string;
  capturedAt: string;
};

export type VillageVillagerRefreshPreview = {
  characterId: string;
  current: VillageVillagerCardSnapshot;
  proposed: VillageVillagerCardSnapshot | null;
  sourceAvailable: boolean;
  changed: boolean;
};

/**
 * The picture a place is drawn with.
 *
 * A reference rather than the bytes, which is the entire point of the shape.
 * The picture itself lives in the Engine's Global Gallery, where the player can
 * find it, tag it, file it and delete it with the same tools they use on every
 * other image the app has made. A village record that carried its own copy
 * would be a second gallery only this package can see, and its size would grow
 * by one picture per place — for a picture the Engine already knows how to
 * serve, cache and clean up.
 *
 * `ref` is the durable half and is the exact string the Engine scans package
 * documents for, so a picture a village is still using cannot be deleted out
 * from under it and a deleted picture cannot leave the village pointing at
 * nothing. `url` is the display half and is the gallery's own, not something
 * invented here. `id` rides along so a re-upload of the same picture is
 * distinguishable from the picture itself without comparing URLs.
 */
export type VillageVenueImage = {
  lore?: import("../../../shared/contracts/lore.js").LoreUse[];
  /** `global-gallery:<id>` — the reference the Engine guards the file by. */
  ref: string;
  /** Where the tab fetches it from. The gallery's own URL. */
  url: string;
  /** The gallery record's own id. */
  id: string;
};

/**
 * A place in the village. The name is the noun the village contributes; the
 * note says what happens there, which is what a character's own verb gets
 * translated into.
 *
 * One record for every place there is, and that is the point rather than a
 * tidiness: a house is somewhere the player and the villagers can be, and there
 * is nothing a house needs that a shop does not. Two records would mean two
 * readers for every question — where is this, can I walk into it, what is it
 * called — and two answers to one question is how a pin on the map stops
 * agreeing with the prompt. What a place IS is `building`; where it stands is
 * `x`/`y`; who is in it is `characterId`; and a place with none of those set is
 * simply somewhere the village knows about and has not drawn yet.
 *
 * A home is a place with `isPlayerHome` or a `characterId` — see `routineVenues`,
 * which is the one place that distinction is drawn, because a home is where
 * somebody is when nothing has sent them anywhere and is therefore never one of
 * the places a villager's week is translated against.
 */
/** A durable place where the player or a villager can literally be. */
export type VillageVenueClass = "residence" | "workplace" | "community" | "other";

/** One class contributes one enterable scene. The venue remains one map place. */
export type ZonePicture = {
  base: VillageVenueImage | null;
  reference?: VillageVenueImage;
  referenceAppliedId?: string;
  baseline?: string;
  context?: string;
  attempted?: string;
  claim?: string;
  removed?: boolean;
  failed?: boolean;
  dirty?: boolean;
  daylight?: boolean;
  night?: { sourceId: string; image: VillageVenueImage };
  operation?: "update" | "replace" | "night";
  problem?: string;
  lastAutomaticAt?: string;
};
export type VillageVenueSpace = {
  picture?: ZonePicture;
  dayNight?: boolean;
  dayNightManual?: boolean;
  freezePicture?: boolean;
  pictureRevision?: number;
  connectedTo?: string[];
  id: string;
  venueClass: VillageVenueClass;
  /** Known authored constraints, separate from the prepared interior. */
  roomSpecification?: string;
  description: string;
  image: VillageVenueImage | null;
  state: import("../../../shared/contracts/place-continuity.js").PlaceContinuity;
};

export type VillageZoneKind = "exterior" | "public" | "shared-residence" | "private-residence" | "staff" | "restricted";
export type PrivateSpacePreparation = {
  lore?: import("../../../shared/contracts/lore.js").LoreUse[];
  status: "pending" | "ready" | "failed";
  mode?: "renovation";
  error?: string;
  /** Persisted before dispatch. A surviving claim requires deliberate retry. */
  claimId?: string;
  startedAt?: string;
  attempt?: number;
};
export type VillageVenueZone = VillageVenueSpace & {
  access?: import("../../../shared/helpers/venue-access.js").ZoneAccessPolicy;
  accessView?: import("../../../shared/helpers/venue-access.js").ZoneAccessView;
  purpose?: string;
  controllerIds?: string[];
  preparation?: PrivateSpacePreparation;
  closed?: boolean;
  name: string;
  kind: VillageZoneKind;
  ownerId?: string;
  seen?: boolean;
  /** Authored or last observed appearance; independent of visit history. */
  observed?: ZoneObservation;
  initialImageAttemptedAt?: string;
};
export type ZoneObservation = {
  context: string;
  name: string;
  description: string;
  purpose?: string;
  roomSpecification?: string;
  form?: string;
  state: VillageVenueSpace["state"];
  image: VillageVenueImage | null;
  dayNight?: boolean;
  daylight?: boolean;
  night?: ZonePicture["night"];
  pictureContext?: string;
};
export type VillageZoneDraft = { preserveDescription?: boolean } & Pick<
  VillageVenueZone,
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

export type VillagePrivateSpace = VillageVenueSpace & {
  preparation?: PrivateSpacePreparation;
  ownerId: string;
  /** A first-entry picture is attempted once; later drawing is player controlled. */
  initialImageAttemptedAt?: string;
};

/** Physical state belongs to its Zones. */
export type VillageVenue = {
  discovered?: boolean;
  zoneLayout?: import("../../../shared/helpers/zone-layout.js").ZoneLayout;
  venueType?: string;
  access?: import("../../../shared/helpers/venue-access.js").VenueAccessState;
  accessView?: import("../../../shared/helpers/venue-access.js").VenueAccessView;
  destinations?: Record<string, { home?: string; sleep?: string; work?: string }>;
  /** Explicit layouts never synthesize absent interiors. */
  layoutVersion?: 1;
  imageContext?: { useAssignedVillagerContext: boolean; useVisualLore: boolean };
  /** Stable within one village; every literal location reference uses this id. */
  id: string;
  /** Only a completed project may expose this venue's interior and capabilities. */
  buildProjectId?: string;
  constructionStatus?: "worksite" | "complete";
  name: string;
  /** The literal form of this unique place, such as sleeping pod or converted diner. */
  form?: string;
  /** One or two mechanical roles. There is no shared venue-type catalogue. */
  classes?: VillageVenueClass[];
  spaces?: VillageVenueSpace[];
  zones?: VillageVenueZone[];
  archivedZones?: { zone: VillageVenueZone; archivedAt: string }[];
  /** Direct residence capacity, up to four people. */
  residenceCapacity?: number;
  /** The complete resident roster. The older occupancy field remains a read projection. */
  residentIds?: string[];
  /** The approach is distinct from both shared and private Residence state. */
  exteriorState?: VillageVenueSpace["state"];
  privateSpaces?: VillagePrivateSpace[];
  playerSeenShared?: boolean;
  playerSeenPublic?: boolean;
  playerSeenPrivateIds?: string[];
  archivedPrivateSpaces?: { ownerId: string; archivedAt: string; space: VillagePrivateSpace }[];
  /** Player-approved exterior description. */
  description: string;
  category: string;
  /** Presentation data is separate from physical venue state. */
  presentation: {
    mapId: string;
    image: VillageVenueImage | null;
    x: number | null;
    y: number | null;
  };
  /** A venue may house the player or one villager, but never both. */
  occupancy: {
    playerHome: boolean;
    residentCharacterId: string | null;
    homeKind: HomeBuildingKind | null;
  };
  /** Future job integrations can add capabilities without inventing locations. */
  capabilities: string[];
  /** Assigned workers retain their existing access and activity roles. */
  workerIds?: string[];
  /** Durable physical state visible to the village by default. */
  state: import("../../../shared/contracts/place-continuity.js").PlaceContinuity;
};

/** A committed physical change and its evidence, attached to a Venue. */
export type VillageVenueEvent = {
  id: string;
  venueId: string;
  venueName: string;
  zoneId?: string;
  text: string;
  at: string;
  actionReceipt?: import("../../../shared/contracts/place-continuity.js").PlaceUpdate & {
    submissionId: string;
    happened: boolean;
    narration: string;
    witnessIds?: string[];
    after: import("../../../shared/contracts/place-continuity.js").PlaceAfter;
  };
};

/** Coordinates remain fractions of the town map, never pixels. */
export type VillageVenuePosition = {
  x: number | null;
  y: number | null;
};

/**
 * The old flat fields intentionally do not exist here. Callers must choose the
 * explicit presentation, occupancy, capability, or state boundary they need.
 */
export type VillageVenueDraft = {
  name: string;
  classes: VillageVenueClass[];
  description: string;
  category: string;
  position: VillageVenuePosition & { mapId?: string };
  occupancy: VillageVenue["occupancy"];
  capabilities: string[];
  state: VillageVenue["state"];
};

/** A home is now an occupancy fact on a venue, never a second place system. */
export type VillageResidence = {
  agreement?: import("../../../shared/contracts/village.js").ResidenceAgreement;
  holdReason?: string;
  proposedPrivateZoneId?: string;
  venueId: string;
  characterId: string;
  status: "current" | "pending" | "moving";
  proposedVenueId: string;
  requestedAt: string;
  /** The villager can request a move, or answer the player's request. */
  requestedBy?: "player" | "villager";
  villagerDecision?: "pending" | "approved" | "denied";
  approvedAt?: string;
  completesAt?: string;
};

/**
 * Someone the village's memory is about.
 *
 * Name AND id, unlike every other name the village holds, because the two do
 * different jobs and neither can be derived from the other later: the id is
 * what a private memory is matched against when a villager's prompt is built,
 * and the name is what the line says when the card behind it has been deleted.
 * An actor with a name but no id is kept rather than dropped — a deleted card
 * costs the player the join, not the memory.
 */
export type VillageBackgroundPace = "off" | "quiet" | "balanced" | "lively";

export type ResidentPlanningOpportunity = {
  id: string;
  kind: "encounter" | "routine" | "world";
  startsAt: string;
  endsAt: string;
  actorIds: string[];
  venueId: string;
  zoneId?: string;
  facts: string[];
};

export type VillageProjectPhase = "planning" | "working" | "paused" | "complete" | "cancelled";
export type VillageProjectChange = {
  form?: string;
  exteriorDescription?: string;
  classes?: VillageVenueClass[];
  capacity?: number;
  zones?: VillageZoneDraft[];
  detail: string;
};
export type VillageProjectLifecycle = {
  phase: VillageProjectPhase;
  revision: number;
  targetVenueId: string;
  change: VillageProjectChange | null;
  affectedIds: string[];
  approvals: {
    residentId: string;
    source: "conversation";
    evidenceId: string;
    scope: string;
    at: string;
  }[];
  candidates: { residentId: string; evidenceId: string; scope: string; at: string }[];
  builderId: string;
  spokenProofs: {
    lineId: string;
    sessionId: string;
    submissionId: string;
    speakerId: string;
    venueId: string;
    zoneId?: string;
    quote: string;
    at: string;
    grade?: "cited-interpretation";
    interpretationVersion?: number;
    citations?: { lineId: string; quote: string }[];
  }[];
  evidenceIds: string[];
  commandReceipts: Record<string, string>;
  baseDesignHash: string;
  changedZoneIds: string[];
  workOrder: {
    startsAt: string;
    completesAt: string;
    pausedAt: string;
    remainingMs: number;
    focus?: import("./agenda-reservation.js").ProjectFocus;
  } | null;
  blockedReason: string;
  completedAt: string;
};

export type VillageProject = {
  establishment?: import("../../../shared/contracts/places.js").Establishment;
  place?: VillageVenue;
  plan?: {
    capacity: number;
    form: string;
    venueType: string;
    exteriorDescription: string;
    imageContext?: { useAssignedVillagerContext: boolean; useVisualLore: boolean };
    layoutVersion: 1;
    layout: "exterior" | "common" | "private" | "both";
    spaces: VillageVenueZone[];
    privateSpaces: VillageVenueZone[];
    exteriorImage: VillageVenueImage | null;
  };

  opening?: {
    established: boolean;
    provenance: string;
    work: string;
    firstUse: string;
  };
  id: string;
  title: string;
  venueId: string;
  participantIds: string[];
  progress: number;
  status: VillageProjectPhase;
  updatedAt: string;
  kind: "new-venue" | "renovation" | "establishment";
  venueDraft?: {
    name: string;
    classes: VillageVenueClass[];
    description: string;
    position: { mapId?: string; x: number | null; y: number | null };
  };
  requesterCharacterId?: string;
  lifecycle?: VillageProjectLifecycle;
};

export type VillagePendingDecision = {
  id: string;
  kind: "residence" | "project" | "venue" | "departure" | "other";
  title: string;
  detail: string;
  proposedAt: string;
  sourceOpportunityId: string;
  status?: "pending" | "approved" | "denied" | "countered";
  venueDraft?: VillageVenueDraft;
  venueId?: string;
  requesterCharacterId?: string;
  requesterName?: string;
  requestQuote?: string;
  source?: "chat" | "background";
  sourceKey?: string;
};

export const RETURN_CATCHUP_HISTORY_LIMIT = 20;
export type ReturnCatchupBatch = {
  id: string;
  status: "queued" | "running" | "failed" | "recovering" | "completed" | "cancelled";
  /** Each batch is bounded by its captured calendar day and allowance. */
  budgetDate: string;
  opportunityLimit: number;
  from?: string;
  until?: string;
  reason?: string;
  opportunities?: ResidentPlanningOpportunity[];
  records?: {
    opportunityId: string;
    status: "pending" | "queued" | "settling" | "settled" | "rejected" | "held";
    heldStage?: "queued" | "settling";
    automaticRetryUsed?: true;
    outcome?: unknown;
    error?: string;
  }[];
  /** Labels captured at departure, used only by the private debug account. */
  labels?: { residents: Record<string, string>; venues: Record<string, string>; zones: Record<string, string> };
};
export type ReturnCatchupCapture = {
  at: string;
  memoryRevision: number;
  world: Pick<
    VillageState,
    | "seed"
    | "setupAt"
    | "foundedAt"
    | "timeZone"
    | "name"
    | "setting"
    | "worldName"
    | "worldRules"
    | "narrative"
    | "narrativeConsequence"
    | "eventAttempts"
    | "playerBackground"
    | "playerPersonaId"
    | "playerPersonaName"
    | "playerPersonaIdentity"
    | "playerPersonaMissing"
    | "villagers"
    | "venues"
    | "residences"
    | "projects"
    | "relationshipContext"
    | "opening"
  >;
};

export type VillageState = {
  worldPlaces: import("./places.js").PlaceRegistry;
  narrative?: import("./narrative-model.js").NarrativeState;
  narrativeConsequence?: import("../../../shared/contracts/village.js").VillageNarrativeConsequence;
  continuity: import("./continuity-model.js").ContinuityCollection;
  episodes: import("./episode-model.js").EpisodeCollection;
  startingHistory: import("./starting-history-model.js").StartingHistoryState;
  socialContractVersion: 2;
  socialMailOutbox?: import("./social-mail.js").WorldSocialMailOutbox[];
  socialPublications?: Record<string, true>;
  eventAttempts?: import("../rules/event-attempts.js").EventAttemptLedger;
  /** Current work remains separate from the recent, terminal debug history. */
  returnCatchup?: {
    capture?: ReturnCatchupCapture;
    batch?: ReturnCatchupBatch;
    history?: ReturnCatchupBatch[];
  };
  opening?: import("../rules/opening-project.js").OpeningRecord;
  semanticRequestReceipts?: Record<string, string>;
  semanticContinuations?: Record<string, import("./exchange-model.js").ExchangeDomain[]>;

  /** Prepared residents awaiting their one-time, finite post-reset Wish attempt. */
  exchangeReceipts: Record<string, import("./wish-check-model.js").ExchangeEffectReceipt>;
  noticeSequence: number;
  dismissedNoticeIds: string[];
  relationshipContext?: import("./relationship-types.js").RelationshipState;
  socialOutbox?: import("./social-outbox-model.js").WorldSocialOutboxEntry[];
  backgroundReceipts: Record<string, string>;
  /** Private expiry holds owned by unfinished Scenes or their retained final effects. */
  version: 18;
  /** Shared evidence engine used by Wishes. */
  progressEngineVersion: 1;
  name: string;
  /** Per-village writing choices for live Scenes. */
  narrationStyle: VillageNarrationStyle;
  characterSpeechColors: boolean;
  sendOnEnter: boolean;
  spriteCardFlipEnabled: boolean;
  spriteVariantsEnabled: boolean;
  /**
   * The one line of world the player wrote, e.g. "a rain-soaked harbour town".
   * Empty means the village has no place yet, and the setting and venue blocks
   * in the prompt render nothing at all.
   */
  setting: string;
  /** The player's reason for starting this village, kept apart from its visual setting. */
  worldRules: string;
  worldName: string;
  communityVenueId: string;
  /** Optional Founding role. */
  playerBackground: VillagePlayerBackground | null;
  /** Engine lorebook links; entry content is always read live. */
  selectedLorebookIds: string[];
  sceneryArtStyle: string;
  sceneryStyleProfileId?: string | null;
  automaticZonePictures?: boolean;
  zonePictureBudget?: { startedAt: string; used: number };
  zonePictureEpoch?: number;
  personalizeVenueImagesByDefault: boolean;
  useVisualLoreByDefault: boolean;
  loreTokenBudget: number;
  /**
   * Every place the village has: the houses people live in, the player's own
   * home, and everywhere anyone goes.
   *
   * One list rather than two. There used to be a `homes` array beside this one,
   * and the two were the same thing with different fields — which is what made
   * "can I walk into it?" a question with two answers. A house answers yes, and
   * so does a mill.
   */
  venues: VillageVenue[];
  /** Stable building kinds have labels the player can adapt to the village's world. */
  homeBuildingNames: Record<HomeBuildingKind, string>;
  /** Physical-change receipts retain the Venue name even after deletion. */
  venueEvents: VillageVenueEvent[];
  /** Exact completed visit transcript retention. Missing older settings mean forever. */
  visitRetention: { mode: "forever" | "count" | "days"; value: number };
  /** One-time archive migration marker, so a player-deleted memory stays deleted. */
  /** A pending residence move is explicit and requires player approval. */
  residences: VillageResidence[];
  /**
   * When the village finished being set up by the founding flow. Empty means
   * "not founded yet", which is what makes the tab open the wizard.
   *
   * Deliberately NOT called `foundedAt`: that field is the derived clock's
   * origin and is stamped by the first write of any kind, including one the
   * player never made deliberately. This one is stamped only by the setup
   * route, so it answers "did the player finish setting this village up?" — a
   * different question with a different answer.
   */
  setupAt: string;
  /** Optional founding work and its explicit retries; play readiness is derived separately. */
  foundingPreparation?: {
    status: "pending" | "failed" | "ready";
    completedIds: string[];
    tasksVersion?: 1;
    tasks?: import("../../../shared/contracts/founding-tasks.js").FoundingResidentTasks;
    retryActions?: string[];
    selectedTasks?: string[];
    currentTask?: "routine" | "wish";
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
  /**
   * When the village began keeping its own time. Empty until the first write,
   * because merely opening the tab must not create a document.
   */
  foundedAt: string;
  /** Weather flavour. Random at founding so two villages of the same age differ. */
  seed: string;
  /** Durable high-water mark for deterministic reconciliation. */
  simulatedThrough: string;
  /** Device timezone observed by the last reconciliation. */
  lastKnownTimeZone: string;
  /** Calendar authority selected once at founding. */
  timeZone: string;
  clock: import("../../../shared/contracts/clock.js").VillageClockRecord | null;
  /** Optional resident planning and Wish pace; deterministic life always advances. */
  backgroundPace: VillageBackgroundPace;
  /** Last local calendar day on which resident planning committed. */
  lastPlanningDate: string;
  planningUsage: { dateKey: string; count: number };
  processedActionIds: string[];
  projects: VillageProject[];
  /** Versioned evidence-backed task records; empty for villages that have not adopted the Progress Engine. */
  wishFollowing?: Record<string, boolean>;
  progressTasks: ProgressTask[];
  pendingDecisions: VillagePendingDecision[];
  villagers: VillageVillager[];
  /** Writing styles retained when residents leave, keyed by character ID. */
  formerLetterFonts?: Record<string, string>;
  /**
   * Who the player is, as the prompt layer consumes it: the resolved pair.
   *
   * These two stopped being a box the player types into. A village no longer
   * keeps its own answer to "who are you" — it keeps a Persona, and these are
   * filled from that Persona's cached copy at the moment the village writes it.
   * They are empty together, which is a village with nothing linked, and the
   * renderer answers an empty pair with "the player". Nothing persists them, so
   * a hand-edited record cannot smuggle a name past the Persona's own.
   */
  playerName: string;
  playerDescription: string;
  /**
   * The Persona the player chose as who they are here, or "" for none.
   *
   * An id, and the only part of the identity that is a link rather than a copy.
   * The three cached fields below exist so that a chat turn never has to read the
   * Engine's Persona library — that read used to happen on every single turn —
   * and so that a Persona deleted out of the library costs the player its prose
   * and not its name. The copy is refreshed by `refreshPlayerPersona`, which the
   * tab asks for when it opens and when settings open, never on a chat send.
   */
  playerPersonaId: string;
  /** The Persona's cached name. Empty only when nothing is linked. */
  playerPersonaName: string;
  /** The Persona's cached prose, as prompt text. Empty when it says nothing. */
  playerPersonaIdentity: string;
  /**
   * True when the id above no longer resolves in the Engine's library.
   *
   * The cached name and prose are deliberately KEPT when this flips true: the
   * villagers go on believing what they were told about the player, which is
   * what the person they have been chatting with all week has earned. Only the
   * id is broken, and only the tab has to say so.
   */
  playerPersonaMissing: boolean;
  maps: VillageMap[];
};

/**
 * How a picture that is not the map's shape is made to fit it, named after the
 * CSS `object-fit` keyword it is drawn with so the tab renders the choice
 * instead of translating it.
 */
export type TownMapFit = "cover" | "stretch" | "contain";

/**
 * Where the map frame is looking.
 *
 * The frame is a fixed shape and a picture the player picked is very unlikely
 * to be that shape, so the picture is not resized to fit — the frame is moved
 * over the picture instead. The framing is STORED rather than baked in: the
 * picture itself is kept whole, so a crop can be redone later without going
 * back to the file, and a village backup carries four numbers rather than a
 * second copy of the image.
 */
export type VillageTownMapView = {
  fit: TownMapFit;
  /** 0..100, left to right: the point of the picture held still in the frame. */
  focusX: number;
  /** 0..100, top to bottom. */
  focusY: number;
  /** How far the picture is magnified inside the frame. Never below 1. */
  zoom: number;
};
/** Current location and activity shown for a resident. */
export type VillagePlaceView = {
  id: string;
  zoneId?: string;
  zoneName?: string;
  name: string;
  /** Null until somebody gives that place a picture. A place with no picture is ordinary. */
  image: VillageVenueImage | null;
  /**
   * Whether this place is one of the village's own venues or somebody's home.
   *
   * Carried rather than inferred from the id, because the two are drawn
   * differently and only the server can see the ids they came from. A venue is a
   * destination — somewhere a villager goes and the player can point at — and a
   * home is where somebody is when they are nowhere else, which is the default
   * every untranslated hour lands on. The label a reader sees is chosen in the
   * tab from this, so the wording lives beside the drawing rather than here.
   *
   * Both are places, and both can be walked into; this says which of the two
   * SENTENCES to print, not which of two kinds of thing this is.
   */
  kind: "venue" | "home";
};

export type VillageChatRole = "user" | "assistant";

export type VillageChatMessage = {
  role: VillageChatRole;
  content: string;
  at: string;
  id?: string;
  /**
   * Who said it, when it was not the villager whose transcript this is.
   *
   * A transcript is one villager and the player, so `role` is enough to say who
   * a line belongs to and this is absent on every line already stored. A ROOM is
   * three or more people, and the same room is written into every one of their
   * transcripts — so a line of Anton's has to keep saying it was Anton's when it
   * is read out of Mari's copy, or the village would hand Mari her own words
   * back in a neighbour's voice.
   *
   * A character id, and never `""`: the player's own lines are already `role:
   * "user"`, and an id that meant "not this villager" as well as "not a villager"
   * would be two answers spelled the same way.
   */
  speakerId?: string;
  /**
   * What that speaker is called, for the prompts that print a line as prose.
   *
   * Carried rather than looked up, for the same reason a room line carries its
   * name: a villager who has since been evicted from the village still has to be
   * nameable in a conversation they were part of, and a transcript is read on
   * turns where nothing has gone to the library to ask.
   */
  speakerName?: string;
};

/** A card the picker offers, flattened for the tab. */
export type VillageCatalogEntry = {
  id: string;
  name: string;
  comment: string;
  summary: string;
  tags: string[];
  inVillage: boolean;
};

/**
 * One Persona, as the village reads it.
 *
 * `identity` is the whole of what the Persona says about the player, already
 * assembled into the text a villager is handed: the description, then whatever
 * else the Persona carries. The catalog sends only names, portraits, and blurbs;
 * the Founding preview reads the chosen Persona's authored fields separately.
 *
 * The picture does travel, and costs nothing to read: the Engine hands this row
 * over already decoded, so the avatar is sitting in the same object the name came
 * out of. Taking it here is what lets the picker draw a face without one request
 * per Persona.
 */
export type VillagePersona = {
  id: string;
  /** What the villagers call them: the Conversation display name when set, else the Persona's name. */
  name: string;
  /** One line for the picker. */
  summary: string;
  /** Authored fields for the selected Persona preview. */
  description: string;
  appearance: string;
  personality: string;
  backstory: string;
  /** Everything the Persona says about itself, as prompt text. Empty when it says nothing. */
  identity: string;
  /** True for the Persona the Engine itself has selected, which the picker offers first. */
  isActive: boolean;
  /** The Persona's portrait, or null when it has none. */
  avatarPath: string | null;
  /** The portrait's framing, in the Engine's own shape, or null. Passed through untouched. */
  avatarCrop: unknown;
};

/** A Persona as the picker shows it: enough to choose by, and nothing else. */
export type VillagePersonaEntry = Pick<
  VillagePersona,
  "id" | "name" | "summary" | "isActive" | "avatarPath" | "avatarCrop"
>;

/** Structured fields read only for the selected Persona. */
export type VillagePersonaPreview = Pick<
  VillagePersona,
  "id" | "name" | "description" | "appearance" | "personality" | "backstory" | "avatarPath" | "avatarCrop"
>;

/** Community framing chosen at founding, separate from Persona identity. */
export type VillagePlayerBackground = string;

/**
 * Who the player is: the Persona's cached name and prose, read straight off the
 * village record.
 *
 * Nothing is fetched to build this, and that is the whole point of the cache
 * behind it — this is read on every chat turn, and a version that went to the
 * Engine's Persona library each time put a library read in front of every
 * message the player sent.
 */
export type VillagePlayerIdentity = {
  /** The name the villagers use. Empty means the village says "the player". */
  name: string;
  description: string;
  /** The Persona this came from, or "" when none is linked. */
  personaId: string;
  /** True when the id is linked but no longer resolves. The name and prose above survive it. */
  missing: boolean;
};

/** A villager as the tab renders it: live card fields where they exist, cached name otherwise. */
export type VillageVillagerView = {
  letterFontId?: string;
  identityDescription?: import("../../../shared/contracts/resident-description.js").ResidentIdentityDescription;
  signature?: import("../../../shared/helpers/resident-signature.js").ResidentSignatureImage;
  signatureFallback?: import("../../../shared/helpers/resident-signature.js").ResidentSignature;
  characterId: string;
  nameColor: string;
  dialogueColor: string;
  sprite:
    | (VillageResidentSprite & {
        images: Array<{
          view: "front" | "side";
          label: string;
          url: string;
          expressionId?: string;
          isDefault?: boolean;
        }>;
      })
    | null;
  name: string;
  summary: string;
  tags: string[];
  /** True when the card behind this villager is gone from the library. */
  missing: boolean;
  /**
   * Where this villager is standing right now, or null when the village cannot
   * place them.
   *
   * The same join the drawer's own plate draws, read off the same one schedule
   * read the poll already performs, so the pin on the map and the name over the
   * conversation are one answer rather than two that agree by luck. Null is
   * ordinary: a villager with no translated week and no home on the map has
   * nowhere to be pointed at, and draws no pin.
   *
   * The position that goes with it is NOT carried here. The tab already holds
   * every place and its coordinates in `settings.venues`, so the pin is drawn by
   * looking this up in a list it has — see `MapPin` in the tab.
   */
  place: VillagePlaceView | null;
};

/**
 * Everything the tab needs to edit the village's prompt behaviour: the value of
 * the prompt box, the shipped default to compare against and reset to, and the
 * limits and macro list so the tab never has to restate a number the server
 * owns.
 *
 * The box and its own default travel together because they are only meaningful
 * together: a restore button whose target belonged to another box is how a player
 * loses a paragraph of their own writing.
 *
 * Venue writing style lives on the village record and travels on `/narration`.
 * This snapshot view stays focused on the village's world context and knowledge.
 */
export type VillageSettingsView = VillageSettings;

/**
 * The village as the tab draws it. Every field here except `name` and `setting`
 * is derived at read time and never stored, so the moment cannot drift out of
 * step with the clock.
 */
export type VillageMomentView = {
  name: string;
  setting: string;
  /** e.g. "11 September". */
  dateLabel: string;
  /** Real weekday name — also the key a native character schedule is looked up by. */
  weekday: string;
  season: string;
  /** Atmospheric day phase, never a simulation or persistence key. */
  dayPhase: string;
  instant: string;
  localTime: string;
  minuteOfDay: number;
  timeZone: string;
  hour: number;
  minute: number;
  weather: string;
  /** Whole days since the village was founded; 0 on the founding day. */
  dayIndex: number;
  nextTransitionAt: string;
};

type ClientVisibleSnapshot<T extends import("../../../shared/contracts/village.js").VillageSnapshot> = T;

export type VillageSnapshot = ClientVisibleSnapshot<{
  worldScope: string;
  mailboxUnread?: boolean;
  sceneChanges?: { sceneId: string; revision: string };
  sceneVenue?: { sceneId: string; venue: VillageSettingsView["venues"][number] };
  opening?: import("../../../shared/contracts/opening.js").OpeningView;
  clock?: import("../../../shared/contracts/clock.js").VillageClockView;
  relationshipStartingPending?: boolean;
  backgroundWork: import("./background-model.js").BackgroundSummary[];
  status: "ready";
  progressEngineVersion: 1;
  foundingPreparation:
    (NonNullable<VillageState["foundingPreparation"]> & { canPlay: boolean; startingHistoryReady: boolean }) | null;
  village: VillageMomentView;
  venueRequests: VillagePendingDecision[];
  projects: import("../../../shared/contracts/village.js").BuildProject[];
  residences: VillageResidence[];
  /** Newest first, so the window on the map opens on what just happened. */
  villagers: VillageVillagerView[];
  /**
   * True once the village has been founded, which is what tells the tab to draw
   * the village rather than the setup wizard. Derived, never stored directly: a
   * village that already has places or villagers counts as founded, so an
   * install made before this field existed is not dropped into a wizard.
   */
  isFounded: boolean;
  settings: VillageSettingsView;
}>;
/** Current routine and optional schedule-influence controls. */
export type VillageAgendaView = {
  canInterpretSchedule?: boolean;
  effectiveDays?: Record<string, VillageAgendaBlock[]>;
  characterId: string;
  name: string;
  /**
   * Whether this villager's card is gone from the library.
   *
   * Always false when the library could not be read at all — see
   * `weekUnreadable`. "Missing" is a claim about the player's cards, and a
   * reader that never saw them is not entitled to make it.
   */
  missing: boolean;
  /**
   * Whether the character library could not be read, so this villager's week is
   * UNKNOWN rather than absent.
   *
   * This field exists because the schedules listing used to have one way to say
   * "there is nothing here for this villager", and it said it in the player's own
   * terms: your card has no week on it, go and set one on the Engine's schedule
   * screen. That is the right sentence for a card that genuinely has no week, and
   * it was being shown to a player whose cards were fully scheduled — because the
   * reader was calling a parser the runtime host does not offer and catching its
   * own TypeError as "this card has no schedule". A week that could not be read
   * and a week that does not exist need different sentences, because only one of
   * them is the player's to fix.
   */
  weekUnreadable: boolean;
  addedAt: string;
  agenda: VillageAgenda | null;
  scheduleInfluence: import("../rules/owned-routine.js").ScheduleInfluence;
  nativeSchedule: {
    weekStart: string;
    days: Record<string, { time: string; activity: string }[]>;
  } | null;
  /**
   * The Engine's whole week in order from today, each day of it joined to the
   * stored translation.
   *
   * Always seven entries, always in order, always with today first — a listing
   * whose length depends on whether the Engine has written a week is a listing
   * the tab has to reason about, and the question this answers is "what does their
   * week look like from here". Seven rather than a few days ahead because the
   * Engine's week is a pattern rather than a calendar: a window was this listing
   * deciding which of somebody's days were worth printing, and a card whose only
   * hours were at the weekend then read as an empty card. A villager with no week
   * at all gets seven days with no blocks in them, which the tab draws as seven
   * empty days rather than as anything missing: there is nothing to show, and
   * showing nothing is the honest render of that.
   */
  days: VillageDayView[];
};

export type VillageMap = {
  id: string;
  name: string;
  artwork: VillageVenueImage;
  width: number;
  height: number;
  view: VillageTownMapView;
  revision: number;
};
