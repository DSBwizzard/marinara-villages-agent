// Villages — proof for the three connections the village spends model calls on.
//
// The village sends work to three different places, and the whole feature is
// the order it decides between them in:
//
//   1. what the player picked for this agent's village;
//   2. what the agent itself was set up with;
//   3. nothing, which leaves the Engine to use its own default.
//
// Every step of that is allowed to be empty, and the LAST step is the one worth
// pinning hardest: a package that invented an id here would break an agent that
// has never been configured, and it would break it silently, because the Engine
// reads a missing connection as "use the default one".
//
// Two more things in here are not about ordering at all and are the reason the
// feature is shaped the way it is:
//
//   * The choices live in a document of their own, so "Reset the village and
//     start over" cannot take them with it. That is asserted by watching the
//     document's revision across a reset rather than by reading the reply, so a
//     reset that rewrote the document with the same values would still fail.
//   * Pictures read a DIFFERENT agent field from talk. An agent that talks with
//     a hosted model and draws with a local Stable Diffusion endpoint is the
//     ordinary case, and collapsing the two fields is the bug this catches.
//
// Finally the choice is followed all the way to the model host, because the
// resolver being right is worth nothing if a call site still reads the agent
// config directly.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * The id the choices are stored under.
 *
 * Written out rather than imported. It is a compatibility surface: renaming it
 * would orphan every player's choice, so the test should fail on a rename rather
 * than follow one.
 */
const CONNECTIONS_DOC_ID = "villages-connections";

async function main() {
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const engineRoot = process.env.MARINARA_ENGINE_ROOT;
  assert.ok(engineRoot, "Set MARINARA_ENGINE_ROOT to the current Marinara Engine checkout.");
  const Fastify = (
    await import(pathToFileURL(join(engineRoot, "packages/server/node_modules/fastify/fastify.js")).href)
  ).default;
  const moduleUrl = (relativePath: string) => pathToFileURL(join(repoRoot, relativePath)).href;

  const { activate } = await import(
    moduleUrl(
      process.env.VILLAGES_TEST_PACKAGED
        ? "packages/villages/server.mjs"
        : "packages/villages/src/server/entry/index.ts",
    )
  );
  const {
    defaultVillageConnectionSettings,
    validateVillageSetupConnections,
    villagesConnectionIdFor,
    villagesImageConnectionChoice,
  } = await import(moduleUrl("packages/villages/src/server/features/settings/connections.ts"));

  // ── Document store double ──────────────────────────────────────────────────
  // Same semantics as the Engine's own store and as the chat regression's: a
  // second insert under one id is a primary-key failure, and `update` returns
  // null when the revision moved underneath it.
  const documentsByKey = new Map<string, any>();
  const createdIds: string[] = [];
  let documentsThrow = false;
  const keyOf = (packageId: string, id: string) => `${packageId}::${id}`;
  const documents = {
    async list(packageId: string, kind: string) {
      return [...documentsByKey.values()].filter((row) => row.packageId === packageId && row.kind === kind);
    },
    async getById(packageId: string, id: string) {
      if (documentsThrow) throw new Error("The package document store is unreachable.");
      return documentsByKey.get(keyOf(packageId, id)) ?? null;
    },
    async create(input: any) {
      const stored = keyOf(input.packageId, input.id);
      if (documentsByKey.has(stored)) throw new Error("UNIQUE constraint failed: capability_documents.id");
      const row = { ...input, revision: 1 };
      documentsByKey.set(stored, row);
      createdIds.push(input.id);
      return row;
    },
    async update(input: any) {
      if (documentsThrow) throw new Error("The package document store is unreachable.");
      const stored = keyOf(input.packageId, input.id);
      const current = documentsByKey.get(stored);
      if (!current || current.revision !== input.expectedRevision) return null;
      const next = { ...current, ...input, revision: current.revision + 1 };
      documentsByKey.set(stored, next);
      return next;
    },
    async remove(packageId: string, id: string, expectedRevision: number) {
      const stored = keyOf(packageId, id);
      const current = documentsByKey.get(stored);
      if (!current || current.revision !== expectedRevision) return false;
      documentsByKey.delete(stored);
      return true;
    },
  };

  // ── Card and model doubles ─────────────────────────────────────────────────
  // A card arrives as a JSON *text* column, not an object. Serializing here
  // keeps the double honest about the shape a package actually receives.
  const library = [
    {
      id: "character-hana",
      comment: "Hana",
      data: JSON.stringify({
        name: "Hana",
        description: "{{char}} keeps bees.",
        personality: "Blunt.",
        first_mes: "Mind the bees.",
        tags: ["apiarist"],
      }),
    },
  ];

  /**
   * Every call a villager's conversation asked for, in order.
   *
   * Kept as a list rather than as "the last one" because one thing the player
   * does can be answered by more than one kind of call, and the order they land
   * in is not something a test should depend on.
   */
  const languageModels = {
    async resolveForRequest(request: any) {
      return {
        name: "Fixture connection",
        connectionId: request.connectionId ?? "engine-default",
        model: "fixture-model",
        maxContext: 8192,
        maxOutputTokens: 4096,
        fitContext(messages: any[], options: any) {
          return { messages, maxTokens: options?.maxTokens };
        },
        async chatComplete() {
          return { content: "Rain by evening, I wager.", finishReason: "stop" };
        },
      };
    },
  };

  /** What the Engine would report as this agent's own setup. Rewritten per assertion. */
  let agentConfig: { connectionId: string | null; settings?: Record<string, unknown> } | null = null;

  const resources = {
    async listCharacters(characterIds?: string[]) {
      if (!characterIds) return library.map((card) => ({ ...card }));
      return library.filter((card) => characterIds.includes(card.id)).map((card) => ({ ...card }));
    },
    async listPersonas() {
      return [];
    },
  };

  const logger = { debugOverride() {}, error() {}, info() {}, warn() {}, debug() {} };

  const app = Fastify();
  const registrations: Array<{ prefix: string }> = [];
  const context = {
    app: { db: { select: () => ({ from: () => ({ where: async () => [] }) }) } },
    api: {
      runtime: {
        logger,
        persistence: {
          documents,
          async listChats() {
            return [];
          },
        },
        resources,
        languageModels,
        // `parseJsonish` only, like the live host.
        json: Object.freeze({ parseJsonish: (raw: string) => JSON.parse(raw) }),
        async getAgentConfig() {
          return agentConfig;
        },
        isDebugAgentsEnabled() {
          return false;
        },
      },
      async registerPrivilegedRoutes(routes: any, options: { prefix: string }) {
        registrations.push(options);
        await app.register(routes, { prefix: options.prefix });
        await app.ready();
        return () => {};
      },
      // Activation registers one prompt-context contributor, and the host hands
      // back the way to take it off again. What that block SAYS belongs to the
      // scene suite; here the double only has to carry the member, because an api
      // missing a call the package makes is a host that cannot start it at all.
      registerPromptContext() {
        return () => {};
      },
    },
  } as any;

  const get = (url: string) => app.inject({ method: "GET", url });
  const post = (url: string, payload?: any) => app.inject({ method: "POST", url, payload });
  const put = (url: string, payload?: any) => app.inject({ method: "PUT", url, payload });

  if (process.env.VILLAGES_TEST_PACKAGED) process.argv[1] = join(engineRoot, "packages/server/dist/index.js");
  const deactivate = await activate(context);
  const originalSettings = await get("/api/villages/interpretation-settings");
  assert.equal(originalSettings.json().settings.decisionsEnabled, false);
  assert.equal(originalSettings.json().settings.compareSystem, true);
  const enabled = await app.inject({
    method: "PATCH",
    url: "/api/villages/interpretation-settings",
    payload: { decisionsEnabled: true },
  });
  assert.equal(enabled.json().settings.decisionsEnabled, true);
  if (process.env.VILLAGES_TEST_PACKAGED) {
    assert.equal(
      enabled.json().status.engineBuild,
      "ead04150a132",
      "packaged adapter loaded actual compiled Engine modules",
    );
    assert.equal(enabled.json().status.reason, "No Engine Decision model is selected");
  }
  const malformed = await app.inject({
    method: "PATCH",
    url: "/api/villages/interpretation-settings",
    payload: { decisionsEnabled: "yes" },
  });
  assert.equal(malformed.statusCode, 400);
  await app.inject({
    method: "PATCH",
    url: "/api/villages/interpretation-settings",
    payload: { decisionsEnabled: false },
  });
  assert.deepEqual((await get("/api/villages/interpretation-diagnostics/old-scene")).json(), { checks: [] });
  if (process.env.VILLAGES_TEST_PACKAGED) {
    assert.ok(![...documentsByKey.values()].some((row) => row.kind === "chat"));
    await deactivate();
    await app.close();
    console.log("Villages packaged Decisions adapter: actual Engine modules, storage, no chat, protected routes ok");
    return;
  }

  assert.deepEqual(registrations, [{ prefix: "/api/villages" }], "the package mounts one route prefix and no more");

  // ── The order the three steps are tried in ─────────────────────────────────
  // Driven through the resolver directly rather than through a route, because
  // two of the three purposes have no route yet: only narration is wired to a
  // caller, and the point here is the arithmetic, not the surface.
  assert.deepEqual(
    defaultVillageConnectionSettings(),
    { systemConnectionId: "", narrationConnectionId: "", imageConnectionId: "__villages_image_disabled__" },
    "a new village keeps image generation off until the player explicitly enables it",
  );

  agentConfig = null;
  assert.equal(
    await villagesConnectionIdFor("system"),
    null,
    "an agent that has never been configured asks for the Engine's own default rather than inventing an id",
  );
  assert.equal(await villagesConnectionIdFor("narration"), null);
  assert.equal(await villagesConnectionIdFor("image"), null);
  assert.deepEqual(
    await villagesImageConnectionChoice(),
    { enabled: false, connectionId: null },
    "the disabled image choice does not fall through to an agent or Engine image default",
  );

  agentConfig = { connectionId: "agent-talk", settings: { imageConnectionId: "agent-pictures" } };
  assert.equal(await villagesConnectionIdFor("system"), "agent-talk", "step two is the agent's own connection");
  assert.equal(await villagesConnectionIdFor("narration"), "agent-talk");
  assert.equal(await villagesConnectionIdFor("image"), null, "new villages keep image generation disabled");
  assert.deepEqual(
    await villagesImageConnectionChoice(),
    { enabled: false, connectionId: null },
    "the image choice remains disabled even when the agent has an image default",
  );

  // The empty string is the "Engine default" option, not a choice of a
  // connection whose id happens to be blank — so it must fall THROUGH the
  // second step rather than being handed to the Engine as a real id.
  agentConfig = { connectionId: "agent-talk", settings: { imageConnectionId: "" } };
  assert.equal(await villagesConnectionIdFor("image"), null, "a blank agent image field is not a connection id");

  // ── The choices live in a document of their own ────────────────────────────
  agentConfig = { connectionId: "agent-talk", settings: { imageConnectionId: "agent-pictures" } };

  const fresh = (await get("/api/villages/connections")).json();
  assert.deepEqual(
    fresh,
    { systemConnectionId: "", narrationConnectionId: "", imageConnectionId: "__villages_image_disabled__" },
    "the panel is told that a new village starts with image generation disabled",
  );

  const saved = await put("/api/villages/connections", {
    systemConnectionId: "connection-big",
    narrationConnectionId: "connection-small",
    imageConnectionId: "connection-brush",
  });
  assert.equal(saved.statusCode, 200);
  assert.deepEqual(saved.json(), {
    systemConnectionId: "connection-big",
    narrationConnectionId: "connection-small",
    imageConnectionId: "connection-brush",
  });
  assert.ok(
    createdIds.includes(CONNECTIONS_DOC_ID),
    `the choices are kept in the "${CONNECTIONS_DOC_ID}" document, not in the village record`,
  );

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(JSON.stringify([{ id: "connection-big", provider: "openai" }]), {
      headers: { "content-type": "application/json" },
    });
  try {
    await validateVillageSetupConnections({
      systemConnectionId: "connection-big",
      narrationConnectionId: "connection-big",
      imageConnectionId: "__villages_image_disabled__",
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  // And now step one beats step two, for all three purposes.
  assert.equal(await villagesConnectionIdFor("system"), "connection-big");
  assert.equal(await villagesConnectionIdFor("narration"), "connection-small");
  assert.equal(await villagesConnectionIdFor("image"), "connection-brush");
  assert.deepEqual(
    await villagesImageConnectionChoice(),
    { enabled: true, connectionId: "connection-brush" },
    "an explicit image connection enables image generation",
  );

  // A patch touches only what it carries. A picker that saves one box must not
  // quietly clear the other two.
  const patched = await put("/api/villages/connections", { narrationConnectionId: "connection-tinier" });
  assert.deepEqual(
    patched.json(),
    {
      systemConnectionId: "connection-big",
      narrationConnectionId: "connection-tinier",
      imageConnectionId: "connection-brush",
    },
    "leaving a field out of the patch is not the same as clearing it",
  );

  // ── Starting the village over leaves the choices alone ─────────────────────
  // Asserted on the document's revision rather than on the reply. A reset that
  // rewrote this document with identical values would still read back correctly
  // and would still be wrong, because it would have thrown away the revision a
  // concurrent save was written against.
  const versionBefore = documentsByKey.get(`villages::${CONNECTIONS_DOC_ID}`).revision;
  assert.equal((await post("/api/villages/setup/reset")).statusCode, 200, "the village itself does start over");

  const versionAfter = documentsByKey.get(`villages::${CONNECTIONS_DOC_ID}`).revision;
  assert.equal(versionAfter, versionBefore, "starting the village over does not touch the connection document");
  assert.deepEqual(
    (await get("/api/villages/connections")).json(),
    {
      systemConnectionId: "connection-big",
      narrationConnectionId: "connection-tinier",
      imageConnectionId: "connection-brush",
    },
    "so the player does not have to enter their model choices a second time",
  );

  // ── What the route will and will not store ────────────────────────────────
  // Note the asymmetry: an id that names a connection the agent does not have is
  // ACCEPTED. Whether a connection exists is the Engine's question, asked when
  // the connection is used, and the panel draws an id it cannot find as
  // "Missing" — refusing it here would only make a stale choice un-clearable.
  assert.equal(
    (await put("/api/villages/connections", { systemConnectionId: "connection-that-never-existed" })).statusCode,
    200,
    "the route stores what the panel sends and leaves existence to the Engine",
  );

  assert.equal(
    (await put("/api/villages/connections", { systemConnectionId: "x".repeat(200) })).statusCode,
    400,
    "but a pasted blob is not a connection id",
  );
  assert.equal(
    (await get("/api/villages/connections")).json().systemConnectionId,
    "connection-that-never-existed",
    "a refused save leaves what was already stored exactly as it was",
  );

  // A non-string is coerced rather than rejected, the same way every other
  // patch in this package treats its input: the panel only ever sends strings,
  // and the store's job is to never hold anything else.
  assert.equal(
    (await put("/api/villages/connections", { narrationConnectionId: 42 })).json().narrationConnectionId,
    "",
    "a number is read as 'no choice' rather than as an id",
  );

  assert.equal(
    (await put("/api/villages/connections", { systemConnectionId: "" })).json().systemConnectionId,
    "",
    "clearing a picker back to the Engine default is a save like any other",
  );
  assert.equal(await villagesConnectionIdFor("system"), "agent-talk", "and it falls straight back to the agent");

  // ── A store that hiccuped costs a model choice, not a conversation ────────
  await put("/api/villages/connections", { narrationConnectionId: "connection-small" });
  documentsThrow = true;
  assert.equal(
    await villagesConnectionIdFor("narration"),
    "agent-talk",
    "an unreadable settings document falls through to the agent instead of failing the villager's reply",
  );
  assert.equal(
    (await get("/api/villages/connections")).statusCode,
    500,
    "the panel, unlike a villager, is told that the store is unreachable",
  );
  documentsThrow = false;

  // A cleared narration choice falls back to the agent connection. Venue reply calls use this resolver.
  await put("/api/villages/connections", { narrationConnectionId: "" });
  assert.equal(await villagesConnectionIdFor("narration"), "agent-talk");

  // ── The agent default is only ever read through the resolver ──────────────
  // `villagesAgentConnectionId` is the second step of the chain. A service that
  // called it directly would skip the player's choice entirely, silently, for
  // that one call — which is exactly the bug this rewiring was for. So the
  // accessor is pinned to its two legitimate readers: its own definition, and
  // the resolver that makes up the chain.
  const servicesRoot = join(repoRoot, "packages/villages/src/server");
  for (const relativePath of [
    "features/scenes/chat.ts",
    "features/founding/village-bootstrap.ts",
    "domain/rules/native-remap.ts",
    "features/residents/wishes/wishes.ts",
    "features/world/village.ts",
  ]) {
    const source = await readFile(join(servicesRoot, relativePath), "utf8");
    assert.equal(
      source.includes("villagesAgentConnectionId("),
      false,
      `${relativePath} must ask which connection to use through villagesConnectionIdFor, not for the agent default`,
    );
  }

  // The village still has a document of its own, and it is not the connection
  // document wearing its name — which is the plainest way to say that the two
  // never merged into one record.
  assert.ok(
    [...documentsByKey.keys()].some(
      (stored) => stored.startsWith("villages::") && stored !== `villages::${CONNECTIONS_DOC_ID}`,
    ),
    "the village record is still its own document",
  );

  // The package must not have grown a private Engine import to do any of this.
  // Which connections exist is the Engine's own list and the panel reads it from
  // `/api/connections`; reaching into the connection store would be a second,
  // silently diverging copy of it.
  const boundary = JSON.parse(await readFile(join(repoRoot, "packages/villages/engine-boundary.json"), "utf8"));
  assert.deepEqual(boundary.privateEngineImports, [], "the connection pickers add no private Engine import");

  process.stdout.write("Villages connections regression: order, document, reset, route, call site ok\n");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
