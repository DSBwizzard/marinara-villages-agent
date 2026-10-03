import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
type Request = <T>(path: string, init?: RequestInit) => Promise<T>;
type Total = { requests: number; tokens: number; dollars: number; unknown: number };
type Rate = {
  input: number;
  output: number;
  cached?: number;
  cacheWrite?: number;
  perRequest?: number;
  source: string;
  checkedAt: string;
};
type Row = {
  id: string;
  purpose: string;
  stage: string;
  connectionId: string;
  model: string;
  status: string;
  dollars: number | null;
  rate: Rate | null;
};
type View = {
  since: string;
  totals: Total;
  today: Total;
  running: number;
  purposes: Record<string, Total>;
  requests: Row[];
  error: string;
  scope: string;
};
const money = (n: number) => "$" + n.toFixed(4);
export function VillagesUsageMeter({ request, element }: { request: Request; element: HTMLElement }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => setVisible(entries.some((entry) => entry.isIntersecting)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  const [enabled, setEnabled] = useState(false),
    [open, setOpen] = useState(false);
  const [view, setView] = useState<View | null>(null),
    [error, setError] = useState("");
  const [target, setTarget] = useState<Element>(document.fullscreenElement ?? document.body);
  const [selected, setSelected] = useState(""),
    [rates, setRates] = useState(["", "", "", "", ""]);
  useEffect(() => {
    const controller = new AbortController();
    const load = () =>
      void request<{ showUsageMeter?: boolean }>("/debug/runtime", { signal: controller.signal })
        .then((value) => setEnabled(value.showUsageMeter !== false))
        .catch(() => {});
    const visibility = (event: Event) => setEnabled((event as CustomEvent<boolean>).detail);
    const fullscreen = () => setTarget(document.fullscreenElement ?? document.body);
    load();
    window.addEventListener("villages-usage-visibility", visibility);
    window.addEventListener("focus", load);
    document.addEventListener("fullscreenchange", fullscreen);
    return () => {
      controller.abort();
      window.removeEventListener("villages-usage-visibility", visibility);
      window.removeEventListener("focus", load);
      document.removeEventListener("fullscreenchange", fullscreen);
    };
  }, [request]);
  useEffect(() => {
    if (!enabled || !visible) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>,
      stopped = false;
    const poll = async () => {
      if (document.hidden) {
        timer = setTimeout(poll, 1000);
        return;
      }
      try {
        const next = await request<View>(open ? "/usage?details=1" : "/usage", { signal: controller.signal });
        if (!stopped && next.totals) {
          setView(next);
          setError("");
        }
      } catch {
        if (!stopped) setError("Usage display unavailable");
      }
      if (!stopped) timer = setTimeout(poll, 800);
    };
    void poll();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [enabled, visible, request, open]);
  if (!enabled || !visible) return null;
  const total = view?.totals;
  const choices = [
    ...new Map(
      (view?.requests ?? [])
        .filter((row) => row.connectionId && row.model)
        .map((row) => [row.connectionId + ":" + row.model, row]),
    ).values(),
  ];
  const row = choices.find((row) => row.connectionId + ":" + row.model === selected);
  const save = async (clear = false) => {
    if (!row) return;
    try {
      const rate = clear
        ? null
        : {
            input: Number(rates[0]),
            output: Number(rates[1]),
            ...(rates[2] !== "" ? { cached: Number(rates[2]) } : {}),
            ...(rates[3] !== "" ? { cacheWrite: Number(rates[3]) } : {}),
            ...(rates[4] !== "" ? { perRequest: Number(rates[4]) } : {}),
          };
      setView(
        await request("/usage/pricing", {
          method: "PATCH",
          body: JSON.stringify({ connectionId: row.connectionId, model: row.model, rate }),
        }),
      );
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pricing could not be saved");
    }
  };
  return createPortal(
    <aside
      aria-label="Villages AI usage"
      style={{
        position: "fixed",
        right: 8,
        top: 72,
        zIndex: 2147483646,
        maxWidth: "calc(100vw - 16px)",
        color: "#f5f5f5",
        background: "#20232a",
        border: "1px solid #888",
        borderRadius: 8,
        boxShadow: "0 2px 12px #0008",
        font: "12px/1.5 Arial,sans-serif",
        padding: 6,
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        style={{
          color: "inherit",
          background: "transparent",
          border: 0,
          cursor: "pointer",
          maxWidth: "100%",
          whiteSpace: "normal",
        }}
      >
        Villages AI ·{" "}
        {total
          ? money(total.dollars) +
            " estimated · " +
            total.requests +
            " requests · " +
            total.tokens.toLocaleString() +
            " tokens · " +
            view?.running +
            " running" +
            (total.unknown ? " · " + total.unknown + " unpriced/unknown" : "")
          : "Loading usage…"}
      </button>
      {open && view ? (
        <div style={{ maxHeight: "70vh", overflow: "auto", width: 340, maxWidth: "calc(100vw - 32px)" }}>
          <p>
            Since reset: {new Date(view.since).toLocaleString()}. Today: {money(view.today.dollars)} estimated /{" "}
            {view.today.requests} requests.
          </p>
          <p>{view.scope} Token totals update when requests finish. Estimates are not a provider invoice.</p>
          {Object.entries(view.purposes).map(([purpose, n]) => (
            <p key={purpose}>
              {purpose}: {n.requests} requests · {n.tokens.toLocaleString()} tokens · {money(n.dollars)} estimated ·{" "}
              {n.unknown} unknown
            </p>
          ))}
          <button
            type="button"
            onClick={async () => {
              try {
                setView(await request("/usage/reset", { method: "POST" }));
              } catch {
                setError("Usage period could not be reset");
              }
            }}
          >
            Reset displayed period
          </button>
          <h4>Model prices</h4>
          <select
            aria-label="Price connection and model"
            value={selected}
            onChange={(event) => {
              const value = event.target.value;
              setSelected(value);
              const chosen = choices.find((row) => row.connectionId + ":" + row.model === value);
              const rate = chosen?.rate;
              setRates(
                [rate?.input, rate?.output, rate?.cached, rate?.cacheWrite, rate?.perRequest].map((n) =>
                  n === undefined ? "" : String(n),
                ),
              );
            }}
          >
            <option value="">Choose a used model</option>
            {choices.map((row) => (
              <option key={row.connectionId + ":" + row.model} value={row.connectionId + ":" + row.model}>
                {row.model} ({row.connectionId})
              </option>
            ))}
          </select>
          {row && (
            <div>
              <p>
                {row.rate ? row.rate.source + " · checked " + row.rate.checkedAt : "No recognized price"}. Changes apply
                to future requests.
              </p>
              {[
                "Input USD / million",
                "Output USD / million",
                "Cached input USD / million",
                "Cache write USD / million",
                "Image USD / request",
              ].map((label, i) => (
                <label key={label} style={{ display: "block" }}>
                  {label}
                  <input
                    aria-label={label}
                    type="number"
                    min="0"
                    step="any"
                    value={rates[i]}
                    onChange={(event) => setRates(rates.map((n, index) => (index === i ? event.target.value : n)))}
                  />
                </label>
              ))}
              <button type="button" onClick={() => void save()}>
                Save override
              </button>
              <button type="button" onClick={() => void save(true)}>
                Use known pricing
              </button>
            </div>
          )}
          <h4>Recent requests</h4>
          {view.requests.slice(0, 20).map((row) => (
            <p key={row.id}>
              {row.purpose} · {row.stage} · {row.model || "unknown model"} · {row.status} ·{" "}
              {row.dollars === null ? "cost unknown" : money(row.dollars) + " estimated"}
            </p>
          ))}
        </div>
      ) : null}
      {error || view?.error ? <p role="status">{error || view?.error}</p> : null}
    </aside>,
    target,
  );
}
