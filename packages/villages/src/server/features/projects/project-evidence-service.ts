import type { VillageState } from "../../domain/models/world.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { conflict } from "../../domain/rules/errors.js";
import { projectFor, pauseProject } from "../../domain/rules/project-lifecycle-rules.js";
import { approvalScope, projectDesignKey, renovationAffectedIds } from "../../domain/rules/project-terms.js";
import { validateProjectSpeech } from "../../domain/rules/project-interpretation.js";
import { sceneEvidencePerception } from "../../domain/rules/scene-evidence-perception.js";
import type { SceneQueries } from "../scenes/services.js";
import { villageNow } from "../../adapters/time/clock-gate.js";

export interface ProjectEvidencePorts {
  readVillageState(): Promise<VillageState>;
  mutateVillageState(update: (state: VillageState) => void): Promise<VillageState>;
  sceneQueries(): Pick<
    SceneQueries,
    "readProjectTurnEvidence" | "activeVenueSession" | "listVenueVisits" | "listRetiredProjectScenes"
  >;
}
export function createProjectEvidence({ readVillageState, mutateVillageState, sceneQueries }: ProjectEvidencePorts) {
  async function recordProjectSpokenEvidence(projectId: string, value: unknown): Promise<void> {
    const input = asRecord(value),
      sessionId = asTrimmedString(input.sessionId),
      submissionId = asTrimmedString(input.submissionId);
    const turn = await sceneQueries().readProjectTurnEvidence(sessionId, submissionId);
    const proposal = Number.isInteger(input.interpretationIndex)
      ? turn.projectSpeech[Number(input.interpretationIndex)]
      : undefined;
    if (turn.projectMetadataRejected || !proposal || proposal.projectId !== projectId || proposal.kind !== input.kind)
      throw conflict("Select a supported saved Project agreement.");
    const reason = validateProjectSpeech(proposal, turn.lines);
    if (reason) throw conflict(reason);
    const speakerId = proposal.speakerId,
      lineId = proposal.citations[0].lineId;
    if (
      !turn.activeIdsAtTurn.includes(speakerId) ||
      proposal.citations.some(
        (citation) =>
          !turn.lines.some(
            (line) =>
              line.id === citation.lineId &&
              line.kind === "dialogue" &&
              !line.contactHidden &&
              !line.contactReport &&
              !line.soundOnly?.player,
          ),
      )
    )
      throw conflict("This agreement was not witnessed.");
    await mutateVillageState((state) => {
      const appliedAt =
        turn.preservationVersion === 1 || turn.occurrenceVersion === 1 ? villageNow().toISOString() : turn.at;
      const project = projectFor(state, projectId),
        flow = project.lifecycle;
      const proofId = JSON.stringify([proposal.kind, sessionId, submissionId, lineId]);
      if (flow.evidenceIds.includes(proofId)) return;
      if (
        state.seed !== turn.villageSeed ||
        !["planning", "paused", "working"].includes(project.status) ||
        flow.revision !== proposal.revision ||
        !turn.projectContexts.some((context) => context.projectId === projectId && context.revision === flow.revision)
      )
        return;
      if (!state.villagers.some((resident) => resident.characterId === speakerId))
        throw conflict("This resident no longer lives here.");
      if (proposal.kind === "withdrawal") {
        flow.approvals = flow.approvals.filter((row) => row.residentId !== speakerId);
        flow.candidates = flow.candidates.filter((row) => row.residentId !== speakerId);
        if (project.status === "working" && (speakerId === flow.builderId || flow.affectedIds.includes(speakerId)))
          pauseProject(project, appliedAt, "Renew the necessary agreements and lead, then Resume.");
      } else {
        if (!["planning", "paused"].includes(project.status)) return;
        if (proposal.kind === "approval") {
          const venue = state.venues.find((venue) => venue.id === project.venueId);
          if (
            !venue ||
            !flow.change ||
            !renovationAffectedIds(venue, flow.change, flow.changedZoneIds).includes(speakerId)
          )
            throw conflict("This resident cannot approve this change.");
          flow.approvals = flow.approvals.filter((row) => row.residentId !== speakerId);
          flow.approvals.push({
            residentId: speakerId,
            source: "conversation",
            evidenceId: proofId,
            scope: approvalScope(venue, flow.change, speakerId, flow.changedZoneIds),
            at: turn.at,
          });
        } else {
          flow.candidates = flow.candidates.filter((row) => row.residentId !== speakerId);
          flow.candidates.push({
            residentId: speakerId,
            evidenceId: proofId,
            scope: projectDesignKey(project),
            at: turn.at,
          });
        }
      }
      if (
        !flow.spokenProofs.some(
          (row) => row.sessionId === sessionId && row.submissionId === submissionId && row.lineId === lineId,
        )
      )
        flow.spokenProofs.push({
          lineId,
          sessionId,
          submissionId,
          speakerId,
          venueId: turn.venueId,
          zoneId: turn.zoneId,
          quote: proposal.citations.map((row) => row.quote).join("\n"),
          at: turn.at,
          grade: "cited-interpretation",
          interpretationVersion: 1,
          citations: proposal.citations,
        });
      flow.evidenceIds.push(proofId);
      project.updatedAt = appliedAt;
    });
  }
  async function processProjectSpeechTurn(sessionId: string, submissionId: string): Promise<void> {
    const turn = await sceneQueries().readProjectTurnEvidence(sessionId, submissionId);
    for (const [interpretationIndex, proposal] of turn.projectSpeech.entries()) {
      await recordProjectSpokenEvidence(proposal.projectId, {
        sessionId,
        submissionId,
        interpretationIndex,
        kind: proposal.kind,
      });
    }
  }
  async function listProjectEvidenceCandidates(projectId: string) {
    const state = await readVillageState();
    projectFor(state, projectId);
    const { listVenueVisits, activeVenueSession, listRetiredProjectScenes } = sceneQueries();
    const active = await activeVenueSession();
    const original = await listVenueVisits();
    const originalIds = new Set(original.map((scene) => scene.id));
    const compact = (await listRetiredProjectScenes?.(state.seed)) ?? [];
    const closed = [...original, ...compact.filter((scene) => !originalIds.has(scene.id))]
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt) || a.id.localeCompare(b.id))
      .slice(0, 20);
    const visits = [...(active ? [active] : []), ...closed].filter((visit) => visit.villageSeed === state.seed);
    return visits
      .flatMap((visit) =>
        visit.submissions.flatMap((submission) => {
          if ((submission.mode !== "chat" && submission.mode !== "ask") || !submission.at) return [];
          const lines = visit.lines.filter((line) =>
            submission.replyLineIds?.length
              ? submission.replyLineIds.includes(line.id) && submission.activeIdsAtTurn?.includes(line.speakerId)
              : line.at === submission.at && visit.participants.some((person) => person.characterId === line.speakerId),
          );
          return lines
            .filter(
              (line) =>
                line.kind === "dialogue" &&
                !line.contactHidden &&
                !line.contactReport &&
                !line.soundOnly?.player &&
                sceneEvidencePerception(line).playerPerception === "full",
            )
            .map((line) => ({
              sessionId: visit.id,
              submissionId: submission.id,
              lineId: line.id,
              residentId: line.speakerId,
              residentName: line.name,
              venueId: visit.placeId,
              venueName: visit.placeName,
              at: submission.at,
              playerMessage: "",
              quote: line.content,
            }));
        }),
      )
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 80);
  }

  return { recordProjectSpokenEvidence, processProjectSpeechTurn, listProjectEvidenceCandidates };
}
export type ProjectEvidence = ReturnType<typeof createProjectEvidence>;
