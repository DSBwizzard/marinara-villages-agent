import { assignProjectDelivery, cancelProjectDelivery } from "../../domain/rules/project-deliveries.js";
import { completeProject, readProjectPlan } from "../../domain/rules/project-completion.js";
import { openingRenovationDraft } from "../../domain/rules/opening-renovation.js";
import { openingActive, openingView, reconcileOpening, OPENING_WORK_MS } from "../../domain/rules/opening-project.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageProject, VillageVenue } from "../../domain/models/world.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import {
  progressProject,
  projectProgressPhase,
  recordProjectProgress,
  renewProjectApprovalProgress,
  reviseProjectProgress,
} from "../../domain/rules/project-progress.js";
import { renovationTerms } from "../../domain/rules/project-terms.js";
import { assertCanAddVillageVenue } from "../../domain/rules/venue-capacity.js";
import { validateLayoutZones } from "../../domain/rules/venue-layout.js";
import { defaultVenueSpace } from "../../domain/rules/venue-model.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import { randomUUID } from "node:crypto";
import { projectFor, finishConstruction, renovationAffectedIds } from "../../domain/rules/project-lifecycle-rules.js";

export interface ProjectLifecyclePorts {
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  villagesDebugAgentsEnabled: typeof import("../../adapters/engine/runtime-host.js").villagesDebugAgentsEnabled;
  outsideVenueOperation: typeof import("../../adapters/operations/operation-context.js").outsideVenueOperation;
  preparePrivateSpaces: typeof import("../../jobs/private-space-preparation.js").preparePrivateSpaces;
  loadProjectWishProgress(): Promise<
    Pick<typeof import("../residents/wishes/wish-progress.js"), "processProjectWishOutbox">
  >;
  draftNewVenueProject: typeof import("./project-drafts.js").draftNewVenueProject;
  draftRenovationProject: typeof import("./project-drafts.js").draftRenovationProject;
}
/** Inert Project lifecycle commands keep mutation retries and detached jobs on their supplied connections. */
export function createProjectLifecycle({
  mutateVillageState,
  villagesDebugAgentsEnabled,
  outsideVenueOperation,
  preparePrivateSpaces,
  loadProjectWishProgress,
  draftNewVenueProject,
  draftRenovationProject,
}: ProjectLifecyclePorts) {
  const DAY_MS = 24 * 60 * 60_000;
  const categories = ["structure", "equipment", "finish"] as const;

  async function delegateProjectSupply(id: string, value: unknown): Promise<void> {
    const row = asRecord(value);
    await mutateVillageState((state) =>
      assignProjectDelivery(
        state,
        projectFor(state, id),
        asTrimmedString(row.requirementId),
        asTrimmedString(row.residentId),
        villageNow(),
      ),
    );
  }
  async function cancelProjectSupply(id: string, value: unknown): Promise<void> {
    await mutateVillageState((state) =>
      cancelProjectDelivery(state, projectFor(state, id), asTrimmedString(asRecord(value).requirementId)),
    );
  }
  async function saveProjectPlan(id: string, value: unknown): Promise<void> {
    await mutateVillageState((state) => {
      const project = projectFor(state, id);
      if (project.kind !== "new-venue" || !["builder", "requirements", "materials"].includes(project.lifecycle.phase))
        throw conflict("Save the design before construction.");

      const venue = state.venues.find((entry) => entry.id === project.venueId);
      if (!venue) throw conflict("Choose a Project site first.");
      project.plan = readProjectPlan(value, venue);
      const flow = project.lifecycle;
      for (const requirement of flow.requirements.filter((entry) => entry.carriedAt))
        if (!flow.heldSupplies.some((entry) => entry.assignedRequirementId === requirement.id))
          flow.heldSupplies.push({
            id: "held:" + id + ":" + requirement.id + ":" + requirement.carriedAt,
            itemName: requirement.title,
            acquiredAt: requirement.carriedAt,
            deliveredAt: requirement.deliveredAt,
            assignedRequirementId: "",
          });
      for (const held of flow.heldSupplies) held.assignedRequirementId = "";
      flow.builderId = "";
      flow.candidates = [];
      flow.requirements = [];
      flow.requirementsEvidenceId = "";
      flow.requirementsAcceptedAt = "";
      flow.sources = [];
      reviseProjectProgress(state, project, "builder");
      project.status = "active";
      validateLayoutZones(
        venue,
        [...project.plan.spaces, ...project.plan.privateSpaces],
        venue.classes ?? ["other"],
        state,
      );
      project.updatedAt = villageNow().toISOString();
    });
  }

  async function createNewVenueProject(value: unknown): Promise<void> {
    await mutateVillageState((state) => {
      draftNewVenueProject(state, value);
    });
  }

  async function decideOpeningProposal(value: unknown): Promise<void> {
    const row = asRecord(value);
    const residentId = asTrimmedString(row.residentId);
    await mutateVillageState((state) => {
      reconcileOpening(state);
      const opening = state.opening;
      if (!opening) throw conflict("No opening is available.");
      if (asTrimmedString(row.openingId) !== opening.id) throw conflict("The opening changed. Refresh the Village.");
      if (state.foundingPreparation && state.foundingPreparation.status !== "ready")
        throw conflict("Finish founding preparation first.");
      if (row.action === "skip") {
        if (openingActive(state)) {
          opening.stage = "ended";
          opening.outcome = "Skipped";
        }
        return;
      }
      const requestId = `opening:${state.seed}:${residentId}`;
      if (row.action === "accept" && opening.projectId === requestId) return;
      const view = openingView(state)!;
      if (
        opening.stage !== "conversations" ||
        !view.residentIds.includes(residentId) ||
        !view.heardIds.includes(residentId)
      )
        throw conflict("Hear this resident's proposal first.");
      if (row.action === "decline") {
        if (!opening.declinedIds.includes(residentId)) opening.declinedIds.push(residentId);
        reconcileOpening(state);
        return;
      }
      if (
        row.action !== "accept" ||
        opening.declinedIds.includes(residentId) ||
        !view.residentIds.every((id) => view.heardIds.includes(id))
      )
        throw conflict("Hear every resident's proposal before choosing.");
      const proposal = opening.proposals.find((entry) => entry.residentId === residentId)!;
      const project =
        proposal.kind === "renovation" && proposal.renovation
          ? draftRenovationProject(
              state,
              proposal.renovation.venueId,
              openingRenovationDraft(proposal, state.venues),
              requestId,
            )
          : draftNewVenueProject(
              state,
              { name: proposal.name, classes: [proposal.venueClass], description: proposal.description },
              residentId,
              requestId,
            );
      project.requesterCharacterId = residentId;
      project.opening = {
        version: 1,
        established: proposal.established,
        provenance: proposal.provenance,
        work: proposal.work,
        firstUse: proposal.firstUse,
        durationMs: OPENING_WORK_MS,
      };
      opening.projectId = project.id;
      opening.stage = "project";
    });
  }

  function worksite(project: VillageProject, x: number, y: number, at: string): VillageVenue {
    const draft = project.venueDraft!;
    return {
      id: randomUUID(),
      buildProjectId: project.id,
      constructionStatus: project.opening?.established ? "complete" : "worksite",
      name: draft.name,
      form: "",
      classes: draft.classes,
      spaces: draft.classes.map((item) => defaultVenueSpace(item, draft.description)),
      residenceCapacity: 1,
      residentIds: [],
      improvements: [null, null],
      description: draft.description,
      category: "",
      presentation: { image: null, x, y },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      workerIds: [],
      exteriorState: defaultVenueSpace("other", draft.description).state,
      state: {
        condition: project.opening?.established ? draft.description : "planned",
        upgrades: [],
        furniture: [],
        publicFacts: [],
        features: [],
        traces: [],
        updatedAt: at,
      },
    };
  }

  async function placeNewVenueProject(id: string, value: unknown): Promise<void> {
    const row = asRecord(value);
    const x = Number(row.x),
      y = Number(row.y);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0.03 || x > 0.97 || y < 0.03 || y > 0.97)
      throw badRequest("Choose a spot on the Village map.");
    await mutateVillageState((state) => {
      const project = projectFor(state, id);
      if (project.kind !== "new-venue" || project.lifecycle.phase !== "concept")
        throw conflict("This Project is past map placement.");
      if (
        state.venues.some(
          (venue) =>
            venue.presentation.x !== null &&
            venue.presentation.y !== null &&
            Math.abs(venue.presentation.x - x) < 0.055 &&
            Math.abs(venue.presentation.y - y) < 0.055,
        )
      )
        throw conflict("That spot overlaps another Venue. Choose another place.");
      assertCanAddVillageVenue(state, project.venueDraft?.classes, project.id);
      const at = villageNow().toISOString();
      const shell = worksite(project, x, y, at);
      state.venues.push(shell);
      project.venueId = shell.id;
      project.venueDraft!.position = { x, y };
      project.lifecycle.targetVenueId = shell.id;
      project.lifecycle.phase = "builder";
      project.status = "active";
      project.updatedAt = at;
      recordProjectProgress(state, project, "site-placed", {
        id: `project:${id}:placed`,
        kind: "project-placement",
        at,
        sourceId: shell.id,
        venueId: shell.id,
      });
    });
  }

  async function createRenovationProject(venueId: string, value: unknown): Promise<void> {
    await mutateVillageState((state) => {
      draftRenovationProject(state, venueId, value);
    });
  }

  async function requestProjectMailbox(id: string): Promise<void> {
    await mutateVillageState((state) => {
      const project = projectFor(state, id),
        flow = project.lifecycle;
      if (project.kind !== "renovation" || flow.phase !== "approval")
        throw conflict("This Project needs no approvals now.");
      const pending = flow.affectedIds.filter(
        (residentId) => !flow.approvals.some((row) => row.residentId === residentId),
      );
      if (!pending.length) return;
      if (
        state.venueMail.some(
          (mail) => mail.kind === "project-approval" && mail.projectId === id && mail.status === "awaiting-villagers",
        )
      )
        return;
      const at = villageNow();
      state.venueMail.push({
        id: randomUUID(),
        projectId: id,
        venueId: project.venueId,
        kind: "project-approval",
        title: project.title,
        detail: flow.change ? renovationTerms(flow.change) : "",
        status: "awaiting-villagers",
        createdAt: at.toISOString(),
        dueAt: new Date(at.getTime() + 60 * 60_000).toISOString(),
        resolvedAt: "",
        requesterCharacterId: "",
        affectedIds: pending,
        decisions: [],
        error: "",
      });
    });
  }

  async function lockProjectBuilder(id: string, value: unknown): Promise<void> {
    const residentId = asTrimmedString(asRecord(value).residentId);
    await mutateVillageState((state) => {
      const project = projectFor(state, id),
        flow = project.lifecycle;
      if (
        flow.phase !== "builder" &&
        flow.phase !== "requirements" &&
        flow.phase !== "materials" &&
        !(flow.phase === "construction" && project.status === "blocked")
      )
        throw conflict("The Builder cannot be changed in this phase.");
      if (
        !flow.candidates.some((entry) => entry.residentId === residentId) ||
        !state.villagers.some((entry) => entry.characterId === residentId)
      )
        throw conflict("This Villager has not agreed to build this Project.");
      if (
        state.projects.some(
          (other) =>
            other.id !== id &&
            other.lifecycle?.phase === "construction" &&
            other.lifecycle.builderId === residentId &&
            !other.lifecycle.workOrder?.pausedAt,
        )
      )
        throw conflict("That Builder is already working on another Project.");
      if (state.villagers.find((person) => person.characterId === residentId)?.agenda?.projectDelivery)
        throw conflict("That Villager already has an assigned delivery.");
      if (project.kind === "new-venue" && !project.plan)
        throw conflict("Save the Venue design before assigning a Builder.");
      const switched = flow.builderId !== residentId;
      if (switched && flow.phase !== "builder") {
        const candidate = flow.candidates.find((entry) => entry.residentId === residentId)!;
        const task = progressProject(state, project)!;
        const currentPhaseStartedAt = task.transitions.at(-1)?.at ?? task.definedAt;
        const since =
          flow.phase === "construction" ? (flow.workOrder?.pausedAt ?? currentPhaseStartedAt) : currentPhaseStartedAt;
        if (Date.parse(candidate.at) < Date.parse(since))
          throw conflict("Ask this Builder again after the current phase began for a fresh agreement.");
      }
      flow.builderId = residentId;
      project.participantIds = [...new Set([...project.participantIds, residentId])];
      if (flow.phase === "construction") {
        if (!flow.workOrder?.pausedAt) throw conflict("Construction is not paused.");
        const at = villageNow();
        flow.workOrder.startsAt = at.toISOString();
        flow.workOrder.completesAt = new Date(at.getTime() + flow.workOrder.remainingMs).toISOString();
        flow.workOrder.pausedAt = "";
        const builder = state.villagers.find((entry) => entry.characterId === residentId)!;
        if (!builder.agenda) throw conflict("The new Builder needs an agenda.");
        builder.agenda.projectWork = {
          projectId: id,
          venueId: project.venueId,
          startsAt: flow.workOrder.startsAt,
          endsAt: flow.workOrder.completesAt,
        };
        project.status = "building";
      } else if (switched) {
        const revising = projectProgressPhase(state, project) !== "builder";
        if (revising)
          for (const requirement of flow.requirements.filter((entry) => entry.carriedAt)) {
            const existing = flow.heldSupplies.find((entry) => entry.assignedRequirementId === requirement.id);
            if (existing) existing.assignedRequirementId = "";
            else
              flow.heldSupplies.push({
                id: `held:${project.id}:${requirement.id}:${requirement.carriedAt}`,
                itemName: requirement.title,
                acquiredAt: requirement.carriedAt,
                deliveredAt: requirement.deliveredAt,
                assignedRequirementId: "",
              });
          }
        flow.phase = "requirements";
        flow.requirements = [];
        flow.requirementsEvidenceId = "";
        flow.requirementsAcceptedAt = "";
        if (revising) reviseProjectProgress(state, project, "builder");
        project.status = "active";
        const candidate = flow.candidates.find((entry) => entry.residentId === residentId)!;
        const spoken = flow.spokenProofs.find((entry) => entry.lineId === candidate.evidenceId);
        if (!spoken || spoken.speakerId !== residentId)
          throw conflict("The Builder's recorded agreement is missing its saved spoken proof.");
        recordProjectProgress(state, project, "builder-selected", {
          id: `project:${id}:builder:${candidate.evidenceId}`,
          kind: "project-builder",
          at: candidate.at,
          sourceId: candidate.evidenceId,
          lineId: candidate.evidenceId,
          speakerId: residentId,
          venueId: spoken?.venueId,
          excerpt: spoken?.quote,
          ...(spoken?.grade
            ? { grade: spoken.grade, interpretationVersion: spoken.interpretationVersion, citations: spoken.citations }
            : {}),
        });
      }
      flow.blockedReason = "";
      project.updatedAt = villageNow().toISOString();
    });
  }

  async function acceptProjectRequirements(id: string): Promise<void> {
    await mutateVillageState((state) => {
      const project = projectFor(state, id),
        flow = project.lifecycle;
      if (
        flow.phase !== "requirements" ||
        !flow.requirementsEvidenceId ||
        !categories.every((category) => flow.requirements.some((entry) => entry.category === category))
      )
        throw conflict("Ask the Builder for a complete requirements list first.");
      flow.requirementsAcceptedAt = villageNow().toISOString();
      {
        flow.recordedItems = state.venues.flatMap((venue) =>
          venueZones(venue).flatMap((zone) =>
            zone.state.items
              .filter(
                (itemName) =>
                  !state.narrativeItems.some(
                    (item) =>
                      item.venueId === venue.id &&
                      (!item.zoneId || item.zoneId === zone.id) &&
                      item.itemName === itemName,
                  ),
              )
              .map((itemName) => ({ venueId: venue.id, zoneId: zone.id, itemName })),
          ),
        );
        flow.sources = [];
      }
      flow.phase = "materials";
      project.updatedAt = flow.requirementsAcceptedAt;
      reviseProjectProgress(state, project, "requirements");
      const spoken = flow.spokenProofs.find((entry) => entry.lineId === flow.requirementsEvidenceId);
      if (!spoken || spoken.speakerId !== flow.builderId)
        throw conflict("The Builder's checklist is missing its saved spoken proof.");
      recordProjectProgress(state, project, "plan-accepted", {
        id: `project:${id}:plan:${flow.requirementsEvidenceId}`,
        kind: "project-plan",
        at: flow.requirementsAcceptedAt,
        sourceId: flow.requirementsEvidenceId,
        lineId: flow.requirementsEvidenceId,
        speakerId: flow.builderId,
        venueId: spoken?.venueId,
        excerpt: spoken?.quote,
        ...(spoken?.grade
          ? { grade: spoken.grade, interpretationVersion: spoken.interpretationVersion, citations: spoken.citations }
          : {}),
      });
    });
  }

  async function deliverProjectMaterial(id: string, value: unknown): Promise<void> {
    const requirementId = asTrimmedString(asRecord(value).requirementId);
    await mutateVillageState((state) => {
      const project = projectFor(state, id),
        flow = project.lifecycle;
      if (flow.phase !== "materials") throw conflict("This Project is not preparing materials now.");
      const entry = flow.requirements.find((row) => row.id === requirementId && row.needed);
      if (!entry || !entry.carriedAt) throw conflict("Obtain this supply in a Village visit before delivering it.");
      if (entry.deliveredAt) return;
      entry.deliveredAt = villageNow().toISOString();
      project.updatedAt = entry.deliveredAt;
      recordProjectProgress(state, project, `delivered:${requirementId}`, {
        id: `project:${id}:delivered:${requirementId}`,
        kind: "project-delivery",
        at: entry.deliveredAt,
        sourceId: project.venueId,
        venueId: project.venueId,
      });
    });
  }

  async function startProjectConstruction(id: string, now = villageNow()): Promise<void> {
    await mutateVillageState((state) => {
      const project = projectFor(state, id),
        flow = project.lifecycle;
      if (
        flow.phase !== "materials" ||
        !flow.requirementsAcceptedAt ||
        flow.requirements.some((entry) => entry.needed && !entry.deliveredAt)
      )
        throw conflict("Deliver every required supply before construction begins.");
      const builder = state.villagers.find((entry) => entry.characterId === flow.builderId);
      if (builder?.agenda?.projectDelivery)
        throw conflict("The Builder must finish their assigned delivery before construction.");
      if (!builder?.agenda) throw conflict("The agreed Builder must still live here and have an agenda.");
      if (
        state.projects.some(
          (entry) =>
            entry.id !== id &&
            entry.lifecycle?.phase === "construction" &&
            entry.lifecycle.builderId === flow.builderId,
        )
      )
        throw conflict("That Builder is already working on another Project.");
      if (project.kind === "new-venue" && !project.plan) throw conflict("Save the Venue design before construction.");
      if (project.kind === "renovation") {
        const venue = state.venues.find((entry) => entry.id === project.venueId);
        if (
          !venue ||
          renovationAffectedIds(venue, flow.change).some(
            (actorId) => !flow.approvals.some((approval) => approval.residentId === actorId),
          )
        )
          throw conflict("Renew the Renovation approvals for the people currently affected before construction.");
      }
      const at = now.toISOString(),
        durationMs = project.opening ? OPENING_WORK_MS : DAY_MS,
        completesAt = new Date(now.getTime() + durationMs).toISOString();
      flow.workOrder = { startsAt: at, completesAt, pausedAt: "", remainingMs: durationMs };
      builder.agenda.projectWork = {
        projectId: id,
        venueId: project.venueId,
        zoneId: "exterior",
        startsAt: at,
        endsAt: completesAt,
      };
      flow.phase = "construction";
      project.status = "building";
      project.progress = 80;
      project.updatedAt = at;
      recordProjectProgress(state, project, "work-started", {
        id: `project:${id}:work-started`,
        kind: "project-start",
        at,
        sourceId: id,
        speakerId: flow.builderId,
        venueId: project.venueId,
      });
      if (projectProgressPhase(state, project) !== "construction")
        throw conflict("Verified supplies are required before work starts.");
      if (state.opening?.projectId === project.id) state.opening.ordinaryProjectsUnlocked = true;
    });
  }

  async function debugCompleteProjectConstruction(id: string): Promise<void> {
    if (!villagesDebugAgentsEnabled()) throw conflict("Project debug actions are not enabled.");
    await mutateVillageState((state) => {
      const project = projectFor(state, id);
      if (project.lifecycle.phase !== "construction" || project.status !== "building")
        throw conflict("Start construction before using the debug completion action.");
      if (project.lifecycle.workOrder) project.lifecycle.workOrder.completesAt = villageNow().toISOString();
      finishConstruction(state, project, villageNow().toISOString());
    });
  }

  async function openFinishedProject(id: string, value: unknown): Promise<void> {
    const row = asRecord(value);
    await mutateVillageState((state) => {
      const project = projectFor(state, id);
      if (project.status === "complete") return;
      if (project.kind === "new-venue" && !project.plan) throw conflict("Save the Venue design before construction.");
      completeProject(
        state,
        project,
        (project.plan ?? row) as unknown as Record<string, unknown>,
        villageNow().toISOString(),
      );
    });
    outsideVenueOperation(() => {
      void preparePrivateSpaces().catch(() => {});
      void loadProjectWishProgress()
        .then((module) => module.processProjectWishOutbox())
        .catch(() => {});
    });
  }

  /** Material proposal revisions invalidate approval, builder, and checklist evidence. */
  async function reviseRenovationProject(id: string, value: unknown): Promise<void> {
    await mutateVillageState((state) => {
      const project = projectFor(state, id),
        old = project.lifecycle;
      if (project.opening && openingActive(state))
        throw conflict("Skip the opening before changing the chosen proposal.");
      if (project.kind !== "renovation" || ["construction", "finishing", "complete"].includes(old.phase))
        throw conflict("Revise structural terms before construction begins.");
      const body = structuredClone(asRecord(value));
      const upgrade = asRecord(body.improvement);
      if (Array.isArray(upgrade.zones)) {
        const venue = state.venues.find((entry) => entry.id === project.venueId)!;
        upgrade.zones = upgrade.zones.map((value) => {
          const zone = asRecord(value);
          return {
            ...zone,
            id:
              typeof zone.id === "string" &&
              !venueZones(venue).some((entry) => entry.id === zone.id && entry.upgradeId !== upgrade.id)
                ? zone.id
                : undefined,
          };
        });
        body.improvement = upgrade;
      }
      old.phase = "complete"; // Validation still uses the current Venue and its actual slots.
      const draft = draftRenovationProject(state, project.venueId, body);
      state.projects = state.projects.filter((entry) => entry.id !== draft.id);
      state.progressTasks = state.progressTasks.filter((task) => task.definition.owner.id !== draft.id);
      const held = structuredClone(old.heldSupplies).map((item) => ({ ...item, assignedRequirementId: "" }));
      for (const item of old.requirements.filter((entry) => entry.carriedAt)) {
        if (!old.heldSupplies.some((entry) => entry.assignedRequirementId === item.id))
          held.push({
            id: "held:" + id + ":" + item.id + ":" + item.carriedAt,
            itemName: item.title,
            acquiredAt: item.carriedAt,
            deliveredAt: item.deliveredAt,
            assignedRequirementId: "",
          });
      }
      project.title = draft.title;
      project.lifecycle = { ...draft.lifecycle!, heldSupplies: held, evidenceIds: old.evidenceIds };
      project.participantIds = [];
      project.status = "active";
      project.progress = 0;
      project.updatedAt = villageNow().toISOString();
      for (const mail of state.venueMail.filter(
        (entry) => entry.projectId === id && entry.status === "awaiting-villagers",
      )) {
        mail.status = "declined";
        mail.resolvedAt = project.updatedAt;
      }
      reviseProjectProgress(state, project, "approval");
    });
  }

  async function renewRenovationApprovals(id: string): Promise<void> {
    await mutateVillageState((state) => {
      const project = projectFor(state, id),
        flow = project.lifecycle;
      if (
        project.kind !== "renovation" ||
        !["finishing", "approval", "builder", "requirements", "materials"].includes(flow.phase)
      )
        throw conflict("Renew affected-person approvals before construction or at completion.");
      const venue = state.venues.find((entry) => entry.id === project.venueId);
      if (!venue) throw conflict("The Project Venue is missing.");
      flow.affectedIds = renovationAffectedIds(venue, flow.change);
      flow.approvals = flow.approvals.filter((entry) => flow.affectedIds.includes(entry.residentId));
      if (flow.affectedIds.every((id) => flow.approvals.some((entry) => entry.residentId === id))) return;
      flow.phase = "approval";
      project.status = "active";
      flow.blockedReason = "";
      renewProjectApprovalProgress(state, project);
      project.updatedAt = villageNow().toISOString();
    });
  }

  return {
    delegateProjectSupply,
    cancelProjectSupply,
    saveProjectPlan,
    decideOpeningProposal,
    createNewVenueProject,
    placeNewVenueProject,
    createRenovationProject,
    requestProjectMailbox,
    lockProjectBuilder,
    acceptProjectRequirements,
    deliverProjectMaterial,
    startProjectConstruction,
    debugCompleteProjectConstruction,
    openFinishedProject,
    reviseRenovationProject,
    renewRenovationApprovals,
  };
}
export type ProjectLifecycle = ReturnType<typeof createProjectLifecycle>;
