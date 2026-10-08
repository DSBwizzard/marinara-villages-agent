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

/** A locally submitted ending owns the room until its response can be shown. */
export function isLocalRoomCompletion(roomId: string, completion: { roomId: string } | null): boolean {
  return completion?.roomId === roomId;
}

/** A failed HTTP response may still have committed its final turn on the server. */
export function hasCompletedRoomSubmission(
  visit: { status: string; submissions?: { id: string }[] },
  submissionId: string,
): boolean {
  return visit.status === "closed" && visit.submissions?.some((entry) => entry.id === submissionId) === true;
}
