import { asRecord } from "../rules/coerce.js";

/** Read the retired class name without rewriting authored text or saved identities. */
export function savedVenueClass(value: unknown): unknown {
  return value === "gathering" ? "community" : value;
}

export function savedVenueClassRecord(value: unknown): Record<string, unknown> {
  const row = { ...asRecord(value) };
  for (const key of ["classes", "proposedClasses"])
    if (Array.isArray(row[key])) row[key] = row[key].map(savedVenueClass);
  for (const key of ["venueClass", "spaceClass"]) if (key in row) row[key] = savedVenueClass(row[key]);
  return row;
}
