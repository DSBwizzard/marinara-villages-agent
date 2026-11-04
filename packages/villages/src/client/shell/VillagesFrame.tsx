import { OpeningReminder } from "./OpeningReminder.js";
import type { ReactNode } from "react";
import { VillageActivity } from "../shared/activity.js";
import type { useVillageController } from "./useVillageController.js";
import { ReturnCatchup } from "../features/background/ReturnCatchup.js";
type FrameProps = { controller: ReturnType<typeof useVillageController>; children: ReactNode };
export function VillagesFrame({ controller, children }: FrameProps) {
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
        <VillageContent controller={controller}>{children}</VillageContent>
        <ReturnCatchup
          enabled={controller.visible && !!controller.snapshot?.isFounded}
          onSettled={controller.loadSnapshot}
        />
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
