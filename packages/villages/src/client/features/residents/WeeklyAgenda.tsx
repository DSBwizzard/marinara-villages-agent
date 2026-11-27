import { useEffect, useState } from "react";
import type { AgendaAppointmentOffer, AgendaWeek } from "../../../shared/contracts/agenda.js";
import { invalidatesRead, messageFrom } from "../../shared/api.js";
import { useVillageActivity } from "../../shared/activity.js";
import { AgendaPlanner } from "../../shared/AgendaPlanner.js";

const timeLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;

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
  const [confirming, setConfirming] = useState(false);
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
  async function decide(offer: AgendaAppointmentOffer | NonNullable<AgendaWeek["confirmed"]>[number], cancel = false) {
    if (confirming) return;
    setConfirming(true);
    setError("");
    try {
      const saved = await request<AgendaWeek>(`/agendas/${encodeURIComponent(actorId)}/appointments`, {
        method: "POST",
        body: JSON.stringify({ token: offer.token, ...(cancel ? { cancel: true } : {}) }),
      });
      setWeek((current) =>
        (cancel ? current?.confirmed : current?.pending)?.some((entry) => entry.token === offer.token)
          ? saved
          : current,
      );
      if (offer.time) onDate(offer.time.date);
    } catch (cause) {
      setError(messageFrom(cause, cancel ? "Could not cancel the appointment." : "Could not confirm the appointment."));
    } finally {
      setConfirming(false);
    }
  }
  if (!week) return <p role="status">{error || "Reading Agenda…"}</p>;
  return (
    <>
      <AgendaPlanner days={week.days} date={date} onDate={onDate} />
      {[
        ...(week.pending ?? []).map((offer) => ({ offer, cancel: false })),
        ...(week.confirmed ?? []).map((offer) => ({ offer, cancel: true })),
      ].map(({ offer, cancel }) => (
        <div key={offer.id}>
          <strong>{offer.activity}</strong>
          {offer.time ? (
            <p>
              {offer.time.date}, {timeLabel(offer.time.startMinute)}–{timeLabel(offer.time.endMinute)}, {offer.place}
            </p>
          ) : null}
          <button type="button" disabled={confirming} onClick={() => void decide(offer, cancel)}>
            {cancel ? "Cancel appointment" : "Confirm appointment"}
          </button>
        </div>
      ))}
      {error ? <p role="alert">{error}</p> : null}
    </>
  );
}
