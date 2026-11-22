import { useLayoutEffect, useRef, useState } from "react";
import { defaultView, MapStage } from "../exploration/MapStage.js";
import type { FoundingScreenController } from "./screen-contracts.js";
import { simpleFoundingMap } from "./simple-map.js";
import { FoundingDialog } from "./FoundingDialog.js";

export function FoundingReviewMap({
  controller,
  phone,
  disabled,
  onEdit,
}: {
  controller: FoundingScreenController;
  phone: boolean;
  disabled: boolean;
  onEdit(): void;
}) {
  const { setupVenues: venues, draftPins, setupMapSrc, setupMapShape, setupLocationName } = controller;
  const [selected, setSelected] = useState(venues[0]?.id);
  const [keyPage, setKeyPage] = useState(0);
  const [pageSize, setPageSize] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const room = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = room.current;
    if (!element) return;
    const measure = () => {
      const font = Number.parseFloat(getComputedStyle(element).fontSize);
      setPageSize(phone && element.clientHeight >= 200 + 6 * Math.max(44, font * 3) ? 6 : phone ? 3 : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [phone]);
  const pages = Math.max(1, Math.ceil(venues.length / pageSize));
  const page = Math.min(keyPage, pages - 1);
  const select = (id: string) => {
    setSelected(id);
    setKeyPage(Math.floor(venues.findIndex((venue) => venue.id === id) / pageSize));
  };
  const map = (
    <MapStage
      src={setupMapSrc || simpleFoundingMap()}
      alt={"Map of " + setupLocationName}
      shape={setupMapShape}
      view={defaultView("contain")}
      fitToRoom
      numberedPins
      placing={false}
      pins={draftPins.map((pin) => ({
        id: pin.id,
        x: pin.x,
        y: pin.y,
        label: pin.label,
        tone: pin.tone,
        text: String(venues.findIndex((venue) => venue.id === pin.id) + 1),
        selected: selected === pin.id,
        onSelect: disabled ? undefined : () => select(pin.id),
      }))}
    />
  );
  return (
    <div className="villages-review-map-content" ref={room}>
      <div className="villages-review-map-preview">
        {expanded ? null : map}
        <button
          type="button"
          className="villages-review-expand-map"
          aria-label="Expand map"
          disabled={disabled}
          onClick={() => setExpanded(true)}
        >
          <span aria-hidden="true">⤢</span>
        </button>
      </div>
      <ol className="villages-review-map-key" aria-label="Map places" start={page * pageSize + 1}>
        {venues.slice(page * pageSize, (page + 1) * pageSize).map((venue, index) => (
          <li key={venue.id}>
            <button
              type="button"
              disabled={disabled}
              aria-pressed={selected === venue.id}
              onClick={() => select(venue.id)}
            >
              <span className="villages-review-place-number">{page * pageSize + index + 1}</span>
              <span>
                {venue.name || "Unnamed place"}
                {venue.presentation.x == null || venue.presentation.y == null ? " · Not placed" : ""}
              </span>
            </button>
          </li>
        ))}
      </ol>
      {phone && pages > 1 ? (
        <nav className="villages-review-key-pages" aria-label="Map place pages">
          <button
            type="button"
            aria-label="Previous map places"
            disabled={disabled || page === 0}
            onClick={() => setKeyPage(page - 1)}
          >
            ‹
          </button>
          <span>
            {page + 1} / {pages}
          </span>
          <button
            type="button"
            aria-label="Next map places"
            disabled={disabled || page === pages - 1}
            onClick={() => setKeyPage(page + 1)}
          >
            ›
          </button>
        </nav>
      ) : null}
      {expanded ? (
        <FoundingDialog
          title="Map placements"
          className="villages-review-editor villages-review-expanded-map"
          onClose={() => setExpanded(false)}
        >
          <div className="villages-review-map-preview">{map}</div>
          <p>{venues.find((venue) => venue.id === selected)?.name}</p>
          <footer>
            <button type="button" onClick={() => setExpanded(false)}>
              Back
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                setExpanded(false);
                onEdit();
              }}
            >
              Edit placements
            </button>
          </footer>
        </FoundingDialog>
      ) : null}
    </div>
  );
}
