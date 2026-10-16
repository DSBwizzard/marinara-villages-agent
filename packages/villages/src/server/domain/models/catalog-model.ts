export type VillagerCard = {
  foundingContext?: import("../../../shared/helpers/resident-founding-context.js").ResidentFoundingContext;
  id: string;
  /** Player-facing name; falls back to the user note so a tile is never blank. */
  name: string;
  /** The user-only note, used for disambiguation between similar cards. */
  comment: string;
  /** One-line blurb for tiles. */
  summary: string;
  tags: string[];
  systemPrompt: string;
  /** Authored instructions applied after history; absent in older snapshots. */
  postHistoryInstructions?: string;
  description: string;
  personality: string;
  scenario: string;
  /**
   * The card's backstory, when it has one.
   *
   * A card keeps this in `extensions` rather than at the top level, and it is
   * read for the same reason the description is: an author who wrote a
   * character's history wrote it to be read, and a villager who never sees it
   * has that much less of themselves to speak from. The Engine sends the same
   * field to the model by default, so leaving it out was the one place the
   * package gave a card less than the Engine does.
   */
  backstory: string;
  /**
   * The card's appearance, read from `extensions` for the same reason.
   *
   * It is here because how somebody looks is part of how they carry themselves
   * and what they notice, and a card author who described it meant it to count.
   */
  appearance: string;
  /** Example dialogue, used to prime run-on replies. */
  exampleDialogue: string;
  nameColor: string;
  dialogueColor: string;
};
export type ResidentDirectory = {
  /** e.g. "Hana — apiarist". Used to tell a villager who else is around. */
  labels: Map<string, string>;
  /** Just the name, for the places someone is said to live. */
  names: Map<string, string>;
};
