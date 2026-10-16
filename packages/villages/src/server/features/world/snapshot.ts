import { bindActivationService, createActivationBinding } from "../../adapters/engine/activation-scope.js";
import type { VillageSnapshotService } from "./snapshot-service.js";

const binding = createActivationBinding<VillageSnapshotService>("Village snapshot service is not configured.");
export function configureVillageSnapshot(service: VillageSnapshotService): () => void {
  return binding.configure(bindActivationService(service));
}
export async function buildVillageSnapshot(...args: Parameters<VillageSnapshotService["buildVillageSnapshot"]>) {
  return binding.get().buildVillageSnapshot(...args);
}
