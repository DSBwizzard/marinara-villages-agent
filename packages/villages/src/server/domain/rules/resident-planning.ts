import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { VILLAGE_ACTIVITY_POLICY } from "../../../shared/helpers/activity-policy.js";
import { z } from "zod";
import { readResidentNarrationCapture } from "../decoding/resident-narration-codec.js";
import { socialPlanSchema } from "../decoding/resident-plans-codec.js";
import type { ResidentNarrationCapture } from "../models/resident-narration.js";
import { NARRATION_KEEP, RELATIONSHIP_KEEP } from "./narration-contract.js";
import { memoryRequire } from "./memory-integrity.js";
import { readNarrationNativeCommand } from "./narration-command-contract.js";
import { narrationAccessPrompt } from "./narration-access.js";
import { narrationResidencePrompt } from "./narration-residence.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { SocialPlan } from "../models/resident-plans.js";
import type {
  ResidentPlanningOpportunity,
  VillageBackgroundPace,
  VillagePlayerBackground,
  VillageState,
  VillageVenue,
} from "../models/world.js";
import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { venueZones } from "./venue-zones.js";

import { PERSONAL_LETTER_INSTRUCTION } from "./personal-letter.js";
import { renderPlayerBackgroundContext } from "./player-background.js";
import type { VillageMoment } from "./village-clock.js";
import { hashString } from "./village-clock.js";
import { villagerPlaceView } from "./village-projections.js";

/** Only the admitted actors' current activities and place supply optional recall cues. */
export function residentPlanningRecallContext(
  state: Pick<VillageState, "villagers" | "venues" | "timeZone">,
  opportunity: ResidentPlanningOpportunity,
  _actorIds = opportunity.actorIds,
) {
  const venue = state.venues.find((row) => row.id === opportunity.venueId);
  const zone = venue && venueZones(venue).find((row) => row.id === opportunity.zoneId);
  return [venue?.name, zone?.name].filter(Boolean).join("\n");
}

export function localDateKey(now: Date): string {
  return (
    String(now.getFullYear()).padStart(4, "0") +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );
}
export function planningAllowance(pace: VillageBackgroundPace, _seed: string, _date: string): number {
  return VILLAGE_ACTIVITY_POLICY[pace].reviews;
}
/** Current shared space supports an encounter. A lone resident still has routine/housing choices. */
export function residentPlanningOpportunity(
  village: VillageState,
  moment: VillageMoment,
  startsAt: string,
  encounterConflicts: ReadonlySet<string> = new Set(),
): ResidentPlanningOpportunity | null {
  const residents = village.villagers.filter((resident) => !encounterConflicts.has(resident.characterId));
  if (!residents.length) return null;
  const currentPlaces = new Map<string, string[]>();
  for (const resident of residents) {
    const place = villagerPlaceView(
      village,
      resident,
      moment.minuteOfDay,
      new ZonedDate(moment.instant, moment.timeZone),
    );
    if (!place) continue;
    const key = JSON.stringify([place.id, place.zoneId ?? "exterior"]);
    currentPlaces.set(key, [...(currentPlaces.get(key) ?? []), resident.characterId]);
  }
  const overlap = [...currentPlaces]
    .map(([key, ids]) => [key, ids.filter((id) => !encounterConflicts.has(id))] as const)
    .find(([, ids]) => ids.length >= 2);
  const rotation = (village.eventAttempts?.attempts.length ?? 0) % residents.length;
  const actorIds = overlap?.[1].slice(0, 4) ?? [residents[rotation]!.characterId];
  const destination = overlap?.[0] ?? [...currentPlaces].find(([, ids]) => ids.includes(actorIds[0]))?.[0];
  const [venueId, zoneId] = destination ? (JSON.parse(destination) as [string, string]) : ["", "exterior"];
  const kind = overlap ? "encounter" : "routine";
  const id =
    "planning-" + hashString([village.seed, startsAt, moment.instant, kind, actorIds.join(","), venueId].join("|"));
  return {
    id,
    kind,
    actorIds,
    venueId,
    zoneId,
    startsAt,
    endsAt: moment.instant,
    facts: [
      moment.localTime + " local time",
      overlap ? "Residents currently share this Zone." : "Optional future routine and housing choices.",
    ],
  };
}
export function residentEncounterPlace(
  venues: readonly VillageVenue[],
  opportunity: ResidentPlanningOpportunity,
  _at: string,
) {
  const venue = venues.find((row) => row.id === opportunity.venueId);
  const zone = venue && venueZones(venue).find((row) => row.id === opportunity.zoneId);
  return venue && zone && opportunity.kind === "encounter"
    ? {
        venueId: venue.id,
        name: venue.name,
        category: venue.category,
        classes: venue.classes,
        zone: {
          id: zone.id,
          name: zone.name,
          kind: zone.kind,
        },
      }
    : undefined;
}

export type ResidentPlanningContext = {
  format: 1;
  catchup?: true;
  village: string;
  setting: string;
  playerBackground?: VillagePlayerBackground | null;
  playerPersonaName?: string;
  moment: VillageMoment;
  environment?: {
    weather: string;
  };
  residents: { characterId: string; name: string; profile: string }[];
  housing: { characterId: string; destinations: { id: string; name: string }[] }[];
  plans: SocialPlan[];
  narration: ResidentNarrationCapture;
};
const id = z.string().min(1).max(160),
  effectId = z.string().regex(/^[A-Za-z][A-Za-z0-9_-]{0,47}$/);
const proposal = z
  .object({
    encounter: z.unknown().optional(),
    reflection: z.unknown().optional(),
    mail: z
      .object({ senderId: id, text: z.string().min(1).max(2000) })
      .strict()
      .optional(),
    keep: z.array(z.unknown()).max(32).default([]),
    requires: z.array(effectId).max(48).default([]),
    commands: z.array(z.unknown()).max(16).default([]),
    planId: id.optional(),
    routineIdea: z
      .object({
        characterId: id,
        activity: z.string().min(1).max(160),
        venueId: z.string().max(160),
        zoneId: z.string().max(160).optional(),
        flexible: z.literal(true),
      })
      .strict()
      .optional(),
    housingRequests: z
      .array(z.object({ characterId: id, venueId: id }).strict())
      .max(1)
      .default([]),
  })
  .strict();
export type ResidentPlanningProposal = z.infer<typeof proposal>;

/** One common fictional source; native scheduling and housing remain explicit code-owned proposals. */
export function buildResidentPlanningMessages(context: ResidentPlanningContext): CapabilityLanguageModelMessage[] {
  const capture = readResidentNarrationCapture(context.narration),
    offered = capture.opportunity;
  const text = [
    VILLAGE_SHARED_SETTING_RULE,
    "You are the GM for one captured resident opportunity. Return one JSON object. A quiet result {} is valid; no daily quota or obligation to act. The player is absent: never invent player participation, knowledge, actions or consent.",
    "Cards govern complete identity. The shared continuity contains individual knowledge and private GM history, never a shared resident mind. Current desires, perspectives and commitments guide initiative naturally without a separate lifecycle review. A refusal remains meaningful; an unchanged desire is no reason to repeat a declined invitation.",
    "Choose at most one source: encounter, reflection or mail. encounter:{opportunityId,lines:[{id?:label,speakerId,text}|{id?:label,kind:narration,text}]} requires the offered encounter and two to eight short lines, with two actual speakers. Only captured participants hear ordinary words and witness explicitly grounded local actions. No player, whispers, travel, construction, official services or time skips. Current Room entries support freeform nonstructural changes; keep only affected complete entries. Omitted room details are not absent. Intentions are not completed deeds.",
    "reflection:{actorId,text} is one offered resident's private thought. Use segment:reflection with private perception for its own grounded keep; it proves no external observation, consent or other person's response. No public learning from private reflection.",
    "mail:{senderId,text} is an exact personal letter to the player from one offered resident instead of an encounter/reflection. Source letter refers to its exact writing; keep may retain only its actual writer or future reader. Player learning happens only when they read it. A letter grants no access and performs no native action.",
    PERSONAL_LETTER_INSTRUCTION,
    NARRATION_KEEP,
    RELATIONSHIP_KEEP,
    "Only an actual encounter may use commands:[{id?:label,at:line label,source:[current spoken line labels],requires?:[effect IDs],independent?:true,...}]. Each deciding actor must speak its complete decision now, to an actual participant. Supported: permission.grant or permission.revoke with by,visitor,venue,zone; access.decide with by,venue,zone,decision (invite-later,invite-outside-hours,ban-zone,ban-venue with visitor and optional accompanies; or access-management with the existing supplied management action); residence.request with by,venue; residence.decide with by,person,venue,approved; appointment with by,when:{dayOffset}|{weekday,afterToday?}|{date},minute?. No current-visit action or Scene ID. Use native:effect ID as a keep source for its actual result. Native authority and required household approvals remain mandatory; no immediate relocation. Reflections and letters perform no native commands.",
    "Use keep and requires in this same object for consequential lasting meaning; no meaning object, separate Wish/relationship review or full input classification. requires lists effects necessary to the source's successful fiction. Only independent:true permits an unrelated optional effect to drop. Historical aliases remain scoped; self is only the portrayed non-player's own internal state. Native mechanics cannot be obtained through keep.",
    context.catchup
      ? "This is a bounded past opportunity. Only encounter or private reflection is available; native commands may bind an actually spoken appointment date only. No current access, mail, plan, housing or routine changes."
      : "Optional future native choices: planId selects one exact offered plan ID. Availability is not preference or consent. routineIdea:{characterId,activity,venueId,zoneId?,flexible:true} proposes an ordinary future routine for one offered resident at an accessible existing place. housingRequests:[{characterId,venueId}] proposes one offered move, never a completed relocation. These are proposals, not asserted native successes. No employment, asset creation or unseen physical work.",
    "Village: " + context.village + ". Setting: " + context.setting,
    renderPlayerBackgroundContext(context),
  ].join("\n\n");
  return [
    { role: "system", content: text },
    {
      role: "user",
      content: JSON.stringify({
        opportunity: offered,
        calendar: context.moment,
        environment: context.environment,
        residents: context.residents,
        continuity: capture.context.prompt,
        room: capture.room ? { ...capture.room.packet, protections: capture.room.protections } : undefined,
        nativeCalendar: capture.calendar,
        access: narrationAccessPrompt(capture.access),
        residences: narrationResidencePrompt(capture.residence),
        plans: context.plans,
        housing: context.housing,
      }),
    },
  ];
}

export function readResidentPlanningProposal(
  payload: unknown,
  context: ResidentPlanningContext,
): ResidentPlanningProposal {
  const value = proposal.parse(payload),
    actors = context.narration.opportunity.actorIds;
  memoryRequire(
    [value.encounter, value.reflection, value.mail].filter(Boolean).length <= 1,
    "choose one resident fictional source",
  );
  memoryRequire(!value.mail || actors.includes(value.mail.senderId), "automatic correspondent was not offered");
  memoryRequire(!value.commands.length || !!value.encounter, "native commands require an actual resident encounter");
  memoryRequire(!value.planId || context.plans.some((plan) => plan.id === value.planId), "future plan was not offered");
  memoryRequire(!value.routineIdea || actors.includes(value.routineIdea.characterId), "routine owner was not offered");
  memoryRequire(
    value.housingRequests.every((request) =>
      context.housing.some(
        (row) =>
          row.characterId === request.characterId && row.destinations.some((venue) => venue.id === request.venueId),
      ),
    ),
    "housing choice was not offered",
  );
  if (context.catchup) assertCatchupChoices(value);
  return value;
}
/** Fresh and recovered results obey the same historical authority. */
export function assertCatchupChoices(payload: ResidentPlanningProposal) {
  memoryRequire(
    !payload.mail &&
      !payload.planId &&
      !payload.routineIdea &&
      !payload.housingRequests.length &&
      payload.commands.every((row) => readNarrationNativeCommand(row).type === "appointment"),
    "catch-up permits only encounters and private reflections",
  );
}

export type ResidentPlanningInput = {
  format: 1;
  context: ResidentPlanningContext;
  dateKey: string;
  reviewBasis?: string;
  socialPlan?: SocialPlan;
  catchup?: {
    batchId: string;
    captureRevision: string;
    until: string;
    world: import("../models/world.js").ReturnCatchupCapture["world"];
  };
};
const contextSchema = z
  .object({
    format: z.literal(1),
    catchup: z.literal(true).optional(),
    village: z.string(),
    setting: z.string(),
    playerBackground: z.unknown().optional(),
    playerPersonaName: z.string().optional(),
    moment: z.record(z.string(), z.unknown()),
    environment: z.unknown().optional(),
    residents: z
      .array(z.object({ characterId: id, name: z.string(), profile: z.string() }).strict())
      .min(1)
      .max(4),
    housing: z
      .array(
        z
          .object({ characterId: id, destinations: z.array(z.object({ id, name: z.string() }).strict()).max(256) })
          .strict(),
      )
      .max(4),
    plans: z.array(socialPlanSchema).max(6),
    narration: z.unknown(),
  })
  .strict();
const input = z
  .object({
    format: z.literal(1),
    context: contextSchema,
    dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    reviewBasis: z.string().optional(),
    socialPlan: socialPlanSchema.optional(),
    catchup: z
      .object({ batchId: id, captureRevision: id, until: z.string(), world: z.record(z.string(), z.unknown()) })
      .strict()
      .optional(),
  })
  .strict();
export function readResidentPlanningInput(raw: unknown): ResidentPlanningInput {
  const value = input.parse(raw),
    context = value.context;
  memoryRequire(context.format === 1, "unsupported resident planning context");
  const capture = readResidentNarrationCapture(context.narration);
  memoryRequire(
    context.moment.instant === capture.context.at &&
      new Set(context.residents.map((row) => row.characterId)).size === context.residents.length &&
      context.residents.length === capture.actors.length &&
      context.residents.every((row) => capture.actors.some((actor) => actor.id === row.characterId)),
    "resident planning profile or calendar changed cast",
  );
  memoryRequire(
    !!context.catchup === !!value.catchup &&
      !!capture.historical === !!value.catchup &&
      (!value.catchup ||
        (value.catchup.world.seed === capture.context.seed && value.catchup.world.setupAt === capture.context.setupAt)),
    "resident planning changed historical world",
  );
  memoryRequire(
    Buffer.byteLength(JSON.stringify(value)) <= 512000,
    "resident planning capture exceeds its bound before generation",
  );
  return value as unknown as ResidentPlanningInput;
}
