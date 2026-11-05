import type { RelationshipBond, RelationshipProfile } from "../../../shared/contracts/relationships.js";
import type { RelationshipState } from "../models/relationship-types.js";
import type { VillageState } from "../models/world.js";
import { projectMemories } from "./memory-views.js";
import { knownSocialWishes as knownWishes } from "./social-wishes.js";
import { relationshipBondSchema } from "./relationship-review.js";
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
      .map((row) => {
        const knowledge = row.knowers.player!;
        const bond =
          knowledge.basis === "report" && knowledge.attributedTo === resident.characterId
            ? relationshipBondSchema.safeParse({
                ...(knowledge.disclosed?.connectionLabel ? { connection: knowledge.disclosed.connectionLabel } : {}),
                ...(knowledge.disclosed?.conditionLabel ? { condition: knowledge.disclosed.conditionLabel } : {}),
                ...(knowledge.disclosed?.bondTone ? { tone: knowledge.disclosed.bondTone } : {}),
              })
            : undefined;
        return {
          text: row.text,
          kind: String(row.knowers.player!.disclosed?.kind ?? "information"),
          toId: String(row.knowers.player!.disclosed?.toId ?? "player"),
          at: row.occurredAt,
          invalidatesBond: !!knowledge.repair,
          ...(bond?.success ? { bond: bond.data } : {}),
        };
      });
    const statements = learned.filter(
      (row) => (row.kind === "connection" && row.toId === "player") || row.invalidatesBond,
    );
    const expressed = statements.at(-1);
    let bond: RelationshipBond | undefined;
    for (const statement of statements) {
      if (!statement.bond || statement.invalidatesBond) bond = undefined;
      else
        bond = {
          ...(statement.bond.connection
            ? { connection: statement.bond.connection }
            : bond?.connection
              ? { connection: bond.connection }
              : {}),
          ...(statement.bond.condition
            ? { condition: statement.bond.condition, ...(statement.bond.tone ? { tone: statement.bond.tone } : {}) }
            : {}),
        };
    }
    return {
      characterId: resident.characterId,
      name: resident.cardSnapshot.name,
      summary: expressed?.invalidatesBond ? "" : (expressed?.text ?? ""),
      ...(bond ? { bond } : {}),
      knownAt: learned.at(-1)?.at ?? "",
      routine: learned.filter((row) => row.kind === "routine").map((row) => row.text),
      knownPlaces: memories
        .filter((row) => {
          const knowledge = row.knowers.player;
          const fields = knowledge?.disclosed;
          return (
            knowledge?.basis === "report" &&
            knowledge.attributedTo === resident.characterId &&
            row.domainRef?.kind === "relationship" &&
            row.domainRef.characterId === resident.characterId &&
            fields?.toId === resident.characterId &&
            (fields.kind === "home" || fields.kind === "work")
          );
        })
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id))
        .map((row) => ({
          kind: row.knowers.player!.disclosed!.kind as "home" | "work",
          text: row.text,
          at: row.occurredAt,
        })),
      interests: learned
        .filter((row) => row.kind === "preference")
        .map((row) => row.text)
        .join("; "),
      wishes: knownWishes(village, resident.characterId).map((row) => row.text),
      knownWishes: knownWishes(village, resident.characterId),
      learned: learned.map(({ toId, bond: _bond, invalidatesBond: _invalidatesBond, ...row }) => ({
        ...row,
        aboutName: name(toId),
      })),
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
