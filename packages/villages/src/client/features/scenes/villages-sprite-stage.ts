import type { ResidentSprite } from "../../../shared/contracts/village.js";

export type SpriteFacing = "front" | "left" | "right";

type SpriteImage = ResidentSprite["images"][number];

export function selectSpriteImage(
  images: readonly SpriteImage[],
  expression: string,
  facing: SpriteFacing,
  sideExpression?: string,
  named = false,
): { image: SpriteImage; mirrored: boolean } | null {
  const view = facing === "front" ? "front" : "side";
  const matches = (item: SpriteImage) => (item.expressionId ?? item.label) === expression;
  const defaultEntry = images.find((item) => item.isDefault) ?? images[0];
  const defaultId = defaultEntry?.expressionId ?? defaultEntry?.label;
  const defaults = (item: SpriteImage) => (item.expressionId ?? item.label) === defaultId;
  const current = images.find(matches);
  const variantGroup = (current ?? (!expression ? defaultEntry : undefined))?.variantGroup;
  const variantView = (view: SpriteImage["view"]) =>
    variantGroup ? images.find((item) => item.view === view && item.variantGroup === variantGroup) : undefined;
  const image =
    (view === "side" && sideExpression
      ? images.find((item) => item.view === "side" && (item.expressionId ?? item.label) === sideExpression)
      : undefined) ??
    images.find((item) => item.view === view && matches(item)) ??
    (named && current?.view === "side" ? current : undefined) ??
    (view === "side" ? current : variantView("front")) ??
    images.find((item) => item.view === view && defaults(item)) ??
    (named && !expression ? variantView(view) : undefined) ??
    images.find(matches) ??
    images.find(defaults);
  return image
    ? {
        image,
        mirrored: image.view === "side" && facing === "left",
      }
    : null;
}
