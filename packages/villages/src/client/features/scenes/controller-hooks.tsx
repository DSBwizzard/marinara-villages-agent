import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import type { RoomOperation, RoomRecordEvent, SceneChangeIssue, SceneView } from "../../../shared/contracts/village.js";
import { useFocusRevision } from "../../shared/activity.js";
import { request } from "../../shared/api.js";
import { useSceneEntryLifetime } from "./entry-lifetime.js";
import {
  completedGreetingAfterFailure,
  currentRoom,
  openingFailureMessage,
  refreshSceneAfterFailure,
  staleVenueReason,
} from "./ScenePanel.js";
import { isLocalRoomCompletion } from "./villages-room-reading";

export function useSceneChangesPolling(ports: {
  visible: boolean;
  viewing: boolean;
  busy: boolean;
  snapshot: import("../../../shared/contracts/village.js").VillageSnapshot;
  dismissedRoomEventIdsRef: React.RefObject<Set<string>>;
  receiveRoomRecordEvents: (events: readonly import("../../../shared/contracts/village.js").RoomRecordEvent[]) => void;
  room: import("../../../shared/contracts/village.js").SceneView;
  setRoomChangeStatus: React.Dispatch<React.SetStateAction<{ pending: number; failed: number; rejected: number }>>;
  setRoomNotices: React.Dispatch<
    React.SetStateAction<import("../../../shared/contracts/village.js").RoomRecordEvent[]>
  >;
  setRoomUnresolvedChanges: React.Dispatch<React.SetStateAction<SceneChangeIssue[]>>;
}) {
  const {
    dismissedRoomEventIdsRef,
    receiveRoomRecordEvents,
    room,
    setRoomChangeStatus,
    setRoomNotices,
    setRoomUnresolvedChanges,
  } = ports;
  const cursorRef = useRef({ sceneId: "", cursor: "" });
  const focusRevision = useFocusRevision(ports.visible && ports.viewing);
  const placeUpdates = ports.snapshot?.placeUpdates;
  const revision = room?.id && placeUpdates?.sceneId === room.id ? placeUpdates.revision : "";
  const jobs = "";
  useEffect(() => {
    if (
      !room?.id ||
      room.memoryMode !== "live" ||
      room.status === "closed" ||
      !ports.visible ||
      !ports.viewing ||
      ports.busy
    )
      return;
    if (cursorRef.current.sceneId !== room.id) {
      cursorRef.current = { sceneId: room.id, cursor: "" };
      setRoomChangeStatus({ pending: 0, failed: 0, rejected: 0 });
      setRoomUnresolvedChanges([]);
    }
    const controller = new AbortController();
    let retries = 0;
    let wasActive = false;
    let settling = false;
    let stopped = false,
      timer: ReturnType<typeof setTimeout>;
    let cursor = cursorRef.current.cursor;
    const poll = async () => {
      try {
        const answer = await request<{
          activeRequest?: { status?: string };
          backgroundChecks?: { status: string }[];
          changes: { notices: RoomRecordEvent[] }[];
          notices: RoomRecordEvent[];
          dismissedNoticeIds: string[];
          processingSummary: { pending: number; failed: number; rejected: number };
          nextCursor: string;
          hasMore: boolean;
          unresolved: SceneChangeIssue[];
        }>(`/rooms/${encodeURIComponent(room.id)}/changes?cursor=${encodeURIComponent(cursor)}&limit=20`, {
          signal: controller.signal,
        });
        if (stopped) return;
        for (const id of answer.dismissedNoticeIds ?? []) dismissedRoomEventIdsRef.current.add(id);
        setRoomNotices((current) => current.filter((event) => !dismissedRoomEventIdsRef.current.has(event.id)));
        receiveRoomRecordEvents([
          ...(answer.notices ?? []),
          ...(answer.changes ?? []).flatMap((change) => change.notices ?? []),
        ]);
        setRoomChangeStatus(answer.processingSummary ?? { pending: 0, failed: 0, rejected: 0 });
        setRoomUnresolvedChanges(answer.unresolved ?? []);
        cursor = answer.nextCursor ?? cursor;
        cursorRef.current.cursor = cursor;
        retries = 0;
        // The operation/recovery monitor owns a running turn. This loop owns only its asynchronous Wish checks.
        const active = answer.backgroundChecks?.some((job) => ["queued", "running"].includes(job.status));
        if (answer.hasMore) timer = setTimeout(() => void poll(), 25);
        else if (active) {
          wasActive = true;
          timer = setTimeout(() => void poll(), 1500);
        } else if (wasActive && !settling) {
          settling = true;
          timer = setTimeout(() => void poll(), 1500);
        }
        // Late afterApply commits change the shared snapshot revision and reopen this read.
      } catch {
        if (!stopped && retries++ < 2) timer = setTimeout(() => void poll(), 3000);
      }
    };
    void poll();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [
    room?.id,
    room?.memoryMode,
    room?.status,
    room?.sceneRevision,
    room?.operation?.status,
    ports.visible,
    ports.viewing,
    ports.busy,
    revision,
    focusRevision,
    jobs,
    receiveRoomRecordEvents,
    setRoomChangeStatus,
    setRoomUnresolvedChanges,
    setRoomNotices,
    dismissedRoomEventIdsRef,
  ]);
}

export function useSceneSelectionReset(ports: {
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  observedRoomIdRef: React.RefObject<string>;
  room: import("../../../shared/contracts/village.js").SceneView;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomMoveOperationIdRef: React.RefObject<string>;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setLastSceneEnding: React.Dispatch<React.SetStateAction<string>>;
  setRoom: React.ActionDispatch<[next: React.SetStateAction<import("../../../shared/contracts/village.js").SceneView>]>;
  setRoomContactBoundary: React.Dispatch<React.SetStateAction<string>>;
  setRoomMoveZoneId: React.Dispatch<React.SetStateAction<string>>;
  setRoomNotices: React.Dispatch<
    React.SetStateAction<import("../../../shared/contracts/village.js").RoomRecordEvent[]>
  >;
  setRoomOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRoomTargetId: React.Dispatch<React.SetStateAction<string>>;
  setScreen: React.Dispatch<
    React.SetStateAction<"home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
}) {
  const {
    loadSnapshot,
    observedRoomIdRef,
    room,
    roomCompletionRef,
    roomMoveOperationIdRef,
    screen,
    seenRoomEventIdsRef,
    setLastSceneEnding,
    setRoom,
    setRoomContactBoundary,
    setRoomMoveZoneId,
    setRoomNotices,
    setRoomOpen,
    setRoomTargetId,
    setScreen,
  } = ports;
  useEffect(() => {
    if (!room?.id || room.status === "closed" || screen !== "room") return;
    if (observedRoomIdRef.current !== room.id) {
      observedRoomIdRef.current = room.id;
      setRoomContactBoundary("");
      setRoomMoveZoneId("");
      setRoomTargetId("");
      roomMoveOperationIdRef.current = null;
    }
    let disposed = false;
    const interrupted = (reason: "inactivity" | "elsewhere") => {
      if (disposed || isLocalRoomCompletion(room.id, roomCompletionRef.current)) return;
      setRoom(null);
      setRoomOpen(false);
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setLastSceneEnding(
        reason === "inactivity" ? "Interrupted: Inactivity." : "This Scene ended while you were away.",
      );
      setScreen("home");
      void loadSnapshot();
    };
    const validate = () => {
      if (isLocalRoomCompletion(room.id, roomCompletionRef.current)) return;
      void request<{ session: SceneView | null }>("/rooms/active")
        .then(async ({ session }) => {
          if (disposed || isLocalRoomCompletion(room.id, roomCompletionRef.current)) return;
          if (session?.id === room.id) {
            setRoom(currentRoom(session));
            return;
          }
          const archived = await request<{ visit: SceneView }>(`/rooms/${encodeURIComponent(room.id)}/recovery`).catch(
            () => null,
          );
          if (disposed || isLocalRoomCompletion(room.id, roomCompletionRef.current)) return;
          interrupted(archived?.visit.endReason === "inactivity" ? "inactivity" : "elsewhere");
        })
        .catch((cause) => {
          const reason = staleVenueReason(cause);
          if (reason) interrupted(reason);
        });
    };
    const onFocus = () => validate();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      disposed = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [
    room?.id,
    room?.status,
    screen,
    loadSnapshot,
    observedRoomIdRef,
    setRoomContactBoundary,
    setRoomMoveZoneId,
    setRoomTargetId,
    roomMoveOperationIdRef,
    roomCompletionRef,
    setRoom,
    setRoomOpen,
    setRoomNotices,
    seenRoomEventIdsRef,
    setLastSceneEnding,
    setScreen,
  ]);
}

export function useSceneOpeningWarning(ports: {
  room: import("../../../shared/contracts/village.js").SceneView;
  roomGreetingError: { sessionId: string; message: string };
  setRoomGreetingError: React.Dispatch<React.SetStateAction<{ sessionId: string; message: string }>>;
}) {
  const { room, roomGreetingError, setRoomGreetingError } = ports;
  useEffect(() => {
    if (roomGreetingError && (roomGreetingError.sessionId !== room?.id || room?.status !== "opening"))
      setRoomGreetingError(null);
  }, [room?.id, room?.status, roomGreetingError, setRoomGreetingError]);
}

export function useSceneOperationPolling(ports: {
  visible: boolean;
  viewing: boolean;
  recoveryPending: boolean;
  room: import("../../../shared/contracts/village.js").SceneView;
  roomBusy: boolean;
  setRoom: React.ActionDispatch<[next: React.SetStateAction<import("../../../shared/contracts/village.js").SceneView>]>;
  setRoomEnded: React.Dispatch<React.SetStateAction<boolean>>;
  setRoomError: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { room, roomBusy, setRoom, setRoomEnded, setRoomError } = ports;
  useEffect(() => {
    if (
      !room?.id ||
      room.operation?.status !== "running" ||
      roomBusy ||
      !ports.visible ||
      !ports.viewing ||
      ports.recoveryPending
    )
      return;
    let stopped = false;
    let reading = false;
    const poll = async () => {
      if (stopped || reading || document.hidden) return;
      reading = true;
      const latest = await refreshSceneAfterFailure(room.id, room.operation?.id, () => !stopped);
      reading = false;
      if (!stopped && latest) {
        setRoom(currentRoom(latest));
        setRoomEnded(latest.status === "closed");
        if (latest.operation?.status !== "running") setRoomError("");
      }
    };
    const timer = window.setInterval(() => void poll(), 1500);
    window.addEventListener("focus", poll);
    document.addEventListener("visibilitychange", poll);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", poll);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [
    room?.id,
    room?.operation?.id,
    room?.operation?.status,
    roomBusy,
    ports.visible,
    ports.viewing,
    ports.recoveryPending,
    setRoom,
    setRoomEnded,
    setRoomError,
  ]);
}

export function useSceneInterruptedSubmission(ports: {
  composerEditVersionRef: React.RefObject<number>;
  restoredSceneDraftRef: React.RefObject<string>;
  room: import("../../../shared/contracts/village.js").SceneView;
  setLegacyRecovery: React.Dispatch<React.SetStateAction<import("./useScenesState.js").LegacySceneRecovery | null>>;
  roomMoveOperationIdRef: React.RefObject<string>;
  setRoomContactBoundary: React.Dispatch<React.SetStateAction<string>>;
  setRoomContactKind: React.Dispatch<React.SetStateAction<"knock" | "call">>;
  setRoomDraft: React.Dispatch<React.SetStateAction<string>>;
  setRoomMode: React.Dispatch<React.SetStateAction<import("../../shared/types.js").SceneComposerMode>>;
  setRoomMoveZoneId: React.Dispatch<React.SetStateAction<string>>;
  setRoomTargetId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const {
    composerEditVersionRef,
    restoredSceneDraftRef,
    room,
    setLegacyRecovery,
    roomMoveOperationIdRef,
    setRoomContactBoundary,
    setRoomContactKind,
    setRoomDraft,
    setRoomMode,
    setRoomMoveZoneId,
    setRoomTargetId,
  } = ports;
  useEffect(() => {
    if (
      !room?.id ||
      (room.operation?.status !== "interrupted" && !room.operation?.error) ||
      room.submissions?.some((entry) => entry.id === room.operation?.id)
    )
      return;
    const restoreKey = `${room.id}:${room.operation?.id}:${room.operation?.attemptId}`;
    if (restoredSceneDraftRef.current === restoreKey) return;
    let disposed = false;
    const editVersion = composerEditVersionRef.current;
    void request<{ operation: RoomOperation | null }>(
      `/rooms/${encodeURIComponent(room.id)}/operations/${encodeURIComponent(room.operation.id)}`,
    )
      .then(({ operation }) => {
        if (disposed || !operation?.input) return;
        if (operation.kind === "move" && operation.input.zoneId) {
          restoredSceneDraftRef.current = restoreKey;
          if (composerEditVersionRef.current === editVersion && editVersion === 0) {
            setRoomMode("chat");
            setRoomMoveZoneId(operation.input.zoneId);
            roomMoveOperationIdRef.current = operation.id;
          }
          return;
        }
        const legacy = ["contact", "fulfill"].includes(operation.input.mode ?? "");
        if (legacy) {
          setLegacyRecovery((current) => (current?.sceneId === room.id ? current : { sceneId: room.id, operation }));
        }
        if (!operation.input.message) return;
        restoredSceneDraftRef.current = restoreKey;
        if (composerEditVersionRef.current !== editVersion) return;
        setRoomDraft((current) => current || operation.input?.message || "");
        if (editVersion !== 0) return;
        if (operation.input.mode === "leave") setRoomMode("conclude");
        else if (operation.input.mode === "chat") setRoomMode("chat");
      })
      .catch(() => {});
    return () => {
      disposed = true;
    };
  }, [
    room?.id,
    room?.operation?.id,
    room?.operation?.attemptId,
    room?.operation?.status,
    room?.operation?.error,
    room?.submissions,
    restoredSceneDraftRef,
    composerEditVersionRef,
    setRoomDraft,
    setRoomMode,
    setRoomMoveZoneId,
    roomMoveOperationIdRef,
    setRoomTargetId,
    setRoomContactKind,
    setRoomContactBoundary,
    setLegacyRecovery,
  ]);
}

export function useActiveSceneRestoration(ports: {
  isFounded: boolean | undefined;
  room: SceneView;
  roomEnded: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomSendInFlightRef: React.RefObject<boolean>;
  setDebugDiscardEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setRoom: React.ActionDispatch<[next: React.SetStateAction<import("../../../shared/contracts/village.js").SceneView>]>;
  setRoomBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setRoomGreetingError: React.Dispatch<React.SetStateAction<{ sessionId: string; message: string }>>;
  setRoomMode: React.Dispatch<React.SetStateAction<import("../../shared/types.js").SceneComposerMode>>;
  setRoomOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setScreen: React.Dispatch<
    React.SetStateAction<"home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
}) {
  const {
    isFounded,
    room,
    roomEnded,
    roomCompletionRef,
    roomSendInFlightRef,
    setDebugDiscardEnabled,
    setRoom,
    setRoomBusy,
    setRoomGreetingError,
    setRoomMode,
    setRoomOpen,
    setScreen,
  } = ports;
  const lifetime = useSceneEntryLifetime({
    room,
    isFounded,
    ended: roomEnded,
    inFlight: roomSendInFlightRef,
    completion: roomCompletionRef,
    setBusy: setRoomBusy,
  });
  const [status, setStatus] = useState<"checking" | "ready" | "error">("checking");
  const [attempt, setAttempt] = useState(0);
  // A restoration attempt starts only on mount or explicit retry. Its captured
  // selection still retires through the entry lifetime, including after handoff.
  const restore = useEffectEvent((attempt: number) => {
    const controller = new AbortController();
    let claim: ReturnType<typeof lifetime.begin> = null;
    void request<{ session: SceneView | null; debugDiscardEnabled: boolean }>("/rooms/active", {
      signal: controller.signal,
    })
      .then(async ({ session, debugDiscardEnabled: debugEnabled }) => {
        if (controller.signal.aborted) return;
        setStatus("ready");
        if (!lifetime.isCurrent()) return;
        setDebugDiscardEnabled(debugEnabled);
        if (!session) return;
        const owned = lifetime.begin();
        if (!owned) return;
        claim = owned;
        const owns = () => !controller.signal.aborted && lifetime.owns(owned);
        try {
          const restored = currentRoom(session);
          if (!lifetime.handoff(owned, restored, roomEnded)) return;
          setRoom(restored);
          setRoomMode("chat");
          setRoomOpen(true);
          setScreen("room");
          // A retry only checks saved state; opening generation remains an explicit action.
          if (session.status === "opening" && attempt === 0) {
            owned.busy = true;
            setRoomBusy(true);
            try {
              const { session: greeted } = await request<{ session: SceneView }>("/rooms/greet", {
                method: "POST",
                body: JSON.stringify({ sessionId: session.id }),
              });
              if (!owns()) return;
              const next = currentRoom(greeted);
              if (!lifetime.handoff(owned, next, roomEnded)) return;
              setRoom((current) => (current?.id === session.id ? next : current));
              setRoomGreetingError((current) => (current?.sessionId === session.id ? null : current));
            } catch (cause) {
              if (!owns()) return;
              const recovered = await completedGreetingAfterFailure(session.id, owns);
              if (!owns()) return;
              if (recovered) {
                if (!lifetime.handoff(owned, recovered, roomEnded)) return;
                setRoom((current) => (current?.id === session.id ? recovered : current));
                setRoomGreetingError((current) => (current?.sessionId === session.id ? null : current));
              } else
                setRoomGreetingError((current) =>
                  current && current.sessionId !== session.id
                    ? current
                    : { sessionId: session.id, message: openingFailureMessage(cause) },
                );
            }
          }
        } finally {
          if (!controller.signal.aborted && lifetime.finish(owned) && owned.busy) setRoomBusy(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => {
      controller.abort();
      if (claim) lifetime.cancel(claim);
    };
  });
  useEffect(() => restore(attempt), [attempt]);
  const retry = useCallback(() => {
    setStatus("checking");
    setAttempt((current) => current + 1);
  }, []);
  return { status, retry };
}
