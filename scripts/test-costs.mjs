// Approximate seconds from successful CI reports. These affect scheduling only,
// never coverage, timeouts or evidence validity. Unknown browser work is costly.
const seconds = new Map([
  ["villages-sprite-entry.e2e.mjs", 6],
  ["villages-venue-layout.e2e.mjs", 53],
  ["villages-sprite-manager.e2e.mjs", 47],
  ["villages-scene-controls.e2e.mjs", 43],
  ["villages-desktop-parity.e2e.mjs", 38],
  ["villages-founding-preparation.e2e.mjs", 36],
  ["villages-reading-pages.e2e.mjs", 35],
  ["villages-dossier.e2e.mjs", 33],
  ["villages-mobile-scene.e2e.mjs", 31],
  ["villages-mobile-exploration.e2e.mjs", 30],
  ["villages-scene-send-recovery.e2e.mjs", 24],
  ["villages-ci-profiles.regression.mjs", 19],
  ["villages-player-role.e2e.mjs", 17],
  ["villages-doorway-continuity.e2e.mjs", 16],
  ["villages-room-notices.e2e.mjs", 14],
  ["villages-town-map-image.regression.ts", 11],
  ["villages-location-image.regression.ts", 11],
  ["villages-pipeline.regression.mjs", 8],
]);
export function testCost(test) {
  return seconds.get(test.path?.split("/").at(-1)) ?? (test.group === "browser" ? 20 : 3);
}
