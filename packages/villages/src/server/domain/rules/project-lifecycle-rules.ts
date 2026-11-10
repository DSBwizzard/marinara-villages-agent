import { asTrimmedString } from "./coerce.js";
import { effectiveRenovationChange, plannedVenue, validateRenovationDesign } from "./project-design.js";
import { venueDesignHash } from "./project-structure.js";
import { assertCanAddVillageVenue } from "./venue-capacity.js";
import { villageMap } from "./village-maps.js";
import type { VillageProject, VillageProjectLifecycle, VillageState } from "../models/world.js";
import { conflict, notFound } from "./errors.js";
import { establishmentControllers, establishmentScope } from "./establishment.js";
import { findLocation, placeRegistry } from "./places.js";
import { completeProject, readProjectPlan } from "./project-completion.js";
import {
  allocateProjectFocus,
  projectAgendaReservations,
  projectFocusValid,
  trimProjectFocus,
} from "./project-focus.js";
import { approvalScope, matchesProjectDesign, renovationAffectedIds, projectDesignKey } from "./project-terms.js";
import { cloneVillageContext } from "./world-context-copy.js";
export { renovationAffectedIds, validImage } from "./project-terms.js";

export const PROJECT_DURATION_MS = 24 * 60 * 60_000;
export function active(state: VillageState, kind?: VillageProject["kind"]): boolean {
  return state.projects.some(
    (project) => (!kind || project.kind === kind) && ["working", "paused"].includes(project.status),
  );
}
export function projectFor(state: VillageState, id: string): VillageProject & { lifecycle: VillageProjectLifecycle } {
  const project = state.projects.find((project) => project.id === id);
  if (!project?.lifecycle) throw notFound("That Project no longer exists.");
  return project as VillageProject & { lifecycle: VillageProjectLifecycle };
}
export function lifecycle(
  targetVenueId = "",
  change: VillageProjectLifecycle["change"] = null,
): VillageProjectLifecycle {
  return {
    phase: "planning",
    revision: 1,
    targetVenueId,
    change,
    affectedIds: [],
    approvals: [],
    candidates: [],
    builderId: "",
    spokenProofs: [],
    evidenceIds: [],
    commandReceipts: {},
    baseDesignHash: "",
    changedZoneIds: [],
    workOrder: null,
    blockedReason: "",
    completedAt: "",
  };
}
export function missingProjectAgreements(state: VillageState, project: VillageProject): string[] {
  const flow = project.lifecycle!;
  if (project.kind === "establishment") {
    flow.affectedIds = establishmentControllers(state, project);
    return flow.affectedIds.filter(
      (id) => !flow.approvals.some((row) => row.residentId === id && row.scope === establishmentScope(project)),
    );
  }
  if (project.kind !== "renovation") return [];
  const venue = state.venues.find((venue) => venue.id === project.venueId);
  if (!venue) throw conflict("The Project Venue is missing.");
  flow.affectedIds = renovationAffectedIds(venue, flow.change, flow.changedZoneIds);
  return flow.affectedIds.filter(
    (id) =>
      !flow.approvals.some(
        (approval) =>
          approval.residentId === id && approval.scope === approvalScope(venue, flow.change!, id, flow.changedZoneIds),
      ),
  );
}
/** Refresh readiness from current authority without granting or manufacturing consent. */
export function refreshProjectAgreements(state: VillageState): void {
  for (const project of state.projects) {
    const flow = project.lifecycle;
    if (!flow || !["planning", "working", "paused"].includes(project.status)) continue;
    if (project.kind === "establishment" && !placeRegistry(state)) continue;
    const venue = findLocation(state, project.venueId);
    if (project.kind === "new-venue" || !venue || !flow.change) continue;
    missingProjectAgreements(state, project);
    flow.approvals = flow.approvals.filter(
      (approval) =>
        flow.affectedIds.includes(approval.residentId) &&
        approval.scope ===
          (project.kind === "establishment"
            ? establishmentScope(project)
            : approvalScope(venue, flow.change!, approval.residentId, flow.changedZoneIds)),
    );
  }
}
export function pauseProject(project: VillageProject, at: string, reason: string): void {
  const flow = project.lifecycle!;
  trimProjectFocus(project, at);
  if (flow.workOrder && !flow.workOrder.pausedAt) {
    const pausedAt = Math.max(Date.parse(flow.workOrder.startsAt), Date.parse(at));
    flow.workOrder.remainingMs = Math.max(
      0,
      Math.min(flow.workOrder.remainingMs, Date.parse(flow.workOrder.completesAt) - pausedAt),
    );
    flow.workOrder.pausedAt = new Date(pausedAt).toISOString();
  }
  project.status = flow.phase = "paused";
  flow.blockedReason = reason;
  project.updatedAt = at;
}
export function finishConstruction(
  state: VillageState,
  project: VillageProject & { lifecycle: VillageProjectLifecycle },
  at: string,
): void {
  if (project.status !== "working" || !project.lifecycle.workOrder || project.lifecycle.workOrder.pausedAt) return;
  const staged = cloneVillageContext(state);
  try {
    trimProjectFocus(projectFor(staged, project.id), at);
    completeProject(staged, projectFor(staged, project.id), at);
    projectAgendaReservations(staged);
    Object.assign(state, staged);
  } catch (error) {
    pauseProject(project, at, error instanceof Error ? error.message : "The completed Project needs review.");
    project.lifecycle.workOrder.remainingMs = 0;
  }
}
export function reconcileProjectLifecycles(state: VillageState, now: Date): void {
  const at = now.toISOString();
  for (const id of state.projects.filter((project) => project.status === "working").map((project) => project.id)) {
    const project = projectFor(state, id),
      flow = project.lifecycle;
    if (project.kind === "establishment" && !placeRegistry(state)) continue;
    if (project.kind === "establishment" && !project.establishment?.physical) continue;
    if (
      !state.villagers.some((resident) => resident.characterId === flow.builderId) ||
      !flow.candidates.some(
        (candidate) => candidate.residentId === flow.builderId && matchesProjectDesign(candidate.scope, project),
      )
    ) {
      pauseProject(project, at, "Choose a willing resident lead, then Resume.");
      continue;
    }
    try {
      if (missingProjectAgreements(state, project).length) {
        pauseProject(project, at, "Renew the necessary agreements, then Resume.");
        continue;
      }
    } catch (error) {
      pauseProject(project, at, error instanceof Error ? error.message : "The Project site needs review.");
      continue;
    }
    if (flow.workOrder && Date.parse(flow.workOrder.completesAt) <= now.getTime())
      finishConstruction(state, project, flow.workOrder.completesAt);
    else if (flow.workOrder?.focus) {
      try {
        if (!projectFocusValid(state, project, now)) flow.workOrder.focus = allocateProjectFocus(state, project, now);
      } catch (error) {
        pauseProject(project, at, error instanceof Error ? error.message : "The lead's Agenda needs review.");
      }
    }
  }
  projectAgendaReservations(state);
}

export function beginProject(
  state: VillageState,
  project: ReturnType<typeof projectFor>,
  row: Record<string, unknown>,
  resume: boolean,
  now: Date,
) {
  const flow = project.lifecycle;
  if (project.status !== (resume ? "paused" : "planning"))
    throw conflict(resume ? "This Project is not paused." : "This Project has already started.");
  const lead = asTrimmedString(row.residentId) || flow.builderId;
  const social = project.kind === "establishment" && !project.establishment?.physical;
  if (
    !social &&
    (!state.villagers.some((resident) => resident.characterId === lead) ||
      !flow.candidates.some(
        (candidate) => candidate.residentId === lead && matchesProjectDesign(candidate.scope, project),
      ))
  )
    throw conflict("Choose a willing resident lead for this design.");
  const others = state.projects.filter(
    (other) => other.id !== project.id && ["working", "paused"].includes(other.status),
  );
  if (!resume && others.length >= 2) throw conflict("Two Projects are already active.");
  if (!social && others.some((other) => other.lifecycle?.builderId === lead))
    throw conflict("This resident already leads an active Project.");
  if (others.some((other) => other.venueId && other.venueId === project.venueId))
    throw conflict("This Venue already has an active Project.");
  if (missingProjectAgreements(state, project).length) throw conflict("Obtain the necessary agreements first.");
  if (project.kind === "establishment") {
    const place = state.worldPlaces.places[project.venueId];
    if (!place || place.disabled || !place.prepared || place.report)
      throw conflict("Visit and verify this Place first.");
    if (place.location.presentation.x === null || place.location.presentation.y === null)
      throw conflict("Choose a map position first.");
    if (!resume) assertCanAddVillageVenue(state, flow.change?.classes, project.id);
    if (social) {
      project.status = flow.phase = "working";
      project.updatedAt = now.toISOString();
      return;
    }
    if (project.establishment!.objectives.some((row) => !row.met))
      throw conflict("Resolve the establishment objectives before physical work.");
  }
  if (project.kind !== "new-venue") {
    const venue = findLocation(state, project.venueId)!;
    if (flow.baseDesignHash !== venueDesignHash(venue, flow.changedZoneIds, flow.change))
      throw conflict(
        resume
          ? "The Venue design changed. Cancel this Project and plan the current layout."
          : "The Venue design changed. Revise the draft.",
      );
    if (
      !flow.changedZoneIds.length &&
      JSON.stringify([...(flow.change!.classes ?? [])].sort()) === JSON.stringify([...(venue.classes ?? [])].sort()) &&
      flow.change!.capacity === (venue.residenceCapacity ?? 1)
    )
      throw conflict("Choose a physical change before Start.");
    validateRenovationDesign(state, venue, effectiveRenovationChange(venue, flow.change!, flow.changedZoneIds), now);
  } else {
    if (!project.plan) throw conflict("Save the physical design first.");
    const position = project.venueDraft!.position;
    if (position.x === null || position.y === null) throw conflict("Choose a map position first.");
    villageMap(state, position.mapId);
    const shell = plannedVenue(project);
    readProjectPlan(project.plan, shell);
    if (!resume) {
      assertCanAddVillageVenue(state, project.venueDraft!.classes, project.id);
      if (state.venues.some((venue) => venue.name.toLocaleLowerCase() === project.title.toLocaleLowerCase()))
        throw conflict("That Venue name is already in use.");
      if (
        state.venues.some(
          (venue) =>
            venue.presentation.mapId === position.mapId &&
            venue.presentation.x !== null &&
            venue.presentation.y !== null &&
            Math.abs(venue.presentation.x - position.x!) < 0.055 &&
            Math.abs(venue.presentation.y - position.y!) < 0.055,
        )
      )
        throw conflict("That spot overlaps a Venue.");
      const agreed = flow.candidates.filter((candidate) => matchesProjectDesign(candidate.scope, project));
      state.venues.push(shell);
      project.venueId = shell.id;
      flow.targetVenueId = shell.id;
      // Assigning the live site is an implementation detail, not changed agreement terms.
      for (const candidate of agreed) candidate.scope = projectDesignKey(project);
    }
  }
  const at = now.toISOString(),
    remaining = resume ? flow.workOrder!.remainingMs : PROJECT_DURATION_MS;
  const previousFocus = flow.workOrder?.focus;
  flow.builderId = lead;
  flow.workOrder = {
    startsAt: at,
    completesAt: new Date(now.getTime() + remaining).toISOString(),
    pausedAt: "",
    remainingMs: remaining,
    ...(previousFocus ? { focus: previousFocus } : {}),
  };
  project.status = flow.phase = "working";
  flow.blockedReason = "";
  project.updatedAt = at;
  project.participantIds = [lead];
  flow.workOrder.focus = allocateProjectFocus(state, project, now);
  projectAgendaReservations(state);
}
