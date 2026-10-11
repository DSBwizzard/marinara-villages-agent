/** Guidance and validation for new map images; saved maps keep their existing shape. */
export const MAP_UPLOAD_GUIDANCE = "Use a 3:2 landscape orientation image. Recommended image size is 1536 x 1024px.";

export function townMapImageProblem(size: { width: number; height: number }): string | null {
  const { width, height } = size;
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1)
    return "This map could not be read. Choose a valid image.";
  if (width > 8192 || height > 8192 || width * height > 16_000_000)
    return "This map is too large. Use at most 8192 pixels per side and 16 million pixels in total.";
  if (Math.min(width, height) < 768 || Math.max(width, height) < 1024)
    return `This ${width} x ${height}px map is too small. Use at least 768px on the shorter side and 1024px on the longer side.`;
  if (width * 3 < height * 2 || width > height * 2)
    return `This ${width} x ${height}px map is too narrow or wide for Venue placement. Use proportions between 2:3 portrait and 2:1 landscape.`;
  return null;
}
