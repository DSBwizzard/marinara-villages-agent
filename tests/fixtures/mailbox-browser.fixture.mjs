import { createHash } from "node:crypto";
import { defaultVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultRelationshipState } from "../../packages/villages/src/server/domain/rules/relationship-rules.js";
import {
  createMailboxPresentation,
  readMailboxQuery,
} from "../../packages/villages/src/server/domain/rules/mailbox-view.js";
import { villageWorldScope } from "../../packages/villages/src/server/domain/rules/village-identity.js";

/** UI fixtures keep their authored letters; their HTTP responses use the real summary/detail projection. */
export function createBrowserMailbox(village, mailbox) {
  const world = { ...defaultVillageState(), seed: "browser-mailbox", setupAt: "2026-10-30T00:00:00.000Z" };
  const scope = villageWorldScope(world);
  function presentation() {
    world.villagers = village.villagers.map((resident) => ({ ...resident, cardSnapshot: { name: resident.name } }));
    const state = defaultRelationshipState(world.seed),
      jobs = [];
    for (const thread of mailbox.threads) {
      const resident = thread.residentId;
      state.mailThreads[thread.id] = {
        id: thread.id,
        revision: thread.revision,
        participantIds: ["player", resident],
        messages: thread.messages.map((message) => {
          const sourceHash = createHash("sha256")
            .update(message.id + ":" + message.text)
            .digest("hex");
          if (message.status === "delivered")
            state.mailDeliveries[message.id] = { messageId: message.id, at: message.at, sourceHash };
          if (message.retryAvailable)
            jobs.push({ id: "job:" + message.id, subjectId: message.id, kind: "personal-mail", status: "failed" });
          return {
            ...message,
            requestId: message.id,
            toId: message.fromId === "player" ? resident : "player",
            sourceHash,
            readAt: message.read ? message.at : undefined,
            replyStatus: message.replyPending ? "pending" : "complete",
          };
        }),
      };
    }
    return createMailboxPresentation(world, state, jobs);
  }
  return {
    scope,
    page(value) {
      return presentation().mailbox(readMailboxQuery(value));
    },
    detail(threadId, messageId) {
      return presentation().letter(threadId, messageId);
    },
    ack(threadId, messageId) {
      const detail = presentation().letter(threadId, messageId);
      return { scope, threadId, messageId, token: detail.message.token };
    },
  };
}
