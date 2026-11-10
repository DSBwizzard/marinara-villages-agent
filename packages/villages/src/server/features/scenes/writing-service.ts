import type { CapabilityResolvedLanguageModel } from "@marinara-engine/shared";
import type { LoreInspection } from "../../../shared/contracts/lore.js";
import { admissionLoreContext } from "../../../shared/helpers/resident-admission.js";
import { recordLoreUse } from "../../adapters/observability/runtime-debug.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { NarrationReadset } from "../../domain/models/narration-model.js";
import type { GreetingTrace, VenueScene } from "../../domain/models/scene-model.js";
import { badGateway, conflict } from "../../domain/rules/errors.js";
import { inspectedLoreUse, villageLoreContext } from "../../domain/rules/lore-context.js";
import { memoryHash, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { NARRATION_DIRECTION, NARRATION_KEEP, NARRATION_RESPONSE } from "../../domain/rules/narration-contract.js";
import { fittedNarrationReadset, narrationContinuityContext } from "../../domain/rules/narration-context.js";
import { venueAdditionalWritingGuidance, venueWritingDirection } from "../../domain/rules/narration-style.js";
import { findLocation, findNpc, npcProfile } from "../../domain/rules/places.js";
import { renderPlayerBackgroundContext } from "../../domain/rules/player-background.js";
import { projectSpeechPrompt } from "../../domain/rules/project-interpretation.js";
import { narrationAccessPrompt } from "../../domain/rules/narration-access.js";
import { NARRATION_NATIVE } from "../../domain/rules/narration-native.js";
import { villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { residentMovementOptions } from "../../domain/rules/resident-movement.js";
import { responseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import { sceneContinuityView, sceneLocationContext } from "../../domain/rules/scene-continuity.js";
import { assertCurrentSceneGeneration, completeSceneObject } from "../../domain/rules/scene-writing-contract.js";
import { sceneSpriteSelection, describeSpriteExpressions } from "../../domain/rules/sprite-expressions.js";
import {
  buildVenueSceneBlocks,
  fitVenueWritingMessages,
  venueCardProfile,
  type VenueWritingBlock,
} from "../../domain/rules/venue-writing.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { readPlayerIdentity } from "../../domain/rules/village-projections.js";
import { zoneEventHearingContext, zoneEventScene } from "../../domain/rules/zone-events.js";

export interface SceneWritingPorts {
  venueCheckpoint?: typeof import("../../jobs/venue-coordinator.js").venueCheckpoint;
  venueSavedCheckpoint?: typeof import("../../jobs/venue-coordinator.js").venueSavedCheckpoint;
  readEffectiveVillagerCard: typeof import("../../adapters/engine/catalog.js").readEffectiveVillagerCard;
  readVillageLore: typeof import("../../adapters/engine/lorebooks.js").readVillageLore;
  villagesLanguageModels(): Pick<
    ReturnType<typeof import("../../adapters/models/language-models.js").villagesLanguageModels>,
    "resolveForRequest"
  >;
  measurePipeline: typeof import("../../adapters/observability/pipeline-metrics.js").measurePipeline;
  runtimeDebug: typeof import("../../adapters/observability/runtime-debug.js").runtimeDebug;
  venueOperationId: typeof import("../../adapters/operations/operation-context.js").venueOperationId;
  rejectVenueCompletion: typeof import("../../jobs/venue-coordinator.js").rejectVenueCompletion;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
}
export const VENUE_REPLY_MAX_TOKENS = 4096;
type Request = {
  fitted: ReturnType<typeof fitVenueWritingMessages>;
  readset: NarrationReadset;
  model: { model: string; connectionId: string };
  loreInspection?: LoreInspection;
};

/** One GM purchase. Existing operation checkpoints own the exact fit and purchased reply through recovery. */
export function createSceneWriting({
  venueCheckpoint = async (_stage, work) => work(),
  venueSavedCheckpoint,
  readEffectiveVillagerCard,
  readVillageLore,
  villagesLanguageModels,
  measurePipeline,
  runtimeDebug,
  venueOperationId,
  rejectVenueCompletion,
  completeWithRoom,
  villagesConnectionIdFor,
  readVillageState,
}: SceneWritingPorts) {
  const requestKey = (scene: VenueScene, input: string, mode: string) =>
    memoryHash([scene.id, venueOperationId(), mode, input]);
  async function prepareVenueTurnMessages(
    original: VenueScene,
    input: string,
    mode: "greet" | "chat" | "leave",
    signal?: AbortSignal,
    trace?: GreetingTrace,
  ) {
    assertCurrentSceneGeneration(original);
    signal?.throwIfAborted();
    const started = performance.now();
    const key = requestKey(original, input, mode),
      saved = venueSavedCheckpoint?.<Request>("writing-request:" + key);
    if (saved) {
      assertRequestIdentity(saved, original, input);
      const model = await capturedModel(saved);
      return { ...saved, resolvedModel: model };
    }
    const [authority, connectionId] = await Promise.all([
      readVillageState({ memories: true }),
      villagesConnectionIdFor("narration"),
    ]);
    const village = sceneContinuityView(authority, original),
      venue = findLocation(village, original.placeId);
    if (!venue) throw conflict("The Scene's Place is unavailable. The draft is retained.");
    const scene = original.contactGeneration?.zoneEvents
      ? original
      : zoneEventScene(original, venue, { message: input });
    memoryRequire(scene.contactGeneration?.venue?.id === scene.placeId, "admitted writing location changed");
    const selectedIds = scene.contactGeneration!.actorIds!,
      player = readPlayerIdentity(village);
    const cast = scene.participants
      .filter((row) => selectedIds.includes(row.characterId))
      .toSorted((a, b) => a.characterId.localeCompare(b.characterId, "en"));
    const cards = cast.flatMap((person) => {
      const resident = village.villagers.find((row) => row.characterId === person.characterId);
      return resident ? [readEffectiveVillagerCard(resident)] : [];
    });
    const profiles = cast.map((person) => {
      const card = cards.find((row) => row.id === person.characterId);
      if (card) return venueCardProfile(card, player.name, false, false);
      const npc = findNpc(village, person.characterId);
      if (!npc) throw conflict("A captured character's authored identity is unavailable.");
      return npcProfile(npc);
    });
    const context = narrationContinuityContext(
      authority,
      scene,
      venue,
      venueOperationId(),
      input,
      villageNow(authority.clock?.advanceMs ?? 0).toISOString(),
    );
    let loreInspection: LoreInspection | undefined;
    const [lore, model] = await Promise.all([
      readVillageLore(
        village.selectedLorebookIds,
        [
          villageLoreContext(village),
          scene.placeName,
          admissionLoreContext(
            village.worldName,
            village.villagers.filter((row) => selectedIds.includes(row.characterId)).map((row) => row.admission),
          ),
          cast.map((row) => row.name).join(", "),
          input,
        ].join("\n"),
        signal,
        village.loreTokenBudget,
        {
          current: input,
          recent: context.parts.filter((part) => part.block.optional === "history").map((part) => part.block.text),
          inspect: (report) => {
            loreInspection = report;
          },
        },
      ),
      villagesLanguageModels().resolveForRequest({ connectionId }),
    ]);
    signal?.throwIfAborted();
    const projectContexts = context.projects;
    const calendar = deriveVillageMoment({
      foundedAt: village.foundedAt,
      environment: village.narrative,
      seed: village.seed,
      timeZone: village.timeZone || undefined,
      now: new Date(scene.sceneAttendance?.capturedAt ?? scene.startedAt),
    });
    const presentation = sceneSpriteSelection(scene, village),
      loreUses = inspectedLoreUse(loreInspection, "GM");
    const blocksFor = (texts: string[]): VenueWritingBlock[] => texts.filter(Boolean).map((text) => ({ text }));
    const blocks = buildVenueSceneBlocks({
      direction: blocksFor([
        NARRATION_DIRECTION,
        venueWritingDirection(village.narrationStyle, player.name),
        venueAdditionalWritingGuidance(village.narrationStyle),
      ]),
      metadata: blocksFor([NARRATION_RESPONSE, NARRATION_KEEP, NARRATION_NATIVE]),
      identity: blocksFor([
        ...profiles,
        JSON.stringify({
          player: { name: player.name, description: player.description },
          startingBackground: renderPlayerBackgroundContext(village),
          setting: villageCurrentSetting({ ...village, narrative: undefined }),
        }),
      ]),
      authoredInstructions: blocksFor(
        cards.map((card) =>
          card.postHistoryInstructions
            ? `Authored post-history instructions for ${card.name}:\n${card.postHistoryInstructions.replace(/\{\{char\}\}/gi, card.name).replace(/\{\{user\}\}/gi, player.name)}`
            : "",
        ),
      ),
      frame: blocksFor([
        scene.contactGeneration?.instruction ?? "",
        JSON.stringify({
          location: sceneLocationContext(scene, venue, selectedIds),
          movements: residentMovementOptions(village, venue, scene, selectedIds),
        }),
        zoneEventHearingContext(scene, venue),
      ]),
      conversation: [
        {
          text: "Interaction history is private GM chronology. Only the explicit per-character perceptions/sources may establish a character's knowledge. A partial history or room view omits stored content; omission never means absence.",
        },
        ...context.parts.map((part) => part.block),
        ...lore.map((text, index): VenueWritingBlock => ({
          text: "Relevant world lore: " + text,
          optional: "lore",
          lore: loreUses[index],
        })),
      ],
      circumstances: blocksFor([
        mode === "greet"
          ? "Open the Scene from established presence; do not invent voluntary player actions or speech."
          : mode === "leave"
            ? "Interpret the whole authored submission, then close naturally without inventing the player's goodbye."
            : "",
        projectSpeechPrompt(village, projectContexts),
        narrationAccessPrompt(context.access),
        JSON.stringify({
          calendar,
          protections: context.protections,
          presentation: {
            state: presentation.state,
            sprites: Object.entries(presentation.sprites).map(([actorId, sprite]) => ({
              actorId,
              expressions: describeSpriteExpressions(sprite, presentation.variants),
            })),
          },
        }),
      ]),
    });
    const fitted = fitVenueWritingMessages(
      model,
      blocks,
      input,
      Math.min(model.maxOutputTokens ?? VENUE_REPLY_MAX_TOKENS, VENUE_REPLY_MAX_TOKENS),
    );
    if (loreInspection) {
      let index = 0;
      loreInspection = {
        ...loreInspection,
        purpose: "Scene Narration",
        stage: "prompt",
        entries: loreInspection.entries.map((entry) => {
          if (entry.status !== "included") return entry;
          return {
            ...entry,
            status: fitted.loreEntries.includes("Relevant world lore: " + lore[index++]) ? "included" : "context-limit",
          };
        }),
      };
    }
    const request: Request = {
      fitted,
      readset: fittedNarrationReadset(authority, context, fitted.evidenceIds),
      model: { model: model.model, connectionId: model.connectionId },
      loreInspection,
    };
    const retained = await venueCheckpoint("writing-request:" + key, async () => request);
    assertRequestIdentity(retained, original, input);
    trace?.("preparation and context fit", performance.now() - started);
    return { ...retained, resolvedModel: await capturedModel(retained, model) };
  }

  async function generate(
    scene: VenueScene,
    input: string,
    mode: "greet" | "chat" | "leave",
    signal?: AbortSignal,
    trace?: GreetingTrace,
  ) {
    assertCurrentSceneGeneration(scene);
    return measurePipeline("Scene narration", { sceneId: scene.id, mode }, async () => {
      const key = requestKey(scene, input, mode),
        completionStage = "writing-completion:" + key;
      const savedRequest = venueSavedCheckpoint?.<Request>("writing-request:" + key);
      const savedCompletion = venueSavedCheckpoint?.<Awaited<ReturnType<typeof completeWithRoom>>>(completionStage);
      let request: Request, completion: Awaited<ReturnType<typeof completeWithRoom>>;
      if (savedRequest && savedCompletion) {
        assertRequestIdentity(savedRequest, scene, input);
        request = savedRequest;
        completion = savedCompletion;
      } else {
        const prepared = await prepareVenueTurnMessages(scene, input, mode, signal, trace);
        request = prepared;
        signal?.throwIfAborted();
        await recordLoreUse(request.fitted.lore, `Scene · ${scene.placeName || "Exchange"}`);
        trace?.("model request", 0, `${prepared.resolvedModel.model} (${prepared.resolvedModel.connectionId})`);
        completion = await venueCheckpoint(completionStage, () =>
          requestCompletion(prepared.resolvedModel, request, signal),
        );
      }
      const raw = completeSceneObject(completion.content ?? "", completion.finishReason);
      const diagnostics = responseDiagnostics(
        request.model,
        completion,
        request.fitted.maxTokens ?? VENUE_REPLY_MAX_TOKENS,
        raw,
      );
      if (!raw) {
        await rejectVenueCompletion({ ...request.model, reason: "invalid-gm-response" }, { stages: [completionStage] });
        throw Object.assign(
          badGateway("The Scene response was not complete JSON. Your input and purchased response are retained."),
          {
            failure: {
              cause: "invalid_json",
              stage: "scene-response",
              message: "The Scene response was not complete JSON.",
              responseDiagnostics: diagnostics,
            },
          },
        );
      }
      runtimeDebug("Scene writing contract", {
        sceneId: scene.id,
        complete: true,
        inputCharacters: request.fitted.messages.reduce((sum, row) => sum + row.content.length, 0),
      });
      return {
        raw,
        readset: request.readset,
        responseDigest: memoryHash([completion.content, completion.finishReason]),
        lore: request.fitted.lore,
        responseDiagnostics: diagnostics,
      };
    });
  }
  function assertRequestIdentity(request: Request, scene: VenueScene, input: string) {
    memoryRequire(
      request.readset.source.input === input &&
        request.readset.source.scene.id === scene.id &&
        request.readset.source.operationId === venueOperationId() &&
        request.readset.source.seed === scene.villageSeed,
      "saved narration request changed",
    );
  }
  async function capturedModel(request: Request, resolved?: CapabilityResolvedLanguageModel) {
    const model =
      resolved?.model === request.model.model && resolved.connectionId === request.model.connectionId
        ? resolved
        : await villagesLanguageModels().resolveForRequest({ connectionId: request.model.connectionId });
    if (model.model !== request.model.model || model.connectionId !== request.model.connectionId)
      throw conflict("The captured Narration model changed. The request is retained.");
    return model;
  }
  function requestCompletion(model: CapabilityResolvedLanguageModel, request: Request, signal?: AbortSignal) {
    return completeWithRoom(model, request.fitted.messages, request.fitted.maxTokens ?? VENUE_REPLY_MAX_TOKENS, {
      responseFormat: { type: "json_object" },
      temperature: 0.85,
      usagePurpose: "conversation",
      reasoningEffort: null,
      verbosity: null,
      debugMode: false,
      signal,
    });
  }
  return { prepareVenueTurnMessages, generate };
}
export type SceneWriting = ReturnType<typeof createSceneWriting>;
export type SceneReply = Awaited<ReturnType<SceneWriting["generate"]>>;
