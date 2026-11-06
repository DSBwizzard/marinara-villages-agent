import type { VenueSceneChange } from "../rules/venue-scene-state.js";
import type { InterpretationBatch } from "./interpretation-model.js";
import type { VenueReplyLine, VenueScene } from "./scene-model.js";

export interface SemanticInterpreter {
  rejectExchange?(result: SemanticExchange): Promise<void>;
  exchange(
    scene: VenueScene,
    message: string,
    lines: VenueReplyLine[],
    prepared: SemanticIntent | null,
    residentActions?: import("../rules/resident-actions.js").ResidentAccessAction[],
    residentActionsOmitted?: boolean,
    narrativeGrant?: import("./narrative-model.js").NarrativeAdmission | null,
    zoneEventSource?: Record<string, unknown>,
    gm?: {
      raw: Record<string, unknown>;
      context: ReturnType<typeof import("../rules/semantic-contract.js").semanticContext>;
      presentation: import("../rules/sprite-expressions.js").SpriteSelectionContext;
    },
  ): Promise<SemanticExchange>;
}

export type SemanticIntent = {
  timeline: {
    kind: "speech" | "thought" | "action" | "movement" | "context";
    text: string;
    start: number;
    end: number;
    targetId?: string;
    delivery?: "ordinary" | "whisper" | "shout";
    zoneId?: string;
  }[];
  version: 2;
  sourceHash: string;
  status: "resolved" | "unresolved";
  reason: string;
  action: VenueSceneChange | null;
  movement: { zoneId: string; quote: string } | null;
  instructions: string;
};

/** Interpreter provenance is created by code, never accepted from Narration. */
export type SemanticExchange = {
  producer?: "gm";
  lore?: import("../../../shared/contracts/lore.js").LoreUse[];
  presentation?: import("../rules/sprite-expressions.js").SceneSpritePresentation;
  draftBoundaryViolation?: import("../rules/scene-halt.js").SceneBoundaryFinding;
  turnOutcome?: import("../../../shared/contracts/scene-turn-outcome.js").SceneTurnOutcome;
  intent?: SemanticIntent;
  checkpointKey: string;
  authority: { physical: boolean; access: boolean; projects: boolean; standing: boolean; social?: boolean };
  version: 2;
  sourceHash: string;
  effects: Record<string, unknown>;
  access: InterpretationBatch | null;
};

export type SemanticProvenance = {
  producer?: "gm";
  preservationVersion?: 1;
  occurrenceVersion?: 1;
  turnPolicyVersion?: 1;
  pipelineVersion?: 3;
  residentActionsVersion?: 1 | 2;
  hearingTimelineVersion?: 1;
  authority?: SemanticExchange["authority"];
  version: 2;
  sourceHash: string;
  /** Immutable semantic unit receipts survive output reordering and explicit retries. */
  interpretedAt: string;
};
