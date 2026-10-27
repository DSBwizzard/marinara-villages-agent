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
export type SocialMailInterpretation = {
  source: RelationshipReview;
  reply: RelationshipReview;
  replyText: string;
  sourceMemoryChanges?: unknown[];
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
  narrationMemories?: string;
  systemMemory?: ReturnType<typeof import("../rules/scene-memories.js").sceneMemoryContext>;
  sourceDelivered: boolean;
};
export type SocialMailOutbox = {
  id: string;
  input: SocialMailInput;
  result: SocialMailInterpretation;
  error?: string;
  reinterpretRequired?: boolean;
};
