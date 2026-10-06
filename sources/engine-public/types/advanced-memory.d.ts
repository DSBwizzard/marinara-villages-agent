import { z } from "zod";
/** Distinguishes explicit scene participants from legacy visibility-based assignments. */
export declare const ADVANCED_MEMORY_SCENE_AUDIENCE: {
    readonly id: "scene-audience";
    readonly revision: "participants-v1";
};
export declare const advancedMemorySettingsSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    maxContextTokens: z.ZodDefault<z.ZodNumber>;
    summaryBudgetTokens: z.ZodDefault<z.ZodNumber>;
    helperConnectionId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    decisionEnabled: z.ZodDefault<z.ZodBoolean>;
    decisionConnectionId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    initialProcessingModel: z.ZodDefault<z.ZodEnum<["main", "helper"]>>;
    /** Cadence and recent-message window for standalone post-generation scene checks. */
    sceneCheckInterval: z.ZodDefault<z.ZodNumber>;
    retrieveMaxScenes: z.ZodDefault<z.ZodNumber>;
    retrieveMinMessages: z.ZodDefault<z.ZodNumber>;
    retrieveMaxMessages: z.ZodDefault<z.ZodNumber>;
    narratorCharacterId: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    /** A null value explicitly confirms knowledge from the beginning. Missing means unconfirmed. */
    knowledgeStarts: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodNullable<z.ZodString>>>;
    knowledgeConfirmed: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled: boolean;
    maxContextTokens: number;
    summaryBudgetTokens: number;
    helperConnectionId: string | null;
    decisionEnabled: boolean;
    decisionConnectionId: string | null;
    initialProcessingModel: "main" | "helper";
    sceneCheckInterval: number;
    retrieveMaxScenes: number;
    retrieveMinMessages: number;
    retrieveMaxMessages: number;
    narratorCharacterId: string | null;
    knowledgeStarts: Record<string, string | null>;
    knowledgeConfirmed: boolean;
}, {
    enabled?: boolean | undefined;
    maxContextTokens?: number | undefined;
    summaryBudgetTokens?: number | undefined;
    helperConnectionId?: string | null | undefined;
    decisionEnabled?: boolean | undefined;
    decisionConnectionId?: string | null | undefined;
    initialProcessingModel?: "main" | "helper" | undefined;
    sceneCheckInterval?: number | undefined;
    retrieveMaxScenes?: number | undefined;
    retrieveMinMessages?: number | undefined;
    retrieveMaxMessages?: number | undefined;
    narratorCharacterId?: string | null | undefined;
    knowledgeStarts?: Record<string, string | null> | undefined;
    knowledgeConfirmed?: boolean | undefined;
}>;
export type AdvancedMemorySettings = z.infer<typeof advancedMemorySettingsSchema>;
export declare const DEFAULT_ADVANCED_MEMORY_SETTINGS: AdvancedMemorySettings;
export declare function normalizeAdvancedMemorySettings(value: unknown): AdvancedMemorySettings;
/** Compact, saved evidence from actual memory decisions, never a new preview call. */
export declare const advancedMemoryDecisionDiagnosticsSchema: z.ZodObject<{
    createdAt: z.ZodString;
    model: z.ZodNullable<z.ZodString>;
    sourceEndMessageId: z.ZodNullable<z.ZodString>;
    fallback: z.ZodBoolean;
    threshold: z.ZodNumber;
    omittedCount: z.ZodNumber;
    results: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodEnum<["scene", "excerpt", "message", "scene_end"]>;
        text: z.ZodString;
        score: z.ZodOptional<z.ZodNumber>;
        binary: z.ZodOptional<z.ZodBoolean>;
        selected: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        text: string;
        id: string;
        kind: "message" | "scene" | "excerpt" | "scene_end";
        selected: boolean;
        score?: number | undefined;
        binary?: boolean | undefined;
    }, {
        text: string;
        id: string;
        kind: "message" | "scene" | "excerpt" | "scene_end";
        selected: boolean;
        score?: number | undefined;
        binary?: boolean | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    threshold: number;
    fallback: boolean;
    model: string | null;
    createdAt: string;
    sourceEndMessageId: string | null;
    omittedCount: number;
    results: {
        text: string;
        id: string;
        kind: "message" | "scene" | "excerpt" | "scene_end";
        selected: boolean;
        score?: number | undefined;
        binary?: boolean | undefined;
    }[];
}, {
    threshold: number;
    fallback: boolean;
    model: string | null;
    createdAt: string;
    sourceEndMessageId: string | null;
    omittedCount: number;
    results: {
        text: string;
        id: string;
        kind: "message" | "scene" | "excerpt" | "scene_end";
        selected: boolean;
        score?: number | undefined;
        binary?: boolean | undefined;
    }[];
}>;
export type AdvancedMemoryDecisionDiagnostics = z.infer<typeof advancedMemoryDecisionDiagnosticsSchema>;
export interface AdvancedMemoryJob {
    id?: string;
    blocking?: boolean;
    /** Explicit user pause; ordinary interruptions and correction recovery may also be cancelled. */
    paused?: boolean;
    status: "idle" | "running" | "ready" | "cancelled" | "error" | "needs_confirmation";
    stage: "idle" | "classifying" | "summarizing" | "indexing" | "compacting" | "ready";
    completed: number;
    total: number;
    error: string | null;
    reviewRecordId?: string | null;
    processedMessageId?: string | null;
    decisionSceneCheck?: AdvancedMemoryDecisionDiagnostics;
    /** Invalidates cached prompts when a user removes an automatic context flag. */
    contextStartRevision?: number;
    /** Shared automatic scene reset, controlled by the existing New Start flag UI. */
    contextStarts?: Array<{
        messageId: string;
        audienceCharacterIds: string[];
        /** Keep this scene boundary until the live window reaches its budget again. */
        sceneStartMessageId?: string | null;
        /** A changed manual flag replaces the automatic window. */
        manualStartMessageId?: string | null;
    }>;
}
export interface AdvancedMemoryRecord {
    id: string;
    chatId: string;
    sceneId: string;
    kind: "scene" | "continuity" | "temporary" | "excerpt";
    status: "open" | "closed";
    startMessageId: string;
    endMessageId: string;
    /** Current 1-based transcript numbers; IDs are authoritative. */
    startIndex: number;
    endIndex: number;
    messageIds: string[];
    /** Scene/excerpt access: empty means narrator only, never all characters. */
    audienceCharacterIds: string[];
    content: string;
    title: string;
    timeline: string | null;
    enabled: boolean;
    manualOverride: boolean;
    sourceFingerprint: string;
    dependencies: Array<{
        id: string;
        revision: string;
    }>;
    embeddingStatus: "vectorized" | "pending" | "stale";
    createdAt: string;
    updatedAt: string;
}
export interface AdvancedMemoryStatus {
    settings: AdvancedMemorySettings;
    job: AdvancedMemoryJob;
    missingKnowledgeCharacterIds: string[];
    effectiveKnowledgeStarts?: Record<string, string | null>;
    records: AdvancedMemoryRecord[];
    helperModel: string | null;
    summaryModel: string | null;
    warnings: string[];
    unpreparedScenes?: Array<{
        sceneId: string;
        startIndex: number;
        endIndex: number;
        /** Regeneration is available only through an explicit single-scene request. */
        deleted?: boolean;
    }>;
    latestReceipt?: AdvancedMemoryReceipt;
}
export interface AdvancedMemoryReceipt {
    decisionRecall?: AdvancedMemoryDecisionDiagnostics;
    sourceEndMessageId?: string | null;
    sourceFingerprint: string;
    policyRevision: string;
    recordRevisions: Record<string, string>;
    estimatedTokensBefore: number;
    estimatedTokensAfter: number;
    budgetTokens: number;
    boundaryMessageId: string | null;
    checkpointId: string | null;
    recalledSceneIds: string[];
    recalledMessageIds: string[];
    reasons: string[];
}
export interface PreparedAdvancedMemory {
    messageIds: string[];
    chatSummary: string | null;
    currentSceneSummary: string | null;
    recalledScenes: string | null;
    recalledMessages: string | null;
    /** Persisted IDs used only by optional recall; constant-summary dependencies remain when recall is omitted. */
    recalledRecordIds: string[];
    receipt: AdvancedMemoryReceipt;
}
//# sourceMappingURL=advanced-memory.d.ts.map