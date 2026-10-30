import type { NarrativeState } from "../models/narrative-model.js";
import { badGateway } from "../rules/errors.js";
import { readPlaceContinuity, readPlaceDescription } from "../rules/zone-continuity.js";

/** Saved authority fails closed; absence of the additive feature remains compatible. */
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
    string(r.summary);
    if (!["active", "resolved"].includes(r.status)) fail();
    time(r.updatedAt);
    array(r.targets).forEach(target);
  };
  const condition = (v: unknown) => {
    const r = obj(v);
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
    if (r.physicalRevision !== undefined) number(r.physicalRevision);
  };
  const weather = (v: unknown) => {
    if (v === null) return;
    const r = obj(v);
    string(r.id, 600);
    number(r.revision);
    string(r.sourceId, 600);
    string(r.description, 600);
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
    }
  time(r.adoptedAt);
  number(r.revision);
  number(r.weatherRevision);
  weather(r.weather);
  array(r.situations).forEach(situation);
  array(r.conditions).forEach(condition);
  for (const receipt of array(r.receipts)) {
    const p = obj(receipt);
    string(p.id, 600);
    string(p.sourceId, 600);
    time(p.at);
    string(p.occurrence);
    if (p.rejected !== undefined && typeof p.rejected !== "boolean") fail();
    if (!["world", "scene", "action"].includes(p.source)) fail();
    const after = obj(p.after);
    array(after.situations).forEach(situation);
    array(after.conditions).forEach(condition);
    if (after.weatherRevision !== undefined) {
      number(after.weatherRevision);
      weather(after.weather);
    }
    for (const physical of array(p.physical)) {
      target(physical);
      readPlaceDescription(physical.description);
      readPlaceContinuity(physical.state);
      if (typeof physical.appearanceChanged !== "boolean") fail();
    }
  }
  for (const rows of [r.situations, r.conditions, r.receipts])
    if (new Set(rows.map((row: { id: string }) => row.id)).size !== rows.length) fail();
  return structuredClone(value) as NarrativeState;
}
