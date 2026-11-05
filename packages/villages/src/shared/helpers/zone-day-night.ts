export type ZoneDayNight = { dayNight?: boolean; dayNightManual?: boolean };

export const ZONE_DAY_NIGHT_INSTRUCTION =
  "With each authored physical description return dayNight:boolean for the complete resulting Zone: true only when daylight or a visible outdoor view makes day and night visibly different; false for enclosed constant lighting, permanent light/darkness or uncertainty. Respect established world rules. Entrance can be an indoor corridor. Do not infer windows from a building type, use the current clock, or invent physical features to justify the choice.";

/** Old saved choices and deliberate player choices win over later description metadata. */
export function zoneDayNightDefault(current: ZoneDayNight, inferred: boolean | undefined): ZoneDayNight {
  if (
    inferred === undefined ||
    current.dayNightManual === true ||
    (current.dayNightManual === undefined && current.dayNight !== undefined)
  )
    return {};
  return { dayNight: inferred, dayNightManual: false };
}
