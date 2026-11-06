import { snapshotFromCard } from "../packages/villages/src/server/domain/rules/resident-card-snapshot.js";
import assert from "node:assert/strict";
import { readVillagerCard } from "../packages/villages/src/server/adapters/engine/catalog.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";

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

const adopted = snapshotFromCard(card, 1);
const fresh = {
  ...defaultVillageState(),
  villagers: [{ characterId: "resident", letterFontId: "caveat", cardSnapshot: adopted, addedAt: adopted.capturedAt }],
};
const recovered = coerceVillageState(fresh);
assert.equal(recovered.villagers[0].cardSnapshot.nameColor, card.nameColor);
assert.equal(recovered.villagers[0].cardSnapshot.dialogueColor, card.dialogueColor);
assert.equal(recovered.villagers[0].cardSnapshot.capturedAt, adopted.capturedAt);
const editedCard = { ...card, nameColor: "#778899", dialogueColor: "#aabbcc" };
assert.equal(recovered.villagers[0].cardSnapshot.nameColor, card.nameColor, "Library edits never adopt themselves");
const refreshed = snapshotFromCard(editedCard, 2);
assert.equal(refreshed.nameColor, editedCard.nameColor);
assert.equal(refreshed.dialogueColor, editedCard.dialogueColor);
const uncolored = snapshotFromCard(readVillagerCard({ id: "uncolored", data: { name: "Uncolored" } } as any), 1);
assert.equal(uncolored.nameColor, "");
assert.equal(uncolored.dialogueColor, "");
for (const id of ["", "caveat", "future-font-id"])
  assert.equal(
    coerceVillageState({ ...fresh, villagers: [{ ...fresh.villagers[0], letterFontId: id }] }).villagers[0]
      .letterFontId,
    id,
  );
for (const invalid of [undefined, null, false, "x".repeat(121)])
  assert.throws(
    () => coerceVillageState({ ...fresh, villagers: [{ ...fresh.villagers[0], letterFontId: invalid }] }),
    /writing-style assignment/,
  );
console.log("Current resident colors and saved writing styles preserve their adopted values.");
