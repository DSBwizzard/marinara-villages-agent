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
} from "../packages/villages/src/server/adapters/observability/runtime-debug.js";
import { registerRuntimeDiagnosticsRoutes } from "../packages/villages/src/server/features/settings/routes.js";
import Fastify from "fastify";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import { backgroundCalls } from "../packages/villages/src/server/adapters/operations/background-context.js";

const records = new Map<string, any>();
const logs: string[] = [];
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
const options = { temperature: 0.3, debugMode: false, retryEmpty: false };
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
      records.set("villages-village", {
        id: "villages-village",
        revision: 1,
        data: { ...defaultVillageState(), selectedLorebookIds: ["private"] },
      });
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
        await lookupStarted;
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
void main();
