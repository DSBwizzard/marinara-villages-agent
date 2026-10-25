import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import assert from "node:assert/strict";
import { createImageGeneration } from "../packages/villages/src/server/features/media/image-generation-service.js";
import { coerceVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
const custom = {
  id: "my-ink",
  name: "My ink",
  styleText: "Hand drawn ink",
  positiveTags: "crosshatching",
  negativeTags: "glossy",
};
let settings: unknown = { defaultProfileId: custom.id, profiles: [custom] };
const calls: any[] = [];
let reads = 0;
const service = createImageGeneration({
  villageEngineJson: async (path: string, init?: any) => {
    if (path === "/api/app-settings/ui") {
      reads++;
      return {
        value: JSON.stringify({ imageStyleProfiles: settings, unrelatedPrivateSetting: "must not leave server" }),
      } as any;
    }
    assert.equal(path, "/api/characters/avatar-generation");
    calls.push(init.body);
    return { image: "synthetic" } as any;
  },
  villagesImageConnectionChoice: async () => ({ enabled: true, connectionId: "images" }),
  decodeVillageImageDataUrl: (() => ({ dataUrl: "synthetic" })) as any,
  loadEngineImageStyleSupport: async () => ({
    normalizeImageStyleProfileSettings: (raw: any) => ({
      defaultProfileId: raw?.defaultProfileId || "auto",
      profiles: [{ id: "auto", name: "Auto" }, ...(raw?.profiles || [])],
    }),
    compileImagePrompt: (input: any) => {
      assert.equal(input.kind, "background");
      assert.equal(input.omitProfileSubjectTags, true);
      const profile = input.styleProfiles.profiles.find((row: any) => row.id === input.styleProfileId);
      return {
        prompt: [input.prompt, profile.styleText, profile.positiveTags].filter(Boolean).join("\n"),
        negativePrompt: [input.hardNegative, profile.negativeTags].filter(Boolean).join(", "),
      };
    },
  }),
});
const catalog = await service.readVillageImageStyleCatalog();
assert.deepEqual(catalog, {
  defaultProfileId: "my-ink",
  profiles: [
    { id: "auto", name: "Auto" },
    { id: "my-ink", name: "My ink" },
  ],
});
assert.doesNotMatch(JSON.stringify(catalog), /PrivateSetting|Hand drawn|glossy/);
const input = {
  name: "Village map",
  prompt: "Map geometry stays complete.",
  negativePrompt: "people, labels",
  width: 1536,
  height: 1024,
  maxBase64Length: 8000000,
};
await service.generateVillageImage({ ...input, sceneryStyleProfileId: "" });
assert.match(calls[0].promptOverrides[0].prompt, /Map geometry stays complete.*Hand drawn ink.*crosshatching/s);
assert.match(calls[0].promptOverrides[0].negativePrompt, /people, labels, glossy/);
assert.equal(calls.length, 1, "one paid dispatch per request");
const before = reads;
await service.generateVillageImage({ ...input, sceneryStyleProfileId: null });
assert.equal(reads, before, "legacy/custom descriptions don't need profile support");
assert.equal(calls[1].promptOverrides[0].prompt, input.prompt);
await assert.rejects(
  service.generateVillageImage({ ...input, sceneryStyleProfileId: "removed" }),
  /no longer available/,
);
await assert.rejects(service.generateVillageImage({ ...input, sceneryStyleProfileId: "../secret" }), /Choose/);
assert.equal(calls.length, 2, "invalid profiles do not dispatch");
settings = null;
assert.deepEqual(await service.readVillageImageStyleCatalog(), {
  defaultProfileId: "auto",
  profiles: [{ id: "auto", name: "Auto" }],
});
await service.generateVillageImage({ ...input, sceneryStyleProfileId: "" });
settings = { defaultProfileId: "my-ink", profiles: [{ ...custom, styleText: "x".repeat(11000) }] };
await service.generateVillageImage({ ...input, prompt: "z".repeat(4000), sceneryStyleProfileId: "" });
assert.ok(
  calls.at(-1).promptOverrides[0].prompt.includes("z".repeat(4000)),
  "profile has separate allowance from authored source",
);
settings = { defaultProfileId: "my-ink", profiles: [{ ...custom, styleText: "x".repeat(17000) }] };
await assert.rejects(service.generateVillageImage({ ...input, sceneryStyleProfileId: "" }), /too long/);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), version: 4, sceneryArtStyle: "Legacy authored style" })
    .sceneryStyleProfileId,
  null,
);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), version: 4, sceneryStyleProfileId: "my-ink" }).sceneryStyleProfileId,
  "my-ink",
);
assert.equal(
  coerceVillageState({ ...defaultVillageState(), version: 4, sceneryStyleProfileId: "" }).sceneryStyleProfileId,
  "",
);
console.log(
  "Engine image style catalog, privacy, selection, persistence, prompt override and dispatch limits passed; synthetic provider only.",
);
