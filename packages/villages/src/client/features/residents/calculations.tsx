export function calculateNeedle(ports: { search: string }) {
  const { search } = ports;
  return search.trim().toLowerCase();
}
export function calculateVisibleCatalog(ports: {
  catalog: import("../../../shared/contracts/village").CatalogEntry[];
  needle: string;
}) {
  const { catalog, needle } = ports;
  return (catalog ?? []).filter(
    (entry) =>
      needle.length === 0 ||
      entry.name.toLowerCase().includes(needle) ||
      entry.comment.toLowerCase().includes(needle) ||
      entry.tags.some((tag) => tag.toLowerCase().includes(needle)),
  );
}
export function calculatePortraitWanted(ports: {
  catalog: import("../../../shared/contracts/village").CatalogEntry[];
  pickerOpen: boolean;
  screen: "venue" | "home" | "menu" | "setup" | "resume" | "preparing" | "room" | "person";
  setupStep: number;
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
  visibleCatalog: import("../../../shared/contracts/village").CatalogEntry[];
}) {
  const { catalog, pickerOpen, screen, setupStep, snapshot, visibleCatalog } = ports;
  return [
    ...(snapshot?.villagers ?? []).map((villager) => villager.characterId),
    ...(pickerOpen ? visibleCatalog.map((entry) => entry.id) : []),
    ...(screen === "setup" && setupStep === 0 ? (catalog ?? []).map((entry) => entry.id) : []),
  ].join("\n");
}
export function calculatePersonaPortraitId(ports: {
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { snapshot } = ports;
  return snapshot?.settings.playerPersonaId ?? "";
}
