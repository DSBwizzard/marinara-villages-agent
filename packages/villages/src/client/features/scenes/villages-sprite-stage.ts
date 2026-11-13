import type { ResidentSprite } from "../../../shared/contracts/village.js";

export type SpriteFacing = "front" | "left" | "right";

type SpriteImage = ResidentSprite["images"][number];

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
  const current = images.find(matches);
  const variantGroup = (current ?? (!expression ? defaultEntry : undefined))?.variantGroup;
  const variantFront = () =>
    variantGroup ? images.find((item) => item.view === "front" && item.variantGroup === variantGroup) : undefined;
  const image =
    images.find((item) => item.view === view && matches(item)) ??
    (view === "side" ? current : variantFront()) ??
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
