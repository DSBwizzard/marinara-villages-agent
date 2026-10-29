/** Ordinary notebook data contains only information available to the player. */
export type RelationshipProfile = {
  characterId: string;
  name: string;
  summary: string;
  knownAt: string;
  routine: string[];
  knownPlaces?: { kind: "home" | "work"; text: string; at: string }[];
  interests: string;
  wishes: string[];
  knownWishes: import("./wishes.js").KnownWish[];
  learned: { text: string; kind: string; at: string; aboutName: string }[];
  access: { venueId: string; zoneId: string; active: boolean; name: string }[];
};
export type RelationshipView = {
  profiles: RelationshipProfile[];
  starting: { pending: boolean };
};
/** Explicit Inspect response. Never combine this with the ordinary notebook endpoint. */
export type RelationshipInspectView = {
  recovery?: { id: string; message: string; reinterpretRequired: boolean; canSkip?: boolean }[];
  processing: {
    id: string;
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
    intentions: { text: string; reason: string; targets: string[]; status: string }[];
    perspectives: {
      aboutName: string;
      connection: string;
      stance: string;
      expectations: string[];
      concerns: string[];
      updatedAt: string;
      revision: number;
      records: {
        kind: string;
        text: string;
        status: string;
        currentStatus?: string;
        participants: string[];
        dueAt?: string;
      }[];
      experiences: { reason: string; at: string; sourceId: string; evidence: { speaker: string; text: string }[] }[];
      technical: { fromId: string; toId: string; receiptIds: string[] };
    }[];
  }[];
  conflicts: { question: string; residents: string[]; sourceIds: string[]; actorIds: string[]; sourceHash: string }[];
};
