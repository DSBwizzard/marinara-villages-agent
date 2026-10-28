import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { SocialPlan } from "../models/relationship-types.js";
import type {
  ResidentPlanningOpportunity,
  VillageAgenda,
  VillageBackgroundPace,
  VillagePlayerBackground,
  VillageState,
  VillageVenue,
} from "../models/world.js";
import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { openingPresence } from "./opening-presence.js";
import { PERSONAL_LETTER_INSTRUCTION } from "./personal-letter.js";
import { renderPlayerBackgroundContext } from "./player-background.js";
import { boundText } from "./prompt-preset.js";
import { hasVenueClass, venueResidentIds } from "./venue-model.js";
import type { VillageMoment } from "./village-clock.js";
import { hashString } from "./village-clock.js";
import { villagerPlaceView } from "./village-projections.js";

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
  if (pace === "off") return 0;
  if (pace === "quiet") return 1;
  if (pace === "lively") return 6;
  return 3;
}
/** Current shared space supports an encounter. A lone resident still has routine/housing choices. */
export function residentPlanningOpportunity(
  village: VillageState,
  moment: VillageMoment,
  startsAt: string,
): ResidentPlanningOpportunity | null {
  const residents = village.villagers.filter((r) => !openingPresence(village, r.characterId));
  if (!residents.length) return null;
  const currentPlaces = new Map<string, string[]>();
  for (const resident of residents) {
    const place = villagerPlaceView(
      village,
      resident,
      null,
      moment.minuteOfDay,
      new ZonedDate(moment.instant, moment.timeZone),
    );
    if (!place) continue;
    const key = JSON.stringify([place.id, place.zoneId ?? "exterior"]);
    currentPlaces.set(key, [...(currentPlaces.get(key) ?? []), resident.characterId]);
  }
  const overlap = [...currentPlaces].find(([, ids]) => ids.length >= 2);
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
export type ResidentPlanningContext = {
  version: 1;
  /** Limit a historical opportunity to encounters and private reflection. */
  catchup?: true;
  /** Model-facing description of the single Zone that participants share. */
  catchupPlace?: {
    venueId: string;
    name: string;
    category: string;
    classes?: VillageVenue["classes"];
    zone: { id: string; name: string; kind: string; description: string };
  };
  village: string;
  setting: string;
  playerBackground?: VillagePlayerBackground | null;
  playerPersonaName?: string;
  worldFacts: readonly string[];
  moment: VillageMoment;
  residents: {
    characterId: string;
    name: string;
    profile: string;
    doing: string;
    agenda: VillageAgenda | null;
    wishes: import("../../../shared/contracts/wishes.js").SocialWish[];
  }[];
  venues: readonly VillageVenue[];
  pendingHousingCharacterIds: string[];
  opportunity: ResidentPlanningOpportunity;
  social: {
    candidates: SocialPlan[];
    relationships: string[];
    state?: import("../models/relationship-types.js").RelationshipState;
  };
  narrationMemories?: Record<string, string>;
  memory?: ReturnType<typeof import("./scene-memories.js").sceneMemoryContext>;
};
export type ResidentPlanningProposal = {
  routineIdea?: { characterId?: unknown; activity?: unknown; venueId?: unknown; zoneId?: unknown; flexible?: unknown };
  housingRequests: { characterId: string; kind: "move"; venueId: string }[];
  social?: { planId?: unknown; encounter?: unknown; mail?: unknown };
  wishReflection?: unknown;
};
export function buildResidentPlanningMessages(context: ResidentPlanningContext): CapabilityLanguageModelMessage[] {
  const offered = context.opportunity;
  const housing = context.catchup
    ? []
    : offered.actorIds.flatMap((id) => {
        const resident = context.residents.find((r) => r.characterId === id);
        if (!resident || context.pendingHousingCharacterIds.includes(id)) return [];
        return [
          {
            characterId: id,
            destinations: context.venues
              .filter(
                (v) =>
                  hasVenueClass(v, "residence") &&
                  v.constructionStatus !== "worksite" &&
                  !v.occupancy.playerHome &&
                  venueResidentIds(v).length === 0,
              )
              .map((v) => ({ id: v.id, name: v.name })),
          },
        ];
      });
  const text = [
    VILLAGE_SHARED_SETTING_RULE,
    "Review optional resident choices in this shared place. Return structured choices only. A quiet result is valid; no choice is required.",
    "The player controls their own words, actions, thoughts, decisions and consent. Never invent their participation or consent. Cards govern identity; private wishes need no disclosure or forced pursuit.",
    "Village: " + context.village + ". Setting: " + context.setting,
    renderPlayerBackgroundContext(context, false),
    "Retained desires are a catalogue for considering this opportunity, never a quota or a requirement to act. Ordinary life and the complete character govern attention. No Wish need be mentioned or pursued.",
    "World facts: " + JSON.stringify(context.worldFacts),
    "Current opportunity: " + JSON.stringify(offered),
    context.catchup && "Encounter place: " + JSON.stringify(context.catchupPlace ?? null),
    ...context.residents
      .filter((r) => offered.actorIds.includes(r.characterId))
      .map(
        (r) =>
          r.profile +
          "\nCurrent activity: " +
          r.doing +
          ". Private wishes: " +
          JSON.stringify(r.wishes.filter((w) => w.status === "open")),
      ),
    "Prior memories by resident (only each resident’s own knowers are their knowledge): " +
      JSON.stringify(context.narrationMemories ?? {}),
    "Participants' own relationship context: " + context.social.relationships.join("\n"),
    !context.catchup &&
      "Optional future plans offered by code: " +
        JSON.stringify(context.social.candidates) +
        ". Select one exact offered ID with social.planId, or none. Availability is not preference or consent.",
    "A CURRENT encounter opportunity with at least two actors in one Zone may have social.encounter:{opportunityId,lines:[{speakerId,text}],relationshipReview:{changes:[],permissions:[],disclosures:[]}}. Write two to eight short spoken lines by offered actors only. Never invent player actions, past history, secrets, possessions, injury or physical effects. Omit the encounter if nothing fits. A separate System check interprets its consequences.",
    !context.catchup &&
      "Instead of an encounter, social.mail may be {senderId,text} from one offered actor to player, at most 2000 characters: a personal message, question or invitation grounded in their own intentions. No player consent, unseen deeds, or invented contact details. Choose at most one encounter or mail. Private/unknown locations permit mail only.",
    "A quiet opportunity may include wishReflection:null or {actorId,desire:{wish,reason},reason} for one new grounded social desire, or {actorId,wishId,attention:{state:background|foreground,reason},reason} to reconsider attention, {actorId,wishId,decision:approach,approach:string,reason} to choose or stop an attempt (empty approach), or {actorId,wishId,decision:withdrawn,reason} only when this resident actually stops wanting that outcome. A failed attempt alone does not withdraw the desire. Use only an offered actor. Reflection never proves fulfillment, another person's response, or public knowledge. No new physical facts or completed experiences. No daily quota; retained desires do not require attention. Reflection is available only when social is null. Existing history and refusals govern initiative; an unchanged open Wish is not a reason to repeat a declined invitation. Ordinary social activity needs no Wish.",
    !context.catchup && PERSONAL_LETTER_INSTRUCTION,
    !context.catchup &&
      "Housing choices: " +
        JSON.stringify(housing) +
        ". housingRequests accepts at most one {who:exact resident ID,kind:move,venueId:offered destination ID}. It is a pending request, never a completed move. Usually empty; choose only a move the resident independently wants.",
    !context.catchup &&
      "routineIdea may be one {characterId,activity,venueId,zoneId,flexible:true} for an ordinary future activity at an existing accessible place, or null. It cannot establish employment, assets, commitments or physical changes.",
    context.catchup &&
      "This is a past catch-up opportunity. Choose only an encounter or a private reflection; no mail, housing request, routine change or future plan. Keep routineIdea null and housingRequests empty. Omit social.planId and social.mail.",
    'Return JSON with exactly these top-level fields: {"social":null,"routineIdea":null,"housingRequests":[],"wishReflection":null}. Replace null only for an applicable structured choice. No narration, public updates, memories or world-state edits.',
  ]
    .filter(Boolean)
    .join("\n\n");
  return [
    { role: "system", content: text },
    { role: "user", content: "Review the supplied resident choices. Return JSON only." },
  ];
}
export function readResidentPlanningProposal(
  payload: Record<string, unknown>,
  context: ResidentPlanningContext,
): ResidentPlanningProposal {
  if (
    !Object.hasOwn(payload, "social") ||
    !Object.hasOwn(payload, "routineIdea") ||
    !Array.isArray(payload.housingRequests) ||
    payload.housingRequests.length > 1 ||
    (payload.social !== null && (typeof payload.social !== "object" || Array.isArray(payload.social))) ||
    (payload.routineIdea !== null && (typeof payload.routineIdea !== "object" || Array.isArray(payload.routineIdea)))
  )
    throw new Error("Resident activity returned incomplete choices. Retry unfinished work explicitly.");
  if (context.catchup) assertCatchupChoices(payload);
  const housingRequests: ResidentPlanningProposal["housingRequests"] = [];
  const row = payload.housingRequests[0] as Record<string, unknown> | undefined;
  if (row && typeof row === "object") {
    const characterId = boundText(row.who, 160),
      venueId = boundText(row.venueId, 160);
    const venue = context.venues.find((v) => v.id === venueId);
    if (
      row.kind === "move" &&
      context.opportunity.actorIds.includes(characterId) &&
      !context.pendingHousingCharacterIds.includes(characterId) &&
      venue &&
      hasVenueClass(venue, "residence") &&
      venue.constructionStatus !== "worksite" &&
      !venue.occupancy.playerHome &&
      venueResidentIds(venue).length === 0
    )
      housingRequests.push({ characterId, kind: "move", venueId });
  }
  if (payload.wishReflection && payload.social) throw new Error("Choose an interaction or quiet reflection.");
  return {
    wishReflection: payload.wishReflection ?? null,
    housingRequests,
    routineIdea: (payload.routineIdea as ResidentPlanningProposal["routineIdea"]) ?? undefined,
    social: (payload.social as ResidentPlanningProposal["social"]) ?? undefined,
  };
}

/** Check both fresh model responses and saved results before committing historical work. */
export function assertCatchupChoices(payload: Record<string, unknown>): void {
  const social = payload.social;
  if (
    payload.routineIdea ||
    !Array.isArray(payload.housingRequests) ||
    payload.housingRequests.length > 0 ||
    (social != null &&
      (typeof social !== "object" ||
        Array.isArray(social) ||
        Object.keys(social).some((key) => key !== "encounter") ||
        !(social as Record<string, unknown>).encounter ||
        typeof (social as Record<string, unknown>).encounter !== "object" ||
        Array.isArray((social as Record<string, unknown>).encounter)))
  )
    throw new Error("Catch-up permits only encounters and private reflections.");
}
