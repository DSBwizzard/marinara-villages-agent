import type { StagingCue } from "../../../shared/helpers/scene-staging.js";
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

export type VenueLine = {
  id: string;
  speakerId: string;
  name: string;
  role: "user" | "assistant";
  content: string;
  at: string;
  heardBy: string[];
  zoneId?: string;
  viaDoorway?: boolean;
  remoteDelivery?: "loud" | "device";
  contactHidden?: boolean;
  contactReport?: boolean;
  kind?: "narration" | "dialogue" | "side" | "whisper";
  expression?: string;
  gazeAt?: string;
  staging?: StagingCue[];
  targetId?: string;
  asideFor?: string;
};
export type VenueParticipant = { characterId: string; name: string; doing: string };
export type SceneAttendance = {
  capturedAt: string;
  occupants: (VenueParticipant & { zoneId: string; availability: string })[];
};
export type VenueSubmission = {
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
  residenceSignal?: { kind: "request" | "decision"; characterId: string; venueId: string; approved?: boolean };
  upgradeSignal?: { characterId: string; venueId: string; quote: string };
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
  liveProposals?: LiveExchangeProposals;
  wishContexts?: { actorId: string; wishId: string; fingerprint: string }[];
  requestMetrics?: VenueRequestMetrics;
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
  version: 1;
  processingVersion?: 1;
  changeSequence?: number;
  villageSeed?: string;
  sceneRevision: number;
  operation?: VenueOperation;
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
  entryOffers?: { zoneId: string; label: string; controllerId: string; accompanies: boolean }[];
  /** Ephemeral prompt context; never stored or disclosed. */
  contactGeneration?: {
    instruction: string;
    localIds: string[];
    remoteIds: string[];
    delivery?: "voice" | "loud" | "device";
  };
  departedIds?: string[];
  area: "outside" | "shared" | "private" | "public";
  privateOwnerId: string;
  privateAccessOwnerId: string;
  startedAt: string;
  endedAt: string;
  lastActivityAt: string;
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
  | "unsupported-physical-claim"
  | "reserved-project-item";
export type VenueReplyLine = {
  kind: NonNullable<VenueLine["kind"]>;
  speakerId: string;
  content: string;
  heardBy: string[];
  viaDoorway?: boolean;
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
  id: string;
  facts: {
    actorId: string;
    venueId: string;
    zoneId: string | null;
    accessRevision: number;
    accessCommand?: import("../../../shared/helpers/venue-access.js").AccessCommand;
  };
  outcome: string;
  evidenceIds: string[];
};
