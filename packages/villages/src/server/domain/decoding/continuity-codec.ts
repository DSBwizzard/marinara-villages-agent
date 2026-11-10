import { z } from "zod";
import type { ContinuityCollection, ContinuityVersion } from "../models/continuity-model.js";
import {
  continuityHolderKey,
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
    kind: z.enum(["speech", "observation", "self", "private", "native", "context", "knowledge"]),
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
      (value.kind !== "native" || Boolean(value.committedReceiptId)) &&
      (value.kind !== "context" || !value.perceptions.length) &&
      (!value.act || value.kind === "speech"),
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
    about: ids.max(32),
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
        proposer: id,
        participants: ids.min(2).max(32),
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
    versions: z.array(version),
    receipts: z.record(z.string(), z.object({ fingerprint: digest, roots: ids, versions: ids }).strict()),
  })
  .strict();
const validated = new WeakMap<object, string | undefined>();

/** One current format. Invalid or old saved bytes are rejected without rewriting them. */
export function readContinuity(raw: unknown, seed?: string): ContinuityCollection {
  if (raw && typeof raw === "object" && validated.has(raw) && (!seed || validated.get(raw) === seed))
    return raw as ContinuityCollection;
  const value = collection.parse(raw) as ContinuityCollection;
  memoryObject(raw);
  const prior = raw as ContinuityCollection;
  value.records = value.records.map((row, i) => (isImmutableMemoryValue(prior.records[i]) ? prior.records[i] : row));
  value.versions = value.versions.map((row, i) =>
    isImmutableMemoryValue(prior.versions[i]) ? prior.versions[i] : row,
  );
  for (const key of Object.keys(value.receipts))
    if (isImmutableMemoryValue(prior.receipts[key])) value.receipts[key] = prior.receipts[key];
  const roots = new Map(value.records.map((row) => [row.id, row])),
    versions = new Map(value.versions.map((row) => [row.id, row]));
  memoryRequire(
    roots.size === value.records.length && versions.size === value.versions.length,
    "duplicate continuity identity",
  );
  for (const entry of value.versions) {
    const root = roots.get(entry.rootId);
    memoryRequire(root && entry.createdRevision <= value.revision, "missing or future continuity root");
    memoryRequire(!ownedContinuityClass(entry.class) || root.owner || root.offer, "saved private state has no owner");
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
        const actorId = head.holder.id;
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
        versions.get(offer.termsVersionId)?.rootId === entry.id && offer.participants.includes(offer.proposer),
        "invalid retained offer",
      );
      memoryRequire(new Set(offer.events.map((row) => row.id)).size === offer.events.length, "duplicate offer event");
      for (const event of offer.events)
        memoryRequire(
          offer.participants.includes(event.by) &&
            event.sources.every(
              (source) =>
                source.kind === "speech" &&
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
  validated.set(result, seed);
  return result;
}
