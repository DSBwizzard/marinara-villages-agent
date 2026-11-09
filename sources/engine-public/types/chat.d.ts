
/** The three primary chat modes the engine supports. */
export type ChatMode = "conversation" | "roleplay" | "game";

export type ConversationPresenceStatus = "online" | "idle" | "dnd" | "offline";

/** Role of a message in the conversation. */
export type MessageRole = "user" | "assistant" | "system" | "narrator";

/** A single day's auto-generated conversation summary. */
export interface DaySummaryEntry {
    /** Narrative recap of the day. */
    summary: string;
    /** Short strings the characters must remember going forward. */
    keyDetails: string[];
}

/** A single week's consolidated conversation summary (Monday → Sunday). */
export interface WeekSummaryEntry {
    /** Narrative recap of the week. */
    summary: string;
    /** Consolidated key details the characters must remember going forward. */
    keyDetails: string[];
}

/** Rolling summary entry category. Extensible beyond rolling summaries later. */
export type ChatSummaryEntryKind = "rolling";

/** Whether a rolling summary entry was user-created, agent-created, or migrated from the legacy blob. */
export type ChatSummaryEntryOrigin = "manual" | "automated" | "legacy";

/** Source selector used to create a rolling summary entry. */
export type ChatSummaryEntrySource = "last" | "range" | "agent";

/** A single structured rolling chat summary entry. */
export interface ChatSummaryEntry {
    id: string;
    kind: ChatSummaryEntryKind;
    origin: ChatSummaryEntryOrigin;
    title: string;
    content: string;
    enabled: boolean;
    sourceMode: ChatSummaryEntrySource;
    messageCount?: number;
    rangeStartIndex?: number;
    rangeEndIndex?: number;
    messageIds?: string[];
    /**
     * The exact messages this entry hid from AI when "Hide summarised messages" was
     * on (the summarized set minus the protected tail). Persisted so deletion can
     * restore precisely what was hidden, rather than assuming it equals messageIds.
     * Absent on entries created before this field or when nothing was hidden.
     */
    hiddenMessageIds?: string[];
    promptTemplateId?: string | null;
    tokenEstimate: number;
    createdAt: string;
    updatedAt: string;
}
