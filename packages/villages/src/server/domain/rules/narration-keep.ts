import type {
  ContinuityAdmission,
  ContinuityCollection,
  ContinuityEvidence,
  ContinuityHolder,
  ContinuityWrite,
} from "../models/continuity-model.js";
import { continuityHolderKey } from "./continuity.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { readContinuityProposal, readNarrationEffectHeader } from "./narration-contract.js";
import { assertNarrationSourceOrder, bindNarrationSource, type NarrationSourceContext } from "./narration-sources.js";

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
export function prepareNarrationKeep(
  raw: unknown,
  ordinal: number,
  collection: ContinuityCollection,
  admission: ContinuityAdmission,
  sourceContext: NarrationSourceContext,
) {
  const proposal = readContinuityProposal(raw),
    header = readNarrationEffectHeader(raw, "keep-" + ordinal);
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
  const text = typeof proposal.text === "string" ? proposal.text : (prior?.text ?? "");
  const sourceOwner = {
    holder: holders[0],
    writeId: header.id,
    text,
    class: proposal.class ?? prior?.class ?? ("experience" as const),
  };
  const sources = citedSources(proposal.source.map((ref) => bindNarrationSource(ref, sourceContext, sourceOwner)));
  assertNarrationSourceOrder(sources);
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
  const write: ContinuityWrite = {
    id: header.id,
    holders,
    sourceIds: sources.map((source) => source.id),
    ...(target ? { target } : {}),
    ...(typeof proposal.text === "string" ? { text: proposal.text } : {}),
    ...(proposal.class ? { class: proposal.class } : {}),
    ...(proposal.current !== undefined ? { current: proposal.current } : {}),
    ...(proposal.about ? { about: proposal.about } : {}),
    ...(proposal.parent ? { parentId: proposal.parent } : {}),
    ...(proposal.facet ? { facet: proposal.facet } : {}),
    ...(proposal.retire || proposal.text === null ? { retire: proposal.retire ?? "ended" } : {}),
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
