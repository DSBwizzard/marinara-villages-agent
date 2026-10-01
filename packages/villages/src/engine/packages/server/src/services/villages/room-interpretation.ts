import type { VillageState, VillageVenue } from "./types.js";
import type { VenueScene, VenueLine } from "./venue-session.js";
import { canInviteToZone, canOccupyZone, venueZones, zoneClosed } from "./venue-zones.js";
import { contactNeighbors } from "./venue-contact.js";
import { relationshipZoneController } from "./relationship-store.js";
import { interpretChecks, type InterpretationCheck, type InterpretationEvidence } from "./interpretation.js";

export function roomInterpretationChecks(
  scene: VenueScene,
  village: VillageState,
  message: string,
  draft: Pick<VenueLine, "speakerId" | "content" | "kind" | "heardBy">[],
  key: string,
  heardPlayerBy: string[] = scene.activeIds,
  targetVenueId?: string,
): InterpretationCheck[] {
  if (!targetVenueId)
    return village.venues.flatMap((venue) =>
      roomInterpretationChecks(scene, village, message, draft, key, heardPlayerBy, venue.id),
    );
  const venue = village.venues.find((entry) => entry.id === targetVenueId);
  if (!venue) return [];
  const actors = [
    ...new Set([
      ...draft
        .filter((line) => line.kind !== "narration")
        .map((line) => line.speakerId)
        .filter(Boolean),
      ...(draft.some((line) => line.kind === "narration") ? scene.activeIds : []),
    ]),
  ];
  const history = scene.lines.filter(
    (line) =>
      !line.contactHidden &&
      !line.contactReport &&
      (!line.zoneId || line.zoneId === scene.zoneId) &&
      line.kind !== "side" &&
      line.kind !== "whisper",
  );
  return actors.flatMap((actor) => {
    const name =
      scene.participants.find((entry) => entry.characterId === actor)?.name ??
      village.villagers.find((entry) => entry.characterId === actor)?.cardSnapshot.name ??
      actor;
    const evidence: InterpretationEvidence[] = [
      ...history
        .filter((line) =>
          line.role === "user"
            ? line.heardBy.includes(actor)
            : line.speakerId === actor || line.heardBy.includes(actor),
        )
        .map((line) => ({
          id: line.id,
          speakerId: line.role === "user" ? "player" : line.speakerId,
          name: line.role === "user" ? "Player" : line.name,
          content: line.content,
          kind: line.kind,
        })),
      ...(message && heardPlayerBy.includes(actor)
        ? [{ id: "player-input", speakerId: "player", name: "Player", content: message }]
        : []),
      ...draft.flatMap((line, index) =>
        line.kind === "side" ||
        line.kind === "whisper" ||
        (line.kind === "narration" && scene.contactGeneration && !scene.contactGeneration.localIds.includes(actor)) ||
        (line.kind !== "narration" && line.speakerId !== actor)
          ? []
          : [
              {
                id: `draft:${index}`,
                speakerId: line.speakerId,
                name: line.kind === "narration" ? "Narration" : name,
                content: line.content,
                kind: line.kind,
                current: true,
              },
            ],
      ),
    ];
    return venueZones(venue)
      .filter((zone) => canInviteToZone(venue, zone, actor))
      .map((zone) => {
        const label = zone.seen
          ? zone.name
          : zone.kind === "private-residence"
            ? `${name}'s Private Space`
            : zone.kind === "shared-residence"
              ? "Common Space"
              : "Restricted Space";
        return {
          id: `${key}:${actor}:${zone.id}`,
          domain: "room" as const,
          question: `Did ${name} invite you into ${label} at ${venue.name ?? "this Venue"}, refuse entry, or ask you to leave it?`,
          facts: {
            playerId: "player",
            playerName: village.playerPersonaName || "Player",
            possibleRecipients: scene.participants
              .filter((person) => scene.activeIds.includes(person.characterId))
              .map((person) => ({ id: person.characterId, name: person.name })),
            actorId: actor,
            actorName: name,
            zoneId: zone.id,
            zoneName: label,
            venueId: venue.id,
            currentPlayerZoneId: scene.zoneId,
            currentPlayerVenueId: scene.placeId,
            controllerId: actor,
            closed: zoneClosed(village, venue, zone),
          },
          evidence,
          outcomes: [
            {
              id: "invite-now",
              statement: `${name} gives the player permission to enter ${label} now in the latest exchange, including a contextual short answer or clear gesture.`,
            },
            {
              id: "invite-later",
              statement: `${name} invites the player to visit ${label} on one future occasion, rather than enter now, in the latest exchange.`,
            },
            ...(venue.id !== scene.placeId || zone.id !== scene.zoneId
              ? [
                  {
                    id: "refuse",
                    statement: `${name} refuses the player's request to enter ${label} in the latest exchange.`,
                  },
                ]
              : []),
            ...(venue.id === scene.placeId && zone.id === scene.zoneId
              ? [
                  {
                    id: "dismiss",
                    statement: `${name} directs the player to leave ${label} now in the latest exchange; this is not a joke, quotation, or instruction to leave an object alone.`,
                  },
                ]
              : []),
          ],
        };
      });
  });
}
export async function interpretRoomReply(
  scene: VenueScene,
  village: VillageState,
  message: string,
  draft: Pick<VenueLine, "speakerId" | "content" | "kind" | "heardBy">[],
  key: string,
  heardPlayerBy: string[] = scene.activeIds,
) {
  const checks = roomInterpretationChecks(scene, village, message, draft, key, heardPlayerBy);
  if (!checks.length) return null;
  return interpretChecks(checks, `room-interpretation:${key}`, scene.id);
}
/** Choose an adjacent admitted Zone, preferring the entry route, then a shortest path toward Exterior. */
export function dismissalDestination(village: VillageState, venue: VillageVenue, scene: VenueScene): string | null {
  const zones = venueZones(venue),
    from = scene.zoneId ?? "exterior";
  const admitted = (id: string) => {
    const zone = zones.find((entry) => entry.id === id);
    return (
      !!zone &&
      !zoneClosed(village, venue, zone) &&
      !scene.dismissedZoneIds?.includes(id) &&
      (canOccupyZone(venue, zone, "player") ||
        !!relationshipZoneController(village.relationshipContext, village, venue, zone, "player") ||
        !!scene.grantedZoneIds?.includes(id))
    );
  };
  if (
    scene.enteredFromZoneId &&
    contactNeighbors(venue, from).includes(scene.enteredFromZoneId) &&
    admitted(scene.enteredFromZoneId)
  )
    return scene.enteredFromZoneId;
  const queue = [[from]],
    seen = new Set([from]);
  while (queue.length) {
    const path = queue.shift()!,
      last = path.at(-1)!;
    if (zones.find((zone) => zone.id === last)?.kind === "exterior") return path[1] ?? null;
    for (const next of contactNeighbors(venue, last))
      if (!seen.has(next) && admitted(next)) {
        seen.add(next);
        queue.push([...path, next]);
      }
  }
  return null;
}
