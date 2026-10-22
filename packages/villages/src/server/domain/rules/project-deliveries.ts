import type { VillageState, VillageProject } from "../models/world.js";
import { calendarDate, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { agendaBlocksFor, flexibleAgendaInterval } from "./agenda-week.js";
import { flexibleAgendaBlock } from "./agenda-flexibility.js";
import { canOccupyZone, resolveVenueZone, zoneClosed, zoneControllerIds } from "./venue-zones.js";
import { conflict } from "./errors.js";
import { progressProject, recordProjectProgress } from "./project-progress.js";
import { projectDeliveryReserved, projectSupplyKey } from "./project-supply-transfer.js";

type Delivery = NonNullable<NonNullable<VillageProject["lifecycle"]>["deliveries"]>[number];
export function deliveryProblem(
  state: VillageState,
  project: VillageProject,
  job: Delivery,
  now: Date,
  admission = true,
): string {
  const flow = project.lifecycle!,
    source = flow.sources.find(
      (source) => source.evidenceId === job.sourceId && source.requirementId === job.requirementId,
    ),
    requirement = flow.requirements.find((item) => item.id === job.requirementId);
  if (
    flow.phase !== "materials" ||
    job.revision !== progressProject(state, project)!.definition.revision ||
    !source ||
    source.acquiredAt ||
    !requirement?.needed ||
    requirement.carriedAt
  )
    return "The Project's supply arrangement changed. Agree on a new delivery.";
  const resident = state.villagers.find((person) => person.characterId === job.residentId);
  if (!resident?.agenda) return "The delivery Villager left. Choose another willing resident.";
  if (resident.agenda.projectWork) return "The delivery Villager is already committed to construction.";
  const venue = state.venues.find((entry) => entry.id === source.venueId),
    zone = venue && resolveVenueZone(venue, source.zoneId ?? "exterior");
  if (
    !venue ||
    !zone ||
    zoneClosed(state, venue, zone) ||
    (admission && !canOccupyZone(venue, zone, job.residentId, { at: now, relationships: state.relationshipContext }))
  )
    return "The source is unavailable to this Villager. Arrange access or a different source.";
  if (source.kind === "resident-offer") {
    if (!state.villagers.some((person) => person.characterId === source.supplierId))
      return "The supplier is no longer here.";
  } else if (source.kind === "existing-item") {
    if (
      !zone.state.items.includes(source.itemName) ||
      zoneControllerIds(venue, zone).some((actor) => actor !== "player" && actor !== job.residentId)
    )
      return "The recorded stock or its collection authority changed.";
  } else return "Choose a recorded supply source for delivery.";
  if (
    source.kind === "resident-offer" &&
    state.projectSourceClaims.some((claim) => claim.key === projectSupplyKey(source))
  )
    return "That finite contribution has already been used.";
  if (
    !progressProject(state, project)!.receipts.some(
      (receipt) =>
        receipt.requirementId === "source:" + requirement.id && receipt.evidence.sourceId === source.evidenceId,
    )
  )
    return "The saved supply source has no matching proof.";
  return "";
}

export function assignProjectDelivery(
  state: VillageState,
  project: VillageProject,
  requirementId: string,
  residentId: string,
  now: Date,
): void {
  now = new ZonedDate(now, state.timeZone || "UTC");
  const job = project.lifecycle?.deliveries?.find(
    (entry) => entry.requirementId === requirementId && entry.residentId === residentId,
  );
  if (!job) throw conflict("Ask this Villager to agree to the named delivery first.");
  if (job.startsAt && !job.blockedReason) return;
  const error = deliveryProblem(state, project, job, now, false);
  if (error) throw conflict(error);
  const source = project.lifecycle!.sources.find((entry) => entry.evidenceId === job.sourceId)!;
  if (projectDeliveryReserved(state, source.venueId, source.zoneId, source.supplierId, source.itemName))
    throw conflict("That supply is reserved for another delivery.");
  const agenda = state.villagers.find((person) => person.characterId === residentId)!.agenda!;
  if (
    agenda.projectDelivery ||
    state.projects.some((other) =>
      other.lifecycle?.deliveries?.some(
        (entry) =>
          entry !== job &&
          entry.residentId === residentId &&
          entry.startsAt &&
          !entry.completedAt &&
          !entry.blockedReason,
      ),
    )
  )
    throw conflict("That Villager already has an assigned delivery.");
  for (let day = 0; day < 7; day++) {
    const date = calendarDate(now, now.getFullYear(), now.getMonth(), now.getDate() + day);
    for (const block of agendaBlocksFor(agenda, false, date)) {
      const minute = day === 0 ? now.getHours() * 60 + now.getMinutes() + Number(now.getSeconds() > 0) : 0;
      if (!flexibleAgendaBlock(block)) continue;
      for (let start = Math.max(minute, block.startMinute); start + 60 <= block.endMinute; start++) {
        const at = calendarDate(date, date.getFullYear(), date.getMonth(), date.getDate(), 0, start),
          end = new ZonedDate(at.getTime() + 60 * 60000, state.timeZone || "UTC");
        // Keep a delivery inside one unambiguous calendar hour on clock-change days.
        if (
          at.getTime() < now.getTime() ||
          at.getHours() * 60 + at.getMinutes() !== start ||
          end.getTimezoneOffset() !== at.getTimezoneOffset() ||
          (end.getDate() === at.getDate() ? end.getHours() * 60 + end.getMinutes() : 1440) !== start + 60
        )
          continue;
        if (deliveryProblem(state, project, job, at)) continue;
        job.startsAt = at.toISOString();
        job.completesAt = end.toISOString();
        job.blockedReason = "";
        agenda.projectDelivery = {
          projectId: project.id,
          requirementId,
          venueId: source.venueId,
          zoneId: source.zoneId ?? "exterior",
          startsAt: job.startsAt,
          endsAt: job.completesAt,
          activity: "Collect and deliver " + source.itemName,
        };
        project.updatedAt = now.toISOString();
        return;
      }
    }
  }
  throw conflict("This Villager has no free hour for delivery in the next week.");
}

export function cancelProjectDelivery(state: VillageState, project: VillageProject, requirementId: string): void {
  for (const job of project.lifecycle?.deliveries ?? [])
    if (job.requirementId === requirementId && !job.completedAt) {
      const agenda = state.villagers.find((person) => person.characterId === job.residentId)?.agenda;
      if (agenda?.projectDelivery?.projectId === project.id && agenda.projectDelivery.requirementId === requirementId)
        delete agenda.projectDelivery;
      job.startsAt = "";
      job.completesAt = "";
      job.blockedReason = "";
    }
}

function reconcileDelivery(state: VillageState, now: Date, projectId: string, evidenceId: string): void {
  const project = state.projects.find((entry) => entry.id === projectId)!;
  const job = project.lifecycle!.deliveries!.find((entry) => entry.evidenceId === evidenceId)!;
  if (!job.startsAt || job.completedAt || job.blockedReason || Date.parse(job.completesAt) > now.getTime()) return;
  const resident = state.villagers.find((person) => person.characterId === job.residentId),
    agenda = resident?.agenda;
  let error = deliveryProblem(state, project, job, new ZonedDate(job.startsAt, state.timeZone || "UTC"));
  if (
    !error &&
    (!agenda?.projectDelivery ||
      agenda.projectDelivery.projectId !== project.id ||
      agenda.projectDelivery.requirementId !== job.requirementId)
  )
    error = "The Villager's delivery assignment changed.";
  if (!error && agenda) {
    const unassigned = { ...agenda, projectDelivery: undefined };
    const at = new ZonedDate(job.startsAt, state.timeZone || "UTC"),
      end = new ZonedDate(job.completesAt, state.timeZone || "UTC");
    if (
      !flexibleAgendaInterval(
        agendaBlocksFor(unassigned, false, at),
        at.getHours() * 60 + at.getMinutes(),
        end.getHours() * 60 + end.getMinutes() || 1440,
      )
    )
      error = "The Villager's available time changed. Arrange another delivery.";
  }
  if (error) {
    job.blockedReason = error;
    if (agenda?.projectDelivery?.projectId === project.id && agenda.projectDelivery.requirementId === job.requirementId)
      delete agenda.projectDelivery;
    return;
  }
  const flow = project.lifecycle!,
    source = flow.sources.find((entry) => entry.evidenceId === job.sourceId)!,
    item = flow.requirements.find((entry) => entry.id === job.requirementId)!,
    at = job.completesAt;
  if (source.kind === "existing-item") {
    const venue = state.venues.find((entry) => entry.id === source.venueId)!,
      zone = resolveVenueZone(venue, source.zoneId ?? "exterior")!;
    zone.state.items = zone.state.items.filter((name) => name !== source.itemName);
    zone.state.updatedAt = at;
  }
  state.projectSourceClaims.push({
    key: projectSupplyKey(source),
    projectId: project.id,
    sourceId: source.evidenceId,
    submissionId: "delivery:" + job.evidenceId,
  });
  source.acquiredAt = at;
  item.carriedAt = at;
  recordProjectProgress(
    state,
    project,
    "acquired:" + item.id,
    {
      id: "delivery:" + job.evidenceId + ":pickup",
      kind: "project-handoff",
      at,
      sourceId: source.evidenceId,
      lineId: job.evidenceId,
      speakerId: job.residentId,
      venueId: source.venueId,
      excerpt: "Scheduled pickup of " + item.title,
    },
    "handoff",
  );
  item.deliveredAt = at;
  recordProjectProgress(state, project, "delivered:" + item.id, {
    id: "delivery:" + job.evidenceId + ":delivered",
    kind: "project-delivery",
    at,
    sourceId: project.venueId,
    venueId: project.venueId,
  });
  job.completedAt = at;
  project.updatedAt = at;
  delete agenda!.projectDelivery;
}

export function reconcileProjectDeliveries(state: VillageState, now: Date): void {
  const jobs = state.projects.flatMap((project) =>
    (project.lifecycle?.deliveries ?? [])
      .filter(
        (job) => job.startsAt && !job.completedAt && !job.blockedReason && Date.parse(job.completesAt) <= now.getTime(),
      )
      .map((job) => [project.id, job.evidenceId]),
  );
  for (const [projectId, evidenceId] of jobs) {
    const staged = structuredClone(state);
    try {
      reconcileDelivery(staged, now, projectId, evidenceId);
      Object.assign(state, staged);
    } catch (error) {
      const project = state.projects.find((entry) => entry.id === projectId)!,
        job = project.lifecycle!.deliveries!.find((entry) => entry.evidenceId === evidenceId)!;
      job.blockedReason = error instanceof Error ? error.message : "The delivery needs review.";
      const agenda = state.villagers.find((person) => person.characterId === job.residentId)?.agenda;
      if (
        agenda?.projectDelivery?.projectId === projectId &&
        agenda.projectDelivery.requirementId === job.requirementId
      )
        delete agenda.projectDelivery;
    }
  }
}
