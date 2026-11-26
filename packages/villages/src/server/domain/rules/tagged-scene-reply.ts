import { asRecord } from "./coerce.js";
import { NARRATION_SEGMENT_CHARACTERS, readNarrationReply } from "./narration-contract.js";
import { parseSceneObject } from "./scene-json-syntax.js";
import { MODEL_JSON_MAX_CHARACTERS, modelJsonWithinBounds } from "./json-reply.js";
import { bindSceneSourcePositions } from "./narration-sources.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { SceneReplyIssue } from "../../../shared/contracts/scene-failure-diagnostic.js";

export const TAGGED_SCENE_FORMAT = [
  "For a narration-only reply, write plain prose. When mixing narration, dialogue or effects, use one Scene beat per line: Narration: text or [speaker-id]: spoken text. A unique displayed speaker name also works in brackets. Omit code fences.",
  "[speaker-id] [whisper recipient-id]: text, [speaker-id] [shout]: text, and [speaker-id] [aside]: text are optional. An aside follows its main line.",
  "Put each lasting proposal on its own [keep]: {…} or [command]: {…} line. These lines are private. Write any prose that asserts a lasting change as [!speaker-id]: text or Narration!: text immediately before its proposal.",
  "The game binds a proposal to the preceding beat. Commands get their anchor and default evidence from that beat. A keep may supply explicit evidence for other events.",
  "Do not repeat an outcome in other prose. Player movement and Village time come from the game. Show what people attempt and how they react.",
].join("\n");

const effectLabel = /^[A-Za-z][A-Za-z0-9_-]{0,47}$/u;
const isEffectLabel = (value: unknown): value is string =>
  typeof value === "string" && value !== "self" && effectLabel.test(value);
const controlPrefix = /^\s*!?\s*(keep|command|visit|halt|cue)(?:[\s:\]]|$)/iu;
const quotedSpeakerHeader = /^([^:\r\n]{1,100}):\s*(["“].*["”])$/u;
const aliasKey = (text: string) => text.normalize("NFKC").trim().toLowerCase();
type Beat = { id: string; kind: "narration" | "dialogue"; text: string; requires: string[] } & Record<string, unknown>;

function plainNarration(content: string): { narration?: Beat[]; issue?: SceneReplyIssue } {
  // A damaged control or JSON reply cannot fall back to prose.
  if (/[\[\]{}<>\x60]/u.test(content.normalize("NFKC"))) return { issue: "structured_reply" };
  const paragraphs: string[] = [];
  for (const paragraph of content.trim().split(/\r?\n(?:[^\S\r\n]*\r?\n)+/u)) {
    const text = paragraph.trim();
    // Keep clear narration before an unverified speech paragraph. Its entire tail stays hidden.
    if (quotedSpeakerHeader.test(text) || /^["“'‘]/u.test(text.normalize("NFKC"))) {
      if (!paragraphs.length) return { issue: "structured_reply" };
      break;
    }
    if (
      text.split(/\r?\n/u).some((line) => {
        const syntax = line
          .normalize("NFKC")
          .replace(/^(?:[-+*]|\d+[.)])\s+/u, "")
          .replace(/[*_~]/gu, "")
          .trim();
        return /^[#"“'‘]|^[\p{L}\p{N}][\p{L}\p{M}\p{N} .'’()-]{0,55}:/u.test(syntax);
      })
    )
      return { issue: "structured_reply" };
    if (/\p{L}/u.test(text)) paragraphs.push(text);
  }
  if (paragraphs.length > 24 || paragraphs.some((text) => text.length > NARRATION_SEGMENT_CHARACTERS))
    return { issue: "reply_limits" };
  if (!paragraphs.length) return {};
  return {
    narration: paragraphs.map((text, index) => ({ id: "beat-" + (index + 1), kind: "narration", text, requires: [] })),
  };
}

/** Explicit controls and speaker labels never become untagged narration. */
export function decodeTaggedSceneReply(
  content: string,
  readset: NarrationReadset,
): {
  value: Record<string, unknown> | null;
  repaired?: true;
  issue?: SceneReplyIssue;
} {
  if (content.length > MODEL_JSON_MAX_CHARACTERS) return { value: null, issue: "reply_limits" };
  const scene = readset.source.scene;
  const speakers = new Set(scene.contactGeneration?.actorIds ?? scene.activeIds);
  const aliases = new Map<string, string>();
  const ambiguous = new Set<string>();
  for (const { characterId, name } of scene.participants) {
    if (!speakers.has(characterId)) continue;
    const alias = aliasKey(name);
    if (!alias || (aliases.has(alias) && aliases.get(alias) !== characterId)) ambiguous.add(alias);
    else aliases.set(alias, characterId);
  }
  const resolveAlias = (alias: string) => {
    const key = aliasKey(alias);
    return ambiguous.has(key) ? undefined : aliases.get(key);
  };
  const newcomers = new Map<string, string>();
  const ids = new Set(["scene-visit"]);
  const positions: string[] = [];
  const segments: Beat[] = [],
    keep: Record<string, unknown>[] = [],
    commands: Record<string, unknown>[] = [];
  let visit: { segment: string; option: number; escort: boolean } | undefined;
  let halt: Record<string, unknown> | undefined;
  let anchor: Beat | undefined;
  let marked = false;
  let effectIndex = 0;
  let issue: SceneReplyIssue | undefined;
  const parsePrivateRecord = (text: string) => {
    const record = modelJsonWithinBounds(text) ? parseSceneObject(text) : null;
    if (!record) issue = "invalid_private_record";
    return record;
  };
  const bind = (beat: Beat, id: string) => {
    beat.requires = [...beat.requires.filter((value) => value !== "missing-" + beat.id), id];
  };
  for (const value of content.split(/\r?\n/u)) {
    const line = value.trim();
    if (!line) continue;
    if (line.startsWith("```")) break;
    const quotedSpeaker = quotedSpeakerHeader.exec(line);
    const quotedAlias = quotedSpeaker && !controlPrefix.test(quotedSpeaker[1]) && resolveAlias(quotedSpeaker[1]);
    const header =
      /^(?:Narration(!?)|\[([^\]\r\n]+)\])((?:\s*\[[^\]\r\n]+\])*)\s*:\s*(.*)$/iu.exec(line) ??
      (quotedAlias && quotedSpeaker ? [line, undefined, quotedAlias, "", quotedSpeaker[2]] : null);
    if (!header) {
      if (line.startsWith("[") && controlPrefix.test(line.slice(1))) {
        issue = "invalid_private_record";
        break;
      }
      anchor = undefined;
      continue;
    }
    const [, narration, speaker, tags, text] = header;
    const meta = [...(tags ?? "").matchAll(/\[([^\]]+)\]/gu)].map((part) => part[1]);
    const control = speaker?.trim().toLowerCase();
    const reserved = controlPrefix.exec(speaker ?? "")?.[1].toLowerCase();
    if (reserved) {
      if (control !== reserved || meta.length) {
        issue = "invalid_private_record";
        break;
      }
      if (control === "cue") {
        const cue = parsePrivateRecord(text);
        if (!cue) break;
        if (
          anchor &&
          cue &&
          Object.keys(cue).every((key) =>
            (anchor!.kind === "narration" ? ["sound", "staging"] : ["staging", "expression", "look"]).includes(key),
          )
        ) {
          try {
            readNarrationReply({ segments: [{ ...anchor, ...cue }] }, [...speakers, ...newcomers.keys()]);
            Object.assign(anchor, cue);
          } catch {
            // Presentation cues are optional.
          }
        }
        continue;
      }
      if (control === "halt") {
        const proposed = parsePrivateRecord(text);
        if (!proposed) break;
        if (proposed) {
          try {
            readNarrationReply({ segments: [], halt: proposed }, []);
            halt ??= proposed;
          } catch {
            // Invalid control lines cannot become visible prose.
          }
        }
        anchor = undefined;
        continue;
      }
      if (control === "visit") {
        if (!anchor || anchor.kind !== "dialogue") continue;
        const choice = /^([1-9]\d?)( escort)?$/u.exec(text);
        if (
          !visit &&
          choice &&
          readset.sceneVisitOptions?.[Number(choice[1]) - 1]?.actorId === anchor.speakerId &&
          anchor.presentation !== "aside" &&
          (anchor.targetId === undefined || anchor.targetId === "player") &&
          (anchor.delivery !== "whisper" || anchor.targetId === "player")
        ) {
          visit = { segment: anchor.id, option: Number(choice[1]), escort: !!choice[2] };
          bind(anchor, "scene-visit");
        } else bind(anchor, "bad-visit-" + anchor.id);
        anchor = undefined;
        continue;
      }
      const list = control === "keep" ? keep : commands;
      const proposal = parsePrivateRecord(text);
      if (list.length >= (control === "keep" ? 32 : 16) || (!anchor && control === "command")) {
        if (!proposal) break;
        continue;
      }
      const suppliedId = proposal?.id;
      let id: string;
      do {
        id = "effect-" + ++effectIndex;
      } while (ids.has(id));
      const mayUseId =
        suppliedId !== "remember-fact" ||
        (control === "keep" && readset.requestedMemory && !readset.codeRequestedMemory);
      if (mayUseId && isEffectLabel(suppliedId) && !ids.has(suppliedId) && !/^(missing|bad-visit)-/u.test(suppliedId))
        id = suppliedId;
      ids.add(id);
      const requires = proposal?.requires;
      const invalid =
        (suppliedId !== undefined && id !== suppliedId) ||
        (requires !== undefined &&
          (!Array.isArray(requires) || requires.length > 8 || !requires.every(isEffectLabel))) ||
        (proposal?.independent !== undefined && proposal.independent !== true);
      const effect: Record<string, unknown> = proposal && !invalid ? { ...proposal, id } : { id };
      if (anchor && (control === "command" || marked)) bind(anchor, id);
      if (control === "keep") effect.independent = true;
      if (anchor && control === "command") effect.at = anchor.id;
      if (anchor && proposal && !invalid) {
        if (
          control === "keep" &&
          effect.class === "desire" &&
          effect.for === undefined &&
          effect.replace === undefined &&
          anchor.kind === "dialogue" &&
          effect.owner === anchor.speakerId
        )
          effect.for = [effect.owner];
        effect.source ??= [
          {
            segment: anchor.id,
            ...(anchor.kind === "narration" ? { perceive: { kind: "seen", by: ["player"] } } : {}),
          },
        ];
      }
      if (control === "command" && effect.type === "npc.admit") {
        const returning = readset.npcCandidates.find(({ npc }) => npc.id === effect.existingId)?.npc.id;
        if (returning && effect.localKey === undefined) effect.localKey = "new:returning-" + effectIndex;
        if (typeof effect.localKey === "string" && !newcomers.has(effect.localKey)) {
          newcomers.set(effect.localKey, id);
          if (returning && !newcomers.has(returning)) newcomers.set(returning, id);
        }
      }
      list.push(effect);
      // A malformed control may spill private text onto later lines.
      if (!proposal) break;
      continue;
    }
    anchor = undefined;
    if (positions.length >= 24) continue;
    const id = "beat-" + (positions.length + 1);
    positions.push(id);
    if (!text || text.length > NARRATION_SEGMENT_CHARACTERS || /^[{`]/u.test(text)) continue;
    marked = narration === "!" || !!speaker?.startsWith("!");
    const requirements = marked ? ["missing-" + id] : [];
    if (narration !== undefined) {
      const actors = meta[0]?.startsWith("actors ") ? meta[0].slice(7).trim().split(/\s+/u) : [];
      if (
        meta.length &&
        (meta.length !== 1 ||
          !actors.length ||
          actors.length > 32 ||
          new Set(actors).size !== actors.length ||
          !actors.every((actor) => actor === "player" || speakers.has(actor) || newcomers.has(actor)))
      )
        continue;
      for (const actor of actors) {
        const admission = newcomers.get(actor);
        if (admission && !requirements.includes(admission)) requirements.push(admission);
      }
      anchor = { id, kind: "narration", text, requires: requirements, ...(actors.length ? { actors } : {}) };
    } else {
      const token = marked ? speaker.slice(1) : speaker;
      const admission = newcomers.get(token);
      const speakerId = speakers.has(token) || admission ? token : resolveAlias(token);
      if (token === "player" || !speakerId || speakerId === "player") {
        issue = "unknown_speaker";
        continue;
      }
      if (admission) requirements.push(admission);
      const beat: Beat = { id, kind: "dialogue", speakerId, text, requires: requirements };
      let valid = true;
      for (const tag of meta) {
        const index = tag.indexOf(" ");
        const kind = index < 0 ? tag : tag.slice(0, index),
          target = tag.slice(index + 1).trim();
        if (tag === "shout" && !beat.delivery) beat.delivery = "shout";
        else if (tag === "aside" && !beat.presentation) beat.presentation = "aside";
        else if (kind === "name" && index >= 0 && target && !beat.speakerLabel) beat.speakerLabel = target;
        else if (
          (kind === "whisper" || kind === "to") &&
          index >= 0 &&
          (target === "player" || speakers.has(target) || newcomers.has(target)) &&
          target !== speakerId &&
          !beat.delivery &&
          (beat.targetId === undefined || beat.targetId === target)
        ) {
          beat.targetId = target;
          if (kind === "whisper") beat.delivery = "whisper";
          const addressee = newcomers.get(target);
          if (addressee) requirements.push(addressee);
        } else if (tag === "remember" && readset.requestedMemory) requirements.push("remember-fact");
        else valid = false;
      }
      if (valid) anchor = beat;
      else issue = "invalid_dialogue_tag";
    }
    if (anchor) segments.push(anchor);
  }
  if (!segments.length && !halt) {
    const plain = plainNarration(content);
    const narration = plain.narration;
    if (narration) return { value: { segments: narration }, repaired: true };
    if (content.trimStart().startsWith("\x60\x60\x60")) issue = "fenced_reply";
    return { value: null, issue: issue ?? plain.issue ?? "no_playable_lines" };
  }
  // Bind positional citations before any invalid beat can be removed or change a later line's number.
  const all = positions.map((id) => segments.find((beat) => beat.id === id) ?? { id });
  const raw = bindSceneSourcePositions(
    {
      segments: all,
      keep,
      commands,
      ...(visit ? { visit } : {}),
      ...(halt && !keep.length && !commands.length && !visit ? { halt } : {}),
    },
    true,
    readset.recognizeDirectOfferSpeech,
  );
  return { value: { ...raw, segments } };
}

/** A failed crossing also invalidates later prose written against the tentative positions. */
export function pruneTaggedSceneReply(raw: Record<string, unknown>, failed: Set<string>) {
  const commands = (raw.commands as Record<string, unknown>[]) ?? [];
  const keep = (raw.keep as Record<string, unknown>[]) ?? [];
  const segments = (raw.segments as Beat[]) ?? [];
  const visit = asRecord(raw.visit);
  const excluded = new Set(failed);
  let retained = segments;
  for (;;) {
    const validAnchors = new Set(retained.map((beat) => beat.id));
    for (const command of commands) if (!validAnchors.has(String(command.at))) excluded.add(String(command.id));
    if (raw.visit && !validAnchors.has(String(visit.segment))) excluded.add("scene-visit");
    const cut = segments.findIndex((beat) =>
      commands.some(
        (row) =>
          row.at === beat.id &&
          excluded.has(String(row.id)) &&
          (row.type === "move" || row.type === "depart" || (row.type === undefined && beat.kind === "narration")),
      ),
    );
    const next = retained.filter(
      (beat) => (cut < 0 || segments.indexOf(beat) < cut) && !beat.requires.some((id) => excluded.has(id)),
    );
    if (next.length === retained.length) break;
    retained = next;
  }
  if (!retained.length) return null;
  const survives = new Set(retained.map((beat) => beat.id));
  const remaining = commands.filter((row) => !excluded.has(String(row.id)) && survives.has(String(row.at)));
  const notes = keep.filter((row) => {
    const id = String(row.id);
    return (
      !excluded.has(id) &&
      (!segments.some((beat) => beat.requires.includes(id)) || retained.some((beat) => beat.requires.includes(id)))
    );
  });
  const keepVisit = !excluded.has("scene-visit") && survives.has(String(visit.segment));
  if (
    retained.length === segments.length &&
    remaining.length === commands.length &&
    notes.length === keep.length &&
    (!raw.visit || keepVisit)
  )
    return null;
  return { segments: retained, commands: remaining, keep: notes, ...(keepVisit ? { visit } : {}) };
}
