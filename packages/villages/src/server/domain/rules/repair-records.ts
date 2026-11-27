import { visitorRepairRecords, applyVisitorRepair } from "./repair-visitors.js";
import { environmentRepairRecords, applyEnvironmentRepair } from "./repair-environment.js";
import { addRoomRepairRecords, roomRepairFields, applyRoomRepair } from "./repair-rooms.js";
import { physicalRepairRecords, applyPhysicalRepair } from "./repair-physical.js";
import { placeRegistry, readNpc, findLocation, sceneActorIds } from "./places.js";
import { assertDistinctNpcName } from "./npc-cast.js";
import { cardCharacters, findCardCharacter } from "./visitors.js";
import { projectRepairRecords, applyProjectRepair } from "./repair-projects.js";
import { LETTER_FONTS } from "../../../shared/helpers/letter-fonts.js";
import type { RepairBrowseItem, RepairField, RepairRecord, RepairRequest } from "../../../shared/contracts/repair.js";
import type {
  ContinuityRecord,
  ContinuityHolder,
  ContinuityEvidence,
  ContinuityClass,
  ContinuityVersion,
} from "../models/continuity-model.js";
import type { VillageState, VillageVenue } from "../models/world.js";
import { badRequest, conflict, repairFieldError } from "./errors.js";
import { memoryHash, memoryRequire, memoryString, memoryTimestamp } from "./memory-integrity.js";
import { continuityRepairEntries, changeContinuityMemory } from "./continuity-library.js";
import { continuityActor } from "./continuity-actors.js";
import { continuityHolderKey, continuityVersionId, protectContinuity } from "./continuity.js";
import { agendaRepairRecords, applyAgendaRepair, routineRepairRecord, applyRoutineRepair } from "./repair-agenda.js";
import { homeRepairRecords, applyHomeRepair } from "./repair-homes.js";
import { venueResidentIds, venueSleepers } from "./venue-model.js";
import { changeRoomOwner } from "./residence-move.js";
import { validateLayoutZones } from "./venue-layout.js";
import { venueZones } from "./venue-zones.js";
import { normalizeVillageMutation } from "./world-mutation.js";
import { retainNativeFact } from "./native-continuity.js";
import { addRepairMemory, moveRepairMemoryFacets } from "./repair-memory.js";
import { initializeVenueAccess, venueManagers, zoneManagers } from "./venue-access.js";
import { arrangementRepairRecords, applyArrangementRepair } from "./repair-arrangements.js";
import { relationshipRepairRecords, applyRelationshipRepair } from "./repair-relationships.js";
import { accessRepairRecords, applyAccessRepair } from "./repair-access.js";
import { readPlayerIdentity } from "./village-projections.js";

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
const text = (key: string, label: string, value: string): RepairField => ({
  key,
  label,
  value,
  type: "text",
  multiline:
    !["name", "label", "title", "worldName", "homeworld", "newRole"].includes(key) &&
    !key.startsWith("association-role:"),
});
const choices = (
  key: string,
  label: string,
  value: string,
  options: { value: string; label: string }[],
): RepairField => ({ key, label, value, type: "choice", options });
const actions = [{ id: "correct", label: "Modify" }];
const relationshipMeaning = (version: ContinuityVersion) =>
  version.relationshipScore !== undefined ||
  version.romanticInterest !== undefined ||
  version.relationshipAnswer !== undefined ||
  !!version.relationshipDay ||
  !!version.romanticDay ||
  !!version.perceptionChanged;
type ScopedRepairRecord = RepairRecord & { location?: { kind: "place" | "venue"; id: string; zoneId?: string } };

export function worldRepairRecords(
  state: VillageState,
  includeMemories = true,
  personId?: string,
  at = state.simulatedThrough || state.foundedAt || state.setupAt,
  includePlaceScopes = false,
): ScopedRepairRecord[] {
  const records: ScopedRepairRecord[] = [];
  records.push(...arrangementRepairRecords(state), ...homeRepairRecords(state, at));
  records.push(...relationshipRepairRecords(state, personId));
  const add = (
    parts: string[],
    topic: RepairRecord["topic"],
    title: string,
    summary: string,
    fields: RepairField[],
    { location, ...extra }: Partial<ScopedRepairRecord> = {},
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
      ...(includePlaceScopes && location ? { location } : {}),
    });
  add(
    ["person", "player"],
    "people",
    "Your Persona",
    "Character",
    [
      text("name", "Name", readPlayerIdentity(state).name),
      text("description", "Identity", readPlayerIdentity(state).description),
      text("background", "Background", state.playerBackground ?? ""),
    ],
    { source: [] },
  );
  add(["world"], "world", "Village setting", state.name, [
    text("name", "Village name", state.name),
    text("setting", "Place description", state.setting),
    text("worldName", "World name", state.worldName),
    text("worldRules", "Standing rules", state.worldRules),
  ]);
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
        text("appearance", "Appearance", npc.appearance ?? ""),
        choices("mapId", "Map", npc.mapId ?? "", [
          { value: "", label: "Unassigned" },
          ...state.maps.map((map) => ({ value: map.id, label: map.name })),
        ]),
        text("facts", "Established facts (one per line)", npc.facts.join("\n")),
        text("availability", "Availability", npc.availability),
        ...npc.associations.flatMap((row, index) => [
          choices("association-place:" + index, "Associated Place", row.placeId, [
            { value: "", label: "Remove association" },
            ...[
              ...state.venues,
              ...Object.values(state.worldPlaces.places)
                .filter((place) => !place.disabled)
                .map((place) => place.location),
            ].map((place) => ({ value: place.id, label: place.name })),
          ]),
          text("association-role:" + index, "Role", row.role),
        ]),
        choices("newPlace", "Add Place", "", [
          { value: "", label: "None" },
          ...[
            ...state.venues,
            ...Object.values(state.worldPlaces.places)
              .filter((place) => !place.disabled)
              .map((place) => place.location),
          ].map((place) => ({ value: place.id, label: place.name })),
        ]),
        text("newRole", "New role", ""),
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
        text("form", "Physical form", place.location.form ?? ""),
        text("category", "Category", place.location.category),
        ...[
          "player",
          ...cardCharacters(state).map((person) => person.characterId),
          ...Object.keys(state.worldPlaces.npcs),
        ].map((actor) => ({
          key: "knows:" + actor,
          label:
            (actor === "player"
              ? "You"
              : (cardCharacters(state).find((person) => person.characterId === actor)?.cardSnapshot.name ??
                state.worldPlaces.npcs[actor]?.label ??
                actor)) + " knows this Location",
          type: "boolean" as const,
          value: place.knownBy.includes(actor),
        })),
        { key: "disabled", label: "Disabled", type: "boolean", value: place.disabled },
        { key: "report", label: "Reported, unverified", type: "boolean", value: place.report },
      ],
      { revision: place.revision, source: [place.source], location: { kind: "place", id: place.id } },
    );
  const people = [
    { id: "player", name: "Your Persona" },
    ...cardCharacters(state).map((v) => ({ id: v.characterId, name: v.cardSnapshot.name })),
    ...Object.values(placeRegistry(state)?.npcs ?? {})
      .filter((npc) => !npc.disabled)
      .map((npc) => ({ id: npc.id, name: npc.label || npc.name })),
  ];
  const memoryFields = (
    kind: string,
    subjects: { id: string; incarnation: string }[],
    current: boolean,
  ): RepairField[] => [
    choices(
      "class",
      "Type",
      kind,
      [
        ["experience", "Experience"],
        ["information", "Information"],
        ["perspective", "Perspective"],
        ["desire", "Wish"],
        ["motivation", "Motivation"],
        ["commitment", "Commitment"],
        ["open-matter", "Unresolved issue"],
      ].map(([value, label]) => ({ value: value!, label: label! })),
    ),
    { key: "current", label: "Current", type: "boolean", value: current },
    ...people
      .filter(
        (person) =>
          !subjects.some(
            (subject) =>
              subject.id === person.id && continuityActor(state, subject.id)?.incarnation !== subject.incarnation,
          ),
      )
      .map((person) => ({
        key: "subject:" + person.id,
        label: "About " + person.name,
        type: "boolean" as const,
        value: subjects.some(
          (subject) =>
            subject.id === person.id && continuityActor(state, subject.id)?.incarnation === subject.incarnation,
        ),
      })),
    ...subjects
      .filter((subject) => continuityActor(state, subject.id)?.incarnation !== subject.incarnation)
      .map((subject, index) =>
        choices("subject-ref:" + index, "Earlier subject", JSON.stringify(subject), [
          { value: JSON.stringify(subject), label: "Keep the earlier person" },
          { value: "", label: "Remove this subject" },
          ...(continuityActor(state, subject.id)
            ? [
                {
                  value: JSON.stringify({
                    id: subject.id,
                    incarnation: continuityActor(state, subject.id)!.incarnation,
                  }),
                  label: "Use the current " + (people.find((person) => person.id === subject.id)?.name ?? "person"),
                },
              ]
            : []),
        ]),
      ),
  ];
  if (includeMemories) {
    if (personId && continuityActor(state, personId))
      add(
        ["new-memory", personId],
        "memories",
        "Add memory",
        "",
        [text("text", "Memory", ""), ...memoryFields("information", [], true)],
        {
          creating: true,
          people: people.filter((person) => person.id === personId),
          source: [],
        },
      );
    if (personId && continuityActor(state, personId))
      add(
        ["new-wish", personId],
        "memories",
        "Add Wish",
        "desire",
        [text("text", "Wish", ""), ...memoryFields("desire", [], true)],
        { creating: true, people: people.filter((person) => person.id === personId), source: [] },
      );
    const sourceVersions = new Map<string, ContinuityVersion[]>();
    for (const version of state.continuity.versions) {
      if (version.administrative) continue;
      const versions = sourceVersions.get(version.rootId) ?? [];
      versions.push(version);
      sourceVersions.set(version.rootId, versions);
    }
    const grouped = new Map<string, ReturnType<typeof continuityRepairEntries>>();
    for (const row of continuityRepairEntries(state, at)) {
      const rows = grouped.get(row.record.id) ?? [];
      rows.push(row);
      grouped.set(row.record.id, rows);
    }
    for (const rows of grouped.values()) {
      const focused = rows.find((row) => row.holder.id === personId),
        row = focused ?? rows[0];
      if (personId && !focused) continue;
      add(
        ["memory", row.record.id],
        "memories",
        row.entry.text,
        row.entry.kind + ", " + new Date(row.entry.occurredAt).toLocaleDateString("en-US"),
        [
          text("text", "Text", row.entry.text),
          ...(row.record.owner
            ? [
                {
                  ...choices(
                    "ownerId",
                    "Owner",
                    row.record.owner.id,
                    people.filter((p) => continuityActor(state, p.id)).map((p) => ({ value: p.id, label: p.name })),
                  ),
                  readOnly:
                    !!row.record.offer ||
                    !!row.version.agenda ||
                    !!row.version.parentId ||
                    continuityHolderKey(row.record.owner) !== continuityHolderKey(row.holder) ||
                    relationshipMeaning(row.version),
                },
              ]
            : []),
          ...memoryFields(row.version.class, row.version.about, row.head.current).map((field) =>
            row.record.offer ||
            row.version.agenda ||
            relationshipMeaning(row.version) ||
            (field.key === "current" && row.version.closed)
              ? { ...field, readOnly: true }
              : field,
          ),
          ...(["desire", "commitment"].includes(row.version.class)
            ? [
                {
                  key: "status",
                  label: "Status",
                  type: "text" as const,
                  readOnly: true,
                  value: row.version.closed?.reason ?? (row.head.current ? "Open" : "Past"),
                },
              ]
            : []),
        ],
        {
          source: [
            ...new Set(
              (focused ? [focused] : rows).flatMap((value) =>
                (sourceVersions.get(value.record.id) ?? [])
                  .filter(
                    (version) => version.id === continuityVersionId(state.seed, version.operationId, value.holder),
                  )
                  .flatMap((version) => version.sources.map((source) => source.excerpt)),
              ),
            ),
          ],
          actions: focused?.entry.forgotten
            ? [{ id: "remember", label: "Restore memory" }]
            : [
                ...actions,
                { id: "forget", label: "Forget" },
                { id: "teach", label: "Add person" },
                ...(["desire", "commitment"].includes(row.version.class) && !row.record.offer && !row.version.agenda
                  ? row.version.closed
                    ? [{ id: "reopen", label: "Reopen" }]
                    : [
                        { id: "fulfill", label: "Fulfill" },
                        { id: "withdraw", label: "Withdraw" },
                        ...(row.version.class === "commitment" ? [{ id: "end", label: "End commitment" }] : []),
                      ]
                  : []),
              ],
          recipients: people.filter((person) => !rows.some((value) => value.person.id === person.id)),
          account: { personId: row.person.id, versionId: row.version.id },
          people: rows.map((value) => ({
            ...value.person,
            text: value.entry.text,
            forgotten: value.entry.forgotten,
            memoryClass: value.version.class,
            current: value.head.current,
            status: value.version.closed?.reason ?? (value.head.current ? "Open" : "Past"),
            subjects: value.entry.subjects.map((subject) => subject.name),
          })),
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
  for (const person of cardCharacters(state)) {
    const id = person.characterId,
      name = person.cardSnapshot.name;
    add(
      ["person", id],
      "people",
      `${name}, character context`,
      "Village-owned character copy",
      [
        text("name", "Name", person.cardSnapshot.name),
        text("summary", "Summary", person.cardSnapshot.summary ?? ""),
        text("identity", "Identity label", person.identityDescription?.text ?? ""),
        { key: "__tools", label: "Character tools", type: "text", value: "", readOnly: true, group: "Character tools" },
        ...("admission" in person
          ? [
              text("homeworld", "Homeworld", person.admission.homeworld),
              text("startingSituation", "Starting situation", person.admission.startingSituation),
            ]
          : []),
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
      `${name}, letter style`,
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
    if ("agenda" in person && (!personId || personId === id)) {
      records.push(...agendaRepairRecords(state, person, at));
      const routine = routineRepairRecord(person);
      if (routine) records.push(routine);
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
      if (root.protection[key]?.forgotten) continue;
      const expires = version.room?.expiresAt;

      add(
        ["room", root.id],
        "places",
        venue!.name + ", " + zone.name,
        expires ? "Timed room detail" : "Room detail",
        [text("text", "Text", version.text), ...roomRepairFields(state, version.room)],
        {
          revision: root.revision,
          actions: [...actions, { id: "remove", label: "Remove detail" }],
          target: { id: root.id, recordRevision: root.revision, heads: { [key]: head.revision } },
          source: [
            ...(expires
              ? [
                  `Expires ${new Date(expires).toLocaleString("en-US", { timeZone: state.timeZone || undefined, dateStyle: "medium", timeStyle: "short" })}`,
                ]
              : []),
            ...version.sources.map((source) => source.excerpt),
          ],
          location: {
            kind: state.venues.some((entry) => entry.id === holder.placeId) ? "venue" : "place",
            id: holder.placeId,
            zoneId: holder.zoneId,
          },
        },
      );
    }
  for (const venue of state.venues) {
    add(
      ["management", venue.id],
      "places",
      venue.name + ", Runs this Venue",
      "Runs this Venue",
      people.map((person) => ({
        key: "manager:" + person.id,
        label: person.name,
        type: "boolean",
        value: venue.access?.managerIds.includes(person.id) ?? false,
      })),
      {
        location: { kind: "venue", id: venue.id },
        source: [
          "Venue control: " +
            venueManagers(venue)
              .map((id) => people.find((person) => person.id === id)?.name ?? "Unavailable person")
              .join(", "),
          ...venueZones(venue)
            .filter((zone) => zone.kind !== "exterior")
            .map(
              (zone) =>
                zone.name +
                ": " +
                zoneManagers(venue, zone)
                  .map((id) => people.find((person) => person.id === id)?.name ?? "Unavailable person")
                  .join(", "),
            ),
        ],
      },
    );
    add(
      ["venue", venue.id],
      "places",
      venue.name,
      "Venue identity and map placement",
      [
        text("name", "Name", venue.name),
        text("form", "Physical form", venue.form ?? ""),
        text("description", "Exterior description", venue.description),
        text("category", "Category", venue.category),
        text("venueType", "Venue type", venue.venueType ?? ""),
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
      ],
      { location: { kind: "venue", id: venue.id } },
    );
    for (const zone of venueZones(venue)) {
      if (zone.access) {
        add(
          ["access", venue.id, zone.id],
          "places",
          `${venue.name}, ${zone.name} access`,
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
                label: `${p.name}, manager`,
                value: (zone.access!.managerIds ?? []).includes(p.id),
                type: "boolean" as const,
              },
              {
                key: `member:${p.id}`,
                label: `${p.name}, member`,
                value: zone.access!.memberIds.includes(p.id),
                type: "boolean" as const,
              },
            ]),
          ],
          { location: { kind: "venue", id: venue.id, zoneId: zone.id } },
        );
        for (const person of people)
          if (venue.access)
            add(
              ["permission", venue.id, zone.id, person.id],
              "places",
              `${venue.name}, ${zone.name}, ${person.name}`,
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
                location: { kind: "venue", id: venue.id, zoneId: zone.id },
              },
            );
      }
    }
  }
  for (const venue of [...state.venues, ...Object.values(state.worldPlaces.places).map((place) => place.location)]) {
    const kind = state.venues.some((entry) => entry.id === venue.id) ? "venue" : "place";
    for (const zone of venueZones(venue))
      add(
        ["zone-details", venue.id, zone.id],
        "places",
        zone.name,
        "Zone details",
        [
          text("name", "Name", zone.name),
          choices(
            "kind",
            "Zone kind",
            zone.kind,
            zone.kind === "exterior"
              ? [{ value: "exterior", label: "Entrance" }]
              : [
                  { value: "public", label: "Public" },
                  { value: "restricted", label: "Restricted" },
                  { value: "personal", label: "Private Space" },
                ],
          ),
          text("purpose", "Used for", zone.purpose ?? ""),
          text("roomSpecification", "Room details", zone.roomSpecification ?? ""),
          { key: "seen", label: "Player has seen this Zone", type: "boolean", value: zone.seen ?? false },
          ...(zone.kind === "exterior"
            ? []
            : [
                {
                  ...choices("ownerId", "Owner", zone.ownerId ?? "", [
                    { value: "", label: "No individual owner" },
                    { value: "player", label: state.playerName || "You" },
                    ...state.villagers.map((p) => ({ value: p.characterId, label: p.cardSnapshot.name })),
                  ]),
                  group: "Control",
                },
                ...people.map((p) => ({
                  key: "controller:" + p.id,
                  label: p.name + ", controller",
                  type: "boolean" as const,
                  value: zone.controllerIds?.includes(p.id) ?? false,
                  group: "Control",
                })),
              ]),
        ],
        { source: [], location: { kind, id: venue.id, zoneId: zone.id } },
      );
  }
  records.push(...projectRepairRecords(state), ...visitorRepairRecords(state));
  records.push(
    ...physicalRepairRecords(state).map(({ location, ...record }) => ({
      ...record,
      ...(includePlaceScopes ? { location } : {}),
    })),
  );
  records.push(
    ...addRoomRepairRecords(state).map(({ location, ...record }) => ({
      ...record,
      ...(includePlaceScopes ? { location } : {}),
    })),
  );
  records.push(
    ...accessRepairRecords(state, at).map(({ location, ...record }) => ({
      ...record,
      ...(includePlaceScopes ? { location } : {}),
    })),
  );
  records.push(...environmentRepairRecords(state, at));
  const visibleIds = new Set(records.map((r) => r.id));
  return records.map((record) => ({ ...record, related: record.related.filter((link) => visibleIds.has(link.id)) }));
}

export function repairPlaceDirectory(state: VillageState, at?: string): RepairBrowseItem[] {
  const records = worldRepairRecords(state, false, undefined, at, true).filter((record) => record.topic === "places");
  const scoped = new Map<string, RepairRecord[]>();
  for (const record of records) {
    const scope = record.location;
    if (!scope) continue;
    const key = repairId(scope.kind, scope.id, scope.zoneId ?? "");
    const group = scoped.get(key) ?? [];
    group.push(record);
    scoped.set(key, group);
  }
  const folder = (
    id: string,
    title: string,
    icon: RepairBrowseItem["icon"],
    children: RepairBrowseItem[],
  ): RepairBrowseItem => ({ id, title, icon, children });
  const location = (kind: "place" | "venue", value: VillageVenue): RepairBrowseItem => {
    const node = repairId("location", kind, value.id);
    const zones = venueZones(value).map((zone) => {
      const id = repairId("zone", kind, value.id, zone.id);
      const zoneRecords = scoped.get(repairId(kind, value.id, zone.id)) ?? [];
      const items: RepairBrowseItem[] = [];
      const access: RepairBrowseItem[] = [];
      for (const record of zoneRecords) {
        const recordKind = repairParts(record.id)[0];
        if (recordKind === "permission") {
          access.push({
            id: record.id,
            title: record.title.slice((value.name + ", " + zone.name + ", ").length),
            icon: "people",
          });
        } else if (recordKind === "access" || recordKind === "access-place") {
          items.push({ id: record.id, title: "Entry policy", icon: "access" });
        } else {
          items.push({
            id: record.id,
            title: record.title,
            icon: ["access-extra", "hours-mode", "hours-period", "grant", "entry-refusal"].includes(recordKind)
              ? "access"
              : "details",
            summary: String(record.fields[0]?.value ?? "").slice(0, 120),
          });
        }
      }
      if (access.length) items.push(folder(id + "/access", "Standing access", "access", access));
      const conditions = (state.narrative?.conditions ?? []).filter(
        (condition) => condition.venueId === value.id && condition.zoneId === zone.id,
      );
      items.push(
        folder(id + "/conditions", "Conditions", "details", [
          { id: repairId("new-condition", value.id, zone.id), title: "Add condition", icon: "details" as const },
          ...conditions.map((condition) => ({
            id: repairId("narrative-condition", condition.id),
            title: condition.observation,
            icon: "details" as const,
          })),
        ]),
      );
      return folder(id, zone.name, "zone", items);
    });
    const details: RepairBrowseItem[] = (scoped.get(repairId(kind, value.id, "")) ?? []).map((record) => ({
      id: record.id,
      title:
        repairParts(record.id)[0] === "management"
          ? "Runs this Venue"
          : ["hours-mode", "hours-period", "venue-ban", "new-zone"].includes(repairParts(record.id)[0])
            ? record.title
            : kind === "place"
              ? "Place details"
              : "Venue details",
      icon: ["hours-mode", "hours-period", "venue-ban"].includes(repairParts(record.id)[0]) ? "access" : "details",
    }));
    const conditions = (state.narrative?.conditions ?? []).filter((condition) => condition.venueId === value.id);
    if (kind === "venue") {
      const personRows = (ids: string[]) =>
        ids.flatMap((personId) => {
          const person = cardCharacters(state).find((entry) => entry.characterId === personId);
          return person
            ? [{ id: repairId("person", personId), personId, title: person.cardSnapshot.name, icon: "people" as const }]
            : [];
        });
      details.push(folder(node + "/residents", "Residents", "people", personRows(venueResidentIds(value))));
      details.push(folder(node + "/workers", "Workers", "people", personRows(value.workerIds ?? [])));
    }
    details.push(
      folder(node + "/conditions", "Conditions", "details", [
        { id: repairId("new-condition", value.id, ""), title: "Add condition", icon: "details" as const },
        ...conditions.map((condition) => ({
          id: repairId("narrative-condition", condition.id),
          title: condition.observation,
          icon: "details" as const,
        })),
      ]),
    );
    return {
      ...folder(node, value.name, kind === "place" ? "places" : "venue", [...details, ...zones]),
      mapId: value.presentation.mapId,
      mapName: state.maps.find((map) => map.id === value.presentation.mapId)?.name,
    };
  };
  const places = Object.values(placeRegistry(state)?.places ?? {}).map((place) => location("place", place.location));
  const venues = state.venues.map((venue) => location("venue", venue));
  const homes: RepairBrowseItem[] = records
    .filter((record) => repairParts(record.id)[0] === "home")
    .map(({ id, title }) => ({ id, title, icon: "people" }));
  return [
    folder("places", "Locations", "places", places),
    folder("venues", "Venues", "venue", venues),
    ...(homes.length ? [folder("homes", "Home assignments", "people", homes)] : []),
  ];
}

function inputValues(record: RepairRecord, request: RepairRequest) {
  const result: Record<string, string | number | boolean> = {};
  for (const field of record.fields) {
    const value = request.values[field.key] ?? field.value;
    if (field.readOnly && value !== field.value)
      throw repairFieldError(field.key, `${field.label} updates through its native action.`);
    // Saved references can outlive their targets. Preserve them until an action validates or removes them.
    if (value === field.value) {
      result[field.key] = value;
      continue;
    }
    if (field.type === "number") {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        (field.min !== undefined && value < field.min) ||
        (field.max !== undefined && value > field.max)
      )
        throw repairFieldError(field.key, `Check ${field.label}.`);
    } else if (typeof value !== typeof field.value) throw repairFieldError(field.key, `Check ${field.label}.`);
    if (typeof value === "string" && value.length > 16000 && value !== field.value)
      throw repairFieldError(field.key, `Shorten ${field.label}.`);
    if (
      field.type === "days"
        ? !String(value).split(",").length ||
          new Set(String(value).split(",")).size !== String(value).split(",").length ||
          String(value)
            .split(",")
            .some((day) => !field.options?.some((option) => option.value === day))
        : field.options && !field.options.some((option) => option.value === value)
    )
      throw repairFieldError(field.key, `Choose ${field.label}.`);
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
  if (kind === "routine") {
    normalizeVillageMutation(state, () => applyRoutineRepair(state, record, values, request.action, at), {
      now: () => new Date(at),
      seed: () => request.operationId,
    });
    return;
  }
  if (
    applyPhysicalRepair(state, record, { ...request, values }, at) ||
    applyProjectRepair(state, record, { ...request, values }, at)
  )
    return;
  if (
    applyAccessRepair(state, record, { ...request, values }, at) ||
    applyHomeRepair(state, record, { ...request, values }, at) ||
    applyVisitorRepair(state, record, { ...request, values }, at)
  )
    return;
  if (kind === "relationship") {
    applyRelationshipRepair(state, id, sub!, { ...request, values }, at);
    return;
  }
  if (["work", "appointment", "work-proposal", "social-plan"].includes(kind)) {
    normalizeVillageMutation(state, () => applyArrangementRepair(state, record, request, at), {
      now: () => new Date(at),
      seed: () => request.operationId,
    });
    return;
  }
  if (kind === "new-memory" || kind === "new-wish") {
    if (request.knowers.length !== 1 || request.knowers[0] !== id)
      throw badRequest("Choose the selected person's memory account.");
    addRepairMemory(state, request.operationId, id, str("text"), at, undefined, {
      class: str("class") as ContinuityClass,
      current: values.current === true,
      subjects: record.fields
        .filter((f) => f.key.startsWith("subject:") && values[f.key] === true)
        .map((f) => f.key.slice(8)),
    });
    return;
  }
  if (kind === "agenda") {
    const indices = new Set(
      Object.keys(request.values)
        .filter((key) => /^(activity|start|end|venue|zone|repeat):/u.test(key))
        .map((key) => key.split(":")[1]),
    );
    if (request.action === "remove-activity" && (indices.size !== 1 || indices.has("new")))
      throw badRequest("Select one existing activity to remove.");
    const selectedValues = Object.fromEntries(Object.entries(values).filter(([key]) => indices.has(key.split(":")[1])));
    applyAgendaRepair(
      state,
      id,
      sub!,
      selectedValues,
      at,
      request.action === "add-activity",
      request.action === "remove-activity",
    );
    return;
  }
  if (kind === "npc" || kind === "place") {
    if (kind === "npc") {
      const npc = state.worldPlaces.npcs[id];
      if (!npc) throw conflict("This supporting character changed.");
      if (str("name") !== npc.name) assertDistinctNpcName(state, str("name"), npc.id);
      if (str("label") !== npc.label) assertDistinctNpcName(state, str("label"), npc.id);
      if (str("mapId") && !state.maps.some((map) => map.id === str("mapId"))) throw badRequest("Choose a saved Map.");
      const associations = npc.associations.flatMap((_row, index) => {
        const placeId = str("association-place:" + index);
        return placeId ? [{ placeId, role: str("association-role:" + index) }] : [];
      });
      if (str("newPlace")) {
        if (!str("newRole").trim()) throw badRequest("Describe this person's role at the Place.");
        associations.push({ placeId: str("newPlace"), role: str("newRole") });
      }
      if (
        associations.some((row) => !findLocation(state, row.placeId)) ||
        new Set(associations.map((row) => row.placeId)).size !== associations.length
      )
        throw badRequest("Choose distinct established Places for this NPC.");
      state.worldPlaces.npcs[id] = readNpc({
        ...npc,
        name: str("name"),
        label: str("label"),
        characterization: str("characterization"),
        appearance: str("appearance"),
        mapId: str("mapId") || undefined,
        associations,
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
      place.location.form = str("form");
      place.location.category = str("category");
      place.knownBy = record.fields
        .filter((field) => field.key.startsWith("knows:") && values[field.key] === true)
        .map((field) => field.key.slice(6));
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
    });
    narrative.revision++;
    return;
  }
  const environment = applyEnvironmentRepair(state, record, { ...request, values }, at);
  if (environment) {
    if (environment.situationId)
      retainAdministrativeCircumstance(state, environment.situationId, request.operationId, at);
    return;
  }
  if (applyRoomRepair(state, record, { ...request, values }, at)) return;
  if (kind === "memory") {
    if (request.action === "teach") {
      if (request.knowers.length !== 1 || !record.recipients?.some((person) => person.id === request.knowers[0]))
        throw badRequest("Choose someone without an existing account.");
      if (!record.account) throw conflict("Reopen the selected memory account.");
      addRepairMemory(state, request.operationId, request.knowers[0]!, String(record.fields[0]!.value), at, {
        recordId: id,
        ...record.account,
      });
      return;
    }
    if (
      !record.target ||
      !request.knowers.length ||
      request.knowers.some((id) => !record.people?.some((person) => person.id === id))
    )
      throw badRequest("Choose existing continuity holders.");
    if (request.action === "remember") {
      const root = state.continuity.records.find((row) => row.id === id)!;
      if (request.knowers.length !== 1) throw badRequest("Restore one memory account at a time.");
      const holder = continuityActor(state, request.knowers[0]!)!,
        key = continuityHolderKey(holder),
        head = root.heads[key];
      if (!head || !root.protection[key]?.forgotten) throw conflict("This memory account changed.");
      const version = state.continuity.versions.find((row) => row.id === head.versionId)!;
      state.continuity = protectContinuity(state.continuity, record.target, [holder], request.operationId, at, {
        text: version.text,
        restore: version.id,
      });
      return;
    }
    const metadataChanged = record.fields.some((field) =>
      ["class", "current", "ownerId"].includes(field.key) ||
      field.key.startsWith("subject:") ||
      field.key.startsWith("subject-ref:")
        ? values[field.key] !== field.value
        : false,
    );
    if (["fulfill", "withdraw", "end", "reopen"].includes(request.action)) {
      if (request.knowers.length !== 1) throw badRequest("Change one person's account at a time.");
      const holder = continuityActor(state, request.knowers[0]!)!,
        root = state.continuity.records.find((row) => row.id === id)!,
        head = root.heads[continuityHolderKey(holder)]!,
        previous = state.continuity.versions.find((version) => version.id === head.versionId)!;
      if (!["desire", "commitment"].includes(previous.class)) throw badRequest("Choose a Wish or commitment.");
      if (root.offer || previous.agenda) throw badRequest("Edit this agreed plan through its Agenda booking.");
      const reason = { fulfill: "fulfilled", withdraw: "withdrawn", end: "ended" }[request.action] as
        "fulfilled" | "withdrawn" | "ended" | undefined;
      state.continuity = protectContinuity(state.continuity, record.target!, [holder], request.operationId, at, {
        text: previous.text,
        restore: previous.id,
        current: !reason,
        closed: reason ?? null,
      });
      return;
    }
    if (metadataChanged) {
      if (request.knowers.length !== 1) throw badRequest("Change one person's account at a time.");
      const person = request.knowers[0]!,
        holder = continuityActor(state, person);
      if (!holder) throw conflict("This person changed.");
      const root = state.continuity.records.find((row) => row.id === id)!;
      const ownershipVersion = state.continuity.versions.find(
        (version) => version.id === root.heads[continuityHolderKey(holder)]?.versionId,
      )!;
      const ownerChanged = record.fields.some((field) => field.key === "ownerId" && field.value !== values.ownerId);
      const newOwner = ownerChanged ? str("ownerId") : person;
      if (
        ownerChanged &&
        (!root.owner ||
          continuityHolderKey(root.owner) !== continuityHolderKey(holder) ||
          root.offer ||
          ownershipVersion.parentId ||
          ownershipVersion.agenda ||
          relationshipMeaning(ownershipVersion) ||
          !["perspective", "desire", "motivation", "commitment"].includes(str("class")) ||
          !continuityActor(state, newOwner))
      )
        throw badRequest("Choose an eligible owner for this private account.");
      if (
        ["perspective", "desire", "motivation", "commitment"].includes(str("class")) &&
        root.owner &&
        root.owner.id !== person
      )
        throw badRequest("Open the owner's account to change this private state's classification or subjects.");
      state.continuity = protectContinuity(
        state.continuity,
        record.target!,
        [holder],
        request.operationId + "-prior",
        at,
        { forget: true },
      );
      const previous = state.continuity.versions.find(
        (version) => version.id === root.heads[continuityHolderKey(holder)]!.versionId,
      )!;
      const closed = ["desire", "commitment"].includes(str("class")) ? previous.closed?.reason : undefined;
      const replacement = addRepairMemory(
        state,
        request.operationId + "-replacement",
        newOwner,
        str("text"),
        at,
        undefined,
        {
          class: str("class") as ContinuityClass,
          priorVersionId: previous.id,
          priorHolderId: person,
          subjects: record.fields.flatMap<string | { id: string; incarnation: string }>((field) =>
            field.key.startsWith("subject:") && values[field.key] === true
              ? [field.key.slice(8)]
              : field.key.startsWith("subject-ref:") && values[field.key]
                ? [JSON.parse(String(values[field.key])) as { id: string; incarnation: string }]
                : [],
          ),
          current: request.action === "reopen" ? true : values.current === true,
          ...(closed ? { closed } : {}),
        },
      );
      const following = state.wishFollowing?.[person + ":" + id];
      if (replacement) moveRepairMemoryFacets(state, previous, replacement, person, request.operationId, at, newOwner);
      if (following !== undefined && replacement)
        (state.wishFollowing ??= {})[newOwner + ":" + replacement] = following;
      return;
    }
    if (request.action === "correct") {
      const holders = request.knowers
        .map((person) => continuityActor(state, person))
        .filter((holder): holder is NonNullable<typeof holder> => !!holder);
      if (holders.length !== request.knowers.length) throw conflict("A selected memory holder changed.");
      state.continuity = protectContinuity(state.continuity, record.target, holders, request.operationId, at, {
        text: str("text"),
        preserveSubjects: true,
      });
      return;
    }
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
      } else if (kind === "person") {
        if (id === "player") {
          if (str("name").length > 100 || str("description").length > 4000 || str("background").length > 1200)
            throw badRequest("Check the Persona name and description.");
          state.playerName = str("name").trim();
          state.playerDescription = str("description");
          state.playerIdentityRepair = {
            personaId: state.playerPersonaId,
            name: state.playerName,
            identity: state.playerDescription,
            revision: request.operationId,
          };
          state.playerBackground = str("background");
          return;
        }
        const p = findCardCharacter(state, id);
        if (!p) throw conflict("That person is unavailable.");
        if (!str("name").trim() || str("name").length > 100 || str("summary").length > 4000)
          throw badRequest("Shorten the character name or summary.");
        p.cardSnapshot.name = str("name");
        p.cardSnapshot.summary = str("summary");
        if (str("identity").length > 240) throw badRequest("Shorten the identity label.");
        p.identityDescription = {
          text: str("identity"),
          revision: request.operationId,
          initialGenerationComplete: true,
        };
        if ("admission" in p) {
          if (str("homeworld").length > 120 || str("startingSituation").length > 1200)
            throw badRequest("Shorten the admission context.");
          p.admission = { homeworld: str("homeworld"), startingSituation: str("startingSituation") };
        }
        for (const key of ["personality", "backstory", "scenario", "appearance", "postHistoryInstructions"] as const)
          p.cardSnapshot[key] = str(key);
        p.cardSnapshot.revision++;
      } else if (kind === "letter-font") {
        const person = findCardCharacter(state, id);
        if (!person) throw conflict("That person is unavailable.");
        person.letterFontId = str("letterFontId");
      } else if (kind === "venue") {
        const v = state.venues.find((v) => v.id === id)!;
        if (!str("name") || str("name").length > 100 || str("form").length > 240)
          throw badRequest("Shorten the Venue details.");
        v.name = str("name");
        v.form = str("form");
        v.description = str("description");
        v.category = str("category");
        v.venueType = str("venueType");
        if (Object.hasOwn(values, "x")) v.presentation.x = Number(values.x);
        if (Object.hasOwn(values, "y")) v.presentation.y = Number(values.y);
      } else if (kind === "management") {
        const venue = state.venues.find((entry) => entry.id === id);
        if (!venue) throw conflict("This Venue changed.");
        initializeVenueAccess(venue);
        venue.access!.managerIds = ["player", ...sceneActorIds(state)].filter(
          (person) => values["manager:" + person] === true,
        );
        venue.access!.revision++;
      } else if (kind === "zone-details") {
        const venue = findLocation(state, id),
          zone = venue && venueZones(venue).find((entry) => entry.id === sub);
        if (!venue || !zone) throw conflict("This Zone changed.");
        if (
          !str("name").trim() ||
          str("name").length > 100 ||
          str("purpose").length > 240 ||
          str("roomSpecification").length > 4000
        )
          throw badRequest("Shorten the Zone details.");
        if (zone.kind === "exterior" && str("kind") !== "exterior")
          throw badRequest("Keep the Entrance as an Entrance.");
        zone.name = str("name");
        if (zone.kind !== "exterior") {
          if ((zone.ownerId ?? "") !== str("ownerId")) {
            if (venueSleepers(venue, zone.id).length)
              throw conflict("Reassign sleeping arrangements in Home & work before changing this Zone's owner.");
            changeRoomOwner(venue, zone, str("ownerId") || undefined);
          }
          zone.controllerIds = record.fields
            .filter((f) => f.key.startsWith("controller:") && values[f.key] === true)
            .map((f) => f.key.slice(11));
        }
        zone.kind = str("kind") as typeof zone.kind;
        zone.purpose = str("purpose");
        zone.roomSpecification = str("roomSpecification");
        zone.seen = values.seen === true;
        validateLayoutZones(
          venue,
          venueZones(venue).filter((z) => z.kind !== "exterior"),
          state,
        );
        const place = state.worldPlaces.places[id];
        if (place) {
          place.revision++;
          state.worldPlaces.revision++;
        }
      } else if (kind === "access" || kind === "permission") {
        const v = state.venues.find((v) => v.id === id)!;
        v.zones ??= venueZones(v);
        v.layoutVersion = 1;
        const z = v.zones.find((z) => z.id === sub)!;
        if (kind === "access") {
          const ids = ["player", ...sceneActorIds(state)],
            managers = ids.filter((p) => values[`manager:${p}`] === true),
            members = ids.filter((p) => values[`member:${p}`] === true);
          if (str("inheritManagers") === "custom" && !managers.length)
            throw badRequest("Choose at least one manager or inherit Venue managers.");
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
