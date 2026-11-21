import type { SceneHistoryVisit } from "../../../shared/contracts/scene-history.js";
import type { VenueScene } from "../models/scene-model.js";
import { memoryHash } from "./memory-integrity.js";

/** Follow the player's ordered, public arrivals, never a remote speaker's location. */
export function sceneHistoryVisits(scene: VenueScene, positions: readonly number[]): SceneHistoryVisit[] {
  const zones = scene.sceneAttendance?.layout ?? [];
  const name = (id?: string) => {
    const zone = zones.find((zone) => zone.id === id);
    return zone?.kind === "exterior" ? "Entrance" : zone?.name || "Scene";
  };
  const turns = scene.submissions.filter((turn) => turn.acceptance.status === "applied");
  const origins = new Map<string, string>();
  const turnOrigins = new Map<string, string>();
  for (const turn of turns) {
    if (!turn.zoneIdAtTurn) continue;
    for (const id of turn.replyLineIds ?? []) origins.set(id, turn.zoneIdAtTurn);
    turnOrigins.set(turn.id, turn.zoneIdAtTurn);
  }
  const firstArrival = positions.find((position) => scene.lines[position].id.startsWith("arrival-"));
  const receipt =
    firstArrival === undefined
      ? undefined
      : scene.navigationReceipts?.find(
          (receipt) => "arrival-" + memoryHash([scene.id, receipt.id]).slice(0, 32) === scene.lines[firstArrival].id,
        );
  const initialOrigin = positions
    .filter((position) => firstArrival === undefined || position < firstArrival)
    .map((position) => {
      const line = scene.lines[position];
      return line.inputOf ? turnOrigins.get(line.inputOf) : origins.get(line.id);
    })
    .find(Boolean);
  let zone = initialOrigin ?? receipt?.originZoneId ?? (firstArrival === undefined ? scene.zoneId : undefined);
  let visit: SceneHistoryVisit = { id: scene.id, name: name(zone), at: scene.startedAt };
  return positions.map((position) => {
    const line = scene.lines[position];
    if (line.id.startsWith("arrival-") && line.role === "assistant" && line.speakerId === "__venue_scene__") {
      zone = line.zoneId;
      visit = { id: line.id, name: name(zone), at: line.at };
    } else {
      const origin = line.inputOf ? turnOrigins.get(line.inputOf) : origins.get(line.id);
      if (origin && origin !== zone) {
        zone = origin;
        visit = { id: "visit-" + line.id, name: name(zone), at: line.at };
      }
    }
    return visit;
  });
}
