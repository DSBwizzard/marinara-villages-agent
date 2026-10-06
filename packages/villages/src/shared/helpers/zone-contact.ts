/** Structural doorways carry no information about attendance or entry permission. */
export function contactNeighborIds(
  zones: readonly { id: string; kind: string; venueClass?: string }[],
  zoneId: string,
): string[] {
  const hubs = zones
    .filter((zone) => zone.kind === "public" || zone.kind === "shared-residence")
    .sort((a, b) => a.id.localeCompare(b.id));
  const edges: [string, string][] = hubs.map((zone) => ["exterior", zone.id]);
  for (const zone of zones) {
    if (zone.kind === "exterior" || hubs.includes(zone)) continue;
    const hub = hubs.find((entry) => entry.venueClass === zone.venueClass) ?? hubs[0];
    edges.push([hub?.id ?? "exterior", zone.id]);
  }
  return edges.flatMap(([a, b]) => (a === zoneId ? [b] : b === zoneId ? [a] : []));
}
