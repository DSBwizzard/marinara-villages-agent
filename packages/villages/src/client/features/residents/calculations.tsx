export function calculatePortraitWanted(ports: {
  catalog: import("../../../shared/contracts/village").CatalogEntry[];
  includeCatalog: boolean;
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { catalog, includeCatalog, snapshot } = ports;
  return [
    ...(snapshot?.villagers ?? []).map((villager) => villager.characterId),
    ...(snapshot?.visitors ?? []).map((visitor) => visitor.characterId),
    ...(includeCatalog ? (catalog ?? []).map((entry) => entry.id) : []),
  ].join("\n");
}
export function calculatePersonaPortraitId(ports: {
  snapshot: import("../../../shared/contracts/village").VillageSnapshot;
}) {
  const { snapshot } = ports;
  return snapshot?.settings.playerPersonaId ?? "";
}

export function visitorVisitLabel(
  visitor: Pick<import("../../../shared/contracts/village.js").VillageVisitorView, "visit" | "met" | "visitsEnabled">,
  timeZone?: string,
) {
  if (visitor.visit?.introductory) return "Visiting";
  if (visitor.visit)
    return (
      "Visiting until " +
      new Intl.DateTimeFormat(undefined, { weekday: "long", timeZone }).format(new Date(visitor.visit.leavesAt))
    );
  if (!visitor.visitsEnabled) return "Visits off";
  return visitor.met ? "Away from the Village" : "Awaiting first meeting";
}

export function visitorFirstMetLabel(firstMetAt: string | undefined, now: string | undefined, timeZone?: string) {
  if (!firstMetAt) return "";
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeZone });
  const firstMet = date.format(new Date(firstMetAt));
  return now && firstMet === date.format(new Date(now)) ? "First met today" : "First met " + firstMet;
}
