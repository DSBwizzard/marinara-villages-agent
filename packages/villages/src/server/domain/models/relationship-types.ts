/** Old social contracts are never silently converted. */
export const SOCIAL_CONTRACT_VERSION = 2;
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
export type SocialIntention = {
  id: string;
  actorId: string;
  targetIds: string[];
  text: string;
  reason: string;
  evidenceIds: string[];
  status: "active" | "retired" | "attempted";
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
  kind: "explanation" | "preference" | "boundary" | "routine" | "history" | "connection";
  lineIds: string[];
};
export type RelationshipReview = {
  changes: RelationshipChange[];
  permissions: RelationshipPermission[];
  disclosures: RelationshipDisclosure[];
  intentions?: { actorId: string; items: SocialIntention[] }[];
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
  sceneAfter: RelationshipEdge;
  liveAfter: RelationshipEdge;
  reason: string;
  at: string;
  sourceId: string;
  lineIds: string[];
  evidence: SocialEvidence[];
};
export type RelationshipKnowledge = {
  fromId: string;
  at: string;
  summary: string;
  routine: string[];
  interests: string;
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
export type SocialPlan = {
  id: string;
  dateKey: string;
  actorIds: string[];
  venueId: string;
  zoneId: string;
  startMinute: number;
  endMinute: number;
  activity: string;
  reason: string;
  revisions: Record<string, string>;
  kind: "meeting" | "avoidance";
  status: "planned" | "completed" | "cancelled";
};
export type SocialEncounter = {
  semanticProvenance?: import("./semantic-model.js").SemanticProvenance;
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
  clockShiftMs?: number;
  noticeSequence: number;
  version: 2;
  seed: string;
  edges: Record<string, RelationshipEdge>;
  intentions: Record<string, SocialIntention[]>;
  grants: Record<string, RelationshipGrant>;
  receipts: Record<string, RelationshipReceipt>;
  applied: Record<string, true>;
  disclosures: Record<string, RelationshipDisclosure & { at: string; sourceId: string; publicationId?: string }>;
  knowledge: Record<string, RelationshipKnowledge>;
  sharedRecords: Record<string, SocialRecord>;
  reviewedActorIds: string[];
  startingTies: StartingTie[];
  startingActorIds: string[];
  initializationConflicts: { actorIds: string[]; question: string; sourceIds: string[] }[];
  mailThreads: Record<string, import("./social-mail.js").SocialMailThread>;
  mailDeliveries: Record<string, { messageId: string; at: string; sourceHash: string }>;
  invitations: Record<string, import("./social-mail.js").SocialInvitation>;
  socialPlans: SocialPlan[];
  socialEncounters: SocialEncounter[];
};
