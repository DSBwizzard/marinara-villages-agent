/** The visible photograph and label, measured against the map picture. */
export function photoPinFits(
  point: { x: number; y: number },
  pins: Array<{ x: number; y: number; kind?: string }>,
  map: { width: number; height: number },
  card: { width: number; height: number },
): boolean {
  const xGap = Math.max((card.width + 6) / map.width, 0.15);
  const yGap = Math.max((card.height + 6) / map.height, 0.22);
  return pins.every(
    (pin) => pin.kind === "person" || Math.abs(pin.x - point.x) >= xGap || Math.abs(pin.y - point.y) >= yGap,
  );
}
