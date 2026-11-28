import { OpeningReminder } from "./OpeningReminder.js";
import type { ReactNode } from "react";
import { VillageActivity } from "../shared/activity.js";
import type { useVillageController } from "./useVillageController.js";
import { ReturnCatchup } from "../features/background/ReturnCatchup.js";
import { LoreActivity } from "../shared/LoreActivity.js";
import { useMenuDaylight } from "../shared/useVillageLighting.js";
type FrameProps = { controller: ReturnType<typeof useVillageController>; children: ReactNode };
export function VillagesFrame({
  controller,
  children,
  mapVisible = false,
  menu = false,
}: FrameProps & { mapVisible?: boolean; menu?: boolean }) {
  const daylight = useMenuDaylight(controller.snapshot);
  return (
    <VillageActivity
      value={{
        visible: controller.visible,
        worldScope: controller.snapshot?.worldScope,
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
      <div className="villages-frame" style={{ position: "relative", height: "100%" }}>
        <ReturnCatchup
          key={controller.snapshot?.worldScope ?? ""}
          enabled={controller.visible && !!controller.snapshot?.isFounded && controller.screen !== "preparing"}
          pendingOnSnapshot={controller.snapshot?.todayAgendasPending === true}
          onSettled={controller.loadSnapshot}
          menu={menu}
          venue={controller.screen === "venue"}
          repair={controller.screen === "menu" && controller.menuPage === "repair"}
          recovery={controller.screen === "menu" && ["repair", "general"].includes(controller.menuPage)}
          openConnections={() => controller.openMenu("general")}
          openRepair={() => controller.openMenu("repair")}
        >
          <LoreActivity
            key={controller.snapshot?.worldScope ?? ""}
            enabled={
              !mapVisible &&
              controller.screen !== "setup" &&
              controller.screen !== "preparing" &&
              !(controller.screen === "menu" && controller.menuPage === "repair") &&
              controller.snapshot?.settings.lorebookChipsEnabled !== false
            }
            daylight={daylight}
          >
            <VillageContent key={controller.snapshot?.worldScope ?? ""} controller={controller}>
              {children}
            </VillageContent>
          </LoreActivity>
        </ReturnCatchup>
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
