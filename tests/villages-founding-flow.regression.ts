import { sharedVenuesFixture } from "./helpers/venues.fixture.js";
import { defaultVillageFixture as defaultVillageState } from "./helpers/venues.fixture.js";
import {
  FOUNDING_STEP,
  savedFoundingStep,
  SETUP_STEPS,
} from "../packages/villages/src/client/features/founding/founding-steps.js";
import { newSetupVenue } from "../packages/villages/src/client/features/founding/FoundingPanels.js";
import { createFoundingRestoreSetupDraft } from "../packages/villages/src/client/features/founding/draft-controller.js";
import { emptyFoundingWorkspace } from "../packages/villages/src/client/features/founding/villages-founding-workspace-state.js";
import { venueFixture } from "./helpers/venues.fixture.js";
import type {
  CapabilityDocumentStore,
  CapabilityResolvedLanguageModel,
  CapabilityRuntimeHost,
} from "@marinara-engine/shared";
import assert from "node:assert/strict";
import {
  activationScope,
  createActivationScope,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { Ledger } from "../packages/villages/src/server/domain/models/usage-model.js";
import type { VillageState } from "../packages/villages/src/server/domain/models/world.js";
import { parseCompactFoundingCompletion } from "../packages/villages/src/server/domain/rules/compact-founding-rules.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { proposeCompactFounding } from "../packages/villages/src/server/features/founding/founding-compact.js";
import { createFoundingDrafts } from "../packages/villages/src/server/features/founding/founding-drafts-service.js";
import {
  generateFoundingVenueImage,
  suggestStartingVenues,
  uploadFoundingVenueImage,
} from "../packages/villages/src/server/features/founding/founding-drafts.js";
import { reportFoundingProgress } from "../packages/villages/src/server/features/founding/founding-progress.js";
import { draftVillageVenueDescriptions } from "../packages/villages/src/server/features/founding/village-bootstrap.js";
import { EMPTY_RESIDENT_ADMISSION } from "../packages/villages/src/shared/helpers/resident-admission.js";
import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import { continuityPreparationContext } from "../packages/villages/src/server/domain/rules/continuity-library.js";

async function reviewNavigation() {
  const { createFoundingGotoSetupStep } =
    await import("../packages/villages/src/client/features/founding/setup-controller.js");
  let reviewed = false,
    step: number = FOUNDING_STEP.Review,
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
    setupLocationName: "Old Harbour",
    setupPlayerBackground: "I came to help the community.",
    setupSetting: "Coastal rooms",
    setupStep: Number(FOUNDING_STEP.Review),
    setupSuggestionsBusy: false,
    setupVenueBusy: false,
    snapshot: { isFounded: true },
  };
  const goto = createFoundingGotoSetupStep(ports as any);
  goto(FOUNDING_STEP.Review);
  assert.equal(reviewed, false, "re-entering restored Review cannot acknowledge an invalid map");
  assert.match(problem, /Place every/);
  blocked = "";
  goto(FOUNDING_STEP.Review);
  assert.equal(reviewed, true, "successful Review navigation incorporates map acknowledgment");
  assert.equal(step, FOUNDING_STEP.Review);
  assert.equal(problem, "");
  ports.setupStep = FOUNDING_STEP.Setting;
  ports.connectionSetupProblem = "Choose a System connection.";
  goto(FOUNDING_STEP.People);
  assert.equal(step, FOUNDING_STEP.Setting, "Setting requires connections before proceeding");
  assert.equal(problem, ports.connectionSetupProblem);
  ports.connectionSetupProblem = "";
  ports.personaDraft = "";
  ports.setupMapSrc = "";
  goto(FOUNDING_STEP.People);
  assert.equal(step, FOUNDING_STEP.People, "Choosing villagers does not require map artwork or a Persona yet");
  ports.setupStep = FOUNDING_STEP.People;
  ports.setupLocationName = "";
  goto(FOUNDING_STEP.Maps);
  assert.equal(step, FOUNDING_STEP.Setting);
  assert.equal(problem, "Name the starting location.");
  ports.setupLocationName = "Old Harbour";
  goto(FOUNDING_STEP.Maps);
  assert.equal(step, FOUNDING_STEP.People, "People requires a Persona before opening Maps");
  assert.equal(problem, "Choose an available Persona.");
  ports.personaDraft = "player";
  goto(FOUNDING_STEP.Maps);
  assert.equal(step, FOUNDING_STEP.Maps, "People opens Maps without requiring artwork first");
  ports.setupStep = FOUNDING_STEP.Maps;
  reviewed = false;
  ports.setupMapSrc = "";
  ports.snapshot.isFounded = false;
  for (const target of [FOUNDING_STEP.Venues, FOUNDING_STEP.Review]) {
    goto(target);
    assert.equal(step, FOUNDING_STEP.Maps, "No later chapter can bypass missing map artwork");
    assert.match(problem, /Generate or upload map artwork/);
  }
  assert.equal(reviewed, false, "missing artwork cannot be acknowledged");
  ports.setupMapSrc = "uploaded-map";
  ports.setupMapBusy = true;
  goto(FOUNDING_STEP.Venues);
  assert.equal(step, FOUNDING_STEP.Maps, "Replacement artwork must finish before Venue placement");
  assert.match(problem, /Wait for the requested map/);
  ports.setupMapBusy = false;
  goto(FOUNDING_STEP.Venues);
  assert.equal(step, FOUNDING_STEP.Venues, "Completed artwork opens Venue placement directly");
  ports.setupStep = FOUNDING_STEP.Venues;
  goto(FOUNDING_STEP.Review);
  assert.equal(step, FOUNDING_STEP.Review, "Venues advances directly to Review");
  const admissionPorts: any = {
    ...ports,
    setupStep: FOUNDING_STEP.People,
    setupWorldName: "Othiras",
    setupMapSrc: "map",
    setupResidentAdmissions: { resident: { ...EMPTY_RESIDENT_ADMISSION } },
  };
  const continueWithNotes = createFoundingGotoSetupStep(admissionPorts);
  continueWithNotes(FOUNDING_STEP.Maps);
  assert.equal(step, FOUNDING_STEP.Maps, "blank admission requires no approval");
  admissionPorts.setupStep = FOUNDING_STEP.Maps;
  admissionPorts.setupSetting = "Changed setting";
  continueWithNotes(FOUNDING_STEP.Venues);
  assert.equal(step, FOUNDING_STEP.Venues, "no biography reapproval gate");
}

async function main() {
  assert.deepEqual(SETUP_STEPS, ["Setting", "People", "Maps", "Venues", "Review"]);
  for (const [step, phase] of SETUP_STEPS.entries()) assert.equal(savedFoundingStep({ step, phase }), step);
  assert.equal(savedFoundingStep({ step: 2, phase: "People" }), FOUNDING_STEP.People);
  assert.equal(savedFoundingStep({ step: 1, phase: "Maps" }), FOUNDING_STEP.Maps);
  assert.equal(savedFoundingStep({ step: 1 }), FOUNDING_STEP.People);
  assert.equal(savedFoundingStep({ step: 2, phase: "Venues and Map" }), FOUNDING_STEP.Maps);
  assert.equal(savedFoundingStep({ step: 3 }), FOUNDING_STEP.Review);
  assert.equal(savedFoundingStep({ step: 4, phase: "Zones" }), FOUNDING_STEP.Venues);
  assert.equal(savedFoundingStep({ step: NaN }), FOUNDING_STEP.Setting);
  const { readPersona } = await import("../packages/villages/src/server/adapters/engine/catalog.js");
  const { validateFoundingRoster } = await import("../packages/villages/src/server/domain/rules/founding-record.js");
  const { parseFoundingVenueSuggestions } =
    await import("../packages/villages/src/server/domain/rules/founding-draft-rules.js");
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
    privateDescription: "A quiet sleeping nook.",
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
  }
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

  assert.equal(
    coerceVillageState({ ...defaultVillageState(), wishSystemVersion: 3, setupAt: "2025-01-01T00:00:00Z" })
      .foundingPreparation,
    null,
    "a current world without preparation work remains ready",
  );
  assert.deepEqual(
    coerceVillageState({
      ...defaultVillageState(),

      wishSystemVersion: 3,
      foundingPreparation: { status: "failed", completedIds: ["one"], currentId: "two", error: "offline" },
    }).foundingPreparation,
    { status: "failed", completedIds: ["one"], currentId: "two", error: "offline" },
    "preparation progress survives loading",
  );
  assert.deepEqual(
    coerceVillageState({
      ...defaultVillageState(),

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

  console.log(
    "Founding contracts: explicit phases, bounded roster/suggestions, Persona identity and preparation recovery passed.",
  );
}

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
    return Promise.withResolvers<void>();
  };
  type Operation = "progress" | "compact" | "suggest" | "image" | "upload" | "descriptions";
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
    ["compact", "resolve"],
    ["compact", "callback"],
    ["compact", "provider"],
    ["suggest", "persona"],
    ["suggest", "provider"],
    ["image", "card"],
    ["image", "lore"],
    ["image", "gallery"],
    ["upload", "gallery"],
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
      essential: false,
      duration: 180,
      parts: [0, 1, 2, 3],
    })),
    days: Array.from({ length: 7 }, () => [0, 1, 2, 3, 4, 5, 0, 1]),
    rhythm: [],
  });
  const draftRows = [
    {
      id: "equal-venue",
      residentCharacterId: "equal-resident",
      residentIds: ["equal-resident"],
      playerHome: false,
      name: "Resident room",
      form: "Room",
      description: "Blue door",
      layout: "exterior",
    },
    {
      id: "player-room",
      residentIds: [],
      playerHome: true,
      residentCharacterId: "",
      name: "Your room",
      form: "Room",
      description: "Green door",
      layout: "exterior",
    },
    {
      id: "community",
      residentIds: [],
      playerHome: false,
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
        ...defaultVillageState(),

        wishSystemVersion: 3,
        seed: "equal-founding-seed",
        name: label,
        setting: "Quiet harbor",
        backgroundPace: "off",
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
          ...[
            venueFixture({
              spaces: [{ id: "residence", description: "Blue door", image: null }],
              id: "equal-venue",
              name: label + " room",
              form: "Room",
              description: "Blue door",
              residentIds: ["equal-resident"],
              presentation: { mapId: "", image: null, x: null, y: null },
              occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
            }),
          ],
          ...sharedVenuesFixture(),
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
        label === "B" || operation === "compact"
          ? compactReply(label)
          : operation === "suggest"
            ? {
                venues: draftRows.slice(0, 1).map((row) => ({
                  zones: [
                    {
                      id: "common:base",
                      name: "Shared room",
                      purpose: "Conversation",
                      description: "A table",
                      private: false,
                      connectedTo: ["exterior"],
                    },
                  ],
                  ...row,
                  name: `${label} ${row.name}`,
                  layout: "common",
                  connections: [["exterior", "common:base"]],
                  commonName: "Shared room",
                  commonPurpose: "Conversation",
                  commonDescription: "A table",
                  privateName: "",
                  privatePurpose: "",
                  privateDescription: "model secret",
                  x: 0.9,
                })),
              }
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
            persistence: nativePorts<CapabilityRuntimeHost["persistence"]>({
              documents: villageFixtureDocuments(documents),
            }),
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

    a.scope.run(
      () =>
        (globalThis.fetch = async (input, init) => {
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
        }),
    );
    const scenarioInput = {
      openingVenueId: "community",
      context: { rules: "", circumstances: [] },
      setting: "Quiet harbor",
      selectedLorebookIds: ["visual"],
    };
    const compactContext = {
      continuity: continuityPreparationContext(defaultVillageState(), "equal-resident", "2026-11-10T12:00:00.000Z"),
      village: "Quiet harbor",
      setting: "Quiet harbor",
      home: "Room",
      card: { id: "equal-resident", name: "Reader", tags: [] },
      venues: [],
      lore: [],
      activeWishes: [],
      wishes: [],
      schedule: null,
    };
    try {
      const work = a.scope.run(() =>
        operation === "progress"
          ? reportFoundingProgress("equal-founding-seed", { stage: "model", modelName: "A-model" }, "equal-resident")
          : operation === "compact"
            ? proposeCompactFounding(compactContext, async (modelName) => {
                assert.equal(activationScope(), a.scope);
                callbacks.push({ owner: "A", modelName });
                await a.pause("callback");
              })
            : operation === "suggest"
              ? suggestStartingVenues({
                  ...scenarioInput,
                  mode: "draft-venue",
                  actionId: "equal-draft",
                  targetVenueId: "equal-venue",
                  targetVenue: newSetupVenue("equal-venue", 0.5, 0.5),
                  newZoneIds: [],
                  playerPersonaId: "equal-persona",
                  venues: draftRows,
                })
              : operation === "image"
                ? generateFoundingVenueImage({ ...scenarioInput, venue: draftRows[0] })
                : operation === "upload"
                  ? uploadFoundingVenueImage({ image: png, name: "Uploaded room" })
                  : draftVillageVenueDescriptions("Quiet harbor", [{ id: "equal-venue", name: "Room" }]),
      );
      const outcome = a.scope.run(() =>
        work.then(
          (value) => ({ value, error: undefined }),
          (error) => ({ value: undefined, error: error as unknown }),
        ),
      );
      await a.scope.run(() =>
        Promise.race([
          a.entered.promise,
          outcome.then((result) => assert.fail(`No ${operation}/${stage} pause: ${String(result.error)}`)),
        ]),
      );

      const independent = await b.scope.run(() => proposeCompactFounding(compactContext, async () => {}));
      assert.equal(independent.agenda.routineSummary, "B reads quietly.");
      await b.scope.run(() =>
        reportFoundingProgress("equal-founding-seed", { stage: "model", modelName: "B-model" }, "equal-resident"),
      );
      b.scope.run(() => assert.equal(b.requests().length, 1));
      if (["cas", "seed-changed", "status-changed", "resident-changed"].includes(variant)) {
        const row = a.rows.get("villages-village")!,
          state = b.scope.run(() => structuredClone(a.world()));
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
      else if (variant === "failure")
        b.scope.run(() => assert.match(String(result.error), new RegExp(failure.message)));
      else if (variant === "disposed") assert(result.error instanceof Error);
      else assert.equal(result.error, undefined, `${operation}/${stage} succeeds`);
      b.scope.run(() =>
        assert.equal(b.world().foundingPreparation!.modelName, "B-model", "A cannot rewrite B's preparation marker"),
      );
      b.scope.run(() => assert.equal(b.requests().length, 1, "A does not borrow or duplicate B's usage receipt"));
      b.scope.run(() => assert.equal(b.requests()[0]!.connectionId, "B-text"));
      const paid = operation !== "progress" && operation !== "upload";
      b.scope.run(() => assert.equal(a.requests().length, paid ? 1 : 0, "native usage records stay with A"));
      if (paid)
        b.scope.run(() => assert.equal(a.requests()[0]!.connectionId, operation === "image" ? "A-brush" : "A-text"));
      if (operation === "progress") {
        const marker = b.scope.run(() => a.world().foundingPreparation!);
        if (["seed-changed", "status-changed", "resident-changed", "failure", "disposed"].includes(variant))
          assert.equal(marker.modelName, undefined, "changed authority or failure does not apply stale progress");
        else {
          assert.equal(marker.modelName, "A-model");
          assert(marker.stageStartedAt);
        }
        if (variant === "cas")
          b.scope.run(() =>
            assert.equal(a.world().spriteCardFlipEnabled, false, "real CAS retry preserves winning fields"),
          );
      }
      if (operation === "compact") {
        assert.deepEqual(callbacks, [{ owner: "A", modelName: "A-model" }]);
        assert.equal(calls.filter((call) => call.owner === "A" && call.stage === "provider").length, 1);
        const saved = b.scope.run(() =>
          parseCompactFoundingCompletion(
            { content: JSON.stringify(compactReply("A")), finishReason: "stop" },
            compactContext,
          ),
        );
        assert.equal(saved.agenda.routineSummary, "A reads quietly.");
        assert.equal(
          calls.filter((call) => call.owner === "A" && call.stage === "provider").length,
          1,
          "saved reply validation dispatches no model",
        );
      }
      if (operation === "suggest") {
        const suggestions = (result.value as { venues: Array<Record<string, unknown>> }).venues;
        assert.equal(suggestions.length, 1);
        assert(suggestions.every((venue) => !("x" in venue)));
      }
      if (operation === "image" || operation === "upload") assert.equal((result.value as { id: string }).id, "A-image");
      if (operation === "descriptions") assert.deepEqual(result.value, { "equal-venue": "A stone room." });
      assert.equal(
        calls.filter((call) => call.owner === "B" && call.stage === "provider").length,
        1,
        "B has only its independent request",
      );
    } finally {
      a.gate.resolve();

      a.release();
      b.release();
      a.scope.dispose();
      b.scope.dispose();
      globalThis.fetch = oldFetch;
    }
  }
  console.log(
    `Villages founding: ${scenarios.length} paused assembled recipe/accounting/progress CAS cases passed (synthetic native model/HTTP)`,
  );
}

async function foundingArchitecturePrompts() {
  const prompts: string[] = [];
  const reference = {
    path: "/api/lorebooks/entry-images/11111111-1111-1111-1111-111111111111.png",
    caption: "Blue arches",
  };
  let galleryCalls = 0;
  const unused = () => {
    throw new Error("Unexpected provider or catalog request");
  };
  const service = createFoundingDrafts({
    findVillagerCard: async (id) =>
      ({
        id,
        name: "Resident",
        summary: "A reader.",
        description: "A reader.",
        personality: "Quiet",
        backstory: "",
        appearance: "",
        tags: [],
      }) as any,
    readLinkedPersona: async () => null,
    readVillageLore: unused,
    readVillageImageLore: async (_ids, _context, _length, _budget, inspect) => {
      inspect?.({
        purpose: "Image",
        stage: "selection",
        budget: 1600,
        omittedDiagnostics: 0,
        entries: [
          { id: "arches", bookId: "world", name: "Arches", match: "setting", status: "included", images: [reference] },
        ],
      });
      return "Arches: Blue arches";
    },
    villagesLanguageModels: unused,
    villagesConnectionIdFor: unused,
    completeWithRoom: unused,
    decodeVillageImageDataUrl: unused,
    generateVillageImage: async (input) => {
      assert.deepEqual(input.loreImages, input.prompt.includes("Arches: Blue arches") ? [reference] : []);
      await input.beforeDispatch?.();
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
    residentIds: ["resident"],
    playerHome: true,
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
  await service.generateFoundingVenueImage({
    venue,
    area: "private",
    privateOwnerId: "resident",
    zoneAppearance: "A furnished resident room",
    setting: "Resort",
  });
  assert.equal(prompts.length, before + 1, "resident artwork can be generated during founding");
  assert.match(prompts.at(-1)!, /A furnished resident room/);
  const overflowing = {
    ...venue,
    name: "n".repeat(100),
    form: "f".repeat(240),
    description: "e".repeat(1000),
    areas: Array.from({ length: 5 }, (_, id) => ({ id: String(id), name: "z".repeat(100) })),
  };
  const original = structuredClone(overflowing);
  await service.generateFoundingVenueImage({
    venue: overflowing,
    area: "interior",
    setting: "Resort",
    zoneName: "s".repeat(100),
    zonePurpose: "p".repeat(240),
    zoneAppearance: "a".repeat(1000),
    sceneryArtStyle: "v".repeat(600),
  });
  assert.equal(prompts.length, before + 2, "long authored details still permit an image request");
  const fitted = prompts.at(-1)!;
  assert.ok(fitted.length <= 8000);
  assert.ok(fitted.includes("v".repeat(600)), "the full art style survives prompt fitting");
  assert.ok(fitted.includes("Venue form defines the whole place"));
  assert.ok(fitted.includes("Do not invent or show adjoining rooms"));
  assert.deepEqual(overflowing, original, "prompt fitting preserves the authored draft");
  assert.equal(galleryCalls, before + 2);

  console.log(
    "Founding images: shared architecture across Exterior/Common/player Private; resident Private artwork available.",
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

{
  const values: Record<string, unknown> = {};
  const setters = new Proxy(
    {
      setupEditorOriginal: { current: null },
      setupEditorAuthoredOriginal: { current: [] },
      setupEditorZoneOriginal: { current: null },
      setupZoneDrafts: { current: {} },
      loadCatalog: async () => {},
      loadLorebooks: async () => {},
      loadPersonas: async () => {},
    },
    {
      get(target, key: string) {
        return key in target
          ? target[key]
          : (value) => {
              values[key] = value;
            };
      },
    },
  );
  const draft = {
    version: 2,
    name: "Willowmere",
    setting: "A village by the river.",
    persona: "",
    lorebooks: [],
    context: { rules: "", circumstances: [], openingVenueId: "community", households: {} },
    workspace: emptyFoundingWorkspace(),
    zoneDrafts: {},
    venues: [],
    roster: [],
    step: 0,
  } as any;
  const restore = createFoundingRestoreSetupDraft(setters as any);
  assert.equal(restore({ ...draft, venues: [null] }), false);
  assert.equal(restore({ ...draft, setting: null }), false);
  assert.equal(restore({ ...draft, startingLocationName: 42 }), false);
  assert.equal(restore({ ...draft, workspace: { ...draft.workspace, settingWorldBrief: 42 } }), false);
  assert.deepEqual(values, {}, "Unreadable drafts never populate the editor or enable autosave");
  assert.equal(restore(JSON.parse(JSON.stringify(draft))), true);
  const legacyContext = { rules: "", circumstances: [], communityVenueId: "authored-meeting-place" };
  const oldContextBefore = structuredClone(legacyContext);
  assert.equal(restore({ ...draft, context: legacyContext }), true);
  assert.equal((values.setSetupContext as any).openingVenueId, "authored-meeting-place");
  assert.deepEqual(legacyContext, oldContextBefore, "Reading the old opening ID does not rewrite the saved source");
  assert.equal(values.setSetupName, "Willowmere");
  assert.equal(values.setSetupLocationName, "Willowmere", "Older v2 drafts retain their original first-map name");
  for (const startingLocationName of ["Old Harbour", ""]) {
    createFoundingRestoreSetupDraft(setters as any)({ ...draft, startingLocationName });
    assert.equal(values.setSetupName, "Willowmere");
    assert.equal(values.setSetupLocationName, startingLocationName, "Authored location names restore without backfill");
  }
  assert.equal(values.setScreen, "setup", "A freshly serialized v2 draft resumes without old-format backfill");
  restore({ ...draft, step: 2, phase: "People" });
  assert.equal(values.setSetupStep, FOUNDING_STEP.People, "A saved People chapter needs no map artwork");
  for (const phase of ["Maps", "Venues", "Zones", "Review"]) {
    restore({ ...draft, step: 3, phase });
    assert.equal(
      values.setSetupStep,
      FOUNDING_STEP.Maps,
      "Missing artwork resumes on Maps without discarding the draft",
    );
  }
  restore({
    ...draft,
    step: 3,
    phase: "Review",
    mapSource: "upload",
    mapImageSource: "upload",
    mapImage: "/saved-map.png",
  });
  assert.equal(values.setSetupStep, FOUNDING_STEP.Review, "Old Review preserves its chapter once artwork exists");
  assert.deepEqual(values.setSetupWorkspace, draft.workspace);
  assert.equal(
    Object.hasOwn(values.setSetupContext, "households"),
    false,
    "Settled drafts discard retired grouping state",
  );
  const oldHome = newSetupVenue("founding-home:player", 0.2, 0.3, true);
  const legacyDraft = { ...draft, venues: [oldHome] };
  restore(JSON.parse(JSON.stringify(legacyDraft)));
  assert.deepEqual(values.setSetupVenues[0], oldHome, "Restoring a draft preserves its authored layout");
  const unplaced = newSetupVenue("unplaced", 0.5, 0.5);
  unplaced.presentation.x = null;
  unplaced.presentation.y = null;
  const missingPinDraft = { ...legacyDraft, venues: [oldHome, unplaced], mapReviewed: true };
  const missingPinSource = structuredClone(missingPinDraft);
  restore(missingPinDraft);
  assert.deepEqual(values.setSetupVenues[0], oldHome, "Restoring a missing pin preserves authored positions");
  assert.equal(values.setSetupVenues[1].presentation.x, 0.5);
  assert.equal(values.setSetupVenues[1].presentation.y, 0.5);
  assert.equal(values.setSetupMapReviewed, false, "Restored pins need map review");
  assert.deepEqual(missingPinDraft, missingPinSource, "Restoring pins leaves the saved source unchanged");
  const pendingPinDraft = {
    ...missingPinDraft,
    workspace: {
      ...draft.workspace,
      suggestionRequest: { id: "admitted-pin", sourceKey: "source", quickStart: true },
    },
  };
  restore(pendingPinDraft);
  assert.deepEqual(values.setSetupVenues, pendingPinDraft.venues, "Pending work keeps its exact source positions");
  const failedPinDraft = structuredClone(pendingPinDraft);
  failedPinDraft.workspace.suggestionRequest.failure = "Draft unavailable";
  restore(failedPinDraft);
  assert.equal(values.setSetupVenues[1].presentation.x, 0.5, "A failed request does not hide a missing pin");
  assert.equal(values.setSetupVenues[1].presentation.y, 0.5);
  assert.deepEqual(values.setSetupWorkspace.suggestionRequest, failedPinDraft.workspace.suggestionRequest);
  for (const held of [
    { ...legacyDraft, interruptedGeneration: true },
    { ...legacyDraft, editorOriginal: oldHome },
    { ...legacyDraft, zoneDrafts: { [oldHome.id]: {} } },
    {
      ...legacyDraft,
      workspace: { ...draft.workspace, suggestionRequest: { id: "admitted", sourceKey: "source", quickStart: true } },
    },
  ]) {
    restore(JSON.parse(JSON.stringify(held)));
    assert.deepEqual(
      values.setSetupVenues,
      JSON.parse(JSON.stringify(legacyDraft.venues)),
      "Pending or edited work keeps its exact source layout",
    );
  }
  draft.workspace.suggestionRequest = { id: "admitted-source", sourceKey: "exact-source", quickStart: true };
  draft.context.households = { a: "player" };
  createFoundingRestoreSetupDraft(setters as any)(JSON.parse(JSON.stringify(draft)));
  assert.deepEqual(
    values.setSetupContext.households,
    draft.context.households,
    "An admitted request keeps its exact opaque source ingredient until resolved",
  );
  assert.deepEqual(values.setSetupWorkspace.suggestionRequest, draft.workspace.suggestionRequest);
  const oldProblem =
    "This Founding draft result is no longer available. Your current setup is kept. Generate again only when you choose.";
  draft.workspace.suggestionRequest.failure = oldProblem;
  draft.workspace.settingProblem = oldProblem;
  const originalRequest = structuredClone(draft.workspace.suggestionRequest);
  createFoundingRestoreSetupDraft(setters as any)(JSON.parse(JSON.stringify(draft)));
  assert.deepEqual(values.setSetupWorkspace.suggestionRequest, {
    ...originalRequest,
    failure: "Founding draft result unavailable.",
  });
  assert.equal(values.setSetupWorkspace.settingProblem, "Founding draft result unavailable.");
  assert.equal(
    draft.workspace.suggestionRequest.failure,
    oldProblem,
    "Updating displayed copy does not mutate the stored source object",
  );
}
