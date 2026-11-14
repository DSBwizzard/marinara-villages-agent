import { useEffect, useState } from "react";
import type { AgendaWeek } from "../../../shared/contracts/agenda.js";
import { invalidatesRead } from "../../shared/api.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { useVillageActivity } from "../../shared/activity.js";

const dayLabel = (date: string) =>
  new Intl.DateTimeFormat(undefined, { timeZone: "UTC", month: "short", day: "numeric" }).format(
    new Date(date + "T12:00:00Z"),
  );
const sourceLabel = { told: "Told you", seen: "Observed", agreed: "Agreed with you" };
type Block = AgendaWeek["days"][number]["blocks"][number];
const periods = ["AM", "PM"] as const;
const periodOf = (minute: number) => (minute % 1440 < 720 ? "AM" : "PM");
const clockLabel = (minute: number) => `${Math.floor(minute / 60) % 12 || 12}:${String(minute % 60).padStart(2, "0")}`;

function blockTime({ source, startMinute, endMinute }: Block, includePeriod = false) {
  const startPeriod = periodOf(startMinute);
  const endPeriod = periodOf(endMinute);
  const start = clockLabel(startMinute);
  if (source === "seen") return includePeriod ? `${start} ${startPeriod}` : start;
  const end = clockLabel(endMinute);
  if (includePeriod && startPeriod !== endPeriod) return `${start} ${startPeriod}–${end} ${endPeriod}`;
  return `${start}–${end}${includePeriod ? ` ${endPeriod}` : ""}`;
}

export function WeeklyAgenda({
  actorId,
  inspect,
  refresh,
  request,
  date,
  onDate,
}: {
  actorId: string;
  inspect: boolean;
  refresh: string;
  request<T>(path: string, options?: RequestInit): Promise<T>;
  date: string | undefined;
  onDate(date: string): void;
}) {
  const [week, setWeek] = useState<AgendaWeek | null>(null);
  const [error, setError] = useState("");
  const [selection, setSelection] = useState<{ date: string; block: Block }>();
  const { visible } = useVillageActivity();
  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    void request<AgendaWeek>(`/agendas?characterId=${encodeURIComponent(actorId)}${inspect ? "&inspect=true" : ""}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        setWeek(result);
        setError("");
      })
      .catch((cause) => {
        if (controller.signal.aborted) return;
        if (invalidatesRead(cause)) setWeek(null);
        setError(cause instanceof Error ? cause.message : "Could not read the Agenda.");
      });
    return () => controller.abort();
  }, [actorId, inspect, refresh, request, visible]);
  if (!week) return <p role="status">{error || "Reading Agenda…"}</p>;
  const day = week.days.find((entry) => entry.date === date) ?? week.days[0];
  const visibleSelection =
    selection?.date === day.date &&
    day.blocks.find(
      (block) => block.startMinute === selection.block.startMinute && block.activity === selection.block.activity,
    );
  return (
    <div className={P + "-day-planner"} role="group" aria-label="Day planner">
      <style>{agendaStyles}</style>
      <div className={P + "-planner-dates"} role="group" aria-label="Days">
        {week.days.map((entry) => (
          <button
            key={entry.date}
            type="button"
            aria-label={entry.weekday + ", " + dayLabel(entry.date)}
            aria-pressed={entry.date === day.date}
            onClick={() => {
              onDate(entry.date);
              setSelection(undefined);
            }}
          >
            {entry.weekday.slice(0, 3)} <span>{Number(entry.date.slice(-2))}</span>
          </button>
        ))}
      </div>
      <div className={P + "-planner-day"} role="group" aria-label={day.weekday + " Agenda"}>
        {periods.map((period) => (
          <div key={period} className={P + "-planner-period"} role="group" aria-label={period}>
            <div className={P + "-planner-period-label"} aria-hidden="true">
              {period}
            </div>
            {day.blocks
              .filter((block) => periodOf(block.startMinute) === period)
              .map((block, index) => (
                <button
                  type="button"
                  key={index}
                  className={P + "-planner-block"}
                  data-source={block.source}
                  data-resting={block.resting}
                  title={`${blockTime(block, true)} · ${block.activity}`}
                  aria-label={[
                    blockTime(block, true),
                    block.activity,
                    block.place,
                    block.source && sourceLabel[block.source],
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  aria-pressed={visibleSelection === block}
                  onClick={() => setSelection(visibleSelection === block ? undefined : { date: day.date, block })}
                >
                  <span className={P + "-planner-time"}>{blockTime(block)}</span>
                  <span>{block.activity}</span>
                </button>
              ))}
          </div>
        ))}
      </div>
      {visibleSelection ? (
        <p className={P + "-planner-detail"} role="status">
          {[
            blockTime(visibleSelection, true),
            visibleSelection.activity,
            visibleSelection.place,
            visibleSelection.source && sourceLabel[visibleSelection.source],
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

const agendaStyles = `
.${P}-day-planner{
 --planner-paper:#282639;--planner-line:#756782;
 --event-fill:#2c514c;--event-edge:#80b7a1;--rest-fill:#40486c;--rest-edge:#9caee7;
 --plan-fill:#665035;--plan-edge:#e7b96a;
 font:400 14px/1.35 var(--notebook-hand);
}
.${P}-desk-workspace[data-theme=day] .${P}-day-planner{
 --planner-paper:#edf4ee;--planner-line:#a0b6ab;
 --event-fill:#c9e4d9;--event-edge:#347963;--rest-fill:#d9dfef;--rest-edge:#5873a2;
 --plan-fill:#f2d9a5;--plan-edge:#a56819;
}
.${P}-planner-dates{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));margin-block-end:8px;border:1px solid var(--planner-line);border-radius:6px;background:var(--planner-paper)}
.${P}-day-planner .${P}-planner-dates button{min-height:32px;padding:2px 0;border:0;border-radius:0;background:transparent;font:600 12px/1.25 var(--notebook-hand)}
.${P}-day-planner .${P}-planner-dates button+button{border-inline-start:1px solid var(--planner-line)}
.${P}-day-planner .${P}-planner-dates button[aria-pressed=true]{background:var(--menu-selected)}
.${P}-day-planner .${P}-planner-dates button:focus-visible{z-index:1;outline-offset:-3px}
.${P}-planner-day{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:12px;padding:4px 8px;background:var(--planner-paper);border:1px solid var(--planner-line);border-radius:6px}
.${P}-planner-period{display:grid;grid-template-columns:max-content minmax(0,1fr);align-content:start}
.${P}-planner-period+.${P}-planner-period{border-inline-start:1px solid var(--planner-line);padding-inline-start:12px}
.${P}-planner-period-label{grid-column:1/-1;font-weight:600;padding:2px 4px;border-block-end:1px solid var(--planner-line)}
.${P}-day-planner button.${P}-planner-block{
 display:grid;grid-column:1/-1;grid-template-columns:subgrid;align-items:baseline;gap:8px;width:100%;min-height:28px;
 border:0;border-block-end:1px solid var(--planner-line);border-inline-start:4px solid var(--event-edge);border-radius:0;
 background:transparent;padding:4px 5px;text-align:start;font:inherit;
}
.${P}-day-planner button.${P}-planner-block:last-child{border-block-end:0}
.${P}-planner-block{--period-fill:var(--event-fill)}
.${P}-day-planner button.${P}-planner-block[data-resting=true]{--period-fill:var(--rest-fill);border-inline-start-color:var(--rest-edge)}
.${P}-day-planner button.${P}-planner-block[data-source=agreed]{--period-fill:var(--plan-fill);border-inline-start-color:var(--plan-edge)}
.${P}-day-planner button.${P}-planner-block:is(:hover,[aria-pressed=true]){background:var(--period-fill)}
.${P}-planner-time{font-size:12px;font-variant-numeric:tabular-nums}
.${P}-dossier-overview .${P}-planner-detail{margin:6px 0 0}
@container village-desk (min-width:701px){
 .${P}-planner-block span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
}
@container village-desk (max-width:700px){
 .${P}-planner-day{grid-template-columns:1fr}
 .${P}-planner-period+.${P}-planner-period{border-inline-start:0;padding:4px 0 0}
 .${P}-day-planner .${P}-planner-dates button,.${P}-day-planner button.${P}-planner-block{min-height:44px}
 .${P}-planner-dates button span{display:block}
}
`;
