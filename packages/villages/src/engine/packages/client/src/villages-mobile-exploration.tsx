import { useLayoutEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from "react";
import type { MobileMapBox, MobileMapSize } from "./villages-mobile-map";
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

export function MapIcon({
  name,
}: {
  name: ExplorationTab | "close" | "notices" | "plus" | "minus" | "reset" | "visit";
}) {
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
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    reset: (
      <>
        <path d="M3 10a9 9 0 1 1 1 7M3 4v6h6" />
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

export function MobileMapControls({
  canZoomIn,
  canZoomOut,
  onZoom,
  onReset,
}: {
  canZoomIn: boolean;
  canZoomOut: boolean;
  onZoom: (factor: number) => void;
  onReset: () => void;
}) {
  const start = useRef<{ id: number; x: number; y: number } | null>(null);
  const consumed = useRef(false);
  const begin = (event: ReactPointerEvent<HTMLButtonElement>) => {
    consumed.current = false;
    if (event.pointerType !== "touch") return;
    start.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const end = (event: ReactPointerEvent<HTMLButtonElement>, action: () => void) => {
    const down = start.current;
    start.current = null;
    if (!down || event.pointerType !== "touch" || down.id !== event.pointerId) return;
    consumed.current = true;
    event.preventDefault();
    if (Math.hypot(event.clientX - down.x, event.clientY - down.y) <= 8) action();
  };
  const controls = [
    { name: "plus" as const, label: "Zoom in", disabled: !canZoomIn, action: () => onZoom(1.25) },
    { name: "minus" as const, label: "Zoom out", disabled: !canZoomOut, action: () => onZoom(0.8) },
    { name: "reset" as const, label: "Reset map view", disabled: false, action: onReset },
  ];
  return (
    <div className={P + "-explore-controls " + P + "-zoom"} aria-label="Map controls">
      {controls.map((control) => (
        <button
          key={control.name}
          type="button"
          aria-label={control.label}
          disabled={control.disabled}
          onPointerDown={begin}
          onPointerCancel={() => {
            start.current = null;
            consumed.current = true;
          }}
          onPointerUp={(event) => {
            if (!control.disabled) end(event, control.action);
          }}
          onClick={(event) => {
            event.stopPropagation();
            if (event.detail !== 0 && consumed.current) {
              consumed.current = false;
              return;
            }
            control.action();
          }}
        >
          <MapIcon name={control.name} />
          {control.name === "reset" ? <span>Reset</span> : null}
        </button>
      ))}
    </div>
  );
}

export function MobileNavigation({
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
      {(["map", "places", "people", "more"] as const).map((tab) => (
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
                <span className={P + "-pin-photo-card " + P + "-explore-polaroid"}>
                  <span className={P + "-pin-photo"} aria-hidden="true">
                    {pin.image ? <img src={pin.image} alt="" draggable={false} /> : <MapIcon name="places" />}
                    <span className={P + "-pin-photo-tack"} />
                  </span>
                  <span className={P + "-pin-name"}>{pin.text}</span>
                </span>
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

export function MobileSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    titleRef.current?.focus({ preventScroll: true });
  }, []);
  return (
    <section
      className={P + "-explore-sheet"}
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

export function BrowseList({ rows, label }: { rows: ExplorationRow[]; label: string }) {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((row) => row.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return (
    <>
      <label className={P + "-explore-search"}>
        <span className={P + "-sr-only"}>Search {label.toLowerCase()}</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={"Search " + label.toLowerCase() + "…"}
        />
      </label>
      <div className={P + "-explore-list"}>
        {filtered.map((row) => (
          <button
            type="button"
            className={P + "-explore-row"}
            key={row.id}
            disabled={!row.onSelect}
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

export const MOBILE_EXPLORATION_STYLES = `
.${P}-sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
.${P}-home-full[data-mobile="true"] { --${P}-map-wood: 4px; --${P}-map-mat: 0px; padding: 0; gap: 0; background: #111b35; color: #eef2ff; }
.${P}-home-full[data-mobile="true"] .${P}-home-bar { min-height: 44px; padding: 0 8px; gap: 6px; box-sizing: border-box; }
.${P}-home-full[data-mobile="true"] .${P}-mobile-datetime { border: 0; background: transparent; color: #eef2ff; padding: 0; gap: 6px; font-size: 18px; }
.${P}-home-full[data-mobile="true"] .${P}-mobile-clock { flex-direction: row; gap: 6px; font-size: clamp(11px, 3.1cqw, 14px); line-height: 1.2; }
.${P}-home-full[data-mobile="true"] .${P}-mobile-clock strong::before { content: "· "; font-weight: 400; }
.${P}-explore-notices { display: inline-flex; align-items: center; gap: 4px; min-height: 44px; border: 0; border-radius: 8px; background: #1c2e52; color: #eef2ff; padding: 0 8px; font-size: 12px; cursor: pointer; }
.${P}-explore-notices svg { width: 18px; height: 18px; }
.${P}-home-full[data-mobile="true"] .${P}-room { margin: 4px; }
.${P}-explore-nav { display: flex; flex: 0 0 auto; min-height: 56px; padding-bottom: env(safe-area-inset-bottom, 0px); border-top: 1px solid #33476a; background: #111b35; }
.${P}-explore-nav button { flex: 1; min-width: 0; min-height: 56px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; border: 0; border-top: 3px solid transparent; background: transparent; color: #c8d4ef; font: inherit; font-size: 12px; cursor: pointer; }
.${P}-explore-nav button[aria-pressed="true"] { color: #ba9cff; border-top-color: #9676ed; background: #1c2443; }
.${P}-explore-nav svg { width: 23px; height: 23px; }
.${P}-explore-controls { position: absolute; top: 8px; right: 8px; bottom: auto; left: auto; transform: none; z-index: 10; display: grid; gap: 4px; }
.${P}-explore-controls button { width: 48px; height: 48px; border: 1px solid #405984; border-radius: 10px; background: #111b35ed; color: #eef2ff; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 10px; }
.${P}-explore-controls svg { width: 23px; height: 23px; }
.${P}-explore-controls button:disabled { opacity: .55; }
.${P}-explore-anchor { position: absolute; width: 0; height: 0; z-index: 2; }
.${P}-explore-anchor:has([data-selected="true"]) { z-index: 3; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-marker.${P}-pin { position: absolute; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 64px; height: 76px; min-width: 48px; min-height: 48px; max-width: none; box-sizing: border-box; left: 0; top: 0; transform: translate(-50%, -50%); background: transparent; color: #eef2ff; border: 0; padding: 0; box-shadow: none; gap: 2px; cursor: pointer; z-index: 2; overflow: visible; }
.${P}-explore-photo { display: grid; place-items: center; flex: 0 0 40px; width: 40px; height: 40px; border: 2px solid #eee5d5; box-sizing: border-box; border-radius: 5px; background: #1c2e52; color: #c8d4ef; overflow: hidden; }
.${P}-explore-photo img { display: block; width: 100%; height: 100%; object-fit: contain; }
.${P}-explore-photo svg { width: 24px; height: 24px; }
.${P}-explore-face { position: relative; display: grid; place-items: center; flex: 0 0 auto; width: 36px; height: 36px; min-width: 36px; max-width: 36px; min-height: 36px; max-height: 36px; border-radius: 50%; border: 2px solid #eee5d5; background: #1c2e52; overflow: hidden; box-sizing: border-box; color: #eef2ff; }
.${P}-explore-face img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-polaroid.${P}-pin-photo-card { width: 56px; flex: 0 0 auto; padding: 3px; gap: 2px; box-sizing: border-box; border: 1px solid #e5dac5; border-radius: 2px; background: #faf4e7; color: #30261c; box-shadow: 0 3px 8px #0009; transform: none; transition: none; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-polaroid .${P}-pin-photo { position: relative; display: grid; place-items: center; width: 100%; aspect-ratio: 1 / 1; background: #201e29; overflow: visible; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-polaroid .${P}-pin-photo img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; object-fit: contain; }
.${P}-explore-polaroid .${P}-pin-photo svg { width: 24px; height: 24px; color: #c8d4ef; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-polaroid .${P}-pin-name { display: block; width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; font-weight: 600; line-height: 12px; color: #30261c; }
.${P}-home-full[data-mobile="true"] .${P}-stage .${P}-explore-marker[data-selected="true"] .${P}-explore-polaroid.${P}-pin-photo-card { box-shadow: 0 0 0 2px #ba9cff, 0 3px 8px #0009; }
.${P}-explore-initials { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); display: flex; gap: 2px; pointer-events: none; }
.${P}-explore-initial { display: grid; place-items: center; width: 14px; height: 14px; flex: 0 0 auto; box-sizing: border-box; border: 1px solid #c8b8e5; border-radius: 50%; background: #27304b; color: #eee5fa; font-size: 9px; line-height: 1; font-weight: 600; }
.${P}-explore-sheet { position: absolute; z-index: 20; bottom: 0; left: 0; right: 0; display: flex; flex-direction: column; max-height: 82%; border: 1px solid #405984; border-radius: 16px 16px 5px 5px; background: #111b35fa; color: #eef2ff; box-shadow: 0 -6px 24px #050a1870; overflow: hidden; }
.${P}-explore-sheet header { flex: 0 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px 0 12px; }
.${P}-explore-sheet h2 { margin: 0; font-size: 18px; line-height: 1.3; overflow-wrap: anywhere; max-height: 3.9em; overflow-y: auto; }
.${P}-explore-sheet header button { flex: 0 0 48px; height: 48px; border: 0; background: transparent; color: #eef2ff; cursor: pointer; }
.${P}-explore-sheet header svg { width: 24px; height: 24px; }
.${P}-explore-search { flex: 0 0 auto; padding: 4px 12px 8px; }
.${P}-explore-search input { width: 100%; box-sizing: border-box; min-height: 44px; border: 1px solid #405984; border-radius: 8px; background: #1c2e52; color: #eef2ff; padding: 8px; font: inherit; font-size: 16px; }
.${P}-explore-search input::placeholder { color: #b8c6df; }
.${P}-explore-list { min-height: 0; overflow-y: auto; overscroll-behavior: contain; touch-action: pan-y; padding: 0 12px 10px; }
.${P}-explore-row { box-sizing: border-box; min-width: 0; display: flex; align-items: center; gap: 10px; width: 100%; min-height: 60px; padding: 8px 0; border: 0; border-bottom: 1px solid #33476a; background: transparent; color: #eef2ff; text-align: left; font: inherit; cursor: pointer; }
.${P}-explore-row > span:last-child { min-width: 0; flex: 1; }
.${P}-explore-row strong, .${P}-explore-row small { display: block; overflow-wrap: anywhere; }
.${P}-explore-row strong { font-size: 14px; }
.${P}-explore-row small { color: #b8c6df; font-size: 12px; margin-top: 3px; }
.${P}-explore-row:disabled { cursor: default; color: #b8c6df; }
.${P}-explore-empty { color: #b8c6df; font-size: 14px; padding: 12px 0; }
.${P}-explore-preview { min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 0 12px 12px; }
.${P}-explore-preview-detail { display: flex; align-items: center; gap: 10px; margin: 4px 0 12px; font-size: 13px; color: #b8c6df; }
.${P}-explore-preview-detail .${P}-explore-photo { width: 56px; height: 56px; flex-basis: 56px; }
.${P}-explore-preview-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.${P}-explore-preview-actions button { flex: 1 1 100px; min-height: 48px; display: flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid #52688f; border-radius: 10px; background: #1c2e52; color: #eef2ff; font: inherit; font-size: 14px; cursor: pointer; }
.${P}-explore-preview-actions button[data-primary="true"] { background: #7953cf; border-color: #ba9cff; }
.${P}-explore-preview-actions svg { width: 22px; height: 22px; }
.${P}-home-full[data-mobile="true"] button:focus-visible, .${P}-explore-sheet input:focus-visible { outline: 3px solid #ba9cff; outline-offset: -2px; }
.${P}-explore-sheet h2:focus { outline: none; }
.${P}-mobile-events-page .${P}-news-panel { position: static; width: auto; max-height: none; box-shadow: none; }
.${P}-explore-nav { position: relative; z-index: 30; transform: translateY(calc(-1 * var(--villages-exploration-inset, 0px))); }
.${P}-explore-sheet { bottom: var(--villages-exploration-inset, 0px); max-height: max(0px, calc(82% - var(--villages-exploration-inset, 0px))); }
@container (max-height: 350px) {
 .${P}-explore-sheet { max-height: max(0px, calc(100% - var(--villages-exploration-inset, 0px))); }
 .${P}-explore-controls { display: flex; }
 .${P}-explore-preview-detail { display: none; }
}
`;
