import type { ContinuityCollection, ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { VillageState } from "../models/world.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import { continuityActor } from "./continuity-actors.js";
import {
  applyContinuityWrite,
  assertContinuityProvenance,
  continuityHolderKey,
  continuityProtectionUnits,
  continuitySourceUnit,
} from "./continuity.js";
import { assertContinuityRetention } from "./continuity-retention.js";
import { appendEpisode } from "./episodes.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { conflict } from "./errors.js";
import { narrationProtectionFingerprint } from "./narration-context.js";
import { readNarrationEffectHeader, readNarrationReply } from "./narration-contract.js";
import { prepareNarrationKeep } from "./narration-keep.js";
import { assertNarrationSourceOrder, bindNarrationSource, type NarrationSourceContext } from "./narration-sources.js";
import { selectSceneEffects, type SceneEffectResult } from "./scene-acceptance.js";
import { narrationLines } from "./narration-lines.js";
import { admitNpcParticipants, bindNpcReferences, type NpcAdmission } from "./npc-participation.js";
import { findLocation, findNpc } from "./places.js";
import { venueDesignHash } from "./project-structure.js";
import { resolveVenueZone, zoneClosed } from "./venue-zones.js";
import type { ContactMove } from "./venue-contact.js";
import { contactPosition } from "./venue-contact.js";
import { episodeContextActors, episodeContextRooms } from "./episode-sources.js";
import { activeNarrativeConditions } from "./narrative-environment.js";

export type NarrationPublication = {
  readset: NarrationReadset;
  raw: Record<string, unknown>;
  responseDigest: string;
  /** Results and exact evidence from the native validators, never model-authored success flags. */
  native: {
    effects: SceneEffectResult[];
    receipts: Record<string, AcceptedEpisode["commandReceipts"][number]>;
    sources: Record<string, ContinuityEvidence[]>;
    moves: (ContactMove & { effectId: string })[];
    playerMoves: { effectId: string; zoneId: string; segment: number }[];
    admissions: NpcAdmission[];
    sceneEffects?: { effectId: string; contactEndedIds: string[]; closed?: true }[];
    movementDependencies?: string[];
    damage?: Record<string, { id: string; root: string }[]>;
  };
};

type SavedNarration = Pick<NarrationPublication, "readset" | "raw" | "responseDigest">;
const abandonmentKey = (publication: SavedNarration) => "narration-abandoned:" + publication.readset.source.episodeId;
const abandonmentFingerprint = (publication: SavedNarration, submissionId: string) =>
  memoryHash([submissionId, publication.responseDigest, publication.raw, publication.readset]);

/** The caller checks this before preparing native effects on a recovered request. */
export function acceptedNarrationEpisode(state: VillageState, publication: SavedNarration, submissionId: string) {
  const prior = state.episodes.records.find(
    (row) =>
      row.id === publication.readset.source.episodeId || row.operationId === publication.readset.source.operationId,
  );
  if (prior)
    memoryRequire(
      prior.responseDigest === memoryHash([publication.responseDigest, publication.raw, publication.readset]) &&
        prior.submissionId === submissionId &&
        prior.privateInput === publication.readset.source.input,
      "accepted narration identity reused",
    );
  return prior;
}

export function narrationIsAbandoned(state: VillageState, publication: SavedNarration, submissionId: string) {
  const receipt = state.continuity.receipts[abandonmentKey(publication)];
  if (!receipt) return false;
  memoryRequire(
    receipt.fingerprint === abandonmentFingerprint(publication, submissionId) &&
      !receipt.roots.length &&
      !receipt.versions.length,
    "abandoned narration identity reused",
  );
  return true;
}

/** The existing root CAS orders acceptance against abandonment across activations. */
export function abandonNarration(state: VillageState, publication: SavedNarration, submissionId: string) {
  const accepted = acceptedNarrationEpisode(state, publication, submissionId);
  if (accepted) return accepted;
  const key = abandonmentKey(publication),
    fingerprint = abandonmentFingerprint(publication, submissionId);
  if (narrationIsAbandoned(state, publication, submissionId)) return undefined;
  memoryRequire(
    state.seed === publication.readset.source.seed && state.setupAt === publication.readset.setupAt,
    "narration world changed",
  );
  state.continuity = {
    ...state.continuity,
    revision: state.continuity.revision + 1,
    receipts: { ...state.continuity.receipts, [key]: { fingerprint, roots: [], versions: [] } },
  };
  return undefined;
}

/** One pure candidate for the existing Village CAS; the Scene remains the replay outbox. */
export function acceptNarrationContinuity(
  state: VillageState,
  publication: NarrationPublication,
  submissionId: string,
  acceptedAt: string,
) {
  const { readset, native } = publication;
  const digest = memoryHash([publication.responseDigest, publication.raw, readset]);
  // A lost acknowledgement must not rebase a committed request onto changed heads or incarnations.
  const prior = acceptedNarrationEpisode(state, publication, submissionId);
  if (prior) {
    return {
      held: false as const,
      episode: prior,
      rejected: prior.rejectedEffects ?? [],
      acceptedIds: [] as string[],
      replayed: true,
    };
  }
  memoryRequire(!narrationIsAbandoned(state, publication, submissionId), "this narration was explicitly abandoned");
  memoryRequire(
    state.seed === readset.source.seed && state.setupAt === readset.setupAt,
    "narration world or request identity changed",
  );
  memoryRequire(
    Object.values(native.sources).every((sources) => sources.length <= 8),
    "native command has too many evidence sources",
  );
  const scene = structuredClone(readset.source.scene),
    actors = [...readset.source.actors],
    arrivalDependencies: string[] = [];
  for (const arrival of native.admissions) {
    const id = Object.keys(native.receipts).find(
      (id) => native.receipts[id].kind === "npc" && native.receipts[id].targetId === arrival.npc.id,
    );
    memoryRequire(id && !actors.some((actor) => actor.id === arrival.npc.id), "arrival has no new native admission");
    const actor = continuityActor(state, arrival.npc.id);
    memoryRequire(actor, "arrival identity changed");
    actors.push(actor);
    arrivalDependencies.push(id);
  }
  admitNpcParticipants(scene, native.admissions);
  scene.pendingNpcAdmissions = native.admissions;
  if (scene.contactGeneration)
    scene.contactGeneration.actorIds = [
      ...new Set([
        ...(scene.contactGeneration.actorIds ?? scene.activeIds),
        ...native.admissions.map((row) => row.npc.id),
      ]),
    ];
  const reply = readNarrationReply(
    bindNpcReferences(publication.raw, native.admissions),
    scene.contactGeneration?.actorIds ?? scene.activeIds,
  );
  const movementDependencies = [
    ...new Set([
      ...(native.movementDependencies ?? []),
      ...[...native.moves, ...native.playerMoves].map((move) => move.effectId),
    ]),
  ];
  memoryRequire(
    movementDependencies.every((id) => native.effects.some((effect) => effect.id === id)),
    "movement has no owning native effect",
  );
  const source: NarrationSourceContext = {
    ...readset.source,
    scene,
    actors,
    ...narrationLines(
      reply,
      scene,
      readset.source.episodeId,
      readset.capturedAt,
      native.moves,
      native.playerMoves,
      readset.presentation,
    ),
    moves: [
      ...native.moves,
      ...native.playerMoves.map((move) => ({ characterId: "player", zoneId: move.zoneId, segment: move.segment })),
    ],
    native: Object.fromEntries(Object.entries(native.receipts).map(([id, receipt]) => ["native:" + id, receipt])),
  };
  memoryRequire(
    source.lines.length === reply.segments.length &&
      source.lines.every(
        (line, index) =>
          line.role === "assistant" &&
          line.content === reply.segments[index].text &&
          source.labels[reply.segments[index].id] === line.id,
      ),
    "routed narration changed its generated sources",
  );
  for (const actor of source.actors)
    memoryRequire(
      continuityActor(state, actor.id)?.incarnation === actor.incarnation,
      "narration actor incarnation changed",
    );
  memoryRequire(
    readset.source.actors.every((actor) =>
      source.actors.some((row) => continuityHolderKey(row) === continuityHolderKey(actor)),
    ),
    "an admitted narration actor was removed",
  );
  const provenance = readset.admission.provenance ?? {};
  const candidates = readset.npcCandidates.map((row) => {
    const arrival = native.admissions.find((arrival) => arrival.npc.id === row.npc.id),
      current = findNpc(state, row.npc.id),
      actor = continuityActor(state, row.npc.id);
    memoryRequire(
      current && actor?.incarnation === row.incarnation && memoryHash(current) === memoryHash(arrival?.npc ?? row.npc),
      "fitted NPC identity changed while narration was being prepared",
    );
    return actor;
  });
  const holders: ContinuityHolder[] = [
    ...readset.source.actors,
    ...(readset.admission.room ? [readset.admission.room] : []),
    ...candidates,
    ...episodeContextActors({ actors: readset.source.actors, room: readset.admission.room }, Object.keys(provenance)),
    ...episodeContextRooms({ actors: readset.source.actors, room: readset.admission.room }, Object.keys(provenance)),
  ];
  memoryRequire(
    readset.admission.protectionFingerprint === narrationProtectionFingerprint(state, holders),
    "continuity protection changed while narration was being prepared",
  );
  const blocked = Object.fromEntries(
    holders.map((holder) => [
      continuityHolderKey(holder),
      [...continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder))],
    ]),
  );
  // Even no-keep prose must not publish from a fitted meaning corrected while the model was answering.
  for (const holder of holders)
    assertContinuityProvenance(
      provenance[continuityHolderKey(holder)] ?? [],
      new Set(blocked[continuityHolderKey(holder)]),
    );
  if (reply.halt) {
    for (const ref of reply.halt.source) bindNarrationSource(ref, source);
    throw conflict(reply.halt.message);
  }
  const admission = { ...readset.admission, actors: source.actors, blockedSources: blocked, sources: [] };
  const effects = native.effects.map((effect) => ({ ...effect, requires: [...effect.requires] }));
  memoryRequire(effects.length === reply.commands.length, "native validation did not cover every proposed command");
  for (const [index, command] of reply.commands.entries()) {
    const header = readNarrationEffectHeader(command, "command-" + index);
    memoryRequire(effects[index].id === header.id, "native effect identity changed");
  }
  const prepared = new Map<string, ReturnType<typeof prepareNarrationKeep>>();
  for (const [index, raw] of reply.keep.entries()) {
    let header: ReturnType<typeof readNarrationEffectHeader>;
    try {
      header = readNarrationEffectHeader(raw, "keep-" + index);
    } catch (error) {
      effects.push({ id: "keep-" + index, requires: [], failure: String(error).slice(0, 2000) });
      continue;
    }
    const effect: SceneEffectResult = { ...header };
    try {
      const keep = prepareNarrationKeep(raw, index, state.continuity, admission, source);
      for (const holder of keep.write.holders.filter((holder) => holder.kind === "room")) {
        const scope = (venue: typeof source.venue) => {
          const zone = venue.zones?.find((row) => row.id === holder.zoneId);
          return (
            zone &&
            memoryHash([
              venueDesignHash(venue, [holder.zoneId]),
              venue.form ?? "",
              venue.buildProjectId ?? "",
              venue.constructionStatus ?? "",
              zone.description,
            ])
          );
        };
        const current = findLocation(state, holder.placeId);
        const zone = current && resolveVenueZone(current, holder.zoneId);
        memoryRequire(
          current && zone && !zoneClosed(state, current, zone) && scope(current) === scope(source.venue),
          "the Room's native structure or construction site changed",
        );
        const target = keep.write.target;
        if (target && (keep.write.retire || keep.write.room?.visibility === "concealed"))
          memoryRequire(
            !activeNarrativeConditions(state.narrative, readset.capturedAt).some(
              (condition) =>
                condition.venueId === holder.placeId &&
                condition.zoneId === holder.zoneId &&
                condition.restriction === "ordinary-use" &&
                condition.repairEntries?.includes(target.id),
            ),
            "a Room edit cannot remove an active restriction's repair target",
          );
      }
      const nativeDependencies = keep.sources
        .filter((row) => row.kind === "native" && row.episodeId === source.episodeId)
        .map((row) => {
          const id = Object.keys(native.receipts).find((id) => native.receipts[id].id === row.committedReceiptId);
          memoryRequire(id, "continuity cited an unvalidated native effect");
          return id;
        });
      effect.requires = [...new Set([...header.requires, ...nativeDependencies])];
      prepared.set(header.id, keep);
    } catch (error) {
      effect.failure = error instanceof Error ? error.message.slice(0, 2000) : String(error).slice(0, 2000);
    }
    effects.push(effect);
  }
  const damageRoots = new Map<string, string>();
  for (const effect of effects) {
    const damage = native.damage?.[effect.id];
    if (damage) {
      const room = admission.room!,
        roomKey = continuityHolderKey(room);
      const unit = native.sources[effect.id][0].unitId;
      for (const { id, root } of damage) {
        const keep = prepared.get(id),
          write = keep?.write;
        const head =
          write?.target && state.continuity.records.find((row) => row.id === write.target!.id)?.heads[roomKey];
        const before = head && state.continuity.versions.find((row) => row.id === head.versionId);
        if (
          !write?.text ||
          write.retire ||
          write.room?.expiresInMinutes ||
          write.room?.visibility === "concealed" ||
          !write.holders.some((holder) => continuityHolderKey(holder) === roomKey) ||
          (write.target &&
            (!head?.current ||
              before?.room?.visibility !== "observable" ||
              before.room.expiresAt ||
              before.closed ||
              before.text.trim() === write.text.trim())) ||
          !keep.sources.some(
            (proof) =>
              proof.kind === "observation" &&
              proof.episodeId === source.episodeId &&
              proof.unitId === unit &&
              proof.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
          )
        ) {
          effect.failure =
            "The local restriction needs changed enduring observable Room entries from the same Player-seen event.";
          break;
        }
        damageRoots.set(id, root);
      }
    }
    const repair = native.receipts[effect.id];
    if (repair?.kind !== "condition-repair") continue;
    const room = admission.room!,
      roomKey = continuityHolderKey(room),
      unit = native.sources[effect.id][0].unitId;
    const repaired = new Set(
      effect.requires.flatMap((id) => {
        const keep = prepared.get(id),
          write = keep?.write,
          target = write?.target;
        if (!write || !target || !write.holders.some((holder) => continuityHolderKey(holder) === roomKey)) return [];
        const head = state.continuity.records.find((row) => row.id === target.id)?.heads[roomKey];
        const before = state.continuity.versions.find((row) => row.id === head?.versionId);
        if (
          !before?.room ||
          before.room.visibility !== "observable" ||
          before.room.expiresAt ||
          before.closed ||
          write.room?.visibility === "concealed" ||
          !(write.retire === "ended" || (!write.retire && write.text && write.text.trim() !== before.text.trim())) ||
          !keep.sources.some(
            (proof) =>
              proof.kind === "observation" &&
              proof.episodeId === source.episodeId &&
              proof.unitId === unit &&
              proof.perceptions.some((row) => row.actorId === "player" && row.channel === "sight"),
          )
        )
          return [];
        return [target.id];
      }),
    );
    if (!repair.repairEntries!.every((id) => repaired.has(id)))
      effect.failure = "The completed repair needs every linked Room entry changed by the same observed work.";
  }
  let continuity: ContinuityCollection = state.continuity;
  let selection: ReturnType<typeof selectSceneEffects>;
  for (;;) {
    selection = selectSceneEffects(effects, [
      ...reply.assertedDependencies,
      ...arrivalDependencies,
      ...movementDependencies,
    ]);
    if (selection.held) return { ...selection, episode: undefined };
    continuity = state.continuity;
    let failed = false;
    const essential = new Set([
      ...reply.assertedDependencies,
      ...arrivalDependencies,
      ...movementDependencies,
      ...effects.filter((effect) => !effect.independent).map((effect) => effect.id),
    ]);
    for (const id of essential)
      for (const required of effects.find((effect) => effect.id === id)?.requires ?? []) essential.add(required);
    const ordered = selection.acceptedIds.toSorted((a, b) => Number(essential.has(b)) - Number(essential.has(a)));
    const checked: ContinuityEvidence[] = [];
    for (const id of ordered) {
      const sources = [...(prepared.get(id)?.sources ?? []), ...(native.sources[id] ?? [])];
      try {
        assertNarrationSourceOrder([...checked, ...sources]);
        checked.push(...sources);
      } catch {
        effects.find((effect) => effect.id === id)!.failure =
          "Consequential input excerpts contradict the accepted source order.";
        failed = true;
      }
    }
    if (failed) continue;
    for (const id of ordered) {
      const keep = prepared.get(id);
      try {
        if (keep) {
          const next = applyContinuityWrite(continuity, keep.write, keep.admission);
          const root = damageRoots.get(id);
          if (root) {
            const saved = next.receipts[keep.admission.operationId + ":" + id];
            const head = next.records.find((row) => row.id === root)?.heads[continuityHolderKey(admission.room!)];
            const version = next.versions.find((row) => row.id === head?.versionId);
            memoryRequire(
              saved?.roots[0] === root &&
                head?.current &&
                saved.versions.includes(head.versionId) &&
                version?.room?.visibility === "observable" &&
                !version.room.expiresAt &&
                !version.closed,
              "the selected Room damage lost its exact enduring Room entry",
            );
          }
          continuity = next;
        }
        const receipt = native.receipts[id];
        if (receipt && ["circumstance", "access"].includes(receipt.kind) && receipt.witnesses.length) {
          const evidence = bindNarrationSource("native:" + id, source);
          continuity = applyContinuityWrite(
            continuity,
            {
              id: "native-" + memoryHash(id).slice(0, 32),
              holders: source.actors.filter((actor) => receipt.witnesses.includes(actor.id)),
              class: "experience",
              current: false,
              text: receipt.text,
              sourceIds: [evidence.id],
            },
            { ...admission, protectedRoots: [], sources: [evidence], supplied: [] },
          );
        }
      } catch (error) {
        effects.find((effect) => effect.id === id)!.failure =
          error instanceof Error ? error.message.slice(0, 2000) : String(error).slice(0, 2000);
        failed = true;
      }
    }
    if (!failed) break;
  }
  const acceptedKeeps = selection.acceptedIds.flatMap((id) => (prepared.has(id) ? [prepared.get(id)!] : []));
  memoryRequire(
    native.effects
      .filter((effect) => selection.acceptedIds.includes(effect.id))
      .every((effect) => native.receipts[effect.id]),
    "accepted native command lacks its authoritative receipt",
  );
  for (const move of [...native.moves, ...native.playerMoves]) {
    const receipt = native.receipts[move.effectId];
    const actorId = "characterId" in move && typeof move.characterId === "string" ? move.characterId : "player";
    memoryRequire(
      receipt &&
        receipt.witnesses.includes(actorId) &&
        ((receipt.kind === "movement" && receipt.targetId === move.zoneId) ||
          (receipt.kind === "departure" && receipt.targetId === actorId && move.zoneId === "")),
      "movement changed its native receipt scope",
    );
  }
  const commandReceipts = selection.acceptedIds.flatMap((id) => (native.receipts[id] ? [native.receipts[id]] : []));
  const sceneEffects = (native.sceneEffects ?? []).filter((effect) => selection.acceptedIds.includes(effect.effectId));
  memoryRequire(
    sceneEffects.every(
      (effect) =>
        native.receipts[effect.effectId] &&
        ["contact", "scene", "movement", "departure", "npc"].includes(native.receipts[effect.effectId].kind),
    ),
    "Scene effect lost its native command",
  );
  const currentSources = [
    ...Object.values(source.historical).filter((row) => row.kind === "knowledge"),
    ...acceptedKeeps.flatMap((keep) => keep.sources),
    ...selection.acceptedIds.flatMap((id) => native.sources[id] ?? []),
    ...selection.acceptedIds
      .filter((id) => native.receipts[id])
      .map((id) => bindNarrationSource("native:" + id, source)),
  ].filter((row) => row.episodeId === source.episodeId);
  const grounding = new Map<string, ContinuityEvidence>();
  for (const row of currentSources) {
    const prior = grounding.get(row.id);
    memoryRequire(!prior || memoryHash(prior) === memoryHash(row), "conflicting accepted source identity");
    grounding.set(row.id, row);
  }
  const versions = continuity.versions.slice(state.continuity.versions.length);
  const holderDependencies: NonNullable<AcceptedEpisode["holderDependencies"]> = {};
  for (const holder of holders) {
    const key = continuityHolderKey(holder),
      units = provenance[key] ?? [];
    if (!units.length && !source.actors.some((actor) => continuityHolderKey(actor) === key) && holder.kind !== "room")
      continue;
    holderDependencies[key] = Object.fromEntries(source.lines.map((line) => [line.id, [...units]]));
  }
  for (const version of versions) {
    for (const holder of holders.filter(
      (holder) => holder.kind === "room" && provenance[continuityHolderKey(holder)]?.length,
    ))
      (holderDependencies[continuityHolderKey(holder)] ??= {})["version:" + version.id] =
        provenance[continuityHolderKey(holder)];
    const record = continuity.records.find((record) => record.id === version.rootId)!;
    for (const head of Object.values(record.heads).filter((head) => head.versionId === version.id)) {
      const key = continuityHolderKey(head.holder),
        own = (holderDependencies[key] ??= {});
      own["version:" + version.id] = [
        ...new Set([
          ...(provenance[key] ?? []),
          ...version.sources.filter((row) => row.kind !== "self").map(continuitySourceUnit),
        ]),
      ];
    }
  }
  const dependencies = Object.fromEntries(
    selection.acceptedIds
      .filter((id) => native.receipts[id])
      .map((id) => ["native:" + native.receipts[id].id, (native.sources[id] ?? []).map(continuitySourceUnit)]),
  );
  const episode: AcceptedEpisode = {
    format: 1,
    id: source.episodeId,
    seed: state.seed,
    sceneId: source.scene.id,
    submissionId,
    operationId: source.operationId,
    capturedAt: readset.capturedAt,
    acceptedAt,
    responseDigest: digest,
    admittedContinuityRevision: readset.continuityRevision,
    privateInput: source.input,
    actors: source.actors.map((actor) => ({
      id: actor.id,
      incarnation: actor.incarnation,
      zoneId:
        actor.id === "player" ? source.scene.zoneId! : contactPosition(source.scene, actor.id) || source.scene.zoneId!,
    })),
    segments: source.lines,
    grounding: [...grounding.values()],
    continuityVersionIds: versions.map((row) => row.id),
    ...(selection.rejected.length ? { rejectedEffects: selection.rejected } : {}),
    offered: [
      ...readset.offered,
      ...readset.npcCandidates
        .filter((row) => native.admissions.some((arrival) => arrival.npc.id === row.npc.id))
        .map((row) => ({ holder: source.actors.find((actor) => actor.id === row.npc.id)!, ids: row.offered })),
    ],
    commandReceipts,
    ...(sceneEffects.length
      ? {
          sceneDelta: {
            expectedRevision: readset.sceneRevision,
            contactEndedIds: [...new Set(sceneEffects.flatMap((effect) => effect.contactEndedIds))],
            ...(sceneEffects.some((effect) => effect.closed) ? { closed: true as const } : {}),
            receiptIds: sceneEffects.map((effect) => native.receipts[effect.effectId].id),
          },
        }
      : {}),
    dependencies,
    holderDependencies,
    ...(readset.admission.room ? { room: readset.admission.room } : {}),
  };
  const episodes = appendEpisode(state.episodes, episode, state.seed);
  assertContinuityRetention(continuity, episodes);
  state.continuity = continuity;
  state.episodes = episodes;
  return { ...selection, episode: episodes.records.at(-1)! };
}
