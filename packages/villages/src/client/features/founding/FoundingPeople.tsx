import { useState } from "react";
import type { SetupVenueDraft } from "../../shared/types.js";
import { foundingAccess } from "./founding-access.js";
import { venueWorkSchema, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields, initialVenueWork } from "../../shared/WorkFields.js";
import { type VenuePerson } from "../venues/VenueManage.js";
import { HomeFields } from "../../shared/HomeFields.js";
import { ArrangementRoster, VisitorsOverview, type ArrangementPage } from "../venues/ArrangementNavigation.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { visitorZones } from "../venues/ArrangementNavigation.js";
import { VenueRunners } from "../venues/VenueRunners.js";
import { FoundingAccess } from "./FoundingAccess.js";
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

function FoundingInvitations({
  venue,
  zoneId,
  people,
  onPatch,
  disabled,
}: {
  venue: SetupVenueDraft;
  zoneId: string;
  people: VenuePerson[];
  onPatch(venue: SetupVenueDraft): void;
  disabled: boolean;
}) {
  const [guest, setGuest] = useState("");
  const [standing, setStanding] = useState(false);
  const [escort, setEscort] = useState(false);
  const [afterHours, setAfterHours] = useState(false);
  const access = foundingAccess(venue),
    zone = visitorZones(venue).find((row) => row.id === zoneId);
  const sleepers = foundingHomeMembers(venue).filter((id) => venue.destinations?.[id]?.sleep === zoneId);
  const managers =
    zone?.kind === "personal" && sleepers.length ? sleepers : (zone?.access?.managerIds ?? access.managerIds);
  const issuer = managers.includes("player") ? "player" : (managers[0] ?? "player");
  return (
    <section className="villages-manage" aria-label="Invitations">
      <fieldset className="villages-manage-form" disabled={disabled}>
        <label>
          Guest
          <select value={guest} onChange={(e) => setGuest(e.target.value)}>
            <option value="">Choose a Villager</option>
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Duration
          <select value={standing ? "standing" : "next"} onChange={(e) => setStanding(e.target.value === "standing")}>
            <option value="next">Next visit</option>
            <option value="standing">Until withdrawn</option>
          </select>
        </label>
        <label className="villages-manage-check">
          <input type="checkbox" checked={escort} onChange={(e) => setEscort(e.target.checked)} />
          Escort required
        </label>
        <label className="villages-manage-check">
          <input type="checkbox" checked={afterHours} onChange={(e) => setAfterHours(e.target.checked)} />
          Allow after hours
        </label>
        <button
          type="button"
          disabled={!guest}
          onClick={() => {
            onPatch({
              ...venue,
              access: {
                ...access,
                permissions: [
                  ...access.permissions,
                  {
                    id: createVillagesClientId(),
                    zoneId,
                    visitorId: guest,
                    issuerId: issuer,
                    duration: standing ? "standing" : "visit",
                    sceneId: null,
                    accompaniedBy: escort ? issuer : null,
                    outsideHours: afterHours,
                    revoked: false,
                    issuedAt: new Date().toISOString(),
                    sourceLineIds: [],
                  },
                ],
              },
            });
            setGuest("");
          }}
        >
          Invite
        </button>
        {access.permissions
          .filter((grant) => grant.zoneId === zoneId && !grant.revoked)
          .map((grant) => (
            <div className="villages-access-grant" key={grant.id}>
              <span>
                {people.find((person) => person.id === grant.visitorId)?.name ?? grant.visitorId},{" "}
                {grant.duration === "standing" ? "Until withdrawn" : "Next visit"}
              </span>
              <button
                type="button"
                onClick={() =>
                  onPatch({
                    ...venue,
                    access: {
                      ...access,
                      permissions: access.permissions.map((row) =>
                        row.id === grant.id ? { ...row, revoked: true } : row,
                      ),
                    },
                  })
                }
              >
                Withdraw
              </button>
            </div>
          ))}
      </fieldset>
    </section>
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
  if (page.kind === "guests" && page.zoneId)
    return (
      <FoundingInvitations venue={venue} zoneId={page.zoneId} people={people} disabled={disabled} onPatch={onPatch} />
    );
  if (page.kind === "visitors")
    return page.zoneId ? (
      <FoundingAccess
        venue={venue}
        zoneId={page.zoneId}
        onPatch={onPatch}
        disabled={disabled}
        onClose={() => onPage({ kind: "visitors" })}
      >
        <nav className="marinara-capability-villages-venue-zone-picker villages-arrangement-summary">
          <VenueZoneRow name="Invitations" disabled={disabled} onOpen={() => onPage({ ...page, kind: "guests" })} />
        </nav>
      </FoundingAccess>
    ) : (
      <VisitorsOverview place={venue} disabled={disabled} onOpen={(zoneId) => onPage({ ...page, zoneId })} />
    );
  return (
    <section className="villages-manage" aria-label="Arrangements">
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
