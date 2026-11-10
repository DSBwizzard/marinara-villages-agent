import { useRef, useState } from "react";
import type { RoomOperation, RoomRecordEvent, SceneChangeIssue } from "../../../shared/contracts/village.js";
import { useSceneReadingSession } from "./reading-session.js";

export type ContactRecovery = { sceneId: string; operation: RoomOperation };

/** Always mounted by the application controller so navigation retains this feature state. */
export function useScenesState(isFounded?: boolean) {
  const sceneReading = useSceneReadingSession(isFounded);

  const [mailboxOpen, setMailboxOpen] = useState(false);

  const [roomOpen, setRoomOpen] = useState(false);

  /** What has been typed into the room's box and not yet said. */
  const [roomDraft, setRoomDraft] = useState("");

  const [contactRecovery, setContactRecovery] = useState<ContactRecovery | null>(null);

  const [roomContactBoundary, setRoomContactBoundary] = useState("");

  const [roomContactKind, setRoomContactKind] = useState<"knock" | "call">("call");

  const [roomTargetId, setRoomTargetId] = useState("");

  const [roomMoveZoneId, setRoomMoveZoneId] = useState("");

  const roomMoveOperationIdRef = useRef<string | null>(null);

  const [roomNotices, setRoomNotices] = useState<RoomRecordEvent[]>([]);

  const seenRoomEventIdsRef = useRef(new Set<string>());

  const dismissedRoomEventIdsRef = useRef(new Set<string>());

  const [roomChangeStatus, setRoomChangeStatus] = useState({ pending: 0, failed: 0, rejected: 0 });

  const [roomUnresolvedChanges, setRoomUnresolvedChanges] = useState<SceneChangeIssue[]>([]);

  const [debugDiscardEnabled, setDebugDiscardEnabled] = useState(false);

  const observedRoomIdRef = useRef("");

  const [lastSceneEnding, setLastSceneEnding] = useState("");

  // A pending Scene response leaves settings and exploration usable.
  const [roomBusy, setRoomBusy] = useState(false);

  const leavingRoomPendingRef = useRef(false);

  const roomSubmissionIdRef = useRef<string | null>(null);

  const roomLeaveSubmissionIdRef = useRef<string | null>(null);

  const roomCompletionRef = useRef<{ roomId: string; submissionId: string } | null>(null);

  const roomSendInFlightRef = useRef(false);

  const composerEditVersionRef = useRef(0);

  const restoredSceneDraftRef = useRef("");

  /** What the room's last attempt had to say, and empty when it has nothing to. */
  const [roomError, setRoomError] = useState("");

  const [roomGreetingError, setRoomGreetingError] = useState<{ sessionId: string; message: string } | null>(null);

  const [roomGreetingNotice, setRoomGreetingNotice] = useState("");

  /**
   * Whether the room has been ended, which is a fact about the CONVERSATION rather
   * than about the copy of it on screen: the reading stays where it was so the
   * player can finish it, and what changes is that nothing more can be said into
   * it — see `endRoom`.
   */
  const [roomEnded, setRoomEnded] = useState(false);

  /**
   * What the debug menu's "write it up now" has to say for itself, if anything.
   *
   * Its own line rather than one of the error fields beside it, because the
   * ordinary answer here is not a failure: a forced creative pass can genuinely
   * have nothing to add, and that reads as a mistake if it is shown in red.
   */
  return {
    sceneReading,
    mailboxOpen,
    setMailboxOpen,
    roomOpen,
    setRoomOpen,
    roomDraft,
    setRoomDraft,
    contactRecovery,
    setContactRecovery,
    roomContactBoundary,
    setRoomContactBoundary,
    roomContactKind,
    setRoomContactKind,
    roomTargetId,
    setRoomTargetId,
    roomMoveZoneId,
    setRoomMoveZoneId,
    roomMoveOperationIdRef,
    roomNotices,
    setRoomNotices,
    seenRoomEventIdsRef,
    dismissedRoomEventIdsRef,
    roomChangeStatus,
    setRoomChangeStatus,
    roomUnresolvedChanges,
    setRoomUnresolvedChanges,
    debugDiscardEnabled,
    setDebugDiscardEnabled,
    observedRoomIdRef,
    lastSceneEnding,
    setLastSceneEnding,
    roomBusy,
    setRoomBusy,
    leavingRoomPendingRef,
    roomSubmissionIdRef,
    roomLeaveSubmissionIdRef,
    roomCompletionRef,
    roomSendInFlightRef,
    composerEditVersionRef,
    restoredSceneDraftRef,
    roomError,
    setRoomError,
    roomGreetingError,
    setRoomGreetingError,
    roomGreetingNotice,
    setRoomGreetingNotice,
    roomEnded,
    setRoomEnded,
  };
}

export type ScenesState = ReturnType<typeof useScenesState>;
