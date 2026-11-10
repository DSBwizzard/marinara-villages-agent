import { defaultVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
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
    world.villagers = village.villagers.map((resident) => ({
      ...resident,
      incarnation: "browser:" + resident.characterId,
      cardSnapshot: { name: resident.name },
    }));
    const state = { format: 1, revision: 1, messages: {} },
      jobs = [];
    for (const thread of mailbox.threads) {
      const resident = thread.residentId;
      for (const message of thread.messages) {
        if (message.retryAvailable)
          jobs.push({ id: "job:" + message.id, subjectId: message.id, kind: "personal-mail", status: "failed" });
        state.messages[message.id] = {
          id: message.id,
          at: message.at,
          text: message.text,
          status: message.status,
          requestId: message.id,
          from: {
            id: message.fromId,
            incarnation: message.fromId === "player" ? "browser-player" : "browser:" + resident,
          },
          to: {
            id: message.fromId === "player" ? resident : "player",
            incarnation: message.fromId === "player" ? "browser:" + resident : "browser-player",
          },
          deliveredAt: message.status === "delivered" ? message.at : undefined,
          readAt: message.read ? message.at : undefined,
        };
      }
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
