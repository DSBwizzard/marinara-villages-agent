import { unfinishedExchange } from "../decoding/exchange-codec.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState } from "../models/world.js";
import { spinoffLocksScene } from "../models/spinoff-model.js";
import { pendingProgressTurns } from "./scene-record.js";
import { asRecord } from "./coerce.js";
import { EXCHANGE_DOMAINS } from "../models/exchange-model.js";
import { readOpeningSignal } from "./opening-project.js";

/** Do not let permissive compatibility decoding turn corrupt saved work into a settled Scene. */
export function sceneRetirementSourceIsValid(value: unknown): boolean {
  const raw = asRecord(value);
  if (raw.version !== 2 || raw.status !== "closed" || typeof raw.id !== "string" || !raw.id) return false;
  if (
    typeof raw.villageSeed !== "string" ||
    !raw.villageSeed ||
    !Array.isArray(raw.lines) ||
    !Array.isArray(raw.submissions)
  )
    return false;
  const lineIds = new Set<string>();
  for (const value of raw.lines) {
    const line = asRecord(value);
    if (
      typeof line.id !== "string" ||
      !line.id ||
      lineIds.has(line.id) ||
      typeof line.content !== "string" ||
      !line.content
    )
      return false;
    if (
      line.heardBy !== undefined &&
      (!Array.isArray(line.heardBy) || line.heardBy.some((id) => typeof id !== "string"))
    )
      return false;
    if (line.role !== "user" && line.role !== "assistant") return false;
    if (line.kind !== undefined && !["narration", "dialogue", "side", "whisper"].includes(String(line.kind)))
      return false;
    if (line.delivery !== undefined && !["ordinary", "whisper", "shout"].includes(String(line.delivery))) return false;
    if (
      ["contactHidden", "contactReport", "attentionEvidence"].some(
        (key) => line[key] !== undefined && typeof line[key] !== "boolean",
      )
    )
      return false;
    if (line.targetId !== undefined && typeof line.targetId !== "string") return false;
    if (line.soundOnly !== undefined) {
      const sound = asRecord(line.soundOnly);
      if (
        typeof sound.text !== "string" ||
        typeof sound.player !== "boolean" ||
        !Array.isArray(sound.characterIds) ||
        sound.characterIds.some((id) => typeof id !== "string")
      )
        return false;
    }
    lineIds.add(line.id);
  }
  if (raw.operation !== undefined) {
    const operation = asRecord(raw.operation);
    if (operation.status !== "complete" || typeof operation.id !== "string" || typeof operation.kind !== "string")
      return false;
  }
  const submissionIds = new Set<string>();
  return raw.submissions.every((value) => {
    const turn = asRecord(value);
    if (typeof turn.id !== "string" || !turn.id || submissionIds.has(turn.id)) return false;
    submissionIds.add(turn.id);
    if (!turn.movement && (typeof turn.at !== "string" || !Number.isFinite(Date.parse(turn.at)))) return false;
    if (turn.openingSignal !== undefined && !readOpeningSignal(turn.openingSignal)) return false;
    if (turn.processing !== undefined) {
      const processing = asRecord(turn.processing);
      const domains = asRecord(processing.domains);
      if (
        processing.version !== 1 ||
        processing.sceneId !== raw.id ||
        processing.submissionId !== turn.id ||
        processing.seed !== raw.villageSeed
      )
        return false;
      if (
        EXCHANGE_DOMAINS.some(
          (domain) => !["pending", "failed", "applied", "rejected"].includes(String(asRecord(domains[domain]).status)),
        )
      )
        return false;
    }
    if (turn.semanticProvenance !== undefined && asRecord(turn.semanticProvenance).version !== 2) return false;
    if (turn.projectSpeech !== undefined) {
      if (!Array.isArray(turn.projectSpeech) || turn.projectSpeech.length > 12) return false;
      for (const value of turn.projectSpeech) {
        const proposal = asRecord(value);
        if (
          proposal.version !== 1 ||
          typeof proposal.projectId !== "string" ||
          typeof proposal.speakerId !== "string" ||
          !Number.isSafeInteger(proposal.revision) ||
          !["approval", "builder", "withdrawal"].includes(String(proposal.kind)) ||
          !Array.isArray(proposal.citations) ||
          proposal.citations.length > 12
        )
          return false;
        if (
          proposal.citations.some((value) => {
            const citation = asRecord(value);
            return (
              typeof citation.lineId !== "string" ||
              !lineIds.has(citation.lineId) ||
              typeof citation.quote !== "string" ||
              !citation.quote
            );
          })
        )
          return false;
      }
    }
    return true;
  });
}

/** A closed Scene remains an outbox until every saved effect and operation settles. */
export function sceneReadyForRetirement(scene: VenueScene, village: VillageState, activeId: string): boolean {
  if (!scene.id || !scene.villageSeed || scene.villageSeed !== village.seed || scene.status !== "closed") return false;
  if (scene.id === activeId || spinoffLocksScene(scene.spinoff) || (scene.spinoff && !scene.spinoff.resolvedAt))
    return false;
  if (scene.operation && scene.operation.status !== "complete") return false;
  if (
    Object.keys(scene.operation?.checkpoints ?? {}).some((key) => key !== "abandoned-request") ||
    Object.keys(scene.operation?.attempts ?? {}).length
  )
    return false;
  if (
    scene.operation?.error ||
    Object.values(scene.operation?.optionalAttempts ?? {}).some(
      (a) => a.status !== "complete" && a.status !== "unknown",
    )
  )
    return false;
  if (pendingProgressTurns(scene, village.foundedAt).length) return false;
  return !scene.submissions.some(
    (turn) =>
      (turn.openingSignal && !turn.openingProcessedAt) ||
      (turn.processing && unfinishedExchange(turn.processing)) ||
      (turn.semanticProvenance?.version === 2 &&
        (!turn.semanticReady || !village.socialPublications?.[scene.id + ":" + turn.id])),
  );
}
