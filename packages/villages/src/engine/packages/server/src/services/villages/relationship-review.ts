import { createHash } from "node:crypto";
import { asRecord } from "./coerce.js";
import { RELATIONSHIP_POLICY } from "./relationship-policy.js";
import { canInviteToZone, resolveVenueZone } from "./venue-zones.js";
import type { VillageState } from "./types.js";
import type { RelationshipReview, RelationshipEvidenceLine, RelationshipChange } from "./relationship-types.js";

export const emptyRelationshipReview = (): RelationshipReview => ({ changes: [], permissions: [], disclosures: [] });
export const RELATIONSHIP_REVIEW_INSTRUCTION = `Also return relationshipReview:{changes:[],permissions:[],disclosures:[]}. These decisions are INDEPENDENT of memory promotion. Never create a memory for a relationshipOnly input. Review substantive shared company, warmth, reliability, boundaries, conflict, and candid disclosures. Changes use {fromId,toId,dimension:"warmth|trust",strength:"minor|meaningful|major|none",direction:"increase|decrease",ordinary:boolean,reason:"brief grounded reason",lineIds:["exact evidence ID"],disclosed:boolean}. Ordinary positive company may increase warmth, not trust. Trust needs demonstrated reliability or a meaningful confidence/boundary interaction; promises and player claims alone are not fulfilled deeds. Greetings, filler, mere co-location, and repeated wording give no reward. Do not force a change. Never score the player's feelings. A fromId must have witnessed all evidence. Disclosed means the villager explicitly explained this reason aloud to the player, not that the reviewer inferred it. Permissions use {controllerId,visitorId,venueId,zoneId,action:"grant|revoke",lineIds:[]}; require the controller's unconditional, explicit spoken standing invitation (not one visit) or revocation identifying the visitor and exact listed zone. Guest access grants no authority. Disclosures use {fromId,toId,text,kind:"explanation|preference|boundary",lineIds:[]}; quote or closely paraphrase explicit speech heard by the player. Use "player" as the toId for personal preferences/boundaries. Neither memories nor player knowledge must expose a private reason that was not shared. Use only listed IDs and evidence in this batch.`;

function receiptId(sourceId: string, parts: unknown[]): string {
  return `${sourceId}:relationship:${createHash("sha256").update(JSON.stringify(parts)).digest("hex").slice(0, 24)}`;
}
export function substantiveContact(lines: readonly RelationshipEvidenceLine[], fromId: string, toId: string): boolean {
  const speaker = (line: RelationshipEvidenceLine) => (line.role === "user" ? "player" : line.speakerId);
  const meaningful = (line: RelationshipEvidenceLine) => {
    const text = line.content.trim().replace(/^(?:hello|hi|hey|good\s+(?:morning|afternoon|evening))\b[,!.\s]*/iu, "");
    return (
      text.split(/\s+/u).length >= 4 &&
      !/^(?:(?:it['’]s |it is )?(?:good|nice|lovely) to (?:see|meet) you(?: again| today)?|how (?:are you(?: doing| feeling)?|is your day)(?: today)?|(?:I['’]m|I am) (?:doing |feeling )?(?:well|fine|good)(?:,? (?:thanks|thank you))?|bye|goodbye|thanks|thank you)[.!?\s]*$/iu.test(
        text,
      )
    );
  };
  return (
    lines.some(
      (line) => speaker(line) === fromId && meaningful(line) && (toId !== "player" || line.playerHeard !== false),
    ) && lines.some((line) => speaker(line) === toId && meaningful(line) && line.heardBy.includes(fromId))
  );
}

/** Validates model interpretation against saved evidence, never its own claims of witnessing or authority. */
export function parseRelationshipReview(
  value: unknown,
  sourceId: string,
  lines: readonly RelationshipEvidenceLine[],
  village: VillageState,
): RelationshipReview {
  const raw = asRecord(value),
    result = emptyRelationshipReview();
  if (!Array.isArray(raw.changes) || !Array.isArray(raw.permissions) || !Array.isArray(raw.disclosures))
    throw new Error("The visit's relationship review is incomplete.");
  const ids = new Set(["player", ...village.villagers.map((person) => person.characterId)]);
  const byId = new Map(lines.map((line) => [line.id, line]));
  const evidenceFor = (row: Record<string, unknown>, actorId: string): RelationshipEvidenceLine[] => {
    if (!Array.isArray(row.lineIds) || !row.lineIds.length) throw new Error("Relationship evidence is missing.");
    const evidence = [...new Set(row.lineIds)].map((id) => (typeof id === "string" ? byId.get(id) : undefined));
    if (evidence.some((line) => !line || !line.heardBy.includes(actorId)))
      throw new Error("Relationship evidence has a missing line or wrong audience.");
    return evidence as RelationshipEvidenceLine[];
  };
  const seen = new Set<string>();
  for (const value of raw.changes) {
    const row = asRecord(value),
      fromId = String(row.fromId ?? ""),
      toId = String(row.toId ?? "");
    if (
      !ids.has(fromId) ||
      fromId === "player" ||
      !ids.has(toId) ||
      fromId === toId ||
      (row.dimension !== "warmth" && row.dimension !== "trust") ||
      !["minor", "meaningful", "major", "none"].includes(String(row.strength)) ||
      !["increase", "decrease"].includes(String(row.direction))
    )
      throw new Error("Invalid directional relationship decision.");
    const evidence = evidenceFor(row, fromId),
      lineIds = evidence.map((line) => line.id).sort();
    const key = JSON.stringify([fromId, toId, row.dimension, lineIds]);
    if (seen.has(key)) throw new Error("Repeated relationship evidence in this review.");
    seen.add(key);
    const amount =
      row.strength === "none"
        ? 0
        : RELATIONSHIP_POLICY.adjustments[row.strength as keyof typeof RELATIONSHIP_POLICY.adjustments] *
          (row.direction === "decrease" ? -1 : 1);
    if (row.ordinary === true && (row.dimension !== "warmth" || Math.abs(amount) > 2))
      throw new Error("Ordinary contact cannot award trust or a large relationship gain.");
    const reason = typeof row.reason === "string" ? row.reason.trim().slice(0, 320) : "";
    if (!reason) throw new Error("A relationship change needs a grounded reason.");
    const spokenToPlayer =
      evidence.every((line) => line.playerHeard !== false) &&
      evidence.some((line) => line.speakerId === fromId && line.kind !== "narration");
    const change: RelationshipChange = {
      id: receiptId(sourceId, [fromId, toId, row.dimension, lineIds]),
      fromId,
      toId,
      dimension: row.dimension,
      amount,
      ordinary: row.ordinary === true,
      reason,
      lineIds,
      disclosed: row.disclosed === true && spokenToPlayer,
      contact: substantiveContact(evidence, fromId, toId),
    };
    result.changes.push(change);
  }
  for (const value of raw.permissions) {
    const row = asRecord(value),
      controllerId = String(row.controllerId ?? ""),
      visitorId = String(row.visitorId ?? ""),
      venueId = String(row.venueId ?? ""),
      zoneId = String(row.zoneId ?? "");
    const venue = village.venues.find((place) => place.id === venueId),
      zone = venue && resolveVenueZone(venue, zoneId);
    if (
      !ids.has(visitorId) ||
      visitorId === controllerId ||
      !venue ||
      !zone ||
      !canInviteToZone(venue, zone, controllerId) ||
      !["grant", "revoke"].includes(String(row.action))
    )
      throw new Error("A standing permission has no current controller or zone.");
    const evidence = evidenceFor(row, controllerId);
    const speech = evidence
      .filter((line) => line.speakerId === controllerId && line.kind !== "narration")
      .map((line) => line.content)
      .join(" ");
    const visitorName =
      visitorId === "player"
        ? "you"
        : (village.villagers.find((person) => person.characterId === visitorId)?.cardSnapshot.name ?? "");
    if (
      !speech ||
      /\b(?:unless|maybe|perhaps|if)\b/iu.test(speech) ||
      (row.action === "grant" &&
        (/\b(?:not|never|don't|cannot|can't|won't)\b/iu.test(speech) ||
          !/\b(?:whenever|anytime|any time|always welcome|come and go|standing permission|from now on)\b/iu.test(
            speech,
          ))) ||
      (row.action === "revoke" &&
        !/\b(?:no longer|not welcome|withdraw|revoke|don't (?:come|enter)|cannot (?:come|enter))\b/iu.test(speech))
    )
      throw new Error("Standing permission must be unconditional, explicit controller speech.");
    if (
      !visitorName ||
      !speech.toLocaleLowerCase().includes(visitorName.toLocaleLowerCase()) ||
      !speech.toLocaleLowerCase().includes(zone.name.toLocaleLowerCase())
    )
      throw new Error("Standing permission must name this visitor and zone.");
    const lineIds = evidence.map((line) => line.id).sort();
    result.permissions.push({
      id: receiptId(sourceId, [controllerId, visitorId, venueId, zoneId, row.action, lineIds]),
      controllerId,
      visitorId,
      venueId,
      zoneId,
      action: row.action as "grant" | "revoke",
      lineIds,
    });
  }
  for (const value of raw.disclosures) {
    const row = asRecord(value),
      fromId = String(row.fromId ?? ""),
      toId = String(row.toId ?? "");
    if (
      fromId === "player" ||
      !ids.has(fromId) ||
      !ids.has(toId) ||
      !["explanation", "preference", "boundary"].includes(String(row.kind))
    )
      throw new Error("Invalid personal disclosure.");
    const evidence = evidenceFor(row, fromId);
    if (
      evidence.some((line) => line.playerHeard === false) ||
      !evidence.some((line) => line.speakerId === fromId && line.kind !== "narration")
    )
      throw new Error("A disclosure needs the villager's own speech heard by the player.");
    const text = typeof row.text === "string" ? row.text.trim().slice(0, 320) : "";
    if (!text) throw new Error("A disclosure needs text.");
    const lineIds = evidence.map((line) => line.id).sort();
    result.disclosures.push({
      id: receiptId(sourceId, [fromId, toId, row.kind, lineIds]),
      fromId,
      toId,
      text,
      kind: row.kind as "explanation" | "preference" | "boundary",
      lineIds,
    });
  }
  return result;
}
