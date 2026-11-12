import { compactSceneExchange, projectEpisodeRecall } from "./episode-recall.js";
import { readOnlyRoomContext } from "./continuity-context.js";
import type { ContinuityEvidence, ContinuityHolder, ContinuityTarget } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import { narrationResidenceContext } from "./narration-residence.js";
import { narrationPlaceContext } from "./narration-place.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { coerceSession } from "../decoding/scene-codec.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import { continuityActor } from "./continuity-actors.js";
import {
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
import { appendHistoryWithin, selectEpisodeHistory } from "./episodes.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { estimatedTextTokens, recallTerms } from "./text-recall.js";
import { hasWritingEvidence, type VenueWritingBlock } from "./venue-writing.js";
import { projectSpeechContexts, projectSpeechPrompt } from "./project-interpretation.js";
import { sceneContinuityView } from "./scene-continuity.js";
import { narrationAccessScopes } from "./narration-access.js";
import { capturedSceneCalendar } from "./scene-calendar.js";
import {
  circumstanceRoomOrigins,
  episodeContextActors,
  episodeContextRooms,
  sceneEpisodeId,
} from "./episode-sources.js";
import { capturePlaceContext, npcProfile } from "./places.js";
import { offerSceneNarrative } from "./scene-narrative.js";
import { nativeCircumstanceRoots } from "./native-continuity.js";
import { sceneRepairOffers } from "./narration-circumstance.js";
import { sceneSpriteSelection } from "./sprite-expressions.js";

type Part = {
  block: VenueWritingBlock;
  targets: ContinuityTarget[];
  sources: Record<string, ContinuityEvidence>;
  provenance: Record<string, string[]>;
  episodeIds: string[];
  offered: NarrationReadset["offered"];
  sharedLoreWords?: string[];
};

function sharedLoreWords(
  episode: AcceptedEpisode,
  view: ReturnType<typeof selectEpisodeHistory>["episodes"][number],
  audience: string[],
) {
  const heard = new Map<string, Set<string>>();
  for (const row of view.groundedInput) {
    if (row.channel !== "words") continue;
    const key = JSON.stringify([row.id, row.text]);
    if (!heard.has(key)) heard.set(key, new Set());
    heard.get(key)!.add(row.for);
  }
  return [
    ...view.groundedInput.flatMap((row) =>
      row.for === "player" &&
      row.channel === "words" &&
      audience.every((id) => heard.get(JSON.stringify([row.id, row.text]))?.has(id))
        ? [row.text]
        : [],
    ),
    ...view.segments.flatMap((line) =>
      "text" in line &&
      typeof line.text === "string" &&
      line.kind !== "narration" &&
      line.kind !== "input" &&
      audience.every((id) => line.perceivedBy[id] === "words") &&
      episode.segments.some((source) => source.id === line.id && !source.contactHidden && !source.contactReport)
        ? [line.text]
        : [],
    ),
  ];
}

/** An ordinary callback can show the matching words. Native decisions and grounded inputs keep their full context. */
function callbackView(
  episode: AcceptedEpisode,
  view: ReturnType<typeof selectEpisodeHistory>["episodes"][number],
  input: string,
) {
  if (
    episode.commandReceipts.length ||
    episode.grounding.length ||
    episode.continuityVersionIds.length ||
    view.letters?.length ||
    view.segments.some((line) => line.projections.length)
  )
    return view;
  const terms = [...new Set(recallTerms(input))];
  const lines = view.segments.filter((line) => "text" in line).filter((line) => line.kind === "dialogue" && line.text);
  if (lines.length <= 2) return view;
  const scores = lines.map((line) => {
    const words = new Set(recallTerms(line.text));
    return terms.filter((term) => words.has(term)).length;
  });
  const strongest = Math.max(...scores);
  if (!strongest) return view;
  const index = scores.indexOf(strongest);
  const start = index === 0 || (scores[index + 1] ?? -1) >= scores[index - 1] ? index : index - 1;
  return { ...view, segments: lines.slice(start, start + 2) };
}

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
  const episodeId = sceneEpisodeId(state.seed, scene.id, operationId);
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
  const captured = sceneContinuityView(state, scene);
  const loreAudience = ["player", ...writerIds];
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
  ].sort((a, b) => a.id.localeCompare(b.id, "en"));
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
  const repairs = sceneRepairOffers(state, scene, room, at);
  const roomSelection = selectRoomContinuity(state.continuity, state.episodes, room, at, {
    query: input,
    bytes: capacity,
    requiredIds: [],
    preferredIds: repairs.flatMap((repair) => repair.entries),
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
  // Raw witness views are larger than the rendered transcript. Fit the model-facing
  // transcript below, with a separate ceiling on raw projection work.
  const transcriptBudget = 12_000;
  const recallBudget = 750;
  const history = selectEpisodeHistory(state.episodes, state.continuity, holders, input, 256_000, scene.id);
  const episodeOrder = new Map(state.episodes.records.map((row, index) => [row.id, index]));
  const contextScopes = new Map(
    [...actors, ...npcCandidates.map((row) => row.holder)].map((holder) => [holder.id, holder.incarnation]),
  );
  const historyPart = (view: (typeof history.episodes)[number], transcript: boolean): Part => {
    let localAlias = 0;
    const exchangeNumber = episodeOrder.get(view.id)! + 1,
      episode = state.episodes.records[exchangeNumber - 1],
      offeredView = transcript ? view : callbackView(episode, view, input),
      { interaction, ...recall } = projectEpisodeRecall(
        state,
        episode,
        offeredView,
        holders,
        actors,
        transcript ? contextScopes : new Map(contextScopes),
        () => `h:${exchangeNumber}.${++localAlias}`,
        offeredView === view ? undefined : new Set(offeredView.segments.map((line) => line.id)),
      ),
      compact = compactSceneExchange(interaction, recall.sources, exchangeNumber, transcript);
    const text = JSON.stringify({
      interaction: transcript ? compact.exchange : { ...compact.exchange, at: interaction.at },
      ...(transcript ? {} : { earlierRecall: true }),
      ...(offeredView === view ? {} : { excerpt: true }),
    });
    return {
      ...emptyPart(),
      ...recall,
      sources: compact.sources,
      sharedLoreWords: sharedLoreWords(episode, offeredView, loreAudience),
      block: {
        text,
        evidenceId: "episode-context:" + view.id,
        optional: "history",
        ...(transcript ? { transcript: true, transcriptAt: interaction.at, transcriptAudience: compact.audience } : {}),
      },
    };
  };
  const transcript = appendHistoryWithin(
    history.episodes.map((view) => historyPart(view, true)),
    transcriptBudget,
    (part) => estimatedTextTokens(part.block.text),
  );
  const transcriptIds = new Set(transcript.map((part) => part.episodeIds[0]));
  parts.push(...transcript);
  let recallTokens = 0;
  for (const view of history.recallCandidates ?? []) {
    if (transcriptIds.has(view.id)) continue;
    const part = historyPart(view, false);
    const tokens = estimatedTextTokens(part.block.text);
    if (tokens > recallBudget) continue;
    parts.push(part);
    recallTokens = tokens;
    break;
  }
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
  const episodesById = new Map(state.episodes.records.map((episode) => [episode.id, episode]));
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
        owners = [
          ...new Map(
            [...actors, room, ...circumstanceRoomOrigins(episode, receipt, episodesById)].map((holder) => [
              continuityHolderKey(holder),
              holder,
            ]),
          ).values(),
        ];
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
  const sharedPrivate = new Map<string, { part: Part; holders: { for: string; source: string }[] }>();
  const actorRefs = new Map(
    actorSelection.packet.entries
      .filter((entry) => !circumstanceRoots.has(entry.id))
      .map((entry) => [JSON.stringify([entry.for, entry.id]), sourceAlias()]),
  );
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
            ref = actorRefs.get(JSON.stringify([row.for, row.id]))!;
          part.sources[ref] = source;
          (part.provenance[key] ??= []).push(continuitySourceUnit(source));
          part.targets.push({ id: view.id, recordRevision: view.recordRevision, heads: { [key]: view.headRevision } });
          for (const episode of state.episodes.records)
            if (episode.continuityVersionIds.includes(view.version.id)) part.episodeIds.push(episode.id);
          part.episodeIds.push(...view.version.sources.map((source) => source.episodeId));
          if (row.current && holder.id !== "player" && continuityGuidesHolder(view))
            part.offered.push({ holder, ids: [row.id] });
          return {
            ...row,
            id: ref,
            ...(row.parent ? { parent: actorRefs.get(JSON.stringify([row.for, row.parent])) ?? row.parent } : {}),
          };
        });
    const required = part.targets.some((target) => requiredKey(target, key));
    const packet: Part = {
      ...part,
      block: {
        text: JSON.stringify({ privateContinuity: entries }),
        evidenceId: "actor-context:" + parts.length,
        ...(!required ? { optional: "memory" as const } : {}),
      },
    };
    if (!required && group.length === 1 && entries.length === 1 && !entries[0].parent) {
      const { for: actor, id: source, ...meaning } = entries[0];
      const meaningKey = JSON.stringify([entry.id, meaning]);
      const knower = { for: actor, source };
      const prior = sharedPrivate.get(meaningKey);
      if (prior) {
        prior.holders.push(knower);
        prior.part.block.text = JSON.stringify({
          privateContinuity: [{ id: prior.holders[0].source, ...meaning, holders: prior.holders }],
        });
        prior.part.sources[source] = part.sources[source];
        prior.part.provenance[key] = part.provenance[key];
        prior.part.targets.push(...part.targets);
        prior.part.offered.push(...part.offered);
        prior.part.episodeIds.push(...part.episodeIds);
        continue;
      }
      sharedPrivate.set(meaningKey, { part: packet, holders: [knower] });
    }
    parts.push(packet);
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
  for (const repair of repairs)
    parts.push({
      ...emptyPart(),
      block: {
        text: JSON.stringify({ repair }),
        evidenceId: "repair-context:" + repair.id,
        optional: "memory",
        requiresEvidence: repair.entries.map((id) => ["room-context:" + id]),
      },
    });
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
  const projectWorld = sceneContinuityView(state, scene);
  const projects = projectSpeechContexts(projectWorld, writerIds, "", input, scene.placeId);
  const projectQuery = input.toLocaleLowerCase("en-US");
  for (const project of projects) {
    const title = projectWorld.projects.find((row) => row.id === project.projectId)!.title.toLocaleLowerCase("en-US");
    const requested =
      projectQuery.includes(project.projectId.toLocaleLowerCase("en-US")) ||
      (title.length > 3 && projectQuery.includes(title)) ||
      (projects.length === 1 && /\b(?:project|renovation|establishment)\b/iu.test(input));
    parts.push({
      ...emptyPart(),
      block: {
        text: projectSpeechPrompt(projectWorld, [project]),
        evidenceId: "project-context:" + project.projectId,
        ...(!requested ? { optional: "memory" as const } : {}),
      },
    });
  }
  const selectionOrder = [
    ...parts.filter((part) => !part.block.optional),
    ...transcript,
    ...parts.filter((part) => part.block.optional === "history" && !part.block.transcript),
    ...parts
      .filter((part) => part.block.optional === "memory")
      .sort(
        (a, b) =>
          Number(b.block.evidenceId?.startsWith("room-context:")) -
          Number(a.block.evidenceId?.startsWith("room-context:")),
      ),
  ];
  const retained = new Set(
    selectionOrder.filter((part) => {
      if (part.block.optional !== "memory") return true;
      const tokens = estimatedTextTokens(part.block.text);
      if (recallTokens + tokens > recallBudget) return false;
      recallTokens += tokens;
      return true;
    }),
  );
  const evidenceIds = new Set([...retained].map((part) => part.block.evidenceId));
  const bounded = parts.filter((part) => retained.has(part) && hasWritingEvidence(part.block, evidenceIds));
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
    presentation: sceneSpriteSelection(scene, captured),
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
    repairs,
    at,
    parts: bounded,
    recentLore: bounded
      .filter((part) => part.sharedLoreWords)
      .sort((a, b) => episodeOrder.get(a.episodeIds[0])! - episodeOrder.get(b.episodeIds[0])!)
      .flatMap((part) => (part.sharedLoreWords ?? []).map((text) => ({ text, evidenceId: part.block.evidenceId! })))
      .filter(({ text }) => text.length <= 4000)
      .slice(-6),
    projects: projects.filter((project) => evidenceIds.has("project-context:" + project.projectId)),
    access: narrationAccessScopes(captured, ["player", ...writerIds]),
    residence: narrationResidenceContext(captured, ["player", ...writerIds]),
    places: narrationPlaceContext(captured, ["player", ...writerIds]),
    protections,
    roomReferences: readOnlyRoomContext(
      state,
      episodeContextRooms({ actors, room }, [...new Set(bounded.flatMap((part) => Object.keys(part.provenance)))]),
    ),
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
  const rooms = episodeContextRooms({ actors: context.actors, room: context.room }, Object.keys(provenance));
  const protectedRoots = [
    ...new Set([...context.protections, ...continuityConstraints(state.continuity, rooms)].map((row) => row.id)),
  ];
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
    presentation: context.presentation,
    source: { ...context.source, historical, subjects },
    admission: {
      seed: state.seed,
      // The Scene request ID is local to one visit. Common continuity uses its Episode identity.
      operationId: context.episodeId,
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
        ...rooms,
      ]),
      provenance,
    },
    offered: [...offered.values()].filter((row) => context.actors.some((actor) => actor.id === row.holder.id)),
    circumstance: context.circumstance,
    repairs: context.repairs.filter(
      (repair) =>
        evidenceIds.includes("repair-context:" + repair.id) &&
        repair.entries.every((id) => evidenceIds.includes("room-context:" + id)),
    ),
    npcCandidates: candidates.map(({ npc, holder }) => ({
      npc,
      incarnation: holder.incarnation,
      offered: offered.get(continuityHolderKey(holder))?.ids ?? [],
    })),
    projects: context.projects.filter((project) => evidenceIds.includes("project-context:" + project.projectId)),
    access: context.access,
    residence: context.residence,
    places: context.places,
  };
}
