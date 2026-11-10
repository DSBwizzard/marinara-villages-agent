import type { VillageState } from "../models/world.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import { continuityActor } from "./continuity-actors.js";
import { applyContinuityWrite } from "./continuity.js";
import { appendEpisode } from "./episodes.js";
import { assertContinuityRetention } from "./continuity-retention.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

/** Called in the native authority mutation; the same root CAS publishes its evidence and individual knowledge. */
export function retainNativeFact(
  state: VillageState,
  receipt: AcceptedEpisode["commandReceipts"][number],
  at: string,
  about: string[] = [],
) {
  const id = "native-" + memoryHash([state.seed, receipt.id]).slice(0, 32);
  const prior = state.episodes.records.find((row) => row.id === id);
  if (prior) {
    memoryRequire(memoryHash(prior.commandReceipts[0]) === memoryHash(receipt), "native continuity identity reused");
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
  const actors = holders.length ? holders : [continuityActor(state, "player")!];
  const continuity = holders.length
    ? applyContinuityWrite(
        state.continuity,
        {
          id: "fact",
          holders,
          class: "experience",
          text: receipt.text,
          about,
          sourceIds: [source.id],
        },
        {
          seed: state.seed,
          episodeId: id,
          operationId: id,
          at,
          actors,
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
