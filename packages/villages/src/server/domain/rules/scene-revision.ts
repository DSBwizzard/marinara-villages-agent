export function sceneRevision(data: Record<string, unknown>): number {
  return Number.isSafeInteger(data.sceneRevision) && Number(data.sceneRevision) >= 0 ? Number(data.sceneRevision) : 0;
}
