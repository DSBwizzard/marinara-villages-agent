import {
  initialStaging,
  replayStaging,
  stagingLayout,
  stagingTranscriptEvents,
} from "../../../shared/helpers/scene-staging.js";
import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
import type { GreetingTrace, VenueReplyFailureKind, VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { accessManagementPrompt } from "../../domain/rules/access-speech.js";
import { asRecord, asString, asTrimmedString } from "../../domain/rules/coerce.js";
import { badGateway, conflict } from "../../domain/rules/errors.js";
import { extractJsonObject } from "../../domain/rules/json-reply.js";
import { selectPromptMemories, selectPromptRecollections } from "../../domain/rules/memory-selection.js";
import {
  VENUE_SCENE_WRITING_FOUNDATION,
  venueAdditionalWritingGuidance,
  venueWritingDirection,
} from "../../domain/rules/narration-style.js";
import { renderPlayerRoleWritingContext } from "../../domain/rules/player-role.js";
import {
  bindProjectSpeech,
  projectSpeechContexts,
  projectSpeechPrompt,
} from "../../domain/rules/project-interpretation.js";
import { MAX_CHRONICLE_LENGTH, villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import {
  responseDiagnostics,
  type ResponseDiagnostics,
  sceneMissingFields,
} from "../../domain/rules/response-diagnostics.js";
import { extractSceneReply } from "../../domain/rules/scene-reply-json.js";
import { parseVenueReply, quietContactReply } from "../../domain/rules/scene-reply.js";
import { describeSpriteExpressions, validateSpriteExpression } from "../../domain/rules/sprite-expressions.js";
import {
  contactNeighbors,
  contactSpeech,
  readContactIntent,
  readContactMoves,
  readContactRelay,
} from "../../domain/rules/venue-contact.js";
import { venueClasses, venueInArea, venueResidentIds } from "../../domain/rules/venue-model.js";
import { type MovementIntent, readPlayerMovement } from "../../domain/rules/venue-movement.js";
import { readVenueRequestCore } from "../../domain/rules/venue-requests.js";
import { buildVenueResponseContract } from "../../domain/rules/venue-response-contract.js";
import { venueFoundingBackground } from "../../domain/rules/venue-scene-context.js";
import { readVenueSceneChange } from "../../domain/rules/venue-scene-state.js";
import { venueReplyIntegrity } from "../../domain/rules/venue-turn-integrity.js";
import {
  buildVenueSceneBlocks,
  fitVenueWritingMessages,
  venueCardProfile,
  type VenueWritingBlock,
} from "../../domain/rules/venue-writing.js";
import {
  canInviteToZone,
  legacyZoneId,
  resolveVenueZone,
  venueInZone,
  venueZones,
  zoneArea,
  zoneClosed,
  zoneControllerIds,
} from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { readPlayerIdentity } from "../../domain/rules/village-projections.js";
import { completionFailure as typedCompletionFailure, type WorkFailure } from "../../domain/rules/work-failure.js";
import { memoryVersion } from "../../domain/rules/live-exchange.js";
import { relationshipWritingPrompt } from "../../domain/rules/relationship-presentation.js";
import { createHash } from "node:crypto";
export interface SceneWritingPorts {
  refreshZoneParticipants: typeof import("./live-session.js").refreshZoneParticipants;
  readEffectiveVillagerCard: typeof import("../../adapters/engine/catalog.js").readEffectiveVillagerCard;
  readVillageLore: typeof import("../../adapters/engine/lorebooks.js").readVillageLore;
  villagesLogger(): Pick<ReturnType<typeof import("../../adapters/engine/runtime-host.js").villagesLogger>, "warn">;
  villagesLanguageModels(): Pick<
    ReturnType<typeof import("../../adapters/models/language-models.js").villagesLanguageModels>,
    "resolveForRequest"
  >;
  measurePipeline: typeof import("../../adapters/observability/pipeline-metrics.js").measurePipeline;
  runtimeDebug: typeof import("../../adapters/observability/runtime-debug.js").runtimeDebug;
  venueOperationId: typeof import("../../adapters/operations/operation-context.js").venueOperationId;
  venueOperationInput: typeof import("../../adapters/operations/operation-context.js").venueOperationInput;
  venueOperationSignal: typeof import("../../adapters/operations/operation-context.js").venueOperationSignal;
  rejectVenueCompletion: typeof import("../../jobs/venue-coordinator.js").rejectVenueCompletion;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
  wishFingerprint: typeof import("../residents/wishes/wish-interpretation.js").wishFingerprint;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  interpretRoomReply: typeof import("./room-interpretation.js").interpretRoomReply;
}

export const VENUE_REPLY_MAX_TOKENS = 4_096;

const VENUE_REPLY_TEMPERATURE = 0.85;
/** Inert Scene prompt fitting, response validation and room interpretation with originating connections. */
export function createSceneWriting({
  refreshZoneParticipants,
  readEffectiveVillagerCard,
  readVillageLore,
  villagesLogger,
  villagesLanguageModels,
  measurePipeline,
  runtimeDebug,
  venueOperationId,
  venueOperationInput,
  venueOperationSignal,
  rejectVenueCompletion,
  completeWithRoom,
  wishFingerprint,
  villagesConnectionIdFor,
  readVillageState,
  interpretRoomReply,
}: SceneWritingPorts) {
  /** Older admitted requests retain their saved interaction contract during recovery. */
  function explicitSceneActions(): boolean {
    const input = venueOperationInput();
    return !input || input.interactionScopeVersion === 1;
  }

  /** Do not disclose occupants of unseen Zones, including inside operation snapshots/checkpoints. */

  class VenueReplyFailure extends Error {
    constructor(
      readonly kind: VenueReplyFailureKind,
      readonly failure?: WorkFailure,
    ) {
      super(kind);
    }
  }

  /** Assemble and fit the exact live request without making a generation call. */
  async function prepareVenueTurnMessages(
    session: VenueScene,
    message: string,
    mode: "greet" | "chat" | "ask" | "fulfill" | "act" | "leave",
    targetId: string,
    settled: { fulfilled: boolean; wish: string; unresolved?: boolean; reason?: string } | null,
    signal?: AbortSignal,
    trace?: GreetingTrace,
    actionOutcome?: string,
  ) {
    const preparationStarted = performance.now();
    const [village, connectionId] = await Promise.all([readVillageState(), villagesConnectionIdFor("narration")]);
    signal?.throwIfAborted();
    trace?.("preparation", performance.now() - preparationStarted);
    const player = readPlayerIdentity(village);
    const now = new Date();
    const moment = deriveVillageMoment({
      foundedAt: village.foundedAt,
      seed: village.seed,
      now: session.sceneAttendance ? new Date(session.sceneAttendance.capturedAt) : new Date(session.startedAt),
    });
    const audibleIds = session.contactGeneration
      ? [...session.contactGeneration.localIds, ...session.contactGeneration.remoteIds]
      : session.activeIds;
    const active = session.participants.filter((person) => audibleIds.includes(person.characterId));
    const memoryQuery = `${session.placeName} ${message}`;
    const promptMemories = selectPromptMemories(
      village.chronicle,
      active.map((person) => person.characterId),
      memoryQuery,
      600,
    );
    const promptRecollections = selectPromptRecollections(
      village.recollections,
      active.map((person) => person.characterId),
      memoryQuery,
      400,
      now.getTime(),
    );

    // Only these exact witnessed lines and memory versions can support a saved proposal.
    const earlierEvidence = session.lines
      .filter((line) => !line.contactReport && line.heardBy.some((id) => audibleIds.includes(id)))
      .slice(-18);
    const memoryContext =
      "Selected witnessed memories (each listed once; only the named audience knows private entries; shared entries are village knowledge): " +
      JSON.stringify([
        ...promptMemories.map((memory) => ({
          kind: "durable",
          id: memory.id,
          text: memory.text,
          audience:
            memory.scope === "village"
              ? "village"
              : (memory.knownByCharacterIds ?? memory.actors.map((actor) => actor.id)),
          version: memoryVersion(memory),
        })),
        ...promptRecollections.map((memory) => ({
          kind: "passing",
          id: memory.id,
          text: memory.text,
          audience: memory.knownByCharacterIds,
          version: memory.lastReinforcedAt ?? memory.id,
        })),
      ]);
    const optionalKnowledge: VenueWritingBlock[] = [{ text: memoryContext, optional: "memory" }];
    const residentContexts: string[] = [];
    const expressionContexts: string[] = [];
    const profiles = active.map((person) => {
      const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
      if (!resident) return `${person.name} (${person.characterId}): no longer resident.`;
      const card = readEffectiveVillagerCard(resident);
      const sceneOccupant = session.sceneAttendance?.occupants.find(
        (entry) => entry.characterId === person.characterId,
      );
      const spriteLabels = describeSpriteExpressions(resident.sprite);

      residentContexts.push(
        [
          `${card.name} (${person.characterId})`,
          relationshipWritingPrompt(village, person.characterId),
          `Activity captured at Scene start: ${sceneOccupant?.doing || person.doing || "unspecified"}; availability at Scene start: ${sceneOccupant?.availability || "unspecified"}.`,
          `Current Residence: ${
            village.venues
              .filter((venue) => venueResidentIds(venue).includes(person.characterId))
              .map((venue) => `${venue.name} (${venue.id})`)
              .join(", ") || "none"
          }.`,
          `Private current desires of ${card.name}: ${resident.agenda?.wishes.map((wish) => `[${wish.id}] ${wish.wish}`).join("; ") || "none"}. These can inform a relevant choice; they require no gesture, hint, mention, or player errand.`,
        ]
          .filter(Boolean)
          .join("\n"),
      );
      if (spriteLabels)
        expressionContexts.push(
          `Filled expressions for ${card.name}: ${spriteLabels}. Select a listed expression id using its meaning. Pose-specific pictures must match actions already occurring in the scene. Omit expression to use the default image.`,
        );
      return venueCardProfile(card, player.name, false);
    });
    const stageIds = session.participants
      .filter((person) => session.activeIds.includes(person.characterId))
      .map((person) => person.characterId);
    const stage = replayStaging(
      stageIds,
      stagingTranscriptEvents(
        session.lines.filter((line) => !session.zoneId || !line.zoneId || line.zoneId === session.zoneId),
        session.submissions,
      ),
    ).at(-1)?.state;
    const stageState = stage ?? initialStaging(stageIds);
    const layout = stagingLayout(session.activeIds, stageState);
    const audience = active.map((person) => person.characterId);
    const storedPlace = village.venues.find((venue) => venue.id === session.placeId);
    const place = storedPlace
      ? session.zoneId
        ? venueInZone(storedPlace, session.zoneId)
        : venueInArea(storedPlace, session.area, session.spaceClass, session.privateOwnerId)
      : undefined;
    const pendingMoves = village.residences.filter(
      (residence) => residence.status === "pending" && audience.includes(residence.characterId),
    );
    // Prose Events are visual only. Verified player deeds have separate receipts.
    const recentHappenings = village.venueEvents
      .filter(
        (entry) =>
          entry.venueId === session.placeId &&
          (!session.zoneId || entry.zoneId === session.zoneId) &&
          now.getTime() - Date.parse(entry.at) <= 3 * 24 * 60 * 60 * 1000,
      )
      .slice(0, 4);
    const loreStarted = performance.now();
    const lorePromise = readVillageLore(
      village.selectedLorebookIds,
      [villageCurrentSetting(village), session.placeName, active.map((person) => person.name).join(", "), message].join(
        "\n",
      ),
      signal,
      village.loreTokenBudget,
    ).then((value) => {
      trace?.("lore", performance.now() - loreStarted);
      return value;
    });
    const resolutionStarted = performance.now();
    const modelPromise = villagesLanguageModels()
      .resolveForRequest({ connectionId })
      .then((value) => {
        trace?.("model resolution", performance.now() - resolutionStarted, `${value.model} (${value.connectionId})`);
        return value;
      });
    const [lore, model] = await Promise.all([lorePromise, modelPromise]);
    signal?.throwIfAborted();
    const projectContexts =
      mode === "chat" || mode === "ask"
        ? projectSpeechContexts(
            village,
            audience,
            `${session.lines
              .filter(
                (line) =>
                  (!line.zoneId || line.zoneId === session.zoneId) && audience.every((id) => line.heardBy.includes(id)),
              )
              .slice(-12)
              .map((line) => line.content)
              .join("\n")}\n${message}`,
            message,
            session.placeId,
          )
        : [];
    const pendingEdits = (storedPlace?.editProposals ?? []).filter(
      (proposal) =>
        !proposal.declined &&
        (!proposal.zoneId || proposal.zoneId === session.zoneId) &&
        (proposal.zoneId === session.zoneId ||
          proposal.target === "shared" ||
          proposal.ownerId === session.privateOwnerId),
    );
    const earlierContext =
      "Earlier evidence: " +
      JSON.stringify(
        earlierEvidence.map((line) => ({
          id: line.id,
          speakerId: line.role === "user" ? "player" : line.speakerId,
          kind: line.kind,
          heardBy: line.heardBy,
          text: line.content.slice(0, 500),
        })),
      );
    const blocksFor = (parts: string[]): VenueWritingBlock[] =>
      parts.map((text) => ({
        text,
        optional:
          optionalKnowledge.find((block) => block.text === text)?.optional ??
          (/^(Recent scene history:|Earlier Scene recap:)/u.test(text)
            ? "history"
            : /^(Shared village memories:|Only .* knows:)/u.test(text)
              ? "memory"
              : text.startsWith("Relevant world lore:")
                ? "lore"
                : undefined),
      }));
    const blocks = buildVenueSceneBlocks({
      direction: blocksFor([
        VENUE_SCENE_WRITING_FOUNDATION,
        venueWritingDirection(village.narrationStyle, player.name),
        venueAdditionalWritingGuidance(village.narrationStyle),
        mode === "greet"
          ? ""
          : "The latest player message is a completed turn. Continue after it. Never speak for the player, quote their words back as a resident, or replay a resident question they have just answered.",
        mode === "greet"
          ? "Open on a specific moment already underway in this place. Follow the residents' current activities, relationships, and cards. Do not force a welcome or a question to the player. If nobody speaks, show an observable action or change rather than generic atmosphere."
          : "",
        mode === "leave"
          ? "The player has chosen to leave now. Write a brief, grounded closing exchange: let someone present answer or say goodbye aloud, or narrate only that chosen departure if the room is empty. Do not invent the player's goodbye, further actions, or a new errand."
          : "",
      ]),
      identity: blocksFor([...profiles]),
      circumstances: blocksFor([
        `You write one shared scene in ${session.placeName}, ${village.name}. It is ${moment.localTime}. ${villageCurrentSetting(village)}`,
        `The player is ${player.name}. ${player.description}`,
        renderPlayerRoleWritingContext(village),
        session.contactGeneration?.instruction ?? "",
        `Zone: ${storedPlace ? (resolveVenueZone(storedPlace, session.zoneId ?? "")?.name ?? session.area) : session.area} (${session.zoneId ?? "legacy"}). Venue Class: ${place ? venueClasses(place).join(" / ") : "other"}. Form: ${place?.form ?? ""}. Current condition: ${place?.state.condition ?? ""}. Defining features: ${place?.state.features?.map((feature) => `${feature.id}: ${feature.text}${feature.locked ? " [locked]" : ""}`).join("; ") || "none"}. Visible traces: ${
          place?.state.traces
            ?.filter(
              (trace) => trace.kind !== "note" && (!trace.expiresAt || Date.parse(trace.expiresAt) > now.getTime()),
            )
            .map((trace) => `${trace.id}: ${trace.text}`)
            .join("; ") || "none"
        }. Items: ${place?.state.furniture.join("; ") || "none"}. Public facts: ${place?.state.publicFacts.join("; ") ?? ""}. Current state outranks older scene lines and happenings.`,
        `Approved room description: ${place?.description || "none"}. Structural Upgrades in this zone: ${
          place?.improvements
            ?.filter(Boolean)
            .map((upgrade) => upgrade!.title + ": " + upgrade!.description)
            .join("; ") || "none"
        }.`,
        place?.constructionStatus === "worksite"
          ? "This is an incomplete exterior-only worksite. Its project ledger and resident work order determine completion; neither player narration nor this scene can finish it or open its interior."
          : "",
        `Recent verified venue actions: ${recentHappenings.map((entry) => entry.text).join("; ") || "none"}`,
        accessManagementPrompt(village, audience, session.placeId),
        venueFoundingBackground(village),
        `A Venue is the place; Zones are its separate spaces, including Exterior, Common Space, and Private Space. A Scene is the whole active conversation in that Venue, continuing across Zone movement. The residents currently here are: ${audience.join(", ")}. Only server-listed residents occupy this Zone. Attendance and activities were captured at Scene start across the entire Venue. Scene-start activities describe the opening situation; witnessed developments establish what is happening now. Background agendas cannot add, remove, or move anyone during this Scene. Only evidenced movement within the Scene changes positions. A resident may leave after a clear spoken departure. Do not force a departure merely because real time passed.`,
        session.area === "outside"
          ? session.spaceClass === "residence"
            ? session.contactGeneration || !explicitSceneActions()
              ? "The player is in this Residence's Exterior Zone, outside its interior. A resident inside may answer, remain busy, sleep through the attempt, or ignore it. Show only what the player can observe from this Zone. Never describe the player entering the Common Space or a private space without validated permission. Do not expose unseen interior details."
              : "The player is in this Residence's Exterior Zone. Say / Do reaches only its current physical occupants. Use Contact to attempt attention in an adjacent Zone. Show only what the player can observe here; never invent interior replies, disclose unseen details or narrate entering another Zone."
            : "The player is in this Venue's Exterior Zone. Show only what they can observe from this Zone; do not describe them entering an interior."
          : active.length
            ? "Only the named residents may speak. Do not disclose one resident's private knowledge through another. When the player addresses someone, respond to what they said; silence alone is neither consent nor a generic substitute for an answer. Quoted dialogue is not required because each segment has an explicit kind."
            : "Nobody is present. Write one grounded scene narration, with no resident dialogue or invented witnesses.",
        ...residentContexts,
        projectSpeechPrompt(village, projectContexts),
        session.pendingProjectQuestions?.length
          ? `These Project matters remain unresolved: ${session.pendingProjectQuestions.join("; ")}. Clarify naturally; do not assume approval, commitment, or complete requirements. Do not demand formal wording.`
          : "",
        session.pendingRoomQuestions?.length
          ? `These room matters remain unresolved: ${session.pendingRoomQuestions.join("; ")}. Resolve them through natural contextual clarification before reacting as though permission or dismissal were established. Do not ask for formal permission wording.`
          : "",
        `Available venues for a requested move: ${
          village.venues
            .filter(
              (venue) =>
                venue.constructionStatus !== "worksite" &&
                !venue.occupancy.playerHome &&
                !venue.occupancy.residentCharacterId,
            )
            .map((venue) => `${venue.id}: ${venue.name}`)
            .join("; ") || "none"
        }.`,
        pendingMoves.some((move) => move.requestedBy === "player")
          ? `Pending player requests to move: ${pendingMoves
              .filter((move) => move.requestedBy === "player")
              .map((move) => `${move.characterId} to ${move.proposedVenueId}`)
              .join("; ")}.`
          : "",
        pendingEdits.length
          ? `Pending exact Residence edit proposals: ${pendingEdits.map((proposal) => `${proposal.id}: ${proposal.target} ${proposal.ownerId || "shared"}; description ${proposal.proposed.description}; condition ${proposal.proposed.state.condition}; items ${proposal.proposed.state.items.join(", ")}; public facts ${proposal.proposed.state.publicFacts.join(", ")}; features ${proposal.proposed.state.features.map((feature) => feature.text).join(", ")}; required ${proposal.requiredIds.join(", ")}; approved ${proposal.approvedIds.join(", ")}`).join(" | ")}`
          : "",
        actionOutcome
          ? `The action was checked separately. Its settled outcome is: ${actionOutcome}. React to this outcome; do not redo or contradict the action judgment.`
          : "",
        `Turn: ${mode}. Intended target: ${targetId || "anyone here"}. ${settled === null ? "" : settled.unresolved ? `The wish remains unresolved: ${settled.reason || "meaning or evidence is unclear"}. Clarify naturally through ordinary dialogue. Do not narrate a refusal or fulfillment as established.` : settled.fulfilled ? `A checked wish was fulfilled for ${targetId}: ${settled.wish}.` : "The claim was checked and did not fulfill a wish."}`,
      ]),
      conversation: blocksFor([
        `Relevant world lore: ${lore.join("\n") || "none"}`,
        ...optionalKnowledge.map((block) => block.text),
        ...active.flatMap((person) =>
          (village.wishKnowledge[person.characterId] ?? [])
            .filter((entry) => entry.status === "active")
            .map(
              (entry) =>
                `Player-known wish discoveries for ${person.characterId}/${entry.wishId}: ${JSON.stringify(
                  (entry.facts ?? [])
                    .filter((fact) => !fact.supersededBy)
                    .slice(-8)
                    .map(({ id, kind, quote }) => ({ id, kind, quote })),
                )}`,
            ),
        ),
        `Earlier Scene recap: ${session.recap || "none"}. The recap may name who heard a private exchange.`,
        "",
        earlierContext,
      ]),
      authoredInstructions: blocksFor([
        ...active.map((person) => {
          const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
          const card = resident ? readEffectiveVillagerCard(resident) : null;
          return card?.postHistoryInstructions
            ? `Authored post-history instructions for ${card.name}:\n${card.postHistoryInstructions.replace(/\{\{char\}\}/gi, card.name).replace(/\{\{user\}\}/gi, player.name)}`
            : "";
        }),
      ]),
      metadata: blocksFor(
        buildVenueResponseContract({
          opening: mode === "greet",
          conversational: mode === "chat" || mode === "ask",
          liveMemory: true,
          residentControlled:
            session.area === "shared" ||
            session.area === "private" ||
            !!(
              storedPlace && zoneControllerIds(storedPlace, resolveVenueZone(storedPlace, session.zoneId ?? "")!).length
            ),
          recapNeeded: session.lines.length >= 12,
          staging: session.stagingVersion === 1,
          projects: projectContexts.length > 0,
          exampleSpeakerId: stageIds[0],
          exampleWitnessIds: stageIds,
          explicitActions: explicitSceneActions(),
          contactAction: !!session.contactGeneration,
          contactFacts:
            !explicitSceneActions() && !session.contactGeneration && (mode === "chat" || mode === "ask") && storedPlace
              ? `Known villagers (not attendance): ${village.villagers.map((person) => `${person.characterId}: ${person.cardSnapshot.name}`).join("; ")}. Adjacent doorways (not attendance): ${contactNeighbors(storedPlace, session.zoneId ?? "exterior").join(", ")}. Open doorway speakers: ${(session.doorwayContacts ?? []).map((entry) => entry.characterId).join(", ")}.`
              : "",
          invitationZones: storedPlace
            ? venueZones(storedPlace)
                .filter((zone) => audience.some((id) => canInviteToZone(storedPlace, zone, id)))
                .map(
                  (zone) =>
                    `${zone.id}: ${zone.name} (${zone.kind}; controllers ${audience.filter((id) => canInviteToZone(storedPlace, zone, id)).join(", ")})`,
                )
                .join("; ")
            : "none",
          presentation:
            session.stagingVersion === 1
              ? "Current presentation state: " +
                JSON.stringify(
                  session.activeIds.map((characterId) => ({
                    characterId,
                    ...stageState[characterId],
                    ...layout[characterId],
                  })),
                )
              : "",
          expressions: expressionContexts,
        }),
      ),
    });
    const input =
      mode === "greet"
        ? session.area === "outside"
          ? session.spaceClass === "residence"
            ? "The player arrives in this Residence's Exterior Zone, outside its interior. Show a brief moment already underway from this Zone."
            : "The player arrives in this Venue's Exterior Zone. Show a brief moment already underway from this Zone."
          : "The player enters this space. Show a brief moment already underway here."
        : mode === "leave" && !message.trim()
          ? "The player leaves without saying anything."
          : message;
    // Keep the opening brief, with enough room for reasoning models.
    const requestedMaxTokens = mode === "greet" ? 1_600 : VENUE_REPLY_MAX_TOKENS;
    const maxTokens = Math.min(model.maxOutputTokens ?? requestedMaxTokens, requestedMaxTokens);
    const fitStarted = performance.now();
    const fitted = fitVenueWritingMessages(model, blocks, input, maxTokens);
    trace?.("context fit", performance.now() - fitStarted);
    const memoryIncluded = fitted.messages.some((message) => message.content.includes(memoryContext));
    runtimeDebug("memory retrieval", {
      sceneId: session.id,
      selectedDurableIds: memoryIncluded ? promptMemories.map((memory) => memory.id) : [],
      selectedPassingIds: memoryIncluded ? promptRecollections.map((memory) => memory.id) : [],
      durableBudget: 600,
      passingBudget: 400,
      participantIds: audibleIds,
      allocation: "half equal, half shared",
    });
    return {
      fitted,
      maxTokens,
      model,
      village,
      audience,
      active,
      pendingMoves,
      storedPlace,
      place,
      projectContexts,
      earlierEvidence,
      promptMemories: memoryIncluded ? promptMemories : [],
    };
  }

  async function generateOnce(...args: Parameters<typeof prepareVenueTurnMessages>) {
    return measurePipeline("Scene interpretation", { sceneId: args[0].id, mode: args[2] }, () =>
      generateMeasured(...args),
    );
  }

  async function generateMeasured(...args: Parameters<typeof prepareVenueTurnMessages>) {
    const [session, message, mode] = args;
    const signal = args[5];
    const trace = args[6];
    const {
      fitted,
      maxTokens,
      model,
      village,
      audience,
      active,
      pendingMoves,
      storedPlace,
      place,
      projectContexts,
      earlierEvidence,
      promptMemories,
    } = await prepareVenueTurnMessages(...args);
    trace?.("model request", 0, `${model.model} (${model.connectionId})`);
    let attempts = 0;
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? maxTokens, {
      responseFormat: { type: "json_object" },
      temperature: VENUE_REPLY_TEMPERATURE,
      usagePurpose: "conversation",
      reasoningEffort: null,
      verbosity: null,
      debugMode: false,
      signal,
      retryEmpty: false,
      onAttempt: trace
        ? (result, elapsedMs, limit) =>
            trace(
              `model attempt ${++attempts}`,
              elapsedMs,
              `finish=${result.finishReason ?? "unknown"} limit=${limit} usage=${JSON.stringify(result.usage ?? {})}`,
            )
        : undefined,
    });
    const raw = extractSceneReply(completion.content ?? "");
    const diagnostics = responseDiagnostics(
      model,
      completion,
      fitted.maxTokens ?? maxTokens,
      raw,
      !!raw && !extractJsonObject(completion.content ?? ""),
      sceneMissingFields(raw),
    );
    const movementIntent: MovementIntent | null =
      !explicitSceneActions() && !session.contactGeneration && (mode === "chat" || mode === "ask") && place
        ? readPlayerMovement(message, place, raw?.movementIntent)
        : null;
    const extractedContact =
      !explicitSceneActions() && !session.contactGeneration && (mode === "chat" || mode === "ask")
        ? readContactIntent(raw?.contactIntent, message)
        : null;
    // Route a valid contact interpretation before validating its uncommitted local draft.
    if (extractedContact)
      return {
        ...quietContactReply("Routing the contact request.", session.activeIds),
        contactIntent: extractedContact,
      };
    if (movementIntent)
      return { ...quietContactReply("Routing the movement request.", session.activeIds), movementIntent };
    let parsed: ReturnType<typeof parseVenueReply>;
    try {
      parsed = parseVenueReply(raw, audience, (characterId, requested) =>
        validateSpriteExpression(village.villagers.find((item) => item.characterId === characterId)?.sprite, requested),
      );
      for (const line of parsed.lines) {
        if (!line.expression) continue;
        const expression = validateSpriteExpression(
          village.villagers.find((item) => item.characterId === line.speakerId)?.sprite,
          line.expression,
        );
        if (expression) line.expression = expression;
        else delete line.expression;
      }
    } catch (cause) {
      await rejectVenueCompletion();
      runtimeDebug("scene parser rejection", {
        sceneId: session.id,
        physicalIds: session.contactGeneration?.localIds ?? session.activeIds,
        audibleIds: audience,
        reason: String(cause),
        finishReason: completion.finishReason,
        content: completion.content,
      });
      const failure = typedCompletionFailure(completion, "scene-response", fitted.maxTokens ?? maxTokens) ?? {
        cause: raw ? ("missing_result" as const) : ("invalid_json" as const),
        stage: "scene-response",
        message: raw
          ? "The Scene response did not contain valid segments; explicitly retry."
          : "The Scene response was not usable JSON; explicitly retry.",
      };
      throw new VenueReplyFailure(raw ? "invalid-segments" : "invalid-json", {
        ...failure,
        responseDiagnostics: diagnostics,
      });
    }
    if (session.contactGeneration) {
      const context = session.contactGeneration;
      for (const line of parsed.lines) {
        if (context.remoteIds.includes(line.speakerId)) {
          line.viaDoorway = true;
          if (context.delivery === "loud" || context.delivery === "device") line.remoteDelivery = context.delivery;
        }
        // Presentation never places an unseen remote listener in the player's Zone.
        line.staging = line.staging?.filter((cue) => context.localIds.includes(cue.characterId));
        if (line.kind === "narration") line.heardBy = [...context.localIds];
      }
    }
    const readSpeechSignal = (value: unknown) => {
      const entry = asRecord(value);
      const speakerId = asTrimmedString(entry.speakerId);
      const quote = asTrimmedString(entry.quote).replace(/\s+/gu, " ").toLowerCase();
      if (
        !audience.includes(speakerId) ||
        quote.length < 8 ||
        !parsed.lines.some(
          (line) => line.speakerId === speakerId && line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote),
        )
      )
        return null;
      return { speakerId, entry };
    };
    const request = readSpeechSignal(raw?.residenceRequest);
    const decision = readSpeechSignal(raw?.residenceDecision);
    const upgrade = readSpeechSignal(raw?.upgradeRequest);
    const venueRequest = readSpeechSignal(raw?.venueRequest);
    const invitation = readSpeechSignal(raw?.invitation);
    const editApproval = readSpeechSignal(raw?.editApproval);
    const departures = Array.isArray(raw?.departures)
      ? [
          ...new Set(
            raw.departures
              .map(readSpeechSignal)
              .filter(
                (entry): entry is NonNullable<ReturnType<typeof readSpeechSignal>> =>
                  !!entry &&
                  (!session.contactGeneration || session.contactGeneration.localIds.includes(entry.speakerId)),
              )
              .map((entry) => entry.speakerId),
          ),
        ]
      : [];
    const sceneEnded = !session.contactGeneration && !!readSpeechSignal(raw?.sceneEnded);
    const recollections: {
      text: string;
      subjectCharacterIds: string[];
      knownByCharacterIds: string[];
      evidence: (number | "player")[];
    }[] = [];
    if (mode !== "greet" && Array.isArray(raw?.recollections))
      for (const value of raw.recollections) {
        const row = asRecord(value);
        const text = asTrimmedString(row.text);
        const evidence = Array.isArray(row.evidence) ? row.evidence : [];
        const subjectCharacterIds = Array.isArray(row.subjectCharacterIds)
          ? [
              ...new Set(
                row.subjectCharacterIds.filter((id): id is string => typeof id === "string" && audience.includes(id)),
              ),
            ]
          : [];
        const knownByCharacterIds = Array.isArray(row.knownByCharacterIds)
          ? [
              ...new Set(
                row.knownByCharacterIds.filter((id): id is string => typeof id === "string" && audience.includes(id)),
              ),
            ]
          : [];
        if (
          !text ||
          text.length > MAX_CHRONICLE_LENGTH ||
          !knownByCharacterIds.length ||
          !evidence.length ||
          evidence.length > 8
        )
          continue;
        if (
          evidence.some((ref) =>
            knownByCharacterIds.some((characterId) =>
              ref === "player"
                ? !parsed.heardPlayerBy.includes(characterId)
                : !Number.isInteger(ref) ||
                  (ref as number) < 0 ||
                  !parsed.lines[ref as number]?.heardBy.includes(characterId),
            ),
          )
        )
          continue;
        recollections.push({
          text,
          subjectCharacterIds,
          knownByCharacterIds,
          evidence: evidence as (number | "player")[],
        });
      }
    const requestedVenueId = request ? asTrimmedString(request.entry.venueId) : "";
    const invitedVenueId = invitation ? asTrimmedString(invitation.entry.venueId) : "";
    const invitedVenue = village.venues.find((venue) => venue.id === invitedVenueId);
    let invitationScope: "shared" | "private" = invitation?.entry.scope === "private" ? "private" : "shared";
    const invitationZoneId = asTrimmedString(invitation?.entry.privateSpaceId ?? invitation?.entry.zoneId);
    const invitationZone = invitedVenue
      ? resolveVenueZone(
          invitedVenue,
          invitationZoneId ||
            legacyZoneId(
              invitedVenue,
              invitationScope === "private" ? "private" : "shared",
              "residence",
              asTrimmedString(invitation?.entry.ownerId),
            ),
        )
      : undefined;
    invitationScope =
      invitationZone?.kind === "private-residence" ? "private" : invitationZone ? "shared" : invitationScope;
    const invitationOwnerId =
      invitationScope === "private" ? (invitationZone?.ownerId ?? asTrimmedString(invitation?.entry.ownerId)) : "";
    const invitationQuote = asTrimmedString(invitation?.entry.quote).toLowerCase();
    const invitationIsFuture =
      /\b(later|tomorrow|next visit|next time|another day|anytime|when you return|come back)\b/u.test(invitationQuote);
    const invitationIsEntry = /\b(come in|come into|step in|step inside|enter|welcome inside|welcome in|visit)\b/u.test(
      invitationQuote,
    );
    const invitationTiming: "now" | "later" = invitation?.entry.timing === "now" ? "now" : "later";
    const invitationTimingSupported =
      invitationTiming === "later" ? invitationIsFuture : invitationIsEntry && !invitationIsFuture;
    const privateScopeSupported =
      invitationScope === "shared" ||
      /\b(my|mine|your)\s+(private\s+)?(room|bedroom|space|quarters)|private space\b/u.test(invitationQuote);
    const pendingDecision = decision
      ? pendingMoves.find((move) => move.characterId === decision.speakerId && move.requestedBy === "player")
      : null;
    const contactMoves =
      session.contactGeneration && storedPlace
        ? readContactMoves(raw?.contactMoves, parsed.lines, village, storedPlace, session, audience)
        : [];
    if (
      session.contactGeneration &&
      Array.isArray(raw?.contactMoves) &&
      raw.contactMoves.length !== contactMoves.length
    ) {
      await rejectVenueCompletion();
      throw badGateway("The contact reply proposed an unsupported movement. Your draft is preserved.");
    }
    return {
      ...parsed,
      interpretationRouting: raw?.interpretationRouting as unknown,
      roomEvents: raw?.roomEvents as unknown,
      projectContexts,
      contactIntent:
        !explicitSceneActions() && !session.contactGeneration && (mode === "chat" || mode === "ask")
          ? readContactIntent(raw?.contactIntent, message)
          : null,
      contactMoves,
      contactRelay:
        !explicitSceneActions() && session.contactGeneration && storedPlace
          ? readContactRelay(raw?.contactRelay, parsed.lines, village, storedPlace, session, audience)
          : null,
      contactEndIds:
        session.contactGeneration && Array.isArray(raw?.contactEnd)
          ? raw.contactEnd.flatMap((value) => {
              const row = asRecord(value),
                speakerId = asTrimmedString(row.speakerId),
                quote = asTrimmedString(row.quote);
              return audience.includes(speakerId) &&
                contactSpeech(parsed.lines, speakerId, quote) &&
                /\b(?:goodbye|bye|see you|talk (?:to you )?later|need to go|have to go|back to (?:sleep|work))\b/iu.test(
                  quote,
                ) &&
                !/\b(?:don't|do not|not|if|unless)\b/iu.test(quote)
                ? [speakerId]
                : [];
            })
          : [],
      projectSpeech: bindProjectSpeech(
        raw?.projectSpeech,
        projectContexts,
        parsed.lines.map((line, index) => ({ ...line, id: String(index) })),
      ),
      sceneChange:
        !session.contactGeneration && (mode === "chat" || mode === "ask")
          ? readVenueSceneChange(
              raw?.sceneChange,
              place,
              session.activeIds,
              village.villagers.map((person) => person.characterId),
            )
          : null,
      movementIntent,
      residenceSignal:
        (mode === "chat" || mode === "ask") &&
        requestedVenueId &&
        village.venues.some((venue) => venue.id === requestedVenueId)
          ? { kind: "request" as const, characterId: request!.speakerId, venueId: requestedVenueId }
          : (mode === "chat" || mode === "ask") && pendingDecision && typeof decision!.entry.approved === "boolean"
            ? {
                kind: "decision" as const,
                characterId: decision!.speakerId,
                venueId: pendingDecision.proposedVenueId,
                approved: decision!.entry.approved === true,
              }
            : null,
      upgradeSignal:
        (mode === "chat" || mode === "ask") &&
        upgrade &&
        (place?.residentIds?.includes(upgrade.speakerId) || place?.workerIds?.includes(upgrade.speakerId))
          ? { characterId: upgrade.speakerId, venueId: place.id, quote: asTrimmedString(upgrade.entry.quote) }
          : null,
      venueRequestSignal:
        (mode === "chat" || mode === "ask") && venueRequest && readVenueRequestCore(venueRequest.entry)
          ? {
              characterId: venueRequest.speakerId,
              ...readVenueRequestCore(venueRequest.entry)!,
              quote: asTrimmedString(venueRequest.entry.quote),
            }
          : null,
      invitationSignal:
        invitation &&
        invitedVenue &&
        invitationTimingSupported &&
        !(
          invitation.entry.privateSpaceId &&
          invitation.entry.zoneId &&
          invitation.entry.privateSpaceId !== invitation.entry.zoneId
        ) &&
        !(
          invitationZoneId &&
          invitation.entry.privateOwnerId &&
          invitationZoneId !==
            legacyZoneId(invitedVenue, "private", "residence", invitation.entry.privateOwnerId as string)
        ) &&
        !/\b(no|not|never|don't|can't|cannot|won't|unless|if|maybe|perhaps)\b/iu.test(invitationQuote) &&
        privateScopeSupported &&
        !!invitationZone &&
        !zoneClosed(village, invitedVenue, invitationZone) &&
        canInviteToZone(invitedVenue, invitationZone, invitation.speakerId) &&
        (invitationScope === "shared" || invitationOwnerId === invitation.speakerId)
          ? {
              residentId: invitation.speakerId,
              venueId: invitedVenueId,
              scope: invitationScope,
              zoneLabel: invitationZone.name,
              zoneId: invitationZone?.id,
              privateSpaceId:
                invitationZone && ["private-residence", "staff", "restricted"].includes(invitationZone.kind)
                  ? invitationZone.id
                  : undefined,
              area: invitationZone ? zoneArea(invitationZone) : undefined,
              spaceClass: invitationZone?.venueClass,
              accompanies:
                invitation?.entry.accompanies === true &&
                /\b(with me|follow me|show you|take you|come with|let me show)\b/iu.test(invitationQuote),
              timing: invitationTiming,
              ownerId: invitationOwnerId,
              quote: asTrimmedString(invitation.entry.quote),
            }
          : null,
      editApprovalSignal:
        editApproval &&
        (place?.editProposals ?? []).some(
          (proposal) =>
            proposal.id === asTrimmedString(editApproval.entry.proposalId) &&
            !proposal.declined &&
            proposal.requiredIds.includes(editApproval.speakerId),
        ) &&
        typeof editApproval.entry.approved === "boolean"
          ? {
              proposalId: asTrimmedString(editApproval.entry.proposalId),
              residentId: editApproval.speakerId,
              approved: editApproval.entry.approved === true,
              quote: asTrimmedString(editApproval.entry.quote),
            }
          : null,
      recap: asString(raw?.recap).slice(0, 600),
      departures,
      sceneEnded,
      recollections,
      responseDiagnostics: diagnostics as ResponseDiagnostics | undefined,
      memoryChanges: raw?.memoryChanges,
      relationshipChanges: raw?.relationshipChanges,
      earlierLineIds: earlierEvidence.map((line) => line.id),
      memoryVersions: Object.fromEntries(promptMemories.map((memory) => [memory.id, memoryVersion(memory)])),
      wishChanges: raw?.wishChanges,
      wishContexts: active.flatMap((person) =>
        (village.villagers.find((resident) => resident.characterId === person.characterId)?.agenda?.wishes ?? []).map(
          (wish) => ({ actorId: person.characterId, wishId: wish.id, fingerprint: wishFingerprint(wish) }),
        ),
      ),
    };
  }

  /** Interpret an accepted scene without writing a partial transcript. */
  async function interpretRoomDraft(
    session: VenueScene,
    currentVillage: VillageState,
    message: string,
    reply: SceneReply,
    eligible = true,
    evidenceLines = reply.lines,
  ) {
    const roomInterpretation = eligible
      ? await interpretRoomReply(
          session,
          currentVillage,
          message,
          evidenceLines,
          `${venueOperationId()}:${createHash("sha256").update(JSON.stringify(reply.lines)).digest("hex").slice(0, 12)}`,
          reply.heardPlayerBy,
          reply.invitationSignal ? undefined : reply.interpretationRouting,
          reply.roomEvents,
          reply.invitationSignal,
        )
      : null;
    const proposedInvitation = reply.invitationSignal;
    reply.invitationSignal = null;
    if (roomInterpretation) {
      // Narrator metadata is a proposal, not permission. Contextual interpretation replaces its phrase gates.
      const invitations = roomInterpretation.results.flatMap((result, index) =>
        ["invite-now", "invite-later"].includes(result.outcome)
          ? [{ result, check: roomInterpretation.checks[index] }]
          : [],
      );
      if (invitations.length === 1) {
        const { result, check } = invitations[0],
          facts = asRecord(check.facts);
        const controlledVenue = currentVillage.venues.find((venue) => venue.id === facts.venueId);
        const zone = controlledVenue && resolveVenueZone(controlledVenue, String(facts.zoneId));
        const actor = String(facts.actorId);
        const supporting =
          check.evidence.find(
            (line) => result.evidenceIds.includes(line.id) && line.current && line.speakerId === actor,
          ) ??
          check.evidence.find(
            (line) => result.evidenceIds.includes(line.id) && line.current && line.kind === "narration",
          );
        if (
          controlledVenue &&
          zone &&
          supporting &&
          !zoneClosed(currentVillage, controlledVenue, zone) &&
          canInviteToZone(controlledVenue, zone, actor)
        ) {
          reply.invitationSignal = {
            residentId: actor,
            venueId: controlledVenue.id,
            scope: zone.kind === "private-residence" ? "private" : "shared",
            zoneLabel: zone.name,
            zoneId: zone.id,
            privateSpaceId: ["private-residence", "staff", "restricted"].includes(zone.kind) ? zone.id : undefined,
            area: zoneArea(zone),
            spaceClass: zone.venueClass,
            accompanies:
              proposedInvitation?.residentId === actor &&
              proposedInvitation?.zoneId === zone.id &&
              proposedInvitation.accompanies === true,
            timing: result.outcome === "invite-now" ? "now" : "later",
            ownerId: zone.ownerId ?? "",
            evidenceKind: supporting.kind === "narration" ? "action" : "speech",
            quote: supporting.content,
            accessRevision: controlledVenue.access?.revision,
          };
        }
      }
    }
    return { ...reply, roomInterpretation };
  }

  async function generate(
    session: VenueScene,
    message: string,
    mode: "greet" | "chat" | "ask" | "fulfill" | "act" | "leave",
    targetId: string,
    settled: { fulfilled: boolean; wish: string; unresolved?: boolean; reason?: string } | null,
    signal?: AbortSignal,
    trace?: GreetingTrace,
    actionOutcome?: string,
  ) {
    try {
      const reply = await generateOnce(session, message, mode, targetId, settled, signal, trace, actionOutcome);
      const integrity = venueReplyIntegrity(message, session.lines, reply.lines);
      if (integrity) throw new VenueReplyFailure(integrity);
      const currentVillage = await readVillageState();
      const controlledVenue = currentVillage.venues.find((venue) => venue.id === session.placeId);
      const controlledZone = controlledVenue && resolveVenueZone(controlledVenue, session.zoneId ?? "");
      if (
        ((session.area === "shared" && controlledVenue && venueResidentIds(controlledVenue).length > 0) ||
          session.area === "private" ||
          controlledZone?.kind === "staff" ||
          controlledZone?.kind === "restricted") &&
        reply.sceneChange
      )
        throw new VenueReplyFailure("residence-consent");
      if (reply.sceneChange) {
        if (controlledVenue?.constructionStatus === "worksite") throw new VenueReplyFailure("construction-worksite");
        if (
          /^(?:i\s+)?(?:will|would|promise|plan|want|intend)\b|\b(?:yesterday|last week|earlier|elsewhere)\b/iu.test(
            message.trim(),
          )
        )
          throw new VenueReplyFailure("unsupported-physical-claim");
      }
      const currentSession = await refreshZoneParticipants(session, true);
      if (
        currentSession.zoneId !==
        (session.zoneId ??
          (controlledVenue
            ? legacyZoneId(controlledVenue, session.area, session.spaceClass, session.privateOwnerId)
            : undefined))
      )
        throw conflict("Room access changed while the reply was being prepared. You returned to the exterior.");
      if (reply.invitationSignal) {
        const invited = currentVillage.venues.find((venue) => venue.id === reply.invitationSignal!.venueId);
        const target = invited && resolveVenueZone(invited, reply.invitationSignal.zoneId ?? "");
        if (
          !invited ||
          !target ||
          zoneClosed(currentVillage, invited, target) ||
          !canInviteToZone(invited, target, reply.invitationSignal.residentId)
        )
          reply.invitationSignal = null;
      }
      return interpretRoomDraft(
        session,
        currentVillage,
        message,
        reply,
        mode !== "leave" && !reply.contactIntent && !reply.movementIntent,
      );
    } catch (cause) {
      if (!(cause instanceof VenueReplyFailure)) throw cause;
      await rejectVenueCompletion();
      villagesLogger().warn("[villages] scene=%s draft rejected: %s; no automatic retry", session.id, cause.kind);
      throw Object.assign(
        badGateway(`The Scene reply failed validation (${cause.kind}). Your draft is preserved; resend when ready.`),
        cause.failure ? { failure: cause.failure } : {},
      );
    }
  }

  type SceneReply = Awaited<ReturnType<typeof generateOnce>> & { roomInterpretation?: InterpretationBatch | null };

  async function generateContactResponse(scene: VenueScene, message: string, targetId: string): Promise<SceneReply> {
    try {
      const reply = await generateOnce(
        scene,
        message,
        "chat",
        targetId,
        null,
        venueOperationSignal() ?? AbortSignal.timeout(90_000),
      );
      const integrity = venueReplyIntegrity(message, scene.lines, reply.lines);
      if (integrity) throw new VenueReplyFailure(integrity);
      return reply;
    } catch (cause) {
      if (!(cause instanceof VenueReplyFailure)) throw cause;
      await rejectVenueCompletion();
      runtimeDebug("contact draft rejection", { sceneId: scene.id, reason: cause.kind });
      throw Object.assign(
        badGateway("The contact reply could not be kept accurate. Your draft is preserved; retry."),
        cause.failure ? { failure: cause.failure } : {},
      );
    }
  }
  return { prepareVenueTurnMessages, interpretRoomDraft, generate, generateContactResponse, explicitSceneActions };
}
export type SceneWriting = ReturnType<typeof createSceneWriting>;
export type SceneReply = Awaited<ReturnType<SceneWriting["generateContactResponse"]>>;
