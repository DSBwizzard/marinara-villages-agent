/** A locally submitted ending owns the room until its response can be shown. */
export function isLocalRoomCompletion(roomId: string, completion: { roomId: string } | null): boolean {
  return completion?.roomId === roomId;
}

/** A failed HTTP response may still have committed its final turn on the server. */
export function hasCompletedRoomSubmission(
  visit: { status: string; latestTurn?: { id: string; published: boolean } },
  submissionId: string,
): boolean {
  return visit.status === "closed" && hasPublishedRoomSubmission(visit, submissionId);
}
export function hasPublishedRoomSubmission(
  visit: { latestTurn?: { id: string; published: boolean } } | null | undefined,
  submissionId: string | undefined,
): boolean {
  return !!submissionId && visit?.latestTurn?.id === submissionId && visit.latestTurn.published;
}
