import { z } from "zod";
import type { ContinuityCollection, ContinuityVersion } from "../models/continuity-model.js";
import {
  continuityHolderKey,
  continuityVersionId,
  continuityOfferSource,
  ownedContinuityClass,
  CONTINUITY_TEXT_BYTES,
  ROOM_CONTINUITY_TEXT_BYTES,
} from "../rules/continuity.js";
import {
  immutableMemoryValue,
  isImmutableMemoryValue,
  memoryObject,
  memoryRequire,
  memoryHash,
} from "../rules/memory-integrity.js";

const text = (bytes: number) =>
  z
    .string()
    .min(1)
    .refine((value) => value.trim().length > 0 && Buffer.byteLength(value) <= bytes);
const id = text(160),
  digest = z.string().regex(/^[a-f0-9]{64}$/),
  revision = z.number().int().nonnegative().safe();
const at = z.string().refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);
const ids = z.array(id).refine((value) => new Set(value).size === value.length);
const actorHolder = z.object({ kind: z.literal("actor"), id, incarnation: id }).strict();
const actorReference = z.object({ id, incarnation: id }).strict();
export const continuityHolderSchema = z.discriminatedUnion("kind", [
  actorHolder,
  z.object({ kind: z.literal("room"), placeId: id, zoneId: id }).strict(),
]);
export const continuityEvidenceSchema = z
  .object({
    id,
    seed: id,
    episodeId: id,
    fingerprint: digest,
    unitId: id,
    range: z
      .object({ start: revision, end: revision })
      .strict()
      .refine((value) => value.end > value.start)
      .optional(),
    moment: z
      .object({ index: z.number().int().nonnegative().max(24), side: z.enum(["before", "after"]) })
      .strict()
      .optional(),
    positions: z.record(z.string(), z.string()).optional(),
    excerpt: text(ROOM_CONTINUITY_TEXT_BYTES),
    kind: z.enum(["speech", "written", "observation", "self", "private", "native", "context", "knowledge"]),
    actorId: id.optional(),
    perceptions: z
      .array(
        z
          .object({
            actorId: id,
            channel: z.enum(["words", "sight", "sound-only", "private"]),
            text: text(ROOM_CONTINUITY_TEXT_BYTES),
          })
          .strict(),
      )
      .max(32)
      .refine((rows) => new Set(rows.map((row) => row.actorId)).size === rows.length),
    act: z.enum(["offer", "accept", "refuse", "withdraw"]).optional(),
    committedReceiptId: id.optional(),
  })
  .strict()
  .refine(
    (value) =>
      (!["native", "written"].includes(value.kind) || Boolean(value.committedReceiptId)) &&
      (value.kind !== "context" || !value.perceptions.length) &&
      (!value.act || value.kind === "speech" || value.kind === "written"),
  );
const closed = z.object({ reason: z.enum(["fulfilled", "withdrawn", "ended"]) }).strict();
const completeNativeMeaning = (value: Pick<ContinuityVersion, "text" | "sources">) =>
  value.sources.length === 1 && value.sources[0].kind === "native" && value.sources[0].excerpt === value.text;
const version = z
  .object({
    id,
    rootId: id,
    createdRevision: revision.min(1),
    text: text(ROOM_CONTINUITY_TEXT_BYTES),
    class: z.enum(["experience", "information", "perspective", "desire", "motivation", "commitment", "open-matter"]),
    relationshipScore: z.number().int().min(-100).max(100).optional(),
    relationshipAnswer: text(320)
      .refine((value) => !/[\r\n]/.test(value))
      .optional(),
    about: z
      .array(actorReference)
      .max(32)
      .refine((rows) => new Set(rows.map((row) => row.id)).size === rows.length),
    parentId: id.optional(),
    facet: z
      .enum(["reason", "attention", "approach", "connection", "stance", "expectation", "concern", "boundary"])
      .optional(),
    sources: z.array(continuityEvidenceSchema).max(8),
    at,
    operationId: text(210),
    administrative: z.object({ holder: continuityHolderSchema, at }).strict().optional(),
    offerEvents: ids.optional(),
    closed: closed.optional(),
    room: z
      .object({ order: revision.min(1), visibility: z.enum(["observable", "concealed"]), expiresAt: at.optional() })
      .strict()
      .optional(),
  })
  .strict()
  .refine(
    (value) => value.room || completeNativeMeaning(value) || Buffer.byteLength(value.text) <= CONTINUITY_TEXT_BYTES,
  )
  .refine((value) =>
    value.administrative ? value.sources.length === 0 && value.administrative.at >= value.at : value.sources.length > 0,
  )
  .refine((value) => Buffer.byteLength(JSON.stringify(value)) <= (completeNativeMeaning(value) ? 65536 : 32768));
const record = z
  .object({
    id,
    revision: revision.min(1),
    owner: actorHolder.optional(),
    heads: z.record(
      z.string(),
      z
        .object({ holder: continuityHolderSchema, versionId: id, revision: revision.min(1), current: z.boolean() })
        .strict(),
    ),
    protection: z.record(
      z.string(),
      z
        .object({
          operationId: id,
          at,
          forgotten: z.literal(true).optional(),
          repair: z.object({ versionId: id }).strict().optional(),
          sourceUnits: z.array(text(700)),
        })
        .strict()
        .refine((value) => Boolean(value.forgotten) !== Boolean(value.repair)),
    ),
    offer: z
      .object({
        termsVersionId: id,
        proposer: actorReference,
        participants: z
          .array(actorReference)
          .min(2)
          .max(32)
          .refine((rows) => new Set(rows.map((row) => row.id)).size === rows.length),
        events: z
          .array(
            z
              .object({
                id: text(370),
                by: id,
                act: z.enum(["offer", "accept", "refuse", "withdraw"]),
                sources: z.array(continuityEvidenceSchema).min(1).max(8),
              })
              .strict(),
          )
          .min(1),
      })
      .strict()
      .optional(),
  })
  .strict();
const collection = z
  .object({
    format: z.literal(1),
    revision,
    records: z.array(record),
    versions: z.array(z.unknown()),
    receipts: z.record(z.string(), z.object({ fingerprint: digest, roots: ids, versions: ids }).strict()),
  })
  .strict();
const validated = new WeakMap<object, string | undefined>();
const validatedVersions = new WeakSet<object>();

/** One current format. Invalid or old saved bytes are rejected without rewriting them. */
export function readContinuity(raw: unknown, seed?: string): ContinuityCollection {
  if (raw && typeof raw === "object" && validated.has(raw) && (!seed || validated.get(raw) === seed))
    return raw as ContinuityCollection;
  const value = collection.parse(raw) as ContinuityCollection;
  memoryObject(raw);
  const prior = raw as ContinuityCollection;
  value.records = value.records.map((row, i) => (isImmutableMemoryValue(prior.records[i]) ? prior.records[i] : row));
  value.versions = prior.versions.map((row) => {
    if (isImmutableMemoryValue(row) && validatedVersions.has(row)) return row;
    const checked = version.parse(row) as ContinuityVersion;
    return isImmutableMemoryValue(row) ? row : checked;
  });
  for (const key of Object.keys(value.receipts))
    if (isImmutableMemoryValue(prior.receipts[key])) value.receipts[key] = prior.receipts[key];
  const roots = new Map(value.records.map((row) => [row.id, row])),
    versions = new Map(value.versions.map((row) => [row.id, row]));
  memoryRequire(
    roots.size === value.records.length && versions.size === value.versions.length,
    "duplicate continuity identity",
  );
  const subjectsByRoot = new Map<string, Map<string, string>>();
  for (const entry of value.versions) {
    const root = roots.get(entry.rootId);
    memoryRequire(root && entry.createdRevision <= value.revision, "missing or future continuity root");
    const subjects = subjectsByRoot.get(entry.rootId) ?? new Map<string, string>();
    for (const subject of entry.about) {
      memoryRequire(
        !subjects.has(subject.id) || subjects.get(subject.id) === subject.incarnation,
        "subject identity changed within continuity root",
      );
      subjects.set(subject.id, subject.incarnation);
    }
    subjectsByRoot.set(entry.rootId, subjects);
    memoryRequire(!ownedContinuityClass(entry.class) || root.owner || root.offer, "saved private state has no owner");
    if (entry.relationshipScore !== undefined || entry.relationshipAnswer !== undefined) {
      const owner = root.owner;
      const evidenceSeed = entry.sources[0]?.seed;
      memoryRequire(
        owner &&
          owner.id !== "player" &&
          evidenceSeed &&
          entry.class === "perspective" &&
          !entry.administrative &&
          !entry.parentId &&
          !entry.closed &&
          !entry.room &&
          entry.about.length === 1 &&
          entry.about[0].id !== owner.id,
        "invalid saved relationship update",
      );
      if (entry.relationshipScore !== undefined)
        memoryRequire(
          entry.id === continuityVersionId(evidenceSeed, entry.operationId, owner),
          "relationship score belongs to its owner",
        );
      if (entry.relationshipAnswer !== undefined)
        memoryRequire(
          Object.values(root.heads).some(
            ({ holder }) =>
              holder.kind === "actor" &&
              holder.id === "player" &&
              entry.id === continuityVersionId(evidenceSeed, entry.operationId, holder),
          ) &&
            entry.sources.some(
              (source) =>
                source.actorId === owner.id &&
                ["speech", "written"].includes(source.kind) &&
                source.perceptions.some((row) => row.actorId === "player" && row.channel === "words"),
            ),
          "saved relationship answer belongs to the player who received it",
        );
    }
    if (entry.administrative) {
      const key = continuityHolderKey(entry.administrative.holder),
        receipt = value.receipts[entry.operationId];
      memoryRequire(
        root.heads[key] &&
          receipt?.roots.includes(root.id) &&
          receipt.versions.includes(entry.id) &&
          entry.id === "continuity-version-" + memoryHash([root.id, entry.operationId, key]).slice(0, 32),
        "administrative version lost its holder or receipt",
      );
      if (entry.about.length || entry.offerEvents?.length)
        memoryRequire(
          value.versions.some(
            (prior) =>
              prior.rootId === entry.rootId &&
              prior.createdRevision < entry.createdRevision &&
              prior.text === entry.text &&
              prior.class === entry.class &&
              memoryHash(prior.about) === memoryHash(entry.about) &&
              memoryHash(prior.offerEvents ?? []) === memoryHash(entry.offerEvents ?? []) &&
              (prior.administrative
                ? continuityHolderKey(prior.administrative.holder) === key
                : prior.id ===
                  continuityVersionId(prior.sources[0].seed, prior.operationId, entry.administrative!.holder)),
          ),
          "administrative restoration lost its prior knowledge or subjects",
        );
    }
    for (const source of entry.sources)
      memoryRequire(!seed || source.seed === seed, "continuity source belongs to another world");
    if (entry.parentId) {
      memoryRequire(entry.parentId !== root.id && roots.has(entry.parentId), "missing continuity parent");
      memoryRequire(
        memoryHash(root.owner ?? null) === memoryHash(roots.get(entry.parentId)?.owner ?? null),
        "saved facet changed ownership",
      );
    }
    memoryRequire(!entry.facet || entry.parentId, "continuity facet has no parent");
    for (const event of entry.offerEvents ?? [])
      memoryRequire(
        root.offer?.events.some((row) => row.id === event),
        "missing offer contribution",
      );
  }
  for (const entry of value.records) {
    memoryRequire(
      !entry.owner ||
        (entry.heads[continuityHolderKey(entry.owner)] &&
          !entry.offer &&
          !Object.values(entry.heads).some((head) => head.holder.kind === "room")),
      "invalid continuity ownership",
    );
    memoryRequire(
      Object.values(entry.heads).filter((head) => head.holder.kind === "room").length <= 1,
      "continuity root belongs to more than one room",
    );
    memoryRequire(
      entry.revision <= value.revision && Object.keys(entry.heads).length > 0,
      "invalid continuity root revision",
    );
    for (const [key, head] of Object.entries(entry.heads)) {
      const current = versions.get(head.versionId);
      memoryRequire(
        key === continuityHolderKey(head.holder) && current?.rootId === entry.id && head.revision <= entry.revision,
        "invalid continuity holder head",
      );
      memoryRequire(
        !current.administrative || continuityHolderKey(current.administrative.holder) === key,
        "administrative meaning belongs to another holder",
      );
      memoryRequire(!current.closed || !head.current, "closed continuity remains current");
      if (head.holder.kind === "actor") {
        const holder = head.holder,
          actorId = holder.id;
        memoryRequire(
          (current.offerEvents ?? []).every((id) =>
            entry.offer?.events
              .find((event) => event.id === id)
              ?.sources.every((source) => continuityOfferSource(source, holder, current, value, id)),
          ),
          "saved offer knowledge lacks communicated terms",
        );
        memoryRequire(
          current.sources.every((source) =>
            source.kind === "private" || source.kind === "self" || source.kind === "knowledge"
              ? source.actorId === actorId
              : source.perceptions.some((row) => row.actorId === actorId) ||
                (source.kind !== "native" && source.kind !== "context" && source.actorId === actorId),
          ),
          "saved continuity head has unperceived evidence",
        );
        memoryRequire(
          current.sources.every(
            (source) =>
              !(source.kind === "self" || (source.kind === "private" && source.actorId !== "player")) ||
              (actorId !== "player" &&
                ownedContinuityClass(current.class) &&
                entry.owner &&
                continuityHolderKey(entry.owner) === key),
          ),
          "saved self source widened its meaning",
        );
      } else
        memoryRequire(
          current.room &&
            current.class === "information" &&
            !current.about.length &&
            !current.parentId &&
            !current.facet &&
            !entry.offer &&
            current.sources.every((source) => source.kind === "observation" || source.kind === "native"),
          "invalid saved room meaning",
        );
      if (current.parentId) {
        const parentHead = roots.get(current.parentId)?.heads[key],
          parent = parentHead && versions.get(parentHead.versionId);
        memoryRequire(parent && !parent.parentId, "invalid continuity parent head");
      }
    }
    for (const [key, protection] of Object.entries(entry.protection)) {
      const repaired = protection.repair && versions.get(protection.repair.versionId);
      memoryRequire(
        entry.heads[key] &&
          (!protection.repair ||
            (repaired?.rootId === entry.id &&
              repaired.administrative &&
              continuityHolderKey(repaired.administrative.holder) === key &&
              repaired.operationId === protection.operationId)),
        "invalid continuity protection owner",
      );
    }
    if (entry.offer) {
      const offer = entry.offer;
      memoryRequire(
        versions.get(offer.termsVersionId)?.rootId === entry.id &&
          offer.participants.some(
            (party) => party.id === offer.proposer.id && party.incarnation === offer.proposer.incarnation,
          ),
        "invalid retained offer",
      );
      memoryRequire(new Set(offer.events.map((row) => row.id)).size === offer.events.length, "duplicate offer event");
      for (const event of offer.events)
        memoryRequire(
          offer.participants.some((party) => party.id === event.by) &&
            event.sources.every(
              (source) =>
                (source.kind === "speech" || source.kind === "written") &&
                source.actorId === event.by &&
                source.act === event.act &&
                (!seed || source.seed === seed),
            ),
          "invalid offer contribution",
        );
    }
  }
  for (const receipt of Object.values(value.receipts))
    memoryRequire(
      receipt.roots.every((id) => roots.has(id)) && receipt.versions.every((id) => versions.has(id)),
      "missing continuity receipt target",
    );
  const result = immutableMemoryValue(value);
  for (const entry of result.versions) validatedVersions.add(entry);
  validated.set(result, seed);
  return result;
}
