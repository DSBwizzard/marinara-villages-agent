import { zoneVisitingHours } from "../../../shared/helpers/venue-access.js";
import { HoursEditor } from "../../shared/HoursEditor.js";
import { useState, useLayoutEffect, type ReactNode } from "react";
import type { VillageVenue } from "../../../shared/contracts/village.js";
import type { AccessCommand, ZoneVisitorHours } from "../../../shared/helpers/venue-access.js";
import { messageFrom } from "../../shared/api.js";
import { ELEMENT_TAG } from "../../shared/constants.js";
import { createVillagesClientId } from "../../shared/request-id.js";
import type { VenueScreenController } from "./screen-contracts.js";

const week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
type Zone = NonNullable<VillageVenue["zones"]>[number];
type Details<T = AccessCommand> = T extends AccessCommand
  ? Omit<T, "operationId" | "expectedRevision" | "zoneId">
  : never;

export function VenueAccessPanel({
  place,
  zone,
  controller,
  onClose,
  onBusyChange,
  invitationsOnly = false,
  children,
}: {
  place: VillageVenue;
  zone: Zone | undefined;
  controller: VenueScreenController;
  onClose: () => void;
  onBusyChange(busy: boolean): void;
  invitationsOnly?: boolean;
  children?: ReactNode;
}) {
  const view = zone?.accessView;
  const policy = view?.policy;
  const [mode, setMode] = useState(policy?.mode ?? "public");
  const [hours, setHours] = useState<Exclude<ZoneVisitorHours, "inherit">>(
    zoneVisitingHours(policy?.visitorHours, place.accessView?.visitorHours),
  );
  const [guest, setGuest] = useState("");
  const [duration, setDuration] = useState<"this" | "next" | "standing">("next");
  const [escort, setEscort] = useState(false);
  const [afterHours, setAfterHours] = useState(false);
  const [busy, setBusy] = useState(false);
  useLayoutEffect(() => {
    onBusyChange(busy);
    return () => onBusyChange(false);
  }, [busy, onBusyChange]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const canManage = !!zone && zone.kind !== "exterior" && !!policy;
  const thisVisit = controller.room?.placeId === place.id && controller.room.status === "active";
  const people = controller.snapshot.villagers;
  const save = async (command: Details, result: string) => {
    if (busy || !place.accessView || !zone) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const applied = await controller.changeVenueAccess(place.id, {
        ...command,
        operationId: createVillagesClientId(),
        expectedRevision: place.accessView.revision,
        zoneId: zone.id,
      });
      if (applied) {
        if (invitationsOnly) setNotice(result);
        else onClose();
      }
    } catch (cause) {
      setError(messageFrom(cause, "Could not save visitor rules."));
    } finally {
      setBusy(false);
    }
  };
  const validHours = !Array.isArray(hours) || hours.every((row) => row.days.length && row.start && row.end);
  return (
    <section className={ELEMENT_TAG + "-venue-manage villages-manage villages-access-panel"} aria-label="Visitors">
      {!invitationsOnly && !canManage && zone && (
        <dl className="villages-manage-details">
          <dt>Entry</dt>
          <dd>
            {zone.kind === "exterior" || view?.decision.mode === "public" ? "Open to everyone" : "Invitation only"}
          </dd>
        </dl>
      )}
      {!invitationsOnly && canManage && (
        <fieldset disabled={busy}>
          {zone && (
            <label>
              Entry{" "}
              <select
                aria-label="Entry"
                value={mode}
                onChange={(event) => setMode(event.target.value === "public" ? "public" : "permission-required")}
              >
                <option value="public">Open to everyone</option>
                <option value="permission-required">Invitation only</option>
              </select>
            </label>
          )}
          <label>
            Hours{" "}
            <select
              aria-label="Hours"
              value={Array.isArray(hours) ? "schedule" : hours}
              onChange={(event) => {
                const value = event.target.value;
                setHours(value === "always" ? "always" : [{ days: week, start: "09:00", end: "17:00" }]);
              }}
            >
              <option value="always">Any time</option>
              <option value="schedule">Set hours</option>
            </select>
          </label>
          {Array.isArray(hours) && <HoursEditor hours={hours} change={setHours} />}
          {children}
          <div className="villages-manage-actions">
            <button
              type="button"
              onClick={() => {
                setMode(policy?.mode ?? "public");
                setHours(zoneVisitingHours(policy?.visitorHours, place.accessView?.visitorHours));
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="villages-manage-primary"
              disabled={!validHours}
              onClick={() => {
                if (!policy) return;
                void save(
                  { action: "zone-policy", policy: { ...policy, mode, visitorHours: hours } },
                  "Visitor rules saved.",
                );
              }}
            >
              Save visitor rules
            </button>
          </div>
        </fieldset>
      )}
      {invitationsOnly && view?.decision.canInvite && (
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
            <input
              autoComplete="off"
              type="checkbox"
              checked={escort}
              onChange={(event) => setEscort(event.target.checked)}
            />{" "}
            Escort required
          </label>
          {view.canAllowAfterHours && (
            <label>
              <input
                autoComplete="off"
                type="checkbox"
                checked={afterHours}
                onChange={(event) => setAfterHours(event.target.checked)}
              />{" "}
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
            Invite
          </button>
          {view.permissions
            ?.filter((grant) => !grant.revoked)
            .map((grant) => (
              <div className="villages-access-grant" key={grant.id}>
                <span>
                  {controller.nameOfCharacter(grant.visitorId)},{" "}
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
      {!invitationsOnly && !canManage && children}
      {notice && <p role="status">{notice}</p>}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
