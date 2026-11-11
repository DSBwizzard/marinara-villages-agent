import type { MailboxState, MailboxMessage } from "../models/social-mail.js";
import { badRequest, conflict } from "./errors.js";
import { mailReceipt, type MailIdentity } from "./mail-evidence.js";
import { memoryHash } from "./memory-integrity.js";

/** Persist exact outgoing words and both identities before any provider request is admitted. */
export function queueMailboxLetter(
  state: MailboxState,
  seed: string,
  mail: MailIdentity,
  requestId: string,
  text: string,
): MailboxState {
  if (!/^[a-zA-Z0-9_-]{1,200}$/.test(requestId)) throw badRequest("Invalid mail request identity.");
  const receipt = mailReceipt(seed, mail, text, "written");
  const prior = Object.values(state.messages).find(
    (row) =>
      row.requestId === requestId && row.from.id === mail.from.id && row.from.incarnation === mail.from.incarnation,
  );
  if (prior) {
    if (
      prior.id !== mail.id ||
      prior.text !== text ||
      memoryHash([prior.from, prior.to]) !== memoryHash([receipt.mail!.from, receipt.mail!.to])
    )
      throw conflict("This request ID already belongs to a different letter or correspondent.");
    return state;
  }
  if (state.messages[mail.id]) throw conflict("This letter identity is already in use.");
  const correspondent = mail.from.id === "player" ? mail.to.id : mail.from.id;
  if (
    Object.values(state.messages).some(
      (row) => row.status === "pending" && (row.from.id === correspondent || row.to.id === correspondent),
    )
  )
    throw conflict("Finish or recover the pending letter before sending another.");
  const message: MailboxMessage = {
    id: mail.id,
    requestId,
    at: mail.at,
    from: receipt.mail!.from,
    to: receipt.mail!.to,
    text,
    status: "pending",
  };
  return { format: 1, revision: state.revision + 1, messages: { ...state.messages, [message.id]: message } };
}
