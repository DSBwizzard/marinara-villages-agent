import { createContext, useContext, useLayoutEffect, type ReactNode, type RefObject } from "react";
import { useVillageActivity } from "./activity.js";
import { ELEMENT_TAG as P } from "./constants.js";
import { DESK_STYLES } from "./desk-styles.js";

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
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-3a7 7 0 0 1 14 0v3M17 3a4 4 0 0 1 0 8M20 21v-3a7 7 0 0 0-3-6" />
    </>
  ),
  projects: <path d="m14 5 5 5M3 21l9-9m1-8 3-2 6 6-2 3-7-7ZM3 21l3-1-2-2-1 3Z" />,
  places: (
    <>
      <path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z" />
      <path d="M9 3v16M15 5v16" />
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
  phase,
  disabled,
  documentRef,
  onNavigate,
  onReturn,
  onScene,
  onKeyDown,
  children,
}: {
  active: DeskDestination | null;
  phase: "open" | "opening" | "closing";
  disabled: boolean;
  documentRef: RefObject<HTMLDivElement | null>;
  onNavigate(destination: DeskDestination): void;
  onReturn(): void;
  onScene?: () => void;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <div
      className={`${P}-desk-workspace`}
      data-desk={active ?? "none"}
      data-phase={phase}
      role={active === "people" ? "dialog" : active ? "region" : undefined}
      aria-label={active === "people" ? "People" : active ? "Village desk" : undefined}
      aria-modal={active === "people" ? true : undefined}
      onKeyDown={onKeyDown}
    >
      <style>{DESK_STYLES}</style>
      <header className={`${P}-desk-header`} hidden={!active}>
        <nav className={`${P}-desk-nav`} aria-label="Village navigation">
          {(Object.keys(icons) as DeskDestination[]).map((destination) => (
            <button
              type="button"
              key={destination}
              disabled={disabled}
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
            disabled={disabled}
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
          disabled={disabled}
          aria-disabled={disabled || phase !== "open"}
          onClick={() => {
            if (phase === "open") onReturn();
          }}
        >
          <span className={`${P}-desk-return-desktop`}>Return to village</span>
          <span className={`${P}-desk-return-mobile`}>← Village</span>
        </button>
      </header>
      <div className={`${P}-desk-stage`}>
        <div ref={documentRef} className={`${P}-desk-document`} inert={phase === "closing"}>
          {children}
        </div>
      </div>
    </div>
  );
}
