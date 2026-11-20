import type { ResidentSprite } from "../../../shared/contracts/village.js";
type SpriteImage = ResidentSprite["images"][number];

export function selectSpriteImage(
  images: readonly SpriteImage[],
  expression: string,
): { image: SpriteImage; mirrored: boolean } | null {
  const image =
    images.find((entry) => (entry.expressionId ?? entry.label) === expression) ??
    images.find((entry) => entry.isDefault) ??
    images[0];
  return image ? { image, mirrored: false } : null;
}
