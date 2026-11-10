import type { ContinuityCapture, ContinuityHolder, ContinuityTarget } from "./continuity-model.js";
import type { ResidentPlanningOpportunity } from "./world.js";

export type ResidentNarrationCapture = {
  format: 1;
  context: ContinuityCapture;
  opportunity: Omit<ResidentPlanningOpportunity, "kind"> & { kind: "encounter" | "routine" };
  actors: { id: string; incarnation: string; zoneId: string }[];
  nativeFingerprint: string;
  protectionFingerprint: string;
  room?: {
    holder: Extract<ContinuityHolder, { kind: "room" }>;
    supplied: ContinuityTarget[];
    provenance: string[];
    packet: ReturnType<typeof import("../rules/continuity-retrieval.js").selectRoomContinuity>["packet"];
    protections: ReturnType<typeof import("../rules/continuity.js").continuityConstraints>;
    fingerprint: string;
  };
};
export type ResidentNarration = {
  encounter?: unknown;
  reflection?: unknown;
  keep: unknown[];
  requires: string[];
};
