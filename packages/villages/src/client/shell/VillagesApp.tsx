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

export function VillagesView({ element }: { element: HTMLElement }) {
  const controller = useVillageController({ element });
  const { screen, personProfile, menuPage } = controller;

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
