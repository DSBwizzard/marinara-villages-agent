import type { VillageState } from "../models/world.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type {
  ContinuityClass,
  ContinuityEvidence,
  ContinuityHolder,
  ContinuityWrite,
  ContinuityView,
} from "../models/continuity-model.js";
import { continuityActor } from "./continuity-actors.js";
import {
  applyContinuityWrite,
  continuityHolderKey,
  continuitySourceUnit,
  continuityVersionId,
  continuityVersionUnit,
  continuityProtectionFingerprint,
} from "./continuity.js";
import { appendEpisode } from "./episodes.js";
import { assertContinuityRetention } from "./continuity-retention.js";
import { nativeReceiptSupportsRoom } from "./episode-sources.js";
import { memoryHash, memoryRequire, memoryObject } from "./memory-integrity.js";
import { findLocation } from "./places.js";
export const nativeEpisodeId = (seed: string, receiptId: string) =>
  "native-" + memoryHash([seed, receiptId]).slice(0, 32);

/** Associate native facts with eligible current holder text, including administrative corrections. */
export function nativeCircumstanceRoots(
  state: VillageState,
  at: string,
  views: Pick<ContinuityView, "id" | "holder" | "version">[],
  scope?: { placeId: string; zoneId: string },
) {
  const situations = (state.narrative?.situations ?? []).filter(
    (row) =>
      row.status === "active" &&
      (!scope ||
        row.scope === "village" ||
        row.targets.some((target) => target.venueId === scope.placeId && target.zoneId === scope.zoneId)),
  );
  const current = new Set(
    state.episodes.records.flatMap((episode) =>
      episode.commandReceipts
        .filter(
          (receipt) =>
            receipt.kind === "circumstance" &&
            situations.some(
              (row) =>
                row.id === receipt.targetId &&
                row.revision === receipt.revision &&
                row.summary === (receipt.circumstance?.summary ?? receipt.text),
            ),
        )
        .map((receipt) => receipt.id),
    ),
  );
  const roots = new Set(
    state.continuity.versions
      .filter((version) =>
        version.sources.some(
          (source) => source.kind === "native" && source.committedReceiptId && current.has(source.committedReceiptId),
        ),
      )
      .map((version) => version.rootId),
  );
  const conditions = new Set(
    (state.narrative?.conditions ?? [])
      .filter(
        (row) =>
          !row.clearedAt &&
          (!row.endsAt || row.endsAt > at) &&
          (!scope || (row.venueId === scope.placeId && row.zoneId === scope.zoneId)),
      )
      .map((row) => row.id),
  );
  if (!conditions.size) return roots;
  const receipts = new Map(
    state.episodes.records.flatMap((episode) =>
      episode.commandReceipts.flatMap((receipt) => {
        if (!receipt.circumstance) return [];
        const meaning = JSON.parse(receipt.text);
        return [
          [
            receipt.id,
            new Map<string, Set<string>>(
              (Array.isArray(meaning.conditions) ? meaning.conditions : []).map((row: { id: string }) => [
                row.id,
                new Set(Object.keys(row)),
              ]),
            ),
          ],
        ] as const;
      }),
    ),
  );
  const byRoot = new Map<string, Map<string, Set<string>>>();
  for (const version of state.continuity.versions)
    for (const source of version.sources) {
      const fields = source.committedReceiptId && receipts.get(source.committedReceiptId);
      if (!fields) continue;
      const known = byRoot.get(version.rootId) ?? new Map<string, Set<string>>();
      for (const [id, keys] of fields) known.set(id, new Set([...(known.get(id) ?? []), ...keys]));
      byRoot.set(version.rootId, known);
    }
  for (const holder of new Set(views.map((view) => continuityHolderKey(view.holder)))) {
    const own = views
      .filter((view) => continuityHolderKey(view.holder) === holder)
      .sort((a, b) => b.version.createdRevision - a.version.createdRevision);
    for (const id of conditions)
      for (const field of ["observation", "remedy"]) {
        const known = own.find((view) => byRoot.get(view.id)?.get(id)?.has(field));
        if (known) roots.add(known.id);
      }
  }
  return roots;
}

/** Called in the native authority mutation; the same root CAS publishes its evidence and individual knowledge. */
export function retainNativeFact(
  state: VillageState,
  receipt: AcceptedEpisode["commandReceipts"][number],
  at: string,
  meaning: {
    about?: string[];
    class?: ContinuityClass;
    current?: boolean;
    owner?: Extract<ContinuityHolder, { kind: "actor" }>;
    room?: Extract<ContinuityHolder, { kind: "room" }>;
    context?: ContinuityEvidence[];
    provenance?: string[];
    screening?: ContinuityWrite["screening"];
  } = {},
) {
  memoryObject(meaning, ["about", "class", "current", "owner", "room", "context", "provenance", "screening"]);
  const { room } = meaning;
  memoryRequire(
    !room ||
      (meaning.class === undefined &&
        meaning.about === undefined &&
        meaning.current === undefined &&
        !meaning.owner &&
        !meaning.context?.length),
    "room fact cannot carry actor classification",
  );
  memoryRequire(!room || nativeReceiptSupportsRoom(receipt, room), "native receipt does not own this room");
  const id = nativeEpisodeId(state.seed, receipt.id),
    digest = memoryHash([receipt, meaning]);
  const prior = state.episodes.records.find((row) => row.id === id);
  if (prior) {
    memoryRequire(
      memoryHash(prior.commandReceipts[0]) === memoryHash(receipt) && prior.responseDigest === digest,
      "native continuity identity reused",
    );
    return;
  }
  const holders = [...new Set(receipt.witnesses)].flatMap((id) => {
    const holder = continuityActor(state, id);
    return holder ? [holder] : [];
  });
  memoryRequire(holders.length === receipt.witnesses.length, "native continuity has an unknown witness");
  const provenance = meaning.provenance ?? [];
  memoryRequire(
    !provenance.length || (!room && holders.length === 1),
    "private native provenance needs one owning holder",
  );
  for (const versionId of provenance) {
    const version = state.continuity.versions.find((version) => version.id === versionId),
      holder = holders[0],
      key = continuityHolderKey(holder);
    memoryRequire(
      version &&
        state.continuity.records.find((record) => record.id === version.rootId)?.heads[key]?.versionId === version.id &&
        (version.administrative
          ? continuityHolderKey(version.administrative.holder) === key
          : version.id === continuityVersionId(state.seed, version.operationId, holder)),
      "native context is not this holder's captured knowledge",
    );
  }
  const source: ContinuityEvidence = {
    id: "source-" + memoryHash([id, receipt.id]).slice(0, 32),
    seed: state.seed,
    episodeId: id,
    unitId: "native:" + receipt.id,
    fingerprint: memoryHash(receipt),
    kind: "native",
    excerpt: receipt.text,
    committedReceiptId: receipt.id,
    perceptions: holders.map((holder) => ({
      actorId: holder.id,
      channel: receipt.observedBy?.includes(holder.id) ? "sight" : "words",
      text: receipt.text,
    })),
  };
  const actors = holders;
  const subjects = (meaning.about ?? []).map((id) => {
    const actor = continuityActor(state, id);
    memoryRequire(actor, "native subject identity is unavailable");
    return { id: actor.id, incarnation: actor.incarnation };
  });
  const context = meaning.context ?? [];
  memoryRequire(
    context.length <= 8 &&
      (!context.length || receipt.kind === "initialization") &&
      context.every(
        (source) =>
          source.kind === "context" &&
          source.seed === state.seed &&
          source.episodeId === id &&
          source.unitId.startsWith("authored:") &&
          !source.perceptions.length,
      ),
    "native preparation source scope changed",
  );
  const continuity =
    room || holders.length
      ? applyContinuityWrite(
          state.continuity,
          {
            id: "fact",
            holders: room ? [room] : holders,
            ...(meaning.owner ? { owner: meaning.owner } : {}),
            ...(room
              ? { room: { knownBy: receipt.observedBy ?? [] } }
              : {
                  class: meaning.class ?? "experience",
                  about: subjects,
                  ...(meaning.current === undefined ? {} : { current: meaning.current }),
                }),
            text: receipt.text,
            sourceIds: [source.id],
            ...(meaning.screening ? { screening: meaning.screening } : {}),
          },
          {
            seed: state.seed,
            episodeId: id,
            operationId: id,
            at,
            actors,
            subjects,
            ...(room ? { room } : {}),
            sources: [source],
            supplied: [],
            protectedRoots: meaning.screening
              ? state.continuity.records
                  .filter((record) =>
                    (room ? [room] : holders).some((holder) => record.protection[continuityHolderKey(holder)]),
                  )
                  .map((record) => record.id)
              : [],
            protectionFingerprint: meaning.screening
              ? continuityProtectionFingerprint(state.continuity, room ? [room] : holders)
              : undefined,
          },
        )
      : state.continuity;
  const episode: AcceptedEpisode = {
    format: 1,
    id,
    seed: state.seed,
    submissionId: receipt.id,
    operationId: id,
    capturedAt: at,
    acceptedAt: at,
    responseDigest: digest,
    admittedContinuityRevision: state.continuity.revision,
    privateInput: "",
    actors: actors.map((actor) => ({ id: actor.id, incarnation: actor.incarnation, zoneId: "native" })),
    ...(room ? { room } : {}),
    segments: [],
    grounding: [...context, source],
    offered: [],
    commandReceipts: [receipt],
    dependencies:
      context.length || provenance.length
        ? { [source.unitId]: [...context.map(continuitySourceUnit), ...provenance.map(continuityVersionUnit)] }
        : {},
    continuityVersionIds: continuity.versions.slice(state.continuity.versions.length).map((row) => row.id),
  };
  const episodes = appendEpisode(state.episodes, episode, state.seed);
  assertContinuityRetention(continuity, episodes);
  state.continuity = continuity;
  state.episodes = episodes;
}

/** Fresh native creation only; an existing room's current meaning must use its captured heads. */
export function initializeRoomContinuity(
  state: VillageState,
  placeId: string,
  zoneId: string,
  text: string,
  operationId: string,
  at: string,
) {
  const room = { kind: "room" as const, placeId, zoneId };
  memoryRequire(
    findLocation(state, placeId)?.zones?.some((zone) => zone.id === zoneId && zone.description === text),
    "new room does not match its native creation",
  );
  const receipt = {
    id: "room-initial:" + memoryHash([state.seed, operationId, placeId, zoneId]).slice(0, 32),
    kind: "structure" as const,
    targetId: JSON.stringify([placeId, zoneId]),
    revision: 1,
    text,
    witnesses: [],
  };
  const id = nativeEpisodeId(state.seed, receipt.id);
  memoryRequire(
    state.episodes.records.some((row) => row.id === id) ||
      !state.continuity.records.some((record) => record.heads[continuityHolderKey(room)]),
    "room continuity is already initialized",
  );
  retainNativeFact(state, receipt, at, { room });
}
