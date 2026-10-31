import { useEffect, useRef, useState } from "react";
import type { useVillageController } from "./useVillageController.js";
import { ELEMENT_TAG as P } from "../shared/constants.js";

export function OpeningReminder({ controller }: { controller: ReturnType<typeof useVillageController> }) {
  const { snapshot, room, screen, roomBusy, sceneRestoration, placingProjectId } = controller;
  const opening = snapshot?.opening;
  const attempted = useRef("");
  const [dismissed, dismiss] = useState("");
  const key = `${opening?.id}:${opening?.action}`;
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
    void controller.openRoom(venue, "community");
  }, [controller, opening, snapshot, sceneRestoration.status, screen, roomBusy, room, placingProjectId]);
  if (
    !opening?.action ||
    opening.version === 3 ||
    placingProjectId ||
    dismissed === key ||
    !["room", "home"].includes(screen) ||
    !snapshot?.foundingPreparation?.canPlay
  )
    return null;
  const follow = () => {
    if (opening.stage === "gathering") {
      if (room && room.status !== "closed") controller.setScreen("room");
      else {
        const venue = snapshot.settings.venues.find((entry) => entry.id === opening.communityVenueId);
        if (venue) void controller.openRoom(venue, "community");
      }
    } else if (opening.stage === "conversations" && opening.residentIds.some((id) => !opening.heardIds.includes(id)))
      controller.openMenu("villagers");
    else if (opening.stage === "first-use") {
      const project = snapshot.projects.find((entry) => entry.id === opening.projectId);
      const venue = snapshot.settings.venues.find((entry) => entry.id === project?.venueId);
      if (venue) controller.openVenue(venue);
    } else controller.openVenueProject(opening.projectId);
  };
  return (
    <nav
      className={`${P}-opening-reminder`}
      aria-label="Opening"
      style={{
        display: "flex",
        flex: "0 0 auto",
        justifyContent: "space-between",
        gap: ".5rem",
        padding: ".3rem .75rem",
        background: "var(--background)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <button type="button" className={`${P}-button`} disabled={roomBusy} onClick={follow}>
        {opening.action}
      </button>
      <button
        type="button"
        className={`${P}-button`}
        aria-label="Dismiss current reminder"
        onClick={() => dismiss(key)}
      >
        ×
      </button>
    </nav>
  );
}
