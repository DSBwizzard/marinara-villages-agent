import { useEffect, useRef, useState } from "react";
import type { ReturnCatchupView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ModalDialog } from "../../shared/ModalDialog.js";

export function ReturnCatchup({ enabled, onSettled }: { enabled: boolean; onSettled: () => Promise<void> }) {
  const [batch, setBatch] = useState<ReturnCatchupView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const retryId = useRef("");
  const previous = useRef(false);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const { batch: next } = await request<{ batch: ReturnCatchupView | null }>("/background/catchup");
        if (stopped) return;
        const active = !!next && !["completed", "cancelled"].includes(next.status);
        if (previous.current && !active) void onSettled();
        previous.current = active;
        setBatch(active ? next : null);
        setError("");
      } catch (cause) {
        if (!stopped) setError(messageFrom(cause, "Could not check Village catch-up."));
      } finally {
        if (!stopped) timer = setTimeout(() => void poll(), 3000);
      }
    };
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [enabled, onSettled]);
  const act = async (kind: "retry" | "continue") => {
    if (!batch) return;
    setBusy(true);
    setError("");
    try {
      if (kind === "retry") retryId.current ||= createVillagesClientId();
      const { batch: next } = await request<{ batch: ReturnCatchupView | null }>(`/background/catchup/${kind}`, {
        method: "POST",
        body: JSON.stringify({ batchId: batch.id, ...(kind === "retry" ? { actionId: retryId.current } : {}) }),
      });
      retryId.current = "";
      setBatch(next && !["completed", "cancelled"].includes(next.status) ? next : null);
      if (!next || ["completed", "cancelled"].includes(next.status)) await onSettled();
    } catch (cause) {
      setError(messageFrom(cause, "Could not update Village catch-up."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div ref={host}>
      <style>{`
        dialog.villages-catchup-card[data-headerless="true"] { width:min(23rem,calc(100% - 2rem)); max-height:calc(100% - 2rem); padding:1.4rem; gap:.8rem; text-align:center; background:linear-gradient(145deg,#25304e,#14213c); box-shadow:0 1rem 4rem #0005; }
        .villages-catchup-card h2 { margin:0; font-size:1.25rem; }
        .villages-catchup-icon { display:grid; place-items:center; width:3.5rem; height:3.5rem; margin:auto; border-radius:50%; background:#c3b3ff22; font-size:2rem; }
        .villages-catchup-card progress { width:100%; accent-color:#b7a2ff; }
        .villages-catchup-card small { color:#bdc8e2; line-height:1.4; }
        .villages-catchup-card .villages-zone-map-actions { display:flex; gap:.5rem; flex-wrap:wrap; }
      `}</style>
      {enabled && (batch || error) ? (
        <ModalDialog
          title="Welcome back"
          scope={host.current?.parentElement ?? undefined}
          onClose={() => void 0}
          dismissible={false}
          showCloseButton={false}
          headerless
          compact
          className="villages-catchup-card"
        >
          <span className="villages-catchup-icon" aria-hidden="true">
            🏡
          </span>
          <h2>Welcome back</h2>
          <p role="status">
            {!batch
              ? "Checking your Village…"
              : batch.status === "failed"
                ? "Catch-up paused"
                : "Catching up with Village life…"}
          </p>
          {batch ? (
            <>
              <progress aria-label="Village catch-up" value={batch.completed} max={Math.max(1, batch.total)} />
              <small>
                {batch.completed} of {batch.total} complete
              </small>
              {batch.issue ? (
                <p>
                  {batch.issue === "authority"
                    ? "The Village changed. Continue to skip this period."
                    : batch.issue === "preparation"
                      ? "Catch-up could not get started."
                      : batch.issue === "generation"
                        ? "An activity request could not finish."
                        : "An activity request could not finish."}
                </p>
              ) : null}
              {batch.issue === "generation" ? (
                <small>Retry may make an additional model request and incur a cost.</small>
              ) : null}
            </>
          ) : (
            <small>Checking again automatically.</small>
          )}
          {error ? <p role="alert">{error}</p> : null}
          {batch ? (
            <div className="villages-zone-map-actions">
              {batch.status === "failed" && batch.issue !== "authority" ? (
                <button type="button" disabled={busy} onClick={() => void act("retry")}>
                  {busy ? "Retrying…" : "Retry"}
                </button>
              ) : null}
              <button type="button" disabled={busy} onClick={() => void act("continue")}>
                Continue to Village
              </button>
            </div>
          ) : null}
        </ModalDialog>
      ) : null}
    </div>
  );
}
