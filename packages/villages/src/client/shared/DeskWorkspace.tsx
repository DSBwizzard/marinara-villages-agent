import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useVillageActivity } from "./activity.js";
import { ELEMENT_TAG as P } from "./constants.js";
import { DESK_STYLES } from "./desk-styles.js";
import { useLetterFont } from "./letter-font-css.js";
import { dayDeskArtworkReady, deskArtworkStyle, prepareDayDeskArtwork } from "./desk-art.js";

import { VillageIcon, VILLAGE_DESTINATIONS, type VillageDestination } from "./VillageIcon.js";

export type DeskDestination = VillageDestination;
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

export function DeskWorkspace({
  active,
  daylight,
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
  daylight: boolean;
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
  useLetterFont(active ? "lora" : undefined);
  const [, setDayReady] = useState(dayDeskArtworkReady);
  const dayTheme = daylight && dayDeskArtworkReady();
  useEffect(() => {
    if (!active || !daylight || dayTheme) return;
    let current = true;
    void prepareDayDeskArtwork().then(() => {
      if (current) setDayReady(dayDeskArtworkReady());
    });
    return () => {
      current = false;
    };
  }, [active, daylight, dayTheme]);
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
        data-theme={active ? (dayTheme ? "day" : "night") : undefined}
        data-venue={venue || undefined}
        data-phase={phase}
        style={deskArtworkStyle(active, dayTheme)}
        role={active === "people" ? "dialog" : active ? "region" : undefined}
        aria-label={active === "people" ? "People" : active ? "Village menu" : undefined}
        aria-modal={active === "people" ? true : undefined}
        onKeyDown={onKeyDown}
      >
        <style>{DESK_STYLES}</style>
        <header className={`${P}-desk-header`} hidden={!active}>
          <div className={`${P}-menu-brand`} aria-hidden="true">
            VILLAGES
            <svg viewBox="0 0 260 52" aria-hidden="true">
              <path d="M1 44Q18 41 25 38V31L32 25L39 32V37H46V25L53 19L61 26V34H67V21L74 13L82 21V30H88V19H93V13H96V19L103 25V32H112V17L119 9L126 17V30H134V15H139V6L143 1L147 6V15H152V30H163V20L172 12L181 21V35H188V28L194 22L201 29V37H210Q208 30 216 29Q222 28 223 35L227 39H234V33L241 27L248 34V41L259 44Q204 38 167 44Q130 54 91 46Q46 36 1 44Z" />
            </svg>
          </div>
          <nav className={`${P}-desk-nav`} aria-label="Village navigation">
            {VILLAGE_DESTINATIONS.map((destination) => (
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
                <VillageIcon name={destination} />
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
