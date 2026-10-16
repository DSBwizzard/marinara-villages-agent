import { execFileSync } from "node:child_process";
import { readFile, lstat } from "node:fs/promises";
import { createHash } from "node:crypto";
import { join } from "node:path";

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
export async function validationInputs(root = process.cwd()) {
  const paths = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    cwd: root,
    encoding: "utf8",
  })
    .split("\0")
    .filter(
      (path) =>
        /^(packages\/|sources\/|scripts\/|tests\/|\.github\/workflows\/|\.prettier|\.npmrc$|\.gitattributes$|package(?:-lock)?\.json$|tsconfig\.|eslint\.|engine-boundary\.json$)/.test(
          path,
        ) &&
        !/\.(?:md|txt)$/.test(path) &&
        !/^packages\/villages\/(?:client\.js|server\.mjs|manifest\.json|agents\.json|locales\/en\.json)$/.test(path),
    );
  const inputs = await Promise.all(
    [...new Set(paths)].sort().map(async (path) => {
      try {
        if ((await lstat(join(root, path))).isSymbolicLink())
          throw Error("Validation source must not be a link: " + path);
        let bytes = await readFile(join(root, path));
        if (/\.(?:[cm]?js|tsx?|json|css|svg|ya?ml|toml)$/.test(path))
          bytes = Buffer.from(bytes.toString("utf8").replaceAll("\r\n", "\n"));
        return { path, sha256: hash(bytes) };
      } catch (error) {
        if (error.code === "ENOENT") return { path, sha256: "deleted" };
        throw error;
      }
    }),
  );
  return { digest: hash(JSON.stringify(inputs)), inputs };
}
