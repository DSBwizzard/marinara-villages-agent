export type PursuitStatus = "considering" | "stalled" | "arranged" | "completed" | "ended";
export type PursuitDecision = "agree" | "refuse" | "conditional";

/** Frozen player knowledge. Private progress never refreshes this record. */
export type KnownPursuitSnapshot = {
  at: string;
  text: string;
  status?: PursuitStatus;
  title?: string;
  facts?: { at: string; text: string; sceneId: string; lineIds: string[] }[];
  agreements?: { characterId: string; name: string; decision: PursuitDecision; at: string }[];
};
export type KnownPursuit = KnownPursuitSnapshot & { id: string };
