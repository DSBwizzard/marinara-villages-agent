import { completeProject } from "./project-completion.js";
export { validImage, renovationAffectedIds } from "./project-terms.js";
import { approvalScope, projectDesignKey, renovationAffectedIds } from "./project-terms.js";
import type { VillageProject, VillageProjectLifecycle, VillageState } from "../models/world.js";
import { conflict, notFound } from "./errors.js";

export const PROJECT_DURATION_MS = 24 * 60 * 60_000;
export function active(state: VillageState, kind?: "new-venue" | "renovation"): boolean {
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
export function sameName(state: VillageState, name: string): boolean {
  const key = name.toLocaleLowerCase();
  return state.venues.some((venue) => venue.name.toLocaleLowerCase() === key);
}
export function missingProjectAgreements(state: VillageState, project: VillageProject): string[] {
  const flow = project.lifecycle!;
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
    const venue = state.venues.find((venue) => venue.id === project.venueId);
    if (project.kind !== "renovation" || !venue || !flow.change) continue;
    missingProjectAgreements(state, project);
    flow.approvals = flow.approvals.filter(
      (approval) =>
        flow.affectedIds.includes(approval.residentId) &&
        approval.scope === approvalScope(venue, flow.change!, approval.residentId, flow.changedZoneIds),
    );
  }
}
export function pauseProject(project: VillageProject, at: string, reason: string): void {
  const flow = project.lifecycle!;
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
  const staged = structuredClone(state);
  try {
    completeProject(staged, projectFor(staged, project.id), at);
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
    if (
      !state.villagers.some((resident) => resident.characterId === flow.builderId) ||
      !flow.candidates.some(
        (candidate) => candidate.residentId === flow.builderId && candidate.scope === projectDesignKey(project),
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
  }
}
