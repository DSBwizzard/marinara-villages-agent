import type { RepairRecord, RepairField, RepairRequest } from "../../../shared/contracts/repair.js";
import type { VillageState } from "../models/world.js";
import type { MemoryKnower } from "../models/memories.js";
import { inspectMemoryCandidates, projectMemories, retainMemoryScenes } from "./memory-views.js";
import { correctVillageMemory, forgetVillageMemory } from "./village-memories.js";
import { validateMemoryRecord, memoryHash } from "./memory-integrity.js";
import { normalizeVillageMutation } from "./world-mutation.js";
import { venueZones } from "./venue-zones.js";
import { venueResidentIds, venueCapacity, hasVenueClass } from "./venue-model.js";
import { assertResidencePrivateDestination } from "./venue-layout.js";
import { keepAgendaPlaces } from "./resident-agenda.js";
import { removeWishActivities } from "./wish-policy.js";
import { badRequest, conflict } from "./errors.js";

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
const actions = [{ id: "correct", label: "Correct" }];
export function worldRepairRecords(state: VillageState, inspection: boolean, includeMemories = true): RepairRecord[] {
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
  const people = [
    { id: "player", name: "Your Persona" },
    ...state.villagers.map((v) => ({ id: v.characterId, name: v.cardSnapshot.name })),
  ];
  if (includeMemories) {
    if (inspection)
      for (const id of new Set(state.memories.records.flatMap((r) => Object.keys(r.knowers))))
        if (!people.some((p) => p.id === id)) people.push({ id, name: "Former resident" });
    const storedById = new Map(state.memories.records.map((r) => [r.id, r]));
    const projected = new Map(
      people.map((p) => [
        p.id,
        inspection
          ? inspectMemoryCandidates(state.memories, p.id)
          : p.id === "player"
            ? projectMemories(state.memories, ["player"])
            : [],
      ]),
    );
    const effective = new Map([...projected].map(([id, rows]) => [id, new Map(rows.map((row) => [row.rootId, row]))]));
    const memories = inspection ? [...projected.values()].flat() : projected.get("player")!;
    const seen = new Set<string>();
    for (const row of memories) {
      if (seen.has(row.rootId)) continue;
      seen.add(row.rootId);
      const stored = storedById.get(row.id)!;
      const root = storedById.get(row.rootId)!;
      const knowers = inspection ? Object.keys(stored.knowers) : ["player"];
      add(
        ["memory", stored.id],
        "memories",
        row.text,
        `${row.kind} · ${new Date(row.occurredAt).toLocaleDateString("en-US")}`,
        [text("text", "Remembered wording", row.text)],
        {
          source: inspection
            ? Object.values(stored.knowers).flatMap((k) => k.support.map((e) => e.excerpt))
            : [...Object.values(row.knowers).flatMap((k) => k.support.map((e) => e.excerpt))],
          actions: [
            ...actions,
            { id: "forget", label: "Forget" },
            ...(knowers.some((k) => root.knowers[k]?.forgotten) ? [{ id: "remember", label: "Restore memory" }] : []),
          ],
          people: people
            .filter((p) => knowers.includes(p.id))
            .map((p) => ({
              ...p,
              text: effective.get(p.id)?.get(row.rootId)?.text ?? row.text,
              forgotten: !!root.knowers[p.id]?.forgotten,
            })),
          revision: root.revision,
          private: inspection || !stored.knowers.player,
          related:
            row.domainRef && ["wish", "pursuit", "project"].includes(row.domainRef.kind)
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
    add(
      ["new-memory"],
      "memories",
      "Record a missing memory",
      "Player-authored addition",
      [text("text", "Missing detail", "")],
      {
        people: inspection ? people : [people[0]],
        source: ["Player-authored repair. No fictional Scene or witnessed event is created."],
      },
    );
  }
  for (const person of state.villagers) {
    const id = person.characterId,
      name = person.cardSnapshot.name;
    if (inspection) {
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
            private: true,
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
          private: true,
          source: ["Captured character and admission context. The original library card stays separate."],
        },
      );
      if (person.agenda) {
        add(
          ["routine", id],
          "people",
          `${name} · routine`,
          "Future routine plans",
          [
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
          ],
          { private: true },
        );
      }
    }
    for (const wish of person.agenda?.wishes ?? []) {
      if (!inspection) continue;
      add(
        ["wish", id, wish.id],
        "progress",
        `${name} · ${wish.wish}`,
        "Active Wish",
        [text("wish", "Desired outcome", wish.wish)],
        {
          private: true,
          source: ["Corrects the authoritative desired outcome; does not invent fulfillment."],
          actions: [...actions, { id: "retire", label: "Retire Wish" }],
        },
      );
    }
    for (const wish of person.completedWishes) {
      if (!inspection) continue;
      add(
        ["completed-wish", id, wish.wish.id],
        "progress",
        `${name} · ${wish.wish?.wish ?? "Completed Wish"}`,
        "Recorded Wish outcome",
        [],
        { actions: [{ id: "reopen", label: "Withdraw mistaken completion" }], private: true },
      );
    }
    if (inspection && state.development?.residents[id])
      for (const pursuit of state.development.residents[id].pursuits)
        add(
          ["pursuit", id, pursuit.id],
          "progress",
          `${name} · Pursuit`,
          pursuit.status,
          [text("reason", "Recorded reason", pursuit.reason)],
          { private: true, actions: [...actions, { id: "end", label: "End Pursuit" }] },
        );
  }
  for (const venue of state.venues) {
    add(["venue", venue.id], "places", venue.name, "Venue description and map placement", [
      text("name", "Name", venue.name),
      text("description", "Description", venue.description),
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
      const privateRecord = zone.kind !== "exterior" && zone.ownerId !== "player";
      if (privateRecord && !inspection) continue;
      add(
        ["zone", venue.id, zone.id],
        "places",
        `${venue.name} · ${zone.name}`,
        "Zone physical state",
        [
          text("description", "Description", zone.description),
          text("condition", "Condition", zone.state.condition),
          text("items", "Objects (one per line)", zone.state.items.join("\n")),
          text("publicFacts", "Recorded facts (one per line)", zone.state.publicFacts.join("\n")),
          ...zone.state.features.map((f) => text(`feature:${f.id}`, "Feature", f.text)),
          ...zone.state.traces
            .filter((t) => inspection || !t.recipientId || t.recipientId === "player")
            .map((t) => text(`trace:${t.id}`, t.kind === "note" ? "Note" : "Physical trace", t.text)),
        ],
        {
          private: privateRecord,
          source: [`Owner: ${people.find((p) => p.id === zone.ownerId)?.name ?? "Unassigned"}`],
          related: state.projects
            .filter((p) => p.venueId === venue.id)
            .map((p) => ({ id: repairId("project", p.id), title: p.title })),
        },
      );
      if (inspection && zone.access) {
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
          { private: true },
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
                private: true,
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
    state.memories.revision++;
    state.memories.records.push(row);
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
        if (!str("name") || str("name").length > 100 || str("description").length > 1000 || str("form").length > 240)
          throw badRequest("Shorten the Venue details.");
        v.name = str("name");
        v.description = str("description");
        v.form = str("form");
        if (Object.hasOwn(values, "x")) v.presentation.x = Number(values.x);
        if (Object.hasOwn(values, "y")) v.presentation.y = Number(values.y);
      } else if (kind === "zone" || kind === "access" || kind === "permission") {
        const v = state.venues.find((v) => v.id === id)!;
        v.zones ??= venueZones(v);
        v.layoutVersion = 1;
        const z = v.zones.find((z) => z.id === sub)!;
        if (kind === "zone") {
          if (
            str("description").length > 1000 ||
            str("condition").length > 1000 ||
            lines(values.items).some((l) => l.length > 240)
          )
            throw badRequest("Shorten the Zone details.");
          z.description = str("description");
          z.state.condition = str("condition");
          z.state.items = lines(values.items);
          z.state.publicFacts = lines(values.publicFacts);
          z.state.updatedAt = at;
          for (const feature of z.state.features) feature.text = str(`feature:${feature.id}`);
          for (const trace of z.state.traces)
            if (Object.hasOwn(values, `trace:${trace.id}`)) trace.text = str(`trace:${trace.id}`);
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
        const p = state.villagers.find((v) => v.characterId === id)!,
          wish = p.agenda!.wishes.find((w) => w.id === sub)!;
        if (request.action === "retire") {
          p.agenda!.wishes = p.agenda!.wishes.filter((w) => w.id !== sub);
          removeWishActivities(p, sub, new Date(at));
          const need = p.wishLifecycle?.needs.find((n) => n.id === wish.need?.id);
          if (need) need.state = "expired";
          state.progressTasks = state.progressTasks.filter(
            (task) => task.definition.owner.kind !== "wish" || task.definition.owner.id !== sub,
          );
        } else {
          if (!str("wish") || str("wish").length > 600) throw badRequest("Enter a short desired outcome.");
          wish.wish = str("wish");
          wish.semanticCriteria = undefined;
          wish.conditionRevision = (wish.conditionRevision ?? 0) + 1;
        }
      } else if (kind === "pursuit") {
        const resident = state.development!.residents[id],
          pursuit = resident.pursuits.find((p) => p.id === sub)!;
        pursuit.reason = str("reason");
        pursuit.updatedAt = at;
        if (request.action === "end") pursuit.status = "ended" as typeof pursuit.status;
        resident.revision++;
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
  const root = state.memories.records.find((r) => r.id === target.rootId)!;
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
  root.updatedRevision = ++state.memories.revision;
  root.lastApplication = { id: operationId, fingerprint: memoryHash(knowers) };
  validateMemoryRecord(root);
}
