import type { ContinuityEvidence } from "./continuity-model.js";
import type { VenueLine } from "./scene-model.js";

export type AcceptedEpisode = {
  format: 1;
  id: string;
  seed: string;
  sceneId?: string;
  /** Historical public Place label captured with this Scene exchange. */
  placeName?: string;
  explicitNpcIntroduction?: true;
  opportunity?: { id: string; kind: "encounter" | "routine" | "relationship"; venueId: string; zoneId: string };
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
  rejectedEffects?: { id: string; reason: string }[];
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
      | "movement-agreement"
      | "departure"
      | "structure"
      | "room"
      | "discovery"
      | "npc"
      | "npc-introduction"
      | "circumstance"
      | "condition-repair"
      | "initialization"
      | "contact"
      | "scene"
      | "appointment"
      | "meeting"
      | "venue-request"
      | "mail";
    targetId: string;
    revision: number;
    text: string;
    witnesses: string[];
    observedBy?: string[];
    endedContacts?: string[];
    movementAgreement?: import("../rules/scene-trespass.js").MovementAgreement & { agrees: boolean; segment: number };
    movement?: {
      actorId: string;
      from: string;
      zoneId: string;
      segment: number;
      path: string[];
      area: "outside" | "public" | "shared" | "private";
      privateOwnerId: string;
      trespass?: import("../../../shared/helpers/venue-access.js").TrespassReason;
    };
    departure?: { actorId: string; from: string; segment: number; path: string[] };
    admission?: { npc: import("./places.js").NpcIdentity; zoneId: string; segment: number };
    circumstance?: { summary: string; status: "active" | "resolved" };
    conditionDamage?: { conditionId: string; entries: string[] }[];
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
