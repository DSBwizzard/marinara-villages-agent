/** Reserve the top Scene controls; the dialogue dock never yields space to asides. */
export function sceneAsideAvailableHeight(
  dockTop: number,
  sceneTop: number,
  visibleTop: number,
  topInset: number,
): number {
  return Math.max(0, dockTop - Math.max(sceneTop, visibleTop) - topInset - 6);
}
