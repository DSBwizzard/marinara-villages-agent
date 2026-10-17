import { useState } from "react";
import {
  contactNeighborIds,
  materializeConnections,
  connectionProblem,
  type ConnectedSpace,
} from "../../shared/helpers/zone-contact.js";

export function SpaceConnections<T extends ConnectedSpace & { name?: string }>({
  spaces,
  onChange,
  editableIds,
}: {
  spaces: T[];
  editableIds?: string[];
  onChange(spaces: T[]): void;
}) {
  const [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const rows = materializeConnections(spaces);
  const existing = new Set(rows.map((zone) => zone.id));
  const pairs = rows.flatMap((zone) =>
    [...new Set([...(zone.connectedTo ?? []), ...contactNeighborIds(rows, zone.id)])]
      .filter((id) => !existing.has(id) || zone.id < id)
      .map((id) => [zone.id, id] as const),
  );
  const name = (id: string) => (id === "exterior" ? "Exterior" : spaces.find((zone) => zone.id === id)?.name || "Zone");
  const update = (a: string, b: string, connected: boolean) =>
    onChange(
      rows.map((zone) => {
        const other = zone.id === a ? b : zone.id === b ? a : undefined;
        return other
          ? {
              ...zone,
              connectedTo: connected
                ? [...new Set([...(zone.connectedTo ?? []), other])]
                : zone.connectedTo?.filter((id) => id !== other),
            }
          : zone;
      }),
    );
  const problem = connectionProblem(rows);
  return (
    <fieldset className="villages-space-connections">
      <legend>Connections between spaces</legend>

      {editableIds ? (
        <p>
          Only connections involving the spaces edited in this project can change here. Use a separate layout or Upgrade
          Renovation for other passages.
        </p>
      ) : null}
      <ul>
        {pairs.map(([a, b]) => (
          <li key={a + ":" + b}>
            <span>
              {name(a)} ↔ {name(b)}
            </span>{" "}
            <button
              type="button"
              disabled={!!editableIds && !editableIds.includes(a) && !editableIds.includes(b)}
              aria-label={"Remove connection " + name(a) + " to " + name(b)}
              onClick={() => update(a, b, false)}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <label>
        From space
        <select value={from} onChange={(event) => setFrom(event.target.value)}>
          <option value="">Choose a space</option>
          {spaces
            .filter((zone) => !editableIds || editableIds.includes(zone.id))
            .map((zone) => (
              <option key={zone.id} value={zone.id}>
                {name(zone.id)}
              </option>
            ))}
        </select>
      </label>
      <label>
        To space
        <select value={to} onChange={(event) => setTo(event.target.value)}>
          <option value="">Choose a space</option>
          {spaces
            .filter((zone) => zone.id !== from)
            .map((zone) => (
              <option key={zone.id} value={zone.id}>
                {name(zone.id)}
              </option>
            ))}
        </select>
      </label>
      <button
        type="button"
        disabled={!from || !to || from === to || contactNeighborIds(rows, from).includes(to)}
        onClick={() => {
          update(from, to, true);
          setFrom("");
          setTo("");
        }}
      >
        Add connection
      </button>
      {problem ? <p role="status">{problem}</p> : null}
    </fieldset>
  );
}
