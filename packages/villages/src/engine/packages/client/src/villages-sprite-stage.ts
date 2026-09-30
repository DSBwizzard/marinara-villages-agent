export type SpriteFacing = "front" | "left" | "right";

type SpriteImage = {
  view: "front" | "side";
  label: string;
  url: string;
  expressionId?: string;
  isDefault?: boolean;
  aliases?: string[];
};

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
  const matches = (item: SpriteImage) =>
    item.expressionId === expression || item.label === expression || item.aliases?.includes(expression);
  const fallback = (item: SpriteImage) => item.isDefault || item.label === "neutral";
  const image =
    images.find((item) => item.view === view && matches(item)) ??
    images.find((item) => item.view === "front" && matches(item)) ??
    images.find(matches) ??
    images.find((item) => item.view === view && item.isDefault) ??
    images.find((item) => item.view === "front" && item.isDefault) ??
    images.find((item) => item.isDefault) ??
    images.find((item) => item.view === view && fallback(item)) ??
    images.find((item) => item.view === "front" && fallback(item)) ??
    images.find((item) => item.view === view) ??
    images[0];
  return image ? { image, mirrored: image.view === "side" && facing === "left" } : null;
}
