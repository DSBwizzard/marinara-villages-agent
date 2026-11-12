export const ZONE_DAY_NIGHT_INSTRUCTION =
  "With each authored physical description return dayNight:boolean for the complete resulting Zone: true only when daylight or a visible outdoor view makes day and night visibly different; false only for established enclosed constant lighting or permanent light/darkness. Default to true when uncertain. Respect established world rules. Entrance can be an indoor corridor. Do not infer windows from a building type, use the current clock, or invent physical features to justify the choice.";

/** Lighting is inferred from physical descriptions; there is no player override. */
export function zoneDayNightDefault(inferred: boolean | undefined): { dayNight?: boolean } {
  return inferred === undefined ? {} : { dayNight: inferred };
}
