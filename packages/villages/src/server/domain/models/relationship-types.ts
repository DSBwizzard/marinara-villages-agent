export type RelationshipHead = { id: string; digest: string };
export type SocialEvidence = {
  id: string;
  sourceId: string;
  speakerId: string;
  content: string;
  heardBy: string[];
  hash: string;
};
export type SocialRecord = {
  id: string;
  revision: number;
  kind: "history" | "declaration" | "boundary" | "agreement" | "commitment";
  text: string;
  participants: string[];
  status: "stated" | "proposed" | "accepted" | "fulfilled" | "cancelled" | "overdue";
  /** Only an explicitly agreed real-world instant creates a deadline. */
  dueAt?: string;
  /** Authored historical facts may be unknown even to their subjects. */
  knownBy?: string[];
  evidenceIds: string[];
};
export type RelationshipEdge = {
  fromId: string;
  toId: string;
  revision: number;
  connection: string;
  stance: string;
  expectations: string[];
  concerns: string[];
  experiences: string[];
  records: Record<string, SocialRecord>;
  updatedAt: string;
};
export type RelationshipUpdate = Pick<RelationshipEdge, "connection" | "stance" | "expectations" | "concerns"> & {
  /** Upserts: omission cannot erase history or active terms. */
  records: SocialRecord[];
};
export type RelationshipChange = {
  id: string;
  fromId: string;
  toId: string;
  expectedRevision: number;
  sceneAfter: RelationshipUpdate;
  liveAfter: RelationshipUpdate;
  reason: string;
  lineIds: string[];
  evidence: SocialEvidence[];
};
export type RelationshipPermission = {
  id: string;
  controllerId: string;
  visitorId: string;
  venueId: string;
  zoneId: string;
  action: "grant" | "revoke";
  lineIds: string[];
};
export type RelationshipDisclosure = {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  kind: "explanation" | "preference" | "boundary" | "routine" | "history" | "connection" | "home" | "work";
  lineIds: string[];
  excerpts?: string[];
};
export type RelationshipReview = {
  changes: RelationshipChange[];
  permissions: RelationshipPermission[];
  disclosures: RelationshipDisclosure[];
};
export type RelationshipEvidenceLine = {
  id: string;
  speakerId: string;
  role: "user" | "assistant";
  content: string;
  heardBy: string[];
  kind?: string;
  playerHeard?: boolean;
};
export type RelationshipGrant = {
  id: string;
  controllerId: string;
  visitorId: string;
  venueId: string;
  zoneId: string;
  active: boolean;
  revoked: boolean;
  at: string;
};
export type RelationshipReceipt = {
  sceneId?: string;
  submissionId?: string;
  noticeSequence?: number;
  committedAt?: string;
  id: string;
  fromId: string;
  toId: string;
  beforeRevision: number;
  sequence: number;
  sceneBeforeRevision: number;
  /** Omitted when both interpretations of this event are identical. */
  sceneAfter?: RelationshipUpdate;
  liveAfter: RelationshipUpdate;
  reason: string;
  at: string;
  sourceId: string;
  lineIds: string[];
  evidence: SocialEvidence[];
};
export type StartingTie = {
  fromId: string;
  toId: string;
  connection: string;
  stance: string;
  expectations: string[];
  concerns: string[];
  history: { text: string; sourceIds: string[]; knownBy: string[] }[];
};
export type SocialEncounter = {
  placeUpdate?: import("../../../shared/contracts/place-continuity.js").PlaceUpdate | null;
  physicalContext?: import("../../../shared/contracts/place-continuity.js").PlaceEvidence & {
    zoneId: string;
    segment: number;
  };
  wishChanges?: unknown[];
  memoryChanges?: unknown;
  rejectedProposals?: import("../rules/relationship-review.js").RelationshipProposalRejection[];
  id: string;
  at: string;
  venueId: string;
  zoneId: string;
  actorIds: string[];
  lines: RelationshipEvidenceLine[];
  review: RelationshipReview;
};
export type RelationshipState = {
  noticeSequence: number;
  eventSequence: number;
  version: 4;
  seed: string;
  edges: Record<string, RelationshipEdge>;
  grants: Record<string, RelationshipGrant>;
  receipts: Record<string, RelationshipReceipt>;
  applied: Record<string, true>;
  disclosureReceipts: Record<string, true>;
  sharedRecords: Record<string, SocialRecord>;
  reviewedActorIds: string[];
  startingTies: StartingTie[];
  startingActorIds: string[];
  initializationConflicts: { actorIds: string[]; question: string; sourceIds: string[] }[];
  mailThreads: Record<string, import("./social-mail.js").SocialMailThread>;
  mailDeliveries: Record<string, { messageId: string; at: string; sourceHash: string }>;
  socialEncounters: SocialEncounter[];
};
