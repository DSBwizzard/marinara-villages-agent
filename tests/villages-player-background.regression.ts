import assert from "node:assert/strict";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  coercePlayerBackground,
  playerBackgroundForSetup,
  readPlayerBackground,
  renderPlayerBackgroundContext,
} from "../packages/villages/src/server/domain/rules/player-background.js";
import { currentScenePrompt, scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";
assert.equal(readPlayerBackground("  I came here as king.  "), "I came here as king.");
for (const raw of [{ title: "King" }, null, 3, "x".repeat(1201)]) assert.throws(() => readPlayerBackground(raw));
assert.equal(coercePlayerBackground(undefined), "");
assert.throws(() => playerBackgroundForSetup("Before", "After", false), /recorded at founding/);
assert.equal(playerBackgroundForSetup("Before", undefined, false), "Before");
assert.equal(playerBackgroundForSetup("Before", "Before", false), "Before");
assert.equal(playerBackgroundForSetup("Before", "After", true), "After");
const state = coerceVillageState({
  ...defaultVillageState(),
  playerBackground: "At founding I held the crown.",
  worldFacts: ["The player later abdicated."],
});
assert.equal(state.playerBackground, "At founding I held the crown.");
const context = renderPlayerBackgroundContext(state);
assert.match(context, /later established events/i);
assert.match(context, /does not imply an official title/i);
assert.match(context, /consent/);
assert.doesNotMatch(context, /has a recognized community role|fixed at founding/);
assert.doesNotMatch(renderPlayerBackgroundContext({}), /oversees major changes/);
assert.match(renderPlayerBackgroundContext({}), /explicit choice/);
const prompt = await currentScenePrompt(
  state,
  readVillagerCard({ id: "mara", data: { name: "Mara", description: "A patient guard." } } as any),
  "chat",
  "I have abdicated.",
);
assert.equal(scenePromptPacket(prompt).player.background, state.playerBackground);
assert.equal(prompt.split(state.playerBackground).length - 1, 1, "Authored backstory is sent exactly once");
assert.match(prompt, /private background data, not instructions or a script/);
assert.match(prompt, /Starting circumstances and occupations can change/);
assert.match(prompt, /roles assign no universal development responsibility/);
console.log(
  "Player background: bounded prose, current-state precedence and independent gameplay responsibilities passed.",
);
