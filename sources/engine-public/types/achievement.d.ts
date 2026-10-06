
export interface CapabilityAchievementHost {
    /** This package's own achievements, with current progress. */
    list(): Promise<AchievementProgress[]>;
    isUnlocked(id: string): Promise<boolean>;
    /** Marks the badge fulfilled. Resolves true only for the call that unlocked it. */
    unlock(id: string): Promise<boolean>;
}

export interface AchievementProgress {
    id: string;
    unlocked: boolean;
    unlockedAt: string | null;
    progress: number;
    target: number | null;
}
