import { asRecord } from "./coerce.js";
import { agendaEvidence } from "../decoding/agenda-codec.js";
import { venueWorkSchema, workTime } from "../../../shared/helpers/venue-work.js";
import { npcNameKey } from "./npc-index.js";
import { MAX_NARRATION_SEGMENTS, NARRATION_SEGMENT_CHARACTERS, readNarrationReply } from "./narration-contract.js";
import { parseSceneObject } from "./scene-json-syntax.js";
import { MODEL_JSON_MAX_CHARACTERS, modelJsonWithinBounds } from "./json-reply.js";
import { bindSceneSourcePositions } from "./narration-sources.js";
import { isPlayerVisitInvitation } from "./scene-visit-speech.js";
import type { NarrationReadset } from "../models/narration-model.js";
import type { SceneReplyIssue } from "../../../shared/contracts/scene-failure-diagnostic.js";

export const taggedSceneFormat = (entrance: boolean) =>
  [
    entrance
      ? ENTRANCE_OBSERVATION_FORMAT + " Use one beat per line and omit code fences."
      : "For a narration-only reply, write plain prose. When mixing narration, dialogue or effects, use one Scene beat per line: Narration: text or [speaker-id]: spoken text. A unique displayed speaker name also works in brackets. Omit code fences.",
    entrance
      ? "Put each character's actual words on their own [speaker-id]: line. Respect the supplied positions and doorway voice paths."
      : "Put each character's actual words on their own speaker line, even for a brief greeting amid an action. For example, write Narration: She opens the door. Then on a new line write [speaker-id]: Come in.",
    "[speaker-id] [whisper recipient-id]: text and [speaker-id] [shout]: text are optional. Put an aside on its own speaker line immediately after its main line. Use this two-line form.\n[speaker-id]: I'll be there.\n[speaker-id] [aside]: If I can find my boots.",
    "Put each lasting proposal on its own [keep]: {…} or [command]: {…} line. These lines are private. Write any prose that asserts a lasting change as [!speaker-id]: text or Narration!: text immediately before its proposal.",
    "The game binds a proposal to the preceding beat. Commands get their anchor and default evidence from that beat. A keep may supply explicit evidence for other events.",
    "Do not repeat an outcome in other prose. Player movement and Village time come from the game. Show what people attempt and how they react.",
  ].join("\n");

const quietEntrance = "No one comes into view.";
const entranceObservations = new Map([
  ["quiet", quietEntrance],
  ["sound", "A sound carries to the entrance."],
  ["movement", "Something shifts beyond the entrance."],
]);

export const ENTRANCE_OBSERVATION_FORMAT =
  "At this entrance, use Narration: " +
  [...entranceObservations.keys()].join(", Narration: ") +
  ". Copy one whole line without adding prose. Use sound or movement for an observable cue whose source the player cannot identify. Keep each character in their supplied Zone until a crossing changes it. Use an empty Narration!: line and a supplied movement command for a crossing in either direction, before any dialogue from the new position. An NPC admission also uses an empty Narration!: line. The game writes what the player sees.";

export function quietEntranceReply() {
  return { segments: [{ id: "beat-1", kind: "narration", text: quietEntrance, requires: [] }] };
}

const effectLabel = /^[A-Za-z][A-Za-z0-9_-]{0,47}$/u;
const isEffectLabel = (value: unknown): value is string =>
  typeof value === "string" && value !== "self" && effectLabel.test(value);
const controlPrefix = /^\s*!?\s*(keep|command|visit|halt|cue)(?:[\s:\]]|$)/iu;
const actionPrefix = /^\s*!?\s*(action)(?=[ \t]+[+-]?\d)/iu;
const quotedSpeakerHeader = /^([^:\r\n]{1,100}):\s*(["“].*["”])$/u;
const quotedInlineAside = /^("[^"]+"|“[^“”]+”)[ \t]+\[aside\][ \t]+("[^"]+"|“[^“”]+”)$/u;
const privateNpcHandle = /\[((?:npc|new):[A-Za-z0-9_.:-]+)\]/gu;
const npcHandle = /^(?:npc|new):[A-Za-z0-9_.:-]+$/u;
const agendaTerms = agendaEvidence.omit({ actorId: true, kind: true });
type Beat = { id: string; kind: "narration" | "dialogue"; text: string; requires: string[] } & Record<string, unknown>;

function plainNarration(
  content: string,
  relaxed: boolean,
  speakerOrControl: (label: string) => boolean,
): { narration?: Beat[]; issue?: SceneReplyIssue } {
  // A damaged control or JSON reply cannot fall back to prose.
  const normalized = content.normalize("NFKC");
  const structured = relaxed ? /^\s*[\[<]|[{}]|\[\s*["'\[“‘]|\x60\x60\x60/mu : /[\[\]{}<>\x60]/u;
  if (structured.test(normalized)) return { issue: "structured_reply" };
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
        return (
          /^[#"“'‘]/u.test(syntax) ||
          (relaxed &&
            (/^[\[<{]|^\x60\x60\x60/u.test(syntax) ||
              [...syntax.matchAll(/\[([^\]\r\n]{1,100})\]/gu)].some((match) => speakerOrControl(match[1])) ||
              (syntax.includes(":") && speakerOrControl(syntax.slice(0, syntax.indexOf(":")))))) ||
          (!relaxed && /^[\p{L}\p{N}][\p{L}\p{M}\p{N} .'’()-]{0,55}:/u.test(syntax))
        );
      })
    )
      return { issue: "structured_reply" };
    if (/\p{L}/u.test(text)) paragraphs.push(text);
  }
  if (
    paragraphs.length > MAX_NARRATION_SEGMENTS ||
    paragraphs.some((text) => text.length > NARRATION_SEGMENT_CHARACTERS)
  )
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
  const authoritative = readset.authoritativeSceneBeats === true;
  const followSpeech = (agrees: boolean, to: unknown, trespass: boolean) => {
    const room = scene.sceneAttendance?.layout?.find(({ id }) => id === to)?.name;
    if (!agrees) return to ? "I won't cross with you." : "I'll stop following here.";
    if (trespass)
      return room ? `I'll cross into ${room} with you, even without permission.` : "I'll sneak in with you.";
    return room ? `I'll go with you to ${room}.` : "I'll follow you.";
  };
  const invitationSpeech = (actor: unknown, location: unknown, zone: unknown, afterHours: boolean, escort: boolean) => {
    const venue = readset.access.find(({ venueId }) => venueId === location);
    const room =
      venue?.authorities.find(({ actorId }) => actorId === actor)?.zones.find(({ id }) => id === zone)?.name ??
      (location === scene.placeId ? scene.sceneAttendance?.layout?.find(({ id }) => id === zone)?.name : undefined);
    const destination =
      location !== scene.placeId && room && venue?.name ? `${room} at ${venue.name}` : (room ?? venue?.name);
    const time = afterHours ? " after hours" : "";
    if (escort) return destination ? `I can take you to ${destination}${time}.` : `I can show you the way${time}.`;
    return `You can visit${destination ? " " + destination : ""}${time}.`;
  };
  const aliasKey = readset.explicitNpcIntroduction
    ? npcNameKey
    : (label: string) => label.normalize("NFKC").trim().toLowerCase();
  const speakers = new Set(scene.contactGeneration?.actorIds ?? scene.activeIds);
  const aliases = new Map<string, { id: string; name?: string }>();
  const ambiguous = new Set<string>();
  const addAlias = (label: string, id: string, name?: string) => {
    const key = aliasKey(label);
    const previous = aliases.get(key);
    if (!key || (previous && previous.id !== id)) ambiguous.add(key);
    else if (!previous || name) aliases.set(key, { id, name });
  };
  for (const { characterId, name } of scene.participants) {
    if (!speakers.has(characterId)) continue;
    addAlias(name, characterId);
    const npcName = readset.npcSpeakerNames?.[characterId];
    if (npcName) addAlias(npcName, characterId, npcName);
  }
  const resolveAlias = (alias: string) => {
    const key = aliasKey(alias);
    return ambiguous.has(key) ? undefined : aliases.get(key);
  };
  const reservedControl = (text: string) =>
    (controlPrefix.exec(text) ??
      (readset.sceneSpeechActions?.length ? actionPrefix.exec(text) : null))?.[1].toLowerCase();
  const knownNames = new Map(Object.entries(readset.npcSpeakerNames ?? {}));
  const newcomers = new Map<string, string>();
  const ids = new Set(["scene-visit"]);
  const positions: string[] = [];
  const segments: Beat[] = [],
    keep: Record<string, unknown>[] = [],
    commands: Record<string, unknown>[] = [];
  let visit: { segment: string; option: number; escort: boolean } | undefined;
  let halt: Record<string, unknown> | undefined;
  let anchor: Beat | undefined;
  let actionAnchor: Beat | undefined;
  let crossingAnchor: Beat | undefined;
  let marked = false;
  let effectIndex = 0;
  let skippedEntranceProse = false;
  let issue: SceneReplyIssue | undefined;
  const parsePrivateRecord = (text: string) => {
    const record = modelJsonWithinBounds(text) ? parseSceneObject(text) : null;
    if (!record) issue = "invalid_private_record";
    return record;
  };
  const bind = (beat: Beat, id: string) => {
    beat.requires = [...beat.requires.filter((value) => value !== "missing-" + beat.id), id];
  };
  const registerArrival = (effect: Record<string, unknown>, id: string, defaultLocalKey: string) => {
    const candidate = readset.npcCandidates.find(({ npc }) => npc.id === effect.existingId)?.npc;
    if (candidate && effect.localKey === undefined) effect.localKey = defaultLocalKey;
    if (typeof effect.localKey !== "string" || newcomers.has(effect.localKey)) return;
    newcomers.set(effect.localKey, id);
    if (candidate && !newcomers.has(candidate.id)) newcomers.set(candidate.id, id);
    if (!readset.npcSpeakerNames) return;
    const label = candidate?.label ?? effect.label;
    const name = candidate?.name ?? effect.name;
    if (typeof label === "string") addAlias(label, effect.localKey);
    if (typeof name === "string") {
      addAlias(name, effect.localKey, name);
      knownNames.set(effect.localKey, name);
      if (candidate) knownNames.set(candidate.id, name);
    }
  };
  for (const value of content.split(/\r?\n/u)) {
    const line = value.trim();
    if (!line) continue;
    if (line.startsWith("```")) break;
    const quotedSpeaker = quotedSpeakerHeader.exec(line);
    const quotedAlias = quotedSpeaker && !reservedControl(quotedSpeaker[1]) && resolveAlias(quotedSpeaker[1]);
    const header =
      /^(?:Narration(!?)|\[([^\]\r\n]+)\])((?:\s*\[[^\]\r\n]+\])*)\s*:\s*(.*)$/iu.exec(line) ??
      (quotedAlias && quotedSpeaker ? [line, undefined, quotedSpeaker[1], "", quotedSpeaker[2]] : null);
    if (!header) {
      const malformed = line.startsWith("[") && reservedControl(line.slice(1));
      if (malformed && malformed !== "action") {
        issue = "invalid_private_record";
        break;
      }
      if (malformed === "action") issue = "invalid_action_option";
      anchor = undefined;
      continue;
    }
    const [, narration, speaker, tags, body] = header;
    const meta = [...(tags ?? "").matchAll(/\[([^\]]+)\]/gu)].map((part) => part[1]);
    const introductionTag = "[introduce]:";
    const nestedIntroduction =
      readset.explicitNpcIntroduction && speaker && !meta.length && body.startsWith(introductionTag);
    if (nestedIntroduction) meta.push("introduce");
    const text = nestedIntroduction ? body.slice(introductionTag.length).trimStart() : body;
    const control = speaker?.trim().toLowerCase();
    const reserved = reservedControl(speaker ?? "");
    if (reserved && reserved !== "action") {
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
        if (
          !anchor ||
          anchor === actionAnchor ||
          anchor.kind !== "dialogue" ||
          (authoritative && commands.some(({ at }) => at === anchor?.id))
        )
          continue;
        const choice = /^([1-9]\d?)( escort)?$/u.exec(text);
        if (
          !visit &&
          commands.length < 16 &&
          choice &&
          readset.sceneVisitOptions?.[Number(choice[1]) - 1]?.actorId === anchor.speakerId &&
          anchor.presentation !== "aside" &&
          (anchor.targetId === undefined || anchor.targetId === "player") &&
          (anchor.delivery !== "whisper" || anchor.targetId === "player")
        ) {
          visit = { segment: anchor.id, option: Number(choice[1]), escort: !!choice[2] };
          bind(anchor, "scene-visit");
          if (authoritative) {
            const option = readset.sceneVisitOptions![visit.option - 1];
            anchor.text = invitationSpeech(
              option.actorId,
              option.venueId,
              option.zoneId,
              !!option.afterHours,
              visit.escort,
            );
          }
        } else bind(anchor, "bad-visit-" + anchor.id);
        anchor = undefined;
        continue;
      }
      const list = control === "keep" ? keep : commands;
      const proposal = parsePrivateRecord(text);
      if (
        control === "keep"
          ? list.length >= 32
          : !anchor || anchor === actionAnchor || list.length + Number(!!visit) >= 16
      ) {
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
      if (
        mayUseId &&
        isEffectLabel(suppliedId) &&
        !ids.has(suppliedId) &&
        !/^(missing|bad-visit|decision|arrival)-/u.test(suppliedId)
      )
        id = suppliedId;
      ids.add(id);
      const requires = proposal?.requires;
      const invalid =
        (suppliedId !== undefined && id !== suppliedId) ||
        (requires !== undefined &&
          (!Array.isArray(requires) || requires.length > 8 || !requires.every(isEffectLabel))) ||
        (proposal?.independent !== undefined && proposal.independent !== true);
      const effect: Record<string, unknown> = proposal && !invalid ? { ...proposal, id } : { id };
      const crossing = control === "command" && (effect.type === "move" || effect.type === "depart");
      const condition =
        Array.isArray(effect.conditions) && effect.conditions.length === 1 ? asRecord(effect.conditions[0]) : {};
      const completesRepair =
        readset.terminalSceneRepair &&
        control === "command" &&
        effect.type === "circumstance" &&
        effect.situation === undefined &&
        condition.clear === true &&
        readset.repairs.some(({ id }) => id === condition.id);
      const entranceAnchor = readset.entranceObservations && anchor?.text === "";
      const entranceArrival = entranceAnchor && control === "command" && effect.type === "npc.admit";
      const entranceRepair = entranceAnchor && completesRepair;
      const entranceRepairKeep =
        entranceAnchor &&
        control === "keep" &&
        effect.for === "room" &&
        readset.repairs.some(({ entries }) => entries.includes(String(effect.replace)));
      if (
        authoritative &&
        anchor?.text === "" &&
        !crossing &&
        !entranceArrival &&
        !entranceRepair &&
        !entranceRepairKeep
      )
        continue;
      const hasCommand = anchor && commands.some(({ at }) => at === anchor?.id);
      if (authoritative && control === "command" && anchor && hasCommand && crossing !== (anchor === crossingAnchor))
        continue;
      const decision = asRecord(effect.decision);
      const playerDecision =
        authoritative &&
        control === "command" &&
        anchor?.kind === "dialogue" &&
        (effect.type === "move.decide" || (effect.type === "access.decide" && isPlayerVisitInvitation(decision)));
      if (playerDecision && anchor && ((anchor.targetId !== undefined && anchor.targetId !== "player") || hasCommand))
        continue;
      const slot = asRecord(effect.agenda);
      if (
        anchor?.offerAppointment &&
        (control !== "keep" || slot.kind !== "offer" || slot.actorId !== anchor.speakerId)
      )
        continue;
      if (anchor && anchor !== actionAnchor && (control === "command" || marked)) bind(anchor, id);
      if (entranceArrival && anchor) anchor.text = "Someone comes into view.";
      if (entranceRepair && anchor) anchor.text = "The repair is complete.";
      if (authoritative && crossing && anchor?.kind === "narration") {
        const name = scene.participants.find(({ characterId }) => characterId === effect.who)?.name ?? "Someone";
        const outcome =
          effect.type === "depart"
            ? `${name} leaves.`
            : effect.to === scene.zoneId
              ? scene.zoneId === "exterior"
                ? `${name} steps out to the entrance.`
                : `${name} steps into the room.`
              : `${name} steps away.`;
        anchor.text = anchor === crossingAnchor ? `${anchor.text} ${outcome}` : outcome;
        crossingAnchor = anchor;
      }
      if (playerDecision && anchor) {
        if (effect.type === "move.decide" && anchor.speakerId === effect.who && typeof effect.agrees === "boolean") {
          anchor.text = followSpeech(effect.agrees, effect.to, effect.trespass === true);
          actionAnchor = anchor;
        } else if (effect.type === "access.decide" && anchor.speakerId === effect.by) {
          if (isPlayerVisitInvitation(decision)) {
            anchor.text = invitationSpeech(
              effect.by,
              effect.venue,
              effect.zone,
              decision.outcome === "invite-outside-hours",
              decision.accompanies === true,
            );
            actionAnchor = anchor;
          }
        }
      }
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
      if (control === "command" && effect.type === "npc.admit")
        registerArrival(effect, id, "new:returning-" + effectIndex);
      list.push(effect);
      if (completesRepair && anchor?.kind === "narration") {
        // The typed repair closes the reply. Access status comes from the committed room.
        break;
      }
      // A malformed control may spill private text onto later lines.
      if (!proposal) break;
      continue;
    }
    anchor = undefined;
    if (positions.length >= MAX_NARRATION_SEGMENTS) continue;
    const id = "beat-" + (positions.length + 1);
    positions.push(id);
    const introduction = !!readset.explicitNpcIntroduction && meta.includes("introduce");
    const appointment = !!readset.explicitSceneEvidence && meta.includes("appointment");
    const work = !!readset.explicitSceneEvidence && meta.includes("work");
    const returnId = readset.explicitNpcIntroduction && speaker?.startsWith("return ") && speaker.slice(7);
    const gameSpeech = authoritative && (introduction || reserved === "action");
    const emptyAnchor = authoritative && narration === "!" && (!text || readset.entranceObservations);
    if (
      (!text && !introduction && !appointment && !work && !returnId && !gameSpeech && !emptyAnchor) ||
      (!gameSpeech && (text.length > NARRATION_SEGMENT_CHARACTERS || (!(appointment || work) && /^[{`]/u.test(text))))
    )
      continue;
    const markedSpeaker = !!speaker?.startsWith("!");
    marked = narration === "!" || markedSpeaker || appointment || work;
    const requirements = marked ? ["missing-" + id] : [];
    if (returnId) {
      const candidate = readset.npcCandidates.find((entry) => entry.npc.id === returnId && entry.met);
      const effectId = "arrival-" + id;
      if (
        !candidate ||
        meta.length ||
        newcomers.has(returnId) ||
        ids.has(effectId) ||
        commands.length + Number(!!visit) >= 16
      ) {
        issue = "unknown_speaker";
        continue;
      }
      const effect = {
        id: effectId,
        at: id,
        type: "npc.admit",
        existingId: returnId,
        returning: true,
        source: [{ segment: id, perceive: { kind: "seen", by: ["player"] } }],
      };
      ids.add(effectId);
      commands.push(effect);
      registerArrival(effect, effectId, "new:" + effectId);
      anchor = { id, kind: "narration", text: `${candidate.npc.label} comes into view.`, requires: [effectId] };
      actionAnchor = anchor;
      segments.push(anchor);
      continue;
    }
    if (narration !== undefined) {
      if (introduction || appointment || work) continue;
      if (readset.entranceObservations && !emptyAnchor) {
        const observation = !marked && !meta.length ? entranceObservations.get(text) : undefined;
        if (observation) {
          segments.push({ id, kind: "narration", text: observation, requires: [] });
        } else skippedEntranceProse = true;
        continue;
      }
      if (readset.explicitNpcIntroduction && /^\[[^\]\r\n]+\]\s*:/u.test(text)) {
        issue = "invalid_dialogue_tag";
        continue;
      }
      const handles = readset.explicitNpcIntroduction
        ? [...text.matchAll(privateNpcHandle)].map((part) => part[1])
        : [];
      if (handles.some((actor) => !speakers.has(actor) && !newcomers.has(actor))) {
        issue = "unknown_speaker";
        continue;
      }
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
      for (const actor of [...actors, ...handles]) {
        const admission = newcomers.get(actor);
        if (admission && !requirements.includes(admission)) requirements.push(admission);
      }
      if (readset.entranceObservations && text) skippedEntranceProse = true;
      const prose = readset.entranceObservations
        ? ""
        : handles.length
          ? text.replace(privateNpcHandle, "").trim()
          : text;
      if (!prose && !emptyAnchor) continue;
      anchor = { id, kind: "narration", text: prose, requires: requirements, ...(actors.length ? { actors } : {}) };
    } else {
      const token = markedSpeaker ? speaker.slice(1) : speaker;
      const action =
        reserved === "action" ? /^action[ \t]+([1-9]\d?)(?:[ \t]+(escort))?$/iu.exec(speaker.trim()) : null;
      const choice = action ? readset.sceneSpeechActions?.[Number(action[1]) - 1] : undefined;
      const escort = !!action?.[2];
      if (
        reserved === "action" &&
        (!choice ||
          !speakers.has(choice.actorId) ||
          commands.length + Number(!!visit) >= 16 ||
          (choice.kind === "visit"
            ? !!visit || readset.sceneVisitOptions?.[choice.option - 1]?.actorId !== choice.actorId
            : escort))
      ) {
        issue = "invalid_action_option";
        continue;
      }
      const alias = !choice && !speakers.has(token) && !newcomers.has(token) ? resolveAlias(token) : undefined;
      const speakerId = choice?.actorId ?? alias?.id ?? token;
      const admission = choice ? undefined : newcomers.get(speakerId);
      if (token === "player" || speakerId === "player" || (!speakers.has(speakerId) && !admission)) {
        issue = "unknown_speaker";
        continue;
      }
      if (admission) requirements.push(admission);
      const introducedName = introduction ? knownNames.get(speakerId) : undefined;
      const introductionSpeech = introducedName
        ? `My name is ${introducedName}.${!authoritative && text ? " " + text : ""}`
        : "";
      if (
        (introduction &&
          (!introducedName ||
            introductionSpeech.length > NARRATION_SEGMENT_CHARACTERS ||
            choice ||
            appointment ||
            work)) ||
        ((appointment || work) && (choice || admission || (appointment && work)))
      ) {
        issue = "invalid_dialogue_tag";
        continue;
      }
      const beat: Beat = {
        id,
        kind: "dialogue",
        speakerId,
        text: introducedName
          ? introductionSpeech
          : appointment
            ? "Appointment offered."
            : work
              ? "Work proposed."
              : text,
        requires: requirements,
        ...(choice || work ? { targetId: "player" } : {}),
      };
      let valid = true;
      for (const tag of meta) {
        const index = tag.indexOf(" ");
        const kind = index < 0 ? tag : tag.slice(0, index),
          target = tag.slice(index + 1).trim();
        if (tag === "shout" && !beat.delivery) beat.delivery = "shout";
        else if (tag === "aside" && !beat.presentation) beat.presentation = "aside";
        else if (tag === "introduce" && introduction && !beat.introduceName) beat.introduceName = true;
        else if (tag === "appointment" && appointment && !beat.offerAppointment) beat.offerAppointment = true;
        else if (tag === "work" && work && !beat.offerWork) beat.offerWork = true;
        else if (kind === "name" && !readset.explicitNpcIntroduction && index >= 0 && target && !beat.speakerLabel)
          beat.speakerLabel = target;
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
      if (
        !valid ||
        (choice?.kind === "visit" && beat.presentation === "aside") ||
        ((appointment || work) && (beat.presentation === "aside" || (beat.targetId && beat.targetId !== "player")))
      ) {
        issue = "invalid_dialogue_tag";
        continue;
      }
      if (!readset.explicitNpcIntroduction && alias?.name && !beat.speakerLabel) beat.speakerLabel = alias.name;
      if ((appointment && (text || readset.compactSceneDecisions)) || work) {
        if (appointment) beat.compactAppointment = true;
        // These beats own their effect and exact spoken evidence.
        const record = text ? parsePrivateRecord(text) : null;
        const effectId = "decision-" + beat.id;
        if (record && !ids.has(effectId) && (appointment ? keep.length < 32 : commands.length + Number(!!visit) < 16)) {
          const source = [{ segment: id, act: "offer" }];
          if (appointment && readset.agendaVenues?.length) {
            const { protection, ...fields } = record;
            const { destination, ...timeFields } = asRecord(fields.time);
            const location =
              readset.indexedAppointmentDestinations &&
              typeof destination === "number" &&
              Number.isSafeInteger(destination) &&
              destination > 0
                ? readset.agendaVenues.flatMap(({ id: venueId, zones }) =>
                    zones.map((zoneId) => ({ venueId, zoneId })),
                  )[destination - 1]
                : undefined;
            const indexed =
              location && !("venueId" in timeFields) && !("zoneId" in timeFields)
                ? { ...fields, time: { ...timeFields, ...location } }
                : null;
            const terms = agendaTerms.safeParse(readset.indexedAppointmentDestinations ? indexed : fields);
            if (terms.success) {
              const { activity, time } = terms.data;
              const people = [speakerId, "player"];
              const when = `${time.date} from ${workTime(time.startMinute)} to ${workTime(time.endMinute)}`;
              keep.push({
                id: effectId,
                for: people,
                about: [speakerId],
                class: "commitment",
                text: `${activity} on ${when}.`,
                offer: { proposer: speakerId, participants: people },
                agenda: { actorId: speakerId, kind: "offer", ...terms.data },
                source,
                ...(protection === undefined ? {} : { protection }),
              });
              beat.text = `I can meet on ${when}. Confirm the appointment in my Agenda if it works for you.`;
              beat.targetId = "player";
              ids.add(effectId);
              bind(beat, effectId);
            }
          } else if (work && readset.access.some((row) => row.venueId === scene.placeId)) {
            const terms = venueWorkSchema.safeParse(record);
            if (terms.success && terms.data.characterId !== "player") {
              const { activity, days, startMinute, endMinute } = terms.data;
              beat.text = `The proposed shift is ${activity}, ${days.join(", ")}, ${workTime(startMinute)} to ${workTime(endMinute)}.`;
              commands.push({
                id: effectId,
                type: "access.decide",
                by: speakerId,
                venue: scene.placeId,
                zone: null,
                at: id,
                source,
                decision: {
                  outcome: "access-management",
                  management: { action: "work-propose", characterId: terms.data.characterId, terms: terms.data },
                },
              });
              ids.add(effectId);
              bind(beat, effectId);
            }
          }
        }
        actionAnchor = beat;
      }
      if (choice) {
        if (choice.kind === "visit") {
          visit = { segment: id, option: choice.option, escort };
          bind(beat, "scene-visit");
          if (authoritative) {
            const option = readset.sceneVisitOptions![choice.option - 1];
            beat.text = invitationSpeech(choice.actorId, option.venueId, option.zoneId, !!option.afterHours, escort);
          }
        } else {
          let effectId = "action-" + id;
          while (ids.has(effectId)) effectId += "-";
          ids.add(effectId);
          commands.push({
            id: effectId,
            type: "move.decide",
            who: choice.actorId,
            at: id,
            agrees: choice.agrees,
            ...(choice.to ? { to: choice.to } : {}),
            ...(choice.trespass ? { trespass: true } : {}),
            source: [{ segment: id }],
          });
          bind(beat, effectId);
          if (authoritative) beat.text = followSpeech(choice.agrees, choice.to, !!choice.trespass);
        }
        actionAnchor = beat;
      }
      if (authoritative && introduction) actionAnchor = beat;
      anchor = beat;
    }
    if (anchor) segments.push(anchor);
  }
  const playable = authoritative ? segments.filter(({ text }) => text.length > 0) : segments;
  if (!playable.length && !halt) {
    const plain = plainNarration(
      content,
      readset.relaxedNarrationProse === true,
      (label) =>
        !!reservedControl(label) ||
        speakers.has(label) ||
        aliases.has(aliasKey(label)) ||
        ambiguous.has(aliasKey(label)) ||
        npcHandle.test(label),
    );
    const narration = plain.narration;
    if (readset.entranceObservations && (narration || skippedEntranceProse))
      return { value: quietEntranceReply(), repaired: true };
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
  // Keep command and citation anchors tied to their exact original words and positions.
  let available = MAX_NARRATION_SEGMENTS - playable.length;
  if (!available || commands.length || visit || halt) return { value: { ...raw, segments: playable } };
  const cited = new Set<unknown>();
  for (const proposal of raw.keep as { source?: unknown }[]) {
    if (!Array.isArray(proposal.source)) continue;
    for (const reference of proposal.source) {
      const { segment, ground, quote } = asRecord(reference);
      const { before, after } = asRecord(asRecord(ground).at);
      // Later validation can resolve these again. A split must not make an unresolved source valid.
      if (quote !== undefined || [segment, before, after].some((position) => typeof position === "number"))
        return { value: { ...raw, segments: playable } };
      cited.add(typeof reference === "string" ? reference : segment);
      cited.add(before);
      cited.add(after);
    }
  }
  const recovered = playable.flatMap((beat) => {
    const asideId = beat.id + "-aside";
    if (
      !available ||
      beat.kind !== "dialogue" ||
      beat.presentation ||
      beat.requires.length ||
      cited.has(beat.id) ||
      cited.has(asideId)
    )
      return [beat];
    const match = quotedInlineAside.exec(beat.text);
    if (!match) return [beat];
    const [, main, aside] = match;
    available--;
    return [
      { ...beat, text: main },
      {
        id: asideId,
        kind: "dialogue",
        speakerId: beat.speakerId,
        text: aside,
        presentation: "aside",
        ...(beat.delivery ? { delivery: beat.delivery } : {}),
        ...(beat.targetId ? { targetId: beat.targetId } : {}),
        requires: [],
      },
    ];
  });
  return { value: { ...raw, segments: recovered }, ...(recovered.length > playable.length ? { repaired: true } : {}) };
}

/** A failed crossing also invalidates later prose written against the tentative positions. */
export function pruneTaggedSceneReply(raw: Record<string, unknown>, failed: Set<string>, showRejectedOutcome = false) {
  const commands = (raw.commands as Record<string, unknown>[]) ?? [];
  const keep = (raw.keep as Record<string, unknown>[]) ?? [];
  const segments = (raw.segments as Beat[]) ?? [];
  const visit = asRecord(raw.visit);
  const excluded = new Set(failed);
  const losesSource = (row: Record<string, unknown>, visible: Set<string>) =>
    Array.isArray(row.source) &&
    row.source.some((ref) => {
      if (typeof ref === "string")
        return ref !== "self" && !ref.startsWith("h:") && !ref.startsWith("native:") && !visible.has(ref);
      const { segment, ground } = asRecord(ref);
      const { before, after } = asRecord(asRecord(ground).at);
      return [segment, before, after].some((label) => typeof label === "string" && !visible.has(label));
    });
  let retained = segments;
  let cut: number;
  for (;;) {
    const validAnchors = new Set(retained.map((beat) => beat.id));
    for (const row of commands)
      if (!validAnchors.has(String(row.at)) || losesSource(row, validAnchors)) excluded.add(String(row.id));
    for (const row of keep) if (losesSource(row, validAnchors)) excluded.add(String(row.id));
    if (raw.visit && !validAnchors.has(String(visit.segment))) excluded.add("scene-visit");
    cut = segments.findIndex((beat) =>
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
  const survives = new Set(retained.map((beat) => beat.id));
  const projected = segments.flatMap<Beat>((beat, index) => {
    if (survives.has(beat.id)) return [beat];
    if (showRejectedOutcome && cut >= 0 && index > cut) return [];
    const rejected = beat.requires.some((id) => excluded.has(id));
    let text: string | undefined;
    if (rejected && beat.offerAppointment) text = "The appointment is still unsettled.";
    else if (rejected && beat.offerWork) text = "The work offer is still unsettled.";
    else if (
      showRejectedOutcome &&
      cut === index &&
      commands.some(
        (row) => row.at === beat.id && excluded.has(String(row.id)) && (row.type === "move" || row.type === "depart"),
      )
    )
      text = "The crossing didn't go through.";
    else if (
      showRejectedOutcome &&
      rejected &&
      (cut < 0 || index < cut) &&
      beat.targetId === "player" &&
      (visit.segment === beat.id ||
        commands.some((row) => row.at === beat.id && excluded.has(String(row.id)) && row.type === "move.decide"))
    )
      text = "No agreement was recorded.";
    return text ? [{ id: "outcome-" + beat.id, kind: "narration", text, requires: [] }] : [];
  });
  if (!projected.length) return null;
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
  return { segments: projected, commands: remaining, keep: notes, ...(keepVisit ? { visit } : {}) };
}
