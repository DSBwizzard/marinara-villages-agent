import { useEffect, useRef } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { VillageLighting } from "../../../shared/helpers/village-lighting.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { placeSpot } from "../../shared/presentation.js";

export function StreetView({
  place,
  places,
  lighting,
  busy,
  error,
  ending,
  actions,
  onPath,
  onMap,
}: {
  place: VillageVenue;
  places: VillageVenue[];
  lighting: VillageLighting;
  busy: boolean;
  error: string;
  ending: string;
  actions: { label: string; onSelect: () => void }[];
  onPath: (place: VillageVenue) => void;
  onMap: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [place.id]);
  const entrance = place.zones?.find((zone) => zone.kind === "exterior");
  const image =
    (lighting === "night" && entrance?.dayNight ? entrance.nightImage : null) ??
    entrance?.image ??
    place.presentation.image;
  const origin = placeSpot(place);
  // shortcut: nearest placed Venues serve as paths until maps have authored routes.
  const paths = origin
    ? places
        .flatMap((candidate) => {
          const point = placeSpot(candidate);
          return candidate.id !== place.id && point
            ? [{ candidate, distance: Math.hypot(point.x - origin.x, point.y - origin.y) }]
            : [];
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2)
    : [];

  return (
    <section
      className={P + "-street-view"}
      aria-label="Street view"
      onKeyDown={(event) => {
        if (event.key !== "Escape" || busy) return;
        event.preventDefault();
        event.stopPropagation();
        onMap();
      }}
    >
      <div className={P + "-street-art"}>
        {image ? <img key={image.url} src={image.url} alt="" /> : null}
        <button type="button" aria-label="Back to map" disabled={busy} onClick={onMap}>
          ‹ Map
        </button>
      </div>
      <div className={P + "-street-controls"}>
        <div className={P + "-street-entrance"}>
          <h2 ref={heading} tabIndex={-1}>
            {place.name}
          </h2>
          <div className={P + "-street-actions"}>
            {actions.map((action) => (
              <button
                type="button"
                key={action.label}
                data-visit={action.label === "Visit" || undefined}
                disabled={busy}
                onClick={action.onSelect}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
        {paths.length ? (
          <nav className={P + "-street-actions"} aria-label="Paths">
            {paths.map(({ candidate }) => (
              <button type="button" key={candidate.id} disabled={busy} onClick={() => onPath(candidate)}>
                {candidate.name} →
              </button>
            ))}
          </nav>
        ) : null}
        {error ? <p role="alert">{error}</p> : null}
        {ending ? <p role="status">{ending}</p> : null}
      </div>
    </section>
  );
}
