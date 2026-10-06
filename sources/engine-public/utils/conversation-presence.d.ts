import type { ConversationPresenceStatus, ConversationStatusOverride } from "../types/chat.js";
/** A single time block in a character's daily schedule */
export interface ScheduleBlock {
    /** Hour range, e.g. "06:00-08:00" */
    time: string;
    /** What the character is doing */
    activity: string;
    /** Derived status for this block */
    status: ConversationPresenceStatus;
}
/** One day of a character's schedule */
export type DaySchedule = ScheduleBlock[];
export type ConversationMessageIntent = "check_in" | "long_absence_check_in" | "came_back_online" | "after_busy" | "good_morning" | "good_night" | "meal_break" | "transition_ping";
/** Full weekly schedule for a character */
export interface WeekSchedule {
    /** ISO date string of the Monday this schedule starts */
    weekStart: string;
    /** Schedules keyed by day name */
    days: Record<string, DaySchedule>;
    /** How many minutes of user inactivity before this character messages unprompted (0 = never) */
    inactivityThresholdMinutes: number;
    /** Optional exact response delay in minutes while idle */
    idleResponseDelayMinutes?: number;
    /** Optional exact response delay in minutes while busy / DND */
    dndResponseDelayMinutes?: number;
    /** Optional per-character daily autonomous check-in cap. Chat caps can still lower this ceiling. */
    autonomousDailyCapOverride?: number | null;
    /** Optional generated profile text that summarizes this character's weekly routine. */
    routineSummary?: string | null;
    /** ISO timestamp for the generated routine summary. */
    routineSummaryGeneratedAt?: string | null;
    /** Optional special autonomous message reasons this routine should not use. */
    disabledAutonomousIntents?: ConversationMessageIntent[];
    /** How chatty the character is — affects autonomous messaging frequency (0-100) */
    talkativeness: number;
}
/** All character schedules stored in chat metadata */
export interface CharacterSchedules {
    [characterId: string]: WeekSchedule;
}
export interface CurrentConversationStatus {
    status: ConversationPresenceStatus;
    activity: string;
    override?: ConversationStatusOverride;
}
export interface AdjacentScheduleBlocks {
    previous: ScheduleBlock | null;
    current: ScheduleBlock | null;
    next: ScheduleBlock | null;
}
/** Schedule day order, Monday-first to match getDay() remapping below. */
export declare const CONVERSATION_SCHEDULE_DAYS: string[];
/**
 * Re-express an instant as a local wall-clock Date in an IANA timezone.
 * This lets schedule code keep using Date's weekday/hour accessors without
 * tying evaluation to the browser or server host timezone.
 */
export declare function toConversationScheduleWallClockDate(date: Date, timeZone?: string): Date;
/**
 * Resolve the blocks immediately around a wall-clock instant. A range that
 * crosses midnight belongs to the named day on which it starts, so Monday
 * 02:00 can resolve Sunday's 23:00-07:00 block but not Monday's night block.
 */
export declare function getAdjacentScheduleBlocks(schedule: WeekSchedule, now?: Date): AdjacentScheduleBlocks;
/**
 * Get the current status and activity for a character based on their schedule.
 */
export declare function getCurrentStatus(schedule: WeekSchedule, now?: Date): {
    status: ConversationPresenceStatus;
    activity: string;
};
export declare function getActiveStatusOverride(override: ConversationStatusOverride | null | undefined, now?: Date): ConversationStatusOverride | null;
export declare function getEffectiveCurrentStatus(schedule: WeekSchedule | null | undefined, override: ConversationStatusOverride | null | undefined, now?: Date, fallbackActivity?: string, scheduleNow?: Date): CurrentConversationStatus;
//# sourceMappingURL=conversation-presence.d.ts.map