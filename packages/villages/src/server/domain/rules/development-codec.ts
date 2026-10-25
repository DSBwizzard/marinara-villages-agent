import { z } from "zod";
import type { DevelopmentProposal, DevelopmentState } from "../models/development-model.js";
import { conflict, badGateway } from "./errors.js";
const id = z.string().min(1).max(240);
const time = z.string().refine((v) => Number.isFinite(Date.parse(v)), "Invalid development time");
const text = z.string().trim().min(1).max(600);
const status = z.enum(["considering", "stalled", "arranged", "completed", "ended"]);
const decision = z.enum(["agree", "refuse", "conditional"]);
const pursuit = z.object({
  id,
  kind: z.literal("move"),
  status,
  sourceVenueId: z.string(),
  targetVenueId: id,
  privateZoneId: z.string(),
  reason: text,
  startedAt: time,
  updatedAt: time,
  consents: z.record(id, z.object({ decision, at: time, source: id })),
});
const saved = z.object({
  version: z.literal(1),
  enabled: z.boolean(),
  activatedAt: time,
  generation: z.number().int().nonnegative(),
  residents: z.record(
    id,
    z.object({
      revision: z.number().int().nonnegative(),
      reviewedThrough: time,
      nextReviewAt: time,
      reason: text,
      pursuits: z.array(pursuit).max(24),
    }),
  ),
  housing: z.record(id, z.object({ signature: z.string(), availableAt: time })).optional(),
  observations: z.record(id, z.object({ at: time, signature: z.string() })),
  log: z.array(z.object({ id, at: time, effectiveAt: time, actorId: id, outcome: text, reason: text })).max(100),
});
export function readDevelopment(raw: unknown): DevelopmentState | undefined {
  if (raw === undefined) return undefined;
  const parsed = saved.safeParse(raw);
  if (!parsed.success) throw conflict("The saved resident development record is invalid. Restore a valid checkpoint.");
  return parsed.data;
}
const proposal = z
  .object({
    version: z.literal(1),
    steps: z
      .array(
        z
          .object({
            id,
            characterId: id,
            pursuitId: id,
            kind: z.enum(["intend", "consent", "wait", "end", "move"]),
            at: time,
            reason: text,
            dependsOn: z.array(id).max(6),
            targetVenueId: id.optional(),
            privateZoneId: z.string().optional(),
            actorId: id.optional(),
            decision: decision.optional(),
          })
          .strict(),
      )
      .max(6),
    reviews: z
      .array(z.object({ characterId: id, nextReviewHours: z.number().min(24).max(168), reason: text }).strict())
      .min(1)
      .max(4),
  })
  .strict();
export function readDevelopmentProposal(raw: unknown): DevelopmentProposal {
  const parsed = proposal.safeParse(raw);
  if (!parsed.success)
    throw badGateway("Resident development returned an invalid review. The response is retained; retry is manual.");
  return parsed.data;
}
