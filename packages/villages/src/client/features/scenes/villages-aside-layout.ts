export type AsideSide = "left" | "right";

/** Follow each aside's speaker, independently of the main dialogue speaker. */
export function groupSceneAsides<T extends { speakerId?: string }>(
  asides: readonly T[],
  positions: Readonly<Record<string, { x: number }>>,
  mainSpeakerId: string,
): Record<AsideSide, T[]> {
  const groups: Record<AsideSide, T[]> = { left: [], right: [] };
  for (const aside of asides) {
    const x = positions[aside.speakerId ?? mainSpeakerId]?.x ?? 0.5;
    groups[x < 0.5 ? "left" : "right"].push(aside);
  }
  return groups;
}

/** Reserve the top Scene controls; the dialogue dock never yields space to asides. */
export function sceneAsideAvailableHeight(
  dockTop: number,
  sceneTop: number,
  visibleTop: number,
  topInset: number,
): number {
  return Math.max(0, dockTop - Math.max(sceneTop, visibleTop) - topInset - 6);
}
