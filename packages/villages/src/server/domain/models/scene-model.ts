import type { SpeechDelivery, SpeechPresentation } from "../../../shared/helpers/scene-speech.js";
import type { StagingCue } from "../../../shared/helpers/scene-staging.js";
import type { ResponseDiagnostics } from "../rules/response-diagnostics.js";
import type { DoorwayContact } from "../rules/venue-contact.js";
import type { VenueOperation, VenueRequestMetrics } from "./operation-model.js";
import type { VillageVenueClass } from "./world.js";

export type VenueLine = {
  speechSource?: { version: 3; spans: import("../rules/source-span.js").InputSourceSpan[] };
  id: string;
  inputOf?: string;
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
  /** Server-authored attendance notice, retained for staging but outside the dialogue walk. */
  presenceChange?: true;
  contactHidden?: boolean;
  attentionEvidence?: boolean;
  contactReport?: boolean;
  kind?: "narration" | "dialogue" | "side" | "whisper" | "input";
  delivery?: SpeechDelivery;
  presentation?: SpeechPresentation;
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
  id: string;
  message: string;
  mode: "chat" | "contact" | "leave";
  targetId: string;
  at: string;
  requestFingerprint: string;
  /** The existing Scene outbox owns the purchased fit until its episode is published. */
  narration?: Omit<import("../rules/narration-acceptance.js").NarrationPublication, "native">;
  acceptance: { status: "pending" | "held" | "applied" | "abandoned"; rejected: { id: string; reason: string }[] };
  episodeId?: string;
  lore?: import("../../../shared/contracts/lore.js").LoreUse[];
  replyLineIds?: string[];
  zoneIdAtTurn?: string;
  activeIdsAtTurn?: string[];
  activeIdsAfterTurn?: string[];
  progressProcessedAt?: string;
  progressError?: string;
  requestMetrics?: VenueRequestMetrics;
  timing?: import("./operation-model.js").VenueTiming;
  responseDiagnostics?: ResponseDiagnostics;
  changeSequence?: number;
  recordEvents?: VenueRecordEvent[];
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
  /** Provisional writer cast, validated before publication; never persisted as Scene authority. */
  pendingNpcAdmissions?: import("../rules/npc-participation.js").NpcAdmission[];
  /** Private captured writing context; never part of a client projection. */
  continuity?: import("../rules/scene-continuity.js").SceneContinuity;
  openingGatheringId?: string;
  semanticVersion?: 2;
  semanticIntent?: import("./semantic-model.js").SemanticIntent;
  version: 5;
  changeSequence?: number;
  villageSeed?: string;
  sceneRevision: number;
  /** Interactive Scenes follow the Village clock; noninteractive memory inputs omit this marker. */
  liveSceneVersion?: 1;
  operation?: VenueOperation;
  /** Opaque stored operation heads retain purchases from explicitly abandoned requests. */
  abandonedOperations?: VenueOperation[];
  /** Idempotent free navigation, separate from conversational turns. */
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
  id: string;
  placeId: string;
  placeName: string;
  spaceClass?: VillageVenueClass;
  zoneId?: string;
  enteredFromZoneId?: string;
  accessPreviousZones?: Record<string, string>;
  pendingAccessClaim?: string;
  pendingRoomQuestions?: string[];
  pendingProjectQuestions?: string[];
  accompanying?: { characterId: string; zoneId: string }[];
  doorwayContacts?: DoorwayContact[];
  entryOffers?: { zoneId: string; label: string; controllerId: string; accompanies: boolean }[];
  /** Ephemeral prompt context; never stored or disclosed. */
  contactGeneration?: {
    zoneEvents?: boolean;
    venue?: import("./world.js").VillageVenue;
    instruction: string;
    localIds: string[];
    remoteIds: string[];
    /** Selected writers only; physical attendance and witnesses remain independent. */
    actorIds?: string[];
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
  endReason: "player" | "scene" | "inactivity" | "debug" | "";
  memoryMode: "live";
  status: "opening" | "active" | "closing" | "closed";
  participants: VenueParticipant[];
  sceneAttendance?: SceneAttendance;
  activeIds: string[];
  lines: VenueLine[];
  submissions: VenueSubmission[];
  recap: string;
};
export type VenueSession = VenueScene;
export type ActiveVenue = { sessionId: string; placeId: string; playbackSceneId?: string };
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
  kind: NonNullable<VenueLine["kind"]>;
  delivery?: SpeechDelivery;
  presentation?: SpeechPresentation;
  speakerId: string;
  content: string;
  heardBy: string[];
  viaDoorway?: boolean;
  physicalIdsAfter?: string[];
  contactHidden?: boolean;
  contactReport?: boolean;
  staging?: StagingCue[];
  targetId?: string;
  anchorIndex?: number;
};
export type SavedAccessEvent = {
  interpretationVersion: 1;
  id: string;
  facts: {
    actorId: string;
    venueId: string;
    zoneId: string | null;
    accessRevision: number;
    semanticVersion: 2;
    accompanies?: boolean;
    accessCommand?: import("../../../shared/helpers/venue-access.js").AccessCommand;
  };
  outcome: string;
  evidenceIds: string[];
};
