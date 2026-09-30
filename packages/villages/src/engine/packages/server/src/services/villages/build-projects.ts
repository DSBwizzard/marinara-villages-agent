import { venueZones, resolveVenueZone, legacyZoneId } from "./venue-zones.js";
import { randomUUID } from "node:crypto";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest, conflict, notFound } from "./errors.js";
import { readVillageLore } from "./lorebooks.js";
import {
  MAX_PLACES,
  MAX_VENUES,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  boundText,
  remapVenues,
} from "./prompt-preset.js";
import type { VillageBuildReceipt, VillageBuildSource, VillageProject, VillageState, VillageVenue } from "./types.js";
import { readVenueRequestCore } from "./venue-requests.js";
import { defaultVenueSpace } from "./venue-model.js";
import { readProjectTurnEvidence } from "./venue-session.js";
import { mutateVillageState, readVillageState } from "./village-store.js";

function requirementsFor(name: string) {
  return [
    { id: "site-permission", title: `Agreement to use a site for ${name}` },
    ...(/\bpower\s*(?:plant|station|works|house)\b/iu.test(name)
      ? [
          { id: "power-source", title: "A fitting power source" },
          { id: "distribution", title: "A way to distribute power" },
          { id: "structure", title: "Materials for the structure" },
        ]
      : [
          { id: "materials", title: "Materials for the structure" },
          { id: "equipment", title: `Functional equipment for ${name}` },
          { id: "finish", title: "Finishing supplies" },
        ]),
  ];
}

function projectFor(state: VillageState, projectId: string): VillageProject {
  const project = state.projects.find((entry) => entry.id === projectId && entry.kind === "build-venue" && entry.plan);
  if (!project?.plan || !project.venueDraft) throw notFound("That build project no longer exists.");
  return project;
}

function uniqueSubmission(state: VillageState, submissionId: string): void {
  if (!submissionId || submissionId.length > 128) throw badRequest("A unique submission ID is required.");
  if (state.projects.some((project) => project.plan?.receipts.some((receipt) => receipt.submissionId === submissionId)))
    throw conflict("That roleplay turn or action was already used by a project.");
}

function receipt(
  project: VillageProject,
  submissionId: string,
  kind: VillageBuildReceipt["kind"],
  sourceId = "",
  residentId = "",
  sourceLineId = "",
  quote = "",
  at = new Date().toISOString(),
): VillageBuildReceipt {
  const source = project.plan!.sources.find((entry) => entry.id === sourceId);
  const row: VillageBuildReceipt = {
    id: randomUUID(),
    submissionId,
    kind,
    requirementId: source?.requirementId ?? "builder",
    sourceId,
    residentId,
    sourceLineId,
    quote,
    at,
    planRevision: project.plan!.revision,
  };
  project.plan!.receipts.push(row);
  project.updatedAt = at;
  return row;
}

function usedLine(state: VillageState, lineId: string): boolean {
  return state.projects.some((project) => project.plan?.receipts.some((entry) => entry.sourceLineId === lineId));
}

function sourceKey(source: VillageBuildSource): string {
  return [source.venueId, source.supplierId, source.itemName.trim().toLocaleLowerCase()].join("\u0000");
}

function sourceAvailable(state: VillageState, source: VillageBuildSource): boolean {
  if (source.remaining < 1) return false;
  const venue = state.venues.find((entry) => entry.id === source.venueId);
  if (!venue || venue.constructionStatus === "worksite") return false;
  if (source.kind === "existing-item") return resolveVenueZone(venue, source.zoneId ?? legacyZoneId(venue, "public"))?.state.items.includes(source.itemName) ?? false;
  return (
    state.villagers.some((resident) => resident.characterId === source.supplierId) &&
    !state.projectSourceClaims.some((claim) => claim.key === sourceKey(source))
  );
}

function evidenceAfterTerms(project: VillageProject, at: string, sourceId = ""): void {
  const plan = project.plan!;
  const version = sourceId ? plan.revisions.find((entry) => entry.sourceIds.includes(sourceId)) : plan.revisions[0];
  if (!version || !Number.isFinite(Date.parse(at)) || Date.parse(at) < Date.parse(version.agreedAt))
    throw conflict("Use a fresh roleplay turn after agreeing to these project terms.");
}

function ensureCapacity(state: VillageState): void {
  const reserved = state.projects.filter(
    (project) => project.kind === "build-venue" && project.status !== "complete" && project.status !== "draft",
  ).length;
  if (state.venues.length + reserved >= MAX_PLACES || remapVenues(state.venues).length + reserved >= MAX_VENUES)
    throw conflict("There is no open venue place for another agreed project.");
}

function ensureName(state: VillageState, name: string, exceptId = ""): void {
  const key = name.toLocaleLowerCase();
  if (
    state.venues.some((venue) => venue.name.toLocaleLowerCase() === key) ||
    state.projects.some(
      (project) =>
        project.id !== exceptId &&
        project.kind === "build-venue" &&
        project.status !== "complete" &&
        project.venueDraft?.name.toLocaleLowerCase() === key,
    )
  )
    throw conflict("That venue name is already in use or reserved by a project.");
}

function nearSite(site: VillageVenue | null): { x: number; y: number } {
  const x = site?.presentation.x ?? 0.46;
  const y = site?.presentation.y ?? 0.46;
  return {
    x: Math.max(0.03, Math.min(0.97, x + (x > 0.85 ? -0.045 : 0.045))),
    y: Math.max(0.03, Math.min(0.97, y + (y > 0.85 ? -0.045 : 0.045))),
  };
}

/** An approved request is a draft of work, never a finished venue. */
export function draftBuildProject(
  state: VillageState,
  value: unknown,
  requesterCharacterId = "",
  requestId = "",
): VillageProject {
  const core = readVenueRequestCore(value);
  const raw = asRecord(value);
  const description = boundText(raw.description, MAX_VENUE_DESCRIPTION_LENGTH);
  if (!core || !description) throw badRequest("A project needs a venue name, Class, and description.");
  if (requesterCharacterId && !state.villagers.some((resident) => resident.characterId === requesterCharacterId))
    throw conflict("The requesting resident no longer lives here.");
  const existing = state.projects.find((project) => project.id === requestId && project.kind === "build-venue");
  if (existing) return existing;
  ensureName(state, core.name);
  ensureCapacity(state);
  const setting = [state.setting, ...state.worldFacts].join(" ").toLocaleLowerCase();
  const candidateSites = state.venues.filter((venue) => venue.constructionStatus !== "worksite");
  const site =
    (/\bpower\s*(?:plant|station|works|house)\b/iu.test(core.name)
      ? candidateSites.find((venue) =>
          /mill|river|stream|workshop|forge|works/iu.test(`${venue.name} ${venue.description}`),
        )
      : null) ??
    candidateSites[0] ??
    null;
  const supplier =
    state.villagers.find((resident) => resident.characterId === requesterCharacterId) ?? state.villagers[0];
  const capability = /\bpower\s*(?:plant|station|works|house)\b/iu.test(core.name)
    ? "village-wide power"
    : boundText(raw.capability, MAX_VENUE_NOTE_LENGTH);
  const requirements = requirementsFor(core.name);
  const supplyName: Record<string, string> = {
    "power-source": /river|stream|water/iu.test(setting)
      ? "waterwheel drive"
      : /wind/iu.test(setting)
        ? "wind rotor"
        : "power source",
    distribution: /rune|magic|spell/iu.test(setting) ? "warded conduits" : "distribution parts",
    structure: "building materials",
    materials: "building materials",
    equipment: "functional equipment",
    finish: "finishing supplies",
  };
  const sources: VillageBuildSource[] =
    site && supplier
      ? requirements.map((requirement) => ({
          id: randomUUID(),
          requirementId: requirement.id,
          kind: "limited-opportunity" as const,
          venueId: site.id,
          itemName:
            requirement.id === "site-permission" ? core.name : (supplyName[requirement.id] ?? requirement.title),
          supplierId: supplier.characterId,
          remaining: 1,
          cost:
            requirement.id === "site-permission"
              ? `An agreement with ${supplier.cardSnapshot.name} over this site's use`
              : `A favor owed to ${supplier.cardSnapshot.name} for ${requirement.title.toLowerCase()}`,
          prerequisite:
            requirement.id === "site-permission"
              ? `Ask ${supplier.cardSnapshot.name} at ${site.name} for permission to use the site.`
              : `Ask ${supplier.cardSnapshot.name} at ${site.name}, then recover the offered supply there.`,
          magic: false,
        }))
      : [];
  const at = new Date().toISOString();
  const project: VillageProject = {
    id: requestId || randomUUID(),
    kind: "build-venue",
    title: core.name,
    venueId: "",
    participantIds: requesterCharacterId ? [requesterCharacterId] : [],
    requesterCharacterId,
    venueDraft: {
      ...core,
      description,
      category: "",
      position: nearSite(site),
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
    },
    progress: 0,
    status: "draft",
    updatedAt: at,
    plan: {
      revision: 0,
      agreedAt: "",
      need: boundText(raw.requestQuote, MAX_VENUE_NOTE_LENGTH) || description,
      revisions: [],
      requirements: requirements.map((requirement) => ({
        id: requirement.id,
        title: requirement.title,
        routeIds: sources.filter((source) => source.requirementId === requirement.id).map((source) => source.id),
      })),
      sources,
      recordedItems: state.venues.flatMap((venue) => venueZones(venue).flatMap(zone =>
        zone.state.items
          .filter(
            (itemName) => !state.narrativeItems.some((item) => item.venueId === venue.id && (!item.zoneId || item.zoneId === zone.id) && item.itemName === itemName),
          )
          .map((itemName) => ({ venueId: venue.id, zoneId: zone.id, itemName })),
      )),
      receipts: [],
      builderId: "",
      workOrder: null,
      outcomeAt: "",
      capability,
      siteVenueId: site?.id ?? "",
      blockedReason: site && supplier ? "" : "A current source venue and resident are needed before agreement.",
    },
  };
  state.projects.push(project);
  return project;
}

export async function proposeBuildProject(value: unknown): Promise<void> {
  await mutateVillageState((state) => {
    if (!state.setupAt) throw conflict("Found the village before proposing a build project.");
    draftBuildProject(state, value);
  });
}

export async function setBuildSite(projectId: string, value: unknown): Promise<void> {
  const venueId = asTrimmedString(asRecord(value).venueId);
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    if (project.status !== "draft") throw conflict("The agreed site is fixed; a later move needs a separate project.");
    const site = state.venues.find((venue) => venue.id === venueId && venue.constructionStatus !== "worksite");
    if (!site) throw badRequest("Choose a current venue to anchor the new site.");
    project.plan!.siteVenueId = venueId;
    project.venueDraft!.position = nearSite(site);
    for (const source of project.plan!.sources.filter((entry) => entry.requirementId === "site-permission"))
      source.venueId = venueId;
    project.updatedAt = new Date().toISOString();
  });
}

/** Configure an alternative before agreement, or make an explicit new agreed revision. */
export async function addBuildSource(projectId: string, value: unknown): Promise<void> {
  const raw = asRecord(value);
  const requirementId = asTrimmedString(raw.requirementId);
  const venueId = asTrimmedString(raw.venueId);
  const supplierId = asTrimmedString(raw.supplierId);
  const itemName = boundText(raw.itemName, MAX_VENUE_NAME_LENGTH);
  const kind = raw.kind === "existing-item" ? ("existing-item" as const) : ("limited-opportunity" as const);
  const magic = raw.magic === true;
  const cost = boundText(raw.cost, MAX_VENUE_NOTE_LENGTH);
  const prerequisite = boundText(raw.prerequisite, MAX_VENUE_NOTE_LENGTH);
  const loreQuote = asTrimmedString(raw.loreQuote);
  if (!venueId || !itemName || !cost || !prerequisite)
    throw badRequest("A route needs a real place, named supply, prerequisite, and cost.");
  const village = await readVillageState();
  if (magic) {
    const lore = await readVillageLore(
      village.selectedLorebookIds,
      `${itemName} ${village.setting}`,
      undefined,
      village.loreTokenBudget,
    );
    const evidence = [village.setting, ...village.worldFacts, ...lore].join("\n").toLocaleLowerCase();
    if (loreQuote.length < 12 || !evidence.includes(loreQuote.toLocaleLowerCase()))
      throw badRequest("A magic route needs a quoted, established setting or lore fact.");
  }
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    const plan = project.plan!;
    if (project.status === "building" || project.status === "complete")
      throw conflict("Construction has already installed its committed inputs.");
    const requirement = plan.requirements.find((entry) => entry.id === requirementId);
    const venue = state.venues.find((entry) => entry.id === venueId && entry.constructionStatus !== "worksite");
    if (!requirement || !venue) throw badRequest("Choose a current project requirement and source venue.");
    const requestedZoneId = asTrimmedString(raw.zoneId);
    const zoneId = requestedZoneId || plan.recordedItems.find(item => item.venueId === venueId && item.itemName === itemName)?.zoneId || legacyZoneId(venue, "public");
    const zone = resolveVenueZone(venue, zoneId);
    if (kind === "existing-item" && !zone?.state.items.includes(itemName))
      throw conflict("That item is no longer recorded at the source venue.");
    if (
      kind === "existing-item" &&
      !plan.recordedItems.some((item) => item.venueId === venueId && item.itemName === itemName && (!item.zoneId || item.zoneId === zoneId))
    )
      throw conflict("Only an item recorded when this project began can be used as an existing source.");
    if (kind === "limited-opportunity" && !state.villagers.some((resident) => resident.characterId === supplierId))
      throw badRequest("A limited opportunity needs a current resident who can offer it.");
    if (requirementId === "site-permission" && kind === "existing-item")
      throw badRequest("Permission must come from an explicit resident agreement.");
    const supplier = state.villagers.find((resident) => resident.characterId === supplierId);
    const source: VillageBuildSource = {
      id: randomUUID(),
      requirementId,
      kind,
      venueId,
      zoneId,
      itemName,
      supplierId: kind === "existing-item" ? "" : supplierId,
      remaining: 1,
      cost:
        kind === "existing-item"
          ? `Recorded transfer of ${itemName} from ${venue.name}; ${cost}`
          : `Favor owed to ${supplier!.cardSnapshot.name}; ${cost}`,
      prerequisite,
      magic,
      loreEvidence: magic ? loreQuote : "",
    };
    if (kind === "limited-opportunity" && !sourceAvailable(state, source))
      throw conflict("That finite resident source was already transferred or is unavailable. Name another route.");
    plan.sources.push(source);
    requirement.routeIds.push(source.id);
    if (plan.agreedAt) {
      plan.revision += 1;
      plan.revisions.push({
        revision: plan.revision,
        agreedAt: new Date().toISOString(),
        sourceIds: plan.sources.map((entry) => entry.id),
      });
      // Previously acquired supplies remain acquired. Uninstalled commitments become available again.
      for (const committed of plan.receipts.filter((entry) => entry.kind === "committed")) {
        if (plan.receipts.some((entry) => entry.kind === "installed" && entry.sourceLineId === committed.id)) continue;
        if (plan.receipts.some((entry) => entry.kind === "released" && entry.sourceLineId === committed.id)) continue;
        receipt(project, `release:${committed.id}:${plan.revision}`, "released", committed.sourceId, "", committed.id);
      }
    }
    plan.blockedReason = "";
    if (project.status === "blocked") project.status = "active";
    project.updatedAt = new Date().toISOString();
  });
}

export async function agreeBuildProject(projectId: string): Promise<void> {
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    if (project.status !== "draft") return;
    ensureName(state, project.venueDraft!.name, project.id);
    ensureCapacity(state);
    if (!project.plan!.siteVenueId || !state.venues.some((venue) => venue.id === project.plan!.siteVenueId))
      throw conflict("Choose a current site before agreeing to the plan.");
    if (
      project.plan!.requirements.some(
        (requirement) =>
          !requirement.routeIds.some((id) =>
            project.plan!.sources.some((source) => source.id === id && sourceAvailable(state, source)),
          ),
      )
    )
      throw conflict("Every requirement needs at least one available, server-checkable route.");
    project.status = "active";
    project.plan!.revision = 1;
    project.plan!.agreedAt = new Date().toISOString();
    project.plan!.revisions.push({
      revision: 1,
      agreedAt: project.plan!.agreedAt,
      sourceIds: project.plan!.sources.map((entry) => entry.id),
    });
    project.plan!.blockedReason = "";
    project.updatedAt = project.plan!.agreedAt;
  });
}

function lineFor(
  evidence: Awaited<ReturnType<typeof readProjectTurnEvidence>>,
  lineId: string,
  residentId: string,
  phrase: string,
) {
  const line = evidence.lines.find((row) => row.id === lineId && row.speakerId === residentId);
  const content = line?.content.toLocaleLowerCase() ?? "";
  if (
    !line ||
    !content.includes(phrase.toLocaleLowerCase()) ||
    !/\b(i can|i will|i'll|we can|we will|we'll|yes|agreed|you may|take|use)\b/iu.test(content) ||
    /\b(?:not|never|don't|can't|won't|refuse)\b/iu.test(content)
  )
    throw conflict("Use an explicit, quoted agreement spoken by that resident in this visit.");
  return line;
}

export async function promiseBuildSource(projectId: string, value: unknown): Promise<void> {
  const raw = asRecord(value);
  const sourceId = asTrimmedString(raw.sourceId);
  const sessionId = asTrimmedString(raw.sessionId);
  const submissionId = asTrimmedString(raw.submissionId);
  const lineId = asTrimmedString(raw.lineId);
  const evidence = await readProjectTurnEvidence(sessionId, submissionId);
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    const plan = project.plan!;
    if (
      plan.receipts.some(
        (entry) => entry.submissionId === submissionId && entry.kind === "promise" && entry.sourceId === sourceId,
      )
    )
      return;
    if (project.status !== "active") throw conflict("Agree to the plan before seeking its supplies.");
    evidenceAfterTerms(project, evidence.at, sourceId);
    uniqueSubmission(state, submissionId);
    if (usedLine(state, lineId)) throw conflict("That agreement has already been used.");
    const source = plan.sources.find((entry) => entry.id === sourceId && entry.kind === "limited-opportunity");
    if (
      !source ||
      evidence.venueId !== source.venueId || (source.zoneId && source.zoneId !== evidence.zoneId) ||
      !state.villagers.some((resident) => resident.characterId === source.supplierId)
    )
      throw conflict("The supplier must agree at the recorded source place while still a resident.");
    if (plan.receipts.some((entry) => entry.kind === "promise" && entry.sourceId === sourceId))
      throw conflict("This source already has an accepted offer.");
    const line = lineFor(evidence, lineId, source.supplierId, source.itemName);
    receipt(project, submissionId, "promise", source.id, source.supplierId, line.id, line.content, evidence.at);
    if (source.requirementId === "site-permission") source.remaining = 0;
  });
}

export async function acquireBuildSource(projectId: string, value: unknown): Promise<void> {
  const raw = asRecord(value);
  const sourceId = asTrimmedString(raw.sourceId);
  const submissionId = asTrimmedString(raw.submissionId);
  const lineId = asTrimmedString(raw.lineId);
  const evidence = await readProjectTurnEvidence(asTrimmedString(raw.sessionId), submissionId);
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    const plan = project.plan!;
    if (
      plan.receipts.some(
        (entry) => entry.submissionId === submissionId && entry.kind === "acquired" && entry.sourceId === sourceId,
      )
    )
      return;
    if (project.status !== "active") throw conflict("This project is not acquiring supplies now.");
    evidenceAfterTerms(project, evidence.at, sourceId);
    uniqueSubmission(state, submissionId);
    const source = plan.sources.find((entry) => entry.id === sourceId);
    if (source?.requirementId === "site-permission")
      throw conflict("Site permission is a spoken agreement, not a material transfer.");
    if (!source || source.remaining < 1 || evidence.venueId !== source.venueId || (source.zoneId && source.zoneId !== evidence.zoneId))
      throw conflict("That finite source is unavailable at this place.");
    if (
      !source.magic &&
      /\b(?:magic\w*|conjur\w*|summon\w*|spell\w*|teleport\w*|manifest\w*)\b/iu.test(evidence.message)
    )
      throw conflict("This route has no established magic that can supply those materials.");
    if (evidence.mode !== "chat" || !evidence.message.toLocaleLowerCase().includes(source.itemName.toLocaleLowerCase()))
      throw conflict("Describe receiving this specific supply in a Chat turn at its source.");
    if (usedLine(state, lineId)) throw conflict("That spoken handoff was already used.");
    const venue = state.venues.find((entry) => entry.id === source.venueId);
    if (!venue) throw conflict("The source venue no longer exists.");
    const zone = resolveVenueZone(venue, source.zoneId ?? legacyZoneId(venue, "public"));
    const handoff = evidence.lines.find(
      (line) =>
        line.id === lineId &&
        (source.kind === "existing-item"
          ? state.villagers.some((resident) => resident.characterId === line.speakerId)
          : line.speakerId === source.supplierId) &&
        line.content.toLocaleLowerCase().includes(source.itemName.toLocaleLowerCase()) &&
        /\b(?:i (?:give|hand|provide|deliver|entrust) you|here (?:is|are)|you (?:may|can) take)\b/iu.test(
          line.content,
        ) &&
        !/\b(?:not|never|don't|can't|won't)\b/iu.test(line.content),
    );
    if (!handoff) throw conflict("A present resident must explicitly hand over this supply in the visit.");
    if (source.kind === "existing-item") {
      if (
        !zone?.state.items.includes(source.itemName) ||
        !plan.recordedItems.some((item) => item.venueId === venue.id && item.itemName === source.itemName && (!item.zoneId || item.zoneId === zone?.id))
      )
        throw conflict("The recorded item is no longer available to transfer.");
    } else if (
      !state.villagers.some((resident) => resident.characterId === source.supplierId) ||
      !plan.receipts.some((entry) => entry.kind === "promise" && entry.sourceId === sourceId)
    ) {
      throw conflict("The resident's limited source is no longer available or was not explicitly offered.");
    }
    if (source.kind === "limited-opportunity") {
      const key = sourceKey(source);
      if (state.projectSourceClaims.some((claim) => claim.key === key))
        throw conflict("This finite resident source was already transferred to a project. Negotiate an alternative.");
      state.projectSourceClaims.push({ key, projectId, sourceId, submissionId });
    } else {
      zone!.state.items = zone!.state.items.filter(item => item !== source.itemName);
      zone!.state.updatedAt = evidence.at;
    }
    source.remaining -= 1;
    receipt(project, submissionId, "acquired", sourceId, handoff.speakerId, handoff.id, source.cost, evidence.at);
    project.progress = Math.min(60, project.progress + 15);
  });
}

export async function commitBuildSupply(projectId: string, value: unknown): Promise<void> {
  const raw = asRecord(value);
  const acquiredId = asTrimmedString(raw.acquiredReceiptId);
  const submissionId = asTrimmedString(raw.submissionId);
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    const plan = project.plan!;
    if (
      plan.receipts.some(
        (entry) =>
          entry.submissionId === submissionId && entry.kind === "committed" && entry.sourceLineId === acquiredId,
      )
    )
      return;
    if (project.status !== "active") throw conflict("Only an active project may commit supplies.");
    uniqueSubmission(state, submissionId);
    const acquired = plan.receipts.find((entry) => entry.id === acquiredId && entry.kind === "acquired");
    if (!acquired) throw badRequest("Choose an acquired supply receipt.");
    if (
      plan.receipts.some(
        (entry) =>
          entry.kind === "committed" &&
          entry.sourceLineId === acquiredId &&
          !plan.receipts.some((release) => release.kind === "released" && release.sourceLineId === entry.id),
      )
    )
      throw conflict("That supply is already committed.");
    receipt(project, submissionId, "committed", acquired.sourceId, "", acquired.id);
  });
}

export async function recruitBuildWorker(projectId: string, value: unknown): Promise<void> {
  const raw = asRecord(value);
  const residentId = asTrimmedString(raw.residentId);
  const lineId = asTrimmedString(raw.lineId);
  const submissionId = asTrimmedString(raw.submissionId);
  const evidence = await readProjectTurnEvidence(asTrimmedString(raw.sessionId), submissionId);
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    if (
      project.plan!.receipts.some(
        (entry) =>
          entry.submissionId === submissionId && entry.kind === "builder-agreement" && entry.residentId === residentId,
      )
    )
      return;
    if (project.status !== "active" && project.status !== "blocked") throw conflict("That project cannot recruit now.");
    evidenceAfterTerms(project, evidence.at);
    uniqueSubmission(state, submissionId);
    if (usedLine(state, lineId) || !state.villagers.some((resident) => resident.characterId === residentId))
      throw conflict("A current resident must give a new, explicit agreement.");
    const line = lineFor(evidence, lineId, residentId, "build");
    project.plan!.builderId = residentId;
    project.participantIds = [...new Set([...project.participantIds, residentId])];
    receipt(project, submissionId, "builder-agreement", "", residentId, line.id, line.content, evidence.at);
    if (project.status === "blocked") {
      project.status = "active";
      project.plan!.blockedReason = "";
      project.plan!.workOrder = null;
    }
  });
}

function committedFor(plan: NonNullable<VillageProject["plan"]>, requirementId: string) {
  if (requirementId === "site-permission")
    return plan.receipts.find((entry) => entry.kind === "promise" && entry.requirementId === requirementId);
  return plan.receipts.find(
    (entry) =>
      entry.kind === "committed" &&
      entry.requirementId === requirementId &&
      !plan.receipts.some((release) => release.kind === "released" && release.sourceLineId === entry.id),
  );
}

export async function startBuildWork(projectId: string, now = new Date()): Promise<void> {
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    const plan = project.plan!;
    if (project.status === "building" || project.status === "complete") return;
    if (project.status !== "active") throw conflict("The project is not ready to build.");
    const builder = state.villagers.find((resident) => resident.characterId === plan.builderId);
    if (!builder?.agenda) throw conflict("The agreed builder must still live here and have an agenda.");
    if (
      state.projects.some(
        (entry) =>
          entry.id !== project.id && entry.status === "building" && entry.plan?.builderId === builder.characterId,
      )
    )
      throw conflict("That builder already has a construction shift.");
    if (plan.requirements.some((entry) => !committedFor(plan, entry.id)))
      throw conflict("Commit one acquired supply for every agreed requirement.");
    const existingShell = state.venues.find(
      (entry) =>
        entry.id === project.venueId && entry.buildProjectId === project.id && entry.constructionStatus === "worksite",
    );
    if (!existingShell && (state.venues.length >= MAX_PLACES || remapVenues(state.venues).length >= MAX_VENUES))
      throw conflict("There is no room for the worksite.");
    if (!existingShell) ensureName(state, project.venueDraft!.name, project.id);
    const draft = project.venueDraft!;
    const venueId = existingShell?.id ?? randomUUID();
    const at = now.toISOString();
    const shell: VillageVenue = {
      id: venueId,
      buildProjectId: project.id,
      constructionStatus: "worksite",
      name: draft.name,
      form: `An unfinished worksite for ${draft.name}.`,
      classes: draft.classes,
      spaces: draft.classes.map((venueClass) => defaultVenueSpace(venueClass, draft.description)),
      residenceCapacity: 1,
      residentIds: [],
      improvements: [null, null],
      description: `Construction is underway: ${draft.description}`,
      category: "",
      presentation: { image: null, x: draft.position.x, y: draft.position.y },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      workerIds: [],
      exteriorState: defaultVenueSpace("other", `The unfinished exterior of ${draft.name}.`).state,
      state: {
        condition: "under construction",
        upgrades: [],
        furniture: [],
        publicFacts: [],
        features: [],
        traces: [],
        updatedAt: at,
      },
    };
    if (!existingShell) state.venues.push(shell);
    project.venueId = venueId;
    const completesAt = new Date(now.getTime() + 4 * 60 * 60_000).toISOString();
    plan.workOrder = { startsAt: at, completesAt, pausedAt: "" };
    builder.agenda.projectWork = { projectId: project.id, venueId, startsAt: at, endsAt: completesAt };
    for (const requirement of plan.requirements) {
      if (requirement.id === "site-permission") continue;
      const committed = committedFor(plan, requirement.id)!;
      if (!plan.receipts.some((entry) => entry.kind === "installed" && entry.sourceLineId === committed.id))
        receipt(project, `install:${committed.id}`, "installed", committed.sourceId, "", committed.id, "", at);
    }
    project.status = "building";
    project.progress = 80;
    project.updatedAt = at;
  });
}

/** Called by the existing device-local reconciliation clock, including restart catch-up. */
export function reconcileBuildProjects(state: VillageState, now: Date): void {
  for (const project of state.projects) {
    if (project.kind === "build-venue" && project.status === "active" && project.plan) {
      const plan = project.plan;
      const missing = plan.requirements.find((requirement) => {
        if (
          committedFor(plan, requirement.id) ||
          plan.receipts.some((entry) => entry.kind === "acquired" && entry.requirementId === requirement.id)
        )
          return false;
        return !plan.sources.some(
          (source) => requirement.routeIds.includes(source.id) && sourceAvailable(state, source),
        );
      });
      if (missing) {
        project.status = "blocked";
        plan.blockedReason = `The source for ${missing.title} is missing. Add an alternative route.`;
      }
    }
    if (project.kind !== "build-venue" || project.status !== "building" || !project.plan?.workOrder) continue;
    const plan = project.plan;
    const venue = state.venues.find((entry) => entry.id === project.venueId && entry.buildProjectId === project.id);
    const builder = state.villagers.find((resident) => resident.characterId === plan.builderId);
    if (!venue || !builder?.agenda) {
      project.status = "blocked";
      plan.blockedReason = venue
        ? "The builder left; recruit a new resident to finish the work."
        : "The worksite is missing.";
      plan.workOrder.pausedAt = now.toISOString();
      if (builder?.agenda?.projectWork?.projectId === project.id) delete builder.agenda.projectWork;
      continue;
    }
    if (Date.parse(plan.workOrder.completesAt) > now.getTime()) continue;
    venue.constructionStatus = "complete";
    venue.form = project.venueDraft?.description ?? venue.form;
    venue.description = project.venueDraft?.description ?? venue.description;
    venue.state.condition = "complete";
    venue.state.updatedAt = plan.workOrder.completesAt;
    if (plan.capability) {
      venue.capabilities = [...new Set([...venue.capabilities, plan.capability])];
      state.villageCapabilities = [...new Set([...state.villageCapabilities, plan.capability])];
    }
    if (builder.agenda.projectWork?.projectId === project.id) delete builder.agenda.projectWork;
    project.status = "complete";
    project.progress = 100;
    project.updatedAt = plan.workOrder.completesAt;
    plan.outcomeAt = plan.workOrder.completesAt;
    plan.blockedReason = "";
  }
}
