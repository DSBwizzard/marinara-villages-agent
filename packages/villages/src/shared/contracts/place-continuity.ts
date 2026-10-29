/** Current physical prose and one coarse recent-context window; no object inventory. */
export type RecentPlaceContext = { text: string; occurredAt: string; expiresAt: string };
export type PlaceContinuity = { revision: number; updatedAt: string; recent: RecentPlaceContext | null };
export type PlaceTextEdit = { before: string; after: string };
export type PlaceUpdate = {
  narration: string;
  expectedRevision: number;
  edits?: PlaceTextEdit[];
  append?: string;
  recent?: { text: string; renew?: boolean };
};
export type PlaceAfter = { description: string; state: PlaceContinuity };
/** Minted from accepted source lines, never trusted directly from model metadata. */
export type PlaceEvidence = {
  actorIds: string[];
  witnessIds: string[];
  consentIds: string[];
  positions: Record<string, string>;
};
