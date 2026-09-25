/** Choose the first appended paragraph without moving a reader who is revisiting history. */
export function nextRoomReadIndex(
  previous: { roomId: string; stepCount: number } | null,
  roomId: string,
  stepCount: number,
  currentIndex: number,
): number {
  const last = Math.max(0, stepCount - 1);
  if (!previous || previous.roomId !== roomId) return last;
  if (stepCount > previous.stepCount) return previous.stepCount;
  return Math.min(currentIndex, last);
}
