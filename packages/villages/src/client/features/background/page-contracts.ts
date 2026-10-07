import type { ProgressDebugView, VillageSnapshot } from "../../../shared/contracts/village.js";

/** Inputs consumed by renderEventsPage; assembled by the shell. */
export type EventsPagePorts = {
  readonly mobile: boolean;
  readonly snapshot: VillageSnapshot;
};

/** Inputs consumed by renderProgressDebugPage; assembled by the shell. */
export type ProgressDebugPagePorts = {
  readonly error: string;
  readonly progressDebug: ProgressDebugView | null;
  readonly setProgressDebug: React.Dispatch<React.SetStateAction<ProgressDebugView | null>>;
};
