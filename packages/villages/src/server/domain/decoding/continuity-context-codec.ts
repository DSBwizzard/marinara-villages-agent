import { z } from "zod";
import { continuityEvidenceSchema } from "./continuity-codec.js";
import { continuityHolderKey } from "../rules/continuity.js";
import { episodeContextRooms } from "../rules/episode-sources.js";

const id = z.string().min(1).max(160),
  party = z.object({ id, incarnation: id }).strict(),
  revision = z.number().int().nonnegative().safe(),
  digest = z.string().regex(/^[a-f0-9]{64}$/),
  at = z.string().refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);
export const continuityTargetSchema = z
  .object({ id, recordRevision: revision, heads: z.record(z.string(), revision) })
  .strict();
/** Exact fitted common context; individual holders remain distinct from an Episode's actual cast. */
export const continuityCaptureSchema = z
  .object({
    seed: id,
    setupAt: at,
    at,
    actors: z.array(party).min(1).max(5),
    references: z.array(party).max(256),
    subjects: z.array(party).max(256),
    continuityRevision: revision,
    supplied: z.array(continuityTargetSchema).max(256),
    protection: z.record(digest, digest),
    protectedRoots: z.array(id).max(1024),
    historical: z.record(z.string().regex(/^h:/), continuityEvidenceSchema),
    provenance: z.record(z.string(), z.array(z.string().min(1).max(700))),
    sourceActors: z.record(z.string(), z.array(party).max(32)),
    offered: z
      .array(
        z
          .object({
            holder: z.object({ kind: z.literal("actor"), id, incarnation: id }).strict(),
            ids: z.array(id).max(256),
          })
          .strict(),
      )
      .max(5),
    prompt: z
      .object({
        entries: z.array(z.record(z.string(), z.unknown())).max(256),
        relationships: z
          .array(
            z
              .object({
                for: id,
                about: id,
                score: z.number().int().min(-100).max(100).optional(),
                romanticInterest: z.number().int().min(0).max(20).optional(),
              })
              .strict()
              .refine((row) => row.score !== undefined || row.romanticInterest !== undefined),
          )
          .max(16)
          .optional(),
        history: z.unknown(),
        protections: z.array(z.unknown()).max(1024),
      })
      .strict(),
  })
  .strict()
  .refine((value) => {
    const actors = [...value.actors, ...value.references],
      rooms = episodeContextRooms({ actors }, Object.keys(value.provenance)),
      keys = new Set([
        ...actors.map((actor) => continuityHolderKey({ kind: "actor", ...actor })),
        ...rooms.map(continuityHolderKey),
      ]);
    return (
      new Set(actors.map((actor) => actor.id)).size === actors.length &&
      new Set(value.subjects.map((actor) => actor.id)).size === value.subjects.length &&
      value.actors.every((actor) =>
        value.subjects.some((subject) => subject.id === actor.id && subject.incarnation === actor.incarnation),
      ) &&
      (value.prompt.relationships ?? []).every(
        (row) =>
          row.for !== "player" &&
          row.for !== row.about &&
          value.actors.some((actor) => actor.id === row.for) &&
          value.actors.some((actor) => actor.id === row.about),
      ) &&
      Object.keys(value.provenance).every((key) => keys.has(key)) &&
      new Set(value.offered.map((row) => row.holder.id)).size === value.offered.length &&
      value.offered.every(
        (row) =>
          value.actors.some((actor) => actor.id === row.holder.id && actor.incarnation === row.holder.incarnation) &&
          row.holder.id !== "player" &&
          row.ids.every((id) =>
            value.supplied.some(
              (target) => target.id === id && Object.hasOwn(target.heads, continuityHolderKey(row.holder)),
            ),
          ),
      ) &&
      Object.keys(value.historical).length <= 1024 &&
      Buffer.byteLength(JSON.stringify(value)) <= 160000
    );
  });
