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
  disabled = false,
  pageSize,
  compact = false,
}: {
  spaces: T[];
  editableIds?: string[];
  disabled?: boolean;
  pageSize?: number;
  compact?: boolean;
  onChange(spaces: T[]): void;
}) {
  const [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [page, setPage] = useState(0),
    [view, setView] = useState<"list" | "add">("list");
  const rows = materializeConnections(spaces);
  const existing = new Set(rows.map((zone) => zone.id));
  const pairs = rows.flatMap((zone) =>
    [...new Set([...(zone.connectedTo ?? []), ...contactNeighborIds(rows, zone.id)])]
      .filter((id) => !existing.has(id) || zone.id < id)
      .map((id) => [zone.id, id] as const),
  );
  const name = (id: string) => (id === "exterior" ? "Exterior" : spaces.find((zone) => zone.id === id)?.name || "Zone");
  const pages = pageSize ? Math.max(1, Math.ceil(pairs.length / pageSize)) : 1;
  const currentPage = Math.min(page, pages - 1);
  const visiblePairs = pageSize ? pairs.slice(currentPage * pageSize, currentPage * pageSize + pageSize) : pairs;
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
      {compact ? (
        <div className="vp-detail-pages" role="group" aria-label="Connection pages">
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
            Connections
          </button>
          <button type="button" aria-pressed={view === "add"} onClick={() => setView("add")}>
            Add
          </button>
        </div>
      ) : null}

      {!compact || view === "list" ? (
        <>
          <ul>
            {visiblePairs.map(([a, b]) => (
              <li key={a + ":" + b}>
                <span>
                  {name(a)} ↔ {name(b)}
                </span>{" "}
                <button
                  type="button"
                  disabled={disabled || (!!editableIds && !editableIds.includes(a) && !editableIds.includes(b))}
                  aria-label={"Remove connection " + name(a) + " to " + name(b)}
                  onClick={() => update(a, b, false)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
          {pages > 1 ? (
            <div className="vp-actions">
              <button type="button" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
                Previous
              </button>
              <span>
                {currentPage + 1} / {pages}
              </span>
              <button type="button" disabled={currentPage + 1 === pages} onClick={() => setPage(currentPage + 1)}>
                Next
              </button>
            </div>
          ) : null}
        </>
      ) : null}
      {!compact || view === "add" ? (
        <>
          <div className="vp-connection-fields">
            <label>
              From space
              <select disabled={disabled} value={from} onChange={(event) => setFrom(event.target.value)}>
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
              <select disabled={disabled} value={to} onChange={(event) => setTo(event.target.value)}>
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
          </div>
          <button
            type="button"
            disabled={disabled || !from || !to || from === to || contactNeighborIds(rows, from).includes(to)}
            onClick={() => {
              update(from, to, true);
              setFrom("");
              setTo("");
            }}
          >
            Add connection
          </button>
        </>
      ) : null}
      {problem ? <p role="status">{problem}</p> : null}
    </fieldset>
  );
}
