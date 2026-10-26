import { openingPresence } from "./opening-presence.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type {
  ResidentPlanningOpportunity,
  VillageAgenda,
  VillageBackgroundPace,
  VillagePlayerBackground,
  VillageState,
  VillageVenue,
} from "../models/world.js";
import type { SocialPlan } from "../models/relationship-types.js";
import type { VillageMoment } from "./village-clock.js";
import { hashString } from "./village-clock.js";
import { villagerPlaceView } from "./village-projections.js";
import { boundText } from "./prompt-preset.js";
import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { renderPlayerBackgroundContext } from "./player-background.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";

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
  const wishing = residents.find((r) => r.agenda?.wishes.length);
  const rotation = (village.eventAttempts?.attempts.length ?? 0) % residents.length;
  const actorIds = overlap?.[1].slice(0, 4) ?? [(wishing ?? residents[rotation]!).characterId];
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
  village: string;
  setting: string;
  playerBackground?: VillagePlayerBackground | null;
  playerPersonaName?: string;
  worldFacts: readonly string[];
  moment: VillageMoment;
  residents: { characterId: string; name: string; profile: string; doing: string; agenda: VillageAgenda | null }[];
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
};
export function buildResidentPlanningMessages(context: ResidentPlanningContext): CapabilityLanguageModelMessage[] {
  const offered = context.opportunity;
  const housing = offered.actorIds.flatMap((id) => {
    const resident = context.residents.find((r) => r.characterId === id);
    if (!resident || context.pendingHousingCharacterIds.includes(id)) return [];
    return [
      {
        characterId: id,
        destinations: context.venues
          .filter((v) => !v.occupancy.playerHome && !v.occupancy.residentCharacterId)
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
    "World facts: " + JSON.stringify(context.worldFacts),
    "Current opportunity: " + JSON.stringify(offered),
    ...context.residents
      .filter((r) => offered.actorIds.includes(r.characterId))
      .map(
        (r) =>
          r.profile +
          "\nCurrent activity: " +
          r.doing +
          ". Private wishes: " +
          (r.agenda?.wishes ?? []).map((w) => w.wish).join("; "),
      ),
    "Prior memories by resident (only each resident’s own knowers are their knowledge): " +
      JSON.stringify(context.narrationMemories ?? {}),
    "Participants' own relationship context: " + context.social.relationships.join("\n"),
    "Optional future plans offered by code: " +
      JSON.stringify(context.social.candidates) +
      ". Select one exact offered ID with social.planId, or none. Availability is not preference or consent.",
    "A CURRENT encounter opportunity with at least two actors in one Zone may have social.encounter:{opportunityId,lines:[{speakerId,text}],relationshipReview:{changes:[],permissions:[],disclosures:[]}}. Write two to eight short spoken lines by offered actors only. Never invent player actions, past history, secrets, possessions, injury or physical effects. Omit the encounter if nothing fits. A separate System check interprets its consequences.",
    "Instead of an encounter, social.mail may be {senderId,text} from one offered actor to player, at most 2000 characters: a personal message, question or invitation grounded in their own intentions. No player consent, unseen deeds, or invented contact details. Choose at most one encounter or mail. Private/unknown locations permit mail only.",
    "Housing choices: " +
      JSON.stringify(housing) +
      ". housingRequests accepts at most one {who:exact resident ID,kind:move,venueId:offered destination ID}. It is a pending request, never a completed move. Usually empty; choose only a move the resident independently wants.",
    "routineIdea may be one {characterId,activity,venueId,zoneId,flexible:true} for an ordinary future activity at an existing accessible place, or null. It cannot establish employment, assets, commitments or physical changes.",
    'Return JSON with exactly these top-level fields: {"social":null,"routineIdea":null,"housingRequests":[]}. Replace null only for an applicable structured choice. No narration, public updates, memories or world-state edits.',
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
      !venue.occupancy.playerHome &&
      !venue.occupancy.residentCharacterId
    )
      housingRequests.push({ characterId, kind: "move", venueId });
  }
  return {
    housingRequests,
    routineIdea: (payload.routineIdea as ResidentPlanningProposal["routineIdea"]) ?? undefined,
    social: (payload.social as ResidentPlanningProposal["social"]) ?? undefined,
  };
}
