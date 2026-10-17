/** Public opening progress contains only proposals the player has heard. */
export type OpeningProposal = {
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
  version: 1;
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
