import type { VenueScene } from "../models/scene-model.js";

export const INACTIVITY_MS = 30 * 60 * 1000;
export function isInactive(session: VenueScene, now = Date.now()): boolean {
  return now - Date.parse(session.lastActivityAt || session.startedAt) >= INACTIVITY_MS;
}
