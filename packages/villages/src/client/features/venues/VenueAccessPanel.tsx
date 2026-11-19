import { useState } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { AccessCommand, VisitorHours, ZoneVisitorHours } from "../../../shared/helpers/venue-access.js";
import { messageFrom } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { VenueScreenController } from "./screen-contracts.js";

const week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
type Zone = NonNullable<VillageVenue["zones"]>[number];
type Details<T = AccessCommand> = T extends AccessCommand
  ? Omit<T, "operationId" | "expectedRevision" | "zoneId">
  : never;

function HoursEditor({ hours, change }: { hours: VisitorHours; change: (value: VisitorHours) => void }) {
  return (
    <div className="villages-access-hours">
      {hours.map((window, index) => (
        <fieldset key={index}>
          <legend>Hours {index + 1}</legend>
          <div className="villages-access-days">
            {week.map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={window.days.includes(day)}
                  onChange={(event) => {
                    const days = event.target.checked
                      ? [...window.days, day]
                      : window.days.filter((value) => value !== day);
                    change(hours.map((item, row) => (row === index ? { ...item, days } : item)));
                  }}
                />
                {day.slice(0, 3)}
              </label>
            ))}
          </div>
          <label>
            Opens{" "}
            <input
              type="time"
              value={window.start}
              onChange={(event) =>
                change(hours.map((item, row) => (row === index ? { ...item, start: event.target.value } : item)))
              }
            />
          </label>
          <label>
            Closes{" "}
            <input
              type="time"
              value={window.end}
              onChange={(event) =>
                change(hours.map((item, row) => (row === index ? { ...item, end: event.target.value } : item)))
              }
            />
          </label>
          <button type="button" onClick={() => change(hours.filter((_, row) => row !== index))}>
            Remove hours
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={hours.length >= 28}
        onClick={() => change([...hours, { days: week, start: "09:00", end: "17:00" }])}
      >
        Add hours
      </button>
    </div>
  );
}

export function VenueAccessPanel({
  place,
  zone,
  controller,
  onSelect,
  onClose,
}: {
  place: VillageVenue;
  zone: Zone | undefined;
  controller: VenueScreenController;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const view = zone?.accessView;
  const policy = view?.policy;
  const [mode, setMode] = useState(policy?.mode ?? "public");
  const [hours, setHours] = useState<ZoneVisitorHours>(
    policy?.visitorHours ?? place.accessView?.visitorHours ?? "always",
  );
  const [guest, setGuest] = useState("");
  const [duration, setDuration] = useState<"this" | "next" | "standing">("next");
  const [escort, setEscort] = useState(false);
  const [afterHours, setAfterHours] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const canManage = zone ? !!policy : !!place.accessView?.canManage;
  const thisVisit = controller.room?.placeId === place.id && controller.room.status === "active";
  const people = controller.snapshot.villagers;
  const save = async (command: Details, result: string) => {
    if (busy || !place.accessView) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const applied = await controller.changeVenueAccess(place.id, {
        ...command,
        operationId: createVillagesClientId(),
        expectedRevision: place.accessView.revision,
        zoneId: zone?.id ?? null,
      });
      if (applied) setNotice(result);
    } catch (cause) {
      setError(messageFrom(cause, "Access could not be saved."));
    } finally {
      setBusy(false);
    }
  };
  const validHours = !Array.isArray(hours) || hours.every((row) => row.days.length && row.start && row.end);
  const availableZones =
    place.zones?.filter((row) => row.accessView?.decision.canManage || row.accessView?.decision.canInvite) ?? [];
  return (
    <section className={`${ELEMENT_TAG}-venue-manage villages-access-panel`} aria-label="Venue access">
      <div className={`${ELEMENT_TAG}-venue-manage-heading`}>
        <h2>Access</h2>
        <button type="button" disabled={busy} className={`${ELEMENT_TAG}-venue-back`} onClick={onClose}>
          ← Manage
        </button>
      </div>
      <label>
        Scope{" "}
        <select
          aria-label="Access scope"
          disabled={busy}
          value={zone?.id ?? ""}
          onChange={(event) => onSelect(event.target.value)}
        >
          {place.accessView?.canManage && <option value="">Venue hours</option>}
          {availableZones.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </label>
      {canManage && (
        <fieldset disabled={busy}>
          <legend>Visitor rules</legend>
          {zone && (
            <label>
              Visitors{" "}
              <select
                value={mode}
                onChange={(event) => setMode(event.target.value === "public" ? "public" : "permission-required")}
              >
                <option value="public">Public</option>
                <option value="permission-required">By permission</option>
              </select>
            </label>
          )}
          <label>
            Hours{" "}
            <select
              value={Array.isArray(hours) ? "schedule" : hours}
              onChange={(event) => {
                const value = event.target.value;
                setHours(
                  value === "inherit"
                    ? "inherit"
                    : value === "always"
                      ? "always"
                      : [{ days: week, start: "09:00", end: "17:00" }],
                );
              }}
            >
              {zone && <option value="inherit">Use Venue hours</option>}
              <option value="always">Any time</option>
              <option value="schedule">Set hours</option>
            </select>
          </label>
          {Array.isArray(hours) && <HoursEditor hours={hours} change={setHours} />}
          <button
            type="button"
            disabled={!validHours}
            onClick={() =>
              void save(
                policy
                  ? { action: "zone-policy", policy: { ...policy, mode, visitorHours: hours } }
                  : {
                      action: "venue-policy",
                      managerIds: place.accessView?.managerIds ?? [],
                      visitorHours: Array.isArray(hours) ? hours : null,
                    },
                "Visitor rules saved.",
              )
            }
          >
            Save rules
          </button>
        </fieldset>
      )}
      {view?.decision.canInvite && (
        <fieldset disabled={busy}>
          <legend>Invitations</legend>
          <label>
            Guest{" "}
            <select value={guest} onChange={(event) => setGuest(event.target.value)}>
              <option value="">Choose a Villager</option>
              {people.map((person) => (
                <option key={person.characterId} value={person.characterId}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Duration{" "}
            <select
              value={duration}
              onChange={(event) => {
                const value = event.target.value;
                setDuration(value === "this" || value === "standing" ? value : "next");
              }}
            >
              {thisVisit && <option value="this">This visit</option>}
              <option value="next">Next visit</option>
              <option value="standing">Until withdrawn</option>
            </select>
          </label>
          <label>
            <input type="checkbox" checked={escort} onChange={(event) => setEscort(event.target.checked)} /> Escort
            required
          </label>
          {view.canAllowAfterHours && (
            <label>
              <input type="checkbox" checked={afterHours} onChange={(event) => setAfterHours(event.target.checked)} />{" "}
              Allow after hours
            </label>
          )}
          <button
            type="button"
            disabled={!guest}
            onClick={() =>
              void save(
                {
                  action: "invite",
                  visitorId: guest,
                  duration: duration === "standing" ? "standing" : "visit",
                  ...(duration !== "standing" ? { visitTiming: duration } : {}),
                  accompanied: escort,
                  outsideHours: !!view.canAllowAfterHours && afterHours,
                },
                "Invitation granted.",
              )
            }
          >
            Grant permission
          </button>
          {view.permissions
            ?.filter((grant) => !grant.revoked)
            .map((grant) => (
              <div className="villages-access-grant" key={grant.id}>
                <span>
                  {controller.nameOfCharacter(grant.visitorId)} ·{" "}
                  {grant.duration === "standing" ? "Until withdrawn" : grant.sceneId ? "One visit" : "Next visit"}
                </span>
                <button
                  type="button"
                  onClick={() => void save({ action: "revoke", permissionId: grant.id }, "Invitation withdrawn.")}
                >
                  Withdraw
                </button>
              </div>
            ))}
        </fieldset>
      )}
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
