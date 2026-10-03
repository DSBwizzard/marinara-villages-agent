/** Shared request layout; saved responses are local replays, not new requests. */
export function translationBatchSize(maxOutputTokens: number | null | undefined): number {
  return Math.min(10, Math.max(2, Math.floor((maxOutputTokens ?? 5000) / 350)));
}
export function translationRequestCount(blocks: number, batchSize: number): number {
  return Math.ceil(Math.max(0, blocks) / batchSize);
}
export function remainingRequests(planned: number, completed: number): number {
  return Math.max(0, planned - completed);
}
export function agendaRequestCount(days: readonly string[]): number {
  return 1 + days.length;
}
