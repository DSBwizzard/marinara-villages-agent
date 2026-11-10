import type {
  MemoryLibrary,
  MemoryListEntry,
  MemoryInspection,
  MemoryForgetRequest,
  MemoryCorrectRequest,
} from "../../../shared/contracts/village.js";
import type { VillageState } from "../models/world.js";
import type { ContinuityHolder } from "../models/continuity-model.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import { continuityActor } from "./continuity-actors.js";
import {
  actorContinuityEvidence,
  continuityHolderKey,
  continuityProtectionUnits,
  continuityViews,
  continuityVersionId,
  continuityProtectionFingerprint,
  continuityConstraints,
  continuitySourceUnit,
  protectContinuity,
  CONTINUITY_TEXT_BYTES,
} from "./continuity.js";
import { memoryHash, memoryObject, memoryRequire } from "./memory-integrity.js";
import { badRequest, conflict, notFound } from "./errors.js";
import { findNpc } from "./places.js";
import { recallTerms } from "./text-recall.js";
import type { KnownWish } from "../../../shared/contracts/wishes.js";
import { nativeCircumstanceRoots } from "./native-continuity.js";

export function continuityContextRevision(state: VillageState, actorId: string) {
  const holder = continuityActor(state, actorId),
    key = holder && continuityHolderKey(holder);
  return memoryHash([
    state.seed,
    holder,
    state.continuity.records.flatMap((record) =>
      key && record.heads[key] ? [[record.id, record.heads[key], record.protection[key] ?? null]] : [],
    ),
  ]);
}

export function continuityPreparationContext(state: VillageState, actorId: string, at: string) {
  const holder = continuityActor(state, actorId);
  const wishes = continuityWishes(state, actorId, true, at),
    circumstances = continuityCircumstances(state, actorId, at);
  const rows = holder ? projections(state, holder, false, at) : [];
  const wishRoots = new Set(wishes.map((wish) => wish.wishId)),
    circumstanceRoots = nativeCircumstanceRoots(
      state,
      at,
      rows.map((row) => ({ id: row.record.id, holder: holder!, version: row.version })),
    );
  return {
    fingerprint: continuityContextRevision(state, actorId),
    protectionFingerprint: continuityProtectionFingerprint(state.continuity, holder ? [holder] : []),
    protections: continuityConstraints(state.continuity, holder ? [holder] : []),
    sources: rows
      .filter((row) => wishRoots.has(row.record.id) || circumstanceRoots.has(row.record.id))
      .map((row) => row.version.id),
    wishes: wishes.map((wish) => wish.text),
    circumstances,
  };
}

export function continuityCircumstances(state: VillageState, actorId: string, at: string): string[] {
  const holder = continuityActor(state, actorId);
  if (!holder) return [];
  const rows = projections(state, holder, false, at),
    roots = nativeCircumstanceRoots(
      state,
      at,
      rows.map((row) => ({ id: row.record.id, holder, version: row.version })),
    );
  return rows.filter((row) => roots.has(row.record.id)).map((row) => row.version.text);
}

/** A notebook reads only its holder's learned versions, never the owner's later private state. */
export function continuityWishes(state: VillageState, actorId: string, inspection: boolean, at: string): KnownWish[] {
  const owner = continuityActor(state, actorId),
    holder = continuityActor(state, inspection ? actorId : "player");
  if (!owner || !holder) return [];
  const key = continuityHolderKey(holder),
    rows = projections(state, holder, false, at);
  const blocked = continuityProtectionUnits(
    state.continuity,
    holder,
    episodeSourceGraph(state.episodes.records, holder),
  );
  return rows
    .filter(
      ({ record, version }) =>
        record.owner &&
        continuityHolderKey(record.owner) === continuityHolderKey(owner) &&
        version.class === "desire" &&
        !version.parentId,
    )
    .map(({ record, version }) => {
      const facts = record.protection[key]
        ? [version]
        : state.continuity.versions.filter(
            (prior) =>
              prior.rootId === record.id &&
              (prior.administrative
                ? continuityHolderKey(prior.administrative.holder) === key
                : prior.id === continuityVersionId(state.seed, prior.operationId, holder)) &&
              !blocked.has(JSON.stringify(["version", prior.id])) &&
              prior.sources.every((source) => !blocked.has(continuitySourceUnit(source))),
          );
      return {
        wishId: record.id,
        text: version.text,
        at: version.at,
        status: version.closed?.reason ?? "open",
        followed: state.wishFollowing?.[actorId + ":" + record.id] !== false,
        details: rows
          .filter((row) => row.version.parentId === record.id && row.head.current)
          .map((row) => ({ id: row.record.id, kind: row.version.facet ?? row.version.class, text: row.version.text })),
        facts: facts
          .toSorted((a, b) => a.createdRevision - b.createdRevision)
          .map((row) => ({ id: row.id, text: row.text, at: row.at })),
      };
    });
}

export type MemoryQuery = {
  inspection?: boolean;
  characterId?: string;
  query?: string;
  limit?: number;
  cursor?: MemoryLibrary["next"];
};
const person = (state: VillageState, id: string) => ({
  id,
  name:
    id === "player"
      ? state.playerName || "You"
      : (state.villagers.find((row) => row.characterId === id)?.cardSnapshot.name ??
        findNpc(state, id)?.name ??
        "Former resident"),
});
function projections(
  state: VillageState,
  holder: Extract<ContinuityHolder, { kind: "actor" }>,
  inspection: boolean,
  at: string,
) {
  const key = continuityHolderKey(holder),
    graph = episodeSourceGraph(state.episodes.records, holder),
    visible = new Map(
      continuityViews(state.continuity, holder, at, continuityProtectionUnits(state.continuity, holder, graph)).map(
        (view) => [view.id, view],
      ),
    ),
    versions = new Map(state.continuity.versions.map((version) => [version.id, version]));
  return state.continuity.records.flatMap((record) => {
    const head = record.heads[key],
      protection = record.protection[key];
    if (!head || (!inspection && !visible.has(record.id))) return [];
    const view = visible.get(record.id),
      original = versions.get(head.versionId)!;
    const version = view?.version ?? {
      ...original,
      text: original.text,
      sources: protection?.repair ? [] : original.sources.map((source) => actorContinuityEvidence(source, holder.id)),
    };
    const entry: MemoryListEntry = {
      id: record.id,
      revision: head.revision,
      kind: version.class,
      text: version.text,
      occurredAt: version.at,
      recordedAt: version.at,
      subjects: version.about
        .filter((subject) => inspection || continuityActor(state, subject.id)?.incarnation === subject.incarnation)
        .map((subject) =>
          continuityActor(state, subject.id)?.incarnation === subject.incarnation
            ? person(state, subject.id)
            : { id: subject.id, name: "Former resident" },
        ),
      knownBy: [person(state, holder.id)],
      forgotten: !!protection?.forgotten,
      playerCorrection: !!protection?.repair,
    };
    return [{ entry, record, head, version }];
  });
}

/** Every public count, cursor and revision depends only on this holder's visible projection. */
export function continuityMemoryLibrary(state: VillageState, input: MemoryQuery, at: string): MemoryLibrary {
  const characterId = input.inspection ? input.characterId || "player" : "player",
    holder = continuityActor(state, characterId),
    query = (input.query ?? "").trim(),
    limit = input.limit ?? 50;
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || query.length > 400)
    throw badRequest("Invalid memory page.");
  if (!holder) throw notFound("That person's continuity is unavailable.");
  const terms = recallTerms(query);
  const rows = projections(state, holder, input.inspection === true, at)
    .map((row) => row.entry)
    .filter((row) => ["experience", "information", "open-matter"].includes(row.kind))
    .filter((row) =>
      terms.every((term) =>
        (row.text + " " + row.subjects.map((subject) => subject.name).join(" "))
          .normalize("NFKC")
          .toLocaleLowerCase("en-US")
          .includes(term),
      ),
    )
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id));
  const revision = Number.parseInt(memoryHash([state.seed, continuityHolderKey(holder), rows]).slice(0, 13), 16);
  if (input.cursor && input.cursor.revision !== revision) throw conflict("Memories changed. Refresh the list.");
  const after = input.cursor ? rows.findIndex((row) => row.id === input.cursor!.afterId) : -1;
  if (input.cursor && after < 0) throw conflict("The memory page changed. Refresh the list.");
  const entries = rows.slice(after + 1, after + 1 + limit);
  return {
    inspection: input.inspection === true,
    seed: state.seed,
    characterId,
    revision,
    query,
    residents: [person(state, "player"), ...state.villagers.map((row) => person(state, row.characterId))],
    entries,
    total: rows.length,
    next: after + 1 + limit < rows.length ? { revision, afterId: entries.at(-1)!.id } : null,
  };
}

export function inspectContinuityMemory(
  state: VillageState,
  id: string,
  characterId: string,
  inspection: boolean,
  at: string,
): MemoryInspection {
  const holder = continuityActor(state, inspection ? characterId : "player");
  if (!holder) throw notFound("That person's continuity is unavailable.");
  const selected = projections(state, holder, inspection, at).find((row) => row.entry.id === id);
  if (!selected) throw notFound("That memory is unavailable.");
  const { record, entry } = selected;
  const holders = inspection
    ? Object.values(record.heads).flatMap((head) => {
        const actor = head.holder.kind === "actor" && continuityActor(state, head.holder.id);
        return actor && continuityHolderKey(actor) === continuityHolderKey(head.holder) ? [actor] : [];
      })
    : [holder];
  const episodes = new Map(state.episodes.records.map((episode) => [episode.id, episode]));
  return {
    seed: state.seed,
    revision: entry.revision,
    entry,
    ...(inspection
      ? {
          target: {
            id,
            recordRevision: record.revision,
            heads: Object.fromEntries(
              holders.map((actor) => {
                const key = continuityHolderKey(actor);
                return [key, record.heads[key].revision];
              }),
            ),
          },
        }
      : {}),
    knowers: holders.map((actor) => {
      const row = projections(state, actor, inspection, at).find((row) => row.entry.id === id)!;
      return {
        person: person(state, actor.id),
        forgotten: row.entry.forgotten,
        playerCorrection: row.entry.playerCorrection,
        text: row.entry.text,
        support: row.version.sources.map((source) => ({
          sourceId: source.id,
          lineId: source.unitId,
          excerpt: source.excerpt,
          kind: source.kind,
          ...(source.actorId && source.kind === "speech" ? { speaker: person(state, source.actorId) } : {}),
          ...(episodes.get(source.episodeId)?.sceneId ? { sceneId: episodes.get(source.episodeId)!.sceneId } : {}),
        })),
      };
    }),
  };
}

export function changeContinuityMemory(
  state: VillageState,
  id: string,
  input: MemoryForgetRequest | MemoryCorrectRequest,
  action: "forget" | "repair",
  at: string,
) {
  memoryObject(input, ["operationId", "seed", "target", "knowers", ...(action === "repair" ? ["text"] : [])]);
  memoryObject(input.target, ["id", "recordRevision", "heads"]);
  memoryRequire(input.seed === state.seed && input.target.id === id, "continuity identity changed");
  memoryRequire(
    Array.isArray(input.knowers) && input.knowers.length > 0 && new Set(input.knowers).size === input.knowers.length,
    "choose existing continuity holders",
  );
  const record = state.continuity.records.find((row) => row.id === id);
  memoryRequire(record, "continuity target is missing");
  const replay = Object.hasOwn(state.continuity.receipts, input.operationId);
  const holders = input.knowers.map((id) => {
    const captured = Object.values(record.heads).filter(
      (head) =>
        head.holder.kind === "actor" &&
        head.holder.id === id &&
        Object.hasOwn(input.target.heads, continuityHolderKey(head.holder)),
    );
    memoryRequire(captured.length === 1 && captured[0].holder.kind === "actor", "continuity holder changed");
    const holder = captured[0].holder;
    const current = continuityActor(state, id);
    memoryRequire(
      replay || (current && continuityHolderKey(current) === continuityHolderKey(holder)),
      "continuity holder changed",
    );
    return holder;
  });
  if (action === "repair")
    memoryRequire(
      typeof (input as MemoryCorrectRequest).text === "string" &&
        Buffer.byteLength((input as MemoryCorrectRequest).text) <= CONTINUITY_TEXT_BYTES,
      "correction is too long",
    );
  return protectContinuity(
    state.continuity,
    input.target,
    holders,
    input.operationId,
    at,
    action === "forget" ? { forget: true } : { text: (input as MemoryCorrectRequest).text },
  );
}
