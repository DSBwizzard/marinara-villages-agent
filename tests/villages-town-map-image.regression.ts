import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const services = join(root, "packages/villages/src/engine/packages/server/src/services/villages");
  const {
    buildTownMapPrompt,
    buildTownMapNegativePrompt,
    MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH,
    DEFAULT_TOWN_MAP_LAYOUT_PROMPT,
    DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
  } = await import(pathToFileURL(join(services, "town-map-image.ts")).href);
  const {
    TOWN_MAP_EXPECTED_HEIGHT,
    TOWN_MAP_EXPECTED_WIDTH,
    MAX_TOWN_MAP_IMAGE_LENGTH,
    villageCurrentSetting,
    villageFoundingSetting,
    villageRelevantOrigin,
  } = await import(pathToFileURL(join(services, "prompt-preset.ts")).href);
  const { defaultVillageState, coerceVillageState } = await import(
    pathToFileURL(join(services, "village-store.ts")).href
  );
  const { inspectVillageImage } = await import(pathToFileURL(join(services, "image-generation.ts")).href);

  assert.equal(TOWN_MAP_EXPECTED_WIDTH, 1536);
  assert.equal(TOWN_MAP_EXPECTED_HEIGHT, 1024);
  assert.equal(MAX_TOWN_MAP_IMAGE_LENGTH, 8_000_000);
  const founded = {
    setting: "Misty cliffs",
    worldFacts: ["The cliffs shelter seabirds"],
    foundingReason: "rebuild",
    foundingDetails: "Survivors gathered after the flood in the early days.",
    foundingGuidance: "Favor quiet solidarity.",
    scenarioImprint: {
      origin: "Survivors founded the village after a flood.",
      worldFacts: ["The cliffs shelter seabirds"],
      openingConditions: ["The old footbridge needs repair"],
      visualCues: ["Reused timber"],
    },
  };
  assert.equal(villageCurrentSetting(founded), "Misty cliffs\nCurrent world facts:\n- The cliffs shelter seabirds");
  assert.doesNotMatch(villageCurrentSetting(founded), /early days|flood|footbridge|solidarity/);
  assert.match(
    villageFoundingSetting(founded),
    /Day 1 conditions \(at founding only\): The old footbridge needs repair/,
  );
  assert.match(villageFoundingSetting(founded), /description of Day 1.*Survivors gathered after the flood/);
  assert.match(villageFoundingSetting(founded), /Founding visual cues: Reused timber/);
  const openBeginning = {
    ...founded,
    foundingReason: "none",
    foundingDetails: "Friends gather with tools to build a new home.",
    foundingGuidance: "",
    scenarioImprint: { origin: "", worldFacts: [], openingConditions: ["A temporary camp"], visualCues: [] },
  };
  assert.match(villageFoundingSetting(openBeginning), /Day 1.*Friends gather with tools/);
  assert.doesNotMatch(villageCurrentSetting(openBeginning), /temporary camp|Friends gather/);
  const freshBeginning = {
    setting: "A fishing village above the sea",
    worldFacts: [],
    foundingReason: "none",
    foundingDetails: "On Day 1, storm-damaged boats reach the cove.",
    foundingGuidance: "",
    scenarioImprint: null,
  };
  assert.match(villageFoundingSetting(freshBeginning), /description of Day 1.*storm-damaged boats/);
  assert.doesNotMatch(villageFoundingSetting(freshBeginning), /Before the village began/);
  assert.doesNotMatch(villageCurrentSetting(freshBeginning), /storm-damaged/);
  assert.match(villageRelevantOrigin(freshBeginning, "How did this village begin?"), /storm-damaged boats/);
  assert.equal(villageRelevantOrigin(founded, "What is for dinner?"), "");
  assert.match(
    villageRelevantOrigin(founded, "Who founded this village?"),
    /Survivors founded the village after a flood/,
  );
  assert.equal(
    villageRelevantOrigin({ setting: "Misty cliffs", foundingReason: "none", foundingDetails: "" }, "history"),
    "",
  );
  const legacy = coerceVillageState({
    setting: "Misty cliffs",
    foundingReason: "rebuild",
    foundingDetails: "After the flood",
  });
  assert.equal(legacy.scenarioImprint, null);
  assert.deepEqual(legacy.worldFacts, []);
  assert.equal(villageCurrentSetting(legacy), "Misty cliffs");
  assert.match(villageRelevantOrigin(legacy, "Tell me the village history"), /After the flood/);
  assert.deepEqual([defaultVillageState().townMapCanvasWidth, defaultVillageState().townMapCanvasHeight], [1536, 1024]);
  assert.deepEqual(
    [coerceVillageState({}).townMapCanvasWidth, coerceVillageState({}).townMapCanvasHeight],
    [1536, 1024],
  );
  assert.deepEqual(
    [
      coerceVillageState({ setupAt: "2025-01-01T00:00:00Z" }).townMapCanvasWidth,
      coerceVillageState({ setupAt: "2025-01-01T00:00:00Z" }).townMapCanvasHeight,
    ],
    [1216, 832],
  );
  assert.deepEqual(
    [
      coerceVillageState({ townMapCanvasWidth: 1264, townMapCanvasHeight: 848 }).townMapCanvasWidth,
      coerceVillageState({ townMapCanvasWidth: 1264, townMapCanvasHeight: 848 }).townMapCanvasHeight,
    ],
    [1264, 848],
  );
  assert.deepEqual(
    [
      coerceVillageState({ townMapCanvasWidth: 9000, townMapCanvasHeight: 2 }).townMapCanvasWidth,
      coerceVillageState({ townMapCanvasWidth: 9000, townMapCanvasHeight: 2 }).townMapCanvasHeight,
    ],
    [1536, 1024],
  );
  const mapPrefix = "data:image/png;base64,";
  const acceptedMap = mapPrefix + "A".repeat(7_999_976);
  const oversizedMap = mapPrefix + "A".repeat(7_999_980);
  assert.ok(acceptedMap.length <= MAX_TOWN_MAP_IMAGE_LENGTH);
  assert.ok(oversizedMap.length > MAX_TOWN_MAP_IMAGE_LENGTH);
  assert.equal(coerceVillageState({ townMapImage: acceptedMap }).townMapImage.length, acceptedMap.length);
  assert.equal(coerceVillageState({ townMapImage: oversizedMap }).townMapImage, "");
  assert.match(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /many visually distinct, usable places/);
  assert.doesNotMatch(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /\d/);
  assert.match(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /wide landscape/);
  assert.equal(DEFAULT_TOWN_MAP_LAYOUT_PROMPT.includes("1536×1024"), false);
  assert.match(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /never outlined lots, square plots, zones, or a grid/);
  const defaultPrompt = buildTownMapPrompt(undefined, "cozy forest village");
  assert.ok(defaultPrompt.startsWith(DEFAULT_TOWN_MAP_LAYOUT_PROMPT));
  assert.match(defaultPrompt, /Follow the village description for water, paths, and existing structures/);
  assert.doesNotMatch(defaultPrompt, /Do not include (buildings|water|streets)/);
  assert.match(defaultPrompt, /without any writing, numerals/);
  const coastalPrompt = buildTownMapPrompt(undefined, "A fishing village on sea cliffs");
  assert.match(coastalPrompt, /A fishing village on sea cliffs/);
  assert.doesNotMatch(coastalPrompt, /Do not include water/);
  assert.match(
    buildTownMapPrompt(undefined, "A fishing village on sea cliffs", {
      roads: "auto",
      structures: "auto",
      water: "exclude",
    }),
    /Do not include water/,
  );
  const imprintMap = buildTownMapPrompt(
    undefined,
    "Misty cliffs",
    { roads: true, structures: false, water: false },
    "",
    founded.scenarioImprint,
  );
  assert.match(imprintMap, /Reused timber/);
  assert.match(imprintMap, /Do not include water/);
  assert.match(imprintMap, /Do not include buildings/);
  assert.match(DEFAULT_TOWN_MAP_NEGATIVE_PROMPT, /text, letters, writing, numerals, digits, numbers, labels/);
  assert.equal(buildTownMapNegativePrompt(), DEFAULT_TOWN_MAP_NEGATIVE_PROMPT);
  assert.match(
    buildTownMapNegativePrompt({ roads: true, structures: true, water: true }, "foggy artifacts"),
    /writing, numerals.*foggy artifacts/,
  );
  assert.equal(
    buildTownMapNegativePrompt({ roads: true, structures: true, water: true }, DEFAULT_TOWN_MAP_NEGATIVE_PROMPT),
    DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
  );
  for (let mask = 0; mask < 8; mask += 1) {
    const prompt = buildTownMapPrompt(undefined, "harbor city with canals", {
      roads: !!(mask & 1),
      structures: !!(mask & 2),
      water: !!(mask & 4),
    });
    assert.match(prompt, /Village description.*harbor city with canals/s);
    assert.equal(prompt.includes("Do not include streets"), !(mask & 1));
    assert.equal(prompt.includes("Do not include buildings"), !(mask & 2));
    assert.equal(prompt.includes("Do not include water"), !(mask & 4));
  }
  assert.throws(() => buildTownMapPrompt(undefined, "   "), /cannot be blank/);
  assert.throws(() => buildTownMapPrompt(" ".repeat(3), "forest"), /cannot be blank/);
  assert.throws(() => buildTownMapPrompt("x".repeat(MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH + 1), "forest"), /at most/);
  assert.throws(
    () => buildTownMapPrompt(undefined, "forest", { roads: "yes", structures: false, water: false }),
    /must be Auto, Include, or Exclude/,
  );
  const png = new Uint8Array(24);
  png.set([137, 80, 78, 71, 13, 10, 26, 10], 0);
  new DataView(png.buffer).setUint32(16, 1264);
  new DataView(png.buffer).setUint32(20, 848);
  const nativeMap = `data:image/png;base64,${Buffer.from(png).toString("base64")}`;
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response(JSON.stringify({ error: "missing" }), { status: 404 });
    assert.deepEqual(await inspectVillageImage(nativeMap), { width: 1264, height: 848 });
    new DataView(png.buffer).setUint32(16, 9000);
    await assert.rejects(
      inspectVillageImage(`data:image/png;base64,${Buffer.from(png).toString("base64")}`),
      /safe dimensions/,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
  const client = await readFile(
    join(root, "packages/villages/src/engine/packages/client/src/villages-package-entry.tsx"),
    "utf8",
  );
  for (const step of ["Village Beginning", "Connections & Persona", "Village Map", "Build the Village", "Review"]) {
    assert.ok(client.includes(`"${step}"`));
  }
  assert.ok(client.includes('"/setup/town-map/generate"'));
  assert.ok(client.includes("Restore default prompt"));
  assert.ok(client.includes("className={`${ELEMENT_TAG}-debug-label`}>DEBUG"));
  assert.ok(client.includes("setupMapOptions"));
  assert.equal(client.includes("Fit entire map"), false);
  assert.ok(client.includes("mobile={mobile && setupStep >= 2}"));
  assert.ok(client.includes("setupMapGeneratedKey === setupMapGenerationKey"));
  assert.ok(client.includes("lorebooks: setupLorebookDraft"));
  assert.ok(client.includes("setting: setupSetting.trim()"));
  assert.equal(client.includes('mobileStart="contain"'), false);
  assert.ok(client.includes("No background image"));
  assert.ok(client.includes("setupMapNegativePrompt"));
  assert.equal(client.includes("DEFAULT_TOWN_MAP_SRC"), false);
  assert.equal(
    client.match(/\/setup\/town-map\/generate/g)?.length,
    2,
    "founding and replacement each generate explicitly",
  );

  const routes = await readFile(
    join(root, "packages/villages/src/engine/packages/server/src/routes/villages.routes.ts"),
    "utf8",
  );
  assert.ok(routes.includes('>("/setup", { bodyLimit: SETTINGS_BODY_LIMIT }'));
  assert.ok(routes.includes('>("/setup/town-map/generate"'));

  const village = await readFile(join(services, "village.ts"), "utf8");
  assert.ok(
    village.includes('if (setting.length === 0) throw badRequest("Say what the village is like before founding it.")'),
  );
  assert.ok(village.includes("state.townMapImage = townMap.image"));

  const builder = await readFile(join(root, "scripts/build-feature-packages.mjs"), "utf8");
  assert.equal(builder.includes('"villages-townmap.png"'), false);
  await assert.rejects(access(join(root, "packages/villages/villages-townmap.png")));

  console.log(
    "Villages founding map regression: options, prompt, explicit spend, dimensions, mobile fit control, no bundled map ok",
  );
}

void main();
