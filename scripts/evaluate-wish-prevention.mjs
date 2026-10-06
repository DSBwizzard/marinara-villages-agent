// Explicit paid evaluation only with --live; durable journal caps this run at 16 requests.
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createDecipheriv } from "node:crypto";
import { execFileSync } from "node:child_process";
async function main() {
  const root = process.cwd();
  const engine = process.env.MARINARA_ENGINE_ROOT;
  if (!engine) throw new Error("Set MARINARA_ENGINE_ROOT.");
  const probes = process.argv.includes("--sizing-probes");
  const live = process.argv.includes("--live") || probes;
  const output = resolve("artifacts/wish-prevention-evaluation");
  await mkdir(output, { recursive: true });
  const baseline = resolve(".tmp/wish-prevention-baseline");
  await mkdir(baseline, { recursive: true });
  const archive = execFileSync("git", ["archive", "ff53391", "packages/villages/src"], { maxBuffer: 16 * 1024 * 1024 });
  execFileSync("tar", ["-xf", "-", "-C", baseline], { input: archive });
  const data = join(engine, "packages/server/data");
  const readDoc = async (file) => {
    const raw = JSON.parse(await readFile(file, "utf8"));
    const row = Array.isArray(raw) ? raw[0] : raw;
    return typeof row.data === "string" ? JSON.parse(row.data) : row.data;
  };
  const settings = await readDoc(join(data, "storage/tables/capability_documents/villages-connections.json"));
  let connection;
  for (const file of await readdir(join(data, "storage/tables/api_connections"))) {
    if (!file.endsWith(".json")) continue;
    const raw = JSON.parse(await readFile(join(data, "storage/tables/api_connections", file), "utf8"));
    const row = Array.isArray(raw) ? raw[0] : raw;
    if (row.id === settings.systemConnectionId) {
      connection = row;
      break;
    }
  }
  if (connection?.provider !== "custom")
    throw new Error("This evaluated adapter requires the configured custom connection.");
  const networkFetch = globalThis.fetch;
  const attemptsFile = join(output, "attempts.json");
  let attempts = [];
  try {
    attempts = JSON.parse(await readFile(attemptsFile, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (attempts.length && !(probes && attempts.length === 12))
    throw new Error("Evaluation already reserved requests; inspect its report instead of repeating paid work.");
  let caseRequests = 0,
    label = "",
    maxTokens = 0;
  globalThis.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    if (!live) throw new Error("Preparation never makes network requests.");
    if (
      url.origin !== new URL(connection.baseUrl).origin ||
      init?.method !== "POST" ||
      !/\/(?:chat\/completions|responses)$/.test(url.pathname)
    )
      throw new Error("Evaluation blocks non-model network access.");
    if (caseRequests >= 1 || attempts.length >= 16)
      throw new Error("Evaluation request allowance exhausted; no automatic retries.");
    caseRequests++;
    attempts.push({ label, maxTokens, startedAt: /* @__PURE__ */ new Date().toISOString(), status: "unknown" });
    await writeFile(attemptsFile, JSON.stringify(attempts, null, 2));
    return networkFetch(input, {
      ...init,
      signal: AbortSignal.any([init.signal ?? AbortSignal.timeout(12e4), AbortSignal.timeout(12e4)]),
    });
  };
  let provider;
  if (live) {
    const override =
      process.env.ENCRYPTION_KEY ||
      (await readFile(join(engine, ".env"), "utf8"))
        .match(/^ENCRYPTION_KEY=(.+)$/m)?.[1]
        ?.trim()
        .replace(/^["']|["']$/g, "");
    const key = override || (await readFile(join(data, ".encryption-key"), "utf8")).trim();
    const [iv, encrypted, tag] = connection.apiKeyEncrypted.split(":");
    const decipher = createDecipheriv("aes-256-gcm", Buffer.from(key, "hex"), Buffer.from(iv, "hex"));
    decipher.setAuthTag(Buffer.from(tag, "hex"));
    const apiKey = Buffer.concat([decipher.update(Buffer.from(encrypted, "hex")), decipher.final()]).toString("utf8");
    if (
      connection.model !== "claude-opus-4-6" ||
      (connection.defaultParameters && connection.defaultParameters !== "{}")
    )
      throw new Error("Reinspect adapter compatibility for a changed connection.");
    provider = {
      async chatComplete(messages, options) {
        const response = await fetch(connection.baseUrl.replace(/\/+$/, "") + "/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + apiKey },
          body: JSON.stringify({
            model: connection.model,
            messages,
            stream: false,
            max_tokens: options.maxTokens,
            ...(options.reasoningEffort ? { reasoning_effort: options.reasoningEffort } : {}),
          }),
          signal: options.signal,
        });
        if (!response.ok) throw new Error("Model HTTP " + response.status);
        const json = await response.json();
        await writeFile(join(output, "response-" + attempts.length + ".json"), JSON.stringify(json, null, 2));
        const choice = json.choices?.[0];
        if (!choice) throw new Error("Model response missing choices");
        const content = Array.isArray(choice.message?.content)
          ? choice.message.content
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("")
          : choice.message?.content;
        return {
          content: content ?? null,
          finishReason: choice.finish_reason,
          ...(json.usage
            ? {
                usage: {
                  inputTokens: json.usage.prompt_tokens,
                  outputTokens: json.usage.completion_tokens,
                  totalTokens: json.usage.total_tokens,
                  reasoningTokens: json.usage.completion_tokens_details?.reasoning_tokens,
                },
              }
            : {}),
        };
      },
    };
  }
  const at = "2026-10-03T22:00:00.000Z";
  const baseContext = (actorId, wish, player, reply) => ({
    actorId,
    village: "Abandoned mall village",
    setting: "A settled community in an abandoned mall.",
    moment: {},
    card: { name: actorId },
    playerName: "Player",
    playerDescription: "A resident",
    claim: "Check new witnessed evidence",
    wishes: [
      { id: "wish-" + actorId, wish, intensity: 1, tell: "", addedAt: "2026-10-01T00:00:00.000Z", expiresAt: "" },
    ],
    evidence: [
      { id: "line-player-" + actorId, speakerId: "player", name: "Player", content: player, current: true, at },
      { id: "line-reply-" + actorId, speakerId: actorId, name: actorId, content: reply, current: true, at },
    ],
    receipts: [],
    transcript: [],
    happenings: [],
    memory: [],
    worldState: [],
  });
  const cases = [
    {
      id: "recognition",
      contexts: [
        baseContext(
          "Ganondorf",
          "Have the villagers recognize my authority over the food court",
          "Ganondorf, I recognize your authority over the food court.",
          "Then we understand each other.",
        ),
      ],
      allowed: [["fulfilled"]],
    },
    {
      id: "physical-plan",
      contexts: [
        baseContext(
          "Sneak",
          "Produce a complete map of the mall passages",
          "I promise to map the passages tomorrow.",
          "That would help.",
        ),
      ],
      allowed: [["none"]],
    },
    {
      id: "compound-progress",
      contexts: [
        baseContext(
          "Aqua",
          "Repair the bridge and agree on an opening day",
          "Let's open the bridge on Saturday after repairs are complete.",
          "Saturday is agreed. The repairs still need doing.",
        ),
      ],
      allowed: [["progress"]],
    },
    {
      id: "ambiguous",
      contexts: [
        baseContext(
          "Aqua",
          "Agree with the player on a planting day",
          "That day might work, unless you mean the other one.",
          "I'm not sure which day you mean.",
        ),
      ],
      allowed: [["none", "unresolved"]],
    },
    {
      id: "compound-conversation",
      contexts: [
        baseContext(
          "Sneak",
          "Discuss gardening and agree on a planting day",
          "I'd like to grow basil. Saturday would be a good planting day.",
          "Basil sounds good. Saturday works for me.",
        ),
      ],
      allowed: [["fulfilled"]],
    },
    {
      id: "unsupported-claim",
      contexts: [
        baseContext(
          "Aqua",
          "Find a high vantage point inside the mall",
          "Trust me, I found a balcony for you.",
          "You haven't shown me where it is.",
        ),
      ],
      allowed: [["none"]],
    },
    {
      id: "private-batch",
      contexts: [
        baseContext("Aqua", "Agree on a planting day", "Saturday works for planting.", "I agree."),
        baseContext(
          "Sneak",
          "Discuss the mall's history",
          "The mall was founded in 1980.",
          "Tell me more about its history.",
        ),
        baseContext(
          "Ganondorf",
          "Have the player recognize my authority over the food court",
          "We should talk about the weather.",
          "The weather is cold.",
        ),
        baseContext("Mara", "Agree on a reading day", "Friday is a good reading day.", "Friday works."),
      ],
      allowed: [["fulfilled"], ["fulfilled", "progress"], ["none"], ["fulfilled"]],
    },
  ];
  const initialReport = {
    baseline: "0.6.144 / ff53391",
    candidate: "0.6.145",
    model: connection.model,
    mode: live ? "live" : "preparation",
    rows: [],
  };
  const report = probes ? JSON.parse(await readFile(join(output, "report.json"), "utf8")) : initialReport;
  for (const arm of probes ? ["candidate-sizing-probe"] : ["baseline", "candidate"]) {
    const armRoot = arm === "baseline" ? baseline : root;
    const modern = existsSync(join(armRoot, "packages/villages/src/server/entry/runtime.ts"));
    const paths = {
      "package-runtime": "entry/runtime",
      "village-store": "features/world/village-store",
      "wish-interpretation": "features/residents/wishes/wish-interpretation",
      "wish-lifecycle": "features/residents/wishes/wish-lifecycle",
      "background-work": "jobs/background-work",
      "agenda-plan": "domain/rules/agenda-plan",
      "wish-policy": "domain/rules/wish-policy",
    };
    const dir = join(
      armRoot,
      modern ? "packages/villages/src/server" : "packages/villages/src/engine/packages/server/src/services/villages",
    );
    const load = async (name) => import(pathToFileURL(join(dir, (modern ? paths[name] : name) + ".ts")).href);
    const runtime = await load("package-runtime"),
      store = await load("village-store"),
      interpretation = await load("wish-interpretation");
    const records = /* @__PURE__ */ new Map();
    records.set("villages-connections", { id: "villages-connections", data: settings, revision: 1 });
    let completions = [];
    const languageModel = {
      name: "Bounded custom HTTP adapter",
      model: connection.model,
      connectionId: connection.id,
      maxContext: connection.maxContext,
      maxOutputTokens: probes ? 4096 : connection.maxTokensOverride,
      fitContext(messages, options) {
        return { messages, ...options };
      },
      async chatComplete(messages, options) {
        if (probes) options = { ...options, maxTokens: 4096 };
        maxTokens = options.maxTokens;
        const start = performance.now();
        const answer = live
          ? await provider.chatComplete(messages, { ...options, model: connection.model, debugMode: false })
          : {
              finishReason: "stop",
              content: messages[0].content.startsWith("Propose")
                ? '{"wish":null}'
                : JSON.stringify({
                    results: JSON.parse(messages[1].content).checks.map((c) => ({
                      id: c.id,
                      outcome: "none",
                      evidenceIds: [],
                      reason: "Preparation only",
                    })),
                  }),
            };
        completions.push({
          finishReason: answer.finishReason,
          maxTokens,
          usage: answer.usage,
          elapsedMs: Math.round(performance.now() - start),
        });
        if (live) {
          attempts.at(-1).status = "complete";
          await writeFile(attemptsFile, JSON.stringify(attempts, null, 2));
        }
        return answer;
      },
    };
    const release = runtime.configureVillagesRuntime({
      getAgentConfig: async () => null,
      logger: { debug() {}, debugOverride() {}, info() {}, warn() {}, error() {} },
      persistence: {
        documents: {
          async getById(_p, id) {
            return structuredClone(records.get(id) ?? null);
          },
          async list(_p, kind) {
            return structuredClone([...records.values()].filter((r) => r.kind === kind));
          },
          async create(value) {
            const row = { ...structuredClone(value), revision: 1 };
            records.set(value.id, row);
            return structuredClone(row);
          },
          async update(value) {
            const old = records.get(value.id);
            if (!old || old.revision !== value.expectedRevision) return null;
            const row = { ...old, ...structuredClone(value), revision: old.revision + 1 };
            records.set(value.id, row);
            return structuredClone(row);
          },
          async remove(_p, id) {
            return records.delete(id);
          },
        },
      },
      languageModels: {
        async resolveForRequest() {
          return languageModel;
        },
        async resolve() {
          return languageModel;
        },
      },
    });
    try {
      for (const fixture of probes
        ? cases.filter((c) => ["recognition", "compound-progress", "ambiguous", "private-batch"].includes(c.id))
        : cases) {
        label = arm + ":" + fixture.id;
        caseRequests = 0;
        completions = [];
        try {
          const batch = await interpretation.interpretWishBatch(
            structuredClone(fixture.contexts),
            "evaluation",
            fixture.id,
          );
          report.rows.push({
            arm,
            case: fixture.id,
            requests: caseRequests,
            completions,
            outcomes: batch.results.map((r) => r.outcome),
            failures: batch.results.map((r) => r.failure ?? null),
            reasons: batch.results.map((r) => r.reason),
            correct:
              completions.every((c) => !["length", "max_tokens"].includes(c.finishReason)) &&
              batch.results.every((r, i) => !r.failure && fixture.allowed[i].includes(r.outcome)),
          });
        } catch (error) {
          report.rows.push({
            arm,
            case: fixture.id,
            requests: caseRequests,
            completions,
            correct: false,
            error: error.name,
          });
        }
        await writeFile(join(output, "report.json"), JSON.stringify(report, null, 2));
        console.log(label + " " + JSON.stringify(report.rows.at(-1)));
      }
      if (probes) continue;
      label = arm + ":daily-wish";
      caseRequests = 0;
      completions = [];
      const lifecycle = await load("wish-lifecycle"),
        work = await load("background-work"),
        agenda = await load("agenda-plan"),
        policy = await load("wish-policy");
      const state = store.defaultVillageState();
      state.seed = "evaluation";
      state.setupAt = state.foundedAt = "2026-09-20T22:00:00.000Z";
      state.storyPace = "balanced";
      state.villagers = [
        {
          characterId: "Ganondorf",
          addedAt: at,
          cardSnapshot: {
            id: "Ganondorf",
            name: "Ganondorf",
            capturedAt: at,
            revision: 1,
            sourceStatus: "available",
            summary: "A proud strategist living with other residents in an abandoned mall.",
            description: "Commands attention, plans carefully.",
            personality: "Confident, ambitious, pragmatic.",
            tags: [],
          },
          completedWishes: [],
          wishLifecycle: policy.newWishLifecycle(),
          agenda: {
            ...agenda.unwrittenVillageAgenda(state.venues, "Ganondorf"),
            personalizationPending: false,
            generatedAt: at,
            activeDay: null,
          },
        },
      ];
      records.set("villages-village", { id: "villages-village", kind: "village", data: state, revision: 1 });
      const stop = work.startBackgroundWork();
      try {
        await work.villageBackgroundPresence("evaluation", true);
        await lifecycle.reconcileWishLifecycle(new Date(at), false, () => new Date(at));
        await work.settleBackgroundWork();
        const jobs = await work.backgroundWorkSummaries();
        report.rows.push({
          arm,
          case: "daily-wish",
          requests: caseRequests,
          completions,
          jobs,
          correct:
            completions.every((c) => !["length", "max_tokens"].includes(c.finishReason)) &&
            jobs.some((j) => j.kind === "wish" && j.status === "completed"),
        });
      } catch (error) {
        report.rows.push({
          arm,
          case: "daily-wish",
          requests: caseRequests,
          completions,
          correct: false,
          error: error.name,
        });
      } finally {
        stop();
      }
      await writeFile(join(output, "report.json"), JSON.stringify(report, null, 2));
      console.log(label + " " + JSON.stringify(report.rows.at(-1)));
    } finally {
      release();
    }
  }
  console.log("Completed " + attempts.length + " model requests; Engine storage was read only.");
}
void main().catch((error) => {
  console.error(error.name + ": " + error.message);
  process.exitCode = 1;
});
