import type { VillageMoment } from "../rules/village-clock.js";
import type { VillagerCard } from "./catalog-model.js";
import type { VillageChatMessage, VillageChronicleEntry, VillageWish } from "./world.js";

export type VillageWishClaimContext = {
  /** The village's name. */
  village: string;
  setting: string;
  moment: VillageMoment;
  card: VillagerCard;
  playerName: string;
  playerDescription: string;
  /** Current goals included in a bounded, cited Wish check. */
  wishes: readonly VillageWish[];
  /** What the player says they have done, in the player's own words. */
  claim: string;
  /** The live conversation, so a promise made inside it is visible AS a promise. */
  transcript: readonly VillageChatMessage[];
  /** Verified venue action receipts, separate from visual-only Events prose. */
  happenings: readonly { text: string }[];
  /** Current validated venue state, which outranks older descriptions. */
  worldState?: readonly string[];
  /** What this villager already remembers, so a settled thing is already known. */
  memory: readonly VillageChronicleEntry[];
};
