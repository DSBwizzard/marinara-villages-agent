import type { ArchiveVisitSummary, RoomRecordEvent, SceneView } from "../../../shared/contracts/village.js";
import type { SceneComposerMode } from "../../shared/types.js";
import { useRef, useState } from "react";

/** Always mounted by the application controller so navigation retains this feature state. */
export function useScenesState() {
  const [venueVisits, setVenueVisits] = useState<ArchiveVisitSummary[] | null>(null);

  const [archiveTotal, setArchiveTotal] = useState(0);

  const [archiveOffset, setArchiveOffset] = useState(0);

  const [archiveVersion, setArchiveVersion] = useState(0);

  const [openArchivedVisit, setOpenArchivedVisit] = useState<SceneView | null>(null);

  const [_endFailed, setEndFailed] = useState(false);

  const [archiveVenueId, setArchiveVenueId] = useState("");

  const [archiveVillagerId, setArchiveVillagerId] = useState("");

  const [archiveError, setArchiveError] = useState("");

  const [mailboxOpen, setMailboxOpen] = useState(false);

  const [roomOpen, setRoomOpen] = useState(false);

  /** What has been typed into the room's box and not yet said. */
  const [roomDraft, setRoomDraft] = useState("");

  const [roomMode, setRoomMode] = useState<SceneComposerMode>("chat");

  const [roomContactBoundary, setRoomContactBoundary] = useState("");

  const [roomContactKind, setRoomContactKind] = useState<"knock" | "call">("call");

  const [roomTargetId, setRoomTargetId] = useState("");

  const [roomMoveZoneId, setRoomMoveZoneId] = useState("");

  const roomMoveOperationIdRef = useRef<string | null>(null);

  const [roomRuling, setRoomRuling] = useState("");

  const [roomNotices, setRoomNotices] = useState<RoomRecordEvent[]>([]);

  const seenRoomEventIdsRef = useRef(new Set<string>());

  const dismissedRoomEventIdsRef = useRef(new Set<string>());

  const [roomChangeStatus, setRoomChangeStatus] = useState({ pending: 0, failed: 0, rejected: 0 });

  const [roomUnresolvedChanges, setRoomUnresolvedChanges] = useState<
    { submissionId: string; domain: string; reason?: string }[]
  >([]);

  const [debugDiscardEnabled, setDebugDiscardEnabled] = useState(false);

  const lastRoomActivitySentRef = useRef(0);

  const lastRoomDeliberateAtRef = useRef(0);

  const observedRoomIdRef = useRef("");

  const [lastSceneEnding, setLastSceneEnding] = useState("");

  /**
   * The room's own busy flag, and not the tab's.
   *
   * For the reason `placeBusyId` and `spinOffBusyId` have their own: a turn in a
   * room can be four model calls long, and the tab's shared `busy` greys out the
   * settings panel, the map and every button in it while it is up. What has to be
   * shut is the box the answer is coming to, and that is all that is shut.
   */
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
  const [writeUpNote, setWriteUpNote] = useState("");
  return {
    venueVisits,
    setVenueVisits,
    archiveTotal,
    setArchiveTotal,
    archiveOffset,
    setArchiveOffset,
    archiveVersion,
    setArchiveVersion,
    openArchivedVisit,
    setOpenArchivedVisit,
    _endFailed,
    setEndFailed,
    archiveVenueId,
    setArchiveVenueId,
    archiveVillagerId,
    setArchiveVillagerId,
    archiveError,
    setArchiveError,
    mailboxOpen,
    setMailboxOpen,
    roomOpen,
    setRoomOpen,
    roomDraft,
    setRoomDraft,
    roomMode,
    setRoomMode,
    roomContactBoundary,
    setRoomContactBoundary,
    roomContactKind,
    setRoomContactKind,
    roomTargetId,
    setRoomTargetId,
    roomMoveZoneId,
    setRoomMoveZoneId,
    roomMoveOperationIdRef,
    roomRuling,
    setRoomRuling,
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
    lastRoomActivitySentRef,
    lastRoomDeliberateAtRef,
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
    writeUpNote,
    setWriteUpNote,
  };
}
