import { useEffect, useRef, useState } from "react";

type Request = <T>(path: string, init?: RequestInit) => Promise<T>;
type Total = {
  requests: number;
  unknownTokens?: number;
  tokens: number;
  dollars: number;
  usd?: number;
  yuan?: number;
  unknown: number;
};
type Rate = {
  input: number;
  output: number;
  cached?: number;
  cacheWrite?: number;
  perRequest?: number;
  currency?: "USD" | "CNY";
  source: string;
  checkedAt: string;
  longContext?: { above: number; input: number; output: number };
};
type Model = {
  connectionId: string;
  model: string;
  rate: Rate | null;
  isLinkApi?: boolean;
  group?: string;
  groups?: { id: string; label: string; multiplier: number }[];
  note?: string;
};
type Row = Model & {
  id: string;
  purpose: string;
  stage: string;
  status: string;
  interrupted?: boolean;
  usage?: { totalTokens?: number; promptTokens?: number; completionTokens?: number };
  dollars: number | null;
  yuan?: number | null;
  priceNote?: string;
};
type View = {
  since: string;
  totals: Total;
  today: Total;
  running: number;
  purposes: Record<string, Total>;
  requests: Row[];
  models?: Model[];
  exchangeRate?: { yuanPerDollar: number; checkedAt: string; source: string } | null;
  bursts?: {
    id: string;
    label: string;
    status: string;
    cause: string;
    remainingRequests: number | null;
    remainingBlocks: number | null;
  }[];
  error: string;
  scope: string;
};
const money = (n: number, currency = "USD") => (currency === "CNY" ? "¥" : "$") + n.toFixed(4);

export function VillagesUsageMeter({ request, element }: { request: Request; element: HTMLElement }) {
  const [visible, setVisible] = useState(true);
  const [enabled, setEnabled] = useState(false),
    [open, setOpen] = useState(false);
  const [view, setView] = useState<View | null>(null),
    [error, setError] = useState("");
  const [selected, setSelected] = useState(""),
    [rates, setRates] = useState(["", "", "", "", ""]);
  const [currency, setCurrency] = useState("USD"),
    [busy, setBusy] = useState(false);
  // A poll admitted before a mutation must not restore the pre-reset projection.
  const revision = useRef(0),
    mutating = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => setVisible(entries.some((entry) => entry.isIntersecting)));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  useEffect(() => {
    const controller = new AbortController();
    const load = () =>
      void request<{ showUsageMeter?: boolean }>("/debug/runtime", { signal: controller.signal })
        .then((value) => {
          if (!controller.signal.aborted) setEnabled(value.showUsageMeter !== false);
        })
        .catch(() => {});
    const visibility = (event: Event) => setEnabled((event as CustomEvent<boolean>).detail);
    load();
    window.addEventListener("villages-usage-visibility", visibility);
    window.addEventListener("focus", load);
    return () => {
      controller.abort();
      window.removeEventListener("villages-usage-visibility", visibility);
      window.removeEventListener("focus", load);
    };
  }, [request]);
  useEffect(() => {
    if (!enabled || !visible) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>,
      stopped = false;
    const poll = async () => {
      if (!document.hidden && !mutating.current) {
        const version = revision.current;
        try {
          const next = await request<View>(open ? "/usage?details=1" : "/usage", { signal: controller.signal });
          if (!stopped && version === revision.current && next.totals) {
            setView(next);
            setError("");
          }
        } catch {
          if (!stopped && version === revision.current) setError("Usage display unavailable");
        }
      }
      if (!stopped) timer = setTimeout(poll, 1200);
    };
    void poll();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [enabled, visible, request, open]);
  const mutate = async (path: string, init: RequestInit) => {
    if (mutating.current) return;
    mutating.current = true;
    revision.current++;
    setBusy(true);
    try {
      setView(await request<View>(path, init));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Usage setting could not be saved");
    } finally {
      revision.current++;
      mutating.current = false;
      setBusy(false);
    }
  };
  if (!enabled || !visible) return null;
  const total = view?.totals,
    fx = view?.exchangeRate?.yuanPerDollar;
  const cost = (n: Total) => {
    const usd = n.usd ?? n.dollars,
      yuan = n.yuan ?? 0;
    return fx
      ? money(yuan + usd * fx, "CNY") + " ≈ " + money(usd + yuan / fx)
      : (yuan ? money(yuan, "CNY") + (usd ? " + " + money(usd) : "") : money(usd)) + " · conversion unavailable";
  };
  const choices = view?.models ?? [
    ...new Map(
      (view?.requests ?? [])
        .filter((row) => row.connectionId && row.model)
        .map((row) => [row.connectionId + ":" + row.model, row]),
    ).values(),
  ];
  const row = choices.find((row) => row.connectionId + ":" + row.model === selected);
  const save = (clear = false) => {
    if (!row) return;
    if (!clear && rates[4] === "" && (rates[0] === "" || rates[1] === "")) {
      setError("Enter input and output prices, or a per-request price.");
      return;
    }
    const rate = clear
      ? null
      : {
          input: Number(rates[0]),
          output: Number(rates[1]),
          currency,
          ...(rates[2] !== "" ? { cached: Number(rates[2]) } : {}),
          ...(rates[3] !== "" ? { cacheWrite: Number(rates[3]) } : {}),
          ...(rates[4] !== "" ? { perRequest: Number(rates[4]) } : {}),
        };
    void mutate("/usage/pricing", {
      method: "PATCH",
      body: JSON.stringify({ connectionId: row.connectionId, model: row.model, rate }),
    });
  };
  return (
    <aside
      aria-label="Villages AI usage"
      style={{
        flex: "0 0 auto",
        minWidth: 0,
        padding: "4px 8px",
        color: "var(--foreground, #f5f5f5)",
        background: "var(--background, #20232a)",
        borderBottom: "1px solid var(--border, #888)",
        font: "12px/1.5 Arial,sans-serif",
        overflowWrap: "anywhere",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", alignItems: "center" }}>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          style={{
            flex: "1 1 15rem",
            minWidth: 0,
            textAlign: "left",
            color: "inherit",
            background: "transparent",
            border: 0,
            cursor: "pointer",
            whiteSpace: "normal",
          }}
        >
          Villages AI usage ·{" "}
          {total
            ? (total.unknown === total.requests && total.requests > 0
                ? "Cost unavailable"
                : cost(total) + " estimated") +
              " · " +
              total.requests +
              " requests · " +
              total.tokens.toLocaleString() +
              " known tokens" +
              (total.unknownTokens ? " · " + total.unknownTokens + " with unavailable token totals" : "") +
              (view?.running ? " · " + view.running + " running" : "") +
              (total.unknown ? " · " + total.unknown + " unpriced/unknown" : "")
            : "Loading usage…"}
        </button>
        <button
          type="button"
          disabled={busy || !view}
          onClick={() => void mutate("/usage/reset", { method: "POST" })}
          title="Clear the displayed totals and recent requests. Saved prices and aggregate history are kept."
        >
          Reset usage
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (mutating.current) return;
            setBusy(true);
            try {
              await request("/debug/runtime", { method: "PATCH", body: JSON.stringify({ showUsageMeter: false }) });
              window.dispatchEvent(new CustomEvent("villages-usage-visibility", { detail: false }));
            } catch {
              setError("Usage display could not be hidden");
            } finally {
              setBusy(false);
            }
          }}
          title="Show again in DEBUG Settings → Show AI usage meter"
        >
          Hide usage
        </button>
      </div>
      {open && view ? (
        <div
          style={{
            maxHeight: "min(50vh, 28rem)",
            overflow: "auto",
            padding: "4px 0",
            borderTop: "1px solid var(--border, #888)",
          }}
        >
          <p>
            Since reset: {new Date(view.since).toLocaleString()}. Today: {cost(view.today)} estimated /{" "}
            {view.today.requests} requests.
          </p>
          <p>
            {view.exchangeRate ? (
              <>
                1 USD ≈ ¥{view.exchangeRate.yuanPerDollar.toFixed(4)} · updated{" "}
                {new Date(view.exchangeRate.checkedAt).toLocaleDateString()} ·{" "}
                <a href={view.exchangeRate.source} target="_blank" rel="noreferrer">
                  ExchangeRate-API
                </a>
                . Conversion is indicative.
              </>
            ) : (
              "USD/yuan conversion is unavailable. Native costs are still recorded."
            )}
          </p>
          <p>{view.scope} Token totals update when requests finish. Unknown costs are excluded from estimates.</p>
          {Object.entries(view.purposes).map(([purpose, n]) => (
            <p key={purpose}>
              {purpose}: {n.requests} requests · {n.tokens.toLocaleString()} tokens · {cost(n)} estimated · {n.unknown}{" "}
              unknown
            </p>
          ))}
          <h4>Model prices</h4>
          <select
            aria-label="Price connection and model"
            value={selected}
            style={{ maxWidth: "100%" }}
            onChange={(event) => {
              const value = event.target.value;
              setSelected(value);
              const chosen = choices.find((row) => row.connectionId + ":" + row.model === value);
              const rate = chosen?.rate;
              setCurrency(rate?.currency ?? (chosen?.isLinkApi ? "CNY" : "USD"));
              setRates(
                [rate?.input, rate?.output, rate?.cached, rate?.cacheWrite, rate?.perRequest].map((n) =>
                  n === undefined ? "" : String(n),
                ),
              );
            }}
          >
            <option value="">Choose a configured or used model</option>
            {choices.map((row) => (
              <option key={row.connectionId + ":" + row.model} value={row.connectionId + ":" + row.model}>
                {row.model} ({row.connectionId})
              </option>
            ))}
          </select>
          {row && (
            <div>
              {row.isLinkApi && (
                <label style={{ display: "block", marginTop: 8 }}>
                  LinkAPI token group
                  <select
                    aria-label="LinkAPI token group"
                    value={row.group ?? ""}
                    disabled={busy}
                    style={{ maxWidth: "100%" }}
                    onChange={(event) =>
                      void mutate("/usage/linkapi", {
                        method: "PATCH",
                        body: JSON.stringify({
                          connectionId: row.connectionId,
                          model: row.model,
                          group: event.target.value,
                        }),
                      })
                    }
                  >
                    <option value="">Choose the group from your LinkAPI token</option>
                    {row.groups?.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.id} · ×{group.multiplier}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <p>{row.note || "No recognized price"}. Changes apply to future requests.</p>
              {row.rate && (
                <p>
                  {row.rate.source} · checked {new Date(row.rate.checkedAt).toLocaleString()} ·{" "}
                  {row.rate.perRequest !== undefined
                    ? money(row.rate.perRequest, row.rate.currency) + " / request"
                    : money(row.rate.input, row.rate.currency) +
                      " input / million · " +
                      money(row.rate.output, row.rate.currency) +
                      " output / million"}
                  {row.rate.longContext
                    ? " · higher prices above " + row.rate.longContext.above.toLocaleString() + " input tokens"
                    : ""}
                </p>
              )}
              <details>
                <summary>Manual price override</summary>
                <label>
                  Price currency{" "}
                  <select
                    aria-label="Price currency"
                    value={currency}
                    onChange={(event) => {
                      setCurrency(event.target.value);
                      setRates(["", "", "", "", ""]);
                    }}
                  >
                    <option value="USD">USD</option>
                    <option value="CNY">CNY · yuan</option>
                  </select>
                </label>
                {["Input", "Output", "Cached input", "Cache write", "Per request"].map((name, i) => {
                  const label = name + " " + currency + (i === 4 ? " / request" : " / million");
                  return (
                    <label key={name} style={{ display: "block" }}>
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
                  );
                })}
                <button type="button" disabled={busy} onClick={() => save()}>
                  Save override
                </button>
                <button type="button" disabled={busy} onClick={() => save(true)}>
                  Use automatic pricing
                </button>
              </details>
            </div>
          )}
          <h4>Recent requests</h4>
          {view.bursts?.map((job) => (
            <p key={job.id}>
              {job.label} · {job.status} · {job.cause} ·{" "}
              {job.remainingRequests === null ? "Request count pending" : job.remainingRequests + " requests remaining"}
            </p>
          ))}
          {!view.requests.length && <p>No requests in this period.</p>}
          {view.requests.slice(0, 20).map((row) => (
            <p key={row.id}>
              {row.purpose} · {row.stage} · {row.model || "unknown model"} ·{" "}
              {row.interrupted ? "interrupted (usage unknown)" : row.status} ·{" "}
              {row.usage?.totalTokens !== undefined
                ? row.usage.totalTokens + " tokens"
                : row.usage?.promptTokens !== undefined && row.usage?.completionTokens !== undefined
                  ? row.usage.promptTokens + row.usage.completionTokens + " tokens"
                  : "token count unavailable"}{" "}
              ·{" "}
              {row.yuan != null
                ? money(row.yuan, "CNY") + (fx ? " ≈ " + money(row.yuan / fx) : "")
                : row.dollars === null
                  ? "cost unknown" + (row.priceNote ? " · " + row.priceNote : "")
                  : money(row.dollars) + " estimated"}
            </p>
          ))}
        </div>
      ) : null}
      {error || view?.error ? <p role="status">{error || view?.error}</p> : null}
    </aside>
  );
}
