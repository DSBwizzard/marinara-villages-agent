import type { StagingCue } from "../../../shared/helpers/scene-staging.js";
import type { SpeechDelivery, SpeechPresentation } from "../../../shared/helpers/scene-speech.js";
import type { ProjectSpeechContext, ProjectSpeechProposal } from "../rules/project-interpretation.js";
import type { ResponseDiagnostics } from "../rules/response-diagnostics.js";
import type { ContactIntent, ContactMove, ContactRelay, DoorwayContact } from "../rules/venue-contact.js";
import type { VenueSceneChange } from "../rules/venue-scene-state.js";
import type { ExchangeProcessing } from "./exchange-model.js";
import type { LiveExchangeProposals } from "./memory-model.js";
import type { VenueOperation, VenueRequestMetrics } from "./operation-model.js";
import type { VenueActionResult } from "./venue-action-model.js";
import type { WishProposal } from "./wish-check-model.js";
import type { WishCriteria } from "./wish-interpretation-model.js";
import type { VillageVenueClass } from "./world.js";
import type { AttentionPlan } from "../rules/scene-attention.js";

export type VenueLine = {
  speechSource?: { version: 3; spans: import("../rules/player-speech-capture.js").SpeechSource[] };
  id: string;
  speakerId: string;
  name: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  heardBy: string[];
  /** Server-routed acoustic view without the accompanying visuals or private speech. */
  soundOnly?: { characterIds: string[]; player: boolean; text: string };
  zoneId?: string;
  viaDoorway?: boolean;
  /** Server-projected local cast after a validated movement in this line. */
  physicalIdsAfter?: string[];
  remoteDelivery?: "loud" | "device";
  contactHidden?: boolean;
  attentionEvidence?: boolean;
  contactReport?: boolean;
  kind?: "narration" | "dialogue" | "side" | "whisper";
  delivery?: SpeechDelivery;
  presentation?: SpeechPresentation;
  expression?: string;
  gazeAt?: string;
  staging?: StagingCue[];
  targetId?: string;
  asideFor?: string;
};
export type VenueParticipant = { characterId: string; name: string; doing: string };
export type SceneAttendance = {
  layout?: Pick<import("./world.js").VillageVenueZone, "id" | "kind" | "name" | "venueClass" | "connectedTo">[];
  capturedAt: string;
  occupants: (VenueParticipant & { zoneId: string })[];
};
export type VenueSubmission = {
  openingProcessedAt?: string;
  openingContext?: { stage: string; projectId: string; proposalFingerprint?: string; gatheringComplete?: true };
  openingSignal?: import("../rules/opening-project.js").OpeningSignal;
  residentActionReceipt?: import("../rules/resident-actions.js").ResidentActionReceipt;
  speechCapture?: { version: 3; status: "captured" | "silent" };
  effectFailures?: Partial<
    Record<
      import("./exchange-model.js").ExchangeDomain,
      { kind: "metadata" | "interpretation"; message: string; proposal?: unknown }
    >
  >;
  zoneEventsVersion?: 1;
  attention?: AttentionPlan;
  wishProposals?: WishProposal[];
  wishProposalError?: string;
  processing?: ExchangeProcessing;
  id: string;
  message: string;
  mode: "chat" | "ask" | "fulfill" | "act" | "leave" | "contact";
  contact?: ContactIntent;
  speechIdsAtTurn?: string[];
  contactEvidence?: { moves: ContactMove[]; relay: ContactRelay | null };
  targetId: string;
  areaAtTurn?: VenueScene["area"];
  zoneIdAtTurn?: string;
  privateOwnerIdAtTurn?: string;
  activeIdsAtTurn?: string[];
  activeIdsAfterTurn?: string[];
  replyLineIds?: string[];
  projectContexts?: ProjectSpeechContext[];
  projectSpeech?: ProjectSpeechProposal[];
  projectInterpretationVersion?: 1;
  wishInterpretationProof?: { fingerprint: string; criteria: WishCriteria; receiptIds: string[] };
  progressProcessedAt?: string;
  progressError?: string;
  verdict: { fulfilled: boolean; reason: string } | null;
  wishId: string;
  wishMemory: string;
  action?: VenueActionResult;
  actionReplyDone?: boolean;
  physicalOutcomeVersion?: 1;
  requestMode?: "act" | "fulfill";
  movement?: { operationId: string; originZoneId: string; destinationZoneId: string; transitionLineId: string };
  sceneChange?: VenueSceneChange;
  semanticPlayerMoves?: import("../rules/semantic-timeline.js").SemanticPlayerMove[];
  physicalContext?: { zoneId: string; witnessIds: string[]; segment: number };
  developmentChanges?: import("../rules/development-scene.js").SavedDevelopmentChange[];
  residenceSignal?: { kind: "request" | "decision"; characterId: string; venueId: string; approved?: boolean };
  renovationSignal?: { characterId: string; venueId: string; quote: string };
  venueRequestSignal?: {
    characterId: string;
    name: string;
    classes: VillageVenueClass[];
    quote: string;
    sourceLineId?: string;
  };
  /** Approved access interpretations saved with their exact witnessed reply; never sent to the client. */
  accessEvents?: SavedAccessEvent[];
  invitationSignal?: {
    accessOperationId?: string;
    /** Minted by Villages after interpretation and evidence validation, never by narration. */
    interpretationVersion?: 1;
    residentId: string;
    venueId: string;
    scope: "shared" | "private";
    zoneLabel?: string;
    privateSpaceId?: string;
    zoneId?: string;
    area?: VenueScene["area"];
    spaceClass?: VillageVenueClass;
    accompanies?: boolean;
    timing: "now" | "later";
    evidenceKind?: "speech" | "action";
    ownerId: string;
    quote: string;
    sourceLineId?: string;
    accessRevision?: number;
  };
  editApprovalSignal?: {
    proposalId: string;
    residentId: string;
    approved: boolean;
    quote: string;
    sourceLineId?: string;
  };
  turnMemories?: VenueMemory[];
  recollections?: VenueRecollection[];
  semanticReady?: boolean;
  semanticConclude?: boolean;
  semanticContinuedDomains?: import("./exchange-model.js").ExchangeDomain[];
  semanticProvenance?: import("./semantic-model.js").SemanticProvenance;
  liveProposals?: LiveExchangeProposals;
  wishContexts?: { actorId: string; wishId: string; fingerprint: string }[];
  requestMetrics?: VenueRequestMetrics;
  timing?: import("./operation-model.js").VenueTiming;
  interpretationHistory?: {
    at: string;
    domain: string;
    source: string;
    proposals: unknown;
    responseDiagnostics?: ResponseDiagnostics;
  }[];
  changeSequence?: number;
  recordEvents?: VenueRecordEvent[];
  at?: string;
};
export type VenueMemory = { characterId: string; text: string; lineIds?: string[] };
export type VenueRecollection = {
  relationshipOnly?: boolean;
  id: string;
  text: string;
  subjectCharacterIds: string[];
  knownByCharacterIds: string[];
  lineIds: string[];
};
export type VenueRecordEvent = {
  id: string;
  kind: "memory" | "wish" | "venue" | "request" | "project" | "relationship-up" | "relationship-down";
  text: string;
  wishUpdate?: { actorId?: string; wishId: string; state: "revealed" | "progress" | "fulfilled" };
  /** Player-visible saved details; formatting never makes a model request. */
  detail?: string;
};
export type VenueScene = {
  /** Private captured writing context; never part of a client projection. */
  continuity?: import("../rules/scene-continuity.js").SceneContinuity;
  openingGatheringId?: string;
  openingReader?: boolean;
  openingIntroductionResidentId?: string;
  semanticVersion?: 2;
  semanticIntent?: import("./semantic-model.js").SemanticIntent;
  spinoff?: import("./spinoff-model.js").VillageSpinoff;
  version: 1;
  processingVersion?: 1;
  changeSequence?: number;
  villageSeed?: string;
  sceneRevision: number;
  operation?: VenueOperation;
  /** Idempotent free navigation, separate from conversational turns. */
  pictureEvaluatedZoneIds?: string[];
  navigationReceipts?: { id: string; originZoneId: string; destinationZoneId: string; at: string }[];
  /** Operational receipts only: rejected inputs never become fictional submissions. */
  rejectedSubmissions?: {
    id: string;
    inputHash: string;
    sceneRevision: number;
    turnOutcome: import("../../../shared/contracts/scene-turn-outcome.js").SceneTurnOutcome;
  }[];
  generationReceipts?: {
    operationId: string;
    attemptId: string;
    stages: string[];
    outcome: "unknown";
    acknowledgedAt: string;
  }[];
  stagingVersion?: 1;
  id: string;
  placeId: string;
  placeName: string;
  spaceClass?: VillageVenueClass;
  zoneId?: string;
  legacyCast?: boolean;
  grantedZoneIds?: string[];
  enteredFromZoneId?: string;
  accessPreviousZones?: Record<string, string>;
  pendingAccessClaim?: string;
  dismissedZoneIds?: string[];
  pendingRoomQuestions?: string[];
  pendingProjectQuestions?: string[];
  zoneGrants?: { zoneId: string; controllerId: string; source?: "relationship" }[];
  privateSpaceId?: string;
  accompanying?: { characterId: string; zoneId: string }[];
  doorwayContacts?: DoorwayContact[];
  pendingAttention?: {
    intentKey?: string;
    id: string;
    message: string;
    revision: number;
    originZoneId: string;
    plan: AttentionPlan;
    choices: { id: string; label: string }[];
  };
  entryOffers?: { zoneId: string; label: string; controllerId: string; accompanies: boolean }[];
  /** Ephemeral prompt context; never stored or disclosed. */
  contactGeneration?: {
    zoneEvents?: boolean;
    attention?: AttentionPlan;
    acoustics?: boolean;
    venue?: import("./world.js").VillageVenue;
    replyAudiences?: Record<string, string[]>;
    instruction: string;
    localIds: string[];
    remoteIds: string[];
    /** Selected writers only; physical attendance and witnesses remain independent. */
    actorIds?: string[];
    delivery?: "voice" | "loud" | "device";
  };
  departedIds?: string[];
  /** Server-only destinations for validated forced departures, never another Scene's cast. */
  departureDestinations?: Record<string, { venueId: string; zoneId: string }>;
  area: "outside" | "shared" | "private" | "public";
  privateOwnerId: string;
  privateAccessOwnerId: string;
  startedAt: string;
  endedAt: string;
  lastActivityAt: string;
  clockShiftMs?: number;
  endReason: "player" | "scene" | "inactivity" | "debug" | "";
  memoryMode: "live";
  status: "opening" | "active" | "closing" | "closed";
  participants: VenueParticipant[];
  sceneAttendance?: SceneAttendance;
  activeIds: string[];
  lines: VenueLine[];
  heardHistory: { characterId: string; lineIds: string[] }[];
  submissions: VenueSubmission[];
  memories: VenueMemory[] | null;
  recap: string;
};
export type VenueSession = VenueScene;
export type ActiveVenue = { sessionId: string; placeId: string };
export type GreetingTrace = (stage: string, elapsedMs: number, detail?: string) => void;
export type VenueReplyFailureKind =
  | "invalid-json"
  | "invalid-segments"
  | "player-echo"
  | "repeated-question"
  | "residence-consent"
  | "construction-worksite"
  | "unsupported-physical-claim";
export type VenueReplyLine = {
  speechSource?: VenueLine["speechSource"];
  zoneId?: string;
  soundOnly?: VenueLine["soundOnly"];
  attentionEvidence?: boolean;
  role?: "user" | "assistant";
  evidenceId?: string;
  kind: NonNullable<VenueLine["kind"]>;
  delivery?: SpeechDelivery;
  presentation?: SpeechPresentation;
  speakerId: string;
  content: string;
  heardBy: string[];
  viaDoorway?: boolean;
  physicalIdsAfter?: string[];
  remoteDelivery?: "loud" | "device";
  contactHidden?: boolean;
  contactReport?: boolean;
  expression?: string;
  gazeAt?: string;
  staging?: StagingCue[];
  targetId?: string;
  anchorIndex?: number;
};
export type SavedAccessEvent = {
  /** Unversioned pending effects lack interpreter provenance and require fresh interpretation. */
  interpretationVersion?: 1;
  id: string;
  facts: {
    actorId: string;
    venueId: string;
    zoneId: string | null;
    accessRevision: number;
    semanticVersion?: 2;
    accompanies?: boolean;
    accessCommand?: import("../../../shared/helpers/venue-access.js").AccessCommand;
  };
  outcome: string;
  evidenceIds: string[];
};
