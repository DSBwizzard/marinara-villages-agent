import type {
  ContinuityCollection,
  ContinuityHolder,
  ContinuityTarget,
  ContinuityView,
} from "../models/continuity-model.js";
import type { EpisodeCollection } from "../models/episode-model.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import {
  continuityHolderKey,
  continuityGuidesHolder,
  continuityProtectionUnits,
  continuityViews,
  latestRelationshipScores,
  latestRomanticInterests,
  relationshipKey,
} from "./continuity.js";
import { memoryRequire } from "./memory-integrity.js";
import { rankRecall, type RecallRanking } from "./text-recall.js";
import { recentSharedEpisodes } from "./episodes.js";

/** Current attitude is private GM context for its owner, not a source of in-world knowledge. */
export function relationshipAttitudes(
  collection: ContinuityCollection,
  actors: Extract<ContinuityHolder, { kind: "actor" }>[],
) {
  const scores = latestRelationshipScores(collection);
  const interests = latestRomanticInterests(collection);
  if (!scores.size && !interests.size) return [];
  return actors
    .filter((owner) => owner.id !== "player")
    .flatMap((owner) =>
      actors.flatMap((subject) => {
        if (owner.id === subject.id) return [];
        const key = relationshipKey(owner, subject);
        const score = scores.get(key)?.relationshipScore;
        const romanticInterest = interests.get(key)?.romanticInterest;
        if (score === undefined && romanticInterest === undefined) return [];
        return [
          {
            for: owner.id,
            about: subject.id,
            ...(score !== undefined ? { score } : {}),
            ...(romanticInterest !== undefined ? { romanticInterest } : {}),
          },
        ];
      }),
    )
    .sort(
      (a, b) =>
        Number(b.about === "player") - Number(a.about === "player") ||
        Math.max(Math.abs(b.score ?? 0), Math.abs(b.romanticInterest ?? 0) * 5) -
          Math.max(Math.abs(a.score ?? 0), Math.abs(a.romanticInterest ?? 0) * 5),
    )
    .slice(0, 16);
}

function targets(views: ContinuityView[]): ContinuityTarget[] {
  const result = new Map<string, ContinuityTarget>();
  for (const view of views) {
    const target = result.get(view.id) ?? { id: view.id, recordRevision: view.recordRevision, heads: {} };
    target.heads[continuityHolderKey(view.holder)] = view.headRevision;
    result.set(view.id, target);
  }
  return [...result.values()];
}
const roomEntry = (view: ContinuityView) => ({
  id: view.id,
  text: view.version.text,
  ...(view.version.room?.visibility === "concealed" ? { concealed: true, knownBy: view.roomKnownBy ?? [] } : {}),
  ...(view.version.room?.expiresAt ? { expiresAt: view.version.room.expiresAt } : {}),
});

export function currentRoomViews(
  collection: ContinuityCollection,
  episodes: EpisodeCollection,
  holder: Extract<ContinuityHolder, { kind: "room" }>,
  at: string,
) {
  const key = continuityHolderKey(holder);
  if (!collection.records.some((record) => record.heads[key])) return [];
  const blocked = collection.records.some((record) => record.protection[key]?.sourceUnits.length)
    ? continuityProtectionUnits(collection, holder, episodeSourceGraph(episodes.records, holder))
    : new Set<string>();
  return continuityViews(collection, holder, at, blocked).sort((a, b) => a.version.room!.order - b.version.room!.order);
}

export function roomParagraphs(text: string): string[] {
  return text.split(/\r?\n(?:[^\S\r\n]*\r?\n)+/u).filter((paragraph) => paragraph.trim());
}

/** Every current entry stays stored; only complete selected entries become legal mutation targets. */
export function selectRoomContinuity(
  collection: ContinuityCollection,
  episodes: EpisodeCollection,
  holder: Extract<ContinuityHolder, { kind: "room" }>,
  at: string,
  request: {
    query: string;
    bytes: number;
    requiredIds: string[];
    preferredIds?: string[];
    wholeRoom: boolean;
    viewers?: ReadonlySet<string>;
  },
) {
  memoryRequire(Number.isSafeInteger(request.bytes) && request.bytes > 0, "invalid room context budget");
  const roomViews = currentRoomViews(collection, episodes, holder, at);
  const all = roomViews.filter(
    (view) =>
      !request.viewers ||
      view.version.room?.visibility !== "concealed" ||
      view.roomKnownBy?.some((id) => request.viewers!.has(id)),
  );
  const required = new Set(
    request.wholeRoom ? all.map((row) => row.id) : [...request.requiredIds, ...(all[0] ? [all[0].id] : [])],
  );
  memoryRequire(
    [...required].every((id) => all.some((row) => row.id === id)),
    "required room entry is unavailable",
  );
  const selected = all.filter((row) => required.has(row.id));
  const packet = () => ({
    partial: selected.length < roomViews.length,
    total: all.length,
    entries: selected.toSorted((a, b) => a.version.room!.order - b.version.room!.order).map(roomEntry),
  });
  const size = () => Buffer.byteLength(JSON.stringify(packet()));
  memoryRequire(size() <= request.bytes, "required room context does not fit before generation");
  const ranked = rankRecall(all, request.query, (row) => row.version.text);
  const preferred = new Set(request.preferredIds);
  for (const { row } of [
    ...ranked.filter((row) => row.score > 0),
    ...all.filter((row) => preferred.has(row.id)).map((row) => ({ row })),
    ...all
      .slice(-4)
      .toReversed()
      .map((row) => ({ row })),
  ]) {
    if (selected.includes(row)) continue;
    selected.push(row);
    if (size() > request.bytes) selected.pop();
  }
  return {
    packet: packet(),
    supplied: targets(selected),
    required: targets(selected.filter((row) => required.has(row.id))),
    bytes: size(),
  };
}

function actorEntry(view: ContinuityView, identity: (id: string) => { incarnation: string } | undefined) {
  const version = view.version;
  const pastSubjects = version.about
    .filter((subject) => identity(subject.id)?.incarnation !== subject.incarnation)
    .map((subject) => subject.id);
  const unavailableParties =
    view.offer?.participants
      .filter((party) => identity(party.id)?.incarnation !== party.incarnation)
      .map((party) => party.id) ?? [];
  return {
    id: view.id,
    for: view.holder.kind === "actor" ? view.holder.id : "",
    text: version.text,
    class: version.class,
    ...(view.owner ? { owner: view.owner.id } : {}),
    ...(view.owner && identity(view.owner.id)?.incarnation !== view.owner.incarnation ? { pastOwner: true } : {}),
    ...(view.current ? { current: true } : {}),
    ...(version.about.length ? { about: version.about.map((row) => row.id) } : {}),
    ...(pastSubjects.length ? { pastSubjects } : {}),
    ...(version.parentId ? { parent: version.parentId, facet: version.facet } : {}),
    ...(version.closed ? { closed: version.closed.reason } : {}),
    ...(view.offer
      ? {
          offer: {
            ...view.offer,
            proposer: view.offer.proposer.id,
            participants: view.offer.participants.map((party) => party.id),
            ...(unavailableParties.length ? { unavailableParties } : {}),
          },
        }
      : {}),
  };
}

/** Local standing, fair initiative and recall share a bounded envelope and the same private projection. */
export function selectActorContinuity(
  collection: ContinuityCollection,
  episodes: EpisodeCollection,
  holders: Extract<ContinuityHolder, { kind: "actor" }>[],
  at: string,
  request: {
    query: string;
    bytes: number;
    requiredIds: string[];
    identity: (id: string) => { incarnation: string } | undefined;
    includeExtraInitiative?: boolean;
    ranking?: RecallRanking;
    semanticHolders?: ReadonlySet<string>;
    recentEpisodeIds?: ReadonlySet<string>;
  },
) {
  memoryRequire(Number.isSafeInteger(request.bytes) && request.bytes > 0, "invalid actor context budget");
  const all = holders.flatMap((holder) =>
    continuityViews(
      collection,
      holder,
      at,
      continuityProtectionUnits(collection, holder, episodeSourceGraph(episodes.records, holder)),
    ),
  );
  const recentVersions = new Set(
    recentSharedEpisodes(episodes, holders).flatMap((episode) => episode.continuityVersionIds),
  );
  const recentOffers = new Set(
    collection.versions.filter((version) => recentVersions.has(version.id)).map((version) => version.rootId),
  );
  const required = all.filter(
    (row) =>
      request.requiredIds.includes(row.id) ||
      (row.current && row.offer && recentOffers.has(row.id)) ||
      (row.current &&
        row.version.facet === "boundary" &&
        (!row.version.about.length ||
          row.version.about.some((subject) =>
            holders.some((holder) => holder.id === subject.id && holder.incarnation === subject.incarnation),
          ))),
  );
  memoryRequire(
    request.requiredIds.every((id) => all.some((row) => row.id === id)),
    "required continuity entry is unavailable",
  );
  for (const row of [...required])
    if (row.version.parentId) {
      const parent = all.find(
        (other) =>
          other.id === row.version.parentId && continuityHolderKey(other.holder) === continuityHolderKey(row.holder),
      );
      memoryRequire(parent, "required continuity parent is unavailable");
      if (!required.includes(parent)) required.push(parent);
    }
  const selected = [...required];
  const packet = () => ({
    partial: selected.length < all.length,
    entries: selected.map((view) => actorEntry(view, request.identity)),
  });
  const size = () => Buffer.byteLength(JSON.stringify(packet()));
  memoryRequire(size() <= request.bytes, "required actor continuity does not fit before generation");
  const take = (row: ContinuityView, minimum = false) => {
    if (selected.includes(row)) return;
    const group = [row];
    if (row.version.parentId) {
      const parent = all.find(
        (other) =>
          other.id === row.version.parentId && continuityHolderKey(other.holder) === continuityHolderKey(row.holder),
      );
      memoryRequire(parent || !minimum, "required initiative parent is unavailable");
      if (!parent) return;
      if (!selected.includes(parent)) group.unshift(parent);
    }
    selected.push(...group);
    if (size() > request.bytes) {
      memoryRequire(!minimum, "minimum resident initiative does not fit before generation");
      selected.splice(-group.length);
    }
  };
  const lastOffered = new Map<string, number>();
  const initiativeHolders = holders.filter((holder) => holder.id !== "player");
  const created = new Map<string, number>(),
    versions = new Map(collection.versions.map((version) => [version.id, version]));
  (initiativeHolders.length ? episodes.records : []).forEach((episode, sequence) => {
    for (const id of episode.continuityVersionIds) {
      const rootId = versions.get(id)?.rootId;
      if (rootId && !created.has(rootId)) created.set(rootId, sequence + 1);
    }
    for (const offer of episode.offered)
      for (const id of offer.ids)
        lastOffered.set(JSON.stringify([continuityHolderKey(offer.holder), id]), sequence + 1);
  });
  const fair: ContinuityView[] = [],
    surplus: ContinuityView[] = [];
  for (const holder of initiativeHolders) {
    const key = continuityHolderKey(holder);
    const current = all
      .filter((row) => continuityHolderKey(row.holder) === key && row.current && continuityGuidesHolder(row))
      .sort(
        (a, b) =>
          (lastOffered.get(JSON.stringify([key, a.id])) ?? created.get(a.id) ?? 0) -
            (lastOffered.get(JSON.stringify([key, b.id])) ?? created.get(b.id) ?? 0) || a.id.localeCompare(b.id),
      );
    const available = current.filter((row) => !selected.includes(row));
    const first =
      available[0] ?? current[0] ?? all.find((row) => row.current && continuityHolderKey(row.holder) === key);
    if (first) {
      take(first, true);
      fair.push(first);
    }
    if (available[1] && request.includeExtraInitiative !== false) surplus.push(available[1]);
  }
  for (const holder of initiativeHolders) {
    const foreground = all.find(
      (row) =>
        continuityHolderKey(row.holder) === continuityHolderKey(holder) &&
        row.current &&
        continuityGuidesHolder(row) &&
        row.version.facet === "attention",
    );
    if (foreground) take(foreground);
  }
  for (const row of surplus) take(row);
  const semantic = request.ranking?.semantic;
  const ranked = rankRecall(
    all,
    request.query,
    (row) =>
      [
        row.version.text,
        ...(row.version.class === "desire" ? ["wish wishes want hope"] : []),
        ...(row.version.class === "commitment" ? ["promise promised"] : []),
        ...row.version.about
          .filter((subject) => request.identity(subject.id)?.incarnation === subject.incarnation)
          .map((subject) => subject.id),
        ...row.version.sources.map((source) => source.excerpt),
      ].join(" "),
    {
      ...request.ranking,
      semantic:
        semantic &&
        ((texts) =>
          semantic(
            texts.map((text, index) =>
              !request.semanticHolders || request.semanticHolders.has(continuityHolderKey(all[index].holder))
                ? text
                : "",
            ),
          )),
    },
  );
  // Current obligations and witnessed recent sources are relevant even after a paraphrase.
  const contextual = all.filter(
    (row) =>
      row.current &&
      !row.version.closed &&
      (row.version.class === "commitment" ||
        row.version.class === "open-matter" ||
        row.version.sources.some((source) => request.recentEpisodeIds?.has(source.episodeId))),
  );
  for (const row of contextual.slice(-6).toReversed()) take(row);
  for (const { row, score } of ranked) if (score > 0) take(row);
  return {
    packet: packet(),
    supplied: targets(selected),
    required: targets([
      ...required,
      ...fair,
      ...fair.flatMap((row) =>
        row.version.parentId
          ? all.filter(
              (parent) =>
                parent.id === row.version.parentId &&
                continuityHolderKey(parent.holder) === continuityHolderKey(row.holder),
            )
          : [],
      ),
    ]),
    fair: targets(fair),
    offered: holders
      .filter((holder) => holder.id !== "player")
      .map((holder) => ({
        holder,
        ids: selected
          .filter(
            (row) =>
              row.current &&
              continuityGuidesHolder(row) &&
              continuityHolderKey(row.holder) === continuityHolderKey(holder),
          )
          .map((row) => row.id),
      }))
      .filter((row) => row.ids.length > 0),
    bytes: size(),
    eligible: all.length,
  };
}
