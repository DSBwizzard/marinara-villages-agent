import { manualHomesFixture } from "../helpers/founding-homes.fixture.js";
(window as any).manualHomesFixture = manualHomesFixture;
import { installFeature } from "./feature-root.js";
import { FoundingScreen } from "../../packages/villages/src/client/features/founding/FoundingScreen.js";
import { PreparationScreen } from "../../packages/villages/src/client/features/founding/PreparationScreen.js";
import { ExplorationScreen } from "../../packages/villages/src/client/features/exploration/ExplorationScreen.js";
import { useMenuDaylight } from "../../packages/villages/src/client/shared/useVillageLighting.js";
import { MenuAppearanceField } from "../../packages/villages/src/client/features/settings/SpriteVisualSettings.js";

installFeature(function FoundingFixture(controller) {
  const daylight = useMenuDaylight(controller.snapshot);
  if (controller.screen === "setup")
    return (
      <FoundingScreen
        controller={controller}
        storybookDaylight={daylight}
        appearanceControl={
          <MenuAppearanceField settings={controller.spriteVisualSettings} disabled={controller.busy} compact />
        }
      />
    );
  if (controller.screen === "preparing")
    return <PreparationScreen controller={controller} storybookDaylight={daylight} />;
  return <ExplorationScreen controller={controller} />;
});
