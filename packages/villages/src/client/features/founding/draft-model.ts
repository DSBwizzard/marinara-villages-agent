import type { useFoundingSetupDraftData } from "./controller-hooks.js";
import type { emptyFoundingWorkspace } from "./villages-founding-workspace-state.js";

/** Stored founding drafts predate the optional workspace navigation field. */
export type SetupDraftData = Omit<ReturnType<typeof useFoundingSetupDraftData>, "workspace"> & {
  workspace?: ReturnType<typeof emptyFoundingWorkspace>;
};
