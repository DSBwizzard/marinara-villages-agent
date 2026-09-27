export type SpriteFacing = "front" | "left" | "right";

type SpriteImage = { view: "front" | "side"; label: string; url: string };

export function spriteFacing(index: number, targetIndex: number): SpriteFacing {
  if (targetIndex < 0 || targetIndex === index) return "front";
  return targetIndex < index ? "left" : "right";
}

export function selectSpriteImage(
  images: readonly SpriteImage[],
  expression: string,
  facing: SpriteFacing,
): { image: SpriteImage; mirrored: boolean } | null {
  const view = facing === "front" ? "front" : "side";
  const image =
    images.find((item) => item.view === view && item.label === expression) ??
    images.find((item) => item.view === view && item.label === "neutral") ??
    images.find((item) => item.view === "front" && item.label === expression) ??
    images.find((item) => item.view === "front" && item.label === "neutral");
  return image ? { image, mirrored: image.view === "side" && facing === "left" } : null;
}
