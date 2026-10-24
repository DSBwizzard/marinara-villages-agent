import type { KnownPursuitSnapshot, PursuitDecision, PursuitStatus } from "../../../shared/contracts/pursuits.js";
export type DevelopmentDecision = PursuitDecision;
export type Pursuit = {
  id: string;
  kind: "move";
  status: PursuitStatus;
  sourceVenueId: string;
  targetVenueId: string;
  privateZoneId: string;
  reason: string;
  startedAt: string;
  updatedAt: string;
  consents: Record<string, { decision: DevelopmentDecision; at: string; source: string }>;
  /** A historical disclosure, never silently refreshed from private progress. */
  known?: KnownPursuitSnapshot;
};
export type ResidentDevelopment = {
  revision: number;
  reviewedThrough: string;
  nextReviewAt: string;
  reason: string;
  pursuits: Pursuit[];
};
export type DevelopmentState = {
  version: 1;
  enabled: boolean;
  activatedAt: string;
  generation: number;
  residents: Record<string, ResidentDevelopment>;
  housing?: Record<string, { signature: string; availableAt: string }>;
  observations: Record<string, { at: string; signature: string }>;
  log: { id: string; at: string; effectiveAt: string; actorId: string; outcome: string; reason: string }[];
};
export type DevelopmentReview = {
  version: 1;
  seed: string;
  activatedAt: string;
  generation: number;
  through: string;
  housingRevision: string;
  housingAvailableAt: Record<string, string>;
  residentIds: string[];
  residents: Record<string, ResidentDevelopment>;
};
export type DevelopmentStep = {
  id: string;
  characterId: string;
  pursuitId: string;
  kind: "intend" | "consent" | "wait" | "end" | "move";
  at: string;
  reason: string;
  dependsOn: string[];
  targetVenueId?: string;
  privateZoneId?: string;
  actorId?: string;
  decision?: DevelopmentDecision;
};
export type DevelopmentProposal = {
  version: 1;
  steps: DevelopmentStep[];
  reviews: { characterId: string; nextReviewHours: number; reason: string }[];
};
export type DevelopmentSceneChange = {
  pursuitId: string;
  characterId: string;
  expectedRevision: number;
  kind: "disclose" | "consent" | "wait" | "end";
  actorId: string;
  decision?: DevelopmentDecision;
  citations: { segment: number; quote: string }[];
};
