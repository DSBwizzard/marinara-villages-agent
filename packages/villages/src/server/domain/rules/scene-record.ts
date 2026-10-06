import type { VenueLine, VenueScene } from "../models/scene-model.js";

export function sceneFingerprint(session: VenueScene): string {
  return JSON.stringify([
    session.status,
    session.zoneId,
    session.area,
    session.privateOwnerId,
    session.activeIds,
    session.participants,
    session.lines.map((line) => line.id),
    session.recap,
  ]);
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
  line.zoneId ??= session.zoneId;
  session.lines.push(line);
  for (const id of line.heardBy)
    if (!session.heardHistory.some((history) => history.characterId === id))
      session.heardHistory.push({ characterId: id, lineIds: [] });
  for (const history of session.heardHistory)
    if (line.heardBy.includes(history.characterId)) history.lineIds.push(line.id);
}
export function heardLines(session: VenueScene, characterId: string): VenueLine[] {
  const ids = new Set(session.heardHistory.find((history) => history.characterId === characterId)?.lineIds ?? []);
  return session.lines.filter((line) => ids.has(line.id));
}
