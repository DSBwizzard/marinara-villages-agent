import type { ContinuityEvidence, ContinuityHolder, ContinuityTarget } from "../models/continuity-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import { narrationResidenceContext } from "./narration-residence.js";
import { narrationPlaceContext } from "./narration-place.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { coerceSession } from "../decoding/scene-codec.js";
import { episodeSourceGraph, episodeUnit } from "../decoding/episode-codec.js";
import { continuityActor } from "./continuity-actors.js";
import {
  actorContinuityEvidence,
  continuityHolderKey,
  continuityKnowledge,
  continuityProtectionUnits,
  continuitySourceUnit,
  continuityVersionUnit,
  continuityViews,
  continuityGuidesHolder,
  continuityConstraints,
  continuityProtectionFingerprint,
} from "./continuity.js";
import { selectActorContinuity, selectRoomContinuity } from "./continuity-retrieval.js";
import { actorEpisodeView, recentSharedEpisodes, recallEpisodeSpeech, selectEpisodeHistory } from "./episodes.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { estimatedTextTokens } from "./text-recall.js";
import type { VenueWritingBlock } from "./venue-writing.js";
import { projectSpeechContexts } from "./project-interpretation.js";
import { sceneContinuityView } from "./scene-continuity.js";
import { narrationAccessScopes } from "./narration-access.js";
import { capturedSceneCalendar } from "./scene-calendar.js";
import { episodeContextActors } from "./episode-sources.js";
import { capturePlaceContext, npcProfile } from "./places.js";
import { offerSceneNarrative } from "./scene-narrative.js";
import { nativeCircumstanceRoots } from "./native-continuity.js";

type Part = {
  block: VenueWritingBlock;
  targets: ContinuityTarget[];
  sources: Record<string, ContinuityEvidence>;
  provenance: Record<string, string[]>;
  episodeIds: string[];
  offered: NarrationReadset["offered"];
};

export function narrationProtectionFingerprint(state: VillageState, holders: ContinuityHolder[]) {
  return continuityProtectionFingerprint(
    state.continuity,
    [...new Map(holders.map((holder) => [continuityHolderKey(holder), holder])).entries()]
      .sort(([a], [b]) => a.localeCompare(b, "en"))
      .map(([, holder]) => holder),
  );
}

function mergeTargets(targets: ContinuityTarget[]) {
  const rows = new Map<string, ContinuityTarget>();
  for (const target of targets) {
    const prior = rows.get(target.id);
    memoryRequire(!prior || prior.recordRevision === target.recordRevision, "conflicting fitted continuity revision");
    rows.set(target.id, { ...target, heads: { ...prior?.heads, ...target.heads } });
  }
  return [...rows.values()];
}

/** Native circumstances only: a request checkpoint never duplicates the growing Scene transcript. */
function sourceScene(scene: VenueScene) {
  const snapshot = coerceSession({
    version: 5,
    id: scene.id,
    sceneRevision: scene.sceneRevision,
    villageSeed: scene.villageSeed,
    placeId: scene.placeId,
    placeName: scene.placeName,
    zoneId: scene.zoneId,
    spaceClass: scene.spaceClass,
    area: scene.area,
    privateOwnerId: scene.privateOwnerId,
    privateAccessOwnerId: scene.privateAccessOwnerId,
    startedAt: scene.startedAt,
    openingGatheringId: scene.openingGatheringId,
    lastActivityAt: scene.lastActivityAt,
    status: scene.status,
    participants: scene.participants,
    activeIds: scene.activeIds,
    sceneAttendance: scene.sceneAttendance,
    departedIds: scene.departedIds,
    accompanying: scene.accompanying,
    doorwayContacts: scene.doorwayContacts,
    accessPreviousZones: scene.accessPreviousZones,
    enteredFromZoneId: scene.enteredFromZoneId,
  });
  snapshot.contactGeneration = scene.contactGeneration && structuredClone(scene.contactGeneration);
  return snapshot;
}

/** Complete private entries and exchanges; aliases become authority only if their entire block survives fitting. */
export function narrationContinuityContext(
  state: VillageState,
  scene: VenueScene,
  venue: VillageVenue,
  operationId: string,
  input: string,
  at: string,
) {
  memoryRequire(state.seed === scene.villageSeed && scene.zoneId, "Scene continuity scope changed");
  const episodeId = "episode-" + memoryHash([state.seed, scene.id, operationId]).slice(0, 32);
  const actors = [
    ...new Set([
      "player",
      ...(scene.sceneAttendance?.occupants ?? []).map((row) => row.characterId),
      ...scene.activeIds,
    ]),
  ]
    .filter((id) => !scene.departedIds?.includes(id))
    .map((id) => {
      const holder = continuityActor(state, id);
      memoryRequire(holder, "captured Scene actor no longer has an identity");
      const captured = scene.continuity?.facts.villagers.find((row) => row.characterId === id);
      memoryRequire(!captured || captured.incarnation === holder.incarnation, "captured resident incarnation changed");
      return holder;
    });
  memoryRequire(actors.length <= 32, "the complete Scene witness roster exceeds the retained episode bound");
  const writerIds = scene.contactGeneration?.actorIds ?? scene.activeIds;
  const npcCandidates = Object.values(
    capturePlaceContext(
      state,
      scene.placeId,
      actors.map((actor) => actor.id),
    ).npcs,
  )
    .filter((npc) => !actors.some((actor) => actor.id === npc.id))
    .sort(
      (a, b) =>
        Number(input.toLocaleLowerCase("en-US").includes(b.name.toLocaleLowerCase("en-US"))) -
        Number(input.toLocaleLowerCase("en-US").includes(a.name.toLocaleLowerCase("en-US"))),
    )
    .slice(0, 4)
    .map((npc) => ({ npc, holder: continuityActor(state, npc.id)! }));
  const holders = [
    ...actors.filter((holder) => holder.id === "player" || writerIds.includes(holder.id)),
    ...npcCandidates.map((row) => row.holder),
  ];
  const room: Extract<ContinuityHolder, { kind: "room" }> = {
    kind: "room",
    placeId: scene.placeId,
    zoneId: scene.zoneId,
  };
  const views = holders.flatMap((holder) =>
    continuityViews(
      state.continuity,
      holder,
      at,
      continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder)),
    ),
  );
  // Required entries have no heuristic token ceiling; the Engine must fit them intact before purchase.
  const capacity = Buffer.byteLength(JSON.stringify(state.continuity)) * 2 + 1024;
  const circumstances = (state.narrative?.situations ?? [])
    .filter(
      (row) =>
        row.status === "active" &&
        (row.scope === "village" ||
          row.targets.some((target) => target.venueId === scene.placeId && target.zoneId === scene.zoneId)),
    )
    .map((situation) => {
      const episode = state.episodes.records.findLast((episode) =>
        episode.commandReceipts.some(
          (receipt) =>
            receipt.kind === "circumstance" &&
            receipt.targetId === situation.id &&
            receipt.revision === situation.revision &&
            (receipt.circumstance?.summary ?? receipt.text) === situation.summary,
        ),
      );
      memoryRequire(episode, "current circumstance has no canonical continuity source");
      const receipt = episode.commandReceipts.find(
        (receipt) =>
          receipt.kind === "circumstance" &&
          receipt.targetId === situation.id &&
          receipt.revision === situation.revision &&
          (receipt.circumstance?.summary ?? receipt.text) === situation.summary,
      )!;
      const roots = episode.continuityVersionIds
        .map((id) => state.continuity.versions.find((version) => version.id === id)!)
        .filter((version) =>
          version.sources.some((source) => source.episodeId === episode.id && source.committedReceiptId === receipt.id),
        )
        .map((version) => version.rootId);
      return { situation, episode, receipt, roots };
    });
  const circumstanceRoots = new Set(circumstances.flatMap(({ roots }) => roots));
  const requiredRoots = nativeCircumstanceRoots(state, at, views, { placeId: scene.placeId, zoneId: scene.zoneId });
  const actorSelection = selectActorContinuity(state.continuity, state.episodes, holders, at, {
    query: input,
    bytes: capacity,
    identity: (id) => continuityActor(state, id),
    requiredIds: [...requiredRoots].filter((id) => views.some((view) => view.id === id)),
  });
  const roomSelection = selectRoomContinuity(state.continuity, state.episodes, room, at, {
    query: input,
    bytes: capacity,
    requiredIds: [],
    wholeRoom:
      /\b(all|every|entire|whole|everything)\b/iu.test(input) &&
      /\b(room|furniture|decor|walls|inside|interior)\b/iu.test(input),
  });
  const parts: Part[] = [];
  let alias = 0;
  const sourceAlias = () => "h:" + ++alias;
  const emptyPart = (): Omit<Part, "block"> => ({
    targets: [],
    sources: {},
    provenance: {},
    episodeIds: [],
    offered: [],
  });
  const requiredKey = (target: ContinuityTarget, holderKey: string) =>
    actorSelection.required.some((row) => row.id === target.id && Object.hasOwn(row.heads, holderKey));
  for (const { npc } of npcCandidates)
    parts.push({
      ...emptyPart(),
      block: {
        text: JSON.stringify({
          npcArrivalCandidate: {
            id: npc.id,
            profile: npcProfile(npc),
            presence:
              "Not present. Private continuity/history is for this person only; an observed npc.admit is required before speech, hearing or Scene participation.",
          },
        }),
        evidenceId: "npc-candidate:" + npc.id,
      },
    });
  const emitted = new Set<string>();
  for (const { situation, episode, receipt, roots: rootIds } of circumstances) {
    const roots = new Set(rootIds);
    const groups = new Map<
      string,
      { text: string; knownFor: { actorId: string; source: string }[]; part: Omit<Part, "block"> }
    >();
    for (const view of views.filter((view) => roots.has(view.id))) {
      const key = continuityHolderKey(view.holder),
        source = continuityKnowledge(view, state.seed, episodeId),
        ref = sourceAlias();
      const groupId = JSON.stringify([view.id, view.version.text]);
      const group = groups.get(groupId) ?? { text: view.version.text, knownFor: [], part: emptyPart() };
      group.knownFor.push({ actorId: view.holder.kind === "actor" ? view.holder.id : "", source: ref });
      group.part.sources[ref] = source;
      if (view.current && view.holder.kind === "actor" && view.holder.id !== "player")
        group.part.offered.push({ holder: view.holder, ids: [view.id] });
      (group.part.provenance[key] ??= []).push(continuitySourceUnit(source));
      group.part.targets.push({
        id: view.id,
        recordRevision: view.recordRevision,
        heads: { [key]: view.headRevision },
      });
      group.part.episodeIds.push(episode.id, ...view.version.sources.map((source) => source.episodeId));
      groups.set(groupId, group);
    }
    for (const [key, group] of groups)
      parts.push({
        ...group.part,
        block: {
          text: JSON.stringify({
            currentCircumstance: {
              id: situation.id,
              scope: situation.scope,
              targets: situation.targets,
              text: group.text,
              knownFor: group.knownFor,
            },
          }),
          evidenceId: "circumstance-context:" + memoryHash([episode.id, receipt.id, key]),
        },
      });
    if (!groups.size) {
      const source = episode.grounding.find((source) => source.committedReceiptId === receipt.id)!;
      memoryRequire(source, "current circumstance has no native evidence");
      const unit = continuitySourceUnit(source),
        owners = [...actors, room];
      if (
        owners.some((holder) =>
          continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder)).has(
            unit,
          ),
        )
      )
        continue;
      parts.push({
        ...emptyPart(),
        episodeIds: [episode.id],
        provenance: Object.fromEntries(owners.map((holder) => [continuityHolderKey(holder), [unit]])),
        block: {
          text: JSON.stringify({
            privateWorldCircumstance: {
              id: situation.id,
              scope: situation.scope,
              targets: situation.targets,
              text: receipt.text,
              knowledge: "GM context only; no character audience",
            },
          }),
          evidenceId: "circumstance-context:" + memoryHash([episode.id, receipt.id]),
        },
      });
    }
  }
  for (const entry of actorSelection.packet.entries) {
    if (circumstanceRoots.has(entry.id)) continue;
    const holder = holders.find((row) => row.id === entry.for)!,
      key = continuityHolderKey(holder);
    if (emitted.has(JSON.stringify([key, entry.id]))) continue;
    const root = entry.parent ?? entry.id;
    const related = actorSelection.packet.entries.filter(
      (row) => row.for === entry.for && (row.id === root || row.parent === root),
    );
    memoryRequire(
      related.some((row) => row.id === root),
      "fitted continuity facet lost its complete parent",
    );
    const requiredRows = related.filter((row) =>
      actorSelection.required.some((target) => target.id === row.id && Object.hasOwn(target.heads, key)),
    );
    const group = requiredRows.length ? (requiredRows.includes(entry) ? requiredRows : [entry]) : related;
    const part = emptyPart(),
      entries = group
        .filter((row) => !emitted.has(JSON.stringify([key, row.id])))
        .map((row) => {
          emitted.add(JSON.stringify([key, row.id]));
          const view = views.find((view) => view.id === row.id && continuityHolderKey(view.holder) === key)!;
          const source = continuityKnowledge(view, state.seed, episodeId),
            ref = sourceAlias();
          part.sources[ref] = source;
          (part.provenance[key] ??= []).push(continuitySourceUnit(source));
          part.targets.push({ id: view.id, recordRevision: view.recordRevision, heads: { [key]: view.headRevision } });
          for (const episode of state.episodes.records)
            if (episode.continuityVersionIds.includes(view.version.id)) part.episodeIds.push(episode.id);
          part.episodeIds.push(...view.version.sources.map((source) => source.episodeId));
          if (row.current && holder.id !== "player" && continuityGuidesHolder(view))
            part.offered.push({ holder, ids: [row.id] });
          return { ...row, source: ref };
        });
    const required = part.targets.some((target) => requiredKey(target, key));
    parts.push({
      ...part,
      block: {
        text: JSON.stringify({ privateContinuity: entries }),
        evidenceId: "actor-context:" + parts.length,
        ...(!required ? { optional: "memory" as const } : {}),
      },
    });
  }
  for (const entry of roomSelection.packet.entries) {
    const target = roomSelection.supplied.find((row) => row.id === entry.id)!;
    const versionId = state.continuity.records.find((row) => row.id === entry.id)!.heads[continuityHolderKey(room)]
      .versionId;
    const required = roomSelection.required.some((row) => row.id === entry.id);
    parts.push({
      ...emptyPart(),
      targets: [target],
      provenance: { [continuityHolderKey(room)]: [continuityVersionUnit(versionId)] },
      block: {
        text: JSON.stringify({ roomEntry: entry }),
        evidenceId: "room-context:" + entry.id,
        ...(!required ? { optional: "memory" as const } : {}),
      },
    });
  }
  parts.push({
    ...emptyPart(),
    block: {
      text: JSON.stringify({
        roomContinuity: {
          placeId: room.placeId,
          zoneId: room.zoneId,
          total: roomSelection.packet.total,
          complete: roomSelection.required.length === roomSelection.packet.total,
          selection:
            roomSelection.required.length === roomSelection.packet.total
              ? "complete"
              : "selective; omitted entries remain current",
        },
      }),
    },
  });
  const shared = new Set(recentSharedEpisodes(state.episodes, holders).map((row) => row.id));
  const history = selectEpisodeHistory(state.episodes, state.continuity, holders, input, 32000);
  const contextScopes = new Map(
    [...actors, ...npcCandidates.map((row) => row.holder)].map((holder) => [holder.id, holder.incarnation]),
  );
  for (const view of history.episodes) {
    const episode = state.episodes.records.find((row) => row.id === view.id)!,
      part = emptyPart();
    part.episodeIds.push(episode.id);
    const aliases: { ref: string; holder: string; evidence: ContinuityEvidence }[] = [];
    for (const holder of holders) {
      const own = actorEpisodeView(episode, state.continuity, holder, state.episodes);
      if (!own) continue;
      const eligible = episode.grounding.flatMap((source) => {
        try {
          const projected = actorContinuityEvidence(source, holder.id);
          return own.input.some((row) => row.id === source.id) ||
            own.segments.some(
              (row) =>
                row.id === source.unitId &&
                row.text === projected.excerpt &&
                row.channel === projected.perceptions[0]?.channel,
            )
            ? [projected]
            : [];
        } catch {
          return [];
        }
      });
      for (const segment of own.segments)
        if (!eligible.some((source) => source.unitId === segment.id)) {
          const source = recallEpisodeSpeech(episode, segment.id, state.continuity, holder, state.episodes);
          if (source) eligible.push(source);
        }
      const key = continuityHolderKey(holder);
      part.provenance[key] = [
        ...new Set([
          ...eligible.map(continuitySourceUnit),
          ...own.segments
            .filter(
              (row) =>
                row.channel !== "sound-only" &&
                episode.segments.some((line) => line.id === row.id && line.content === row.text),
            )
            .map((row) => episodeUnit(episode, row.id)),
        ]),
      ];
      for (const source of eligible) {
        const ref = sourceAlias();
        part.sources[ref] = source;
        aliases.push({ ref, holder: holder.id, evidence: source });
      }
    }
    const segments = view.segments.flatMap((line) => {
      if (!("gmOnlyText" in line)) return [line];
      const scopes = [...episode.actors, ...episodeContextActors(episode)].filter(
        (holder) => episode.holderDependencies?.[continuityHolderKey({ kind: "actor", ...holder })]?.[line.id]?.length,
      );
      if (
        scopes.some((holder) => {
          const incarnation = contextScopes.get(holder.id) ?? continuityActor(state, holder.id)?.incarnation;
          return incarnation && incarnation !== holder.incarnation;
        })
      ) {
        const perceived = { ...line };
        delete perceived.gmOnlyText;
        return line.projections.length ? [perceived] : [];
      }
      for (const holder of scopes) {
        contextScopes.set(holder.id, holder.incarnation);
        const key = continuityHolderKey({ kind: "actor", ...holder });
        (part.provenance[key] ??= []).push(episodeUnit(episode, line.id));
      }
      return [line];
    });
    const gmUnits = [
      ...("text" in view.gmPrivateInput ? [episodeUnit(episode, "input")] : []),
      ...segments.filter((row) => "gmOnlyText" in row).map((row) => episodeUnit(episode, row.id)),
    ];
    for (const holder of holders.filter((holder) =>
      actors.some((actor) => continuityHolderKey(actor) === continuityHolderKey(holder)),
    )) {
      const key = continuityHolderKey(holder);
      part.provenance[key] = [...new Set([...(part.provenance[key] ?? []), ...gmUnits])];
    }
    const sourceRefs = (holder: string, unit: string, text: string) =>
      aliases
        .filter((row) => row.holder === holder && row.evidence.unitId === unit && row.evidence.excerpt === text)
        .map(({ ref, evidence }) => ({ ref, ...(evidence.act ? { act: evidence.act } : {}) }));
    const interaction = {
      ...view,
      groundedInput: view.groundedInput.map((row) => ({
        ...row,
        source: aliases
          .filter((alias) => alias.holder === row.for && alias.evidence.id === row.id)
          .map((alias) => alias.ref),
      })),
      segments: segments.map((row) => ({
        ...row,
        perceivedBy: Object.fromEntries(
          Object.entries(row.perceivedBy).map(([id, channel]) => [
            id,
            { channel, source: sourceRefs(id, row.id, "text" in row ? row.text : "") },
          ]),
        ),
        projections: row.projections.map((projection) => ({
          ...projection,
          source: sourceRefs(projection.for, row.id, projection.text),
        })),
      })),
    };
    parts.push({
      ...part,
      block: {
        text: JSON.stringify({ interaction }),
        evidenceId: "episode-context:" + view.id,
        optional: "history",
        pruningPriority: shared.has(view.id) ? 1 : 0,
      },
    });
  }
  // Soft envelopes borrow unused capacity; required context is tested only by the actual model fitter.
  let standingTokens = 0,
    recentTokens = 0,
    olderTokens = 0;
  const selectionOrder = [
    ...parts.filter((part) => !part.block.optional),
    ...parts
      .filter((part) => part.block.optional === "memory")
      .sort(
        (a, b) =>
          Number(b.block.evidenceId?.startsWith("room-context:")) -
          Number(a.block.evidenceId?.startsWith("room-context:")),
      ),
    ...parts
      .filter((part) => part.block.optional === "history")
      .toReversed()
      .sort((a, b) => (b.block.pruningPriority ?? 0) - (a.block.pruningPriority ?? 0)),
  ];
  const retained = new Set(
    selectionOrder.filter((part) => {
      if (!part.block.optional) return true;
      const tokens = estimatedTextTokens(part.block.text);
      if (part.block.optional === "memory") {
        if (standingTokens + tokens > 4000) return false;
        standingTokens += tokens;
        return true;
      }
      if (part.block.pruningPriority) {
        if (standingTokens + recentTokens + olderTokens + tokens > 8000) return false;
        recentTokens += tokens;
        return true;
      }
      if (standingTokens + recentTokens + olderTokens + tokens > 8000) return false;
      olderTokens += tokens;
      return true;
    }),
  );
  const bounded = parts.filter((part) => retained.has(part));
  const references = episodeContextActors({ actors, room }, [
    ...new Set(bounded.flatMap((part) => Object.keys(part.provenance))),
  ]);
  const protections = continuityConstraints(state.continuity, [
    ...new Map(
      [...actors, room, ...npcCandidates.map((row) => row.holder), ...references].map((holder) => [
        continuityHolderKey(holder),
        holder,
      ]),
    ).values(),
  ]);
  return {
    episodeId,
    actors,
    npcCandidates,
    circumstance: offerSceneNarrative(
      state,
      scene,
      "circumstance-" + memoryHash([state.seed, scene.id, operationId]).slice(0, 32),
      new Date(at),
    ),
    calendar: capturedSceneCalendar({ startedAt: at }, state.timeZone),
    holders,
    room,
    at,
    parts: bounded,
    projects: projectSpeechContexts(sceneContinuityView(state, scene), writerIds, "", input, scene.placeId),
    access: narrationAccessScopes(sceneContinuityView(state, scene), ["player", ...writerIds]),
    residence: narrationResidenceContext(sceneContinuityView(state, scene), ["player", ...writerIds]),
    places: narrationPlaceContext(sceneContinuityView(state, scene), ["player", ...writerIds]),
    protections,
    source: {
      seed: state.seed,
      episodeId,
      operationId,
      input,
      actors,
      scene: sourceScene(scene),
      venue: structuredClone(venue),
      historical: {},
    } satisfies NarrationReadset["source"],
  };
}

/** Called after Engine fitting, never before: only surviving evidence may be cited, changed or counted as offered. */
export function fittedNarrationReadset(
  state: VillageState,
  context: ReturnType<typeof narrationContinuityContext>,
  evidenceIds: string[],
): NarrationReadset {
  const parts = context.parts.filter((part) => evidenceIds.includes(part.block.evidenceId!));
  const historical = Object.assign({}, ...parts.map((part) => part.sources)) as Record<string, ContinuityEvidence>;
  // Reserve the remaining episode slots for 32 keeps, 16 command proofs and their native receipts.
  memoryRequire(
    Object.values(historical).filter((source) => source.kind === "knowledge").length <= 1024 - 32 * 8 - 16 * 8 - 16,
    "required continuity evidence exceeds the retained request bound before generation",
  );
  const provenance: Record<string, string[]> = {};
  for (const part of parts)
    for (const [holder, units] of Object.entries(part.provenance))
      provenance[holder] = [...new Set([...(provenance[holder] ?? []), ...units])];
  const offered = new Map<string, NarrationReadset["offered"][number]>();
  for (const part of parts)
    for (const row of part.offered) {
      const key = continuityHolderKey(row.holder),
        prior = offered.get(key);
      offered.set(key, { holder: row.holder, ids: [...new Set([...(prior?.ids ?? []), ...row.ids])] });
    }
  const protectedRoots = [...new Set(context.protections.map((row) => row.id))];
  const subjectIds = new Set([
    ...state.villagers.map((row) => row.characterId),
    ...context.actors.map((row) => row.id),
    ...context.npcCandidates.map((row) => row.npc.id),
    ...parts.flatMap((part) =>
      part.targets.flatMap((target) =>
        Object.keys(target.heads).flatMap((key) => {
          const record = state.continuity.records.find((row) => row.id === target.id)!,
            version = state.continuity.versions.find((row) => row.id === record.heads[key]?.versionId);
          return [...(version?.about.map((row) => row.id) ?? []), ...(record.owner ? [record.owner.id] : [])];
        }),
      ),
    ),
  ]);
  const subjects = [...subjectIds].flatMap((id) => {
    const actor = continuityActor(state, id);
    return actor ? [{ id: actor.id, incarnation: actor.incarnation }] : [];
  });
  memoryRequire(
    subjects.length <= 256,
    "required subject identity scope exceeds the retained request bound before generation",
  );
  const references = episodeContextActors({ actors: context.actors, room: context.room }, Object.keys(provenance));
  const candidates = context.npcCandidates.filter((row) => evidenceIds.includes("npc-candidate:" + row.npc.id));
  return {
    format: 1,
    setupAt: state.setupAt,
    capturedAt: context.at,
    calendar: context.calendar,
    sceneRevision: context.source.scene.sceneRevision,
    continuityRevision: state.continuity.revision,
    source: { ...context.source, historical, subjects },
    admission: {
      seed: state.seed,
      operationId: context.source.operationId,
      episodeId: context.episodeId,
      at: context.at,
      actors: context.actors.map(({ id, incarnation }) => ({ id, incarnation })),
      subjects,
      room: context.room,
      continuityRevision: state.continuity.revision,
      sourceActors: Object.fromEntries(
        [...new Set(parts.flatMap((part) => part.episodeIds))].map((id) => [
          id,
          state.episodes.records
            .find((row) => row.id === id)!
            .actors.map(({ id, incarnation }) => ({ id, incarnation })),
        ]),
      ),
      supplied: mergeTargets(parts.flatMap((part) => part.targets)),
      protectedRoots,
      protectionFingerprint: narrationProtectionFingerprint(state, [
        ...context.actors,
        context.room,
        ...candidates.map((row) => row.holder),
        ...references,
      ]),
      provenance,
    },
    offered: [...offered.values()].filter((row) => context.actors.some((actor) => actor.id === row.holder.id)),
    circumstance: context.circumstance,
    npcCandidates: candidates.map(({ npc, holder }) => ({
      npc,
      incarnation: holder.incarnation,
      offered: offered.get(continuityHolderKey(holder))?.ids ?? [],
    })),
    projects: context.projects,
    access: context.access,
    residence: context.residence,
    places: context.places,
  };
}
