// Live Engine APIs only. Credentials never cross this package boundary.
import { createHash, randomUUID } from "node:crypto";
import { villageEngineJson, villageEngineBaseUrl } from "./engine-loopback.js";
import { villagesDocuments, VILLAGES_PACKAGE_ID } from "./package-runtime.js";
import { mutateDocument } from "./village-store.js";
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
export function studioParameters(value: unknown): Record<string, unknown> {
  const record = typeof value === "string" ? JSON.parse(value || "{}") : (value ?? {});
  if (!record || typeof record !== "object" || Array.isArray(record))
    throw badRequest("Image parameters must be a JSON object.");
  if (JSON.stringify(record).length > 12000) throw badRequest("Image parameters are too large.");
  const check = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    for (const [key, child] of Object.entries(node)) {
      if (
        /api.?key|authorization|password|secret|token|credential/i.test(key) &&
        key !== "max_tokens" &&
        key !== "maxTokens"
      )
        throw badRequest("Do not place credentials in Studio parameters; keep them in Engine connections.");
      if (
        /^(model|messages|prompt|negative_?prompt|promptOverrides|input|images?|references?|contents|referenceImages?|reference_images?|image_url)$/i.test(
          key,
        )
      )
        throw badRequest("Studio parameters cannot replace the model, prompts, messages, or references.");
      check(child);
    }
  };
  check(record);
  return structuredClone(record);
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
        /* Invalid defaults fail at selected-connection resolution. */
      }
      return {
        id: asString(r.id),
        name: asString(r.name),
        model: asString(r.model),
        provider: asString(r.provider),
        source: asString(r.imageService || r.imageGenerationSource || r.model),
        host: asString(r.baseUrl),
        quality: asString(r.imageGenerationQuality) || "auto",
        configurationFingerprint: studioDigest(
          JSON.stringify(
            Object.fromEntries(
              [
                "imagePath",
                "imageEndpointId",
                "imagePromptInstructions",
                "comfyuiWorkflow",
                "openrouterProvider",
                "treatAsLocalEndpoint",
                "imageService",
                "imageGenerationSource",
              ].map((key) => [key, r[key] ?? null]),
            ),
          ),
        ),
        defaults,
        fallback: enabled(r.fallbackForAgents),
        mainFallback: enabled(r.fallbackForMain),
      };
    });
}
export async function studioConnection(id: string) {
  const rows = await studioConnections();
  const conn = rows.find((r) => r.id === id && r.provider === "image_generation");
  if (!conn) throw badRequest("The selected image connection is missing. Choose another in Sprite Studio.");
  if (rows.some((r) => r.provider === "image_generation" && r.fallback && r.id !== id))
    throw badRequest(
      "This image connection has a different automatic fallback in Marinara. Choose that fallback connection directly, or turn off image fallback before drawing in Sprite Studio.",
    );
  if (conn.host && new URL(conn.host).username)
    throw badRequest("Credentials in a connection URL are not supported by Studio.");
  studioParameters(conn.defaults.customParameters);
  studioParameters(asRecord(conn.defaults.imageGeneration).customParameters);
  if (conn.host) {
    const url = new URL(conn.host);
    if (url.password || [...url.searchParams.keys()].some((k) => /key|token|auth|secret/i.test(k)))
      throw badRequest("Keep credentials in Engine credential fields, not connection URLs.");
  }
  const { provider: _provider, fallback: _fallback, mainFallback: _mainFallback, ...safe } = conn;
  // Store only generation settings, never arbitrary connection metadata.
  const defaults = Object.fromEntries(
    Object.entries(safe.defaults).filter(
      ([key]) => key === "customParameters" || key === "imageGeneration" || key === "imageGenerationDefaults",
    ),
  );
  const rejectSecrets = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (/api.?key|authorization|password|secret|credential|access.?token/i.test(key))
        throw badRequest("Generation defaults contain credential fields; move them to Engine credential storage.");
      rejectSecrets(child);
    }
  };
  rejectSecrets(defaults);
  return { ...safe, defaults };
}
type Copies = {
  entries: Array<{
    fingerprint: string;
    sourceId: string;
    copyId?: string;
    status: "creating" | "ready" | "unknown";
    operation: string;
  }>;
};
const copySlot = {
  kind: "sprite-studio-connections",
  name: "Studio connection profiles",
  description: "Engine-owned connection IDs; no credentials.",
  label: () => "Studio connections",
  coerce: (raw: unknown): Copies => {
    const entries = asRecord(raw).entries;
    return {
      entries: (Array.isArray(entries) ? entries : [])
        .map(asRecord)
        .filter(
          (e) =>
            typeof e.fingerprint === "string" &&
            typeof e.sourceId === "string" &&
            ["creating", "ready", "unknown"].includes(asString(e.status)),
        )
        .map((e) => ({
          fingerprint: asString(e.fingerprint),
          sourceId: asString(e.sourceId),
          copyId: asString(e.copyId) || undefined,
          status: e.status as "creating" | "ready" | "unknown",
          operation: asString(e.operation),
        })),
    };
  },
};
let copyTail: Promise<unknown> = Promise.resolve();
export function studioIsolatedConnection(sourceId: string, custom: Record<string, unknown>) {
  const task = copyTail
    .catch(() => undefined)
    .then(async () => {
      const registry = copySlot.coerce(
        (await villagesDocuments().getById(VILLAGES_PACKAGE_ID, "sprite-studio-connections"))?.data,
      );
      sourceId = registry.entries.find((e) => e.copyId === sourceId)?.sourceId ?? sourceId;
      const source = await studioConnection(sourceId);
      const params = studioParameters(custom);
      if (!Object.keys(params).length) return source;
      const defaults = {
        ...source.defaults,
        customParameters: { ...asRecord(source.defaults.customParameters), ...params },
      };
      const fingerprint = studioDigest(JSON.stringify({ source, defaults }));
      const docId = "sprite-studio-connections";
      const state = copySlot.coerce((await villagesDocuments().getById(VILLAGES_PACKAGE_ID, docId))?.data);
      const prior = state.entries.find((e) => e.fingerprint === fingerprint);
      if (prior?.status === "ready" && prior.copyId) {
        const existing = await studioConnection(prior.copyId);
        if (
          JSON.stringify(existing.defaults) !== JSON.stringify(defaults) ||
          existing.model !== source.model ||
          existing.host !== source.host ||
          existing.configurationFingerprint !== source.configurationFingerprint
        )
          throw badRequest(
            "The Studio connection copy changed. Remove its profile mapping before setting up a replacement.",
          );
        return existing;
      }
      if (prior)
        throw badRequest(
          "Studio connection setup has an uncertain outcome. Inspect Engine connections before resetting this profile; no automatic duplicate was made.",
        );
      const operation = randomUUID();
      await mutateDocument(docId, copySlot, (next) =>
        next.entries.push({ fingerprint, sourceId, status: "creating", operation }),
      );
      try {
        const duplicated = asRecord(
          await studioEngineJson(`/api/connections/${encodeURIComponent(sourceId)}/duplicate`, { body: {} }),
        );
        const copyId = asString(duplicated.id);
        if (!copyId) throw new Error("Engine did not return a connection ID.");
        await mutateDocument(docId, copySlot, (next) => {
          next.entries.find((e) => e.operation === operation)!.copyId = copyId;
        });
        await studioEngineJson(`/api/connections/${encodeURIComponent(copyId)}`, {
          method: "PATCH",
          body: {
            name: `Sprite Studio · ${source.name} · ${fingerprint.slice(0, 8)}`,
            isDefault: false,
            defaultForAgents: false,
            fallbackForMain: false,
            fallbackForAgents: false,
            useForRandom: false,
          },
        });
        await studioEngineJson(`/api/connections/${encodeURIComponent(copyId)}/default-parameters`, {
          method: "PUT",
          body: defaults,
        });
        await mutateDocument(docId, copySlot, (next) => {
          next.entries.find((e) => e.operation === operation)!.status = "ready";
        });
        return studioConnection(copyId);
      } catch (error) {
        await mutateDocument(docId, copySlot, (next) => {
          next.entries.find((e) => e.operation === operation)!.status = "unknown";
        });
        throw error;
      }
    });
  copyTail = task;
  return task;
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

export function resetStudioConnectionProfile(sourceId: string) {
  const task = copyTail
    .catch(() => undefined)
    .then(() =>
      mutateDocument("sprite-studio-connections", copySlot, (next) => {
        next.entries = next.entries.filter((e) => e.sourceId !== sourceId && e.copyId !== sourceId);
      }),
    );
  copyTail = task;
  return task;
}
