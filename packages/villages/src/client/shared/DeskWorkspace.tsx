import { createContext, useContext, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import { useVillageActivity } from "./activity.js";
import { ELEMENT_TAG as P } from "./constants.js";
import { DESK_STYLES } from "./desk-styles.js";
import { useLetterFont } from "./letter-font-css.js";
import { deskArtworkStyle } from "./desk-art.js";

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
  useLetterFont(active === "people" ? "lora" : active ? "crimson-pro" : undefined);
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
            <svg viewBox="0 0 260 40" aria-hidden="true" style={{ fill: "#b97980", stroke: "none" }}>
              <path d="M0 33 14 30V24l5-5 5 5v6l9-2V17l7-6 7 6v10h8V20l6-5 6 5v7h8V16l5-7 5 7v10h12V18l6-5 6 5v8h8V9l6-6 6 6v17h9V13l5-6 5 6v14h8V6l5-6 5 6v22h10V18l6-5 6 5v11h8V22l7-6 7 6v9h10V21l5-5 5 5v11l14 2v4Q130 27 0 38Z" />
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
