import type { ContinuityCollection, ContinuityHolder } from "../models/continuity-model.js";
import type { AcceptedEpisode, EpisodeCollection } from "../models/episode-model.js";
import { episodeSourceGraph, episodeUnit, readAcceptedEpisode } from "../decoding/episode-codec.js";
import {
  continuityHolderKey,
  continuityProtectionUnits,
  continuitySourceUnit,
  actorContinuityEvidence,
} from "./continuity.js";
import { episodeSpeechEvidence, episodeContextActors, episodeContextRooms } from "./episode-sources.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { asksForRecallQuote, rankRecall, sceneQuoteScore, sceneQuoteTerms, type RecallRanking } from "./text-recall.js";
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

/** Directory/history reads share one protection graph for the entire actor view. */
export function actorEpisodeViews(
  history: EpisodeCollection,
  continuity: ContinuityCollection,
  holder: Extract<ContinuityHolder, { kind: "actor" }>,
) {
  const blocked = blockedUnits(continuity, holder, episodeSourceGraph(history.records, holder));
  return history.records.map((episode) => ({ episode, view: projectActorEpisode(episode, holder, blocked) }));
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
    new Set(
      [...(episode.room ? [episode.room] : []), ...episodeContextRooms(episode)].flatMap((room) => [
        ...blockedUnits(continuity, room, episodeSourceGraph(history.records, room)),
      ]),
    ),
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
    if (
      protectedUnit(episode, id, roomProtection) ||
      referenceProtection.some((units) => protectedUnit(episode, id, units))
    )
      return [];
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
  const view = {
    id: episode.id,
    sceneId: episode.sceneId,
    at: episode.capturedAt,
    gmPrivateInput: inputProtected ? { withheld: true } : { text: episode.privateInput },
    groundedInput: views.flatMap(({ holder, view }) => view.input.map((row) => ({ ...row, for: holder.id }))),
    ...(letters.length ? { letters } : {}),
    segments: episode.segments.flatMap((line) => {
      if (protectedUnit(episode, line.id, roomProtection)) return [];
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
  return (!inputProtected && episode.privateInput.length > 0) ||
    view.groundedInput.length ||
    view.segments.length ||
    letters.length
    ? view
    : null;
}

/** Replay whole-exchange boundaries so ordinary growth never changes the head of a fitting transcript. */
export function appendHistoryWithin<T>(rows: readonly T[], budget: number, weight: (row: T) => number): T[] {
  let window: T[] = [],
    used = 0,
    previousSize = 0;
  for (const row of rows) {
    const size = weight(row);
    if (size > budget) continue;
    if (used + size > budget) {
      const overlap = previousSize + size <= budget;
      window = overlap ? window.slice(-1) : [];
      used = overlap ? previousSize : 0;
    }
    window.push(row);
    used += size;
    previousSize = size;
  }
  return window;
}

/** Select complete exchanges locally; omission never means that an earlier event did not happen. */
export function selectEpisodeHistory(
  collection: EpisodeCollection,
  continuity: ContinuityCollection,
  holders: Extract<ContinuityHolder, { kind: "actor" }>[],
  query: string,
  bytes: number,
  sceneId?: string,
  scope: { placeId?: string; ranking?: RecallRanking } = {},
) {
  memoryRequire(Number.isSafeInteger(bytes) && bytes >= 0, "invalid episode context budget");
  const holderKeys = new Set(holders.map(continuityHolderKey));
  const eligible = collection.records.flatMap((episode, index) =>
    episode.actors.some((actor) => holderKeys.has(continuityHolderKey({ kind: "actor", ...actor })))
      ? [{ episode, index }]
      : [],
  );
  const protections = gmProtections(
    collection,
    continuity,
    holders,
    eligible.flatMap(({ episode }) => [
      ...episode.actors.map((actor) => ({ kind: "actor" as const, ...actor })),
      ...episodeContextActors(episode),
    ]),
  );
  const roomProtections = new Map<string, Set<string>>();
  const candidates = eligible.flatMap(({ episode, index }) => {
    const view = projectGmEpisode(
      episode,
      holders,
      protections,
      new Set(
        [...(episode.room ? [episode.room] : []), ...episodeContextRooms(episode)].flatMap((room) => {
          const key = continuityHolderKey(room);
          let blocked = roomProtections.get(key);
          if (!blocked) {
            blocked = blockedUnits(continuity, room, episodeSourceGraph(collection.records, room));
            roomProtections.set(key, blocked);
          }
          return [...blocked];
        }),
      ),
    );
    if (!view) return [];
    const currentScene = sceneId !== undefined && episode.sceneId === sceneId;
    const witnessed: typeof view = {
      ...view,
      gmPrivateInput: { withheld: true as const },
      segments: view.segments.flatMap((line): typeof view.segments => {
        if (!("gmOnlyText" in line)) return [line];
        const { gmOnlyText: _narration, ...segment } = line;
        return segment.projections.length ? [segment] : [];
      }),
    };
    const { groundedInput, segments, letters } = witnessed;
    const named = (id: string) => episode.segments.find((line) => line.id === id)?.name;
    const prose = [
      ...new Set(
        groundedInput.filter((row) => row.channel === "words" || row.channel === "sight").map((row) => row.text),
      ),
      ...segments.flatMap((line) => [
        ...("text" in line && line.text ? [named(line.id) ?? "", line.text] : []),
        ...line.projections.filter(({ channel }) => channel === "words" || channel === "sight").map(({ text }) => text),
      ]),
      ...(letters ?? []).map((letter) => letter.text),
    ].join(" ");
    const shared = (ids: readonly string[]) => ids.includes("player") && ids.some((id) => id !== "player");
    const sharedWords = [
      ...groundedInput
        .filter(
          (row) =>
            row.for === "player" &&
            row.channel === "words" &&
            groundedInput.some(
              (other) =>
                other.for !== "player" && other.id === row.id && other.channel === "words" && other.text === row.text,
            ),
        )
        .map((row) => row.text),
      ...segments.flatMap((line) =>
        "text" in line &&
        line.text &&
        shared(Object.keys(line.perceivedBy).filter((id) => line.perceivedBy[id] === "words"))
          ? [line.text]
          : [],
      ),
      ...(letters ?? []).filter((letter) => shared(letter.knownBy)).map((letter) => letter.text),
    ];
    const requireWitnessed = sceneId !== undefined && !currentScene;
    if (requireWitnessed && !prose.trim()) return [];
    const projected = requireWitnessed ? witnessed : view;
    return [
      {
        index,
        episode,
        view: projected,
        witnessed,
        prose,
        sharedWords,
        bytes: !sceneId || currentScene ? Buffer.byteLength(JSON.stringify(projected)) : 0,
      },
    ];
  });
  const rank = (pool: typeof candidates, recent?: string) =>
    rankRecall(pool, query, (row) => row.prose, { ...scope.ranking, recent });
  if (sceneId) {
    const current = candidates.filter((row) => row.episode.sceneId === sceneId);
    const sceneWindow = appendHistoryWithin(current, bytes, (row) => row.bytes);
    const sceneIds = new Set(sceneWindow.map((row) => row.view.id));
    const earlier = candidates.map((row) => ({ ...row, view: row.witnessed }));
    const contextual = earlier.filter(
      (row) =>
        row.sharedWords.length &&
        (row.episode.sceneId === sceneId || (row.episode.room?.placeId === scope.placeId && !!scope.placeId)),
    );
    const recent = current
      .slice(-2)
      .flatMap(({ view }) => [
        ...view.groundedInput
          .filter(
            (row) =>
              row.for === "player" &&
              row.channel === "words" &&
              holders.every(({ id }) =>
                view.groundedInput.some(
                  (other) =>
                    other.for === id && other.channel === "words" && other.id === row.id && other.text === row.text,
                ),
              ),
          )
          .map((row) => row.text),
        ...view.segments.flatMap((line) =>
          "text" in line && line.text && holders.every(({ id }) => line.perceivedBy[id] === "words") ? [line.text] : [],
        ),
      ])
      .join("\n")
      .slice(-2400);
    const ranked = rank(earlier, recent);
    const quote = asksForRecallQuote(query);
    const quoteTerms = quote ? sceneQuoteTerms(query) : [];
    const quoteMatches = quote
      ? earlier
          .map((row) => ({
            row,
            score: Math.max(
              0,
              ...row.view.groundedInput.flatMap((line) =>
                line.for === "player" && line.channel === "words"
                  ? [sceneQuoteScore(quoteTerms, "player", line.text)]
                  : [],
              ),
              ...row.view.segments.flatMap((line) =>
                "text" in line && line.text && line.perceivedBy.player === "words"
                  ? [
                      sceneQuoteScore(
                        quoteTerms,
                        row.episode.segments.find((saved) => saved.id === line.id)?.name ?? line.speakerId,
                        line.text,
                      ),
                    ]
                  : [],
              ),
            ),
          }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score || b.row.index - a.row.index)
          .map(({ row }) => row)
      : [];
    const arrival = sceneWindow.length
      ? []
      : earlier
          .filter((row) => row.sharedWords.length)
          .slice(-2)
          .reverse();
    const recallCandidates = [
      ...new Set([
        ...quoteMatches,
        ...ranked.filter(({ score }) => score > 0).map(({ row }) => row),
        ...contextual
          .filter((row) => !sceneIds.has(row.view.id))
          .slice(-2)
          .reverse(),
        ...arrival,
      ]),
    ];
    return {
      partial: sceneWindow.length < candidates.length,
      omitted: candidates.length - sceneWindow.length,
      bytes: sceneWindow.reduce((total, row) => total + row.bytes, 0),
      sceneWindow: sceneIds,
      episodes: sceneWindow.map((row) => row.view),
      recallCandidates: recallCandidates.map((row) => row.view),
      directRecallIds: new Set(ranked.filter(({ matchedQuery }) => matchedQuery).map(({ row }) => row.view.id)),
      linkedEpisodes: new Map(earlier.map((row) => [row.view.id, row.view])),
    };
  }
  const shared = recentSharedEpisodes(collection, holders)
    .map((episode) => candidates.find((row) => row.episode.id === episode.id))
    .filter((row) => row !== undefined && row.sharedWords.length > 0)
    .sort((a, b) => b.index - a.index);
  const recent = candidates.slice(-2),
    rest = rank(candidates.slice(0, -2))
      .filter(({ score }) => score > 0)
      .map(({ row }) => row);
  const selected: typeof candidates = [];
  let used = 0;
  for (const row of [...shared, ...recent.toReversed(), ...rest]) {
    if (!selected.includes(row) && used + row.bytes <= bytes) {
      selected.push(row);
      used += row.bytes;
    }
  }
  return {
    partial: selected.length < candidates.length,
    omitted: candidates.length - selected.length,
    bytes: used,
    sceneWindow: new Set<string>(),
    episodes: selected.sort((a, b) => a.index - b.index).map((row) => row.view),
  };
}
