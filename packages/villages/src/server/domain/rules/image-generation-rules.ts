import { badRequest } from "./errors.js";

const MAX_IMAGE_PROMPT_LENGTH = 4_000;

const MAX_IMAGE_DIMENSION = 4_096;

export const MAX_IMAGE_PIXELS = 16_000_000;

export function imagePromptId(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
  return `avatar:${slug || "character"}`;
}

export function readPrompt(value: unknown): string {
  const prompt = typeof value === "string" ? value.trim() : "";
  if (prompt.length === 0) throw badRequest("The image prompt cannot be blank.");
  if (prompt.length > MAX_IMAGE_PROMPT_LENGTH) {
    throw badRequest(`The image prompt can be at most ${MAX_IMAGE_PROMPT_LENGTH} characters.`);
  }
  return prompt;
}

export function readDimension(value: number, label: string): number {
  if (!Number.isInteger(value) || value <= 0 || value > MAX_IMAGE_DIMENSION) {
    throw badRequest(`${label} must be a positive integer no larger than ${MAX_IMAGE_DIMENSION}.`);
  }
  return value;
}
