import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { AgendaCatchupView, ReturnCatchupView } from "../../../shared/contracts/village.js";
import { messageFrom, request } from "../../shared/api.js";
import { AgendaWaiting } from "../../shared/agenda-access.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { ModalDialog } from "../../shared/ModalDialog.js";

export function ReturnCatchup({
  enabled,
  onSettled,
  onBack,
  menu,
  repair,
  children,
}: {
  enabled: boolean;
  onSettled: () => Promise<void>;
  onBack: () => void;
  menu: boolean;
  repair: boolean;
  children: ReactNode;
}) {
  const [batch, setBatch] = useState<ReturnCatchupView | null>(null);
  const [agenda, setAgenda] = useState<AgendaCatchupView | null>(null);
  const [entryGate, setEntryGate] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const activity = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const detailsId = useId();
  const agendaRetry = useRef<{ key: string; actionId: string } | undefined>(undefined);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const retryId = useRef("");
  const previous = useRef(false);
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let first = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const { batch: next, agenda: plans } = await request<{
          batch: ReturnCatchupView | null;
          agenda?: AgendaCatchupView | null;
        }>("/background/catchup");
        if (stopped) return;
        const active = !!next && !["completed", "cancelled"].includes(next.status);
        const required = !!plans?.expired;
        if (first) {
          setEntryGate(required);
          first = false;
        } else if (!required) setEntryGate(false);
        if (previous.current && !active && !required) void onSettled();
        previous.current = active || required;
        setBatch(active ? next : null);
        setAgenda(plans ?? null);
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
  useEffect(() => {
    if (!expanded || repair) return;
    // Let menu controls finish their click before the expanded panel frees layout space.
    const outsideEvent = menu ? "click" : "pointerdown";
    const outside = (event: Event) => {
      if (activity.current && !event.composedPath().includes(activity.current)) setExpanded(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setExpanded(false);
      trigger.current?.focus();
    };
    document.addEventListener(outsideEvent, outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener(outsideEvent, outside);
      document.removeEventListener("keydown", escape);
    };
  }, [expanded, menu, repair]);
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
  const retryAgenda = async () => {
    const { failure } = agenda ?? {};
    if (!failure) return;
    const key = `${failure.expectedInstanceId}:${failure.expectedAttempt}`;
    if (agendaRetry.current?.key !== key) agendaRetry.current = { key, actionId: createVillagesClientId() };
    setBusy(true);
    setError("");
    try {
      await request("/background/retry", {
        method: "POST",
        body: JSON.stringify({ ...failure, actionId: agendaRetry.current.actionId }),
      });
      agendaRetry.current = undefined;
      setAgenda((current) => (current ? { ...current, failure: undefined } : null));
    } catch (cause) {
      setError(messageFrom(cause, "Could not retry Agenda preparation."));
    } finally {
      setBusy(false);
    }
  };
  const waiting = enabled && !!agenda?.expired;
  const modal = enabled && (!!batch || (waiting && entryGate));
  const plans = agenda ? (
    <>
      <strong>
        {agenda.failure
          ? agenda.failure.name
            ? `${agenda.failure.name}’s Agenda couldn’t be prepared`
            : "Agendas couldn’t be prepared"
          : agenda.expired
            ? "Preparing today’s Agendas"
            : "Preparing next week’s Agendas"}
      </strong>
      <small>{`${agenda.completed} of ${agenda.total} ready`}</small>
      {agenda.failure ? <p role="alert">{agenda.failure.message}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {agenda.failure ? (
        <button type="button" disabled={busy} onClick={() => void retryAgenda()}>
          {agenda.failure.name ? `Retry ${agenda.failure.name}` : "Retry Agendas"}
        </button>
      ) : null}
    </>
  ) : null;
  return (
    <AgendaWaiting value={waiting}>
      {children}
      <div ref={host}>
        <style>{`
        dialog.villages-catchup-card[data-headerless="true"] { width:min(23rem,calc(100% - 2rem)); max-height:calc(100% - 2rem); padding:1.4rem; gap:.8rem; text-align:center; background:linear-gradient(145deg,#25304e,#14213c); box-shadow:0 1rem 4rem #0005; }
        .villages-catchup-card h2 { margin:0; font-size:1.25rem; }
        .villages-catchup-icon { display:grid; place-items:center; width:3.5rem; height:3.5rem; margin:auto; border-radius:50%; background:#c3b3ff22; font-size:2rem; }
        .villages-catchup-card progress { width:100%; accent-color:#b7a2ff; }
        .villages-catchup-card small { color:#bdc8e2; line-height:1.4; }
        .villages-catchup-card .villages-zone-map-actions { display:flex; gap:.5rem; flex-wrap:wrap; }
        .villages-agenda-activity { position:absolute; z-index:25; top:7.25rem; left:.875rem; color:#f0dfbc; font:14px/1.4 system-ui,sans-serif; }
        .villages-agenda-activity[data-menu] { top:.875rem; }
        .villages-frame:has(.villages-agenda-activity[data-menu]) .${ELEMENT_TAG}-desk-workspace[data-desk]:not([data-desk="none"]) {
          padding-top:4.75rem;
        }
        .villages-frame:has(.villages-agenda-activity[data-menu][data-failed] .villages-agenda-details) .${ELEMENT_TAG}-desk-workspace[data-desk]:not([data-desk="none"]) {
          padding-top:10rem;
        }
        .villages-agenda-activity .villages-agenda-chip { display:grid; place-items:center; width:44px; height:44px; padding:0; border:1px solid #a39b8480; border-radius:.65rem; background:#393047; color:inherit; box-shadow:0 .25rem .75rem #0004; cursor:pointer; }
        .villages-agenda-chip[aria-expanded=true] { border-color:#b6aa95; }
        .villages-agenda-glyph { position:relative; width:24px; height:24px; }
        .villages-agenda-glyph svg { width:22px; height:22px; display:block; }
        .villages-agenda-spinner { position:absolute; right:-1px; bottom:-1px; box-sizing:border-box; width:12px; height:12px; border-radius:50%; border:2px solid #d0c1b350; border-top-color:#d9e6a8; border-right-color:#d9e6a8; background:#393047; box-shadow:0 0 0 2px #393047; animation:villages-agenda-spin .95s linear infinite; }
        @keyframes villages-agenda-spin { to { transform:rotate(360deg); } }
        @media(prefers-reduced-motion:reduce) { .villages-agenda-spinner { animation:none; } }
        .villages-agenda-details { position:absolute; left:0; top:calc(100% + .5rem); box-sizing:border-box; width:max-content; max-width:min(22rem,calc(100vw - 2rem)); display:grid; gap:.3rem; padding:.65rem .85rem; background:#393047; border:1px solid #a39b8480; border-radius:.65rem; box-shadow:0 .75rem 2rem #0005; }
        .villages-agenda-activity[data-menu] .villages-agenda-details {
          left:calc(100% + .5rem);
          top:0;
          max-width:min(22rem,calc(100vw - 5rem));
          max-height:8.5rem;
          overflow:auto;
        }
        .villages-agenda-details small { color:#d0c1b3; }
        .villages-agenda-details p { margin:0; }
        .villages-catchup-read-error { position:absolute; z-index:25; top:7.25rem; left:.875rem; margin:0; padding:.5rem; max-width:calc(100vw - 2rem); color:#f0dfbc; background:#393047; border-radius:.5rem; }
      `}</style>
        {enabled && error && !agenda && !modal ? (
          <p className="villages-catchup-read-error" role="alert">
            {error}
          </p>
        ) : null}
        {enabled && agenda && !modal && !repair ? (
          <div
            className="villages-agenda-activity"
            data-menu={menu || undefined}
            data-failed={!!agenda.failure || undefined}
            ref={activity}
          >
            <button
              type="button"
              className="villages-agenda-chip"
              ref={trigger}
              aria-expanded={expanded}
              aria-controls={expanded ? detailsId : undefined}
              aria-label={agenda.failure ? "Agenda preparation needs attention" : "Preparing Agendas"}
              title={agenda.failure ? "Agenda preparation needs attention" : "Preparing Agendas"}
              onClick={() => setExpanded((value) => !value)}
            >
              <span className="villages-agenda-glyph" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="5" width="20" height="17" rx="3" />
                  <path d="M2 10h20M7 2v5m10-5v5" />
                </svg>
                {agenda.failure ? null : <span className="villages-agenda-spinner" />}
              </span>
            </button>
            {expanded ? (
              <section id={detailsId} className="villages-agenda-details" aria-label="Agenda preparation">
                {plans}
              </section>
            ) : null}
          </div>
        ) : null}
        {modal ? (
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
            {batch ? (
              <p role="status">{batch.status === "failed" ? "Catch-up paused" : "Catching up with Village life…"}</p>
            ) : (
              plans
            )}
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
            ) : null}
            {batch && error ? <p role="alert">{error}</p> : null}
            {batch ? (
              <div className="villages-zone-map-actions">
                {batch.status === "failed" && batch.issue !== "authority" ? (
                  <button type="button" disabled={busy} onClick={() => void act("retry")}>
                    {busy ? "Retrying…" : "Retry"}
                  </button>
                ) : null}
                <button type="button" disabled={busy} onClick={() => void act("continue")}>
                  {waiting ? "Skip optional catch-up" : "Continue to Village"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEntryGate(false);
                  onBack();
                }}
              >
                Back
              </button>
            )}
          </ModalDialog>
        ) : null}
      </div>
    </AgendaWaiting>
  );
}
