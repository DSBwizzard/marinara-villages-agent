/** Feature records own agreements; these are their derived claims on an Agenda. */
export type AgendaReservation = {
  id: string;
  source: "project" | "social";
  dateKey: string;
  startMinute: number;
  endMinute: number;
  venueId: string;
  zoneId?: string;
  activity: string;
  replaces: "routine" | "flexible";
};

/** Absolute instants preserve work across midnight, clock changes and lead changes. */
export type ProjectFocus = {
  remainingMs: number;
  periods: { residentId: string; startsAt: string; endsAt: string }[];
};
