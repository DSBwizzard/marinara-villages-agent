import type { VillageState } from "../models/world.js";
import type { ContinuityCapture, ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import { episodeContextRooms } from "./episode-sources.js";
import { nativeCircumstanceRoots } from "./native-continuity.js";
import { continuityActor } from "./continuity-actors.js";
import {
  continuityConstraints,
  continuityHolderKey,
  continuityKnowledge,
  continuityProtectionFingerprint,
  continuityProtectionUnits,
  continuitySourceUnit,
  continuityViews,
} from "./continuity.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import { selectEpisodeHistory } from "./episodes.js";
import { projectEpisodeRecall } from "./episode-recall.js";
import { relationshipAttitudes, selectActorContinuity } from "./continuity-retrieval.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

export const continuityContextScopeKey = (holders: (ContinuityHolder | { id: string; incarnation: string })[]) =>
  memoryHash(
    holders.map((holder) =>
      "kind" in holder && holder.kind === "room" ? holder : { id: holder.id, incarnation: holder.incarnation },
    ),
  );

/** Opaque historical scopes never reveal remote Room prose or establish current Room authority. */
export function readOnlyRoomContext(state: VillageState, rooms: Extract<ContinuityHolder, { kind: "room" }>[]) {
  return rooms.length
    ? {
        scopes: rooms.map((room) => ({
          placeId: room.placeId,
          zoneId: room.zoneId,
          protectedRoots: continuityConstraints(state.continuity, [room]).map((row) => row.id),
        })),
        rule: "Read-only historical ancestry; no current Room truth, attendance or mechanical authority. Do not reintroduce protected roots.",
      }
    : undefined;
}

/** Capture common recall once for the offered actors; context holders are not an encounter witness roster. */
export function captureContinuityContext(
  state: VillageState,
  actorIds: string[],
  query: string,
  at: string,
  scope?: { placeId: string; zoneId: string },
): ContinuityCapture {
  memoryRequire(
    actorIds.length > 0 && actorIds.length <= 5 && new Set(actorIds).size === actorIds.length,
    "invalid continuity context actors",
  );
  const actors = actorIds.map((id) => continuityActor(state, id));
  memoryRequire(actors.every(Boolean), "continuity context actor is unavailable");
  const holders = actors.filter((actor) => actor !== undefined),
    views = holders.flatMap((holder) =>
      continuityViews(
        state.continuity,
        holder,
        at,
        continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder)),
      ),
    ),
    selected = selectActorContinuity(state.continuity, state.episodes, holders, at, {
      query,
      bytes: 24000,
      requiredIds: [...nativeCircumstanceRoots(state, at, views, scope)],
      identity: (id) => continuityActor(state, id),
    }),
    history = selectEpisodeHistory(state.episodes, state.continuity, holders, query, 12000),
    historical: Record<string, ContinuityEvidence> = {},
    provenance: Record<string, string[]> = {},
    sourceEpisodes = new Set<string>();
  let aliasIndex = 0;
  const sourceAlias = () => "h:" + aliasIndex++;
  const alias = (source: ContinuityEvidence, holder: (typeof holders)[number]) => {
    const ref = sourceAlias();
    historical[ref] = source;
    (provenance[continuityHolderKey(holder)] ??= []).push(continuitySourceUnit(source));
    if (source.kind !== "knowledge") sourceEpisodes.add(source.episodeId);
    return ref;
  };

  const entries = selected.packet.entries.map((entry) => {
    const holder = holders.find((holder) => holder.id === entry.for)!,
      view = views.find(
        (view) => view.id === entry.id && continuityHolderKey(view.holder) === continuityHolderKey(holder),
      )!;
    for (const source of view.version.sources) sourceEpisodes.add(source.episodeId);
    return { ...entry, source: alias(continuityKnowledge(view, state.seed, "context-capture"), holder) };
  });
  const contextScopes = new Map(holders.map((holder) => [holder.id, holder.incarnation])),
    interactions = history.episodes.map((view) => {
      const episode = state.episodes.records.find((episode) => episode.id === view.id)!,
        recall = projectEpisodeRecall(state, episode, view, holders, holders, contextScopes, sourceAlias);
      Object.assign(historical, recall.sources);
      for (const [key, units] of Object.entries(recall.provenance))
        provenance[key] = [...new Set([...(provenance[key] ?? []), ...units])];
      for (const id of recall.episodeIds) sourceEpisodes.add(id);
      for (const evidence of Object.values(recall.sources)) sourceEpisodes.add(evidence.episodeId);
      return recall.interaction;
    }),
    references = [...contextScopes]
      .filter(([id]) => !holders.some((holder) => holder.id === id))
      .map(([id, incarnation]) => ({ kind: "actor" as const, id, incarnation })),
    renderedHistory = { ...history, episodes: interactions };
  const subjects = [
      continuityActor(state, "player")!,
      ...state.villagers.map((resident) => continuityActor(state, resident.characterId)!),
      ...holders,
      ...references,
    ]
      .filter((actor, index, all) => all.findIndex((other) => other.id === actor.id) === index)
      .map(({ id, incarnation }) => ({ id, incarnation })),
    rooms = episodeContextRooms({ actors: holders }, Object.keys(provenance)),
    protection = Object.fromEntries(
      holders.map((holder) => [
        continuityContextScopeKey([holder]),
        continuityProtectionFingerprint(state.continuity, [holder]),
      ]),
    );
  const scopes: ContinuityHolder[][] = [holders, [...holders, ...references], [...holders, ...references, ...rooms]];
  for (const from of holders)
    for (const to of holders) {
      if (from.id === to.id) continue;
      const pair = [from, to];
      scopes.push(
        pair,
        [...pair, ...rooms],
        [
          ...pair,
          ...[...holders, ...references].filter((actor) => actor.id !== from.id && actor.id !== to.id),
          ...rooms,
        ],
        [
          ...pair,
          ...[...holders, ...references].filter(
            (actor) => actor.id !== from.id && actor.id !== to.id && provenance[continuityHolderKey(actor)]?.length,
          ),
          ...rooms,
        ],
      );
    }
  for (const scope of scopes)
    protection[continuityContextScopeKey(scope)] = continuityProtectionFingerprint(state.continuity, scope);
  memoryRequire(
    subjects.length <= 256 && Object.keys(historical).length <= 1024,
    "continuity identity or evidence context exceeds its bound before generation",
  );
  const protections = continuityConstraints(state.continuity, [...holders, ...references]);
  const relationships = relationshipAttitudes(state.continuity, holders);
  const value: ContinuityCapture = {
    seed: state.seed,
    setupAt: state.setupAt,
    at,
    actors: holders.map(({ id, incarnation }) => ({ id, incarnation })),
    subjects,
    references: references.map(({ id, incarnation }) => ({ id, incarnation })),
    continuityRevision: state.continuity.revision,
    supplied: selected.supplied,
    protection,
    protectedRoots: [
      ...new Set([...protections, ...continuityConstraints(state.continuity, rooms)].map((row) => row.id)),
    ],
    historical,
    provenance,
    sourceActors: Object.fromEntries(
      [...sourceEpisodes].map((id) => [
        id,
        state.episodes.records
          .find((episode) => episode.id === id)!
          .actors.map(({ id, incarnation }) => ({ id, incarnation })),
      ]),
    ),
    offered: selected.offered,
    prompt: {
      entries,
      ...(relationships.length ? { relationships } : {}),
      history: { ...renderedHistory, roomReferences: readOnlyRoomContext(state, rooms) },
      protections,
    },
  };
  memoryRequire(
    Buffer.byteLength(JSON.stringify(value)) <= 160000,
    "required continuity capture does not fit before generation",
  );
  return value;
}
