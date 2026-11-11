// Test cases: narration-contract/ordinary, narration-contract/exact-prose, narration-contract/private-keep, narration-contract/independent-failure, narration-contract/authority-shape, narration-contract/initial-closure
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import {
  readContinuityProposal,
  readNarrationEffectHeader,
  readNarrationReply,
} from "../packages/villages/src/server/domain/rules/narration-contract.js";
import { selectSceneEffects } from "../packages/villages/src/server/domain/rules/scene-acceptance.js";

await runCase("narration-contract/ordinary", () => {
  const reply = readNarrationReply(
    { segments: [{ kind: "dialogue", speakerId: "mara", text: "Morning. Would you like the sunny seat?" }] },
    ["mara"],
  );
  assert.equal(reply.segments[0].text, "Morning. Would you like the sunny seat?");
  assert.deepEqual(reply.keep, []);
  assert.deepEqual(reply.commands, []);
  assert.equal(Object.hasOwn(reply, "input"), false);
  assert.throws(() => readNarrationReply({ segments: [], input: [] }, ["mara"]), /input/);
  assert.throws(
    () =>
      readNarrationReply({ segments: [{ kind: "dialogue", speakerId: "player", text: "Invented player speech" }] }, [
        "mara",
        "player",
      ]),
    /cannot invent/,
  );
});

await runCase("narration-contract/exact-prose", () => {
  const text = "  café 👩‍🚀 é\n  a second line.  ";
  const reply = readNarrationReply(
    {
      segments: [
        { kind: "dialogue", speakerId: "mara", text, staging: [{ characterId: "unknown", expression: "worry" }] },
      ],
    },
    ["mara"],
  );
  assert.equal(reply.segments[0].text, text);
  assert.deepEqual(
    (reply.segments[0] as any).staging,
    [],
    "an invalid independent cosmetic cue does not erase dialogue",
  );
  assert.throws(
    () =>
      readNarrationReply(
        { segments: [{ kind: "dialogue", speakerId: "mara", text: "Quiet words", delivery: "whisper" }] },
        ["mara"],
      ),
    /actual target/,
  );
  assert.throws(
    () =>
      readNarrationReply(
        {
          segments: [
            { kind: "narration", text: "First", id: "same" },
            { kind: "narration", text: "Second", id: "same" },
          ],
        },
        ["mara"],
      ),
    /ambiguous/,
  );
});

await runCase("narration-contract/private-keep", () => {
  const note = readContinuityProposal({
    for: ["mara"],
    class: "desire",
    text: "Sail a boat of her own, choosing the destination herself.",
    source: ["self"],
  });
  assert.equal(note.text, "Sail a boat of her own, choosing the destination herself.");
  assert.equal(Object.hasOwn(note, "view"), false);
  assert.throws(
    () => readContinuityProposal({ ...note, view: { title: "A different goal", state: "fulfilled" } }),
    /view/,
  );
  assert.throws(
    () => readContinuityProposal({ for: ["mara"], text: "A private note", source: ["self"], visibility: "concealed" }),
    /cannot mix/,
  );
  assert.throws(
    () =>
      readContinuityProposal({
        for: "room",
        text: "A vase stands on the table.",
        source: ["outcome"],
        class: "desire",
      }),
    /cannot mix/,
  );
  const disclosure = readContinuityProposal({
    for: ["mara"],
    text: "The player reports learning chair repair from Rowan.",
    source: [{ input: "My father Rowan taught me chair repair.", ground: { kind: "spoken", to: ["mara"] } }],
  });
  assert.equal(disclosure.source.length, 1, "only the consequential excerpt needs grounding");
});

await runCase("narration-contract/independent-failure", () => {
  const bad = { id: "note", for: ["mara"], text: 42, source: ["self"], independent: true };
  for (const promised of [false, true]) {
    const reply = readNarrationReply(
      {
        segments: [
          {
            kind: "dialogue",
            speakerId: "mara",
            text: promised ? "I will remember Tawny's address." : "Good morning.",
            ...(promised ? { requires: ["note"] } : {}),
          },
        ],
        keep: [bad],
      },
      ["mara"],
    );
    const results = reply.keep.map((raw, i) => {
      const header = readNarrationEffectHeader(raw, "keep-" + i);
      try {
        readContinuityProposal(raw);
        return header;
      } catch (error) {
        return { ...header, failure: error.message };
      }
    });
    const selected = selectSceneEffects(results, reply.assertedDependencies);
    assert.equal(
      selected.held,
      promised,
      "actual assertion dependencies decide whether a malformed optional note holds the Scene",
    );
    assert.equal(selected.rejected[0].id, "note");
  }
  assert.throws(() => readNarrationEffectHeader({ independent: true, requires: 42 }, "keep-0"), /requires/);
});

await runCase("narration-contract/initial-closure", () => {
  const note = {
    for: ["mara"],
    owner: "mara",
    class: "desire",
    text: "I wanted to share my recipe and have now shared it.",
    retire: "fulfilled",
    current: false,
    source: ["recipe"],
  };
  assert.equal(readContinuityProposal(note).retire, "fulfilled");
  for (const invalid of [
    { ...note, text: undefined },
    { ...note, text: null },
    { ...note, current: true },
    { ...note, offer: { proposer: "mara", participants: ["mara", "player"] } },
    { for: "room", text: "A completed repair.", retire: "ended", source: ["repair"] },
    { ...note, accept: "mara" },
    { ...note, closeOffer: { by: "mara", reason: "withdrawn" } },
  ])
    assert.throws(() => readContinuityProposal(invalid));
});

await runCase("narration-contract/authority-shape", () => {
  const halt = {
    reason: "structure",
    message: "That construction needs a Project.",
    source: [{ input: "I create a bedroom beyond this wall." }],
  };
  assert.ok(readNarrationReply({ segments: [], halt }, ["mara"]).halt);
  assert.throws(
    () =>
      readNarrationReply(
        { segments: [], halt, keep: [{ for: "room", text: "The new bedroom exists.", source: ["outcome"] }] },
        ["mara"],
      ),
    /cannot assert consequential/,
  );
  assert.throws(
    () => readNarrationReply({ segments: [{ kind: "narration", text: "Hello" }], events: [] }, ["mara"]),
    /events/,
  );
  assert.throws(
    () =>
      readContinuityProposal({
        for: ["mara"],
        replace: "offer",
        text: "Changed terms",
        offer: { proposer: "player", participants: ["player", "mara"] },
        source: ["offer-words"],
      }),
    /new offer/,
  );
});

console.log(
  "Narration contract: ordinary prose needs no transcript, consequential sources stay narrow, independent failures preserve coherent fiction and old domain metadata is rejected.",
);
