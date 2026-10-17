import { installFeature } from "./feature-root.js";
import { SceneScreen } from "../../packages/villages/src/client/features/scenes/SceneScreen.js";
installFeature((controller) =>
  controller.room ? (
    <div key="retained-scene" hidden={controller.screen !== "room"} style={{ height: "100%" }}>
      <SceneScreen controller={controller} />
    </div>
  ) : null,
);
