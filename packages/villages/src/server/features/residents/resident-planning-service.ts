import { recentPlaceText } from "../../../shared/helpers/place-continuity.js";
import { environmentObservations } from "../../domain/rules/narrative-environment.js";
import { createHash } from "node:crypto";
import { PLACE_UPDATE_INSTRUCTION } from "../../domain/rules/zone-continuity.js";
import { encounterPhysicalId } from "../../domain/rules/social-encounter.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { villageNow } from "../../adapters/time/clock-gate.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { VillageResidence } from "../../domain/models/world.js";
import type { ResidentPlanningOpportunity, ReturnCatchupCapture, VillageState } from "../../domain/models/world.js";
import { agendaAt } from "../../domain/rules/agenda-plan.js";
import { asRecord } from "../../domain/rules/coerce.js";
import { backgroundRevision } from "../../domain/rules/background-revision.js";
import { activityDate, eventAttemptAvailable } from "../../domain/rules/event-attempts.js";
import {
  ReturnOpportunityUnavailable,
  returnCatchupSubject,
  sameReturnResident,
} from "../../domain/rules/return-catchup-authority.js";
import { planRoutineDays } from "../../domain/rules/resident-agenda.js";
import { departureMemoriesAvailable } from "../../domain/rules/return-catchup-capture.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { recallMemories } from "../../domain/rules/memory-recall.js";
import { addRoutineIdea } from "../../domain/rules/owned-routine.js";
import { assertPersonalLetter, hasPersonalLetterAction } from "../../domain/rules/personal-letter.js";
import { villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { relationshipWritingPrompt } from "../../domain/rules/relationship-presentation.js";
import { RELATIONSHIP_REVIEW_INSTRUCTION } from "../../domain/rules/relationship-review.js";
import {
  buildResidentPlanningMessages,
  assertCatchupChoices,
  localDateKey,
  planningAllowance,
  readResidentPlanningProposal,
  residentPlanningOpportunity,
  residentEncounterPlace,
  type ResidentPlanningContext,
} from "../../domain/rules/resident-planning.js";
import { responseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import { SCENE_MEMORY_INSTRUCTION, sceneMemoryContext } from "../../domain/rules/scene-memories.js";
import { socialContextState } from "../../domain/rules/social-context.js";
import { socialContinuationValid, socialPlanCandidates } from "../../domain/rules/social-rules.js";
import {
  applyWishReflection,
  readSocialWishChanges,
  SOCIAL_WISH_INSTRUCTION,
} from "../../domain/rules/social-wishes.js";
import { hasVenueClass, venueResidentIds } from "../../domain/rules/venue-model.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import { fitVenueWritingMessages, venueCardProfile } from "../../domain/rules/venue-writing.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { readPlayerIdentity } from "../../domain/rules/village-projections.js";
import { completionFailure, WorkFailureError } from "../../domain/rules/work-failure.js";

export type ResidentPlanningPorts = {
  afterCatchup?: (input: unknown) => Promise<void>;
  afterCatchupFailure?: (input: unknown) => Promise<void>;
  applySavedStartingTies?: () => Promise<void>;
  automaticMail?: import("./social-mail-service.js").SocialMailService["automaticOutbox"];
  readVillageState: typeof import("../world/village-store.js").readVillageState;
  readEffectiveVillagerCard: typeof import("../../adapters/engine/catalog.js").readEffectiveVillagerCard;
  queueBackgroundJob: typeof import("../../jobs/background-work.js").queueBackgroundJob;
  backgroundJobSnapshot: typeof import("../../jobs/background-work.js").backgroundJobSnapshot;
  villagesLanguageModels: typeof import("../../adapters/models/language-models.js").villagesLanguageModels;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
};
/** Paced resident choices are independent from public prose, physical state and memory settlement. */
export function createResidentPlanning(ports: ResidentPlanningPorts) {
  const {
    readVillageState,
    readEffectiveVillagerCard,
    queueBackgroundJob,
    backgroundJobSnapshot,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
  } = ports;
  async function reconcile(now: Date, dueOnly = false): Promise<boolean | void> {
    await ports.applySavedStartingTies?.();
    const village = await readVillageState({ memories: true });
    const dateKey = activityDate(village, now),
      allowance = planningAllowance(village.backgroundPace, village.seed, dateKey);
    if (
      !allowance ||
      !eventAttemptAvailable(village, dateKey, now.getTime()) ||
      village.villagers.some((r) => !village.relationshipContext?.reviewedActorIds.includes(r.characterId)) ||
      village.socialOutbox?.some((r) => !!r.error) ||
      village.socialMailOutbox?.some((r) => !!r.error)
    )
      return;
    const moment = deriveVillageMoment({
      foundedAt: village.foundedAt,
      environment: village.narrative,
      seed: village.seed,
      timeZone: village.timeZone || undefined,
      now,
    });
    const used = village.eventAttempts?.attempts.filter((r) => r.date === dateKey).length ?? 0;
    const activePlan =
      used < allowance
        ? village.relationshipContext?.socialPlans.find(
            (plan) =>
              plan.status === "planned" &&
              plan.kind === "meeting" &&
              plan.dateKey === dateKey &&
              plan.startMinute <= moment.minuteOfDay &&
              plan.endMinute > moment.minuteOfDay,
          )
        : undefined;
    const subjectId = activePlan ? "social:" + activePlan.id : "village";
    if (dueOnly && !activePlan) return false;
    const prior = await backgroundJobSnapshot("resident-planning", subjectId);
    if (prior?.seed === village.seed && ["queued", "running", "failed", "interrupted", "paused"].includes(prior.status))
      return;
    // A renamed job must not reopen a failed or interrupted paid attempt from this date.
    const legacy = await backgroundJobSnapshot("story", subjectId);
    if (legacy?.seed === village.seed && legacy.highWaterDate >= dateKey) return;
    const opportunity = activePlan
      ? {
          id: activePlan.id + ":encounter",
          kind: "encounter" as const,
          startsAt: now.toISOString(),
          endsAt: now.toISOString(),
          actorIds: activePlan.actorIds,
          venueId: activePlan.venueId,
          zoneId: activePlan.zoneId,
          facts: [activePlan.activity, "An accepted free-time plan is happening now."],
        }
      : residentPlanningOpportunity(village, moment, village.simulatedThrough);
    if (!opportunity || village.processedActionIds.includes(opportunity.id)) return;
    const context: ResidentPlanningContext = {
      version: 1,
      village: village.name,
      setting: villageCurrentSetting(village),
      playerBackground: village.playerBackground,
      playerPersonaName: village.playerPersonaName,
      worldFacts: village.worldFacts,
      moment,
      ...(village.narrative
        ? {
            environment: {
              weather: moment.weather,
              conditions: environmentObservations(
                village.narrative,
                moment.instant,
                opportunity.venueId,
                opportunity.zoneId ?? "",
              ),
            },
          }
        : {}),
      residents: village.villagers.map((resident) => {
        const card = readEffectiveVillagerCard(resident);
        return {
          characterId: resident.characterId,
          name: card.name,
          profile: venueCardProfile(card, readPlayerIdentity(village).name),
          doing: agendaAt(resident.agenda, moment.minuteOfDay, now, resident.ingestSchedule !== false)?.activity ?? "",
          agenda: resident.agenda,
          wishes: resident.wishes,
        };
      }),
      venues: village.venues,
      pendingHousingCharacterIds: village.residences.filter((r) => r.status !== "current").map((r) => r.characterId),
      opportunity,
      narrationMemories: Object.fromEntries(
        opportunity.actorIds.map((id) => [
          id,
          recallMemories(village.memories, {
            purpose: "narration",
            audience: [id],
            query: opportunity.facts.join(" ") + " " + id,
          }).serialized,
        ]),
      ),
      memory: sceneMemoryContext(village, opportunity.actorIds, opportunity.facts.join(" ")),
      social: {
        candidates: !activePlan && allowance > 1 ? socialPlanCandidates(village, now) : [],
        relationships: opportunity.actorIds.map((id) => relationshipWritingPrompt(village, id)),
        state: socialContextState(village.relationshipContext, opportunity.actorIds, opportunity.facts.join(" ")),
      },
    };
    await queueBackgroundJob({
      kind: "resident-planning",
      subjectId,
      seed: village.seed,
      revision: dateKey + ":" + used,
      finite: false,
      label: "Resident activity",
      automaticDate: dateKey,
      input: {
        context,
        reviewBasis: village.eventAttempts?.lastAttemptAt ?? "",
        opportunity,
        dateKey,
        now: now.toISOString(),
        socialPlanId: activePlan?.id,
        socialPlan: activePlan,
        admitted: structuredClone({
          villagers: village.villagers,
          venues: village.venues,
          residences: village.residences,
          projects: village.projects,
          timeZone: village.timeZone,
          narrative: village.narrative,
        }),
        actorIncarnations: Object.fromEntries(
          opportunity.actorIds.map((id) => [
            id,
            village.villagers.find((r) => r.characterId === id)?.cardSnapshot.capturedAt,
          ]),
        ),
      },
    });
    return true;
  }
  /** Queue one dated opportunity using the saved departure context. */
  async function queueReturnOpportunity(
    batchId: string,
    opportunity: ResidentPlanningOpportunity,
    capture: ReturnCatchupCapture,
  ): Promise<void> {
    const current = await readVillageState({ memories: true });
    if (current.returnCatchup?.batch?.id !== batchId || current.returnCatchup.batch.status !== "running")
      throw new Error("The catch-up batch is no longer active.");
    const eventAt = Date.parse(opportunity.startsAt),
      capturedAt = Date.parse(capture.at),
      returnAt = Date.parse(current.returnCatchup.batch.until ?? "");
    if (
      !Number.isFinite(eventAt) ||
      !Number.isFinite(capturedAt) ||
      !Number.isFinite(returnAt) ||
      current.returnCatchup.batch.from !== capture.at ||
      !current.returnCatchup.capture ||
      backgroundRevision(current.returnCatchup.capture) !== backgroundRevision(capture) ||
      !current.returnCatchup.batch.opportunities?.some((row) => JSON.stringify(row) === JSON.stringify(opportunity)) ||
      eventAt < capturedAt ||
      eventAt > returnAt ||
      returnAt > villageNow().getTime() ||
      opportunity.endsAt !== opportunity.startsAt ||
      !["encounter", "routine"].includes(opportunity.kind) ||
      !opportunity.actorIds.length ||
      opportunity.actorIds.includes("player") ||
      new Set(opportunity.actorIds).size !== opportunity.actorIds.length ||
      (opportunity.kind === "encounter" && (opportunity.actorIds.length < 2 || !opportunity.venueId)) ||
      (opportunity.kind === "routine" && (opportunity.actorIds.length !== 1 || !!opportunity.venueId))
    )
      throw new ReturnOpportunityUnavailable("The historical opportunity is not supported by its departure interval.");
    if (!departureMemoriesAvailable(capture, current))
      throw new ReturnOpportunityUnavailable("Resident memories changed after the departure capture.");
    if (JSON.stringify(current.relationshipContext) !== JSON.stringify(capture.world.relationshipContext))
      throw new ReturnOpportunityUnavailable("Resident relationships changed after the departure capture.");
    if (JSON.stringify(current.opening) !== JSON.stringify(capture.world.opening))
      throw new ReturnOpportunityUnavailable("The opening changed after the departure capture.");
    const historical: VillageState = structuredClone({ ...current, ...capture.world });
    const now = new ZonedDate(
      opportunity.startsAt,
      historical.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    planRoutineDays(historical, now);
    if (opportunity.actorIds.some((id) => !historical.relationshipContext?.reviewedActorIds.includes(id)))
      throw new ReturnOpportunityUnavailable("A resident's relationships have not been reviewed.");
    if (
      opportunity.actorIds.some((id) => {
        const before = historical.villagers.find((row) => row.characterId === id);
        const live = current.villagers.find((row) => row.characterId === id);
        return (
          !before ||
          !live ||
          !sameReturnResident(
            before,
            live,
            new ZonedDate(
              opportunity.startsAt,
              historical.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            ),
            historical,
          )
        );
      })
    )
      throw new ReturnOpportunityUnavailable("A resident changed after the departure capture.");
    if (
      opportunity.venueId &&
      JSON.stringify(historical.venues.find((row) => row.id === opportunity.venueId)) !==
        JSON.stringify(current.venues.find((row) => row.id === opportunity.venueId))
    )
      throw new ReturnOpportunityUnavailable("The opportunity's Venue changed after the departure capture.");
    const moment = deriveVillageMoment({
      foundedAt: historical.foundedAt,
      environment: historical.narrative,
      seed: historical.seed,
      timeZone: historical.timeZone || undefined,
      now,
    });
    const venue = historical.venues.find((row) => row.id === opportunity.venueId);
    const encounterZone = venue && venueZones(venue).find((row) => row.id === opportunity.zoneId);
    if (opportunity.kind === "encounter" && (!venue || !encounterZone))
      throw new ReturnOpportunityUnavailable("The historical encounter Zone is unavailable.");
    const context: ResidentPlanningContext = {
      version: 1,
      catchup: true,
      village: historical.name,
      setting: villageCurrentSetting(historical),
      playerBackground: historical.playerBackground,
      playerPersonaName: historical.playerPersonaName,
      worldFacts: historical.worldFacts,
      moment,
      ...(historical.narrative
        ? {
            environment: {
              weather: moment.weather,
              conditions: environmentObservations(
                historical.narrative,
                moment.instant,
                opportunity.venueId,
                opportunity.zoneId ?? "",
              ),
            },
          }
        : {}),
      residents: historical.villagers
        .filter((resident) => opportunity.actorIds.includes(resident.characterId))
        .map((resident) => {
          const card = readEffectiveVillagerCard(resident);
          return {
            characterId: resident.characterId,
            name: card.name,
            profile: venueCardProfile(card, readPlayerIdentity(historical).name),
            doing:
              agendaAt(resident.agenda, moment.minuteOfDay, now, resident.ingestSchedule !== false)?.activity ?? "",
            agenda: resident.agenda,
            wishes: resident.wishes,
          };
        }),
      venues: [],
      ...(venue && encounterZone
        ? {
            catchupPlace: {
              venueId: venue.id,
              name: venue.name,
              category: venue.category,
              classes: venue.classes,
              zone: {
                id: encounterZone.id,
                name: encounterZone.name,
                kind: encounterZone.kind,
                description: encounterZone.description,
                revision: encounterZone.state.revision,
                recentContext: recentPlaceText(encounterZone.state, opportunity.startsAt),
              },
            },
          }
        : {}),
      pendingHousingCharacterIds: [],
      opportunity,
      narrationMemories: Object.fromEntries(
        opportunity.actorIds.map((id) => [
          id,
          recallMemories(historical.memories, {
            purpose: "narration",
            audience: [id],
            query: opportunity.facts.join(" ") + " " + id,
          }).serialized,
        ]),
      ),
      memory: sceneMemoryContext(historical, opportunity.actorIds, opportunity.facts.join(" ")),
      social: {
        candidates: [],
        relationships: opportunity.actorIds.map((id) => relationshipWritingPrompt(historical, id)),
        state: socialContextState(historical.relationshipContext, opportunity.actorIds, opportunity.facts.join(" ")),
      },
    };
    const dateKey = current.returnCatchup.batch.budgetDate ?? activityDate(current, villageNow());
    await queueBackgroundJob({
      kind: "resident-planning",
      subjectId: returnCatchupSubject(batchId, opportunity.id),
      seed: historical.seed,
      revision: batchId + ":" + opportunity.id,
      finite: false,
      label: "Return catch-up",
      automaticDate: dateKey,
      input: {
        catchupBatchId: batchId,
        context,
        opportunity,
        dateKey,
        now: opportunity.startsAt,
        memoryRevision: capture.memoryRevision,
        captureRevision: backgroundRevision(capture),
        returnUntil: current.returnCatchup.batch.until,
        relationships: capture.world.relationshipContext,
        admitted: structuredClone({
          villagers: historical.villagers,
          venues: historical.venues,
          residences: historical.residences,
          projects: historical.projects,
          timeZone: historical.timeZone,
          narrative: historical.narrative,
          opening: historical.opening,
        }),
        actorIncarnations: Object.fromEntries(
          opportunity.actorIds.map((id) => [
            id,
            historical.villagers.find((row) => row.characterId === id)?.cardSnapshot.capturedAt,
          ]),
        ),
      },
    });
  }
  async function proposeResidentChoices(context: ResidentPlanningContext) {
    const model = await villagesLanguageModels().resolveForRequest({
      connectionId: await villagesConnectionIdFor("system"),
    });
    const messages = buildResidentPlanningMessages(context);
    const fitted = fitVenueWritingMessages(
      model,
      [{ text: String(messages[0].content) }],
      String(messages[1].content),
      Math.min(model.maxOutputTokens ?? 3000, 3000),
      "System",
    );
    const completion = await completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 3000, {
      responseFormat: { type: "json_object" },
      retryEmpty: false,
      temperature: 0.85,
    });
    const payload = extractModelJsonObject(completion);
    const failure = completionFailure(completion, "resident-planning", fitted.maxTokens ?? 3000);
    if (!payload || failure)
      throw new WorkFailureError({
        ...failure,
        cause: failure?.cause ?? "invalid_json",
        stage: "resident-planning",
        message: failure?.message ?? "Resident activity returned no usable result. Retry unfinished work explicitly.",
        responseDiagnostics: responseDiagnostics(model, completion, fitted.maxTokens ?? 3000, payload),
      });
    let proposal;
    try {
      proposal = readResidentPlanningProposal(payload, context);
    } catch {
      throw new WorkFailureError({
        cause: "missing_result",
        stage: "resident-planning",
        message: "Resident activity returned incomplete choices. Retry unfinished work explicitly.",
        responseDiagnostics: responseDiagnostics(model, completion, fitted.maxTokens ?? 3000, payload),
      });
    }
    const encounter = proposal.social?.encounter,
      mail = proposal.social?.mail;
    if (encounter && mail) throw new Error("Choose one automatic social interaction per attempt.");
    if (
      mail &&
      (typeof mail !== "object" ||
        !context.opportunity.actorIds.includes(String((mail as Record<string, unknown>).senderId)) ||
        typeof (mail as Record<string, unknown>).text !== "string" ||
        String((mail as Record<string, unknown>).text).length > 2000)
    )
      throw new Error("Invalid automatic correspondent or message.");
    if (mail) {
      const row = mail as { senderId: string; text: string };
      assertPersonalLetter(row.text, context.residents.find((resident) => resident.characterId === row.senderId)?.name);
    }
    for (const raw of [encounter, mail])
      if (raw && typeof raw === "object")
        for (const key of [
          "placeUpdate",
          "physicalConsistent",
          "semanticVersion",
          "semanticSourceHash",
          "memoryChanges",
          "memoryContexts",
          "relationshipReview",
          "invitation",
          "wishChanges",
        ])
          delete (raw as Record<string, unknown>)[key];
    if (encounter || mail) {
      const record = (encounter ?? mail) as Record<string, unknown>;
      const lines = mail ? [{ speakerId: record.senderId, text: record.text }] : record.lines;
      if (!Array.isArray(lines)) throw new Error("Automatic social source has no lines.");
      const nativeMemory = context.memory;
      if (!nativeMemory) throw new Error("Automatic social Memory context is missing.");
      const reviewMessages = [
        {
          role: "system" as const,
          content:
            "Independently interpret these exact automatic social lines. Return one complete JSON object. " +
            RELATIONSHIP_REVIEW_INSTRUCTION +
            (mail
              ? " The recipient is player; disclosures wait for reading. Mail cannot grant access or create actionable invitations. Return permissions:[] for mail."
              : " The player is absent: disclosures must be empty. Physical Memory facts need the exact possibleMemoryEffects.physical.id with validated-event support and a supported matching placeUpdate. Return consistent:true only when every narrated physical outcome is supported by the admitted local actors, current description, supplies, authority and event time. Otherwise consistent:false; never repair the source by pretending a completed deed was only a plan. " +
                PLACE_UPDATE_INSTRUCTION) +
            " Use numeric zero-based lineIds. context.state is both captured and live social baseline. sceneAfter/liveAfter coincide. Return the memoryChanges array under the native Memory contract. " +
            SCENE_MEMORY_INSTRUCTION +
            " " +
            SOCIAL_WISH_INSTRUCTION +
            " For Wish evidence use zero-based current line indexes. Private NPC encounters never disclose to player. Supplied resident.wishes are the captured authority; no speech is required to concern them.",
        },
        {
          role: "user" as const,
          content: JSON.stringify({
            lines,
            mode: mail ? "mail" : "encounter",
            context: context.social,
            residents: context.residents
              .filter((r) => !context.catchup || context.opportunity.actorIds.includes(r.characterId))
              .map((r) => ({ characterId: r.characterId, wishes: r.wishes })),
            memory: nativeMemory.envelope,
            now: context.moment.instant,
            ...(context.environment ? { environment: context.environment } : {}),
            place:
              context.catchupPlace ??
              residentEncounterPlace(context.venues, context.opportunity, context.moment.instant),
            possibleMemoryEffects: mail
              ? {}
              : {
                  physical: {
                    id: encounterPhysicalId(context.opportunity.id + ":social"),
                    domainRef: { kind: "physical", id: context.opportunity.venueId },
                  },
                },
          }),
        },
      ];
      const fittedReview = model.fitContext(reviewMessages, { maxTokens: 16384 });
      if (JSON.stringify(fittedReview.messages) !== JSON.stringify(reviewMessages))
        throw new Error("Offscreen semantic evidence does not fit System context.");
      const judged = await completeWithRoom(model, reviewMessages, Math.min(fittedReview.maxTokens ?? 16384, 16384), {
        responseFormat: { type: "json_object" },
        retryEmpty: false,
        temperature: 0.1,
        reasoningEffort: "low",
        debugMode: false,
        usagePurpose: "checks",
      });
      const interpreted = extractModelJsonObject(judged);
      const review = interpreted?.relationshipReview as Record<string, unknown> | undefined;
      if (
        judged.finishReason === "length" ||
        !review ||
        !Array.isArray(interpreted?.memoryChanges) ||
        interpreted.memoryChanges.length > 16 ||
        !Array.isArray(interpreted.wishChanges) ||
        interpreted.wishChanges.length > 16 ||
        !["changes", "permissions", "disclosures"].every((key) => Array.isArray(review[key]))
      )
        throw new Error("Offscreen interpretation is incomplete; explicit retry required.");
      if (!mail && lines.some((line) => asRecord(line).kind === "narration") && interpreted?.consistent !== true)
        throw new Error("The encounter contains unsupported physical outcomes; its source is retained.");
      record.placeUpdate = mail ? null : (interpreted?.placeUpdate ?? null);
      record.physicalConsistent = !mail && interpreted?.consistent === true;
      record.relationshipReview = review;
      record.wishChanges = readSocialWishChanges(interpreted!.wishChanges);
      record.semanticVersion = 2;
      record.memoryChanges = interpreted!.memoryChanges;
      record.memoryContexts = { [nativeMemory.saved.protection.fingerprint]: nativeMemory.saved };
      record.semanticSourceHash = createHash("sha256").update(JSON.stringify(reviewMessages)).digest("hex");
    }

    return proposal;
  }
  const handler: Handler = {
    reserve(state, input) {
      if (input.reviewBasis !== undefined && input.reviewBasis !== (state.eventAttempts?.lastAttemptAt ?? ""))
        throw new Error("This automatic activity opportunity was already used. Its source is preserved.");
    },
    generate: (input) => proposeResidentChoices(input.context),
    valid: (state, input, admission) =>
      input.context.version === 1 &&
      (!input.context.catchup ||
        (state.returnCatchup?.batch?.id === input.catchupBatchId &&
          state.returnCatchup.batch.status === "running" &&
          state.returnCatchup.batch.until === input.returnUntil &&
          !!state.returnCatchup.capture &&
          backgroundRevision(state.returnCatchup.capture) === input.captureRevision &&
          !!state.returnCatchup.batch.opportunities?.some(
            (row) => JSON.stringify(row) === JSON.stringify(input.opportunity),
          ) &&
          state.memories.revision === input.memoryRevision &&
          JSON.stringify(state.relationshipContext) === JSON.stringify(input.relationships) &&
          JSON.stringify(state.opening) === JSON.stringify(input.admitted.opening) &&
          input.opportunity.actorIds.every((id: string) => {
            const live = state.villagers.find((row) => row.characterId === id);
            const before = input.admitted.villagers.find((row: { characterId: string }) => row.characterId === id);
            return (
              !!live &&
              !!before &&
              sameReturnResident(
                before,
                live,
                new ZonedDate(input.now, input.admitted.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
                { ...state, ...input.admitted },
              )
            );
          }) &&
          (!input.opportunity.venueId ||
            JSON.stringify(state.venues.find((row) => row.id === input.opportunity.venueId)) ===
              JSON.stringify(
                input.admitted.venues.find((row: { id: string }) => row.id === input.opportunity.venueId),
              )))) &&
      input.context.setting === villageCurrentSetting(state) &&
      state.backgroundPace !== "off" &&
      input.opportunity.actorIds.every((id: string) =>
        state.villagers.some((r) => r.characterId === id && r.cardSnapshot.capturedAt === input.actorIncarnations[id]),
      ) &&
      (!input.opportunity.venueId || state.venues.some((v) => v.id === input.opportunity.venueId)) &&
      (!input.socialPlanId || socialContinuationValid(state, input.socialPlanId, input.socialPlan, villageNow())) &&
      (input.context.catchup ||
        (typeof admission?.activityDate === "string" && admission.activityDate === input.dateKey) ||
        state.eventAttempts?.attempts.some(
          (row) => row.id === admission?.activityAttemptId && row.date === input.dateKey && row.batchId === undefined,
        ) ||
        localDateKey(
          new ZonedDate(state.simulatedThrough, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
        ) <= input.dateKey),
    apply(state, input, proposal) {
      if (input.context.catchup) assertCatchupChoices(proposal);
      const { dateKey, opportunity } = input;
      if (state.backgroundPace === "off" || state.processedActionIds.includes(opportunity.id)) return;
      if (proposal.wishReflection) {
        const owner = asRecord(proposal.wishReflection).actorId;
        if (!opportunity.actorIds.includes(String(owner))) throw new Error("Reflection owner was not offered.");
        if (proposal.social) throw new Error("Reflection cannot fabricate an interaction.");
        applyWishReflection(state, proposal.wishReflection, opportunity.id, input.now, input.admitted.villagers);
      }
      const used = state.planningUsage.dateKey === dateKey ? state.planningUsage.count : 0;
      const savedMail = proposal.social?.mail as { senderId?: string; text?: string } | undefined;
      // A result saved by an older writer may contain a stage direction. Omit only
      // that unseen letter; other already-generated choices still apply normally.
      const invalidSavedMail =
        typeof savedMail?.text === "string" &&
        hasPersonalLetterAction(
          savedMail.text,
          input.context.residents.find(
            (resident: { characterId: string }) => resident.characterId === savedMail.senderId,
          )?.name ?? state.villagers.find((resident) => resident.characterId === savedMail.senderId)?.cardSnapshot.name,
        );
      if (proposal.social?.mail && !invalidSavedMail) {
        if (!ports.automaticMail) throw new Error("Automatic personal mail unavailable.");
        const entry = ports.automaticMail(
          { ...state, ...input.admitted },
          input.context.social.state,
          proposal.social.mail,
          opportunity.id,
          input.now,
          input.context.memory,
        );
        state.socialMailOutbox ??= [];
        if (!state.socialMailOutbox.some((r) => r.id === entry.id)) state.socialMailOutbox.push(entry);
      }
      if (proposal.social && !proposal.social.mail) {
        const id = opportunity.id + ":social";
        state.socialOutbox ??= [];
        if (!state.socialOutbox.some((entry) => entry.id === id))
          state.socialOutbox.push({
            id,
            ...(input.context.catchup ? { catchupBatchId: input.catchupBatchId } : {}),
            seed: state.seed,
            at: input.now,
            opportunity,
            candidates: input.context.social.candidates,
            proposal: proposal.social,
            requiredPlanId: input.socialPlanId,
            requiredPlan: input.socialPlan,
            relationshipSnapshot: input.context.social.state,
            admitted: input.admitted,
          });
      }
      if (proposal.routineIdea) {
        const resident = state.villagers.find((r) => r.characterId === proposal.routineIdea.characterId);
        if (resident?.agenda) addRoutineIdea(resident.agenda, proposal.routineIdea, resident, state, villageNow());
      }
      for (const request of proposal.housingRequests) {
        if (!opportunity.actorIds.includes(request.characterId)) continue;
        const resident = state.villagers.find((r) => r.characterId === request.characterId),
          venue = state.venues.find((v) => v.id === request.venueId);
        if (
          !resident ||
          !venue ||
          !hasVenueClass(venue, "residence") ||
          venue.constructionStatus === "worksite" ||
          venue.occupancy.playerHome ||
          venueResidentIds(venue).length > 0 ||
          state.residences.some(
            (r) =>
              (r.characterId === request.characterId && r.status !== "current") ||
              (r.proposedVenueId === venue.id && ["pending", "moving"].includes(r.status)),
          )
        )
          continue;
        const next: VillageResidence = {
          proposedPrivateZoneId: "",
          venueId: state.venues.find((v) => venueResidentIds(v).includes(request.characterId))?.id ?? "",
          characterId: request.characterId,
          status: "pending",
          proposedVenueId: venue.id,
          requestedAt: input.now,
          requestedBy: "villager",
          villagerDecision: "pending",
        };
        const index = state.residences.findIndex((r) => r.characterId === request.characterId);
        if (index < 0) state.residences.push(next);
        else state.residences[index] = next;
      }
      if (state.lastPlanningDate < dateKey) state.lastPlanningDate = dateKey;
      state.planningUsage = { dateKey, count: used + 1 };
      state.processedActionIds = [...state.processedActionIds, opportunity.id].slice(-256);
      if (input.context.catchup) {
        const tracking = state.returnCatchup;
        const record = tracking?.batch?.records?.find((row) => row.opportunityId === opportunity.id);
        if (!tracking?.capture || !record || tracking.batch?.id !== input.catchupBatchId)
          throw new Error("The return opportunity is no longer recorded in its batch.");
        record.outcome = structuredClone(proposal);
        record.status = proposal.social?.encounter ? "settling" : "settled";
        if (proposal.wishReflection) {
          const id = String(asRecord(proposal.wishReflection).actorId);
          const captured = tracking.capture.world.villagers.find((row) => row.characterId === id);
          const live = state.villagers.find((row) => row.characterId === id);
          if (!captured || !live) throw new Error("The reflecting resident changed.");
          captured.wishes = structuredClone(live.wishes);
        }
      }
    },
    afterApply: async (input) => {
      if (input.context.catchup) await ports.afterCatchup?.(input);
    },
    afterFailure: async (input) => {
      if (input?.context?.catchup) await ports.afterCatchupFailure?.(input);
    },
  };
  return { reconcile, queueReturnOpportunity, handler };
}
