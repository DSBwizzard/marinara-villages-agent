import assert from "node:assert/strict";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.ts";
import {
  coerceSelectedLorebookIds,
  readSelectedLorebookIds,
  readVillageLore,
  readVillageVisualLore,
} from "../packages/villages/src/engine/packages/server/src/services/villages/lorebooks.ts";
import { buildTownMapPrompt } from "../packages/villages/src/engine/packages/server/src/services/villages/town-map-image.ts";

async function main() {
  assert.deepEqual(defaultVillageState().selectedLorebookIds, []);
  assert.deepEqual(coerceVillageState({}).selectedLorebookIds, []);
  assert.deepEqual(coerceVillageState({ selectedLorebookIds: ["world", "world", "missing"] }).selectedLorebookIds, [
    "world",
    "missing",
  ]);
  assert.deepEqual(readSelectedLorebookIds([" world ", "world"]), ["world"]);
  assert.deepEqual(coerceSelectedLorebookIds("wrong shape"), []);

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
    const picked = await readVillageLore(["world", "off", "missing"], "A harbor village");
    assert.equal(picked.length, 2);
    assert.ok(picked.some((line) => line.includes("festival")));
    assert.ok(picked.some((line) => line.includes("old stone bridge")));
    assert.ok(!picked.join(" ").includes("secret canal"));
    assert.ok(!picked.join(" ").includes("Never"));
    assert.ok(!picked.join(" ").includes("Oversized"), "oversized entries do not displace selected facts");
    assert.equal((await readVillageLore(["world"], "A mountain village")).length, 1);
    entries.world[1]!.keys = ["^harbor$"];
    entries.world[1]!.useRegex = true;
    assert.equal((await readVillageLore(["world"], "A harbor village")).length, 1);
    assert.equal((await readVillageLore(["world"], "harbor")).length, 2);
    bridge = "The bridge is painted blue now.";
    assert.ok(
      (await readVillageLore(["world"], "harbor")).join(" ").includes("painted blue"),
      "the next call sees Engine edits",
    );
    const visual = await readVillageVisualLore(["world"], "harbor", 60);
    assert.ok(visual.length <= 60);
    assert.match(
      buildTownMapPrompt(undefined, "harbor village", undefined, visual),
      /Visual details from selected lore/,
    );
    assert.ok(buildTownMapPrompt(undefined, "x".repeat(2_000), undefined, "y".repeat(500)).length <= 4_000);
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log("Villages live lorebook selection regressions passed.");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
