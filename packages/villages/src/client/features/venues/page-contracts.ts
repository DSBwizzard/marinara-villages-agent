import type { VenueRequest, VillageSnapshot } from "../../../shared/contracts/village.js";

/** Inputs consumed by renderVenueRequestsPage; assembled by the shell. */
export type VenueRequestsPagePorts = {
  readonly busy: boolean;
  readonly decideVenueRequest: (entry: VenueRequest, approved: boolean) => Promise<void>;
  readonly nameOfCharacter: (characterId: string | null) => string;
  readonly requestEdits: Record<string, VenueRequest["venueDraft"]>;
  readonly setBusy: React.Dispatch<React.SetStateAction<boolean>>;
  readonly setRequestEdits: React.Dispatch<React.SetStateAction<Record<string, VenueRequest["venueDraft"]>>>;
  readonly setSettingsError: React.Dispatch<React.SetStateAction<string>>;
  readonly setSnapshot: React.Dispatch<React.SetStateAction<VillageSnapshot | null>>;
  readonly settingsError: string;
  readonly snapshot: VillageSnapshot;
};
