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
    <div className={P + "-weekly-agenda"} aria-label="Weekly Agenda">
      <style>{agendaStyles}</style>
      <div className={P + "-week-heading"}>
        <span>
          {dayLabel(week.days[0].date)} – {dayLabel(week.days[6].date)}
        </span>
        <span>
          {week.visibility === "inspect"
            ? "Inspect · Full schedule"
            : week.visibility === "shared"
              ? "Shared schedule"
              : "Known schedule"}
        </span>
      </div>
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
                  {block.source === "agreed" ? "With you" : block.source === "seen" ? "●" : block.activity}
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
      ) : week.days.every(({ blocks }) => !blocks.length) ? (
        <p>No known plans yet.</p>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}

const agendaStyles = `
.${P}-weekly-agenda{font:400 14px/1.35 var(--notebook-hand);container-type:inline-size}
.${P}-week-heading{display:flex;justify-content:space-between;flex-wrap:wrap;gap:4px 12px;margin:0 0 8px}
.${P}-week-grid{--hours:276px;display:grid;grid-template-columns:43px repeat(7,minmax(0,1fr));background:var(--menu-field);border:1px solid var(--dossier-line);border-radius:6px}
.${P}-week-axis{margin-top:33px;display:grid;grid-template-rows:repeat(4,1fr);height:var(--hours);padding:0 4px;font-size:12px}
.${P}-week-day{min-width:0;border-inline-start:1px solid var(--dossier-line)}
.${P}-weekly-agenda button.${P}-week-day-button{width:100%;height:33px;min-height:33px;padding:0 2px;border:0;border-radius:0;background:transparent;white-space:nowrap;font-size:13px;overflow:hidden}
.${P}-weekly-agenda button.${P}-week-day-button[aria-pressed=true]{background:var(--menu-selected)}
.${P}-week-slots{height:var(--hours);position:relative;background:repeating-linear-gradient(to bottom,var(--dossier-line) 0 1px,transparent 1px 25%)}
.${P}-weekly-agenda button.${P}-week-block{position:absolute;inset-inline:2px;width:calc(100% - 4px);min-height:9px;display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:0 3px;text-align:start;font-size:12px;line-height:1;border:0;border-radius:3px;background:var(--menu-selected);color:var(--dossier-ink)}
.${P}-weekly-agenda button.${P}-week-block[data-source=agreed]{background:#efce87;color:#382819}
.${P}-weekly-agenda button.${P}-week-block[data-source=seen]{background:transparent}
.${P}-weekly-agenda button.${P}-week-block:focus-visible{z-index:1}
.${P}-weekly-agenda p{margin-top:8px}
@container (max-width:500px){
 .${P}-week-grid{grid-template-columns:36px repeat(7,minmax(0,1fr));grid-template-rows:44px var(--hours)}
 .${P}-week-day{display:contents}
 .${P}-week-axis{grid-area:2/1;margin-top:0}
 .${P}-weekly-agenda button.${P}-week-day-button{grid-row:1;height:44px;font-size:12px;line-height:1.15;white-space:normal}
 .${P}-weekly-agenda button.${P}-week-day-button span{display:block}
 .${P}-week-slots{display:none}
 .${P}-week-day[data-selected=true] .${P}-week-slots{display:block;grid-area:2/2/2/-1;border-inline-start:1px solid var(--dossier-line)}
}
`;
