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
import { inspectedLoreUse, LORE_REFERENCE_RULE, villageLoreContext } from "../../domain/rules/lore-context.js";
import { venueAdditionalWritingGuidance, venueWritingDirection } from "../../domain/rules/narration-style.js";
import { SCENE_DEVELOPMENT_SCHEMA, SCENE_DEVELOPMENT_WRITING } from "../../domain/rules/narrative-prompts.js";
import {
  fenceIntroductionWitnesses,
  NPC_INTRODUCTION_WRITING,
  prepareNpcIntroductions,
  type NpcAdmission,
} from "../../domain/rules/npc-participation.js";
import { openingSceneDirection } from "../../domain/rules/opening-project.js";
import { findLocation, findNpc, npcProfile } from "../../domain/rules/places.js";
import { capturedPlayerSpeechMatches, playerSpeechCapture } from "../../domain/rules/player-speech-capture.js";
import { accessIssuerWitnessed } from "../../domain/rules/access-speech.js";
import {
  bindProjectSpeech,
  projectSpeechContexts,
  relevantProjectSpeechContexts,
  projectSpeechData,
  validateProjectSpeech,
} from "../../domain/rules/project-interpretation.js";
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
  omitGmNoopMetadata,
  compactSceneRead,
  sceneGmMemory,
  sceneMemoryHistorySources,
  SCENE_GM_ACCESS,
  SCENE_GM_BOUNDARY,
  SCENE_GM_CONTEXT,
  SCENE_GM_DIRECTION,
  SCENE_GM_EVENTS,
  SCENE_GM_PRESENTATION,
  SCENE_GM_MEMORY,
  SCENE_GM_PHYSICAL,
  SCENE_GM_PROJECTS,
  SCENE_GM_SOCIAL,
  SCENE_GM_WISHES,
  SCENE_GM_WORLD,
  sceneGmLocation,
  sceneGmContext,
} from "../../domain/rules/scene-gm.js";
import { SCENE_TEXT_RESPONSE, parseSceneTextReply } from "../../domain/rules/scene-text-contract.js";
import { GeneratedSceneBoundary, HaltedSceneTurn, readSceneBoundary } from "../../domain/rules/scene-halt.js";
import { sceneMemoryContext } from "../../domain/rules/scene-memories.js";
import { sceneLayoutVenue } from "../../domain/rules/scene-layout.js";
import { MEMORY_ADMINISTRATIVE_RULE } from "../../domain/rules/memory-protection.js";
import { mapScenePeople, scenePersonReferences } from "../../domain/rules/scene-prompt-references.js";
import { provisionalSceneNarrative, type SceneNarrativeSource } from "../../domain/rules/scene-narrative-effects.js";
import { parseVenueReply } from "../../domain/rules/scene-reply.js";
import {
  assertCurrentSceneGeneration,
  normalizeRecoverableSceneReply,
} from "../../domain/rules/scene-writing-contract.js";
import { sceneWritingHistory, sharedLoreHistory } from "../../domain/rules/scene-writing-history.js";
import { semanticContext, semanticEvidence } from "../../domain/rules/semantic-contract.js";
import { semanticPhysicalContext, semanticPlayerMoves } from "../../domain/rules/semantic-timeline.js";
import { immutableSocialWishes, wishHistoryLoaded } from "../../domain/rules/social-wishes.js";
import { spriteExpressionData, sceneSpriteSelection } from "../../domain/rules/sprite-expressions.js";
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
import { canInviteToZone, resolveVenueZone, venueInZone, zoneClosed } from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { zoneEventHearingGroups } from "../../domain/rules/zone-events.js";
import { readPlayerIdentity } from "../../domain/rules/village-projections.js";
import {
  completionFailure as typedCompletionFailure,
  workFailureSummary,
  type WorkFailure,
} from "../../domain/rules/work-failure.js";
import {
  InvalidNarratedSound,
  routeZoneEvents,
  zoneEventReply,
  zoneEventScene,
} from "../../domain/rules/zone-events.js";
export interface SceneWritingPorts {
  readSceneEncounters?: ReturnType<
    typeof import("../../adapters/storage/scene-encounters.js").createSceneEncounters
  >["recall"];
  readCapturedWishContexts: ReturnType<
    typeof import("../../adapters/storage/scene-wish-contexts.js").createSceneWishContexts
  >["read"];
  sceneNarrative?: import("./scene-narrative-service.js").SceneNarrative;
  semantic?: import("../../domain/models/semantic-model.js").SemanticInterpreter;
  venueCheckpoint?: typeof import("../../jobs/venue-coordinator.js").venueCheckpoint;
  venueSavedCheckpoint?: typeof import("../../jobs/venue-coordinator.js").venueSavedCheckpoint;
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
const SCENE_WRITING_VERSION = 13 as const;
function requireCurrentSceneRequest(captured?: { writingVersion?: number }) {
  if (captured && captured.writingVersion !== SCENE_WRITING_VERSION)
    throw conflict(
      "This captured Scene request uses a retired AI contract. Its saved response is preserved; start a new Scene.",
    );
}
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
  readSceneEncounters,
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

    const writingVersion = SCENE_WRITING_VERSION;
    const requestKey = writingRequestKey(session, message, mode);
    const captured = venueSavedCheckpoint?.<{
      fitted: ReturnType<typeof fitVenueWritingMessages>;
      ordinary?: ReturnType<typeof fitVenueWritingMessages>;
      writingVersion?: number;
      loreInspection?: LoreInspection;
      wishContexts: NonNullable<VenueScene["submissions"][number]["wishContexts"]>;
      gmContext?: ReturnType<typeof semanticContext>;
      gmPresentation?: ReturnType<typeof sceneSpriteSelection>;
      historyContract?: { version: 1 | 2; references: Record<string, string>; people?: Record<string, string> };
    }>("writing-request:" + requestKey);
    requireCurrentSceneRequest(captured);
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
    const historyAudience = [...new Set([...audibleIds, ...session.activeIds])];
    // Only these exact witnessed lines and native memory records can support a saved proposal.
    const eligibleEarlierEvidence = session.lines.filter(
      (line) =>
        !line.contactReport &&
        (line.heardBy.some((id) => historyAudience.includes(id)) ||
          line.soundOnly?.characterIds.some((id) => historyAudience.includes(id))),
    );
    const people = captured
      ? captured.historyContract?.people
      : scenePersonReferences([
          ...village.villagers.map((row) => row.characterId),
          ...audibleIds,
          ...eligibleEarlierEvidence.map((line) => line.speakerId),
        ]);
    const encodedPeople = Object.fromEntries(Object.entries(people ?? {}).map(([alias, id]) => [id, alias]));
    const history = sceneWritingHistory(session, eligibleEarlierEvidence, message, historyAudience, people);
    const earlierEvidence = history?.evidence ?? eligibleEarlierEvidence.slice(-18);
    const writingCast = active.toSorted((a, b) => a.characterId.localeCompare(b.characterId));
    const localIds = session.contactGeneration?.localIds ?? audibleIds;
    const identityCast = [
      ...village.villagers
        .filter((row) => localIds.includes(row.characterId))
        .map((row) => ({ characterId: row.characterId, name: row.cardSnapshot.name })),
      ...writingCast.filter(
        (person) =>
          !localIds.includes(person.characterId) ||
          !village.villagers.some((row) => row.characterId === person.characterId),
      ),
    ].toSorted((a, b) => a.characterId.localeCompare(b.characterId));
    const profiles = identityCast.map((person) => {
      const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
      if (!resident) {
        const npc = findNpc(village, person.characterId);
        return npc
          ? npcProfile(npc, encodedPeople[npc.id] ?? npc.id)
          : `${person.name} (${encodedPeople[person.characterId] ?? person.characterId}): no longer available.`;
      }
      const card = readEffectiveVillagerCard(resident);
      return venueCardProfile(card, player.name, false, false, encodedPeople[card.id] ?? card.id);
    });
    const fixedProfiles = profiles.filter(
      (_profile, index) =>
        localIds.includes(identityCast[index]!.characterId) &&
        village.villagers.some((row) => row.characterId === identityCast[index]!.characterId),
    );
    const supportingProfiles = profiles.filter(
      (_profile, index) =>
        !localIds.includes(identityCast[index]!.characterId) ||
        !village.villagers.some((row) => row.characterId === identityCast[index]!.characterId),
    );
    const audience = active.map((person) => person.characterId);
    const storedPlace = findLocation(village, session.placeId);
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
    const historyBlocks = [...history.blocks];
    // This Engine cannot expose saved output defaults without an explicit connection cap.
    if (!captured && (model.maxOutputTokens == null || model.maxContext == null)) {
      let size = historyBlocks.filter((block) => !block.optional).reduce((sum, block) => sum + block.text.length, 0);
      if (size > 12000)
        throw badGateway(
          "The recent exchanges exceed the safe history allowance. Set explicit connection context and output limits to use its full history. Your input is preserved.",
        );
      for (let index = historyBlocks.length - 1; index >= 0; index--) {
        const block = historyBlocks[index];
        if (!block.optional) continue;
        if (size + block.text.length <= 12000) size += block.text.length;
        else historyBlocks.splice(index, 1);
      }
    }
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
    const blocksFor = (parts: (string | VenueWritingBlock)[]): VenueWritingBlock[] =>
      parts.map((part) => (typeof part === "string" ? { text: part } : part));
    const input = message;
    const maxTokens = Math.min(model.maxOutputTokens ?? VENUE_REPLY_MAX_TOKENS, VENUE_REPLY_MAX_TOKENS);
    const fitStarted = performance.now();
    const authoredInstructions = blocksFor(
      writingCast.map((person) => {
        const resident = village.villagers.find((entry) => entry.characterId === person.characterId);
        const card = resident ? readEffectiveVillagerCard(resident) : null;
        return card?.postHistoryInstructions
          ? `Authored post-history instructions for ${card.name}:\n${card.postHistoryInstructions.replace(/\{\{char\}\}/gi, card.name).replace(/\{\{user\}\}/gi, player.name)}\n${renderResidentAdmission(card.name, card.admission, false)}`
          : "";
      }),
    );
    let blocks: VenueWritingBlock[];
    const gmContext = captured?.gmContext ?? semanticContext(session, authority, message, true, true, village);
    if (!captured)
      gmContext.projects = projectSpeechData(
        village,
        relevantProjectSpeechContexts(
          village,
          audience,
          eligibleEarlierEvidence
            .slice(-12)
            .map((line) => line.content)
            .join("\n"),
          message,
          session.placeId,
        ),
      );
    const gmPresentation = captured?.gmPresentation ?? sceneSpriteSelection(session, village);
    if (gmContext) {
      const supportingCandidates = Object.values(village.worldPlaces.npcs)
        .filter(
          (npc) =>
            !npc.disabled &&
            !audience.includes(npc.id) &&
            npc.associations.some((association) => association.placeId === session.placeId),
        )
        .slice(0, 4)
        .map((npc) => ({
          id: npc.id,
          name: npc.name,
          ...(message.toLocaleLowerCase().includes(npc.name.toLocaleLowerCase())
            ? { description: npcProfile(npc, encodedPeople[npc.id] ?? npc.id) }
            : {}),
        }));
      if (!captured) {
        const memory = sceneMemoryContext(
          authority,
          [
            ...new Set([
              "player",
              ...audibleIds,
              ...supportingCandidates.filter((npc) => npc.description).map((npc) => npc.id),
            ]),
          ],
          message,
          "",
          // Potential NPCs also receive this envelope; absent candidates cannot inherit earlier topic cues.
          sharedLoreHistory(session, earlierEvidence, [
            ...audibleIds,
            ...supportingCandidates.map((npc) => npc.id),
          ]).join("\n"),
          await readSceneEncounters?.(village.seed, session.id, ["player", ...audibleIds], authority.memories),
        );
        gmContext.memory = memory.envelope;
        gmContext._memoryWrite = { ...memory.saved, learningVersion: 1 };
      }
      const positions = storedPlace ? sceneLocationContext(session, storedPlace, audience) : undefined;
      const actorState = sceneGmContext(gmContext).actors.map((actor) => {
        const location = positions?.residents.find((row) => row.characterId === actor.id);
        const person = active.find((row) => row.characterId === actor.id);
        const sprite = gmPresentation.sprites[actor.id];
        return {
          ...actor,
          doing:
            session.sceneAttendance?.occupants.find((row) => row.characterId === actor.id)?.doing ||
            person?.doing ||
            undefined,
          homes: village.venues
            .filter((venue) => venueResidentIds(venue).includes(actor.id))
            .map((venue) => ({ id: venue.id, name: venue.name })),
          ...(location ? { location: location.location, zoneId: location.zone?.id } : {}),
          presentation: sprite ? gmPresentation.state[actor.id] : undefined,
          expressions: sprite ? spriteExpressionData(sprite, gmPresentation.variants) : undefined,
        };
      });
      const contextFor = () => ({
        ...sceneGmContext({ ...gmContext, history: [], memory: { ...gmContext.memory, memories: [] } }),
        actors: actorState,
      });
      const presentationOnly = [
        ...new Set([...Object.keys(gmPresentation.state), ...Object.keys(gmPresentation.sprites)]),
      ]
        .filter((id) => !actorState.some((actor) => actor.id === id))
        .toSorted()
        .map((actorId) => ({
          actorId,
          state: gmPresentation.state[actorId],
          expressions: gmPresentation.sprites[actorId]
            ? spriteExpressionData(gmPresentation.sprites[actorId], gmPresentation.variants)
            : undefined,
        }));
      const { worldFacts, ...liveContext } = contextFor();
      // Rebuild live facts after history so physical changes cannot invalidate its cached prefix.
      const circumstances = {
        context: {
          ...liveContext,
          accessScopes: gmContext.accessScopes.toSorted((a, b) => a.id.localeCompare(b.id)),
          hearing: storedPlace
            ? zoneEventHearingGroups(session, sceneLayoutVenue(storedPlace, session)).map((group) =>
                Object.fromEntries(
                  Object.entries(group).filter(
                    ([key, value]) =>
                      !(key === "onstage" && value === true) &&
                      !(
                        ["localReach", "wordsReach", "raisedWordsReach"].includes(key) &&
                        JSON.stringify(value) === JSON.stringify(group.sources)
                      ),
                  ),
                ),
              )
            : [],
        },
        ...(presentationOnly.length ? { presentationOnly } : {}),
        pendingProjectQuestions: session.pendingProjectQuestions,
        pendingRoomQuestions: session.pendingRoomQuestions,
        turn: {
          mode,
          direction: [
            mode === "greet"
              ? "Opening: the player's presence is established, never voluntary speech or actions. Use INPUT []."
              : mode === "leave"
                ? "Conclude the entire authored input naturally; do not invent a player goodbye. Empty input uses INPUT []."
                : "",
            session.contactGeneration?.instruction ?? "",
            openingSceneDirection(village, session),
          ]
            .filter(Boolean)
            .join("\n"),
        },
        supportingCandidates,
        residentRequestLocalIds: residentLocalIdsAt(session, [], 0),
        weather: moment.weather,
        historyAudiences: Object.fromEntries(
          Object.entries(history.audiences).map(([id, ids]) => [
            id,
            ids.map((person) => encodedPeople[person] ?? person),
          ]),
        ),
      };
      blocks = buildVenueSceneBlocks({
        direction: blocksFor([
          SCENE_GM_DIRECTION,
          SCENE_GM_CONTEXT +
            " Only context.actors and admitted npcIntroductions may speak; max4 non-player speakers total per reply. Other identities are context, not additional writer slots.",
          LORE_REFERENCE_RULE,
          venueWritingDirection(village.narrationStyle, player.name),
          venueAdditionalWritingGuidance(village.narrationStyle),
          SCENE_GM_WORLD,
        ]),
        identity: blocksFor(fixedProfiles),
        dynamicIdentity: blocksFor(supportingProfiles),
        stableContext: [
          {
            text: JSON.stringify({
              player: {
                name: player.name,
                description: player.description,
                background: village.playerBackground || "",
              },
              setting: village.setting,
              worldName: village.worldName,
              worldRules: village.worldRules,
              timeRule: gmContext.time?.rule,
              memoryRule: MEMORY_ADMINISTRATIVE_RULE.replace(" and this fingerprint", ""),
            }),
          },
        ],
        sceneContext: [
          {
            text: JSON.stringify(
              compactSceneRead(
                mapScenePeople(
                  {
                    scene: { ...sceneGmLocation(gmContext, session.placeName), worldFacts },
                  },
                  encodedPeople,
                ),
              ),
            ),
          },
        ],
        conversation: blocksFor([
          ...historyBlocks,
          ...lore.map((text, index) => ({
            text: "Relevant world lore: " + text,
            optional: "lore" as const,
            lore: loreUses[index],
          })),
        ]),
        circumstances: [
          {
            text: JSON.stringify(compactSceneRead(mapScenePeople(circumstances, encodedPeople))),
          },
          ...gmContext.memory.memories.map((memory) => {
            const sources = sceneMemoryHistorySources(
              memory,
              session.id,
              historyBlocks,
              gmContext._memoryWrite.recall.targetIds,
              history.renderedRows,
            );
            return {
              text: "Recalled Memory: " + JSON.stringify(mapScenePeople(sceneGmMemory(memory), encodedPeople)),
              ...(sources.length ? { withHistory: { source: sources, text: "" } } : {}),
            };
          }),
          ...history.recall,
          ...(gmContext.memory.encounters?.length
            ? [
                {
                  text:
                    "Past encounters (quoted speech, only the listed hearers know it; no inferred friendship or name knowledge): " +
                    JSON.stringify(mapScenePeople(gmContext.memory.encounters, encodedPeople)),
                },
              ]
            : []),
        ],
        authoredInstructions: [
          ...authoredInstructions,
          ...(gmContext.projects.length
            ? [
                {
                  text:
                    SCENE_GM_PROJECTS +
                    " Project zone tuples are [id,name,purpose,kind,venueClass,ownerId,controllerIds,connectedTo,description,roomSpecification,preserveDescription?]. True preserveDescription retains existing prose; index-only Projects supply no approval terms.",
                },
              ]
            : []),
        ],
        metadata: blocksFor([
          SCENE_TEXT_RESPONSE + " Use short people aliases for person references whenever supplied.",
          SCENE_GM_BOUNDARY,
          SCENE_GM_EVENTS +
            ' For an actual player knock return contactAttempt:{kind:"knock",inputSpan:zero-based input span index,segment:its generated sound narration index,zoneId:directly connected destination}. Cite the exact attempted action, never a thought, example or unrelated action. Offstage people respond only to actual current transmitted player speech/knock, a targeted onstage shout, or an existing doorway contact; a cross-Zone reply must be audible. Whispers use same-Zone localReach only, excluding self.',
          NPC_INTRODUCTION_WRITING,
          SCENE_GM_ACCESS,
          SCENE_GM_SOCIAL,
          SCENE_GM_WISHES,
          SCENE_GM_MEMORY +
            " Put identical evidence in shared support once; use per-learner support only for exceptions.",
          "Project approval requires supplied current terms and explicit witnessed agreement. Speech never starts or completes work. Omit projectSpeech when no current terms are supplied.",
          SCENE_GM_PHYSICAL,
          'Physical action needs happened:true and its exact narration segment. Omit action when nothing changes. Memory screening uses the captured administrative rules; code binds the context fingerprint. Newly introduced narrative circumstances use narrativeIntroduction:{status:"introduced",segment,quote,development}; only an admitted grant permits it. Omit it when quiet.',
        ]),
        replyReminder: [
          ...(Object.keys(gmPresentation.sprites).length ? [{ text: SCENE_GM_PRESENTATION }] : []),
          {
            text: "FIRST line: INPUT followed by one classification (speech, action, thought, context) or a JSON array of exact source spans for mixed/private input. This required classification comes BEFORE all prose. Every established persistent outcome needs CHANGES: physical edits need action; visit/entry decisions and policy administration need access, including spoken changes. Without effect data it is not saved. Omit CHANGES when nothing changes. Private speech needs a local recipient. Maximum4 non-player speakers. Preserve necessary evidence and consequences.",
          },
        ],
      });
    }
    const ordinary = captured
      ? (captured.ordinary ?? captured.fitted)
      : fitVenueWritingMessages(model, blocks, input, maxTokens);
    if (introduction)
      blocks.push({
        dynamic: true,
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
      writingVersion,
      gmContext,
      gmPresentation,
      historyContract: captured
        ? captured.historyContract
        : { version: 2 as const, references: fitted.references, people },
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
      earlierEvidence: fitted.evidence ?? [],
    };
  }
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
    const requestKey = writingRequestKey(args[0], args[1], args[2]);
    requireCurrentSceneRequest(venueSavedCheckpoint?.<{ writingVersion?: number }>("writing-request:" + requestKey));
    return measurePipeline("Scene interpretation", { sceneId: args[0].id, mode: args[2] }, async () => {
      try {
        return await generateMeasured(...args);
      } catch (error) {
        if (error instanceof GeneratedSceneBoundary)
          await rejectVenueCompletion(undefined, { stages: ["writing-completion:" + requestKey] });
        throw error;
      }
    });
  }
  async function generateMeasured(...args: Parameters<typeof prepareVenueTurnMessages>) {
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
      offer,
    );
    let { fitted, earlierEvidence, loreInspection, wishContexts, audience } = prepared;
    const { writingVersion, maxTokens, model, village, pendingMoves, storedPlace, place, projectContexts } = prepared;
    const requestKey = originalKey;
    let ordinary = prepared.ordinary;
    let gmContext = prepared.gmContext;
    let gmPresentation = prepared.gmPresentation;
    let historyContract = prepared.historyContract;
    {
      const saved = await venueCheckpoint("writing-request:" + originalKey, async () => ({
        fitted,
        ordinary,
        earlierEvidence,
        loreInspection,
        wishContexts,
        gmContext,
        gmPresentation,
        historyContract,
        writingVersion,
      }));
      ({ fitted, earlierEvidence, loreInspection, wishContexts } = saved);
      ordinary = saved.ordinary;
      gmContext = saved.gmContext;
      gmPresentation = saved.gmPresentation;
      historyContract = saved.historyContract;
    }
    const dispatch = narrativeVersion
      ? await venueCheckpoint("narrative-dispatch:" + requestKey, async () => {
          const proof =
            offer &&
            fitted.messages.some((row) => row.content.includes(SCENE_DEVELOPMENT_WRITING)) &&
            (await sceneNarrative!.reserve(session, offer));
          const grant = proof ? offer : null;
          return { grant, proof: proof || null, fitted: grant ? fitted : ordinary };
        })
      : undefined;
    const narrativeGrant = dispatch?.grant;
    if (dispatch) fitted = dispatch.fitted;
    if (historyContract) {
      if (!fitted.evidence || !fitted.references)
        throw conflict("The saved Scene evidence context is unavailable. Your draft is preserved.");
      earlierEvidence = fitted.evidence;
      historyContract = { ...historyContract, references: fitted.references };
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
        const complete = omitGmNoopMetadata(
          parseSceneTextReply(completion.content ?? "", completion.finishReason, [
            ...Object.keys(historyContract?.people ?? {}),
            ...audience,
          ]),
        );
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
        materializedRaw = materializeGmReply(
          normalizeGmEffects(
            historyContract?.people ? asRecord(mapScenePeople(complete, historyContract.people)) : complete,
            gmContext,
            historyContract?.references,
            historyContract?.version === 2,
          ),
          message,
          mode === "greet",
        );
        captureSources = playerSpeechCapture(materializedRaw, message, mode === "greet");
        materializedRaw.heardPlayerBy = [];
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
    const completeRaw = materializedRaw;
    let raw = originalRaw;
    const diagnostics = responseDiagnostics(
      model,
      completion,
      fitted.maxTokens ?? maxTokens,
      raw,
      false,
      sceneMissingFields(raw),
    );
    runtimeDebug("Scene writing contract", {
      sceneId: session.id,
      version: writingVersion,
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
      const isolated = normalizeRecoverableSceneReply(completeRaw);
      raw = isolated.raw;
      effectFailures = isolated.failures;
      diagnostics.missingFields = sceneMissingFields(raw);
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
            { raw, context: gmContext, presentation: gmPresentation, ...(historyContract ? { earlierEvidence } : {}) },
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
        for (const [index, check] of semanticAccess.checks.entries()) {
          const sources = check.evidence.map((source) => witnessed[Number(source.id.slice(6))]!);
          const facts = asRecord(check.facts);
          const issuer = String(facts.actorId);
          const binding = asRecord(facts.playerInputSource);
          const input = Number.isInteger(binding.inputSpan)
            ? semanticResult?.intent?.timeline[Number(binding.inputSpan)]
            : undefined;
          const boundInput =
            (input?.kind === "action" || input?.kind === "speech") &&
            input.kind === binding.kind &&
            input.text === binding.text &&
            input.start === binding.start &&
            input.end === binding.end &&
            (input.kind === "action" || parsed.lines.some((line) => capturedPlayerSpeechMatches(line, input)));
          if (issuer === "player" && semanticAccess.results[index]?.outcome !== "unresolved" && !boundInput)
            throw badGateway("The access event lacks an exact player source. The draft is preserved.");
          if (sources.some((source) => !source || !accessIssuerWitnessed(source, issuer) || !source.playerHeard))
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
        sceneContractVersion: SCENE_WRITING_VERSION,
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
      if (currentSession.zoneId !== session.zoneId)
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
