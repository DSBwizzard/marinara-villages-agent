import type { VenueReplyLine, VenueScene } from "../models/scene-model.js";
import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { contactPosition } from "./venue-contact.js";
import type { ContactMove } from "./venue-contact.js";
import { residentLocalIdsAt } from "./resident-movement.js";

/** Validate per-fragment witnesses before permitting remote dialogue or downstream evidence. */
export function applyAttentionWitnesses(
  raw: Record<string, unknown>,
  scene: VenueScene,
  message: string,
  parsed: { lines: VenueReplyLine[]; heardPlayerBy: string[] },
  moves: ContactMove[] = [],
) {
  const context = scene.contactGeneration;
  const plan = context?.attention;
  if (!context || !plan) return;
  const rows = raw.attentionWitnesses;
  if (!Array.isArray(rows) || rows.length !== plan.fragments.length)
    throw badGateway(
      "The reply did not establish which attention fragments were heard. Your draft is preserved; retry.",
    );
  const originals = parsed.lines.length;
  const aliases = new Map<string, number>();
  const remoteWitnesses = new Set<string>();
  for (const fragment of plan.fragments) {
    const matches = rows.map(asRecord).filter((row) => row.id === fragment.id);
    const row = matches[0];
    if (
      matches.length !== 1 ||
      typeof row.emitted !== "boolean" ||
      !Array.isArray(row.heardBy) ||
      row.heardBy.some((id) => typeof id !== "string") ||
      (!row.emitted && row.heardBy.length) ||
      (row.emitted &&
        fragment.kind === "sound" &&
        (!Number.isSafeInteger(row.segment) ||
          Number(row.segment) < 0 ||
          Number(row.segment) >= originals ||
          parsed.lines[Number(row.segment)]?.kind !== "narration"))
    )
      throw badGateway("The reply proposed unsupported sound witnesses. Your draft is preserved; retry.");
    const heardBy = [...new Set(row.heardBy as string[])];
    if (
      heardBy.some(
        (id) =>
          !context.localIds.includes(id) &&
          (!context.remoteIds.includes(id) || !fragment.zoneIds.includes(contactPosition(scene, id))),
      )
    )
      throw badGateway("The reply sent attention beyond its adjacent audience. Your draft is preserved; retry.");
    if (!row.emitted) continue;
    for (const id of heardBy) if (context.remoteIds.includes(id)) remoteWitnesses.add(id);
    aliases.set(fragment.id, parsed.lines.length);
    parsed.lines.push({
      kind: fragment.kind === "speech" ? "dialogue" : "narration",
      speakerId: fragment.kind === "speech" ? "" : "__venue_scene__",
      role: fragment.kind === "speech" ? "user" : "assistant",
      content:
        fragment.kind === "speech"
          ? message.slice(fragment.start, fragment.end)
          : "An audible sound comes from the player's Zone.",
      heardBy,
      contactHidden: true,
      attentionEvidence: true,
      evidenceId: fragment.id,
    });
  }
  for (const [index, line] of parsed.lines.slice(0, originals).entries()) {
    const localIds = residentLocalIdsAt(scene, moves, index);
    if (line.kind === "whisper" || line.kind === "side") {
      if (
        !localIds.includes(line.speakerId) ||
        (line.kind === "whisper" && line.targetId !== "player" && !localIds.includes(line.targetId ?? ""))
      )
        throw badGateway("An inaudible remote whisper cannot be delivered. Your draft is preserved; retry.");
      line.heardBy = line.heardBy.filter((id) => localIds.includes(id));
    }
    if (context.remoteIds.includes(line.speakerId) && !remoteWitnesses.has(line.speakerId))
      throw badGateway("A remote speaker reacted without hearing the attention event. Your draft is preserved; retry.");
    if (line.kind === "narration") line.heardBy = [...localIds];
    else
      line.heardBy = line.heardBy.filter(
        (id) =>
          localIds.includes(id) ||
          (context.replyAudiences?.[line.speakerId]?.includes(id) ?? context.localIds.includes(id)),
      );
  }
  parsed.heardPlayerBy = parsed.heardPlayerBy.filter((id) => context.localIds.includes(id));
  const refs = (value: unknown) =>
    Array.isArray(value)
      ? value.map((ref) => (typeof ref === "string" && ref.startsWith("attention:") ? (aliases.get(ref) ?? -1) : ref))
      : value;
  for (const field of ["wishChanges"])
    if (Array.isArray(raw[field]))
      raw[field] = raw[field].map((value) => ({ ...asRecord(value), evidence: refs(asRecord(value).evidence) }));
  if (Array.isArray(raw.memoryChanges))
    for (const value of raw.memoryChanges)
      for (const learner of Object.values(asRecord(asRecord(value).learners)))
        if (Array.isArray(asRecord(learner).support))
          for (const value of asRecord(learner).support as unknown[]) {
            const citation = asRecord(value);
            citation.lineId = (refs([citation.lineId]) as unknown[])[0];
          }
  const relationships = asRecord(raw.relationshipChanges);
  raw.relationshipChanges = Object.fromEntries(
    Object.entries(relationships).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map((row) => ({ ...asRecord(row), lineIds: refs(asRecord(row).lineIds) })) : value,
    ]),
  );
}
