import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import { configuredEmbeddingModel } from "../../../shared/helpers/embedding-connections.js";
import type { VillageEmbeddingChoice } from "../../../shared/contracts/village.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { villageEngineJson } from "./engine-transport.js";

const BUILTIN_EMBEDDING_CONNECTION = "__builtin_embedding__";

export function villageEmbeddingHost(
  runtime: Pick<CapabilityRuntimeHost, "embeddingsFor">,
  engine = villageEngineJson,
) {
  async function localModel(signal: AbortSignal) {
    const status = asRecord(await engine<unknown>("/api/builtin-embedding/status", { signal }));
    if (status.supported !== true) return null;
    if (!status.activeModelId && status.download) return "preparing" as const;
    if (status.runtimeInstalled !== true) return null;
    const models = Array.isArray(status.models) ? status.models.map(asRecord) : [];
    const model = models.find((row) => row.id === status.activeModelId);
    if (!model || typeof model.id !== "string" || typeof model.sha256 !== "string") return null;
    const { dimensions } = model;
    if (
      typeof dimensions !== "number" ||
      !Number.isInteger(dimensions) ||
      dimensions <= 0 ||
      dimensions > 4096 ||
      // Raw responses identify the model only by vector length, even if selection changes twice during a call.
      models.some((other) => other !== model && other.dimensions === dimensions)
    )
      return null;
    return {
      spaceId: `builtin-embedding:document-v1:${model.id}:${model.sha256}`,
      label: asTrimmedString(model.label) ?? model.id,
      dimensions,
    };
  }

  return async (choice: Exclude<VillageEmbeddingChoice, "off">, signal: AbortSignal) => {
    if (choice === "local") {
      const model = await localModel(signal);
      if (model === "preparing") return model;
      if (!model) return null;
      return {
        spaceId: model.spaceId,
        label: model.label,
        // Engine's raw route formats both inputs as documents and selects its current built-in model.
        async embed(texts: string[], requestSignal?: AbortSignal) {
          const activeSignal = requestSignal ?? signal;
          const result = asRecord(
            await engine<unknown>("/api/generate/raw/embeddings", {
              method: "POST",
              body: { connectionId: BUILTIN_EMBEDDING_CONNECTION, input: texts },
              signal: activeSignal,
            }),
          );
          const data = Array.isArray(result.data) ? result.data.map(asRecord) : [];
          if (
            data.length !== texts.length ||
            !data.every(
              (row, index) =>
                row.index === index && Array.isArray(row.embedding) && row.embedding.length === model.dimensions,
            )
          )
            return null;
          // The response carries no model identity. Discard results when Engine changed the selected model.
          const current = await localModel(activeSignal);
          return current && current !== "preparing" && current.spaceId === model.spaceId
            ? data.map((row) => row.embedding as number[])
            : null;
        },
      };
    }

    if (!runtime.embeddingsFor) return null;
    const id = choice.slice("connection:".length);
    // A removed delegated connection must not make Engine resolve the parent’s endpoint instead.
    const result = await engine<unknown>("/api/connections", { signal });
    const rows = Array.isArray(result)
      ? result.map((value) => {
          const row = asRecord(value);
          return {
            id: asTrimmedString(row.id),
            embeddingConnectionId: asTrimmedString(row.embeddingConnectionId),
            embeddingModel: asTrimmedString(row.embeddingModel),
            needsReview: row.profileImportReviewRequired === true || row.profileImportReviewRequired === "true",
          };
        })
      : [];
    const connection = rows.find((row) => row.id === id);
    if (!connection || !configuredEmbeddingModel(rows, connection)) return null;
    if (signal.aborted) return null;
    return runtime.embeddingsFor(id);
  };
}
