import type { RelationshipEvidenceLine, SocialEncounter } from "../models/relationship-types.js";
import type { SocialOutboxEntry } from "../models/social-outbox-model.js";
import type { VillageState } from "../models/world.js";
import { agendaBlocksFor, agendaDateKey } from "./agenda-week.js";
import { asRecord } from "./coerce.js";
import { parseRelationshipProposals, substantiveContact } from "./relationship-review.js";
import { canEnter } from "./social-rules.js";

export function readEncounter(value: unknown, entry: SocialOutboxEntry, village: VillageState): SocialEncounter | null {
  const raw = asRecord(value),
    actors = entry.opportunity.actorIds;
  if (
    entry.opportunity.kind !== "encounter" ||
    actors.length < 2 ||
    actors.includes("player") ||
    raw.opportunityId !== entry.opportunity.id ||
    !Array.isArray(raw.lines) ||
    raw.lines.length < 2 ||
    raw.lines.length > 8
  )
    return null;
  const venue = village.venues.find((place) => place.id === entry.opportunity.venueId),
    zoneId = entry.opportunity.zoneId ?? "exterior";
  if (!venue || !actors.every((actorId) => canEnter(village, venue.id, zoneId, actorId, new Date(entry.at))))
    return null;
  const at = new Date(entry.at),
    minute = at.getHours() * 60 + at.getMinutes();
  if (agendaDateKey(at) !== agendaDateKey(new Date()) || Date.now() - at.getTime() > 15 * 60_000) return null;
  if (
    !actors.every((actorId) => {
      const person = village.villagers.find((resident) => resident.characterId === actorId);
      const block =
        person?.agenda &&
        agendaBlocksFor(person.agenda, person.ingestSchedule !== false, at).find(
          (row) => row.startMinute <= minute && row.endMinute > minute,
        );
      // A scheduled social overlay is authoritative only while still valid.
      return (
        block?.venueId === venue.id &&
        (!block.zoneId || block.zoneId === zoneId) &&
        block.status !== "dnd" &&
        block.status !== "offline"
      );
    })
  )
    return null;
  const lines: RelationshipEvidenceLine[] = raw.lines.map((value, index) => {
    const line = asRecord(value);
    if (
      typeof line.speakerId !== "string" ||
      !actors.includes(line.speakerId) ||
      typeof line.text !== "string" ||
      !line.text.trim() ||
      line.text.length > 600
    )
      throw new Error("Invalid structured social encounter.");
    return {
      id: `${entry.id}:line:${index}`,
      speakerId: line.speakerId,
      role: "assistant",
      content: line.text.trim(),
      kind: "dialogue",
      heardBy: [...actors],
      playerHeard: false,
    };
  });
  if (new Set(lines.map((line) => line.speakerId)).size < 2) return null;
  // The model cites local indexes; convert only within this saved encounter, never into an archive.
  const proposed = asRecord(raw.relationshipReview);
  const { review, rejections } = parseRelationshipProposals(proposed, entry.id, lines, village, (row, kind) => {
    if (kind === "disclosures") throw new Error("Offscreen encounters cannot disclose information to the player.");
    if (kind === "changes" && (!actors.includes(String(row.fromId)) || !actors.includes(String(row.toId))))
      throw new Error("An offscreen encounter cannot involve an absent actor.");
    if (
      kind === "permissions" &&
      (!actors.includes(String(row.controllerId)) || !actors.includes(String(row.visitorId)))
    )
      throw new Error("An offscreen encounter cannot involve an absent actor.");
    const indices = Array.isArray(row.evidence) ? row.evidence : [];
    if (
      !indices.length ||
      indices.some((index) => !Number.isInteger(index) || Number(index) < 0 || Number(index) >= lines.length)
    )
      throw new Error("Invalid social encounter citation.");
    return { ...row, lineIds: indices.map((index) => lines[Number(index)]!.id) };
  });
  for (const fromId of actors)
    for (const toId of actors)
      if (fromId !== toId && substantiveContact(lines, fromId, toId))
        review.changes.push({
          id: entry.id + ":contact:" + fromId + ":" + toId,
          fromId,
          toId,
          dimension: "warmth",
          amount: 0,
          ordinary: true,
          reason: "Shared substantive contact.",
          lineIds: lines.map((line) => line.id),
          disclosed: false,
          contact: true,
        });
  return {
    id: entry.id,
    at: entry.at,
    venueId: venue.id,
    zoneId,
    actorIds: actors,
    lines,
    review,
    rejectedProposals: rejections,
  };
}
