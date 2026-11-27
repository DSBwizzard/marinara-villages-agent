import type { VillageState } from "../../domain/models/world.js";
import { conflict } from "../../domain/rules/errors.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";
import { settleVisitorTrip, visitorTripNeedsSettlement } from "../../domain/rules/visitors.js";
import type { mutateVillageState } from "./village-store.js";

export function settleTripsForAttendance(state: VillageState, at: Date, mutate: typeof mutateVillageState) {
  if (!visitorTripNeedsSettlement(state, at)) return state;
  const scope = villageWorldScope(state);
  return mutate(
    (current) => {
      if (villageWorldScope(current) !== scope || current.clock?.revision !== state.clock?.revision)
        throw conflict("The Village clock changed. Refresh the Village.", "CLOCK_CHANGED");
      settleVisitorTrip(current, at);
    },
    { memories: true },
  );
}
