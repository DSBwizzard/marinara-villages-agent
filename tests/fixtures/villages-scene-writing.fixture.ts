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
import { snapshotFromCard } from "../../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import { wishFingerprint } from "../../packages/villages/src/server/domain/rules/social-wishes.js";
import { mapScenePeople } from "../../packages/villages/src/server/domain/rules/scene-prompt-references.js";
import {
  createSceneWriting,
  type SceneWritingPorts,
} from "../../packages/villages/src/server/features/scenes/writing-service.js";

const promptPeople = new Map<string, Record<string, string>>();
/** Exercise the current Scene prompt path with a fitting model that cannot generate. */
export async function currentScenePrompt(
  state: VillageState,
  card: VillagerCard,
  mode: "greet" | "chat" | "leave" = "chat",
  message = "What do you think?",
  overrides: Partial<VenueScene> = {},
  operationInput: Record<string, unknown> = {},
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
    ...defaultVillageState(),

    ...state,
    seed: state.seed || "prompt-fixture",
    villagers: state.villagers.some((resident) => resident.characterId === card.id)
      ? state.villagers.map((resident) =>
          resident.characterId === card.id ? { ...resident, cardSnapshot: snapshot } : resident,
        )
      : [
          ...state.villagers,
          { letterFontId: "caveat", characterId: card.id, cardSnapshot: snapshot, addedAt: "2026-10-07T12:00:00.000Z" },
        ],
  });
  assert.deepEqual(
    world.villagers.map((resident) => resident.characterId).sort(),
    [...new Set([...state.villagers.map((resident) => resident.characterId), card.id])].sort(),
    "all supplied residents, including hidden actors, survive current save decoding",
  );
  const session = coerceSession({
    version: 4,
    semanticVersion: 2,
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
  // Contact generation is request-local and intentionally absent from saved decoding.
  session.contactGeneration = overrides.contactGeneration;
  const admission = {
    writingContractVersion: 4,
    semanticPipelineVersion: 3,
    residentActionsVersion: 2,
    interactionScopeVersion: 6,
    ...operationInput,
  };
  session.operation ??= { input: admission } as VenueScene["operation"];
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
    rejectVenueCompletion: forbidden,
    completeWithRoom: forbidden,
    refreshZoneParticipants: forbidden,
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
    if (result.audience.includes(card.id) && card[field]?.trim())
      assert.ok(prompt.includes(card[field].trim()), `the actual Scene writer includes authored ${field}`);
  }
  if (mode === "chat")
    assert.deepEqual(
      result.fitted.messages.at(-1),
      { role: "user", content: message },
      "the actual submitted player line remains a separate final user message",
    );
  promptPeople.set(prompt, result.historyContract?.people ?? {});
  return prompt;
}

export function scenePromptPacket(prompt: string, people = promptPeople.get(prompt) ?? {}): any {
  const packet = prompt.split("\n").find((line) => line.startsWith('{"context":'));
  assert(packet, "The GM receives a structured current Scene context");
  const stable = prompt.split("\n").find((line) => line.startsWith('{"player":'));
  const scene = prompt.split("\n").find((line) => line.startsWith('{"scene":'));
  const parsed = JSON.parse(packet);
  const combined = mapScenePeople(
    {
      ...(stable ? JSON.parse(stable) : {}),
      ...(scene ? JSON.parse(scene) : {}),
      ...parsed,
    },
    people,
  ) as any;
  combined.people = people;
  combined.context.actors ??= [];
  combined.context.memory ??= {};
  combined.context.memory.administrative ??= {};
  return combined;
}

export function decodePromptHistory(value: any, people: Record<string, string> = {}) {
  if (Array.isArray(value)) return mapScenePeople(value, people) as any;
  const groups = value.groups.map((group: any) => ({
    ...group,
    lines: group.lines.map((line: any) => {
      if (!Array.isArray(line)) return line;
      const [id, speakerId, text, details] = line;
      return {
        id,
        speakerId: speakerId === null ? "__venue_scene__" : speakerId,
        kind: speakerId === null ? "narration" : "dialogue",
        text,
        ...details,
      };
    }),
  }));
  return mapScenePeople({ ...value, groups }, people) as any;
}
export function scenePromptHistory(prompt: string, people = promptPeople.get(prompt) ?? {}): any[] {
  const prefix = "Partial active Scene history (omission never proves historical absence): ";
  const chunks = prompt.split("\n").filter((line) => line.startsWith("Scene exchange: "));
  if (chunks.length) {
    const packet = scenePromptPacket(prompt, people);
    return chunks.flatMap((line) => {
      const parsed = decodePromptHistory(JSON.parse(line.slice("Scene exchange: ".length)), packet.people ?? {});
      if (Array.isArray(parsed))
        return parsed.flatMap((group: any) => group.lines.map((row: any) => ({ ...group.facts, ...row })));
      return parsed.groups.flatMap((group: any) =>
        group.lines.map((row: any) => ({
          ...parsed.facts,
          ...group.facts,
          ...row,
          citable: row.citable ?? true,
          name: row.name ?? parsed.names[row.speakerId],
          ...(row.kind === "dialogue"
            ? { delivery: row.delivery ?? "ordinary", presentation: row.presentation ?? "main" }
            : {}),
          heardBy: (
            mapScenePeople(
              { heardBy: packet.historyAudiences[group.facts.heardBy ?? parsed.facts?.heardBy] },
              packet.people ?? {},
            ) as any
          ).heardBy,
        })),
      );
    });
  }
  const line = prompt.split("\n").find((line) => line.startsWith(prefix));
  return line ? JSON.parse(line.slice(prefix.length, line.lastIndexOf(" Continue after these events."))) : [];
}

export function scenePromptPositions(prompt: string) {
  const packet = scenePromptPacket(prompt);
  const zone = (id: string) => {
    const found = packet.scene.zones.find((row: any) => row.id === id);
    return found ? { id, name: found.name, kind: found.kind } : undefined;
  };
  return {
    venue: packet.scene.placeName,
    player: { zone: zone(packet.context.zoneId) ?? { id: packet.context.zoneId } },
    residents: packet.context.actors
      .filter((actor: any) => actor.location !== undefined)
      .map((actor: any) => ({
        characterId: actor.id,
        name: actor.name,
        location: actor.location,
        ...(actor.zoneId ? { zone: zone(actor.zoneId) } : {}),
      })),
  };
}
