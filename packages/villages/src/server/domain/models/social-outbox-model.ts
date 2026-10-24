import type { SocialPlan } from "./relationship-types.js";
import type { VillageOpportunity } from "./world.js";

export type SocialOutboxEntry = {
  id: string;
  seed: string;
  at: string;
  opportunity: VillageOpportunity;
  candidates: SocialPlan[];
  relationshipSnapshot?: import("./relationship-types.js").RelationshipState;
  proposal: { planId?: unknown; encounter?: unknown };
  requiredPlanId?: string;
  requiredPlan?: SocialPlan;
  processed?: boolean;
  error?: string;
  reinterpretRequired?: boolean;
  reinterpreted?: boolean;
  admitted?: Pick<import("./world.js").VillageState, "villagers" | "venues" | "residences" | "timeZone"> &
    Partial<Pick<import("./world.js").VillageState, "projects">>;
};
