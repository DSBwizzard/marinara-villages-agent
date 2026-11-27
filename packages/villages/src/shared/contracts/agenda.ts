export type AgendaTime = {
  date: string;
  startMinute: number;
  endMinute: number;
  venueId: string;
  zoneId?: string;
};

export type AgendaAppointmentOffer = {
  id: string;
  token: string;
  time: AgendaTime;
  activity: string;
  place: string;
};

export type AgendaWeek = {
  pending?: AgendaAppointmentOffer[];
  confirmed?: (Omit<AgendaAppointmentOffer, "time" | "place"> &
    Partial<Pick<AgendaAppointmentOffer, "time" | "place">>)[];
  visibility: "known" | "shared" | "inspect";
  days: {
    date: string;
    weekday: string;
    blocks: {
      startMinute: number;
      endMinute: number;
      activity: string;
      resting?: true;
      place?: string;
      source?: "told" | "seen" | "agreed";
    }[];
  }[];
};
