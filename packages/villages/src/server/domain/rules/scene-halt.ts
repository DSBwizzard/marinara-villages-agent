import type { SceneTurnOutcome } from "../../../shared/contracts/scene-turn-outcome.js";
import { ZonedDate, calendarAt, validTimeZone } from "../../../shared/helpers/zoned-date.js";
import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import type { VenueScene } from "../models/scene-model.js";

/** The encounter calendar is supplied by code, never inferred from transcript prose. */
export function capturedSceneCalendar(scene: VenueScene, timeZone: string) {
  const instant = scene.continuity?.capturedAt ?? scene.sceneAttendance?.capturedAt ?? scene.startedAt;
  if (!validTimeZone(timeZone)) timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const local = new ZonedDate(instant, timeZone);
  if (!Number.isFinite(local.getTime()))
    throw badGateway("The saved encounter calendar is invalid. Your draft is preserved.");
  return {
    instant,
    date: dateKey(local),
    weekday: VILLAGE_WEEKDAYS[(local.getDay() + 6) % 7]!,
    time: `${String(local.getHours()).padStart(2, "0")}:${String(local.getMinutes()).padStart(2, "0")}`,
    timeZone,
  };
}

/** Expected preacceptance result; never a provider failure or fictional event. */
export class HaltedSceneTurn extends Error {
  constructor(readonly outcome: SceneTurnOutcome) {
    super(outcome);
  }
}

/** Administrative adjudication in the existing System exchange, never character knowledge. */
export const SCENE_HALT_INSTRUCTION =
  'Also return halt:{reason:"none|time|activity|condition|world",quote:"exact current input or draft substring",appointments:[{date:"YYYY-MM-DD",minute:null,quote:"exact current input or draft substring"}]}. ' +
  'FIRST adjudicate every clause of the ORIGINAL PLAYER INPUT, including outcomes omitted from the draft. THEN check the draft independently. Conclude does not exempt any clause or reduce the input to a departure. A supported turn MUST return all three fields: halt:{reason:"none",quote:"",appointments:[]}. Never omit appointments, even when empty. ' +
  "Preserve the captured encounter until the player chooses Conclude; never return sceneEnded. Elapsed time between messages is not fictional silence or waiting. Ordinary speech, thoughts, gestures, local actions, short narrative pacing, hypotheticals, remembered reports and an NPC declining a request are not HALT. " +
  "Use time for an actual calendar rewind/advance or time travel; activity for declaring hours/days of completed participation or a large time skip without an existing supported mechanic. An old Scene never accrues additional narrative time or capabilities by waiting. " +
  "Use condition for an asserted ongoing state the game cannot enforce, including completed player/resident death, resurrection, permanent incapacity, coma, unconsciousness that continues beyond the encounter, or player-authored compulsory NPC cooperation. A sequence that ends in death is unsupported even if its earlier walking, slipping or farewell is ordinary. Hold the entire input; neither silently omit the death nor accept only the departure. Reports of established past events, dreams, figurative speech, fears, hypotheticals and intentions do not assert that outcome. A request, intention or feasible attempt is not its guaranteed outcome. Do not turn rejected narration into speech, a dream, an unsuccessful spell or another action. " +
  "Use world only for a requested consequential outcome that conflicts with confirmed authority/history, not merely because the Scene depicts an earlier room, cast, activity or knowledge. No speech starts/completes construction, changes elapsed timers or supplies missing resources. " +
  "Use context.preservation.calendar as the authoritative encounter date, weekday and local time. Earlier dialogue can contain mistakes and cannot change this calendar. Check factual current-Scene calendar answers against it; a wrong weekday/date supplied by the draft is inconsistent generated output, not player time manipulation. Questions, reported dates and explicitly uncertain character beliefs are not factual calendar changes. " +
  "appointments lists every concrete NEW calendar meeting proposed or agreed in the original input OR reply, including accepting a dated offer from history and every alternative/counteroffer. Resolve relative days and times from context.preservation.calendar and sceneAt in its timeZone, NEVER from chosenAt, the recording date, or a mistaken weekday in dialogue. Inspect EACH proposal independently: refusing Tuesday at two does not exempt a new Tuesday at half past one offer. A counteroffer inherits the discussed day unless explicitly changed. Same-day offers such as half nine are appointments too. A mere refusal/cancellation, historical report, vague wish to meet someday, or quoted example alone is not a new appointment. minute is local start minute 0-1439, or null when only a date is specified. Code checks against chosenAt. Never silently move a passed date to the next occurrence. Memory summaries of dated agreements use the resolved absolute date, not an unanchored tomorrow. " +
  "A HALT needs only its reason and exact quote; omit other proposed effects rather than fabricating them. Public notices are supplied by code; never include private current-world details in a proposed explanation. ";

function dateKey(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function readSceneHalt(
  value: unknown,
  context: { chosenAt: string; timeZone: string },
  message: string,
  lines: readonly { content: string }[],
): SceneTurnOutcome | null {
  const raw = asRecord(value);
  const cited = (quote: unknown) =>
    typeof quote === "string" &&
    quote.length > 0 &&
    quote.length <= 600 &&
    (message.includes(quote) || lines.some((line) => line.content.includes(quote)));
  const reasons: Record<string, SceneTurnOutcome> = {
    time: "halt-time",
    activity: "halt-time",
    condition: "halt-state",
    world: "halt-world",
  };
  if (typeof raw.reason !== "string" || !["none", ...Object.keys(reasons)].includes(raw.reason))
    throw badGateway("The Scene boundary check is incomplete. Your draft is preserved.");
  if (raw.reason !== "none") {
    if (!cited(raw.quote))
      throw badGateway("The Scene boundary check lacks current evidence. Your draft is preserved.");
    return reasons[raw.reason];
  }
  if (!Array.isArray(raw.appointments) || raw.appointments.length > 12)
    throw badGateway("The Scene calendar check is incomplete. Your draft is preserved.");
  const chosen = new ZonedDate(context.chosenAt, context.timeZone);
  if (!Number.isFinite(chosen.getTime())) throw badGateway("The saved Scene choice time is invalid.");
  for (const value of raw.appointments) {
    const row = asRecord(value);
    if (
      !cited(row.quote) ||
      typeof row.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/u.test(row.date) ||
      (row.minute !== null && (!Number.isInteger(row.minute) || Number(row.minute) < 0 || Number(row.minute) > 1439))
    )
      throw badGateway("The Scene calendar check has an invalid date or source. Your draft is preserved.");
    const target = calendarAt(chosen, row.date, row.minute === null ? 720 : Number(row.minute));
    if (dateKey(target) !== row.date) throw badGateway("The Scene calendar date is invalid. Your draft is preserved.");
    if (row.minute === null ? row.date < dateKey(chosen) : target.getTime() <= chosen.getTime())
      return "halt-appointment";
  }
  return null;
}
