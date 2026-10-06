import { z } from "zod";
/** Custom emoji names are slugs used in `:name:` tokens — lowercase letters, digits, underscores. */
export declare const CUSTOM_EMOJI_NAME_PATTERN: RegExp;
/** Custom emojis are dimension-gated like gallery-tagged emojis (max 256x256). */
export declare const CUSTOM_EMOJI_MAX_DIMENSION = 256;
export declare const customEmojiNameSchema: z.ZodString;
export declare const createCustomEmojiSchema: z.ZodObject<{
    name: z.ZodString;
    filePath: z.ZodString;
    width: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
    height: z.ZodDefault<z.ZodNullable<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    filePath: string;
    width: number | null;
    height: number | null;
}, {
    name: string;
    filePath: string;
    width?: number | null | undefined;
    height?: number | null | undefined;
}>;
export declare const updateCustomEmojiSchema: z.ZodObject<{
    name: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
}, {
    name: string;
}>;
export type CreateCustomEmojiInput = z.infer<typeof createCustomEmojiSchema>;
export type UpdateCustomEmojiInput = z.infer<typeof updateCustomEmojiSchema>;
export declare const CUSTOM_EMOJI_SELECTION_MODES: readonly ["random", "semantic", "tool-call"];
export type CustomEmojiSelectionMode = (typeof CUSTOM_EMOJI_SELECTION_MODES)[number];
export interface CustomEmojiSelectionPrefs {
    /** How the advertised subset is chosen when there are more emojis than maxCount. */
    mode: CustomEmojiSelectionMode;
    /** Max custom emojis advertised to the model per responder pool. */
    maxCount: number;
    /** Connection used for the tool-call selection mode (null = none). */
    toolConnectionId: string | null;
}
export declare const CUSTOM_EMOJI_SELECTION_MIN_COUNT = 1;
export declare const CUSTOM_EMOJI_SELECTION_MAX_COUNT = 100;
export declare const CUSTOM_EMOJI_SELECTION_DEFAULTS: CustomEmojiSelectionPrefs;
/** Coerce stored/partial/unknown chat metadata into valid selection prefs (fills defaults, clamps count). */
export declare function normalizeCustomEmojiSelection(raw: unknown): CustomEmojiSelectionPrefs;
//# sourceMappingURL=custom-emoji.schema.d.ts.map