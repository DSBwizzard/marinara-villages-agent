import { z } from "zod";
import type { RepairRecord } from "../../../shared/contracts/repair.js";

export const snapshotScheduleSchema = z
  .object({
    seed: z.string(),
    setupAt: z.string(),
    generation: z.string(),
    enabledAt: z.string().datetime(),
    frequency: z.enum(["off", "daily", "weekly"]),
    time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    timeZone: z.string().refine((value) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: value });
        return true;
      } catch {
        return false;
      }
    }),
    weekday: z.enum(["0", "1", "2", "3", "4", "5", "6"]),
    retain: z.enum(["7", "14", "30"]),
    lastOccurrence: z.string().optional(),
  })
  .strict();
export type SnapshotSchedule = z.infer<typeof snapshotScheduleSchema>;
const localStamp = (at: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const value = (key: string) => parts.find((p) => p.type === key)!.value;
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}`;
};

/** A local calendar occurrence stays one occurrence through clock changes and DST folds. */
export function dueSnapshotOccurrence(schedule: SnapshotSchedule, now: Date): string | undefined {
  if (schedule.frequency === "off") return;
  const stamp = localStamp(now, schedule.timeZone),
    date = new Date(stamp.slice(0, 10) + "T12:00:00Z");
  if (stamp.slice(11) < schedule.time) date.setUTCDate(date.getUTCDate() - 1);
  if (schedule.frequency === "weekly")
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() - Number(schedule.weekday) + 7) % 7));
  const occurrence = date.toISOString().slice(0, 10) + "T" + schedule.time;
  return occurrence > localStamp(new Date(schedule.enabledAt), schedule.timeZone) &&
    occurrence > (schedule.lastOccurrence ?? "")
    ? occurrence
    : undefined;
}

export function snapshotScheduleRecord(schedule?: SnapshotSchedule): RepairRecord {
  const zones = ["", "UTC", ...Intl.supportedValuesOf("timeZone")];
  if (schedule && !zones.includes(schedule.timeZone)) zones.push(schedule.timeZone);
  return {
    id: '["snapshot-schedule"]',
    topic: "world",
    title: "Snapshot schedule",
    summary:
      schedule?.frequency === "off" || !schedule
        ? "Off"
        : `${schedule.frequency === "daily" ? "Daily" : "Weekly"}, ${schedule.time}, ${schedule.timeZone}`,
    fields: [
      {
        key: "frequency",
        label: "Schedule",
        type: "choice",
        value: schedule?.frequency ?? "off",
        options: [
          { value: "off", label: "Off" },
          { value: "daily", label: "Daily" },
          { value: "weekly", label: "Weekly" },
        ],
      },
      { key: "time", label: "Time", type: "clock", value: schedule?.time ?? "20:00" },
      {
        key: "timeZone",
        label: "Time zone",
        type: "choice",
        value: schedule?.timeZone ?? "",
        options: [...new Set(zones)].map((value) => ({ value, label: value || "Your device time zone" })),
      },
      {
        key: "weekday",
        label: "Day for weekly snapshots",
        type: "choice",
        value: schedule?.weekday ?? "0",
        options: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((label, i) => ({
          value: String(i),
          label,
        })),
      },
      {
        key: "retain",
        label: "Keep scheduled snapshots",
        type: "choice",
        value: schedule?.retain ?? "7",
        options: ["7", "14", "30"].map((value) => ({ value, label: value })),
      },
    ],
    source: [],
    actions: [{ id: "correct", label: "Modify" }],
    related: [],
  };
}
