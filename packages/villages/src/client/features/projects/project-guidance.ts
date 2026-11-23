import type { BuildProject } from "../../../shared/contracts/village.js";

export function projectFinished(project: BuildProject) {
  return (
    project.status === "cancelled" ||
    (project.status === "complete" && (!project.firstUse || !!project.firstUse.completedAt))
  );
}
export function physicalProjectNext(project: BuildProject): {
  title: string;
  action: "site" | "design" | "people" | "start" | "resume" | "visit" | "wait" | "done";
} {
  const flow = project.lifecycle;
  if (project.status === "cancelled") return { title: "Set aside", action: "done" };
  if (project.status === "complete")
    return project.firstUse && !project.firstUse.completedAt
      ? { title: project.firstUse.goal, action: "visit" }
      : { title: "Complete", action: "done" };
  if (project.status === "paused") return { title: flow?.blockedReason || "Ready to resume", action: "resume" };
  if (project.status === "working") return { title: "Work is underway", action: "wait" };
  if (project.kind === "new-venue" && project.venueDraft?.position?.x == null)
    return { title: "Choose a site", action: "site" };
  if ((project.kind === "new-venue" && !project.plan) || (project.kind === "renovation" && flow?.designReady === false))
    return { title: "Design the place", action: "design" };
  const missing = flow?.affectedIds.filter((id) => !flow.approvals.some((row) => row.residentId === id)) ?? [];
  if (missing.length) return { title: "Ask for agreement on the design", action: "people" };
  if (!flow?.builderId)
    return {
      title: flow?.candidates.length ? "Choose someone who offered to help" : "Ask someone to help",
      action: "people",
    };
  return { title: "Ready to begin work", action: "start" };
}
