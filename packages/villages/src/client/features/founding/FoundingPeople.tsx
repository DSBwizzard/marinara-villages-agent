import { useState } from "react";
import type { SetupVenueDraft } from "../../shared/types.js";
import type { VenueAccessState } from "../../../shared/helpers/venue-access.js";
import { venueWorkSchema, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields, initialVenueWork } from "../../shared/WorkFields.js";
import { VenuePeopleFlow, type VenuePerson, type VenueArrangement } from "../venues/VenueManage.js";
import { draftZonePolicy } from "./villages-founding-zones.js";
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

function HomeEditor({
  venue,
  id,
  onPatch,
  onBack,
  zoneId,
}: {
  zoneId?: string;
  venue: SetupVenueDraft;
  id: string;
  onPatch(venue: SetupVenueDraft): void;
  onBack(): void;
}) {
  const [sleep, setSleep] = useState(venue.destinations?.[id]?.sleep ?? zoneId ?? "");
  const [problem, setProblem] = useState("");
  const existing = foundingHomeMembers(venue);
  const members = [...existing.filter((member) => member !== id), id];
  const capacity = Math.max(venue.residenceCapacity ?? 0, members.length);
  const draft = reconcileFoundingHome({ ...venue, residenceCapacity: capacity, foundingCapacity: capacity }, members);
  const choices = foundingSleepZones(draft, id);
  const sleeping = choices.some((zone) => zone.id === sleep) ? sleep : (draft.destinations?.[id]?.sleep ?? "");
  const save = () => {
    if (members.length > (venue.residenceCapacity ?? 0)) {
      setProblem("Increase resident capacity in About.");
      return;
    }
    if (!choices.some((zone) => zone.id === sleeping)) {
      setProblem("Choose a sleeping Zone.");
      return;
    }
    onPatch({
      ...draft,
      destinations: { ...draft.destinations, [id]: { ...draft.destinations?.[id], sleep: sleeping } },
    });
    onBack();
  };
  return (
    <>
      <div className="villages-manage-form">
        <label>
          Sleeps in
          <select aria-label="Sleeps in" value={sleeping} onChange={(e) => setSleep(e.target.value)}>
            <option value="">Choose a Zone</option>
            {choices.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name || "Zone"}
              </option>
            ))}
          </select>
        </label>
      </div>
      {problem && <p role="alert">{problem}</p>}
      <div className="villages-manage-actions">
        <button type="button" onClick={onBack}>
          Cancel
        </button>
        <button type="button" className="villages-manage-primary" onClick={save}>
          Save home
        </button>
      </div>{" "}
      {existing.includes(id) && (
        <button
          type="button"
          className="villages-manage-remove"
          onClick={() => {
            onPatch(
              reconcileFoundingHome(
                venue,
                existing.filter((member) => member !== id),
              ),
            );
            onBack();
          }}
        >
          Remove resident
        </button>
      )}
    </>
  );
}

function WorkEditor({
  venue,
  id,
  onPatch,
  onBack,
}: {
  venue: SetupVenueDraft;
  id: string;
  onPatch(venue: SetupVenueDraft): void;
  onBack(): void;
}) {
  const access = foundingAccess(venue);
  const zones = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].filter(
    (zone) => !zone.ownerId || zone.ownerId === id,
  );
  const [work, setWork] = useState<VenueWork>(() =>
    structuredClone(access.work?.find((row) => row.characterId === id) ?? initialVenueWork(id, zones)),
  );
  return (
    <>
      <WorkFields value={work} zones={zones} onChange={setWork} />
      <div className="villages-manage-actions">
        <button type="button" onClick={onBack}>
          Cancel
        </button>
        <button
          type="button"
          className="villages-manage-primary"
          disabled={!venueWorkSchema.safeParse(work).success || !work.accessZoneIds.includes(work.zoneId)}
          onClick={() => {
            onPatch({
              ...venue,
              workerIds: [...new Set([...(venue.workerIds ?? []), id])],
              access: { ...access, work: [...(access.work ?? []).filter((row) => row.characterId !== id), work] },
              destinations: { ...venue.destinations, [id]: { ...venue.destinations?.[id], work: work.zoneId } },
            });
            onBack();
          }}
        >
          Save work
        </button>
      </div>
      {access.work?.some((row) => row.characterId === id) && (
        <button
          type="button"
          className="villages-manage-remove"
          onClick={() => {
            const destinations = { ...venue.destinations };
            if (destinations[id]) destinations[id] = { ...destinations[id], work: undefined };
            onPatch({
              ...venue,
              destinations,
              workerIds: venue.workerIds?.filter((row) => row !== id),
              access: { ...access, work: access.work!.filter((row) => row.characterId !== id) },
            });
            onBack();
          }}
        >
          Remove work
        </button>
      )}
    </>
  );
}

function ManagementEditor({
  active,
  onSave,
  onBack,
  readOnly = false,
}: {
  active: boolean;
  readOnly?: boolean;
  onSave(active: boolean): void;
  onBack(): void;
}) {
  const [manages, setManages] = useState(active);
  return (
    <>
      <label className="villages-manage-check">
        <input
          autoComplete="off"
          type="checkbox"
          disabled={readOnly}
          checked={manages}
          onChange={(e) => setManages(e.target.checked)}
        />
        Manages this place
      </label>
      <div className="villages-manage-actions">
        <button type="button" onClick={onBack}>
          Cancel
        </button>
        <button
          type="button"
          className="villages-manage-primary"
          disabled={readOnly}
          onClick={() => {
            onSave(manages);
            onBack();
          }}
        >
          Save management
        </button>
      </div>
    </>
  );
}

export function FoundingPeople({
  venue,
  people,
  onPatch,
  zoneId,
  disabled = false,
}: {
  venue: SetupVenueDraft;
  people: VenuePerson[];
  onPatch(venue: SetupVenueDraft): void;
  zoneId?: string;
  disabled?: boolean;
}) {
  const access = foundingAccess(venue);
  const members = foundingHomeMembers(venue);
  const zone = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((row) => row.id === zoneId);
  const policy = zone
    ? (zone.access ?? draftZonePolicy(venue, zone, !!venue.privateSpaces?.some((row) => row.id === zone.id)))
    : undefined;
  const managers = zoneId ? (policy?.managerIds ?? access.managerIds) : access.managerIds;
  const roles = (id: string): VenueArrangement[] => [
    ...(members.includes(id) && (!zoneId || venue.destinations?.[id]?.sleep === zoneId) ? ["home" as const] : []),
    ...(access.work?.some(
      (row) => row.characterId === id && (!zoneId || row.zoneId === zoneId || row.accessZoneIds.includes(zoneId)),
    )
      ? ["work" as const]
      : []),
    ...(managers.includes(id) || zone?.ownerId === id ? ["management" as const] : []),
  ];
  return (
    <section className="villages-manage" aria-label="Venue people">
      <fieldset disabled={disabled}>
        <VenuePeopleFlow
          people={people}
          assignedIds={people.filter((row) => roles(row.id).length).map((row) => row.id)}
          roles={roles}
          disabled={disabled}
          renderEditor={(person, arrangement, back) =>
            arrangement === "home" ? (
              <HomeEditor
                key={person.id}
                venue={venue}
                id={person.id}
                zoneId={zoneId}
                onPatch={onPatch}
                onBack={back}
              />
            ) : arrangement === "work" ? (
              <WorkEditor key={person.id} venue={venue} id={person.id} onPatch={onPatch} onBack={back} />
            ) : (
              <ManagementEditor
                key={person.id}
                active={managers.includes(person.id)}
                readOnly={!!zone?.ownerId}
                onBack={back}
                onSave={(active) => {
                  const managerIds = active
                    ? [...new Set([...managers, person.id])]
                    : managers.filter((id) => id !== person.id);
                  if (zone && policy) {
                    const key = venue.privateSpaces?.some((row) => row.id === zone.id) ? "privateSpaces" : "spaces";
                    onPatch({
                      ...venue,
                      [key]: venue[key]?.map((row) =>
                        row.id === zone.id ? { ...row, access: { ...policy, managerIds } } : row,
                      ),
                    });
                  } else onPatch({ ...venue, access: { ...access, managerIds } });
                }}
              />
            )
          }
        />
      </fieldset>
    </section>
  );
}
