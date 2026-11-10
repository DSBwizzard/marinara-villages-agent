import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import type { VillageState } from "../models/world.js";
import type { MailContinuityPlan } from "../models/social-mail.js";
import { episodeSourceGraph } from "../decoding/episode-codec.js";
import { readMailboxState, assertMailboxRetention } from "../decoding/mailbox-codec.js";
import { continuityActor } from "./continuity-actors.js";
import {
  applyContinuityWrite,
  assertContinuityProvenance,
  assertContinuityKnowledge,
  continuityHolderKey,
  continuityProtectionFingerprint,
  continuityProtectionUnits,
  continuitySelfSource,
  continuitySourceUnit,
} from "./continuity.js";
import { assertContinuityRetention } from "./continuity-retention.js";
import { appendEpisode } from "./episodes.js";
import { mailReceipt, mailEvidence, type MailIdentity } from "./mail-evidence.js";
import { prepareContinuityKeep } from "./narration-keep.js";
import { readContinuityProposal, readNarrationEffectHeader } from "./narration-contract.js";
import { selectSceneEffects, type SceneEffectResult } from "./scene-acceptance.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { episodeContextActors } from "./episode-sources.js";

export type MailPublication = MailContinuityPlan & {
  mail: MailIdentity;
  text: string;
  requestId: string;
  replyTo?: string;
  phase: "written" | "read";
  reading?: MailContinuityPlan;
};

/** One letter stage, shared meanings and its native envelope publish in the existing Village CAS. */
export function acceptMailContinuity(state: VillageState, publication: MailPublication, acceptedAt: string) {
  const { text, phase } = publication,
    original = state.mailbox.messages[publication.mail.id],
    reading = phase === "written" ? publication.reading : original?.reading,
    receipt = mailReceipt(
      publication.admission.seed,
      publication.mail,
      text,
      phase,
      reading ? memoryHash(reading) : undefined,
    ),
    mail: MailIdentity = { id: receipt.mail!.id, at: receipt.mail!.at, from: receipt.mail!.from, to: receipt.mail!.to },
    digest = memoryHash({ ...publication, mail }),
    prior = state.episodes.records.find((row) => row.id === receipt.id);
  if (prior) {
    memoryRequire(prior.responseDigest === digest, "accepted letter stage identity reused");
    return {
      held: false as const,
      episode: prior,
      acceptedIds: [] as string[],
      rejected: [] as { id: string; reason: string }[],
      replayed: true,
    };
  }
  memoryRequire(
    state.seed === publication.admission.seed && state.setupAt === publication.setupAt,
    "mail world changed",
  );
  memoryRequire(publication.keep.length <= 32 && publication.requires.length <= 48, "too many mail effects");
  memoryRequire(
    publication.admission.episodeId === receipt.id &&
      publication.admission.operationId === receipt.id &&
      !Object.hasOwn(publication.admission, "room"),
    "mail admission changed its native stage identity",
  );
  const parties = phase === "written" ? [mail.from] : [mail.from, mail.to],
    actors = parties.map((party) => ({ kind: "actor" as const, id: party.id, incarnation: party.incarnation })),
    present = phase === "written" ? [mail.from, mail.to] : [mail.to];
  memoryRequire(
    memoryHash(publication.admission.actors) ===
      memoryHash(parties.map(({ id, incarnation }) => ({ id, incarnation }))) &&
      present.every((party) => continuityActor(state, party.id)?.incarnation === party.incarnation),
    "mail correspondent incarnation changed",
  );
  if (phase === "read" && reading) {
    const {
      mail: _mail,
      text: _text,
      requestId: _request,
      replyTo: _reply,
      phase: _phase,
      reading: _reading,
      ...plan
    } = publication;
    memoryRequire(memoryHash(plan) === memoryHash(reading), "letter reading changed its saved meaning or capture");
  }
  memoryRequire(
    !original ||
      (original.text === text &&
        original.requestId === publication.requestId &&
        memoryHash([original.id, original.at, original.from, original.to, original.replyTo]) ===
          memoryHash([mail.id, mail.at, mail.from, mail.to, publication.replyTo])),
    "mail envelope changed its admitted source",
  );
  memoryRequire(
    phase === "written"
      ? !original || original.status === "pending"
      : original?.status === "delivered" && !original.readAt,
    "mail stage is no longer eligible",
  );
  const generated = phase === "written" && mail.from.id !== "player",
    references = episodeContextActors({ actors: parties }, Object.keys(publication.admission.provenance ?? {}));
  memoryRequire(
    publication.admission.protectionFingerprint ===
      continuityProtectionFingerprint(state.continuity, [
        ...[mail.from, mail.to].map((party) => ({ kind: "actor" as const, ...party })),
        ...references.filter((holder) => holder.id !== mail.from.id && holder.id !== mail.to.id),
      ]),
    "mail continuity protection changed",
  );
  memoryRequire(
    references.every(
      (holder) =>
        generated &&
        publication.admission.subjects?.some(
          (subject) => subject.id === holder.id && subject.incarnation === holder.incarnation,
        ),
    ),
    "mail private context changed its captured reference holder",
  );
  const contexts = [...actors, ...references];
  const blocked = Object.fromEntries(
    contexts.map((actor) => [
      continuityHolderKey(actor),
      [...continuityProtectionUnits(state.continuity, actor, episodeSourceGraph(state.episodes.records, actor))],
    ]),
  );
  for (const actor of contexts)
    assertContinuityProvenance(
      publication.admission.provenance?.[continuityHolderKey(actor)] ?? [],
      new Set(blocked[continuityHolderKey(actor)]),
    );
  const admission = {
      ...publication.admission,
      at: phase === "read" && reading ? acceptedAt : publication.admission.at,
      actors: parties.map(({ id, incarnation }) => ({ id, incarnation })),
      blockedSources: blocked,
    },
    effects: SceneEffectResult[] = [],
    prepared = new Map<string, ReturnType<typeof prepareContinuityKeep>>();
  const portrayedId = phase === "written" ? mail.from.id : mail.to.id,
    fittedKnowledge = Object.values(publication.historical).filter((source) => source.kind === "knowledge");
  for (const source of fittedKnowledge) {
    memoryRequire(
      source.seed === state.seed &&
        source.episodeId === receipt.id &&
        (source.actorId === portrayedId || references.some((holder) => holder.id === source.actorId)),
      "mail fitted knowledge changed its holder or stage",
    );
    assertContinuityKnowledge(
      state.continuity,
      source,
      contexts,
      admission.continuityRevision!,
      admission.sourceActors,
    );
  }
  for (const [ordinal, raw] of publication.keep.entries()) {
    let header: ReturnType<typeof readNarrationEffectHeader>;
    try {
      header = readNarrationEffectHeader(raw, "keep-" + ordinal);
    } catch (error) {
      effects.push({ id: "keep-" + ordinal, requires: [], failure: String(error).slice(0, 2000) });
      continue;
    }
    const effect: SceneEffectResult = { ...header };
    try {
      const proposal = readContinuityProposal(raw);
      memoryRequire(
        Array.isArray(proposal.for) &&
          proposal.for.every((id) => id === (phase === "written" ? mail.from.id : mail.to.id)),
        "mail stage may retain only its actual writer or reader",
      );
      const act =
        proposal.offer?.proposer === mail.from.id
          ? "offer"
          : proposal.accept === mail.from.id
            ? "accept"
            : proposal.closeOffer?.by === mail.from.id
              ? proposal.closeOffer.reason === "refused"
                ? "refuse"
                : "withdraw"
              : undefined;
      prepared.set(
        header.id,
        prepareContinuityKeep(raw, ordinal, state.continuity, admission, {
          seed: state.seed,
          episodeId: receipt.id,
          operationId: receipt.id,
          actors,
          subjects: admission.subjects,
          bindSource(ref, owner) {
            if (ref === "letter") return mailEvidence(receipt.id, state.seed, receipt, act);
            if (ref === "self") {
              memoryRequire(
                owner.holder.kind === "actor" && owner.holder.id === (phase === "written" ? mail.from.id : mail.to.id),
                "mail self belongs only to its portrayed writer or reader",
              );
              return continuitySelfSource({ seed: state.seed, episodeId: receipt.id, operationId: receipt.id }, owner);
            }
            memoryRequire(
              typeof ref === "string" && ref.startsWith("h:") && Object.hasOwn(publication.historical, ref),
              "mail source was not fitted",
            );
            const source = publication.historical[ref];
            memoryRequire(source.seed === state.seed, "mail historical source belongs to another world");
            return structuredClone(source);
          },
        }),
      );
    } catch (error) {
      effect.failure = error instanceof Error ? error.message.slice(0, 2000) : String(error).slice(0, 2000);
    }
    effects.push(effect);
  }
  let continuity = state.continuity;
  let selection: ReturnType<typeof selectSceneEffects>;
  for (;;) {
    selection = selectSceneEffects(effects, publication.requires);
    if (selection.held) return { ...selection, episode: undefined, replayed: false };
    continuity = state.continuity;
    let failed = false;
    for (const id of selection.acceptedIds) {
      const keep = prepared.get(id)!;
      try {
        continuity = applyContinuityWrite(continuity, keep.write, keep.admission);
      } catch (error) {
        effects.find((effect) => effect.id === id)!.failure = String(error).slice(0, 2000);
        failed = true;
      }
    }
    if (!failed) break;
  }
  const versions = continuity.versions.slice(state.continuity.versions.length),
    sources = [...fittedKnowledge, ...selection.acceptedIds.flatMap((id) => prepared.get(id)!.sources)],
    grounding = new Map<string, ContinuityEvidence>(),
    holderDependencies: NonNullable<AcceptedEpisode["holderDependencies"]> = {};
  for (const source of sources.filter((source) => source.episodeId === receipt.id)) {
    const prior = grounding.get(source.id);
    memoryRequire(!prior || memoryHash(prior) === memoryHash(source), "conflicting accepted mail source identity");
    grounding.set(source.id, source);
  }
  const witness = actors.find((actor) => actor.id === (phase === "written" ? mail.from.id : mail.to.id))!;
  holderDependencies[continuityHolderKey(witness)] = {
    ["mail:" + receipt.mail!.sourceHash]:
      phase === "written" && mail.from.id !== "player"
        ? (admission.provenance?.[continuityHolderKey(witness)] ?? [])
        : [],
  };
  for (const holder of references)
    holderDependencies[continuityHolderKey(holder)] = {
      ["mail:" + receipt.mail!.sourceHash]: admission.provenance?.[continuityHolderKey(holder)] ?? [],
    };
  for (const version of versions) {
    const record = continuity.records.find((row) => row.id === version.rootId)!;
    for (const head of Object.values(record.heads).filter((head) => head.versionId === version.id)) {
      const key = continuityHolderKey(head.holder);
      (holderDependencies[key] ??= {})["version:" + version.id] = [
        ...new Set([
          ...(admission.provenance?.[key] ?? []),
          ...version.sources.filter((source) => source.kind !== "self").map(continuitySourceUnit),
        ]),
      ];
    }
  }
  const episode: AcceptedEpisode = {
    format: 1,
    id: receipt.id,
    seed: state.seed,
    submissionId: receipt.id,
    operationId: receipt.id,
    capturedAt: admission.at,
    acceptedAt,
    responseDigest: digest,
    admittedContinuityRevision: admission.continuityRevision ?? state.continuity.revision,
    privateInput: "",
    actors: actors.map(({ id, incarnation }) => ({ id, incarnation, zoneId: "native" })),
    segments: [],
    grounding: [...grounding.values()],
    continuityVersionIds: versions.map((version) => version.id),
    offered: [],
    commandReceipts: [receipt],
    dependencies: {},
    holderDependencies,
  };
  const episodes = appendEpisode(state.episodes, episode, state.seed),
    mailbox = readMailboxState(
      {
        ...state.mailbox,
        revision: state.mailbox.revision + 1,
        messages: {
          ...state.mailbox.messages,
          [mail.id]:
            phase === "written"
              ? {
                  ...mail,
                  requestId: publication.requestId,
                  text,
                  status: "delivered",
                  deliveredAt: admission.at,
                  ...(publication.replyTo ? { replyTo: publication.replyTo } : {}),
                  ...(reading ? { reading } : {}),
                }
              : { ...original, readAt: admission.at },
        },
      },
      state.seed,
    );
  assertContinuityRetention(continuity, episodes);
  assertMailboxRetention(mailbox, episodes, state.seed);
  state.continuity = continuity;
  state.episodes = episodes;
  state.mailbox = mailbox;
  return { ...selection, episode: episodes.records.at(-1)!, replayed: false };
}
