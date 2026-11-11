import type { CSSProperties } from "react";
import type { DeskDestination } from "./DeskWorkspace.js";
import { loadLetterFont } from "./letter-font-css.js";

type ArtworkLayer = {
  file: string;
  property: string;
  loaded?: { image: HTMLImageElement; ready: Promise<void> };
};

// The foreground matte uses the same pixel coordinates as the backdrop.
const artwork: ArtworkLayer[] = [
  { file: "storybook-background-wide.webp", property: "--menu-art" },
  { file: "storybook-scenery-matte.webp", property: "--menu-scenery-matte" },
];

async function prepareLayer(layer: ArtworkLayer): Promise<void> {
  if (!layer.loaded) {
    const image = new Image();
    let url: string | undefined;
    const ready = (async () => {
      const response = await fetch(`/api/capability-packages/villages/assets/${layer.file}`, {
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error("Artwork unavailable");
      url = URL.createObjectURL(await response.blob());
      image.src = url;
      await image.decode();
    })().catch((error: unknown) => {
      layer.loaded = undefined;
      if (url) URL.revokeObjectURL(url);
      throw error;
    });
    layer.loaded = { image, ready };
  }
  const { image, ready } = layer.loaded;
  await ready;
  await image.decode();
}

export async function prepareDeskArtwork(): Promise<void> {
  await Promise.all([...artwork.map(prepareLayer), loadLetterFont("lora").catch(() => {})]);
}

export function deskArtworkStyle(menu: DeskDestination | null): CSSProperties {
  if (!menu) return {};
  return Object.fromEntries(
    artwork.map(({ property, loaded }) => [
      property,
      loaded?.image.complete ? `url("${loaded.image.src}")` : undefined,
    ]),
  ) as CSSProperties;
}
