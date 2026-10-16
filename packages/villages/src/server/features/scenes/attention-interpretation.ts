import type { VenueScene } from "../../domain/models/scene-model.js";
import type { VillageVenue } from "../../domain/models/world.js";
import {
  attentionCheck,
  bindAttentionPlan,
  directAttention,
  readAttentionPlan,
} from "../../domain/rules/scene-attention.js";
import { interpretChecks } from "../generation/interpretation.js";
import { venueOperationId, venueOperationInput } from "../../jobs/venue-coordinator.js";

/** A persisted compact preflight, never an initial full Scene generation. */
export async function interpretAttention(scene: VenueScene, venue: VillageVenue, message: string) {
  const sourceReferences = venueOperationInput()?.interactionScopeVersion === 4;
  const direct = directAttention(message, venue, scene, sourceReferences);
  if (direct) return bindAttentionPlan(direct, message, venue, scene, sourceReferences);
  const batch = await interpretChecks(
    [attentionCheck(message, venue, scene, venueOperationInput()?.interactionScopeVersion === 2, sourceReferences)],
    `attention-routing:${venueOperationId()}`,
    scene.id,
  );
  const result = batch.results[0];
  return bindAttentionPlan(
    readAttentionPlan(result, message, venue, scene, sourceReferences),
    message,
    venue,
    scene,
    sourceReferences,
  );
}
