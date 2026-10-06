import { z } from "zod";
export declare const GAME_DIFFICULTIES: readonly ["casual", "normal", "hard", "brutal"];
export type GameDifficulty = (typeof GAME_DIFFICULTIES)[number];
/** Older setups stored display labels; unknown imported values retain Normal rules. */
export declare function normalizeGameDifficulty(value: unknown): GameDifficulty;
/** Traditional/legacy Engine rules only. Alternative rulesets must supply their own difficulty policy;
 * do not carry these damage multipliers into 5e, V20, or another ruleset by default. */
export declare const ENEMY_DAMAGE_MULTIPLIERS: Record<GameDifficulty, number>;
/** Changes decision consistency, never personality, legality or companion competence. */
export declare const ENEMY_AI_VARIATION: Record<GameDifficulty, number>;
export declare const WEATHER_TYPES: readonly ["clear", "cloudy", "overcast", "rain", "heavy_rain", "storm", "snow", "blizzard", "fog", "wind", "hail", "sandstorm", "heat_wave"];
export type WeatherType = (typeof WEATHER_TYPES)[number];
export declare function normalizeWeatherType(value: unknown): WeatherType | undefined;
export declare const combatWeatherSchema: z.ZodObject<{
    version: z.ZodLiteral<1>;
    type: z.ZodEnum<["clear", "cloudy", "overcast", "rain", "heavy_rain", "storm", "snow", "blizzard", "fog", "wind", "hail", "sandstorm", "heat_wave"]>;
    wind: z.ZodEnum<["calm", "breezy", "windy", "gale"]>;
    visibility: z.ZodEnum<["clear", "reduced", "poor"]>;
    exposure: z.ZodEnum<["exposed", "sheltered", "unknown"]>;
}, "strip", z.ZodTypeAny, {
    wind: "windy" | "calm" | "breezy" | "gale";
    version: 1;
    type: "clear" | "cloudy" | "overcast" | "rain" | "heavy_rain" | "storm" | "snow" | "blizzard" | "fog" | "wind" | "hail" | "sandstorm" | "heat_wave";
    visibility: "clear" | "reduced" | "poor";
    exposure: "unknown" | "exposed" | "sheltered";
}, {
    wind: "windy" | "calm" | "breezy" | "gale";
    version: 1;
    type: "clear" | "cloudy" | "overcast" | "rain" | "heavy_rain" | "storm" | "snow" | "blizzard" | "fog" | "wind" | "hail" | "sandstorm" | "heat_wave";
    visibility: "clear" | "reduced" | "poor";
    exposure: "unknown" | "exposed" | "sheltered";
}>;
export type CombatWeather = z.infer<typeof combatWeatherSchema>;
export interface CombatAttackTraits {
    projectile?: boolean;
    requiresSight?: boolean;
}
/** Engine weather rules use explicit traits, never translated ability names. */
export declare function combatWeatherEffects(weather?: CombatWeather): {
    fireMultiplier: number;
    lightningMultiplier: number;
    projectilePenalty: number;
    sightPenalty: number;
    walkingCost: number;
};
/** Percentage points, bounded so weather never makes a legal attack impossible. */
export declare function weatherHitPenalty(weather: CombatWeather | undefined, traits: CombatAttackTraits): number;
export declare function weatherDamageMultiplier(weather: CombatWeather | undefined, element?: string): number;
/** Classic uses opposed d20 rolls; five percentage points become one roll modifier. */
export declare function classicAttackModifier(attack: number, weather: CombatWeather | undefined, traits: CombatAttackTraits): number;
/** Exact hit probability for opposed rolls, without consuming the combat RNG. */
export declare function classicHitProbability(attack: number, defense: number, weather: CombatWeather | undefined, traits: CombatAttackTraits): number;
//# sourceMappingURL=combat-conditions.d.ts.map