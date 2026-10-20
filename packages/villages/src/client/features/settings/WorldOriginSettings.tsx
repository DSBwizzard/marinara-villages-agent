import type { VillageSnapshot } from "../../../shared/contracts/village.js";
import { useState } from "react";
import { WORLD_ORIGINS, type WorldOrigin } from "../../../shared/helpers/resident-founding-context.js";
import { messageFrom, request } from "../../shared/api.js";

export function WorldOriginSettings({
  initial,
  onSaved,
}: {
  initial: WorldOrigin | null;
  onSaved(value: VillageSnapshot): void;
}) {
  const [value, setValue] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div>
      <label>
        Character origins
        <select
          aria-label="Character origins"
          value={value ?? ""}
          disabled={busy}
          onChange={async (event) => {
            const next = event.target.value as WorldOrigin;
            setBusy(true);
            setError("");
            try {
              const saved = await request<VillageSnapshot>("/settings", {
                method: "PATCH",
                body: JSON.stringify({ worldOrigin: next }),
              });
              onSaved(saved);
              setValue(next);
            } catch (cause) {
              setError(messageFrom(cause, "Could not save character origins."));
            } finally {
              setBusy(false);
            }
          }}
        >
          {!value ? (
            <option value="" disabled>
              Choose origins
            </option>
          ) : null}
          {Object.entries(WORLD_ORIGINS).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
