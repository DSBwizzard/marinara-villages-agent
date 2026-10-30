import type { ReturnCatchupCapture, VillageState } from "../models/world.js";
import { backgroundRevision } from "./background-revision.js";

/** Comparison identity only: this token never owns or hydrates historical storage. */
export type RelationshipIdentity = (world: Pick<VillageState, "seed" | "setupAt" | "relationshipContext">) => string;
export function returnCaptureRevision(
  capture: ReturnCatchupCapture | undefined,
  identify: RelationshipIdentity,
): string {
  if (!capture) return "missing-departure";
  const { relationshipContext: _body, ...world } = capture.world;
  return backgroundRevision({ ...capture, world, relationships: identify(capture.world) });
}
