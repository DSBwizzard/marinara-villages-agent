import { admissionLoreContext } from "../../../../shared/helpers/resident-admission.js";
import { foundingRequestMessages } from "../../../domain/rules/founding-requests.js";
import type { CompactFoundingContext } from "../../../domain/rules/compact-founding-rules.js";
import {
  foundingSlot,
  foundingTaskRevision,
  ownsFoundingTask,
  completeFoundingTask,
} from "../../../domain/rules/founding-tasks.js";
import { readSemanticWishCriteria } from "../../../domain/rules/wish-criteria.js";
import { ZonedDate } from "../../../../shared/helpers/zoned-date.js";
import { calendarReplay } from "../../../domain/rules/clock-recovery.js";
import { villageNow } from "../../../adapters/time/clock-gate.js";
import type { Handler } from "../../../domain/models/background-model.js";
import type { wishAttemptClocks, readWishAttemptClock } from "./wish-attempt-clocks.js";
import { villagerCardFromSnapshot } from "../../../adapters/engine/catalog.js";
import type { readVillageLore } from "../../../adapters/engine/lorebooks.js";
import type { villagesDebugAgentsEnabled, villagesLogger } from "../../../adapters/engine/runtime-host.js";
import type { villagesLanguageModels } from "../../../adapters/models/language-models.js";
import type { backgroundCalls, backgroundSetting } from "../../../adapters/operations/background-context.js";
import type { outsideVenueOperation } from "../../../adapters/operations/operation-context.js";
import type { WishAttempt } from "../../../domain/models/wish-types.js";
import type { VillageState } from "../../../domain/models/world.js";
import { agendaDateKey } from "../../../domain/rules/agenda-week.js";
import { notFound } from "../../../domain/rules/errors.js";
import { extractModelJsonObject } from "../../../domain/rules/json-reply.js";
import { addRoutineIdea } from "../../../domain/rules/owned-routine.js";
import { coerceWish, villageCurrentSetting } from "../../../domain/rules/prompt-preset.js";
import { venueCardProfile } from "../../../domain/rules/venue-writing.js";
import { canOccupyZone, venueZones, zoneClosed } from "../../../domain/rules/venue-zones.js";
import { deriveVillageMoment, randomVillageSeed } from "../../../domain/rules/village-clock.js";
import {
  selectWishSize,
  validateGeneratedWishWording,
  wishGenerationDirection,
} from "../../../domain/rules/wish-definition.js";
import { setWishJournalStatus } from "../../../domain/rules/wish-journal.js";
import {
  knownNeedBlocked,
  newWishLifecycle,
  normalWish,
  rememberWishNeed,
  removeWishActivities,
  selectWishNeeds,
  WISH_DAY_MS,
  wishRevision,
} from "../../../domain/rules/wish-policy.js";
import {
  canApplyWishActivity,
  proposalActivity,
  recordUsage,
  wishSlots,
} from "../../../domain/rules/wish-lifecycle-rules.js";
import { completionFailure, WorkFailureError } from "../../../domain/rules/work-failure.js";
import { backgroundRevision } from "../../../domain/rules/background-revision.js";
import type { backgroundStatus, queueBackgroundJob, settleBackgroundWork } from "../../../jobs/background-work.js";
import type { completeWithRoom } from "../../generation/model-requests.js";
import type { villagesConnectionIdFor } from "../../settings/connections.js";
import type { mutateVillageState, readVillageState } from "../../world/village-store.js";
import type { flushWishOutcomes, previousFulfilledNeed, readWishOutcome } from "./wish-archive.js";
import { registerInitialWish } from "./wish-initial.js";
import type { CapabilityLanguageModelCompletion, CapabilityLanguageModelMessage } from "@marinara-engine/shared";
export type WishLifecyclePorts = {
  wishAttemptClocks(): Pick<ReturnType<typeof wishAttemptClocks>, "remember" | "forget">;
  readWishAttemptClock: typeof readWishAttemptClock;
  readVillageLore: typeof readVillageLore;
  villagesDebugAgentsEnabled: typeof villagesDebugAgentsEnabled;
  villagesLogger(): Pick<ReturnType<typeof villagesLogger>, "warn" | "info">;
  villagesLanguageModels(): Pick<ReturnType<typeof villagesLanguageModels>, "resolveForRequest">;
  backgroundCalls: Pick<typeof backgroundCalls, "getStore">;
  backgroundSetting: typeof backgroundSetting;
  outsideVenueOperation: typeof outsideVenueOperation;
  backgroundStatus: typeof backgroundStatus;
  queueBackgroundJob: typeof queueBackgroundJob;
  settleBackgroundWork: typeof settleBackgroundWork;
  completeWithRoom: typeof completeWithRoom;
  villagesConnectionIdFor: typeof villagesConnectionIdFor;
  mutateVillageState: typeof mutateVillageState;
  readVillageState: typeof readVillageState;
  flushWishOutcomes: typeof flushWishOutcomes;
  previousFulfilledNeed: typeof previousFulfilledNeed;
  readWishOutcome: typeof readWishOutcome;
};
/** Wish claims, generation and corrections use one application's connections. */
export function createWishLifecycle(ports: WishLifecyclePorts) {
  const {
    wishAttemptClocks,
    readWishAttemptClock,
    readVillageLore,
    villagesDebugAgentsEnabled,
    villagesLogger,
    villagesLanguageModels,
    backgroundCalls,
    backgroundSetting,
    outsideVenueOperation,
    backgroundStatus,
    queueBackgroundJob,
    settleBackgroundWork,
    completeWithRoom,
    villagesConnectionIdFor,
    mutateVillageState,
    readVillageState,
    flushWishOutcomes,
    previousFulfilledNeed,
    readWishOutcome,
  } = ports;

  const MAX_ACTIVE = 2;

  async function retireResidentWish(characterId: string, wishId: string): Promise<void> {
    await outsideVenueOperation(async () => {
      await mutateVillageState((state) => {
        const resident = state.villagers.find((person) => person.characterId === characterId);
        const wish = resident?.agenda?.wishes.find((item) => item.id === wishId);
        if (!resident?.agenda || !wish?.learnedAt) throw notFound("That discovered wish is not active.");
        resident.agenda.wishes = resident.agenda.wishes.filter((item) => item.id !== wishId);
        removeWishActivities(resident, wishId, villageNow());
        setWishJournalStatus(state, characterId, wishId, "retired");
        if (resident.wishLifecycle) {
          const need = resident.wishLifecycle.needs.find((need) => need.id === wish.need?.id);
          if (need) need.state = "expired";
        }
        state.progressTasks = state.progressTasks.filter(
          (task) => task.definition.owner.kind !== "wish" || task.definition.owner.id !== wishId,
        );
      });
    });
  }

  async function reserveInitialWishAllowance(characterId: string, now: Date): Promise<string | undefined> {
    let id: string | undefined;
    await mutateVillageState((state) => {
      id = undefined;
      if (calendarReplay(state, now)) return;
      const resident = state.villagers.find((entry) => entry.characterId === characterId);
      if (!resident || resident.wishLifecycle?.attempt) return;
      registerInitialWish(resident, now);
      id = resident.wishLifecycle!.attempt!.id;
    });
    return id;
  }

  async function correctResidentWish(characterId: string, wishId: string, now = villageNow()): Promise<void> {
    const outcome = await readWishOutcome(characterId, wishId);
    if (!outcome || outcome.kind !== "fulfilled")
      throw notFound("That completed wish is not in this villager's record.");
    if (outcome.correctedAt) return;
    const previous = await previousFulfilledNeed(characterId, outcome.needId, outcome.sequence);
    await mutateVillageState((state) => {
      const resident = state.villagers.find((entry) => entry.characterId === characterId),
        lifecycle = resident?.wishLifecycle;
      if (!resident || !lifecycle) throw notFound("That villager does not live here.");
      if (state.correctedWishMemoryIds.includes(outcome.memoryId)) return;
      state.correctedWishMemoryIds = [...state.correctedWishMemoryIds, outcome.memoryId];
      state.chronicle = state.chronicle.filter((entry) => entry.id !== outcome.memoryId);
      const corrected = { ...outcome, correctedAt: now.toISOString() };
      lifecycle.pendingOutcomes = [
        ...lifecycle.pendingOutcomes.filter((entry) => entry.sequence !== outcome.sequence),
        corrected,
      ];
      const need = lifecycle.needs.find((entry) => entry.id === outcome.needId);
      if (need) {
        need.state = "corrected";
        need.latestAt = now.toISOString();
      }
      if (need?.lastOutcomeSequence === outcome.sequence) {
        need.lastFulfilledAt = previous?.fulfilledAt ?? "";
        need.lastOutcomeSequence = previous?.sequence;
      }
      if (
        resident.agenda &&
        resident.agenda.wishes.length < MAX_ACTIVE &&
        !resident.agenda.wishes.some((entry) => entry.id === wishId)
      ) {
        const wish = coerceWish({ ...outcome.wish, need: outcome.wish.need }, wishId, now.toISOString());
        if (wish) {
          wish.learnedAt = outcome.wish.learnedAt;
          wish.learnedLineIds = outcome.wish.learnedLineIds;
          rememberWishNeed(resident, wish, outcome.needId);
          resident.agenda.wishes.push(wish);
        }
      }
    });
    await flushWishOutcomes();
  }

  async function ask(
    job: WishAttempt,
    messages: CapabilityLanguageModelMessage[],
    limit: number,
    founding = false,
  ): Promise<Record<string, unknown> | null> {
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const requested = Math.min(model.maxOutputTokens ?? limit, limit),
      fitted = model.fitContext(messages, { maxTokens: requested });
    // Losing any required comparison entry is an uncertain verdict, never permission.
    if (JSON.stringify(fitted.messages) !== JSON.stringify(messages))
      throw new Error("The System context cannot fit the bounded wish request.");
    const outputLimit = Math.min(fitted.maxTokens ?? requested, requested);
    const started = performance.now();
    let completion: CapabilityLanguageModelCompletion | null = null;
    try {
      completion = await completeWithRoom(model, fitted.messages, outputLimit, {
        responseFormat: { type: "json_object" },
        temperature: limit === 800 ? 0 : 0.7,
        reasoningEffort: founding ? "none" : "low",
        ...(founding ? { usagePurpose: "background" as const, checkpointId: "founding-wish-v1" } : {}),
        debugMode: !backgroundCalls.getStore() && villagesDebugAgentsEnabled(),
        retryEmpty: false,
        signal: AbortSignal.timeout(30_000),
      });
      const failure = completionFailure(completion, "wish-generation", outputLimit);
      if (failure) throw new WorkFailureError(failure);
      const payload = extractModelJsonObject(completion);
      if (!payload)
        throw new WorkFailureError({
          cause: "invalid_json",
          stage: "wish-generation",
          message: "Wish generation returned malformed JSON; explicit retry required.",
          finishReason: completion.finishReason,
          requestedOutputTokens: outputLimit,
        });
      return payload;
    } finally {
      if (founding)
        villagesLogger().info(
          "[villages] founding task=wish contract=1 inputChars=%d outputAllowance=%d elapsedMs=%d finish=%s validation=%s",
          messages.reduce(
            (sum, row) =>
              sum + (typeof row.content === "string" ? row.content.length : JSON.stringify(row.content).length),
            0,
          ),
          outputLimit,
          Math.round(performance.now() - started),
          completion?.finishReason ?? "unavailable",
          completion && extractModelJsonObject(completion) ? "json" : "incomplete",
        );
      recordUsage(job, completion, performance.now() - started);
    }
  }

  async function generateWish(input: {
    state: VillageState;
    characterId: string;
    now: string;
    foundingContract?: 1;
    admission?: CompactFoundingContext;
    savedProposal?: Record<string, unknown>;
  }): Promise<WishAttempt> {
    const state = structuredClone(input.state),
      characterId = input.characterId,
      now = new ZonedDate(input.now, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
    const resident = state.villagers.find((entry) => entry.characterId === characterId)!;
    const job = resident.wishLifecycle!.attempt!;
    const founding = input.foundingContract === 1;
    if (founding) {
      await mutateVillageState((live) => {
        if (live.seed !== state.seed || !ownsFoundingTask(live, characterId, "wish", (input as any).revision, job.id))
          return;
        const marker = live.foundingPreparation!;
        marker.stage = "model";
        marker.stageStartedAt = villageNow().toISOString();
      });
      job.stage = "reserved";
      job.calls = 0;
      job.semanticVersion = 2;
    }
    if (job.stage === "reserved") job.calls = 0;
    if (job.stage === "reserved") {
      const slots = job.resetRefill || founding ? [] : wishSlots(resident, state, now),
        card = resident.cardSnapshot;
      const lore = founding
        ? []
        : await backgroundSetting("wishLore", () =>
            readVillageLore(
              state.selectedLorebookIds,
              [
                state.setting,
                admissionLoreContext(state.worldName, [resident.admission]),
                card.name,
                card.summary,
                card.personality,
                card.backstory,
              ].join("\n"),
              undefined,
              Math.min(state.loreTokenBudget, 400),
            ),
          );
      const known = selectWishNeeds(
        [card.summary, card.personality, ...lore].join(" "),
        resident.agenda.wishes,
        resident.wishLifecycle?.needs ?? [],
      );
      const size = selectWishSize(job.id);
      const messages: CapabilityLanguageModelMessage[] = founding
        ? foundingRequestMessages(input.admission!, "wish", known)
        : [
            {
              role: "system",
              content:
                wishGenerationDirection(size) +
                (job.semanticVersion === 2
                  ? ' Include wish.criteria:{kind:"conversation|transfer|action|complex",requiresPhysical:boolean,itemName?,predicate?,target?,venueId?} interpreting the original goal. Transfer requires a nonempty itemName and requiresPhysical:true. Action requires a nonempty target, requiresPhysical:true and predicate:item-added,item-removed,trace-resolved. Conversation requires requiresPhysical:false and no physical fields. Return neutralWording:true only if the goal is a neutral description without directing the player.'
                  : "") +
                "\n" +
                'Propose at most ONE personal desire grounded in the complete authored character, or none. Their circumstances may change; their personality, voice, and values are not rewritten by the village. Do not prescribe a visible tell or recurring gesture. JSON only: {"wish":null} or {"wish":{"wish":"...","intensity":1,"need":{"subject":"specific object or experience","action":"acquire, repair, use, improve, or specific experience","policy":"lasting or recurring"}}}. Also return matchedNeedId (exact supplied known id, or empty for a new need) and certain (false if uncertain). Match the same unmet need, not merely the same object; acquiring, repairing and using differ. Do not change a matched recurrence policy. ' +
                (job.resetRefill
                  ? "This is a one-time Wish replacement only. Omit adjustment and routineIdea; do not change the routine. "
                  : "You may optionally return adjustment:{slot,activity,venueId,zoneId} using only a supplied future free-time slot and saved destination IDs. You may optionally include ONE routineIdea:{activity,venueId,zoneId,flexible:true} for an ordinary future optional activity; it establishes no asset, job or physical fact. ") +
                " Never invent people, places, physical changes, injuries, debts, emergencies, or an object already owned. Wishes are personal interests, not player errands. Lasting achievements stay settled; recurring ordinary needs may return only after seven fulfilled days. Active wishes must not repeat. No suitable wish is a valid quiet day.",
            },
            {
              role: "user",
              content: JSON.stringify({
                village: state.name.slice(0, 100),
                setting: villageCurrentSetting(state),
                person: {
                  name: card.name,
                  profile: venueCardProfile({
                    ...villagerCardFromSnapshot(card),
                    admission: resident.admission,
                  }),
                },
                lore: lore.join("\n").slice(0, 1800),
                active: resident.agenda.wishes.map(({ tell: _tell, ...wish }) => wish),
                known: known.map((need) => ({
                  id: need.id,
                  subject: need.subject,
                  action: need.action,
                  policy: need.policy,
                  aliases: need.aliases.slice(-2),
                  fulfilledAt: need.lastFulfilledAt,
                  state: need.state,
                  latestAt: need.latestAt,
                })),
                influenceHints: resident.scheduleInfluence?.enabled
                  ? resident.agenda.scheduleInfluenceSnapshot?.unresolved?.slice(0, 4)
                  : [],
                slots: slots.map((slot, index) => ({ slot: index + 1, ...slot })),
                places: state.venues.slice(0, 24).map((venue) => ({
                  id: venue.id,
                  name: venue.name,
                  condition: venue.state.condition.slice(0, 160),
                  facts: venue.state.publicFacts.slice(0, 3).map((fact) => fact.slice(0, 120)),
                  furniture: venue.state.furniture.slice(0, 3).map((item) => item.slice(0, 120)),
                  zones: venueZones(venue)
                    .filter(
                      (zone) =>
                        canOccupyZone(venue, zone, characterId, {
                          at: villageNow(),
                          relationships: state.relationshipContext,
                        }) && !zoneClosed(state, venue, zone),
                    )
                    .map((zone) => ({ id: zone.id, kind: zone.kind })),
                })),
              }),
            },
          ];
      job.calls = input.savedProposal ? 0 : 1;
      const payload = input.savedProposal ?? (await ask(job, messages, founding ? 1536 : 4096, founding)),
        raw = payload?.wish;
      const candidate =
        raw && typeof raw === "object" && !Array.isArray(raw)
          ? coerceWish({ ...raw, size }, randomVillageSeed(), now.toISOString())
          : null;
      if (!candidate) {
        if (!payload || !("wish" in payload) || payload.wish !== null)
          throw new WorkFailureError({
            cause: "missing_result",
            stage: "wish-generation",
            message: "Wish generation returned no usable answer; explicit retry required.",
          });
        job.routineIdea = job.resetRefill || founding ? undefined : payload.routineIdea;
        job.stage = "done";
        job.reason = "No new wish today.";
        return job;
      }
      if (founding && (!candidate.need?.subject || !candidate.need.action || candidate.need.policy === "unknown"))
        throw new Error("Initial Wish needs a specific need identity.");
      if (job.semanticVersion === 2) {
        candidate.semanticCriteria = readSemanticWishCriteria(
          (raw as Record<string, unknown>).criteria,
          candidate.wish,
        );
        if (!candidate.semanticCriteria || payload.neutralWording !== true)
          throw new WorkFailureError({
            cause: "unsupported_outcome",
            stage: "wish-generation",
            message: "System must establish a neutrally described Wish and its criteria; explicitly retry.",
          });
      } else validateGeneratedWishWording(candidate.wish);
      if (candidate.need) candidate.need.id = "";
      const adjustment =
        !job.resetRefill &&
        !founding &&
        payload?.adjustment &&
        typeof payload.adjustment === "object" &&
        !Array.isArray(payload.adjustment)
          ? proposalActivity(payload.adjustment as Record<string, unknown>, candidate, slots, resident, state)
          : undefined;
      job.needComparison = {
        matchedNeedId: typeof payload.matchedNeedId === "string" ? payload.matchedNeedId : "",
        certain: payload.certain === true || (!known.length && payload.certain !== false),
        knownIds: known.map((need) => need.id),
      };
      job.routineIdea = job.resetRefill ? undefined : payload.routineIdea;
      job.candidate = candidate;
      job.activity = adjustment;
      job.stage = "generated";
    }
    if (job.stage === "generated") {
      const candidate = job.candidate,
        active = resident.agenda.wishes,
        needs = resident.wishLifecycle?.needs ?? [];
      const exact = needs.find((need) =>
        need.aliases.some((alias) => normalWish(alias) === normalWish(candidate.wish)),
      );
      let accepted =
          !active.some(
            (wish) => normalWish(wish.wish) === normalWish(candidate.wish) || (!!exact && wish.need?.id === exact.id),
          ) && !(exact && knownNeedBlocked(exact, now)),
        matchedNeedId = exact?.id,
        reason = "Local identity check";
      if (accepted && !exact) {
        const verdict = job.needComparison;
        matchedNeedId = verdict?.matchedNeedId;
        const matched = needs.find((need) => need.id === matchedNeedId);
        accepted =
          !!verdict?.certain &&
          typeof matchedNeedId === "string" &&
          (!matchedNeedId || (!!matched && verdict.knownIds.includes(matchedNeedId))) &&
          !active.some((wish) => wish.need?.id === matchedNeedId || "active:" + wish.id === matchedNeedId) &&
          !(matched && knownNeedBlocked(matched, now)) &&
          (!matched || candidate.need?.policy === matched.policy);
        reason = accepted ? "Bounded semantic comparison accepted" : "Repeated need or uncertain comparison";
      } else if (!accepted) reason = "Active duplicate or settled need";
      job.accepted = accepted;
      job.matchedNeedId = matchedNeedId || undefined;
      job.reason = reason;
      job.stage = "validated";
    }
    return job;
  }

  const wishBackgroundHandler: Handler = {
    generate: generateWish,
    valid(state, input) {
      const resident = state.villagers.find((entry) => entry.characterId === input.characterId);
      if (input.foundingContract === 1)
        return (
          !!resident?.agenda &&
          resident.cardSnapshot.capturedAt === input.capturedAt &&
          ownsFoundingTask(state, input.characterId, "wish", input.revision, input.id)
        );
      return (
        (state.storyPace !== "off" || resident?.wishLifecycle?.attempt?.resetRefill === true) &&
        !!resident?.agenda &&
        resident.cardSnapshot.capturedAt === input.capturedAt &&
        resident.wishLifecycle?.attempt?.id === input.id &&
        wishRevision(resident, state) === input.revision
      );
    },
    apply(state, input, result: WishAttempt, context) {
      const owner = state.villagers.find((entry) => entry.characterId === input.characterId)!;
      const founding = input.foundingContract === 1;
      if (!founding && !result.resetRefill && owner.agenda && result.routineIdea)
        addRoutineIdea(owner.agenda, result.routineIdea, owner, state, villageNow());
      const committedAt = (readWishAttemptClock(input.id) ?? (() => villageNow()))();
      const attempt = structuredClone(result);
      // A deliberate retry consumes the current allowance, even when its paid proposal was saved on an earlier day.
      if (context.retrying || attempt.resetRefill || founding) {
        attempt.dateKey = agendaDateKey(committedAt);
        attempt.at = committedAt.toISOString();
        if (attempt.resetRefill && attempt.candidate)
          attempt.candidate = coerceWish(attempt.candidate, attempt.candidate.id, attempt.at) ?? undefined;
      }
      if (
        attempt.accepted &&
        attempt.candidate &&
        owner.agenda!.wishes.length < MAX_ACTIVE &&
        (state.storyPace !== "off" || attempt.resetRefill === true || founding) &&
        attempt.dateKey === agendaDateKey(committedAt)
      ) {
        rememberWishNeed(owner, attempt.candidate, attempt.matchedNeedId);
        owner.agenda!.wishes.push(attempt.candidate);
        if (
          !founding &&
          !attempt.resetRefill &&
          attempt.activity &&
          canApplyWishActivity(attempt.activity, owner, state, committedAt)
        )
          owner.agenda!.wishActivities = [...(owner.agenda!.wishActivities ?? []), attempt.activity];
      } else if (attempt.accepted) attempt.reason = "State changed before commit; no wish granted.";
      attempt.stage = "done";
      owner.wishLifecycle!.attempt = attempt;
      if (founding) completeFoundingTask(state, input.characterId, "wish", input.revision);
      else delete state.wishRefillIntents[input.characterId];
    },
  };

  async function queueFoundingWish(
    characterId: string,
    context: CompactFoundingContext,
    savedProposal?: Record<string, unknown>,
  ): Promise<void> {
    await reserveInitialWishAllowance(characterId, villageNow());
    const state = await readVillageState(),
      resident = state.villagers.find((row) => row.characterId === characterId);
    if (!resident?.agenda || !resident.wishLifecycle?.attempt)
      throw new Error("Initial Wish allowance is unavailable.");
    if (
      context.sourceRevision !== foundingTaskRevision(state, characterId, "routine") ||
      JSON.stringify(context.activeWishes) !== JSON.stringify(resident.agenda.wishes)
    )
      throw new Error("Resident context changed. Retry Wish.");
    const id = resident.wishLifecycle.attempt.id,
      revision = foundingTaskRevision(state, characterId, "wish");
    await mutateVillageState((live) => {
      const marker = live.foundingPreparation;
      if (
        live.seed !== state.seed ||
        marker?.tasksVersion !== 1 ||
        marker.status !== "pending" ||
        foundingTaskRevision(live, characterId, "wish") !== revision
      )
        throw new Error("Resident context changed. Retry Wish.");
      marker.tasks ??= {};
      marker.tasks[characterId] ??= {};
      if (marker.tasks[characterId].wish?.revision !== revision)
        marker.tasks[characterId].wish = {
          contract: 1,
          revision,
          jobId: foundingSlot("wish", characterId),
          status: "pending",
          attempt: 0,
          error: "",
          allowanceId: id,
        };
      else marker.tasks[characterId].wish!.allowanceId = id;
    });
    await queueBackgroundJob({
      kind: "wish",
      retryActionId: state.foundingPreparation?.retryActions?.at(-1),
      subjectId: characterId,
      seed: state.seed,
      revision,
      finite: true,
      label: resident.cardSnapshot.name + "'s initial Wish",
      input: {
        state: { ...state, villagers: [resident] },
        characterId,
        id,
        revision,
        capturedAt: resident.cardSnapshot.capturedAt,
        now: villageNow().toISOString(),
        foundingContract: 1,
        admission: context,
        savedProposal,
      },
    });
  }
  async function processWishAttempt(characterId: string, id: string, now: Date, clock?: () => Date): Promise<void> {
    const clocks = wishAttemptClocks();
    const state = await readVillageState(),
      resident = state.villagers.find((entry) => entry.characterId === characterId);
    const job = resident?.wishLifecycle?.attempt;
    if (
      !resident?.agenda ||
      !job ||
      job.id !== id ||
      job.stage === "done" ||
      (state.storyPace === "off" && !job.resetRefill)
    )
      return;
    const existingStatus = await backgroundStatus("wish", characterId, id);
    if (["failed", "interrupted"].includes(existingStatus ?? "") && wishRevision(resident, state) === job.revision)
      return;
    const interrupted = job.stage === "reserved" && job.calls > 0;
    if (
      !interrupted &&
      (wishRevision(resident, state) !== job.revision || (!job.resetRefill && job.dateKey !== agendaDateKey(now)))
    ) {
      await mutateVillageState((live) => {
        const attempt = live.villagers.find((entry) => entry.characterId === characterId)?.wishLifecycle?.attempt;
        if (attempt?.id === id) {
          attempt.stage = "done";
          attempt.reason = "The proposal's day or village context changed.";
        }
      });
      return;
    }
    if (clock) clocks.remember(id, clock);
    if (interrupted)
      await mutateVillageState((live) => {
        const attempt = live.villagers.find((entry) => entry.characterId === characterId)?.wishLifecycle?.attempt;
        if (attempt?.id === id) attempt.reason = "Interrupted request: outcome unknown; deliberate retry required.";
      });
    // Freeze context once; repeated discovery uses the same durable slot and stage results.
    state.villagers = [resident];
    await queueBackgroundJob({
      kind: "wish",
      subjectId: characterId,
      seed: state.seed,
      revision: backgroundRevision([id, job.revision]),
      finite: job.resetRefill === true,
      label: resident.cardSnapshot.name + (job.resetRefill ? "'s replacement wish" : "'s next wish"),
      legacyError: interrupted ? "Interrupted wish request: outcome unknown; deliberate retry required." : undefined,
      input: {
        state,
        characterId,
        id,
        revision: job.revision,
        capturedAt: resident.cardSnapshot.capturedAt,
        now: now.toISOString(),
      },
    });
    if (clock) {
      try {
        await settleBackgroundWork();
      } finally {
        clocks.forget(id);
      }
    }
  }

  async function reserveWishAttempts(now: Date): Promise<{ characterId: string; id: string }[]> {
    const before = await readVillageState();
    const blocked = new Set<string>();
    for (const resident of before.villagers) {
      const status = await backgroundStatus("wish", resident.characterId, resident.wishLifecycle?.attempt?.id);
      if (resident.wishLifecycle?.attempt && ["failed", "interrupted", "paused"].includes(status ?? ""))
        blocked.add(resident.characterId);
    }
    let work: { characterId: string; id: string }[] = [];
    await mutateVillageState((state) => {
      work = [];
      if (calendarReplay(state, now)) return;
      if (state.foundingPreparation && state.foundingPreparation.status !== "ready") return;
      const dateKey = agendaDateKey(now),
        moment = deriveVillageMoment({
          foundedAt: state.foundedAt,
          seed: state.seed,
          timeZone: state.timeZone || undefined,
          now,
        }),
        phaseKey = `${dateKey}:${moment.dayPhase}`;
      // The migration records intent locally; reservation owns every finite replacement exactly once.
      state.wishResetPending = state.wishResetPending.filter((characterId) => {
        const resident = state.villagers.find((entry) => entry.characterId === characterId);
        if (!resident) return false;
        if (!resident.agenda?.generatedAt || resident.agenda.personalizationPending) return true;
        if (resident.wishLifecycle?.attempt) return false;
        const lifecycle = (resident.wishLifecycle = newWishLifecycle());
        lifecycle.attempt = {
          id: randomVillageSeed(),
          resetRefill: true,
          dateKey,
          at: now.toISOString(),
          stage: "reserved",
          semanticVersion: 2,
          reason: "Queued",
          calls: 0,
          elapsedMs: 0,
          inputTokens: null,
          outputTokens: null,
          revision: wishRevision(resident, state),
        };
        lifecycle.lastPhaseKey = phaseKey;
        return false;
      });
      for (const resident of state.villagers) {
        const job = resident.wishLifecycle?.attempt;
        if (job?.resetRefill && job.stage !== "done" && !blocked.has(resident.characterId))
          work.push({ characterId: resident.characterId, id: job.id });
      }
      if (state.storyPace === "off") return;
      // A clock rollback must not reopen an earlier phase for ordinary automatic work.
      if (state.villagers.some((resident) => Date.parse(resident.wishLifecycle?.attempt?.at ?? "") > now.getTime()))
        return;
      let occupied = state.villagers.filter((resident) => resident.wishLifecycle?.lastPhaseKey === phaseKey).length;
      const pending = state.villagers
        .filter(
          (resident) =>
            !blocked.has(resident.characterId) &&
            !resident.wishLifecycle?.attempt?.resetRefill &&
            resident.wishLifecycle?.attempt &&
            resident.wishLifecycle.attempt.stage !== "done",
        )
        .sort((a, b) => a.wishLifecycle!.attempt!.at.localeCompare(b.wishLifecycle!.attempt!.at));
      for (const resident of pending) {
        const lifecycle = resident.wishLifecycle!;
        if (lifecycle.lastPhaseKey !== phaseKey) {
          if (occupied >= 2) continue;
          lifecycle.lastPhaseKey = phaseKey;
          occupied++;
        }
        if (work.length < 2) work.push({ characterId: resident.characterId, id: lifecycle.attempt!.id });
      }
      const eligible = state.villagers
        .filter((resident) => {
          const job = resident.wishLifecycle?.attempt;
          return (
            resident.agenda &&
            resident.agenda.generatedAt &&
            resident.agenda.wishes.length < MAX_ACTIVE &&
            (!job || job.stage === "done") &&
            job?.dateKey !== dateKey &&
            (!job || now.getTime() - Date.parse(job.at) >= WISH_DAY_MS)
          );
        })
        .sort(
          (a, b) =>
            (a.wishLifecycle?.attempt?.at ?? "").localeCompare(b.wishLifecycle?.attempt?.at ?? "") ||
            a.characterId.localeCompare(b.characterId),
        );
      for (const resident of eligible.slice(0, Math.max(0, 2 - occupied))) {
        const lifecycle = (resident.wishLifecycle ??= newWishLifecycle()),
          id = randomVillageSeed();
        lifecycle.attempt = {
          id,
          dateKey,
          at: now.toISOString(),
          stage: "reserved",
          semanticVersion: 2,
          reason: "Queued",
          calls: 0,
          elapsedMs: 0,
          inputTokens: null,
          outputTokens: null,
          revision: wishRevision(resident, state),
        };
        lifecycle.lastPhaseKey = phaseKey;
        work.push({ characterId: resident.characterId, id });
      }
    });
    return work;
  }

  async function reconcileWishLifecycle(now: Date, background = true, clock?: () => Date): Promise<void> {
    if (calendarReplay(await readVillageState(), now)) return;
    try {
      await flushWishOutcomes();
    } catch (error) {
      villagesLogger().warn("[villages] wish archive remains pending: %s", String(error));
    }
    const work = await reserveWishAttempts(now);
    const run = async () => {
      for (const item of work) await processWishAttempt(item.characterId, item.id, now, clock);
    };
    if (background)
      outsideVenueOperation(() => {
        queueMicrotask(() => {
          void run().catch((error) => villagesLogger().warn("[villages] wish worker: %s", String(error)));
        });
      });
    else {
      await outsideVenueOperation(run);
      await settleBackgroundWork();
    }
  }

  return {
    retireResidentWish,
    queueFoundingWish,
    reserveInitialWishAllowance,
    correctResidentWish,
    processWishAttempt,
    reserveWishAttempts,
    reconcileWishLifecycle,
    wishBackgroundHandler,
  };
}
export type WishLifecycleService = ReturnType<typeof createWishLifecycle>;
