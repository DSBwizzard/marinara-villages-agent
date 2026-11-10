import type { AcceptedEpisode } from "../models/episode-model.js";
import type { ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { continuityHolderKey, continuitySourceUnit } from "./continuity.js";

/** Private GM reference holders are provenance, never Scene attendance or character perception. */
function episodeContextHolders(
  episode: Pick<AcceptedEpisode, "room" | "holderDependencies"> & { actors: { id: string; incarnation: string }[] },
  keys = Object.keys(episode.holderDependencies ?? {}),
): ContinuityHolder[] {
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
          (row[0] === "actor" || row[0] === "room") &&
          typeof row[1] === "string" &&
          row[1].length > 0 &&
          row[1].length <= 160 &&
          typeof row[2] === "string" &&
          row[2].length > 0 &&
          row[2].length <= 160 &&
          JSON.stringify(row) === key &&
          (row[0] !== "actor" || !ids.has(row[1])),
        "invalid private episode context holder",
      );
      if (row[0] === "room") return { kind: "room" as const, placeId: row[1], zoneId: row[2] };
      ids.add(row[1]);
      return { kind: "actor" as const, id: row[1], incarnation: row[2] };
    });
}
export function episodeContextActors(episode: Parameters<typeof episodeContextHolders>[0], keys?: string[]) {
  return episodeContextHolders(episode, keys).filter((holder) => holder.kind === "actor");
}
/** Read-only Room ancestry never establishes attendance or writable Room authority. */
export function episodeContextRooms(episode: Parameters<typeof episodeContextHolders>[0], keys?: string[]) {
  return episodeContextHolders(episode, keys).filter((holder) => holder.kind === "room");
}

export function nativeReceiptSupportsRoom(
  receipt: AcceptedEpisode["commandReceipts"][number],
  room: Extract<ContinuityHolder, { kind: "room" }>,
) {
  return (
    ((receipt.kind === "structure" || receipt.kind === "room") &&
      receipt.targetId === JSON.stringify([room.placeId, room.zoneId])) ||
    (receipt.kind === "discovery" && receipt.targetId === room.placeId)
  );
}

/** Administrative edits inherit the origin Rooms of the exact circumstance prose they carry forward. */
export function circumstanceRoomOrigins(
  episode: AcceptedEpisode,
  receipt: AcceptedEpisode["commandReceipts"][number],
  episodes: ReadonlyMap<string, AcceptedEpisode>,
) {
  const pending = [{ episode, receipt }],
    seen = new Set<string>();
  const rooms = new Map<string, NonNullable<AcceptedEpisode["room"]>>();
  for (const { episode: row, receipt: fact } of pending) {
    if (row.sceneId || seen.has(row.id) || fact.kind !== "circumstance") continue;
    seen.add(row.id);
    if (row.room) rooms.set(continuityHolderKey(row.room), row.room);
    else
      for (const dependency of row.dependencies["native:" + fact.id] ?? []) {
        const unit: unknown = JSON.parse(dependency);
        const prior = Array.isArray(unit) && typeof unit[0] === "string" ? episodes.get(unit[0]) : undefined;
        const source = prior?.grounding.find(
          (source) => source.kind === "native" && continuitySourceUnit(source) === dependency,
        );
        const inherited = source && prior?.commandReceipts.find((receipt) => receipt.id === source.committedReceiptId);
        if (prior && inherited?.targetId === fact.targetId) pending.push({ episode: prior, receipt: inherited });
      }
  }
  return [...rooms.values()];
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
