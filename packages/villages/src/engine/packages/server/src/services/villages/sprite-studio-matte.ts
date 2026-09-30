/** Shared, local chroma cleanup. No provider call or style-specific segmentation. */
export const STUDIO_CLEANUP_VERSION = 2;

export function removeStudioMatte(rgba: Uint8ClampedArray, width: number, height: number): boolean {
  const count = width * height;
  if (!count || rgba.length !== count * 4) return false;
  const bandX = Math.max(1, Math.ceil(width * 0.18));
  const bandY = Math.max(1, Math.ceil(height * 0.18));
  const step = Math.max(1, Math.floor(Math.sqrt(count / 40000)));
  const buckets = new Map<string, { rgb: number[]; count: number }>();
  let opaque = 0;
  for (let y = 0; y < height; y += step)
    for (let x = 0; x < width; x += step) {
      if (x >= bandX && x < width - bandX && y >= bandY && y < height - bandY) continue;
      const p = (y * width + x) * 4;
      if (rgba[p + 3]! < 128) continue;
      opaque++;
      const rgb = [rgba[p]!, rgba[p + 1]!, rgba[p + 2]!];
      if (Math.max(...rgb) < 180 || Math.max(...rgb) - Math.min(...rgb) < 140) continue;
      const key = rgb.map((value) => Math.floor(value / 32)).join(":");
      const bucket = buckets.get(key) ?? { rgb: [0, 0, 0], count: 0 };
      for (let channel = 0; channel < 3; channel++) bucket.rgb[channel]! += rgb[channel]!;
      bucket.count++;
      buckets.set(key, bucket);
    }
  const dominant = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
  if (!dominant || dominant.count < Math.max(4, opaque * 0.25)) return false;
  const matte = dominant.rgb.map((value) => value / dominant.count);
  const distance = (index: number) =>
    Math.hypot(rgba[index * 4]! - matte[0]!, rgba[index * 4 + 1]! - matte[1]!, rgba[index * 4 + 2]! - matte[2]!);
  const quadrants = new Set<number>();
  for (let y = 0; y < height; y += step)
    for (let x = 0; x < width; x += step) {
      if (x >= bandX && x < width - bandX && y >= bandY && y < height - bandY) continue;
      const index = y * width + x;
      if (rgba[index * 4 + 3]! > 128 && distance(index) < 28)
        quadrants.add((x >= width / 2 ? 1 : 0) + (y >= height / 2 ? 2 : 0));
    }
  // A bright costume or isolated accent is not evidence of a surrounding matte.
  if (quadrants.size < 3) return false;
  const mask = new Uint8Array(count);
  const queue = new Int32Array(count);
  let head = 0,
    tail = 0,
    left = width,
    right = -1,
    top = height,
    bottom = -1;
  for (let index = 0; index < count; index++) {
    if (rgba[index * 4 + 3]! < 16 || distance(index) >= 28) continue;
    mask[index] = 1;
    queue[tail++] = index;
    left = Math.min(left, index % width);
    right = Math.max(right, index % width);
    top = Math.min(top, Math.floor(index / width));
    bottom = Math.max(bottom, Math.floor(index / width));
  }
  const neighbors = (index: number, visit: (neighbor: number) => void) => {
    if (index % width > 0) visit(index - 1);
    if (index % width < width - 1) visit(index + 1);
    if (index >= width) visit(index - width);
    if (index < count - width) visit(index + width);
  };
  while (head < tail) {
    neighbors(queue[head++]!, (index) => {
      if (mask[index] || rgba[index * 4 + 3]! < 16 || distance(index) >= 90) return;
      mask[index] = 1;
      queue[tail++] = index;
    });
  }
  const high = matte.map((value, index) => ({ value, index })).filter(({ value }) => value > Math.max(...matte) - 48);
  const low = matte.map((value, index) => ({ value, index })).filter(({ value }) => value < Math.min(...matte) + 48);
  const dominance = (index: number) =>
    Math.min(...high.map(({ index: channel }) => rgba[index * 4 + channel]!)) -
    Math.max(...low.map(({ index: channel }) => rgba[index * 4 + channel]!));
  // Unmix only chroma-contaminated pixels beside removed background. Existing
  // outlines, white details, and native alpha elsewhere remain artwork.
  const original = rgba.slice();
  for (let index = 0; index < count; index++) {
    if (mask[index] || rgba[index * 4 + 3]! < 16 || dominance(index) < 40) continue;
    let adjacent = false;
    neighbors(index, (neighbor) => {
      adjacent ||= !!mask[neighbor];
    });
    if (!adjacent) continue;
    const x = index % width,
      y = Math.floor(index / width);
    const observed = [original[index * 4]!, original[index * 4 + 1]!, original[index * 4 + 2]!];
    let coverage = 1,
      error = Infinity;
    for (let dy = -3; dy <= 3; dy++)
      for (let dx = -3; dx <= 3; dx++) {
        const sx = x + dx,
          sy = y + dy;
        if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue;
        const sample = sy * width + sx;
        if (mask[sample] || original[sample * 4 + 3]! <= 128 || dominance(sample) >= 40) continue;
        const delta = [0, 1, 2].map((channel) => original[sample * 4 + channel]! - matte[channel]!);
        const candidateCoverage = Math.max(
          0,
          Math.min(
            1,
            delta.reduce((sum, value, channel) => sum + value * (observed[channel]! - matte[channel]!), 0) /
              delta.reduce((sum, value) => sum + value * value, 0),
          ),
        );
        const candidateError = Math.hypot(
          ...observed.map((value, channel) => value - (matte[channel]! + candidateCoverage * delta[channel]!)),
        );
        if (candidateError < error) {
          error = candidateError;
          coverage = candidateCoverage;
        }
      }
    if (error > 32 || coverage >= 0.98) continue;
    rgba[index * 4 + 3] = Math.round(original[index * 4 + 3]! * coverage);
    if (coverage > 0.05)
      for (let channel = 0; channel < 3; channel++)
        rgba[index * 4 + channel] = Math.max(
          0,
          Math.min(255, Math.round((observed[channel]! - matte[channel]! * (1 - coverage)) / coverage)),
        );
  }
  // Strip thin neutral cell frames outside a rectangular chroma backdrop.
  const edgeCoverage = (indices: number[]) => indices.filter((index) => mask[index]).length / indices.length;
  const framed =
    left <= width * 0.1 &&
    right >= width * 0.9 - 1 &&
    top <= height * 0.1 &&
    bottom >= height * 0.9 - 1 &&
    edgeCoverage(Array.from({ length: right - left + 1 }, (_, x) => top * width + left + x)) > 0.7 &&
    edgeCoverage(Array.from({ length: right - left + 1 }, (_, x) => bottom * width + left + x)) > 0.7 &&
    edgeCoverage(Array.from({ length: bottom - top + 1 }, (_, y) => (top + y) * width + left)) > 0.7 &&
    edgeCoverage(Array.from({ length: bottom - top + 1 }, (_, y) => (top + y) * width + right)) > 0.7;
  for (let index = 0; index < count; index++) {
    const x = index % width,
      y = Math.floor(index / width),
      p = index * 4;
    const rgb = [rgba[p]!, rgba[p + 1]!, rgba[p + 2]!];
    if (
      mask[index] ||
      (framed &&
        (x < left || x > right || y < top || y > bottom) &&
        ((Math.max(...rgb) < 100 && Math.max(...rgb) - Math.min(...rgb) < 50) || dominance(index) > 40))
    )
      rgba[p + 3] = 0;
  }
  return true;
}
