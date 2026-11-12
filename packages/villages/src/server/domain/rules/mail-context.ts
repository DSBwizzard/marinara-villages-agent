import type { ContinuityCapture } from "../models/continuity-model.js";
import { continuityHolderKey } from "./continuity.js";
import { memoryHash, memoryRequire } from "./memory-integrity.js";
import { mailReceipt, type MailIdentity } from "./mail-evidence.js";
import type { MailPublication } from "./mail-continuity.js";
import type { MailRoomContext } from "../models/social-mail.js";
import { continuityContextScopeKey } from "./continuity-context.js";
import { episodeContextRooms } from "./episode-sources.js";

/** Bind captured aliases to the final exact written artifact without purchasing another interpretation. */
export function mailStagePublication(
  capture: ContinuityCapture,
  mail: MailIdentity,
  text: string,
  phase: "written" | "read",
  keep: unknown[],
  requires: string[],
  responseDigest: string,
  requestId: string,
  replyTo?: string,
  roomContext?: MailRoomContext,
): MailPublication {
  const receipt = mailReceipt(capture.seed, mail, text, phase),
    parties = phase === "written" ? [mail.from] : [mail.from, mail.to],
    portrayed = phase === "written" ? mail.from : mail.to,
    holder = { kind: "actor" as const, ...portrayed },
    generated = phase === "written" && mail.from.id !== "player",
    rooms =
      generated || keep.length || (phase === "read" && mail.from.id !== "player")
        ? episodeContextRooms({ actors: capture.actors }, Object.keys(capture.provenance))
        : [],
    references = generated
      ? [...capture.actors, ...capture.references]
          .filter(
            (actor) =>
              actor.id !== portrayed.id && capture.provenance[continuityHolderKey({ kind: "actor", ...actor })]?.length,
          )
          .map((actor) => ({ kind: "actor" as const, ...actor }))
      : [],
    historical = Object.fromEntries(
      Object.entries(capture.historical)
        .filter(([, source]) => source.kind !== "knowledge" || generated || source.actorId === portrayed.id)
        .map(([ref, source]) => [
          ref,
          source.kind === "knowledge"
            ? {
                ...source,
                episodeId: receipt.id,
                id: "source-" + memoryHash([receipt.id, source.fingerprint]).slice(0, 32),
              }
            : source,
        ]),
    );
  memoryRequire(
    capture.actors.some((actor) => actor.id === mail.from.id && actor.incarnation === mail.from.incarnation) &&
      capture.actors.some((actor) => actor.id === mail.to.id && actor.incarnation === mail.to.incarnation),
    "mail stage changed captured correspondents",
  );
  return {
    setupAt: capture.setupAt,
    mail: {
      id: mail.id,
      at: mail.at,
      from: { id: mail.from.id, incarnation: mail.from.incarnation },
      to: { id: mail.to.id, incarnation: mail.to.incarnation },
    },
    text,
    phase,
    requestId,
    ...(replyTo ? { replyTo } : {}),
    historical,
    keep,
    offered: generated ? capture.offered.filter((row) => row.holder.id === mail.from.id) : [],
    requires,
    responseDigest,
    ...(roomContext ? { roomContext } : {}),
    admission: {
      seed: capture.seed,
      operationId: receipt.id,
      episodeId: receipt.id,
      at: capture.at,
      actors: parties.map(({ id, incarnation }) => ({ id, incarnation })),
      subjects: capture.subjects,
      continuityRevision: capture.continuityRevision,
      sources: [],
      supplied: capture.supplied,
      protectedRoots: [...new Set([...capture.protectedRoots, ...(roomContext?.protectedRoots ?? [])])],
      protectionFingerprint:
        capture.protection[
          continuityContextScopeKey([
            mail.from,
            mail.to,
            ...references.filter((actor) => actor.id !== mail.to.id),
            ...(phase === "read" && !keep.length ? [] : rooms),
          ])
        ],
      sourceActors: capture.sourceActors,
      provenance: Object.fromEntries(
        [holder, ...references]
          .map((holder) => [continuityHolderKey(holder), capture.provenance[continuityHolderKey(holder)] ?? []])
          .concat(rooms.map((holder) => [continuityHolderKey(holder), capture.provenance[continuityHolderKey(holder)]]))
          .concat(
            roomContext
              ? [
                  [
                    continuityHolderKey(roomContext.holder),
                    [
                      ...new Set([
                        ...(capture.provenance[continuityHolderKey(roomContext.holder)] ?? []),
                        ...roomContext.provenance,
                      ]),
                    ],
                  ],
                ]
              : [],
          ),
      ),
    },
  };
}
