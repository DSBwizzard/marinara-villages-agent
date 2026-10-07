import assert from "node:assert/strict";
import Fastify from "fastify";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillageState, VillageSnapshot } from "../packages/villages/src/server/domain/models/world.js";
import { MAX_NOTICEBOARD_NOTES } from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import { venueDraft } from "../packages/villages/src/server/domain/rules/venue-authoring.js";
import {
  createActivationScope,
  installDefaultActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import {
  createVillageSettings,
  type VillageSettingsPorts,
} from "../packages/villages/src/server/features/settings/village-settings-service.js";
import {
  configureVillageSettings,
  villageSettings,
  setVillagePlayer,
  setVillageName,
} from "../packages/villages/src/server/features/settings/village-settings.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import { registerVillageSettingsRoutes } from "../packages/villages/src/server/features/settings/routes.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
const hall = () => venueDraft({ name: "Hall", description: "A public meeting place", classes: ["gathering"] }, null);
function fixture(name: string) {
  let state = defaultVillageState();
  state.name = name;
  state.venues = [hall()];
  const events: string[] = [],
    warnings: string[] = [];
  let retry: ((state: VillageState) => void) | undefined;
  let bootstrapFailure = false;
  let personaReads = 0,
    bootstrapCalls = 0;
  const ports: VillageSettingsPorts = {
    async mutateVillageState(update) {
      events.push("mutate");
      update(structuredClone(state));
      retry?.(state);
      retry = undefined;
      const next = structuredClone(state);
      update(next);
      state = next;
      return structuredClone(state);
    },
    async buildVillageSnapshot() {
      events.push("snapshot");
      return {
        village: { name: state.name },
        settings: { sendOnEnter: state.sendOnEnter, storyPace: state.storyPace },
        noticeboard: structuredClone(state.noticeboard),
      } as VillageSnapshot;
    },
    async readLinkedPersona(id) {
      personaReads++;
      events.push("persona");
      if (id !== "same-persona") throw new Error("Choose a Persona");
      return { id: "same-persona", name, identity: `private identity ${name}` };
    },
    async runVillageBootstrap() {
      bootstrapCalls++;
      events.push("bootstrap");
      assert(state.setting.length > 0, "bootstrap follows the saved setting");
      if (bootstrapFailure) throw new Error("provider unavailable");
      return ports.buildVillageSnapshot();
    },
    villagesLogger: () => ({
      warn: (_message, ...args) => {
        warnings.push(String(args[0]));
      },
    }),
  };
  const service = createVillageSettings(ports);
  assert.deepEqual(events, [], "factory construction performs no reads, writes or model calls");
  return {
    ports,
    service,
    events,
    warnings,
    get state() {
      return state;
    },
    get personaReads() {
      return personaReads;
    },
    get bootstrapCalls() {
      return bootstrapCalls;
    },
    retryWith(fn: (state: VillageState) => void) {
      retry = fn;
    },
    failBootstrap() {
      bootstrapFailure = true;
    },
  };
}

async function main() {
  const a = fixture("A"),
    b = fixture("B");
  await a.service.setVillageName("  New name  ");
  await a.service.setVillagePromptKnowledge("Public knowledge");
  await a.service.setVillageLoreSettings([" book ", "book"], 800);
  await a.service.setVillageStoryPace("quiet");
  await a.service.setVillageSendOnEnter(true);
  await a.service.setVillageSpriteCardFlipEnabled(true);
  await a.service.setVillageCharacterSpeechColors(false);
  await a.service.setVillagePlayer({ personaId: "same-persona" });
  await a.service.setScenerySettings({
    sceneryArtStyle: "watercolor",
    personalizeVenueImagesByDefault: true,
    useVisualLoreByDefault: false,
  });
  assert.equal(a.state.name, "New name");
  assert.equal(a.state.promptKnowledge, "Public knowledge");
  assert.deepEqual(a.state.selectedLorebookIds, ["book"]);
  assert.equal(a.state.loreTokenBudget, 800);
  assert.equal(a.state.playerPersonaIdentity, "private identity A");
  assert.equal(a.personaReads, 1, "Persona lookup is not repeated by CAS retry");
  assert.equal(a.state.playerPersonaMissing, false);
  assert.equal(a.state.sceneryArtStyle, "watercolor");
  assert.equal(b.state.name, "B");
  assert.equal(a.bootstrapCalls, 0);
  for (const invalid of [
    () => a.service.setVillageName(""),
    () => a.service.setVillageStoryPace("normal"),
    () => a.service.setVillageSendOnEnter("true"),
    () => a.service.setVillageSpriteCardFlipEnabled(1),
    () => a.service.setVillageCharacterSpeechColors(null),
    () => a.service.setVillagePromptKnowledge(1),
    () => a.service.setVillageLoreSettings([""], 800),
    () => a.service.setVillageLoreSettings(undefined, 10),
  ]) {
    const before = structuredClone(a.state);
    await assert.rejects(invalid);
    assert.deepEqual(a.state, before);
  }
  const originalStyle = a.state.sceneryArtStyle;
  await assert.rejects(() =>
    a.service.setScenerySettings({ sceneryArtStyle: "ink", personalizeVenueImagesByDefault: "invalid" }),
  );
  assert.equal(a.state.sceneryArtStyle, originalStyle, "invalid multi-field mutation publishes no partial state");

  const bootstrap = fixture("Bootstrap");
  bootstrap.state.venues = [venueDraft({ name: "Home", description: "Residence", classes: ["residence"] }, null)];
  bootstrap.retryWith((state) => {
    state.venues.push(hall());
  });
  await bootstrap.service.setVillageSetting("First setting");
  assert.equal(bootstrap.bootstrapCalls, 0, "a losing empty-destination attempt cannot trigger a paid proposal");
  bootstrap.retryWith((state) => {
    state.venues = [];
  });
  await bootstrap.service.setVillageSetting("Second setting");
  assert.equal(bootstrap.bootstrapCalls, 1, "the final successful attempt determines eligibility");
  bootstrap.failBootstrap();
  await bootstrap.service.setVillageSetting("Third setting");
  assert.equal(bootstrap.state.setting, "Third setting");
  assert.deepEqual(bootstrap.warnings, ["Error: provider unavailable"]);
  assert.equal(bootstrap.bootstrapCalls, 2, "failed proposal is not automatically repeated");
  await bootstrap.service.setVillageSetting("");
  assert.equal(bootstrap.bootstrapCalls, 2);

  const board = fixture("Board");
  board.state.noticeboard = Array.from({ length: MAX_NOTICEBOARD_NOTES - 1 }, () => ({ author: "", text: "existing" }));
  board.retryWith((state) => {
    state.noticeboard.push({ author: "", text: "concurrent" });
  });
  await assert.rejects(() => board.service.addNotice("new"), /holds at most/);
  assert.equal(board.state.noticeboard.length, MAX_NOTICEBOARD_NOTES);
  assert(!board.state.noticeboard.some((note) => note.text === "new"));
  board.state.noticeboard = [
    { author: "First", text: "same" },
    { author: "Second", text: "same" },
  ];
  await board.service.removeNoticeAt("0");
  assert.deepEqual(board.state.noticeboard, [{ author: "Second", text: "same" }]);
  board.retryWith((state) => {
    state.noticeboard = [];
  });
  await assert.rejects(() => board.service.removeNoticeAt(0), /no longer/);
  await assert.rejects(() => board.service.removeNoticeAt(-1), /not a notice/);
  await assert.rejects(() => board.service.addNotice("  "), /Write something/);
  await board.service.addNotice("hello");
  assert.deepEqual(board.state.noticeboard, [{ author: "", text: "hello" }]);

  const scopeA = createActivationScope(),
    scopeB = createActivationScope();
  const gate = deferred(),
    entered = deferred();
  const originalPersona = a.ports.readLinkedPersona;
  // Factories capture connector functions at construction, so create the paused owner after replacing its port.
  a.ports.readLinkedPersona = async (id) => {
    entered.resolve();
    await gate.promise;
    return originalPersona(id);
  };
  const ownerA = createVillageSettings(a.ports);
  const releaseA = scopeA.run(() => configureVillageSettings(ownerA));
  const releaseB = scopeB.run(() => configureVillageSettings(b.service));
  const clearA = installDefaultActivation(scopeA, () => {});
  const pending = setVillagePlayer({ personaId: "same-persona" });
  await entered.promise;
  const clearB = installDefaultActivation(scopeB, () => {});
  await setVillagePlayer({ personaId: "same-persona" });
  gate.resolve();
  const savedA = await pending;
  assert.equal(savedA.village.name, "New name");
  assert.equal(a.state.playerPersonaIdentity, "private identity A");
  assert.equal(b.state.playerPersonaIdentity, "private identity B");
  releaseA();
  clearA();
  await setVillageName("Current B");
  assert.equal(b.state.name, "Current B");
  assert.throws(() => scopeA.run(() => setVillageName("released")), /not configured/);
  const missing = createActivationScope();
  assert.throws(() => missing.run(villageSettings), /not configured/);
  scopeB.dispose();
  assert.throws(() => scopeB.run(villageSettings), /not configured/);
  releaseB();
  clearB();
  scopeA.dispose();
  missing.dispose();
  assert.throws(villageSettings, /not configured/);

  // Actual route handler with assembled adapters; provider-free document/resource stubs.
  const routed = fixture("Route"),
    rows = new Map<string, any>();
  const documents = {
    async getById(_package: string, id: string) {
      return structuredClone(rows.get(id) ?? null);
    },
    async list() {
      return [];
    },
    async create(input: any) {
      const row = { ...structuredClone(input), revision: 1 };
      rows.set(input.id, row);
      return structuredClone(row);
    },
    async update(input: any) {
      const row = rows.get(input.id);
      if (row?.revision !== input.expectedRevision) return null;
      const next = { ...row, ...structuredClone(input), revision: row.revision + 1 };
      rows.set(input.id, next);
      return structuredClone(next);
    },
  };
  const releaseRuntime = configureVillagesRuntime({
    persistence: { documents },
    resources: { listCharacters: async () => [] },
    logger: { debug() {}, info() {}, warn() {}, error() {}, debugOverride() {} },
    isDebugAgentsEnabled: () => false,
  } as any);
  const releaseSettings = configureVillageSettings(routed.service);
  const app = Fastify();
  try {
    registerVillageSettingsRoutes(app);
    const response = await app.inject({
      method: "PATCH",
      url: "/settings",
      payload: {
        name: "Routed name",
        promptKnowledge: "Known",
        setting: "New setting",
        storyPace: "balanced",
        sendOnEnter: true,
        characterSpeechColors: true,
      },
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(response.json().village.name, "Routed name");
    assert.equal(routed.state.promptKnowledge, "Known");
    assert.equal(routed.state.setting, "New setting");
    assert.equal(routed.state.sendOnEnter, true);
    assert.equal(routed.bootstrapCalls, 0);
    assert.deepEqual(
      routed.events.filter((event) => event === "mutate" || event === "snapshot"),
      Array.from({ length: 6 }, () => ["mutate", "snapshot"]).flat(),
    );
    const rejected = await app.inject({ method: "PATCH", url: "/settings", payload: { sendOnEnter: "true" } });
    assert.equal(rejected.statusCode, 400);
  } finally {
    await app.close();
    releaseSettings();
    releaseRuntime();
  }
  console.log(
    "Settings owners retain CAS validation, deliberate bootstrap admission, Persona privacy and route dispatch across activation replacement.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
