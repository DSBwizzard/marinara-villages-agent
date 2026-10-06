import type {
  VillageChronicleEntry,
  VillageOpportunity,
  VillageRecap,
  VillageState,
  VillageStoryPace,
} from "../models/world.js";
import { isHousePlace, MAX_CHRONICLE_ABOUT_ONE_VILLAGER, MAX_CHRONICLE_IN_PROMPT } from "./prompt-preset.js";
import type { NativeRoutine } from "./schedule-rules.js";
import { deriveVillageMoment, hashString } from "./village-clock.js";
import { villagerPlaceView } from "./village-projections.js";

export function localDateKey(now: Date): string {
  const year = String(now.getFullYear()).padStart(4, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
export function storyAllowance(pace: VillageStoryPace, seed: string, date: string): number {
  if (pace === "off") return 0;
  if (pace === "quiet") return 1;
  if (pace === "lively") return 3;
  return 1 + (hashString(`${seed}|${date}|creative-allowance`) % 3);
}
export function creativeOpportunity(
  village: VillageState,
  routines: ReadonlyMap<string, NativeRoutine>,
  moment: ReturnType<typeof deriveVillageMoment>,
  startsAt: string,
): VillageOpportunity | null {
  const currentPlaces = new Map<string, string[]>();
  for (const villager of village.villagers) {
    const place = villagerPlaceView(village, villager, routines.get(villager.characterId) ?? null, moment.minuteOfDay);
    if (!place) continue;
    const destinationKey = JSON.stringify([place.id, place.zoneId ?? "exterior"]);
    currentPlaces.set(destinationKey, [...(currentPlaces.get(destinationKey) ?? []), villager.characterId]);
  }
  const overlap = [...currentPlaces.entries()].find(([, actorIds]) => actorIds.length >= 2);
  const activeProject = village.projects.find((project) => project.status === "active");
  const wishing = village.villagers.find((villager) => (villager.agenda?.wishes.length ?? 0) > 0);
  const publicVenue = village.venues.find((venue) => !isHousePlace(venue));
  const firstResident = village.villagers[0];
  const kind: VillageOpportunity["kind"] = overlap
    ? "encounter"
    : activeProject
      ? "project"
      : wishing
        ? "wish"
        : publicVenue
          ? "weather"
          : firstResident
            ? "routine"
            : "weather";
  const actorIds =
    overlap?.[1].slice(0, 4) ??
    activeProject?.participantIds.slice(0, 4) ??
    (wishing ? [wishing.characterId] : firstResident ? [firstResident.characterId] : []);
  const destinationKey =
    overlap?.[0] ??
    (wishing ? currentPlaces.entries().find(([, ids]) => ids.includes(wishing.characterId))?.[0] : undefined);
  const [destinationVenueId, zoneId] = destinationKey
    ? (JSON.parse(destinationKey) as [string, string])
    : [undefined, "exterior"];
  const venueId = destinationVenueId ?? activeProject?.venueId ?? publicVenue?.id ?? "";
  if (actorIds.length === 0 && venueId.length === 0) return null;
  const facts = [
    `${moment.localTime} local time`,
    `${moment.weather} weather`,
    overlap ? `${actorIds.length} residents share this zone` : "",
    activeProject ? `active project: ${activeProject.title}` : "",
    wishing?.agenda?.wishes[0] ? `active wish: ${wishing.agenda.wishes[0].wish}` : "",
  ].filter(Boolean);
  const identity = `${village.seed}|${startsAt}|${moment.instant}|${kind}|${actorIds.join(",")}|${venueId}`;
  return {
    id: `opportunity-${hashString(identity)}`,
    kind,
    startsAt,
    endsAt: moment.instant,
    actorIds,
    venueId,
    zoneId,
    facts,
  };
}
export function buildReturnRecap(
  village: VillageState,
  from: string,
  through: string,
  elapsedMs: number,
): VillageRecap | null {
  const pendingDecisionCount = village.pendingDecisions.filter(
    (decision) => decision.status !== "approved" && decision.status !== "denied",
  ).length;
  if (elapsedMs < 6 * 60 * 60 * 1_000 && pendingDecisionCount === 0) return null;
  const throughMs = Date.parse(through);
  const fromMs = Date.parse(from);
  const details = village.happenings
    .filter((entry) => {
      const at = Date.parse(entry.occurredAt);
      return Number.isFinite(at) && at >= throughMs - 48 * 60 * 60 * 1_000 && at <= throughMs && at >= fromMs;
    })
    .slice(0, 4);
  const older = village.happenings.filter((entry) => {
    const at = Date.parse(entry.occurredAt);
    return Number.isFinite(at) && at >= fromMs && at < throughMs - 48 * 60 * 60 * 1_000;
  });
  const counts = new Map<string, number>();
  for (const entry of older) {
    const at = new Date(entry.occurredAt);
    const ageDays = Math.floor((throughMs - at.getTime()) / 86_400_000);
    const label =
      ageDays <= 14
        ? at.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : `week of ${new Date(at.getFullYear(), at.getMonth(), at.getDate() - at.getDay()).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  const summaries = [...counts.entries()]
    .slice(-6)
    .reverse()
    .map(([label, count]) => `${count} remembered ${count === 1 ? "event" : "events"} from ${label}.`);
  if (summaries.length === 0 && elapsedMs >= 48 * 60 * 60 * 1_000) {
    const days = Math.max(2, Math.floor(elapsedMs / 86_400_000));
    summaries.push(`${days} days passed in the village.`);
  }
  return { from, through, details, summaries, pendingDecisionCount };
}
/**
 * What the village already remembers about one person.
 *
 * Only private memories. The village-scope ones are no longer thrown away —
 * they are fed to the same call as their own section by `sharedMemoryFor` below
 * — but they are still NOT fed back here, because they arrive by that route and
 * feeding the same fortnight in twice would spend the prompt's room on saying it
 * again.
 */
export function rememberedFor(chronicle: readonly VillageChronicleEntry[], characterId: string): string[] {
  const lines: string[] = [];
  for (const entry of chronicle) {
    if (entry.scope !== "private" || !entry.actors.some((actor) => actor.id === characterId)) continue;
    lines.push(entry.text);
    if (lines.length >= MAX_CHRONICLE_ABOUT_ONE_VILLAGER) break;
  }
  return lines;
}
/**
 * What the WHOLE village remembers, newest first, as the narrator reads it.
 *
 * Three things are decided here, and each of them is the difference between a
 * prompt that helps and a prompt that lies:
 *
 *   * Private memories are excluded. A memory filed against one villager is
 *     that villager's to know, and handing it to the narrator as village history
 *     would put a confidence in the mouth of the whole square. It reaches the
 *     narrator only as `rememberedFor` on the person it belongs to.
 *   * Anything already in the happenings window is dropped. The window is the
 *     last part of this same record, so it is already in the prompt above and a
 *     memory that repeated it would read as the village saying everything twice.
 *   * It is capped, and the cap is a cap on ENTRIES rather than characters,
 *     because the old end of this list is the part that can afford to be
 *     forgotten — the window above is what proves what happened most recently.
 */
export function sharedMemoryFor(
  chronicle: readonly VillageChronicleEntry[],
  alreadySaid: readonly string[],
): VillageChronicleEntry[] {
  const seen = new Set(alreadySaid.map((line) => line.trim().toLowerCase()));
  const memory: VillageChronicleEntry[] = [];
  for (const entry of chronicle) {
    if (entry.scope !== "village") continue;
    const key = entry.text.trim().toLowerCase();
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    memory.push(entry);
    if (memory.length >= MAX_CHRONICLE_IN_PROMPT) break;
  }
  return memory;
}
