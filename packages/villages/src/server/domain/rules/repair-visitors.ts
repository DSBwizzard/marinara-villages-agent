import type { RepairRecord, RepairField, RepairRequest } from "../../../shared/contracts/repair.js";
import type { VillageState } from "../models/world.js";
import { clearVisitorLodging, setVisitorVisits, visitorLodging } from "./visitors.js";
import { repairInstant, repairLocalTime } from "./repair-time.js";
import { findLocation } from "./places.js";
import { normalizeVillageMutation } from "./world-mutation.js";
import { badRequest, conflict } from "./errors.js";

export function visitorRepairRecords(state: VillageState): RepairRecord[] {
  const clock = (key: string, label: string, value: string): RepairField => ({
    key,
    label: label + ", Village time",
    type: "datetime",
    value: repairLocalTime(value, state.timeZone),
    group: "Stay",
  });
  return (state.visitors ?? []).map((person) => {
    const trip = person.trip,
      preference = person.visitPreference;
    return {
      id: JSON.stringify(["visitor", person.characterId]),
      topic: "people",
      title: person.cardSnapshot.name + ", Visits",
      summary: person.visitsEnabled ? "Visits on" : "Visits off",
      revision: person.cardSnapshot.revision,
      fields: [
        {
          key: "visitsEnabled",
          label: "Visits enabled",
          type: "boolean",
          value: person.visitsEnabled,
          group: "Visits",
        },
        ...(trip
          ? [
              clock("arrivedAt", "Arrival", trip.arrivedAt),
              clock("leavesAt", "Departure", trip.leavesAt),
              {
                key: "venueId",
                label: "Visit Location",
                type: "choice" as const,
                value: trip.venueId ?? "",
                options: [
                  { value: "", label: "No fixed Location" },
                  ...state.venues.map((v) => ({ value: v.id, label: v.name })),
                ],
                group: "Stay",
              },
              ...(trip.lodging
                ? [
                    {
                      key: "lodging",
                      label: "Lodging",
                      type: "choice" as const,
                      value: "keep",
                      options: [
                        {
                          value: "keep",
                          label:
                            (findLocation(state, trip.lodging.venueId)?.name ?? "Missing Location") +
                            ", " +
                            ((findLocation(state, trip.lodging.venueId)?.zones ?? []).find(
                              (z) => z.id === trip.lodging!.zoneId,
                            )?.name ?? "Missing Zone"),
                        },
                        { value: "remove", label: "Remove saved lodging" },
                      ],
                      group: "Stay",
                    },
                  ]
                : []),
            ]
          : []),
        ...(preference
          ? [
              {
                key: "preference",
                label: "Visit preference",
                type: "choice" as const,
                value: preference.kind,
                options: [
                  { value: "invite", label: "More visits" },
                  { value: "space", label: "Time apart" },
                  { value: "none", label: "Clear preference" },
                ],
                group: "Preference",
              },
              { ...clock("from", "From", preference.from), group: "Preference" },
              { ...clock("until", "Until", preference.until), group: "Preference" },
            ]
          : []),
      ],
      source: [],
      related: [],
      actions: [{ id: "correct", label: "Modify" }],
    };
  });
}
export function applyVisitorRepair(
  state: VillageState,
  record: RepairRecord,
  request: RepairRequest,
  at: string,
): boolean {
  const [kind, id] = JSON.parse(record.id) as string[];
  if (kind !== "visitor") return false;
  normalizeVillageMutation(
    state,
    () => {
      const person = state.visitors?.find((p) => p.characterId === id);
      if (!person) throw conflict("This Visitor changed.");
      const values = Object.fromEntries(record.fields.map((f) => [f.key, request.values[f.key] ?? f.value]));
      const instant = (key: string, old: string) =>
        values[key] === repairLocalTime(old, state.timeZone) ? old : repairInstant(values[key], state.timeZone);
      if (values.visitsEnabled === true) {
        if (person.trip) {
          const arrivedAt = instant("arrivedAt", person.trip.arrivedAt),
            leavesAt = instant("leavesAt", person.trip.leavesAt);
          if (!arrivedAt || !leavesAt || arrivedAt >= leavesAt) throw badRequest("Choose a departure after arrival.");
          if (
            state.visitors?.some(
              (other) =>
                other !== person &&
                other.visitsEnabled &&
                other.trip &&
                other.trip.arrivedAt < leavesAt &&
                other.trip.leavesAt > arrivedAt,
            )
          )
            throw conflict("Another Visitor has a stay during these dates.");
          person.trip.arrivedAt = arrivedAt;
          person.trip.leavesAt = leavesAt;
          if (values.venueId && !state.venues.some((v) => v.id === values.venueId))
            throw conflict("Choose a current Visit Location.");
          if (values.venueId) person.trip.venueId = String(values.venueId);
          else delete person.trip.venueId;
          if (values.lodging === "remove") clearVisitorLodging(state, person);
          else if (person.trip.lodging) {
            // An edited stay must not extend somebody else's saved lodging permission.
            const check = { ...person, visitsEnabled: true };
            if (
              !visitorLodging(state, check, new Date(Math.max(Date.parse(at), Date.parse(arrivedAt)))) ||
              !visitorLodging(state, check, new Date(Date.parse(leavesAt) - 1))
            )
              throw conflict("The saved lodging does not cover this stay. Remove lodging or correct its access first.");
          }
        }
        if (person.visitPreference) {
          if (values.preference === "none") delete person.visitPreference;
          else {
            const from = instant("from", person.visitPreference.from),
              until = instant("until", person.visitPreference.until);
            if (!from || !until || from >= until || person.visitPreference.sentAt >= until)
              throw badRequest("Choose a later end for this preference.");
            Object.assign(person.visitPreference, { kind: values.preference, from, until });
          }
        }
      }
      setVisitorVisits(state, person, values.visitsEnabled === true, request.operationId, at);
      person.visitsRevision = request.operationId;
    },
    { now: () => new Date(at), seed: () => request.operationId },
  );
  return true;
}
