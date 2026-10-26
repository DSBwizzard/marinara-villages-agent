import type { RelationshipDisclosure, RelationshipReview } from "./relationship-types.js";
export type SocialMailMessage = {
  id: string;
  requestId: string;
  fromId: string;
  toId: string;
  text: string;
  at: string;
  status: "pending" | "applying" | "delivered" | "cancelled";
  sourceHash?: string;
  incarnation?: string;
  readAt?: string;
  replyTo?: string;
  replyStatus?: "pending" | "complete";
  disclosures?: RelationshipDisclosure[];
  error?: string;
};
export type SocialMailThread = {
  id: string;
  participantIds: string[];
  revision: number;
  messages: SocialMailMessage[];
};
export type SocialInvitation = {
  id: string;
  threadId: string;
  messageId: string;
  proposerId: string;
  participantIds: string[];
  revision: number;
  terms: {
    title: string;
    detail: string;
    venueId: string;
    zoneId: string;
    dueAt?: string;
    visitAccess?: { accompanied: boolean; outsideHours: boolean };
  };
  status: "proposed" | "accepted" | "declined" | "cancelled" | "fulfilled";
  respondedAt?: string;
  response?: {
    id: string;
    actorId: "player";
    expectedRevision: number;
    accepted: boolean;
    at: string;
    messageId: string;
    sourceHash: string;
    terms: SocialInvitation["terms"];
  };
};
export type SocialMailInterpretation = {
  source: RelationshipReview;
  reply: RelationshipReview;
  replyText: string;
  invitation?: SocialInvitation["terms"];
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
  sourceDelivered: boolean;
};
export type SocialMailOutbox = {
  id: string;
  input: SocialMailInput;
  result: SocialMailInterpretation;
  error?: string;
  reinterpretRequired?: boolean;
};
