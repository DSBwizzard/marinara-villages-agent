import { z } from "zod";
import type { MailboxState } from "../models/social-mail.js";
import type { EpisodeCollection } from "../models/episode-model.js";
import { continuityEvidenceSchema } from "./continuity-codec.js";
import { mailReceipt } from "../rules/mail-evidence.js";
import { immutableMemoryValue, isImmutableMemoryValue, memoryHash, memoryRequire } from "../rules/memory-integrity.js";

const id = z.string().min(1).max(160),
  at = z.string().refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value),
  party = z.object({ id, incarnation: id }).strict();
const revision = z.number().int().nonnegative().safe(),
  units = z.array(z.string().min(1).max(700)),
  digest = z.string().regex(/^[a-f0-9]{64}$/);
export const mailPlanSchema = z
  .object({
    setupAt: at,
    admission: z
      .object({
        seed: id,
        operationId: id,
        episodeId: id,
        at,
        actors: z.array(party).min(1).max(2),
        subjects: z.array(party).max(256).optional(),
        continuityRevision: revision,
        sources: z.array(continuityEvidenceSchema).max(1024),
        sourceActors: z.record(z.string(), z.array(party).max(32)).optional(),
        supplied: z
          .array(z.object({ id, recordRevision: revision, heads: z.record(z.string(), revision) }).strict())
          .max(256),
        protectedRoots: z.array(id),
        protectionFingerprint: digest,
        provenance: z.record(z.string(), units).optional(),
      })
      .strict(),
    historical: z.record(z.string().regex(/^h:/), continuityEvidenceSchema),
    keep: z.array(z.unknown()).max(32),
    requires: z.array(z.string().min(1).max(48)).max(48),
    responseDigest: digest,
  })
  .strict();
const message = z
  .object({
    id: z.string().min(1).max(512),
    requestId: z.string().min(1).max(200),
    at,
    from: party,
    to: party,
    text: z
      .string()
      .min(1)
      .max(4000)
      .refine((value) => value.trim().length > 0),
    status: z.enum(["pending", "delivered", "cancelled", "undeliverable"]),
    deliveredAt: at.optional(),
    readAt: at.optional(),
    replyTo: z.string().min(1).max(512).optional(),
    error: z.string().min(1).max(4000).optional(),
    admissionFailed: z.literal(true).optional(),
    reading: mailPlanSchema.optional(),
  })
  .strict();
const mailbox = z
  .object({
    format: z.literal(1),
    revision: z.number().int().nonnegative().safe(),
    messages: z.record(z.string(), message),
  })
  .strict();

export const emptyMailbox = (): MailboxState => ({ format: 1, revision: 0, messages: {} });
const validated = new WeakMap<object, string>();

export function readMailboxState(raw: unknown, seed: string): MailboxState {
  if (raw && typeof raw === "object" && validated.get(raw) === seed) return raw as MailboxState;
  const value = mailbox.parse(raw),
    requests = new Set<string>(),
    replies = new Set<string>();
  memoryRequire(value.revision >= Object.keys(value.messages).length, "invalid mailbox revision");
  for (const [key, row] of Object.entries(value.messages)) {
    memoryRequire(key === row.id, "mail envelope identity changed");
    mailReceipt(seed, row, row.text, "written");
    if (row.reading) {
      const read = mailReceipt(seed, row, row.text, "read");
      memoryRequire(
        row.status === "delivered" &&
          row.to.id === "player" &&
          row.reading.admission.seed === seed &&
          row.reading.admission.episodeId === read.id &&
          row.reading.admission.operationId === read.id &&
          memoryHash(row.reading.admission.actors) === memoryHash([row.from, row.to]),
        "saved letter reading changed its native recipient or stage",
      );
    }
    const request = memoryHash([row.from.id, row.from.incarnation, row.requestId]);
    memoryRequire(!requests.has(request), "mail request identity was reused");
    requests.add(request);
    memoryRequire(
      (row.status === "delivered") === Boolean(row.deliveredAt) &&
        (!row.deliveredAt || row.at <= row.deliveredAt) &&
        (!row.readAt || (row.deliveredAt && row.deliveredAt <= row.readAt)) &&
        (!row.admissionFailed || row.status === "pending"),
      "invalid native letter delivery state",
    );
    if (row.replyTo) {
      const original = value.messages[row.replyTo];
      memoryRequire(
        original &&
          original.status === "delivered" &&
          original.readAt &&
          original.readAt <= row.at &&
          memoryHash([original.from, original.to]) === memoryHash([row.to, row.from]) &&
          !replies.has(row.replyTo),
        "letter reply lost its exact correspondents or original writing",
      );
      replies.add(row.replyTo);
    }
  }
  const resolved = new Set<string>();
  for (const id of Object.keys(value.messages)) {
    const path = new Set<string>();
    let cursor: string | undefined = id;
    while (cursor && !resolved.has(cursor)) {
      memoryRequire(!path.has(cursor), "cyclic letter reply ancestry");
      path.add(cursor);
      cursor = value.messages[cursor].replyTo;
    }
    for (const key of path) resolved.add(key);
  }
  const prior = raw as MailboxState;
  for (const key of Object.keys(value.messages))
    if (isImmutableMemoryValue(prior.messages[key])) value.messages[key] = prior.messages[key];
  const result = immutableMemoryValue(value);
  validated.set(result, seed);
  return result;
}

/** Mail envelopes, accepted delivery facts and individual knowledge share the Village publication point. */
export function assertMailboxRetention(value: MailboxState, episodes: EpisodeCollection, seed: string) {
  const receipts = new Map(
    episodes.records.flatMap((episode, sequence) =>
      episode.commandReceipts
        .filter((receipt) => receipt.mail)
        .map((receipt) => [receipt.id, { receipt, episode, sequence }] as const),
    ),
  );
  const owned = new Set<string>();
  for (const row of Object.values(value.messages)) {
    for (const phase of ["written", "read"] as const) {
      const expected = mailReceipt(seed, row, row.text, phase, row.reading ? memoryHash(row.reading) : undefined),
        accepted = receipts.get(expected.id),
        publishedAt = phase === "written" ? row.deliveredAt : row.readAt;
      memoryRequire(
        publishedAt
          ? accepted &&
              accepted.episode.acceptedAt === publishedAt &&
              memoryHash(accepted.receipt) === memoryHash(expected)
          : !accepted,
        "mail envelope lost its accepted delivery or read receipt",
      );
      if (accepted) owned.add(expected.id);
    }
    if (row.replyTo && row.deliveredAt) {
      const original = value.messages[row.replyTo],
        read = receipts.get(mailReceipt(seed, original, original.text, "read").id),
        writing = receipts.get(mailReceipt(seed, row, row.text, "written").id);
      memoryRequire(
        read && writing && read.sequence < writing.sequence && read.episode.acceptedAt <= writing.episode.capturedAt,
        "letter reply predates the original accepted reading",
      );
    }
  }
  memoryRequire(receipts.size === owned.size, "accepted letter lost its native envelope");
}
