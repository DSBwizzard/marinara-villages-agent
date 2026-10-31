import type { SocialPlan } from "./relationship-types.js";
import type { ResidentPlanningOpportunity } from "./world.js";
import type { CapturedAdmission } from "./captured-admission-model.js";
import type { RelationshipHead } from "./relationship-types.js";

export type SocialOutboxEntry = {
  id: string;
  /** A return coordinator owns settlement ordering for this source. */
  catchupBatchId?: string;
  seed: string;
  at: string;
  opportunity: ResidentPlanningOpportunity;
  candidates: SocialPlan[];
  relationshipSnapshot?: import("./relationship-types.js").RelationshipState;
  relationshipHead?: never;
  proposal: { planId?: unknown; encounter?: unknown };
  requiredPlanId?: string;
  requiredPlan?: SocialPlan;
  processed?: boolean;
  error?: string;
  reinterpretRequired?: boolean;
  reinterpreted?: boolean;
  admitted?: Pick<import("./world.js").VillageState, "villagers" | "venues" | "residences" | "timeZone"> &
    Partial<Pick<import("./world.js").VillageState, "projects" | "opening" | "narrative">>;
};

export type CapturedSocialOutboxEntry = Omit<
  SocialOutboxEntry,
  "admitted" | "relationshipSnapshot" | "relationshipHead"
> & {
  admitted: CapturedAdmission<NonNullable<SocialOutboxEntry["admitted"]>>;
  relationshipHead: RelationshipHead | null;
  relationshipSnapshot?: never;
};
export type WorldSocialOutboxEntry = SocialOutboxEntry | CapturedSocialOutboxEntry;
