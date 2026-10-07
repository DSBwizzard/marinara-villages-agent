import { VILLAGES_PACKAGE_ID } from "../engine/runtime-host.js";
import { coerceVillageState } from "../../domain/decoding/village-codec.js";
import type { VillageRepository } from "../../domain/models/world-repository.js";
import type { VillageState } from "../../domain/models/world.js";
import { createDocumentMutator, type DocumentSlot } from "./document-store.js";
import type { CapabilityDocumentStore } from "@marinara-engine/shared";

const VILLAGE_DOC_ID = "villages-village";
const villageSlot: DocumentSlot<VillageState> = {
  kind: "village",
  name: "Village record",
  description: "The village's own record of itself, kept by the Villages package.",
  coerce: coerceVillageState,
  label: (state) => state.name,
};

/** Construction is inert; each operation resolves storage at its original read point. */
export function createVillageRepository(documents: () => CapabilityDocumentStore): VillageRepository {
  const mutateDocument = createDocumentMutator(documents);
  return {
    async readAuthority() {
      const record = await documents().getById(VILLAGES_PACKAGE_ID, VILLAGE_DOC_ID);
      return coerceVillageState(record?.data);
    },
    mutateAuthority(update) {
      return mutateDocument(VILLAGE_DOC_ID, villageSlot, update);
    },
  };
}
