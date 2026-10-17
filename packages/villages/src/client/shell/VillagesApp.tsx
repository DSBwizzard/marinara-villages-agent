import type { useVillageController as ControllerFactory } from "./useVillageController.js";
import { ELEMENT_TAG } from "../shared/constants.js";
import { ExplorationScreen } from "../features/exploration/ExplorationScreen.js";
import { FoundingScreen } from "../features/founding/FoundingScreen.js";
import { PreparationScreen } from "../features/founding/PreparationScreen.js";
import { ResumeScreen } from "../features/founding/ResumeScreen.js";
import { ResidentsScreen } from "../features/residents/ResidentsScreen.js";
import { RosterScreen } from "../features/residents/RosterScreen.js";
import { SceneScreen } from "../features/scenes/SceneScreen.js";
import { MenuScreen } from "./MenuScreen.js";
import { VenueScreen } from "../features/venues/VenueScreen.js";
import { useVillageController } from "./useVillageController.js";
import { VillagesFrame } from "./VillagesFrame.js";

export function VillagesView({ element }: { element: HTMLElement }) {
  const controller = useVillageController({ element });
  return (
    <VillagesFrame controller={controller}>
      <VillageScreen controller={controller} />
    </VillagesFrame>
  );
}

function VillageScreen({ controller }: { controller: ReturnType<typeof ControllerFactory> }) {
  const { screen, personProfile, menuPage, room, sceneRestoration } = controller;

  if (!room && sceneRestoration.status !== "ready")
    return (
      <div className={ELEMENT_TAG + "-root"}>
        <section className={ELEMENT_TAG + "-panel"} role="status">
          <p>{sceneRestoration.status === "error" ? "Could not load your Scene." : "Loading Scene…"}</p>
          {sceneRestoration.status === "error" ? (
            <button type="button" className={ELEMENT_TAG + "-button"} onClick={sceneRestoration.retry}>
              Retry Scene check
            </button>
          ) : null}
        </section>
      </div>
    );

  if (room && room.status !== "closed")
    return (
      <>
        <div key="retained-scene" hidden={screen !== "room"} style={{ height: "100%" }}>
          <SceneScreen controller={controller} />
        </div>
        {screen === "venue" ? (
          <VenueScreen controller={controller} />
        ) : screen === "menu" ? (
          menuPage === "villagers" ? (
            <RosterScreen controller={controller} />
          ) : (
            <MenuScreen controller={controller} />
          )
        ) : screen === "person" && personProfile ? (
          <ResidentsScreen controller={controller} />
        ) : null}
      </>
    );

  if (screen === "person" && personProfile)
    return (
      <>
        {personProfile.returnTo === "room" ? (
          <div key="retained-scene" hidden style={{ height: "100%" }}>
            <SceneScreen controller={controller} />
          </div>
        ) : null}
        <ResidentsScreen controller={controller} />
      </>
    );

  if (screen === "room") {
    return (
      <>
        <div key="retained-scene" style={{ height: "100%" }}>
          {<SceneScreen controller={controller} />}
        </div>
      </>
    );
  }

  if (screen === "venue") return <VenueScreen controller={controller} />;

  if (screen === "menu" && menuPage === "villagers") return <RosterScreen controller={controller} />;

  if (screen === "menu") return <MenuScreen controller={controller} />;

  if (screen === "preparing") return <PreparationScreen controller={controller} />;

  if (screen === "resume") return <ResumeScreen controller={controller} />;

  if (screen === "setup") return <FoundingScreen controller={controller} />;
  return <ExplorationScreen controller={controller} />;
}
