import { z } from "zod";
import type {
  MailboxQuery,
  MailboxView,
  PersonalLetter,
  PersonalLetterSummary,
  PersonalMailThread,
} from "../../../shared/contracts/mailbox.js";
import { legacyLetterFont } from "../../../shared/helpers/letter-font-selection.js";
import type { BackgroundSummary } from "../models/background-model.js";
import type { RelationshipState } from "../models/relationship-types.js";
import type { SocialMailMessage, SocialMailThread, WorldSocialMailOutbox } from "../models/social-mail.js";
import type { VillageState } from "../models/world.js";
import { badRequest, conflict } from "./errors.js";
import { villageWorldScope } from "./village-identity.js";
import { semanticHash } from "./semantic-contract.js";

/** A checkpoint may rewind the request-ID directory. Bind commands to the exact content the player selected. */
export function mailboxLetterIdentity(
  village: VillageState,
  state: RelationshipState,
  threadId: string,
  message: SocialMailMessage,
) {
  return semanticHash([
    villageWorldScope(village),
    threadId,
    message.id,
    message.fromId,
    message.toId,
    message.at,
    message.sourceHash ?? null,
    message.fromId === "player" ? null : (state.mailDeliveries[message.id]?.sourceHash ?? null),
    message.text,
    message.disclosures ?? [],
    message.wishDisclosures ?? [],
  ]);
}
export function mailboxRecoveryIdentity(village: VillageState, entry: WorldSocialMailOutbox) {
  return semanticHash([
    villageWorldScope(village),
    entry.id,
    entry.input.threadId,
    entry.input.sourceHash,
    entry.input.admittedAt,
    entry.result,
    entry.error,
  ]);
}

const PAGE_SIZE = 50,
  LETTER_PAGE_BYTES = 64 * 1024,
  RECOVERY_PAGE_BYTES = 16 * 1024;
type Key = [string, string, string];
type Kind = "inbox" | "sent" | "recovery";
const busy = (status?: string) => ["queued", "running", "paused"].includes(status ?? "");
const compare = (a: Key, b: Key) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i]! < b[i]! ? -1 : 1;
  return 0;
};
const cursorSchema = z
  .object({
    version: z.literal(1),
    seed: z.string(),
    setupAt: z.string(),
    shift: z.number(),
    kind: z.enum(["inbox", "sent", "recovery"]),
    after: z.tuple([z.string(), z.string(), z.string()]),
  })
  .strict();
export function readMailboxQuery(raw: unknown): MailboxQuery {
  return z
    .object({
      scope: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .optional(),
      folder: z.enum(["inbox", "sent"]).optional(),
      cursor: z.string().min(1).max(4096).optional(),
      recoveryCursor: z.string().min(1).max(4096).optional(),
    })
    .strict()
    .parse(raw ?? {});
}

/** Index retry state once; project only selected summaries or one exact authorized letter. */
export function createMailboxPresentation(village: VillageState, state: RelationshipState, jobs: BackgroundSummary[]) {
  const jobByMessage = new Map<string, BackgroundSummary>();
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
  const errors = new Map((village.socialMailOutbox ?? []).filter((row) => row.error).map((row) => [row.id, row]));
  const residents = new Map(village.villagers.map((resident) => [resident.characterId, resident]));
  const metadata = new Map<string, PersonalMailThread>();
  function threadInfo(thread: SocialMailThread) {
    if (metadata.has(thread.id)) return metadata.get(thread.id)!;
    const residentId = thread.participantIds.find((id) => id !== "player");
    if (!residentId || !thread.participantIds.includes("player")) throw badRequest("That thread is unavailable.");
    const resident = residents.get(residentId);
    const result = {
      id: thread.id,
      residentId,
      residentName: resident?.cardSnapshot.name ?? "Former resident",
      revision: thread.revision,
      letterFontId:
        resident?.letterFontId ??
        (village.formerLetterFonts && Object.hasOwn(village.formerLetterFonts, residentId)
          ? village.formerLetterFonts[residentId]
          : undefined) ??
        legacyLetterFont(residentId),
    };
    metadata.set(thread.id, result);
    return result;
  }
  function canRecover(message: SocialMailMessage | undefined, id: string) {
    return (
      !village.clock?.recovery &&
      !message?.replyUnavailable &&
      !["cancelled", "undeliverable"].includes(message?.status ?? "") &&
      !busy(jobByMessage.get(id)?.status)
    );
  }
  function summary(thread: SocialMailThread, message: SocialMailMessage) {
    const job = jobByMessage.get(message.id);
    const retryAvailable =
      canRecover(message, message.id) &&
      (errors.has(message.id) ||
        (message.admissionFailed === true && message.status === "pending" && !job) ||
        ["failed", "interrupted"].includes(job?.status ?? ""));
    let preview = "",
      characters = 0;
    if (message.fromId === "player" || message.readAt)
      for (const character of message.text) {
        if (characters++ >= 160) break;
        preview += character;
      }
    return {
      token: mailboxLetterIdentity(village, state, thread.id, message),
      id: message.id,
      fromId: message.fromId,
      preview,
      at: message.at,
      status: state.mailDeliveries[message.id] ? ("delivered" as const) : message.status,
      read: !!message.readAt,
      replyPending: message.replyStatus === "pending",
      retryAvailable,
      error:
        message.status === "undeliverable" || message.replyUnavailable
          ? message.error
          : retryAvailable
            ? "Letter processing needs attention."
            : undefined,
    };
  }
  function visible(thread: SocialMailThread, message: SocialMailMessage) {
    return (
      thread.participantIds.includes("player") &&
      (message.fromId === "player" || (message.toId === "player" && !!state.mailDeliveries[message.id]))
    );
  }
  const scope = { version: 1, seed: village.seed, setupAt: village.setupAt, shift: state.clockShiftMs ?? 0 };
  function after(value: string | undefined, kind: Kind): Key | undefined {
    if (!value) return undefined;
    let parsed: z.infer<typeof cursorSchema>;
    try {
      if (!/^[a-zA-Z0-9_-]{1,4096}$/.test(value)) throw Error();
      parsed = cursorSchema.parse(JSON.parse(Buffer.from(value, "base64url").toString("utf8")));
    } catch {
      throw badRequest("Choose a valid mailbox page.");
    }
    if (
      parsed.seed !== scope.seed ||
      parsed.setupAt !== scope.setupAt ||
      parsed.shift !== scope.shift ||
      parsed.kind !== kind
    )
      throw conflict("The mailbox changed. Open its newest page.");
    return [parsed.after[0]!, parsed.after[1]!, parsed.after[2]!];
  }
  function page<T, R>(
    rows: { key: Key; value: T }[],
    cursor: string | undefined,
    kind: Kind,
    limit: number,
    project: (value: T) => R,
  ) {
    const boundary = after(cursor, kind);
    rows.sort((a, b) => compare(b.key, a.key));
    const result: R[] = [];
    let bytes = 2,
      last: Key | undefined,
      more = false;
    for (const row of rows) {
      if (boundary && compare(row.key, boundary) >= 0) continue;
      if (result.length >= PAGE_SIZE) {
        more = true;
        break;
      }
      const value = project(row.value),
        size = Buffer.byteLength(JSON.stringify(value)) + 1;
      if (size + 2 > limit)
        throw new Error("A mailbox entry exceeds its response budget. Its saved contents are retained.");
      if (bytes + size > limit) {
        more = true;
        break;
      }
      result.push(value);
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
    const folder = query.folder ?? "inbox";
    const letters: { key: Key; value: { thread: SocialMailThread; message: SocialMailMessage } }[] = [];
    const sources = new Map<string, Map<string, SocialMailMessage>>();
    for (const thread of Object.values(state.mailThreads)) {
      const messages = new Map<string, SocialMailMessage>();
      sources.set(thread.id, messages);
      for (const message of thread.messages) {
        messages.set(message.id, message);
        if (visible(thread, message) && (folder === "sent") === (message.fromId === "player"))
          letters.push({ key: [message.at, thread.id, message.id], value: { thread, message } });
      }
    }
    const selected = page(
      letters,
      query.cursor,
      folder,
      LETTER_PAGE_BYTES,
      ({ thread, message }): PersonalLetterSummary => ({
        thread: threadInfo(thread),
        message: summary(thread, message),
      }),
    );
    const pending = [...errors.values()]
      .filter((row) => canRecover(sources.get(row.input.threadId)?.get(row.id), row.id))
      .map((row) => ({ key: [row.input.sourceAt, row.input.threadId, row.id] as Key, value: row }));
    const recovery = page(pending, query.recoveryCursor, "recovery", RECOVERY_PAGE_BYTES, (row) => ({
      token: sources.get(row.input.threadId)?.get(row.id)
        ? mailboxLetterIdentity(village, state, row.input.threadId, sources.get(row.input.threadId)!.get(row.id)!)
        : mailboxRecoveryIdentity(village, row),
      threadId: row.input.threadId,
      messageId: row.id,
      label: "Saved mail processing needs recovery.",
      reinterpretRequired: !!row.reinterpretRequired,
    }));
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
    if (!Object.hasOwn(state.mailThreads, threadId)) throw badRequest("That letter is unavailable.");
    const thread = state.mailThreads[threadId];
    const message = thread?.messages.find((row) => row.id === messageId);
    if (!thread || !message || !visible(thread, message)) throw badRequest("That letter is unavailable.");
    return {
      scope: villageWorldScope(village),
      thread: threadInfo(thread),
      message: { ...summary(thread, message), text: message.text },
    };
  }
  return { mailbox, letter };
}
