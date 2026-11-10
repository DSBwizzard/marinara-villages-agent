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
import { draftEstablishmentProject } from "./project-drafts.js";
import { establishmentDraft, establishmentScope, establishmentChange } from "../../domain/rules/establishment.js";
import { findLocation } from "../../domain/rules/places.js";
import { completeProject } from "../../domain/rules/project-completion.js";

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
        if (flow.commandReceipts[requestId]) {
          if (flow.commandReceipts[requestId] !== fingerprint) throw conflict("This request ID was already used.");
          return;
        }
        if (flow.revision !== row.expectedRevision)
          throw conflict("The Project design changed. Refresh and try again.");
        apply(state, project, row);
        projectFor(state, id).lifecycle.commandReceipts[requestId] = fingerprint;
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
          row.scope ===
            (project.kind === "establishment"
              ? establishmentScope(project)
              : approvalScope(venue, flow.change!, row.residentId, flow.changedZoneIds)),
      );
    }
    flow.candidates = flow.candidates.filter(
      (row) => projectAgreementCurrent(state, row) && matchesProjectDesign(row.scope, project),
    );
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
  async function createEstablishmentProject(venueId: string, value: unknown) {
    const row = asRecord(value),
      requestId = asTrimmedString(row.requestId);
    if (!requestId || requestId.length > 200) throw badRequest("A request ID is required.");
    await mutateVillageState(
      (state) => {
        const fingerprint = JSON.stringify(["create-establishment", venueId, row]);
        const prior = state.projects.find((project) => project.id === "project:" + requestId);
        if (prior) {
          if (prior.lifecycle?.commandReceipts[requestId] !== fingerprint)
            throw conflict("This request ID was already used.");
          return;
        }
        const project = draftEstablishmentProject(state, venueId, row, "project:" + requestId);
        project.lifecycle!.commandReceipts[requestId] = fingerprint;
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
      if (project.kind === "establishment") {
        project.establishment = establishmentDraft(row.establishment);
        if (!project.establishment.physical) {
          row = { classes: row.classes ?? venue.classes, detail: project.establishment.goal };
        }
      }
      project.lifecycle.change =
        project.kind === "establishment"
          ? establishmentChange(state, venue, row, project.establishment!, villageNow())
          : readRenovationChange(state, venue, row, villageNow());
      project.lifecycle.changedZoneIds =
        project.establishment && !project.establishment.physical ? [] : changedZoneIds(venue, project.lifecycle.change);
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
      trimProjectFocus(project, now.toISOString());
      project.status = project.lifecycle.phase = "cancelled";
      project.updatedAt = now.toISOString();
      project.lifecycle.blockedReason = "";
      if (project.kind === "new-venue") state.venues = state.venues.filter((venue) => venue.buildProjectId !== id);
      projectAgendaReservations(state);
    });
  }
  async function completeEstablishmentProject(id: string, value: unknown) {
    await command(id, value, "complete", (state, project) => {
      if (project.kind !== "establishment" || project.establishment?.physical || project.status !== "working")
        throw conflict("Start the social establishment Project before completing it.");
      completeProject(state, project, villageNow().toISOString());
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
    createEstablishmentProject,
    completeEstablishmentProject,
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
