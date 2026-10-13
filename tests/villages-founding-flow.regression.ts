import { createFoundingDrafts } from "../packages/villages/src/server/features/founding/founding-drafts-service.js";
import { villageRouteSource } from "./route-source.js";
import { clientImplementation } from "./client-source.js";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type {
  CapabilityDocumentStore,
  CapabilityResolvedLanguageModel,
  CapabilityRuntimeHost,
} from "@marinara-engine/shared";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import type { Ledger } from "../packages/villages/src/server/domain/models/usage-model.js";
import { reportFoundingProgress } from "../packages/villages/src/server/features/founding/founding-progress.js";
import { draftScenarioImprint } from "../packages/villages/src/server/features/founding/scenario-imprint.js";
import { proposeCompactFounding } from "../packages/villages/src/server/features/founding/founding-compact.js";
import { parseCompactFoundingCompletion } from "../packages/villages/src/server/domain/rules/compact-founding-rules.js";
import {
  suggestStartingVenues,
  seedFoundingVenueDetails,
  generateFoundingVenueImage,
  uploadFoundingVenueImage,
} from "../packages/villages/src/server/features/founding/founding-drafts.js";
import {
  proposeVillage,
  proposePublicVenueNames,
  draftVillageVenueDescriptions,
} from "../packages/villages/src/server/features/founding/village-bootstrap.js";
import {
  createActivationScope,
  activationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";

async function reviewNavigation() {
  const { createFoundingGotoSetupStep } =
    await import("../packages/villages/src/client/features/founding/setup-controller.js");
  let reviewed = false,
    step = 4,
    problem = "",
    blocked = "Place every starting Venue photograph.";
  const ports = {
    catalog: [{ id: "resident" }],
    connectionSetupProblem: "",
    loadCatalog: async () => {},
    loadLorebooks: async () => {},
    loadPersonas: async () => {},
    personaDraft: "player",
    personas: [{ id: "player" }],
    residentContextProblem: "",
    setMovingSetupVenueId() {},
    setSetupEditorOpen() {},
    setSetupProblem: (value: string) => {
      problem = value;
    },
    setSetupStep: (value: number) => {
      step = value;
    },
    setSetupMapReviewed: (value: boolean) => {
      reviewed = value;
    },
    setupBlocker: (reviewingMap?: boolean) => {
      assert.equal(reviewingMap, true);
      return blocked;
    },
    setupFoundingDetails: "Neighbors sharing a home",
    setupFoundingVillagerIds: ["resident"],
    setupHomeCount: 1,
    setupMapBusy: false,
    setupMapSrc: "map",
    setupName: "Village",
    setupPlayerRole: { enabled: true, title: "Project Coordinator", explanation: "" },
    setupSetting: "Coastal rooms",
    setupStep: 4,
    setupSuggestionsBusy: false,
    setupVenueBusy: false,
    snapshot: { isFounded: true },
  };
  const goto = createFoundingGotoSetupStep(ports as any);
  goto(4);
  assert.equal(reviewed, false, "re-entering restored Review cannot acknowledge an invalid map");
  assert.match(problem, /Place every/);
  blocked = "";
  goto(4);
  assert.equal(reviewed, true, "successful Review navigation incorporates map acknowledgment");
  assert.equal(step, 4);
  assert.equal(problem, "");
  reviewed = false;
  ports.setupMapSrc = "";
  ports.snapshot.isFounded = false;
  goto(4);
  assert.equal(reviewed, false, "missing artwork cannot be acknowledged");
  assert.match(problem, /Generate or upload map artwork/);
}

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const { savedFoundingStep, SETUP_STEPS } =
    await import("../packages/villages/src/client/features/founding/founding-steps.js");
  for (const [step, expected] of [
    [0, 0],
    [1, 1],
    [2, 3],
    [3, 4],
  ])
    assert.equal(savedFoundingStep({ step }), expected);
  for (const [step, phase] of SETUP_STEPS.entries()) assert.equal(savedFoundingStep({ step, phase }), step);
  assert.equal(savedFoundingStep({ step: NaN }), 0);
  assert.equal(savedFoundingStep({ step: 2, mapSource: "none" }), 2);
  assert.equal(savedFoundingStep({ step: 3, mapSource: "none" }), 2);
  assert.equal(savedFoundingStep({ step: 3, phase: "Review", mapSource: "none", mapImage: "cached" }), 4);

  const serverRoot = join(root, "packages/villages/src/server");
  const { foundingPhotoOverlaps } = await import(
    pathToFileURL(join(root, "packages/villages/src/client/features/founding/villages-founding-placement.ts")).href
  );
  const { coerceVillageState } = await import(pathToFileURL(join(serverRoot, "domain/decoding/village-codec.ts")).href);
  const { createFoundingSetup } = await import(
    pathToFileURL(join(serverRoot, "features/founding/founding-setup-service.ts")).href
  );
  // These deliberately invalid inputs fail before a connection is needed.
  const unexpected = () => {
    throw Error("Unexpected connection in a setup validation probe.");
  };
  const setupPorts = {
    readVillageState: unexpected,
    mutateVillageState: unexpected,
    buildVillageSnapshot: unexpected,
    readTownMapSubmission: unexpected,
    readVillageConnectionSettings: unexpected,
    validateVillageSetupConnections: unexpected,
    readLinkedPersona: unexpected,
    listVillagerCards: unexpected,
    prepareFoundedVillage: unexpected,
    queueVillagerAgenda: unexpected,
    queueMicrotask: unexpected,
    readVillageLore: unexpected,
    proposeVillage: unexpected,
    proposePublicVenueNames: unexpected,
    draftVillageVenueDescriptions: unexpected,
  };
  const { runVillageSetup } = createFoundingSetup(setupPorts);
  const { parsePlace } = await import("../packages/villages/src/server/domain/rules/founding-record.ts");
  const { assertFoundingScenarioLocked } =
    await import("../packages/villages/src/server/domain/rules/founding-record.ts");
  const { validateFirstDayDescription } =
    await import("../packages/villages/src/server/domain/rules/founding-record.ts");
  const { validateFoundingRoster } = await import("../packages/villages/src/server/domain/rules/founding-record.ts");
  const { readScenarioImprint } = await import(pathToFileURL(join(serverRoot, "domain/rules/scenario-rules.ts")).href);
  const { readPersona } = await import(pathToFileURL(join(serverRoot, "adapters/engine/catalog.ts")).href);
  const { parseFoundingVenueSuggestions } = await import(
    pathToFileURL(join(serverRoot, "domain/rules/founding-draft-rules.ts")).href
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
  const noMapSetup = createFoundingSetup({
    ...setupPorts,
    readVillageState: async () => coerceVillageState({ wishSystemVersion: 3 }),
    readTownMapSubmission: async () => ({
      image: "",
      size: null,
      view: { fit: "cover" as const, focusX: 50, focusY: 50, zoom: 1 },
    }),
  });
  await assert.rejects(
    noMapSetup.runVillageSetup({ ...identity, foundingReason: "custom", foundingDetails: "We gather at dawn." }),
    /Generate or upload map artwork before founding/,
  );

  for (const foundingReason of [
    "fresh-start",
    "refuge",
    "shared-project",
    "discovery",
    "homecoming",
    "something-else",
  ]) {
    await assert.rejects(
      runVillageSetup({ ...identity, foundingReason, foundingDetails: "They gather at dawn." }),
      /Choose a founding scenario/,
    );
  }
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
          name: "Hearth room",
          purpose: "Sharing meals",
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
    () =>
      parsePlace(
        {
          ...parsed,
          layout: "common",
          spaces: [{ venueClass: "residence", name: "Room", purpose: "Meals", description: "" }],
        },
        true,
      ),
    /visible Zone/,
  );

  const client = await clientImplementation();
  const routes = villageRouteSource();
  const village =
    (await readFile(join(serverRoot, "features/world/village.ts"), "utf8")) +
    (await readFile(join(serverRoot, "features/world/village-service.ts"), "utf8")) +
    (await readFile(join(serverRoot, "features/founding/founding-setup-service.ts"), "utf8")) +
    (await readFile(join(serverRoot, "features/residents/resident-agenda-service.ts"), "utf8")) +
    (await readFile(join(serverRoot, "domain/rules/founding-record.ts"), "utf8"));
  const drafts = await readFile(join(serverRoot, "features/founding/founding-drafts-service.ts"), "utf8");
  assert.ok(client.includes('["People", "Place", "Map", "Venues", "Review"]'));
  assert.ok(client.includes("Place and world"));
  assert.ok(client.includes("Starting circumstances"));
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
  assert.equal(client.includes("Use this saved artwork"), false);
  assert.ok(client.includes("Change starting Venues"));
  assert.ok(routes.includes('"/setup/venues/suggest"'));
  assert.equal(routes.includes('"/setup/venues/draft"'), false);
  assert.ok(routes.includes("foundingCharacterIds: body.foundingCharacterIds"));
  assert.ok(routes.includes('"/setup/venue-image/generate"'));
  assert.ok(routes.includes('"/setup/venue-image"'));
  assert.ok(routes.includes('"/setup/preparation/retry"'));
  assert.ok(village.includes("image: foundingImage(row.image)"));
  const preparation = await readFile(join(serverRoot, "features/founding/preparation-service.ts"), "utf8");
  assert.ok(preparation.includes("seedFoundingVenueDetails(initial,"));
  assert.ok(preparation.includes("marker.completedIds.includes(villager.characterId)"));
  assert.ok(village.includes("await proposeCompactFounding("));
  assert.equal(village.includes("await storeRemap(id, remap, schedule)"), false);
  assert.ok(preparation.includes("await queueVillagerAgenda(villager.characterId, true)"));
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

/** Complete recipe graphs and native accounting; model/HTTP/storage inputs are synthetic. */
async function foundingConnectionOwnership() {
  function nativePorts<T extends object>(ports: Partial<T>): T {
    return new Proxy(ports, {
      get(target, key, receiver) {
        if (!Reflect.has(target, key)) throw new Error(`Unexpected native test port: ${String(key)}`);
        return Reflect.get(target, key, receiver);
      },
    }) as T;
  }
  const deferred = () => {
    let resolve!: () => void;
    const promise = new Promise<void>((done) => {
      resolve = done;
    });
    return { promise, resolve };
  };
  type Operation =
    "progress" | "scenario" | "compact" | "seed" | "suggest" | "image" | "upload" | "places" | "names" | "descriptions";
  type Stage =
    "read" | "write" | "lore" | "agent" | "resolve" | "provider" | "callback" | "card" | "persona" | "gallery";
  type Variant = "ordinary" | "cas" | "seed-changed" | "status-changed" | "resident-changed" | "failure" | "disposed";
  const scenarios: Array<[Operation, Stage, Variant?]> = [
    ["progress", "read"],
    ["progress", "write"],
    ["progress", "write", "cas"],
    ["progress", "write", "seed-changed"],
    ["progress", "write", "status-changed"],
    ["progress", "write", "resident-changed"],
    ["progress", "read", "failure"],
    ["progress", "write", "failure"],
    ["progress", "read", "disposed"],
    ["scenario", "lore"],
    ["scenario", "agent"],
    ["scenario", "resolve"],
    ["scenario", "provider"],
    ["scenario", "provider", "failure"],
    ["compact", "resolve"],
    ["compact", "callback"],
    ["compact", "provider"],
    ["seed", "card"],
    ["seed", "lore"],
    ["seed", "callback"],
    ["seed", "provider"],
    ["suggest", "persona"],
    ["suggest", "provider"],
    ["image", "card"],
    ["image", "lore"],
    ["image", "gallery"],
    ["upload", "gallery"],
    ["places", "agent"],
    ["names", "provider"],
    ["descriptions", "resolve"],
  ];
  const png =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8AAAwAB/AGtLQAAAABJRU5ErkJggg==";
  const compactReply = (label: string) => ({
    routine: `${label} reads quietly.`,
    wishes: [],
    palette: Array.from({ length: 6 }, (_, index) => ({
      activity: `${label} reading ${index}`,
      venue: 0,
      status: "idle",
      flexible: true,
      duration: 180,
      parts: [0, 1, 2, 3],
    })),
    days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
    rhythm: [],
  });
  const draftRows = [
    {
      id: "equal-venue",
      venueClass: "residence",
      residentCharacterId: "equal-resident",
      name: "Resident room",
      form: "Room",
      description: "Blue door",
      layout: "exterior",
    },
    {
      id: "player-room",
      venueClass: "residence",
      residentCharacterId: "",
      name: "Your room",
      form: "Room",
      description: "Green door",
      layout: "exterior",
    },
    {
      id: "gathering",
      venueClass: "gathering",
      residentCharacterId: "",
      name: "Hall",
      form: "Hall",
      description: "Large doors",
      layout: "exterior",
    },
  ];
  for (const [operation, stage, variant = "ordinary"] of scenarios) {
    const failure = new Error(`controlled ${operation}/${stage}`);
    const calls: Array<{ owner: string; stage: string }> = [],
      callbacks: Array<{ owner: string; stage?: string; modelName?: string }> = [];
    function fixture(label: string, hold: boolean) {
      const scope = createActivationScope(),
        entered = deferred(),
        gate = deferred();
      let held = false;
      const state = coerceVillageState({
        wishSystemVersion: 3,
        seed: "equal-founding-seed",
        name: label,
        setting: "Quiet harbor",
        storyPace: "off",
        setupAt: new Date().toISOString(),
        foundedAt: new Date().toISOString(),
        selectedLorebookIds: ["visual"],
        foundingPreparation: {
          status: "pending",
          phase: "residents",
          currentId: "equal-resident",
          completedIds: [],
          stage: "reading",
          error: "",
        },
        venues: [
          {
            id: "equal-venue",
            name: `${label} room`,
            form: "Room",
            description: "Blue door",
            occupancy: { residentCharacterId: "equal-resident" },
          },
        ],
      });
      type Row = NonNullable<Awaited<ReturnType<CapabilityDocumentStore["getById"]>>>;
      const record = (id: string, kind: string, data: unknown): Row => ({
        id,
        packageId: "villages",
        kind,
        data,
        revision: 1,
        name: id,
        description: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      const rows = new Map([
        ["villages-village", record("villages-village", "village", state)],
        [
          "villages-connections",
          record("villages-connections", "settings", {
            systemConnectionId: "",
            narrationConnectionId: "",
            imageConnectionId: "",
          }),
        ],
      ]);
      async function pause(at: Stage) {
        calls.push({ owner: label, stage: at });
        if (!hold || held || at !== stage) return;
        held = true;
        entered.resolve();
        await gate.promise;
        if (variant === "failure") throw failure;
      }
      const documents: CapabilityDocumentStore = {
        async getById(_pkg, id) {
          if (id === "villages-village") await pause("read");
          return structuredClone(rows.get(id) ?? null);
        },
        async list(_pkg, kind) {
          return structuredClone([...rows.values()].filter((row) => row.kind === kind));
        },
        async create(input) {
          const row = { ...structuredClone(input), revision: 1 };
          rows.set(input.id, row);
          return structuredClone(row);
        },
        async update(input) {
          if (input.id === "villages-village") await pause("write");
          const old = rows.get(input.id);
          if (!old || old.revision !== input.expectedRevision) return null;
          const row = { ...old, ...structuredClone(input), revision: old.revision + 1 };
          rows.set(input.id, row);
          return structuredClone(row);
        },
        async remove(_pkg, id, revision) {
          if (rows.get(id)?.revision !== revision) return false;
          return rows.delete(id);
        },
      };
      const reply = () =>
        label === "B" || operation === "scenario"
          ? { origin: "", worldFacts: [`${label} world`], openingConditions: [], visualCues: [] }
          : operation === "compact"
            ? compactReply(label)
            : operation === "seed"
              ? {
                  venues: [
                    {
                      id: "equal-venue",
                      condition: `${label} tidy`,
                      items: ["Books"],
                      publicFacts: ["Open window"],
                      features: [],
                    },
                  ],
                }
              : operation === "suggest"
                ? {
                    venues: draftRows.map((row) => ({
                      ...row,
                      name: `${label} ${row.name}`,
                      layout: "common",
                      commonName: "Shared room",
                      commonPurpose: "Conversation",
                      commonDescription: "A table",
                      privateName: "",
                      privatePurpose: "",
                      privateDescription: "model secret",
                      x: 0.9,
                    })),
                  }
                : operation === "places"
                  ? { venues: [{ name: `${label} courtyard` }] }
                  : operation === "names"
                    ? { names: [`${label} Hall`, `${label} Court`, `${label} Garden`] }
                    : { descriptions: [{ id: "equal-venue", text: `${label} stone room.` }] };
      const model: CapabilityResolvedLanguageModel = {
        name: `${label}-model`,
        model: "fixture",
        connectionId: `${label}-text`,
        maxContext: 12000,
        maxOutputTokens: 4000,
        fitContext(messages, options) {
          assert.equal(this.connectionId, `${label}-text`, "fitting uses its originating model");
          assert.equal(this.name, `${label}-model`);
          assert.equal(activationScope(), scope);
          return {
            messages,
            maxTokens: options?.maxTokens,
            estimatedTokensBefore: 100,
            estimatedTokensAfter: 100,
            trimmed: false,
          };
        },
        async chatComplete() {
          assert.equal(this, model, "native provider receiver is preserved");
          assert.equal(activationScope(), scope);
          await pause("provider");
          return {
            content: JSON.stringify(reply()),
            finishReason: "stop",
            usage: { promptTokens: 1, completionTokens: 1 },
          };
        },
      };
      const models = nativePorts<CapabilityRuntimeHost["languageModels"]>({
        async resolveForRequest(request) {
          assert.equal(this, models, "native resolver receiver is preserved");
          assert.equal(activationScope(), scope);
          assert.equal(request.connectionId, `${label}-text`);
          await pause("resolve");
          return model;
        },
      });
      const release = scope.run(() =>
        configureVillagesRuntime(
          nativePorts<CapabilityRuntimeHost>({
            persistence: nativePorts<CapabilityRuntimeHost["persistence"]>({ documents }),
            languageModels: models,
            resources: {
              async listCharacters() {
                assert.equal(activationScope(), scope);
                await pause("card");
                return [
                  {
                    id: "equal-resident",
                    comment: "",
                    data: { name: `${label} reader`, description: "Quiet reading", tags: [] },
                  },
                ];
              },
              async listPersonas() {
                assert.equal(activationScope(), scope);
                await pause("persona");
                return [{ id: "equal-persona", data: { name: `${label} player`, description: "Reads quietly" } }];
              },
              async listLorebooks() {
                return [];
              },
              async listEligibleLorebookEntries() {
                return [];
              },
            },
            async getAgentConfig() {
              assert.equal(activationScope(), scope);
              await pause("agent");
              return { connectionId: `${label}-text`, settings: { imageConnectionId: `${label}-brush` } };
            },
            isDebugAgentsEnabled() {
              assert.equal(activationScope(), scope);
              return false;
            },
            logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
          }),
        ),
      );
      const world = () => rows.get("villages-village")!.data as VillageState;
      const requests = () => (rows.get("villages-ai-usage")?.data as Ledger | undefined)?.requests ?? [];
      return { scope, entered, gate, pause, release, rows, world, requests, label };
    }
    const a = fixture("A", true),
      b = fixture("B", false),
      oldFetch = globalThis.fetch;
    const clearA = installDefaultActivation(a.scope, () => {});
    let clearB = () => {};
    globalThis.fetch = async (input, init) => {
      const owner = activationScope() === a.scope ? a : activationScope() === b.scope ? b : undefined;
      assert(owner);
      const path = new URL(String(input)).pathname;
      if (path === "/api/lorebooks") await owner.pause("lore");
      if (path === "/api/characters/avatar-generation") {
        const request = JSON.parse(String(init?.body));
        assert.match(request.appearance, /eye-level landscape view/u);
        assert.match(request.appearance, /works behind chat overlays/u);
        assert.match(request.appearance, /recognizable at thumbnail size/u);
        assert.match(request.appearance, /application supplies the Polaroid frame/u);
        assert.equal(request.width, 1216);
        assert.equal(request.height, 832);
        await owner.pause("provider");
      }
      if (path === "/api/global-gallery/upload") await owner.pause("gallery");
      const payload =
        path === "/api/connections"
          ? [
              { id: `${owner.label}-text`, provider: "fixture", model: "fixture" },
              { id: `${owner.label}-brush`, provider: "image_generation" },
            ]
          : path === "/api/lorebooks"
            ? [{ id: "visual", name: "Visual", enabled: true }]
            : path.endsWith("/entries")
              ? [{ id: "blue", name: "Color", content: `${owner.label} blue doors`, enabled: true, constant: true }]
              : path.endsWith("/folders")
                ? []
                : path === "/api/characters/avatar-generation"
                  ? { image: png }
                  : path === "/api/global-gallery/upload"
                    ? { id: `${owner.label}-image`, url: `/api/global-gallery/file/${owner.label}.png` }
                    : {};
      return new Response(JSON.stringify(payload), { headers: { "content-type": "application/json" } });
    };
    const scenarioInput = {
      setting: "Quiet harbor",
      foundingDetails: "A shared study begins.",
      selectedLorebookIds: ["visual"],
    };
    const compactContext = {
      village: "Quiet harbor",
      setting: "Quiet harbor",
      home: "Room",
      card: { id: "equal-resident", name: "Reader", tags: [] },
      venues: [],
      lore: [],
      activeWishes: [],
      completedWishes: [],
      schedule: null,
      allowInitialWish: false,
    };
    try {
      const work =
        operation === "progress"
          ? reportFoundingProgress("equal-founding-seed", { stage: "model", modelName: "A-model" }, "equal-resident")
          : operation === "scenario"
            ? draftScenarioImprint(scenarioInput)
            : operation === "compact"
              ? proposeCompactFounding(compactContext, async (modelName) => {
                  assert.equal(activationScope(), a.scope);
                  callbacks.push({ owner: "A", modelName });
                  await a.pause("callback");
                })
              : operation === "seed"
                ? seedFoundingVenueDetails(a.world(), async (progress) => {
                    assert.equal(activationScope(), a.scope);
                    callbacks.push({ owner: "A", stage: progress.stage, modelName: progress.modelName });
                    await a.pause("callback");
                  })
                : operation === "suggest"
                  ? suggestStartingVenues({ ...scenarioInput, playerPersonaId: "equal-persona", venues: draftRows })
                  : operation === "image"
                    ? generateFoundingVenueImage({ ...scenarioInput, venue: draftRows[0] })
                    : operation === "upload"
                      ? uploadFoundingVenueImage({ image: png, name: "Uploaded room" })
                      : operation === "places"
                        ? proposeVillage("Quiet harbor")
                        : operation === "names"
                          ? proposePublicVenueNames("Quiet harbor")
                          : draftVillageVenueDescriptions("Quiet harbor", [
                              { id: "equal-venue", name: "Room", classes: ["residence"] },
                            ]);
      const outcome = work.then(
        (value) => ({ value, error: undefined }),
        (error) => ({ value: undefined, error: error as unknown }),
      );
      await Promise.race([
        a.entered.promise,
        outcome.then((result) => assert.fail(`No ${operation}/${stage} pause: ${String(result.error)}`)),
      ]);
      clearB = installDefaultActivation(b.scope, () => {});
      const independent = await draftScenarioImprint(scenarioInput);
      assert.deepEqual(independent.imprint.worldFacts, ["B world"]);
      await reportFoundingProgress("equal-founding-seed", { stage: "model", modelName: "B-model" }, "equal-resident");
      assert.equal(b.requests().length, 1);
      if (["cas", "seed-changed", "status-changed", "resident-changed"].includes(variant)) {
        const row = a.rows.get("villages-village")!,
          state = structuredClone(a.world());
        if (variant === "cas") state.spriteCardFlipEnabled = false;
        if (variant === "seed-changed") state.seed = "new-world";
        if (variant === "status-changed") state.foundingPreparation!.status = "ready";
        if (variant === "resident-changed") state.foundingPreparation!.currentId = "next-resident";
        a.rows.set(row.id, { ...row, revision: row.revision + 1, data: state });
      }
      if (variant === "disposed") a.scope.dispose();
      a.gate.resolve();
      const result = await outcome;
      if (variant === "failure" && operation === "progress")
        assert.equal(result.error, failure, "native document failure keeps exact identity");
      else if (variant === "failure") assert.match(String(result.error), new RegExp(failure.message));
      else if (variant === "disposed") assert(result.error instanceof Error);
      else assert.equal(result.error, undefined, `${operation}/${stage} succeeds`);
      assert.equal(b.world().foundingPreparation!.modelName, "B-model", "A cannot rewrite B's preparation marker");
      assert.equal(b.requests().length, 1, "A does not borrow or duplicate B's usage receipt");
      assert.equal(b.requests()[0]!.connectionId, "B-text");
      const paid = operation !== "progress" && operation !== "upload";
      assert.equal(a.requests().length, paid ? 1 : 0, "native usage records stay with A");
      if (paid) assert.equal(a.requests()[0]!.connectionId, operation === "image" ? "A-brush" : "A-text");
      if (operation === "progress") {
        const marker = a.world().foundingPreparation!;
        if (["seed-changed", "status-changed", "resident-changed", "failure", "disposed"].includes(variant))
          assert.equal(marker.modelName, undefined, "changed authority or failure does not apply stale progress");
        else {
          assert.equal(marker.modelName, "A-model");
          assert(marker.stageStartedAt);
        }
        if (variant === "cas")
          assert.equal(a.world().spriteCardFlipEnabled, false, "real CAS retry preserves winning fields");
      }
      if (operation === "scenario" && variant !== "failure")
        assert.deepEqual(result.value, {
          imprint: { origin: "", worldFacts: ["A world"], openingConditions: [], visualCues: [] },
        });
      if (operation === "compact") {
        assert.deepEqual(callbacks, [{ owner: "A", modelName: "A-model" }]);
        assert.equal(calls.filter((call) => call.owner === "A" && call.stage === "provider").length, 1);
        const saved = parseCompactFoundingCompletion(
          { content: JSON.stringify(compactReply("A")), finishReason: "stop" },
          compactContext,
        );
        assert.equal(saved.agenda.routineSummary, "A reads quietly.");
        assert.equal(
          calls.filter((call) => call.owner === "A" && call.stage === "provider").length,
          1,
          "saved reply validation dispatches no model",
        );
      }
      if (operation === "seed") {
        assert.deepEqual(
          callbacks.map((callback) => callback.stage),
          ["resolving", "model", "validating"],
        );
        assert.equal(callbacks[1]!.modelName, "A-model");
        assert.equal((result.value as Record<string, { condition: string }>)["equal-venue"]!.condition, "A tidy");
      }
      if (operation === "suggest") {
        const suggestions = (result.value as { venues: Array<Record<string, unknown>> }).venues;
        assert.equal(suggestions.length, 3);
        assert(suggestions.every((venue) => !("privateDescription" in venue) && !("x" in venue)));
      }
      if (operation === "image" || operation === "upload") assert.equal((result.value as { id: string }).id, "A-image");
      if (operation === "names") assert.deepEqual(result.value, ["A Hall", "A Court", "A Garden"]);
      if (operation === "descriptions") assert.deepEqual(result.value, { "equal-venue": "A stone room." });
      assert.equal(
        calls.filter((call) => call.owner === "B" && call.stage === "provider").length,
        1,
        "B has only its independent request",
      );
    } finally {
      a.gate.resolve();
      clearA();
      clearB();
      a.release();
      b.release();
      a.scope.dispose();
      b.scope.dispose();
      globalThis.fetch = oldFetch;
    }
  }
  console.log(
    "Villages founding:30 paused assembled recipe/accounting/progress CAS cases passed (synthetic native model/HTTP)",
  );
}

async function foundingArchitecturePrompts() {
  const prompts: string[] = [];
  let galleryCalls = 0;
  const unused = () => {
    throw new Error("Unexpected provider or catalog request");
  };
  const service = createFoundingDrafts({
    findVillagerCard: async () => null,
    readLinkedPersona: async () => null,
    readVillageLore: unused,
    readVillageVisualLore: async () => "",
    villagesLanguageModels: unused,
    villagesConnectionIdFor: unused,
    completeWithRoom: unused,
    decodeVillageImageDataUrl: unused,
    generateVillageImage: async (input) => {
      prompts.push(input.prompt);
      return { dataUrl: "fixture", mime: "image/png", bytes: new Uint8Array([1]) };
    },
    uploadVillageGalleryImage: async () => {
      galleryCalls++;
      return { ref: "global-gallery:fixture", id: "fixture", url: "/fixture.png" };
    },
  });
  const venue = {
    id: "bungalow",
    name: "Professor Mari's Bungalow",
    venueClass: "residence",
    form: "A pleasant resort bungalow",
    description: "A small timber bungalow with a low roof.",
    spaceDescription: "A desk under the window.",
    layout: "both",
    areas: [
      { id: "common", name: "Study Nook" },
      { id: "private", name: "Retreat" },
    ],
  };
  for (const area of ["exterior", "interior", "private"]) {
    const appearance =
      area === "exterior"
        ? venue.description
        : area === "interior"
          ? "A desk under the window."
          : "A quiet resting corner.";
    const result = await service.generateFoundingVenueImage({
      venue,
      area,
      setting: "A tropical resort",
      privateOwnerId: "player",
      zoneName: area === "interior" ? "Study Nook" : "Retreat",
      zoneAppearance: appearance,
    });
    assert.equal(result.url, "/fixture.png");
    const prompt = prompts.at(-1)!;
    assert.ok(prompt.includes("Physical form: A pleasant resort bungalow"));
    assert.ok(prompt.includes("Venue form defines the whole place"));
    assert.ok(prompt.includes("do not invent materials, windows or proportions"));
    assert.ok(prompt.includes(appearance));
    assert.ok(prompt.length <= 4000);
    if (area !== "exterior") {
      assert.ok(prompt.includes("Public exterior context for architectural continuity only: " + venue.description));
      assert.ok(prompt.includes("Do not invent or show adjoining rooms"));
      assert.ok(!prompt.includes(area === "private" ? "A desk under the window." : "A quiet resting corner."));
    } else assert.ok(!prompt.includes("Public exterior context"));
  }
  const before = prompts.length;
  assert.equal(galleryCalls, before);
  await assert.rejects(
    service.generateFoundingVenueImage({
      venue,
      area: "private",
      privateOwnerId: "resident",
      zoneAppearance: "Hidden contents",
      setting: "Resort",
    }),
    /Hidden personal spaces/,
  );
  assert.equal(prompts.length, before, "hidden resident space sends no image request");
  const overflowing = {
    ...venue,
    name: "n".repeat(100),
    form: "f".repeat(240),
    description: "e".repeat(1000),
    areas: Array.from({ length: 5 }, (_, id) => ({ id: String(id), name: "z".repeat(100) })),
  };
  const original = structuredClone(overflowing);
  await assert.rejects(
    service.generateFoundingVenueImage({
      venue: overflowing,
      area: "interior",
      setting: "Resort",
      zoneName: "s".repeat(100),
      zonePurpose: "p".repeat(240),
      zoneAppearance: "a".repeat(1000),
      sceneryArtStyle: "v".repeat(600),
    }),
    /too long for an image prompt/,
  );
  assert.equal(prompts.length, before, "over-budget required facts send no image request");
  assert.deepEqual(overflowing, original, "failed generation preserves authored draft");
  assert.equal(galleryCalls, before, "rejected requests create no gallery result");

  console.log(
    "Founding images: shared architecture across Exterior/Common/player Private; resident Private guard retained.",
  );
}

await main()
  .then(foundingArchitecturePrompts)
  .then(reviewNavigation)
  .then(foundingConnectionOwnership)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
