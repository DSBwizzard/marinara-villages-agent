import { useState } from "react";

export function SavedChangesDiagnostics({
  sceneId,
  api,
}: {
  sceneId: string;
  api: <T>(path: string, init?: RequestInit) => Promise<T>;
}) {
  const [page, setPage] = useState<{ nextCursor: string; hasMore: boolean; [key: string]: unknown } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async (cursor = "") => {
    setBusy(true);
    try {
      setPage(await api(`/rooms/${encodeURIComponent(sceneId)}/changes?limit=10&cursor=${encodeURIComponent(cursor)}`));
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Saved changes are unavailable.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <details
      onToggle={(event) => {
        if (event.currentTarget.open && !page && !busy) void load();
      }}
    >
      <summary>Saved change diagnostics · includes private evidence</summary>
      <p>
        Read saved evidence, interpretation source, validation results, committed notices, and available request usage.
        Reading makes no model request.
      </p>
      <button type="button" disabled={busy} onClick={() => void load()}>
        Refresh saved records
      </button>
      {page?.hasMore ? (
        <button type="button" disabled={busy} onClick={() => void load(page.nextCursor)}>
          Next saved records
        </button>
      ) : null}
      {error ? <p role="status">{error}</p> : null}
      {page ? (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            maxHeight: "18rem",
            overflow: "auto",
            fontSize: ".75rem",
          }}
        >
          {JSON.stringify(page, null, 2)}
        </pre>
      ) : null}
    </details>
  );
}
