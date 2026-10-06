import type {
  RoomLine,
  RoomOperation,
  RoomRecordEvent,
  SceneView,
  VenueClass,
  VillageSnapshot,
  VillageVenue,
  WishVerdict,
} from "../../../shared/contracts/village.js";
import { messageFrom, request, VillageApiError } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { SceneComposerMode } from "../../shared/types.js";
import {
  completedGreetingAfterFailure,
  completedRoomAfterFailure,
  currentRoom,
  openingFailureMessage,
  refreshSceneAfterFailure,
  sceneZoneLabel,
  staleVenueReason,
} from "./ScenePanel.js";
import { sceneResend } from "./villages-venue-send";
import { type SetStateAction, useCallback } from "react";

export function useReceiveRoomRecordEvents(ports: {
  dismissedRoomEventIdsRef: React.RefObject<Set<string>>;
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setRoomNotices: React.Dispatch<SetStateAction<RoomRecordEvent[]>>;
}) {
  const { dismissedRoomEventIdsRef, seenRoomEventIdsRef, setRoomNotices } = ports;
  return useCallback((events: readonly RoomRecordEvent[]) => {
    const fresh: RoomRecordEvent[] = [];
    for (const event of events) {
      if (seenRoomEventIdsRef.current.has(event.id) || dismissedRoomEventIdsRef.current.has(event.id)) continue;
      seenRoomEventIdsRef.current.add(event.id);
      fresh.push(event);
    }
    if (fresh.length > 0) setRoomNotices((current) => [...current, ...fresh]);
  }, []);
}

export function useDismissRoomNotice(ports: {
  dismissedRoomEventIdsRef: React.RefObject<Set<string>>;
  room: SceneView;
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomNotices: React.Dispatch<SetStateAction<RoomRecordEvent[]>>;
}) {
  const { dismissedRoomEventIdsRef, room, seenRoomEventIdsRef, setRoomError, setRoomNotices } = ports;
  return useCallback(
    (id: string) => {
      if (!room?.id) return;
      dismissedRoomEventIdsRef.current.add(id);
      setRoomNotices((current) => current.filter((event) => event.id !== id));
      void request(`/rooms/${encodeURIComponent(room.id)}/notices/dismiss`, {
        method: "POST",
        body: JSON.stringify({ noticeId: id }),
      }).catch((cause) => {
        dismissedRoomEventIdsRef.current.delete(id);
        seenRoomEventIdsRef.current.delete(id);
        setRoomError(messageFrom(cause, "The notice dismissal could not be saved. It will return after refresh."));
      });
    },
    [room?.id],
  );
}

export function useOpenVisit(ports: {
  setArchiveError: React.Dispatch<SetStateAction<string>>;
  setOpenArchivedVisit: React.Dispatch<SetStateAction<SceneView>>;
}) {
  const { setArchiveError, setOpenArchivedVisit } = ports;
  return useCallback(async (id: string) => {
    try {
      const response = await request<{ visit: SceneView }>(`/rooms/archive/${encodeURIComponent(id)}`);
      setOpenArchivedVisit(response.visit);
      setArchiveError("");
    } catch (cause) {
      setArchiveError(messageFrom(cause, "That Scene could not be read."));
    }
  }, []);
}

export function useDeleteArchivedVisits(ports: {
  setArchiveError: React.Dispatch<SetStateAction<string>>;
  setArchiveOffset: React.Dispatch<SetStateAction<number>>;
  setArchiveVersion: React.Dispatch<SetStateAction<number>>;
  setBusy: React.Dispatch<SetStateAction<boolean>>;
  setOpenArchivedVisit: React.Dispatch<SetStateAction<SceneView>>;
}) {
  const { setArchiveError, setArchiveOffset, setArchiveVersion, setBusy, setOpenArchivedVisit } = ports;
  return useCallback(async (id?: string) => {
    if (
      !window.confirm(
        id
          ? "Delete this exact Scene transcript? Filed memories and world changes remain."
          : "Delete all completed Scene transcripts? Filed memories and world changes remain.",
      )
    )
      return;
    setBusy(true);
    try {
      await request(id ? `/rooms/archive/${encodeURIComponent(id)}` : "/rooms/archive", { method: "DELETE" });
      setOpenArchivedVisit(null);
      setArchiveOffset(0);
      setArchiveVersion((version) => version + 1);
      setArchiveError("");
    } catch (cause) {
      setArchiveError(messageFrom(cause, "Scene transcripts could not be deleted."));
    } finally {
      setBusy(false);
    }
  }, []);
}

export function useCloseRoom(ports: {
  leavingRoomPendingRef: React.RefObject<boolean>;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  receiveRoomRecordEvents: (events: readonly RoomRecordEvent[]) => void;
  room: SceneView;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomEnded: boolean;
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setEndFailed: React.Dispatch<SetStateAction<boolean>>;
  setLastSceneEnding: React.Dispatch<SetStateAction<string>>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomDraft: React.Dispatch<SetStateAction<string>>;
  setRoomEnded: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomGreetingNotice: React.Dispatch<SetStateAction<string>>;
  setRoomNotices: React.Dispatch<SetStateAction<RoomRecordEvent[]>>;
  setRoomOpen: React.Dispatch<SetStateAction<boolean>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
}) {
  const {
    leavingRoomPendingRef,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomEnded,
    seenRoomEventIdsRef,
    setEndFailed,
    setLastSceneEnding,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomGreetingNotice,
    setRoomNotices,
    setRoomOpen,
    setScreen,
  } = ports;
  return useCallback(async () => {
    if (!room || roomBusy) return;
    if (!room.id || room.status === "closed" || roomEnded) {
      roomCompletionRef.current = null;
      setRoomOpen(false);
      setRoom(null);
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setRoomDraft("");
      setRoomGreetingNotice("");
      setScreen("home");
      void loadSnapshot();
      return;
    }
    setRoomBusy(true);
    setRoomError("");
    setEndFailed(false);
    setRoom({ ...room, status: "closing" });
    roomCompletionRef.current = { roomId: room.id, submissionId: "" };
    try {
      const answer = await request<{ session: SceneView; recordEvents: RoomRecordEvent[] }>("/rooms/end", {
        method: "POST",
        body: JSON.stringify({ sessionId: room.id, expectedSceneRevision: room.sceneRevision ?? 0 }),
      });
      if (leavingRoomPendingRef.current) return;
      setRoom(currentRoom(answer.session));
      setRoomEnded(true);
      receiveRoomRecordEvents(answer.recordEvents ?? []);
      setRoomDraft("");
      setRoomGreetingNotice("");
      void loadSnapshot();
    } catch (cause) {
      if (leavingRoomPendingRef.current) return;
      roomCompletionRef.current = null;
      const staleReason = staleVenueReason(cause);
      if (staleReason) {
        setRoom(null);
        setRoomOpen(false);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setLastSceneEnding(
          staleReason === "inactivity"
            ? "Interrupted: Inactivity. Your completed exchanges were saved in the Scene archive."
            : "This Scene ended while you were away. Its completed exchanges are in the Scene archive.",
        );
        setScreen("home");
        void loadSnapshot();
        return;
      }
      const authoritative = await refreshSceneAfterFailure(room.id);
      if (authoritative) {
        setRoom(currentRoom(authoritative));
        setRoomEnded(authoritative.status === "closed");
      }
      setRoomError(messageFrom(cause, "You could not leave the venue."));
      setEndFailed(true);
    } finally {
      setRoomBusy(false);
    }
  }, [loadSnapshot, receiveRoomRecordEvents, room, roomBusy, roomEnded]);
}

export function useLeaveRoom(ports: {
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  receiveRoomRecordEvents: (events: readonly RoomRecordEvent[]) => void;
  room: SceneView;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomDraft: string;
  roomLeaveSubmissionIdRef: React.RefObject<string>;
  roomSendInFlightRef: React.RefObject<boolean>;
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setEndFailed: React.Dispatch<SetStateAction<boolean>>;
  setLastSceneEnding: React.Dispatch<SetStateAction<string>>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomDraft: React.Dispatch<SetStateAction<string>>;
  setRoomEnded: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomNotices: React.Dispatch<SetStateAction<RoomRecordEvent[]>>;
  setRoomOpen: React.Dispatch<SetStateAction<boolean>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
}) {
  const {
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomDraft,
    roomLeaveSubmissionIdRef,
    roomSendInFlightRef,
    seenRoomEventIdsRef,
    setEndFailed,
    setLastSceneEnding,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomNotices,
    setRoomOpen,
    setScreen,
  } = ports;
  return useCallback(async () => {
    if (!room?.id || room.status !== "active" || roomBusy || roomSendInFlightRef.current) return;
    let submissionId = roomLeaveSubmissionIdRef.current ?? createVillagesClientId();
    roomLeaveSubmissionIdRef.current = submissionId;
    roomCompletionRef.current = { roomId: room.id, submissionId };
    setRoomBusy(true);
    setRoomError("");
    setEndFailed(false);
    try {
      const { operation } = await request<{ operation: RoomOperation | null }>(
        `/rooms/${encodeURIComponent(room.id)}/operation`,
      );
      const resend = sceneResend(operation, { message: roomDraft, mode: "leave", targetId: "" }, submissionId);
      submissionId = resend.submissionId;
      roomLeaveSubmissionIdRef.current = submissionId;
      roomCompletionRef.current = { roomId: room.id, submissionId };
      const answer = await request<{ session: SceneView; recordEvents: RoomRecordEvent[] }>("/rooms/leave", {
        method: "POST",
        body: JSON.stringify({
          sessionId: room.id,
          ...resend,
          message: roomDraft,
          expectedSceneRevision: room.sceneRevision ?? 0,
        }),
        signal: AbortSignal.timeout(300_000),
      });
      setRoom(currentRoom(answer.session));
      setRoomEnded(true);
      receiveRoomRecordEvents(answer.recordEvents ?? []);
      roomLeaveSubmissionIdRef.current = null;
      setRoomDraft("");
      void loadSnapshot();
    } catch (cause) {
      const latest = await refreshSceneAfterFailure(room.id, submissionId);
      if (latest) setRoom(currentRoom(latest));
      const recovered = latest?.submissions?.some((entry) => entry.id === submissionId)
        ? latest
        : await completedRoomAfterFailure(room.id, submissionId);
      if (recovered) {
        setRoom(currentRoom(recovered));
        setRoomEnded(recovered.status === "closed");
        setRoomDraft("");
        setRoomError("");
        setEndFailed(false);
        roomLeaveSubmissionIdRef.current = null;
        void loadSnapshot();
        return;
      }
      roomCompletionRef.current = null;
      const staleReason = staleVenueReason(cause);
      if (staleReason) {
        setRoom(null);
        setRoomOpen(false);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setLastSceneEnding(
          staleReason === "inactivity"
            ? "Interrupted: Inactivity. Your completed exchanges were saved in the Scene archive."
            : "This Scene ended while you were away. Its completed exchanges are in the Scene archive.",
        );
        setScreen("home");
        void loadSnapshot();
        return;
      }
      setRoomError(messageFrom(cause, "The scene could not end yet."));
      setEndFailed(true);
    } finally {
      setRoomBusy(false);
    }
  }, [loadSnapshot, receiveRoomRecordEvents, room, roomBusy, roomDraft]);
}

export function useDiscardRoomDebug(ports: {
  debugDiscardEnabled: boolean;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  room: SceneView;
  roomBusy: boolean;
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomDraft: React.Dispatch<SetStateAction<string>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomNotices: React.Dispatch<SetStateAction<RoomRecordEvent[]>>;
  setRoomOpen: React.Dispatch<SetStateAction<boolean>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
}) {
  const {
    debugDiscardEnabled,
    loadSnapshot,
    room,
    roomBusy,
    seenRoomEventIdsRef,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomError,
    setRoomNotices,
    setRoomOpen,
    setScreen,
  } = ports;
  return useCallback(async () => {
    if (!room?.id || !debugDiscardEnabled || roomBusy) return;
    if (
      !window.confirm("DEBUG: Discard this Scene and its transcript? Completed effects and villager memories remain.")
    )
      return;
    setRoomBusy(true);
    try {
      await request("/rooms/debug/discard", { method: "POST", body: JSON.stringify({ sessionId: room.id }) });
      setRoom(null);
      setRoomOpen(false);
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setRoomDraft("");
      setScreen("home");
      void loadSnapshot();
    } catch (cause) {
      setRoomError(messageFrom(cause, "The debug discard failed."));
    } finally {
      setRoomBusy(false);
    }
  }, [room, debugDiscardEnabled, roomBusy, loadSnapshot]);
}

export function useMoveRoom(ports: {
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  room: SceneView;
  roomBusy: boolean;
  roomEnded: boolean;
  roomMoveOperationIdRef: React.RefObject<string>;
  roomMoveZoneId: string;
  roomSendInFlightRef: React.RefObject<boolean>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomContactBoundary: React.Dispatch<SetStateAction<string>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomMode: React.Dispatch<SetStateAction<SceneComposerMode>>;
  setRoomMoveZoneId: React.Dispatch<SetStateAction<string>>;
}) {
  const {
    loadSnapshot,
    room,
    roomBusy,
    roomEnded,
    roomMoveOperationIdRef,
    roomMoveZoneId,
    roomSendInFlightRef,
    setRoom,
    setRoomBusy,
    setRoomContactBoundary,
    setRoomError,
    setRoomMode,
    setRoomMoveZoneId,
  } = ports;
  return useCallback(async () => {
    if (
      !room?.id ||
      roomEnded ||
      roomBusy ||
      roomSendInFlightRef.current ||
      !roomMoveZoneId ||
      roomMoveZoneId === room.zoneId
    )
      return;
    roomSendInFlightRef.current = true;
    setRoomBusy(true);
    setRoomError("");
    let operationId = roomMoveOperationIdRef.current ?? createVillagesClientId();
    try {
      const { operation } = await request<{ operation: RoomOperation | null }>(
        `/rooms/${encodeURIComponent(room.id)}/operation`,
      );
      const resend = sceneResend(operation, { zoneId: roomMoveZoneId }, operationId);
      operationId = resend.submissionId;
      roomMoveOperationIdRef.current = operationId;
      const { session } = await request<{ session: SceneView }>("/rooms/zone", {
        method: "POST",
        body: JSON.stringify({
          sessionId: room.id,
          zoneId: roomMoveZoneId,
          operationId,
          expectedSceneRevision: room.sceneRevision ?? 0,
          retryOfAttemptId: resend.retryOfAttemptId,
        }),
      });
      setRoom(currentRoom(session));
      setRoomMode("chat");
      setRoomMoveZoneId("");
      setRoomContactBoundary("");
      roomMoveOperationIdRef.current = null;
      void loadSnapshot();
    } catch (cause) {
      const latest = await refreshSceneAfterFailure(room.id, operationId);
      if (latest) setRoom(currentRoom(latest));
      if (latest?.submissions?.some((entry) => entry.id === operationId)) {
        setRoomMode("chat");
        setRoomMoveZoneId("");
        setRoomContactBoundary("");
        roomMoveOperationIdRef.current = null;
        void loadSnapshot();
      } else setRoomError(messageFrom(cause, "That Zone could not be entered."));
    } finally {
      roomSendInFlightRef.current = false;
      setRoomBusy(false);
    }
  }, [room, roomMoveZoneId, roomEnded, roomBusy, loadSnapshot]);
}

export function useSendRoom(ports: {
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  receiveRoomRecordEvents: (events: readonly RoomRecordEvent[]) => void;
  room: SceneView;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomContactBoundary: string;
  roomContactKind: "knock" | "call";
  roomDraft: string;
  roomEnded: boolean;
  roomMode: SceneComposerMode;
  roomSendInFlightRef: React.RefObject<boolean>;
  roomSubmissionIdRef: React.RefObject<string>;
  roomTargetId: string;
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setLastSceneEnding: React.Dispatch<SetStateAction<string>>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomContactKind: React.Dispatch<SetStateAction<"knock" | "call">>;
  setRoomDraft: React.Dispatch<SetStateAction<string>>;
  setRoomEnded: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomGreetingNotice: React.Dispatch<SetStateAction<string>>;
  setRoomMode: React.Dispatch<SetStateAction<SceneComposerMode>>;
  setRoomNotices: React.Dispatch<SetStateAction<RoomRecordEvent[]>>;
  setRoomOpen: React.Dispatch<SetStateAction<boolean>>;
  setRoomRuling: React.Dispatch<SetStateAction<string>>;
  setRoomTargetId: React.Dispatch<SetStateAction<string>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
  snapshot: VillageSnapshot;
}) {
  const {
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomContactBoundary,
    roomContactKind,
    roomDraft,
    roomEnded,
    roomMode,
    roomSendInFlightRef,
    roomSubmissionIdRef,
    roomTargetId,
    seenRoomEventIdsRef,
    setLastSceneEnding,
    setRoom,
    setRoomBusy,
    setRoomContactKind,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomGreetingNotice,
    setRoomMode,
    setRoomNotices,
    setRoomOpen,
    setRoomRuling,
    setRoomTargetId,
    setScreen,
    snapshot,
  } = ports;
  return useCallback(async () => {
    const venue = snapshot?.settings.venues.find((place) => place.id === room?.placeId);
    const targetZone = venue?.zones?.find((zone) => zone.id === roomContactBoundary);
    const contactLabel = targetZone ? sceneZoneLabel(targetZone) : "the adjacent Zone";
    const text =
      roomDraft.trim() || (roomMode === "contact" ? `I try to get someone’s attention toward ${contactLabel}.` : "");
    if (room === null || !room.id || roomEnded || roomBusy || roomSendInFlightRef.current || text.length === 0) return;
    roomSendInFlightRef.current = true;
    let submissionId = roomSubmissionIdRef.current ?? createVillagesClientId();
    let resend: ReturnType<typeof sceneResend>;
    const before = room;
    try {
      await request("/rooms/activity", { method: "POST", body: JSON.stringify({ sessionId: room.id }) });
      const { operation } = await request<{ operation: RoomOperation | null }>(
        `/rooms/${encodeURIComponent(room.id)}/operation`,
      );
      resend = sceneResend(
        operation,
        {
          message: text,
          mode: roomMode,
          targetId: roomMode === "fulfill" || roomMode === "contact" ? roomTargetId : "",
          ...(roomMode === "contact"
            ? { contact: { kind: roomContactKind, boundaryZoneId: roomContactBoundary } }
            : {}),
        },
        submissionId,
      );
      submissionId = resend.submissionId;
      roomSubmissionIdRef.current = submissionId;
    } catch (cause) {
      roomSendInFlightRef.current = false;
      const staleReason = staleVenueReason(cause);
      if (staleReason) {
        setRoom(null);
        setRoomOpen(false);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setLastSceneEnding(
          staleReason === "inactivity"
            ? "Interrupted: Inactivity. Your completed exchanges were saved in the Scene archive."
            : "This Scene ended while you were away. Its completed exchanges are in the Scene archive.",
        );
        setScreen("home");
        void loadSnapshot();
      } else setRoomError(messageFrom(cause, "The Scene could not be checked."));
      return;
    }
    const mine: RoomLine = {
      speakerId: "",
      name: "",
      role: "user",
      content: text,
      at: new Date().toISOString(),
    };
    setRoomBusy(true);
    setRoomError("");
    setRoomDraft("");
    setRoom({ ...room, lines: [...room.lines, mine] });
    roomCompletionRef.current = { roomId: room.id, submissionId };
    try {
      const answer = await request<{
        session: SceneView;
        verdict: WishVerdict | null;
        action: { narration: string } | null;
        recordEvents: RoomRecordEvent[];
      }>("/rooms/turn", {
        method: "POST",
        body: JSON.stringify({
          sessionId: room.id,
          message: text,
          mode: roomMode,
          targetId: roomMode === "fulfill" || roomMode === "contact" ? roomTargetId : "",
          ...(roomMode === "contact"
            ? { contact: { kind: roomContactKind, boundaryZoneId: roomContactBoundary } }
            : {}),
          ...resend,
          expectedSceneRevision: room.sceneRevision ?? 0,
        }),
        signal: AbortSignal.timeout(300_000),
      });
      setRoom(currentRoom(answer.session));
      setRoomEnded(answer.session.status === "closed");
      if (answer.session.status !== "closed") roomCompletionRef.current = null;
      receiveRoomRecordEvents(answer.recordEvents ?? []);
      if (roomMode === "contact") {
        setRoomTargetId("");
        setRoomContactKind("call");
      }
      if (roomTargetId && !answer.session.activeIds.includes(roomTargetId)) setRoomTargetId("");
      setRoomRuling(answer.verdict?.reason ?? "");
      if (roomMode !== "contact") setRoomMode("chat");
      roomSubmissionIdRef.current = null;
      setRoomGreetingNotice("");
      void loadSnapshot();
    } catch (cause) {
      const latest = await refreshSceneAfterFailure(room.id, submissionId);
      if (latest) setRoom(currentRoom(latest));
      const recovered = latest?.submissions?.some((entry) => entry.id === submissionId)
        ? latest
        : await completedRoomAfterFailure(room.id, submissionId);
      if (recovered) {
        setRoom(currentRoom(recovered));
        setRoomEnded(recovered.status === "closed");
        setRoomError("");
        setRoomDraft("");
        if (roomMode === "contact") {
          setRoomTargetId("");
          setRoomContactKind("call");
        }
        roomSubmissionIdRef.current = null;
        setRoomGreetingNotice("");
        void loadSnapshot();
        return;
      }
      roomCompletionRef.current = null;
      const staleReason = staleVenueReason(cause);
      if (staleReason) {
        setRoom(null);
        setRoomOpen(false);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setLastSceneEnding(
          staleReason === "inactivity"
            ? "Interrupted: Inactivity. Your completed exchanges were saved in the Scene archive."
            : "This Scene ended while you were away. Its completed exchanges are in the Scene archive.",
        );
        setScreen("home");
        void loadSnapshot();
        return;
      }
      const authoritative = await refreshSceneAfterFailure(room.id, submissionId);
      if (authoritative) setRoom(currentRoom(authoritative));
      else setRoom(before);
      if (cause instanceof VillageApiError && (cause.code === "SCENE_BUSY" || cause.code === "SCENE_STALE"))
        roomSubmissionIdRef.current = null;
      setRoomDraft((current) => current || text);
      setRoomError(messageFrom(cause, "That line could not be sent."));
    } finally {
      roomSendInFlightRef.current = false;
      setRoomBusy(false);
    }
  }, [
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomDraft,
    roomEnded,
    roomMode,
    roomContactBoundary,
    roomContactKind,
    roomTargetId,
    snapshot?.settings.venues,
  ]);
}

export function useGreetRoom(ports: {
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomGreetingError: React.Dispatch<SetStateAction<{ sessionId: string; message: string }>>;
  setRoomGreetingNotice: React.Dispatch<SetStateAction<string>>;
}) {
  const { loadSnapshot, setRoom, setRoomBusy, setRoomError, setRoomGreetingError, setRoomGreetingNotice } = ports;
  return useCallback(
    async (sessionId: string) => {
      setRoomBusy(true);
      setRoomError("");
      setRoomGreetingError(null);
      setRoomGreetingNotice("");
      try {
        const answer = await request<{ session: SceneView }>("/rooms/greet", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
          signal: AbortSignal.timeout(30_000),
        });
        setRoom((current) => (current?.id === sessionId ? currentRoom(answer.session) : current));
        setRoomGreetingError((current) => (current?.sessionId === sessionId ? null : current));
        void loadSnapshot();
      } catch (cause) {
        const recovered = await completedGreetingAfterFailure(sessionId);
        if (recovered) {
          setRoom((current) => (current?.id === sessionId ? recovered : current));
          setRoomGreetingError((current) => (current?.sessionId === sessionId ? null : current));
        } else
          setRoomGreetingError((current) =>
            current && current.sessionId !== sessionId ? current : { sessionId, message: openingFailureMessage(cause) },
          );
      } finally {
        setRoomBusy(false);
      }
    },
    [loadSnapshot],
  );
}

export function useRetrySavedScene(ports: {
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  receiveRoomRecordEvents: (events: readonly RoomRecordEvent[]) => void;
  room: SceneView;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomDraft: string;
  roomLeaveSubmissionIdRef: React.RefObject<string>;
  roomMoveOperationIdRef: React.RefObject<string>;
  roomSubmissionIdRef: React.RefObject<string>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomContactBoundary: React.Dispatch<SetStateAction<string>>;
  setRoomContactKind: React.Dispatch<SetStateAction<"knock" | "call">>;
  setRoomDraft: React.Dispatch<SetStateAction<string>>;
  setRoomEnded: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomMode: React.Dispatch<SetStateAction<SceneComposerMode>>;
  setRoomMoveZoneId: React.Dispatch<SetStateAction<string>>;
  setRoomTargetId: React.Dispatch<SetStateAction<string>>;
}) {
  const {
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomDraft,
    roomLeaveSubmissionIdRef,
    roomMoveOperationIdRef,
    roomSubmissionIdRef,
    setRoom,
    setRoomBusy,
    setRoomContactBoundary,
    setRoomContactKind,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomMode,
    setRoomMoveZoneId,
    setRoomTargetId,
  } = ports;
  return useCallback(async () => {
    if (!room?.id || !room.operation || roomBusy) return;
    setRoomBusy(true);
    try {
      const { operation } = await request<{ operation: RoomOperation }>(
        `/rooms/${encodeURIComponent(room.id)}/operations/${encodeURIComponent(room.operation.id)}`,
      );
      const path =
        operation.kind === "move"
          ? "/rooms/zone"
          : operation.kind === "memory"
            ? `/rooms/archive/${encodeURIComponent(room.id)}/retry-memory`
            : operation.kind === "greet"
              ? "/rooms/greet"
              : operation.kind === "turn"
                ? operation.input?.mode === "leave"
                  ? "/rooms/leave"
                  : "/rooms/turn"
                : "/rooms/end";
      const answer = await request<{ session: SceneView; recordEvents?: RoomRecordEvent[] }>(path, {
        method: "POST",
        body: JSON.stringify({
          ...operation.input,
          sessionId: room.id,
          submissionId: operation.id,
          operationId: operation.id,
          expectedSceneRevision: room.sceneRevision ?? 0,
          retryOfAttemptId: operation.attemptId,
        }),
        signal: AbortSignal.timeout(300_000),
      });
      setRoom(currentRoom(answer.session));
      setRoomEnded(answer.session.status === "closed");
      receiveRoomRecordEvents(answer.recordEvents ?? []);
      if (roomDraft.trim() === operation.input?.message) setRoomDraft("");
      roomSubmissionIdRef.current = null;
      roomLeaveSubmissionIdRef.current = null;
      roomCompletionRef.current = null;
      setRoomError("");
      if (operation.kind === "move") {
        setRoomMode("chat");
        setRoomMoveZoneId("");
        setRoomContactBoundary("");
        roomMoveOperationIdRef.current = null;
      }
      if (operation.kind === "turn" && operation.input?.mode === "contact") {
        setRoomTargetId("");
        setRoomContactKind("call");
      }
      void loadSnapshot();
    } catch (cause) {
      const latest = await refreshSceneAfterFailure(room.id);
      if (latest) setRoom(currentRoom(latest));
      setRoomError(messageFrom(cause, "The saved request could not be recovered."));
    } finally {
      setRoomBusy(false);
    }
  }, [room, roomBusy, roomDraft, receiveRoomRecordEvents, loadSnapshot]);
}

export function useContinueRoomWithoutGreeting(ports: {
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomGreetingNotice: React.Dispatch<SetStateAction<string>>;
}) {
  const { setRoom, setRoomBusy, setRoomError, setRoomGreetingNotice } = ports;
  return useCallback(async (sessionId: string) => {
    setRoomBusy(true);
    try {
      const { session } = await request<{ session: SceneView }>("/rooms/continue", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
        signal: AbortSignal.timeout(10_000),
      });
      setRoom(currentRoom(session));
      setRoomGreetingNotice(session.lines.length === 0 ? "The opening failed. You can continue the Scene now." : "");
      setRoomError("");
    } catch (cause) {
      setRoomError(messageFrom(cause, "The Scene could not continue. Retry or leave the venue."));
    } finally {
      setRoomBusy(false);
    }
  }, []);
}

export function useOpenRoom(ports: {
  greetRoom: (sessionId: string) => Promise<void>;
  leavingRoomPendingRef: React.RefObject<boolean>;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  room: SceneView;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setLastSceneEnding: React.Dispatch<SetStateAction<string>>;
  setOpenPlaceId: React.Dispatch<SetStateAction<string>>;
  setPlaceProblem: React.Dispatch<SetStateAction<{ id: string; text: string }>>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomDraft: React.Dispatch<SetStateAction<string>>;
  setRoomEnded: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomGreetingNotice: React.Dispatch<SetStateAction<string>>;
  setRoomMode: React.Dispatch<SetStateAction<SceneComposerMode>>;
  setRoomNotices: React.Dispatch<SetStateAction<RoomRecordEvent[]>>;
  setRoomOpen: React.Dispatch<SetStateAction<boolean>>;
  setRoomRuling: React.Dispatch<SetStateAction<string>>;
  setRoomTargetId: React.Dispatch<SetStateAction<string>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
}) {
  const {
    greetRoom,
    leavingRoomPendingRef,
    loadSnapshot,
    room,
    roomCompletionRef,
    seenRoomEventIdsRef,
    setLastSceneEnding,
    setOpenPlaceId,
    setPlaceProblem,
    setRoom,
    setRoomBusy,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomGreetingNotice,
    setRoomMode,
    setRoomNotices,
    setRoomOpen,
    setRoomRuling,
    setRoomTargetId,
    setScreen,
  } = ports;
  return useCallback(
    async (
      place: VillageVenue,
      spaceClass?: VenueClass,
      privateOwnerId = "",
      entryArea?: "outside" | "shared" | "private" | "public",
      zoneId?: string,
    ) => {
      if (room?.id && room.status === "active" && room.placeId === place.id && zoneId) {
        setRoomBusy(true);
        setRoomError("");
        try {
          const { session } = await request<{ session: SceneView }>("/rooms/zone", {
            method: "POST",
            body: JSON.stringify({ sessionId: room.id, zoneId, expectedSceneRevision: room.sceneRevision ?? 0 }),
          });
          setRoom(currentRoom(session));
          setRoomTargetId("");
          setScreen("room");
          setRoomOpen(true);
          void loadSnapshot();
        } catch (cause) {
          setRoomError(messageFrom(cause, "That zone could not be entered."));
        } finally {
          setRoomBusy(false);
        }
        return;
      }
      leavingRoomPendingRef.current = false;
      roomCompletionRef.current = null;
      setOpenPlaceId(null);
      setPlaceProblem(null);
      setRoomDraft("");
      setRoomEnded(false);
      setRoomError("");
      setRoomGreetingNotice("");
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setRoomBusy(true);
      setRoom({
        version: 1,
        id: "",
        placeId: place.id,
        placeName: place.name,
        startedAt: "",
        endedAt: "",
        status: "opening",
        activeIds: [],
        participants: [],
        lines: [],
      });
      setRoomOpen(true);
      setScreen("room");
      try {
        const { session } = await request<{ session: SceneView }>("/rooms", {
          method: "POST",
          body: JSON.stringify({
            venueId: place.id,
            spaceClass,
            privateOwnerId,
            entryArea,
            zoneId,
            expectedSceneRevision: room?.sceneRevision,
          }),
          signal: AbortSignal.timeout(20_000),
        });
        setRoom(currentRoom(session));
        setRoomMode("chat");
        setRoomTargetId("");
        setRoomRuling("");
        setLastSceneEnding("");
        setRoomOpen(true);
        void loadSnapshot();
        if (session.status === "opening") await greetRoom(session.id);
      } catch (cause) {
        setRoomError(messageFrom(cause, "That Zone could not be opened. Retry or leave the venue."));
      } finally {
        setRoomBusy(false);
      }
    },
    [greetRoom, loadSnapshot, room],
  );
}
