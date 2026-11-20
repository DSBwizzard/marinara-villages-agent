export type OpeningView = {
  id: string;
  version: 3;
  stage: "gathering" | "complete" | "ended";
  openingVenueId: string;
  gatheringSceneId: string;
  residentIds: string[];
};
