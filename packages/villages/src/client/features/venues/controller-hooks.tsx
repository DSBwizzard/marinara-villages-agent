import { useEffect } from "react";

export function useVenueRequestFocus(ports: {
  element: HTMLElement;
  focusedRequestId: string;
  menuPage: import("../../shared/types.js").MenuPage;
  screen: "home" | "menu" | "setup" | "resume" | "preparing" | "venue" | "room" | "person";
}) {
  const { element, focusedRequestId, menuPage, screen } = ports;
  useEffect(() => {
    if (screen !== "menu" || menuPage !== "venueRequests" || !focusedRequestId) return;
    const target = element.querySelector<HTMLElement>(`[data-villager-request="${CSS.escape(focusedRequestId)}"]`);
    target?.scrollIntoView({ block: "nearest" });
    target?.focus({ preventScroll: true });
  }, [element, focusedRequestId, menuPage, screen]);
}
