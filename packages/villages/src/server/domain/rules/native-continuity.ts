import type { VillageState } from "../models/world.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type {
  ContinuityClass,
  ContinuityEvidence,
  ContinuityHolder,
  ContinuityTarget,
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
  continuityProtectionUnits,
  ROOM_CONTINUITY_TEXT_BYTES,
} from "./continuity.js";
import { appendEpisode } from "./episodes.js";
import { assertContinuityRetention } from "./continuity-retention.js";
import { nativeReceiptSupportsRoom } from "./episode-sources.js";
import { memoryHash, memoryRequire, memoryObject, memoryString } from "./memory-integrity.js";
import { findLocation } from "./places.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import { roomParagraphs } from "./continuity-retrieval.js";
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
  const eligible = new Set(views.map((view) => view.id));
  const roots = new Set(
    state.continuity.versions
      .filter((version) =>
        version.sources.some(
          (source) => source.kind === "native" && source.committedReceiptId && current.has(source.committedReceiptId),
        ),
      )
      .map((version) => version.rootId)
      .filter((id) => eligible.has(id)),
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
    authoredRoomParagraph?: true;
    roomChange?: { target?: ContinuityTarget; retire?: true; expiresInMinutes?: number };
    context?: ContinuityEvidence[];
    provenance?: string[];
    ancestry?: ContinuityEvidence[];
    screening?: ContinuityWrite["screening"];
  } = {},
) {
  memoryObject(meaning, [
    "about",
    "class",
    "current",
    "owner",
    "room",
    "authoredRoomParagraph",
    "roomChange",
    "context",
    "provenance",
    "ancestry",
    "screening",
  ]);
  const { room, roomChange } = meaning;
  memoryRequire(
    !meaning.authoredRoomParagraph ||
      (room &&
        receipt.kind === "structure" &&
        !roomChange &&
        !receipt.witnesses.length &&
        !receipt.observedBy?.length &&
        !meaning.provenance?.length),
    "authored Room paragraph needs native creation authority",
  );
  const roomContext = room && receipt.kind === "circumstance" && receipt.witnesses.length === 0;
  memoryRequire(
    !roomChange ||
      (room &&
        (receipt.kind === "room" || receipt.kind === "structure") &&
        (!roomChange.retire || (roomChange.target && roomChange.expiresInMinutes === undefined))),
    "native Room change needs its exact authority and target",
  );
  memoryRequire(
    !room ||
      (meaning.class === undefined &&
        meaning.about === undefined &&
        meaning.current === undefined &&
        !meaning.owner &&
        !meaning.context?.length),
    "room fact cannot carry actor classification",
  );
  memoryRequire(
    !room || roomContext || nativeReceiptSupportsRoom(receipt, room),
    "native receipt does not own this room",
  );
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
    !provenance.length || (room ? (receipt.kind === "room" || roomContext) && !holders.length : holders.length === 1),
    "private native provenance needs one owning holder",
  );
  for (const versionId of provenance) {
    const version = state.continuity.versions.find((version) => version.id === versionId),
      holder = room ?? holders[0],
      key = continuityHolderKey(holder);
    const head = version && state.continuity.records.find((record) => record.id === version.rootId)?.heads[key];
    memoryRequire(
      version &&
        head &&
        (room ? version.room?.visibility === "observable" : head.versionId === version.id) &&
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
  const ancestry = meaning.ancestry ?? [];
  memoryRequire(
    ancestry.length <= 512 &&
      (!ancestry.length || (receipt.kind === "circumstance" && !room && !holders.length)) &&
      ancestry.every((source) => {
        const episode = state.episodes.records.find((row) => row.id === source.episodeId);
        return (
          source.kind === "native" &&
          source.seed === state.seed &&
          episode?.grounding.some((row) => memoryHash(row) === memoryHash(source)) &&
          episode.commandReceipts.some(
            (row) =>
              row.id === source.committedReceiptId && row.kind === "circumstance" && row.targetId === receipt.targetId,
          )
        );
      }),
    "administrative circumstance lost its canonical ancestry",
  );
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
    (room && !roomContext) || holders.length
      ? applyContinuityWrite(
          state.continuity,
          {
            id: "fact",
            holders: room ? [room] : holders,
            ...(meaning.owner ? { owner: meaning.owner } : {}),
            ...(room
              ? {
                  room: {
                    knownBy: receipt.observedBy ?? [],
                    ...(roomChange?.expiresInMinutes !== undefined
                      ? { expiresInMinutes: roomChange.expiresInMinutes }
                      : {}),
                  },
                  ...(roomChange?.target ? { target: roomChange.target } : {}),
                  ...(roomChange?.retire ? { retire: "ended" as const } : {}),
                }
              : {
                  class: meaning.class ?? "experience",
                  about: subjects,
                  ...(meaning.current === undefined ? {} : { current: meaning.current }),
                }),
            ...(roomChange?.retire ? {} : { text: receipt.text }),
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
            supplied: roomChange?.target ? [roomChange.target] : [],
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
            ...(room && provenance.length
              ? {
                  provenance: { [continuityHolderKey(room)]: provenance.map(continuityVersionUnit) },
                  ...(meaning.screening
                    ? {
                        blockedSources: {
                          [continuityHolderKey(room)]: [
                            ...continuityProtectionUnits(
                              state.continuity,
                              room,
                              episodeSourceGraph(state.episodes.records, room),
                            ),
                          ],
                        },
                      }
                    : {}),
                }
              : {}),
          },
          meaning.authoredRoomParagraph,
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
      context.length || provenance.length || ancestry.length
        ? {
            [source.unitId]: [
              ...context.map(continuitySourceUnit),
              ...provenance.map(continuityVersionUnit),
              ...ancestry.map(continuitySourceUnit),
            ],
          }
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
  memoryString(text, ROOM_CONTINUITY_TEXT_BYTES);
  const creation = "room-initial:" + memoryHash([state.seed, operationId, placeId, zoneId, text]).slice(0, 32);
  const receipts = roomParagraphs(text).map((paragraph, index) => ({
    id: creation + ":" + index,
    kind: "structure" as const,
    targetId: JSON.stringify([placeId, zoneId]),
    revision: 1,
    text: paragraph,
    witnesses: [],
  }));
  memoryRequire(receipts.length, "new Room needs an authored description");
  const ids = new Set(receipts.map((receipt) => nativeEpisodeId(state.seed, receipt.id)));
  const retained = state.episodes.records.filter((row) => ids.has(row.id)).length;
  if (!retained)
    memoryRequire(
      findLocation(state, placeId)?.zones?.some((zone) => zone.id === zoneId && zone.description === text),
      "new room does not match its native creation",
    );
  memoryRequire(
    retained === receipts.length ||
      (!retained && !state.continuity.records.some((record) => record.heads[continuityHolderKey(room)])),
    "room continuity is already initialized",
  );
  const candidate = { ...state };
  for (const receipt of receipts) retainNativeFact(candidate, receipt, at, { room, authoredRoomParagraph: true });
  state.continuity = candidate.continuity;
  state.episodes = candidate.episodes;
}
