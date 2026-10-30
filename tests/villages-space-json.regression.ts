import assert from "node:assert/strict";
import { createDocumentMutator } from "../packages/villages/src/server/adapters/storage/document-store.js";
import {
  coerceVillageState,
  defaultVillageState,
} from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { defaultVenueSpace } from "../packages/villages/src/server/domain/rules/venue-model.js";
import { createPrivateSpacePreparation } from "../packages/villages/src/server/jobs/private-space-service.js";

async function main() {
  const world = coerceVillageState({
    ...defaultVillageState(),

    seed: "fixture",
    name: "Test",
    setting: "Test",
    wishSystemVersion: 3,
    backgroundPace: "off",
    villagers: [],
    venues: [
      {
        id: "venue",
        name: "Test",
        layoutVersion: 1,
        classes: ["community"],
        occupancy: { playerHome: false, residentCharacterId: null, homeKind: null },
        residentIds: [],
        zones: [
          {
            ...defaultVenueSpace("community"),
            id: "space",
            name: "Storage",
            kind: "restricted",
            controllerIds: ["player"],
            preparation: { status: "pending" },
          },
        ],
      },
    ],
  });
  const zone = world.venues[0].zones![0];
  const original = structuredClone(zone);
  const records = new Map<string, any>();
  let failDiagnostics = false;
  const documents = {
    getById: async (_pkg: string, id: string) => structuredClone(records.get(id) ?? null),
    create: async (input: any) => {
      if (failDiagnostics) throw Error("disk failure");
      const row = { ...structuredClone(input), revision: 1 };
      records.set(input.id, row);
      return row;
    },
    update: async (input: any) => {
      if (failDiagnostics) throw Error("disk failure");
      const row = { ...records.get(input.id), ...structuredClone(input), revision: input.expectedRevision + 1 };
      records.set(input.id, row);
      return row;
    },
  };
  const valid = { rooms: [{ venueId: "venue", id: "space", description: "Ordinary shelves", items: [], facts: [] }] };
  let response = {
    content: JSON.stringify(valid),
    finishReason: "stop",
    usage: { promptTokens: 943, completionTokens: 409, completionReasoningTokens: 0 },
  };
  let calls = 0;
  const model = {
    model: "synthetic-model",
    name: "WrapperName",
    connectionId: "synthetic-connection",
    maxOutputTokens: 3000,
    fitContext: (messages: any[], options: any) => ({ messages, ...options }),
  };
  const service = createPrivateSpacePreparation({
    readVillageState: async () => structuredClone(world),
    mutateVillageState: async (work: any) => {
      await work(world);
      return structuredClone(world);
    },
    mutateDocument: createDocumentMutator(() => documents as any),
    readVillageLore: async () => [],
    reportFoundingProgress: async () => {},
    villagesLogger: () => ({ warn() {} }),
    villagesConnectionIdFor: async () => "synthetic-connection",
    villagesLanguageModels: () => ({ resolveForRequest: async () => model }),
    completeWithRoom: async (_m: any, messages: any[], limit: number, options: any) => {
      calls++;
      assert.deepEqual(options.responseFormat, { type: "json_object" });
      assert.equal(options.retryEmpty, false);
      assert.match(messages[0].content, /JSON/);
      assert.equal(limit, 3000);
      return response;
    },
  } as any);
  const failures: [string, string, string?][] = [
    ["No JSON", "invalid_json"],
    ["{broken}", "invalid_json"],
    [JSON.stringify({}), "missing_rooms"],
    [JSON.stringify({ rooms: [] }), "room_count"],
    [JSON.stringify({ rooms: [{}, {}] }), "room_count"],
    [JSON.stringify({ rooms: [{ ...valid.rooms[0], venueId: "wrong" }] }), "venue_id_mismatch"],
    [JSON.stringify({ rooms: [{ ...valid.rooms[0], id: "wrong" }] }), "space_id_mismatch"],
    [JSON.stringify({ rooms: [{ venueId: "venue", id: "space" }] }), "missing_description"],
    [JSON.stringify(valid), "truncated", "length"],
    [JSON.stringify(valid), "truncated", "max_tokens"],
    ["Bearer secret-token " + "x".repeat(25000) + "?api_key=hidden-value", "invalid_json"],
  ];
  for (const [content, issue, finishReason] of failures) {
    zone.preparation = { status: "pending" };
    response = { ...response, content, finishReason: finishReason ?? "stop" };
    const before = calls;
    await assert.rejects(service.preparePrivateSpaces(), /Retry preparation/);
    assert.equal(calls, before + 1);
    await service.preparePrivateSpaces();
    assert.equal(calls, before + 1, "Read/activation never retries failed provider work");
    assert.equal(zone.description, original.description);
    assert.deepEqual(zone.state, original.state);
    const record = records.get("villages-private-space-failures");
    assert.equal(record.kind, "private-diagnostics");
    assert(record.data.entries.length <= 5);
    const entry = record.data.entries.at(-1);
    assert(entry.issues.includes(issue));
    assert.equal(entry.model, "synthetic-model");
    assert.equal(entry.requestedOutputTokens, 3000);
    assert.equal(entry.venueId, "venue");
    assert.equal(entry.zoneId, "space");
    assert(entry.claimId);
    assert.equal(entry.usage.completionTokens, 409);
    assert(!JSON.stringify(zone.preparation).includes(content));
  }
  const entries = records.get("villages-private-space-failures").data.entries;
  assert.equal(entries.length, 5);
  const last = entries.at(-1);
  assert(last.content.length <= 24000);
  assert(last.truncated);
  assert.doesNotMatch(last.content, /secret-token|hidden-value/);
  assert(last.syntaxError);
  assert(!("messages" in last));
  zone.preparation = { status: "pending" };
  failDiagnostics = true;
  await assert.rejects(service.preparePrivateSpaces(), /Space response was not valid JSON/);
  assert.equal(zone.preparation.status, "failed", "Diagnostic write failure cannot replace rejection");
  failDiagnostics = false;
  response = {
    ...response,
    content: JSON.stringify({ rooms: [{ ...valid.rooms[0], description: "Ordinary shelves. Dry." }] }).replace(
      '"id":"space",',
      '"id":"space"',
    ),
    finishReason: "stop",
  };
  await service.retryPrivateSpaces();
  assert.equal(zone.preparation?.status, "ready");
  assert.equal(
    zone.description,
    "Ordinary shelves. Dry.",
    "Syntax repair still goes through normal room validation and application",
  );
  assert.equal(zone.state.recent, null);
  const beforeReady = calls;
  await service.preparePrivateSpaces();
  assert.equal(calls, beforeReady);
  console.log(
    "Space JSON: explicit mode, classified rejection, private bounded redaction, failure isolation and deliberate retry passed",
  );
}
void main();
