import { placeRegistry, readNpc, findLocation } from "./places.js";
import { LETTER_FONTS } from "../../../shared/helpers/letter-fonts.js";
import type { RepairField, RepairRecord, RepairRequest } from "../../../shared/contracts/repair.js";
import type { ContinuityRecord, ContinuityHolder, ContinuityEvidence } from "../models/continuity-model.js";
import type { VillageState } from "../models/world.js";
import { badRequest, conflict } from "./errors.js";
import { memoryHash, memoryRequire, memoryString, memoryTimestamp } from "./memory-integrity.js";
import { continuityRepairEntries, changeContinuityMemory } from "./continuity-library.js";
import { continuityActor } from "./continuity-actors.js";
import { continuityHolderKey, protectContinuity } from "./continuity.js";
import { completeAgendaWeek, workingAgendaWeek } from "./agenda-week.js";
import { routineProfileFromWeek } from "./owned-routine.js";
import { VILLAGE_WEEKDAYS } from "./village-clock.js";
import { keepAgendaPlaces } from "./resident-agenda.js";
import { assertResidencePrivateDestination } from "./venue-layout.js";
import { hasVenueClass, venueCapacity, venueResidentIds } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { normalizeVillageMutation } from "./world-mutation.js";
import { retainNativeFact } from "./native-continuity.js";

export function retainAdministrativeCircumstance(
  state: VillageState,
  situationId: string,
  operationId: string,
  at: string,
) {
  const situation = state.narrative?.situations.find((row) => row.id === situationId);
  memoryRequire(situation, "administrative circumstance is missing");
  const receiptId = "repair-circumstance-" + memoryHash([operationId, situation.id, situation.revision]);
  const fields = new Map<string, string>([
    ["summary", situation.summary],
    ["title", situation.title],
  ]);
  for (const condition of state.narrative!.conditions.filter((row) => row.situationId === situationId))
    for (const field of ["observation", "remedy"] as const)
      if (condition[field]) fields.set(condition.id + ":" + field, condition[field]);
  const ancestry = new Map<string, ContinuityEvidence>();
  for (const episode of state.episodes.records.toReversed())
    for (const receipt of episode.commandReceipts.toReversed()) {
      if (
        !fields.size ||
        receipt.id === receiptId ||
        receipt.kind !== "circumstance" ||
        receipt.targetId !== situationId
      )
        continue;
      const prior = receipt.circumstance ? JSON.parse(receipt.text) : { situation: { summary: receipt.text } },
        supplied = new Map<string, string>([
          ["summary", prior.situation?.summary],
          ["title", prior.situation?.title],
        ]);
      for (const condition of prior.conditions ?? [])
        for (const field of ["observation", "remedy"] as const)
          if (typeof condition[field] === "string") supplied.set(condition.id + ":" + field, condition[field]);
      const inherited = [...fields].filter(([key, value]) => supplied.get(key) === value);
      if (!inherited.length) continue;
      const source = episode.grounding.find(
        (source) => source.kind === "native" && source.committedReceiptId === receipt.id,
      );
      memoryRequire(source, "administrative circumstance lost its inherited source");
      ancestry.set(source.id, source);
      for (const [key] of inherited) fields.delete(key);
    }
  retainNativeFact(
    state,
    {
      id: receiptId,
      kind: "circumstance",
      targetId: situation.id,
      revision: situation.revision,
      text: JSON.stringify({
        at,
        situation: { title: situation.title, summary: situation.summary, status: situation.status },
        conditions: state
          .narrative!.conditions.filter((row) => row.situationId === situationId)
          .map((row) => ({
            id: row.id,
            revision: row.revision,
            observation: row.observation,
            restriction: row.restriction,
            remedy: row.remedy,
            endsAt: row.endsAt,
            clear: row.clearedAt !== null,
          })),
      }),
      circumstance: { summary: situation.summary, status: situation.status },
      witnesses: [],
      observedBy: [],
    },
    at,
    { ancestry: [...ancestry.values()] },
  );
}

export const repairId = (...parts: string[]) => JSON.stringify(parts);
export const repairParts = (id: string): string[] => {
  try {
    const parts: unknown = JSON.parse(id);
    if (Array.isArray(parts) && parts.every((p) => typeof p === "string")) return parts;
  } catch {
    /* Invalid identity. */
  }
  throw badRequest("Choose a record from REPAIR.");
};
const text = (key: string, label: string, value: string): RepairField => ({ key, label, value, type: "text" });
const choices = (
  key: string,
  label: string,
  value: string,
  options: { value: string; label: string }[],
): RepairField => ({ key, label, value, type: "choice", options });
const actions = [{ id: "correct", label: "Modify" }];
export function worldRepairRecords(
  state: VillageState,
  includeMemories = true,
  personId?: string,
  at = state.simulatedThrough || state.foundedAt || state.setupAt,
): RepairRecord[] {
  const records: RepairRecord[] = [];
  const add = (
    parts: string[],
    topic: RepairRecord["topic"],
    title: string,
    summary: string,
    fields: RepairField[],
    extra: Partial<RepairRecord> = {},
  ) =>
    records.push({
      id: repairId(...parts),
      topic,
      title,
      summary,
      fields,
      source: [summary],
      actions,
      related: [],
      ...extra,
    });
  add(["world"], "world", "Village setting", state.name, [
    text("name", "Village name", state.name),
    text("setting", "Place description", state.setting),
    text("worldName", "World name", state.worldName),
    text("worldRules", "Standing rules", state.worldRules),
  ]);
  for (const situation of state.narrative?.situations ?? [])
    add(
      ["narrative-situation", situation.id],
      "world",
      situation.title,
      `${situation.scope === "village" ? "Village-wide" : "Zone-local"}: ${situation.summary}`,
      [
        text("title", "Title", situation.title),
        text("summary", "Current circumstances", situation.summary),
        choices("status", "Status", situation.status, [
          { value: "active", label: "Active" },
          { value: "resolved", label: "Resolved" },
        ]),
      ],
      { revision: situation.revision },
    );
  for (const condition of state.narrative?.conditions ?? []) {
    add(
      ["narrative-condition", condition.id],
      "world",
      condition.observation,
      condition.clearedAt ? "Cleared" : condition.restriction,
      [
        text("observation", "Observable circumstances", condition.observation),
        text("remedy", "Corrective work", condition.remedy),
        text("endsAt", "End time", condition.endsAt ?? ""),
        choices("cleared", "Condition", condition.clearedAt ? "yes" : "no", [
          { value: "no", label: "Active" },
          { value: "yes", label: "Cleared" },
        ]),
      ],
      {
        revision: condition.revision,
        source: ["Situation: " + condition.situationId, "Zone: " + condition.zoneId],
      },
    );
  }
  if (state.narrative?.weather) {
    const weather = state.narrative.weather;
    add(
      ["narrative-weather", weather.id],
      "world",
      "Weather override",
      weather.description,
      [text("description", "Weather", weather.description), text("endsAt", "End time", weather.endsAt)],
      { revision: weather.revision, source: ["Source: " + weather.sourceId, "Start: " + weather.startsAt] },
    );
  }
  for (const claim of state.narrative?.claims ?? [])
    add(
      ["narrative-claim", claim.id],
      "world",
      claim.sceneId ? "Held Scene introduction" : "Held world proposal",
      claim.zoneId,
      [],
      {
        actions: [{ id: "reject", label: "Reject saved proposal" }],
        source: [
          "Source: " + claim.id,
          "Purchased request: " + claim.attemptId,
          "Rejection retains request evidence and consumed allowance.",
        ],
      },
    );
  for (const npc of Object.values(placeRegistry(state)?.npcs ?? {}))
    add(
      ["npc", npc.id],
      "people",
      npc.label || npc.name,
      "Supporting character",
      [
        text("name", "Name", npc.name),
        text("label", "Display label", npc.label),
        text("characterization", "Characterization", npc.characterization),
        text("facts", "Established facts (one per line)", npc.facts.join("\n")),
        text("availability", "Availability", npc.availability),
        { key: "disabled", label: "Disabled", type: "boolean", value: npc.disabled },
      ],
      { revision: npc.revision, source: [npc.source, ...npc.associations.map((row) => row.placeId + ": " + row.role)] },
    );
  for (const place of Object.values(placeRegistry(state)?.places ?? {}))
    add(
      ["place", place.id],
      "places",
      place.location.name,
      "Place",
      [
        text("name", "Name", place.location.name),
        text("description", "Description", place.location.description),
        { key: "disabled", label: "Disabled", type: "boolean", value: place.disabled },
        { key: "report", label: "Reported, unverified", type: "boolean", value: place.report },
      ],
      { revision: place.revision, source: [place.source] },
    );
  const people = [
    { id: "player", name: "Your Persona" },
    ...state.villagers.map((v) => ({ id: v.characterId, name: v.cardSnapshot.name })),
    ...Object.values(placeRegistry(state)?.npcs ?? {}).map((npc) => ({ id: npc.id, name: npc.label || npc.name })),
  ];
  if (includeMemories) {
    const grouped = new Map<string, ReturnType<typeof continuityRepairEntries>>();
    for (const row of continuityRepairEntries(state, at)) {
      const rows = grouped.get(row.record.id) ?? [];
      rows.push(row);
      grouped.set(row.record.id, rows);
    }
    for (const rows of grouped.values()) {
      const focused = rows.find((row) => row.holder.id === personId),
        row = focused ?? rows[0];
      if (personId && !focused && !row.entry.subjects.some((subject) => subject.id === personId)) continue;
      add(
        ["memory", row.record.id],
        "memories",
        row.entry.text,
        row.entry.kind + " · " + new Date(row.entry.occurredAt).toLocaleDateString("en-US"),
        [text("text", "Text", row.entry.text)],
        {
          source: [...new Set(rows.flatMap((value) => value.version.sources.map((source) => source.excerpt)))],
          actions: [...actions, { id: "forget", label: "Forget" }],
          people: rows.map((value) => ({ ...value.person, text: value.entry.text, forgotten: value.entry.forgotten })),
          revision: row.record.revision,
          target: {
            id: row.record.id,
            recordRevision: row.record.revision,
            heads: Object.fromEntries(rows.map((value) => [continuityHolderKey(value.holder), value.head.revision])),
          },
          subjects: row.entry.subjects.map((subject) => subject.id),
        },
      );
    }
  }
  for (const person of state.villagers) {
    const id = person.characterId,
      name = person.cardSnapshot.name;
    const homeOptions = state.venues
      .filter((v) => hasVenueClass(v, "residence") && v.constructionStatus !== "worksite")
      .flatMap((v) =>
        venueZones(v)
          .filter((z) => z.kind === "private-residence" && (!z.ownerId || z.ownerId === id))
          .map((z) => ({ value: repairId(v.id, z.id), label: `${v.name} · ${z.name}` })),
      );
    const home = state.venues.find((v) => venueResidentIds(v).includes(id)),
      sleep = home?.destinations?.[id]?.sleep ?? (home && venueZones(home).find((z) => z.ownerId === id)?.id);
    if (homeOptions.length)
      add(
        ["home", id],
        "places",
        `${name} · home assignment`,
        "Residence and sleep destination",
        [
          choices("destination", "Home", home && sleep ? repairId(home.id, sleep) : "", [
            { value: "", label: "Unassigned" },
            ...homeOptions,
          ]),
        ],
        {
          source: ["Repairs ownership and the sleep destination. Objects stay in their recorded Zones."],
        },
      );
    add(
      ["person", id],
      "people",
      `${name} · character context`,
      "Village-owned character copy",
      [
        text("homeworld", "Homeworld", person.admission.homeworld),
        text("startingSituation", "Starting situation", person.admission.startingSituation),
        ...(["personality", "backstory", "scenario", "appearance", "postHistoryInstructions"] as const).map((key) =>
          text(
            key,
            {
              personality: "Personality",
              backstory: "Backstory",
              scenario: "Card scenario",
              appearance: "Appearance",
              postHistoryInstructions: "Writing instructions",
            }[key],
            person.cardSnapshot[key] ?? "",
          ),
        ),
      ],
      {
        source: ["Captured character and admission context. The original library card stays separate."],
      },
    );
    const fontId = person.letterFontId;
    add(
      ["letter-font", id],
      "people",
      `${name} · letter style`,
      "Applies to existing and future letters",
      [
        choices("letterFontId", "Letter style", fontId, [
          ...(!LETTER_FONTS.some((font) => font.id === fontId) ? [{ value: fontId, label: "Unavailable style" }] : []),
          ...[...LETTER_FONTS]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((font) => ({ value: font.id, label: font.name })),
        ]),
      ],
      { source: [] },
    );
    if (person.agenda) {
      add(["routine", id], "people", `${name} · routine`, "Future routine plans", [
        text("routineSummary", "Routine", person.agenda.routineSummary),
        ...person.agenda.day.flatMap((block, i) => [
          {
            key: `start:${i}`,
            label: `Block ${i + 1} start minute`,
            value: block.startMinute,
            type: "number" as const,
            min: 0,
            max: 1439,
          },
          {
            key: `end:${i}`,
            label: `Block ${i + 1} end minute`,
            value: block.endMinute,
            type: "number" as const,
            min: 1,
            max: 1440,
          },
          text(`activity:${i}`, `Block ${i + 1} activity`, block.activity),
        ]),
      ]);
    }
  }
  for (const root of state.continuity.records)
    for (const head of Object.values(root.heads)) {
      if (head.holder.kind !== "room" || !head.current) continue;
      const holder = head.holder,
        venue = findLocation(state, holder.placeId),
        zone = venue && venueZones(venue).find((row) => row.id === holder.zoneId);
      if (!zone) continue;
      const version = state.continuity.versions.find((row) => row.id === head.versionId)!,
        key = continuityHolderKey(holder);
      add(
        ["room", root.id],
        "places",
        venue!.name + " · " + zone.name,
        "Room description",
        [text("text", "Text", version.text)],
        {
          revision: root.revision,
          target: { id: root.id, recordRevision: root.revision, heads: { [key]: head.revision } },
          source: version.sources.map((source) => source.excerpt),
        },
      );
    }
  for (const venue of state.venues) {
    add(["venue", venue.id], "places", venue.name, "Venue identity and map placement", [
      text("name", "Name", venue.name),
      text("form", "Physical form", venue.form ?? ""),
      ...(["x", "y"] as const)
        .filter((key) => venue.presentation[key] !== null)
        .map((key) => ({
          key,
          label: `Map ${key}`,
          type: "number" as const,
          value: venue.presentation[key]!,
          min: 0.03,
          max: 0.97,
        })),
    ]);
    for (const zone of venueZones(venue)) {
      if (zone.access) {
        add(
          ["access", venue.id, zone.id],
          "places",
          `${venue.name} · ${zone.name} access`,
          "Entry policy and controllers",
          [
            choices("mode", "Entry", zone.access.mode, [
              { value: "public", label: "Public" },
              { value: "permission-required", label: "Permission required" },
            ]),
            choices("inheritManagers", "Management", zone.access.managerIds === null ? "inherit" : "custom", [
              { value: "inherit", label: "Venue managers" },
              { value: "custom", label: "Selected managers" },
            ]),
            ...people.flatMap((p) => [
              {
                key: `manager:${p.id}`,
                label: `${p.name} · manager`,
                value: (zone.access!.managerIds ?? []).includes(p.id),
                type: "boolean" as const,
              },
              {
                key: `member:${p.id}`,
                label: `${p.name} · member`,
                value: zone.access!.memberIds.includes(p.id),
                type: "boolean" as const,
              },
            ]),
          ],
        );
        for (const person of people)
          if (venue.access)
            add(
              ["permission", venue.id, zone.id, person.id],
              "places",
              `${venue.name} · ${zone.name} · ${person.name}`,
              "Standing access and Zone ban",
              [
                {
                  key: "standing",
                  label: "Standing entry permission",
                  value: venue.access.permissions.some(
                    (p) => p.zoneId === zone.id && p.visitorId === person.id && p.duration === "standing" && !p.revoked,
                  ),
                  type: "boolean",
                },
                {
                  key: "banned",
                  label: "Banned from this Zone",
                  value: venue.access.bans.some((b) => b.zoneId === zone.id && b.visitorId === person.id && b.active),
                  type: "boolean",
                },
              ],
              {
                source: ["Administrative access repair. Existing Venue-wide bans and opening hours remain separate."],
              },
            );
      }
    }
  }
  for (const project of state.projects)
    add(
      ["project", project.id],
      "progress",
      project.title,
      `Project · ${project.status}`,
      [text("title", "Title", project.title)],
      {
        revision: project.lifecycle.revision,
        source: [
          `Status: ${project.status}`,
          `Agreements: ${project.lifecycle.approvals.map((a) => people.find((p) => p.id === a.residentId)?.name ?? "Former resident").join(", ") || "None"}`,
        ],
        actions: [
          ...actions,
          ...(project.status === "paused" ? [{ id: "resume", label: "Resume Project" }] : []),
          ...(!["complete", "cancelled"].includes(project.status) ? [{ id: "cancel", label: "Cancel Project" }] : []),
        ],
      },
    );
  const visibleIds = new Set(records.map((r) => r.id));
  return records.map((record) => ({ ...record, related: record.related.filter((link) => visibleIds.has(link.id)) }));
}

function inputValues(record: RepairRecord, request: RepairRequest) {
  const result: Record<string, string | number | boolean> = {};
  for (const field of record.fields) {
    const value = request.values[field.key] ?? field.value;
    if (field.type === "number") {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        (field.min !== undefined && value < field.min) ||
        (field.max !== undefined && value > field.max)
      )
        throw badRequest(`Check ${field.label}.`);
    } else if (typeof value !== typeof field.value) throw badRequest(`Check ${field.label}.`);
    if (typeof value === "string" && value.length > 16000 && value !== field.value)
      throw badRequest(`Shorten ${field.label}.`);
    if (field.options && !field.options.some((option) => option.value === value))
      throw badRequest(`Choose ${field.label}.`);
    result[field.key] = value;
  }
  if (Object.keys(request.values).some((key) => !record.fields.some((f) => f.key === key)))
    throw badRequest("This repair contains an unknown field.");
  return result;
}
export function applyWorldRepair(state: VillageState, record: RepairRecord, request: RepairRequest, at: string) {
  if (!record.actions.some((a) => a.id === request.action)) throw badRequest("Choose an available repair action.");
  const values = inputValues(record, request),
    [kind, id, sub, actor] = repairParts(record.id);
  const str = (key: string) => String(values[key] ?? "");
  if (kind === "npc" || kind === "place") {
    if (kind === "npc") {
      const npc = state.worldPlaces.npcs[id];
      if (!npc) throw conflict("This supporting character changed.");
      state.worldPlaces.npcs[id] = readNpc({
        ...npc,
        name: str("name"),
        label: str("label"),
        characterization: str("characterization"),
        facts: str("facts")
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        availability: str("availability"),
        disabled: values.disabled === true,
        revision: npc.revision + 1,
        updatedAt: at,
      });
    } else {
      const place = state.worldPlaces.places[id];
      if (!place || !str("name") || str("name").length > 100 || str("description").length > 1000)
        throw badRequest("Shorten the Place details.");
      place.location.name = str("name");
      place.location.description = str("description");
      place.location.zones!.find((zone) => zone.kind === "exterior")!.description = str("description");
      place.disabled = values.disabled === true;
      place.report = values.report === true;
      place.revision++;
    }
    state.worldPlaces.revision++;
    normalizeVillageMutation(state, () => {});
    return;
  }
  if (kind === "narrative-claim") {
    const narrative = state.narrative,
      claim = narrative?.claims?.find((row) => row.id === id);
    if (!narrative || !claim || request.action !== "reject") throw conflict("The world proposal changed.");
    narrative.claims = narrative.claims?.filter((row) => row.id !== id);
    narrative.receipts.push({
      id,
      at,
      sourceId: id,
      source: claim.sceneId ? "scene" : "world",
      occurrence: "Saved proposal explicitly rejected in REPAIR.",
      rejected: true,
      after: { situations: [], conditions: [] },
      physical: [],
    });
    narrative.revision++;
    return;
  }
  if (kind.startsWith("narrative-")) {
    const narrative = state.narrative;
    if (!narrative) throw conflict("Environmental state changed.");
    if (kind === "narrative-situation") {
      const row = narrative.situations.find((item) => item.id === id)!;
      if (!str("title") || str("title").length > 160 || !str("summary") || str("summary").length > 1200)
        throw badRequest("Shorten the situation text.");
      row.title = str("title");
      row.summary = str("summary");
      if (!["active", "resolved"].includes(str("status")))
        throw badRequest("Choose an active or resolved circumstance.");
      row.status = str("status") as "active" | "resolved";
      row.updatedAt = at;
      row.revision++;
    } else if (kind === "narrative-condition") {
      const row = narrative.conditions.find((item) => item.id === id)!;
      if (
        !str("observation") ||
        str("observation").length > 600 ||
        str("remedy").length > 600 ||
        (str("endsAt") &&
          (!Number.isFinite(Date.parse(str("endsAt"))) ||
            new Date(str("endsAt")).toISOString() !== str("endsAt") ||
            str("endsAt") <= row.startsAt))
      )
        throw badRequest("Check the condition and its end time.");
      row.observation = str("observation");
      row.remedy = str("remedy");
      row.endsAt = str("endsAt") || null;
      row.clearedAt = str("cleared") === "yes" ? at : null;
      row.revision++;
    } else if (kind === "narrative-weather") {
      const weather = narrative.weather;
      if (
        !weather ||
        weather.id !== id ||
        !str("description") ||
        str("description").length > 600 ||
        !Number.isFinite(Date.parse(str("endsAt"))) ||
        new Date(str("endsAt")).toISOString() !== str("endsAt") ||
        str("endsAt") <= weather.startsAt
      )
        throw badRequest("Check the weather and its end time.");
      weather.description = str("description");
      weather.endsAt = str("endsAt");
      weather.revision = ++narrative.weatherRevision;
    }
    narrative.revision++;
    const situationId =
      kind === "narrative-situation" ? id : narrative.conditions.find((row) => row.id === id)?.situationId;
    if (situationId) retainAdministrativeCircumstance(state, situationId, request.operationId, at);
    return;
  }
  if (kind === "room") {
    const root = state.continuity.records.find((row) => row.id === id);
    const holders = Object.values(root?.heads ?? {})
      .filter(
        (head) =>
          head.holder.kind === "room" &&
          record.target &&
          Object.hasOwn(record.target.heads, continuityHolderKey(head.holder)),
      )
      .map((head) => head.holder);
    memoryRequire(record.target && holders.length === 1, "room repair target changed");
    state.continuity = protectContinuity(state.continuity, record.target, holders, request.operationId, at, {
      text: str("text"),
    });
    return;
  }
  if (kind === "memory") {
    if (
      !record.target ||
      !request.knowers.length ||
      request.knowers.some((id) => !record.people?.some((person) => person.id === id))
    )
      throw badRequest("Choose existing continuity holders.");
    state.continuity = changeContinuityMemory(
      state,
      id,
      {
        operationId: request.operationId,
        seed: state.seed,
        target: record.target,
        knowers: request.knowers,
        ...(request.action === "correct" ? { text: str("text") } : {}),
      },
      request.action === "forget" ? "forget" : "repair",
      at,
    );
    return;
  }
  normalizeVillageMutation(
    state,
    () => {
      if (kind === "world") {
        if (!str("name") || str("name").length > 120 || str("setting").length > 4096 || str("worldName").length > 120)
          throw badRequest("Shorten the Village name or description.");
        state.name = str("name");
        state.setting = str("setting");
        state.worldName = str("worldName");
        if (str("worldRules").length > 4096) throw badRequest("Shorten the standing rules.");
        state.worldRules = str("worldRules");
      } else if (kind === "home") {
        if (!str("destination")) throw badRequest("Choose a residential Private Space.");
        const [venueId, zoneId] = repairParts(str("destination")),
          destination = state.venues.find((v) => v.id === venueId);
        if (!destination || !hasVenueClass(destination, "residence") || destination.constructionStatus === "worksite")
          throw conflict("That home is unavailable.");
        if (
          !venueResidentIds(destination).includes(id) &&
          venueResidentIds(destination).length + Number(destination.occupancy.playerHome) >= venueCapacity(destination)
        )
          throw conflict("That home is full.");
        assertResidencePrivateDestination(state, destination, id, zoneId);
        for (const venue of state.venues) {
          venue.residentIds = venueResidentIds(venue).filter((p) => p !== id);
          venue.occupancy.residentCharacterId = venue.residentIds[0] ?? null;
          venue.zones ??= venueZones(venue);
          venue.layoutVersion = 1;
          for (const zone of venue.zones) if (zone.ownerId === id) zone.ownerId = undefined;
          if (venue.destinations) delete venue.destinations[id];
        }
        destination.residentIds!.push(id);
        destination.occupancy.residentCharacterId = destination.residentIds![0];
        destination.zones!.find((z) => z.id === zoneId)!.ownerId = id;
        destination.destinations ??= {};
        destination.destinations[id] = { home: zoneId, sleep: zoneId };
        const residence = state.residences.find((r) => r.characterId === id);
        if (residence)
          Object.assign(residence, {
            venueId,
            status: "current",
            proposedVenueId: "",
            proposedPrivateZoneId: "",
            completesAt: "",
          });
        else
          state.residences.push({ characterId: id, venueId, status: "current", proposedVenueId: "", requestedAt: at });
        keepAgendaPlaces(state);
      } else if (kind === "person") {
        const p = state.villagers.find((v) => v.characterId === id)!;
        if (str("homeworld").length > 120 || str("startingSituation").length > 1200)
          throw badRequest("Shorten the admission context.");
        p.admission = { homeworld: str("homeworld"), startingSituation: str("startingSituation") };
        for (const key of ["personality", "backstory", "scenario", "appearance", "postHistoryInstructions"] as const)
          p.cardSnapshot[key] = str(key);
        p.cardSnapshot.revision++;
      } else if (kind === "letter-font") {
        const person = state.villagers.find((v) => v.characterId === id);
        if (!person) throw conflict("That villager is unavailable.");
        person.letterFontId = str("letterFontId");
      } else if (kind === "routine") {
        const agenda = state.villagers.find((v) => v.characterId === id)!.agenda!;
        agenda.routineSummary = str("routineSummary");
        agenda.day.forEach((b, i) => {
          b.startMinute = Number(values[`start:${i}`]);
          b.endMinute = Number(values[`end:${i}`]);
          b.activity = str(`activity:${i}`);
          if (!Number.isInteger(b.startMinute) || !Number.isInteger(b.endMinute) || b.endMinute <= b.startMinute)
            throw badRequest("Routine blocks need a valid start and end.");
        });
        const sorted = [...agenda.day].sort((a, b) => a.startMinute - b.startMinute);
        if (sorted.some((b, i) => i > 0 && b.startMinute < sorted[i - 1].endMinute))
          throw badRequest("Routine blocks cannot overlap.");
        agenda.week = completeAgendaWeek(
          Object.fromEntries(VILLAGE_WEEKDAYS.map((weekday) => [weekday, sorted])),
          workingAgendaWeek(),
        );
        agenda.routineProfile = routineProfileFromWeek(agenda.week);
        agenda.plannedDays = {};
        agenda.personalizationPending = false;
      } else if (kind === "venue") {
        const v = state.venues.find((v) => v.id === id)!;
        if (!str("name") || str("name").length > 100 || str("form").length > 240)
          throw badRequest("Shorten the Venue details.");
        v.name = str("name");
        v.form = str("form");
        if (Object.hasOwn(values, "x")) v.presentation.x = Number(values.x);
        if (Object.hasOwn(values, "y")) v.presentation.y = Number(values.y);
      } else if (kind === "access" || kind === "permission") {
        const v = state.venues.find((v) => v.id === id)!;
        v.zones ??= venueZones(v);
        v.layoutVersion = 1;
        const z = v.zones.find((z) => z.id === sub)!;
        if (kind === "access") {
          const ids = ["player", ...state.villagers.map((p) => p.characterId)],
            managers = ids.filter((p) => values[`manager:${p}`] === true),
            members = ids.filter((p) => values[`member:${p}`] === true);
          z.access!.mode = str("mode") as "public" | "permission-required";
          z.access!.managerIds = str("inheritManagers") === "inherit" ? null : managers;
          z.access!.memberIds = members;
        } else {
          const ledger = v.access;
          if (!ledger) throw conflict("This Venue has no access ledger.");
          const grants = ledger.permissions.filter(
            (p) => p.zoneId === sub && p.visitorId === actor && p.duration === "standing" && !p.revoked,
          );
          if (values.standing === false) for (const permission of grants) permission.revoked = true;
          else if (!grants.length)
            ledger.permissions.push({
              id: "repair:" + request.operationId,
              zoneId: sub,
              visitorId: actor,
              issuerId: "system",
              duration: "standing",
              sceneId: null,
              accompaniedBy: null,
              outsideHours: false,
              revoked: false,
              issuedAt: at,
              sourceLineIds: [],
            });
          const bans = ledger.bans.filter((b) => b.zoneId === sub && b.visitorId === actor && b.active);
          if (values.banned === false) for (const ban of bans) ban.active = false;
          else if (!bans.length)
            ledger.bans.push({
              id: "repair-ban:" + request.operationId,
              zoneId: sub,
              visitorId: actor,
              issuerId: "system",
              active: true,
              issuedAt: at,
              sourceLineIds: [],
            });
        }
      } else if (kind === "project") {
        const project = state.projects.find((p) => p.id === id)!;
        if (!str("title") || str("title").length > 160) throw badRequest("Enter a short Project title.");
        project.title = str("title");
        project.lifecycle.revision++;
        project.updatedAt = at;
      } else throw badRequest("This record uses a separate repair command.");
    },
    { now: () => new Date(at), seed: () => request.operationId },
  );
}

/** Explicit administrative undo restores only selected existing holders, retaining every immutable version and receipt. */
export function restoreContinuityProtection(
  state: VillageState,
  prior: ContinuityRecord,
  holders: ContinuityHolder[],
  expected: string,
  operationId: string,
  at: string,
) {
  memoryString(operationId, 160);
  memoryTimestamp(at);
  memoryRequire(!operationId.startsWith("narration-abandoned:"), "reserved narration receipt namespace");
  const fingerprint = memoryHash(["restore-protection", prior, holders, expected]),
    receipt = state.continuity.receipts[operationId];
  if (receipt) {
    memoryRequire(receipt.fingerprint === fingerprint, "administrative undo identity reused");
    return;
  }
  const current = state.continuity.records.find((row) => row.id === prior.id);
  memoryRequire(current && memoryHash(current) === expected, "continuity changed after the repair");
  memoryRequire(
    holders.length > 0 && new Set(holders.map(continuityHolderKey)).size === holders.length,
    "choose existing continuity holders",
  );
  let collection = state.continuity;
  const versions: string[] = [];
  for (const holder of holders) {
    const key = continuityHolderKey(holder),
      head = prior.heads[key];
    if (holder.kind === "actor")
      memoryRequire(continuityActor(state, holder.id)?.incarnation === holder.incarnation, "continuity holder changed");
    else {
      const place = findLocation(state, holder.placeId);
      memoryRequire(place && venueZones(place).some((zone) => zone.id === holder.zoneId), "room holder changed");
    }
    memoryRequire(key && head && current.heads[key], "continuity holder changed");
    const original = collection.versions.find(
      (version) => version.id === head.versionId && version.rootId === prior.id,
    );
    memoryRequire(original, "administrative undo lost its prior meaning");
    const target = collection.records.find((row) => row.id === prior.id)!;
    const childId = operationId + ":" + memoryHash(key).slice(0, 32);
    collection = protectContinuity(
      collection,
      {
        id: prior.id,
        recordRevision: target.revision,
        heads: { [key]: target.heads[key].revision },
      },
      [holder],
      childId,
      at,
      prior.protection[key]?.forgotten ? { forget: true } : { text: original.text, restore: original.id },
    );
    versions.push(...collection.receipts[childId].versions);
  }
  state.continuity = {
    ...collection,
    receipts: { ...collection.receipts, [operationId]: { fingerprint, roots: [prior.id], versions } },
  };
}
