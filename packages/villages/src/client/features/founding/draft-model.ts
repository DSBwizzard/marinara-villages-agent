import type { FoundingPhase } from "./founding-steps.js";
import type { useFoundingSetupDraftData } from "./controller-hooks.js";
import type { emptyFoundingWorkspace } from "./villages-founding-workspace-state.js";

/** Stored founding drafts predate the optional workspace navigation field. */
export type SetupDraftData = Omit<
  ReturnType<typeof useFoundingSetupDraftData>,
  "workspace" | "phase" | "mapSource" | "styleProfileId"
> & {
  /** Legacy Simple map drafts are restored into an artwork choice. */
  mapSource: ReturnType<typeof useFoundingSetupDraftData>["mapSource"] | "none";
  styleProfileId?: string | null;
  phase?: FoundingPhase;
  workspace?: ReturnType<typeof emptyFoundingWorkspace>;
};
