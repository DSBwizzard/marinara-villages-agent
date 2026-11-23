export type PlaceSummary = {
  id: string;
  revision: number;
  name: string;
  description: string;
  mapId: string;
  x: number | null;
  y: number | null;
  report: boolean;
  visited: boolean;
  venue: boolean;
};

export type PlaceKind = "all" | "venues" | "other";
export type PlaceDirectory = {
  items: PlaceSummary[];
  nextCursor: string | null;
  previousCursor: string | null;
  offset: number;
  total: number;
  counts: Record<PlaceKind, number>;
};
export type PlaceDetail = PlaceSummary & { prepared: boolean; location: import("./village.js").VillageVenue };
export type PlaceRequest = {
  worldScope: string;
  requestId: string;
  mapId: string;
  intent: string;
  expectedRevision?: number;
};
export type PlaceOperationView = {
  id: string;
  attempt: number;
  kind: "explore" | "prepare";
  status: "started" | "ready" | "failed";
  placeId: string;
};
