import { badRequest } from "../../domain/rules/errors.js";
import { privateTarget } from "../../domain/rules/venue-zones.js";
import { readVillageState as readPrivateTargetState } from "../world/village-store.js";

export async function imageTarget(
  body: { venueId?: unknown; zoneId?: unknown; privateSpaceId?: unknown; privateOwnerId?: unknown } | undefined,
): Promise<string | undefined> {
  for (const key of ["zoneId", "privateSpaceId", "privateOwnerId"] as const)
    if (body?.[key] !== undefined && body[key] !== null && typeof body[key] !== "string")
      throw badRequest("Room targets must be text IDs.");
  if (!body?.privateSpaceId && !body?.zoneId && !body?.privateOwnerId) return undefined;
  const state = await readPrivateTargetState(),
    venue = state.venues.find((entry) => entry.id === body.venueId);
  if (!venue) throw badRequest("That Venue no longer exists.");
  return privateTarget(
    venue,
    typeof body.zoneId === "string" ? body.zoneId : undefined,
    typeof body.privateSpaceId === "string" ? body.privateSpaceId : undefined,
    typeof body.privateOwnerId === "string" ? body.privateOwnerId : "",
  );
}
