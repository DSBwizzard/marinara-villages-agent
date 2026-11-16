import type { PlayerAccessChange, PlayerAccessEntry } from "../../shared/helpers/venue-access.js";

export function playerAccessLabel(entry: PlayerAccessEntry, timeZone?: string, action?: PlayerAccessChange["action"]) {
  if (action === "removed")
    return {
      home: "No longer your home",
      member: "Member access ended",
      visit: "Visit access ended",
      standing: "Standing permission ended",
      stay: "Stay access ended",
      ban: "Entry restriction lifted",
      refused: "Visit restriction lifted",
    }[entry.kind];

  const end =
    entry.endsAt &&
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short", timeZone }).format(
      new Date(entry.endsAt),
    );
  const label = {
    home: "Home",
    member: "Member access",
    visit: entry.thisVisit ? "Entry for this visit" : "Entry for one visit",
    standing: "Standing permission",
    stay: end ? "Stay access until " + end : "Stay access",
    ban: "Entry restricted",
    refused: "Entry restricted for this visit",
  }[entry.kind];
  return [label, entry.escorted && "With an escort", entry.visitorHours && "During visitor hours"]
    .filter(Boolean)
    .join(" · ");
}
