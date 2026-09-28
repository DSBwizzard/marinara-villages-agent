import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const clientRoot = join(root, "packages/villages/src/engine/packages/client/src");
  const serverRoot = join(root, "packages/villages/src/engine/packages/server/src");
  const { foundingPhotoOverlaps } = await import(
    pathToFileURL(join(clientRoot, "villages-founding-placement.ts")).href
  );
  const { coerceVillageState } = await import(
    pathToFileURL(join(serverRoot, "services/villages/village-store.ts")).href
  );
  const { parsePlace, runVillageSetup, assertFoundingScenarioLocked, validateFirstDayDescription } = await import(
    pathToFileURL(join(serverRoot, "services/villages/village.ts")).href
  );
  const { readScenarioImprint } = await import(
    pathToFileURL(join(serverRoot, "services/villages/scenario-imprint.ts")).href
  );
  const { readPersona } = await import(pathToFileURL(join(serverRoot, "services/villages/catalog.ts")).href);
  const persona = readPersona({
    id: "persona-a",
    data: {
      name: "Ada",
      convoDisplayName: "Ada of the Vale",
      description: "A patient observer.",
      appearance: "Wears a green coat.",
      personality: "Careful with strangers.",
      backstory: "Traveled through the northern pass.",
      avatarPath: "/portraits/ada.png",
    },
  });
  assert.equal(persona.name, "Ada of the Vale", "the preview uses the name Villages uses");
  assert.equal(persona.description, "A patient observer.");
  assert.equal(persona.appearance, "Wears a green coat.");
  assert.equal(persona.personality, "Careful with strangers.");
  assert.equal(persona.backstory, "Traveled through the northern pass.");
  assert.equal(persona.avatarPath, "/portraits/ada.png");
  assert.match(persona.identity, /Appearance: Wears a green coat\./, "existing prompt identity is preserved");

  for (const picture of [
    { width: 1000, height: 700, photoWidth: 58, photoHeight: 58 },
    { width: 420, height: 630, photoWidth: 72, photoHeight: 72 },
  ]) {
    const first = { x: 0.5, y: 0.5 };
    assert.equal(foundingPhotoOverlaps({ x: 0.5, y: 0.5 }, [first], picture), true, "stacked photos must be rejected");
    assert.equal(
      foundingPhotoOverlaps({ x: 0.5 + (0.15 * picture.photoWidth) / picture.width, y: 0.5 }, [first], picture),
      true,
    );
    assert.equal(
      foundingPhotoOverlaps({ x: 0.5 + (0.25 * picture.photoWidth) / picture.width, y: 0.5 }, [first], picture),
      false,
      "nearby buildings are allowed",
    );
    assert.equal(
      foundingPhotoOverlaps({ x: 0.5, y: 0.5 + (0.25 * picture.photoHeight) / picture.height }, [first], picture),
      false,
    );
    assert.equal(foundingPhotoOverlaps(first, [{ x: null, y: null }], picture), false);
  }

  assert.equal(
    coerceVillageState({ setupAt: "2025-01-01T00:00:00Z" }).foundingPreparation,
    null,
    "older villages remain ready",
  );
  assert.deepEqual(
    coerceVillageState({
      foundingPreparation: { status: "failed", completedIds: ["one"], currentId: "two", error: "offline" },
    }).foundingPreparation,
    { status: "failed", completedIds: ["one"], currentId: "two", error: "offline" },
    "preparation progress survives loading",
  );
  assert.deepEqual(
    coerceVillageState({
      foundingPreparation: {
        status: "pending",
        completedIds: ["one"],
        currentId: "two",
        error: "",
        stage: "model",
        stageStartedAt: "2026-09-28T12:00:00.000Z",
        attempt: 2,
        loreEntryCount: 4,
        modelName: "Flash-class model",
      },
    }).foundingPreparation,
    {
      status: "pending",
      completedIds: ["one"],
      currentId: "two",
      error: "",
      stage: "model",
      stageStartedAt: "2026-09-28T12:00:00.000Z",
      attempt: 2,
      loreEntryCount: 4,
      modelName: "Flash-class model",
    },
    "the active stage and bounded retry count survive a process restart",
  );
  assert.equal(coerceVillageState({}).foundingGuidance, "", "older villages have no narrative direction");
  assert.equal(coerceVillageState({ foundingGuidance: "Favor quiet bonds." }).foundingGuidance, "Favor quiet bonds.");
  const ongoingOnly = readScenarioImprint({
    origin: "",
    worldFacts: ["The sun never fully sets"],
    openingConditions: [],
    visualCues: ["Long amber twilight"],
  });
  assert.equal(ongoingOnly.origin, "", "an ongoing-only Custom scenario does not gain an invented origin");
  assert.deepEqual(ongoingOnly.worldFacts, ["The sun never fully sets"]);
  assert.equal(
    readScenarioImprint({ origin: "Families arrived by sea", worldFacts: [], openingConditions: [], visualCues: [] })
      .origin,
    "Families arrived by sea",
  );
  assert.equal(
    readScenarioImprint({
      origin: "Families arrived by sea",
      worldFacts: ["The sun never fully sets"],
      openingConditions: [],
      visualCues: [],
    }).worldFacts.length,
    1,
  );
  assert.throws(
    () => readScenarioImprint({ origin: "", worldFacts: [], openingConditions: [], visualCues: [] }),
    /at least one/,
  );
  assert.throws(
    () =>
      readScenarioImprint({ origin: "", worldFacts: ["a", "b", "c", "d", "e"], openingConditions: [], visualCues: [] }),
    /at most four/,
  );
  const savedScenario = {
    foundingReason: "rebuild",
    foundingDetails: "The flood was years ago.",
    foundingGuidance: "Keep the first days hopeful.",
    scenarioImprint: readScenarioImprint({
      origin: "Families rebuilt after the flood.",
      worldFacts: ["Stone bridge"],
      openingConditions: [],
      visualCues: [],
    }),
  };
  assert.doesNotThrow(() => assertFoundingScenarioLocked(savedScenario, { ...savedScenario }));
  assert.throws(
    () => assertFoundingScenarioLocked(savedScenario, { ...savedScenario, foundingDetails: "Changed" }),
    /locked/,
  );
  assert.throws(
    () =>
      assertFoundingScenarioLocked(savedScenario, {
        ...savedScenario,
        scenarioImprint: { ...savedScenario.scenarioImprint, origin: "Changed" },
      }),
    /locked/,
  );
  const identity = { name: "Ashwater", setting: "A valley beside the river" };
  assert.throws(() => validateFirstDayDescription("", true), /Describe the village's first day/);
  assert.doesNotThrow(() => validateFirstDayDescription("They gather at dawn.", true));
  assert.doesNotThrow(() => validateFirstDayDescription("", false), "older founded villages keep their record");
  await assert.rejects(
    runVillageSetup({
      ...identity,
      foundingReason: "none",
      foundingDetails: "They gather at dawn.",
      foundingGuidance: "A secret quest",
    }),
    /Open beginning does not use/,
  );
  await assert.rejects(
    runVillageSetup({
      ...identity,
      foundingReason: "rebuild",
      foundingDetails: "A place",
      foundingGuidance: "x".repeat(501),
    }),
    /Narrative direction must be text of at most 500/,
  );
  await assert.rejects(
    runVillageSetup({ ...identity, foundingReason: "custom", foundingDetails: "x".repeat(2_001) }),
    /at most 2,000/,
  );
  const outsideImage = { id: "outer", ref: "global-gallery:outer", url: "/outer.webp" };
  const insideImage = { id: "inner", ref: "global-gallery:inner", url: "/inner.webp" };
  const parsed = parsePlace(
    {
      id: "residence-one",
      name: "Stone Cottage",
      form: "Cottage",
      description: "Stone walls under ivy",
      classes: ["residence"],
      presentation: { x: 0.3, y: 0.4, image: outsideImage },
      occupancy: { playerHome: true, residentCharacterId: null, homeKind: null },
      spaces: [
        {
          venueClass: "residence",
          description: "A hearth and a low table",
          image: insideImage,
          state: {
            condition: "lived in",
            items: ["wooden bowl"],
            publicFacts: ["old chimney"],
            features: [{ text: "blue curtains" }],
          },
        },
      ],
    },
    true,
  );
  assert.deepEqual(parsed.presentation.image, outsideImage);
  assert.deepEqual(parsed.spaces?.[0]?.image, insideImage);
  assert.equal(parsed.spaces?.[0]?.description, "A hearth and a low table");
  assert.equal(parsed.spaces?.[0]?.state.condition, "lived in");
  assert.deepEqual(parsed.spaces?.[0]?.state.items, ["wooden bowl"]);
  assert.deepEqual(parsed.spaces?.[0]?.state.publicFacts, ["old chimney"]);
  assert.equal(parsed.spaces?.[0]?.state.features[0]?.text, "blue curtains");

  const client = await readFile(join(clientRoot, "villages-package-entry.tsx"), "utf8");
  const routes = await readFile(join(serverRoot, "routes/villages.routes.ts"), "utf8");
  const village = await readFile(join(serverRoot, "services/villages/village.ts"), "utf8");
  const drafts = await readFile(join(serverRoot, "services/villages/founding-drafts.ts"), "utf8");
  assert.ok(client.includes("photoPins={setupStep >= 4}"));
  assert.ok(client.includes("What is this village like?"));
  assert.ok(client.includes("What happens on the village&apos;s first day?"));
  assert.ok(client.includes("Open beginning"));
  assert.ok(client.includes("Search lorebooks"));
  assert.ok(client.includes("Reset all venues"));
  assert.ok(client.includes("Place a Residence"));
  assert.ok(client.includes("Place a Gathering Place"));
  assert.ok(client.includes("Replace text with this draft"));
  assert.ok(client.includes("Use in empty fields"));
  assert.ok(client.includes('setScreen("preparing")'));
  assert.ok(client.includes("setupMapGeneratedKey === setupMapGenerationKey"));
  const review =
    client
      .split("{setupStep === 5 ? (")[1]
      ?.split("<div className={`${ELEMENT_TAG}-row`}>\n                {setupStep > 0")[0] ?? "";
  assert.ok(review.includes("Review your village"));
  assert.ok(review.includes("Day 1:"));
  assert.equal(review.includes("onChange="), false, "the review must not edit fields");
  assert.equal(review.includes("Generate"), false, "the review must not draft content");
  assert.ok(routes.includes('"/setup/venues/draft"'));
  assert.ok(routes.includes('"/setup/scenario-imprint/draft"'));
  assert.ok(routes.includes('"/setup/venue-image/generate"'));
  assert.ok(routes.includes('"/setup/venue-image"'));
  assert.ok(routes.includes('"/setup/preparation/retry"'));
  assert.ok(village.includes("image: foundingImage(row.image)"));
  assert.ok(village.includes("features: features.map"));
  assert.ok(village.includes("marker.completedIds.includes(id)"));
  assert.ok(village.includes("await proposeCompactFounding("));
  assert.ok(village.includes("await storeRemap(id, remap, schedule)"));
  assert.ok(village.includes("readNativeScheduleSnapshot(new Date())"));
  assert.ok(village.includes("snapshot.cardsReadable"));
  assert.ok(drafts.includes("selectedLorebookIds"));
  assert.ok(drafts.includes("foundingGuidance"));
  const builder = await readFile(join(root, "scripts/build-feature-packages.mjs"), "utf8");
  for (const mode of ["rebuild", "pioneer", "prosper", "custom", "none"]) {
    const filename = `founding-${mode}.jpg`;
    assert.ok(builder.includes(`"${filename}"`), `${mode} illustration must be packaged`);
    const bytes = await readFile(join(root, "packages/villages", filename));
    assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff], `${mode} illustration must be a JPEG`);
  }
  assert.match(drafts, /resident:\s*card\s*\?/);
  assert.ok(drafts.includes("row.guidance"));
  console.log("Villages founding flow regression: placement, review, drafts, images, preparation ok");
}

void main();
