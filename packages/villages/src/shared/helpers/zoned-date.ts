/** Explicit calendar getters; epoch and ISO timestamps remain standard instants. */
export function validTimeZone(value: unknown): value is string {
  if (typeof value !== "string" || !value || value.length > 100) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format(0);
    return true;
  } catch {
    return false;
  }
}
const formatters = new Map<string, Intl.DateTimeFormat>();
export class ZonedDate extends Date {
  constructor(
    value: Date | string | number,
    readonly zone: string,
  ) {
    super(value instanceof Date ? value.getTime() : value);
  }
  private parts() {
    let formatter = formatters.get(this.zone);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: this.zone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
      });
      formatters.set(this.zone, formatter);
    }
    const parts = Object.fromEntries(formatter.formatToParts(this).map((part) => [part.type, part.value]));
    return {
      year: Number(parts.year),
      month: Number(parts.month) - 1,
      day: Number(parts.day),
      hour: Number(parts.hour),
      minute: Number(parts.minute),
      second: Number(parts.second),
    };
  }
  override getFullYear() {
    return this.parts().year;
  }
  override getMonth() {
    return this.parts().month;
  }
  override getDate() {
    return this.parts().day;
  }
  override getDay() {
    const p = this.parts();
    return new Date(Date.UTC(p.year, p.month, p.day)).getUTCDay();
  }
  override getHours() {
    return this.parts().hour;
  }
  override getMinutes() {
    return this.parts().minute;
  }
  override getSeconds() {
    return this.parts().second;
  }
  override getTimezoneOffset() {
    const p = this.parts();
    return (
      (this.getTime() - Date.UTC(p.year, p.month, p.day, p.hour, p.minute, p.second, this.getMilliseconds())) / 60000
    );
  }
  setCalendar(year: number, month: number, day: number, hour: number, minute: number, second: number, ms: number) {
    const desired = Date.UTC(year, month, day, hour, minute, second, ms);
    const offsets = new Set(
      [-36, 0, 36].map((hours) => new ZonedDate(desired + hours * 3_600_000, this.zone).getTimezoneOffset()),
    );
    const candidates = [...offsets].map((offset) => desired + offset * 60_000).sort((a, b) => a - b);
    const target = new Date(desired);
    const exact = candidates.find((instant) => {
      const local = new ZonedDate(instant, this.zone);
      return (
        local.getFullYear() === target.getUTCFullYear() &&
        local.getMonth() === target.getUTCMonth() &&
        local.getDate() === target.getUTCDate() &&
        local.getHours() === target.getUTCHours() &&
        local.getMinutes() === target.getUTCMinutes()
      );
    });
    // Match native Date: first occurrence of a repeated time; advance through a missing hour.
    return this.setTime(exact ?? Math.max(...candidates));
  }
  override setHours(hour: number, minute = this.getMinutes(), second = this.getSeconds(), ms = this.getMilliseconds()) {
    const p = this.parts();
    return this.setCalendar(p.year, p.month, p.day, hour, minute, second, ms);
  }
  override setMinutes(minute: number, second = this.getSeconds(), ms = this.getMilliseconds()) {
    return this.setHours(this.getHours(), minute, second, ms);
  }
  override setDate(day: number) {
    const p = this.parts();
    return this.setCalendar(p.year, p.month, day, p.hour, p.minute, p.second, this.getMilliseconds());
  }
}
export function copyDate(value: Date): Date {
  return value instanceof ZonedDate ? new ZonedDate(value, value.zone) : new Date(value);
}
export function calendarDate(reference: Date, year: number, month: number, day: number, hour = 0, minute = 0): Date {
  if (!(reference instanceof ZonedDate)) return new Date(year, month, day, hour, minute);
  const result = new ZonedDate(reference, reference.zone);
  result.setCalendar(year, month, day, hour, minute, 0, 0);
  return result;
}

export function calendarAt(reference: Date, key: string, minute = 0): Date {
  const [year, month, day] = key.split("-").map(Number);
  return calendarDate(reference, year!, month! - 1, day!, 0, minute);
}
