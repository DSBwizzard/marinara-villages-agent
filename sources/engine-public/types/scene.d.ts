
/** What a package scene origin hands the planner and the scene chat. */
export interface SceneOriginContext {
    /** Engine character IDs the scene may cast. At least one. */
    characterIds: string[];
    /** The persona the player uses in this origin, or null for none. */
    personaId: string | null;
    /** Connection for the scene's generations. Null uses the Engine's default connection. */
    connectionId?: string | null;
    /** Recent exchanges in the origin, oldest first. */
    transcript: Array<{
        speaker: string;
        content: string;
    }>;
    /** Extra context the origin owns, given to the planner and the scene writer (for example a stage persona and limits). */
    notes?: string | null;
    /** Lorebooks the scene chat starts with. */
    lorebookIds?: string[];
}

/**
 * Per-scene settings a package attaches when it starts a scene (`packageData` on create, `data` on
 * `startScene`). The Engine stores them with the scene and hands them to `claim` and `release`, so the
 * package decides per scene whether to lock, what to do with the recap, and anything else of its own.
 * A plain JSON object of at most 4,000 characters.
 */
export type ScenePackageData = Record<string, unknown>;

/** How a package-origin scene ended. `data` is the scene's `packageData`, or null. */
export type SceneOriginEnd = {
    data: ScenePackageData | null;
} & ({
    kind: "concluded";
    sceneChatId: string;
    /** The narrative recap the Engine also stores as character memory. */
    summary: string;
    description: string | null;
    scenario: string | null;
    rating: "sfw" | "nsfw";
    characterIds: string[];
}
/** Discarded, deleted, or converted into a standalone roleplay: no recap. */
 | {
    kind: "abandoned" | "deleted" | "converted";
    sceneChatId: string;
});

/**
 * Registered by a package through `api.registerSceneOrigin`. Only `getContext` is required: a package
 * that just starts scenes leaves out `claim` (no lock, any number of scenes at once) and `release`
 * (nothing is delivered when a scene ends).
 */
export interface SceneOriginProvider {
    /** Planning context for the origin, or null when it no longer exists. */
    getContext(originId: string): Promise<SceneOriginContext | null>;
    /** Lock the origin for this scene. Return false when it already has an active scene. */
    claim?(originId: string, scene: {
        sceneChatId: string;
        characterIds: string[];
        data: ScenePackageData | null;
    }): Promise<boolean>;
    /**
     * Unlock the origin and receive the outcome. Must ignore an end for a scene that does not hold
     * the lock, and must be idempotent: a retry or a later delete can deliver the same scene again.
     */
    release?(originId: string, end: SceneOriginEnd): Promise<void>;
}
