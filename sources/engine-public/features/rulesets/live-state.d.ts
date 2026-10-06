import { z } from "zod";
import { type RulesetCatalogEntriesById, type RulesetCatalogEntry, type RulesetDefinition, type RulesetLiveTrack, type RulesetSheetBuild, type RulesetTrackKind, type RulesetTrackLevel } from "../../schemas/ruleset.schema.js";
import { evaluateRulesetSheet, type RulesetSheetItem } from "./sheet-math.js";
export interface RulesetLivePoolValue {
    value: number;
    temp?: number;
}
/** What one WOUND TRACK carries in play. The definition holds `kinds`; this holds MARKS, which are
 *  those kinds sitting on the track. The two words never swap, in code, comments or docs. */
export interface RulesetLiveWounds {
    /** Kind ids, sorted most severe first. `marks[i]` sits on the track's level `i`. */
    marks: string[];
    /** Marks that could not land because the track was full at its worst kind. Persisted, because a
     *  reload that forgot them would quietly undo harm somebody already took. */
    overflow?: number;
}
export interface RulesetLiveState {
    pools?: Record<string, RulesetLivePoolValue>;
    tracks?: Record<string, number>;
    /** Wound tracks only, keyed by track id. A plain track's number stays in `tracks`. */
    wounds?: Record<string, RulesetLiveWounds>;
    text?: Record<string, string>;
    conditions?: string[];
    /** Live states away from their default, keyed by state id: the value they are at. */
    states?: Record<string, string>;
}
/** Live state of every card in one game, keyed by normalizeCharacterLookupName(card name). */
export type RulesetLiveStates = Record<string, RulesetLiveState>;
/** A stored live blob is refused above this many serialized bytes, like a stored sheet is. */
export declare const RULESET_LIVE_MAX_BYTES: number;
export declare const rulesetLivePoolValueSchema: z.ZodObject<{
    value: z.ZodNumber;
    temp: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    value: number;
    temp?: number | undefined;
}, {
    value: number;
    temp?: number | undefined;
}>;
/** A track holds at most one mark per level, and the format caps how long one character's track may
 *  come to, so a longer list is a corrupt or hostile blob rather than a sheet. Kind ids are sheet
 *  ids, so they are short; an indexed track stores "" for an empty box between marked ones. */
export declare const rulesetLiveWoundsSchema: z.ZodObject<{
    marks: z.ZodArray<z.ZodString, "many">;
    overflow: z.ZodOptional<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    marks: string[];
    overflow?: number | undefined;
}, {
    marks: string[];
    overflow?: number | undefined;
}>;
/** One character's live state. Unknown top-level keys are stripped rather than refused: a newer
 *  Engine's key must not make the whole game's state unwritable on an older one. */
export declare const rulesetLiveStateSchema: z.ZodObject<{
    pools: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodObject<{
        value: z.ZodNumber;
        temp: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        value: number;
        temp?: number | undefined;
    }, {
        value: number;
        temp?: number | undefined;
    }>>, Record<string, {
        value: number;
        temp?: number | undefined;
    }>, Record<string, {
        value: number;
        temp?: number | undefined;
    }>>>;
    tracks: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodNumber>, Record<string, number>, Record<string, number>>>;
    wounds: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodObject<{
        marks: z.ZodArray<z.ZodString, "many">;
        overflow: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        marks: string[];
        overflow?: number | undefined;
    }, {
        marks: string[];
        overflow?: number | undefined;
    }>>, Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }>, Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }>>>;
    text: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    states: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>>;
}, "strip", z.ZodTypeAny, {
    text?: Record<string, string> | undefined;
    pools?: Record<string, {
        value: number;
        temp?: number | undefined;
    }> | undefined;
    tracks?: Record<string, number> | undefined;
    conditions?: string[] | undefined;
    states?: Record<string, string> | undefined;
    wounds?: Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }> | undefined;
}, {
    text?: Record<string, string> | undefined;
    pools?: Record<string, {
        value: number;
        temp?: number | undefined;
    }> | undefined;
    tracks?: Record<string, number> | undefined;
    conditions?: string[] | undefined;
    states?: Record<string, string> | undefined;
    wounds?: Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }> | undefined;
}>;
/** The whole game's live state, as a PATCH route receives it. */
export declare const rulesetLiveStatesSchema: z.ZodEffects<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodObject<{
    pools: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodObject<{
        value: z.ZodNumber;
        temp: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        value: number;
        temp?: number | undefined;
    }, {
        value: number;
        temp?: number | undefined;
    }>>, Record<string, {
        value: number;
        temp?: number | undefined;
    }>, Record<string, {
        value: number;
        temp?: number | undefined;
    }>>>;
    tracks: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodNumber>, Record<string, number>, Record<string, number>>>;
    wounds: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodObject<{
        marks: z.ZodArray<z.ZodString, "many">;
        overflow: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        marks: string[];
        overflow?: number | undefined;
    }, {
        marks: string[];
        overflow?: number | undefined;
    }>>, Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }>, Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }>>>;
    text: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>>;
    conditions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    states: z.ZodOptional<z.ZodEffects<z.ZodRecord<z.ZodString, z.ZodString>, Record<string, string>, Record<string, string>>>;
}, "strip", z.ZodTypeAny, {
    text?: Record<string, string> | undefined;
    pools?: Record<string, {
        value: number;
        temp?: number | undefined;
    }> | undefined;
    tracks?: Record<string, number> | undefined;
    conditions?: string[] | undefined;
    states?: Record<string, string> | undefined;
    wounds?: Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }> | undefined;
}, {
    text?: Record<string, string> | undefined;
    pools?: Record<string, {
        value: number;
        temp?: number | undefined;
    }> | undefined;
    tracks?: Record<string, number> | undefined;
    conditions?: string[] | undefined;
    states?: Record<string, string> | undefined;
    wounds?: Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }> | undefined;
}>>, Record<string, {
    text?: Record<string, string> | undefined;
    pools?: Record<string, {
        value: number;
        temp?: number | undefined;
    }> | undefined;
    tracks?: Record<string, number> | undefined;
    conditions?: string[] | undefined;
    states?: Record<string, string> | undefined;
    wounds?: Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }> | undefined;
}>, Record<string, {
    text?: Record<string, string> | undefined;
    pools?: Record<string, {
        value: number;
        temp?: number | undefined;
    }> | undefined;
    tracks?: Record<string, number> | undefined;
    conditions?: string[] | undefined;
    states?: Record<string, string> | undefined;
    wounds?: Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }> | undefined;
}>>, Record<string, {
    text?: Record<string, string> | undefined;
    pools?: Record<string, {
        value: number;
        temp?: number | undefined;
    }> | undefined;
    tracks?: Record<string, number> | undefined;
    conditions?: string[] | undefined;
    states?: Record<string, string> | undefined;
    wounds?: Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }> | undefined;
}>, Record<string, {
    text?: Record<string, string> | undefined;
    pools?: Record<string, {
        value: number;
        temp?: number | undefined;
    }> | undefined;
    tracks?: Record<string, number> | undefined;
    conditions?: string[] | undefined;
    states?: Record<string, string> | undefined;
    wounds?: Record<string, {
        marks: string[];
        overflow?: number | undefined;
    }> | undefined;
}>>;
export interface RulesetLivePoolSpec {
    key: string;
    label: string;
    max: number;
    allowTemp: boolean;
    group?: string;
    start: "full" | "empty";
    recharge?: string;
    listId?: string;
}
/** Every pool this sheet currently has: the declared ones a `hideWhen` does not hide and whose
 *  maximum is above zero, then one pool per row of every list that declares `pools`. A row is keyed
 *  by its name, so renaming a row starts its pool over — that is the format's own rule. */
export declare function listRulesetLivePools(definition: RulesetDefinition, build: RulesetSheetBuild): RulesetLivePoolSpec[];
/** A wound track as it stands. Present on a resolved track only when the definition gave it
 *  `levels` or `boxes`; a plain track has none of this and behaves exactly as it always has. */
export interface ResolvedRulesetWounds {
    /** This character's levels: the named ones with any a list adds, or the numbered boxes. */
    levels: readonly RulesetTrackLevel[];
    kinds: readonly RulesetTrackKind[];
    /** `marks[i]` sits on `levels[i]`. Most severe first on a sequential track; on an indexed one each
     *  mark stays on its box and an empty box between marked ones is "". */
    marks: string[];
    /** How many boxes are marked, which on an indexed track is not how long `marks` is. */
    filled: number;
    /** The worst marked level, or -1 when the track is clear. */
    lowest: number;
    /** Marks that could not land at all, because the track was full at its worst kind. */
    overflow: number;
    /** The penalty in force: on named levels the one on the LOWEST marked level, never a sum (0 when
     *  unmarked); on boxes, the track's table read at the boxes filled or remaining. */
    penalty: number;
    /** Boxes rather than named levels, so a level's label is only its number. */
    numbered: boolean;
    /** A mark lands on the box a command names and the marks never move. */
    indexed: boolean;
    /** A mark with no box free is refused rather than upgrading the lightest one. */
    refusesWhenFull: boolean;
}
export interface ResolvedRulesetLive {
    pools: Array<RulesetLivePoolSpec & {
        value: number;
        temp: number;
    }>;
    tracks: Array<{
        id: string;
        label: string;
        min: number;
        max: number;
        value: number;
        wound?: ResolvedRulesetWounds;
    }>;
    text: Array<{
        id: string;
        label: string;
        maxLength: number;
        value: string;
    }>;
    conditions: Array<{
        id: string;
        label: string;
        active: boolean;
    }>;
    /** Every state the sheet shows, at its value: what is stored when the state still offers it, else
     *  its default. A state the sheet hides is left out. */
    states: Array<{
        id: string;
        label: string;
        values: string[];
        valueLabels?: Record<string, string>;
        value: string;
        /** The value's display text. */
        valueLabel: string;
    }>;
}
/** Whether this track is a wound track rather than a bounded integer. */
export declare function isRulesetWoundTrack(track: RulesetLiveTrack): boolean;
/**
 * The penalty in force on one named wound track, read from a stored live blob and the character's
 * own build: a track's length may be the sheet's own number, and a list may add levels to it.
 *
 * 0 for a track that does not exist or is not a wound track, so a caller never has to ask which of
 * those it was before it can roll.
 */
export declare function readRulesetWoundPenalty(definition: RulesetDefinition, build: RulesetSheetBuild, stored: unknown, trackId: string): number;
/** Where a live state starts, and where a rest's `to: "default"` puts it back. */
export declare function rulesetStateDefault(state: {
    values: readonly string[];
    default?: string;
}): string;
/** The sheet's live state as it reads right now. Never throws: junk reads as defaults. */
export declare function readRulesetLive(definition: RulesetDefinition, build: RulesetSheetBuild, stored: unknown): ResolvedRulesetLive;
/** Every number the sheet yields, with its live tracks and pools read as they stand in `stored`:
 *  the snapshot a check, a fight or the Game Master's sheet block works from. With nothing stored
 *  (the sheet editor, an import review) they read at their declared defaults, a pool full or empty
 *  as it starts and a track where it starts. The live state's own maximums never read it back
 *  (refused at import), so resolving them first cannot loop. */
export declare function evaluateRulesetSheetLive(definition: RulesetDefinition, build: RulesetSheetBuild, stored?: unknown, 
/** The items the character holds, which an `itemStat` reads; none outside a game. */
items?: ReadonlyArray<RulesetSheetItem>): ReturnType<typeof evaluateRulesetSheet>;
export type RulesetSheetOp = 
/** The four that move one pool. One member rather than four, because `damage` also has a track
 *  shape below and two members under one name could not be told apart by the name alone. */
{
    op: "spend" | "restore" | "damage" | "temp";
    pool: string;
    amount: number;
}
/** Marks a WOUND track. `kind` is one the track declares; `amount` is a number of marks of that
 *  one kind, and a NEGATIVE amount heals, clearing marks of that kind (the lightest first when the
 *  kind is not one the track knows). `box` is where the first mark aims on an indexed track: that
 *  box, or the next free one above it. Told apart from the pool shape above by naming a track,
 *  which is what `"track" in op` reads. */
 | {
    op: "damage";
    track: string;
    kind: string;
    amount: number;
    box?: number;
} | {
    op: "track";
    track: string;
    to?: number;
    by?: number;
} | {
    op: "condition";
    condition: string;
    active: boolean;
}
/** Sets a live state to one of its values, named by the value or its label. */
 | {
    op: "state";
    state: string;
    value: string;
} | {
    op: "note";
    field: string;
    value: string;
} | {
    op: "rest";
    rest: string;
}
/** Uses something the character picked from a catalog, paying everything it costs. Resolved by
 *  `planRulesetUse` before it reaches `applyRulesetSheetOp`, because it needs the catalogs. */
 | {
    op: "use";
    name: string;
    pool?: string;
};
export type RulesetSheetRefusal = "unknown-pool" | "ambiguous-pool" | "insufficient" | "bad-amount" | "no-temp" | "unknown-track"
/** A track op on a wound track, or a wound op on a plain one. */
 | "wrong-track"
/** A kind the wound track does not declare. */
 | "unknown-kind"
/** A track that refuses a mark it has no box for had none free. */
 | "no-box" | "unknown-condition"
/** A live state the sheet does not have (or hides). */
 | "unknown-state"
/** A value the live state does not offer. */
 | "unknown-value" | "unknown-field" | "unknown-rest" | "unknown-entry" | "ambiguous-entry" | "bad-pool" | "malformed";
export type RulesetSheetOpResult = {
    ok: true;
    live: RulesetLiveState;
    now: string;
} | {
    ok: false;
    reason: RulesetSheetRefusal;
};
/** The op names a tag may spell. `heal` is an alias the tag layer folds into `restore`, and `cast`
 *  one it folds into `use`. */
export declare const RULESET_SHEET_OP_NAMES: readonly ["spend", "restore", "damage", "temp", "track", "condition", "state", "note", "rest", "use"];
/** Apply one command to one character's live state. Pure: the input blob is never touched, and the
 *  result is a new sparse state. A refusal changes nothing, which is what lets the Game Master's
 *  fiction be corrected rather than silently accepted. */
export declare function applyRulesetSheetOp(definition: RulesetDefinition, build: RulesetSheetBuild, stored: unknown, op: RulesetSheetOp): RulesetSheetOpResult;
export interface RulesetUseStep {
    op: RulesetSheetOp;
    /** The pool this step pays, as the sheet shows it, for the outcome written back into the tag. */
    label: string;
}
/**
 * The ONE rule for which picked entry a name means, so everything that acts on a named entry acts
 * on the same one: a row answers to the name the sheet shows it under and to the label of the entry
 * it came from, and a name two rows answer to is refused rather than guessed at.
 */
export declare function rulesetEntryNamed(definition: RulesetDefinition, build: RulesetSheetBuild, catalogs: RulesetCatalogEntriesById, wanted: string): {
    ok: true;
    ref: string;
    entry: RulesetCatalogEntry;
} | {
    ok: false;
    reason: RulesetSheetRefusal;
};
export type RulesetUsePlan = {
    ok: true;
    label: string;
    steps: RulesetUseStep[];
} | {
    ok: false;
    reason: RulesetSheetRefusal;
};
/**
 * What using one catalog-picked ability spends, or why it cannot be worked out. Pure: nothing is
 * applied here, and the caller puts every step through `applyRulesetSheetOp` on a working copy so a
 * refusal in the middle leaves the sheet exactly as it was.
 *
 * A catalog the caller could not fetch reads as an entry that is not there: the Engine cannot know
 * what the ability costs, and guessing would let a spell be cast for free.
 */
export declare function planRulesetUse(definition: RulesetDefinition, build: RulesetSheetBuild, stored: unknown, catalogs: RulesetCatalogEntriesById, op: Extract<RulesetSheetOp, {
    op: "use";
}>): RulesetUsePlan;
//# sourceMappingURL=live-state.d.ts.map