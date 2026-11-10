import type { NarrationSourceContext } from "../rules/narration-sources.js";
import type { ContinuityAdmission } from "./continuity-model.js";
import type { AcceptedEpisode } from "./episode-model.js";

/** Exact final fitted evidence and native circumstances, retained by the existing operation checkpoint. */
export type NarrationReadset = {
  format: 1;
  setupAt: string;
  capturedAt: string;
  sceneRevision: number;
  continuityRevision: number;
  source: Omit<NarrationSourceContext, "lines" | "labels" | "native" | "moves">;
  admission: Omit<ContinuityAdmission, "sources" | "blockedSources">;
  offered: AcceptedEpisode["offered"];
  projects: import("../rules/project-interpretation.js").ProjectSpeechContext[];
  access: import("../rules/narration-access.js").NarrationAccessScope[];
};
