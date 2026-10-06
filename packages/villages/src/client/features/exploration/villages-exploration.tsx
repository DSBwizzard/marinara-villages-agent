import type { MobileMapBox, MobileMapSize } from "./villages-mobile-map";
import { VenuePolaroid } from "./villages-venue-polaroid.js";
import { type ReactNode, useLayoutEffect, useRef } from "react";

const P = "marinara-capability-villages";

export type ExplorationTab = "map" | "places" | "people" | "more";

export type ExplorationSheet = { tab: "places" | "people" };

export type ExplorationRow = {
  id: string;
  name: string;
  detail: string;
  image?: string | null;
  face?: ReactNode;
  onSelect?: () => void;
};

export type ExplorationPin = {
  id: string;
  x: number;
  y: number;
  text: string;
  image?: string | null;
  kind?: "place" | "person";
  venueId?: string;
  selected?: boolean;
  onSelect?: () => void;
};
/** Keep sheets and navigation above keyboards that shrink only the visual viewport. */

export function useExplorationViewport(host: HTMLElement, active: boolean): void {
  useLayoutEffect(() => {
    if (!active) return;
    const viewport = window.visualViewport;
    const update = () => {
      const focused =
        document.activeElement instanceof Element &&
        host.contains(document.activeElement) &&
        document.activeElement.matches("." + P + "-explore-sheet input");
      const inset =
        focused && viewport && viewport.scale === 1
          ? Math.max(0, host.getBoundingClientRect().bottom - viewport.offsetTop - viewport.height)
          : 0;
      host.style.setProperty("--villages-exploration-inset", inset + "px");
    };
    const observer = new ResizeObserver(update);
    observer.observe(host);
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    host.addEventListener("focusin", update);
    host.addEventListener("focusout", update);
    update();
    return () => {
      observer.disconnect();
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      host.removeEventListener("focusin", update);
      host.removeEventListener("focusout", update);
      host.style.removeProperty("--villages-exploration-inset");
    };
  }, [host, active]);
}

export function MapIcon({ name }: { name: ExplorationTab | "close" | "notices" | "visit" }) {
  const paths: Record<typeof name, ReactNode> = {
    map: (
      <>
        <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z" />
        <path d="M9 3v16M15 5v16" />
      </>
    ),
    places: (
      <>
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    people: (
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-3a7 7 0 0 1 14 0v3ZM17 3a4 4 0 0 1 0 8M20 21v-3a7 7 0 0 0-3-6" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    notices: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 7h6M9 12h6M9 17h4" />
      </>
    ),
    visit: (
      <>
        <path d="M10 3H4v18h6M9 12h12m-4-4 4 4-4 4" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths[name]}
    </svg>
  );
}

export const EXPLORATION_DESTINATIONS = ["map", "places", "people", "more"] as const;

export function ExplorationNavigation({
  active,
  disabled,
  onChoose,
}: {
  active: ExplorationTab;
  disabled: boolean;
  onChoose: (tab: ExplorationTab, button: HTMLButtonElement) => void;
}) {
  return (
    <nav className={P + "-explore-nav"} aria-label="Village exploration">
      {EXPLORATION_DESTINATIONS.map((tab) => (
        <button
          key={tab}
          type="button"
          disabled={disabled}
          data-explore-tab={tab}
          aria-pressed={active === tab}
          onClick={(event) => onChoose(tab, event.currentTarget)}
        >
          <MapIcon name={tab} />
          <span>{tab[0].toUpperCase() + tab.slice(1)}</span>
        </button>
      ))}
    </nav>
  );
}

export function MobileMarkers({
  pins,
  picture,
  frame,
}: {
  pins: ExplorationPin[];
  picture: MobileMapBox;
  frame: MobileMapSize;
}) {
  return (
    <>
      {pins
        .filter((pin) => pin.kind !== "person")
        .map((pin) => {
          const left = picture.left + pin.x * picture.width;
          const top = picture.top + pin.y * picture.height;
          if (left < 0 || top < 0 || left > frame.width || top > frame.height) return null;
          const people = pins.filter((person) => person.kind === "person" && person.venueId === pin.id);
          return (
            <span key={pin.id} className={P + "-explore-anchor"} style={{ left, top }}>
              <button
                type="button"
                className={P + "-pin " + P + "-explore-marker"}
                data-selected={pin.selected ? "true" : "false"}
                data-pin-id={pin.id}
                data-kind="place"
                aria-label={pin.text}
                title={pin.text}
                disabled={!pin.onSelect}
                onClick={(event) => {
                  event.stopPropagation();
                  pin.onSelect?.();
                }}
              >
                <VenuePolaroid image={pin.image} name={pin.text} className={P + "-explore-polaroid"} />
                {people.length ? (
                  <span className={P + "-explore-initials"} aria-hidden="true">
                    {people.slice(0, 3).map((person) => (
                      <span key={person.id} className={P + "-explore-initial"} title={person.text}>
                        {Array.from(person.text.trim())[0]?.toLocaleUpperCase() || "•"}
                      </span>
                    ))}
                  </span>
                ) : null}
              </button>
            </span>
          );
        })}
    </>
  );
}

function ExplorationPanel({
  title,
  onClose,
  children,
  layout,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  layout: "sheet" | "side";
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, [title]);
  return (
    <section
      className={P + "-explore-sheet"}
      data-layout={layout}
      role="dialog"
      aria-label={title}
      aria-modal="false"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <header>
        <h2 ref={titleRef} tabIndex={-1}>
          {title}
        </h2>
        <button type="button" aria-label="Close exploration card" onClick={onClose}>
          <MapIcon name="close" />
        </button>
      </header>
      {children}
    </section>
  );
}

export function MobileSheet(props: { title: string; onClose: () => void; children: ReactNode }) {
  return <ExplorationPanel {...props} layout="sheet" />;
}

export function DesktopPanel(props: { title: string; onClose: () => void; children: ReactNode }) {
  return <ExplorationPanel {...props} layout="side" />;
}

export function NoticesButton({
  count,
  disabled,
  onSelect,
}: {
  count: number;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={P + "-explore-notices"}
      aria-label={`Notices (${count})`}
      disabled={disabled}
      onClick={onSelect}
    >
      <MapIcon name="notices" />
      <span>Notices</span>
      <span className={P + "-explore-badge"} aria-hidden="true">
        {count}
      </span>
    </button>
  );
}

export function BrowseList({
  rows,
  label,
  search,
  onSearch,
  disabled,
}: {
  rows: ExplorationRow[];
  label: string;
  search: string;
  onSearch: (value: string) => void;
  disabled: boolean;
}) {
  const filtered = rows.filter((row) => row.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return (
    <>
      <label className={P + "-explore-search"}>
        <span className={P + "-sr-only"}>Search {label.toLowerCase()}</span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={"Search " + label.toLowerCase() + "…"}
        />
      </label>
      <div className={P + "-explore-list"}>
        {filtered.map((row) => (
          <button
            type="button"
            className={P + "-explore-row"}
            key={row.id}
            data-exploration-row={row.id}
            disabled={disabled || !row.onSelect}
            onClick={row.onSelect}
          >
            {row.face ?? (
              <span className={P + "-explore-photo"}>
                {row.image ? <img src={row.image} alt="" /> : <MapIcon name="places" />}
              </span>
            )}
            <span>
              <strong>{row.name}</strong>
              <small>{row.detail}</small>
            </span>
          </button>
        ))}
        {filtered.length === 0 ? (
          <p className={P + "-explore-empty"} role="status">
            {search.trim() ? "No matches. Try another name." : "Nothing to show here yet."}
          </p>
        ) : null}
      </div>
    </>
  );
}

export function VenuePreview({
  image,
  type,
  actions,
  disabled,
}: {
  image: string | null | undefined;
  type: string;
  actions: { label: string; onSelect: () => void }[];
  disabled: boolean;
}) {
  return (
    <div className={P + "-explore-preview"}>
      <div className={P + "-explore-preview-detail"}>
        <span className={P + "-explore-photo"}>{image ? <img src={image} alt="" /> : <MapIcon name="places" />}</span>
        <span>{type}</span>
      </div>
      <div className={P + "-explore-preview-actions"}>
        {actions.map((action) => (
          <button
            type="button"
            key={action.label}
            data-primary={action.label === "Visit"}
            disabled={disabled}
            onClick={action.onSelect}
          >
            {action.label === "Visit" ? <MapIcon name="visit" /> : null}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
