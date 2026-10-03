export type SpriteFacing = "front" | "left" | "right";

type SpriteImage = {
  view: "front" | "side";
  label: string;
  url: string;
  expressionId?: string;
  isDefault?: boolean;
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
  const matches = (item: SpriteImage) => (item.expressionId ?? item.label) === expression;
  const defaultId = images.find((item) => item.isDefault)?.expressionId ?? images[0]?.expressionId ?? images[0]?.label;
  const defaults = (item: SpriteImage) => (item.expressionId ?? item.label) === defaultId;
  const image =
    images.find((item) => item.view === view && matches(item)) ??
    images.find(matches) ??
    images.find((item) => item.view === view && defaults(item)) ??
    images.find(defaults);
  return image ? { image, mirrored: image.view === "side" && facing === "left" } : null;
}
