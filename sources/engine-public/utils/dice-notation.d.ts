import type { DiceRollResult } from "../types/game.js";
/**
 * NdM notation: an optional die count (bare `d20` means one die), a face count,
 * and an optional flat modifier. Case-insensitive.
 */
export declare const DICE_NOTATION_REGEX: RegExp;
/** Most dice one notation may throw. */
export declare const MAX_DICE_COUNT = 100;
/** Most faces a die may have. */
export declare const MAX_DICE_SIDES = 1000;
export interface ParsedDiceNotation {
    /** The notation as written, trimmed. */
    notation: string;
    /** The NdM half, lowercased and without the modifier — "d20", "2d6". */
    dice: string;
    /** Number of dice to throw (at least 1). */
    count: number;
    /** Faces per die (at least 1). */
    sides: number;
    /** Flat modifier; 0 when the notation carried none. */
    modifier: number;
}
/**
 * Parse NdM notation.
 *
 * Returns `null` when the text is not dice notation, when it asks for fewer
 * than one die or fewer than one face, when a count, face or modifier value is
 * too large to be an exact integer, or when the range of totals the notation
 * could roll would leave the exact integers at either end.
 *
 * Ceilings past that are each caller's policy, not the grammar's: this module
 * does not decide whether `500d6` is refused or clamped, because the shipped
 * callers genuinely disagree — see `isWithinDiceLimits` and
 * `clampParsedDiceToLimits`.
 */
export declare function parseDiceNotation(value: string): ParsedDiceNotation | null;
/** Whether the text is dice notation this engine can roll. */
export declare function isDiceNotation(value: string): boolean;
/** Whether a parsed notation sits inside the shared count and face ceilings. */
export declare function isWithinDiceLimits(parsed: Pick<ParsedDiceNotation, "count" | "sides">): boolean;
/**
 * Trim an oversized notation down to the ceilings instead of refusing it.
 *
 * The clamped result carries the notation of the dice that will actually be
 * thrown, not the one that was asked for — `500d6` comes back as `100d6`. This
 * type holds one notation, not a requested/rolled pair, and the notation every
 * reader of a roll shows is this one: the dice card's header, the narrator tag
 * the model is handed, the metadata stored on the message. A clamped roll used
 * to hand all three the request, so a hundred dice landed under a card headed
 * `500d6`. The request now survives only where a caller kept its own copy of the
 * input, which is where a caller that wants to say "asked for 500, threw 100"
 * would read it from.
 *
 * A notation already inside the ceilings comes back unchanged down to the
 * characters — `1d020` stays `1d020` — so only a roll that really was trimmed
 * reads differently than it did.
 *
 * Callers that must not throw fewer dice than a model asked for use
 * `isWithinDiceLimits` and refuse instead.
 */
export declare function clampParsedDiceToLimits(parsed: ParsedDiceNotation): ParsedDiceNotation;
/**
 * Throw the dice a parsed notation asks for.
 *
 * Unseeded `Math.random()`, exactly as each call site rolled before this module
 * existed — consolidating the grammar deliberately did not touch the RNG.
 */
export declare function rollParsedDice(parsed: ParsedDiceNotation): DiceRollResult;
//# sourceMappingURL=dice-notation.d.ts.map