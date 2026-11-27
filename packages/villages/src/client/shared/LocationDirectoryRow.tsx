import { ELEMENT_TAG as P } from "./constants.js";
import { VillageIcon } from "./VillageIcon.js";

export function LocationDirectoryRow({
  id,
  name,
  mapName,
  venue,
  compact,
  report,
  visited,
  disabled,
  onOpen,
}: {
  id: string;
  name: string;
  mapName?: string;
  venue: boolean;
  compact?: boolean;
  report?: boolean;
  visited?: boolean;
  disabled?: boolean;
  onOpen(): void;
}) {
  return (
    <button
      type="button"
      data-exploration-row={id}
      onClick={onOpen}
      disabled={disabled}
      aria-label={name + (venue ? ", Venue" : "")}
      title={compact ? name : undefined}
    >
      <VillageIcon name={venue ? "places" : "compass"} />
      <span className={`${P}-location-caption`}>
        <strong>{name}</strong>
        {!compact ? <small>{mapName}</small> : null}
      </span>
      {!compact ? (
        <span className={`${P}-location-status`}>
          {venue ? (
            <span className={`${P}-venue-badge`}>Venue</span>
          ) : report ? (
            <small>Reported</small>
          ) : visited === false ? (
            <small>Unvisited</small>
          ) : null}
        </span>
      ) : null}
      <span aria-hidden="true" className={`${P}-location-chevron`}>
        ›
      </span>
    </button>
  );
}
