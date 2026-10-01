// Use Marinara Engine connections, generation, cleanup, and sprite storage.
import { createHash } from "node:crypto";
import { villageEngineJson, villageEngineBaseUrl } from "./engine-loopback.js";
import { asRecord, asString } from "./coerce.js";
import { badRequest, VillagesRequestError } from "./errors.js";

export const studioDigest = (value: string | Uint8Array) => createHash("sha256").update(value).digest("hex");
const enabled = (value: unknown) => value === true || value === "true";
export async function studioEngineJson<T = unknown>(
  path: string,
  options?: Parameters<typeof villageEngineJson>[1],
): Promise<T> {
  try {
    return await villageEngineJson<T>(path, options);
  } catch (error) {
    // Provider error text can echo authorization data. Never persist or log it in Studio.
    const status = error instanceof Error ? error.message.match(/\((\d{3})\)/)?.[1] : undefined;
    throw new VillagesRequestError(
      502,
      "Engine Studio request failed" +
        (status ? " (" + status + ")" : "") +
        ". Inspect the selected Engine connection. Its outcome may be unknown.",
    );
  }
}
// Connection settings are Engine-owned. Studio reads only non-secret generation metadata.
function displaySettings(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(displaySettings);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !/api.?key|authorization|password|secret|credential|token/i.test(key))
      .map(([key, child]) => [key, displaySettings(child)]),
  );
}
function displayHost(value: unknown) {
  try {
    const url = new URL(asString(value));
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}
export async function studioConnections() {
  const answer = await studioEngineJson<unknown>("/api/connections");
  return (Array.isArray(answer) ? answer : [])
    .map(asRecord)
    .filter((r) => !enabled(r.profileImportReviewRequired))
    .map((r) => {
      let defaults: Record<string, unknown> = {};
      try {
        defaults = asRecord(
          typeof r.defaultParameters === "string" ? JSON.parse(r.defaultParameters) : r.defaultParameters,
        );
      } catch {
        /* Engine validates its own settings. */
      }
      return {
        id: asString(r.id),
        name: asString(r.name),
        model: asString(r.model),
        provider: asString(r.provider),
        source: asString(r.imageService || r.imageGenerationSource || r.model),
        host: displayHost(r.baseUrl),
        quality: asString(r.imageGenerationQuality) || "auto",
        configurationFingerprint: studioDigest(
          JSON.stringify([
            r.imagePath,
            r.imageEndpointId,
            r.imagePromptInstructions,
            r.comfyuiWorkflow,
            r.openrouterProvider,
            r.treatAsLocalEndpoint,
            r.imageService,
            r.imageGenerationSource,
            r.baseUrl,
            defaults,
          ]),
        ),
        defaults: asRecord(displaySettings(defaults)),
      };
    });
}
export async function studioConnection(id: string) {
  const conn = (await studioConnections()).find((r) => r.id === id && r.provider === "image_generation");
  if (!conn) throw badRequest("The selected image connection is missing. Choose another in Advanced.");
  const { provider: _provider, ...settings } = conn;
  return settings;
}
export async function studioAsset(url: string): Promise<string> {
  if (!/^\/api\/sprites\/villages-[a-f0-9-]{36}\/file\/[a-z0-9_-]+\.(png|jpeg|jpg|webp)(\?[^#]*)?$/i.test(url))
    throw badRequest("Choose a captured Studio asset.");
  const response = await fetch(villageEngineBaseUrl() + url);
  if (!response.ok) throw badRequest("The saved Studio image could not be read.");
  if (Number(response.headers.get("content-length")) > 12000000) throw badRequest("Studio image is too large.");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 12000000) throw badRequest("Studio image is too large.");
  return `data:${response.headers.get("content-type")?.split(";")[0] || "image/png"};base64,${bytes.toString("base64")}`;
}
export async function studioCleanup(image: string, engine: "builtin" | "backgroundremover") {
  const result = asRecord(
    await studioEngineJson("/api/sprites/cleanup", {
      body: { cells: [{ expression: "cutout", base64: image }], engine },
    }),
  );
  const cell = asRecord((Array.isArray(result.cells) ? result.cells : [])[0]);
  if (!asString(cell.base64)) throw badRequest("Engine cleanup returned no cutout.");
  return `data:image/png;base64,${cell.base64}`;
}
export async function studioCleanupCapabilities() {
  try {
    const answer = asRecord(await studioEngineJson("/api/sprites/capabilities"));
    return {
      builtin: answer.backgroundRemovalAvailable === true,
      backgroundremover: asRecord(answer.backgroundRemover).installed === true,
    };
  } catch {
    return { builtin: false, backgroundremover: false };
  }
}
