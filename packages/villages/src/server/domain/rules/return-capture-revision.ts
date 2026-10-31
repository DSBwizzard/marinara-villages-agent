import type { ReturnCatchupCapture, VillageState } from "../models/world.js";
import { backgroundRevision } from "./background-revision.js";

/** Comparison identity only: this token never owns or hydrates historical storage. */
export type RelationshipIdentity = (world: Pick<VillageState, "seed" | "setupAt" | "relationshipContext">) => string;
export type WishIdentity = (
  wishes: VillageState["villagers"][number]["wishes"],
  scope: Pick<VillageState, "seed" | "setupAt"> & { actorId: string },
) => string;
export function returnCaptureRevision(
  capture: ReturnCatchupCapture | undefined,
  identify: RelationshipIdentity,
  identifyWishes: WishIdentity,
): string {
  if (!capture) return "missing-departure";
  const { relationshipContext: _body, villagers, ...world } = capture.world;
  return backgroundRevision({
    ...capture,
    world: {
      ...world,
      villagers: villagers.map(({ wishes, ...resident }) => ({
        ...resident,
        wishes: identifyWishes(wishes, { seed: world.seed, setupAt: world.setupAt, actorId: resident.characterId }),
      })),
    },
    relationships: identify(capture.world),
  });
}
