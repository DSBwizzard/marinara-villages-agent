import { useState } from "react";
import type { SetupVenueDraft } from "../../shared/types.js";
import type { VenueAccessState } from "../../../shared/helpers/venue-access.js";
import { venueWorkSchema, workTime, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields } from "../../shared/WorkFields.js";
import { foundingHomeMembers, foundingSleepZones, reconcileFoundingHome } from "./founding-homes.js";

export function foundingAccess(venue: SetupVenueDraft): VenueAccessState {
  return (
    venue.access ?? {
      version: 1,
      revision: 0,
      managerIds: foundingHomeMembers(venue).length ? foundingHomeMembers(venue) : ["player"],
      visitorHours: null,
      permissions: [],
      bans: [],
      exceptions: [],
      changes: [],
      visitDenials: [],
      receipts: {},
    }
  );
}
export function FoundingPeople({
  venue,
  people,
  onPatch,
}: {
  venue: SetupVenueDraft;
  people: { id: string; name: string }[];
  onPatch(venue: SetupVenueDraft): void;
}) {
  const [work, setWork] = useState<VenueWork | null>(null);
  const [problem, setProblem] = useState("");
  const members = foundingHomeMembers(venue);
  const access = foundingAccess(venue);
  const name = (id: string) => people.find((row) => row.id === id)?.name ?? "Villager";
  const zones = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])];
  return (
    <section className="villages-access-panel" aria-label="People at this Venue">
      <fieldset>
        <legend>Lives here</legend>
        {people.map((person) => (
          <label key={person.id}>
            <input
              autoComplete="off"
              type="checkbox"
              checked={members.includes(person.id)}
              onChange={(e) => {
                const next = e.target.checked ? [...members, person.id] : members.filter((id) => id !== person.id);
                if (next.length > (venue.residenceCapacity ?? 1)) {
                  setProblem("Increase Home places first.");
                  return;
                }
                setProblem("");
                onPatch(reconcileFoundingHome(venue, next));
              }}
            />
            {person.name}
          </label>
        ))}
        <label>
          Home places
          <select
            aria-label="Home places"
            value={venue.residenceCapacity ?? 1}
            onChange={(e) =>
              onPatch({ ...venue, residenceCapacity: Number(e.target.value), foundingCapacity: Number(e.target.value) })
            }
          >
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n} value={n} disabled={n < members.length}>
                {n}
              </option>
            ))}
          </select>
        </label>
        {members.map((id) => (
          <label key={id}>
            {name(id)} sleeps in
            <select
              aria-label={`${name(id)} sleeps in`}
              value={venue.destinations?.[id]?.sleep ?? ""}
              onChange={(e) =>
                onPatch({
                  ...venue,
                  destinations: { ...venue.destinations, [id]: { ...venue.destinations?.[id], sleep: e.target.value } },
                })
              }
            >
              <option value="">Choose a Zone</option>
              {foundingSleepZones(venue, id).map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name || "Zone"}
                </option>
              ))}
            </select>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Manages this place</legend>
        {people.map((person) => (
          <label key={person.id}>
            <input
              autoComplete="off"
              type="checkbox"
              checked={access.managerIds.includes(person.id)}
              onChange={(e) =>
                onPatch({
                  ...venue,
                  access: {
                    ...access,
                    managerIds: e.target.checked
                      ? [...access.managerIds, person.id]
                      : access.managerIds.filter((id) => id !== person.id),
                  },
                })
              }
            />
            {person.name}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Works here</legend>
        {(access.work ?? []).map((row) => (
          <div key={row.characterId}>
            <strong>{name(row.characterId)}</strong>
            <p>
              {row.activity} · {row.days.map((day) => day.slice(0, 3)).join(", ")} · {workTime(row.startMinute)}–
              {workTime(row.endMinute)}
            </p>
            <button type="button" onClick={() => setWork(structuredClone(row))}>
              Edit work
            </button>
            <button
              type="button"
              onClick={() =>
                onPatch({
                  ...venue,
                  workerIds: venue.workerIds?.filter((id) => id !== row.characterId),
                  access: { ...access, work: access.work!.filter((other) => other !== row) },
                })
              }
            >
              Remove work
            </button>
          </div>
        ))}
        <label>
          Add worker
          <select
            aria-label="Add worker"
            value=""
            onChange={(e) => {
              if (e.target.value)
                setWork({
                  characterId: e.target.value,
                  activity: "Working",
                  zoneId: zones[0]?.id ?? "",
                  accessZoneIds: zones[0] ? [zones[0].id] : [],
                  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  startMinute: 540,
                  endMinute: 1020,
                });
            }}
          >
            <option value="">Choose a Villager</option>
            {people
              .filter((person) => person.id !== "player" && !access.work?.some((row) => row.characterId === person.id))
              .map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
          </select>
        </label>
        {work && (
          <fieldset>
            <legend>{name(work.characterId)}’s work</legend>
            <WorkFields
              value={work}
              zones={zones.filter((zone) => !zone.ownerId || zone.ownerId === work.characterId)}
              onChange={setWork}
            />
            <button
              type="button"
              disabled={!venueWorkSchema.safeParse(work).success || !work.accessZoneIds.includes(work.zoneId)}
              onClick={() => {
                onPatch({
                  ...venue,
                  workerIds: [...new Set([...(venue.workerIds ?? []), work.characterId])],
                  access: {
                    ...access,
                    work: [...(access.work ?? []).filter((row) => row.characterId !== work.characterId), work],
                  },
                  destinations: {
                    ...venue.destinations,
                    [work.characterId]: { ...venue.destinations?.[work.characterId], work: work.zoneId },
                  },
                });
                setWork(null);
              }}
            >
              Save work
            </button>
            <button type="button" onClick={() => setWork(null)}>
              Cancel
            </button>
          </fieldset>
        )}
      </fieldset>
      {problem && <p role="alert">{problem}</p>}
    </section>
  );
}
