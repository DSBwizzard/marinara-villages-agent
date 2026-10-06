export declare const ROLEPLAY_COMMAND_KEYS: readonly ["illustrate", "document", "sound", "music", "notes", "memory", "roll", "combat", "dm", "interrupt", "whisper"];
export type RoleplayCommandKey = (typeof ROLEPLAY_COMMAND_KEYS)[number];
export type RoleplayCommandToggles = Partial<Record<RoleplayCommandKey, boolean>>;
export type RoleplayCommandAudience = "all" | "narrator";
export type RoleplayPrivateCommand = {
    type: "notes";
    content: string;
} | {
    type: "dismiss_notes";
} | {
    type: "memory";
    id: string;
    content: string;
} | {
    type: "dismiss_memory";
    id: string;
};
export interface RoleplayDocument {
    type: string;
    title: string;
    content: string;
}
export type RoleplayCommand = RoleplayPrivateCommand | {
    type: "illustrate";
    subject: string;
    characters?: string[];
} | {
    type: "document";
    documentType: string;
    title: string;
    content: string;
} | {
    type: "sound";
    description: string;
} | {
    type: "music";
    mood: string;
} | {
    type: "roll";
    notation: string;
    reason: string;
    character?: string;
    attribute?: string;
    modifier?: number;
    dc?: number;
} | {
    type: "combat";
} | {
    type: "dm";
    character: string;
    message: string;
} | {
    type: "whisper";
    character: string;
    text: string;
} | {
    type: "interrupt";
    part: string;
};
export interface RoleplayWhisperRecipient {
    id: string;
    kind: "character" | "persona";
}
export interface RoleplayCommandActivity {
    command: RoleplayCommand;
    /** Original command text, kept separate from the user's editable context. */
    raw: string;
    deleted?: boolean;
    error?: string;
    result?: string;
    /** Saved presentation choices belong to this command occurrence and message swipe. */
    documentStyle?: number;
    contentOffset?: number;
    /** Adjacent text before the inline command, or after it when contentOffset is zero. */
    contentAnchor?: string;
    /** Resolve once so a rename cannot redirect a saved secret. */
    whisperRecipient?: RoleplayWhisperRecipient;
    /** Exact before/after text makes interruption reversible without overwriting later edits. */
    interruption?: {
        targetMessageId: string;
        targetSwipeIndex: number;
        targetSwipeId?: string;
        originalContent: string;
        interruptedContent: string;
        restored?: boolean;
    };
}
/** Read current records, or reconstruct editable context from older message extras. */
export declare function getRoleplayCommandActivity(extra: Record<string, unknown>): RoleplayCommandActivity[];
export declare function getRoleplayPrivateCommands(extra: Record<string, unknown>): RoleplayPrivateCommand[];
export declare function getRoleplayDocuments(extra: Record<string, unknown>): RoleplayDocument[];
export declare function getRoleplayWhispers(extra: Record<string, unknown>): {
    activity: RoleplayCommandActivity;
    index: number;
    command: {
        type: "whisper";
        character: string;
        text: string;
    };
    recipient: RoleplayWhisperRecipient;
}[];
/** Keep an inline result near its original text after edits; ambiguous anchors fall back to the end. */
export declare function getRoleplayCommandContentOffset(text: string, item: RoleplayCommandActivity): number;
export declare function roleplayCommandsEnabled(metadata: Record<string, unknown>): boolean;
export declare function isRoleplayCommandEnabled(metadata: Record<string, unknown>, key: RoleplayCommandKey): boolean;
/** A narrator-only command needs an unambiguous, current participant as its caller. */
export declare function isRoleplayCommandAllowed(metadata: Record<string, unknown>, key: RoleplayCommandKey, characterId: string | null | undefined): boolean;
//# sourceMappingURL=roleplay-command.d.ts.map