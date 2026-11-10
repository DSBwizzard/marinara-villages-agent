import type { VenueLine, VenueScene } from "../models/scene-model.js";

export function sceneFingerprint(session: VenueScene) {
  return [
    JSON.stringify([
      session.status,
      session.zoneId,
      session.area,
      session.privateOwnerId,
      session.activeIds,
      session.participants,
      session.recap,
      session.continuity?.facts.venues
        .find((venue) => venue.id === session.placeId)
        ?.zones?.filter((zone) => zone.id === session.zoneId || zone.seen)
        .map((zone) => [
          zone.id,
          zone.name,
          zone.kind,
          zone.connectedTo,
          zone.id === session.zoneId ? [zone.description, zone.state] : undefined,
        ]),
    ]),
    session.lines.filter((line) => line.kind !== "input").map((line) => line.id),
  ] as const;
}
export function pendingProgressTurns(session: VenueScene, foundedAt: string) {
  return session.submissions.filter(
    (turn) =>
      (turn.acceptance.status === "pending" || turn.acceptance.status === "held") &&
      (!foundedAt || Date.parse(turn.at) >= Date.parse(foundedAt)),
  );
}
export function appendLine(session: VenueScene, line: VenueLine): void {
  session.lines.push({ ...line, zoneId: line.zoneId ?? session.zoneId });
}
