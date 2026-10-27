import { assertMapRevision, villageMap } from "../../domain/rules/village-maps.js";
import { venueDesignHash, changedZoneIds } from "../../domain/rules/project-structure.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageProject, VillageState } from "../../domain/models/world.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";
import {
  projectFor,
  PROJECT_DURATION_MS,
  finishConstruction,
  missingProjectAgreements,
} from "../../domain/rules/project-lifecycle-rules.js";
import {
  plannedVenue,
  readRenovationChange,
  validateRenovationDesign,
  effectiveRenovationChange,
} from "../../domain/rules/project-design.js";
import { approvalScope, projectDesignKey } from "../../domain/rules/project-terms.js";
import { readProjectPlan } from "../../domain/rules/project-completion.js";
import { assertCanAddVillageVenue } from "../../domain/rules/venue-capacity.js";
import { openingActive, openingView, reconcileOpening } from "../../domain/rules/opening-project.js";
import { openingRenovationDraft } from "../../domain/rules/opening-renovation.js";
import { validVenueClasses } from "../../domain/rules/venue-model.js";

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
export function createProjectLifecycle(ports: ProjectLifecyclePorts) {
  const { mutateVillageState, draftNewVenueProject, draftRenovationProject } = ports;
  async function command(
    id: string,
    value: unknown,
    kind: string,
    apply: (state: VillageState, project: ReturnType<typeof projectFor>, row: Record<string, unknown>) => void,
  ) {
    const row = asRecord(value),
      requestId = asTrimmedString(row.requestId);
    if (!requestId || requestId.length > 200 || !Number.isInteger(row.expectedRevision))
      throw badRequest("Refresh the Project and try again.");
    const fingerprint = JSON.stringify([kind, row]);
    await mutateVillageState((state) => {
      const project = projectFor(state, id),
        flow = project.lifecycle;
      if (flow.commandReceipts[requestId]) {
        if (flow.commandReceipts[requestId] !== fingerprint) throw conflict("This request ID was already used.");
        return;
      }
      if (flow.revision !== row.expectedRevision) throw conflict("The Project design changed. Refresh and try again.");
      apply(state, project, row);
      projectFor(state, id).lifecycle.commandReceipts[requestId] = fingerprint;
    });
  }
  function planning(project: VillageProject) {
    if (project.status !== "planning") throw conflict("Revise the design before starting work.");
  }
  function renew(state: VillageState, project: VillageProject) {
    const flow = project.lifecycle!;
    const venue = state.venues.find((venue) => venue.id === project.venueId);
    if (venue && flow.change) {
      missingProjectAgreements(state, project);
      flow.approvals = flow.approvals.filter(
        (row) =>
          flow.affectedIds.includes(row.residentId) &&
          row.scope === approvalScope(venue, flow.change!, row.residentId, flow.changedZoneIds),
      );
    }
    flow.candidates = flow.candidates.filter((row) => row.scope === projectDesignKey(project));
    if (!flow.candidates.some((row) => row.residentId === flow.builderId)) flow.builderId = "";
  }
  async function createNewVenueProject(value: unknown) {
    const row = asRecord(value),
      requestId = asTrimmedString(row.requestId);
    if (!requestId || requestId.length > 200) throw badRequest("A request ID is required.");
    await mutateVillageState((state) => {
      const fingerprint = JSON.stringify(["create-new", row]),
        prior = state.projects.find((project) => project.id === "project:" + requestId);
      if (prior) {
        if (prior.lifecycle?.commandReceipts[requestId] !== fingerprint)
          throw conflict("This request ID was already used.");
        return;
      }
      const project = draftNewVenueProject(state, row, "", "project:" + requestId);
      project.lifecycle!.commandReceipts[requestId] = fingerprint;
    });
  }
  async function createRenovationProject(venueId: string, value: unknown) {
    const row = asRecord(value),
      requestId = asTrimmedString(row.requestId);
    if (!requestId || requestId.length > 200) throw badRequest("A request ID is required.");
    await mutateVillageState((state) => {
      const fingerprint = JSON.stringify(["create-renovation", venueId, row]),
        prior = state.projects.find((project) => project.id === "project:" + requestId);
      if (prior) {
        if (prior.lifecycle?.commandReceipts[requestId] !== fingerprint)
          throw conflict("This request ID was already used.");
        return;
      }
      const project = draftRenovationProject(state, venueId, row, "project:" + requestId);
      project.lifecycle!.commandReceipts[requestId] = fingerprint;
    });
  }
  async function saveProjectPlan(id: string, value: unknown) {
    await command(id, value, "plan", (state, project, row) => {
      planning(project);
      if (project.kind !== "new-venue") throw conflict("Use the Renovation design.");
      if (row.classes !== undefined) {
        if (!validVenueClasses(row.classes)) throw badRequest("Choose one or two Classes.");
        project.venueDraft!.classes = row.classes;
      }
      project.plan = readProjectPlan(row, plannedVenue(project));
      project.lifecycle.revision++;
      project.updatedAt = villageNow().toISOString();
      renew(state, project);
    });
  }
  async function placeNewVenueProject(id: string, value: unknown) {
    await command(id, value, "place", (state, project, row) => {
      planning(project);
      const x = Number(row.x),
        y = Number(row.y);
      if (
        project.kind !== "new-venue" ||
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        x < 0.03 ||
        x > 0.97 ||
        y < 0.03 ||
        y > 0.97
      )
        throw badRequest("Choose a spot on the Village map.");
      const map = villageMap(state, row.mapId);
      assertMapRevision(map, row.expectedMapRevision);
      if (
        state.venues.some(
          (venue) =>
            venue.presentation.mapId === map.id &&
            venue.presentation.x !== null &&
            venue.presentation.y !== null &&
            Math.abs(venue.presentation.x - x) < 0.055 &&
            Math.abs(venue.presentation.y - y) < 0.055,
        )
      )
        throw conflict("That spot overlaps another Venue.");
      project.venueDraft!.position = { mapId: map.id, x, y };
      map.revision++;
      project.lifecycle.revision++;
      renew(state, project);
      project.updatedAt = villageNow().toISOString();
    });
  }
  async function reviseRenovationProject(id: string, value: unknown) {
    await command(id, value, "revise", (state, project, row) => {
      planning(project);
      const venue = state.venues.find((venue) => venue.id === project.venueId);
      if (project.kind !== "renovation" || !venue) throw conflict("Choose a finished Venue.");
      project.lifecycle.change = readRenovationChange(state, venue, row);
      project.lifecycle.changedZoneIds = changedZoneIds(venue, project.lifecycle.change);
      project.lifecycle.baseDesignHash = venueDesignHash(venue, project.lifecycle.changedZoneIds);
      project.title = asTrimmedString(row.title).slice(0, 100) || project.title;
      project.lifecycle.revision++;
      renew(state, project);
      project.updatedAt = villageNow().toISOString();
    });
  }
  async function lockProjectBuilder(id: string, value: unknown) {
    await command(id, value, "lead", (_state, project, row) => {
      if (!["planning", "paused"].includes(project.status)) throw conflict("Choose a lead before Start or Resume.");
      const residentId = asTrimmedString(row.residentId);
      if (
        !project.lifecycle.candidates.some(
          (candidate) => candidate.residentId === residentId && candidate.scope === projectDesignKey(project),
        )
      )
        throw conflict("Ask this resident to lead the current design.");
      project.lifecycle.builderId = residentId;
    });
  }
  function begin(
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
    if (
      !state.villagers.some((resident) => resident.characterId === lead) ||
      !flow.candidates.some(
        (candidate) => candidate.residentId === lead && candidate.scope === projectDesignKey(project),
      )
    )
      throw conflict("Choose a willing resident lead for this design.");
    const others = state.projects.filter(
      (other) => other.id !== project.id && ["working", "paused"].includes(other.status),
    );
    if (!resume && others.length >= 2) throw conflict("Two Projects are already active.");
    if (others.some((other) => other.lifecycle?.builderId === lead))
      throw conflict("This resident already leads an active Project.");
    if (others.some((other) => other.venueId && other.venueId === project.venueId))
      throw conflict("This Venue already has an active Project.");
    if (missingProjectAgreements(state, project).length) throw conflict("Obtain the necessary agreements first.");
    if (project.kind === "renovation") {
      const venue = state.venues.find((venue) => venue.id === project.venueId)!;
      if (flow.baseDesignHash !== venueDesignHash(venue, flow.changedZoneIds))
        throw conflict(
          resume
            ? "The Venue design changed. Cancel this Project and plan the current layout."
            : "The Venue design changed. Revise the draft.",
        );
      if (
        !flow.changedZoneIds.length &&
        JSON.stringify([...(flow.change!.classes ?? [])].sort()) ===
          JSON.stringify([...(venue.classes ?? [])].sort()) &&
        flow.change!.capacity === (venue.residenceCapacity ?? 1)
      )
        throw conflict("Choose a physical change before Start.");
      validateRenovationDesign(state, venue, effectiveRenovationChange(venue, flow.change!, flow.changedZoneIds));
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
        const priorScope = projectDesignKey(project);
        state.venues.push(shell);
        project.venueId = shell.id;
        flow.targetVenueId = shell.id;
        // Assigning the live site is an implementation detail, not changed agreement terms.
        for (const candidate of flow.candidates)
          if (candidate.scope === priorScope) candidate.scope = projectDesignKey(project);
      }
    }
    const at = now.toISOString(),
      remaining = resume ? flow.workOrder!.remainingMs : PROJECT_DURATION_MS;
    flow.builderId = lead;
    flow.workOrder = {
      startsAt: at,
      completesAt: new Date(now.getTime() + remaining).toISOString(),
      pausedAt: "",
      remainingMs: remaining,
    };
    project.status = flow.phase = "working";
    flow.blockedReason = "";
    project.updatedAt = at;
    project.participantIds = [lead];
  }
  async function startProjectConstruction(id: string, value: unknown, now = villageNow()) {
    await command(id, value, "start", (state, project, row) => begin(state, project, row, false, now));
  }
  async function resumeProject(id: string, value: unknown, now = villageNow()) {
    await command(id, value, "resume", (state, project, row) => begin(state, project, row, true, now));
  }
  async function cancelProject(id: string, value: unknown, now = villageNow()) {
    await command(id, value, "cancel", (state, project) => {
      if (["complete", "cancelled"].includes(project.status)) throw conflict("This Project is already finished.");
      project.status = project.lifecycle.phase = "cancelled";
      project.updatedAt = now.toISOString();
      project.lifecycle.blockedReason = "";
      if (project.kind === "new-venue") state.venues = state.venues.filter((venue) => venue.buildProjectId !== id);
    });
  }
  async function debugCompleteProjectConstruction(id: string, value: unknown) {
    if (!ports.villagesDebugAgentsEnabled()) throw conflict("Project debug actions are unavailable.");
    await command(id, value, "debug-complete", (state, project) => {
      if (project.status !== "working") throw conflict("Start the Project first.");
      project.lifecycle.workOrder!.completesAt = villageNow().toISOString();
      finishConstruction(state, project, villageNow().toISOString());
    });
  }
  async function renewRenovationApprovals(id: string, value: unknown) {
    await command(id, value, "renew-approvals", (state, project) => {
      if (!["planning", "paused"].includes(project.status)) throw conflict("Pause work before renewing agreements.");
      renew(state, project);
    });
  }
  async function decideOpeningProposal(value: unknown) {
    const row = asRecord(value),
      residentId = asTrimmedString(row.residentId);
    await mutateVillageState((state) => {
      reconcileOpening(state);
      const opening = state.opening;
      if (!opening || row.openingId !== opening.id) throw conflict("Refresh the opening.");
      if (row.action === "skip") {
        if (openingActive(state)) {
          opening.stage = "ended";
          opening.outcome = "Skipped";
        }
        return;
      }
      const id = "opening:" + state.seed + ":" + residentId;
      if (row.action === "accept" && opening.projectId === id) return;
      const view = openingView(state)!;
      if (opening.stage !== "conversations" || !view.heardIds.includes(residentId))
        throw conflict("Hear this resident's proposal first.");
      if (row.action === "decline") {
        if (!opening.declinedIds.includes(residentId)) opening.declinedIds.push(residentId);
        reconcileOpening(state);
        return;
      }
      if (row.action !== "accept" || opening.declinedIds.includes(residentId))
        throw conflict("Choose an available proposal.");
      const proposal = opening.proposals.find((proposal) => proposal.residentId === residentId)!;
      const project =
        proposal.kind === "renovation" && proposal.renovation
          ? draftRenovationProject(
              state,
              proposal.renovation.venueId,
              openingRenovationDraft(proposal, state.venues),
              id,
            )
          : draftNewVenueProject(
              state,
              { name: proposal.name, classes: [proposal.venueClass], description: proposal.description },
              residentId,
              id,
            );
      project.requesterCharacterId = residentId;
      project.opening = {
        established: proposal.established,
        provenance: proposal.provenance,
        work: proposal.work,
        firstUse: proposal.firstUse,
      };
      opening.projectId = project.id;
      opening.stage = "project";
    });
  }
  return {
    createNewVenueProject,
    createRenovationProject,
    saveProjectPlan,
    placeNewVenueProject,
    reviseRenovationProject,
    lockProjectBuilder,
    startProjectConstruction,
    resumeProject,
    cancelProject,
    debugCompleteProjectConstruction,
    renewRenovationApprovals,
    decideOpeningProposal,
  };
}
export type ProjectLifecycle = ReturnType<typeof createProjectLifecycle>;
