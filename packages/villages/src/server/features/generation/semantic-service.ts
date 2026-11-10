import type { InterpretationBatch } from "../../domain/models/interpretation-model.js";
import type { NarrativeAdmission } from "../../domain/models/narrative-model.js";
import type { VenueReplyLine, VenueScene } from "../../domain/models/scene-model.js";
import type { SemanticExchange, SemanticIntent } from "../../domain/models/semantic-model.js";
import { asRecord } from "../../domain/rules/coerce.js";
import {
  badGateway,
  conflict,
  InvalidGmReply,
  UnsupportedPlayerAgency,
  UnsupportedScenePerception,
  VillagesRequestError,
} from "../../domain/rules/errors.js";
import { findLocation } from "../../domain/rules/places.js";
import { readSceneNarrativeReview } from "../../domain/rules/scene-narrative-effects.js";

import { fenceIntroductionWitnesses } from "../../domain/rules/npc-participation.js";
import { parseRelationshipProposals } from "../../domain/rules/relationship-review.js";
import { assertSceneMovementCapacity, residentMovementUnavailable } from "../../domain/rules/resident-movement.js";
import { sceneContinuityView } from "../../domain/rules/scene-continuity.js";
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
import { managesAccess, readAccessCommand } from "../../domain/rules/venue-access.js";
import { readContactMoves } from "../../domain/rules/venue-contact.js";
import { canInviteToZone, resolveVenueZone } from "../../domain/rules/venue-zones.js";
import { routeZoneEvents } from "../../domain/rules/zone-events.js";

export interface SemanticPorts {
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  venueCheckpoint: typeof import("../../jobs/venue-coordinator.js").venueCheckpoint;
}

function semanticCheckpointKey(stage: string, identity: Record<string, unknown>): string {
  return `semantic-v2:${stage}:${semanticHash([
    1,
    identity.message,
    identity.evidence,
    ...(identity.zoneEventSource ? [identity.zoneEventSource] : []),
    ...(Object.hasOwn(identity, "narrativeGrant") ? [identity.narrativeGrant] : []),
  ])}`;
}

export function createSemanticService(ports: SemanticPorts) {
  async function readSceneAuthority(scene: VenueScene) {
    const state = await ports.readVillageState({ memories: true });
    const actors = scene.contactGeneration?.actorIds ?? [
      ...scene.activeIds,
      ...(scene.contactGeneration?.remoteIds ?? []),
    ];
    const captured = scene.continuity && scene.continuity.seed === state.seed && scene.villageSeed === state.seed;
    return !captured && state.villagers.some((row) => actors.includes(row.characterId) && !wishHistoryLoaded(row))
      ? ports.readVillageState({ wishes: actors, memories: true })
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
    scene: VenueScene,
  ): SemanticIntent {
    if (savedInput.context.zoneId !== scene.zoneId || savedInput.context.placeId !== scene.placeId)
      throw conflict("The admitted Scene location changed. Your draft is preserved.");
    if (raw.movement !== null) throw badGateway("Use Move to change Zones. Your draft is preserved.");
    if (
      raw.status !== "resolved" ||
      raw.instructions !== "" ||
      raw.action !== null ||
      !Array.isArray(raw.timeline) ||
      raw.timeline.length > 64
    )
      throw badGateway("The saved input capture is incomplete. Your draft is preserved.");
    let cursor = 0;
    const timeline = raw.timeline.map((value) => {
      const row = asRecord(value);
      if (
        !Number.isSafeInteger(row.start) ||
        row.start !== cursor ||
        !Number.isSafeInteger(row.end) ||
        Number(row.end) <= cursor ||
        Number(row.end) > savedInput.message.length ||
        row.text !== savedInput.message.slice(cursor, Number(row.end))
      )
        throw badGateway("The saved input capture has invalid source offsets. Your draft is preserved.");
      if (
        !["speech", "action", "context"].includes(String(row.kind)) ||
        Object.keys(row).some((key) => !["kind", "text", "start", "end", "delivery", "targetId"].includes(key))
      )
        throw badGateway("The saved input capture has an unsupported kind or field. Your draft is preserved.");
      if (
        (row.kind !== "speech" && (row.delivery !== undefined || row.targetId !== undefined)) ||
        (row.delivery !== undefined && !["ordinary", "whisper", "shout"].includes(String(row.delivery)))
      )
        throw badGateway("The saved input capture has invalid delivery. Your draft is preserved.");
      if (
        row.targetId !== undefined &&
        row.targetId !== "player" &&
        ![...savedInput.context.referenceActors, ...savedInput.context.actors].some(
          (actor) => actor.id === row.targetId,
        )
      )
        throw badGateway("The saved input capture has an invalid actor reference. Your draft is preserved.");
      cursor = Number(row.end);
      return { ...row } as SemanticIntent["timeline"][number];
    });
    if (cursor !== savedInput.message.length)
      throw badGateway("The saved input capture omits source bytes. Your draft is preserved.");
    return {
      version: 2,
      sourceHash: hash,
      status: "resolved",
      instructions: "",
      reason: "",
      action: null,
      movement: null,
      timeline,
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
        ...(narrativeGrant !== undefined ? { narrativeGrant } : {}),
      },
      gm.raw,
      (raw, hash, savedInput): SemanticExchange => {
        raw = { ...raw, sourceHash: hash };
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
        const interpretedIntent = readIntent(asRecord(raw.intent), hash, savedInput, scene);
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
          const earlier = savedInput.context.history.map((line) => ({
            ...line,
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
        effects.earlierLineIds = savedInput.context.history.map((row) => row.id);
        const access: InterpretationBatch = {
          checks: [],
          results: [],
        };
        if (!Array.isArray(raw.access) || raw.access.length > 16)
          throw badGateway("System access interpretation is incomplete.");
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
            row.outcome !== "unresolved" &&
            (row.outcome === "ban-venue" || row.outcome === "ban-zone" || row.outcome === "access-management"
              ? !managesAccess(venue, typeof row.zoneId === "string" ? row.zoneId : null, row.actorId)
              : !zone || !canInviteToZone(venue, zone, row.actorId))
          )
            throw badGateway("System access issuer or scope lacks current authority. The draft is preserved.");
          if (
            cited.some((line) => !line.heardBy.includes(row.actorId as string)) ||
            !cited.some((line) => line.speakerId === row.actorId || line.kind === "narration")
          )
            throw badGateway("System access evidence was not witnessed by its issuer.");
          const id = `semantic:${hash}:access:${access.checks.length}`;
          const visit =
            venue.access && ["invite-now", "invite-later"].includes(String(row.outcome))
              ? readAccessCommand({
                  action: "invite",
                  operationId: id,
                  expectedRevision: venue.access.revision,
                  zoneId: row.zoneId,
                  visitorId: "player",
                  duration: "visit",
                  accompanied: row.accompanies || row.conditions.includes("accompanied"),
                  outsideHours: false,
                  ...(row.outcome === "invite-now" && venue.id === scene.placeId ? { sceneId: scene.id } : {}),
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
          const facts = {
            actorId: row.actorId,
            venueId: venue.id,
            zoneId: row.zoneId ?? null,
            accessRevision: venue.access?.revision,
            semanticVersion: 2,
            accompanies: row.accompanies || row.conditions.includes("accompanied"),
            ...(visit ? { accessCommand: visit } : management ? { accessCommand: management } : {}),
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
