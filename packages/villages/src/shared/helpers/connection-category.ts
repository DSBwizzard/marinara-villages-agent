/** Match Engine's chat compatibility and the one media kind Villages uses. */
export function villageConnectionCategory(provider: string): "language" | "image_generation" | null {
  if (provider === "image_generation") return "image_generation";
  if (!provider || ["video_generation", "decision", "audio", "audio_generation"].includes(provider)) return null;
  return "language";
}
