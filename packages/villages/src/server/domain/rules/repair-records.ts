import { LETTER_FONTS } from "../../../shared/helpers/letter-fonts.js";
import {
  MAX_PLACE_DESCRIPTION,
  MAX_RECENT_PLACE_CONTEXT,
  RECENT_PLACE_DURATION,
} from "../../../shared/helpers/place-continuity.js";
import { legacyLetterFont } from "../../../shared/helpers/letter-font-selection.js";
import type { RepairField, RepairRecord, RepairRequest } from "../../../shared/contracts/repair.js";
import type { MemoryKnower } from "../models/memories.js";
import type { VillageState } from "../models/world.js";
import { badRequest, conflict } from "./errors.js";
import { memoryHash, validateMemoryRecord } from "./memory-integrity.js";
import { inspectMemoryCandidates, retainMemoryScenes } from "./memory-views.js";
import { keepAgendaPlaces } from "./resident-agenda.js";
import { readSocialWish } from "./social-wishes.js";
import { assertResidencePrivateDestination } from "./venue-layout.js";
import { hasVenueClass, venueCapacity, venueResidentIds } from "./venue-model.js";
import { venueZones } from "./venue-zones.js";
import { correctVillageMemory, forgetVillageMemory } from "./village-memories.js";
import { normalizeVillageMutation } from "./world-mutation.js";

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
export function worldRepairRecords(state: VillageState, includeMemories = true, personId?: string): RepairRecord[] {
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
    text("worldFacts", "Current world facts", state.worldFacts.join("\n")),
  ]);
  add(["founding"], "world", "Founding history", "Shared starting context", [
    text("foundingDetails", "Starting history", state.scenarioImprint?.origin ?? state.foundingDetails),
    text("foundingGuidance", "Starting guidance", state.foundingGuidance),
  ]);
  for (const situation of state.narrative?.situations ?? [])
    add(
      ["narrative-situation", situation.id],
      "world",
      situation.title,
      situation.summary,
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
    const zone = state.venues
      .find((row) => row.id === condition.venueId)
      ?.zones?.find((row) => row.id === condition.zoneId);
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
        ...(zone ? [text("description", "Physical description", zone.description)] : []),
      ],
      {
        revision: condition.revision,
        source: [
          "Situation: " + condition.situationId,
          "Zone: " + condition.zoneId,
          "Physical and condition values are published together.",
        ],
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
  const people = [
    { id: "player", name: "Your Persona" },
    ...state.villagers.map((v) => ({ id: v.characterId, name: v.cardSnapshot.name })),
  ];
  if (includeMemories) {
    for (const id of new Set(state.memories.records.flatMap((r) => Object.keys(r.knowers))))
      if (!people.some((p) => p.id === id)) people.push({ id, name: "Former resident" });
    const storedById = new Map(state.memories.records.map((r) => [r.id, r]));
    const projected = new Map(people.map((p) => [p.id, inspectMemoryCandidates(state.memories, p.id)]));
    const effective = new Map([...projected].map(([id, rows]) => [id, new Map(rows.map((row) => [row.rootId, row]))]));
    const memories = [...(personId ? (projected.get(personId) ?? []) : []), ...[...projected.values()].flat()];
    const seen = new Set<string>();
    for (const candidate of memories) {
      if (seen.has(candidate.rootId)) continue;
      const root = storedById.get(candidate.rootId)!;
      const focused = personId ? effective.get(personId)?.get(root.id) : undefined;
      const row = focused ?? candidate;
      if (personId && !focused && !row.subjects.includes(personId)) continue;
      seen.add(root.id);
      const knowers = Object.keys(root.knowers).filter((id) => effective.get(id)?.has(root.id));
      add(
        ["memory", root.id],
        "memories",
        row.text,
        `${row.kind} · ${new Date(row.occurredAt).toLocaleDateString("en-US")}`,
        [text("text", "Memory", row.text)],
        {
          source:
            root.origin.kind === "domain" && root.origin.id.startsWith("player-repair:")
              ? ["Added by you"]
              : knowers.flatMap((id) => {
                  const candidate = effective.get(id)!.get(root.id)!;
                  return storedById.get(candidate.id)!.knowers[id].support.map((e) => e.excerpt);
                }),
          actions: [
            ...actions,
            { id: "forget", label: "Forget" },
            ...(knowers.some((k) => root.knowers[k]?.forgotten) ? [{ id: "remember", label: "Restore memory" }] : []),
          ],
          people: people
            .filter((p) => knowers.includes(p.id))
            .map((p) => ({
              ...p,
              text: effective.get(p.id)!.get(row.rootId)!.text,
              forgotten: !!root.knowers[p.id]?.forgotten,
            })),
          revision: root.revision,
          subjects: row.subjects,
          related:
            row.domainRef && ["wish", "project"].includes(row.domainRef.kind)
              ? [
                  {
                    id:
                      row.domainRef.kind === "project"
                        ? repairId("project", row.domainRef.id)
                        : repairId(row.domainRef.kind, row.domainRef.characterId ?? "", row.domainRef.id),
                    title: `Linked ${row.domainRef.kind} record`,
                  },
                ]
              : [],
        },
      );
    }
    add(["new-memory"], "memories", "Add memory", "", [text("text", "Memory", "")], {
      people,
      source: [],
      creating: true,
    });
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
    const fontId = person.letterFontId ?? legacyLetterFont(id);
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
    for (const wish of person.wishes)
      add(
        ["wish", id, wish.id],
        "progress",
        name + " · " + wish.wish,
        wish.status,
        [
          text("wish", "Desired outcome", wish.wish),
          text("reason", "Reason", wish.reason),
          choices(
            "status",
            "Status",
            wish.status,
            ["open", "fulfilled", "withdrawn"].map((value) => ({ value, label: value })),
          ),
          text("approach", "Approach", wish.approach),
          choices(
            "attention",
            "Attention",
            wish.attention.state,
            ["background", "foreground"].map((value) => ({ value, label: value })),
          ),
          text("attentionReason", "Attention reason", wish.attention.reason),
          ...wish.conditions.map((c) => text("condition:" + c.id, "Essential condition", c.quote)),
        ],
        { source: ["Private retained desire. Player knowledge is repaired separately."] },
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
      add(
        ["zone", venue.id, zone.id],
        "places",
        `${venue.name} · ${zone.name}`,
        "Zone physical state",
        [
          text("description", "Long-term details", zone.description),
          text("recent", "Short-term details", zone.state.recent?.text ?? ""),
        ],
        {
          revision: zone.state.revision,
          source: [
            `Owner: ${people.find((p) => p.id === zone.ownerId)?.name ?? "Unassigned"}`,
            ...(zone.state.recent ? [`Short-term details expire: ${zone.state.recent.expiresAt}`] : []),
          ],
          actions: [
            { id: "correct", label: "Modify" },
            { id: "clear-recent", label: "Clear short-term details" },
            ...(zone.state.recent ? [{ id: "renew-recent", label: "Renew for one day" }] : []),
          ],
          related: state.projects
            .filter((p) => p.venueId === venue.id)
            .map((p) => ({ id: repairId("project", p.id), title: p.title })),
        },
      );
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
const lines = (value: string | number | boolean) =>
  String(value)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
export function applyWorldRepair(state: VillageState, record: RepairRecord, request: RepairRequest, at: string) {
  if (!record.actions.some((a) => a.id === request.action)) throw badRequest("Choose an available repair action.");
  const values = inputValues(record, request),
    [kind, id, sub, actor] = repairParts(record.id);
  const str = (key: string) => String(values[key] ?? "");
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
      const zone = state.venues
        .find((venue) => venue.id === row.venueId)
        ?.zones?.find((item) => item.id === row.zoneId);
      if (zone && (!str("description") || str("description").length > MAX_PLACE_DESCRIPTION))
        throw badRequest("Check the physical description.");
      row.observation = str("observation");
      row.remedy = str("remedy");
      row.endsAt = str("endsAt") || null;
      row.clearedAt = str("cleared") === "yes" ? at : null;
      row.revision++;
      if (zone && zone.description !== str("description")) {
        zone.description = str("description");
        zone.state.revision++;
        zone.state.updatedAt = at;
        zone.picture = { ...zone.picture, base: zone.picture?.base ?? zone.image, dirty: true };
      }
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
    return;
  }
  if (kind === "memory") {
    const target = state.memories.records.find((r) => r.id === id)!;
    const root = state.memories.records.find((r) => r.id === target.rootId)!;
    if (
      !request.knowers.length ||
      new Set(request.knowers).size !== request.knowers.length ||
      request.knowers.some((k) => !record.people?.some((p) => p.id === k))
    )
      throw badRequest("Choose existing memory knowers.");
    if (request.action === "remember") {
      changeMemoryProtection(
        state,
        id,
        Object.fromEntries(request.knowers.map((k) => [k, { ...root.knowers[k], forgotten: undefined }])),
        request.operationId,
      );
    } else {
      const operation = {
        operationId: request.operationId,
        expectedCollectionRevision: state.memories.revision,
        target: { id, revision: target.revision, rootRevision: root.revision },
        knowers: request.knowers,
        action: request.action === "forget" ? ("forget" as const) : ("repair" as const),
        ...(request.action === "correct" ? { text: str("text") } : {}),
      };
      (request.action === "forget" ? forgetVillageMemory : correctVillageMemory)(state, operation, at);
    }
    return;
  }
  if (kind === "new-memory") {
    if (
      !str("text") ||
      Buffer.byteLength(str("text"), "utf8") > 600 ||
      !request.knowers.length ||
      request.knowers.some((k) => !record.people?.some((p) => p.id === k))
    )
      throw badRequest("Enter a short memory and choose who remembers it.");
    const memoryId = "player-repair:" + request.operationId;
    const source = { kind: "domain" as const, id: memoryId, revision: 1, fingerprint: memoryHash(request) };
    const row = {
      id: memoryId,
      rootId: memoryId,
      revision: 1,
      createdRevision: state.memories.revision + 1,
      updatedRevision: state.memories.revision + 1,
      kind: "information" as const,
      text: str("text"),
      subjects: [],
      knowers: Object.fromEntries(
        request.knowers.map((k) => [
          k,
          {
            basis: "report" as const,
            attributedTo: "player",
            support: [{ source, lineId: memoryId, excerpt: "Player-authored repair", audience: request.knowers }],
            learnedAt: at,
            reinforcedAt: at,
          },
        ]),
      ),
      origin: source,
      occurredAt: at,
      recordedAt: at,
      lastApplication: { id: request.operationId, fingerprint: memoryHash(request) },
    };
    validateMemoryRecord(row);
    state.memories = {
      ...state.memories,
      revision: state.memories.revision + 1,
      records: [...state.memories.records, row],
    };
    return;
  }
  normalizeVillageMutation(
    state,
    state.seed,
    () => {
      if (kind === "world") {
        if (!str("name") || str("name").length > 120 || str("setting").length > 4096 || str("worldName").length > 120)
          throw badRequest("Shorten the Village name or description.");
        state.name = str("name");
        state.setting = str("setting");
        state.worldName = str("worldName");
        state.worldFacts = lines(values.worldFacts);
      } else if (kind === "founding") {
        if (str("foundingDetails").length > 2000 || str("foundingGuidance").length > 500)
          throw badRequest("Shorten the starting history.");
        state.foundingDetails = str("foundingDetails");
        state.foundingGuidance = str("foundingGuidance");
        if (state.scenarioImprint) state.scenarioImprint.origin = str("foundingDetails");
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
        agenda.routineProfile = undefined;
        agenda.week = undefined;
        agenda.plannedDays = {};
      } else if (kind === "venue") {
        const v = state.venues.find((v) => v.id === id)!;
        if (!str("name") || str("name").length > 100 || str("form").length > 240)
          throw badRequest("Shorten the Venue details.");
        v.name = str("name");
        v.form = str("form");
        if (Object.hasOwn(values, "x")) v.presentation.x = Number(values.x);
        if (Object.hasOwn(values, "y")) v.presentation.y = Number(values.y);
      } else if (kind === "zone" || kind === "access" || kind === "permission") {
        const v = state.venues.find((v) => v.id === id)!;
        v.zones ??= venueZones(v);
        v.layoutVersion = 1;
        const z = v.zones.find((z) => z.id === sub)!;
        if (kind === "zone") {
          if (str("description").length > MAX_PLACE_DESCRIPTION || str("recent").length > MAX_RECENT_PLACE_CONTEXT)
            throw badRequest("Shorten the Zone details.");
          z.description = str("description");
          const summary = str("recent").trim();
          if (request.action === "clear-recent" || !summary) z.state.recent = null;
          else {
            const renew = request.action === "renew-recent" || !z.state.recent;
            const occurredAt = renew ? at : z.state.recent!.occurredAt;
            z.state.recent = {
              text: summary,
              occurredAt,
              expiresAt: new Date(Date.parse(occurredAt) + RECENT_PLACE_DURATION).toISOString(),
            };
          }
          z.state.revision++;
          z.state.updatedAt = at;
        } else if (kind === "access") {
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
      } else if (kind === "wish") {
        const owner = state.villagers.find((p) => p.characterId === id)!,
          wish = owner.wishes.find((w) => w.id === sub)!;
        const status = str("status"),
          attention = str("attention");
        if (
          !["open", "fulfilled", "withdrawn"].includes(status) ||
          !["background", "foreground"].includes(attention) ||
          !["wish", "reason", "attentionReason"].every((key) => str(key).length > 0 && str(key).length <= 320) ||
          str("approach").length > 320
        )
          throw badRequest("Enter a short desired outcome, reason and valid status.");
        const corrected = readSocialWish({
          ...wish,
          wish: str("wish"),
          reason: str("reason"),
          status,
          approach: str("approach"),
          attention: { state: attention, reason: str("attentionReason") },
          revision: wish.revision + 1,
          changedAt: at,
          conditions: wish.conditions.map((c) => ({ ...c, quote: str("condition:" + c.id) })).filter((c) => c.quote),
          history: [
            ...wish.history,
            {
              id: request.operationId,
              at,
              kind: "repair",
              text: "Administrative correction.",
              sourceId: request.operationId,
              lineIds: [],
            },
          ],
        });
        owner.wishes = owner.wishes.map((w) => (w.id === sub ? corrected : w));
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

/** New revision and copy-before-write snapshots; never replace a historical collection. */
export function changeMemoryProtection(
  state: VillageState,
  id: string,
  knowers: Record<string, MemoryKnower>,
  operationId: string,
) {
  const target = state.memories.records.find((r) => r.id === id);
  if (!target) throw conflict("The memory is unavailable.");
  const root = structuredClone(state.memories.records.find((r) => r.id === target.rootId)!);
  const snapshots = retainMemoryScenes(
    state.memories,
    [root.id],
    Object.values(state.memoryScenes).map((s) => s.snapshot),
  );
  for (const snapshot of snapshots) state.memoryScenes[snapshot.sceneId].snapshot = snapshot;
  for (const [knower, prior] of Object.entries(knowers)) {
    if (!root.knowers[knower]) throw conflict("The memory’s audience changed.");
    if (prior.forgotten) root.knowers[knower].forgotten = structuredClone(prior.forgotten);
    else delete root.knowers[knower].forgotten;
    if (prior.repair) root.knowers[knower].repair = structuredClone(prior.repair);
    else delete root.knowers[knower].repair;
  }
  root.revision++;
  root.updatedRevision = state.memories.revision + 1;
  root.lastApplication = { id: operationId, fingerprint: memoryHash(knowers) };
  validateMemoryRecord(root);
  state.memories = {
    ...state.memories,
    revision: root.updatedRevision,
    records: state.memories.records.map((record) => (record.id === root.id ? root : record)),
  };
}
