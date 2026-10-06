export interface MacroContext {
    user: string;
    userPhonetic?: string;
    char: string;
    charPhonetic?: string;
    /** Character names in the current prompt scope (used by {{characters}}) */
    characters: string[];
    /** Full active chat character roster (used by {{group}} when the prompt is scoped to one responder) */
    groupCharacters?: string[];
    /** Full per-character card fields for grouped macro expansion */
    characterProfiles?: Array<{
        name: string;
        phoneticName?: string;
        description?: string;
        personality?: string;
        backstory?: string;
        appearance?: string;
        scenario?: string;
        example?: string;
        systemPrompt?: string;
        postHistoryInstructions?: string;
    }>;
    /** Custom variables from prompt toggle groups */
    variables: Record<string, string>;
    /** SillyTavern-compatible local variables persisted in the current chat. */
    localVariables?: Record<string, string>;
    /**
     * Names a preset variable will define later in this request.
     *
     * History is resolved before the assembler merges preset values into
     * `variables`, so without this the chat's own value would be baked into a
     * message while prompt sections got the preset's — one request, two names.
     * Listing the name here leaves the tag for the provider-boundary pass, which
     * runs after that merge and so sees the preset value.
     */
    deferredPresetVariableNames?: ReadonlySet<string>;
    /** Last user input message (for {{input}}) */
    lastInput?: string;
    /** Chat ID (for {{chatId}}) */
    chatId?: string;
    /** Model name (for {{model}}) */
    model?: string;
    /** Generation trigger/type label (for {{lastGenerationType}}) */
    lastGenerationType?: string;
    /** Human-readable time since the last chat activity before this generation (for {{idle_duration}}) */
    idleDuration?: string;
    /** IANA timezone name from the active browser/session, used by time macros */
    timeZone?: string;
    /** Agent data keyed by agent type (for {{agent::TYPE}}) */
    agentData?: Record<string, string>;
    /** Referenced character names keyed by exact card ID (for {{CHARACTER_ID}}) */
    characterReferences?: Record<string, string>;
    /** Referenced persona names keyed by exact card ID (for {{persona-PERSONA_ID}}) */
    personaReferences?: Record<string, string>;
    /** Activated lorebook Outlet content keyed by its exact, case-sensitive name */
    outlets?: Record<string, string>;
    /**
     * Decision-model answers for `decision:"..."` condition operands, keyed by the
     * statement after its macros are resolved (see `resolveDecisionQuestionText`).
     * A statement with no entry reads as false, so a prompt behaves the same with no
     * Decision model as with one that did not answer.
     */
    decisions?: MacroDecisionAnswers;
    /** Per-lorebook total entry counts, keyed by lorebook ID (for {{lorebooksize::ID}}) */
    lorebookEntryCounts?: Record<string, number>;
    /** Lorebooks `{{include::...}}` reads from; loaded only when a prompt uses it (see `expandLorebookIncludes`). */
    lorebookIncludes?: LorebookIncludeSource;
    /** Current character card fields used by macros like {{description}} */
    characterFields?: {
        phoneticName?: string;
        description?: string;
        personality?: string;
        backstory?: string;
        appearance?: string;
        scenario?: string;
        example?: string;
        systemPrompt?: string;
        postHistoryInstructions?: string;
    };
    /** Active persona card fields used by {{persona}} */
    personaFields?: {
        phoneticName?: string;
        description?: string;
        personality?: string;
        backstory?: string;
        appearance?: string;
        scenario?: string;
    };
    /** Conversation-mode-only fields for {{convo_display}}/{{char_about}}/{{persona_about}}/{{convo_behavior}}.
     *  Populated ONLY by the conversation prompt branch, so these macros resolve to ""
     *  in Roleplay/Game — even if placed in a shared surface those modes render. */
    convoFields?: {
        charDisplayName?: string;
        charAbout?: string;
        personaAbout?: string;
        convoBehavior?: string;
    };
}
/**
 * What `{{include::ENTRY}}` and `{{include::BOOK::ENTRY}}` can read (#6912): every
 * lorebook and entry, whether or not the chat uses it and whether or not it is enabled.
 */
export interface LorebookIncludeSource {
    books: ReadonlyArray<{
        id: string;
        name: string;
    }>;
    entries: ReadonlyArray<{
        id: string;
        lorebookId: string;
        name: string;
        content: string;
    }>;
    /** Where the short form looks for an entry name: the lorebooks the chat uses. */
    currentBookIds: readonly string[];
}
export interface MacroDecisionAnswers {
    answers?: ReadonlyMap<string, boolean>;
    /** The chosen option for each `decision_choice:"..."` statement, by the same key. */
    choices?: ReadonlyMap<string, string>;
    /** Statements evaluated without an answer, for logging and Peek Prompt. */
    unanswered?: Set<string>;
    /**
     * Set only by a planning pass (`planDecisionStatements`). Every statement the pass
     * could reach, both as written and as resolved, so a turn asks only what can matter.
     */
    planned?: Set<string>;
    /** A planning pass that keeps only branches already settled (see `planDecisionStatements`). */
    plannedSettledOnly?: boolean;
}
export interface ResolveMacroOptions {
    trimResult?: boolean;
    /**
     * Preserve character macros as internal tokens for a later known-speaker pass.
     * "names" delays {{char}}/{{charName}} and {{group}}; "all" also delays character field macros.
     */
    deferCharacterMacros?: "names" | "all";
    /**
     * Opt-in hook to defer a {{#if}} block whose condition references an operand
     * whose value isn't known during macro resolution (e.g. conversation
     * relocation macros the route fills in afterward). When the predicate returns
     * true for a condition operand, the block is encoded as a deferred token
     * instead of being evaluated; the caller decodes it later against the real
     * value (see DEFERRED_RELOCATION_CONDITIONAL_TOKEN_RE + selectConditionalPayloadBranch).
     * The engine stays mode-agnostic — it never hardcodes which operands defer.
     */
    deferConditionalOperand?: (operand: string) => boolean;
    /** Internal guard for recursive character/persona field macro expansion. */
    fieldResolutionDepth?: number;
    /** Stable seed used to resolve random/dice macros consistently for one message. */
    randomSeed?: string;
    /** Shared budget used internally to stop runaway recursive expansion. */
    macroBudget?: MacroResolutionBudget;
    /** Internal recursion depth for nested macro expansion. */
    macroDepth?: number;
    /** Maximum nested resolveMacros calls before expansion stops. */
    maxMacroDepth?: number;
    /** Maximum macro replacement operations in one resolution tree. */
    maxMacroExpansions?: number;
    /** Maximum resolved output length. */
    maxMacroOutputLength?: number;
}
export interface SupportedMacroDefinition {
    category: string;
    syntax: string;
    description: string;
}
export declare const CHARACTER_REFERENCE_ID_PATTERN: RegExp;
export declare const PERSONA_REFERENCE_ID_PATTERN: RegExp;
export declare const DEFERRED_RELOCATION_CONDITIONAL_TOKEN_RE: RegExp;
export type CharacterMacroProfile = NonNullable<MacroContext["characterProfiles"]>[number];
type ConditionalBlockPayload = {
    condition: string;
    truthy: string;
    falsy: string;
    branches?: never;
};
type ConditionalBranchPayload = {
    condition: string | null;
    content: string;
};
type ConditionalChainPayload = {
    branches: ConditionalBranchPayload[];
    condition?: never;
    truthy?: never;
    falsy?: never;
};
type DeferredConditionalPayload = ConditionalBlockPayload | ConditionalChainPayload;
export type MacroResolutionBudget = {
    expansions: number;
    exceeded?: boolean;
};
export declare function stripMacroComments(template: string): string;
export declare function seededUnitRandom(seed: string): number;
export declare function hasDeferredCharacterMacros(template: string): boolean;
/** True if any deferred relocation conditional token is still unresolved. */
export declare function hasDeferredRelocationConditionals(template: string): boolean;
/**
 * Extract the condition operands (left/right of each branch) from every deferred
 * relocation conditional token in `text`. Lets the caller decide which of its
 * slots the deferred blocks actually reference using the SAME parse the deferral
 * used — so slot detection can never disagree with the defer decision (#3449).
 */
export declare function collectDeferredRelocationConditionOperands(text: string): string[];
export declare const SUPPORTED_MACROS: readonly SupportedMacroDefinition[];
export declare function resolveCharacterScopedMacros(template: string, profile: CharacterMacroProfile, depth?: number, baseContext?: MacroContext): string;
export declare function resolveDeferredCharacterMacros(template: string, profile: CharacterMacroProfile, baseContext?: MacroContext): string;
export declare function parseDeferredConditionalPayload(encoded: string): DeferredConditionalPayload | null;
/**
 * Modifiers an author writes after a statement: `decision:"..." sticky:3 cooldown:5
 * every:2 priority:high`. After a yes the statement stays yes for `sticky` turns, then
 * reads as no for `cooldown` turns, without being asked. `every` asks it only every N
 * turns, reading as no between checks. `priority` decides which statements are asked
 * when a turn has more than its limit; medium when unset.
 */
export interface DecisionStatementModifiers {
    sticky?: number;
    cooldown?: number;
    every?: number;
    priority?: DecisionStatementPriority;
    lasts?: DecisionStatementLifetime;
}
/**
 * `until:"..."` or `while:"..."` after a `decision:` statement (#6922). After a yes the
 * block stays on without the statement being asked; this one is asked each turn instead.
 */
export interface DecisionStatementLifetime {
    /** As written, before its macros are resolved. */
    statement: string;
    /** `until` turns the block off when this is true, `while` when it is false. */
    kind: "until" | "while";
    /**
     * With sticky: `and` (or `restrict`) turns the block off at whichever ends first, `or`
     * (or `extend`) at whichever ends last. Until defaults to `and`, while to `or`. Without
     * sticky, this statement alone decides.
     */
    mode: "and" | "or";
}
export type DecisionStatementPriority = "high" | "low";
/** The most turns a timing modifier holds for. */
export declare const MAX_DECISION_TIMING_TURNS = 1000;
/** Whitespace-normalized, so a line break inside a statement does not change its key. */
export declare function normalizeDecisionQuestion(text: string): string;
/**
 * A statement's text once its own macros are resolved in `ctx`: the key an answer is
 * stored and looked up under. Collection and evaluation both go through here, so the
 * two can never disagree about what was asked.
 */
export declare function resolveDecisionQuestionText(question: string, ctx: MacroContext): string;
export interface CollectedDecisionQuestion extends DecisionStatementModifiers {
    kind: "noul" | "choice";
    /** As written, before its macros are resolved. */
    question: string;
    /** For a Choice statement: the literals it is compared with, as written. */
    options: string[];
}
/**
 * Every decision statement in a template, as written, in order of appearance: each
 * `decision:"..."`, and each `decision_choice:"..."` with the options it is compared
 * against (`decision_choice:"..." == "angry"` offers "angry").
 *
 * Read with the same tag and condition parsers the engine evaluates with, so a
 * statement is found exactly when a condition would ask it. The same Choice statement
 * compared in several places is returned once per place; the caller merges options.
 */
export declare function collectDecisionQuestions(template: string): CollectedDecisionQuestion[];
/**
 * Whether parsed import data uses decisions: prompt statements, lorebook activation,
 * or agent activation questions. Walks parsed data rather than raw JSON text, whose
 * escaped quotes the condition parser should never see.
 */
export declare function containsDecisionStatements(value: unknown, depth?: number): boolean;
/**
 * The resolved statements a template can ask in this context: one for the context
 * itself, plus one per character when the statement names `{{char}}` or another
 * character macro, because a group block or a per-responder pass asks it once per
 * character.
 */
export declare function resolveDecisionQuestionVariants(question: string, ctx: MacroContext): string[];
/** Detect authored field references without treating comments or literal prose as macros. */
export declare function templateReferencesAnyMacro(template: string, names: readonly string[]): boolean;
export declare function selectConditionalPayloadBranch(payload: DeferredConditionalPayload, ctx: MacroContext, options: ResolveMacroOptions): string;
/**
 * The decision statements `template` can reach this turn, with every other value in
 * `ctx` as it is. Answers the turn already has count; any other decision is unknown.
 * Nothing is written back: variables are copied, and nothing is asked.
 *
 * `text` is the template with every branch that could be taken, or with `settledOnly`,
 * only the branches already settled, for a lorebook scan that must not follow a branch
 * before its decision is answered.
 */
export declare function planDecisionStatements(template: string, ctx: MacroContext, options?: {
    settledOnly?: boolean;
}): {
    text: string;
    statements: Set<string>;
};
/** Decode one layer of XML protocol escaping, not authored prompt/content leaves. */
export declare function decodeAgentXmlEntities(input: string): string;
/**
 * Remove conditional control syntax from agent-bound text while keeping every
 * authored branch. Agent calls need the prose as context, not the main prompt's
 * character-specific control flow.
 */
export declare function flattenAgentConditionalMacros(input: string): string;
/** Keep generated summaries inside their readers' scope without nesting duplicate character guards. */
export declare function scopeCharacterSummary(input: string, characterNames: readonly string[], depth?: number): string;
/** Whether text uses `{{include::...}}`, so a caller loads lorebooks only when it must. */
export declare function usesLorebookIncludes(text: string): boolean;
/**
 * Replace `{{include::ENTRY}}` and `{{include::BOOK::ENTRY}}` with that lorebook entry's
 * content (#6912). Books and entries are found by ID first, then by name, ignoring case;
 * the short form looks for a name in `currentBookIds`. No match reads as empty.
 *
 * Included text can include more, and its own short form looks in its own lorebook. An
 * entry already included on the way here reads as empty, so `A -> B -> A` stops.
 */
export declare function expandLorebookIncludes(text: string, source: LorebookIncludeSource, scope?: {
    currentBookIds?: readonly string[];
    seen?: ReadonlySet<string>;
}, options?: ResolveMacroOptions): string;
/**
 * Replace macros in a prompt string with their values.
 *
 * Supported macros (SillyTavern-compatible):
 *  - {{user}} — user's display name
 *  - {{persona}} — active persona description, personality, backstory, appearance, and scenario joined by new lines
 *  - {{char}} — current character name
 *  - {{CHARACTER_ID}} — name of another character card referenced by its exact ID
 *  - {{persona-PERSONA_ID}} — name of another persona card referenced by its exact ID
 *  - {{characters}} — comma-separated list of all character names
 *  - {{group}} — comma-separated list of other active chat characters
 *  - {{description}} / {{personality}} / {{backstory}} / {{appearance}} / {{scenario}} / {{example}} — current character card fields
 *  - {{charSysInfo}} / {{charPostHistory}} — current character instruction fields
 *  - {{date}} — current real date in the user's timezone (YYYY-MM-DD)
 *  - {{time}} — current real time in the user's timezone (HH:MM)
 *  - {{datetime}} — current datetime in the user's timezone
 *  - {{weekday}} — current day name in the user's timezone (Monday, etc.)
 *  - {{isotime}} — timestamp in the user's timezone
 *  - {{timezone}} — current user/browser timezone
 *  - {{random}} — random number 0-100
 *  - {{random:X:Y}} — random number X-Y
 *  - {{random::A::B::C}} — random choice from A, B, C
 *  - {{random::A@2::B@0.5}} — weighted random choice; weights are relative
 *  - {{roll:XdY}} — dice roll (e.g. {{roll:2d6}})
 *  - {{getvar::name}} — read a dynamic variable
 *  - {{setvar::name::value}} — set a variable
 *  - {{addvar::name::value}} — append to a variable
 *  - {{addnumvar::name::value}} — add to a numeric variable
 *  - {{incvar::name}} — increment numeric variable by 1
 *  - {{decvar::name}} — decrement numeric variable by 1
 *  - {{input}} — last user message
 *  - {{model}} — current model name
 *  - {{chatId}} — current chat ID
 *  - {{lastGenerationType}} — current generation type label
 *  - {{idle_duration}} — time since the last chat activity
 *  - {{outlet::name}} — activated lorebook entries assigned to a named Outlet
 *  - {{lorebooksize::ID}} — total number of entries in the lorebook with the given ID
 *  - {{include::ENTRY}} / {{include::BOOK::ENTRY}} — content of a lorebook entry (see expandLorebookIncludes)
 *  - {{gameStoryboardKeyframeCount}} — current Game Mode Keyframes per Turn target
 *  - {{// comment}} — removed (author comments)
 *  - {{trim}} — remove surrounding whitespace
 *  - {{trimStart}} / {{trimEnd}} — directional trim markers
 *  - {{newline}} / {{\n}} — literal newline
 *  - {{noop}} — no operation, removed
 *  - {{banned "text"}} — content filter (removed for now)
 *  - {{uppercase}}...{{/uppercase}} — convert to uppercase
 *  - {{lowercase}}...{{/lowercase}} — convert to lowercase
 *  - {{#if char == "Name" || "Other"}}...{{else}}...{{/if}} — conditional block with OR/AND logic
 */
export declare function resolveMacros(template: string, ctx: MacroContext, options?: ResolveMacroOptions): string;
export {};
//# sourceMappingURL=macro-engine.d.ts.map