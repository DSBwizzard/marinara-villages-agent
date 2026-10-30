import assert from "node:assert/strict";
import { readVillageLore, readVillageVisualLore } from "../packages/villages/src/server/adapters/engine/lorebooks.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  coerceLoreTokenBudget,
  coerceSelectedLorebookIds,
  readLoreTokenBudget,
  readSelectedLorebookIds,
} from "../packages/villages/src/server/domain/rules/lore-policy.js";
import { buildTownMapPrompt } from "../packages/villages/src/server/domain/rules/town-map-image-rules.js";
import { selectVillageLore, type LoreEntry } from "../packages/villages/src/server/domain/rules/lore-selection.js";
import { sharedLoreHistory } from "../packages/villages/src/server/domain/rules/scene-writing-history.js";
import { fitVenueWritingMessages } from "../packages/villages/src/server/domain/rules/venue-writing.js";
import { createSemanticService } from "../packages/villages/src/server/features/generation/semantic-service.js";

async function main() {
  assert.deepEqual(defaultVillageState().selectedLorebookIds, []);
  assert.deepEqual(coerceVillageState({ ...defaultVillageState(), wishSystemVersion: 3 }).selectedLorebookIds, []);
  assert.deepEqual(
    coerceVillageState({
      ...defaultVillageState(),

      wishSystemVersion: 3,
      selectedLorebookIds: ["world", "world", "missing"],
    }).selectedLorebookIds,
    ["world", "missing"],
  );
  assert.deepEqual(readSelectedLorebookIds([" world ", "world"]), ["world"]);
  assert.deepEqual(coerceSelectedLorebookIds("wrong shape"), []);

  assert.equal(defaultVillageState().loreTokenBudget, 1600);
  assert.equal(readLoreTokenBudget(0), 0);
  assert.equal(readLoreTokenBudget(100), 100);
  assert.equal(coerceLoreTokenBudget(0), 0);
  assert.equal(
    coerceVillageState({ ...defaultVillageState(), wishSystemVersion: 3, loreTokenBudget: 0 }).loreTokenBudget,
    0,
  );
  assert.throws(() => readLoreTokenBudget(-1));
  assert.throws(() => readLoreTokenBudget(1.5));
  assert.throws(() => readLoreTokenBudget(3201));
  const originalFetch = globalThis.fetch;
  let bridge = "The old stone bridge crosses the harbor.";
  const books = [
    { id: "world", name: "World", enabled: true },
    { id: "off", name: "Off", enabled: false },
  ];
  const entries = {
    world: [
      {
        id: "always",
        name: "Calendar",
        content: "The festival comes each spring.",
        enabled: true,
        folderId: null,
        constant: true,
        order: 1,
      },
      {
        id: "bridge",
        name: "Bridge",
        content: bridge,
        enabled: true,
        folderId: null,
        constant: false,
        keys: ["harbor"],
        useRegex: false,
        order: 2,
      },
      {
        id: "folded",
        name: "Closed",
        content: "A secret canal.",
        enabled: true,
        folderId: "child",
        constant: true,
        order: 3,
      },
      {
        id: "disabled",
        name: "Disabled",
        content: "Never use this.",
        enabled: false,
        folderId: null,
        constant: true,
        order: 4,
      },
      {
        id: "too-large",
        name: "Oversized",
        content: "z".repeat(10_000),
        enabled: true,
        folderId: null,
        constant: true,
        order: 5,
      },
    ],
    off: [
      { id: "off-entry", name: "Off entry", content: "Never use book.", enabled: true, folderId: null, constant: true },
    ],
  };
  const folders = {
    world: [
      { id: "parent", parentFolderId: null, enabled: false },
      { id: "child", parentFolderId: "parent", enabled: true },
    ],
    off: [],
  };
  globalThis.fetch = async (input) => {
    const path = new URL(String(input)).pathname;
    const data =
      path === "/api/lorebooks"
        ? books
        : path === "/api/lorebooks/world/entries"
          ? entries.world.map((entry) => (entry.id === "bridge" ? { ...entry, content: bridge } : entry))
          : path === "/api/lorebooks/world/folders"
            ? folders.world
            : path === "/api/lorebooks/off/entries"
              ? entries.off
              : path === "/api/lorebooks/off/folders"
                ? folders.off
                : null;
    return new Response(JSON.stringify(data), {
      status: data === null ? 404 : 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const picked = await readVillageLore(["world", "off"], "A harbor village");
    assert.equal(picked.length, 2);
    assert.ok(picked.some((line) => line.includes("festival")));
    assert.ok(picked.some((line) => line.includes("old stone bridge")));
    assert.ok(!picked.join(" ").includes("secret canal"));
    assert.ok(!picked.join(" ").includes("Never"));
    assert.ok(!picked.join(" ").includes("Oversized"), "oversized entries do not displace selected facts");
    await assert.rejects(
      readVillageLore(["world", "missing"], "A harbor village", undefined, 1_600),
      /Selected lorebooks are unavailable/,
    );
    assert.equal((await readVillageLore(["world"], "A harbor village", undefined, 200)).length, 2);
    assert.equal((await readVillageLore(["world"], "A mountain village")).length, 1);
    assert.deepEqual(await readVillageLore(["world"], "harbor", undefined, 0), []);
    assert.equal(await readVillageVisualLore(["world"], "harbor", 360, 0), "");
    entries.world[1]!.keys = ["harbor"];
    Object.assign(entries.world[1]!, {
      selective: true,
      secondaryKeys: ["absent"],
      selectiveLogic: "and",
      caseSensitive: true,
      matchWholeWords: true,
    });
    entries.world[1]!.useRegex = true;
    assert.equal(
      (await readVillageLore(["world"], "A HARBORSIDE village")).length,
      1,
      "authored regex is never executed or treated as a literal primary key",
    );
    Object.assign(entries.world[1]!, {
      selective: false,
      caseSensitive: false,
      matchWholeWords: false,
      useRegex: false,
    });
    assert.equal((await readVillageLore(["world"], "harbor")).length, 2);
    Object.assign(entries.world[1]!, { selective: true, secondaryKeys: ["fog"], selectiveLogic: "and" });
    assert.equal((await readVillageLore(["world"], "harbor fog")).length, 2);
    assert.equal((await readVillageLore(["world"], "harbor")).length, 1);
    Object.assign(entries.world[1]!, { selectiveLogic: "or" });
    assert.equal((await readVillageLore(["world"], "harbor fog")).length, 2);
    assert.equal((await readVillageLore(["world"], "harbor")).length, 1);
    Object.assign(entries.world[1]!, { selectiveLogic: "not" });
    assert.equal((await readVillageLore(["world"], "harbor")).length, 2);
    assert.equal((await readVillageLore(["world"], "harbor fog")).length, 1);
    Object.assign(entries.world[1]!, { selective: false });
    bridge = "The bridge is painted blue now.";
    assert.ok(
      (await readVillageLore(["world"], "harbor")).join(" ").includes("painted blue"),
      "the next call sees Engine edits",
    );
    const visual = await readVillageVisualLore(["world"], "harbor", 60);
    assert.ok(visual.length <= 60);
    assert.equal(
      visual,
      "Bridge: The bridge is painted blue now.",
      "relevant entries are complete and precede generic constants",
    );
    assert.match(buildTownMapPrompt(undefined, "harbor village", visual), /Compatible visual lore/);
    assert.throws(() => buildTownMapPrompt(undefined, "x".repeat(2_000), "y".repeat(500)), /4,000-character allowance/);
    globalThis.fetch = async () => new Response(JSON.stringify({ secret: "private-book-title" }), { status: 503 });
    await assert.rejects(readVillageLore(["world"], "harbor"), (error: any) => {
      assert.doesNotMatch(error.message, /private-book-title|503/);
      return /Selected lorebooks are unavailable/.test(error.message);
    });
    await assert.rejects(readVillageVisualLore(["world"], "harbor"), /Selected lorebooks are unavailable/);
    globalThis.fetch = async () => new Response("{}", { status: 200 });
    await assert.rejects(readVillageLore(["world"], "harbor"), /Selected lorebooks are unavailable/);
  } finally {
    globalThis.fetch = originalFetch;
  }

  const make = (id: string, patch: Partial<LoreEntry> = {}): LoreEntry => ({
    id,
    bookId: "book",
    name: id,
    content: "Complete fact.",
    enabled: true,
    folderEnabled: true,
    keys: [id],
    ...patch,
  });
  const query = { current: "guild", recent: ["harbor"], setting: "mountain" };
  const ranked = selectVillageLore(
    [
      make("constant", { constant: true, content: "a".repeat(100), order: 1000 }),
      make("mountain"),
      make("harbor"),
      make("guild"),
    ],
    query,
    35,
  );
  assert.equal(ranked.selected[0], "guild: Complete fact.");
  assert.equal(ranked.selected[1], "harbor: Complete fact.");
  assert.equal(ranked.selected[2], "mountain: Complete fact.");
  assert.equal(ranked.inspection.entries.find((entry) => entry.id === "constant")?.status, "budget");
  const match = (patch: Partial<LoreEntry>, text: string) =>
    selectVillageLore([make("harbor", patch)], { setting: text }, 1600).selected.length;
  assert.equal(match({}, "HARBORSIDE"), 1);
  assert.equal(match({ caseSensitive: true }, "HARBOR"), 0);
  assert.equal(match({ matchWholeWords: true }, "harborside"), 0);
  assert.equal(match({ matchWholeWords: true }, "éharbor"), 0);
  assert.equal(match({ matchWholeWords: true }, "𐐀harbor"), 0);
  assert.equal(match({ matchWholeWords: true }, "harbor𐐀"), 0);
  assert.equal(match({ matchWholeWords: true }, "the harbor!"), 1);
  for (const [logic, present, absent] of [
    ["and", "harbor fog", "harbor"],
    ["or", "harbor fog", "harbor"],
    ["and_any", "harbor fog", "harbor"],
    ["and_all", "harbor fog tide", "harbor fog"],
    ["not_any", "harbor", "harbor fog"],
    ["not", "harbor", "harbor fog"],
    ["not_all", "harbor fog", "harbor fog tide"],
  ]) {
    const entry = { selective: true, selectiveLogic: logic, secondaryKeys: ["fog", "tide"] };
    assert.equal(match(entry, present!), 1, logic);
    assert.equal(match(entry, absent!), 0, logic);
    assert.equal(match(entry, "fog tide"), 0, `${logic} still requires a primary key`);
  }
  assert.equal(match({ selective: true, secondaryKeys: ["fog"] }, "harbor fog"), 1);
  assert.equal(match({ selective: true, secondaryKeys: ["fog"] }, "harbor"), 0);
  assert.equal(match({ selective: true, secondaryKeys: [] }, "harbor"), 1);
  assert.equal(match({ selective: true, secondaryKeys: ["fog"], selectiveLogic: "unknown" }, "harbor fog"), 0);
  assert.equal(match({ useRegex: true, keys: ["(a+)+$"] }, "a".repeat(10000) + "!"), 0);
  assert.equal(match({ constant: true, useRegex: true }, "nothing"), 1);
  const ordered = [make("z", { constant: true, order: 10 }), make("a", { constant: true, order: 5 })];
  assert.deepEqual(
    selectVillageLore(ordered, { setting: "" }, 1600).selected,
    selectVillageLore(ordered.toReversed(), { setting: "" }, 1600).selected,
  );
  assert.match(selectVillageLore(ordered, { setting: "" }, 1600).selected[0]!, /^z:/);
  const many = selectVillageLore(
    Array.from({ length: 130 }, (_, index) => make(String(index), { constant: true })),
    { setting: "" },
    3200,
  );
  assert.equal(many.selected.length, 24);
  assert.equal(many.inspection.entries.length, 100);
  assert.equal(many.inspection.omittedDiagnostics, 30);
  const crowded = selectVillageLore(
    [
      ...Array.from({ length: 110 }, (_, index) =>
        make("large-" + index, { keys: ["large"], content: "x".repeat(10000), order: 100 }),
      ),
      make("fits", { constant: true }),
    ],
    { setting: "large", current: "" },
    1600,
  );
  assert.deepEqual(crowded.selected, ["fits: Complete fact."]);
  assert.equal(crowded.inspection.entries[0]?.id, "fits", "Included entries always survive diagnostic bounds");

  const scene: any = { zoneId: "common" };
  const shared: any = {
    id: "shared",
    kind: "dialogue",
    role: "assistant",
    speakerId: "a",
    content: "harbor",
    zoneId: "common",
    heardBy: ["a", "b"],
  };
  const lines = [
    shared,
    { ...shared, id: "whisper", content: "secretguild", heardBy: ["a"] },
    { ...shared, id: "hidden", content: "hidden", contactHidden: true },
    { ...shared, id: "remote", content: "remote", zoneId: "private" },
    {
      ...shared,
      id: "sound",
      content: "unseen action",
      heardBy: [],
      soundOnly: { characterIds: ["a", "b"], text: "bang" },
    },
    { ...shared, id: "narrator", content: "narrator secret", kind: "narration" },
    { ...shared, id: "legacy-player", content: "private player thought", role: "user" },
    {
      ...shared,
      id: "captured-player",
      content: "spoken guild",
      role: "user",
      speechSource: { version: 3, spans: [] },
    },
  ];
  assert.deepEqual(sharedLoreHistory(scene, lines, ["a", "b"]), ["harbor", "spoken guild"]);
  assert.deepEqual(
    sharedLoreHistory({} as any, lines, ["a", "b"]),
    [],
    "Legacy scenes without Zone identity do not widen retrieval",
  );
  assert.equal(
    selectVillageLore(
      [make("harbor")],
      { setting: "", current: "What about it?", recent: sharedLoreHistory(scene, lines, ["a", "b"]) },
      1600,
    ).selected.length,
    1,
  );
  assert.equal(
    sharedLoreHistory(
      scene,
      Array.from({ length: 10 }, () => shared),
      ["a", "b"],
    ).length,
    6,
  );
  assert.deepEqual(sharedLoreHistory(scene, [{ ...shared, content: "x".repeat(4001) }], ["a", "b"]), []);
  const fit = fitVenueWritingMessages(
    {
      fitContext: (messages: any, options: any) => ({
        messages: messages[0].content.includes("low-priority") ? [] : messages,
        maxTokens: options.maxTokens,
        trimmed: messages[0].content.includes("low-priority"),
        estimatedTokensBefore: 0,
        estimatedTokensAfter: 0,
      }),
    },
    [{ text: "required" }, { text: "topical", optional: "lore" }, { text: "low-priority", optional: "lore" }],
    "current input",
    1000,
  );
  assert.deepEqual(fit.loreEntries, ["topical"]);
  assert.match(fit.messages[0]!.content, /required/);

  const checkpoints = new Map<string, any>(),
    sent: any[] = [],
    reports: any[] = [];
  let failSystem = true,
    unavailable = false,
    loreReads = 0;
  const systemModel = {
    model: "fixture",
    connectionId: "fixture",
    maxOutputTokens: 4096,
    fitContext(messages: any, options: any) {
      const packet = JSON.parse(messages[1].content);
      const crowded = packet.input.context.lore.includes("Low: expendable background");
      return { ...options, messages: crowded ? [] : messages, trimmed: crowded };
    },
  };
  const system = createSemanticService({
    readVillageState: async () => defaultVillageState(),
    readVillageLore: async (_ids: any, _context: any, _signal: any, _budget: any, options: any) => {
      loreReads++;
      if (unavailable) throw new Error("Engine unavailable");
      options.inspect({
        purpose: "Lore lookup",
        stage: "selection",
        budget: 1600,
        omittedDiagnostics: 0,
        entries: ["High", "Low"].map((name) => ({
          id: name,
          bookId: "book",
          name,
          status: "included",
          match: "current",
        })),
      });
      return ["High: relevant fact", "Low: expendable background"];
    },
    villagesConnectionIdFor: async () => "fixture",
    villagesLanguageModels: () => ({ resolveForRequest: async () => systemModel }),
    venueCheckpoint: async (key: string, work: any) => {
      if (!checkpoints.has(key)) checkpoints.set(key, await work());
      return checkpoints.get(key);
    },
    venueOperationSignal: () => undefined,
    runtimeDebug: (event: string, detail: any) => {
      if (event === "lore inspection") reports.push(detail);
    },
    completeWithRoom: async (_model: any, messages: any) => {
      const packet = JSON.parse(messages[1].content);
      sent.push(packet);
      if (failSystem) throw new Error("Held purchased request");
      return {
        content: JSON.stringify({
          sourceHash: packet.sourceHash,
          status: "resolved",
          reason: "",
          instructions: "",
          action: null,
          movement: null,
          timeline: [{ kind: "speech", text: "Hello" }],
        }),
        finishReason: "stop",
      };
    },
    rejectVenueCompletion: () => assert.fail("Valid intent must not be rejected"),
  } as any);
  const systemScene: any = {
    id: "system-lore-fit",
    activeIds: [],
    lines: [],
    submissions: [],
    placeId: "none",
    zoneId: "exterior",
    sceneRevision: 1,
  };
  await assert.rejects(system.intent(systemScene, "Hello"), /Held purchased request/);
  assert.deepEqual(sent[0].input.context.lore, ["High: relevant fact"]);
  assert.equal(reports[0].entries.find((entry: any) => entry.id === "Low").status, "context-limit");
  unavailable = true;
  failSystem = false;
  await system.intent(systemScene, "Hello");
  assert.equal(loreReads, 1, "System retry uses captured selection and final prompt during a lore outage");
  assert.deepEqual(sent[1], sent[0], "Optional lore fitting cannot vary the saved source hash on retry");
  const oldInputKey = [...checkpoints.keys()].find((key) => key.endsWith(":input"))!;
  const oldInput = structuredClone(checkpoints.get(oldInputKey));
  delete oldInput.lorePolicy;
  checkpoints.clear();
  checkpoints.set(oldInputKey, structuredClone(oldInput));
  const beforeOldReplay = sent.length;
  await assert.rejects(system.intent(systemScene, "Hello"), /Essential System evidence does not fit/);
  assert.equal(sent.length, beforeOldReplay, "Legacy evidence cannot authorize a newly fitted replacement request");
  assert.deepEqual(checkpoints.get(oldInputKey), oldInput, "Legacy input is retained byte-for-byte");
  assert.equal(loreReads, 1);

  console.log("Villages live lorebook selection regressions passed.");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
