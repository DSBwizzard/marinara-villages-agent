import type { VillageVenueClass } from "../models/world.js";
import { asRecord, asTrimmedString } from "./coerce.js";
import { badRequest } from "./errors.js";

/** Initial founding only. The general layout parser still supports later Projects. */
export function validateStartingVenue(value: unknown, classes: VillageVenueClass[], playerHome: boolean): void {
  const row = asRecord(value);
  const gathering = asTrimmedString(row.category).toLowerCase() === "public-center";
  if (classes.length !== 1 || classes[0] !== (gathering ? "gathering" : "residence"))
    throw badRequest("Founding creates Residences and one neutral Gathering Place; workplace setup is separate.");
  const common = Array.isArray(row.spaces) ? row.spaces : [];
  const privateSpaces = Array.isArray(row.privateSpaces) ? row.privateSpaces : [];
  if (!common.length && !privateSpaces.length)
    throw badRequest("A Residence needs at least one Common or Private Space before founding.");
  if (gathering && (row.layout !== "common" || !common.length || privateSpaces.length))
    throw badRequest("The starting Gathering Place requires public Common Space and has no Private Space.");
  for (const [personal, raw] of [
    ...common.map((zone) => [false, zone] as const),
    ...privateSpaces.map((zone) => [true, zone] as const),
  ]) {
    const zone = asRecord(raw);
    if (!asTrimmedString(zone.name) || !asTrimmedString(zone.purpose))
      throw badRequest("Give each included Zone a name and purpose before founding.");
    if ((!personal || playerHome) && !asTrimmedString(zone.description))
      throw badRequest("Describe each visible Zone before founding.");
    if (gathering) {
      const access = asRecord(zone.access);
      if (
        asTrimmedString(zone.ownerId) ||
        (Array.isArray(zone.controllerIds) && zone.controllerIds.length) ||
        (zone.access !== undefined &&
          (access.mode !== "public" ||
            ["managerIds", "memberIds", "memberRoles", "inviterIds", "regularVisitors"].some(
              (key) => Array.isArray(access[key]) && (access[key] as unknown[]).length,
            ) ||
            access.accompanied === true ||
            (access.visitorHours !== undefined && !["inherit", "always"].includes(String(access.visitorHours)))))
      )
        throw badRequest("The starting Gathering Place is unowned and open to everyone.");
    }
  }
}
