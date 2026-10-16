export type VenueActionResult = {
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
