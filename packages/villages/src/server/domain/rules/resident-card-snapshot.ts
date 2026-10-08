import type { VillagerCard } from "../models/catalog-model.js";
import type { VillageVillagerCardSnapshot } from "../models/world.js";

export function snapshotFromCard(card: VillagerCard, revision: number): VillageVillagerCardSnapshot {
  return {
    id: card.id,
    revision,
    sourceStatus: "available",
    name: card.name,
    comment: card.comment,
    summary: card.summary,
    tags: [...card.tags],
    systemPrompt: card.systemPrompt,
    description: card.description,
    personality: card.personality,
    scenario: card.scenario,
    backstory: card.backstory,
    appearance: card.appearance,
    exampleDialogue: card.exampleDialogue,
    postHistoryInstructions: card.postHistoryInstructions ?? "",
    nameColor: card.nameColor,
    dialogueColor: card.dialogueColor,
    capturedAt: new Date().toISOString(),
  };
}
export function snapshotContent(snapshot: VillageVillagerCardSnapshot): string {
  return JSON.stringify({
    id: snapshot.id,
    name: snapshot.name,
    comment: snapshot.comment,
    summary: snapshot.summary,
    tags: snapshot.tags,
    systemPrompt: snapshot.systemPrompt,
    description: snapshot.description,
    personality: snapshot.personality,
    scenario: snapshot.scenario,
    backstory: snapshot.backstory,
    appearance: snapshot.appearance,
    exampleDialogue: snapshot.exampleDialogue,
    postHistoryInstructions: snapshot.postHistoryInstructions ?? "",
    nameColor: snapshot.nameColor ?? "",
    dialogueColor: snapshot.dialogueColor ?? "",
  });
}
