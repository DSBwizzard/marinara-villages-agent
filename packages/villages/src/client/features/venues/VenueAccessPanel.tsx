import type { VillageVenue } from "../../../shared/contracts/village.js";
import { zoneVisitingHours } from "../../../shared/helpers/venue-access.js";
import { ZoneVisitors } from "../../shared/ZoneVisitors.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { VenueScreenController } from "./screen-contracts.js";

export function VenueAccessPanel({
  place,
  zone,
  controller,
  onBusyChange,
}: {
  place: VillageVenue;
  zone: NonNullable<VillageVenue["zones"]>[number];
  controller: VenueScreenController;
  onBusyChange(busy: boolean): void;
}) {
  const view = zone.accessView;
  if (zone.kind === "exterior" || !view) return null;
  const policy = view.policy;
  return (
    <ZoneVisitors
      key={place.id + zone.id + controller.snapshot.worldScope + place.accessView?.revision}
      policy={policy}
      mode={view.decision.mode === "public" ? "public" : "permission-required"}
      hours={policy ? zoneVisitingHours(policy.visitorHours, place.accessView?.visitorHours) : view.visitorHours}
      disabled={controller.busy || controller.venueEditBusy}
      onBusyChange={onBusyChange}
      onSave={(next) =>
        controller.changeVenueAccess(place.id, {
          action: "zone-policy",
          zoneId: zone.id,
          policy: next,
          expectedRevision: place.accessView!.revision,
          operationId: createVillagesClientId(),
        })
      }
    />
  );
}
