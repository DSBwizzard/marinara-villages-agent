import type { NarrationSourceContext } from "../rules/narration-sources.js";
import type { ContinuityAdmission, ContinuityEvidence } from "./continuity-model.js";
import type { AcceptedEpisode } from "./episode-model.js";

export type SceneSpeechAction =
  | { kind: "visit"; actorId: string; option: number }
  | { kind: "follow"; actorId: string; agrees: boolean; to?: string; trespass?: true };

/** Exact final fitted evidence and native circumstances, retained by the existing operation checkpoint. */
export type NarrationReadset = {
  visitorIntroductionFarewell?: true;
  visitorIds?: string[];
  agendaOptions?: {
    actorId: string;
    activity: string;
    time: import("../../../shared/contracts/agenda.js").AgendaTime;
  }[];
  agendaVenues?: { id: string; zones: string[] }[];
  format: 1;
  setupAt: string;
  capturedAt: string;
  calendar: ReturnType<typeof import("../rules/scene-calendar.js").capturedSceneCalendar>;
  sceneRevision: number;
  continuityRevision: number;
  retryEpisodeRevision?: number;
  presentation: import("../rules/sprite-expressions.js").SpriteSelectionContext;
  source: Omit<NarrationSourceContext, "lines" | "labels" | "native" | "moves"> & { operationId: string };
  admission: Omit<ContinuityAdmission, "sources" | "blockedSources">;
  readOnlyKnowledge?: ContinuityEvidence[];
  ordinaryDialogue?: true;
  playerNavigation?: "explicit" | "conclude";
  sceneResidentMovement?: true;
  sceneFollowing?: true | 2;
  automaticTrespass?: true;
  sceneVisitOptions?: { actorId: string; venueId: string; zoneId: string; afterHours?: true }[];
  sceneSpeechActions?: SceneSpeechAction[];
  strictSceneReply?: true;
  taggedSceneReply?: true;
  /** Fresh requests use the native Projects control for player Start and Resume. */
  sceneProjectStart?: false;
  npcSpeakerNames?: Record<string, string>;
  ordinaryReplyRecovery?: true;
  positionedSceneSources?: true;
  stripSceneHistoryDecoration?: true;
  ordinaryFormatRecovery?: true | 2 | 3 | 4 | 5 | 6;
  quotedSceneSources?: true;
  splitKeepRecovery?: true | 2;
  explicitSceneReplacement?: true;
  coalesceOfferDecisions?: true;
  stripOfferContributionEcho?: true;
  recognizeDirectOfferSpeech?: true | 2 | 3 | 4 | 5;
  optionalActorMemories?: true | 2 | 3 | 4 | 5;
  continuityEffectRecovery?: true;
  stripSceneReplyDecorations?: true | 2 | 3 | 4 | 5;
  recoverCodeMemoryEcho?: true;
  requestedMemory?: { start: number; end: number; recipientId?: string };
  codeRequestedMemory?: true;
  offered: AcceptedEpisode["offered"];
  npcCandidates: { npc: import("./places.js").NpcIdentity; incarnation: string; offered: string[]; met?: boolean }[];
  circumstance: import("./narrative-model.js").NarrativeAdmission | null;
  repairs: { id: string; revision: number; entries: string[] }[];
  projects: import("../rules/project-interpretation.js").ProjectSpeechContext[];
  access: import("../rules/narration-access.js").NarrationAccessScope[];
  residence: ReturnType<typeof import("../rules/narration-residence.js").narrationResidenceContext>;
  places: ReturnType<typeof import("../rules/narration-place.js").narrationPlaceContext>;
};
