import type { AcceptedEpisode } from "../models/episode-model.js";
import type { ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

/** Private GM reference holders are provenance, never Scene attendance or character perception. */
export function episodeContextActors(
  episode: Pick<AcceptedEpisode, "room" | "holderDependencies"> & { actors: { id: string; incarnation: string }[] },
  keys = Object.keys(episode.holderDependencies ?? {}),
): Extract<ContinuityHolder, { kind: "actor" }>[] {
  const physical = new Set(episode.actors.map((actor) => JSON.stringify(["actor", actor.id, actor.incarnation])));
  if (episode.room) physical.add(JSON.stringify(["room", episode.room.placeId, episode.room.zoneId]));
  const ids = new Set(episode.actors.map((actor) => actor.id));
  return keys
    .filter((key) => !physical.has(key))
    .map((key) => {
      const row: unknown = JSON.parse(key);
      memoryRequire(
        Array.isArray(row) &&
          row.length === 3 &&
          row[0] === "actor" &&
          typeof row[1] === "string" &&
          row[1].length > 0 &&
          row[1].length <= 160 &&
          typeof row[2] === "string" &&
          row[2].length > 0 &&
          row[2].length <= 160 &&
          JSON.stringify(row) === key &&
          !ids.has(row[1]),
        "invalid private episode context holder",
      );
      ids.add(row[1]);
      return { kind: "actor" as const, id: row[1], incarnation: row[2] };
    });
}

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
