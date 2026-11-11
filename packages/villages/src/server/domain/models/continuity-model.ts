export type ContinuityHolder =
  { kind: "actor"; id: string; incarnation: string } | { kind: "room"; placeId: string; zoneId: string };

export type ContinuityClass =
  "experience" | "information" | "perspective" | "desire" | "motivation" | "commitment" | "open-matter";

/** A source is supplied by code after exact-source and perception binding. */
export type ContinuityEvidence = {
  id: string;
  seed: string;
  episodeId: string;
  fingerprint: string;
  unitId: string;
  range?: { start: number; end: number };
  moment?: { index: number; side: "before" | "after" };
  positions?: Record<string, string>;
  excerpt: string;
  kind: "speech" | "written" | "observation" | "self" | "private" | "native" | "context" | "knowledge";
  actorId?: string;
  perceptions: { actorId: string; channel: "words" | "sight" | "sound-only" | "private"; text: string }[];
  act?: "offer" | "accept" | "refuse" | "withdraw";
  committedReceiptId?: string;
};

export type ContinuityVersion = {
  id: string;
  rootId: string;
  createdRevision: number;
  text: string;
  class: ContinuityClass;
  about: { id: string; incarnation: string }[];
  parentId?: string;
  facet?: "reason" | "attention" | "approach" | "connection" | "stance" | "expectation" | "concern" | "boundary";
  sources: ContinuityEvidence[];
  at: string;
  operationId: string;
  administrative?: { holder: ContinuityHolder; at: string };
  offerEvents?: string[];
  closed?: { reason: "fulfilled" | "withdrawn" | "ended" };
  room?: { order: number; visibility: "observable" | "concealed"; expiresAt?: string };
};

export type ContinuityHead = { holder: ContinuityHolder; versionId: string; revision: number; current: boolean };
export type ContinuityProtection = {
  operationId: string;
  at: string;
  forgotten?: true;
  repair?: { versionId: string };
  sourceUnits: string[];
};
export type ContinuityRecord = {
  id: string;
  revision: number;
  owner?: Extract<ContinuityHolder, { kind: "actor" }>;
  heads: Record<string, ContinuityHead>;
  protection: Record<string, ContinuityProtection>;
  /** Terms live only in this immutable version's text. */
  offer?: {
    termsVersionId: string;
    proposer: { id: string; incarnation: string };
    participants: { id: string; incarnation: string }[];
    events: {
      id: string;
      by: string;
      act: "offer" | "accept" | "refuse" | "withdraw";
      sources: ContinuityEvidence[];
    }[];
  };
};

export type ContinuityCollection = {
  format: 1;
  revision: number;
  records: ContinuityRecord[];
  versions: ContinuityVersion[];
  receipts: Record<string, { fingerprint: string; roots: string[]; versions: string[] }>;
};

export type ContinuityTarget = { id: string; recordRevision: number; heads: Record<string, number> };
export type ContinuityCapture = {
  seed: string;
  setupAt: string;
  at: string;
  actors: { id: string; incarnation: string }[];
  references: { id: string; incarnation: string }[];
  subjects: { id: string; incarnation: string }[];
  continuityRevision: number;
  supplied: ContinuityTarget[];
  protection: Record<string, string>;
  protectedRoots: string[];
  historical: Record<string, ContinuityEvidence>;
  provenance: Record<string, string[]>;
  sourceActors: Record<string, { id: string; incarnation: string }[]>;
  offered: { holder: Extract<ContinuityHolder, { kind: "actor" }>; ids: string[] }[];
  prompt: {
    entries: Record<string, unknown>[];
    history: unknown;
    protections: ReturnType<typeof import("../rules/continuity.js").continuityConstraints>;
  };
};
export type ContinuityWrite = {
  id: string;
  holders: ContinuityHolder[];
  owner?: Extract<ContinuityHolder, { kind: "actor" }>;
  sourceIds: string[];
  target?: ContinuityTarget;
  text?: string;
  class?: ContinuityClass;
  current?: boolean;
  about?: { id: string; incarnation: string }[];
  parentId?: string;
  facet?: ContinuityVersion["facet"];
  retire?: "fulfilled" | "withdrawn" | "ended";
  offer?: { proposer: string; participants: string[] };
  accept?: string;
  closeOffer?: { by: string; reason: "refused" | "withdrawn" };
  room?: { visibility?: "observable" | "concealed"; knownBy?: string[]; expiresInMinutes?: number };
  screening?: { fingerprint: string; roots: string[]; disposition: "clear" | "conflict" | "uncertain" };
};

export type ContinuityAdmission = {
  seed: string;
  operationId: string;
  episodeId: string;
  at: string;
  actors: { id: string; incarnation: string }[];
  subjects?: { id: string; incarnation: string }[];
  continuityRevision?: number;
  /** Canonical rosters of the historical source episodes actually fitted in this request. */
  sourceActors?: Record<string, { id: string; incarnation: string }[]>;
  room?: Extract<ContinuityHolder, { kind: "room" }>;
  sources: ContinuityEvidence[];
  supplied: ContinuityTarget[];
  protectedRoots: string[];
  protectionFingerprint?: string;
  blockedSources?: Record<string, string[]>;
  /** Actual fitted context dependencies, separate from evidence authorizing learning. */
  provenance?: Record<string, string[]>;
};

export type ContinuityView = {
  id: string;
  owner?: Extract<ContinuityHolder, { kind: "actor" }>;
  recordRevision: number;
  headRevision: number;
  holder: ContinuityHolder;
  current: boolean;
  version: ContinuityVersion;
  repaired: boolean;
  roomKnownBy?: string[];
  parties?: { id: string; incarnation: string }[];
  offer?: {
    proposer: { id: string; incarnation: string };
    participants: { id: string; incarnation: string }[];
    state: "offered" | "accepted" | "refused" | "withdrawn";
    contributions: { by: string; act: "offer" | "accept" | "refuse" | "withdraw"; sources: ContinuityEvidence[] }[];
  };
};
