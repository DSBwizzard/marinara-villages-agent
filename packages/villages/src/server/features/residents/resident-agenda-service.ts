import { admissionLoreContext } from "../../../shared/helpers/resident-admission.js";
import { calendarDate, copyDate, ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { readEffectiveVillagerCard } from "../../adapters/engine/catalog.js";
import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import type { readNativeScheduleSnapshot } from "../../adapters/engine/native-schedules.js";
import { observeVillageClock, villageNow } from "../../adapters/time/clock-gate.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { VillageAgenda, VillageAgendaView, VillageState } from "../../domain/models/world.js";
import { unwrittenVillageAgenda } from "../../domain/rules/agenda-plan.js";
import { agendaRevision } from "../../domain/rules/agenda-revision.js";
import { agendaBlocksFor, agendaDateKey, workingAgendaWeek } from "../../domain/rules/agenda-week.js";
import type { parseCompactFoundingCompletion } from "../../domain/rules/compact-founding-rules.js";
import { badRequest, notFound } from "../../domain/rules/errors.js";
import {
  completeFoundingTask,
  foundingSlot,
  foundingTaskRevision,
  ownsFoundingTask,
} from "../../domain/rules/founding-tasks.js";
import { openingPresence } from "../../domain/rules/opening-presence.js";
import {
  deriveInfluence,
  INFLUENCE_CATEGORIES,
  influenceSettings,
  validateRoutineDay,
} from "../../domain/rules/owned-routine.js";
import { remapVenues } from "../../domain/rules/prompt-preset.js";
import { activateVillagerDay, planRoutineDays } from "../../domain/rules/resident-agenda.js";
import { applyInitialIdentityDescription } from "../../domain/rules/resident-description.js";
import {
  deriveVillageMoment,
  randomVillageSeed,
  VILLAGE_WEEKDAYS,
  villageDateLabel,
} from "../../domain/rules/village-clock.js";
import type { backgroundWorkSummaries, queueBackgroundJob } from "../../jobs/background-work.js";
import type { proposeCompactFounding } from "../founding/founding-compact.js";
import type { reportFoundingProgress } from "../founding/founding-progress.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
export interface ResidentAgendaPorts {
  queueScheduleInfluence?(characterId: string): Promise<void>;
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  reportFoundingProgress: typeof reportFoundingProgress;
  readEffectiveVillagerCard: typeof readEffectiveVillagerCard;
  readVillageLore: typeof readVillageLore;
  queueBackgroundJob: typeof queueBackgroundJob;
  backgroundWorkSummaries: typeof backgroundWorkSummaries;
  parseCompactFoundingCompletion: typeof parseCompactFoundingCompletion;
  proposeCompactFounding: typeof proposeCompactFounding;
  readNativeScheduleSnapshot: typeof readNativeScheduleSnapshot;
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
    readNativeScheduleSnapshot,
  } = ports;
  async function rollActiveAgendas(at?: Date, known?: VillageState, clockRevision?: number): Promise<boolean> {
    const clock = at ? undefined : await observeVillageClock();
    const now = at ?? (clock?.instant ? new ZonedDate(clock.instant, clock.timeZone) : villageNow());
    const revision = clockRevision ?? clock?.revision;
    const village = known ?? (await readVillageState());
    if (village.villagers.every((villager) => villager.agenda?.activeDay?.dateKey === agendaDateKey(now))) return false;
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
    const village = await readVillageState();
    const villager = village.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    await reportFoundingProgress(village.seed, { stage: "reading" }, characterId);
    const effectiveCard = await readEffectiveVillagerCard(villager);
    if (!effectiveCard) {
      await mutateVillageState((state) => {
        const resident = state.villagers.find((entry) => entry.characterId === characterId);
        if (!resident) return;
        resident.agenda ??= unwrittenVillageAgenda(state.venues, resident.cardSnapshot.name, villageNow());
        resident.agenda.personalizationPending = false;
        resident.agenda.personalizationFailure =
          "Character identity is unavailable. Keep the existing routine and retry deliberately after restoring the card.";
      });
      return;
    }
    const agendaSetting = village.setting;
    await reportFoundingProgress(village.seed, { stage: "lore" }, characterId);
    const native = villager.scheduleInfluence?.enabled
      ? await readNativeScheduleSnapshot(villageNow(), [characterId])
      : null;
    const context = {
      ...(villager.identityDescription && !villager.identityDescription.initialGenerationComplete
        ? { identityDescriptionRevision: villager.identityDescription.revision }
        : {}),
      openingVersion: village.opening?.version,
      playerAgencyVersion: 1 as const,
      semanticVersion: 2 as const,
      card: effectiveCard,
      characterId,
      sourceRevision: foundingTaskRevision(village, characterId, "routine"),
      contractVersion: 2 as const,
      circumstances: {
        worldFacts: village.worldFacts,
        details: village.foundingDetails,
        imprint: village.scenarioImprint,
      },
      playerBackground: village.playerBackground,
      playerPersonaName: village.playerPersonaName,
      schedule: native?.schedules.find((row) => row.characterId === characterId) ?? null,
      influenceSettings: villager.scheduleInfluence,
      influenceHints: villager.scheduleInfluence?.enabled ? villager.agenda?.scheduleInfluenceSnapshot?.unresolved : [],
      village: village.name,
      setting: [agendaSetting, village.worldName ? `Village world: ${JSON.stringify(village.worldName)}` : ""]
        .filter(Boolean)
        .join("\n"),
      home: (() => {
        const home = village.venues.find((venue) => venue.occupancy.residentCharacterId === characterId);
        return home ? [home.name, home.form, home.description].filter(Boolean).join("; ") : "";
      })(),
      wishes: villager.wishes,
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
          ...remapVenues(village.venues).map((venue) => venue.name),
        ].join("\n"),
        undefined,
        village.loreTokenBudget,
      ),
      // The SENDABLE places: a wish is about something somebody does out in the
      // village, and "they would like to spend more time at home" is not a wish a
      // house can be named for. The houses are left out for the same reason the
      // translation leaves them out — see `remapVenues`.
      venues: remapVenues(village.venues),
    };
    return context;
  }
  async function queueVillagerAgenda(characterId: string, finite = true): Promise<void> {
    let village = await readVillageState();
    const villager = village.villagers.find((row) => row.characterId === characterId);
    if (!villager) return;
    const context = await readFoundingResidentContext(characterId);
    if (!context) throw new Error("Character identity is unavailable.");
    village = await readVillageState();
    if (context.sourceRevision !== foundingTaskRevision(village, characterId, "routine"))
      throw new Error("Resident context changed. Retry routine.");
    const founding = village.foundingPreparation?.tasksVersion === 1 && village.foundingPreparation.status !== "ready";
    const revision = founding
      ? foundingTaskRevision(village, characterId, "routine")
      : agendaRevision(village, characterId);
    if (founding)
      await mutateVillageState((state) => {
        const marker = state.foundingPreparation;
        if (
          state.seed !== village.seed ||
          !marker ||
          marker.status !== "pending" ||
          context.sourceRevision !== foundingTaskRevision(state, characterId, "routine")
        )
          throw new Error("Resident context changed. Retry routine.");
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
      });
    await reportFoundingProgress(village.seed, { stage: "queued", loreEntryCount: context.lore.length }, characterId);
    await queueBackgroundJob({
      kind: "agenda",
      retryActionId: founding ? village.foundingPreparation?.retryActions?.at(-1) : undefined,
      subjectId: characterId,
      seed: village.seed,
      revision,
      finite,
      label: villager.cardSnapshot.name + "'s agenda",
      legacyError: founding ? undefined : villager.agenda?.personalizationFailure,
      input: {
        seed: village.seed,
        characterId,
        foundingContract: founding ? 1 : undefined,
        revision,
        context,
      },
    });
  }

  const agendaBackgroundHandler: Handler = {
    recoverSavedResult: (input, steps) => {
      const saved = steps.find(
        (step) =>
          ["owned-routine-profile", "founding-routine-v1", "founding-routine-v2"].includes(step.key ?? "") &&
          step.status === "completed",
      );
      if (!saved?.response) return undefined;
      return parseCompactFoundingCompletion(saved.response, input.context);
    },
    generate: async (input) => {
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
    valid: (state, input) =>
      state.villagers.some((resident) => resident.characterId === input.characterId) &&
      (input.foundingContract === 1
        ? ownsFoundingTask(state, input.characterId, "routine", input.revision)
        : agendaRevision(state, input.characterId) === input.revision),
    apply: (state, input, result) => {
      const resident = state.villagers.find((row) => row.characterId === input.characterId);
      if (resident)
        applyInitialIdentityDescription(
          resident,
          input.context.identityDescriptionRevision,
          result.identityDescription,
        );
      applyAgenda(state, input.characterId, result.agenda ?? result);
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
  function applyAgenda(state: VillageState, characterId: string, agenda: VillageAgenda): void {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    if (state.foundingPreparation?.status === "pending" && state.foundingPreparation.currentId === characterId) {
      state.foundingPreparation.stage = "saving";
      state.foundingPreparation.stageStartedAt = villageNow().toISOString();
    }
    const previous = villager.agenda;
    const now = villageNow();
    const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
    const nextDay = agenda.week?.[weekday] ?? workingAgendaWeek(state.venues, villager.cardSnapshot.name)[weekday]!;
    villager.agenda = {
      ...agenda,
      plannedDays: Object.fromEntries(
        Object.entries(previous?.plannedDays ?? {}).filter(([key]) =>
          (previous?.socialActivities ?? []).some((entry) => entry.dateKey === key),
        ),
      ),
      socialActivities: previous?.socialActivities ?? [],
      scheduleInfluenceSnapshot: previous?.scheduleInfluenceSnapshot,
      activeDay:
        previous?.activeDay?.dateKey === agendaDateKey(now)
          ? previous.activeDay
          : { dateKey: agendaDateKey(now), weekday, blocks: nextDay, scheduleInformed: false },
      personalizationAttemptDate: agendaDateKey(now),
    };
    if (villager.agenda.week)
      for (const weekday of VILLAGE_WEEKDAYS) {
        const date = copyDate(now);
        date.setDate(now.getDate() + ((VILLAGE_WEEKDAYS.indexOf(weekday) - ((now.getDay() + 6) % 7) + 7) % 7));
        villager.agenda.week[weekday] = validateRoutineDay(villager.agenda.week[weekday]!, villager, state, date);
      }
    if (!previous?.activeDay || previous.activeDay.dateKey !== agendaDateKey(now)) {
      villager.agenda.activeDay = undefined;
      planRoutineDays(state, now);
      activateVillagerDay(villager, now, state);
    }
  }

  /** Discover missing agendas. The coordinator retains failures across dates and throttles provider requests. */
  async function backfillAgendas(village: VillageState, _now: Date): Promise<VillageState> {
    const pending = village.villagers.filter((resident) => resident.agenda?.personalizationPending === true);
    if (village.villagers.some((resident) => resident.agenda === null))
      await mutateVillageState((state) => {
        for (const resident of state.villagers)
          if (!resident.agenda) {
            resident.agenda = unwrittenVillageAgenda(state.venues, resident.cardSnapshot.name, villageNow());
            resident.agenda.personalizationPending = false;
          }
      });
    // Only explicitly admitted new/regen profiles are eligible, never missing legacy data.
    for (const resident of pending) await queueVillagerAgenda(resident.characterId, Boolean(resident.agendaGeneration));
    return readVillageState();
  }

  /** Normalize preferences locally without altering today's persisted plan. */
  async function refreshVillagerRemaps(village: VillageState, now: Date, only?: string): Promise<void> {
    const snapshot = await readNativeScheduleSnapshot(
      now,
      village.villagers.map((resident) => resident.characterId),
    );
    if (!snapshot.cardsReadable) return;
    const weeks = new Map(snapshot.schedules.map((schedule) => [schedule.characterId, schedule]));
    await mutateVillageState((state) => {
      for (const resident of state.villagers) {
        if ((only && resident.characterId !== only) || !resident.agenda) continue;
        const next = deriveInfluence(weeks.get(resident.characterId) ?? null, resident, state, now);
        if (next.signature !== resident.agenda.scheduleInfluenceSnapshot?.signature) {
          for (const key of Object.keys(resident.agenda.plannedDays ?? {})) {
            if (
              key === resident.agenda.activeDay?.dateKey ||
              (resident.agenda.socialActivities ?? []).some((activity) => activity.dateKey === key)
            )
              continue;
            delete resident.agenda.plannedDays![key];
          }
          resident.agenda.scheduleInfluenceSnapshot = next;
        }
      }
      planRoutineDays(state, now);
    });
  }

  /** Resolve owned days and refresh optional local preferences; no paid work is dispatched. */
  async function buildVillageAgendas(): Promise<VillageAgendaView[]> {
    const now = villageNow(),
      initial = await readVillageState();
    await refreshVillagerRemaps(initial, now);
    await rollActiveAgendas();
    const village = await readVillageState();
    const snapshot = await readNativeScheduleSnapshot(
      now,
      village.villagers.map((resident) => resident.characterId),
    );
    const weeks = new Map(snapshot.schedules.map((schedule) => [schedule.characterId, schedule]));
    const moment = deriveVillageMoment({
      foundedAt: village.foundedAt,
      seed: village.seed,
      timeZone: village.timeZone || undefined,
      now,
    });
    return village.villagers.map((resident) => ({
      canInterpretSchedule: resident.agenda?.routineProfile?.semanticVersion === 2,
      characterId: resident.characterId,
      name: resident.cardSnapshot.name,
      missing: false,
      weekUnreadable: !snapshot.cardsReadable,
      addedAt: resident.addedAt,
      agenda:
        openingPresence(village, resident.characterId) && resident.agenda
          ? { ...resident.agenda, routineSummary: openingPresence(village, resident.characterId)!.activity }
          : resident.agenda,
      ingestSchedule: resident.scheduleInfluence?.enabled === true,
      scheduleInfluence: influenceSettings(resident.scheduleInfluence),
      nativeSchedule: weeks.has(resident.characterId) ? { weekStart: "", days: {} } : null,
      effectiveDays: Object.fromEntries(
        Array.from({ length: 7 }, (_, offset) => {
          const date = calendarDate(now, now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
          return [
            VILLAGE_WEEKDAYS[(date.getDay() + 6) % 7]!,
            openingPresence(village, resident.characterId)
              ? [{ startMinute: 0, endMinute: 1440, ...openingPresence(village, resident.characterId)! }]
              : resident.agenda
                ? agendaBlocksFor(resident.agenda, false, date)
                : [],
          ];
        }),
      ),
      remap: null,
      weekStart: "",
      stale: false,
      missingMoves: 0,
      remapFailure: null,
      fallback: "",
      remapPrompt: null,
      signature: "",
      days: Array.from({ length: 7 }, (_, offset) => ({
        weekday: VILLAGE_WEEKDAYS[(((now.getDay() + 6) % 7) + offset) % 7]!,
        dateLabel: villageDateLabel(village.foundedAt, moment.dayIndex + offset),
        isToday: offset === 0,
        blocks: [],
      })),
    }));
  }

  /** Record a deliberate agenda revision before queuing it; repeated action IDs reuse the intent. */
  async function clearVillagerAgenda(characterId: string, actionId = randomVillageSeed()): Promise<void> {
    const village = await readVillageState();
    const resident = village.villagers.find((entry) => entry.characterId === characterId);
    if (!resident) throw notFound("That villager does not live here.");
    if (resident.agendaGeneration === actionId) return;
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

  async function setVillagerScheduleInfluence(characterId: string, value: unknown): Promise<void> {
    const raw = value as { enabled?: unknown; categories?: Record<string, unknown> };
    if (
      !raw ||
      typeof raw !== "object" ||
      (raw.enabled !== undefined && typeof raw.enabled !== "boolean") ||
      (raw.categories !== undefined &&
        (!raw.categories ||
          typeof raw.categories !== "object" ||
          Object.entries(raw.categories).some(
            ([key, value]) =>
              !INFLUENCE_CATEGORIES.includes(key as (typeof INFLUENCE_CATEGORIES)[number]) ||
              typeof value !== "boolean",
          )))
    )
      throw badRequest("Choose valid schedule influence settings.");
    await mutateVillageState((state) => {
      const resident = state.villagers.find((entry) => entry.characterId === characterId);
      if (!resident) throw notFound("That villager does not live here.");
      const previous = influenceSettings(resident.scheduleInfluence);
      resident.scheduleInfluence = influenceSettings({
        ...previous,
        ...raw,
        categories: { ...previous.categories, ...raw.categories },
      });
      resident.ingestSchedule = resident.scheduleInfluence.enabled;
    });
    await ports.queueScheduleInfluence?.(characterId);
    await refreshVillagerRemaps(await readVillageState(), villageNow(), characterId);
  }
  return {
    adoptFoundingRoutine: (state: VillageState, id: string, agenda: VillageAgenda, revision: string) => {
      applyAgenda(state, id, agenda);
      completeFoundingTask(state, id, "routine", revision);
    },
    readFoundingResidentContext,
    rollActiveAgendas,
    queueVillagerAgenda,
    backfillAgendas,
    refreshVillagerRemaps,
    buildVillageAgendas,
    clearVillagerAgenda,
    setVillagerScheduleInfluence,
    agendaBackgroundHandler,
  };
}
export type ResidentAgendas = ReturnType<typeof createResidentAgendas>;
