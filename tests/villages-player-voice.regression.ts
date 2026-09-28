import assert from "node:assert/strict";
import {
  buildGreetingMessages,
  buildLeavingMessages,
  buildSceneOpeningMessages,
  buildVillagerMessages,
} from "../packages/villages/src/engine/packages/server/src/services/villages/chat.js";
import { builtInNarrationTurn } from "../packages/villages/src/engine/packages/server/src/services/villages/narration-settings.js";
import { deriveVillageMoment } from "../packages/villages/src/engine/packages/server/src/services/villages/village-clock.js";
import { defaultVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";

const village = defaultVillageState();
village.playerName = "Robin";
const card = {
  id: "hana",
  name: "Hana",
  description: "A beekeeper.",
  personality: "Direct.",
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
    foundedAt: "2026-09-01T00:00:00.000Z",
    seed: "test",
    now: new Date("2026-09-27T12:00:00.000Z"),
  }),
  routine: null,
  remap: null,
  agenda: null,
} as any;
const narration = builtInNarrationTurn({ maxTokens: 4096, temperature: 0.8 });
const history = [{ role: "user", content: "I fixed the gate." }] as any;
const cases = [
  buildVillagerMessages(card, village, history, "What do you think?", context, narration),
  buildGreetingMessages(card, village, context, narration),
  buildSceneOpeningMessages(card, village, context, narration),
  buildLeavingMessages(card, village, history, context, narration),
];
for (const messages of cases) {
  const prompt = messages.map((message) => message.content).join("\n");
  assert.match(prompt, /The player controls their own words, decisions, actions, thoughts, feelings, and consent/u);
  assert.match(prompt, /Never write or imply a new player response/u);
}
assert.match(cases[0]!.map((message) => message.content).join("\n"), /I fixed the gate/u);
assert.match(cases[3]!.map((message) => message.content).join("\n"), /The player has chosen to end the visit/u);

console.log("Villages player voice regression passed");
