/** Deliberately small public spinoff surface; captured private context never crosses it. */
export type SpinoffMemory = { id: string; text: string; evidence: { id: string; quote: string }[] };
export type SpinoffView = {
  id: string;
  sessionId: string;
  residentName: string;
  anchoredAt: string;
  timeZone: string;
  chatId: string | null;
  status: "prepared" | "running" | "returned" | "resolved";
  summary: string;
  eligibility: "unreviewed" | "compatible" | "incompatible" | "uncertain";
  explanation: string;
  memories: SpinoffMemory[];
  acceptedIds: string[];
  preparationAttempted?: boolean;
  selectionIds?: string[];
};

export const SPINOFF_EXPLANATION =
  "Spinoffs are freeform side stories anchored to this Village encounter. On return, Villages may retain up to three compatible shared memories. Time, possessions, tasks, permissions, and relationship scores do not change. If the whole story cannot fit the encounter, it stays outside Village memory. You review memories before saving. Engine separately saves concluded scenes in its character memories.";
