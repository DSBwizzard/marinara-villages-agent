// Villages — proof for the narration lane: the player's own Engine preset, read
// out of the Engine and assembled into a villager's turn.
//
// Two things are being proven here and they are worth naming apart.
//
// The READER is `narration-preset.ts`, which turns a preset document — a preset
// row plus its sections, groups and choice blocks, exactly as the Engine's
// `/api/prompts/:id/full` answers them — into the document the assembler uses.
// The Engine's rows are SQLite rows: JSON columns arrive as TEXT, booleans arrive
// as whatever the driver made of them, disabled rows arrive anyway, and a marker
// can name a type this package has never heard of. Every one of those cases is a
// case below, because every one of them is a preset a player can have.
//
// The ASSEMBLER is `narration-prompt.ts`, which is the Engine's prompt pipeline
// ported: grouping, merging, squashing, depth injection, strict roles, depth
// sections, single-user mode, and the two repairs this package makes on top of a
// preset that left out its character or its history.
//
// The host is a plain HTTP server standing in for the Engine's loopback API and
// a document store standing in for the package's own records. No fastify, no
// Engine checkout, no model: everything here is decided by code this package
// owns, and a suite that needed the Engine running to prove it would be proving
// the Engine instead.
import assert from "node:assert/strict";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

async function main() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const load = (relative: string) => import(pathToFileURL(join(repoRoot, relative)).href);
  const services = "packages/villages/src/engine/packages/server/src/services/villages";

  const {
    CHARACTER_FIELD_NAMES,
    NARRATION_BUILT_IN_LABEL,
    NARRATION_BUILT_IN_PRESET,
    NARRATION_BUILT_IN_TEMPERATURE,
    NARRATION_MAX_TOKENS,
    NARRATION_REPLY_LENGTH_DEFAULT,
    characterFieldValue,
    coerceNarrationAnswers,
    parseNarrationParameters,
    readNarrationPreset,
    readNarrationPresetPicker,
    resolveNarrationChoices,
  } = await load(`${services}/narration-preset.ts`);
  const { assembleNarrationMessages, wrapContent, wrapGroup } = await load(`${services}/narration-prompt.ts`);
  const {
    DEFAULT_VILLAGE_VOICE_GUIDANCE,
    builtInNarrationTurn,
    coerceVillageNarrationSettings,
    defaultVillageNarrationSettings,
    readVillageNarration,
    readVillageNarrationSettings,
    saveVillageNarration,
    saveVillageNarrationSettings,
    villageNarrationForTurn,
  } = await load(`${services}/narration-settings.ts`);
  const { activate, selfCheck } = await load(`${services}/server-entry.ts`);

  // ── The Engine double ──────────────────────────────────────────────────────
  //
  // `villageEngineBaseUrl` is built from `PORT`, so a server on any port is the
  // Engine as far as the package is concerned. Two routes are all this lane
  // uses: the preset list the picker draws, and one preset's full document.
  const logger = {
    debug() {},
    info() {},
    warn() {},
    error() {},
    debugOverride() {},
  };
  let presetDocument: unknown = null;
  let promptList: unknown = { presets: [] };
  let promptListFails = false;
  let presetReadFails = false;

  const engine = createServer((request: IncomingMessage, response: ServerResponse) => {
    const url = request.url ?? "";
    const send = (status: number, body: unknown) => {
      response.writeHead(status, { "content-type": "application/json" });
      response.end(JSON.stringify(body));
    };
    if (url === "/api/prompts/" || url === "/api/prompts") {
      if (promptListFails) return send(500, { error: "no" });
      return send(200, promptList);
    }
    if (/^\/api\/prompts\/[^/]+\/full$/.test(url)) {
      if (presetReadFails) return send(500, { error: "no" });
      if (presetDocument === null) return send(404, { error: "no such preset" });
      return send(200, presetDocument);
    }
    return send(404, { error: "not found" });
  });
  await new Promise<void>((resolve) => engine.listen(0, "127.0.0.1", resolve));
  const address = engine.address();
  assert.ok(address !== null && typeof address === "object", "the Engine double has to have a port");
  const previousPort = process.env.PORT;
  process.env.PORT = String(address.port);

  // ── The document store double ──────────────────────────────────────────────
  const documentsByKey = new Map<string, any>();
  const key = (packageId: string, id: string) => `${packageId}::${id}`;
  let documentsFail = false;
  const documents = {
    async list(packageId: string, kind: string) {
      if (documentsFail) throw new Error("the store is down");
      return [...documentsByKey.values()].filter((row) => row.packageId === packageId && row.kind === kind);
    },
    async getById(packageId: string, id: string) {
      if (documentsFail) throw new Error("the store is down");
      return documentsByKey.get(key(packageId, id)) ?? null;
    },
    async create(input: any) {
      const stored = key(input.packageId, input.id);
      if (documentsByKey.has(stored)) throw new Error("UNIQUE constraint failed: capability_documents.id");
      const row = { ...input, revision: 1 };
      documentsByKey.set(stored, row);
      return row;
    },
    async update(input: any) {
      const stored = key(input.packageId, input.id);
      const current = documentsByKey.get(stored);
      if (!current || current.revision !== input.expectedRevision) return null;
      const next = { ...current, ...input, revision: current.revision + 1 };
      documentsByKey.set(stored, next);
      return next;
    },
    async remove(packageId: string, id: string, expectedRevision: number) {
      const stored = key(packageId, id);
      const current = documentsByKey.get(stored);
      if (!current || current.revision !== expectedRevision) return false;
      documentsByKey.delete(stored);
      return true;
    },
  };

  const context = {
    api: {
      runtime: {
        logger,
        persistence: { documents, listChats: async () => [] },
        resources: {},
        languageModels: {},
        json: Object.freeze({ parseJsonish: (raw: string) => JSON.parse(raw) }),
        async getAgentConfig() {
          return { connectionId: "connection-assigned" };
        },
        isDebugAgentsEnabled() {
          return false;
        },
      },
      // The routes are not what this file proves: every entry point below is the
      // function the route calls, and the route is three lines of plumbing around
      // it. Not mounting fastify keeps this suite runnable with no Engine
      // checkout at all, which is the point of it being a separate suite.
      async registerPrivilegedRoutes() {
        return () => {};
      },
    },
  } as any;

  let tornDown = false;
  const tearDown = async () => {
    if (tornDown) return;
    tornDown = true;
    await cleanup();
    await new Promise<void>((resolve) => engine.close(() => resolve()));
    if (previousPort === undefined) delete process.env.PORT;
    else process.env.PORT = previousPort;
  };

  const cleanup = await activate(context);
  await selfCheck();

  try {
    // ── The card and the player ──────────────────────────────────────────────
    const hana = {
      name: "Hana",
      description: "Hana keeps bees.",
      personality: "Blunt, warm, endlessly curious.",
      scenario: "The apiary at the edge of town.",
      backstory: "",
      appearance: "",
      systemPrompt: "Always speak as Hana.",
      exampleDialogue: "Hana: The bees know when rain is coming.",
    };
    const robin = { name: "Robin", description: "A cartographer, sunburnt." };
    const values = { char: "Hana", village: "Willowbrook", user: "Robin" };
    const history = [
      { role: "user" as const, content: "Will it rain?" },
      { role: "assistant" as const, content: "By evening, I wager." },
    ];

    /** The fixture every assembler case starts from, unless it says otherwise. */
    const assemble = (over: Record<string, unknown> = {}) =>
      assembleNarrationMessages({
        preset: NARRATION_BUILT_IN_PRESET,
        card: hana,
        player: robin,
        knowledge: "Hana of Willowbrook keeps bees.",
        history,
        message: "And the wind?",
        turnBlock: "## Right now\nAnswer the question asked.",
        choices: {},
        values,
        speakerId: "character-hana",
        ...over,
      } as any);

    const loreOnce = assemble({ lore: "Bridge: The old stone bridge crosses the harbor." });
    assert.equal(
      loreOnce
        .map((message: any) => message.content)
        .join("\n")
        .split("The old stone bridge crosses the harbor.").length - 1,
      1,
      "the built-in lorebook marker emits selected lore once",
    );

    // ── Caps and the shipped preset ──────────────────────────────────────────
    //
    // The cap is the Engine's own default for a preset, and it replaced 700 and
    // 800. The greeting used to answer on the smallest budget in the package,
    // which a model that reasons before it speaks spent on the reasoning.
    assert.equal(NARRATION_MAX_TOKENS, 4096);
    assert.equal(NARRATION_REPLY_LENGTH_DEFAULT, "cap", "the package's own cap is what a village gets without asking");
    assert.equal(NARRATION_BUILT_IN_TEMPERATURE, 0.85);

    assert.equal(NARRATION_BUILT_IN_PRESET.id, "");
    assert.equal(NARRATION_BUILT_IN_PRESET.name, NARRATION_BUILT_IN_LABEL);
    assert.equal(NARRATION_BUILT_IN_PRESET.wrapFormat, "xml", "the Engine's own default, so tags read as tags");
    assert.equal(NARRATION_BUILT_IN_PRESET.parameters.temperature, NARRATION_BUILT_IN_TEMPERATURE);
    assert.equal(
      NARRATION_BUILT_IN_PRESET.parameters.maxTokens,
      NARRATION_MAX_TOKENS,
      "the shipped preset and the package's cap are the same number rather than two numbers that agree today",
    );
    assert.deepEqual(
      NARRATION_BUILT_IN_PRESET.sections.map((section: any) => section.marker?.type ?? null),
      ["lorebook", "character", null, "dialogue_examples", "chat_history"],
      "the village, the card, the register note, the card's own lines, the conversation — in that order",
    );
    assert.equal(
      NARRATION_BUILT_IN_PRESET.sections.at(-1)?.role,
      "user",
      "the history section is a user turn, because that is the role a transcript is read in",
    );
    assert.deepEqual(CHARACTER_FIELD_NAMES, [
      "description",
      "personality",
      "scenario",
      "backstory",
      "appearance",
      "system_prompt",
    ]);
    assert.deepEqual(
      NARRATION_BUILT_IN_PRESET.sections[1].marker?.characterFields,
      CHARACTER_FIELD_NAMES,
      "the shipped preset's card marker asks for the whole card, in the order a card is written",
    );
    assert.equal(
      characterFieldValue(hana, "name"),
      "",
      "a preset that names `name` gets nothing rather than the character's name printed inside their own card",
    );
    assert.equal(characterFieldValue(hana, "post_history_instructions"), "");
    assert.equal(characterFieldValue(hana, "personality"), hana.personality);
    assert.equal(
      characterFieldValue(hana, "systemPrompt"),
      hana.systemPrompt,
      "the field is `system_prompt` in a preset and camelCase in a card, and both spellings are the same field",
    );

    // ── Parameters ───────────────────────────────────────────────────────────
    //
    // Read field by field rather than all-or-nothing, which is the Engine's own
    // posture: one unreadable number must cost the player that number and not
    // their temperature, their effort and their cap together.
    assert.deepEqual(parseNarrationParameters(null), {
      temperature: 1,
      maxTokens: NARRATION_MAX_TOKENS,
      reasoningEffort: null,
      verbosity: null,
      temperatureEnabled: true,
      reasoningEffortEnabled: true,
      verbosityEnabled: true,
      squashSystemMessages: true,
      strictRoleFormatting: true,
      singleUserMessage: false,
    });
    assert.deepEqual(
      parseNarrationParameters(JSON.stringify({ temperature: 0.4, maxTokens: 900, reasoningEffort: "maximum" })),
      parseNarrationParameters({ temperature: 0.4, maxTokens: 900, reasoningEffort: "maximum" }),
      "a JSON column arrives as text and a hand-built double may hand over the object; both read the same",
    );
    assert.equal(
      parseNarrationParameters({ temperature: 0.4, maxTokens: 900 }).maxTokens,
      900,
      "and a preset that names its own cap is taken at its word",
    );
    assert.equal(
      parseNarrationParameters({ reasoningEffort: "maximum" }).reasoningEffort,
      "max",
      "the Engine stores `maximum` and the capability call takes `max`, and read across unchanged the biggest setting is the one dropped",
    );
    assert.equal(parseNarrationParameters({ reasoningEffort: "enormous" }).reasoningEffort, null);
    assert.equal(parseNarrationParameters({ verbosity: "high" }).verbosity, "high");
    assert.equal(parseNarrationParameters({ verbosity: "nope" }).verbosity, null);
    assert.equal(
      parseNarrationParameters({ temperature: 40 }).temperature,
      2,
      "a temperature outside the range is clamped",
    );
    assert.equal(
      parseNarrationParameters({ temperature: "warm" }).temperature,
      1,
      "and an unreadable one is the default",
    );
    assert.equal(parseNarrationParameters({ maxTokens: -3 }).maxTokens, 1);
    assert.deepEqual(
      parseNarrationParameters({ enabledParameters: { temperature: false, verbosity: false } }),
      {
        ...parseNarrationParameters(null),
        temperatureEnabled: false,
        verbosityEnabled: false,
      },
      "a switch is on unless the preset turned it off, which is what an empty `enabledParameters` means",
    );
    assert.equal(
      parseNarrationParameters({ enabledParameters: { temperature: "false" } }).temperatureEnabled,
      true,
      'the string `"false"` is not `false`: only a real boolean off is off',
    );
    assert.equal(parseNarrationParameters({ squashSystemMessages: false }).squashSystemMessages, false);
    assert.equal(
      parseNarrationParameters({ squashSystemMessages: "false" }).squashSystemMessages,
      false,
      "here a string off is off, because a stored row is text more often than it is a boolean",
    );
    assert.equal(
      parseNarrationParameters({ singleUserMessage: "true" }).singleUserMessage,
      true,
      "and the three structural switches take the same shape of answer as the flags on a row",
    );

    // ── Answers ──────────────────────────────────────────────────────────────
    assert.deepEqual(coerceNarrationAnswers(null), {});
    assert.deepEqual(
      coerceNarrationAnswers("[]"),
      {},
      "an array is not an answers map, and `asRecord` would happily make it one",
    );
    assert.deepEqual(coerceNarrationAnswers('{"tense":"Past"}'), { tense: "Past" });
    assert.deepEqual(
      coerceNarrationAnswers('{"tags":["a","a","b"],"empty":[]}'),
      { tags: ["a", "b"] },
      "a repeated value is one value, and an empty list is no answer at all",
    );

    // ── Choices ──────────────────────────────────────────────────────────────
    //
    // Precedence: what the player answered, then what the preset saved as its own
    // default, then the first option — and the third step is not a fallback added
    // here, it is what the Engine does, so a choice variable always reads as
    // something rather than leaving `{{tense}}` in the prompt.
    const tense: any = {
      variableName: "tense",
      question: "Which tense?",
      options: [
        { value: "Past", label: "Past" },
        { value: "Present", label: "Present" },
      ],
      multiSelect: false,
      separator: ", ",
      randomPick: false,
      displayMode: "auto",
      optionSort: "manual",
    };
    const tags: any = {
      variableName: "tags",
      question: "Which tags?",
      options: [
        { value: "slow", label: "Slow burn" },
        { value: "warm", label: "Warm" },
      ],
      multiSelect: true,
      separator: " / ",
      randomPick: false,
      displayMode: "buttons",
      optionSort: "manual",
    };
    assert.deepEqual(resolveNarrationChoices([tense], {}, { tense: "Present" }), { tense: "Present" });
    assert.deepEqual(
      resolveNarrationChoices([tense], { tense: "Present" }, {}),
      { tense: "Present" },
      "the preset's own saved default answers when the player has not",
    );
    assert.deepEqual(
      resolveNarrationChoices([tense], {}, {}),
      { tense: "Past" },
      "and with nothing said anywhere the first option is the answer",
    );
    assert.deepEqual(
      resolveNarrationChoices([tense], { tense: "Present" }, { tense: "Future" }),
      { tense: "Present" },
      "an answer naming an option the preset has since renamed is not an answer, and falls through",
    );
    assert.deepEqual(
      resolveNarrationChoices([tags], {}, { tags: ["warm", "slow"] }),
      { tags: "warm / slow" },
      "several answers are joined with the preset's own separator",
    );
    assert.deepEqual(
      resolveNarrationChoices([tags], {}, { tags: "warm" }),
      { tags: "warm" },
      "and one answer to a question that allows several is still an answer",
    );
    assert.deepEqual(
      resolveNarrationChoices([tags], {}, { tags: ["gone"] }),
      { tags: "slow" },
      "a multi-select whose every entry is gone is unanswered",
    );
    assert.deepEqual(
      resolveNarrationChoices([{ ...tense, variableName: "t" }], {}, { t: ["Present", "Past"] }),
      { t: "Present" },
      "and a single-select handed several takes the first, which is what the Engine does with a stored list",
    );
    const random: any = { ...tags, randomPick: true };
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const picked = resolveNarrationChoices([random], {}, { tags: ["warm", "slow"] }).tags;
      assert.ok(
        picked === "warm" || picked === "slow",
        "a random pick picks one of the answers rather than joining them",
      );
    }

    // ── Wrapping ─────────────────────────────────────────────────────────────
    assert.equal(wrapContent("  Hello.  ", "Village", "xml"), "<village>\n    Hello.\n</village>");
    assert.equal(wrapContent("", "Village", "xml"), "", "nothing is not an empty wrapper");
    assert.equal(
      wrapContent("Hello.", "World Info (Before)", "xml"),
      "<world_info_before>\n    Hello.\n</world_info_before>",
    );
    assert.equal(wrapContent("Hello.", "Village", "markdown"), "## Village\nHello.", "a top-level block is a `##`");
    assert.equal(
      wrapContent("Hello.", "Description", "markdown", 2),
      "#### Description\nHello.",
      "a field inside a card is two levels deeper, which is where the Engine puts it",
    );
    assert.equal(wrapContent("Hello.", "Village", "none"), "Hello.");
    assert.equal(wrapContent("Hello.", "!!!", "xml"), "Hello.", "a name that slugs to nothing is left unwrapped");
    assert.equal(
      wrapGroup("One\n\nTwo", "Pair", "markdown"),
      "# Pair\nOne\n\nTwo",
      "a group is a `#`, above every section",
    );
    assert.equal(wrapGroup("One", "Pair", "xml"), "<pair>\n    One\n</pair>");
    assert.equal(wrapGroup("", "Pair", "xml"), "");

    // ── Reading a preset ─────────────────────────────────────────────────────
    //
    // Every fixture below is deliberately the shape the Engine really answers
    // with: the four collections in an envelope, JSON columns as TEXT, and a row
    // for every section including the ones the player switched off.
    const sectionOf = (over: Record<string, unknown>) => ({
      id: over.id ?? "s1",
      name: over.name ?? "Section",
      content: over.content ?? "",
      role: over.role ?? "system",
      enabled: over.enabled === undefined ? true : over.enabled,
      markerConfig: over.markerConfig === undefined ? null : over.markerConfig,
      groupId: over.groupId ?? "",
      injectionPosition: over.injectionPosition ?? "ordered",
      injectionDepth: over.injectionDepth ?? -1,
    });
    const presetRow = (over: Record<string, unknown> = {}) => ({
      id: "preset-1",
      name: "House style",
      wrapFormat: "xml",
      parameters: null,
      sectionOrder: null,
      variableValues: null,
      ...over,
    });
    const serve = (document: unknown) => {
      presetDocument = document;
    };
    const readOne = () => readNarrationPreset("preset-1");

    presetDocument = null;
    assert.equal(await readOne(), null, "a preset that is not there is no preset, not an error");
    presetReadFails = true;
    assert.equal(await readOne(), null, "and neither is an Engine that will not answer");
    presetReadFails = false;
    serve({ preset: presetRow(), sections: [], groups: [], choiceBlocks: [] });
    assert.equal(await readOne(), null, "a document with no readable section is not a prompt");
    assert.equal(await readNarrationPreset(""), null, "and the shipped preset is never a preset id");

    serve({
      preset: presetRow({ parameters: JSON.stringify({ temperature: 1.3, maxTokens: 700 }), wrapFormat: "markdown" }),
      sections: [
        sectionOf({
          id: "a",
          name: "First",
          content: "one",
          markerConfig: JSON.stringify({ type: "character", characterFields: ["personality"] }),
        }),
        sectionOf({ id: "b", name: "Second", content: "two", markerConfig: { type: "lorebook" } }),
        sectionOf({ id: "z", name: "Unlisted", content: "three" }),
      ],
      groups: [],
      choiceBlocks: [],
    });
    const read = await readOne();
    assert.equal(read.wrapFormat, "markdown");
    assert.equal(read.parameters.temperature, 1.3);
    assert.equal(read.parameters.maxTokens, 700);
    assert.equal(read.name, "House style");
    assert.equal(read.id, "preset-1");
    assert.deepEqual(
      read.sections.map((section: any) => section.name),
      ["First", "Second", "Unlisted"],
      "with no order column the rows read in the order the table holds them",
    );
    assert.equal(
      read.sections[0].identifier,
      "a",
      "sections are keyed by their row id, because that is what `sectionOrder` names",
    );
    assert.deepEqual(
      read.sections[0].marker,
      { type: "character", characterFields: ["personality"] },
      "a marker is read as the fields the preset named rather than as all six",
    );
    assert.deepEqual(
      read.sections[1].marker?.characterFields,
      CHARACTER_FIELD_NAMES,
      "and a marker with no field list of its own gets the shipped list",
    );
    assert.equal(read.sections[2].marker, null);

    serve({
      preset: presetRow({ sectionOrder: JSON.stringify(["b", "a"]) }),
      sections: [
        sectionOf({ id: "a", name: "First", content: "one" }),
        sectionOf({ id: "b", name: "Second", content: "two" }),
      ],
      groups: [],
      choiceBlocks: [],
    });
    assert.deepEqual(
      (await readOne()).sections.map((s: any) => s.name),
      ["Second", "First"],
      "the order is the player's own arrangement, which is a different thing from the order the rows arrive in",
    );

    serve({
      preset: presetRow({ sectionOrder: JSON.stringify(["b", "a"]) }),
      sections: [
        sectionOf({ id: "a", name: "First", content: "one" }),
        sectionOf({ id: "b", name: "Second", content: "two" }),
        sectionOf({ id: "z", name: "Unlisted", content: "three" }),
      ],
      groups: [],
      choiceBlocks: [],
    });
    assert.deepEqual(
      (await readOne()).sections.map((s: any) => s.name),
      ["Second", "First", "Unlisted"],
      "and a section the order never names is kept and put at the end rather than deleted",
    );

    serve({
      preset: presetRow(),
      sections: [
        sectionOf({ id: "a", name: "Off", content: "one", enabled: false }),
        sectionOf({ id: "b", name: "On", content: "two", enabled: "true" }),
        sectionOf({
          id: "c",
          name: "Unknown marker",
          content: "three",
          markerConfig: JSON.stringify({ type: "chat_summary" }),
        }),
        sectionOf({ id: "d", name: "Nothing under it", content: "", markerConfig: null }),
        // No name at all, rather than the helper's default one: a row with
        // nothing on it has no name to fall back to and is not a section.
        {
          id: "e",
          content: "",
          enabled: true,
          markerConfig: null,
          groupId: "",
          injectionPosition: "ordered",
          injectionDepth: -1,
        },
      ],
      groups: [
        { id: "g1", name: "Live", enabled: true, order: 0 },
        { id: "g2", name: "Dead", enabled: false, order: 1 },
      ],
      choiceBlocks: [],
    });
    const filtered = await readOne();
    assert.deepEqual(
      filtered.groups.map((group: any) => group.id),
      ["g1"],
      "a group switched off is not a group",
    );
    assert.deepEqual(
      filtered.sections.map((section: any) => section.name),
      ["On", "Unknown marker", "Nothing under it"],
      "a section switched off is dropped; a named section with nothing under it is KEPT, because the player can see it in their own editor; and a row with no name, no text and no marker is not a section at all",
    );
    assert.equal(
      filtered.sections[1].marker,
      null,
      "a marker this package has no door for is no marker, rather than a tag with nothing inside it",
    );
    assert.equal(filtered.sections[1].content, "three", "and the section's own text still goes in");
    assert.equal(
      filtered.sections[2].role,
      "system",
      "a role that is neither of the two a prompt has is a system message rather than a dropped section",
    );

    serve({
      preset: presetRow({ variableValues: JSON.stringify({ tense: "Present", gone: "x" }) }),
      sections: [sectionOf({ id: "a", name: "First", content: "one" })],
      groups: [],
      choiceBlocks: [
        {
          variableName: "tense",
          question: "Which tense?",
          options: JSON.stringify([{ value: "Past", label: "Past times" }, { value: "Present" }, { value: "" }]),
          multiSelect: "true",
          separator: " | ",
          randomPick: "false",
          displayMode: "listbox",
          optionSort: "alphabetical",
        },
        { variableName: "", question: "No name", options: JSON.stringify([{ value: "x" }]) },
        { variableName: "empty", question: "No options", options: "[]" },
      ],
    });
    const withChoices = await readOne();
    assert.deepEqual(withChoices.variableValues, { tense: "Present", gone: "x" });
    assert.equal(
      withChoices.choiceBlocks.length,
      1,
      "a question with no name and a question with nothing to choose are not questions",
    );
    assert.deepEqual(withChoices.choiceBlocks[0].options, [
      { value: "Past", label: "Past times" },
      { value: "Present", label: "Present" },
    ]);
    assert.equal(withChoices.choiceBlocks[0].multiSelect, true);
    assert.equal(withChoices.choiceBlocks[0].separator, " | ");
    assert.equal(withChoices.choiceBlocks[0].randomPick, false);
    assert.equal(withChoices.choiceBlocks[0].displayMode, "listbox");
    assert.equal(withChoices.choiceBlocks[0].optionSort, "alphabetical");
    assert.equal(
      (await readOne()).choiceBlocks[0].multiSelect,
      true,
      'the string `"true"` is a yes on a row, which is where cards and presets are stored as text',
    );

    // The picker reads a different route, and the label is this package's own: a
    // village is not a chat, so the default is not "The chat's own default".
    promptList = {
      presets: [
        { id: "preset-1", name: "House style" },
        { id: "", name: "" },
        { id: "preset-2", name: "   " },
        { id: "preset-3", name: "Terse" },
      ],
    };
    assert.deepEqual(await readNarrationPresetPicker(), {
      presets: [
        { id: "preset-1", name: "House style" },
        { id: "preset-3", name: "Terse" },
      ],
      builtInLabel: NARRATION_BUILT_IN_LABEL,
    });
    promptList = [{ id: "preset-4", name: "Bare array" }];
    assert.deepEqual((await readNarrationPresetPicker()).presets, [{ id: "preset-4", name: "Bare array" }]);
    promptListFails = true;
    assert.deepEqual(await readNarrationPresetPicker(), { presets: [], builtInLabel: NARRATION_BUILT_IN_LABEL });
    promptListFails = false;

    // ── The shipped preset over a real card ──────────────────────────────────
    //
    // The test of the whole lane: one villager's turn, assembled the way the
    // Engine assembles one, with the village's own material inside the preset's
    // wrapper rather than loose at the top of the prompt.
    const shipped = assemble();
    assert.equal(shipped[0].role, "system");
    const shippedSystem = String(shipped[0].content);
    assert.ok(shippedSystem.startsWith("<village>"), "the village's own knowledge leads, in the preset's own wrapper");
    assert.ok(shippedSystem.includes("<character>"));
    assert.ok(
      shippedSystem.includes("<hana>") && shippedSystem.includes("<system_prompt>"),
      "the card travels whole inside the character it belongs to, rather than leading the prompt where it reads as the host talking",
    );
    assert.ok(shippedSystem.includes("Always speak as Hana."));
    assert.ok(shippedSystem.includes("<how_they_speak>"), "the register note is a section of its own");
    assert.ok(shippedSystem.includes("<things_they_have_said>"));
    assert.ok(shippedSystem.includes("The bees know when rain is coming."));
    assert.ok(!shippedSystem.includes("{{"), "no macro reaches the model unexpanded");
    assert.deepEqual(
      shipped.slice(1).map((message: any) => message.role),
      ["user", "assistant", "system", "user"],
      "history as real turns, the turn block after them, and the player's newest line last",
    );
    assert.equal(
      String(shipped.at(-2).content),
      "## Right now\nAnswer the question asked.",
      "the turn block is its own message, so no preset can fold it into its own material",
    );
    assert.equal(String(shipped.at(-1).content), "<last_message>\n    And the wind?\n</last_message>");
    assert.equal(
      shipped.length,
      5,
      "and the transcript's own line is not also appended as text: the marker is where the newest line goes",
    );
    assert.ok(String(shipped[1].content).startsWith("<chat_history>"), "the transcript opens inside its first line");
    assert.ok(
      String(shipped[2].content).endsWith("</chat_history>"),
      "and closes inside its second-to-last, so the newest line is held apart from the record",
    );

    // A card with nothing in a field gets no heading for it, because a heading
    // over nothing teaches a model that headings mean nothing.
    assert.ok(!shippedSystem.includes("<backstory>"));
    assert.ok(!shippedSystem.includes("Backstory"));

    // ── The two repairs ──────────────────────────────────────────────────────
    //
    // Both are the same kind of thing: the preset left out something the surface
    // it was written for supplies elsewhere. A villager who cannot see the last
    // thing the player said is not a design decision, and neither is a villager
    // with no name.
    const noHistory = {
      ...NARRATION_BUILT_IN_PRESET,
      sections: NARRATION_BUILT_IN_PRESET.sections.filter((section: any) => section.marker?.type !== "chat_history"),
    };
    const repairedHistory = assemble({ preset: noHistory });
    assert.equal(repairedHistory.length, 3, "the transcript is handed over rather than dropped");
    assert.ok(
      String(repairedHistory[0].content).endsWith("Robin: Will it rain?\nHana: By evening, I wager."),
      "appended to the prompt block, so the preset's own instructions stay at the top of it",
    );
    assert.equal(
      String(repairedHistory.at(-1).content),
      "And the wind?",
      "and the player's line goes on the end unwrapped, because there was no marker to put it in",
    );
    assert.equal(
      String(repairedHistory.at(-2).content),
      "## Right now\nAnswer the question asked.",
      "with the turn block still before it",
    );

    const noCharacter = {
      ...NARRATION_BUILT_IN_PRESET,
      sections: NARRATION_BUILT_IN_PRESET.sections.filter((section: any) => section.marker?.type !== "character"),
    };
    const repairedCharacter = assemble({ preset: noCharacter });
    assert.ok(
      String(repairedCharacter[0].content).includes("<hana>"),
      "and the card is put in front of whatever the preset did order",
    );

    // A section whose marker the village cannot fill produces NOTHING — not an
    // empty wrapper. `world_info_before` is a door onto the village's knowledge,
    // and a village with none must not open a tag with nothing inside it.
    const unfillable = {
      preset: {
        ...NARRATION_BUILT_IN_PRESET,
        sections: [
          {
            identifier: "a",
            name: "Empty",
            content: "",
            role: "system",
            marker: { type: "world_info_before", characterFields: [] },
            groupId: "",
            injectionPosition: "ordered",
            injectionDepth: -1,
          },
          {
            identifier: "b",
            name: "Filled",
            content: "{{char}} is here.",
            role: "system",
            marker: null,
            groupId: "",
            injectionPosition: "ordered",
            injectionDepth: -1,
          },
        ],
      },
      knowledge: "",
    };
    const unfilled = assemble(unfillable);
    assert.equal(
      unfilled.length,
      3,
      "one prompt block, the turn block, and the player's line — the empty section contributed nothing at all",
    );
    assert.ok(!String(unfilled[0].content).includes("<empty>"), "an unfillable marker is not an empty wrapper");
    assert.ok(
      String(unfilled[0].content).includes("Hana is here."),
      "and a section with no marker is the player's own writing, macro-folded",
    );

    // ── Groups ───────────────────────────────────────────────────────────────
    //
    // A group is emitted where its FIRST member was, because that is where the
    // player dragged it. The transcript is the one member never grouped: wrapping
    // a conversation in a container would put roles a provider has to see inside
    // a heading.
    const grouped = assemble({
      preset: {
        ...NARRATION_BUILT_IN_PRESET,
        wrapFormat: "markdown",
        groups: [{ id: "g1", name: "Framing", enabled: true, order: 0 }],
        sections: [
          {
            identifier: "a",
            name: "One",
            content: "first",
            role: "system",
            marker: null,
            groupId: "g1",
            injectionPosition: "ordered",
            injectionDepth: -1,
          },
          {
            identifier: "b",
            name: "Two",
            content: "second",
            role: "system",
            marker: null,
            groupId: "g1",
            injectionPosition: "ordered",
            injectionDepth: -1,
          },
          {
            identifier: "c",
            name: "Loose",
            content: "third",
            role: "system",
            marker: null,
            groupId: "",
            injectionPosition: "ordered",
            injectionDepth: -1,
          },
        ],
        parameters: { ...NARRATION_BUILT_IN_PRESET.parameters, squashSystemMessages: false },
      },
    });
    const groupedSystem = String(grouped[0].content);
    assert.ok(
      groupedSystem.includes("# Framing\n## One\nfirst\n\n## Two\nsecond"),
      "two grouped sections arrive under one heading of the group's name, above the sections' own `##`",
    );
    assert.ok(
      groupedSystem.includes("\n## Loose\nthird"),
      "and the ungrouped one follows it as a section rather than inside the group's heading",
    );

    const deadGroup = assemble({
      preset: {
        ...NARRATION_BUILT_IN_PRESET,
        groups: [],
        sections: [
          {
            identifier: "a",
            name: "One",
            content: "first",
            role: "system",
            marker: null,
            groupId: "g1",
            injectionPosition: "ordered",
            injectionDepth: -1,
          },
          {
            identifier: "b",
            name: "Loose",
            content: "second",
            role: "system",
            marker: null,
            groupId: "",
            injectionPosition: "ordered",
            injectionDepth: -1,
          },
        ],
      },
    });
    assert.ok(
      !String(deadGroup[0].content).includes("first"),
      "a section in a group the reader dropped is a section in a group the player switched off",
    );

    // ── The three structural switches ───────────────────────────────────────
    //
    // The invariant that matters is the one these two passes buy together: a
    // preset with eight system sections must not reach the model as eight system
    // messages. The merge pass is what actually joins neighbours, and the squash
    // pass folds a LEADING RUN that the merge pass had a reason to leave apart —
    // so this is asserted on the invariant, under both settings, rather than on a
    // count that depends on which of the two did the work.
    const manySections = {
      ...NARRATION_BUILT_IN_PRESET,
      sections: [...Array(8)].map((_, index) => ({
        identifier: `many-${index}`,
        name: `Section ${index}`,
        content: `line ${index}`,
        role: "system",
        marker: null,
        groupId: "",
        injectionPosition: "ordered",
        injectionDepth: -1,
      })),
    };
    const mashed = assemble({ preset: manySections });
    const mashedSystem = mashed.filter((message: any) => message.role === "system");
    assert.equal(
      mashedSystem.length,
      2,
      "eight sections, the repaired card and the repaired transcript arrive as ONE prompt block, beside the turn block rather than among it",
    );
    assert.ok(String(mashedSystem[0].content).includes("line 7"), "and nothing was dropped on the way");
    assert.equal(String(mashedSystem[1].content), "## Right now\nAnswer the question asked.");
    assert.deepEqual(
      assemble({
        preset: { ...manySections, parameters: { ...manySections.parameters, squashSystemMessages: false } },
      }),
      mashed,
      "and switching the squash off changes nothing HERE, because the merge pass had already joined every one of them: the switch tidies a leading run, it is not what stops a preset arriving as eight messages",
    );

    // Two villager lines in a row. They are one speaker's run, so they arrive as
    // one turn: a provider that rejects two turns in a row, or a model that reads
    // its own answer as something the player said, is the reason the pass exists.
    const twoVillagerLines = [
      { role: "user" as const, content: "Hello." },
      { role: "assistant" as const, content: "Evening." },
      { role: "assistant" as const, content: "Mind the step." },
    ];
    const strict = assemble({ history: twoVillagerLines, message: null });
    assert.deepEqual(
      strict.map((message: any) => message.role),
      ["system", "user", "assistant", "system"],
      "one villager speaking twice is one turn, with the player's own line still its own turn",
    );
    assert.equal(
      String(strict[2].content),
      "Evening.\n</chat_history>\n\n<last_message>\n    Mind the step.\n</last_message>",
      "and the join happens after the framing, so the record still closes on the line it closed on and the newest line keeps its own wrapper: a merge cannot blur where the record ended",
    );

    // The strict pass's own work, and the one place the two join passes differ: a
    // depth entry placed ABOVE the prompt block was injected after the merge pass
    // had already run, so only the strict pass can tidy the leading run it left.
    const topInjection = {
      ...NARRATION_BUILT_IN_PRESET,
      sections: [
        ...NARRATION_BUILT_IN_PRESET.sections,
        {
          identifier: "top",
          name: "Top",
          content: "AT THE TOP",
          role: "system",
          marker: null,
          groupId: "",
          injectionPosition: "depth",
          injectionDepth: 99,
        },
      ],
    };
    const strictTop = assemble({ preset: topInjection });
    assert.ok(
      String(strictTop[0].content).startsWith("<top>\n    AT THE TOP\n</top>\n\n<village>"),
      "a system message injected above the prompt block is folded into it, so the prompt still opens with ONE system message",
    );
    const looseTop = assemble({
      preset: { ...topInjection, parameters: { ...topInjection.parameters, strictRoleFormatting: false } },
    });
    assert.equal(
      String(looseTop[0].content),
      "<top>\n    AT THE TOP\n</top>",
      "and with the pass off the two are left standing apart, which is what a provider that wants them apart gets",
    );
    assert.ok(String(looseTop[1].content).startsWith("<village>"), "with the prompt block still where it was");

    const single = assemble({
      preset: {
        ...NARRATION_BUILT_IN_PRESET,
        parameters: { ...NARRATION_BUILT_IN_PRESET.parameters, singleUserMessage: true },
      },
    });
    assert.equal(single.length, 1, "single-user mode is one message, for the providers that reject a system role");
    assert.equal(single[0].role, "user");
    assert.ok(
      String(single[0].content).includes("System:\n"),
      "every speaker is labelled, because the one thing this mode gives up is roles",
    );
    assert.ok(String(single[0].content).includes("Hana:\nBy evening, I wager."));
    assert.ok(
      String(single[0].content).trimEnd().endsWith("## Right now\nAnswer the question asked."),
      "and the turn block is the last line of it, because the last line is the one that gets answered",
    );

    // ── Depth ────────────────────────────────────────────────────────────────
    //
    // Depth is counted backwards from the end of the transcript, which is the
    // only meaning that stays put as a conversation grows. Depth 0 is just after
    // the last transcript line; depth 2 is two lines further up.
    const depthPreset = {
      ...NARRATION_BUILT_IN_PRESET,
      sections: [
        ...NARRATION_BUILT_IN_PRESET.sections,
        {
          identifier: "d0",
          name: "Now",
          content: "AT ZERO",
          role: "system",
          marker: null,
          groupId: "",
          injectionPosition: "depth",
          injectionDepth: 0,
        },
        {
          identifier: "d2",
          name: "Earlier",
          content: "AT TWO",
          role: "system",
          marker: null,
          groupId: "",
          injectionPosition: "depth",
          injectionDepth: 2,
        },
      ],
    };
    const injected = assemble({ preset: depthPreset });
    assert.deepEqual(
      injected.map((message: any) => message.role),
      ["system", "user", "system", "assistant", "user", "system", "system"],
      "the two depth entries land inside the transcript rather than after it",
    );
    assert.equal(
      String(injected[2].content),
      "<earlier>\n    AT TWO\n</earlier>",
      "depth 2 sits two lines up from the end of the transcript, still wrapped in its own section",
    );
    assert.equal(
      String(injected[5].content),
      "<now>\n    AT ZERO\n</now>",
      "and depth 0 sits just after its last line",
    );
    assert.ok(
      String(injected[3].content).includes("By evening, I wager."),
      "so an entry is placed between turns, which is the whole reason depth exists",
    );
    assert.equal(
      String(injected.at(-1).content),
      "## Right now\nAnswer the question asked.",
      "and the turn block is still the last thing in the prompt, because it is placed after every pass that could move it",
    );

    // ── Choice variables in a section ────────────────────────────────────────
    const chosen = assemble({
      choices: { tense: "Present", mood: "weary" },
      values: { ...values, tense: "Past" },
      preset: {
        ...NARRATION_BUILT_IN_PRESET,
        sections: [
          {
            identifier: "a",
            name: "Tense",
            content: "Write in {{tense}}, about {{char}}, {{mood}}.",
            role: "system",
            marker: null,
            groupId: "",
            injectionPosition: "ordered",
            injectionDepth: -1,
          },
        ],
      },
    });
    assert.ok(
      String(chosen[0].content).includes("<tense>\n    Write in Past, about Hana, weary.\n</tense>"),
      "a preset's own choice variable resolves through the same single pass as a village macro — and on a collision the village's macro wins, because a question somebody named `char` must not take the card's name away",
    );

    // ── What a turn takes from the settings ──────────────────────────────────
    //
    // With nothing stored the shipped preset stands in, which is the path every
    // village that never opened the panel is on. It is also the path a village
    // whose store is unreachable is on, and that split is the point: a store that
    // hiccuped must cost a preference and not a conversation.
    assert.deepEqual(defaultVillageNarrationSettings(), {
      presetId: "",
      choices: {},
      replyLength: "cap",
      voiceGuidance: DEFAULT_VILLAGE_VOICE_GUIDANCE,
    });
    assert.deepEqual(coerceVillageNarrationSettings(null), defaultVillageNarrationSettings());
    assert.deepEqual(coerceVillageNarrationSettings({ presetId: 42, replyLength: "louder" }), {
      presetId: "",
      choices: {},
      replyLength: "cap",
      voiceGuidance: DEFAULT_VILLAGE_VOICE_GUIDANCE,
    });
    assert.deepEqual(await readVillageNarrationSettings(), defaultVillageNarrationSettings());

    const fresh = await villageNarrationForTurn();
    assert.equal(fresh.preset, NARRATION_BUILT_IN_PRESET);
    assert.equal(
      fresh.presetId,
      "",
      "a village on the shipped preset reports the shipped preset, not an id that was not used",
    );
    assert.equal(fresh.maxTokens, NARRATION_MAX_TOKENS);
    assert.equal(fresh.temperature, NARRATION_BUILT_IN_TEMPERATURE);
    assert.deepEqual(fresh.choices, {});

    serve({
      preset: presetRow({
        name: "Terse",
        parameters: JSON.stringify({
          temperature: 0.2,
          maxTokens: 512,
          reasoningEffort: "maximum",
          verbosity: "low",
          enabledParameters: { temperature: false },
        }),
        variableValues: JSON.stringify({ tense: "Past" }),
      }),
      sections: [sectionOf({ id: "a", name: "One", content: "one" })],
      groups: [],
      choiceBlocks: [
        {
          variableName: "tense",
          question: "Which tense?",
          options: JSON.stringify([{ value: "Past" }, { value: "Present" }]),
          multiSelect: false,
          separator: ", ",
          randomPick: false,
          displayMode: "auto",
          optionSort: "manual",
        },
      ],
    });
    await saveVillageNarrationSettings({ presetId: "preset-1" });
    const onPreset = await villageNarrationForTurn();
    assert.equal(onPreset.presetId, "preset-1");
    assert.equal(onPreset.preset.name, "Terse");
    assert.equal(
      onPreset.maxTokens,
      NARRATION_MAX_TOKENS,
      "the cap is still the package's own until the player says otherwise",
    );
    assert.equal(
      onPreset.temperature,
      null,
      "a preset that switched its temperature off hands over no temperature at all, which is not the same as handing over the default",
    );
    assert.equal(onPreset.reasoningEffort, "max");
    assert.equal(onPreset.verbosity, "low");
    assert.deepEqual(
      onPreset.choices,
      { tense: "Past" },
      "the preset's own saved answer is what the village writes in",
    );

    await saveVillageNarrationSettings({ replyLength: "preset" });
    assert.equal(
      (await villageNarrationForTurn()).maxTokens,
      512,
      "and the switch hands the cap to the preset's own number rather than to a second package constant",
    );
    await saveVillageNarrationSettings({ replyLength: "cap" });

    // A preset the player has since deleted is a preference and not a
    // conversation: the villager falls back to the shipped preset and reports it.
    await saveVillageNarrationSettings({ presetId: "preset-gone" });
    presetDocument = null;
    const missing = await villageNarrationForTurn();
    assert.equal(missing.preset, NARRATION_BUILT_IN_PRESET);
    assert.equal(missing.presetId, "", "so nothing downstream quotes a name for a preset that was not used");
    assert.equal(missing.maxTokens, NARRATION_MAX_TOKENS);
    assert.equal(missing.temperature, NARRATION_BUILT_IN_TEMPERATURE);

    documentsFail = true;
    const storeDown = await villageNarrationForTurn();
    assert.equal(
      storeDown.preset,
      NARRATION_BUILT_IN_PRESET,
      "and a store that will not answer costs the preference, not the reply",
    );
    await assert.rejects(
      readVillageNarration(),
      /the store is down/,
      "while the panel is told, because a settings screen that silently shows nothing is a lie",
    );
    documentsFail = false;

    // ── What the panel draws ─────────────────────────────────────────────────
    serve({
      preset: presetRow({
        name: "Terse",
        parameters: JSON.stringify({ maxTokens: 512 }),
      }),
      sections: [sectionOf({ id: "a", name: "One", content: "one" })],
      groups: [],
      choiceBlocks: [
        {
          variableName: "tense",
          question: "Which tense?",
          options: JSON.stringify([{ value: "Past", label: "Past times" }, { value: "Present" }]),
          multiSelect: true,
          separator: " | ",
          randomPick: true,
          displayMode: "listbox",
          optionSort: "alphabetical",
        },
      ],
    });
    promptList = { presets: [{ id: "preset-1", name: "House style" }] };
    await saveVillageNarrationSettings({ presetId: "preset-1", choices: { tense: ["Present"] } });
    const panel = await readVillageNarration();
    assert.equal(panel.presetId, "preset-1");
    assert.equal(panel.presetName, "Terse", "the panel names what was actually read, not what was stored");
    assert.equal(panel.presetMissing, false);
    assert.equal(panel.maxTokens, NARRATION_MAX_TOKENS);
    assert.equal(
      panel.presetMaxTokens,
      512,
      "both caps travel, because a switch that showed one of two numbers is not a choice",
    );
    assert.equal(panel.builtInLabel, NARRATION_BUILT_IN_LABEL);
    assert.deepEqual(panel.presets, [{ id: "preset-1", name: "House style" }]);
    assert.deepEqual(panel.choices, { tense: ["Present"] });
    assert.deepEqual(panel.questions, [
      {
        variableName: "tense",
        question: "Which tense?",
        options: [
          { value: "Past", label: "Past times" },
          { value: "Present", label: "Present" },
        ],
        multiSelect: true,
        separator: " | ",
        randomPick: true,
        displayMode: "listbox",
        optionSort: "alphabetical",
      },
    ]);

    presetDocument = null;
    const stale = await readVillageNarration();
    assert.equal(stale.presetMissing, true, "a preset deleted in the Engine is a state the panel says out loud");
    assert.equal(stale.presetName, NARRATION_BUILT_IN_LABEL);
    assert.deepEqual(stale.questions, [], "and the questions are the ones the preset actually in use asks");
    assert.equal(stale.presetMaxTokens, NARRATION_MAX_TOKENS);

    // ── Writing it from the panel ────────────────────────────────────────────
    //
    // Changing the preset clears the answers, and it is done in the store rather
    // than in the route so a second caller cannot forget it. An answer about
    // Tense is an answer about the questions THAT preset asked.
    serve({
      preset: presetRow(),
      sections: [sectionOf({ id: "a", name: "One", content: "one" })],
      groups: [],
      choiceBlocks: [],
    });
    await saveVillageNarrationSettings({ presetId: "preset-1", choices: { tense: "Present" } });
    assert.deepEqual((await readVillageNarrationSettings()).choices, { tense: "Present" });
    await saveVillageNarration({
      presetId: "preset-2",
      choices: { tense: "Present", pov: "Third" },
      replyLength: "preset",
    });
    assert.deepEqual((await readVillageNarrationSettings()).choices, { tense: "Present", pov: "Third" });
    await saveVillageNarration({ presetId: "preset-1" });
    assert.deepEqual(
      (await readVillageNarrationSettings()).choices,
      {},
      "a preset swap that kept the old answers would hand the new preset a Tense it never asked about",
    );
    await saveVillageNarration({ presetId: "preset-1" });
    await saveVillageNarration({ choices: { tense: "Past" } });
    assert.deepEqual(
      (await readVillageNarrationSettings()).choices,
      { tense: "Past" },
      "and a patch that did not name a preset leaves the answers alone",
    );
    assert.equal((await readVillageNarrationSettings()).presetId, "preset-1");
    assert.equal(
      (await saveVillageNarration({ presetId: "" })).presetId,
      "",
      "an empty id is always accepted: it is the shipped preset, and it is how a player undoes a choice",
    );
    await assert.rejects(
      saveVillageNarration({ presetId: "x".repeat(200) }),
      "a preset id the Engine could not hold is refused rather than stored and never read",
    );
    await assert.rejects(
      saveVillageNarration({ replyLength: "louder" }),
      "and so is a reply length this package does not have",
    );
    assert.equal((await readVillageNarrationSettings()).replyLength, "preset", "and a refused save changes nothing");

    // ── The scene lane's turn ────────────────────────────────────────────────
    //
    // A spin-off is an ordinary Engine roleplay chat whose register is the
    // CHAT's preset, so its opening is written on the shipped preset at the
    // numbers the scene lane has always used. What it takes from this module is
    // the assembler, not the settings.
    const scene = builtInNarrationTurn({ maxTokens: 800, temperature: 0.9 });
    assert.equal(scene.preset, NARRATION_BUILT_IN_PRESET);
    assert.equal(scene.presetId, "");
    assert.equal(scene.maxTokens, 800);
    assert.equal(scene.temperature, 0.9);
    assert.equal(scene.reasoningEffort, null);
    assert.equal(scene.verbosity, null);
    assert.deepEqual(scene.choices, {});
    assert.equal(
      builtInNarrationTurn({ maxTokens: 800, temperature: null }).temperature,
      null,
      "and a caller with no temperature passes none through",
    );

    console.log("Villages narration regression: preset reading, choices, assembly, settings ok");
  } finally {
    await tearDown();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
