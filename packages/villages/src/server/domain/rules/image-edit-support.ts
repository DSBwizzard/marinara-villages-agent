export type ImageEditSupport = { status: "supported" | "unsupported" | "unknown"; multiple: boolean };
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
  const yes = (multiple = false): ImageEditSupport => ({ status: "supported", multiple });
  if (
    row.provider !== "image_generation" ||
    row.profileImportReviewRequired === "true" ||
    row.profileImportReviewRequired === true
  )
    return { status: "unsupported", multiple: false };
  if (source === "openai")
    return /^gpt-image-[\w.-]+$/.test(model) ? yes(true) : { status: "unknown", multiple: false };
  if (source === "gemini_image" && /(?:gemini.*image|nano.?banana)/.test(model)) return yes(true);
  if (["automatic1111", "drawthings"].includes(source)) return yes();
  if (["comfyui", "runpod_comfyui"].includes(source)) {
    const workflow = String(row.comfyuiWorkflow ?? "");
    if (/%reference_image(?:_name)?(?:_01)?%/.test(workflow))
      return yes(/%reference_image(?:_name)?_02%/.test(workflow));
    return { status: "unknown", multiple: false };
  }
  if (["pollinations", "togetherai", "horde"].includes(source)) return { status: "unsupported", multiple: false };
  return { status: "unknown", multiple: false };
}
