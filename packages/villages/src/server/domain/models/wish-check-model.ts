import type { VenueRecordEvent } from "./scene-model.js";
import type { VillageWish } from "./world.js";

export type WishHistoryReference = {
  format: 1;
  world: string;
  count: number;
  root: { id: string; digest: string; height: number };
};
export type CapturedWishOwner = {
  actorId: string;
  wishId: string;
  fingerprint: string;
  capturedAt: string;
  wishes: VillageWish[];
};
export type CapturedWishSnapshot = {
  format: 1;
  sceneId: string;
  seed: string;
  setupAt: string;
  owners: (Omit<CapturedWishOwner, "wishes"> & { head: WishHistoryReference | null })[];
};
export type CapturedWishContexts = CapturedWishOwner[] | CapturedWishSnapshot;

export type ExchangeEffectReceipt = {
  wishOutcome?: "fulfilled" | "corrected";
  wishDisclosures?: import("../../../shared/contracts/wishes.js").WishDisclosure[];
  wishGoal?: string;
  wishAudience?: string[];
  wishDisclosure?: true;
  memoryProposal?: import("./memories.js").MemoryProposal;
  committedAt?: string;
  noticeSequence?: number;
  status?: "applied" | "rejected";
  actorId?: string;
  wishId?: string;
  id: string;
  sceneId: string;
  submissionId: string;
  domain: "wishes" | "memories" | "physical" | "development" | "relationships";
  /** Stable action/source identity for idempotent offscreen physical settlement. */
  sourceHash?: string;
  physicalOutcome?: import("./world.js").VillageVenueEvent;
  /** Immutable private writing context from this exact effect, never live authority. */
  sceneFacts?: import("../rules/scene-continuity.js").SceneEffectFacts;
  at: string;
  evidenceIds: string[];
  reason: string;
  notice?: VenueRecordEvent;
};
export type WishProposal = import("../rules/social-wishes.js").SocialWishChange;
