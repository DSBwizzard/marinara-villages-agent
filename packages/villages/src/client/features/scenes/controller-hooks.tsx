import { messageFrom, request } from "../../shared/api.js";
import type { ArchiveVisitSummary, RoomOperation, RoomRecordEvent, SceneView } from "../../shared/types.js";
import {
  completedGreetingAfterFailure,
  currentRoom,
  openingFailureMessage,
  refreshSceneAfterFailure,
  staleVenueReason,
} from "./ScenePanel.js";
import { isLocalRoomCompletion } from "./villages-room-reading";
import { useEffect } from "react";

export function useSceneChangesPolling(ports: {
  dismissedRoomEventIdsRef: React.RefObject<Set<string>>;
  receiveRoomRecordEvents: (events: readonly import("../../shared/types").RoomRecordEvent[]) => void;
  room: import("../../shared/types").SceneView;
  roomChangeStatus: { pending: number; failed: number; rejected: number };
  setRoomChangeStatus: React.Dispatch<React.SetStateAction<{ pending: number; failed: number; rejected: number }>>;
  setRoomNotices: React.Dispatch<React.SetStateAction<import("../../shared/types").RoomRecordEvent[]>>;
  setRoomUnresolvedChanges: React.Dispatch<
    React.SetStateAction<{ submissionId: string; domain: string; reason?: string }[]>
  >;
}) {
  const {
    dismissedRoomEventIdsRef,
    receiveRoomRecordEvents,
    room,
    roomChangeStatus,
    setRoomChangeStatus,
    setRoomNotices,
    setRoomUnresolvedChanges,
  } = ports;
  useEffect(() => {
    if (!room?.id || room.memoryMode !== "live") return;
    setRoomChangeStatus({ pending: 0, failed: 0, rejected: 0 });
    setRoomUnresolvedChanges([]);
    let stopped = false,
      timer: ReturnType<typeof setTimeout>;
    let cursor = "";
    const poll = async () => {
      try {
        const answer = await request<{
          changes: { notices: RoomRecordEvent[] }[];
          notices: RoomRecordEvent[];
          dismissedNoticeIds: string[];
          processingSummary: typeof roomChangeStatus;
          nextCursor: string;
          hasMore: boolean;
          unresolved: { submissionId: string; domain: string; reason?: string }[];
        }>(`/rooms/${encodeURIComponent(room.id)}/changes?cursor=${encodeURIComponent(cursor)}&limit=20`);
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
        timer = setTimeout(() => void poll(), answer.hasMore ? 25 : 1500);
      } catch {
        if (!stopped) timer = setTimeout(() => void poll(), 3000);
      }
    };
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [room?.id, room?.memoryMode, receiveRoomRecordEvents]);
}

export function useSceneSelectionReset(ports: {
  lastRoomActivitySentRef: React.RefObject<number>;
  lastRoomDeliberateAtRef: React.RefObject<number>;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  observedRoomIdRef: React.RefObject<string>;
  room: import("../../shared/types").SceneView;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomMoveOperationIdRef: React.RefObject<string>;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setLastSceneEnding: React.Dispatch<React.SetStateAction<string>>;
  setRoom: React.ActionDispatch<[next: React.SetStateAction<import("../../shared/types").SceneView>]>;
  setRoomContactBoundary: React.Dispatch<React.SetStateAction<string>>;
  setRoomMoveZoneId: React.Dispatch<React.SetStateAction<string>>;
  setRoomNotices: React.Dispatch<React.SetStateAction<import("../../shared/types").RoomRecordEvent[]>>;
  setRoomOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setRoomTargetId: React.Dispatch<React.SetStateAction<string>>;
  setScreen: React.Dispatch<
    React.SetStateAction<"home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
}) {
  const {
    lastRoomActivitySentRef,
    lastRoomDeliberateAtRef,
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
      lastRoomDeliberateAtRef.current = Date.parse(room.lastActivityAt || room.startedAt) || Date.now();
    } else {
      lastRoomDeliberateAtRef.current = Math.max(
        lastRoomDeliberateAtRef.current,
        Date.parse(room.lastActivityAt || room.startedAt) || 0,
      );
    }
    let disposed = false;
    const interrupted = (reason: "inactivity" | "elsewhere") => {
      if (disposed || isLocalRoomCompletion(room.id, roomCompletionRef.current)) return;
      setRoom(null);
      setRoomOpen(false);
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setLastSceneEnding(
        reason === "inactivity"
          ? "Interrupted: Inactivity. Your completed exchanges were saved in the Scene archive."
          : "This Scene ended while you were away. Its completed exchanges are in the Scene archive.",
      );
      setScreen("home");
      void loadSnapshot();
    };
    const validate = (touchAfter = false) => {
      if (isLocalRoomCompletion(room.id, roomCompletionRef.current)) return;
      void request<{ session: SceneView | null }>("/rooms/active")
        .then(async ({ session }) => {
          if (disposed || isLocalRoomCompletion(room.id, roomCompletionRef.current)) return;
          if (session?.id === room.id) {
            setRoom(currentRoom(session));
            if (touchAfter) {
              await request("/rooms/activity", { method: "POST", body: JSON.stringify({ sessionId: room.id }) });
              lastRoomDeliberateAtRef.current = Date.now();
            }
            return;
          }
          const archived = await request<{ visit: SceneView }>(`/rooms/archive/${encodeURIComponent(room.id)}`).catch(
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
    const deliberate = (event: Event) => {
      if (isLocalRoomCompletion(room.id, roomCompletionRef.current)) return;
      if (Date.now() - lastRoomDeliberateAtRef.current >= 30 * 60_000) {
        if (event.cancelable) event.preventDefault();
        event.stopImmediatePropagation();
        validate(true);
        return;
      }
      lastRoomDeliberateAtRef.current = Date.now();
      if (Date.now() - lastRoomActivitySentRef.current < 15_000) return;
      lastRoomActivitySentRef.current = Date.now();
      void request("/rooms/activity", { method: "POST", body: JSON.stringify({ sessionId: room.id }) }).catch(
        (cause) => {
          const reason = staleVenueReason(cause);
          if (reason) interrupted(reason);
          else validate();
        },
      );
    };
    const onFocus = () => validate();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    for (const type of ["pointerdown", "keydown", "input", "scroll"]) window.addEventListener(type, deliberate, true);
    return () => {
      disposed = true;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      for (const type of ["pointerdown", "keydown", "input", "scroll"])
        window.removeEventListener(type, deliberate, true);
    };
  }, [room?.id, room?.status, room?.lastActivityAt, room?.startedAt, screen, loadSnapshot]);
}

export function useSceneOpeningWarning(ports: {
  room: import("../../shared/types").SceneView;
  roomGreetingError: { sessionId: string; message: string };
  setRoomGreetingError: React.Dispatch<React.SetStateAction<{ sessionId: string; message: string }>>;
}) {
  const { room, roomGreetingError, setRoomGreetingError } = ports;
  useEffect(() => {
    if (roomGreetingError && (roomGreetingError.sessionId !== room?.id || room?.status !== "opening"))
      setRoomGreetingError(null);
  }, [room?.id, room?.status, roomGreetingError]);
}

export function useSceneOperationPolling(ports: {
  room: import("../../shared/types").SceneView;
  roomBusy: boolean;
  setRoom: React.ActionDispatch<[next: React.SetStateAction<import("../../shared/types").SceneView>]>;
  setRoomEnded: React.Dispatch<React.SetStateAction<boolean>>;
  setRoomError: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { room, roomBusy, setRoom, setRoomEnded, setRoomError } = ports;
  useEffect(() => {
    if (!room?.id || room.operation?.status !== "running" || roomBusy) return;
    let stopped = false;
    let reading = false;
    const poll = async () => {
      if (stopped || reading || document.hidden) return;
      reading = true;
      const latest = await refreshSceneAfterFailure(room.id, room.operation?.id);
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
  }, [room?.id, room?.operation?.id, room?.operation?.status, roomBusy]);
}

export function useSceneInterruptedSubmission(ports: {
  composerEditVersionRef: React.RefObject<number>;
  restoredSceneDraftRef: React.RefObject<string>;
  room: import("../../shared/types").SceneView;
  roomMoveOperationIdRef: React.RefObject<string>;
  setRoomContactBoundary: React.Dispatch<React.SetStateAction<string>>;
  setRoomContactKind: React.Dispatch<React.SetStateAction<"knock" | "call">>;
  setRoomDraft: React.Dispatch<React.SetStateAction<string>>;
  setRoomMode: React.Dispatch<React.SetStateAction<import("../../shared/types").SceneComposerMode>>;
  setRoomMoveZoneId: React.Dispatch<React.SetStateAction<string>>;
  setRoomTargetId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const {
    composerEditVersionRef,
    restoredSceneDraftRef,
    room,
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
            setRoomMode("move");
            setRoomMoveZoneId(operation.input.zoneId);
            roomMoveOperationIdRef.current = operation.id;
          }
          return;
        }
        if (!operation.input.message) return;
        restoredSceneDraftRef.current = restoreKey;
        if (composerEditVersionRef.current !== editVersion) return;
        setRoomDraft((current) => current || operation.input?.message || "");
        if (editVersion !== 0) return;
        if (operation.input.mode === "leave") setRoomMode("conclude");
        else if (["chat", "fulfill", "contact"].includes(operation.input.mode ?? "")) {
          setRoomMode(operation.input.mode as "chat" | "fulfill" | "contact");
          setRoomTargetId(operation.input.targetId ?? "");
          if (operation.input.contact) {
            setRoomContactKind(operation.input.contact.kind === "call" ? "call" : "knock");
            setRoomContactBoundary(operation.input.contact.boundaryZoneId ?? "");
          }
        }
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
  ]);
}

export function useActiveSceneRestoration(ports: {
  setDebugDiscardEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setRoom: React.ActionDispatch<[next: React.SetStateAction<import("../../shared/types").SceneView>]>;
  setRoomBusy: React.Dispatch<React.SetStateAction<boolean>>;
  setRoomGreetingError: React.Dispatch<React.SetStateAction<{ sessionId: string; message: string }>>;
  setRoomMode: React.Dispatch<React.SetStateAction<import("../../shared/types").SceneComposerMode>>;
  setRoomOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setScreen: React.Dispatch<
    React.SetStateAction<"home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person">
  >;
}) {
  const { setDebugDiscardEnabled, setRoom, setRoomBusy, setRoomGreetingError, setRoomMode, setRoomOpen, setScreen } =
    ports;
  useEffect(() => {
    const controller = new AbortController();
    void request<{ session: SceneView | null; debugDiscardEnabled: boolean }>("/rooms/active", {
      signal: controller.signal,
    })
      .then(({ session, debugDiscardEnabled: debugEnabled }) => {
        setDebugDiscardEnabled(debugEnabled);
        if (controller.signal.aborted || !session) return;
        setRoom(currentRoom(session));
        setRoomMode("chat");
        setRoomOpen(true);
        setScreen("room");
        if (session.status === "opening") {
          setRoomBusy(true);
          void request<{ session: SceneView }>("/rooms/greet", {
            method: "POST",
            body: JSON.stringify({ sessionId: session.id }),
            signal: AbortSignal.timeout(30_000),
          })
            .then(({ session: greeted }) => {
              if (!controller.signal.aborted) {
                setRoom((current) => (current?.id === session.id ? currentRoom(greeted) : current));
                setRoomGreetingError((current) => (current?.sessionId === session.id ? null : current));
              }
            })
            .catch(async (cause) => {
              if (controller.signal.aborted) return;
              const recovered = await completedGreetingAfterFailure(session.id);
              if (controller.signal.aborted) return;
              if (recovered) {
                setRoom((current) => (current?.id === session.id ? recovered : current));
                setRoomGreetingError((current) => (current?.sessionId === session.id ? null : current));
              } else
                setRoomGreetingError((current) =>
                  current && current.sessionId !== session.id
                    ? current
                    : { sessionId: session.id, message: openingFailureMessage(cause) },
                );
            })
            .finally(() => {
              if (!controller.signal.aborted) setRoomBusy(false);
            });
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
}

export function useSceneArchive(ports: {
  archiveOffset: number;
  archiveVenueId: string;
  archiveVersion: number;
  archiveVillagerId: string;
  menuPage: import("../../shared/types").MenuPage;
  setArchiveError: React.Dispatch<React.SetStateAction<string>>;
  setArchiveTotal: React.Dispatch<React.SetStateAction<number>>;
  setVenueVisits: React.Dispatch<React.SetStateAction<import("../../shared/types").ArchiveVisitSummary[]>>;
  snapshot: import("../../shared/types").VillageSnapshot;
}) {
  const {
    archiveOffset,
    archiveVenueId,
    archiveVersion,
    archiveVillagerId,
    menuPage,
    setArchiveError,
    setArchiveTotal,
    setVenueVisits,
    snapshot,
  } = ports;
  useEffect(() => {
    if (menuPage !== "chatlogs" || !snapshot?.isFounded) return;
    const controller = new AbortController();
    const query = new URLSearchParams();
    if (archiveVenueId) query.set("venueId", archiveVenueId);
    if (archiveVillagerId) query.set("characterId", archiveVillagerId);
    query.set("offset", String(archiveOffset));
    query.set("limit", "20");
    setVenueVisits(null);
    void request<{ visits: ArchiveVisitSummary[]; total: number }>(`/rooms/archive?${query.toString()}`, {
      signal: controller.signal,
    })
      .then(({ visits, total }) => {
        if (!controller.signal.aborted) {
          setVenueVisits(visits);
          setArchiveTotal(total);
          setArchiveError("");
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setArchiveError(messageFrom(cause, "Scenes could not be read."));
      });
    return () => controller.abort();
  }, [archiveVenueId, archiveVillagerId, archiveOffset, archiveVersion, menuPage, snapshot?.isFounded]);
}
