import type { ContinuityEvidence } from "./continuity-model.js";
import type { VenueLine } from "./scene-model.js";

export type AcceptedEpisode = {
  format: 1;
  id: string;
  seed: string;
  sceneId?: string;
  opportunity?: { id: string; kind: "encounter" | "routine"; venueId: string; zoneId: string };
  submissionId: string;
  operationId: string;
  capturedAt: string;
  acceptedAt: string;
  responseDigest: string;
  admittedContinuityRevision: number;
  /** Exact original submission; never a resident-readable transcript. */
  privateInput: string;
  actors: { id: string; incarnation: string; zoneId: string }[];
  segments: VenueLine[];
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
      | "movement-request"
      | "departure"
      | "structure"
      | "room"
      | "discovery"
      | "npc"
      | "establishment"
      | "circumstance"
      | "condition-repair"
      | "initialization"
      | "contact"
      | "scene"
      | "appointment"
      | "venue-request"
      | "mail";
    targetId: string;
    revision: number;
    text: string;
    witnesses: string[];
    observedBy?: string[];
    endedContacts?: string[];
    movement?: {
      actorId: string;
      from: string;
      zoneId: string;
      segment: number;
      path: string[];
      spaceClass: import("./world.js").VillageVenueClass;
      area: "outside" | "public" | "shared" | "private";
      privateOwnerId: string;
    };
    departure?: { actorId: string; from: string; segment: number; path: string[] };
    admission?: { npc: import("./places.js").NpcIdentity; zoneId: string; segment: number };
    circumstance?: { summary: string; status: "active" | "resolved" };
    repairEntries?: string[];
    mail?: {
      id: string;
      at: string;
      from: { id: string; incarnation: string };
      to: { id: string; incarnation: string };
      phase: "written" | "read";
      sourceHash: string;
      readingHash?: string;
    };
  }[];
  /** Code-bound source ancestry for each input/segment unit. */
  dependencies: Record<string, string[]>;
  room?: Extract<import("./continuity-model.js").ContinuityHolder, { kind: "room" }>;
  /** Generated provenance is private to the holder who received that context. */
  holderDependencies?: Record<string, Record<string, string[]>>;
  sceneDelta?: { expectedRevision: number; contactEndedIds: string[]; closed?: true; receiptIds: string[] };
};
export type EpisodeCollection = { format: 1; revision: number; records: AcceptedEpisode[] };
