import type { Handler } from "../../domain/models/background-model.js";
import type { VillageAgenda, VillageAgendaView, VillageState } from "../../domain/models/world.js";
import { unwrittenVillageAgenda } from "../../domain/rules/agenda-plan.js";
import { agendaBlocksFor, agendaDateKey, workingAgendaWeek } from "../../domain/rules/agenda-week.js";
import { badRequest, notFound } from "../../domain/rules/errors.js";
import {
  deriveInfluence,
  INFLUENCE_CATEGORIES,
  influenceSettings,
  validateRoutineDay,
} from "../../domain/rules/owned-routine.js";
import { remapVenues, villageCurrentSetting, villageFoundingSetting } from "../../domain/rules/prompt-preset.js";
import { activateVillagerDay, planRoutineDays } from "../../domain/rules/resident-agenda.js";
import {
  deriveVillageMoment,
  randomVillageSeed,
  VILLAGE_WEEKDAYS,
  villageDateLabel,
} from "../../domain/rules/village-clock.js";
import type { readEffectiveVillagerCard } from "../../adapters/engine/catalog.js";
import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import type { readNativeScheduleSnapshot } from "../../adapters/engine/native-schedules.js";
import type { backgroundWorkSummaries, queueBackgroundJob } from "../../jobs/background-work.js";
import type { parseCompactFoundingCompletion, proposeCompactFounding } from "../founding/founding-compact.js";
import type { reportFoundingProgress } from "../founding/founding-progress.js";
import type { rollActiveAgendas } from "../residents/agenda-roll.js";
import type { correctResidentWish, reserveInitialWishAllowance } from "../residents/wishes/wish-lifecycle.js";
import type { registerInitialWish } from "./wishes/wish-initial.js";
import type { mutateVillageState, readVillageState } from "../world/village-store.js";
import { agendaRevision } from "./agenda-revision.js";
export interface ResidentAgendaPorts {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  reportFoundingProgress: typeof reportFoundingProgress;
  readEffectiveVillagerCard: typeof readEffectiveVillagerCard;
  reserveInitialWishAllowance: typeof reserveInitialWishAllowance;
  readVillageLore: typeof readVillageLore;
  queueBackgroundJob: typeof queueBackgroundJob;
  backgroundWorkSummaries: typeof backgroundWorkSummaries;
  parseCompactFoundingCompletion: typeof parseCompactFoundingCompletion;
  proposeCompactFounding: typeof proposeCompactFounding;
  readNativeScheduleSnapshot: typeof readNativeScheduleSnapshot;
  rollActiveAgendas: typeof rollActiveAgendas;
  registerInitialWish: typeof registerInitialWish;
  correctResidentWish: typeof correctResidentWish;
}
/** A resident Agenda owns its specific saved-world, schedule, job and generation connections. */
export function createResidentAgendas(ports: ResidentAgendaPorts) {
  const {
    readVillageState,
    mutateVillageState,
    reportFoundingProgress,
    readEffectiveVillagerCard,
    reserveInitialWishAllowance,
    readVillageLore,
    queueBackgroundJob,
    backgroundWorkSummaries,
    parseCompactFoundingCompletion,
    proposeCompactFounding,
    readNativeScheduleSnapshot,
    rollActiveAgendas,
    registerInitialWish,
    correctResidentWish,
  } = ports;
  async function queueVillagerAgenda(characterId: string, finite = true): Promise<void> {
    const village = await readVillageState();
    const villager = village.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    await reportFoundingProgress(village.seed, { stage: "reading" }, characterId);
    const effectiveCard = await readEffectiveVillagerCard(villager);
    if (!effectiveCard) {
      await mutateVillageState((state) => {
        const resident = state.villagers.find((entry) => entry.characterId === characterId);
        if (!resident) return;
        resident.agenda ??= unwrittenVillageAgenda(state.venues, resident.cardSnapshot.name);
        resident.agenda.personalizationPending = false;
        resident.agenda.personalizationFailure =
          "Character identity is unavailable. Keep the existing routine and retry deliberately after restoring the card.";
      });
      return;
    }
    const agendaSetting =
      village.foundingPreparation?.status === "pending"
        ? villageFoundingSetting(village)
        : villageCurrentSetting(village);
    const initialWishAttemptId =
      village.foundingPreparation?.status === "pending"
        ? await reserveInitialWishAllowance(characterId, new Date())
        : undefined;
    await reportFoundingProgress(village.seed, { stage: "lore" }, characterId);
    const context = {
      card: effectiveCard,
      characterId,
      wishAttemptId: initialWishAttemptId,
      allowInitialWish: !!initialWishAttemptId,
      playerRole: village.playerRole,
      playerPersonaName: village.playerPersonaName,
      schedule: null,
      influenceHints: villager.scheduleInfluence?.enabled ? villager.agenda?.scheduleInfluenceSnapshot?.unresolved : [],
      village: village.name,
      setting: agendaSetting,
      home: (() => {
        const home = village.venues.find((venue) => venue.occupancy.residentCharacterId === characterId);
        return home ? [home.name, home.form, home.state.condition].filter(Boolean).join("; ") : "";
      })(),
      completedWishes: villager.completedWishes,
      activeWishes: villager.agenda?.wishes ?? [],
      lore: await readVillageLore(
        village.selectedLorebookIds,
        [
          agendaSetting,
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
      name: effectiveCard.name,
      summary: effectiveCard.summary,
      tags: effectiveCard.tags,
      personality: effectiveCard.personality,
      description: effectiveCard.description,
      routineSummary: "",
    };
    await reportFoundingProgress(village.seed, { stage: "queued", loreEntryCount: context.lore.length }, characterId);
    await queueBackgroundJob({
      kind: "agenda",
      subjectId: characterId,
      seed: village.seed,
      revision: agendaRevision(village, characterId),
      finite,
      label: villager.cardSnapshot.name + "'s agenda",
      legacyError: villager.agenda?.personalizationFailure,
      input: {
        seed: village.seed,
        characterId,
        initialWishAttemptId,
        revision: agendaRevision(village, characterId),
        context,
      },
    });
  }

  const agendaBackgroundHandler: Handler = {
    recoverSavedResult: (input, steps) => {
      const saved = steps.find((step) => step.key === "owned-routine-profile" && step.status === "completed");
      if (!saved?.response) return undefined;
      return parseCompactFoundingCompletion(saved.response, input.context).agenda;
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
      return result.agenda;
    },
    valid: (state, input) =>
      state.villagers.some((resident) => resident.characterId === input.characterId) &&
      agendaRevision(state, input.characterId) === input.revision,
    apply: (state, input, agenda) => applyAgenda(state, input.characterId, agenda, input.initialWishAttemptId),
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
    initialWishAttemptId?: string,
  ): void {
    const villager = state.villagers.find((entry) => entry.characterId === characterId);
    if (!villager) return;
    if (state.foundingPreparation?.status === "pending" && state.foundingPreparation.currentId === characterId) {
      state.foundingPreparation.stage = "saving";
      state.foundingPreparation.stageStartedAt = new Date().toISOString();
    }
    const previous = villager.agenda;
    const now = new Date();
    const initialAttempt = villager.wishLifecycle?.attempt;
    const acceptsInitialWish =
      !!initialWishAttemptId &&
      !!initialAttempt &&
      initialAttempt.id === initialWishAttemptId &&
      initialAttempt.dateKey === agendaDateKey(now) &&
      !initialAttempt.candidate;
    const weekday = VILLAGE_WEEKDAYS[(now.getDay() + 6) % 7]!;
    const nextDay = agenda.week?.[weekday] ?? workingAgendaWeek(state.venues, villager.cardSnapshot.name)[weekday]!;
    villager.agenda = {
      ...agenda,
      // Initial preparation alone may add a wish. A routine result cannot resurrect stale wishes.
      wishes: [...(previous?.wishes ?? []), ...(acceptsInitialWish ? agenda.wishes : [])]
        .filter((wish) => !villager.completedWishes.some((entry) => entry.wish.id === wish.id))
        .filter((wish, index, all) => all.findIndex((entry) => entry.id === wish.id) === index)
        .slice(0, previous?.wishes.length ? Math.max(previous.wishes.length, 2) : acceptsInitialWish ? 1 : 0),
      plannedDays: Object.fromEntries(
        Object.entries(previous?.plannedDays ?? {}).filter(
          ([key]) =>
            [...(previous?.wishActivities ?? []), ...(previous?.socialActivities ?? [])].some(
              (entry) => entry.dateKey === key,
            ) ||
            (previous?.projectWork &&
              key >= previous.projectWork.startsAt.slice(0, 10) &&
              key <= previous.projectWork.endsAt.slice(0, 10)),
        ),
      ),
      wishActivities: previous?.wishActivities ?? [],
      socialActivities: previous?.socialActivities ?? [],
      projectWork: previous?.projectWork,
      scheduleInfluenceSnapshot: previous?.scheduleInfluenceSnapshot,
      activeDay: {
        dateKey: agendaDateKey(now),
        weekday,
        blocks: previous?.activeDay?.dateKey === agendaDateKey(now) ? previous.activeDay.blocks : nextDay,
        scheduleInformed: false,
      },
      personalizationAttemptDate: agendaDateKey(now),
    };
    registerInitialWish(villager, now);
    if (initialAttempt && initialAttempt.id === initialWishAttemptId) {
      initialAttempt.candidate = villager.agenda.wishes[0];
      initialAttempt.reason = initialAttempt.candidate
        ? "Initial wish granted during preparation."
        : "No initial wish today.";
    }
    if (villager.agenda.week)
      for (const weekday of VILLAGE_WEEKDAYS) {
        const date = new Date(now);
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
            resident.agenda = unwrittenVillageAgenda(state.venues, resident.cardSnapshot.name);
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
        const next = deriveInfluence(weeks.get(resident.characterId) ?? null, resident, state);
        if (next.signature !== resident.agenda.scheduleInfluenceSnapshot?.signature) {
          for (const key of Object.keys(resident.agenda.plannedDays ?? {})) {
            if (
              key === resident.agenda.activeDay?.dateKey ||
              [...(resident.agenda.wishActivities ?? []), ...(resident.agenda.socialActivities ?? [])].some(
                (activity) => activity.dateKey === key,
              )
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
    const now = new Date(),
      initial = await readVillageState();
    await refreshVillagerRemaps(initial, now);
    await rollActiveAgendas(now);
    const village = await readVillageState();
    const snapshot = await readNativeScheduleSnapshot(
      now,
      village.villagers.map((resident) => resident.characterId),
    );
    const weeks = new Map(snapshot.schedules.map((schedule) => [schedule.characterId, schedule]));
    const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now });
    return village.villagers.map((resident) => ({
      characterId: resident.characterId,
      name: resident.cardSnapshot.name,
      missing: false,
      weekUnreadable: !snapshot.cardsReadable,
      addedAt: resident.addedAt,
      agenda: resident.agenda,
      completedWishes: [],
      ingestSchedule: resident.scheduleInfluence?.enabled === true,
      scheduleInfluence: influenceSettings(resident.scheduleInfluence),
      nativeSchedule: weeks.has(resident.characterId) ? { weekStart: "", days: {} } : null,
      effectiveDays: Object.fromEntries(
        Array.from({ length: 7 }, (_, offset) => {
          const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, 12);
          return [
            VILLAGE_WEEKDAYS[(date.getDay() + 6) % 7]!,
            resident.agenda ? agendaBlocksFor(resident.agenda, false, date) : [],
          ];
        }),
      ),
      wishHistoryCount: resident.wishLifecycle?.outcomeCount ?? 0,
      wishAttempt: resident.wishLifecycle?.attempt,
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

  /** Correct a false wish verdict without changing any separately confirmed world state. */
  async function correctCompletedWish(characterId: string, wishId: string): Promise<void> {
    await correctResidentWish(characterId, wishId);
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
    await refreshVillagerRemaps(await readVillageState(), new Date(), characterId);
  }
  return {
    queueVillagerAgenda,
    backfillAgendas,
    refreshVillagerRemaps,
    buildVillageAgendas,
    clearVillagerAgenda,
    correctCompletedWish,
    setVillagerScheduleInfluence,
    agendaBackgroundHandler,
  };
}
export type ResidentAgendas = ReturnType<typeof createResidentAgendas>;
