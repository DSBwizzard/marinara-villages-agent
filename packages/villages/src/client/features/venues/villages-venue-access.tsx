import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { AccessCommand, VisitorHours, ZoneAccessPolicy } from "../../../shared/helpers/venue-access.js";
import { createVillagesClientId } from "../scenes/villages-venue-send";
import { useState } from "react";

type Person = { id: string; name: string };
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export function PeopleFields({
  label,
  value,
  people,
  onChange,
}: {
  label: string;
  value: string[];
  people: Person[];
  onChange(value: string[]): void;
}) {
  return (
    <fieldset>
      <legend>{label}</legend>
      {people.map((person) => (
        <label key={person.id} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={value.includes(person.id)}
            onChange={(event) =>
              onChange(event.target.checked ? [...value, person.id] : value.filter((id) => id !== person.id))
            }
          />{" "}
          {person.name}
        </label>
      ))}
    </fieldset>
  );
}
export function VisitorHoursFields({
  value,
  onChange,
}: {
  value: VisitorHours | null;
  onChange(value: VisitorHours | null): void;
}) {
  return (
    <fieldset>
      <legend>Visitor hours</legend>
      <select
        aria-label="Visitor hours"
        value={value === null ? "always" : "weekly"}
        onChange={(event) => onChange(event.target.value === "always" ? null : [])}
      >
        <option value="always">No time restriction</option>
        <option value="weekly">Weekly hours</option>
      </select>
      {value?.map((row, index) => (
        <fieldset key={index}>
          <legend>Opening {index + 1}</legend>
          {weekdays.map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                checked={row.days.includes(day)}
                onChange={(event) =>
                  onChange(
                    value.map((item, i) =>
                      i === index
                        ? {
                            ...item,
                            days: event.target.checked ? [...item.days, day] : item.days.filter((name) => name !== day),
                          }
                        : item,
                    ),
                  )
                }
              />
              {day.slice(0, 3)}{" "}
            </label>
          ))}
          <label>
            From{" "}
            <input
              type="time"
              value={row.start}
              onChange={(event) =>
                onChange(value.map((item, i) => (i === index ? { ...item, start: event.target.value } : item)))
              }
            />
          </label>
          <label>
            Until{" "}
            <input
              type="time"
              value={row.end}
              onChange={(event) =>
                onChange(value.map((item, i) => (i === index ? { ...item, end: event.target.value } : item)))
              }
            />
          </label>
          <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))}>
            Remove opening
          </button>
        </fieldset>
      ))}
      {value !== null ? (
        <>
          <button
            type="button"
            onClick={() => onChange([...(value ?? []), { days: [...weekdays], start: "09:00", end: "17:00" }])}
          >
            Add opening
          </button>
          <p>
            Overnight hours continue into the next day. No openings means closed to visitors. Members can enter outside
            hours.
          </p>
        </>
      ) : null}
    </fieldset>
  );
}
export function ZonePolicyFields({
  value,
  people,
  onChange,
}: {
  value: ZoneAccessPolicy;
  people: Person[];
  onChange(value: ZoneAccessPolicy): void;
}) {
  const patch = (next: Partial<ZoneAccessPolicy>) => onChange({ ...value, ...next });
  return (
    <div>
      <label>
        Zone access{" "}
        <select
          aria-label="Zone access"
          value={value.mode}
          onChange={(event) => patch({ mode: event.target.value as ZoneAccessPolicy["mode"] })}
        >
          <option value="public">Public · subject to hours and bans</option>
          <option value="permission-required">Permission required</option>
        </select>
      </label>
      <p>
        Access describes who may enter. “Used for” describes what happens here. Either access level can be indoors or
        outdoors.
      </p>
      <label>
        <input
          type="checkbox"
          checked={value.managerIds === null}
          onChange={(event) => patch({ managerIds: event.target.checked ? null : [] })}
        />{" "}
        Inherit Venue managers
      </label>
      {value.managerIds !== null ? (
        <PeopleFields
          label="Manages access"
          value={value.managerIds}
          people={people}
          onChange={(managerIds) => patch({ managerIds })}
        />
      ) : null}
      <PeopleFields
        label="Designated members · may enter outside hours"
        value={value.memberIds}
        people={people}
        onChange={(memberIds) => patch({ memberIds })}
      />
      {(["residents", "workers"] as const).map((role) => (
        <label key={role} style={{ display: "block" }}>
          <input
            type="checkbox"
            checked={value.memberRoles.includes(role)}
            onChange={(event) =>
              patch({
                memberRoles: event.target.checked
                  ? [...value.memberRoles, role]
                  : value.memberRoles.filter((entry) => entry !== role),
              })
            }
          />{" "}
          Assigned {role} are members
        </label>
      ))}
      <PeopleFields
        label="May invite guests"
        value={value.inviterIds}
        people={people}
        onChange={(inviterIds) => patch({ inviterIds })}
      />
      <label>
        <input
          type="checkbox"
          checked={value.accompanied}
          onChange={(event) => patch({ accompanied: event.target.checked })}
        />{" "}
        Guests must be accompanied by their named inviter
      </label>
      <label>
        Zone visitor hours{" "}
        <select
          aria-label="Zone visitor hours"
          value={typeof value.visitorHours === "string" ? value.visitorHours : "weekly"}
          onChange={(event) =>
            patch({ visitorHours: event.target.value === "weekly" ? [] : (event.target.value as "inherit" | "always") })
          }
        >
          <option value="inherit">Inherit Venue visitor hours</option>
          <option value="always">No time restriction</option>
          <option value="weekly">Own weekly hours</option>
        </select>
      </label>
      {Array.isArray(value.visitorHours) ? (
        <VisitorHoursFields
          value={value.visitorHours}
          onChange={(visitorHours) => patch({ visitorHours: visitorHours ?? "always" })}
        />
      ) : null}
      <fieldset>
        <legend>Regular visitors · opt in</legend>
        <p>
          These rules use the named inviter’s relationship with the visitor. Explicit standing invitations remain until
          withdrawn.
        </p>
        {value.regularVisitors.map((rule, index) => (
          <div key={index}>
            <select
              aria-label="Regular visitor inviter"
              value={rule.inviterId}
              onChange={(event) =>
                patch({
                  regularVisitors: value.regularVisitors.map((item, i) =>
                    i === index ? { ...item, inviterId: event.target.value } : item,
                  ),
                })
              }
            >
              <option value="">Choose an authorized inviter</option>
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Regular visitor relationship"
              value={rule.relationship}
              onChange={(event) =>
                patch({
                  regularVisitors: value.regularVisitors.map((item, i) =>
                    i === index ? { ...item, relationship: event.target.value as "friend" | "close" } : item,
                  ),
                })
              }
            >
              <option value="friend">Friends</option>
              <option value="close">Close friends</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={rule.accompanied}
                onChange={(event) =>
                  patch({
                    regularVisitors: value.regularVisitors.map((item, i) =>
                      i === index ? { ...item, accompanied: event.target.checked } : item,
                    ),
                  })
                }
              />
              Must accompany
            </label>
            <button
              type="button"
              onClick={() => patch({ regularVisitors: value.regularVisitors.filter((_, i) => i !== index) })}
            >
              Remove rule
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            patch({
              regularVisitors: [
                ...value.regularVisitors,
                {
                  inviterId: value.inviterIds[0] ?? value.managerIds?.[0] ?? "",
                  relationship: "friend",
                  accompanied: false,
                },
              ],
            })
          }
        >
          Add regular-visitor rule
        </button>
      </fieldset>
    </div>
  );
}
type Action = AccessCommand extends infer C
  ? C extends AccessCommand
    ? Omit<C, "operationId" | "expectedRevision" | "zoneId">
    : never
  : never;
export function VenueAccessPanel({
  venue,
  zoneId,
  people,
  onCommand,
}: {
  venue: VillageVenue;
  zoneId: string;
  people: Person[];
  onCommand(command: AccessCommand): Promise<void>;
}) {
  const zone = venue.zones?.find((row) => row.id === zoneId),
    view = zone?.accessView,
    venueView = venue.accessView;
  const [policy, setPolicy] = useState(view?.policy);
  const [managers, setManagers] = useState(venueView?.managerIds ?? []);
  const [hours, setHours] = useState(venueView?.visitorHours ?? null);
  const [visitorId, setVisitorId] = useState("");
  const [destinations, setDestinations] = useState(venue.destinations ?? {});
  const [recoveryManagers, setRecoveryManagers] = useState<string[]>([]);
  const [duration, setDuration] = useState<"visit" | "standing">("visit");
  const [accompanied, setAccompanied] = useState(false),
    [outsideHours, setOutsideHours] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (!view || !venueView) return null;
  const send = async (action: Action, scope: string | null = zoneId) => {
    setBusy(true);
    setError("");
    try {
      await onCommand({
        ...action,
        zoneId: scope,
        expectedRevision: venueView.revision,
        operationId: createVillagesClientId(),
      } as AccessCommand);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Access change failed.");
    } finally {
      setBusy(false);
    }
  };
  const name = (actor: string) => people.find((person) => person.id === actor)?.name ?? actor;
  const personSelect = (
    <label>
      Visitor{" "}
      <select aria-label="Access visitor" value={visitorId} onChange={(event) => setVisitorId(event.target.value)}>
        <option value="">Choose a person</option>
        {people.map((person) => (
          <option key={person.id} value={person.id}>
            {person.name}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section className="villages-scenery-fields">
      <p>
        <strong>
          {view.decision.mode === "unrestricted"
            ? "Unrestricted · 24/7"
            : view.decision.mode === "public"
              ? "Public"
              : "Permission required"}
        </strong>
      </p>
      <details>
        <summary>{view.decision.allowed ? "Your access" : "Why can’t I enter?"}</summary>
        <p>{view.decision.explanation}</p>
        <small>Reason: {view.decision.reason}</small>
      </details>
      {venueView.canRecover ? (
        <p>
          This Venue has no remaining managers.{" "}
          <button
            type="button"
            disabled={busy}
            onClick={() => void send({ action: "recover-managers", managerIds: ["player"] }, null)}
          >
            Take over access management
          </button>
        </p>
      ) : null}
      {view.decision.canRecover ? (
        <details>
          <summary>Restore managers · no current Zone managers</summary>
          <p>
            As Venue manager you may appoint managers to this orphaned Zone. Its other rules and bans remain in effect.
          </p>
          <PeopleFields
            label="New Zone managers"
            people={people}
            value={recoveryManagers}
            onChange={setRecoveryManagers}
          />
          <button
            type="button"
            disabled={busy || !recoveryManagers.length}
            onClick={() => void send({ action: "recover-managers", managerIds: recoveryManagers })}
          >
            Appoint managers
          </button>
        </details>
      ) : null}
      {view.decision.canManage || view.decision.canInvite || venueView.canManage ? (
        <details>
          <summary>Manage access</summary>
          <fieldset disabled={busy}>
            {view.decision.canManage && policy ? (
              <details>
                <summary>Zone policy</summary>
                <ZonePolicyFields value={policy} people={people} onChange={setPolicy} />
                <button type="button" onClick={() => void send({ action: "zone-policy", policy })}>
                  Save Zone policy
                </button>
              </details>
            ) : null}
            {view.decision.canInvite ? (
              <fieldset>
                <legend>Invite someone to this Zone</legend>
                {personSelect}
                <label>
                  Duration{" "}
                  <select
                    value={duration}
                    onChange={(event) => setDuration(event.target.value as "visit" | "standing")}
                  >
                    <option value="visit">One visit · this Venue Scene</option>
                    <option value="standing">Standing · until withdrawn</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={accompanied}
                    onChange={(event) => setAccompanied(event.target.checked)}
                  />
                  I must accompany them
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={outsideHours}
                    onChange={(event) => setOutsideHours(event.target.checked)}
                  />
                  Approve entry outside visitor hours
                </label>
                <button
                  type="button"
                  disabled={!visitorId}
                  onClick={() => void send({ action: "invite", visitorId, duration, accompanied, outsideHours })}
                >
                  Issue invitation
                </button>
              </fieldset>
            ) : null}
            {view.permissions
              ?.filter((grant) => !grant.revoked)
              .map((grant) => (
                <p key={grant.id}>
                  {name(grant.visitorId)} · {grant.duration === "standing" ? "Standing invitation" : "One visit"}
                  <button type="button" onClick={() => void send({ action: "revoke", permissionId: grant.id })}>
                    Withdraw
                  </button>
                  {(view.bans ?? []).some((ban) => ban.active && ban.visitorId === grant.visitorId) ? (
                    <button
                      type="button"
                      onClick={() =>
                        void send({
                          action: "exception",
                          permissionId: grant.id,
                          banIds: (view.bans ?? [])
                            .filter((ban) => ban.active && ban.visitorId === grant.visitorId)
                            .map((ban) => ban.id),
                        })
                      }
                    >
                      Approve this invitation as a ban exception
                    </button>
                  ) : null}
                </p>
              ))}
            {view.decision.canManage ? (
              <fieldset>
                <legend>Zone bans</legend>
                {personSelect}
                <p>
                  Refusing entry or asking someone to leave applies to the current visit. A lasting ban is a separate
                  decision.
                </p>
                <button
                  type="button"
                  disabled={!visitorId}
                  onClick={() => void send({ action: "refuse-entry", visitorId })}
                >
                  Refuse entry for this visit
                </button>
                <button
                  type="button"
                  disabled={!visitorId}
                  onClick={() => void send({ action: "leave-now", visitorId })}
                >
                  Ask to leave now
                </button>
                <p>A ban prohibits this person even if they are staff, a friend, or ordinarily invited.</p>
                <button type="button" disabled={!visitorId} onClick={() => void send({ action: "ban", visitorId })}>
                  Ban from this Zone
                </button>
                {view.bans
                  ?.filter((ban) => ban.active)
                  .map((ban) => (
                    <p key={ban.id}>
                      {name(ban.visitorId)}{" "}
                      <button type="button" onClick={() => void send({ action: "lift-ban", banId: ban.id })}>
                        Lift Zone ban
                      </button>
                    </p>
                  ))}
              </fieldset>
            ) : null}
            {venueView.canManage ? (
              <details>
                <summary>Venue-wide policy and bans</summary>
                <p>
                  Venue bans cover every Zone except Entrance, including Zones added later. Separately managed Zones
                  keep their own entry rules.
                </p>
                <PeopleFields label="Manages Venue access" people={people} value={managers} onChange={setManagers} />
                <VisitorHoursFields value={hours} onChange={setHours} />
                <button
                  type="button"
                  onClick={() => void send({ action: "venue-policy", managerIds: managers, visitorHours: hours }, null)}
                >
                  Save Venue policy
                </button>
                {personSelect}
                <button
                  type="button"
                  disabled={!visitorId}
                  onClick={() => void send({ action: "ban", visitorId }, null)}
                >
                  Ban from Venue interiors
                </button>
                {venueView.bans
                  ?.filter((ban) => ban.active)
                  .map((ban) => (
                    <p key={ban.id}>
                      {name(ban.visitorId)}{" "}
                      <button type="button" onClick={() => void send({ action: "lift-ban", banId: ban.id }, null)}>
                        Lift Venue ban
                      </button>
                      {venueView.exceptionInvitations
                        ?.filter((grant) => grant.visitorId === ban.visitorId && grant.zoneId === zoneId)
                        .map((grant) => (
                          <button
                            key={grant.id}
                            type="button"
                            onClick={() =>
                              void send({ action: "exception", permissionId: grant.id, banIds: [ban.id] }, null)
                            }
                          >
                            Approve {zone?.name} invitation as exception
                          </button>
                        ))}
                    </p>
                  ))}
              </details>
            ) : null}
          </fieldset>
          <details>
            <summary>Home, sleeping, and work destinations</summary>
            <p>These select where activities happen. They do not grant access.</p>
            {people
              .filter((person) =>
                person.id === "player"
                  ? venue.occupancy.playerHome
                  : venue.residentIds?.includes(person.id) || venue.workerIds?.includes(person.id),
              )
              .map((person) => (
                <fieldset key={person.id} disabled={busy || (!venueView.canManage && person.id !== "player")}>
                  <legend>{person.name}</legend>
                  {(["home", "sleep", "work"] as const).map((role) => (
                    <label key={role}>
                      {role === "sleep" ? "Sleeping Zone" : role === "work" ? "Work Zone" : "Home Zone"}
                      <select
                        aria-label={person.name + " " + role + " Zone"}
                        value={destinations[person.id]?.[role] ?? ""}
                        onChange={(event) =>
                          setDestinations({
                            ...destinations,
                            [person.id]: { ...destinations[person.id], [role]: event.target.value || undefined },
                          })
                        }
                      >
                        <option value="">Choose when more than one Zone is suitable</option>
                        {venue.zones
                          ?.filter(
                            (zone) =>
                              zone.kind !== "exterior" &&
                              zone.venueClass === (role === "work" ? "workplace" : "residence") &&
                              (!zone.ownerId || zone.ownerId === person.id),
                          )
                          .map((zone) => (
                            <option key={zone.id} value={zone.id}>
                              {zone.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      void send({ action: "destinations", visitorId: person.id, ...destinations[person.id] }, null)
                    }
                  >
                    Save destinations
                  </button>
                </fieldset>
              ))}
          </details>
          {error ? <p role="alert">{error} Reload the Venue to refresh access details.</p> : null}
          <details>
            <summary>Access history · revision {venueView.revision}</summary>
            {[...(venueView.changes ?? []), ...(view.changes ?? [])]
              .sort((a, b) => b.revision - a.revision)
              .slice(0, 12)
              .map((change) => (
                <p key={change.id}>
                  {name(change.actorId)} · {change.action} · {new Date(change.at).toLocaleString()}
                </p>
              ))}
          </details>
        </details>
      ) : null}
    </section>
  );
}
