/** Expected player-facing result; never a fictional event or character knowledge. */
export type SceneTurnOutcome = "occupancy-unavailable" | "halt-time" | "halt-appointment" | "halt-state" | "halt-world";

export const OCCUPANCY_UNAVAILABLE_MESSAGE = "The requested change in Zone occupancy could not be completed.";

const messages: Record<SceneTurnOutcome, string> = {
  "occupancy-unavailable": OCCUPANCY_UNAVAILABLE_MESSAGE,
  "halt-time": "HALT: This turn would skip or change Village time. Edit your message to continue.",
  "halt-appointment": "HALT: That appointment's time has passed in the Village. Choose another date.",
  "halt-state":
    "HALT: This turn requires an activity or condition Villages cannot support. Edit your message to continue.",
  "halt-world": "HALT: This change conflicts with the current Village. Edit your message to continue.",
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
