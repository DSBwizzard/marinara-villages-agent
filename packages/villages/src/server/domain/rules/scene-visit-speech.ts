import { z } from "zod";
import type { NarrationReadset } from "../models/narration-model.js";
import type { readNarrationReply } from "./narration-contract.js";
import { asRecord } from "./coerce.js";

export function sceneVisitOptions(
  access: NarrationReadset["access"],
  placeId: string,
  localIds: string[],
  localZoneIds: string[],
) {
  return access
    .flatMap(({ venueId, name, authorities }) =>
      authorities.flatMap(({ actorId, zones, venuePolicy }) =>
        actorId !== "player" && localIds.includes(actorId)
          ? zones
              .filter(
                (zone) =>
                  zone.invites &&
                  (venueId !== placeId || localZoneIds.includes(zone.id)) &&
                  (venueId !== placeId ||
                    zone.policy?.mode !== "public" ||
                    zone.policy.accompanied ||
                    Array.isArray(zone.policy.visitorHours) ||
                    (zone.policy.visitorHours === "inherit" && !!venuePolicy?.visitorHours)),
              )
              .map(({ id, name: room }) => ({ venueId, name, actorId, zoneId: id, room }))
          : [],
      ),
    )
    .sort((a, b) => Number(b.venueId === placeId) - Number(a.venueId === placeId))
    .slice(0, 12)
    .map((entry, index) => ({ option: index + 1, ...entry }));
}

const visitReply = z
  .object({
    option: z.number().int().min(1).max(12),
    segment: z.number().int().min(1).max(24),
    escort: z.boolean(),
  })
  .strict();

/** Bind the GM's explicit invitation to a supplied destination and its actual spoken line. */
export function sceneVisitCommand(
  reply: ReturnType<typeof readNarrationReply>,
  readset: NarrationReadset,
  value: unknown,
) {
  if (
    !readset.sceneVisitOptions ||
    reply.halt ||
    reply.commands.some((row) => asRecord(row).type !== "npc.introduce") ||
    value == null
  )
    return undefined;
  const parsed = visitReply.safeParse(value);
  if (!parsed.success) return undefined;
  const choice = readset.sceneVisitOptions[parsed.data.option - 1];
  const line = reply.segments[parsed.data.segment - 1];
  if (
    !choice ||
    line?.kind !== "dialogue" ||
    line.speakerId !== choice.actorId ||
    line.presentation === "aside" ||
    (line.delivery === "whisper" && line.targetId !== "player")
  )
    return undefined;
  const ids = new Set([...reply.keep, ...reply.commands].map((row) => asRecord(row).id));
  let id = "scene-visit";
  for (let index = 1; ids.has(id); index++) id = "scene-visit-" + index;
  return {
    id,
    type: "access.decide",
    at: line.id,
    source: [{ segment: line.id }],
    by: choice.actorId,
    venue: choice.venueId,
    zone: choice.zoneId,
    decision: {
      outcome: choice.venueId === readset.source.scene.placeId ? "invite-now" : "invite-later",
      visitor: "player",
      accompanies: parsed.data.escort,
    },
  };
}
