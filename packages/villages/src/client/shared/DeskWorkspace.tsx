import { createContext, useContext, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { useVillageActivity } from "./activity.js";
import { ELEMENT_TAG as P } from "./constants.js";
import { DESK_STYLES } from "./desk-styles.js";
import { useLetterFont } from "./letter-font-css.js";
import { deskArtworkStyle } from "./desk-art.js";

export type DeskDestination = "people" | "projects" | "places" | "mailbox" | "settings";
export type DeskLeaveCheck = () => Promise<boolean>;
export const DeskLeaveGuard = createContext<{
  guard: RefObject<DeskLeaveCheck | null>;
  setDisabled(disabled: boolean): void;
} | null>(null);

/** The visible document owns its existing draft/save checks. */
export function useDeskLeaveGuard(check: DeskLeaveCheck, disabled: boolean) {
  const registration = useContext(DeskLeaveGuard);
  const { viewing } = useVillageActivity();
  useLayoutEffect(() => {
    if (!registration || viewing === false) return;
    const { guard, setDisabled } = registration;
    guard.current = check;
    setDisabled(disabled);
    return () => {
      if (guard.current === check) {
        guard.current = null;
        setDisabled(false);
      }
    };
  }, [registration, viewing, check, disabled]);
}

const icons: Record<DeskDestination, ReactNode> = {
  people: (
    <>
      <circle cx="12" cy="6" r="3.5" />
      <path d="M6 21v-3a6 6 0 0 1 12 0v3M4 4a3 3 0 0 0 0 6M20 4a3 3 0 0 1 0 6M1 19v-3a5 5 0 0 1 4-5M23 19v-3a5 5 0 0 0-4-5" />
    </>
  ),
  projects: (
    <>
      <path d="M8 4H5a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-3M9 2h6v4H9zM7 10l1 1 2-2M13 10h4M7 15l1 1 2-2M13 15h4M7 19h3M13 19h4" />
    </>
  ),
  places: (
    <>
      <path d="M20 9c0 6-8 13-8 13S4 15 4 9a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="9" r="3" />
    </>
  ),
  mailbox: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3 6 9 7 9-7" />
    </>
  ),
  settings: (
    <>
      <path d="m9 3 1-2h4l1 2 3 1 2 3-1 2v4l1 2-2 3-3 1-1 2h-4l-1-2-3-1-2-3 1-2V9L4 7l2-3Z" />
      <circle cx="12" cy="11" r="3" />
    </>
  ),
};

export function DeskWorkspace({
  active,
  venue,
  phase,
  disabled,
  artworkError,
  documentRef,
  onNavigate,
  onReturn,
  onScene,
  onKeyDown,
  children,
}: {
  active: DeskDestination | null;
  venue: boolean;
  phase: "open" | "preparing" | "opening" | "closing";
  disabled: boolean;
  artworkError: string;
  documentRef: RefObject<HTMLDivElement | null>;
  onNavigate(destination: DeskDestination): void;
  onReturn(): void;
  onScene?: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  children: ReactNode;
}) {
  useLetterFont(active ? "crimson-pro" : undefined);
  const scrollPositions = useRef(new Map<string | null, number>());
  useLayoutEffect(() => {
    const stage = documentRef.current?.parentElement;
    if (!stage) return;
    const key = venue ? "venue" : active;
    stage.scrollTop = scrollPositions.current.get(key) ?? 0;
    const positions = scrollPositions.current;
    return () => {
      positions.set(key, stage.scrollTop);
    };
  }, [active, venue, documentRef]);
  return (
    <div className={`${P}-desk-container`}>
      <div
        className={`${P}-desk-workspace`}
        data-desk={active ?? "none"}
        data-venue={venue || undefined}
        data-phase={phase}
        style={deskArtworkStyle(active)}
        role={active === "people" ? "dialog" : active ? "region" : undefined}
        aria-label={active === "people" ? "People" : active ? "Village menu" : undefined}
        aria-modal={active === "people" ? true : undefined}
        onKeyDown={onKeyDown}
      >
        <style>{DESK_STYLES}</style>
        <header className={`${P}-desk-header`} hidden={!active}>
          <div className={`${P}-menu-brand`} aria-hidden="true">
            VILLAGES
            <span />
          </div>
          <nav className={`${P}-desk-nav`} aria-label="Village navigation">
            {(Object.keys(icons) as DeskDestination[]).map((destination) => (
              <button
                type="button"
                key={destination}
                disabled={disabled || phase !== "open"}
                aria-disabled={disabled || phase !== "open"}
                aria-current={active === destination ? "page" : undefined}
                onClick={() => {
                  if (phase === "open") onNavigate(destination);
                }}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {icons[destination]}
                </svg>
                <span>{destination[0].toUpperCase() + destination.slice(1)}</span>
              </button>
            ))}
          </nav>
          {onScene ? (
            <button
              type="button"
              className={`${P}-desk-return ${P}-desk-scene`}
              aria-label="Return to Scene"
              disabled={disabled || phase !== "open"}
              aria-disabled={disabled || phase !== "open"}
              onClick={() => {
                if (phase === "open") onScene();
              }}
            >
              ← Scene
            </button>
          ) : null}
          <button
            type="button"
            className={`${P}-desk-return`}
            disabled={disabled || phase !== "open"}
            aria-disabled={disabled || phase !== "open"}
            onClick={() => {
              if (phase === "open") onReturn();
            }}
          >
            <span className={`${P}-desk-return-desktop`}>
              <span aria-hidden="true">← </span>Return to village
            </span>
            <span className={`${P}-desk-return-mobile`}>← Village</span>
          </button>
        </header>
        {artworkError ? (
          <p role="alert" className={`${P}-desk-art-error`}>
            {artworkError}
          </p>
        ) : null}
        <div className={`${P}-desk-stage`}>
          <div ref={documentRef} className={`${P}-desk-document`} inert={phase === "closing" || phase === "preparing"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
