import { useEffect, useRef, useState } from "react";
import type { ReturnCatchupView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { createVillagesClientId } from "../../shared/request-id.js";

export function ReturnCatchup({ enabled, onSettled }: { enabled: boolean; onSettled: () => Promise<void> }) {
  const [batch, setBatch] = useState<ReturnCatchupView | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const retryId = useRef("");
  const previous = useRef(false);
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
  if (!enabled || (!batch && !error)) return null;
  if (!batch)
    return (
      <div
        role="alert"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1000,
          background: "var(--background, #fff)",
          color: "var(--foreground, #222)",
          padding: "1rem",
        }}
      >
        <p>{error}</p>
        <p>Checking again automatically.</p>
      </div>
    );
  const act = async (kind: "retry" | "continue") => {
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
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Returning to the Village"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1000,
        background: "var(--background, #fff)",
        color: "var(--foreground, #222)",
        overflow: "auto",
        display: "grid",
        placeItems: "center",
        padding: "1rem",
      }}
    >
      <section role="status">
        <h2>Returning to the Village</h2>
        <p>
          {batch.status === "recovering"
            ? "Finishing an earlier event before play can resume."
            : batch.status === "failed"
              ? "Catch-up needs your attention."
              : "Residents are catching up."}
        </p>
        <p>
          {batch.completed} of {batch.total} complete
        </p>
        {batch.issue ? (
          <p>
            {batch.issue === "authority"
              ? "The Village changed while its absence was being checked. Continue to skip this unverified period."
              : batch.issue === "generation"
                ? "The resident activity request did not finish."
                : batch.issue === "interpretation"
                  ? "The encounter's meaning needs another interpretation."
                  : "The saved encounter could not finish settling."}
          </p>
        ) : null}
        {(batch.status === "failed" || batch.status === "recovering") && batch.issue !== "authority" ? (
          <p>Retry may make an additional model request and incur a cost.</p>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
        {(batch.status === "failed" || batch.status === "recovering") && batch.issue !== "authority" ? (
          <button type="button" disabled={busy} onClick={() => void act("retry")}>
            Retry
          </button>
        ) : null}
        {!batch.settlementRequired ? (
          <button type="button" disabled={busy} onClick={() => void act("continue")}>
            Continue to Village
          </button>
        ) : null}
      </section>
    </div>
  );
}
