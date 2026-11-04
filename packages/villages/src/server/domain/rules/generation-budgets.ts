/** Shared request layout; saved responses are local replays, not new requests. */
export function remainingRequests(planned: number, completed: number): number {
  return Math.max(0, planned - completed);
}
export function agendaRequestCount(_days: readonly string[]): number {
  return 1;
}
