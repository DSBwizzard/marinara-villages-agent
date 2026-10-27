import { recallMemories } from "../../domain/rules/memory-recall.js";
import { assertPersonalLetter, hasPersonalLetterAction } from "../../domain/rules/personal-letter.js";
import { eventAttemptAvailable } from "../../domain/rules/event-attempts.js";
import { socialContextState } from "../../domain/rules/social-context.js";
import { RELATIONSHIP_REVIEW_INSTRUCTION } from "../../domain/rules/relationship-review.js";
import { sceneMemoryContext, SCENE_MEMORY_INSTRUCTION } from "../../domain/rules/scene-memories.js";
import { createHash } from "node:crypto";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { VillageResidence } from "../../domain/models/world.js";
import {
  buildResidentPlanningMessages,
  localDateKey,
  planningAllowance,
  readResidentPlanningProposal,
  residentPlanningOpportunity,
  type ResidentPlanningContext,
} from "../../domain/rules/resident-planning.js";
import { hasVenueClass, venueResidentIds } from "../../domain/rules/venue-model.js";
import { agendaAt } from "../../domain/rules/agenda-plan.js";
import { villageCurrentSetting } from "../../domain/rules/prompt-preset.js";
import { socialContinuationValid, socialPlanCandidates } from "../../domain/rules/social-rules.js";
import { venueCardProfile, fitVenueWritingMessages } from "../../domain/rules/venue-writing.js";
import { relationshipWritingPrompt } from "../../domain/rules/relationship-presentation.js";
import { readPlayerIdentity } from "../../domain/rules/village-projections.js";
import { deriveVillageMoment } from "../../domain/rules/village-clock.js";
import { addRoutineIdea } from "../../domain/rules/owned-routine.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { completionFailure, WorkFailureError } from "../../domain/rules/work-failure.js";
import { responseDiagnostics } from "../../domain/rules/response-diagnostics.js";
import { villageNow } from "../../adapters/time/clock-gate.js";

export type ResidentPlanningPorts = {
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
  async function reconcile(now: Date): Promise<void> {
    await ports.applySavedStartingTies?.();
    const village = await readVillageState({ memories: true });
    const dateKey = localDateKey(now),
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
      residents: village.villagers.map((resident) => {
        const card = readEffectiveVillagerCard(resident);
        return {
          characterId: resident.characterId,
          name: card.name,
          profile: venueCardProfile(card, readPlayerIdentity(village).name),
          doing: agendaAt(resident.agenda, moment.minuteOfDay, now, resident.ingestSchedule !== false)?.activity ?? "",
          agenda: resident.agenda,
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
        }),
        actorIncarnations: Object.fromEntries(
          opportunity.actorIds.map((id) => [
            id,
            village.villagers.find((r) => r.characterId === id)?.cardSnapshot.capturedAt,
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
          "semanticVersion",
          "semanticSourceHash",
          "memoryChanges",
          "memoryContexts",
          "relationshipReview",
          "invitation",
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
              : " The player is absent: disclosures must be empty.") +
            " Use numeric zero-based lineIds. context.state is both captured and live social baseline. sceneAfter/liveAfter coincide. Return memoryChanges:[] under the native Memory contract. " +
            SCENE_MEMORY_INSTRUCTION,
        },
        {
          role: "user" as const,
          content: JSON.stringify({
            lines,
            mode: mail ? "mail" : "encounter",
            context: context.social,
            memory: nativeMemory.envelope,
            now: context.moment.instant,
            zones: context.venues,
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
        !["changes", "permissions", "disclosures"].every((key) => Array.isArray(review[key]))
      )
        throw new Error("Offscreen interpretation is incomplete; explicit retry required.");
      record.relationshipReview = review;
      record.semanticVersion = 2;
      record.memoryChanges = interpreted!.memoryChanges;
      record.memoryContexts = { [nativeMemory.saved.protection.fingerprint]: nativeMemory.saved };
      record.semanticSourceHash = createHash("sha256").update(JSON.stringify(reviewMessages)).digest("hex");
    }

    return proposal;
  }
  const handler: Handler = {
    generate: (input) => proposeResidentChoices(input.context),
    valid: (state, input) =>
      input.context.version === 1 &&
      input.context.setting === villageCurrentSetting(state) &&
      state.backgroundPace !== "off" &&
      input.opportunity.actorIds.every((id: string) =>
        state.villagers.some((r) => r.characterId === id && r.cardSnapshot.capturedAt === input.actorIncarnations[id]),
      ) &&
      (!input.opportunity.venueId || state.venues.some((v) => v.id === input.opportunity.venueId)) &&
      (!input.socialPlanId || socialContinuationValid(state, input.socialPlanId, input.socialPlan, villageNow())) &&
      localDateKey(
        new ZonedDate(state.simulatedThrough, state.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
      ) <= input.dateKey,
    apply(state, input, proposal) {
      const { dateKey, opportunity } = input;
      if (state.backgroundPace === "off" || state.processedActionIds.includes(opportunity.id)) return;
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
    },
  };
  return { reconcile, handler };
}
