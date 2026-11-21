export function placesPage(snapshot, query = "") {
  const search = query.trim().toLocaleLowerCase();
  return {
    items: snapshot.settings.venues
      .filter((venue) => venue.name.toLocaleLowerCase().includes(search))
      .map((venue) => ({
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
    nextCursor: null,
  };
}
