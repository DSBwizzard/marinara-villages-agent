import type { MariPermissionsMode } from "../constants/mari-permissions-mode.js";
export type MariWorkspaceToolName = "docs_search" | "docs_read" | "read" | "grep" | "find" | "ls" | "edit" | "write" | "copy" | "move" | "remove" | "bash" | "dependency" | "app_data" | "package_service";
export type MariChipEntity = "characters" | "lorebooks" | "personas" | "presets" | "connections" | "agents" | "settings" | "chat";
export type MariChipTone = "default" | "danger" | "caution" | "success";
export interface MariSuggestionChip {
    id: string;
    label: string;
    prompt: string;
    entity?: MariChipEntity;
    icon?: string;
    tone?: MariChipTone;
}
/**
 * #5748: the Accept action for a deferred (held) mutation. Shared so the
 * server's deferral event and the client's persisted-deferral re-derivation
 * (from the mariDeferredMutations message extra) can never drift.
 */
export declare const MARI_AUTHORIZATION_ACCEPT_CHIP: MariSuggestionChip;
/**
 * #5820: the matching refusal. Held commands are never executed unless the
 * user accepts, so declining is just a reply - but without a control for it
 * the only way to say no was to compose a sentence, which is why users
 * reported seeing "nowhere to apply or revert".
 */
export declare const MARI_AUTHORIZATION_DECLINE_CHIP: MariSuggestionChip;
/**
 * The workspace agent reuses the id "authorization-accept" for an unrelated
 * output-limit chip ("Continue the task."), so the id alone cannot tell a
 * held-change approval from a keep-going prompt. Matching the prompt too
 * keeps the approval wording and the decline action off rows where nothing
 * is actually held.
 */
export declare function isMariHeldChangeApprovalChip(chip: MariSuggestionChip): boolean;
/** Pairs a held-change Accept with its decline action, exactly once. */
export declare function withHeldChangeDeclineChip(chips: MariSuggestionChip[]): MariSuggestionChip[];
export declare const MARI_STARTER_CHIPS: MariSuggestionChip[];
/**
 * Models frequently drift from the exact { label, prompt } contract (plain string arrays,
 * a "text"/"title" key instead of "label", a missing "prompt" that should just reuse the
 * label, etc). Strict validation would silently discard the whole chip in those cases, so
 * this accepts the common near-miss shapes rather than requiring exact compliance.
 */
export declare function sanitizeMariSuggestionChips(raw: unknown, options?: {
    maxChips?: number;
}): MariSuggestionChip[];
/**
 * One question in a guided-creation plan Mari returns in a single call. The client walks
 * these locally (tap a chip -> next step, zero further calls) until exhausted, then sends
 * one summary message back so Mari performs the actual creation with her normal commands.
 */
export interface MariGuidedPlanStep {
    fieldKey: string;
    question: string;
    chips: MariSuggestionChip[];
}
/** Same tolerant-parsing philosophy as sanitizeMariSuggestionChips - accept near-miss shapes. */
export declare function sanitizeMariGuidedPlan(raw: unknown, options?: {
    maxSteps?: number;
    maxChipsPerStep?: number;
}): MariGuidedPlanStep[];
export interface MariWorkspaceToolTrace {
    id: string;
    name: string;
    status: "running" | "done" | "error";
    input?: unknown;
    output?: string | null;
    updatedAt?: number;
}
export type MariWorkspaceTraceItem = {
    type: "text";
    content: string;
} | {
    type: "thinking";
    content: string;
} | {
    type: "tool";
    tool: MariWorkspaceToolTrace;
} | {
    type: "status";
    content: string;
};
export interface MariWorkspaceConnectionSummary {
    id: string;
    name: string;
    provider: string;
    model: string;
    maxContext: number;
}
export interface MariWorkspaceSkillSummary {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    size: number;
    filePath: string;
}
export interface MariWorkspaceSkillDetail extends MariWorkspaceSkillSummary {
    content: string;
}
export interface MariWorkspaceSkillsResponse {
    skills: MariWorkspaceSkillDetail[];
    diagnostics: string[];
}
export interface MariInstructionSummary {
    id: string;
    name: string;
    description: string;
    persistent: boolean;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface MariInstructionDetail extends MariInstructionSummary {
    content: string;
}
export interface MariInstructionsResponse {
    instructions: MariInstructionDetail[];
}
export interface MariInstructionMutationResponse {
    ok: boolean;
    instruction: MariInstructionDetail;
}
export interface MariDbValidationIssue {
    level: "error" | "notice" | "info";
    table?: string;
    id?: string | null;
    message: string;
}
export interface MariDbValidationResult {
    status: "passed" | "blocked";
    errors: MariDbValidationIssue[];
    notices: MariDbValidationIssue[];
    infos: MariDbValidationIssue[];
}
export interface MariDbRowChange {
    table: string;
    id: string;
    action: "insert" | "update" | "replace" | "delete";
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
}
export interface MariDbDiffSummary {
    matchedRows: number;
    affectedRows: number;
    insertedRows: number;
    updatedRows: number;
    replacedRows: number;
    deletedRows: number;
    affectedTables: Record<string, number>;
    preview: MariDbRowChange[];
    truncated: boolean;
}
/**
 * Signals how a structured read was bounded so the model gets a machine-readable
 * cue instead of a silent mid-field cut. `fields` lists whole values elided from
 * an object read (largest first) with the exact `field` path to re-read each;
 * `field` describes a single windowed field read (`app_data { field, offset }`).
 */
export interface MariDbReadTruncation {
    truncated: boolean;
    fields?: Array<{
        path: string;
        fullLength: number;
        returnedLength: number;
    }>;
    field?: {
        path: string;
        offset: number;
        returned: number;
        total: number;
    };
    /** Set when even structured elision could not fit the overview and it was hard-capped. */
    hardCapped?: boolean;
    /** Set when a `field=` read named a path that did not resolve on this row. */
    unresolvedField?: string;
}
/**
 * #5754 follow-up: deterministic post-apply verification. After an applied
 * mutation the engine re-reads every affected row FROM THE STORE and compares
 * the persisted values against what the plan asserted. Only "verified" - a
 * store-observed match - may satisfy the workspace verification guard: the
 * diff summary's preview is plan-derived (the same function serves dry-runs)
 * and must never count as proof of persistence. "mismatch" and "unavailable"
 * both fall back to requiring a manual confirmatory read, so a silent
 * persistence failure can only surface louder, never quieter.
 */
export interface MariDbReadBackMismatch {
    table: string;
    id: string;
    column: string;
    intended: unknown;
    persisted: unknown;
}
export interface MariDbMutationReadBack {
    /**
     * The guard does NOT parse this JSON: the command runtimes translate a
     * "verified"/"mismatch" status into an engine-written sentinel at position
     * zero of the command output, which is the only thing verification trusts
     * (later output bytes can contain model-authored text). This object is what
     * Mari herself reads for the detail.
     */
    status: "verified" | "mismatch" | "unavailable";
    /** Applied plan changes the read-back checked (all of them, not a preview cap). */
    checkedRows: number;
    /** Total mismatching columns/rows found; `mismatches` echoes a capped sample. */
    mismatchCount?: number;
    mismatches?: MariDbReadBackMismatch[];
    error?: string;
}
export interface MariDbCommandResult {
    ok: boolean;
    mode: "read" | "dry-run" | "apply";
    command: string;
    output?: unknown;
    truncation?: MariDbReadTruncation;
    summary?: MariDbDiffSummary;
    readBack?: MariDbMutationReadBack;
    validation?: MariDbValidationResult;
    approval?: {
        status: "not_required" | "pending" | "approved" | "rejected" | "cancelled" | "timed_out" | "state_changed";
        id?: string;
        operationHash?: string;
    };
    journalPath?: string | null;
    error?: string;
}
export interface MariDbPendingApproval {
    kind?: "applied_review" | "approval";
    id: string;
    sessionId: string;
    command: string;
    reason: string | null;
    operationHash: string;
    requestedAt: string;
    expiresAt: string;
    affectedTables: Record<string, number>;
    affectedRows: number;
    validationStatus: "passed" | "blocked";
    diffPreview: MariDbRowChange[];
    diffTruncated: boolean;
}
export type MariDependencyTarget = "root" | "client" | "server" | "shared";
export interface MariDependencyInstallApproval {
    kind: "dependency_install";
    id: string;
    sessionId: string;
    packageName: string;
    version: string;
    target: MariDependencyTarget;
    dependencyType: "dependency" | "devDependency";
    integrity: string;
    tarballUrl: string;
    directDependencies: Array<{
        name: string;
        range: string;
    }>;
    reason: string | null;
    requestedAt: string;
    expiresAt: string;
}
export interface MariSensitiveFileApproval {
    kind: "sensitive_file";
    id: string;
    sessionId: string;
    path: string;
    changeType: "create" | "update";
    beforeHash: string | null;
    afterHash: string;
    preview: string;
    previewTruncated: boolean;
    reason: string | null;
    requestedAt: string;
    expiresAt: string;
}
export type MariWorkspacePendingApproval = MariDbPendingApproval | MariDependencyInstallApproval | MariSensitiveFileApproval;
export interface MariDbHistoryEntry {
    id: string;
    sessionId: string;
    command: string;
    reason: string | null;
    status: "dry-run" | "approved" | "kept" | "restored" | "rejected" | "cancelled" | "timed_out" | "blocked" | "state_changed" | "failed";
    operationHash?: string;
    affectedTables: Record<string, number>;
    affectedRows: number;
    validationStatus: "passed" | "blocked";
    journalPath?: string | null;
    createdAt: string;
    completedAt?: string | null;
}
/**
 * #5740: the request/permission phrase Professor Mari reported acting on in
 * her most recent round that carried mutating commands. DIAGNOSTIC ONLY -
 * never validated, never gates anything (#5721's lesson stands). Retention is
 * deliberately the latest round only: one in-memory record, overwritten each
 * time, lost on server restart.
 */
/**
 * What actually became of the round's mutating commands. "held" = deferred
 * behind the Accept action, or staged behind a sensitive-change approval
 * card (#5756) - either way, awaiting the user; "applied" = every mutating
 * command succeeded and applied; "failed" = at least one was refused (a
 * permissions floor, validation) or errored; "interrupted" = the run ended
 * before the outcome was observed.
 */
export type MariUnderstoodRequestOutcome = "held" | "applied" | "failed" | "interrupted";
export interface MariUnderstoodRequest {
    /** Mari's quoted trigger phrase (user words or memory/instruction), or null when she reported none. */
    text: string | null;
    chatId: string;
    /** The persisted assistant message the round produced, once known. */
    messageId: string | null;
    /** Effective Permissions Mode when the round ran. */
    permissionsMode: MariPermissionsMode;
    /** Observed outcome - never inferred: "applied" is only set after the command batch reports success. */
    outcome: MariUnderstoodRequestOutcome;
    /** Short descriptions of the mutating commands (e.g. "app_data character.update"). */
    commands: string[];
    recordedAt: string;
}
export interface MariWorkspaceStatus {
    enabled: boolean;
    piAvailable: boolean;
    workspace: string;
    dataDir: string;
    tools: MariWorkspaceToolName[];
    shellSandbox: {
        available: boolean;
        backend: "macos-seatbelt" | "linux-bubblewrap" | null;
        reason?: string;
    };
    dbAccess: "server-managed";
    connection: MariWorkspaceConnectionSummary | null;
    skills: MariWorkspaceSkillSummary[];
    skillDiagnostics: string[];
    active: boolean;
    /** The EFFECTIVE Permissions Mode for the requested chat (#5725): the chat's override, else the global default. */
    permissionsMode: MariPermissionsMode;
    /** The global default mode (what a chat without an override runs under). */
    permissionsModeDefault: MariPermissionsMode;
    /** Whether permissionsMode came from a per-chat override or the global default. */
    permissionsModeSource: "default" | "chat";
    /** #5740: latest-round understood-request record (diagnostic only). */
    latestUnderstoodRequest: MariUnderstoodRequest | null;
    pendingApprovals: MariWorkspacePendingApproval[];
    history: MariDbHistoryEntry[];
    error?: string | null;
}
export type MariWorkspacePromptEvent = {
    type: "token";
    data: string;
} | {
    type: "thinking";
    data: string;
} | {
    type: "status";
    data: string | {
        content: string;
        kind?: "compaction_start" | "compaction_end" | "output_limit" | "retry" | "info" | "rate_limited";
        level?: "info" | "warning" | "error";
        reason?: string;
    };
} | {
    type: "tool_start";
    data: {
        id?: string;
        name: string;
        input?: unknown;
    };
} | {
    type: "tool_update";
    data: {
        id?: string;
        name?: string;
        output?: string;
    };
} | {
    type: "tool_end";
    data: {
        id?: string;
        name?: string;
        isError?: boolean;
        output?: string;
    };
} | {
    type: "approval_pending";
    data: MariWorkspacePendingApproval;
} | {
    type: "metadata";
    data: Record<string, unknown>;
} | {
    type: "suggestions";
    data: MariSuggestionChip[];
} | {
    type: "plan";
    data: MariGuidedPlanStep[];
} | {
    type: "done";
    data?: unknown;
} | {
    type: "error";
    data: string;
};
//# sourceMappingURL=professor-mari-workspace.d.ts.map