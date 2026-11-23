import { useState } from "react";
import type { SetupVenueDraft } from "../../shared/types.js";
import { foundingAccess } from "./founding-access.js";
import { venueWorkSchema, type VenueWork } from "../../../shared/helpers/venue-work.js";
import { WorkFields, initialVenueWork } from "../../shared/WorkFields.js";
import { type VenuePerson } from "../venues/VenueManage.js";
import { HomeFields } from "../../shared/HomeFields.js";
import {
  ArrangementRoster,
  VisitorsScope,
  arrangementIds,
  arrangementLabel,
  type ArrangementPage,
} from "../venues/ArrangementNavigation.js";
import { VenueZoneRow } from "../../shared/VenueNavigation.js";
import { FoundingAccess } from "./FoundingAccess.js";
import { draftZonePolicy } from "./villages-founding-zones.js";
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

function VisitorRoleEditor({
  active,
  onSave,
  onBack,
  readOnly = false,
  label,
}: {
  active: boolean;
  readOnly?: boolean;
  label: string;
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
        {label}
      </label>
      <div className="villages-manage-actions">
        <button type="button" onClick={onBack}>
          Cancel
        </button>
        <button
          type="button"
          className="villages-manage-primary"
          disabled={readOnly || manages === active}
          onClick={() => {
            onSave(manages);
            onBack();
          }}
        >
          Save visitor rules
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
  const back = () => onPage({ kind: page.kind, zoneId: page.zoneId });
  const access = foundingAccess(venue);
  const policyZoneId = page.kind === "rules" || page.kind === "invite" ? page.zoneId : zoneId;
  const personal = !!venue.privateSpaces?.some((row) => row.id === policyZoneId);
  const zone = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((row) => row.id === policyZoneId);
  const policy = zone ? (zone.access ?? draftZonePolicy(venue, zone, personal)) : undefined;
  const managers = policy ? (policy.managerIds ?? access.managerIds) : access.managerIds;
  if (page.kind === "visitors")
    return (
      <section className="villages-manage">
        {!zoneId && (
          <VisitorsScope
            place={venue}
            zoneId={page.zoneId}
            disabled={disabled}
            onZone={(zoneId) => onPage({ ...page, zoneId })}
          />
        )}
        <FoundingAccess
          key={venue.id + (page.zoneId ?? "venue")}
          venue={venue}
          zoneId={page.zoneId}
          onPatch={onPatch}
          disabled={disabled}
        >
          {page.zoneId !== "exterior" && (
            <nav className="marinara-capability-villages-venue-zone-picker villages-arrangement-summary villages-visitor-roles">
              {(["rules", ...(page.zoneId ? ["invite"] : [])] as const).map((kind: "rules" | "invite") => (
                <VenueZoneRow
                  key={kind}
                  name={arrangementLabel(kind)}
                  accessLabel={String(arrangementIds(venue, kind, page.zoneId).length)}
                  disabled={disabled}
                  onOpen={() => onPage({ ...page, kind })}
                />
              ))}
            </nav>
          )}
        </FoundingAccess>
      </section>
    );
  return (
    <section className="villages-manage" aria-label="Arrangements">
      <fieldset disabled={disabled}>
        {person ? (
          <>
            <h2 className="villages-arrangement-kind">
              {page.kind === "home" ? "Home" : page.kind === "work" ? "Work" : arrangementLabel(page.kind)}
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
              <VisitorRoleEditor
                key={person.id}
                label={arrangementLabel(page.kind)}
                active={
                  page.kind === "invite"
                    ? managers.includes(person.id) || !!policy?.inviterIds.includes(person.id)
                    : managers.includes(person.id)
                }
                readOnly={managers.includes(person.id) && (page.kind === "invite" || managers.length === 1)}
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
                        row.id === zone.id
                          ? {
                              ...row,
                              access: {
                                ...policy,
                                ...(page.kind === "invite"
                                  ? {
                                      inviterIds: active
                                        ? [...new Set([...policy.inviterIds, person.id])]
                                        : policy.inviterIds.filter((id) => id !== person.id),
                                    }
                                  : { managerIds }),
                              },
                            }
                          : row,
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
            zoneId={policyZoneId}
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
