/** Guidance and validation for new map images; saved maps keep their existing shape. */
export const MAP_UPLOAD_GUIDANCE = "Use a landscape image. Recommended size is 2560 x 1440px (16:9).";

export const MAP_UPLOAD_UNREADABLE =
  "A Villages map should be a readable image. We couldn't open this file. Try a PNG, JPG or WebP copy.";
export const MAP_UPLOAD_FALLBACK = "We couldn't use this image as a Villages map. Try another image.";

/** Translate known file-reading failures only; preserve other specific validation errors. */
export function townMapUploadError(message: string): string {
  if (message === "That picture could not be read.") return MAP_UPLOAD_UNREADABLE;
  if (message === "The picture is taking too long to open. Try again.")
    return "This image is taking too long to open. Try uploading it again, or choose a smaller copy.";
  return message;
}

export function townMapFileSizeMessage(bytes: number, maxBytes: number): string {
  const mb = (value: number) => Math.round(value / 100_000) / 10;
  return `A Villages map should use a file of about ${mb(maxBytes)} MB or less. This file is ${mb(bytes)} MB. Save a smaller or more compressed copy and try again.`;
}

export function townMapImageProblem(size: { width: number; height: number }): string | null {
  const { width, height } = size;
  const dimensions = `This image is ${width}px wide and ${height}px tall.`;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) return MAP_UPLOAD_UNREADABLE;
  if (width > 8192 || height > 8192)
    return `A Villages map should be no more than 8192px wide or tall. ${dimensions} Choose a smaller copy.`;
  if (width * height > 16_000_000)
    return `A Villages map should contain no more than 16 million pixels. ${dimensions} Reduce its dimensions and try again; for example, 4000 x 4000px fits this limit.`;
  if (Math.min(width, height) < 768 || Math.max(width, height) < 1024)
    return `A Villages map should be at least 768px on its shorter side and 1024px on its longer side. ${dimensions} Choose a higher-resolution image.`;
  if (width * 3 < height * 2)
    return `A Villages map should have enough width for readable Venue placement. ${dimensions} At this width, it can be at most ${Math.floor((width * 3) / 2)}px tall. Choose a wider image or crop its height.`;
  if (width > height * 2)
    return `A Villages map should have enough height for readable Venue placement. ${dimensions} At this height, it can be at most ${height * 2}px wide. Choose a taller image or crop its width.`;
  return null;
}
