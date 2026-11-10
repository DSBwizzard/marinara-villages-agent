import { z } from "zod";
import type {
  MailboxQuery,
  MailboxView,
  PersonalLetter,
  PersonalLetterSummary,
} from "../../../shared/contracts/mailbox.js";
import type { BackgroundSummary } from "../models/background-model.js";
import type { MailboxMessage, MailboxState } from "../models/social-mail.js";
import type { VillageState } from "../models/world.js";
import { badRequest, conflict } from "./errors.js";
import { villageWorldScope } from "./village-identity.js";
import { memoryHash } from "./memory-integrity.js";

const peer = (message: MailboxMessage) => (message.from.id === "player" ? message.to : message.from);
export const mailboxThreadId = (residentId: string) => "personal:" + residentId;
export function mailboxLetterIdentity(
  village: VillageState,
  _state: MailboxState,
  threadId: string,
  message: MailboxMessage,
) {
  return memoryHash([
    villageWorldScope(village),
    threadId,
    message.id,
    message.at,
    message.from,
    message.to,
    message.text,
    message.reading ?? null,
  ]);
}
export function hasUnreadMail(state: MailboxState | undefined) {
  return (
    !!state &&
    Object.values(state.messages).some(
      (message) => message.to.id === "player" && message.status === "delivered" && !message.readAt,
    )
  );
}
const scopeId = z.string().regex(/^[a-f0-9]{64}$/);
export function readMailboxQuery(raw: unknown): MailboxQuery {
  return z
    .object({
      scope: scopeId.optional(),
      folder: z.enum(["inbox", "sent"]).optional(),
      cursor: z.string().min(1).max(4096).optional(),
      recoveryCursor: z.string().min(1).max(4096).optional(),
    })
    .strict()
    .parse(raw ?? {});
}
const cursor = z
  .object({
    version: z.literal(1),
    seed: z.string(),
    setupAt: z.string(),
    kind: z.enum(["inbox", "sent", "recovery"]),
    after: z.tuple([z.string(), z.string(), z.string()]),
  })
  .strict();
type Key = [string, string, string];
type Kind = "inbox" | "sent" | "recovery";
const compare = (a: Key, b: Key) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
  return 0;
};
const busy = (status: string) => ["queued", "running", "paused"].includes(status);

/** Native letters own delivery; threads and bounded UI pages are projections, never fictional relationship state. */
export function createMailboxPresentation(village: VillageState, state: MailboxState, jobs: BackgroundSummary[]) {
  const scope = { version: 1 as const, seed: village.seed, setupAt: village.setupAt },
    jobByMessage = new Map<string, BackgroundSummary>();
  for (const job of jobs) {
    if (job.kind !== "personal-mail") continue;
    const prior = jobByMessage.get(job.subjectId);
    if (
      !prior ||
      (busy(job.status) && !busy(prior.status)) ||
      (busy(job.status) === busy(prior.status) && (job.updatedAt ?? "") > (prior.updatedAt ?? ""))
    )
      jobByMessage.set(job.subjectId, job);
  }
  const visible = (message: MailboxMessage) =>
    message.from.id === "player" || (message.to.id === "player" && message.status === "delivered");
  function threadInfo(message: MailboxMessage) {
    const party = peer(message),
      resident = village.villagers.find(
        (resident) => resident.characterId === party.id && resident.incarnation === party.incarnation,
      );
    const letterFontId = resident?.letterFontId ?? village.formerLetterFonts?.[party.id];
    if (letterFontId === undefined) throw conflict("This correspondent has no writing-style assignment.");
    return {
      id: mailboxThreadId(party.id),
      residentId: party.id,
      residentName: resident?.cardSnapshot.name ?? "Former resident",
      ...(!resident ? { former: true as const } : {}),
      letterFontId,
      revision: state.revision,
    };
  }
  function canRecover(message: MailboxMessage) {
    const job = jobByMessage.get(message.id);
    return (
      message.status === "pending" &&
      (!job || !busy(job.status)) &&
      (message.admissionFailed === true || (!!job && ["failed", "interrupted"].includes(job.status)))
    );
  }
  function summary(message: MailboxMessage) {
    const job = jobByMessage.get(message.id),
      retryAvailable = canRecover(message),
      known = message.from.id === "player" || !!message.readAt;
    return {
      token: mailboxLetterIdentity(village, state, mailboxThreadId(peer(message).id), message),
      id: message.id,
      fromId: message.from.id,
      preview: known ? [...message.text].slice(0, 160).join("") : "",
      at: message.at,
      status: message.status,
      read: !!message.readAt,
      replyPending:
        message.from.id === "player" &&
        message.status === "pending" &&
        (!job || !["failed", "interrupted"].includes(job.status)),
      retryAvailable,
      error:
        message.status === "undeliverable"
          ? message.error
          : retryAvailable
            ? "Letter processing needs attention."
            : undefined,
    };
  }
  function page<T, R>(
    rows: { key: Key; value: T }[],
    value: string | undefined,
    kind: Kind,
    limit: number,
    project: (value: T) => R,
  ) {
    let after: Key | undefined;
    if (value) {
      try {
        if (!/^[a-zA-Z0-9_-]{1,4096}$/.test(value)) throw Error();
        const parsed = cursor.parse(JSON.parse(Buffer.from(value, "base64url").toString("utf8")));
        if (parsed.seed !== scope.seed || parsed.setupAt !== scope.setupAt || parsed.kind !== kind)
          throw conflict("The Mailbox changed. Open its newest page.");
        after = [parsed.after[0]!, parsed.after[1]!, parsed.after[2]!];
      } catch (error) {
        if (error instanceof Error && "statusCode" in error) throw error;
        throw badRequest("Choose a valid Mailbox page.");
      }
    }
    rows.sort((a, b) => compare(b.key, a.key));
    const result: R[] = [];
    let bytes = 2,
      last: Key | undefined,
      more = false;
    for (const row of rows) {
      if (after && compare(row.key, after) >= 0) continue;
      if (result.length >= 50) {
        more = true;
        break;
      }
      const projected = project(row.value),
        size = Buffer.byteLength(JSON.stringify(projected)) + 1;
      if (size + 2 > limit)
        throw new Error("A Mailbox entry exceeds its response budget. Its saved contents are retained.");
      if (bytes + size > limit) {
        more = true;
        break;
      }
      result.push(projected);
      bytes += size;
      last = row.key;
    }
    return {
      rows: result,
      next:
        more && last ? Buffer.from(JSON.stringify({ ...scope, kind, after: last })).toString("base64url") : undefined,
    };
  }
  function mailbox(query: MailboxQuery): MailboxView {
    const folder = query.folder ?? "inbox",
      letters = Object.values(state.messages).filter(
        (message) => visible(message) && (folder === "sent") === (message.from.id === "player"),
      ),
      key = (message: MailboxMessage): Key => [message.at, mailboxThreadId(peer(message).id), message.id],
      selected = page(
        letters.map((message) => ({ key: key(message), value: message })),
        query.cursor,
        folder,
        64 * 1024,
        (message): PersonalLetterSummary => ({ thread: threadInfo(message), message: summary(message) }),
      ),
      pending = Object.values(state.messages).filter(canRecover),
      recovery = page(
        pending.map((message) => ({ key: key(message), value: message })),
        query.recoveryCursor,
        "recovery",
        16 * 1024,
        (message) => ({
          token: summary(message).token,
          threadId: mailboxThreadId(peer(message).id),
          messageId: message.id,
          label: "Letter processing needs attention.",
          reinterpretRequired: false,
        }),
      );
    return {
      scope: villageWorldScope(village),
      folder,
      letters: selected.rows,
      total: letters.length,
      nextCursor: selected.next,
      recovery: recovery.rows,
      recoveryTotal: pending.length,
      recoveryNextCursor: recovery.next,
    };
  }
  function letter(threadId: string, messageId: string): PersonalLetter {
    const message = Object.hasOwn(state.messages, messageId) ? state.messages[messageId] : undefined;
    if (!message || mailboxThreadId(peer(message).id) !== threadId || !visible(message))
      throw badRequest("That letter is unavailable.");
    return {
      scope: villageWorldScope(village),
      thread: threadInfo(message),
      message: { ...summary(message), text: message.from.id === "player" || message.readAt ? message.text : "" },
    };
  }
  return { mailbox, letter };
}
