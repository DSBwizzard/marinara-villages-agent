export type WishStatus = "open" | "fulfilled" | "withdrawn";
export type WishAttention = { state: "background" | "foreground"; reason: string };
export type SocialWish = {
  id: string;
  revision: number;
  wish: string;
  reason: string;
  status: WishStatus;
  addedAt: string;
  changedAt: string;
  origin: { kind: "preparation" | "scene" | "encounter" | "mail" | "reflection"; sourceId: string; lineIds: string[] };
  attention: WishAttention;
  approach: string;
  conditions: { id: string; quote: string; at: string; sourceId: string; lineIds: string[] }[];
  history: { id: string; at: string; kind: string; text: string; sourceId: string; lineIds: string[] }[];
};

/** Frozen information communicated to the player, never a projection of live private state. */
export type WishDisclosure = {
  id: string;
  actorId: string;
  wishId: string;
  title: string;
  text: string;
  status: WishStatus;
  at: string;
  sourceId: string;
  lineIds: string[];
};

export type KnownWish = {
  wishId: string;
  text: string;
  at: string;
  status?: WishStatus;
  followed: boolean;
  facts: { id: string; text: string; at: string }[];
};
