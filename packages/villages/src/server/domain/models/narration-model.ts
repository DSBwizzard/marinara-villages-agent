import type { NarrationSourceContext } from "../rules/narration-sources.js";
import type { ContinuityAdmission } from "./continuity-model.js";
import type { AcceptedEpisode } from "./episode-model.js";

/** Exact final fitted evidence and native circumstances, retained by the existing operation checkpoint. */
export type NarrationReadset = {
  format: 1;
  setupAt: string;
  capturedAt: string;
  calendar: ReturnType<typeof import("../rules/scene-calendar.js").capturedSceneCalendar>;
  sceneRevision: number;
  continuityRevision: number;
  source: Omit<NarrationSourceContext, "lines" | "labels" | "native" | "moves">;
  admission: Omit<ContinuityAdmission, "sources" | "blockedSources">;
  offered: AcceptedEpisode["offered"];
  npcCandidates: { npc: import("./places.js").NpcIdentity; incarnation: string; offered: string[] }[];
  circumstance: import("./narrative-model.js").NarrativeAdmission | null;
  repairs: { id: string; revision: number; entries: string[] }[];
  projects: import("../rules/project-interpretation.js").ProjectSpeechContext[];
  access: import("../rules/narration-access.js").NarrationAccessScope[];
  residence: ReturnType<typeof import("../rules/narration-residence.js").narrationResidenceContext>;
  places: ReturnType<typeof import("../rules/narration-place.js").narrationPlaceContext>;
};
