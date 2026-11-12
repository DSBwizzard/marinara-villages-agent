import { type SetStateAction, useCallback, useLayoutEffect, useRef } from "react";
import type {
  AgendaListResponse,
  BackgroundWork,
  MemoryCursor,
  MemoryLibrary,
  MemoryListEntry,
  MemoryInspection,
  MemoryForgetRequest,
  VillagerAgendaView,
  VillagerRefreshPreview,
  VillageSnapshot,
} from "../../../shared/contracts/village.js";
import {
  invalidatesRead,
  messageFrom,
  request,
  VILLAGE_ACCESS_DENIED,
  villageAccessRevision,
} from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";

export function useLoadMemoryLibrary(ports: {
  worldScope: string;
  setError: React.Dispatch<SetStateAction<string>>;
  setMemoryLibrary: React.Dispatch<SetStateAction<MemoryLibrary>>;
}) {
  const active = useRef<AbortController | null>(null);
  const loadedQuery = useRef("");
  const { setError, setMemoryLibrary, worldScope } = ports;
  const scope = useRef(worldScope);
  scope.current = worldScope;
  useLayoutEffect(() => {
    loadedQuery.current = "";
    setMemoryLibrary(null);
    const denied = () => {
      active.current?.abort();
      loadedQuery.current = "";
      setMemoryLibrary(null);
    };
    window.addEventListener(VILLAGE_ACCESS_DENIED, denied);
    return () => {
      active.current?.abort();
      window.removeEventListener(VILLAGE_ACCESS_DENIED, denied);
    };
  }, [worldScope, setMemoryLibrary]);
  return useCallback(
    async (signal?: AbortSignal, query: { characterId?: string; query?: string; cursor?: MemoryCursor } = {}) => {
      if (scope.current !== worldScope) return;
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      const requestSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
      const params = new URLSearchParams({ characterId: query.characterId ?? "player", query: query.query ?? "" });
      if (query.cursor) {
        params.set("afterId", query.cursor.afterId);
        params.set("revision", String(query.cursor.revision));
      }
      const queryKey = JSON.stringify([
        worldScope,
        query.characterId ?? "player",
        query.query ?? "",
        query.cursor ?? null,
      ]);
      if (loadedQuery.current !== queryKey) setMemoryLibrary(null);
      try {
        const response = await request<MemoryLibrary>("/memories/inspect?" + params, { signal: requestSignal });
        if (requestSignal.aborted || active.current !== controller) return;
        loadedQuery.current = queryKey;
        setMemoryLibrary(response);
        setError("");
      } catch (cause) {
        if (requestSignal.aborted || active.current !== controller) return;
        if (invalidatesRead(cause)) setMemoryLibrary(null);
        setError(messageFrom(cause, "Could not read memories."));
      }
    },
    [setError, setMemoryLibrary, worldScope],
  );
}
export function useForgetMemory(ports: {
  loadMemoryLibrary: ReturnType<typeof useLoadMemoryLibrary>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { loadMemoryLibrary, setBusy, setError } = ports;
  const saving = useRef(false);
  const pending = useRef<{ key: string; body: MemoryForgetRequest } | null>(null);
  return useCallback(
    async (entry: MemoryListEntry, knowers: string[], library: MemoryLibrary) => {
      if (saving.current) return;
      saving.current = true;
      setBusy(true);
      try {
        const key = JSON.stringify([library.seed, entry, knowers]);
        if (pending.current?.key !== key) {
          const inspected = await request<MemoryInspection>(
            `/memories/inspect/${encodeURIComponent(entry.id)}?characterId=${encodeURIComponent(library.characterId)}`,
          );
          if (
            !inspected.target ||
            inspected.seed !== library.seed ||
            JSON.stringify(inspected.entry) !== JSON.stringify(entry)
          )
            throw new Error("The memory changed. Refresh the list.");
          pending.current = {
            key,
            body: { operationId: createVillagesClientId(), seed: library.seed, target: inspected.target, knowers },
          };
        }
        await request("/memories/" + encodeURIComponent(entry.id) + "/forget", {
          method: "POST",
          body: JSON.stringify(pending.current.body),
        });
        pending.current = null;
        await loadMemoryLibrary(undefined, { characterId: library.characterId, query: library.query });
      } catch (cause) {
        setError(messageFrom(cause, "Could not forget that memory."));
      } finally {
        saving.current = false;
        setBusy(false);
      }
    },
    [loadMemoryLibrary, setBusy, setError],
  );
}

export function useLoadAgendas(ports: {
  worldScope: string;
  agendaRevision: React.RefObject<number>;
  setAgendas: React.Dispatch<SetStateAction<VillagerAgendaView[]>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { setAgendas, setError, worldScope, agendaRevision } = ports;
  const scope = useRef(worldScope);
  scope.current = worldScope;
  const active = useRef<AbortController | null>(null);
  useLayoutEffect(() => {
    setAgendas(null);
    const denied = () => {
      active.current?.abort();
      setAgendas(null);
    };
    window.addEventListener(VILLAGE_ACCESS_DENIED, denied);
    return () => {
      active.current?.abort();
      window.removeEventListener(VILLAGE_ACCESS_DENIED, denied);
    };
  }, [worldScope, setAgendas]);
  return useCallback(
    async (signal?: AbortSignal) => {
      if (scope.current !== worldScope) return;
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      const requestSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
      const revision = agendaRevision.current;
      try {
        const response = await request<AgendaListResponse>("/agendas", { signal: requestSignal });
        if (requestSignal.aborted || revision !== agendaRevision.current) return;
        setAgendas(response.villagers);
      } catch (cause) {
        if (requestSignal.aborted || revision !== agendaRevision.current) return;
        if (invalidatesRead(cause)) setAgendas(null);
        setError(messageFrom(cause, "Could not read what the villagers wish for."));
      }
    },
    [setAgendas, setError, worldScope, agendaRevision],
  );
}

export function useRewriteAgenda(ports: {
  currentSnapshotRef: React.RefObject<VillageSnapshot>;
  retryWork: (job: BackgroundWork) => Promise<void>;
  setAgendas: React.Dispatch<SetStateAction<VillagerAgendaView[]>>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { currentSnapshotRef, retryWork, setAgendas, setBusy, setError } = ports;
  const agendaActions = useRef(new Map<string, string>());
  return useCallback(
    async (characterId: string) => {
      const worldScope = currentSnapshotRef.current?.worldScope;
      const access = villageAccessRevision();
      const current = () => currentSnapshotRef.current?.worldScope === worldScope && villageAccessRevision() === access;
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
        const key = JSON.stringify([worldScope, characterId]);
        const actionId = agendaActions.current.get(key) ?? createVillagesClientId();
        agendaActions.current.set(key, actionId);
        const response = await request<AgendaListResponse>(`/agendas/${encodeURIComponent(characterId)}/regenerate`, {
          method: "POST",
          body: JSON.stringify({ actionId }),
        });
        agendaActions.current.delete(key);
        if (!current()) return;
        setAgendas(response.villagers);
        setError("");
      } catch (cause) {
        if (current()) setError(messageFrom(cause, "That villager could not be asked again."));
      } finally {
        if (current()) setBusy(false);
      }
    },
    [currentSnapshotRef, retryWork, setAgendas, setBusy, setError],
  );
}

export function useSetScheduleInfluence(ports: {
  currentSnapshotRef: React.RefObject<VillageSnapshot>;
  setAgendas: React.Dispatch<SetStateAction<VillagerAgendaView[]>>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { currentSnapshotRef, setAgendas, setBusy, setError } = ports;
  return useCallback(
    async (characterId: string, enabled: boolean, categories?: Record<string, boolean>) => {
      const worldScope = currentSnapshotRef.current?.worldScope;
      const access = villageAccessRevision();
      const current = () => currentSnapshotRef.current?.worldScope === worldScope && villageAccessRevision() === access;
      setBusy(true);
      try {
        const response = await request<AgendaListResponse>(`/agendas/${encodeURIComponent(characterId)}/influence`, {
          method: "PATCH",
          body: JSON.stringify({ enabled, categories }),
        });
        if (!current()) return;
        setAgendas(response.villagers);
        setError("");
      } catch (cause) {
        if (current()) setError(messageFrom(cause, "Schedule use could not be changed."));
      } finally {
        if (current()) setBusy(false);
      }
    },
    [currentSnapshotRef, setAgendas, setBusy, setError],
  );
}

export function usePreviewVillagerRefresh(ports: {
  setError: React.Dispatch<SetStateAction<string>>;
  setRefreshBusyId: React.Dispatch<SetStateAction<string>>;
  setRefreshPreviews: React.Dispatch<SetStateAction<Record<string, VillagerRefreshPreview>>>;
}) {
  const { setError, setRefreshBusyId, setRefreshPreviews } = ports;
  return useCallback(
    async (characterId: string) => {
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
    },
    [setError, setRefreshBusyId, setRefreshPreviews],
  );
}

export function useApplyVillagerRefresh(ports: {
  setError: React.Dispatch<SetStateAction<string>>;
  setRefreshBusyId: React.Dispatch<SetStateAction<string>>;
  setRefreshPreviews: React.Dispatch<SetStateAction<Record<string, VillagerRefreshPreview>>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { setError, setRefreshBusyId, setRefreshPreviews, setSnapshot } = ports;
  return useCallback(
    async (characterId: string) => {
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
    },
    [setError, setRefreshBusyId, setRefreshPreviews, setSnapshot],
  );
}
