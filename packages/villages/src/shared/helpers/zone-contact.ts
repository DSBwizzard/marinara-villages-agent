/** Structural doorways carry no information about attendance or entry permission. */
export function legacyContactNeighborIds(
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

export type ConnectedSpace = { id: string; kind?: string; venueClass?: string; connectedTo?: string[] };

/** Connections are undirected physical passages, independent of access policy. */
export function contactNeighborIds(zones: readonly ConnectedSpace[], zoneId: string): string[] {
  if (!zones.some((zone) => zone.connectedTo !== undefined))
    return legacyContactNeighborIds(zones as readonly { id: string; kind: string; venueClass?: string }[], zoneId);
  const ids = new Set(zones.map((zone) => zone.id));
  return [
    ...new Set(
      zones.flatMap((zone) =>
        zone.id === zoneId
          ? (zone.connectedTo ?? []).filter((id) => ids.has(id) && id !== zoneId)
          : zone.connectedTo?.includes(zoneId)
            ? [zone.id]
            : [],
      ),
    ),
  ].sort();
}

export function materializeConnections<T extends ConnectedSpace>(zones: readonly T[]): T[] {
  const legacy = !zones.some((zone) => zone.connectedTo !== undefined);
  return zones.map((zone) => ({
    ...zone,
    connectedTo: legacy
      ? legacyContactNeighborIds(zones as readonly { id: string; kind: string; venueClass?: string }[], zone.id)
      : [...(zone.connectedTo ?? [])],
  }));
}

export function connectionProblem(zones: readonly ConnectedSpace[]): string {
  const ids = new Set(zones.map((zone) => zone.id));
  if (!ids.has("exterior") || ids.size !== zones.length) return "Every space needs a unique ID and an Exterior.";
  for (const zone of zones) {
    const links = zone.connectedTo;
    if (
      !Array.isArray(links) ||
      links.some((id) => typeof id !== "string" || id === zone.id || !ids.has(id)) ||
      new Set(links).size !== links.length
    )
      return "Connections must reference other included spaces, without duplicates.";
  }
  const reached = new Set(["exterior"]),
    queue = ["exterior"];
  for (let index = 0; index < queue.length; index++)
    for (const next of contactNeighborIds(zones, queue[index]))
      if (!reached.has(next)) {
        reached.add(next);
        queue.push(next);
      }
  return reached.size === zones.length ? "" : "Every space needs a connection route to Exterior.";
}

export function applyConnectionEdits<T extends ConnectedSpace>(
  spaces: readonly T[],
  edits: readonly ConnectedSpace[],
): T[] {
  const changed = new Map(edits.filter((zone) => zone.connectedTo !== undefined).map((zone) => [zone.id, zone]));
  return spaces.map((zone) => ({
    ...zone,
    connectedTo: spaces
      .filter((other) => {
        if (zone.id === other.id) return false;
        const a = changed.get(zone.id),
          b = changed.get(other.id);
        if (a) return a.connectedTo!.includes(other.id);
        if (b) return b.connectedTo!.includes(zone.id);
        return contactNeighborIds(spaces, zone.id).includes(other.id);
      })
      .map((other) => other.id),
  }));
}
