import assert from "node:assert/strict";
import {
  DEFAULT_PLAYER_ROLE,
  readPlayerRole,
  playerRoleForSetup,
  assertPlayerRoleLocked,
  renderPlayerRoleContext,
} from "../packages/villages/src/engine/packages/server/src/services/villages/player-role.js";
import {
  DEFAULT_PLAYER_ROLE as CLIENT_DEFAULT,
  playerRoleProblem,
} from "../packages/villages/src/engine/packages/client/src/villages-player-role.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";
import {
  buildVillagerMessages,
  renderSceneContextBlock,
} from "../packages/villages/src/engine/packages/server/src/services/villages/chat.js";
import { builtInNarrationTurn } from "../packages/villages/src/engine/packages/server/src/services/villages/narration-settings.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { deriveVillageMoment } from "../packages/villages/src/engine/packages/server/src/services/villages/village-clock.js";
import {
  villageCurrentSetting,
  villageFoundingSetting,
} from "../packages/villages/src/engine/packages/server/src/services/villages/prompt-preset.js";
import { runVillageSetup } from "../packages/villages/src/engine/packages/server/src/services/villages/village.js";

async function main() {
  const custom = {
    enabled: true,
    title: "Harbor Patron",
    explanation: "Neighbors bring me plans because I coordinate harbor repairs.",
  };
  const disabled = { ...custom, enabled: false };
  assert.deepEqual(CLIENT_DEFAULT, DEFAULT_PLAYER_ROLE, "client and server founding defaults agree");
  assert.deepEqual(playerRoleForSetup(null, undefined, true), DEFAULT_PLAYER_ROLE);
  assert.equal(playerRoleForSetup(null, undefined, false), null);
  assert.deepEqual(playerRoleForSetup(custom, undefined, false), custom, "older requests preserve the saved role");
  assert.deepEqual(readPlayerRole({ ...custom, title: " Harbor Patron " }), custom);
  for (const raw of [
    null,
    [],
    {},
    { ...custom, enabled: "yes" },
    { ...custom, title: " " },
    { ...custom, explanation: " " },
    { ...custom, title: "x".repeat(81) },
    { ...custom, explanation: "x".repeat(1001) },
  ])
    assert.throws(
      () => readPlayerRole(raw),
      (error: any) => error.statusCode === 400,
    );
  assert.equal(readPlayerRole({ enabled: false, title: "", explanation: "" }).enabled, false);
  assert.equal(readPlayerRole({ ...custom, title: "x".repeat(80), explanation: "x".repeat(1000) }).title.length, 80);
  assert.equal(playerRoleProblem(disabled), "");
  assert.ok(playerRoleProblem({ ...custom, explanation: " " }));
  for (const next of [disabled, DEFAULT_PLAYER_ROLE, null])
    assert.throws(
      () => playerRoleForSetup(custom, next, false),
      (error: any) => error.statusCode === 409,
    );
  assert.throws(() => playerRoleForSetup(null, custom, false), /fixed at founding/);
  assertPlayerRoleLocked(custom, { ...custom });
  assert.equal(defaultVillageState().playerRole, null);
  assert.equal(coerceVillageState({ setupAt: "2026-09-01T00:00:00Z" }).playerRole, null);
  const narration = builtInNarrationTurn({ maxTokens: 4096, temperature: 0.8 });
  const card = {
    id: "hana",
    name: "Hana",
    description: "A direct beekeeper.",
    personality: "Independent",
    scenario: "",
    backstory: "",
    appearance: "",
    systemPrompt: "",
    exampleDialogue: "",
  } as any;
  const context = {
    roster: [],
    present: [],
    lore: [],
    homes: [],
    memory: [],
    moment: deriveVillageMoment({
      foundedAt: "2026-09-01T00:00:00Z",
      seed: "test",
      now: new Date("2026-09-30T12:00:00Z"),
    }),
    routine: null,
    remap: null,
    agenda: null,
  } as any;
  for (const playerRole of [DEFAULT_PLAYER_ROLE, custom, disabled, null]) {
    const state = coerceVillageState(
      JSON.parse(
        JSON.stringify({
          ...defaultVillageState(),
          playerRole,
          setupAt: "2026-09-01T00:00:00Z",
          playerPersonaId: "robin",
          playerPersonaName: "Robin",
          foundingDetails: "The neighbors arrived on Day 1.",
          setting: "A quiet harbor",
        }),
      ),
    );
    assert.deepEqual(state.playerRole, playerRole, "role survives saved-state reloads");
    const roleContext = renderPlayerRoleContext(state);
    const prompt = buildVillagerMessages(card, state, [], "Could we plan a workshop?", context, narration)
      .map((message) => message.content)
      .join("\n");
    if (playerRole) {
      assert.ok(prompt.includes(roleContext));
      assert.ok(
        renderSceneContextBlock(card, { ...state, promptKnowledge: "" }, context).includes(roleContext),
        "scene context includes role even with an empty knowledge box",
      );
      assert.match(
        prompt,
        /does not grant access or override resident consent, builder willingness, resources, or Project evidence/,
      );
    } else assert.equal(roleContext, "");
    assert.equal(villageCurrentSetting(state).includes("Harbor Patron"), false, "scenery context excludes the role");
    assert.equal(villageFoundingSetting(state).includes("Village Steward"), false);
    if (playerRole?.enabled === false) {
      assert.match(prompt, /ordinary resident/);
      assert.equal(prompt.includes(custom.explanation), false, "inactive custom role text never reaches the prompt");
      assert.match(prompt, /Earned relationships and verified history still matter/);
    }
  }
  // Check the public setup service refuses a forged founding edit before any paid work.
  const state = { ...defaultVillageState(), setupAt: "2026-09-01T00:00:00Z", playerRole: custom };
  let modelCalls = 0;
  const release = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById() {
          return { data: state, revision: 1 };
        },
      },
    },
    languageModels: {
      async resolveForRequest() {
        modelCalls += 1;
        throw new Error("Unexpected generation");
      },
    },
  } as any);
  try {
    for (const playerRole of [disabled, null, DEFAULT_PLAYER_ROLE])
      await assert.rejects(
        runVillageSetup({
          name: "Harbor",
          setting: "Quiet fishing village",
          foundingReason: "none",
          foundingDetails: "",
          playerRole,
        }),
        (error: any) => error.statusCode === 409,
      );
    assert.equal(modelCalls, 0);
    assert.deepEqual(state.playerRole, custom);
  } finally {
    release();
  }
  console.log("Villages player role regressions passed.");
}
void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
