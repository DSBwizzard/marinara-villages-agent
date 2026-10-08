import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import { createHash } from "node:crypto";
import type { DocumentSlot, mutateDocument } from "../../adapters/storage/document-store.js";
import type { RelationshipState } from "../../domain/models/relationship-types.js";
import type { VillageState } from "../../domain/models/world.js";
import {
  coerceRelationshipState,
  defaultRelationshipState,
  reconcileRelationships,
} from "../../domain/rules/relationship-rules.js";
export type RelationshipStorePorts = {
  VILLAGES_PACKAGE_ID: string;
  villagesDocuments(): Pick<CapabilityDocumentStore, "getById">;
  mutateDocument: typeof mutateDocument;
};
/** Relationship documents and authority settlement use one application's storage. */
export function createRelationshipStore(ports: RelationshipStorePorts) {
  const { VILLAGES_PACKAGE_ID, villagesDocuments, mutateDocument } = ports;

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

  async function readRelationshipState(seed: string): Promise<RelationshipState> {
    if (!seed) return defaultRelationshipState(seed);
    const document = await villagesDocuments().getById(VILLAGES_PACKAGE_ID, documentId(seed));
    return coerceRelationshipState(seed, document?.data);
  }

  async function mutateRelationships(
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

  async function persistRelationshipAuthority(village: VillageState): Promise<void> {
    if (!village.seed) return;
    const current = await readRelationshipState(village.seed);
    if (!Object.keys(current.edges).length && !Object.keys(current.grants).length && !current.socialPlans.length)
      return;
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

  return { readRelationshipState, mutateRelationships, persistRelationshipAuthority };
}
export type RelationshipStoreService = ReturnType<typeof createRelationshipStore>;
