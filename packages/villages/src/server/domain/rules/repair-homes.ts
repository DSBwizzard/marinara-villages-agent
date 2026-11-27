import type { RepairRecord, RepairField, RepairRequest } from "../../../shared/contracts/repair.js";
import type { VillageState } from "../models/world.js";
import { venueZones, zoneClosed } from "./venue-zones.js";
import { venueResidentIds, venueSleepers } from "./venue-model.js";
import { accessibleSleepingRoute } from "./residence-agreement.js";
import { changeRoomOwner } from "./residence-move.js";
import { accessibleVenueRoute } from "./venue-path.js";
import { ZonedDate } from "../../../shared/helpers/zoned-date.js";
import { initializeVenueAccess } from "./venue-access.js";
import { keepAgendaPlaces } from "./resident-agenda.js";
import { normalizeVillageMutation } from "./world-mutation.js";
import { conflict, badRequest } from "./errors.js";

export function homeRepairRecords(state: VillageState, at = state.simulatedThrough || state.setupAt): RepairRecord[] {
  const people = [
    { id: "player", name: "Your Persona" },
    ...state.villagers.map((p) => ({ id: p.characterId, name: p.cardSnapshot.name })),
  ];
  const venues = state.venues.filter((v) => v.constructionStatus !== "worksite");
  const fields = (actor: string, homeId: string, sleep: string, homeZone: string): RepairField[] => [
    {
      key: "homeId",
      label: "Home",
      type: "choice",
      value: homeId,
      options: [{ value: "", label: "No home" }, ...venues.map((v) => ({ value: v.id, label: v.name }))],
    },
    ...[
      ["homeZoneId", "Home area", homeZone],
      ["sleepZoneId", "Sleeping Zone", sleep],
    ].map(([key, label, value]) => ({
      key: key!,
      label: label!,
      value: value!,
      type: "choice" as const,
      dependsOn: "homeId",
      options: [
        { value: "", label: "Choose automatically" },
        ...venues.flatMap((v) =>
          venueZones(v)
            .filter(
              (z) =>
                z.kind !== "exterior" &&
                !zoneClosed(state, v, z) &&
                (key !== "homeZoneId" || !z.ownerId || z.ownerId === actor) &&
                (key !== "sleepZoneId" ||
                  accessibleSleepingRoute(state, v, actor, z.id, new ZonedDate(at, state.timeZone || "UTC"))),
            )
            .map((z) => ({ value: z.id, label: z.name, parent: v.id })),
        ),
      ],
    })),
  ];
  return people.flatMap((person) => {
    const home = venues.find((v) =>
      person.id === "player" ? v.occupancy.playerHome : venueResidentIds(v).includes(person.id),
    );
    const move = state.residences.find((r) => r.characterId === person.id && r.status !== "current");
    const base: RepairRecord = {
      id: JSON.stringify(["home", person.id]),
      topic: "places",
      title: person.name + ", Home",
      summary: "Home assignment",
      fields: fields(
        person.id,
        home?.id ?? "",
        home?.destinations?.[person.id]?.sleep ?? "",
        home?.destinations?.[person.id]?.home ?? "",
      ),
      source: [],
      actions: [{ id: "correct", label: "Modify" }],
      related: [],
    };
    if (!move) return [base];
    return [
      base,
      {
        ...base,
        id: JSON.stringify(["home-proposal", person.id]),
        title: person.name + ", Pending move",
        summary: "Pending move",
        fields: fields(
          person.id,
          move.proposedVenueId,
          move.proposedPrivateZoneId ?? "",
          move.proposedPrivateZoneId ?? "",
        ),
        actions: [
          { id: "complete", label: "Apply move" },
          { id: "cancel", label: "Cancel move" },
        ],
        source: [move.holdReason || "Pending move"],
      },
    ];
  });
}

export function applyHomeRepair(
  state: VillageState,
  record: RepairRecord,
  request: RepairRequest,
  at: string,
): boolean {
  const [kind, actor] = JSON.parse(record.id) as string[];
  if (kind !== "home" && kind !== "home-proposal") return false;
  if (actor !== "player" && !state.villagers.some((p) => p.characterId === actor))
    throw conflict("This household member changed.");
  const values = Object.fromEntries(record.fields.map((f) => [f.key, request.values[f.key] ?? f.value]));
  normalizeVillageMutation(
    state,
    () => {
      const current = state.residences.find((r) => r.characterId === actor);
      if (kind === "home-proposal" && (!current || current.status === "current"))
        throw conflict("This move is no longer pending.");
      if (kind === "home-proposal" && request.action === "cancel") {
        state.residences = state.residences.filter((r) => r !== current);
        if (current?.venueId)
          state.residences.push({
            characterId: actor!,
            venueId: current.venueId,
            status: "current",
            proposedVenueId: "",
            requestedAt: at,
          });
        return;
      }
      const homeId = String(values.homeId),
        destination = state.venues.find((v) => v.id === homeId);
      if (homeId && (!destination || destination.constructionStatus === "worksite"))
        throw conflict("Choose a completed Venue.");
      for (const key of ["homeZoneId", "sleepZoneId"]) {
        const id = String(values[key] ?? "");
        if (
          id &&
          (!destination ||
            !venueZones(destination).some(
              (z) => z.id === id && z.kind !== "exterior" && !zoneClosed(state, destination, z),
            ))
        )
          throw badRequest("Choose an available Zone in this home.");
      }
      if (
        destination &&
        values.sleepZoneId &&
        !accessibleSleepingRoute(
          state,
          destination,
          actor!,
          String(values.sleepZoneId),
          new ZonedDate(at, state.timeZone || "UTC"),
        )
      )
        throw conflict("Choose a sleeping Zone with an accessible route from Entrance.");
      for (const venue of state.venues) {
        if (venue.knownSleepDestinations) delete venue.knownSleepDestinations[actor!];
        if (venue.id !== homeId)
          for (const zone of venueZones(venue)) if (zone.ownerId === actor) changeRoomOwner(venue, zone, undefined);
        if (actor === "player") venue.occupancy.playerHome = false;
        else {
          venue.residentIds = venueResidentIds(venue).filter((id) => id !== actor);
          venue.occupancy.residentCharacterId = venue.residentIds[0] ?? null;
        }
        if (venue.destinations?.[actor!]) {
          delete venue.destinations[actor!]!.home;
          delete venue.destinations[actor!]!.sleep;
        }
      }
      state.residences = state.residences.filter((r) => r.characterId !== actor);
      if (destination) {
        if (actor === "player") destination.occupancy.playerHome = true;
        else {
          destination.residentIds = [...new Set([...venueResidentIds(destination), actor!])];
          destination.occupancy.residentCharacterId = destination.residentIds[0]!;
          state.residences.push({
            characterId: actor!,
            venueId: destination.id,
            status: "current",
            proposedVenueId: "",
            requestedAt: at,
          });
        }
        const assignment = ((destination.destinations ??= {})[actor!] ??= {});
        if (values.homeZoneId) assignment.home = String(values.homeZoneId);
        if (
          assignment.home &&
          venueZones(destination).some((z) => z.id === assignment.home && z.ownerId && z.ownerId !== actor)
        )
          throw conflict("Choose a shared home area or this person's own room.");
        if (values.sleepZoneId) assignment.sleep = String(values.sleepZoneId);
        const bedroom = venueZones(destination).find((z) => z.id === assignment.sleep && z.kind === "personal");
        if (bedroom && !bedroom.ownerId && !venueSleepers(destination, bedroom.id).some((other) => other !== actor))
          changeRoomOwner(destination, bedroom, actor);
        initializeVenueAccess(destination);
        if (
          assignment.sleep &&
          !accessibleSleepingRoute(
            state,
            destination,
            actor!,
            assignment.sleep,
            new ZonedDate(at, state.timeZone || "UTC"),
          )
        )
          throw conflict("Choose a sleeping Zone with an accessible route from Entrance.");
        if (
          assignment.home &&
          !accessibleVenueRoute(state, destination, actor!, assignment.home, new ZonedDate(at, state.timeZone || "UTC"))
        )
          throw conflict("Choose a home area with an accessible route from Entrance.");
        if (assignment.sleep) (destination.knownSleepDestinations ??= {})[actor!] = assignment.sleep;
      }
      keepAgendaPlaces(state);
    },
    { now: () => new Date(at), seed: () => request.operationId },
  );
  return true;
}
