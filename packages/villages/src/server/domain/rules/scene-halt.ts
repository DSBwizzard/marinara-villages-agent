import type { SceneTurnOutcome } from "../../../shared/contracts/scene-turn-outcome.js";
import { ZonedDate, calendarAt, validTimeZone } from "../../../shared/helpers/zoned-date.js";
import { asRecord } from "./coerce.js";
import { badGateway, VillagesRequestError } from "./errors.js";
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

export type SceneBoundaryFinding = { source: "player" | "draft"; outcome: SceneTurnOutcome };

export class GeneratedSceneBoundary extends VillagesRequestError {
  constructor(readonly outcome: SceneTurnOutcome) {
    super(502, "The generated reply exceeded what Villages can support. Retry.");
  }
}

export const SCENE_OUTCOME_BOUNDARY =
  "Cards and lore establish identity and abilities, not authority over Village state. Completed outcomes must fit authoritative Scene facts and supported consequences. Ordinary actions and compatible supernatural effects need no dedicated numerical mechanic. Do not complete death, resurrection, permanent incapacity, time travel, calendar rewrites or large elapsed activity skips without a supported mechanic. Judge actual consequences, including history, time, lasting conditions, agency, movement and witnesses; calling an effect local does not exempt them. Do not invent suppressed powers or compulsory reluctance. Preserve requests, attempts, threats, beliefs and hypotheticals as such; never disguise an unsupported completed outcome as a dream, failed spell or dialogue.";

export const SCENE_BOUNDARY_INSTRUCTION =
  SCENE_OUTCOME_BOUNDARY +
  ' For every adverse halt finding and EVERY appointment row add source:"player|draft". Quote exact evidence from that source; draft excludes materialized player speech. FIRST assess the entire original input, including passed appointments; player violations take precedence. Only after supported input report a draft violation. With a draft violation include appointments (even []), so code can check player appointments first. Successful halt output stays unchanged. A wrong factual calendar answer in the draft is a draft time violation. Return no freeform explanation.';

/** Source attribution is semantic; code checks exact evidence and routes recovery. */
export function readSceneBoundary(
  value: unknown,
  context: { chosenAt: string; timeZone: string },
  message: string,
  lines: readonly { content: string; speakerId?: string }[],
): SceneBoundaryFinding | null {
  const raw = asRecord(value);
  const sourceOf = (row: Record<string, unknown>): "player" | "draft" => {
    if (row.source !== "player" && row.source !== "draft")
      throw badGateway("The Scene boundary check lacks a source. Your input is saved.");
    return row.source;
  };
  const scoped = (row: Record<string, unknown>, appointments: unknown[]) => {
    const source = sourceOf(row);
    const outcome = readSceneHalt(
      { ...row, appointments },
      context,
      source === "player" ? message : "",
      source === "draft" ? lines.filter((line) => line.speakerId !== "player") : [],
    );
    return outcome ? { source, outcome } : null;
  };
  if (raw.reason !== "none" && sourceOf(raw) === "player") return scoped(raw, []);
  if (!Array.isArray(raw.appointments) || raw.appointments.length > 12)
    throw badGateway("The Scene calendar check is incomplete. Your input is saved.");
  const appointments = raw.appointments.map(asRecord);
  appointments.forEach(sourceOf);
  let finding: SceneBoundaryFinding | null = null;
  for (const row of appointments
    .filter((row) => row.source === "player")
    .concat(appointments.filter((row) => row.source === "draft"))) {
    const result = scoped({ reason: "none", source: row.source }, [row]);
    finding ??= result;
  }
  if (finding?.source === "player") return finding;
  if (raw.reason !== "none") return scoped(raw, []) ?? finding;
  // Retain the original shape validation even for a successful empty report.
  readSceneHalt({ ...raw, appointments: [] }, context, message, lines);
  return finding;
}

/** Administrative adjudication in the existing System exchange, never character knowledge. */
export const SCENE_HALT_INSTRUCTION =
  'Also return halt:{reason:"none|time|activity|condition|world",quote:"exact current input or draft substring",appointments:[{date:"YYYY-MM-DD",minute:null,quote:"exact current input or draft substring"}]}. ' +
  'FIRST adjudicate every clause of the ORIGINAL PLAYER INPUT, including outcomes omitted from the draft. THEN check the draft independently. Conclude does not exempt any clause or reduce the input to a departure. A supported turn MUST return all three fields: halt:{reason:"none",quote:"",appointments:[]}. Never omit appointments, even when empty. ' +
  "Preserve the captured encounter until the player chooses Conclude; never return sceneEnded. Elapsed time between messages is not fictional silence or waiting. Ordinary speech, thoughts, gestures, local actions, short narrative pacing, hypotheticals, remembered reports and an NPC declining a request are not HALT. " +
  "Use time for an actual calendar rewind/advance or time travel; activity for declaring hours/days of completed participation or a large time skip without an existing supported mechanic. An old Scene never accrues additional narrative time or capabilities by waiting. " +
  "Use condition for an asserted ongoing state the game cannot enforce, including completed player/resident death, resurrection, permanent incapacity, coma, unconsciousness that continues beyond the encounter, or player-authored compulsory NPC cooperation. A sequence that ends in death is unsupported even if its earlier walking, slipping or farewell is ordinary. Hold the entire input; neither silently omit the death nor accept only the departure. Reports of established past events, dreams, figurative speech, fears, hypotheticals and intentions do not assert that outcome. A request, intention or feasible attempt is not its guaranteed outcome. When the original input could mean either ordinary action or an unsupported lasting outcome and context does not resolve that ambiguity, use condition to hold the whole turn for rewriting. Do not invent a hypothetical reading from the draft omitting the outcome. Temporal ordering words such as before, after or then alone do not establish a hypothetical; an explicit fear, conditional, joke or intention still does. Do not turn rejected narration into speech, a dream, an unsuccessful spell or another action. " +
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
