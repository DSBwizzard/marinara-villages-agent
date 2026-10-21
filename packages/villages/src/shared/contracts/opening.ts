/** Public opening progress contains only proposals the player has heard. */
export type OpeningProposal = {
  kind?: "new-venue" | "renovation";
  available?: boolean;
  renovation?: {
    venueId: string;
    spaceId: string;
    slot: 0 | 1;
    title: string;
    description: string;
    sourceFingerprint?: string;
  };
  residentId: string;
  name: string;
  description: string;
  situation?: string;
  venueClass: "workplace" | "community" | "other";
  established: boolean;
  provenance: string;
  work: string;
  firstUse: string;
};

export type OpeningView = {
  id: string;
  version: 1 | 2;
  ordinaryProjectsUnlocked?: boolean;
  stage: "gathering" | "conversations" | "project" | "first-use" | "complete" | "ended";
  communityVenueId: string;
  gatheringSceneId: string;
  residentIds: string[];
  heardIds: string[];
  proposals: OpeningProposal[];
  declinedIds: string[];
  projectId: string;
  action: string;
  outcome: string;
};
