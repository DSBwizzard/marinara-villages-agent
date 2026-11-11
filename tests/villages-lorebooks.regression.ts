import assert from "node:assert/strict";
import { readVillageImageLore, readVillageLore } from "../packages/villages/src/server/adapters/engine/lorebooks.js";
import { coerceSession } from "../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  fittedLoreUse,
  inspectedLoreUse,
  loreText,
  villageLoreContext,
} from "../packages/villages/src/server/domain/rules/lore-context.js";
import {
  coerceLoreTokenBudget,
  coerceSelectedLorebookIds,
  readLoreTokenBudget,
  readSelectedLorebookIds,
} from "../packages/villages/src/server/domain/rules/lore-policy.js";
import { selectVillageLore, type LoreEntry } from "../packages/villages/src/server/domain/rules/lore-selection.js";
import {
  publicSceneAuthority,
  publicSceneResponse,
} from "../packages/villages/src/server/domain/rules/scene-public.js";
import { establishPlace } from "../packages/villages/src/server/domain/rules/place-discovery.js";
import { acceptNarration } from "../packages/villages/src/server/domain/rules/narration-native.js";
import {
  fittedNarrationReadset,
  narrationContinuityContext,
} from "../packages/villages/src/server/domain/rules/narration-context.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { continuityHolderKey, protectContinuity } from "../packages/villages/src/server/domain/rules/continuity.js";
import { captureSceneLayout } from "../packages/villages/src/server/domain/rules/scene-layout.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";
import { buildTownMapPrompt } from "../packages/villages/src/server/domain/rules/town-map-image-rules.js";
import { fitVenueWritingMessages } from "../packages/villages/src/server/domain/rules/venue-writing.js";
import { zoneEventScene } from "../packages/villages/src/server/domain/rules/zone-events.js";
import { createSceneWriting } from "../packages/villages/src/server/features/scenes/writing-service.js";
import { mergeLoreUse, readLoreUse } from "../packages/villages/src/shared/helpers/lore.js";
import { pendingSceneSubmission } from "./helpers/narration-submission.fixture.js";

async function main() {
  assert.deepEqual(defaultVillageState().selectedLorebookIds, []);
  assert.deepEqual(
    coerceVillageState({
      ...defaultVillageState(),

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
  assert.equal(coerceVillageState({ ...defaultVillageState(), loreTokenBudget: 0 }).loreTokenBudget, 0);
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
    assert.equal(await readVillageImageLore(["world"], "harbor", 360, 0), "");
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
    const visual = await readVillageImageLore(["world"], "harbor", 60);
    let packedReport: any;
    await readVillageImageLore(["world"], "harbor", 60, 1600, (report) => {
      packedReport = report;
    });
    assert.deepEqual(
      inspectedLoreUse(packedReport, "Image").map((entry) => entry.name),
      ["Bridge"],
      "Image provenance excludes entries lost to character packing",
    );
    assert.ok(visual.length <= 60);
    assert.equal(
      visual,
      "Bridge: The bridge is painted blue now.",
      "relevant entries are complete and precede generic constants",
    );
    assert.ok(
      buildTownMapPrompt(undefined, "harbor village", visual).includes(JSON.stringify(visual)),
      "Maps retain the complete selected reference as data",
    );
    assert.throws(() => buildTownMapPrompt(undefined, "x".repeat(2_000), "y".repeat(500)), /4,000-character allowance/);
    globalThis.fetch = async () => new Response(JSON.stringify({ secret: "private-book-title" }), { status: 503 });
    await assert.rejects(readVillageLore(["world"], "harbor"), (error: any) => {
      assert.doesNotMatch(error.message, /private-book-title|503/);
      return /Selected lorebooks are unavailable/.test(error.message);
    });
    await assert.rejects(readVillageImageLore(["world"], "harbor"), /Selected lorebooks are unavailable/);
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
  assert.deepEqual(ranked.inspection.entries.find((entry) => entry.id === "guild")?.trigger, {
    context: { text: "guild", start: 0, end: 5, source: "Current request" },
    constant: false,
    match: "current",
    key: "guild",
    caseSensitive: false,
    matchWholeWords: false,
  });
  const trigger = (patch: Partial<LoreEntry>, text: string) =>
    selectVillageLore([make("text", patch)], { setting: text }, 1600).inspection.entries[0]?.trigger;
  assert.equal(trigger({}, "texting")?.key, "text", "Substring evidence names the actual authored key");
  assert.equal(trigger({ matchWholeWords: true }, "texting"), undefined);
  assert.deepEqual(
    trigger({ constant: true }, "texting"),
    {
      constant: true,
      match: "setting",
      context: { text: "texting", start: 0, end: 4, source: "Setting / generation context" },
      key: "text",
      caseSensitive: false,
      matchWholeWords: false,
    },
    "Constant eligibility stays explicit even when a key affects priority",
  );
  assert.deepEqual(trigger({ constant: true, useRegex: true }, "texting"), {
    constant: true,
    match: "constant",
    caseSensitive: false,
    matchWholeWords: false,
  });
  assert.deepEqual(
    trigger({ selective: true, secondaryKeys: ["fog", "private sentence"], selectiveLogic: "not_all" }, "text fog")
      ?.secondary,
    { logic: "not_all", matched: 1, total: 2 },
  );
  assert.deepEqual(trigger({ selective: true, secondaryKeys: ["secret"], selectiveLogic: "not" }, "text")?.secondary, {
    logic: "not_any",
    matched: 0,
    total: 1,
  });
  assert.equal(trigger({ caseSensitive: true, matchWholeWords: true }, "text")?.caseSensitive, true);
  const wholeWord = trigger({ matchWholeWords: true }, "textile text")!.context!;
  assert.equal(wholeWord.start, 8, "The excerpt uses the actual whole-word hit rather than an earlier substring");
  const unicode = trigger({}, "İ𐐀TEXT")!.context!;
  assert.equal(
    unicode.text.slice(unicode.start, unicode.end),
    "TEXT",
    "Folded Unicode offsets highlight original text",
  );
  const recent = selectVillageLore(
    [make("text")],
    { setting: "", recent: ["Nothing here", "Text from a witnessed line"] },
    1600,
  ).inspection.entries[0]!.trigger!.context!;
  assert.equal(recent.source, "Recent dialogue 2 of 2");
  assert.match(recent.text, /witnessed line/);
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

  const history = ["Discarded harbor", "Kept harbor, lantern and orchard", "Kept bridge"];
  const historySelection = selectVillageLore(
    [
      make("Any", { keys: ["waves"], selective: true, secondaryKeys: ["discarded", "orchard"] }),
      make("Primary", { keys: ["harbor"] }),
      make("All", {
        keys: ["waves"],
        selective: true,
        selectiveLogic: "and_all",
        secondaryKeys: ["waves", "lantern", "orchard", "bridge"],
      }),
      make("Needs discarded", {
        keys: ["waves"],
        selective: true,
        selectiveLogic: "and_all",
        secondaryKeys: ["waves", "lantern", "orchard", "discarded"],
      }),
    ],
    { setting: "", current: "waves", recent: history },
    1600,
  );
  const historyFit = fitVenueWritingMessages(
    {
      fitContext: (messages, options) =>
        ({ ...options, messages: JSON.stringify(messages).includes("Discarded harbor") ? [] : messages }) as any,
    },
    [
      ...history.map((text, index) => ({ text, evidenceId: String(index), optional: "history" as const })),
      ...historySelection.selected.map((text, index) => ({
        text,
        optional: "lore" as const,
        requiresEvidence: historySelection.recentRequirements[index]!.map((group) => group.map(String)),
      })),
    ],
    "waves",
    4096,
  );
  assert.deepEqual(
    historyFit.loreEntries.map((text) => text.split(":")[0]),
    ["All", "Any", "Primary"],
    "Fitting keeps alternate witnesses and checks all required keys beyond the bounded diagnostic trace",
  );

  const at = "2026-11-05T20:00:00.000Z";
  const authority = { ...defaultVillageState(), seed: "lore-history", setupAt: at, foundedAt: at };
  const place = establishPlace(
    authority,
    {
      name: "Lantern",
      description: "A restaurant.",
      people: [
        { ref: "jo", name: "Jo", characterization: "A quiet host." },
        { ref: "lee", name: "Lee", characterization: "A neighbor." },
      ],
      zones: [{ id: "common", name: "Common", kind: "public", description: "Wooden tables." }],
    },
    "lantern",
    "map",
    "request:place",
    at,
    true,
  );
  const ids = Object.keys(authority.worldPlaces.npcs);
  const participants = Object.values(authority.worldPlaces.npcs).map(({ id: characterId, name }) => ({
    characterId,
    name,
    doing: "Talking",
  }));
  const scene = zoneEventScene(
    coerceSession({
      version: 5,
      id: "lore-first",
      villageSeed: authority.seed,
      placeId: place.id,
      zoneId: "common",
      sceneRevision: 1,
      status: "active",
      startedAt: at,
      activeIds: ids,
      participants,
      sceneAttendance: {
        capturedAt: at,
        layout: captureSceneLayout(place.location),
        occupants: participants.map((person) => ({ ...person, zoneId: "common" })),
      },
    }),
    place.location,
  );
  const spoken = "The spoken guild meets at noon.";
  const original = `I privately wonder about vaultcipher. I say, “${spoken}”`;
  const admitted = narrationContinuityContext(authority, scene, place.location, "first", original, at);
  const raw = {
    segments: [
      { id: "shared", kind: "dialogue", speakerId: ids[0], text: "The harbor is quiet." },
      {
        id: "limited",
        kind: "dialogue",
        speakerId: ids[0],
        delivery: "whisper",
        targetId: "player",
        text: "secretguild",
      },
      { id: "narrator", kind: "narration", text: "Unseen narratorsigil." },
    ],
    keep: [{ for: ids, text: spoken, source: [{ input: spoken, ground: { kind: "spoken", to: ids } }] }],
  };
  const accepted = acceptNarration(
    authority,
    {
      raw,
      responseDigest: memoryHash(raw),
      readset: fittedNarrationReadset(
        authority,
        admitted,
        admitted.parts.flatMap((part) => part.block.evidenceId ?? []),
      ),
    },
    "first",
    at,
  );
  assert.equal(accepted.held, false, JSON.stringify(accepted.rejected));
  const nextScene = { ...scene, id: "lore-next" };
  const recall = () => narrationContinuityContext(authority, nextScene, place.location, "next", "What about it?", at);
  const recalled = recall();
  assert.deepEqual(
    recalled.recentLore.map(({ text }) => text),
    [spoken, "The harbor is quiet."],
  );
  assert(recalled.parts.some((part) => part.block.text.includes(original)));
  const keyed = ["harbor", "vaultcipher", "secretguild", "narratorsigil"];
  assert.deepEqual(
    selectVillageLore(
      keyed.map((key) => make(key)),
      { setting: "", recent: recalled.recentLore.map(({ text }) => text) },
      1600,
    ).selected,
    ["harbor: Complete fact."],
  );
  const holder = continuityActor(authority, ids[0])!;
  const key = continuityHolderKey(holder);
  const root = authority.continuity.records[0]!;
  authority.continuity = protectContinuity(
    authority.continuity,
    { id: root.id, recordRevision: root.revision, heads: { [key]: root.heads[key].revision } },
    [holder],
    "forget",
    at,
    { forget: true },
  );
  assert.deepEqual(
    recall().recentLore.map(({ text }) => text),
    ["The harbor is quiet."],
  );
  const fit = fitVenueWritingMessages(
    {
      fitContext: (messages: any, options: any) => ({
        messages: JSON.stringify(messages).includes("low-priority") ? [] : messages,
        maxTokens: options.maxTokens,
        trimmed: JSON.stringify(messages).includes("low-priority"),
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
  assert.doesNotMatch(fit.messages[0]!.content, /topical/);
  assert.ok(
    fit.messages.some((message) => message.role === "user" && message.content.includes("topical")),
    "Lore reaches a data message without entering application instructions",
  );
  assert.equal(fit.messages.at(-1)!.content, "current input");

  const cleanContext = villageLoreContext({
    setting: "A harbor",
    worldName: "Lorehaven",
    worldRules: "Bright sunsets",
    narrative: undefined,
  });
  assert.equal(cleanContext, "A harbor\nLorehaven\nBright sunsets");
  assert.equal(
    selectVillageLore([make("consent")], { setting: cleanContext }, 1600).selected.length,
    0,
    "Application instructions cannot activate a key",
  );
  assert.equal(loreText("quiet", { personality: "hidden property" }, ["harbor"]), "quiet\nharbor");

  const originalUse = { id: "same", bookId: "one", name: "Harbor", bookName: "World", targets: ["Narration"] };
  const combined = mergeLoreUse(
    [originalUse],
    [
      { ...originalUse, targets: ["System"] },
      { ...originalUse, bookId: "two", targets: ["System"] },
    ],
  );
  assert.equal(combined.length, 2, "Distinct books with identical entry IDs/names remain distinct");
  assert.deepEqual(combined[0]!.targets, ["Narration", "System"]);
  const safe = readLoreUse([
    { ...originalUse, content: "private body", query: "private trigger", match: "private backstory" },
  ]);
  assert.deepEqual(safe, [originalUse]);
  const firstId = "00000000-0000-4000-8000-000000000001";
  const secondId = "00000000-0000-4000-8000-000000000002";
  const withInspections = mergeLoreUse(
    [{ ...originalUse, inspections: [{ target: "Narration", id: firstId }] }],
    [{ ...originalUse, targets: ["System"], inspections: [{ target: "System", id: secondId }] }],
  );
  assert.deepEqual(withInspections[0]!.inspections, [
    { target: "Narration", id: firstId },
    { target: "System", id: secondId },
  ]);
  assert.deepEqual(
    readLoreUse([
      {
        ...originalUse,
        inspections: [
          { target: "Image", id: firstId, key: "private key", query: "private context" },
          { target: "Image", id: "not-an-id" },
          null,
        ],
        trigger: { key: "private key" },
      },
    ])[0]!.inspections,
    [{ target: "Image", id: firstId }],
  );
  assert.deepEqual((publicSceneResponse({ lore: withInspections }) as any).lore, withInspections);
  assert.doesNotMatch(
    JSON.stringify(
      publicSceneResponse({
        lore: [{ ...withInspections[0], trigger: { key: "private key" }, query: "private context" }],
      }),
    ),
    /private key|private context/,
  );
  const inspection = {
    purpose: "test",
    stage: "selection" as const,
    budget: 1600,
    omittedDiagnostics: 0,
    entries: ["one", "two"].map((bookId) => ({
      id: "same",
      bookId,
      name: "Harbor",
      status: "included" as const,
      match: "setting" as const,
    })),
  };
  assert.deepEqual(
    fittedLoreUse(inspection, ["identical", "identical"], ["identical"], "Image").map((entry) => entry.bookId),
    ["one"],
    "Final image fitting counts actual occurrences, not substring matches",
  );
  const savedScene = coerceSession({
    version: 5,
    id: "lore",
    villageSeed: "lore",
    startedAt: at,
    sceneRevision: 1,
    placeId: "harbor",
    participants: [],
    activeIds: [],
    lines: [],
    submissions: [
      {
        id: "turn",
        at,
        message: "Hello",
        mode: "chat",
        targetId: "",
        requestFingerprint: memoryHash(["chat", "", null, "Hello"]),
        episodeId: "accepted-lore",
        progressProcessedAt: at,
        acceptance: { status: "applied", rejected: [] },
        lore: combined,
      },
    ],
  });
  assert.deepEqual(
    coerceSession(JSON.parse(JSON.stringify(savedScene))).submissions[0]!.lore,
    combined,
    "Saved Scene provenance survives restart without Engine reads",
  );
  const referencedScene = coerceSession({
    ...savedScene,
    submissions: [{ ...savedScene.submissions[0], lore: withInspections }],
  });
  assert.deepEqual(coerceSession(JSON.parse(JSON.stringify(referencedScene))).submissions[0]!.lore, withInspections);
  assert.deepEqual(publicSceneAuthority(savedScene).lore, combined);
  const unpublished = {
    ...savedScene,
    submissions: [
      ...savedScene.submissions,
      {
        ...pendingSceneSubmission(savedScene, "hidden", "Unpublished turn", "hidden:reply"),
        lore: [{ ...originalUse, name: "Unpublished secret" }],
      },
    ],
  } as any;
  assert.deepEqual(
    publicSceneAuthority(unpublished).lore,
    combined,
    "Unpublished requests cannot replace the visible exchange chip",
  );
  assert.deepEqual(
    (publicSceneResponse({ lore: [{ ...originalUse, content: "private body", query: "private trigger" }] }) as any)
      .lore,
    [originalUse],
  );

  {
    const checkpoints = new Map<string, any>();
    const warnings: unknown[] = [],
      reports: any[] = [],
      sent: any[] = [];
    let rejected = 0,
      holdInput = true,
      unavailable = false,
      loreReads = 0,
      paid = 0;
    authority.selectedLorebookIds = ["book"];
    const model = {
      model: "fixture",
      connectionId: "fixture",
      maxOutputTokens: 4096,
      fitContext(messages: any[], options: any) {
        return {
          ...options,
          messages: /The harbor is quiet\.|Low: expendable background/.test(JSON.stringify(messages)) ? [] : messages,
        };
      },
    };
    const ports: any = {
      readVillageState: async () => authority,
      readVillageLore: async (_ids: any, _context: any, _signal: any, _budget: any, options: any) => {
        loreReads++;
        if (unavailable) throw Error("Engine unavailable");
        const selection = selectVillageLore(
          [
            make("High", { keys: ["waves"], content: "relevant fact" }),
            make("Low", { constant: true, content: "expendable background" }),
            make("Recent", { keys: ["harbor"], content: "primary history match" }),
            make("Secondary", {
              keys: ["waves"],
              selective: true,
              secondaryKeys: ["harbor"],
              content: "secondary history match",
            }),
          ],
          { setting: "", current: options.current, recent: options.recent },
          1600,
        );
        assert(selection.selected.some((entry) => entry.startsWith("Recent:")));
        assert(selection.selected.some((entry) => entry.startsWith("Secondary:")));
        options.inspect(selection.inspection, selection.recentRequirements);
        return selection.selected;
      },
      villagesConnectionIdFor: async (purpose: string) => {
        assert.equal(purpose, "narration");
        return "fixture";
      },
      villagesLanguageModels: () => ({ resolveForRequest: async () => model }),
      venueCheckpoint: async (key: string, work: any) => {
        if (checkpoints.has(key)) return structuredClone(checkpoints.get(key));
        const value = await work();
        checkpoints.set(key, structuredClone(value));
        if (holdInput && key.startsWith("writing-completion:")) {
          holdInput = false;
          throw Error("Held purchased request");
        }
        return value;
      },
      venueSavedCheckpoint: (key: string) => checkpoints.get(key),
      venueOperationSignal: () => undefined,
      runtimeDebug: (event: string, detail: any) => {
        if (event === "lore inspection") reports.push(detail);
      },
      completeWithRoom: async (_model: any, messages: any[]) => {
        paid++;
        sent.push(structuredClone(messages));
        assert.doesNotMatch(
          JSON.stringify(messages),
          /Low: expendable background|primary history match|secondary history match/,
        );
        return {
          content: JSON.stringify({
            segments: [{ kind: "narration", text: "The harbor is quiet." }],
          }),
          finishReason: "stop",
        };
      },
      rejectVenueCompletion: async () => {
        rejected++;
      },
      venueOperationId: () => "turn",
      readEffectiveVillagerCard: () => assert.fail("No actors"),
      villagesLogger: () => ({
        warn: (...details: unknown[]) => {
          warnings.push(details);
        },
      }),
      measurePipeline: async (_label: string, _metadata: unknown, work: any) => work(),
      refreshZoneParticipants: async (current: any) => current,
    };
    const writer = createSceneWriting(ports);
    const generate = () => writer.generate(nextScene, "I watch the waves.", "chat");
    await assert.rejects(generate(), /Held purchased request/);
    assert.equal(rejected, 0, "A local storage failure cannot reject purchased GM writing");
    assert.equal(paid, 1);
    for (const id of ["Low", "Recent", "Secondary"])
      assert.equal(reports[0].entries.find((entry: any) => entry.id === id).status, "context-limit");
    unavailable = true;
    const replayed = await generate();
    assert.deepEqual(
      replayed.lore?.map((entry) => entry.name),
      ["High"],
      "Provenance records only lore in the actual GM prompt",
    );
    assert.equal(loreReads, 1, "Recovery retains selected lore through a provider outage");
    assert.equal(paid, 1, "Local validation recovery reuses the purchased combined response");
    assert.equal(sent.length, 1);
    assert.equal(warnings.length, 0);
  }

  console.log("Villages live lorebook selection regressions passed.");
}

await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
