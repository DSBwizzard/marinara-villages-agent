import type { VillageState } from "../models/world.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import type { AcceptedEpisode } from "../models/episode-model.js";
import { ZonedDate, calendarAt } from "../../../shared/helpers/zoned-date.js";
import { readSceneCalendar, sceneAppointment, sceneDateKey } from "./scene-calendar.js";
import { memoryRequire } from "./memory-integrity.js";

/** Bind an actually spoken appointment date; this creates no clock change or obligation engine. */
export function narrationAppointment(
  state: VillageState,
  command: { by: string; when: object; minute?: number },
  readset: NarrationReadset,
  sources: ContinuityEvidence[],
  receiptId: string,
): AcceptedEpisode["commandReceipts"][number] {
  const calendar = readSceneCalendar(readset.calendar);
  memoryRequire(calendar.instant === readset.capturedAt, "the captured appointment calendar changed");
  const chosen = sceneAppointment({ when: command.when, minute: command.minute }, calendar),
    reference = new ZonedDate(calendar.instant, calendar.timeZone);
  let target = calendarAt(reference, chosen.date, chosen.minute === null ? 720 : Number(chosen.minute));
  memoryRequire(sceneDateKey(target) === chosen.date, "appointment date is invalid");
  if (chosen.minute !== null) {
    const desired = Date.parse(chosen.date + "T00:00:00.000Z") + Number(chosen.minute) * 60_000;
    const offsets = new Set(
      [-36, 0, 36].map((hours) => new ZonedDate(desired + hours * 3_600_000, calendar.timeZone).getTimezoneOffset()),
    );
    // A repeated wall time binds its earliest future occurrence; a missing wall time cannot be promised.
    const future = [...offsets]
      .map((offset) => new ZonedDate(desired + offset * 60_000, calendar.timeZone))
      .filter(
        (value) =>
          sceneDateKey(value) === chosen.date &&
          value.getHours() * 60 + value.getMinutes() === chosen.minute &&
          value.getTime() > reference.getTime(),
      )
      .toSorted((a, b) => a.getTime() - b.getTime())[0];
    memoryRequire(future, "appointment time is nonexistent or already past in the admitted timezone");
    target = future;
  }
  memoryRequire(
    chosen.minute === null ? chosen.date >= calendar.date : target.getTime() > reference.getTime(),
    "an appointment cannot be in the past of its admitted Scene",
  );
  return {
    id: receiptId,
    kind: "appointment",
    targetId: command.by,
    revision: state.clock?.revision ?? 0,
    text:
      "Appointment: " +
      chosen.date +
      (chosen.minute === null
        ? ""
        : " " +
          String(Math.floor(Number(chosen.minute) / 60)).padStart(2, "0") +
          ":" +
          String(Number(chosen.minute) % 60).padStart(2, "0")) +
      " (" +
      calendar.timeZone +
      (chosen.minute === null ? "" : "; " + target.toISOString()) +
      ")",
    witnesses: [
      ...new Set([
        command.by,
        ...sources.flatMap((source) =>
          source.perceptions.filter((row) => row.channel === "words").map((row) => row.actorId),
        ),
      ]),
    ],
  };
}
