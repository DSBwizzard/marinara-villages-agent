import type { PersonaResponse, VillageLorebookOption, VillageSnapshot } from "../../shared/contracts/village.js";
import { messageFrom, request } from "./api.js";
import { SHOW_CATCHING_UP_AFTER_MS, VILLAGE_PULSE_MS } from "./presentation.js";
import { createVillagesClientId } from "./request-id.js";
import { useCallback, useEffect } from "react";

export function useSnapshotReference(ports: {
  readonly currentSnapshotRef: React.RefObject<import("../../shared/contracts/village").VillageSnapshot>;
  readonly snapshot: import("../../shared/contracts/village").VillageSnapshot;
}) {
  useEffect(() => {
    const { currentSnapshotRef, snapshot } = ports;

    currentSnapshotRef.current = snapshot;
  }, [ports.snapshot]);
}

export function useReconcileVillage(ports: {
  readonly currentSnapshotRef: React.RefObject<import("../../shared/contracts/village").VillageSnapshot>;
  readonly reconcilingRef: React.RefObject<boolean>;
  readonly setCatchingUp: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setSnapshot: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village").VillageSnapshot>>;
  readonly storyActionRef: React.RefObject<{ id: string; expectedAttempt: number }>;
}) {
  return useCallback(async (forceStory = false): Promise<VillageSnapshot | null> => {
    const { currentSnapshotRef, reconcilingRef, setCatchingUp, setSnapshot, storyActionRef } = ports;

    if (reconcilingRef.current) return null;
    reconcilingRef.current = true;
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
      setSnapshot(next);
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
  }, []);
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
  return useCallback(async () => {
    const { reconcile, setWriteUpNote, snapshot } = ports;

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
  }, [ports.snapshot, ports.reconcile]);
}

/**
 * Read the village.
 *
 * `quiet` is the whole of the difference between the two callers. Opening the
 * tab has nothing to fall back on, so a failure there clears the village and
 * says so; a stumble in a read that runs every minute leaves the last good
 * reading on screen instead of blanking a village that is working perfectly
 * well.
 */
export function useLoadVillageSnapshot(ports: {
  readonly setError: React.Dispatch<React.SetStateAction<string>>;
  readonly setSnapshot: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village").VillageSnapshot>>;
}) {
  return useCallback(async (options: { signal?: AbortSignal; quiet?: boolean } = {}) => {
    const { setError, setSnapshot } = ports;

    try {
      const next = await request<VillageSnapshot>("", { signal: options.signal });
      setSnapshot(next);
      setError("");
    } catch (cause) {
      if (options.signal?.aborted || options.quiet) return;
      setSnapshot(null);
      setError(messageFrom(cause, "Could not read the village."));
    }
  }, []);
}

export function useVillagePresence(ports: {
  readonly element: HTMLElement;
  readonly loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  readonly presenceSession: React.RefObject<string>;
  readonly reconcile: (forceStory?: boolean) => Promise<import("../../shared/contracts/village").VillageSnapshot>;
  readonly setSnapshot: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village").VillageSnapshot>>;
  readonly snapshot: import("../../shared/contracts/village").VillageSnapshot;
}) {
  useEffect(() => {
    const { element, loadSnapshot, presenceSession, reconcile, setSnapshot, snapshot } = ports;

    if (!snapshot?.isFounded) return;
    presenceSession.current ||= createVillagesClientId();
    let heartbeatSequence = 0;
    const heartbeat = async () => {
      const sequence = ++heartbeatSequence;
      const visible = document.visibilityState === "visible" && element.checkVisibility({ checkVisibilityCSS: true });
      try {
        const presence = await request<{ snapshot?: VillageSnapshot }>("/background/presence", {
          method: "POST",
          body: JSON.stringify({ sessionId: presenceSession.current, visible }),
        });
        if (visible && sequence === heartbeatSequence) {
          if (presence.snapshot) setSnapshot(presence.snapshot);
          else {
            await reconcile();
            await loadSnapshot({ quiet: true });
          }
        }
      } catch {
        /* A lost heartbeat expires on the server. */
      }
    };
    void heartbeat();
    const timer = window.setInterval(() => void heartbeat(), 30_000);
    const changed = () => void heartbeat();
    document.addEventListener("visibilitychange", changed);
    const observer = new IntersectionObserver(changed);
    observer.observe(element);
    return () => {
      observer.disconnect();
      heartbeatSequence++;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", changed);
      void request("/background/presence", {
        method: "POST",
        body: JSON.stringify({ sessionId: presenceSession.current, visible: false }),
      }).catch(() => {});
    };
  }, [ports.snapshot?.isFounded, ports.reconcile, ports.loadSnapshot, ports.element]);
}

export function usePendingWorkPolling(ports: {
  readonly backgroundPending: boolean;
  readonly loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
}) {
  useEffect(() => {
    const { backgroundPending, loadSnapshot } = ports;

    if (!backgroundPending) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadSnapshot({ quiet: true });
    }, 5_000);
    return () => clearInterval(timer);
  }, [ports.backgroundPending, ports.loadSnapshot]);
}

/*
    Reconcile whenever the server's next meaningful transition changes.

    Watching the snapshot rather than hanging off each read means this covers
    every way the tab can learn the time — the opening read, the minute-by-minute
    poll, founding the village, coming back to a tab that was hidden — without
    any of them having to remember to ask. The ref is what makes it happen once
    per exact transition rather than once per snapshot: nearly every snapshot
    carries the same transition timestamp, and the ones that do end right here.

    The ref starts empty, so the very first snapshot the tab ever sees always
    looks like a transition. That is the point of it: opening the tab on a
    village that has been sitting unread for a week reconciles that week then,
    instead of waiting for the next scheduled transition.

    An unfounded village is shown and not reconciled. There is no durable village
    state to advance before founding.
  */
export function useVillageTransitions(ports: {
  readonly reconcile: (forceStory?: boolean) => Promise<import("../../shared/contracts/village").VillageSnapshot>;
  readonly snapshot: import("../../shared/contracts/village").VillageSnapshot;
  readonly transitionRef: React.RefObject<string>;
}) {
  useEffect(() => {
    const { reconcile, snapshot, transitionRef } = ports;

    const transition = snapshot?.village.nextTransitionAt ?? "";
    if (transition.length === 0 || transition === transitionRef.current) return;
    transitionRef.current = transition;
    if (snapshot?.isFounded) void reconcile();
  }, [ports.snapshot, ports.reconcile]);
}

export function useLoadPersonas(ports: {
  readonly setError: React.Dispatch<React.SetStateAction<string>>;
  readonly setPersonaDraft: React.Dispatch<React.SetStateAction<string>>;
  readonly setPersonas: React.Dispatch<React.SetStateAction<import("../../shared/contracts/village").PersonaEntry[]>>;
}) {
  return useCallback(async (signal?: AbortSignal, selectActive = true) => {
    const { setError, setPersonaDraft, setPersonas } = ports;

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
  }, []);
}

export function useLoadLorebooks(ports: {
  readonly setLorebooks: React.Dispatch<
    React.SetStateAction<import("../../shared/contracts/village").VillageLorebookOption[]>
  >;
  readonly setLorebooksError: React.Dispatch<React.SetStateAction<string>>;
}) {
  return useCallback(async (signal?: AbortSignal) => {
    const { setLorebooks, setLorebooksError } = ports;

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
  }, []);
}

export function useInitialVillageLoad(ports: {
  readonly loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
}) {
  useEffect(() => {
    const { loadSnapshot } = ports;

    const controller = new AbortController();
    void loadSnapshot({ signal: controller.signal });
    return () => controller.abort();
  }, [ports.loadSnapshot]);
}

/*
    Keep the tab in step with the village for as long as it is open.

    A capability package gets no timer and no background loop, so nothing can
    advance a village whose tab is closed — which is why the catch-up matters
    more than the poll. Once a minute is far finer than the thing being watched
    (four parts to a day), so nearly every one of these reads finds the same
    moment and stops at the first question, and the whole arrangement costs
    about as much as the clock in the corner.

    A hidden tab is skipped rather than ticked, since nobody is looking at it.
    The read on the way back covers the time it was away in one batch, because
    that is what the server makes of a moment it has fallen behind on.
  */
export function useVillagePolling(ports: {
  readonly loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  readonly reconcilingRef: React.RefObject<boolean>;
}) {
  useEffect(() => {
    const { loadSnapshot, reconcilingRef } = ports;

    const onVisible = () => {
      if (!document.hidden) void loadSnapshot({ quiet: true });
    };
    const timer = setInterval(() => {
      if (document.hidden || reconcilingRef.current) return;
      void loadSnapshot({ quiet: true });
    }, VILLAGE_PULSE_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ports.loadSnapshot]);
}
