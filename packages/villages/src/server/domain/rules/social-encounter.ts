import { bindPlaceEvidence } from "./zone-continuity.js";
import { applyVenueSceneChange, readVenueSceneChange } from "./venue-scene-state.js";
import { venueInZone } from "./venue-zones.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import type { RelationshipEvidenceLine, SocialEncounter } from "../models/relationship-types.js";
import type { SocialOutboxEntry } from "../models/social-outbox-model.js";
import type { VillageState } from "../models/world.js";
import { agendaBlocksFor } from "./agenda-week.js";
import { asRecord } from "./coerce.js";
import { parseRelationshipProposals } from "./relationship-review.js";
import { canEnter } from "./social-rules.js";

export const encounterPhysicalId = (sourceId: string) => `venue-chat:offscreen:${sourceId}:${sourceId}`;

export function readEncounter(
  value: unknown,
  entry: SocialOutboxEntry,
  village: VillageState,
  _now = new Date(),
): SocialEncounter | null {
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
  const liveVillage = village;
  village = { ...village, ...entry.admitted };
  const venue = village.venues.find((place) => place.id === entry.opportunity.venueId),
    zoneId = entry.opportunity.zoneId ?? "exterior";
  if (
    !venue ||
    !actors.every((actorId) =>
      canEnter(
        village,
        venue.id,
        zoneId,
        actorId,
        new ZonedDate(entry.at, village.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
      ),
    )
  )
    return null;
  const at = new ZonedDate(entry.at, village.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone),
    minute = at.getHours() * 60 + at.getMinutes();
  if (
    !actors.every((actorId) => {
      const person = village.villagers.find((resident) => resident.characterId === actorId);
      const block =
        person?.agenda &&
        agendaBlocksFor(person.agenda, person.ingestSchedule !== false, at).find(
          (row) => row.startMinute <= minute && row.endMinute > minute,
        );
      // A scheduled social overlay is authoritative only while still valid.
      return block?.venueId === venue.id && (!block.zoneId || block.zoneId === zoneId);
    })
  )
    return null;
  const lines: RelationshipEvidenceLine[] = raw.lines.map((value, index) => {
    const line = asRecord(value);
    const narration = line.kind === "narration";
    if (
      (line.kind !== undefined && !["dialogue", "narration"].includes(String(line.kind))) ||
      Object.keys(line).some((key) => !["speakerId", "text", "kind"].includes(key)) ||
      (narration
        ? line.speakerId !== undefined && line.speakerId !== ""
        : typeof line.speakerId !== "string" || !actors.includes(line.speakerId)) ||
      typeof line.text !== "string" ||
      !line.text.trim() ||
      line.text.length > 600
    )
      throw new Error("Invalid structured social encounter.");
    return {
      id: `${entry.id}:line:${index}`,
      speakerId: narration ? "" : String(line.speakerId),
      role: "assistant",
      content: line.text.trim(),
      kind: narration ? "narration" : "dialogue",
      heardBy: [...actors],
      playerHeard: false,
    };
  });
  if (new Set(lines.filter((line) => line.kind === "dialogue").map((line) => line.speakerId)).size < 2) return null;
  if (lines.some((line) => line.kind === "narration") && raw.physicalConsistent !== true)
    throw new Error("The encounter's narrated outcomes need independent System validation.");
  if (raw.placeUpdate && !entry.admitted) throw new Error("Physical encounter admission is missing.");
  if (raw.placeUpdate && raw.semanticVersion !== 2) throw new Error("Physical encounter meaning is unverified.");
  const placeUpdate = readVenueSceneChange(raw.placeUpdate, venueInZone(venue, zoneId), entry.at);
  const physicalContext = placeUpdate
    ? bindPlaceEvidence(raw.placeUpdate, lines, {
        zoneId,
        positions: Object.fromEntries(actors.map((id) => [id, zoneId])),
        playerPresent: false,
      })
    : undefined;
  if (placeUpdate)
    applyVenueSceneChange(
      { ...village, venues: structuredClone(village.venues) },
      venue.id,
      placeUpdate,
      "offscreen:" + entry.id,
      entry.at,
      undefined,
      "public",
      "",
      zoneId,
      physicalContext,
    );
  // The model cites local indexes; convert only within this saved encounter, never into an archive.
  const proposed = asRecord(raw.relationshipReview);
  const { review, rejections } = parseRelationshipProposals(
    proposed,
    entry.id,
    lines,
    { ...village, relationshipContext: entry.relationshipSnapshot ?? liveVillage.relationshipContext },
    (row, kind) => {
      if (kind === "disclosures") throw new Error("Offscreen encounters cannot disclose information to the player.");
      if (kind === "changes" && (!actors.includes(String(row.fromId)) || !actors.includes(String(row.toId))))
        throw new Error("An offscreen encounter cannot involve an absent actor.");
      if (
        kind === "permissions" &&
        (!actors.includes(String(row.controllerId)) || !actors.includes(String(row.visitorId)))
      )
        throw new Error("An offscreen encounter cannot involve an absent actor.");
      const indices = Array.isArray(row.lineIds) ? row.lineIds : [];
      if (
        !indices.length ||
        indices.some((index) => !Number.isInteger(index) || Number(index) < 0 || Number(index) >= lines.length)
      )
        throw new Error("Invalid social encounter citation.");
      return { ...row, lineIds: indices.map((index) => lines[Number(index)]!.id) };
    },
    raw.semanticVersion === 2,
  );
  if (rejections.length) throw new Error(rejections.map((row) => JSON.stringify(row)).join("; "));
  return {
    ...(raw.semanticVersion === 2
      ? {
          memoryChanges: raw.memoryChanges,
          wishChanges: raw.wishChanges as unknown[],
          memoryContexts: raw.memoryContexts as SocialEncounter["memoryContexts"],
          semanticProvenance: {
            version: 2 as const,
            sourceHash: String(raw.semanticSourceHash),
            interpretedAt: entry.at,
          },
        }
      : {}),
    wishChanges: Array.isArray(raw.wishChanges) ? raw.wishChanges : [],
    placeUpdate,
    physicalContext,
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
