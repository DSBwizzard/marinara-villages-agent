import type { VenueScene } from "../models/scene-model.js";
import { spinoffLocksScene } from "../models/spinoff-model.js";

export const INACTIVITY_MS = 30 * 60 * 1000;
export function isInactive(session: VenueScene, now = Date.now()): boolean {
  if (session.openingReader || spinoffLocksScene(session.spinoff)) return false;
  return now - Date.parse(session.lastActivityAt || session.startedAt) >= INACTIVITY_MS;
}
