import type { CSSProperties } from "react";
import type { DeskDestination } from "./DeskWorkspace.js";

const assets = "/api/capability-packages/villages/assets/";
const images = new Map<string, { image: HTMLImageElement; promise: Promise<HTMLImageElement> }>();
const paper = "paper-ivory.webp";
const wood = "menu-desk.jpg";
const venueFiles = ["desk-art/venue-desktop.webp", "desk-art/venue-phone.webp"];
const files = (menu: DeskDestination) =>
  menu === "people"
    ? ["people-desk.webp", "people-phone.webp"]
    : [`desk-art/${menu}-desktop.webp`, `desk-art/${menu}-phone.webp`];

// Only the fourteen fixed package images are retained, until this client unloads.
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
    [wood, paper, ...files(menu), ...(menu === "places" ? venueFiles : [])].map(async (file) => {
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
  const [desktop, phone] = menu ? files(menu) : [];
  return {
    "--desk-wood": paint(wood),
    "--desk-paper": paint(paper),
    "--desk-art-desktop": desktop ? paint(desktop) : undefined,
    "--desk-art-phone": phone ? paint(phone) : undefined,
    "--desk-venue-desktop": menu === "places" ? paint(venueFiles[0]) : undefined,
    "--desk-venue-phone": menu === "places" ? paint(venueFiles[1]) : undefined,
  } as CSSProperties;
}
