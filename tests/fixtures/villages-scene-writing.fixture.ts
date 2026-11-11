import assert from "node:assert/strict";
import { readEffectiveVillagerCard } from "../../packages/villages/src/server/adapters/engine/catalog.js";
import { coerceSession } from "../../packages/villages/src/server/domain/decoding/scene-codec.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../../packages/villages/src/server/domain/decoding/village-codec.js";
import type { VillagerCard } from "../../packages/villages/src/server/domain/models/catalog-model.js";
import type { VenueScene } from "../../packages/villages/src/server/domain/models/scene-model.js";
import type { VillageState } from "../../packages/villages/src/server/domain/models/world.js";
import { findLocation } from "../../packages/villages/src/server/domain/rules/places.js";
import { captureSceneContinuity } from "../../packages/villages/src/server/domain/rules/scene-continuity.js";
import { captureSceneLayout } from "../../packages/villages/src/server/domain/rules/scene-layout.js";
import { snapshotFromCard } from "../../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { venueFixture } from "../helpers/venues.fixture.js";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../../packages/villages/src/server/features/scenes/writing-service.js";

type Model = Awaited<ReturnType<ReturnType<SceneWritingPorts["villagesLanguageModels"]>["resolveForRequest"]>>;

/** Exercise the current Scene prompt path with a fitting model that cannot generate. */
export async function prepareScenePrompt(
  state: VillageState,
  card: VillagerCard,
  mode: "greet" | "chat" | "leave" = "chat",
  message = "What do you think?",
  overrides: Partial<VenueScene> = {},
  fitContext?: Model["fitContext"],
) {
  const at = overrides.startedAt ?? "2026-10-07T12:00:00.000Z";
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
    capturedAt: at,
  };
  const world = coerceVillageState({
    ...defaultVillageState(),

    ...state,
    seed: state.seed || "prompt-fixture",
    setupAt: state.setupAt || at,
    villagers: state.villagers.some((resident) => resident.characterId === card.id)
      ? state.villagers.map((resident) =>
          resident.characterId === card.id ? { ...resident, cardSnapshot: snapshot } : resident,
        )
      : [
          ...state.villagers,
          {
            letterFontId: "caveat",
            characterId: card.id,
            incarnation: "prompt-" + card.id,
            cardSnapshot: snapshot,
            addedAt: at,
          },
        ],
  });
  assert.deepEqual(
    world.villagers.map((resident) => resident.characterId).sort(),
    [...new Set([...state.villagers.map((resident) => resident.characterId), card.id])].sort(),
    "all supplied residents, including hidden actors, survive current save decoding",
  );
  const placeId = overrides.placeId ?? "common-room";
  let venue = findLocation(world, placeId);
  if (!venue && !overrides.placeId) {
    venue = venueFixture({
      id: placeId,
      name: "Common room",
      classes: ["community"],
      description: "A familiar gathering place.",
    });
    world.venues.push(venue);
  }
  assert(venue, "The prompt fixture needs its current Place");
  const zoneId = overrides.zoneId ?? "exterior";
  const participants = overrides.participants ?? [{ characterId: card.id, name: card.name, doing: "keeping bees" }];
  const session = coerceSession({
    id: "prompt-fixture",
    placeId,
    placeName: venue.name,
    status: "active",
    startedAt: at,
    zoneId,
    villageSeed: world.seed,
    participants,
    activeIds: participants.map(({ characterId }) => characterId),
    sceneAttendance: {
      capturedAt: at,
      layout: captureSceneLayout(venue),
      occupants: participants.map((participant) => ({ ...participant, zoneId })),
    },
    lines: [],
    submissions: [],
    ...overrides,
    version: 5,
  });
  session.contactGeneration = overrides.contactGeneration;
  session.continuity ??= captureSceneContinuity(world, session, Date.parse(at));
  const forbidden = () => assert.fail("Prompt preparation called generation.");
  const model: Model = {
    name: "Prompt fixture",
    model: "prompt-fixture",
    connectionId: "prompt-fixture",
    maxContext: 100000,
    maxOutputTokens: 4096,
    chatComplete: forbidden,
    fitContext:
      fitContext ??
      ((messages, options) => ({
        messages,
        maxTokens: options?.maxTokens,
        estimatedTokensBefore: 10,
        estimatedTokensAfter: 10,
        trimmed: false,
      })),
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
    measurePipeline: forbidden,
    runtimeDebug() {},
    venueOperationId: () => "prompt-fixture-operation",
    rejectVenueCompletion: forbidden,
    completeWithRoom: forbidden,
  };
  const result = await createSceneWriting(ports).prepareVenueTurnMessages(session, message, mode);
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
    if (
      result.readset.source.scene.contactGeneration?.actorIds?.includes(card.id) &&
      card[field]?.trim() &&
      !card[field].includes("{{")
    )
      assert.ok(prompt.includes(card[field].trim()), `the actual Scene writer includes authored ${field}`);
  }
  if (mode === "chat")
    assert.deepEqual(
      result.fitted.messages.at(-1),
      { role: "user", content: message },
      "the actual submitted player line remains a separate final user message",
    );
  return { ...result, prompt };
}

export async function currentScenePrompt(...args: Parameters<typeof prepareScenePrompt>) {
  return (await prepareScenePrompt(...args)).prompt;
}

export function scenePromptPacket(prompt: string, root: "calendar" | "player" | "location" | "interaction"): any {
  const packet = prompt.split("\n").find((line) => line.startsWith(`{"${root}":`));
  assert(packet, "The GM receives the requested structured Scene packet");
  return JSON.parse(packet);
}
