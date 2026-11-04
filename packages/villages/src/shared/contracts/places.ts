export type PlaceSummary = {
  id: string;
  revision: number;
  name: string;
  description: string;
  mapId: string;
  x: number | null;
  y: number | null;
  report: boolean;
  prepared: boolean;
};

export type PlaceDirectory = { items: PlaceSummary[]; nextCursor: string | null };
export type PlaceDetail = PlaceSummary & { location: import("./village.js").VillageVenue };
export type PlaceRequest = {
  worldScope: string;
  requestId: string;
  mapId: string;
  intent: string;
  expectedRevision?: number;
  retryOfAttempt?: number;
};
export type PlaceOperationView = {
  id: string;
  attempt: number;
  kind: "explore" | "prepare";
  status: "started" | "ready" | "failed";
  placeId: string;
  error?: string;
};

export type Establishment = {
  goal: string;
  physical: boolean;
  zoneIds: string[];
  objectives: { id: string; text: string; met: boolean; evidence: { source: string; quote: string }[] }[];
};
