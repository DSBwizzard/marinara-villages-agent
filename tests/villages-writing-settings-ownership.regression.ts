import assert from "node:assert/strict";
import { withSettingsOwners } from "./fixtures/villages-settings-owner.fixture.js";
import {
  readVillageWriting,
  saveVillageWriting,
} from "../packages/villages/src/server/features/settings/narration-settings.js";

await withSettingsOwners(async (a, b, selectB) => {
  const paused = a.pause("update", "villages-village");
  const pending = saveVillageWriting({ writingGuidance: "  authored A  " });
  await paused.wait(pending);
  selectB();
  assert.equal((await readVillageWriting()).writingGuidance, "B writing");
  const bCalls = b.calls.length;
  paused.resume();
  await pending;
  assert.equal((await a.owner.run(() => readVillageWriting())).writingGuidance, "authored A");
  assert.equal(b.calls.length, bCalls);
  await assert.rejects(
    a.owner.run(() => saveVillageWriting({ tense: "future" })),
    /Choose present or past tense/,
  );
  a.owner.run(a.release);
  await assert.rejects(
    a.owner.run(() => readVillageWriting()),
    /writing settings are not configured/,
  );
  assert.equal((await readVillageWriting()).writingGuidance, "B writing");
});
