import type { BuiltInAgentManifest } from "../features/agents/agent-manifest.types.js";
import type { AgentToolConfig, ToolDefinition } from "../features/function-calls/tool-definitions.js";
import type { ChatMode } from "./chat.js";
import type { WrapFormat } from "./prompt.js";
import type { MacroDecisionAnswers } from "../utils/macro-engine.js";
/** When in the generation pipeline an agent runs. */
export type AgentPhase = 
/** Before the main generation (can modify prompt context) */
"pre_generation"
/** Fires alongside the main generation (does not receive mainResponse) */
 | "parallel"
/** After the main response is complete (can modify it) */
 | "post_processing";
export declare function normalizeAgentPhaseValue(value: unknown, fallback?: AgentPhase): AgentPhase;
export declare function normalizeAgentPhaseForType(_agentType: string, configuredPhase: unknown, fallback?: AgentPhase): AgentPhase;
/** Ordered vocabulary of result types that agents can produce. */
export declare const AGENT_RESULT_TYPE_VALUES: readonly ["game_state_update", "text_rewrite", "sprite_change", "echo_message", "quest_update", "image_prompt", "context_injection", "continuity_check", "director_event", "lorebook_update", "character_card_update", "character_card_create", "background_change", "character_tracker_update", "persona_stats_update", "custom_tracker_update", "inventory_tracker_update", "spotify_control", "youtube_control", "local_music_control", "haptic_command", "cyoa_choices", "secret_plot", "game_master_narration", "party_action", "game_map_update", "game_state_transition", "prompt_patch", "character_activity_update", "frontend_theme_update", "about_me_update", "memory_nag"];
/** The result type an agent can produce. */
export type AgentResultType = (typeof AGENT_RESULT_TYPE_VALUES)[number];
/** Configuration for a single agent. */
export interface AgentConfig {
    id: string;
    /** Agent type identifier (e.g. "world-state", "prose-guardian") */
    type: string;
    /** Display name */
    name: string;
    description: string;
    /** When this agent runs in the pipeline */
    phase: AgentPhase;
    /** Whether globally enabled */
    enabled: boolean;
    /** Override: use a different connection/model for this agent */
    connectionId: string | null;
    /** Agent-specific prompt template */
    promptTemplate: string;
    /** Agent-specific settings */
    settings: Record<string, unknown>;
    /** Function/tool definitions this agent can use */
    tools: ToolDefinition[];
    /** Tool calling configuration */
    toolConfig: AgentToolConfig | null;
    createdAt: string;
    updatedAt: string;
}
export declare const DEFAULT_AGENT_AUTHOR = "Pasta Devs";
export declare const DEFAULT_AGENT_PROMPT_TEMPLATE_ID = "default";
/** A named prompt variant that can be selected per chat for an agent. */
export interface AgentPromptTemplateOption {
    id: string;
    name: string;
    promptTemplate: string;
    description?: string;
}
export declare function parseAgentSettingsRecord(value: unknown): Record<string, unknown>;
export declare const AGENT_CONFIG_DELETED_SETTING_KEY = "deletedFromLibrary";
export declare function isAgentConfigDeleted(settings: unknown): boolean;
export declare function markAgentConfigDeletedSettings(settings: unknown): Record<string, unknown>;
export declare function normalizeAgentPromptTemplateOptions(value: unknown): AgentPromptTemplateOption[];
export declare function getAgentPromptTemplateOptions(input: {
    promptTemplate?: string | null;
    fallbackPromptTemplate?: string | null;
    settings?: unknown;
}): AgentPromptTemplateOption[];
export declare function resolveDefaultAgentPromptTemplateId(settingsValue: unknown): string;
export declare function normalizeAgentPromptTemplateSelectionMap(value: unknown): Record<string, string>;
export declare function resolveAgentPromptTemplate(input: {
    promptTemplate?: string | null;
    fallbackPromptTemplate?: string | null;
    settings?: unknown;
    selectedPromptTemplateId?: string | null;
}): string;
/** Result produced by an agent after execution. */
export interface AgentResult {
    agentId: string;
    agentType: string;
    type: AgentResultType;
    /** The result payload (varies by type) */
    data: unknown;
    /** Token usage */
    tokensUsed: number;
    /** How long the agent took */
    durationMs: number;
    /** Whether the agent succeeded */
    success: boolean;
    error: string | null;
}
export type AgentWriteApprovalKind = "character_card_create" | "lorebook_update" | "summary_update";
export interface AgentWriteApprovalProposal {
    kind: AgentWriteApprovalKind;
    chatId: string;
    agentType: string | null;
    agentName: string;
    title: string;
    text: string;
    payload?: Record<string, unknown>;
    canRegenerate?: boolean;
    createdAt?: string;
}
export interface AgentWriteApprovalEnvelope {
    requiresApproval: true;
    approval: AgentWriteApprovalProposal;
}
export interface AgentCallDebugMessage {
    role: string;
    content: string;
    name?: string;
}
export interface AgentCallDebugEvent {
    stage: "request" | "response" | "retry_request" | "retry_response" | "error";
    agentId: string;
    agentType: string;
    agentName: string;
    phase: string;
    model: string;
    /** Effective sampling value sent to the provider; omitted when connection/model policy suppresses it. */
    temperature?: number;
    maxTokens: number;
    messageCount: number;
    messages?: AgentCallDebugMessage[];
    tools?: string[];
    round?: number;
    promptTokens?: number;
    completionTokens?: number;
    reasoningTokens?: number;
    totalTokens?: number;
    /** Duration of this provider request. */
    durationMs?: number;
    /** Cumulative elapsed time for a multi-round agent run. */
    elapsedMs?: number;
    finishReason?: string | null;
    response?: string;
    responsePreview?: string;
    error?: string;
    batchedAgentTypes?: string[];
}
/** Content-free progress for the normal Agents menu, independent of prompt/debug logging. */
export interface AgentTaskProgress {
    callId: string;
    agents: Array<{
        id: string;
        type: string;
        name: string;
        phase: string;
    }>;
    stage: "waiting" | "streaming" | "received" | "error" | "stopped";
    receivedChunks: number;
    receivedCharacters: number;
    /** First received text or reasoning chunk; unavailable for non-streaming calls. */
    ttftMs?: number;
    elapsedMs: number;
    promptTokens?: number;
    completionTokens?: number;
}
/** Shared context passed to every agent. */
export interface AgentContext {
    /** Serialize model calls for Game chats sharing limited GPU memory. */
    sequentialExecution?: boolean;
    /**
     * This turn's answers for `decision:` and `decision_choice:` conditions in the
     * agent's prompt template (#6569). Absent means none were asked, which reads as no.
     */
    decisions?: MacroDecisionAnswers;
    /**
     * Prose to read instead of the recent messages.
     *
     * Set when the operator types a correction directly — "her sword is broken" — rather
     * than waiting for the story to say it. The extractor runs on that sentence with the
     * current state as context, so an unnamed subject still attaches to whoever is
     * actually holding the sword.
     */
    narrationOverride?: string;
    chatId: string;
    chatMode: string;
    /** Prompt wrapper format selected for this generation. */
    wrapFormat?: WrapFormat;
    /** Recent chat history (last N messages) */
    recentMessages: Array<{
        id?: string;
        role: string;
        content: string;
        characterId?: string;
        /** Speaker label for agent history; set only when the message has exactly one speaker. */
        speakerName?: string;
        /** Tracker state snapshot for this message (if any). */
        gameState?: import("./game-state.js").GameState | null;
    }>;
    /** The main response text (available for post-processing agents) */
    mainResponse: string | null;
    /** Speaker-attributed response segments when Roleplay Name Prefix is enabled. */
    mainResponseSegments?: Array<{
        characterId?: string;
        characterName: string;
        content: string;
    }>;
    /** Current game state (if any) */
    gameState: import("./game-state.js").GameState | null;
    /**
     * Active characters in the chat. The base shape (id/name/description) is
     * always populated. Richer card fields are optional — they're present in
     * practice, but agents should not rely on them unless needed. The Card
     * Evolution Auditor agent uses them to emit exact-match oldText edits.
     */
    characters: Array<{
        id: string;
        name: string;
        /** Persisted character-card world name, when configured. */
        world?: string;
        description: string;
        personality?: string;
        scenario?: string;
        creatorNotes?: string;
        systemPrompt?: string;
        backstory?: string;
        appearance?: string;
        mesExample?: string;
        firstMes?: string;
        postHistoryInstructions?: string;
        avatarPath?: string | null;
        avatarCrop?: unknown;
        rpgStats?: import("./character.js").RPGStatsConfig;
    }>;
    /** Every character attached to the chat, with only the data needed for activity routing. */
    chatCharacters?: Array<{
        id: string;
        name: string;
        active: boolean;
    }>;
    /** Latest known tracker entries, including recurring characters that are currently absent. */
    characterTrackerHistory?: import("./game-state.js").PresentCharacter[];
    /** User persona info */
    persona: {
        name: string;
        description: string;
        personality?: string;
        backstory?: string;
        appearance?: string;
        scenario?: string;
        personaStats?: {
            enabled: boolean;
            bars: Array<{
                name: string;
                value: number;
                max: number;
                color: string;
            }>;
        };
        rpgStats?: {
            enabled: boolean;
            attributes: Array<{
                name: string;
                value: number;
            }>;
            hp: {
                value: number;
                max: number;
            };
            pools?: import("./character.js").RPGStatPool[];
        };
    } | null;
    /** The agent's own persistent memory (key-value) */
    memory: Record<string, unknown>;
    /** Host resolves only this agent's output on the visible message history. */
    loadPreviousOutput?: (agentConfigId: string) => Promise<unknown>;
    previousOutput?: {
        agentType: string;
        text: string;
    };
    /** All lorebook IDs the agent can write to */
    writableLorebookIds: string[] | null;
    /** Chat summary text (if any) — helps agents avoid duplicating summarized info */
    chatSummary: string | null;
    /** Resolved Author's Notes for custom agents that explicitly opt into them. */
    authorNotes?: string | null;
    /** Lorebook entries activated for the main generation on this turn. */
    activatedLorebookEntries?: Array<{
        id: string;
        name?: string;
        content: string;
    }>;
    /** Per-lorebook total entry counts (for {{lorebooksize::ID}} macro in agent prompts). */
    lorebookEntryCounts?: Record<string, number>;
    /**
     * Semantic source material resolved for custom agents that opt into vector access.
     * The runtime keeps this out of ordinary agent prompts and injects it only for
     * agents with the `access_vectors` capability.
     */
    vectorContext?: {
        recalledMemories: string[];
        semanticLorebookEntries: Array<{
            id: string;
            content: string;
            semanticScore?: number;
        }>;
    };
    /** Keyword/semantic lorebook matches resolved from each custom agent's own context window. */
    triggeredLorebookEntriesByAgentId?: Record<string, Array<{
        id: string;
        name?: string;
        content: string;
        matchedKeys: string[];
        activationSources: string[];
        semanticScore?: number;
    }>>;
    /** Current-turn pre-generation injections, only present for agents that opt in */
    preGenInjections?: Array<{
        agentType: string;
        agentName?: string;
        text: string;
    }>;
    /** Current-turn parallel-phase results, only present for agents that opt in */
    parallelResults?: AgentResult[];
    /** Whether internal agent LLM calls should use transport streaming. */
    streaming?: boolean;
    /** Emits full agent call diagnostics for the client debug console. */
    agentDebug?: (event: AgentCallDebugEvent) => void;
    /** Lightweight provider progress; never includes prompts, reasoning, or response content. */
    agentProgress?: (event: AgentTaskProgress) => void;
    /** Request-local scene check shared by tracker calls; only the first eligible call claims it. */
    sceneCheck?: {
        trackerAgentIds: string[];
        prompt: string;
        claimed: boolean;
        result?: unknown;
    };
    /** Abort signal — when triggered, agent execution should stop. Typed as `any` to avoid DOM/Node lib dependency. */
    signal?: any;
}
/** Built-in agent type identifiers. */
export declare const BUILT_IN_AGENT_IDS: {
    readonly WORLD_STATE: "world-state";
    readonly PROSE_GUARDIAN: "prose-guardian";
    readonly CONTINUITY: "continuity";
    readonly EXPRESSION: "expression";
    readonly ECHO_CHAMBER: "echo-chamber";
    readonly DIRECTOR: "director";
    readonly QUEST: "quest";
    readonly ILLUSTRATOR: "illustrator";
    readonly LOREBOOK_KEEPER: "lorebook-keeper";
    readonly CARD_EVOLUTION_AUDITOR: "card-evolution-auditor";
    readonly COMBAT: "combat";
    readonly BACKGROUND: "background";
    readonly CHARACTER_TRACKER: "character-tracker";
    readonly PERSONA_STATS: "persona-stats";
    readonly HTML: "html";
    readonly SPOTIFY: "spotify";
    readonly KNOWLEDGE_RETRIEVAL: "knowledge-retrieval";
    readonly KNOWLEDGE_ROUTER: "knowledge-router";
    readonly CUSTOM_TRACKER: "custom-tracker";
    readonly HAPTIC: "haptic";
    readonly CYOA: "cyoa";
};
export declare const RETIRED_BUILT_IN_AGENT_IDS: readonly ["about-me-keeper", "prompt-reviewer", "response-orchestrator", "schedule-planner", "chat-summary", "autonomous-messenger", "youtube", "secret-plot-driver"];
export declare function isRetiredBuiltInAgentId(agentId: string): boolean;
export type AgentCategory = "writer" | "tracker" | "misc";
export interface BuiltInAgentMeta {
    id: string;
    name: string;
    description: string;
    author: string;
    phase: AgentPhase;
    enabledByDefault: boolean;
    /** Whether "Add as Prompt Section" should default to on when first created */
    defaultInjectAsSection?: boolean;
    category: AgentCategory;
    /** Hide this built-in from public agent library and chat agent pickers. */
    libraryHidden?: boolean;
    /** Keep legacy configs recognized, but never run this built-in in generation pipelines. */
    runtimeDisabled?: boolean;
    modeAllowlist?: readonly ChatMode[];
    promptTemplates?: AgentPromptTemplateOption[];
    execution?: "pipeline" | "feature" | "host";
}
export declare const BUILT_IN_AGENTS: BuiltInAgentMeta[];
export declare const DEFAULT_AGENT_CONTEXT_SIZE = 5;
export declare const DEFAULT_AGENT_MAX_TOKENS = 4096;
export declare const MIN_AGENT_MAX_TOKENS = 128;
export declare const MAX_AGENT_MAX_TOKENS = 32768;
export declare const CUSTOM_AGENT_CAPABILITY_IDS: readonly ["create_characters", "create_lorebooks", "edit_lorebooks", "edit_messages", "edit_trackers", "change_frontend_styling", "change_backgrounds", "change_sprites", "control_media", "control_haptics", "edit_about_me", "trigger_image_generation", "access_vectors", "edit_main_prompt", "manage_chat_characters"];
export type CustomAgentCapability = (typeof CUSTOM_AGENT_CAPABILITY_IDS)[number];
export type CustomAgentCapabilityMap = Partial<Record<CustomAgentCapability, boolean>>;
export declare const CUSTOM_AGENT_CONTEXT_SOURCE_IDS: readonly ["chatHistory", "characters", "persona", "activatedLorebookEntries", "chatSummary", "authorNotes", "trackerData", "recalledMemories", "previousOutput"];
export type CustomAgentContextSource = (typeof CUSTOM_AGENT_CONTEXT_SOURCE_IDS)[number];
export type CustomAgentContextSources = Record<CustomAgentContextSource, boolean>;
export declare const DEFAULT_CUSTOM_AGENT_CONTEXT_SOURCES: CustomAgentContextSources;
export declare function normalizeCustomAgentContextSources(settings: unknown): CustomAgentContextSources;
/** Built-in agents retain their existing context unless the user explicitly configures sources. */
export declare function getAgentContextSources(config: {
    isCustomAgent?: boolean;
    settings: unknown;
}): CustomAgentContextSources;
export interface CustomAgentImportPolicy {
    enabled: boolean;
}
export type CustomAgentImportSource = "file" | "folder" | "repository";
export declare const CUSTOM_AGENT_IMPORT_SOURCE_SETTING = "customAgentImportSource";
export declare const CUSTOM_AGENT_PERMISSIONS_EXPLICIT_SETTING = "customAgentPermissionsExplicit";
export declare function createImportedAgentType(sourceType: string): string;
export declare function normalizeCustomAgentCapabilities(settings: Record<string, unknown> | null | undefined): CustomAgentCapabilityMap;
export declare function customAgentHasCapability(settings: Record<string, unknown> | null | undefined, capability: CustomAgentCapability): boolean;
export declare function getCustomAgentResultCapability(resultType: AgentResultType): CustomAgentCapability | null;
export declare function isExternallyImportedAgent(type: unknown, settings: unknown): boolean;
export declare function getDefaultBuiltInAgentSettings(agentType: string): Record<string, unknown>;
export declare function normalizeBuiltInAgentEnabledTools(agentType: string, value: unknown): string[] | null;
export declare function mergeBuiltInAgentSettings(agentType: string, settings: unknown): Record<string, unknown>;
/** Recommended default tools for each built-in agent type. */
export declare const DEFAULT_AGENT_TOOLS: Record<string, string[]>;
export declare function replaceBuiltInAgentDefinitions(manifests: readonly BuiltInAgentManifest[]): void;
/** Data shape for a lorebook_update agent result. */
export interface LorebookUpdateResult {
    /** "create" | "update" | "delete" */
    action: "create" | "update" | "delete";
    /** Target lorebook ID */
    lorebookId: string;
    /** Entry ID (for update/delete) */
    entryId?: string;
    /** Entry data (for create/update) */
    entry?: {
        name: string;
        content: string;
        keys: string[];
        tag?: string;
        /** Optional lorebook injection priority. Omission preserves the existing/default order. */
        order?: number;
    };
}
/**
 * Single proposed edit to a character card field.
 *
 * Unlike LorebookUpdateResult, these edits are NEVER applied automatically —
 * the server emits them as an agent_result SSE event and the client shows
 * a confirmation modal. Character cards are more sensitive than lorebook
 * entries because they define the character's identity.
 */
export declare const EDITABLE_CHARACTER_CARD_FIELDS: readonly ["description", "personality", "scenario", "first_mes", "mes_example", "creator_notes", "system_prompt", "post_history_instructions", "backstory", "appearance", "aboutMe"];
export type EditableCharacterCardField = (typeof EDITABLE_CHARACTER_CARD_FIELDS)[number];
export interface CharacterCardFieldUpdate {
    /** Stable target character id from the <character id="..."> context block. */
    characterId: string;
    /** Currently only "update" is supported; reserved for future create/delete. */
    action: "update";
    /** Which stored character-card field this edit targets. */
    field: EditableCharacterCardField;
    /** The existing field value the agent observed. */
    oldText: string;
    /** The proposed replacement text. */
    newText: string;
    /** Why the agent thinks this edit is warranted (shown to the user). */
    reason: string;
}
/** Data shape for a character_card_update agent result. */
export interface CharacterCardUpdateResult {
    updates: CharacterCardFieldUpdate[];
}
//# sourceMappingURL=agent.d.ts.map