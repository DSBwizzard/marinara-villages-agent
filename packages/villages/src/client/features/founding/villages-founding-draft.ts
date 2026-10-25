export function evenlySpacedFoundingPins(count: number): { x: number; y: number }[] {
  if (!Number.isInteger(count) || count < 3 || count > 5) throw new Error("Choose one to three founding villagers.");
  return Array.from({ length: count }, (_, index) => ({
    x: 0.22 + (index % (count === 5 ? 3 : 2)) * (count === 5 ? 0.28 : 0.56),
    y: index < (count === 5 ? 3 : 2) ? 0.28 : 0.72,
  }));
}
