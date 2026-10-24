import type { PersonaResponse, VillageLorebookOption, VillageSnapshot } from "../../shared/contracts/village.js";
import { useVisibleInterval } from "./activity.js";
import { messageFrom, request } from "./api.js";
import { SHOW_CATCHING_UP_AFTER_MS } from "./presentation.js";
import { createVillagesClientId } from "./request-id.js";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

export type SnapshotRead = {
  isCurrent(): boolean;
  publish(next: VillageSnapshot | null): boolean;
  publishMutation(next: VillageSnapshot): boolean;
};

/** Reads share one publication order; every mutation publication retires older reads. */
export function useVillageSnapshot(initial: VillageSnapshot | null = null) {
  const [snapshot, writeSnapshot] = useState(initial);
  const mutationEpoch = useRef(0);
  const nextRead = useRef(0);
  const publishedRead = useRef(0);
  const active = useRef(true);
  const setSnapshot = useCallback((next: React.SetStateAction<VillageSnapshot | null>) => {
    if (!active.current) return;
    mutationEpoch.current += 1;
    writeSnapshot(next);
  }, []);
  const beginSnapshotRead = useCallback((): SnapshotRead => {
    const epoch = mutationEpoch.current;
    const id = ++nextRead.current;
    const ownsEpoch = () => active.current && mutationEpoch.current === epoch;
    const isCurrent = () => ownsEpoch() && id >= publishedRead.current;
    return {
      isCurrent,
      publish(next) {
        if (!isCurrent()) return false;
        if (next !== null) publishedRead.current = id;
        writeSnapshot(next);
        return true;
      },
      publishMutation(next) {
        if (!ownsEpoch()) return false;
        setSnapshot(next);
        return true;
      },
    };
  }, [setSnapshot]);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      mutationEpoch.current += 1;
    };
  }, []);
  return { snapshot, setSnapshot, beginSnapshotRead };
}

export function useSnapshotReference(ports: {
  readonly currentSnapshotRef: React.RefObject<import("../../shared/contracts/village").VillageSnapshot>;
  readonly snapshot: import("../../shared/contracts/village").VillageSnapshot;
}) {
  const { currentSnapshotRef, snapshot } = ports;

  useEffect(() => {
    currentSnapshotRef.current = snapshot;
  }, [currentSnapshotRef, snapshot]);
}

export function useReconcileVillage(ports: {
  readonly currentSnapshotRef: React.RefObject<import("../../shared/contracts/village").VillageSnapshot>;
  readonly reconcilingRef: React.RefObject<boolean>;
  readonly setCatchingUp: React.Dispatch<React.SetStateAction<boolean>>;
  readonly beginSnapshotRead: () => SnapshotRead;
  readonly storyActionRef: React.RefObject<{ id: string; expectedAttempt: number }>;
}) {
  const { currentSnapshotRef, reconcilingRef, setCatchingUp, beginSnapshotRead, storyActionRef } = ports;

  return useCallback(
    async (forceStory = false): Promise<VillageSnapshot | null> => {
      if (reconcilingRef.current) return null;
      reconcilingRef.current = true;
      const read = beginSnapshotRead();
      const notice = setTimeout(() => setCatchingUp(true), SHOW_CATCHING_UP_AFTER_MS);
      try {
        const next = await request<VillageSnapshot>("/reconcile", {
          method: "POST",
          body: forceStory
            ? JSON.stringify({
                forceStory: true,
                ...(storyActionRef.current ??= {
                  id: createVillagesClientId(),
                  expectedAttempt:
                    currentSnapshotRef.current?.backgroundWork?.find((job) => job.kind === "story")?.attempt ?? 0,
                }),
                actionId: storyActionRef.current.id,
              })
            : undefined,
        });
        read.publishMutation(next);
        if (forceStory) storyActionRef.current = null;
        return next;
      } catch {
        // The village keeps whatever news it had and the tab keeps drawing it.
        // Deterministic reconciliation is committed before optional narration;
        // a later creative attempt can retry without replaying required state.
        return null;
      } finally {
        clearTimeout(notice);
        setCatchingUp(false);
        reconcilingRef.current = false;
      }
    },
    [beginSnapshotRead, currentSnapshotRef, reconcilingRef, setCatchingUp, storyActionRef],
  );
}

/**
 * Ask for one creative village event right now, whatever Background events and wishes says.
 *
 * This debug action spends at most one model call and bypasses the daily pace
 * gate. The event must still fit a fact-backed opportunity and pass the same
 * validation as an automatic creative event.
 *
 * It reports what actually happened rather than that it finished. A forced
 * creative pass over already-covered facts may have nothing to add —
 * the window is deduped against, so it can only write what is genuinely new —
 * and a button that always said "done" would leave the player wondering
 * whether the feature was broken or the village was simply quiet.
 */
export function useWriteVillageEvent(ports: {
  readonly reconcile: (forceStory?: boolean) => Promise<import("../../shared/contracts/village").VillageSnapshot>;
  readonly setWriteUpNote: React.Dispatch<React.SetStateAction<string>>;
  readonly snapshot: import("../../shared/contracts/village").VillageSnapshot;
}) {
  const { reconcile, setWriteUpNote, snapshot } = ports;

  return useCallback(async () => {
    const newest = snapshot?.happenings[0]?.id ?? "";
    setWriteUpNote("Writing...");
    const next = await reconcile(true);
    if (!next) {
      setWriteUpNote(
        "The update request failed. Check the village again before retrying; time catch-up may already have run.",
      );
      return;
    }
    setWriteUpNote(
      next.backgroundWork?.some((job) => job.kind === "story" && ["queued", "running", "paused"].includes(job.status))
        ? "The event is queued. See Background work for progress."
        : (next.happenings[0]?.id ?? "") === newest
          ? "No new happening was added. Other village records may have changed during catch-up."
          : "A new visual event was added. See Events.",
    );
  }, [snapshot?.happenings, setWriteUpNote, reconcile]);
}

/** Read once or refresh shared pending work without clearing a good snapshot on a quiet failure. */
export function useLoadVillageSnapshot(ports: {
  readonly setError: React.Dispatch<React.SetStateAction<string>>;
  readonly beginSnapshotRead: () => SnapshotRead;
}) {
  const { setError, beginSnapshotRead } = ports;

  return useCallback(
    async (options: { signal?: AbortSignal; quiet?: boolean } = {}) => {
      const read = beginSnapshotRead();
      try {
        const next = await request<VillageSnapshot>("", {
          signal: options.signal,
        });
        if (!options.signal?.aborted && read.publish(next)) setError("");
      } catch (cause) {
        if (options.signal?.aborted || options.quiet || !read.publish(null)) return;
        setError(messageFrom(cause, "Could not read the village."));
      }
    },
    [beginSnapshotRead, setError],
  );
}

/** The visible capability lease also returns the shared refresh snapshot. */
export function useVillagePresence(ports: {
  visible: boolean;
  presenceSession: React.RefObject<string>;
  beginSnapshotRead: () => SnapshotRead;
  snapshot: VillageSnapshot;
}) {
  const { visible, presenceSession, beginSnapshotRead, snapshot } = ports;
  useEffect(() => {
    if (!snapshot?.isFounded || !visible) return;
    presenceSession.current ||= createVillagesClientId();
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let reading = false;
    const heartbeat = async () => {
      if (controller.signal.aborted || reading) return;
      reading = true;
      clearTimeout(timer);
      const read = beginSnapshotRead();
      try {
        const presence = await request<{ snapshot?: VillageSnapshot }>("/background/presence", {
          method: "POST",
          body: JSON.stringify({ sessionId: presenceSession.current, visible: true }),
          signal: controller.signal,
        });
        if (!controller.signal.aborted && presence.snapshot) read.publish(presence.snapshot);
      } catch {
        // A lost heartbeat expires on the server; no action is resubmitted here.
      } finally {
        reading = false;
        if (!controller.signal.aborted) timer = setTimeout(() => void heartbeat(), 30_000);
      }
    };
    void heartbeat();
    const focus = () => {
      if (!document.hidden) void heartbeat();
    };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", focus);
    return () => {
      controller.abort();
      clearTimeout(timer);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", focus);
      void request("/background/presence", {
        method: "POST",
        body: JSON.stringify({ sessionId: presenceSession.current, visible: false }),
      }).catch(() => {});
    };
  }, [snapshot?.isFounded, visible, presenceSession, beginSnapshotRead]);
}

/** Faster shared reads have an owner: unfinished background work. */
export function usePendingWorkPolling(ports: {
  visible: boolean;
  backgroundPending: boolean;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
}) {
  useVisibleInterval(
    (signal) => ports.loadSnapshot({ signal, quiet: true }),
    ports.backgroundPending ? 5_000 : null,
    ports.visible,
  );
}

export function useLoadPersonas(ports: {
  readonly setError: React.Dispatch<React.SetStateAction<string>>;
  readonly setPersonaDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setPersonas: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village").PersonaEntry[]>>;
}) {
  const { setError, setPersonaDraft, setPersonas } = ports;

  return useCallback(
    async (signal?: AbortSignal, selectActive = true) => {
      try {
        const response = await request<PersonaResponse>("/personas", { signal });
        setPersonas(response.personas);
        if (selectActive)
          setPersonaDraft((current) => current || response.personas.find((persona) => persona.isActive)?.id || "");
      } catch (cause) {
        if (signal?.aborted) return;
        // A failed read settles on "none" rather than staying unsettled forever:
        // the picker then offers the fields the player can still type into, and
        // the message says what went wrong. A spinner that never resolves would
        // hide the way out along with the problem.
        setPersonas([]);
        setError(messageFrom(cause, "Could not read your Personas."));
      }
    },
    [setError, setPersonaDraft, setPersonas],
  );
}

export function useLoadLorebooks(ports: {
  readonly setLorebooks: React.Dispatch<
    React.SetStateAction<import("../../shared/contracts/village").VillageLorebookOption[]>
  >;
  readonly setLorebooksError: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { setLorebooks, setLorebooksError } = ports;

  return useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await request<{ books: VillageLorebookOption[] }>("/lorebooks", { signal });
        setLorebooks(response.books);
        setLorebooksError("");
      } catch (cause) {
        if (signal?.aborted) return;
        setLorebooksError(
          messageFrom(cause, "Could not read Engine lorebooks. Selected books will be skipped until available."),
        );
      }
    },
    [setLorebooks, setLorebooksError],
  );
}

export function useInitialVillageLoad(ports: {
  visible: boolean;
  readonly loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
}) {
  const { loadSnapshot, visible } = ports;

  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    void loadSnapshot({ signal: controller.signal });
    return () => controller.abort();
  }, [loadSnapshot, visible]);
}
