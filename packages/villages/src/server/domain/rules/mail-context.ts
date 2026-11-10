import type { VillageState } from "../models/world.js";
import type { MailCapture } from "../models/social-mail.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
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
import { selectActorContinuity } from "./continuity-retrieval.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { mailReceipt, type MailIdentity } from "./mail-evidence.js";
import type { MailPublication } from "./mail-continuity.js";

const scopeKey = (actors: { id: string; incarnation: string }[]) =>
  memoryHash(actors.map(({ id, incarnation }) => ({ id, incarnation })));

/** Correspondence uses bounded common recall and explicit individual knowledge, never a fabricated Scene. */
export function captureMailContext(state: VillageState, residentId: string, query: string, at: string): MailCapture {
  const actors = [continuityActor(state, "player"), continuityActor(state, residentId)];
  memoryRequire(actors.every(Boolean), "mail correspondent is unavailable");
  const holders = actors.filter((actor) => actor !== undefined),
    selected = selectActorContinuity(state.continuity, state.episodes, holders, at, {
      query,
      bytes: 24000,
      requiredIds: [],
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
  const views = holders.flatMap((holder) =>
    continuityViews(
      state.continuity,
      holder,
      at,
      continuityProtectionUnits(state.continuity, holder, episodeSourceGraph(state.episodes.records, holder)),
    ),
  );
  const entries = selected.packet.entries.map((entry) => {
    const holder = holders.find((holder) => holder.id === entry.for)!,
      view = views.find(
        (view) => view.id === entry.id && continuityHolderKey(view.holder) === continuityHolderKey(holder),
      )!;
    for (const source of view.version.sources) sourceEpisodes.add(source.episodeId);
    return { ...entry, source: alias(continuityKnowledge(view, state.seed, "mail-capture"), holder) };
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
      ...references.filter((ref) => !state.villagers.some((resident) => resident.characterId === ref.id)),
    ].map(({ id, incarnation }) => ({ id, incarnation })),
    protection = Object.fromEntries(
      holders.map((holder) => [scopeKey([holder]), continuityProtectionFingerprint(state.continuity, [holder])]),
    );
  for (const pair of [holders, holders.toReversed()]) {
    protection[scopeKey(pair)] = continuityProtectionFingerprint(state.continuity, pair);
    protection[scopeKey([...pair, ...references])] = continuityProtectionFingerprint(state.continuity, [
      ...pair,
      ...references,
    ]);
  }
  memoryRequire(
    subjects.length <= 256 && Object.keys(historical).length <= 1024,
    "mail identity or evidence context exceeds its bound before generation",
  );
  const protections = continuityConstraints(state.continuity, [...holders, ...references]);
  const value: MailCapture = {
    seed: state.seed,
    setupAt: state.setupAt,
    at,
    actors: holders.map(({ id, incarnation }) => ({ id, incarnation })),
    subjects,
    references: references.map(({ id, incarnation }) => ({ id, incarnation })),
    continuityRevision: state.continuity.revision,
    supplied: selected.supplied,
    protection,
    protectedRoots: [...new Set(protections.map((row) => row.id))],
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
    prompt: { entries, history: renderedHistory, protections },
  };
  memoryRequire(
    Buffer.byteLength(JSON.stringify(value)) <= 160000,
    "required mail capture does not fit before generation",
  );
  return value;
}

/** Bind captured aliases to the final exact written artifact without purchasing another interpretation. */
export function mailStagePublication(
  capture: MailCapture,
  mail: MailIdentity,
  text: string,
  phase: "written" | "read",
  keep: unknown[],
  requires: string[],
  responseDigest: string,
  requestId: string,
  replyTo?: string,
): MailPublication {
  const receipt = mailReceipt(capture.seed, mail, text, phase),
    parties = phase === "written" ? [mail.from] : [mail.from, mail.to],
    portrayed = phase === "written" ? mail.from : mail.to,
    holder = { kind: "actor" as const, ...portrayed },
    generated = phase === "written" && mail.from.id !== "player",
    references = generated
      ? [...capture.actors, ...capture.references]
          .filter(
            (actor) =>
              actor.id !== portrayed.id && capture.provenance[continuityHolderKey({ kind: "actor", ...actor })]?.length,
          )
          .map((actor) => ({ kind: "actor" as const, ...actor }))
      : [],
    historical = Object.fromEntries(
      Object.entries(capture.historical)
        .filter(([, source]) => source.kind !== "knowledge" || generated || source.actorId === portrayed.id)
        .map(([ref, source]) => [
          ref,
          source.kind === "knowledge"
            ? {
                ...source,
                episodeId: receipt.id,
                id: "source-" + memoryHash([receipt.id, source.fingerprint]).slice(0, 32),
              }
            : source,
        ]),
    );
  memoryRequire(
    capture.actors.some((actor) => actor.id === mail.from.id && actor.incarnation === mail.from.incarnation) &&
      capture.actors.some((actor) => actor.id === mail.to.id && actor.incarnation === mail.to.incarnation),
    "mail stage changed captured correspondents",
  );
  return {
    setupAt: capture.setupAt,
    mail: {
      id: mail.id,
      at: mail.at,
      from: { id: mail.from.id, incarnation: mail.from.incarnation },
      to: { id: mail.to.id, incarnation: mail.to.incarnation },
    },
    text,
    phase,
    requestId,
    ...(replyTo ? { replyTo } : {}),
    historical,
    keep,
    requires,
    responseDigest,
    admission: {
      seed: capture.seed,
      operationId: receipt.id,
      episodeId: receipt.id,
      at: capture.at,
      actors: parties.map(({ id, incarnation }) => ({ id, incarnation })),
      subjects: capture.subjects,
      continuityRevision: capture.continuityRevision,
      sources: [],
      supplied: capture.supplied,
      protectedRoots: capture.protectedRoots,
      protectionFingerprint:
        capture.protection[scopeKey([mail.from, mail.to, ...(generated ? capture.references : [])])],
      sourceActors: capture.sourceActors,
      provenance: Object.fromEntries(
        [holder, ...references].map((holder) => [
          continuityHolderKey(holder),
          capture.provenance[continuityHolderKey(holder)] ?? [],
        ]),
      ),
    },
  };
}
