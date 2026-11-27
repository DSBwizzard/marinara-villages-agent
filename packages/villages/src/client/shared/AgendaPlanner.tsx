import { useState, type ReactNode } from "react";
import type { AgendaWeek } from "../../shared/contracts/agenda.js";
import { ELEMENT_TAG as P } from "./constants.js";

const dayLabel = (date: string) =>
  new Intl.DateTimeFormat(undefined, { timeZone: "UTC", month: "short", day: "numeric" }).format(
    new Date(date + "T12:00:00Z"),
  );
const sourceLabel = { told: "Told you", seen: "Observed", agreed: "Agreed with you" };
type Block = AgendaWeek["days"][number]["blocks"][number] & { note?: string };
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

export function AgendaPlanner<T extends Block>({
  days,
  date,
  onDate,
  onActivity,
  renderDayAction,
  disabled,
  pageSize,
}: {
  days: { date: string; weekday: string; personalPlansPending?: true; blocks: T[] }[];
  date: string | undefined;
  onDate(date: string): void;
  onActivity?: (day: { date: string }, block: T) => void;
  renderDayAction?: (day: { date: string }) => ReactNode;
  disabled?: boolean;
  pageSize?: number;
}) {
  const [selection, setSelection] = useState<{ date: string; block: T }>();
  const [page, setPage] = useState({ date: "", index: 0 });
  if (!days.length) return null;
  const day = days.find((entry) => entry.date === date) ?? days[0];
  const pageCount = pageSize ? Math.max(1, Math.ceil(day.blocks.length / pageSize)) : 1;
  const currentPage = page.date === day.date ? Math.min(page.index, pageCount - 1) : 0;
  const blocks = pageSize ? day.blocks.slice(currentPage * pageSize, (currentPage + 1) * pageSize) : day.blocks;
  const visibleSelection =
    selection?.date === day.date &&
    day.blocks.find(
      (block) => block.startMinute === selection.block.startMinute && block.activity === selection.block.activity,
    );
  return (
    <div className={P + "-day-planner"} role="group" aria-label="Day planner" data-repair={!!onActivity}>
      <style>{agendaStyles}</style>
      <div className={P + "-planner-dates"} role="group" aria-label="Days">
        {days.map((entry) => (
          <button
            key={entry.date}
            type="button"
            disabled={disabled}
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
      {renderDayAction ? <div className={P + "-planner-actions"}>{renderDayAction(day)}</div> : null}
      {day.personalPlansPending ? <p role="status">Personal plans pending</p> : null}
      <div className={P + "-planner-day"} role="group" aria-label={day.weekday + " Agenda"}>
        {periods.map((period) => (
          <div key={period} className={P + "-planner-period"} role="group" aria-label={period}>
            <div className={P + "-planner-period-label"} aria-hidden="true">
              {period}
            </div>
            {blocks
              .filter((block) => periodOf(block.startMinute) === period)
              .map((block, index) => (
                <button
                  type="button"
                  disabled={disabled}
                  key={index}
                  className={P + "-planner-block"}
                  data-source={block.source}
                  data-resting={block.resting}
                  aria-label={[
                    blockTime(block, true),
                    block.activity,
                    block.place,
                    block.note,
                    block.source && sourceLabel[block.source],
                  ]
                    .filter(Boolean)
                    .join(", ")}
                  aria-pressed={visibleSelection === block}
                  onClick={() => {
                    setSelection(!onActivity && visibleSelection === block ? undefined : { date: day.date, block });
                    onActivity?.(day, block);
                  }}
                >
                  <span className={P + "-planner-time"}>{blockTime(block)}</span>
                  <span className={P + "-planner-activity"}>{block.label ?? block.activity}</span>
                  {onActivity && block.place ? <small className={P + "-planner-place"}>{block.place}</small> : null}
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
            visibleSelection.note,
            visibleSelection.source && sourceLabel[visibleSelection.source],
          ]
            .filter(Boolean)
            .join(", ")}
        </p>
      ) : null}
      {onActivity && !day.personalPlansPending && !day.blocks.length ? <p>No scheduled activities.</p> : null}
      {pageCount > 1 ? (
        <nav className={P + "-planner-pages"} aria-label="Agenda pages">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage({ date: day.date, index: currentPage - 1 })}
          >
            Previous
          </button>
          <span>
            {currentPage + 1} of {pageCount}
          </span>
          <button
            type="button"
            disabled={currentPage + 1 >= pageCount}
            onClick={() => setPage({ date: day.date, index: currentPage + 1 })}
          >
            Next →
          </button>
        </nav>
      ) : null}
    </div>
  );
}

const agendaStyles = `
.${P}-day-planner{
 --planner-paper:#282639;--planner-line:#756782;
 --event-fill:#2c514c;--event-edge:#80b7a1;--rest-fill:#40486c;--rest-edge:#9caee7;
 --plan-fill:#665035;--plan-ink:#ffedc2;--plan-edge:#efbe68;
 font:400 14px/1.35 var(--notebook-hand);
}
.${P}-day-planner[data-repair=true]{
 --planner-paper:var(--repair-paper);--planner-line:var(--repair-control);
 --notebook-hand:"Segoe UI",system-ui,sans-serif;--menu-selected:var(--repair-primary);
 margin-block:16px;
}
.${P}-day-planner[data-repair=true] .${P}-planner-detail{margin-block:12px}
.${P}-planner-actions{display:flex;justify-content:flex-end;margin-block-end:8px}
.${P}-desk-workspace[data-theme=day] .${P}-day-planner{
 --planner-paper:#edf4ee;--planner-line:#a0b6ab;
 --event-fill:#c9e4d9;--event-edge:#347963;--rest-fill:#d9dfef;--rest-edge:#5873a2;
 --plan-fill:#f3d89e;--plan-ink:#4a2c11;--plan-edge:#986018;
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
 border:0;border-block-end:1px solid var(--planner-line);border-inline-start:7px solid var(--event-edge);border-radius:0;
 background:transparent;padding:4px 5px;text-align:start;font:inherit;
}
.${P}-day-planner button.${P}-planner-block:last-child{border-block-end:0}
.${P}-planner-block{--period-fill:var(--event-fill)}
.${P}-day-planner button.${P}-planner-block[data-resting=true]{--period-fill:var(--rest-fill);border-inline-start-color:var(--rest-edge)}
.${P}-day-planner button.${P}-planner-block:is(:hover,[aria-pressed=true]){background:var(--period-fill)}
.${P}-day-planner button.${P}-planner-block[data-source=agreed]{color:var(--plan-ink);border-inline-start-color:var(--plan-edge);background:var(--plan-fill)}
.${P}-planner-time{font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap}
.${P}-planner-activity{overflow-wrap:anywhere}
.${P}-planner-place{grid-column:2;font-size:12px;color:var(--repair-muted)}
.${P}-planner-pages{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-top:12px}
.${P}-dossier-overview .${P}-planner-detail{margin:6px 0 0}
@container village-desk (max-width:700px){
 .${P}-planner-day{grid-template-columns:1fr}
 .${P}-planner-period+.${P}-planner-period{border-inline-start:0;padding:4px 0 0}
 .${P}-day-planner .${P}-planner-dates button,.${P}-day-planner button.${P}-planner-block{min-height:44px}
 .${P}-planner-dates button span{display:block}
}
`;
