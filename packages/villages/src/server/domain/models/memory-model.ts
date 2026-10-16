import type { ResponseDiagnostics } from "../rules/response-diagnostics.js";
import type { RelationshipEvidenceLine } from "./relationship-types.js";

export type LiveExchangeProposals = {
  evidenceFingerprints?: Record<string, string>;
  responseDiagnostics?: ResponseDiagnostics;
  version: 1;
  memoryChanges: unknown;
  relationshipChanges: unknown;
  earlierLineIds: string[];
  memoryVersions: Record<string, string>;
  playerLineId: string;
  replyLineIds: string[];
};
export type LiveEvidenceContext = {
  lines: readonly RelationshipEvidenceLine[];
  byId: ReadonlyMap<string, RelationshipEvidenceLine>;
};
