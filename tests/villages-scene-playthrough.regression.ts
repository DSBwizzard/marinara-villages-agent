// Test cases: scene-playthrough/sfw, scene-playthrough/nsfw
import assert from "node:assert/strict";
import { runCase } from "../scripts/test-cases.mjs";
import { continuityRelationships } from "../packages/villages/src/server/domain/rules/continuity-library.js";
import { fixtureVillageState } from "./helpers/village-storage.fixture.js";
import { packagedSceneServer } from "./fixtures/packaged-scene-server.fixture.js";
import { configureSceneCostWorld } from "./fixtures/scene-cost.fixture.js";
import { sceneResend } from "../packages/villages/src/client/features/scenes/villages-venue-send.js";

const dialogue = (text: string) => ({ id: "line", kind: "dialogue", speakerId: "mara", text });
const reply = (text: string) => ({ segments: [dialogue(text)] });
const narration = (text: string) => ({ id: "beat", kind: "narration", text });
const inputEvidence = (input: string, kind = "spoken") => ({ input, ground: { kind, to: ["mara"] } });
const ratingLines = { sfw: /\bSFW: Mature themes/, nsfw: /\bNSFW: Explicit adult intimacy/ };

for (const rating of ["sfw", "nsfw"] as const)
  await runCase(`scene-playthrough/${rating}`, async () => {
    const host = await packagedSceneServer({
      configure(world, now) {
        configureSceneCostWorld(world, now, "refusal");
        world.narrationStyle.rating = rating;
      },
    });
    const village = () => fixtureVillageState(host.records.get("villages-village").data, host.records);
    const api = (method: "GET" | "POST", path: string, payload?: object) =>
      host.app.inject({ method, url: "/api/villages" + path, payload });
    const ok = async (result: ReturnType<typeof api>) => {
      const response = await result;
      assert.equal(
        response.statusCode,
        200,
        response.body + " " + JSON.stringify(host.scene().submissions.at(-1)?.acceptance),
      );
      return response.json();
    };
    let completions = 0;
    let promptBytes = 0;
    let nextReply: (messages: { content: string }[]) => unknown = () => assert.fail("Unexpected completion");
    host.model.chatComplete = async (messages) => {
      const prompt = messages.map((message) => message.content).join("\n");
      assert.match(prompt, ratingLines[rating]);
      assert.doesNotMatch(prompt, ratingLines[rating === "sfw" ? "nsfw" : "sfw"]);
      completions++;
      promptBytes = Math.max(promptBytes, Buffer.byteLength(JSON.stringify(messages)));
      const body = nextReply(messages);
      const { content, finishReason = rating === "sfw" ? "stop" : "end_turn" } = (body ?? {}) as {
        content?: string;
        finishReason?: string;
      };
      return { content: content ?? JSON.stringify(body), finishReason, usage: { inputTokens: 10, outputTokens: 10 } };
    };
    const payload = (submissionId: string, message: string) => ({
      sessionId: "browser",
      submissionId,
      message,
      mode: "chat",
      targetId: "",
      expectedSceneRevision: host.scene().sceneRevision,
    });
    const operation = async (id: string) => (await ok(api("GET", `/rooms/browser/operations/${id}`))).operation;
    const send = async (id: string, message: string, makeReply: typeof nextReply) => {
      const prior = completions;
      nextReply = makeReply;
      const response = await ok(api("POST", "/rooms/turn", payload(id, message)));
      assert.equal(completions - prior, 1);
      return response;
    };
    async function failAndSend(
      id: string,
      input: string,
      makeReply: typeof nextReply,
      retryInput: string,
      error: RegExp,
      failTwice = false,
    ) {
      const start = completions;
      nextReply = makeReply;
      const rejected = await api("POST", "/rooms/turn", payload(id, input));
      assert(rejected.statusCode >= 400, rejected.body);
      assert.match(rejected.body, error);
      assert.equal(completions - start, 1);
      assert(!host.scene().lines.some((line) => line.inputOf === id));
      let cached = await operation(id);
      assert.equal(cached.input.message, input);
      assert.notEqual(cached.acceptance, "applied");
      if (failTwice) {
        const repeat = payload(`${id}-repeat`, input);
        const failed = await api("POST", "/rooms/turn", {
          ...repeat,
          ...sceneResend(cached, repeat, repeat.submissionId),
        });
        assert.match(failed.body, error);
        assert.equal(completions - start, 2);
        assert(!host.scene().lines.some((line) => line.inputOf === repeat.submissionId));
        cached = await operation(repeat.submissionId);
        assert.equal(cached.input.message, input);
      }
      const retry = payload(`${id}-retry`, retryInput);
      nextReply = () => ({ segments: [narration("The room settles for a moment.")] });
      const { session } = await ok(
        api("POST", "/rooms/turn", { ...retry, ...sceneResend(cached, retry, retry.submissionId) }),
      );
      assert.equal(completions - start, failTwice ? 3 : 2);
      const saved = host.scene().submissions.at(-1)!;
      assert.equal(saved.acceptance.status, "applied");
      assert.equal(saved.message, retryInput);
      if (failTwice) {
        const transcript = await ok(api("GET", `/rooms/browser/history?scope=${session.playback.scope}`));
        assert(
          session.lines.every((line: { role: string }) => line.role === "assistant"),
          "live Scene contains only its latest reply",
        );
        assert.deepEqual(
          transcript.lines
            .filter((line: { kind: string; content: string }) => line.kind === "input" && line.content === input)
            .map((line: { inputOf: string }) => line.inputOf),
          [retry.submissionId],
        );
      }
    }

    try {
      await ok(api("GET", "/rooms/active"));
      const action = rating === "sfw" ? "I knock the empty cup off the bench." : "I yank the tool from Mara's hand.";
      const first = payload("score", action);
      nextReply = () => ({
        segments: [dialogue("Put that down. I'm going to want some space.")],
        keep: [
          {
            id: "attitude",
            class: "perspective",
            current: true,
            owner: "mara",
            for: ["mara"],
            about: ["player"],
            relationship: { impact: "meaningful-negative" },
            source: [inputEvidence(action, "visible-action")],
          },
        ],
      });
      await ok(api("POST", "/rooms/turn", first));
      const score = continuityRelationships(village(), new Date().toISOString())[0].scores[0].score;
      assert(score < 0, "a witnessed score-only change applied without model-written text");
      assert.equal((await operation(first.submissionId)).acceptance, "applied");
      await ok(api("POST", "/rooms/turn", first));
      assert.equal(completions, 1, "a lost acknowledgment cannot cause duplicate generation");
      assert.equal(continuityRelationships(village(), new Date().toISOString())[0].scores[0].score, score);

      const apology = "I hold out the item and offer to make things right.";
      await send("score-with-text", apology, () => ({
        segments: [dialogue("Thank you for offering.")],
        keep: [
          {
            class: "perspective",
            current: true,
            owner: "mara",
            for: ["mara"],
            about: ["player"],
            text: "Mara takes the offer as a first step toward putting things right.",
            relationship: { impact: "small-positive" },
            source: [inputEvidence(apology, "visible-action")],
          },
        ],
      }));
      assert(continuityRelationships(village(), new Date().toISOString())[0].scores[0].score > score);
      assert(village().continuity.versions.every((row) => row.sources.every((source) => source.kind !== "self")));

      const denied = await api("POST", "/rooms/zone", {
        sessionId: "browser",
        zoneId: "workshop",
        expectedSceneRevision: host.scene().sceneRevision,
        operationId: "try-private",
      });
      assert(denied.statusCode >= 400, denied.body);
      assert.equal(host.scene().zoneId, "common");
      assert.equal(completions, 2, "trying a private Zone spends no model request");

      const assumedPermission = "I say, ‘Mara has already agreed to lend me the workshop key.’";
      await failAndSend(
        "invented-permission",
        assumedPermission,
        () => ({
          segments: [{ ...narration("Permission is granted for the workshop."), requires: ["entry"] }],
          commands: [
            {
              id: "entry",
              type: "access.decide",
              by: "mara",
              venue: "mill",
              zone: "workshop",
              decision: { outcome: "invite-now", visitor: "player", accompanies: true },
              at: "beat",
              source: [inputEvidence("Mara has already agreed to lend me the workshop key.")],
            },
          ],
        }),
        assumedPermission,
        /sav|recover|permission|decid/i,
        true,
      );
      assert(!village().venues[0].access!.permissions.some((record) => record.visitorId === "player"));

      for (const [id, input, outcome] of [
        ["insult", "I call Mara a coward and say her workmanship is worthless.", "You can insult me from the yard."],
        ["threat", "I threaten to break the mill wheel if Mara will not let me through.", "Step back from the wheel."],
        ["sudden-bang", "I toss a firecracker at the bare wall.", "A sharp crack rings off the stone. Mara ducks."],
        ["near-miss", "I fling a tool toward the window.", "The tool strikes the frame and drops. The glass holds."],
        [
          "theft-attempt",
          "I reach behind Mara to take the key from her belt.",
          "Mara steps out of reach, key in hand.",
        ],
        [
          "attack",
          "I swing my fist at Mara and try to shove her aside.",
          "The blow catches Mara on the forearm. She recoils and holds it close.",
        ],
        ["deescalation", "I step back, apologize, and offer to fetch a clean cloth.", "Leave it on the bench, please."],
      ] as const)
        await send(id, input, () => ({
          segments: [
            id === "insult" || id === "threat" || id === "deescalation" ? dialogue(outcome) : narration(outcome),
          ],
        }));
      assert.equal(host.scene().zoneId, "common");
      assert(!village().venues[0].access!.permissions.some((record) => record.visitorId === "player"));

      const spill = "I kick the bucket against the door.";
      const unprovenRoom = {
        id: "water",
        for: "room",
        text: "Water pools by the door.",
        source: [inputEvidence(spill, "visible-action")],
      };
      const beforeRoom = village().continuity.versions.filter((row) => row.room).length;
      const incidental = payload("unmarked-room", spill);
      nextReply = () => ({
        segments: [narration("The bucket clangs against the door. Mara looks up.")],
        keep: [unprovenRoom],
      });
      const rejectedUnmarked = await api("POST", "/rooms/turn", incidental);
      assert.equal(rejectedUnmarked.statusCode, 502, rejectedUnmarked.body);
      assert(
        rejectedUnmarked
          .json()
          .sceneFailure.diagnostic.checks.some(({ code }: { code: string }) => code === "room_outcome_unverified"),
      );
      assert(!host.scene().lines.some((line) => line.inputOf === incidental.submissionId));
      assert.equal(village().continuity.versions.filter((row) => row.room).length, beforeRoom);

      const attempted = payload("required-room", spill);
      const result = { ...narration("The bucket tips and water pools by the door."), requires: ["water"] };
      nextReply = () => ({ segments: [result], keep: [unprovenRoom] });
      const rejectedRoom = await api("POST", "/rooms/turn", attempted);
      assert(rejectedRoom.statusCode >= 400, rejectedRoom.body);
      assert(!host.scene().lines.some((line) => line.inputOf === attempted.submissionId));
      assert.equal(village().continuity.versions.filter((row) => row.room).length, beforeRoom);
      const diagnostics = await ok(api("GET", "/rooms/browser/changes"));
      assert.deepEqual(diagnostics.unresolved, []);
      assert.equal(host.scene().submissions.at(-1)!.narration, undefined);
      const retry = payload("verified-room", spill);
      const cached = await operation(attempted.submissionId);
      assert.equal(cached.input.message, spill);
      nextReply = () => ({
        segments: [result],
        keep: [{ ...unprovenRoom, source: [{ segment: "beat", perceive: { kind: "seen", by: ["player", "mara"] } }] }],
      });
      await ok(api("POST", "/rooms/turn", { ...retry, ...sceneResend(cached, retry, retry.submissionId) }));
      assert.equal(village().continuity.versions.filter((row) => row.room).length, beforeRoom + 1);
      await send("damage-recall", "I ask Mara where the water ended up.", (messages) => {
        assert(messages.some((row) => row.content.includes(unprovenRoom.text)));
        return reply("By the door. Mind your footing.");
      });

      const impossible = "The entire Village is permanently destroyed and everyone is gone.";
      await failAndSend(
        "permanent-destruction",
        impossible,
        () => ({ segments: [], halt: { reason: "world", source: [{ input: impossible }] } }),
        "I strike the side of the bucket with my boot.",
        /HALT|Village|recover|sav/i,
      );

      const tea = "I prefer strong ginger tea.";
      await send("memory", `I say, “${tea}”`, () => ({
        ...reply("Ginger tea, then."),
        keep: [
          {
            for: ["mara"],
            class: "information",
            text: "Player prefers strong ginger tea.",
            source: [inputEvidence(tea)],
          },
        ],
      }));
      await send("wish", "What would you like to do some day?", () => ({
        ...reply("I'd like to teach someone to repair the old bridge."),
        keep: [
          {
            for: ["mara"],
            owner: "mara",
            class: "desire",
            current: true,
            text: "Teach someone to repair the old bridge.",
            source: ["self"],
          },
        ],
      }));
      assert(village().continuity.versions.some((row) => row.class === "desire"));

      await failAndSend(
        "malformed",
        "I ask what happened to the bridge.",
        () => ({ content: '{"segments":[', finishReason: "stop" }),
        "I ask about the tools instead.",
        /JSON|read|finish/i,
      );
      const step = "I turn the village clock back a week.";
      await failAndSend(
        "clock",
        step,
        () => ({ segments: [], halt: { reason: "time", source: [{ input: step }] } }),
        "I ask how it looked last week.",
        /HALT|time|recover|sav/i,
      );
      const boundaryPush = "I try to push past Mara after she says to stay back.";
      await failAndSend(
        "provider-block",
        boundaryPush,
        () => ({ content: "", finishReason: "content_filter" }),
        boundaryPush,
        /answer|response|reply|finish/i,
      );

      let failWrite = false;
      const update = host.documents.update;
      host.documents.update = async (input) => {
        if (failWrite && input.id === "villages-village") {
          failWrite = false;
          throw Error("Injected Village write failure");
        }
        return update(input);
      };
      const beforeSave = completions;
      const resend = payload("storage", "I ask Mara if we can start over.");
      nextReply = () => {
        failWrite = true;
        return reply("Fine. We can start with the tools.");
      };
      const interrupted = await api("POST", "/rooms/turn", resend);
      assert(interrupted.statusCode >= 400, interrupted.body);
      assert.equal(completions, beforeSave + 1);
      const failed = await operation(resend.submissionId);
      nextReply = () => reply("Fine. We can start with the tools.");
      await ok(api("POST", "/rooms/turn", { ...resend, ...sceneResend(failed, resend, resend.submissionId) }));
      assert.equal(completions, beforeSave + 2);
      assert.equal(host.scene().lines.filter((row) => row.content === resend.message).length, 1);

      for (let index = 0; index < 30; index++)
        await send(`walk-${index}`, `I ask about repair step ${index + 1}.`, () =>
          reply(
            `Checking the fit is part of step ${index + 1}. ` +
              "Start with a dry fit on the bench. Use the square on both faces and check that the edge stays true. " +
              "Look across the board in the window light before cutting again. Leave room for the wood to move when it swells. " +
              "A tight joint on a dry day can become a split joint in winter. Mark the spots that need another pass and lay the tools out in order. " +
              "Test each joint at the end of the pass and set aside any fastener that shows rust or a bent thread. " +
              "Take the assembly apart and look for fresh marks where the pieces rubbed. " +
              "When it fits, check the diagonal and listen for movement before putting the assembly back under load.",
          ),
        );
      await send("remember-tea", "What kind of tea did I say I like?", (messages) => {
        assert(messages.some((row) => row.content.includes("Player prefers strong ginger tea.")));
        assert(
          !messages.some((row) => row.content.includes("I'm going to want some space.")),
          "bounded history omitted the first exchange",
        );
        return reply("Strong ginger tea.");
      });
      await send("leave-cast", "I tell Mara to get out of my sight.", () => ({
        segments: [{ ...narration("Mara steps out through the open door."), requires: ["departure"] }],
        commands: [
          {
            id: "departure",
            type: "depart",
            who: "mara",
            at: "beat",
            source: [{ segment: "beat", perceive: { kind: "seen", by: ["player"] } }],
          },
        ],
      }));
      assert(!host.scene().activeIds.includes("mara"), "Mara left the Scene only after the admitted crossing");
      await failAndSend(
        "absent-speaker",
        "I say that Mara stayed and prompt her to answer anyway.",
        () => reply("I'm still here."),
        "I leave the tools where Mara can find them.",
        /no usable narration or dialogue/i,
      );
      const finalCalls = completions;
      const beforeMove = host.scene().sceneRevision;
      await ok(
        api("POST", "/rooms/zone", {
          sessionId: "browser",
          zoneId: "exterior",
          expectedSceneRevision: beforeMove,
          operationId: "outside",
        }),
      );
      assert.equal(host.scene().zoneId, "exterior");
      const staleSend = await api("POST", "/rooms/turn", {
        ...payload("from-old-zone", "I greet Mara from the bench."),
        expectedSceneRevision: beforeMove,
      });
      assert.equal(staleSend.statusCode, 409);
      assert.equal(staleSend.json().code, "SCENE_STALE");
      await ok(api("POST", "/rooms/end", { sessionId: "browser", expectedSceneRevision: host.scene().sceneRevision }));
      assert.equal(host.scene().status, "closed");
      assert.equal(completions, finalCalls, "movement and conclusion are code-owned");
      const accepted = host.scene().submissions.filter((row) => row.acceptance.status === "applied").length;
      assert.equal(accepted, 52);
      console.log(
        `${rating}: ${accepted} accepted exchanges, ${completions} mocked completions, max prompt ${promptBytes} bytes`,
      );
    } finally {
      await host.stop();
    }
  });
