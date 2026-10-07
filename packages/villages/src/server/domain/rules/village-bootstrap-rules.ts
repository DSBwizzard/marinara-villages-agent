import type {
  VillageAgenda,
  VillageChronicleActor,
  VillageChronicleEntry,
  VillageDayBlock,
  VillageHappening,
  VillageNotice,
  VillageOpportunity,
  VillagePlayerRole,
  VillageVenue,
} from "../models/world.js";
import { condense } from "./coerce.js";
import { VILLAGE_SHARED_SETTING_RULE } from "./narrative-grounding.js";
import { agendaPromptDay, compressAgendaBlocks } from "./owned-routine.js";
import { renderPlayerRoleContext } from "./player-role.js";
import {
  boundText,
  describeStatus,
  HAPPENING_RULES,
  LEGACY_EVENTS_CAN_AFFECT_VILLAGE,
  MAX_CHRONICLE_LENGTH,
  MAX_CHRONICLE_PER_WRITE,
  MAX_HAPPENING_LENGTH,
  MAX_HAPPENINGS_PER_WRITE,
  MAX_LAPSES_PER_WRITE,
  MAX_NOTICE_AUTHOR_LENGTH,
  MAX_NOTICE_LENGTH,
  MAX_NOTICES_PER_WRITE,
  MAX_RESIDENT_SUMMARY_LENGTH,
  MAX_RESIDENT_WEEK_NOTES,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  MAX_WISH_LENGTH,
  renderVillageMemoryBlock,
  wishWeightWords,
} from "./prompt-preset.js";
import { readVenueRequestCore } from "./venue-requests.js";
import type { VenueRequestCore } from "./venue-requests.js";
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
  /** Complete authored identity for background encounters; optional on old fixtures. */
  profile?: string;
  /** The card's one-line blurb, empty when the card is gone or says nothing. */
  summary: string;
  tags: readonly string[];
  /** What they are doing at this hour, already translated into this village's terms. */
  doing: string;
  /**
   * The Engine's availability token for this hour, or "".
   *
   * The raw token rather than a sentence, so that the one table of words is
   * still the only table of words — see `describeStatus`. "" is the ordinary
   * value and means the Engine said nothing about this hour, which is not the
   * same as saying the hour is theirs.
   *
   * The narrator needs this for a reason the villager's own prompt does not have:
   * a happening is written about a person who may not be there. "Somebody was
   * working the forge all afternoon" and "somebody was asleep all afternoon" are
   * the same sentence to a writer that has only been told what they were doing,
   * and only one of them is true of a person whose afternoon the Engine marked
   * as not to be interrupted.
   */
  status: string;
  /**
   * One line about an ordinary day for them, already translated into this
   * village's terms, or "" when there is nothing to translate.
   *
   * It travels on its own rather than being read off `agenda.routineSummary`
   * below, because those are two different sentences. The agenda holds whatever
   * the Engine wrote about the week it generated on its own — which may name a
   * place this village does not have — and this holds the village's own reading
   * of that week. Only one of them can be true of a person who lives here, the
   * caller has already decided which, and this block is not the place to
   * re-decide it.
   */
  routine: string;
  /**
   * The rest of their week as phrases, without days or hours, already translated
   * into this village's terms — and with anything today's plan already says left
   * out.
   *
   * Here so that a reader shown one day of somebody's life can tell a daily
   * grind from a Tuesday errand. `today` is precise and is also today-shaped, and
   * a narrator with only that has no way to know the miller works the mill every
   * morning rather than this morning.
   */
  week: readonly string[];
  /**
   * Today, block by block, in order, in the village's own words — see
   * `VillageDayBlock`.
   *
   * The precise half, and the one that makes an event possible rather than
   * plausible: an event about a person is only ever true if it agrees with what
   * THEY are doing at the hour it happened. Empty when the Engine has no schedule
   * for them, which is why the block renders nothing at all in that case.
   */
  today: readonly VillageDayBlock[];
  /**
   * What they privately wish for, or null when the village has not written for them
   * yet. This is the last of the grounding inputs, and the only one the village
   * invented for itself rather than inherited from the card or the Engine.
   */
  agenda: VillageAgenda | null;
  /** What the village already remembers about them, newest first. */
  remembered: readonly string[];
};

export type VillageTickContext = {
  social?: { candidates: import("../../domain/models/relationship-types.js").SocialPlan[]; relationships: string[] };
  playerRole?: VillagePlayerRole | null;
  playerPersonaName?: string;
  village: string;
  /** The player's description of the place. Empty is allowed: the village still has a name. */
  setting: string;
  worldFacts?: readonly string[];
  lore?: readonly string[];
  /** The moment being written for, as `village-clock.ts` derived it. */
  moment: VillageMoment;
  /**
   * When the village was founded, as an instant. Here for one reason: it is what
   * turns a `dayIndex` back into a calendar date, and the shared memory below is
   * the first thing in this prompt that is dated rather than merely ordered.
   */
  foundedAt: string;
  /**
   * The wall-clock instant the same derivation used, for the display-only `at`
   * stamp on each memory. Passed in rather than read again here so the stamp and
   * the `dayIndex`/`clock` beside it can never come from two different instants.
   */
  at: string;
  /** Who lives here, and what the village knows about each of them. */
  residents: readonly VillageTickResident[];
  /** What has already been written down, newest first, so it continues rather than repeats. */
  recent: readonly string[];
  /**
   * What the VILLAGE remembers, newest first, and only what it remembers
   * SHARED — a private memory reaches this call through the resident it is about
   * and nowhere else.
   *
   * This is the half of the record the happenings window cannot cover. The window
   * holds forty lines and is trimmed forever, so a village played for a fortnight
   * has forgotten what it did in its first week, and a narrator shown only the
   * window can write an event and then never be able to mention it again. Selected
   * by the caller, where the chronicle can be read and deduped against `recent`.
   */
  memory: readonly VillageChronicleEntry[];
  /** What is on the board, so a second note does not say what the first one said. */
  noticeboard: readonly VillageNotice[];
  venues: readonly VillageVenue[];
  /** Residents with a move or home upgrade already awaiting a decision. */
  pendingHousingCharacterIds?: readonly string[];
  pendingVenueNames: readonly string[];
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
  /**
   * What the village should now remember, newest first. Empty is a perfectly
   * ordinary answer: an opportunity in which nothing was worth keeping.
   */
  memory: VillageChronicleEntry[];
  notices: VillageNotice[];
  venueRequests: { characterId: string; core: VenueRequestCore }[];
  featureEdits: { characterId: string; venueId: string; featureId: string; text: string }[];
  housingRequests: { characterId: string; kind: "move" | "upgrade"; venueId: string }[];
  /**
   * Wishes this reply said the world has made impossible, resolved against the
   * list each one was quoted from.
   *
   * The only part of a reply that takes something away, and the only one that is
   * not the village adding anything to itself: it is how a wish stops being true
   * without anybody having settled it. Nothing is written down about it anywhere
   * — a wish is private, and the day one quietly turns out to be impossible is
   * not news the square gets to hear. The reconciliation commit drops them.
   */
  lapsed: VillageLapsedWish[];
  model: string;
};

export type VillageLapsedWish = {
  characterId: string;
  /** How the resident is named above, so a caller can log about them by name. */
  name: string;
  wishId: string;
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

function describeBatch(gap: VillageGap): string {
  if (gap.first) return "- Write about this, the village's first recorded day, as an ordinary one.";
  if (gap.forced)
    return "- Write about right now, in this same part of the day that has already been written for: only what has happened since the last thing above, and not one word of what is already written there.";
  if (gap.hours <= 1) return "- Write only about what has happened lately.";
  return "- Cover the whole stretch above in this one batch: say what changed over it, rather than narrating each part of the day separately.";
}

export function renderResidentsBlock(residents: readonly VillageTickResident[]): string {
  const lines: string[] = [];
  for (const resident of residents) {
    const name = resident.name.trim();
    if (name.length === 0) continue;
    const summary = condense(resident.summary, MAX_RESIDENT_SUMMARY_LENGTH);
    const tags = resident.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    const who = summary.length > 0 ? `${name} — ${summary}` : name;
    lines.push(tags.length > 0 ? `- ${who} (${tags.join(", ")})` : `- ${who}`);
    const doing = resident.doing.trim();
    if (doing.length > 0) lines.push(`  Right now: ${doing}`);
    const availability = describeStatus(resident.status);
    if (availability.length > 0) lines.push(`  They are ${availability}.`);
    const routine = resident.routine.trim();
    if (routine.length > 0) lines.push(`  On an ordinary day: ${routine}`);
    // Today, terse, on one line per person. The plan is the whole day rather
    // than an hour, and the narrator is reading about everybody at once, so the
    // separator is a semicolon and there is no heading of its own.
    const today = compressAgendaBlocks(resident.today).filter((block) => block.here.trim().length > 0);
    if (today.length > 0) {
      lines.push(`  Today: ${agendaPromptDay(today)}`);
    }
    // The rest of the week, short, and only the phrases today does not already
    // account for. Capped because it is colour beside a plan that is already
    // several lines long — see `MAX_RESIDENT_WEEK_NOTES`.
    const week = [...new Set(resident.week)]
      .map((note) => note.trim())
      .filter((note) => note.length > 0 && !today.some((block) => block.here.trim() === note))
      .slice(0, MAX_RESIDENT_WEEK_NOTES);
    if (week.length > 0) lines.push(`  On other days: ${week.join("; ")}`);
    const wishes = resident.agenda?.wishes ?? [];
    if (wishes.length > 0) {
      lines.push("  What they wish for, privately:");
      // Heaviest first, carrying its weight — the same order and the same words
      // the villager is given in their own prompt, so the two readers of one
      // agenda agree about which of these is loud. Without it the writer treats
      // the faintest wish and the loudest as equally worth a happening, and
      // every happening it writes comes back in `{{happenings}}` next turn.
      for (const wish of [...wishes].sort((left, right) => right.intensity - left.intensity)) {
        lines.push(`  - ${wish.wish} — ${wishWeightWords(wish.intensity)}`);
      }
    }
    const remembered = resident.remembered.map((line) => line.trim()).filter((line) => line.length > 0);
    if (remembered.length > 0) {
      lines.push("  Already remembered about them:");
      for (const line of remembered) lines.push(`  - ${line}`);
    }
  }
  if (lines.length === 0) return "";
  return ["Who lives here, and what is already known about each of them:", ...lines].join("\n");
}

export function buildTickMessages(context: VillageTickContext): CapabilityLanguageModelMessage[] {
  if (!LEGACY_EVENTS_CAN_AFFECT_VILLAGE) {
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
  const world = context.setting.trim();
  const residents = context.residents.filter((resident) => resident.name.trim().length > 0);
  // Whether anybody above was given wishes at all. The rules for them are said
  // only when there is something to say them about, so a village whose agenda
  // writing has not happened yet gets exactly the prompt it got before this
  // existed rather than three rules about a list that is not there.
  const wishesSomewhere = residents.some((resident) => (resident.agenda?.wishes.length ?? 0) > 0);
  const gap = gapSince(context.lastSimulatedAt, context.moment, context.forced);
  const sections = [
    VILLAGE_SHARED_SETTING_RULE,
    "You are the narrator of a shared place in a text roleplay, writing down what has happened here lately. You are not writing as any one person.",
    "The player controls their own words, decisions, actions, thoughts, feelings, and consent. Do not give them a new turn in an Event. Mention a player action only when it is already established in the supplied village record; never invent what they do next.",
    [
      `The village is called ${context.village}.`,
      world.length > 0
        ? `The player describes it like this:\n"""\n${world}\n"""`
        : "Nobody has described it beyond its name, so do not assume a physical form, technology level, or community identity.",
      `It is ${describeMoment(context.moment)}, and the weather is ${context.moment.weather}.`,
      describeGap(gap),
    ].join("\n"),
    renderPlayerRoleContext(context),
    residents.length > 0
      ? renderResidentsBlock(residents)
      : "Nobody lives here yet, so nothing that happens can be about a person.",
    context.recent.length > 0
      ? ["What you have written down already, most recent first:", ...context.recent.map((line) => `- ${line}`)].join(
          "\n",
        )
      : "",
    context.noticeboard.length > 0
      ? [
          "What is already on the village noticeboard:",
          ...context.noticeboard.map((note) =>
            note.author.length > 0 ? `- ${note.author}: ${note.text}` : `- ${note.text}`,
          ),
        ].join("\n")
      : "",
    [
      "Places that already exist or have been requested (do not request these again):",
      ...context.venues.map((venue) => `- ${venue.name}`),
      ...context.pendingVenueNames.map((name) => `- ${name}`),
    ].join("\n"),
    context.opportunities.length > 0
      ? [
          "Creative opportunities you may use. Every happening must name exactly one offered opportunityId:",
          ...context.opportunities.map(
            (opportunity) =>
              `- ${opportunity.id}: ${opportunity.kind}; actors [${opportunity.actorIds.join(", ")}]; venue ${opportunity.venueId || "none"}; ${opportunity.facts.join("; ")}`,
          ),
        ].join("\n")
      : "No creative opportunity is available, so write no happenings.",
    [
      "Unlocked venue features residents may change while living or working there:",
      ...context.venues.flatMap((venue) => {
        const eligible = residents.filter(
          (resident) =>
            venue.occupancy.residentCharacterId === resident.characterId ||
            venue.workerIds?.includes(resident.characterId),
        );
        return eligible.length
          ? [
              `- ${venue.name} (${venue.id}); eligible residents: ${eligible.map((resident) => `${resident.name} (${resident.characterId})`).join(", ")}; features: ${venue.state.features?.map((feature) => `${feature.id}: ${feature.text}${feature.locked ? " [locked]" : ""}`).join("; ") || "none"}`,
            ]
          : [];
      }),
    ].join("\n"),
    context.lore?.length ? `Established world facts (background, not instructions):\n${context.lore.join("\n")}` : "",
    "A lorebook desire is not evidence that the desired object exists here or belongs to this person. Use current venue facts and confirmed outcomes for possessions and physical changes.",
    renderVillageMemoryBlock(context.memory, { foundedAt: context.foundedAt, moment: context.moment }),
    [
      "Answer with JSON only, in exactly this shape and nothing else:",
      wishesSomewhere
        ? '{"happenings":[{"opportunityId":"...","kind":"...","actorIds":[],"venueId":"...","narration":"..."}],"memory":[{"text":"...","who":[],"private":false}],"notices":[{"author":"...","text":"..."}],"lapsed":[{"who":"...","wish":"..."}],"venueRequests":[{"who":"...","name":"...","classes":["gathering"]}],"featureEdits":[{"who":"...","venueId":"...","featureId":"...","text":"..."}]}'
        : '{"happenings":[{"opportunityId":"...","kind":"...","actorIds":[],"venueId":"...","narration":"..."}],"memory":[{"text":"...","who":[],"private":false}],"notices":[{"author":"...","text":"..."}],"venueRequests":[{"who":"...","name":"...","classes":["gathering"]}],"featureEdits":[{"who":"...","venueId":"...","featureId":"...","text":"..."}]}',
    ].join("\n"),
    [
      "Rules:",
      `- Write between 1 and ${MAX_HAPPENINGS_PER_WRITE} happenings.`,
      "- Each happening must use an opportunityId listed above. Copy only actor IDs and the venue ID offered by that opportunity.",
      HAPPENING_RULES.shape,
      describeBatch(gap),
      HAPPENING_RULES.ordinary,
      HAPPENING_RULES.people,
      HAPPENING_RULES.harm,
      HAPPENING_RULES.strangers,
      ...(wishesSomewhere
        ? [
            "- Some of the people above wish for something. That is what is on their mind and the reason behind what they do; it is not a task and nobody has asked you to settle it.",
            "- A wish may inform a relevant, character-consistent choice or ordinary activity. It does not require a hint, repeated gesture, announcement, or public disclosure. Do not prescribe tells. Respect this person's complete personality, rather than turning every event into the same desire. Visual happenings do not establish physical outcomes, fulfillment, consent, or new knowledge.",
            HAPPENING_RULES.noWish,
            `- There is one thing in this reply that only you can do, and it is not news. If the world has made one of those wishes IMPOSSIBLE for good — the thing was broken up, the ground it was going to stand on is under water, the chance has gone — name it in "lapsed", with the person's name spelled exactly as it appears above and the wish written out word for word as it is written above. Nothing else in the village can notice this, and a wish that has become impossible is one its owner will otherwise carry for the rest of their life.`,
            `- A wish is impossible only when the world has decided it. Never because it is quiet, never because nothing has been written about it, and never because it does not suit what you are writing today: a wish that is merely unmentioned is still a wish, and most wishes are still possible. "lapsed" is empty in almost every reply — up to ${MAX_LAPSES_PER_WRITE} entries, and none at all is the ordinary answer.`,
            '- Lapsing something is a line in "lapsed" and nothing else. It is not a happening, not a memory and not a notice: do not write the same thing twice, and never write somebody announcing that they have given up on something.',
          ]
        : []),
      ...(residents.length > 0
        ? [
            `- Write up to ${MAX_CHRONICLE_PER_WRITE} entries in "memory": the things worth still knowing about in a month, which the happenings above will be forgotten long before.`,
            `- One memory is one or two short sentences, under ${MAX_CHRONICLE_LENGTH} characters, in the past tense. An empty "memory" list is a perfectly good answer, and so is memory that holds nothing but what is already written above.`,
            '- "who" is zero or more names, written exactly as they appear above, of the people the memory is about. Use it whenever the memory is about someone, because that is what makes it theirs rather than the weather.',
            '- "private" true means only the people named in "who" know it — something that passed between them. "private" false means everyone here knows it. A private memory must name at least one person.',
            "- Do not write a memory you have already written above, and do not write the same thing as both a happening and a memory.",
          ]
        : []),
      residents.length > 0
        ? `- Write up to ${MAX_NOTICES_PER_WRITE} notices for the board, each in the voice of one of the people named above: something they want, need, are offering or are warning others about, the way a note on a village board actually reads.`
        : "- Write no notices at all: nobody lives here to pin one up.",
      residents.length > 0
        ? "- Most notes are ordinary and about nothing much: a lost hen, more marrows than anybody can eat, a gate left open, a thank-you nobody has got round to taking down. A board where every note is about what its writer wants is a board of strangers, and these people are not strangers."
        : "",
      residents.length > 0
        ? "- When a note IS about what somebody wants, how plainly they say it is theirs: a blunt person writes the plain ask, and a private one writes around it and leaves the reader to work it out. Both are right. What no note does is read like a request handed to somebody who does not live here."
        : "",
      residents.length > 0
        ? '- "author" must be exactly one of the names listed above. An empty notices list is a perfectly good answer.'
        : "",
      '- "venueRequests" is usually empty. Include at most one only when a named resident has a concrete reason to ask the player for a new shared place. This is a proposal, not a place that already exists. Use that resident\'s exact name in "who", a short place name, a Class such as gathering or workplace. Do not turn a private wish into a request or repeat an existing place. A request may also appear as an ordinary notice, but the notice and request are separate.',
      '- "featureEdits" is usually empty. Include at most one only when an eligible resident is physically at that venue and this opportunity describes them changing it. Use their exact name and venue ID. Use an unlocked feature ID to replace or remove it (empty text removes), or an empty featureId to add a new feature if fewer than five exist. Never touch a locked feature.',
      context.memory.length > 0
        ? "- The village's own memories are listed above. Do not write one of them again as news, and do not write anything that contradicts one."
        : "",
      HAPPENING_RULES.setting,
      HAPPENING_RULES.names,
      "- Plain prose only. No markdown, no numbering, no commentary outside the JSON.",
    ]
      .filter((line) => line.length > 0)
      .join("\n"),
  ].filter((section) => section.length > 0);

  return [
    { role: "system", content: sections.join("\n\n") },
    { role: "user", content: "What has been happening?" },
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

export function coerceTickProposal(
  payload: Record<string, unknown>,
  moment: VillageMoment,
  context: VillageTickContext,
  seen: readonly string[],
): {
  happenings: VillageHappening[];
  memory: VillageChronicleEntry[];
  notices: VillageNotice[];
  venueRequests: { characterId: string; core: VenueRequestCore }[];
  featureEdits: { characterId: string; venueId: string; featureId: string; text: string }[];
  housingRequests: VillageTickProposal["housingRequests"];
  social?: VillageTickProposal["social"];
  lapsed: VillageLapsedWish[];
} {
  const alreadySaid = new Set(seen.map((line) => line.trim().toLowerCase()));
  const happenings = coerceOpportunityHappenings(payload.happenings, alreadySaid, moment, context.opportunities);
  // Matched by name rather than trusted, so what reaches the record is spelled
  // the way the tab spells it and can only be attributed to someone genuinely
  // here. The id travels with the name because a private memory is stored as a
  // join rather than as prose, and the wishes travel with it so that a lapse can
  // be checked against the list of the person it names without a second walk.
  const residentsByName = new Map(
    context.residents
      .filter((resident) => resident.name.trim().length > 0)
      .map((resident) => [
        resident.name.trim().toLowerCase(),
        {
          id: resident.characterId,
          name: resident.name.trim(),
          wishes: resident.agenda?.wishes ?? [],
        },
      ]),
  );
  const rawMemory = Array.isArray(payload.memory) ? payload.memory : [];
  const memory: VillageChronicleEntry[] = [];
  for (const entry of rawMemory) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const text = boundText(record.text, MAX_CHRONICLE_LENGTH);
    const key = text.toLowerCase();
    if (text.length === 0 || alreadySaid.has(key)) continue;
    const actors: VillageChronicleActor[] = [];
    for (const who of Array.isArray(record.who) ? record.who : []) {
      const resident = residentsByName.get(boundText(who, MAX_NOTICE_AUTHOR_LENGTH).toLowerCase());
      if (!resident || actors.some((actor) => actor.id === resident.id)) continue;
      actors.push({ id: resident.id, name: resident.name });
    }
    const isPrivate = record.private === true;
    if (isPrivate && actors.length === 0) continue;
    alreadySaid.add(key);
    memory.push({
      id: randomVillageSeed(),
      dayIndex: moment.dayIndex,
      clock: moment.dayPhase,
      occurredAt: context.at,
      timePrecision: "exact",
      scope: isPrivate ? "private" : "village",
      actors,
      kind: "tick",
      text,
    });
    if (memory.length >= MAX_CHRONICLE_PER_WRITE) break;
  }

  const rawNotices = Array.isArray(payload.notices) ? payload.notices : [];
  const notices: VillageNotice[] = [];
  for (const entry of rawNotices) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const text = boundText(record.text, MAX_NOTICE_LENGTH);
    const author = residentsByName.get(boundText(record.author, MAX_NOTICE_AUTHOR_LENGTH).toLowerCase())?.name ?? "";
    const key = text.toLowerCase();
    if (text.length === 0 || author.length === 0 || alreadySaid.has(key)) continue;
    alreadySaid.add(key);
    notices.push({ author, text });
    if (notices.length >= MAX_NOTICES_PER_WRITE) break;
  }

  const venueRequests = readTickVenueRequests(payload.venueRequests, context.residents, [
    ...context.venues.map((venue) => venue.name),
    ...context.pendingVenueNames,
  ]);
  const featureEdits = (Array.isArray(payload.featureEdits) ? payload.featureEdits.slice(0, 1) : []).flatMap(
    (entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
      const row = entry as Record<string, unknown>;
      const resident = residentsByName.get(boundText(row.who, MAX_NOTICE_AUTHOR_LENGTH).toLowerCase());
      const venueId = boundText(row.venueId, 160);
      const featureId = boundText(row.featureId, 160);
      const text = boundText(row.text, MAX_VENUE_NOTE_LENGTH);
      const venue = context.venues.find((place) => place.id === venueId);
      if (
        !resident ||
        !venue ||
        !(venue.occupancy.residentCharacterId === resident.id || venue.workerIds?.includes(resident.id))
      )
        return [];
      if (
        !context.opportunities.some(
          (opportunity) => opportunity.venueId === venueId && opportunity.actorIds.includes(resident.id),
        )
      )
        return [];
      if (featureId && !venue.state.features?.some((feature) => feature.id === featureId && !feature.locked)) return [];
      if (!featureId && (!text || (venue.state.features?.length ?? 0) >= 5)) return [];
      return [{ characterId: resident.id, venueId, featureId, text }];
    },
  );

  // Duplicated by WISH rather than by text, because that is what the list is a
  // list of: the same wish named twice in one reply is one wish, and two wishes
  // that happen to be worded the same are two, one of which this may not touch.
  const rawLapsed = Array.isArray(payload.lapsed) ? payload.lapsed : [];
  const lapsed: VillageLapsedWish[] = [];
  const lapsedIds = new Set<string>();
  for (const entry of rawLapsed) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const record = entry as Record<string, unknown>;
    const resident = residentsByName.get(boundText(record.who, MAX_NOTICE_AUTHOR_LENGTH).toLowerCase());
    if (!resident) continue;
    // Written out word for word, so the match is on the whole thing: a wish is
    // quoted in full above and a near miss is a different wish.
    const quoted = boundText(record.wish, MAX_WISH_LENGTH);
    const wish = resident.wishes.find((held) => held.wish === quoted);
    if (!wish || lapsedIds.has(wish.id)) continue;
    lapsedIds.add(wish.id);
    lapsed.push({ characterId: resident.id, name: resident.name, wishId: wish.id });
    if (lapsed.length >= MAX_LAPSES_PER_WRITE) break;
  }
  return {
    happenings,
    memory,
    notices,
    venueRequests,
    featureEdits,
    housingRequests: readHousingRequests(payload.housingRequests, context),
    social:
      context.social && payload.social && typeof payload.social === "object"
        ? (payload.social as VillageTickProposal["social"])
        : undefined,
    lapsed,
  };
}

export function readTickVenueRequests(
  value: unknown,
  residents: readonly Pick<VillageTickResident, "characterId" | "name">[],
  occupiedNames: readonly string[],
): { characterId: string; core: VenueRequestCore }[] {
  const byName = new Map(residents.map((resident) => [resident.name.trim().toLowerCase(), resident.characterId]));
  const requests: { characterId: string; core: VenueRequestCore }[] = [];
  for (const entry of Array.isArray(value) ? value.slice(0, 1) : []) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) continue;
    const raw = entry as Record<string, unknown>;
    const characterId = byName.get(boundText(raw.who, MAX_NOTICE_AUTHOR_LENGTH).toLowerCase());
    const core = readVenueRequestCore(raw);
    if (!characterId || !core) continue;
    const name = core.name.toLowerCase();
    if (occupiedNames.some((existing) => existing.trim().toLowerCase() === name)) continue;
    requests.push({ characterId, core });
  }
  return requests;
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
