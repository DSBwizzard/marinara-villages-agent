export type UndertakingPlan = {
  goal: string;
  zoneId: string;
  roles: { actorId: string; role: string }[];
  milestones: { id: string; title: string; kind: "preparation" | "first-use" }[];
  schedule?: { firstDate: string; startMinute: number; endMinute: number; weekly: boolean };
  constructionId?: string;
};

export type UndertakingView = {
  plan: UndertakingPlan;
  completed: { milestoneId: string; at: string }[];
};
