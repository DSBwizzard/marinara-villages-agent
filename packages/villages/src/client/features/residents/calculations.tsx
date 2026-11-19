export function calculatePortraitWanted(ports: {
  catalog: import("../../../shared/contracts/village").CatalogEntry[];
  includeCatalog: boolean;
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { catalog, includeCatalog, snapshot } = ports;
  return [
    ...(snapshot?.villagers ?? []).map((villager) => villager.characterId),
    ...(includeCatalog ? (catalog ?? []).map((entry) => entry.id) : []),
  ].join("\n");
}
export function calculatePersonaPortraitId(ports: {
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { snapshot } = ports;
  return snapshot?.settings.playerPersonaId ?? "";
}
