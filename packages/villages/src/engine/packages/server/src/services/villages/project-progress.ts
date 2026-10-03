import { conflict } from "./errors.js";
import {
  advanceProgress,
  createProgressTask,
  ingestProgressEvent,
  reviseProgress,
  submitProgressEvidence,
  type ProgressDefinition,
  type ProgressEvidence,
  type ProgressRegistry,
  type ProgressTask,
} from "./progress-engine.js";
import type { VillageProject, VillageState } from "./types.js";

type Context = { state: VillageState; project: VillageProject; resolveOpening?: () => void };

export function progressProject(state: VillageState, project: VillageProject): ProgressTask | null {
  const task = state.progressTasks.find(
    (entry) => entry.definition.owner.kind === "project" && entry.definition.owner.id === project.id,
  );
  if (!task) throw conflict("This Project's progress record is missing.");
  return task;
}

function materialRequirements(project: VillageProject) {
  return (project.lifecycle?.requirements ?? [])
    .filter((requirement) => requirement.needed)
    .flatMap((requirement) => [
      {
        id: `source:${requirement.id}`,
        title: `Identify a finite source for ${requirement.title}`,
        routes: [
          { id: "resident-offer", verifier: "project.gate", params: { gate: "source", requirementId: requirement.id } },
          { id: "recorded-item", verifier: "project.gate", params: { gate: "source", requirementId: requirement.id } },
          { id: "held-supply", verifier: "project.gate", params: { gate: "source", requirementId: requirement.id } },
        ],
      },
      {
        id: `acquired:${requirement.id}`,
        title: `Obtain ${requirement.title}`,
        routes: [
          { id: "handoff", verifier: "project.gate", params: { gate: "acquired", requirementId: requirement.id } },
          { id: "reallocate", verifier: "project.gate", params: { gate: "acquired", requirementId: requirement.id } },
        ],
      },
      {
        id: `delivered:${requirement.id}`,
        title: `Deliver ${requirement.title}`,
        routes: [
          { id: "delivery", verifier: "project.gate", params: { gate: "delivered", requirementId: requirement.id } },
        ],
      },
    ]);
}

function definitionFor(project: VillageProject, revision: number): ProgressDefinition {
  const phases: ProgressDefinition["phases"] = [];
  if (project.kind === "new-venue")
    phases.push({
      id: "concept",
      title: "Place the blueprint",
      requirements: [
        {
          id: "site-placed",
          title: "Choose a site",
          routes: [{ id: "place", verifier: "project.gate", params: { gate: "placed" } }],
        },
      ],
    });
  if (project.kind === "renovation" && project.lifecycle?.affectedIds.length)
    phases.push({
      id: "approval",
      title: "Affected residents approve",
      requirements: project.lifecycle.affectedIds.map((residentId) => ({
        id: `approval:${residentId}`,
        title: `Approval from ${residentId}`,
        routes: [{ id: "consent", verifier: "project.gate", params: { gate: "approval", residentId } }],
      })),
    });
  phases.push(
    {
      id: "builder",
      title: "Assign a willing builder",
      requirements: [
        {
          id: "builder-selected",
          title: "A builder agrees and is selected",
          routes: [{ id: "select", verifier: "project.gate", params: { gate: "builder" } }],
        },
      ],
    },
    {
      id: "requirements",
      title: "Accept the builder's plan",
      requirements: [
        {
          id: "plan-accepted",
          title: "A complete checklist is accepted",
          routes: [{ id: "accept", verifier: "project.gate", params: { gate: "plan" } }],
        },
      ],
    },
    {
      id: "materials",
      title: "Prepare materials",
      requirements: [
        ...materialRequirements(project),
        {
          id: "work-started",
          title: "Begin the builder's shift",
          routes: [{ id: "start", verifier: "project.gate", params: { gate: "start" } }],
        },
      ],
    },
    {
      id: "construction",
      title: "Complete clocked work",
      requirements: [
        {
          id: "work-complete",
          title: "Finish the work order",
          routes: [
            {
              id: "clock",
              verifier: "project.gate",
              params: { gate: "clock" },
              automatic: true,
              evidenceKinds: ["work-order"],
            },
          ],
        },
      ],
    },
    {
      id: "finishing",
      title: "Open the finished venue",
      requirements: [
        {
          id: "opened",
          title: "Finish the opening visit",
          routes: [{ id: "open", verifier: "project.gate", params: { gate: "open" } }],
        },
      ],
    },
  );
  return {
    id: `project:${project.id}`,
    revision,
    owner: { kind: "project", id: project.id },
    resolver: "project.open",
    phases,
  };
}

export function createProjectProgress(state: VillageState, project: VillageProject, at: string): void {
  if (
    state.progressTasks.some(
      (task) => task.definition.owner.kind === "project" && task.definition.owner.id === project.id,
    )
  )
    return;
  const task = createProgressTask(definitionFor(project, 1), at, at);
  for (const phase of task.definition.phases)
    for (const requirement of phase.requirements) task.requirementVisibleAt[requirement.id] = at;
  state.progressTasks.push(task);
}

function verifyGate(
  route: { params: Record<string, string | number | boolean> },
  evidence: ProgressEvidence,
  context: Context,
) {
  const { project, state } = context;
  const flow = project.lifecycle;
  if (!flow) return { status: "rejected" as const, reason: "Project lifecycle is missing." };
  const gate = route.params.gate;
  if (evidence.grade === "cited-interpretation" && gate !== "approval" && gate !== "builder" && gate !== "plan")
    return { status: "rejected" as const, reason: "Interpreted speech cannot authorize physical Project effects." };
  const requirementId = route.params.requirementId;
  const residentId = route.params.residentId;
  const requirement = flow.requirements.find((entry) => entry.id === requirementId);
  const source = flow.sources?.find((entry) => entry.requirementId === requirementId);
  const accepted =
    (gate === "placed" &&
      evidence.kind === "project-placement" &&
      state.venues.some(
        (venue) =>
          venue.id === project.venueId &&
          venue.buildProjectId === project.id &&
          venue.constructionStatus === "worksite",
      )) ||
    (gate === "approval" &&
      evidence.kind === "project-approval" &&
      flow.approvals.some((entry) => entry.residentId === residentId && entry.evidenceId === evidence.sourceId)) ||
    (gate === "builder" &&
      evidence.kind === "project-builder" &&
      flow.builderId === evidence.speakerId &&
      state.villagers.some((resident) => resident.characterId === evidence.speakerId) &&
      flow.candidates.some(
        (entry) => entry.residentId === evidence.speakerId && entry.evidenceId === evidence.sourceId,
      )) ||
    (gate === "plan" &&
      evidence.kind === "project-plan" &&
      !!flow.requirementsAcceptedAt &&
      flow.requirementsEvidenceId === evidence.sourceId &&
      ["structure", "equipment", "finish"].every((category) =>
        flow.requirements.some((entry) => entry.category === category),
      )) ||
    (gate === "source" &&
      evidence.kind === "project-source" &&
      !!source &&
      source.evidenceId === evidence.sourceId &&
      source.venueId === evidence.venueId &&
      source.itemName.toLocaleLowerCase() === requirement?.title.toLocaleLowerCase()) ||
    (gate === "acquired" &&
      (evidence.kind === "project-handoff" || evidence.kind === "project-reallocation") &&
      !!source &&
      state.progressTasks.some(
        (task) =>
          task.definition.owner.id === project.id &&
          task.receipts.some((receipt) => receipt.requirementId === `source:${requirementId}`),
      ) &&
      !!requirement?.carriedAt &&
      (evidence.kind === "project-reallocation"
        ? source.kind === "held-supply" &&
          !!flow.heldSupplies.find((item) => item.assignedRequirementId === requirementId)
        : !!evidence.lineId &&
          evidence.excerpt?.toLocaleLowerCase().includes(requirement.title.toLocaleLowerCase()))) ||
    (gate === "delivered" &&
      evidence.kind === "project-delivery" &&
      !!requirement?.deliveredAt &&
      state.progressTasks.some(
        (task) =>
          task.definition.owner.id === project.id &&
          task.receipts.some((receipt) => receipt.requirementId === `acquired:${requirementId}`),
      )) ||
    (gate === "start" &&
      evidence.kind === "project-start" &&
      !!flow.workOrder &&
      !!state.villagers.find((resident) => resident.characterId === flow.builderId)?.agenda) ||
    (gate === "clock" &&
      evidence.kind === "work-order" &&
      !!flow.workOrder &&
      !flow.workOrder.pausedAt &&
      Date.parse(flow.workOrder.completesAt) <= Date.parse(evidence.at) &&
      state.villagers.find((resident) => resident.characterId === flow.builderId)?.agenda?.projectWork?.projectId ===
        project.id) ||
    (gate === "open" &&
      evidence.kind === "project-opening" &&
      project.status === "finishing" &&
      flow.phase === "finishing" &&
      evidence.venueId === project.venueId &&
      state.venues.some((venue) => venue.id === project.venueId));
  return accepted
    ? { status: "accepted" as const }
    : {
        status: "rejected" as const,
        reason: `The saved ${String(gate)} requirement has no matching verified Project state.`,
      };
}

const registry: ProgressRegistry<Context> = {
  verifiers: { "project.gate": verifyGate },
  resolvers: {
    "project.open": (task, key, { project, state, resolveOpening }) => {
      if (
        task.definition.owner.id !== project.id ||
        project.status !== "finishing" ||
        !state.venues.some((venue) => venue.id === project.venueId)
      )
        throw conflict("The finished Venue is not ready to resolve.");
      if (state.progressTasks.some((entry) => entry !== task && entry.resolutionKey === key))
        throw conflict("This Project outcome has already been applied.");
      if (!resolveOpening) throw conflict("The Project opening action is missing.");
      resolveOpening();
    },
  },
};

export function projectProgressPhase(state: VillageState, project: VillageProject): string {
  const task = progressProject(state, project);
  return task ? (task.definition.phases[task.phaseIndex]?.id ?? "complete") : (project.lifecycle?.phase ?? "");
}

export function ingestProjectProgressEvent(
  state: VillageState,
  project: VillageProject,
  evidence: ProgressEvidence,
): void {
  if (
    !project.lifecycle ||
    !state.progressTasks.some(
      (task) => task.definition.owner.kind === "project" && task.definition.owner.id === project.id,
    )
  )
    return;
  const task = progressProject(state, project);
  if (!task || task.resolvedAt) return;
  ingestProgressEvent([task], evidence, { state, project }, registry);
  project.lifecycle!.phase = projectProgressPhase(state, project) as NonNullable<VillageProject["lifecycle"]>["phase"];
}

export function recordProjectProgress(
  state: VillageState,
  project: VillageProject,
  requirementId: string,
  evidence: ProgressEvidence,
  routeId = "",
  resolveOpening?: () => void,
): void {
  const task = progressProject(state, project);
  if (!task) return;
  const requirement = task.definition.phases[task.phaseIndex]?.requirements.find((entry) => entry.id === requirementId);
  if (!requirement) throw conflict("This Project requirement is not in the current phase.");
  const route = routeId ? requirement.routes.find((entry) => entry.id === routeId) : requirement.routes[0];
  if (!route) throw conflict("This evidence route is not available for the Project requirement.");
  const verdict = submitProgressEvidence(
    task,
    requirementId,
    route.id,
    evidence,
    { state, project, resolveOpening },
    registry,
  );
  if (verdict.status !== "accepted") throw conflict(verdict.reason);
  while (!task.resolvedAt) {
    const before = task.phaseIndex;
    advanceProgress(task, evidence, { state, project, resolveOpening }, registry);
    if (task.phaseIndex === before) break;
  }
  project.lifecycle!.phase = projectProgressPhase(state, project) as NonNullable<VillageProject["lifecycle"]>["phase"];
}

export function reviseProjectProgress(state: VillageState, project: VillageProject, keepBeforePhase: string): void {
  const task = progressProject(state, project);
  if (!task) return;
  const boundary = task.definition.phases.findIndex((phase) => phase.id === keepBeforePhase);
  const retained = task.receipts
    .filter((receipt) => task.definition.phases.findIndex((phase) => phase.id === receipt.phaseId) < boundary)
    .map((receipt) => receipt.id);
  reviseProgress(task, definitionFor(project, task.definition.revision + 1), retained);
  if (task.visibleAt)
    for (const phase of task.definition.phases)
      for (const requirement of phase.requirements) task.requirementVisibleAt[requirement.id] ||= task.visibleAt;
  const synthetic: ProgressEvidence = {
    id: `revision:${task.definition.revision}`,
    kind: "project-revision",
    at: new Date().toISOString(),
    sourceId: project.id,
  };
  while (task.phaseIndex < boundary) {
    const before = task.phaseIndex;
    advanceProgress(task, synthetic, { state, project }, registry);
    if (task.phaseIndex === before) throw conflict("An earlier Project phase lost its verified proof during revision.");
  }
  project.lifecycle!.phase = projectProgressPhase(state, project) as NonNullable<VillageProject["lifecycle"]>["phase"];
}

/** Renew a changed affected-person roster without invalidating verified building work. */
export function renewProjectApprovalProgress(state: VillageState, project: VillageProject): void {
  const task = progressProject(state, project);
  if (!task) return;
  reviseProgress(
    task,
    definitionFor(project, task.definition.revision + 1),
    task.receipts.map((receipt) => receipt.id),
  );
  if (task.visibleAt)
    for (const phase of task.definition.phases)
      for (const requirement of phase.requirements) task.requirementVisibleAt[requirement.id] ||= task.visibleAt;
  const evidence: ProgressEvidence = {
    id: "approval-renewal:" + task.definition.revision,
    kind: "project-revision",
    at: new Date().toISOString(),
    sourceId: project.id,
  };
  while (!task.resolvedAt) {
    const before = task.phaseIndex;
    advanceProgress(task, evidence, { state, project }, registry);
    if (task.phaseIndex === before) break;
  }
  project.lifecycle!.phase = projectProgressPhase(state, project) as NonNullable<VillageProject["lifecycle"]>["phase"];
}
