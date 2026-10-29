import { coerceSession } from "../decoding/scene-codec.js";
import type { VenueScene } from "../models/scene-model.js";
import { projectMetadataRejected } from "./semantic-continuity.js";
import { sceneEvidencePerception } from "./scene-evidence-perception.js";
import { validateProjectSpeech } from "./project-interpretation.js";

/** Keep the same per-Scene candidate window without storing the Scene transcript. */
export function projectSceneEvidence(scene: VenueScene): VenueScene {
  const candidates = scene.submissions.flatMap((turn) => {
    if ((turn.mode !== "chat" && turn.mode !== "ask") || !turn.at) return [];
    return scene.lines
      .filter((line) =>
        turn.replyLineIds?.length
          ? turn.replyLineIds.includes(line.id) && turn.activeIdsAtTurn?.includes(line.speakerId)
          : line.at === turn.at && scene.participants.some((person) => person.characterId === line.speakerId),
      )
      .filter(
        (line) =>
          line.kind === "dialogue" &&
          !line.contactHidden &&
          !line.contactReport &&
          !line.soundOnly?.player &&
          sceneEvidencePerception(line).playerPerception === "full",
      )
      .map((line) => ({ turn, line }));
  });
  const selected = candidates.sort((a, b) => (b.turn.at ?? "").localeCompare(a.turn.at ?? "")).slice(0, 80);
  const lines = new Map(selected.map(({ line }) => [line.id, line]));
  const turns = [...new Map(selected.map(({ turn }) => [turn.id, turn])).values()];
  const submissions = turns.map((turn) => {
    const proposals = projectMetadataRejected(turn) ? [] : (turn.projectSpeech ?? []);
    const safeProposals = proposals.filter(
      (proposal) =>
        !validateProjectSpeech(proposal, scene.lines) &&
        proposal.citations.every((citation) => {
          const line = scene.lines.find((entry) => entry.id === citation.lineId);
          return !!line && sceneEvidencePerception(line).playerPerception === "full";
        }),
    );
    // Preserve proposal indexes: invalid/private proposals cannot become selectable.
    const projectSpeech = proposals.map((proposal) =>
      safeProposals.includes(proposal) ? proposal : { ...proposal, citations: [] },
    );
    for (const proposal of safeProposals)
      for (const citation of proposal.citations) {
        if (lines.has(citation.lineId)) continue;
        const original = scene.lines.find((line) => line.id === citation.lineId)!;
        lines.set(citation.lineId, original);
      }
    return {
      id: turn.id,
      at: turn.at,
      mode: turn.mode,
      message: "",
      targetId: "",
      areaAtTurn: turn.areaAtTurn,
      zoneIdAtTurn: turn.zoneIdAtTurn,
      privateOwnerIdAtTurn: turn.privateOwnerIdAtTurn,
      activeIdsAtTurn: turn.activeIdsAtTurn,
      speechIdsAtTurn: turn.speechIdsAtTurn,
      replyLineIds: turn.replyLineIds,
      projectContexts: turn.projectContexts,
      projectSpeech,
      projectInterpretationVersion: turn.projectInterpretationVersion,
      progressProcessedAt: turn.progressProcessedAt,
      semanticProvenance: turn.semanticProvenance
        ? {
            version: turn.semanticProvenance.version,
            preservationVersion: turn.semanticProvenance.preservationVersion,
            occurrenceVersion: turn.semanticProvenance.occurrenceVersion,
          }
        : undefined,
    };
  });
  return coerceSession({
    version: 3,
    id: scene.id,
    villageSeed: scene.villageSeed,
    status: "closed",
    placeId: scene.placeId,
    placeName: scene.placeName,
    zoneId: scene.zoneId,
    area: scene.area,
    privateOwnerId: scene.privateOwnerId,
    spaceClass: scene.spaceClass,
    startedAt: scene.startedAt,
    endedAt: scene.endedAt,
    participants: scene.participants,
    lines: [...lines.values()],
    submissions,
  });
}
