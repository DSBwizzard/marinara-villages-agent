import { createHash } from "node:crypto";
import type { SpriteFileAllocation } from "../storage/sprite-files.js";
import { memoryRequire } from "../../domain/rules/memory-integrity.js";

/** Only fresh, never-reused Villages upload paths are candidates; Engine originals are outside this namespace. */
export function createSpriteFileRemoval(ports: {
  list<T>(path: string): Promise<T>;
  read(path: string): Promise<Response>;
  remove(assetId: string, expression: string): Promise<void>;
}) {
  return async (files: readonly SpriteFileAllocation[]) => {
    const inventories = new Map<string, Map<string, string[]>>();
    for (const file of files) {
      if (!inventories.has(file.assetId)) {
        const listed = await ports.list<unknown>(`/api/sprites/${file.assetId}`);
        memoryRequire(Array.isArray(listed), "owned sprite file listing is unavailable");
        const stems = new Map<string, string[]>();
        for (const row of listed) {
          if (typeof row?.filename !== "string") continue;
          const stem = row.filename.replace(/\.[^.]+$/, "");
          const names = stems.get(stem) ?? [];
          names.push(row.filename);
          stems.set(stem, names);
        }
        inventories.set(file.assetId, stems);
      }
      const sameStem = inventories.get(file.assetId)!.get(file.expression) ?? [];
      memoryRequire(
        sameStem.length <= 1 && (!sameStem.length || sameStem[0] === file.filename),
        "owned sprite file path is ambiguous",
      );
      const response = await ports.read(`/api/sprites/${file.assetId}/file/${file.filename}`);
      memoryRequire(response.ok || response.status === 404, "owned sprite file could not be inspected");
      if (response.ok) memoryRequire(sameStem.length === 1, "owned sprite file listing changed");
      if (response.ok && file.ready) {
        const declared = response.headers.get("content-length");
        memoryRequire(!declared || Number(declared) === file.bytes, "owned sprite file size changed");
        const bytes = Buffer.from(await response.arrayBuffer());
        memoryRequire(
          bytes.byteLength === file.bytes && createHash("sha256").update(bytes).digest("hex") === file.sha256,
          "owned sprite file content changed",
        );
      } else await response.body?.cancel();
      // Image GET also returns 404 for corrupt files. Only DELETE acknowledges retirement of an allocated path.
      await ports.remove(file.assetId, file.expression);
    }
  };
}
