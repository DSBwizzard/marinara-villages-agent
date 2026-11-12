import type {
  ContinuityAdmission,
  ContinuityCapture,
  ContinuityEvidence,
  ContinuityHolder,
} from "./continuity-model.js";
export type MailRoomContext = {
  holder: Extract<ContinuityHolder, { kind: "room" }>;
  provenance: string[];
  fingerprint: string;
  protectedRoots: string[];
};
export type MailContinuityPlan = {
  setupAt: string;
  admission: Omit<ContinuityAdmission, "continuityRevision" | "protectionFingerprint" | "room" | "blockedSources"> & {
    continuityRevision: number;
    protectionFingerprint: string;
  };
  historical: Record<string, ContinuityEvidence>;
  keep: unknown[];
  offered: import("./episode-model.js").AcceptedEpisode["offered"];
  requires: string[];
  responseDigest: string;
  roomContext?: MailRoomContext;
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
export type PersonalMailInput = {
  seed: string;
  setupAt: string;
  residentId: string;
  incarnation: string;
  incoming: {
    id: string;
    at: string;
    from: { id: string; incarnation: string };
    to: { id: string; incarnation: string };
    text: string;
    requestId: string;
  };
  capture: ContinuityCapture;
  identity: string;
  residentName: string;
};
export type PersonalMailResult = {
  replyText: string;
  incomingMeaning: { keep: unknown[]; requires: string[] };
  replyMeaning: { keep: unknown[]; requires: string[] };
  responseDigest: string;
};
