import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest, conflict, notFound, VillagesRequestError } from "./errors.js";
import { type ProgressEvidence, rejectProgressEvidence } from "./progress-engine.js";
import { validateProjectSpeech } from "./project-interpretation.js";
import { progressProject, projectProgressPhase, recordProjectProgress } from "./project-progress.js";
import { sceneQueries } from "./scene-queries.js";
import type { VillageProject, VillageState } from "./types.js";
import { sceneAccessContext } from "./venue-contact.js";
import { canOccupyZone, resolveVenueZone, zoneClosed } from "./venue-zones.js";
import { mutateVillageState, readVillageState } from "./village-store.js";

const readProjectTurnEvidence: typeof import("./venue-session.js").readProjectTurnEvidence = (...args) =>
  sceneQueries().readProjectTurnEvidence(...args);
const activeVenueSession: typeof import("./venue-session.js").activeVenueSession = () =>
  sceneQueries().activeVenueSession();

const negative = /\b(?:not|never|don't|can't|won't|refuse|maybe|perhaps|if)\b/iu;
const offerVerb =
  /\b(?:i have|we have|i've got|we've got|i can supply|we can supply|i can bring|we can bring|i can provide|we can provide)\b/iu;
const handoffVerb =
  /\b(?:here is|here are|here's|i give you|i hand you|i hand over|i'm giving you|you may take|you can take)\b/iu;
const agreementVerb = /\b(?:yes|i agree|i approve|i will|i'll|i can|count me in)\b/iu;
class ProjectEvidenceRejected extends VillagesRequestError {
  constructor(reason: string) {
    super(409, reason);
  }
}

function projectFor(state: VillageState, projectId: string): VillageProject {
  const project = state.projects.find((entry) => entry.id === projectId && entry.lifecycle);
  if (!project?.lifecycle) throw notFound("That Project is unavailable.");

  progressProject(state, project);
  if (projectProgressPhase(state, project) !== project.lifecycle.phase)
    throw conflict("Project phase and verified progress disagree. Check DEBUG: Progress before continuing.");
  return project;
}

function rejected(
  state: VillageState,
  project: VillageProject,
  requirementId: string,
  evidence: ProgressEvidence,
  reason: string,
): string {
  const task = progressProject(state, project)!;
  const phase = task.definition.phases[task.phaseIndex];
  rejectProgressEvidence(task, phase?.id ?? "unknown", requirementId, "record", evidence, reason);
  return reason;
}

function parseChecklist(content: string) {
  const found = new Map<"structure" | "equipment" | "finish", { title: string; needed: boolean }>();
  for (const part of content.split(/[;\n]/u)) {
    const match = part
      .trim()
      .match(/\b(?:the\s+)?(structure|equipment|finish(?:ing)?)(?:\s+(?:materials|supplies))?\s*:\s*(.+)$/iu);
    if (!match) continue;
    const category = match[1]!.toLocaleLowerCase().startsWith("finish")
      ? "finish"
      : (match[1]!.toLocaleLowerCase() as "structure" | "equipment");
    const title = match[2]!.trim().replace(/[.!]+$/u, "");
    if (!title || title.length > 100 || found.has(category)) return null;
    found.set(category, { title, needed: !/^(?:none|not needed|unnecessary|no need)$/iu.test(title) });
  }
  if (found.size !== 3) return null;
  return (["structure", "equipment", "finish"] as const).map((category) => ({ category, ...found.get(category)! }));
}

function sourceClaimKey(venueId: string, residentId: string, itemName: string): string {
  return [venueId, residentId, itemName.trim().toLocaleLowerCase()].join("\u0000");
}

/** The player points to one exact saved spoken line. Validation is local and never asks a judge model. */
export async function recordProjectSpokenEvidence(projectId: string, value: unknown): Promise<void> {
  const input = asRecord(value);
  const kind = input.kind;
  if (kind !== "approval" && kind !== "builder" && kind !== "requirements" && kind !== "offer" && kind !== "handoff")
    throw badRequest("Choose a Project evidence kind.");
  const sessionId = asTrimmedString(input.sessionId);
  const submissionId = asTrimmedString(input.submissionId);
  const lineId = asTrimmedString(input.lineId);
  const requirementId = asTrimmedString(input.requirementId);
  let turn: Awaited<ReturnType<typeof readProjectTurnEvidence>>;
  try {
    turn = await readProjectTurnEvidence(sessionId, submissionId);
  } catch (error) {
    await mutateVillageState((state) => {
      const project = state.projects.find((entry) => entry.id === projectId);
      const task = project && progressProject(state, project);
      const phase = task?.definition.phases[task.phaseIndex];
      if (task)
        rejectProgressEvidence(
          task,
          phase?.id ?? "unknown",
          requirementId || String(kind),
          "record",
          {
            id: `unavailable:${sessionId}:${submissionId}:${lineId}`,
            kind: "unavailable",
            at: new Date().toISOString(),
            sourceId: lineId || submissionId || sessionId,
          },
          "The selected saved visit or turn is unavailable.",
          "unavailable",
        );
    });
    throw error;
  }
  const line = turn.lines.find((entry) => entry.id === lineId);
  // Only persisted proposals can be selected. A request cannot submit its own interpretation.
  const interpreted = Number.isInteger(input.interpretationIndex)
    ? turn.projectSpeech[Number(input.interpretationIndex)]
    : undefined;
  const proof: ProgressEvidence = {
    id: `visit:${sessionId}:${submissionId}:${lineId}`,
    kind: `project-${kind}`,
    at: turn.at,
    sourceId: lineId,
    lineId,
    speakerId: line?.speakerId,
    venueId: turn.venueId,
    zoneId: turn.zoneId,
    area: turn.areaAtTurn,
    excerpt: line?.content,
    ...(interpreted
      ? { grade: "cited-interpretation" as const, interpretationVersion: 1, citations: interpreted.citations }
      : {}),
  };
  let failure = "";
  await mutateVillageState((state) => {
    failure = "";
    const project = projectFor(state, projectId);
    const flow = project.lifecycle!;
    if (flow.spokenProofs.some((entry) => entry.lineId === lineId)) return;
    if (
      state.progressTasks.some(
        (task) =>
          task.definition.owner.id === projectId &&
          task.receipts.some(
            (receipt) =>
              receipt.evidence.lineId === lineId &&
              receipt.requirementId ===
                (kind === "approval"
                  ? `approval:${line?.speakerId ?? ""}`
                  : kind === "offer"
                    ? `source:${requirementId}`
                    : kind === "handoff"
                      ? `acquired:${requirementId}`
                      : kind === "builder"
                        ? "builder-selected"
                        : "plan-accepted"),
          ),
      )
    )
      return;
    const phase = projectProgressPhase(state, project);
    const expected =
      kind === "approval"
        ? "approval"
        : kind === "builder"
          ? "builder"
          : kind === "requirements"
            ? "requirements"
            : "materials";
    const target =
      kind === "approval"
        ? `approval:${line?.speakerId ?? ""}`
        : kind === "builder"
          ? "builder-selected"
          : kind === "requirements"
            ? "plan-accepted"
            : `${kind === "offer" ? "source" : "acquired"}:${requirementId}`;
    const fail = (reason: string) => {
      failure = rejected(state, project, target, proof, reason);
    };
    if (
      phase !== expected &&
      !(
        kind === "builder" &&
        (phase === "requirements" ||
          phase === "materials" ||
          (phase === "construction" && project.status === "blocked"))
      )
    )
      return fail("This evidence is not in the current Project phase.");
    if (turn.mode !== "chat" && turn.mode !== "ask" && turn.mode !== "contact")
      return fail("Use an ordinary saved Village conversation.");
    if (line?.viaDoorway && kind === "handoff") return fail("Doorway speech cannot establish a physical handoff.");
    if (!state.venues.some((venue) => venue.id === turn.venueId))
      return fail("The saved turn must have happened in a current Village Venue.");
    if (
      !line ||
      !turn.activeIdsAtTurn.includes(line.speakerId) ||
      !state.villagers.some((resident) => resident.characterId === line.speakerId)
    )
      return fail("A current resident must have spoken that line while present in the saved turn.");
    const speech = line.content.normalize("NFKC").replace(/[’‘]/gu, "'");
    const task = progressProject(state, project)!;
    if (interpreted) {
      if (
        interpreted.projectId !== projectId ||
        interpreted.kind !== kind ||
        interpreted.speakerId !== line.speakerId ||
        interpreted.citations[0]?.lineId !== lineId ||
        interpreted.revision !== task.definition.revision ||
        interpreted.phase !== phase
      )
        return fail("Interpretation no longer matches this Project revision, phase, or speaker.");
      const reason = validateProjectSpeech(interpreted, [...turn.lines, ...turn.contextLines]);
      if (reason) return fail(reason);
    } else if (Number.isInteger(input.interpretationIndex)) return fail("The saved interpretation is unavailable.");
    const context = turn.projectContexts.find((entry) => entry.projectId === projectId);
    if (
      input.automatic === true &&
      context &&
      (context.revision !== task.definition.revision || context.phase !== phase)
    )
      return fail("The saved turn belongs to an earlier Project revision or phase.");
    const currentPhaseStartedAt = task.transitions.at(-1)?.at ?? task.definedAt;
    if (!Number.isFinite(Date.parse(turn.at)) || Date.parse(turn.at) < Date.parse(currentPhaseStartedAt))
      return fail("Use a fresh visit after this Project reached its current phase.");
    const citedIds = interpreted?.citations.map((citation) => citation.lineId) ?? [lineId];
    if (
      state.projects.some((other) =>
        other.lifecycle?.spokenProofs.some((proof) =>
          [proof.lineId, ...(proof.citations?.map((citation) => citation.lineId) ?? [])].some(
            (id) =>
              citedIds.includes(id) &&
              !(kind === "requirements" && interpreted?.contextual && other.id === projectId && id !== lineId),
          ),
        ),
      )
    )
      return fail("That spoken source was already reserved as Project proof.");
    if (!interpreted && kind !== "requirements" && negative.test(speech))
      return fail("Conditional or refusing speech is not an agreement or transfer.");
    if (
      state.progressTasks.some((task) =>
        [...task.receipts, ...task.revisionHistory.flatMap((revision) => revision.receipts)].some((receipt) =>
          [receipt.evidence.lineId, ...(receipt.evidence.citations?.map((citation) => citation.lineId) ?? [])].some(
            (id) =>
              id === lineId ||
              (interpreted?.citations.some((citation) => citation.lineId === id) &&
                !(kind === "requirements" && interpreted?.contextual && task.definition.owner.id === projectId)),
          ),
        ),
      )
    )
      return fail("That spoken line was already used as Project proof.");
    const named = `${turn.message} ${line.content}`.toLocaleLowerCase().includes(project.title.toLocaleLowerCase());
    const contextual =
      context &&
      (turn.contextLines.some(
        (entry) =>
          entry.heardBy.includes(line.speakerId) &&
          entry.content.toLocaleLowerCase().includes(project.title.toLocaleLowerCase()),
      ) ||
        (project.venueId === turn.venueId &&
          state.projects.filter(
            (entry) =>
              entry.lifecycle &&
              entry.venueId === turn.venueId &&
              entry.status !== "complete" &&
              entry.status !== "abandoned",
          ).length === 1) ||
        (kind === "requirements" &&
          flow.builderId === line.speakerId &&
          state.projects.filter(
            (entry) => entry.lifecycle?.phase === "requirements" && entry.lifecycle.builderId === line.speakerId,
          ).length === 1));
    if (!interpreted?.contextual && !named && !contextual && kind !== "offer" && kind !== "handoff")
      return fail("The saved conversation must identify this specific Project.");
    if (
      !named &&
      !interpreted?.contextual &&
      contextual &&
      state.projects.filter(
        (entry) =>
          entry.lifecycle &&
          turn.contextLines.some(
            (context) =>
              context.heardBy.includes(line.speakerId) &&
              context.content.toLocaleLowerCase().includes(entry.title.toLocaleLowerCase()),
          ),
      ).length > 1
    )
      return fail("The saved conversation ambiguously refers to more than one Project.");
    if (kind === "approval") {
      if (
        project.kind !== "renovation" ||
        !flow.affectedIds.includes(line.speakerId) ||
        (!interpreted && !agreementVerb.test(speech))
      )
        return fail("An affected resident must explicitly approve this Renovation.");
      if (flow.approvals.some((entry) => entry.residentId === line.speakerId)) return;
      flow.approvals.push({ residentId: line.speakerId, source: "conversation", evidenceId: line.id, at: turn.at });
      recordProjectProgress(state, project, `approval:${line.speakerId}`, { ...proof, kind: "project-approval" });
    } else if (kind === "builder") {
      if (
        !interpreted &&
        (!/\b(?:build|construct|renovat\w*|work on|do it|take it on|handle it)\b/iu.test(speech) ||
          !agreementVerb.test(speech))
      )
        return fail("The resident must clearly agree to build this Project.");
      const candidate = flow.candidates.find((entry) => entry.residentId === line.speakerId);
      if (candidate) {
        candidate.evidenceId = line.id;
        candidate.at = turn.at;
      } else flow.candidates.push({ residentId: line.speakerId, evidenceId: line.id, at: turn.at });
      flow.evidenceIds = [...new Set([...flow.evidenceIds, line.id])];
    } else if (kind === "requirements") {
      if (line.speakerId !== flow.builderId) return fail("The assigned Builder must state the checklist.");
      const items = interpreted?.checklist ?? parseChecklist(line.content);
      if (!items) return fail("The saved builder speech does not yet define a complete checklist.");
      flow.requirements = items.map((item, index) => ({
        id: `${project.id}:${index}:${item.category}`,
        category: item.category,
        title: item.title,
        needed: item.needed,
        carriedAt: "",
        deliveredAt: "",
      }));
      flow.requirementsEvidenceId = line.id;
      flow.evidenceIds = [...new Set([...flow.evidenceIds, line.id])];
    } else {
      const requirement = flow.requirements.find((entry) => entry.id === requirementId && entry.needed);
      if (!requirement) return fail("Choose a currently needed Project supply.");
      if (!line.content.toLocaleLowerCase().includes(requirement.title.toLocaleLowerCase()))
        return fail("The resident must name this exact supply.");
      if (kind === "offer") {
        if (!offerVerb.test(speech)) return fail("The resident must explicitly offer this finite supply.");
        if (flow.sources.some((entry) => entry.requirementId === requirementId))
          return fail("This supply already has a selected source. Revise its route before replacing it.");
        const key = sourceClaimKey(turn.venueId, line.speakerId, requirement.title);
        if (state.projectSourceClaims.some((entry) => entry.key === key))
          return fail("This resident's finite source was already transferred to another Project.");
        flow.sources.push({
          requirementId,
          kind: "resident-offer",
          venueId: turn.venueId,
          zoneId: turn.zoneId,
          itemName: requirement.title,
          supplierId: line.speakerId,
          evidenceId: line.id,
          at: turn.at,
          acquiredAt: "",
        });
        recordProjectProgress(
          state,
          project,
          `source:${requirementId}`,
          { ...proof, kind: "project-source" },
          "resident-offer",
        );
      } else {
        const source = flow.sources.find((entry) => entry.requirementId === requirementId);
        if (
          !source ||
          source.venueId !== turn.venueId ||
          (source.zoneId && source.zoneId !== turn.zoneId) ||
          source.acquiredAt
        )
          return fail("Record an available source at this venue before its handoff.");
        if (!handoffVerb.test(speech)) return fail("The resident must explicitly hand over the named supply.");
        if (source.kind === "resident-offer") {
          if (source.supplierId !== line.speakerId || Date.parse(turn.at) < Date.parse(source.at))
            return fail("The original supplier must hand over the offered item after the offer.");
          const key = sourceClaimKey(source.venueId, source.supplierId, source.itemName);
          if (state.projectSourceClaims.some((entry) => entry.key === key))
            return fail("That finite supply was already transferred.");
          state.projectSourceClaims.push({ key, projectId, sourceId: source.evidenceId, submissionId });
        } else {
          const venue = state.venues.find((entry) => entry.id === source.venueId);
          const recorded = flow.recordedItems.find(
            (item) =>
              item.venueId === source.venueId &&
              item.itemName === source.itemName &&
              (!source.zoneId || item.zoneId === source.zoneId),
          );
          const zone = venue && resolveVenueZone(venue, source.zoneId ?? recorded?.zoneId ?? "");
          if (
            !venue ||
            !recorded ||
            (zone ? !zone.state.items.includes(source.itemName) : !venue.state.furniture.includes(source.itemName))
          )
            return fail("The recorded physical item is no longer available here.");
          if (zone) {
            zone.state.items = zone.state.items.filter((item) => item !== source.itemName);
            zone.state.updatedAt = turn.at;
          } else venue.state.furniture = venue.state.furniture.filter((item) => item !== source.itemName);
        }
        source.acquiredAt = turn.at;
        requirement.carriedAt = turn.at;
        recordProjectProgress(state, project, `acquired:${requirementId}`, { ...proof, kind: "project-handoff" });
      }
    }
    if (!flow.spokenProofs.some((entry) => entry.lineId === line.id))
      flow.spokenProofs.push({
        lineId: line.id,
        sessionId,
        submissionId,
        speakerId: line.speakerId,
        venueId: turn.venueId,
        zoneId: turn.zoneId,
        quote: line.content.slice(0, 300),
        at: turn.at,
        ...(interpreted
          ? { grade: "cited-interpretation" as const, interpretationVersion: 1, citations: interpreted.citations }
          : {}),
      });
    project.updatedAt = turn.at;
  });
  if (failure) throw new ProjectEvidenceRejected(failure);
}

/** Automatic saved-turn processing. Expected evidence rejections are diagnostics, not replay failures. */
export async function processProjectSpeechTurn(sessionId: string, submissionId: string): Promise<void> {
  const turn = await readProjectTurnEvidence(sessionId, submissionId);
  if (turn.mode !== "chat" && turn.mode !== "ask" && turn.mode !== "contact") return;
  const tryRecord = async (projectId: string, input: Record<string, unknown>) => {
    try {
      await recordProjectSpokenEvidence(projectId, { ...input, sessionId, submissionId, automatic: true });
    } catch (error) {
      if (
        !(error instanceof ProjectEvidenceRejected) &&
        !(error instanceof VillagesRequestError && error.statusCode === 404)
      )
        throw error;
    }
  };
  for (const [interpretationIndex, proposal] of turn.projectSpeech.entries())
    await tryRecord(proposal.projectId, {
      kind: proposal.kind,
      lineId: proposal.citations[0]?.lineId ?? "",
      interpretationIndex,
    });
  const state = await readVillageState();

  const projects = state.projects.filter(
    (entry) => entry.lifecycle && entry.status !== "complete" && entry.status !== "abandoned",
  );
  for (const project of projects) {
    const flow = project.lifecycle!;
    for (const line of turn.lines) {
      if (line.kind === "narration" || !line.speakerId) continue;
      const speech = line.content.normalize("NFKC").replace(/[’‘]/gu, "'");
      if (
        flow.spokenProofs.some(
          (proof) => proof.lineId === line.id || proof.citations?.some((citation) => citation.lineId === line.id),
        )
      )
        continue;
      const input = { lineId: line.id };
      const context =
        turn.projectContexts.some((entry) => entry.projectId === project.id) ||
        `${turn.message} ${line.content}`.toLocaleLowerCase().includes(project.title.toLocaleLowerCase());
      if (
        !turn.contextualInterpretation &&
        context &&
        flow.phase === "approval" &&
        flow.affectedIds.includes(line.speakerId) &&
        (/\b(?:i approve|i agree|you have my permission)\b/iu.test(speech) ||
          (/\b(?:approve|permission|consent|agree|okay with)\b/iu.test(turn.message) &&
            /\b(?:yes|okay|fine)\b/iu.test(speech)))
      )
        await tryRecord(project.id, { ...input, kind: "approval" });
      else if (
        !turn.contextualInterpretation &&
        context &&
        flow.phase === "requirements" &&
        line.speakerId === flow.builderId &&
        /\b(?:structure|equipment|finish)\s*:/iu.test(speech)
      )
        await tryRecord(project.id, { ...input, kind: "requirements" });
      else if (
        !turn.contextualInterpretation &&
        context &&
        ["builder", "requirements", "materials", "construction"].includes(flow.phase) &&
        /\b(?:build|construct|renovat\w*|work on|do it|take it on|handle it)\b/iu.test(speech) &&
        /\b(?:i will|i'll|i agree to|count me in)\b/iu.test(speech)
      )
        await tryRecord(project.id, { ...input, kind: "builder" });
      if (flow.phase !== "materials") continue;
      for (const requirement of flow.requirements.filter((entry) => entry.needed && !entry.carriedAt)) {
        if (!line.content.toLocaleLowerCase().includes(requirement.title.toLocaleLowerCase())) continue;
        const ambiguous = projects.some(
          (other) =>
            other.id !== project.id &&
            other.lifecycle?.phase === "materials" &&
            other.lifecycle.requirements.some(
              (entry) =>
                entry.needed &&
                !entry.carriedAt &&
                entry.title.toLocaleLowerCase() === requirement.title.toLocaleLowerCase(),
            ),
        );
        if (ambiguous && !context) continue;
        const source = (await readVillageState()).projects
          .find((entry) => entry.id === project.id)
          ?.lifecycle?.sources.find((entry) => entry.requirementId === requirement.id);
        if (!source && offerVerb.test(speech))
          await tryRecord(project.id, { ...input, kind: "offer", requirementId: requirement.id });
        else if (source && handoffVerb.test(speech))
          await tryRecord(project.id, { ...input, kind: "handoff", requirementId: requirement.id });
      }
    }
  }
}

export async function recordExistingProjectSource(projectId: string, value: unknown): Promise<void> {
  const input = asRecord(value);
  const requirementId = asTrimmedString(input.requirementId);
  const venueId = asTrimmedString(input.venueId);
  const zoneId = asTrimmedString(input.zoneId);
  const scene = await activeVenueSession();
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    const flow = project.lifecycle!;
    if (projectProgressPhase(state, project) !== "materials")
      throw conflict("This Project is not preparing materials.");
    const requirement = flow.requirements.find((entry) => entry.id === requirementId && entry.needed);
    const venue = state.venues.find((entry) => entry.id === venueId && entry.constructionStatus !== "worksite");
    const recorded = flow.recordedItems.find(
      (item) => item.venueId === venueId && item.itemName === requirement?.title && (!zoneId || item.zoneId === zoneId),
    );
    const zone = venue && resolveVenueZone(venue, zoneId || recorded?.zoneId || "");
    if (
      !requirement ||
      !venue ||
      !recorded ||
      (zone ? !zone.state.items.includes(requirement.title) : !venue.state.furniture.includes(requirement.title))
    )
      throw conflict("Choose a matching physical item recorded when the Builder's plan was accepted.");
    if (
      zone &&
      ((!zone.seen && zone.kind !== "exterior" && !(venue.occupancy.playerHome && zone.kind === "shared-residence")) ||
        !canOccupyZone(venue, zone, "player", {
          ...(scene?.placeId === venue.id ? sceneAccessContext(scene, state) : {}),
          relationships: state.relationshipContext,
        }) ||
        zoneClosed(state, venue, zone))
    )
      throw conflict("This supply is in a restricted or closed zone. Obtain an evidenced handoff from its controller.");
    if (flow.sources.some((entry) => entry.requirementId === requirementId))
      throw conflict("This supply already has a selected source.");
    const at = new Date().toISOString();
    const evidenceId = `recorded:${project.id}:${requirementId}:${venue.id}:${zone?.id ?? "legacy"}:${requirement.title}`;
    flow.sources.push({
      requirementId,
      kind: "existing-item",
      venueId: venue.id,
      zoneId: zone?.id,
      itemName: requirement.title,
      supplierId: "",
      evidenceId,
      at,
      acquiredAt: "",
    });
    recordProjectProgress(
      state,
      project,
      `source:${requirementId}`,
      {
        id: evidenceId,
        kind: "project-source",
        at,
        sourceId: evidenceId,
        venueId: venue.id,
        excerpt: `${requirement.title} was recorded at ${venue.name} when the plan was accepted.`,
      },
      "recorded-item",
    );
  });
}

/** Explicitly commit a previously acquired physical supply to the revised checklist. */
export async function reallocateHeldProjectSupply(projectId: string, value: unknown): Promise<void> {
  const input = asRecord(value);
  const requirementId = asTrimmedString(input.requirementId);
  const heldId = asTrimmedString(input.heldId);
  await mutateVillageState((state) => {
    const project = projectFor(state, projectId);
    const flow = project.lifecycle!;
    if (projectProgressPhase(state, project) !== "materials")
      throw conflict("This Project is not preparing materials.");
    const requirement = flow.requirements.find((entry) => entry.id === requirementId && entry.needed);
    const held = flow.heldSupplies.find((entry) => entry.id === heldId && !entry.assignedRequirementId);
    if (!requirement || !held || held.itemName.toLocaleLowerCase() !== requirement.title.toLocaleLowerCase())
      throw conflict("Choose a matching, uncommitted supply acquired before this revision.");
    if (flow.sources.some((entry) => entry.requirementId === requirementId))
      throw conflict("This requirement already has a source.");
    const at = new Date().toISOString();
    const sourceId = `reallocated:${projectId}:${requirementId}:${held.id}`;
    held.assignedRequirementId = requirementId;
    flow.sources.push({
      requirementId,
      kind: "held-supply",
      venueId: project.venueId,
      itemName: held.itemName,
      supplierId: "",
      evidenceId: sourceId,
      at,
      acquiredAt: at,
    });
    requirement.carriedAt = at;
    requirement.deliveredAt = held.deliveredAt ? at : "";
    recordProjectProgress(
      state,
      project,
      `source:${requirementId}`,
      {
        id: `${sourceId}:source`,
        kind: "project-source",
        at,
        sourceId,
        venueId: project.venueId,
        excerpt: `${held.itemName} was acquired at ${held.acquiredAt} and committed to this revised plan.`,
      },
      "held-supply",
    );
    recordProjectProgress(
      state,
      project,
      `acquired:${requirementId}`,
      {
        id: `${sourceId}:acquired`,
        kind: "project-reallocation",
        at,
        sourceId: held.id,
        venueId: project.venueId,
        excerpt: `${held.itemName} remains in Project custody.`,
      },
      "reallocate",
    );
    if (held.deliveredAt)
      recordProjectProgress(state, project, `delivered:${requirementId}`, {
        id: `${sourceId}:delivered`,
        kind: "project-delivery",
        at,
        sourceId: held.id,
        venueId: project.venueId,
        excerpt: `${held.itemName} was already delivered at ${held.deliveredAt}.`,
      });
  });
}

export async function listProjectEvidenceCandidates(projectId: string) {
  const state = await readVillageState();
  projectFor(state, projectId);
  const { listVenueVisits, activeVenueSession } = sceneQueries();
  const active = await activeVenueSession();
  const visits = [...(active ? [active] : []), ...(await listVenueVisits()).slice(0, 20)];
  return visits
    .flatMap((visit) =>
      visit.submissions.flatMap((submission) => {
        if ((submission.mode !== "chat" && submission.mode !== "ask") || !submission.at) return [];
        const lines = visit.lines.filter((line) =>
          submission.replyLineIds?.length
            ? submission.replyLineIds.includes(line.id) && submission.activeIdsAtTurn?.includes(line.speakerId)
            : line.at === submission.at && visit.participants.some((person) => person.characterId === line.speakerId),
        );
        return lines.map((line) => ({
          sessionId: visit.id,
          submissionId: submission.id,
          lineId: line.id,
          residentId: line.speakerId,
          residentName: line.name,
          venueId: visit.placeId,
          venueName: visit.placeName,
          at: submission.at,
          playerMessage: submission.message,
          quote: line.content,
        }));
      }),
    )
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 80);
}
