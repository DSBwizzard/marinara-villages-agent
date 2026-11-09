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
  excerpt: string;
  kind: "speech" | "observation" | "self" | "private" | "native";
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
  about: string[];
  parentId?: string;
  facet?: "reason" | "attention" | "approach" | "connection" | "stance" | "expectation" | "concern" | "boundary";
  sources: ContinuityEvidence[];
  at: string;
  operationId: string;
  offerEvents?: string[];
  closed?: { reason: "fulfilled" | "withdrawn" | "ended" };
  room?: { order: number; visibility: "observable" | "concealed"; expiresAt?: string };
};

export type ContinuityHead = { holder: ContinuityHolder; versionId: string; revision: number; current: boolean };
export type ContinuityProtection = {
  operationId: string;
  at: string;
  forgotten?: true;
  repair?: { text: string; versionId: string };
  sourceUnits: string[];
};
export type ContinuityRecord = {
  id: string;
  revision: number;
  heads: Record<string, ContinuityHead>;
  protection: Record<string, ContinuityProtection>;
  /** Terms live only in this immutable version's text. */
  offer?: {
    termsVersionId: string;
    proposer: string;
    participants: string[];
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
export type ContinuityWrite = {
  id: string;
  holders: ContinuityHolder[];
  sourceIds: string[];
  target?: ContinuityTarget;
  text?: string;
  class?: ContinuityClass;
  current?: boolean;
  about?: string[];
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
  room?: Extract<ContinuityHolder, { kind: "room" }>;
  sources: ContinuityEvidence[];
  supplied: ContinuityTarget[];
  protectedRoots: string[];
  protectionFingerprint?: string;
  blockedSources?: Record<string, string[]>;
};

export type ContinuityView = {
  id: string;
  recordRevision: number;
  headRevision: number;
  holder: ContinuityHolder;
  current: boolean;
  version: ContinuityVersion;
  repaired: boolean;
  roomKnownBy?: string[];
  offer?: {
    proposer: string;
    participants: string[];
    state: "offered" | "accepted" | "refused" | "withdrawn";
    contributions: { by: string; act: "offer" | "accept" | "refuse" | "withdraw"; sources: ContinuityEvidence[] }[];
  };
};
