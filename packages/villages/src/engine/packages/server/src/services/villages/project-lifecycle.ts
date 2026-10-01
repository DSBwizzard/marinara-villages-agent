import { readBaseVenueLayout, validateLayoutZones } from "./venue-layout.js";
import { outsideVenueOperation } from "./venue-coordinator.js";
import { readVenueImageContext } from "./village.js";
import { preparePrivateSpaces } from "./private-space-preparation.js";
import { venueZones, effectiveVenueClasses } from "./venue-zones.js";
import { randomUUID } from "node:crypto";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest, conflict, notFound } from "./errors.js";
import {
  MAX_PLACES,
  MAX_VENUES,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  boundText,
  isHousePlace,
  isHomeBuildingKind,
  remapVenues,
} from "./prompt-preset.js";
import type {
  VillageProject,
  VillageProjectLifecycle,
  VillageState,
  VillageVenue,
  VillageVenueClass,
  VillageVenueImage,
  VillageVenueImprovement,
  VillageZoneDraft,
} from "./types.js";
import { defaultVenueSpace, validVenueClasses, venueResidentIds } from "./venue-model.js";
import { mutateVillageState } from "./village-store.js";
import {
  completeWithRoom,
  villagesDebugAgentsEnabled,
  villagesLanguageModels,
  villagesLogger,
} from "./package-runtime.js";
import { villagesConnectionIdFor } from "./connections.js";
import { extractJsonObject } from "./village-bootstrap.js";
import {
  createProjectProgress,
  progressProject,
  projectProgressPhase,
  recordProjectProgress,
  reviseProjectProgress,
  renewProjectApprovalProgress,
} from "./project-progress.js";

const DAY_MS = 24 * 60 * 60_000;
const categories = ["structure", "equipment", "finish"] as const;
type Category = (typeof categories)[number];

function active(state: VillageState, kind: "new-venue" | "renovation"): boolean {
  return state.projects.some(
    (entry) => entry.kind === kind && entry.lifecycle?.phase !== "complete" && entry.status !== "abandoned",
  );
}

function projectFor(state: VillageState, id: string): VillageProject & { lifecycle: VillageProjectLifecycle } {
  const project = state.projects.find(
    (entry) => entry.id === id && (entry.kind === "new-venue" || entry.kind === "renovation"),
  );
  if (!project?.lifecycle) throw notFound("That Project no longer exists.");
  if (state.progressEngineVersion === 1 && projectProgressPhase(state, project) !== project.lifecycle.phase)
    throw conflict("Project phase and verified progress disagree. Check DEBUG: Progress before continuing.");
  return project as VillageProject & { lifecycle: VillageProjectLifecycle };
}

function lifecycle(
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

function sameName(state: VillageState, name: string): boolean {
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

export async function createNewVenueProject(value: unknown): Promise<void> {
  await mutateVillageState((state) => {
    draftNewVenueProject(state, value);
  });
}

export function draftNewVenueProject(
  state: VillageState,
  value: unknown,
  requesterCharacterId = "",
  requestId = "",
): VillageProject {
  const row = asRecord(value);
  const name = boundText(row.name, MAX_VENUE_NAME_LENGTH).trim();
  const description = boundText(row.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
  const classes = Array.isArray(row.classes) ? row.classes : [row.venueClass];
  if (!name || !description || !validVenueClasses(classes) || classes.length !== 1)
    throw badRequest("Give the New Venue one Class, a name, and a description.");
  const existing = requestId && state.projects.find((entry) => entry.id === requestId);
  if (existing) return existing;
  if (!state.setupAt && !state.villagers.length && !state.venues.some((venue) => isHousePlace(venue)))
    throw conflict("Found the Village before starting a Project.");
  if (active(state, "new-venue")) throw conflict("Finish the current New Venue before starting another.");
  if (sameName(state, name)) throw conflict("That Venue name is already in use or reserved.");
  if (state.venues.length >= MAX_PLACES || remapVenues(state.venues).length >= MAX_VENUES)
    throw conflict("The Village has no open place for another Venue.");
  const at = new Date().toISOString();
  const project: VillageProject = {
    id: requestId || randomUUID(),
    kind: "new-venue",
    title: name,
    venueId: "",
    participantIds: requesterCharacterId ? [requesterCharacterId] : [],
    progress: 0,
    status: "draft",
    updatedAt: at,
    venueDraft: {
      name,
      classes: classes as VillageVenueClass[],
      description,
      category: "",
      position: { x: null, y: null },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
    },
    lifecycle: lifecycle("concept"),
  };
  state.projects.push(project);
  createProjectProgress(state, project, at);
  return project;
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

export async function placeNewVenueProject(id: string, value: unknown): Promise<void> {
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
    if (state.venues.length >= MAX_PLACES) throw conflict("The Village has no room for another Venue.");
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

export async function createRenovationProject(venueId: string, value: unknown): Promise<void> {
  await mutateVillageState((state) => {
    draftRenovationProject(state, venueId, value);
  });
}

export function draftRenovationProject(state: VillageState, venueId: string, value: unknown): VillageProject {
  const row = asRecord(value);
  const title = boundText(row.title, MAX_VENUE_NAME_LENGTH).trim() || "Renovation";
  const detail = boundText(row.detail, MAX_VENUE_DESCRIPTION_LENGTH).trim();
  const classes = row.classes === undefined ? undefined : row.classes;
  if (classes !== undefined && !validVenueClasses(classes)) throw badRequest("Choose one or two Venue Classes.");
  const capacity = row.capacity === undefined ? undefined : Number(row.capacity);
  if (capacity !== undefined && (!Number.isInteger(capacity) || capacity < 1 || capacity > 4))
    throw badRequest("Residence capacity must be from one to four.");
  const homeKind = row.homeKind === undefined ? undefined : asTrimmedString(row.homeKind);
  if (homeKind !== undefined && !isHomeBuildingKind(homeKind)) throw badRequest("Choose a valid home tier.");
  const baseZonesInput = row.baseZones;
  const slot = row.slot === undefined ? undefined : Number(row.slot);
  if (slot !== undefined && slot !== 0 && slot !== 1) throw badRequest("Choose Upgrade slot one or two.");
  const improvementRow = row.improvement === null ? null : asRecord(row.improvement);
  const improvement: VillageVenueImprovement | null | undefined =
    row.improvement === undefined
      ? undefined
      : improvementRow === null
        ? null
        : {
            id: asTrimmedString(improvementRow.id) || randomUUID(),
            classContribution:
              improvementRow.classContribution === undefined || improvementRow.classContribution === ""
                ? undefined
                : validVenueClasses([improvementRow.classContribution])
                  ? (improvementRow.classContribution as VillageVenueClass)
                  : (() => {
                      throw badRequest("Choose a valid Upgrade Class.");
                    })(),
            zones: undefined,
            title: boundText(improvementRow.title, MAX_VENUE_NAME_LENGTH).trim(),
            description: boundText(improvementRow.description, MAX_VENUE_DESCRIPTION_LENGTH).trim(),
            spaceId: asTrimmedString(improvementRow.spaceId) || null,
            extraBeds: Number(improvementRow.extraBeds ?? 0),
            approvedAt: "",
          };
  if (
    !detail ||
    (classes === undefined &&
      capacity === undefined &&
      homeKind === undefined &&
      slot === undefined &&
      baseZonesInput === undefined) ||
    (slot === undefined && improvement !== undefined) ||
    (improvement &&
      (!improvement.title ||
        !improvement.description ||
        !Number.isInteger(improvement.extraBeds) ||
        improvement.extraBeds < 0 ||
        improvement.extraBeds > 3))
  )
    throw badRequest("Describe a physical change, including its Class, capacity, or Upgrade slot.");
  if (active(state, "renovation")) throw conflict("Finish the current Renovation before starting another.");
  const venue = state.venues.find((entry) => entry.id === venueId && entry.constructionStatus !== "worksite");
  if (!venue) throw notFound("That finished Venue no longer exists.");
  if (homeKind && !venue.classes?.includes("residence")) throw conflict("Only a Residence has a home tier.");
  let baseZones: VillageZoneDraft[] | undefined;
  if (baseZonesInput !== undefined) {
    if (!Array.isArray(baseZonesInput) || baseZonesInput.length > 16)
      throw badRequest("Describe up to sixteen base zones.");
    const ids = new Set<string>();
    baseZones = baseZonesInput.map((value) => {
      const raw = asRecord(value),
        id = asTrimmedString(raw.id) || randomUUID();
      if (ids.has(id) || id === "exterior" || venueZones(venue).some((zone) => zone.id === id && zone.upgradeId))
        throw badRequest("Base zone IDs must be distinct from the exterior and Upgrade zones.");
      ids.add(id);
      const kind = String(raw.kind);
      const existingArea = venueZones(venue).find((zone) => zone.id === id);
      const name = boundText(raw.name, 100).trim(),
        description = boundText(raw.description, 1000).trim();
      if (
        !name ||
        !["public", "shared-residence", "private-residence", "staff", "restricted"].includes(kind) ||
        (!description && !existingArea?.description && ["public", "shared-residence"].includes(kind))
      )
        throw badRequest("Describe each base zone and choose its kind.");
      const existing = venueZones(venue).find((zone) => zone.id === id);
      if (existing?.kind === "private-residence" && asTrimmedString(raw.ownerId) !== (existing.ownerId || ""))
        throw badRequest("Resident moves assign Private Spaces; Renovations cannot transfer occupied rooms.");
      return {
        id,
        name,
        preserveDescription: !description && !!existingArea,
        kind: kind as VillageZoneDraft["kind"],
        description,
        purpose: boundText(raw.purpose, 240),
        ownerId: asTrimmedString(raw.ownerId) || undefined,
        controllerIds: Array.isArray(raw.controllerIds)
          ? raw.controllerIds.filter((id): id is string => typeof id === "string")
          : [],
        venueClass: raw.venueClass as VillageVenueClass,
      };
    });
    for (const kinds of [
      ["public", "shared-residence"],
      ["private-residence", "staff", "restricted"],
    ]) {
      const oldCount = venueZones(venue).filter((zone) => !zone.upgradeId && kinds.includes(zone.kind)).length;
      if (baseZones.filter((zone) => kinds.includes(zone.kind)).length > Math.max(1, oldCount))
        throw badRequest("Further areas must be added as Upgrade zones; existing base areas may be retained.");
    }
  }
  const priorUpgrade = slot !== undefined ? venue.improvements?.[slot] : null;
  if (improvement && improvementRow) {
    if (improvementRow.id && improvement.id !== priorUpgrade?.id)
      throw badRequest("Only the current Upgrade can be modified in this slot.");
    if (improvementRow.zones !== undefined) {
      if (!Array.isArray(improvementRow.zones) || improvementRow.zones.length > 16)
        throw badRequest("Describe up to sixteen Upgrade zones.");
      const ids = new Set<string>();
      improvement.zones = improvementRow.zones.map((value) => {
        const zone = asRecord(value),
          requestedId = asTrimmedString(zone.id);
        const existing = requestedId
          ? venueZones(venue).find((entry) => entry.id === requestedId && entry.upgradeId === improvement.id)
          : undefined;
        if (requestedId && !existing) throw badRequest("A modified zone must belong to this Upgrade.");
        const id = existing?.id ?? randomUUID(),
          name = boundText(zone.name, MAX_VENUE_NAME_LENGTH).trim(),
          description = boundText(zone.description, MAX_VENUE_DESCRIPTION_LENGTH).trim();
        if (
          !name ||
          (!description &&
            !existing?.description &&
            !["private-residence", "staff", "restricted"].includes(String(zone.kind))) ||
          ids.has(id) ||
          !["public", "shared-residence", "private-residence", "staff", "restricted"].includes(String(zone.kind))
        )
          throw badRequest("Give every zone a name, description, and supported kind.");
        if (existing?.kind === "private-residence" && asTrimmedString(zone.ownerId) !== (existing.ownerId || ""))
          throw badRequest("Resident moves assign Private Spaces; Renovations cannot transfer occupied rooms.");
        ids.add(id);
        return {
          id,
          name,
          description,
          preserveDescription: !description && !!existing,
          purpose: boundText(zone.purpose, 240),
          ownerId: asTrimmedString(zone.ownerId) || undefined,
          controllerIds: Array.isArray(zone.controllerIds)
            ? [...new Set(zone.controllerIds.filter((id): id is string => typeof id === "string"))]
            : [],
          kind: zone.kind as VillageZoneDraft["kind"],
          venueClass: validVenueClasses([zone.venueClass])
            ? (zone.venueClass as VillageVenueClass)
            : (improvement.classContribution ?? (venue.baseClasses ?? venue.classes ?? ["other"])[0]!),
        };
      });
    } else if (priorUpgrade?.id === improvement.id) improvement.zones = priorUpgrade.zones;
  }
  const baseClasses = (classes ?? venue.baseClasses ?? venue.classes ?? ["other"]) as VillageVenueClass[];
  const proposedUpgrades = [...(venue.improvements ?? [null, null])];
  if (slot !== undefined) proposedUpgrades[slot] = improvement ?? null;
  const nextClasses = effectiveVenueClasses({ ...venue, baseClasses, improvements: proposedUpgrades });
  if (nextClasses.length > 2)
    throw conflict("A Venue may have at most two distinct Classes across its base and Upgrades.");
  const survivingUpgradeZones = venueZones(venue).filter(
    (zone) => zone.upgradeId && zone.upgradeId !== priorUpgrade?.id,
  );
  for (const zone of [...(improvement?.zones ?? []), ...survivingUpgradeZones]) {
    if (
      zone.kind === "restricted" &&
      (!zone.controllerIds?.length ||
        zone.controllerIds.some(
          (id) => id !== "player" && !state.villagers.some((person) => person.characterId === id),
        ))
    )
      throw badRequest("Choose current villagers as private-space controllers.");
    if (
      !nextClasses.includes(zone.venueClass) ||
      (zone.kind === "shared-residence" && zone.venueClass !== "residence") ||
      (zone.kind === "staff" && zone.venueClass !== "workplace")
    )
      throw badRequest("The zone must be supported by the Venue's Classes.");
  }
  if (!nextClasses.includes("residence") && (venueResidentIds(venue).length || venue.occupancy.playerHome))
    throw conflict("Residents must move before Residence is removed.");
  if (!nextClasses.includes("workplace") && (venue.workerIds?.length ?? 0))
    throw conflict("Workers must be unassigned before Workplace is removed.");
  validateLayoutZones(
    venue,
    [
      ...(baseZones ??
        venueZones(venue).filter(
          (zone) => !zone.upgradeId && zone.kind !== "exterior" && nextClasses.includes(zone.venueClass),
        )),
      ...(improvement?.zones ?? []),
      ...survivingUpgradeZones,
    ],
    nextClasses,
    state,
  );
  const nextCapacity = capacity ?? venue.residenceCapacity ?? 1;
  const upgrades = [...(venue.improvements ?? [null, null])];
  if (slot !== undefined) upgrades[slot] = improvement ?? null;
  if (
    venueResidentIds(venue).length + Number(venue.occupancy.playerHome) >
    Math.min(4, nextCapacity + upgrades.reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0))
  )
    throw conflict("The finished Residence needs room for its current residents.");
  if (
    improvement?.spaceId &&
    !venueZones(venue).some((zone) => zone.id === improvement.spaceId) &&
    !nextClasses.includes(improvement.spaceId as VillageVenueClass)
  )
    throw badRequest("The Upgrade must belong to one of this Venue's Classes.");
  const affectedIds = [
    ...new Set([
      ...venueResidentIds(venue),
      ...(venue.workerIds ?? []),
      ...venueZones(venue).flatMap((zone) => zone.controllerIds ?? []),
      ...(baseZones ?? []).flatMap((zone) => zone.controllerIds ?? []),
      ...(improvement?.zones ?? []).flatMap((zone) => zone.controllerIds ?? []),
    ]),
  ].filter((id) => id !== "player");
  const at = new Date().toISOString();
  const project: VillageProject = {
    id: randomUUID(),
    kind: "renovation",
    title,
    venueId,
    participantIds: [],
    progress: 0,
    status: "active",
    updatedAt: at,
    lifecycle: lifecycle(
      affectedIds.length ? "approval" : "builder",
      venueId,
      {
        ...(classes ? { classes: classes as VillageVenueClass[] } : {}),
        ...(capacity !== undefined ? { capacity } : {}),
        ...(baseZones !== undefined ? { baseZones } : {}),
        ...(homeKind !== undefined ? { homeKind: homeKind as NonNullable<VillageVenue["occupancy"]["homeKind"]> } : {}),
        ...(slot !== undefined ? { slot } : {}),
        ...(improvement !== undefined ? { improvement } : {}),
        detail,
      },
      affectedIds,
    ),
  };
  state.projects.push(project);
  createProjectProgress(state, project, at);
  return project;
}

export function renovationTerms(change: NonNullable<VillageProjectLifecycle["change"]>): string {
  return [
    change.detail,
    change.classes ? "Base Classes: " + change.classes.join(", ") : "",
    change.capacity !== undefined ? "Residence capacity: " + change.capacity : "",
    change.baseZones
      ? "Base zones: " +
        change.baseZones
          .map(
            (zone) =>
              `${zone.name} (${zone.kind}, ${zone.venueClass})${zone.ownerId ? " assigned to " + zone.ownerId : ""}: ${zone.description || zone.purpose || ""}`,
          )
          .join("; ")
      : "",
    change.homeKind ? "Home tier: " + change.homeKind : "",
    change.slot !== undefined ? "Upgrade slot " + (change.slot + 1) : "",
    change.improvement === null
      ? "Remove the existing Upgrade and archive its zones."
      : change.improvement
        ? [
            change.improvement.title + ": " + change.improvement.description,
            "Contributed Class: " + (change.improvement.classContribution ?? "none"),
            "Extra beds: " + change.improvement.extraBeds,
            change.improvement.spaceId ? "Modify existing zone: " + change.improvement.spaceId : "",
            ...(change.improvement.zones ?? []).map(
              (zone) =>
                zone.name + " [" + zone.id + "; " + zone.kind + "; " + zone.venueClass + "]: " + zone.description,
            ),
          ]
            .filter(Boolean)
            .join("\n")
        : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function requestProjectMailbox(id: string): Promise<void> {
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
    project.lifecycle.phase =
      state.progressEngineVersion === 1
        ? (projectProgressPhase(state, project) as VillageProjectLifecycle["phase"])
        : project.lifecycle.completedAt
          ? "finishing"
          : "builder";
  project.updatedAt = at;
}

export async function lockProjectBuilder(id: string, value: unknown): Promise<void> {
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
    if (state.progressEngineVersion === 1 && switched && flow.phase !== "builder") {
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
      const revising = state.progressEngineVersion === 1 && projectProgressPhase(state, project) !== "builder";
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
      if (state.progressEngineVersion === 1 && (!spoken || spoken.speakerId !== residentId))
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

export async function acceptProjectRequirements(id: string): Promise<void> {
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
    if (state.progressEngineVersion === 1) {
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
    if (state.progressEngineVersion === 1 && (!spoken || spoken.speakerId !== flow.builderId))
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

export async function deliverProjectMaterial(id: string, value: unknown): Promise<void> {
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

export async function startProjectConstruction(id: string, now = new Date()): Promise<void> {
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
          entry.id !== id && entry.lifecycle?.phase === "construction" && entry.lifecycle.builderId === flow.builderId,
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
    if (state.progressEngineVersion === 1 && projectProgressPhase(state, project) !== "construction")
      throw conflict("Verified supplies are required before work starts.");
  });
}

function finishConstruction(
  state: VillageState,
  project: VillageProject & { lifecycle: VillageProjectLifecycle },
  at: string,
): void {
  const flow = project.lifecycle;
  if (flow.phase !== "construction" || !flow.workOrder || flow.workOrder.pausedAt) return;
  const builder = state.villagers.find((entry) => entry.characterId === flow.builderId);
  if (state.progressEngineVersion !== 1) flow.phase = "finishing";
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

export async function debugCompleteProjectConstruction(id: string): Promise<void> {
  if (!villagesDebugAgentsEnabled()) throw conflict("Project debug actions are not enabled.");
  await mutateVillageState((state) => {
    const project = projectFor(state, id);
    if (project.lifecycle.phase !== "construction" || project.status !== "building")
      throw conflict("Start construction before using the debug completion action.");
    if (state.progressEngineVersion === 1 && project.lifecycle.workOrder)
      project.lifecycle.workOrder.completesAt = new Date().toISOString();
    finishConstruction(state, project, new Date().toISOString());
  });
}

function validImage(value: unknown): VillageVenueImage | null {
  const row = asRecord(value);
  const ref = asTrimmedString(row.ref),
    url = asTrimmedString(row.url),
    id = asTrimmedString(row.id);
  return /^global-gallery:[^\s]{1,200}$/u.test(ref) && url.startsWith("/") && id ? { ref, url, id } : null;
}

export async function openFinishedProject(id: string, value: unknown): Promise<void> {
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
      const newAffected = renovationAffectedIds(venue, change).filter((actorId) => !flow.affectedIds.includes(actorId));
      if (newAffected.length)
        throw conflict("The affected residents or workers changed. Renew the Renovation approvals before opening.");
    }
    const at = new Date().toISOString();
    const applyOpening = () => {
      if (project.kind === "new-venue") {
        const form = boundText(row.form, 240).trim();
        const exterior = boundText(row.exteriorDescription, MAX_VENUE_DESCRIPTION_LENGTH).trim();
        if (!form || !exterior) throw badRequest("Define the Venue form and exterior before opening it.");
        if (row.layoutVersion !== 1) throw badRequest("Choose the venue layout before opening it.");
        if (row.layoutVersion === 1) {
          const zones = readBaseVenueLayout(
            { ...row, description: exterior, presentation: { image: row.exteriorImage } },
            venue.classes ?? ["other"],
            "",
            validImage,
          );
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
    };
    const evidence = {
      id: `project:${id}:opened`,
      kind: "project-opening",
      at,
      sourceId: project.venueId,
      venueId: project.venueId,
    };
    if (state.progressEngineVersion === 1) recordProjectProgress(state, project, "opened", evidence, "", applyOpening);
    else applyOpening();
  });
  outsideVenueOperation(() => {
    void preparePrivateSpaces().catch(() => {});
  });
}

export function reconcileProjectLifecycles(state: VillageState, now: Date): void {
  for (const entry of state.projects) {
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
    if (flow.workOrder && !flow.workOrder.pausedAt && Date.parse(flow.workOrder.completesAt) <= now.getTime())
      finishConstruction(state, project, flow.workOrder.completesAt);
  }
}

type SpokenProjectLine = { id: string; speakerId: string; content: string };

const projectReferenceStopWords = new Set(["building", "project", "village", "resident", "people", "outside"]);

function namesProjectInBuilderRequest(project: VillageProject, playerMessage: string): boolean {
  const message = playerMessage.toLocaleLowerCase();
  if (message.includes(project.title.toLocaleLowerCase())) return true;
  // A player may call an Observation Post a lookout. A shared, distinctive
  // phrase from the venue description still ties that request to the project.
  const description = project.venueDraft?.description ?? "";
  const words = description.toLocaleLowerCase().match(/\p{L}+/gu) ?? [];
  return words.some((word, index) => {
    const next = words[index + 1];
    return (
      next &&
      word.length >= 4 &&
      next.length >= 4 &&
      (word.length >= 7 || next.length >= 7) &&
      !projectReferenceStopWords.has(word) &&
      !projectReferenceStopWords.has(next) &&
      message.includes(`${word} ${next}`)
    );
  });
}

function contextualBuilderRequest(project: VillageProject, playerMessage: string): boolean {
  return (
    /\?|\b(?:want|need|please) you\b/iu.test(playerMessage) &&
    /\b(?:build|construct|renovate|put up)\b/iu.test(playerMessage) &&
    namesProjectInBuilderRequest(project, playerMessage)
  );
}

function builderCommitment(content: string, contextualRequest: boolean): boolean {
  return (
    /\b(?:i will|i'll|i can|yes|agree|count me in)\b/iu.test(content) &&
    (/\b(?:build|construct|renovat\w*|work on)\b/iu.test(content) ||
      (contextualRequest && /\b(?:i will|i'll|i can) (?:do it|take it on|handle it)\b/iu.test(content)))
  );
}

/** Read the ordinary visit's newly spoken lines once. Project progress is never inferred from narration alone. */
export async function recordProjectConversation(input: {
  submissionId: string;
  projectId?: string;
  venueId: string;
  playerMessage: string;
  lines: SpokenProjectLine[];
  context: SpokenProjectLine[];
  at: string;
}): Promise<void> {
  if (!input.lines.length || !input.playerMessage.trim()) return;
  const state = await (await import("./village-store.js")).readVillageState();
  if (state.progressEngineVersion === 1) return;
  const relevant = state.projects.filter(
    (project) =>
      project.lifecycle &&
      (!input.projectId || project.id === input.projectId) &&
      ["approval", "builder", "requirements", "materials"].includes(project.lifecycle.phase),
  );
  if (!relevant.length) return;
  const participants = new Set(state.villagers.map((entry) => entry.characterId));
  const usable = input.lines.filter((line) => participants.has(line.speakerId));
  if (!usable.length) return;
  // Keep a narrow local path for direct answers such as "I'll do it". A model
  // review can miss these when the player uses a nickname for the Project.
  const contextualProjects = relevant.filter(
    (project) => project.lifecycle?.phase === "builder" && contextualBuilderRequest(project, input.playerMessage),
  );
  if (contextualProjects.length === 1) {
    const offer = usable.find(
      (line) =>
        !/\b(?:not|never|don't|can't|won't|refuse)\b/iu.test(line.content) && builderCommitment(line.content, true),
    );
    if (offer) {
      await mutateVillageState((current) => {
        const project = current.projects.find((entry) => entry.id === contextualProjects[0]!.id);
        const flow = project?.lifecycle;
        if (!flow || flow.phase !== "builder" || flow.evidenceIds.includes(offer.id)) return;
        if (!current.villagers.some((resident) => resident.characterId === offer.speakerId)) return;
        if (!flow.candidates.some((row) => row.residentId === offer.speakerId))
          flow.candidates.push({ residentId: offer.speakerId, evidenceId: offer.id, at: input.at });
        flow.evidenceIds.push(offer.id);
        project.updatedAt = input.at;
      });
    }
  }
  try {
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const messages: CapabilityLanguageModelMessage[] = [
      {
        role: "system",
        content: [
          "Identify explicit Project events in the NEW spoken lines only. Do not infer an agreement, handoff, or requirement from narration or the player's words. Reply JSON only.",
          'Shape: {"events":[{"projectId":"exact id","kind":"builder-agreement|approval|requirements|supply","residentId":"exact speaker id","lineId":"exact new line id","quote":"exact excerpt of that line","items":[{"category":"structure|equipment|finish","title":"specific item or not needed","needed":true}]}]}.',
          "Use builder-agreement only for a clear, willing agreement to build the Project the player asked about. A short answer such as 'I'll do it' can be an agreement when the player's request unambiguously identifies the Project. Use approval only for clear consent to the named Renovation. Use requirements only when the assigned builder states a concrete plan covering all three categories; they may explicitly say a category is not needed. Use supply only for an explicit handoff of a named listed item to the player. Return an empty list when uncertain.",
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify({
          projects: relevant.map((project) => ({
            id: project.id,
            title: project.title,
            description: project.lifecycle?.change
              ? renovationTerms(project.lifecycle.change)
              : (project.venueDraft?.description ?? ""),
            kind: project.kind,
            phase: project.lifecycle!.phase,
            venueName: state.venues.find((venue) => venue.id === project.venueId)?.name,
            builderId: project.lifecycle!.builderId,
            affectedIds: project.lifecycle!.affectedIds,
            requirements: project
              .lifecycle!.requirements.filter((entry) => entry.needed && !entry.carriedAt)
              .map((entry) => ({ id: entry.id, title: entry.title })),
          })),
          currentVenueId: input.venueId,
          playerMessage: input.playerMessage,
          recentContext: input.context.slice(-8),
          newSpokenLines: usable,
        }),
      },
    ];
    const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 1400, 1400) });
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 1400, {
      temperature: 0,
      debugMode: false,
    });
    const payload = extractJsonObject(completion.content ?? "");
    const events = Array.isArray(payload?.events) ? payload.events.slice(0, 8) : [];
    if (!events.length) return;
    await mutateVillageState((current) => {
      for (const raw of events) {
        const event = asRecord(raw);
        const project = current.projects.find((row) => row.id === event.projectId && row.lifecycle);
        if (!project?.lifecycle) continue;
        const flow = project.lifecycle;
        const line = usable.find((row) => row.id === event.lineId && row.speakerId === event.residentId);
        const quote = asTrimmedString(event.quote);
        if (
          !line ||
          !quote ||
          !line.content.toLocaleLowerCase().includes(quote.toLocaleLowerCase()) ||
          flow.evidenceIds.includes(line.id)
        )
          continue;
        const content = line.content.toLocaleLowerCase();
        const refusing = /\b(?:not|never|don't|can't|won't|refuse)\b/iu.test(content);
        const named = [project.title, current.venues.find((venue) => venue.id === project.venueId)?.name]
          .filter((item): item is string => Boolean(item))
          .some((item) =>
            `${input.playerMessage} ${line.content}`.toLocaleLowerCase().includes(item.toLocaleLowerCase()),
          );
        const contextualRequest = contextualProjects.length === 1 && contextualProjects[0]!.id === project.id;
        if (!named && !(event.kind === "builder-agreement" && contextualRequest)) continue;
        const at = input.at;
        if (
          event.kind === "approval" &&
          flow.phase === "approval" &&
          project.kind === "renovation" &&
          flow.affectedIds.includes(line.speakerId) &&
          !refusing &&
          /\b(?:yes|agree|approve|fine|okay|can|may)\b/iu.test(content)
        ) {
          if (!flow.approvals.some((row) => row.residentId === line.speakerId))
            flow.approvals.push({ residentId: line.speakerId, source: "conversation", evidenceId: line.id, at });
          if (flow.affectedIds.every((id) => flow.approvals.some((row) => row.residentId === id)))
            flow.phase = flow.completedAt ? "finishing" : "builder";
        } else if (
          event.kind === "builder-agreement" &&
          flow.phase === "builder" &&
          !refusing &&
          builderCommitment(content, contextualRequest)
        ) {
          if (!flow.candidates.some((row) => row.residentId === line.speakerId))
            flow.candidates.push({ residentId: line.speakerId, evidenceId: line.id, at });
        } else if (
          event.kind === "requirements" &&
          flow.phase === "requirements" &&
          line.speakerId === flow.builderId &&
          Array.isArray(event.items)
        ) {
          const items = event.items.slice(0, 12).flatMap((item) => {
            const row = asRecord(item);
            const category = row.category as Category;
            const title = boundText(row.title, MAX_VENUE_NAME_LENGTH).trim();
            return categories.includes(category) && title
              ? [{ id: randomUUID(), category, title, needed: row.needed !== false, carriedAt: "", deliveredAt: "" }]
              : [];
          });
          if (!categories.every((category) => items.some((row) => row.category === category))) continue;
          if (items.some((item) => item.needed && !content.includes(item.title.toLocaleLowerCase()))) continue;
          if (items.some((item) => !item.needed && !/\b(?:not needed|unnecessary|none|no need)\b/iu.test(content)))
            continue;
          flow.requirements = items;
          flow.requirementsEvidenceId = line.id;
        } else if (
          event.kind === "supply" &&
          flow.phase === "materials" &&
          /\b(?:give|hand|bring|provide|deliver|take|here is|here are)\b/iu.test(content)
        ) {
          const item = flow.requirements.find(
            (row) => row.needed && !row.carriedAt && content.includes(row.title.toLocaleLowerCase()),
          );
          if (!item) continue;
          item.carriedAt = at;
        } else continue;
        flow.evidenceIds.push(line.id);
        project.updatedAt = at;
      }
    });
  } catch (error) {
    villagesLogger().warn("[villages] Project conversation review will not block the visit: %s", String(error));
  }
}

/** Material proposal revisions invalidate approval, builder, and checklist evidence. */
export async function reviseRenovationProject(id: string, value: unknown): Promise<void> {
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

function renovationAffectedIds(venue: VillageVenue, change?: VillageProjectLifecycle["change"]): string[] {
  return [
    ...new Set([
      ...venueResidentIds(venue),
      ...(venue.workerIds ?? []),
      ...venueZones(venue).flatMap((zone) => zone.controllerIds ?? []),
      ...(change?.baseZones ?? []).flatMap((zone) => zone.controllerIds ?? []),
      ...(change?.improvement?.zones ?? []).flatMap((zone) => zone.controllerIds ?? []),
    ]),
  ].filter((id) => id !== "player");
}

export async function renewRenovationApprovals(id: string): Promise<void> {
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
