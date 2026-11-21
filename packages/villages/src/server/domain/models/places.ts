import type { VillageVenue } from "./world.js";

export type NpcIdentity = {
  id: string;
  revision: number;
  name: string;
  label: string;
  characterization: string;
  mapId?: string;
  appearance?: string;
  listed?: boolean;
  facts: string[];
  associations: { placeId: string; role: string }[];
  availability: string;
  disabled: boolean;
  source: string;
  updatedAt: string;
};

export type WorldPlace = {
  id: string;
  revision: number;
  location: VillageVenue;
  source: string;
  knownBy: string[];
  report: boolean;
  prepared: boolean;
  classified?: boolean;
  visited: boolean;
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
  /** Historical population receipts remain readable; no new population work is dispatched. */
  kind: "explore" | "prepare" | "populate";
  placeId: string;
  status: "started" | "ready" | "failed";
  input: { mapId: string; intent: string; placeRevision?: number };
  messages: import("@marinara-engine/shared").CapabilityLanguageModelMessage[];
  connectionId: string;
  lore?: import("../../../shared/contracts/lore.js").LoreUse[];
  error?: string;
};
