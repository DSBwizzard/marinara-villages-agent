import type { VillageVillager } from "./world.js";
import type { WishHistoryReference } from "./wish-check-model.js";
import type { RelationshipHead } from "./relationship-types.js";

/** Native captures retain metadata and exact history references; consumers load one selected input. */
export type CapturedAdmission<T extends { villagers: VillageVillager[] }> = Omit<
  T,
  "villagers" | "relationshipContext"
> & {
  admissionFormat: 1;
  seed: string;
  setupAt: string;
  villagers: (Omit<VillageVillager, "wishes"> & { wishHead: WishHistoryReference | null })[];
  relationshipHead?: RelationshipHead | null;
};
