import type { VenueReplyLine, VenueScene } from "../models/scene-model.js";
import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { contactPosition, type ContactMove } from "./venue-contact.js";
import { acousticReach, soundDeliveries, type SoundDelivery } from "./scene-acoustics.js";

export function applyAcousticWitnesses(
  raw: Record<string, unknown>,
  scene: VenueScene,
  message: string,
  parsed: { lines: VenueReplyLine[]; heardPlayerBy: string[] },
  moves: ContactMove[] = [],
) {
  const context = scene.contactGeneration,
    plan = context?.attention,
    venue = context?.venue;
  if (!context?.acoustics || !plan || !venue) return;
  const fail = (reason = "unsupported-hearing") =>
    Object.assign(
      badGateway(
        reason === "sound-event-segment"
          ? "The generated reply did not link the sound to its narrated action. Nothing was applied; your draft is preserved."
          : `The generated reply failed sound validation (${reason}). Nothing was applied; your draft is preserved.`,
      ),
      {
        acousticReason: reason,
      },
    );
  const ids = [...new Set([...context.localIds, ...context.remoteIds])];
  const original = parsed.lines.length,
    aliases = new Map<string, number>(),
    noticed = new Set(context.localIds);
  const projections = new Map<number, VenueReplyLine[]>();
  const project = (index: number, line: VenueReplyLine) => {
    projections.set(index, [...(projections.get(index) ?? []), line]);
  };
  const position = (id: string, segment = -1) =>
    moves.find((move) => move.characterId === id && move.segment !== undefined && move.segment <= segment)?.zoneId ??
    contactPosition(scene, id);
  const witnesses = (value: unknown) => {
    if (
      !Array.isArray(value) ||
      value.some((id) => typeof id !== "string" || !ids.includes(id)) ||
      new Set(value).size !== value.length
    )
      throw fail("unsupported-listeners");
    return value as string[];
  };
  const addEvidence = (content: string, heardBy: string[], kind: "dialogue" | "narration", alias: string) => {
    aliases.set(alias, parsed.lines.length);
    parsed.lines.push({
      kind,
      speakerId: kind === "dialogue" ? "" : "__venue_scene__",
      role: kind === "dialogue" ? "user" : "assistant",
      content,
      heardBy,
      contactHidden: true,
      attentionEvidence: true,
      evidenceId: alias,
    });
  };
  if (!Array.isArray(raw.attentionWitnesses) || raw.attentionWitnesses.length !== plan.fragments.length)
    throw fail("fragment-count");
  for (const fragment of plan.fragments) {
    const matches = raw.attentionWitnesses.map(asRecord).filter((row) => row.id === fragment.id);
    const row = matches[0];
    if (matches.length !== 1) throw fail("fragment-id");
    if (typeof row.emitted !== "boolean") throw fail("fragment-emission");
    const heard = witnesses(row.heardBy),
      understood = witnesses(row.understoodBy);
    if (
      (!row.emitted && (heard.length || understood.length)) ||
      understood.some((id) => !heard.includes(id)) ||
      heard.some((id) => !context.localIds.includes(id) && !fragment.zoneIds.includes(position(id))) ||
      understood.some(
        (id) =>
          fragment.kind !== "speech" ||
          (!context.localIds.includes(id) && !fragment.wordZoneIds?.includes(position(id))),
      )
    )
      throw fail();
    if (
      row.emitted &&
      fragment.kind === "sound" &&
      (!Number.isSafeInteger(row.segment) ||
        Number(row.segment) < 0 ||
        Number(row.segment) >= original ||
        parsed.lines[Number(row.segment)]?.kind !== "narration")
    )
      throw fail("sound-event-segment");
    if (!row.emitted) continue;
    heard.forEach((id) => noticed.add(id));
    addEvidence(
      fragment.kind === "speech"
        ? "Speech is audible, without its words."
        : fragment.delivery === "exceptional"
          ? "An exceptionally loud sound is audible."
          : "A sound is audible.",
      heard,
      "narration",
      "sound:" + fragment.id,
    );
    if (fragment.kind === "speech")
      addEvidence(message.slice(fragment.start, fragment.end), understood, "dialogue", fragment.id);
    else aliases.set(fragment.id, aliases.get("sound:" + fragment.id)!);
  }
  const replies = Array.isArray(raw.acousticReplies) ? raw.acousticReplies.map(asRecord) : [];
  const usedReplies = new Set<number>();
  const events = Array.isArray(raw.acousticEvents) ? raw.acousticEvents.map(asRecord) : [];
  const usedEvents = new Set<number>();
  for (const [index, line] of parsed.lines.slice(0, original).entries()) {
    const local = ids.filter((id) => position(id, index) === (scene.zoneId ?? "exterior"));
    for (const move of moves.filter((move) => move.segment === index))
      if (!context.localIds.includes(move.characterId) && !noticed.has(move.characterId)) throw fail();
    if (line.kind === "narration") {
      const before = ids.filter((id) => position(id, index - 1) === (scene.zoneId ?? "exterior"));
      line.heardBy = [
        ...new Set([
          ...before,
          ...local,
          ...moves.filter((move) => move.segment === index).map((move) => move.characterId),
        ]),
      ];
      const matching = events.filter((row) => row.segment === index);
      if (matching.length > 1) throw fail();
      if (matching.length) {
        if (moves.some((move) => move.segment === index)) throw fail();
        const event = matching[0],
          actor = String(event.speakerId);
        if (
          !ids.includes(actor) ||
          (!local.includes(actor) && !noticed.has(actor)) ||
          !soundDeliveries.includes(event.delivery as SoundDelivery) ||
          typeof event.emitted !== "boolean" ||
          typeof event.playerHeard !== "boolean"
        )
          throw fail();
        const heard = witnesses(event.heardBy);
        const from = position(actor, index),
          reach = acousticReach(venue, scene, from, event.delivery as SoundDelivery, true);
        if (
          (!event.emitted && (heard.length || event.playerHeard)) ||
          heard.some((id) => position(id, index) !== from && !reach.sound.includes(position(id, index))) ||
          (event.playerHeard && from !== scene.zoneId && !reach.sound.includes(scene.zoneId ?? "exterior"))
        )
          throw fail();
        usedEvents.add(index);
        if (event.emitted) {
          heard.forEach((id) => noticed.add(id));
          addEvidence(
            event.delivery === "exceptional" ? "An exceptionally loud sound is audible." : "A sound is audible.",
            heard,
            "narration",
            "reply-sound:" + index,
          );
        }
        if (!local.includes(actor)) {
          line.heardBy = [];
          line.contactHidden = true;
          if (event.playerHeard)
            project(index, {
              kind: "narration",
              speakerId: "__venue_scene__",
              content:
                event.delivery === "exceptional" ? "An exceptionally loud sound is audible." : "A sound is audible.",
              heardBy: heard.filter((id) => local.includes(id)),
            });
        }
      }
      continue;
    }
    if (line.kind === "whisper" || line.kind === "side") {
      if (
        !local.includes(line.speakerId) ||
        (line.targetId && line.targetId !== "player" && !local.includes(line.targetId))
      )
        throw fail();
      line.heardBy = [...new Set([...line.heardBy.filter((id) => local.includes(id)), line.speakerId])];
      continue;
    }
    if (!ids.includes(line.speakerId) || (!local.includes(line.speakerId) && !noticed.has(line.speakerId)))
      throw fail();
    const matching = replies.filter((row) => row.segment === index),
      row = matching[0];
    if (
      matching.length !== 1 ||
      usedReplies.has(index) ||
      !soundDeliveries.includes(row.delivery as SoundDelivery) ||
      row.delivery === "exceptional" ||
      typeof row.outward !== "boolean" ||
      typeof row.playerHeard !== "boolean" ||
      typeof row.playerUnderstood !== "boolean"
    )
      throw fail();
    usedReplies.add(index);
    const origin = position(line.speakerId, index),
      reach = acousticReach(venue, scene, origin, row.delivery as SoundDelivery, row.outward);
    const heard = witnesses(row.heardBy),
      understood = witnesses(row.understoodBy);
    const within = (id: string, spaces: string[]) =>
      position(id, index) === origin || spaces.includes(position(id, index));
    if (
      heard.some((id) => !within(id, reach.sound)) ||
      understood.some((id) => !heard.includes(id) || !within(id, reach.words)) ||
      (row.playerUnderstood && !row.playerHeard) ||
      (row.playerHeard && origin !== scene.zoneId && !reach.sound.includes(scene.zoneId ?? "exterior")) ||
      (row.playerUnderstood && origin !== scene.zoneId && !reach.words.includes(scene.zoneId ?? "exterior"))
    )
      throw fail();
    // Authored speech establishes the speaker's own words, never nearby narration.
    line.heardBy = [...new Set([...understood, line.speakerId])];
    if (!row.playerUnderstood) {
      line.contactHidden = true;
      if (row.playerHeard)
        project(index, {
          kind: "narration",
          speakerId: "__venue_scene__",
          content: "A voice is audible, but the words are indistinct.",
          heardBy: heard.filter((id) => local.includes(id)),
        });
    }
    if (heard.some((id) => !understood.includes(id)) || JSON.stringify(raw).includes('"reply-sound:' + index + '"'))
      addEvidence("A voice is audible, without its words.", heard, "narration", "reply-sound:" + index);
    heard.forEach((id) => noticed.add(id));
  }
  if (replies.length !== usedReplies.size || events.length !== usedEvents.size) throw fail();
  parsed.heardPlayerBy = parsed.heardPlayerBy.filter((id) => context.localIds.includes(id));
  // Insert public projections next to their cause while keeping hidden evidence intact.
  const oldLines = parsed.lines;
  const indexes = new Map<number, number>();
  parsed.lines = [];
  oldLines.forEach((line, index) => {
    indexes.set(index, parsed.lines.length);
    parsed.lines.push(line, ...(projections.get(index) ?? []));
  });
  for (const line of parsed.lines)
    if (line.anchorIndex !== undefined) line.anchorIndex = indexes.get(line.anchorIndex) ?? line.anchorIndex;
  for (const move of moves) if (move.segment !== undefined) move.segment = indexes.get(move.segment) ?? move.segment;
  const wholeSpeech = plan.fragments.find(
    (fragment) =>
      fragment.kind === "speech" && fragment.start === 0 && fragment.end === message.length && aliases.has(fragment.id),
  );
  const refs = (value: unknown, knowers: unknown = []) =>
    Array.isArray(value)
      ? value.map((ref) => {
          if (
            ref === "player" &&
            wholeSpeech &&
            Array.isArray(knowers) &&
            knowers.length &&
            knowers.every((id) => oldLines[aliases.get(wholeSpeech.id)!].heardBy.includes(id))
          )
            return indexes.get(aliases.get(wholeSpeech.id)!)!;
          if (typeof ref === "number") return indexes.get(ref) ?? -1;
          if (typeof ref === "string" && /^(?:attention:|sound:attention:|reply-sound:)/u.test(ref))
            return indexes.get(aliases.get(ref) ?? -1) ?? -1;
          return ref;
        })
      : value;
  if (Array.isArray(raw.memoryChanges))
    for (const value of raw.memoryChanges)
      for (const [id, learner] of Object.entries(asRecord(asRecord(value).learners)))
        if (Array.isArray(asRecord(learner).support))
          for (const value of asRecord(learner).support as unknown[]) {
            const citation = asRecord(value);
            citation.lineId = (refs([citation.lineId], [id]) as unknown[])[0];
          }
  for (const field of ["wishChanges"])
    if (Array.isArray(raw[field]))
      raw[field] = raw[field].map((value) => {
        const row = asRecord(value),
          evidence = refs(row.evidence, [row.actorId]);
        const cited = Array.isArray(evidence)
          ? evidence.flatMap((ref) => (typeof ref === "number" && parsed.lines[ref] ? [parsed.lines[ref]] : []))
          : [];
        const onlyNoise =
          cited.length > 0 && cited.every((line) => line.attentionEvidence && line.kind === "narration");
        return {
          ...row,
          evidence,
          ...(onlyNoise ? { text: [...new Set(cited.map((line) => line.content))].join(" ") } : {}),
        };
      });
  for (const field of ["roomEvents", "projectSpeech"])
    if (Array.isArray(raw[field]))
      raw[field] = raw[field].map((value) => {
        const row = asRecord(value);
        return {
          ...row,
          ...(Array.isArray(row.evidence) ? { evidence: refs(row.evidence) } : {}),
          ...(Array.isArray(row.citations)
            ? {
                citations: row.citations.map((value) => {
                  const citation = asRecord(value);
                  return {
                    ...citation,
                    ...(typeof citation.segment === "number" ? { segment: indexes.get(citation.segment) ?? -1 } : {}),
                  };
                }),
              }
            : {}),
        };
      });
  if (Array.isArray(raw.interpretationRouting))
    raw.interpretationRouting = raw.interpretationRouting.map((value) => {
      const row = asRecord(value);
      return { ...row, segments: refs(row.segments) };
    });
  raw.relationshipChanges = Object.fromEntries(
    Object.entries(asRecord(raw.relationshipChanges)).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.map((row) => ({ ...asRecord(row), lineIds: refs(asRecord(row).lineIds) })) : value,
    ]),
  );
}
