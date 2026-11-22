export function placesPage(snapshot, query = "") {
  return placeDirectoryPage(
    snapshot.settings.venues.map((venue) => ({
      id: venue.id,
      name: venue.name,
      description: venue.description,
      revision: 0,
      mapId: venue.presentation.mapId,
      x: venue.presentation.x,
      y: venue.presentation.y,
      venue: true,
      visited: true,
      report: false,
    })),
    query,
  );
}

export function placeDirectoryPage(items, query = "") {
  const params = typeof query === "string" ? new URLSearchParams({ query }) : query;
  const search = (params.get("query") ?? "").trim().toLocaleLowerCase();
  const scoped = items.filter(
    (row) =>
      (!search || row.name.toLocaleLowerCase().includes(search)) &&
      (!params.get("mapId") || row.mapId === params.get("mapId")),
  );
  const venues = scoped.filter((row) => row.venue).length,
    kind = params.get("kind") ?? "all";
  const rows = scoped
    .filter((row) => kind === "all" || (kind === "venues" ? row.venue : !row.venue))
    .sort(
      (a, b) =>
        (kind === "all" ? Number(b.venue) - Number(a.venue) : 0) ||
        a.name.localeCompare(b.name, "en", { sensitivity: "base" }) ||
        a.id.localeCompare(b.id, "en"),
    );
  const limit = Number(params.get("limit") || 50),
    offset = rows.length
      ? Math.min(Number(params.get("cursor") || 0), Math.floor((rows.length - 1) / limit) * limit)
      : 0;
  return {
    items: rows.slice(offset, offset + limit),
    offset,
    total: rows.length,
    counts: { all: scoped.length, venues, other: scoped.length - venues },
    previousCursor: offset ? String(Math.max(0, offset - limit)) : null,
    nextCursor: offset + limit < rows.length ? String(offset + limit) : null,
  };
}
