import type { VenueWork } from "../../shared/helpers/venue-work.js";
import { WORK_DAYS, workTime } from "../../shared/helpers/venue-work.js";

export function WorkFields({
  value,
  zones,
  onChange,
}: {
  value: VenueWork;
  zones: { id: string; name?: string }[];
  onChange(value: VenueWork): void;
}) {
  const minute = (text: string) => Number(text.slice(0, 2)) * 60 + Number(text.slice(3));
  return (
    <>
      <label>
        Work activity
        <input
          autoComplete="off"
          maxLength={240}
          value={value.activity}
          onChange={(e) => onChange({ ...value, activity: e.target.value })}
        />
      </label>
      <label>
        Usual work Zone
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
      <fieldset>
        <legend>Work access</legend>
        {zones.map((zone) => (
          <label key={zone.id}>
            <input
              autoComplete="off"
              type="checkbox"
              checked={value.accessZoneIds.includes(zone.id)}
              onChange={(e) =>
                onChange({
                  ...value,
                  accessZoneIds: e.target.checked
                    ? [...value.accessZoneIds, zone.id]
                    : value.accessZoneIds.filter((id) => id !== zone.id),
                })
              }
            />
            {zone.name || "Zone"}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Workdays</legend>
        <div className="villages-access-days">
          {WORK_DAYS.map((day) => (
            <label key={day}>
              <input
                autoComplete="off"
                type="checkbox"
                checked={value.days.includes(day)}
                onChange={(e) =>
                  onChange({
                    ...value,
                    days: e.target.checked ? [...value.days, day] : value.days.filter((row) => row !== day),
                  })
                }
              />
              {day.slice(0, 3)}
            </label>
          ))}
        </div>
      </fieldset>
      <label>
        Starts
        <input
          autoComplete="off"
          type="time"
          value={workTime(value.startMinute)}
          onChange={(e) => onChange({ ...value, startMinute: minute(e.target.value) })}
        />
      </label>
      <label>
        Ends
        <input
          autoComplete="off"
          type="time"
          value={workTime(value.endMinute)}
          onChange={(e) => onChange({ ...value, endMinute: minute(e.target.value) })}
        />
      </label>
    </>
  );
}
