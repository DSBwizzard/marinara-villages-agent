import { recordHousingAvailability } from "../../domain/rules/development-housing.js";
import type { Handler } from "../../domain/models/background-model.js";
import type { DevelopmentReview } from "../../domain/models/development-model.js";
import {
  developmentReview,
  developmentReviewValid,
  applyDevelopmentReview,
  initializeDevelopment,
  moveConsentingActors,
  DEVELOPMENT_MOVE_MS,
} from "../../domain/rules/resident-development.js";
import { readDevelopmentProposal } from "../../domain/rules/development-codec.js";
import { backgroundRevision } from "../../domain/rules/background-revision.js";
import { extractModelJsonObject } from "../../domain/rules/json-reply.js";
import { badRequest } from "../../domain/rules/errors.js";
import { venueResidentIds } from "../../domain/rules/venue-model.js";
import { venueZones } from "../../domain/rules/venue-zones.js";
import { villageNow, assertVillageClockWrite } from "../../adapters/time/clock-gate.js";
export type DevelopmentPorts = {
  readVillageState: typeof import("./village-store.js").readVillageState;
  mutateVillageState: typeof import("./village-store.js").mutateVillageState;
  backgroundJobSnapshot: typeof import("../../jobs/background-work.js").backgroundJobSnapshot;
  retryBackgroundJob: typeof import("../../jobs/background-work.js").retryBackgroundJob;
  queueBackgroundJob: typeof import("../../jobs/background-work.js").queueBackgroundJob;
  villagesLanguageModels: typeof import("../../adapters/models/language-models.js").villagesLanguageModels;
  villagesConnectionIdFor: typeof import("../settings/connections.js").villagesConnectionIdFor;
  completeWithRoom: typeof import("../generation/model-requests.js").completeWithRoom;
};
export const DEVELOPMENT_INSTRUCTION = `Review resident development over the supplied elapsed interval. You choose fictional decisions; code alone authorizes effects.
Return ONLY {version:1,steps:[],reviews:[{characterId,nextReviewHours:24..168,reason}]}.
One review for each offered resident, at most six chronological steps TOTAL. Existing pursuits come first. Quiet periods and no intention are valid. No daily replay or forced progress. Consider character motives, existing memories, others' independent wishes, available homes, consent and plausible opportunities to speak. Knowledge belongs only to the named knowers; no omniscient residents.
Each step: {id:unique,pursuitId,characterId,kind:"intend|consent|wait|end|move",at:ISO,reason,dependsOn:[earlier accepted step IDs],targetVenueId?,privateZoneId?,actorId?,decision?:"agree|refuse|conditional"}.
Use stable existing pursuit IDs. For a new intend use a new pursuitId, exact targetVenueId and optional vacant privateZoneId. An intention is consideration, NOT consent. Each consent is the named resident's own new decision, shared with the mover. Never generate player consent. Respect actual conditions; unresolved conditions are conditional, never agree. Previously refused/conditional consent stays unresolved unless that person truly changes their mind for a supported reason. Do not resolve their position merely because the mover wants it.
Intending or arranging a home must be on/after its availableFrom; present vacancy never proves past vacancy. Steps must fall on/after that resident's nextReviewAt and reviewedThrough and no later than through. Decisions follow their causes. Move requires unconditional consent from ALL supplied consentingActors, including mover, household, property and room controllers; existing player consent must come from saved conversation evidence. Start takes 24 real hours; code completes when due. Move is the terminal step for that resident in this batch: never invent life after occupancy. If no consent/opportunity exists, wait, reconsider or end. At most one active move per resident and two substantial pursuits overall. Never start Projects, construct homes, displace occupants, grant access, create objects, leave the Village or alter Wishes. Reasons are short plain language. nextReviewHours is a delay after through; relevant future conversations may trigger an earlier review.`;
export function createDevelopment(ports: DevelopmentPorts) {
  async function inspectDevelopment() {
    const state = await ports.readVillageState();
    const work = await ports.backgroundJobSnapshot("development", "village");
    return {
      work: work?.seed === state.seed ? { status: work.status, error: work.error, requests: work.requests } : null,
      enabled: state.development?.enabled ?? false,
      activatedAt: state.development?.activatedAt ?? null,
      residents: state.villagers.map((r) => ({
        characterId: r.characterId,
        name: r.cardSnapshot.name,
        ...state.development?.residents[r.characterId],
      })),
      log: state.development?.log.slice(-30).reverse() ?? [],
    };
  }
  async function setDevelopment(enabled: unknown) {
    if (typeof enabled !== "boolean") throw badRequest("Choose whether resident development is enabled.");
    await assertVillageClockWrite();
    await ports.mutateVillageState((state) => initializeDevelopment(state, enabled, villageNow().toISOString()));
    return inspectDevelopment();
  }
  async function reconcileDevelopment(now: Date = villageNow(), actionId?: string) {
    let state = await ports.readVillageState();
    if (!state.development?.enabled) return;
    if (state.villagers.some((r) => !state.development!.residents[r.characterId])) {
      await ports.mutateVillageState((state) => {
        if (!state.development?.enabled) return;
        for (const r of state.villagers)
          state.development.residents[r.characterId] ??= {
            revision: 0,
            reviewedThrough: now.toISOString(),
            nextReviewAt: new Date(now.getTime() + DEVELOPMENT_MOVE_MS).toISOString(),
            reason: "First review after one day.",
            pursuits: [],
          };
      });
      state = await ports.readVillageState();
    }
    const previous = await ports.backgroundJobSnapshot("development", "village");
    const slotId = "villages-background-" + backgroundRevision(["development", "village"]);
    if (
      previous?.seed === state.seed &&
      ["failed", "interrupted", "paused"].includes(previous.status) &&
      state.backgroundReceipts[slotId] === previous.id
    ) {
      await ports.retryBackgroundJob(slotId, previous.attempt, "development-ack-" + previous.id);
      return;
    }
    if (previous?.seed === state.seed && previous.status !== "completed") {
      if (!actionId || ["queued", "running", "paused"].includes(previous.status)) return;
      if (previous.input && developmentReviewValid(state, (previous.input as { review: DevelopmentReview }).review)) {
        await ports.retryBackgroundJob(slotId, previous.attempt, actionId);
        return;
      }
    }
    state = await ports.mutateVillageState((state) => recordHousingAvailability(state, now.toISOString()));
    const review = developmentReview(state, now.toISOString());
    if (!review) return;
    const residents = state.villagers.map((r) => ({
      characterId: r.characterId,
      character: {
        name: r.cardSnapshot.name,
        description: r.cardSnapshot.description,
        personality: r.cardSnapshot.personality,
        backstory: r.cardSnapshot.backstory,
      },
      pursuits: state.development?.residents[r.characterId]?.pursuits ?? [],
      home: state.venues.find((v) => venueResidentIds(v).includes(r.characterId))?.id ?? "",
      memories: state.chronicle
        .filter(
          (m) => m.scope === "village" || (m.knownByCharacterIds ?? m.actors.map((a) => a.id)).includes(r.characterId),
        )
        .filter((m) => !m.supersededBy)
        .slice(-8)
        .map((m) => ({ id: m.id, text: m.text, at: m.occurredAt })),
    }));
    const homes = state.venues
      .filter((v) => v.classes.includes("residence"))
      .map((v) => ({
        id: v.id,
        name: v.name,
        form: v.form,
        capacity: v.residenceCapacity,
        availableFrom: review.housingAvailableAt[v.id],
        residentIds: venueResidentIds(v),
        playerHome: v.occupancy.playerHome,
        zones: venueZones(v)
          .filter((z) => z.kind === "private-residence")
          .map((z) => ({
            id: z.id,
            ownerId: z.ownerId,
            consentingActors: Object.fromEntries(
              review.residentIds.map((id) => [id, moveConsentingActors(v, z.id, id)]),
            ),
          })),
        consentingActors: Object.fromEntries(review.residentIds.map((id) => [id, moveConsentingActors(v, "", id)])),
        access: v.access ? { managerIds: v.access.managerIds, revision: v.access.revision } : null,
      }));
    await ports.queueBackgroundJob({
      kind: "development",
      subjectId: "village",
      seed: state.seed,
      revision: backgroundRevision([review.generation, review.residents, review.housingRevision]),
      finite: false,
      label: "Resident development",
      ...(actionId ? { retryActionId: actionId, expectedAttempt: previous?.attempt ?? 0 } : {}),
      residentIds: review.residentIds,
      input: {
        review,
        context: {
          setting: state.setting,
          worldFacts: state.worldFacts,
          residents,
          homes,
          pendingMoves: state.residences.filter((r) => r.status !== "current"),
        },
      },
    });
  }
  const handler: Handler = {
    async generate(input: { review: DevelopmentReview; context: unknown }) {
      const model = await ports
        .villagesLanguageModels()
        .resolveForRequest({ connectionId: await ports.villagesConnectionIdFor("system") });
      const messages = [
        { role: "system" as const, content: DEVELOPMENT_INSTRUCTION },
        { role: "user" as const, content: JSON.stringify(input) },
      ];
      const fitted = model.fitContext(messages, { maxTokens: Math.min(model.maxOutputTokens ?? 4096, 4096) });
      if (
        fitted.messages.length !== messages.length ||
        fitted.messages.some((message, index) => message.content !== messages[index]!.content)
      )
        throw badRequest("The development context does not fit this connection. No request was sent.");
      const response = await ports.completeWithRoom(model, fitted.messages, fitted.maxTokens ?? 4096, {
        responseFormat: { type: "json_object" },
        retryEmpty: false,
        temperature: 0.7,
      });
      return readDevelopmentProposal(extractModelJsonObject(response));
    },
    valid: (state, input) => developmentReviewValid(state, input.review),
    apply: (state, input, result) =>
      applyDevelopmentReview(state, input.review, readDevelopmentProposal(result), villageNow().toISOString()),
  };
  return { inspectDevelopment, setDevelopment, reconcileDevelopment, handler };
}
export type Development = ReturnType<typeof createDevelopment>;
