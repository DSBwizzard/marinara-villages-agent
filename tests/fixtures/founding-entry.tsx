import { installFeature } from "./feature-root.js";
import { FoundingScreen } from "../../packages/villages/src/client/features/founding/FoundingScreen.js";
import { PreparationScreen } from "../../packages/villages/src/client/features/founding/PreparationScreen.js";
import { ResumeScreen } from "../../packages/villages/src/client/features/founding/ResumeScreen.js";
import { ExplorationScreen } from "../../packages/villages/src/client/features/exploration/ExplorationScreen.js";
installFeature((controller) =>
  controller.screen === "setup" ? (
    <FoundingScreen controller={controller} />
  ) : controller.screen === "preparing" ? (
    <PreparationScreen controller={controller} />
  ) : controller.screen === "resume" ? (
    <ResumeScreen controller={controller} />
  ) : (
    <ExplorationScreen controller={controller} />
  ),
);
