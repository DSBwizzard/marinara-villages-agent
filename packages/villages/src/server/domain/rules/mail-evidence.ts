import type { AcceptedEpisode } from "../models/episode-model.js";
import type { ContinuityEvidence } from "../models/continuity-model.js";
import { memoryHash, memoryRequire, memoryString, memoryTimestamp } from "./memory-integrity.js";

type Receipt = AcceptedEpisode["commandReceipts"][number];
export type MailIdentity = Omit<NonNullable<Receipt["mail"]>, "phase" | "sourceHash">;
export const mailSourceHash = (seed: string, mail: MailIdentity, text: string) =>
  memoryHash([seed, mail.id, mail.at, [mail.from.id, mail.from.incarnation], [mail.to.id, mail.to.incarnation], text]);

/** Writing and reading are native delivery facts; the contents remain attributed written claims. */
export function mailReceipt(seed: string, mail: MailIdentity, text: string, phase: "written" | "read"): Receipt {
  memoryString(seed, 160);
  memoryString(mail.id, 512);
  memoryTimestamp(mail.at);
  memoryRequire(text.length <= 4000 && text.trim().length > 0, "invalid written letter length");
  for (const actor of [mail.from, mail.to]) {
    memoryString(actor.id, 160);
    memoryString(actor.incarnation, 160);
  }
  memoryRequire(
    mail.from.id !== mail.to.id && [mail.from.id, mail.to.id].filter((id) => id === "player").length === 1,
    "personal letter needs its two distinct correspondents",
  );
  const sourceHash = mailSourceHash(seed, mail, text);
  return {
    id: "mail-" + phase + "-" + sourceHash,
    kind: "mail",
    targetId: sourceHash,
    revision: 1,
    text,
    witnesses: [phase === "written" ? mail.from.id : mail.to.id],
    mail: {
      id: mail.id,
      at: mail.at,
      from: { id: mail.from.id, incarnation: mail.from.incarnation },
      to: { id: mail.to.id, incarnation: mail.to.incarnation },
      phase,
      sourceHash,
    },
  };
}

export function assertMailReceipt(episode: AcceptedEpisode, receipt: Receipt) {
  memoryRequire(receipt.mail, "missing letter identity");
  const expected = mailReceipt(episode.seed, receipt.mail, receipt.text, receipt.mail.phase);
  const participants = receipt.mail.phase === "written" ? [receipt.mail.from] : [receipt.mail.from, receipt.mail.to];
  memoryRequire(
    !episode.sceneId &&
      !episode.room &&
      !episode.sceneDelta &&
      !episode.privateInput &&
      !episode.segments.length &&
      !episode.offered.length &&
      episode.commandReceipts.length === 1,
    "correspondence cannot fabricate a Scene or native action",
  );
  memoryRequire(memoryHash(receipt) === memoryHash(expected), "native letter content or read scope changed");
  memoryRequire(
    episode.id === expected.id && episode.submissionId === expected.id && episode.operationId === expected.id,
    "letter stage changed its canonical episode identity",
  );
  memoryRequire(receipt.mail.at <= episode.capturedAt, "letter predates its admitted writing");
  memoryRequire(
    episode.actors.length === participants.length &&
      participants.every((party) =>
        episode.actors.some(
          (actor) => actor.id === party.id && actor.incarnation === party.incarnation && actor.zoneId === "native",
        ),
      ),
    "letter knowledge scope changed its correspondent incarnation",
  );
}

export function mailEvidence(
  episodeId: string,
  seed: string,
  receipt: Receipt,
  act?: ContinuityEvidence["act"],
): ContinuityEvidence {
  memoryRequire(receipt.kind === "mail" && receipt.mail, "written source needs a native letter");
  const mail = receipt.mail;
  memoryRequire(mail.sourceHash === mailSourceHash(seed, mail, receipt.text), "written source identity changed");
  memoryRequire(!act || mail.phase === "written", "reading a letter cannot create a decision act");
  return {
    id: "mail-source-" + memoryHash([episodeId, receipt.id, act ?? null]).slice(0, 32),
    seed,
    episodeId,
    unitId: "mail:" + mail.sourceHash,
    fingerprint: mail.sourceHash,
    kind: "written",
    actorId: mail.from.id,
    excerpt: receipt.text,
    committedReceiptId: receipt.id,
    perceptions: receipt.witnesses.map((actorId) => ({ actorId, channel: "words", text: receipt.text })),
    ...(act ? { act } : {}),
  };
}

export function assertMailHistory(episodes: AcceptedEpisode[]) {
  const written = new Map<string, { receipt: Receipt; at: string }>();
  const messages = new Map<string, string>();
  const stages = new Set<string>();
  for (const episode of episodes)
    for (const receipt of episode.commandReceipts) {
      if (!receipt.mail) continue;
      const key = receipt.mail.sourceHash;
      memoryRequire(
        !messages.has(receipt.mail.id) || messages.get(receipt.mail.id) === key,
        "letter message identity changed its original writing",
      );
      messages.set(receipt.mail.id, key);
      memoryRequire(!stages.has(receipt.id), "letter stage identity was reused");
      stages.add(receipt.id);
      if (receipt.mail.phase === "written") {
        memoryRequire(!written.has(key), "letter writing identity was reused");
        written.set(key, { receipt, at: episode.acceptedAt });
      } else {
        const original = written.get(key);
        memoryRequire(
          original &&
            original.at <= episode.capturedAt &&
            original.receipt.text === receipt.text &&
            memoryHash({ ...original.receipt.mail, phase: "read" }) === memoryHash(receipt.mail),
          "letter read lost its exact original writing",
        );
      }
    }
}

export function episodeMailEvidence(episode: AcceptedEpisode, unitId: string) {
  const receipt = episode.commandReceipts.find(
    (receipt) => receipt.mail && unitId === "mail:" + receipt.mail.sourceHash,
  );
  return receipt ? mailEvidence(episode.id, episode.seed, receipt) : undefined;
}
