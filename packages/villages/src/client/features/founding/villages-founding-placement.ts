/** A new photo may sit beside another, but its center may not land in the middle 40% of that photo. */
export function foundingPhotoOverlaps(
  candidate: { x: number; y: number },
  others: readonly { x: number | null; y: number | null }[],
  picture: { width: number; height: number; photoWidth: number; photoHeight: number },
): boolean {
  const xLimit = (0.2 * picture.photoWidth) / picture.width;
  const yLimit = (0.2 * picture.photoHeight) / picture.height;
  return others.some(
    (other) =>
      other.x !== null &&
      other.y !== null &&
      Math.abs(other.x - candidate.x) < xLimit &&
      Math.abs(other.y - candidate.y) < yLimit,
  );
}
