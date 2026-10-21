import type { FoundingPhase } from "./founding-steps.js";
import type { useFoundingSetupDraftData } from "./controller-hooks.js";
import type { emptyFoundingWorkspace } from "./villages-founding-workspace-state.js";

/** Stored founding drafts predate the optional workspace navigation field. */
export type SetupDraftData = Omit<
  ReturnType<typeof useFoundingSetupDraftData>,
  "workspace" | "phase" | "mapSource" | "styleProfileId" | "spriteRevisions" | "descriptionVersion"
> & {
  descriptionVersion?: 1;
  reason?: string;
  circumstances?: string;
  imprint?: import("../../../shared/contracts/village.js").ScenarioImprint;
  /** Legacy Simple map drafts are restored into an artwork choice. */
  mapSource: ReturnType<typeof useFoundingSetupDraftData>["mapSource"] | "none";
  spriteRevisions?: Record<string, number>;
  styleProfileId?: string | null;
  phase?: FoundingPhase;
  workspace?: ReturnType<typeof emptyFoundingWorkspace>;
};

/** Preserve both authored fields exactly when resuming a pre-unified draft. */
export function foundingDraftDescription(data: {
  setting: string;
  circumstances?: string;
  descriptionVersion?: 1;
}): string {
  return data.descriptionVersion === 1
    ? data.setting
    : [data.setting, data.circumstances ?? ""].filter(Boolean).join("\n\n");
}
