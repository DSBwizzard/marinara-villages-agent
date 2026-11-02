import type { VillageVenue } from "../../../shared/contracts/village.js";
import { newSetupVenue } from "./FoundingPanels.js";
import { startingZone } from "./founding-template.js";

/** Regrouping preserves authored places as unoccupied infrastructure. */
export function foundingHouseholds(
  rows: VillageVenue[],
  actors: { id: string; name: string }[],
  groups: Record<string, string>,
): VillageVenue[] {
  const households = new Map<string, string[]>();
  for (const actor of actors) {
    const group = groups[actor.id] || actor.id;
    households.set(group, [...(households.get(group) ?? []), actor.id]);
  }
  const homes = [...households].map(([group, members], index) => {
    const id = `founding-home:${group}`;
    const previous = rows.find((row) => row.id === id);
    const playerHome = members.includes("player");
    const residents = members.filter((id) => id !== "player");
    const venue = previous ?? newSetupVenue(id, "residence", 0.5, 0.5, playerHome, index + 1);
    const next = {
      ...venue,
      name: previous?.name ?? members.map((id) => actors.find((row) => row.id === id)!.name).join(" & ") + " home",
      presentation: previous?.presentation ?? { ...venue.presentation, x: null, y: null },
      residenceCapacity: Math.max(venue.residenceCapacity ?? 1, members.length),
      residentIds: residents,
      occupancy: { ...venue.occupancy, playerHome, residentCharacterId: null },
      destinations: Object.fromEntries(Object.entries(venue.destinations ?? {}).filter(([id]) => members.includes(id))),
    };
    // Shared homes start with a shared sleeping space; private rooms are optional.
    if (!previous) {
      next.layout = members.length > 1 ? "common" : "both";
      next.spaces = [startingZone(next, false)];
      next.privateSpaces = members.length > 1 ? [] : [startingZone(next, true)];
    }
    next.privateSpaces = next.privateSpaces?.map((room) =>
      members.includes(room.ownerId) ? room : { ...room, ownerId: "", access: undefined },
    );
    return next;
  });
  const retained = rows
    .filter((row) => !homes.some((home) => home.id === row.id))
    .flatMap((row) => {
      if (!row.classes?.includes("residence") || (!row.occupancy.playerHome && !row.residentIds?.length)) return [row];
      if (
        row.name ===
          [...(row.occupancy.playerHome ? ["player"] : []), ...(row.residentIds ?? [])]
            .map((id) => actors.find((actor) => actor.id === id)?.name ?? "")
            .join(" & ") +
            " home" &&
        row.residenceCapacity === Math.max(1, (row.residentIds?.length ?? 0) + Number(row.occupancy.playerHome)) &&
        !row.venueType &&
        !row.workerIds?.length &&
        !row.capabilities?.length &&
        row.form === "Residence" &&
        row.description === "A residence in the Village." &&
        !row.presentation.image &&
        row.presentation.x === null &&
        row.presentation.y === null &&
        !row.zoneLayout &&
        !row.imageContext &&
        JSON.stringify(row.spaces) === JSON.stringify([startingZone(row, false)]) &&
        JSON.stringify(row.privateSpaces) ===
          JSON.stringify(
            (row.residentIds?.length ?? 0) + Number(row.occupancy.playerHome) > 1 ? [] : [startingZone(row, true)],
          )
      )
        return [];
      return [
        {
          ...row,
          residentIds: [],
          occupancy: { ...row.occupancy, playerHome: false, residentCharacterId: null },
          destinations: {},
          access: undefined,
          spaces: row.spaces?.map((room) => ({ ...room, access: undefined })),
          privateSpaces: row.privateSpaces?.map((room) => ({ ...room, ownerId: "", access: undefined })),
        },
      ];
    });
  return [...homes, ...retained];
}
