import type { VenueScene } from "./scene-model.js";

export type SceneTerminal = {
  version: 2;
  sceneId: string;
  villageSeed: string;
  sourceRevision: number;
  sceneRevision: number;
  endedAt: string;
  endReason: VenueScene["endReason"];
  submissions: { id: string; inputHash: string }[];
  navigationReceipts: NonNullable<VenueScene["navigationReceipts"]>;
  generationReceipts: NonNullable<VenueScene["generationReceipts"]>;
  recordEvents: NonNullable<VenueScene["submissions"][number]["recordEvents"]>;
  operation?: {
    id: string;
    kind: string;
    attemptId: string;
    status: "complete";
  };
};
