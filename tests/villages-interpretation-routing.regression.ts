import assert from "node:assert/strict";
import { routeInterpretationChecks } from "../packages/villages/src/server/features/generation/interpretation-routing.js";
import type { InterpretationCheck } from "../packages/villages/src/server/domain/models/interpretation-check-model.js";
const context = { actorIds: ["a", "b"] };
function check(domain: "room" | "project" = "room", text = "I like the autumn weather."): InterpretationCheck {
  return {
    id: "c",
    domain,
    question: "Meaning?",
    facts: {
      actorId: "a",
      zoneId: domain === "room" ? "private" : undefined,
      projectId: domain === "project" ? "p" : undefined,
    },
    outcomes: [{ id: "invite-now", statement: "permission" }],
    evidence: [{ id: "draft:0", speakerId: "a", name: "A", current: true, content: text, kind: "dialogue" }],
  };
}
const irrelevant = [{ actorId: "a", domain: "room", relevance: "irrelevant", targetIds: [], segments: [0] }];
const select = (c = check(), raw: unknown = irrelevant, ctx = context) => routeInterpretationChecks([c], raw, ctx);
assert.equal(select().checks.length, 0);
for (const raw of [
  null,
  {},
  [],
  [{ ...irrelevant[0], relevance: "uncertain" }],
  [{ ...irrelevant[0], segments: [] }],
  [{ ...irrelevant[0], segments: [0, 1] }],
  irrelevant.concat(irrelevant),
  [{ ...irrelevant[0], actorId: "unknown" }],
  [{ ...irrelevant[0], targetIds: ["private"] }],
  [{ ...irrelevant[0], relevance: "potential", targetIds: ["unknown"] }],
])
  assert.equal(select(check(), raw).checks.length, 1);
assert.equal(
  select(check(), [{ ...irrelevant[0], relevance: "potential", targetIds: ["private"] }]).checks.length,
  1,
  "a possible event still needs authoritative checking",
);
assert.equal(
  select(check(), irrelevant.concat([{ ...irrelevant[0], actorId: "b" }])).checks.length,
  0,
  "valid rows for other active speakers do not force a fallback",
);
for (const text of [
  "Sure.",
  "No.",
  "Maybe later.",
  "Leave me alone.",
  "Only joking; come into my room tomorrow.",
  "She nods and gestures toward the doorway.",
]) {
  const c = check("room", text);
  c.evidence.unshift({ id: "player-input", speakerId: "player", name: "Player", content: "May I visit?" });
  assert.equal(select(c).checks.length, 1, text);
}
const unwitnessed = check();
assert.equal(select(unwitnessed).checks.length, 0, "unwitnessed player requests cannot become shared routing evidence");
const pending = { ...check(), essentialEvidenceIds: ["old"] };
assert.equal(select(pending).checks.length, 1);
const projectRow = [{ ...irrelevant[0], domain: "project" }];
assert.equal(select(check("project"), projectRow).checks.length, 0);
for (const text of [
  "I approve.",
  "If you bring wood, I can build it.",
  "I repaired the frame.",
  "We need a better finish.",
])
  assert.equal(select(check("project", text), projectRow).checks.length, 1);
assert.equal(
  select({ ...check("project"), facts: { actorId: "a", projectId: "p", kind: "requirements" } }, projectRow).checks
    .length,
  1,
);
assert.equal(select(check("project"), projectRow, { ...context, projectActors: ["a"] }).checks.length, 1);
for (const residents of [1, 4, 8]) {
  const checks = Array.from({ length: residents }, (_, i) => ({
    ...check(),
    id: "c" + i,
    facts: { actorId: String(i), zoneId: "private" },
    evidence: [{ ...check().evidence[0], speakerId: String(i), id: "draft:" + i }],
  }));
  const routing = checks.map((c, i) => ({
    actorId: String(i),
    domain: "room",
    relevance: "irrelevant",
    targetIds: [],
    segments: [i],
  }));
  assert.equal(
    routeInterpretationChecks(checks, routing, {
      actorIds: checks.map((c) => String((c.facts as { actorId: string }).actorId)),
    }).checks.length,
    0,
  );
}
console.log("Conservative narration routing: irrelevant skipped; ambiguous, witnessed and pending events retained");

async function integration() {
  const { configureVillagesRuntime } = await import("../packages/villages/src/server/entry/runtime.js");
  const { defaultVillageState } = await import("../packages/villages/src/server/features/world/village-store.js");
  const { interpretProjectDraft } = await import("../packages/villages/src/server/features/projects/project-checks.js");
  const records = new Map<string, any>();
  let calls = 0;
  const release = configureVillagesRuntime({
    persistence: {
      documents: {
        async getById(_p: string, id: string) {
          return records.get(id) ?? null;
        },
        async create(value: any) {
          const row = { ...value, revision: 1 };
          records.set(value.id, row);
          return row;
        },
        async update(value: any) {
          const row = { ...value, revision: (records.get(value.id)?.revision ?? 0) + 1 };
          records.set(value.id, row);
          return row;
        },
      },
    },
    languageModels: {
      async resolveForRequest() {
        return {
          model: "mock",
          connectionId: "mock",
          maxOutputTokens: 5000,
          maxContext: 32000,
          fitContext(messages: any, options: any) {
            return { messages, ...options };
          },
          async chatComplete() {
            calls++;
            return { content: '{"checks":[]}' };
          },
        };
      },
    },
  } as any);
  const fetchBefore = globalThis.fetch;
  globalThis.fetch = async () => new Response("[]");
  try {
    const state = defaultVillageState();
    state.villagers = [{ characterId: "a", cardSnapshot: { name: "A" } }] as any;
    state.projects = [
      { id: "p", title: "Garden", status: "draft", lifecycle: { phase: "builder", affectedIds: [], requirements: [] } },
    ] as any;
    state.progressTasks = [
      { definition: { owner: { kind: "project", id: "p" }, revision: 1 }, transitions: [], resolvedAt: "" },
    ] as any;
    const scene: any = {
      id: "scene",
      activeIds: ["a"],
      lines: [],
      participants: [],
      submissions: [],
      zoneId: "outside",
    };
    const draft: any[] = [{ speakerId: "a", kind: "dialogue", content: "I like the autumn weather.", heardBy: ["a"] }];
    assert.equal(
      await interpretProjectDraft(scene, state, "Lovely weather today.", draft, ["a"], "one", projectRow),
      null,
    );
    assert.equal(calls, 0, "explicit irrelevant routing makes zero verification requests");
    await interpretProjectDraft(scene, state, "Lovely weather today.", draft, ["a"], "two");
    assert.equal(calls, 0, "Unrelated exchanges without routing are locally irrelevant");
    assert.equal(records.size, 0, "Local relevance skips create no interpretation records");
    await interpretProjectDraft(
      scene,
      state,
      "Will you build Garden?",
      [{ ...draft[0], content: "Yes, I will build it." }],
      ["a"],
      "three",
    );
    assert.equal(calls, 1, "Relevant implicit commitments without routing retain authoritative interpretation");
    assert.ok(records.size > 0, "Relevant checks retain bounded diagnostics");
  } finally {
    release();
    globalThis.fetch = fetchBefore;
  }
}
void integration();
