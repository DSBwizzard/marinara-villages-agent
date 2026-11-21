import type { CapabilityLanguageModelMessage } from "@marinara-engine/shared";
import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import {
  establishMapNpcs,
  MAP_NPC_INSTRUCTION,
  mapNpcOperationId,
  populatedMapIds,
  worldCharacterReferences,
} from "../../domain/rules/npc-cast.js";
import { memoryHash } from "../../domain/rules/memory-integrity.js";
import { conflict, safeFailureMessage } from "../../domain/rules/errors.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import type { PlaceOperation } from "../../domain/models/places.js";
import type { LoreInspection } from "../../../shared/contracts/lore.js";
import { inspectedLoreUse } from "../../domain/rules/lore-context.js";
import { recordLoreUse } from "../../adapters/observability/runtime-debug.js";

export type NpcPopulationPorts = {
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  mutateVillageState: typeof import("../world/village-store.js").mutateVillageState;
  villagesLanguageModels: typeof import("../../adapters/models/language-models.js").villagesLanguageModels;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
  reopenSavedResponse: typeof import("../generation/model-requests.js").reopenSavedResponse;
  mutateDocument: typeof import("../../adapters/storage/document-store.js").mutateDocument;
  readVillageLore: typeof import("../../adapters/engine/lorebooks.js").readVillageLore;
  now(): Date;
};

export function createNpcPopulation(ports: NpcPopulationPorts) {
  const pending = new Map<string, Promise<void>>();
  function prepareMapNpcs(mapId: string, retryId?: string): Promise<void> {
    const task = pending.get(mapId);
    if (task) return task;
    const work = prepare(mapId, retryId).finally(() => {
      if (pending.get(mapId) === work) pending.delete(mapId);
    });
    pending.set(mapId, work);
    return work;
  }
  async function prepare(mapId: string, retryId?: string) {
    const world = await ports.readVillageState({ memories: true });
    if (!world.setupAt || !populatedMapIds(world).includes(mapId)) return;
    const id = mapNpcOperationId(world.seed, mapId);
    const prior = world.worldPlaces.operations[id];
    if (prior?.status === "ready" || (prior && !retryId)) return;
    const retryKey = retryId && "npc-retry:" + memoryHash([mapId, retryId]);
    if (retryKey && world.worldPlaces.receipts[retryKey]) return;
    const key = (operation: PlaceOperation) => `map-npcs:${world.seed}:${mapId}:${operation.attempt}`;
    let cached = prior && retryId ? await ports.reopenSavedResponse(ports.mutateDocument, key(prior)) : undefined;
    if (cached) {
      try {
        if (cached.finishReason === "length") throw conflict("The saved NPC cast was incomplete.");
        establishMapNpcs(structuredClone(world), mapId, extractModelJsonObject(cached), id, ports.now().toISOString());
      } catch {
        // An explicit retry may replace an unusable draft; its purchased response remains saved under the old key.
        cached = undefined;
      }
    }
    const places = [
      ...world.venues,
      ...Object.values(world.worldPlaces.places)
        .filter((row) => !row.disabled)
        .map((row) => row.location),
    ]
      .filter((place) => place.presentation.mapId === mapId)
      .slice(0, 12);
    const people = [
      ...new Map(
        [
          ...worldCharacterReferences(world, { mapId }),
          ...places.flatMap((place) => worldCharacterReferences(world, { mapId, placeId: place.id })),
        ].map((person) => [person.id, person]),
      ).values(),
    ];
    let inspection: LoreInspection;
    const lore = cached
      ? []
      : await ports.readVillageLore(
          world.selectedLorebookIds,
          `${world.worldName}\n${world.setting}\n${world.maps.find((map) => map.id === mapId)?.name}`,
          undefined,
          world.loreTokenBudget,
          {
            inspect: (report) => {
              inspection = report;
            },
          },
        );
    const messages: CapabilityLanguageModelMessage[] = cached
      ? prior!.messages
      : [
          { role: "system", content: MAP_NPC_INSTRUCTION },
          {
            role: "user",
            content: JSON.stringify({
              setting: villageCurrentSetting(world),
              lore,
              rules: world.worldRules,
              map: world.maps.find((map) => map.id === mapId)?.name,
              people,
              places: places.map((place) => ({
                id: place.id,
                name: place.name,
                description: place.description.slice(0, 600),
                residents: place.residentIds,
                workers: place.workerIds,
                controllers: place.access?.managerIds,
              })),
            }),
          },
        ];
    const operation: PlaceOperation = cached
      ? { ...prior!, status: "started" }
      : {
          id,
          attempt: (prior?.attempt ?? 0) + 1,
          fingerprint: memoryHash(messages),
          kind: "populate",
          placeId: "",
          status: "started",
          input: { mapId, intent: "" },
          lore: inspectedLoreUse(inspection, "NPC cast"),
          messages,
          connectionId: (
            await ports
              .villagesLanguageModels()
              .resolveForRequest({ connectionId: await ports.villagesConnectionIdFor("system") })
          ).connectionId,
        };
    let admitted = false;
    await ports.mutateVillageState(
      (state) => {
        if (state.seed !== world.seed || !populatedMapIds(state).includes(mapId)) throw conflict("The Map changed.");
        const live = state.worldPlaces.operations[id];
        if (live?.status === "ready" || (retryKey && state.worldPlaces.receipts[retryKey])) return;
        if (memoryHash(live) !== memoryHash(prior)) return;
        state.worldPlaces.operations[id] = operation;
        if (retryKey) state.worldPlaces.receipts[retryKey] = mapId;
        state.worldPlaces.revision++;
        admitted = true;
      },
      { memories: true },
    );
    if (!admitted) return;
    try {
      let completion = cached;
      if (!completion) {
        await recordLoreUse(operation.lore, "NPC cast");
        const model = await ports
          .villagesLanguageModels()
          .resolveForRequest({ connectionId: operation.connectionId || null });
        const fitted = model.fitContext(messages, { maxTokens: 4096 });
        if (fitted.trimmed || JSON.stringify(fitted.messages) !== JSON.stringify(messages))
          throw conflict("The complete NPC cast request does not fit the System connection.");
        completion = await ports.completeWithRoom(model, messages, fitted.maxTokens ?? 4096, {
          responseFormat: { type: "json_object" },
          temperature: 0.7,
          savedRequest: {
            key: key(operation),
            retry: false,
            valid: (answer) => {
              if (answer.finishReason === "length") return false;
              establishMapNpcs(
                structuredClone(world),
                mapId,
                extractModelJsonObject(answer),
                id,
                ports.now().toISOString(),
              );
              return true;
            },
          },
        });
      }
      if (completion.finishReason === "length") throw conflict("The NPC cast response was incomplete.");
      const draft = extractModelJsonObject(completion);
      await ports.mutateVillageState(
        (state) => {
          const saved = state.worldPlaces.operations[id];
          if (state.seed !== world.seed || !saved || saved.attempt !== operation.attempt || saved.status !== "started")
            throw conflict("The NPC cast changed during preparation.");
          establishMapNpcs(state, mapId, draft, id, ports.now().toISOString());
          saved.status = "ready";
          delete saved.error;
        },
        { memories: true },
      );
    } catch (error) {
      await ports.mutateVillageState(
        (state) => {
          const saved = state.worldPlaces.operations[id];
          if (state.seed !== world.seed || saved?.attempt !== operation.attempt || saved.status === "ready") return;
          saved.status = "failed";
          saved.error = safeFailureMessage(error).slice(0, 300);
          state.worldPlaces.revision++;
        },
        { memories: true },
      );
      throw error;
    }
  }
  return { prepareMapNpcs };
}

const binding = createActivationBinding<ReturnType<typeof createNpcPopulation>>("NPC population is not configured.");
export const configureNpcPopulation = (service: ReturnType<typeof createNpcPopulation>) =>
  binding.configure(bindActivationService(service));
export const prepareMapNpcs = (mapId: string, retryId?: string) => binding.get().prepareMapNpcs(mapId, retryId);
