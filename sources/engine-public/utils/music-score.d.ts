import type { GameActiveState } from "../types/game.js";
export declare const MUSIC_GENRES: readonly ["fantasy", "horror", "romance", "mystery", "scifi", "modern", "slice_of_life", "adventure", "drama", "custom"];
export type MusicGenre = (typeof MUSIC_GENRES)[number];
export declare const MUSIC_INTENSITIES: readonly ["calm", "tense", "intense"];
export type MusicIntensity = (typeof MUSIC_INTENSITIES)[number];
export declare const LOCATION_KINDS: readonly ["interior", "exterior", "underground", "urban", "nature"];
export type LocationKind = (typeof LOCATION_KINDS)[number];
export declare const MUSIC_ENEMY_TIERS: readonly ["common", "miniboss", "boss", "special"];
export type MusicEnemyTier = (typeof MUSIC_ENEMY_TIERS)[number];
export interface MusicScoreInput {
    state: GameActiveState;
    /** Small tie-breaker only. Main music selection comes from musicGenre/musicIntensity. */
    weather?: string | null;
    /** Small tie-breaker only. Main music selection comes from musicGenre/musicIntensity. */
    timeOfDay?: string | null;
    musicGenre?: MusicGenre | string | null;
    musicIntensity?: MusicIntensity | string | null;
    /** Stable slug of the current area (the same slug backgrounds key on).
     *  Outside combat, a matching `music:area:<slug>:*` track wins outright. */
    locationSlug?: string | null;
    /** Encounter tier while in combat; a matching `music:tier:<tier>:*` track wins outright. */
    enemyTier?: MusicEnemyTier | string | null;
    currentMusic?: string | null;
    recentMusic?: string[] | null;
    availableMusic: string[];
}
export interface AmbientScoreInput {
    state: GameActiveState;
    weather?: string | null;
    timeOfDay?: string | null;
    locationKind?: LocationKind | string | null;
    currentAmbient?: string | null;
    availableAmbient: string[];
    /** LLM-selected background tag — fallback only when locationKind is missing. */
    background?: string | null;
}
export declare function normalizeMusicEnemyTier(value: string | null | undefined): MusicEnemyTier | null;
/** Canonical area key for context music. The style follows the background
 *  slug conventions, but the key is its OWN namespace (music/area/<slug>) —
 *  nothing joins it to background slugs, whose generators use their own
 *  slugification and may differ on accented or very long names.
 *  Input is length-capped before any regex work and dash runs are trimmed
 *  with linear scans, never anchored `-+` patterns — location strings arrive
 *  from request payloads, and CodeQL rightly flags polynomial regexes on
 *  uncontrolled input (the class this repo scrubbed in #5067). */
export declare function musicAreaSlug(value: string | null | undefined): string | null;
export declare function normalizeMusicGenre(value: unknown): MusicGenre | null;
export declare function normalizeMusicIntensity(value: unknown): MusicIntensity | null;
export declare function normalizeLocationKind(value: unknown): LocationKind | null;
/** True for #5161 context tracks (music:area:* / music:tier:*). Used by the
 *  client to keep context tags OUT of the recent-music anti-repeat history —
 *  a kept area theme would otherwise fill the whole window and disable the
 *  legacy pool's rotation memory. */
export declare function isContextMusicTag(tag: string): boolean;
/**
 * Pick the best music tag for the current game context.
 * Returns `null` only when there is no music or no structured candidates for this state.
 * Since #5161 the keep-current contract applies everywhere: the current track is
 * KEPT while it still fits the context (context set membership, or a legacy score
 * within one point of the best), and rotation happens only when the context — the
 * area, the encounter tier, or the state/genre/intensity — actually moved.
 */
export declare function scoreMusic(input: MusicScoreInput): string | null;
/**
 * Pick the best ambient tag for the current game context.
 * Returns `null` when the current ambient is already appropriate or no match found.
 */
export declare function scoreAmbient(input: AmbientScoreInput): string | null;
//# sourceMappingURL=music-score.d.ts.map