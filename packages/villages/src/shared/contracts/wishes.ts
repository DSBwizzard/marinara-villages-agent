export type WishStatus = "open" | "fulfilled" | "withdrawn" | "ended";

export type KnownWish = {
  wishId: string;
  text: string;
  at: string;
  status?: WishStatus;
  followed: boolean;
  facts: { id: string; text: string; at: string }[];
  details?: { id: string; kind: string; text: string }[];
};
