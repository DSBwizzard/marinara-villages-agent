import type { ArchiveVisitSummary, SceneView, VillageSnapshot } from "../../../shared/contracts/village.js";

/** Inputs consumed by renderSceneArchivePage; assembled by the shell. */
export type SceneArchivePagePorts = {
  readonly archiveError: string;
  readonly archiveOffset: number;
  readonly archiveTotal: number;
  readonly archiveVenueId: string;
  readonly archiveVillagerId: string;
  readonly busy: boolean;
  readonly deleteArchivedVisits: (id?: string) => Promise<void>;
  readonly openArchivedVisit: SceneView | null;
  readonly openVisit: (id: string) => Promise<void>;
  readonly setArchiveOffset: React.Dispatch<React.SetStateAction<number>>;
  readonly setArchiveVenueId: React.Dispatch<React.SetStateAction<string>>;
  readonly setArchiveVillagerId: React.Dispatch<React.SetStateAction<string>>;
  readonly setOpenArchivedVisit: React.Dispatch<React.SetStateAction<SceneView | null>>;
  readonly snapshot: VillageSnapshot | null;
  readonly venueVisits: ArchiveVisitSummary[] | null;
};
