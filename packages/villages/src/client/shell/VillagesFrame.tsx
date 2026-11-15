import { OpeningReminder } from "./OpeningReminder.js";
import type { ReactNode } from "react";
import { VillageActivity } from "../shared/activity.js";
import type { useVillageController } from "./useVillageController.js";
import { ReturnCatchup } from "../features/background/ReturnCatchup.js";
import { LoreActivity } from "../shared/LoreActivity.js";
type FrameProps = { controller: ReturnType<typeof useVillageController>; children: ReactNode };
export function VillagesFrame({ controller, children }: FrameProps) {
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
      <div style={{ position: "relative", height: "100%" }}>
        <LoreActivity>
          <VillageContent key={controller.snapshot?.worldScope ?? ""} controller={controller}>
            {children}
          </VillageContent>
        </LoreActivity>
        <ReturnCatchup
          enabled={controller.visible && !!controller.snapshot?.isFounded}
          onSettled={controller.loadSnapshot}
        />
      </div>
    </VillageActivity>
  );
}

function VillageContent({ controller, children }: FrameProps) {
  const snapshot = controller.snapshot;
  const stay = snapshot?.sleepsIn;
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <OpeningReminder controller={controller} />
      {stay ? (
        <details style={{ padding: "0.5rem 1rem", borderBottom: "1px solid rgba(127, 127, 127, 0.28)" }}>
          <summary style={{ cursor: "pointer", overflowWrap: "anywhere" }}>
            <strong>Sleeps in</strong> · {stay.place} · {stay.status === "pending" ? "Pending" : stay.room}
          </summary>
          <div style={{ padding: "0.375rem 0 0 1rem", overflowWrap: "anywhere" }}>
            {stay.status === "pending" ? (
              <>
                <div>{stay.room}</div>
                <div>Condition · {stay.condition}</div>
                <div>Stay access pending</div>
              </>
            ) : (
              <>
                <div>Access to the room and its entry route</div>
                <div>
                  Ends{" "}
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: snapshot.village.timeZone,
                  }).format(new Date(stay.endsAt))}
                </div>
              </>
            )}
          </div>
        </details>
      ) : null}
      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>{children}</div>
    </div>
  );
}
