// Minimal dependency-free PNG encoder (RGBA8, no interlace, filter 0).
// Deterministic output for reproducible hashes.
//
// Copied from packages/pixelforge/build/png.mjs so Villages' build directory
// stays self-contained the same way Pixelforge's does. If a third package needs
// this, hoist it into scripts/ instead of copying a third time.
import { deflateSync } from "node:zlib";

const CRC_TABLE = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

/** rgba: Uint8Array of length w*h*4 → PNG Buffer. */
export function encodePng(w, h, rgba) {
  if (rgba.length !== w * h * 4) throw new Error("bad rgba length");
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0; // filter: none
    Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1);
  }
  // level 9: deterministic for a given Node build, but zlib may change across
  // Node releases, so a rebuild on a different Node can churn the PNG bytes.
  // That is safe here: CI only verifies committed bytes against committed
  // hashes, and the package build re-stamps manifest.files[] and the artifact
  // from the same run's output, so a rebuild is always self-consistent.
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Tiny raster with palette-hex colors ("#rrggbb" or null = transparent). */
export class Raster {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8Array(w * h * 4);
  }
  px(x, y, hex) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    if (hex === null) {
      this.data[i] = this.data[i + 1] = this.data[i + 2] = this.data[i + 3] = 0;
      return;
    }
    this.data[i] = parseInt(hex.slice(1, 3), 16);
    this.data[i + 1] = parseInt(hex.slice(3, 5), 16);
    this.data[i + 2] = parseInt(hex.slice(5, 7), 16);
    this.data[i + 3] = 255;
  }
  rect(x, y, w, h, hex) {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.px(xx, yy, hex);
  }
  disc(cx, cy, r, hex) {
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r) this.px(cx + x, cy + y, hex);
      }
    }
  }
  blit(src, dx, dy) {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const i = (y * src.w + x) * 4;
        if (src.data[i + 3] === 0) continue;
        const tx = dx + x;
        const ty = dy + y;
        if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) continue;
        const j = (ty * this.w + tx) * 4;
        this.data[j] = src.data[i];
        this.data[j + 1] = src.data[i + 1];
        this.data[j + 2] = src.data[i + 2];
        this.data[j + 3] = 255;
      }
  }
  toPng() {
    return encodePng(this.w, this.h, this.data);
  }
}

/** Nearest-neighbor upscale, the only way pixel art survives a 512x512 cover. */
export function upscale(src, scale) {
  const out = new Raster(src.w * scale, src.h * scale);
  for (let y = 0; y < out.h; y++) {
    for (let x = 0; x < out.w; x++) {
      const i = (Math.floor(y / scale) * src.w + Math.floor(x / scale)) * 4;
      const j = (y * out.w + x) * 4;
      out.data[j] = src.data[i];
      out.data[j + 1] = src.data[i + 1];
      out.data[j + 2] = src.data[i + 2];
      out.data[j + 3] = 255;
    }
  }
  return out;
}

/** Deterministic PRNG so a rebuild on the same Node produces the same bytes. */
export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
