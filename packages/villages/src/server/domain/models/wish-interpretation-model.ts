import { wishCheckKnowledge } from "../rules/wish-journal.js";
import type { InterpretationEvidence } from "./interpretation-check-model.js";
import type { VillageWishClaimContext } from "./wish-claim-model.js";
import type { VillageVenueEvent } from "./world.js";

export type WishCriteria = {
  conditionRevision?: number;
  conditionAt?: string;
  kind: "conversation" | "transfer" | "action" | "complex";
  goal: string;
  requiresPhysical: boolean;
  itemName?: string;
  predicate?: "item-added" | "item-removed" | "trace-resolved";
  target?: string;
  venueId?: string;
};
export type WishReceipt = VillageVenueEvent & { completedProject?: boolean };
export type WishInterpretationContext = VillageWishClaimContext & {
  knowledge?: ReturnType<typeof wishCheckKnowledge>;
  knowledgeByWish?: Record<string, ReturnType<typeof wishCheckKnowledge>>;
  currentReceiptIds?: string[];
  actorId: string;
  evidence: InterpretationEvidence[];
  receipts: WishReceipt[];
};
