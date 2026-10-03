import { badRequest } from "./errors.js";
import { venueZones } from "./venue-zones.js";
import type { VillageVenue } from "./types.js";
import type { VillageNarrationStyle } from "./narration-style.js";

export type MovementIntent = { zoneId: string; quote: string };
const clean = (text: string) =>
  text
    .trim()
    .replace(/^[*_]+|[*_.!]+$/gu, "")
    .trim()
    .toLocaleLowerCase();
const action =
  /^(?:i\s+)?(?:move|walk|go|head|step|return|enter|leave|am walking|am moving|walked|moved|went|headed|stepped|returned)\b/iu;
const nominatedAction = /^(?:i\s+)?(?:make my way|made my way|cross|crossed|drift|drifted|proceed|proceeded)\b/iu;
const mixedMovement = /\b(?:move|walk|go|head|step|return|enter|leave)\s+(?:to|into|out|through)\b/iu;

/** Deliberately narrow: one current player movement, one named destination, no speech or extra deed. */
export function readPlayerMovement(message: string, venue: VillageVenue, nomination?: unknown): MovementIntent | null {
  const text = clean(message);
  const raw = nomination && typeof nomination === "object" ? (nomination as Record<string, unknown>) : null;
  const afterAction = text.replace(action, "").trim();
  if (action.test(text) && !afterAction)
    throw badRequest("Choose one named Zone for movement, or use Conclude to end the Scene.");
  const namesMatch = (zone: ReturnType<typeof venueZones>[number], destination: string) =>
    [zone.name, zone.id, ...(zone.kind === "exterior" ? ["outside", "exterior"] : [])].some(
      (name) => clean(name).replace(/^the\s+/u, "") === destination,
    );
  const namedPrefix = venueZones(venue).some((zone) =>
    [zone.name, zone.id, ...(zone.kind === "exterior" ? ["outside", "exterior"] : [])].some((name) => {
      const destination = afterAction.replace(/^back\s+/u, "").replace(/^the\s+/u, "");
      return destination.startsWith(clean(name) + " ");
    }),
  );
  const direct =
    action.test(text) &&
    (/^(?:back\s+)?(?:out\s+)?(?:to|into|through)\s+/iu.test(afterAction) ||
      namedPrefix ||
      venueZones(venue).some((zone) => namesMatch(zone, afterAction.replace(/^back\s+/u, "").replace(/^the\s+/u, ""))));
  if (!direct && !(raw && nominatedAction.test(text))) {
    if (
      mixedMovement.test(text) &&
      !/\b(?:if|would|could|can|will|want|plan|said|says|told|yesterday|earlier)\b|["“”]/iu.test(text)
    )
      throw badRequest("Move to one named Zone in a separate turn from speech or other actions.");
    return null;
  }
  // A nomination cannot supply consent, a missing destination, or words the player did not write.
  if (raw && (typeof raw.quote !== "string" || clean(raw.quote) !== text)) return null;
  const verb = raw && !direct ? nominatedAction : action;
  const destination = text
    .replace(verb, "")
    .trim()
    .replace(/^(?:back\s+)?(?:out\s+)?(?:to|into|through)\s+/iu, "")
    .replace(/^(?:the|a)\s+/iu, "")
    .replace(/\s+now$/iu, "");
  const matches = venueZones(venue).filter((zone) => namesMatch(zone, destination.replace(/^back\s+/u, "")));
  if (matches.length !== 1) {
    if (raw && !direct) return null;
    throw badRequest("Choose one exact Zone name, and send movement separately from speech or other actions.");
  }
  if (raw && raw.zoneId !== matches[0]!.id) return null;
  return { zoneId: matches[0]!.id, quote: message.trim() };
}

export function movementTransition(
  origin: string,
  destination: string,
  style: VillageNarrationStyle,
  playerName: string,
): string {
  const subject = style.person === "first" ? "I" : style.person === "third" ? playerName || "The player" : "You";
  const verb = style.tense === "past" ? "moved" : style.person === "third" ? "moves" : "move";
  return `${subject} ${verb} from ${origin} to ${destination}.`;
}
