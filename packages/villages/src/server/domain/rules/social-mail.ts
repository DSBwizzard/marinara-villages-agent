import type { RelationshipReview, RelationshipState } from "../models/relationship-types.js";
import type { SocialMailMessage, SocialMailThread } from "../models/social-mail.js";
import { badRequest, conflict } from "./errors.js";

export const personalThreadId = (residentId: string) => "personal:" + residentId;
export function queuePersonalMessage(
  state: RelationshipState,
  residentId: string,
  requestId: string,
  text: string,
  at: string,
): SocialMailMessage {
  if (!/^[a-zA-Z0-9_-]{1,200}$/.test(requestId) || !text.trim() || text.length > 4000)
    throw badRequest("Write a message of up to 4,000 characters.");
  const threadId = personalThreadId(residentId);
  const thread = (state.mailThreads[threadId] ??= {
    id: threadId,
    participantIds: ["player", residentId],
    revision: 0,
    messages: [],
  });
  const prior = Object.values(state.mailThreads)
    .flatMap((row) => row.messages)
    .find((row) => row.requestId === requestId && row.fromId === "player");
  if (prior) {
    if (prior.text !== text || prior.toId !== residentId)
      throw conflict("This request ID already belongs to a different message.");
    return prior;
  }
  if (
    thread.messages.some(
      (row) => row.status === "pending" || row.status === "applying" || row.replyStatus === "pending",
    )
  )
    throw conflict("Finish or recover the pending message before sending another.");
  const message: SocialMailMessage = {
    id: threadId + ":" + requestId,
    requestId,
    fromId: "player",
    toId: residentId,
    text,
    at,
    status: "pending",
  };
  thread.messages.push(message);
  thread.revision++;
  return message;
}
export function requireMailSource(
  state: RelationshipState,
  threadId: string,
  messageId: string,
): { thread: SocialMailThread; message: SocialMailMessage } {
  const thread = state.mailThreads[threadId],
    message = thread?.messages.find((row) => row.id === messageId);
  if (!thread || !message || !thread.participantIds.includes("player"))
    throw badRequest("That personal message is unavailable.");
  return { thread, message };
}
export function beginMailDelivery(state: RelationshipState, threadId: string, messageId: string): void {
  const { message } = requireMailSource(state, threadId, messageId);
  if (["cancelled", "undeliverable"].includes(message.status))
    throw conflict("This letter can no longer be delivered.");
  if (state.mailDeliveries[messageId]) return;
  message.status = "applying";
}
export function completeMailDelivery(
  state: RelationshipState,
  threadId: string,
  messageId: string,
  sourceHash: string,
  at: string,
): void {
  const { thread, message } = requireMailSource(state, threadId, messageId);
  if (state.mailDeliveries[messageId]) return;
  if (message.status !== "applying") throw conflict("The delivery was not admitted.");
  state.mailDeliveries[messageId] = { messageId, sourceHash, at };
  message.status = "delivered";
  message.replyStatus = "pending";
  message.error = undefined;
  thread.revision++;
}
/** Reading applies already interpreted information, never a model call or a fictional read receipt. */
export function readPersonalThread(
  state: RelationshipState,
  threadId: string,
  at: string,
  messageIds?: readonly string[],
): void {
  const thread = state.mailThreads[threadId];
  if (!thread || !thread.participantIds.includes("player")) throw badRequest("That thread is unavailable.");
  for (const message of thread.messages) {
    if (
      message.toId !== "player" ||
      !state.mailDeliveries[message.id] ||
      message.readAt ||
      (messageIds && !messageIds.includes(message.id))
    )
      continue;
    message.readAt = at;
  }
}
export const withoutMailDisclosures = (review: RelationshipReview): RelationshipReview => ({
  ...review,
  disclosures: [],
});
