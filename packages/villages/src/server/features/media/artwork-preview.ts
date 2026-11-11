import { createHash } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { villageEngineBaseUrl } from "../../adapters/engine/engine-transport.js";
import { MAX_VENUE_IMAGE_BYTES } from "../../domain/rules/prompt-preset.js";

export function registerArtworkPreviewRoute(app: FastifyInstance) {
  let inFlight = 0;
  app.get<{ Params: { size: string; id: string; extension: string } }>(
    "/artwork/:size/:id/:extension",
    async (request, reply) => {
      const { size, id, extension } = request.params;
      if (
        (size !== "320" && size !== "1024") ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(id) ||
        !/^(jpg|jpeg|png|webp|avif)$/i.test(extension)
      )
        return reply.code(404).send();

      const path = `/api/global-gallery/file/${id}.${extension}`;
      if (inFlight >= 4) return reply.redirect(path);
      inFlight++;
      try {
        // This privileged route only derives bytes from the same native Gallery file the browser can open.
        const headers = new Headers();
        for (const name of ["authorization", "cookie"] as const) {
          const value = request.headers[name];
          if (value) headers.set(name, value);
        }
        const original = await fetch(villageEngineBaseUrl() + path, {
          headers,
          redirect: "error",
          signal: AbortSignal.timeout(15_000),
        });
        if (!original.ok) {
          await original.body?.cancel();
          return reply.code(404).send();
        }
        const length = Number(original.headers.get("content-length"));
        if (length < 1 || length > MAX_VENUE_IMAGE_BYTES) {
          await original.body?.cancel();
          return reply.redirect(path);
        }
        const source = Buffer.from(await original.arrayBuffer());
        const etag = `W/"v1-${size}-${createHash("sha256").update(source).digest("hex")}"`;
        const cache = () => reply.header("Cache-Control", "private, no-cache").header("ETag", etag);
        if (request.headers["if-none-match"]?.split(",").some((tag) => tag.trim() === etag))
          return cache().code(304).send();

        const { default: sharp } = await import("sharp");
        const image = sharp(source, { limitInputPixels: 16_000_000 });
        const metadata = await image.metadata();
        if ((metadata.pages ?? 1) > 1 || (metadata.format === "png" && source.includes("acTL")))
          return reply.redirect(path);
        const preview = await image
          .rotate()
          .resize(Number(size), Number(size), { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 72 })
          .toBuffer();
        if (preview.length >= source.length) return reply.redirect(path);
        return cache().header("X-Content-Type-Options", "nosniff").type("image/webp").send(preview);
      } catch {
        // The browser can still try the original if the derivative cannot be produced.
        return reply.redirect(path);
      } finally {
        inFlight--;
      }
    },
  );
}
