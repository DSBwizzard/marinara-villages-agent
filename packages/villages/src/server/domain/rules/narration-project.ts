import type { AcceptedEpisode } from "../models/episode-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { VillageState } from "../models/world.js";
import { continuityActor } from "./continuity-actors.js";
import { establishmentControllers, establishmentScope } from "./establishment.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { findLocation, findNpc } from "./places.js";
import { beginProject, pauseProject, projectFor } from "./project-lifecycle-rules.js";
import { assertNarrationPlayerIntent } from "./narration-scene.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { approvalScope, projectDesignKey, renovationAffectedIds } from "./project-terms.js";
import { narrationPositions, narrationWitnesses, type NarrationSourceContext } from "./narration-sources.js";
import { projectSpeechTerms, type ProjectSpeechContext } from "./project-interpretation.js";

export function applyNarrationProjectStart(
  state: VillageState,
  projectId: string,
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  before: ProjectSpeechContext,
  receiptId: string,
  at: string,
): AcceptedEpisode["commandReceipts"][number] {
  assertNarrationPlayerIntent(context, sources);
  const project = projectFor(state, projectId),
    captured = readset.projects.find((row) => row.projectId === projectId);
  memoryRequire(
    captured &&
      captured.revision === project.lifecycle.revision &&
      memoryHash(before) === memoryHash(captured) &&
      memoryHash(projectSpeechTerms(state, project)) === memoryHash(captured.terms),
    "the complete current Project authority was not supplied",
  );
  const resume = project.status === "paused";
  memoryRequire(!resume || project.lifecycle.workOrder, "the paused Project has no saved work to resume");
  beginProject(state, project, {}, resume, new ZonedDate(at, readset.calendar.timeZone));
  return {
    id: receiptId,
    kind: "project",
    targetId: project.id,
    revision: project.lifecycle.revision,
    text: "The Player " + (resume ? "resumed " : "started ") + project.title + ".",
    witnesses: narrationWitnesses(sources),
  };
}

/** Native agreement authority stays with the Project; common promises cannot approve, start or finish it. */
export function applyNarrationProject(
  state: VillageState,
  request: {
    projectId: string;
    decision: "approval" | "builder" | "withdrawal" | "refuse" | "conditional" | "uncertain";
    receiptId: string;
    submissionId: string;
    at: string;
  },
  readset: NarrationReadset,
  context: NarrationSourceContext,
  sources: ContinuityEvidence[],
  before: ProjectSpeechContext,
): AcceptedEpisode["commandReceipts"][number] {
  const project = projectFor(state, request.projectId),
    flow = project.lifecycle;
  const captured = readset.projects.find((row) => row.projectId === project.id);
  memoryRequire(
    state.seed === readset.source.seed &&
      state.setupAt === readset.setupAt &&
      context.seed === state.seed &&
      context.episodeId === readset.source.episodeId &&
      captured &&
      captured.revision === flow.revision &&
      before.projectId === project.id &&
      before.revision === captured.revision &&
      memoryHash(before.terms) === memoryHash(captured.terms) &&
      memoryHash(projectSpeechTerms(state, project)) === memoryHash(captured.terms) &&
      ["planning", "paused", "working"].includes(project.status),
    "the complete current Project terms were not supplied",
  );
  const actorId = sources[0]?.actorId,
    actor = context.actors.find((actor) => actor.id === actorId);
  memoryRequire(
    actorId &&
      actor &&
      continuityActor(state, actorId)?.incarnation === actor.incarnation &&
      sources.length > 0 &&
      sources.length <= 8 &&
      sources.every((source) => {
        const line = context.lines.find((line) => line.id === source.unitId);
        const index = context.lines.findIndex((line) => line.id === source.unitId);
        return (
          source.seed === state.seed &&
          source.episodeId === context.episodeId &&
          source.kind === "speech" &&
          source.actorId === actorId &&
          line &&
          line.role === "assistant" &&
          line.speakerId === actorId &&
          line.kind !== "narration" &&
          !line.contactReport &&
          line.heardBy.includes("player") &&
          source.fingerprint === memoryHash(line) &&
          source.moment?.index === index &&
          source.moment.side === "after" &&
          memoryHash(source.positions) === memoryHash(narrationPositions(context, { index, side: "after" })) &&
          source.excerpt === line.content &&
          source.perceptions.some((row) => row.actorId === "player" && row.channel === "words") &&
          source.positions?.[actorId] &&
          source.positions[actorId] === source.positions.player
        );
      }),
    "Project agreement needs this present actor's complete current speech witnessed by the player",
  );
  memoryRequire(
    captured.agreements[actorId] && before.agreements[actorId] === captured.agreements[actorId],
    "this person's Project agreement authority changed after the request was captured",
  );
  const resident = state.villagers.some((resident) => resident.characterId === actorId);
  const name = context.scene.participants.find((person) => person.characterId === actorId)?.name;
  memoryRequire(name, "Project speaker has no captured public identity");
  memoryRequire(resident || findNpc(state, actorId), "the Project speaker is unavailable");
  memoryRequire(request.decision !== "builder" || resident, "only Villagers can lead physical work");
  memoryRequire(
    !flow.evidenceIds.includes(request.receiptId),
    "Project evidence is already retained; replay its accepted episode",
  );
  if (request.decision === "withdrawal" || request.decision === "refuse") {
    const selectedLead = flow.builderId === actorId;
    flow.approvals = flow.approvals.filter((row) => row.residentId !== actorId);
    flow.candidates = flow.candidates.filter((row) => row.residentId !== actorId);
    if (project.status === "working" && (actorId === flow.builderId || flow.affectedIds.includes(actorId)))
      pauseProject(project, request.at, "Renew the necessary agreements and lead, then Resume.");
    if (selectedLead) flow.builderId = "";
  } else if (request.decision === "approval" || request.decision === "builder") {
    memoryRequire(
      ["planning", "paused"].includes(project.status),
      "this Project cannot accept a new agreement while working",
    );
    if (request.decision === "approval") {
      const venue = findLocation(state, project.venueId);
      memoryRequire(
        venue &&
          flow.change &&
          (project.kind === "establishment"
            ? establishmentControllers(state, project)
            : renovationAffectedIds(venue, flow.change, flow.changedZoneIds)
          ).includes(actorId),
        "this person cannot approve this Project change",
      );
      flow.approvals = flow.approvals.filter((row) => row.residentId !== actorId);
      flow.approvals.push({
        residentId: actorId,
        incarnation: actor.incarnation,
        source: "conversation",
        evidenceId: request.receiptId,
        scope:
          project.kind === "establishment"
            ? establishmentScope(project)
            : approvalScope(venue, flow.change, actorId, flow.changedZoneIds, flow.roomBasis),
        at: readset.capturedAt,
      });
    } else {
      flow.candidates = flow.candidates.filter((row) => row.residentId !== actorId);
      flow.candidates.push({
        residentId: actorId,
        incarnation: actor.incarnation,
        evidenceId: request.receiptId,
        scope: projectDesignKey(project),
        at: readset.capturedAt,
      });
    }
  }
  const lineId = sources[0].unitId;
  if (
    !flow.spokenProofs.some(
      (proof) =>
        proof.lineId === lineId && proof.sessionId === context.scene.id && proof.submissionId === request.submissionId,
    )
  )
    flow.spokenProofs.push({
      lineId,
      sessionId: context.scene.id,
      submissionId: request.submissionId,
      speakerId: actorId,
      venueId: context.scene.placeId,
      zoneId: sources[0].positions![actorId],
      quote: sources.map((source) => source.excerpt).join("\n"),
      at: readset.capturedAt,
      grade: "cited-interpretation",
      interpretationVersion: 1,
      citations: sources.map((source) => ({ lineId: source.unitId, quote: source.excerpt })),
    });
  flow.evidenceIds.push(request.receiptId);
  project.updatedAt = request.at;
  return {
    id: request.receiptId,
    kind: "project",
    targetId: project.id,
    revision: flow.revision,
    text:
      name +
      (request.decision === "approval"
        ? " approved "
        : request.decision === "builder"
          ? " offered to lead "
          : request.decision === "refuse"
            ? " refused "
            : request.decision === "withdrawal"
              ? " withdrew from "
              : " did not grant agreement for ") +
      project.title +
      ".",
    witnesses: narrationWitnesses(sources),
  };
}
