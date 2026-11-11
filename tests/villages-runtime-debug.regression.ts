import { villageFixtureDocuments } from "./helpers/village-storage.fixture.js";
import assert from "node:assert/strict";
import { completeWithRoom } from "../packages/villages/src/server/features/generation/model-requests.js";
import { villagesLogger } from "../packages/villages/src/server/adapters/engine/runtime-host.js";
import { configureVillagesRuntime } from "../packages/villages/src/server/entry/runtime.js";
import {
  readRuntimeDebug,
  saveRuntimeDebug,
  runtimeDebug,
  readLoreInspections,
  rememberLoreInspection,
  readLoreTrigger,
  recordLoreUse,
  readLoreActivity,
} from "../packages/villages/src/server/adapters/observability/runtime-debug.js";
import { selectVillageLore } from "../packages/villages/src/server/domain/rules/lore-selection.js";
import { inspectedLoreUse } from "../packages/villages/src/server/domain/rules/lore-context.js";
import { registerRuntimeDiagnosticsRoutes } from "../packages/villages/src/server/features/settings/routes.js";
import Fastify from "fastify";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { backgroundCalls } from "../packages/villages/src/server/adapters/operations/background-context.js";
import { createTownMapImage } from "../packages/villages/src/server/features/media/town-map-image-service.js";
import { createImageGeneration } from "../packages/villages/src/server/features/media/image-generation-service.js";

const records = new Map<string, any>();
const logs: string[] = [];
function setVillage(seed: string, selectedLorebookIds: string[] = []) {
  records.set("villages-village", {
    id: "villages-village",
    packageId: "villages",
    kind: "village",
    name: "Village",
    description: "",
    revision: 1,
    data: { ...defaultVillageState(), seed, setupAt: "2026-11-09T12:00:00Z", selectedLorebookIds },
  });
}
let engineEnabled = false,
  throwLogger = false,
  paidCalls = 0;
const host = {
  isDebugAgentsEnabled: () => engineEnabled,
  logger: {
    debug() {
      if (throwLogger) throw new Error("logger failed");
    },
    info() {
      if (throwLogger) throw new Error("logger failed");
    },
    warn() {
      if (throwLogger) throw new Error("logger failed");
    },
    error() {
      if (throwLogger) throw new Error("logger failed");
    },
    debugOverride(enabled: boolean, _message: string, text: string) {
      if (throwLogger) throw new Error("logger failed");
      if (enabled) logs.push(text);
    },
  },
  persistence: {
    documents: villageFixtureDocuments({
      async getById(_package: string, id: string) {
        return records.get(id) ?? null;
      },
      async create(input: any) {
        const row = { ...input, revision: 1 };
        records.set(input.id, row);
        return row;
      },
      async update(input: any) {
        const row = records.get(input.id);
        if (row?.revision !== input.expectedRevision) return null;
        const next = { ...row, ...input, revision: row.revision + 1 };
        records.set(input.id, next);
        return next;
      },
    }),
  },
};
let release = configureVillagesRuntime(host as Parameters<typeof configureVillagesRuntime>[0]);
const model: any = {
  model: "test-model",
  connectionId: "connection-id",
  async chatComplete() {
    paidCalls++;
    return { content: "raw reply", finishReason: "stop", usage: { totalTokens: 37 } };
  },
};
const messages = [{ role: "user" as const, content: "Private conversation context" }];
const options = { temperature: 0.3, debugMode: false };
async function main() {
  try {
    assert.deepEqual(await readRuntimeDebug(), {
      verbose: false,
      effective: false,
      engineEnabled: false,
      showUsageMeter: true,
    });
    await completeWithRoom(model, messages, 1000, options);
    assert.equal(logs.length, 0, "default-off is quiet");
    await assert.rejects(saveRuntimeDebug("true"), /must be true or false/);
    assert.equal(records.has("villages-debug"), false);
    await saveRuntimeDebug(true);
    logs.length = 0;
    await completeWithRoom(model, messages, 1000, options);
    assert.match(logs.join("\n"), /Private conversation context|raw reply/);
    assert.match(logs.join("\n"), /finishReason.*stop/);
    assert.match(logs.join("\n"), /totalTokens.*37/);
    runtimeDebug("redaction", {
      authorization: "Bearer top-secret",
      apiKey: "secret-key",
      detail: "Bearer access-value",
    });
    assert.doesNotMatch(logs.at(-1)!, /top-secret|secret-key|access-value/);
    assert.match(logs.at(-1)!, /redacted/);
    runtimeDebug("raw response redaction", {
      content: '{"api_key":"nested-secret"}',
      url: "https://example.test/?api_key=url-secret",
    });
    assert.doesNotMatch(logs.at(-1)!, /nested-secret|url-secret/);

    release();
    release = configureVillagesRuntime(host as Parameters<typeof configureVillagesRuntime>[0]);
    assert.equal((await readRuntimeDebug()).verbose, true, "setting survives runtime replacement");
    await saveRuntimeDebug(false);
    const server = Fastify({ logger: false });
    registerRuntimeDiagnosticsRoutes(server);
    try {
      assert.equal((await server.inject({ method: "GET", url: "/debug/lore" })).statusCode, 403);
      assert.equal(
        (await server.inject({ method: "POST", url: "/debug/lore", payload: { query: "secret" } })).statusCode,
        403,
      );
      const beforeInspection = paidCalls;
      const selected = selectVillageLore(
        [
          {
            id: "text",
            bookId: "private",
            name: "Texting",
            content: "Private body",
            enabled: true,
            folderEnabled: true,
            keys: ["private key"],
          },
          {
            id: "omitted",
            bookId: "private",
            name: "Other",
            content: "Private omitted body",
            enabled: true,
            folderEnabled: true,
            keys: ["unmatched"],
          },
        ],
        { setting: "Unshared private key context" },
        1600,
      ).inspection;
      selected.entries[0]!.images = [
        {
          path: "/api/lorebooks/entry-images/11111111-1111-1111-1111-111111111111.png",
          caption: "Private image caption",
        },
      ];
      const inspectionId = (await rememberLoreInspection(selected))!;
      assert.doesNotMatch(
        JSON.stringify(records.get("villages-lore-activity")),
        /entry-images|Private image caption/,
        "Image attachments stay transient instead of being copied into activity history",
      );
      const reference = { inspectionId, bookId: "private", entryId: "text" };
      assert.equal((await readLoreActivity()).records.length, 0, "Selection alone is not prompt inclusion");
      const use = inspectedLoreUse({ ...selected, inspectionId }, "Image");
      await recordLoreUse(use, "Map artwork");
      const first = await readLoreActivity();
      assert.equal(first.records.length, 1);
      assert.doesNotMatch(JSON.stringify(first), /entry-images|Private image caption/);
      await recordLoreUse(use, "Map artwork");
      assert.equal(
        (await readLoreActivity()).revision,
        first.revision,
        "Recovery does not create another unread event",
      );
      const summary = await server.inject({ method: "GET", url: "/debug/lore?activity=summary" });
      assert.equal(summary.statusCode, 200);
      assert.doesNotMatch(summary.body, /private key|Unshared|Texting|Private body/);
      const targeted = await server.inject({ method: "POST", url: "/debug/lore", payload: reference });
      assert.equal(targeted.statusCode, 200, "Explicit creator inspection works without verbose logging");
      assert.equal(targeted.json().trigger.key, "private key");
      assert.match(targeted.json().trigger.context.text, /Unshared private key context/);
      assert.doesNotMatch(
        targeted.body,
        /Private body|Private omitted body|unmatched|entry-images|Private image caption/,
      );
      assert.doesNotMatch(JSON.stringify(use), /private key|Unshared|Private body/);
      for (const patch of [{ bookId: "other" }, { entryId: "omitted" }])
        assert.deepEqual(
          (await server.inject({ method: "POST", url: "/debug/lore", payload: { ...reference, ...patch } })).json(),
          { trigger: null },
        );
      for (const payload of [
        { ...reference, inspectionId: "bad" },
        { ...reference, entryId: "x".repeat(161) },
        { ...reference, bookId: null },
        { inspectionId },
      ])
        assert.equal((await server.inject({ method: "POST", url: "/debug/lore", payload })).statusCode, 400);
      const clone = await readLoreTrigger(inspectionId, "private", "text");
      clone.trigger!.key = "changed";
      assert.equal((await readLoreTrigger(inspectionId, "private", "text")).trigger?.key, "private key");
      await saveRuntimeDebug(false);
      release();
      release = configureVillagesRuntime(host as Parameters<typeof configureVillagesRuntime>[0]);
      assert.equal(
        (await readLoreTrigger(inspectionId, "private", "text")).trigger?.key,
        "private key",
        "Evidence survives runtime replacement",
      );
      assert.equal((await readLoreActivity()).revision, first.revision);
      for (let index = 0; index < 200; index++) await rememberLoreInspection(selected);
      assert.deepEqual(
        await readLoreTrigger(inspectionId, "private", "text"),
        { trigger: null },
        "Retained history has a bounded scope without fabricating old causes",
      );
      assert.equal(
        (await readLoreActivity(true)).revision,
        first.revision,
        "Trimming evidence cannot rewind the unread cursor",
      );
      const artworkInspection = (await rememberLoreInspection(selected))!;
      let imagesReady = false,
        imageDispatches = 0;
      const generator = createImageGeneration({
        villagesImageConnectionChoice: async () => ({ enabled: true, connectionId: "art" }),
        villageEngineJson: async (path) => {
          if (path === "/api/connections")
            return [{ id: "art", provider: "image_generation", imageService: "openai", model: "gpt-image-1" }] as any;
          assert.equal(path, "/api/characters/avatar-generation");
          imageDispatches++;
          return { image: "synthetic" } as any;
        },
        readLoreImageReferences: async () => {
          if (!imagesReady) throw Error("Reference unavailable");
          return ["synthetic-reference"];
        },
        decodeVillageImageDataUrl: () => ({ dataUrl: "synthetic", mime: "image/png", bytes: new Uint8Array() }),
      });
      const artwork = createTownMapImage({
        readVillageImageLoreEntries: async (_ids, _context, _limit, _budget, inspect) => {
          inspect?.({ ...selected, inspectionId: artworkInspection });
          return ["Texting: Private body"];
        },
        generateVillageImage: generator.generateVillageImage,
        inspectVillageImage: async () => ({ width: 1, height: 1 }),
      });
      const beforeArtwork = (await readLoreActivity(true)).revision;
      await assert.rejects(artwork.generateVillageTownMap({ setting: "Harbor" }), /Reference unavailable/);
      assert.equal(
        (await readLoreActivity(true)).revision,
        beforeArtwork,
        "Failed image preflight is not injected Lore activity",
      );
      assert.equal(imageDispatches, 0);
      imagesReady = true;
      await artwork.generateVillageTownMap({ setting: "Harbor" });
      assert.equal((await readLoreActivity(true)).revision, beforeArtwork + 1);
      assert.equal(imageDispatches, 1, "Validated artwork records inclusion at its single dispatch");
      const previousWorld = records.get("villages-village");
      setVillage("world-one");
      const bound = await readLoreActivity(true);
      const scopedId = (await rememberLoreInspection({ ...selected, scope: bound.scope }))!;
      await recordLoreUse(inspectedLoreUse({ ...selected, inspectionId: scopedId }, "Image"), "Map artwork");
      const worldOne = await readLoreActivity();
      setVillage("world-two");
      const worldTwo = await readLoreActivity();
      assert.notEqual(worldTwo.scope, worldOne.scope);
      assert.equal(worldTwo.records.length, 0);
      assert.equal(worldTwo.revision, 0);
      assert.deepEqual(
        await readLoreTrigger(scopedId, "private", "text"),
        { trigger: null },
        "Another Village cannot inspect prior context",
      );
      assert.equal(
        await rememberLoreInspection({ ...selected, scope: worldOne.scope }),
        undefined,
        "A lookup returning after a world change cannot enter the new scope",
      );
      setVillage("world-one");
      assert.deepEqual(await readLoreActivity(), worldOne, "Returning to a retained Village restores its own history");
      if (previousWorld) records.set("villages-village", previousWorld);
      else records.delete("villages-village");
      await saveRuntimeDebug(true);
      for (let index = 0; index < 12; index++)
        runtimeDebug("lore inspection", {
          purpose: "Scene Narration",
          stage: "prompt",
          budget: 1600,
          omittedDiagnostics: 0,
          entries: [
            { id: String(index), bookId: "private", name: "SECRET ENTRY TITLE", match: "current", status: "included" },
          ],
        });
      const report = await server.inject({ method: "GET", url: "/debug/lore" });
      assert.equal(report.statusCode, 200);
      assert.equal(report.json().reports.length, 10);
      assert.match(report.body, /SECRET ENTRY TITLE/);
      assert.doesNotMatch(report.body, /Private conversation context|raw reply/);
      const selection = await server.inject({ method: "POST", url: "/debug/lore", payload: { query: "harbor" } });
      assert.equal(selection.statusCode, 200);
      assert.equal(selection.json().report.stage, "selection");
      assert.equal(paidCalls, beforeInspection, "Inspection and key tests never send model requests");
      const originalFetch = globalThis.fetch;
      let finishLookup!: () => void, beginLookup!: () => void;
      const lookupStarted = new Promise<void>((resolve) => {
        beginLookup = resolve;
      });
      const lookupWait = new Promise<void>((resolve) => {
        finishLookup = resolve;
      });
      setVillage("lore-race", ["private"]);
      globalThis.fetch = async (input) => {
        const path = new URL(String(input)).pathname;
        if (path === "/api/lorebooks") {
          beginLookup();
          await lookupWait;
        }
        const body =
          path === "/api/lorebooks"
            ? [{ id: "private", name: "Hidden book", enabled: true }]
            : path.endsWith("/folders")
              ? []
              : [
                  {
                    id: "entry",
                    name: "RACING SECRET TITLE",
                    content: "Private fact",
                    enabled: true,
                    folderId: null,
                    constant: true,
                  },
                ];
        return new Response(JSON.stringify(body));
      };
      try {
        const pending = server.inject({ method: "POST", url: "/debug/lore", payload: { query: "harbor" } });
        const response = Promise.resolve(pending);
        await Promise.race([
          lookupStarted,
          response.then(({ statusCode, body }) => assert.fail(`Lore lookup ended early (${statusCode}): ${body}`)),
        ]);
        await saveRuntimeDebug(false);
        finishLookup();
        const stopped = await response;
        assert.equal(stopped.statusCode, 403);
        assert.doesNotMatch(stopped.body, /RACING SECRET TITLE|Private fact/);
      } finally {
        globalThis.fetch = originalFetch;
        finishLookup();
      }
      await saveRuntimeDebug(false);
      await assert.rejects(readLoreInspections(), /Enable verbose/);
      await saveRuntimeDebug(true);
      assert.deepEqual(
        (await readLoreInspections()).reports,
        [],
        "Disabling debugging clears private in-memory reports",
      );
      await saveRuntimeDebug(false);
    } finally {
      await server.close();
    }
    logs.length = 0;
    await completeWithRoom(model, messages, 1000, options);
    assert.equal(logs.length, 0, "switching off takes effect immediately");
    engineEnabled = true;
    assert.deepEqual(await readRuntimeDebug(), {
      verbose: false,
      effective: true,
      engineEnabled: true,
      showUsageMeter: true,
    });
    await completeWithRoom(model, messages, 1000, options);
    assert.ok(logs.length > 0, "Engine override prints despite package toggle being off");
    logs.length = 0;
    const callsBeforeBackground = paidCalls;
    await backgroundCalls.run(
      async () => ({ content: "saved background response", finishReason: "stop" }),
      () => completeWithRoom(model, messages, 1000, options),
    );
    assert.equal(paidCalls, callsBeforeBackground, "logging never adds generation requests");
    assert.match(logs.join("\n"), /saved background response/);
    await assert.rejects(
      completeWithRoom(
        {
          ...model,
          chatComplete: async () => {
            throw new Error("provider unavailable");
          },
        },
        messages,
        1000,
        options,
      ),
      /provider unavailable/,
    );
    assert.match(logs.join("\n"), /completion exception.*provider unavailable/);
    throwLogger = true;
    await completeWithRoom(model, messages, 1000, options);
    runtimeDebug("throwing logger", {});
    villagesLogger().warn("A validation failure should remain readable.");
    villagesLogger().error(new Error("original"), "original error");
    await saveRuntimeDebug(false);
    console.log(
      "Runtime logging defaults, persistence, toggles, overrides, redaction, background completions, and logger failures passed.",
    );
  } finally {
    release();
  }
}
await main();
