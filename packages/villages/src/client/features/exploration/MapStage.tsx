import { DESKTOP_PHOTO_SCALE, ELEMENT_TAG } from "../../shared/constants.js";
import { clamp, round4 } from "../../shared/presentation.js";
import type { MapFrameShape, MapPin, MapZoomRange, PictureBox, TownMapFit, TownMapView } from "../../shared/types.js";
import { MobileMarkers } from "./villages-exploration";
import {
  focusedPhotoScale,
  mobileCoverZoom,
  mobileDoorPoint,
  mobileGestureMoved,
  mobileMapBox,
  mobileMapGesture,
  type MobileMapView,
  mobilePhotoScale,
} from "./villages-mobile-map";
import { VenuePolaroid } from "./villages-venue-polaroid.js";
import {
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * How far under a place its people stack, as a fraction of the picture.
 *
 * Big enough to clear a pin, small enough that a crowd still reads as being at the
 * place rather than down the street from it.
 */
export const STANDING_PIN_STEP = 0.028;

/**
 * The three ways a picture can be made to fit the frame, in the words the panel
 * offers them. The order runs from "fills the frame" to "shows all of it", which
 * is the order the trade-off itself has.
 */
export const TOWN_MAP_FITS: readonly { fit: TownMapFit; label: string; help: string }[] = [
  {
    fit: "cover",
    label: "Fill the frame",
    help: "Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept.",
  },
  {
    fit: "stretch",
    label: "Stretch to fill",
    help: "Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched.",
  },
  {
    fit: "contain",
    label: "Show all of it",
    help: "Keeps the whole picture and leaves the frame's own background showing around it.",
  },
];

/**
 * What is actually true of a picture, said plainly, before the player picks a
 * fit. The three outcomes are different enough to be worth different advice:
 * a picture at the map's shape needs none, a bigger one only needs to be aimed,
 * and a smaller one has to be warned about because filling the frame with it
 * means inventing pixels.
 */
export function pictureAdvice(size: { width: number; height: number }): { tone: "ok" | "warn"; text: string } {
  if (size.width / size.height < 1.2) {
    return {
      tone: "warn",
      text: `This ${size.width}×${size.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`,
    };
  }
  if (size.width < 1024 || size.height < 700) {
    return {
      tone: "warn",
      text: `This ${size.width}×${size.height} map will fit in full, but it may look soft when enlarged.`,
    };
  }
  return {
    tone: "ok",
    text: `This ${size.width}×${size.height} map will be shown at its native shape, with the whole image visible.`,
  };
}

/** One bundled blueprint serves every unfinished New Venue and Renovation. */
export const PROJECT_BLUEPRINT_IMAGE = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><rect width="640" height="440" fill="#11285b"/><g stroke="#6c9bd5" opacity=".34" stroke-width="1"><path d="M0 40H640M0 80H640M0 120H640M0 160H640M0 200H640M0 240H640M0 280H640M0 320H640M0 360H640M0 400H640M40 0V440M80 0V440M120 0V440M160 0V440M200 0V440M240 0V440M280 0V440M320 0V440M360 0V440M400 0V440M440 0V440M480 0V440M520 0V440M560 0V440M600 0V440"/></g><g fill="none" stroke="#d7e9ff" stroke-width="5" stroke-linejoin="round"><path d="M110 195 320 88 530 195 320 302Z"/><path d="M110 195v150l210 87 210-87V195M320 302v130"/><path d="M212 153v89l108 46 108-46v-89M257 128v76l63 29 63-29v-76"/><path d="M160 221v72l95 40v-72zM385 334l95-40v-72l-95 40z"/></g><g fill="#d7e9ff" font-family="Arial,sans-serif" letter-spacing="9" text-anchor="middle"><text x="320" y="48" font-size="22">VILLAGE PROJECT</text></g></svg>`)}`;

/**
 * The box a picture is drawn in, in the frame's own pixels.
 *
 * This is the box a fraction of the map is a fraction of, and it is deliberately
 * not always the frame: `contain` shrinks the picture until it fits and leaves
 * the frame's own background showing, `cover` grows it until it fills and lets
 * the overhang be cropped, and `stretch` is the only one of the three where the
 * two boxes are the same box. The focus then slides that drawing under the frame
 * and the zoom magnifies it, so every framing is a different box — which is why
 * the pins are placed against what this returns and not against the frame.
 *
 * The anchor is one expression for all three fits. The CSS is given the same
 * percentage twice on purpose: `object-position: X%` holds the picture's own X%
 * point against the frame's X% point, and magnifying about `transform-origin: X%`
 * leaves exactly that point where it was — so `left = (frame - drawn) * focus`
 * describes both the drawing and the magnifying, and this stays in step with
 * what the browser actually renders instead of approximating it.
 */
function pictureBox(
  size: { width: number; height: number },
  frame: { width: number; height: number },
  view: TownMapView,
): PictureBox {
  if (view.fit === "stretch") return { left: 0, top: 0, width: frame.width, height: frame.height };
  // A picture that is only being fitted has nothing to aim: it is already all
  // there and the frame has nothing to crop, so it is centred and the focus is
  // left alone. That also means the focus survives a trip through "show all of
  // it" and back to a crop, which is what the player meant by setting it.
  if (view.fit === "contain") {
    const scale = Math.min(frame.width / size.width, frame.height / size.height);
    const width = size.width * scale;
    const height = size.height * scale;
    return { left: (frame.width - width) / 2, top: (frame.height - height) / 2, width, height };
  }
  // A crop, magnified as far as the zoom says. It is the only fit with picture
  // left over outside the frame, which is why it is the only one that can be
  // aimed and the only one worth magnifying.
  const scale = Math.max(frame.width / size.width, frame.height / size.height) * view.zoom;
  const width = size.width * scale;
  const height = size.height * scale;
  return {
    left: (frame.width - width) * (view.focusX / 100),
    top: (frame.height - height) * (view.focusY / 100),
    width,
    height,
  };
}

/** The inline CSS a picture is drawn with, from the same numbers `pictureBox` reads. */
function pictureStyle(view: TownMapView): CSSProperties {
  if (view.fit === "stretch") return { objectFit: "fill" };
  if (view.fit === "contain") return { objectFit: "contain" };
  return {
    objectFit: "cover",
    objectPosition: `${view.focusX}% ${view.focusY}%`,
    ...(view.zoom === 1
      ? null
      : { transform: `scale(${view.zoom})`, transformOrigin: `${view.focusX}% ${view.focusY}%` }),
  };
}

/** The framing a picture starts at, so the tab and the server agree before either is told. */
export function defaultView(fit: TownMapFit): TownMapView {
  return { fit, focusX: 50, focusY: 50, zoom: 1 };
}

/**
 * The village map, with its venue pins.
 *
 * The picture is the page here, so the pins are placed as fractions of the
 * PICTURE rather than of the frame: the same home stays on the same building
 * whether the tab is a phone or a wide monitor, and the stored position means
 * the same thing to every reader of the record. The two boxes are not the same
 * box — see `pictureBox` — which is why this measures the picture and the frame
 * separately and places every pin against the first of them.
 *
 * Three different things can be asked of a stage:
 *   * `onPlace` makes it a picker — the picture takes clicks and reports where
 *     they landed. Founding and map replacement use it to place pins.
 *   * `onView` makes it a framing editor — dragging slides the picture under the
 *     frame and the zoom buttons magnify it. That is what Village Map settings
 *     asks for. Only a crop is draggable, because it is the only fit with
 *     picture left over to drag into view.
 *   * neither, which is the homepage: the map is drawn and the pins are the only
 *     things that take a click.
 *
 * `compact` draws a stand-in for the map instead of the map — the same picture
 * at the same shape, small enough to sit beside a column of prose.
 *
 * `fitToRoom` measures the box this is drawn in and sizes the frame to the
 * largest one of the map's shape that the box holds. The homepage is the whole
 * tab and asks for it, because there the room is also the ceiling: a frame as
 * wide as the room is a frame taller than the room, and the map is cropped to
 * fill it. Everywhere else the column the map sits in is what decides how wide
 * it is, and measuring that column from the map inside it would be measuring a
 * box against its own contents.
 */
export function MapStage({
  src,
  alt,
  pins,
  placing,
  view,
  shape,
  zoom,
  onPlace,
  onView,
  onDismiss,
  compact,
  fitToRoom,
  mobile,
  exploration = false,
  navigationView,
  onNavigationView,
  compactPhotos = false,
  onMovePin,
  onMoveInvalid,
  placementCursor,
  children,
}: {
  src: string | null;
  alt: string;
  pins: MapPin[];
  placing: boolean;
  view: TownMapView;
  /** The shape the frame is drawn at. Absent for the beat before the settings arrive. */
  shape: MapFrameShape | null;
  /** The zoom range, from the settings. Only the framing editor is given one. */
  zoom?: MapZoomRange;
  onPlace?(
    x: number,
    y: number,
    pictureSize?: { width: number; height: number; photoWidth: number; photoHeight: number },
  ): void;
  onView?(next: TownMapView): void;
  /**
   * A press on the map that was not a press on a pin.
   *
   * The stage draws the pins and so it is also the thing that knows a press went
   * past them: a pin takes its own press and stops it, so anything that reaches
   * here was aimed at the picture. The caller does the resting of whatever a pin
   * left open, and what it hangs on this is a way for the map to be the way out of
   * its own menus — without it, a list of doors under a pin could only be shut by
   * opening another pin.
   *
   * Not offered while a house is being placed: there, a press on the picture is
   * where the house goes, and a press that both put a pin down and shut something
   * would be two answers to one click.
   */
  onDismiss?(): void;
  compact?: boolean;
  /** Size the frame to the largest shape the map's own that the room around it holds. */
  fitToRoom?: boolean;
  mobile?: boolean;
  exploration?: boolean;
  navigationView?: MobileMapView | null;
  onNavigationView?(next: MobileMapView | null): void;
  /** Show the village's photo cards while keeping desktop's fitted map. */
  photoPins?: boolean;
  compactPhotos?: boolean;
  onMovePin?(
    id: string,
    x: number,
    y: number,
    size: { width: number; height: number; photoWidth: number; photoHeight: number },
  ): void;
  onMoveInvalid?(): void;
  placementCursor?: { x: number; y: number };
  /**
   * Anything that belongs on the picture rather than beside it. Drawn inside the
   * frame, which is the picture's box and the only box whose corner is also the
   * picture's corner — a corner drawn on the column instead lands in the gutter
   * the column has left over on whichever axis is not limiting it.
   */
  children?: ReactNode;
}) {
  const picking = onPlace !== undefined;
  const framing = onView !== undefined;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const pinDrag = useRef<{
    id: string;
    pointer: number;
    startX: number;
    startY: number;
    x: number;
    y: number;
    width: number;
    height: number;
    moved: boolean;
  } | null>(null);
  const suppressPinClick = useRef(false);
  const [pinOffset, setPinOffset] = useState<{ id: string; x: number; y: number } | null>(null);
  // Both measurements are tagged with the map they belong to, so picking a new
  // picture measures it afresh instead of holding the previous map's shape for
  // a beat and sliding every pin under it.
  const [decoded, setDecoded] = useState<{ src: string; width: number; height: number } | null>(null);
  const [frame, setFrame] = useState<{ width: number; height: number } | null>(null);
  const [mobileView, setMobileView] = useState<MobileMapView | null>(null);
  const mobileViewRef = useRef<MobileMapView | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const gestureRef = useRef<{ view: MobileMapView; x: number; y: number; distance: number } | null>(null);
  /**
   * The frame's size once the room around it has been measured. The map's shape
   * is not the room's shape, so a frame as wide as the room is a frame taller
   * than the room, and what a crop does to a frame of the wrong shape is eat the
   * top and bottom of the map. The corners of the map are where its corner
   * houses are, and a corner house nobody can see is a house nobody can open.
   */
  const [fitted, setFitted] = useState<{ width: number; height: number } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  /** What a drag started from, held by reference because it is read on every move. */
  const dragRef = useRef<{ x: number; y: number; focusX: number; focusY: number; spanX: number; spanY: number } | null>(
    null,
  );
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressTouchClickRef = useRef(false);
  /**
   * The focus while a drag is in flight, kept here rather than sent up on every
   * pointer move. The picture has to follow the pointer smoothly, and a round
   * trip through the panel would redraw the whole editor for each pixel of it.
   * The move is sent up once, when the pointer is let go.
   */
  const [dragging, setDragging] = useState<{ focusX: number; focusY: number } | null>(null);
  const live: TownMapView = useMemo(() => (dragging ? { ...view, ...dragging } : view), [dragging, view]);
  const mobileImage = useMemo(
    () =>
      src && failedSrc !== src ? (decoded?.src === src ? decoded : null) : (shape ?? { width: 1280, height: 720 }),
    [src, decoded, shape, failedSrc],
  );
  const mobileInitial: MobileMapView = {
    zoom: mobileImage && frame ? mobileCoverZoom(mobileImage, frame) : 1,
    centerX: 0.5,
    centerY: 0.5,
  };
  const mobileCurrent = (exploration ? navigationView : mobileView) ?? mobileInitial;
  const updateMobileView = (next: MobileMapView | null) => {
    mobileViewRef.current = next;
    setMobileView(next);
    if (exploration) onNavigationView?.(next);
  };
  const picture = useMemo(
    () =>
      mobile
        ? mobileImage && frame
          ? mobileMapBox(mobileImage, frame, mobileCurrent)
          : null
        : src
          ? decoded && decoded.src === src && frame
            ? pictureBox(decoded, frame, live)
            : null
          : frame
            ? { left: 0, top: 0, width: frame.width, height: frame.height }
            : null,
    [decoded, frame, live, mobile, mobileImage, mobileCurrent, src],
  );
  useEffect(() => {
    setMobileView(null);
    mobileViewRef.current = null;
    pointersRef.current.clear();
    gestureRef.current = null;
  }, [src]);
  // The shape is the village's rather than this file's: the frame is laid out
  // from the picture size the settings named, so "what shape is a map" is
  // answered in exactly one place. No settings yet means no shape yet.
  //
  // A fitted frame is given both of its sides rather than a ratio, because a
  // ratio would still leave one of them to the room — and a frame whose height
  // is the room's height is a frame the map has to be cropped to fill.
  const style: CSSProperties | undefined = shape
    ? fitToRoom && fitted
      ? { width: `${fitted.width}px`, height: `${fitted.height}px`, aspectRatio: `${shape.width} / ${shape.height}` }
      : { aspectRatio: `${shape.width} / ${shape.height}` }
    : undefined;

  const measure = useCallback(() => {
    const element = frameRef.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    // Same box, same object: a resize that changes nothing should not rerender.
    setFrame((previous) =>
      previous && previous.width === rect.width && previous.height === rect.height
        ? previous
        : { width: rect.width, height: rect.height },
    );
  }, []);

  // The frame changes size with the window, the pane and the wizard's step.
  useEffect(() => {
    const element = frameRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(element);
    return () => observer.disconnect();
  }, [measure]);

  /**
   * The room the frame is drawn in. The largest frame of the map's shape that
   * fits it is the smaller of "as wide as the room" and "as wide as the room is
   * tall" — the two ways a box of a fixed shape can be too big for a box of
   * another shape.
   *
   * What the frame is fitted to is the room's content box, not its border box:
   * the room's padding is the buffer the wooden frame is drawn into, and
   * measuring the border box instead would hand the frame that buffer as
   * usable width. The frame would then fill the room corner to corner and be
   * sitting on top of its own wood.
   */
  const measureRoom = useCallback(() => {
    const room = stageRef.current?.parentElement;
    if (!room || !shape) return;
    const box = room.getBoundingClientRect();
    const roomStyle = getComputedStyle(room);
    const inset = (side: string) => Number.parseFloat(roomStyle.getPropertyValue(side)) || 0;
    const availableWidth = box.width - inset("padding-left") - inset("padding-right");
    const availableHeight = box.height - inset("padding-top") - inset("padding-bottom");
    const ratio = shape.width / shape.height;
    const width = Math.min(availableWidth, availableHeight * ratio);
    if (!(width > 0)) return;
    // Same box, same object: a resize that changes nothing should not rerender.
    setFitted((previous) =>
      previous && Math.abs(previous.width - width) < 0.5 ? previous : { width, height: width / ratio },
    );
  }, [shape]);

  // The room, watched separately from the frame, because the frame is inside it:
  // a window resize reaches the room first and only reaches the frame once this
  // has resized it. Laid out rather than painted, so the first frame the map is
  // ever drawn in is already the right one and the map is not seen jumping.
  useLayoutEffect(() => {
    if (!fitToRoom) return;
    measureRoom();
    if (typeof ResizeObserver === "undefined") return;
    const room = stageRef.current?.parentElement;
    if (!room) return;
    const observer = new ResizeObserver(() => measureRoom());
    observer.observe(room);
    return () => observer.disconnect();
  }, [fitToRoom, measureRoom]);

  const handleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!picking || !onPlace || !picture) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left - picture.left) / picture.width;
      const y = (event.clientY - rect.top - picture.top) / picture.height;
      // The margin beside a picture that does not fill the frame is not part of
      // the map, so a click there is not a position the player chose.
      if (!(x >= 0 && x <= 1) || !(y >= 0 && y <= 1)) return;
      const photo = frameRef.current?.querySelector<HTMLElement>(`.${ELEMENT_TAG}-pin-photo`);
      const photoRect = photo?.getBoundingClientRect();
      onPlace(round4(x), round4(y), {
        width: picture.width,
        height: picture.height,
        photoWidth:
          photoRect?.width ??
          (compactPhotos
            ? parseFloat(getComputedStyle(event.currentTarget).getPropertyValue("--founding-photo-width")) || 88
            : 58),
        photoHeight:
          photoRect?.height ??
          (compactPhotos
            ? parseFloat(getComputedStyle(event.currentTarget).getPropertyValue("--founding-photo-width")) || 88
            : 58),
      });
    },
    [onPlace, picking, picture, compactPhotos],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!framing || !picture || !onView || live.fit !== "cover") return;
      const rect = event.currentTarget.getBoundingClientRect();
      // How far the picture can travel in each direction. Zero means it is
      // exactly as wide — or as tall — as the frame, so there is nothing to drag
      // along that axis and dividing by it would be dividing by nothing.
      dragRef.current = {
        x: event.clientX,
        y: event.clientY,
        focusX: live.focusX,
        focusY: live.focusY,
        spanX: rect.width - picture.width,
        spanY: rect.height - picture.height,
      };
      setDragging({ focusX: live.focusX, focusY: live.focusY });
      event.currentTarget.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    [framing, live.focusX, live.focusY, live.fit, onView, picture],
  );

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    if (!start) return;
    // The picture moves by as many pixels as the pointer did, so the focus moves
    // by that distance as a share of the picture's travel. The span is negative
    // — the picture is wider than the frame — which is what makes dragging right
    // reveal what was to the left of it.
    const focusX = start.spanX === 0 ? start.focusX : start.focusX + ((event.clientX - start.x) / start.spanX) * 100;
    const focusY = start.spanY === 0 ? start.focusY : start.focusY + ((event.clientY - start.y) / start.spanY) * 100;
    setDragging({ focusX: round4(clamp(focusX, 0, 100)), focusY: round4(clamp(focusY, 0, 100)) });
  }, []);

  const endDrag = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!dragRef.current) return;
      dragRef.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      const landed = dragging;
      setDragging(null);
      if (landed && onView) onView({ ...view, ...landed });
    },
    [dragging, onView, view],
  );

  const applyZoom = useCallback(
    (next: number) => {
      if (!onView || !zoom) return;
      onView({ ...view, zoom: round4(clamp(next, zoom.min, zoom.max)) });
    },
    [onView, view, zoom],
  );

  const gestureAnchor = () => {
    const points = [...pointersRef.current.values()];
    if (points.length === 0) {
      gestureRef.current = null;
      return;
    }
    const first = points[0]!;
    const second = points[1];
    gestureRef.current = {
      view: mobileViewRef.current ?? mobileCurrent,
      x: second ? (first.x + second.x) / 2 : first.x,
      y: second ? (first.y + second.y) / 2 : first.y,
      distance: second ? Math.hypot(first.x - second.x, first.y - second.y) : 1,
    };
  };

  const mobilePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!mobile || event.pointerType !== "touch") return;
    if (event.isPrimary) {
      pointersRef.current.clear();
      suppressTouchClickRef.current = false;
    }
    if (!frameRef.current) return;
    if (event.target instanceof Element && event.target.closest(`.${ELEMENT_TAG}-doors, .${ELEMENT_TAG}-zoom`)) return;
    stageRef.current?.setAttribute("data-mobile-gesturing", "true");
    const rect = frameRef.current.getBoundingClientRect();
    pointersRef.current.set(event.pointerId, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    if (pointersRef.current.size > 1) suppressTouchClickRef.current = true;
    gestureAnchor();
  };

  const mobilePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!mobile || !pointersRef.current.has(event.pointerId) || !mobileImage || !frame || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    pointersRef.current.set(event.pointerId, { x: event.clientX - rect.left, y: event.clientY - rect.top });
    const points = [...pointersRef.current.values()];
    const first = points[0]!;
    const second = points[1];
    const x = second ? (first.x + second.x) / 2 : first.x;
    const y = second ? (first.y + second.y) / 2 : first.y;
    const distance = second ? Math.hypot(first.x - second.x, first.y - second.y) : 1;
    const start = gestureRef.current;
    if (!start) return;
    const moved = mobileGestureMoved(start, { x, y, distance });
    if (!moved && !suppressTouchClickRef.current) return;
    if (!suppressTouchClickRef.current) onDismiss?.();
    suppressTouchClickRef.current = true;
    const next = mobileMapGesture(
      mobileImage,
      frame,
      start.view,
      { x: start.x, y: start.y },
      { x, y },
      second && start.distance > 0 ? distance / start.distance : 1,
    );
    updateMobileView(next);
  };

  const suppressFollowingTouchClick = (x: number, y: number) => {
    const consume = (click: MouseEvent) => {
      document.removeEventListener("click", consume, true);
      if (Math.abs(click.clientX - x) < 3 && Math.abs(click.clientY - y) < 3) {
        click.preventDefault();
        click.stopImmediatePropagation();
      }
    };
    document.addEventListener("click", consume, true);
    window.setTimeout(() => document.removeEventListener("click", consume, true), 500);
  };
  const mobilePointerEnd = (event: ReactPointerEvent<HTMLDivElement>, cancelled = false) => {
    if (!mobile || !pointersRef.current.has(event.pointerId)) return;
    const tapped = !cancelled && pointersRef.current.size === 1 && !suppressTouchClickRef.current;
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size === 0) stageRef.current?.removeAttribute("data-mobile-gesturing");
    gestureAnchor();
    if (!tapped || !(event.target instanceof Element)) return;
    const pinId = event.target.closest<HTMLButtonElement>(`.${ELEMENT_TAG}-pin`)?.dataset.pinId;
    const pin = pinId ? pins.find((candidate) => candidate.id === pinId) : null;
    if (pin?.onSelect) {
      suppressTouchClickRef.current = true;
      suppressFollowingTouchClick(event.clientX, event.clientY);
      if (exploration)
        event.target.closest<HTMLButtonElement>("." + ELEMENT_TAG + "-pin")?.focus({ preventScroll: true });
      pin.onSelect();
      return;
    }
    if (!event.target.closest(`.${ELEMENT_TAG}-canvas`) || event.target.closest("button")) return;
    if (picking && placing && onPlace && picture) {
      const rect = frameRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left - picture.left) / picture.width;
      const y = (event.clientY - rect.top - picture.top) / picture.height;
      if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
        suppressTouchClickRef.current = true;
        const photo = frameRef.current?.querySelector<HTMLElement>(`.${ELEMENT_TAG}-pin-photo`);
        const photoRect = photo?.getBoundingClientRect();
        suppressFollowingTouchClick(event.clientX, event.clientY);
        onPlace(round4(x), round4(y), {
          width: picture.width,
          height: picture.height,
          photoWidth: photoRect?.width ?? 72,
          photoHeight: photoRect?.height ?? 72,
        });
      }
    } else if (onDismiss) {
      suppressTouchClickRef.current = true;
      onDismiss();
    }
  };

  return (
    <div
      ref={stageRef}
      className={`${ELEMENT_TAG}-stage${compact ? ` ${ELEMENT_TAG}-stage-compact` : ""}`}
      style={style}
      data-shaped={shape ? "true" : "false"}
      data-framing={framing && live.fit === "cover" ? "true" : "false"}
      data-mobile={mobile ? "true" : "false"}
      data-navigation-zoom={exploration ? mobileCurrent.zoom : undefined}
      data-photo-pins="true"
      data-picture-width={picture?.width}
      data-picture-height={picture?.height}
      data-compact-photos={compactPhotos ? "true" : "false"}
      data-empty={src ? "false" : "true"}
      onPointerDownCapture={(event) => {
        if (mobile) {
          mobilePointerDown(event);
          return;
        }
        suppressTouchClickRef.current = false;
        touchStartRef.current = event.pointerType === "touch" ? { x: event.clientX, y: event.clientY } : null;
      }}
      onPointerMoveCapture={(event) => {
        if (mobile) {
          mobilePointerMove(event);
          return;
        }
        const start = touchStartRef.current;
        if (start && (Math.abs(event.clientX - start.x) > 8 || Math.abs(event.clientY - start.y) > 8)) {
          suppressTouchClickRef.current = true;
        }
      }}
      onPointerUpCapture={mobile ? mobilePointerEnd : undefined}
      onPointerCancelCapture={(event) => {
        if (mobile) mobilePointerEnd(event, true);
        if (touchStartRef.current) suppressTouchClickRef.current = true;
      }}
      onClickCapture={(event) => {
        if (!suppressTouchClickRef.current) return;
        suppressTouchClickRef.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {/* Before the picture, because every one of them is drawn on the picture
          and the frame is the box they are positioned against. Given to this
          component rather than left in the caller's markup so that the box they
          are measured from is this one and cannot drift. */}
      {children}
      <div
        ref={frameRef}
        className={`${ELEMENT_TAG}-canvas`}
        data-placing={picking && placing ? "true" : "false"}
        data-dragging={dragging ? "true" : "false"}
        onClick={picking && placing ? handleClick : onDismiss ? () => onDismiss() : undefined}
        onPointerDown={framing ? handlePointerDown : undefined}
        onPointerMove={framing ? handlePointerMove : undefined}
        onPointerUp={framing ? endDrag : undefined}
        onPointerCancel={framing ? endDrag : undefined}
      >
        {src ? (
          <img
            className={`${ELEMENT_TAG}-canvas-img`}
            style={
              mobile && picture
                ? {
                    position: "absolute",
                    left: picture.left,
                    top: picture.top,
                    width: picture.width,
                    height: picture.height,
                    objectFit: "fill",
                  }
                : pictureStyle(live)
            }
            src={src}
            alt={alt}
            draggable={false}
            onLoad={(event) => {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              if (naturalWidth <= 0 || naturalHeight <= 0) return;
              setDecoded({ src, width: naturalWidth, height: naturalHeight });
              measure();
            }}
            onError={() => setFailedSrc(src)}
          />
        ) : (
          <>
            {mobile && picture ? (
              <span
                className={`${ELEMENT_TAG}-mobile-logical`}
                style={{ left: picture.left, top: picture.top, width: picture.width, height: picture.height }}
                aria-hidden="true"
              />
            ) : null}
            <span className={`${ELEMENT_TAG}-canvas-empty`}>Logical village map</span>
          </>
        )}
        {src && failedSrc === src ? (
          <span className={`${ELEMENT_TAG}-canvas-missing`}>
            The map picture could not be loaded — choose another one in Village Settings → Village Map.
          </span>
        ) : null}
        {picture && placementCursor && placing ? (
          <span
            className={`${ELEMENT_TAG}-placement-cursor`}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: picture.left + placementCursor.x * picture.width,
              top: picture.top + placementCursor.y * picture.height,
              zIndex: 3,
              pointerEvents: "none",
              border: "2px solid #d5c6ff",
              background: "#251a3a99",
              borderRadius: "50%",
              width: "1rem",
              height: "1rem",
              transform: "translate(-50%,-50%)",
            }}
          />
        ) : null}
        {exploration && picture && frame ? <MobileMarkers pins={pins} picture={picture} frame={frame} /> : null}
        {picture && !exploration
          ? pins.map((pin) => (
              <span
                key={pin.id}
                className={`${ELEMENT_TAG}-pin-holder`}
                data-selected={pin.selected ? "true" : "false"}
                style={{
                  left: `${picture.left + pin.x * picture.width + (pinOffset?.id === pin.id ? pinOffset.x : 0)}px`,
                  // The step down is part of the fraction rather than a margin, so
                  // a pin hung under another one still hangs under it at any size.
                  top: `${picture.top + (pin.y + (mobile && pin.kind !== "person" ? 0 : (pin.dy ?? 0))) * picture.height + (pinOffset?.id === pin.id ? pinOffset.y : 0)}px`,
                }}
              >
                <button
                  type="button"
                  className={`${ELEMENT_TAG}-pin`}
                  data-pin-id={pin.id}
                  data-tone={pin.tone}
                  data-kind={pin.kind ?? "place"}
                  data-selected={pin.selected ? "true" : "false"}
                  aria-expanded={pin.doors ? true : undefined}
                  disabled={pin.onSelect === undefined}
                  title={pin.label ?? pin.text}
                  aria-label={pin.label}
                  onPointerDown={(event) => {
                    if (!onMovePin || event.button !== 0 || !event.isPrimary) return;
                    event.stopPropagation();
                    suppressPinClick.current = false;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    pinDrag.current = {
                      id: pin.id,
                      pointer: event.pointerId,
                      startX: event.clientX,
                      startY: event.clientY,
                      x: pin.x,
                      y: pin.y,
                      width: picture.width,
                      height: picture.height,
                      moved: false,
                    };
                  }}
                  onPointerMove={(event) => {
                    const drag = pinDrag.current;
                    if (!drag || drag.id !== pin.id || drag.pointer !== event.pointerId) return;
                    event.stopPropagation();
                    const x = event.clientX - drag.startX,
                      y = event.clientY - drag.startY;
                    if (Math.hypot(x, y) >= 8) drag.moved = true;
                    if (drag.moved) {
                      event.preventDefault();
                      setPinOffset({ id: pin.id, x, y });
                    }
                  }}
                  onPointerUp={(event) => {
                    const drag = pinDrag.current;
                    if (!drag || drag.id !== pin.id || drag.pointer !== event.pointerId) return;
                    event.stopPropagation();
                    pinDrag.current = null;
                    setPinOffset(null);
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    if (!drag.moved) return;
                    suppressPinClick.current = true;
                    const x = drag.x + (event.clientX - drag.startX) / drag.width;
                    const y = drag.y + (event.clientY - drag.startY) / drag.height;
                    if (
                      x < 0 ||
                      x > 1 ||
                      y < 0 ||
                      y > 1 ||
                      drag.width !== picture.width ||
                      drag.height !== picture.height
                    ) {
                      onMoveInvalid?.();
                      return;
                    }
                    const photo = event.currentTarget
                      .querySelector<HTMLElement>(`.${ELEMENT_TAG}-pin-photo`)
                      ?.getBoundingClientRect();
                    onMovePin?.(pin.id, round4(x), round4(y), {
                      width: picture.width,
                      height: picture.height,
                      photoWidth: photo?.width ?? 88,
                      photoHeight: photo?.height ?? 88,
                    });
                  }}
                  onPointerCancel={() => {
                    pinDrag.current = null;
                    setPinOffset(null);
                    suppressPinClick.current = true;
                  }}
                  onClick={(event) => {
                    // Otherwise a click on a pin would also read as a click on the
                    // map underneath it while the wizard is placing homes.
                    event.stopPropagation();
                    if (suppressPinClick.current) {
                      suppressPinClick.current = false;
                      return;
                    }
                    pin.onSelect?.();
                  }}
                >
                  {pin.kind !== "person" ? (
                    <VenuePolaroid
                      image={pin.image}
                      name={pin.text}
                      style={{
                        transform:
                          "scale(" +
                          focusedPhotoScale(
                            compactPhotos
                              ? 0.36
                              : mobile
                                ? mobilePhotoScale(mobileCurrent.zoom, mobileInitial.zoom)
                                : DESKTOP_PHOTO_SCALE,
                            pin.selected === true,
                          ) +
                          ")",
                      }}
                    />
                  ) : (
                    <span className={ELEMENT_TAG + "-pin-name"}>{pin.text}</span>
                  )}
                </button>
                {pin.onRemove ? (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-pin-remove`}
                    aria-label={`Take ${pin.text} off the map`}
                    onClick={(event) => {
                      event.stopPropagation();
                      pin.onRemove?.();
                    }}
                  >
                    ×
                  </button>
                ) : null}
                {/*
                  The way back into a conversation the debug close stepped out
                  of. A second control beside the pin, taking clicks of its own
                  rather than sitting inside the pin's button — a button inside a
                  button is not a thing a browser will draw — and reaching
                  neither the map's placement handler nor the pin's own select,
                  which is what lets it be the one live control on a locked map.
                */}
                {pin.onResume ? (
                  <button
                    type="button"
                    className={`${ELEMENT_TAG}-pin-resume`}
                    onClick={(event) => {
                      event.stopPropagation();
                      pin.onResume?.();
                    }}
                  >
                    DEBUG: Resume Chat
                  </button>
                ) : null}
              </span>
            ))
          : null}
      </div>

      {/*
        The doors of whichever pin the player has open, drawn against the same
        picture the pins are placed against.

        Against the picture rather than in the frame, and that is the whole point
        of these being here: the frame is where a pin is drawn and it is also what
        cuts anything that reaches past its edge, so a list hung under a pin near
        the bottom of the map would be half a list. The box is the caller's rather
        than the pin's, so the offsets are the same two numbers the pin above it is
        placed with and the two cannot drift apart.
      */}
      {picture && !exploration
        ? pins
            .filter((pin) => pin.doors !== undefined && pin.doors.length > 0)
            .map((pin) => (
              <div
                key={`doors:${pin.id}`}
                className={`${ELEMENT_TAG}-doors`}
                style={{
                  left: `${frame ? mobileDoorPoint(picture, frame, pin).left : picture.left + pin.x * picture.width}px`,
                  top: `${frame ? mobileDoorPoint(picture, frame, pin).top : picture.top + (pin.y + (pin.dy ?? 0)) * picture.height}px`,
                }}
              >
                {pin.doors?.map((door) => (
                  <button
                    key={door.label}
                    type="button"
                    className={`${ELEMENT_TAG}-door`}
                    onClick={(event) => {
                      // The list hangs over the map rather than inside it, so it is
                      // not a press on the picture and must not read as one.
                      event.stopPropagation();
                      door.onSelect();
                    }}
                  >
                    {door.label}
                  </button>
                ))}
              </div>
            ))
        : null}

      {framing && zoom && live.fit === "cover" ? (
        <div className={`${ELEMENT_TAG}-zoom`}>
          <button
            type="button"
            className={`${ELEMENT_TAG}-zoom-button`}
            title="Show less of the picture, larger"
            aria-label="Zoom in"
            disabled={live.zoom >= zoom.max}
            onClick={() => applyZoom(live.zoom + zoom.step)}
          >
            +
          </button>
          <button
            type="button"
            className={`${ELEMENT_TAG}-zoom-button`}
            title="Show more of the picture, smaller"
            aria-label="Zoom out"
            disabled={live.zoom <= zoom.min}
            onClick={() => applyZoom(live.zoom - zoom.step)}
          >
            −
          </button>
          <button
            type="button"
            className={`${ELEMENT_TAG}-zoom-button`}
            title="Put the middle of the picture back in the middle of the frame"
            disabled={live.focusX === 50 && live.focusY === 50 && live.zoom === zoom.min}
            onClick={() => {
              if (onView) onView({ ...view, focusX: 50, focusY: 50, zoom: zoom.min });
            }}
          >
            Centre
          </button>
        </div>
      ) : null}
    </div>
  );
}
