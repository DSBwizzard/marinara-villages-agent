export const DEFAULT_PLAYER_BACKGROUND = "";
export function playerBackgroundProblem(value: string | null): string {
  return value && value.length > 1200 ? "Use at most 1,200 characters for your backstory." : "";
}
