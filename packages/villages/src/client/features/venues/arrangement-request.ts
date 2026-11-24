import { useMemo } from "react";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { request } from "../../shared/api.js";
import { useVillageActivity } from "../../shared/activity.js";
import { useVillageMutationLifetime } from "../../shared/mutation-lifetime.js";
export type ArrangementController = { snapshot: VillageSnapshot; setSnapshot(value: VillageSnapshot): void };
export function useArrangementRequest(controller: ArrangementController, person: string, placeId: string) {
  const { viewing = true } = useVillageActivity();
  const revision = controller.snapshot.settings.venues.find((row) => row.id === placeId)?.accessView?.revision;
  const selection = useMemo(
    () => ({ world: controller.snapshot.worldScope, person, placeId, viewing, revision }),
    [controller.snapshot.worldScope, person, placeId, viewing, revision],
  );
  const lifetime = useVillageMutationLifetime(controller.snapshot.isFounded, undefined, selection);
  return async (path: string, body: unknown): Promise<boolean> => {
    if (!viewing) return false;
    const claim = lifetime.begin();
    if (!claim) return false;
    try {
      const next = await request<VillageSnapshot>(path, { method: "POST", body: JSON.stringify(body) });
      if (!lifetime.owns(claim)) return false;
      controller.setSnapshot(next);
      return true;
    } catch (cause) {
      if (lifetime.owns(claim)) throw cause;
      return false;
    } finally {
      lifetime.finish(claim);
    }
  };
}
