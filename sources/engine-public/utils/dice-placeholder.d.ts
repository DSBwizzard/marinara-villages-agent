import { type ParsedDiceNotation } from "./dice-notation.js";
/**
 * The opener, as written. A single-bracket `[roll:` is Roleplay's own command and is
 * never claimed here. Exported because the stream filter has to recognise a PARTIAL
 * opener mid-token, which is a prefix test on this string rather than a scan.
 */
export declare const ROLL_PLACEHOLDER_OPENER = "[[roll:";
/** Longest body the pass will read. Past this the placeholder is refused, not truncated. */
export declare const PLACEHOLDER_BODY_MAX = 64;
/**
 * What a refused placeholder becomes. No bracket, no colon, no brace, so it survives
 * every stripper, the segment editor and the prompt leaf as ordinary prose.
 */
export declare const ROLL_UNAVAILABLE_TEXT = "(roll unavailable)";
/** Why the engine would not read a placeholder. Every one of these becomes the notice. */
export type RollPlaceholderRefusal = 
/** No `]]` before the line ended, so the span was bounded by the line or the cap. */
"unterminated"
/** The body ran past `PLACEHOLDER_BODY_MAX`. */
 | "over-long"
/** The body carried a `]`, so the span the model wrote is not the span it meant. */
 | "closing-bracket"
/** Not one NdM term with at most one flat modifier and at most one sheet name. */
 | "notation"
/** A sheet name the chat's loaded modifiers do not carry. Refused, never defaulted to zero. */
 | "unresolved-name";
/** One bounded `[[roll:` span, whether or not its body can be read. */
export interface RollPlaceholderSpan {
    /** Offset of the `[[` in the scanned content. */
    start: number;
    /** Offset one past the end of the bounded span. */
    end: number;
    /** The span exactly as the model wrote it, for the audit log. */
    raw: string;
    /** The span's interior, trimmed. */
    body: string;
    /** Set when the scan alone already proves the span cannot be read. */
    refusal: RollPlaceholderRefusal | null;
}
/** One readable body: the dice term, plus at most one sheet name to ask the chat about. */
export interface ParsedRollPlaceholderBody {
    /** The NdM term with its flat modifier folded in, validated by the shared grammar. */
    dice: ParsedDiceNotation;
    /** The single sheet name written after the dice term, when there was one. */
    sheetName: string | null;
    /** `-STR` subtracts what `+STR` would add. */
    sheetSign: 1 | -1;
}
/** What a chat's sheet contributes for one name, and which form supplied it. */
export interface RollPlaceholderSheetModifier {
    /** Already summed: the attribute modifier alone, or a skill bonus plus its governing attribute. */
    value: number;
    source: "attribute" | "skill";
}
export interface RollPlaceholderDeps {
    /** One die of `sides` faces. The engine passes its `crypto.randomInt` supplier. */
    nextValue: (sides: number) => number;
    /**
     * Resolve a sheet name to a modifier, or `null` when the chat cannot.
     *
     * Returning `null` refuses the placeholder. It deliberately does not default to
     * zero: a placeholder's name is only a modifier source, so defaulting it would add
     * a number nobody asked for to a sentence the player reads as fact. Omit the
     * callback entirely when the chat carries no names at all.
     */
    resolveSheetName?: (name: string) => RollPlaceholderSheetModifier | null;
}
/**
 * One substituted placeholder: what was rolled, and where the number landed.
 *
 * Saved out of band, because the content itself carries a bare number so the prompt
 * leaf and the transcript both read as prose.
 */
export interface GameDicePlaceholderRecord {
    /** The body as the model wrote it, for audit: "2d6+3", "1d8+STR". */
    raw: string;
    /** The notation actually thrown, after clamping and sheet resolution, with the modifier total. */
    notation: string;
    rolls: number[];
    /** The summed modifier: the flat term plus whatever the sheet name resolved to. */
    modifier: number;
    /**
     * Which form supplied the modifier, so a hover can name its source. A body carrying
     * both a flat number and a sheet name reports the sheet form; `raw` carries the rest.
     */
    modifierSource: "flat" | "attribute" | "skill" | "none";
    total: number;
    /** The substituted text, as written into content. */
    text: string;
    /** Character offset of `text` in the substituted content. */
    index: number;
}
/** One placeholder the pass refused, for the log line and the turn notice. */
export interface RollPlaceholderRefusalRecord {
    /** The bounded span, verbatim. */
    raw: string;
    reason: RollPlaceholderRefusal;
    /** The name that did not resolve, when that was the reason. */
    name?: string;
}
/** One notation the shared ceilings trimmed. `500d6` is thrown, and recorded, as `100d6`. */
export interface RollPlaceholderClamp {
    requested: string;
    thrown: string;
}
export interface RollPlaceholderPass {
    content: string;
    changed: boolean;
    records: GameDicePlaceholderRecord[];
    refusals: RollPlaceholderRefusalRecord[];
    clamps: RollPlaceholderClamp[];
}
/** Whether the content is worth walking at all. */
export declare function hasRollPlaceholder(content: string): boolean;
/** Walk every `[[roll:` opener and bound its span. Malformed spans are found, not skipped. */
export declare function scanRollPlaceholders(content: string): RollPlaceholderSpan[];
/**
 * Whether a sheet name is one a placeholder could ever carry. The prompt advertises only
 * names that pass this, so a name the grammar would refuse (a bracket, a newline, a sign)
 * is never offered and can never reshape the block it is printed into.
 */
export declare function isRollPlaceholderName(name: string): boolean;
/**
 * Read one placeholder body.
 *
 * One NdM term with an optional flat modifier — exactly the shared dice grammar — then
 * at most one flat number and at most one sheet name, in either order:
 * `2d6+3`, `1d8+STR`, `2d6+3+STR` and `2d6+STR+3` are all legal.
 *
 * Two different dice in one placeholder (`1d8+1d6`) is not supported, and is refused
 * here rather than given a second grammar: the whole point of the shared notation
 * module is that this codebase has one. The model writes two placeholders.
 */
export declare function parseRollPlaceholderBody(body: string): ParsedRollPlaceholderBody | null;
/**
 * Roll every readable placeholder and replace every unreadable one.
 *
 * The walk splices in reading order over one cursor, so the prose between spans is
 * kept byte for byte and each record's `index` is its offset in the text this returns
 * rather than in the text that went in.
 *
 * An oversized notation is CLAMPED rather than refused, which is this path's shipped
 * policy: `[[roll: 500d6]]` substitutes a `100d6` total and the clamp is reported so
 * the caller can log it. The record names the dice actually thrown, never the ones
 * asked for.
 */
export declare function resolveRollPlaceholders(content: string, deps: RollPlaceholderDeps): RollPlaceholderPass;
/**
 * Replace every `[[roll:` span with the notice, reading none of them.
 *
 * The failure path: used when the pass itself could not run, so that no raw span
 * reaches saved content for a downstream stripper to half-eat.
 */
export declare function replaceRollPlaceholdersWithNotice(content: string): {
    content: string;
    changed: boolean;
    spans: string[];
};
//# sourceMappingURL=dice-placeholder.d.ts.map