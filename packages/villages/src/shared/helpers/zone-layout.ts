import { contactNeighborIds, type ConnectedSpace } from "./zone-contact.js";

/** Logical rectangles match the rendered percentage boxes at every viewport width. */
export const ZONE_TILE = { width: 32, height: 14 } as const;
export type ZonePosition = { x: number; y: number };
export type ZoneLayout = Record<string, ZonePosition>;
export type ZoneLayoutChange = {
  base: string;
  positions: ZoneLayout;
  connections: { id: string; connectedTo: string[] }[];
};
const slots: ZonePosition[] = [
  { x: 0, y: 0 },
  { x: 0, y: 24 },
  { x: 68, y: 12 },
  { x: 68, y: 42 },
  { x: 0, y: 48 },
  { x: 0, y: 84 },
  { x: 68, y: 84 },
];
export function zonePositionFits(layout: ZoneLayout, id: string, position: ZonePosition): boolean {
  const { x, y } = position;
  return (
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= 0 &&
    y >= 0 &&
    x <= 100 - ZONE_TILE.width &&
    y <= 100 - ZONE_TILE.height &&
    Object.entries(layout).every(
      ([other, p]) =>
        other === id ||
        x + ZONE_TILE.width <= p.x ||
        p.x + ZONE_TILE.width <= x ||
        y + ZONE_TILE.height <= p.y ||
        p.y + ZONE_TILE.height <= y,
    )
  );
}
export function readZoneLayout(value: unknown, ids: readonly string[]): ZoneLayout | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const layout: ZoneLayout = Object.create(null) as ZoneLayout;
  for (const [id, raw] of Object.entries(value)) {
    if (!ids.includes(id) || !raw || typeof raw !== "object" || Array.isArray(raw)) return null;
    const point = raw as ZonePosition;
    if (typeof point.x !== "number" || typeof point.y !== "number" || !zonePositionFits(layout, id, point)) return null;
    layout[id] = { x: point.x, y: point.y };
  }
  return layout;
}
/** Old saves and newly added Zones get free positions without moving authored rectangles. */
export function resolveZoneLayout(ids: readonly string[], saved?: ZoneLayout): ZoneLayout {
  const layout: ZoneLayout = Object.create(null) as ZoneLayout;
  for (const id of ids) if (saved?.[id] && zonePositionFits(layout, id, saved[id])) layout[id] = { ...saved[id] };
  for (const [index, id] of ids.entries()) {
    if (layout[id]) continue;
    const candidates = [slots[index % slots.length], ...slots];
    let position = candidates.find((p) => zonePositionFits(layout, id, p));
    if (!position) {
      for (let y = 0; y <= 86 && !position; y += 2)
        for (let x = 0; x <= 68 && !position; x += 2) if (zonePositionFits(layout, id, { x, y })) position = { x, y };
    }
    // Seven rectangles always fit the default layout; fragmented authored space may need repacking.
    if (!position) return Object.fromEntries(ids.map((key, i) => [key, { ...slots[i % slots.length] }]));
    layout[id] = { ...position };
  }
  return layout;
}
/** Public structure only, suitable for optimistic concurrency without attendance/interiors. */
export function zoneLayoutKey(zones: readonly ConnectedSpace[], saved?: ZoneLayout): string {
  const layout = resolveZoneLayout(
    zones.map((z) => z.id),
    saved,
  );
  return JSON.stringify(
    [...zones]
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((zone) => ({
        id: zone.id,
        connectedTo: contactNeighborIds(zones, zone.id),
        position: layout[zone.id],
      })),
  );
}
