import { useState } from "react";
import { messageFrom, request } from "../../shared/api.js";
import type { VillageSnapshot } from "../../../shared/contracts/village.js";
export function WorldNameSettings({
  initial,
  onSnapshot,
}: {
  initial: string;
  onSnapshot(value: VillageSnapshot): void;
}) {
  const [value, setValue] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
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
