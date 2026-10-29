import { acousticFingerprint } from "./scene-acoustics.js";
import { attentionQuotes, attentionSourceSpan, sourceAttentionCheck } from "./attention-sources.js";
import type { VenueScene } from "../models/scene-model.js";
import type { VillageVenue } from "../models/world.js";
import { contactNeighbors, contactPosition, type DoorwayContact } from "./venue-contact.js";
import { asRecord } from "./coerce.js";
import type { InterpretationCheck, InterpretationResult } from "../models/interpretation-check-model.js";
import { validDecisionEvidence } from "./decision-candidates.js";
import { fingerprint } from "./interpretation-rules.js";

/** Private, cited routing proposals. They establish neither hearing nor physical success. */
export type AttentionFragment = {
  targetZoneId?: string;
  delivery?: import("./scene-acoustics.js").SoundDelivery;
  outward?: boolean;
  wordZoneIds?: string[];
  id: string;
  start: number;
  end: number;
  kind: "speech" | "sound";
  reach: "directed" | "broadcast";
  zoneIds: string[];
};
export type AttentionPlan = {
  status: "local" | "attention" | "clarify";
  fragments: AttentionFragment[];
  question?: string;
  validation?: { version: 1 | 2 | 3; fingerprint: string };
};

export function attentionDestinations(venue: VillageVenue, scene: VenueScene) {
  return contactNeighbors(venue, scene.zoneId ?? "exterior", scene).map((id) => {
    const zone = venue.zones?.find((entry) => entry.id === id);
    return {
      id,
      label: zone?.seen ? zone.name : zone?.kind === "private-residence" ? "Private Space" : "Adjacent Space",
    };
  });
}

export const localAttention = (): AttentionPlan => ({ status: "local", fragments: [] });
export const clarifyAttention = (fragments: AttentionFragment[] = []): AttentionPlan => ({
  status: "clarify",
  fragments,
  question: fragments.length
    ? fragments.some((fragment) => fragment.kind === "speech")
      ? "The system wasn’t sure who you were trying to reach."
      : "The system wasn’t sure which space you meant."
    : "The system wasn’t sure what someone nearby should be able to hear.",
});

function recentAttentionLines(scene: VenueScene) {
  return scene.lines.filter((line) => !line.contactHidden && !line.contactReport).slice(-2);
}

function liveAttentionRoutes(venue: VillageVenue, scene: VenueScene) {
  const neighbors = contactNeighbors(venue, scene.zoneId ?? "exterior", scene);
  return [
    ...new Set(
      (scene.doorwayContacts ?? [])
        .filter(
          (entry) =>
            entry.playerZoneId === scene.zoneId &&
            neighbors.includes(entry.characterZoneId) &&
            !scene.departedIds?.includes(entry.characterId) &&
            (scene.accompanying?.find((person) => person.characterId === entry.characterId)?.zoneId ??
              scene.sceneAttendance?.occupants.find((person) => person.characterId === entry.characterId)?.zoneId) ===
              entry.characterZoneId,
        )
        .map((entry) => entry.characterZoneId),
    ),
  ];
}

/** Only the latest visible exchange can supply a conversational default. */
function latestAttentionSpeaker(scene: VenueScene) {
  const speakers = new Set<string>();
  for (const line of [...scene.lines].reverse()) {
    if (line.contactHidden || line.contactReport) continue;
    if (line.role === "user") break;
    if (line.kind === "narration" || line.kind === "side" || line.kind === "whisper") continue;
    if (line.speakerId) speakers.add(line.speakerId);
  }
  return speakers.size === 1 ? [...speakers][0] : undefined;
}

export function attentionConversation(venue: VillageVenue, scene: VenueScene) {
  const speakerId = latestAttentionSpeaker(scene);
  const routes = liveAttentionRoutes(venue, scene);
  const contact = scene.doorwayContacts?.find(
    (entry) =>
      entry.characterId === speakerId &&
      routes.includes(entry.characterZoneId) &&
      entry.playerZoneId === scene.zoneId &&
      !scene.activeIds.includes(entry.characterId),
  );
  return contact
    ? {
        speakerId: contact.characterId,
        zoneId: contact.characterZoneId,
        name: scene.participants.find((person) => person.characterId === contact.characterId)?.name ?? "",
      }
    : undefined;
}

/** Movement changes reach, not the identity of a witnessed conversation. */
export function movedAttentionContacts(venue: VillageVenue, before: VenueScene, after: VenueScene): DoorwayContact[] {
  const neighbors = contactNeighbors(venue, after.zoneId ?? "exterior", after);
  const contacts = (before.doorwayContacts ?? []).filter(
    (entry) =>
      entry.playerZoneId === before.zoneId && contactPosition(before, entry.characterId) === entry.characterZoneId,
  );
  const speakerId = latestAttentionSpeaker(before);
  if (speakerId && before.activeIds.includes(speakerId) && !contacts.some((entry) => entry.characterId === speakerId)) {
    contacts.push({
      characterId: speakerId,
      playerZoneId: before.zoneId ?? "exterior",
      characterZoneId: contactPosition(before, speakerId),
      delivery: "voice",
    });
  }
  return contacts.flatMap((entry) => {
    const position = contactPosition(after, entry.characterId);
    return position && position !== after.zoneId && neighbors.includes(position)
      ? [{ ...entry, playerZoneId: after.zoneId ?? "exterior", characterZoneId: position, delivery: "voice" as const }]
      : [];
  });
}

export function attentionClarificationChoices(venue: VillageVenue, scene: VenueScene) {
  return attentionDestinations(venue, scene).map((destination) => {
    const names = [
      ...new Set(
        (scene.doorwayContacts ?? [])
          .filter(
            (entry) =>
              entry.playerZoneId === scene.zoneId &&
              entry.characterZoneId === destination.id &&
              contactPosition(scene, entry.characterId) === destination.id &&
              scene.lines.some(
                (line) =>
                  !line.contactHidden &&
                  !line.contactReport &&
                  line.role === "assistant" &&
                  line.kind !== "narration" &&
                  line.kind !== "side" &&
                  line.kind !== "whisper" &&
                  line.speakerId === entry.characterId,
              ),
          )
          .flatMap((entry) =>
            scene.participants
              .filter((person) => person.characterId === entry.characterId)
              .map((person) => person.name),
          ),
      ),
    ];
    return {
      ...destination,
      label: names.length ? (names.join(", ") + " · " + destination.label).slice(0, 100) : destination.label,
    };
  });
}

function attentionPlanFingerprint(
  plan: AttentionPlan,
  message: string,
  venue: VillageVenue,
  scene: VenueScene,
  legacyContinuation = false,
) {
  const check = attentionCheck(message, venue, scene, false, plan.validation?.version === 2, !legacyContinuation);
  return fingerprint([
    {
      ...check,
      facts: {
        context: check.facts,
        history: recentAttentionLines(scene).map((line) => ({
          id: line.id,
          content: line.content,
          speaker: line.speakerId,
          role: line.role,
          kind: line.kind,
        })),
        localRecipients: scene.participants
          .filter((person) => scene.activeIds.includes(person.characterId))
          .map((person) => ({ id: person.characterId, name: person.name })),
        plan: { status: plan.status, fragments: plan.fragments, question: plan.question ?? null },
      },
    },
  ]);
}

/** Only Villages mints this binding; provider output never supplies it. */
export function bindAttentionPlan(
  plan: AttentionPlan,
  message: string,
  venue: VillageVenue,
  scene: VenueScene,
  sourceReferences = plan.validation?.version === 2,
): AttentionPlan {
  const bound: AttentionPlan = { ...plan, validation: { version: sourceReferences ? 2 : 1, fingerprint: "" } };
  bound.validation!.fingerprint = attentionPlanFingerprint(bound, message, venue, scene);
  return bound;
}

export function validAttentionPlan(plan: AttentionPlan, message: string, venue: VillageVenue, scene: VenueScene) {
  if (plan?.validation?.version === 3)
    return (
      Array.isArray(plan.fragments) && plan.validation.fingerprint === acousticFingerprint(plan, message, venue, scene)
    );
  return (
    (plan?.validation?.version === 1 || plan?.validation?.version === 2) &&
    Array.isArray(plan.fragments) &&
    (plan.validation.fingerprint === attentionPlanFingerprint(plan, message, venue, scene) ||
      (plan.validation.version === 2 &&
        plan.validation.fingerprint === attentionPlanFingerprint(plan, message, venue, scene, true)))
  );
}

export function holdAttentionPlan(message: string, venue: VillageVenue, scene: VenueScene): AttentionPlan {
  return bindAttentionPlan(
    {
      ...clarifyAttention(),
      question: "This saved action needs fresh interpretation. Edit the draft before sending it again.",
    },
    message,
    venue,
    scene,
  );
}

/** Only complete, narrow forms bypass contextual interpretation. */
export function directAttention(
  message: string,
  venue: VillageVenue,
  scene: VenueScene,
  contextual = false,
): AttentionPlan | null {
  const neighbors = contactNeighbors(venue, scene.zoneId ?? "exterior", scene);
  if (!neighbors.length) return localAttention();
  if (/^(?:I\s+)?(?:knock(?:\s+(?:on|at)\s+(?:the\s+)?door)?|call\s+out)[.!]?$/iu.test(message.trim())) {
    const fragment: AttentionFragment = {
      id: "attention:0",
      start: 0,
      end: message.length,
      kind: "sound",
      reach: "directed",
      zoneIds: neighbors.length === 1 ? neighbors : [],
    };
    return neighbors.length === 1 ? { status: "attention", fragments: [fragment] } : clarifyAttention([fragment]);
  }
  const quote = message.match(/^\s*["“]([^"”]+)["”]\s*[.!?]?\s*$/u);
  const conversation = contextual ? attentionConversation(venue, scene) : undefined;
  const routes = contextual ? (conversation ? [conversation.zoneId] : []) : liveAttentionRoutes(venue, scene);
  const words = (text: string) =>
    " " +
    text
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim() +
    " ";
  const changesRecipient =
    quote &&
    scene.participants.some(
      (person) =>
        (contextual ? person.characterId !== conversation?.speakerId : scene.activeIds.includes(person.characterId)) &&
        words(quote[1]!).includes(words(person.name)),
    );
  if (quote && routes.length === 1 && !changesRecipient) {
    const start = message.indexOf(quote[1]!);
    return {
      status: "attention",
      fragments: [
        { id: "attention:0", start, end: start + quote[1]!.length, kind: "speech", reach: "directed", zoneIds: routes },
      ],
    };
  }
  return null;
}

export function attentionCheck(
  message: string,
  venue: VillageVenue,
  scene: VenueScene,
  legacySystemProfile = false,
  sourceReferences = false,
  continuations = true,
): InterpretationCheck {
  const destinations = attentionDestinations(venue, scene);
  const simple =
    message.length <= 240 &&
    !/["“”*;,:\n]|\b(?:and|then|while|whisper|quietly|silently|think|thought)\b/iu.test(message) &&
    message.split(/[.!?]+\s+/u).length === 1;
  const outcomes = [
    {
      id: "local",
      statement:
        "The current player message has no present nearby attention attempt or potentially audible cross-Zone event. Historical, hypothetical, negated and quoted actions remain local.",
    },
    {
      id: "clarify",
      statement:
        "A directed nearby attention attempt has an ambiguous destination or audible content; clarification is required.",
    },
    {
      id: "attention",
      statement: "The current message contains nearby attention fragments requiring extraction from its exact words.",
    },
    ...destinations.flatMap((zone) => [
      {
        id: `speech:${zone.id}`,
        statement: `The WHOLE current message is present speech deliberately addressed through the adjacent boundary ${zone.label} (${zone.id}), with no private or local-only material.`,
      },
      {
        id: `sound:${zone.id}`,
        statement: `The WHOLE current message is one present action attempting to make an audible sound toward the adjacent boundary ${zone.label} (${zone.id}), with no separate speech or private material.`,
      },
    ]),
    {
      id: "broadcast",
      statement:
        "The WHOLE current message is one present action attempting a general loud sound potentially audible in every directly adjacent Zone, with no separate speech or private material.",
    },
  ];
  const check: InterpretationCheck = {
    id: "attention",
    domain: "attention",
    question: "What, if anything, could this current player action make audible in an adjacent Zone?",
    evidence: [
      ...recentAttentionLines(scene).map((line) => ({
        id: line.id,
        speakerId: line.role === "user" ? "player" : line.speakerId,
        name: line.name || "Player",
        content: line.content.slice(0, 250),
        ...(!legacySystemProfile ? { kind: line.kind ?? "speech" } : {}),
      })),
      { id: "player-input", speakerId: "player", name: "Player", content: message, current: true },
    ],
    facts: {
      ...(sourceReferences && continuations ? { conversationTarget: attentionConversation(venue, scene) } : {}),
      currentZoneId: scene.zoneId ?? "exterior",
      destinations,
      // Scope 2 requests retain their exact purchased System identity during recovery.
      openRoutes: legacySystemProfile
        ? [
            ...new Set(
              (scene.doorwayContacts ?? [])
                .map((entry) => entry.characterZoneId)
                .filter((id) => destinations.some((zone) => zone.id === id)),
            ),
          ]
        : liveAttentionRoutes(venue, scene),
      ...(!legacySystemProfile
        ? {
            decisionContextComplete: recentAttentionLines(scene).every((line) => line.content.length <= 250),
            localRecipients: scene.participants
              .filter((person) => scene.activeIds.includes(person.characterId))
              .map((person) => ({ id: person.characterId, name: person.name })),
          }
        : {}),
    },
    outcomes: simple ? outcomes.filter((option) => option.id !== "attention") : outcomes.slice(0, 3),
    decisionEligible: simple,
    decisionReason: "Mixed or detailed actions need exact audible-fragment extraction in one compact System request.",
    systemInstruction:
      'Recognize any CURRENT attention attempt or potentially audible nearby event, including knocking, calling, impacts, accidents and explosions. Ordinary voice stays local unless directed across a boundary or following an established remote exchange. Separate attempts from physical success. Do not establish damage, hearing or attendance. Historical, hypothetical, quoted, negated actions and private speech/thought are not transmitted. For outcome attention, or clarify with a known action, return details:{fragments:[{start:0,end:10,kind:"speech|sound",reach:"directed|broadcast",zoneIds:[]}]}. Offsets are zero-based JavaScript string offsets into player-input, end exclusive. At most four fragments. Speech includes ONLY audible words; omit surrounding action/private material. Sound cites its attempted action but listeners receive only a generic sound, never those private words. Directed zoneIds contains one supplied destination or [] when ambiguous. Broadcast sound reaches all supplied destinations; never broadcast ordinary speech. No valid nearby destination means local. If meaning is unclear, return unresolved. Cite player-input for current attention.' +
      (legacySystemProfile
        ? ""
        : " Extract every directed audible utterance in full, including separate quoted passages around a gesture. Never shorten an utterance, clip a quotation, or use a fixed-length excerpt. Keep separately spoken passages as separate exact spans."),
  };
  return sourceReferences ? sourceAttentionCheck(check, message, scene) : check;
}

export function readAttentionPlan(
  result: InterpretationResult,
  message: string,
  venue: VillageVenue,
  scene: VenueScene,
  sourceReferences = false,
): AttentionPlan {
  const neighbors = contactNeighbors(venue, scene.zoneId ?? "exterior", scene);
  if (
    result.source === "decisions" &&
    !validDecisionEvidence(attentionCheck(message, venue, scene, false, sourceReferences), result)
  )
    return clarifyAttention();
  if (result.failure) return clarifyAttention();
  if (result.outcome === "unresolved")
    return {
      ...clarifyAttention(),
      ...(/budget|allowance|fit|too many/iu.test(result.reason)
        ? { question: "This action exceeds the routing budget. Shorten the draft before sending it again." }
        : {}),
    };
  if (result.outcome === "local" || result.outcome === "none") return localAttention();
  const whole = (kind: "speech" | "sound", reach: "directed" | "broadcast", zoneIds: string[]): AttentionPlan => ({
    status: "attention",
    fragments: [{ id: "attention:0", start: 0, end: message.length, kind, reach, zoneIds }],
  });
  const simple = attentionCheck(message, venue, scene, false, sourceReferences).decisionEligible;
  if (sourceReferences && simple && result.outcome === "continue-exchange") {
    const conversation = attentionConversation(venue, scene);
    return conversation ? whole("speech", "directed", [conversation.zoneId]) : clarifyAttention();
  }
  if (simple && result.outcome === "broadcast") return whole("sound", "broadcast", neighbors);
  if (simple && /^(?:speech|sound):/u.test(result.outcome)) {
    const [kind, ...parts] = result.outcome.split(":");
    const destination = parts.join(":");
    return neighbors.includes(destination)
      ? whole(kind as "speech" | "sound", "directed", [destination])
      : clarifyAttention();
  }
  const rows = asRecord(result.details).fragments;
  if (!Array.isArray(rows) || !rows.length || rows.length > 4) return clarifyAttention();
  const fragments: AttentionFragment[] = [];
  for (const [index, value] of rows.entries()) {
    const proposal = asRecord(value);
    const span = sourceReferences ? attentionSourceSpan(proposal.source, message) : proposal;
    if (!span)
      return {
        ...clarifyAttention(),
        question: "Could not identify the spoken passage or sound attempt. Edit the draft before sending again.",
      };
    const row: Record<string, unknown> = { ...proposal, start: span.start, end: span.end };
    const start = Number(row.start),
      end = Number(row.end);
    if (
      !Number.isSafeInteger(row.start) ||
      !Number.isSafeInteger(row.end) ||
      start < 0 ||
      end <= start ||
      end > message.length ||
      (row.kind !== "speech" && row.kind !== "sound") ||
      (row.reach !== "directed" && row.reach !== "broadcast") ||
      (!sourceReferences && row.kind === "speech" && row.reach === "broadcast") ||
      !Array.isArray(row.zoneIds) ||
      row.zoneIds.some((id) => typeof id !== "string" || !neighbors.includes(id)) ||
      (row.reach === "directed" && row.zoneIds.length > 1)
    )
      return clarifyAttention();
    const prefix = message.slice(Math.max(0, start - 80), start);
    const source = message.slice(start, end);
    if (sourceReferences && row.kind === "speech" && row.reach === "broadcast") {
      const delivery = attentionSourceSpan(row.deliverySource, message);
      if (
        !delivery ||
        attentionQuotes(message).some((quote) => delivery.start < quote.end && delivery.end > quote.start) ||
        /^(?:I\s+)?(?:would|could|might|will|plan|intend|don't|do not|didn't|did not)\b|^(?:yesterday|earlier)\b/iu.test(
          message.slice(delivery.start, delivery.end).trim(),
        )
      )
        return clarifyAttention();
    }
    if (
      row.kind === "speech" &&
      /\b(?:whisper|whispers|whispered|quietly|silently|think|thought)\b[^.!?]*$/iu.test(prefix)
    )
      return clarifyAttention();
    if (
      (!sourceReferences || row.kind === "sound") &&
      /^(?:I\s+)?(?:would|could|might|will|plan|intend|don't|do not|didn't|did not)\b|^(?:yesterday|earlier)\b/iu.test(
        source.trim(),
      )
    )
      return clarifyAttention();
    fragments.push({
      id: `attention:${index}`,
      start,
      end,
      kind: row.kind,
      reach: row.reach,
      zoneIds: row.reach === "broadcast" ? neighbors : [...new Set(row.zoneIds as string[])],
    });
  }
  // Quoted speech is an exact unit. Never accept a clipped excerpt as though
  // it were the whole utterance (or include surrounding private actions).
  for (const quoted of message.matchAll(/["“]([^"”]+)["”]/gu)) {
    const start = quoted.index! + 1;
    const end = start + quoted[1]!.length;
    if (
      fragments.some(
        (fragment) =>
          fragment.kind === "speech" &&
          fragment.start < end &&
          fragment.end > start &&
          (fragment.start !== start || fragment.end !== end),
      )
    )
      return {
        ...clarifyAttention(),
        question: sourceReferences
          ? "Could not identify the complete spoken passage. Edit the draft before sending again."
          : "The audible words were incomplete. Please rephrase the speech or choose Contact.",
      };
  }
  if (
    fragments.some((fragment, index) =>
      fragments.slice(0, index).some((prior) => fragment.start < prior.end && fragment.end > prior.start),
    )
  )
    return clarifyAttention();
  if (result.outcome === "clarify")
    return fragments.some((fragment) => !fragment.zoneIds.length) ? clarifyAttention(fragments) : clarifyAttention();
  return fragments.some((fragment) => !fragment.zoneIds.length)
    ? clarifyAttention(fragments)
    : { status: "attention", fragments };
}

/** Decode only bounded private proposals; a malformed pending record cannot authorize routing. */
export function coercePendingAttention(value: unknown): VenueScene["pendingAttention"] {
  const raw = asRecord(value),
    plan = asRecord(raw.plan);
  if (
    typeof raw.id !== "string" ||
    !raw.id ||
    raw.id.length > 160 ||
    typeof raw.message !== "string" ||
    raw.message.length > 4000 ||
    !Number.isSafeInteger(raw.revision) ||
    Number(raw.revision) < 0 ||
    typeof raw.originZoneId !== "string" ||
    plan.status !== "clarify" ||
    !Array.isArray(plan.fragments) ||
    plan.fragments.length > 4 ||
    !Array.isArray(raw.choices) ||
    raw.choices.length > 32
  )
    return undefined;
  const choices = raw.choices.map(asRecord);
  if (
    choices.some(
      (choice) =>
        typeof choice.id !== "string" || !choice.id || typeof choice.label !== "string" || choice.label.length > 100,
    )
  )
    return undefined;
  const fragments: AttentionFragment[] = [];
  for (const [index, value] of plan.fragments.entries()) {
    const row = asRecord(value);
    if (
      row.id !== `attention:${index}` ||
      !Number.isSafeInteger(row.start) ||
      !Number.isSafeInteger(row.end) ||
      Number(row.start) < 0 ||
      Number(row.end) <= Number(row.start) ||
      Number(row.end) > raw.message.length ||
      (row.kind !== "speech" && row.kind !== "sound") ||
      (row.reach !== "directed" && row.reach !== "broadcast") ||
      (![2, 3].includes(Number(asRecord(plan.validation).version)) &&
        row.kind === "speech" &&
        row.reach !== "directed") ||
      !Array.isArray(row.zoneIds) ||
      row.zoneIds.length > 32 ||
      row.zoneIds.some((id) => typeof id !== "string")
    )
      return undefined;
    if (row.reach === "directed" && row.zoneIds.length > 1) return undefined;
    fragments.push({
      ...(asRecord(plan.validation).version === 3
        ? {
            ...(typeof row.targetZoneId === "string" ? { targetZoneId: row.targetZoneId } : {}),
            delivery: row.delivery as AttentionFragment["delivery"],
            outward: row.outward === true,
            wordZoneIds: Array.isArray(row.wordZoneIds)
              ? row.wordZoneIds.filter((id): id is string => typeof id === "string")
              : [],
          }
        : {}),
      id: String(row.id),
      start: Number(row.start),
      end: Number(row.end),
      kind: row.kind,
      reach: row.reach,
      zoneIds: row.zoneIds as string[],
    });
  }
  return {
    ...(typeof raw.intentKey === "string" && raw.intentKey.length <= 500 ? { intentKey: raw.intentKey } : {}),
    id: raw.id,
    message: raw.message,
    revision: Number(raw.revision),
    originZoneId: raw.originZoneId,
    plan: {
      ...(fragments.some((fragment) => !fragment.zoneIds.length)
        ? {
            ...clarifyAttention(fragments),
            ...(typeof plan.question === "string" ? { question: plan.question.slice(0, 160) } : {}),
          }
        : {
            ...clarifyAttention(),
            question: typeof plan.question === "string" ? plan.question.slice(0, 160) : clarifyAttention().question,
          }),
      ...([1, 2, 3].includes(Number(asRecord(plan.validation).version)) &&
      /^[a-f0-9]{64}$/u.test(String(asRecord(plan.validation).fingerprint))
        ? {
            validation: {
              version: Number(asRecord(plan.validation).version) as 1 | 2 | 3,
              fingerprint: String(asRecord(plan.validation).fingerprint),
            },
          }
        : {}),
    },
    choices: choices.map((choice) => ({ id: String(choice.id), label: String(choice.label) })),
  };
}
