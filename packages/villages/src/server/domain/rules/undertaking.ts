import type { VillageProject, VillageState } from "../models/world.js";
import type { AgendaReservation } from "../models/agenda-reservation.js";
import { undertakingPlanSchema } from "../decoding/undertaking-codec.js";
import { continuityActor } from "./continuity-actors.js";
import { conflict } from "./errors.js";
import { projectDesignKey } from "./project-terms.js";
import { resolveVenueZone, zoneClosed, zoneControllerIds } from "./venue-zones.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";
import { restingAgendaBlock } from "./agenda-plan.js";
import { zoneActivityFits } from "./venue-presence.js";
import { ZonedDate, calendarAt } from "../../../shared/helpers/zoned-date.js";

export function undertakingApprovers(state: VillageState, project: VillageProject): string[] {
  const plan = project.undertaking?.plan;
  const venue = state.venues.find((row) => row.id === project.venueId);
  const zone = venue && plan && resolveVenueZone(venue, plan.zoneId);
  return plan
    ? [
        ...new Set([
          ...plan.roles.map((role) => role.actorId),
          ...(zone && venue ? zoneControllerIds(venue, zone) : []),
        ]),
      ].filter((id) => id !== "player")
    : [];
}

export function undertakingAgreed(state: VillageState, project: VillageProject, actorId: string): boolean {
  const actor = continuityActor(state, actorId);
  return (
    !!actor &&
    !!project.lifecycle?.approvals.some(
      (approval) =>
        approval.residentId === actorId &&
        approval.incarnation === actor.incarnation &&
        approval.scope === projectDesignKey(project),
    )
  );
}

export function validateUndertaking(state: VillageState, project: VillageProject): void {
  const plan = undertakingPlanSchema.parse(project.undertaking?.plan);
  const venue = state.venues.find((row) => row.id === project.venueId && row.constructionStatus !== "worksite");
  const zone = venue && resolveVenueZone(venue, plan.zoneId);
  if (!state.setupAt || !venue || !zone || !zone.seen || zone.kind === "exterior")
    throw conflict("Choose a finished Venue and an activity Zone.");
  if (plan.roles.some((role) => !state.villagers.some((resident) => resident.characterId === role.actorId)))
    throw conflict("Choose current Villagers for the shared roles.");
  if (
    plan.constructionId &&
    !state.projects.some(
      (row) =>
        row.id === plan.constructionId &&
        row.kind !== "undertaking" &&
        row.status !== "cancelled" &&
        row.venueId === venue.id,
    )
  )
    throw conflict("Choose physical work at this Venue.");
  if (
    plan.constructionId &&
    state.projects.some(
      (parent) =>
        parent.id !== project.id &&
        parent.status !== "cancelled" &&
        parent.undertaking?.plan.constructionId === plan.constructionId &&
        state.projects.find((work) => work.id === plan.constructionId)?.status !== "complete",
    )
  )
    throw conflict("This physical work already belongs to another shared Project.");
}

export function beginUndertaking(state: VillageState, project: VillageProject, resume: boolean, now: Date): void {
  if (project.status !== (resume ? "paused" : "planning")) throw conflict("This Project cannot start now.");
  validateUndertaking(state, project);
  if (undertakingApprovers(state, project).some((id) => !undertakingAgreed(state, project, id)))
    throw conflict("Ask the people involved to agree to this plan.");
  if (
    !resume &&
    state.projects.filter(
      (row) =>
        row.id !== project.id &&
        row.id !== project.undertaking?.plan.constructionId &&
        ["working", "paused"].includes(row.status) &&
        !state.projects.some(
          (parent) =>
            parent.undertaking?.plan.constructionId === row.id && ["working", "paused"].includes(parent.status),
        ),
    ).length >= 2
  )
    throw conflict("Two Projects are already active.");
  project.status = project.lifecycle!.phase = "working";
  project.lifecycle!.blockedReason = "";
  project.updatedAt = now.toISOString();
}

export type UndertakingOccurrence = { actorId: string; reservation: AgendaReservation };

/** One group is admitted together. A reservation proves a plan, never an experience. */
export function addUndertakingReservations(state: VillageState, now: Date): UndertakingOccurrence[] {
  const admitted: UndertakingOccurrence[] = [];
  if (!Number.isFinite(now.getTime())) return admitted;
  const reference = new ZonedDate(now, state.timeZone || "UTC");
  for (const project of state.projects) {
    const plan = project.undertaking?.plan;
    const schedule = plan?.schedule;
    if (project.kind !== "undertaking" || !plan || !schedule || !["working", "complete"].includes(project.status))
      continue;
    if (undertakingApprovers(state, project).some((id) => !undertakingAgreed(state, project, id))) continue;
    const venue = state.venues.find((row) => row.id === project.venueId);
    const zone = venue && resolveVenueZone(venue, plan.zoneId);
    if (!venue || !zone || zoneClosed(state, venue, zone)) continue;
    const actors = plan.roles.map((role) => role.actorId);
    for (let offset = 0; offset < 7; offset++) {
      const day = calendarAt(reference, agendaDateKey(reference), 720);
      day.setDate(day.getDate() + offset);
      const date = agendaDateKey(day);
      const first = calendarAt(reference, schedule.firstDate, 720);
      if (
        date < schedule.firstDate ||
        (date !== schedule.firstDate && !(schedule.weekly && first.getDay() === day.getDay()))
      )
        continue;
      const id = "undertaking:" + project.id + ":" + date;
      const available = actors.every((actorId) => {
        const agenda = state.villagers.find((row) => row.characterId === actorId)?.agenda;
        if (!agenda) return false;
        const blocks = agendaBlocksFor(agenda, day);
        let covered = schedule.startMinute;
        for (const block of blocks.filter(
          (row) => row.endMinute > schedule.startMinute && row.startMinute < schedule.endMinute,
        )) {
          if (block.startMinute > covered || !flexibleAgendaBlock(block) || restingAgendaBlock(block)) return false;
          covered = Math.max(covered, block.endMinute);
        }
        if (covered < schedule.endMinute) return false;
        for (let minute = schedule.startMinute; minute < schedule.endMinute; minute++) {
          const at = calendarAt(day, date, minute);
          if (
            at.getHours() * 60 + at.getMinutes() !== minute ||
            !accessibleVenueRoute(state, venue, actorId, zone.id, at)
          )
            return false;
        }
        return true;
      });
      if (
        !available ||
        !zoneActivityFits(state, actors, venue.id, zone.id, schedule.startMinute, schedule.endMinute, day)
      )
        continue;
      for (const actorId of actors) {
        const reservation: AgendaReservation = {
          id,
          source: "social",
          dateKey: date,
          startMinute: schedule.startMinute,
          endMinute: schedule.endMinute,
          venueId: venue.id,
          zoneId: zone.id,
          activity: project.title,
          replaces: "flexible",
        };
        state.villagers.find((row) => row.characterId === actorId)!.agenda!.reservations!.push(reservation);
        admitted.push({ actorId, reservation });
      }
    }
  }
  return admitted;
}
