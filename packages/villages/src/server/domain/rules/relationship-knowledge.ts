import { projectMemories } from "./memory-views.js";
import { knownWishes } from "./wish-journal.js";
import { knownDevelopment } from "./development-knowledge.js";
import type { RelationshipState } from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import type { RelationshipProfile } from "../../../shared/contracts/relationships.js";
export type { RelationshipProfile } from "../../../shared/contracts/relationships.js";

/** Learned values are saved disclosures, never a projection of private social authority. */
export function projectRelationshipProfiles(state: RelationshipState, village: VillageState): RelationshipProfile[] {
  const name = (id: string) =>
    id === "player"
      ? "You"
      : (village.villagers.find((p) => p.characterId === id)?.cardSnapshot.name ?? "Former resident");
  const memories = projectMemories(village.memories, ["player"]);
  return village.villagers.map((resident) => {
    const learned = memories
      .filter((row) => row.domainRef?.kind === "relationship" && row.domainRef.characterId === resident.characterId)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id))
      .map((row) => ({
        text: row.text,
        kind: String(row.knowers.player!.disclosed?.kind ?? "information"),
        toId: String(row.knowers.player!.disclosed?.toId ?? "player"),
        at: row.occurredAt,
      }));
    return {
      characterId: resident.characterId,
      name: resident.cardSnapshot.name,
      summary: learned.filter((row) => row.kind === "connection" && row.toId === "player").at(-1)?.text ?? "",
      knownAt: learned.at(-1)?.at ?? "",
      routine: learned.filter((row) => row.kind === "routine").map((row) => row.text),
      interests: learned
        .filter((row) => row.kind === "preference")
        .map((row) => row.text)
        .join("; "),
      wishes: knownWishes(village, resident.characterId).map((row) => row.text),
      knownWishes: knownWishes(village, resident.characterId),
      knownDevelopment: knownDevelopment(village, resident.characterId),
      learned: learned.map(({ toId, ...row }) => ({ ...row, aboutName: name(toId) })),
      access: Object.values(state.grants)
        .filter(
          (grant) => grant.controllerId === resident.characterId && grant.visitorId === "player" && !grant.revoked,
        )
        .map((grant) => ({
          venueId: grant.venueId,
          zoneId: grant.zoneId,
          active: grant.active,
          name:
            village.venues.find((v) => v.id === grant.venueId)?.zones?.find((z) => z.id === grant.zoneId)?.name ??
            "Zone",
        })),
    };
  });
}
