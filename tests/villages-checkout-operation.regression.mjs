import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { acquireCheckoutOperation } from "../scripts/checkout-operation.mjs";
const inherited = process.env.VILLAGES_CHECKOUT_OPERATION;
delete process.env.VILLAGES_CHECKOUT_OPERATION;
const root = await mkdtemp(join(tmpdir(), "checkout-operation-"));
try {
  const owner = await acquireCheckoutOperation(root);
  const child = async (token) =>
    new Promise((resolve) => {
      const processChild = spawn(
        process.execPath,
        [
          "--input-type=module",
          "-e",
          `import {acquireCheckoutOperation} from ${JSON.stringify(new URL("../scripts/checkout-operation.mjs", import.meta.url).href)};const lock=await acquireCheckoutOperation(${JSON.stringify(root)});await lock.release();`,
        ],
        { env: { ...process.env, VILLAGES_CHECKOUT_OPERATION: token ?? "" }, windowsHide: true, stdio: "ignore" },
      );
      processChild.once("close", resolve);
    });
  assert.notEqual(await child(), 0, "unrelated process cannot overlap builds/tests");
  assert.equal(await child(owner.token), 0, "iteration children reuse their owner's lock");
  assert.notEqual(await child("forged"), 0);
  await owner.release();
  const path = join(root, ".build-tmp/checkout-operation.lock");
  await writeFile(path, "interrupted");
  await assert.rejects(acquireCheckoutOperation(root), /inspect/);
  assert.equal(await readFile(path, "utf8"), "interrupted");
} finally {
  if (inherited) process.env.VILLAGES_CHECKOUT_OPERATION = inherited;
  else delete process.env.VILLAGES_CHECKOUT_OPERATION;
  await rm(root, { recursive: true, force: true });
}
console.log(
  "Concurrent build/test rejection, nested ownership, forged token and interrupted-lock preservation passed.",
);
