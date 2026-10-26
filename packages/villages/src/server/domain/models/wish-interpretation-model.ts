import { wishCheckKnowledge } from "../rules/wish-journal.js";
import type { InterpretationEvidence } from "./interpretation-check-model.js";
import type { VillageWishClaimContext } from "./wish-claim-model.js";
import type { VillageVenueEvent } from "./world.js";

export type WishCriteria = {
  semanticVersion?: 2;
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
  /** Trusted player perception captured by the server, never a model verdict. */
  playerEvidenceIds?: string[];
  semanticCriteria?: WishCriteria;
  knowledge?: ReturnType<typeof wishCheckKnowledge>;
  knowledgeByWish?: Record<string, ReturnType<typeof wishCheckKnowledge>>;
  currentReceiptIds?: string[];
  actorId: string;
  evidence: InterpretationEvidence[];
  receipts: WishReceipt[];
};
