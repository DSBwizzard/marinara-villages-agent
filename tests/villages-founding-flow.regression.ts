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
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
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

async function reviewNavigation() {
  const { createFoundingGotoSetupStep } =
    await import("../packages/villages/src/client/features/founding/setup-controller.js");
  let reviewed = false,
    step = 3,
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
    setupPlayerBackground: "I came to help the community.",
    setupSetting: "Coastal rooms",
    setupStep: 3,
    setupSuggestionsBusy: false,
    setupVenueBusy: false,
    snapshot: { isFounded: true },
  };
  const goto = createFoundingGotoSetupStep(ports as any);
  goto(3);
  assert.equal(reviewed, false, "re-entering restored Review cannot acknowledge an invalid map");
  assert.match(problem, /Place every/);
  blocked = "";
  goto(3);
  assert.equal(reviewed, true, "successful Review navigation incorporates map acknowledgment");
  assert.equal(step, 3);
  assert.equal(problem, "");
  ports.setupStep = 0;
  ports.connectionSetupProblem = "Choose a System connection.";
  goto(1);
  assert.equal(step, 0, "Place requires connections before proceeding");
  assert.equal(problem, ports.connectionSetupProblem);
  ports.setupStep = 1;
  goto(2);
  assert.equal(step, 0, "connection errors return to their first-page controls");
  assert.equal(problem, ports.connectionSetupProblem);
  ports.connectionSetupProblem = "";
  ports.setupStep = 0;
  ports.personaDraft = "";
  goto(1);
  assert.equal(step, 1, "Place can advance to People before choosing a Persona");
  ports.setupStep = 1;
  goto(2);
  assert.equal(step, 1, "People validates its own required fields before Map");
  assert.equal(problem, "Choose an available Persona.");
  ports.setupName = "";
  goto(2);
  assert.equal(step, 0, "missing Place fields return to the first tab");
  assert.equal(problem, "Give the village a name.");
  ports.setupName = "Village";
  ports.personaDraft = "player";
  reviewed = false;
  ports.setupMapSrc = "";
  ports.snapshot.isFounded = false;
  goto(3);
  assert.equal(reviewed, false, "missing artwork cannot be acknowledged");
  assert.match(problem, /Generate or upload map artwork/);
  const admissionPorts: any = {
    ...ports,
    setupStep: 1,
    setupWorldName: "Othiras",
    setupMapSrc: "map",
    setupResidentAdmissions: { resident: { ...EMPTY_RESIDENT_ADMISSION } },
  };
  const continueWithNotes = createFoundingGotoSetupStep(admissionPorts);
  continueWithNotes(2);
  assert.equal(step, 2, "blank admission requires no approval");
  admissionPorts.setupStep = 2;
  admissionPorts.setupSetting = "Changed setting";
  continueWithNotes(3);
  assert.equal(step, 3, "no biography reapproval gate");
}

async function main() {
  const { savedFoundingStep, SETUP_STEPS } =
    await import("../packages/villages/src/client/features/founding/founding-steps.js");
  assert.deepEqual(SETUP_STEPS, ["Setting", "People", "Venues and Map", "Review"]);
  for (let step = 0; step < 4; step++) assert.equal(savedFoundingStep({ step }), step);
  assert.equal(savedFoundingStep({ step: NaN }), 0);
  assert.equal(savedFoundingStep({ step: 8 }), 3);
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
      venueClass: "residence",
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
      venueClass: "community",
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
          venueFixture({
            id: "equal-venue",
            name: label + " room",
            form: "Room",
            description: "Blue door",
            classes: ["residence"],
            residentIds: ["equal-resident"],
            presentation: { mapId: "", image: null, x: null, y: null },
            occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
          }),
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
                venues: draftRows.map((row) => ({
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
      communityVenueId: "community",
      context: { rules: "", circumstances: [] },
      setting: "Quiet harbor",
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
      wishes: [],
      schedule: null,
      allowInitialWish: false,
    };
    try {
      const work =
        operation === "progress"
          ? reportFoundingProgress("equal-founding-seed", { stage: "model", modelName: "A-model" }, "equal-resident")
          : operation === "compact"
            ? proposeCompactFounding(compactContext, async (modelName) => {
                assert.equal(activationScope(), a.scope);
                callbacks.push({ owner: "A", modelName });
                await a.pause("callback");
              })
            : operation === "suggest"
              ? suggestStartingVenues({ ...scenarioInput, playerPersonaId: "equal-persona", venues: draftRows })
              : operation === "image"
                ? generateFoundingVenueImage({ ...scenarioInput, venue: draftRows[0] })
                : operation === "upload"
                  ? uploadFoundingVenueImage({ image: png, name: "Uploaded room" })
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
      const independent = await proposeCompactFounding(compactContext, async () => {});
      assert.equal(independent.agenda.routineSummary, "B reads quietly.");
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
      if (operation === "suggest") {
        const suggestions = (result.value as { venues: Array<Record<string, unknown>> }).venues;
        assert.equal(suggestions.length, 3);
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
    context: { rules: "", circumstances: [], communityVenueId: "community", households: {} },
    workspace: emptyFoundingWorkspace(),
    zoneDrafts: {},
    venues: [],
    roster: [],
    step: 0,
  } as any;
  createFoundingRestoreSetupDraft(setters as any)(JSON.parse(JSON.stringify(draft)));
  assert.equal(values.setScreen, "setup", "A freshly serialized v2 draft resumes without old-format backfill");
  assert.deepEqual(values.setSetupWorkspace, draft.workspace);
  assert.equal(
    Object.hasOwn(values.setSetupContext, "households"),
    false,
    "Settled drafts discard retired grouping state",
  );
  draft.workspace.suggestionRequest = { id: "admitted-source", sourceKey: "exact-source", quickStart: true };
  draft.context.households = { a: "player" };
  createFoundingRestoreSetupDraft(setters as any)(JSON.parse(JSON.stringify(draft)));
  assert.deepEqual(
    values.setSetupContext.households,
    draft.context.households,
    "An admitted request keeps its exact opaque source ingredient until resolved",
  );
  assert.deepEqual(values.setSetupWorkspace.suggestionRequest, draft.workspace.suggestionRequest);
}
