export const RESIDENT_HISTORY_MODES = {
  continue: "Continue their history",
  adapt: "Adapt selected history",
  new: "Start a new continuity",
} as const;
export const RESIDENT_STORY_ROLES = {
  "new-arrival": "New arrival",
  lifelong: "Always lived here",
  returning: "Returning after an absence",
  visiting: "Visiting",
  custom: "Custom",
} as const;
export type ResidentFoundingContext = {
  historyMode: keyof typeof RESIDENT_HISTORY_MODES;
  storyRole: keyof typeof RESIDENT_STORY_ROLES;
  customDescription: string;
  background: string;
};
export const DEFAULT_RESIDENT_FOUNDING_CONTEXT: ResidentFoundingContext = {
  historyMode: "continue",
  storyRole: "new-arrival",
  customDescription: "",
  background: "",
};
export function residentFoundingProblems(value: ResidentFoundingContext) {
  return {
    historyMode: Object.hasOwn(RESIDENT_HISTORY_MODES, value.historyMode) ? "" : "Choose a character history.",
    storyRole: Object.hasOwn(RESIDENT_STORY_ROLES, value.storyRole) ? "" : "Choose their place in the story.",
    customDescription:
      value.customDescription.length > 240
        ? "Use at most 240 characters."
        : value.storyRole === "custom" && !value.customDescription.trim()
          ? "Describe their place here."
          : "",
    background: value.background.length > 1200 ? "Use at most 1,200 characters." : "",
  };
}
/** Missing legacy contexts stay absent. Invalid persisted input is never promoted to new facts. */
export function readResidentFoundingContext(value: unknown): ResidentFoundingContext | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.historyMode !== "string" ||
    typeof row.storyRole !== "string" ||
    typeof row.customDescription !== "string" ||
    typeof row.background !== "string"
  )
    return null;
  const context = {
    historyMode: row.historyMode,
    storyRole: row.storyRole,
    customDescription: row.customDescription.trim(),
    background: row.background.trim(),
  } as ResidentFoundingContext;
  if (row.customDescription.length > 240 || row.background.length > 1200) return null;
  return Object.values(residentFoundingProblems(context)).some(Boolean) ? null : context;
}
export const RESIDENT_CONTINUITY_RULE =
  "Resident starting backgrounds are circumstances separate from complete authored identity. " +
  "The Village setting, established world facts and verified current state govern present circumstances. " +
  "Card and lore references alone never relocate the Village or recreate former homes, workplaces or obligations. " +
  "Do not invent an arrival bridge or resolve an undecided world connection. " +
  "Preserve authored secrets, amnesia and knowledge limits: narrator-only truths are not resident knowledge, and backgrounds are not automatically public. " +
  "These are starting backgrounds, not repeat arrivals or instructions to create Venues, attendance, ownership, permissions, relationships or future events. " +
  "Later verified developments take precedence.";
export function renderResidentFoundingContext(name: string, context?: ResidentFoundingContext | null): string {
  if (!context) return "";
  const history =
    context.historyMode === "new"
      ? "Preserve identity, appearance, personality, voice, skills and general knowledge. Prior personal events are reference material, not factual memories, unless explicitly retained below. This is a new continuity, not an amnesia event."
      : context.historyMode === "adapt" && context.background
        ? "Preserve card history except for changes explicitly described below."
        : "Preserve card history and authored memory limits; present circumstances belong to this Village.";
  return [
    `## Starting background: ${name}`,
    RESIDENT_CONTINUITY_RULE,
    `Character history: ${RESIDENT_HISTORY_MODES[context.historyMode]}. ${history}`,
    `Place in the Village's story: ${RESIDENT_STORY_ROLES[context.storyRole]}.`,
    context.storyRole === "custom" ? `Custom place: ${context.customDescription}` : "",
    context.background ? `Player-authored background: ${context.background}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
