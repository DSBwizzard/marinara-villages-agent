import type { Handler } from "../../domain/models/background-model.js";
import { defaultVillageState } from "../../domain/decoding/village-codec.js";
import type {
  VillageChronicleEntry,
  VillageChronicleEntryView,
  VillageOpportunity,
  VillageResidence,
  VillageSnapshot,
  VillageVenue,
} from "../../domain/models/world.js";
import { agendaAt, agendaDayPlan } from "../../domain/rules/agenda-plan.js";
import { asTrimmedString } from "../../domain/rules/coerce.js";
import { badRequest, notFound } from "../../domain/rules/errors.js";
import { selectPromptMemories } from "../../domain/rules/memory-selection.js";
import { addRoutineIdea } from "../../domain/rules/owned-routine.js";
import {
  boundText,
  MAX_CHRONICLE_LENGTH,
  MAX_HAPPENINGS,
  prependHappenings,
  villageCurrentSetting,
} from "../../domain/rules/prompt-preset.js";
import type { NativeRoutine } from "../../domain/rules/schedule-rules.js";
import { socialContinuationValid, socialPlanCandidates } from "../../domain/rules/social-rules.js";
import { venueCardProfile } from "../../domain/rules/venue-writing.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import { deriveVillageMoment, VILLAGE_WEEKDAYS, villageDateLabel } from "../../domain/rules/village-clock.js";
import { readPlayerIdentity, villagerPlaceView } from "../../domain/rules/village-projections.js";
import { wishExpired } from "../../domain/rules/wish-definition.js";
import { isVillageFounded } from "../../domain/rules/world-snapshot.js";
import {
  buildReturnRecap,
  creativeOpportunity,
  localDateKey,
  rememberedFor,
  sharedMemoryFor,
  storyAllowance,
} from "../../domain/rules/world-story.js";
import type { VillageTickContext } from "../founding/village-bootstrap.js";
import { backgroundRevision } from "../../jobs/background-work.js";
import type { villagesLogger } from "../../adapters/engine/runtime-host.js";
import type { listVillagerCards, readEffectiveVillagerCard } from "../../adapters/engine/catalog.js";
import type { readVillageLore } from "../../adapters/engine/lorebooks.js";
import type { outsideVenueOperation } from "../../adapters/operations/operation-context.js";
import type { completeVillageResidence, retryResidencePrivateSpaceAdaptation } from "../venues/residences.js";
import type { backfillAgendas, refreshVillagerRemaps } from "../residents/resident-agendas.js";
import type { queueBackgroundJob } from "../../jobs/background-work.js";
import type { preparePrivateSpaces } from "../../jobs/private-space-preparation.js";
import type { proposeHappenings, proposeReaction } from "../founding/village-bootstrap.js";
import type { reconcileProjectLifecycles } from "../../domain/rules/project-lifecycle-rules.js";
import type { rollActiveAgendas } from "../residents/agenda-roll.js";
import type { relationshipWritingPrompt } from "../../domain/rules/relationship-presentation.js";
import type { expireResidentWishes, reconcileWishLifecycle } from "../residents/wishes/wish-lifecycle.js";
import type { respondDueVenueMail } from "../venues/venue-mailbox.js";
import type { buildVillageSnapshot } from "./snapshot.js";
import type { readVillageState, mutateVillageState } from "./village-store.js";

export interface WorldCoordinationPorts {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
  buildVillageSnapshot: typeof buildVillageSnapshot;
  villagesLogger: typeof villagesLogger;
  listVillagerCards: typeof listVillagerCards;
  readEffectiveVillagerCard: typeof readEffectiveVillagerCard;
  readVillageLore: typeof readVillageLore;
  outsideVenueOperation: typeof outsideVenueOperation;
  completeVillageResidence: typeof completeVillageResidence;
  retryResidencePrivateSpaceAdaptation: typeof retryResidencePrivateSpaceAdaptation;
  backfillAgendas: typeof backfillAgendas;
  refreshVillagerRemaps: typeof refreshVillagerRemaps;
  queueBackgroundJob: typeof queueBackgroundJob;
  preparePrivateSpaces: typeof preparePrivateSpaces;
  proposeHappenings: typeof proposeHappenings;
  proposeReaction: typeof proposeReaction;
  reconcileProjectLifecycles: typeof reconcileProjectLifecycles;
  rollActiveAgendas: typeof rollActiveAgendas;
  relationshipWritingPrompt: typeof relationshipWritingPrompt;
  expireResidentWishes: typeof expireResidentWishes;
  reconcileWishLifecycle: typeof reconcileWishLifecycle;
  respondDueVenueMail: typeof respondDueVenueMail;
}

/** Owns world advancement and history connections. Construction never reads, writes or dispatches work. */
export function createWorldCoordination({
  readVillageState,
  mutateVillageState,
  buildVillageSnapshot,
  villagesLogger,
  listVillagerCards,
  readEffectiveVillagerCard,
  readVillageLore,
  outsideVenueOperation,
  completeVillageResidence,
  retryResidencePrivateSpaceAdaptation,
  backfillAgendas,
  refreshVillagerRemaps,
  queueBackgroundJob,
  preparePrivateSpaces,
  proposeHappenings,
  proposeReaction,
  reconcileProjectLifecycles,
  rollActiveAgendas,
  relationshipWritingPrompt,
  expireResidentWishes,
  reconcileWishLifecycle,
  respondDueVenueMail,
}: WorldCoordinationPorts) {
  /**
   * Put the village back to how it was before it was founded.
   *
   * This is the destructive half of the pair the General settings panel offers,
   * and it is deliberately total: homes, villagers, their conversations, the
   * places, the notices, the narration style, the player's own details and the
   * uploaded map all go, and the clock starts over from the founding day. A
   * "start over" that quietly kept some of it would be worse than not offering it.
   */
  async function resetVillage(): Promise<VillageSnapshot> {
    await mutateVillageState((state) => {
      Object.assign(state, defaultVillageState());
    });
    return buildVillageSnapshot();
  }

  /**
   * Advance the village from its durable high-water mark to one exact instant.
   * Required local state is committed before optional narration is requested, so
   * an unavailable model can never stop time, schedules or wishes.
   */
  async function reconcileVillage(
    options: { forceStory?: boolean; now?: Date; actionId?: string; expectedAttempt?: number } = {},
  ): Promise<VillageSnapshot> {
    const forced = options.forceStory === true;
    const now = options.now ?? new Date();
    let recorded = await readVillageState();
    if (!isVillageFounded(recorded)) return buildVillageSnapshot(now);
    if (recorded.foundingPreparation && recorded.foundingPreparation.status !== "ready")
      return buildVillageSnapshot(now);
    let completedMove = false;
    for (const residence of recorded.residences) {
      if (residence.status !== "moving" || Date.parse(residence.completesAt ?? "") > now.getTime()) continue;
      try {
        await completeVillageResidence(residence.characterId, false, now, false);
        completedMove = true;
      } catch (error) {
        villagesLogger().warn("[villages] pending move could not complete: %s", String(error));
      }
    }
    if (completedMove) recorded = await readVillageState();
    await mutateVillageState((state) => {
      reconcileProjectLifecycles(state, now);
    });
    recorded = await readVillageState();
    const moment = deriveVillageMoment({ foundedAt: recorded.foundedAt, seed: recorded.seed, now });
    const previousThrough = recorded.simulatedThrough || recorded.foundedAt || moment.instant;
    const previousMs = Date.parse(previousThrough);
    const currentMs = Date.parse(moment.instant);
    const elapsedMs =
      Number.isFinite(previousMs) && Number.isFinite(currentMs) ? Math.max(0, currentMs - previousMs) : 0;

    // These are deterministic reconciliation rules. They run for both the live
    // timer and restart catch-up, irrespective of story pace.
    await mutateVillageState((state) => {
      for (const resident of state.villagers) {
        const expired = resident.agenda?.wishes.filter((wish) => wishExpired(wish, now.getTime())) ?? [];
        if (expired.length)
          state.wishRefillIntents[resident.characterId] = {
            id: backgroundRevision(expired.map((wish) => wish.id)),
            settled: expired.map((wish) => wish.wish).join("; "),
          };
        expireResidentWishes(resident, now);
      }
    });
    await rollActiveAgendas(now);
    await mutateVillageState((state) => {
      const storedMs = Date.parse(state.simulatedThrough);
      if (!Number.isFinite(storedMs) || currentMs > storedMs) state.simulatedThrough = moment.instant;
      state.lastKnownTimeZone = moment.timeZone;
      const discoveries: VillageChronicleEntry[] = [];
      for (const venue of state.venues) {
        for (const zone of venueZones(venue)) {
          const remaining = [] as NonNullable<VillageVenue["state"]["traces"]>;
          for (const trace of zone.state.traces ?? []) {
            if (trace.expiresAt && Date.parse(trace.expiresAt) <= currentMs) continue;
            if (trace.kind === "scene-note") {
              remaining.push(trace);
              continue;
            }
            const created = Date.parse(trace.createdAt);
            if (!Number.isFinite(created) || currentMs - created < 60_000) {
              remaining.push(trace);
              continue;
            }
            const present = state.villagers.filter((villager) => {
              const destination = villagerPlaceView(state, villager, null, moment.minuteOfDay, now);
              return destination?.id === venue.id && destination.zoneId === zone.id;
            });
            const finders = present.filter((villager) =>
              trace.kind === "note"
                ? villager.characterId === trace.recipientId
                : !(trace.seenBy ?? []).includes(villager.characterId),
            );
            for (const finder of finders) {
              const id = `${trace.id}:found:${finder.characterId}`;
              if (state.chronicle.some((entry) => entry.id === id)) continue;
              discoveries.push({
                id,
                dayIndex: moment.dayIndex,
                clock: moment.dayPhase,
                occurredAt: moment.instant,
                timePrecision: "exact",
                scope: "private",
                actors: [{ id: finder.characterId, name: finder.cardSnapshot.name }],
                kind: "chat",
                text:
                  trace.kind === "note"
                    ? `${finder.cardSnapshot.name} found a note at ${venue.name}: ${trace.text}`
                    : `${finder.cardSnapshot.name} noticed ${trace.text} at ${venue.name}.`,
              });
            }
            if (trace.kind !== "note" || finders.length === 0)
              remaining.push({
                ...trace,
                seenBy: [...new Set([...(trace.seenBy ?? []), ...finders.map((finder) => finder.characterId)])],
              });
          }
          zone.state.traces = remaining;
        }
      }
      if (discoveries.length) state.chronicle = [...discoveries, ...state.chronicle];
    });

    // Discover optional paid work only after deterministic advancement has committed.
    await respondDueVenueMail(now);
    // Initial space preparation retains the founding generation path; begin it only after local advancement.
    outsideVenueOperation(() => {
      void preparePrivateSpaces().catch(() => {});
    });
    const pendingRooms = (await readVillageState()).venues.flatMap(
      (venue) => venue.privateSpaces?.filter((room) => room.adaptationPending).map((room) => room.ownerId) ?? [],
    );
    for (const characterId of new Set(pendingRooms)) await retryResidencePrivateSpaceAdaptation(characterId);
    const withAgendas = await backfillAgendas(await readVillageState(), now);
    await refreshVillagerRemaps(withAgendas, now);
    await reconcileWishLifecycle(now);
    const village = await readVillageState();
    const dateKey = localDateKey(now);
    const remainingSocialEvents =
      storyAllowance(village.storyPace, village.seed, dateKey) -
      village.happenings.filter((entry) => localDateKey(new Date(entry.occurredAt)) === dateKey).length;
    const activeSocialPlan =
      !forced && village.storyPace !== "off" && remainingSocialEvents > 0
        ? village.relationshipContext?.socialPlans.find(
            (plan) =>
              plan.status === "planned" &&
              plan.kind === "meeting" &&
              plan.dateKey === dateKey &&
              plan.startMinute <= moment.minuteOfDay &&
              plan.endMinute > moment.minuteOfDay,
          )
        : undefined;
    const shouldCreateStory =
      forced || (village.storyPace !== "off" && (village.lastCreativeDate < dateKey || !!activeSocialPlan));
    if (!shouldCreateStory) {
      const snapshot = await buildVillageSnapshot(now);
      return { ...snapshot, recap: buildReturnRecap(village, previousThrough, moment.instant, elapsedMs) };
    }

    const routines = new Map<string, NativeRoutine>();
    const opportunity: VillageOpportunity | null = activeSocialPlan
      ? {
          id: activeSocialPlan.id + ":encounter",
          kind: "encounter",
          startsAt: now.toISOString(),
          endsAt: now.toISOString(),
          actorIds: activeSocialPlan.actorIds,
          venueId: activeSocialPlan.venueId,
          zoneId: activeSocialPlan.zoneId,
          facts: [activeSocialPlan.activity, "An accepted free-time plan is happening now."],
        }
      : creativeOpportunity(village, routines, moment, previousThrough);
    if (!opportunity) {
      const snapshot = await buildVillageSnapshot(now);
      return { ...snapshot, recap: buildReturnRecap(village, previousThrough, moment.instant, elapsedMs) };
    }
    await mutateVillageState((state) => {
      if (state.processedOpportunityIds.includes(opportunity.id)) return;
      const withoutDuplicate = state.opportunities.filter((entry) => entry.id !== opportunity.id);
      state.opportunities = [...withoutDuplicate, opportunity].slice(-256);
    });
    const narrationMemories = selectPromptMemories(
      village.chronicle,
      village.villagers.map((villager) => villager.characterId),
      opportunity.facts.join(" "),
      900,
    );
    const context: VillageTickContext = {
      village: village.name,
      playerRole: village.playerRole,
      playerPersonaName: village.playerPersonaName,
      setting: village.setting,
      worldFacts: village.worldFacts,
      lore: await readVillageLore(
        village.selectedLorebookIds,
        [
          villageCurrentSetting(village),
          opportunity.facts.join(" "),
          village.venues.find((venue) => venue.id === opportunity.venueId)?.name ?? "",
        ].join("\n"),
        undefined,
        village.loreTokenBudget,
      ),
      moment,
      // Taken off the record rather than off `now`, because it is only ever used
      // as a lower bound for the date labels on the memory block and the founding
      // stamp is what those labels are measured from.
      foundedAt: village.foundedAt,
      at: now.toISOString(),
      residents: village.villagers.map((villager) => {
        const card = readEffectiveVillagerCard(villager);
        // Their whole day, block by block, off the schedule read taken above —
        // the very list `blockAt` already searched to find this hour. The times
        // live only in the Engine's raw week and the words only in the stored
        // translation, so this join is the only place either half becomes a day
        // somebody could be written into: without it the narrator knows one
        // clause about each person and can only honestly write weather.
        const today = agendaDayPlan(villager.agenda, moment.minuteOfDay, now, villager.ingestSchedule !== false);
        return {
          characterId: villager.characterId,
          name: card.name,
          summary: card.summary,
          tags: card.tags,
          profile: venueCardProfile(card, readPlayerIdentity(village).name),
          // What they are doing, said the way it happens here. A miss answers with
          // the village's own default rather than with the Engine's sentence,
          // which is the leak this whole file exists to close: see
          // `VILLAGE_UNTRANSLATED_ACTIVITY`.
          doing: agendaAt(villager.agenda, moment.minuteOfDay, now, villager.ingestSchedule !== false)?.activity ?? "",
          // And whether this hour is theirs at all, off the VERY SAME block the
          // sentence above came from. Two lookups would be two chances to pick
          // different blocks, and a villager recorded as asleep during their own
          // shift is exactly that bug with a narrator's voice on it.
          status: agendaAt(villager.agenda, moment.minuteOfDay, now, villager.ingestSchedule !== false)?.status ?? "",
          // The one-line description of an ordinary day, in the village's words
          // when it has any. It travels separately from the agenda rather than
          // being left for the block to pick off `agenda.routineSummary`, because
          // the sentence the narrator reads and the sentence the agenda holds are
          // two different facts about the same person and only one of them is true
          // here.
          //
          // The Engine's own summary is not allowed to stand in for a missing
          // translation, which is the second half of the same leak: an agenda
          // marked `native` holds the Engine's sentence word for word, and it is
          // prose about a life this village may have no room for. Only the
          // village's own writing is allowed here, and a villager with neither has
          // nothing said about their ordinary day at all — a shorter prompt rather
          // than a wrong one.
          routine: villager.agenda?.routineSummary ?? "",
          // Their whole day, block by block — see above.
          today,
          // And the shape of the rest of the week, so one day of somebody's life
          // does not read as the whole of it. Also a join, and also free.
          week: VILLAGE_WEEKDAYS.filter((day) => day !== moment.weekday).flatMap(
            (day) => villager.agenda?.week?.[day]?.map((block) => block.activity) ?? [],
          ),
          agenda: villager.agenda,
          remembered: rememberedFor(narrationMemories, villager.characterId),
        };
      }),
      recent: village.happenings.map((entry) => entry.text),
      memory: sharedMemoryFor(
        narrationMemories,
        village.happenings.map((entry) => entry.text),
      ),
      noticeboard: village.noticeboard,
      venues: village.venues,
      pendingVenueNames: village.pendingDecisions
        .filter(
          (decision) => decision.kind === "venue" && decision.status !== "approved" && decision.status !== "denied",
        )
        .map((decision) => decision.venueDraft?.name ?? decision.title),
      pendingHousingCharacterIds: [
        ...village.residences.filter((entry) => entry.status !== "current").map((entry) => entry.characterId),
        ...village.pendingDecisions
          .filter((decision) => decision.kind === "venue-upgrade" && decision.status === "pending")
          .map((decision) => decision.requesterCharacterId ?? ""),
      ],
      social:
        !forced && village.storyPace !== "off"
          ? {
              candidates:
                !activeSocialPlan && storyAllowance(village.storyPace, village.seed, dateKey) > 1
                  ? socialPlanCandidates(village, now)
                  : [],
              relationships: opportunity.actorIds.map((actorId) => relationshipWritingPrompt(village, actorId)),
            }
          : undefined,
      opportunities: [opportunity],
      lastSimulatedAt: previousThrough,
      forced,
    };
    await queueBackgroundJob({
      kind: "story",
      subjectId: activeSocialPlan ? "social:" + activeSocialPlan.id : "village",
      seed: village.seed,
      revision: forced ? "manual:" + (options.actionId ?? opportunity.id) : dateKey,
      finite: forced,
      label: forced ? "Requested village event" : "Today's village story",
      automaticDate: forced ? undefined : dateKey,
      expectedAttempt: forced ? options.expectedAttempt : undefined,
      input: {
        context,
        forced,
        socialPlanId: activeSocialPlan?.id,
        socialPlan: activeSocialPlan,
        dateKey,
        opportunity,
        moment,
        now: now.toISOString(),
        actorIncarnations: Object.fromEntries(
          opportunity.actorIds.map((id) => [
            id,
            village.villagers.find((resident) => resident.characterId === id)?.cardSnapshot.capturedAt,
          ]),
        ),
      },
    });
    const reconciled = await readVillageState();
    const snapshot = await buildVillageSnapshot(now);
    return { ...snapshot, recap: buildReturnRecap(reconciled, previousThrough, moment.instant, elapsedMs) };
  }

  const storyBackgroundHandler: Handler = {
    generate: (input) => proposeHappenings(input.context),
    valid: (state, input) =>
      input.opportunity.actorIds.every((id: string) =>
        state.villagers.some(
          (resident) => resident.characterId === id && resident.cardSnapshot.capturedAt === input.actorIncarnations[id],
        ),
      ) &&
      (!input.opportunity.venueId || state.venues.some((venue) => venue.id === input.opportunity.venueId)) &&
      (input.forced ||
        (state.storyPace !== "off" &&
          (state.lastCreativeDate < input.dateKey ||
            (input.socialPlanId && socialContinuationValid(state, input.socialPlanId, input.socialPlan))) &&
          localDateKey(new Date(state.simulatedThrough)) <= input.dateKey)),
    apply(state, input, proposal) {
      const { forced, dateKey, opportunity, moment } = input;
      const now = new Date(input.now);

      if (!forced && (state.storyPace === "off" || (!input.socialPlanId && state.lastCreativeDate >= dateKey))) return;
      const dailyAllowance = storyAllowance(state.storyPace, state.seed, dateKey);
      const used = state.happenings.filter((entry) => localDateKey(new Date(entry.occurredAt)) === dateKey).length;
      const offeredPlan = input.context.social?.candidates.some((plan) => plan.id === proposal.social?.planId);
      const allowance = forced
        ? 3
        : input.socialPlanId
          ? Math.max(0, dailyAllowance - used)
          : Math.max(1, dailyAllowance - (offeredPlan ? 1 : 0));
      if (!allowance) return;
      const opportunityId = opportunity.id;
      if (state.processedOpportunityIds.includes(opportunityId)) return;
      const happenings = proposal.happenings.slice(0, allowance);
      state.happenings = [...happenings, ...state.happenings].slice(0, MAX_HAPPENINGS);
      if (!forced && proposal.social && input.context.social) {
        const id = opportunity.id + ":social";
        state.socialOutbox ??= [];
        if (!state.socialOutbox.some((entry) => entry.id === id))
          state.socialOutbox.push({
            id,
            seed: state.seed,
            at: input.now,
            opportunity,
            candidates: input.context.social.candidates,
            proposal: proposal.social,
            requiredPlanId: input.socialPlanId,
          });
      }
      if (proposal.routineIdea) {
        const resident = state.villagers.find((entry) => entry.characterId === proposal.routineIdea.characterId);
        if (resident?.agenda) addRoutineIdea(resident.agenda, proposal.routineIdea, resident, state);
      }
      for (const request of proposal.housingRequests) {
        if (!opportunity.actorIds.includes(request.characterId)) continue;
        const resident = state.villagers.find((entry) => entry.characterId === request.characterId);
        const venue = state.venues.find((entry) => entry.id === request.venueId);
        if (!resident || !venue) continue;
        if (
          state.residences.some((entry) => entry.characterId === request.characterId && entry.status !== "current") ||
          state.pendingDecisions.some(
            (entry) =>
              entry.kind === "venue-upgrade" &&
              entry.requesterCharacterId === request.characterId &&
              entry.status === "pending",
          )
        )
          continue;
        if (request.kind === "move") {
          if (venue.occupancy.playerHome || venue.occupancy.residentCharacterId) continue;
          if (
            state.residences.some(
              (entry) =>
                entry.proposedVenueId === venue.id && (entry.status === "pending" || entry.status === "moving"),
            )
          )
            continue;
          const currentVenueId =
            state.venues.find((entry) => entry.occupancy.residentCharacterId === request.characterId)?.id ?? "";
          const next: VillageResidence = {
            proposedPrivateZoneId: "",
            venueId: currentVenueId,
            characterId: request.characterId,
            status: "pending",
            proposedVenueId: venue.id,
            requestedAt: now.toISOString(),
            requestedBy: "villager",
            villagerDecision: "pending",
          };
          const index = state.residences.findIndex((entry) => entry.characterId === request.characterId);
          if (index < 0) state.residences.push(next);
          else state.residences[index] = next;
        }
      }
      // Prose Events update the feed only; structured commands own durable effects.
      if (state.lastCreativeDate < dateKey) state.lastCreativeDate = dateKey;
      if (!state.processedOpportunityIds.includes(opportunityId)) {
        state.processedOpportunityIds = [...state.processedOpportunityIds, opportunityId].slice(-256);
      }
    },
  };

  /**
   * Write down what the rest of the village saw of something the player just did.
   *
   * This is the answer to the only complaint the world panel cannot otherwise
   * answer. A settled wish is filed as a private memory, a conversation is filed
   * as a memory, and a memory is invisible: the record is read in the story tab
   * and nowhere else, and the window the player actually watches only moves when
   * the narrator writes a part of day. So the player does something definite, the
   * villager they did it for knows, and the square carries on as though nothing
   * happened until the clock turns over — which is the one thing that makes a
   * village feel like it is not paying attention.
   *
   * `deed` is the village's own past-tense line about what happened, and the
   * caller is responsible for it never being the player's raw claim. That is where
   * the safety of the whole route lies: by the time anything is written here, some
   * other call has already decided that the thing actually happened.
   *
   * It writes NOTHING on its own initiative. An empty list, a failure, a reply with
   * no JSON, a village with nobody else in it — all of them mean the window keeps
   * exactly what it had. Nothing here may cost the player the thing they did, so a
   * caller that catches this has already done the right thing.
   *
   * ponytail: one extra model call per settled wish. It is the only way to put an
   * action in the panel the player watches without also letting a model invent
   * something, because the narrator is the only other writer and it runs on a
   * clock. The upgrade path, if the cost ever matters, is to ride it on the verdict
   * call the way the end of a conversation rides on its own closing call — the
   * judge would then have to write prose, which is exactly why it was left alone.
   */
  async function runVillageReaction(params: {
    villagerName: string;
    playerName: string;
    /** What happened, in the village's own words and in the past tense. */
    deed: string;
    signal?: AbortSignal;
  }): Promise<void> {
    const deed = boundText(params.deed, MAX_CHRONICLE_LENGTH);
    if (deed.length === 0) return;
    const village = await readVillageState();
    const moment = deriveVillageMoment({ foundedAt: village.foundedAt, seed: village.seed, now: new Date() });
    const { happenings } = await proposeReaction(
      {
        village: village.name,
        setting: villageCurrentSetting(village),
        moment,
        playerName: params.playerName,
        villagerName: params.villagerName,
        deed,
        recent: village.happenings.map((entry) => entry.text),
      },
      { signal: params.signal },
    );
    if (happenings.length === 0) return;
    await mutateVillageState((state) => {
      // A reset or new founding within this activation retires the old world's
      // response. Check the authoritative identity on every save attempt.
      if (state.seed !== village.seed || state.setupAt !== village.setupAt || state.foundedAt !== village.foundedAt)
        return;
      // Deduped against the window as it stands rather than the copy read before
      // the call, because a narrator batch can land while the model is thinking
      // and the same line reaching the window twice reads as a village repeating
      // itself.
      const seen = new Set(state.happenings.map((entry) => entry.text.trim().toLowerCase()));
      const fresh = happenings.filter((entry) => {
        const key = entry.text.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (fresh.length === 0) return;
      state.happenings = prependHappenings(state.happenings, fresh);
      // Direct reactions do not move `simulatedThrough`: that cursor belongs to
      // reconciliation, while this records one player-triggered fact at its exact
      // occurrence time.
    });
  }

  /**
   * The whole of what the village remembers, newest first, as the story tab draws
   * it.
   *
   * Read on its own route rather than folded into the snapshot, for the same
   * reason the town map is: the snapshot is read on every chat send and on every
   * pulse, and a story that grows forever has no business being re-sent with it.
   *
   * Two things are resolved here and nowhere else. The calendar date is derived
   * from `foundedAt` so the tab never does clock arithmetic, and each actor's name
   * is read back off the live card, falling back to the name the village wrote
   * down — the same rule `projectVillager` and `projectHomes` follow, so a
   * villager's own memory does not go nameless when their card is deleted.
   *
   * `at` travels untouched. It is shown and never read; see `VillageChronicleEntry`.
   */
  async function buildVillageStory(): Promise<VillageChronicleEntryView[]> {
    const [village, cards] = await Promise.all([readVillageState(), listVillagerCards()]);
    const names = new Map(cards.map((card) => [card.id, card.name]));
    return village.chronicle.map((entry) => ({
      ...entry,
      dateLabel: villageDateLabel(village.foundedAt, entry.dayIndex),
      actors: entry.actors.map((actor) => ({ ...actor, name: names.get(actor.id) ?? actor.name })),
    }));
  }

  /** A player-facing projection of durable, passing, and archived memory layers. */
  async function buildVillageMemories() {
    const [village, cards] = await Promise.all([readVillageState(), listVillagerCards()]);
    const names = new Map(cards.map((card) => [card.id, card.name]));
    for (const resident of village.villagers) names.set(resident.characterId, resident.cardSnapshot.name);
    const person = (id: string) => ({ id, name: names.get(id) ?? "Former resident" });
    const residents = village.villagers.map((resident) => person(resident.characterId));
    const now = Date.now();
    const durable = village.chronicle
      .filter((entry) => entry.kind !== "tick")
      .map((entry) => {
        const knownByIds =
          entry.scope === "village"
            ? residents.map((resident) => resident.id)
            : (entry.knownByCharacterIds ?? entry.actors.map((actor) => actor.id)).filter(Boolean);
        const subjectIds = (entry.subjectCharacterIds ?? entry.actors.map((actor) => actor.id)).filter(Boolean);
        return {
          ...entry,
          dateLabel: villageDateLabel(village.foundedAt, entry.dayIndex),
          subjects: [...new Set(subjectIds)].map(person),
          knownBy: [...new Set(knownByIds)].map(person),
          evidence: entry.sourceVisitId ? { visitId: entry.sourceVisitId, lineIds: entry.sourceLineIds ?? [] } : null,
          legacy: !entry.sourceVisitId && !entry.memoryCategory,
        };
      });
    const recollections = village.recollections
      .filter((entry) => Date.parse(entry.expiresAt) > now)
      .map((entry) => ({
        ...entry,
        subjects: entry.subjectCharacterIds.map(person),
        knownBy: entry.knownByCharacterIds.map(person),
      }));
    return {
      generatedAt: new Date(now).toISOString(),
      residents,
      durable,
      recollections,
      expiredRecollectionCount: village.recollections.length - recollections.length,
    };
  }

  /**
   * Forget one thing.
   *
   * Removed by id rather than by position, unlike a notice: the story tab shows
   * the list in the order the record holds it, but it is a long list a player
   * scrolls, and a delete press that landed against a stale render would take out
   * whichever memory had drifted into that row. The id is what the press was
   * aimed at.
   *
   * Throwing when nothing matched is deliberate — it is how the route answers 404
   * for a memory that was already removed in another tab, rather than reporting a
   * success that did nothing.
   */
  async function removeChronicleEntry(id: unknown): Promise<void> {
    const entryId = asTrimmedString(id);
    if (entryId.length === 0) throw badRequest("That is not a memory of this village.");
    await mutateVillageState((state) => {
      const next = state.chronicle.filter((entry) => entry.id !== entryId);
      if (next.length === state.chronicle.length) throw notFound("That memory is no longer kept here.");
      state.chronicle = next;
    });
  }

  async function removeVillageRecollection(id: unknown): Promise<void> {
    const entryId = asTrimmedString(id);
    if (!entryId) throw badRequest("That is not a passing recollection of this village.");
    await mutateVillageState((state) => {
      const next = state.recollections.filter((entry) => entry.id !== entryId);
      if (next.length === state.recollections.length) throw notFound("That recollection is no longer active.");
      state.recollections = next;
    });
  }
  return {
    resetVillage,
    reconcileVillage,
    runVillageReaction,
    buildVillageStory,
    buildVillageMemories,
    removeChronicleEntry,
    removeVillageRecollection,
    storyBackgroundHandler,
  };
}
export type WorldCoordination = ReturnType<typeof createWorldCoordination>;
