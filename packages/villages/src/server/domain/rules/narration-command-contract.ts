import { z } from "zod";
import { narrationSourceSchema } from "./narration-contract.js";
import { placeDraftSchema } from "./place-discovery.js";
import { npcAdmissionFields } from "./npc-participation.js";
import { CONSEQUENCES } from "./narrative-development.js";
import { MAX_VENUE_NAME_LENGTH } from "./prompt-preset.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

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
    .strict(),
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
        })
        .strict(),
    )
    .max(4)
    .optional(),
};
const id = z.string().min(1).max(160),
  label = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,47}$/);
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
  'Only with a supplied finite circumstance grant, {type:"circumstance",severity?:"gentle|moderate|dramatic",occurrence?,situation:{id?:supplied ID,title,summary,status?:"active|resolved"},conditions?:[{id?:supplied ID,observation?,restriction?:"none|ordinary-use",remedy?,durationMinutes?:1..10080,clear?:boolean}]} introduces an actual Player-seen local occurrence at its narration label (maximum one). It changes no room appearance, structure, service, weather or clock; room changes use keep. A new occurrence needs a perceivable condition. ' +
  'An actual observed supporting-person arrival uses {type:"npc.admit",localKey:"new:unique-name",existingId:supplied candidate ID} or, for a new identity, {type:"npc.admit",localKey:"new:unique-name",name,label?,characterization}. Supply the current introduction narration label in at and that Player-seen narration as source. Use localKey for this reply\'s structured actor references; never substitute it inside prose or exact citations. Existing candidates retain their fitted identity, private continuity and protections. Association is not attendance; they cannot hear earlier input/dialogue. Maximum four admissions and four responding people, with no automatic Villager/builder/access role. ' +
  'Native commands share {id?:label,at:segment label,source:[exact consequential sources],requires?:[effect IDs],independent?:true}. Current communication is required; recalled/private consent is never authority. Supported commands: {type:"depart",who} records an actual observed local resident exit through the native route; it ends their Scene presence without inventing an offstage destination or changing their Agenda. Player departure uses scene.end. {type:"move.request",to,actors:[every requested local actor]} grounds only the complete actual Player request and validates the whole native group at that input moment; resident responses stay ordinary ordered Scene prose and need their own evidence for consequences. It grants no movement or consent. For actual following use individually grounded move commands. {type:"move",who,to} validates a current connected Zone crossing at its narration label, with actual Player spoken/visible intent for Player movement or observed resident departure/arrival. Every consequential input source in a moving turn needs its explicit moment. A crossing applies before routing its labelled segment; native success assertions must require it. {type:"place.discover",existingId: supplied Place id} OR {type:"place.discover",place:{name,description,form?,report?,controllers?,zones?:[{id,name,kind:"public|staff|restricted",description,purpose?,controllers?,connectedTo?}],people?:[{ref,name,label?,characterization,existingId?,facts?,role?,availability?}]}} discovers existing infrastructure, never builds, grants ownership or establishes a service (maximum two); {type:"place.establish",project,objective,quote,met:true} records a current Player-witnessed objective, not a promise or Project completion (maximum eight); {type:"residence.request",by,venue}; {type:"residence.decide",by,person,venue,approved:boolean}; {type:"venue.request",by,name,classes:[native Venue classes]} submits a Villager request without establishing any service; {type:"project.start",project} invokes the same native Start/Resume only for explicit actual Player intent and current ready authority; {type:"appointment",by,when:{dayOffset:integer}|{weekday:weekday name,afterToday?:boolean}|{date:"YYYY-MM-DD"},minute?:0-1439} binds an actual current spoken appointment using the supplied calendar, never a past instant or clock mutation; {type:"scene.end"} only from the actual Player spoken/visible departure intent at the final segment; {type:"contact.end",who} ends only an admitted doorway contact, with deciding words (or the actual Player intent); {type:"project.decide",by,project,decision:"approval|builder|refuse|withdrawal|conditional|uncertain"}; {type:"permission.grant|permission.revoke",by,visitor,venue,zone}; {type:"access.decide",by,venue,zone,decision:{outcome:"invite-now|invite-later|invite-outside-hours|refuse|dismiss|ban-zone|ban-venue",visitor,accompanies?}|{outcome:"access-management",management:exact native AccessCommand action fields without operationId,expectedRevision,zoneId,sceneId}}. Use only supplied native scopes. A conditional or uncertain Project answer grants no approval or lead. An access condition beyond accompaniment cannot grant access. Native success assertions must require their command ID.';
