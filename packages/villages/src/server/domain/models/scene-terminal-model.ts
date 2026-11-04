import type { VenueScene } from "./scene-model.js";

export type SceneTerminal = {
  version: 1;
  sceneId: string;
  villageSeed: string;
  sourceRevision: number;
  sceneRevision: number;
  endedAt: string;
  endReason: VenueScene["endReason"];
  submissions: { id: string; inputHash: string }[];
  navigationReceipts: NonNullable<VenueScene["navigationReceipts"]>;
  rejectedSubmissions: NonNullable<VenueScene["rejectedSubmissions"]>;
  generationReceipts: NonNullable<VenueScene["generationReceipts"]>;
  recordEvents: NonNullable<VenueScene["submissions"][number]["recordEvents"]>;
  optionalAttempts?: Record<string, { status: "complete" | "unknown"; elapsedMs: number }>;
  abandonedRequest?: { id: string; kind: string; attemptId: string };
  operation?: {
    id: string;
    kind: string;
    attemptId: string;
    status: "complete";
    turnOutcome?: NonNullable<VenueScene["operation"]>["turnOutcome"];
  };
};
