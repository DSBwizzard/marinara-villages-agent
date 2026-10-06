/** Accepted source constraints used by Music DJ. */
declare const SPOTIFY_SOURCE_TYPES: readonly ["liked", "playlist", "artist", "any"];
/** Maximum recently played Spotify tracks retained to suppress near-term repeats. */
export declare const SPOTIFY_RECENT_TRACK_HISTORY_LIMIT = 250;
export type SpotifySourceType = (typeof SPOTIFY_SOURCE_TYPES)[number];
/** Normalize persisted or user-provided values to a supported Spotify source. */
export declare function normalizeSpotifySourceType(value: unknown): SpotifySourceType;
export {};
//# sourceMappingURL=spotify.d.ts.map