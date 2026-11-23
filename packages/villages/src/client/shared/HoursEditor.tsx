import type { VisitorHours } from "../../shared/helpers/venue-access.js";
const week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
export function HoursEditor({ hours, change }: { hours: VisitorHours; change: (value: VisitorHours) => void }) {
  return (
    <div className="villages-access-hours">
      {hours.map((window, index) => (
        <fieldset key={index}>
          <legend>Hours {index + 1}</legend>
          <div className="villages-access-days">
            {week.map((day) => (
              <label key={day}>
                <input
                  autoComplete="off"
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
