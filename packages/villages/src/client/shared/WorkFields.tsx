import { WORK_DAYS, workTime, type VenueWork } from "../../shared/helpers/venue-work.js";

export function initialVenueWork(characterId: string, zones: { id: string }[]): VenueWork {
  return {
    characterId,
    activity: "Working",
    zoneId: zones[0]?.id ?? "",
    accessZoneIds: zones[0] ? [zones[0].id] : [],
    days: WORK_DAYS.slice(0, 5),
    startMinute: 540,
    endMinute: 1020,
  };
}

export function WorkFields({
  value,
  zones,
  onChange,
  fixedZone = false,
}: {
  value: VenueWork;
  zones: { id: string; name?: string }[];
  onChange(value: VenueWork): void;
  fixedZone?: boolean;
}) {
  const minute = (text: string) => Number(text.slice(0, 2)) * 60 + Number(text.slice(3));
  return (
    <div className="villages-work-fields">
      <label>
        Activity
        <input
          aria-label="Work activity"
          autoComplete="off"
          maxLength={240}
          value={value.activity}
          onChange={(e) => onChange({ ...value, activity: e.target.value })}
        />
      </label>
      {!fixedZone && (
        <label>
          Usual Zone
          <select
            aria-label="Usual work Zone"
            value={value.zoneId}
            onChange={(e) =>
              onChange({
                ...value,
                zoneId: e.target.value,
                accessZoneIds: [...new Set([...value.accessZoneIds, e.target.value])],
              })
            }
          >
            <option value="">Choose a Zone</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name || "Zone"}
              </option>
            ))}
          </select>
        </label>
      )}
      <fieldset className="villages-work-days">
        <legend>Days</legend>
        <div className="villages-work-day-buttons">
          {WORK_DAYS.map((day) => (
            <button
              type="button"
              key={day}
              aria-label={day}
              aria-pressed={value.days.includes(day)}
              onClick={() =>
                onChange({
                  ...value,
                  days: value.days.includes(day) ? value.days.filter((row) => row !== day) : [...value.days, day],
                })
              }
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="villages-work-times">
        <label>
          Starts
          <input
            autoComplete="off"
            type="time"
            value={workTime(value.startMinute)}
            onChange={(e) => {
              if (e.target.value) onChange({ ...value, startMinute: minute(e.target.value) });
            }}
          />
        </label>
        <label>
          Ends
          <input
            autoComplete="off"
            type="time"
            value={value.endMinute === 1440 ? "00:00" : workTime(value.endMinute)}
            onChange={(e) => {
              if (e.target.value) onChange({ ...value, endMinute: minute(e.target.value) || 1440 });
            }}
          />
        </label>
      </div>
      <fieldset className="villages-work-access">
        <legend>Work access</legend>
        {zones.map((zone) => (
          <label className="villages-manage-check" key={zone.id}>
            <input
              autoComplete="off"
              type="checkbox"
              checked={value.accessZoneIds.includes(zone.id)}
              disabled={zone.id === value.zoneId}
              onChange={(e) =>
                onChange({
                  ...value,
                  accessZoneIds: e.target.checked
                    ? [...value.accessZoneIds, zone.id]
                    : value.accessZoneIds.filter((id) => id !== zone.id),
                })
              }
            />
            <span>{zone.name || "Zone"}</span>
          </label>
        ))}
      </fieldset>
      <label className="villages-manage-check villages-work-invite">
        <input
          type="checkbox"
          autoComplete="off"
          checked={!!value.inviteGuests}
          onChange={(e) => onChange({ ...value, inviteGuests: e.target.checked })}
        />
        Invite guests to work Zones
      </label>
    </div>
  );
}
