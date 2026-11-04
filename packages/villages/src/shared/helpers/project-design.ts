export const MAX_PHYSICAL_DESIGN_LENGTH = 2000;
export const MAX_PROJECT_DRAFTS = 6;

/** A draft's initial design is superseded by its saved plan, or by Renovation terms. */
export function projectPhysicalDesign(project: {
  plan?: { form: string } | null;
  venueDraft?: { description: string };
  lifecycle?: { change?: { detail: string } | null };
}): string {
  return project.lifecycle?.change?.detail ?? project.plan?.form ?? project.venueDraft?.description ?? "";
}
