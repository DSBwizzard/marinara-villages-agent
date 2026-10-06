import type { VillageState } from "./types.js";
import { mutateVillageState, readVillageState } from "./village-store.js";

export type FoundingProgress = NonNullable<VillageState["foundingPreparation"]>;

/** Progress is saved with the work, never inferred from elapsed time. */
export async function reportFoundingProgress(
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
