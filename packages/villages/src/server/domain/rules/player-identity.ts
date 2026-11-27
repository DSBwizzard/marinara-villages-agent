import type { VillageState, VillagePlayerIdentity } from "../models/world.js";
export function readPlayerIdentity(
  village: Pick<
    VillageState,
    "playerPersonaId" | "playerPersonaName" | "playerPersonaIdentity" | "playerIdentityRepair"
  > & { playerPersonaMissing?: boolean },
): VillagePlayerIdentity {
  if (village.playerIdentityRepair?.personaId === village.playerPersonaId)
    return {
      name: village.playerIdentityRepair.name,
      description: village.playerIdentityRepair.identity,
      personaId: village.playerPersonaId,
      missing: village.playerPersonaMissing,
    };
  if (village.playerPersonaId.length === 0) {
    return { name: "", description: "", personaId: "", missing: false };
  }
  return {
    name: village.playerPersonaName,
    description: village.playerPersonaIdentity,
    personaId: village.playerPersonaId,
    missing: village.playerPersonaMissing ?? false,
  };
}
