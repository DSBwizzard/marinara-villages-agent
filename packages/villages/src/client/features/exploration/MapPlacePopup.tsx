import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { MapIcon, type ExplorationRow } from "./villages-exploration.js";
import type { MobileMapSize } from "./villages-mobile-map.js";

const P = "marinara-capability-villages";
export type MapPlacePopupProps = {
  row: ExplorationRow;
  point: { x: number; y: number };
  frame: MobileMapSize;
  disabled: boolean;
  onClose: () => void;
};

export function MapPlacePopup({ row, point, frame, disabled, onClose }: MapPlacePopupProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(150);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setHeight(node.getBoundingClientRect().height);
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    measure();
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [row.id]);
  const inset = 8;
  const width = Math.min(300, Math.max(0, frame.width - inset * 2));
  const left = Math.max(inset, Math.min(point.x - 28, frame.width - width - inset));
  const below = point.y + 28 + height <= frame.height - inset;
  const top = Math.max(inset, Math.min(below ? point.y + 28 : point.y - 28 - height, frame.height - height - inset));
  const arrow = Math.max(16, Math.min(point.x - left, width - 16));
  const visible = point.x >= 0 && point.y >= 0 && point.x <= frame.width && point.y <= frame.height;
  return (
    <div
      ref={ref}
      className={P + "-map-place-popup"}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      data-side={below ? "below" : "above"}
      style={
        {
          left,
          top,
          width,
          maxHeight: Math.max(0, frame.height - inset * 2),
          visibility: visible ? undefined : "hidden",
          "--popup-arrow": arrow + "px",
        } as CSSProperties
      }
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <span className={P + "-popup-pointer"} aria-hidden="true" />
      <div className={P + "-popup-body"}>
        <header>
          <div>
            <h2 id={titleId}>{row.name}</h2>
            <p>{row.detail}</p>
          </div>
          <button type="button" className={P + "-popup-close"} aria-label="Close location" onClick={onClose}>
            <MapIcon name="close" />
          </button>
        </header>
        <div className={P + "-popup-actions"}>
          {row.actions?.map((action) => (
            <button key={action.label} type="button" disabled={disabled} onClick={action.onSelect}>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
