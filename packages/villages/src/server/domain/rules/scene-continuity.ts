import type { VenueScene } from "../models/scene-model.js";

/** Narrator context is player-visible history, never a grant of resident knowledge or save evidence. */
export function visibleSceneContinuity(scene: VenueScene): string {
  const lines = scene.lines.filter((line) => line.kind === "narration" && !line.contactHidden && !line.contactReport);
  const recent: string[] = [];
  let size = 0;
  for (const line of lines.slice(-8).reverse()) {
    if (size + line.content.length > 6000) break;
    recent.unshift(line.content);
    size += line.content.length;
  }
  return recent.length
    ? "Player-visible narration continuity (narrator only; not resident knowledge or citable evidence): " +
        JSON.stringify(recent) +
        " Continue after these events. Keep established appearance and completed actions consistent; do not reopen an already opened door or introduce the same outfit again. Only an explicit new event changes them. Residents still know only their individually witnessed history."
    : "";
}
