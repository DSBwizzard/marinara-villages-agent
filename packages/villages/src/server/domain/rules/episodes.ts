import type { ContinuityCollection, ContinuityHolder } from "../models/continuity-model.js";
import type { AcceptedEpisode, EpisodeCollection } from "../models/episode-model.js";
import { episodeSourceGraph, episodeUnit, readAcceptedEpisode } from "../decoding/episode-codec.js";
import {
  continuityHolderKey,
  continuityProtectionUnits,
  continuitySourceUnit,
  actorContinuityEvidence,
} from "./continuity.js";
import { episodeSpeechEvidence, episodeContextActors } from "./episode-sources.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { assertMailHistory, episodeMailEvidence } from "./mail-evidence.js";

export const emptyEpisodes = (): EpisodeCollection => ({ format: 1, revision: 0, records: [] });

/** Publication belongs to the same Village CAS as the retained writes and native receipts. */
export function appendEpisode(collection: EpisodeCollection, raw: AcceptedEpisode, seed: string): EpisodeCollection {
  const episode = readAcceptedEpisode(raw, seed);
  const prior = collection.records.find((row) => row.id === episode.id || row.operationId === episode.operationId);
  if (prior) {
    memoryRequire(memoryHash(prior) === memoryHash(episode), "accepted episode identity reused");
    return collection;
  }
  episodeSourceGraph([...collection.records, episode]);
  assertMailHistory([...collection.records, episode]);
  return { format: 1, revision: collection.revision + 1, records: [...collection.records, episode] };
}

function blockedUnits(continuity: ContinuityCollection, holder: ContinuityHolder, graph: Map<string, Set<string>>) {
  return continuityProtectionUnits(continuity, holder, graph);
}
function protectedUnit(episode: AcceptedEpisode, unitId: string, blocked: Set<string>) {
  return blocked.has(episodeUnit(episode, unitId));
}
function admitted(episode: AcceptedEpisode, holder: Extract<ContinuityHolder, { kind: "actor" }>) {
  return episode.actors.some((actor) => actor.id === holder.id && actor.incarnation === holder.incarnation);
}
export function recentSharedEpisodes(
  collection: EpisodeCollection,
  holders: Extract<ContinuityHolder, { kind: "actor" }>[],
) {
  const player = holders.find((holder) => holder.id === "player");
  const pairs = player
    ? holders.filter((holder) => holder !== player).map((holder) => [player, holder])
    : holders.flatMap((holder, i) => holders.slice(i + 1).map((other) => [holder, other]));
  return [
    ...new Set(
      (pairs.length ? pairs : holders.map((holder) => [holder])).flatMap((pair) =>
        collection.records
          .filter((episode) => pair.every((holder) => admitted(episode, holder)))
          .slice(-2)
          .toReversed(),
      ),
    ),
  ];
}

/** The original input is deliberately absent; only consequential grounded excerpts can enter this view. */
export function actorEpisodeView(
  episode: AcceptedEpisode,
  continuity: ContinuityCollection,
  holder: Extract<ContinuityHolder, { kind: "actor" }>,
  history: EpisodeCollection,
) {
  assertEpisodeScope(episode, history);
  return projectActorEpisode(
    episode,
    holder,
    blockedUnits(continuity, holder, episodeSourceGraph(history.records, holder)),
  );
}
function projectActorEpisode(
  episode: AcceptedEpisode,
  holder: Extract<ContinuityHolder, { kind: "actor" }>,
  blocked: Set<string>,
) {
  if (!admitted(episode, holder)) return null;
  const input = episode.grounding.flatMap((source) => {
    if (source.unitId !== "input" || source.kind === "context" || blocked.has(continuitySourceUnit(source))) return [];
    const own = source.actorId === holder.id;
    if ((source.kind === "private" || source.kind === "self") && !own) return [];
    const perception = source.perceptions.find((row) => row.actorId === holder.id);
    return perception || own
      ? [
          {
            id: source.id,
            text: perception?.text ?? source.excerpt,
            channel: perception?.channel ?? (source.kind === "speech" ? "words" : "private"),
            ...(source.range ? { range: source.range } : {}),
          },
        ]
      : [];
  });
  const segments = episode.segments.flatMap((line) => {
    const withheld = protectedUnit(episode, line.id, blocked);
    if (line.kind === "narration" || withheld) {
      const sources = episode.grounding.filter(
        (source) =>
          source.unitId === line.id &&
          !blocked.has(continuitySourceUnit(source)) &&
          (!(source.kind === "private" || source.kind === "self") || source.actorId === holder.id) &&
          source.perceptions.some((row) => row.actorId === holder.id),
      );
      if (sources.length)
        return sources.map((source) => {
          const perception = source.perceptions.find((row) => row.actorId === holder.id)!;
          return {
            id: line.id,
            speakerId: line.kind === "narration" ? "__venue_scene__" : line.speakerId,
            kind: line.kind,
            text: perception.text,
            channel: perception.channel,
          };
        });
      if (withheld) return [];
      if (line.soundOnly?.characterIds.includes(holder.id) || (holder.id === "player" && line.soundOnly?.player))
        return [
          {
            id: line.id,
            speakerId: "__venue_scene__",
            kind: line.kind,
            text: line.soundOnly.text,
            channel: "sound-only",
          },
        ];
      return [];
    }
    if (line.heardBy.includes(holder.id) || line.speakerId === holder.id)
      return [
        {
          id: line.id,
          speakerId: line.speakerId,
          kind: line.kind,
          text: line.content,
          channel: "words",
        },
      ];
    if (line.soundOnly?.characterIds.includes(holder.id) || (holder.id === "player" && line.soundOnly?.player))
      return [
        {
          id: line.id,
          speakerId: "__venue_scene__",
          kind: "narration",
          text: line.soundOnly!.text,
          channel: "sound-only",
        },
      ];
    return [];
  });
  const letters = episode.commandReceipts.flatMap((receipt) => {
    const mail = receipt.mail;
    if (!mail || !receipt.witnesses.includes(holder.id)) return [];
    const id = "mail:" + mail.sourceHash;
    if (protectedUnit(episode, id, blocked)) return [];
    return [{ id, fromId: mail.from.id, toId: mail.to.id, at: mail.at, text: receipt.text, channel: "words" as const }];
  });
  return { id: episode.id, sceneId: episode.sceneId, at: episode.capturedAt, input, segments, letters };
}

/** Private GM chronology is distinct from every resident's eligible evidence. */
export function gmEpisodeView(
  episode: AcceptedEpisode,
  continuity: ContinuityCollection,
  holders: Extract<ContinuityHolder, { kind: "actor" }>[],
  history: EpisodeCollection,
) {
  assertEpisodeScope(episode, history);
  return projectGmEpisode(
    episode,
    holders,
    gmProtections(history, continuity, holders, [
      ...episode.actors.map((actor) => ({ kind: "actor" as const, ...actor })),
      ...episodeContextActors(episode),
    ]),
    episode.room
      ? blockedUnits(continuity, episode.room, episodeSourceGraph(history.records, episode.room))
      : new Set(),
  );
}
function gmProtections(
  history: EpisodeCollection,
  continuity: ContinuityCollection,
  holders: Extract<ContinuityHolder, { kind: "actor" }>[],
  references: Extract<ContinuityHolder, { kind: "actor" }>[],
) {
  const keys = new Set(continuity.records.flatMap((record) => Object.keys(record.protection))),
    actual = new Set(holders.map(continuityHolderKey));
  const scopes = new Map([...holders, ...references].map((holder) => [continuityHolderKey(holder), holder]));
  return new Map(
    [...scopes].map(([key, holder]) => [
      key,
      actual.has(key) || keys.has(key)
        ? blockedUnits(continuity, holder, episodeSourceGraph(history.records, holder))
        : new Set<string>(),
    ]),
  );
}
function assertEpisodeScope(episode: AcceptedEpisode, history: EpisodeCollection) {
  const owned = history.records.find((row) => row.id === episode.id);
  memoryRequire(
    owned && (owned === episode || memoryHash(owned) === memoryHash(episode)),
    "episode is outside the supplied history scope",
  );
}

export function recallEpisodeSpeech(
  episode: AcceptedEpisode,
  lineId: string,
  continuity: ContinuityCollection,
  holder: Extract<ContinuityHolder, { kind: "actor" }>,
  history: EpisodeCollection,
) {
  const view = actorEpisodeView(episode, continuity, holder, history);
  const source = episodeSpeechEvidence(episode, lineId);
  if (!source || !view?.segments.some((line) => line.id === lineId)) return;
  const projected = actorContinuityEvidence(source, holder.id);
  return view.segments.some(
    (line) =>
      line.id === lineId && line.text === projected.excerpt && line.channel === projected.perceptions[0]?.channel,
  )
    ? projected
    : undefined;
}

export function recallEpisodeMail(
  episode: AcceptedEpisode,
  unitId: string,
  continuity: ContinuityCollection,
  holder: Extract<ContinuityHolder, { kind: "actor" }>,
  history: EpisodeCollection,
) {
  const view = actorEpisodeView(episode, continuity, holder, history),
    source = episodeMailEvidence(episode, unitId);
  return source && view?.letters.some((letter) => letter.id === unitId)
    ? actorContinuityEvidence(source, holder.id)
    : undefined;
}
function projectGmEpisode(
  episode: AcceptedEpisode,
  holders: Extract<ContinuityHolder, { kind: "actor" }>[],
  protections: Map<string, Set<string>>,
  roomProtection: Set<string>,
) {
  const relevant = holders.filter((holder) => admitted(episode, holder));
  if (!relevant.length) return null;
  const blocked = relevant.map((holder) => protections.get(continuityHolderKey(holder))!);
  const referenceProtection = [
    ...episode.actors.map((actor) => ({ kind: "actor" as const, ...actor })),
    ...episodeContextActors(episode),
  ].map((holder) => protections.get(continuityHolderKey(holder))!);
  const inputProtected =
    blocked.some((units) => protectedUnit(episode, "input", units)) || protectedUnit(episode, "input", roomProtection);
  const views = relevant.map((holder, index) => ({
    holder,
    view: projectActorEpisode(episode, holder, blocked[index])!,
  }));
  const letters = episode.commandReceipts.flatMap((receipt) => {
    if (!receipt.mail) return [];
    const id = "mail:" + receipt.mail.sourceHash;
    const knownBy = views
      .filter((row) => row.view.letters.some((letter) => letter.id === id))
      .map((row) => row.holder.id);
    return knownBy.length
      ? [
          {
            id,
            fromId: receipt.mail.from.id,
            toId: receipt.mail.to.id,
            at: receipt.mail.at,
            text: receipt.text,
            knownBy,
          },
        ]
      : [];
  });
  if (episode.commandReceipts.some((receipt) => receipt.mail) && !letters.length) return null;
  return {
    id: episode.id,
    sceneId: episode.sceneId,
    at: episode.capturedAt,
    gmPrivateInput: inputProtected ? { withheld: true } : { text: episode.privateInput },
    groundedInput: views.flatMap(({ holder, view }) => view.input.map((row) => ({ ...row, for: holder.id }))),
    ...(letters.length ? { letters } : {}),
    segments: episode.segments.flatMap((line) => {
      const perceived = views.flatMap((row) =>
        row.view.segments
          .filter((segment) => segment.id === line.id)
          .map((segment) => ({ for: row.holder.id, text: segment.text, channel: segment.channel })),
      );
      const full = perceived.filter((row) => row.text === line.content && row.channel !== "sound-only");
      // GM-visible narration supplies context, never an implicit resident observation.
      const narrator =
        line.kind === "narration" &&
        !line.contactHidden &&
        !protectedUnit(episode, line.id, roomProtection) &&
        !blocked.some((units) => protectedUnit(episode, line.id, units)) &&
        !referenceProtection.some((units) => protectedUnit(episode, line.id, units));
      if (!perceived.length && !narrator) return [];
      return [
        {
          id: line.id,
          speakerId: full.length || narrator ? line.speakerId : "__venue_scene__",
          kind: line.kind,
          ...(full.length ? { text: line.content } : narrator ? { gmOnlyText: line.content } : {}),
          perceivedBy: Object.fromEntries(full.map((row) => [row.for, row.channel])),
          projections: perceived.filter((row) => !full.includes(row)),
        },
      ];
    }),
  };
}

/** Select complete exchanges locally; omission never means that an earlier event did not happen. */
export function selectEpisodeHistory(
  collection: EpisodeCollection,
  continuity: ContinuityCollection,
  holders: Extract<ContinuityHolder, { kind: "actor" }>[],
  query: string,
  bytes: number,
) {
  memoryRequire(Number.isSafeInteger(bytes) && bytes >= 0, "invalid episode context budget");
  const terms = new Set(
    query
      .normalize("NFKC")
      .toLocaleLowerCase("en-US")
      .match(/[\p{L}\p{N}]+/gu) ?? [],
  );
  const protections = gmProtections(
    collection,
    continuity,
    holders,
    collection.records.flatMap((episode) => [
      ...episode.actors.map((actor) => ({ kind: "actor" as const, ...actor })),
      ...episodeContextActors(episode),
    ]),
  );
  const candidates = collection.records.flatMap((episode, index) => {
    const view = projectGmEpisode(
      episode,
      holders,
      protections,
      episode.room
        ? blockedUnits(continuity, episode.room, episodeSourceGraph(collection.records, episode.room))
        : new Set(),
    );
    if (!view) return [];
    const text = JSON.stringify(view),
      words = new Set(
        text
          .normalize("NFKC")
          .toLocaleLowerCase("en-US")
          .match(/[\p{L}\p{N}]+/gu) ?? [],
      );
    return [
      {
        index,
        episode,
        view,
        bytes: Buffer.byteLength(text),
        score: [...terms].filter((term) => words.has(term)).length,
      },
    ];
  });
  const shared = recentSharedEpisodes(collection, holders)
    .map((episode) => candidates.find((row) => row.episode.id === episode.id))
    .filter((row) => row !== undefined)
    .sort((a, b) => b.index - a.index);
  const recent = candidates.slice(-2),
    rest = candidates
      .slice(0, -2)
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score || b.index - a.index);
  const selected: typeof candidates = [];
  let used = 0;
  for (const row of [...shared, ...recent.toReversed(), ...rest])
    if (!selected.includes(row) && used + row.bytes <= bytes) {
      selected.push(row);
      used += row.bytes;
    }
  return {
    partial: selected.length < candidates.length,
    omitted: candidates.length - selected.length,
    bytes: used,
    episodes: selected.sort((a, b) => a.index - b.index).map((row) => row.view),
  };
}
