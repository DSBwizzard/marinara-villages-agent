import { clientImplementation } from "./client-source.js";
// Villages — proof for the translation of the Engine's weekly schedule into a
// village's own terms.
//
// This is the part of the package that can quietly put words in a villager's
// mouth that the village has no room for: the Engine writes a character's week
// from the card alone, before anything knows which village they live in, so a
// pilot's morning reads "in the cockpit of the Halcyon" in a village with no
// spaceship. Everything here is pure — a lookup table, a string comparison and a
// prompt — so the whole file runs without a host, and the interesting failures
// are all of the same shape: a lookup that finds nothing must hand back the
// VILLAGE's own default rather than the Engine's sentence, because a fallback is
// read by exactly the prompt a translation is read by.
//
// The shape being proved here is the one that made the translation a TIMETABLE
// rather than a glossary: an answer is keyed by the block it is about — `day|time`
// — and never by the sentence written in it. Everything below follows from that
// one choice, and the two assertions that matter most are the pair under "A
// timetable, not a dictionary": the same sentence in two slots gets two different
// answers, and one slot answered twice gets one.
//
// The host path is proved separately in `villages-village-chat.regression.ts`,
// where a real tick writes a real translation through the real route.
import assert from "node:assert/strict";

async function main() {
  const {
    buildRemapPrompt,
    coerceRemap,
    dayPlan,
    describeRemap,
    lookupRemap,
    lookupRemapVenue,
    MAX_REMAP_ATTEMPTS,
    MAX_REMAP_FAILURE_LENGTH,
    remapAnswerBudget,
    remapBlockKey,
    remapBlockKeys,
    remapBlocks,
    remapFailureText,
    remapNeedsWriting,
    remapSignature,
    REMAP_TOKENS_CEILING,
    REMAP_TOKENS_FLOOR,
    REMAP_TOKENS_PER_BLOCK,
    restOfWeek,
    routineKey,
    translateBlock,
    translateRoutine,
    VILLAGE_UNTRANSLATED_ACTIVITY,
  } = await import("../packages/villages/src/server/domain/rules/native-remap.js");
  const {
    coerceWish,
    describeStatus,
    MAX_REMAP_HERE_LENGTH,
    MAX_REMAP_SLOT_LENGTH,
    MAX_RESIDENT_WEEK_NOTES,
    MAX_ROUTINE_SUMMARY_LENGTH,
    MAX_VENUES,
    MAX_VILLAGER_WISHES,
    renderDoingBlock,
    remapVenues,
    wishLifetimeDays,
  } = await import("../packages/villages/src/server/domain/rules/prompt-preset.js");
  const { doingFor } = await import("../packages/villages/src/server/features/scenes/chat.js");
  const { renderResidentsBlock } =
    await import("../packages/villages/src/server/features/founding/village-bootstrap.js");
  const { coerceRemap: readStoredRemap } =
    await import("../packages/villages/src/server/features/world/village-store.js");

  const schedule = (days: Record<string, any[]>, weekStart = "2026-09-07") => ({
    characterId: "character-ives",
    weekStart,
    routineSummary: "Ives keeps the apiary and walks the ridge most days.",
    talkativeness: 60,
    days,
  });
  const venue = (id: string, name: string, form = "") => ({
    id,
    name,
    form,
    category: "public",
    presentation: { image: null, x: 0.5, y: 0.5 },
    occupancy: { playerHome: false, residentCharacterId: null as string | null, homeKind: null as string | null },
    capabilities: [],
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  });
  const cardSnapshot = (id: string, name: string) => ({
    id,
    revision: 1,
    sourceStatus: "available",
    name,
    capturedAt: "2026-09-18T00:00:00.000Z",
  });

  /** The moment every fixture in this file is written from, unless it says otherwise. */
  const BORN = "2026-09-07T09:00:00.000Z";
  /**
   * A wish as the package itself would have written it, dates and all, so that no
   * fixture down here carries a deadline the roll could never have produced. A wish
   * is written by the village rather than by a test, and the two dates are the one
   * part of it a hand-written fixture gets wrong by default.
   */
  const wishOf = (id: string, text: string, intensity = 2, tell = "", at: string = BORN) => {
    const wish = coerceWish({ wish: text, intensity, tell }, id, at);
    assert.ok(wish, `the fixture wish ${id} has words in it`);
    return wish;
  };

  // ── The week as a list of SLOTS ───────────────────────────────────────────
  // One entry per block the Engine wrote, in the Engine's own order, carrying the
  // day it was filed under. Nothing is grouped and nothing is summed — the version
  // before this one collapsed the week into one entry per distinct sentence and
  // totalled the hours behind each, which is why five separate "asleep" blocks came
  // back to the player as a single line reading "50h a week" that could not be held
  // against their card.
  //
  // The same phrase on two days is now TWO entries, which is the whole point: a
  // sentence is not a place in a week. "checking the hives" on Monday morning and
  // "checking the hives" all day Tuesday are two different things happening at two
  // different times, and keyed by sentence the second could never be told from the
  // first.
  const week = schedule({
    Monday: [
      { time: "05:00-08:00", activity: "checking the hives", status: "dnd" },
      { time: "22:00-06:00", activity: "asleep", status: "offline" },
    ],
    Tuesday: [{ time: "00:00-23:59", activity: "checking the hives", status: "idle" }],
    Wednesday: [{ time: "whenever", activity: "mending the fence", status: "" }],
  });
  const blocks = remapBlocks(week);
  assert.deepEqual(
    blocks.map((entry) => [entry.day, entry.time, entry.activity, entry.status]),
    [
      ["Monday", "05:00-08:00", "checking the hives", "dnd"],
      ["Monday", "22:00-06:00", "asleep", "offline"],
      ["Tuesday", "00:00-23:59", "checking the hives", "idle"],
      ["Wednesday", "whenever", "mending the fence", ""],
    ],
    "one entry per block, in weekday order, with the Engine's own day, hour range, sentence and status untouched",
  );
  assert.equal(
    blocks.filter((entry) => entry.activity === "checking the hives").length,
    2,
    "and a sentence written on two days is two entries, because a slot is what is being translated",
  );
  assert.deepEqual(remapBlocks(schedule({})), [], "a week with no blocks is an empty question rather than an error");

  // The key, and the ONE tolerance in it. Both halves are copied out of the prompt
  // by a model, and a model asked to copy a string exactly will still tidy the
  // spacing around a hyphen — "18:00-20:00" comes back as "18:00 - 20:00" often
  // enough to matter. No hour range means anything different for having a space in
  // it, so the space is noise and is dropped. The day is a word, so its internal
  // spacing DOES mean something and only the ends are trimmed.
  assert.equal(remapBlockKey("Monday", "05:00-08:00"), "monday|05:00-08:00");
  assert.equal(
    remapBlockKey("  Monday  ", " 05:00 - 08:00 "),
    remapBlockKey("Monday", "05:00-08:00"),
    "case, surrounding space and space inside the hour range are all flattened",
  );
  assert.equal(
    remapBlockKey("Mon day", "05:00-08:00"),
    "mon day|05:00-08:00",
    "while a day that really has two words keeps both",
  );
  assert.notEqual(
    remapBlockKey("Monday", "05:00-08:00"),
    remapBlockKey("Monday", "06:00-08:00"),
    "and a different hour is a different slot, never a fuzzy match to the nearest one",
  );

  // The keys the prompt asks about are the keys the answer has to come back with.
  // Derived from one list rather than two, so "what was sent" and "what must come
  // back" cannot drift apart.
  const keys = remapBlockKeys(blocks);
  assert.deepEqual(keys, ["monday|05:00-08:00", "monday|22:00-06:00", "tuesday|00:00-23:59", "wednesday|whenever"]);
  assert.equal(remapBlockKeys([]).length, 0, "a week with nothing in it asks about nothing");

  // ── Bounding the answer ────────────────────────────────────────────────────
  // A move is resolved against the blocks the prompt ACTUALLY SENT, and that is the
  // whole of the round trip's integrity. A model asked to copy a day and an hour
  // range back will occasionally tidy them, invent one, or answer about a Tuesday
  // that is not there — and resolving through the sent list means all three land
  // the same way: the slot is looked up by its normalised key, a key that was not
  // asked about is a miss, and a key that WAS asked about yields the ENGINE'S own
  // day, hour range and sentence rather than the model's copy of them. So the
  // stored record can never carry a slot the week does not have, and the sentence
  // printed beside the village's phrase is always the one the Engine wrote.
  const context = {
    village: "Willowbrook",
    setting: "A small farming village on a river.",
    lore: [],
    completedWishes: [],
    loreKey: "",
    venues: [venue("mill", "the mill", "where the grain goes"), venue("hives", "the hives")],
    // Two wishes, in the order that gives the numbering something to prove: the
    // LIGHTEST one is first, so a number that resolves to it can only have been
    // counted down the agenda's own list rather than down the weight order the
    // villager's own block is written in. The second carries a tell and the first
    // does not, because a wish with a surface and a wish without one are two
    // different lines of the numbered list.
    //
    // Both are dated, from two different moments, so that the digest's indifference
    // to a wish's dates is asserted against real values rather than against blanks
    // that would agree with anything.
    wishes: [
      wishOf("wish-cart", "the handcart mended", 1, "", "2026-09-06T21:00:00.000Z"),
      wishOf("wish-roof", "a roof that does not leak", 3, "the bucket under the gap"),
    ],
    name: "Ives",
    summary: "An apiarist with a ledger.",
    tags: ["beekeeper"],
    description: "Ives keeps bees and is slow to trust.",
    weekStart: "2026-09-07",
    blocks,
  };
  const bound = coerceRemap(
    {
      routine: `  ${"x".repeat(MAX_ROUTINE_SUMMARY_LENGTH + 50)}  `,
      moves: [
        { day: "Monday", time: "05:00-08:00", here: "  out at the hives  ", place: 2, wish: 1 },
        { day: "Monday", time: "05:00-08:00", here: "a second answer for the same slot and nobody to read it" },
        { day: "Monday", time: "05:00 - 08:00", here: "the same slot in other clothes" },
        { day: "Monday", time: "22:00-06:00", here: "   " },
        { day: "", time: "05:00-08:00", here: "no day to key on" },
        { day: "Tuesday", time: "12:00-13:00", here: "an hour of a day the week does not have" },
        // The Engine wrote this slot as "00:00-23:59" and the model tidied it. It
        // still resolves, and what is STORED is the Engine's spelling. It carries a
        // wish and no place, because the two numbers are read off their own lists.
        { day: "tuesday", time: "00:00 - 23:59", here: "out at the wall all day", place: 0, wish: 2 },
        { day: "Wednesday", time: "whenever", here: "out at the fence line", place: " 1 ", wish: " 1 " },
      ],
    },
    context,
    "2026-09-07T09:00:00.000Z",
  );
  assert.deepEqual(
    bound.moves,
    [
      {
        day: "Monday",
        time: "05:00-08:00",
        activity: "checking the hives",
        here: "out at the hives",
        venueId: "hives",
        wishId: "",
      },
      {
        day: "Tuesday",
        time: "00:00-23:59",
        activity: "checking the hives",
        here: "out at the wall all day",
        venueId: "",
        wishId: "",
      },
      {
        day: "Wednesday",
        time: "whenever",
        activity: "mending the fence",
        here: "out at the fence line",
        venueId: "mill",
        wishId: "",
      },
    ],
    "a slot the prompt never asked about is dropped, a duplicate slot keeps the first, and the day, hour and sentence stored are the Engine's rather than the model's copy; legacy wish tags are ignored",
  );
  assert.equal(bound.weekStart, "2026-09-07", "the week comes from the village's own bookkeeping");
  assert.equal(bound.routine.length, MAX_ROUTINE_SUMMARY_LENGTH, "the routine line is bounded");
  assert.equal(bound.generatedAt, "2026-09-07T09:00:00.000Z");
  assert.equal(bound.attempts, 1, "and how many times the village has asked about that one question");

  // One move answered at length is cut, not dropped: what the village says about a
  // single block is bounded the same way everything else off a model is.
  const longMove = coerceRemap(
    { moves: [{ day: "Monday", time: "05:00-08:00", here: "y".repeat(MAX_REMAP_HERE_LENGTH + 40) }] },
    context,
    "2026-09-07T09:00:00.000Z",
  );
  assert.equal(longMove.moves[0].here.length, MAX_REMAP_HERE_LENGTH, "one move said too long is cut to size");
  // And a slot named at length cannot become a key: the day and the hour range are
  // what a key is built out of, so the cheapest place to stop a paragraph being
  // treated as a timestamp is before the key is built.
  assert.equal(
    coerceRemap(
      { moves: [{ day: "Monday", time: "t".repeat(MAX_REMAP_SLOT_LENGTH + 40), here: "out" }] },
      context,
      "now",
    ).moves.length,
    0,
    "a slot longer than the cap is not a slot, so its move is dropped rather than keyed on a paragraph",
  );

  // A payload whose key is not even a Monday cannot move the cache key.
  assert.equal(
    coerceRemap({ moves: [] }, context, "now").weekStart,
    "2026-09-07",
    "the model is never asked for the one field the cache is invalidated by",
  );
  // Total in the other direction too: junk is an empty translation, not a throw.
  assert.deepEqual(coerceRemap({ moves: "nope" }, context, "now").moves, []);
  assert.deepEqual(coerceRemap({ moves: [null, 7, "later"] }, context, "now").moves, []);
  assert.equal(
    coerceRemap(
      { moves: Array.from({ length: 40 }, () => ({ day: "Monday", time: "05:00-08:00", here: "out at the hives" })) },
      context,
      "now",
    ).moves.length,
    1,
    "and forty answers about one slot are one entry, never a refusal",
  );

  // ── Where a move happens ───────────────────────────────────────────────────
  // The place is the one field of a translation a model is asked to answer with as
  // a NUMBER, because it is the one field a person writing out their week would
  // never produce. Everything below is about the two ways that can go wrong: a
  // number that means nothing, and a number that means something the week is no
  // longer allowed to point at.
  //
  // An unresolvable place is an ordinary answer and never an error. Somebody
  // asleep, somebody walking, somebody doing something this village has no room for
  // — all of them answer 0, and 0 resolves to nothing, which draws exactly what
  // every other nothing draws.
  const place = (value: unknown) =>
    coerceRemap(
      { moves: [{ day: "Monday", time: "05:00-08:00", here: "out at the hives", place: value }] },
      context,
      "now",
    ).moves[0].venueId;
  assert.equal(place(1), "mill", "1 is the first place on the numbered list the prompt writes out");
  assert.equal(place(2), "hives", "and the numbering runs down that list and not the village's own order");
  assert.equal(place("2"), "hives", "a number quoted as a string is the number, since JSON is not always typed");
  assert.equal(place(0), "", "0 is the model saying the list has nothing for this move, which is an answer");
  assert.equal(place(3), "", "and a number past the end resolves against nothing rather than wrapping");
  assert.equal(place(-1), "");
  assert.equal(place(1.5), "", "a fraction was never on the list, so there is no nearest entry to guess at");
  assert.equal(place("the hives"), "", "the name is refused: the village answers with a number or not at all");
  assert.equal(place(null), "");
  assert.equal(place([2]), "", "and a list of one is still not a number");
  assert.equal(place(undefined), "", "a move that left the field out is a move with no place, not a crash");

  // The cap on the list is the cap on the numbering, and the two are the same
  // number: the prompt stops naming places at `MAX_VENUES`, so a number past it was
  // answered against a list the village never showed anyone.
  const longList = {
    ...context,
    venues: Array.from({ length: MAX_VENUES + 5 }, (_unused, index) =>
      venue(`place-${index + 1}`, `place ${index + 1}`),
    ),
  };
  const capped = coerceRemap(
    { moves: [{ day: "Monday", time: "05:00-08:00", here: "out", place: MAX_VENUES + 1 }] },
    longList,
    "now",
  );
  assert.equal(capped.moves[0].venueId, "", "a number past the cap is the same read as out of range");
  const lastNamed = coerceRemap(
    { moves: [{ day: "Monday", time: "05:00-08:00", here: "out", place: MAX_VENUES }] },
    longList,
    "now",
  );
  assert.equal(lastNamed.moves[0].venueId, `place-${MAX_VENUES}`, "while the last place actually named still resolves");

  // ── Wishes influence the translation without owning an hour ───────────────
  // Old model replies may still include a numbered `wish` field. It is ignored
  // regardless of value; a place is still resolved from its own numbered list.
  const wish = (value: unknown) =>
    coerceRemap(
      { moves: [{ day: "Monday", time: "05:00-08:00", here: "out at the hives", wish: value }] },
      context,
      "now",
    ).moves[0].wishId;
  assert.equal(wish(1), "", "a legacy wish number cannot tag an agenda hour");
  assert.equal(wish(2), "");
  assert.equal(wish("2"), "", "a quoted legacy wish number is ignored too");
  assert.equal(wish(0), "");
  assert.equal(wish(3), "", "and a number past the end resolves against nothing rather than wrapping");
  assert.equal(wish(-1), "");
  assert.equal(wish(1.5), "", "a fraction was never on the list");
  assert.equal(wish("the roof"), "");
  assert.equal(wish(null), "");
  assert.equal(wish([2]), "", "and a list of one is still not a number");
  assert.equal(wish(undefined), "");
  assert.deepEqual(
    coerceRemap(
      {
        moves: [
          { day: "Monday", time: "05:00-08:00", here: "out at the hives", place: 2, wish: 1 },
          { day: "Tuesday", time: "00:00-23:59", here: "out on the wall", place: 0, wish: 2 },
        ],
      },
      context,
      "now",
    ).moves.map((move) => [move.venueId, move.wishId]),
    [
      ["hives", ""],
      ["", ""],
    ],
    "legacy wish tags are discarded without changing the venue",
  );

  // Even a legacy tag inside or outside the wish-list cap is discarded.
  const manyWishes = {
    ...context,
    wishes: Array.from({ length: MAX_VILLAGER_WISHES + 3 }, (_unused, index) =>
      wishOf(`wish-${index + 1}`, `something number ${index + 1}`),
    ),
  };
  const beyondWishes = coerceRemap(
    { moves: [{ day: "Monday", time: "05:00-08:00", here: "out", wish: MAX_VILLAGER_WISHES + 1 }] },
    manyWishes,
    "now",
  );
  assert.equal(beyondWishes.moves[0].wishId, "");
  const lastWish = coerceRemap(
    { moves: [{ day: "Monday", time: "05:00-08:00", here: "out", wish: MAX_VILLAGER_WISHES }] },
    manyWishes,
    "now",
  );
  assert.equal(lastWish.moves[0].wishId, "");

  // ── The lookup, and what a miss costs ──────────────────────────────────────
  // A miss is not an error, and what it costs is the village's own default rather
  // than the Engine's sentence. That is the whole correction: the fallback is read
  // by the prompt a translation is read by, so "the Engine's own words" were never
  // a safe thing to degrade to — they were the leak arriving through the one path
  // with no test on it. A miss now says something short and true of nearly anybody,
  // which is what a villager who was never translated at all has been saying all
  // along.
  const mondayMorning = remapBlockKey("Monday", "05:00-08:00");
  assert.equal(lookupRemap(bound, mondayMorning), "out at the hives");
  assert.equal(
    lookupRemap(bound, remapBlockKey("  Monday ", " 05:00 - 08:00 ")),
    "out at the hives",
    "read through the same normalisation the key was written with",
  );
  assert.equal(
    lookupRemap(bound, remapBlockKey("Monday", "22:00-06:00")),
    "",
    "the slot the answer left out is a miss, which is what a per-slot lookup buys",
  );
  assert.equal(
    lookupRemap(bound, remapBlockKey("Tuesday", "05:00-08:00")),
    "",
    "and so is the same hour on a day nobody answered about, because the day is half the key",
  );
  assert.equal(
    translateBlock(bound, "asleep"),
    VILLAGE_UNTRANSLATED_ACTIVITY,
    "a key that is not a key is the default",
  );
  assert.equal(translateBlock(bound, ""), "at home", "and so is no key at all, which is an hour outside every block");
  assert.equal(VILLAGE_UNTRANSLATED_ACTIVITY, "at home", "which reads as one of the village's own places");
  assert.equal(
    translateBlock(null, "piloting the Halcyon"),
    "at home",
    "no translation at all is the same answer, and never the Engine's noun",
  );

  // The key the callers actually have in hand, built in one place rather than by
  // each of them. A villager between two blocks has no key, and "" matches nothing,
  // so their hour reads as the village's default — which is the right sentence for
  // somebody the Engine has placed outside every block.
  const ivesRoutine = {
    routineSummary: "",
    activity: "checking the hives",
    status: "dnd",
    talkativeness: 60,
    weekStart: "2026-09-07",
    weekday: "Monday",
    block: { time: "05:00-08:00", activity: "checking the hives", status: "dnd" },
    blocks: week.days.Monday,
  };
  assert.equal(routineKey(ivesRoutine as any), mondayMorning, "the key comes off the block the Engine returned");
  assert.equal(routineKey({ ...ivesRoutine, block: null } as any), "", "an hour between blocks has no key");
  assert.equal(routineKey(null), "", "no routine is no key, not a throw");

  // The place is read through the same match as the sentence, so the two can never
  // come from different entries of the week — a portrait of the wrong building
  // beside the right sentence is worse than no portrait at all.
  assert.equal(lookupRemapVenue(bound, mondayMorning), "hives");
  assert.equal(
    lookupRemapVenue(bound, remapBlockKey(" Monday ", "05:00 - 08:00")),
    "hives",
    "read through the same normalisation",
  );
  assert.equal(
    lookupRemapVenue(bound, remapBlockKey("Monday", "22:00-06:00")),
    "",
    "and missed by the same comparison",
  );
  assert.equal(
    lookupRemapVenue(bound, remapBlockKey("Tuesday", "00:00-23:59")),
    "",
    "a move with no place answers with none",
  );
  assert.equal(lookupRemapVenue(null, mondayMorning), "", "no translation is no place, not a throw");
  assert.equal(lookupRemapVenue({ ...bound, moves: [] }, mondayMorning), "");
  assert.equal(lookupRemapVenue(bound, ""), "", "and nothing can be looked up under no key");
  assert.equal(
    translateRoutine(null, "the Engine's own sentence"),
    "the Engine's own sentence",
    "the caller decides what may stand in for a line the village has not written",
  );
  assert.equal(
    translateRoutine({ ...bound, routine: "Out at the hives at dawn, and asleep by dark." }, "the Engine's own"),
    "Out at the hives at dawn, and asleep by dark.",
    "and the village's own line wins when it has one",
  );
  assert.equal(
    translateRoutine(null, ""),
    "",
    "while the villager's prompt passes nothing in at all, because the only sentence it has to offer is the Engine's",
  );

  // ── When the village owes a new translation ────────────────────────────────
  // What supersedes a translation is the QUESTION, not the calendar. Comparing
  // week-start dates was the bug: a player who edits a character's schedule in the
  // middle of a week is asking a different question, and the old answer stood for
  // the rest of the week with the prompt reading it. A signature is the digest of
  // everything a translation is an answer to — the week's start, the lens it was
  // written through, and the exact slots, sentences and statuses it was asked about
  // — so "is this still the answer to the question I am asking" is a string
  // comparison rather than a guess.
  const signature = remapSignature(context);
  assert.equal(bound.signature, signature, "a stored translation carries the digest of the question it answered");
  const withBlock = (block: Record<string, string>) => ({
    ...context,
    blocks: [{ ...blocks[0]!, ...block }, ...blocks.slice(1)],
  });
  assert.notEqual(
    remapSignature({
      ...context,
      blocks: [...blocks, { day: "Thursday", time: "09:00-10:00", activity: "surveying the saltmarsh", status: "" }],
    }),
    signature,
    "a block added to the week is a different question",
  );
  assert.equal(
    remapSignature(withBlock({ activity: "CHECKING   the hives" })),
    signature,
    "an Engine week re-read with the same sentence re-capitalised is NOT, because the digest is taken over the flattened phrase",
  );
  assert.notEqual(
    remapSignature(withBlock({ activity: "inspecting the hives" })),
    signature,
    "while a sentence that really changed is a different question, since the words for that block change with it",
  );
  assert.notEqual(
    remapSignature({ ...context, blocks: [{ ...blocks[0]!, status: "online" }, ...blocks.slice(1)] }),
    signature,
    "and so is the same block at a different availability",
  );
  assert.notEqual(
    remapSignature(withBlock({ time: "05:00-09:00" })),
    signature,
    "and the same sentence in a different SLOT, which is the whole shape of the key",
  );
  assert.notEqual(
    remapSignature({ ...context, setting: "A small farming village on a river, with a forge." }),
    signature,
    "so is a village that has described itself again",
  );
  assert.notEqual(
    remapSignature({ ...context, venues: [...context.venues, venue("forge", "the forge")] }),
    signature,
    "and so is one that has gained a place, because the numbered list is what a move points at",
  );

  // ── Which places are in the question at all ────────────────────────────────
  // A village holds ONE list of places, and only some of them are somewhere a
  // villager can be SENT. The rest are houses, and a house is where you are when
  // nobody sent you anywhere — so it is not an answer to "where are you" and the
  // question does not contain it. Nobody is ever sent home by a model; being at
  // home is what a move that resolves to nothing already means.
  //
  // Two things follow, and both are load-bearing. The numbered list the model
  // answers with a number about is the shorter one, so the numbers stay small and
  // a house can never be answered into. And the digest is taken over the shorter
  // one too, so adding a house — or moving one, or giving it a building — does not
  // re-ask every villager in the village, which is what would otherwise make
  // marking a spot on the map cost a model call per resident.
  const house = {
    ...venue("bram-house", ""),
    presentation: { image: null, x: 0.2, y: 0.3 },
    occupancy: {
      playerHome: false,
      residentCharacterId: "character-bram" as string | null,
      homeKind: "small-home" as string | null,
    },
  };
  const houses = [
    house,
    { ...house, id: "empty-house", occupancy: { ...house.occupancy, residentCharacterId: null } },
    { ...house, id: "player-house", occupancy: { playerHome: true, residentCharacterId: null, homeKind: null } },
  ];
  assert.deepEqual(
    remapVenues([...context.venues, ...houses]).map((place) => place.id),
    ["mill", "hives"],
    "the places a villager can be sent to are the ones that do not say they are a house — a roof with somebody " +
      "under it, a roof given to nobody yet, and the roof the player sleeps under all say so",
  );
  assert.equal(
    remapSignature({ ...context, venues: [...context.venues, ...houses] }),
    signature,
    "a house added to the village is not a new question, because the houses are not in the question at all",
  );
  const moving = (patch: Record<string, unknown>) => ({
    ...context,
    venues: [{ ...context.venues[0]!, ...patch }, context.venues[1]!],
  });
  assert.equal(
    remapSignature(moving({ presentation: { image: null, x: 0.31, y: 0.62 } })),
    signature,
    "where a place stands on the picture is not part of the question either: nobody reading a translation can " +
      "see the map, and the answer is read as a sentence",
  );
  assert.notEqual(
    remapSignature(moving({ occupancy: { ...context.venues[0]!.occupancy, homeKind: "small-home" } })),
    signature,
    "and a place given a building does re-ask, but not because the digest reads the field — it re-asks because " +
      "a building is how a place says it is a house, so the place has just left the question and the numbered " +
      "list underneath every move in the week has shifted",
  );
  assert.equal(
    remapSignature({
      ...context,
      venues: [...context.venues, { ...house, occupancy: { ...house.occupancy, homeKind: null } }],
    }),
    signature,
    "which is the same reason the kind of building a house is drawn as is not digested in its own right: a house " +
      "stays a house whether the building on it is recorded or blank, because somebody lives in it, and nothing " +
      "the model was ever shown has changed either way",
  );
  assert.notEqual(
    remapSignature(moving({ name: "the watermill" })),
    signature,
    "but a place RENAMED is a different question, because the sentence in front of the villager changes with it",
  );
  assert.notEqual(
    remapSignature(moving({ form: "a stone watermill beside the river" })),
    signature,
    "and so is one whose physical Form changes, since Form is read out beside the name",
  );
  assert.equal(remapSignature({ ...context, weekStart: "" }), "", "no week at all is no question to answer");

  // ── Which wishes are in the question at all ─────────────────────────────────
  // A villager's wishes are the one part of a PERSON — rather than of the village —
  // that a translation is an answer to, and this is what that costs. A wish entering
  // the list, being reworded, being re-weighted or re-surfaced all re-ask, and the
  // price of one is one model call for that villager alone: the translation is kept
  // per villager, so a wish that moves does not re-ask the village.
  //
  // The id is digested beside the words and the weight because the id is what the
  // moves point at. A wish reworded under the same id leaves every stored tag
  // meaning something; a different wish wearing an old id is not a wish that came
  // back, and the digest is what tells those two apart.
  for (const wishes of [
    [],
    [...context.wishes].reverse(),
    manyWishes.wishes,
    [{ ...context.wishes[0]!, wish: "Different wish", intensity: 3, tell: "Different tell" }],
  ]) {
    assert.equal(remapSignature({ ...context, wishes }), signature, "wish changes do not invalidate a stable routine");
  }
  // A wish's dates are the two fields of it that this deliberately ignores, and the
  // reason is the same as the reason the map and the houses are ignored: neither
  // reaches the prompt. A villager handed a translator is told what they wish for,
  // how much it is on their mind and what gives it away — never how long they have
  // wanted it — so a wish that merely got older is not a question anybody answered
  // differently, and asking again would be a model call spent on a calendar.
  assert.equal(
    remapSignature({
      ...context,
      wishes: [
        { ...context.wishes[0]!, addedAt: "2026-01-01T00:00:00.000Z", expiresAt: "2026-01-04T00:00:00.000Z" },
        { ...context.wishes[1]!, addedAt: "", expiresAt: "" },
      ],
    }),
    signature,
    "so a wish that aged, and one whose dates were hand-edited away, ask the same question as before",
  );

  assert.equal(
    remapNeedsWriting(null, signature, keys),
    true,
    "a week with nothing said about it is owed a translation",
  );
  // `bound` answered three of this week's four slots — its move for the sleeping
  // block was dropped for saying nothing — so it is a record that is still owed an
  // answer, which is precisely what a second ask exists for.
  const answered = coerceRemap(
    {
      routine: "Out at the hives at dawn, and asleep by dark.",
      moves: blocks.map((block) => ({ day: block.day, time: block.time, here: `out at ${block.time}` })),
    },
    context,
    "now",
  );
  assert.equal(answered.moves.length, keys.length, "every block in the week came back answered");
  assert.equal(answered.signature, signature, "about the same question");
  assert.equal(remapNeedsWriting(answered, "a different question", keys), true, "a different question is owed one");
  assert.equal(remapNeedsWriting(answered, signature, keys), false, "the same question is answered already");
  assert.equal(
    remapNeedsWriting(bound, signature, keys),
    true,
    "a slot the answer left out is a question still owed an answer",
  );
  assert.equal(
    remapNeedsWriting({ ...answered, attempts: MAX_REMAP_ATTEMPTS }, signature, [...keys, "thursday|09:00-10:00"]),
    false,
    "and it stops being owed once the village has asked its limit, so an unfinished answer stands rather than costing a call every tick",
  );
  assert.equal(
    remapNeedsWriting({ ...answered, attempts: MAX_REMAP_ATTEMPTS - 1 }, signature, [...keys, "thursday|09:00-10:00"]),
    true,
    "with the limit being the count of asks, so the ask before it still happens",
  );
  assert.equal(
    remapNeedsWriting(answered, "", keys),
    false,
    "no week at all is nothing to translate, not a translation owed",
  );
  assert.equal(remapNeedsWriting(null, "", keys), false);

  // The count is carried on the record, because it has to survive a restart: a
  // village that forgot how many times it had asked would ask forever. It is
  // clamped on the way in rather than trusted, since it is one revision away from
  // being whatever a stored file happened to say.
  assert.equal(
    readStoredRemap({ weekStart: "2026-09-07", signature: "a", attempts: 99, moves: [], routine: "" }).attempts,
    MAX_REMAP_ATTEMPTS,
    "a record claiming more asks than there are is clamped, not trusted",
  );
  assert.equal(
    readStoredRemap({ weekStart: "2026-09-07", signature: "a", attempts: -4, moves: [] }).attempts,
    0,
    "and one claiming a negative is read as never asked",
  );
  const legacy = readStoredRemap({ weekStart: "2026-09-07", moves: [] });
  assert.equal(legacy.attempts, 0, "a translation stored before any of this existed reads as owing an answer");
  assert.equal(legacy.signature, "", "and as having answered no question in particular");

  // The record read back off disk goes through the SAME key rule the writer wrote
  // with. A stored entry from the old scheme — keyed by sentence, so carrying no
  // day and no hour range — is dropped, the record reads as incomplete, and the
  // village asks once more. That is the intended one-time cost of the shape change,
  // and it is paid rather than half-paid: an entry that happened to survive would
  // render as a real hour while the rest of the week silently read as the village's
  // default.
  const roundTrip = readStoredRemap({
    weekStart: "2026-09-07",
    signature: "a",
    attempts: 1,
    moves: [
      {
        day: "Monday",
        time: "05:00-08:00",
        activity: "checking the hives",
        here: "out at the hives",
        venueId: "hives",
        wishId: "wish-roof",
      },
      { activity: "checking the hives", here: "out at the hives" },
    ],
  });
  assert.deepEqual(
    roundTrip.moves,
    [
      {
        day: "Monday",
        time: "05:00-08:00",
        activity: "checking the hives",
        here: "out at the hives",
        venueId: "hives",
        wishId: "wish-roof",
      },
    ],
    "a stored slot survives the round trip and an entry with no slot is dropped",
  );
  assert.equal(roundTrip.moves[0]!.wishId, "wish-roof", "legacy wish tags remain readable in stored records");
  assert.deepEqual(
    dayPlan("Monday", week.days.Monday!, roundTrip, { hour: 6, minute: 0 }).map((block) => block.wishId),
    ["", ""],
    "but the public agenda never exposes a legacy tag",
  );
  assert.equal(lookupRemap(roundTrip, remapBlockKey(" Monday ", "05:00 - 08:00")), "out at the hives");

  // ── A timetable, not a dictionary ─────────────────────────────────────────
  // The assertion the whole release exists for. Two slots carrying the SAME
  // sentence are two answers, and one slot answered twice is one entry — which is
  // exactly inverted from the scheme this replaced, where the sentence was the key
  // and an hour could not be told from its twin two hours later.
  //
  // Nothing here touches the network or the clock: `dayPlan` is a join of a list of
  // blocks onto a lookup table, and the hour it is asked about is passed in.
  const twinWeek = schedule({
    Monday: [
      { time: "05:00-08:00", activity: "checking the hives", status: "dnd" },
      { time: "08:00-22:00", activity: "checking the hives", status: "idle" },
      { time: "22:00-06:00", activity: "asleep", status: "offline" },
    ],
  });
  const twinContext = { ...context, blocks: remapBlocks(twinWeek) };
  const twin = coerceRemap(
    {
      moves: [
        { day: "Monday", time: "05:00-08:00", here: "out at the hives first thing", place: 2 },
        { day: "Monday", time: "08:00-22:00", here: "working the hives through the day", place: 2 },
        { day: "Monday", time: "22:00-06:00", here: "asleep in the loft", place: 0 },
      ],
    },
    twinContext,
    "now",
  );
  assert.equal(twin.moves.length, 3, "three blocks of one day are three entries even when two share a sentence");
  assert.notEqual(
    twin.moves[0]!.here,
    twin.moves[1]!.here,
    "so the same sentence at two hours of the day carries two different phrases",
  );
  const twinPlan = dayPlan("Monday", twinWeek.days.Monday!, twin, { hour: 6, minute: 0 });
  assert.deepEqual(
    twinPlan.map((block) => [block.time, block.activity, block.here, block.translated, block.current]),
    [
      ["05:00-08:00", "checking the hives", "out at the hives first thing", true, true],
      ["08:00-22:00", "checking the hives", "working the hives through the day", true, false],
      ["22:00-06:00", "asleep", "asleep in the loft", true, false],
    ],
    "and each hour is drawn with the phrase written FOR THAT hour, with the Engine's sentence riding beside it",
  );
  // A slot answered twice keeps the first, which is the other half of the same
  // claim: the table is keyed by the slot and by nothing else.
  assert.equal(
    coerceRemap(
      {
        moves: [
          { day: "Monday", time: "05:00-08:00", here: "the first word on the hour" },
          { day: "Monday", time: "05:00 - 08:00", here: "and a second, which nobody will read" },
        ],
      },
      twinContext,
      "now",
    ).moves.length,
    1,
  );

  // A day the village has no words for is not dropped and not shortened: every
  // block comes back, each carrying the village's own default and saying so.
  // Dropping them would be the plan silently becoming shorter than the day, which
  // is the one thing a reader could not notice.
  const missedDay = dayPlan("Monday", week.days.Monday!, bound, { hour: 6, minute: 0 });
  assert.deepEqual(
    missedDay.map((block) => [block.time, block.here, block.translated, block.current]),
    [
      ["05:00-08:00", "out at the hives", true, true],
      ["22:00-06:00", "at home", false, false],
    ],
    "a block the answer omitted is kept, marked, and reads as the village's default rather than the Engine's sentence",
  );
  assert.equal(
    missedDay[0]!.activity,
    "checking the hives",
    "while the Engine's own string for that hour stays on the block, unedited, for the tab to print beside it",
  );
  assert.deepEqual(
    dayPlan("Tuesday", week.days.Tuesday!, bound, { hour: 12, minute: 0 }).map((block) => [
      block.time,
      block.here,
      block.translated,
      block.venueId,
      block.current,
    ]),
    [["00:00-23:59", "out at the wall all day", true, "", true]],
    "a day the answer covered is drawn in the village's words, all of it, because the Engine wrote one block for it",
  );
  // The public day plan suppresses any stored legacy wish tags.
  assert.deepEqual(
    dayPlan("Monday", week.days.Monday!, bound, { hour: 6, minute: 0 }).map((block) => block.wishId),
    ["", ""],
    "agenda hours do not claim to belong to a particular wish",
  );
  assert.deepEqual(
    dayPlan("Tuesday", week.days.Tuesday!, bound, { hour: 12, minute: 0 }).map((block) => block.wishId),
    [""],
    "even an hour with no place does not carry a wish tag",
  );
  assert.deepEqual(
    dayPlan("Wednesday", week.days.Wednesday!, twin, { hour: 6, minute: 0 }).map((block) => block.here),
    ["at home"],
    "and a day the translation says nothing about at all is the default for every block of it",
  );
  // A block whose hour range wraps past midnight contains the small hours on both
  // sides of it, which is the one piece of arithmetic in the plan.
  assert.equal(dayPlan("Monday", week.days.Monday!, bound, { hour: 2, minute: 0 })[1]!.current, true);
  assert.equal(dayPlan("Monday", week.days.Monday!, bound, { hour: 12, minute: 0 })[1]!.current, false);
  // An hour range the village cannot read is a block that is never "now", rather
  // than a crash or an hour that is always current.
  assert.equal(
    dayPlan("Wednesday", week.days.Wednesday!, bound, { hour: 6, minute: 0 })[0]!.current,
    false,
    "a block whose hour range is not a range is never the hour anybody is in",
  );

  // ── The rest of the week ──────────────────────────────────────────────────
  // The narrator is given today block by block, which is precise and is also
  // today-shaped: a reader shown one day of a miller's life has no way to tell a
  // daily grind from a Tuesday errand. This is the other days as the translation
  // knows them, so the line is about the days the plan is not.
  assert.deepEqual(restOfWeek(bound, "Monday"), ["out at the wall all day", "out at the fence line"]);
  assert.deepEqual(restOfWeek(bound, "Wednesday"), ["out at the hives", "out at the wall all day"]);
  assert.equal(restOfWeek(bound, "").length, 3, "with no day given, the whole table is the rest of the week");
  assert.deepEqual(restOfWeek(null, "Monday"), [], "and a villager with no translation has no other days either");
  assert.deepEqual(restOfWeek({ ...bound, moves: [] }, "Monday"), [], "nor does one whose translation said nothing");

  // ── The prompt ─────────────────────────────────────────────────────────────
  // This is the part of the feature that is a matter of taste rather than of
  // correctness, and the whole reason the debug panel prints it. What is proved
  // here is only what would be a bug rather than a preference: the week is the
  // input, the day and the hour are the key, the places are named, and the rules
  // that keep a cowboy village from acquiring a spaceship are present.
  //
  // TWO messages, and which of them holds what is the part that was wrong. The
  // brief — the village, the places, the person, the week — belongs in the turn
  // a model reads as its instruction, and the rules belong in the system turn
  // beside the role. It shipped the other way round for one release: one
  // enormous system message with the rule ARRAY spliced into the end of it,
  // which stringified the whole ruleset into a single comma-joined paragraph,
  // and a user turn that was the four-word question "How does that week happen
  // in Willowbrook?". The assertions below pin both halves of that down.
  const prompt = buildRemapPrompt(context);
  assert.equal(prompt.length, 2, "a system message of rules and one user message of brief");
  assert.equal(prompt[0].role, "system");
  assert.equal(prompt[1].role, "user");
  assert.ok(prompt[1].content.includes("Willowbrook"), "the brief names the village");
  const rules = prompt[0].content;
  const brief = prompt[1].content;

  // ── The rules, in the system turn ──────────────────────────────────────────
  assert.ok(
    rules.includes("no technology, no vehicles, no travel to other worlds"),
    "the rule that keeps a village's nouns is present",
  );
  assert.ok(
    rules.includes("no place on that list for it"),
    "a move the village has no room for is told to answer 0 rather than to invent a number",
  );
  // The rules are an array of lines, and they are joined as lines. A comma in the
  // seam between two rules is what a ruleset that has been run back together
  // looks like, and it made the JSON shape, the "here" rule and the "routine"
  // rule all arrive mid-sentence inside somebody else's instruction.
  assert.ok(
    !rules.includes("anyone.,The original week was written"),
    "the rules are not run together into one comma-spliced paragraph",
  );
  assert.ok(
    rules.includes("anyone.\nThe original week was written"),
    "and the seam between the first two rules is a line break rather than a comma",
  );
  assert.ok(rules.includes('\n- "moves" has exactly one entry'), "each rule is on a line of its own");
  assert.ok(
    (rules.match(/\n- /g) ?? []).length >= 10,
    "which is a list rather than the one paragraph it used to be joined into",
  );
  assert.ok(
    rules.includes(
      '{"agenda":"...","moves":[{"day":"...","time":"...","here":"...","place":1,"zoneId":"exact zone id"}]}',
    ),
    "and the JSON shape is sent as itself, on its own line, rather than inside a sentence",
  );
  assert.ok(/(^|\n)\{"agenda"/.test(rules), "starting at the beginning of a line, so it can be copied out");

  // ── The brief, in the user turn ────────────────────────────────────────────
  assert.ok(brief.includes("the mill: where the grain goes"), "the places are given by their own names");
  assert.ok(brief.includes("1. the mill"), "and numbered from one, because the number is what a move answers with");
  assert.ok(brief.includes("2. the hives"), "a place with no note is its name alone, with no dangling colon");
  assert.ok(
    !brief.includes("2. the hives:"),
    "and the rule and the list are written from one number, so neither can drift from the other",
  );
  assert.ok(!brief.includes("What is privately on their mind"), "native translations do not carry private wishes");
  assert.ok(!brief.includes("the handcart mended"), "wish prose is absent from the routine prompt");
  assert.ok(rules.includes("routine independent of wishes"), "routine translation has a neutral foundation");
  const unwished = buildRemapPrompt({ ...context, wishes: [] });
  assert.ok(
    !unwished[1].content.includes("What is privately on their mind"),
    "a villager with no wishes sends no wish list",
  );
  assert.equal(
    coerceRemap(
      { moves: [{ day: "Monday", time: "05:00-08:00", here: "out at the hives", wish: 1 }] },
      { ...context, wishes: [] },
      "now",
    ).moves[0].wishId,
    "",
    "and a number answered into that emptiness resolves to nothing, which is what the prompt promised",
  );
  // The week goes out as a day-by-day list of hours, which is what makes the answer
  // a timetable: a model shown a bag of sentences can only answer with a bag of
  // sentences, and a model shown a week can answer about a week.
  assert.ok(brief.includes("Monday"), "the week is listed under its own day headings");
  assert.ok(brief.includes("Wednesday"), "every day of it, not just the first");
  assert.ok(brief.includes("05:00-08:00"), "with each block's hour range written out");
  assert.ok(brief.includes('"checking the hives"'), "and the Engine's sentence quoted, as the thing to say again");
  assert.ok(
    brief.includes("copy both back exactly"),
    "and with the day and the hour range named as the key the answer is found by",
  );
  assert.ok(
    !brief.includes("h a week"),
    "while the hours a phrase eats in a week are NOT sent, because that framing is what produced a glossary",
  );
  assert.ok(brief.includes("busy, and not to be interrupted"), "the status is said in words a person would use");
  assert.ok(brief.includes("asleep or away from everyone"));
  assert.ok(brief.includes("mending the fence"), "and a block with no status is still translated");
  assert.ok(
    brief.trimEnd().endsWith(`Write their week as it happens in Willowbrook.`),
    "and the turn ends on the ask itself rather than on the data it is about",
  );
  assert.ok(
    !brief.includes('"moves" has exactly one entry'),
    "with the rules left in the system turn where a model weights them",
  );
  assert.ok(
    brief.trimStart().startsWith("The village is like this:"),
    "and opening on what the village is, before anything about the person in it",
  );

  const crowd = Array.from({ length: 110 }, (_unused, index) => ({
    day: "Monday",
    time: `slot ${String(index).padStart(3, "0")}`,
    activity: `an errand, number ${index}`,
    status: "",
  }));
  const crowded = buildRemapPrompt({ ...context, blocks: crowd });
  assert.ok(
    crowded[1].content.includes("slot 080"),
    "a long schedule keeps every slot available for bounded translation batches",
  );
  assert.ok(
    crowded[1].content.includes("slot 109"),
    "the final slots survive rather than disappearing behind the old eighty-block cap",
  );
  // The keys come off the same cut, so what the village asks about and what it
  // insists on hearing back are one list by construction. A list built a second way
  // would eventually disagree, and it would disagree in the worst direction: the
  // village would settle for a table it believed complete while some hour of
  // somebody's day read as its own default.
  assert.equal(remapBlockKeys(crowd).length, crowd.length);
  assert.deepEqual(
    remapBlockKeys(crowd),
    crowd.map((block) => remapBlockKey(block.day, block.time)),
    "the signature and completeness check include every source slot",
  );

  // The same ceiling on the places, and it is the number the lookup resolves
  // against. A list longer than that is cut rather than refused, and a move that
  // answered with a number past the cut is read as having no place — which is what
  // answering against a list the model was never shown has to mean.
  const manyPlaces = buildRemapPrompt({
    ...context,
    venues: Array.from({ length: MAX_VENUES + 6 }, (_unused, index) =>
      venue(`place-${index + 1}`, `place ${index + 1}`),
    ),
  });
  assert.ok(manyPlaces[1].content.includes(`${MAX_VENUES}. place ${MAX_VENUES}`), "the last named place is named");
  assert.ok(
    !manyPlaces[1].content.includes(`place ${MAX_VENUES + 1}`),
    "and nothing past the cap is offered, so no number there could have been read off the list",
  );

  // A village that has not said what is in it has no numbered places, and the
  // prompt says so rather than leaving a rule pointing at an empty list.
  const nowhere = buildRemapPrompt({ ...context, venues: [] });
  assert.ok(
    nowhere[1].content.includes("every move has a place of 0"),
    "an empty village is told there is nothing to point at, not left to invent a number",
  );
  assert.equal(
    coerceRemap(
      { moves: [{ day: "Monday", time: "05:00-08:00", here: "out", place: 1 }] },
      { ...context, venues: [] },
      "now",
    ).moves[0].venueId,
    "",
    "and a number answered into that emptiness resolves to nothing, as the prompt promised",
  );
  // A week with no blocks sends no week section at all, rather than an empty list
  // with a rule pointing at it.
  assert.ok(
    !buildRemapPrompt({ ...context, blocks: [] })[1].content.includes("day by day and hour by hour"),
    "a villager with no week is not sent a week section with nothing in it",
  );

  // ── The availability, in words two prompts share ──────────────────────────
  // One table, read by the translation prompt and by the villager's own prompt, so
  // the two can never drift into disagreeing about whether somebody is free. The
  // lookup is forgiving because the tokens arrive in Engine metadata the village
  // does not own and cannot assume the shape of.
  assert.equal(describeStatus("dnd"), "busy, and not to be interrupted");
  assert.equal(
    describeStatus(" DND "),
    "busy, and not to be interrupted",
    "read case-blind, since the token is not ours",
  );
  assert.equal(describeStatus("offline"), "asleep or away from everyone");
  assert.equal(describeStatus("idle"), "between things, and easy to interrupt");
  assert.equal(describeStatus("online"), "free, and out and about");
  assert.equal(describeStatus(""), "", "an hour the Engine said nothing about is left unsaid");
  assert.equal(
    describeStatus("napping"),
    "",
    "and so is a token the village has never been taught, rather than printing it",
  );

  // ── The log line ──────────────────────────────────────────────────────────
  assert.equal(
    describeRemap(bound),
    "Monday 05:00-08:00: checking the hives → out at the hives; Tuesday 00:00-23:59: checking the hives → out at the wall all day; Wednesday whenever: mending the fence → out at the fence line",
  );
  assert.equal(describeRemap({ ...bound, moves: [] }), "", "nothing said is an empty line rather than a word");

  // The settings view shows a complete Villages plan for every resident and
  // exposes a Marinara schedule only as an optional comparison and input.
  const { readFileSync } = await import("node:fs");
  const { dirname, resolve } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const clientSource = clientImplementation();
  assert.ok(clientSource.includes("Villages agenda</h4>"), "the village agenda is named as the primary plan");
  assert.ok(!clientSource.includes("Marinara schedule</h4>"), "the authoritative translation comparison is retired");
  assert.ok(clientSource.includes("villager.agenda?.activeDay?.blocks"), "today reads the frozen active agenda");
  assert.ok(clientSource.includes("villager.agenda?.week?.[day.weekday]"), "future days read the village week");
  assert.ok(clientSource.includes("part.reason"), "each agenda block explains why");
  assert.ok(clientSource.includes("setAgendaScheduleIngestion"), "schedule ingestion can be changed per villager");
  assert.ok(clientSource.includes("agendaUpdatePending(villager)"), "pending changes are labelled for tomorrow");
  assert.ok(clientSource.includes("Schedule influence enabled"), "optional influence is visible beside the agenda");
  assert.ok(clientSource.includes("Personalization needs retry"), "model failure is visible without hiding the agenda");
  assert.ok(
    clientSource.includes("<details") && clientSource.includes("<summary"),
    "agenda days work from the keyboard",
  );
  assert.ok(
    clientSource.includes("@container ${ELEMENT_TAG} (max-width: 35rem)"),
    "comparison columns stack in narrow layouts",
  );
  assert.ok(clientSource.includes("No Marinara schedule. Villages uses its own agenda."));
  assert.ok(clientSource.includes("The Villages agenda remains active."));
  assert.ok(!clientSource.includes("part.clock"), "legacy four-period keys are not displayed");
  assert.ok(!clientSource.includes("undefined:"), "no undefined clock label is rendered");
  assert.ok(!clientSource.includes("Forgetting a translation asks"), "obsolete translation instructions are gone");

  // ── The leak, closed at both readers ──────────────────────────────────────
  // The failure this whole file exists for, and the one it did not catch: an hour
  // the village has no words for must not reach a prompt in the Engine's own words.
  // It used to, on the grounds that the Engine's sentence was better than a blank —
  // but a fallback is read by exactly the prompt a translation is read by, so a
  // village with no spaceship briefed its narrator on somebody's morning in a
  // cockpit.
  //
  // Both readers are built here out of one real week and read for the noun.
  // `doingFor` is the villager's, and it is the whole of the composition: the
  // translation of the present hour, the village's own summary if it has written
  // one, and the day the hour sits in out of the same table. `renderResidentsBlock`
  // is the narrator's, and it is built from what that composition produced.
  const pilotWeek = schedule({
    Monday: [
      { time: "05:00-08:00", activity: "piloting the Halcyon", status: "dnd" },
      { time: "08:00-22:00", activity: "walking the ridge", status: "idle" },
      { time: "22:00-06:00", activity: "asleep", status: "offline" },
    ],
  });
  const pilotBlocks = remapBlocks(pilotWeek);
  // The Tuesday slot has to be one the translation was WRITTEN for, so the context
  // it is resolved against carries that day too. The plan below is still Monday's,
  // which is what makes the phrase land in `restOfWeek` rather than in the day.
  const pilot = coerceRemap(
    {
      moves: [
        { day: "Monday", time: "22:00-06:00", here: "asleep in the loft" },
        { day: "Tuesday", time: "05:00-08:00", here: "mending the fence" },
      ],
    },
    {
      ...context,
      blocks: [...pilotBlocks, { day: "Tuesday", time: "05:00-08:00", activity: "walking the ridge", status: "idle" }],
    },
    "now",
  );
  const pilotRoutine = {
    routineSummary: "Ives flies the Halcyon most mornings and sleeps in the crew quarters.",
    activity: "piloting the Halcyon",
    status: "dnd",
    talkativeness: 60,
    weekStart: "2026-09-07",
    weekday: "Monday",
    block: pilotWeek.days.Monday![0],
    blocks: pilotWeek.days.Monday,
  };
  const now = new Date();
  const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const activeBlocks = [
    { startMinute: 0, endMinute: 300, venueId: "", activity: "sleeping at home", reason: "To rest", status: "offline" },
    {
      startMinute: 300,
      endMinute: 480,
      venueId: "",
      activity: "at home",
      reason: "To prepare for the day",
      status: "dnd",
    },
    {
      startMinute: 480,
      endMinute: 1320,
      venueId: "",
      activity: "working in the village",
      reason: "To earn a living",
      status: "online",
    },
    {
      startMinute: 1320,
      endMinute: 1440,
      venueId: "",
      activity: "sleeping at home",
      reason: "To rest",
      status: "offline",
    },
  ] as const;
  const pilotAgenda = {
    wishes: [],
    routineSummary: "An ordinary village day.",
    day: [],
    source: "village",
    generatedAt: "now",
    activeDay: { dateKey, weekday: "Monday", blocks: activeBlocks, scheduleInformed: false },
  };
  const pilotDoing = doingFor(pilot, pilotRoutine as any, { hour: 6, minute: 0 }, pilotAgenda as any);
  assert.equal(pilotDoing.activity, "at home", "the active Villages agenda decides the activity");
  assert.equal(pilotDoing.status, "dnd", "availability comes from the same active agenda block");
  assert.equal(pilotDoing.routineSummary, "An ordinary village day.");
  assert.equal(pilotDoing.today.length, 4, "the entire active day reaches the prompt");
  assert.equal(pilotDoing.today[1]?.reason, "To prepare for the day");
  const villagerBlock = renderDoingBlock(pilotDoing);
  assert.ok(!villagerBlock.includes("Halcyon"), "native schedule prose never reaches the villager prompt");
  assert.ok(villagerBlock.includes("Right now you are at home until 08:00."));
  assert.ok(!villagerBlock.includes("To prepare for the day"), "routine reasons stay out of recurring prompts");
  const narratorBlock = renderResidentsBlock([
    {
      characterId: "character-ives",
      name: "Ives",
      summary: "An apiarist with a ledger.",
      tags: ["beekeeper"],
      doing: pilotDoing.activity,
      status: pilotDoing.status,
      routine: pilotDoing.routineSummary,
      week: [],
      today: pilotDoing.today,
      agenda: pilotAgenda as any,
      remembered: [],
    },
  ]);
  assert.ok(!narratorBlock.includes("Halcyon"), "native schedule prose never reaches the narrator");
  assert.ok(!narratorBlock.includes("To prepare for the day"), "routine reasons are omitted from recurring prompts");
  assert.ok(!renderResidentsBlock([]).includes("lives here"));

  // ── Block-level fidelity ──────────────────────────────────────────────────
  // The thing the whole feature is for, and the one thing a summary cannot prove. A
  // card with a distinct activity in every hour of the day must come out the other
  // end as a day with a distinct hour in it — not a morning, not a stretch, not
  // "mostly". Twenty-four slots in, twenty-four rows out, in the Engine's own
  // order, with the hour ranges untouched.
  const hourly = Array.from({ length: 24 }, (_unused, hour) => ({
    time: `${String(hour).padStart(2, "0")}:00-${String(hour + 1).padStart(2, "0")}:00`,
    activity: `an hour on the card, number ${hour}`,
    status: "",
  }));
  const hourlySchedule = schedule({ Monday: hourly });
  const hourlyBlocks = remapBlocks(hourlySchedule);
  assert.equal(hourlyBlocks.length, 24, "twenty-four distinct hours are twenty-four slots to translate");
  const hourlyContext = { ...context, blocks: hourlyBlocks };
  const hourlyRemap = coerceRemap(
    {
      routine: "Every hour of it is accounted for.",
      moves: hourly.map((block) => ({ day: "Monday", time: block.time, here: `minding ${block.activity}` })),
    },
    hourlyContext,
    "now",
  );
  assert.equal(hourlyRemap?.moves.length, 24, "and twenty-four answers come back under a cap that is above them");
  assert.equal(
    new Set(hourlyRemap.moves.map((move) => move.here)).size,
    24,
    "twenty-four distinct slots are twenty-four distinct answers, which is the ceiling this whole shape exists to reach",
  );
  const hourlyPlan = dayPlan("Monday", hourly, hourlyRemap, { hour: 13, minute: 30 });
  assert.equal(hourlyPlan.length, 24, "the plan keeps every block the Engine wrote; none is merged away");
  assert.deepEqual(
    hourlyPlan.map((block) => block.time),
    hourly.map((block) => block.time),
    "in the order the Engine wrote them, with every hour range exactly as written",
  );
  assert.ok(
    hourlyPlan.every((block) => block.translated),
    "and every single hour has the village's own words rather than the default",
  );
  assert.equal(hourlyPlan.filter((block) => block.current).length, 1, "exactly one hour is the hour asked about");
  assert.equal(hourlyPlan[13]!.current, true, "and it is the right one");
  assert.equal(hourlyPlan[13]!.here, "minding an hour on the card, number 13");
  assert.equal(
    hourlyPlan[13]!.activity,
    "an hour on the card, number 13",
    "the Engine's string rides beside the village's",
  );

  const hourlyDoing = {
    activity: hourlyPlan[13]!.here,
    routineSummary: "",
    status: "",
    today: hourlyPlan,
  };
  const hourlyVillager = renderDoingBlock(hourlyDoing);
  for (const block of hourly) {
    assert.ok(
      hourlyVillager.includes(`${block.time} minding ${block.activity}`),
      `the villager's own prompt prints ${block.time} rather than blurring it into a part of the day`,
    );
  }
  assert.ok(
    hourlyVillager.includes("Right now you are minding an hour on the card, number 13 until 14:00."),
    "and says how long the hour they are in has left",
  );

  const hourlyNarrator = renderResidentsBlock([
    {
      characterId: "character-ives",
      name: "Ives",
      summary: "",
      tags: [],
      doing: hourlyPlan[13]!.here,
      status: "",
      routine: "",
      week: Array.from({ length: MAX_RESIDENT_WEEK_NOTES + 3 }, (_unused, index) => `note ${index}`),
      today: hourlyPlan,
      agenda: null,
      remembered: [],
    },
  ]);
  for (const block of hourly) {
    assert.ok(
      hourlyNarrator.includes(`${block.time} minding ${block.activity}`),
      `the narrator is given ${block.time} too, so what it writes can agree with the hour it happens in`,
    );
  }
  assert.ok(
    hourlyNarrator.includes(
      `On other days: ${Array.from({ length: MAX_RESIDENT_WEEK_NOTES }, (_unused, index) => `note ${index}`).join("; ")}`,
    ),
    "the rest of the week is named, capped, and does not carry today",
  );
  assert.ok(!hourlyNarrator.includes(`note ${MAX_RESIDENT_WEEK_NOTES}`), "and the cap on it holds");

  // A week whose phrases the plan already says is not repeated back at the
  // narrator: the line is about the days the plan is not.
  assert.deepEqual(
    restOfWeek({ ...hourlyRemap, moves: [] }, "Monday"),
    [],
    "nothing is said to be on other days when the table has nothing in it",
  );
  assert.equal(
    restOfWeek(hourlyRemap, "Tuesday").length,
    24,
    "while a table that covers the week and a day that is not in it is the whole of the rest of the week",
  );

  // ── The answer gets a budget the size of the question ─────────────────────
  // The output cap is derived from the number of blocks actually asked about
  // rather than fixed, which is the correction for a village that showed every
  // hour of every week as `at home` while the tick ran twice a day and logged
  // nothing anybody could read. The prompt carries each block TWICE — once as the
  // Engine's sentence and once as the key to answer under — so a flat cap that
  // suited a short week truncated a long one, and the connection this runs on
  // spends part of its output on thinking before it writes anything.
  //
  // What is proved here is the shape: proportional in the middle, floored so a
  // short week is not starved of reasoning room, and capped so a very long week
  // cannot ask for a budget no host will honour.
  assert.equal(
    remapAnswerBudget(0),
    REMAP_TOKENS_FLOOR,
    "a week with nothing in it is still given room to think, because reasoning is spent before any answer appears",
  );
  assert.equal(remapAnswerBudget(1), REMAP_TOKENS_FLOOR, "and one block is well inside the floor");
  assert.equal(
    remapAnswerBudget(1_000),
    REMAP_TOKENS_CEILING,
    "while a week far past any real one is capped rather than asked for",
  );
  assert.equal(
    remapAnswerBudget(200),
    REMAP_TOKENS_CEILING,
    "the ceiling arriving before the arithmetic does, so the two can never disagree about which wins",
  );
  const middle = Math.floor(REMAP_TOKENS_FLOOR / REMAP_TOKENS_PER_BLOCK) + 1;
  assert.equal(
    remapAnswerBudget(middle),
    middle * REMAP_TOKENS_PER_BLOCK,
    "between the two it is linear in the blocks, which is the only place the number means anything",
  );
  assert.ok(remapAnswerBudget(10) < REMAP_TOKENS_CEILING, "a bounded translation batch fits well inside the ceiling");
  assert.equal(
    remapAnswerBudget(10),
    REMAP_TOKENS_FLOOR,
    "a normal batch gets reasoning room while the whole week is handled across batches",
  );
  assert.ok(remapAnswerBudget(0) < 6_000, "a short request no longer reserves the output budget of a whole week");

  // ── A refusal is a fact about one villager ────────────────────────────────
  // The other half of the same release, and the half that made the failure
  // visible rather than silent. A villager with no translation because the village
  // has not got round to them and a villager with no translation because the model
  // refused them are the same `remap: null`, and until this existed the tab could
  // only report the first. What was needed was something that survives a restart,
  // because the failure happens on a tick nobody is watching.
  const store = await import("../packages/villages/src/server/features/world/village-store.js");
  const refusals = store.coerceVillageState({
    wishSystemVersion: 3,
    foundedAt: "2026-09-18T16:40:57.802Z",
    villagers: [
      {
        characterId: "character-ives",
        cardSnapshot: cardSnapshot("character-ives", "Ives"),
        cachedName: "Ives",
        addedAt: "2026-09-18T16:41:00.000Z",
        agenda: null,
        remap: null,
        remapFailure: { at: "2026-09-19T00:00:30.011Z", message: "The connection refused the request." },
      },
    ],
  });
  assert.deepEqual(
    refusals.villagers[0]!.remapFailure,
    { at: "2026-09-19T00:00:30.011Z", message: "The connection refused the request." },
    "a refused translation survives the round trip through the document, so the tick can report what a restart would otherwise erase",
  );
  assert.equal(refusals.villagers[0]!.remap, null, "beside the null that says no translation was written");

  const partial = store.coerceVillageState({
    wishSystemVersion: 3,
    villagers: [
      {
        characterId: "a",
        cardSnapshot: cardSnapshot("a", "A"),
        cachedName: "A",
        addedAt: "",
        agenda: null,
        remap: null,
        remapFailure: { message: "no time" },
      },
      {
        characterId: "b",
        cardSnapshot: cardSnapshot("b", "B"),
        addedAt: "",
        agenda: null,
        remap: null,
        remapFailure: { at: "then" },
      },
      {
        characterId: "c",
        cardSnapshot: cardSnapshot("c", "C"),
        cachedName: "C",
        addedAt: "",
        agenda: null,
        remap: null,
        remapFailure: { at: "then", message: "   " },
      },
      {
        characterId: "d",
        cardSnapshot: cardSnapshot("d", "D"),
        cachedName: "D",
        addedAt: "",
        agenda: null,
        remap: null,
        remapFailure: { at: 12, message: "wrong shape" },
      },
      {
        characterId: "e",
        cardSnapshot: cardSnapshot("e", "E"),
        cachedName: "E",
        addedAt: "",
        agenda: null,
        remap: null,
        remapFailure: "not a record at all",
      },
    ],
  });
  assert.deepEqual(
    partial.villagers.map((villager) => villager.remapFailure),
    [null, null, null, null, null],
    "and every half-formed one is dropped rather than completed with a guess, because the document is on disk and a player can edit it",
  );
  assert.deepEqual(
    store.coerceVillageState({
      wishSystemVersion: 3,
      villagers: [{ characterId: "a", cardSnapshot: cardSnapshot("a", "A"), addedAt: "", agenda: null, remap: null }],
    }).villagers[0]!.remapFailure,
    null,
    "a record written before any of this existed reads as never refused, which is not the same as working",
  );

  // The sentence a refusal is reported in, which is the text the tab prints. A
  // model host that rejects with a page of HTML must not be able to stuff a village
  // document with it, and a throw with nothing to say must produce a sentence
  // rather than an empty badge.
  assert.equal(
    remapFailureText(new Error("The connection refused the request.")),
    "The connection refused the request.",
    "an Error is reported by its message, with no prefix of its own",
  );
  assert.equal(
    remapFailureText("a bare string"),
    "a bare string",
    "and anything else is stringified, because a host may not throw an Error",
  );
  assert.equal(
    remapFailureText({ status: 503 }),
    "[object Object]",
    "including a plain object, which is what a rejected fetch leaves",
  );
  assert.equal(
    remapFailureText(new Error("   ")),
    "The village was refused and the model gave no reason.",
    "a throw with nothing to say is still a sentence",
  );
  const wordy = remapFailureText(new Error("x".repeat(MAX_REMAP_FAILURE_LENGTH + 500)));
  assert.equal(
    wordy.length,
    MAX_REMAP_FAILURE_LENGTH,
    "a long refusal is cut to the cap the document is willing to hold",
  );
  assert.ok(wordy.endsWith("…"), "and marked as cut rather than left looking complete");

  // ── The day a wish dies ────────────────────────────────────────────────────
  // The last field of a wish that is not the model's: how long it lasts. A wish is
  // not a task with a deadline, so the date is never shown to a villager and never
  // reaches a prompt — it exists so that a wish can go quiet on its own, and so that
  // a village the player has not opened in a month does not come back holding
  // somebody's small hope from a month ago as if it were today's.
  //
  // It is ROLLED from the wish's own id rather than drawn at random, and that is
  // what makes any of it assertable: a lifetime out of `Math.random` could only be
  // checked for being a number, and — worse — the same wish read back off disk twice
  // could die on two different days. Every claim below is a claim that could not be
  // made about a random draw.
  const spread = Array.from({ length: 512 }, (_unused, index) => wishLifetimeDays(`wish-${index}`));
  assert.deepEqual(
    ["wish-cart", "wish-roof", "wish-1", "wish-7", "a", ""].map(wishLifetimeDays),
    ["wish-cart", "wish-roof", "wish-1", "wish-7", "a", ""].map(wishLifetimeDays),
    "the same id is always given the same number of days, which is the whole point of rolling it off the id",
  );
  assert.ok(
    spread.every((days) => Number.isInteger(days) && days >= 1 && days <= 7),
    "and every roll is a whole number of days inside the week the village is willing to remember for",
  );
  assert.ok(
    spread.filter((days) => days <= 3).length > spread.length / 2,
    "with most of a village inside three days, because the ordinary wish is a small thing somebody notices this week",
  );
  assert.ok(
    spread.includes(7) && spread.includes(3),
    "and the far end of the table reachable rather than decorative, so the table's own tail is proved to exist",
  );
  assert.ok(
    new Set(spread).size > 1,
    "and the roll is not one number in disguise: a table that answered the same everywhere would satisfy every " +
      "assertion above and none of the intent",
  );

  // What the writer stamps, and the two ways the moment can arrive. `at` is the
  // moment the wish's own answer came back from the model, and it is put through the
  // same reader every other stored instant in this package goes through, so a wish
  // and a `generatedAt` beside it can never disagree about what a moment looks like.
  const roof = wishOf("wish-4", "a roof that does not leak", 3, "", BORN);
  assert.equal(roof.addedAt, BORN, "a wish is born at the moment its own answer arrived");
  assert.equal(
    roof.expiresAt,
    "2026-09-14T09:00:00.000Z",
    "and dies a week later, because this id is one of the table's rare long rolls and a week is the most it gives",
  );
  assert.equal(
    Date.parse(roof.expiresAt) - Date.parse(roof.addedAt),
    wishLifetimeDays("wish-4") * 86_400_000,
    "which is the roll and no other number, so the date and the roll cannot come to disagree about the same wish",
  );
  assert.equal(
    wishOf("wish-4", "a roof that does not leak", 3, "", "2020-01-01T00:00:00.000Z").expiresAt,
    "2020-01-08T00:00:00.000Z",
    "with the date moving with the moment it was born rather than being fixed per id: the id decides the LENGTH",
  );
  assert.equal(
    wishOf("wish-4", "a roof that does not leak", 3, "", "2026-09-07").addedAt,
    "2026-09-07T00:00:00.000Z",
    "and a moment written without a time is read as midnight rather than rejected, normalised as everything else is",
  );
  const undated = wishOf("wish-roof", "a roof that does not leak", 3, "", "now");
  assert.deepEqual(
    [undated.addedAt, undated.expiresAt],
    ["", ""],
    "while a moment that is not one leaves the wish with no birth date and no deadline at all, which is the safe " +
      "direction in two senses at once: every wish written before this field existed keeps behaving exactly as it " +
      "did, and a hand-edited document cannot make somebody's wish vanish by accident. An undated wish still leaves " +
      "the list the other two ways — fulfilled, or judged to have lapsed",
  );
  assert.ok(
    ["2026-03-28T12:00:00.000Z", "2026-10-24T12:00:00.000Z"].every((at) =>
      spread.slice(0, 32).every((days, index) => {
        const stamped = wishOf(`wish-${index}`, "a roof that does not leak", 3, "", at);
        return Date.parse(stamped.expiresAt) - Date.parse(stamped.addedAt) === days * 86_400_000;
      }),
    ),
    "and the arithmetic is done in UTC rather than on the calendar, so a wish born on the weekend a clock changes " +
      "dies the same number of days later as any other: a local roll would move that deadline by an hour",
  );

  // ── What the village reads back ────────────────────────────────────────────
  // The second half of the two-coercion rule every stored field in this package
  // follows, and the half that is easy to get wrong in the direction nobody notices:
  // the READER must hand back what it found rather than rolling a fresh date. A
  // reader that re-derived the deadline would look correct for a wish written a
  // second earlier and would silently re-age every wish in the village on every
  // restart.
  const stored = store.coerceVillageState({
    wishSystemVersion: 3,
    villagers: [
      {
        characterId: "character-ives",
        cardSnapshot: cardSnapshot("character-ives", "Ives"),
        cachedName: "Ives",
        addedAt: "",
        remap: null,
        agenda: {
          routineSummary: "",
          source: "village",
          generatedAt: "",
          wishes: [
            // A deadline no roll can produce, on purpose: the reader has to hand
            // back what it found rather than derive what it would have written.
            {
              id: "wish-roof",
              wish: "a roof that does not leak",
              intensity: 3,
              tell: "",
              addedAt: BORN,
              expiresAt: "2030-01-01T00:00:00.000Z",
            },
            { id: "wish-legacy", wish: "the handcart mended", intensity: 1, tell: "" },
            {
              id: "wish-junk",
              wish: "a lamp for the workshop",
              intensity: 2,
              tell: "",
              addedAt: "sometime",
              expiresAt: "next Tuesday",
            },
          ],
        },
      },
    ],
  }).villagers[0]!.agenda!;
  assert.deepEqual(
    stored.wishes.map((wish) => [wish.id, wish.addedAt, wish.expiresAt]),
    [
      ["wish-roof", BORN, "2030-01-01T00:00:00.000Z"],
      ["wish-legacy", "", ""],
      ["wish-junk", "", ""],
    ],
    "a wish read back off the document keeps the two dates it was written with rather than being given fresh ones, " +
      "a wish that predates the fields reads as undated, and dates that are not dates read as undated too — the " +
      "difference being a wish that survives a hand-edited save instead of a wish that has quietly expired",
  );
  assert.equal(
    stored.wishes[0]!.wish,
    "a roof that does not leak",
    "with the rest of the wish arriving beside them, so the dates are additions to the record rather than a " +
      "replacement for any of it",
  );

  console.log(
    "Villages schedule remap regression: slots, table, timetable, home, signature, day, leak, prompt, wish life ok\n",
  );
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
