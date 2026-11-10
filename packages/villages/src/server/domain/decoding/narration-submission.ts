import { z } from "zod";
import type { VenueSubmission } from "../models/scene-model.js";
import { memoryRequire } from "../rules/memory-integrity.js";
import { readSceneCalendar } from "../rules/scene-calendar.js";

const id = z.string().min(1).max(200),
  at = z.string().refine((value) => Number.isFinite(Date.parse(value)));
const subjects = z
  .array(z.object({ id: z.string().min(1).max(160), incarnation: z.string().min(1).max(160) }).strict())
  .max(256)
  .refine((rows) => new Set(rows.map((row) => row.id)).size === rows.length);
const repairs = z
  .array(
    z
      .object({
        id,
        revision: z.number().int().positive().safe(),
        entries: z
          .array(z.string().regex(/^continuity-[a-f0-9]{32}$/u))
          .min(1)
          .max(4)
          .refine((entries) => new Set(entries).size === entries.length),
      })
      .strict(),
  )
  .refine((rows) => new Set(rows.map((row) => row.id)).size === rows.length);
const saved = z
  .object({
    id,
    message: z.string().max(4000),
    mode: z.enum(["chat", "contact", "leave"]),
    targetId: z.string().max(200),
    requestFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
    at,
    acceptance: z
      .object({
        status: z.enum(["pending", "held", "applied", "abandoned"]),
        rejected: z.array(z.object({ id, reason: z.string().max(2000) }).strict()).max(64),
      })
      .strict(),
    narration: z
      .object({
        raw: z.record(z.string(), z.unknown()),
        responseDigest: z.string().regex(/^[a-f0-9]{64}$/),
        readset: z.custom<NonNullable<VenueSubmission["narration"]>["readset"]>((value) => {
          if (!value || typeof value !== "object") return false;
          const row = value as NonNullable<VenueSubmission["narration"]>["readset"];
          try {
            if (readSceneCalendar(row.calendar).instant !== row.capturedAt) return false;
          } catch {
            return false;
          }
          return (
            row.format === 1 &&
            typeof row.setupAt === "string" &&
            Number.isFinite(Date.parse(row.capturedAt)) &&
            Number.isSafeInteger(row.sceneRevision) &&
            Number.isSafeInteger(row.continuityRevision) &&
            Array.isArray(row.projects) &&
            Array.isArray(row.access) &&
            Array.isArray(row.places) &&
            Array.isArray(row.residence?.homes) &&
            Array.isArray(row.residence?.requests) &&
            Array.isArray(row.offered) &&
            Array.isArray(row.npcCandidates) &&
            row.npcCandidates.length <= 4 &&
            repairs.safeParse(row.repairs).success &&
            (row.circumstance === null || row.circumstance?.source === "scene") &&
            row.source?.scene?.version === 5 &&
            typeof row.source.seed === "string" &&
            typeof row.source.input === "string" &&
            typeof row.source.operationId === "string" &&
            typeof row.source.episodeId === "string" &&
            Array.isArray(row.source.actors) &&
            row.source.actors.length <= 32 &&
            subjects.safeParse(row.source.subjects).success &&
            JSON.stringify(row.source.subjects) === JSON.stringify(row.admission.subjects) &&
            row.source.historical &&
            row.admission?.seed === row.source.seed &&
            row.admission.episodeId === row.source.episodeId &&
            row.admission.operationId === row.source.operationId &&
            Array.isArray(row.admission.supplied)
          );
        }),
      })
      .strict()
      .optional(),
    episodeId: id.optional(),
    lore: z.array(z.unknown()).optional(),
    replyLineIds: z.array(id).max(24).optional(),
    zoneIdAtTurn: id.optional(),
    activeIdsAtTurn: z.array(id).max(32).optional(),
    activeIdsAfterTurn: z.array(id).max(32).optional(),
    progressProcessedAt: at.optional(),
    progressError: z.string().max(300).optional(),
    requestMetrics: z.array(z.unknown()).nullable().optional(),
    timing: z.unknown().optional(),
    responseDiagnostics: z.unknown().optional(),
    changeSequence: z.number().int().nonnegative().optional(),
    recordEvents: z.array(z.unknown()).optional(),
  })
  .strict();

/** One fresh saved contract; retired fictional-domain submissions are rejected. */
export function readNarrationSubmission(value: unknown): VenueSubmission {
  const row = saved.parse(value);
  memoryRequire(
    row.acceptance.status === "applied" ? row.episodeId && row.progressProcessedAt : row.narration,
    "saved narration has no pending purchase or accepted episode",
  );
  memoryRequire(
    !row.narration || row.narration.readset.source.input === row.message,
    "saved private submission changed",
  );
  return structuredClone(row) as VenueSubmission;
}
