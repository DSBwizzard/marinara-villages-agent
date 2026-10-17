import { installFeature } from "./feature-root.js";
import { ResidentsScreen } from "../../packages/villages/src/client/features/residents/ResidentsScreen.js";
import { RosterScreen } from "../../packages/villages/src/client/features/residents/RosterScreen.js";
installFeature((controller) =>
  controller.personProfile ? <ResidentsScreen controller={controller} /> : <RosterScreen controller={controller} />,
);
