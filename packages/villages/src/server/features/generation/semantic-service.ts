import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
import type { NarrativeAdmission } from "../../domain/models/narrative-model.js";
import type { VenueReplyLine, VenueScene } from "../../domain/models/scene-model.js";
import type { SemanticExchange, SemanticIntent } from "../../domain/models/semantic-model.js";
import type { VillageVenue } from "../../domain/models/world.js";
import { asRecord } from "../../domain/rules/coerce.js";
import {
  badGateway,
  InvalidGmReply,
  UnsupportedPlayerAgency,
  UnsupportedScenePerception,
  VillagesRequestError,
} from "../../domain/rules/errors.js";
import { findLocation, sceneActorIds } from "../../domain/rules/places.js";
import { normalizeGmEffects } from "../../domain/rules/scene-gm.js";
import { readSceneNarrativeReview } from "../../domain/rules/scene-narrative-effects.js";

import { fenceIntroductionWitnesses } from "../../domain/rules/npc-participation.js";
import { parseRelationshipProposals } from "../../domain/rules/relationship-review.js";
import { assertSceneMovementCapacity, residentMovementUnavailable } from "../../domain/rules/resident-movement.js";
import { sceneContinuityView, sceneWishEffectIds } from "../../domain/rules/scene-continuity.js";
import { sceneEvidencePerception } from "../../domain/rules/scene-evidence-perception.js";
import { readSceneBoundary } from "../../domain/rules/scene-halt.js";
import {
  readSemanticEffects,
  semanticContext,
  semanticEvidence,
  semanticHash,
  semanticImmediate,
  semanticWishChangesCovered,
} from "../../domain/rules/semantic-contract.js";
import { semanticPlayerMoves } from "../../domain/rules/semantic-timeline.js";
import { wishHistoryLoaded } from "../../domain/rules/social-wishes.js";
import { readSceneSpritePresentation, type SpriteSelectionContext } from "../../domain/rules/sprite-expressions.js";
import { applyAccessCommand, managesAccess, readAccessCommand } from "../../domain/rules/venue-access.js";
import { readContactMoves } from "../../domain/rules/venue-contact.js";
import { venueInArea } from "../../domain/rules/venue-model.js";
import { readVenueSceneChange } from "../../domain/rules/venue-scene-state.js";
import { canInviteToZone, resolveVenueZone, venueInZone } from "../../domain/rules/venue-zones.js";
import { routeZoneEvents } from "../../domain/rules/zone-events.js";
import { accessIssuerWitnessed, accessOutcomeActions } from "../../domain/rules/access-speech.js";
import { capturedPlayerSpeechMatches } from "../../domain/rules/player-speech-capture.js";

export interface SemanticPorts {
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  venueCheckpoint: typeof import("../../jobs/venue-coordinator.js").venueCheckpoint;
}

function semanticCheckpointKey(stage: string, identity: Record<string, unknown>): string {
  return `semantic-v2:${stage}:${semanticHash([
    1,
    identity.message,
    identity.evidence,
    ...(Object.hasOwn(identity, "earlierEvidence") ? [identity.earlierEvidence] : []),
    ...(identity.zoneEventSource ? [identity.zoneEventSource] : []),
    ...(Object.hasOwn(identity, "narrativeGrant") ? [identity.narrativeGrant] : []),
  ])}`;
}

export function createSemanticService(ports: SemanticPorts) {
  async function readSceneAuthority(scene: VenueScene) {
    const wishEffects = (state: import("../../domain/models/world.js").VillageState) =>
      sceneWishEffectIds(state, scene);
    const state = await ports.readVillageState({ wishEffects, memories: true });
    const actors = scene.contactGeneration?.actorIds ?? [
      ...scene.activeIds,
      ...(scene.contactGeneration?.remoteIds ?? []),
    ];
    const captured = scene.continuity && scene.continuity.seed === state.seed && scene.villageSeed === state.seed;
    return !captured && state.villagers.some((row) => actors.includes(row.characterId) && !wishHistoryLoaded(row))
      ? ports.readVillageState({ wishes: actors, wishEffects, memories: true })
      : state;
  }
  async function validateReply<Input, Result>(
    input: Input,
    provided: Record<string, unknown>,
    validate: (raw: Record<string, unknown>, hash: string, savedInput: Input) => Result,
  ): Promise<Result> {
    const key = semanticCheckpointKey("exchange", asRecord(input));
    const saved = await ports.venueCheckpoint("gm:" + key + ":input", async () => ({
      input,
      hash: semanticHash(input),
    }));
    try {
      return validate(provided, saved.hash, saved.input);
    } catch (error) {
      if (error instanceof VillagesRequestError && error.statusCode === 409) throw error;
      throw new InvalidGmReply(error);
    }
  }

  function readIntent(
    raw: Record<string, unknown>,
    hash: string,
    savedInput: { message: string; context: ReturnType<typeof semanticContext> },
    state: Awaited<ReturnType<SemanticPorts["readVillageState"]>>,
    scene: VenueScene,
  ): SemanticIntent {
    const message = savedInput.message;

    if (!["resolved", "unresolved"].includes(String(raw.status)) || typeof raw.instructions !== "string")
      throw badGateway("System intent result is incomplete. Explicit retry required.");
    const movement = asRecord(raw.movement);
    const rawTimeline = Array.isArray(raw.timeline) ? raw.timeline.map(asRecord) : [];
    const actionIndex = rawTimeline.findIndex((step) => step.kind === "action");
    const actionZone = rawTimeline
      .slice(0, actionIndex < 0 ? 0 : actionIndex)
      .reverse()
      .find((step) => step.kind === "movement" && typeof step.zoneId === "string")?.zoneId;
    const venue = findLocation(sceneContinuityView(state, scene), scene.placeId);
    const action =
      raw.action === null
        ? null
        : readVenueSceneChange(
            raw.action,
            venue
              ? actionZone || scene.zoneId
                ? venueInZone(venue, String(actionZone || scene.zoneId))
                : venueInArea(venue, scene.area, scene.spaceClass, scene.privateOwnerId)
              : undefined,
            scene.continuity?.capturedAt ?? scene.startedAt,
          );
    if (raw.action !== null && !action) throw badGateway("System prepared action is incomplete.");
    if (
      !Array.isArray(raw.timeline) ||
      raw.timeline.length > 24 ||
      (raw.status === "resolved" && savedInput.message.trim() && !raw.timeline.length)
    )
      throw badGateway("System source timeline is incomplete.");
    let cursor = 0;
    // Spoken spans may exclude surrounding quotes, never words, operators or roleplay syntax.
    const isDelimiterGap = (start: number, end: number) => {
      const gap = message.slice(start, end);
      return (
        /^[\s"'“”‘’]*$/u.test(gap) &&
        !(
          gap &&
          !/\s/u.test(gap) &&
          /[\p{L}\p{N}\p{M}]$/u.test(message.slice(0, start)) &&
          /^[\p{L}\p{N}\p{M}]/u.test(message.slice(end))
        )
      );
    };
    const timeline = raw.timeline.map((value) => {
      const row = asRecord(value);
      const text = typeof row.text === "string" ? row.text : "";
      const start = text ? savedInput.message.indexOf(text, cursor) : -1;
      if (!text || start < 0) throw badGateway("System source timeline has invalid or reordered spans.");
      if (!["speech", "thought", "action", "movement", "context"].includes(String(row.kind)))
        throw badGateway("System source timeline has an invalid kind.");
      if (
        row.targetId !== undefined &&
        row.targetId !== "player" &&
        !savedInput.context.referenceActors.some((actor) => actor.id === row.targetId)
      )
        throw badGateway("System source timeline has an invalid actor reference.");
      if (row.delivery !== undefined && !["ordinary", "whisper", "shout"].includes(String(row.delivery)))
        throw badGateway("System source timeline has invalid delivery metadata.");
      if (
        (raw.status === "resolved" && row.kind === "movement" && typeof row.zoneId !== "string") ||
        (row.zoneId !== undefined &&
          (row.kind !== "movement"
            ? typeof row.zoneId !== "string" || row.zoneId !== savedInput.context.zoneId || row.zoneId !== scene.zoneId
            : !savedInput.context.zones.some((zone) => zone.id === row.zoneId) &&
              !savedInput.context.accessScopes?.some(
                (zone) => zone.id === row.zoneId && Object.hasOwn(zone, "adjacentZoneIds"),
              )))
      )
        throw badGateway("System source timeline has invalid Zone metadata.");
      cursor = start + text.length;
      return {
        kind: row.kind as SemanticIntent["timeline"][number]["kind"],
        text,
        start,
        end: cursor,
        ...(typeof row.targetId === "string" ? { targetId: row.targetId } : {}),
        ...(row.delivery ? { delivery: row.delivery as "ordinary" | "whisper" | "shout" } : {}),
        // Incidental current-Zone metadata must not become a planned Zone or reveal its state.
        ...(row.kind === "movement" && typeof row.zoneId === "string" ? { zoneId: row.zoneId } : {}),
      };
    });
    if (
      raw.status === "resolved" &&
      (timeline.some((step, index) => !isDelimiterGap(index === 0 ? 0 : timeline[index - 1].end, step.start)) ||
        !isDelimiterGap(cursor, message.length))
    )
      throw badGateway("System source timeline omits player input. The draft is preserved.");
    if (timeline.filter((step) => step.kind === "movement").length > 8)
      throw badGateway("The movement timeline exceeds its supported step limit.");
    semanticPlayerMoves(
      [],
      {
        ...scene,
        semanticIntent: {
          timeline,
          movement: typeof movement.zoneId === "string" ? { zoneId: movement.zoneId, quote: message } : null,
        } as SemanticIntent,
      },
      [],
    );
    return {
      timeline: timeline.map((step) => {
        if (step.kind !== "movement") return step;
        const { zoneId: _zoneId, ...local } = step;
        return { ...local, kind: "action" as const };
      }),
      version: 2,
      sourceHash: hash,
      // Empty greeting input contains no player decision to clarify. Do not alter the raw response.
      status:
        !message.trim() &&
        raw.instructions === "" &&
        raw.action === null &&
        raw.movement === null &&
        rawTimeline.length === 0
          ? "resolved"
          : (raw.status as SemanticIntent["status"]),
      reason: typeof raw.reason === "string" ? raw.reason : "",
      instructions: raw.instructions,
      action,
      movement:
        typeof movement.zoneId === "string" && movement.zoneId !== scene.zoneId && movement.quote === message
          ? { zoneId: movement.zoneId, quote: message }
          : null,
    };
  }

  async function exchange(
    scene: VenueScene,
    message: string,
    lines: VenueReplyLine[],
    gm: {
      raw: Record<string, unknown>;
      context: ReturnType<typeof semanticContext>;
      presentation: SpriteSelectionContext;
      earlierEvidence?: import("../../domain/models/scene-model.js").VenueLine[];
    },
    narrativeGrant?: NarrativeAdmission | null,
    zoneEventSource?: Record<string, unknown>,
  ): Promise<SemanticExchange> {
    if (!gm) throw badGateway("The current GM response context is required. Your draft is preserved.");
    const state = await readSceneAuthority(scene);
    const sceneState = sceneContinuityView(state, scene);
    const evidence = semanticEvidence(lines);
    const context = gm.context;
    const result = await validateReply(
      {
        message,
        _presentation: gm.presentation,
        evidence,
        ...(zoneEventSource ? { zoneEventSource } : {}),
        context,
        ...(gm.earlierEvidence !== undefined ? { earlierEvidence: gm.earlierEvidence } : {}),
        ...(narrativeGrant !== undefined ? { narrativeGrant } : {}),
      },
      normalizeGmEffects(gm.raw, context),
      (raw, hash, savedInput): SemanticExchange => {
        raw = { ...raw, sourceHash: hash };
        const earlierHistory = savedInput.earlierEvidence ?? savedInput.context.history;
        if (savedInput.context.preservation) {
          const finding = readSceneBoundary(
            raw.halt,
            savedInput.context.preservation,
            savedInput.message,
            savedInput.evidence,
          );
          const outcome = finding?.outcome;
          if (outcome)
            return {
              version: 2,
              sourceHash: hash,
              ...(finding?.source === "draft" ? { draftBoundaryViolation: finding } : { turnOutcome: outcome }),
              authority: { physical: false, access: false, projects: false, standing: false },
              effects: {},
              access: null,
            };
        }
        const interpretedIntent = readIntent(asRecord(raw.intent), hash, savedInput, state, scene);
        if (interpretedIntent?.status === "unresolved")
          throw badGateway(interpretedIntent.reason || "The action needs clarification. The draft is preserved.");
        if (residentMovementUnavailable(raw.immediateResidentMoves, interpretedIntent, sceneState, scene))
          return {
            version: 2,
            sourceHash: hash,
            turnOutcome: "occupancy-unavailable",
            intent: interpretedIntent,
            authority: { physical: false, access: false, projects: false, standing: false },
            effects: {},
            access: null,
          };
        if (raw.perceptionViolation != null) {
          const violation = asRecord(raw.perceptionViolation);
          const source = Number.isSafeInteger(violation.segment)
            ? savedInput.evidence[Number(violation.segment)]
            : undefined;
          if (
            !source ||
            source.speakerId === "player" ||
            typeof violation.quote !== "string" ||
            !violation.quote.trim() ||
            !source.content.includes(violation.quote) ||
            raw.consistent !== false
          )
            throw badGateway("System could not match its hearing review to the Scene. The draft is preserved.");
          throw new UnsupportedScenePerception();
        }
        let evidence = savedInput.evidence;
        const immediate = semanticImmediate(raw.events, lines);
        const admissions = immediate ? (scene.pendingNpcAdmissions ?? []) : [];
        if (savedInput.zoneEventSource && immediate) {
          const venue = findLocation(sceneState, scene.placeId);
          if (!venue || !scene.contactGeneration?.zoneEvents)
            throw badGateway("The admitted hearing context is unavailable. The draft is preserved.");
          const projected = { lines: structuredClone(lines), heardPlayerBy: [] as string[] };
          const moves = readContactMoves(
            immediate.contactMoves,
            projected.lines,
            state,
            venue,
            scene,
            savedInput.context.actors.map((actor) => actor.id),
            "redundant",
            true,
          );
          if (moves.length !== (immediate.contactMoves as unknown[]).length)
            throw badGateway("The reply proposed an unsupported resident movement. Your draft is preserved.");
          assertSceneMovementCapacity(scene, moves);
          const playerMoves = semanticPlayerMoves(
            immediate.semanticPlayerMoves,
            { ...scene, semanticIntent: interpretedIntent },
            projected.lines,
          );
          routeZoneEvents(
            savedInput.zoneEventSource,
            scene,
            projected,
            moves.filter((move) => move.path.length > 1),
            playerMoves,
          );
          fenceIntroductionWitnesses(
            projected.lines,
            projected.heardPlayerBy,
            admissions,
            scene.contactGeneration.localIds ?? scene.activeIds,
          );
          evidence = semanticEvidence(projected.lines).map((line, index) => ({
            ...line,
            playerHeard: sceneEvidencePerception(projected.lines[index]).playerPerception === "full",
          }));
        }
        const agency = asRecord(raw.playerAgencyViolation);
        const agencyEvidence =
          typeof agency.segment === "number" && Number.isInteger(agency.segment) ? evidence[agency.segment] : undefined;
        const citedAgency = Boolean(
          agencyEvidence?.playerHeard &&
          agencyEvidence.speakerId !== "player" &&
          typeof agency.quote === "string" &&
          agency.quote.trim() &&
          agencyEvidence.content.includes(agency.quote),
        );
        if (raw.playerAgencyViolation != null && !citedAgency)
          throw badGateway("System could not match its player-agency review to the Scene. The draft is preserved.");
        if (raw.consistent === false && citedAgency) throw new UnsupportedPlayerAgency();
        if (raw.consistent === true && citedAgency)
          throw badGateway("System returned contradictory player-agency review. The draft is preserved.");
        semanticPlayerMoves(asRecord(raw.events).playerMoves, { ...scene, semanticIntent: interpretedIntent }, lines);
        const effects = readSemanticEffects(raw, hash);
        if (effects.relationshipChanges !== undefined) {
          const actors = new Set(savedInput.context.actors.map((actor) => actor.id));
          const earlier = earlierHistory
            .filter((line) => savedInput.earlierEvidence === undefined || line.heardBy.some((id) => actors.has(id)))
            .map((line) => ({
              ...line,
              heardBy:
                savedInput.earlierEvidence === undefined ? line.heardBy : line.heardBy.filter((id) => actors.has(id)),
              speakerId: line.role === "user" ? "player" : line.speakerId,
              playerHeard: sceneEvidencePerception(line).playerPerception === "full",
            }));
          const { rejections } = parseRelationshipProposals(
            effects.relationshipChanges,
            scene.id + ":" + scene.operation?.id,
            [
              ...evidence.map((line) => ({
                ...line,
                role: line.speakerId === "player" ? ("user" as const) : ("assistant" as const),
              })),
              ...earlier,
            ],
            admissions.length
              ? {
                  ...state,
                  worldPlaces: {
                    ...state.worldPlaces,
                    npcs: {
                      ...state.worldPlaces.npcs,
                      ...Object.fromEntries(admissions.map(({ npc }) => [npc.id, npc])),
                    },
                  },
                }
              : state,
            (row) => ({
              ...row,
              lineIds: Array.isArray(row.lineIds)
                ? row.lineIds.map((ref) => {
                    if (typeof ref === "number" && Number.isSafeInteger(ref) && evidence[ref]) return evidence[ref].id;
                    if (typeof ref === "string" && earlier.some((line) => line.id === ref)) return ref;
                    throw new Error("Citation was not supplied in this reply context");
                  })
                : row.lineIds,
            }),
            true,
            sceneState.relationshipContext,
            scene.liveSceneVersion === 1,
          );
          if (rejections.length)
            throw badGateway(
              "System relationship interpretation needs correction: " +
                rejections.map((row) => row.reason).join("; ") +
                " The draft is preserved.",
            );
        }
        if (!semanticWishChangesCovered(effects.wishChanges, savedInput.context.actors)) delete effects.wishChanges;
        if (savedInput.narrativeGrant !== undefined)
          effects.narrativeDevelopment = readSceneNarrativeReview(
            raw.narrativeIntroduction,
            savedInput.narrativeGrant,
            lines,
            raw.action,
          );
        if (
          raw.action !== null &&
          (asRecord(raw.action).happened !== true || !Number.isInteger(asRecord(raw.action).segment))
        )
          throw badGateway("System physical outcome lacks a completed, cited action.");
        Object.assign(effects, immediate);
        effects.placeUpdate = raw.action ?? null;
        effects.memoryContexts = {
          [savedInput.context._memoryWrite.protection.fingerprint]: savedInput.context._memoryWrite,
        };
        effects.earlierLineIds = earlierHistory.map((row) => row.id);
        const access: InterpretationBatch = {
          checks: [],
          results: [],
        };
        if (!Array.isArray(raw.access) || raw.access.length > 16)
          throw badGateway("System access interpretation is incomplete.");
        const accessPreviews = new Map<string, VillageVenue>();
        for (const value of raw.access) {
          const row = asRecord(value);
          if (
            !Array.isArray(row.evidence) ||
            !row.evidence.length ||
            row.evidence.some((id) => !Number.isInteger(id) || !evidence[Number(id)])
          )
            throw badGateway("System access interpretation has invalid citations.");
          const cited = row.evidence.map((id) => evidence[Number(id)]!);
          const venue = findLocation(sceneState, row.venueId);
          if (
            !venue ||
            typeof row.actorId !== "string" ||
            ![
              "invite-now",
              "invite-later",
              "refuse",
              "dismiss",
              "ban-zone",
              "ban-venue",
              "invite-outside-hours",
              "access-management",
              "unresolved",
            ].includes(String(row.outcome))
          )
            throw badGateway("System access interpretation has an unknown target/outcome.");
          if (
            row.visitorId !== "player" ||
            !["visit", "standing"].includes(String(row.duration)) ||
            !Array.isArray(row.conditions) ||
            typeof row.accompanies !== "boolean"
          )
            throw badGateway("System access scope is incomplete.");
          if (row.outcome !== "unresolved" && row.conditions.some((condition) => condition !== "accompanied"))
            throw badGateway("System access condition is unsupported; no permission was granted.");
          if (row.duration === "standing" && ["invite-now", "invite-later"].includes(String(row.outcome)))
            throw badGateway("Standing permission must use the standing grant contract.");
          const zone = typeof row.zoneId === "string" ? resolveVenueZone(venue, row.zoneId) : undefined;
          if (
            (row.outcome === "ban-zone" && (!zone || zone.kind === "exterior")) ||
            (row.outcome === "ban-venue" && row.zoneId !== null)
          )
            throw badGateway("The access ban must identify its exact Zone or whole-Venue scope.");
          const sourceIndexes = interpretedIntent.timeline.flatMap((step, index) =>
            step.kind === "action" || step.kind === "speech" ? [index] : [],
          );
          const inputSpan =
            row.inputSpan === undefined && sourceIndexes.length === 1 ? sourceIndexes[0] : row.inputSpan;
          const source =
            row.actorId === "player" && Number.isInteger(inputSpan)
              ? interpretedIntent.timeline[Number(inputSpan)]
              : undefined;
          const playerInput = source?.kind === "action" || source?.kind === "speech" ? source : undefined;
          if (row.inputSpan !== undefined && !playerInput)
            throw badGateway("The access change cited an invalid player input span.");
          if (row.actorId === "player" && row.outcome !== "unresolved" && !playerInput)
            throw badGateway("The access change needs a current authored player action or statement.");
          if (playerInput?.kind === "speech" && !lines.some((line) => capturedPlayerSpeechMatches(line, playerInput)))
            throw badGateway("The access statement was not captured as current player speech.");
          if (
            row.outcome !== "unresolved" &&
            (row.outcome === "ban-venue" || row.outcome === "ban-zone" || row.outcome === "access-management"
              ? !managesAccess(venue, typeof row.zoneId === "string" ? row.zoneId : null, row.actorId)
              : !zone || !canInviteToZone(venue, zone, row.actorId))
          )
            throw badGateway("System access issuer or scope lacks current authority. The draft is preserved.");
          if (
            cited.some((line) => !accessIssuerWitnessed(line, row.actorId as string)) ||
            !cited.some((line) => line.speakerId === row.actorId || line.kind === "narration")
          )
            throw badGateway("System access evidence was not witnessed by its issuer.");
          const id = `semantic:${hash}:access:${access.checks.length}`;
          const visit =
            venue.access && accessOutcomeActions.get(String(row.outcome)) === "invite"
              ? readAccessCommand({
                  action: "invite",
                  operationId: id,
                  expectedRevision: venue.access.revision,
                  zoneId: row.zoneId,
                  visitorId: "player",
                  duration: "visit",
                  accompanied: row.accompanies || row.conditions.includes("accompanied"),
                  outsideHours: row.outcome === "invite-outside-hours",
                  ...(row.outcome !== "invite-later" && venue.id === scene.placeId ? { sceneId: scene.id } : {}),
                })
              : null;
          let management;
          if (row.command !== undefined) {
            if (row.outcome !== "access-management")
              throw badGateway("An access command requires an exact management event.");
            management = readAccessCommand({
              ...asRecord(row.command),
              operationId: id,
              expectedRevision: venue.access?.revision,
            });
            if (
              management.zoneId !== (row.zoneId ?? null) ||
              ("visitorId" in management && management.visitorId !== row.visitorId) ||
              (management.action === "invite" &&
                (management.duration !== "visit" ||
                  row.duration !== "visit" ||
                  management.accompanied !== (row.accompanies || row.conditions.includes("accompanied")) ||
                  (management.sceneId !== undefined && management.sceneId !== scene.id))) ||
              (management.action !== "invite" && (row.conditions.length || row.accompanies))
            )
              throw badGateway("The access command does not match the interpreted scope and conditions.");
          } else if (row.outcome === "access-management")
            throw badGateway("The access management event is missing its exact command.");
          const action = accessOutcomeActions.get(String(row.outcome));
          const inferred =
            !management && !visit && action && (action === "ban" || venue.id === scene.placeId)
              ? readAccessCommand({
                  operationId: id,
                  expectedRevision: venue.access?.revision,
                  zoneId: row.outcome === "ban-venue" ? null : (row.zoneId ?? null),
                  action,
                  visitorId: "player",
                  ...(action !== "ban" ? { sceneId: scene.id } : {}),
                })
              : undefined;
          const command = management ?? visit ?? inferred;
          if (command) {
            const preview = accessPreviews.get(venue.id) ?? structuredClone(venue);
            try {
              applyAccessCommand(
                preview,
                { ...command, expectedRevision: preview.access!.revision },
                row.actorId,
                savedInput.context.preservation.chosenAt,
                ["player", ...sceneActorIds(sceneState), ...admissions.map(({ npc }) => npc.id)],
                [],
                sceneState.communityVenueId,
              );
            } catch (error) {
              if (error instanceof VillagesRequestError) throw badGateway(error.message);
              throw error;
            }
            accessPreviews.set(venue.id, preview);
          }
          const facts = {
            actorId: row.actorId,
            venueId: venue.id,
            zoneId: command ? command.zoneId : (row.zoneId ?? null),
            accessRevision: venue.access?.revision,
            semanticVersion: 2,
            accompanies: row.accompanies || row.conditions.includes("accompanied"),
            ...(playerInput
              ? {
                  playerInputSource: {
                    inputSpan: Number(inputSpan),
                    kind: playerInput.kind,
                    start: playerInput.start,
                    end: playerInput.end,
                    text: playerInput.text,
                  },
                }
              : {}),
            ...(command ? { accessCommand: command } : {}),
          };
          access.checks.push({
            id,
            domain: "room",
            question: "System interpreted current access event",
            facts,
            evidence: cited,
            outcomes: [{ id: String(row.outcome), statement: "Current evidenced event" }],
          });
          const result = {
            outcome: String(row.outcome),
            source: "gm" as const,
            evidenceIds: cited.map((line) => line.id),
            reason: "Current System-interpreted event",
          };
          access.results.push(result);
        }
        const permissions = asRecord(effects.relationshipChanges).permissions;
        const authority = {
          physical: !!raw.action,
          access: access.results.some((row) => row.outcome !== "unresolved"),
          projects: Array.isArray(effects.projectSpeech) && effects.projectSpeech.length > 0,
          standing: Array.isArray(permissions) && permissions.length > 0,
          social:
            Array.isArray(asRecord(effects.relationshipChanges).changes) &&
            (asRecord(effects.relationshipChanges).changes as unknown[]).some((value: unknown) => {
              const row = asRecord(value),
                after = asRecord(row.liveAfter);
              const before = state.relationshipContext?.edges[JSON.stringify([row.fromId, row.toId])];
              return (
                (Array.isArray(after.records) && after.records.length > 0) ||
                after.connection !== (before?.connection ?? "")
              );
            }),
        };
        return {
          version: 2,
          producer: "gm" as const,
          ...(interpretedIntent ? { intent: interpretedIntent } : {}),
          sourceHash: hash,
          authority,
          effects,
          presentation: readSceneSpritePresentation(
            raw.presentation,
            savedInput._presentation,
            savedInput.evidence.length,
          ),
          access: access.checks.length ? access : null,
        };
      },
    );
    if (result.presentation?.length) {
      const presentation = result.presentation;
      result.presentation = await ports.venueCheckpoint(
        "gm-presentation:" + result.sourceHash + ":" + semanticHash(gm.raw.presentation),
        async () => presentation,
      );
    }
    return result;
  }
  return { exchange };
}
