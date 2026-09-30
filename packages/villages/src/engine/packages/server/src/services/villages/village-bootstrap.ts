import { renderPlayerRoleContext } from "./player-role.js";
import type { VillagePlayerRole } from "./types.js";
import { backgroundCalls, requireBackgroundSuccess } from "./background-context.js";
import { venueZones, canOccupyZone } from "./venue-zones.js";
// Villages — the two model calls the package makes.
//
// The first turns a setting into places. The product move it makes is
// "translate the activity, not the place": a character card supplies the verb
// (a ninja's skills, a cop's instincts) and the village supplies the noun (the
// places those verbs can happen in). Something has to invent the nouns, and
// that is `proposeVillage`.
//
// The second writes down what the village has been doing, what it should
// remember, and what its people have pinned to the board. It is in the same file
// because it is the same shape of call with the same posture, and separate
// because it is asked a completely different question.
//
// Both are deliberately ONE call whose output the player can then edit by hand.
// Two things follow from that:
//
//   * The model is never asked to describe a character. It is asked only about
//     the world, so its answer stays correct as villagers come and go. The one
//     exception is the name on a notice, which is a name the village already
//     holds and which the answer is checked against.
//   * The result is a PROPOSAL, not a fact. Everything either call returns is
//     bounded through the same helpers the routes use, and the player can
//     rewrite or delete any of it — which is why a failed or silly generation
//     is an annoyance rather than a broken village.
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { condense } from "./coerce.js";
import { villageAgendaDay } from "./agenda-plan.js";
import { completeAgendaWeek, workingAgendaWeek } from "./agenda-week.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";

import { villagesConnectionIdFor } from "./connections.js";
import { badRequest } from "./errors.js";
import {
  villagesDebugAgentsEnabled,
  villagesLanguageModels,
  villagesLogger,
  completeWithRoom,
  completionFailure,
} from "./package-runtime.js";
import {
  boundText,
  describeStatus,
  HAPPENING_RULES,
  LEGACY_EVENTS_CAN_AFFECT_VILLAGE,
  MAX_CHRONICLE_LENGTH,
  MAX_CHRONICLE_PER_WRITE,
  MAX_HAPPENINGS_PER_WRITE,
  MAX_HAPPENING_LENGTH,
  MAX_LAPSES_PER_WRITE,
  MAX_NOTICES_PER_WRITE,
  MAX_NOTICE_AUTHOR_LENGTH,
  MAX_NOTICE_LENGTH,
  MAX_RESIDENT_SUMMARY_LENGTH,
  MAX_SETTING_LENGTH,
  MAX_RESIDENT_WEEK_NOTES,
  MAX_ROUTINE_SUMMARY_LENGTH,
  MAX_VENUE_NAME_LENGTH,
  MAX_VENUE_NOTE_LENGTH,
  MAX_VENUE_DESCRIPTION_LENGTH,
  MAX_WISH_LENGTH,
  renderVillageMemoryBlock,
  wishWeightWords,
} from "./prompt-preset.js";
import type {
  VillageAgenda,
  VillageAgendaBlock,
  VillageChronicleActor,
  VillageChronicleEntry,
  VillageCompletedWish,
  VillageDayBlock,
  VillageHappening,
  VillageNotice,
  VillageOpportunity,
  VillageVenue,
  VillageWish,
} from "./types.js";
import { describeMoment, hashString, randomVillageSeed, type VillageMoment } from "./village-clock.js";
import { readVenueRequestCore, type VenueRequestCore } from "./venue-requests.js";

// Room for a model that reasons before it answers, plus eight places described
// in a sentence each: the thinking comes out of this budget. See
// `completeWithRoom`.
const BOOTSTRAP_MAX_TOKENS = 1_600;
const BOOTSTRAP_TEMPERATURE = 0.7;
/** A village is a place, not a gazetteer: past this many places a prompt stops being useful. */
const MAX_PROPOSED_VENUES = 3;

const BOOTSTRAP_SYSTEM_PROMPT = [
  "You are naming the places in a small fictional village for a text roleplay.",
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

/**
 * What one bootstrap call produced. It is a proposal: nothing here is written to
 * the village by this module, so the caller decides what to keep.
 */
export type VillageBootstrapProposal = {
  venues: VillageVenue[];
  model: string;
};

function buildBootstrapMessages(setting: string, lore: readonly string[]): CapabilityLanguageModelMessage[] {
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

/**
 * Pull the JSON object out of a reply.
 *
 * Models wrap JSON in prose and code fences no matter how firmly they are told
 * not to, so the outermost braces are what is trusted. Anything else is
 * unreadable and treated as a failed generation.
 *
 * Exported because the end-of-conversation call needs exactly this and a second
 * reader of the same untrusted shape would be a second place for it to be read
 * differently.
 */
export function extractJsonObject(content: string): Record<string, unknown> | null {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(content.slice(start, end + 1)) as unknown;
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function coerceProposal(payload: Record<string, unknown>): { venues: VillageVenue[] } {
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

/** Draft descriptions are returned to the player; the model never approves or stores them. */
export async function draftVillageVenueDescriptions(
  setting: string,
  venues: readonly { id: string; name: string; classes: readonly string[]; homeKind?: string | null }[],
  lore: readonly string[] = [],
): Promise<Record<string, string>> {
  if (!setting.trim() || venues.length === 0 || venues.length > 12)
    throw badRequest("Choose places and a setting first.");
  const rows = venues.map((venue) => ({
    id: boundText(venue.id, 100),
    name: boundText(venue.name, MAX_VENUE_NAME_LENGTH),
    classes: venue.classes,
    homeKind: boundText(venue.homeKind, 60),
  }));
  if (rows.some((row) => !row.id || !row.name)) throw badRequest("Each place needs a name before describing it.");
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const messages: CapabilityLanguageModelMessage[] = [
    {
      role: "system",
      content: [
        "Write one concrete, sensory description of each venue in this fictional village.",
        "Keep architecture, materials, climate and technology consistent with the setting and established lore.",
        "Describe the place itself, including visible non-feature furnishings when supplied. Do not invent named people or contradict supplied facts.",
        'Return JSON only: {"descriptions":[{"id":"...","text":"..."}]}. Each text is 2-4 sentences, under 1000 characters.',
      ].join("\n"),
    },
    { role: "user", content: JSON.stringify({ setting: setting.slice(0, MAX_SETTING_LENGTH), lore, venues: rows }) },
  ];
  const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 2_500, 2_500) });
  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 2_500, { temperature: 0.7 });
  const payload = extractJsonObject(completion.content ?? "");
  const descriptions = Array.isArray(payload?.descriptions) ? payload.descriptions : [];
  const known = new Set(rows.map((row) => row.id));
  const result: Record<string, string> = {};
  for (const entry of descriptions) {
    if (!entry || typeof entry !== "object") continue;
    const record = entry as Record<string, unknown>;
    const id = typeof record.id === "string" ? record.id : "";
    if (!known.has(id)) continue;
    const text = boundText(record.text, MAX_VENUE_DESCRIPTION_LENGTH).trim();
    if (text) result[id] = text;
  }
  return result;
}

/**
 * Ask the model what places this village has.
 *
 * Throws only when the call itself failed or the reply held no usable JSON.
 * An empty venue list is not an error — the caller stores the proposal and the
 * player edits it.
 */
export async function proposeVillage(
  setting: string,
  options: { signal?: AbortSignal; lore?: readonly string[] } = {},
): Promise<VillageBootstrapProposal> {
  const world = setting.trim();
  if (world.length === 0) throw badRequest("Write what the village is like before asking for places.");

  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const requestedMaxTokens = Math.min(model.maxOutputTokens ?? BOOTSTRAP_MAX_TOKENS, BOOTSTRAP_MAX_TOKENS);
  const fitted = model.fitContext(buildBootstrapMessages(world, options.lore ?? []), { maxTokens: requestedMaxTokens });
  const debugEnabled = !backgroundCalls.getStore() && villagesDebugAgentsEnabled();
  villagesLogger().debugOverride(debugEnabled, "[villages] bootstrap prompt: %s", JSON.stringify(fitted.messages));

  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
    temperature: BOOTSTRAP_TEMPERATURE,
    debugMode: debugEnabled,
    signal: options.signal,
  });

  const payload = extractJsonObject(completion.content ?? "");
  if (!payload) throw new Error("The village did not suggest any places. Try again, or write them yourself.");

  const proposal = coerceProposal(payload);
  if (proposal.venues.length === 0) {
    throw new Error("The village did not suggest any places. Try again, or write them yourself.");
  }
  return { ...proposal, model: model.model };
}

/** Three alternative names for the single public venue placed during founding. */
export async function proposePublicVenueNames(setting: string, lore: readonly string[] = []): Promise<string[]> {
  const world = setting.trim();
  if (!world) throw badRequest("Write what the village is like before asking for names.");
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const requestedMaxTokens = Math.min(model.maxOutputTokens ?? BOOTSTRAP_MAX_TOKENS, BOOTSTRAP_MAX_TOKENS);
  const messages: CapabilityLanguageModelMessage[] = [
    {
      role: "system",
      content: [
        "Suggest exactly three alternative names for one public meeting venue in a small fictional village.",
        "These are choices for the same venue, not three separate places. Keep each name short and distinct.",
        "Stay consistent with the setting and established lore. Do not introduce unsupported technology or geography.",
        'Answer with JSON only: {"names":["...","...","..."]}.',
        `Setting: ${world}`,
        lore.length ? `Established lore: ${lore.join("\n")}` : "",
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
    { role: "user", content: "What could we name the village's one public venue?" },
  ];
  const fitted = model.fitContext(messages, { maxTokens: requestedMaxTokens });
  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
    temperature: BOOTSTRAP_TEMPERATURE,
  });
  const payload = extractJsonObject(completion.content ?? "");
  const names = [
    ...new Set(
      (Array.isArray(payload?.names) ? payload.names : [])
        .map((name) => boundText(name, MAX_VENUE_NAME_LENGTH).trim())
        .filter(Boolean),
    ),
  ].slice(0, 3);
  if (names.length !== 3)
    throw new Error("The village could not suggest three names. Try again, or name the venue yourself.");
  return names;
}

// ── Writing down what has happened ──────────────────────────────────────────
//
// The village gets no scheduler and no timer, so nothing can advance it while
// the tab is closed. What it does have is a clock DERIVED from the wall clock
// and the moment it was founded, which means "a part of the day has gone by" is
// a fact any reader can work out for itself. This call is what turns that fact
// into words.
//
// It is asked for the happenings, the memories and the notices in one call
// because each only reads properly beside the others: a notice about the
// cooper's shed is a different notice once the village knows there was a fire,
// and a memory of who mended the roof only means something once the roof is
// known to have leaked. Two calls would cost more and say one less coherent
// thing.
//
// Everything here is best-effort. The caller catches what this throws and the
// village keeps its old news, because a misconfigured model must cost the
// village its happenings and never its record.

// A day's news written out, and room in front of it for a model that reasons
// before it answers — both come out of this one number. See `completeWithRoom`.
const TICK_MAX_TOKENS = 3_000;
/** Warmer than the bootstrap call: one village written at 0.7 repeatedly converges on one week. */
const TICK_TEMPERATURE = 0.85;

/**
 * One person the village is being written about.
 *
 * The names alone were the whole of what this call used to know, and that is
 * exactly why it could never write an event that belonged to anyone: told only
 * who lived here, the only honest thing it could produce was weather and broken
 * latches. Everything here is GROUNDING — the card's own one-line summary and
 * tags, what the Engine's native schedule says they are doing at this hour, and
 * what the village already remembers about them — so an event can be about a
 * person rather than about the place they happen to stand in.
 *
 * `characterId` is never rendered. It is here so a name the model wrote can be
 * turned back into the id a private memory is filed under.
 */
export type VillageTickResident = {
  characterId: string;
  name: string;
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

/** Everything the happening writer is told about the village it is writing for. */
export type VillageTickContext = {
  social?: { candidates: import("./relationship-types.js").SocialPlan[]; relationships: string[] };
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

/** What one creative planning call produced. The caller decides what reaches the record. */
export type VillageTickProposal = {
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

/**
 * One wish a reply has declared impossible, with the wish already found.
 *
 * The TEXT the model wrote is not kept. It was matched against the list the
 * resident actually holds and thrown away once it had done that one job, because
 * the thing that leaves the record must never be a sentence the model wrote —
 * it must be the wish the village itself is holding, named by its id.
 */
export type VillageLapsedWish = {
  characterId: string;
  /** How the resident is named above, so a caller can log about them by name. */
  name: string;
  wishId: string;
};

/** How much village time has gone by since the last write. */
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

/**
 * How long the village has gone un-narrated.
 *
 * Both numbers come out of the same subtraction because they are one fact told
 * twice: the count of parts of day is what lets the batch be sized, and the
 * count of days is what lets the prompt say "three days" the way a person would.
 * An unreadable stored key reads as "never written down", which costs one batch
 * that was not strictly needed and can never skip a part of the day entirely.
 */
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

/**
 * How much ground one batch has to cover.
 *
 * This is the whole of the "catch up on read" rule. A player who has been away
 * a week has missed 28 parts of a day, and asking for 28 entries would produce
 * either mush or a wall of text, so the stretch is asked for as one pass over
 * it. The village is as alive as the days it actually lived through, and the
 * prompt is told how many there were rather than pretending there was one.
 */
function describeBatch(gap: VillageGap): string {
  if (gap.first) return "- Write about this, the village's first recorded day, as an ordinary one.";
  if (gap.forced)
    return "- Write about right now, in this same part of the day that has already been written for: only what has happened since the last thing above, and not one word of what is already written there.";
  if (gap.hours <= 1) return "- Write only about what has happened lately.";
  return "- Cover the whole stretch above in this one batch: say what changed over it, rather than narrating each part of the day separately.";
}

/**
 * Who lives here, and what the village already knows about each of them.
 *
 * Three lines per resident, in the order that makes an event about a person
 * possible: what the card says they are, what they are doing at this hour, and
 * what the village has already written down about them. The last one is what
 * stops the village introducing the same complaint every week — the writer is
 * shown its own past.
 *
 * The card's summary is condensed rather than passed through, because it is the
 * only unbounded thing in the block: it is card prose and may be a paragraph,
 * while everything else here was written under a cap the village owns.
 *
 * Up to four lines follow the name and none of them is ever invented here.
 * `Right now` is what the Engine's schedule says they are doing, said the way it
 * happens in this village; `They are` is the Engine's own availability said in
 * words, and it is rendered only when the Engine actually wrote one; `On an
 * ordinary day` is the same week described in one line, again in this village's
 * terms; and the wishes are what they are privately after, each carried with the
 * small thing that gives it away and with how much of the day it is on their
 * mind.
 *
 * Both time lines arrive already translated — the caller does that, because it is
 * the caller that can see the villager's record — and NEITHER of them falls back
 * to the Engine's wording. That used to be how this block degraded, and it was
 * the same leak the translation exists to close, one hop further out: the
 * narrator writes happenings from this text, so an untranslated hour reaching
 * here came back as village news about somebody driving to an office. A villager
 * the village cannot place reads as wherever this village puts people it cannot
 * place, and one who was never translated at all reads shorter rather than
 * modern.
 *
 * A wish is written here as motivation and never as a thing to be settled — see
 * the rules in `buildTickMessages`, which is where that is actually enforced.
 *
 * The weight beside each wish is not decoration. This block is what the village
 * writes its happenings from, and a happening about a wish comes back in
 * `{{happenings}}` on the next turn — so a writer that cannot tell a faint wish
 * from a loud one amplifies the faint one into an event just as readily. The
 * words are the tab's and the villager's own, so all three readers of one agenda
 * agree about what an intensity means.
 * Exported so the block can be read without a host. It is pure, it is the whole
 * of what the narrator is told about the people in the village, and the thing
 * most worth checking about it is what is NOT in it.
 */
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
    const today = resident.today.filter((block) => block.here.trim().length > 0);
    if (today.length > 0) {
      lines.push(
        `  Today: ${today.map((block) => `${block.time} ${block.here.trim()}${block.reason ? ` (${block.reason})` : ""}`).join("; ")}`,
      );
    }
    // The rest of the week, short, and only the phrases today does not already
    // account for. Capped because it is colour beside a plan that is already
    // several lines long — see `MAX_RESIDENT_WEEK_NOTES`.
    const week = resident.week
      .map((note) => note.trim())
      .filter((note) => note.length > 0)
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
        const tell = wish.tell.trim();
        const surface = tell.length > 0 ? ` (it shows: ${tell})` : "";
        lines.push(`  - ${wish.wish}${surface} — ${wishWeightWords(wish.intensity)}`);
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

function buildTickMessages(context: VillageTickContext): CapabilityLanguageModelMessage[] {
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
      `Write a brief visual Events update for ${context.village}, a small fictional village. This feed has no effect on the village or its residents.`,
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
      `Answer with JSON only: {"happenings":[{"opportunityId":"...","kind":"...","actorIds":[],"venueId":"...","narration":"..."}],"housingRequests":[{"who":"resident id","kind":"move","venueId":"destination id"}]}. Write 1 to ${MAX_HAPPENINGS_PER_WRITE} short visual entries. Copy actor and venue IDs only from the chosen opportunity. Describe an observation, not a change to the village's physical state, memories, wishes, or behavior. Housing requests are optional and usually empty. Use one only when that person would independently want the specific move. Never treat a player request as their consent. ${context.social ? "Social may be included using the structured schema above." : "No other keys."}`,
    ];
    return [
      { role: "system", content: sections.filter(Boolean).join("\n\n") },
      { role: "user", content: "What appears in Events?" },
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
    "You are the narrator of a small village in a text roleplay, writing down what has happened here lately. You are not writing as any one person.",
    "The player controls their own words, decisions, actions, thoughts, feelings, and consent. Do not give them a new turn in an Event. Mention a player action only when it is already established in the supplied village record; never invent what they do next.",
    [
      `The village is called ${context.village}.`,
      world.length > 0
        ? `The player describes it like this:\n"""\n${world}\n"""`
        : "Nobody has described it beyond its name, so keep everything small and ordinary.",
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
            "- In what YOU write here, a wish is never announced and never acted on for its own sake. It may show ONLY as the small ordinary thing written in brackets after it, or as the reason behind a happening that was worth writing down on its own. Whether one of them ever says it out loud is theirs to decide, in their own conversation, and is not your business.",
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

/**
 * Bound one list of happening lines to what the window will hold.
 *
 * Shared by every writer that can add news, because all of them have to refuse
 * exactly the same things and none of them may let a different kind of line in:
 * a blank, something the village has already written down — a model shown its own
 * last entry will happily write it again — and anything past the cap.
 *
 * The `seen` set is mutated rather than copied, deliberately. A tick writes its
 * happenings, its memories and its notices out of ONE reply and the same sentence
 * must not arrive as both news and history, so the set spans the whole reply
 * rather than one list of it.
 */
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

function coerceOpportunityHappenings(
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

/**
 * Bound a creative reply to what the village will actually store.
 *
 * Three things are refused rather than repaired, and all for the same reason:
 * the village's own history is not something to guess at.
 *
 *   * A notice signed by someone who does not live here is dropped, not made
 *     anonymous. The board is these people talking to each other, and a name
 *     nobody recognises would be the model inventing a resident.
 *   * Anything the village has already written down is dropped, because a model
 *     shown its own last entry will happily write it again, and a window that
 *     says the same thing twice reads as broken rather than as quiet. One set
 *     covers happenings, memories and notices together: the same line must not
 *     arrive as both news and history.
 *   * A private memory is attributed or it is nothing. "Only Rosa knows this"
 *     with nobody named as Rosa is a sentence with no subject, and keeping it
 *     would put a line in the record that no villager can ever be told — the
 *     one shape that is invisible everywhere except the debug tab.
 *
 * A name the village does not recognise is treated differently in the two
 * scopes, on purpose. A private memory naming a stranger has no owner, so it is
 * dropped. A village memory naming a stranger still says something true about
 * the village, so the TEXT is kept and only the attribution is lost — an event
 * that reads as "someone lost a dog" is still an event.
 *
 * A lapse is refused the same way a notice's author is, and for a sharper
 * reason: the only thing that leaves the village can leave it through a name the
 * village holds and a wish that person is actually carrying. A name that is not
 * a resident, or words that do not match a wish they hold, are dropped rather
 * than repaired or searched for something close — a wish is quoted in full, so a
 * near miss is a different wish, and the cost of refusing one is that it stays
 * until it ages out, which is the safe direction. Nothing here drops anything:
 * the caller does that, from what this returns, because this function is a
 * parser and a parser that deletes is a parser nothing can test.
 */
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

function coerceTickProposal(
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

/**
 * Ask the model what has been happening in this village.
 *
 * Throws only when the call itself failed or the reply held nothing usable. The
 * caller is expected to catch it: a village that cannot be narrated this part of
 * time is a village that keeps the news it already had.
 */
export async function proposeHappenings(
  context: VillageTickContext,
  options: { signal?: AbortSignal } = {},
): Promise<VillageTickProposal> {
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const requestedMaxTokens = Math.min(model.maxOutputTokens ?? TICK_MAX_TOKENS, TICK_MAX_TOKENS);
  const fitted = model.fitContext(buildTickMessages(context), { maxTokens: requestedMaxTokens });
  const debugEnabled = !backgroundCalls.getStore() && villagesDebugAgentsEnabled();
  villagesLogger().debugOverride(debugEnabled, "[villages] creative prompt: %s", JSON.stringify(fitted.messages));

  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
    temperature: TICK_TEMPERATURE,
    debugMode: debugEnabled,
    signal: options.signal,
  });

  const payload = extractJsonObject(completion.content ?? "");
  if (!payload)
    throw new Error(completionFailure("Village happenings", completion, fitted.maxTokens ?? requestedMaxTokens));
  const proposal = LEGACY_EVENTS_CAN_AFFECT_VILLAGE
    ? coerceTickProposal(payload, context.moment, context, context.recent)
    : {
        // An old model or crafted reply may still send legacy effect keys.
        // Visual Events never promote them to an actionable proposal.
        happenings: coerceOpportunityHappenings(
          payload.happenings,
          new Set(context.recent.map((line) => line.trim().toLowerCase())),
          context.moment,
          context.opportunities,
        ),
        memory: [],
        notices: [],
        venueRequests: [],
        featureEdits: [],
        housingRequests: readHousingRequests(payload.housingRequests, context),
        social:
          context.social && payload.social && typeof payload.social === "object"
            ? (payload.social as VillageTickProposal["social"])
            : undefined,
        lapsed: [],
      };
  // Only the happenings are required. A reply that wrote news and remembered
  // nothing is a perfectly good afternoon, and failing it would cost the player
  // the news as well — so the memory list is allowed to be empty and the
  // happenings list is not.
  if (proposal.happenings.length === 0)
    throw new Error(completionFailure("Village happenings", completion, fitted.maxTokens ?? requestedMaxTokens));
  return { ...proposal, model: model.model };
}

// ── What the village saw of one thing the player did ─────────────────────────
//
// The part-of-day writer above is the village living its own life on a clock.
// This is the opposite case: the player has done something definite, it has
// already been written down, and the village is asked what it looked like from
// where everybody else was standing.
//
// It exists because of what the player can actually see. A conversation is
// private until it is remembered and a wish is private until it is answered, so
// without this the only trace of the player in the world panel is whatever the
// next part-of-day batch happens to invent — up to four real hours later, and
// only if that batch decided to mention it. A player who mends a roof wants the
// square to know about it now.
//
// It is deliberately NOT folded into the judge. The judge's whole value is that
// it answers one question coldly and cannot be talked into anything, and a call
// that also invents prose about the weather is a call that has stopped being a
// judge. One small extra call on an action the player chose to take is the price
// of keeping that.
//
// Nothing here is required to write anything. "Nobody saw, and it is not the
// village's business" is a good answer and is the right one for anything that
// happened indoors between two people.

// Room for a model that reasons before it answers — the thinking comes out of
// this budget. See `completeWithRoom`.
const REACTION_MAX_TOKENS = 800;
/** Warm, like the narrator: this is prose about a village rather than a verdict about a fact. */
const REACTION_TEMPERATURE = 0.8;

/**
 * What the reaction call is handed.
 *
 * `deed` is the village's OWN past-tense line about what happened — the judge's
 * memory of it where the judge wrote one, and the judge's sentence where it did
 * not — and never the player's own words. That is the whole safety of it: the
 * claim has already been checked before it gets here, so a player cannot have a
 * lie written into the village's news by this route.
 */
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

function buildReactionMessages(context: VillageReactionContext): CapabilityLanguageModelMessage[] {
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
        : "Nobody has described it beyond its name, so keep everything small and ordinary.",
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

/**
 * Ask the model what the village saw of something the player just did.
 *
 * Throws only when the call itself failed or the reply held no usable JSON. An
 * empty happening list is a perfectly good answer, so this returns rather than
 * throwing when the model was right about nobody having noticed.
 *
 * The caller is expected to catch what this throws. A village that did not
 * notice something is a village that keeps the news it already had, and this is
 * never allowed to cost the player the thing they actually did.
 */
export async function proposeReaction(
  context: VillageReactionContext,
  options: { signal?: AbortSignal } = {},
): Promise<{ happenings: VillageHappening[]; model: string }> {
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const requestedMaxTokens = Math.min(model.maxOutputTokens ?? REACTION_MAX_TOKENS, REACTION_MAX_TOKENS);
  const fitted = model.fitContext(buildReactionMessages(context), { maxTokens: requestedMaxTokens });
  const debugEnabled = !backgroundCalls.getStore() && villagesDebugAgentsEnabled();
  villagesLogger().debugOverride(debugEnabled, "[villages] reaction prompt: %s", JSON.stringify(fitted.messages));

  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
    temperature: REACTION_TEMPERATURE,
    debugMode: debugEnabled,
    signal: options.signal,
  });

  const payload = extractJsonObject(completion.content ?? "");
  if (!payload) throw new Error("The village did not say what it saw.");
  // Seeded with the window and with the deed itself, so the one line that must
  // never come back as news is the thing that just happened, which the village
  // has already written down somewhere else.
  const seen = new Set(context.recent.map((line) => line.trim().toLowerCase()));
  seen.add(context.deed.trim().toLowerCase());
  return {
    happenings: coerceHappeningList(payload.happenings, seen, context.moment, MAX_HAPPENINGS_PER_WRITE),
    model: model.model,
  };
}

// Ordinary routine generation is independent of the finite wish lifecycle.
// Explicit personalization writes a profile and seven days; completion never calls it.
const AGENDA_MAX_TOKENS = 3_000;
const AGENDA_DAY_MAX_TOKENS = 4_000;
/** Cooler than either village call: this is one person's steady disposition, not an afternoon's weather. */
const AGENDA_TEMPERATURE = 0.6;
/** Bound card prose in routine requests without a separate summarization call. */
const AGENDA_DESCRIPTION_MAX = 1_200;

const AGENDA_SYSTEM_PROMPT =
  'Describe a stable ordinary routine for this village resident. Return JSON only: {"agenda":"one sentence"}. Do not generate wishes or unresolved wish errands. Current village facts outrank older lore.';
export type VillageAgendaContext = {
  characterId?: string;
  village: string;
  setting: string;
  home?: string;
  lore?: readonly string[];
  completedWishes?: readonly VillageCompletedWish[];
  activeWishes?: readonly VillageWish[];
  venues: readonly VillageVenue[];
  name: string;
  summary: string;
  tags: readonly string[];
  personality: string;
  description: string;
  routineSummary: string;
};

function buildAgendaMessages(context: VillageAgendaContext): CapabilityLanguageModelMessage[] {
  return [
    { role: "system", content: AGENDA_SYSTEM_PROMPT },
    {
      role: "user",
      content: JSON.stringify({
        village: context.village,
        setting: context.setting,
        name: context.name,
        summary: context.summary,
        personality: context.personality,
        description: context.description.slice(0, AGENDA_DESCRIPTION_MAX),
        home: context.home,
        lore: context.lore,
      }),
    },
  ];
}

function buildAgendaDayMessages(
  context: VillageAgendaContext,
  weekday: string,
  summary: string,
): CapabilityLanguageModelMessage[] {
  const places = context.venues.map((venue, index) => ({
    venue: index + 1,
    name: venue.name,
    condition: venue.state.condition,
    zones: venueZones(venue)
      .filter((zone) => !context.characterId || canOccupyZone(venue, zone, context.characterId))
      .map((zone) => ({ id: zone.id, kind: zone.kind })),
  }));
  return [
    {
      role: "system",
      content: [
        `Write ${context.name}'s ${weekday} in ${context.village} as a village agenda. Return JSON only: {"blocks":[{"startMinute":0,"endMinute":420,"venue":0,"zoneId":"exact zone id","activity":"Sleeping at home","reason":"To rest","status":"offline","flexible":false}]}`,
        "Cover every minute from 0 to 1440 in ordered, non-overlapping blocks. Waking activities change every 30 to 60 minutes; sleep and sustained work can last longer.",
        "Venue 0 is home; otherwise copy a numbered place. Status is online, idle, dnd, or offline. Mark flexible:true ONLY for optional free-time activities, never meals, sleep, work, or commitments.",
        "Write a stable ordinary routine independent of wishes. Never add unresolved wish errands or assume that an object mentioned as desired in lore is already owned. Current village facts outrank older lore.",
      ].join("\n"),
    },
    {
      role: "user",
      content: JSON.stringify({
        setting: context.setting,
        home: context.home,
        person: {
          summary: context.summary,
          personality: context.personality,
          description: context.description.slice(0, AGENDA_DESCRIPTION_MAX),
        },
        routine: summary,
        places,
        lore: context.lore,
      }),
    },
  ];
}

function completeModelDay(
  payload: Record<string, unknown>,
  context: VillageAgendaContext,
  weekday: string,
): Record<string, VillageAgendaBlock[]> | null {
  if (!Array.isArray(payload.blocks)) return null;
  const rows = payload.blocks as Record<string, unknown>[];
  let cursor = 0;
  for (const row of rows) {
    if (!row || row.startMinute !== cursor || !Number.isInteger(row.endMinute) || (row.endMinute as number) <= cursor)
      return null;
    if (typeof row.activity !== "string" || !row.activity.trim()) return null;
    if (row.status !== "online" && row.status !== "idle" && row.status !== "dnd" && row.status !== "offline")
      return null;
    if (
      cursor >= 0 &&
      cursor < 1440 &&
      row.status !== "offline" &&
      row.status !== "dnd" &&
      (row.endMinute as number) - cursor > 60
    )
      return null;
    cursor = row.endMinute as number;
  }
  if (cursor !== 1440) return null;
  const mapped = rows.map((row) => ({
    ...row,
    venueId: typeof row.venue === "number" ? (context.venues[row.venue - 1]?.id ?? "") : "",
    zoneId: typeof row.zoneId === "string" ? row.zoneId : undefined,
  }));
  return completeAgendaWeek({ [weekday]: mapped }, workingAgendaWeek(context.venues, context.name), context.venues);
}

/**
 * Bound an agenda reply to what the village will actually store.
 *
 * Total in both directions, and neither is a repair. A wish with no text is
 * dropped; a wish with no tell is kept, because it is still what they wish for and
 * the renderer already has a shape for it. The result is always an agenda, even
 * an empty one — an agenda that could not be produced has to be distinguishable
 * from one that was, or the village would ask again for the rest of the
 * village's life.
 *
 * The Engine's weekly agenda takes precedence when it exists, because it is
 * keyed to this character's real weekdays. The model's overview is kept only
 * for a character without one; `source` records which overview was used.
 */
export function coerceAgenda(
  payload: Record<string, unknown>,
  context: VillageAgendaContext,
  at: string,
): VillageAgenda {
  const wishes = [...(context.activeWishes ?? [])];
  const fallback = workingAgendaWeek(context.venues, context.name);
  const rawWeek =
    payload.week && typeof payload.week === "object" && !Array.isArray(payload.week)
      ? Object.fromEntries(
          Object.entries(payload.week as Record<string, unknown>).map(([weekday, entries]) => [
            weekday,
            Array.isArray(entries)
              ? entries.map((entry) => {
                  if (!entry || typeof entry !== "object") return entry;
                  const row = entry as Record<string, unknown>;
                  return {
                    ...row,
                    venueId: typeof row.venue === "number" ? (context.venues[row.venue - 1]?.id ?? "") : "",
                  };
                })
              : entries,
          ]),
        )
      : {};
  return {
    wishes,
    routineSummary: boundText(payload.agenda ?? payload.routine, MAX_ROUTINE_SUMMARY_LENGTH),
    day: villageAgendaDay(payload.day, context.venues, context.name),
    week: completeAgendaWeek(rawWeek, fallback, context.venues),
    scheduleWeek: null,
    personalizationPending: !VILLAGE_WEEKDAYS.every(
      (weekday) => Array.isArray(rawWeek[weekday]) && rawWeek[weekday].length > 0,
    ),
    source: "village",
    generatedAt: at,
  };
}

/** Ask the model what one villager is after. The caller decides where the answer is kept. */
export async function proposeAgenda(
  context: VillageAgendaContext,
  options: { signal?: AbortSignal } = {},
): Promise<VillageAgenda> {
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const requestedMaxTokens = Math.min(model.maxOutputTokens ?? AGENDA_MAX_TOKENS, AGENDA_MAX_TOKENS);
  const fitted = model.fitContext(buildAgendaMessages(context), { maxTokens: requestedMaxTokens });
  const debugEnabled = !backgroundCalls.getStore() && villagesDebugAgentsEnabled();
  villagesLogger().debugOverride(debugEnabled, "[villages] agenda prompt: %s", JSON.stringify(fitted.messages));

  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
    temperature: AGENDA_TEMPERATURE,
    reasoningEffort: "low",
    debugMode: debugEnabled,
    signal: options.signal,
  });

  const payload = extractJsonObject(completion.content ?? "");
  const agenda = payload ? coerceAgenda(payload, context, new Date().toISOString()) : null;
  if (!agenda || (backgroundCalls.getStore() && !agenda.routineSummary))
    throw new Error(completionFailure("Village routine", completion, fitted.maxTokens ?? requestedMaxTokens));
  agenda.wishes = [...(context.activeWishes ?? [])];
  const proposedWeek: Record<string, unknown> = {};
  const failures: string[] = [];
  for (const weekday of VILLAGE_WEEKDAYS) {
    const requested = Math.min(model.maxOutputTokens ?? AGENDA_DAY_MAX_TOKENS, AGENDA_DAY_MAX_TOKENS);
    const dayFit = model.fitContext(buildAgendaDayMessages(context, weekday, agenda.routineSummary), {
      maxTokens: requested,
    });
    villagesLogger().debugOverride(
      debugEnabled,
      "[villages] %s agenda prompt: %s",
      weekday,
      JSON.stringify(dayFit.messages),
    );
    try {
      const dayCompletion = await completeWithRoom(model, dayFit.messages, dayFit.maxTokens ?? requested, {
        temperature: AGENDA_TEMPERATURE,
        reasoningEffort: "low",
        debugMode: debugEnabled,
        signal: options.signal,
      });
      const dayPayload = extractJsonObject(dayCompletion.content ?? "");
      const day = dayPayload && completeModelDay(dayPayload, context, weekday);
      if (!day) throw new Error(completionFailure(`${weekday} agenda`, dayCompletion, dayFit.maxTokens ?? requested));
      proposedWeek[weekday] = day[weekday];
    } catch (error) {
      requireBackgroundSuccess(error);
      failures.push(String(error));
      if (failures.length >= 2) break;
    }
  }
  agenda.week = completeAgendaWeek(proposedWeek, workingAgendaWeek(context.venues, context.name), context.venues);
  agenda.personalizationPending = VILLAGE_WEEKDAYS.some((weekday) => !proposedWeek[weekday]);
  agenda.personalizationFailure = failures[0] ?? "";
  return agenda;
}
