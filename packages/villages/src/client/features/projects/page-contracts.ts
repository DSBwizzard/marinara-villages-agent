import type { SceneView, VillageSnapshot } from "../../../shared/contracts/village.js";
import type { ProjectsController } from "./useProjectsController.js";

/** Inputs consumed by renderProjectsPage; assembled by the shell. */
export type ProjectsPagePorts = {
  readonly debugDiscardEnabled: boolean;
  readonly projectsController: ProjectsController;
  readonly goHome: () => void;
  readonly mobile: boolean;
  readonly room: SceneView | null;
  readonly setFocusedProjectId: (id: string) => void;
  readonly setPlacingProjectId: React.Dispatch<React.SetStateAction<string>>;
  readonly setScreen: React.Dispatch<
    React.SetStateAction<"person" | "venue" | "home" | "menu" | "room" | "setup" | "resume" | "preparing">
  >;
  readonly setSiteProjectId: React.Dispatch<React.SetStateAction<string>>;
  readonly siteProjectId: string;
  readonly snapshot: VillageSnapshot;
};
