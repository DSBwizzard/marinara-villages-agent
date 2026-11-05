export type ImageEditSupport = {
  status: "supported" | "unsupported" | "unknown";
  multiple: boolean;
  maxReferences: number;
};
/** Matches the verified pinned Engine adapters; accepting a reference is not a fidelity guarantee. */
export function imageEditSupport(row: Record<string, unknown>): ImageEditSupport {
  const model = String(row.model ?? "")
    .trim()
    .toLowerCase();
  const service = String(row.imageService || row.imageGenerationSource || "")
    .trim()
    .toLowerCase();
  const base = String(row.baseUrl ?? "").toLowerCase();
  const source = service || (base.includes("api.openai.com") ? "openai" : "");
  const yes = (maxReferences = 1): ImageEditSupport => ({
    status: "supported",
    multiple: maxReferences > 1,
    maxReferences,
  });
  if (
    row.provider !== "image_generation" ||
    row.profileImportReviewRequired === "true" ||
    row.profileImportReviewRequired === true
  )
    return { status: "unsupported", multiple: false, maxReferences: 0 };
  if (source === "openai")
    return /^gpt-image-[\w.-]+$/.test(model) ? yes(4) : { status: "unknown", multiple: false, maxReferences: 0 };
  if (source === "gemini_image" && /(?:gemini.*image|nano.?banana)/.test(model)) return yes(4);
  if (["automatic1111", "drawthings"].includes(source)) return yes();
  if (["comfyui", "runpod_comfyui"].includes(source)) {
    const workflow = String(row.comfyuiWorkflow ?? "");
    if (/%reference_image(?:_name)?(?:_01)?%/.test(workflow)) {
      let count = 1;
      while (count < 4 && new RegExp(`%reference_image(?:_name)?_0${count + 1}%`).test(workflow)) count++;
      return yes(count);
    }
    return { status: "unknown", multiple: false, maxReferences: 0 };
  }
  if (["pollinations", "togetherai", "horde"].includes(source))
    return { status: "unsupported", multiple: false, maxReferences: 0 };
  return { status: "unknown", multiple: false, maxReferences: 0 };
}
