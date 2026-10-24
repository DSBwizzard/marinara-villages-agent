import { createResidentPlanning } from "../../packages/villages/src/server/features/residents/resident-planning-service.js";
import {
  buildResidentPlanningMessages as buildMessages,
  type ResidentPlanningContext,
} from "../../packages/villages/src/server/domain/rules/resident-planning.js";
import {
  readVillageState,
  mutateVillageState,
} from "../../packages/villages/src/server/features/world/village-store.js";
import { readEffectiveVillagerCard } from "../../packages/villages/src/server/adapters/engine/catalog.js";
import { queueBackgroundJob, backgroundJobSnapshot } from "../../packages/villages/src/server/jobs/background-work.js";
import { villagesLanguageModels } from "../../packages/villages/src/server/adapters/models/language-models.js";
import { villagesConnectionIdFor } from "../../packages/villages/src/server/features/settings/connections.js";
import { completeWithRoom } from "../../packages/villages/src/server/features/generation/model-requests.js";
export function planningContext(input: any): ResidentPlanningContext {
  const context = {
    version: 1,
    worldFacts: [],
    pendingHousingCharacterIds: [],
    social: { candidates: [], relationships: [] },
    ...input,
  };
  context.opportunity = input.opportunity ??
    input.opportunities?.[0] ?? { id: "quiet", kind: "routine", actorIds: [], venueId: "", facts: [] };
  context.residents = (context.residents ?? []).map((r: any) => ({
    ...r,
    profile: r.profile ?? r.summary ?? r.name,
    agenda: r.agenda ?? null,
  }));
  return context;
}
export function buildResidentPlanningMessages(input: any) {
  return buildMessages(planningContext(input));
}
export function proposeResidentChoices(input: any) {
  return createResidentPlanning({
    readVillageState,
    mutateVillageState,
    readEffectiveVillagerCard,
    queueBackgroundJob,
    backgroundJobSnapshot,
    villagesLanguageModels,
    villagesConnectionIdFor,
    completeWithRoom,
  }).handler.generate({ context: planningContext(input) });
}
