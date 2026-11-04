import type { ProgressDebugView } from "../../../shared/contracts/village.js";

/** Inputs consumed by renderProgressDebugPage; assembled by the shell. */
export type ProgressDebugPagePorts = {
  readonly error: string;
  readonly progressDebug: ProgressDebugView | null;
  readonly loadProgressDebug: () => Promise<void>;
};
