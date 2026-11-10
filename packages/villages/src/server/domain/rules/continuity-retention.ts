import type { ContinuityCollection, ContinuityEvidence, ContinuityVersion } from "../models/continuity-model.js";
import type { AcceptedEpisode, EpisodeCollection } from "../models/episode-model.js";
import {
  continuityHolderKey,
  continuityVersionId,
  assertContinuityKnowledge,
  continuitySourceUnit,
  continuityOfferSource,
  assertContinuitySoundIdentity,
} from "./continuity.js";
import {
  circumstanceRoomOrigins,
  episodeSpeechEvidence,
  nativeReceiptSupportsRoom,
  episodeContextActors,
  episodeContextRooms,
} from "./episode-sources.js";
import { episodeUnit } from "../decoding/episode-codec.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { episodeMailEvidence } from "./mail-evidence.js";

function worldRoomReceipt(episode: AcceptedEpisode) {
  const receipt = episode.commandReceipts[0];
  if (
    episode.room &&
    !episode.sceneId &&
    !episode.actors.length &&
    episode.commandReceipts.length === 1 &&
    receipt &&
    !receipt.witnesses.length &&
    (receipt.kind === "room" || receipt.kind === "circumstance")
  )
    return receipt;
}

/** Retirement cannot sever the accepted episode, canonical meaning or committed native evidence. */
export function assertContinuityRetention(continuity: ContinuityCollection, episodes: EpisodeCollection) {
  const owners = new Map<string, string>(),
    versions = new Map(continuity.versions.map((row) => [row.id, row]));
  const byEpisode = new Map(episodes.records.map((row) => [row.id, row]));
  const sequenceById = new Map(episodes.records.map((row, index) => [row.id, index]));
  const sourceActors = Object.fromEntries(episodes.records.map((episode) => [episode.id, episode.actors]));
  const births = new Map<string, number>(),
    roots = new Map(continuity.records.map((row) => [row.id, row]));
  const repairs = new Map<string, { room: string; admitted: number; proofs: string[] }>();
  for (const [sequence, episode] of episodes.records.entries()) {
    const references = episodeContextActors(episode);
    memoryRequire(
      episode.admittedContinuityRevision <= continuity.revision,
      "episode admitted a future continuity revision",
    );
    for (const dependency of new Set([
      ...Object.values(episode.dependencies).flat(),
      ...Object.values(episode.holderDependencies ?? {}).flatMap((rows) => Object.values(rows).flat()),
    ])) {
      if (!dependency.startsWith('["version",')) continue;
      const unit = JSON.parse(dependency);
      const version = versions.get(unit[1]);
      memoryRequire(
        unit.length === 2 &&
          version &&
          (!version.administrative || version.createdRevision <= episode.admittedContinuityRevision),
        "episode lost its admitted continuity version",
      );
    }
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
    for (const receipt of episode.commandReceipts.filter((row) => row.kind === "condition-repair")) {
      const room = episode.room,
        proof = episode.dependencies["native:" + receipt.id]?.[0];
      memoryRequire(room && proof && receipt.repairEntries?.length, "condition repair lost its native Room proof");
      for (const root of receipt.repairEntries!) {
        const changed = episode.continuityVersionIds
          .map((id) => versions.get(id)!)
          .find((row) => row.rootId === root && row.id === continuityVersionId(episode.seed, row.operationId, room));
        memoryRequire(changed, "condition repair lost an exact enduring Room correction");
        const repair = repairs.get(changed.id) ?? {
          room: continuityHolderKey(room),
          admitted: episode.admittedContinuityRevision,
          proofs: [],
        };
        repair.proofs.push(proof);
        repairs.set(changed.id, repair);
      }
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
          const prior = typeof unit[0] === "string" ? byEpisode.get(unit[0]) : undefined,
            letter = prior && typeof unit[1] === "string" ? episodeMailEvidence(prior, unit[1]) : undefined;
          memoryRequire(
            prior &&
              (sequenceById.get(prior.id) ?? Infinity) < sequence &&
              [...prior.actors, ...episodeContextActors(prior)].some(
                (actor) => actor.id === holder.id && actor.incarnation === holder.incarnation,
              ) &&
              (prior.grounding.some((source) => continuitySourceUnit(source) === dependency) ||
                (letter && continuitySourceUnit(letter) === dependency) ||
                prior.segments.some((line) => JSON.stringify([prior.id, line.id, memoryHash(line)]) === dependency) ||
                (unit[1] === "input" &&
                  JSON.stringify([prior.id, "input", memoryHash(prior.privateInput)]) === dependency)),
            "private context lost its prior actor incarnation or source",
          );
        }
      }
  }
  for (const [sequence, episode] of episodes.records.entries()) {
    const roomReceipt = worldRoomReceipt(episode);
    if (roomReceipt) {
      const holder = episode.room!,
        key = continuityHolderKey(holder),
        nativeUnit = "native:" + roomReceipt.id;
      memoryRequire(
        Object.keys(episode.dependencies).every((unit) => unit === nativeUnit),
        "World Room receipt has unrelated dependencies",
      );
      for (const dependency of episode.dependencies[nativeUnit] ?? []) {
        const unit: unknown = JSON.parse(dependency);
        const version =
          Array.isArray(unit) && unit.length === 2 && unit[0] === "version" ? versions.get(unit[1]) : undefined;
        const prior = version && byEpisode.get(owners.get(version.id) ?? "");
        memoryRequire(
          version?.room?.visibility === "observable" &&
            version.createdRevision <= episode.admittedContinuityRevision &&
            roots.get(version.rootId)?.heads[key] &&
            (version.administrative
              ? continuityHolderKey(version.administrative.holder) === key
              : version.id === continuityVersionId(episode.seed, version.operationId, holder) &&
                !!prior &&
                (sequenceById.get(prior.id) ?? Infinity) < sequence),
          "World Room context lost its admitted observable version",
        );
      }
    }
    for (const holder of [
      ...episodeContextRooms(episode),
      ...(!episode.sceneId && episode.room && episode.commandReceipts.some((receipt) => receipt.mail)
        ? [episode.room]
        : []),
    ]) {
      const key = continuityHolderKey(holder);
      for (const dependency of new Set(Object.values(episode.holderDependencies![key]).flat())) {
        const unit: unknown = JSON.parse(dependency);
        memoryRequire(Array.isArray(unit), "invalid private room ancestry");
        if (unit[0] === "version") {
          const version = versions.get(unit[1]),
            root = version && roots.get(version.rootId),
            prior = version && episodes.records.find((row) => row.continuityVersionIds.includes(version.id));
          memoryRequire(
            unit.length === 2 &&
              version &&
              version.createdRevision <= episode.admittedContinuityRevision &&
              ((version.room &&
                root?.heads[key] &&
                (version.administrative
                  ? continuityHolderKey(version.administrative.holder) === key
                  : version.id === continuityVersionId(episode.seed, version.operationId, holder) &&
                    !!prior &&
                    (sequenceById.get(prior.id) ?? Infinity) < sequence)) ||
                (prior &&
                  (sequenceById.get(prior.id) ?? Infinity) < sequence &&
                  prior.holderDependencies?.[key]?.["version:" + version.id]?.length)),
            "private room context lost its admitted canonical version",
          );
        } else {
          const prior = typeof unit[0] === "string" ? byEpisode.get(unit[0]) : undefined;
          const circumstance = prior?.commandReceipts.find(
            (receipt) => receipt.kind === "circumstance" && unit[1] === "native:" + receipt.id,
          );
          memoryRequire(
            prior &&
              (sequenceById.get(prior.id) ?? Infinity) < sequence &&
              typeof unit[1] === "string" &&
              (prior.holderDependencies?.[key]?.[unit[1]]?.length ||
                (circumstance &&
                  circumstanceRoomOrigins(prior, circumstance, byEpisode).some(
                    (room) => continuityHolderKey(room) === key,
                  ))) &&
              episodeUnit(prior, unit[1]) === dependency,
            "private room context lost its prior scoped source",
          );
        }
      }
    }
    for (const offer of episode.offered)
      for (const id of offer.ids)
        memoryRequire(
          roots.get(id)?.heads[continuityHolderKey(offer.holder)] && (births.get(id) ?? Infinity) < sequence,
          "initiative offer lost its admitted prior root",
        );
  }
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
      source.perceptions.every((row) =>
        original.perceptions.some(
          (prior) => prior.actorId === row.actorId && prior.channel === row.channel && prior.text === row.text,
        ),
      ),
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
  const previous = new Map<string, ContinuityVersion>();
  for (const version of continuity.versions.toSorted((a, b) => a.createdRevision - b.createdRevision)) {
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
    let holder = version.administrative?.holder;
    if (!version.administrative) {
      const creator = byEpisode.get(owners.get(version.id)!)!;
      memoryRequire(
        version.createdRevision > creator.admittedContinuityRevision,
        "continuity version was created before its admitted revision",
      );
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
      if (actor) holder = { kind: "actor", id: actor.id, incarnation: actor.incarnation };
      else if (room) holder = room.holder;
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
    if (holder) {
      const key = JSON.stringify([version.rootId, continuityHolderKey(holder)]);
      if (holder.kind === "actor" && !version.administrative)
        assertContinuitySoundIdentity(version, holder, roots.get(version.rootId)!.owner, previous.get(key));
      const repair = repairs.get(version.id),
        before = previous.get(key);
      if (repair)
        memoryRequire(
          holder.kind === "room" &&
            repair.room === continuityHolderKey(holder) &&
            before &&
            before.createdRevision <= repair.admitted &&
            before.room?.visibility === "observable" &&
            !before.room.expiresAt &&
            !before.closed &&
            version.room?.visibility === "observable" &&
            !version.room.expiresAt &&
            (version.closed?.reason === "ended" || (!version.closed && version.text.trim() !== before.text.trim())) &&
            repair.proofs.every((proof) => version.sources.some((source) => continuitySourceUnit(source) === proof)),
          "condition repair lost an exact enduring Room correction",
        );
      previous.set(key, version);
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
