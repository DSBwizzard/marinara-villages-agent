import { venueResidentIds } from "../../domain/rules/venue-model.js";
import { continuityPreparationContext, continuityContextRevision } from "../../domain/rules/continuity-library.js";
import { admissionLoreContext } from "../../../shared/helpers/resident-admission.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { readEffectiveVillagerCard } from "../../adapters/engine/catalog.js";
import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import type { LoreInspection } from "../../../shared/contracts/lore.js";
import { inspectedLoreUse } from "../../domain/rules/lore-context.js";
import { observeVillageClock, villageNow } from "../../adapters/time/clock-gate.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { VillageAgenda, VillageAgendaView, VillageState } from "../../domain/models/world.js";
import { scheduledAgendaActivity, unwrittenVillageAgenda } from "../../domain/rules/agenda-plan.js";
import { agendaRevision } from "../../domain/rules/agenda-revision.js";
import { agendaDateKey, bookedAgendaDays } from "../../domain/rules/agenda-week.js";
import type {
  CompactFoundingResult,
  parseCompactFoundingCompletion,
} from "../../domain/rules/compact-founding-rules.js";
import { notFound } from "../../domain/rules/errors.js";
import {
  completeFoundingTask,
  foundingSlot,
  foundingTaskRevision,
  ownsFoundingTask,
} from "../../domain/rules/founding-tasks.js";

import { routineVenues } from "../../domain/rules/prompt-preset.js";
import { activateVillagerDay, planRoutineDays } from "../../domain/rules/resident-agenda.js";
import { projectAgendaReservations } from "../../domain/rules/project-focus.js";
import { applyInitialIdentityDescription } from "../../domain/rules/resident-description.js";
import { randomVillageSeed } from "../../domain/rules/village-clock.js";
import type { backgroundWorkSummaries, queueBackgroundJob } from "../../jobs/background-work.js";
import type { proposeCompactFounding } from "../founding/founding-compact.js";
import type { reportFoundingProgress } from "../founding/founding-progress.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
import type { createWeeklyAgenda } from "./weekly-agenda-service.js";
import { agendaCalendar, applyWeeklyAgenda, weeklyAgendaVenues } from "../../domain/rules/weekly-agenda.js";
import { refreshWorkReservations } from "../../domain/rules/venue-work.js";
import { routineProfileFromWeek } from "../../domain/rules/owned-routine.js";
export interface ResidentAgendaPorts {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  reportFoundingProgress: typeof reportFoundingProgress;
  readEffectiveVillagerCard: typeof readEffectiveVillagerCard;
  readVillageLore: typeof readVillageLore;
  queueBackgroundJob: typeof queueBackgroundJob;
  backgroundWorkSummaries: typeof backgroundWorkSummaries;
  parseCompactFoundingCompletion: typeof parseCompactFoundingCompletion;
  proposeCompactFounding: typeof proposeCompactFounding;
  weeklyAgenda: Pick<ReturnType<typeof createWeeklyAgenda>, "handler" | "queueResidentWeek">;
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
    if (
      village.villagers.every(
        (villager) => !villager.agenda || villager.agenda.activeDay?.dateKey === agendaDateKey(now),
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
  async function readFoundingResidentContext(characterId: string) {
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
        village.loreTokenBudget,
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
    await reportFoundingProgress(village.seed, { stage: "queued", loreEntryCount: context.lore.length }, characterId);
    const start = founding
      ? agendaCalendar(village, village.setupAt ? new Date(village.setupAt) : villageNow())
      : undefined;
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
        context: {
          ...context,
          activityLabelFormat: 1,
          ...(start
            ? { starterWeekStart: agendaDateKey(start), venues: weeklyAgendaVenues(village, characterId, start) }
            : {}),
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
      const result = await proposeCompactFounding(input.context, async (modelName) => {
        await reportFoundingProgress(input.seed, { stage: "model", modelName }, input.characterId);
      });
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
      const task = state.foundingPreparation?.tasks?.[input.characterId]?.routine;
      if (input.foundingContract === 1 && task?.revision === input.revision) task.lore = input.context.loreUse;
      const resident = state.villagers.find((row) => row.characterId === input.characterId);
      if (resident)
        applyInitialIdentityDescription(
          resident,
          input.context.identityDescriptionRevision,
          result.identityDescription,
        );
      applyAgenda(state, input.characterId, result.agenda, result.starterWeek);
      if (input.foundingContract === 1) completeFoundingTask(state, input.characterId, "routine", input.revision);
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
  ): void {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    if (state.foundingPreparation?.status === "pending" && state.foundingPreparation.currentId === characterId) {
      state.foundingPreparation.stage = "saving";
      state.foundingPreparation.stageStartedAt = villageNow().toISOString();
    }
    const previous = villager.agenda;
    const now = agendaCalendar(state, villageNow());
    const today = agendaDateKey(now);
    const dayHasRolled = previous?.activeDay?.dateKey !== today;
    villager.agenda = {
      ...agenda,
      calendarVersion: 1,
      recentChanges: previous?.recentChanges,
      plannedDays: {
        ...(previous ? bookedAgendaDays(previous, now) : {}),
        ...Object.fromEntries(
          Object.entries(previous?.plannedDays ?? {}).filter(
            ([key]) =>
              previous?.repairedDays?.includes(key) || previous?.reservations?.some((entry) => entry.dateKey === key),
          ),
        ),
      },
      repairedDays: previous?.repairedDays,
      reservations: previous?.reservations ?? [],
      activeDay: dayHasRolled ? undefined : previous?.activeDay,
      personalizationAttemptDate: today,
    };
    if (starter) {
      if (dayHasRolled) activateVillagerDay(villager, now, state);
      const active = villager.agenda.activeDay!;
      let todayAfter: number | undefined;
      if (starter.slots.some(({ date }) => date === today) && !villager.agenda.repairedDays?.includes(today)) {
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
      if (applyWeeklyAgenda(state, villager, now, starter.slots, starter.choices, { todayAfter }))
        villager.agenda.starterWeekThrough = starter.through;
      villager.agenda.week = starter.fallbackWeek;
      villager.agenda.routineProfile = routineProfileFromWeek(starter.fallbackWeek);
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
    const village = await readVillageState();
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
  };
}
export type ResidentAgendas = ReturnType<typeof createResidentAgendas>;
