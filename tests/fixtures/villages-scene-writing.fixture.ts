import assert from "node:assert/strict";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../../packages/villages/src/server/features/scenes/writing-service.js";
import { coerceVillageState } from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import { coerceSession } from "../../packages/villages/src/server/domain/decoding/scene-codec.js";
import { readEffectiveVillagerCard } from "../../packages/villages/src/server/adapters/engine/catalog.js";
import { snapshotFromCard } from "../../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { wishFingerprint } from "../../packages/villages/src/server/domain/rules/wish-interpretation-rules.js";
import type { VillageState } from "../../packages/villages/src/server/domain/models/world.js";
import type { VillagerCard } from "../../packages/villages/src/server/domain/models/catalog-model.js";
import type { VenueScene } from "../../packages/villages/src/server/domain/models/scene-model.js";

/** Exercise the current Scene prompt path with a fitting model that cannot generate. */
export async function currentScenePrompt(
  state: VillageState,
  card: VillagerCard,
  mode: "greet" | "chat" | "leave" = "chat",
  message = "What do you think?",
  overrides: Partial<VenueScene> = {},
) {
  const snapshot = {
    ...snapshotFromCard(
      {
        ...card,
        tags: card.tags ?? [],
        comment: card.comment ?? "",
        summary: card.summary ?? "",
        nameColor: card.nameColor ?? "",
        dialogueColor: card.dialogueColor ?? "",
      },
      1,
    ),
    capturedAt: "2026-10-07T12:00:00.000Z",
  };
  const world = coerceVillageState({
    ...state,
    villagers: state.villagers.some((resident) => resident.characterId === card.id)
      ? state.villagers.map((resident) =>
          resident.characterId === card.id ? { ...resident, cardSnapshot: snapshot } : resident,
        )
      : [...state.villagers, { characterId: card.id, cardSnapshot: snapshot, addedAt: "2026-10-07T12:00:00.000Z" }],
  });
  assert.deepEqual(
    world.villagers.map((resident) => resident.characterId).sort(),
    [...new Set([...state.villagers.map((resident) => resident.characterId), card.id])].sort(),
    "all supplied residents, including hidden actors, survive current save decoding",
  );
  const session = coerceSession({
    id: "prompt-fixture",
    placeId: "common-room",
    placeName: "Common room",
    area: "public",
    status: "active",
    startedAt: "2026-10-07T12:00:00.000Z",
    zoneId: "exterior",
    villageSeed: world.seed,
    participants: [{ characterId: card.id, name: card.name, doing: "keeping bees" }],
    activeIds: [card.id],
    lines: [],
    submissions: [],
    ...overrides,
  });
  const forbidden = () => assert.fail("Prompt preparation must not generate, interpret, or mutate a Scene.");
  type Model = Awaited<ReturnType<ReturnType<SceneWritingPorts["villagesLanguageModels"]>["resolveForRequest"]>>;
  const model: Model = {
    name: "Prompt fixture",
    model: "prompt-fixture",
    connectionId: "prompt-fixture",
    maxContext: 100000,
    maxOutputTokens: 4096,
    chatComplete: forbidden,
    fitContext(messages, options) {
      return {
        messages,
        maxTokens: options?.maxTokens,
        estimatedTokensBefore: 10,
        estimatedTokensAfter: 10,
        trimmed: false,
      };
    },
  };
  const ports: SceneWritingPorts = {
    readVillageState: async () => world,
    villagesConnectionIdFor: async (purpose) => {
      assert.equal(purpose, "narration");
      return model.connectionId;
    },
    villagesLanguageModels: () => ({
      resolveForRequest: async (request) => {
        assert.equal(request.connectionId, model.connectionId);
        return model;
      },
    }),
    readVillageLore: async () => [],
    readEffectiveVillagerCard,
    wishFingerprint,
    villagesLogger: () => ({ warn: forbidden }),
    measurePipeline: forbidden,
    runtimeDebug() {},
    venueOperationId: () => "",
    venueOperationInput: () => ({ interactionScopeVersion: 1 }),
    venueOperationSignal: () => undefined,
    rejectVenueCompletion: forbidden,
    completeWithRoom: forbidden,
    refreshZoneParticipants: forbidden,
    interpretRoomReply: forbidden,
  };
  const result = await createSceneWriting(ports).prepareVenueTurnMessages(session, message, mode, "", null);
  const prompt = result.fitted.messages.map((entry) => entry.content).join("\n");
  assert.doesNotMatch(prompt, /no longer resident/u);
  for (const field of [
    "description",
    "personality",
    "systemPrompt",
    "exampleDialogue",
    "backstory",
    "appearance",
    "postHistoryInstructions",
  ] as const) {
    if (card[field]?.trim())
      assert.ok(prompt.includes(card[field].trim()), `the actual Scene writer includes authored ${field}`);
  }
  if (mode === "chat")
    assert.deepEqual(
      result.fitted.messages.at(-1),
      { role: "user", content: message },
      "the actual submitted player line remains a separate final user message",
    );
  return prompt;
}
