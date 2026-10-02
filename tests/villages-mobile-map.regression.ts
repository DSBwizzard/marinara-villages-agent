import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  focusedPhotoScale,
  groupMobileMapMarkers,
  mobileCoverZoom,
  mobileDoorPoint,
  mobileGestureMoved,
  mobileMapBox,
  mobileMapGesture,
  mobilePhotoScale,
} from "../packages/villages/src/engine/packages/client/src/villages-mobile-map.ts";

const image = { width: 1500, height: 1000 };
const frame = { width: 360, height: 600 };
assert.equal(mobileGestureMoved({ x: 20, y: 20, distance: 1 }, { x: 25, y: 25, distance: 1 }), false);
assert.equal(mobileGestureMoved({ x: 20, y: 20, distance: 1 }, { x: 29, y: 20, distance: 1 }), true);
assert.equal(mobileGestureMoved({ x: 20, y: 20, distance: 70 }, { x: 20, y: 20, distance: 79 }), true);
const cover = mobileCoverZoom(image, frame);
assert.equal(cover, 2.5);
const initial = { zoom: cover, centerX: 0.5, centerY: 0.5 };
const centered = mobileMapBox(image, frame, initial);
assert.deepEqual(centered, { left: -270, top: 0, width: 900, height: 600 });

const dragged = mobileMapGesture(image, frame, initial, { x: 180, y: 300 }, { x: 280, y: 300 }, 1);
assert.equal(mobileMapBox(image, frame, dragged).left, -170);
assert.equal(
  mobileMapBox(image, frame, mobileMapGesture(image, frame, initial, { x: 180, y: 300 }, { x: 2000, y: 300 }, 1)).left,
  0,
);
assert.equal(
  mobileMapBox(image, frame, mobileMapGesture(image, frame, initial, { x: 180, y: 300 }, { x: -2000, y: 300 }, 1)).left,
  -540,
);

const anchor = { x: 140, y: 270 };
const pinched = mobileMapGesture(image, frame, initial, anchor, anchor, 1.5);
const after = mobileMapBox(image, frame, pinched);
assert.ok(Math.abs((anchor.x - centered.left) / centered.width - (anchor.x - after.left) / after.width) < 1e-10);
assert.ok(Math.abs((anchor.y - centered.top) / centered.height - (anchor.y - after.top) / after.height) < 1e-10);
const all = mobileMapBox(image, frame, mobileMapGesture(image, frame, initial, anchor, anchor, 0.01));
assert.deepEqual(all, centered);
assert.equal(mobilePhotoScale(cover, cover), 0.32);
assert.equal(mobilePhotoScale((cover + Math.max(4, cover * 2)) / 2, cover), 0.835);
assert.equal(mobilePhotoScale(cover * 2, cover), 1.35);
assert.equal(focusedPhotoScale(0.32, false), 0.32);
assert.equal(focusedPhotoScale(0.32, true), 1);
assert.equal(focusedPhotoScale(1, true), 1);
assert.equal(focusedPhotoScale(1.35, true), 1.35);
for (const mapShape of [
  { width: 1500, height: 1000 },
  { width: 1000, height: 1000 },
  { width: 1000, height: 1500 },
  { width: 1080, height: 566 }, // Image-free villages use the saved logical map shape.
]) {
  for (const viewport of [
    { width: 360, height: 600 },
    { width: 600, height: 360 },
  ]) {
    const minimum = mobileCoverZoom(mapShape, viewport);
    const start = { zoom: minimum, centerX: 0.5, centerY: 0.5 };
    const startBox = mobileMapBox(mapShape, viewport, start);
    assert.equal(startBox.left + startBox.width / 2, viewport.width / 2);
    assert.equal(startBox.top + startBox.height / 2, viewport.height / 2);
    const reduced = mobileMapGesture(mapShape, viewport, start, { x: 100, y: 100 }, { x: -500, y: 800 }, 0.01);
    const box = mobileMapBox(mapShape, viewport, reduced);
    assert.equal(reduced.zoom, minimum);
    assert.ok(box.width + 1e-9 >= viewport.width && box.height + 1e-9 >= viewport.height);
    assert.ok(box.left <= 0 && box.top <= 0);
    assert.ok(box.left + box.width + 1e-9 >= viewport.width);
    assert.ok(box.top + box.height + 1e-9 >= viewport.height);
    assert.equal(mobilePhotoScale(minimum, minimum), 0.32);
  }
}
assert.deepEqual(mobileDoorPoint({ left: 0, top: 0, width: 360, height: 600 }, frame, { x: 0.95, y: 0.97 }), {
  left: 270,
  top: 402,
});
assert.deepEqual(mobileDoorPoint({ left: 0, top: 0, width: 360, height: 600 }, frame, { x: 0.05, y: 0.05 }), {
  left: 90,
  top: 94,
});

// Screen-space grouping is reversible and leaves world coordinates unchanged.
const marker = (id: string, left: number, top = 100) => ({ id, left, top, width: 100, height: 64 });
const crowded = [marker("a", 50), marker("b", 140), marker("c", 220), marker("d", 500)];
const beforeGrouping = structuredClone(crowded);
const groups = groupMobileMapMarkers(crowded);
assert.deepEqual(
  groups.map((group) => group.ids),
  [["a", "b", "c"], ["d"]],
);
assert.deepEqual(crowded, beforeGrouping);
assert.equal(new Set(groups.flatMap((group) => group.ids)).size, crowded.length);
assert.deepEqual(groupMobileMapMarkers([]), []);
assert.equal(groupMobileMapMarkers([marker("a", 50), marker("b", 300)]).length, 2);
assert.equal(groupMobileMapMarkers([marker("a", 50, 50), marker("b", 50, 122)]).length, 2);

const source = readFileSync(
  resolve(
    dirname(fileURLToPath(import.meta.url)),
    "../packages/villages/src/engine/packages/client/src/villages-package-entry.tsx",
  ),
  "utf8",
);
assert.ok(source.includes("touch-action: none;"));
assert.ok(source.includes("mobile={mobile && setupStep >= 2}"));
assert.ok(source.includes("mobile={mobile}"));
assert.ok(source.includes("className={`${ELEMENT_TAG}-pin-photo`}"));
assert.ok(source.includes("className={`${ELEMENT_TAG}-pin-photo-card`}"));
assert.ok(source.includes("data-pin-id={pin.id}"));
assert.ok(source.includes("selected: openPlaceId === place.id"));
assert.ok(source.includes('data-selected={pin.selected ? "true" : "false"}'));
assert.ok(source.includes("focusedPhotoScale("));
assert.ok(source.includes('data-mobile-gesturing", "true"'));
assert.ok(source.includes("left: `${picture.left + pin.x * picture.width}px`"));
assert.ok(source.includes("event.target.closest(`.${ELEMENT_TAG}-doors, .${ELEMENT_TAG}-zoom`)"));
assert.equal(source.includes('mobileStart="contain"'), false);
assert.ok(
  source.includes("const tapped = !cancelled && pointersRef.current.size === 1 && !suppressTouchClickRef.current"),
);
assert.ok(source.includes("onPlace(round4(x), round4(y), {"));
assert.ok(source.includes("photoWidth: photoRect?.width"));
assert.ok(source.includes("event.target.closest(`.${ELEMENT_TAG}-canvas`)"));
assert.ok(source.includes("aria-label={`Noticeboard (${snapshot?.noticeboard.length ?? 0})`}"));
assert.ok(source.includes('aria-label="Events (NYI)"'));
assert.ok(source.includes("Force Village Update"));
assert.ok(source.includes("FORCE_VILLAGE_UPDATE_NOTICE"));
assert.ok(source.includes("bypasses Background events and wishes for one visual Events update"));
assert.ok(source.includes("data-section={menuSection}"));
assert.ok(source.includes('onClick={() => openMenu("general")}'));
assert.ok(source.includes('onClick={() => openMenu("village")}'));
assert.ok(source.includes('onClick={() => openMenu("memories")}'));
assert.equal(source.includes('onClick={() => openMenu("story")}'), false);
assert.equal(source.includes("Fit entire map"), false);

console.log("Villages mobile map: bounded pan, anchored pinch, tap threshold, menu bounds, scoped controls ok");
