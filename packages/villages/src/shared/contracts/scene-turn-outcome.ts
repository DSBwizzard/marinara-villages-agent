/** Expected player-facing result; never a fictional event or character knowledge. */
export type SceneTurnOutcome = "occupancy-unavailable" | "halt-time" | "halt-appointment" | "halt-state" | "halt-world";

export const OCCUPANCY_UNAVAILABLE_MESSAGE = "The game couldn’t change who occupies this space.";

const messages: Record<SceneTurnOutcome, string> = {
  "occupancy-unavailable": OCCUPANCY_UNAVAILABLE_MESSAGE,
  "halt-time": "The game can’t skip or change Village time.",
  "halt-appointment": "That appointment’s time has passed in the Village.",
  "halt-state": "The game doesn’t support that activity or condition.",
  "halt-world": "That change conflicts with the current Village.",
};

export function isSceneTurnOutcome(value: unknown): value is SceneTurnOutcome {
  return typeof value === "string" && Object.hasOwn(messages, value);
}

export function sceneTurnOutcomeMessage(value: SceneTurnOutcome): string {
  return messages[value];
}

export function isSceneTurnOutcomeMessage(value: string): boolean {
  return Object.values(messages).includes(value);
}
