import { clientImplementation } from "./client-source.js";
// Villages — proof that the tab's calls carry the Engine's admin secret.
//
// Every route this package serves sits behind the Engine's privileged gate, and
// the gate answers a call from any address but its own loopback one only when
// the request presents the admin secret the owner set on the server. The tab
// worked anyway on the machine the Engine runs on — loopback does not want a
// secret — which is why its silence went unnoticed until somebody opened the
// village from another machine and was refused with a message about a header it
// had never sent.
//
// The fix is two small functions and the two calls that use them, so both are
// read out of the client and run here rather than described. A function body is
// JavaScript here or it is not: the header builder annotates nothing inside
// itself, and TypeScript transpiles the refusal helper and its error class,
// so what runs is the code the package ships rather than a paraphrase of it. Neither needs a browser: the
// header builder is a function of `window.localStorage` and the refusal builder
// is a function of a payload and a status.
//
// The call sites are counted rather than trusted. A third `fetch` added later
// would quietly be the one that asks bare again, and a count is the only thing
// that can see that.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { transpileModule, ScriptTarget } from "typescript";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(resolve(repoRoot, "packages/villages/src/client/shared/api.tsx"), "utf8");

/* ── The one run of code that answers both questions ─────────────────────── */

const headersStart = source.indexOf("function villagesRequestHeaders(");
const hintStart = source.indexOf("const PRIVILEGED_ACCESS_HINT =");
const refusalStart = source.indexOf("function requestRefusal(");
const requestStart = source.indexOf("async function request<T>(");
const hostStart = source.indexOf("async function requestHost<T>(");
assert.ok(
  headersStart > 0 &&
    headersStart < hintStart &&
    hintStart < refusalStart &&
    refusalStart < requestStart &&
    requestStart < hostStart,
  "the header builder, the admin-secret hint, the refusal builder and both fetch helpers are still one run of code in the client",
);

/**
 * The statements between a function's own braces.
 *
 * Every caller slices a region that holds exactly one function, so the first
 * brace after the signature opens its body and the last brace before the end of
 * the region closes it.
 */
function bodyOf(start: number, end: number): string {
  const open = source.indexOf("{", start);
  const close = source.lastIndexOf("}", end);
  assert.ok(open > start && close > open, "a function body could not be read out of the client");
  return source.slice(open + 1, close);
}

/*
  The two values the helpers close over are read out of the source the same way,
  so nothing here restates a key or a sentence the client could change without
  this noticing.
*/
const storageKey = /const ADMIN_SECRET_STORAGE_KEY =\s*("(?:[^"\\]|\\.)*");/u.exec(source)?.[1];
assert.equal(
  storageKey,
  '"marinara_admin_secret"',
  "the tab must read the key the Engine's own client writes, or the paste in Settings → Advanced → Admin Access serves nothing",
);
const hintLiteral = /const PRIVILEGED_ACCESS_HINT =\s*("(?:[^"\\]|\\.)*");/u.exec(source)?.[1];
assert.ok(hintLiteral, "the tab must still say what to do about a secret it was refused for");
const hint = JSON.parse(hintLiteral) as string;

/*
  The sentence has to BE the Engine's, not a second wording of it. The vendored
  Engine client ships in this repo, so the comparison is made against the very
  constant the Engine's own panels read out, and a re-worded Engine fails here
  instead of quietly leaving the tab with stale advice.
*/
const engineSource = readFileSync(resolve(repoRoot, "sources/engine/packages/client/src/lib/api-client.ts"), "utf8");
const engineHintLiteral = /export const PRIVILEGED_ACCESS_HINT =\s*("(?:[^"\\]|\\.)*");/u.exec(engineSource)?.[1];
assert.ok(engineHintLiteral, "the Engine's own privileged-access hint must still be readable in the vendored client");
assert.equal(
  hint,
  JSON.parse(engineHintLiteral) as string,
  "the tab must say exactly what the Engine says, so the refusal reads the same wherever the player meets it",
);

const buildHeaders = new Function(
  "init",
  `const ADMIN_SECRET_STORAGE_KEY = ${storageKey};\n${bodyOf(headersStart, hintStart)}`,
) as (init?: RequestInit) => Headers;

const errorStart = source.indexOf("class VillageApiError");
assert.ok(errorStart > hintStart && errorStart < refusalStart);
// Run the actual class and helper; transpilation preserves structured refusal codes.
const refusalCode = transpileModule(
  `const PRIVILEGED_ACCESS_HINT = ${hintLiteral};\n${source.slice(errorStart, source.indexOf("\nfunction ", errorStart))}\n${source.slice(refusalStart, requestStart)}`,
  { compilerOptions: { target: ScriptTarget.ES2022 } },
).outputText;
const buildRefusal = new Function(`${refusalCode}\nreturn requestRefusal;`)() as (
  payload: unknown,
  status: number,
  fallback: string,
) => Error;

/** Run the builder with `window` standing in for this browser's own. */
function headersWith(windowValue: unknown, init?: RequestInit): Headers {
  const original = (globalThis as { window?: unknown }).window;
  if (windowValue === undefined) delete (globalThis as { window?: unknown }).window;
  else Object.defineProperty(globalThis, "window", { configurable: true, value: windowValue });
  try {
    return buildHeaders(init);
  } finally {
    if (original === undefined) delete (globalThis as { window?: unknown }).window;
    else Object.defineProperty(globalThis, "window", { configurable: true, value: original });
  }
}

const storageHolding = (value: string | null) => ({ localStorage: { getItem: () => value } });

/* ── The header ──────────────────────────────────────────────────────────── */

assert.equal(
  headersWith(storageHolding("  s3cret  ")).get("X-Admin-Secret"),
  "s3cret",
  "the value the owner pasted is sent trimmed, in the one header the gate reads",
);
assert.equal(
  headersWith(storageHolding(null)).has("X-Admin-Secret"),
  false,
  "a browser with nothing pasted asks without the header, exactly as it always did",
);
assert.equal(
  headersWith(storageHolding("   ")).has("X-Admin-Secret"),
  false,
  "a box holding only spaces is not a secret",
);
assert.equal(
  headersWith({
    localStorage: {
      getItem: () => {
        throw new Error("blocked");
      },
    },
  }).has("X-Admin-Secret"),
  false,
  "a browser that refuses storage still gets its call",
);
assert.equal(headersWith(undefined).has("X-Admin-Secret"), false, "and so does one with no window at all");

const post = headersWith(storageHolding("s3cret"), {
  method: "POST",
  headers: { "x-marinara-csrf": "1" },
  body: JSON.stringify({ village: "Ash" }),
});
assert.equal(post.get("X-Admin-Secret"), "s3cret", "the secret rides along with whatever else a call carries");
assert.equal(post.get("x-marinara-csrf"), "1", "and does not replace the CSRF header the host's own shim adds");
assert.equal(post.get("Content-Type"), "application/json", "a body the tab serialized itself is still labelled JSON");

assert.equal(
  headersWith(storageHolding(null), { method: "POST" }).has("Content-Type"),
  false,
  "a call with no body is not labelled",
);
assert.equal(
  headersWith(storageHolding(null), { body: new FormData() }).has("Content-Type"),
  false,
  "and a body that writes its own Content-Type keeps it",
);
assert.equal(
  headersWith(storageHolding(null), { body: "{}", headers: { "Content-Type": "text/plain" } }).get("Content-Type"),
  "text/plain",
  "an explicit Content-Type is not overwritten",
);

/* ── What the player is told, and what they are not ──────────────────────── */

assert.match(hint, /ADMIN_SECRET/u, "the hint must name the setting on the server the value has to match");
assert.match(hint, /Settings → Advanced → Admin Access/u, "and the box in this browser the matching value goes in");
assert.equal(
  buildRefusal({ error: "ADMIN_SECRET is required for privileged APIs" }, 403, "x").message,
  `${hint} (ADMIN_SECRET is required for privileged APIs)`,
  "a server with no secret is answered with the hint, and the gate's own words kept in brackets behind it",
);
assert.equal(
  buildRefusal({ error: "Invalid or missing X-Admin-Secret header" }, 403, "x").message,
  `${hint} (Invalid or missing X-Admin-Secret header)`,
  "and so is a browser that has pasted nothing, or the wrong thing — the half the player can act on",
);
assert.equal(
  buildRefusal(
    { error: "Non-loopback access requires authentication because no Basic Auth credentials are configured." },
    403,
    "x",
  ).message,
  "Non-loopback access requires authentication because no Basic Auth credentials are configured.",
  "a refusal about the Engine's front door is passed through: the village has nothing to add to it",
);
assert.equal(
  buildRefusal({ error: "Privileged API is loopback-only" }, 403, "x").message,
  "Privileged API is loopback-only",
  "a loopback-only refusal is not about the secret either",
);
assert.equal(buildRefusal({ error: "Unauthorized" }, 401, "x").message, "Unauthorized", "only 403 is the gate");
assert.equal(
  buildRefusal(null, 500, "The village replied 500.").message,
  "The village replied 500.",
  "a body that was not JSON falls back to the tab's own sentence",
);

assert.equal(
  buildRefusal({ error: "Bad Request", message: "Invalid Scene revision", code: "SCENE_STALE" }, 400, "x").message,
  "Invalid Scene revision",
);
assert.equal(
  (buildRefusal({ error: "Bad Request", message: "Invalid Scene revision", code: "SCENE_STALE" }, 400, "x") as any)
    .code,
  "SCENE_STALE",
);
assert.equal(buildRefusal({ error: "Package failure", message: " " }, 400, "x").message, "Package failure");
assert.equal(buildRefusal({ error: { message: "Unreadable" } }, 400, "HTTP 400").message, "HTTP 400");

/* ── Both call sites, and the third one that must not appear ─────────────── */

assert.equal(
  (source.match(/await fetch\(/gu) ?? []).length,
  2,
  "the tab makes two kinds of call — its own routes and the Engine's — and both of them go through the header builder",
);
assert.equal(
  (source.match(/headers: villagesRequestHeaders\(init\)/gu) ?? []).length,
  2,
  "and both of them build those headers in the one place",
);
assert.doesNotMatch(
  source,
  /headers: init\?\.body/u,
  "a literal per-call header set is how the tab went back to asking bare",
);
assert.doesNotMatch(
  source,
  /location\.protocol !== "https:"/u,
  "the secret must go out over plain http as well: a LAN address is http, and an https-only guard would make this fix a no-op there",
);

console.log("Villages remote access regression: admin secret header, refusal hint, call sites ok\n");
