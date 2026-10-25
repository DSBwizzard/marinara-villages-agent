import { townMapImageProblem } from "../packages/villages/src/shared/helpers/town-map-upload.js";
import { villageRouteSource } from "./route-source.js";
import { clientImplementation } from "./client-source.js";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PNG } from "pngjs";

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const services = join(root, "packages/villages/src/server");
  const { buildTownMapPrompt, buildTownMapNegativePrompt, MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH } = await import(
    pathToFileURL(join(services, "domain/rules/town-map-image-rules.ts")).href
  );
  const { generateVillageTownMap } = await import(
    pathToFileURL(join(services, "features/media/town-map-image.ts")).href
  );
  const { DEFAULT_TOWN_MAP_LAYOUT_PROMPT } =
    await import("../packages/villages/src/server/domain/rules/town-map-prompts.ts");
  const { DEFAULT_TOWN_MAP_NEGATIVE_PROMPT } =
    await import("../packages/villages/src/server/domain/rules/town-map-prompts.ts");
  const {
    TOWN_MAP_EXPECTED_HEIGHT,
    TOWN_MAP_EXPECTED_WIDTH,
    MAX_TOWN_MAP_IMAGE_LENGTH,
    villageCurrentSetting,
    villageFoundingSetting,
    villageRelevantOrigin,
  } = await import(pathToFileURL(join(services, "domain/rules/prompt-preset.ts")).href);
  const { defaultVillageState, coerceVillageState } = await import(
    pathToFileURL(join(services, "domain/decoding/village-codec.ts")).href
  );
  const { inspectVillageImage } = await import(pathToFileURL(join(services, "adapters/engine/image-files.ts")).href);

  for (const [width, height] of [
    [2560, 1440],
    [1536, 1024],
    [1024, 1024],
    [768, 1152],
    [2048, 1024],
    [4000, 4000],
  ])
    assert.equal(townMapImageProblem({ width, height }), null, `${width} x ${height} accepted`);
  for (const [width, height] of [
    [300, 2056],
    [1024, 700],
    [1023, 768],
    [768, 1153],
    [2049, 1024],
    [4001, 4000],
    [8193, 4096],
  ])
    assert.ok(townMapImageProblem({ width, height }), `${width} x ${height} rejected`);
  assert.match(townMapImageProblem({ width: 1080, height: 2412 })!, /at most 1620px tall/);
  assert.match(townMapImageProblem({ width: 2412, height: 1080 })!, /at most 2160px wide/);
  assert.equal(TOWN_MAP_EXPECTED_WIDTH, 2560);
  assert.equal(TOWN_MAP_EXPECTED_HEIGHT, 1440);
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
  assert.doesNotMatch(villageFoundingSetting(founded), /quiet solidarity|Player-authored creative preferences/);
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
    version: 3,
    wishSystemVersion: 3,
    setting: "Misty cliffs",
    foundingReason: "rebuild",
    foundingDetails: "After the flood",
  });
  assert.equal(legacy.scenarioImprint, null);
  assert.deepEqual(legacy.worldFacts, []);
  assert.match(villageCurrentSetting(legacy), /^Misty cliffs\n/);
  assert.match(villageRelevantOrigin(legacy, "Tell me the village history"), /After the flood/);
  assert.deepEqual(defaultVillageState().maps, []);
  assert.match(
    DEFAULT_TOWN_MAP_LAYOUT_PROMPT,
    /Make rooms, outdoor spaces, entrances and connecting routes easy to distinguish/,
  );
  assert.match(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /16:9 landscape canvas/);
  assert.match(DEFAULT_TOWN_MAP_LAYOUT_PROMPT, /Do not draw outlined lots or a zoning grid/);
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
    assert.doesNotMatch(
      prompt,
      /Venue photographs|sixteen|forty-eight|added by the application|assign or develop Venues/,
    );
    assert.match(prompt, /Map details: Respect repeated living spaces/);
    assert.ok(prompt.length <= 4000);
  }
  const tightBase = buildTownMapPrompt(undefined, "x".repeat(1500));
  const exactlyFits = "v".repeat(4000 - tightBase.length - 1 - "Compatible visual lore: ".length);
  const tightPrompt = buildTownMapPrompt(undefined, "x".repeat(1500), [exactlyFits]);
  assert.equal(tightPrompt.length, 4000, "complete optional entry fits the actual final character allowance");
  assert.ok(tightPrompt.includes("\nCompatible visual lore: "));
  const longSetting = "a".repeat(1490) + "LAST-FACT";
  assert.ok(buildTownMapPrompt(undefined, longSetting, "", undefined, "Watercolor").includes("LAST-FACT"));
  const optionalPrompt = buildTownMapPrompt(undefined, "An enclosed mall.", ["z".repeat(4000), "COMPLETE-SHORT-ENTRY"]);
  assert.ok(!optionalPrompt.includes("zzz"));
  assert.ok(optionalPrompt.includes("COMPLETE-SHORT-ENTRY"));
  const defaultPrompt = buildTownMapPrompt(undefined, "cozy forest village");
  assert.ok(defaultPrompt.startsWith(DEFAULT_TOWN_MAP_LAYOUT_PROMPT));
  assert.match(defaultPrompt, /follow the Village description for anything Map details leave unspecified/);
  assert.doesNotMatch(defaultPrompt, /Do not include (buildings|water|streets)/);
  assert.match(defaultPrompt, /Do not reserve blank spaces.*placeholder panels.*photograph frames.*writing/);
  for (const details of ["No water.", "No buildings; use tents.", "Footpaths only, no roads."]) {
    const prompt = buildTownMapPrompt(details, "A harbor town with canals, stone buildings and paved roads.");
    assert.ok(prompt.includes("Map details: " + details));
    assert.match(prompt, /Map details take priority over conflicting Village description/);
    assert.ok(prompt.includes("Village description: A harbor town with canals"));
  }
  const imprintMap = buildTownMapPrompt(undefined, "Misty cliffs", "", founded.scenarioImprint);
  assert.match(imprintMap, /Reused timber/);
  assert.match(DEFAULT_TOWN_MAP_NEGATIVE_PROMPT, /text, letters, writing, numerals, labels/);
  assert.match(
    DEFAULT_TOWN_MAP_NEGATIVE_PROMPT,
    /blank annotation panels, placeholder boxes, photograph frames, label plaques/,
  );
  assert.doesNotMatch(DEFAULT_TOWN_MAP_NEGATIVE_PROMPT, /square plots/);
  assert.equal(buildTownMapNegativePrompt(), DEFAULT_TOWN_MAP_NEGATIVE_PROMPT);
  assert.match(buildTownMapNegativePrompt("foggy artifacts"), /writing, numerals.*foggy artifacts/);
  assert.equal(buildTownMapNegativePrompt(DEFAULT_TOWN_MAP_NEGATIVE_PROMPT), DEFAULT_TOWN_MAP_NEGATIVE_PROMPT);
  assert.throws(() => buildTownMapPrompt(undefined, "   "), /cannot be blank/);
  assert.throws(() => buildTownMapPrompt(" ".repeat(3), "forest"), /cannot be blank/);
  assert.throws(() => buildTownMapPrompt("x".repeat(MAX_TOWN_MAP_GENERATION_PROMPT_LENGTH + 1), "forest"), /at most/);
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
  const { configureVillagesRuntime } = await import(pathToFileURL(join(services, "entry/runtime.ts")).href);
  const { VILLAGE_SHARED_SETTING_RULE } = await import(
    pathToFileURL(join(services, "domain/rules/narrative-grounding.ts")).href
  );
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
      setting: "An indoor observatory. ".repeat(58),
      sceneryArtStyle: "Painted scenery. ".repeat(6),
      useVisualLore: true,
      selectedLorebookIds: ["zero-budget-book"],
      loreTokenBudget: 0,
      connectionId: "fixture-image",
    };
    const expectedPrompt = buildTownMapPrompt(input.structure, input.setting, "", null, input.sceneryArtStyle.trim());
    assert.ok(expectedPrompt.length > 3000 && expectedPrompt.length <= 4000);
    await assert.rejects(
      generateVillageTownMap({ ...input, structure: "x".repeat(1500), sceneryArtStyle: "s".repeat(600) }),
      /characters over.*no image request was made/,
    );
    assert.equal(imageRequests.length, 0, "over-budget inputs never dispatch an image request");
    const generated = await generateVillageTownMap(input);
    assert.deepEqual(generated, { image: generatedImage, width: 1536, height: 1024 });
    assert.equal(imageRequests.length, 1);
    assert.deepEqual([imageRequests[0].width, imageRequests[0].height], [2560, 1440]);
    assert.equal(imageRequests[0].appearance, expectedPrompt);
    assert.equal(expectedPrompt.split(VILLAGE_SHARED_SETTING_RULE).length - 1, 1);
    assert.equal(imageRequests[0].promptOverrides[0].prompt, expectedPrompt);
    resultImage = "data:image/png;base64," + "A".repeat(8_000_004);
    await assert.rejects(generateVillageTownMap(input), /too large to store/);
    assert.equal(imageRequests.length, 2, "an oversized result must not trigger another paid request");
    const { requestTownMapGeneration, readTownMapGeneration, startTownMapGeneration } = await import(
      pathToFileURL(join(services, "jobs/town-map-generation.ts")).href
    );
    let stop = startTownMapGeneration();
    resultImage = generatedImage;
    let releaseImage!: () => void;
    imageGate = new Promise<void>((resolve) => {
      releaseImage = resolve;
    });
    const attempt = { targetId: "target-map", ...input, actionId: "map-attempt-one", sourceKey: "original-inputs" };
    const first = await requestTownMapGeneration(attempt);
    assert.equal(first.status, "running", "admission finishes before the provider response");
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(imageRequests.length, 3);
    assert.equal((await requestTownMapGeneration(attempt)).id, first.id);
    await assert.rejects(
      requestTownMapGeneration({ ...attempt, actionId: "map-attempt-two" }),
      /still being generated/,
    );
    assert.equal((await readTownMapGeneration(first.id, "target-map")).status, "running");
    assert.equal(imageRequests.length, 3, "status reads and repeated admission do not spend again");
    releaseImage();
    for (let i = 0; i < 30 && (await readTownMapGeneration(first.id, "target-map")).status === "running"; i++)
      await new Promise((resolve) => setImmediate(resolve));
    const complete = await readTownMapGeneration(first.id, "target-map");
    assert.equal(complete.status, "complete");
    assert.deepEqual(complete.result, generated);
    stop();
    stop = startTownMapGeneration();
    assert.equal(
      (await readTownMapGeneration(first.id, "target-map")).status,
      "complete",
      "completed result survives runtime restart",
    );
    failImage = true;
    imageGate = undefined;
    const second = await requestTownMapGeneration({
      targetId: "target-map",
      ...attempt,
      actionId: "map-attempt-two",
    });
    for (let i = 0; i < 30 && (await readTownMapGeneration(second.id, "target-map")).status === "running"; i++)
      await new Promise((resolve) => setImmediate(resolve));
    assert.equal((await readTownMapGeneration(second.id, "target-map")).status, "failed");
    assert.match((await readTownMapGeneration(second.id, "target-map")).error, /Provider unavailable/);
    assert.equal(imageRequests.length, 4);
    await assert.rejects(requestTownMapGeneration(attempt), /already used/);
    assert.equal(imageRequests.length, 4, "replaying a replaced receipt must not spend again");
    failImage = false;
    imageGate = new Promise<void>((resolve) => {
      releaseImage = resolve;
    });
    const third = await requestTownMapGeneration({
      targetId: "target-map",
      ...attempt,
      actionId: "map-attempt-three",
    });
    await new Promise((resolve) => setImmediate(resolve));
    stop();
    stop = startTownMapGeneration();
    assert.equal((await readTownMapGeneration(third.id, "target-map")).status, "interrupted");
    releaseImage();
    await new Promise((resolve) => setTimeout(resolve, 30));
    assert.equal(
      (await readTownMapGeneration(third.id, "target-map")).status,
      "interrupted",
      "late response cannot overwrite restarted runtime state",
    );
    assert.equal(imageRequests.length, 5, "restart never dispatches a replacement automatically");
    stop();
    const legacy: any = { ...defaultVillageState(), setupAt: "2026-10-03T12:00:00.000Z" };
    delete legacy.venueCapacityPolicy;
    documents.set("villages-village", { id: "villages-village", kind: "village", data: legacy, revision: 1 });
    await generateVillageTownMap({ ...input, capacity: 1 } as any);
    assert.doesNotMatch(imageRequests.at(-1).appearance, /Venue photographs|sixteen|forty-eight/);
    assert.equal(imageRequests.at(-1).appearance.split(VILLAGE_SHARED_SETTING_RULE).length - 1, 1);
  } finally {
    globalThis.fetch = originalFetch;
    releaseRuntime();
  }
  const client = await clientImplementation();
  for (const step of ["People", "Place", "Venues", "Review"]) {
    assert.ok(client.includes(`"${step}"`));
  }
  assert.ok(client.includes('"/maps/generate"'));
  assert.ok(client.includes("More options"));
  assert.equal(client.includes("setupMapOptions"), false);
  assert.equal(client.includes("Fit entire map"), false);
  assert.ok(client.includes("mobile={mobile}"));
  assert.equal(
    client.includes("setupMapGeneratedKey !== setupMapGenerationKey"),
    false,
    "input changes do not gate retained artwork",
  );
  assert.ok(client.includes("lorebooks: setupLorebookDraft"));
  assert.ok(client.includes("setting: setupSetting.trim()"));
  assert.equal(client.includes('mobileStart="contain"'), false);
  assert.equal(client.includes('["none", "Simple map"'), false, "map artwork is required");
  assert.ok(client.includes("setupMapNegativePrompt"));
  assert.equal(client.includes("DEFAULT_TOWN_MAP_SRC"), false);

  const routes = villageRouteSource();
  assert.ok(routes.includes('>("/setup", { bodyLimit: SETTINGS_BODY_LIMIT }'));
  assert.ok(routes.includes('>("/maps/generate"'));

  const village = await readFile(join(services, "features/founding/founding-setup-service.ts"), "utf8");
  assert.ok(
    village.includes('if (setting.length === 0) throw badRequest("Describe the place and world before founding.")'),
  );
  assert.ok(village.includes("state.maps = [townMap]"));

  const builder = await readFile(join(root, "packages/villages/package-definition.mjs"), "utf8");
  assert.equal(builder.includes('"villages-townmap.png"'), false);
  await assert.rejects(access(join(root, "packages/villages/villages-townmap.png")));

  console.log(
    "Villages founding map regression: options, prompt, explicit spend, dimensions, mobile fit control, no bundled map ok",
  );
}

void main();
