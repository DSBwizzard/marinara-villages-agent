import { villageNow } from "../../adapters/time/clock-gate.js";
import type { VillageProject, VillageState } from "../../domain/models/world.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, conflict } from "../../domain/rules/errors.js";

import { readProjectPlan } from "../../domain/rules/project-completion.js";
import { plannedVenue, readRenovationChange } from "../../domain/rules/project-design.js";
import {
  beginProject,
  finishConstruction,
  missingProjectAgreements,
  projectFor,
} from "../../domain/rules/project-lifecycle-rules.js";
import { changedZoneIds, venueDesignHash } from "../../domain/rules/project-structure.js";
import { projectAgendaReservations, trimProjectFocus } from "../../domain/rules/project-focus.js";
import { approvalScope, matchesProjectDesign, projectAgreementCurrent } from "../../domain/rules/project-terms.js";
import { validVenueClasses } from "../../domain/rules/venue-model.js";
import { assertMapRevision, villageMap } from "../../domain/rules/village-maps.js";
import { findLocation } from "../../domain/rules/places.js";
import { removeNativeRoom } from "../../domain/rules/native-continuity.js";
import { memoryHash } from "../../domain/rules/memory-integrity.js";
import { undertakingPlanSchema } from "../../domain/decoding/undertaking-codec.js";
import { validateUndertaking, undertakingApprovers } from "../../domain/rules/undertaking.js";
import { lifecycle } from "../../domain/rules/project-lifecycle-rules.js";

function projectDraftRequest(value: unknown) {
  const row = asRecord(value),
    requestId = asTrimmedString(row.requestId);
  if (!requestId || requestId.length > 200) throw badRequest("A request ID is required.");
  return { row, requestId, projectId: "project:" + memoryHash(requestId).slice(0, 32) };
}

export interface ProjectLifecyclePorts {
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  villagesDebugAgentsEnabled: typeof import("../../adapters/engine/runtime-host.js").villagesDebugAgentsEnabled;
  outsideVenueOperation: typeof import("../../adapters/operations/operation-context.js").outsideVenueOperation;
  preparePrivateSpaces: typeof import("../../jobs/private-space-preparation.js").preparePrivateSpaces;
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
    await mutateVillageState(
      (state) => {
        const project = projectFor(state, id),
          flow = project.lifecycle;
        if (Object.hasOwn(flow.commandReceipts, requestId)) {
          if (flow.commandReceipts[requestId] !== fingerprint) throw conflict("This request ID was already used.");
          return;
        }
        if (flow.revision !== row.expectedRevision)
          throw conflict("The Project design changed. Refresh and try again.");
        apply(state, project, row);
        const current = projectFor(state, id).lifecycle;
        current.commandReceipts = { ...current.commandReceipts, [requestId]: fingerprint };
      },
      { memories: true },
    );
  }
  function planning(project: VillageProject) {
    if (project.status !== "planning") throw conflict("Revise the design before starting work.");
  }
  function renew(state: VillageState, project: VillageProject) {
    const flow = project.lifecycle!;
    const venue = findLocation(state, project.venueId);
    if (venue && flow.change) {
      missingProjectAgreements(state, project);
      flow.approvals = flow.approvals.filter(
        (row) =>
          flow.affectedIds.includes(row.residentId) &&
          projectAgreementCurrent(state, row) &&
          row.scope === approvalScope(venue, flow.change!, row.residentId, flow.changedZoneIds, flow.roomBasis),
      );
    }
    flow.candidates = flow.candidates.filter(
      (row) => projectAgreementCurrent(state, row) && matchesProjectDesign(row.scope, project),
    );
    if (!flow.candidates.some((row) => row.residentId === flow.builderId)) flow.builderId = "";
  }
  async function createNewVenueProject(value: unknown) {
    const { row, requestId, projectId } = projectDraftRequest(value);
    await mutateVillageState((state) => {
      const fingerprint = JSON.stringify(["create-new", row]),
        prior = state.projects.find((project) => project.id === projectId);
      if (prior) {
        if (prior.lifecycle?.commandReceipts[requestId] !== fingerprint)
          throw conflict("This request ID was already used.");
        return;
      }
      const project = draftNewVenueProject(state, row, "", projectId);
      if (row.firstUse === true) project.firstUse = { goal: "Enjoy the first visit together" };
      project.lifecycle!.commandReceipts = { [requestId]: fingerprint };
    });
  }
  async function createUndertaking(value: unknown) {
    const { row, requestId, projectId } = projectDraftRequest(value);
    await mutateVillageState(
      (state) => {
        const fingerprint = JSON.stringify(["create-undertaking", row]);
        const prior = state.projects.find((project) => project.id === projectId);
        if (prior) {
          if (prior.lifecycle?.commandReceipts[requestId] !== fingerprint)
            throw conflict("This request ID was already used.");
          return;
        }
        if (
          state.projects.filter(
            (project) =>
              project.status === "planning" &&
              !state.projects.some((parent) => parent.undertaking?.plan.constructionId === project.id),
          ).length >= 6
        )
          throw conflict("Six Project drafts maximum.");
        const title = asTrimmedString(row.title);
        if (!title || title.length > 100) throw badRequest("Give the Project a name of at most 100 characters.");
        const plan = undertakingPlanSchema.parse(
          row.plan ?? {
            goal: asTrimmedString(row.description).slice(0, 2000) || title,
            zoneId: "",
            roles: [],
            milestones: [{ id: "first-use", title: "Get together for the first time", kind: "first-use" }],
          },
        );
        const project: VillageProject = {
          id: projectId,
          kind: "undertaking",
          title,
          venueId: asTrimmedString(row.venueId),
          participantIds: plan.roles.map((role) => role.actorId),
          progress: 0,
          status: "planning",
          updatedAt: villageNow().toISOString(),
          undertaking: { plan, completed: [] },
          lifecycle: lifecycle(asTrimmedString(row.venueId)),
        };
        validateUndertaking(state, project);
        project.lifecycle!.affectedIds = undertakingApprovers(state, project);
        project.lifecycle!.commandReceipts = { [requestId]: fingerprint };
        state.projects.push(project);
      },
      { memories: true },
    );
  }
  async function reviseUndertaking(id: string, value: unknown) {
    await command(id, value, "undertaking-plan", (state, project, row) => {
      planning(project);
      if (project.kind !== "undertaking") throw conflict("Choose a shared Project.");
      const title = asTrimmedString(row.title);
      if (!title || title.length > 100) throw badRequest("Give the Project a name of at most 100 characters.");
      const plan = undertakingPlanSchema.parse(row.plan);
      project.title = title;
      project.venueId = asTrimmedString(row.venueId);
      project.undertaking = { plan, completed: [] };
      project.participantIds = plan.roles.map((role) => role.actorId);
      validateUndertaking(state, project);
      project.lifecycle.affectedIds = undertakingApprovers(state, project);
      project.lifecycle.approvals = [];
      project.lifecycle.revision++;
      project.updatedAt = villageNow().toISOString();
    });
  }
  async function createRenovationProject(venueId: string, value: unknown) {
    const { row, requestId, projectId } = projectDraftRequest(value);
    await mutateVillageState(
      (state) => {
        const fingerprint = JSON.stringify(["create-renovation", venueId, row]),
          prior = state.projects.find((project) => project.id === projectId);
        if (prior) {
          if (prior.lifecycle?.commandReceipts[requestId] !== fingerprint)
            throw conflict("This request ID was already used.");
          return;
        }
        const project = draftRenovationProject(state, venueId, row, projectId);
        if (row.firstUse === true) project.firstUse = { goal: "Try the improved place together" };
        project.lifecycle!.commandReceipts = { [requestId]: fingerprint };
      },
      { memories: true },
    );
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
      const venue = findLocation(state, project.venueId);
      if (project.kind === "new-venue" || !venue) throw conflict("Choose an existing location.");
      const design = readRenovationChange(state, venue, row, villageNow(), project.lifecycle);
      Object.assign(project.lifecycle, design);
      project.lifecycle.changedZoneIds = changedZoneIds(venue, project.lifecycle.change);
      project.lifecycle.baseDesignHash = venueDesignHash(
        venue,
        project.lifecycle.changedZoneIds,
        project.lifecycle.change,
      );
      project.title = asTrimmedString(row.title).slice(0, 100) || project.title;
      project.lifecycle.revision++;
      renew(state, project);
      project.updatedAt = villageNow().toISOString();
    });
  }
  async function lockProjectBuilder(id: string, value: unknown) {
    await command(id, value, "lead", (state, project, row) => {
      if (!["planning", "paused"].includes(project.status)) throw conflict("Choose a lead before Start or Resume.");
      const residentId = asTrimmedString(row.residentId);
      if (
        !project.lifecycle.candidates.some(
          (candidate) =>
            candidate.residentId === residentId &&
            projectAgreementCurrent(state, candidate) &&
            matchesProjectDesign(candidate.scope, project),
        )
      )
        throw conflict("Ask this resident to lead the current design.");
      project.lifecycle.builderId = residentId;
    });
  }
  async function startProjectConstruction(id: string, value: unknown, now = villageNow()) {
    await command(id, value, "start", (state, project, row) => beginProject(state, project, row, false, now));
  }
  async function resumeProject(id: string, value: unknown, now = villageNow()) {
    await command(id, value, "resume", (state, project, row) => beginProject(state, project, row, true, now));
  }
  async function cancelProject(id: string, value: unknown, now = villageNow()) {
    await command(id, value, "cancel", (state, project) => {
      if (["complete", "cancelled"].includes(project.status)) throw conflict("This Project is already finished.");
      const child = state.projects.find((work) => work.id === project.undertaking?.plan.constructionId);
      for (const target of [project, ...(child && !["complete", "cancelled"].includes(child.status) ? [child] : [])]) {
        trimProjectFocus(target, now.toISOString());
        target.status = target.lifecycle!.phase = "cancelled";
        target.updatedAt = now.toISOString();
        target.lifecycle!.blockedReason = "";
        if (target.kind === "new-venue") {
          const site = state.venues.find((venue) => venue.buildProjectId === target.id);
          if (site) {
            for (const zone of site.zones ?? []) removeNativeRoom(state, site.id, zone.id, now.toISOString());
            state.venues = state.venues.filter((venue) => venue !== site);
          }
        }
      }
      projectAgendaReservations(state, now);
    });
  }
  async function debugCompleteProjectConstruction(id: string, value: unknown) {
    if (!ports.villagesDebugAgentsEnabled()) throw conflict("Project debug actions are unavailable.");
    await command(id, value, "debug-complete", (state, project) => {
      if (project.status !== "working" || !project.lifecycle.workOrder) throw conflict("Start physical work first.");
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
  return {
    createUndertaking,
    reviseUndertaking,
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
  };
}
export type ProjectLifecycle = ReturnType<typeof createProjectLifecycle>;
