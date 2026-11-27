import { venueResidentIds } from "../../domain/rules/venue-model.js";
import { continuityPreparationContext, continuityContextRevision } from "../../domain/rules/continuity-library.js";
import { admissionLoreContext } from "../../../shared/helpers/resident-admission.js";
import { calendarAt, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { readEffectiveVillagerCard } from "../../adapters/engine/catalog.js";
import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import type { LoreInspection } from "../../../shared/contracts/lore.js";
import { inspectedLoreUse } from "../../domain/rules/lore-context.js";
import { observeVillageClock, villageNow } from "../../adapters/time/clock-gate.js";
import { readSavedBackgroundCheckpoint } from "../../adapters/operations/background-context.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { VillageAgenda, VillageAgendaView, VillageState } from "../../domain/models/world.js";
import { scheduledAgendaActivity, unwrittenVillageAgenda } from "../../domain/rules/agenda-plan.js";
import { agendaRevision } from "../../domain/rules/agenda-revision.js";
import { backgroundRevision } from "../../domain/rules/background-revision.js";
import {
  activeAgendaSleep,
  agendaDateKey,
  agendaPersonalPlansPending,
  bookedAgendaDays,
  workingAgendaWeek,
} from "../../domain/rules/agenda-week.js";
import { calendarReplay } from "../../domain/rules/clock-state.js";
import type {
  CompactFoundingResult,
  parseCompactFoundingCompletion,
} from "../../domain/rules/compact-founding-rules.js";
import { conflict, notFound } from "../../domain/rules/errors.js";
import {
  completeFoundingTask,
  FOUNDING_AGENDA_SLOT,
  FOUNDING_AGENDA_SUBJECT,
  foundingSlot,
  foundingTaskRevision,
  ownsFoundingTask,
} from "../../domain/rules/founding-tasks.js";

import { routineVenues } from "../../domain/rules/prompt-preset.js";
import { activateVillagerDay, planRoutineDays } from "../../domain/rules/resident-agenda.js";
import { projectAgendaReservations } from "../../domain/rules/project-focus.js";
import { applyInitialIdentityDescription } from "../../domain/rules/resident-description.js";
import { randomVillageSeed } from "../../domain/rules/village-clock.js";
import type { backgroundJobSnapshot, backgroundWorkSummaries, queueBackgroundJob } from "../../jobs/background-work.js";
import type { proposeCompactFounding } from "../founding/founding-compact.js";
import type { reportFoundingProgress } from "../founding/founding-progress.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
import type { createWeeklyAgenda } from "./weekly-agenda-service.js";
import {
  AGENDA_WEEK_DAYS,
  agendaCalendar,
  applyWeeklyAgenda,
  hasUnfilledAgendaDate,
  shiftAgendaDate,
} from "../../domain/rules/weekly-agenda.js";
import { refreshWorkReservations } from "../../domain/rules/venue-work.js";
import type { WorkFailure } from "../../domain/rules/work-failure.js";
export interface ResidentAgendaPorts {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  reportFoundingProgress: typeof reportFoundingProgress;
  readEffectiveVillagerCard: typeof readEffectiveVillagerCard;
  readVillageLore: typeof readVillageLore;
  queueBackgroundJob: typeof queueBackgroundJob;
  backgroundJobSnapshot: typeof backgroundJobSnapshot;
  backgroundWorkSummaries: typeof backgroundWorkSummaries;
  parseCompactFoundingCompletion: typeof parseCompactFoundingCompletion;
  proposeCompactFounding: typeof proposeCompactFounding;
  weeklyAgenda: Pick<
    ReturnType<typeof createWeeklyAgenda>,
    "handler" | "queueResidentWeek" | "captureStartingWeek" | "captureFoundingBatch" | "planner"
  >;
}
/** A resident Agenda owns its specific saved-world, schedule, job and generation connections. */
export function createResidentAgendas(ports: ResidentAgendaPorts) {
  const {
    readVillageState,
    mutateVillageState,
    reportFoundingProgress,
    readEffectiveVillagerCard,
    readVillageLore,
    queueBackgroundJob,
    backgroundJobSnapshot,
    backgroundWorkSummaries,
    parseCompactFoundingCompletion,
    proposeCompactFounding,
    weeklyAgenda,
  } = ports;
  async function rollActiveAgendas(at?: Date, known?: VillageState, clockRevision?: number): Promise<boolean> {
    const clock = at ? undefined : await observeVillageClock();
    const now = at ?? (clock?.instant ? new ZonedDate(clock.instant, clock.timeZone) : villageNow());
    const revision = clockRevision ?? clock?.revision;
    const village = known ?? (await readVillageState());
    const today = agendaDateKey(now);
    if (
      village.villagers.every(
        ({ agenda }) =>
          !agenda ||
          (agenda.activeDay?.dateKey === today &&
            !activeAgendaSleep(agenda, now) &&
            !Object.keys(agenda.plannedDays ?? {}).some(
              (date) =>
                date >= today && agendaPersonalPlansPending(agenda, date) && !agenda.repairedDays?.includes(date),
            )),
      )
    )
      return false;
    let changed = false;
    await mutateVillageState((state) => {
      changed = false;
      if (revision !== undefined && state.clock?.revision !== revision) return;
      planRoutineDays(state, now);
      for (const villager of state.villagers) {
        if (villager.agenda?.activeDay?.dateKey !== agendaDateKey(now)) activateVillagerDay(villager, now, state);
      }
      changed = true;
    });
    return changed;
  }
  async function readFoundingResidentContext(characterId: string, agendaBatchSize = 1) {
    const village = await readVillageState({ memories: true });
    const villager = village.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    await reportFoundingProgress(village.seed, { stage: "reading" }, characterId);
    const effectiveCard = await readEffectiveVillagerCard(villager);
    if (!effectiveCard) {
      await mutateVillageState((state) => {
        const resident = state.villagers.find((entry) => entry.characterId === characterId);
        if (!resident) return;
        resident.agenda ??= unwrittenVillageAgenda(villageNow());
        resident.agenda.personalizationPending = false;
        resident.agenda.personalizationFailure =
          "Character identity is unavailable. Keep the existing Agenda and retry deliberately after restoring the card.";
      });
      return;
    }
    const agendaSetting = village.setting;
    await reportFoundingProgress(village.seed, { stage: "lore" }, characterId);
    let loreInspection: LoreInspection | undefined;
    const continuity = continuityPreparationContext(village, characterId, villageNow().toISOString());
    const context = {
      continuity: {
        fingerprint: continuity.fingerprint,
        sources: continuity.sources,
        protectionFingerprint: continuity.protectionFingerprint,
        protections: continuity.protections,
      },
      ...(villager.identityDescription && !villager.identityDescription.initialGenerationComplete
        ? { identityDescriptionRevision: villager.identityDescription.revision }
        : {}),
      card: effectiveCard,
      characterId,
      sourceRevision: foundingTaskRevision(village, characterId, "routine"),
      circumstances: {
        worldFacts: continuity.circumstances,
        worldRules: village.worldRules,
      },
      playerBackground: village.playerBackground,
      playerPersonaName: village.playerPersonaName,
      village: village.name,
      setting: [agendaSetting, village.worldName ? `Village world: ${JSON.stringify(village.worldName)}` : ""]
        .filter(Boolean)
        .join("\n"),
      home: (() => {
        const home = village.venues.find((venue) => venueResidentIds(venue).includes(characterId));
        return home ? [home.name, home.form].filter(Boolean).join("; ") : "";
      })(),
      wishes: continuity.wishes,
      lore: await readVillageLore(
        village.selectedLorebookIds,
        [
          agendaSetting,
          admissionLoreContext(village.worldName, [villager.admission]),
          effectiveCard.backstory,
          effectiveCard.name,
          effectiveCard.summary,
          effectiveCard.personality,
          effectiveCard.description,
          ...routineVenues(village.venues).map((venue) => venue.name),
        ].join("\n"),
        undefined,
        Math.floor(village.loreTokenBudget / agendaBatchSize),
        {
          inspect: (report) => {
            loreInspection = report;
          },
        },
      ),
      venues: routineVenues(village.venues),
    };
    return { ...context, loreUse: inspectedLoreUse(loreInspection, "Agenda") };
  }
  async function queueVillagerAgenda(characterId: string, finite = true, origin?: "founding"): Promise<void> {
    let village = await readVillageState({ memories: true });
    const villager = village.villagers.find((row) => row.characterId === characterId);
    if (!villager) return;
    const context = await readFoundingResidentContext(characterId);
    if (!context) throw new Error("Character identity is unavailable.");
    village = await readVillageState({ memories: true });
    if (context.sourceRevision !== foundingTaskRevision(village, characterId, "routine"))
      throw new Error("Resident context changed. Retry the Agenda.");
    const founding = origin === "founding";
    const revision = founding
      ? foundingTaskRevision(village, characterId, "routine")
      : agendaRevision(village, characterId);
    if (founding)
      await mutateVillageState(
        (state) => {
          const marker = state.foundingPreparation;
          if (
            state.seed !== village.seed ||
            !marker ||
            marker.tasksVersion !== 1 ||
            marker.status !== "pending" ||
            context.sourceRevision !== foundingTaskRevision(state, characterId, "routine")
          )
            throw new Error("Resident context changed. Retry the Agenda.");
          marker.tasks ??= {};
          marker.tasks[characterId] ??= {};
          const old = marker.tasks[characterId].routine;
          if (old?.revision !== revision)
            marker.tasks[characterId].routine = {
              contract: 1,
              revision,
              jobId: foundingSlot("routine", characterId),
              status: "pending",
              attempt: 0,
              error: "",
            };
        },
        { memories: true },
      );
    const start = agendaCalendar(village, founding && village.setupAt ? new Date(village.setupAt) : villageNow());
    const weekPlan = weeklyAgenda.captureStartingWeek(
      village,
      start,
      characterId,
      !!context.identityDescriptionRevision,
      context.lore,
    );
    await reportFoundingProgress(village.seed, { stage: "queued", loreEntryCount: context.lore.length }, characterId);
    await queueBackgroundJob({
      kind: "agenda",
      retryActionId: founding ? village.foundingPreparation?.retryActions?.at(-1) : undefined,
      subjectId: characterId,
      seed: village.seed,
      revision,
      finite,
      label: villager.cardSnapshot.name + "'s agenda",
      initialError: founding ? undefined : villager.agenda?.personalizationFailure,
      input: {
        seed: village.seed,
        characterId,
        foundingContract: founding ? 1 : undefined,
        revision,
        ...(weekPlan ? { weekPlan } : {}),
        context: {
          ...context,
          activityLabelFormat: 2,
        },
      },
    });
  }

  const agendaBackgroundHandler: Handler = {
    async refreshRetryInput(input, readState) {
      if (typeof input.weekActionId === "string") return weeklyAgenda.handler.refreshRetryInput!(input, readState);
    },
    recoverSavedResult: (input, steps) => {
      if (typeof input.weekActionId === "string") return weeklyAgenda.handler.recoverSavedResult!(input, steps);
      if (input.weekPlan) return weeklyAgenda.planner.recoverSavedResult(input.weekPlan, steps)?.starter;
      const key = "founding-routine-v2";
      const saved = steps.find((step) => step.key === key && step.status === "completed");
      if (!saved?.response) return undefined;
      return parseCompactFoundingCompletion(saved.response, input.context);
    },
    generate: async (input) => {
      if (typeof input.weekActionId === "string") return weeklyAgenda.handler.generate(input);
      const job = (await backgroundWorkSummaries()).find(
        (entry) => entry.kind === "agenda" && entry.subjectId === input.characterId,
      );
      await reportFoundingProgress(input.seed, { stage: "resolving", attempt: job?.attempt }, input.characterId);
      const onModel = async (modelName: string) => {
        await reportFoundingProgress(input.seed, { stage: "model", modelName }, input.characterId);
      };
      const saved = input.weekPlan ? undefined : readSavedBackgroundCheckpoint("founding-routine-v2");
      const result = input.weekPlan
        ? (await weeklyAgenda.planner.generate(input.weekPlan, onModel)).starter
        : saved
          ? parseCompactFoundingCompletion(saved, input.context)
          : await proposeCompactFounding(input.context, onModel);
      await reportFoundingProgress(input.seed, { stage: "applying" }, input.characterId);
      return result;
    },
    valid: (state, input, admission) =>
      typeof input.weekActionId === "string"
        ? weeklyAgenda.handler.valid(state, input, admission)
        : state.villagers.some((resident) => resident.characterId === input.characterId) &&
          input.context.continuity?.fingerprint === continuityContextRevision(state, input.characterId) &&
          (input.foundingContract === 1
            ? ownsFoundingTask(state, input.characterId, "routine", input.revision)
            : agendaRevision(state, input.characterId) === input.revision),
    apply: (state, input, result, context) => {
      if (typeof input.weekActionId === "string") return weeklyAgenda.handler.apply(state, input, result, context);
      const failure = applyAgenda(state, input.characterId, result.agenda, result.starterWeek);
      if (failure) return failure;
      const task = state.foundingPreparation?.tasks?.[input.characterId]?.routine;
      if (input.foundingContract === 1 && task?.revision === input.revision) task.lore = input.context.loreUse;
      const resident = state.villagers.find((row) => row.characterId === input.characterId);
      if (resident)
        applyInitialIdentityDescription(
          resident,
          input.context.identityDescriptionRevision,
          result.identityDescription,
        );
      if (input.foundingContract === 1) completeFoundingTask(state, input.characterId, "routine", input.revision);
    },
  };

  const REBUILD_SUBJECT = "rebuild";
  type StartingBatch = ({ foundingContract: 1 } | { rebuildActionId: string }) & {
    seed: string;
    weekPlan: ReturnType<typeof weeklyAgenda.captureFoundingBatch>;
    members: Array<{
      id: string;
      revision: string;
      descriptionRevision?: string;
      lore: ReturnType<typeof inspectedLoreUse>;
      repairs?: [string, string][];
    }>;
  };
  async function startingContexts(ids: readonly string[]) {
    const contexts = await Promise.all(ids.map((id) => readFoundingResidentContext(id, ids.length)));
    return contexts.map((context) => {
      if (!context) throw new Error("Character identity is unavailable.");
      return context;
    });
  }
  async function queueFoundingAgendas(ids: readonly string[], seed: string) {
    const admitted = await startingContexts(ids);
    const state = await readVillageState({ memories: true });
    const members: StartingBatch["members"] = admitted.map((context) => ({
      id: context.characterId,
      revision: context.sourceRevision,
      descriptionRevision: context.identityDescriptionRevision,
      lore: context.loreUse,
    }));
    const valid = (live: VillageState) =>
      live.seed === seed && members.every(({ id, revision }) => ownsFoundingTask(live, id, "routine", revision));
    if (!valid(state)) throw new Error("Resident context changed. Retry the Agendas.");
    const start = agendaCalendar(state, state.setupAt ? new Date(state.setupAt) : villageNow());
    const weekPlan = weeklyAgenda.captureFoundingBatch(
      state,
      start,
      admitted.map(({ characterId, identityDescriptionRevision, lore }) => ({
        id: characterId,
        describe: !!identityDescriptionRevision,
        lore,
      })),
    );
    await mutateVillageState(
      (live) => {
        if (!valid(live) || live.foundingPreparation?.status !== "pending")
          throw new Error("Resident context changed. Retry the Agendas.");
        for (const { id } of members) {
          const task = live.foundingPreparation.tasks![id]!.routine!;
          task.jobId = FOUNDING_AGENDA_SLOT;
          task.status = "running";
        }
      },
      { memories: true },
    );
    await reportFoundingProgress(seed, { stage: "queued" });
    await queueBackgroundJob({
      kind: "weekly-agenda",
      subjectId: FOUNDING_AGENDA_SUBJECT,
      seed,
      revision: backgroundRevision(members.map(({ id, revision }) => [id, revision])),
      finite: true,
      label: "Founding Agendas",
      retryActionId: state.foundingPreparation?.retryActions?.at(-1),
      input: { foundingContract: 1, seed, weekPlan, members } satisfies StartingBatch,
    });
  }
  function rebuildRevision(state: VillageState, id: string) {
    const resident = state.villagers.find(({ characterId }) => characterId === id);
    return (
      resident &&
      backgroundRevision([
        foundingTaskRevision(state, id, "routine"),
        resident.agenda?.generatedAt,
        resident.agenda?.manualWeek,
      ])
    );
  }
  function rebuildRepairs(state: VillageState, id: string, from: string): [string, string][] {
    const agenda = state.villagers.find(({ characterId }) => characterId === id)?.agenda;
    return (agenda?.repairedDays ?? [])
      .filter((date) => date >= from)
      .sort()
      .map((date) => [date, backgroundRevision(agenda?.plannedDays?.[date])]);
  }
  async function rebuildResidentAgendas(ids: readonly string[], actionId: string) {
    const initial = await readVillageState({ memories: true });
    const revision = backgroundRevision([REBUILD_SUBJECT, actionId]);
    const prior = await backgroundJobSnapshot("weekly-agenda", REBUILD_SUBJECT);
    if (prior?.seed === initial.seed && prior.revision === revision) return;
    if (initial.foundingPreparation && initial.foundingPreparation.status !== "ready")
      throw conflict("Complete Founding before rebuilding Agendas.");
    const start = agendaCalendar(initial, villageNow());
    const first = agendaDateKey(start);
    if (calendarReplay(initial, start)) throw conflict("Wait for Village time to catch up before rebuilding Agendas.");
    const revisions = ids.map((id) => rebuildRevision(initial, id));
    const repairs = ids.map((id) => rebuildRepairs(initial, id, first));
    if (revisions.some((revision) => !revision)) throw notFound("A selected villager no longer lives here.");
    if (
      (await backgroundWorkSummaries()).some(
        (job) =>
          ["queued", "running", "paused", "interrupted"].includes(job.status) &&
          ((job.kind === "agenda" && ids.includes(job.subjectId)) || job.kind === "weekly-agenda"),
      )
    )
      throw conflict("Wait for the current Agenda request to finish.");
    const contexts = await startingContexts(ids);
    const state = await readVillageState({ memories: true });
    if (
      state.seed !== initial.seed ||
      contexts.some(
        ({ characterId, sourceRevision }, index) =>
          sourceRevision !== foundingTaskRevision(state, characterId, "routine") ||
          revisions[index] !== rebuildRevision(state, characterId) ||
          JSON.stringify(repairs[index]) !== JSON.stringify(rebuildRepairs(state, characterId, first)),
      )
    )
      throw conflict("Resident context changed. Rebuild the Agendas again.");
    const weekPlan = weeklyAgenda.captureFoundingBatch(
      state,
      start,
      contexts.map(({ characterId, lore }) => ({ id: characterId, describe: false, lore })),
    );
    await queueBackgroundJob({
      kind: "weekly-agenda",
      subjectId: REBUILD_SUBJECT,
      seed: state.seed,
      revision,
      expectedAttempt: prior?.attempt ?? 0,
      expectedInstanceId: prior?.instanceId ?? null,
      finite: true,
      label: "Rebuild Agendas",
      input: {
        rebuildActionId: actionId,
        seed: state.seed,
        weekPlan,
        members: contexts.map(({ characterId, loreUse }, index) => ({
          id: characterId,
          lore: loreUse,
          revision: revisions[index]!,
          repairs: repairs[index],
        })),
      } satisfies StartingBatch,
    });
  }
  const startingBatch = (input: Record<string, unknown>) =>
    input.foundingContract === 1 || typeof input.rebuildActionId === "string";
  const weeklyAgendaBackgroundHandler: Handler = {
    ...weeklyAgenda.handler,
    async generate(input) {
      if (!startingBatch(input)) return weeklyAgenda.handler.generate(input);
      const { seed, weekPlan } = input as StartingBatch;
      if (input.rebuildActionId)
        return (await weeklyAgenda.planner.generate(weekPlan, undefined, REBUILD_SUBJECT)).starters;
      await reportFoundingProgress(seed, { stage: "resolving" });
      const result = await weeklyAgenda.planner.generate(
        weekPlan,
        async (modelName) => {
          await reportFoundingProgress(seed, { stage: "model", modelName });
        },
        FOUNDING_AGENDA_SUBJECT,
      );
      await reportFoundingProgress(seed, { stage: "applying" });
      return result.starters;
    },
    recoverSavedResult(input, steps) {
      return startingBatch(input)
        ? weeklyAgenda.planner.recoverSavedResult(input.weekPlan, steps)?.starters
        : weeklyAgenda.handler.recoverSavedResult!(input, steps);
    },
    refreshRetryInput(input, readState) {
      if (startingBatch(input)) return Promise.resolve(undefined);
      return weeklyAgenda.handler.refreshRetryInput!(input, readState);
    },
    valid(state, input, admission) {
      if (!startingBatch(input)) return weeklyAgenda.handler.valid(state, input, admission);
      const { members, weekPlan } = input as StartingBatch;
      if (input.rebuildActionId) {
        const now = agendaCalendar(state, villageNow());
        const today = agendaDateKey(now);
        return (
          !(state.foundingPreparation && state.foundingPreparation.status !== "ready") &&
          !calendarReplay(state, now) &&
          today >= weekPlan.start &&
          today <= weekPlan.end &&
          members.every(
            ({ id, revision, repairs }) =>
              rebuildRevision(state, id) === revision &&
              JSON.stringify((repairs ?? []).filter(([date]) => date >= today)) ===
                JSON.stringify(rebuildRepairs(state, id, today)),
          )
        );
      }
      return members.every(
        ({ id, revision }) =>
          state.foundingPreparation?.tasks?.[id]?.routine?.jobId === FOUNDING_AGENDA_SLOT &&
          ownsFoundingTask(state, id, "routine", revision),
      );
    },
    apply(state, input, result, context) {
      if (!startingBatch(input)) return weeklyAgenda.handler.apply(state, input, result, context);
      const staged = {
        ...state,
        villagers: structuredClone(state.villagers),
        foundingPreparation: structuredClone(state.foundingPreparation),
      };
      for (const [index, { id, revision, descriptionRevision, lore }] of (input as StartingBatch).members.entries()) {
        const starter = (result as CompactFoundingResult[])[index]!;
        const failure = applyAgenda(staged, id, starter.agenda, starter.starterWeek, input.rebuildActionId);
        if (failure) return failure;
        if (input.rebuildActionId) {
          continue;
        }
        const task = staged.foundingPreparation!.tasks![id]!.routine!;
        task.lore = lore;
        const resident = staged.villagers.find((row) => row.characterId === id)!;
        applyInitialIdentityDescription(resident, descriptionRevision, starter.identityDescription);
        completeFoundingTask(staged, id, "routine", revision);
      }
      state.villagers = staged.villagers;
      state.foundingPreparation = staged.foundingPreparation;
    },
  };

  /**
   * Put one agenda on one villager's record.
   *
   * Re-checked inside the mutation for the reason every other write here is: a
   * model call takes time, and a villager who was moved out while it was in flight
   * must not be written back onto a roster they have left. Silently doing nothing
   * is right in that case — the call was made for a villager who no longer
   * exists, and there is no error a player could act on.
   */
  function applyAgenda(
    state: VillageState,
    characterId: string,
    agenda: VillageAgenda,
    starter?: CompactFoundingResult["starterWeek"],
    rebuildActionId?: string,
  ): WorkFailure | undefined {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    if (state.foundingPreparation?.status === "pending" && state.foundingPreparation.currentId === characterId) {
      state.foundingPreparation.stage = "saving";
      state.foundingPreparation.stageStartedAt = villageNow().toISOString();
    }
    const previous = villager.agenda;
    const now = agendaCalendar(state, villageNow());
    const today = agendaDateKey(now);
    const rebuildToday = !!rebuildActionId && starter?.slots[0]?.date === today;
    const dayHasRolled = rebuildToday || previous?.activeDay?.dateKey !== today;
    const booked = previous ? bookedAgendaDays(previous, now) : {};
    villager.agenda = {
      ...agenda,
      calendarVersion: 1,
      recentChanges: previous?.recentChanges,
      plannedDays: rebuildActionId
        ? Object.fromEntries(Object.keys(booked).map((date) => [date, workingAgendaWeek().Monday!]))
        : {
            ...booked,
            ...Object.fromEntries(
              Object.entries(previous?.plannedDays ?? {}).filter(
                ([key]) =>
                  previous?.repairedDays?.includes(key) ||
                  previous?.reservations?.some((entry) => entry.dateKey === key),
              ),
            ),
          },
      repairedDays: rebuildActionId ? undefined : previous?.repairedDays,
      reservations: previous?.reservations ?? [],
      activeDay: dayHasRolled ? undefined : previous?.activeDay,
      personalizationAttemptDate: today,
    };
    if (starter) {
      if (dayHasRolled) activateVillagerDay(villager, now, state);
      const active = villager.agenda.activeDay!;
      let todayAfter = rebuildToday ? 0 : undefined;
      if (
        !rebuildToday &&
        starter.slots.some(({ date }) => date === today) &&
        !villager.agenda.repairedDays?.includes(today)
      ) {
        const minute = now.getHours() * 60 + now.getMinutes();
        const current = active.blocks.find((block) => block.startMinute <= minute && minute < block.endMinute);
        todayAfter = current && scheduledAgendaActivity(current) ? current.endMinute : minute;
        const cut = todayAfter;
        if (!previous?.reservations?.some((row) => row.dateKey === today && row.source !== "work"))
          villager.agenda.activeDay = {
            ...active,
            blocks: [
              ...active.blocks
                .filter((block) => block.startMinute < cut)
                .map((block) => ({ ...block, endMinute: Math.min(block.endMinute, cut) })),
              ...agenda
                .week![active.weekday]!.filter((block) => block.endMinute > cut)
                .map((block) => ({ ...block, startMinute: Math.max(block.startMinute, cut) })),
            ],
          };
      }
      projectAgendaReservations(state);
      refreshWorkReservations(state, now);
      const placed = new Set<string>();
      applyWeeklyAgenda(state, villager, now, starter.slots, starter.choices, {
        todayAfter,
        onPlaced: (date) => placed.add(date),
      });
      const first = shiftAgendaDate(calendarAt(now, starter.through, 720), 1 - AGENDA_WEEK_DAYS);
      if (hasUnfilledAgendaDate(villager, now, agendaDateKey(first), placed, todayAfter)) {
        villager.agenda = previous;
        return {
          cause: "missing_result",
          stage: "agenda",
          message: "The new plans could not fit the available times and places.",
        };
      }
      villager.agenda.starterWeekFrom = today > agendaDateKey(first) ? today : agendaDateKey(first);
      if (starter.through >= villager.agenda.starterWeekFrom) {
        villager.agenda.starterWeekThrough = starter.through;
        if (rebuildActionId) villager.agenda.manualWeek = { actionId: rebuildActionId, through: starter.through };
      }
    }
    planRoutineDays(state, now);
    if (!starter) {
      if (dayHasRolled) activateVillagerDay(villager, now, state);
      projectAgendaReservations(state);
    }
  }

  /** Discover missing agendas. The coordinator retains failures across dates and throttles provider requests. */
  async function queuePendingAgendas(village: VillageState, _now: Date): Promise<VillageState> {
    const pending = village.villagers.filter((resident) => resident.agenda?.personalizationPending === true);
    for (const resident of pending) await queueVillagerAgenda(resident.characterId, Boolean(resident.agendaGeneration));
    return readVillageState();
  }

  async function buildVillageAgendas(): Promise<VillageAgendaView[]> {
    const village = await readVillageState();
    return village.villagers.map(({ characterId, agenda }) => ({
      characterId,
      agenda: agenda
        ? {
            personalizationPending: agenda.personalizationPending,
            personalizationFailure: agenda.personalizationFailure,
          }
        : null,
    }));
  }

  /** Record a deliberate agenda revision before queuing it; repeated action IDs reuse the intent. */
  async function clearVillagerAgenda(characterId: string, actionId = randomVillageSeed()): Promise<void> {
    const village = await readVillageState({ memories: true });
    const resident = village.villagers.find((entry) => entry.characterId === characterId);
    if (!resident) throw notFound("That villager does not live here.");
    if (resident.agendaGeneration === actionId || resident.agenda?.manualWeek?.actionId === actionId) return;
    if (resident.agenda?.generatedAt && !resident.agenda.personalizationPending) {
      await weeklyAgenda.queueResidentWeek(village, characterId, actionId);
      return;
    }
    await mutateVillageState((state) => {
      const entry = state.villagers.find((entry) => entry.characterId === characterId);
      if (!entry || entry.agendaGeneration === actionId) return;
      entry.agendaGeneration = actionId;
      if (entry.agenda) {
        entry.agenda.personalizationPending = true;
        entry.agenda.personalizationFailure = "";
      }
    });
    await queueVillagerAgenda(characterId);
  }

  return {
    readFoundingResidentContext,
    rollActiveAgendas,
    queueVillagerAgenda,
    queuePendingAgendas,
    buildVillageAgendas,
    clearVillagerAgenda,
    agendaBackgroundHandler,
    weeklyAgendaBackgroundHandler,
    queueFoundingAgendas,
    rebuildResidentAgendas,
  };
}
export type ResidentAgendas = ReturnType<typeof createResidentAgendas>;
