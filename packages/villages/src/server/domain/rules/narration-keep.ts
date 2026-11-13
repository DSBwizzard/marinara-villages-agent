import type {
  ContinuityAdmission,
  ContinuityCollection,
  ContinuityEvidence,
  ContinuityHolder,
  ContinuityWrite,
} from "../models/continuity-model.js";
import type { NarrationReadset } from "../models/narration-model.js";
import { continuityHolderKey, ownedContinuityClass } from "./continuity.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { asRecord } from "./coerce.js";
import { readContinuityProposal, readNarrationEffectHeader } from "./narration-contract.js";
import {
  assertNarrationSourceOrder,
  bindNarrationSource,
  type NarrationSourceContext,
  type NarrationSourceOwner,
} from "./narration-sources.js";

/** Combine only explicitly cited projections of the same canonical source, never an unprovided audience. */
function citedSources(values: ContinuityEvidence[]) {
  const result = new Map<string, ContinuityEvidence>();
  for (const source of values) {
    const prior = result.get(source.id);
    if (!prior) {
      result.set(source.id, source);
      continue;
    }
    memoryRequire(
      ["seed", "episodeId", "unitId", "fingerprint", "kind"].every((key) => source[key] === prior[key]),
      "conflicting source projection identity",
    );
    memoryRequire(!source.actorId || !prior.actorId || source.actorId === prior.actorId, "conflicting source authors");
    memoryRequire(!source.act || !prior.act || source.act === prior.act, "conflicting source decisions");
    const perceptions = new Map(prior.perceptions.map((row) => [row.actorId, row]));
    for (const row of source.perceptions) {
      const before = perceptions.get(row.actorId);
      memoryRequire(!before || memoryHash(before) === memoryHash(row), "conflicting source perception");
      perceptions.set(row.actorId, row);
    }
    const full = source.perceptions.some((row) => row.channel !== "sound-only") ? source : prior;
    result.set(source.id, {
      ...full,
      actorId: source.actorId ?? prior.actorId,
      act: source.act ?? prior.act,
      perceptions: [...perceptions.values()],
    });
  }
  return [...result.values()];
}

/** Bind model meaning to the actual fitted read set; revisions, incarnations and fingerprints are code-owned. */
export function prepareContinuityKeep(
  raw: unknown,
  ordinal: number,
  collection: ContinuityCollection,
  admission: ContinuityAdmission,
  sourceContext: Pick<NarrationSourceContext, "seed" | "episodeId" | "actors" | "subjects"> & {
    operationId: string;
    bindSource(ref: unknown, owner: NarrationSourceOwner): ContinuityEvidence;
    resolveTarget?(id: string): string;
    ordinaryDialogue?: true;
  },
) {
  const proposal = readContinuityProposal(raw),
    header = readNarrationEffectHeader(raw, "keep-" + ordinal);
  for (const field of ["replace", "parent"] as const)
    if (proposal[field] && sourceContext.resolveTarget) proposal[field] = sourceContext.resolveTarget(proposal[field]);
  memoryRequire(
    admission.seed === sourceContext.seed &&
      admission.operationId === sourceContext.operationId &&
      admission.episodeId === sourceContext.episodeId,
    "continuity admission identity changed",
  );
  const holders: ContinuityHolder[] =
    proposal.for === "room"
      ? [admission.room].filter(Boolean)
      : proposal.for.map((id) => {
          const actor = sourceContext.actors.find((actor) => actor.id === id);
          memoryRequire(
            actor && admission.actors.some((row) => row.id === actor.id && row.incarnation === actor.incarnation),
            "continuity actor was not admitted",
          );
          return actor;
        });
  memoryRequire(holders.length > 0, "room continuity was not admitted");
  const fittedTarget = proposal.replace
    ? admission.supplied.find((target) => target.id === proposal.replace)
    : undefined;
  const target = fittedTarget && structuredClone(fittedTarget);
  memoryRequire(!proposal.replace || target, "continuity target was not fitted");
  const record = target && collection.records.find((row) => row.id === target.id);
  memoryRequire(!target || record, "fitted continuity root is missing");
  for (const holder of holders)
    if (target && !Object.hasOwn(target.heads, continuityHolderKey(holder))) {
      memoryRequire(
        holder.kind === "actor" && !record!.heads[continuityHolderKey(holder)],
        "existing continuity head was not fitted",
      );
      target.heads[continuityHolderKey(holder)] = 0;
    }
  const prior =
    record &&
    collection.versions.find((version) => version.id === record.heads[continuityHolderKey(holders[0])]?.versionId);
  const learning = record && holders.some((holder) => !record.heads[continuityHolderKey(holder)]);
  const fittedVersions =
    record && fittedTarget
      ? Object.keys(fittedTarget.heads).flatMap((key) => {
          const version = collection.versions.find((version) => version.id === record.heads[key]?.versionId);
          return version ? [version] : [];
        })
      : [];
  const description = fittedVersions[0];
  const about = proposal.about?.map((id) => {
    const prior = [
      ...new Map(
        fittedVersions
          .flatMap((version) => version.about.filter((row) => row.id === id))
          .map((row) => [row.incarnation, row]),
      ).values(),
    ];
    memoryRequire(
      prior.length <= 1,
      "a subject identity is ambiguous across fitted meanings; retain a distinct meaning",
    );
    const subject =
      prior[0] ??
      sourceContext.subjects?.find((row) => row.id === id) ??
      sourceContext.actors.find((row) => row.id === id);
    memoryRequire(subject, "continuity subject identity was not supplied");
    return { id: subject.id, incarnation: subject.incarnation };
  });
  memoryRequire(
    proposal.retire !== null || (record && holders.every((holder) => !record.heads[continuityHolderKey(holder)])),
    "open disclosure cannot reopen an existing holder",
  );
  if (learning) {
    memoryRequire(description, "new knower needs a fitted source head");
    memoryRequire(
      typeof proposal.text === "string" || fittedVersions.every((version) => version.text === description.text),
      "new knower needs explicit meaning for differing fitted heads",
    );
    for (const [field, supplied] of [
      ["class", proposal.class],
      ["about", proposal.about],
      ["parentId", proposal.parent],
      ["facet", proposal.facet],
    ] as const)
      memoryRequire(
        supplied !== undefined ||
          fittedVersions.every(
            (version) => memoryHash(version[field] ?? null) === memoryHash(description[field] ?? null),
          ),
        "new knower needs explicit descriptive metadata for differing fitted heads",
      );
    memoryRequire(
      proposal.retire !== undefined ||
        fittedVersions.every(
          (version) => memoryHash(version.closed ?? null) === memoryHash(description.closed ?? null),
        ),
      "new knower needs explicit closure for differing fitted heads",
    );
  }
  const fittedHeads =
    record && fittedTarget
      ? Object.keys(fittedTarget.heads).flatMap((key) => (record.heads[key] ? [record.heads[key]] : []))
      : [];
  if (learning && proposal.current === undefined)
    memoryRequire(
      fittedHeads.every((head) => head.current === fittedHeads[0].current),
      "new knower needs explicit standing for differing fitted heads",
    );
  const text =
    typeof proposal.text === "string"
      ? proposal.text
      : (prior?.text ?? (learning ? description?.text : undefined) ?? "");
  const inheritedOwner = record
    ? record.owner
    : proposal.parent
      ? collection.records.find((row) => row.id === proposal.parent)?.owner
      : undefined;
  memoryRequire(
    !proposal.owner || !inheritedOwner || proposal.owner === inheritedOwner.id,
    "continuity ownership cannot change",
  );
  const owner =
    inheritedOwner ?? (proposal.owner ? sourceContext.actors.find((actor) => actor.id === proposal.owner) : undefined);
  memoryRequire(!proposal.owner || owner, "continuity owner was not admitted");
  const sourceOwner = {
    holder: owner ?? holders[0],
    writeId: header.id,
    text,
    class: proposal.class ?? prior?.class ?? (learning ? description?.class : undefined) ?? ("experience" as const),
  };
  const sources = citedSources(proposal.source.map((ref) => sourceContext.bindSource(ref, sourceOwner)));
  assertNarrationSourceOrder(sources);
  const speaker = holders[0];
  const dialogueOwner =
    sourceContext.ordinaryDialogue &&
    !owner &&
    !proposal.replace &&
    !proposal.parent &&
    !proposal.offer &&
    !proposal.retire &&
    ownedContinuityClass(sourceOwner.class) &&
    holders.length === 1 &&
    speaker.kind === "actor" &&
    speaker.id !== "player" &&
    sources.length > 0 &&
    sources.every(
      (source) =>
        source.episodeId === sourceContext.episodeId &&
        source.kind === "speech" &&
        source.unitId !== "input" &&
        source.actorId === speaker.id &&
        !/["“”«»‘]|(?:^|[\s,:;])'/u.test(source.excerpt) &&
        /(?:^|[.!?]\s+|\band )I(?:['’]ll| (?:keep|will|won['’]t|intend|want|wish|hope|prefer|plan|promise|refuse|agree))\b/u.test(
          source.excerpt,
        ) &&
        source.perceptions.some((row) => row.actorId === speaker.id && row.channel === "words"),
    )
      ? speaker
      : undefined;
  if (proposal.parent)
    memoryRequire(
      admission.supplied.some((target) => target.id === proposal.parent),
      "continuity parent was not fitted",
    );
  if (proposal.protection)
    memoryRequire(
      proposal.protection.roots.every((id) => admission.protectedRoots.includes(id)),
      "protection root was not fitted",
    );
  let relationship = proposal.relationship;
  const answerOffered =
    about?.length === 1 &&
    about[0].id === "player" &&
    admission.relationshipAnswers?.owners.some(
      (actor) => actor.id === owner?.id && actor.incarnation === owner.incarnation,
    );
  if (relationship?.answer && !answerOffered && (relationship.impact || relationship.romance || holders.length > 1)) {
    // Scene recovery still needs to recognize older mixed private/shared proposals.
    if (!(
      relationship.impact &&
      !relationship.romance &&
      holders.length > 1 &&
      sources.some((source) => source.kind === "self")
    )) {
      const { answer: _answer, ...changes } = relationship;
      relationship = changes.impact || changes.romance ? changes : undefined;
    }
  }
  const write: ContinuityWrite = {
    id: header.id,
    holders,
    ...(owner || dialogueOwner ? { owner: owner ?? dialogueOwner } : {}),
    sourceIds: sources.map((source) => source.id),
    ...(relationship ? { relationship } : {}),
    ...(target ? { target } : {}),
    ...(typeof proposal.text === "string" ? { text: proposal.text } : learning ? { text } : {}),
    ...(proposal.class ? { class: proposal.class } : learning ? { class: description!.class } : {}),
    ...(proposal.current !== undefined
      ? { current: proposal.current }
      : learning
        ? { current: fittedHeads[0].current }
        : {}),
    ...(about ? { about } : learning ? { about: [...description!.about] } : {}),
    ...(proposal.parent
      ? { parentId: proposal.parent }
      : learning && description!.parentId
        ? { parentId: description!.parentId }
        : {}),
    ...(proposal.facet
      ? { facet: proposal.facet }
      : learning && description!.facet
        ? { facet: description!.facet }
        : {}),
    ...(proposal.retire || proposal.text === null
      ? { retire: proposal.retire ?? "ended" }
      : learning && proposal.retire !== null && description!.closed
        ? { retire: description!.closed.reason }
        : {}),
    ...(proposal.offer ? { offer: proposal.offer } : {}),
    ...(proposal.accept ? { accept: proposal.accept } : {}),
    ...(proposal.closeOffer ? { closeOffer: proposal.closeOffer } : {}),
    ...(proposal.visibility !== undefined || proposal.knownBy !== undefined || proposal.expiresInMinutes !== undefined
      ? {
          room: {
            ...(proposal.visibility ? { visibility: proposal.visibility } : {}),
            ...(proposal.knownBy ? { knownBy: proposal.knownBy } : {}),
            ...(proposal.expiresInMinutes !== undefined ? { expiresInMinutes: proposal.expiresInMinutes } : {}),
          },
        }
      : {}),
    ...(proposal.protection
      ? { screening: { ...proposal.protection, fingerprint: admission.protectionFingerprint ?? memoryHash([]) } }
      : {}),
  };
  return {
    header,
    write,
    admission: {
      ...admission,
      sources,
      supplied: target ? admission.supplied.map((row) => (row.id === target.id ? target : row)) : admission.supplied,
    },
    sources,
  };
}

export function prepareNarrationKeep(
  raw: unknown,
  ordinal: number,
  collection: ContinuityCollection,
  admission: ContinuityAdmission,
  sourceContext: NarrationSourceContext,
  ordinaryDialogue?: true,
  ordinaryReplyRecovery?: true,
  recognizeDirectOfferSpeech?: NarrationReadset["recognizeDirectOfferSpeech"],
) {
  if (ordinaryReplyRecovery) {
    const row = asRecord(raw);
    const { proposer, participants, ...fields } = row;
    const flattenedOffer =
      row.class === "offer" &&
      !Object.hasOwn(row, "offer") &&
      typeof proposer === "string" &&
      Array.isArray(participants);
    const canonical = flattenedOffer ? { ...fields, class: "commitment", offer: { proposer, participants } } : row;
    const keep =
      typeof canonical.for === "string" &&
      canonical.for !== "room" &&
      sourceContext.actors.some((actor) => actor.id === canonical.for)
        ? { ...canonical, for: [canonical.for] }
        : canonical;
    raw = keep;
    const proposal = readContinuityProposal(keep);
    const ref = proposal.source[0];
    const segment =
      typeof ref === "string" && /^[A-Za-z][A-Za-z0-9_-]{0,47}$/u.test(ref) && ref !== "self"
        ? { segment: ref }
        : typeof ref === "object" && "segment" in ref && (!ref.act || ref.act === "offer")
          ? ref
          : undefined;
    if (
      proposal.offer &&
      !proposal.replace &&
      proposal.retire === undefined &&
      proposal.source.length === 1 &&
      segment
    ) {
      const id = Object.hasOwn(sourceContext.labels, segment.segment) && sourceContext.labels[segment.segment];
      const line = sourceContext.lines.find((line) => line.id === id);
      const { proposer, participants } = proposal.offer;
      if (
        (recognizeDirectOfferSpeech === 3 || recognizeDirectOfferSpeech === 4 || recognizeDirectOfferSpeech === 5) &&
        proposal.owner === proposer &&
        Array.isArray(proposal.for) &&
        proposal.for.length === 1 &&
        proposal.for[0] === proposer &&
        "act" in segment &&
        segment.act === "offer"
      )
        memoryRequire(
          line?.role === "assistant" &&
            line.kind !== "narration" &&
            line.speakerId === proposer &&
            participants.every((party) => party === proposer || line.heardBy.includes(party)),
          "every offer participant must hear the proposer’s words",
        );
      if (
        line?.role === "assistant" &&
        line.kind !== "narration" &&
        line.speakerId === proposer &&
        participants.every((party) => party === proposer || line.heardBy.includes(party)) &&
        !("perceive" in segment && segment.perceive)
      ) {
        if (
          ("act" in segment && segment.act === "offer") ||
          ((/(?:^|[.!?]\s+)(?:come\b[^.!?]{0,120}\band I['’]ll\b|if you want\b[^.!?]{0,130},\s*say yes and I['’]ll\b)/iu.test(
            line.content,
          ) ||
            (recognizeDirectOfferSpeech === true &&
              /^(?:then )?say the word and I['’]ll walk you through\b/iu.test(line.content))) &&
            !/["“”«»‘]|(?:^|[\s,:;])'/u.test(line.content))
        ) {
          const { owner, ...withoutOwner } = keep;
          raw = { ...(owner === proposer ? withoutOwner : keep), source: [{ ...segment, act: "offer" }] };
        }
      }
    }
  }
  return prepareContinuityKeep(raw, ordinal, collection, admission, {
    ...sourceContext,
    operationId: sourceContext.episodeId,
    ordinaryDialogue,
    bindSource: (ref, owner) => bindNarrationSource(ref, sourceContext, owner),
    resolveTarget: (id) => {
      if (!id.startsWith("h:")) return id;
      const evidence = Object.hasOwn(sourceContext.historical, id) && sourceContext.historical[id];
      const version =
        evidence &&
        evidence.kind === "knowledge" &&
        evidence.seed === sourceContext.seed &&
        evidence.episodeId === sourceContext.episodeId &&
        collection.versions.find((row) => row.id === evidence.unitId);
      const target = version && admission.supplied.find((row) => row.id === version.rootId);
      const record = target && collection.records.find((row) => row.id === target.id);
      memoryRequire(
        version &&
          target &&
          record &&
          evidence &&
          Object.entries(record.heads).some(
            ([key, head]) =>
              head.holder.kind === "actor" &&
              head.holder.id === evidence.actorId &&
              head.versionId === version.id &&
              target.heads[key] === head.revision,
          ),
        "continuity target was not fitted or its holder changed",
      );
      return version.rootId;
    },
  });
}
