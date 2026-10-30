import { calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { ProjectFocus } from "../models/agenda-reservation.js";
import type { VillageAgenda, VillageProject, VillageState } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { conflict } from "./errors.js";
import { ROUTINE_CONTRACT } from "./routine-contract.js";
import { canOccupyZone, venueZones, zoneClosed } from "./venue-zones.js";
import { zoneActivityFits } from "./venue-presence.js";

export const PROJECT_FOCUS_MS = 6 * 60 * 60_000;
const minuteMs = 60_000;
const localDate = (state: VillageState, at: number) =>
  state.timeZone ? new ZonedDate(at, state.timeZone) : new Date(at);

/** Saved absence is not evidence of work: these are planned periods, not an effort meter. */
export function readProjectFocus(value: unknown): ProjectFocus {
  const focus = value as ProjectFocus;
  if (
    !focus ||
    !Number.isInteger(focus.remainingMs) ||
    focus.remainingMs < 0 ||
    focus.remainingMs > PROJECT_FOCUS_MS ||
    focus.remainingMs % minuteMs !== 0 ||
    !Array.isArray(focus.periods) ||
    focus.periods.length > 24
  )
    throw new Error("Invalid Project focus.");
  let end = -Infinity;
  let duration = 0;
  for (const period of focus.periods) {
    const start = Date.parse(period.startsAt),
      next = Date.parse(period.endsAt);
    if (
      typeof period.residentId !== "string" ||
      !period.residentId ||
      !Number.isFinite(start) ||
      !Number.isFinite(next) ||
      start % minuteMs !== 0 ||
      next % minuteMs !== 0 ||
      start < end ||
      next <= start
    )
      throw new Error("Invalid Project focus period.");
    end = next;
    duration += next - start;
  }
  if (duration > focus.remainingMs) throw new Error("Project focus exceeds its remaining time.");
  return structuredClone(focus);
}

/** All Agenda consumers receive the same projection from canonical Project records. */
export function projectAgendaReservations(state: VillageState): void {
  for (const resident of state.villagers) if (resident.agenda) resident.agenda.reservations = [];
  for (const project of state.projects) {
    for (const period of project.lifecycle?.workOrder?.focus?.periods ?? []) {
      const agenda = state.villagers.find((resident) => resident.characterId === period.residentId)?.agenda;
      if (!agenda) continue;
      for (let instant = Date.parse(period.startsAt); instant < Date.parse(period.endsAt); instant += minuteMs) {
        const at = localDate(state, instant),
          key = agendaDateKey(at);
        const startMinute = at.getHours() * 60 + at.getMinutes();
        const prior = agenda.reservations!.at(-1);
        if (
          prior?.id === project.id &&
          prior.dateKey === key &&
          prior.startMinute <= startMinute &&
          prior.endMinute >= startMinute
        )
          prior.endMinute = Math.max(prior.endMinute, startMinute + 1);
        else
          agenda.reservations!.push({
            id: project.id,
            source: "project",
            dateKey: key,
            startMinute,
            endMinute: startMinute + 1,
            venueId: project.venueId,
            zoneId: "exterior",
            activity: "Project work: " + project.title,
            replaces: "routine",
          });
      }
    }
  }
}

/** Consume completed planned minutes, then release the allocation. No historical periods are retained. */
export function trimProjectFocus(project: VillageProject, at: string): void {
  const focus = project.lifecycle?.workOrder?.focus;
  if (!focus) return;
  const cutoff = Date.parse(at);
  const elapsed = focus.periods.reduce(
    (total, period) =>
      total +
      Math.max(
        0,
        Math.floor((Math.min(Date.parse(period.endsAt), cutoff) - Date.parse(period.startsAt)) / minuteMs) * minuteMs,
      ),
    0,
  );
  focus.remainingMs = Math.max(0, focus.remainingMs - elapsed);
  focus.periods = [];
}

function planningAgenda(state: VillageState, residentId: string, projectId: string): VillageAgenda {
  const agenda = state.villagers.find((resident) => resident.characterId === residentId)?.agenda;
  if (!agenda) throw conflict("This lead needs a Routine before starting work.");
  const social = state.relationshipContext?.socialPlans;
  return {
    ...agenda,
    reservations: agenda.reservations?.filter((reservation) => reservation.id !== projectId),
    socialActivities: social
      ? social
          .filter((plan) => ["planned", "completed"].includes(plan.status) && plan.actorIds.includes(residentId))
          .map((plan) => ({ ...plan, wishId: plan.id, baseRevision: plan.revisions[residentId] ?? "" }))
      : agenda.socialActivities,
  };
}

function focusAvailability(state: VillageState, project: VillageProject): (at: Date) => boolean {
  const lead = project.lifecycle!.builderId;
  const agenda = planningAgenda(state, lead, project.id);
  const venue = state.venues.find((item) => item.id === project.venueId);
  const zone = venue && venueZones(venue).find((item) => item.kind === "exterior");
  if (!venue || !zone || zoneClosed(state, venue, zone)) throw conflict("The Project site is unavailable.");
  const rest = new Set(
    agenda.routineProfile?.rhythm.map((row) => agenda.routineProfile!.activities[row.activity]?.activity),
  );
  const days = new Map<string, ReturnType<typeof agendaBlocksFor>>();
  const capacity = new Map<number, boolean>();
  const clockChanges = new Map<string, number>();
  return (at) => {
    const key = agendaDateKey(at);
    const minute = at.getHours() * 60 + at.getMinutes();
    if (!clockChanges.has(key))
      clockChanges.set(
        key,
        Math.abs(
          localDate(state, at.getTime() - 36 * 3_600_000).getTimezoneOffset() -
            localDate(state, at.getTime() + 36 * 3_600_000).getTimezoneOffset(),
        ),
      );
    const change = clockChanges.get(key)!;
    if (change) {
      const first = calendarAt(at, key, minute);
      const later = localDate(state, first.getTime() + change * minuteMs);
      // Civil-minute Agendas cannot distinguish repeated clock labels. Reserve work outside both occurrences.
      if (
        Math.floor(first.getTime() / minuteMs) !== Math.floor(at.getTime() / minuteMs) ||
        (agendaDateKey(later) === key && later.getHours() * 60 + later.getMinutes() === minute)
      )
        return false;
    }
    if (!days.has(key)) days.set(key, agendaBlocksFor(agenda, false, at));
    const instantMinute = Math.floor(at.getTime() / minuteMs);
    if (!capacity.has(instantMinute))
      capacity.set(instantMinute, zoneActivityFits(state, [lead], venue.id, zone.id, minute, minute + 1, at));
    const block = days.get(key)!.find((part) => part.startMinute <= minute && part.endMinute > minute);
    return !!(
      block &&
      !block.essential &&
      !block.commitmentId &&
      !rest.has(block.activity) &&
      capacity.get(instantMinute) &&
      canOccupyZone(venue, zone, lead, { at, relationships: state.relationshipContext, environment: state.narrative })
    );
  };
}

/** Allocate substantial future periods; failure leaves the enclosing command uncommitted. */
export function allocateProjectFocus(state: VillageState, project: VillageProject, now: Date): ProjectFocus {
  const order = project.lifecycle!.workOrder!;
  const retained = structuredClone(order.focus ?? { remainingMs: PROJECT_FOCUS_MS, periods: [] });
  const cutoff = now.getTime();
  const elapsed = retained.periods.reduce(
    (total, period) =>
      total +
      Math.max(
        0,
        Math.floor((Math.min(Date.parse(period.endsAt), cutoff) - Date.parse(period.startsAt)) / minuteMs) * minuteMs,
      ),
    0,
  );
  retained.remainingMs = Math.max(0, retained.remainingMs - elapsed);
  retained.periods = [];
  let remaining = retained.remainingMs;
  if (remaining <= 0) return retained;
  projectAgendaReservations(state);
  const available = focusAvailability(state, project);
  const lead = project.lifecycle!.builderId;
  const windows: { start: number; end: number }[] = [];
  const deadline = Math.floor(Date.parse(order.completesAt) / minuteMs) * minuteMs;
  let current: (typeof windows)[number] | undefined;
  for (let instant = Math.ceil(cutoff / minuteMs) * minuteMs; instant < deadline;) {
    const end = Math.min(deadline, (Math.floor(instant / minuteMs) + 1) * minuteMs);
    const eligible = available(localDate(state, instant));
    if (!eligible) current = undefined;
    else if (current?.end === instant) current.end = end;
    else {
      current = { start: instant, end };
      windows.push(current);
    }
    instant = end;
  }
  for (const window of windows) {
    const duration = Math.min(window.end - window.start, remaining);
    if (duration < Math.min(ROUTINE_CONTRACT.minMinutes * minuteMs, remaining)) continue;
    retained.periods.push({
      residentId: lead,
      startsAt: new Date(window.start).toISOString(),
      endsAt: new Date(window.start + duration).toISOString(),
    });
    remaining -= duration;
    if (remaining <= 0) return retained;
  }
  throw conflict(
    "This lead cannot fit six hours of Project focus before completion. Choose another lead or start later.",
  );
}

/** Existing reservations stay stable unless a real future constraint has changed. */
export function projectFocusValid(state: VillageState, project: VillageProject, now: Date): boolean {
  const lead = project.lifecycle!.builderId;
  const available = focusAvailability(state, project);
  for (const period of project.lifecycle!.workOrder!.focus!.periods) {
    for (
      let instant = Math.max(now.getTime(), Date.parse(period.startsAt));
      instant < Date.parse(period.endsAt);
      instant = (Math.floor(instant / minuteMs) + 1) * minuteMs
    ) {
      if (period.residentId !== lead) return false;
      if (!available(localDate(state, instant))) return false;
    }
  }
  return true;
}
