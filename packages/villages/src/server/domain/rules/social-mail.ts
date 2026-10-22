import type { RelationshipState, RelationshipReview } from "../models/relationship-types.js";
import type { SocialMailMessage, SocialMailThread } from "../models/social-mail.js";
import { conflict, badRequest } from "./errors.js";
import { relationshipFor, relationshipKey } from "./relationship-rules.js";

export const personalThreadId = (residentId: string) => "personal:" + residentId;
export function queuePersonalMessage(
  state: RelationshipState,
  residentId: string,
  requestId: string,
  text: string,
  at: string,
): SocialMailMessage {
  if (!requestId || requestId.length > 200 || !text.trim() || text.length > 4000)
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
/** Cancel and the applying fence share the same CAS document. Only one can win. */
export function cancelPersonalMessage(state: RelationshipState, threadId: string, messageId: string): void {
  const { thread, message } = requireMailSource(state, threadId, messageId);
  if (state.mailDeliveries[messageId] || message.status === "delivered")
    throw conflict("This message has already been delivered.");
  if (message.status === "applying") throw conflict("Delivery needs local recovery before this message can change.");
  if (message.status === "cancelled") return;
  message.status = "cancelled";
  thread.revision++;
}
export function beginMailDelivery(state: RelationshipState, threadId: string, messageId: string): void {
  const { message } = requireMailSource(state, threadId, messageId);
  if (message.status === "cancelled") throw conflict("This message was cancelled.");
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
export function readPersonalThread(state: RelationshipState, threadId: string, at: string): void {
  const thread = state.mailThreads[threadId];
  if (!thread || !thread.participantIds.includes("player")) throw badRequest("That thread is unavailable.");
  for (const message of thread.messages) {
    if (message.toId !== "player" || !state.mailDeliveries[message.id] || message.readAt) continue;
    for (const disclosure of message.disclosures ?? []) {
      state.disclosures[disclosure.id] = { ...disclosure, at: message.at, sourceId: message.id };
      state.applied[disclosure.id] = true;
    }
    message.readAt = at;
  }
}
export const withoutMailDisclosures = (review: RelationshipReview): RelationshipReview => ({
  ...review,
  disclosures: [],
});
/** UI acceptance records the exact immutable terms; it invents no player dialogue, travel or private feelings. */
export function respondSocialInvitation(
  state: RelationshipState,
  id: string,
  revision: number,
  accepted: boolean,
  now: string,
): void {
  const invitation = state.invitations[id];
  if (!invitation || invitation.revision !== revision || invitation.status !== "proposed")
    throw conflict("This invitation changed. Refresh it before deciding.");
  if (invitation.terms.dueAt && Date.parse(invitation.terms.dueAt) <= Date.parse(now))
    throw conflict("This invitation has expired. Ask to reschedule.");
  if (!state.mailDeliveries[invitation.messageId]) throw conflict("This invitation has not been delivered.");
  invitation.status = accepted ? "accepted" : "declined";
  invitation.respondedAt = now;
  invitation.revision++;
  if (!accepted) return;
  const edge = structuredClone(relationshipFor(state, invitation.proposerId, "player"));
  edge.records[id] = {
    id,
    revision: 1,
    kind: "commitment",
    text: invitation.terms.detail,
    participants: invitation.participantIds,
    status: "accepted",
    dueAt: invitation.terms.dueAt,
    evidenceIds: [invitation.messageId, id + ":accept"],
  };
  state.sharedRecords[id] = structuredClone(edge.records[id]!);
  edge.revision++;
  edge.updatedAt = now;
  state.edges[relationshipKey(invitation.proposerId, "player")] = edge;
}
