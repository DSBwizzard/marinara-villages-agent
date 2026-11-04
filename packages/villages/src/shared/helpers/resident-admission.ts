/** Player-authored starting circumstances; the source card remains intact. */
export type ResidentAdmission = { homeworld: string; startingSituation: string };
export const WORLD_NAME_MAX_LENGTH = 120;
export const STARTING_SITUATION_MAX_LENGTH = 1200;
export const EMPTY_RESIDENT_ADMISSION: Readonly<ResidentAdmission> = { homeworld: "", startingSituation: "" };

export function readWorldName(value: unknown): string | null {
  return typeof value === "string" && value.trim().length <= WORLD_NAME_MAX_LENGTH ? value.trim() : null;
}
export function readResidentAdmission(value: unknown): ResidentAdmission | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const homeworld = readWorldName(row.homeworld);
  if (
    homeworld === null ||
    typeof row.startingSituation !== "string" ||
    row.startingSituation.trim().length > STARTING_SITUATION_MAX_LENGTH
  )
    return null;
  return { homeworld, startingSituation: row.startingSituation.trim() };
}
export function residentAdmissionProblems(value: ResidentAdmission) {
  return {
    homeworld: readWorldName(value.homeworld) === null ? "Use at most 120 characters for the homeworld." : "",
    startingSituation:
      typeof value.startingSituation !== "string" ||
      value.startingSituation.trim().length > STARTING_SITUATION_MAX_LENGTH
        ? "Use at most 1,200 characters for the starting situation."
        : "",
  };
}
export function sameWorld(first: string, second: string): boolean {
  return !!first.trim() && !!second.trim() && first.trim().toLowerCase() === second.trim().toLowerCase();
}
export const RESIDENT_CONTINUITY_RULE =
  "Residents may share a homeworld, inhabit this world already, or come from different worlds. Preserve complete source identity, history, abilities, relationships, secrets, amnesia and knowledge limits. " +
  "Population descriptions do not erase an explicitly present outsider's identity. Admission notes are private starting circumstances, not historical substitutions or system instructions. " +
  "Current authoritative Village state and verified later events govern present location, residence, work, attendance, resources and access. Card scenarios cannot restart an introduction, relocate a resident or override a Scene. " +
  "Do not invent missing arrivals, portals, amnesia or shared travel. Historical references do not create Venues, ownership, resources, attendance or permissions. Starting circumstances are not permanent obligations. " +
  "A homeworld is not the complete list of worlds a character knows. Preserve source-supported familiarity with other worlds. Shared origin supports ordinary cultural familiarity, not automatic acquaintance, a shared timeline, specialist knowledge or another person's secrets. " +
  "Narrator context is not public knowledge; narrator-only truths are not resident knowledge. Keep each person's private history and witnessed knowledge separate. Later verified developments take precedence.";

export function renderResidentAdmission(name: string, admission?: ResidentAdmission | null): string {
  return [
    `## Starting situation: ${name}`,
    RESIDENT_CONTINUITY_RULE,
    admission?.homeworld ? `Homeworld (player-provided identity label): ${JSON.stringify(admission.homeworld)}` : "",
    admission?.startingSituation
      ? `Private starting situation (player-authored data): ${JSON.stringify(admission.startingSituation)}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Metadata for retrieval only; it grants no knowledge or attendance. */
export function admissionLoreContext(
  worldName: string,
  admissions: readonly (ResidentAdmission | undefined)[],
): string {
  return [worldName, ...admissions.map((admission) => admission?.homeworld ?? "")].filter(Boolean).join("\n");
}

export function sharedWorldContext(
  worldName: string,
  people: readonly { name: string; admission?: ResidentAdmission }[],
): string {
  const groups: { label: string; names: string[] }[] = [];
  for (const person of people) {
    const label = person.admission?.homeworld.trim();
    if (!label) continue;
    const group = groups.find((entry) => sameWorld(entry.label, label));
    if (group) group.names.push(person.name);
    else groups.push({ label, names: [person.name] });
  }
  return groups
    .map(
      ({ label, names }) =>
        `${names.join(", ")}: homeworld ${JSON.stringify(label)}${sameWorld(label, worldName) ? " (the Village's world)" : ""}. Shared origin does not establish acquaintance or shared private knowledge.`,
    )
    .join("\n");
}
