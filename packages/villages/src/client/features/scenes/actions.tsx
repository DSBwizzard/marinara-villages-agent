import { useConfirmation } from "../../shared/confirmation.js";
import { useCallback, useRef, type SetStateAction } from "react";
import {
  isSceneTurnOutcome,
  sceneTurnOutcomeMessage,
  type SceneTurnOutcome,
} from "../../../shared/contracts/scene-turn-outcome.js";
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
import { recordTurnTiming } from "../../shared/turn-timing.js";
import type { SceneComposerMode } from "../../shared/types.js";
import { useSceneEntryLifetime } from "./entry-lifetime.js";
import { useSceneRequestLifetime } from "./request-lifetime.js";
import {
  completedGreetingAfterFailure,
  completedRoomAfterFailure,
  currentRoom,
  openingFailureMessage,
  refreshSceneAfterFailure,
  staleVenueReason,
} from "./ScenePanel.js";
import { useTurnRecovery } from "./turn-recovery.js";
import type { LegacySceneRecovery } from "./useScenesState.js";
import { sceneResend } from "./villages-venue-send";

function sameSavedOperation(
  expected: RoomOperation,
  actual: RoomOperation | null | undefined,
  includeInput = true,
): boolean {
  return (
    !!actual &&
    expected.id === actual.id &&
    expected.kind === actual.kind &&
    expected.attemptId === actual.attemptId &&
    expected.status === actual.status &&
    (!includeInput || JSON.stringify(expected.input) === JSON.stringify(actual.input))
  );
}

function hasPendingLegacy(operation: RoomOperation | null): boolean {
  return (
    !!operation &&
    (operation.status !== "complete" || !!operation.error) &&
    ["contact", "fulfill"].includes(operation.input?.mode ?? "")
  );
}

export function useReceiveRoomRecordEvents(ports: {
  dismissedRoomEventIdsRef: React.RefObject<Set<string>>;
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setRoomNotices: React.Dispatch<SetStateAction<RoomRecordEvent[]>>;
}) {
  const { dismissedRoomEventIdsRef, seenRoomEventIdsRef, setRoomNotices } = ports;
  return useCallback(
    (events: readonly RoomRecordEvent[]) => {
      const fresh: RoomRecordEvent[] = [];
      for (const event of events) {
        if (seenRoomEventIdsRef.current.has(event.id) || dismissedRoomEventIdsRef.current.has(event.id)) continue;
        seenRoomEventIdsRef.current.add(event.id);
        fresh.push(event);
      }
      if (fresh.length > 0) setRoomNotices((current) => [...current, ...fresh]);
    },
    [dismissedRoomEventIdsRef, seenRoomEventIdsRef, setRoomNotices],
  );
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
    [dismissedRoomEventIdsRef, room?.id, seenRoomEventIdsRef, setRoomError, setRoomNotices],
  );
}

export function useCloseRoom(ports: {
  isFounded: boolean | undefined;
  onUnknownSceneExit?: () => void;
  leavingRoomPendingRef: React.RefObject<boolean>;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  receiveRoomRecordEvents: (events: readonly RoomRecordEvent[]) => void;
  room: SceneView;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomEnded: boolean;
  roomSendInFlightRef: React.RefObject<boolean>;
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
    isFounded,
    onUnknownSceneExit,
    leavingRoomPendingRef,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    roomBusy,
    roomCompletionRef,
    roomEnded,
    roomSendInFlightRef,
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
  const submission = useRef<string | null>(null);
  const lifetime = useSceneRequestLifetime({
    sceneId: room?.id,
    selectionIdentity: room?.id ? undefined : (room ?? undefined),
    isFounded,
    ended: roomEnded || room?.status === "closed",
    inFlight: roomSendInFlightRef,
    submission,
    completion: roomCompletionRef,
    setBusy: setRoomBusy,
  });
  return useCallback(async () => {
    if (!room || roomBusy || roomSendInFlightRef.current || !lifetime.isCurrent(room.id)) return;
    if (!room.id || room.status === "closed" || roomEnded) {
      // A lost entry reply may have created a server Scene without returning its ID.
      if (!room.id) onUnknownSceneExit?.();
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
    const claim = lifetime.begin(room.id);
    if (!claim) return;
    claim.busy = true;
    setRoomBusy(true);
    setRoomError("");
    setEndFailed(false);
    setRoom({ ...room, status: "closing" });
    roomCompletionRef.current = { roomId: room.id, submissionId: "" };
    claim.completion = roomCompletionRef.current;
    try {
      const answer = await request<{ session: SceneView; recordEvents: RoomRecordEvent[] }>("/rooms/end", {
        method: "POST",
        body: JSON.stringify({
          sessionId: room.id,
          expectedSceneRevision: room.sceneRevision ?? 0,
          ...(room.operation?.status === "interrupted"
            ? { abandonOperationId: room.operation.id, retryOfAttemptId: room.operation.attemptId }
            : {}),
        }),
      });
      if (!lifetime.owns(claim) || leavingRoomPendingRef.current) return;
      setRoom(currentRoom(answer.session));
      setRoomEnded(true);
      receiveRoomRecordEvents(answer.recordEvents ?? []);
      if (room.openingReader) {
        roomCompletionRef.current = null;
        setRoomOpen(false);
        setRoom(null);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setScreen("home");
      }
      setRoomDraft("");
      setRoomGreetingNotice("");
      void loadSnapshot();
    } catch (cause) {
      if (!lifetime.owns(claim) || leavingRoomPendingRef.current) return;
      roomCompletionRef.current = null;
      claim.completion = null;
      const staleReason = staleVenueReason(cause);
      if (staleReason) {
        setRoom(null);
        setRoomOpen(false);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setLastSceneEnding(
          staleReason === "inactivity" ? "Interrupted: Inactivity." : "This Scene ended while you were away.",
        );
        setScreen("home");
        void loadSnapshot();
        return;
      }
      const authoritative = await refreshSceneAfterFailure(room.id, undefined, () => lifetime.owns(claim));
      if (!lifetime.owns(claim)) return;
      if (!authoritative) {
        const response = await request<{ operation: RoomOperation | null }>(
          `/rooms/${encodeURIComponent(room.id)}/operations/close`,
        ).catch(() => ({ operation: null }));
        if (!lifetime.owns(claim)) return;
        if (
          response.operation?.terminal &&
          response.operation.status === "complete" &&
          response.operation.id === "close"
        ) {
          setRoom({ ...room, status: "closed" });
          setRoomEnded(true);
          receiveRoomRecordEvents(response.operation.recordEvents ?? []);
          setRoomError("");
          setEndFailed(false);
          setRoomDraft("");
          void loadSnapshot();
          return;
        }
      }
      if (authoritative) {
        setRoom(currentRoom(authoritative));
        setRoomEnded(authoritative.status === "closed");
      }
      setRoomError(messageFrom(cause, "You could not leave the venue."));
      setEndFailed(true);
    } finally {
      if (lifetime.finish(claim)) setRoomBusy(false);
    }
  }, [
    room,
    roomBusy,
    roomSendInFlightRef,
    lifetime,
    roomEnded,
    setRoomBusy,
    setRoomError,
    setEndFailed,
    setRoom,
    roomCompletionRef,
    onUnknownSceneExit,
    setRoomOpen,
    setRoomNotices,
    seenRoomEventIdsRef,
    setRoomDraft,
    setRoomGreetingNotice,
    setScreen,
    loadSnapshot,
    leavingRoomPendingRef,
    setRoomEnded,
    receiveRoomRecordEvents,
    setLastSceneEnding,
  ]);
}

export function useLeaveRoom(ports: {
  composerEditVersionRef: React.RefObject<number>;
  isFounded: boolean | undefined;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  receiveRoomRecordEvents: (events: readonly RoomRecordEvent[]) => void;
  room: SceneView;
  legacyRecovery: LegacySceneRecovery | null;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomDraft: string;
  roomEnded: boolean;
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
  setRoomRuling: React.Dispatch<SetStateAction<string>>;
  setRoomNotices: React.Dispatch<SetStateAction<RoomRecordEvent[]>>;
  setRoomOpen: React.Dispatch<SetStateAction<boolean>>;
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
}) {
  const {
    composerEditVersionRef,
    isFounded,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    legacyRecovery,
    roomBusy,
    roomCompletionRef,
    roomDraft,
    roomEnded,
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
    setRoomRuling,
    setRoomNotices,
    setRoomOpen,
    setScreen,
  } = ports;
  const lifetime = useSceneRequestLifetime({
    sceneId: room?.id,
    isFounded,
    ended: roomEnded || room?.status === "closed",
    inFlight: roomSendInFlightRef,
    submission: roomLeaveSubmissionIdRef,
    completion: roomCompletionRef,
    setBusy: setRoomBusy,
  });
  return useCallback(async () => {
    if (
      !room?.id ||
      room.status !== "active" ||
      roomBusy ||
      roomSendInFlightRef.current ||
      legacyRecovery?.sceneId === room.id
    )
      return;
    const claim = lifetime.begin(room.id);
    if (!claim) return;
    let submissionId = roomLeaveSubmissionIdRef.current ?? createVillagesClientId();
    roomLeaveSubmissionIdRef.current = submissionId;
    claim.submission = submissionId;
    roomCompletionRef.current = { roomId: room.id, submissionId };
    claim.completion = roomCompletionRef.current;
    claim.busy = true;
    setRoomBusy(true);
    setRoomError("");
    setRoomRuling("");
    setEndFailed(false);
    const editVersion = composerEditVersionRef.current;
    const held = (outcome: SceneTurnOutcome) => {
      setRoomEnded(false);
      if (composerEditVersionRef.current === editVersion) {
        setRoomDraft(roomDraft);
        setRoomRuling(sceneTurnOutcomeMessage(outcome));
      }
      roomLeaveSubmissionIdRef.current = null;
      claim.submission = null;
      roomCompletionRef.current = null;
      claim.completion = null;
    };
    try {
      const { operation } = await request<{ operation: RoomOperation | null }>(
        `/rooms/${encodeURIComponent(room.id)}/operation`,
      );
      if (!lifetime.owns(claim)) return;
      if (hasPendingLegacy(operation)) throw new Error("Review the saved action before continuing.");
      const resend = sceneResend(operation, { message: roomDraft, mode: "leave", targetId: "" }, submissionId);
      submissionId = resend.submissionId;
      roomLeaveSubmissionIdRef.current = submissionId;
      claim.submission = submissionId;
      roomCompletionRef.current = { roomId: room.id, submissionId };
      claim.completion = roomCompletionRef.current;
      const answer = await request<{
        session: SceneView;
        recordEvents: RoomRecordEvent[];
        turnOutcome?: SceneTurnOutcome;
      }>("/rooms/leave", {
        method: "POST",
        body: JSON.stringify({
          sessionId: room.id,
          ...resend,
          message: roomDraft,
          expectedSceneRevision: room.sceneRevision ?? 0,
        }),
        signal: AbortSignal.timeout(300_000),
      });
      if (!lifetime.owns(claim)) return;
      setRoom(currentRoom(answer.session));
      if (isSceneTurnOutcome(answer.turnOutcome)) {
        held(answer.turnOutcome);
        return;
      }
      setRoomEnded(true);
      receiveRoomRecordEvents(answer.recordEvents ?? []);
      roomLeaveSubmissionIdRef.current = null;
      claim.submission = null;
      setRoomDraft("");
      void loadSnapshot();
    } catch (cause) {
      if (!lifetime.owns(claim)) return;
      const latest = await refreshSceneAfterFailure(room.id, submissionId, () => lifetime.owns(claim));
      if (!lifetime.owns(claim)) return;
      const { operation } = await request<{ operation: RoomOperation | null }>(
        `/rooms/${encodeURIComponent(room.id)}/operations/${encodeURIComponent(submissionId)}`,
      ).catch(() => ({ operation: null }));
      if (!lifetime.owns(claim)) return;
      if (operation?.id === submissionId && isSceneTurnOutcome(operation.turnOutcome)) {
        if (latest) setRoom(currentRoom(latest));
        held(operation.turnOutcome);
        return;
      }
      if (operation?.id === submissionId && operation.terminal && operation.status === "complete") {
        setRoom({ ...room, status: "closed" });
        setRoomEnded(true);
        receiveRoomRecordEvents(operation.recordEvents ?? []);
        if (composerEditVersionRef.current === editVersion) setRoomDraft("");
        setRoomError("The Scene ended. Your turn completed, but the reply text is no longer available.");
        setEndFailed(false);
        roomLeaveSubmissionIdRef.current = null;
        claim.submission = null;
        void loadSnapshot();
        return;
      }
      const recovered = latest?.submissions?.some((entry) => entry.id === submissionId)
        ? latest
        : await completedRoomAfterFailure(room.id, submissionId, () => lifetime.owns(claim));
      if (!lifetime.owns(claim)) return;
      if (latest) setRoom(currentRoom(latest));
      if (recovered) {
        setRoom(currentRoom(recovered));
        setRoomEnded(recovered.status === "closed");
        setRoomDraft("");
        setRoomError("");
        setEndFailed(false);
        roomLeaveSubmissionIdRef.current = null;
        claim.submission = null;
        void loadSnapshot();
        return;
      }
      roomCompletionRef.current = null;
      claim.completion = null;
      const staleReason = staleVenueReason(cause);
      if (staleReason) {
        setRoom(null);
        setRoomOpen(false);
        setRoomNotices([]);
        seenRoomEventIdsRef.current.clear();
        setLastSceneEnding(
          staleReason === "inactivity" ? "Interrupted: Inactivity." : "This Scene ended while you were away.",
        );
        setScreen("home");
        void loadSnapshot();
        return;
      }
      setRoomError(messageFrom(cause, "The scene could not end yet."));
      setEndFailed(true);
    } finally {
      if (lifetime.finish(claim)) setRoomBusy(false);
    }
  }, [
    composerEditVersionRef,
    lifetime,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    legacyRecovery,
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
    setRoomRuling,
    setRoomNotices,
    setRoomOpen,
    setScreen,
  ]);
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
  const confirmVillages = useConfirmation(ports.room?.id);
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
      !(await confirmVillages(
        "DEBUG: Discard this Scene and its transcript? Completed effects and villager memories remain.",
      ))
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
  }, [
    confirmVillages,
    room?.id,
    debugDiscardEnabled,
    roomBusy,
    setRoomBusy,
    setRoom,
    setRoomOpen,
    setRoomNotices,
    seenRoomEventIdsRef,
    setRoomDraft,
    setScreen,
    loadSnapshot,
    setRoomError,
  ]);
}

export function useMoveRoom(ports: {
  isFounded: boolean | undefined;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  room: SceneView;
  legacyRecovery: LegacySceneRecovery | null;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
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
    isFounded,
    loadSnapshot,
    room,
    legacyRecovery,
    roomBusy,
    roomCompletionRef,
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
  const lifetime = useSceneRequestLifetime({
    sceneId: room?.id,
    isFounded,
    ended: roomEnded || room?.status === "closed",
    inFlight: roomSendInFlightRef,
    submission: roomMoveOperationIdRef,
    completion: roomCompletionRef,
    setBusy: setRoomBusy,
    clearCompletionOnRetire: false,
  });
  return useCallback(
    async (zoneId = roomMoveZoneId) => {
      if (
        !room?.id ||
        roomEnded ||
        roomBusy ||
        roomSendInFlightRef.current ||
        legacyRecovery?.sceneId === room.id ||
        !zoneId ||
        zoneId === room.zoneId
      )
        return;
      if (zoneId !== roomMoveZoneId) roomMoveOperationIdRef.current = null;
      setRoomMoveZoneId(zoneId);
      const claim = lifetime.begin(room.id);
      if (!claim) return;
      const owns = () => lifetime.owns(claim);
      claim.busy = true;
      setRoomBusy(true);
      setRoomError("");
      let operationId = roomMoveOperationIdRef.current ?? createVillagesClientId();
      try {
        const { operation } = await request<{ operation: RoomOperation | null }>(
          `/rooms/${encodeURIComponent(room.id)}/operation`,
        );
        if (!owns()) return;
        if (hasPendingLegacy(operation)) throw new Error("Review the saved action before moving.");
        const resend = sceneResend(operation, { zoneId }, operationId);
        operationId = resend.submissionId;
        roomMoveOperationIdRef.current = operationId;
        claim.submission = operationId;
        const { session } = await request<{ session: SceneView }>("/rooms/zone", {
          method: "POST",
          body: JSON.stringify({
            sessionId: room.id,
            zoneId,
            operationId,
            expectedSceneRevision: room.sceneRevision ?? 0,
            retryOfAttemptId: resend.retryOfAttemptId,
          }),
        });
        if (!owns()) return;
        setRoom(currentRoom(session));
        setRoomMode("chat");
        setRoomMoveZoneId("");
        setRoomContactBoundary("");
        roomMoveOperationIdRef.current = null;
        claim.submission = null;
        void loadSnapshot();
      } catch (cause) {
        if (!owns()) return;
        const latest = await refreshSceneAfterFailure(room.id, operationId, owns);
        if (!owns()) return;
        const { operation: completed } = await request<{ operation: RoomOperation | null }>(
          `/rooms/${encodeURIComponent(room.id)}/operations/${encodeURIComponent(operationId)}`,
        ).catch(() => ({ operation: null }));
        if (!owns()) return;
        if (latest) setRoom(currentRoom(latest));
        if (latest && completed?.status === "complete" && !completed.error) {
          setRoomMode("chat");
          setRoomMoveZoneId("");
          setRoomContactBoundary("");
          roomMoveOperationIdRef.current = null;
          claim.submission = null;
          void loadSnapshot();
        } else setRoomError(messageFrom(cause, "That Zone could not be entered."));
      } finally {
        if (lifetime.finish(claim)) setRoomBusy(false);
      }
    },
    [
      room,
      legacyRecovery,
      roomMoveZoneId,
      roomEnded,
      roomBusy,
      loadSnapshot,
      lifetime,
      roomMoveOperationIdRef,
      roomSendInFlightRef,
      setRoom,
      setRoomBusy,
      setRoomContactBoundary,
      setRoomError,
      setRoomMode,
      setRoomMoveZoneId,
    ],
  );
}

export function useSendRoom(ports: {
  visible?: boolean;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  receiveRoomRecordEvents: (events: readonly RoomRecordEvent[]) => void;
  composerEditVersionRef?: React.RefObject<number>;
  room: SceneView;
  legacyRecovery: LegacySceneRecovery | null;
  setLegacyRecovery: React.Dispatch<SetStateAction<LegacySceneRecovery | null>>;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomDraft: string;
  roomEnded: boolean;
  roomMode: SceneComposerMode;
  roomSendInFlightRef: React.RefObject<boolean>;
  roomSubmissionIdRef: React.RefObject<string>;
  seenRoomEventIdsRef: React.RefObject<Set<string>>;
  setLastSceneEnding: React.Dispatch<SetStateAction<string>>;
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
  setScreen: React.Dispatch<
    SetStateAction<"menu" | "venue" | "home" | "setup" | "resume" | "preparing" | "room" | "person">
  >;
  snapshot: VillageSnapshot;
}) {
  const { composerEditVersionRef } = ports;

  const {
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    legacyRecovery,
    setLegacyRecovery,
    roomBusy,
    roomCompletionRef,
    roomDraft,
    roomEnded,
    roomMode,
    roomSendInFlightRef,
    roomSubmissionIdRef,
    seenRoomEventIdsRef,
    setLastSceneEnding,
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
    setScreen,
    snapshot,
  } = ports;
  const lifetime = useSceneRequestLifetime({
    sceneId: room?.id,
    isFounded: snapshot?.isFounded,
    ended: roomEnded || room?.status === "closed",
    inFlight: roomSendInFlightRef,
    submission: roomSubmissionIdRef,
    completion: roomCompletionRef,
    setBusy: setRoomBusy,
  });
  const recovery = useTurnRecovery({
    visible: ports.visible,
    room,
    setRoom,
    setRoomEnded,
    setRoomError,
    setRoomDraft,
    submission: roomSubmissionIdRef,
    editVersion: composerEditVersionRef,
    setRoomRuling,
    receiveRoomRecordEvents,
    refreshSnapshot: () => void loadSnapshot({ quiet: true }),
  });
  const { pending: recoveryPending, begin: beginRecovery } = recovery;
  const sendRoom = useCallback(
    async (attentionZoneId?: string, replacement?: LegacySceneRecovery) => {
      if (recoveryPending || (legacyRecovery?.sceneId === room?.id && !replacement)) return;
      const editVersion = composerEditVersionRef?.current ?? 0;
      const text = roomDraft.trim();
      const attentionChoice =
        attentionZoneId && roomMode === "chat" && room.attentionClarification?.message === text
          ? { id: room.attentionClarification.id, zoneId: attentionZoneId }
          : undefined;
      if (room === null || !room.id || roomEnded || roomBusy || roomSendInFlightRef.current || text.length === 0)
        return;
      const claim = lifetime.begin(room.id);
      if (!claim) return;
      const owns = () => lifetime.owns(claim);
      let submissionId = attentionChoice
        ? createVillagesClientId()
        : (roomSubmissionIdRef.current ?? createVillagesClientId());
      let resend: ReturnType<typeof sceneResend>;
      const before = room;
      setRoomRuling("");
      recordTurnTiming(room.id, submissionId, "send");
      try {
        const { operation } = await request<{ operation: RoomOperation | null }>(
          `/rooms/${encodeURIComponent(room.id)}/operation`,
        );
        if (!owns()) return;
        if (
          !replacement &&
          (operation?.status !== "complete" || !!operation.error) &&
          ["contact", "fulfill"].includes(operation?.input?.mode ?? "")
        )
          throw new Error("Review the saved action before sending a new message.");
        if (replacement && (replacement.sceneId !== room.id || !sameSavedOperation(replacement.operation, operation)))
          throw new Error("The saved action changed. Review it before replacing it.");
        resend = sceneResend(
          operation,
          {
            message: text,
            mode: "chat",
            targetId: "",
            ...(attentionChoice ? { attentionChoice } : {}),
          },
          submissionId,
        );
        submissionId = resend.submissionId;
        roomSubmissionIdRef.current = submissionId;
        claim.submission = submissionId;
      } catch (cause) {
        if (!lifetime.finish(claim)) return;
        const staleReason = staleVenueReason(cause);
        if (staleReason) {
          setRoom(null);
          setRoomOpen(false);
          setRoomNotices([]);
          seenRoomEventIdsRef.current.clear();
          setLastSceneEnding(
            staleReason === "inactivity" ? "Interrupted: Inactivity." : "This Scene ended while you were away.",
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
      claim.busy = true;
      setRoomError("");
      setRoomDraft("");
      setRoom({ ...room, lines: [...room.lines, mine] });
      roomCompletionRef.current = { roomId: room.id, submissionId };
      claim.completion = roomCompletionRef.current;
      try {
        const answer = await request<{
          session: SceneView;
          verdict: WishVerdict | null;
          turnOutcome?: SceneTurnOutcome;
          action: { narration: string } | null;
          recordEvents: RoomRecordEvent[];
        }>("/rooms/turn", {
          method: "POST",
          body: JSON.stringify({
            sessionId: room.id,
            message: text,
            mode: "chat",
            targetId: "",
            ...(attentionChoice ? { attentionChoice } : {}),
            ...resend,
            expectedSceneRevision: room.sceneRevision ?? 0,
          }),
          signal: AbortSignal.timeout(300_000),
        });
        if (!owns()) return;
        recordTurnTiming(room.id, submissionId, "responseReceived");
        setRoom(currentRoom(answer.session));
        setRoomEnded(answer.session.status === "closed");
        if (answer.session.status !== "closed") {
          roomCompletionRef.current = null;
          claim.completion = null;
        }
        receiveRoomRecordEvents(answer.recordEvents ?? []);
        if (replacement && !isSceneTurnOutcome(answer.turnOutcome)) setLegacyRecovery(null);
        if (isSceneTurnOutcome(answer.turnOutcome)) {
          if (!composerEditVersionRef || composerEditVersionRef.current === editVersion) {
            setRoomDraft(text);
            setRoomRuling(sceneTurnOutcomeMessage(answer.turnOutcome));
          }
          roomSubmissionIdRef.current = null;
          claim.submission = null;
          return;
        }
        if (answer.session.attentionClarification) {
          setRoomDraft(text);
          roomSubmissionIdRef.current = null;
          claim.submission = null;
          return;
        }
        setRoomRuling(answer.verdict?.reason ?? "");
        setRoomMode("chat");
        roomSubmissionIdRef.current = null;
        claim.submission = null;
        setRoomGreetingNotice("");
        void loadSnapshot();
      } catch (cause) {
        if (!owns()) return;
        const latest = await refreshSceneAfterFailure(room.id, submissionId, owns);
        if (!owns()) return;
        const { operation } = await request<{ operation: RoomOperation | null }>(
          `/rooms/${encodeURIComponent(room.id)}/operations/${encodeURIComponent(submissionId)}`,
        ).catch(() => ({ operation: null }));
        if (!owns()) return;
        if (operation?.id === submissionId && isSceneTurnOutcome(operation.turnOutcome)) {
          setRoom(currentRoom(latest ?? before));
          setRoomError("");
          if (!composerEditVersionRef || composerEditVersionRef.current === editVersion) {
            setRoomDraft(text);
            setRoomRuling(sceneTurnOutcomeMessage(operation.turnOutcome));
          }
          roomSubmissionIdRef.current = null;
          claim.submission = null;
          return;
        }
        // A turn can commit between recovery reads. Check the final active read
        // for our receipt before restoring the draft or displaying the POST error.
        let recovered = latest?.submissions?.some((entry) => entry.id === submissionId)
          ? latest
          : await completedRoomAfterFailure(room.id, submissionId, owns);
        if (!owns()) return;
        const authoritative = recovered ? null : await refreshSceneAfterFailure(room.id, submissionId, owns);
        if (!owns()) return;
        if (authoritative?.submissions?.some((entry) => entry.id === submissionId)) recovered = authoritative;
        if (recovered) {
          if (replacement) setLegacyRecovery(null);
          if (latest) setRoom(currentRoom(latest));
          setRoom(currentRoom(recovered));
          setRoomEnded(recovered.status === "closed");
          setRoomError("");
          setRoomDraft("");
          roomSubmissionIdRef.current = null;
          claim.submission = null;
          setRoomGreetingNotice("");
          void loadSnapshot();
          return;
        }
        roomCompletionRef.current = null;
        claim.completion = null;
        const staleReason = staleVenueReason(cause);
        if (staleReason) {
          if (latest) setRoom(currentRoom(latest));
          setRoom(null);
          setRoomOpen(false);
          setRoomNotices([]);
          seenRoomEventIdsRef.current.clear();
          setLastSceneEnding(
            staleReason === "inactivity" ? "Interrupted: Inactivity." : "This Scene ended while you were away.",
          );
          setScreen("home");
          void loadSnapshot();
          return;
        }
        const newest =
          latest && authoritative && (latest.sceneRevision ?? 0) > (authoritative.sceneRevision ?? 0)
            ? latest
            : (authoritative ?? latest);
        if (newest) setRoom(currentRoom(newest));
        else setRoom(before);
        if (cause instanceof VillageApiError && (cause.code === "SCENE_BUSY" || cause.code === "SCENE_STALE"))
          roomSubmissionIdRef.current = null;
        claim.submission = roomSubmissionIdRef.current;
        setRoomDraft((current) => current || text);
        const uncertain =
          !(cause instanceof VillageApiError) ||
          cause.status === 0 ||
          ["RESPONSE_READ_FAILED", "INVALID_RESPONSE"].includes(cause.code ?? "");
        if (uncertain) {
          beginRecovery(submissionId, text, editVersion, messageFrom(cause, "The reply connection was interrupted."));
          setRoomError("");
        } else setRoomError(messageFrom(cause, "That line could not be sent."));
      } finally {
        if (lifetime.finish(claim)) setRoomBusy(false);
      }
    },
    [
      recoveryPending,
      composerEditVersionRef,
      roomDraft,
      roomMode,
      legacyRecovery,
      setLegacyRecovery,
      room,
      roomEnded,
      roomBusy,
      roomSendInFlightRef,
      lifetime,
      roomSubmissionIdRef,
      setRoomBusy,
      setRoomError,
      setRoomDraft,
      setRoom,
      roomCompletionRef,
      setRoomOpen,
      setRoomNotices,
      seenRoomEventIdsRef,
      setLastSceneEnding,
      setScreen,
      loadSnapshot,
      setRoomEnded,
      receiveRoomRecordEvents,
      setRoomRuling,
      setRoomMode,
      setRoomGreetingNotice,
      beginRecovery,
    ],
  );
  return { sendRoom, turnRecovery: recovery.status, checkSavedReply: recovery.check, replyPending: recoveryPending };
}

type EntryGreeting = { owns(): boolean; handoff(session: SceneView): boolean };
export function useGreetRoom(ports: {
  isFounded: boolean | undefined;
  room: SceneView;
  roomBusy: boolean;
  roomEnded: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomSendInFlightRef: React.RefObject<boolean>;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomGreetingError: React.Dispatch<SetStateAction<{ sessionId: string; message: string }>>;
  setRoomGreetingNotice: React.Dispatch<SetStateAction<string>>;
}) {
  const {
    isFounded,
    room,
    roomBusy,
    roomEnded,
    roomCompletionRef,
    roomSendInFlightRef,
    loadSnapshot,
    setRoom,
    setRoomBusy,
    setRoomError,
    setRoomGreetingError,
    setRoomGreetingNotice,
  } = ports;
  const submission = useRef<string | null>(null);
  const lifetime = useSceneRequestLifetime({
    sceneId: room?.id,
    isFounded,
    ended: roomEnded || room?.status === "closed",
    inFlight: roomSendInFlightRef,
    submission,
    completion: roomCompletionRef,
    setBusy: setRoomBusy,
    clearCompletionOnRetire: false,
  });
  return useCallback(
    async (sessionId: string, entry?: EntryGreeting) => {
      if (!entry && roomBusy) return;
      const claim = entry ? null : lifetime.begin(sessionId);
      if (!entry && !claim) return;
      const owns = entry?.owns ?? (() => lifetime.owns(claim!));
      if (!owns()) return;
      if (claim) claim.busy = true;
      setRoomBusy(true);
      setRoomError("");
      setRoomGreetingError(null);
      setRoomGreetingNotice("");
      try {
        const answer = await request<{ session: SceneView }>("/rooms/greet", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
        });
        if (!owns()) return;
        if (entry && !entry.handoff(answer.session)) return;
        setRoom((current) => (current?.id === sessionId ? currentRoom(answer.session) : current));
        setRoomGreetingError((current) => (current?.sessionId === sessionId ? null : current));
        void loadSnapshot();
      } catch (cause) {
        if (!owns()) return;
        const recovered = await completedGreetingAfterFailure(sessionId, owns);
        if (!owns()) return;
        if (recovered) {
          if (entry && !entry.handoff(recovered)) return;
          setRoom((current) => (current?.id === sessionId ? recovered : current));
          setRoomGreetingError((current) => (current?.sessionId === sessionId ? null : current));
        } else
          setRoomGreetingError((current) =>
            current && current.sessionId !== sessionId ? current : { sessionId, message: openingFailureMessage(cause) },
          );
      } finally {
        if (claim && lifetime.finish(claim)) setRoomBusy(false);
      }
    },
    [roomBusy, lifetime, setRoomBusy, setRoomError, setRoomGreetingError, setRoomGreetingNotice, setRoom, loadSnapshot],
  );
}

export function useRetrySavedScene(ports: {
  isFounded: boolean | undefined;
  loadSnapshot: (options?: { signal?: AbortSignal; quiet?: boolean }) => Promise<void>;
  receiveRoomRecordEvents: (events: readonly RoomRecordEvent[]) => void;
  room: SceneView;
  setLegacyRecovery: React.Dispatch<SetStateAction<LegacySceneRecovery | null>>;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomDraft: string;
  roomEnded: boolean;
  roomLeaveSubmissionIdRef: React.RefObject<string>;
  roomMoveOperationIdRef: React.RefObject<string>;
  roomSendInFlightRef: React.RefObject<boolean>;
  roomSubmissionIdRef: React.RefObject<string>;
  composerEditVersionRef?: React.RefObject<number>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomContactBoundary: React.Dispatch<SetStateAction<string>>;
  setRoomContactKind: React.Dispatch<SetStateAction<"knock" | "call">>;
  setRoomDraft: React.Dispatch<SetStateAction<string>>;
  setRoomEnded: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomGreetingError: React.Dispatch<SetStateAction<{ sessionId: string; message: string }>>;
  setRoomRuling: React.Dispatch<SetStateAction<string>>;
  setRoomMode: React.Dispatch<SetStateAction<SceneComposerMode>>;
  setRoomMoveZoneId: React.Dispatch<SetStateAction<string>>;
  setRoomTargetId: React.Dispatch<SetStateAction<string>>;
}) {
  const {
    isFounded,
    loadSnapshot,
    receiveRoomRecordEvents,
    room,
    setLegacyRecovery,
    roomBusy,
    roomCompletionRef,
    roomDraft,
    roomEnded,
    roomLeaveSubmissionIdRef,
    roomMoveOperationIdRef,
    roomSendInFlightRef,
    roomSubmissionIdRef,
    composerEditVersionRef,
    setRoom,
    setRoomBusy,
    setRoomContactBoundary,
    setRoomContactKind,
    setRoomDraft,
    setRoomEnded,
    setRoomError,
    setRoomGreetingError,
    setRoomRuling,
    setRoomMode,
    setRoomMoveZoneId,
    setRoomTargetId,
  } = ports;
  const submission = useRef<string | null>(null);
  const lifetime = useSceneRequestLifetime({
    sceneId: room?.id,
    isFounded,
    ended: roomEnded || room?.status === "closed",
    allowEnded: true,
    inFlight: roomSendInFlightRef,
    submission,
    completion: roomCompletionRef,
    setBusy: setRoomBusy,
    clearCompletionOnRetire: false,
  });
  return useCallback(
    async (expected?: LegacySceneRecovery) => {
      if (!room?.id || roomBusy) return;
      if (
        !room.operation ||
        (expected && (expected.sceneId !== room.id || !sameSavedOperation(expected.operation, room.operation, false)))
      ) {
        if (expected) setRoomError("The saved action changed. Review it before retrying.");
        return;
      }
      const claim = lifetime.begin(room.id);
      if (!claim) return;
      claim.busy = true;
      setRoomBusy(true);
      const editVersion = composerEditVersionRef?.current;
      try {
        const { operation } = await request<{ operation: RoomOperation }>(
          `/rooms/${encodeURIComponent(room.id)}/operations/${encodeURIComponent(room.operation.id)}`,
        );
        if (!lifetime.owns(claim)) return;
        if (!expected && operation?.kind === "turn" && ["contact", "fulfill"].includes(operation.input?.mode ?? ""))
          throw new Error("Review the saved action before retrying.");
        if (
          (room.operation.kind === "greet" || !!expected) &&
          (!operation ||
            operation.id !== room.operation.id ||
            operation.kind !== room.operation.kind ||
            operation.attemptId !== room.operation.attemptId ||
            operation.status !== room.operation.status ||
            !!operation.recoverable !== !!room.operation.recoverable ||
            (!!expected && !sameSavedOperation(expected.operation, operation)))
        )
          throw new Error(
            room.operation.kind === "greet"
              ? "The opening request changed. Review the current Scene before retrying."
              : "The saved request changed. Review the current Scene before retrying.",
          );
        const path =
          operation.kind === "move"
            ? "/rooms/zone"
            : operation.kind === "greet"
              ? "/rooms/greet"
              : operation.kind === "turn"
                ? operation.input?.mode === "leave"
                  ? "/rooms/leave"
                  : "/rooms/turn"
                : "/rooms/end";
        const answer = isSceneTurnOutcome(operation.turnOutcome)
          ? {
              session: (await refreshSceneAfterFailure(room.id, operation.id, () => lifetime.owns(claim))) ?? room,
              turnOutcome: operation.turnOutcome,
              recordEvents: [],
            }
          : await request<{ session: SceneView; turnOutcome?: SceneTurnOutcome; recordEvents?: RoomRecordEvent[] }>(
              path,
              {
                method: "POST",
                body: JSON.stringify({
                  ...operation.input,
                  sessionId: room.id,
                  submissionId: operation.id,
                  operationId: operation.id,
                  expectedSceneRevision: room.sceneRevision ?? 0,
                  ...(operation.kind === "greet" && operation.recoverable
                    ? { recovery: true }
                    : { retryOfAttemptId: operation.attemptId }),
                }),
              },
            );
        if (!lifetime.owns(claim)) return;
        setRoom(currentRoom(answer.session));
        setRoomEnded(answer.session.status === "closed");
        receiveRoomRecordEvents(answer.recordEvents ?? []);
        if (expected && !isSceneTurnOutcome(answer.turnOutcome)) setLegacyRecovery(null);
        if (!composerEditVersionRef || composerEditVersionRef.current === editVersion) {
          if (isSceneTurnOutcome(answer.turnOutcome)) {
            setRoomDraft((current) =>
              expected && current && current !== operation.input?.message
                ? current
                : (operation.input?.message ?? roomDraft),
            );
            setRoomRuling(sceneTurnOutcomeMessage(answer.turnOutcome));
          } else if (roomDraft.trim() === operation.input?.message) setRoomDraft("");
        }
        roomSubmissionIdRef.current = null;
        roomLeaveSubmissionIdRef.current = null;
        roomCompletionRef.current = null;
        claim.completion = null;
        setRoomError("");
        if (operation.kind === "greet")
          setRoomGreetingError((current) => (current?.sessionId === room.id ? null : current));
        if (operation.kind === "move") {
          setRoomMode("chat");
          setRoomMoveZoneId("");
          setRoomContactBoundary("");
          roomMoveOperationIdRef.current = null;
        }
        if (operation.kind === "turn" && ["contact", "fulfill"].includes(operation.input?.mode ?? "")) {
          if (!isSceneTurnOutcome(answer.turnOutcome)) setRoomMode("chat");
          setRoomTargetId("");
          setRoomContactKind("call");
        }
        void loadSnapshot();
      } catch (cause) {
        if (!lifetime.owns(claim)) return;
        const latest = await refreshSceneAfterFailure(room.id, undefined, () => lifetime.owns(claim));
        if (!lifetime.owns(claim)) return;
        if (latest) setRoom(currentRoom(latest));
        setRoomError(messageFrom(cause, "The saved request could not be recovered."));
      } finally {
        if (lifetime.finish(claim)) setRoomBusy(false);
      }
    },
    [
      lifetime,
      room,
      roomBusy,
      roomDraft,
      setLegacyRecovery,
      receiveRoomRecordEvents,
      loadSnapshot,
      roomCompletionRef,
      roomLeaveSubmissionIdRef,
      roomMoveOperationIdRef,
      roomSubmissionIdRef,
      composerEditVersionRef,
      setRoom,
      setRoomBusy,
      setRoomContactBoundary,
      setRoomContactKind,
      setRoomDraft,
      setRoomEnded,
      setRoomError,
      setRoomGreetingError,
      setRoomRuling,
      setRoomMode,
      setRoomMoveZoneId,
      setRoomTargetId,
    ],
  );
}

export function useContinueRoomWithoutGreeting(ports: {
  isFounded: boolean | undefined;
  room: SceneView;
  roomBusy: boolean;
  roomCompletionRef: React.RefObject<{ roomId: string; submissionId: string }>;
  roomEnded: boolean;
  roomSendInFlightRef: React.RefObject<boolean>;
  setRoom: React.ActionDispatch<[next: SetStateAction<SceneView>]>;
  setRoomBusy: React.Dispatch<SetStateAction<boolean>>;
  setRoomError: React.Dispatch<SetStateAction<string>>;
  setRoomGreetingNotice: React.Dispatch<SetStateAction<string>>;
}) {
  const {
    isFounded,
    room,
    roomBusy,
    roomCompletionRef,
    roomEnded,
    roomSendInFlightRef,
    setRoom,
    setRoomBusy,
    setRoomError,
    setRoomGreetingNotice,
  } = ports;
  const submission = useRef<string | null>(null);
  const lifetime = useSceneRequestLifetime({
    sceneId: room?.id,
    isFounded,
    ended: roomEnded || room?.status === "closed",
    inFlight: roomSendInFlightRef,
    submission,
    completion: roomCompletionRef,
    setBusy: setRoomBusy,
    clearCompletionOnRetire: false,
  });
  return useCallback(
    async (sessionId: string) => {
      if (roomBusy) return;
      const claim = lifetime.begin(sessionId);
      if (!claim) return;
      claim.busy = true;
      setRoomBusy(true);
      try {
        const { session } = await request<{ session: SceneView }>("/rooms/continue", {
          method: "POST",
          body: JSON.stringify({ sessionId }),
          signal: AbortSignal.timeout(10_000),
        });
        if (!lifetime.owns(claim)) return;
        setRoom(currentRoom(session));
        setRoomGreetingNotice(session.lines.length === 0 ? "The opening failed. You can continue the Scene now." : "");
        setRoomError("");
      } catch (cause) {
        if (!lifetime.owns(claim)) return;
        setRoomError(messageFrom(cause, "The Scene could not continue. Retry or leave the venue."));
      } finally {
        if (lifetime.finish(claim)) setRoomBusy(false);
      }
    },
    [roomBusy, lifetime, setRoom, setRoomBusy, setRoomError, setRoomGreetingNotice],
  );
}

export function useOpenRoom(ports: {
  greetRoom: (sessionId: string, entry?: EntryGreeting) => Promise<void>;
  isFounded: boolean | undefined;
  roomBusy: boolean;
  roomEnded: boolean;
  roomSendInFlightRef: React.RefObject<boolean>;
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
    isFounded,
    roomBusy,
    roomEnded,
    roomSendInFlightRef,
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
  const lifetime = useSceneEntryLifetime({
    room,
    isFounded,
    ended: roomEnded,
    inFlight: roomSendInFlightRef,
    completion: roomCompletionRef,
    setBusy: setRoomBusy,
  });
  return useCallback(
    async (
      place: VillageVenue,
      spaceClass?: VenueClass,
      privateOwnerId = "",
      entryArea?: "outside" | "shared" | "private" | "public",
      zoneId?: string,
    ) => {
      if (roomBusy) return;
      const zoneOnly = !!(room?.id && room.status === "active" && room.placeId === place.id && zoneId);
      if (room?.id && room.status !== "closed" && !zoneOnly) {
        setScreen("room");
        return;
      }
      const claim = lifetime.begin(zoneOnly);
      if (!claim) return;
      const owns = () => lifetime.owns(claim);
      claim.busy = true;
      if (zoneOnly) {
        setRoomBusy(true);
        setRoomError("");
        try {
          const { session } = await request<{ session: SceneView }>("/rooms/zone", {
            method: "POST",
            body: JSON.stringify({ sessionId: room.id, zoneId, expectedSceneRevision: room.sceneRevision ?? 0 }),
          });
          if (!owns()) return;
          setRoom(currentRoom(session));
          setRoomTargetId("");
          setScreen("room");
          setRoomOpen(true);
          void loadSnapshot();
        } catch (cause) {
          if (!owns()) return;
          setRoomError(messageFrom(cause, "That zone could not be entered."));
        } finally {
          if (lifetime.finish(claim)) setRoomBusy(false);
        }
        return;
      }
      leavingRoomPendingRef.current = false;
      roomCompletionRef.current = null;
      claim.completion = null;
      setOpenPlaceId(null);
      setPlaceProblem(null);
      setRoomDraft("");
      lifetime.handoff(claim, room, false);
      setRoomEnded(false);
      setRoomError("");
      setRoomGreetingNotice("");
      setRoomNotices([]);
      seenRoomEventIdsRef.current.clear();
      setRoomBusy(true);
      const placeholder: SceneView = {
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
      };
      lifetime.handoff(claim, placeholder, false);
      setRoom(placeholder);
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
        if (!owns()) return;
        lifetime.handoff(claim, currentRoom(session), false);
        setRoom(currentRoom(session));
        setRoomMode("chat");
        setRoomTargetId("");
        setRoomRuling("");
        setLastSceneEnding("");
        setRoomOpen(true);
        void loadSnapshot();
        if (session.status === "opening")
          await greetRoom(session.id, {
            owns,
            handoff: (next) => lifetime.handoff(claim, next, false),
          });
      } catch (cause) {
        if (!owns()) return;
        setRoomError(messageFrom(cause, "That Zone could not be opened. Retry or leave the venue."));
      } finally {
        if (lifetime.finish(claim)) setRoomBusy(false);
      }
    },
    [
      roomBusy,
      room,
      lifetime,
      leavingRoomPendingRef,
      roomCompletionRef,
      setOpenPlaceId,
      setPlaceProblem,
      setRoomDraft,
      setRoomEnded,
      setRoomError,
      setRoomGreetingNotice,
      setRoomNotices,
      seenRoomEventIdsRef,
      setRoomBusy,
      setRoom,
      setRoomOpen,
      setScreen,
      setRoomTargetId,
      loadSnapshot,
      setRoomMode,
      setRoomRuling,
      setLastSceneEnding,
      greetRoom,
    ],
  );
}
