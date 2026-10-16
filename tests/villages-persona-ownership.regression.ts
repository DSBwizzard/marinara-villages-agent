import assert from "node:assert/strict";
import Fastify from "fastify";
import type { VillagePersona } from "../packages/villages/src/server/domain/models/world.js";
import {
  MAX_PLAYER_PERSONA_IDENTITY_LENGTH,
  MAX_PLAYER_PERSONA_NAME_LENGTH,
} from "../packages/villages/src/server/domain/rules/prompt-preset.js";
import {
  createActivationScope,
  installDefaultActivation,
  scopedActivation,
} from "../packages/villages/src/server/adapters/engine/activation-scope.js";
import { createPersonaQueries } from "../packages/villages/src/server/features/settings/persona-service.js";
import {
  configurePersonaQueries,
  readLinkedPersona,
  buildVillagePersonaCatalog,
  readVillagePersonaPreview,
} from "../packages/villages/src/server/features/settings/personas.js";
import { registerPersonaRoutes } from "../packages/villages/src/server/features/settings/routes.js";

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture(name: string) {
  const persona: VillagePersona = {
    id: "same",
    name,
    identity: `private ${name}`,
    summary: `summary ${name}`,
    description: `description ${name}`,
    appearance: "appearance",
    personality: "personality",
    backstory: "backstory",
    isActive: true,
    avatarPath: null,
    avatarCrop: null,
  };
  const calls: string[] = [],
    owners: unknown[] = [],
    gate = deferred(),
    entered = deferred();
  let pause = false,
    wrongRecord = false;
  const service = createPersonaQueries({
    async listPlayerPersonas() {
      calls.push("list");
      owners.push(scopedActivation());
      return [structuredClone(persona)];
    },
    async findPlayerPersona(id) {
      calls.push(id);
      owners.push(scopedActivation());
      if (pause) {
        pause = false;
        entered.resolve();
        await gate.promise;
        owners.push(scopedActivation());
      }
      return wrongRecord ? { ...persona, id: "different" } : id === persona.id ? structuredClone(persona) : null;
    },
  });
  assert.deepEqual(calls, [], "inert construction does not read a library");
  return {
    service,
    persona,
    calls,
    owners,
    gate,
    entered,
    pause() {
      pause = true;
    },
    returnWrongRecord() {
      wrongRecord = true;
    },
  };
}
const a = fixture("A"),
  b = fixture("B");
assert.deepEqual(await a.service.readLinkedPersona(" same "), { id: "same", name: "A", identity: "private A" });
assert.deepEqual(await b.service.readLinkedPersona("same"), { id: "same", name: "B", identity: "private B" });
const catalog = await a.service.buildVillagePersonaCatalog();
assert.deepEqual(Object.keys(catalog[0]!).sort(), ["avatarCrop", "avatarPath", "id", "isActive", "name", "summary"]);
assert(!JSON.stringify(catalog).includes("private A"));
const preview = await a.service.readVillagePersonaPreview("same");
assert.equal(preview?.description, "description A");
assert(preview && !Object.hasOwn(preview, "identity") && !Object.hasOwn(preview, "summary"));
assert.equal(await a.service.readVillagePersonaPreview("missing"), null);
const readsBeforeInvalid = a.calls.length;
await assert.rejects(a.service.readLinkedPersona(null), /must be an id/);
await assert.rejects(a.service.readLinkedPersona(" "), /Choose a Persona/);
assert.equal(a.calls.length, readsBeforeInvalid, "invalid input is rejected before library access");
await assert.rejects(a.service.readLinkedPersona("missing"), /no longer/);
a.persona.name = "a".repeat(MAX_PLAYER_PERSONA_NAME_LENGTH + 10);
a.persona.identity = "b".repeat(MAX_PLAYER_PERSONA_IDENTITY_LENGTH + 10);
assert.equal((await a.service.readLinkedPersona("same")).name.length, MAX_PLAYER_PERSONA_NAME_LENGTH);
assert.equal((await a.service.readLinkedPersona("same")).identity.length, MAX_PLAYER_PERSONA_IDENTITY_LENGTH);
a.returnWrongRecord();
assert.equal(
  await a.service.readVillagePersonaPreview("same"),
  null,
  "preview never exposes a fallback record for another id",
);

const one = createActivationScope(),
  two = createActivationScope();
const first = fixture("first"),
  second = fixture("second");
const releaseFirst = one.run(() => configurePersonaQueries(first.service));
const releaseSecond = two.run(() => configurePersonaQueries(second.service));
const clearFirst = installDefaultActivation(one, () => {});
first.pause();
const pending = readLinkedPersona("same");
await first.entered.promise;
const clearSecond = installDefaultActivation(two, () => {});
assert.equal((await readLinkedPersona("same")).identity, "private second");
first.gate.resolve();
assert.equal((await pending).identity, "private first");
assert(first.owners.every((owner) => owner === one));
assert(second.owners.every((owner) => owner === two));
one.run(releaseFirst);
one.dispose();
clearFirst();
assert.equal((await buildVillagePersonaCatalog())[0]!.name, "second");
const app = Fastify();
try {
  registerPersonaRoutes(app);
  const catalogResponse = await app.inject({ method: "GET", url: "/personas" });
  assert.equal(catalogResponse.statusCode, 200);
  assert.equal(catalogResponse.json().personas[0].name, "second");
  assert(!catalogResponse.body.includes("private second"));
  const previewResponse = await app.inject({ method: "GET", url: "/personas/same" });
  assert.equal(previewResponse.statusCode, 200);
  assert.equal(previewResponse.json().persona.description, "description second");
  assert(!previewResponse.body.includes("private second"));
  assert.equal((await app.inject({ method: "GET", url: "/personas/missing" })).statusCode, 404);
} finally {
  await app.close();
}
const missing = createActivationScope();
await assert.rejects(
  missing.run(() => readVillagePersonaPreview("same")),
  /not configured/,
);
two.run(releaseSecond);
two.dispose();
clearSecond();
await assert.rejects(
  two.run(() => readLinkedPersona("same")),
  /not configured/,
);
console.log(
  "Persona query ownership: independent libraries, delayed dispatch, bounded identity, public projections, preview id guard and route wiring passed (mocked catalogs).",
);
