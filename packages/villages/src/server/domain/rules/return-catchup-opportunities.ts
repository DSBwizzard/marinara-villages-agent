import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { ResidentPlanningOpportunity, VillageState } from "../models/world.js";
import { agendaBlocksFor } from "./agenda-week.js";
import { openingPresence } from "./opening-presence.js";
import { planRoutineDays } from "./resident-agenda.js";
import { localDateKey } from "./resident-planning.js";
import { hashString } from "./village-clock.js";
import { villagerPlaceView } from "./village-projections.js";
import { canEnter } from "./social-rules.js";
import { admitNarrative } from "./narrative-development.js";
import { preferredActivityLane } from "./activity-arbitration.js";
import { cloneVillageContext } from "./world-context-copy.js";

const HOUR = 60 * 60_000;

/** Select bounded, dated possibilities using only the saved departure authority. */
export function returnCatchupOpportunities(
  captured: VillageState,
  from: Date,
  until: Date,
  limit: number,
  residentsEligible = true,
): { opportunities: ResidentPlanningOpportunity[]; reason: string } {
  const start = from.getTime(),
    end = until.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end - start < HOUR)
    return { opportunities: [], reason: "The absence was shorter than one hour." };
  const cap = Math.max(0, Math.min(6, Math.floor(limit)));
  if (!cap) return { opportunities: [], reason: "No resident activity allowance remains." };
  const zone = captured.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  // A fixed recent window bounds work even after years away. Schedule boundaries,
  // rather than periodic samples, preserve short overlapping appointments.
  const windowStart = Math.max(start, end - 7 * 24 * HOUR);
  const candidates: ResidentPlanningOpportunity[] = [];
  const seen = new Set<string>();
  const omissions = new Set<string>();
  const residents = (residentsEligible ? captured.villagers : []).filter((resident) => {
    const joined = Date.parse(resident.addedAt),
      card = Date.parse(resident.cardSnapshot.capturedAt);
    const eligible =
      Number.isFinite(joined) &&
      joined <= start &&
      Number.isFinite(card) &&
      card <= start &&
      !openingPresence(captured, resident.characterId);
    if (!eligible) omissions.add("Some residents lacked departure-time identity or were held by the opening.");
    return eligible;
  });
  const day = new ZonedDate(windowStart, zone);
  day.setHours(0, 0, 0, 0);
  for (let dayCount = 0; dayCount < 9 && day.getTime() < end; dayCount++) {
    const projected = cloneVillageContext(captured);
    planRoutineDays(projected, day);
    const schedules = residents.map((original) => {
      const resident = projected.villagers.find((row) => row.characterId === original.characterId)!;
      return {
        resident,
        blocks: resident.agenda ? agendaBlocksFor(resident.agenda, resident.ingestSchedule !== false, day) : [],
      };
    });
    const scheduleBoundaries = new Set(
      [
        ...new Set([
          0,
          1440,
          ...schedules.flatMap(({ blocks }) => blocks.flatMap((row) => [row.startMinute, row.endMinute])),
        ]),
      ].filter((minute) => Number.isInteger(minute) && minute >= 0 && minute <= 1440),
    );
    const nextDay = new ZonedDate(day, zone);
    nextDay.setDate(nextDay.getDate() + 1);
    const boundaries = [day.getTime()];
    let previousMinute = -1;
    // Walk actual instants so repeated local minutes are included twice and
    // nonexistent spring-forward minutes never become opportunities.
    for (let instant = day.getTime(); instant < nextDay.getTime(); instant += 60_000) {
      const local = new ZonedDate(instant, zone);
      const minute = local.getHours() * 60 + local.getMinutes();
      if (
        (scheduleBoundaries.has(minute) || (previousMinute >= 0 && minute !== previousMinute + 1)) &&
        instant !== boundaries.at(-1)
      )
        boundaries.push(instant);
      previousMinute = minute;
    }
    boundaries.push(nextDay.getTime());
    for (let index = 0; index + 1 < boundaries.length; index++) {
      const left = Math.max(windowStart, boundaries[index]!),
        right = Math.min(end, boundaries[index + 1]!);
      if (right <= left) continue;
      const at = new ZonedDate(left + Math.floor((right - left) / 2), zone);
      const minute = at.getHours() * 60 + at.getMinutes();
      const groups = new Map<string, string[]>();
      const awake: string[] = [];
      for (const { resident, blocks } of schedules) {
        const block = blocks.find((row) => row.startMinute <= minute && row.endMinute > minute);
        if (!block) {
          omissions.add("Some intervals had no saved resident routine.");
          continue;
        }
        if (/\b(?:sleep(?:ing)?|asleep|hibernate|hibernating|dormant)\b/iu.test(block.activity)) {
          omissions.add("Sleeping intervals were skipped.");
          continue;
        }
        awake.push(resident.characterId);
        if (!block.venueId) {
          omissions.add("Some routines did not identify a Venue for an encounter.");
          continue;
        }
        const venue = captured.venues.find((row) => row.id === block.venueId);
        if (!venue || venue.constructionStatus === "worksite") {
          omissions.add("Some scheduled Venues were unavailable.");
          continue;
        }
        const place = villagerPlaceView(projected, resident, null, minute, at);
        if (
          !place ||
          place.id !== venue.id ||
          !place.zoneId ||
          (block.zoneId && block.zoneId !== place.zoneId) ||
          !canEnter(projected, venue.id, place.zoneId, resident.characterId, at)
        ) {
          omissions.add("Some scheduled Zones could not be verified or entered.");
          continue;
        }
        const key = JSON.stringify([venue.id, place.zoneId]);
        groups.set(key, [...(groups.get(key) ?? []), resident.characterId]);
      }
      const involved = new Set<string>();
      const add = (kind: "encounter" | "routine", actorIds: string[], venueId = "", zoneId = "") => {
        const key = JSON.stringify([localDateKey(at), kind, actorIds, venueId, zoneId]);
        if (seen.has(key)) return;
        seen.add(key);
        const instant = at.toISOString();
        candidates.push({
          id:
            "return-" +
            at.getTime() +
            "-" +
            hashString([captured.seed, kind, actorIds.join(","), venueId, zoneId].join("|")),
          kind,
          startsAt: instant,
          endsAt: instant,
          actorIds,
          venueId,
          zoneId: zoneId || undefined,
          facts:
            kind === "encounter"
              ? ["Captured routines place these residents together in this Zone."]
              : ["A resident may reflect privately."],
        });
      };
      for (const [key, ids] of groups) {
        if (ids.length < 2) continue;
        const actors = ids.slice(0, 4);
        actors.forEach((id) => involved.add(id));
        const [venueId, zoneId] = JSON.parse(key) as [string, string];
        add("encounter", actors, venueId, zoneId);
      }
      for (const id of awake) if (!involved.has(id)) add("routine", [id]);
    }
    day.setDate(day.getDate() + 1);
  }
  let chosen = [
    ...candidates.filter((row) => row.kind === "encounter"),
    ...candidates.filter((row) => row.kind === "routine"),
  ]
    .slice(0, cap)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  if (captured.narrative) {
    chosen = [];
    let lane = preferredActivityLane(captured);
    const width = (end - windowStart) / cap;
    for (let index = 0; index < cap; index++) {
      const left = windowStart + index * width,
        right = left + width;
      const resident = candidates.find(
        (row) =>
          Date.parse(row.startsAt) >= left &&
          Date.parse(row.startsAt) < right &&
          !chosen.some((selected) => selected.id === row.id),
      );
      const instant = new Date(left + width / 2).toISOString();
      const grant = admitNarrative(captured, instant, "return-world:" + instant);
      const world: ResidentPlanningOpportunity | null = grant
        ? {
            id: "return-world-" + Date.parse(instant),
            kind: "world",
            startsAt: instant,
            endsAt: instant,
            actorIds: [],
            venueId: grant.targets[0]!.venueId,
            zoneId: grant.targets[0]!.zoneId,
            facts: ["An independently grounded world opportunity within the saved departure interval."],
          }
        : null;
      const selected = lane === "world" ? (world ?? resident) : (resident ?? world);
      if (selected) {
        chosen.push(selected);
        lane = selected.kind === "world" ? "resident" : "world";
      }
    }
    chosen.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }
  if (candidates.length > chosen.length) omissions.add("Further opportunities exceeded the remaining allowance.");
  return {
    opportunities: chosen,
    reason: [
      chosen.length ? "Grounded in the saved departure context." : "No grounded resident opportunity was available.",
      ...(windowStart > start ? ["Only the latest seven days were considered."] : []),
      ...omissions,
    ].join(" "),
  };
}
