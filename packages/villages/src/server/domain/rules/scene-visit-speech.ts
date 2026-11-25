import { z } from "zod";
import type { NarrationReadset } from "../models/narration-model.js";
import type { readNarrationReply } from "./narration-contract.js";
import { asRecord } from "./coerce.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { withinVisitorHours } from "./venue-access.js";
import { badGateway } from "./errors.js";
import type { VillageVenue } from "../models/world.js";

export function sceneVisitOptions(
  access: NarrationReadset["access"],
  placeId: string,
  localIds: string[],
  localZoneIds: string[],
  calendar?: NarrationReadset["calendar"],
  currentVenue?: VillageVenue,
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
              .flatMap(({ id, name: room, policy, manages }) => {
                const current = currentVenue?.zones?.find((zone) => zone.id === id);
                const hours = (current?.access ?? policy)?.visitorHours;
                const inherited = currentVenue?.access?.visitorHours ?? venuePolicy?.visitorHours;
                const schedule = Array.isArray(hours) ? hours : hours === "inherit" ? inherited : null;
                const afterHours =
                  venueId === placeId &&
                  !!calendar &&
                  !!schedule &&
                  !withinVisitorHours(schedule, new ZonedDate(calendar.instant, calendar.timeZone));
                return afterHours && !manages
                  ? []
                  : [
                      {
                        venueId,
                        name,
                        actorId,
                        zoneId: id,
                        room,
                        ...(afterHours ? { afterHours: true as const } : {}),
                      },
                    ];
              })
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
  if (value === undefined) return undefined;
  const refuse = () => {
    if (readset.strictSceneReply && !readset.taggedSceneReply)
      throw badGateway("The invitation needs a listed option and its spoken line.");
    return undefined;
  };
  if (!readset.sceneVisitOptions || reply.halt) return refuse();
  if (!readset.strictSceneReply && reply.commands.some((row) => asRecord(row).type !== "npc.introduce"))
    return undefined;
  const tagged = readset.taggedSceneReply ? asRecord(value) : undefined;
  const parsed = visitReply.safeParse(
    tagged && typeof tagged.segment === "string"
      ? { ...tagged, segment: reply.segments.findIndex((line) => line.id === tagged.segment) + 1 }
      : value,
  );
  if (!parsed.success) return refuse();
  const choice = readset.sceneVisitOptions[parsed.data.option - 1];
  const line = reply.segments[parsed.data.segment - 1];
  if (
    !choice ||
    line?.kind !== "dialogue" ||
    line.speakerId !== choice.actorId ||
    line.presentation === "aside" ||
    (line.delivery === "whisper" && line.targetId !== "player")
  )
    return refuse();
  if (
    reply.commands.some((value) => {
      const command = asRecord(value);
      return (
        (command.type === "access.decide" || command.type === "permission.grant") &&
        command.by === choice.actorId &&
        command.at === line.id
      );
    })
  )
    return refuse();
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
      outcome: choice.afterHours
        ? "invite-outside-hours"
        : choice.venueId === readset.source.scene.placeId
          ? "invite-now"
          : "invite-later",
      visitor: "player",
      accompanies: parsed.data.escort,
    },
  };
}
