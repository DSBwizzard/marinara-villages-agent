import type { VenueScene, VenueReplyLine } from "../models/scene-model.js";
import { asRecord } from "./coerce.js";
import { badGateway, conflict } from "./errors.js";

export type SemanticPlayerMove = { zoneId: string; segment: number };

/** Conversational generation cannot authorize player Zone travel, including saved replies. */
export function semanticPlayerMoves(
  value: unknown,
  scene: VenueScene,
  _lines: readonly VenueReplyLine[],
): SemanticPlayerMove[] {
  const intent = scene.semanticIntent;
  if (
    (intent?.movement && intent.movement.zoneId !== scene.zoneId) ||
    intent?.timeline.some((step) => step.kind === "movement" && step.zoneId && step.zoneId !== scene.zoneId)
  )
    throw conflict("Use Move to change Zones.");
  const rows = value === undefined ? [] : value;
  if (!Array.isArray(rows) || rows.length > 8)
    throw badGateway("System player movement metadata is invalid. The draft is preserved.");
  for (const value of rows) {
    const row = asRecord(value);
    if (row.zoneId !== scene.zoneId || !Number.isInteger(row.segment))
      throw badGateway("System invented player Zone travel. The draft is preserved.");
  }
  // Older models may nominate a local step as movement. It never changes access or witnesses.
  return [];
}

export function semanticPhysicalContext(value: unknown, lines: readonly VenueReplyLine[], scene: VenueScene) {
  const segment = asRecord(value).segment;
  const line = Number.isInteger(segment) ? lines[Number(segment)] : undefined;
  if (!line || line.kind !== "narration")
    throw badGateway("System physical outcome needs an exact current narration source.");
  return { zoneId: line.zoneId ?? scene.zoneId ?? "exterior", witnessIds: [...line.heardBy], segment: Number(segment) };
}
