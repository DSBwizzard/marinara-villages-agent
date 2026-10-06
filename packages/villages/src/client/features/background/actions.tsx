import type { BackgroundWork, VillageSnapshot } from "../../../shared/contracts/village.js";
import { request } from "../../shared/api.js";
import { createVillagesClientId } from "../scenes/villages-venue-send";
import { useCallback } from "react";

export function useResidentsRetryWork(ports: {
  backgroundRetryActions: React.RefObject<Map<string, { id: string; attempt: number }>>;
  loadAgendas: (signal?: AbortSignal) => Promise<void>;
  setSnapshot: React.Dispatch<React.SetStateAction<import("../../../shared/contracts/village.js").VillageSnapshot>>;
}) {
  const { backgroundRetryActions, loadAgendas, setSnapshot } = ports;
  return useCallback(
    async (job: BackgroundWork) => {
      let action = backgroundRetryActions.current.get(job.id);
      if (!action) {
        action = { id: createVillagesClientId(), attempt: job.attempt };
        backgroundRetryActions.current.set(job.id, action);
      }
      const next = await request<VillageSnapshot>("/background/retry", {
        method: "POST",
        body: JSON.stringify({ id: job.id, expectedAttempt: action.attempt, actionId: action.id }),
      });
      setSnapshot(next);
      backgroundRetryActions.current.delete(job.id);
      await loadAgendas();
    },
    [loadAgendas],
  );
}
