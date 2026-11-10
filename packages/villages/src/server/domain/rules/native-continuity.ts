import type { VillageState } from "../models/world.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { ContinuityEvidence, ContinuityHolder } from "../models/continuity-model.js";
import { continuityActor } from "./continuity-actors.js";
import { applyContinuityWrite, continuityHolderKey } from "./continuity.js";
import { appendEpisode } from "./episodes.js";
import { assertContinuityRetention } from "./continuity-retention.js";
import { nativeReceiptSupportsRoom } from "./episode-sources.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { findLocation } from "./places.js";

/** Called in the native authority mutation; the same root CAS publishes its evidence and individual knowledge. */
export function retainNativeFact(
  state: VillageState,
  receipt: AcceptedEpisode["commandReceipts"][number],
  at: string,
  about: string[] = [],
  room?: Extract<ContinuityHolder, { kind: "room" }>,
) {
  memoryRequire(!room || nativeReceiptSupportsRoom(receipt, room), "native receipt does not own this room");
  const id = "native-" + memoryHash([state.seed, receipt.id]).slice(0, 32);
  const prior = state.episodes.records.find((row) => row.id === id);
  if (prior) {
    memoryRequire(
      memoryHash(prior.commandReceipts[0]) === memoryHash(receipt) && memoryHash(prior.room) === memoryHash(room),
      "native continuity identity reused",
    );
    return;
  }
  const holders = [...new Set(receipt.witnesses)].flatMap((id) => {
    const holder = continuityActor(state, id);
    return holder ? [holder] : [];
  });
  memoryRequire(holders.length === receipt.witnesses.length, "native continuity has an unknown witness");
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
  const continuity =
    room || holders.length
      ? applyContinuityWrite(
          state.continuity,
          {
            id: "fact",
            holders: room ? [room] : holders,
            ...(room ? { room: { knownBy: receipt.observedBy ?? [] } } : { class: "experience" as const, about }),
            text: receipt.text,
            sourceIds: [source.id],
          },
          {
            seed: state.seed,
            episodeId: id,
            operationId: id,
            at,
            actors,
            ...(room ? { room } : {}),
            sources: [source],
            supplied: [],
            protectedRoots: [],
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
    responseDigest: memoryHash(receipt),
    admittedContinuityRevision: state.continuity.revision,
    privateInput: "",
    actors: actors.map((actor) => ({ id: actor.id, incarnation: actor.incarnation, zoneId: "native" })),
    ...(room ? { room } : {}),
    segments: [],
    grounding: [source],
    offered: [],
    commandReceipts: [receipt],
    dependencies: {},
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
  const id = "native-" + memoryHash([state.seed, receipt.id]).slice(0, 32);
  memoryRequire(
    state.episodes.records.some((row) => row.id === id) ||
      !state.continuity.records.some((record) => record.heads[continuityHolderKey(room)]),
    "room continuity is already initialized",
  );
  retainNativeFact(state, receipt, at, [], room);
}
