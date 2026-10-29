import type { PlaceContinuity } from "../contracts/place-continuity.js";

export const MAX_PLACE_DESCRIPTION = 4000;
export const MAX_RECENT_PLACE_CONTEXT = 600;
export const RECENT_PLACE_DURATION = 24 * 60 * 60 * 1000;
export const emptyPlaceContinuity = (): PlaceContinuity => ({ revision: 0, updatedAt: "", recent: null });
export function recentPlaceText(state: PlaceContinuity, at: string | number): string {
  return state.recent && Date.parse(state.recent.expiresAt) > (typeof at === "number" ? at : Date.parse(at))
    ? state.recent.text
    : "";
}
