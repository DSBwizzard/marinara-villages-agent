/** Shared, local chroma cleanup. No provider call or style-specific segmentation. */
export const STUDIO_CLEANUP_VERSION = 5;

export function removeStudioMatte(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  expectedHex?: string,
): boolean {
  const count = width * height;
  if (!count || rgba.length !== count * 4) return false;
  const original = rgba.slice();
  const bandX = Math.max(1, Math.ceil(width * 0.18));
  const bandY = Math.max(1, Math.ceil(height * 0.18));
  const step = Math.max(1, Math.floor(Math.sqrt(count / 40000)));
  const buckets = new Map<string, { rgb: number[]; count: number }>();
  const expected = /^#[a-f0-9]{6}$/i.test(expectedHex ?? "")
    ? [1, 3, 5].map((start) => parseInt(expectedHex!.slice(start, start + 2), 16))
    : undefined;
  let opaque = 0;
  for (let y = 0; y < height; y += step)
    for (let x = 0; x < width; x += step) {
      if (x >= bandX && x < width - bandX && y >= bandY && y < height - bandY) continue;
      const p = (y * width + x) * 4;
      if (rgba[p + 3]! < 128) continue;
      opaque++;
      const rgb = [rgba[p]!, rgba[p + 1]!, rgba[p + 2]!];
      // Known generated mattes cannot turn a different bright costume color into background.
      if (expected && Math.hypot(...rgb.map((value, channel) => value - expected[channel]!)) > 64) continue;
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
  const distances = new Float32Array(count);
  for (let index = 0; index < count; index++)
    distances[index] = Math.hypot(
      original[index * 4]! - matte[0]!,
      original[index * 4 + 1]! - matte[1]!,
      original[index * 4 + 2]! - matte[2]!,
    );
  const distance = (index: number) => distances[index]!;
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
    if (rgba[index * 4 + 3]! === 0 || distance(index) >= 28) continue;
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
      if (mask[index] || rgba[index * 4 + 3]! === 0 || distance(index) >= 90) return;
      mask[index] = 1;
      queue[tail++] = index;
    });
  }
  const high = matte.map((value, index) => ({ value, index })).filter(({ value }) => value > Math.max(...matte) - 48);
  const low = matte.map((value, index) => ({ value, index })).filter(({ value }) => value < Math.min(...matte) + 48);
  const dominances = new Float32Array(count);
  const keyHues = new Uint8Array(count);
  for (let index = 0; index < count; index++) {
    let minHigh = 255,
      maxHigh = 0,
      maxLow = 0;
    for (const { index: channel } of high) {
      minHigh = Math.min(minHigh, original[index * 4 + channel]!);
      maxHigh = Math.max(maxHigh, original[index * 4 + channel]!);
    }
    for (const { index: channel } of low) maxLow = Math.max(maxLow, original[index * 4 + channel]!);
    dominances[index] = minHigh - maxLow;
    keyHues[index] = minHigh - maxLow > 8 && maxHigh - minHigh < 48 ? 1 : 0;
  }
  const dominance = (index: number) => dominances[index]!;
  // Small disconnected remnants of the evidenced key color are background
  // specks. Connected character details and differently colored islands stay.
  const seen = new Uint8Array(count);
  for (let start = 0; start < count; start++) {
    if (seen[start] || mask[start] || rgba[start * 4 + 3] === 0) continue;
    head = 0;
    tail = 1;
    queue[0] = start;
    seen[start] = 1;
    let chromaOnly = true;
    while (head < tail) {
      const index = queue[head++]!;
      chromaOnly &&= dominance(index) > 8 && distance(index) < 180;
      neighbors(index, (neighbor) => {
        if (seen[neighbor] || mask[neighbor] || rgba[neighbor * 4 + 3] === 0) return;
        seen[neighbor] = 1;
        queue[tail++] = neighbor;
      });
    }
    if (tail <= 16 && chromaOnly) for (let item = 0; item < tail; item++) mask[queue[item]!] = 1;
  }
  // Mixed matte/foreground colors can occupy several source pixels. Track a
  // bounded band rather than only the immediately adjacent four-neighbor ring.
  const radius = Math.min(12, Math.max(6, Math.ceil(Math.min(width, height) / 32)));
  const proximity = new Uint8Array(count);
  head = 0;
  tail = 0;
  for (let index = 0; index < count; index++)
    if (mask[index] || rgba[index * 4 + 3] === 0) {
      proximity[index] = 1;
      queue[tail++] = index;
    }
  while (head < tail) {
    const index = queue[head++]!;
    if (proximity[index]! > radius * 2) continue;
    neighbors(index, (neighbor) => {
      if (proximity[neighbor]) return;
      proximity[neighbor] = proximity[index]! + 1;
      queue[tail++] = neighbor;
    });
  }
  // Keep clean outline pixels intact; reconstruct only chroma-contaminated
  // pixels near evidenced background, including faint and low-alpha remnants.
  for (let index = 0; index < count; index++) {
    if (mask[index] || !proximity[index] || proximity[index]! > radius + 1 || rgba[index * 4 + 3] === 0) continue;
    const x = index % width,
      y = Math.floor(index / width);
    const red = original[index * 4]! - matte[0]!,
      green = original[index * 4 + 1]! - matte[1]!,
      blue = original[index * 4 + 2]! - matte[2]!;
    let foreground: number[] | undefined;
    let coverage = 1,
      error = Infinity;
    const keyHue = !!keyHues[index];
    const searchRadius = keyHue ? radius * 2 : radius;
    const minDistance = distance(index) + 8,
      maxDominance = dominance(index) - 8;
    search: for (let sy = Math.max(0, y - searchRadius); sy <= Math.min(height - 1, y + searchRadius); sy++)
      for (let sx = Math.max(0, x - searchRadius); sx <= Math.min(width - 1, x + searchRadius); sx++) {
        const sample = sy * width + sx;
        if (
          mask[sample] ||
          original[sample * 4 + 3]! <= 128 ||
          (keyHues[sample] && proximity[sample] && proximity[sample]! <= radius * 2) ||
          dominance(sample) >= maxDominance ||
          distance(sample) <= minDistance
        )
          continue;
        const dr = original[sample * 4]! - matte[0]!,
          dg = original[sample * 4 + 1]! - matte[1]!,
          db = original[sample * 4 + 2]! - matte[2]!;
        const candidateCoverage = Math.max(
          0,
          Math.min(1, (dr * red + dg * green + db * blue) / (dr * dr + dg * dg + db * db)),
        );
        const er = red - candidateCoverage * dr,
          eg = green - candidateCoverage * dg,
          eb = blue - candidateCoverage * db;
        const candidateError = er * er + eg * eg + eb * eb;
        if (candidateError < error) {
          error = candidateError;
          coverage = candidateCoverage;
          foreground = [original[sample * 4]!, original[sample * 4 + 1]!, original[sample * 4 + 2]!];
          // An exact local color fit cannot be improved by scanning more pixels.
          if (error < 0.000001) break search;
        }
      }
    // Without a local foreground match, a chroma-tinted costume is ambiguous.
    // Detached matte specks have already been removed by component evidence.
    if (!foreground) continue;
    if (keyHue) {
      // Compression and color spill need not lie on a perfect RGB mixture
      // line. Estimate coverage from the evidenced key's channel dominance.
      const fgDominance =
        Math.min(...high.map(({ index: channel }) => foreground![channel]!)) -
        Math.max(...low.map(({ index: channel }) => foreground![channel]!));
      const matteDominance = Math.min(...high.map(({ value }) => value)) - Math.max(...low.map(({ value }) => value));
      if (error > 64 && dominance(index) < matteDominance * 0.45) continue;
      coverage = Math.max(0, Math.min(1, (matteDominance - dominance(index)) / (matteDominance - fgDominance)));
    } else if (error > 64 || coverage >= 0.98) continue;
    rgba[index * 4 + 3] = Math.round(original[index * 4 + 3]! * coverage);
    // The RGB fit can retain compression noise in the key-color direction.
    // Use the evidenced local foreground palette for the antialiased edge.
    if (foreground) for (let channel = 0; channel < 3; channel++) rgba[index * 4 + channel] = foreground[channel]!;
  }
  // Strip thin neutral cell frames outside a rectangular chroma backdrop.
  const edgeCoverage = (indices: number[]) => indices.filter((index) => mask[index]).length / indices.length;
  // Host cutouts can retain an inset rectangular backdrop inside their export
  // margins. A recorded key still requires four evidenced rectangular edges.
  const frameMargin = expected ? 0.22 : 0.1;
  const framed =
    left <= width * frameMargin &&
    right >= width * (1 - frameMargin) - 1 &&
    top <= height * frameMargin &&
    bottom >= height * (1 - frameMargin) - 1 &&
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
        (((Math.max(...rgb) < 100 || Math.min(...rgb) > 220) && Math.max(...rgb) - Math.min(...rgb) < 50) ||
          dominance(index) > 8))
    )
      rgba[p + 3] = 0;
  }
  return true;
}
