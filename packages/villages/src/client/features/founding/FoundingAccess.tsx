import type { SetupVenueDraft } from "../../shared/types.js";
import { ZoneVisitors } from "../../shared/ZoneVisitors.js";
import { zoneVisitingHours } from "../../../shared/helpers/venue-access.js";
import { foundingAccess } from "./founding-access.js";
import { draftZonePolicy } from "./villages-founding-zones.js";
import { foundingHomeMembers, foundingSleepZones } from "./founding-homes.js";

export function FoundingAccess({
  venue,
  zoneId,
  onPatch,
  disabled,
}: {
  venue: SetupVenueDraft;
  zoneId: string;
  onPatch(venue: SetupVenueDraft): void;
  disabled: boolean;
}) {
  const personal = !!venue.privateSpaces?.some((row) => row.id === zoneId);
  const zone = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((row) => row.id === zoneId);
  if (!zone) return null;
  const policy = zone.access ?? draftZonePolicy(venue, zone, personal);
  return (
    <ZoneVisitors
      key={venue.id + zoneId}
      policy={policy}
      mode={policy.mode}
      hours={zoneVisitingHours(policy.visitorHours, foundingAccess(venue).visitorHours)}
      disabled={disabled}
      onSave={(next) => {
        const key = personal ? "privateSpaces" : "spaces";
        const candidate = {
          ...venue,
          [key]: venue[key]?.map((row) => (row.id === zoneId ? { ...row, access: next } : row)),
        };
        if (
          foundingHomeMembers(venue).some((id) => {
            const sleep = venue.destinations?.[id]?.sleep;
            return (
              sleep &&
              foundingSleepZones(venue, id).some((row) => row.id === sleep) &&
              !foundingSleepZones(candidate, id).some((row) => row.id === sleep)
            );
          })
        )
          throw new Error("Keep a route to the assigned sleeping Zone.");
        onPatch(candidate);
        return true;
      }}
    />
  );
}
