import { SceneryStylePicker } from "../../shared/SceneryStylePicker.js";
import type { VillageVenue } from "../../../shared/contracts/village.js";

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
