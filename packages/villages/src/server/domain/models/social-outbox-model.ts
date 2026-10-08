import type { SocialPlan } from "./relationship-types.js";
import type { VillageOpportunity } from "./world.js";

export type SocialOutboxEntry = {
  id: string;
  seed: string;
  at: string;
  opportunity: VillageOpportunity;
  candidates: SocialPlan[];
  proposal: { planId?: unknown; encounter?: unknown };
  requiredPlanId?: string;
  processed?: boolean;
};
