import { villageNow } from "../../adapters/time/clock-gate.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";
import type { HydratedDocumentSlot, mutateDocument } from "../../adapters/storage/document-store.js";
import {
  relationshipPayloadStore,
  relationshipDocumentId,
  readRelationshipRoot,
  type RelationshipHead,
  type RelationshipScope,
} from "../../adapters/storage/relationship-payload-store.js";
import { withRepairWork } from "../../adapters/storage/repair-gate.js";
import { memoryRequire } from "../../domain/rules/memory-integrity.js";
import type { RelationshipState } from "../../domain/models/relationship-types.js";
import type { VillageState } from "../../domain/models/world.js";
import { defaultRelationshipState, reconcileRelationships } from "../../domain/rules/relationship-rules.js";
export type RelationshipStorePorts = {
  VILLAGES_PACKAGE_ID: string;
  villagesDocuments(): CapabilityDocumentStore;
  mutateDocument: typeof mutateDocument;
};
/** Relationship documents and authority settlement use one application's storage. */
export function createRelationshipStore(ports: RelationshipStorePorts) {
  const { VILLAGES_PACKAGE_ID, villagesDocuments, mutateDocument } = ports;
  const store = relationshipPayloadStore;
  async function owner(documents: CapabilityDocumentStore, seed: string): Promise<RelationshipScope> {
    const row = await documents.getById(VILLAGES_PACKAGE_ID, "villages-village"),
      data = row?.data as Partial<VillageState> | undefined;
    memoryRequire(
      row?.id === "villages-village" &&
        row.packageId === VILLAGES_PACKAGE_ID &&
        row.kind === "village" &&
        data?.seed === seed &&
        typeof data.setupAt === "string",
      "relationship publication belongs to another Village",
    );
    return { seed, setupAt: data.setupAt };
  }

  const documentId = relationshipDocumentId;

  function slot(documents: CapabilityDocumentStore, scope: RelationshipScope): HydratedDocumentSlot<RelationshipState> {
    let previous: RelationshipHead | undefined;
    return {
      kind: "relationships",
      name: "Villager relationships",
      description: "Directional feelings, evidence, and social permissions; independent of memories.",
      coerce: async (raw) => {
        previous = undefined;
        if (raw === undefined) return defaultRelationshipState(scope.seed);
        previous = readRelationshipRoot(raw, scope).head;
        return store(documents).read(previous, scope, true);
      },
      encode: async (state, expectedRevision) => ({
        format: 4,
        ...scope,
        head: await store(documents).prepare(state, scope, previous, expectedRevision),
      }),
      label: () => "Villager relationships",
    };
  }

  async function readRelationshipState(seed: string): Promise<RelationshipState> {
    if (!seed) return defaultRelationshipState(seed);
    return withRepairWork(async () => {
      const documents = villagesDocuments(),
        scope = await owner(documents, seed);
      const document = await documents.getById(VILLAGES_PACKAGE_ID, documentId(seed));
      if (!document) return defaultRelationshipState(seed);
      memoryRequire(
        document.id === documentId(seed) &&
          document.packageId === VILLAGES_PACKAGE_ID &&
          document.kind === "relationships",
        "invalid relationship owner identity",
      );
      return store(documents).read(readRelationshipRoot(document.data, scope).head, scope, true);
    });
  }

  async function mutateRelationships(
    seed: string,
    update: (state: RelationshipState) => void | Promise<void>,
  ): Promise<RelationshipState> {
    if (!seed) throw new Error("Found a village before changing relationships.");
    return withRepairWork(async () => {
      const documents = villagesDocuments(),
        scope = await owner(documents, seed);
      let result = defaultRelationshipState(seed);
      await mutateDocument(documentId(seed), slot(documents, scope), async (state) => {
        await update(state);
        result = state;
      });
      return result;
    });
  }

  async function persistRelationshipAuthority(village: VillageState): Promise<void> {
    if (!village.seed) return;
    const current = await readRelationshipState(village.seed);
    if (!Object.keys(current.edges).length && !Object.keys(current.grants).length && !current.socialPlans.length)
      return;
    const { reconcileSocialPlans } = await import("../../domain/rules/social-rules.js");
    const grantsChanged = reconcileRelationships(current, village, villageNow().getTime());
    const plansChanged = reconcileSocialPlans({ ...village, relationshipContext: current }, villageNow());
    if (!grantsChanged && !plansChanged) return;
    await mutateRelationships(village.seed, (state) => {
      reconcileRelationships(state, village, villageNow().getTime());
      reconcileSocialPlans({ ...village, relationshipContext: state }, villageNow());
    });
  }

  return { readRelationshipState, mutateRelationships, persistRelationshipAuthority };
}
export type RelationshipStoreService = ReturnType<typeof createRelationshipStore>;
