export type SpriteFacing = "front" | "left" | "right";

type SpriteImage = {
  view: "front" | "side";
  label: string;
  url: string;
  expressionId?: string;
  isDefault?: boolean;
};

export function selectSpriteImage(
  images: readonly SpriteImage[],
  expression: string,
  facing: SpriteFacing,
): { image: SpriteImage; mirrored: boolean } | null {
  const view = facing === "front" ? "front" : "side";
  const matches = (item: SpriteImage) => (item.expressionId ?? item.label) === expression;
  const defaultEntry = images.find((item) => item.isDefault) ?? images[0];
  const defaultId = defaultEntry?.expressionId ?? defaultEntry?.label;
  const defaults = (item: SpriteImage) => (item.expressionId ?? item.label) === defaultId;
  const image =
    images.find((item) => item.view === view && matches(item)) ??
    (view === "side" ? images.find(matches) : undefined) ??
    images.find((item) => item.view === view && defaults(item)) ??
    images.find(matches) ??
    images.find(defaults);
  return image
    ? {
        image,
        mirrored: image.view === "side" && facing === "left",
      }
    : null;
}
