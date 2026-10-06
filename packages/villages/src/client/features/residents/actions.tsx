import type {
  AgendaListResponse,
  BackgroundWork,
  CatalogEntry,
  MemoryLibrary,
  VillagerAgendaView,
  VillagerRefreshPreview,
  VillageSnapshot,
} from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { type SetStateAction, useCallback } from "react";

export function useLoadMemoryLibrary(ports: {
  setError: React.Dispatch<SetStateAction<string>>;
  setMemoryLibrary: React.Dispatch<SetStateAction<MemoryLibrary>>;
}) {
  const { setError, setMemoryLibrary } = ports;
  return useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<MemoryLibrary>("/memories", { signal });
      if (signal?.aborted) return;
      setMemoryLibrary(response);
      setError("");
    } catch (cause) {
      if (signal?.aborted) return;
      setMemoryLibrary(null);
      setError(messageFrom(cause, "Could not read villager memories."));
    }
  }, []);
}

export function useForgetMemory(ports: {
  loadMemoryLibrary: (signal?: AbortSignal) => Promise<void>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { loadMemoryLibrary, setBusy, setError } = ports;
  return useCallback(
    async (kind: "durable" | "recollections", id: string) => {
      const label = kind === "durable" ? "Forget this durable memory?" : "Let this passing recollection go now?";
      if (!window.confirm(label)) return;
      setBusy(true);
      try {
        await request(`/memories/${kind}/${encodeURIComponent(id)}`, { method: "DELETE" });
        await loadMemoryLibrary();
      } catch (cause) {
        setError(messageFrom(cause, "That memory could not be removed."));
      } finally {
        setBusy(false);
      }
    },
    [loadMemoryLibrary],
  );
}

export function useLoadAgendas(ports: {
  setAgendas: React.Dispatch<SetStateAction<VillagerAgendaView[]>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { setAgendas, setError } = ports;
  return useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await request<AgendaListResponse>("/agendas", { signal });
      if (signal?.aborted) return;
      setAgendas(response.villagers);
    } catch (cause) {
      if (signal?.aborted) return;
      setAgendas(null);
      setError(messageFrom(cause, "Could not read what the villagers wish for."));
    }
  }, []);
}

export function useRewriteAgenda(ports: {
  agendaActions: React.RefObject<Map<string, string>>;
  currentSnapshotRef: React.RefObject<VillageSnapshot>;
  retryWork: (job: BackgroundWork) => Promise<void>;
  setAgendas: React.Dispatch<SetStateAction<VillagerAgendaView[]>>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { agendaActions, currentSnapshotRef, retryWork, setAgendas, setBusy, setError } = ports;
  return useCallback(
    async (characterId: string) => {
      setBusy(true);
      try {
        const job = currentSnapshotRef.current?.backgroundWork?.find(
          (entry) =>
            entry.kind === "agenda" &&
            entry.subjectId === characterId &&
            ["failed", "interrupted", "paused"].includes(entry.status),
        );
        if (job) {
          await retryWork(job);
          return;
        }
        const actionId = agendaActions.current.get(characterId) ?? createVillagesClientId();
        agendaActions.current.set(characterId, actionId);
        const response = await request<AgendaListResponse>(`/agendas/${encodeURIComponent(characterId)}/regenerate`, {
          method: "POST",
          body: JSON.stringify({ actionId }),
        });
        agendaActions.current.delete(characterId);
        setAgendas(response.villagers);
        setError("");
      } catch (cause) {
        setError(messageFrom(cause, "That villager could not be asked again."));
      } finally {
        setBusy(false);
      }
    },
    [retryWork],
  );
}

export function useCorrectCompletedWish(ports: {
  setAgendas: React.Dispatch<SetStateAction<VillagerAgendaView[]>>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { setAgendas, setBusy, setError } = ports;
  return useCallback(async (characterId: string, wishId: string) => {
    setBusy(true);
    try {
      const response = await request<AgendaListResponse>(
        `/agendas/${encodeURIComponent(characterId)}/completed/${encodeURIComponent(wishId)}/correct`,
        { method: "POST" },
      );
      setAgendas(response.villagers);
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "That wish completion could not be corrected."));
    } finally {
      setBusy(false);
    }
  }, []);
}

export function useSetAgendaScheduleIngestion(ports: {
  setAgendas: React.Dispatch<SetStateAction<VillagerAgendaView[]>>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { setAgendas, setBusy, setError } = ports;
  return useCallback(async (characterId: string, enabled: boolean, categories?: Record<string, boolean>) => {
    setBusy(true);
    try {
      const response = await request<AgendaListResponse>(`/agendas/${encodeURIComponent(characterId)}/influence`, {
        method: "PATCH",
        body: JSON.stringify({ enabled, categories }),
      });
      setAgendas(response.villagers);
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "Schedule use could not be changed."));
    } finally {
      setBusy(false);
    }
  }, []);
}

export function useAddVillager(ports: {
  loadCatalog: (signal?: AbortSignal) => Promise<void>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { loadCatalog, setBusy, setError, setSnapshot } = ports;
  return useCallback(
    async (characterId: string) => {
      setBusy(true);
      try {
        setSnapshot(
          await request<VillageSnapshot>("/villagers", {
            method: "POST",
            body: JSON.stringify({ characterId }),
          }),
        );
        setError("");
        await loadCatalog();
      } catch (cause) {
        setError(messageFrom(cause, "That character could not move in."));
      } finally {
        setBusy(false);
      }
    },
    [loadCatalog],
  );
}

export function useRemoveVillager(ports: {
  catalog: CatalogEntry[];
  loadCatalog: (signal?: AbortSignal) => Promise<void>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { catalog, loadCatalog, setBusy, setError, setSnapshot } = ports;
  return useCallback(
    async (characterId: string) => {
      setBusy(true);
      try {
        setSnapshot(
          await request<VillageSnapshot>(`/villagers/${encodeURIComponent(characterId)}`, { method: "DELETE" }),
        );
        setError("");
        if (catalog) await loadCatalog();
      } catch (cause) {
        setError(messageFrom(cause, "That villager could not leave."));
      } finally {
        setBusy(false);
      }
    },
    [catalog, loadCatalog],
  );
}

export function usePreviewVillagerRefresh(ports: {
  setError: React.Dispatch<SetStateAction<string>>;
  setRefreshBusyId: React.Dispatch<SetStateAction<string>>;
  setRefreshPreviews: React.Dispatch<SetStateAction<Record<string, VillagerRefreshPreview>>>;
}) {
  const { setError, setRefreshBusyId, setRefreshPreviews } = ports;
  return useCallback(async (characterId: string) => {
    setRefreshBusyId(characterId);
    try {
      const preview = await request<VillagerRefreshPreview>(`/villagers/${encodeURIComponent(characterId)}/refresh`);
      setRefreshPreviews((current) => ({ ...current, [characterId]: preview }));
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "That villager's card could not be compared."));
    } finally {
      setRefreshBusyId("");
    }
  }, []);
}

export function useApplyVillagerRefresh(ports: {
  setError: React.Dispatch<SetStateAction<string>>;
  setRefreshBusyId: React.Dispatch<SetStateAction<string>>;
  setRefreshPreviews: React.Dispatch<SetStateAction<Record<string, VillagerRefreshPreview>>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { setError, setRefreshBusyId, setRefreshPreviews, setSnapshot } = ports;
  return useCallback(async (characterId: string) => {
    setRefreshBusyId(characterId);
    try {
      setSnapshot(
        await request<VillageSnapshot>(`/villagers/${encodeURIComponent(characterId)}/refresh`, {
          method: "POST",
        }),
      );
      setRefreshPreviews((current) => {
        const next = { ...current };
        delete next[characterId];
        return next;
      });
      setError("");
    } catch (cause) {
      setError(messageFrom(cause, "That villager's card could not be refreshed."));
    } finally {
      setRefreshBusyId("");
    }
  }, []);
}
