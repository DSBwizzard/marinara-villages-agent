import { z } from "zod";
import type { StartingHistoryState } from "../models/starting-history-model.js";
import { memoryRequire } from "../rules/memory-integrity.js";
import { readLoreUse } from "../../../shared/helpers/lore.js";
const id = z.string().min(1).max(200),
  ids = z
    .array(id)
    .max(32)
    .refine((rows) => new Set(rows).size === rows.length);
const current = z
  .object({
    reviewed: z.record(z.string(), id),
    sourceHash: z.union([z.literal(""), z.string().regex(/^[a-f0-9]{64}$/)]),
    lore: z.array(z.unknown()).optional(),
    clarifications: z.array(
      z
        .object({
          id,
          actorIds: ids.min(1),
          text: z.string().min(1).max(4000),
          at: z.string().refine((value) => Number.isFinite(Date.parse(value))),
        })
        .strict(),
    ),
    conflicts: z
      .array(
        z
          .object({
            actorIds: ids.min(1),
            question: z.string().min(1).max(600),
            citations: z
              .array(z.object({ sourceId: id, quote: z.string().min(1).max(2000) }).strict())
              .min(2)
              .max(8),
          })
          .strict(),
      )
      .max(16),
  })
  .strict();
export function readStartingHistory(raw: unknown): StartingHistoryState {
  const value = current.parse(raw);
  memoryRequire(typeof value.sourceHash === "string", "starting history source identity is missing");
  const { lore, ...state } = value;
  return { ...state, sourceHash: value.sourceHash, ...(lore ? { lore: readLoreUse(lore) } : {}) };
}
