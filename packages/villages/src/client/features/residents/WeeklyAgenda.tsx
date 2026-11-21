import { useEffect, useState } from "react";
import type { AgendaWeek } from "../../../shared/contracts/agenda.js";
import { invalidatesRead } from "../../shared/api.js";
import { useVillageActivity } from "../../shared/activity.js";
import { AgendaPlanner } from "../../shared/AgendaPlanner.js";

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
  const { visible } = useVillageActivity();
  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    void request<AgendaWeek>(`/agendas?characterId=${encodeURIComponent(actorId)}${inspect ? "&inspect=true" : ""}`, {
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(result?.days) || !result.days.length) {
          setWeek(null);
          setError("Could not read the Agenda.");
          return;
        }
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
  return (
    <>
      <AgendaPlanner days={week.days} date={date} onDate={onDate} />
      {error ? <p role="alert">{error}</p> : null}
    </>
  );
}
