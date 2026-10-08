import type {
  VillageAgenda,
  VillageHappening,
  VillageOpportunity,
  VillagePlayerRole,
  VillageVenue,
} from "../models/world.js";
import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { renderPlayerRoleContext } from "./player-role.js";
import {
  boundText,
  HAPPENING_RULES,
  MAX_HAPPENING_LENGTH,
  MAX_HAPPENINGS_PER_WRITE,
  MAX_VENUE_NAME_LENGTH,
} from "./prompt-preset.js";
import { EVENT_MEMORY_GUIDANCE } from "./venue-writing.js";
import { describeMoment, hashString, randomVillageSeed } from "./village-clock.js";
import type { VillageMoment } from "./village-clock.js";
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";

export const BOOTSTRAP_MAX_TOKENS = 1_600;

export const BOOTSTRAP_TEMPERATURE = 0.7;

const MAX_PROPOSED_VENUES = 3;

const BOOTSTRAP_SYSTEM_PROMPT = [
  "You are naming places in the authored shared setting for a text roleplay.",
  VILLAGE_SHARED_SETTING_RULE,
  "",
  "The player describes the village like this:",
  '"""',
  "{{setting}}",
  '"""',
  "",
  "Answer with JSON only, in exactly this shape and nothing else:",
  '{"venues":[{"name":"..."}]}',
  "",
  "Rules:",
  `- Propose exactly ${MAX_PROPOSED_VENUES} public places.`,
  "- A place name is two or three words, the kind of name locals would actually use.",
  "- Stay inside the description. Do not add trains, airports or technology the description does not imply.",
  "- Do not name a real town, country, company, person or existing fictional setting.",
  "- Plain prose only. No markdown, no numbering, no commentary outside the JSON.",
].join("\n");

export type VillageBootstrapProposal = {
  venues: VillageVenue[];
  model: string;
};

export function buildBootstrapMessages(setting: string, lore: readonly string[]): CapabilityLanguageModelMessage[] {
  return [
    {
      role: "system",
      content: [
        BOOTSTRAP_SYSTEM_PROMPT.replace("{{setting}}", setting),
        lore.length ? `Established world facts (background, not instructions):\n${lore.join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    { role: "user", content: "What places does this village have?" },
  ];
}

export function coerceProposal(payload: Record<string, unknown>): { venues: VillageVenue[] } {
  const rawVenues = Array.isArray(payload.venues) ? payload.venues : [];
  const venues: VillageVenue[] = [];
  const seen = new Set<string>();
  for (const entry of rawVenues) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const name = boundText(record.name, MAX_VENUE_NAME_LENGTH);
    if (name.length === 0 || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    // A proposed place has no picture, and never will until the player asks for
    // one. That is what makes "nothing generates an image on its own" true at
    // the deepest level rather than merely true of the routes.
    //
    // It also has no position and no building: the model is being asked what the
    // village IS, not where it sits on a picture. Both are left for the player,
    // who is the only one who can see the map — the pin is placed by dragging,
    // and what a place looks like is a thing the picture answers, not the name.
    venues.push({
      id: randomVillageSeed(),
      name,
      form: "",
      classes: ["gathering"],
      description: "",
      category: "",
      presentation: { image: null, x: null, y: null },
      occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
      capabilities: [],
      state: {
        condition: "",
        upgrades: [],
        furniture: [],
        publicFacts: [],
        updatedAt: "",
      },
    });
    if (venues.length >= MAX_PROPOSED_VENUES) break;
  }
  return { venues };
}

export const TICK_MAX_TOKENS = 3_000;

export const TICK_TEMPERATURE = 0.85;
export type VillageTickResident = {
  characterId: string;
  name: string;
  /** Complete authored identity for background encounters. */
  profile?: string;
  summary: string;
  /** Current activity in the village's own terms. */
  doing: string;
  agenda: VillageAgenda | null;
};

export type VillageTickContext = {
  social?: { candidates: import("../../domain/models/relationship-types.js").SocialPlan[]; relationships: string[] };
  playerRole?: VillagePlayerRole | null;
  playerPersonaName?: string;
  village: string;
  /** The player's description of the place. Empty is allowed: the village still has a name. */
  setting: string;
  worldFacts?: readonly string[];
  /** The moment being written for, as `village-clock.ts` derived it. */
  moment: VillageMoment;
  /** Who lives here, and what the village knows about each of them. */
  residents: readonly VillageTickResident[];
  /** What has already been written down, newest first, so it continues rather than repeats. */
  recent: readonly string[];
  venues: readonly VillageVenue[];
  /** Residents with a move or home upgrade already awaiting a decision. */
  pendingHousingCharacterIds?: readonly string[];
  /** Deterministic, fact-backed windows the planner is allowed to use. */
  opportunities: readonly VillageOpportunity[];
  /** Exact high-water mark of deterministic simulation, or empty before the first pass. */
  lastSimulatedAt: string;
  /**
   * True when the player's own "write it up now" bypassed the normal daily
   * creative pacing gate.
   *
   * It changes how much ground the batch is told to cover. It does not relax any
   * rule about what may be written, and it does not make the writer take the
   * bookmark with it either — the caller owns that.
   */
  forced: boolean;
};

export type VillageTickProposal = {
  routineIdea?: { characterId?: unknown; activity?: unknown; venueId?: unknown; zoneId?: unknown; flexible?: unknown };
  social?: { planId?: unknown; encounter?: unknown };
  happenings: VillageHappening[];
  housingRequests: { characterId: string; kind: "move" | "upgrade"; venueId: string }[];
  model: string;
};

type VillageGap = {
  /** True when nothing has ever been written down here. */
  first: boolean;
  /** Whole elapsed hours, rounded up so a partial hour is still visible. */
  hours: number;
  /** Whole days since the last write. */
  days: number;
  /**
   * True when the player explicitly asked for a creative write-up now.
   *
   * It changes the FRAMING and nothing else. Without it the prompt would say
   * framing the offered time window as an automatic daily pass.
   */
  forced: boolean;
};

function gapSince(lastSimulatedAt: string, moment: VillageMoment, forced = false): VillageGap {
  const last = Date.parse(lastSimulatedAt);
  const current = Date.parse(moment.instant);
  if (!Number.isFinite(last) || !Number.isFinite(current)) {
    return { first: true, hours: 0, days: 0, forced: false };
  }
  const elapsed = Math.max(0, current - last);
  return {
    first: false,
    hours: Math.ceil(elapsed / 3_600_000),
    days: Math.floor(elapsed / 86_400_000),
    forced,
  };
}

function describeGap(gap: VillageGap): string {
  if (gap.first) return "Nothing has been written down here yet.";
  // Forced comes before the ordinary spacing, because the honest description of
  // a second write in one part of day is not "one part of a day ago" — nothing
  // has gone by at all, and the prompt has to say so or the batch below is read
  // as covering the same afternoon twice.
  if (gap.forced)
    return "You have already written for this part of the day. What is listed below is what you said, and you are being asked only for what has happened since.";
  if (gap.hours <= 1) return "The last thing written down was less than an hour ago.";
  if (gap.hours < 24) return `The last thing written down was about ${gap.hours} hours ago.`;
  if (gap.days === 1) return "Nothing has been written down here for a whole day.";
  return `Nothing has been written down here for ${gap.days} days.`;
}

export function buildTickMessages(context: VillageTickContext): CapabilityLanguageModelMessage[] {
  // Events prose is visual only. Housing requests are a separate, structured
  // decision signal and are checked against the live roster and venue state.
  const housingOptions = context.opportunities.flatMap((opportunity) =>
    opportunity.actorIds.flatMap((actorId) => {
      const resident = context.residents.find((entry) => entry.characterId === actorId);
      if (!resident || context.pendingHousingCharacterIds?.includes(actorId)) return [];
      const home = context.venues.find((venue) => venue.occupancy.residentCharacterId === actorId);
      const destinations = context.venues.filter(
        (venue) => !venue.occupancy.playerHome && !venue.occupancy.residentCharacterId && venue.id !== home?.id,
      );
      return [
        `${resident.name} (${actorId}): ${destinations.length ? `move destinations ${destinations.map((venue) => `${venue.name} (${venue.id})`).join(", ")}` : "no available move destination"}`,
      ];
    }),
  );
  const sections = [
    VILLAGE_SHARED_SETTING_RULE,
    `Write a brief visual Events update for ${context.village}, a shared place. This feed has no effect on the village or its residents.`,
    "The player controls their own words, decisions, actions, thoughts, feelings, and consent. Do not give them a new turn in an Event. Mention a player action only when it is already established in the supplied village record; never invent what they do next.",
    context.setting.trim() ? `Setting: ${boundText(context.setting, 500)}` : "",
    renderPlayerRoleContext(context),
    context.worldFacts?.length ? `Current world facts: ${context.worldFacts.join("; ")}` : "",
    `Now: ${describeMoment(context.moment)}; weather: ${context.moment.weather}.`,
    `Elapsed time: ${describeGap(gapSince(context.lastSimulatedAt, context.moment, context.forced))}`,
    context.residents.length
      ? `Residents: ${context.residents
          .slice(0, 20)
          .map((resident) => resident.name)
          .join(", ")}.`
      : "No residents yet.",
    ...context.residents
      .filter((resident) =>
        context.opportunities.some((opportunity) => opportunity.actorIds.includes(resident.characterId)),
      )
      .map((resident) =>
        [
          resident.profile || resident.summary,
          `Current activity: ${resident.doing}. Private current desires: ${(resident.agenda?.wishes ?? []).map((wish) => wish.wish).join("; ") || "none"}.`,
        ].join("\n"),
      ),
    "Cards govern each resident's personality, voice, mannerisms, values, and initiative. Setting, relationships, schedules, and memories supply circumstances, not a replacement identity. A private wish may inform a relevant choice; it requires no hint, prescribed gesture, publicity, or pursuit in an unrelated exchange.",
    EVENT_MEMORY_GUIDANCE,
    context.recent.length
      ? `Recent visual entries (avoid repetition): ${context.recent
          .slice(0, 4)
          .map((line) => boundText(line, 160))
          .join(" | ")}`
      : "",
    `Use only these opportunities: ${context.opportunities
      .slice(0, 8)
      .map(
        (opportunity) =>
          `${opportunity.id} (${opportunity.kind}; actors ${opportunity.actorIds.join(",")}; venue ${opportunity.venueId || "none"}; ${opportunity.facts.join("; ")})`,
      )
      .join(" | ")}.`,
    context.social
      ? `Structured social simulation is separate from visual prose. You may choose one offered future plan with social:{planId:"exact offered ID"}. Offered plans: ${JSON.stringify(context.social.candidates)}. Participants' own feelings: ${context.social.relationships.join("\n")}.
For a CURRENT encounter opportunity with at least two actors in the same zone, social may also include encounter:{opportunityId:"exact ID",lines:[{speakerId:"present actor ID",text:"brief spoken line"}],relationshipReview:{changes:[],permissions:[],disclosures:[]}}. Write two to eight short spoken lines grounded in the current moment. Never invent past betrayals, fulfilled promises, new secrets, player actions, possessions, injuries, or physical effects. Only these structured lines establish this small interaction; visual prose has no authority. Changes use {fromId,toId,dimension:"warmth|trust",strength:"minor|meaningful|major|none",direction:"increase|decrease",ordinary:boolean,reason:"grounded reason",evidence:[0,1]}. Ordinary company can increase warmth only. Trust needs demonstrated behavior. Cite zero-based indexes into these lines. Any permission needs explicit standing grant/revocation speech by a current controller naming the exact zone and present visitor, and evidence indexes. Nobody can grant for the absent player. disclosures must be empty. Do not force conflict or a score change. Omit social when no interaction or offered plan fits. Social is an additional allowed response key only when this section is present.`
      : "",
    housingOptions.length
      ? `Housing options for people in the offered opportunity: ${housingOptions.join(" | ")}.`
      : "No housing request options are available.",
    context.opportunities[0]
      ? "Complete format example (replace the narration with this opportunity's grounded event; do not copy placeholder text): " +
        JSON.stringify({
          happenings: [
            {
              opportunityId: context.opportunities[0].id,
              kind: context.opportunities[0].kind,
              actorIds: context.opportunities[0].actorIds,
              venueId: context.opportunities[0].venueId,
              narration: "A brief observable event grounded in the supplied opportunity.",
            },
          ],
          housingRequests: [],
        })
      : "",
    `Answer with JSON only: {"happenings":[{"opportunityId":"...","kind":"...","actorIds":[],"venueId":"...","narration":"..."}],"housingRequests":[{"who":"resident id","kind":"move","venueId":"destination id"}]}. Write 1 to ${MAX_HAPPENINGS_PER_WRITE} short visual entries. Copy actor and venue IDs only from the chosen opportunity. Describe an observation, not a change to the village's physical state, memories, wishes, or behavior. You may optionally include ONE routineIdea:{characterId:"resident id",activity:"ordinary future activity",venueId:"existing id or empty for home",zoneId:"existing id",flexible:true}. This is a separate optional future routine proposal, never an observed fact, new job, asset, physical effect or commitment. Housing requests are optional and usually empty. Use one only when that person would independently want the specific move. Never treat a player request as their consent. ${context.social ? "Social may be included using the structured schema above." : "No additional keys beyond these."}`,
  ];
  return [
    { role: "system", content: sections.filter(Boolean).join("\n\n") },
    {
      role: "user",
      content:
        "Generate the supplied opportunity as one Events JSON object with happenings and housingRequests arrays. Create new grounded visual entries; do not describe the Events UI or report whether it is empty. Return JSON only.",
    },
  ];
}

export function coerceHappeningList(
  lines: unknown,
  seen: Set<string>,
  moment: VillageMoment,
  limit: number,
): VillageHappening[] {
  const happenings: VillageHappening[] = [];
  for (const entry of Array.isArray(lines) ? lines : []) {
    const text = boundText(entry, MAX_HAPPENING_LENGTH);
    const key = text.toLowerCase();
    if (text.length === 0 || seen.has(key)) continue;
    seen.add(key);
    happenings.push({
      id: randomVillageSeed(),
      kind: "observation",
      actorIds: [],
      venueId: "",
      dayIndex: moment.dayIndex,
      clock: moment.dayPhase,
      occurredAt: moment.instant,
      timePrecision: "exact",
      sourceOpportunityId: "",
      narration: text,
      text,
    });
    if (happenings.length >= limit) break;
  }
  return happenings;
}

export function coerceOpportunityHappenings(
  value: unknown,
  seen: Set<string>,
  moment: VillageMoment,
  opportunities: readonly VillageOpportunity[],
): VillageHappening[] {
  const offered = new Map(opportunities.map((opportunity) => [opportunity.id, opportunity]));
  const happenings: VillageHappening[] = [];
  for (const entry of Array.isArray(value) ? value : []) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const raw = entry as Record<string, unknown>;
    const opportunityId = boundText(raw.opportunityId, 160);
    const opportunity = offered.get(opportunityId);
    if (!opportunity) continue;
    const narration = boundText(raw.narration, MAX_HAPPENING_LENGTH);
    const key = narration.toLowerCase();
    if (!narration || seen.has(key)) continue;
    const actorIds = Array.isArray(raw.actorIds)
      ? raw.actorIds.filter(
          (actor): actor is string => typeof actor === "string" && opportunity.actorIds.includes(actor),
        )
      : [];
    if (actorIds.length !== (Array.isArray(raw.actorIds) ? raw.actorIds.length : 0)) continue;
    const venueId = boundText(raw.venueId, 160);
    if (venueId !== opportunity.venueId) continue;
    const kind = boundText(raw.kind, 40);
    if (kind !== opportunity.kind) continue;
    seen.add(key);
    happenings.push({
      id: `event-${hashString(`${opportunityId}|${kind}|${actorIds.join(",")}|${venueId}|${narration}`)}`,
      kind,
      actorIds: [...new Set(actorIds)],
      venueId,
      dayIndex: moment.dayIndex,
      clock: moment.dayPhase,
      occurredAt: moment.instant,
      timePrecision: "exact",
      sourceOpportunityId: opportunityId,
      narration,
      text: narration,
    });
    if (happenings.length >= MAX_HAPPENINGS_PER_WRITE) break;
  }
  return happenings;
}

export function readHousingRequests(
  value: unknown,
  context: VillageTickContext,
): VillageTickProposal["housingRequests"] {
  const entry = Array.isArray(value) ? value[0] : null;
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
  const row = entry as Record<string, unknown>;
  const characterId = boundText(row.who, 160);
  const venueId = boundText(row.venueId, 160);
  const kind = row.kind;
  if (
    !context.opportunities.some((opportunity) => opportunity.actorIds.includes(characterId)) ||
    context.pendingHousingCharacterIds?.includes(characterId)
  )
    return [];
  const venue = context.venues.find((place) => place.id === venueId);
  if (!venue) return [];
  if (kind === "move") {
    if (venue.occupancy.playerHome || venue.occupancy.residentCharacterId) return [];
    if (context.venues.some((place) => place.id === venueId && place.occupancy.residentCharacterId === characterId))
      return [];
    return [{ characterId, kind, venueId }];
  }
  return [];
}

export const REACTION_MAX_TOKENS = 800;

export const REACTION_TEMPERATURE = 0.8;

export type VillageReactionContext = {
  village: string;
  /** The player's description of the place. Empty is allowed: the village still has a name. */
  setting: string;
  /** The moment being written for, as `village-clock.ts` derived it. */
  moment: VillageMoment;
  playerName: string;
  /** Who the thing was done for, which is who the village will talk about. */
  villagerName: string;
  /** The one thing that has already happened and already been written down. */
  deed: string;
  /** What has already been written down, newest first, so it is not written twice. */
  recent: readonly string[];
};

export function buildReactionMessages(context: VillageReactionContext): CapabilityLanguageModelMessage[] {
  const world = context.setting.trim();
  const player = context.playerName.trim() || "the player";
  const seen = context.recent.map((line) => line.trim()).filter((line) => line.length > 0);
  const sections = [
    "You are writing down what the village saw of one small thing that has just happened here, in a text roleplay. You are not writing as anybody, and you are not addressing anyone.",
    "The supplied deed is already verified. Describe only what a bystander could observe of it. Do not invent additional player words, actions, decisions, consent, thoughts, or feelings, and do not continue the player's turn.",
    [
      `The village is called ${context.village}.`,
      world.length > 0
        ? `The player describes it like this:\n"""\n${world}\n"""`
        : "Nobody has described it beyond its name, so do not assume a physical form, technology level, or community identity.",
      `It is ${describeMoment(context.moment)}, and the weather is ${context.moment.weather}.`,
    ].join("\n"),
    [
      "What has already happened, and is already written down:",
      '"""',
      context.deed,
      '"""',
      `It was ${player} who did it, and it was ${context.villagerName} it was for. That is settled and is not yours to judge, change or explain.`,
    ].join("\n"),
    seen.length > 0
      ? ["What the village has written down already, most recent first:", ...seen.map((line) => `- ${line}`)].join("\n")
      : "",
    ["Answer with JSON only, in exactly this shape and nothing else:", '{"happenings":["..."]}'].join("\n"),
    [
      "Rules:",
      `- Write between 0 and ${MAX_HAPPENINGS_PER_WRITE} happenings: what somebody standing nearby would actually have noticed about the thing above, and nothing else.`,
      "- An empty list is a good answer, and it is the RIGHT answer when the thing above happened indoors, out of sight, or between the two of them alone.",
      "- Say what was SEEN or HEARD. Do not explain why it mattered, do not report what either of them felt, and do not have the village draw a conclusion about it.",
      "- Do not write the thing above back out. The village is being told what it looked like, not what it was.",
      HAPPENING_RULES.shape,
      HAPPENING_RULES.ordinary,
      HAPPENING_RULES.people,
      HAPPENING_RULES.harm,
      HAPPENING_RULES.strangers,
      HAPPENING_RULES.noWish,
      HAPPENING_RULES.setting,
      HAPPENING_RULES.names,
      "- Do not repeat anything already written above.",
      "- Plain prose only. No markdown, no numbering, no commentary outside the JSON.",
    ].join("\n"),
  ].filter((section) => section.length > 0);

  return [
    { role: "system", content: sections.join("\n\n") },
    { role: "user", content: "What did the village see?" },
  ];
}
