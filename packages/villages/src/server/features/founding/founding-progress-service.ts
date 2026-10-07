import type { mutateVillageState, readVillageState } from "../world/village-store.js";

import { type FoundingProgress } from "../../domain/models/founding-progress-model.js";

export type FoundingProgressServicePorts = {
  readVillageState: typeof readVillageState;
  mutateVillageState: typeof mutateVillageState;
};
/** Cold recipe: awaited stages retain one application's model and storage connections. */
export function createFoundingProgress(ports: FoundingProgressServicePorts) {
  const { readVillageState, mutateVillageState } = ports;

  async function reportFoundingProgress(
    seed: string,
    progress: Partial<FoundingProgress>,
    residentId?: string,
  ): Promise<void> {
    const current = await readVillageState();
    if (current.seed !== seed || current.foundingPreparation?.status !== "pending") return;
    if (
      residentId &&
      (current.foundingPreparation.phase !== "residents" || current.foundingPreparation.currentId !== residentId)
    )
      return;
    await mutateVillageState((state) => {
      const marker = state.foundingPreparation;
      if (state.seed !== seed || marker?.status !== "pending") return;
      if (residentId && (marker.phase !== "residents" || marker.currentId !== residentId)) return;
      Object.assign(marker, progress, { stageStartedAt: new Date().toISOString() });
    });
  }

  return { reportFoundingProgress };
}
export type FoundingProgressService = ReturnType<typeof createFoundingProgress>;
