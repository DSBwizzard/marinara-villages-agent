import { mkdir, open, readFile, unlink, realpath } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

/** Serialize supported package builds and test runs, including an iteration's children. */
export async function acquireCheckoutOperation(root) {
  root = await realpath(root);
  await mkdir(join(root, ".build-tmp"), { recursive: true });
  const path = join(root, ".build-tmp/checkout-operation.lock");
  const inherited = process.env.VILLAGES_CHECKOUT_OPERATION;
  if (inherited) {
    const owner = JSON.parse(await readFile(path, "utf8"));
    if (owner.root !== root || owner.token !== inherited || !Number.isInteger(owner.pid) || owner.pid < 1)
      throw new Error("Invalid inherited checkout operation");
    process.kill(owner.pid, 0);
    return { token: inherited, release: async () => {} };
  }
  let handle;
  try {
    handle = await open(path, "wx", 0o600);
  } catch (error) {
    if (error.code === "EEXIST")
      throw new Error("Checkout build/test operation active or interrupted; inspect " + path, { cause: error });
    throw error;
  }
  const token = randomUUID();
  await handle.writeFile(JSON.stringify({ root, pid: process.pid, token, startedAt: new Date().toISOString() }));
  process.env.VILLAGES_CHECKOUT_OPERATION = token;
  return {
    token,
    async release() {
      const owner = JSON.parse(await readFile(path, "utf8"));
      if (owner.token !== token || owner.pid !== process.pid) throw new Error("Checkout lock ownership changed");
      await handle.close();
      await unlink(path);
      if (process.env.VILLAGES_CHECKOUT_OPERATION === token) delete process.env.VILLAGES_CHECKOUT_OPERATION;
    },
  };
}
