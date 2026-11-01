import { resolveZoneLayout } from "../../../shared/helpers/zone-layout.js";
import { SceneryStylePicker } from "../../shared/SceneryStylePicker.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { draftZonePolicy, FoundingConnections } from "./villages-founding-zones";

export function SceneryStyleFields({
  value,
  profileId,
  onChange,
  onProfileChange,
}: {
  value: string;
  profileId: string | null;
  onChange(value: string): void;
  onProfileChange(value: string | null): void;
}) {
  return (
    <fieldset className="villages-scenery-fields">
      <legend>Scenery art style</legend>
      <label>
        Style preset
        <SceneryStylePicker
          profileId={profileId}
          onChange={(id) => {
            onProfileChange(id);
            if (id !== null) onChange("");
          }}
        />
      </label>
      {profileId === null ? (
        <label>
          Style description
          <textarea
            autoComplete="off"
            aria-label="Scenery style description"
            rows={3}
            maxLength={600}
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
      ) : null}
    </fieldset>
  );
}
export type VenueLayout = "exterior" | "common" | "private" | "both";
export function venueHasCommon(venue: VillageVenue): boolean {
  return venue.layout === "common" || venue.layout === "both" || (!venue.layout && !!venue.spaces?.length);
}
export function venueHasPrivate(venue: VillageVenue): boolean {
  return venue.layout === "private" || venue.layout === "both" || (!venue.layout && !!venue.privateSpaces?.length);
}
export type AreaDraftCache = {
  current: {
    common?: NonNullable<VillageVenue["spaces"]>[number];
    personal?: NonNullable<VillageVenue["privateSpaces"]>[number];
  };
};
export function VenueLayoutFields({
  venue,
  onChange,
}: {
  venue: VillageVenue;
  onChange(venue: VillageVenue): void;
  compact?: boolean;
  drafts?: AreaDraftCache;
  onReveal?(area: "common" | "private", layout: VenueLayout): void;
}) {
  const add = (personal: boolean) => {
    if ((venue.spaces?.length ?? 0) + (venue.privateSpaces?.length ?? 0) >= 6) return;
    const role = venue.classes?.[0] ?? "other";
    const area = {
      ...personalSpaceDraft(),
      id: "zone:" + createVillagesClientId(),
      connectedTo: ["exterior"],
      name: "New Zone",
      purpose: "",
      venueClass: role,
      ownerId:
        personal && role === "residence"
          ? venue.occupancy.playerHome
            ? "player"
            : venue.occupancy.residentCharacterId || ""
          : "",
    };
    const zone = { ...area, access: draftZonePolicy(venue, area, personal) };
    const spaces = personal ? (venue.spaces ?? []) : [...(venue.spaces ?? []), zone];
    const privateSpaces = personal ? [...(venue.privateSpaces ?? []), zone] : (venue.privateSpaces ?? []);
    onChange({
      ...venue,
      layoutVersion: 1,
      spaces,
      privateSpaces,
      layout: spaces.length
        ? privateSpaces.length
          ? "both"
          : "common"
        : privateSpaces.length
          ? "private"
          : "exterior",
    });
  };
  return (
    <fieldset className="villages-scenery-fields villages-layout-fields">
      <legend>Zones</legend>
      <FoundingConnections venue={venue} onPatch={onChange} />
      <p>Exterior · Unrestricted, 24/7. Every Venue includes this arrival and departure point.</p>
      <button
        type="button"
        onClick={() =>
          onChange({
            ...venue,
            layoutVersion: 1,
            layout: "exterior",
            spaces: [],
            privateSpaces: [],
            zoneLayout: venue.zoneLayout ? resolveZoneLayout(["exterior"], venue.zoneLayout) : undefined,
          })
        }
      >
        Use Exterior only
      </button>
      <p>
        {(venue.spaces?.length ?? 0) + (venue.privateSpaces?.length ?? 0)} additional Zones. Each has its own use,
        appearance, and access.
      </p>
      <button type="button" onClick={() => add(false)}>
        Add Zone
      </button>
      <button type="button" onClick={() => add(true)}>
        Add personal Zone
      </button>
      <p>
        “Personal” preselects the assigned resident as manager. You can choose Public or Permission required for any
        added Zone.
      </p>
    </fieldset>
  );
}

type PrivateDraft = NonNullable<VillageVenue["privateSpaces"]>[number];
export function personalSpaceDraft(): PrivateDraft {
  return {
    id: "private:player",
    ownerId: "player",
    name: "Your personal space",
    purpose: "Personal space",
    venueClass: "residence",
    description: "",
    image: null,
    state: { revision: 0, updatedAt: "", recent: null },
  };
}
