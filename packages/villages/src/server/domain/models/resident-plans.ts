export type SocialPlan = {
  id: string;
  dateKey: string;
  actors: { id: string; incarnation: string }[];
  venueId: string;
  zoneId: string;
  startMinute: number;
  endMinute: number;
  revisions: Record<string, string>;
  kind: "meeting" | "avoidance";
  status: "planned" | "completed" | "cancelled";
};
export type ResidentPlans = { selectedDate: string; plans: SocialPlan[] };
