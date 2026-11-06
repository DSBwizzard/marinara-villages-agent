import { useEffect, useRef } from "react";
import type { useVillageController } from "./useVillageController.js";

export function OpeningReminder({ controller }: { controller: ReturnType<typeof useVillageController> }) {
  const { snapshot, room, screen, roomBusy, sceneRestoration, placingProjectId } = controller;
  const opening = snapshot?.opening;
  const attempted = useRef("");
  useEffect(() => {
    // Restoring a saved gathering also consumes its automatic entry. Closing it
    // must not open another Scene while the refreshed snapshot is still pending.
    if (opening && room?.id && room.id === opening.gatheringSceneId) attempted.current = opening.id;
    if (
      !opening ||
      opening.stage !== "gathering" ||
      !snapshot?.foundingPreparation?.canPlay ||
      sceneRestoration.status !== "ready" ||
      screen !== "home" ||
      placingProjectId ||
      roomBusy ||
      (room && room.status !== "closed")
    )
      return;
    if (attempted.current === opening.id) return;
    const venue = snapshot.settings.venues.find((entry) => entry.id === opening.communityVenueId);
    if (!venue) return;
    attempted.current = opening.id;
    const common = venue.zones?.find(
      (zone) => zone.kind === "public" && !zone.closed && zone.access?.mode === "public",
    );
    if (common) void controller.openRoom(venue, common.id);
  }, [controller, opening, snapshot, sceneRestoration.status, screen, roomBusy, room, placingProjectId]);
  return null;
}
