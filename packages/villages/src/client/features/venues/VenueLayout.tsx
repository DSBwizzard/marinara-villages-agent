import { useLayoutEffect, useRef, useState } from "react";
import { contactNeighborIds } from "../../../shared/helpers/zone-contact.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import type { VenueDisplayZone } from "./venue-view.js";

export function ZoneAccessLabels({ zone }: { zone: VenueDisplayZone }) {
  return (
    <>
      {zone.isPrivate ? <small>Private</small> : null}
      <small>{zone.accessLabel}</small>
      {zone.restricted && zone.allowed ? <small>Permission needed</small> : null}
    </>
  );
}

/** Selecting a layout tile never enters or discovers a Zone. */
export function VenueLayout({
  zones,
  selectedId,
  onSelect,
}: {
  zones: VenueDisplayZone[];
  selectedId: string;
  onSelect(id: string): void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<{ key: string; from: string; to: string; d: string }[]>([]);
  const topology = JSON.stringify(
    zones.map(({ id, kind, venueClass, connectedTo }) => ({ id, kind, venueClass, connectedTo })),
  );
  const layout = JSON.parse(topology) as VenueDisplayZone[];
  const levels: string[][] = [];
  const pending = new Set(layout.map((zone) => zone.id));
  let next = [layout.find((zone) => zone.kind === "exterior")?.id ?? layout[0]?.id].filter((id): id is string => !!id);
  while (pending.size) {
    const row = [...new Set(next)].filter((id) => pending.has(id));
    if (!row.length) row.push(pending.values().next().value!);
    levels.push(row);
    row.forEach((id) => pending.delete(id));
    next = row.flatMap((id) => contactNeighborIds(layout, id));
  }
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const layout = JSON.parse(topology) as VenueDisplayZone[];
    const update = () => {
      const bounds = element.getBoundingClientRect();
      const buttons = new Map(
        [...element.querySelectorAll<HTMLButtonElement>("[data-layout-zone]")].map((button) => [
          button.dataset.layoutZone!,
          button.getBoundingClientRect(),
        ]),
      );
      setLines(
        layout.flatMap((zone) =>
          contactNeighborIds(layout, zone.id)
            .filter((id) => zone.id < id)
            .flatMap((id) => {
              const a = buttons.get(zone.id),
                b = buttons.get(id);
              if (!a || !b) return [];
              const x1 = a.x + a.width / 2,
                y1 = a.y + a.height / 2;
              const x2 = b.x + b.width / 2,
                y2 = b.y + b.height / 2;
              const obstructed = [...buttons.entries()].some(
                ([key, rect]) =>
                  key !== zone.id &&
                  key !== id &&
                  Array.from({ length: 49 }, (_, i) => (i + 1) / 50).some((t) => {
                    const x = x1 + (x2 - x1) * t,
                      y = y1 + (y2 - y1) * t;
                    return x > rect.left - 4 && x < rect.right + 4 && y > rect.top - 4 && y < rect.bottom + 4;
                  }),
              );
              let d = `M ${x1 - bounds.x} ${y1 - bounds.y} L ${x2 - bounds.x} ${y2 - bounds.y}`;
              if (obstructed) {
                const [source, target] = a.top <= b.top ? [a, b] : [b, a];
                const sx = source.x + source.width / 2 - bounds.x,
                  tx = target.x + target.width / 2 - bounds.x;
                const sy = source.bottom - bounds.y,
                  ty = target.top - bounds.y;
                const lane = bounds.width - 6;
                d = `M ${sx} ${sy} V ${sy + 8} H ${lane} V ${ty - 8} H ${tx} V ${ty}`;
              }
              return [{ key: zone.id + ":" + id, from: zone.id, to: id, d }];
            }),
        ),
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.querySelectorAll("button").forEach((button) => observer.observe(button));
    return () => observer.disconnect();
  }, [topology]);
  return (
    <div ref={root} className={`${ELEMENT_TAG}-venue-layout`} aria-label="Zone layout">
      <svg aria-hidden="true">
        {lines.map((line) => (
          <path
            key={line.key}
            d={line.d}
            data-from={line.from}
            data-to={line.to}
            data-selected={line.from === selectedId || line.to === selectedId ? "true" : "false"}
          />
        ))}
      </svg>
      {levels.map((ids) => (
        <div className={`${ELEMENT_TAG}-venue-layout-level`} key={ids.join(":")}>
          {ids.map((id) => {
            const zone = zones.find((zone) => zone.id === id)!;
            return (
              <button
                key={id}
                type="button"
                data-layout-zone={id}
                aria-pressed={selectedId === id}
                onClick={() => onSelect(id)}
              >
                <strong>{zone.name}</strong>
                <ZoneAccessLabels zone={zone} />
                <span className={`${ELEMENT_TAG}-sr-only`}>
                  Connected to{" "}
                  {contactNeighborIds(zones, id)
                    .map((neighbor) => zones.find((entry) => entry.id === neighbor)?.name)
                    .join(", ") || "no other Zones"}
                </span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
