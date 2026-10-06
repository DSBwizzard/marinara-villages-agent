import {
  initialStaging,
  lineStagingCues,
  replayStaging,
  stagingBoundaries,
  stagingLayout,
} from "../../../engine/packages/shared/src/villages/scene-staging.js";
import { messageFrom, request } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { drawVillagesNodes, renderVillagesMarkdown, villagesSpeechPaintStyle } from "../../shared/presentation.js";
import type {
  Portrait,
  PortraitMap,
  ResidentSprite,
  RoomLine,
  RoomRecordEvent,
  RoomStep,
  SceneComposerMode,
  SceneView,
  VillageBeatRegister,
} from "../../shared/types.js";
import { AvatarFace } from "../residents/ResidentPanels.js";
import { CardFlipSprite } from "./villages-card-flip-sprite.js";
import { classifyVillagesParagraph, villagesWalk } from "./villages-chat-paragraphs";
import { mobileReadingCounter, mobileSceneLayout } from "./villages-mobile-scene.js";
import { useReadingPages } from "./villages-reading-viewport.js";
import { hasCompletedRoomSubmission, nextRoomReadIndex } from "./villages-room-reading";
import { SceneAsides } from "./villages-scene-asides.js";
import { selectSpriteImage, spriteFacing } from "./villages-sprite-stage";
import { shouldSubmitVenueKey } from "./villages-venue-send";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/** Unseen Zone names remain private. */
export function sceneZoneLabel(zone?: { name: string; kind: string; seen?: boolean }): string {
  if (zone?.seen) return zone.name;
  if (zone?.kind === "exterior") return "Exterior";
  if (zone?.kind === "private-residence") return "Private-space doorway";
  if (zone?.kind === "staff" || zone?.kind === "restricted") return "Restricted doorway";
  return "Interior entrance";
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

function roomNoticeIcon(kind: RoomRecordEvent["kind"]): string {
  return kind === "relationship-up" ? "♥" : kind === "relationship-down" ? "♡" : "★";
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

export async function completedGreetingAfterFailure(sessionId: string): Promise<SceneView | null> {
  try {
    const { session } = await request<{ session: SceneView | null }>("/rooms/active", {
      signal: AbortSignal.timeout(5_000),
    });
    return session?.id === sessionId && session.status !== "opening" ? currentRoom(session) : null;
  } catch {
    return null;
  }
}

export async function refreshSceneAfterFailure(sessionId: string, submissionId?: string): Promise<SceneView | null> {
  try {
    if (submissionId)
      await request(`/rooms/${encodeURIComponent(sessionId)}/operations/${encodeURIComponent(submissionId)}`, {
        signal: AbortSignal.timeout(5_000),
      });
    const { session } = await request<{ session: SceneView | null }>("/rooms/active", {
      signal: AbortSignal.timeout(5_000),
    });
    if (session?.id === sessionId) return session;
    const { visit } = await request<{ visit: SceneView }>(`/rooms/archive/${encodeURIComponent(sessionId)}`, {
      signal: AbortSignal.timeout(5_000),
    });
    return visit;
  } catch {
    return null;
  }
}

export async function completedRoomAfterFailure(sessionId: string, submissionId: string): Promise<SceneView | null> {
  try {
    const { visit } = await request<{ visit: SceneView }>(`/rooms/archive/${encodeURIComponent(sessionId)}`, {
      signal: AbortSignal.timeout(5_000),
    });
    return hasCompletedRoomSubmission(visit, submissionId) ? currentRoom(visit) : null;
  } catch {
    return null;
  }
}

export function openingFailureMessage(cause: unknown): string {
  const message = messageFrom(cause, "The scene opening could not be prepared.");
  return /timeout|timed out|exceeded 28 seconds/iu.test(message)
    ? "The scene opening took too long. Retry it or continue without an opening."
    : `${message} Retry it or continue without an opening.`;
}

/** Same Send geometry and stroke as Engine's lucide-react composer icon (ISC). */
function SceneControlIcon({
  name,
}: {
  name: "send" | "sending" | "chat" | "knock" | "fulfill" | "conclude" | "up" | "down" | "narrator";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={name === "sending" ? ELEMENT_TAG + "-spin" : undefined}
    >
      {name === "send" ? (
        <>
          <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
          <path d="m21.854 2.147-10.94 10.939" />
        </>
      ) : name === "sending" ? (
        <path d="M12 3a9 9 0 1 1-9 9" />
      ) : name === "chat" ? (
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      ) : name === "up" ? (
        <path d="m6 15 6-6 6 6" />
      ) : name === "down" ? (
        <path d="m6 9 6 6-6" />
      ) : name === "knock" ? (
        <>
          <path d="M10 3h10v18H10V3Z M4 10h4 M2 6l4 2 M2 16l4-2" />
          <path d="M16 12h.01" />
        </>
      ) : name === "fulfill" ? (
        <>
          <path d="m9 12 2 2 4-4" />
          <rect x="4" y="3" width="16" height="18" rx="2" />
        </>
      ) : name === "conclude" ? (
        <>
          <path d="M9 21H5V3h4 M12 12h10 m-4-4 4 4-4 4" />
        </>
      ) : (
        <>
          <rect x="4" y="8" width="16" height="13" rx="3" />
          <path d="M12 8V3h3 M8 13h.01 M16 13h.01 M2 12v5 M22 12v5" />
        </>
      )}
    </svg>
  );
}

/** The single Visit surface for an empty, solo, or group cast. */
export function RoomPanel({
  room,
  mobile,
  nameColors,
  speechColors,
  picture,
  draft,
  mode,
  targetId,
  busy,
  error,
  greetingNotice,
  ruling,
  open,
  ended,
  playerName,
  playerPortrait,
  portraits,
  sprites,
  onDraft,
  onMode,
  onTarget,
  onSend,
  sendOnEnter,
  spriteCardFlipEnabled,
  onViewVenue,
  onEnterPrivate,
  privateSpaceOwnerName,
  onEnd,
  onRetryGreeting,
  onContinueWithoutGreeting,
  notices,
  onDismissNotice,
  onOpenWish,
  changeStatus,
  onReplayChanges,
  unresolvedChanges,
  onRetryChangeInterpretation,
  debugDiscardEnabled,
  onDebugDiscard,
  onUseMailbox,
  onProjects,
  onProposals,
  sceneSettings,
  contactDoors,
  contactBoundary,
  onContactBoundary,
  onAcceptEntry,
  movementZones,
  movementTarget,
  onMovementTarget,
  currentZoneLabel,
}: {
  room: SceneView;
  mobile: boolean;
  nameColors: Record<string, string>;
  speechColors: Record<string, string>;
  /** The picture of the place, or `""` for one that has never been drawn. */
  picture: string;
  draft: string;
  mode: SceneComposerMode;
  targetId: string;
  busy: boolean;
  error: string;
  greetingNotice: string;
  ruling: string;
  open: boolean;
  ended: boolean;
  playerName: string;
  playerPortrait: Portrait | undefined;
  portraits: PortraitMap;
  sprites: Record<string, ResidentSprite | null>;
  onDraft: (value: string) => void;
  onMode: (value: SceneComposerMode) => void;
  onTarget: (value: string) => void;
  onSend: () => void;
  sendOnEnter: boolean;
  spriteCardFlipEnabled: boolean;
  onViewVenue: () => void;
  onEnterPrivate?: () => void;
  privateSpaceOwnerName?: string;
  onEnd: () => void;
  onRetryGreeting: () => void;
  onContinueWithoutGreeting: () => void;
  notices: RoomRecordEvent[];
  onDismissNotice: (id: string) => void;
  onOpenWish?: (actorId: string, wishId: string) => void;
  changeStatus?: { pending: number; failed: number; rejected: number };
  onReplayChanges?: () => void;
  unresolvedChanges?: { submissionId: string; domain: string; reason?: string }[];
  onRetryChangeInterpretation?: (submissionId: string, domain: "memories" | "relationships" | "wishes") => void;
  debugDiscardEnabled: boolean;
  onDebugDiscard: () => void;
  onUseMailbox?: () => void;
  onProjects?: () => void;
  onProposals?: () => void;
  sceneSettings: ReactNode;
  contactDoors: { id: string; label: string }[];
  contactBoundary: string;
  onContactBoundary: (id: string) => void;
  onAcceptEntry: (zoneId: string) => void;
  movementZones: { id: string; label: string; closed?: boolean }[];
  movementTarget: string;
  onMovementTarget: (id: string) => void;
  currentZoneLabel: string;
}) {
  /** The current paragraph in this Scene's ordered reading. */
  const [readStep, setReadStep] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement | null>(null);
  const [noticesOpen, setNoticesOpen] = useState(false);
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const [openMemory, setOpenMemory] = useState<RoomRecordEvent | null>(null);
  const memoryTriggerRef = useRef<HTMLButtonElement | null>(null);
  const memoryCloseRef = useRef<HTMLButtonElement | null>(null);
  const composerRef = useRef<HTMLTextAreaElement | null>(null);
  const modeAnchorRef = useRef<HTMLSpanElement | null>(null);
  const historyTriggerRef = useRef<HTMLButtonElement | null>(null);
  const historyRef = useRef<HTMLDivElement | null>(null);
  const readingRef = useRef<HTMLDivElement | null>(null);
  const actionsRef = useRef<HTMLSpanElement | null>(null);
  const previousReading = useRef<{ roomId: string; stepCount: number } | null>(null);
  const [dialogueHidden, setDialogueHidden] = useState(false);
  const [failedSpriteUrls, setFailedSpriteUrls] = useState<ReadonlySet<string>>(() => new Set());
  const previousNoticeIds = useRef(new Set<string>());

  useEffect(() => {
    if (settingsOpen) settingsRef.current?.focus();
  }, [settingsOpen]);

  useEffect(() => {
    setNoticesOpen(false);
    previousNoticeIds.current.clear();
  }, [room.id]);

  useEffect(() => {
    const fresh = notices.some((notice) => !previousNoticeIds.current.has(notice.id));
    previousNoticeIds.current = new Set(notices.map((notice) => notice.id));
    if (fresh) setNoticesOpen(true);
    else if (notices.length === 0) setNoticesOpen(false);
  }, [notices, room.id]);

  useEffect(() => {
    if (!historyOpen) return;
    window.requestAnimationFrame(() => historyRef.current?.focus());
  }, [historyOpen]);

  useEffect(() => {
    if (!actionsOpen) return;
    const closeOnOutside = (event: PointerEvent) => {
      if (!actionsRef.current?.contains(event.target as Node)) setActionsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActionsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [actionsOpen]);

  useEffect(() => {
    if (!modeMenuOpen) return;
    const closeOnOutside = (event: Event) => {
      if (!modeAnchorRef.current?.contains(event.target as Node)) setModeMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModeMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("focusin", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("focusin", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [modeMenuOpen]);

  const closeMemory = useCallback(() => {
    setOpenMemory(null);
    window.requestAnimationFrame(() => memoryTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!openMemory) return;
    window.requestAnimationFrame(() => memoryCloseRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault();
        memoryCloseRef.current?.focus();
        return;
      }
      if (event.key !== "Escape") return;
      event.preventDefault();
      closeMemory();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMemory, openMemory]);

  /**
   * The whole room, one paragraph at a time, each paragraph wearing a name.
   *
   * A line's beats are handed to the walk exactly as the private drawer hands
   * them, so an aside is lifted out of the paragraph it was tagged under and
   * printed in a bubble over the card instead — the same reading, for the same
   * reason: a remark said to one person is not a paragraph said to the room.
   *
   * The player's own lines go through the same walk as the villagers'. They are
   * plain prose with no beats on them, which is what makes it safe to hand their
   * content to a parser at all — and it means a player who types a line starting
   * with a name and a colon gets it drawn as themselves anyway, because the name
   * drawn over a step comes off the LINE and never off what the line says. That
   * is the whole defence this drawing needs against a player writing somebody
   * else's name into the room's record.
   */
  const steps = useMemo<RoomStep[]>(() => {
    const built: RoomStep[] = [];
    const boundaries = stagingBoundaries(room.lines, room.submissions ?? []);
    const stageAsides = new Map<string, RoomLine[]>();
    const attached = new Map<string, RoomStep["asides"]>();
    for (const line of room.lines) {
      if ((line.kind !== "side" && line.kind !== "whisper") || !line.asideFor) continue;
      const list = attached.get(line.asideFor) ?? [];
      list.push({
        register: line.kind,
        text: line.content,
        ...(line.targetId
          ? {
              target:
                line.targetId === "player"
                  ? playerName
                  : (room.participants.find((person) => person.characterId === line.targetId)?.name ?? line.targetId),
            }
          : {}),
        speakerId: line.speakerId,
        name: line.name,
        expression: line.expression,
        gazeAt: line.gazeAt,
      });
      attached.set(line.asideFor, list);
      stageAsides.set(line.asideFor, [...(stageAsides.get(line.asideFor) ?? []), line]);
    }
    for (const line of room.lines) {
      if (line.kind === "side" || line.kind === "whisper") continue;
      const player = line.speakerId.length === 0;
      const walk = villagesWalk(line.content, line.beats ?? null);
      const asideLines = stageAsides.get(line.id ?? "") ?? [];
      const momentBoundaries = [line, ...asideLines].map((item) => boundaries.get(item.id ?? ""));
      const beforeIds = momentBoundaries.find((item) => item?.beforeIds)?.beforeIds;
      const afterIds = momentBoundaries.find((item) => item?.afterIds)?.afterIds;
      walk.paragraphs.forEach((paragraph, index) => {
        built.push({
          key: `${built.length}`,
          ...(room.stagingVersion === 1
            ? {
                stagingEvent: {
                  cues: [
                    ...(index === 0 ? lineStagingCues(line) : []),
                    ...(index === walk.paragraphs.length - 1 ? asideLines.flatMap(lineStagingCues) : []),
                  ],
                  ...(index === 0 && beforeIds ? { beforeIds } : {}),
                  ...(index === walk.paragraphs.length - 1 && afterIds ? { afterIds } : {}),
                },
              }
            : {}),
          speakerId: player ? "" : line.speakerId,
          name: player ? playerName : line.name,
          player,
          text: paragraph,
          asides: [
            ...(walk.asides[index] ?? []),
            ...(index === walk.paragraphs.length - 1 ? (attached.get(line.id ?? "") ?? []) : []),
          ],
          ...(line.kind ? { register: line.kind === "narration" ? "narration" : "speech" } : {}),
          ...(line.expression ? { expression: line.expression } : {}),
          ...(line.gazeAt ? { gazeAt: line.gazeAt } : {}),
        });
      });
    }
    return built;
  }, [playerName, room.lines, room.participants, room.stagingVersion, room.submissions]);

  /** A new visit opens at its latest line; each append opens at its first new paragraph. */
  useLayoutEffect(() => {
    setReadStep((current) => nextRoomReadIndex(previousReading.current, room.id, steps.length, current));
    previousReading.current = { roomId: room.id, stepCount: steps.length };
  }, [room.id, steps.length]);

  const at = Math.min(readStep, Math.max(0, steps.length - 1));
  const step = steps[at];
  const readingPages = useReadingPages(step?.text ?? "", `${room.id}:${at}`, readingRef);
  const stagingFrames = useMemo(
    () =>
      room.stagingVersion === 1
        ? replayStaging(
            room.participants.map((person) => person.characterId),
            steps.map((item) => item.stagingEvent ?? {}),
          )
        : [],
    [room.stagingVersion, room.participants, steps],
  );
  const stagingFrame = stagingFrames[at];
  const stagingState = stagingFrame?.state ?? initialStaging(room.participants.map((person) => person.characterId));
  const previousStageReading = useRef<{ roomId: string; at: number; restoring: boolean } | null>(null);
  const animateStaging = useMemo(
    () =>
      previousStageReading.current?.roomId === room.id &&
      !previousStageReading.current.restoring &&
      at > previousStageReading.current.at,
    [room.id, at],
  );
  useLayoutEffect(() => {
    const initialRead = previousStageReading.current?.roomId !== room.id;
    previousStageReading.current = {
      roomId: room.id,
      at,
      restoring: initialRead && at !== Math.max(0, steps.length - 1),
    };
  }, [room.id, at, steps.length]);
  const canReadPrevious = at > 0 || readingPages.index > 0;
  const canReadNext = at < steps.length - 1 || readingPages.index < readingPages.count - 1;
  const canDraft = !ended && room.status === "active";
  // Display pages do not impose a new requirement to read every word before replying.
  const canCompose = canDraft && (steps.length === 0 || at === steps.length - 1) && !historyOpen;
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
  }, [canDraft, draft, mode, resizeComposer]);

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
  }, [canDraft, mode, resizeComposer]);

  const submitComposer = () => {
    if (
      !canCompose ||
      busy ||
      (mode !== "conclude" && mode !== "contact" && mode !== "move" && !draft.trim()) ||
      (mode === "fulfill" && !targetId) ||
      (mode === "contact" && !contactDoors.some((door) => door.id === contactBoundary)) ||
      (mode === "move" &&
        !movementZones.some((zone) => zone.id === movementTarget && zone.id !== room.zoneId && !zone.closed))
    )
      return;
    setModeMenuOpen(false);
    onSend();
  };

  useLayoutEffect(() => {
    if (readingRef.current) readingRef.current.scrollTop = 0;
  }, [at, room.id, readingPages.index]);

  /** Each paragraph keeps its own narration or speech attribution. */
  const register: VillageBeatRegister =
    step?.register ??
    (step === undefined || step.speakerId === "__venue_scene__"
      ? "narration"
      : step.player || classifyVillagesParagraph(step.text) === "speech"
        ? "speech"
        : "narration");

  const speakerPortrait = step === undefined ? undefined : step.player ? playerPortrait : portraits[step.speakerId];
  const activeParticipants = room.participants.filter((person) => room.activeIds.includes(person.characterId));
  const cast =
    room.stagingVersion === 1
      ? room.participants.filter((person) => (stagingFrame?.activeIds ?? room.activeIds).includes(person.characterId))
      : room.status === "closed" && activeParticipants.length === 0
        ? room.participants
        : activeParticipants;
  const speaker = cast.find((person) => person.characterId === step?.speakerId);
  const speechStyle = (speakerId: string) => villagesSpeechPaintStyle(speechColors[speakerId]);
  const nameStyle = (speakerId: string) => villagesSpeechPaintStyle(nameColors[speakerId]);
  const displayed = cast.slice(0, 4);
  const rest = cast.filter((person) => !displayed.some((shown) => shown.characterId === person.characterId));
  const mobileLayout = mobileSceneLayout(
    displayed.map((person) => person.characterId),
    stagingState,
    steps.slice(0, at + 1).map((item) => item.stagingEvent ?? {}),
  );
  const stageLayout = stagingLayout(
    displayed.map((person) => person.characterId),
    stagingState,
  );
  const asideSide = (
    room.stagingVersion === 1
      ? (stageLayout[speaker?.characterId ?? ""]?.x ?? 0) > 0.5
      : displayed.findIndex((person) => person.characterId === speaker?.characterId) >= 2
  )
    ? "left"
    : "right";

  /**
   * The wait, in the room's own words.
   *
   * The private drawer's spinner names the villager, because one villager is who
   * was asked. This one cannot: in the mode where the room answers together the
   * wait is one call for all of them, and in the mode where each answers in turn
   * it is one call each — the player was told which of the two this village is set
   * to in the settings, so the sentence that carries the information here is that
   * the room is answering at all, and that it may take one call or several.
   */
  const waiting = (
    <p className={`${ELEMENT_TAG}-chat-pending`} role="status">
      <span className={`${ELEMENT_TAG}-chat-spinner ${ELEMENT_TAG}-spin`} aria-hidden="true" />
      <span className={`${ELEMENT_TAG}-chat-pending-label`}>
        {room.status === "opening"
          ? "Opening the Scene…"
          : room.status === "closing"
            ? "Saving this Scene…"
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
            <img className={`${ELEMENT_TAG}-chat-scene-backdrop`} src={picture} alt="" />
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
        <span className={`${ELEMENT_TAG}-room-place`}>{room.placeName}</span>
        <span ref={actionsRef} className={`${ELEMENT_TAG}-chat-actions`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-room-actions-trigger`}
            onClick={() => setActionsOpen((value) => !value)}
            aria-label="Venue actions"
            aria-haspopup="menu"
            aria-expanded={actionsOpen}
          >
            ···
          </button>
          {actionsOpen ? (
            <span className={`${ELEMENT_TAG}-room-actions-menu`} role="menu" aria-label="Venue actions">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  onViewVenue();
                }}
                disabled={busy}
              >
                View Venue
              </button>
              {onUseMailbox ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onUseMailbox();
                  }}
                >
                  View Mailbox
                </button>
              ) : null}
              {onProjects ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onProjects();
                  }}
                >
                  Projects
                </button>
              ) : null}
              {onProposals ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onProposals();
                  }}
                >
                  Proposals
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  setSettingsOpen(true);
                }}
              >
                Scene settings
              </button>
              {onEnterPrivate ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onEnterPrivate();
                  }}
                  disabled={busy}
                >
                  Move to {privateSpaceOwnerName ?? "private space"}
                </button>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  onEnd();
                }}
                disabled={busy}
              >
                {ended ? "Return to map" : "End Scene now"}
              </button>

              {debugDiscardEnabled && room.status !== "closed" ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onDebugDiscard();
                  }}
                  disabled={busy}
                >
                  DEBUG: Discard Scene
                </button>
              ) : null}
            </span>
          ) : null}
        </span>
      </div>
      {settingsOpen ? (
        <div
          className={ELEMENT_TAG + "-scene-settings-backdrop"}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSettingsOpen(false);
              actionsRef.current?.querySelector("button")?.focus();
            }
          }}
        >
          <div
            ref={settingsRef}
            role="dialog"
            aria-modal="true"
            aria-label="Scene settings"
            tabIndex={-1}
            className={ELEMENT_TAG + "-scene-settings"}
            onKeyDown={(event) => {
              if (event.key === "Escape" && !event.defaultPrevented) {
                event.stopPropagation();
                setSettingsOpen(false);
                actionsRef.current?.querySelector("button")?.focus();
              }
              if (event.key === "Tab") {
                const controls = event.currentTarget.querySelectorAll<HTMLElement>(
                  "button:not(:disabled), input:not(:disabled), [tabindex='0']",
                );
                const first = controls[0];
                const last = controls[controls.length - 1];
                if (
                  event.shiftKey &&
                  (document.activeElement === first || document.activeElement === event.currentTarget)
                ) {
                  event.preventDefault();
                  last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                  event.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <div className={ELEMENT_TAG + "-scene-settings-head"}>
              <h2>Scene settings</h2>
              <button
                type="button"
                aria-label="Close Scene settings"
                onClick={() => {
                  setSettingsOpen(false);
                  actionsRef.current?.querySelector("button")?.focus();
                }}
              >
                ×
              </button>
            </div>
            <p className={ELEMENT_TAG + "-hint"} role="status">
              Changes and Wish updates are saved during replies. Ending the Scene does not run another review. See saved
              changes below for pending or failed work.
            </p>
            {sceneSettings}
          </div>
        </div>
      ) : null}
      {room.area === "outside" ? (
        <p className={`${ELEMENT_TAG}-hint`} role="status">
          {room.spaceClass === "residence"
            ? "You’re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like."
            : "You’re outside this Venue. You can speak in your own words, or leave whenever you like."}
        </p>
      ) : null}
      {changeStatus && (changeStatus.pending > 0 || changeStatus.failed > 0 || changeStatus.rejected > 0) ? (
        <details className={`${ELEMENT_TAG}-saved-change-status`} role="status" aria-label="Saved change status">
          <summary>
            {changeStatus.pending > 0 ? "Some changes are still being checked. " : ""}
            {changeStatus.failed > 0 ? "Some saved changes need attention. " : ""}
            {changeStatus.rejected > 0 ? "Some proposals lacked valid evidence. " : ""}
          </summary>
          <div style={{ maxHeight: "9rem", overflow: "auto" }}>
            {changeStatus.failed > 0 && onReplayChanges ? (
              <button type="button" onClick={onReplayChanges}>
                Replay saved work · no model request
              </button>
            ) : null}
            {(unresolvedChanges ?? [])
              .filter((change) => ["memories", "relationships", "wishes"].includes(change.domain))
              .map((change) => (
                <div key={change.submissionId + change.domain}>
                  <p>
                    {change.domain}:{" "}
                    {change.reason ?? "Saved changes need attention. Replay saved work or inspect saved diagnostics."}
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onRetryChangeInterpretation?.(
                        change.submissionId,
                        change.domain as "memories" | "relationships" | "wishes",
                      )
                    }
                  >
                    Retry {change.domain} interpretation · may use model requests
                  </button>
                </div>
              ))}
          </div>
        </details>
      ) : null}
      {notices.length > 0 ? (
        <div className={`${ELEMENT_TAG}-room-notices`} aria-live="polite">
          <button
            type="button"
            className={`${ELEMENT_TAG}-room-notices-trigger`}
            onClick={() => setNoticesOpen((value) => !value)}
            aria-expanded={noticesOpen}
            aria-label={`${notices.length} village ${notices.length === 1 ? "notice" : "notices"}`}
          >
            ✦ {notices.length}
          </button>
          {noticesOpen ? (
            <div className={`${ELEMENT_TAG}-room-stars`} aria-live="polite" aria-label="Village events">
              {notices.map((notice) => (
                <div key={notice.id} className={`${ELEMENT_TAG}-room-star`}>
                  <span aria-hidden="true">{roomNoticeIcon(notice.kind)}</span>
                  {(notice.kind === "memory" ||
                    notice.kind === "wish" ||
                    notice.kind === "relationship-up" ||
                    notice.kind === "relationship-down") &&
                  notice.detail ? (
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
      <div className={`${ELEMENT_TAG}-chat-stage`} aria-hidden="true">
        <div
          className={`${ELEMENT_TAG}-chat-cast`}
          data-staging={room.stagingVersion === 1 ? "true" : "false"}
          data-animate={animateStaging ? "true" : "false"}
        >
          {displayed.map((villager, index) => {
            const sprite = sprites[villager.characterId];
            const isSpeaker = villager.characterId === speaker?.characterId;
            const mobileSlot = mobileLayout[villager.characterId];
            const aside = step?.asides.find((item) => item.speakerId === villager.characterId);
            const slot = room.stagingVersion === 1 ? stageLayout[villager.characterId] : undefined;
            const wanted = slot
              ? stagingState[villager.characterId].expression
              : isSpeaker
                ? (step?.expression ?? "")
                : (aside?.expression ?? "");
            const gazeAt = isSpeaker
              ? step?.gazeAt
              : (aside?.gazeAt ?? (villager.characterId === step?.gazeAt ? speaker?.characterId : undefined));
            const targetIndex = displayed.findIndex((person) => person.characterId === gazeAt);
            const facing =
              (slot ? (mobile ? mobileSlot?.facing : slot.facing) : undefined) ?? spriteFacing(index, targetIndex);
            const selected = selectSpriteImage(
              (sprite?.images ?? []).filter((image) => !failedSpriteUrls.has(image.url)),
              wanted,
              facing,
            );
            return (
              <div
                key={villager.characterId}
                className={`${ELEMENT_TAG}-chat-cast-person`}
                data-active={isSpeaker && (!mobile || register !== "narration") ? "true" : "false"}
                data-sprite={selected ? "true" : "false"}
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
                {selected ? (
                  <CardFlipSprite
                    key={room.id}
                    url={selected.image.url}
                    facing={facing}
                    mirrored={selected.mirrored}
                    view={selected.image.view}
                    framing={sprite?.framing.mode ?? "full"}
                    enabled={spriteCardFlipEnabled}
                    animate={animateStaging}
                    stepKey={room.id + ":" + at}
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
                <AvatarFace
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

      {dialogueHidden ? (
        <button
          type="button"
          className={ELEMENT_TAG + "-dialogue-restore"}
          onClick={() => {
            setDialogueHidden(false);
            window.requestAnimationFrame(() => readingRef.current?.focus());
          }}
        >
          Show dialogue
        </button>
      ) : null}
      <div className={`${ELEMENT_TAG}-chat-vn`} data-dialogue-hidden={dialogueHidden ? "true" : "false"}>
        <button
          type="button"
          className={ELEMENT_TAG + "-dialogue-hide"}
          onClick={() => {
            composerRef.current?.blur();
            setDialogueHidden(true);
            setModeMenuOpen(false);
            window.requestAnimationFrame(() =>
              document.querySelector<HTMLButtonElement>(`.${ELEMENT_TAG}-dialogue-restore`)?.focus(),
            );
          }}
        >
          Hide dialogue
        </button>
        {room.lines.length > 0 ? (
          <div className={ELEMENT_TAG + "-chat-tab"}>
            <button
              ref={historyTriggerRef}
              type="button"
              className={ELEMENT_TAG + "-chat-history-toggle"}
              aria-label={historyOpen ? "Hide history" : "History"}
              aria-expanded={historyOpen}
              title={historyOpen ? "Return to Visual Novel" : "Show chat history"}
              onClick={() => setHistoryOpen((value) => !value)}
            >
              <SceneControlIcon name={historyOpen ? "down" : "up"} />
            </button>
          </div>
        ) : null}
        {historyOpen ? (
          <div
            ref={historyRef}
            className={`${ELEMENT_TAG}-chat-log`}
            role="log"
            aria-label="Scene history"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              setHistoryOpen(false);
              window.requestAnimationFrame(() => historyTriggerRef.current?.focus());
            }}
          >
            {room.lines.map((line, index) => (
              <p key={line.id ?? index} className={`${ELEMENT_TAG}-chat-vn-text`}>
                <strong
                  style={line.role === "assistant" && line.kind !== "narration" ? nameStyle(line.speakerId) : undefined}
                >
                  {line.role === "user"
                    ? playerName
                    : line.kind === "narration" || line.speakerId === "__venue_scene__"
                      ? "Narration"
                      : line.name || "Resident"}
                  {line.kind === "side" ? " · aside" : line.kind === "whisper" ? " · whisper" : ""}:{" "}
                  {line.viaDoorway ? "Through the doorway · " : ""}
                </strong>
                <span
                  style={
                    line.role === "assistant" && line.kind !== "narration" ? speechStyle(line.speakerId) : undefined
                  }
                >
                  {renderVillagesMarkdown(line.content, `history-${index}-`)}
                </span>
              </p>
            ))}
          </div>
        ) : null}
        {step && step.asides.length > 0 ? (
          <SceneAsides
            asides={step.asides}
            mobile={mobile}
            positions={mobile ? mobileLayout : stageLayout}
            mainSpeakerId={step.speakerId}
            desktopSide={asideSide}
            renderAside={(aside, index) => (
              <div
                key={`${index}-${aside.register}`}
                className={`${ELEMENT_TAG}-chat-vn-aside`}
                data-register={aside.register}
              >
                <AvatarFace
                  portrait={aside.speakerId ? portraits[aside.speakerId] : speakerPortrait}
                  name={aside.name ?? step.name}
                  glyph={step.player ? "person" : "initial"}
                  className={`${ELEMENT_TAG}-chat-vn-aside-face`}
                />
                <div className={`${ELEMENT_TAG}-chat-vn-aside-column`}>
                  <p className={`${ELEMENT_TAG}-chat-vn-aside-head`}>
                    <span className={`${ELEMENT_TAG}-chat-vn-aside-icon`}>
                      {aside.register === "whisper" ? "🤫" : "💬"}
                    </span>
                    <span
                      className={`${ELEMENT_TAG}-chat-vn-aside-name`}
                      style={nameStyle(aside.speakerId ?? step.speakerId)}
                    >
                      {aside.name ?? step.name}
                    </span>
                    {aside.register === "whisper" && aside.target ? (
                      <span className={`${ELEMENT_TAG}-chat-vn-aside-target`}>{`→ ${aside.target}`}</span>
                    ) : null}
                  </p>
                  <p
                    className={`${ELEMENT_TAG}-chat-vn-aside-text`}
                    style={speechStyle(aside.speakerId ?? step.speakerId)}
                  >
                    {renderVillagesMarkdown(aside.text, `vn-aside-${index}-`)}
                  </p>
                </div>
              </div>
            )}
          />
        ) : null}

        {/* One readable paragraph shares the same dock with navigation and the composer at the latest paragraph. */}
        <div className={`${ELEMENT_TAG}-chat-vn-card`} data-register={register} hidden={historyOpen}>
          <div className={`${ELEMENT_TAG}-chat-vn-row`}>
            {register === "narration" ? (
              <div className={ELEMENT_TAG + "-chat-vn-portrait"} aria-hidden="true">
                <SceneControlIcon name="narrator" />
              </div>
            ) : (
              <AvatarFace
                portrait={speakerPortrait}
                name={step?.name ?? playerName}
                glyph={step?.player ? "person" : "initial"}
                className={ELEMENT_TAG + "-chat-vn-portrait"}
              />
            )}
            <div className={`${ELEMENT_TAG}-chat-vn-column`}>
              {register === "narration" ? (
                <p className={`${ELEMENT_TAG}-chat-vn-label`}>Narration</p>
              ) : (
                <p
                  className={`${ELEMENT_TAG}-chat-vn-name`}
                  style={step?.player ? undefined : nameStyle(step?.speakerId ?? "")}
                >
                  {step?.name ?? ""}
                  {room.lines.some(
                    (line) =>
                      line.viaDoorway && line.speakerId === step?.speakerId && line.content.includes(step?.text ?? ""),
                  )
                    ? room.lines.find(
                        (line) => line.speakerId === step?.speakerId && line.content.includes(step?.text ?? ""),
                      )?.remoteDelivery === "device"
                      ? " · over the intercom"
                      : room.lines.find(
                            (line) => line.speakerId === step?.speakerId && line.content.includes(step?.text ?? ""),
                          )?.remoteDelivery === "loud"
                        ? " · calling from inside"
                        : " · through the doorway"
                    : ""}
                </p>
              )}
              <div
                ref={readingRef}
                className={`${ELEMENT_TAG}-chat-vn-reading`}
                role="region"
                aria-label="Current paragraph"
                aria-live="polite"
                tabIndex={0}
              >
                {step ? (
                  register === "narration" ? (
                    <p className={`${ELEMENT_TAG}-chat-vn-beat`} data-register="narration">
                      {drawVillagesNodes(readingPages.nodes, "vn-beat-")}
                    </p>
                  ) : (
                    <p
                      className={`${ELEMENT_TAG}-chat-vn-text`}
                      style={step.player ? undefined : speechStyle(step.speakerId)}
                    >
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
                {!ended && busy ? waiting : null}
              </div>
            </div>
          </div>
          <div className={`${ELEMENT_TAG}-room-panel-tools`}>
            <span className={`${ELEMENT_TAG}-chat-vn-counter`}>
              {mobile
                ? mobileReadingCounter(at, steps.length, readingPages.index, readingPages.count)
                : `${at + 1} / ${Math.max(1, steps.length)}`}
            </span>
            <span className={`${ELEMENT_TAG}-chat-vn-nav`}>
              <button
                type="button"
                className={`${ELEMENT_TAG}-chat-vn-button`}
                onClick={() => {
                  if (!readingPages.move(-1)) setReadStep(at - 1);
                }}
                disabled={!canReadPrevious}
                aria-label="Previous paragraph"
              >
                ‹ <span>Previous</span>
              </button>
              {!ended || canReadNext ? (
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-chat-vn-button`}
                  onClick={() => {
                    if (!readingPages.move(1)) setReadStep(at + 1);
                  }}
                  disabled={!canReadNext}
                  aria-label="Next paragraph"
                >
                  <span>Next</span> ›
                </button>
              ) : ended ? (
                <button type="button" className={`${ELEMENT_TAG}-chat-vn-button`} onClick={onEnd} disabled={busy}>
                  Return to map
                </button>
              ) : null}
            </span>
          </div>
        </div>
        {error && room.status === "opening" ? (
          <div className={`${ELEMENT_TAG}-room-error`} role="alert">
            <p>{error}</p>
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={onEnd} disabled={busy}>
              Back to map
            </button>
            <button type="button" className={`${ELEMENT_TAG}-button`} onClick={onRetryGreeting} disabled={busy}>
              Retry opening
            </button>
            {room.id ? (
              <button
                type="button"
                className={`${ELEMENT_TAG}-button`}
                onClick={onContinueWithoutGreeting}
                disabled={busy}
              >
                Continue without opening
              </button>
            ) : null}
          </div>
        ) : null}
        {greetingNotice ? (
          <div className={`${ELEMENT_TAG}-room-error`} role="status">
            <p>{greetingNotice}</p>
          </div>
        ) : null}
        {ruling ? <p className={`${ELEMENT_TAG}-empty`}>{ruling}</p> : null}
        {room.status === "closing" ? <p className={ELEMENT_TAG + "-hint"}>Closing this Scene…</p> : null}

        {canCompose && mode === "fulfill" && activeParticipants.length === 0 ? (
          <p className={`${ELEMENT_TAG}-hint`}>Nobody is here whose wish you can fulfill.</p>
        ) : null}
        {canDraft ? (
          <div className={`${ELEMENT_TAG}-composer`}>
            {(room.entryOffers ?? []).map((offer) => (
              <button
                key={offer.zoneId}
                type="button"
                className={`${ELEMENT_TAG}-button`}
                disabled={busy}
                onClick={() => onAcceptEntry(offer.zoneId)}
              >
                Move to {offer.label}
              </button>
            ))}
            {mode === "move" ? (
              <select
                className={`${ELEMENT_TAG}-select`}
                aria-label="Move to Zone"
                value={movementTarget}
                disabled={busy}
                onChange={(event) => onMovementTarget(event.target.value)}
              >
                <option value="">Choose a Zone</option>
                {movementZones
                  .filter((zone) => zone.id !== room.zoneId)
                  .map((zone) => (
                    <option key={zone.id} value={zone.id} disabled={zone.closed}>
                      {zone.label}
                    </option>
                  ))}
              </select>
            ) : null}
            {mode === "contact" ? (
              <div className={`${ELEMENT_TAG}-contact-controls`}>
                <select
                  className={`${ELEMENT_TAG}-select`}
                  aria-label="Contact Zone"
                  value={contactBoundary}
                  disabled={busy}
                  onChange={(event) => onContactBoundary(event.target.value)}
                >
                  <option value="">Choose an adjacent Zone</option>
                  {contactDoors.map((door) => (
                    <option key={door.id} value={door.id}>
                      {door.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {mode === "fulfill" && activeParticipants.length > 0 ? (
              <select
                value={targetId}
                onChange={(event) => onTarget(event.target.value)}
                aria-label="Whose wish you fulfilled"
                disabled={busy || ended || room.status !== "active"}
              >
                <option value="">Choose one villager</option>
                {activeParticipants.map((person) => (
                  <option key={person.characterId} value={person.characterId}>
                    {person.name}
                  </option>
                ))}
              </select>
            ) : null}
            <div className={`${ELEMENT_TAG}-composer-row`}>
              <p className={`${ELEMENT_TAG}-scene-scope`} role="status" data-scene-scope>
                {mode === "contact"
                  ? "Contacting " +
                    (contactDoors.find((door) => door.id === contactBoundary)?.label ?? "an adjacent Zone")
                  : mode === "move"
                    ? "Moving to " + (movementZones.find((zone) => zone.id === movementTarget)?.label ?? "a Zone")
                    : "In " + currentZoneLabel}
              </p>
              <span className={`${ELEMENT_TAG}-chat-input`}>
                <span ref={modeAnchorRef} className={`${ELEMENT_TAG}-room-mode-anchor`}>
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-room-mode-toggle`}
                    onClick={() => setModeMenuOpen((value) => !value)}
                    aria-label={`Mode: ${mode === "conclude" ? "Conclude" : mode === "move" ? "Move" : mode === "contact" ? "Contact" : "Say / Do"}. Choose mode`}
                    aria-haspopup="menu"
                    aria-expanded={modeMenuOpen}
                    title={
                      mode === "chat"
                        ? "Say / Do"
                        : mode === "move"
                          ? "Move"
                          : mode === "contact"
                            ? "Contact"
                            : mode === "fulfill"
                              ? "Fulfill"
                              : "Conclude"
                    }
                  >
                    <SceneControlIcon
                      name={
                        mode === "chat" || mode === "move"
                          ? "chat"
                          : mode === "contact"
                            ? "knock"
                            : mode === "fulfill"
                              ? "fulfill"
                              : "conclude"
                      }
                    />
                  </button>
                  {modeMenuOpen ? (
                    <span className={`${ELEMENT_TAG}-room-mode-menu`} role="menu" aria-label="Scene mode">
                      {(["chat", "move", "contact", "conclude"] as const).map((option) => (
                        <button
                          key={option}
                          type="button"
                          role="menuitemradio"
                          aria-checked={mode === option}
                          disabled={busy || (option === "contact" && contactDoors.length === 0)}
                          onClick={() => {
                            onMode(option);
                            setModeMenuOpen(false);
                          }}
                        >
                          {option === "chat"
                            ? "Say / Do"
                            : option === "move"
                              ? "Move"
                              : option === "contact"
                                ? "Contact"
                                : "Conclude"}
                        </button>
                      ))}
                    </span>
                  ) : null}
                </span>
                {mode !== "move" ? (
                  <textarea
                    ref={composerRef}
                    data-villages-scene-composer
                    className={`${ELEMENT_TAG}-textarea`}
                    rows={1}
                    value={draft}
                    onChange={(event) => onDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (shouldSubmitVenueKey(event.key, event.shiftKey, event.nativeEvent.isComposing, sendOnEnter)) {
                        event.preventDefault();
                        submitComposer();
                      }
                    }}
                    placeholder={
                      mode === "contact"
                        ? "Optional knock, call, or message…"
                        : mode === "fulfill"
                          ? "What did you do for them?"
                          : mode === "conclude"
                            ? "Final line (optional)…"
                            : "Say or do something…"
                    }
                    aria-label={`Message at ${room.placeName}`}
                    disabled={busy || ended || room.status !== "active"}
                  />
                ) : null}
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-chat-send`}
                  onClick={submitComposer}
                  disabled={
                    !canCompose ||
                    busy ||
                    ended ||
                    room.status !== "active" ||
                    (mode !== "conclude" && mode !== "contact" && mode !== "move" && draft.trim().length === 0) ||
                    (mode === "fulfill" && !targetId) ||
                    (mode === "contact" && !contactDoors.some((door) => door.id === contactBoundary)) ||
                    (mode === "move" &&
                      !movementZones.some(
                        (zone) => zone.id === movementTarget && zone.id !== room.zoneId && !zone.closed,
                      ))
                  }
                  aria-label={busy ? "Sending" : "Send"}
                  title={busy ? "Sending" : "Send"}
                >
                  <SceneControlIcon name={busy ? "sending" : "send"} />
                </button>
              </span>
            </div>
          </div>
        ) : null}
        {error && room.status !== "opening" ? (
          <div className={`${ELEMENT_TAG}-room-error`} role="alert">
            <p>{error}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
