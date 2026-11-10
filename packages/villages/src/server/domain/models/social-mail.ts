import type { RelationshipDisclosure, RelationshipHead, RelationshipReview } from "./relationship-types.js";
import type { CapturedAdmission } from "./captured-admission-model.js";
import type { ContinuityAdmission, ContinuityEvidence, ContinuityTarget } from "./continuity-model.js";
export type MailCapture = {
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
  prompt: {
    entries: Record<string, unknown>[];
    history: unknown;
    protections: ReturnType<typeof import("../rules/continuity.js").continuityConstraints>;
  };
};
export type MailContinuityPlan = {
  setupAt: string;
  admission: Omit<ContinuityAdmission, "continuityRevision" | "protectionFingerprint" | "room" | "blockedSources"> & {
    continuityRevision: number;
    protectionFingerprint: string;
  };
  historical: Record<string, ContinuityEvidence>;
  keep: unknown[];
  requires: string[];
  responseDigest: string;
};
export type MailboxMessage = {
  id: string;
  requestId: string;
  at: string;
  from: { id: string; incarnation: string };
  to: { id: string; incarnation: string };
  text: string;
  status: "pending" | "delivered" | "cancelled" | "undeliverable";
  deliveredAt?: string;
  readAt?: string;
  replyTo?: string;
  error?: string;
  admissionFailed?: true;
  reading?: MailContinuityPlan;
};
export type MailboxState = {
  format: 1;
  revision: number;
  messages: Record<string, MailboxMessage>;
};
export type SocialMailMessage = {
  id: string;
  requestId: string;
  fromId: string;
  toId: string;
  text: string;
  at: string;
  status: "pending" | "applying" | "delivered" | "cancelled" | "undeliverable";
  sourceHash?: string;
  incarnation?: string;
  readAt?: string;
  replyTo?: string;
  replyStatus?: "pending" | "complete";
  disclosures?: RelationshipDisclosure[];
  wishDisclosures?: import("../../../shared/contracts/wishes.js").WishDisclosure[];
  error?: string;
  admissionFailed?: boolean;
  replyUnavailable?: boolean;
};
export type SocialMailThread = {
  id: string;
  participantIds: string[];
  revision: number;
  messages: SocialMailMessage[];
};
export type SocialMailInterpretation = {
  source: RelationshipReview;
  reply: RelationshipReview;
  replyText: string;
  sourceMemoryChanges?: unknown[];
  sourceWishChanges?: unknown[];
  replyWishChanges?: unknown[];
  replyMemoryChanges?: unknown[];
};
export type SocialMailInput = {
  mode?: "player" | "resident";
  seed: string;
  threadId: string;
  messageId: string;
  residentId: string;
  sourceText: string;
  sourceAt: string;
  admittedAt?: string;
  sourceHash: string;
  incarnation: string;
  admitted: import("./world.js").VillageState;
  retainedReply?: string;
  systemMemory?: ReturnType<typeof import("../rules/scene-memories.js").sceneMemoryContext>;
  sourceDelivered: boolean;
};
export type SocialMailOutbox = {
  id: string;
  input: SocialMailInput;
  result: SocialMailInterpretation;
  error?: string;
  reinterpretRequired?: boolean;
  retryClaim?: string;
  retryAdmitted?: string;
};
export type CapturedSocialMailInput = Omit<SocialMailInput, "admitted"> & {
  admitted: CapturedAdmission<SocialMailInput["admitted"]> & { relationshipHead: RelationshipHead | null };
};
export type WorldSocialMailOutbox = Omit<SocialMailOutbox, "input"> & {
  input: SocialMailInput | CapturedSocialMailInput;
};
