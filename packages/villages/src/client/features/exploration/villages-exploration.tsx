import type { MobileMapBox, MobileMapSize } from "./villages-mobile-map";
import { type ReactNode, useEffect, useLayoutEffect, useRef } from "react";

const P = "marinara-capability-villages";

export type ExplorationTab = "map" | "places" | "people" | "projects" | "more";

export type ExplorationSheet = { tab: "places" | "people" };

export type ExplorationRow = {
  id: string;
  name: string;
  detail: string;
  onSelect?: () => void;
  selected?: boolean;
  actions?: { label: string; onSelect: () => void }[];
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

export function MapIcon({ name }: { name: ExplorationTab | "close" | "visit" }) {
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
    projects: (
      <>
        <path d="m14 5 5 5M3 21l9-9m1-8 3-2 6 6-2 3-7-7ZM3 21l3-1-2-2-1 3Z" />
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

export const EXPLORATION_DESTINATIONS = ["map", "places", "people", "projects", "more"] as const;

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

export function ExplorationMarkers({
  pins,
  picture,
  frame,
  onNudge,
}: {
  pins: ExplorationPin[];
  picture: MobileMapBox;
  frame: MobileMapSize;
  onNudge?(id: string, dx: number, dy: number): void;
}) {
  return (
    <>
      {pins
        .filter((pin) => pin.kind !== "person")
        .map((pin) => {
          const left = picture.left + pin.x * picture.width;
          const top = picture.top + pin.y * picture.height;
          if (left < 0 || top < 0 || left > frame.width || top > frame.height) return null;
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
                onKeyDown={(event) => {
                  if (!onNudge) return;
                  const delta: Record<string, [number, number]> = {
                    ArrowLeft: [-0.01, 0],
                    ArrowRight: [0.01, 0],
                    ArrowUp: [0, -0.01],
                    ArrowDown: [0, 0.01],
                  };
                  const step = delta[event.key];
                  if (!step) return;
                  event.preventDefault();
                  event.stopPropagation();
                  onNudge(pin.id, ...step);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  pin.onSelect?.();
                }}
              >
                <span className={P + "-map-point"} aria-hidden="true" />
                <span className={P + "-map-label"}>{pin.text}</span>
              </button>
            </span>
          );
        })}
    </>
  );
}

export function LocationNavigator({
  rows,
  search,
  onSearch,
  disabled,
  onClose,
  mobile,
  focusSearch,
}: {
  rows: ExplorationRow[];
  search: string;
  onSearch: (value: string) => void;
  disabled: boolean;
  onClose: () => void;
  mobile: boolean;
  focusSearch: boolean;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectedId = rows.find((row) => row.selected)?.id;
  useEffect(() => {
    if (focusSearch) searchRef.current?.focus({ preventScroll: true });
  }, [focusSearch]);
  useEffect(() => {
    listRef.current?.querySelector('[data-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [selectedId]);
  const filtered = rows.filter((row) => row.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return (
    <aside
      className={P + "-location-navigator " + P + "-explore-sheet"}
      data-layout={mobile ? "navigator-sheet" : "navigator-rail"}
      aria-label="Places navigator"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <header>
        <h2>Places</h2>
        <button type="button" aria-label={mobile ? "Close places" : "Collapse places"} onClick={onClose}>
          <MapIcon name="close" />
        </button>
      </header>
      <label className={P + "-explore-search"}>
        <span className={P + "-sr-only"}>Search places</span>
        <input
          ref={searchRef}
          autoComplete="off"
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Find a place"
        />
      </label>
      <div ref={listRef} className={P + "-explore-list"}>
        {filtered.map((row) => (
          <div key={row.id} className={P + "-navigator-place"} data-selected={row.selected ? "true" : "false"}>
            <button
              type="button"
              className={P + "-explore-row"}
              data-exploration-row={row.id}
              aria-pressed={row.selected === true}
              disabled={disabled || !row.onSelect}
              onClick={row.onSelect}
            >
              <MapIcon name="places" />
              <span>
                <strong>{row.name}</strong>
                <small>{row.detail}</small>
              </span>
            </button>
            {row.selected ? (
              <div className={P + "-navigator-actions"}>
                {row.actions?.map((action) => (
                  <button key={action.label} type="button" disabled={disabled} onClick={action.onSelect}>
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {filtered.length === 0 ? (
          <p className={P + "-explore-empty"} role="status">
            {search.trim() ? "No matching places." : "No places yet."}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
