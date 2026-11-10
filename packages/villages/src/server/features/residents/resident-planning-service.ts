import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { ResidentPlanningOpportunity, ReturnCatchupCapture, VillageState } from "../../domain/models/world.js";
import { continuityActor } from "../../domain/rules/continuity-actors.js";
import { activityDate, eventAttemptAvailable } from "../../domain/rules/event-attempts.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { acceptResidentLetter } from "../../domain/rules/mail-delivery.js";
import { memoryHash, memoryRequire } from "../../domain/rules/memory-integrity.js";
import { addRoutineIdea } from "../../domain/rules/owned-routine.js";
import { assertPersonalLetter } from "../../domain/rules/personal-letter.js";
import { villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { residenceProposal } from "../../domain/rules/residence-agreement.js";
import { planRoutineDays } from "../../domain/rules/resident-agenda.js";
import {
  captureResidentNarration,
  assertResidentNarrationCurrent,
  acceptResidentNarration,
} from "../../domain/rules/resident-narration.js";
import {
  buildResidentPlanningMessages,
  localDateKey,
  planningAllowance,
  readResidentPlanningInput,
  readResidentPlanningProposal,
  residentPlanningOpportunity,
  type ResidentPlanningContext,
  type ResidentPlanningInput,
} from "../../domain/rules/resident-planning.js";
import { responseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import {
  ReturnOpportunityUnavailable,
  returnCatchupSubject,
  sameReturnResident,
} from "../../domain/rules/return-catchup-authority.js";
import { departureContinuityAvailable } from "../../domain/rules/return-catchup-capture.js";
import { returnCaptureRevision } from "../../domain/rules/return-capture-revision.js";
import { liveSceneEncounterConflicts, sameSceneRoutine } from "../../domain/rules/scene-attendance.js";
import { sceneAccessContext } from "../../domain/rules/venue-contact.js";
import {
  acceptSocialPlan,
  completeSocialPlan,
  socialContinuationValid,
  socialPlanCandidates,
} from "../../domain/rules/social-rules.js";
import { hasVenueClass, venueResidentIds } from "../../domain/rules/venue-model.js";
import { fitVenueWritingMessages, venueCardProfile } from "../../domain/rules/venue-writing.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { readPlayerIdentity } from "../../domain/rules/village-projections.js";
import { completionFailure, WorkFailureError } from "../../domain/rules/work-failure.js";

export type ResidentPlanningPorts = {
  activeVenueSession: () => Promise<import("../../domain/models/scene-model.js").VenueScene | null>;
  afterCatchup?: (input: unknown) => Promise<void>;
  afterCatchupFailure?: (input: unknown) => Promise<void>;
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  readEffectiveVillagerCard: typeof import("../../adapters/engine/catalog.js").readEffectiveVillagerCard;
  queueBackgroundJob: typeof import("../../jobs/background-work.js").queueBackgroundJob;
  backgroundJobSnapshot: typeof import("../../jobs/background-work.js").backgroundJobSnapshot;
  villagesLanguageModels: typeof import("../../adapters/models/language-models.js").villagesLanguageModels;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
};

/** One captured GM choice and its native/continuity consequences share the job's Village CAS. */
export function createResidentPlanning(ports: ResidentPlanningPorts) {
  function absentPlayerConflicts(
    state: VillageState,
    scene: Awaited<ReturnType<ResidentPlanningPorts["activeVenueSession"]>>,
    at: Date,
  ) {
    if (!scene || Date.parse(scene.startedAt) > at.getTime()) return new Set<string>();
    const conflicts = liveSceneEncounterConflicts(state, scene, at);
    if (scene.liveSceneVersion !== 1 || scene.status === "closed" || scene.villageSeed !== state.seed) return conflicts;
    const positions = sceneAccessContext(scene).positions ?? {},
      zone = positions.player;
    for (const resident of state.villagers)
      if (zone && positions[resident.characterId] === zone && sameSceneRoutine(state, scene, resident.characterId, at))
        conflicts.add(resident.characterId);
    return conflicts;
  }
  function contextFor(
    state: VillageState,
    opportunity: ResidentPlanningOpportunity,
    catchup = false,
  ): ResidentPlanningContext {
    const now = new ZonedDate(opportunity.endsAt, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
      moment = deriveVillageMoment({
        foundedAt: state.foundedAt,
        environment: state.narrative,
        seed: state.seed,
        timeZone: state.timeZone || undefined,
        now,
      }),
      narration = captureResidentNarration(state, opportunity);
    return {
      format: 1,
      ...(catchup ? { catchup: true as const } : {}),
      village: state.name,
      setting: villageCurrentSetting(state),
      playerBackground: state.playerBackground,
      playerPersonaName: state.playerPersonaName,
      moment,
      environment: { weather: moment.weather },
      residents: opportunity.actorIds.map((id) => {
        const resident = state.villagers.find((row) => row.characterId === id)!,
          card = ports.readEffectiveVillagerCard(resident);
        return {
          characterId: id,
          name: card.name,
          profile: venueCardProfile(card, readPlayerIdentity(state).name),
        };
      }),
      housing: catchup
        ? []
        : opportunity.actorIds
            .filter((id) => !state.residences.some((row) => row.characterId === id && row.status !== "current"))
            .map((characterId) => ({
              characterId,
              destinations: state.venues
                .filter(
                  (venue) =>
                    hasVenueClass(venue, "residence") &&
                    venue.constructionStatus !== "worksite" &&
                    !venue.occupancy.playerHome &&
                    !venueResidentIds(venue).length &&
                    !state.residences.some(
                      (row) => row.proposedVenueId === venue.id && ["pending", "moving"].includes(row.status),
                    ),
                )
                .map(({ id, name }) => ({ id, name })),
            })),
      plans: catchup ? [] : socialPlanCandidates(state, now),
      narration,
    };
  }
  function assertCurrent(state: VillageState, input: ResidentPlanningInput) {
    const { context, catchup } = input,
      opportunity = context.narration.opportunity;
    memoryRequire(
      context.setting === villageCurrentSetting(state) && state.backgroundPace !== "off",
      "resident planning setting or pace changed",
    );
    if (catchup) {
      const tracking = state.returnCatchup,
        batch = tracking?.batch,
        capture = tracking?.capture;
      memoryRequire(
        batch?.id === catchup.batchId &&
          batch.status === "running" &&
          batch.until === catchup.until &&
          capture &&
          returnCaptureRevision(capture) === catchup.captureRevision &&
          memoryHash(capture.world) === memoryHash(catchup.world) &&
          departureContinuityAvailable(capture, state) &&
          batch.opportunities?.some((row) => memoryHash(row) === memoryHash(opportunity)),
        "historical resident opportunity changed",
      );
      const historical = { ...state, ...structuredClone(catchup.world) },
        at = new ZonedDate(opportunity.endsAt, historical.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      memoryRequire(
        opportunity.actorIds.every((id) => {
          const old = historical.villagers.find((row) => row.characterId === id),
            live = state.villagers.find((row) => row.characterId === id);
          return old && live && sameReturnResident(old, live, at, historical);
        }),
        "historical resident changed",
      );
      memoryRequire(
        !opportunity.venueId ||
          memoryHash(state.venues.find((row) => row.id === opportunity.venueId)) ===
            memoryHash(historical.venues.find((row) => row.id === opportunity.venueId)),
        "historical Venue changed",
      );
      memoryRequire(memoryHash(state.opening) === memoryHash(historical.opening), "historical opening changed");
      planRoutineDays(historical, at);
      assertResidentNarrationCurrent(historical, context.narration);
    } else {
      assertResidentNarrationCurrent(state, context.narration);
      memoryRequire(
        !input.socialPlan ||
          socialContinuationValid(state, input.socialPlan.id, input.socialPlan, new Date(context.narration.context.at)),
        "due resident plan changed",
      );
    }
  }
  async function reconcile(now: Date, dueOnly = false): Promise<boolean | void> {
    const state = await ports.readVillageState({ memories: true }),
      dateKey = activityDate(state, now),
      allowance = planningAllowance(state.backgroundPace, state.seed, dateKey);
    if (!allowance || !eventAttemptAvailable(state, dateKey, now.getTime())) return;
    const moment = deriveVillageMoment({
        foundedAt: state.foundedAt,
        environment: state.narrative,
        seed: state.seed,
        timeZone: state.timeZone || undefined,
        now,
      }),
      conflicts = absentPlayerConflicts(state, await ports.activeVenueSession(), now),
      due = state.residentPlans.plans.find(
        (plan) =>
          plan.status === "planned" &&
          plan.kind === "meeting" &&
          !plan.actors.some((actor) => conflicts.has(actor.id)) &&
          socialContinuationValid(state, plan.id, plan, now) &&
          plan.dateKey === dateKey &&
          plan.startMinute <= moment.minuteOfDay &&
          plan.endMinute > moment.minuteOfDay,
      );
    if (dueOnly && !due) return false;
    const subjectId = due ? "social:" + due.id : "village",
      prior = await ports.backgroundJobSnapshot("resident-planning", subjectId);
    if (prior?.seed === state.seed && ["queued", "running", "failed", "interrupted", "paused"].includes(prior.status))
      return;
    const opportunity = due
      ? {
          id: due.id + ":encounter",
          kind: "encounter" as const,
          startsAt: now.toISOString(),
          endsAt: now.toISOString(),
          actorIds: due.actors.map((actor) => actor.id),
          venueId: due.venueId,
          zoneId: due.zoneId,
          facts: ["An accepted free-time plan is happening now."],
        }
      : residentPlanningOpportunity(state, moment, state.simulatedThrough, conflicts);
    if (!opportunity || state.processedActionIds.includes(opportunity.id)) return;
    const context = contextFor(state, opportunity);
    if (due) context.plans = [];
    const input = readResidentPlanningInput({
      format: 1,
      context,
      dateKey,
      reviewBasis: state.eventAttempts?.lastAttemptAt || "",
      ...(due ? { socialPlan: due } : {}),
    });
    const used = state.eventAttempts?.attempts.filter((row) => row.date === dateKey).length || 0;
    await ports.queueBackgroundJob({
      kind: "resident-planning",
      subjectId,
      seed: state.seed,
      revision: dateKey + ":" + used,
      finite: false,
      label: "Resident activity",
      automaticDate: dateKey,
      input,
    });
    return true;
  }
  async function queueReturnOpportunity(
    batchId: string,
    opportunity: ResidentPlanningOpportunity,
    capture: ReturnCatchupCapture,
  ) {
    const state = await ports.readVillageState({ memories: true }),
      batch = state.returnCatchup?.batch,
      eventAt = Date.parse(opportunity.startsAt),
      returnAt = Date.parse(batch?.until || "");
    if (
      batch?.id !== batchId ||
      batch.status !== "running" ||
      batch.from !== capture.at ||
      returnCaptureRevision(state.returnCatchup?.capture) !== returnCaptureRevision(capture) ||
      !batch.opportunities?.some((row) => memoryHash(row) === memoryHash(opportunity)) ||
      !Number.isFinite(eventAt) ||
      !Number.isFinite(returnAt) ||
      eventAt < Date.parse(capture.at) ||
      eventAt > returnAt ||
      returnAt > villageNow().getTime() ||
      opportunity.startsAt !== opportunity.endsAt ||
      !["encounter", "routine"].includes(opportunity.kind) ||
      !departureContinuityAvailable(capture, state)
    )
      throw new ReturnOpportunityUnavailable(
        "The historical opportunity is no longer supported by its departure capture.",
      );
    const historical = { ...state, ...structuredClone(capture.world) },
      at = new ZonedDate(opportunity.startsAt, historical.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    planRoutineDays(historical, at);
    const input = readResidentPlanningInput({
      format: 1,
      context: contextFor(historical, opportunity, true),
      dateKey: batch.budgetDate,
      catchup: { batchId, captureRevision: returnCaptureRevision(capture), until: batch.until!, world: capture.world },
    });
    assertCurrent(state, input);
    await ports.queueBackgroundJob({
      kind: "resident-planning",
      subjectId: returnCatchupSubject(batchId, opportunity.id),
      seed: state.seed,
      revision: batchId + ":" + opportunity.id,
      finite: false,
      label: "Return catch-up",
      automaticDate: batch.budgetDate,
      input,
    });
  }
  const handler: Handler = {
    authority: "raw",
    reserve(state, raw) {
      const input = readResidentPlanningInput(raw);
      memoryRequire(
        input.reviewBasis === undefined || input.reviewBasis === (state.eventAttempts?.lastAttemptAt || ""),
        "automatic activity opportunity was already used",
      );
    },
    async generate(raw) {
      const input = readResidentPlanningInput(raw),
        state = await ports.readVillageState({ memories: true });
      assertCurrent(state, input);
      const active = await ports.activeVenueSession(),
        conflicts = absentPlayerConflicts(state, active, new Date(input.context.narration.context.at));
      memoryRequire(
        !input.context.narration.actors.some((actor) => conflicts.has(actor.id)),
        "resident entered a live Scene",
      );
      const model = await ports
          .villagesLanguageModels()
          .resolveForRequest({ connectionId: await ports.villagesConnectionIdFor("system") }),
        messages = buildResidentPlanningMessages(input.context),
        output = 4096,
        fitted = fitVenueWritingMessages(
          model,
          [{ text: String(messages[0].content) }],
          String(messages[1].content),
          Math.min(model.maxOutputTokens ?? output, output),
          "System",
        ),
        completion = await ports.completeWithRoom(model, fitted.messages, fitted.maxTokens ?? output, {
          responseFormat: { type: "json_object" },
          checkpointId: "resident-planning:gm:" + input.context.narration.opportunity.id,
          beforeBackgroundDispatch: async () => {
            const latest = await ports.readVillageState({ memories: true });
            assertCurrent(latest, input);
            const conflicts = absentPlayerConflicts(
              latest,
              await ports.activeVenueSession(),
              new Date(input.context.narration.context.at),
            );
            memoryRequire(
              !input.context.narration.actors.some((actor) => conflicts.has(actor.id)),
              "resident entered a live Scene",
            );
          },
          usagePurpose: "background",
          temperature: 0.85,
        }),
        payload = extractModelJsonObject(completion),
        failure = completionFailure(completion, "resident-planning", fitted.maxTokens ?? output);
      if (!payload || failure)
        throw new WorkFailureError({
          ...failure,
          cause: failure?.cause ?? "invalid_json",
          stage: "resident-planning",
          message: failure?.message ?? "Resident activity returned no usable result. Retry unfinished work explicitly.",
          responseDiagnostics: responseDiagnostics(model, completion, fitted.maxTokens ?? output, payload),
        });
      try {
        return {
          proposal: readResidentPlanningProposal(payload, input.context),
          responseDigest: memoryHash(completion.content),
        };
      } catch (error) {
        throw new WorkFailureError({
          cause: "missing_result",
          stage: "resident-planning",
          message: String(error).slice(0, 2000),
          responseDiagnostics: responseDiagnostics(model, completion, fitted.maxTokens ?? output, payload),
        });
      }
    },
    recoverSavedResult(raw, steps) {
      const input = readResidentPlanningInput(raw),
        saved = steps.filter(
          (step) =>
            step.status === "completed" &&
            step.key === "resident-planning:gm:" + input.context.narration.opportunity.id,
        );
      memoryRequire(saved.length === 1 && saved[0].response, "resident activity needs its exact saved GM response");
      const completion = saved[0].response,
        payload = extractModelJsonObject(completion),
        failure = completionFailure(completion, "resident-planning", 4096);
      memoryRequire(payload && !failure, "saved resident response is incomplete");
      return {
        proposal: readResidentPlanningProposal(payload, input.context),
        responseDigest: memoryHash(completion.content),
      };
    },
    valid(state, raw, admission) {
      const input = readResidentPlanningInput(raw),
        id = input.context.narration.opportunity.id;
      if (state.seed !== input.context.narration.context.seed) return false;
      if (state.processedActionIds.includes(id)) return true;
      assertCurrent(state, input);
      return (
        !!input.catchup ||
        admission?.activityDate === input.dateKey ||
        !!state.eventAttempts?.attempts.some(
          (row) => row.id === admission?.activityAttemptId && row.date === input.dateKey && !row.batchId,
        ) ||
        localDateKey(
          new ZonedDate(state.simulatedThrough, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
        ) <= input.dateKey
      );
    },
    apply(state, raw, saved) {
      const input = readResidentPlanningInput(raw),
        proposal = readResidentPlanningProposal(saved.proposal, input.context),
        capture = input.context.narration,
        opportunity = capture.opportunity,
        replayed = state.processedActionIds.includes(opportunity.id);
      memoryRequire(
        typeof saved.responseDigest === "string" && /^[a-f0-9]{64}$/.test(saved.responseDigest),
        "resident response lost its source digest",
      );
      if (!replayed) assertCurrent(state, input);
      const next = {
          ...state,
          villagers: structuredClone(state.villagers),
          residences: structuredClone(state.residences),
          residentPlans: structuredClone(state.residentPlans),
          returnCatchup: structuredClone(state.returnCatchup),
        },
        at = villageNow().toISOString();
      if (proposal.mail) {
        const from = continuityActor(next, proposal.mail.senderId)!,
          to = continuityActor(next, "player")!;
        assertPersonalLetter(
          proposal.mail.text,
          input.context.residents.find((row) => row.characterId === from.id)?.name,
        );
        acceptResidentLetter(
          next,
          capture.context,
          {
            id: "resident-mail-" + memoryHash([state.seed, opportunity.id]).slice(0, 32),
            at: capture.context.at,
            from,
            to,
          },
          proposal.mail.text,
          opportunity.id,
          { keep: proposal.keep, requires: proposal.requires },
          saved.responseDigest,
          at,
          capture.room
            ? {
                holder: capture.room.holder,
                provenance: capture.room.provenance,
                fingerprint: capture.room.fingerprint,
                protectedRoots: capture.room.protections.map((row) => row.id),
              }
            : undefined,
        );
      } else {
        const target = input.catchup ? { ...next, ...structuredClone(input.catchup.world) } : next;
        if (input.catchup)
          planRoutineDays(
            target,
            new ZonedDate(capture.context.at, target.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
          );
        const fiction = {
            ...(proposal.encounter ? { encounter: proposal.encounter } : {}),
            ...(proposal.reflection ? { reflection: proposal.reflection } : {}),
            keep: proposal.keep,
            requires: proposal.requires,
          },
          accepted = acceptResidentNarration(target, capture, fiction, saved.responseDigest, at);
        memoryRequire(
          !accepted.held,
          "Resident activity held: " + accepted.rejected.map((row) => row.id + ": " + row.reason).join("; "),
        );
        next.continuity = target.continuity;
        next.episodes = target.episodes;
      }
      if (replayed) return;
      const now = new ZonedDate(villageNow(), state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      acceptSocialPlan(next, input.context.plans, proposal.planId, now);
      if (input.socialPlan) {
        memoryRequire(!!proposal.encounter, "due encounter must preserve its accepted plan");
        completeSocialPlan(
          next,
          input.socialPlan,
          opportunity.actorIds,
          opportunity.venueId,
          opportunity.zoneId!,
          new ZonedDate(capture.context.at, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
        );
      }
      if (proposal.routineIdea) {
        const resident = next.villagers.find((row) => row.characterId === proposal.routineIdea!.characterId);
        memoryRequire(resident?.agenda, "routine owner changed");
        addRoutineIdea(resident.agenda, proposal.routineIdea, resident, next, now);
      }
      for (const request of proposal.housingRequests) {
        const venue = next.venues.find((row) => row.id === request.venueId);
        memoryRequire(
          venue &&
            hasVenueClass(venue, "residence") &&
            venue.constructionStatus !== "worksite" &&
            !venue.occupancy.playerHome &&
            !venueResidentIds(venue).length &&
            !next.residences.some(
              (row) =>
                row.status !== "current" &&
                (row.characterId === request.characterId || row.proposedVenueId === venue.id),
            ),
          "housing destination changed",
        );
        const residence = residenceProposal(
            next,
            request.characterId,
            venue,
            "villager",
            capture.context.at,
            "",
            opportunity.id + ":" + request.characterId,
          ),
          index = next.residences.findIndex((row) => row.characterId === request.characterId);
        if (index < 0) next.residences.push(residence);
        else next.residences[index] = residence;
      }
      next.lastPlanningDate = next.lastPlanningDate < input.dateKey ? input.dateKey : next.lastPlanningDate;
      next.planningUsage = {
        dateKey: input.dateKey,
        count: (next.planningUsage.dateKey === input.dateKey ? next.planningUsage.count : 0) + 1,
      };
      next.processedActionIds = [...next.processedActionIds, opportunity.id].slice(-256);
      if (input.catchup) {
        const tracking = next.returnCatchup,
          record = tracking?.batch?.records?.find((row) => row.opportunityId === opportunity.id);
        memoryRequire(
          tracking?.capture && tracking.batch?.id === input.catchup.batchId && record,
          "historical resident record changed",
        );
        record.outcome = structuredClone(proposal);
        record.status = "settled";
        tracking.capture.continuityRevision = next.continuity.revision;
        tracking.capture.episodeRevision = next.episodes.revision;
      }
      Object.assign(state, next);
    },
    afterApply: async (raw) => {
      const input = readResidentPlanningInput(raw);
      if (input.catchup) await ports.afterCatchup?.(input);
    },
    afterFailure: async (raw) => {
      const input = readResidentPlanningInput(raw);
      if (input.catchup) await ports.afterCatchupFailure?.(input);
    },
  };
  return { reconcile, queueReturnOpportunity, handler };
}
