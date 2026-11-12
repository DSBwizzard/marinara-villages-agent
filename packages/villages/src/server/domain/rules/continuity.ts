import type {
  ContinuityAdmission,
  ContinuityCollection,
  ContinuityEvidence,
  ContinuityHolder,
  ContinuityRecord,
  ContinuityTarget,
  ContinuityVersion,
  ContinuityView,
  ContinuityWrite,
  RelationshipImpact,
} from "../models/continuity-model.js";
import { memoryHash, memoryKnowerId, memoryRequire, memoryString, memoryTimestamp } from "./memory-integrity.js";

export const CONTINUITY_TEXT_BYTES = 2400;
export const ROOM_CONTINUITY_TEXT_BYTES = 16000;
export const RELATIONSHIP_ANSWER_WORD_LIMIT = 15;
const relationshipSentence = new Intl.Segmenter("en", { granularity: "sentence" });
const relationshipWords = new Intl.Segmenter("en", { granularity: "word" });

export function isRelationshipAnswer(answer: unknown): answer is string {
  if (typeof answer !== "string" || Buffer.byteLength(answer) > 320 || /[\r\n\u0085\u2028\u2029]/u.test(answer))
    return false;
  // ICU suppresses breaks before lowercase words; check those as sentence starts too.
  const sentence = answer.replace(/(\.["'”’)]*\s+)(\p{Ll})/gu, (_, end, letter: string) => end + letter.toUpperCase());
  const words = [...relationshipWords.segment(answer)].filter((word) => word.isWordLike).length;
  return (
    words > 0 && words <= RELATIONSHIP_ANSWER_WORD_LIMIT && [...relationshipSentence.segment(sentence)].length === 1
  );
}

export const RELATIONSHIP_IMPACTS = {
  "small-positive": 3,
  "meaningful-positive": 6,
  "turning-positive": 10,
  "small-negative": -3,
  "meaningful-negative": -6,
  "turning-negative": -10,
} satisfies Record<RelationshipImpact, number>;

type ActorIdentity = { id: string; incarnation: string };
export const relationshipKey = (owner: ActorIdentity, subject: ActorIdentity) =>
  JSON.stringify([owner.id, owner.incarnation, subject.id, subject.incarnation]);

function latestRelationshipVersions(collection: ContinuityCollection, field: "relationshipScore" | "romanticInterest") {
  const owners = new Map(collection.records.map((record) => [record.id, record.owner]));
  const latest = new Map<string, ContinuityVersion>();
  for (const version of collection.versions) {
    if (version[field] === undefined) continue;
    const owner = owners.get(version.rootId);
    if (!owner || !version.about[0]) continue;
    const key = relationshipKey(owner, version.about[0]);
    if ((latest.get(key)?.createdRevision ?? 0) < version.createdRevision) latest.set(key, version);
  }
  return latest;
}

export const latestRelationshipScores = (collection: ContinuityCollection) =>
  latestRelationshipVersions(collection, "relationshipScore");
export const latestRomanticInterests = (collection: ContinuityCollection) =>
  latestRelationshipVersions(collection, "romanticInterest");

export const ownedContinuityClass = (value: string) =>
  ["perspective", "desire", "motivation", "commitment"].includes(value);
export function continuitySelfSource(
  context: { seed: string; episodeId: string; operationId: string },
  owner: { holder: ContinuityHolder; writeId: string; text: string; class: ContinuityVersion["class"] },
): ContinuityEvidence {
  memoryRequire(
    owner.holder.kind === "actor" && owner.holder.id !== "player" && ownedContinuityClass(owner.class),
    "self belongs only to a non-player's private perspective",
  );
  const versionId = continuityVersionId(context.seed, context.operationId + ":" + owner.writeId, owner.holder);
  return {
    id: "source-" + memoryHash([context.episodeId, versionId]).slice(0, 32),
    seed: context.seed,
    episodeId: context.episodeId,
    unitId: versionId,
    fingerprint: memoryHash([versionId, owner.class, owner.text, continuityHolderKey(owner.holder)]),
    excerpt: owner.text,
    kind: "self",
    actorId: owner.holder.id,
    perceptions: [],
  };
}
export const continuityHolderKey = (holder: ContinuityHolder) =>
  holder.kind === "actor"
    ? JSON.stringify(["actor", holder.id, holder.incarnation])
    : JSON.stringify(["room", holder.placeId, holder.zoneId]);
export const emptyContinuity = (): ContinuityCollection => ({
  format: 1,
  revision: 0,
  records: [],
  versions: [],
  receipts: {},
});
export const continuityVersionUnit = (id: string) => JSON.stringify(["version", id]);
export function continuityProtectionFingerprint(collection: ContinuityCollection, holders: ContinuityHolder[]) {
  return memoryHash(
    collection.records.flatMap((record) =>
      holders.flatMap((holder) => {
        const key = continuityHolderKey(holder),
          protection = record.protection[key];
        return protection ? [[record.id, key, protection]] : [];
      }),
    ),
  );
}
export function continuityConstraints(collection: ContinuityCollection, holders: ContinuityHolder[]) {
  return collection.records.flatMap((record) =>
    holders.flatMap((holder) => {
      const protection = record.protection[continuityHolderKey(holder)];
      if (!protection) return [];
      return [
        {
          id: record.id,
          for: holder.kind === "actor" ? holder.id : "room",
          forgotten: protection.forgotten === true,
          forbidden: [
            ...new Set(
              collection.versions
                .filter((version) => protection.sourceUnits.includes(continuityVersionUnit(version.id)))
                .map((version) => version.text),
            ),
          ],
          ...(protection.repair &&
          (holder.kind !== "room" ||
            record.heads[continuityHolderKey(holder)]?.versionId === protection.repair.versionId)
            ? { corrected: collection.versions.find((version) => version.id === protection.repair!.versionId)!.text }
            : {}),
        },
      ];
    }),
  );
}
/** Pending anchors may not exist in history yet; their canonical version is already protected. */
export function assertContinuityProvenance(dependencies: readonly string[], blocked: ReadonlySet<string>) {
  const units = dependencies.flatMap((dependency) => {
    const unit: unknown = JSON.parse(dependency);
    memoryRequire(Array.isArray(unit), "invalid fitted provenance unit");
    return unit[0] === "knowledge" && unit.length === 4 && unit[3] === 1 && typeof unit[1] === "string"
      ? [dependency, continuityVersionUnit(unit[1])]
      : [dependency];
  });
  memoryRequire(!units.some((unit) => blocked.has(unit)), "protected continuity source descendant");
  return units;
}
export const continuitySourceUnit = (source: ContinuityEvidence) =>
  source.kind === "knowledge"
    ? JSON.stringify(["knowledge", source.unitId, source.fingerprint, 1])
    : JSON.stringify([
        source.episodeId,
        source.unitId,
        source.fingerprint,
        ...(source.range ? [source.range.start, source.range.end] : []),
      ]);
const unit = continuitySourceUnit;
const same = (a: unknown, b: unknown) => memoryHash(a) === memoryHash(b);
export const continuityRootId = (seed: string, operationId: string) =>
  "continuity-" + memoryHash([seed, operationId]).slice(0, 32);
export const continuityVersionId = (seed: string, operationId: string, holder: ContinuityHolder) =>
  "continuity-version-" + memoryHash([seed, operationId, continuityHolderKey(holder)]).slice(0, 32);

export function continuityProtectionUnits(
  collection: ContinuityCollection,
  holder: ContinuityHolder,
  graph: ReadonlyMap<string, ReadonlySet<string>>,
) {
  const key = continuityHolderKey(holder),
    blocked = new Set(collection.records.flatMap((row) => row.protection[key]?.sourceUnits ?? [])),
    queue = [...blocked];
  for (let index = 0; index < queue.length; index++)
    for (const child of graph.get(queue[index]) ?? [])
      if (!blocked.has(child)) {
        blocked.add(child);
        queue.push(child);
      }
  return blocked;
}

function holderAllowed(holder: ContinuityHolder, context: ContinuityAdmission) {
  if (holder.kind === "room") return context.room && same(holder, context.room);
  memoryKnowerId(holder.id);
  return context.actors.some((actor) => actor.id === holder.id && actor.incarnation === holder.incarnation);
}
function perceived(source: ContinuityEvidence, actorId: string) {
  if (source.kind === "context") return false;
  if (source.kind === "self" || source.kind === "private" || source.kind === "knowledge")
    return source.actorId === actorId;
  if (source.kind === "native") return source.perceptions.some((row) => row.actorId === actorId);
  return source.actorId === actorId || source.perceptions.some((row) => row.actorId === actorId);
}
function heardWords(source: ContinuityEvidence, actorId: string) {
  return (
    (source.kind === "speech" || source.kind === "written") &&
    (source.actorId === actorId || source.perceptions.some((row) => row.actorId === actorId && row.channel === "words"))
  );
}
/** A later reader may learn the same signed letter, never a previously unheard spoken contribution. */
export function continuityOfferSource(
  source: ContinuityEvidence,
  holder: Extract<ContinuityHolder, { kind: "actor" }>,
  version: ContinuityVersion,
  collection: ContinuityCollection,
  eventId: string,
) {
  const known = [version, ...collection.versions]
    .filter(
      (row) =>
        row.rootId === version.rootId &&
        row.createdRevision <= version.createdRevision &&
        (row === version || row.offerEvents?.includes(eventId)) &&
        row.id === continuityVersionId(source.seed, row.operationId, holder),
    )
    .flatMap((row) => row.sources);
  if (heardWords(source, holder.id) && known.some((row) => memoryHash(row) === memoryHash(source))) return source;
  const read =
    source.kind === "written" &&
    known.find(
      (row) =>
        row.kind === "written" &&
        row.unitId === source.unitId &&
        row.fingerprint === source.fingerprint &&
        row.actorId === source.actorId &&
        row.excerpt === source.excerpt &&
        heardWords(row, holder.id),
    );
  return read || undefined;
}
export function actorContinuityEvidence(source: ContinuityEvidence, actorId: string): ContinuityEvidence {
  memoryRequire(perceived(source, actorId), "unwitnessed saved continuity source");
  const perception = source.perceptions.find((row) => row.actorId === actorId),
    acoustic = perception?.channel === "sound-only" && source.actorId !== actorId;
  const excerpt = perception?.text ?? source.excerpt;
  return {
    id: source.id,
    seed: source.seed,
    episodeId: source.episodeId,
    unitId: source.unitId,
    fingerprint: source.fingerprint,
    kind: source.kind,
    excerpt,
    perceptions: perception ? [structuredClone(perception)] : [],
    ...(!acoustic && source.actorId ? { actorId: source.actorId } : {}),
    ...(!acoustic && source.act ? { act: source.act } : {}),
    ...(source.range && excerpt === source.excerpt ? { range: { ...source.range } } : {}),
    ...(source.committedReceiptId ? { committedReceiptId: source.committedReceiptId } : {}),
  };
}
export function assertContinuitySoundIdentity(
  version: ContinuityVersion,
  holder: Extract<ContinuityHolder, { kind: "actor" }>,
  owner?: ContinuityRecord["owner"],
  prior?: ContinuityVersion,
) {
  if (
    version.sources.every(
      (source) => source.perceptions.find((row) => row.actorId === holder.id)?.channel === "sound-only",
    )
  )
    memoryRequire(
      version.about.every((subject) => prior?.about.some((known) => same(known, subject))) &&
        (!owner || same(owner, holder) || prior),
      "anonymous sound cannot establish subject identities",
    );
}
function resolveSources(write: ContinuityWrite, context: ContinuityAdmission) {
  memoryRequire(write.sourceIds.length > 0 && write.sourceIds.length <= 8, "missing continuity support");
  return write.sourceIds.map((id) => {
    const source = context.sources.find((row) => row.id === id);
    memoryRequire(source && source.seed === context.seed, "continuity source was not supplied");
    memoryRequire(source.kind !== "native" || source.committedReceiptId, "uncommitted native source");
    return structuredClone(source);
  });
}
function targetRecord(collection: ContinuityCollection, target: ContinuityTarget, context: ContinuityAdmission) {
  const supplied = context.supplied.find((row) => row.id === target.id);
  memoryRequire(supplied && same(supplied, target), "continuity target was not supplied");
  const record = collection.records.find((row) => row.id === target.id);
  memoryRequire(record && record.revision === target.recordRevision, "continuity target changed");
  for (const [key, revision] of Object.entries(target.heads))
    memoryRequire((record.heads[key]?.revision ?? 0) === revision, "continuity holder changed");
  return record;
}
function checkProtection(
  collection: ContinuityCollection,
  write: ContinuityWrite,
  sources: ContinuityEvidence[],
  context: ContinuityAdmission,
) {
  if (context.protectedRoots.length)
    memoryRequire(
      write.screening?.disposition === "clear" &&
        context.protectionFingerprint &&
        write.screening.fingerprint === context.protectionFingerprint &&
        write.screening.roots.every((id) => context.protectedRoots.includes(id)),
      "continuity protection needs clear screening",
    );
  for (const holder of write.holders) {
    const key = continuityHolderKey(holder);
    const provenance = assertContinuityProvenance(
      context.provenance?.[key] ?? [],
      new Set(context.blockedSources?.[key] ?? []),
    );
    memoryRequire(
      !sources.some(
        (source) =>
          context.blockedSources?.[key]?.includes(unit(source)) ||
          (source.kind === "knowledge" &&
            context.blockedSources?.[key]?.includes(continuityVersionUnit(source.unitId))),
      ),
      "protected continuity source descendant",
    );
    for (const record of collection.records) {
      const protection = record.protection[key];
      if (!protection) continue;
      memoryRequire(
        !sources.some(
          (source) =>
            protection.sourceUnits.includes(unit(source)) ||
            (source.kind === "knowledge" && protection.sourceUnits.includes(continuityVersionUnit(source.unitId))),
        ) && !provenance.some((unit) => protection.sourceUnits.includes(unit)),
        "protected continuity source replay",
      );
      const corrected = collection.versions.find((version) => version.id === protection.repair?.versionId)?.text;
      if (holder.kind === "room" && write.text !== undefined && write.text !== corrected)
        memoryRequire(
          !collection.versions.some(
            (version) =>
              protection.sourceUnits.includes(continuityVersionUnit(version.id)) &&
              version.text.trim() === write.text!.trim(),
          ),
          "protected Room text cannot be restored",
        );
      if (record.id === write.target?.id) {
        memoryRequire(!protection.forgotten, "forgotten continuity target");
        const freshRoom =
          holder.kind === "room" &&
          write.screening?.roots.includes(record.id) &&
          sources.every(
            (source) =>
              source.episodeId === context.episodeId && (source.kind === "observation" || source.kind === "native"),
          );
        memoryRequire(
          write.text === undefined || write.text === corrected || freshRoom,
          "corrected continuity target conflict",
        );
      }
    }
  }
}
function contribution(
  sources: ContinuityEvidence[],
  actorId: string,
  act: ContinuityEvidence["act"],
  episodeId: string,
) {
  const result = sources.filter(
    (source) =>
      (source.kind === "speech" ||
        (source.kind === "written" && source.committedReceiptId?.startsWith("mail-written-"))) &&
      source.actorId === actorId &&
      source.act === act &&
      source.episodeId === episodeId,
  );
  memoryRequire(result.length > 0, "offer decision needs actual deciding speech");
  return result;
}

/** One common write; the feature commits its result with the episode/native receipts in the Village CAS. */
export function applyContinuityWrite(
  collection: ContinuityCollection,
  write: ContinuityWrite,
  context: ContinuityAdmission,
  authoredRoomParagraph = false,
): ContinuityCollection {
  memoryString(context.seed, 160);
  memoryString(context.operationId, 160);
  memoryRequire(!context.operationId.startsWith("narration-abandoned:"), "reserved narration receipt namespace");
  memoryString(context.episodeId, 160);
  memoryTimestamp(context.at);
  memoryString(write.id, 48);
  memoryRequire(
    write.holders.length > 0 &&
      write.holders.length <= 32 &&
      new Set(write.holders.map(continuityHolderKey)).size === write.holders.length &&
      write.holders.every((holder) => holderAllowed(holder, context)),
    "invalid continuity holders",
  );
  const room = write.holders.find((holder) => holder.kind === "room");
  memoryRequire(
    !authoredRoomParagraph ||
      (room && !write.target && !write.retire && !write.room?.expiresInMinutes && !write.room?.knownBy?.length),
    "authored Room paragraphs require a fresh Room entry",
  );
  memoryRequire(
    !room ||
      (write.class === undefined &&
        write.current === undefined &&
        write.about === undefined &&
        !write.parentId &&
        !write.facet &&
        !write.owner),
    "room continuity has no actor classification",
  );
  memoryRequire(!room || write.holders.length === 1, "room and actor continuity cannot mix");
  memoryRequire(!write.room || room, "actor continuity cannot change room condition");
  memoryRequire(!room || (!write.offer && !write.accept && !write.closeOffer), "room cannot make an agreement");
  memoryRequire(
    [write.accept, write.closeOffer, write.retire].filter(Boolean).length <= 1,
    "conflicting continuity operations",
  );
  const operationId = context.operationId + ":" + write.id;
  memoryRequire(!operationId.startsWith("narration-abandoned:"), "reserved narration receipt namespace");
  const fingerprint = memoryHash([write, context.seed, context.sources]);
  const receipt = collection.receipts[operationId];
  if (receipt) {
    memoryRequire(receipt.fingerprint === fingerprint, "continuity operation identity reused");
    return collection;
  }
  const sources = resolveSources(write, context);
  if (authoredRoomParagraph)
    memoryRequire(
      sources.length === 1 &&
        sources[0].kind === "native" &&
        sources[0].episodeId === context.episodeId &&
        sources[0].excerpt === write.text &&
        !sources[0].perceptions.length &&
        write.room?.visibility !== "concealed",
      "authored Room paragraph lost its native source",
    );
  for (const source of sources)
    if (source.kind === "knowledge") {
      memoryRequire(context.continuityRevision !== undefined, "knowledge anchor needs its admitted revision");
      assertContinuityKnowledge(collection, source, context.actors, context.continuityRevision, context.sourceActors);
    }
  const roomKnowers = (write.room?.knownBy ?? []).map((id): ContinuityHolder => {
    const actor = context.actors.find((actor) => actor.id === id);
    memoryRequire(actor, "unknown concealed knower");
    memoryRequire(
      sources.every(
        (source) =>
          (source.actorId === id || source.perceptions.some((row) => row.actorId === id && row.channel === "sight")) &&
          (source.episodeId === context.episodeId ? context.actors : context.sourceActors?.[source.episodeId])?.some(
            (original) => original.id === id && original.incarnation === actor.incarnation,
          ),
      ),
      "unwitnessed concealed knowledge",
    );
    return { kind: "actor", id: actor.id, incarnation: actor.incarnation };
  });
  checkProtection(collection, { ...write, holders: [...write.holders, ...roomKnowers] }, sources, context);
  for (const holder of write.holders)
    if (holder.kind === "actor") {
      memoryRequire(
        sources.every(
          (source) =>
            perceived(source, holder.id) &&
            (source.episodeId === context.episodeId ? context.actors : context.sourceActors?.[source.episodeId])?.some(
              (actor) => actor.id === holder.id && actor.incarnation === holder.incarnation,
            ),
        ),
        "unwitnessed continuity support",
      );
    } else
      memoryRequire(
        sources.every(
          (source) => source.kind === "native" || (source.kind === "observation" && source.unitId !== "input"),
        ) && sources.some((source) => source.episodeId === context.episodeId),
        "room condition needs an actual outcome",
      );
  const original = write.target ? targetRecord(collection, write.target, context) : undefined;
  memoryRequire(
    !write.retire ||
      (write.current !== true &&
        (original || (!room && typeof write.text === "string" && !write.offer && !write.accept && !write.closeOffer))),
    "initial closure needs complete actor meaning and cannot remain current",
  );
  memoryRequire(!(write.accept || write.closeOffer) || original?.offer, "decision needs a supplied offer");
  const rootId = original?.id ?? continuityRootId(context.seed, operationId);
  const record: ContinuityRecord = original
    ? structuredClone(original)
    : { id: rootId, revision: 0, heads: {}, protection: {} };
  const parentOwner = write.parentId ? collection.records.find((row) => row.id === write.parentId)?.owner : undefined;
  const inheritedOwner = original ? original.owner : parentOwner;
  memoryRequire(
    !write.owner || !(original || write.parentId) || (inheritedOwner && same(write.owner, inheritedOwner)),
    "continuity ownership cannot change",
  );
  const owner = inheritedOwner ?? write.owner;
  memoryRequire(!owner || (!room && !write.offer && !record.offer), "room and mutual offers have no individual owner");
  if (owner && !original) {
    memoryRequire(
      write.holders.some((holder) => same(holder, owner)),
      "new private state needs its owning holder",
    );
    memoryRequire(
      sources.some((source) => source.actorId === owner.id || source.kind === "native"),
      "private state needs its owner's evidence",
    );
    record.owner = structuredClone(owner);
  }
  const before = write.holders.map((holder) => {
    const key = continuityHolderKey(holder);
    const head = record.heads[key];
    memoryRequire(
      !original || (Object.hasOwn(write.target!.heads, key) && (holder.kind === "actor" || head)),
      "target holder was not supplied",
    );
    const version = head && collection.versions.find((row) => row.id === head.versionId);
    memoryRequire(!head || version, "current continuity version is missing");
    return { key, holder, head, version };
  });
  for (const { holder, version } of before)
    if (sources.some((source) => source.kind === "self" || (source.kind === "private" && source.actorId !== "player")))
      memoryRequire(
        holder.kind === "actor" &&
          holder.id !== "player" &&
          sources
            .filter((source) => source.kind === "self" || (source.kind === "private" && source.actorId !== "player"))
            .every((source) => source.actorId === holder.id) &&
          ownedContinuityClass(write.class ?? version?.class ?? "") &&
          record.owner &&
          same(record.owner, holder),
        "self establishes only the non-player owner's perspective",
      );
  if (write.offer) {
    memoryRequire(!original && !write.accept && !write.closeOffer, "changed terms require a new offer");
    memoryRequire(
      write.offer.participants.length >= 2 &&
        new Set(write.offer.participants).size === write.offer.participants.length &&
        write.offer.participants.includes(write.offer.proposer) &&
        write.holders.some((holder) => holder.kind === "actor" && holder.id === write.offer!.proposer),
      "invalid offer parties",
    );
    write.offer.participants.forEach(memoryKnowerId);
  }
  if (record.offer) {
    const terms = collection.versions.find((row) => row.id === record.offer!.termsVersionId);
    memoryRequire(terms && (!write.text || write.text === terms.text), "offer terms cannot change in place");
    if (write.accept) {
      memoryRequire(
        !record.offer.events.some((event) => event.act === "withdraw" || event.act === "refuse"),
        "offer was withdrawn or refused",
      );
      memoryRequire(
        record.offer.participants.some(
          (party) =>
            party.id === write.accept &&
            context.actors.some((actor) => actor.id === party.id && actor.incarnation === party.incarnation),
        ),
        "accepting actor is not a party incarnation",
      );
      memoryRequire(
        before.some(
          ({ key, holder, version }) =>
            holder.kind === "actor" &&
            holder.id === write.accept &&
            version?.text === terms.text &&
            (!record.protection[key] ||
              (record.protection[key].repair?.versionId === version.id &&
                version.offerEvents?.some((id) =>
                  record.offer!.events.some(
                    (event) =>
                      event.id === id &&
                      event.act === "offer" &&
                      event.sources.every((source) =>
                        continuityOfferSource(source, holder, version, collection, event.id),
                      ),
                  ),
                ))),
        ),
        "accepting actor does not hold the unchanged offer",
      );
      record.offer.events.push({
        id: operationId,
        by: write.accept,
        act: "accept",
        sources: contribution(sources, write.accept, "accept", context.episodeId),
      });
    }
    if (write.closeOffer) {
      memoryRequire(
        record.offer.participants.some(
          (party) =>
            party.id === write.closeOffer!.by &&
            context.actors.some((actor) => actor.id === party.id && actor.incarnation === party.incarnation),
        ),
        "withdrawing actor is not a party incarnation",
      );
      memoryRequire(
        before.some(({ holder }) => holder.kind === "actor" && holder.id === write.closeOffer!.by),
        "decision must retain the deciding actor",
      );
      const act = write.closeOffer.reason === "refused" ? "refuse" : "withdraw";
      record.offer.events.push({
        id: operationId,
        by: write.closeOffer.by,
        act,
        sources: contribution(sources, write.closeOffer.by, act, context.episodeId),
      });
    }
  }
  if (record.offer && (write.accept || write.closeOffer)) {
    const event = record.offer.events.at(-1)!;
    memoryRequire(
      write.holders.every(
        (holder) => holder.kind === "actor" && event.sources.every((source) => heardWords(source, holder.id)),
      ),
      "offer decision was not heard as words",
    );
  }
  const subjectBindings = new Map(
    collection.versions
      .filter((version) => version.rootId === rootId)
      .flatMap((version) => version.about.map((subject) => [subject.id, subject.incarnation] as const)),
  );
  const created: ContinuityVersion[] = [];
  let relationshipScore: number | undefined;
  let romanticInterest: number | undefined;
  let romanticDay: ContinuityVersion["romanticDay"];
  let relationshipDay: ContinuityVersion["relationshipDay"];
  let relationshipMilestone: true | undefined;
  let relationshipAnswer: string | undefined;
  let relationshipAnswerScore: number | undefined;
  let ownerAnswer = false;
  if (write.relationship) {
    const ownerBefore = before.find(({ holder }) => owner && same(holder, owner));
    const about = write.about ?? [];
    const subject = about[0];
    const active = (actor: ActorIdentity) =>
      context.relationshipActors?.some((row) => row.id === actor.id && row.incarnation === actor.incarnation);
    memoryRequire(
      owner &&
        owner.id !== "player" &&
        ownerBefore &&
        active(owner) &&
        about.length === 1 &&
        subject.id !== owner.id &&
        active(subject) &&
        write.class === "perspective" &&
        !write.parentId &&
        !ownerBefore.version?.parentId &&
        !write.retire &&
        !ownerBefore.version?.closed &&
        !write.offer &&
        !record.offer &&
        write.current === true,
      "relationship change needs a current villager-owned perspective about one person",
    );
    const experienced = sources.filter((source) =>
      ["speech", "written", "observation", "native"].includes(source.kind),
    );
    const { impact, romance } = write.relationship;
    ownerAnswer = write.holders.length === 1;
    memoryRequire(
      experienced.some((source) => source.episodeId === context.episodeId) ||
        (!impact &&
          !romance &&
          ownerAnswer &&
          sources.some((source) => source.episodeId === context.episodeId && source.kind === "self")),
      "relationship change needs a current experienced event",
    );
    memoryRequire(impact || romance || write.relationship.answer, "empty relationship update");
    if (write.relationship.answer !== undefined) {
      if (isRelationshipAnswer(write.relationship.answer)) relationshipAnswer = write.relationship.answer;
      else
        memoryRequire(
          impact || romance,
          `relationship answer must be one sentence of at most ${RELATIONSHIP_ANSWER_WORD_LIMIT} words`,
        );
    }
    if (impact) {
      memoryRequire(Number.isInteger(RELATIONSHIP_IMPACTS[impact]), "invalid relationship impact");
      const latest = latestRelationshipScores(collection).get(relationshipKey(owner, subject));
      memoryRequire(
        context.continuityRevision !== undefined && (!latest || latest.createdRevision <= context.continuityRevision),
        "relationship changed since admission or already changed in this exchange",
      );
      const calendar = context.relationshipCalendar;
      memoryRequire(
        calendar && /^\d{4}-\d{2}-\d{2}$/.test(calendar.date),
        "relationship scoring needs the Village day",
      );
      const score = latest?.relationshipScore ?? 0;
      const previous = latest?.relationshipDay;
      relationshipDay =
        previous && previous.date >= calendar.date
          ? { ...previous }
          : { date: calendar.date, start: score, gained: 0, lost: 0, breach: 0 };
      const turningPoint =
        impact === "turning-positive" &&
        experienced.some((source) => {
          const date = calendar.historical[source.episodeId];
          return source.episodeId !== context.episodeId && date && date < calendar.date;
        });
      const delta =
        impact === "turning-positive" && !turningPoint
          ? RELATIONSHIP_IMPACTS["meaningful-positive"]
          : RELATIONSHIP_IMPACTS[impact];
      if (delta > 0) {
        const base = turningPoint ? 10 : 6;
        const limit = Math.ceil((base * (100 - Math.max(0, relationshipDay.start))) / 100);
        const gained = Math.max(0, Math.min(delta, limit - relationshipDay.gained, 100 - score));
        relationshipDay.gained += gained;
        relationshipScore = score + gained;
      } else {
        const budget = impact === "turning-negative" ? "breach" : "lost";
        const limit = budget === "breach" ? 10 : 6;
        const lost = Math.min(-delta, limit - relationshipDay[budget], score + 100);
        relationshipDay[budget] += lost;
        relationshipScore = score - lost;
      }
      if (relationshipScore !== score && (turningPoint || impact === "turning-negative")) relationshipMilestone = true;
    }
    if (romance) {
      memoryRequire(
        ownerAnswer &&
          context.actors.some((actor) => actor.id === subject.id && actor.incarnation === subject.incarnation) &&
          experienced.some(
            (source) =>
              source.episodeId === context.episodeId &&
              ((source.kind === "observation" &&
                (!source.actorId || source.actorId === subject.id) &&
                source.perceptions.some((row) => row.actorId === owner.id && row.channel === "sight")) ||
                ((source.kind === "speech" || source.kind === "written") &&
                  source.actorId === subject.id &&
                  source.perceptions.some((row) => row.actorId === owner.id && row.channel === "words"))),
          ),
        "romantic interest needs the owner to witness this interaction",
      );
      const latest = latestRomanticInterests(collection).get(relationshipKey(owner, subject));
      memoryRequire(
        context.continuityRevision !== undefined && (!latest || latest.createdRevision <= context.continuityRevision),
        "romantic interest changed since admission or already changed in this exchange",
      );
      const date = context.relationshipCalendar?.date;
      memoryRequire(date && /^\d{4}-\d{2}-\d{2}$/.test(date), "romantic interest needs the Village day");
      const previous = latest?.romanticDay;
      if (!previous || date >= previous.date) {
        const score = latest?.romanticInterest ?? 0;
        const gained = previous?.date === date && previous.gained;
        const delta = romance === "grows" ? (gained ? 0 : 1) : romance === "fades" ? -1 : -3;
        romanticInterest = Math.min(20, Math.max(0, score + delta));
        romanticDay = { date, gained: gained || romanticInterest > score };
      }
    }
    if (relationshipAnswer !== undefined) {
      memoryRequire(
        subject.id === "player" &&
          context.relationshipAnswers?.owners.some(
            (actor) => actor.id === owner.id && actor.incarnation === owner.incarnation,
          ),
        "relationship answer is not due for this villager",
      );
      const ownedRoots = new Set(
        collection.records.filter((root) => root.owner && same(root.owner, owner)).map((root) => root.id),
      );
      memoryRequire(
        context.continuityRevision !== undefined &&
          !collection.versions.some(
            (version) =>
              version.relationshipAnswer &&
              version.createdRevision > context.continuityRevision! &&
              ownedRoots.has(version.rootId) &&
              version.about[0]?.id === subject.id &&
              version.about[0]?.incarnation === subject.incarnation,
          ),
        "relationship answer already refreshed",
      );
      relationshipAnswerScore =
        relationshipScore ??
        latestRelationshipScores(collection).get(relationshipKey(owner, subject))?.relationshipScore ??
        0;
      memoryRequire(
        ownerAnswer ||
          (before.some(({ holder }) => holder.kind === "actor" && holder.id === "player") &&
            sources.some(
              (source) =>
                source.episodeId === context.episodeId && source.actorId === owner.id && heardWords(source, "player"),
            )),
        "relationship answer needs the villager's words heard or read by the player",
      );
    }
  }
  for (const { key, holder, head, version: prior } of before) {
    const text = write.text ?? prior?.text;
    const completeNativeMeaning = sources.length === 1 && sources[0].kind === "native" && sources[0].excerpt === text;
    memoryString(
      text,
      holder.kind === "room" || completeNativeMeaning ? ROOM_CONTINUITY_TEXT_BYTES : CONTINUITY_TEXT_BYTES,
    );
    memoryRequire(!prior?.closed || write.current !== true, "closed continuity cannot be reopened");
    const parentId = write.parentId ?? prior?.parentId;
    const facet = parentId ? (write.facet ?? prior?.facet) : undefined;
    const version: ContinuityVersion = {
      id: continuityVersionId(context.seed, operationId, holder),
      rootId,
      createdRevision: collection.revision + 1,
      text,
      class: room ? "information" : (write.class ?? prior?.class ?? "experience"),
      ...(relationshipScore !== undefined && owner && same(holder, owner)
        ? { relationshipScore, relationshipDay, ...(relationshipMilestone ? { relationshipMilestone } : {}) }
        : {}),
      ...(romanticInterest !== undefined && owner && same(holder, owner) ? { romanticInterest, romanticDay } : {}),
      ...(holder.kind === "actor" &&
      (ownerAnswer ? holder.id === owner?.id : holder.id === "player") &&
      relationshipAnswer
        ? {
            relationshipAnswer,
            relationshipAnswerScore,
            ...(context.relationshipAnswers?.sceneId
              ? { relationshipAnswerScene: context.relationshipAnswers.sceneId }
              : {}),
          }
        : {}),
      about: (write.about ?? prior?.about ?? []).map(({ id, incarnation }) => ({ id, incarnation })),
      ...(parentId ? { parentId } : {}),
      ...(facet ? { facet } : {}),
      sources: sources.map((source) =>
        structuredClone(
          holder.kind === "actor" && source.kind === "native"
            ? { ...source, perceptions: source.perceptions.filter((row) => row.actorId === holder.id) }
            : source,
        ),
      ),
      at: context.at,
      operationId,
      ...(write.retire ? { closed: { reason: write.retire } } : prior?.closed ? { closed: { ...prior.closed } } : {}),
    };
    if (record.offer)
      version.offerEvents = [
        ...new Set([
          ...(prior?.offerEvents ?? []),
          ...record.offer.events
            .filter(
              (event) =>
                holder.kind === "actor" &&
                event.sources.every((source) => continuityOfferSource(source, holder, version, collection, event.id)),
            )
            .map((event) => event.id),
        ]),
      ];
    memoryRequire(
      version.about.length <= 32 && new Set(version.about.map((subject) => subject.id)).size === version.about.length,
      "invalid continuity subject bindings",
    );
    for (const subject of version.about) {
      memoryKnowerId(subject.id);
      memoryString(subject.incarnation, 160);
      memoryRequire(
        !subjectBindings.has(subject.id) || subjectBindings.get(subject.id) === subject.incarnation,
        "subject identity cannot change within an existing meaning",
      );
      subjectBindings.set(subject.id, subject.incarnation);
      const supplied = [...(context.subjects ?? []), ...context.actors].some(
        (actor) => actor.id === subject.id && actor.incarnation === subject.incarnation,
      );
      const inherited =
        original &&
        Object.keys(write.target!.heads).some((key) =>
          collection.versions
            .find((row) => row.id === original.heads[key]?.versionId)
            ?.about.some((actor) => actor.id === subject.id && actor.incarnation === subject.incarnation),
        );
      memoryRequire(supplied || inherited, "continuity subject identity was not supplied");
    }
    if (holder.kind === "actor") assertContinuitySoundIdentity(version, holder, record.owner, prior);
    memoryRequire(
      !ownedContinuityClass(version.class) || record.owner || record.offer || write.offer,
      "private state has no owner",
    );
    if (version.parentId) {
      const parent = collection.records.find((row) => row.id === version.parentId);
      memoryRequire(
        !room && parent && context.supplied.some((row) => row.id === parent.id),
        "continuity parent was not supplied",
      );
      const parentHead = parent.heads[key];
      const parentVersion = parentHead && collection.versions.find((row) => row.id === parentHead.versionId);
      memoryRequire(
        parent.id !== rootId && parentVersion && !parentVersion.parentId && !parent.protection[key],
        "invalid or protected continuity parent",
      );
      memoryRequire(same(record.owner ?? null, parent.owner ?? null), "continuity facet changed ownership");
    }
    if (holder.kind === "room") {
      const duration = write.room?.expiresInMinutes;
      memoryRequire(
        duration === undefined || (Number.isSafeInteger(duration) && duration > 0 && duration <= 10080),
        "invalid room expiry",
      );
      memoryRequire(duration === undefined || !original, "temporary expiry cannot restore a replaced description");
      version.room = {
        order:
          prior?.room?.order ?? collection.versions.reduce((max, row) => Math.max(max, row.room?.order ?? 0), 0) + 1,
        visibility: write.room?.visibility ?? prior?.room?.visibility ?? "observable",
        ...(duration !== undefined
          ? { expiresAt: new Date(Date.parse(context.at) + duration * 60000).toISOString() }
          : prior?.room?.expiresAt
            ? { expiresAt: prior.room.expiresAt }
            : {}),
      };
      if (!write.retire && !authoredRoomParagraph && text !== prior?.text)
        memoryRequire(
          !continuityViews(
            collection,
            holder,
            context.at,
            continuityProtectionUnits(collection, holder, new Map()),
          ).some((row) => row.id !== rootId && row.version.text === text),
          "duplicate current room description",
        );
    }
    created.push(version);
    record.heads[key] = {
      holder: structuredClone(holder),
      versionId: version.id,
      revision: (head?.revision ?? 0) + 1,
      current: write.retire
        ? false
        : (write.current ??
          head?.current ??
          Boolean(room || write.offer || write.class === "desire" || write.class === "motivation")),
    };
    for (const knower of roomKnowers) {
      const knowerKey = continuityHolderKey(knower);
      record.heads[knowerKey] = {
        holder: knower,
        versionId: version.id,
        revision: (record.heads[knowerKey]?.revision ?? 0) + 1,
        current: false,
      };
    }
  }
  if (write.offer) {
    const participants = write.offer.participants.map((id) => {
      const actor =
        context.actors.find((actor) => actor.id === id) ?? context.subjects?.find((actor) => actor.id === id);
      memoryRequire(actor, "offer party identity was not supplied");
      return { id: actor.id, incarnation: actor.incarnation };
    });
    record.offer = {
      termsVersionId: created[0].id,
      proposer: participants.find((actor) => actor.id === write.offer!.proposer)!,
      participants,
      events: [
        {
          id: operationId,
          by: write.offer.proposer,
          act: "offer",
          sources: contribution(sources, write.offer.proposer, "offer", context.episodeId),
        },
      ],
    };
  }
  if (write.offer) {
    const offer = record.offer!;
    for (const party of offer.participants)
      for (const act of ["accept", "refuse", "withdraw"] as const) {
        const deciding = sources.filter(
          (source) =>
            (source.kind === "speech" ||
              (source.kind === "written" && source.committedReceiptId?.startsWith("mail-written-"))) &&
            source.actorId === party.id &&
            source.act === act &&
            source.episodeId === context.episodeId,
        );
        if (deciding.length)
          offer.events.push({ id: operationId + ":" + party.id + ":" + act, by: party.id, act, sources: deciding });
      }
    memoryRequire(
      write.holders.every(
        (holder) =>
          holder.kind === "actor" &&
          offer.events.every((event) => event.sources.every((source) => heardWords(source, holder.id))),
      ),
      "offer terms were not heard as words",
    );
    for (const version of created) version.offerEvents = offer.events.map((event) => event.id);
  }
  record.revision++;
  return {
    ...collection,
    revision: collection.revision + 1,
    records: original
      ? collection.records.map((row) => (row.id === record.id ? record : row))
      : [...collection.records, record],
    versions: [...collection.versions, ...created],
    receipts: {
      ...collection.receipts,
      [operationId]: { fingerprint, roots: [rootId], versions: created.map((row) => row.id) },
    },
  };
}

/** Only this holder's current head and eligible source projection are returned. */
export function continuityViews(
  collection: ContinuityCollection,
  holder: ContinuityHolder,
  at: string,
  blocked: ReadonlySet<string>,
): ContinuityView[] {
  const key = continuityHolderKey(holder);
  const versions = new Map(collection.versions.map((row) => [row.id, row]));
  return collection.records.flatMap((record) => {
    const head = record.heads[key],
      protection = record.protection[key];
    if (!head || protection?.forgotten) return [];
    const original = versions.get(head.versionId);
    memoryRequire(original, "current continuity version is missing");
    const repaired = Boolean(
      protection?.repair && (holder.kind !== "room" || protection.repair.versionId === original.id),
    );
    if (
      blocked.has(continuityVersionUnit(original.id)) ||
      (!repaired &&
        (original.sources.some((source) => blocked.has(unit(source))) ||
          record.offer?.events.some(
            (event) =>
              original.offerEvents?.includes(event.id) && event.sources.some((source) => blocked.has(unit(source))),
          )))
    )
      return [];
    if (original.parentId && collection.records.find((row) => row.id === original.parentId)?.protection[key]) return [];
    if (holder.kind === "room" && (!head.current || (original.room?.expiresAt && original.room.expiresAt <= at)))
      return [];
    const version = structuredClone(original);
    if (repaired) {
      version.sources = [];
    } else if (holder.kind === "actor")
      version.sources = version.sources.map((source) => actorContinuityEvidence(source, holder.id));
    if (holder.kind === "actor") delete version.room;
    const events = record.offer?.events.filter((event) => version.offerEvents?.includes(event.id)) ?? [];
    const closing = events.findLast((event) => event.act === "withdraw" || event.act === "refuse");
    const offer = record.offer &&
      (!protection?.repair || Boolean(version.offerEvents?.length)) && {
        proposer: { ...record.offer.proposer },
        participants: record.offer.participants.map((party) => ({ ...party })),
        contributions: events.map((event) => ({
          by: event.by,
          act: event.act,
          sources: event.sources.map((source) => {
            memoryRequire(holder.kind === "actor", "room cannot hold an offer");
            const known = continuityOfferSource(source, holder, version, collection, event.id);
            memoryRequire(known, "offer contribution was not communicated to this holder");
            return actorContinuityEvidence(known, holder.id);
          }),
        })),
        state: closing
          ? closing.act === "refuse"
            ? ("refused" as const)
            : ("withdrawn" as const)
          : record.offer.participants.every((party) =>
                events.some((event) => event.by === party.id && (event.act === "offer" || event.act === "accept")),
              )
            ? ("accepted" as const)
            : ("offered" as const),
      };
    return [
      {
        id: record.id,
        ...(record.owner ? { owner: structuredClone(record.owner) } : {}),
        recordRevision: record.revision,
        headRevision: head.revision,
        holder: structuredClone(holder),
        current: head.current,
        version,
        repaired,
        ...(record.offer ? { parties: record.offer.participants.map((party) => ({ ...party })) } : {}),
        ...(holder.kind === "room"
          ? {
              roomKnownBy: Object.entries(record.heads).flatMap(([key, value]) =>
                value.holder.kind === "actor" && value.versionId === head.versionId && !record.protection[key]
                  ? [value.holder.id]
                  : [],
              ),
            }
          : {}),
        ...(offer ? { offer } : {}),
      },
    ];
  });
}

export function continuityGuidesHolder(view: ContinuityView) {
  if (view.holder.kind !== "actor") return false;
  const holder = view.holder;
  if (view.owner) return continuityHolderKey(view.owner) === continuityHolderKey(holder);
  return (
    !view.parties || view.parties.some((party) => party.id === holder.id && party.incarnation === holder.incarnation)
  );
}

/** Administrative protection changes no fictional event or native state and teaches nobody. */
export function protectContinuity(
  collection: ContinuityCollection,
  target: ContinuityTarget,
  holders: ContinuityHolder[],
  operationId: string,
  at: string,
  action: { forget: true } | { text: string; restore?: string },
): ContinuityCollection {
  memoryString(operationId, 160);
  memoryRequire(!operationId.startsWith("narration-abandoned:"), "reserved narration receipt namespace");
  memoryTimestamp(at);
  if ("text" in action)
    memoryString(
      action.text,
      holders.every((holder) => holder.kind === "room") ? ROOM_CONTINUITY_TEXT_BYTES : CONTINUITY_TEXT_BYTES,
    );
  const fingerprint = memoryHash([target, holders, action]);
  const receipt = collection.receipts[operationId];
  if (receipt) {
    memoryRequire(receipt.fingerprint === fingerprint, "administrative operation identity reused");
    return collection;
  }
  const original = collection.records.find((row) => row.id === target.id);
  memoryRequire(original && original.revision === target.recordRevision, "administrative target changed");
  memoryRequire(holders.length > 0, "missing administrative holders");
  const record = structuredClone(original);
  const created: ContinuityVersion[] = [];
  for (const holder of holders) {
    const key = continuityHolderKey(holder),
      head = record.heads[key];
    memoryRequire(head && head.revision === target.heads[key], "administrative correction cannot teach");
    const prior = record.protection[key];
    memoryRequire(
      !prior?.forgotten || "forget" in action || Boolean(action.restore),
      "forgotten holder cannot be corrected",
    );
    const restored =
      "text" in action && action.restore
        ? collection.versions.find((version) => version.id === action.restore)
        : undefined;
    if ("text" in action && action.restore)
      memoryRequire(
        restored &&
          restored.rootId === record.id &&
          restored.text === action.text &&
          (restored.administrative
            ? continuityHolderKey(restored.administrative.holder) === key
            : restored.id === continuityVersionId(restored.sources[0].seed, restored.operationId, holder)),
        "administrative undo changed its prior holder or meaning",
      );
    const previous = restored ?? collection.versions.find((version) => version.id === head.versionId)!;
    if ("text" in action) {
      const version: ContinuityVersion = {
        ...previous,
        id: "continuity-version-" + memoryHash([record.id, operationId, key]).slice(0, 32),
        createdRevision: collection.revision + 1,
        text: action.text,
        sources: [],
        about: restored ? structuredClone(restored.about) : [],
        operationId,
        administrative: { holder: structuredClone(holder), at },
      };
      if (!restored) delete version.offerEvents;
      delete version.relationshipScore;
      delete version.relationshipDay;
      delete version.romanticInterest;
      delete version.romanticDay;
      delete version.relationshipAnswer;
      delete version.relationshipAnswerScore;
      delete version.relationshipAnswerScene;
      delete version.relationshipMilestone;
      created.push(version);
      head.versionId = version.id;
      head.revision++;
    }
    record.protection[key] = {
      operationId,
      at,
      ...("forget" in action ? { forgotten: true as const } : { repair: { versionId: head.versionId } }),
      sourceUnits: [
        ...new Set([
          ...(prior?.sourceUnits ?? []),
          ...collection.versions
            .filter((row) => row.rootId === record.id || row.parentId === record.id)
            .flatMap((row) => [
              continuityVersionUnit(row.id),
              ...row.sources.filter((source) => holder.kind === "room" || perceived(source, holder.id)).map(unit),
            ]),
        ]),
      ],
    };
  }
  record.revision++;
  return {
    ...collection,
    revision: collection.revision + 1,
    records: collection.records.map((row) => (row.id === record.id ? record : row)),
    versions: [...collection.versions, ...created],
    receipts: {
      ...collection.receipts,
      [operationId]: { fingerprint, roots: [record.id], versions: created.map((version) => version.id) },
    },
  };
}

/** A fitted canonical meaning is private context for its existing holder, never fresh speech or authority. */
export function continuityKnowledge(view: ContinuityView, seed: string, episodeId: string): ContinuityEvidence {
  memoryRequire(view.holder.kind === "actor", "room truth is not an actor knowledge anchor");
  const fingerprint = memoryHash([
    view.version.id,
    view.version.class,
    view.version.text,
    continuityHolderKey(view.holder),
  ]);
  return {
    id: "source-" + memoryHash([episodeId, fingerprint]).slice(0, 32),
    seed,
    episodeId,
    unitId: view.version.id,
    fingerprint,
    kind: "knowledge",
    excerpt: view.version.text,
    actorId: view.holder.id,
    perceptions: [{ actorId: view.holder.id, channel: "private", text: view.version.text }],
  };
}

export function assertContinuityKnowledge(
  collection: ContinuityCollection,
  source: ContinuityEvidence,
  actors: { id: string; incarnation: string }[],
  revision: number,
  sourceActors?: Record<string, { id: string; incarnation: string }[]>,
) {
  const version = collection.versions.find((version) => version.id === source.unitId),
    actor = actors.find((actor) => actor.id === source.actorId),
    holder = actor && { kind: "actor" as const, ...actor },
    head =
      version &&
      holder &&
      collection.records.find((record) => record.id === version.rootId)?.heads[continuityHolderKey(holder)];
  memoryRequire(
    source.kind === "knowledge" &&
      !source.range &&
      !source.act &&
      !source.committedReceiptId &&
      version &&
      holder &&
      head &&
      Number.isSafeInteger(revision) &&
      version.createdRevision <= revision &&
      (version.administrative
        ? continuityHolderKey(version.administrative.holder) === continuityHolderKey(holder)
        : version.id === continuityVersionId(source.seed, version.operationId, holder) ||
          (version.room &&
            version.sources.every(
              (source) =>
                source.perceptions.some((row) => row.actorId === holder.id && row.channel === "sight") &&
                sourceActors?.[source.episodeId]?.some(
                  (actor) => actor.id === holder.id && actor.incarnation === holder.incarnation,
                ),
            ))) &&
      source.excerpt === version.text &&
      source.fingerprint === memoryHash([version.id, version.class, version.text, continuityHolderKey(holder)]) &&
      source.perceptions.every(
        (row) => row.actorId === holder.id && row.channel === "private" && row.text === source.excerpt,
      ),
    "knowledge anchor lost its admitted canonical meaning or holder",
  );
}
