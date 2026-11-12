import assert from "node:assert/strict";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { currentScenePrompt, scenePromptPacket } from "./fixtures/villages-scene-writing.fixture.js";
import { appendEpisode } from "../packages/villages/src/server/domain/rules/episodes.js";
import { continuityActor } from "../packages/villages/src/server/domain/rules/continuity-actors.js";
import { memoryHash } from "../packages/villages/src/server/domain/rules/memory-integrity.js";

async function main() {
  const village = defaultVillageState();
  const at = "2026-10-07T12:00:00.000Z";
  village.seed = "player-voice";
  village.setupAt = village.foundedAt = at;
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
  const input = "I worry about the hinge. I tell Hana, ‘I fixed the gate.’";
  const player = continuityActor(village, "player")!;
  village.episodes = appendEpisode(
    village.episodes,
    {
      format: 1,
      id: "previous-exchange",
      seed: village.seed,
      sceneId: "retired-visit",
      submissionId: "prior-turn",
      operationId: "prior-operation",
      capturedAt: at,
      acceptedAt: at,
      responseDigest: memoryHash(input),
      admittedContinuityRevision: 0,
      privateInput: input,
      actors: [player, { id: card.id, incarnation: "prompt-" + card.id }].map(({ id, incarnation }) => ({
        id,
        incarnation,
        zoneId: "exterior",
      })),
      segments: [
        {
          id: "reply",
          role: "assistant",
          kind: "dialogue",
          name: "Hana",
          speakerId: card.id,
          content: "Then the bees can stay put.",
          zoneId: "exterior",
          heardBy: [card.id, "player"],
          at,
        },
      ],
      grounding: [],
      continuityVersionIds: [],
      offered: [],
      commandReceipts: [],
      dependencies: {},
    },
    village.seed,
  );
  for (const mode of ["greet", "chat", "leave"] as const) {
    const prompt = await currentScenePrompt(village, card, mode, mode === "greet" ? "" : "What do you think?");
    assert.equal(scenePromptPacket(prompt, "player").player.name, "Robin");
    assert.match(prompt, /The player controls their own speech, decisions, actions, thoughts, feelings, and consent/u);
    assert.match(prompt, /Never write a new player response or imply one/u);
    assert.match(
      prompt,
      /narrate only what they explicitly submitted, the departure they chose, or an outcome already verified in the scene/u,
    );
    assert.equal(scenePromptPacket(prompt, "interaction").interaction.gmPrivateInput, input);
    assert.match(prompt, /Then the bees can stay put/u);
    if (mode === "greet") assert.match(prompt, /Open the Scene from established presence/u);
    if (mode === "leave") assert.match(prompt, /without inventing the player's goodbye/u);
  }
  console.log("Villages player voice regression: current greeting, conversation and departure prompts passed");
}
await main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
