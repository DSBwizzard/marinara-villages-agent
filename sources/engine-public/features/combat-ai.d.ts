import { type GameDifficulty } from "./combat-conditions.js";
import { z } from "zod";
import type { CombatSkill, CombatStatusEffect } from "../types/game.js";
export declare const COMBAT_ADJECTIVES: readonly ["mindless", "reckless", "cautious", "opportunistic", "protective", "supportive", "disciplined", "cowardly", "patient", "methodical", "coordinated"];
export declare const combatAiHintsSchema: z.ZodObject<{
    category: z.ZodOptional<z.ZodEnum<["beast", "monstrosity", "other", "unknown"]>>;
    proficiency: z.ZodOptional<z.ZodEnum<["novice", "trained", "veteran", "master"]>>;
    temperament: z.ZodOptional<z.ZodEnum<["mindless", "reckless", "cautious", "opportunistic", "protective", "supportive", "disciplined", "cowardly", "patient", "methodical", "coordinated"]>>;
}, "strip", z.ZodTypeAny, {
    category?: "unknown" | "beast" | "monstrosity" | "other" | undefined;
    proficiency?: "novice" | "trained" | "veteran" | "master" | undefined;
    temperament?: "mindless" | "reckless" | "cautious" | "opportunistic" | "protective" | "supportive" | "disciplined" | "cowardly" | "patient" | "methodical" | "coordinated" | undefined;
}, {
    category?: "unknown" | "beast" | "monstrosity" | "other" | undefined;
    proficiency?: "novice" | "trained" | "veteran" | "master" | undefined;
    temperament?: "mindless" | "reckless" | "cautious" | "opportunistic" | "protective" | "supportive" | "disciplined" | "cowardly" | "patient" | "methodical" | "coordinated" | undefined;
}>;
export declare const combatTacticsSchema: z.ZodEffects<z.ZodObject<{
    version: z.ZodLiteral<1>;
    seed: z.ZodNumber;
    category: z.ZodEnum<["beast", "monstrosity", "other", "unknown"]>;
    proficiency: z.ZodEnum<["novice", "trained", "veteran", "master"]>;
    role: z.ZodEnum<["bruiser", "bulwark", "skirmisher", "marksman", "spellcaster", "supporter", "controller"]>;
    adjective: z.ZodEnum<["mindless", "reckless", "cautious", "opportunistic", "protective", "supportive", "disciplined", "cowardly", "patient", "methodical", "coordinated"]>;
    targetId: z.ZodOptional<z.ZodString>;
    holds: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    version: 1;
    category: "unknown" | "beast" | "monstrosity" | "other";
    proficiency: "novice" | "trained" | "veteran" | "master";
    seed: number;
    role: "bruiser" | "bulwark" | "skirmisher" | "marksman" | "spellcaster" | "supporter" | "controller";
    adjective: "mindless" | "reckless" | "cautious" | "opportunistic" | "protective" | "supportive" | "disciplined" | "cowardly" | "patient" | "methodical" | "coordinated";
    targetId?: string | undefined;
    holds?: number | undefined;
}, {
    version: 1;
    category: "unknown" | "beast" | "monstrosity" | "other";
    proficiency: "novice" | "trained" | "veteran" | "master";
    seed: number;
    role: "bruiser" | "bulwark" | "skirmisher" | "marksman" | "spellcaster" | "supporter" | "controller";
    adjective: "mindless" | "reckless" | "cautious" | "opportunistic" | "protective" | "supportive" | "disciplined" | "cowardly" | "patient" | "methodical" | "coordinated";
    targetId?: string | undefined;
    holds?: number | undefined;
}>, {
    version: 1;
    category: "unknown" | "beast" | "monstrosity" | "other";
    proficiency: "novice" | "trained" | "veteran" | "master";
    seed: number;
    role: "bruiser" | "bulwark" | "skirmisher" | "marksman" | "spellcaster" | "supporter" | "controller";
    adjective: "mindless" | "reckless" | "cautious" | "opportunistic" | "protective" | "supportive" | "disciplined" | "cowardly" | "patient" | "methodical" | "coordinated";
    targetId?: string | undefined;
    holds?: number | undefined;
}, {
    version: 1;
    category: "unknown" | "beast" | "monstrosity" | "other";
    proficiency: "novice" | "trained" | "veteran" | "master";
    seed: number;
    role: "bruiser" | "bulwark" | "skirmisher" | "marksman" | "spellcaster" | "supporter" | "controller";
    adjective: "mindless" | "reckless" | "cautious" | "opportunistic" | "protective" | "supportive" | "disciplined" | "cowardly" | "patient" | "methodical" | "coordinated";
    targetId?: string | undefined;
    holds?: number | undefined;
}>;
export type CombatTactics = z.infer<typeof combatTacticsSchema>;
export type CombatAiHints = z.infer<typeof combatAiHintsSchema>;
export type CombatController = "manual" | "ai";
export interface AiCombatant {
    id: string;
    hp: number;
    maxHp: number;
    attack: number;
    defense: number;
    speed: number;
    level: number;
    mp?: number;
    maxMp?: number;
    skills?: CombatSkill[];
    statusEffects?: CombatStatusEffect[];
    combatClass?: string;
    tactics?: CombatTactics;
    aiHints?: CombatAiHints;
}
/** Domain-separated deterministic choices, independent of combat rolls. */
export declare function combatAiHash(value: string): number;
export declare function assignCombatTactics(unit: AiCombatant, seed: number): CombatTactics;
/** Mode adapters enumerate only actions their resolver can actually execute. */
export interface CombatAiCandidate<T> {
    action: T;
    targetId?: string;
    damage?: number;
    finish?: number;
    healing?: number;
    support?: number;
    setup?: number;
    risk?: number;
    cost?: number;
    protection?: number;
    coordination?: number;
    hold?: boolean;
}
export declare function combatAiScoreNoise(profile: CombatTactics, id: string, turn: number | string, index: number, difficulty?: GameDifficulty): number;
export declare function chooseCombatCandidate<T>(unit: AiCombatant, candidates: CombatAiCandidate<T>[], turn: number, difficulty?: GameDifficulty): T;
//# sourceMappingURL=combat-ai.d.ts.map