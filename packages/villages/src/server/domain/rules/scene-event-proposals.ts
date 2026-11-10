import { asRecord } from "./coerce.js";
import { badGateway } from "./errors.js";
import { MEMORY_EXCERPT_LIMIT } from "./memory-integrity.js";
import { neutralRelationship, relationshipKey } from "./relationship-rules.js";
import type { semanticContext } from "./semantic-contract.js";
import { sceneHistoryRow } from "./scene-writing-history.js";
import { sceneAppointment } from "./scene-calendar.js";
import type { NarrativeAdmission } from "../models/narrative-model.js";

type Context = ReturnType<typeof semanticContext>;
type Source = { text: string; kind: string; speakerId: string };
const fail = (message: string): never => {
  throw badGateway(message + " Your draft is preserved.");
};
const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return fail("An event value must be an object.");
  return value as Record<string, unknown>;
};
const list = (value: unknown, limit = 16): unknown[] => {
  if (!Array.isArray(value) || value.length > limit) return fail("An event list is invalid.");
  return value;
};
const fields = (value: Record<string, unknown>, allowed: string[]) => {
  if (Object.keys(value).some((key) => !allowed.includes(key)))
    fail("An event value includes unsupported authority fields.");
};

/** One model grammar. The result is a server-authored native operation set, never another model contract. */
export function expandSceneEvents(
  raw: Record<string, unknown>,
  context: Context,
  grant: NarrativeAdmission | null = null,
): Record<string, unknown> {
  if (Object.keys(raw).some((key) => !["input", "segments", "events"].includes(key)))
    return fail("The GM response uses an unsupported contract.");
  if (!Array.isArray(raw.input) || !Array.isArray(raw.segments))
    return fail("The GM response needs input and segments.");
  const segments = raw.segments.map(asRecord);
  if (
    segments.length > 24 ||
    segments.some((row) => typeof row.text !== "string" || !row.text.trim() || row.text.length > 2000)
  )
    return fail("A Scene source exceeds its supported bounds.");
  const source = (ref: unknown): Source => {
    if (typeof ref === "string" && /^input:\d+$/u.test(ref)) {
      const row = asRecord(raw.input[Number(ref.slice(6))]);
      if ((row.kind ?? "speech") !== "speech" || typeof row.text !== "string" || !row.text.trim())
        return fail("An event cannot cite non-audible input as speech.");
      return { text: row.text, kind: "dialogue", speakerId: "player" };
    }
    if (typeof ref === "number" && Number.isSafeInteger(ref) && ref >= 0) {
      const row = segments[ref];
      if (
        !row ||
        typeof row.text !== "string" ||
        !row.text.trim() ||
        !["dialogue", "narration"].includes(String(row.kind))
      )
        return fail("An event has an invalid Scene source.");
      return { text: row.text, kind: String(row.kind), speakerId: String(row.speakerId ?? "__venue_scene__") };
    }
    const line = typeof ref === "string" ? context.history.find((line) => line.id === ref) : undefined;
    if (!line) return fail("An event cited history outside its supplied context.");
    const projected = sceneHistoryRow(
      line,
      context.actors.map((actor) => actor.id),
      true,
    );
    if (!projected?.citable) return fail("An event cited history outside its supplied witnesses.");
    return {
      text: projected.text,
      kind: projected.kind === "narration" ? "narration" : "dialogue",
      speakerId: projected.speakerId,
    };
  };
  const result: Record<string, any> = {
    input: raw.input,
    segments: raw.segments,
    events: { moves: [], departures: [], contactEnd: [] },
    access: [],
    memoryChanges: [],
    wishChanges: [],
    projectSpeech: [],
    relationshipChanges: { changes: [], permissions: [], disclosures: [] },
    action: null,
    halt: { reason: "none", quote: "", appointments: [] },
    narrativeIntroduction: { status: "quiet", development: null },
  };
  const append = (field: string, value: unknown) => {
    (result[field] ??= []).push(value);
  };
  const events = raw.events === undefined ? [] : list(raw.events, 32);
  const createdWishes = new Set<string>();
  for (const candidate of events) {
    const event = object(candidate);
    const type = String(event.type);
    if (Object.keys(event).some((key) => !["type", "actorId", "targetId", "at", "value", "reason"].includes(key))) {
      if (type === "presentation") continue;
      return fail("An event includes unsupported authority fields.");
    }
    const domain = (
      {
        memory: "memoryChanges",
        wish: "wishChanges",
        relationship: "relationshipChanges",
        project: "projectSpeech",
      } as Record<string, string>
    )[type];
    try {
      const value = event.value === undefined ? {} : asRecord(event.value);
      const refs = ["boundary", "appointment"].includes(type) ? [] : list(event.at, 8);
      if (!["boundary", "appointment"].includes(type) && !refs.length) fail("An event needs exact source references.");
      if (type === "move-request") {
        fields(value, ["actors"]);
        if (refs.length !== 1 || typeof refs[0] !== "string" || !/^input:\d+$/u.test(refs[0]))
          fail("A movement request needs one exact original input selection.");
        const input = asRecord(raw.input[Number(String(refs[0]).slice(6))]);
        if (typeof input.text !== "string" || !["speech", "action"].includes(String(input.kind ?? "speech")))
          fail("A movement request has no supported input source.");
      }
      const lines = type === "move-request" ? [] : refs.map(source);
      const speech = (current = false, single = false) => {
        if (
          (single && refs.length !== 1) ||
          (current && refs.some((ref) => typeof ref !== "number" && !/^input:\d+$/u.test(String(ref))))
        )
          return fail("This decision needs exact current speech with a supported source count.");
        if (lines.some((line) => line.kind !== "dialogue") || new Set(lines.map((line) => line.speakerId)).size !== 1)
          return fail("A decision needs the deciding person's exact speech.");
        const actorId = lines[0].speakerId;
        if (event.actorId !== undefined && event.actorId !== actorId) return fail("A decision cited another speaker.");
        return actorId;
      };
      const narration = () => {
        if (refs.length !== 1 || typeof refs[0] !== "number" || lines[0].kind !== "narration")
          return fail("A physical event needs one current narration source.");
        return Number(refs[0]);
      };
      const reason = event.reason ?? "Current witnessed development";
      switch (type) {
        case "relationship": {
          const fromId = String(event.actorId ?? ""),
            toId = String(event.targetId ?? "");
          const baseline = asRecord(asRecord(asRecord(context.social.live).edges)[relationshipKey(fromId, toId)]);
          const before = Object.keys(baseline).length ? baseline : neutralRelationship(fromId, toId);
          if (
            Object.keys(value).some(
              (key) => !["connection", "stance", "expectations", "concerns", "records"].includes(key),
            )
          )
            fail("A relationship event includes unsupported fields.");
          const records =
            value.records === undefined
              ? []
              : list(value.records).map((entry) => {
                  const record = object(entry),
                    id = typeof record.id === "string" ? record.id : "";
                  const existing = id
                    ? (asRecord(asRecord(context.social.live).sharedRecords)[id] ?? asRecord(before.records)[id])
                    : undefined;
                  if (id && !existing) fail("A relationship record was not supplied.");
                  const previous = asRecord(existing);
                  const { revision: _revision, evidenceIds: _evidence, ...terms } = previous;
                  if (Object.hasOwn(record, "expectedRevision")) fail("Relationship revisions belong to code.");
                  return { ...terms, ...record, id, expectedRevision: previous.revision ?? 0 };
                });
          const after = {
            connection: before.connection,
            stance: before.stance,
            expectations: before.expectations,
            concerns: before.concerns,
            ...value,
            records,
          };
          result.relationshipChanges.changes.push({
            fromId,
            toId,
            expectedRevision: before.revision,
            lineIds: refs,
            reason,
            liveAfter: after,
            sceneAfter: after,
          });
          break;
        }
        case "wish":
          fields(value, [
            "intent",
            "desire",
            "condition",
            "quote",
            "approach",
            "attention",
            "supersedes",
            "disclosedStatus",
            "statusQuote",
          ]);
          if (
            value.intent === "fulfilled" &&
            !createdWishes.has(JSON.stringify([event.actorId, event.targetId])) &&
            !context._wishEvidence.some((wish) => wish.actorId === event.actorId && wish.wishId === event.targetId)
          )
            fail("This Wish's complete conditions and evidence were not supplied. The proposed outcome is held.");
          result.wishChanges.push({
            ...value,
            ...(["create", "reveal"].includes(String(value.intent)) &&
            value.quote === undefined &&
            lines.length === 1 &&
            lines[0].speakerId === event.actorId &&
            lines[0].text.length <= 320
              ? { quote: lines[0].text }
              : {}),
            actorId: event.actorId,
            wishId: event.targetId,
            evidence: refs,
            reason,
          });
          if (value.intent === "create" && String(event.targetId).startsWith("new:"))
            createdWishes.add(JSON.stringify([event.actorId, event.targetId]));
          break;
        case "project": {
          const actorId = speech(true);
          const project = context._projectContexts.find((project) => project.projectId === event.targetId);
          if (!project) fail("The Project's complete current terms were not supplied.");
          const decision = typeof event.value === "string" ? event.value : value.decision;
          if (decision === "conditional" || decision === "uncertain") {
            append("interpretationRouting", {
              actorId,
              domain: "project",
              relevance: "uncertain",
              targetIds: [project.projectId],
              segments: refs,
            });
          } else if (decision !== "refuse") {
            if (!["approval", "builder", "withdrawal"].includes(String(decision)))
              fail("The Project decision is invalid.");
            if (value.conditions !== undefined && (!Array.isArray(value.conditions) || value.conditions.length))
              fail("Conditional Project consent cannot become approval.");
            result.projectSpeech.push({
              ...project,
              kind: decision,
              speakerId: actorId,
              citations: refs.map((segment, index) => ({ segment, quote: lines[index].text })),
            });
          }
          break;
        }
        case "access":
          fields(value, ["outcome", "venueId", "visitorId", "accompanies", "conditions", "command"]);
          result.access.push({
            actorId: speech(true),
            venueId: value.venueId ?? context.placeId,
            zoneId: event.targetId ?? context.zoneId,
            visitorId: value.visitorId ?? "player",
            duration: "visit",
            ...value,
            conditions: value.conditions ?? [],
            accompanies: value.accompanies ?? false,
            evidence: refs,
          });
          break;
        case "permission":
          fields(value, ["action", "venueId", "visitorId"]);
          result.relationshipChanges.permissions.push({
            controllerId: speech(true),
            visitorId: value.visitorId ?? "player",
            venueId: value.venueId ?? context.placeId,
            zoneId: event.targetId ?? context.zoneId,
            action: value.action,
            lineIds: refs,
          });
          break;
        case "memory": {
          fields(value, [
            "kind",
            "text",
            "knowers",
            "basis",
            "action",
            "targetId",
            "subjects",
            "quotes",
            "domain",
            "disclosed",
            "protected",
            "uncertain",
          ]);
          const knowers = list(value.knowers),
            quotes = value.quotes === undefined ? undefined : list(value.quotes, 2);
          if (!knowers.length || new Set(knowers).size !== knowers.length || refs.length > 2)
            fail("Memory knowers or sources are invalid.");
          if (Object.hasOwn(value, "screening") || Object.hasOwn(value, "learners") || Object.hasOwn(value, "effectId"))
            fail("Memory persistence authority belongs to code.");
          const support = refs.map((lineId, index) => {
            const excerpt = quotes?.[index] ?? lines[index].text;
            if (
              typeof excerpt !== "string" ||
              !excerpt.trim() ||
              !lines[index].text.includes(excerpt) ||
              Buffer.byteLength(excerpt, "utf8") > MEMORY_EXCERPT_LIMIT
            )
              fail("A long Memory source needs a short exact supporting quote.");
            return { lineId, excerpt };
          });
          const target =
            value.targetId === undefined
              ? undefined
              : context._memoryWrite.recall.candidates.find((record) => record.id === value.targetId);
          if (value.targetId !== undefined && !target) fail("The Memory target was not supplied.");
          const domainRef = value.domain;
          const domain = asRecord(domainRef);
          const effectId =
            value.basis === "validated-event"
              ? domain.kind === "physical" && domain.id === context.placeId
                ? context.possibleMemoryEffects?.physical.id
                : undefined
              : undefined;
          if (value.basis === "validated-event" && !effectId)
            fail("This Memory has no supported committed-effect identity.");
          result.memoryChanges.push({
            action: value.action ?? "create",
            kind: value.kind,
            text: value.text,
            ...(value.subjects !== undefined
              ? { subjects: value.subjects }
              : value.action === "reinforce"
                ? {}
                : { subjects: [] }),
            learners: Object.fromEntries(
              knowers.map((id) => {
                if (typeof id !== "string") fail("A Memory learner is invalid.");
                if (value.basis === "report" && new Set(lines.map((line) => line.speakerId)).size !== 1)
                  fail("A report needs one actual speaker.");
                return [
                  id,
                  {
                    basis: value.basis,
                    ...(value.basis === "report" ? { attributedTo: lines[0].speakerId } : {}),
                    support,
                    ...(id === "player" && value.disclosed !== undefined ? { disclosed: value.disclosed } : {}),
                  },
                ];
              }),
            ),
            ...(target
              ? {
                  target: {
                    id: value.action === "reinforce" ? target.id : target.rootId,
                    revision: value.action === "reinforce" ? target.revision : target.rootRevision,
                    rootRevision: target.rootRevision,
                  },
                }
              : {}),
            ...(domainRef ? { domainRef } : {}),
            ...(effectId ? { effectId } : {}),
            screening: {
              disposition: value.uncertain === true ? "uncertain" : "clear",
              protectedRoots: value.protected ?? [],
              fingerprint: context._memoryWrite.protection.fingerprint,
            },
          });
          break;
        }
        case "physical": {
          if (result.action) fail("A Scene has more than one physical patch.");
          const segment = narration(),
            zone = context.zones.find((zone) => zone.id === context.zoneId);
          if (!zone || !Object.hasOwn(zone, "revision")) fail("The current physical baseline is unavailable.");
          if (
            Object.keys(value).some(
              (key) =>
                !["actors", "consent", "appearanceChanged", "edits", "append", "recent", "dayNight", "clear"].includes(
                  key,
                ),
            )
          )
            fail("A physical event includes unsupported fields.");
          const consent =
            value.consent === undefined
              ? []
              : list(value.consent).map((entry) => {
                  const row = object(entry);
                  fields(row, ["actorId", "at"]);
                  if (typeof row.at === "string" && /^input:\d+$/u.test(row.at)) {
                    const input = asRecord(raw.input[Number(row.at.slice(6))]);
                    if (typeof input.text !== "string" || (row.actorId !== undefined && row.actorId !== "player"))
                      fail("Player action consent has an invalid source.");
                    return { actorId: "player", segment: "player", quote: input.text };
                  }
                  const line = source(row.at);
                  return typeof row.at === "number"
                    ? { actorId: row.actorId ?? line.speakerId, segment: row.at, quote: line.text }
                    : { actorId: row.actorId ?? line.speakerId, lineId: row.at, quote: line.text };
                });
          const { actors, clear, ...patch } = value;
          result.action = {
            ...patch,
            consent,
            happened: true,
            segment,
            actorIds: actors ?? [event.actorId],
            narration: lines[0].text,
            expectedRevision: Number(asRecord(zone).revision),
            ...(clear === undefined
              ? {}
              : {
                  conditionClears: list(clear).map((id) => {
                    const condition = context._conditions.find((condition) => condition.id === id);
                    if (!condition) fail("A physical repair cited an unsupplied restriction.");
                    return { id, expectedRevision: condition.revision };
                  }),
                }),
          };
          break;
        }
        case "move":
          result.events.moves.push({ characterId: event.actorId, zoneId: event.targetId, segment: narration() });
          break;
        case "move-request":
          append("immediateResidentMoves", {
            characterIds: value.actors ?? [event.actorId],
            zoneId: event.targetId,
            source: refs[0],
          });
          break;
        case "depart":
          result.events.departures.push({ speakerId: speech(true, true), source: refs[0] });
          break;
        case "contact-end":
          result.events.contactEnd.push({ speakerId: speech(true, true), source: refs[0] });
          break;
        case "residence-request":
          if (result.events.residenceRequest) fail("A Scene has more than one residence request.");
          result.events.residenceRequest = { speakerId: speech(true, true), source: refs[0], venueId: event.targetId };
          break;
        case "residence-decision":
          if (result.events.residenceDecision) fail("A Scene has more than one residence decision.");
          result.events.residenceDecision = {
            speakerId: speech(true, true),
            source: refs[0],
            characterId: event.targetId,
            approved: event.value,
          };
          break;
        case "venue-request":
          if (result.events.venueRequest) fail("A Scene has more than one Venue request.");
          fields(value, ["name", "classes"]);
          result.events.venueRequest = { ...value, speakerId: speech(true, true), source: refs[0] };
          break;
        case "scene-end":
          if (result.events.sceneEnded) fail("A Scene has more than one ending.");
          result.events.sceneEnded = { speakerId: speech(true, true), source: refs[0] };
          break;
        case "npc":
          append("npcIntroductions", {
            ...value,
            ref: event.actorId,
            ...(event.targetId ? { existingId: event.targetId } : {}),
            segment: narration(),
          });
          break;
        case "discover":
          append("placeDiscoveries", { ...value, segment: refs[0], quote: lines[0].text });
          break;
        case "establish":
          append("establishmentProgress", { ...value, segment: refs[0], quote: lines[0].text });
          break;
        case "presentation":
          fields(value, ["expression", "look"]);
          append("presentation", { segment: refs[0], staging: [{ characterId: event.actorId, ...value }] });
          break;
        case "circumstance": {
          if (result.narrativeIntroduction.status !== "quiet") fail("A Scene has more than one circumstance.");
          if (!grant?.targets[0]) fail("The independent circumstance has no admitted local authority.");
          fields(value, ["severity", "occurrence", "situation", "physical", "conditions"]);
          const target = grant.targets[0];
          const situation = object(value.situation);
          fields(situation, ["id", "title", "summary", "status"]);
          const id = situation.id ?? null;
          const prior = grant.situations.find((row) => row.id === id);
          if (id !== null && !prior) fail("The circumstance cited an unadmitted situation.");
          const physical =
            value.physical === undefined
              ? []
              : [object(value.physical)].map((patch) => {
                  fields(patch, ["appearanceChanged", "edits", "append", "recent", "dayNight"]);
                  return {
                    venueId: target.venueId,
                    zoneId: target.zoneId,
                    update: { ...patch, narration: lines[0].text, expectedRevision: target.state.revision },
                  };
                });
          const conditions =
            value.conditions === undefined
              ? []
              : list(value.conditions, 4).map((item) => {
                  const condition = object(item);
                  fields(condition, ["id", "observation", "restriction", "remedy", "durationMinutes", "clear"]);
                  const id = condition.id ?? null;
                  const prior = grant.conditions.find((row) => row.id === id);
                  if (id !== null && !prior) fail("The circumstance cited an unadmitted condition.");
                  const duration = condition.durationMinutes;
                  if (
                    duration !== undefined &&
                    (!Number.isSafeInteger(duration) || Number(duration) <= 0 || Number(duration) > 10080)
                  )
                    fail("The condition duration exceeds its admitted window.");
                  return {
                    id,
                    expectedRevision: prior?.revision ?? 0,
                    venueId: target.venueId,
                    zoneId: target.zoneId,
                    observation: condition.observation ?? prior?.observation,
                    restriction: condition.restriction ?? prior?.restriction ?? "none",
                    remedy: condition.remedy ?? prior?.remedy ?? "",
                    clear: condition.clear ?? false,
                    endsAt:
                      duration === undefined
                        ? (prior?.endsAt ?? null)
                        : new Date(Date.parse(grant.at) + Number(duration) * 60_000).toISOString(),
                  };
                });
          result.narrativeIntroduction = {
            status: "introduced",
            segment: narration(),
            quote: lines[0].text,
            development: {
              severity: value.severity ?? grant.consequence,
              occurrence: value.occurrence ?? lines[0].text,
              situation: {
                ...situation,
                id,
                scope: prior?.scope ?? "zone",
                expectedRevision: prior?.revision ?? 0,
                status: situation.status ?? prior?.status ?? "active",
              },
              physical,
              conditions,
              weather: null,
            },
          };
          break;
        }
        case "boundary":
          if (result.halt.reason !== "none") fail("A Scene has conflicting boundary events.");
          result.halt = { ...value, appointments: result.halt.appointments };
          break;
        case "appointment":
          result.halt.appointments.push(sceneAppointment(value, context.preservation.calendar));
          break;
        default:
          fail("The GM proposed an unsupported event type.");
      }
    } catch (error) {
      // Cosmetic cues cannot invalidate otherwise usable dialogue or domain proposals.
      if (type === "presentation") continue;
      if (!domain) throw error;
      const rejected = { rejectedEvent: candidate, message: error instanceof Error ? error.message : String(error) };
      if (domain === "relationshipChanges") result.relationshipChanges.changes.push(rejected);
      else result[domain].push(rejected);
    }
  }
  return result;
}
