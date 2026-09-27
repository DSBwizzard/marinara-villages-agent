export type MobileMapSize = { width: number; height: number };
export type MobileMapView = { zoom: number; centerX: number; centerY: number };
export type MobileMapBox = { left: number; top: number; width: number; height: number };

export function mobileGestureMoved(
  start: { x: number; y: number; distance: number },
  next: { x: number; y: number; distance: number },
): boolean {
  return Math.hypot(next.x - start.x, next.y - start.y) > 8 || Math.abs(next.distance - start.distance) > 8;
}

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** Zoom is measured from the scale that shows the whole picture. */
export function mobileCoverZoom(image: MobileMapSize, frame: MobileMapSize): number {
  if (!image.width || !image.height || !frame.width || !frame.height) return 1;
  const contain = Math.min(frame.width / image.width, frame.height / image.height);
  return Math.max(frame.width / (image.width * contain), frame.height / (image.height * contain));
}

export function mobileMapBox(image: MobileMapSize, frame: MobileMapSize, view: MobileMapView): MobileMapBox {
  if (!image.width || !image.height || !frame.width || !frame.height) return { left: 0, top: 0, width: 0, height: 0 };
  const contain = Math.min(frame.width / image.width, frame.height / image.height);
  const zoom = Math.max(view.zoom, mobileCoverZoom(image, frame));
  const width = image.width * contain * zoom;
  const height = image.height * contain * zoom;
  const rawLeft = frame.width / 2 - view.centerX * width;
  const rawTop = frame.height / 2 - view.centerY * height;
  return {
    left: width <= frame.width ? (frame.width - width) / 2 : clamp(rawLeft, frame.width - width, 0),
    top: height <= frame.height ? (frame.height - height) / 2 : clamp(rawTop, frame.height - height, 0),
    width,
    height,
  };
}

/** Keep the map coordinate below a moving fingertip fixed while changing scale. */
export function mobileMapGesture(
  image: MobileMapSize,
  frame: MobileMapSize,
  start: MobileMapView,
  startPoint: { x: number; y: number },
  nextPoint: { x: number; y: number },
  factor: number,
): MobileMapView {
  const before = mobileMapBox(image, frame, start);
  if (!before.width || !before.height) return start;
  const cover = mobileCoverZoom(image, frame);
  const zoom = clamp(start.zoom * factor, cover, Math.max(4, cover * 2));
  const scale = zoom / Math.max(start.zoom, cover);
  const width = before.width * scale;
  const height = before.height * scale;
  const anchorX = (startPoint.x - before.left) / before.width;
  const anchorY = (startPoint.y - before.top) / before.height;
  const left = nextPoint.x - anchorX * width;
  const top = nextPoint.y - anchorY * height;
  return {
    zoom,
    centerX: clamp((frame.width / 2 - left) / width, 0, 1),
    centerY: clamp((frame.height / 2 - top) / height, 0, 1),
  };
}

/** Keep photographs compact at the frame-filling overview and grow them as the map zooms in. */
export function mobilePhotoScale(zoom: number, initialZoom: number): number {
  const cover = Math.max(1, initialZoom);
  const maximum = Math.max(4, cover * 2);
  return 0.32 + 1.03 * ((clamp(zoom, cover, maximum) - cover) / (maximum - cover));
}

/** Open photographs reach a readable full card, without undoing a closer map zoom. */
export function focusedPhotoScale(scale: number, focused: boolean): number {
  return focused ? Math.max(1, scale) : scale;
}

/** Keep both venue choices inside the wooden frame, including at map edges. */
export function mobileDoorPoint(
  box: MobileMapBox,
  frame: MobileMapSize,
  pin: { x: number; y: number },
): { left: number; top: number } {
  const edge = Math.min(90, frame.width / 2);
  const photoClearance = 64;
  const menuHeight = 116;
  const x = box.left + pin.x * box.width;
  const y = box.top + pin.y * box.height;
  const below = y + photoClearance;
  const top = below + menuHeight <= frame.height ? below : y - photoClearance - menuHeight;
  return {
    left: clamp(x, edge, frame.width - edge),
    top: clamp(top, 0, Math.max(0, frame.height - menuHeight)),
  };
}
