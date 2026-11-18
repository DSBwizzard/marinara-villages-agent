import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { SceneView } from "../../../shared/contracts/village.js";
import { recordTurnTiming } from "../../shared/turn-timing.js";
import { refreshSceneAfterFailure } from "./ScenePanel.js";
import { hasPublishedRoomSubmission } from "./villages-room-reading.js";
import { request } from "../../shared/api.js";
import type { RoomOperation } from "../../../shared/contracts/village.js";
import type { SceneFailure } from "./scene-error-report.js";

type Pending = {
  sceneId: string;
  submissionId: string;
  text: string;
  started: number;
  editVersion: number;
  changed?: boolean;
  failure?: string;
  trace?: SceneFailure["trace"];
};

export function sceneSubmissionText(operation: RoomOperation | null, submissionId: string): string | undefined {
  if (operation?.id === submissionId) return operation.submittedMessage ?? operation.input?.message;
}
function writeSession(key: string, text: string) {
  if (!key) return;
  try {
    if (text) sessionStorage.setItem(key, text);
    else sessionStorage.removeItem(key);
  } catch {
    // Drafts remain editable when browser storage is unavailable.
  }
}
function readSession(key: string) {
  try {
    return key ? sessionStorage.getItem(key) : null;
  } catch {
    return null;
  }
}
function readSceneDraft(key: string): { text: string; editVersion: number } | null {
  try {
    const saved = JSON.parse(readSession(key) ?? "null");
    return typeof saved?.text === "string" && Number.isSafeInteger(saved.editVersion) ? saved : null;
  } catch {
    return null;
  }
}
function recoveryMessage(pending: Pending, message: string) {
  return [message, pending.failure, `Request: ${pending.submissionId}`].filter(Boolean).join("\n\n");
}
/** Read-only reconciliation. A lost transport never authorizes another turn. */
export function useTurnRecovery(ports: {
  visible?: boolean;
  worldScope?: string;
  draft?: string;
  room: SceneView;
  setRoom: React.Dispatch<React.SetStateAction<SceneView>>;
  setRoomEnded: React.Dispatch<React.SetStateAction<boolean>>;
  setRoomError: React.Dispatch<React.SetStateAction<string | SceneFailure>>;
  setRoomDraft: React.Dispatch<React.SetStateAction<string>>;
  submission: React.RefObject<string | null>;
  editVersion?: React.RefObject<number>;
  receiveRoomRecordEvents?: (events: readonly import("../../../shared/contracts/village.js").RoomRecordEvent[]) => void;
  refreshSnapshot?: () => void;
}) {
  const { editVersion, setRoomDraft } = ports;
  const sceneId = ports.room?.id;
  const [pending, setPending] = useState<Pending | null>(null);
  const [status, setStatus] = useState("");
  const key = ports.worldScope && ports.room?.id ? `villages:scene:${ports.worldScope}:${ports.room.id}` : "";
  const attemptKey = key ? key + ":send" : "";
  const latest = useRef(ports);
  const owner = useRef<object>({});
  const reading = useRef<object | null>(null);
  const queued = useRef<object | null>(null);
  const draftKey = useRef("");
  useEffect(() => {
    latest.current = ports;
  });
  useLayoutEffect(() => {
    owner.current = {};
    const draft = readSceneDraft(key);
    let saved: Pending | null = null;
    try {
      saved = JSON.parse(readSession(attemptKey) ?? "null");
    } catch {
      // The server can still recover admitted work.
    }
    if (saved?.sceneId !== sceneId || typeof saved?.text !== "string" || typeof saved.submissionId !== "string")
      saved = null;
    if (editVersion) editVersion.current = draft?.editVersion ?? saved?.editVersion ?? 0;
    if (draft) {
      setRoomDraft(saved?.editVersion === draft.editVersion && saved.text === draft.text ? "" : draft.text);
    }
    setPending(saved);
    setStatus(saved ? recoveryMessage(saved, "Reconnecting to check your saved reply…") : "");
    return () => {
      owner.current = {};
    };
  }, [sceneId, key, attemptKey, setRoomDraft, editVersion]);
  useLayoutEffect(() => {
    if (draftKey.current !== key) {
      draftKey.current = key;
      return;
    }
    if (ports.draft !== undefined)
      writeSession(key, JSON.stringify({ text: ports.draft, editVersion: ports.editVersion?.current ?? 0 }));
  }, [key, ports.draft, ports.editVersion]);
  const finish = useCallback(() => {
    owner.current = {};
    writeSession(attemptKey, "");
    setPending(null);
    setStatus("");
  }, [attemptKey]);
  const track = useCallback((attempt: Pending) => writeSession(attemptKey, JSON.stringify(attempt)), [attemptKey]);
  const begin = useCallback(
    (
      submissionId: string,
      text: string,
      editVersion: number,
      failure?: string,
      changed?: boolean,
      trace?: SceneFailure["trace"],
    ) => {
      recordTurnTiming(latest.current.room.id, submissionId, "recoveryStarted");
      const attempt = {
        sceneId: latest.current.room.id,
        submissionId,
        text,
        editVersion,
        started: Date.now(),
        failure,
        changed,
        trace,
      };
      track({ ...attempt, failure: undefined });
      owner.current = {};
      setPending(attempt);
      setStatus(recoveryMessage(attempt, "Reconnecting to check your saved reply…"));
    },
    [track],
  );
  const check = useCallback(
    async function reconcile() {
      const token = owner.current;
      if (!pending || latest.current.room?.id !== pending.sceneId) return;
      const restoreDraft = () => {
        if (!latest.current.editVersion || latest.current.editVersion.current === pending.editVersion)
          latest.current.setRoomDraft((current) => current || pending.text);
      };
      const reportFailure = (message: string) =>
        latest.current.setRoomError(pending.trace ? { message, trace: pending.trace } : message);
      if (reading.current === token) {
        queued.current = token;
        return;
      }
      queued.current = null;
      reading.current = token;
      const owns = () => owner.current === token && latest.current.room?.id === pending.sceneId;
      const scene = await refreshSceneAfterFailure(pending.sceneId, pending.submissionId, owns);
      if (!owns()) return;
      const { operation } = await request<{ operation: RoomOperation | null }>(
        `/rooms/${encodeURIComponent(pending.sceneId)}/operations/${encodeURIComponent(pending.submissionId)}`,
        { signal: AbortSignal.timeout(5_000) },
      ).catch(() => ({ operation: null }));
      if (reading.current === token) reading.current = null;
      if (!owns()) return;
      if (operation?.id === pending.submissionId && operation.terminal && operation.status === "complete") {
        recordTurnTiming(pending.sceneId, pending.submissionId, "recovered");
        latest.current.receiveRoomRecordEvents?.(operation.recordEvents ?? []);
        latest.current.refreshSnapshot?.();
        latest.current.setRoom((current) =>
          current?.id === pending.sceneId ? { ...current, status: "closed" } : current,
        );
        latest.current.setRoomEnded(true);
        latest.current.setRoomError("The Scene ended. Your turn completed, but the reply text is no longer available.");
        if (latest.current.submission.current === pending.submissionId) latest.current.submission.current = null;
        finish();
        return;
      }
      if (operation?.id === pending.submissionId && operation.terminal && operation.status === "interrupted") {
        latest.current.setRoom((current) =>
          current?.id === pending.sceneId ? { ...current, status: "closed" } : current,
        );
        latest.current.setRoomEnded(true);
        reportFailure(operation.error || "The Scene ended, but the request outcome is unavailable.");
        finish();
        return;
      }
      const acceptedText = sceneSubmissionText(operation, pending.submissionId);
      if (
        (!pending.changed || acceptedText !== undefined) &&
        (hasPublishedRoomSubmission(scene, pending.submissionId) ||
          (scene && operation?.id === pending.submissionId && operation.committed && operation.replyReady))
      ) {
        recordTurnTiming(pending.sceneId, pending.submissionId, "recovered");
        latest.current.setRoom(scene);
        latest.current.setRoomEnded(scene.status === "closed");
        latest.current.setRoomError("");
        if (pending.changed && acceptedText !== pending.text) {
          restoreDraft();
          reportFailure("An earlier version of this message went through.");
        }
        if (latest.current.submission.current === pending.submissionId) latest.current.submission.current = null;
        finish();
        return;
      }
      if (
        operation?.id === pending.submissionId &&
        (operation.acceptance === "abandoned" ||
          operation.status === "interrupted" ||
          (operation.status === "complete" && !!operation.error))
      ) {
        latest.current.setRoom((current) => {
          const view = scene ?? current;
          return view?.id === pending.sceneId &&
            view.operation?.id === operation.id &&
            view.operation.attemptId === operation.attemptId
            ? { ...view, operation }
            : view;
        });
        if (latest.current.submission.current === pending.submissionId) latest.current.submission.current = null;
        restoreDraft();
        reportFailure(
          operation.error ||
            (operation.acceptance === "abandoned" ? "The saved request was replaced." : "Your message did not finish."),
        );
        finish();
        return;
      }
      if (scene) latest.current.setRoom(scene);
      setStatus(
        recoveryMessage(
          pending,
          Date.now() - pending.started >= 60_000
            ? "Reply outcome unknown. Check the saved reply or send again."
            : scene?.operation?.id === pending.submissionId && scene.operation.status === "running"
              ? "Your reply is still processing. Checking saved progress…"
              : "Reconnecting to check your saved reply…",
        ),
      );
      if (queued.current === token) {
        queued.current = null;
        void reconcile();
      }
    },
    [pending, finish],
  );
  useEffect(() => {
    if (!pending || ports.visible === false) return;
    const poll = () => {
      if (document.hidden) return;
      if (Date.now() - pending.started < 60_000 || latest.current.room?.operation?.status === "running") void check();
      else setStatus(recoveryMessage(pending, "Reply outcome unknown. Check the saved reply or send again."));
    };
    const resume = () => {
      if (!document.hidden) void check();
    };
    // Returning after the automatic recovery window still retrieves the saved outcome once.
    void check();
    const timer = window.setInterval(poll, 1500);
    window.addEventListener("online", resume);
    window.addEventListener("focus", resume);
    document.addEventListener("visibilitychange", resume);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("online", resume);
      window.removeEventListener("focus", resume);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [pending, check, ports.visible]);
  return {
    begin,
    finish,
    track,
    status,
    check,
    attempt: pending?.sceneId === ports.room?.id ? pending : null,
    pending: !!pending && pending.sceneId === ports.room?.id,
  };
}
