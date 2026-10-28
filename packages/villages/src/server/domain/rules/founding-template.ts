import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";

/** Validate included Zone content without imposing the Quick Start template. */
export function validateStartingVenue(value: unknown, playerHome: boolean): void {
  const row = asRecord(value);
  const common = Array.isArray(row.spaces) ? row.spaces : [];
  const privateSpaces = Array.isArray(row.privateSpaces) ? row.privateSpaces : [];
  for (const [personal, raw] of [
    ...common.map((zone) => [false, zone] as const),
    ...privateSpaces.map((zone) => [true, zone] as const),
  ]) {
    const zone = asRecord(raw);
    if (!asTrimmedString(zone.name) || !asTrimmedString(zone.purpose))
      throw badRequest("Give each included Zone a name and purpose before founding.");
    if ((!personal || zone.venueClass !== "residence" || playerHome) && !asTrimmedString(zone.description))
      throw badRequest("Describe each visible Zone before founding.");
  }
}
