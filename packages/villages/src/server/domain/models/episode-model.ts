import type { ContinuityEvidence } from "./continuity-model.js";
import type { VenueLine } from "./scene-model.js";

export type AcceptedEpisode = {
  format: 1;
  id: string;
  seed: string;
  sceneId?: string;
  submissionId: string;
  operationId: string;
  capturedAt: string;
  acceptedAt: string;
  responseDigest: string;
  admittedContinuityRevision: number;
  /** Exact original submission; never a resident-readable transcript. */
  privateInput: string;
  actors: { id: string; incarnation: string; zoneId: string }[];
  segments: Omit<VenueLine, "speechSource">[];
  grounding: ContinuityEvidence[];
  continuityVersionIds: string[];
  offered: { holder: Extract<import("./continuity-model.js").ContinuityHolder, { kind: "actor" }>; ids: string[] }[];
  commandReceipts: {
    id: string;
    kind:
      | "project"
      | "access"
      | "residence"
      | "standing"
      | "movement"
      | "structure"
      | "discovery"
      | "npc"
      | "establishment";
    targetId: string;
    revision: number;
    text: string;
    witnesses: string[];
    observedBy?: string[];
  }[];
  /** Code-bound source ancestry for each input/segment unit. */
  dependencies: Record<string, string[]>;
  room?: Extract<import("./continuity-model.js").ContinuityHolder, { kind: "room" }>;
  /** Generated provenance is private to the holder who received that context. */
  holderDependencies?: Record<string, Record<string, string[]>>;
};
export type EpisodeCollection = { format: 1; revision: number; records: AcceptedEpisode[] };
