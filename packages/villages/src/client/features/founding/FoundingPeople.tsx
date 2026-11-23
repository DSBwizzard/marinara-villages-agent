import { useState, type ReactNode } from "react";
import type { SetupVenueDraft, Portrait } from "../../shared/types.js";
import type { VenueAccessState } from "../../../shared/helpers/venue-access.js";
import { venueWorkSchema, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields, initialVenueWork } from "../../shared/WorkFields.js";
import {
  VenueManageMenu,
  VenueManageHeading,
  VenuePeoplePicker,
  type VenueManageSection,
} from "../venues/VenueManage.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
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
  name,
  onPatch,
  onBack,
}: {
  venue: SetupVenueDraft;
  id: string;
  name: string;
  onPatch(venue: SetupVenueDraft): void;
  onBack(): void;
}) {
  const [lives, setLives] = useState(true);
  const [capacity, setCapacity] = useState(
    Math.max(
      venue.residenceCapacity ?? 0,
      foundingHomeMembers(venue).length + Number(!foundingHomeMembers(venue).includes(id)),
    ),
  );
  const [sleep, setSleep] = useState(venue.destinations?.[id]?.sleep ?? "");
  const [problem, setProblem] = useState("");
  const members = [...foundingHomeMembers(venue).filter((member) => member !== id), ...(lives ? [id] : [])];
  const draft = reconcileFoundingHome({ ...venue, residenceCapacity: capacity, foundingCapacity: capacity }, members);
  const choices = foundingSleepZones(draft, id);
  const sleeping = choices.some((zone) => zone.id === sleep) ? sleep : (draft.destinations?.[id]?.sleep ?? "");
  const save = () => {
    if (capacity < members.length) {
      setProblem("Choose enough home places.");
      return;
    }
    if (lives && !choices.some((zone) => zone.id === sleeping)) {
      setProblem("Choose a sleeping Zone.");
      return;
    }
    onPatch(
      lives
        ? { ...draft, destinations: { ...draft.destinations, [id]: { ...draft.destinations?.[id], sleep: sleeping } } }
        : draft,
    );
    onBack();
  };
  return (
    <>
      <VenueManageHeading title={name} back="Residents" onBack={onBack} />
      <div className="villages-manage-form">
        <label className="villages-manage-check">
          <input autoComplete="off" type="checkbox" checked={lives} onChange={(e) => setLives(e.target.checked)} />
          Lives here
        </label>
        {lives && (
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
        )}
        <label>
          Home places
          <select aria-label="Home places" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))}>
            {[0, 1, 2, 3, 4].map((n) => (
              <option key={n}>{n}</option>
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
      </div>
    </>
  );
}

export function FoundingPeople({
  venue,
  people,
  onPatch,
  onZone,
  initialSection = null,
  disabled = false,
  children,
}: {
  venue: SetupVenueDraft;
  people: { id: string; name: string; portrait?: Portrait }[];
  onPatch(venue: SetupVenueDraft): void;
  onZone(id: string): void;
  initialSection?: VenueManageSection | null;
  disabled?: boolean;
  children: ReactNode;
}) {
  const [section, setSection] = useState<VenueManageSection | null>(initialSection);
  const [person, setPerson] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [managers, setManagers] = useState(false);
  const [work, setWork] = useState<VenueWork | null>(null);
  const access = foundingAccess(venue);
  const members = foundingHomeMembers(venue);
  const name = (id: string) => people.find((row) => row.id === id)?.name ?? "Villager";
  const zones = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])];
  const root = () => {
    setSection(null);
    setPerson(null);
    setWork(null);
    setAdding(false);
    setManagers(false);
  };
  const list = () => {
    setPerson(null);
    setWork(null);
    setAdding(false);
  };
  const openWork = (id: string) => {
    setWork(
      structuredClone(
        access.work?.find((row) => row.characterId === id) ??
          initialVenueWork(
            id,
            zones.filter((zone) => !zone.ownerId || zone.ownerId === id),
          ),
      ),
    );
    setPerson(id);
  };
  const saveWork = () => {
    if (!work) return;
    onPatch({
      ...venue,
      workerIds: [...new Set([...(venue.workerIds ?? []), work.characterId])],
      access: { ...access, work: [...(access.work ?? []).filter((row) => row.characterId !== work.characterId), work] },
      destinations: {
        ...venue.destinations,
        [work.characterId]: { ...venue.destinations?.[work.characterId], work: work.zoneId },
      },
    });
    list();
  };
  return (
    <section className="villages-manage" aria-label="Manage this venue">
      <fieldset disabled={disabled}>
        {!section ? (
          <VenueManageMenu onSelect={setSection} />
        ) : section === "home" && person ? (
          <HomeEditor key={person} venue={venue} id={person} name={name(person)} onPatch={onPatch} onBack={list} />
        ) : section === "work" && work ? (
          <>
            <VenueManageHeading title={name(work.characterId)} back="Workers" onBack={list} />
            <WorkFields
              value={work}
              zones={zones.filter((zone) => !zone.ownerId || zone.ownerId === work.characterId)}
              onChange={setWork}
            />
            <div className="villages-manage-actions">
              <button type="button" onClick={list}>
                Cancel
              </button>
              <button
                type="button"
                className="villages-manage-primary"
                disabled={!venueWorkSchema.safeParse(work).success || !work.accessZoneIds.includes(work.zoneId)}
                onClick={saveWork}
              >
                Save work
              </button>
            </div>
            {access.work?.some((row) => row.characterId === work.characterId) && (
              <button
                type="button"
                onClick={() => {
                  const destinations = { ...venue.destinations };
                  if (destinations[work.characterId])
                    destinations[work.characterId] = { ...destinations[work.characterId], work: undefined };
                  onPatch({
                    ...venue,
                    destinations,
                    workerIds: venue.workerIds?.filter((id) => id !== work.characterId),
                    access: { ...access, work: access.work!.filter((row) => row.characterId !== work.characterId) },
                  });
                  list();
                }}
              >
                Remove work
              </button>
            )}
          </>
        ) : (
          <>
            {section !== "home" && section !== "work" && (
              <VenueManageHeading
                title={section === "access" ? (managers ? "Managers" : "Access") : "Building"}
                back={managers ? "Access" : "Manage"}
                onBack={managers ? () => setManagers(false) : root}
              />
            )}
            {(section === "home" || section === "work") && (
              <VenuePeoplePicker
                key={`${section}-${adding}`}
                heading={
                  adding ? (section === "home" ? "Add resident" : "Add worker") : section === "home" ? "Home" : "Work"
                }
                back={adding ? (section === "home" ? "Residents" : "Workers") : "Manage"}
                onBack={adding ? list : root}
                title={
                  adding
                    ? section === "home"
                      ? "Add resident"
                      : "Add worker"
                    : section === "home"
                      ? "Residents"
                      : "Workers"
                }
                people={people.filter((row) =>
                  section === "home"
                    ? adding !== members.includes(row.id)
                    : row.id !== "player" && adding !== !!access.work?.some((work) => work.characterId === row.id),
                )}
                onAdd={!adding ? () => setAdding(true) : undefined}
                addLabel={section === "home" ? "Add resident" : "Add worker"}
                onSelect={(id) => (section === "home" ? setPerson(id) : openWork(id))}
              />
            )}
            {section === "access" && (
              <>
                {!managers ? (
                  <div className={`${P}-venue-zone-picker`}>
                    <VenueZoneRow name="Managers" onOpen={() => setManagers(true)} />
                    {zones.map((zone) => (
                      <VenueZoneRow key={zone.id} name={zone.name || "Zone"} onOpen={() => onZone(zone.id)} />
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="villages-manage-form">
                      {people.map((row) => (
                        <label className="villages-manage-check" key={row.id}>
                          <input
                            autoComplete="off"
                            type="checkbox"
                            checked={access.managerIds.includes(row.id)}
                            onChange={(e) =>
                              onPatch({
                                ...venue,
                                access: {
                                  ...access,
                                  managerIds: e.target.checked
                                    ? [...access.managerIds, row.id]
                                    : access.managerIds.filter((id) => id !== row.id),
                                },
                              })
                            }
                          />
                          {row.name}
                        </label>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            {section === "building" && <div className="villages-manage-form">{children}</div>}
          </>
        )}
      </fieldset>
    </section>
  );
}
