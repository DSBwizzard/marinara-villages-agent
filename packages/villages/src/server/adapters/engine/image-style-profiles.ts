import { readFile, realpath } from "node:fs/promises";
import { dirname, join, resolve, relative } from "node:path";
import { pathToFileURL } from "node:url";
export const PUBLIC_ENGINE_MODULES = ["@marinara-engine/shared"] as const;
export interface EngineStyleProfiles {
  defaultProfileId: string;
  profiles: { id: string; name: string; [key: string]: unknown }[];
}
export interface EngineImageStyleSupport {
  normalizeImageStyleProfileSettings(raw: unknown): EngineStyleProfiles;
  compileImagePrompt(input: {
    kind: "background";
    prompt: string;
    styleProfiles: EngineStyleProfiles;
    styleProfileId?: string;
    hardNegative: string;
    omitProfileSubjectTags: boolean;
  }): { prompt: string; negativePrompt: string };
}
/** Resolve the running Engine's public package export, not private implementation files. */
export async function loadEngineImageStyleSupport(
  serverEntry = process.argv[1] ?? "",
): Promise<EngineImageStyleSupport> {
  const entry = await realpath(serverEntry);
  const serverRoot = dirname(dirname(entry));
  const server = JSON.parse(await readFile(join(serverRoot, "package.json"), "utf8"));
  if (server.name !== "@marinara-engine/server")
    throw new Error("Engine image styles are unavailable in this runtime.");
  const sharedRoot = await realpath(join(dirname(serverRoot), "shared"));
  const manifest = JSON.parse(await readFile(join(sharedRoot, "package.json"), "utf8"));
  const exported = manifest.exports?.["."]?.import;
  if (
    manifest.name !== PUBLIC_ENGINE_MODULES[0] ||
    manifest.type !== "module" ||
    typeof exported !== "string" ||
    !exported.startsWith("./")
  )
    throw new Error("Engine does not expose its image style support.");
  const target = await realpath(resolve(sharedRoot, exported));
  if (relative(sharedRoot, target).startsWith("..")) throw new Error("Engine shared export leaves its package.");
  const support = await import(pathToFileURL(target).href);
  if (
    typeof support.normalizeImageStyleProfileSettings !== "function" ||
    typeof support.compileImagePrompt !== "function"
  )
    throw new Error("This Engine does not support image style profiles. Use a custom description or update Engine.");
  return support;
}
