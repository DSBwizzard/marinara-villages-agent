import type { CSSProperties } from "react";
import type { DeskDestination } from "./DeskWorkspace.js";
import { loadLetterFont } from "./letter-font-css.js";

type ArtworkLayer = {
  url: string;
  property: string;
  loaded?: { image: HTMLImageElement; ready: Promise<void> };
  decoded?: boolean;
};

const assets = "/api/capability-packages/villages/assets/";
export const STORYBOOK_BACKGROUND_URL = assets + "storybook-background-wide.webp";
export const VENUE_FALLBACK_URL = assets + "venue-fallback.webp";
export const VENUE_FALLBACK_DAY_URL = assets + "venue-fallback-day.webp";

// The foreground matte uses the same pixel coordinates as the backdrop.
const night: ArtworkLayer = { url: STORYBOOK_BACKGROUND_URL, property: "--menu-art" };
const day: ArtworkLayer = { url: assets + "storybook-background-day.webp", property: "--menu-art" };
const matte: ArtworkLayer = { url: assets + "storybook-scenery-matte.webp", property: "--menu-scenery-matte" };

async function prepareLayer(layer: ArtworkLayer): Promise<void> {
  if (!layer.loaded) {
    const image = new Image();
    let url: string | undefined;
    const ready = (async () => {
      const response = await fetch(layer.url, {
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) throw new Error("Artwork unavailable");
      url = URL.createObjectURL(await response.blob());
      image.src = url;
      await image.decode();
      layer.decoded = true;
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

export async function prepareDeskArtwork(daylight: boolean): Promise<void> {
  const prepareDay = prepareDayDeskArtwork();
  await Promise.all([
    prepareLayer(night),
    prepareLayer(matte),
    loadLetterFont("lora").catch(() => {}),
    daylight ? prepareDay : undefined,
  ]);
}

export function prepareDayDeskArtwork(): Promise<void> {
  return prepareLayer(day).catch(() => {});
}

export function dayDeskArtworkReady(): boolean {
  return day.decoded === true;
}

export function deskArtworkStyle(menu: DeskDestination | null, daylight: boolean): CSSProperties {
  if (!menu) return {};
  return Object.fromEntries(
    [daylight ? day : night, matte].map(({ property, loaded }) => [
      property,
      loaded?.image.complete ? `url("${loaded.image.src}")` : undefined,
    ]),
  ) as CSSProperties;
}
