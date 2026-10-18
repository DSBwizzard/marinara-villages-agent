/** Shared generation/validation limits; fixed rest windows use the separate rhythm representation. */
export const ROUTINE_CONTRACT = {
  minActivities: 6,
  maxActivities: 8,
  minMinutes: 30,
  maxMinutes: 240,
  maxActivityCharacters: 160,
} as const;
