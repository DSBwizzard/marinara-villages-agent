import type { VenueLine, VenueScene } from "../models/scene-model.js";
import { perceivedZoneLine } from "./zone-events.js";

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
    ]),
    session.lines.map((line) => line.id),
  ] as const;
}
export function pendingProgressTurns(session: VenueScene, foundedAt: string) {
  return session.submissions.filter(
    (turn) =>
      !turn.movement &&
      turn.at &&
      !turn.progressProcessedAt &&
      (!foundedAt || Date.parse(turn.at) >= Date.parse(foundedAt)),
  );
}
export function appendLine(session: VenueScene, line: VenueLine): void {
  session.lines.push({ ...line, zoneId: line.zoneId ?? session.zoneId });
}
export function heardLines(session: VenueScene, characterId: string): VenueLine[] {
  return session.lines
    .filter((line) => line.heardBy.includes(characterId) || line.soundOnly?.characterIds.includes(characterId))
    .map((line) => perceivedZoneLine(line, characterId));
}
