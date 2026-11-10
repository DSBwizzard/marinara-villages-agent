import type { VillageState } from "../models/world.js";
import type { MailCapture, MailContinuityPlan } from "../models/social-mail.js";
import { acceptMailContinuity, type MailPublication } from "./mail-continuity.js";
import { mailStagePublication } from "./mail-context.js";
import { continuityHolderKey } from "./continuity.js";
import { readNarrationEffectHeader } from "./narration-contract.js";
import { mailSourceHash, type MailIdentity } from "./mail-evidence.js";
import { asRecord } from "./coerce.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";

export type MailMeaning = { keep: unknown[]; requires: string[] };
export class HeldMail extends Error {
  constructor(readonly rejected: { id: string; reason: string }[]) {
    super(rejected.map((row) => row.id + ": " + row.reason).join("; ") || "The saved mail cannot be accepted.");
  }
}
const requireAccepted = (result: ReturnType<typeof acceptMailContinuity>) => {
  if (result.held) throw new HeldMail(result.rejected);
  return result;
};
const plan = ({
  mail: _mail,
  text: _text,
  phase: _phase,
  requestId: _request,
  replyTo: _reply,
  reading: _reading,
  ...value
}: MailPublication): MailContinuityPlan => value;
function mailRows(meaning: MailMeaning, mail: MailIdentity) {
  const rows: (Record<string, unknown> & { id: string })[] = meaning.keep.map((raw, index) => ({
      ...asRecord(raw),
      id: readNarrationEffectHeader(raw, "keep-" + index).id,
    })),
    valid = (row: Record<string, unknown>) =>
      Array.isArray(row.for) &&
      row.for.length > 0 &&
      new Set(row.for).size === row.for.length &&
      row.for.every((id) => id === mail.from.id || id === mail.to.id),
    writer = rows.filter((row) => !valid(row) || (row.for as string[]).includes(mail.from.id)),
    reader = rows.filter((row) => valid(row) && (row.for as string[]).includes(mail.to.id));
  const labels = new Set(rows.map((row) => row.id));
  memoryRequire(
    labels.size === rows.length && meaning.requires.every((id) => labels.has(id)),
    "mail effect identity or required meaning is missing",
  );
  return { writer: writer.map((row) => (valid(row) ? { ...row, for: [mail.from.id] } : row)), reader };
}

/** Rebase only writes already validated inside this same, still unpublished correspondence candidate. */
function afterMailWrites(capture: MailCapture, before: VillageState, after: VillageState): MailCapture {
  return {
    ...capture,
    supplied: capture.supplied.map((target) => {
      const original = before.continuity.records.find((row) => row.id === target.id),
        current = after.continuity.records.find((row) => row.id === target.id);
      if (!original || !current || original.revision === current.revision) return target;
      memoryRequire(
        original.revision === target.recordRevision &&
          Object.entries(target.heads).every(([key, revision]) => original.heads[key]?.revision === revision),
        "mail target changed before its captured response",
      );
      return {
        ...target,
        recordRevision: current.revision,
        heads: Object.fromEntries(Object.keys(target.heads).map((key) => [key, current.heads[key]?.revision ?? 0])),
      };
    }),
  };
}
function supplyRoot(capture: MailCapture, state: VillageState, id: string, baseline: VillageState) {
  const record = state.continuity.records.find((row) => row.id === id);
  memoryRequire(record, "current letter meaning lost its canonical root");
  const fitted = capture.supplied.find((row) => row.id === id),
    original = baseline.continuity.records.find((row) => row.id === id);
  const target = {
    id,
    recordRevision: record.revision,
    heads: Object.fromEntries(
      capture.actors.flatMap((actor) => {
        const key = continuityHolderKey({ kind: "actor", ...actor });
        return record.heads[key] && (Object.hasOwn(fitted?.heads ?? {}, key) || !original?.heads[key])
          ? [[key, record.heads[key].revision]]
          : [];
      }),
    ),
  };
  capture.supplied = [...capture.supplied.filter((row) => row.id !== id), target];
}

/** One model meaning can teach writer and reader at their actual communication stages. */
function deliverLetter(
  state: VillageState,
  capture: MailCapture,
  mail: MailIdentity,
  text: string,
  requestId: string,
  meaning: MailMeaning,
  digest: string,
  at: string,
  readNow: boolean,
  replyTo?: string,
  baseline = { ...state },
) {
  const before = { ...state },
    { writer, reader } = mailRows(meaning, mail);
  const writing = mailStagePublication(
      capture,
      mail,
      text,
      "written",
      writer,
      meaning.requires.filter((id) => writer.some((row) => row.id === id)),
      digest,
      requestId,
      replyTo,
    ),
    candidate = { ...state },
    written = requireAccepted(acceptMailContinuity(candidate, writing, at)),
    roots = new Map<string, string>();
  for (const id of written.acceptedIds) {
    const receipt = candidate.continuity.receipts[writing.admission.operationId + ":" + id];
    if (receipt?.roots[0]) roots.set(id, receipt.roots[0]);
  }
  const readingCapture = afterMailWrites(capture, before, candidate),
    readerIds = new Set(reader.map((row) => row.id));
  const learning = reader.flatMap((raw) => {
    const row: Record<string, unknown> & { id: string; for: string[] } = { ...raw, for: [mail.to.id] };
    if (writer.some((writer) => writer.id === row.id)) {
      const root = roots.get(row.id);
      if (!root) return [];
      supplyRoot(readingCapture, candidate, root, baseline);
      row.replace = root;
      delete row.offer;
      delete row.accept;
      delete row.closeOffer;
    }
    if (Array.isArray(row.requires))
      row.requires = row.requires.filter(
        (id) => readerIds.has(String(id)) || !written.acceptedIds.includes(String(id)),
      );
    return [row];
  });
  const reading = mailStagePublication(
      readingCapture,
      mail,
      text,
      "read",
      learning,
      meaning.requires.filter((id) => readerIds.has(id)),
      digest,
      requestId,
      replyTo,
    ),
    checkedRead = { ...candidate },
    read = requireAccepted(acceptMailContinuity(checkedRead, reading, at));
  for (const id of read.acceptedIds) {
    const receipt = checkedRead.continuity.receipts[reading.admission.operationId + ":" + id];
    if (receipt?.roots[0]) roots.set(id, receipt.roots[0]);
  }
  if (readNow) {
    state.continuity = checkedRead.continuity;
    state.episodes = checkedRead.episodes;
    state.mailbox = checkedRead.mailbox;
  } else {
    const final = requireAccepted(acceptMailContinuity(state, { ...writing, reading: plan(reading) }, at));
    memoryRequire(
      memoryHash(final.acceptedIds) === memoryHash(written.acceptedIds),
      "prepared mail changed its accepted writer meanings",
    );
  }
  return { roots, rejected: [...written.rejected, ...read.rejected] };
}

export type MailExchange = {
  capture: MailCapture;
  incoming: MailIdentity & { text: string; requestId: string };
  incomingMeaning: MailMeaning;
  replyText: string;
  replyMeaning: MailMeaning;
  responseDigest: string;
};
/** Incoming writing/reading and the reply's writing share one Village CAS; Player reading stays separate. */
export function acceptMailExchange(state: VillageState, exchange: MailExchange, at: string) {
  const { incoming, capture } = exchange,
    before = { ...state },
    candidate = { ...state },
    digest = memoryHash(exchange),
    writer = mailRows(exchange.incomingMeaning, incoming).writer,
    writing = mailStagePublication(
      capture,
      incoming,
      incoming.text,
      "written",
      writer,
      exchange.incomingMeaning.requires.filter((id) => writer.some((row) => row.id === id)),
      digest,
      incoming.requestId,
    ),
    prior = state.episodes.records.find((episode) => episode.id === writing.admission.episodeId);
  if (prior) {
    memoryRequire(
      prior.responseDigest === memoryHash(writing) &&
        state.mailbox.messages[incoming.id]?.readAt &&
        (!exchange.replyText || state.mailbox.messages[incoming.id + ":reply"]?.text === exchange.replyText),
      "accepted mail exchange identity reused or incomplete",
    );
    return [];
  }
  const delivered = deliverLetter(
    candidate,
    capture,
    incoming,
    incoming.text,
    incoming.requestId,
    exchange.incomingMeaning,
    digest,
    at,
    true,
  );
  if (exchange.replyText) {
    const reply: MailIdentity = { id: incoming.id + ":reply", at, from: incoming.to, to: incoming.from },
      replyCapture = afterMailWrites(capture, before, candidate),
      keep = exchange.replyMeaning.keep.map((raw) => {
        const value = asRecord(raw);
        if (typeof value.replace !== "string" || !value.replace.startsWith("incoming:")) return raw;
        const root = delivered.roots.get(value.replace.slice("incoming:".length));
        memoryRequire(root, "reply cites an unaccepted incoming meaning");
        supplyRoot(replyCapture, candidate, root, before);
        return { ...value, replace: root };
      });
    deliverLetter(
      candidate,
      replyCapture,
      reply,
      exchange.replyText,
      "reply-" + mailSourceHash(capture.seed, incoming, incoming.text).slice(0, 32),
      { ...exchange.replyMeaning, keep },
      digest,
      at,
      false,
      incoming.id,
      before,
    );
  } else
    memoryRequire(
      !exchange.replyMeaning.keep.length && !exchange.replyMeaning.requires.length,
      "absent reply cannot support meaning",
    );
  state.continuity = candidate.continuity;
  state.episodes = candidate.episodes;
  state.mailbox = candidate.mailbox;
  return delivered.rejected;
}

export function readDeliveredLetter(state: VillageState, id: string, at: string) {
  const letter = state.mailbox.messages[id];
  memoryRequire(letter?.status === "delivered" && letter.to.id === "player", "that delivered letter is unavailable");
  if (letter.readAt) return;
  memoryRequire(letter.reading, "delivered letter lost its saved reading work");
  requireAccepted(
    acceptMailContinuity(
      state,
      {
        ...letter.reading,
        mail: { id: letter.id, at: letter.at, from: letter.from, to: letter.to },
        text: letter.text,
        requestId: letter.requestId,
        ...(letter.replyTo ? { replyTo: letter.replyTo } : {}),
        phase: "read",
      },
      at,
    ),
  );
}

/** Autonomous mail uses meaning already authored by its existing GM opportunity, with no interpretation purchase. */
export function acceptResidentLetter(
  state: VillageState,
  capture: MailCapture,
  mail: MailIdentity,
  text: string,
  requestId: string,
  meaning: MailMeaning,
  responseDigest: string,
  at: string,
) {
  const digest = memoryHash([capture, mailSourceHash(capture.seed, mail, text), requestId, meaning, responseDigest]),
    writer = mailRows(meaning, mail).writer,
    writing = mailStagePublication(
      capture,
      mail,
      text,
      "written",
      writer,
      meaning.requires.filter((id) => writer.some((row) => row.id === id)),
      digest,
      requestId,
    ),
    prior = state.episodes.records.find((episode) => episode.id === writing.admission.episodeId);
  if (prior) {
    const reading = state.mailbox.messages[mail.id]?.reading;
    memoryRequire(
      reading && prior.responseDigest === memoryHash({ ...writing, reading }),
      "accepted autonomous letter identity reused",
    );
    return [];
  }
  const candidate = { ...state },
    result = deliverLetter(candidate, capture, mail, text, requestId, meaning, digest, at, false);
  state.continuity = candidate.continuity;
  state.episodes = candidate.episodes;
  state.mailbox = candidate.mailbox;
  return result.rejected;
}
