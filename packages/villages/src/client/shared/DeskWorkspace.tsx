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
            <svg viewBox="0 0 260 52" aria-hidden="true" style={{ fill: "#b97980", stroke: "none" }}>
              <path
                fillRule="evenodd"
                d="M142.5 1L146.67 1L147.71 7.25L148.75 7.25L148.75 9.33L149.79 9.33L149.79 10.38L148.75 10.38L148.75 27.04L152.92 26L152.92 19.75L155 18.71L155 16.63L156.04 16.63L156.04 15.58L168.54 15.58L168.54 20.79L169.58 20.79L169.58 21.83L172.71 21.83L172.71 20.79L173.75 20.79L173.75 18.71L174.79 18.71L175.83 16.63L176.88 16.63L176.88 13.5L178.96 12.46L178.96 16.63L180 16.63L180 17.67L181.04 17.67L182.08 19.75L183.13 19.75L183.13 21.83L184.17 21.83L185.21 23.92L186.25 23.92L186.25 32.25L188.33 32.25L189.38 26L193.54 26L193.54 28.08L195.63 28.08L195.63 27.04L196.67 27.04L196.67 26L197.71 26L198.75 23.92L199.79 23.92L199.79 22.88L201.88 22.88L201.88 21.83L202.92 21.83L203.96 19.75L205 19.75L205 20.79L206.04 20.79L206.04 24.96L208.13 24.96L209.17 27.04L211.25 27.04L211.25 28.08L212.29 28.08L212.29 30.17L211.25 30.17L211.25 33.29L212.29 33.29L212.29 34.33L217.5 34.33L217.5 35.38L218.54 35.38L220.63 31.21L222.71 31.21L222.71 30.17L226.88 30.17L226.88 31.21L227.92 31.21L227.92 33.29L230 33.29L230 34.33L231.04 34.33L231.04 37.46L232.08 37.46L232.08 38.5L240.42 38.5L240.42 39.54L242.5 39.54L242.5 40.58L250.83 41.63L250.83 42.67L252.92 42.67L252.92 43.71L239.38 42.67L239.38 41.63L233.13 41.63L233.13 42.67L232.08 42.67L232.08 41.63L223.75 41.63L223.75 42.67L221.67 42.67L221.67 41.63L218.54 41.63L218.54 42.67L213.33 42.67L213.33 43.71L200.83 43.71L200.83 44.75L195.63 44.75L195.63 45.79L185.21 45.79L185.21 46.83L181.04 46.83L181.04 45.79L173.75 45.79L173.75 44.75L153.96 44.75L153.96 45.79L144.58 45.79L144.58 46.83L139.38 46.83L139.38 47.88L132.08 47.88L132.08 48.92L126.88 48.92L126.88 49.96L117.5 49.96L117.5 51L103.96 51L103.96 49.96L94.58 49.96L94.58 48.92L88.33 48.92L88.33 47.88L84.17 47.88L84.17 46.83L78.96 46.83L78.96 45.79L75.83 45.79L75.83 44.75L70.63 44.75L70.63 43.71L67.5 43.71L67.5 42.67L60.21 42.67L60.21 41.63L48.75 40.58L48.75 39.54L25.83 39.54L25.83 40.58L16.46 40.58L16.46 41.63L10.21 41.63L10.21 40.58L16.46 39.54L16.46 38.5L19.58 38.5L19.58 37.46L23.75 37.46L23.75 36.42L27.92 36.42L27.92 35.38L33.13 35.38L34.17 31.21L35.21 31.21L35.21 30.17L37.29 30.17L37.29 29.13L38.33 29.13L38.33 27.04L40.42 27.04L40.42 30.17L45.63 30.17L45.63 31.21L46.67 31.21L46.67 34.33L51.88 34.33L51.88 29.13L52.92 29.13L52.92 27.04L53.96 27.04L53.96 26L55 26L56.04 23.92L57.08 23.92L57.08 21.83L59.17 21.83L59.17 20.79L60.21 20.79L60.21 18.71L62.29 19.75L62.29 21.83L64.38 21.83L64.38 22.88L65.42 22.88L65.42 23.92L66.46 23.92L67.5 26L68.54 26L68.54 31.21L67.5 31.21L68.54 33.29L70.63 32.25L70.63 30.17L69.58 30.17L69.58 29.13L70.63 29.13L70.63 27.04L72.71 26L72.71 23.92L73.75 23.92L73.75 22.88L81.04 22.88L81.04 21.83L82.08 21.83L82.08 18.71L83.13 18.71L83.13 17.67L85.21 17.67L85.21 21.83L86.25 21.83L87.29 23.92L89.38 23.92L89.38 24.96L90.42 24.96L90.42 27.04L92.5 28.08L92.5 30.17L91.46 30.17L91.46 31.21L93.54 31.21L93.54 29.13L95.63 29.13L95.63 32.25L97.71 32.25L97.71 27.04L98.75 27.04L98.75 24.96L100.83 23.92L100.83 21.83L102.92 21.83L102.92 20.79L103.96 20.79L103.96 18.71L105 18.71L105 20.79L114.38 20.79L114.38 18.71L115.42 18.71L115.42 17.67L116.46 17.67L116.46 20.79L118.54 20.79L118.54 21.83L120.63 22.88L120.63 24.96L121.67 24.96L121.67 26L120.63 26L120.63 31.21L122.71 31.21L122.71 30.17L123.75 30.17L123.75 27.04L124.79 27.04L125.83 24.96L126.88 24.96L126.88 22.88L127.92 22.88L127.92 21.83L135.21 21.83L135.21 22.88L137.29 23.92L137.29 26L138.33 26L138.33 29.13L140.42 29.13L140.42 10.38L139.38 10.38L139.38 9.33L140.42 9.33L140.42 7.25L141.46 7.25L142.5 1ZM144.58 13.5L143.54 13.5L143.54 15.58L145.63 15.58L145.63 13.5L144.58 13.5ZM10.21 41.63L10.21 42.67L7.08 42.67L7.08 41.63L10.21 41.63Z"
              />
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
