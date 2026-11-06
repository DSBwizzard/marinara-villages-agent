import { createHash } from "node:crypto";
import type { LoreInspection } from "../../../shared/contracts/lore.js";
import { mergeLoreUse } from "../../../shared/helpers/lore.js";
import { admissionLoreContext } from "../../../shared/helpers/resident-admission.js";
import { readStagingCues } from "../../../shared/helpers/scene-staging.js";
import { recordLoreUse } from "../../adapters/observability/runtime-debug.js";
import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
import { semanticAuthorityDomain } from "../../domain/rules/semantic-continuity.js";
import type { NarrativeAdmission } from "../../domain/models/narrative-model.js";
import type { GreetingTrace, VenueReplyFailureKind, VenueScene } from "../../domain/models/scene-model.js";
import type { VillageState } from "../../domain/models/world.js";
import { asRecord, asString, asTrimmedString } from "../../domain/rules/coerce.js";
import {
  badGateway,
  conflict,
  InvalidGmReply,
  UnsupportedPlayerAgency,
  UnsupportedScenePerception,
  VillagesRequestError,
} from "../../domain/rules/errors.js";
import { extractJsonObject } from "../../domain/rules/json-reply.js";
import { inspectedLoreUse, villageLoreContext } from "../../domain/rules/lore-context.js";
import { venueAdditionalWritingGuidance, venueWritingDirection } from "../../domain/rules/narration-style.js";
import { environmentCircumstances } from "../../domain/rules/narrative-environment.js";
import { SCENE_DEVELOPMENT_SCHEMA, SCENE_DEVELOPMENT_WRITING } from "../../domain/rules/narrative-prompts.js";
import {
  fenceIntroductionWitnesses,
  NPC_INTRODUCTION_WRITING,
  prepareNpcIntroductions,
  type NpcAdmission,
} from "../../domain/rules/npc-participation.js";
import { openingSceneDirection } from "../../domain/rules/opening-project.js";
import { findLocation, findNpc, npcProfile } from "../../domain/rules/places.js";
import { renderPlayerBackgroundContext } from "../../domain/rules/player-background.js";
import { playerSpeechCapture } from "../../domain/rules/player-speech-capture.js";
import {
  bindProjectSpeech,
  projectSpeechContexts,
  validateProjectSpeech,
} from "../../domain/rules/project-interpretation.js";
import { villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { privateRejectedText, rejectedSyntaxError } from "../../domain/rules/rejected-response.js";
import { renderResidentAdmission } from "../../domain/rules/resident-admission.js";
import {
  applyResidentMovementTimeline,
  residentLocalIdsAt,
  UnavailableResidentMovement,
} from "../../domain/rules/resident-movement.js";
import {
  responseDiagnostics,
  sceneMissingFields,
  type ResponseDiagnostics,
} from "../../domain/rules/response-diagnostics.js";
import { sceneContinuityView, sceneLocationContext, sceneWishEffectIds } from "../../domain/rules/scene-continuity.js";
import {
  materializeGmReply,
  normalizeGmEffects,
  SCENE_GM_ACCESS,
  SCENE_GM_BOUNDARY,
  SCENE_GM_DIRECTION,
  SCENE_GM_EVENTS,
  SCENE_GM_PROJECTS,
  SCENE_GM_RESPONSE,
  SCENE_GM_SOCIAL,
  SCENE_GM_WISHES,
  sceneGmContext,
} from "../../domain/rules/scene-gm.js";
import {
  GeneratedSceneBoundary,
  HaltedSceneTurn,
  readSceneBoundary,
  SCENE_OUTCOME_BOUNDARY,
} from "../../domain/rules/scene-halt.js";
import { SCENE_MEMORY_INSTRUCTION, sceneMemoryContext } from "../../domain/rules/scene-memories.js";
import { provisionalSceneNarrative, type SceneNarrativeSource } from "../../domain/rules/scene-narrative-effects.js";
import { parseVenueReply } from "../../domain/rules/scene-reply.js";
import {
  assertCurrentSceneGeneration,
  completeSceneObject,
  normalizeRecoverableSceneReply,
} from "../../domain/rules/scene-writing-contract.js";
import { sceneWritingHistory, sharedLoreHistory } from "../../domain/rules/scene-writing-history.js";
import { semanticContext, semanticEvidence } from "../../domain/rules/semantic-contract.js";
import { semanticPhysicalContext, semanticPlayerMoves } from "../../domain/rules/semantic-timeline.js";
import { immutableSocialWishes, wishHistoryLoaded } from "../../domain/rules/social-wishes.js";
import { describeSpriteExpressions, sceneSpriteSelection } from "../../domain/rules/sprite-expressions.js";
import { contactSpeech, readContactMoves } from "../../domain/rules/venue-contact.js";
import {
  hasVenueClass,
  venueAssignedCount,
  venueCapacity,
  venueInArea,
  venueResidentIds,
} from "../../domain/rules/venue-model.js";
import { readVenueRequestCore } from "../../domain/rules/venue-requests.js";
import { applyVenueSceneChange, readVenueSceneChange } from "../../domain/rules/venue-scene-state.js";
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
  zoneClosed,
} from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { readPlayerIdentity } from "../../domain/rules/village-projections.js";
import {
  completionFailure as typedCompletionFailure,
  workFailureSummary,
  type WorkFailure,
} from "../../domain/rules/work-failure.js";
import { PLACE_UPDATE_INSTRUCTION } from "../../domain/rules/zone-continuity.js";
import {
  InvalidNarratedSound,
  routeZoneEvents,
  zoneEventReply,
  zoneEventScene,
} from "../../domain/rules/zone-events.js";
export interface SceneWritingPorts {
  readCapturedWishContexts: ReturnType<
    typeof import("../../adapters/storage/scene-wish-contexts.js").createSceneWishContexts
  >["read"];
  sceneNarrative?: import("./scene-narrative-service.js").SceneNarrative;
  semantic?: import("../../domain/models/semantic-model.js").SemanticInterpreter;
  venueCheckpoint?: typeof import("../../jobs/venue-coordinator.js").venueCheckpoint;
  venueSavedCheckpoint?: typeof import("../../jobs/venue-coordinator.js").venueSavedCheckpoint;
  venueExplicitRetry?: () => boolean;
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
  rejectVenueCompletion: typeof import("../../jobs/venue-coordinator.js").rejectVenueCompletion;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
}
export const VENUE_REPLY_MAX_TOKENS = 4096;
const VENUE_REPLY_TEMPERATURE = 0.85;
/** Inert Scene prompt fitting, response validation and room interpretation with originating connections. */
export function createSceneWriting({
  readCapturedWishContexts,
  sceneNarrative,
  venueCheckpoint = async (_stage, work) => work(),
  venueSavedCheckpoint,
  refreshZoneParticipants,
  readEffectiveVillagerCard,
  readVillageLore,
  villagesLogger,
  villagesLanguageModels,
  measurePipeline,
  runtimeDebug,
  venueOperationId,
  rejectVenueCompletion,
  completeWithRoom,
  villagesConnectionIdFor,
  readVillageState: readVillageStateWithoutPlaces,
  semantic,
}: SceneWritingPorts) {
  const readVillageState: typeof readVillageStateWithoutPlaces = (options) =>
    readVillageStateWithoutPlaces({ ...options, memories: true });
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
    mode: "greet" | "chat" | "leave",
    targetId: string,
    settled: {
      fulfilled: boolean;
      wish: string;
      unresolved?: boolean;
      reason?: string;
    } | null,
    signal?: AbortSignal,
    trace?: GreetingTrace,
    actionOutcome?: string,
    introduction?: NarrativeAdmission | null,
  ) {
    assertCurrentSceneGeneration(session);

    const writingVersion = 4;
    const requestKey = writingRequestKey(session, message, mode);
    const captured = venueSavedCheckpoint?.<{
      fitted: ReturnType<typeof fitVenueWritingMessages>;
      ordinary?: ReturnType<typeof fitVenueWritingMessages>;
      loreInspection?: LoreInspection;
      wishContexts: NonNullable<VenueScene["submissions"][number]["wishContexts"]>;
      gmContext?: ReturnType<typeof semanticContext>;
      gmPresentation?: ReturnType<typeof sceneSpriteSelection>;
    }>("writing-request:" + requestKey);
    if (captured && !captured.wishContexts)
      throw conflict("The saved Wish writing context is unavailable. Its source is retained.");
    const capturedWishes = captured
      ? Array.isArray(captured.wishContexts)
        ? captured.wishContexts
        : await readCapturedWishContexts(captured.wishContexts, session)
      : undefined;
    const preparationStarted = performance.now();
    const wishEffects = (state: VillageState) => sceneWishEffectIds(state, session);
    const [authority, connectionId] = await Promise.all([
      readVillageState({ wishEffects }),
      villagesConnectionIdFor("narration"),
    ]);
    let village = sceneContinuityView(authority, session);
    if (village.villagers.some((resident) => !wishHistoryLoaded(resident))) {
      if (village !== authority) throw conflict("The captured Wish context is unavailable. Its source is retained.");
      village = sceneContinuityView(await readVillageState({ wishes: true, wishEffects }), session);
    }
    signal?.throwIfAborted();
    trace?.("preparation", performance.now() - preparationStarted);
    const player = readPlayerIdentity(village);
    const moment = deriveVillageMoment({
      foundedAt: village.foundedAt,
      environment: village.narrative,
      seed: village.seed,
      timeZone: village.timeZone || undefined,
      now: session.sceneAttendance ? new Date(session.sceneAttendance.capturedAt) : new Date(session.startedAt),
    });
    const audibleIds =
      session.contactGeneration?.actorIds ??
      (session.contactGeneration
        ? [...session.contactGeneration.localIds, ...session.contactGeneration.remoteIds]
        : session.activeIds);
    const active = session.participants.filter((person) => audibleIds.includes(person.characterId));
    // Only these exact witnessed lines and native memory records can support a saved proposal.
    const eligibleEarlierEvidence = session.lines.filter(
      (line) =>
        !line.contactReport &&
        (line.heardBy.some((id) => audibleIds.includes(id)) ||
          line.soundOnly?.characterIds.some((id) => audibleIds.includes(id))),
    );
    const history = sceneWritingHistory(session, eligibleEarlierEvidence, message, audibleIds);
    const earlierEvidence = history?.evidence ?? eligibleEarlierEvidence.slice(-18);
    const profiles = active.map((person) => {
      const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
      if (!resident) {
        const npc = findNpc(village, person.characterId);
        return npc ? npcProfile(npc) : `${person.name} (${person.characterId}): no longer available.`;
      }
      const card = readEffectiveVillagerCard(resident);
      return venueCardProfile(card, player.name, false, false);
    });
    const audience = active.map((person) => person.characterId);
    const storedPlace = findLocation(village, session.placeId);
    const pendingMoves = village.residences.filter(
      (residence) =>
        residence.status !== "current" && (residence.agreement?.requiredIds ?? []).some((id) => audience.includes(id)),
    );
    const loreStarted = performance.now();
    let loreInspection: LoreInspection | undefined;
    const lorePromise = (
      captured
        ? Promise.resolve([] as string[])
        : readVillageLore(
            village.selectedLorebookIds,
            [
              villageLoreContext(village),
              session.placeName,
              admissionLoreContext(
                village.worldName,
                active.map(
                  (person) => village.villagers.find((entry) => entry.characterId === person.characterId)?.admission,
                ),
              ),
              active.map((person) => person.name).join(", "),
              message,
            ].join("\n"),
            signal,
            village.loreTokenBudget,
            {
              current: message,
              recent: sharedLoreHistory(session, earlierEvidence, audibleIds),
              inspect: (report) => {
                loreInspection = report;
              },
            },
          )
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
    const loreUses = inspectedLoreUse(loreInspection, "GM");
    signal?.throwIfAborted();
    const projectContexts = projectSpeechContexts(
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
    );
    const earlierContext =
      history?.context ??
      "Earlier evidence: " +
        JSON.stringify(
          earlierEvidence.map((line) => ({
            id: line.id,
            speakerId: line.role === "user" ? "player" : line.speakerId,
            kind: line.kind,
            ...(line.soundOnly ? { soundOnly: line.soundOnly } : {}),
            heardBy: line.heardBy,
            text: line.content.slice(0, 500),
          })),
        );
    const blocksFor = (parts: (string | VenueWritingBlock)[]): VenueWritingBlock[] =>
      parts.map((part) =>
        typeof part !== "string"
          ? part
          : {
              text: part,
              optional:
                (part === earlierContext ? "history" : undefined) ??
                (/^(Recent scene history:|Earlier Scene recap:)/u.test(part)
                  ? "history"
                  : /^(Shared village memories:|Only .* knows:)/u.test(part)
                    ? "memory"
                    : part.startsWith("Relevant world lore:")
                      ? "lore"
                      : undefined),
            },
      );
    const input = message;
    const maxTokens = Math.min(model.maxOutputTokens ?? VENUE_REPLY_MAX_TOKENS, VENUE_REPLY_MAX_TOKENS);
    const fitStarted = performance.now();
    const authoredInstructions = blocksFor(
      active.map((person) => {
        const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
        const card = resident ? readEffectiveVillagerCard(resident) : null;
        return card?.postHistoryInstructions
          ? `Authored post-history instructions for ${card.name}:\n${card.postHistoryInstructions.replace(/\{\{char\}\}/gi, card.name).replace(/\{\{user\}\}/gi, player.name)}\n${renderResidentAdmission(card.name, card.admission, false)}`
          : "";
      }),
    );
    let blocks: VenueWritingBlock[];
    const gmContext = captured?.gmContext ?? semanticContext(session, authority, message, true, true, village);
    const gmPresentation = captured?.gmPresentation ?? sceneSpriteSelection(session, village);
    if (gmContext) {
      const supportingCandidates = Object.values(village.worldPlaces.npcs)
        .filter(
          (npc) => !npc.disabled && npc.associations.some((association) => association.placeId === session.placeId),
        )
        .slice(0, 4);
      if (!captured) {
        const memory = sceneMemoryContext(
          authority,
          [...new Set(["player", ...audibleIds, ...supportingCandidates.map((npc) => npc.id)])],
          message,
        );
        gmContext.memory = memory.envelope;
        gmContext._memoryWrite = memory.saved;
      }
      blocks = buildVenueSceneBlocks({
        direction: blocksFor([
          SCENE_GM_DIRECTION,
          venueWritingDirection(village.narrationStyle, player.name),
          venueAdditionalWritingGuidance(village.narrationStyle),
          mode === "greet"
            ? "Opening: the player's presence is established, never their voluntary speech or actions. input:[]."
            : "",
          mode === "leave"
            ? "Conclude: interpret the ENTIRE authored input, then close naturally; do not invent a player goodbye. Empty input means input:[]."
            : "",
          openingSceneDirection(village, session),
        ]),
        identity: blocksFor(profiles),
        conversation: blocksFor([
          earlierContext,
          ...lore.map((text, index) => ({
            text: "Relevant world lore: " + text,
            optional: "lore" as const,
            lore: loreUses[index],
          })),
        ]),
        circumstances: [
          {
            text: JSON.stringify({
              context: sceneGmContext(gmContext),
              player: {
                name: player.name,
                description: player.description,
                background: renderPlayerBackgroundContext(village),
              },
              residentActivity: active.map((person) => ({
                characterId: person.characterId,
                doing:
                  session.sceneAttendance?.occupants.find((row) => row.characterId === person.characterId)?.doing ||
                  person.doing,
                homes: village.venues
                  .filter((venue) => venueResidentIds(venue).includes(person.characterId))
                  .map((venue) => ({ id: venue.id, name: venue.name })),
              })),
              supportingCandidates,
              pendingProjectQuestions: session.pendingProjectQuestions,
              pendingRoomQuestions: session.pendingRoomQuestions,
              pendingMoves,
              residentRequestLocalIds: residentLocalIdsAt(session, [], 0),
              setting: villageCurrentSetting(village),
              weather: moment.weather,
              positions: storedPlace ? sceneLocationContext(session, storedPlace, audience) : undefined,
              environment: village.narrative
                ? environmentCircumstances(village.narrative, session.placeId, session.zoneId ?? "exterior")
                : undefined,
              presentation: {
                state: gmPresentation.state,
                sprites: Object.entries(gmPresentation.sprites).map(([actorId, sprite]) => ({
                  actorId,
                  expressions: describeSpriteExpressions(sprite, gmPresentation.variants),
                })),
              },
            }),
          },
        ],
        authoredInstructions,
        metadata: blocksFor([
          SCENE_GM_RESPONSE,
          SCENE_GM_BOUNDARY,
          SCENE_GM_EVENTS,
          NPC_INTRODUCTION_WRITING,
          SCENE_GM_ACCESS,
          SCENE_GM_SOCIAL,
          SCENE_GM_WISHES,
          SCENE_MEMORY_INSTRUCTION,
          projectContexts.length ? SCENE_GM_PROJECTS : "",
          PLACE_UPDATE_INSTRUCTION.replace("placeUpdate:", "action:"),
          'Physical action needs happened:true and its exact narration segment. Omit action when nothing changes. Memory screening uses the captured administrative rules; code binds the context fingerprint. Newly introduced narrative circumstances use narrativeIntroduction:{status:"introduced",segment,quote,development}; only an admitted grant permits it. Omit it when quiet. Optional presentation:[{segment,staging:[{characterId,expression?,look?:{target:"player"}|{target:"villager",characterId}|{target:"direction",direction:"left|right"}}]}] selects only supplied expression IDs; omit uncertain cues. Cues never establish actions, hearing, consent or positions.',
        ]),
      });
      const contractAt = blocks.findIndex((block) => block.text === "## Response format and evidence metadata");
      const contract = blocks.splice(contractAt).slice(1);
      const identityAt = blocks.findIndex((block) => block.text === "## Complete authored character identity");
      blocks.splice(identityAt < 0 ? blocks.length : identityAt, 0, ...contract);
      blocks.push({
        text: 'Return one complete JSON object with BOTH required keys: {"input":[...],"segments":[...],...optional effects}. Always classify the entire exact original input, even when returning effects or a halt. Empty input means input:[]. Every current explicit access choice and Project approval, builder commitment or withdrawal needs its matching cited effect; include each separately.',
      });
    }
    const ordinary = captured
      ? (captured.ordinary ?? captured.fitted)
      : fitVenueWritingMessages(model, blocks, input, maxTokens);
    if (introduction)
      blocks.push({
        text:
          SCENE_DEVELOPMENT_WRITING +
          ' Return narrativeIntroduction:{status:"introduced",segment,quote,development} in this same response for an introduced circumstance, citing its exact narration segment and quote. Omit it when quiet. ' +
          SCENE_DEVELOPMENT_SCHEMA +
          " Immutable local admission: " +
          JSON.stringify(introduction),
      });
    let fitted = captured?.fitted ?? ordinary;
    if (!captured && introduction) {
      try {
        fitted = fitVenueWritingMessages(model, blocks, input, maxTokens);
      } catch {
        /* An optional introduction that does not fit cannot block the ordinary turn. */
      }
    }
    if (captured) loreInspection = captured.loreInspection;
    else if (loreInspection) {
      let index = 0;
      const remaining = [...fitted.loreEntries];
      loreInspection = {
        ...loreInspection,
        purpose: "Scene Narration",
        stage: "prompt",
        entries: loreInspection.entries.map((entry) => {
          if (entry.status !== "included") return entry;
          const at = remaining.indexOf(`Relevant world lore: ${lore[index++]}`);
          if (at >= 0) remaining.splice(at, 1);
          return { ...entry, status: at >= 0 ? "included" : "context-limit" };
        }),
      };
    }
    trace?.("context fit", performance.now() - fitStarted);
    runtimeDebug("memory retrieval", {
      sceneId: session.id,
      selectedMemoryIds: gmContext._memoryWrite.recall.candidates.map((memory) => memory.id),
      memoryBudget: 1796,
      participantIds: audibleIds,
      allocation: "full-collection BM25 with participant balance",
    });
    return {
      fitted,
      ordinary,
      loreInspection,
      sparse: session.contactGeneration?.zoneEvents === true,
      writingVersion,
      gmContext,
      gmPresentation,
      maxTokens,
      model,
      village: authority,
      wishContexts: (capturedWishes
        ? capturedWishes.map((owner) => ({ ...owner, wishes: immutableSocialWishes(owner.wishes) }))
        : active.flatMap((person) => {
            const owner = village.villagers.find((row) => row.characterId === person.characterId);
            if (!owner) return [];
            return [
              {
                actorId: owner.characterId,
                wishId: "",
                fingerprint: "",
                wishes: immutableSocialWishes(owner.wishes),
                capturedAt: owner.cardSnapshot.capturedAt,
              },
            ];
          })) as import("../../domain/models/wish-check-model.js").CapturedWishContexts,
      audience,
      active,
      pendingMoves: authority.residences.filter(
        (row) => row.status !== "current" && (row.agreement?.requiredIds ?? []).some((id) => audience.includes(id)),
      ),
      storedPlace: findLocation(village, session.placeId),
      place: (() => {
        const current = findLocation(village, session.placeId);
        return current
          ? session.zoneId
            ? venueInZone(current, session.zoneId)
            : venueInArea(current, session.area, session.spaceClass, session.privateOwnerId)
          : undefined;
      })(),
      projectContexts,
      earlierEvidence: fitted.messages.some((message) => message.content.includes(earlierContext))
        ? earlierEvidence
        : [],
    };
  }
  type BoundaryReplacement = {
    requestKey: string;
    outcome: import("../../../shared/contracts/scene-turn-outcome.js").SceneTurnOutcome;
  };
  function writingRequestKey(
    session: VenueScene,
    message: string,
    mode: Parameters<typeof prepareVenueTurnMessages>[2],
  ) {
    return createHash("sha256")
      .update(JSON.stringify([session.id, mode, message]))
      .digest("hex");
  }
  async function generateOnce(...args: Parameters<typeof prepareVenueTurnMessages>) {
    return measurePipeline("Scene interpretation", { sceneId: args[0].id, mode: args[2] }, async () => {
      const requestKey = writingRequestKey(args[0], args[1], args[2]);
      const replacementKey = "scene-boundary-replacement";
      const saved = venueSavedCheckpoint?.<BoundaryReplacement>(replacementKey);
      const replace = async (replacement: BoundaryReplacement) => {
        if (replacement.requestKey !== requestKey) throw new GeneratedSceneBoundary(replacement.outcome);
        await sceneNarrative?.retire(
          args[0],
          venueSavedCheckpoint?.<{
            grant: NarrativeAdmission | null;
          }>("narrative-dispatch:" + requestKey)?.grant,
        );
        await rejectVenueCompletion(undefined, { stages: ["writing-completion:" + requestKey] });
        try {
          return await generateMeasured(replacement, ...args);
        } catch (error) {
          if (error instanceof GeneratedSceneBoundary)
            await rejectVenueCompletion(undefined, { stages: ["writing-completion:" + requestKey + "-boundary"] });
          throw error;
        }
      };
      if (saved) return replace(saved);
      try {
        return await generateMeasured(undefined, ...args);
      } catch (error) {
        if (!(error instanceof GeneratedSceneBoundary)) throw error;
        const replacement = await venueCheckpoint(replacementKey, async () => ({ requestKey, outcome: error.outcome }));
        return replace(replacement);
      }
    });
  }
  async function generateMeasured(
    replacement: BoundaryReplacement | undefined,
    ...args: Parameters<typeof prepareVenueTurnMessages>
  ) {
    let [session] = args;

    const [, message, mode] = args;
    const signal = args[5];
    const trace = args[6];
    const originalKey = writingRequestKey(session, message, mode);
    const narrativeVersion = session.semanticVersion === 2 && !!sceneNarrative;
    const offer = narrativeVersion
      ? await venueCheckpoint("narrative-offer:" + originalKey, () =>
          sceneNarrative!.offer(session, "scene:" + session.id + ":" + venueOperationId()),
        )
      : undefined;
    const prepared = await prepareVenueTurnMessages(
      args[0],
      args[1],
      args[2],
      args[3],
      args[4],
      args[5],
      args[6],
      args[7],
      replacement ? null : offer,
    );
    let { fitted, earlierEvidence, loreInspection, wishContexts, audience } = prepared;
    const { sparse, writingVersion, maxTokens, model, village, pendingMoves, storedPlace, place, projectContexts } =
      prepared;
    const requestKey = originalKey + (replacement ? "-boundary" : "");
    let ordinary = prepared.ordinary;
    let gmContext = prepared.gmContext;
    let gmPresentation = prepared.gmPresentation;
    {
      const saved = await venueCheckpoint("writing-request:" + originalKey, async () => ({
        fitted,
        ordinary,
        earlierEvidence,
        loreInspection,
        wishContexts,
        gmContext,
        gmPresentation,
      }));
      ({ fitted, earlierEvidence, loreInspection, wishContexts } = saved);
      ordinary = saved.ordinary;
      gmContext = saved.gmContext;
      gmPresentation = saved.gmPresentation;
    }
    const dispatch = narrativeVersion
      ? await venueCheckpoint("narrative-dispatch:" + requestKey, async () => {
          const proof =
            !replacement &&
            offer &&
            fitted.messages.some((row) => row.content.includes(SCENE_DEVELOPMENT_WRITING)) &&
            (await sceneNarrative!.reserve(session, offer));
          const grant = proof ? offer : null;
          return { grant, proof: proof || null, fitted: grant ? fitted : ordinary };
        })
      : undefined;
    const narrativeGrant = dispatch?.grant;
    if (dispatch) fitted = dispatch.fitted;
    if (replacement) {
      const corrected = await venueCheckpoint("writing-request:" + requestKey, async () => {
        const messages = [
          ...fitted.messages,
          {
            role: "system" as const,
            content:
              "Replace the unaccepted reply. Its unsupported consequence was " +
              replacement.outcome +
              ". Preserve the original player input and authoritative Scene facts. " +
              SCENE_OUTCOME_BOUNDARY,
          },
        ];
        const correction = model.fitContext(messages, { maxTokens: fitted.maxTokens ?? maxTokens });
        if (correction.trimmed || JSON.stringify(correction.messages) !== JSON.stringify(messages))
          throw badGateway("The replacement context does not fit. Your input is saved.");
        return correction;
      });
      fitted = { ...corrected, loreEntries: fitted.loreEntries, lore: fitted.lore };
    }
    if (loreInspection) runtimeDebug("lore inspection", loreInspection);
    {
      if (!semantic) throw conflict("System interpretation is not configured.");
      signal?.throwIfAborted();
    }
    await recordLoreUse(fitted.lore, `Scene · ${session.placeName || "Exchange"}`);
    trace?.("model request", 0, `${model.model} (${model.connectionId})`);
    let attempts = 0;
    const requestCompletion = () =>
      completeWithRoom(model, fitted.messages, fitted.maxTokens ?? maxTokens, {
        responseFormat: { type: "json_object" },
        temperature: VENUE_REPLY_TEMPERATURE,
        usagePurpose: "conversation",
        reasoningEffort: null,
        verbosity: null,
        debugMode: false,
        signal,
        onAttempt: trace
          ? (result, elapsedMs, limit) =>
              trace(
                `model attempt ${++attempts}`,
                elapsedMs,
                `finish=${result.finishReason ?? "unknown"} limit=${limit} usage=${JSON.stringify(result.usage ?? {})}`,
              )
          : undefined,
      });
    const completion = await venueCheckpoint("writing-completion:" + requestKey, requestCompletion);
    let captureSources: ReturnType<typeof playerSpeechCapture> | undefined;
    let materializedRaw: Record<string, unknown> | undefined;
    {
      try {
        if (!gmContext) throw conflict("The saved GM context is unavailable. Your draft is preserved.");
        const complete = completeSceneObject(completion.content ?? "", completion.finishReason);
        if (!complete) throw badGateway("The GM response was not valid JSON. Your draft is preserved.");
        if (complete.halt && gmContext.preservation) {
          const halt = asRecord(complete.halt);
          const playerHalt = {
            ...halt,
            ...(halt.source === "draft" ? { reason: "none", quote: "" } : {}),
            appointments: Array.isArray(halt.appointments)
              ? halt.appointments.filter((row) => asRecord(row).source !== "draft")
              : [],
          };
          const finding = readSceneBoundary(playerHalt, gmContext.preservation, message, []);
          if (finding?.source === "player") throw new HaltedSceneTurn(finding.outcome);
        }
        materializedRaw = materializeGmReply(normalizeGmEffects(complete, gmContext), message, mode === "greet");
        captureSources = playerSpeechCapture(materializedRaw, message, mode === "greet");
      } catch (error) {
        if (error instanceof VillagesRequestError && error.statusCode === 502)
          await rejectVenueCompletion(
            { model: model.model, connectionId: model.connectionId, reason: "invalid-gm-response" },
            { stages: ["writing-completion:" + requestKey] },
          );
        throw error;
      }
    }
    const originalRaw = materializedRaw;
    const completeRaw = sparse ? materializedRaw : null;
    let raw = originalRaw;
    const diagnostics = responseDiagnostics(
      model,
      completion,
      fitted.maxTokens ?? maxTokens,
      raw,
      !!originalRaw && !extractJsonObject(completion.content ?? ""),
      sparse && !completeRaw ? ["completeResponse", ...sceneMissingFields(originalRaw)] : sceneMissingFields(raw),
    );
    runtimeDebug("Scene writing contract", {
      sceneId: session.id,
      version: sparse ? writingVersion : 1,
      complete: !!completeRaw,
      originalMissingFields: sceneMissingFields(originalRaw),
      inputCharacters: fitted.messages.reduce((sum, message) => sum + message.content.length, 0),
    });
    let parsed: ReturnType<typeof parseVenueReply>;
    let npcAdmissions: NpcAdmission[] = [];
    let eventRaw = raw;
    let effectFailures: NonNullable<import("../../domain/models/scene-model.js").VenueSubmission["effectFailures"]> =
      {};
    try {
      if (sparse) {
        if (!completeRaw) throw new Error("The sparse Scene response is incomplete or ambiguous.");
        {
          const isolated = normalizeRecoverableSceneReply(completeRaw);
          raw = isolated.raw;
          effectFailures = isolated.failures;
        }
        diagnostics.missingFields = sceneMissingFields(raw);
      }
      if (raw) {
        raw.npcIntroductions ??= originalRaw?.npcIntroductions;
        const introductions = prepareNpcIntroductions(raw, village, session, requestKey);
        session = introductions.scene;
        npcAdmissions = introductions.admissions;
        audience = [...audience, ...npcAdmissions.map((admission) => admission.npc.id)];
      }
      eventRaw = session.contactGeneration?.zoneEvents ? zoneEventReply(raw, message) : raw;
      parsed = parseVenueReply(eventRaw, session.contactGeneration?.zoneEvents ? [...audience, "player"] : audience);
      fenceIntroductionWitnesses(
        parsed.lines,
        parsed.heardPlayerBy,
        npcAdmissions,
        session.contactGeneration?.localIds ?? session.activeIds,
        false,
      );
      for (const [index, spans] of captureSources ?? []) parsed.lines[index].speechSource = { version: 3, spans };
    } catch (cause) {
      await rejectVenueCompletion({
        model: model.model,
        connectionId: model.connectionId,
        reason: raw ? "invalid-segments" : "invalid-json",
      });
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
        detail: privateRejectedText(
          raw
            ? cause instanceof Error
              ? cause.message
              : String(cause)
            : rejectedSyntaxError(completion.content ?? ""),
        ).slice(0, 2000),
        responseDiagnostics: diagnostics,
      });
    }
    if (!raw || !gmContext || !gmPresentation)
      throw conflict("The saved GM response context is unavailable. Your draft is preserved.");
    const semanticResult = semantic
      ? await semantic
          .exchange(
            session,
            message,
            parsed.lines,
            { raw, context: gmContext, presentation: gmPresentation },
            narrativeVersion ? (narrativeGrant ?? null) : undefined,
            session.contactGeneration?.zoneEvents ? (eventRaw ?? undefined) : undefined,
          )
          .catch(async (error: unknown) => {
            if (error instanceof InvalidGmReply)
              await rejectVenueCompletion(
                { model: model.model, connectionId: model.connectionId, reason: "invalid-gm-effects" },
                { stages: ["writing-completion:" + requestKey] },
              );
            if (
              error instanceof UnsupportedPlayerAgency ||
              error instanceof UnsupportedScenePerception ||
              error instanceof InvalidNarratedSound
            )
              await rejectVenueCompletion(
                {
                  model: model.model,
                  connectionId: model.connectionId,
                  reason:
                    error instanceof UnsupportedPlayerAgency
                      ? "unsupported-player-agency"
                      : error instanceof InvalidNarratedSound
                        ? "invalid-narrated-sound"
                        : "unsupported-scene-perception",
                },
                {
                  ...(error instanceof InvalidNarratedSound ? { preserveWriting: true } : {}),
                  stages: ["writing-completion:" + requestKey],
                },
              );
            throw error;
          })
      : null;
    if (semanticResult?.draftBoundaryViolation)
      throw new GeneratedSceneBoundary(semanticResult.draftBoundaryViolation.outcome);
    if (semanticResult?.turnOutcome) {
      await sceneNarrative?.retire(session, narrativeGrant);
      if (semanticResult.turnOutcome === "occupancy-unavailable") throw new UnavailableResidentMovement();
      throw new HaltedSceneTurn(semanticResult.turnOutcome);
    }
    if (semanticResult?.intent) session = { ...session, semanticIntent: semanticResult.intent };
    for (const row of semanticResult?.presentation ?? []) {
      if (parsed.lines[row.segment]) parsed.lines[row.segment].staging = row.staging;
    }
    const semanticAccess = semanticResult?.access;
    if (semanticResult) {
      // Ignore all narrator effect nominations, including omitted System sections.
      for (const key of [
        "developmentChanges",
        "memoryChanges",
        "relationshipChanges",
        "wishChanges",
        "projectSpeech",
        "roomEvents",
        "invitation",
        "residenceRequest",
        "residenceDecision",
        "venueRequest",
        "departures",
        "sceneEnded",
        "contactEnd",
        "contactMoves",
        "placeUpdate",
        "narrativeIntroduction",
        "narrativeSource",
        "interpretationRouting",
      ])
        delete raw?.[key];
      raw = { ...raw, ...semanticResult.effects };
      for (const [domain, key] of Object.entries({
        memories: "memoryChanges",
        relationships: "relationshipChanges",
        wishes: "wishChanges",
        projects: "projectSpeech",
      }))
        if (semanticResult.effects[key] === undefined && !effectFailures[domain as keyof typeof effectFailures])
          effectFailures[domain as keyof typeof effectFailures] = {
            kind: "metadata",
            message: "System update metadata is missing; retry interpretation.",
          };
    }
    try {
      const validatedMoves =
        storedPlace && (semanticResult || session.contactGeneration || mode === "chat")
          ? readContactMoves(
              raw?.contactMoves,
              parsed.lines,
              village,
              storedPlace,
              session,
              audience,
              "redundant",
              !!semanticResult,
            )
          : [];
      if (Array.isArray(raw?.contactMoves) && raw.contactMoves.length !== validatedMoves.length) {
        if (!semanticResult) await rejectVenueCompletion();
        throw badGateway("The reply proposed an unsupported resident movement. Your draft is preserved.");
      }
      // Validate/count every row first. Local no-ops cannot change positions, witnesses or settlement.
      const contactMoves = validatedMoves.filter((move) => move.path.length > 1);
      if (session.contactGeneration) {
        const context = session.contactGeneration;
        for (const [index, line] of parsed.lines.entries()) {
          const localIds = residentLocalIdsAt(session, contactMoves, index);
          if (!localIds.includes(line.speakerId) && context.remoteIds.includes(line.speakerId)) {
            line.viaDoorway = true;
          }
          // Presentation never places an unseen remote listener in the player's Zone.
          line.staging = readStagingCues(line.staging, localIds);
          if (line.kind === "narration") line.heardBy = [...localIds];
        }
      }
      const playerMoves = semanticResult ? semanticPlayerMoves(raw?.semanticPlayerMoves, session, parsed.lines) : [];
      if (session.contactGeneration?.zoneEvents && eventRaw) {
        try {
          routeZoneEvents(eventRaw, session, parsed, contactMoves, playerMoves);
        } catch (cause) {
          if (cause instanceof InvalidNarratedSound)
            await rejectVenueCompletion(
              { model: model.model, connectionId: model.connectionId, reason: "invalid-narrated-sound" },
              { preserveWriting: true, stages: ["writing-completion:" + requestKey] },
            );
          throw cause;
        }
      }
      if (storedPlace) {
        try {
          applyResidentMovementTimeline(session, storedPlace, parsed.lines, contactMoves);
        } catch (cause) {
          if (!semanticResult) await rejectVenueCompletion();
          throw cause;
        }
      }
      fenceIntroductionWitnesses(
        parsed.lines,
        parsed.heardPlayerBy,
        npcAdmissions,
        session.contactGeneration?.localIds ?? session.activeIds,
      );
      const physicalContext =
        semanticResult && raw?.placeUpdate
          ? semanticPhysicalContext(raw.placeUpdate, parsed.lines, session, message, contactMoves)
          : undefined;
      if (semanticAccess) {
        // The interpreter proposes events; only the mechanically routed timeline owns witnesses.
        const witnessed = semanticEvidence(parsed.lines);
        for (const check of semanticAccess.checks) {
          const sources = check.evidence.map((source) => witnessed[Number(source.id.slice(6))]!);
          const issuer = String(asRecord(check.facts).actorId);
          if (sources.some((source) => !source || !source.heardBy.includes(issuer) || !source.playerHeard))
            throw badGateway("The access event lacks current witnessed evidence. The draft is preserved.");
          check.evidence = sources;
        }
      }
      const readSpeechSignal = (value: unknown) => {
        const entry = asRecord(value);
        const speakerId = asTrimmedString(entry.speakerId);
        const quote = asTrimmedString(entry.quote).replace(/\s+/gu, " ").toLowerCase();
        if (
          !audience.includes(speakerId) ||
          (semanticResult ? !quote.length : quote.length < 8) ||
          !parsed.lines.some(
            (line) => line.speakerId === speakerId && line.content.replace(/\s+/gu, " ").toLowerCase().includes(quote),
          )
        )
          return null;
        return { speakerId, entry };
      };
      const heardSignal = (value: unknown) => {
        const signal = readSpeechSignal(value);
        return !session.contactGeneration?.zoneEvents ||
          !signal ||
          parsed.lines.some(
            (line) =>
              !line.contactHidden &&
              !line.attentionEvidence &&
              line.speakerId === signal.speakerId &&
              line.content.includes(asTrimmedString(signal.entry.quote)),
          )
          ? signal
          : null;
      };
      const request = heardSignal(raw?.residenceRequest);
      const decision = heardSignal(raw?.residenceDecision);
      const venueRequest = heardSignal(raw?.venueRequest);
      const departures = Array.isArray(raw?.departures)
        ? [
            ...new Set(
              raw.departures
                .map(heardSignal)
                .filter(
                  (entry): entry is NonNullable<ReturnType<typeof readSpeechSignal>> =>
                    !!entry &&
                    (!session.contactGeneration || session.contactGeneration.localIds.includes(entry.speakerId)),
                )
                .map((entry) => entry.speakerId),
            ),
          ]
        : [];
      const sceneEnded = false;
      const requestedVenueId = request ? asTrimmedString(request.entry.venueId) : "";
      const pendingDecision = decision
        ? pendingMoves.find(
            (move) =>
              move.characterId === decision.entry.characterId &&
              (move.agreement?.requiredIds ?? []).includes(decision.speakerId),
          )
        : null;
      const narrativeSource: SceneNarrativeSource | undefined = narrativeGrant
        ? {
            grant: narrativeGrant,
            development: semanticResult?.effects.narrativeDevelopment as SceneNarrativeSource["development"],
          }
        : undefined;
      const narrativeAuthority =
        dispatch?.proof && village.narrative
          ? { ...village, narrative: { ...village.narrative, claims: [dispatch.proof] } }
          : village;
      const physicalVillage = narrativeSource
        ? provisionalSceneNarrative(sceneContinuityView(village, session), narrativeAuthority, narrativeSource)
        : village;
      const physicalVenue = findLocation(physicalVillage, session.placeId);
      let placeUpdate: ReturnType<typeof readVenueSceneChange> = null;
      try {
        if ((!session.contactGeneration || session.contactGeneration.zoneEvents) && (semanticResult || mode === "chat"))
          placeUpdate = readVenueSceneChange(
            raw?.placeUpdate,
            physicalContext && physicalVenue ? venueInZone(physicalVenue, physicalContext.zoneId) : place,
            session.continuity?.capturedAt ?? session.startedAt,
          );
        if (placeUpdate)
          applyVenueSceneChange(
            {
              ...physicalVillage,
              venues: structuredClone(physicalVillage.venues),
              worldPlaces: structuredClone(physicalVillage.worldPlaces),
              narrative: structuredClone(physicalVillage.narrative),
            },
            session.placeId,
            placeUpdate,
            session.id,
            session.continuity?.capturedAt ?? session.startedAt,
            session.spaceClass,
            session.area,
            session.privateOwnerId,
            physicalContext?.zoneId,
            physicalContext,
            physicalVillage.narrative?.conditions,
          );
      } catch (cause) {
        if (!semanticResult) await rejectVenueCompletion();
        throw cause;
      }
      if (Array.isArray(raw?.projectSpeech))
        for (const proposal of raw.projectSpeech) {
          const row = asRecord(proposal);
          if (Array.isArray(row.citations))
            row.citations = row.citations.map((value) => {
              const citation = asRecord(value);
              return {
                ...citation,
                quote: Number.isInteger(citation.segment) ? parsed.lines[Number(citation.segment)]?.content : "",
              };
            });
        }
      const projectSpeech = bindProjectSpeech(
        raw?.projectSpeech,
        projectContexts,
        parsed.lines.map((line, index) => ({ ...line, id: String(index) })),
      );
      if (semanticResult)
        for (const proposal of projectSpeech)
          proposal.contextual = { version: 1, source: "gm", checkId: semanticResult.sourceHash };
      if (Array.isArray(raw?.projectSpeech) && projectSpeech.length !== raw.projectSpeech.length)
        effectFailures.projects = {
          kind: "metadata",
          message: "Project metadata cites an unavailable context.",
          proposal: raw.projectSpeech,
        };
      if (semanticResult?.authority.projects) {
        const projectFailure =
          effectFailures.projects?.message ||
          projectSpeech
            .map((proposal) =>
              validateProjectSpeech(
                proposal,
                parsed.lines.map((line, index) => ({ ...line, id: String(index) })),
              ),
            )
            .find(Boolean) ||
          ((raw!.projectSpeech as unknown[]).some((value) => {
            const row = asRecord(value);
            return row.revision !== projectContexts.find((context) => context.projectId === row.projectId)?.revision;
          })
            ? "Project metadata cites a stale revision."
            : "");
        if (projectFailure)
          throw badGateway(
            "System Project commitment metadata did not validate. " + projectFailure + " The draft is preserved.",
          );
      }
      if (
        ["relationships", "projects"].some((domain) =>
          semanticAuthorityDomain({ effectFailures }, domain as "relationships" | "projects"),
        )
      )
        throw badGateway(
          "The GM response contains malformed authority metadata. Explicitly retry; your draft is preserved.",
        );
      return {
        ...parsed,
        lore: mergeLoreUse(fitted.lore, semanticResult?.lore),
        ...(narrativeSource ? { narrativeSource } : {}),
        effectFailures,
        speechCapture: captureSources
          ? { version: 3 as const, status: captureSources.size ? ("captured" as const) : ("silent" as const) }
          : undefined,
        evidenceFingerprints: Object.fromEntries(
          earlierEvidence.map((line) => [
            line.id,
            createHash("sha256")
              .update(JSON.stringify([line.id, line.content, line.heardBy, line.soundOnly]))
              .digest("hex"),
          ]),
        ),
        interpretationRouting: raw?.interpretationRouting as unknown,
        roomEvents: raw?.roomEvents as unknown,
        projectContexts,
        contactIntent: null,
        contactMoves,
        contactRelay: null,
        contactEndIds:
          session.contactGeneration && Array.isArray(raw?.contactEnd)
            ? raw.contactEnd.flatMap((value) => {
                const row = asRecord(value),
                  speakerId = asTrimmedString(row.speakerId),
                  quote = asTrimmedString(row.quote);
                return audience.includes(speakerId) &&
                  contactSpeech(parsed.lines, speakerId, quote) &&
                  (semanticResult ||
                    /\b(?:goodbye|bye|see you|talk (?:to you )?later|need to go|have to go|back to (?:sleep|work))\b/iu.test(
                      quote,
                    )) &&
                  (semanticResult || !/\b(?:don't|do not|not|if|unless)\b/iu.test(quote))
                  ? [speakerId]
                  : [];
              })
            : [],
        projectSpeech,
        placeUpdate,
        semanticPlayerMoves: playerMoves,
        physicalContext,
        residenceSignal:
          (semanticResult || mode === "chat") &&
          requestedVenueId &&
          village.venues.some(
            (venue) =>
              venue.id === requestedVenueId &&
              hasVenueClass(venue, "residence") &&
              venue.constructionStatus !== "worksite" &&
              venueAssignedCount(venue) < venueCapacity(venue),
          )
            ? { kind: "request" as const, characterId: request!.speakerId, venueId: requestedVenueId }
            : (semanticResult || mode === "chat") && pendingDecision && typeof decision!.entry.approved === "boolean"
              ? {
                  kind: "decision" as const,
                  characterId: pendingDecision.characterId,
                  approverId: decision!.speakerId,
                  agreementScope: pendingDecision.agreement?.scope,
                  venueId: pendingDecision.proposedVenueId,
                  approved: decision!.entry.approved === true,
                }
              : null,
        venueRequestSignal:
          (semanticResult || mode === "chat") && venueRequest && readVenueRequestCore(venueRequest.entry)
            ? {
                characterId: venueRequest.speakerId,
                ...readVenueRequestCore(venueRequest.entry)!,
                quote: asTrimmedString(venueRequest.entry.quote),
              }
            : null,
        invitationSignal: null as
          import("../../domain/models/scene-model.js").VenueSubmission["invitationSignal"] | null,
        recap: session.contactGeneration?.zoneEvents ? "" : asString(raw?.recap).slice(0, 600),
        departures,
        sceneEnded,
        responseDiagnostics: diagnostics as ResponseDiagnostics | undefined,
        npcAdmissions,
        placeDiscoveries: Array.isArray(semanticResult?.effects.placeDiscoveries)
          ? (semanticResult.effects.placeDiscoveries as unknown[])
          : [],
        establishmentProgress: Array.isArray(semanticResult?.effects.establishmentProgress)
          ? (semanticResult.effects.establishmentProgress as unknown[])
          : [],
        semanticAccess,
        semanticProvenance: semanticResult
          ? ({
              version: 2 as const,
              ...{ producer: "gm" as const },
              turnPolicyVersion: 1 as const,
              preservationVersion: 1 as const,
              occurrenceVersion: 1 as const,
              sourceHash: semanticResult.sourceHash,
              pipelineVersion: 3 as const,
              hearingTimelineVersion: 1 as const,
              authority: semanticResult.authority,
              interpretedAt: new Date().toISOString(),
            } as import("../../domain/models/semantic-model.js").SemanticProvenance)
          : undefined,
        memoryChanges: raw?.memoryChanges,
        memoryContexts: semanticResult?.effects.memoryContexts as
          Record<string, import("../../domain/rules/scene-memories.js").SceneMemoryContext> | undefined,
        relationshipChanges: raw?.relationshipChanges,
        earlierLineIds: semanticResult
          ? (semanticResult.effects.earlierLineIds as string[])
          : earlierEvidence.map((line) => line.id),
        wishChanges: raw?.wishChanges,
        wishContexts,
      };
    } catch (error) {
      if (error instanceof VillagesRequestError && error.statusCode === 502)
        await rejectVenueCompletion(
          { model: model.model, connectionId: model.connectionId, reason: "invalid-gm-effects" },
          { stages: ["writing-completion:" + requestKey] },
        );
      throw error;
    }
  }
  /** Interpret an accepted scene without writing a partial transcript. */
  function bindRoomInvitation(session: VenueScene, currentVillage: VillageState, reply: SceneReply) {
    currentVillage = sceneContinuityView(currentVillage, session);
    const roomInterpretation = reply.semanticAccess ?? null;
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
          facts = asRecord(check.facts),
          command = asRecord(facts.accessCommand);
        const controlledVenue = findLocation(currentVillage, facts.venueId);
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
          command.action === "invite" &&
          typeof command.operationId === "string" &&
          command.operationId.length > 0 &&
          controlledVenue &&
          zone &&
          supporting &&
          !zoneClosed(currentVillage, controlledVenue, zone) &&
          canInviteToZone(controlledVenue, zone, actor)
        ) {
          reply.invitationSignal = {
            accessOperationId: command.operationId,
            residentId: actor,
            venueId: controlledVenue.id,
            zoneLabel: zone.name,
            zoneId: zone.id,
            accompanies: facts.accompanies === true,
            timing: result.outcome === "invite-now" ? "now" : "later",
            quote: supporting.content,
          };
        }
      }
    }
    return { ...reply, roomInterpretation };
  }
  async function generate(
    session: VenueScene,
    message: string,
    mode: "greet" | "chat" | "leave",
    targetId: string,
    settled: {
      fulfilled: boolean;
      wish: string;
      unresolved?: boolean;
      reason?: string;
    } | null,
    signal?: AbortSignal,
    trace?: GreetingTrace,
    actionOutcome?: string,
  ): Promise<SceneReply> {
    try {
      assertCurrentSceneGeneration(session);
      if (!semantic) throw conflict("System interpretation is not configured.");
      if (mode === "greet" && !session.contactGeneration?.zoneEvents) {
        const state = await readVillageState();
        const venue = findLocation(state, session.placeId);
        if (venue) session = zoneEventScene(session, venue);
      }
      actionOutcome = undefined;
      const reply = await generateOnce(session, message, mode, targetId, settled, signal, trace, actionOutcome);
      const currentVillage = await readVillageState();
      const controlledVenue = findLocation(currentVillage, session.placeId);
      if (reply.placeUpdate) {
        if (controlledVenue?.constructionStatus === "worksite") throw new VenueReplyFailure("construction-worksite");
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
      return bindRoomInvitation(session, currentVillage, reply);
    } catch (cause) {
      if (!(cause instanceof VenueReplyFailure)) throw cause;
      await rejectVenueCompletion();
      villagesLogger().warn("[villages] scene=%s draft rejected: %s; no automatic retry", session.id, cause.kind);
      throw Object.assign(
        badGateway(
          cause.failure
            ? workFailureSummary(cause.failure)
            : `The Scene reply failed validation (${cause.kind}). Your draft is preserved; explicitly retry.`,
        ),
        cause.failure ? { failure: cause.failure } : {},
      );
    }
  }
  type SceneReply = Awaited<ReturnType<typeof generateOnce>> & {
    lore?: import("../../../shared/contracts/lore.js").LoreUse[];
    roomInterpretation?: InterpretationBatch | null;
    narrativeSource?: SceneNarrativeSource;
  };
  return { prepareVenueTurnMessages, generate };
}
export type SceneWriting = ReturnType<typeof createSceneWriting>;
export type SceneReply = Awaited<ReturnType<SceneWriting["generate"]>>;
