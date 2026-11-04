import type { VillageState } from "../../packages/villages/src/server/domain/models/world.js";
import type { SocialMailService } from "../../packages/villages/src/server/features/residents/social-mail-service.js";
import type { PersonalLetter } from "../../packages/villages/src/shared/contracts/mailbox.js";
import {
  mailboxLetterIdentity,
  mailboxRecoveryIdentity,
} from "../../packages/villages/src/server/domain/rules/mailbox-view.js";
import { villageWorldScope } from "../../packages/villages/src/server/domain/rules/village-identity.js";

/** Functional correspondence assertions can inspect retained history by following the real public pages/details. */
export function correspondenceTestClient(core: SocialMailService, snapshot: () => Promise<VillageState>) {
  async function identity(threadId: string, messageId: string) {
    const village = await snapshot(),
      state = village.relationshipContext!;
    const message = state.mailThreads[threadId]?.messages.find((row) => row.id === messageId);
    const entry = village.socialMailOutbox?.find((row) => row.id === messageId && row.input.threadId === threadId);
    return {
      scope: villageWorldScope(village),
      token: message
        ? mailboxLetterIdentity(village, state, threadId, message)
        : entry
          ? mailboxRecoveryIdentity(village, entry)
          : "0".repeat(64),
    };
  }
  return {
    ...core,
    async send(value: any, threadId?: string) {
      return core.send({ ...value, scope: villageWorldScope(await snapshot()) }, threadId);
    },
    async readLetter(threadId: string, messageId: string) {
      const { scope, token } = await identity(threadId, messageId);
      return core.readLetter(threadId, messageId, scope, token);
    },
    async retry(threadId: string, messageId: string, requestId: string) {
      const { scope, token } = await identity(threadId, messageId);
      return core.retry(threadId, messageId, requestId, scope, token);
    },
    async readMailbox() {
      const village = await snapshot(),
        scope = villageWorldScope(village);
      const letters: PersonalLetter[] = [];
      const first = await core.readMailbox({ scope });
      const recovery = [...first.recovery];
      let recoveryCursor = first.recoveryNextCursor;
      while (recoveryCursor) {
        const page = await core.readMailbox({ scope, recoveryCursor });
        recovery.push(...page.recovery);
        recoveryCursor = page.recoveryNextCursor;
      }
      for (const folder of ["inbox", "sent"] as const) {
        let page = folder === "inbox" ? first : await core.readMailbox({ scope, folder });
        while (true) {
          for (const row of page.letters)
            letters.push(await core.getLetter(row.thread.id, row.message.id, scope, row.message.token));
          if (!page.nextCursor) break;
          page = await core.readMailbox({ scope, folder, cursor: page.nextCursor });
        }
      }
      const threads = Object.values((await snapshot()).relationshipContext!.mailThreads).flatMap((thread) => {
        const found = letters.filter((row) => row.thread.id === thread.id);
        if (!found.length) return [];
        const order = new Map(thread.messages.map((row, index) => [row.id, index]));
        return [
          {
            ...found[0].thread,
            messages: found.map((row) => row.message).sort((a, b) => order.get(a.id)! - order.get(b.id)!),
          },
        ];
      });
      return { threads, recovery };
    },
  };
}
