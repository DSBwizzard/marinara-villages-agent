import { reconcileProjectDeliveries } from "./project-deliveries.js";
import { completeProject } from "./project-completion.js";
export { validImage, renovationAffectedIds } from "./project-terms.js";
import type { VillageProject, VillageProjectLifecycle, VillageState } from "../models/world.js";
import { conflict, notFound } from "./errors.js";
import { projectProgressPhase, recordProjectProgress } from "./project-progress.js";

export function active(state: VillageState, kind: "new-venue" | "renovation"): boolean {
  return state.projects.some(
    (entry) => entry.kind === kind && entry.lifecycle?.phase !== "complete" && entry.status !== "abandoned",
  );
}

export function projectFor(state: VillageState, id: string): VillageProject & { lifecycle: VillageProjectLifecycle } {
  const project = state.projects.find(
    (entry) => entry.id === id && (entry.kind === "new-venue" || entry.kind === "renovation"),
  );
  if (!project?.lifecycle) throw notFound("That Project no longer exists.");
  if (projectProgressPhase(state, project) !== project.lifecycle.phase)
    throw conflict("Project phase and verified progress disagree. Check DEBUG: Progress before continuing.");
  return project as VillageProject & { lifecycle: VillageProjectLifecycle };
}

export function lifecycle(
  phase: VillageProjectLifecycle["phase"],
  targetVenueId = "",
  change: VillageProjectLifecycle["change"] = null,
  affectedIds: string[] = [],
): VillageProjectLifecycle {
  return {
    version: 2,
    phase,
    targetVenueId,
    change,
    affectedIds,
    approvals: [],
    candidates: [],
    deliveries: [],
    builderId: "",
    requirements: [],
    requirementsEvidenceId: "",
    requirementsAcceptedAt: "",
    recordedItems: [],
    sources: [],
    heldSupplies: [],
    spokenProofs: [],
    evidenceIds: [],
    workOrder: null,
    blockedReason: "",
    completedAt: "",
  };
}

export function sameName(state: VillageState, name: string): boolean {
  const key = name.toLocaleLowerCase();
  return (
    state.venues.some((entry) => entry.name.toLocaleLowerCase() === key) ||
    state.projects.some(
      (entry) =>
        entry.status !== "abandoned" &&
        entry.status !== "complete" &&
        entry.venueDraft?.name.toLocaleLowerCase() === key,
    )
  );
}

export function applyProjectMailboxDecisions(
  state: VillageState,
  projectId: string,
  mailId: string,
  decisions: { characterId: string; accepted: boolean }[],
  at: string,
): void {
  const project = state.projects.find((entry) => entry.id === projectId && entry.lifecycle?.phase === "approval");
  if (!project?.lifecycle) return;
  for (const decision of decisions) {
    if (
      !decision.accepted ||
      !project.lifecycle.affectedIds.includes(decision.characterId) ||
      project.lifecycle.approvals.some((entry) => entry.residentId === decision.characterId)
    )
      continue;
    project.lifecycle.approvals.push({ residentId: decision.characterId, source: "mailbox", evidenceId: mailId, at });
    recordProjectProgress(state, project, `approval:${decision.characterId}`, {
      id: `mail:${mailId}:${decision.characterId}`,
      kind: "project-approval",
      at,
      sourceId: mailId,
      speakerId: decision.characterId,
    });
  }
  if (
    project.lifecycle.affectedIds.every((id) => project.lifecycle!.approvals.some((entry) => entry.residentId === id))
  )
    project.lifecycle.phase = projectProgressPhase(state, project) as VillageProjectLifecycle["phase"];
  project.updatedAt = at;
}

export function finishConstruction(
  state: VillageState,
  project: VillageProject & { lifecycle: VillageProjectLifecycle },
  at: string,
): void {
  const flow = project.lifecycle;
  if (flow.phase !== "construction" || !flow.workOrder || flow.workOrder.pausedAt) return;
  const builder = state.villagers.find((entry) => entry.characterId === flow.builderId);

  flow.completedAt = at;
  project.status = "finishing";
  project.progress = 95;
  project.updatedAt = at;
  recordProjectProgress(state, project, "work-complete", {
    id: `project:${project.id}:work-complete`,
    kind: "work-order",
    at,
    sourceId: project.id,
    speakerId: flow.builderId,
    venueId: project.venueId,
  });
  if (builder?.agenda?.projectWork?.projectId === project.id) delete builder.agenda.projectWork;
}

export function reconcileProjectLifecycles(state: VillageState, now: Date): void {
  reconcileProjectDeliveries(state, now);
  for (const id of state.projects.map((project) => project.id)) {
    const entry = state.projects.find((project) => project.id === id)!;
    if (!entry.lifecycle || entry.lifecycle.phase !== "construction") continue;
    const project = entry as VillageProject & { lifecycle: VillageProjectLifecycle };
    const flow = project.lifecycle;
    const builder = state.villagers.find((resident) => resident.characterId === flow.builderId);
    if (!builder?.agenda) {
      if (flow.workOrder && !flow.workOrder.pausedAt) {
        flow.workOrder.remainingMs = Math.max(0, Date.parse(flow.workOrder.completesAt) - now.getTime());
        flow.workOrder.pausedAt = now.toISOString();
      }
      project.status = "blocked";
      flow.blockedReason = "The Builder left. Choose another willing Villager to finish the work.";
      continue;
    }
    if (flow.workOrder && !flow.workOrder.pausedAt && builder.agenda.projectWork?.projectId !== project.id) {
      flow.workOrder.remainingMs = Math.max(0, Date.parse(flow.workOrder.completesAt) - now.getTime());
      flow.workOrder.pausedAt = now.toISOString();
      project.status = "blocked";
      flow.blockedReason = "The Builder's work assignment changed. Choose a willing available Builder.";
      continue;
    }
    if (flow.workOrder && !flow.workOrder.pausedAt && Date.parse(flow.workOrder.completesAt) <= now.getTime())
      finishConstruction(state, project, flow.workOrder.completesAt);
  }
  for (const project of state.projects.filter((project) => project.lifecycle?.phase === "finishing")) {
    if (project.kind === "new-venue" && !project.plan) continue;
    const staged = structuredClone(state);
    try {
      const candidate = staged.projects.find((entry) => entry.id === project.id)!;
      completeProject(
        staged,
        candidate,
        (candidate.plan ?? {}) as unknown as Record<string, unknown>,
        now.toISOString(),
      );
      Object.assign(state, staged);
    } catch (error) {
      const current = state.projects.find((entry) => entry.id === project.id)!;
      current.lifecycle!.blockedReason = error instanceof Error ? error.message : "The completed Project needs review.";
      current.status = "blocked";
    }
  }
}
