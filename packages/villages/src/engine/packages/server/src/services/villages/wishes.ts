// Villages — deciding whether the player actually did something for somebody.
//
// This is one question and it is deliberately not asked of the villager. A
// villager is a PARTY to the claim — they are the one who wished for the thing, they
// are the one who benefits, and a character written to be warm will say yes to
// almost anything to be kind. So the judgement is a separate call, with its own
// prompt, that never speaks as anybody and never appears in the conversation.
// The villager is told the answer afterwards and reacts to it in their own voice.
//
// The strictness is structural rather than aspirational, and it is worth being
// plain about why. A prompt that asks for strictness is strict until the first
// time the model returns something the code did not expect — and the failure
// that matters here is a YES, because a wish system where every claim succeeds
// has no content at all. So three things hold it up:
//
//   * the call is COLD, on the same reasoning as the closing summary: a warm
//     model asked to judge its friend's claim finds a reason to agree;
//   * the answer has to be deliberate and specific — `fulfilled` must be the
//     boolean `true`, and it must come with the id of a wish this villager
//     ACTUALLY HAS, so a yes is unavailable except by naming the thing that
//     makes it true;
//   * `coerceVerdict` defaults to no, in every case it does not understand,
//     including a reply that failed to parse at all.
//
// Nothing here writes anything. The caller decides what a yes means.
import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import type { VillagerCard } from "./catalog.js";
import { condense } from "./coerce.js";
import { villagesConnectionIdFor } from "./connections.js";
import {
  villagesDebugAgentsEnabled,
  villagesLanguageModels,
  villagesLogger,
  completeWithRoom,
} from "./package-runtime.js";
import {
  boundText,
  MAX_CHRONICLE_LENGTH,
  MAX_JUDGE_REASON_LENGTH,
  MAX_RESIDENT_SUMMARY_LENGTH,
} from "./prompt-preset.js";
import type { VillageChatMessage, VillageChronicleEntry, VillageWish, VillageWishVerdict } from "./types.js";
import { describeMoment, type VillageMoment } from "./village-clock.js";
import { extractJsonObject } from "./village-bootstrap.js";

/**
 * Answering a wish is a judgement, not a scene, so the reply is short and the
 * temperature is near zero.
 *
 * The number is the lowest in the package and it is not a stylistic choice. This
 * call is the one place where being interesting, generous or creative is a
 * defect — the correct answer is the same answer every time the same evidence is
 * put in front of it, and anything above this is the model's inventiveness
 * leaking into whether somebody's afternoon counted.
 */
// Room for a model that reasons before it answers — the thinking comes out of
// this budget, and a judge that never gets to its ruling is a judge that never
// rules. See `completeWithRoom`.
const JUDGE_MAX_TOKENS = 1_000;
const JUDGE_TEMPERATURE = 0.15;
class WishEvidenceError extends Error {}

/**
 * Everything the judgement is allowed to read.
 *
 * Assembled at the edge for the same reason every other prompt context is:
 * reading a card and resolving who the player is are async, and the prompt
 * builder is not.
 *
 * The transcript is handed over WHOLE rather than trimmed to the last few
 * lines, which is what the closing summary does too. A shorter window would be
 * the one thing that could make this unfair in a way the player cannot see: a
 * wish answered forty lines ago would fall out of the evidence and be judged as
 * not done, and the strictness of the prompt would have nothing to do with it.
 */
export type VillageWishClaimContext = {
  /** The village's name. */
  village: string;
  setting: string;
  moment: VillageMoment;
  card: VillagerCard;
  playerName: string;
  playerDescription: string;
  /** What this villager is currently after. The judge picks from these, by id. */
  wishes: readonly VillageWish[];
  /** What the player says they have done, in the player's own words. */
  claim: string;
  /** The live conversation, so a promise made inside it is visible AS a promise. */
  transcript: readonly VillageChatMessage[];
  /** Verified venue action receipts, separate from visual-only Events prose. */
  happenings: readonly { text: string }[];
  /** Current validated venue state, which outranks older descriptions. */
  worldState?: readonly string[];
  /** What this villager already remembers, so a settled thing is already known. */
  memory: readonly VillageChronicleEntry[];
};

function buildJudgeMessages(context: VillageWishClaimContext): CapabilityLanguageModelMessage[] {
  const { card } = context;
  const world = context.setting.trim();
  const player = context.playerName.trim() || "the player";
  const who = [
    card.description ? `Description:\n${condense(card.description, MAX_RESIDENT_SUMMARY_LENGTH)}` : "",
    card.personality ? `Personality:\n${condense(card.personality, MAX_RESIDENT_SUMMARY_LENGTH)}` : "",
  ]
    .filter((line) => line.length > 0)
    .join("\n");
  const said = context.transcript.map(
    (line, index) => `[L${index + 1}] ${line.role === "user" ? player : card.name}: ${line.content.trim()}`,
  );
  const lately = context.happenings.map((entry) => entry.text.trim()).filter((line) => line.length > 0);
  const worldState = (context.worldState ?? []).map((line) => line.trim()).filter(Boolean);
  const known = context.memory.map((entry) => entry.text.trim()).filter((line) => line.length > 0);

  const sections = [
    `You are the judge of one question in a small village story. ${player} says they did something for ${card.name}, who lives here. You decide whether it is true. You are not on anybody's side, you are not in the story, and you are not writing any part of it.`,
    [
      `The village is called ${context.village}.`,
      world.length > 0
        ? `The player describes it like this:\n"""\n${world}\n"""`
        : "Nobody has described it beyond its name.",
      `It is ${describeMoment(context.moment)}.`,
    ].join("\n"),
    [`Who ${card.name} is:`, who.length > 0 ? who : `${card.name} lives here.`].join("\n"),
    context.playerDescription.trim().length > 0
      ? `Who ${player} is:\n${condense(context.playerDescription, MAX_RESIDENT_SUMMARY_LENGTH)}`
      : `${player} lives here too.`,
    [
      `What ${card.name} wishes for at the moment. Copy an id EXACTLY from this list when you say yes:`,
      ...context.wishes.map(
        (wish) =>
          `- id: ${wish.id} | ${wish.wish}${wish.tell.length > 0 ? ` (it shows: ${wish.tell})` : ""} | intensity: ${wish.intensity}`,
      ),
    ].join("\n"),
    [
      `What ${player} says they have done, in their own words:`,
      `"""\n${context.claim}\n"""`,
      "That is a claim. It is not part of the record below and it is not evidence that anything happened.",
    ].join("\n"),
    said.length > 0
      ? [`Everything that has been SAID between them, in order:`, ...said.map((line) => `- ${line}`)].join("\n")
      : "Nothing has been said between them.",
    lately.length > 0
      ? ["Verified player actions in venue records:", ...lately.map((line) => `- ${line}`)].join("\n")
      : "",
    worldState.length > 0
      ? ["Current verified world state (outranks older memories):", ...worldState.map((line) => `- ${line}`)].join("\n")
      : "",
    known.length > 0 ? [`What ${card.name} already remembers:`, ...known.map((line) => `- ${line}`)].join("\n") : "",
    [
      "Answer with JSON only, in exactly this shape and nothing else:",
      '{"fulfilled":false,"wishId":"","reason":"...","memory":"","evidenceIds":["L1"]}',
      "For fulfillment, cite original L-numbered record lines supporting every condition. After evidence scanning, preserve embedded original L numbers. Claims, promises, and gratitude alone do not establish a physical deed.",
    ].join("\n"),
    [
      "Rules:",
      "- You are deciding one thing and nothing else: whether what the player describes has actually HAPPENED, and whether it satisfies one of the wishes listed above.",
      "- Saying a thing is not doing it. If the only place the deed appears is somebody saying they did it, then it did not happen, and the answer is no.",
      '- A promise, a plan, an intention or a feeling is not a deed. "I will sort that out", "I was going to", "I thought about it", "I do care about you" — none of those settles anything.',
      "- An ordinary kindness that was not about the wish does not satisfy it, and neither does something that only half does it. A wish is met or it is not met. There is no partial credit and no credit for trying.",
      '- If the record does not show it, the answer is no. An absence is a no. "Probably", "partly" and "maybe" are all no.',
      "- Being told about it is not the same as it being in the record. Only the conversation, verified player actions and what is remembered above can bear out a claim. Visual Events prose is not evidence.",
      "- Never answer yes because the player was kind, or because they clearly want it, or because agreeing is the pleasanter answer. A judgement that is easy to get is worth nothing to anybody, and it would make everything anyone does here meaningless.",
      `- "reason" is ONE sentence, under ${MAX_JUDGE_REASON_LENGTH} characters, written to nobody in particular: it is shown to the player to explain your decision, so it must name the specific thing you judged. When you say no, say plainly what is still missing.`,
      `- When — and only when — the answer is yes: set "wishId" to the exact id of the wish being satisfied, copied character for character from the list above, and write "memory" as ONE sentence in the past tense, under ${MAX_CHRONICLE_LENGTH} characters, in the way ${card.name} would remember it: what ${player} did, and that ${card.name} knows it.`,
      `- The memory is about ${card.name} and ${player}. Write their names. Never write "the player", and never write "we" or "you".`,
      '- When the answer is no, "wishId" is an empty string and "memory" is an empty string.',
      "- Do not invent anything that is not above. No new events, no new people, no new places, no details the record does not contain.",
      "- Plain prose only. No markdown, no commentary outside the JSON.",
    ].join("\n"),
  ].filter((section) => section.length > 0);

  return [
    { role: "system", content: sections.join("\n\n") },
    { role: "user", content: `Has ${player} really done that for ${card.name}?` },
  ];
}

/** What the judgement came to, and what the caller is allowed to do about it. */
export type VillageWishVerdictResult = {
  verdict: VillageWishVerdict;
  /** The wish the judge named. Null whenever `fulfilled` is false. */
  wish: VillageWish | null;
  /** The line to remember a fulfilled wish by. Empty unless `fulfilled`. */
  memory: string;
  interpretationStatus?: "unresolved";
  evidenceIds?: string[];
};

/** What a claim is answered with when it is fulfilled and no reason was written. */
const GENERIC_ACCEPTED = "That is something they had been wishing for.";
/** What a claim is answered with when it is refused and no reason was written. */
const GENERIC_REFUSED = "Nothing in what has happened here settles it.";

/**
 * Bound a judgement to what the village is allowed to believe.
 *
 * This function is the safety of the feature, and every line of it exists to
 * make a YES hard to reach by accident.
 *
 * `payload.fulfilled === true` rather than a truthy test, because `"true"`, `1`,
 * `"yes"` and `{}` are all things a model writes and none of them is an answer
 * this call is allowed to accept. A yes has to be said on purpose, in the one
 * shape that was asked for.
 *
 * A named wish is required, and it is looked up in the list of wishes THIS
 * villager actually has. That lookup is what makes the rest of the record safe:
 * the judge cannot satisfy a wish that does not exist, cannot satisfy a wish
 * belonging to somebody else, and cannot satisfy a wish that was already
 * answered and removed — because none of those ids are in the list it is
 * searched against. A model that hallucinates an id gets a no, not a crash and
 * not a success.
 *
 * A reason is not required, because the two gates above have already done the
 * work and a refusal a player cannot read is a refusal that looks like a bug.
 * The fallbacks are therefore the blandest true sentences available: the
 * specific ones are meant to come from the judge.
 */
export function coerceVerdict(
  payload: Record<string, unknown>,
  wishes: readonly VillageWish[],
): VillageWishVerdictResult {
  const named = typeof payload.wishId === "string" ? payload.wishId.trim() : "";
  const wish = named.length > 0 ? (wishes.find((entry) => entry.id === named) ?? null) : null;
  const fulfilled = payload.fulfilled === true && wish !== null;
  const reason = boundText(payload.reason, MAX_JUDGE_REASON_LENGTH);
  return {
    verdict: {
      fulfilled,
      reason: reason.length > 0 ? reason : fulfilled ? GENERIC_ACCEPTED : GENERIC_REFUSED,
    },
    wish: fulfilled ? wish : null,
    // Read only on a yes, and bounded even then: this text goes straight onto
    // the chronicle, so it is the one field of the reply that leaves this call
    // and lands in the record.
    memory: fulfilled ? boundText(payload.memory, MAX_CHRONICLE_LENGTH) : "",
    ...(Array.isArray(payload.evidenceIds)
      ? { evidenceIds: payload.evidenceIds.filter((id): id is string => typeof id === "string").slice(0, 100) }
      : {}),
    ...(typeof payload.fulfilled !== "boolean" || (payload.fulfilled === true && !wish)
      ? { interpretationStatus: "unresolved" as const }
      : {}),
  };
}

/** Full native fallback; known malformed evidence stays unresolved, interrupted requests propagate for explicit recovery. */
export async function proposeWishVerdict(
  context: VillageWishClaimContext,
  options: { signal?: AbortSignal } = {},
): Promise<VillageWishVerdictResult> {
  const model = await villagesLanguageModels().resolveForRequest({
    connectionId: await villagesConnectionIdFor("system"),
  });
  const requestedMaxTokens = Math.min(model.maxOutputTokens ?? JUDGE_MAX_TOKENS, JUDGE_MAX_TOKENS);
  const fits = (messages: CapabilityLanguageModelMessage[]) =>
    messages.reduce((size, item) => size + item.content.length, 0) <= 12_000 &&
    JSON.stringify(model.fitContext(messages, { maxTokens: requestedMaxTokens }).messages) === JSON.stringify(messages);
  const withFittingMemories = (input: VillageWishClaimContext): VillageWishClaimContext => {
    let memory = [...input.memory];
    while (memory.length && !fits(buildJudgeMessages({ ...input, memory }))) memory = memory.slice(0, -1);
    return { ...input, memory };
  };
  let judgeContext = withFittingMemories(context);
  if (!fits(buildJudgeMessages(judgeContext))) {
    // Scan every heard line in the fewest fitting batches, then judge from verified quotations.
    // A failed or saturated scan can only produce a refusal.
    const units = context.transcript.flatMap((line, index) => {
      const parts: { lineId: string; role: VillageChatMessage["role"]; content: string }[] = [];
      for (let offset = 0; offset < line.content.length; offset += 2_400)
        parts.push({ lineId: `L${index + 1}`, role: line.role, content: line.content.slice(offset, offset + 2_400) });
      return parts;
    });
    const quotes: { lineId: string; quote: string; role: VillageChatMessage["role"] }[] = [];
    const scanMessages = (start: number, end: number): CapabilityLanguageModelMessage[] => [
      {
        role: "system",
        content:
          'Find exact, short quotations from the complete supplied visit segment relevant to the claimed wish. Include both supporting and contradicting evidence. Do not infer deeds from claims. Return JSON only: {"evidence":[{"lineId":"L1","quote":"exact substring"}],"complete":true}. Set "more":true when the output cannot hold every relevant quote.',
      },
      {
        role: "user",
        content: JSON.stringify({
          claim: context.claim,
          wishes: context.wishes.map((wish) => ({ id: wish.id, wish: wish.wish })),
          lines: units.slice(start, end),
        }),
      },
    ];
    const scan = async (start: number, end: number): Promise<void> => {
      const completion = await completeWithRoom(model, scanMessages(start, end), requestedMaxTokens, {
        temperature: JUDGE_TEMPERATURE,
        debugMode: false,
        signal: options.signal,
        retryEmpty: false,
      });
      const payload = extractJsonObject(completion.content ?? "");
      if (completion.finishReason === "length" || payload?.more === true || payload?.complete !== true) {
        if (end - start < 2) throw new WishEvidenceError("Incomplete wish evidence scan.");
        const middle = start + Math.floor((end - start) / 2);
        await scan(start, middle);
        await scan(middle, end);
        return;
      }
      if (!Array.isArray(payload.evidence)) throw new WishEvidenceError("Unreadable wish evidence scan.");
      for (const item of payload.evidence) {
        const lineId = String((item as { lineId?: unknown }).lineId ?? "");
        const quote = String((item as { quote?: unknown }).quote ?? "");
        const source = units.slice(start, end).find((line) => line.lineId === lineId && line.content.includes(quote));
        if (!source || !quote || quote.length > 600) throw new WishEvidenceError("Unverified wish quotation.");
        if (!quotes.some((entry) => entry.lineId === lineId && entry.quote === quote))
          quotes.push({ lineId, quote, role: source.role });
      }
    };
    try {
      for (let cursor = 0; cursor < units.length;) {
        let end = cursor + 1;
        if (!fits(scanMessages(cursor, end))) throw new WishEvidenceError("Wish evidence does not fit the model.");
        while (end < units.length && fits(scanMessages(cursor, end + 1))) end += 1;
        await scan(cursor, end);
        cursor = end;
      }
      judgeContext = withFittingMemories({
        ...context,
        transcript: quotes.map((entry) => ({ role: entry.role, content: `[${entry.lineId}] ${entry.quote}`, at: "" })),
      });
    } catch (error) {
      if (!(error instanceof WishEvidenceError)) throw error;
      return {
        verdict: { fulfilled: false, reason: "The full Scene could not be checked for that wish. Try again later." },
        wish: null,
        memory: "",
        interpretationStatus: "unresolved",
      };
    }
  }
  const judgeMessages = buildJudgeMessages(judgeContext);
  if (!fits(judgeMessages))
    return {
      verdict: { fulfilled: false, reason: "The Scene evidence could not fit the wish check." },
      wish: null,
      memory: "",
      interpretationStatus: "unresolved",
    };
  const fitted = model.fitContext(judgeMessages, { maxTokens: requestedMaxTokens });
  const debugEnabled = villagesDebugAgentsEnabled();
  villagesLogger().debugOverride(
    debugEnabled,
    "[villages] %s wish-judging prompt for card %s: %s",
    model.model,
    context.card.id,
    JSON.stringify(fitted.messages),
  );

  const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? requestedMaxTokens, {
    temperature: JUDGE_TEMPERATURE,
    debugMode: debugEnabled,
    signal: options.signal,
    retryEmpty: false,
  });

  // Logged on the same switch as every other prompt, and logged even though the
  // answer is already in the tab: the ruling line is the only thing the player
  // sees, and this is what shows the prompt that produced it when a refusal
  // looks wrong.
  villagesLogger().debugOverride(
    debugEnabled,
    "[villages] %s judged a claim about %s: %s",
    model.model,
    context.card.name,
    (completion.content ?? "").trim(),
  );

  const payload = extractJsonObject(completion.content ?? "");
  if (!payload) {
    return {
      verdict: { fulfilled: false, reason: "That wish's meaning is still unclear; clarify what happened." },
      wish: null,
      memory: "",
      interpretationStatus: "unresolved",
    };
  }
  return coerceVerdict(payload, context.wishes);
}
