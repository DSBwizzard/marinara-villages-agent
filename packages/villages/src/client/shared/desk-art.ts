import type { CSSProperties } from "react";
import type { DeskDestination } from "./DeskWorkspace.js";

const assets = "/api/capability-packages/villages/assets/";
const images = new Map<string, { image: HTMLImageElement; promise: Promise<HTMLImageElement> }>();
const paper = "paper-ivory.webp";
const wood = "menu-desk.jpg";
const materials = ["desk-art/paper-calm.webp", "desk-art/button-olive.webp"];
const maps = ["desk-art/maps.webp", "desk-art/postcard.webp", "desk-art/polaroid.webp"];
const files = (menu: DeskDestination) =>
  menu === "places"
    ? maps
    : menu === "people"
      ? ["people-desk.webp", "people-phone.webp"]
      : [`desk-art/${menu}-desktop.webp`, `desk-art/${menu}-phone.webp`];

// Only fixed package artwork is retained, until this client unloads.
function loadImage(file: string): Promise<HTMLImageElement> {
  const cached = images.get(file);
  if (cached) return cached.promise;
  const image = new Image();
  let url: string | undefined;
  const promise = (async () => {
    const response = await fetch(assets + file, { signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error("Artwork unavailable");
    url = URL.createObjectURL(await response.blob());
    image.src = url;
    await image.decode();
    return image;
  })().catch((error: unknown) => {
    images.delete(file);
    if (url) URL.revokeObjectURL(url);
    throw error;
  });
  images.set(file, { image, promise });
  return promise;
}

export async function prepareDeskArtwork(menu: DeskDestination): Promise<void> {
  await Promise.all(
    [wood, paper, ...materials, ...files(menu)].map(async (file) => {
      const image = await loadImage(file);
      await image.decode();
    }),
  );
}

export function deskArtworkStyle(menu: DeskDestination | null): CSSProperties {
  const paint = (file: string) => {
    const image = images.get(file)?.image;
    return image?.complete && image.naturalWidth ? `url("${image.src}")` : undefined;
  };
  const [desktop, phone] = menu && menu !== "places" ? files(menu) : [];
  return {
    "--desk-wood": paint(wood),
    "--desk-paper": paint(paper),
    "--desk-calm-paper": paint(materials[0]),
    "--desk-olive-button": paint(materials[1]),
    "--desk-art-desktop": desktop ? paint(desktop) : undefined,
    "--desk-art-phone": phone ? paint(phone) : undefined,
    "--desk-maps": menu === "places" ? paint(maps[0]) : undefined,
    "--desk-postcard": menu === "places" ? paint(maps[1]) : undefined,
    "--desk-polaroid": menu === "places" ? paint(maps[2]) : undefined,
  } as CSSProperties;
}
