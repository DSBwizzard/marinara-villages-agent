import { z } from "zod";
import { narrationSourceSchema } from "./narration-contract.js";
import { placeDraftSchema } from "./place-discovery.js";
import { npcAdmissionFields } from "./npc-participation.js";
import { CONSEQUENCES } from "./narrative-development.js";
import { MAX_VENUE_NAME_LENGTH } from "./prompt-preset.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

const id = z.string().min(1).max(160),
  label = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,47}$/);
export const narrationCircumstanceFields = {
  severity: z.enum(CONSEQUENCES).optional(),
  occurrence: z.string().min(1).max(1200).optional(),
  situation: z
    .object({
      id: z.string().min(1).max(160).optional(),
      title: z.string().min(1).max(160),
      summary: z.string().min(1).max(1200),
      status: z.enum(["active", "resolved"]).optional(),
    })
    .strict()
    .optional(),
  conditions: z
    .array(
      z
        .object({
          id: z.string().min(1).max(160).optional(),
          observation: z.string().min(1).max(600).optional(),
          restriction: z.enum(["none", "ordinary-use"]).optional(),
          remedy: z.string().max(600).optional(),
          durationMinutes: z.number().int().min(1).max(10080).optional(),
          clear: z.boolean().optional(),
          roomKeeps: z
            .array(label)
            .min(1)
            .max(4)
            .refine((labels) => new Set(labels).size === labels.length)
            .optional(),
        })
        .strict(),
    )
    .max(4)
    .optional(),
};
const base = {
  id: label.optional(),
  at: label,
  source: z.array(narrationSourceSchema).min(1).max(8),
  independent: z.literal(true).optional(),
  requires: z.array(label).max(8).optional(),
};
export const nativeCommand = z.discriminatedUnion("type", [
  z.object({ ...base, type: z.literal("circumstance"), ...narrationCircumstanceFields }).strict(),
  z.object({ ...base, type: z.literal("npc.admit"), ...npcAdmissionFields }).strict(),
  z.object({ ...base, type: z.literal("contact.end"), who: id }).strict(),
  z.object({ ...base, type: z.literal("scene.end") }).strict(),
  z.object({ ...base, type: z.literal("move"), who: id, to: id }).strict(),
  z.object({ ...base, type: z.literal("depart"), who: id.refine((value) => value !== "player") }).strict(),
  z
    .object({
      ...base,
      type: z.literal("move.request"),
      to: id,
      actors: z
        .array(id)
        .min(1)
        .max(4)
        .refine((ids) => new Set(ids).size === ids.length),
    })
    .strict(),
  z.object({ ...base, type: z.literal("project.start"), project: id }).strict(),
  z
    .object({
      ...base,
      type: z.literal("place.discover"),
      existingId: id.optional(),
      place: placeDraftSchema.optional(),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("place.establish"),
      project: id,
      objective: id,
      quote: z
        .string()
        .min(1)
        .max(1200)
        .refine((value) => value.trim().length > 0),
      met: z.literal(true),
    })
    .strict(),
  z.object({ ...base, type: z.literal("residence.request"), by: id, venue: id }).strict(),
  z
    .object({ ...base, type: z.literal("residence.decide"), by: id, person: id, venue: id, approved: z.boolean() })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("venue.request"),
      by: id,
      name: z.string().min(1).max(MAX_VENUE_NAME_LENGTH),
      classes: z.array(z.string()).min(1).max(2),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("appointment"),
      by: id,
      when: z.union([
        z.object({ dayOffset: z.number().int().min(-3660).max(3660) }).strict(),
        z.object({ weekday: z.enum(VILLAGE_WEEKDAYS), afterToday: z.boolean().optional() }).strict(),
        z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict(),
      ]),
      minute: z.number().int().min(0).max(1439).optional(),
    })
    .strict(),
  z
    .object({
      ...base,
      type: z.literal("project.decide"),
      by: id,
      project: id,
      decision: z.enum(["approval", "builder", "refuse", "withdrawal", "conditional", "uncertain"]),
    })
    .strict(),
  z.object({ ...base, type: z.literal("permission.grant"), by: id, visitor: id, venue: id, zone: id }).strict(),
  z.object({ ...base, type: z.literal("permission.revoke"), by: id, visitor: id, venue: id, zone: id }).strict(),
  z
    .object({
      ...base,
      type: z.literal("access.decide"),
      by: id,
      venue: id,
      zone: id.nullable(),
      decision: z.discriminatedUnion("outcome", [
        z
          .object({
            outcome: z.enum([
              "invite-now",
              "invite-later",
              "invite-outside-hours",
              "refuse",
              "dismiss",
              "ban-zone",
              "ban-venue",
            ]),
            visitor: id,
            accompanies: z.boolean().optional(),
          })
          .strict(),
        z.object({ outcome: z.literal("access-management"), management: z.unknown() }).strict(),
      ]),
    })
    .strict(),
]);
export function readNarrationNativeCommand(raw: unknown) {
  return nativeCommand.parse(raw);
}
export const NARRATION_NATIVE =
  "Native changes use commands:[{type,id?,at:segment ID,source:[exact current evidence],requires?,independent?,...fields}]. Mark prose asserting a change with requires:[command ID]. Use commands for actions that actually occur.\n" +
  'move {who,to} records one connected crossing at its narration ID. For the player cite both exact current intent and the observed crossing segment with perceive:{kind:"seen",by:["player"]}. The crossing applies before that segment. move.request {to,actors} records an explicit request to the entire named local group. It gives no consent or movement. Give each crossing its own move. depart {who} records an observed resident exit. scene.end uses actual player departure at the final segment. contact.end {who} ends an admitted doorway contact.\n' +
  'npc.admit {localKey:"new:label",existingId} or {localKey:"new:label",name,label?,characterization} uses the Player-seen arrival at its own segment. Newcomers hear only later lines. place.discover {existingId} or {place:{name,description,form?,report?,controllers?,zones?,people?}} discovers existing infrastructure. venue.request {by,name,classes} records a villager request. appointment {by,when:{dayOffset}|{weekday,afterToday?}|{date:"YYYY-MM-DD"},minute?} uses current spoken agreement and the supplied calendar.';

export const NARRATION_ACCESS_COMMANDS =
  'Access commands use supplied venue and zone IDs: permission.grant or permission.revoke {by,visitor,venue,zone}; access.decide {by,venue,zone,decision:{outcome:"invite-now|invite-later|invite-outside-hours|refuse|dismiss|ban-zone|ban-venue",visitor,accompanies?} or {outcome:"access-management",management:exact native action fields without operationId, expectedRevision, zoneId or sceneId}}. Cite deciding words. Only accompaniment is an allowed access condition.';

export const NARRATION_HOUSING_COMMANDS =
  "Housing commands: residence.request {by,venue}; residence.decide {by,person,venue,approved}. Cite the request or current decision about its exact terms.";

export const NARRATION_PROJECT_COMMANDS =
  'Project commands: project.start {project} needs explicit current Player Start or Resume. project.decide {by,project,decision:"approval|builder|refuse|withdrawal|conditional|uncertain"} uses deciding words. place.establish {project,objective,quote,met:true} records a Player-witnessed objective.';

export const NARRATION_CIRCUMSTANCE_COMMANDS =
  'circumstance with a supplied grant: {severity?:"gentle|moderate|dramatic",occurrence?,situation:{id?,title,summary,status?:"active|resolved"},conditions?:[{id?,observation?,restriction?:"none|ordinary-use",remedy?,durationMinutes?,clear?}]}. Cite Player-seen narration of the occurrence. A completed repair can use conditions:[{id,clear:true}] without a grant. It requires same-reply Room keeps for every linked entry citing the same completed repair.';
