export type VillagesWalkBeat = {
  kind: "untagged" | "side" | "whisper";
  /** The line itself, with the tag taken off. Never empty. */
  text: string;
  /** Who a whisper was aimed at, when the villager named somebody. */
  target?: string;
  expression?: string;
};
