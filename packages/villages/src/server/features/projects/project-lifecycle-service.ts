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
import { boundText, MAX_VENUE_DESCRIPTION_LENGTH } from "../../domain/rules/prompt-preset.js";
import { assertCanAddVillageVenue } from "../../domain/rules/venue-capacity.js";
import { readBaseVenueLayout, validateLayoutZones } from "../../domain/rules/venue-layout.js";
import { defaultVenueSpace, venueResidentIds } from "../../domain/rules/venue-model.js";
import { effectiveVenueClasses, venueZones } from "../../domain/rules/venue-zones.js";
import { readVenueImageContext } from "../../domain/rules/village-projections.js";
import { randomUUID } from "node:crypto";
import {
  projectFor,
  finishConstruction,
  validImage,
  renovationAffectedIds,
} from "../../domain/rules/project-lifecycle-rules.js";

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

  async function createNewVenueProject(value: unknown): Promise<void> {
    await mutateVillageState((state) => {
      draftNewVenueProject(state, value);
    });
  }

  function worksite(project: VillageProject, x: number, y: number, at: string): VillageVenue {
    const draft = project.venueDraft!;
    return {
      id: randomUUID(),
      buildProjectId: project.id,
      constructionStatus: "worksite",
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
        condition: "planned",
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
      const at = new Date().toISOString();
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
      const at = new Date();
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
        const at = new Date();
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
      project.updatedAt = new Date().toISOString();
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
      flow.requirementsAcceptedAt = new Date().toISOString();
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
      entry.deliveredAt = new Date().toISOString();
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

  async function startProjectConstruction(id: string, now = new Date()): Promise<void> {
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
      const at = now.toISOString(),
        completesAt = new Date(now.getTime() + DAY_MS).toISOString();
      flow.workOrder = { startsAt: at, completesAt, pausedAt: "", remainingMs: DAY_MS };
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
    });
  }

  async function debugCompleteProjectConstruction(id: string): Promise<void> {
    if (!villagesDebugAgentsEnabled()) throw conflict("Project debug actions are not enabled.");
    await mutateVillageState((state) => {
      const project = projectFor(state, id);
      if (project.lifecycle.phase !== "construction" || project.status !== "building")
        throw conflict("Start construction before using the debug completion action.");
      if (project.lifecycle.workOrder) project.lifecycle.workOrder.completesAt = new Date().toISOString();
      finishConstruction(state, project, new Date().toISOString());
    });
  }

  async function openFinishedProject(id: string, value: unknown): Promise<void> {
    const row = asRecord(value);
    await mutateVillageState((state) => {
      const project = projectFor(state, id),
        flow = project.lifecycle;
      if (flow.phase !== "finishing") throw conflict("Construction must finish before the opening visit.");
      const venue = state.venues.find((entry) => entry.id === project.venueId);
      if (!venue) throw conflict("The Project site is missing.");
      if (project.kind === "renovation") {
        if (
          ["classes", "capacity", "homeKind", "slot", "improvement", "zones", "baseZones", "change"].some(
            (key) => row[key] !== undefined,
          )
        )
          throw conflict(
            "Reviewed structural terms cannot change at finishing. Revise the proposal and obtain renewed approval before construction.",
          );
        const change = flow.change!;
        const upgrades = [...(venue.improvements ?? [null, null])];
        if (change.slot !== undefined) upgrades[change.slot] = change.improvement ?? null;
        const projected = {
          ...venue,
          baseClasses: change.classes ?? venue.baseClasses ?? venue.classes,
          improvements: upgrades,
        };
        const classes = effectiveVenueClasses(projected);
        if (classes.length > 2) throw conflict("A Venue may have at most two distinct Classes.");
        if (!classes.includes("residence") && (venueResidentIds(venue).length || venue.occupancy.playerHome))
          throw conflict("Residents must move before Residence is removed.");
        if (!classes.includes("workplace") && venue.workerIds?.length)
          throw conflict("Workers must be unassigned before Workplace is removed.");
        if (
          venueResidentIds(venue).length + Number(venue.occupancy.playerHome) >
          Math.min(
            4,
            (change.capacity ?? venue.residenceCapacity ?? 1) +
              upgrades.reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0),
          )
        )
          throw conflict("The finished Residence needs room for its current residents.");
        validateLayoutZones(
          venue,
          [
            ...(change.baseZones ??
              venueZones(venue).filter(
                (zone) => !zone.upgradeId && zone.kind !== "exterior" && classes.includes(zone.venueClass),
              )),
            ...upgrades.flatMap((upgrade) => upgrade?.zones ?? []),
          ],
          classes,
          state,
        );
        const newAffected = renovationAffectedIds(venue, change).filter(
          (actorId) => !flow.affectedIds.includes(actorId),
        );
        if (newAffected.length)
          throw conflict("The affected residents or workers changed. Renew the Renovation approvals before opening.");
      }
      const at = new Date().toISOString();
      const applyOpening = () => {
        if (project.kind === "new-venue") {
          const form = boundText(row.form, 240).trim();
          const exterior = boundText(row.exteriorDescription, MAX_VENUE_DESCRIPTION_LENGTH).trim();
          if (!form || !exterior)
            throw badRequest("Define the Venue's physical form and Entrance appearance before opening it.");
          if (row.layoutVersion !== 1) throw badRequest("Choose the venue layout before opening it.");
          if (row.layoutVersion === 1) {
            const zones = readBaseVenueLayout(
              { ...row, description: exterior, presentation: { image: row.exteriorImage } },
              venue.classes ?? ["other"],
              "",
              validImage,
            );
            for (const zone of zones) {
              const existing = venue.zones?.find((saved) => saved.id === zone.id);
              // Structural finishing cannot replace access rules governed by the command service.
              zone.access = existing?.access;
            }
            validateLayoutZones(
              venue,
              zones.filter((zone) => zone.kind !== "exterior"),
              venue.classes ?? ["other"],
              state,
            );
            venue.layoutVersion = 1;
            venue.zones = zones;
            venue.spaces = zones.filter((zone) => ["public", "shared-residence"].includes(zone.kind));
            venue.privateSpaces = zones
              .filter((zone) => zone.kind === "private-residence")
              .map((zone) => ({ ...zone, ownerId: zone.ownerId || "" }));
            venue.form = form;
            venue.venueType = boundText(row.venueType, 100);
            venue.imageContext = readVenueImageContext(row.imageContext);
            venue.description = exterior;
            venue.presentation.image = validImage(row.exteriorImage);
            venue.constructionStatus = "complete";
            venue.state.condition = "complete";
            venue.state.updatedAt = at;
            flow.phase = "complete";
            project.status = "complete";
            project.progress = 100;
            project.updatedAt = at;
            return;
          }
        } else {
          const change = flow.change!;
          if (change.classes) {
            venue.baseClasses = change.classes;
            venue.classes = change.classes;
            if (venue.layoutVersion !== 1)
              venue.spaces = change.classes.map(
                (venueClass) =>
                  venue.spaces?.find((space) => space.venueClass === venueClass) ??
                  defaultVenueSpace(venueClass, venue.description),
              );
          }
          const oldZones = venueZones(venue);
          const oldUpgrade = change.slot !== undefined ? venue.improvements?.[change.slot] : null;
          const nextDrafts = change.improvement?.zones ?? [];
          const retired = oldZones.filter(
            (zone) =>
              zone.kind !== "exterior" &&
              ((change.baseZones && !zone.upgradeId && !change.baseZones.some((draft) => draft.id === zone.id)) ||
                (change.classes && !zone.upgradeId && !change.classes.includes(zone.venueClass)) ||
                (oldUpgrade &&
                  zone.upgradeId === oldUpgrade.id &&
                  (change.improvement?.id !== oldUpgrade.id || !nextDrafts.some((draft) => draft.id === zone.id)))),
          );
          venue.archivedZones = [
            ...(venue.archivedZones ?? []),
            ...retired.map((zone) => ({ zone: structuredClone(zone), archivedAt: at })),
          ].slice(-64);
          venue.zones = oldZones.filter((zone) => !retired.some((entry) => entry.id === zone.id));
          venue.layoutVersion = 1;
          if (change.baseZones) {
            for (const draft of change.baseZones) {
              const index = venue.zones.findIndex((zone) => zone.id === draft.id);
              const previous = index >= 0 ? venue.zones[index] : undefined;
              const zone = {
                ...defaultVenueSpace(draft.venueClass),
                ...previous,
                ...draft,
                description: draft.preserveDescription && previous ? previous.description : draft.description,
                preparation:
                  !previous &&
                  ["staff", "restricted", "private-residence"].includes(draft.kind) &&
                  (draft.kind !== "private-residence" || !!draft.ownerId)
                    ? { status: "pending" as const }
                    : previous?.preparation,
                image: previous?.image ?? null,
                seen: previous?.seen ?? draft.ownerId === "player",
              };
              if (index >= 0) venue.zones[index] = zone;
              else venue.zones.push(zone);
            }
          }
          if (change.improvement)
            for (const draft of nextDrafts) {
              const index = venue.zones.findIndex((zone) => zone.id === draft.id);
              const previous = index >= 0 ? venue.zones[index] : undefined;
              const zone = {
                ...defaultVenueSpace(draft.venueClass, draft.description),
                ...previous,
                ...draft,
                description: draft.preserveDescription && previous ? previous.description : draft.description,
                preparation:
                  ["staff", "restricted", "private-residence"].includes(draft.kind) &&
                  !previous &&
                  (draft.kind !== "private-residence" || !!draft.ownerId)
                    ? { status: "pending" as const }
                    : previous?.preparation,
                upgradeId: change.improvement.id,
                image: previous?.image ?? null,
              };
              const image = validImage(asRecord(row.zoneImages)[draft.id]);
              if (image) zone.image = image;
              if (index >= 0) venue.zones[index] = zone;
              else venue.zones.push(zone);
            }
          venue.playerInvitations = venue.playerInvitations?.filter(
            (invitation) => !retired.some((zone) => zone.id === invitation.zoneId),
          );
          if (change.capacity !== undefined) venue.residenceCapacity = change.capacity;
          if (change.homeKind) {
            venue.occupancy.homeKind = change.homeKind;
            const tierName = state.homeBuildingNames[change.homeKind];
            if (tierName && !venue.state.upgrades.includes(tierName)) venue.state.upgrades.push(tierName);
          }
          if (change.slot !== undefined) {
            const upgrades = [...(venue.improvements ?? [null, null])];
            upgrades[change.slot] = change.improvement ? { ...change.improvement, approvedAt: at } : null;
            venue.improvements = upgrades;
          }
          venue.editProposals = venue.editProposals?.filter(
            (proposal) => !retired.some((zone) => zone.id === proposal.zoneId),
          );
          if (venue.layoutVersion === 1) {
            venue.spaces = venue.zones.filter(
              (zone) => !zone.upgradeId && ["public", "shared-residence"].includes(zone.kind),
            );
            venue.privateSpaces = venue.zones
              .filter((zone) => zone.kind === "private-residence")
              .map((zone) => ({ ...zone, ownerId: zone.ownerId || "" }));
          }
          venue.classes = effectiveVenueClasses(venue);
          const exterior = validImage(row.exteriorImage);
          if (exterior) venue.presentation.image = exterior;
        }
        venue.state.updatedAt = at;
        flow.phase = "complete";
        project.status = "complete";
        project.progress = 100;
        project.updatedAt = at;
        state.projectWishOutbox.push({ projectId: id, at });
      };
      const evidence = {
        id: `project:${id}:opened`,
        kind: "project-opening",
        at,
        sourceId: project.venueId,
        venueId: project.venueId,
      };
      recordProjectProgress(state, project, "opened", evidence, "", applyOpening);
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
            id: venueZones(venue).some((entry) => entry.id === zone.id && entry.upgradeId === upgrade.id)
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
      project.updatedAt = new Date().toISOString();
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
      if (project.kind !== "renovation" || !["finishing", "approval"].includes(flow.phase))
        throw conflict("Renew affected-person approvals at the finishing review.");
      const venue = state.venues.find((entry) => entry.id === project.venueId);
      if (!venue) throw conflict("The Project Venue is missing.");
      flow.affectedIds = renovationAffectedIds(venue, flow.change);
      flow.approvals = flow.approvals.filter((entry) => flow.affectedIds.includes(entry.residentId));
      if (flow.affectedIds.every((id) => flow.approvals.some((entry) => entry.residentId === id))) return;
      flow.phase = "approval";
      renewProjectApprovalProgress(state, project);
      project.updatedAt = new Date().toISOString();
    });
  }

  return {
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
