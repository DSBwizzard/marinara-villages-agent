import type { NarrativeCondition, NarrativeState } from "../models/narrative-model.js";

export function activeNarrativeConditions(narrative: NarrativeState | undefined, at: string): NarrativeCondition[] {
  return (narrative?.conditions ?? []).filter(
    (row) => row.startsAt <= at && (!row.endsAt || row.endsAt > at) && (!row.clearedAt || row.clearedAt > at),
  );
}
/** Expiry reveals the baseline for the requested instant, without repairing physical prose. */
export function effectiveWeather(narrative: NarrativeState | undefined, at: string, baseline: string): string {
  const weather = narrative?.weather;
  return weather && weather.startsAt <= at && weather.endsAt > at ? weather.description : baseline;
}
export function environmentObservations(
  narrative: NarrativeState | undefined,
  at: string,
  venueId: string,
  zoneId: string,
) {
  return activeNarrativeConditions(narrative, at)
    .filter((row) => row.venueId === venueId && row.zoneId === zoneId)
    .map(({ id, revision, observation, restriction, remedy }) => ({ id, revision, observation, restriction, remedy }));
}
export function ordinaryUseRestricted(
  narrative: NarrativeState | undefined,
  at: string,
  venueId: string,
  zoneId: string,
) {
  return environmentObservations(narrative, at, venueId, zoneId).some((row) => row.restriction === "ordinary-use");
}
export function nextEnvironmentDeadline(narrative: NarrativeState | undefined, now: number): number | null {
  const times = [
    narrative?.weather?.endsAt,
    ...(narrative?.conditions ?? []).filter((row) => !row.clearedAt).map((row) => row.endsAt),
  ].flatMap((at) => (at && Date.parse(at) > now ? [Date.parse(at)] : []));
  return times.length ? Math.min(...times) : null;
}
