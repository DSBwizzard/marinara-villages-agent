type EmbeddingConnection = {
  id: string;
  embeddingModel?: string;
  embeddingConnectionId?: string;
  needsReview: boolean;
};

export function configuredEmbeddingModel(rows: readonly EmbeddingConnection[], selected: EmbeddingConnection) {
  if (selected.needsReview) return;
  if (!selected.embeddingConnectionId) return selected.embeddingModel;
  if (selected.embeddingConnectionId === "__local_sidecar__") return "Local Model sidecar";
  const lender = rows.find((row) => row.id === selected.embeddingConnectionId);
  if (!lender || lender.needsReview) return;
  return lender.embeddingModel || selected.embeddingModel;
}
