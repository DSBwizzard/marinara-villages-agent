/** Ordinary notebook data contains only information available to the player. */
export type RelationshipProfile = {
  characterId: string;
  name: string;
  summary: string;
  knownAt: string;
  routine: string[];
  interests: string;
  wishes: string[];
  knownDevelopment?: import("./pursuits.js").KnownPursuit[];
  knownWishes: {
    wishId: string;
    text: string;
    learnedAt: string;
    status?: "active" | "fulfilled" | "expired" | "retired";
    facts?: {
      id: string;
      kind: string;
      quote: string;
      at: string;
      sceneId: string;
      lineIds: string[];
      supersededBy?: string;
    }[];
  }[];
  learned: { text: string; kind: string; at: string; aboutName: string }[];
  access: { venueId: string; zoneId: string; active: boolean; name: string }[];
};
export type RelationshipView = {
  profiles: RelationshipProfile[];
  starting: { pending: boolean };
};
/** Explicit Inspect response. Never combine this with the ordinary notebook endpoint. */
export type RelationshipInspectView = {
  processing: { label: string; status: string; message: string; requests: number; tokens: number | null }[];
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
