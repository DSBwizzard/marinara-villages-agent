import type { CSSProperties } from "react";
import type { DeskDestination } from "./DeskWorkspace.js";
import { loadLetterFont } from "./letter-font-css.js";

let background: { image: HTMLImageElement; promise: Promise<void> } | undefined;

// Only the fixed menu background is retained; player media keeps its existing lifetime.
export async function prepareDeskArtwork(menu: DeskDestination): Promise<void> {
  if (!background) {
    const image = new Image();
    let url: string | undefined;
    const promise = (async () => {
      const response = await fetch("/api/capability-packages/villages/assets/storybook-background-wide.webp", {
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error("Artwork unavailable");
      url = URL.createObjectURL(await response.blob());
      image.src = url;
      await image.decode();
    })().catch((error: unknown) => {
      background = undefined;
      if (url) URL.revokeObjectURL(url);
      throw error;
    });
    background = { image, promise };
  }
  await Promise.all([background.promise, loadLetterFont(menu === "people" ? "lora" : "crimson-pro").catch(() => {})]);
  await background.image.decode();
}

export function deskArtworkStyle(menu: DeskDestination | null): CSSProperties {
  return {
    "--menu-art": menu && background?.image.complete ? `url("${background.image.src}")` : undefined,
  } as CSSProperties;
}
