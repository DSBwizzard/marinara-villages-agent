import { VILLAGES_PACKAGE_ID, villagesDocuments } from "../../adapters/engine/runtime-host.js";
import { type DocumentSlot, mutateDocument } from "../../adapters/storage/document-store.js";
import type { RelationshipState } from "../../domain/models/relationship-types.js";
import type { VillageState } from "../../domain/models/world.js";
import {
  coerceRelationshipState,
  defaultRelationshipState,
  reconcileRelationships,
} from "../../domain/rules/relationship-rules.js";
import { createHash } from "node:crypto";

export {
  relationshipKey,
  permissionKey,
  defaultRelationshipState,
  neutralRelationship,
  relationshipFor,
  coerceRelationshipState,
  reconcileRelationships,
  relationshipZoneController,
  applyRelationshipReview,
} from "../../domain/rules/relationship-rules.js";

const documentId = (seed: string) =>
  `villages-relationships-${createHash("sha256").update(seed).digest("hex").slice(0, 24)}`;

function slot(seed: string): DocumentSlot<RelationshipState> {
  return {
    kind: "relationships",
    name: "Villager relationships",
    description: "Directional feelings, evidence, and social permissions; independent of memories.",
    coerce: (raw) => coerceRelationshipState(seed, raw),
    label: () => "Villager relationships",
  };
}
export async function readRelationshipState(seed: string): Promise<RelationshipState> {
  if (!seed) return defaultRelationshipState(seed);
  const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, documentId(seed));
  return coerceRelationshipState(seed, document?.data);
}
export async function mutateRelationships(
  seed: string,
  update: (state: RelationshipState) => void | Promise<void>,
): Promise<RelationshipState> {
  if (!seed) throw new Error("Found a village before changing relationships.");
  let result = defaultRelationshipState(seed);
  await mutateDocument(documentId(seed), slot(seed), async (state) => {
    await update(state);
    result = state;
  });
  return result;
}

/** Pure, replayable domain settlement. The saved visit is the outbox, not the memory store. */

/** Persist lost authority even if the worker/owner is later assigned again. */
export async function persistRelationshipAuthority(village: VillageState): Promise<void> {
  if (!village.seed) return;
  const current = await readRelationshipState(village.seed);
  if (!Object.keys(current.edges).length && !Object.keys(current.grants).length && !current.socialPlans.length) return;
  const { reconcileSocialPlans } = await import("../../domain/rules/social-rules.js");
  const previous = JSON.stringify(current);
  reconcileRelationships(current, village);
  reconcileSocialPlans({ ...village, relationshipContext: current });
  if (JSON.stringify(current) === previous) return;
  await mutateRelationships(village.seed, (state) => {
    reconcileRelationships(state, village);
    reconcileSocialPlans({ ...village, relationshipContext: state });
  });
}
