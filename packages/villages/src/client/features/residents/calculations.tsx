export function calculatePortraitWanted(ports: {
  catalog: import("../../../shared/contracts/village").CatalogEntry[];
  screen: "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "room" | "person";
  setupStep: number;
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { catalog, screen, setupStep, snapshot } = ports;
  return [
    ...(snapshot?.villagers ?? []).map((villager) => villager.characterId),
    ...(screen === "setup" && setupStep === 1 ? (catalog ?? []).map((entry) => entry.id) : []),
  ].join("\n");
}
export function calculatePersonaPortraitId(ports: {
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { snapshot } = ports;
  return snapshot?.settings.playerPersonaId ?? "";
}
