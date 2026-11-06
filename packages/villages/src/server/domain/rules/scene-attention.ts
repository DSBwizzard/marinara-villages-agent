import type { VenueScene } from "../models/scene-model.js";
import type { VillageVenue } from "../models/world.js";
import { contactNeighbors, contactPosition, type DoorwayContact } from "./venue-contact.js";

/** Only the latest visible exchange can supply a conversational default. */
function latestAttentionSpeaker(scene: VenueScene) {
  const speakers = new Set<string>();
  for (const line of [...scene.lines].reverse()) {
    if (line.contactHidden || line.contactReport) continue;
    if (line.role === "user") break;
    if (line.kind === "narration" || line.kind === "side" || line.kind === "whisper") continue;
    if (line.speakerId) speakers.add(line.speakerId);
  }
  return speakers.size === 1 ? [...speakers][0] : undefined;
}

/** Movement changes reach, not the identity of a witnessed conversation. */
export function movedAttentionContacts(venue: VillageVenue, before: VenueScene, after: VenueScene): DoorwayContact[] {
  const neighbors = contactNeighbors(venue, after.zoneId ?? "exterior", after);
  const contacts = (before.doorwayContacts ?? []).filter(
    (entry) =>
      entry.playerZoneId === before.zoneId && contactPosition(before, entry.characterId) === entry.characterZoneId,
  );
  const speakerId = latestAttentionSpeaker(before);
  if (speakerId && before.activeIds.includes(speakerId) && !contacts.some((entry) => entry.characterId === speakerId)) {
    contacts.push({
      characterId: speakerId,
      playerZoneId: before.zoneId ?? "exterior",
      characterZoneId: contactPosition(before, speakerId),
      delivery: "voice",
    });
  }
  return contacts.flatMap((entry) => {
    const position = contactPosition(after, entry.characterId);
    return position && position !== after.zoneId && neighbors.includes(position)
      ? [{ ...entry, playerZoneId: after.zoneId ?? "exterior", characterZoneId: position, delivery: "voice" as const }]
      : [];
  });
}
