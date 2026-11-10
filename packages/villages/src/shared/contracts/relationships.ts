import type { MemoryListEntry, MemoryPerson } from "./village.js";

export type RelationshipEntry = MemoryListEntry & {
  current: boolean;
  owner?: MemoryPerson;
  parentId?: string;
  facet?: "reason" | "attention" | "approach" | "connection" | "stance" | "expectation" | "concern" | "boundary";
  closed?: "fulfilled" | "withdrawn" | "ended";
  offer?: { state: "offered" | "accepted" | "refused" | "withdrawn"; participants: MemoryPerson[] };
};
/** Ordinary notebook data contains only information available to the player. */
export type RelationshipProfile = {
  characterId: string;
  name: string;
  entries: RelationshipEntry[];
  knownWishes: import("./wishes.js").KnownWish[];
  access: { venueId: string; zoneId: string; active: boolean; name: string }[];
};
export type RelationshipView = {
  profiles: RelationshipProfile[];
  starting: { pending: boolean };
};
/** Explicit Inspect response. Never combine this with the ordinary notebook endpoint. */
export type RelationshipInspectView = {
  processing: {
    id: string;
    kind: string;
    instanceId: string;
    attempt: number;
    label: string;
    status: string;
    message: string;
    requests: number;
    tokens: number | null;
  }[];
  residents: {
    characterId: string;
    name: string;
    initialized: boolean;
    entries: (RelationshipEntry & { support: { id: string; text: string; speaker?: MemoryPerson }[] })[];
  }[];
  conflicts: { question: string; residents: string[]; sourceIds: string[]; actorIds: string[]; sourceHash: string }[];
};
