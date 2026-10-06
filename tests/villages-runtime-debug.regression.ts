import assert from "node:assert/strict";
import { completeWithRoom, villagesLogger } from "../packages/villages/src/engine/packages/server/src/services/villages/package-runtime.js";
import { configureVillagesRuntime } from "../packages/villages/src/engine/packages/server/src/services/villages/application-runtime.js";
import {
  readRuntimeDebug,
  saveRuntimeDebug,
  runtimeDebug,
} from "../packages/villages/src/engine/packages/server/src/services/villages/runtime-debug.js";
import { backgroundCalls } from "../packages/villages/src/engine/packages/server/src/services/villages/background-context.js";

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
    documents: {
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
    },
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
