import { villageRouteSource } from "./route-source.js";
import { clientImplementation } from "./client-source.js";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const serverRoot = join(root, "packages/villages/src/server");
  const { foundingPhotoOverlaps } = await import(
    pathToFileURL(join(root, "packages/villages/src/client/features/founding/villages-founding-placement.ts")).href
  );
  const { coerceVillageState } = await import(pathToFileURL(join(serverRoot, "features/world/village-store.ts")).href);
  const { runVillageSetup } = await import(pathToFileURL(join(serverRoot, "features/world/village.ts")).href);
  const { parsePlace } = await import("../packages/villages/src/server/domain/rules/founding-record.ts");
  const { assertFoundingScenarioLocked } =
    await import("../packages/villages/src/server/domain/rules/founding-record.ts");
  const { validateFirstDayDescription } =
    await import("../packages/villages/src/server/domain/rules/founding-record.ts");
  const { validateFoundingRoster } = await import("../packages/villages/src/server/domain/rules/founding-record.ts");
  const { readScenarioImprint } = await import(
    pathToFileURL(join(serverRoot, "features/founding/scenario-imprint.ts")).href
  );
  const { readPersona } = await import(pathToFileURL(join(serverRoot, "adapters/engine/catalog.ts")).href);
  const { parseFoundingVenueSuggestions } = await import(
    pathToFileURL(join(serverRoot, "features/founding/founding-drafts.ts")).href
  );
  const { evenlySpacedFoundingPins } = await import(
    pathToFileURL(join(root, "packages/villages/src/client/features/founding/villages-founding-draft.ts")).href
  );
  const suggestion = {
    id: "one",
    name: "Observatory room",
    form: "Converted bedroom",
    description: "Blue corridor door",
    layout: "both",
    commonName: "Sitting room",
    commonDescription: "Overlooks the sea",
    privateName: "Sleeping nook",
    privatePurpose: "Rest",
    x: 0.5,
    descriptionPrivate: "secret",
    residentCharacterId: "changed",
  };
  const venueSuggestions = parseFoundingVenueSuggestions({ venues: [suggestion] }, ["one"]);
  assert.equal(venueSuggestions[0].name, suggestion.name);
  assert.equal("x" in venueSuggestions[0], false);
  assert.equal("descriptionPrivate" in venueSuggestions[0], false);
  assert.equal("residentCharacterId" in venueSuggestions[0], false);
  for (const venues of [
    [],
    [suggestion, suggestion],
    [{ ...suggestion, id: "wrong" }],
    [{ ...suggestion, layout: "unknown" }],
    [{ ...suggestion, privatePurpose: "" }],
  ])
    assert.throws(() => parseFoundingVenueSuggestions({ venues }, ["one"]));
  assert.throws(() => parseFoundingVenueSuggestions(null, ["one"]), /readable Venue suggestions/);
  for (const count of [3, 4, 5]) {
    const ids = Array.from({ length: count }, (_, index) => `venue-${index}`);
    const suggestions = ids.map((id) => ({ ...suggestion, id }));
    assert.deepEqual(
      parseFoundingVenueSuggestions({ venues: [...suggestions].reverse() }, ids).map((venue: any) => venue.id),
      ids,
      "all starting Venues are matched by id, independent of model order",
    );
    for (const venues of [
      suggestions.slice(1),
      [...suggestions, { ...suggestion, id: "extra" }],
      [{ ...suggestions[0], id: "wrong" }, ...suggestions.slice(1)],
      [suggestions[1], ...suggestions.slice(1)],
    ])
      assert.throws(() => parseFoundingVenueSuggestions({ venues }, ids), /every starting Venue exactly once/);
    const pins = evenlySpacedFoundingPins(count);
    assert.equal(pins.length, count);
    assert.equal(new Set(pins.map((pin) => `${pin.x}:${pin.y}`)).size, count);
    assert.ok(pins.every((pin) => pin.x > 0 && pin.x < 1 && pin.y > 0 && pin.y < 1));
  }
  assert.throws(() => evenlySpacedFoundingPins(6));
  const available = new Set(["a", "b", "c", "outsider"]);
  assert.doesNotThrow(() => validateFoundingRoster(["a", "b"], new Set(["a", "b"]), available));
  for (const ids of [[], ["a", "a"], ["gone"], ["a", "b", "c", "outsider"], [42], null])
    assert.throws(() => validateFoundingRoster(ids, new Set(["a"]), available), /available founding villagers/);
  for (const homes of [new Set(["a"]), new Set(["a", "outsider"]), new Set(["a", "b", "c"])])
    assert.throws(() => validateFoundingRoster(["a", "b"], homes, available), /chosen on People/);
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
    coerceVillageState({ wishSystemVersion: 3, setupAt: "2025-01-01T00:00:00Z" }).foundingPreparation,
    null,
    "older villages remain ready",
  );
  assert.deepEqual(
    coerceVillageState({
      wishSystemVersion: 3,
      foundingPreparation: { status: "failed", completedIds: ["one"], currentId: "two", error: "offline" },
    }).foundingPreparation,
    { status: "failed", completedIds: ["one"], venueDetailsSeeded: false, currentId: "two", error: "offline" },
    "preparation progress survives loading",
  );
  assert.deepEqual(
    coerceVillageState({
      wishSystemVersion: 3,
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
      venueDetailsSeeded: false,
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
  assert.equal(
    coerceVillageState({ wishSystemVersion: 3 }).foundingGuidance,
    "",
    "older villages have no narrative direction",
  );
  assert.equal(
    coerceVillageState({ wishSystemVersion: 3, foundingGuidance: "Favor quiet bonds." }).foundingGuidance,
    "Favor quiet bonds.",
  );
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
  assert.doesNotThrow(() => validateFirstDayDescription("We share the rent.", true));
  assert.throws(() => validateFirstDayDescription("", true), /Describe what brings you and the others together here/);
  assert.doesNotThrow(() => validateFirstDayDescription("They gather at dawn.", true));
  assert.doesNotThrow(() => validateFirstDayDescription("", false), "older founded villages keep their record");
  await assert.rejects(
    runVillageSetup({
      ...identity,
      foundingReason: "none",
      foundingDetails: "They gather at dawn.",
      foundingGuidance: "A secret quest",
    }),
    /No preset does not use/,
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
      layoutVersion: 1,
      layout: "common",
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
  assert.equal(parsed.spaces?.[0]?.state.condition, "", "founding details emerge during preparation");
  assert.deepEqual(parsed.spaces?.[0]?.state.items, []);
  assert.deepEqual(parsed.spaces?.[0]?.state.publicFacts, []);
  assert.deepEqual(parsed.spaces?.[0]?.state.features, []);
  assert.throws(() => parsePlace({ ...parsed, form: "" }, true), /Form/);
  assert.throws(() => parsePlace({ ...parsed, description: "" }, true), /exterior/);
  assert.throws(
    () => parsePlace({ ...parsed, layout: "common", spaces: [{ venueClass: "residence", description: "" }] }, true),
    /Common Space/,
  );

  const client = await clientImplementation();
  const routes = villageRouteSource();
  const village =
    (await readFile(join(serverRoot, "features/world/village.ts"), "utf8")) +
    (await readFile(join(serverRoot, "domain/rules/founding-record.ts"), "utf8"));
  const drafts = await readFile(join(serverRoot, "features/founding/founding-drafts.ts"), "utf8");
  assert.ok(client.includes('["People", "Place", "Venues", "Review"]'));
  assert.ok(client.includes("Where are we?"));
  assert.ok(client.includes("What brings you together?"));
  assert.ok(client.includes("Search lorebooks"));
  const editor = await readFile(
    join(root, "packages/villages/src/client/features/founding/villages-founding-editor.tsx"),
    "utf8",
  );
  assert.ok(client.includes("FoundingWorkspace"));
  assert.equal(client.includes("resumeSetupPlacement"), false);
  assert.ok(client.includes("Review village"));
  assert.ok(editor.includes("Assigned villager"));
  assert.ok(editor.includes("Physical form"));
  assert.ok(editor.includes("Private Space"));
  assert.ok(client.includes("generateSetupImage(venue, area, zoneId)"));
  assert.equal(client.includes("generateSetupText(setupVenues, true)"), false);
  assert.equal(client.includes('"/setup/scenario-imprint/draft"'), false, "founding does not ask for a hidden imprint");
  assert.ok(client.includes('setScreen("preparing")'));
  assert.ok(client.includes("Use this saved artwork"));
  assert.ok(client.includes("Change starting Venues"));
  assert.ok(routes.includes('"/setup/venues/suggest"'));
  assert.equal(routes.includes('"/setup/venues/draft"'), false);
  assert.ok(routes.includes("foundingCharacterIds: body.foundingCharacterIds"));
  assert.ok(routes.includes('"/setup/venue-image/generate"'));
  assert.ok(routes.includes('"/setup/venue-image"'));
  assert.ok(routes.includes('"/setup/preparation/retry"'));
  assert.ok(village.includes("image: foundingImage(row.image)"));
  assert.ok(village.includes("seedFoundingVenueDetails(initial,"));
  assert.ok(village.includes("marker.completedIds.includes(villager.characterId)"));
  assert.ok(village.includes("await proposeCompactFounding("));
  assert.equal(village.includes("await storeRemap(id, remap, schedule)"), false);
  assert.ok(village.includes("await queueVillagerAgenda(villager.characterId, true)"));
  assert.ok(village.includes("snapshot.cardsReadable"));
  assert.ok(drafts.includes("selectedLorebookIds"));
  assert.ok(drafts.includes("foundingDetails"));
  const builder = await readFile(join(root, "packages/villages/package-definition.mjs"), "utf8");
  for (const mode of ["rebuild", "pioneer", "prosper", "custom", "none"]) {
    const filename = `founding-${mode}.jpg`;
    assert.ok(builder.includes(`"${filename}"`), `${mode} illustration must be packaged`);
    const bytes = await readFile(join(root, "packages/villages", filename));
    assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff], `${mode} illustration must be a JPEG`);
  }
  assert.match(drafts, /resident:\s*card\s*\?/);
  assert.ok(drafts.includes("areaDescription"));
  console.log("Villages founding flow regression: placement, review, drafts, images, preparation ok");
}

void main();
