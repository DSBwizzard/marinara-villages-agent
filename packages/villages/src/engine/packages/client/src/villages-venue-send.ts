export function shouldSubmitVenueKey(key: string, shiftKey: boolean, composing: boolean, sendOnEnter = false): boolean {
  return sendOnEnter && key === "Enter" && !shiftKey && !composing;
}

/** Keep submission IDs available when a phone opens Marinara over HTTP on the LAN. */
export function createVillagesClientId(): string {
  const browserCrypto = globalThis.crypto;
  if (typeof browserCrypto?.randomUUID === "function") return browserCrypto.randomUUID();
  if (typeof browserCrypto?.getRandomValues === "function") {
    const bytes = browserCrypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

type SceneSendInput = {
  message?: string;
  mode?: string;
  targetId?: string;
  contact?: { kind?: string; boundaryZoneId?: string };
};
type SavedSceneRequest = {
  id: string;
  status: string;
  kind?: string;
  attemptId?: string;
  error?: string;
  input?: SceneSendInput | null;
};

/** Only a deliberate Send authorizes another provider request. */
export function sceneResend(
  saved: SavedSceneRequest | null,
  input: SceneSendInput,
  submissionId: string,
): { submissionId: string; retryOfAttemptId?: string; replaceOfOperationId?: string } {
  if (!saved?.input || (saved.status === "complete" && !saved.error)) return { submissionId };
  if (saved.status === "running") throw new Error("This Scene is still responding. Your draft is preserved.");
  const prior = saved.input;
  const same =
    prior.message === input.message &&
    prior.mode === input.mode &&
    (prior.targetId || "") === (input.targetId || "") &&
    prior.contact?.kind === input.contact?.kind &&
    prior.contact?.boundaryZoneId === input.contact?.boundaryZoneId;
  if (same) return { submissionId: saved.id, retryOfAttemptId: saved.attemptId };
  if (saved.kind !== "turn" || prior.mode !== "chat" || input.mode !== "chat")
    throw new Error("Recover the saved request before changing this message or mode. Your edits are preserved.");
  return {
    submissionId: submissionId === saved.id ? createVillagesClientId() : submissionId,
    retryOfAttemptId: saved.attemptId,
    replaceOfOperationId: saved.id,
  };
}
