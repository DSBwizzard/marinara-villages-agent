import type { VillageVenue } from "../../../shared/contracts/village.js";
import { startingZone } from "./founding-template.js";

export type StartingVenueSuggestion = {
  id: string;
  name: string;
  form: string;
  venueType?: string;
  description: string;
  layout: "exterior" | "common" | "private" | "both";
  connections?: [string, string][];
  commonName: string;
  commonPurpose?: string;
  commonDescription: string;
  privateName: string;
  privatePurpose: string;
  privateDescription?: string;
};

/** Complete base spaces without discarding authored collections, images or in-flight edits. */
export function mergeQuickStartSpaces(
  current: VillageVenue,
  before: VillageVenue,
  proposal: StartingVenueSuggestion,
  authored: readonly string[],
): VillageVenue {
  if (
    current.layout !== before.layout ||
    (["spaces", "privateSpaces"] as const).some((key) => (current[key]?.length ?? 0) !== (before[key]?.length ?? 0))
  )
    return current;
  const residence = current.category !== "public-center";
  const spaces = (personal: boolean) => {
    const key = personal ? "privateSpaces" : "spaces";
    const rows = current[key] ?? [];
    const existing = rows[0];
    const original = before[key]?.find((zone) => zone.id === existing?.id);
    const suggested = {
      name: personal ? proposal.privateName : proposal.commonName,
      purpose: personal
        ? proposal.privatePurpose
        : (proposal.commonPurpose ?? (residence ? "Everyday home activities" : "Community gatherings")),
      description: personal
        ? current.occupancy.playerHome
          ? (proposal.privateDescription ?? "")
          : ""
        : proposal.commonDescription,
    };
    const zone = { ...startingZone(current, personal), ...existing };
    for (const field of ["name", "purpose", "description"] as const) {
      if (existing && (!original || existing[field] !== original[field])) continue;
      const prefix = `zone:${key}:`;
      const detailed = authored.some((entry) => entry.startsWith(prefix));
      if (existing && authored.includes(`${prefix}legacy`)) continue;
      if (existing && authored.includes(key) && !detailed) continue;
      if (existing && authored.includes(`${prefix}${existing.id}:${field}`)) continue;
      if (
        existing &&
        (existing.image || !["common:base", "private:base"].includes(existing.id)) &&
        existing[field]?.trim()
      )
        continue;
      zone[field] = suggested[field];
    }
    if (zone.connectedTo === undefined && proposal.connections)
      zone.connectedTo = proposal.connections
        .filter((edge) => edge.includes(zone.id))
        .map((edge) => (edge[0] === zone.id ? edge[1] : edge[0]));
    return [zone, ...rows.slice(1)];
  };
  return {
    ...current,
    layoutVersion: 1,
    layout: residence ? "both" : "common",
    spaces: spaces(false),
    privateSpaces: residence
      ? spaces(true).map((zone) => ({
          ...zone,
          ownerId:
            zone.ownerId ?? (current.occupancy.playerHome ? "player" : (current.occupancy.residentCharacterId ?? "")),
        }))
      : [],
  };
}
