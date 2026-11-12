import type { ReturnCatchupCapture } from "../models/world.js";
import { backgroundRevision } from "./background-revision.js";
/** Comparison identity; common history is owned by the Village continuity head. */
export function returnCaptureRevision(capture: ReturnCatchupCapture | undefined): string {
  return capture ? backgroundRevision(capture) : "missing-departure";
}
