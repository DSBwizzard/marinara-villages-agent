/** A locally submitted ending owns the room until its response can be shown. */
export function isLocalRoomCompletion(roomId: string, completion: { roomId: string } | null): boolean {
  return completion?.roomId === roomId;
}

export function hasPublishedRoomSubmission(
  visit: { latestTurn?: { id: string; published: boolean } } | null | undefined,
  submissionId: string | undefined,
): boolean {
  return !!submissionId && visit?.latestTurn?.id === submissionId && visit.latestTurn.published;
}
