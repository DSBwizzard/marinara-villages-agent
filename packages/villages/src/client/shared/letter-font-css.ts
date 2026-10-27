import { useEffect } from "react";
import { findLetterFont } from "../../shared/helpers/letter-font-selection.js";

const loading = new Map<string, Promise<void>>();
function loadLetterFont(id: string): Promise<void> {
  const current = loading.get(id);
  if (current) return current;
  const font = findLetterFont(id);
  if (!font) return Promise.resolve();
  const promise = (async () => {
    const response = await fetch("/api/capability-packages/villages/assets/letter-fonts/" + id + ".json");
    if (!response.ok) throw new Error("Letter font unavailable");
    const data: unknown = await response.json();
    if (!data || typeof data !== "object") throw new Error("Invalid letter font");
    await Promise.all(
      font.faces.map(async ({ file, range }) => {
        const encoded = (data as Record<string, unknown>)[file];
        if (typeof encoded !== "string") throw new Error("Invalid letter font face");
        const face = new FontFace("village-letter-" + id, 'url("data:font/woff2;base64,' + encoded + '")', {
          unicodeRange: range,
        });
        await face.load();
        document.fonts.add(face);
      }),
    );
  })().catch((error: unknown) => {
    loading.delete(id);
    throw error;
  });
  loading.set(id, promise);
  return promise;
}
export function useLetterFont(id: string | undefined): void {
  useEffect(() => {
    if (id)
      void loadLetterFont(id).catch(() => {
        /* The neutral fallback remains readable. */
      });
  }, [id]);
}
export function letterFontFamily(id: string | undefined): string | undefined {
  const font = findLetterFont(id);
  return font ? '"village-letter-' + font.id + '",system-ui,sans-serif' : undefined;
}
