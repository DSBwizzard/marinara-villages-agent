import type { CapabilityRuntimeHost } from "@marinara-engine/shared";
import { configuredEmbeddingModel } from "../../../shared/helpers/embedding-connections.js";
import { asRecord, asTrimmedString } from "../../domain/rules/coerce.js";
import { villageEngineJson } from "./engine-transport.js";

export function villageEmbeddingHost(runtime: CapabilityRuntimeHost) {
  if (!("embeddingsFor" in runtime) || !runtime.embeddingsFor) return;
  return async (id: string | null, signal: AbortSignal) => {
    if (id !== null) {
      // A removed delegated connection must not make Engine resolve the parent’s endpoint instead.
      const result = await villageEngineJson<unknown>("/api/connections", { signal });
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
    }
    if (signal.aborted) return null;
    return runtime.embeddingsFor!(id);
  };
}
