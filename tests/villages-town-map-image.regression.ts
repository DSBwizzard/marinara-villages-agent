import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PNG } from "pngjs";

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const services = join(root, "packages/villages/src/engine/packages/server/src/services/villages");
  const {
    buildTownMapPrompt,
    buildTownMapNegativePrompt,
    MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH,
    DEFAULT_TOWN_MAP_LAYOUT_PROMPT,
    DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
    generateVillageTownMap,
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
  assert.match(villageCurrentSetting(founded), /^Misty cliffs\n/);
  assert.match(villageCurrentSetting(founded), /Current world facts:\n- The cliffs shelter seabirds/);
  assert.doesNotMatch(villageCurrentSetting(founded), /early days|flood|footbridge|solidarity/);
  assert.match(
    villageFoundingSetting(founded),
    /Starting conditions \(at founding only\): The old footbridge needs repair/,
  );
  assert.match(villageFoundingSetting(founded), /Shared starting circumstances.*Survivors gathered after the flood/);
  assert.match(villageFoundingSetting(founded), /Founding visual cues: Reused timber/);
  const openBeginning = {
    ...founded,
    foundingReason: "none",
    foundingDetails: "Friends gather with tools to build a new home.",
    foundingGuidance: "",
    scenarioImprint: { origin: "", worldFacts: [], openingConditions: ["A temporary camp"], visualCues: [] },
  };
  assert.match(villageFoundingSetting(openBeginning), /Shared starting circumstances.*Friends gather with tools/);
  assert.doesNotMatch(villageCurrentSetting(openBeginning), /temporary camp|Friends gather/);
  const freshBeginning = {
    setting: "A fishing village above the sea",
    worldFacts: [],
    foundingReason: "none",
    foundingDetails: "On Day 1, storm-damaged boats reach the cove.",
    foundingGuidance: "",
    scenarioImprint: null,
  };
  assert.match(villageFoundingSetting(freshBeginning), /Shared starting circumstances.*storm-damaged boats/);
  assert.doesNotMatch(villageFoundingSetting(freshBeginning), /Earlier background/);
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
    wishSystemVersion: 2,
    setting: "Misty cliffs",
    foundingReason: "rebuild",
    foundingDetails: "After the flood",
  });
  assert.equal(legacy.scenarioImprint, null);
  assert.deepEqual(legacy.worldFacts, []);
  assert.match(villageCurrentSetting(legacy), /^Misty cliffs\n/);
  assert.match(villageRelevantOrigin(legacy, "Tell me the village history"), /After the flood/);
  assert.deepEqual([defaultVillageState().townMapCanvasWidth, defaultVillageState().townMapCanvasHeight], [1536, 1024]);
  assert.deepEqual(
    [
      coerceVillageState({ wishSystemVersion: 2 }).townMapCanvasWidth,
      coerceVillageState({ wishSystemVersion: 2 }).townMapCanvasHeight,
    ],
    [1536, 1024],
  );
  assert.deepEqual(
    [
      coerceVillageState({ wishSystemVersion: 2, setupAt: "2025-01-01T00:00:00Z" }).townMapCanvasWidth,
      coerceVillageState({ wishSystemVersion: 2, setupAt: "2025-01-01T00:00:00Z" }).townMapCanvasHeight,
    ],
    [1216, 832],
  );
  assert.deepEqual(
    [
      coerceVillageState({ wishSystemVersion: 2, townMapCanvasWidth: 1264, townMapCanvasHeight: 848 })
        .townMapCanvasWidth,
      coerceVillageState({ wishSystemVersion: 2, townMapCanvasWidth: 1264, townMapCanvasHeight: 848 })
        .townMapCanvasHeight,
    ],
    [1264, 848],
  );
  assert.deepEqual(
    [
      coerceVillageState({ wishSystemVersion: 2, townMapCanvasWidth: 9000, townMapCanvasHeight: 2 }).townMapCanvasWidth,
      coerceVillageState({ wishSystemVersion: 2, townMapCanvasWidth: 9000, townMapCanvasHeight: 2 })
        .townMapCanvasHeight,
    ],
    [1536, 1024],
  );
  const mapPrefix = "data:image/png;base64,";
  const acceptedMap = mapPrefix + "A".repeat(7_999_976);
  const oversizedMap = mapPrefix + "A".repeat(7_999_980);
  assert.ok(acceptedMap.length <= MAX_TOWN_MAP_IMAGE_LENGTH);
  assert.ok(oversizedMap.length > MAX_TOWN_MAP_IMAGE_LENGTH);
  assert.equal(
    coerceVillageState({ wishSystemVersion: 2, townMapImage: acceptedMap }).townMapImage.length,
    acceptedMap.length,
  );
  assert.equal(coerceVillageState({ wishSystemVersion: 2, townMapImage: oversizedMap }).townMapImage, "");
  assert.match(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /visually distinct usable areas/);
  assert.doesNotMatch(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /\d/);
  assert.match(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /three-to-two canvas.*not panoramic/);
  assert.equal(DEFAULT_TOWN_MAP_LAYOUT_PROMPT.includes("1536×1024"), false);
  assert.match(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /Never add outlined lots or a zoning grid/);
  const fixtures = [
    "A forest settlement of timber cabins and clearings.",
    "A prison cell block with repeated cells, a dayroom and service corridors.",
    "An abandoned mall with shuttered storefronts around an atrium.",
    "A spacecraft with bunks, a shared mess and connected compartments.",
    "An underwater habitat of pressure domes connected by sealed passages.",
    "An underground refuge in a network of inhabited caverns.",
    "A modern apartment complex with flats and shared courtyards.",
    "A nonhuman habitat of living chambers within a giant crystalline organism.",
  ];
  for (const setting of fixtures) {
    const prompt = buildTownMapPrompt("Respect repeated living spaces and the shared approach.", setting);
    assert.ok(prompt.startsWith(DEFAULT_TOWN_MAP_LAYOUT_PROMPT));
    assert.ok(prompt.includes(setting));
    assert.match(prompt, /up to sixteen Venue photographs/);
    assert.match(prompt, /Authored layout: Respect repeated living spaces/);
    assert.ok(prompt.length <= 4000);
  }
  const tightBase = buildTownMapPrompt(undefined, "x".repeat(1900));
  const exactlyFits = "v".repeat(4000 - tightBase.length - 1 - "Compatible visual lore: ".length);
  const tightPrompt = buildTownMapPrompt(undefined, "x".repeat(1900), undefined, [exactlyFits]);
  assert.equal(tightPrompt.length, 4000, "complete optional entry fits the actual final character allowance");
  assert.ok(tightPrompt.includes("\nCompatible visual lore: "));
  const longSetting = "a".repeat(1990) + "LAST-FACT";
  assert.ok(buildTownMapPrompt(undefined, longSetting, undefined, "", undefined, "Watercolor").includes("LAST-FACT"));
  const optionalPrompt = buildTownMapPrompt(undefined, "An enclosed mall.", undefined, [
    "z".repeat(4000),
    "COMPLETE-SHORT-ENTRY",
  ]);
  assert.ok(!optionalPrompt.includes("zzz"));
  assert.ok(optionalPrompt.includes("COMPLETE-SHORT-ENTRY"));
  assert.doesNotMatch(
    buildTownMapNegativePrompt({ roads: "exclude", structures: "exclude" }),
    /streets, roads|corridors|enclosing/,
  );
  const defaultPrompt = buildTownMapPrompt(undefined, "cozy forest village");
  assert.ok(defaultPrompt.startsWith(DEFAULT_TOWN_MAP_LAYOUT_PROMPT));
  assert.match(defaultPrompt, /Follow the village description for water, paths, and existing structures/);
  assert.doesNotMatch(defaultPrompt, /Do not include (buildings|water|streets)/);
  assert.match(defaultPrompt, /without photographs.*writing, numerals/);
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
  assert.match(imprintMap, /Do not add decorative buildings/);
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
    assert.equal(prompt.includes("Do not add decorative outdoor routes"), !(mask & 1));
    assert.equal(prompt.includes("Do not add decorative buildings"), !(mask & 2));
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
  // Exercise the actual generation boundary, with a realistic PNG and no network.
  const { configureVillagesRuntime } = await import(pathToFileURL(join(services, "package-runtime.ts")).href);
  const { VILLAGE_SHARED_SETTING_RULE } = await import(pathToFileURL(join(services, "narrative-grounding.ts")).href);
  const documents = new Map<string, any>();
  const releaseRuntime = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById(_packageId: string, id: string) {
          return documents.get(id) ?? null;
        },
        async create(input: any) {
          const row = { ...input, revision: 1 };
          documents.set(input.id, row);
          return row;
        },
        async update(input: any) {
          const row = { ...input, revision: documents.get(input.id).revision + 1 };
          documents.set(input.id, row);
          return row;
        },
      },
    },
    logger: { warn() {}, error() {}, info() {}, debug() {}, debugOverride() {} },
  } as any);
  const fullMap = new PNG({ width: 1536, height: 1024 });
  let random = 123456;
  for (let index = 0; index < fullMap.data.length; index++) {
    random ^= random << 13;
    random ^= random >>> 17;
    random ^= random << 5;
    fullMap.data[index] = index % 4 === 3 ? 255 : random & 255;
  }
  const generatedImage = `data:image/png;base64,${PNG.sync.write(fullMap).toString("base64")}`;
  assert.ok(generatedImage.length > 4_000_000 && generatedImage.length < MAX_TOWN_MAP_IMAGE_LENGTH);
  const imageRequests: any[] = [];
  let resultImage = generatedImage;
  let imageGate: Promise<void> | undefined;
  let failImage = false;
  try {
    globalThis.fetch = async (url, init) => {
      const path = new URL(String(url)).pathname;
      if (path === "/api/connections")
        return Response.json([{ id: "fixture-image", provider: "image_generation", model: "fixture" }]);
      if (path === "/api/characters/avatar-generation") {
        imageRequests.push(JSON.parse(String(init?.body)));
        await imageGate;
        if (failImage) return Response.json({ error: "Provider unavailable" }, { status: 503 });
        return Response.json({ image: resultImage });
      }
      assert.equal(path, "/api/image-metadata/inspect");
      return Response.json({ error: "Not Found" }, { status: 404 });
    };
    const input = {
      structure: "A corridor and shared hall. ".repeat(4),
      setting: "An indoor observatory. ".repeat(70),
      sceneryArtStyle: "Painted scenery. ".repeat(6),
      options: { roads: "include", structures: "include", water: "include" },
      useVisualLore: false,
      connectionId: "fixture-image",
    };
    const expectedPrompt = buildTownMapPrompt(
      input.structure,
      input.setting,
      input.options,
      "",
      null,
      input.sceneryArtStyle.trim(),
    );
    assert.ok(expectedPrompt.length > 3000 && expectedPrompt.length <= 4000);
    await assert.rejects(
      generateVillageTownMap({ ...input, structure: "x".repeat(1500), sceneryArtStyle: "s".repeat(600) }),
      /characters over.*no image request was made/,
    );
    assert.equal(imageRequests.length, 0, "over-budget inputs never dispatch an image request");
    const generated = await generateVillageTownMap(input);
    assert.deepEqual(generated, { image: generatedImage, width: 1536, height: 1024 });
    assert.equal(imageRequests.length, 1);
    assert.equal(imageRequests[0].appearance, expectedPrompt);
    assert.equal(expectedPrompt.split(VILLAGE_SHARED_SETTING_RULE).length - 1, 1);
    assert.equal(imageRequests[0].promptOverrides[0].prompt, expectedPrompt);
    resultImage = "data:image/png;base64," + "A".repeat(8_000_004);
    await assert.rejects(generateVillageTownMap(input), /too large to store/);
    assert.equal(imageRequests.length, 2, "an oversized result must not trigger another paid request");
    const { requestTownMapGeneration, readTownMapGeneration, startTownMapGeneration } = await import(
      pathToFileURL(join(services, "town-map-generation.ts")).href
    );
    let stop = startTownMapGeneration();
    resultImage = generatedImage;
    let releaseImage!: () => void;
    imageGate = new Promise<void>((resolve) => {
      releaseImage = resolve;
    });
    const attempt = { ...input, actionId: "map-attempt-one", sourceKey: "original-inputs" };
    const first = await requestTownMapGeneration(attempt);
    assert.equal(first.status, "running", "admission finishes before the provider response");
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(imageRequests.length, 3);
    assert.equal((await requestTownMapGeneration(attempt)).id, first.id);
    assert.equal(
      (await requestTownMapGeneration({ ...attempt, actionId: "map-attempt-two" })).id,
      first.id,
      "another tab joins the existing request",
    );
    assert.equal((await readTownMapGeneration(first.id)).status, "running");
    assert.equal(imageRequests.length, 3, "status reads and repeated admission do not spend again");
    releaseImage();
    for (let i = 0; i < 30 && (await readTownMapGeneration(first.id)).status === "running"; i++)
      await new Promise((resolve) => setImmediate(resolve));
    const complete = await readTownMapGeneration(first.id);
    assert.equal(complete.status, "complete");
    assert.deepEqual(complete.result, generated);
    stop();
    stop = startTownMapGeneration();
    assert.equal(
      (await readTownMapGeneration(first.id)).status,
      "complete",
      "completed result survives runtime restart",
    );
    failImage = true;
    imageGate = undefined;
    const second = await requestTownMapGeneration({ ...attempt, actionId: "map-attempt-two" });
    for (let i = 0; i < 30 && (await readTownMapGeneration(second.id)).status === "running"; i++)
      await new Promise((resolve) => setImmediate(resolve));
    assert.equal((await readTownMapGeneration(second.id)).status, "failed");
    assert.match((await readTownMapGeneration(second.id)).error, /Provider unavailable/);
    assert.equal(imageRequests.length, 4);
    await assert.rejects(requestTownMapGeneration(attempt), /already used/);
    assert.equal(imageRequests.length, 4, "replaying a replaced receipt must not spend again");
    failImage = false;
    imageGate = new Promise<void>((resolve) => {
      releaseImage = resolve;
    });
    const third = await requestTownMapGeneration({ ...attempt, actionId: "map-attempt-three" });
    await new Promise((resolve) => setImmediate(resolve));
    stop();
    stop = startTownMapGeneration();
    assert.equal((await readTownMapGeneration(third.id)).status, "interrupted");
    releaseImage();
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(
      (await readTownMapGeneration(third.id)).status,
      "interrupted",
      "late response cannot overwrite restarted runtime state",
    );
    assert.equal(imageRequests.length, 5, "restart never dispatches a replacement automatically");
    stop();
    const legacy: any = { ...defaultVillageState(), setupAt: "2026-10-03T12:00:00.000Z" };
    delete legacy.venueCapacityPolicy;
    documents.set("villages-village", { id: "villages-village", kind: "village", data: legacy, revision: 1 });
    await generateVillageTownMap({ ...input, capacity: 1 } as any);
    assert.match(imageRequests.at(-1).appearance, /up to forty-eight Venue photographs/);
    assert.equal(imageRequests.at(-1).appearance.split(VILLAGE_SHARED_SETTING_RULE).length - 1, 1);
  } finally {
    globalThis.fetch = originalFetch;
    releaseRuntime();
  }
  const client = await readFile(
    join(root, "packages/villages/src/engine/packages/client/src/villages-package-entry.tsx"),
    "utf8",
  );
  for (const step of ["People", "Place", "Spaces", "Review"]) {
    assert.ok(client.includes(`"${step}"`));
  }
  assert.ok(client.includes('"/setup/town-map/generate"'));
  assert.ok(client.includes("Advanced artwork options"));
  assert.ok(client.includes("setupMapOptions"));
  assert.equal(client.includes("Fit entire map"), false);
  assert.ok(client.includes("mobile={mobile}"));
  assert.ok(client.includes("setupMapGeneratedKey !== setupMapGenerationKey"));
  assert.ok(client.includes("lorebooks: setupLorebookDraft"));
  assert.ok(client.includes("setting: setupSetting.trim()"));
  assert.equal(client.includes('mobileStart="contain"'), false);
  assert.ok(client.includes("Simple map"));
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
    village.includes('if (setting.length === 0) throw badRequest("Describe the place and world before founding.")'),
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
