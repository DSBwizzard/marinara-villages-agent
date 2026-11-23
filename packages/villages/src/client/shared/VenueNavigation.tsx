import type { MouseEvent } from "react";
import { ArtworkImage } from "./ArtworkImage.js";
import { ELEMENT_TAG as P } from "./constants.js";
import { VillageIcon } from "./VillageIcon.js";

const SECTIONS = ["about", "zones", "arrangements"] as const;
export type VenueSection = (typeof SECTIONS)[number];

export function VenueSections({
  section,
  disabled,
  onSelect,
  manage = true,
  hidden = false,
  zone = false,
}: {
  section: VenueSection;
  disabled?: boolean;
  manage?: boolean;
  hidden?: boolean;
  zone?: boolean;
  onSelect(section: VenueSection): void;
}) {
  if (hidden || zone) return null;
  return (
    <nav className={`${P}-venue-sections`} aria-label="Venue sections">
      {SECTIONS.filter((entry) => manage || entry !== "arrangements").map((entry) => (
        <button
          type="button"
          key={entry}
          disabled={disabled}
          aria-pressed={section === entry}
          onClick={() => onSelect(entry)}
        >
          {entry[0]!.toUpperCase() + entry.slice(1)}
        </button>
      ))}
    </nav>
  );
}

export function VenueZoneRow({
  id,
  name,
  image,
  accessLabel,
  current,
  disabled,
  onOpen,
}: {
  id?: string;
  name: string;
  image?: string;
  accessLabel?: string;
  current?: boolean;
  disabled?: boolean;
  onOpen(event: MouseEvent<HTMLButtonElement>): void;
}) {
  return (
    <button
      type="button"
      data-layout-zone={id}
      aria-current={current || undefined}
      disabled={disabled}
      onClick={onOpen}
    >
      <span className={`${P}-venue-zone-thumb`} aria-hidden="true">
        {image ? <ArtworkImage src={image} alt="" tile /> : <VillageIcon name="places" />}
      </span>
      <span className={`${P}-venue-zone-caption`}>
        <span>{name}</span>
        {accessLabel ? (
          <>
            {" "}
            <small>{accessLabel}</small>
          </>
        ) : null}
      </span>
      <span className={`${P}-venue-zone-chevron`} aria-hidden="true">
        ›
      </span>
    </button>
  );
}
