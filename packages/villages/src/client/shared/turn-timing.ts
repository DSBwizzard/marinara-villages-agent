// Bounded, current-tab diagnostics only: no dialogue, credentials or provider data.
const timings = new Map<
  string,
  { sceneId: string; submissionId: string; started: number; events: Record<string, number> }
>();
export function recordTurnTiming(sceneId: string, submissionId: string, event: string) {
  if (!submissionId) return;
  const key = sceneId + ":" + submissionId;
  let timing = timings.get(key);
  if (!timing && event !== "send") return;
  if (!timing) {
    timing = { sceneId, submissionId, started: performance.now(), events: {} };
    timings.set(key, timing);
    if (timings.size > 20) timings.delete(timings.keys().next().value!);
  }
  timing.events[event] ??= Math.round(performance.now() - timing.started);
}
export function readTurnTimings(sceneId: string) {
  return [...timings.values()]
    .filter((row) => row.sceneId === sceneId)
    .map(({ sceneId, submissionId, events }) => ({ sceneId, submissionId, elapsedSinceSendMs: { ...events } }));
}
