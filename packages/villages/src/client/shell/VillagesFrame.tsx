import { OpeningReminder } from "./OpeningReminder.js";
import { useEffect, useState, type ReactNode } from "react";
import type { useVillageController } from "./useVillageController.js";
import { SpinoffPanel } from "../features/scenes/SpinoffPanel.js";
type FrameProps = { controller: ReturnType<typeof useVillageController>; children: ReactNode };
export function VillagesFrame({ controller, children }: FrameProps) {
  const [spinoffLocked, setSpinoffLocked] = useState(false);
  return (
    <div style={{ position: "relative", height: "100%" }}>
      <SpinoffPanel
        element={controller.element}
        scene={controller.room}
        onLocked={setSpinoffLocked}
        onResolved={async () => {
          await controller.loadSnapshot();
          const { request } = await import("../shared/api.js");
          const { session } = await request<{ session: typeof controller.room }>("/rooms/active");
          controller.setRoom(session);
          if (session) controller.setScreen("room");
        }}
      >
        <div inert={spinoffLocked} style={{ height: "100%" }}>
          <VillageContent controller={controller}>{children}</VillageContent>
        </div>
      </SpinoffPanel>
    </div>
  );
}

function VillageContent({ controller, children }: FrameProps) {
  const { loadSnapshot } = controller;
  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) void loadSnapshot().catch(() => {});
    };
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadSnapshot]);
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <OpeningReminder controller={controller} />
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>{children}</div>
    </div>
  );
}
