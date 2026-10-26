import type { SpinoffView } from "../../../shared/contracts/spinoff.js";

export type SpinoffEvidence = { id: string; speaker: "player" | "resident" | "narrator"; content: string };
export type VillageSpinoff = SpinoffView & {
  villageSeed: string;
  residentId: string;
  personaId: string;
  connectionId: string;
  context: string;
  transcript: { speaker: string; content: string }[];
  lorebookIds: string[];
  evidence: SpinoffEvidence[];
  memorySuggestions?: Record<string, import("../rules/scene-memories.js").SceneMemorySuggestion>;
  memoryContext?: import("../rules/scene-memories.js").SceneMemoryContext;
  memorySource?: import("./memories.js").MemorySource;
  interpretationAttempt?: string;
  outcome?: "concluded" | "abandoned" | "deleted" | "converted";
  capturedRevision: number;
  resolvedAt?: string;
};

export function spinoffLocksScene(value?: VillageSpinoff): boolean {
  return !!value && value.status !== "resolved";
}
