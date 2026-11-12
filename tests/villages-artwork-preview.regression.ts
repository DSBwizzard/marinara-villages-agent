import assert from "node:assert/strict";
import Fastify from "fastify";
import sharp from "sharp";
import { registerArtworkPreviewRoute } from "../packages/villages/src/server/features/media/artwork-preview.js";

const app = Fastify();
registerArtworkPreviewRoute(app);
const fetchOriginal = globalThis.fetch;
let galleryStatus = 200;
let reads = 0;
const pixels = Buffer.alloc(1400 * 700 * 3);
let noise = 1;
for (let index = 0; index < pixels.length; index++) {
  noise = Math.imul(noise, 1664525) + 1013904223;
  pixels[index] = noise >>> 24;
}
const original = await sharp(pixels, { raw: { width: 1400, height: 700, channels: 3 } })
  .png()
  .toBuffer();
globalThis.fetch = async (url, init) => {
  reads++;
  assert.match(String(url), /^https?:\/\/127\.0\.0\.1:\d+\/api\/global-gallery\/file\/scenery\.png$/);
  const headers = new Headers(init?.headers);
  assert.equal(headers.get("authorization"), "test-auth");
  assert.equal(headers.has("x-admin-secret"), false);
  assert.equal(init?.redirect, "error");
  return new Response(new Uint8Array(original), {
    status: galleryStatus,
    headers: { "content-length": String(original.length) },
  });
};
try {
  const url = "/artwork/320/scenery/png";
  const headers = { authorization: "test-auth", "x-admin-secret": "do-not-forward" };
  assert.equal((await app.inject({ url: "/artwork/2048/scenery/png", headers })).statusCode, 404);
  assert.equal((await app.inject({ url: "/artwork/320/%2Fscenery/png", headers })).statusCode, 404);
  assert.equal(reads, 0);

  const first = await app.inject({ url, headers });
  assert.equal(first.statusCode, 200);
  assert.equal(first.headers["content-type"], "image/webp");
  assert.equal(first.headers["cache-control"], "private, no-cache");
  assert.ok(first.rawPayload.length < original.length);
  const { width, height } = await sharp(first.rawPayload).metadata();
  assert.deepEqual([width, height], [320, 160]);

  const etag = first.headers.etag;
  assert.equal(typeof etag, "string");
  const conditional = { ...headers, "if-none-match": String(etag) };
  const repeat = await app.inject({ url, headers: conditional });
  assert.equal(repeat.statusCode, 304);
  assert.equal(repeat.body, "");
  const large = await app.inject({ url: "/artwork/1024/scenery/png", headers: conditional });
  assert.equal(large.statusCode, 200);
  assert.equal((await sharp(large.rawPayload).metadata()).width, 1024);
  assert.notEqual(large.headers.etag, etag);

  galleryStatus = 403;
  assert.equal((await app.inject({ url, headers: conditional })).statusCode, 404);
  galleryStatus = 404;
  assert.equal((await app.inject({ url, headers: conditional })).statusCode, 404);
} finally {
  globalThis.fetch = fetchOriginal;
  await app.close();
}
