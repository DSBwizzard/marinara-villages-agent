import { VillageIcon } from "../../shared/VillageIcon.js";
import type { MobileMapBox, MobileMapSize } from "./villages-mobile-map";
import { type CSSProperties, type DOMAttributes, type ReactNode, useLayoutEffect } from "react";

const P = "marinara-capability-villages";

export type ExplorationTab = "map" | "places" | "people" | "projects" | "more";

export type ExplorationSheet = { tab: "places" | "people" };

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
        document.activeElement.matches("." + P + "-locations-directory input");
      const inset =
        focused && viewport && viewport.scale === 1
          ? Math.max(0, host.getBoundingClientRect().bottom - viewport.offsetTop - viewport.height)
          : 0;
      host.style.setProperty("--villages-exploration-inset", inset + "px");
      if (inset > 0 && focused) document.activeElement?.scrollIntoView({ block: "nearest" });
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
  if (name === "people" || name === "projects" || name === "places") return <VillageIcon name={name} />;
  const paths: Record<typeof name, ReactNode> = {
    map: (
      <>
        <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z" />
        <path d="M9 3v16M15 5v16" />
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
      className="mari-rgb-static-icon"
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
          {tab === "more" ? <VillageIcon name="settings" /> : <MapIcon name={tab} />}
          <span>{tab === "places" ? "Locations" : tab[0].toUpperCase() + tab.slice(1)}</span>
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
  offset,
  pinInteractions,
}: {
  pins: ExplorationPin[];
  picture: MobileMapBox;
  frame: MobileMapSize;
  onNudge?(id: string, dx: number, dy: number): void;
  offset?: { id: string; x: number; y: number } | null;
  pinInteractions?(pin: ExplorationPin): DOMAttributes<HTMLButtonElement>;
}) {
  return (
    <>
      {pins
        .filter((pin) => pin.kind !== "person")
        .map((pin) => {
          const left = picture.left + pin.x * picture.width;
          const top = picture.top + pin.y * picture.height;
          if (left < 0 || top < 0 || left > frame.width || top > frame.height) return null;
          const pinLeft = left + (offset?.id === pin.id ? offset.x : 0);
          return (
            <span
              key={pin.id}
              className={P + "-explore-anchor"}
              style={
                {
                  left: pinLeft,
                  top: top + (offset?.id === pin.id ? offset.y : 0),
                  "--pin-left": `${pinLeft}px`,
                  "--pin-right": `${frame.width - pinLeft}px`,
                } as CSSProperties
              }
            >
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
                {...pinInteractions?.(pin)}
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
