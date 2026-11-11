import { z } from "zod";
import type { ResidentNarrationCapture } from "../models/resident-narration.js";
import { continuityCaptureSchema, continuityTargetSchema } from "./continuity-context-codec.js";
import { continuityHolderKey } from "../rules/continuity.js";
import { readSceneCalendar } from "../rules/scene-calendar.js";
import { narrationAccessScopeSchema } from "../rules/narration-access.js";
import { narrationResidenceContextSchema } from "../rules/narration-residence.js";
import { memoryHash, memoryRequire } from "../rules/memory-integrity.js";

const id = z.string().min(1).max(160),
  at = z.string().refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value),
  digest = z.string().regex(/^[a-f0-9]{64}$/);
const capture = z
  .object({
    format: z.literal(1),
    context: continuityCaptureSchema,
    opportunity: z
      .object({
        id,
        kind: z.enum(["encounter", "routine"]),
        startsAt: at,
        endsAt: at,
        actorIds: z.array(id).min(1).max(4),
        venueId: z.string().max(160),
        zoneId: id.optional(),
        facts: z.array(z.string().max(2000)).max(32),
      })
      .strict(),
    actors: z
      .array(z.object({ id, incarnation: id, zoneId: id }).strict())
      .min(1)
      .max(4),
    nativeFingerprint: digest,
    protectionFingerprint: digest,
    historical: z.literal(true).optional(),
    calendar: z.custom<ResidentNarrationCapture["calendar"]>((value) => {
      try {
        readSceneCalendar(value);
        return true;
      } catch {
        return false;
      }
    }),
    access: z.array(narrationAccessScopeSchema).max(256),
    residence: narrationResidenceContextSchema,
    room: z
      .object({
        holder: z.object({ kind: z.literal("room"), placeId: id, zoneId: id }).strict(),
        supplied: z.array(continuityTargetSchema).max(256),
        provenance: z.array(z.string().min(1).max(700)).max(256),
        protections: z.array(z.unknown()).max(1024),
        fingerprint: digest,
        packet: z
          .object({
            partial: z.boolean(),
            total: z.number().int().nonnegative().safe(),
            entries: z
              .array(
                z
                  .object({
                    id,
                    text: z
                      .string()
                      .min(1)
                      .refine((value) => Buffer.byteLength(value) <= 16000),
                    concealed: z.literal(true).optional(),
                    knownBy: z.array(id).max(32).optional(),
                    expiresAt: at.optional(),
                  })
                  .strict(),
              )
              .max(256),
          })
          .strict(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine((value) => {
    const source = value.opportunity,
      room = value.room;
    return (
      source.endsAt >= source.startsAt &&
      value.calendar.instant === source.endsAt &&
      value.access.every((scope) =>
        scope.authorities.every((authority) => value.actors.some((actor) => actor.id === authority.actorId)),
      ) &&
      value.residence.requests.every((request) =>
        value.actors.some((actor) => request.person === actor.id || request.requiredIds.includes(actor.id)),
      ) &&
      source.endsAt === value.context.at &&
      JSON.stringify(value.actors.map((actor) => actor.id)) === JSON.stringify(source.actorIds) &&
      JSON.stringify(value.context.actors.map((actor) => actor.id)) ===
        JSON.stringify(["player", ...source.actorIds]) &&
      value.actors.every(
        (actor) =>
          actor.id !== "player" &&
          actor.zoneId === (source.zoneId || "native") &&
          value.context.actors.some((row) => row.id === actor.id && row.incarnation === actor.incarnation),
      ) &&
      (source.kind !== "encounter" || (value.actors.length >= 2 && !!source.venueId && !!source.zoneId)) &&
      !!room === !!source.venueId &&
      (!room ||
        (room.holder.placeId === source.venueId &&
          room.holder.zoneId === source.zoneId &&
          room.packet.total >= room.packet.entries.length &&
          room.packet.partial === room.packet.total > room.packet.entries.length &&
          room.supplied.length === room.packet.entries.length &&
          room.supplied.every(
            (target) =>
              Object.keys(target.heads).length === 1 &&
              Object.hasOwn(target.heads, continuityHolderKey(room.holder)) &&
              room.packet.entries.some((entry) => entry.id === target.id),
          ) &&
          Buffer.byteLength(JSON.stringify(room.packet)) <= 16000)) &&
      Buffer.byteLength(JSON.stringify(value)) <= 192000
    );
  });
export function readResidentNarrationCapture(raw: unknown): ResidentNarrationCapture {
  const value = capture.parse(raw);
  memoryRequire(memoryHash(value) === memoryHash(raw), "resident capture cannot be normalized or repaired");
  return value as ResidentNarrationCapture;
}
