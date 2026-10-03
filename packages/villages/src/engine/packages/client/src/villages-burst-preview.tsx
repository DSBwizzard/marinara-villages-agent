import { useEffect, useState } from "react";
type Request = <T>(path: string, init?: RequestInit) => Promise<T>;
export type BurstPreview = {
  requests: number | null;
  residents: { id: string; name: string; requests: number }[];
  dollars: { min: number; max: number } | null;
  unknownCosts: number | null;
  note: string;
};
export function VillagesBurstPreview({
  request,
  action,
  args = {},
}: {
  request: Request;
  action: string;
  args?: Record<string, unknown>;
}) {
  const key = JSON.stringify({ action, ...args });
  const [value, setValue] = useState<BurstPreview | null>(null),
    [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setValue(null);
    setError(false);
    const timer = setTimeout(() => {
      void request<BurstPreview>("/usage/preview", { method: "POST", body: key, signal: controller.signal })
        .then((value) => {
          if ((typeof value.requests !== "number" && value.requests !== null) || !Array.isArray(value.residents))
            throw new Error("Invalid generation preview");
          if (!controller.signal.aborted) setValue(value);
        })
        .catch(() => {
          if (!controller.signal.aborted) setError(true);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [request, key]);
  return (
    <small aria-live="polite" style={{ display: "block", margin: "6px 0", overflowWrap: "anywhere" }}>
      {error ? (
        "AI request estimate unavailable."
      ) : value ? (
        <>
          {value.requests === null
            ? "AI request count unknown"
            : value.requests + " expected AI " + (value.requests === 1 ? "request" : "requests")}
          {value.dollars
            ? " · $" + value.dollars.min.toFixed(4) + "–$" + value.dollars.max.toFixed(4) + " budget range"
            : ""}
          {value.unknownCosts ? " · " + value.unknownCosts + " with unknown cost" : ""}
          {value.residents.length
            ? " · " + value.residents.map((r) => r.name + " (" + r.requests + ")").join(", ")
            : ""}
          <br />
          {value.note}
        </>
      ) : (
        "Estimating AI requests…"
      )}
    </small>
  );
}
