import { useCallback, useEffect, useRef, useState } from "react";
import type { SceneView } from "../../../shared/contracts/village.js";
import { recordTurnTiming } from "../../shared/turn-timing.js";
import { refreshSceneAfterFailure } from "./ScenePanel.js";
import { request } from "../../shared/api.js";
import type { RoomOperation } from "../../../shared/contracts/village.js";
import { OCCUPANCY_UNAVAILABLE_MESSAGE } from "../../../shared/contracts/scene-turn-outcome.js";

type Pending = {
  sceneId: string;
  submissionId: string;
  text: string;
  started: number;
  editVersion: number;
  failure?: string;
};
function recoveryMessage(pending: Pending, message: string) {
  return [message, pending.failure, `Request: ${pending.submissionId}`].filter(Boolean).join("\n\n");
}
/** Read-only reconciliation. A lost transport never authorizes another turn. */
export function useTurnRecovery(ports: {
  room: SceneView;
  setRoom: React.Dispatch<React.SetStateAction<SceneView>>;
  setRoomEnded: React.Dispatch<React.SetStateAction<boolean>>;
  setRoomError: React.Dispatch<React.SetStateAction<string>>;
  setRoomDraft: React.Dispatch<React.SetStateAction<string>>;
  submission: React.RefObject<string | null>;
  editVersion?: React.RefObject<number>;
  setRoomRuling?: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [pending, setPending] = useState<Pending | null>(null);
  const [status, setStatus] = useState("");
  const latest = useRef(ports);
  const owner = useRef<object>({});
  const reading = useRef<object | null>(null);
  const queued = useRef<object | null>(null);
  useEffect(() => {
    latest.current = ports;
  });
  useEffect(() => {
    owner.current = {};
    setPending(null);
    setStatus("");
    return () => {
      owner.current = {};
    };
  }, [ports.room?.id]);
  const begin = useCallback((submissionId: string, text: string, editVersion: number, failure?: string) => {
    recordTurnTiming(latest.current.room.id, submissionId, "recoveryStarted");
    const attempt = { sceneId: latest.current.room.id, submissionId, text, editVersion, started: Date.now(), failure };
    setPending(attempt);
    setStatus(recoveryMessage(attempt, "Reconnecting to check your saved reply…"));
  }, []);
  const check = useCallback(
    async function reconcile() {
      const token = owner.current;
      if (!pending || latest.current.room?.id !== pending.sceneId) return;
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
      ).catch(() => ({ operation: null }));
      if (reading.current === token) reading.current = null;
      if (!owns()) return;
      if (operation?.id === pending.submissionId && operation.turnOutcome === "occupancy-unavailable") {
        if (scene) latest.current.setRoom(scene);
        latest.current.setRoomError("");
        if (!latest.current.editVersion || latest.current.editVersion.current === pending.editVersion) {
          latest.current.setRoomDraft(pending.text);
          latest.current.setRoomRuling?.(OCCUPANCY_UNAVAILABLE_MESSAGE);
        }
        if (latest.current.submission.current === pending.submissionId) latest.current.submission.current = null;
        setPending(null);
        setStatus("");
        return;
      }
      if (scene?.submissions?.some((entry) => entry.id === pending.submissionId)) {
        recordTurnTiming(pending.sceneId, pending.submissionId, "recovered");
        latest.current.setRoom(scene);
        latest.current.setRoomEnded(scene.status === "closed");
        latest.current.setRoomError("");
        if (!latest.current.editVersion || latest.current.editVersion.current === pending.editVersion)
          latest.current.setRoomDraft((current) => (current === pending.text ? "" : current));
        if (latest.current.submission.current === pending.submissionId) latest.current.submission.current = null;
        setPending(null);
        setStatus("");
        return;
      }
      if (
        scene?.operation?.id === pending.submissionId &&
        (scene.operation.status === "interrupted" || (scene.operation.status === "complete" && !!scene.operation.error))
      ) {
        latest.current.setRoom(scene);
        latest.current.setRoomError(scene.operation.error || "The saved request needs an explicit retry.");
        setPending(null);
        setStatus("");
        return;
      }
      if (
        scene?.attentionClarification?.id === pending.submissionId &&
        scene.attentionClarification.message === pending.text
      ) {
        latest.current.setRoom(scene);
        latest.current.setRoomError("");
        if (latest.current.submission.current === pending.submissionId) latest.current.submission.current = null;
        setPending(null);
        setStatus("");
        return;
      }
      if (scene) latest.current.setRoom(scene);
      setStatus(
        recoveryMessage(
          pending,
          Date.now() - pending.started >= 60_000
            ? "Reply outcome unknown. Check the saved reply before sending again."
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
    [pending],
  );
  useEffect(() => {
    if (!pending) return;
    const poll = () => {
      if (document.hidden) return;
      if (Date.now() - pending.started < 60_000) void check();
      else setStatus(recoveryMessage(pending, "Reply outcome unknown. Check the saved reply before sending again."));
    };
    const resume = () => {
      if (!document.hidden) void check();
    };
    poll();
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
  }, [pending, check]);
  return { begin, status, check, pending: pending?.sceneId === ports.room?.id };
}
