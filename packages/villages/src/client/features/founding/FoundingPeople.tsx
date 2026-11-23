import { useState } from "react";
import type { SetupVenueDraft } from "../../shared/types.js";
import type { VenueAccessState } from "../../../shared/helpers/venue-access.js";
import { venueWorkSchema, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields, initialVenueWork } from "../../shared/WorkFields.js";
import { type VenuePerson } from "../venues/VenueManage.js";
import { HomeFields } from "../../shared/HomeFields.js";
import { ArrangementRoster, type ArrangementPage } from "../venues/ArrangementNavigation.js";
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
  venues,
}: {
  venues: SetupVenueDraft[];
  zoneId?: string;
  venue: SetupVenueDraft;
  id: string;
  onPatch(venue: SetupVenueDraft): void;
  onBack(): void;
}) {
  const [targetId, setTargetId] = useState(venue.id);
  venue = venues.find((row) => row.id === targetId) ?? venue;
  const [sleep, setSleep] = useState(zoneId ?? venue.destinations?.[id]?.sleep ?? "");
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
        <HomeFields
          venues={venues}
          venueId={venue.id}
          zoneId={sleeping}
          zones={choices.map((zone) => ({ id: zone.id, name: zone.name || "Zone" }))}
          onVenue={(id) => {
            setTargetId(id);
            setSleep("");
          }}
          onZone={setSleep}
        />
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
  venues,
  zoneId,
  id,
  onPatch,
  onBack,
}: {
  venue: SetupVenueDraft;
  venues: SetupVenueDraft[];
  zoneId?: string;
  id: string;
  onPatch(venue: SetupVenueDraft): void;
  onBack(): void;
}) {
  const [targetId, setTargetId] = useState(venue.id);
  venue = venues.find((row) => row.id === targetId) ?? venue;
  const access = foundingAccess(venue);
  const zones = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].filter(
    (zone) => !zone.ownerId || zone.ownerId === id,
  );
  const [work, setWork] = useState<VenueWork>(() =>
    structuredClone(
      access.work?.find((row) => row.characterId === id) ??
        initialVenueWork(
          id,
          zoneId ? [...zones.filter((row) => row.id === zoneId), ...zones.filter((row) => row.id !== zoneId)] : zones,
        ),
    ),
  );
  return (
    <>
      <label>
        Venue
        <select
          aria-label="Venue"
          value={venue.id}
          onChange={(e) => {
            const target = venues.find((row) => row.id === e.target.value);
            if (!target) return;
            setTargetId(target.id);
            setWork(
              structuredClone(
                target.access?.work?.find((row) => row.characterId === id) ??
                  initialVenueWork(
                    id,
                    [...(target.spaces ?? []), ...(target.privateSpaces ?? [])].filter(
                      (row) => !row.ownerId || row.ownerId === id,
                    ),
                  ),
              ),
            );
          }}
        >
          {venues.map((row) => (
            <option key={row.id} value={row.id}>
              {row.name}
            </option>
          ))}
        </select>
      </label>
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
  venues,
  people,
  onPatch,
  zoneId,
  disabled = false,
  page,
  onPage,
}: {
  venue: SetupVenueDraft;
  venues: SetupVenueDraft[];
  people: VenuePerson[];
  onPatch(venue: SetupVenueDraft): void;
  zoneId?: string;
  disabled?: boolean;
  page: ArrangementPage;
  onPage(page: ArrangementPage): void;
}) {
  const person = people.find((row) => row.id === page.personId);
  const back = () => onPage({ kind: page.kind });
  const access = foundingAccess(venue);
  const personal = !!venue.privateSpaces?.some((row) => row.id === zoneId);
  const zone = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((row) => row.id === zoneId);
  const policy = zone ? (zone.access ?? draftZonePolicy(venue, zone, personal)) : undefined;
  const managers = policy ? (policy.managerIds ?? access.managerIds) : access.managerIds;
  return (
    <section className="villages-manage" aria-label="Arrangements">
      <fieldset disabled={disabled}>
        {person ? (
          <>
            <h2 className="villages-arrangement-kind">
              {page.kind === "home" ? "Home" : page.kind === "work" ? "Work" : "Management"}
            </h2>
            {page.kind === "home" ? (
              <HomeEditor
                key={person.id}
                venue={venue}
                venues={venues}
                id={person.id}
                zoneId={zoneId}
                onPatch={onPatch}
                onBack={back}
              />
            ) : page.kind === "work" ? (
              <WorkEditor
                key={person.id}
                venue={venue}
                venues={venues}
                zoneId={zoneId}
                id={person.id}
                onPatch={onPatch}
                onBack={back}
              />
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
                    const key = personal ? "privateSpaces" : "spaces";
                    onPatch({
                      ...venue,
                      [key]: venue[key]?.map((row) =>
                        row.id === zone.id ? { ...row, access: { ...policy, managerIds } } : row,
                      ),
                    });
                  } else onPatch({ ...venue, access: { ...access, managerIds } });
                }}
              />
            )}
          </>
        ) : (
          <ArrangementRoster
            place={venue}
            zoneId={zoneId}
            people={people}
            page={page}
            onPage={onPage}
            disabled={disabled}
          />
        )}
      </fieldset>
    </section>
  );
}
