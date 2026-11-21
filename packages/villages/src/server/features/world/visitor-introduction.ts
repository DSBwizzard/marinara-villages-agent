import { randomUUID } from "node:crypto";
import { findVillagerCard } from "../../adapters/engine/catalog.js";
import type { VillageState } from "../../domain/models/world.js";
import { snapshotFromCard } from "../../domain/rules/resident-card-snapshot.js";
import { PROFESSOR_MARI_ID, visitorIntroductionDue } from "../../domain/rules/visitor-introduction.js";
import { villageWorldScope } from "../../domain/rules/village-identity.js";
import { conflict } from "../../domain/rules/errors.js";
import type { mutateVillageState } from "./village-store.js";
import type { SpriteManagerState } from "../../../shared/contracts/sprites.js";

export async function prepareIntroductionVisitor(
  state: VillageState,
  at: Date,
  mutate: typeof mutateVillageState,
  automaticSprites: (id: string) => Promise<SpriteManagerState | null>,
) {
  if (!visitorIntroductionDue(state, at) || state.visitors?.some((person) => person.characterId === PROFESSOR_MARI_ID))
    return state;
  const card = (await findVillagerCard(PROFESSOR_MARI_ID)) ?? {
    id: PROFESSOR_MARI_ID,
    name: "Professor Mari",
    comment: "",
    summary: "Your cheerful Village guide.",
    tags: [],
    systemPrompt: "",
    postHistoryInstructions: "",
    description:
      "Professor Mari is a warm, playful traveling guide who helped found the Village. She occasionally seems aware of the dialogue boxes.",
    personality: "Kind, curious, and faintly fourth-wall breaking.",
    scenario: "",
    backstory: "",
    appearance: "",
    exampleDialogue: "",
    nameColor: "",
    dialogueColor: "",
  };
  const spriteManager = await automaticSprites(PROFESSOR_MARI_ID);
  const scope = villageWorldScope(state);
  const incarnation = randomUUID();
  return mutate(
    (current) => {
      if (villageWorldScope(current) !== scope) throw conflict("The Village changed. Refresh before entering.");
      if (
        !visitorIntroductionDue(current, at) ||
        current.visitors?.some((person) => person.characterId === PROFESSOR_MARI_ID)
      )
        return;
      current.visitors ??= [];
      current.visitors.push({
        characterId: PROFESSOR_MARI_ID,
        incarnation,
        visitsEnabled: true,
        visitsRevision: incarnation,
        addedAt: at.toISOString(),
        letterFontId: "caveat",
        spriteManager,
        cardSnapshot: { ...snapshotFromCard(card, 1), capturedAt: at.toISOString() },
      });
    },
    { memories: true },
  );
}
