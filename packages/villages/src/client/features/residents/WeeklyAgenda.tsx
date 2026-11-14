import { useEffect, useState } from "react";
import type { AgendaWeek } from "../../../shared/contracts/agenda.js";
import { invalidatesRead } from "../../shared/api.js";
import { agendaMinuteLabel } from "../../shared/presentation.js";
import { ELEMENT_TAG as P } from "../../shared/constants.js";
import { useVillageActivity } from "../../shared/activity.js";

const dayLabel = (date: string) =>
  new Intl.DateTimeFormat(undefined, { timeZone: "UTC", month: "short", day: "numeric" }).format(
    new Date(date + "T12:00:00Z"),
  );
const sourceLabel = { told: "Told you", seen: "Observed", agreed: "Agreed with you" };
type Block = AgendaWeek["days"][number]["blocks"][number];

export function WeeklyAgenda({
  actorId,
  inspect,
  refresh,
  request,
}: {
  actorId: string;
  inspect: boolean;
  refresh: string;
  request<T>(path: string, options?: RequestInit): Promise<T>;
}) {
  const [week, setWeek] = useState<AgendaWeek | null>(null);
  const [error, setError] = useState("");
  const [day, setDay] = useState(0);
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
  const visibleSelection = week.days
    .find(({ date }) => date === selection?.date)
    ?.blocks.find(
      (block) => block.startMinute === selection?.block.startMinute && block.activity === selection.block.activity,
    );
  return (
    <div className={P + "-weekly-agenda"} role="group" aria-label="Weekly Agenda">
      <style>{agendaStyles}</style>
      <div className={P + "-week-grid"}>
        <div className={P + "-week-axis"} aria-hidden="true">
          <span>12 AM</span>
          <span>6 AM</span>
          <span>Noon</span>
          <span>6 PM</span>
        </div>
        {week.days.map((entry, index) => (
          <div key={entry.date} className={P + "-week-day"} data-selected={index === day}>
            <button
              type="button"
              className={P + "-week-day-button"}
              aria-label={entry.weekday + ", " + dayLabel(entry.date)}
              aria-pressed={index === day}
              onClick={() => setDay(index)}
            >
              {entry.weekday.slice(0, 3)} <span>{Number(entry.date.slice(-2))}</span>
            </button>
            <div className={P + "-week-slots"} role="group" aria-label={entry.weekday + " Agenda"}>
              {entry.blocks.map((block, blockIndex) => (
                <button
                  type="button"
                  key={blockIndex}
                  className={P + "-week-block"}
                  data-source={block.source}
                  data-resting={block.resting}
                  data-compact={block.endMinute - block.startMinute < 50}
                  title={block.activity}
                  aria-label={[
                    entry.weekday,
                    agendaMinuteLabel(block.startMinute),
                    block.source === "seen" ? undefined : agendaMinuteLabel(block.endMinute),
                    block.activity,
                    block.place,
                    block.source && sourceLabel[block.source],
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  style={{
                    top: block.startMinute / 14.4 + "%",
                    height: (block.endMinute - block.startMinute) / 14.4 + "%",
                  }}
                  onClick={() => setSelection({ date: entry.date, block })}
                >
                  {block.source === "agreed" ? "With you" : block.source === "seen" ? null : block.activity}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {visibleSelection ? (
        <p className={P + "-week-detail"} role="status">
          {[
            dayLabel(selection!.date),
            agendaMinuteLabel(visibleSelection.startMinute) +
              (visibleSelection.source === "seen" ? "" : "–" + agendaMinuteLabel(visibleSelection.endMinute)),
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
.${P}-weekly-agenda{font:400 14px/1.35 var(--notebook-hand);container-type:inline-size}
.${P}-week-grid{
 --week-header:36px;--week-hours:432px;--week-paper:#282639;--week-line:#756782;--week-tick:#f0dfbc;
 --event-fill:#2c514c;--event-ink:#ddf4ea;--event-edge:#80b7a1;
 --rest-fill:#40486c;--rest-ink:#e1e8fc;--rest-edge:#9caee7;
 --plan-fill:#665035;--plan-ink:#ffedc2;--plan-edge:#e7b96a;
 position:relative;display:grid;grid-template-columns:54px repeat(7,minmax(0,1fr));
 grid-template-rows:var(--week-header) var(--week-hours);background:var(--week-paper);
 border:1px solid var(--week-line);border-radius:8px;
}
.${P}-desk-workspace[data-theme=day] .${P}-week-grid{
 --week-paper:#edf4ee;--week-line:#a0b6ab;--week-tick:#213e36;
 --event-fill:#c9e4d9;--event-ink:#1c493e;--event-edge:#347963;
 --rest-fill:#d9dfef;--rest-ink:#293959;--rest-edge:#5873a2;
 --plan-fill:#f2d9a5;--plan-ink:#523417;--plan-edge:#a56819;
}
.${P}-week-grid::before{
 content:"";position:absolute;inset:var(--week-header) 0 0;
 background:repeating-linear-gradient(to bottom,var(--week-line) 0 1px,transparent 1px 25%);
 pointer-events:none;
}
.${P}-week-axis{position:relative;grid-area:1/1/3/2;align-self:end;height:var(--week-hours);font-size:12px;color:var(--week-tick)}
.${P}-week-axis span{position:absolute;top:0;inset-inline-end:5px;padding-inline:2px;background:var(--week-paper);white-space:nowrap;transform:translateY(-50%);line-height:1}
.${P}-week-axis span:nth-child(2){top:25%}
.${P}-week-axis span:nth-child(3){top:50%}
.${P}-week-axis span:nth-child(4){top:75%}
.${P}-week-day{display:contents}
.${P}-weekly-agenda button.${P}-week-day-button{grid-row:1;width:100%;min-height:0;padding:0 2px;border:0;border-inline-start:1px solid var(--week-line);border-radius:0;background:transparent;white-space:nowrap;font-size:13px;font-weight:600;overflow:hidden}
.${P}-weekly-agenda button.${P}-week-day-button[aria-pressed=true]{background:var(--menu-selected)}
.${P}-week-slots{grid-row:2;min-width:0;position:relative;border-inline-start:1px solid var(--week-line)}
.${P}-weekly-agenda button.${P}-week-block{position:absolute;inset-inline:2px;width:calc(100% - 4px);min-height:0;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 3px;text-align:start;font-size:13px;line-height:1;border:0;border-inline-start:3px solid var(--event-edge);border-radius:3px;background:var(--event-fill);color:var(--event-ink)}
.${P}-weekly-agenda button.${P}-week-block[data-resting=true]{background:var(--rest-fill);color:var(--rest-ink);border-color:var(--rest-edge)}
.${P}-weekly-agenda button.${P}-week-block[data-source=agreed]{background:var(--plan-fill);color:var(--plan-ink);border-color:var(--plan-edge)}
.${P}-weekly-agenda button.${P}-week-block[data-compact=true]{font-size:0}
.${P}-weekly-agenda button.${P}-week-block[data-source=seen]{width:16px;min-height:12px;border:0;background:transparent}
.${P}-week-block[data-source=seen]::before{content:"";display:block;width:7px;height:7px;border-radius:50%;background:var(--event-edge)}
.${P}-weekly-agenda button.${P}-week-block:focus-visible{z-index:1}
.${P}-weekly-agenda p{margin-top:8px}
@container (max-width:400px){
 .${P}-week-grid{--week-header:44px;grid-template-columns:46px repeat(7,minmax(0,1fr))}
 .${P}-week-axis span{inset-inline-end:2px}
 .${P}-weekly-agenda button.${P}-week-day-button{font-size:12px;line-height:1.15;white-space:normal}
 .${P}-weekly-agenda button.${P}-week-day-button span{display:block}
 .${P}-week-slots{display:none}
 .${P}-week-day[data-selected=true] .${P}-week-slots{display:block;grid-area:2/2/3/-1}
}
`;
