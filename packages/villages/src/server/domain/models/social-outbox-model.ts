import type { SocialPlan } from "./relationship-types.js";
import type { ResidentPlanningOpportunity } from "./world.js";

export type SocialOutboxEntry = {
  id: string;
  seed: string;
  at: string;
  opportunity: ResidentPlanningOpportunity;
  candidates: SocialPlan[];
  proposal: { planId?: unknown; encounter?: unknown };
  requiredPlanId?: string;
  processed?: boolean;
};
