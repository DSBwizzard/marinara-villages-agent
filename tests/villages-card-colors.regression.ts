import assert from "node:assert/strict";
import {
  captureMissingVillagerCardColors,
  readVillagerCard,
} from "../packages/villages/src/engine/packages/server/src/services/villages/catalog.js";
import type { VillageVillagerCardSnapshot } from "../packages/villages/src/engine/packages/server/src/services/villages/types.js";
import { coerceVillageState } from "../packages/villages/src/engine/packages/server/src/services/villages/village-store.js";

const card = readVillagerCard({
  id: "resident",
  comment: "",
  data: JSON.stringify({
    name: "Resident",
    dialogueColor: "#000000",
    extensions: JSON.stringify({
      nameColor: "linear-gradient(90deg, #aabbcc, #ddeeff)",
      dialogueColor: "#abcdef",
    }),
  }),
});
assert.equal(card.nameColor, "linear-gradient(90deg, #aabbcc, #ddeeff)");
assert.equal(card.dialogueColor, "#abcdef");

const legacy = {
  id: "resident",
  revision: 1,
  sourceStatus: "available",
  name: "Resident",
  comment: "",
  summary: "",
  tags: [],
  systemPrompt: "",
  description: "",
  personality: "",
  scenario: "",
  backstory: "",
  appearance: "",
  exampleDialogue: "",
  capturedAt: "2026-01-01T00:00:00.000Z",
} satisfies VillageVillagerCardSnapshot;
const migrated = captureMissingVillagerCardColors(legacy, card);
const recovered = coerceVillageState({
  wishSystemVersion: 2,
  villagers: [{ characterId: "resident", cardSnapshot: legacy, addedAt: legacy.capturedAt }],
});
assert.equal(recovered.villagers[0]?.cardSnapshot.nameColor, undefined);
assert.equal(recovered.villagers[0]?.cardSnapshot.dialogueColor, undefined);
assert.equal(migrated.nameColor, card.nameColor);
assert.equal(migrated.dialogueColor, card.dialogueColor);
assert.equal(migrated.revision, 1);
assert.equal(migrated.capturedAt, legacy.capturedAt);

const adopted = { ...migrated, nameColor: "#112233", dialogueColor: "#445566" };
const editedCard = { ...card, nameColor: "#778899", dialogueColor: "#aabbcc" };
assert.deepEqual(captureMissingVillagerCardColors(adopted, editedCard), adopted);
assert.equal(captureMissingVillagerCardColors(legacy, null).dialogueColor, "");

console.log("Villages card color snapshot regression passed");
