
/** Summary of a completed game session, carried forward to future sessions. */
export interface SessionSummary {
    sessionNumber: number;
    /** Narrative recap of what happened */
    summary: string;
    /** Exact in-world situation where the next session should resume */
    resumePoint: string;
    /** How party member relationships evolved */
    partyDynamics: string;
    /** Current state of the party after the session */
    partyState: string;
    /** Important plot points, twists, quests, and lore discovered */
    keyDiscoveries: string[];
    /** Important character moments (dates, bonding, betrayals, confessions, etc.) */
    characterMoments: string[];
    /** Small personal details, preferences, habits, and past fragments to recall later */
    littleDetails: string[];
    /** Serialized stats/inventory/quest snapshot */
    statsSnapshot: Record<string, unknown>;
    /** NPC reputation changes */
    npcUpdates: string[];
    /** Optional player steering note for the next session. */
    nextSessionRequest?: string | null;
    timestamp: string;
}
