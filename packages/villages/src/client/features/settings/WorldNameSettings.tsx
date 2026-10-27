import { useEffect, useState } from "react";
import type { ReportLocalDraftStatus } from "./local-draft-status.js";
import { messageFrom, request } from "../../shared/api.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
export function WorldNameSettings({
  initial,
  onSnapshot,
  reportLocalDraftStatus,
}: {
  initial: string;
  onSnapshot(value: VillageSnapshot): void;
  reportLocalDraftStatus: ReportLocalDraftStatus;
}) {
  const [value, setValue] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    reportLocalDraftStatus("world", { dirty: value.trim() !== initial, busy });
  }, [value, initial, busy, reportLocalDraftStatus]);
  useEffect(() => () => reportLocalDraftStatus("world", null), [reportLocalDraftStatus]);
  return (
    <div className="villages-field">
      <label>
        Village world
        <input
          aria-label="Village world"
          value={value}
          maxLength={120}
          autoComplete="off"
          placeholder="Optional"
          disabled={busy}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <button
        type="button"
        disabled={busy || value.trim() === initial}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            onSnapshot(
              await request<VillageSnapshot>("/settings", {
                method: "PATCH",
                body: JSON.stringify({ worldName: value }),
              }),
            );
          } catch (cause) {
            setError(messageFrom(cause, "Could not save the world name."));
          } finally {
            setBusy(false);
          }
        }}
      >
        Save
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
