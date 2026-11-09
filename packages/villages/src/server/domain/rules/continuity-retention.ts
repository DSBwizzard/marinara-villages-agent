import type { ContinuityCollection, ContinuityHolder } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { EpisodeCollection } from "../models/episode-model.js";
import { continuityHolderKey } from "./continuity.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

export function nativeReceiptSupportsRoom(
  receipt: AcceptedEpisode["commandReceipts"][number],
  room: Extract<ContinuityHolder, { kind: "room" }>,
) {
  return (
    (receipt.kind === "structure" && receipt.targetId === JSON.stringify([room.placeId, room.zoneId])) ||
    (receipt.kind === "discovery" && receipt.targetId === room.placeId)
  );
}

/** Retirement cannot sever the accepted episode, canonical meaning or committed native evidence. */
export function assertContinuityRetention(continuity: ContinuityCollection, episodes: EpisodeCollection) {
  const owners = new Map<string, string>(),
    versions = new Map(continuity.versions.map((row) => [row.id, row]));
  const byEpisode = new Map(episodes.records.map((row) => [row.id, row]));
  const births = new Map<string, number>(),
    roots = new Map(continuity.records.map((row) => [row.id, row]));
  for (const [sequence, episode] of episodes.records.entries()) {
    for (const id of episode.continuityVersionIds) {
      const version = versions.get(id);
      memoryRequire(
        version && !owners.has(id) && version.operationId.startsWith(episode.operationId + ":"),
        "missing or changed episode version owner",
      );
      owners.set(id, episode.id);
      if (!births.has(version.rootId)) births.set(version.rootId, sequence);
    }
    for (const source of episode.grounding)
      if (source.kind === "self") {
        const version = versions.get(source.unitId),
          actor = episode.actors.find((actor) => actor.id === source.actorId);
        const holder = actor && { kind: "actor" as const, id: actor.id, incarnation: actor.incarnation };
        memoryRequire(
          version &&
            actor &&
            holder &&
            episode.continuityVersionIds.includes(version.id) &&
            ["perspective", "desire", "motivation", "commitment"].includes(version.class) &&
            version.text === source.excerpt &&
            source.fingerprint === memoryHash([version.id, version.class, version.text, continuityHolderKey(holder)]) &&
            continuity.records.find((row) => row.id === version.rootId)?.heads[continuityHolderKey(holder)],
          "self source lost its private retained meaning",
        );
      }
  }
  for (const [sequence, episode] of episodes.records.entries())
    for (const offer of episode.offered)
      for (const id of offer.ids)
        memoryRequire(
          roots.get(id)?.heads[continuityHolderKey(offer.holder)] && (births.get(id) ?? Infinity) < sequence,
          "initiative offer lost its admitted prior root",
        );
  for (const version of continuity.versions) {
    memoryRequire(owners.has(version.id), "continuity version lost its accepted episode");
    for (const source of version.sources) {
      const episode = byEpisode.get(source.episodeId),
        original = episode?.grounding.find((row) => row.id === source.id);
      const soundOnly =
        source.perceptions.length > 0 && source.perceptions.every((row) => row.channel === "sound-only");
      memoryRequire(
        original &&
          original.seed === source.seed &&
          original.unitId === source.unitId &&
          original.fingerprint === source.fingerprint &&
          original.kind === source.kind &&
          (original.act === source.act || (!source.act && soundOnly)) &&
          original.committedReceiptId === source.committedReceiptId,
        "continuity source lost its canonical evidence",
      );
      if (version.room && source.kind === "native") {
        const room = Object.values(roots.get(version.rootId)!.heads).find(
          (head) => head.holder.kind === "room",
        )?.holder;
        const receipt = episode?.commandReceipts.find((receipt) => receipt.id === source.committedReceiptId);
        memoryRequire(
          room?.kind === "room" && receipt && nativeReceiptSupportsRoom(receipt, room),
          "native receipt does not establish this room outcome",
        );
      }
      memoryRequire(
        source.actorId === original.actorId || (!source.actorId && soundOnly),
        "continuity source author changed",
      );
      memoryRequire(
        source.perceptions.every((row) => original.perceptions.some((prior) => memoryHash(prior) === memoryHash(row))),
        "continuity source widened its projection",
      );
      memoryRequire(
        source.excerpt === original.excerpt || source.perceptions.some((row) => row.text === source.excerpt),
        "continuity source excerpt changed",
      );
      memoryRequire(
        !source.range || memoryHash(source.range) === memoryHash(original.range),
        "continuity source range changed",
      );
    }
  }
}
