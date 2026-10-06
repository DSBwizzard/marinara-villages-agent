import { type RulesetCatalogItem, type RulesetDefinition, type RulesetDifficultyLadderStep, type RulesetHideWhen, type RulesetSheetBuild, type RulesetSheetEnvelope, type RulesetUntrained, type RulesetValueRef } from "../../schemas/ruleset.schema.js";
type StepTable = ReadonlyArray<readonly [number, number]>;
type Rounding = "down" | "up" | "nearest";
export declare function lookupStepTable(table: StepTable, input: number): number;
export declare function roundRulesetNumber(value: number, mode: Rounding): number;
/** A complete, blank starting build: every ability, field and tier at its declared default. */
export declare function defaultRulesetSheetBuild(definition: RulesetDefinition): RulesetSheetBuild;
export declare function createRulesetSheetEnvelope(definition: RulesetDefinition, build?: RulesetSheetBuild): RulesetSheetEnvelope;
/** The copy a new game takes of a starting build: the stored sheet when it reads as one, else a
 *  blank default, so every party member has a sheet from the first turn. Always a deep copy — a
 *  game edits its own sheet and nothing in a game writes back to the library. */
export declare function copyRulesetSheetForGame(definition: RulesetDefinition, stored: unknown): RulesetSheetEnvelope;
export interface EvaluatedRulesetSheet {
    abilityScores: Record<string, number>;
    abilityMods: Record<string, number>;
    proficiencyBonus: number;
    /** Proficiency tier id per skill and per save, defaulted to the ruleset's first tier. */
    skillTiers: Record<string, string>;
    saveTiers: Record<string, string>;
    skillMods: Record<string, number>;
    saveMods: Record<string, number>;
    derived: Record<string, number>;
    /** Number fields as read (default applied), which value references resolve against. */
    numbers: Record<string, number>;
    /** The skills and saves a `cap` holds down: the cap in force and the number before it. `skillMods`
     *  and `saveMods` already hold the capped number; a `with=` swap works from the uncapped one and
     *  caps again, so swapping an ability can never lift a check past its cap. */
    skillCaps: Record<string, {
        cap: number;
        uncapped: number;
    }>;
    saveCaps: Record<string, {
        cap: number;
        uncapped: number;
    }>;
    /** The live state this sheet was worked out with, so a reference resolved against it later (a
     *  modifier off the sheet, a spend's limit, a fight's defense) reads the same values. */
    live?: RulesetSheetLiveValues;
}
/** What a `liveTrack` or `livePool` reference, or an enum table keyed on a live state, reads: one
 *  character's live state as `readRulesetLive` resolves it (a pool at its value, a track with its
 *  bounds and, on a wound track, the penalty in force, a state at its value). Described here rather
 *  than imported, so the arithmetic never depends on the live state's own module, which depends on
 *  it. A state the sheet hides is not in `states`. */
export interface RulesetSheetLiveValues {
    pools: ReadonlyArray<{
        key: string;
        value: number;
    }>;
    tracks: ReadonlyArray<{
        id: string;
        min: number;
        max: number;
        value: number;
        wound?: {
            penalty: number;
        };
    }>;
    states?: ReadonlyArray<{
        id: string;
        value: string;
    }>;
    /** The items the character holds, which an `itemStat` reads. None outside a game. */
    items?: ReadonlyArray<RulesetSheetItem>;
}
/** One stack of the ruleset's items a character holds, as the sheet reads it: what the item is, how
 *  many, and whether it is worn (on, and bound where it must be). */
export interface RulesetSheetItem {
    item: RulesetCatalogItem;
    quantity: number;
    worn: boolean;
    /** What the stack is called, for a record of what an item did. */
    name?: string;
    /** Which inventory stack this is, so what a fight shoots or loads can be written back to it. */
    stack?: {
        id: string;
        ref: string;
        holder?: string;
    };
    /** What a weapon with a clip has loaded, as the stack keeps it. Absent reads as full. */
    loaded?: number;
    /** The charges an item holds, as the stack keeps them. Absent reads as full. */
    charges?: number;
}
/** Whether the sheet can read the items a character holds, so a caller can skip reading the
 *  inventory and the item catalogs when it cannot: only a ruleset with items has any, and then an
 *  `itemStat`, an item's abilities or a level off a derived value may read them. */
export declare function rulesetReadsItems(definition: RulesetDefinition): boolean;
export declare function rulesetAbilityModifier(definition: RulesetDefinition, score: number): number;
/** What a check on this skill or save does when the character has no training in it: its own rule,
 *  else its section's, else the ordinary one. */
export declare function rulesetUntrainedRule(definition: RulesetDefinition, entry: {
    section?: string;
    untrained?: RulesetUntrained;
}): RulesetUntrained;
/** Abilities, skills or saves under the section headings they sit in: the sheet's sections in their
 *  own order, then the ones that name none under no heading. When nothing names a section there is
 *  one group with no heading, so a sheet with no sections reads exactly as it always has. */
export declare function rulesetSectionGroups<T extends {
    section?: string;
}>(definition: RulesetDefinition, entries: readonly T[]): Array<{
    section: {
        id: string;
        label: string;
    } | null;
    entries: T[];
}>;
/** Every number the sheet yields, computed once, top to bottom. `live` is what a live track or pool
 *  reads; without it they read 0, which is right only where the format refuses them (a maximum, the
 *  proficiency bonus, a catalog's scaling). Anything a player or the Game Master sees, and anything a
 *  check or a fight reads, goes through `evaluateRulesetSheetLive`, which supplies it. */
export declare function evaluateRulesetSheet(definition: RulesetDefinition, build: RulesetSheetBuild, live?: RulesetSheetLiveValues): EvaluatedRulesetSheet;
/** One value reference resolved against a sheet, for a reader outside the evaluation — a live
 *  pool's maximum is the only one today. Takes an evaluation when the caller already has one, so
 *  resolving a party's worth of pool maximums evaluates each sheet once. */
export declare function resolveRulesetValueRef(definition: RulesetDefinition, build: RulesetSheetBuild, ref: RulesetValueRef, evaluated?: EvaluatedRulesetSheet): number;
/** Whether a field, derived value, list, pool or track is hidden by its `hideWhen`: the field
 *  holds that one value, holds anything but it, or holds one of a few. */
export declare function isRulesetItemHidden(item: {
    hideWhen?: RulesetHideWhen;
}, build: RulesetSheetBuild, definition: RulesetDefinition): boolean;
/** A skill or save also carries the ability it normally rolls with, and the one a `with=` asked
 *  for instead, so the modifier can swap the first for the second without re-reading the sheet. */
interface RulesetTrainedCheckTarget {
    type: "skill" | "save";
    id: string;
    label: string;
    /** The entry's own ability, when it names one. */
    ability?: string;
    /** The ability the request named instead. Only ever an ability this sheet declares. */
    withAbility?: string;
}
/** A raw ability check. `withAbility` is the second ability a pool ruleset with
 *  `pool.abilityPlusAbility` adds to it, and is never set anywhere else. */
interface RulesetAbilityCheckTarget {
    type: "ability";
    id: string;
    label: string;
    withAbility?: string;
}
export type RulesetCheckTarget = RulesetTrainedCheckTarget | RulesetAbilityCheckTarget;
/** What a requested check name means in this ruleset: a skill, a save, or a raw ability check.
 *  Matches ids and labels, with "check", "save" and "saving throw" suffixes understood, so
 *  "Dexterity save", "dex_save" and "DEX saving throw" are one request. Null when the ruleset has
 *  no such thing; the caller then rolls unmodified dice rather than guessing an ability.
 *
 *  `withAbility` is the tag's `with=`: roll this skill or save with another ability than its own.
 *  A name no ability answers to is IGNORED rather than refused, so the entry keeps its own
 *  ability; the resolver notices the unset `withAbility` and says so in the log. On a raw ability
 *  check it names a SECOND ability to add, and only where a pool ruleset declares
 *  `pool.abilityPlusAbility`; anywhere else it means nothing there, because the check already
 *  names the ability it rolls. */
export declare function matchRulesetCheckTarget(definition: RulesetDefinition, requested: string, withAbility?: string): RulesetCheckTarget | null;
export declare function rulesetCheckModifier(evaluated: EvaluatedRulesetSheet, target: RulesetCheckTarget | null): number;
/** What `resolution.adjust` adds to or takes off this check: every entry that applies to all checks,
 *  and every one limited to abilities the check rolls with. Whole numbers, rounded toward zero, so a
 *  half never turns into a die. A check the ruleset cannot name still takes the unlimited ones, the
 *  way it still takes a wound penalty. */
export declare function rulesetCheckAdjust(definition: RulesetDefinition, build: RulesetSheetBuild, evaluated: EvaluatedRulesetSheet, target: RulesetCheckTarget | null): number;
/** One check number, spelled the way its kind means it: a modifier added to the dice, or how many
 *  dice there are. Everywhere a check value is shown to a player or written into a prompt. */
export declare function formatRulesetCheckValue(definition: RulesetDefinition, value: number): string;
export interface RulesetCheckRoll {
    /** Every die thrown, in order: one set normally, two sets under advantage or disadvantage. */
    rolls: number[];
    /** Sum of the set that was kept. */
    usedRoll: number;
    total: number;
    success: boolean;
    criticalSuccess: boolean;
    criticalFailure: boolean;
    rollMode: "advantage" | "disadvantage" | "normal";
    /** Notation for the dice actually thrown. */
    dice: string;
}
/** Roll a `dice-sum` check. Advantage and disadvantage cancel, and are ignored entirely when the
 *  ruleset does not allow them. `preRolled` stands in for the dice when the player rolled first;
 *  it is honoured only for a single-die ruleset and only within the die's faces.
 *
 *  A ruleset of another kind has no dice to sum, so it comes back as a failure with no roll rather
 *  than borrowing a die this system does not have. Callers dispatch on `resolution.kind`. */
export declare function rollDiceSumCheck(definition: RulesetDefinition, input: {
    modifier: number;
    dc: number;
    isSave: boolean;
    advantage?: boolean;
    disadvantage?: boolean;
    preRolled?: number;
}, rollDie: (sides: number) => number): RulesetCheckRoll;
export interface RulesetPoolRoll extends RulesetCheckRoll {
    /** The per-die target the successes were counted with, so a reader can mark the dice that
     *  counted. It is the ruleset's default unless the request moved it inside the declared range. */
    threshold: number;
    /** The situational dice the roll actually added or took: the request's `bonus=` clamped into the
     *  ruleset's range, and 0 where the ruleset declares none. A record is written from this, never
     *  from what the tag asked for. */
    bonusDice: number;
    /** Successes a purchase added after the dice were counted, and 0 where nothing was bought. They
     *  are in `total` already; this is what lets a record say how many of them nobody rolled. */
    autoSuccesses: number;
    /** How many dice a bought re-throw actually replaced, so a record can say the pool was re-thrown
     *  rather than leaving a reader to wonder why the faces beat the odds. */
    rerolled: number;
    /** The faces this roll exploded and doubled from, after the ruleset's limits, or undefined where
     *  the rule was not in play. A reader compares them with the file's own `from` to say whether the
     *  check moved them. */
    explodeFrom?: number;
    doubleFrom?: number;
    /** Something went wrong on the side of a roll that did not botch outright: `botch.rule` is
     *  `halfOrMore` and low faces showed on half the dice or more, but a die still succeeded. */
    complication: boolean;
}
/** The hard ceiling on how many dice ONE check may throw again, whatever a ruleset asks for. An
 *  Engine bound rather than an author's choice: an `until` re-throw is a loop, and a loop inside a
 *  turn needs an end that does not depend on the file. */
export declare const RULESET_POOL_MAX_REROLLS = 100;
/** Roll a `dice-pool` check: throw the sheet's own number of dice and count the ones that reach
 *  the target. `total` and `usedRoll` are both the NET successes, so a reader that knows nothing
 *  about pools still shows the number the outcome turned on.
 *
 *  Never throws, and never rolls a die this ruleset did not declare. `threshold` and `bonusDice`
 *  are the Game Master's two per-check freedoms and are clamped into what the ruleset allows
 *  rather than refused, because a check the model asked for slightly wrong is still a check.
 *  A ruleset of another kind comes back as a failure with no roll. */
export declare function rollDicePoolCheck(definition: RulesetDefinition, input: {
    /** The sheet's number for this check, which here is how many dice to throw. */
    modifier: number;
    /** How many successes the check needs. */
    required: number;
    /** Taken so the two rollers answer the same question. No pool rule reads it today. */
    isSave: boolean;
    /** `threshold=`, honoured only where the ruleset lets the target move. */
    threshold?: number;
    /** `bonus=`, honoured only where the ruleset declares situational dice. */
    bonusDice?: number;
    /** `explode=` and `double=`, honoured only where the ruleset gives that rule a `min`. */
    explode?: number;
    double?: number;
    /** What a purchase bought for this one check, already validated and paid for by the caller:
     *  dice thrown on top of the pool, successes added after the dice are counted, a per-die target
     *  for this one roll, and a re-throw of the low faces. The roller never decides whether a spend
     *  was allowed; it only applies what it is handed. */
    bought?: {
        dice?: number;
        successes?: number;
        threshold?: number;
        reroll?: {
            upTo: number;
            mode: "once" | "until";
        };
        explode?: number;
        double?: number;
    };
}, rollDie: (sides: number) => number): RulesetPoolRoll;
/** The difficulty ladder step a name picks, or null. Matched without case or punctuation, and only
 *  when exactly one step answers to it, so a name two steps share picks neither of them. */
export declare function rulesetDifficultyStep(definition: RulesetDefinition, name: string | undefined): RulesetDifficultyLadderStep | null;
/** What a step asks for, in its kind's own terms: successes on a pool, a difficulty on a sum. */
export declare function rulesetDifficultyStepDc(step: RulesetDifficultyLadderStep): number;
/** The per-die target of the one pool ladder step that needs exactly `successes`, or undefined: when
 *  no step or several need that many, when the one that does names no target, or on a summed ruleset.
 *  A ladder that prints "Plain work 1 success (target 6)" then means it at the table, and one whose
 *  steps all need one success says nothing about which of them a bare `dc="1"` meant. */
export declare function rulesetLadderTargetFor(definition: RulesetDefinition, successes: number): number | undefined;
export {};
//# sourceMappingURL=sheet-math.d.ts.map