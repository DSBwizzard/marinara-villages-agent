/** Preset founding circumstances, kept separate from the wizard's components and requests. */
export const FOUNDING_SCENARIOS = [
  {
    value: "rebuild",
    label: "Starting over",
    description: "A change brings people together.",
    icon: "⌂",
    premise:
      "Housing elsewhere is no longer available, and an unused shopping mall offers somewhere for you and the others to stay.",
  },
  {
    value: "pioneer",
    label: "Arriving somewhere new",
    description: "Different reasons, a shared destination.",
    icon: "△",
    premise:
      "You and the others have been assigned accommodation aboard a remote station. Each of you has your own reason for accepting the posting.",
  },
  {
    value: "prosper",
    label: "A shared undertaking",
    description: "Something puts you in the same place.",
    icon: "▥",
    premise:
      "You and the others are staying onsite at a server facility because its operation requires a resident team.",
  },
  { value: "custom", label: "Custom", description: "Write your own shared circumstances.", icon: "✦", premise: "" },
  { value: "none", label: "No preset", description: "Start without an example.", icon: "∞", premise: "" },
] as const;

export type FoundingScenarioId = (typeof FOUNDING_SCENARIOS)[number]["value"];
