import type { RemapBlock, VillageRemap, VillageRemapMove, VillageVenue, VillageWish } from "../models/world.js";
import type { NativeWeekSchedule } from "./schedule-rules.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

// Retained readers for saved schedules; translation generation is retired.
export const VILLAGE_UNTRANSLATED_ACTIVITY = "at home";

export const MAX_REMAP_ATTEMPTS = 2;

export type VillageRemapContext = {
  characterId?: string;
  relationships?: import("./venue-access.js").AccessContext["relationships"];
  village: string;
  setting: string;
  lore: readonly string[];
  completedWishes: readonly string[];
  loreKey: string;
  venues: readonly VillageVenue[];
  wishes: readonly VillageWish[];
  name: string;
  summary: string;
  tags: readonly string[];
  description: string;
  weekStart: string;
  blocks: readonly RemapBlock[];
};

export function remapBlocks(schedule: NativeWeekSchedule): RemapBlock[] {
  const blocks: RemapBlock[] = [];
  for (const day of VILLAGE_WEEKDAYS) {
    for (const block of schedule.days[day] ?? []) {
      blocks.push({ day, time: block.time, activity: block.activity });
    }
  }
  return blocks;
}

export function remapBlockKey(day: string, time: string): string {
  return `${day.trim().toLowerCase()}|${time.replace(/\s+/g, "")}`;
}

export function lookupRemap(remap: VillageRemap | null, key: string): string {
  return findRemapMove(remap, key)?.here ?? "";
}

function findRemapMove(remap: VillageRemap | null, key: string): VillageRemapMove | null {
  if (!remap || remap.moves.length === 0) return null;
  if (key.length === 0) return null;
  for (const move of remap.moves) {
    if (remapBlockKey(move.day, move.time) === key) return move;
  }
  return null;
}

export async function proposeRemap(
  _context: VillageRemapContext,
  _options: { signal?: AbortSignal; attempts?: number } = {},
): Promise<{ remap: VillageRemap; failure: string | null }> {
  throw new Error("Schedule translation is retired. Use optional Villages Agenda influence.");
}

export const MAX_REMAP_FAILURE_LENGTH = 300;
