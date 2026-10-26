import { OpeningReminder } from "./OpeningReminder.js";
import { useState, type ReactNode } from "react";
import { VillageActivity } from "../shared/activity.js";
import type { useVillageController } from "./useVillageController.js";
import { SpinoffPanel } from "../features/scenes/SpinoffPanel.js";
type FrameProps = { controller: ReturnType<typeof useVillageController>; children: ReactNode };
export function VillagesFrame({ controller, children }: FrameProps) {
  const [spinoffLocked, setSpinoffLocked] = useState(false);
  return (
    <VillageActivity
      value={{
        visible: controller.visible,
        backgroundRevision: JSON.stringify(
          controller.snapshot?.backgroundWork?.map(({ id, status, attempt, updatedAt }) => [
            id,
            status,
            attempt,
            updatedAt,
          ]) ?? [],
        ),
      }}
    >
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
    </VillageActivity>
  );
}

function VillageContent({ controller, children }: FrameProps) {
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <OpeningReminder controller={controller} />
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>{children}</div>
    </div>
  );
}
