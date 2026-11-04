import type { NpcIdentity } from "../../../shared/contracts/places.js";
import type { VillageVenue } from "./world.js";

export type WorldPlace = {
  id: string;
  revision: number;
  location: VillageVenue;
  source: string;
  knownBy: string[];
  report: boolean;
  prepared: boolean;
  disabled: boolean;
};

export type PlaceRegistry = {
  revision: number;
  places: Record<string, WorldPlace>;
  npcs: Record<string, NpcIdentity>;
  receipts: Record<string, string>;
  operations: Record<string, PlaceOperation>;
};

export type PlaceOperation = {
  id: string;
  attempt: number;
  fingerprint: string;
  kind: "explore" | "prepare";
  placeId: string;
  status: "started" | "ready" | "failed";
  input: { mapId: string; intent: string; placeRevision?: number };
  messages: import("@marinara-engine/shared").CapabilityLanguageModelMessage[];
  connectionId: string;
  error?: string;
};
