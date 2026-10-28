import { useRef, useState, type ReactNode } from "react";
import {
  connectionProblem,
  contactNeighborIds,
  materializeConnections,
  type ConnectedSpace,
} from "../../shared/helpers/zone-contact.js";
import { resolveZoneLayout, zonePositionFits, ZONE_TILE, type ZoneLayout } from "../../shared/helpers/zone-layout.js";

export function ZoneMap<T extends ConnectedSpace & { name?: string }>({
  zones,
  positions,
  onPositions,
  onConnections,
  selectedId,
  onSelect,
  disabled = false,
  labels,
}: {
  zones: T[];
  positions?: ZoneLayout;
  onPositions?(layout: ZoneLayout): void;
  onConnections?(zones: T[]): void;
  selectedId?: string;
  onSelect?(id: string): void;
  disabled?: boolean;
  labels?(zone: T): ReactNode;
}) {
  const [connecting, setConnecting] = useState(false),
    [first, setFirst] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<ZoneLayout | null>(null);
  const drag = useRef<{
    id: string;
    pointer: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    layout: ZoneLayout;
    moved: boolean;
  } | null>(null);
  const layout =
    preview ??
    resolveZoneLayout(
      zones.map((z) => z.id),
      positions,
    );
  const rows = materializeConnections(zones);
  const name = (id: string) => (id === "exterior" ? "Entrance" : zones.find((z) => z.id === id)?.name || "Zone");
  const pairs = rows.flatMap((z) =>
    contactNeighborIds(rows, z.id)
      .filter((id) => z.id < id)
      .map((id) => [z.id, id] as const),
  );
  const updateConnection = (a: string, b: string, connected: boolean) =>
    onConnections?.(
      rows.map((zone) => {
        const other = zone.id === a ? b : zone.id === b ? a : null;
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
  const select = (id: string) => {
    if (disabled) return;
    if (connecting && onConnections) {
      if (!first || !zones.some((z) => z.id === first)) setFirst(id);
      else if (first === id) setFirst(null);
      else {
        if (!contactNeighborIds(rows, first).includes(id)) updateConnection(first, id, true);
        setNotice(`${name(first)} connected to ${name(id)}.`);
        setFirst(null);
      }
    } else onSelect?.(id);
  };
  return (
    <section className="villages-zone-map" aria-label="Zone layout">
      <div className="villages-zone-map-toolbar">
        {onPositions ? <small>Drag Zones</small> : null}
        {onConnections ? (
          <button
            type="button"
            disabled={disabled}
            aria-pressed={connecting}
            onClick={() => {
              setConnecting(!connecting);
              setFirst(null);
              setNotice("");
            }}
          >
            {connecting ? "Done connecting" : "Connect Zones"}
          </button>
        ) : null}
      </div>
      <div className="villages-zone-map-canvas">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {pairs.map(([a, b]) => (
            <line
              key={JSON.stringify([a, b])}
              x1={layout[a].x + ZONE_TILE.width / 2}
              y1={layout[a].y + ZONE_TILE.height / 2}
              x2={layout[b].x + ZONE_TILE.width / 2}
              y2={layout[b].y + ZONE_TILE.height / 2}
            />
          ))}
        </svg>
        {zones.map((zone) => (
          <button
            type="button"
            key={zone.id}
            disabled={disabled}
            data-layout-zone={zone.id}
            data-draggable={!!onPositions}
            className="villages-zone-map-tile"
            style={{
              left: `${layout[zone.id].x}%`,
              top: `${layout[zone.id].y}%`,
              width: `${ZONE_TILE.width}%`,
              height: `${ZONE_TILE.height}%`,
            }}
            aria-pressed={first === zone.id || selectedId === zone.id}
            aria-label={name(zone.id)}
            title={name(zone.id)}
            onClick={(event) => {
              if (event.detail === 0) select(zone.id);
            }}
            onPointerDown={(event) => {
              if (disabled || event.button !== 0) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = {
                id: zone.id,
                pointer: event.pointerId,
                x: layout[zone.id].x,
                y: layout[zone.id].y,
                startX: event.clientX,
                startY: event.clientY,
                layout,
                moved: false,
              };
            }}
            onPointerMove={(event) => {
              const current = drag.current;
              if (!current || current.pointer !== event.pointerId || !onPositions || connecting || disabled) return;
              const dx = event.clientX - current.startX,
                dy = event.clientY - current.startY;
              if (!current.moved && Math.hypot(dx, dy) < 5) return;
              current.moved = true;
              const bounds = event.currentTarget.parentElement!.getBoundingClientRect();
              const position = {
                x: Math.round(Math.max(0, Math.min(68, current.x + (dx / bounds.width) * 100)) * 10) / 10,
                y: Math.round(Math.max(0, Math.min(86, current.y + (dy / bounds.height) * 100)) * 10) / 10,
              };
              if (!zonePositionFits(current.layout, zone.id, position)) {
                setNotice("Zones cannot overlap.");
                return;
              }
              current.layout = { ...current.layout, [zone.id]: position };
              setPreview(current.layout);
              setNotice("");
            }}
            onPointerUp={(event) => {
              const current = drag.current;
              if (!current || current.pointer !== event.pointerId) return;
              drag.current = null;
              setPreview(null);
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId);
              if (disabled) return;
              if (current.moved) onPositions?.(current.layout);
              else select(zone.id);
            }}
            onPointerCancel={(event) => {
              if (drag.current?.pointer !== event.pointerId) return;
              drag.current = null;
              setPreview(null);
            }}
            onLostPointerCapture={(event) => {
              if (drag.current?.pointer !== event.pointerId) return;
              drag.current = null;
              setPreview(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setConnecting(false);
                setFirst(null);
                return;
              }
              if (!onPositions || disabled || !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key))
                return;
              event.preventDefault();
              const amount = event.shiftKey ? 5 : 1;
              const position = {
                x: layout[zone.id].x + (event.key === "ArrowRight" ? amount : event.key === "ArrowLeft" ? -amount : 0),
                y: layout[zone.id].y + (event.key === "ArrowDown" ? amount : event.key === "ArrowUp" ? -amount : 0),
              };
              if (zonePositionFits(layout, zone.id, position)) {
                onPositions({ ...layout, [zone.id]: position });
                setNotice("");
              } else setNotice("Zones cannot overlap or leave the map.");
            }}
          >
            <strong>{name(zone.id)}</strong>
            {labels?.(zone)}
          </button>
        ))}
      </div>
      {connecting ? <p role="status">{first ? `Connect ${name(first)} to…` : "Select two Zones to connect."}</p> : null}
      {notice ? <p role="status">{notice}</p> : null}
      {onConnections && connecting && pairs.length ? (
        <ul className="villages-zone-map-connections" aria-label="Connections">
          {pairs.map(([a, b]) => (
            <li key={JSON.stringify([a, b])}>
              <span>
                {name(a)} ↔ {name(b)}
              </span>
              <button
                type="button"
                disabled={disabled}
                aria-label={`Remove connection ${name(a)} to ${name(b)}`}
                onClick={() => updateConnection(a, b, false)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {onConnections && connectionProblem(rows) ? (
        <p role="status">{connectionProblem(rows).replaceAll("Exterior", "Entrance")}</p>
      ) : null}
    </section>
  );
}
