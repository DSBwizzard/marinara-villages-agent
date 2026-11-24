import { useState } from "react";
import type { SetupVenueDraft } from "../../shared/types.js";
import { foundingAccess } from "./founding-access.js";
import { venueWorkSchema, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields, initialVenueWork } from "../../shared/WorkFields.js";
import { type VenuePerson } from "../venues/VenueManage.js";
import { HomeFields } from "../../shared/HomeFields.js";
import { ArrangementRoster, type ArrangementPage } from "../venues/ArrangementNavigation.js";
import { VenueRunners } from "../venues/VenueRunners.js";
import { foundingHomeMembers, foundingSleepZones, reconcileFoundingHome } from "./founding-homes.js";

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
  const [sleep, setSleep] = useState(zoneId ?? venue.destinations?.[id]?.sleep ?? "");
  const [problem, setProblem] = useState("");
  const existing = foundingHomeMembers(venue);
  const members = [...existing.filter((member) => member !== id), id];
  const draft = reconcileFoundingHome(venue, members);
  const choices = foundingSleepZones(draft, id);
  const sleeping = choices.some((zone) => zone.id === sleep) ? sleep : (draft.destinations?.[id]?.sleep ?? "");
  const save = () => {
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
          fixedVenue
          fixedZone={!!zoneId}
          venues={venues}
          venueId={venue.id}
          zoneId={sleeping}
          zones={choices.map((zone) => ({ id: zone.id, name: zone.name || "Zone" }))}
          onVenue={() => {}}
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
  const access = foundingAccess(venue);
  const zones = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].filter(
    (zone) => !zone.ownerId || zone.ownerId === id,
  );
  const scopedWork = (value: VenueWork): VenueWork =>
    zoneId ? { ...value, zoneId, accessZoneIds: [...new Set([...value.accessZoneIds, zoneId])] } : value;
  const [work, setWork] = useState<VenueWork>(() =>
    scopedWork(
      structuredClone(
        access.work?.find((row) => row.characterId === id) ??
          initialVenueWork(
            id,
            zoneId ? [...zones.filter((row) => row.id === zoneId), ...zones.filter((row) => row.id !== zoneId)] : zones,
          ),
      ),
    ),
  );
  return (
    <>
      <WorkFields fixedZone={!!zoneId} value={work} zones={zones} onChange={setWork} />
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

export function FoundingPeople({
  venue,
  venues,
  people,
  onPatch,
  disabled = false,
  page,
  onPage,
}: {
  venue: SetupVenueDraft;
  venues: SetupVenueDraft[];
  people: VenuePerson[];
  onPatch(venue: SetupVenueDraft): void;
  disabled?: boolean;
  page: ArrangementPage;
  onPage(page: ArrangementPage | null): void;
}) {
  const access = foundingAccess(venue),
    person = people.find((row) => row.id === page.personId);
  const back = () => onPage({ kind: page.kind });
  if (page.kind === "runners")
    return (
      <VenueRunners
        ids={access.managerIds}
        people={people}
        disabled={disabled}
        onBack={() => onPage(null)}
        onSave={(ids) => {
          onPatch({ ...venue, access: { ...access, managerIds: ids } });
          return true;
        }}
      />
    );
  return (
    <section className="villages-manage" aria-label="Assignments">
      <fieldset disabled={disabled}>
        {person ? (
          <>
            <h2>{page.kind === "home" ? "Home" : "Work"}</h2>
            {page.kind === "home" ? (
              <HomeEditor venue={venue} venues={venues} id={person.id} onPatch={onPatch} onBack={back} />
            ) : (
              <WorkEditor venue={venue} venues={venues} id={person.id} onPatch={onPatch} onBack={back} />
            )}
          </>
        ) : (
          <ArrangementRoster place={venue} people={people} page={page} onPage={onPage} disabled={disabled} />
        )}
      </fieldset>
    </section>
  );
}
