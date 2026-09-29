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
  const slot = row.slot === undefined ? undefined : Number(row.slot);
  if (slot !== undefined && slot !== 0 && slot !== 1) throw badRequest("Choose Upgrade slot one or two.");
  const improvementRow = row.improvement === null ? null : asRecord(row.improvement);
  const improvement: VillageVenueImprovement | null | undefined =
    row.improvement === undefined
      ? undefined
      : improvementRow === null
        ? null
        : {
            id: randomUUID(),
            title: boundText(improvementRow.title, MAX_VENUE_NAME_LENGTH).trim(),
            description: boundText(improvementRow.description, MAX_VENUE_DESCRIPTION_LENGTH).trim(),
            spaceId: asTrimmedString(improvementRow.spaceId) || null,
            extraBeds: Number(improvementRow.extraBeds ?? 0),
            approvedAt: "",
          };
  if (
    !detail ||
    (classes === undefined && capacity === undefined && homeKind === undefined && slot === undefined) ||
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
  const nextClasses = (classes ?? venue.classes ?? ["other"]) as VillageVenueClass[];
  if (!nextClasses.includes("residence") && venueResidentIds(venue).length)
    throw conflict("Residents must move before Residence is removed.");
  if (!nextClasses.includes("workplace") && (venue.workerIds?.length ?? 0))
    throw conflict("Workers must be unassigned before Workplace is removed.");
  const nextCapacity = capacity ?? venue.residenceCapacity ?? 1;
  const upgrades = [...(venue.improvements ?? [null, null])];
  if (slot !== undefined) upgrades[slot] = improvement ?? null;
  if (venueResidentIds(venue).length > nextCapacity + upgrades.reduce((sum, entry) => sum + (entry?.extraBeds ?? 0), 0))
    throw conflict("The finished Residence needs room for its current residents.");
  if (improvement?.spaceId && !nextClasses.includes(improvement.spaceId as VillageVenueClass))
    throw badRequest("The Upgrade must belong to one of this Venue's Classes.");
  const affectedIds = [...new Set([...venueResidentIds(venue), ...(venue.workerIds ?? [])])];
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
        ...(homeKind !== undefined ? { homeKind } : {}),
        ...(slot !== undefined ? { slot } : {}),
        ...(improvement !== undefined ? { improvement } : {}),
        detail,
      },
      affectedIds,
    ),
  };
  state.projects.push(project);
  return project;
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
      detail: flow.change?.detail ?? "",
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
  }
  if (
    project.lifecycle.affectedIds.every((id) => project.lifecycle!.approvals.some((entry) => entry.residentId === id))
  )
    project.lifecycle.phase = "builder";
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
      flow.phase = "requirements";
      flow.requirements = [];
      flow.requirementsEvidenceId = "";
      flow.requirementsAcceptedAt = "";
      project.status = "active";
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
    flow.phase = "materials";
    project.updatedAt = flow.requirementsAcceptedAt;
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
    builder.agenda.projectWork = { projectId: id, venueId: project.venueId, startsAt: at, endsAt: completesAt };
    flow.phase = "construction";
    project.status = "building";
    project.progress = 80;
    project.updatedAt = at;
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
  if (builder?.agenda?.projectWork?.projectId === project.id) delete builder.agenda.projectWork;
  flow.phase = "finishing";
  flow.completedAt = at;
  project.status = "finishing";
  project.progress = 95;
  project.updatedAt = at;
}

export async function debugCompleteProjectConstruction(id: string): Promise<void> {
  if (!villagesDebugAgentsEnabled()) throw conflict("Project debug actions are not enabled.");
  await mutateVillageState((state) => {
    const project = projectFor(state, id);
    if (project.lifecycle.phase !== "construction" || project.status !== "building")
      throw conflict("Start construction before using the debug completion action.");
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
    const at = new Date().toISOString();
    if (project.kind === "new-venue") {
      const form = boundText(row.form, 240).trim();
      const exterior = boundText(row.exteriorDescription, MAX_VENUE_DESCRIPTION_LENGTH).trim();
      const interior = boundText(row.interiorDescription, MAX_VENUE_DESCRIPTION_LENGTH).trim();
      if (!form || !exterior || !interior)
        throw badRequest("Define the Venue form, exterior, and interior before opening it.");
      venue.form = form;
      venue.description = exterior;
      venue.presentation.image = validImage(row.exteriorImage);
      venue.spaces =
        venue.classes?.map((venueClass) => ({
          ...defaultVenueSpace(venueClass, interior),
          image: validImage(row.interiorImage),
        })) ?? [];
      venue.constructionStatus = "complete";
      venue.state.condition = "complete";
    } else {
      const change = flow.change!;
      if (change.classes) {
        venue.classes = change.classes;
        venue.spaces = change.classes.map(
          (venueClass) =>
            venue.spaces?.find((space) => space.venueClass === venueClass) ??
            defaultVenueSpace(venueClass, venue.description),
        );
      }
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
      const exterior = validImage(row.exteriorImage);
      if (exterior) venue.presentation.image = exterior;
    }
    venue.state.updatedAt = at;
    flow.phase = "complete";
    project.status = "complete";
    project.progress = 100;
    project.updatedAt = at;
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

/** Read the ordinary visit's newly spoken lines once. Project progress is never inferred from narration alone. */
export async function recordProjectConversation(input: {
  submissionId: string;
  venueId: string;
  playerMessage: string;
  lines: SpokenProjectLine[];
  context: SpokenProjectLine[];
  at: string;
}): Promise<void> {
  if (!input.lines.length || !input.playerMessage.trim()) return;
  const state = await (await import("./village-store.js")).readVillageState();
  const relevant = state.projects.filter(
    (project) =>
      project.lifecycle && ["approval", "builder", "requirements", "materials"].includes(project.lifecycle.phase),
  );
  if (!relevant.length) return;
  const participants = new Set(state.villagers.map((entry) => entry.characterId));
  const usable = input.lines.filter((line) => participants.has(line.speakerId));
  if (!usable.length) return;
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
          "Use builder-agreement only for a clear, willing agreement to build the named Project. Use approval only for clear consent to the named Renovation. Use requirements only when the assigned builder states a concrete plan covering all three categories; they may explicitly say a category is not needed. Use supply only for an explicit handoff of a named listed item to the player. Return an empty list when uncertain.",
        ].join(" "),
      },
      {
        role: "user",
        content: JSON.stringify({
          projects: relevant.map((project) => ({
            id: project.id,
            title: project.title,
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
        if (!named) continue;
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
            flow.phase = "builder";
        } else if (
          event.kind === "builder-agreement" &&
          flow.phase === "builder" &&
          !refusing &&
          /\b(?:build|construct|renovat|work on)\b/iu.test(content) &&
          /\b(?:i will|i'll|i can|yes|agree|count me in)\b/iu.test(content)
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
