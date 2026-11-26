import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type {
  ResidentSprite,
  RoomRecordEvent,
  SceneChangeIssue,
  SceneView,
} from "../../../shared/contracts/village.js";
import {
  advanceStaging,
  createStagingCursor,
  lineStagingCues,
  stagingPresentation,
} from "../../../shared/helpers/scene-staging.js";
import { messageFrom, request } from "../../shared/api.js";
import { ArtworkImage } from "../../shared/ArtworkImage.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { drawVillagesNodes, renderVillagesMarkdown, villagesSpeechPaintStyle } from "../../shared/presentation.js";
import type { Portrait, PortraitMap } from "../../shared/types.js";
import { AvatarFace } from "../residents/ResidentPanels.js";
import { NpcSprite, SceneFace } from "./SceneFace.js";
import type { SceneReadingSession } from "./reading-session.js";
import { SceneErrorChip, type SceneErrorItem } from "./scene-errors.js";
import { isSceneConnectionError } from "./scene-error-message.js";
import type { SceneFailure } from "./scene-error-report.js";
import { CardFlipSprite } from "../../shared/CardFlipSprite.js";
import { useReadingPages } from "../../shared/useReadingPages.js";
import { DialogueReader } from "../../shared/DialogueReader.js";
import { SceneHistory } from "./SceneHistory.js";
import { splitVillagesParagraphs, classifyVillagesParagraph } from "../../../shared/helpers/scene-paragraphs.js";
import { groupSceneMoments, speechDelivery } from "../../../shared/helpers/scene-speech.js";
import { SceneAsides } from "./villages-scene-asides.js";
import { selectSpriteImage } from "./villages-sprite-stage";
import { shouldSubmitVenueKey } from "./villages-venue-send";
import { SceneActionIcon } from "./SceneActionIcon.js";
import { LoreActivitySlot } from "../../shared/LoreActivity.js";
import { SceneMoveDialog, type SceneMoveZone } from "./SceneMoveDialog.js";
import type { ZoneLayout } from "../../../shared/helpers/zone-layout.js";

const emptyLore: NonNullable<SceneView["lore"]> = [];

export function sceneZoneLabel(zone?: { name: string }): string {
  return zone?.name || "Zone";
}

function roomNoticeLabel(kind: RoomRecordEvent["kind"]): string {
  return {
    memory: "memory",
    wish: "Wish update",
    venue: "Venue change",
    request: "request",
    project: "Project update",
    "relationship-up": "relationship change",
    "relationship-down": "relationship change",
  }[kind];
}

function roomNoticeIcon(notice: RoomRecordEvent): ReactNode {
  // Pictogrammers exit-run (Apache-2.0); see icon-licenses.txt.
  if (notice.id.startsWith("presence:"))
    return (
      <svg
        className="mari-rgb-static-icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="currentColor"
        aria-hidden="true"
        data-icon="presence"
        style={{ display: "inline-block", verticalAlign: "middle", stroke: "none" }}
      >
        <path d="M13.34,8.17C12.41,8.17 11.65,7.4 11.65,6.47A1.69,1.69 0 0,1 13.34,4.78C14.28,4.78 15.04,5.54 15.04,6.47C15.04,7.4 14.28,8.17 13.34,8.17M10.3,19.93L4.37,18.75L4.71,17.05L8.86,17.9L10.21,11.04L8.69,11.64V14.5H7V10.54L11.4,8.67L12.07,8.59C12.67,8.59 13.17,8.93 13.5,9.44L14.36,10.79C15.04,12 16.39,12.82 18,12.82V14.5C16.14,14.5 14.44,13.67 13.34,12.4L12.84,14.94L14.61,16.63V23H12.92V17.9L11.14,16.21L10.3,19.93M21,23H19V3H6V16.11L4,15.69V1H21V23M6,23H4V19.78L6,20.2V23Z" />
      </svg>
    );
  return notice.kind === "relationship-up" ? "♥" : notice.kind === "relationship-down" ? "♡" : "★";
}

export function currentRoom(session: SceneView): SceneView {
  return session;
}

export function staleVenueReason(cause: unknown): "inactivity" | "elsewhere" | null {
  const message = messageFrom(cause, "");
  if (message.includes("Interrupted: Inactivity")) return "inactivity";
  if (/no longer available|not active|already ended/iu.test(message)) return "elsewhere";
  return null;
}

export async function completedGreetingAfterFailure(sessionId: string, owns = () => true): Promise<SceneView | null> {
  try {
    if (!owns()) return null;
    const { session } = await request<{ session: SceneView | null }>("/rooms/active", {
      signal: AbortSignal.timeout(5_000),
    });
    if (!owns()) return null;
    return session?.id === sessionId && session.status !== "opening" ? currentRoom(session) : null;
  } catch {
    return null;
  }
}

export async function refreshSceneAfterFailure(
  sessionId: string,
  _submissionId?: string,
  owns = () => true,
): Promise<SceneView | null> {
  try {
    if (!owns()) return null;
    const { session } = await request<{ session: SceneView | null }>("/rooms/active", {
      signal: AbortSignal.timeout(5_000),
    });
    if (!owns()) return null;
    if (session?.id === sessionId) return session;
    const { visit } = await request<{ visit: SceneView }>(`/rooms/${encodeURIComponent(sessionId)}/recovery`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (!owns()) return null;
    return visit;
  } catch {
    return null;
  }
}

export function openingFailureMessage(cause: unknown): string {
  const message = messageFrom(cause, "The scene opening could not be prepared.");
  return /timeout|timed out|exceeded 28 seconds/iu.test(message) ? "The scene opening took too long." : message;
}

/** Same Send geometry and stroke as Engine's lucide-react composer icon (ISC). */
function SceneControlIcon({ name }: { name: "send" | "sending" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={name === "sending" ? ELEMENT_TAG + "-spin mari-rgb-static-icon" : "mari-rgb-static-icon"}
    >
      {name === "send" ? (
        <>
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
          <path d="m21.854 2.147-10.94 10.939" />
        </>
      ) : (
        <path d="M12 3a9 9 0 1 1-9 9" />
      )}
    </svg>
  );
}

/** The single Visit surface for an empty, solo, or group cast. */
export function RoomPanel({
  room,
  worldScope,
  sceneReading,
  mobile,
  nameColors,
  speechColors,
  picture,
  draft,
  recoveryDestination,
  contactRecovery,
  onRetryContact,
  onReplaceContact,
  onReviewContact,
  busy,
  error,
  greetingNotice,
  turnRecovery,
  sceneErrors = [],
  open,
  ended,
  playerName,
  playerPortrait,
  portraits,
  sprites,
  onDraft,
  onSend,
  onRetryReply,
  retryPending,
  sendOnEnter,
  spriteCardFlipEnabled,
  onViewVenue,
  onEnd,
  onRetryGreeting,
  onContinueWithoutGreeting,
  onConnections,
  notices,
  onDismissNotice,
  onOpenWish,
  unresolvedChanges,
  onUseMailbox,
  onMap,
  onProjects,
  onProposals,
  onSettings,
  movementZones,
  movementPositions,
  movementLighting = "day",
  onMovementTarget,
  onTravel,
  currentZoneLabel,
}: {
  room: SceneView;
  worldScope: string;
  sceneReading: SceneReadingSession;
  mobile: boolean;
  nameColors: Record<string, string>;
  speechColors: Record<string, string>;
  /** The picture of the place, or `""` for one that has never been drawn. */
  picture: string;
  draft: string;
  recoveryDestination: string;
  contactRecovery: import("./useScenesState.js").ContactRecovery | null;
  onRetryContact: () => void;
  onReplaceContact: () => void;
  onReviewContact: () => void;
  busy: boolean;
  error: string;
  greetingNotice: string;
  turnRecovery?: string | SceneFailure;
  sceneErrors?: SceneErrorItem[];
  open: boolean;
  ended: boolean;
  playerName: string;
  playerPortrait: Portrait | undefined;
  portraits: PortraitMap;
  sprites: Record<string, ResidentSprite | null>;
  onDraft: (value: string) => void;
  onSend: () => void;
  onRetryReply?: () => void;
  retryPending?: boolean;
  sendOnEnter: boolean;
  spriteCardFlipEnabled: boolean;
  onViewVenue: () => void;
  onEnd: () => void;
  onRetryGreeting: () => void;
  onContinueWithoutGreeting: () => void;
  onConnections: () => void;
  notices: RoomRecordEvent[];
  onDismissNotice: (id: string) => void;
  onOpenWish?: (actorId: string, wishId: string) => void;
  unresolvedChanges?: SceneChangeIssue[];
  onUseMailbox?: () => void;
  onMap?: () => void;
  onProjects?: () => void;
  onProposals?: () => void;
  onSettings: () => void;
  movementZones: SceneMoveZone[];
  movementPositions?: ZoneLayout;
  movementLighting?: "day" | "night";
  onMovementTarget: (id: string, trespass?: boolean, companions?: string[]) => void;
  onTravel?: () => void;
  currentZoneLabel: string;
}) {
  const retrying = !!retryPending || (room.operation?.kind === "retry" && room.operation.status === "running");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [actionsView, setActionsView] = useState<"menu" | "move" | null>(null);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [dismissedTravelId, setDismissedTravelId] = useState<string>();
  const [errorsOpen, setErrorsOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const permissionId = useId();
  const permissionRef = useRef<HTMLDivElement>(null);
  const permissionTriggerRef = useRef<HTMLButtonElement>(null);
  const [openMemory, setOpenMemory] = useState<RoomRecordEvent | null>(null);
  const memoryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const memoryCloseRef = useRef<HTMLButtonElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const actionsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const transcriptTriggerRef = useRef<HTMLButtonElement | null>(null);
  const moveTriggerRef = useRef<HTMLButtonElement | null>(null);
  const readingRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLSpanElement | null>(null);
  const [failedSpriteUrls, setFailedSpriteUrls] = useState<ReadonlySet<string>>(() => new Set());
  const previousNoticeIds = useRef(new Set<string>());
  const presenceNotice = notices.find((notice) => notice.id.startsWith("presence:"));
  const previousLocation = useRef({ scope: worldScope, sceneId: room.id, zoneId: room.zoneId });

  useEffect(() => {
    setNoticesOpen(false);
    setErrorsOpen(false);
    previousNoticeIds.current.clear();
  }, [room.id]);

  useEffect(() => {
    setPermissionOpen(false);
  }, [room.id, room.zoneId, room.trespassing]);

  useEffect(() => {
    if (!permissionOpen) return;
    const outside = (event: PointerEvent) => {
      if (!permissionRef.current?.contains(event.target as Node)) setPermissionOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setPermissionOpen(false);
      permissionTriggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [permissionOpen]);

  useEffect(() => {
    const fresh = notices.some((notice) => !previousNoticeIds.current.has(notice.id));
    previousNoticeIds.current = new Set(notices.map((notice) => notice.id));
    if (fresh && !errorsOpen && !permissionOpen) setNoticesOpen(true);
    else if (notices.length === 0) setNoticesOpen(false);
  }, [notices, room.id, errorsOpen, permissionOpen]);

  useEffect(() => {
    if (!historyOpen) return;
    window.requestAnimationFrame(() =>
      historyRef.current
        ?.querySelector<HTMLElement>('[aria-label="Transcript messages"]')
        ?.focus({ preventScroll: true }),
    );
  }, [historyOpen]);

  const closeTranscript = () => {
    setHistoryOpen(false);
    window.requestAnimationFrame(() => transcriptTriggerRef.current?.focus({ preventScroll: true }));
  };

  useEffect(() => {
    if (actionsView !== "menu") return;
    actionsRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')
      ?.focus({ preventScroll: true });
    const closeOnOutside = (event: Event) => {
      if (!actionsRef.current?.contains(event.target as Node)) setActionsView(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActionsView(null);
        actionsRef.current?.querySelector("button")?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("focusin", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("focusin", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [actionsView]);

  useEffect(() => {
    setActionsView(null);
  }, [room.id, room.zoneId]);

  const closeMemory = useCallback(() => {
    setOpenMemory(null);
    window.requestAnimationFrame(() => memoryTriggerRef.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    if (!openMemory) return;
    window.requestAnimationFrame(() => memoryCloseRef.current?.focus({ preventScroll: true }));
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        memoryCloseRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMemory();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMemory, openMemory]);

  const connectionFailure = [error, ...sceneErrors.map((item) => item.message)].some(isSceneConnectionError);
  const openingActions =
    !ended &&
    room.status === "opening" &&
    (error || sceneErrors.some((item) => ["room", "greeting", "operation"].includes(item.id))) ? (
      <>
        <button
          type="button"
          className={`${ELEMENT_TAG}-button`}
          onClick={room.visitorIntroduction ? onMap : onEnd}
          disabled={busy}
        >
          Back to map
        </button>
        <button type="button" className={`${ELEMENT_TAG}-button`} onClick={onRetryGreeting} disabled={busy}>
          {room.operation?.recoverable ? "Recover saved opening" : "Retry opening"}
        </button>
        {room.id && !connectionFailure ? (
          <button type="button" className={`${ELEMENT_TAG}-button`} onClick={onContinueWithoutGreeting} disabled={busy}>
            Continue without opening
          </button>
        ) : null}
      </>
    ) : undefined;
  const errorItems: SceneErrorItem[] = sceneErrors.map((item) => ({
    ...item,
    operation: item.id === "operation" || item.message === room.operation?.error ? room.operation : undefined,
    onClick: isSceneConnectionError(item.message) ? onConnections : undefined,
    actions: room.status === "opening" && isSceneConnectionError(item.message) ? undefined : item.actions,
  }));
  if (error && !sceneErrors.length)
    errorItems.push({
      id: "request",
      title: room.status === "opening" ? "Scene opening failed" : "Scene request failed",
      message: error,
      onClick: isSceneConnectionError(error) ? onConnections : undefined,
    });
  const recoveryTrace = typeof turnRecovery === "string" ? undefined : turnRecovery?.trace;
  const heldRecoveryId = unresolvedChanges?.find(
    (change) => change.status === "held" && change.submissionId === recoveryTrace?.submissionId,
  )?.submissionId;
  if (turnRecovery && !heldRecoveryId)
    errorItems.push({
      id: "reply-recovery",
      title: "Reply connection interrupted",
      message: typeof turnRecovery === "string" ? turnRecovery : turnRecovery.message,
      trace: recoveryTrace,
    });
  if (greetingNotice)
    errorItems.push({
      id: "opening-notice",
      title: "Scene opening notice",
      message: greetingNotice,
    });
  for (const change of unresolvedChanges ?? []) {
    if (change.status === "pending") continue;
    const trace = change.submissionId === heldRecoveryId ? recoveryTrace : undefined;
    const operation = change.submissionId === room.operation?.id && errorItems.find((item) => item.id === "operation");
    if (operation) {
      operation.held = true;
      operation.diagnostic = change.diagnostic;
      operation.trace ??= trace;
      continue;
    }
    errorItems.push({
      id: "narration:" + change.submissionId,
      title: "Saved reply needs review",
      message: change.reason ?? "The saved reply could not be applied.",
      held: true,
      diagnostic: change.diagnostic,
      trace,
    });
  }

  const fallbackLine = room.lines.findLast((line) => line.role === "assistant" && !line.presenceChange);
  const replyId = room.liveReplyId ?? fallbackLine?.id ?? "";
  const replyLines = useMemo(
    () =>
      room.liveReplyId !== undefined
        ? room.lines.filter((line) => line.role === "assistant" && !line.presenceChange)
        : fallbackLine
          ? [fallbackLine]
          : [],
    [room.liveReplyId, room.lines, fallbackLine],
  );
  const replyKey = JSON.stringify([worldScope, room.id, room.zoneArrivalId, replyId]);
  const steps = useMemo(
    () =>
      groupSceneMoments(replyLines).flatMap(({ line, asides }) => {
        const paragraphs = splitVillagesParagraphs(line.content);
        return paragraphs.map((text, paragraph) => ({
          ...line,
          text,
          paragraph,
          key: JSON.stringify([replyKey, line.id, paragraph]),
          asides: paragraph === paragraphs.length - 1 ? asides : [],
        }));
      }),
    [replyLines, replyKey],
  );
  const { checkpoint } = sceneReading;
  const ownsBookmark = useCallback(
    (bookmark: typeof checkpoint.current.bookmark) =>
      bookmark?.scope === worldScope &&
      bookmark.sceneId === room.id &&
      bookmark.zoneArrivalId === room.zoneArrivalId &&
      bookmark.replyId === replyId,
    [worldScope, room.id, room.zoneArrivalId, replyId, checkpoint],
  );
  const [selection, setSelection] = useState(() => ({
    key: replyKey,
    index: ownsBookmark(checkpoint.current.bookmark)
      ? Math.max(
          0,
          steps.findIndex(
            (step) =>
              step.id === checkpoint.current.bookmark?.lineId &&
              step.paragraph === checkpoint.current.bookmark?.paragraph,
          ),
        )
      : 0,
  }));
  const at = selection.key === replyKey ? Math.min(selection.index, Math.max(0, steps.length - 1)) : 0;
  const step = steps[at];
  useLayoutEffect(() => {
    if (!ownsBookmark(checkpoint.current.bookmark)) {
      sceneReading.anchor.current = { key: "", offset: 0 };
      sceneReading.enterAtEnd.current = false;
    }
  }, [replyKey, checkpoint, ownsBookmark, sceneReading.anchor, sceneReading.enterAtEnd]);
  const reveal = at === 0 && ownsBookmark(checkpoint.current.bookmark) && !!checkpoint.current.bookmark?.reveal;
  const readingPages = useReadingPages(step?.text ?? "", step?.key ?? replyKey, readingRef, sceneReading, reveal);
  const canReadNext = readingPages.revealing || at < steps.length - 1 || readingPages.index < readingPages.count - 1;
  const introductionActive = !!room.visitorIntroduction && !ended && room.status === "active" && steps.length > 0;
  useLayoutEffect(() => {
    if (!step) return;
    checkpoint.current.bookmark = {
      scope: worldScope,
      sceneId: room.id,
      zoneArrivalId: room.zoneArrivalId,
      replyId: replyId,
      lineId: step.id ?? "",
      paragraph: step.paragraph,
      momentIndex: at,
      atEnd: !canReadNext,
      ...(reveal && readingPages.revealing ? { reveal: true } : {}),
    };
  }, [
    checkpoint,
    worldScope,
    room.id,
    room.zoneArrivalId,
    replyId,
    step,
    at,
    canReadNext,
    reveal,
    readingPages.revealing,
  ]);
  const register =
    step?.kind === "narration" || !step || step.speakerId === "__venue_scene__"
      ? "narration"
      : step.kind || classifyVillagesParagraph(step.text) === "speech"
        ? "speech"
        : "narration";
  const speakerPortrait = step ? portraits[step.speakerId] : playerPortrait;
  const stageRoomId = JSON.stringify([worldScope, room.id]);
  const liveFrame = useMemo(
    () => stagingPresentation(createStagingCursor(room.activeIds, room.activeIds)),
    [room.activeIds],
  );
  const tailFrame = room.playback.moments.at(-1)?.end;
  const introductionFrames = useMemo(() => {
    if (!room.visitorIntroduction) return undefined;
    const cursor = createStagingCursor(room.activeIds, room.activeIds);
    return new Map(
      replyLines.map((line) => {
        advanceStaging(cursor, { cues: lineStagingCues(line) });
        return [line.id, stagingPresentation(cursor)];
      }),
    );
  }, [room.visitorIntroduction, room.activeIds, replyLines]);
  const stagingFrame =
    introductionFrames?.get(step?.id ?? "") ??
    (tailFrame &&
    tailFrame.activeIds.length === room.activeIds.length &&
    room.activeIds.every((id) => tailFrame.activeIds.includes(id))
      ? tailFrame
      : liveFrame);
  const stagingState = stagingFrame.state;
  const previousReply = useRef({ sceneId: room.id, id: replyId });
  const animateStaging = useMemo(
    () => previousReply.current.sceneId === room.id && previousReply.current.id !== replyId,
    [room.id, replyId],
  );
  useLayoutEffect(() => {
    previousReply.current = { sceneId: room.id, id: replyId };
  }, [room.id, replyId]);
  useLayoutEffect(() => {
    const previous = previousLocation.current;
    previousLocation.current = { scope: worldScope, sceneId: room.id, zoneId: room.zoneId };
    if (previous.scope !== worldScope || previous.sceneId !== room.id || previous.zoneId !== room.zoneId)
      setHistoryOpen(false);
  }, [worldScope, room.id, room.zoneId]);
  const canDraft = !ended && room.status === "active" && !room.visitorIntroduction;
  const canCompose = canDraft && !historyOpen && (!canReadNext || busy || !!error || !!turnRecovery);
  const canRetryReply = canCompose && !canReadNext && !historyOpen && !busy && !!room.retryReply && !!onRetryReply;
  const canSend = canCompose && !historyOpen && !busy && !contactRecovery;
  const sendLabel = busy ? "Sending" : "Send";
  const travel = room.travel;
  const resizeComposer = useCallback(() => {
    const field = composerRef.current;
    if (!field) return;
    const style = window.getComputedStyle(field);
    const lineHeight = Number.parseFloat(style.lineHeight);
    const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    const oneLine = Math.ceil(lineHeight + padding);
    const twoLines = Math.ceil(lineHeight * 2 + padding);
    field.style.height = "auto";
    field.style.height = `${Math.min(Math.max(field.scrollHeight, oneLine), twoLines)}px`;
    field.style.overflowY = field.scrollHeight > twoLines + 1 ? "auto" : "hidden";
  }, []);

  useLayoutEffect(() => {
    resizeComposer();
  }, [canCompose, draft, resizeComposer]);

  useEffect(() => {
    const frame = composerRef.current?.parentElement;
    if (!frame) return;
    let width = frame.clientWidth;
    const observer = new ResizeObserver(() => {
      if (frame.clientWidth === width) return;
      width = frame.clientWidth;
      resizeComposer();
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [canCompose, resizeComposer]);

  const submitComposer = () => {
    if (!canSend || !draft.trim()) return;
    setActionsView(null);
    onSend();
  };

  useLayoutEffect(() => {
    if (readingRef.current) readingRef.current.scrollTop = 0;
  }, [room.id, room.zoneArrivalId, replyId, at, readingPages.index]);

  const activeParticipants = room.participants.filter((person) => room.activeIds.includes(person.characterId));
  const cast = activeParticipants;
  const speaker = cast.find((person) => person.characterId === step?.speakerId);
  const speechStyle = (speakerId: string) => villagesSpeechPaintStyle(speechColors[speakerId]);
  const nameStyle = (speakerId: string) => villagesSpeechPaintStyle(nameColors[speakerId]);
  const displayed = cast.slice(0, 4);
  const rest = cast.filter((person) => !displayed.some((shown) => shown.characterId === person.characterId));
  const mobileLayout = stagingFrame.mobile;
  const stageLayout = stagingFrame.desktop;

  const waiting = (
    <p className={`${ELEMENT_TAG}-chat-pending`} role="status">
      <span className={`${ELEMENT_TAG}-chat-spinner ${ELEMENT_TAG}-spin`} aria-hidden="true" />
      <span className={`${ELEMENT_TAG}-chat-pending-label`}>
        {retrying
          ? "Retrying reply…"
          : room.status === "opening"
            ? "Opening the Scene…"
            : room.status === "closing"
              ? "Saving this Scene…"
              : room.operation?.kind === "move"
                ? "Moving…"
                : "This Scene is responding. Your draft stays here."}
      </span>
    </p>
  );

  return (
    <aside
      className={`${ELEMENT_TAG}-chat`}
      data-open={open ? "true" : "false"}
      data-ended={ended ? "true" : "false"}
      data-opening-error={room.status === "opening" && !!error ? "true" : "false"}
      aria-label={`${room.area === "outside" ? "Outside" : "Inside"} ${room.placeName}`}
    >
      {/*
        Who is here, said once in words.

        The cast on the floor is a row of the Engine's avatar frames and those
        frames are `aria-hidden` — the private drawer can afford that, because the
        one face it draws is named again on the card a line later. A room's four
        faces are not: the card names whoever is talking and nobody else, so
        without this a screen reader would hear a conversation between people
        whose names appear only at the moment they speak, and never one who has
        not spoken yet. One sentence, outside every live region in the drawer, so
        it is announced when the room is walked into and not on every paragraph
        after that.
      */}
      <p className={`${ELEMENT_TAG}-visually-hidden`}>
        {`Here now: ${activeParticipants.length ? activeParticipants.map((villager) => `${villager.name}${villager.doing ? ` is ${villager.doing}` : ""}`).join("; ") : "nobody"}.`}
      </p>

      <div className={`${ELEMENT_TAG}-chat-scene`} aria-hidden="true">
        {picture ? (
          <>
            <ArtworkImage className={`${ELEMENT_TAG}-chat-scene-backdrop`} src={picture} alt="" />
            <span className={`${ELEMENT_TAG}-chat-scrim`} />
            <span className={`${ELEMENT_TAG}-chat-vignette`} />
          </>
        ) : (
          <span className={`${ELEMENT_TAG}-chat-scene-placeholder`}>
            {room.area === "outside" ? "Exterior not drawn yet" : "Interior / space not drawn yet"}
          </span>
        )}
      </div>

      <div className={`${ELEMENT_TAG}-chat-head`}>
        <span className={`${ELEMENT_TAG}-room-place`}>
          {room.placeName}
          <span className={`${ELEMENT_TAG}-room-zone`}>{currentZoneLabel}</span>
          {room.currentTime ? <time className={`${ELEMENT_TAG}-room-time`}>{room.currentTime}</time> : null}
        </span>
        <div className={`${ELEMENT_TAG}-scene-notice-chips`}>
          {room.trespassing ? (
            <div ref={permissionRef}>
              <button
                ref={permissionTriggerRef}
                type="button"
                className={`${ELEMENT_TAG}-scene-error-trigger ${ELEMENT_TAG}-scene-permission-trigger`}
                aria-label="Without permission"
                aria-expanded={permissionOpen}
                aria-controls={permissionId}
                onClick={() => {
                  setPermissionOpen((value) => !value);
                  setErrorsOpen(false);
                  setNoticesOpen(false);
                  setActionsView(null);
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="12.5" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
                  <path d="m8 12 3-3 2 3 2 1m-4-4-1 6-3 3m3-3 3 2 1 2M5.6 18.4 18.4 5.6" />
                </svg>
              </button>
              {permissionOpen ? (
                <section
                  id={permissionId}
                  className={`${ELEMENT_TAG}-scene-error-panel`}
                  aria-label="Without permission"
                >
                  <div className={`${ELEMENT_TAG}-scene-error-message`}>
                    You are currently in this area without permission.
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}
          <SceneErrorChip
            items={errorItems}
            context={{ sceneStatus: room.status, revision: room.sceneRevision, mobile, draftRetained: !!draft }}
            open={errorsOpen}
            onOpen={(value) => {
              setErrorsOpen(value);
              if (value) {
                setNoticesOpen(false);
                setActionsView(null);
              }
            }}
          />
          <LoreActivitySlot entries={room.lore ?? emptyLore} />
          {notices.length > 0 ? (
            <div className={`${ELEMENT_TAG}-room-notices`} aria-live="polite">
              <button
                type="button"
                className={`${ELEMENT_TAG}-room-notices-trigger`}
                onClick={() => {
                  setNoticesOpen((value) => !value);
                  setPermissionOpen(false);
                  setErrorsOpen(false);
                  setActionsView(null);
                }}
                aria-expanded={noticesOpen}
                aria-label={`${notices.length} ${notices.length === 1 ? "World change" : "World changes"}`}
              >
                <span aria-hidden="true">{presenceNotice ? roomNoticeIcon(presenceNotice) : "✦"}</span> {notices.length}
              </button>
              {noticesOpen ? (
                <div className={`${ELEMENT_TAG}-room-stars`} aria-live="polite" aria-label="World changes">
                  {notices.map((notice) => (
                    <div key={notice.id} className={`${ELEMENT_TAG}-room-star`}>
                      <span aria-hidden="true">{roomNoticeIcon(notice)}</span>
                      {(notice.kind === "memory" ||
                        notice.kind === "wish" ||
                        notice.kind === "relationship-up" ||
                        notice.kind === "relationship-down") &&
                      (notice.detail || (notice.wishUpdate?.actorId && onOpenWish)) ? (
                        <button
                          type="button"
                          className={`${ELEMENT_TAG}-room-star-detail`}
                          onClick={(event) => {
                            if (notice.wishUpdate?.actorId && onOpenWish) {
                              onOpenWish(notice.wishUpdate.actorId, notice.wishUpdate.wishId);
                              return;
                            }
                            memoryTriggerRef.current = event.currentTarget;
                            setOpenMemory(notice);
                          }}
                          aria-label={`View ${roomNoticeLabel(notice.kind)}: ${notice.text}`}
                          title={
                            notice.kind === "memory"
                              ? "View saved memory"
                              : notice.kind === "wish"
                                ? "View Wish update"
                                : "View relationship change"
                          }
                        >
                          {notice.text}
                        </button>
                      ) : (
                        <span>{notice.text}</span>
                      )}
                      <button
                        type="button"
                        className={`${ELEMENT_TAG}-room-star-dismiss`}
                        onClick={() => {
                          if (openMemory?.id === notice.id) setOpenMemory(null);
                          onDismissNotice(notice.id);
                        }}
                        aria-label={`Dismiss ${notice.text}`}
                        title="Dismiss notice"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <span ref={actionsRef} className={`${ELEMENT_TAG}-chat-actions`}>
          <button
            ref={actionsTriggerRef}
            type="button"
            className={`${ELEMENT_TAG}-room-actions-trigger`}
            onClick={() => {
              setActionsView((value) => (value ? null : "menu"));
              setPermissionOpen(false);
              setErrorsOpen(false);
              setNoticesOpen(false);
            }}
            aria-label="Venue actions"
            aria-haspopup="menu"
            aria-expanded={actionsView === "menu"}
          >
            ···
          </button>
          {actionsView === "menu" ? (
            <span
              className={`${ELEMENT_TAG}-room-actions-menu`}
              role="menu"
              aria-label="Venue actions"
              onKeyDown={(event) => {
                if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
                const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? buttons.length - 1
                      : (index + (event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1) + buttons.length) %
                        buttons.length;
                event.preventDefault();
                buttons[next]?.focus({ preventScroll: true });
              }}
            >
              <button
                type="button"
                role="menuitem"
                aria-label="Settings"
                title="Settings"
                onClick={() => {
                  setActionsView(null);
                  onSettings();
                }}
              >
                <SceneActionIcon name="settings" />
              </button>
              <button
                type="button"
                role="menuitem"
                aria-label="Retry Turn"
                title="Retry Turn"
                disabled={!canRetryReply}
                onClick={() => {
                  setActionsView(null);
                  onRetryReply?.();
                }}
              >
                <SceneActionIcon name={canRetryReply ? "retry" : "retry-unavailable"} />
              </button>
              <button
                type="button"
                role="menuitem"
                aria-label="View Venue"
                title="View Venue"
                disabled={busy}
                onClick={() => {
                  setActionsView(null);
                  onViewVenue();
                }}
              >
                <SceneActionIcon name="venue" />
              </button>
              <button
                type="button"
                role="menuitem"
                aria-label="View Mailbox"
                title="View Mailbox"
                disabled={!onUseMailbox}
                onClick={() => {
                  setActionsView(null);
                  onUseMailbox?.();
                }}
              >
                <SceneActionIcon name="mailbox" />
              </button>
              <button
                type="button"
                role="menuitem"
                aria-label="Map"
                title="Map"
                disabled={!onMap}
                onClick={() => {
                  setActionsView(null);
                  onMap?.();
                }}
              >
                <SceneActionIcon name="map" />
              </button>
              <button
                type="button"
                role="menuitem"
                aria-label="Projects"
                title="Projects"
                disabled={!onProjects}
                onClick={() => {
                  setActionsView(null);
                  onProjects?.();
                }}
              >
                <SceneActionIcon name="projects" />
              </button>
              <button
                type="button"
                role="menuitem"
                aria-label="Proposals"
                title="Proposals"
                disabled={!onProposals}
                onClick={() => {
                  setActionsView(null);
                  onProposals?.();
                }}
              >
                <SceneActionIcon name="proposals" />
              </button>
              <button
                type="button"
                role="menuitem"
                aria-label={ended ? "Return to map" : "Conclude"}
                title={ended ? "Return to map" : "Conclude"}
                disabled={busy}
                onClick={() => {
                  setActionsView(null);
                  actionsTriggerRef.current?.focus({ preventScroll: true });
                  onEnd();
                }}
              >
                <SceneActionIcon name="conclude" />
              </button>
            </span>
          ) : null}
        </span>
      </div>
      {actionsView === "move" && !contactRecovery ? (
        <SceneMoveDialog
          key={worldScope + ":" + room.id}
          zones={movementZones}
          positions={movementPositions}
          currentId={room.zoneId}
          venueName={room.placeName}
          currentZoneLabel={currentZoneLabel}
          trespassing={room.trespassing}
          lighting={movementLighting}
          busy={busy || !canSend}
          onClose={() => {
            setActionsView(null);
            moveTriggerRef.current?.focus({ preventScroll: true });
          }}
          onMove={onMovementTarget}
        />
      ) : null}
      {openMemory?.detail ? (
        <div
          className={`${ELEMENT_TAG}-memory-backdrop`}
          onClick={(event) => {
            if (event.currentTarget === event.target) closeMemory();
          }}
        >
          <div
            className={`${ELEMENT_TAG}-memory-dialog`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${ELEMENT_TAG}-memory-dialog-title`}
          >
            <div className={`${ELEMENT_TAG}-memory-dialog-head`}>
              <h2 id={`${ELEMENT_TAG}-memory-dialog-title`}>{openMemory.text}</h2>
              <button
                ref={memoryCloseRef}
                type="button"
                onClick={closeMemory}
                aria-label={
                  openMemory.kind === "memory"
                    ? "Close memory"
                    : openMemory.kind === "wish"
                      ? "Close Wish update"
                      : "Close relationship change"
                }
              >
                ×
              </button>
            </div>
            <p>{openMemory.detail}</p>
          </div>
        </div>
      ) : null}

      {/*
        The floor: everybody who was in the room when it opened.

        `aria-hidden` on the row, with the sentence above carrying the names — see
        there. The faces are the ENGINE's own avatar frame rather than the private
        drawer's big square, because a room has several and a row of several people
        is a row of small ones; the frame is also the one thing on this screen that
        tells the player which villager is which without a label, which is what a
        face is for.

        The plate under them is the place rather than the people, exactly as it is
        in the private drawer: the faces answer who, and the plate answers where.
      */}
      {activeParticipants.length > 0 ? (
        <div className={`${ELEMENT_TAG}-chat-activities`} tabIndex={0} aria-label="What everyone here is doing">
          {activeParticipants.map((villager) => (
            <span key={villager.characterId} className={`${ELEMENT_TAG}-chat-activity`}>
              {`${villager.name}: ${villager.doing || "spending time here"}`}
            </span>
          ))}
        </div>
      ) : null}
      {!historyOpen && !retrying && !readingPages.revealing && step && step.asides.length > 0 ? (
        <SceneAsides
          asides={step.asides}
          mobile={mobile}
          positions={mobile ? mobileLayout : stageLayout}
          renderAside={(aside, index) => (
            <div
              className={`${ELEMENT_TAG}-chat-vn-aside`}
              data-register={speechDelivery(aside) === "ordinary" ? "side" : speechDelivery(aside)}
            >
              <SceneFace
                actorId={aside.speakerId}
                portrait={portraits[aside.speakerId]}
                name={aside.name}
                className={`${ELEMENT_TAG}-chat-vn-aside-face`}
              />
              <div className={`${ELEMENT_TAG}-chat-vn-aside-column`}>
                <p className={`${ELEMENT_TAG}-chat-vn-aside-head`}>
                  <span className={`${ELEMENT_TAG}-chat-vn-aside-name`} style={nameStyle(aside.speakerId)}>
                    {aside.name}
                  </span>
                  {aside.targetId === "player" ? (
                    <span className={`${ELEMENT_TAG}-chat-vn-aside-target`}>to you</span>
                  ) : null}
                </p>
                <p className={`${ELEMENT_TAG}-chat-vn-aside-text`} style={speechStyle(aside.speakerId)}>
                  {renderVillagesMarkdown(aside.content, `aside-${index}-`)}
                </p>
              </div>
            </div>
          )}
        />
      ) : null}
      <div className={`${ELEMENT_TAG}-chat-stage`} aria-hidden="true">
        <div
          className={`${ELEMENT_TAG}-chat-cast`}
          data-staging="true"
          data-animate={animateStaging ? "true" : "false"}
        >
          {displayed.map((villager, index) => {
            const npc = villager.characterId.startsWith("npc:");
            const sprite = sprites[villager.characterId];
            const isSpeaker = villager.characterId === speaker?.characterId;
            const mobileSlot = mobileLayout[villager.characterId];
            const slot = stageLayout[villager.characterId];
            const facing = (mobile ? mobileSlot?.facing : slot?.facing) ?? "front";
            const staged = stagingState[villager.characterId];
            const selected = selectSpriteImage(
              (sprite?.images ?? []).filter((image) => !failedSpriteUrls.has(image.url)),
              staged?.expression ?? "",
            );
            return (
              <div
                key={villager.characterId}
                className={`${ELEMENT_TAG}-chat-cast-person`}
                data-active={isSpeaker && (!mobile || register !== "narration") ? "true" : "false"}
                data-sprite={npc || selected ? "true" : "false"}
                data-character-id={villager.characterId}
                data-position={slot ? stagingState[villager.characterId].position : undefined}
                data-attention={slot ? slot.facing : undefined}
                style={
                  {
                    "--cast-center": `${((mobile ? mobileSlot?.x : slot?.x) ?? (index + 0.5) / displayed.length) * 100}%`,
                    "--cast-depth": `${mobileSlot?.depth ?? 0}px`,
                    ...(slot
                      ? { "--cast-left": `${(slot.x - slot.width / 2) * 100}%`, "--cast-width": `${slot.width * 100}%` }
                      : {}),
                  } as CSSProperties
                }
              >
                {npc ? (
                  <NpcSprite />
                ) : selected ? (
                  <CardFlipSprite
                    key={room.id}
                    url={selected.image.url}
                    facing={facing}
                    mirrored={selected.mirrored}
                    view="front"
                    framing={sprite?.framing.mode ?? "full"}
                    enabled={spriteCardFlipEnabled}
                    animate={animateStaging}
                    stepKey={replyId || stageRoomId}
                    onError={(url) => setFailedSpriteUrls((previous) => new Set([...previous, url]))}
                  />
                ) : (
                  <AvatarFace
                    portrait={portraits[villager.characterId]}
                    name={villager.name}
                    className={`${ELEMENT_TAG}-avatar`}
                  />
                )}
                <span style={nameStyle(villager.characterId)}>{villager.name}</span>
              </div>
            );
          })}
        </div>
        {rest.length > 0 ? (
          <div className={`${ELEMENT_TAG}-chat-cast-rest`}>
            {rest.map((person) => (
              <span key={person.characterId}>
                <SceneFace
                  actorId={person.characterId}
                  portrait={portraits[person.characterId]}
                  name={person.name}
                  className={`${ELEMENT_TAG}-avatar`}
                />
                <span style={nameStyle(person.characterId)}>{person.name}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {canCompose && !turnRecovery && !openMemory && travel && onTravel && dismissedTravelId !== travel.id ? (
        <div
          className={`${ELEMENT_TAG}-room-star ${ELEMENT_TAG}-scene-travel-card`}
          aria-label="Travel offer"
          role="group"
        >
          <strong aria-live="polite">{travel.label}</strong>
          <button type="button" className={`${ELEMENT_TAG}-scene-visit`} disabled={!canSend} onClick={onTravel}>
            Visit <span aria-hidden="true">›</span>
          </button>
          <button type="button" aria-label="Dismiss travel offer" onClick={() => setDismissedTravelId(travel.id)}>
            ×
          </button>
        </div>
      ) : null}
      <div className={`${ELEMENT_TAG}-chat-vn`} data-history-open={historyOpen || undefined}>
        {historyOpen ? (
          <div
            ref={historyRef}
            className={`${ELEMENT_TAG}-chat-log`}
            role="log"
            aria-label="Scene history"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Escape") closeTranscript();
            }}
          >
            <SceneHistory
              key={worldScope + ":" + room.id}
              sceneId={room.id}
              scope={worldScope}
              playerName={playerName}
              playerPortrait={playerPortrait}
              portraits={portraits}
              nameStyle={nameStyle}
              speechStyle={speechStyle}
              currentVisitId={room.status === "active" ? room.zoneArrivalId : undefined}
              onClose={closeTranscript}
            />
          </div>
        ) : null}
        <DialogueReader
          className={`${ELEMENT_TAG}-chat-vn-card`}
          contentClassName={`${ELEMENT_TAG}-chat-vn-row`}
          data-register={register}
          data-delivery={step ? speechDelivery(step) : undefined}
          aria-hidden={historyOpen || undefined}
          inert={historyOpen || undefined}
          icon={
            retrying || register === "narration" ? null : (
              <SceneFace
                actorId={step?.speakerId}
                portrait={speakerPortrait}
                name={step?.name ?? "Narration"}
                className={`${ELEMENT_TAG}-chat-vn-portrait`}
              />
            )
          }
          speaker={
            retrying || register === "narration" ? null : (
              <p className={`${ELEMENT_TAG}-chat-vn-name`} style={nameStyle(step?.speakerId ?? "")}>
                {step?.name ?? ""}
                {step?.viaDoorway ? (
                  <span className={`${ELEMENT_TAG}-speech-location`} title="Speaking from another Zone">
                    Nearby
                  </span>
                ) : null}
              </p>
            )
          }
        >
          <div
            ref={readingRef}
            className={`${ELEMENT_TAG}-chat-vn-reading`}
            role="region"
            aria-label="Current paragraph"
            aria-live="polite"
            aria-busy={readingPages.revealing}
            tabIndex={0}
          >
            {retrying ? (
              waiting
            ) : step ? (
              register === "narration" ? (
                <p className={`${ELEMENT_TAG}-chat-vn-beat`} data-register="narration">
                  {drawVillagesNodes(readingPages.nodes, "vn-beat-")}
                </p>
              ) : (
                <p className={`${ELEMENT_TAG}-chat-vn-text`} style={speechStyle(step.speakerId)}>
                  {drawVillagesNodes(readingPages.nodes, "vn-")}
                </p>
              )
            ) : (
              /*
                    A room with nothing in it, which is a room the player has just
                    walked into and nobody has been asked anything yet.
                  */
              <p className={`${ELEMENT_TAG}-chat-vn-text`} data-empty="true">
                {room.status === "opening"
                  ? `Opening the Scene in ${room.placeName}…`
                  : activeParticipants.length === 0
                    ? `You are alone in this Zone of ${room.placeName}.`
                    : "…"}
              </p>
            )}
            {!ended && busy && !retrying ? waiting : null}
          </div>
        </DialogueReader>
        <div className={`${ELEMENT_TAG}-scene-dock-tools`}>
          <button
            ref={transcriptTriggerRef}
            type="button"
            aria-label="Transcript"
            title="Transcript"
            disabled={!worldScope || !room.lines.length}
            onClick={() => {
              setHistoryOpen((value) => !value);
              setActionsView(null);
            }}
          >
            <SceneActionIcon name="transcript" />
          </button>
          <button
            ref={moveTriggerRef}
            type="button"
            className={`${ELEMENT_TAG}-scene-move-trigger`}
            disabled={!canSend || !movementZones.length}
            onClick={() => setActionsView("move")}
          >
            <SceneActionIcon name="move" />
            Move
          </button>
          {!ended || canReadNext ? (
            <button
              type="button"
              className={`${ELEMENT_TAG}-chat-vn-button`}
              onClick={() => {
                if (introductionActive && !canReadNext) {
                  onEnd();
                  return;
                }
                if (readingPages.revealing) {
                  readingPages.finishReveal();
                  return;
                }
                if (!readingPages.move(1)) {
                  if (at < steps.length - 1) setSelection({ key: replyKey, index: at + 1 });
                }
              }}
              disabled={(!canReadNext && !introductionActive) || retrying || (!!room.visitorIntroduction && busy)}
              aria-label={introductionActive && !canReadNext ? "Continue" : "Next paragraph"}
            >
              {introductionActive && !canReadNext ? "Continue" : "Next"}
            </button>
          ) : ended ? (
            <button type="button" className={`${ELEMENT_TAG}-chat-vn-button`} onClick={onEnd} disabled={busy}>
              Return to map
            </button>
          ) : null}
        </div>

        {room.status === "closing" ? <p className={ELEMENT_TAG + "-hint"}>Closing this Scene…</p> : null}

        {openingActions ? (
          <div className={`${ELEMENT_TAG}-scene-opening-actions`} role="group" aria-label="Scene opening">
            {openingActions}
          </div>
        ) : null}
        {!ended && !room.visitorIntroduction ? (
          <div className={`${ELEMENT_TAG}-composer`}>
            {contactRecovery && !busy ? (
              <div role="status">
                <p>Saved Contact action · {recoveryDestination}</p>
                <p>{contactRecovery.operation.input?.message || "Saved action"}</p>
                <button type="button" disabled={busy} onClick={onRetryContact}>
                  Retry original action
                </button>
                <button type="button" disabled={busy || !draft.trim()} onClick={onReplaceContact}>
                  Replace with draft
                </button>
                <button type="button" disabled={busy} onClick={onReviewContact}>
                  Review latest saved action
                </button>
              </div>
            ) : null}
            <div className={`${ELEMENT_TAG}-composer-row`}>
              <span className={`${ELEMENT_TAG}-chat-input`}>
                <textarea
                  autoComplete="off"
                  ref={composerRef}
                  data-villages-scene-composer
                  className={`${ELEMENT_TAG}-textarea`}
                  rows={1}
                  value={draft}
                  disabled={!canCompose}
                  onChange={(event) => onDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (shouldSubmitVenueKey(event.key, event.shiftKey, event.nativeEvent.isComposing, sendOnEnter)) {
                      event.preventDefault();
                      submitComposer();
                    }
                  }}
                  placeholder="Message…"
                  aria-label={`Message at ${room.placeName}`}
                />
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-chat-send`}
                  onClick={submitComposer}
                  disabled={!canSend || !draft.trim()}
                  aria-label={sendLabel}
                  title={sendLabel}
                >
                  <SceneControlIcon name={busy ? "sending" : "send"} />
                </button>
              </span>
              <button
                type="button"
                className={`${ELEMENT_TAG}-chat-keyboard-done`}
                onClick={() => composerRef.current?.blur()}
              >
                Done
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
