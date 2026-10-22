import type { InterpretationBatch } from "./interpretation-model.js";
import type { VenueSceneChange } from "../rules/venue-scene-state.js";
import type { VenueScene, VenueReplyLine } from "./scene-model.js";

export interface SemanticInterpreter {
  rejectExchange?(result: SemanticExchange): Promise<void>;
  intent(scene: VenueScene, message: string): Promise<SemanticIntent>;
  exchange(
    scene: VenueScene,
    message: string,
    lines: VenueReplyLine[],
    prepared: SemanticIntent | null,
    residentActions?: import("../rules/resident-actions.js").ResidentAccessAction[],
    residentActionsOmitted?: boolean,
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
  developmentVersion?: 1;
  turnPolicyVersion?: 1;
  pipelineVersion?: 3;
  residentActionsVersion?: 1 | 2;
  authority?: SemanticExchange["authority"];
  version: 2;
  sourceHash: string;
  /** Immutable semantic unit receipts survive output reordering and explicit retries. */
  interpretedAt: string;
};
