// Test cases: mailbox-pages/growth, mailbox-pages/navigation, mailbox-pages/privacy, mailbox-pages/identities, mailbox-pages/recovery
import assert from "node:assert/strict";
import { mock } from "node:test";
import { runCase } from "../scripts/test-cases.mjs";
import { defaultVillageState } from "../packages/villages/src/server/domain/decoding/village-codec.js";
import {
  createMailboxPresentation,
  readMailboxQuery,
  mailboxLetterIdentity,
  hasUnreadMail,
} from "../packages/villages/src/server/domain/rules/mailbox-view.js";
import type { MailboxMessage } from "../packages/villages/src/server/domain/models/social-mail.js";
import type { BackgroundSummary } from "../packages/villages/src/server/domain/models/background-model.js";

function fixture(count: number) {
  const village = {
    ...defaultVillageState(),
    seed: "mailbox-pages",
    setupAt: "2026-10-30T12:00:00.000Z",
    formerLetterFonts: { ada: "caveat" },
  };
  village.villagers = [
    { characterId: "ada", incarnation: "one", letterFontId: "caveat", cardSnapshot: { name: "Ada" } },
  ] as typeof village.villagers;
  const state = village.mailbox,
    jobs: BackgroundSummary[] = [];
  for (let i = 0; i < count; i++) {
    const id = "letter:" + String(i).padStart(6, "0");
    state.messages[id] = {
      id,
      requestId: id,
      from: { id: "ada", incarnation: "one" },
      to: { id: "player", incarnation: "player-one" },
      at: village.setupAt,
      text: "Exact café 🌼 evidence ".repeat(30) + i,
      status: "delivered",
      deliveredAt: village.setupAt,
      readAt: village.setupAt,
    };
  }
  return {
    village,
    state,
    jobs,
    first: () => Object.values(state.messages)[0],
    present: () => createMailboxPresentation(village, state, jobs),
  };
}

await runCase("mailbox-pages/growth", () => {
  const unread = fixture(1);
  assert.equal(hasUnreadMail(unread.state), false);
  unread.first().readAt = undefined;
  assert.equal(hasUnreadMail(unread.state), true);
  unread.first().status = "pending";
  assert.equal(hasUnreadMail(unread.state), false, "unpublished incoming mail has no notification");
  unread.first().status = "delivered";
  unread.first().to.id = "bea";
  assert.equal(hasUnreadMail(unread.state), false, "other residents' correspondence stays private");
  for (const count of [1000, 10_000, 25_000]) {
    const f = fixture(count),
      stringify = JSON.stringify;
    let jsonBytes = 0,
      textReads = 0;
    for (const message of Object.values(f.state.messages)) {
      const text = message.text;
      Object.defineProperty(message, "text", {
        enumerable: true,
        get() {
          textReads++;
          return text;
        },
      });
    }
    mock.method(JSON, "stringify", (...args: unknown[]) => {
      const output = Reflect.apply(stringify, JSON, args);
      if (typeof output === "string") jsonBytes += Buffer.byteLength(output);
      return output;
    });
    try {
      const page = f.present().mailbox({});
      assert.equal(page.letters.length, 50);
      assert.equal(page.total, count);
      assert(page.nextCursor);
      assert(page.letters.every((letter) => !Object.hasOwn(letter.message, "text")));
      assert(Buffer.byteLength(JSON.stringify(page)) < 96 * 1024);
    } finally {
      mock.restoreAll();
    }
    assert(jsonBytes < 256 * 1024, "summary construction must not serialize retained full correspondence");
    assert(textReads <= 100, "only selected-page previews and identities inspect text");
  }
});

await runCase("mailbox-pages/navigation", () => {
  const f = fixture(113),
    first = f.present().mailbox({});
  f.state.messages.newer = { ...f.first(), id: "newer", at: "2026-10-31T12:00:00.000Z" };
  const ids = first.letters.map((row) => row.message.id);
  let cursor = first.nextCursor;
  while (cursor) {
    const page = f.present().mailbox({ cursor });
    ids.push(...page.letters.map((row) => row.message.id));
    cursor = page.nextCursor;
  }
  assert.equal(ids.length, 113);
  assert.equal(new Set(ids).size, ids.length);
  assert(!ids.includes("newer"));
  assert.equal(f.present().mailbox({}).letters[0].message.id, "newer");
  assert.throws(() => f.present().mailbox({ folder: "sent", cursor: first.nextCursor }), /Mailbox changed/);
  assert.throws(() => f.present().mailbox({ cursor: "not+a+cursor" }), /valid Mailbox page/);
  f.village.setupAt = "another-world";
  assert.throws(() => f.present().mailbox({ cursor: first.nextCursor }), /Mailbox changed/);
  assert.throws(() => readMailboxQuery({ folder: "all" }));
});

await runCase("mailbox-pages/privacy", () => {
  const f = fixture(1),
    message = f.first();
  message.readAt = undefined;
  assert.equal(f.present().mailbox({}).letters[0].message.preview, "");
  assert.equal(
    f.present().letter("personal:ada", message.id).message.text,
    "",
    "GET cannot bypass a held native reading",
  );
  assert.equal(message.readAt, undefined);
  message.readAt = f.village.setupAt;
  assert.equal(f.present().letter("personal:ada", message.id).message.text, message.text);
  message.status = "pending";
  assert.equal(f.present().mailbox({}).letters.length, 0);
  assert.throws(() => f.present().letter("personal:ada", message.id), /unavailable/);
  const author = message.from;
  message.from = message.to;
  message.to = author;
  assert.equal(f.present().mailbox({ folder: "sent" }).letters.length, 1);
  assert.equal(
    f.present().letter("personal:ada", message.id).message.text,
    message.text,
    "exact Player-authored source stays visible",
  );
  message.from.id = "bea";
  assert.throws(() => f.present().letter("personal:ada", message.id), /unavailable/);
  assert.throws(() => f.present().letter("__proto__", message.id), /unavailable/);
});

await runCase("mailbox-pages/identities", () => {
  const f = fixture(1),
    message = f.first(),
    identity = () => mailboxLetterIdentity(f.village, f.state, "personal:ada", message);
  const original = identity();
  message.readAt = undefined;
  message.error = "An ordinary diagnostic";
  message.status = "pending";
  assert.equal(identity(), original, "mutable delivery/read diagnostics cannot change source identity");
  message.text += " Different restored content";
  assert.notEqual(identity(), original);
  const changed = identity();
  message.from.incarnation = "earlier";
  assert.notEqual(identity(), changed, "same-ID actors never replace the letter's actual author");
  message.status = "delivered";
  const thread = f.present().mailbox({}).letters[0].thread;
  assert.equal(thread.residentName, "Former resident");
  assert.equal(thread.former, true);
  f.village.villagers[0].cardSnapshot.name = "Replacement Ada";
  assert.equal(f.present().letter(thread.id, message.id).thread.residentName, "Former resident");
  f.village.villagers = [];
  delete (f.village.formerLetterFonts as Record<string, string>).ada;
  assert.throws(() => f.present().mailbox({}), /no writing-style assignment/);
});

await runCase("mailbox-pages/recovery", () => {
  const f = fixture(0);
  for (let i = 0; i < 105; i++) {
    const id = "held:" + String(i).padStart(3, "0"),
      message: MailboxMessage = {
        id,
        requestId: id,
        at: f.village.setupAt,
        from: { id: "player", incarnation: "player-one" },
        to: { id: "ada", incarnation: "one" },
        text: "Exact submitted source",
        status: "pending",
      };
    f.state.messages[id] = message;
    if (i % 2) message.admissionFailed = true;
    else
      f.jobs.push({
        id: "job:" + id,
        subjectId: id,
        kind: "personal-mail",
        status: "failed",
        error: "Private provider diagnostic sentinel",
        updatedAt: f.village.setupAt,
      } as BackgroundSummary);
  }
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const page = f.present().mailbox({ recoveryCursor: cursor });
    assert(page.recovery.length <= 50);
    assert.equal(page.recoveryTotal, 105);
    assert(Buffer.byteLength(JSON.stringify(page)) < 96 * 1024);
    assert(!JSON.stringify(page).includes("Private provider diagnostic sentinel"));
    ids.push(...page.recovery.map((row) => row.messageId));
    assert(page.recovery.every((row) => /^[a-f0-9]{64}$/.test(row.token)));
    cursor = page.recoveryNextCursor;
  } while (cursor);
  assert.equal(ids.length, 105);
  assert.equal(new Set(ids).size, 105);
  f.jobs.push({ id: "active", subjectId: "held:000", kind: "personal-mail", status: "running" } as BackgroundSummary);
  assert.equal(f.present().mailbox({}).recoveryTotal, 104, "an active owner takes precedence over prior failed work");
});
