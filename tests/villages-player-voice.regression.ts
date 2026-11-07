import assert from "node:assert/strict";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { currentScenePrompt, scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";

async function main() {
  const village = defaultVillageState();
  village.playerPersonaId = "robin";
  village.playerPersonaName = "Robin";
  const card = {
    ...readVillagerCard({
      id: "hana",
      data: { name: "Hana", description: "A beekeeper.", personality: "Direct." },
    } as any),
    systemPrompt: "Hana follows her own authored principles.",
    exampleDialogue: "Hana: The bees know when rain is coming.",
    backstory: "Hana learned beekeeping beside the orchard.",
    appearance: "Hana wears an old canvas coat.",
    postHistoryInstructions: "Keep Hana's dry cadence.",
  };
  for (const mode of ["greet", "chat", "leave"] as const) {
    const prompt = await currentScenePrompt(village, card, mode, "What do you think?", {
      lines: [
        {
          id: "prior-line",
          speakerId: "player",
          name: "Robin",
          role: "user",
          kind: "dialogue",
          content: "I fixed the gate.",
          at: "2026-10-07T12:00:00.000Z",
          heardBy: [card.id],
        },
      ],
    });
    assert.equal(scenePromptPacket(prompt).player.name, "Robin");
    assert.match(prompt, /The player controls their own speech, decisions, actions, thoughts, feelings, and consent/u);
    assert.match(prompt, /leave their next response to them/u);
    assert.match(prompt, /Narrate only their submitted actions or verified outcomes/u);
    assert.match(prompt, /I fixed the gate/u, "the witnessed player line survives current Scene prompt assembly");
    if (mode === "greet") assert.match(prompt, /Opening: the player's presence is established/u);
    if (mode === "chat") assert.match(prompt, /Only explicit Move changes the player's Zone/u);
    if (mode === "leave") assert.match(prompt, /do not invent a player goodbye/u);
  }
  console.log("Villages player voice regression: current greeting, conversation and departure prompts passed");
}
await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
