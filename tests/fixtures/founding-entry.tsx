import { installFeature } from "./feature-root.js";
import { FoundingScreen } from "../../packages/villages/src/client/features/founding/FoundingScreen.js";
import { PreparationScreen } from "../../packages/villages/src/client/features/founding/PreparationScreen.js";
import { ExplorationScreen } from "../../packages/villages/src/client/features/exploration/ExplorationScreen.js";
import { useVillageLighting } from "../../packages/villages/src/client/shared/useVillageLighting.js";

installFeature(function FoundingFixture(controller) {
  const daylight = useVillageLighting(controller.snapshot?.village, "storybook") !== "night";
  if (controller.screen === "setup") return <FoundingScreen controller={controller} storybookDaylight={daylight} />;
  if (controller.screen === "preparing")
    return <PreparationScreen controller={controller} storybookDaylight={daylight} />;
  return <ExplorationScreen controller={controller} />;
});
