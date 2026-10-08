import type { VenueRequest, VillageSnapshot } from "../../../shared/contracts/village.js";

/** Inputs consumed by renderVenueRequestsPage; assembled by the shell. */
export type VenueRequestsPagePorts = {
  readonly busy: boolean;
  readonly generateRequestDescription: (entry: VenueRequest, draft: VenueRequest["venueDraft"]) => Promise<void>;
  readonly decideHomeUpgrade: (entry: { id: string }, approved: boolean) => Promise<void>;
  readonly completeResidenceMove: (entry: { characterId: string }) => Promise<void>;
  readonly decideResidenceMove: (entry: { characterId: string }, approved: boolean) => Promise<void>;
  readonly decideVenueRequest: (entry: VenueRequest, approved: boolean) => Promise<void>;
  readonly nameOfCharacter: (characterId: string | null) => string;
  readonly requestEdits: Record<string, VenueRequest["venueDraft"]>;
  readonly setRequestEdits: React.Dispatch<React.SetStateAction<Record<string, VenueRequest["venueDraft"]>>>;
  readonly settingsError: string;
  readonly snapshot: VillageSnapshot;
};
