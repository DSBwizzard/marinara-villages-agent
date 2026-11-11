import { FOUNDING_CIRCUMSTANCE_MAX_LENGTH } from "../../../shared/helpers/founding-circumstance.js";
import { z } from "zod";
import type { NarrativeAdmission, NarrativeState } from "../models/narrative-model.js";
import { badGateway } from "../rules/errors.js";
import { memoryRequire } from "../rules/memory-integrity.js";
import { WORLD_WEATHER } from "../rules/village-clock.js";

/** Validate saved authority; new Worlds initialize narrative state on first use. */
export function readNarrativeState(value: unknown): NarrativeState | undefined {
  if (value === undefined) return undefined;
  const fail = () => {
    throw badGateway("Saved environmental state is invalid; restore or repair its saved source.");
  };
  const obj = (v: unknown): Record<string, any> =>
    v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, any>) : fail();
  const string = (v: unknown, limit = 1200): string => (typeof v === "string" && v.length <= limit ? v : fail());
  const number = (v: unknown): number => (Number.isSafeInteger(v) && Number(v) >= 0 ? Number(v) : fail());
  const time = (v: unknown): string => {
    const s = string(v, 30);
    if (!s || !Number.isFinite(Date.parse(s)) || new Date(s).toISOString() !== s) fail();
    return s;
  };
  const array = (v: unknown): any[] => (Array.isArray(v) ? v : fail());
  const target = (v: unknown) => {
    const r = obj(v);
    string(r.venueId, 300);
    string(r.zoneId, 300);
  };
  const situation = (v: unknown) => {
    const r = obj(v);
    string(r.id, 600);
    number(r.revision);
    string(r.title, 160);
    string(r.summary, FOUNDING_CIRCUMSTANCE_MAX_LENGTH);
    if (!["active", "resolved"].includes(r.status)) fail();
    if (
      !["village", "zone"].includes(r.scope) ||
      (r.scope === "village" && array(r.targets).length !== 0) ||
      (r.scope === "zone" && !array(r.targets).length)
    )
      fail();
    time(r.updatedAt);
    array(r.targets).forEach(target);
  };
  const condition = (v: unknown) => {
    const r = obj(v);
    if (
      Object.keys(r).some(
        (key) =>
          ![
            "id",
            "revision",
            "situationId",
            "venueId",
            "zoneId",
            "observation",
            "restriction",
            "remedy",
            "startsAt",
            "endsAt",
            "clearedAt",
            "repairEntries",
          ].includes(key),
      )
    )
      fail();
    target(r);
    string(r.id, 600);
    string(r.situationId, 600);
    number(r.revision);
    string(r.observation, 600);
    string(r.remedy, 600);
    if (!["none", "ordinary-use"].includes(r.restriction)) fail();
    time(r.startsAt);
    if (r.endsAt !== null) time(r.endsAt);
    if (r.clearedAt !== null) time(r.clearedAt);
    if (r.repairEntries !== undefined) {
      const entries = array(r.repairEntries);
      if (!entries.length || entries.length > 4 || new Set(entries).size !== entries.length) fail();
      entries.forEach((entry) => {
        if (!/^continuity-[a-f0-9]{32}$/u.test(string(entry, 160))) fail();
      });
    }
  };
  const weather = (v: unknown) => {
    if (v === null) return;
    const r = obj(v);
    string(r.id, 600);
    number(r.revision);
    string(r.sourceId, 600);
    if (!WORLD_WEATHER.includes(r.description)) fail();
    if (time(r.endsAt) <= time(r.startsAt)) fail();
  };
  const r = obj(value);
  if (
    r.version !== 1 ||
    Object.keys(r).some(
      (key) =>
        ![
          "version",
          "adoptedAt",
          "revision",
          "weatherRevision",
          "weather",
          "situations",
          "conditions",
          "receipts",
          "claims",
        ].includes(key),
    )
  )
    fail();
  if (r.claims !== undefined)
    for (const claim of array(r.claims)) {
      const c = obj(claim);
      target(c);
      string(c.id, 600);
      string(c.attemptId, 600);
      string(c.fingerprint, 128);
      if (c.batchId !== undefined) string(c.batchId, 100);
      if (c.sceneId !== undefined) {
        string(c.sceneId, 300);
        string(c.submissionId, 300);
      }
    }
  time(r.adoptedAt);
  number(r.revision);
  number(r.weatherRevision);
  weather(r.weather);
  array(r.situations).forEach(situation);
  array(r.conditions).forEach(condition);
  for (const receipt of array(r.receipts)) {
    const p = obj(receipt);
    if (
      Object.keys(p).some(
        (key) =>
          !["id", "sourceId", "at", "occurrence", "rejected", "source", "after", "resultFingerprint"].includes(key),
      )
    )
      fail();
    string(p.id, 600);
    string(p.sourceId, 600);
    time(p.at);
    string(p.occurrence);
    if (p.rejected !== undefined && typeof p.rejected !== "boolean") fail();
    if (!["world", "scene"].includes(p.source)) fail();
    if (p.rejected ? p.resultFingerprint !== undefined : !/^[a-f0-9]{64}$/u.test(string(p.resultFingerprint, 64)))
      fail();
    const after = obj(p.after);
    array(after.situations).forEach(situation);
    array(after.conditions).forEach(condition);
    if (after.weatherRevision !== undefined) {
      number(after.weatherRevision);
      weather(after.weather);
    }
  }
  for (const rows of [r.situations, r.conditions, r.receipts])
    if (new Set(rows.map((row: { id: string }) => row.id)).size !== rows.length) fail();
  return structuredClone(value) as NarrativeState;
}

const id = z.string().min(1).max(600);
const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const revision = z.number().int().nonnegative().safe();
const instant = z
  .string()
  .refine((value) => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value);
const weatherValue = z.string().refine((value) => WORLD_WEATHER.includes(value));
const roomId = z.string().regex(/^continuity-[a-f0-9]{32}$/u);
const target = z
  .object({
    venueId: id,
    zoneId: id,
    name: z.string(),
    exterior: z.boolean(),
    structure: digest,
    roomBasis: digest,
    controllers: z.array(id),
    correctiveActorIds: z.array(id),
    roomWritable: z.boolean(),
    room: z.array(z.object({ id: roomId, text: z.string().min(1).max(16000), expiresAt: instant.optional() }).strict()),
    protections: z.array(
      z
        .object({
          id: roomId,
          for: z.literal("room"),
          forgotten: z.boolean(),
          forbidden: z.array(z.string().max(16000)),
          corrected: z.string().max(16000).optional(),
        })
        .strict(),
    ),
  })
  .strict();
const worldGrant = z
  .object({
    version: z.literal(2),
    id,
    source: z.literal("world"),
    sourceId: id,
    seed: id,
    setupAt: instant,
    at: instant,
    adoptedAt: instant,
    setting: z.string(),
    facts: z.array(z.string()),
    consequence: z.enum(["gentle", "moderate", "dramatic"]),
    reviewBasis: z.union([instant, z.literal("")]),
    targets: z.tuple([target]),
    situations: z.array(z.unknown()).max(8),
    conditions: z.array(z.unknown()).max(8),
    weather: z.unknown(),
    weatherRevision: revision,
    baselineWeather: weatherValue,
    moment: z
      .object({
        dateLabel: z.string(),
        weekday: z.string(),
        season: z.enum(["spring", "summer", "autumn", "winter"]),
        dayPhase: z.string(),
        instant,
        localTime: z.string(),
        minuteOfDay: z.number().int().min(0).max(1439),
        timeZone: z.string(),
        hour: z.number().int().min(0).max(23),
        minute: z.number().int().min(0).max(59),
        weather: weatherValue,
        dayIndex: revision,
        nextTransitionAt: instant,
      })
      .strict(),
  })
  .strict();
const opportunity = z
  .object({
    id,
    kind: z.literal("world"),
    startsAt: instant,
    endsAt: instant,
    actorIds: z.tuple([]),
    venueId: id,
    zoneId: id,
    facts: z.array(z.string()),
  })
  .strict();
const worldInput = z
  .object({
    version: z.literal(2),
    grant: worldGrant,
    dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/u),
    catchupBatchId: id.optional(),
    context: z
      .object({ catchup: z.literal(true) })
      .strict()
      .optional(),
    opportunity: opportunity.optional(),
    captureRevision: digest.optional(),
    returnUntil: instant.optional(),
  })
  .strict();

export function readWorldNarrativeInput(raw: unknown, seed: string) {
  const input = worldInput.parse(raw);
  const { grant, catchupBatchId } = input;
  const room = grant.targets[0];
  const related = [input.context, input.opportunity, input.captureRevision, input.returnUntil];
  memoryRequire(
    grant.seed === seed &&
      grant.id === grant.sourceId &&
      typeof grant.reviewBasis === "string" &&
      grant.moment.instant === grant.at &&
      grant.at >= grant.adoptedAt &&
      Buffer.byteLength(JSON.stringify([room.room, room.protections]), "utf8") <= 32000 &&
      new Set(room.room.map((row) => row.id)).size === room.room.length &&
      new Set(room.protections.map((row) => row.id)).size === room.protections.length &&
      (room.roomWritable || !room.protections.length) &&
      (catchupBatchId ? related.every(Boolean) : related.every((value) => value === undefined)) &&
      (!input.opportunity ||
        (input.opportunity.startsAt === grant.at &&
          input.opportunity.endsAt === grant.at &&
          input.opportunity.venueId === room.venueId &&
          input.opportunity.zoneId === room.zoneId &&
          grant.at <= input.returnUntil!)),
    "invalid World development capture",
  );
  readNarrativeState({
    version: 1,
    adoptedAt: grant.adoptedAt,
    revision: 0,
    weatherRevision: grant.weatherRevision,
    weather: grant.weather,
    conditions: grant.conditions,
    situations: grant.situations,
    receipts: [],
  });
  // A saved claim fingerprints the original admission bytes.
  return structuredClone(raw) as typeof input & { grant: NarrativeAdmission };
}
