export function HomeFields({
  venues,
  venueId,
  zoneId,
  zones,
  onVenue,
  onZone,
  fixedVenue = false,
  fixedZone = false,
}: {
  venues: readonly { id: string; name: string }[];
  venueId: string;
  zoneId: string;
  zones: readonly { id: string; name?: string }[];
  onVenue(id: string): void;
  onZone(id: string): void;
  fixedVenue?: boolean;
  fixedZone?: boolean;
}) {
  return (
    <div className="villages-manage-form villages-home-fields">
      {!fixedVenue && (
        <label>
          Venue
          <select aria-label="Venue" value={venueId} onChange={(e) => onVenue(e.target.value)}>
            <option value="">Choose a Venue</option>
            {venues.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {!fixedZone && (
        <label>
          Sleeps in
          <select aria-label="Sleeps in" value={zoneId} onChange={(e) => onZone(e.target.value)}>
            <option value="">Choose a Zone</option>
            {zones.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name || "Zone"}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
