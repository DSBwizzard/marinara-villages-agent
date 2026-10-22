import type { RelationshipDisclosure, RelationshipReview } from "./relationship-types.js";
export type SocialMailMessage = {
  id: string;
  requestId: string;
  fromId: string;
  toId: string;
  text: string;
  at: string;
  status: "pending" | "applying" | "delivered" | "cancelled";
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
  terms: { title: string; detail: string; venueId: string; zoneId: string; dueAt?: string };
  status: "proposed" | "accepted" | "declined" | "cancelled" | "fulfilled";
  respondedAt?: string;
};
export type SocialMailInterpretation = {
  source: RelationshipReview;
  reply: RelationshipReview;
  replyText: string;
  invitation?: SocialInvitation["terms"];
};
