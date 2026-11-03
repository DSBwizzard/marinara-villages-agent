export type OpeningView = {
  id: string;
  version: 3;
  stage: "gathering" | "complete" | "ended";
  communityVenueId: string;
  gatheringSceneId: string;
  residentIds: string[];
};
