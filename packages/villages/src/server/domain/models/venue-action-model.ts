export type ProjectSupplyTransfer = {
  projectId: string;
  revision: number;
  requirementId: string;
  sourceId: string;
  supplierId: string;
};
export type VenueActionResult = {
  projectSupplyTransfer?: ProjectSupplyTransfer;
  happened: boolean;
  narration: string;
  addItem?: string;
  removeItem?: string;
  traceKind?: string;
  traceText?: string;
  recipientId?: string;
  transferTo?: string;
  resolveTraceId?: string;
  conditionBefore?: string;
  conditionAfter?: string;
  featureId?: string;
  featureText?: string;
  publicFactBefore?: string;
  publicFactAfter?: string;
  sceneNote?: string;
};
