import type { VisitorHours } from "../../shared/helpers/venue-access.js";
const week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export function HoursEditor({ hours, change }: { hours: VisitorHours; change: (value: VisitorHours) => void }) {
  return (
    <div className="villages-access-hours">
      {hours.map((window, index) => (
        <fieldset key={index} aria-label={`Opening period ${index + 1}`}>
          <div className="villages-hours-period-heading">
            <span>Days</span>
            {hours.length > 1 && (
              <button type="button" onClick={() => change(hours.filter((_, row) => row !== index))}>
                Remove period
              </button>
            )}
          </div>
          <div className="villages-access-days">
            {week.map((day) => (
              <button
                type="button"
                key={day}
                aria-label={day}
                aria-pressed={window.days.includes(day)}
                onClick={() => {
                  const days = !window.days.includes(day)
                    ? [...window.days, day]
                    : window.days.filter((value) => value !== day);
                  change(hours.map((item, row) => (row === index ? { ...item, days } : item)));
                }}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <label>
            Opens{" "}
            <input
              autoComplete="off"
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
              autoComplete="off"
              type="time"
              value={window.end}
              onChange={(event) =>
                change(hours.map((item, row) => (row === index ? { ...item, end: event.target.value } : item)))
              }
            />
          </label>
        </fieldset>
      ))}
      <button
        type="button"
        disabled={hours.length >= 7}
        onClick={() => change([...hours, { days: week, start: "09:00", end: "17:00" }])}
      >
        Add opening period
      </button>
    </div>
  );
}
