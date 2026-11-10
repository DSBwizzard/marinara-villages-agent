import type { AcceptedEpisode } from "../models/episode-model.js";
import type { ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import { memoryHash } from "./memory-integrity.js";

export function nativeReceiptSupportsRoom(
  receipt: AcceptedEpisode["commandReceipts"][number],
  room: Extract<ContinuityHolder, { kind: "room" }>,
) {
  return (
    (receipt.kind === "structure" && receipt.targetId === JSON.stringify([room.placeId, room.zoneId])) ||
    (receipt.kind === "discovery" && receipt.targetId === room.placeId)
  );
}

/** Routed speech is already canonical evidence; ordinary dialogue needs no earlier keep/classifier. */
export function episodeSpeechEvidence(episode: AcceptedEpisode, lineId: string): ContinuityEvidence | undefined {
  const line = episode.segments.find((line) => line.id === lineId);
  if (
    !line ||
    line.role !== "assistant" ||
    line.contactReport ||
    !["dialogue", "side", "whisper"].includes(line.kind ?? "") ||
    !episode.actors.some((actor) => actor.id === line.speakerId)
  )
    return;
  return {
    id: "speech-source-" + memoryHash([episode.id, line.id]).slice(0, 32),
    seed: episode.seed,
    episodeId: episode.id,
    unitId: line.id,
    fingerprint: memoryHash(line),
    kind: "speech",
    actorId: line.speakerId,
    excerpt: line.content,
    perceptions: episode.actors.flatMap((actor): ContinuityEvidence["perceptions"] => {
      if (line.speakerId === actor.id || line.heardBy.includes(actor.id))
        return [{ actorId: actor.id, channel: "words" as const, text: line.content }];
      if (
        line.soundOnly &&
        (line.soundOnly.characterIds.includes(actor.id) || (actor.id === "player" && line.soundOnly.player))
      )
        return [{ actorId: actor.id, channel: "sound-only" as const, text: line.soundOnly.text }];
      return [];
    }),
  };
}
