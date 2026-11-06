export type NativeDayBlock = { time: string; activity: string };
export type NativeWeekSchedule = {
  characterId: string;
  /** The Monday this schedule was generated for. "" when the Engine wrote none. */
  weekStart: string;
  routineSummary: string;
  talkativeness: number | null;
  /** Only the days the Engine actually wrote, keyed by the Engine's weekday names. */
  days: Record<string, NativeDayBlock[]>;
};
