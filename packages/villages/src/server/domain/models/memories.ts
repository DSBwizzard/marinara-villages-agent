/** Final current-format Memories contract. Not connected to the pre-cutover runtime. */
export type MemoryBasis = "observation" | "report" | "interpretation" | "validated-event";
export type MemorySource = {
  /** Immutable accepted exchange/event identity, never a whole mutable Scene. */
  kind: "scene" | "offscreen" | "domain";
  id: string;
  revision: number;
  fingerprint: string;
  sceneId?: string;
};
export type MemoryEvidence = {
  source: MemorySource;
  lineId: string;
  excerpt: string;
  audience: string[];
};
export type MemoryLearning = {
  basis: MemoryBasis;
  /** Required for reports; neither reporting nor interpretation establishes an event fact. */
  attributedTo?: string;
  support: MemoryEvidence[];
  /** Saved disclosed values only. Never filled from current domain state. */
  disclosed?: Record<string, string | boolean>;
};
export type MemoryKnower = MemoryLearning & {
  /** Root membership learned through this correction, not the original claim. */
  learnedVia?: string;
  learnedAt: string;
  reinforcedAt: string;
  forgotten?: { at: string; operationId: string };
  repair?: { text: string; at: string; operationId: string; repairs: { id: string; revision: number } };
};
export type MemoryDomainRef = {
  kind: "wish" | "project" | "pursuit" | "relationship" | "physical";
  id: string;
  characterId?: string;
};
/** Trusted adapter supplies this ONLY from effects saved after successful validation. */
export type CommittedMemoryEffect = {
  status: "committed";
  id: string;
  source: MemorySource;
  domainRef: MemoryDomainRef;
  occurredAt: string;
  committedAt: string;
  audience: string[];
};
export type MemoryRecord = {
  id: string;
  rootId: string;
  revision: number;
  createdRevision: number;
  updatedRevision: number;
  kind: "experience" | "information" | "open-matter";
  text: string;
  subjects: string[];
  knowers: Record<string, MemoryKnower>;
  origin: MemorySource;
  occurredAt: string;
  recordedAt: string;
  domainRef?: MemoryDomainRef;
  committedEffect?: CommittedMemoryEffect;
  /** Corrections always point directly to their root; resolutions have their own root. */
  corrects?: string;
  resolves?: string;
  lastApplication: { id: string; fingerprint: string };
};
export type MemoryCollection = { format: 1; revision: number; records: MemoryRecord[] };
export type MemoryScreening = {
  disposition: "clear" | "conflict" | "uncertain";
  protectedRoots: string[];
  fingerprint: string;
};
export type MemoryProposal = {
  operationId: string;
  source: MemorySource;
  /** Stable within the accepted source, retained on retries. */
  proposalId: string;
  expectedCollectionRevision: number;
  target?: { id: string; revision: number; rootRevision: number };
  action: "create" | "reinforce" | "correct" | "resolve";
  kind?: MemoryRecord["kind"];
  text?: string;
  subjects?: string[];
  learners: Record<string, MemoryLearning>;
  domainRef?: MemoryDomainRef;
  effectId?: string;
  screening: MemoryScreening;
};
export type MemoryRepair = {
  operationId: string;
  expectedCollectionRevision: number;
  target: { id: string; revision: number; rootRevision: number };
  knowers: string[];
  action: "forget" | "repair";
  text?: string;
};
/** Server-only, sparse copy-before-write continuity. Capture never copies the collection.
 * Every memory mutation must atomically save its returned active snapshots with the collection.
 */
export type MemorySceneSnapshot = {
  sceneId: string;
  capturedRevision: number;
  capturedAt: string;
  audience: string[];
  before: Record<string, MemoryRecord | null>;
};
export type MemoryCandidate = {
  id: string;
  rootId: string;
  revision: number;
  rootRevision: number;
  kind: MemoryRecord["kind"];
  text: string;
  subjects: string[];
  occurredAt: string;
  recordedAt: string;
  domainRef?: MemoryDomainRef;
  corrects?: string;
  resolves?: string;
  knowers: Record<string, MemoryKnower & { sourceRefs?: { source: MemorySource; lineId: string }[] }>;
};
