import { useState } from "react";
import type { SetupVenueDraft } from "../../shared/types.js";
import type { ZoneVisitorHours } from "../../../shared/helpers/venue-access.js";
import { HoursEditor } from "../../shared/HoursEditor.js";
import { foundingAccess } from "./FoundingPeople.js";
import { draftZonePolicy } from "./villages-founding-zones.js";
import { foundingHomeMembers, foundingSleepZones } from "./founding-homes.js";

export function FoundingAccess({
  venue,
  zoneId,
  onPatch,
  disabled,
}: {
  venue: SetupVenueDraft;
  zoneId?: string;
  onPatch(venue: SetupVenueDraft): void;
  disabled: boolean;
}) {
  const access = foundingAccess(venue);
  const personal = !!venue.privateSpaces?.some((row) => row.id === zoneId);
  const zone = [...(venue.spaces ?? []), ...(venue.privateSpaces ?? [])].find((row) => row.id === zoneId);
  const policy = zone ? (zone.access ?? draftZonePolicy(venue, zone, personal)) : undefined;
  const initialHours = policy?.visitorHours ?? access.visitorHours ?? "always";
  const [hours, setHours] = useState<ZoneVisitorHours>(initialHours);
  const [mode, setMode] = useState(policy?.mode ?? "public");
  const [error, setError] = useState("");
  const save = () => {
    const key = personal ? "privateSpaces" : "spaces";
    const candidate =
      zone && policy
        ? {
            ...venue,
            [key]: venue[key]?.map((row) =>
              row.id === zone.id ? { ...row, access: { ...policy, mode, visitorHours: hours } } : row,
            ),
          }
        : { ...venue, access: { ...access, visitorHours: Array.isArray(hours) ? hours : null } };
    if (
      foundingHomeMembers(venue).some((id) => {
        const sleep = venue.destinations?.[id]?.sleep;
        return (
          sleep &&
          foundingSleepZones(venue, id).some((row) => row.id === sleep) &&
          !foundingSleepZones(candidate, id).some((row) => row.id === sleep)
        );
      })
    ) {
      setError("Keep a route to the assigned sleeping Zone.");
      return;
    }
    onPatch(candidate);
    setError("");
  };
  if (zoneId === "exterior") return <p>Public</p>;
  return (
    <section className="villages-manage" aria-label="Venue access">
      <fieldset disabled={disabled} className="villages-manage-form">
        {zone && (
          <label>
            Entry
            <select
              aria-label="Entry"
              value={mode}
              onChange={(e) => setMode(e.target.value === "public" ? "public" : "permission-required")}
            >
              <option value="public">Public</option>
              <option value="permission-required">By permission</option>
            </select>
          </label>
        )}
        <label>
          Hours
          <select
            aria-label="Hours"
            value={Array.isArray(hours) ? "schedule" : hours}
            onChange={(e) =>
              setHours(
                e.target.value === "inherit"
                  ? "inherit"
                  : e.target.value === "always"
                    ? "always"
                    : [
                        {
                          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                          start: "09:00",
                          end: "17:00",
                        },
                      ],
              )
            }
          >
            {zone && <option value="inherit">Use Venue hours</option>}
            <option value="always">Any time</option>
            <option value="schedule">Set hours</option>
          </select>
        </label>
        {hours === "inherit" && (
          <p>
            {access.visitorHours
              ?.map((row) => `${row.days.map((day) => day.slice(0, 3)).join(", ")} ${row.start}–${row.end}`)
              .join("; ") || "Any time"}
          </p>
        )}
        {Array.isArray(hours) && <HoursEditor hours={hours} change={setHours} />}
        {error && <p role="alert">{error}</p>}
        <div className="villages-manage-actions">
          <button
            type="button"
            onClick={() => {
              setHours(initialHours);
              setMode(policy?.mode ?? "public");
              setError("");
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="villages-manage-primary"
            disabled={Array.isArray(hours) && hours.some((row) => !row.days.length || !row.start || !row.end)}
            onClick={save}
          >
            Save access
          </button>
        </div>
      </fieldset>
    </section>
  );
}
