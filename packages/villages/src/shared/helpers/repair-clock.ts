export function repairClockMinutes(value: string): number | undefined {
  const match = /^(\d{1,2}):([0-5]\d)$/u.exec(value.trim());
  if (!match) return undefined;
  const minute = Number(match[1]) * 60 + Number(match[2]);
  return minute <= 1440 ? minute : undefined;
}
