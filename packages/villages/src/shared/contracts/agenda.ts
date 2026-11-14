export type AgendaTime = {
  date: string;
  startMinute: number;
  endMinute: number;
  venueId: string;
  zoneId?: string;
};

export type AgendaWeek = {
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
