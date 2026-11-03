import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";

/** Validate included Zone content without imposing the Quick Start template. */
export function validateStartingVenue(value: unknown): void {
  const row = asRecord(value);
  const common = Array.isArray(row.spaces) ? row.spaces : [];
  const privateSpaces = Array.isArray(row.privateSpaces) ? row.privateSpaces : [];
  for (const raw of [...common, ...privateSpaces]) {
    const zone = asRecord(raw);
    if (!asTrimmedString(zone.name) || !asTrimmedString(zone.purpose))
      throw badRequest("Give each included Zone a name and purpose before founding.");
    if (!asTrimmedString(zone.description)) throw badRequest("Describe each visible Zone before founding.");
  }
}
