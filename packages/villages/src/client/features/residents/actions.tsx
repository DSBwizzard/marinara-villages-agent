import { type SetStateAction, useCallback, useRef } from "react";
import type {
  AgendaListResponse,
  BackgroundWork,
  CatalogEntry,
  MemoryCursor,
  MemoryLibrary,
  MemoryListEntry,
  VillagerAgendaView,
  VillagerRefreshPreview,
  VillageSnapshot,
} from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";

export function useLoadMemoryLibrary(ports: {
  setError: React.Dispatch<SetStateAction<string>>;
  setMemoryLibrary: React.Dispatch<SetStateAction<MemoryLibrary>>;
}) {
  const active = useRef<AbortController | null>(null);
  const { setError, setMemoryLibrary } = ports;
  return useCallback(
    async (signal?: AbortSignal, query: { characterId?: string; query?: string; cursor?: MemoryCursor } = {}) => {
      active.current?.abort();
      const controller = new AbortController();
      active.current = controller;
      const requestSignal = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
      const params = new URLSearchParams({ characterId: query.characterId ?? "player", query: query.query ?? "" });
      if (query.cursor) {
        params.set("afterId", query.cursor.afterId);
        params.set("revision", String(query.cursor.revision));
      }
      setMemoryLibrary(null);
      try {
        const response = await request<MemoryLibrary>("/memories/inspect?" + params, { signal: requestSignal });
        if (requestSignal.aborted || active.current !== controller) return;
        setMemoryLibrary(response);
        setError("");
      } catch (cause) {
        if (requestSignal.aborted || active.current !== controller) return;
        setError(messageFrom(cause, "Could not read memories."));
      }
    },
    [setError, setMemoryLibrary],
  );
}
export function useForgetMemory(ports: {
  loadMemoryLibrary: ReturnType<typeof useLoadMemoryLibrary>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { loadMemoryLibrary, setBusy, setError } = ports;
  return useCallback(
    async (entry: MemoryListEntry, knowers: string[], library: MemoryLibrary) => {
      setBusy(true);
      try {
        await request("/memories/" + encodeURIComponent(entry.id) + "/forget", {
          method: "POST",
          body: JSON.stringify({
            operationId: createVillagesClientId(),
            seed: library.seed,
            expectedCollectionRevision: library.revision,
            target: { id: entry.id, revision: entry.revision, rootRevision: entry.rootRevision },
            knowers,
          }),
        });
        await loadMemoryLibrary(undefined, { characterId: library.characterId, query: library.query });
      } catch (cause) {
        setError(messageFrom(cause, "Could not forget that memory."));
      } finally {
        setBusy(false);
      }
    },
    [loadMemoryLibrary, setBusy, setError],
  );
}

export function useLoadAgendas(ports: {
  setAgendas: React.Dispatch<SetStateAction<VillagerAgendaView[]>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { setAgendas, setError } = ports;
  return useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await request<AgendaListResponse>("/agendas", { signal });
        if (signal?.aborted) return;
        setAgendas(response.villagers);
      } catch (cause) {
        if (signal?.aborted) return;
        setAgendas(null);
        setError(messageFrom(cause, "Could not read what the villagers wish for."));
      }
    },
    [setAgendas, setError],
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
    [currentSnapshotRef, retryWork, setAgendas, setBusy, setError],
  );
}

export function useSetAgendaScheduleIngestion(ports: {
  setAgendas: React.Dispatch<SetStateAction<VillagerAgendaView[]>>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
}) {
  const { setAgendas, setBusy, setError } = ports;
  return useCallback(
    async (characterId: string, enabled: boolean, categories?: Record<string, boolean>) => {
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
    },
    [setAgendas, setBusy, setError],
  );
}

export function useAddVillager(ports: {
  loadCatalog: (signal?: AbortSignal) => Promise<void>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setError: React.Dispatch<SetStateAction<string>>;
  setSnapshot: React.Dispatch<SetStateAction<VillageSnapshot>>;
}) {
  const { loadCatalog, setBusy, setError, setSnapshot } = ports;
  return useCallback(
    async (
      characterId: string,
      spriteSetupRevision?: number,
      admission?: import("../../../shared/helpers/resident-admission.js").ResidentAdmission,
    ) => {
      setBusy(true);
      try {
        setSnapshot(
          await request<VillageSnapshot>("/villagers", {
            method: "POST",
            body: JSON.stringify({ characterId, admission, spriteSetupRevision }),
          }),
        );
        setError("");
        await loadCatalog();
        return true;
      } catch (cause) {
        setError(messageFrom(cause, "That character could not move in."));
        throw cause;
      } finally {
        setBusy(false);
      }
    },
    [loadCatalog, setBusy, setError, setSnapshot],
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
    [catalog, loadCatalog, setBusy, setError, setSnapshot],
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
