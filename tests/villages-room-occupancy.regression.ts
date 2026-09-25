// Villages — proof for who is WHERE.
//
// `{{roster}}` answers "who lives here", and it is the same list at three in the
// morning as at noon, which is why a villager handed nothing else answers "who
// is around?" with the entire village. This file proves the one fact that
// question actually needs: the village read at THIS hour and grouped by the place
// each person is standing in.
//
// Everything under test is pure — a group-by over data the caller has already
// read, and a block of prompt text — so the whole file runs without a host. The
// failures worth catching are all of the same shape, and two of them are about
// what must NOT be said:
//
//   * the Engine's own sentence about an hour the village has no translation for
//     never reaches the block, and the village's own "at home" default is never
//     printed as somebody's doing beside a line that has just said where they
//     are. That is the same leak `villages-schedule-remap.regression.ts` proves
//     shut one hop earlier, and a new block that reads a schedule is a new place
//     it could come back in;
//   * nothing is invented for a person the village cannot place, and nothing at
//     all is said when there is nobody else to place.
//
// The cap is proved here too, because it is the difference between a block that
// is shorter than the roster and a block that IS the roster wearing a heading.
import assert from "node:assert/strict";

async function main() {
  const { presentFor } = await import("../packages/villages/src/engine/packages/server/src/services/villages/chat.ts");
  const {
    MAX_PRESENT_PEOPLE_PER_PLACE,
    MAX_PRESENT_PLACES,
    VILLAGE_PRESET_MACROS,
    VILLAGES_DEFAULT_KNOWLEDGE,
    buildPromptValues,
    renderPresentBlock,
    renderVillagePrompt,
    resolveVillagePrompt,
  } = await import("../packages/villages/src/engine/packages/server/src/services/villages/prompt-preset.ts");

  // ── Fixtures ───────────────────────────────────────────────────────────────
  // Only the fields `villagerPlaceView` reads, because that is the whole of what
  // this file is about: a village is a set of places and a set of villagers, and
  // placing somebody is a lookup over the two. A house is a place like any other
  // one — that is what the helper below takes the map as.
  const venue = (id: string, name: string) => ({
    id,
    name,
    purpose: "",
    category: "public",
    presentation: { image: null, x: 0.5, y: 0.5 },
    occupancy: { playerHome: false, residentCharacterId: null as string | null, homeKind: null as string | null },
    capabilities: [],
    state: { condition: "", upgrades: [], furniture: [], publicFacts: [], updatedAt: "" },
  });
  const home = (id: string, characterId: string) => ({
    ...venue(id, ""),
    occupancy: { playerHome: false, residentCharacterId: characterId, homeKind: "small-home" },
  });
  const villager = (characterId: string, remap: any = null) => ({
    characterId,
    cardSnapshot: { name: `the one called ${characterId}` },
    addedAt: "2026-09-18T00:00:00.000Z",
    agenda:
      remap?.moves?.[0]?.time === "00:00 - 24:00"
        ? {
            activeDay: {
              dateKey: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`,
              blocks: [
                {
                  startMinute: 0,
                  endMinute: 1440,
                  venueId: remap.moves[0].venueId,
                  activity: remap.moves[0].here,
                  reason: "Daily work",
                  status: "idle",
                },
              ],
            },
          }
        : null,
    remap,
  });
  // The slot everything below is keyed by. A translation is addressed by the DAY
  // and the HOUR RANGE of the block it answers about and by nothing else — see
  // `remapBlockKey` — so a fixture that wants an hour the village has no words for
  // moves the TRANSLATION to another hour rather than changing the sentence it
  // carries. `LIVED` is the hour each villager is standing in; `ELSEWHERE` is an
  // hour of the same day that they are not.
  const DAY = "Monday";
  const LIVED = "00:00 - 24:00";
  const ELSEWHERE = "08:00 - 12:00";
  /**
   * The Engine's narrow read of one villager at `time`: the block covering that
   * minute, the block's own hour range, and the weekday the read was taken on. The
   * three facts together are what the translation is looked up BY.
   *
   * `activity` is the Engine's sentence, and the one thing this file needs it for
   * is proving that it never reaches a block. Nothing under test reads it to answer
   * a question.
   */
  const routine = (activity: string, status = "", time = LIVED) => ({
    routineSummary: "",
    activity,
    status,
    talkativeness: null,
    weekStart: "2026-09-07",
    weekday: DAY,
    block: { time, activity, status },
    blocks: [{ time, activity, status }],
  });
  /**
   * A village's own translation, as the record stores it: the Engine's activity,
   * the SLOT that answer belongs to, this village's phrase for it, and the venue
   * the village decided that phrase happens at. The venue id is empty when the
   * village placed the hour nowhere in particular, which is how a home fallback is
   * reached from an hour the village DID have words for.
   */
  const remapFor = (activity: string, here: string, venueId: string, time = LIVED) => ({
    weekStart: "2026-09-07",
    moves: [{ day: DAY, time, activity, here, venueId }],
    routine: "",
    signature: "sig",
    attempts: 1,
    generatedAt: "",
  });

  const HANA = "character-hana";
  const BO = "character-bo";
  const CASS = "character-cass";

  // The houses are places on the SAME list as the venues rather than a second
  // one beside it: the village cannot hold two readings of where somebody is.
  const village = (villagers: unknown[], homes: unknown[] = []) => ({
    venues: [venue("mill", "the mill"), venue("harbour", "the harbour"), ...homes],
    villagers,
  });
  const routines = (entries: Record<string, unknown>) => new Map(Object.entries(entries));
  const names = (entries: Record<string, string>) => new Map(Object.entries(entries));

  // ── The grouping ───────────────────────────────────────────────────────────
  // The whole release in one assertion: two people in one venue become ONE group
  // with two people in it, the speaker is not among them, and the group holding
  // the speaker's own place is marked and comes first.
  {
    const v = village([
      villager(HANA, remapFor("grinding the grain", "grinding the week's flour", "mill")),
      villager(BO, remapFor("unloading", "swapping the day's salt", "mill")),
      villager(CASS, remapFor("mending", "mending the nets", "harbour")),
    ]);
    const found = presentFor(
      v as never,
      HANA,
      routines({
        [HANA]: routine("grinding the grain", "dnd"),
        [BO]: routine("unloading"),
        [CASS]: routine("mending"),
      }) as never,
      names({ [HANA]: "Hana", [BO]: "Bo", [CASS]: "Cass" }) as never,
    );
    assert.equal(found.length, 2, "two places have somebody standing in them");
    assert.deepEqual(
      found.map((group) => [group.id, group.name, group.kind, group.here]),
      [
        ["mill", "the mill", "venue", true],
        ["harbour", "the harbour", "venue", false],
      ],
      "the speaker's own place is first and marked, and nothing else is",
    );
    assert.deepEqual(
      found[0]!.people,
      [{ characterId: BO, name: "Bo", doing: "swapping the day's salt" }],
      "the speaker is in none of the groups, and a venue's people carry the village's own phrase for the hour",
    );
    assert.equal(
      found[1]!.people.length,
      1,
      "a venue only one person is standing in is still a group, so it is named rather than flattened into its neighbour",
    );
  }

  // ── The home fallback ──────────────────────────────────────────────────────
  // Somebody whose hour the village has no venue for still ends up SOMEWHERE:
  // their own home, which is the same default the hour itself lands on. This is
  // the pair of facts that has to come out of one decision — the picture behind
  // them and the group they are put in.
  //
  // Their `doing` is empty, and that is the point of this case. Bo's translation
  // answers an hour of their day they are not standing in, which is exactly the
  // shape of every untranslated hour: a table that does not cover this slot. The
  // village's own default — "at home" — is the ONE phrase that must not be printed
  // here, because the line has just said they are at home.
  {
    const v = village(
      [
        villager(HANA, remapFor("grinding the grain", "grinding the week's flour", "mill")),
        villager(BO, remapFor("unloading", "unloading crates", "harbour", ELSEWHERE)),
      ],
      [home("home-bo", BO)],
    );
    const found = presentFor(
      v as never,
      HANA,
      routines({ [HANA]: routine("grinding the grain"), [BO]: routine("asleep", "offline") }) as never,
      names({ [HANA]: "Hana", [BO]: "Bo" }) as never,
    );
    assert.deepEqual(
      found.map((group) => [group.id, group.name, group.kind, group.here]),
      [["home-bo", "Small home", "home", false]],
      "an hour with no venue lands on the villager's own home, and the home is a home rather than a venue",
    );
    assert.deepEqual(
      found[0]!.people,
      [{ characterId: BO, name: "Bo", doing: "" }],
      "an hour the village cannot translate says nothing about what they are at, rather than falling back to 'at home'",
    );
  }

  // ── The null case ──────────────────────────────────────────────────────────
  // A villager the village cannot place at all is left out rather than gathered
  // under a heading that names nothing, and a speaker who cannot be placed marks
  // no group as `here`.
  {
    const v = village([villager(HANA), villager(BO, remapFor("unloading", "unloading crates", "harbour"))]);
    const found = presentFor(
      v as never,
      "character-nobody",
      routines({ [BO]: routine("unloading") }) as never,
      names({ [BO]: "Bo" }) as never,
    );
    assert.deepEqual(
      found.map((group) => [group.id, group.here]),
      [["harbour", false]],
      "a villager with no venue and no home is in no group, and an unplaceable speaker marks nothing as here",
    );

    // A village where nobody else can be placed produces NOTHING, which is what
    // keeps a villager alone at home producing the prompt they produced before
    // this block existed.
    assert.deepEqual(
      presentFor(v as never, BO, routines({}) as never, names({}) as never),
      [],
      "nobody placeable is an empty report",
    );
    assert.equal(renderPresentBlock([]), "", "and an empty report renders no block at all");
  }

  // ── The Engine's sentence has no path in ───────────────────────────────────
  // The hour here names a world this village has no room for, and the villager
  // DOES have a translation — of a different hour of their day. This is the case
  // that would leak if the block fell back to the raw activity, and it is the
  // reason the derivation reads only the village's own translation.
  {
    const v = village(
      [villager(HANA), villager(BO, remapFor("unloading", "unloading crates", "harbour", ELSEWHERE))],
      [home("home-bo", BO)],
    );
    const found = presentFor(
      v as never,
      HANA,
      routines({ [BO]: routine("in the cockpit of the Halcyon") }) as never,
      names({ [BO]: "Bo" }) as never,
    );
    const block = renderPresentBlock(found);
    assert.equal(found[0]!.people[0]!.doing, "", "an untranslated hour has nothing said about it at all");
    assert.equal(
      block.includes("Halcyon"),
      false,
      "the Engine's own sentence about another world never reaches the block",
    );
    assert.equal(block.includes("at home"), false, "and the village's own default is not used as a doing either");
    assert.equal(block.includes("- At home: Bo"), true, "a home with nothing said about it is just the person's name");
  }

  // ── A deleted card keeps its name ──────────────────────────────────────────
  // The library's name map wins, and a villager whose card has gone is named from
  // their own cached name rather than dropped: they are still standing somewhere.
  {
    const v = village([villager(HANA), villager(BO, remapFor("unloading", "unloading crates", "harbour"))]);
    const found = presentFor(v as never, HANA, routines({ [BO]: routine("unloading") }) as never, names({}) as never);
    assert.equal(
      found[0]!.people[0]!.name,
      `the one called ${BO}`,
      "a villager whose card is gone is named from the cache the field exists for",
    );
  }

  // ── The cap ────────────────────────────────────────────────────────────────
  // Two caps, because they are two different crowds: a village scattered across
  // forty places, and one room with a dozen people in it. Either on its own would
  // put the roster's own problem back in the block that exists to be shorter.
  {
    const crowd = Array.from({ length: MAX_PRESENT_PEOPLE_PER_PLACE + 3 }, (_, index) => `character-${index}`);
    const v = village(crowd.map((id) => villager(id, remapFor("unloading", "unloading crates", "harbour"))));
    const found = presentFor(
      v as never,
      HANA,
      routines(Object.fromEntries(crowd.map((id) => [id, routine("unloading")]))) as never,
      names(Object.fromEntries(crowd.map((id) => [id, id]))) as never,
    );
    assert.equal(
      found[0]!.people.length,
      crowd.length,
      "the derivation keeps everybody; the cap is a rendering choice, not a fact about the room",
    );
    assert.equal(
      renderPresentBlock(found).split("; ").length,
      MAX_PRESENT_PEOPLE_PER_PLACE,
      "a crowded room names only as many people as the block may hold",
    );

    const scattered: unknown[] = [];
    const scatteredRoutines: Record<string, unknown> = {};
    const scatteredNames: Record<string, string> = {};
    for (let index = 0; index < MAX_PRESENT_PLACES + 3; index += 1) {
      const id = `character-far-${index}`;
      scattered.push(villager(id, remapFor("unloading", `working at place ${index}`, `place-${index}`)));
      scatteredRoutines[id] = routine("unloading");
      scatteredNames[id] = id;
    }
    const wide = {
      venues: Array.from({ length: MAX_PRESENT_PLACES + 3 }, (_, index) => venue(`place-${index}`, `place ${index}`)),
      homes: [],
      villagers: scattered,
    };
    const wideBlock = renderPresentBlock(
      presentFor(wide as never, HANA, routines(scatteredRoutines) as never, names(scatteredNames) as never),
    );
    assert.equal(
      wideBlock.split("\n- ").length - 1,
      MAX_PRESENT_PLACES,
      "a village scattered across more places than the block holds names only the first few",
    );
  }

  // ── What the block says, and what it refuses to say ────────────────────────
  {
    const v = village(
      [
        villager(HANA, remapFor("grinding the grain", "grinding the week's flour", "mill")),
        villager(BO, remapFor("unloading", "swapping the day's salt", "mill")),
        // Cass is the one whose hour the village cannot say, so their translation
        // answers a different hour of the day and the phrase it carries for that
        // hour — "mending the nets" — must not be borrowed for this one.
        villager(CASS, remapFor("mending", "mending the nets", "harbour", ELSEWHERE)),
      ],
      [home("home-cass", CASS)],
    );
    const block = renderPresentBlock(
      presentFor(
        v as never,
        HANA,
        routines({
          [HANA]: routine("grinding the grain"),
          [BO]: routine("unloading"),
          [CASS]: routine("asleep"),
        }) as never,
        names({ [HANA]: "Hana", [BO]: "Bo", [CASS]: "Cass" }) as never,
      ),
    );
    assert.equal(block.startsWith("## Who is around\n"), true, "the block has a heading of its own");
    assert.equal(
      block.includes("- Here with you, at the mill: Bo, swapping the day's salt"),
      true,
      "the speaker's own room is named as a room, with the village's phrase for what each person is at",
    );
    assert.equal(block.includes("- At home: Cass"), true, "a home is said as a home rather than by the building");
    assert.equal(
      block.includes("Small home"),
      false,
      "the building's name is never printed — every home in the village is the same building, so naming it would repeat one line per occupied house",
    );
    assert.equal(
      block.includes("mending the nets"),
      false,
      "and nobody else's hour is borrowed for a person the village placed at home",
    );
  }

  // ── The macro is offered, shipped, and wired ───────────────────────────────
  // The tab reads the macro list to draw its buttons and the default knowledge
  // box names the token, so a block nobody can insert is a block nobody gets.
  {
    assert.equal(
      VILLAGE_PRESET_MACROS.some((macro) => macro.token === "{{present}}"),
      true,
      "the tab offers {{present}}",
    );
    assert.equal(VILLAGES_DEFAULT_KNOWLEDGE.includes("{{present}}"), true, "and the shipped knowledge box carries it");
    assert.equal(
      VILLAGES_DEFAULT_KNOWLEDGE.includes("{{roster}}\n{{present}}"),
      true,
      "immediately after the roster it corrects, because the two are read as one answer",
    );
    assert.equal(
      resolveVillagePrompt("").includes("{{present}}"),
      true,
      "a village that has written nothing gets the shipped block",
    );

    // The wiring itself: `present` is filled from the caller's groups and not
    // from the roster, which is the one edit whose absence would leave the macro
    // resolving to nothing while every function above still passed.
    const values = buildPromptValues({
      char: "Hana",
      village: "Willowbrook",
      setting: "",
      venues: [venue("mill", "the mill")],
      homes: [],
      playerName: "",
      playerDescription: "",
      time: "an autumn morning",
      weather: "clear",
      doing: { activity: "", routineSummary: "", status: "", today: [] },
      agenda: null,
      noticeboard: [],
      happenings: [],
      memory: [],
      foundedAt: "2026-09-01T00:00:00.000Z",
      moment: {
        dayIndex: 0,
        hour: 9,
        minute: 0,
        minuteOfDay: 540,
        dayPhase: "morning",
        localTime: "09:00",
        timeZone: "America/Los_Angeles",
        instant: "2026-09-01T16:00:00.000Z",
        nextTransitionAt: "2026-09-01T16:01:00.000Z",
        weather: "clear",
      } as never,
      roster: ["Bo — the one at the mill"],
      present: [
        {
          id: "mill",
          name: "the mill",
          kind: "venue",
          here: true,
          people: [{ characterId: BO, name: "Bo", doing: "swapping the day's salt" }],
        },
      ],
      lore: [],
    });
    assert.equal(values.present.includes("## Who is around"), true, "the gathered value is the rendered block");
    assert.equal(
      values.present.includes("Bo"),
      true,
      "and it is the caller's groups rather than the roster that reached it",
    );
    assert.equal(renderVillagePrompt("A{{present}}B", values), `A${values.present}B`, "the macro resolves to it");
    assert.equal(
      renderVillagePrompt("A{{roster}}B{{present}}C", { ...values, present: "" }),
      `A${values.roster}BC`,
      "an empty {{present}} leaves nothing behind where the block would have been",
    );
    assert.equal(
      resolveVillagePrompt("").startsWith("You are {{char}}, and you live in {{village}}."),
      true,
      "and the shipped box is still the one it renders from",
    );
  }

  console.log("villages-room-occupancy: ok");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
