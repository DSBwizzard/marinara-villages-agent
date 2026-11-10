import type { ContinuityCollection, ContinuityEvidence } from "../models/continuity-model.js";
import type { EpisodeCollection } from "../models/episode-model.js";
import {
  continuityHolderKey,
  continuityVersionId,
  assertContinuityKnowledge,
  continuitySourceUnit,
  continuityOfferSource,
} from "./continuity.js";
import { episodeSpeechEvidence, nativeReceiptSupportsRoom, episodeContextActors } from "./episode-sources.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { episodeMailEvidence } from "./mail-evidence.js";

/** Retirement cannot sever the accepted episode, canonical meaning or committed native evidence. */
export function assertContinuityRetention(continuity: ContinuityCollection, episodes: EpisodeCollection) {
  const owners = new Map<string, string>(),
    versions = new Map(continuity.versions.map((row) => [row.id, row]));
  const byEpisode = new Map(episodes.records.map((row) => [row.id, row]));
  const sequenceById = new Map(episodes.records.map((row, index) => [row.id, index]));
  const sourceActors = Object.fromEntries(episodes.records.map((episode) => [episode.id, episode.actors]));
  const births = new Map<string, number>(),
    roots = new Map(continuity.records.map((row) => [row.id, row]));
  for (const [sequence, episode] of episodes.records.entries()) {
    const references = episodeContextActors(episode);
    memoryRequire(
      episode.admittedContinuityRevision <= continuity.revision,
      "episode admitted a future continuity revision",
    );
    for (const id of episode.continuityVersionIds) {
      const version = versions.get(id);
      memoryRequire(
        version &&
          !version.administrative &&
          !owners.has(id) &&
          version.operationId.startsWith(episode.operationId + ":"),
        "missing or changed episode version owner",
      );
      owners.set(id, episode.id);
      if (!births.has(version.rootId)) births.set(version.rootId, sequence);
    }
    for (const source of episode.grounding)
      if (source.kind === "knowledge") {
        assertContinuityKnowledge(
          continuity,
          source,
          [...episode.actors, ...references],
          episode.admittedContinuityRevision,
          sourceActors,
        );
        memoryRequire(
          !episode.continuityVersionIds.includes(source.unitId),
          "knowledge anchor cannot cite its own exchange",
        );
      } else if (source.kind === "self") {
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
    for (const holder of references)
      for (const dependency of new Set(
        Object.values(episode.holderDependencies![continuityHolderKey(holder)]).flat(),
      )) {
        const unit: unknown = JSON.parse(dependency);
        memoryRequire(Array.isArray(unit) && unit.length >= 3, "invalid private context ancestry");
        if (unit[0] === "knowledge")
          memoryRequire(
            episode.grounding.some(
              (source) =>
                source.kind === "knowledge" &&
                source.actorId === holder.id &&
                continuitySourceUnit(source) === dependency,
            ),
            "private context lost its own canonical knowledge anchor",
          );
        else {
          const prior = typeof unit[0] === "string" ? byEpisode.get(unit[0]) : undefined;
          memoryRequire(
            prior &&
              (sequenceById.get(prior.id) ?? Infinity) < sequence &&
              [...prior.actors, ...episodeContextActors(prior)].some(
                (actor) => actor.id === holder.id && actor.incarnation === holder.incarnation,
              ) &&
              (prior.grounding.some((source) => continuitySourceUnit(source) === dependency) ||
                prior.segments.some((line) => JSON.stringify([prior.id, line.id, memoryHash(line)]) === dependency) ||
                (unit[1] === "input" &&
                  JSON.stringify([prior.id, "input", memoryHash(prior.privateInput)]) === dependency)),
            "private context lost its prior actor incarnation or source",
          );
        }
      }
  }
  for (const [sequence, episode] of episodes.records.entries())
    for (const offer of episode.offered)
      for (const id of offer.ids)
        memoryRequire(
          roots.get(id)?.heads[continuityHolderKey(offer.holder)] && (births.get(id) ?? Infinity) < sequence,
          "initiative offer lost its admitted prior root",
        );
  function assertSource(source: ContinuityEvidence) {
    const episode = byEpisode.get(source.episodeId);
    const speech =
      episode && (episodeSpeechEvidence(episode, source.unitId) ?? episodeMailEvidence(episode, source.unitId));
    const original =
      episode?.grounding.find((row) => row.id === source.id) ?? (speech?.id === source.id ? speech : undefined);
    const soundOnly = source.perceptions.length > 0 && source.perceptions.every((row) => row.channel === "sound-only");
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
    return original;
  }
  for (const version of continuity.versions) {
    const receipt = version.administrative && continuity.receipts[version.operationId];
    memoryRequire(
      version.administrative
        ? !owners.has(version.id) &&
            receipt &&
            receipt.roots.includes(version.rootId) &&
            receipt.versions.includes(version.id)
        : owners.has(version.id),
      "continuity version lost its episode or administrative owner",
    );
    if (!version.administrative) {
      const creator = byEpisode.get(owners.get(version.id)!)!;
      const actor = creator.actors.find(
        (actor) =>
          continuityVersionId(creator.seed, version.operationId, {
            kind: "actor",
            id: actor.id,
            incarnation: actor.incarnation,
          }) === version.id,
      );
      const room = Object.values(roots.get(version.rootId)!.heads).find(
        (head) =>
          head.holder.kind === "room" &&
          continuityVersionId(creator.seed, version.operationId, head.holder) === version.id,
      );
      memoryRequire(actor || (version.room && room), "continuity version lost its creating holder");
      if (actor)
        for (const id of version.offerEvents ?? [])
          memoryRequire(
            roots
              .get(version.rootId)
              ?.offer?.events.find((event) => event.id === id)
              ?.sources.every((source) =>
                continuityOfferSource(
                  source,
                  { kind: "actor", id: actor.id, incarnation: actor.incarnation },
                  version,
                  continuity,
                  id,
                ),
              ),
            "historical offer knowledge lacks communicated terms",
          );
      if (actor)
        for (const source of version.sources)
          memoryRequire(
            sourceActors[source.episodeId]?.some(
              (original) => original.id === actor.id && original.incarnation === actor.incarnation,
            ),
            "historical source belongs to another incarnation",
          );
    }
    for (const source of version.sources) {
      assertSource(source);
      if (version.room && source.kind === "native") {
        const room = Object.values(roots.get(version.rootId)!.heads).find(
          (head) => head.holder.kind === "room",
        )?.holder;
        const receipt = byEpisode
          .get(source.episodeId)
          ?.commandReceipts.find((receipt) => receipt.id === source.committedReceiptId);
        memoryRequire(
          room?.kind === "room" && receipt && nativeReceiptSupportsRoom(receipt, room),
          "native receipt does not establish this room outcome",
        );
      }
    }
  }
  for (const record of continuity.records)
    for (const head of Object.values(record.heads)) {
      if (head.holder.kind !== "actor") continue;
      const holder = head.holder;
      const version = versions.get(head.versionId)!;
      memoryRequire(
        version.administrative ||
          version.room ||
          version.id === continuityVersionId(byEpisode.get(owners.get(version.id)!)!.seed, version.operationId, holder),
        "actor head belongs to another canonical holder",
      );
      for (const source of version.sources)
        memoryRequire(
          sourceActors[source.episodeId]?.some(
            (actor) => actor.id === holder.id && actor.incarnation === holder.incarnation,
          ),
          "historical source belongs to another incarnation",
        );
    }
  for (const record of continuity.records)
    if (record.owner) {
      const owner = record.owner,
        key = continuityHolderKey(owner);
      const initial = continuity.versions.filter((version) => version.rootId === record.id && !version.administrative);
      const firstRevision = Math.min(...initial.map((version) => version.createdRevision));
      memoryRequire(
        initial.some((version) => {
          const episode = byEpisode.get(owners.get(version.id)!);
          return (
            version.createdRevision === firstRevision &&
            episode &&
            version.id === continuityVersionId(episode.seed, version.operationId, owner) &&
            episode.actors.some((actor) => actor.id === owner.id && actor.incarnation === owner.incarnation) &&
            version.sources.some((source) => source.actorId === owner.id || source.kind === "native") &&
            record.heads[key]
          );
        }),
        "continuity owner lost its initial evidence",
      );
    }
  for (const record of continuity.records)
    for (const event of record.offer?.events ?? [])
      for (const source of event.sources) {
        const original = assertSource(source);
        const party = record.offer!.participants.find((party) => party.id === event.by),
          episode = byEpisode.get(source.episodeId);
        memoryRequire(
          original.act === event.act &&
            source.act === event.act &&
            original.actorId === event.by &&
            party &&
            episode?.actors.some((actor) => actor.id === party.id && actor.incarnation === party.incarnation),
          "offer contribution lost its canonical decision",
        );
      }
}
