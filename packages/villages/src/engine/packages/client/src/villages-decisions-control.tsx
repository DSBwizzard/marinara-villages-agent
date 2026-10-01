import { useEffect, useRef, useState } from "react";

type Settings = { decisionsEnabled: boolean; compareSystem: boolean };
type Configuration = { settings: Settings; status: { available: boolean; reason: string; engineBuild: string | null } };
type Trace = {
  id: string;
  question: string;
  domain: string;
  applied: string;
  evidence: { id: string; name: string; content: string; current?: boolean }[];
  decisions: {
    status: string;
    outcome?: string;
    model?: string;
    scores?: Record<string, number>;
    threshold?: number;
    reason?: string;
  };
  system: { status: string; outcome?: string; reason?: string };
  result: { outcome: string; source: string };
};
const outcomeLabel = (value?: string) => (value ? value.replace(/-/gu, " ") : "No answer");
export function DecisionsControl({
  sceneId,
  busy,
  api,
}: {
  sceneId: string;
  busy: boolean;
  api: <T>(path: string, init?: RequestInit) => Promise<T>;
}) {
  const [configuration, setConfiguration] = useState<Configuration | null>(null);
  const [checks, setChecks] = useState<Trace[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nextTurn, setNextTurn] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const savingRef = useRef(false);
  const settingsRevision = useRef(0);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const refresh = async () => {
      const revision = settingsRevision.current;
      try {
        const [config, diagnostics] = await Promise.all([
          api<Configuration>("/interpretation-settings", { signal: controller.signal }),
          api<{ checks: Trace[] }>(`/interpretation-diagnostics/${encodeURIComponent(sceneId)}`, {
            signal: controller.signal,
          }),
        ]);
        if (
          !config?.settings ||
          typeof config.settings.decisionsEnabled !== "boolean" ||
          !Array.isArray(diagnostics.checks)
        )
          return;
        if (!cancelled) {
          if (!savingRef.current && revision === settingsRevision.current) setConfiguration(config);
          setChecks(diagnostics.checks);
        }
      } catch {
        /* Poll failure never interferes with the Scene or resets a saved switch. */
      }
    };
    void refresh();
    const timer = setInterval(() => void refresh(), 2500);
    return () => {
      cancelled = true;
      clearInterval(timer);
      controller.abort();
    };
  }, [api, sceneId]);
  useEffect(() => {
    if (!busy) setNextTurn(false);
  }, [busy]);
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      trigger.current?.focus();
    };
    window.addEventListener("keydown", escape, true);
    return () => window.removeEventListener("keydown", escape, true);
  }, [open]);
  const save = async (patch: Partial<Settings>) => {
    if (savingRef.current || !configuration) return;
    const previous = configuration;
    settingsRevision.current++;
    savingRef.current = true;
    setSaving(true);
    setConfiguration({ ...previous, settings: { ...previous.settings, ...patch } });
    setError("");
    try {
      const result = await api<Configuration>("/interpretation-settings", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setConfiguration(result);
      if (busy) setNextTurn(true);
    } catch {
      setConfiguration(previous);
      setError("The switch could not be saved. Its previous setting remains in use.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };
  const enabled = configuration?.settings.decisionsEnabled === true;
  const latest = checks.at(-1);
  const fallback = enabled && (!configuration?.status.available || latest?.result.source === "system");
  const checking = checks.some((check) => check.applied === "Not yet applied");
  return (
    <div
      className="villages-decisions-control"
      style={{
        position: "absolute",
        top: ".65rem",
        left: ".65rem",
        zIndex: 120,
        maxWidth: "calc(100% - 1.3rem)",
        color: "var(--foreground)",
        fontSize: ".75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: ".35rem",
          padding: ".35rem .5rem",
          borderRadius: ".6rem",
          border: "1px solid var(--border)",
          background: "var(--popover, var(--background))",
        }}
      >
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Use Decisions"
          disabled={!configuration || saving}
          onClick={() => void save({ decisionsEnabled: !enabled })}
          title="Optional interpretation support. System interpretation is always the fallback."
        >
          Use Decisions · {enabled ? "On" : "Off"}
        </button>
        <button
          type="button"
          ref={trigger}
          aria-expanded={open}
          aria-controls={`decisions-panel-${sceneId}`}
          onClick={() => setOpen((value) => !value)}
        >
          {checking ? "Checking…" : `${checks.length} ${checks.length === 1 ? "check" : "checks"}`}
        </button>
        {fallback ? (
          <span role="status" title={configuration?.status.reason || latest?.decisions.reason}>
            Using System fallback
          </span>
        ) : null}
        {nextTurn ? <span role="status">Applies next turn</span> : null}
      </div>
      {error ? (
        <p role="alert" style={{ background: "var(--popover)", padding: ".5rem" }}>
          {error}
        </p>
      ) : null}
      {open ? (
        <div
          ref={panel}
          id={`decisions-panel-${sceneId}`}
          role="region"
          aria-label="Interpretation checks"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
              trigger.current?.focus();
            }
          }}
          style={{
            marginTop: ".35rem",
            padding: ".75rem",
            width: "min(34rem, calc(100vw - 3rem))",
            maxHeight: "min(65vh, 36rem)",
            overflowY: "auto",
            borderRadius: ".6rem",
            border: "1px solid var(--border)",
            background: "var(--popover, var(--background))",
            boxShadow: "0 .5rem 2rem #0005",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: ".75rem" }}>
            <strong>Interpretation checks</strong>
            <button
              type="button"
              aria-label="Close interpretation checks"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              Close
            </button>
          </div>
          <label style={{ display: "block", marginTop: ".6rem" }}>
            <input
              type="checkbox"
              checked={configuration?.settings.compareSystem !== false}
              disabled={!configuration || saving}
              onChange={(event) => void save({ compareSystem: event.target.checked })}
            />{" "}
            Compare with System
          </label>
          <p>
            A successful Decisions check can make an extra, read-only System request. Comparison never changes gameplay.
            Switch changes apply to the next Scene operation.
          </p>
          {configuration?.status.engineBuild ? <p>Engine build: {configuration.status.engineBuild}</p> : null}
          {!checks.length ? <p>No interpretation checks have been recorded in this Scene yet.</p> : null}
          {[...checks].reverse().map((check) => (
            <article
              key={check.id}
              style={{ borderTop: "1px solid var(--border)", marginTop: ".6rem", paddingTop: ".6rem" }}
            >
              <strong>{check.question}</strong>
              <p>
                <b>Decisions:</b>{" "}
                {check.decisions.status === "answered"
                  ? outcomeLabel(check.decisions.outcome)
                  : check.decisions.status === "off"
                    ? "Off"
                    : "Unavailable / unresolved"}
                {check.decisions.model ? ` (${check.decisions.model})` : ""}
              </p>
              {check.decisions.reason ? <p>{check.decisions.reason}</p> : null}
              {check.decisions.scores ? (
                <p>
                  Scores:{" "}
                  {Object.entries(check.decisions.scores)
                    .map(
                      ([label, score]) =>
                        `${outcomeLabel(label)} ${typeof score === "number" ? score.toFixed(3) : "missing"}`,
                    )
                    .join("; ")}
                  . Threshold: {check.decisions.threshold}
                </p>
              ) : null}
              <p>
                <b>System comparison:</b>{" "}
                {check.system.status === "complete"
                  ? outcomeLabel(check.system.outcome)
                  : check.system.status.replace(/-/gu, " ")}
                {check.system.reason ? ` — ${check.system.reason}` : ""}
              </p>
              <p>
                <b>Applied:</b> {check.applied}
              </p>
              {check.decisions.status === "answered" && check.system.status === "complete" ? (
                <p>
                  <b>{check.decisions.outcome === check.system.outcome ? "Agreement" : "Disagreement"}</b> · comparison
                  did not override the applied result.
                </p>
              ) : null}
              <details>
                <summary>Evidence for this check</summary>
                {check.evidence.map((line) => (
                  <p key={line.id}>
                    <b>{line.name || "Narration"}:</b> {line.content}
                    {line.current ? " (current reply)" : ""}
                  </p>
                ))}
              </details>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
