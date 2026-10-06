export interface ThinkingTagPair {
    open: string;
    close: string;
}
export interface LeadingThinkingExtraction {
    content: string;
    thinking: string;
    stripped: boolean;
}
export declare const BUILT_IN_THINKING_TAG_PAIRS: ThinkingTagPair[];
export declare function normalizeThinkingTagPairs(value: unknown): ThinkingTagPair[];
/**
 * Extract leading inline reasoning blocks that some models emit instead of
 * returning provider-native thinking channels.
 */
export declare function extractLeadingThinkingBlocks(text: string, customTags?: unknown): LeadingThinkingExtraction;
export interface InlineThinkingStreamFilterResult {
    visible: string;
    thinking: string;
}
export interface InlineThinkingStreamFilter {
    push(chunk: string): InlineThinkingStreamFilterResult;
    flush(): InlineThinkingStreamFilterResult;
    reset(): void;
}
export declare function createInlineThinkingStreamFilter(customTags?: unknown): InlineThinkingStreamFilter;
//# sourceMappingURL=thinking-tags.d.ts.map