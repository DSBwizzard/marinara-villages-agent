/** Most messages one chat may pin into its prompt context. */
export declare const MAX_PINNED_CONTEXT_MESSAGES = 10;
export declare const MAX_BOOKMARK_LABEL_LENGTH = 80;
export declare const MAX_PRIVATE_NOTE_LENGTH = 2000;
/** Trashed messages older than this are purged automatically. */
export declare const MESSAGE_TRASH_RETENTION_DAYS = 30;
/** Line prefixed to a pinned message that was restored from outside the context message limit. */
export declare const PINNED_CONTEXT_MESSAGE_MARKER = "[Pinned message from earlier in the chat]";
export interface MessageBookmark {
    /** Optional short user label shown in the Bookmarks list. */
    label?: string | null;
    createdAt: string;
}
/** Extra keys that belong to the whole message, not one swipe. */
export declare const MESSAGE_MARK_EXTRA_KEYS: readonly ["bookmark", "pinnedToContext", "privateNote", "privateNoteRecipientId"];
export declare function readMessageBookmark(extra: unknown): MessageBookmark | null;
export declare function isMessagePinnedToContext(extra: unknown): boolean;
export declare function readMessagePrivateNote(extra: unknown): string | null;
/** The one character the user shared this message's note with, or null while it stays private. */
export declare function readMessagePrivateNoteRecipientId(extra: unknown): string | null;
/**
 * Validate a client patch for the mark keys. Returns the normalized patch, or an
 * error string. Keys other than the mark keys pass through untouched.
 */
export declare function normalizeMessageMarkPatch(partial: Record<string, unknown>, now?: () => string): {
    patch: Record<string, unknown>;
} | {
    error: string;
};
/** Remove the private note from an extra record (exports, copies shared with others). */
export declare function stripPrivateMessageNote<T extends Record<string, unknown>>(extra: T): T;
/**
 * Apply a chat's context message limit while keeping pinned messages.
 *
 * Returns the last `limit` messages, preceded by up to `maxPinned` of the newest pinned
 * messages that the limit would have dropped. Those restored rows are shallow copies with
 * {@link PINNED_CONTEXT_MESSAGE_MARKER} prefixed to their content so the model can tell the
 * history skips ahead after them; everything else is returned by reference. Chronological
 * order is preserved because every restored row predates the kept window.
 */
export declare function applyContextMessageLimitWithPins<T extends {
    content?: unknown;
    extra?: unknown;
}>(messages: readonly T[], limit: number | null | undefined, maxPinned?: number): T[];
/** A message moved to its chat's trash (list view; the stored snapshot stays server-side). */
export interface MessageTrashEntry {
    id: string;
    chatId: string;
    messageId: string;
    role: "user" | "assistant" | "system" | "narrator";
    characterId: string | null;
    /** Active swipe content at deletion time. */
    content: string;
    swipeCount: number;
    messageCreatedAt: string;
    deletedAt: string;
    /** When the automatic purge removes this entry. */
    expiresAt: string;
}
//# sourceMappingURL=message-marks.d.ts.map